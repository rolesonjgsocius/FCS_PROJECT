# from odoo import http
# from odoo.http import request
#
# class WebformLead(http.Controller):
#     @http.route('/webform/lead/create', type='json', auth='public', methods=['POST'], website=True)
#     def create_lead(self, **kwargs):
#         print('dfghjkkjhfdsdgjkljgfddgjkkcx')
#         lead_vals = {
#             'name': kwargs.get('subject'),
#             'contact_name': kwargs.get('name'),
#             'phone': kwargs.get('phone'),
#             'email_from': kwargs.get('email'),
#             'partner_name': kwargs.get('company_name'),
#             'description': kwargs.get('description'),
#             'type': 'lead',
#             'source_id': request.env['utm.source'].sudo().search([('name', '=', kwargs.get('source'))], limit=1).id,
#         }
#         print('lead_vals',lead_vals)
#         lead = request.env['crm.lead'].sudo().create(lead_vals)
#         return {'success': True, 'lead_id': lead.id}
