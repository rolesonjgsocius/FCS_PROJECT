
/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
publicWidget.registry.banner_slider = publicWidget.Widget.extend({
    selector: '.s_banner_slider',
    start: function () {
        console.log("Banner slider initialized");
    },
});

//odoo.define('website_add_banner.banner_slider', function (require) {
//    var publicWidget = require('web.public.widget');
//    publicWidget.registry.BannerSlider = publicWidget.Widget.extend({
//        selector: '.s_banner_slider',
//        start: function () {
//            console.log("Banner slider initialized");
//        }
//    });
//    return publicWidget.registry.BannerSlider;
//});
