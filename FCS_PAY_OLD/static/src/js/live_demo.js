/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.livedemoJs = publicWidget.Widget.extend({
    selector: '#live_demo',
    events: {
        'change select.tab_common_select': '_onTabSelectChange',
        'change select.tab_sub_select': '_onSubTabSelectChange',
        'click .text2pay #demo_widget': '_onText2PayClick',
        'click .donation #donor': '_onDonorClick',
        'click .donation #campaign_owner': '_onCampaignOwnerClick',
        'click .donation #admin': '_onAdminClick',
        'click .invoicing #invo_demo': '_onInvClick',
        'click .events #event_demo': '_onEventClick',
        'click .events #event_dash': '_onEventDashClick',
        'click .events #event_roombk': '_onEventRbClick',
        'click .events #event_evntcr': '_onEventCrClick',
        'click .pos #pos_demo': '_onPosClick',
    },

    start: function () {
        const self = this;
        return this._super.apply(this, arguments).then(() => {
            const defaultTab = this.$('select.tab_common_select').val() || 'text2pay';
            self._updateTabs(defaultTab);
        });
    },

    _onTabSelectChange: function (ev) {
        const selectedTab = $(ev.currentTarget).val().toLowerCase();
        this._updateTabs(selectedTab);
    },

    _onSubTabSelectChange: function (ev) {
        const selectedSubTab = $(ev.currentTarget).val().toLowerCase();
        this._updateSubTabs(selectedSubTab);
    },

    _updateTabs: function (selectedTab) {
        if (selectedTab) {
            this.$('.tab_sec').addClass('d-none').removeClass('active');
            this.$('.tab_content').addClass('d-none').removeClass('active');
            const tabSecSelector = `.tab_sec.${selectedTab}`;
            const tabContentSelector = `.tab_content.${selectedTab}`;
            const $tabSec = this.$(tabSecSelector);
            const $tabContent = this.$(tabContentSelector);

            if ($tabSec.length && $tabContent.length) {
                $tabSec.removeClass('d-none').addClass('active');
                $tabContent.removeClass('d-none').addClass('active');
                if (selectedTab === 'donation') {
                    this.$('#donor_sec, #campaign_owner_sec, #admin_sec').addClass('d-none');
                    this.$('#donor_sec, #campaign_owner_sec, #admin_sec').removeClass('active');
                    this.$('#donation_default').removeClass('d-none').addClass('active');
                } else if (selectedTab === 'text2pay') {
                    this.$('#text2pay_default, #demo_widgt, #instructions, #list_items, #payment_method, #convenience_fee, #service_fee, #surcharge, #tip, #payment, #markdown, #signature, #acknowledgement').addClass('d-none');
                    this.$('#text2pay_default, #demo_widgt, #instructions, #list_items, #payment_method, #convenience_fee, #service_fee, #surcharge, #tip, #payment, #markdown, #signature, #acknowledgement').removeClass('active');
                    this.$('#text2pay_default').removeClass('d-none').addClass('active');
                    this.$('select.tab_sub_select').val('');
                } else if (selectedTab === 'pos') {
                    this.$('#pos_sec').addClass('d-none');
                    this.$('#pos_sec').removeClass('active');
                    this.$('#pos_default').removeClass('d-none').addClass('active');
                } else if (selectedTab === 'invoicing') {
                    this.$('#invo_sec').addClass('d-none');
                    this.$('#invo_sec').removeClass('active');
                    this.$('#invo_default').removeClass('d-none').addClass('active');
                } else if (selectedTab === 'events') {
                    this.$('#event_sec, #event_dash_sec, #event_roombk_sec, #event_evntcr_sec').addClass('d-none');
                    this.$('#event_sec, #event_dash_sec, #event_roombk_sec, #event_evntcr_sec').removeClass('active');
                    this.$('#event_default').removeClass('d-none').addClass('active');
                }
            } else {
                console.warn(`No matching tab found for: ${selectedTab}`);
            }
        } else {
            console.warn('No tab selected');
        }
    },

    _updateSubTabs: function (selectedSubTab) {
        if (selectedSubTab) {
            this.$('#text2pay_default, #demo_widgt, #instructions, #list_items, #payment_method, #convenience_fee, #service_fee, #surcharge, #tip, #payment, #markdown, #signature, #acknowledgement').addClass('d-none').removeClass('active');
            const subTabSelector = `#${selectedSubTab}`;
            const $subTab = this.$(subTabSelector);
            if ($subTab.length) {
                $subTab.removeClass('d-none').addClass('active');
            } else {
                console.warn(`No matching sub-tab found for: ${selectedSubTab}`);
            }
        } else {
            console.warn('No sub-tab selected');
            this.$('#text2pay_default').removeClass('d-none').addClass('active');
        }
    },

    _onText2PayClick: function (ev){
        ev.preventDefault();
        this.$('#text2pay_default, #instructions, #list_items, #payment_method, #convenience_fee, #service_fee, #surcharge, #tip, #payment, #markdown, #signature, #acknowledgement').addClass('d-none');
        this.$('#demo_widgt').removeClass('d-none');
    },

    _onDonorClick: function (ev){
        ev.preventDefault();
        this.$('#donation_default, #campaign_owner_sec, #admin_sec').addClass('d-none');
        this.$('#donor_sec').removeClass('d-none');
    },

    _onCampaignOwnerClick:  function (ev){
        ev.preventDefault();
        this.$('#donation_default, #donor_sec, #admin_sec').addClass('d-none');
        this.$('#campaign_owner_sec').removeClass('d-none');
    },

    _onAdminClick:  function (ev){
        ev.preventDefault();
        this.$('#donation_default, #donor_sec, #campaign_owner_sec').addClass('d-none');
        this.$('#admin_sec').removeClass('d-none');
    },

    _onInvClick:  function (ev){
        ev.preventDefault();
        this.$('#invo_default').addClass('d-none');
        this.$('#invo_sec').removeClass('d-none');
    },

    _onPosClick: function (ev){
        ev.preventDefault();
        this.$('#pos_default').addClass('d-none');
        this.$('#pos_sec').removeClass('d-none');
    },

    _onEventClick: function(ev){
        ev.preventDefault();
        this.$('#event_default, #event_dash_sec, #event_roombk_sec, #event_evntcr_sec').addClass('d-none');
        this.$('#event_sec').removeClass('d-none');
    },

    _onEventDashClick: function(ev){
        ev.preventDefault();
        this.$('#event_default, #event_sec, #event_roombk_sec, #event_evntcr_sec').addClass('d-none');
        this.$('#event_dash_sec').removeClass('d-none');
    },

    _onEventRbClick: function(ev){
        ev.preventDefault();
        this.$('#event_default, #event_sec, #event_dash_sec, #event_evntcr_sec').addClass('d-none');
        this.$('#event_roombk_sec').removeClass('d-none');
    },

    _onEventCrClick: function(ev){
        ev.preventDefault();
        this.$('#event_default, #event_sec, #event_dash_sec, #event_roombk_sec').addClass('d-none');
        this.$('#event_evntcr_sec').removeClass('d-none');
    },

});