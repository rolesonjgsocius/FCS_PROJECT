from odoo import models, fields

class ProductPublicCategory(models.Model):
    _inherit = 'product.public.category'

    website_published = fields.Boolean(
        string="Hide Menu on Website",
        help="Enable to hide this category from the eCommerce website menus.",
        default=False
    )

    featured_images_ids = fields.One2many(
        comodel_name="ir.attachment",
        inverse_name="res_id",
        string="Featured Images",
        domain=[('res_model', '=', 'product.public.category'), ('mimetype', '=ilike', 'image/%')],
        help="Upload up to 14 featured images for this category."
    )
