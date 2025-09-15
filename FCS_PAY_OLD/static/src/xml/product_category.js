/** @odoo-module */

import { renderToElement } from "@web/core/utils/render";
import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.get_product_tab = publicWidget.Widget.extend({
    selector: '.categories_section',

    async _getCategoryData() {
        if (!window.categoryDataPromise) {
            window.categoryDataPromise = rpc('/get_product_categories', {});

        }
        return window.categoryDataPromise;
    },

    async willStart() {
        try {
            const result = await this._getCategoryData();
            this.categories = result;
            if (result && result.parent_categories && result.parent_categories.length) {
                this.$target.empty().html(renderToElement('FCS_PAY_OLD.category_data', {
                    result: result,
                    counter: 0
                }));
            } else {
                console.warn('No parent categories found or invalid response:', result);
                this.$target.empty().html('<p>No categories data available</p>');
            }

        } catch (error) {
            console.error('Error fetching product categories:', error);
            this.$target.empty().html('<p>Error loading categories</p>');
        }
    },
});
