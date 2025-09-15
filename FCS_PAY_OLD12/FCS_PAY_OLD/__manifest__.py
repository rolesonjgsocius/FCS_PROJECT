# -*- coding: utf-8 -*-
{
    "name": "FCS_PAY_OLD",
    "summary": "Custom Payment Module for Website",
    "version": "18.0.1.0.0",
    "author": "SIGB",
    "license": "LGPL-3",
    "category": "Uncategorized",
    "application": True,
    "installable": True,
    "depends": [
        "website",
        "web",
        "web_editor",
        "base", "website_sale", "website_blog", "website_sale_wishlist", "website_sale_comparison", "sale_management",
    ],
    "data": [
        "views/home.xml",
        "views/shop.xml",
        # "views/product_website.xml",
        "views/product_detail.xml",
        "views/product_public_category_view.xml",
        "views/fcs_product_template.xml",
        "views/Snippets/header.xml",
        "views/Snippets/footer.xml",
        "views/Snippets/landing_page.xml",
        "views/Snippets/banner_snippet.xml",
        'views/shop_cart.xml',
    ],
    "assets": {
        "web.assets_frontend": [

            'FCS_PAY_OLD/static/src/css/product_details_frontend.css',
            'FCS_PAY_OLD/static/src/css/style.css',
            'FCS_PAY_OLD/static/src/scss/home.scss',
            'FCS_PAY_OLD/static/src/scss/product_website.scss',
            'FCS_PAY_OLD/static/src/js/home.js',
            # 'FCS_PAY_OLD/static/src/js/product_website_form.js',
            'FCS_PAY_OLD/static/src/js/live_demo.js',

            'FCS_PAY_OLD/static/src/js/banner_slider.js',
            'FCS_PAY_OLD/static/src/xml/*',
            'FCS_PAY_OLD/static/src/css/live_demo.css',

        ],


    "website.assets_wysiwyg": [

        'FCS_PAY_OLD/static/src/js/Livedemotest.js'

],

        "web.assets_editor": [

            'FCS_PAY_OLD/static/src/css/live_demo.css',
            'FCS_PAY_OLD/static/src/css/product_details.css',

        ],
        "web.assets_backend": [
            'FCS_PAY_OLD/static/src/css/product_details.css',
        ]
    }
}
