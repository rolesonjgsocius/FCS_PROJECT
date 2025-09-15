# -*- coding: utf-8 -*-
import json
from pickle import FALSE

from odoo import http
import logging
from odoo.addons.website.controllers.form import WebsiteForm
from odoo.http import request

_logger = logging.getLogger(__name__)
class WebsiteProductController(http.Controller):

    # @http.route(['/'], type='http', auth="public", website=True)
    # def security_camera_products(self, **kwargs):
    #
    #     categories = request.env['product.public.category'].sudo().search([])
    #     for cat in categories:
    #         print(f"Category: {cat.name}, Subcats: {cat.child_id.mapped('name')}")
    #
    #     # Fetch attributes first
    #     security_camera_attribute = request.env['product.attribute.value'].sudo().search([
    #         ('name', '=', 'security')
    #     ], limit=1)
    #
    #     indoor_camera_attribute = request.env['product.attribute.value'].sudo().search([
    #         ('name', '=', 'indoorcamera')
    #     ], limit=1)
    #
    #     elo_store_attribute = request.env['product.attribute.value'].sudo().search([
    #         ('name', '=', 'elo_store')
    #     ], limit=1)
    #     all_products = request.env['product.template'].search([])  # Get all products
    #     # Fetch products only if attributes exist
    #     security_products = request.env['product.template'].sudo().search([
    #         ('attribute_line_ids.value_ids', 'in', security_camera_attribute.id)
    #     ]) if security_camera_attribute else []
    #
    #     indoor_camera_products = request.env['product.template'].sudo().search([
    #         ('attribute_line_ids.value_ids', 'in', indoor_camera_attribute.id)
    #     ]) if indoor_camera_attribute else []
    #
    #     elo_store_products = request.env['product.template'].sudo().search([
    #         ('attribute_line_ids.value_ids', 'in', elo_store_attribute.id)
    #     ]) if elo_store_attribute else []
    #
    #     # Additional attributes check
    #     extra_attributes = {
    #         "pos": None,
    #         "elos_software": None,
    #         "checkout_experience": None,
    #         "price_Checker": None,
    #         "connected_ecosystem": None,
    #         "displaysolutions": None,
    #         "patient_care": None,
    #         "process_automation": None,
    #         "customer_engagement": None,
    #         "omnichannel": None,
    #         "pick_up_cabinet": None,
    #         "touchscreen_products": None,
    #
    #         'ELOPOS': None,
    #         'edgeconnect': None,
    #         'iseries': None,
    #         'payment_terminals': None
    #     }
    #
    #     for attr_name in extra_attributes.keys():
    #         attr_record = request.env['product.attribute.value'].sudo().search([
    #             ('name', '=', attr_name.replace("_", " "))
    #         ], limit=1)
    #
    #         if attr_record:
    #             extra_attributes[attr_name] = request.env['product.template'].sudo().search([
    #                 ('attribute_line_ids.value_ids', 'in', attr_record.id)
    #             ])
    #         else:
    #             extra_attributes[attr_name] = []
    #
    #     # Debugging logs
    #     # print("Security Products:", security_products)
    #     # print("Indoor Camera Products:", indoor_camera_products)
    #     # print("Elo Store Products:", elo_store_products)
    #     for key, products in extra_attributes.items():
    #         print(f"{key.replace('_', ' ').title()} Products:", products)
    #
    #     # Render products in the template
    #     return request.render("FCS_PAY_OLD.FCS_PAY_HOME", {
    #         'categories': categories,
    #         'security_products': security_products,
    #         'indoor_camera_products': indoor_camera_products,
    #         'elo_store_products': elo_store_products,
    #         'pos_products': extra_attributes["pos"],
    #         'elos_software_products': extra_attributes["elos_software"],
    #         'checkout_experience_products': extra_attributes["checkout_experience"],
    #         'price_checker_products': extra_attributes["price_Checker"],
    #         'connected_ecosystem_products': extra_attributes["connected_ecosystem"],
    #         'displaysolutions_products': extra_attributes["displaysolutions"],
    #         'patient_care_products': extra_attributes["patient_care"],
    #         'process_automation_products': extra_attributes["process_automation"],
    #         'customer_engagement_products': extra_attributes["customer_engagement"],
    #         'omnichannel_products': extra_attributes["omnichannel"],
    #         'pick_up_cabinet_products': extra_attributes["pick_up_cabinet"],
    #         'touchscreen_products': extra_attributes["touchscreen_products"],
    #
    #         'ELOPOS_products': extra_attributes["ELOPOS"],
    #         'edgeconnect_products': extra_attributes["edgeconnect"],
    #         'iseries_products': extra_attributes["iseries"],
    #         'payment_terminals_products': extra_attributes["payment_terminals"],
    #         'all_products':all_products
    #     })

    # @http.route(['/shop/product/<model("product.template"):product>'], type='http', auth="public", website=True)
    # def product_page(self, product, **kwargs):
    #     product.sudo().log_accessories(product.id)
    #
    #     related_products = request.env['product.template'].search([
    #         ('id', '!=', product.id),
    #         ('categ_id', '=', product.categ_id.id)
    #     ], limit=4)
    #     # print(related_products)
    #     values = {
    #
    #         'product': product,
    #         'coupon_code': product.coupon_code,
    #         'discount': product.discount,
    #         'discount_value': product.discount_value,
    #         'maindescription_1': product.maindescription_1,
    #         'maindescription_2': product.maindescription_2,
    #         'maindescription_3': product.maindescription_3,
    #         'maindescription_4': product.maindescription_4,
    #     'maindescription_5': product.maindescription_5,
    #     'maindescription_6': product.maindescription_6,
    #     'maindescription_7': product.maindescription_7,
    #     'maindescription_8': product.maindescription_8,
    #     'maindescription_9': product.maindescription_9,
    #     'maindescription_10': product.maindescription_10,
    #     'maindescription_11': product.maindescription_11,
    #     'maindescription_12': product.maindescription_12,
    #
    #     'port_number_1': product.port_number_1,
    #     'port_number_2': product.port_number_2,
    #     'port_number_3': product.port_number_3,
    #     'port_number_4': product.port_number_4,
    #     'port_number_5': product.port_number_5,
    #     'port_number_6': product.port_number_6,
    #
    #
    #
    #
    #     'discount': product.discount,
    #     'coupon_code': product.coupon_code,
    #     'discount_value': product.discount_value,
    #     'Enclosure_Color': product.Enclosure_Color,
    #     'Touch_Technology_and_Capacity': product.Touch_Technology_and_Capacity,
    #     'Processor': product.Processor,
    #
    #     'MemoryRAM': product.MemoryRAM,
    #     'Storage': product.Storage,
    #     'Expansion_Options': product.Expansion_Options,
    #     'OS': product.OS,
    #     'OS_2': product.OS_2,
    #     'Display': product.Display,
    #     'Touchscreen': product.Touchscreen,
    #     'Touchscreen_2': product.Touchscreen_2,
    #     'Touchscreen_3': product.Touchscreen_3,
    #     'Sensor': product.Sensor,
    #     'Sensor_2': product.Sensor_2,
    #     'Sensor_3': product.Sensor_3,
    #
    #
    #
    #     'Resolution': product.Resolution,
    #     'Brightness': product.Brightness,
    #     'Contrast_Ratio': product.Contrast_Ratio,
    #     'Battery': product.Battery,
    #     'Battery_two': product.Battery_two,
    #     'Battery_three': product.Battery_three,
    #     'Cellular': product.Cellular,
    #     'Cellular_2': product.Cellular_2,
    #     'Cellular_3': product.Cellular_3,
    #     'Cellular_4': product.Cellular_4,
    #     'Cellular_5': product.Cellular_5,
    #     'Cellular_6': product.Cellular_6,
    #     'Cellular_7': product.Cellular_7,
    #     'Cellular_8': product.Cellular_8,
    #
    #
    #     'GPS': product.GPS,
    #     'GPS_2': product.GPS_2,
    #     'GPS_3': product.GPS_3,
    #     'input_output': product.input_output,
    #     'Payment': product.Payment,
    #     'Payment_two': product.Payment_two,
    #     'Payment_three': product.Payment_three,
    #     'Certifications': product.Certifications,
    #     'Certifications_2': product.Certifications_2,
    #     'Certifications_3': product.Certifications_3,
    #     'Certifications_4': product.Certifications_4,
    #     'Certifications_5': product.Certifications_5,
    #     'Certifications_6': product.Certifications_6,
    #     'Certifications_7': product.Certifications_7,z
    #     'Certifications_8': product.Certifications_8,
    #     'Certifications_9': product.Certifications_9,
    #     'Certifications_10': product.Certifications_10,
    #     'Certifications_11': product.Certifications_11,
    #     'Certifications_12': product.Certifications_12,
    #     'Certifications_13': product.Certifications_13,
    #     'Certifications_14': product.Certifications_14,
    #
    #
    #
    #     'Barcode_Scanner': product.Barcode_Scanner,
    #     'Barcode_Scanner_2': product.Barcode_Scanner_2,
    #     'Wireless': product.Wireless,
    #     'Bluetooth': product.Bluetooth,
    #     'LED': product.LED,
    #     'Keyboard': product.Keyboard,
    #     'Audio': product.Audio,
    #     'Audio_2': product.Audio_2,
    #     'Audio_3': product.Audio_3,
    #     'Buttons': product.Buttons,
    #     'Buttons_2': product.Buttons_2,
    #     'Buttons_3': product.Buttons_3,
    #     'Dimensions': product.Dimensions,
    #     'Dimensions_2': product.Dimensions_2,
    #
    #
    #
    #
    #     'Shipping_Box_Dimensions': product.Shipping_Box_Dimensions,
    #     'Shipping_Box_Dimensions_2': product.Shipping_Box_Dimensions_2,
    #     'Weight_packed': product.Weight_packed,
    #     'Weight_packed_2': product.Weight_packed_2,
    #     'Weight_packed_3': product.Weight_packed_3,
    #     'Weight_packed_4': product.Weight_packed_4,
    #     'Operating_Temperature': product.Operating_Temperature,
    #     'Storage_Temperature': product.Storage_Temperature,
    #     'Humidity': product.Humidity,
    #     'Regulatory_approvals_and_declarations': product.Regulatory_approvals_and_declarations,
    #     'Regulatory_approvals_and_declarations_2': product.Regulatory_approvals_and_declarations_2,
    #     'Regulatory_approvals_and_declarations_3': product.Regulatory_approvals_and_declarations_3,
    #     'Regulatory_approvals_and_declarations_4': product.Regulatory_approvals_and_declarations_4,
    #     'Regulatory_approvals_and_declarations_5': product.Regulatory_approvals_and_declarations_5,
    #     'Regulatory_approvals_and_declarations_6': product.Regulatory_approvals_and_declarations_6,
    #     'Drop_Rating': product.Drop_Rating,
    #     'ESD': product.ESD,
    #     'Tumble_Rating': product.Tumble_Rating,
    #     'Warranty': product.Warranty,
    #     'Extended_Service_Options': product.Extended_Service_Options,
    #     'Extended_Service_Options_2': product.Extended_Service_Options_2,
    #     'Extended_Service_Options_3': product.Extended_Service_Options_3,
    #     'Extended_Service_Options_4': product.Extended_Service_Options_4,
    #     'Extended_Service_Options_5': product.Extended_Service_Options_5,
    #     'Extended_Service_Options_6': product.Extended_Service_Options_6,
    #     'Extended_Service_Options_7': product.Extended_Service_Options_7,
    #     'Extended_Service_Options_8': product.Extended_Service_Options_8,
    #     'Extended_Service_Options_9': product.Extended_Service_Options_9,
    #     'Extended_Service_Options_10': product.Extended_Service_Options_10,
    #     'Extended_Service_Options_11': product.Extended_Service_Options_11,
    #     'Extended_Service_Options_12': product.Extended_Service_Options_12,
    #     'Extended_Service_Options_13': product.Extended_Service_Options_13,
    #     'Extended_Service_Options_14': product.Extended_Service_Options_14,
    #     'Extended_Service_Options_15': product.Extended_Service_Options_15,
    #
    #     'OS_Support': product.Audio,
    #     'Sealability': product.Audio,
    #     'What_in_the_Box': product.Audio,
    #     'Optional_Accessories': product.Audio,
    #     'Optional_Accessories': product.Audio,
    #     'Optional_Accessories_2': product.Audio,
    #     'Optional_Accessories_3': product.Audio,
    #     'Optional_Accessories_4': product.Audio,
    #     'Optional_Accessories_5': product.Audio
    #
    #
    #
    #     }
    #     return request.render("website_sale.product", values)

    @http.route(['/success'], type='http', auth="public", website=True)
    def qoute_success(self, **kwargs):

        return request.render("FCS_PAY_OLD.quote_request_confirmation", {})

    @http.route('/get_product_categories', auth="public", csrf=False, type='json', website=True)
    def get_product_categories(self):
        """Get unique website categories with nested structure."""
        public_categs = http.request.env['product.public.category'].sudo().search_read(
            [('website_published', '=', False)],
            fields=['id', 'name', 'website_description', 'parent_id', 'child_id', 'featured_images_ids']
        )

        categ_by_id = {c['id']: c for c in public_categs}
        public_categs = list(categ_by_id.values())
        parent_categs = [c for c in public_categs if not c['parent_id']]
        parent_categs_tree = [self.build_category_tree(c, categ_by_id) for c in parent_categs]
        print('parent_categs_tree',parent_categs_tree)

        return {'parent_categories': parent_categs_tree}

    def build_category_tree(self, category, categ_by_id):
        """Build a nested category tree."""
        result = {
            'id': category['id'],
            'name': category['name'],
            'website_description': category['website_description'] or '',
            'featured_images_ids': category['featured_images_ids'] or [],
            'children': []
        }
        for child_id in category.get('child_id', []):
            if child_id in categ_by_id:
                result['children'].append(self.build_category_tree(categ_by_id[child_id], categ_by_id))
        if not result['children']:
            products = http.request.env['product.template'].sudo().search_read(
                [('public_categ_ids', 'in', [category['id']])],
                fields=['id', 'name']
            )
            result['products'] = [{
                'id': p['id'],
                'name': p['name'],

            } for p in products]
        return result





class LiveDemoController(http.Controller):

    @http.route('/live_demo/get_config', type='json', auth='public', website=True)
    def get_config(self):
        config = request.env['live.demo.config'].sudo().search([], limit=1)
        if config and config.data:
            try:
                return json.loads(config.data)
            except Exception:
                return {}
        return {}

    @http.route('/live_demo/save_config', type='json', auth='public', website=True)
    def save_config(self, data):
        config = request.env['live.demo.config'].sudo().search([], limit=1)
        if not config:
            config = request.env['live.demo.config'].sudo().create({'data': json.dumps(data)})
        else:
            config.sudo().write({'data': json.dumps(data)})
        return {"status": "success"}

