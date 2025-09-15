/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

const { SnippetOptionWidget, registry: snippetOptionRegistry } = options;

console.log("SnippetOptionWidget and registry loaded:", SnippetOptionWidget, snippetOptionRegistry);

snippetOptionRegistry['DropdownOptions'] = SnippetOptionWidget.extend({
    init() {
        console.log("Initializing DropdownOptions with args:", arguments);
        this._super(...arguments);
        this.selectors = {
            dropdown: '.custom-dropdown',
            addButton: '.add-option-btn',
            removeButton: '.remove-option-btn',
        };
        console.log("Selectors set:", this.selectors);
    },

    async start() {
        console.log("Starting DropdownOptions for target:", this.$target[0]);
        await this._super(...arguments);

        this.$dropdown = this.$target.is(this.selectors.dropdown)
            ? this.$target
            : this.$target.find(this.selectors.dropdown);

        if (this.$dropdown.length) {
            console.log(
                "Dropdown found:",
                this.$dropdown[0],
                "Initial options count:",
                this.$dropdown[0].options.length
            );
        } else {
            console.warn("No dropdown found with selector:", this.selectors.dropdown);
        }

        // Attach event listeners to buttons
        this._bindButtonEvents();
    },

    //--------------------------------------------------------------------------
    // Event Binding
    //--------------------------------------------------------------------------

    _bindButtonEvents() {
        const bindButtons = () => {
            const $addButton = $(document).find(this.selectors.addButton);
            const $removeButton = $(document).find(this.selectors.removeButton);

            // Debugging: Log the DOM context
            console.log("Searching for buttons. Add button found:", $addButton.length, "Remove button found:", $removeButton.length);
            console.log("Snippet target:", this.$target[0]);
            console.log("Closest .o_we_inplace_editor:", this.$target.closest('.o_we_inplace_editor')[0] || "Not found");
            console.log("Options panel:", $('.o_website_snippet_options')[0] || "Not found");

            if ($addButton.length) {
                $addButton.off('click.dropdownOptions').on('click.dropdownOptions', (event) => {
                    console.log("Add button clicked");
                    this.addOption(false);
                });
                console.log("Add button event listener attached");
            } else {
                console.warn("Add button not found with selector:", this.selectors.addButton);
            }

            if ($removeButton.length) {
                $removeButton.off('click.dropdownOptions').on('click.dropdownOptions', (event) => {
                    console.log("Remove button clicked");
                    this.removeOption(false);
                });
                console.log("Remove button event listener attached");
            } else {
                console.warn("Remove button not found with selector:", this.selectors.removeButton);
            }
        };

        // Initial attempt to bind buttons
        bindButtons();

        // Watch for DOM changes to rebind buttons if they appear later
        const observer = new MutationObserver((mutations) => {
            console.log("DOM changed, attempting to rebind buttons");
            bindButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    //--------------------------------------------------------------------------
    // Action Methods
    //--------------------------------------------------------------------------

    async addOption(previewMode, widgetValue, params) {
        console.log("addOption called. previewMode:", previewMode);
        if (previewMode || previewMode === 'reset') {
            console.log("Preview/reset mode → skipping permanent add.");
            return;
        }
        if (!this.$dropdown.length) {
            console.error("No dropdown found → cannot add option.");
            return;
        }

        this._addOption();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
            console.log("History step recorded (undo/redo available).");
        }
    },

    async removeOption(previewMode, widgetValue, params) {
        console.log("removeOption called. previewMode:", previewMode);
        if (previewMode || previewMode === 'reset') {
            console.log("Preview/reset mode → skipping permanent remove.");
            return;
        }
        if (!this.$dropdown.length) {
            console.error("No dropdown found → cannot remove option.");
            return;
        }

        this._removeOption();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
            console.log("History step recorded (undo/redo available).");
        }
    },

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    _addOption() {
        console.log("Adding new option. Current count:", this.$dropdown[0].options.length);
        const optionCount = this.$dropdown[0].options.length + 1;
        const newOption = document.createElement('option');
        newOption.value = optionCount;
        newOption.textContent = `Option ${optionCount}`;
        this.$dropdown[0].appendChild(newOption);
        console.log(`Added option: value=${newOption.value}, text=${newOption.textContent}`);
        this.trigger_up('content_changed');
    },

    _removeOption() {
        console.log("Removing last option. Current count:", this.$dropdown[0].options.length);
        const options = this.$dropdown[0].options;
        if (options.length > 1) {
            const removed = options[options.length - 1];
            removed.remove();
            console.log(`Removed option: value=${removed.value}, text=${removed.textContent}`);
            this.trigger_up('content_changed');
        } else {
            console.warn("Cannot remove option: only one left.");
        }
    },

    _computeVisibility() {
        const visible = this.$dropdown && this.$dropdown.length > 0;
        console.log("Compute visibility → dropdown exists?", visible);
        return visible;
    },
});

console.log("DropdownOptions registered in snippet options registry.");