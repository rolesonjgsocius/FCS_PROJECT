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
            snippet: '.o_custom_dropdown_snippet',
            dropdown: '.custom-dropdown',
            addButton: '.add-option-btn',
            removeButton: '.remove-option-btn',
            editInput: '.edit-option-input',
            subbuttonsWrapper: '.subbuttons-wrapper',
            addSubbuttonButton: '.add-subbutton-btn',
            removeSubbuttonButton: '.remove-subbutton-btn',
            subbuttonSelect: '.subbutton-select',
            editSubbuttonInput: '.edit-subbutton-input',
        };
        this.selectedOptionIndex = 0; // Track the currently selected dropdown option
        this.selectedSubbuttonIndex = -1; // Track the currently selected subbutton, default to -1 (none)
    },

    /**
     * Set up the dropdown, subbuttons, and event listeners.
     */
    async start() {
        try {
            await this._super(...arguments);

            // Ensure $target is the snippet root
            this.$snippet = this.$target.closest(this.selectors.snippet);
            if (!this.$snippet.length) {
                console.error('No snippet root found with selector:', this.selectors.snippet);
                return;
            }

            this.$dropdown = this.$snippet.find(this.selectors.dropdown);
            this.$subbuttonsWrapper = this.$snippet.find(this.selectors.subbuttonsWrapper);

            console.log('Snippet root:', this.$snippet);
            console.log('Dropdown:', this.$dropdown);
            console.log('Subbuttons wrapper:', this.$subbuttonsWrapper);

            if (this.$dropdown.length) {
                // Default to the last dropdown option
                const optionsLength = this.$dropdown[0].options.length;
                if (optionsLength > 0) {
                    this.$dropdown[0].selectedIndex = optionsLength - 1;
                    this.selectedOptionIndex = this.$dropdown[0].selectedIndex;
                }

                // Bind change event to track selected option and update subbuttons
                this.$dropdown.off('change.dropdownOptions').on('change.dropdownOptions', () => {
                    this.selectedOptionIndex = this.$dropdown[0].selectedIndex;
                    console.log('Dropdown changed, selected index:', this.selectedOptionIndex);
                    this._updateEditInput();
                    this._updateSubbuttonDisplay();
                    this._updateSubbuttonSelect();
                });
                // Initial update of edit input and subbutton display
                this._updateEditInput();
                this._updateSubbuttonDisplay();
                this._updateSubbuttonSelect();
            } else {
                console.warn('No dropdown found with selector:', this.selectors.dropdown);
            }

            // Attach event listeners to buttons and inputs
            this.$addButton = this.$el.find(this.selectors.addButton);
            if (this.$addButton.length) {
                this.$addButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.log('Add option button clicked');
                    this.addOption(false);
                });
            } else {
                console.warn('Add option button not found with selector:', this.selectors.addButton);
            }

            this.$removeButton = this.$el.find(this.selectors.removeButton);
            if (this.$removeButton.length) {
                this.$removeButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.log('Remove option button clicked');
                    this.removeOption(false);
                });
            } else {
                console.warn('Remove option button not found with selector:', this.selectors.removeButton);
            }

            this.$editInput = this.$el.find(this.selectors.editInput).find('input[type="text"]');
            if (this.$editInput.length) {
                this.$editInput.off('input.dropdownOptions').on('input.dropdownOptions', (event) => {
                    const newText = event.currentTarget.value.trim();
                    console.log('Option input changed, new text:', newText);
                    this._updateOptionText(this.selectedOptionIndex, newText);
                });
            } else {
                console.warn('Edit option input not found with selector:', this.selectors.editInput);
            }

            this.$addSubbuttonButton = this.$el.find(this.selectors.addSubbuttonButton);
            if (this.$addSubbuttonButton.length) {
                this.$addSubbuttonButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.log('Add subbutton button clicked');
                    this.addSubbutton(false);
                });
            } else {
                console.warn('Add subbutton button not found with selector:', this.selectors.addSubbuttonButton);
            }

            this.$removeSubbuttonButton = this.$el.find(this.selectors.removeSubbuttonButton);
            if (this.$removeSubbuttonButton.length) {
                this.$removeSubbuttonButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.log('Remove subbutton button clicked');
                    this.removeSubbutton(false);
                });
            } else {
                console.warn('Remove subbutton button not found with selector:', this.selectors.removeSubbuttonButton);
            }

            this.$subbuttonSelect = this.$el.find(this.selectors.subbuttonSelect);
            if (this.$subbuttonSelect.length) {
                this.$subbuttonSelect.off('change.dropdownOptions').on('change.dropdownOptions', (ev) => {
                    this.selectedSubbuttonIndex = parseInt(ev.target.value, 10);
                    this._updateSubbuttonInput();
                });
            } else {
                console.warn('Subbutton select not found with selector:', this.selectors.subbuttonSelect);
            }

            this.$editSubbuttonInput = this.$el.find(this.selectors.editSubbuttonInput).find('input[type="text"]');
            if (this.$editSubbuttonInput.length) {
                this.$editSubbuttonInput.off('input.dropdownOptions').on('input.dropdownOptions', (event) => {
                    const newText = event.currentTarget.value.trim();
                    console.log('Subbutton input changed, new text:', newText);
                    this._updateSubbuttonText(this.selectedSubbuttonIndex, newText);
                });
            } else {
                console.warn('Edit subbutton input not found with selector:', this.selectors.editSubbuttonInput);
            }
        } catch (error) {
            console.error('Error in start method:', error);
            throw error;
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
        if (!this.$dropdown || !this.$dropdown.length) {
            console.error('No dropdown found → cannot add option.');
            return;
        }

        this._addOption();
        this._updateEditInput();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
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
        if (!this.$dropdown || !this.$dropdown.length) {
            console.error('No dropdown found → cannot remove option.');
            return;
        }

        this._removeOption();
        this._updateEditInput();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    /**
     * Add a new subbutton for the selected dropdown option.
     * @param {Boolean} previewMode - Whether in preview mode.
     */
    async addSubbutton(previewMode) {
        if (previewMode || previewMode === 'reset') {
            return;
        }
        if (!this.$dropdown || !this.$dropdown.length || !this.$subbuttonsWrapper || !this.$subbuttonsWrapper.length) {
            console.error('No dropdown or subbuttons wrapper found → cannot add subbutton.');
            return;
        }

        this._addSubbutton();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        this._updateSubbuttonInput();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    /**
     * Remove the selected subbutton for the selected dropdown option.
     * @param {Boolean} previewMode - Whether in preview mode.
     */
    async removeSubbutton(previewMode) {
        if (previewMode || previewMode === 'reset') {
            return;
        }
        if (!this.$dropdown || !this.$dropdown.length || !this.$subbuttonsWrapper || !this.$subbuttonsWrapper.length) {
            console.error('No dropdown or subbuttons wrapper found → cannot remove subbutton.');
            return;
        }

        this._removeSubbutton();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        this._updateSubbuttonInput();
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
        const reference = options[this.selectedOptionIndex + 1] || null;
        this.$dropdown[0].insertBefore(newOption, reference);
        this.selectedOptionIndex += 1;
        this.$dropdown[0].selectedIndex = this.selectedOptionIndex;
        console.log('Added option:', newOption.textContent, 'at index:', this.selectedOptionIndex);
        this.trigger_up('content_changed');
    },

    /**
     * Remove the selected option and its subbuttons.
     * @private
     */
    _removeOption() {
        const options = this.$dropdown[0].options;
        if (options.length > 1 && this.selectedOptionIndex >= 0) {
            const removed = options[this.selectedOptionIndex];
            const optionValue = removed.value;
            removed.remove();
            // Remove associated subbuttons
            this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`).remove();
            console.log('Removed option:', removed.textContent, 'at index:', this.selectedOptionIndex);
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
            console.warn('Empty text, skipping option update');
            return;
        }
        const option = this.$dropdown[0].options[index];
        if (option) {
            const oldValue = option.value;
            option.textContent = newText;
            option.value = newText.replace(/\s+/g, '_').toLowerCase(); // Update value
            // Update subbutton data-option attributes
            this.$subbuttonsWrapper.find(`button[data-option="${oldValue}"]`).attr('data-option', option.value);
            console.log('Updated option text to:', option.textContent);
            this._updateSubbuttonDisplay();
            this._updateSubbuttonSelect();
            this.trigger_up('content_changed');
            if (this.options.wysiwyg?.odooEditor) {
                this.options.wysiwyg.odooEditor.historyStep();
            }
        } else {
            console.error('Option at index', index, 'not found.');
        }
    },

    /**
     * Add a new subbutton for the selected dropdown option.
     * @private
     */
    _addSubbutton() {
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        if (!selectedOption) {
            console.error('No selected option → cannot add subbutton.');
            return;
        }
        const optionValue = selectedOption.value;
        const subbuttonCount = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`).length + 1;
        const newSubbutton = document.createElement('button');
        newSubbutton.setAttribute('data-option', optionValue);
        newSubbutton.textContent = `Button ${subbuttonCount}`;
        this.$subbuttonsWrapper[0].appendChild(newSubbutton);
        this.selectedSubbuttonIndex = subbuttonCount - 1;
        console.log('Added subbutton:', newSubbutton.textContent, 'for option:', optionValue);
        this.trigger_up('content_changed');
    },

    /**
     * Remove the selected subbutton for the selected dropdown option.
     * @private
     */
    _removeSubbutton() {
        if (this.selectedSubbuttonIndex < 0) {
            console.warn('No subbutton selected to remove.');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        if (!selectedOption) {
            console.error('No selected option → cannot remove subbutton.');
            return;
        }
        const optionValue = selectedOption.value;
        const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        if (subbuttons.length > 0 && this.selectedSubbuttonIndex >= 0) {
            const removed = subbuttons[this.selectedSubbuttonIndex];
            removed.remove();
            console.log('Removed subbutton:', removed.textContent, 'for option:', optionValue);
            if (this.selectedSubbuttonIndex >= subbuttons.length - 1) {
                this.selectedSubbuttonIndex = subbuttons.length - 2;
            }
            this.trigger_up('content_changed');
        } else {
            console.warn('No subbuttons to remove or invalid index.');
        }
    },

    /**
     * Update the text of the selected subbutton.
     * @private
     * @param {Number} index - Index of the subbutton to update.
     * @param {String} newText - New text for the subbutton.
     */
    _updateSubbuttonText(index, newText) {
        if (index < 0) {
            console.warn('No subbutton selected to update.');
            return;
        }
        console.log('Updating subbutton at index:', index, 'with text:', newText);
        if (!newText) {
            console.warn('Empty text, skipping subbutton update');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        if (!selectedOption) {
            console.error('No selected option → cannot update subbutton.');
            return;
        }
        const optionValue = selectedOption.value;
        const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        const subbutton = subbuttons[index];
        if (subbutton) {
            subbutton.textContent = newText;
            console.log('Updated subbutton text to:', subbutton.textContent);
            this.trigger_up('content_changed');
            if (this.options.wysiwyg?.odooEditor) {
                this.options.wysiwyg.odooEditor.historyStep();
            }
        } else {
            console.error('Subbutton at index', index, 'not found for option:', optionValue);
        }
    },

    /**
     * Update the display of subbuttons based on the selected dropdown option.
     * @private
     */
    _updateSubbuttonDisplay() {
        if (!this.$subbuttonsWrapper || !this.$subbuttonsWrapper.length) {
            console.warn('No subbuttons wrapper found.');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        const optionValue = selectedOption ? selectedOption.value : '';
        this.$subbuttonsWrapper.find('button').hide();
        this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`).show();
        console.log('Updated subbutton display for option:', optionValue);
    },

    /**
     * Update the subbutton select dropdown in the editor.
     * @private
     */
    _updateSubbuttonSelect() {
        if (!this.$subbuttonSelect || !this.$subbuttonSelect.length) {
            console.warn('No subbutton select found, skipping update.');
            return;
        }
        this.$subbuttonSelect.empty();
        this.$subbuttonSelect.append('<option value="-1">Select a subbutton</option>');
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        const optionValue = selectedOption ? selectedOption.value : '';
        const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        subbuttons.each((index, subbutton) => {
            this.$subbuttonSelect.append(`<option value="${index}">${subbutton.textContent}</option>`);
        });
        let selectedValue = -1;
        if (subbuttons.length > 0 && this.selectedSubbuttonIndex >= 0 && this.selectedSubbuttonIndex < subbuttons.length) {
            selectedValue = this.selectedSubbuttonIndex;
        } else {
            this.selectedSubbuttonIndex = -1;
        }
        this.$subbuttonSelect.val(selectedValue);
        console.log('Updated subbutton select with', subbuttons.length, 'options');
    },

    /**
     * Update the edit subbutton input field with the selected subbutton's text.
     * @private
     */
    _updateSubbuttonInput() {
        if (!this.$editSubbuttonInput || !this.$editSubbuttonInput.length) {
            console.warn('No edit subbutton input found.');
            return;
        }
        if (this.selectedSubbuttonIndex < 0) {
            this.$editSubbuttonInput.val('');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        if (!selectedOption) {
            this.$editSubbuttonInput.val('');
            return;
        }
        const optionValue = selectedOption.value;
        const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        const subbutton = subbuttons[this.selectedSubbuttonIndex];
        const currentText = subbutton ? subbutton.textContent : '';
        this.$editSubbuttonInput.val(currentText);
        console.log('Updated subbutton input with text:', currentText, 'for index:', this.selectedSubbuttonIndex);
    },

    /**
     * Update the edit input field with the selected option's text.
     * @private
     */
    _updateEditInput() {
        if (!this.$editInput || !this.$editInput.length) {
            console.warn('No edit input found.');
            return;
        }
        const option = this.$dropdown[0].options[this.selectedOptionIndex];
        const currentText = option ? option.textContent : '';
        this.$editInput.val(currentText);
        console.log('Updated edit input with text:', currentText, 'for index:', this.selectedOptionIndex);
    },

    /**
     * Compute visibility of the snippet options.
     * @private
     */
    _computeVisibility() {
        return this.$dropdown && this.$dropdown.length > 0;
    },
});