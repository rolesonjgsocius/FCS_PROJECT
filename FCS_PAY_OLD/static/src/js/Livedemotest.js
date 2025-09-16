/** @odoo-module **/

import options from '@web_editor/js/editor/snippets.options';

const { SnippetOptionWidget, registry: snippetOptionRegistry } = options || {};

if (!SnippetOptionWidget || !snippetOptionRegistry) {
    console.error('Failed to load SnippetOptionWidget or snippetOptionRegistry from @web_editor/js/editor/snippets.options');
    throw new Error('Required dependencies are not available');
}

snippetOptionRegistry['DropdownOptions'] = SnippetOptionWidget.extend({
    /**
     * Initialize the snippet with selectors and default index.
     */
    init() {
        this._super(...arguments);
        this.selectors = {
            dropdown: '.custom-dropdown',
            addButton: '.add-option-btn',
            removeButton: '.remove-option-btn',
            editInput: '.edit-option-input',
        };
        this.selectedOptionIndex = 0; // Track the currently selected option
    },

    /**
     * Set up the dropdown and event listeners.
     */
    async start() {
        await this._super(...arguments);

        this.$dropdown = this.$target.is(this.selectors.dropdown)
            ? this.$target
            : this.$target.find(this.selectors.dropdown);

        if (this.$dropdown.length) {
            // Default to the last option
            const optionsLength = this.$dropdown[0].options.length;
            if (optionsLength > 0) {
                this.$dropdown[0].selectedIndex = optionsLength - 1;
                this.selectedOptionIndex = this.$dropdown[0].selectedIndex;
            }

            // Bind change event to track selected option and update edit input
            this.$dropdown.off('change.dropdownOptions').on('change.dropdownOptions', () => {
                this.selectedOptionIndex = this.$dropdown[0].selectedIndex;
                console.log('Dropdown changed, selected index:', this.selectedOptionIndex);
                this._updateEditInput();
            });
            // Initial update of edit input field
            this._updateEditInput();
        } else {
            console.warn('No dropdown found with selector:', this.selectors.dropdown);
        }

        // Attach event listeners to buttons and input
        this.$addButton = this.$el.find(this.selectors.addButton);
        if (this.$addButton.length) {
            this.$addButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                console.log('Add button clicked for selected option');
                this.addOption(false);
            });
        } else {
            console.warn('Add button not found with selector:', this.selectors.addButton);
        }

        this.$removeButton = this.$el.find(this.selectors.removeButton);
        if (this.$removeButton.length) {
            this.$removeButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                console.log('Remove button clicked for selected option');
                this.removeOption(false);
            });
        } else {
            console.warn('Remove button not found with selector:', this.selectors.removeButton);
        }

        this.$editInput = this.$el.find(this.selectors.editInput).find('input[type="text"]');
        if (this.$editInput.length) {
            this.$editInput.off('input.dropdownOptions').on('input.dropdownOptions', (event) => {
                const newText = event.currentTarget.value.trim();
                console.log('Input changed, new text:', newText);
                this._updateOptionText(this.selectedOptionIndex, newText);
            });
        } else {
            console.warn('Edit input not found with selector:', this.selectors.editInput);
        }
    },

    //--------------------------------------------------------------------------
    // Action Methods
    //--------------------------------------------------------------------------

    /**
     * Add a new option to the dropdown.
     * @param {Boolean} previewMode - Whether in preview mode.
     */
    async addOption(previewMode) {
        if (previewMode || previewMode === 'reset') {
            return;
        }
        if (!this.$dropdown.length) {
            console.error('No dropdown found → cannot add option.');
            return;
        }

        this._addOption();
        this._updateEditInput();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    /**
     * Remove the selected option from the dropdown.
     * @param {Boolean} previewMode - Whether in preview mode.
     */
    async removeOption(previewMode) {
        if (previewMode || previewMode === 'reset') {
            return;
        }
        if (!this.$dropdown.length) {
            console.error('No dropdown found → cannot remove option.');
            return;
        }

        this._removeOption();
        this._updateEditInput();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Add a new option to the dropdown.
     * @private
     */
    _addOption() {
        const options = this.$dropdown[0].options;
        const newOption = document.createElement('option');
        const optionCount = options.length + 1;
        newOption.value = `option_${optionCount}`;
        newOption.textContent = `Option ${optionCount}`;
        // Insert the new option after the currently selected option
        const reference = options[this.selectedOptionIndex + 1] || null;
        this.$dropdown[0].insertBefore(newOption, reference);
        this.selectedOptionIndex += 1; // Select the new option
        this.$dropdown[0].selectedIndex = this.selectedOptionIndex;
        console.log('Added option:', newOption.textContent, 'at index:', this.selectedOptionIndex);
        this.trigger_up('content_changed');
    },

    /**
     * Remove the selected option from the dropdown.
     * @private
     */
    _removeOption() {
        const options = this.$dropdown[0].options;
        if (options.length > 1 && this.selectedOptionIndex >= 0) {
            const removed = options[this.selectedOptionIndex];
            removed.remove();
            console.log('Removed option:', removed.textContent, 'at index:', this.selectedOptionIndex);
            // Adjust selected index
            if (this.selectedOptionIndex >= options.length) {
                this.selectedOptionIndex = options.length - 1;
            }
            this.$dropdown[0].selectedIndex = this.selectedOptionIndex;
            this.trigger_up('content_changed');
        } else {
            console.warn('Cannot remove option: only one left or invalid index.');
        }
    },

    /**
     * Update the text of the selected option.
     * @private
     * @param {Number} index - Index of the option to update.
     * @param {String} newText - New text for the option.
     */
    _updateOptionText(index, newText) {
        console.log('Updating option at index:', index, 'with text:', newText);
        if (!newText) {
            console.warn('Empty text, skipping update');
            return; // Don't update if input is empty
        }
        const option = this.$dropdown[0].options[index];
        if (option) {
            option.textContent = newText;
            option.value = newText; // Update value to keep consistency
            console.log('Updated option text to:', option.textContent);
            this.trigger_up('content_changed');
            if (this.options.wysiwyg?.odooEditor) {
                this.options.wysiwyg.odooEditor.historyStep();
            }
        } else {
            console.error('Option at index', index, 'not found.');
        }
    },

    /**
     * Update the edit input field with the selected option's text.
     * @private
     */
    _updateEditInput() {
        if (this.$editInput && this.$editInput.length) {
            const option = this.$dropdown[0].options[this.selectedOptionIndex];
            const currentText = option ? option.textContent : '';
            this.$editInput.val(currentText);
            console.log('Updated edit input with text:', currentText, 'for index:', this.selectedOptionIndex);
        }
    },

    /**
     * Compute visibility of the snippet options.
     * @private
     */
    _computeVisibility() {
        return this.$dropdown && this.$dropdown.length > 0;
    },
});