/** @odoo-module **/
import {
    WebsiteEditor
} from '@web_editor/js/website.editor';
import {
    jsonrpc
} from "@web/core/network/rpc_service";

WebsiteEditor.snippet.registry.s_custom_tabs = WebsiteEditor.Snippet.extend({
    selector: '.s_custom_tabs',
    xmlDependencies: ['/web_editor/static/src/xml/snippets.xml'],

    /**
     * @override
     */
    start() {
        this._super(...arguments);
        this.snippets = this; // Reference to the snippet instance
        this.$el.find('.o_we_content_holder').addClass('o_not_editable');

        if (this.snippets.in_editor()) {
            this._setupEditorMode();
        } else {
            this._setupNormalMode();
        }
    },

    /**
     * @override
     */
    onFocus() {
        this._super(...arguments);
        this._showEditorElements();
        this._setupEditorLogic();
    },

    /**
     * @override
     */
    onBlur() {
        this._super(...arguments);
        this._hideEditorElements();
    },

    /**
     * Sets up the snippet for editing mode.
     */
    _setupEditorMode() {
        this._showEditorElements();
        this._setupEditorLogic();
        this._showFirstSection();
    },

    /**
     * Sets up the snippet for normal (public) view mode.
     */
    _setupNormalMode() {
        this._hideEditorElements();
        this._showFirstSection();
        this._setupNormalViewDropdown();
    },

    /**
     * Hides editor-specific buttons and elements.
     */
    _hideEditorElements() {
        this.$el.find('.o_website_editor_only').hide();
    },

    /**
     * Shows editor-specific buttons and elements.
     */
    _showEditorElements() {
        this.$el.find('.o_website_editor_only').show();
    },

    /**
     * Activates the first section to be visible.
     */
    _showFirstSection() {
        const firstSection = this.$el.find('.o_we_section_content:first');
        this.$el.find('.o_we_section_content').removeClass('active');
        firstSection.addClass('active');
    },

    /**
     * Sets up the dropdown and navigation logic for normal view.
     */
    _setupNormalViewDropdown() {
        const dropdownMenu = this.$el.find('#normal_view_dropdown_menu');
        const sections = this.$el.find('.o_we_section_content');

        dropdownMenu.empty();
        sections.each((index, section) => {
            const sectionName = $(section).find('h3').text() || `Section ${index + 1}`;
            const listItem = $('<li>').append($('<a>', {
                text: sectionName,
                class: 'dropdown-item',
                'data-tab-id': $(section).data('tabId'),
                'data-section-id': $(section).data('sectionId')
            }));
            dropdownMenu.append(listItem);
        });

        // Add event listeners
        dropdownMenu.on('click', '.dropdown-item', this._switchSection.bind(this));
    },

    /**
     * Sets up the editor-specific UI and logic.
     */
    _setupEditorLogic() {
        if (!this.$el.find('.o_we_tab_editor_buttons').length) {
            this._addEditorButtons();
        }
        this._updateEditorDropdown();
    },

    /**
     * Adds buttons for adding new tabs and sections.
     */
    _addEditorButtons() {
        const buttonGroup = $('<div>', {
            class: 'o_website_editor_only o_we_tab_editor_buttons'
        });
        const addTabBtn = $('<button>', {
            class: 'btn btn-primary btn-sm o_add_tab_btn',
            text: 'Add Tab/Dropdown Item'
        });
        const addSectionBtn = $('<button>', {
            class: 'btn btn-secondary btn-sm o_add_section_btn',
            text: 'Add Section to Selected Tab'
        });

        buttonGroup.append(addTabBtn).append(addSectionBtn);
        this.$el.find('.container .row').first().append(buttonGroup);

        addTabBtn.on('click', this._addTab.bind(this));
        addSectionBtn.on('click', this._addSection.bind(this));

        // Add a delete button to each section
        this.$el.find('.o_we_section_content').each((index, section) => this._addDeleteButton($(section)));
    },

    /**
     * Adds a new tab/dropdown item and its first corresponding section.
     */
    _addTab() {
        const tabCount = this.$el.find('.o_we_section_content').length;
        const newTabId = tabCount + 1;
        const newTabName = `New Tab ${newTabId}`;
        this._addSection(newTabName, newTabId, 0);
        this._updateEditorDropdown();
    },

    /**
     * Adds a new section to the currently selected tab.
     */
    _addSection(tabName = null, tabId = null, sectionId = null) {
        const currentTabId = tabId || this.$el.find('.o_we_selected_tab_name').data('tabId');
        if (!currentTabId) {
            console.warn('No tab selected. Please select a tab or add a new one first.');
            return;
        }

        const sectionCount = this.$el.find(`.o_we_section_content[data-tab-id="${currentTabId}"]`).length;
        const newSectionId = sectionId || sectionCount + 1;
        const sectionName = tabName || `Section ${newSectionId}`;

        const newSection = $('<div>', {
            class: 'o_we_section_content',
            'data-tab-id': currentTabId,
            'data-section-id': newSectionId,
        }).append($('<h3>', {
            text: sectionName
        })).append($('<p>', {
            text: 'This is a new section. You can edit this content.'
        }));
        this.$el.find('.o_we_content_holder').append(newSection);

        this._addDeleteButton(newSection);
        this._updateEditorDropdown();
        this._showSection(currentTabId, newSectionId);
    },

    /**
     * Adds a delete button to a section element.
     */
    _addDeleteButton(section) {
        const deleteBtn = $('<button>', {
            class: 'btn btn-danger btn-sm o_delete_section_btn position-absolute top-0 end-0 m-2',
            text: 'Delete Section'
        });
        section.append(deleteBtn);
        deleteBtn.on('click', (e) => this._deleteSection(section, e));
    },

    /**
     * Deletes a section and its corresponding button/dropdown item if it's the last section for that tab.
     */
    _deleteSection(section, e) {
        e.preventDefault();
        e.stopPropagation();
        const tabId = $(section).data('tabId');
        const sectionId = $(section).data('sectionId');

        // Check if this is the only section for this tab
        const sectionsInTab = this.$el.find(`.o_we_section_content[data-tab-id="${tabId}"]`);
        if (sectionsInTab.length > 1) {
            $(section).remove();
        } else {
            // Delete the whole tab if it's the last section
            $(section).remove();
            this.$el.find(`.o_we_drop_tab .dropdown-menu li[data-tab-id="${tabId}"]`).remove();
        }

        this._updateEditorDropdown();
        this._showFirstSection();
    },

    /**
     * Updates the editor-only dropdown menu with all existing tabs and sections.
     */
    _updateEditorDropdown() {
        const dropdownMenu = this.$el.find('#dropdown_menu_tabs');
        dropdownMenu.empty();
        const tabs = {};

        // Group sections by tab ID
        this.$el.find('.o_we_section_content').each((index, section) => {
            const tabId = $(section).data('tabId');
            const sectionId = $(section).data('sectionId');
            const sectionName = $(section).find('h3').text() || `Section ${sectionId}`;

            if (!tabs[tabId]) {
                tabs[tabId] = {
                    name: `Tab ${tabId}`,
                    sections: []
                };
            }
            tabs[tabId].sections.push({
                id: sectionId,
                name: sectionName
            });
        });

        // Populate dropdown with new structure
        for (const tabId in tabs) {
            const tab = tabs[tabId];
            const tabItem = $('<li>', {
                'data-tab-id': tabId,
                class: 'dropdown-header'
            }).text(tab.name);

            dropdownMenu.append(tabItem);

            tab.sections.forEach(section => {
                const sectionItem = $('<li>').append($('<a>', {
                    text: ` - ${section.name}`,
                    class: 'dropdown-item',
                    'data-tab-id': tabId,
                    'data-section-id': section.id
                }));
                dropdownMenu.append(sectionItem);
            });
        }

        // Add event listeners to new items
        dropdownMenu.off('click', '.dropdown-item').on('click', '.dropdown-item', this._switchSection.bind(this));
    },

    /**
     * Handles switching between sections.
     */
    _switchSection(event) {
        event.preventDefault();
        const tabId = $(event.currentTarget).data('tabId');
        const sectionId = $(event.currentTarget).data('sectionId');
        this._showSection(tabId, sectionId);
    },

    /**
     * Hides all sections and shows the selected one.
     */
    _showSection(tabId, sectionId) {
        this.$el.find('.o_we_section_content').removeClass('active');
        const sectionToShow = this.$el.find(`.o_we_section_content[data-tab-id="${tabId}"][data-section-id="${sectionId}"]`);
        sectionToShow.addClass('active');

        // Update the dropdown button text
        const tabName = this.$el.find(`.dropdown-menu li[data-tab-id="${tabId}"]`).text().trim();
        this.$el.find('.o_we_selected_tab_name').text(tabName);
    },
});
