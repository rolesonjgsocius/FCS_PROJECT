///** @odoo-module **/
//
//import publicWidget from "@web/legacy/js/public/public_widget";
//import { rpc } from "@web/core/network/rpc";
//
//publicWidget.registry.productwebsiteJs = publicWidget.Widget.extend({
//    selector: '#webform_lead',
//    events: {
//        'submit': '_onFormSubmit',
//    },
//
//    start: function () {
//        const result = this._super.apply(this, arguments);
//        console.log('resultsssss',result);
//        const productName = this.$el.data('product-name') || 'Unknown Product';
//        this.$el.find('#subject').val(productName);
//        return result;
//    },
//
//    async _onFormSubmit(ev) {
//        ev.preventDefault();
//        const $form = this.$el;
//
//        const formData = {
//            name: $form.find('#name').val().trim(),
//            phone: $form.find('#phone').val().trim(),
//            email: $form.find('#email').val().trim(),
//            company: $form.find('#company').val().trim(),
//            subject: $form.find('#subject').val().trim(),
//            question: $form.find('#question').val().trim(),
//        };
//        console.log('formData',formData);
//
//        if (!formData.name || !formData.email || !formData.company || !formData.subject || !formData.question) {
//            console.log('Please fill out all required fields.');
//            return;
//        }
//
//        try {
//            const result = await rpc('/webform/lead/create',{
//                    name: formData.name,
//                    phone: formData.phone,
//                    email: formData.email,
//                    company_name: formData.company,
//                    subject: formData.subject,
//                    description: formData.question,
//                    source: 'Website Product Page',
//            });
//            console.log('result',result);
//
//            if (result.success) {
//                console.log('Lead successfully created!');
//                $('#success_msg').text('Lead successfully created!');
//                setTimeout(() => {
//                    $('#success_msg').text('');
//                }, 3000);
//                $form[0].reset();
//                $form.find('#subject').val(formData.subject);
//            } else {
//                console.log(`Error: ${result.error || 'Failed to create lead.'}`);
//            }
//        } catch (error) {
//            console.error('Error creating lead:', error);
//            console.log('An error occurred while submitting the form. Please try again.');
//        }
//    },
//});