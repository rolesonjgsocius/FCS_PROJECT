from odoo import fields, models, api
from odoo.exceptions import ValidationError
import logging
_logger = logging.getLogger(__name__)  # Initialize Logger

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    get_a_quote = fields.Boolean(
        string="Get a Quote",
        default=False,
        help="Enable to mark this product as available for quote requests."
    )

    @api.model
    def log_accessories(self, product_id):
        product = self.sudo().browse(product_id)
        accessories = product.accessory_product_ids

        # Log accessories data
        _logger.info("Product S elected: %s (ID: %s)", product.name, product.id)
        for accessory in accessories:
            _logger.info("Accessory: %s (ID: %s, Price: %s USD)", accessory.name, accessory.id, accessory.list_price)
            print()

    dooFull_eCommerce = fields.Boolean(string="Full eCommerce", default=False)
    image_1 = fields.Image(string="Image 1")
    image_2 = fields.Image(string="Image 2")
    image_3 = fields.Image(string="Image 3")
    image_4 = fields.Image(string="Image 4")
    image_5 = fields.Image(string="Image 5")
    image_6 = fields.Image(string="Image 6")
    image_7 = fields.Image(string="Image 7")
    image_8 = fields.Image(string="Image 8")
    image_9 = fields.Image(string="Image 9")
    image_10 = fields.Image(string="Image 10")
    image_11 = fields.Image(string="Image 11")
    image_12 = fields.Image(string="Image 12")
    image_13 = fields.Image(string="Image 13")

    maindescription_1 = fields.Text(string="Main Description 1")
    maindescription_2 = fields.Text(string="Main Description 2")
    maindescription_3 = fields.Text(string="Main Description 3")
    maindescription_4 = fields.Text(string="Main Description 4")
    maindescription_5 = fields.Text(string="Main Description 5")
    maindescription_6 = fields.Text(string="Main Description 6")
    maindescription_7 = fields.Text(string="Main Description 7")
    maindescription_8 = fields.Text(string="Main Description 8")
    maindescription_9 = fields.Text(string="Main Description 9")
    maindescription_10 = fields.Text(string="Main Description 10")
    maindescription_11 = fields.Text(string="Main Description 11")
    maindescription_12 = fields.Text(string="Main Description 12")

    port_number_1 = fields.Text(string="port_number")
    port_number_2 = fields.Text(string="port_number")
    port_number_3 = fields.Text(string="port_number")
    port_number_4 = fields.Text(string="port_number")
    port_number_5 = fields.Text(string="port_number")
    port_number_6 = fields.Text(string="port_number")

    discount = fields.Float(string="Discount (%)", help="Enter the discount percentage for the product.")
    coupon_code = fields.Char(string="Discount Coupon", help="Enter the discount coupon code.")
    discount_value = fields.Float(string="Discount Amount", compute="_compute_discount_value", store=True)
    Enclosure_Color = fields.Text(string="Enclosure Color")
    Touch_Technology_and_Capacity = fields.Text(string="Touch Technology & Capacity")
    Processor = fields.Text(string="Processor")
    MemoryRAM = fields.Text(string="Memory (RAM)")
    Storage= fields.Text(string="Storage")
    Expansion_Options = fields.Text(string=" Expansion Options")

    OS = fields.Text(string="OS")
    OS_2 = fields.Text(string="OS")
    Display= fields.Text(string="Display")
    Touchscreen = fields.Text(string="Touchscreen")
    Touchscreen_2 = fields.Text(string="Touchscreen")
    Touchscreen_3 = fields.Text(string="Touchscreen")
    Sensor = fields.Text(string="Sensor")
    Sensor_2 = fields.Text(string="Sensor")
    Sensor_3 = fields.Text(string="Sensor")


    Resolution = fields.Text(string="Resolution")
    Brightness  = fields.Text(string="Brightness")
    Contrast_Ratio = fields.Text(string="Contrast Ratio")
    Battery = fields.Text(string="Battery")
    Battery_two = fields.Text(string="Battery")
    Battery_three = fields.Text(string="Battery")
    Cellular = fields.Text(string="Cellular")
    Cellular_2 = fields.Text(string="Cellular")
    Cellular_3 = fields.Text(string="Cellular")
    Cellular_4 = fields.Text(string="Cellular")
    Cellular_5 = fields.Text(string="Cellular")
    Cellular_6 = fields.Text(string="Cellular")
    Cellular_7 = fields.Text(string="Cellular")
    Cellular_8 = fields.Text(string="Cellular")
    Cellular_9 = fields.Text(string="Cellular")

    GPS = fields.Text(string="GPS")
    GPS_2 = fields.Text(string="GPS")
    GPS_3 = fields.Text(string="GPS")
    input_output = fields.Text(string="I/O Ports")
    Camera = fields.Text(string="Camera")
    Payment = fields.Text(string="Payment")
    Payment_two = fields.Text(string="Payment")
    Payment_three = fields.Text(string="Payment")
    Certifications = fields.Text(string="Certifications")
    Certifications_2 = fields.Text(string="Certifications")
    Certifications_3 = fields.Text(string="Certifications")
    Certifications_4 = fields.Text(string="Certifications")
    Certifications_5 = fields.Text(string="Certifications")
    Certifications_6 = fields.Text(string="Certifications")
    Certifications_7 = fields.Text(string="Certifications")
    Certifications_8 = fields.Text(string="Certifications")
    Certifications_9 = fields.Text(string="Certifications")
    Certifications_10 = fields.Text(string="Certifications")
    Certifications_11 = fields.Text(string="Certifications")
    Certifications_12 = fields.Text(string="Certifications")
    Certifications_13 = fields.Text(string="Certifications")
    Certifications_14 = fields.Text(string="Certifications")

    Barcode_Scanner = fields.Text(string="Barcode Scanner")
    Barcode_Scanner_2 = fields.Text(string="Barcode Scanner")
    Wireless = fields.Text(string="Wireless")
    Bluetooth = fields.Text(string="Bluetooth")
    LED = fields.Text(string="LED")
    LED_2 = fields.Text(string="LED")
    Keyboard = fields.Text(string="Keyboard")
    Audio = fields.Text(string="Audio")
    Audio_2 = fields.Text(string="Audio")
    Audio_3 = fields.Text(string="Audio")
    Buttons = fields.Text(string="Buttons")
    Buttons_2 = fields.Text(string="Buttons")
    Buttons_3 = fields.Text(string="Buttons")
    Dimensions = fields.Text(string="Dimensions")
    Dimensions_2 = fields.Text(string="Dimensions")

    Shipping_Box_Dimensions = fields.Text(string="Shipping Box Dimensions")
    Shipping_Box_Dimensions_2 = fields.Text(string="Dimensions")
    Weight_packed = fields.Text(string="Weight (Packaged)")
    Weight_packed_2 = fields.Text(string="Weight (Packaged)")
    Weight_packed_3 = fields.Text(string="Weight (Packaged)")
    Weight_packed_4 = fields.Text(string="Weight (Packaged)")
    Operating_Temperature    = fields.Text(string="Operating Temperature")
    Storage_Temperature = fields.Text(string="Storage Temperature")
    Humidity = fields.Text(string="Humidity")
    Regulatory_approvals_and_declarations = fields.Text(string="Regulatory approvals and declarations")
    Regulatory_approvals_and_declarations_2 = fields.Text(string="Regulatory approvals and declarations")
    Regulatory_approvals_and_declarations_3 = fields.Text(string="Regulatory approvals and declarations")
    Regulatory_approvals_and_declarations_4 = fields.Text(string="Regulatory approvals and declarations")
    Regulatory_approvals_and_declarations_5 = fields.Text(string="Regulatory approvals and declarations")
    Regulatory_approvals_and_declarations_6 = fields.Text(string="Regulatory approvals and declarations")
    Drop_Rating = fields.Text(string="Drop Rating")
    ESD = fields.Text(string="ESD")
    Tumble_Rating = fields.Text(string="Tumble Rating")
    Warranty = fields.Text(string="Warranty")
    Extended_Service_Options = fields.Text(string="Extended Service Options")
    Extended_Service_Options_2 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_3 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_4 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_5 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_6 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_7 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_8 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_9 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_10 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_11 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_12 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_13 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_14 = fields.Text(string="Extended Service Options")
    Extended_Service_Options_15 = fields.Text(string="Extended Service Options")
    OS_Support = fields.Text(string="OS Support")
    Sealability = fields.Text(string="Sealability")
    What_in_the_Box = fields.Text(string="What's in the Box")
    Optional_Accessories =fields.Text(string="Optional Accessories")
    Optional_Accessories_2 = fields.Text(string="Optional Accessories")
    Optional_Accessories_3 = fields.Text(string="Optional Accessories")
    Optional_Accessories_4 = fields.Text(string="Optional Accessories")
    Optional_Accessories_5 = fields.Text(string="Optional Accessories")
    Optional_Accessories_6 = fields.Text(string="Optional Accessories")

    @api.constrains('port_number')
    def _check_port_number_length(self):
        for record in self:
            if record.port_number and (len(record.port_number) != 12 or not record.port_number.isdigit()):
                raise ValidationError("The Port Number must be exactly 12 digits.")

    @api.depends('list_price', 'discount')
    def _compute_discount_value(self):
        """Calculate discount value based on the product price and discount percentage."""
        for product in self:
            if product.list_price and product.discount:
                product.discount_value = product.list_price * (product.discount / 100)
            else:
                product.discount_value = 0.0

    @api.onchange('coupon_code')
    def _onchange_coupon_code(self):
        """Automatically apply a discount based on the entered coupon code."""
        coupon_discounts = {
            'WELCOME10': 10,  # 10% discount
            'SPRING20': 20,   # 20% discount
            'FALL30': 30      # 30% discount
        }
        self.discount = coupon_discounts.get(self.coupon_code, 0.0)  # Default to 0% if the code is invalid
