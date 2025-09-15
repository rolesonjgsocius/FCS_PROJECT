/*
odoo.define('FCS_PAY_OLD.product_variant', function (require) {
    "use strict";

    require('web.dom_ready'); // Ensure DOM is ready
    var publicWidget = require('web.public.widget');

    publicWidget.registry.ProductVariantSelection = publicWidget.Widget.extend({
        selector: "#product_details",
        events: {
            'change #variant_select': '_onVariantChange',
        },

        _onVariantChange: function (ev) {
            var variantId = $(ev.currentTarget).val();
            if (variantId) {
                window.location.href = "/shop/product/" + variantId;
            }
        },
    });

    return publicWidget.registry.ProductVariantSelection;
});
*/
