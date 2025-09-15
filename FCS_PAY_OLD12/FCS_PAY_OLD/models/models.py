# models/models.py
from odoo import models, fields, api
import uuid

class WebsiteDropdownSnippet(models.Model):
    _name = 'website.dropdown.snippet'
    _description = 'Website Dropdown Snippet container grouping'

    name = fields.Char(string='Label', required=True)
    snippet_uuid = fields.Char(string='Snippet UUID', required=True, default=lambda self: str(uuid.uuid4()))
    dropdown_items = fields.One2many('website.dropdown.item', 'snippet_id', string='Dropdown items')


class WebsiteDropdownItem(models.Model):
    _name = 'website.dropdown.item'
    _description = 'Dropdown Item inside snippet'

    name = fields.Char(string='Item Label', required=True)
    value = fields.Char(string='Value', required=True)  # simple value key
    snippet_id = fields.Many2one('website.dropdown.snippet', string='Snippet', required=True, ondelete='cascade')
    containers = fields.One2many('website.dropdown.container', 'dropdown_item_id', string='Containers')


class WebsiteDropdownContainer(models.Model):
    _name = 'website.dropdown.container'
    _description = 'A container mapped to a dropdown item, editable content in website editor'

    name = fields.Char(string='Container name', default='Untitled')
    container_uuid = fields.Char(string='Container UUID', required=True, default=lambda self: str(uuid.uuid4()))
    dropdown_item_id = fields.Many2one('website.dropdown.item', string='Dropdown item', required=True, ondelete='cascade')
    # content_html will store HTML content pasted/edited via frontend. Keep as text to allow website editor content.
    content_html = fields.Html(string='Content (HTML)', sanitize=False)
    sequence = fields.Integer(string='Sequence', default=10)
