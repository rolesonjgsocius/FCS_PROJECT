from odoo import http
from odoo.http import request
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)

class QuoteController(http.Controller):
    @http.route('/quote/request/<string:product_ids>', type='http', auth='public', website=True)
    def request_quote(self, product_ids, **kwargs):
        # Check if user is authenticated
        if not request.session.uid:
            _logger.info('Public user attempted to request a quote. Redirecting to login.')
            redirect_url = f"/web/login?redirect=/quote/request/{product_ids}"
            return request.redirect(redirect_url)
        # Split and validate product IDs
        try:
            product_id_list = [int(pid) for pid in product_ids.split(',') if pid.isdigit()]
            if not product_id_list:
                _logger.warning('No valid product IDs provided: %s', product_ids)
                return request.redirect('/success')
        except ValueError as e:
            _logger.error('Invalid product IDs format: %s, Error: %s', product_ids, str(e))
            return request.redirect('/success')

        # Fetch products (product.template) with proper access rights
        products = request.env['product.template'].sudo().search([('id', 'in', product_id_list)])
        if not products:
            _logger.warning('No valid products found for IDs: %s', product_id_list)
            return request.redirect('/success')

        _logger.info('Found products: %s', products.mapped('name'))

        # Prepare partner and email
        user_id = request.session.uid
        if user_id:
            user = request.env['res.users'].sudo().browse(user_id)
            if not user.exists():
                _logger.error('User ID %s not found', user_id)
                return request.render(
                    'FCS_PAY_OLD.quote_request_error',
                    {'error': 'Invalid user session. Please log in again.'}
                )
            if not user.partner_id:
                _logger.error('Authenticated user %s has no partner record', user.name)
                return request.render(
                    'FCS_PAY_OLD.quote_request_error',
                    {'error': 'User has no partner record.'}
                )
            partner_id = user.partner_id.id
            email_from = user.email or 'no-mail@example.com'
            _logger.info('Authenticated user: %s, Partner: %s, Email: %s', user.name, user.partner_id.name, email_from)
        else:
            try:
                public_partner = request.env.ref('base.public_partner')
                partner_id = public_partner.id
                email_from = kwargs.get('email_from', 'no-mail@example.com')
                partner_name = kwargs.get('name', 'Anonymous')
                _logger.info('Public user detected. Partner: %s, Email: %s, Name: %s', public_partner.name, email_from, partner_name)
            except ValueError:
                _logger.error('Public partner not found in the system')
                return request.render(
                    'FCS_PAY_OLD.quote_request_error',
                    {'error': 'Configuration error: Public partner not found.'}
                )

        # Create CRM opportunity
        product_names = ', '.join(products.mapped('name')) or 'Unknown Products'
        opportunity_vals = {
            'name': f"Quote request for {product_names}",
            'type': 'opportunity',
            'partner_id': partner_id,
            'email_from': email_from,
            'user_id': False,
            'team_id': False,
            'description': f"Quote request for products: {', '.join(f'{p.name} (ID: {p.id})' for p in products)}",
        }
        try:
            opportunity = request.env['crm.lead'].sudo().create(opportunity_vals)
            _logger.info('Created opportunity ID: %s', opportunity.id)
        except Exception as e:
            _logger.error('Error creating opportunity: %s', str(e))
            return request.render(
                'FCS_PAY_OLD.quote_request_error',
                {'error': 'Failed to create quote request. Please try again.'}
            )

        # Prepare sale order lines
        order_lines = []
        for product in products:
            if hasattr(product, 'is_combo_product') and product.is_combo_product:
                combo_items = request.env['product.combo.item'].sudo().search([
                    ('combo_id.product_id', '=', product.id)
                ])
                if not combo_items:
                    _logger.warning('No combo items found for product: %s', product.name)
                    continue
                for combo_item in combo_items:
                    if not combo_item.product_id or not combo_item.product_id.exists():
                        _logger.warning('Invalid or missing product for combo item: %s', combo_item.id)
                        continue
                    product_variant = combo_item.product_id
                    try:
                        order_lines.append((0, 0, {
                            'product_id': product_variant.id,
                            'product_uom_qty': 1,
                            'price_unit': product_variant.lst_price or 0.0,
                            'name': f"{product_variant.name} (Combo: {product.name})",
                            'product_uom': product_variant.uom_id.id,
                        }))
                    except Exception as e:
                        _logger.warning('Error preparing order line for combo product %s: %s', product_variant.id, str(e))
                        continue
            else:
                product_variant = request.env['product.product'].sudo().search([
                    ('product_tmpl_id', '=', product.id)
                ], limit=1)
                if not product_variant:
                    _logger.warning('No product variant found for product template: %s', product.name)
                    continue
                try:
                    order_lines.append((0, 0, {
                        'product_id': product_variant.id,
                        'product_uom_qty': 1,
                        'price_unit': product_variant.lst_price or 0.0,
                        'name': product_variant.name,
                        'product_uom': product_variant.uom_id.id,
                    }))
                except Exception as e:
                    _logger.warning('Error preparing order line for product %s: %s', product_variant.id, str(e))
                    continue

        if not order_lines:
            _logger.error('No valid order lines created for quotation')
            return request.render(
                'FCS_PAY_OLD.quote_request_error',
                {'error': 'No valid products found for quotation.'}
            )

        # Create Sale Order (Quotation)
        sale_order_vals = {
            'partner_id': partner_id,
            'state': 'draft',
            'origin': f"Website Quote Request for {product_names}",
            'order_line': order_lines,
            'opportunity_id': opportunity.id,
            'company_id': request.env.company.id,
        }
        sale_order = None
        try:
            sale_order = request.env['sale.order'].sudo().create(sale_order_vals)
            print('sale_order',sale_order)
            _logger.info('Created sale order ID: %s with %d lines', sale_order.id, len(order_lines))
            request.env.cr.commit()
            _logger.debug('Sale order committed: ID %s', sale_order.id)
        except Exception as e:
            _logger.error('Error creating quotation: %s', str(e))
            return request.render(
                'FCS_PAY_OLD.quote_request_error',
                {'error': f'Failed to create quotation: {str(e)}'}
            )

        # Clear the cart
        try:
            website_sale_order = request.website.sale_get_order()
            if website_sale_order:
                website_sale_order.order_line.unlink()
                _logger.info('Cleared cart for sale order ID: %s', website_sale_order.id)
                request.env.cr.commit()
        except Exception as e:
            _logger.error('Error clearing cart: %s', str(e))

        # Verify sale order exists before rendering
        if not sale_order or not sale_order.exists():
            _logger.error('Sale order not found after creation')
            return request.render(
                'FCS_PAY_OLD.quote_request_error',
                {'error': 'Failed to retrieve sale order.'}
            )
        print('sale_orderid',sale_order.id)

        # Render confirmation
        _logger.debug('Rendering template with sale_order_id: %s, product_name: %s', sale_order.id, product_names)
        return request.render(
            'FCS_PAY_OLD.quote_request_confirmation',
            {
                'product_name': product_names,
                'sale_order_id': sale_order.id,
                'opportunity_id': opportunity.id
            }
        )