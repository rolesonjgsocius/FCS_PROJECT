///** @odoo-module **/
//
//import { _t } from '@web/core/l10n/translation';
//import { patch } from '@web/core/utils/patch';
//import { ComboConfiguratorDialog } from '@sale/js/combo_configurator_dialog/combo_configurator_dialog';
//import { jsonrpc } from '@web/core/network/rpc';
//
//// Patch the ComboConfiguratorDialog props to include any additional fields if needed
//patch(ComboConfiguratorDialog, {
//    props: {
//        ...ComboConfiguratorDialog.props,
//        isFrontend: { type: Boolean, optional: true },
//        category_name: { type: String, optional: true },
//        currency_name: { type: String, optional: true },
//    },
//});
//
//// Patch the ComboConfiguratorDialog prototype to add the getQuote method
//patch(ComboConfiguratorDialog.prototype, {
//    setup() {
//        super.setup(...arguments);
//
//        if (this.props.isFrontend) {
//            this.getPriceUrl = '/website_sale/combo_configurator/get_price';
//            this.getQuoteUrl = '/website_sale/combo_configurator/get_quote'; // New endpoint for quote
//        }
//    },
//
//    get totalMessage() {
//        if (this.props.isFrontend) {
//            return _t("Total: %s", this.formattedTotalPrice);
//        }
//        return super.totalMessage(...arguments);
//    },
//
//    get _comboProductData() {
//        const comboProductData = super._comboProductData;
//        if (this.props.isFrontend) {
//            Object.assign(comboProductData, { 'price': this._comboPrice });
//        }
//        return comboProductData;
//    },
//
//    _getAdditionalDialogProps() {
//        const props = super._getAdditionalDialogProps();
//        if (this.props.isFrontend) {
//            props.isFrontend = this.props.isFrontend;
//        }
//        return props;
//    },
//
//    /**
//     * Handle the "Get a Quote" button click.
//     * Sends the selected combo data to the backend to generate a quote.
//     */
//    async getQuote() {
//        if (!this.areAllCombosSelected) {
//            return; // Prevent action if not all combos are selected
//        }
//
//        try {
//            const comboData = this._comboProductData;
//            const response = await jsonrpc(this.getQuoteUrl, {
//                combo_data: comboData,
//                category_name: this.props.category_name,
//                currency_name: this.props.currency_name,
//            });
//
//            if (response.success) {
//                // Handle success (e.g., show a confirmation or redirect to a quote page)
//                this.notify({
//                    message: _t("Your quote request has been submitted successfully!"),
//                    type: 'success',
//                });
//                this.close(); // Close the dialog
//            } else {
//                throw new Error(response.error || _t("Failed to submit quote request."));
//            }
//        } catch (error) {
//            // Handle error
//            this.notify({
//                message: _t("An error occurred while submitting your quote request: %s", error.message),
//                type: 'danger',
//            });
//        }
//    },
//
//    /**
//     * Utility method to show notifications (optional, implement based on your needs)