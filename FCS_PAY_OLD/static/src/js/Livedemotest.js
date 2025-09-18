/** @odoo-module **/

import options from '@web_editor/js/editor/snippets.options';
import { uniqueId } from '@web/core/utils/functions';

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
            containersWrapper: '.containers-wrapper',
        };
        this.selectedOptionIndex = 0;
        this.selectedSubbuttonIndex = -1;
        console.debug('Initialized DropdownOptions with selectors:', this.selectors);
    },

    /**
     * Set up the dropdown, subbuttons, containers, and event listeners.
     */
    async start() {
        try {
            await this._super(...arguments);

            this.$snippet = this.$target.closest(this.selectors.snippet);
            console.debug('Snippet root found:', this.$snippet.length ? 'Yes' : 'No');
            if (!this.$snippet.length) {
                console.error('No snippet root found with selector:', this.selectors.snippet);
                return;
            }

            this.$dropdown = this.$snippet.find(this.selectors.dropdown);
            this.$subbuttonsWrapper = this.$snippet.find(this.selectors.subbuttonsWrapper);
            this.$containersWrapper = this.$snippet.find(this.selectors.containersWrapper);

            console.debug('Dropdown found:', this.$dropdown.length ? 'Yes' : 'No');
            console.debug('Subbuttons wrapper found:', this.$subbuttonsWrapper.length ? 'Yes' : 'No');
            console.debug('Containers wrapper found:', this.$containersWrapper.length ? 'Yes' : 'No');

            if (this.$dropdown.length) {
                const optionsLength = this.$dropdown[0].options.length;
                console.debug('Dropdown options length:', optionsLength);
                if (optionsLength > 0) {
                    this.$dropdown[0].selectedIndex = 0;
                    this.selectedOptionIndex = 0;
                    console.debug('Set initial selectedOptionIndex:', this.selectedOptionIndex);
                }

                this.$dropdown.off('change.dropdownOptions').on('change.dropdownOptions', () => {
                    this.selectedOptionIndex = this.$dropdown[0].selectedIndex;
                    this.selectedSubbuttonIndex = -1;
                    console.debug('Dropdown changed, selectedOptionIndex:', this.selectedOptionIndex, 'selectedSubbuttonIndex:', this.selectedSubbuttonIndex);
                    this._updateEditInput();
                    this._updateSubbuttonDisplay();
                    this._updateSubbuttonSelect();
                    this._updateContainerDisplay();
                });

                // NEW: Reset subbutton selection when focusing/clicking the dropdown to allow returning to main container
                this.$dropdown.off('focus.dropdownOptions').on('focus.dropdownOptions', () => {
                    if (this.selectedSubbuttonIndex >= 0) {
                        console.debug('Dropdown focused, resetting subbutton selection to show main container');
                        this.selectedSubbuttonIndex = -1;
                        this._updateSubbuttonDisplay();
                        this._updateSubbuttonSelect();
                        this._updateContainerDisplay();
                    }
                });

                this._updateEditInput();
                this._updateSubbuttonDisplay();
                this._updateSubbuttonSelect();
                this._updateContainerDisplay();
            } else {
                console.warn('No dropdown found with selector:', this.selectors.dropdown);
            }

            this.$addButton = this.$el.find(this.selectors.addButton);
            if (this.$addButton.length) {
                this.$addButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.debug('Add option button clicked');
                    this.addOption(false);
                });
            } else {
                console.warn('Add option button not found with selector:', this.selectors.addButton);
            }

            this.$removeButton = this.$el.find(this.selectors.removeButton);
            if (this.$removeButton.length) {
                this.$removeButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.debug('Remove option button clicked');
                    this.removeOption(false);
                });
            } else {
                console.warn('Remove option button not found with selector:', this.selectors.removeButton);
            }

            this.$editInput = this.$el.find(this.selectors.editInput).find('input[type="text"]');
            if (this.$editInput.length) {
                this.$editInput.off('input.dropdownOptions').on('input.dropdownOptions', (event) => {
                    const newText = event.currentTarget.value.trim();
                    console.debug('Option input changed, new text:', newText);
                    this._updateOptionText(this.selectedOptionIndex, newText);
                });
            } else {
                console.warn('Edit option input not found with selector:', this.selectors.editInput);
            }

            this.$addSubbuttonButton = this.$el.find(this.selectors.addSubbuttonButton);
            if (this.$addSubbuttonButton.length) {
                this.$addSubbuttonButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.debug('Add subbutton button clicked');
                    this.addSubbutton(false);
                });
            } else {
                console.warn('Add subbutton button not found with selector:', this.selectors.addSubbuttonButton);
            }

            this.$removeSubbuttonButton = this.$el.find(this.selectors.removeSubbuttonButton);
            if (this.$removeSubbuttonButton.length) {
                this.$removeSubbuttonButton.off('click.dropdownOptions').on('click.dropdownOptions', () => {
                    console.debug('Remove subbutton button clicked');
                    this.removeSubbutton(false);
                });
            } else {
                console.warn('Remove subbutton button not found with selector:', this.selectors.removeSubbuttonButton);
            }

            this.$subbuttonSelect = this.$el.find(this.selectors.subbuttonSelect);
            if (this.$subbuttonSelect.length) {
                this.$subbuttonSelect.off('change.dropdownOptions').on('change.dropdownOptions', (ev) => {
                    this.selectedSubbuttonIndex = parseInt(ev.target.value, 10);
                    console.debug('Subbutton select changed, selectedSubbuttonIndex:', this.selectedSubbuttonIndex);
                    this._updateSubbuttonInput();
                    this._updateContainerDisplay();
                });
            } else {
                console.warn('Subbutton select not found with selector:', this.selectors.subbuttonSelect);
            }

            this.$editSubbuttonInput = this.$el.find(this.selectors.editSubbuttonInput).find('input[type="text"]');
            if (this.$editSubbuttonInput.length) {
                this.$editSubbuttonInput.off('input.dropdownOptions').on('input.dropdownOptions', (event) => {
                    const newText = event.currentTarget.value.trim();
                    console.debug('Subbutton input changed, new text:', newText);
                    this._updateSubbuttonText(this.selectedSubbuttonIndex, newText);
                });
            } else {
                console.warn('Edit subbutton input not found with selector:', this.selectors.editSubbuttonInput);
            }

            this.$subbuttonsWrapper.off('click.dropdownOptions').on('click.dropdownOptions', 'button', (ev) => {
                const optionValue = ev.currentTarget.dataset.option;
                const $button = $(ev.currentTarget);
                const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
                const subbuttonIndex = subbuttons.index($button);

                // IMPORTANT: set the selected option index to match the option of the clicked subbutton
                const options = this.$dropdown && this.$dropdown[0] && this.$dropdown[0].options ? this.$dropdown[0].options : [];
                let matchingOptionIndex = -1;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === optionValue) {
                        matchingOptionIndex = i;
                        break;
                    }
                }
                if (matchingOptionIndex >= 0) {
                    this.selectedOptionIndex = matchingOptionIndex;
                    // reflect in actual <select> UI so user sees the change
                    if (this.$dropdown && this.$dropdown[0]) {
                        this.$dropdown[0].selectedIndex = this.selectedOptionIndex;
                    }
                } else {
                    console.warn('Clicked subbutton option value not found in dropdown options:', optionValue);
                }

                this.selectedSubbuttonIndex = subbuttonIndex;
                console.debug('Subbutton clicked, optionValue:', optionValue, 'subbuttonIndex:', subbuttonIndex, 'matchingOptionIndex:', matchingOptionIndex);

                // toggle active class on subbuttons
                this.$subbuttonsWrapper.find('button').removeClass('active');
                $(ev.currentTarget).addClass('active');

                // update UI controls and containers
                this._updateSubbuttonSelect();
                this._updateSubbuttonInput();
                this._updateContainerDisplay();

                // fallback: ensure the editor selects the active container so config buttons appear
                try {
                    const $container = this.$containersWrapper.children(
                        `.option-container[data-option="${optionValue}"][data-subbutton="${subbuttonIndex}"]`
                    );
                    if ($container && $container.length) {
                        const $inner = $container.find('.oe_structure').first();
                        if ($inner && $inner.length) {
                            $inner.trigger('click');
                            console.debug('Triggered click on container inner .oe_structure to force editor selection.');
                        } else {
                            $container.trigger('click');
                            console.debug('Triggered click on container as fallback to force editor selection.');
                        }
                    } else {
                        // If there was no subbutton-specific container, try the no-subbutton container
                        const $fallback = this.$containersWrapper.children(`.option-container[data-option="${optionValue}"]:not([data-subbutton])`);
                        if ($fallback && $fallback.length) {
                            $fallback.trigger('click');
                            console.debug('Triggered click on fallback option container to force editor selection.');
                        }
                    }
                } catch (err) {
                    console.warn('Error while trying to force editor selection on subbutton click:', err);
                }
            });

        } catch (error) {
            console.error('Error in start method:', error);
            throw error;
        }
    },

    //--------------------------------------------------------------------------
    // Action Methods
    //--------------------------------------------------------------------------

    async addOption(previewMode) {
        if (previewMode || previewMode === 'reset') {
            console.debug('addOption skipped: previewMode or reset');
            return;
        }
        if (!this.$dropdown || !this.$dropdown.length || !this.$containersWrapper || !this.$containersWrapper.length) {
            console.error('No dropdown or containers wrapper found → cannot add option.');
            return;
        }

        console.debug('Adding new option, current selectedOptionIndex:', this.selectedOptionIndex);
        this._addOption();
        this._updateEditInput();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        this._updateContainerDisplay();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    async removeOption(previewMode) {
        if (previewMode || previewMode === 'reset') {
            console.debug('removeOption skipped: previewMode or reset');
            return;
        }
        if (!this.$dropdown || !this.$dropdown.length || !this.$containersWrapper || !this.$containersWrapper.length) {
            console.error('No dropdown or containers wrapper found → cannot remove option.');
            return;
        }

        console.debug('Removing option, current selectedOptionIndex:', this.selectedOptionIndex);
        this._removeOption();
        this._updateEditInput();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        this._updateContainerDisplay();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    async addSubbutton(previewMode) {
        if (previewMode || previewMode === 'reset') {
            console.debug('addSubbutton skipped: previewMode or reset');
            return;
        }
        if (!this.$dropdown || !this.$dropdown.length || !this.$subbuttonsWrapper || !this.$subbuttonsWrapper.length || !this.$containersWrapper || !this.$containersWrapper.length) {
            console.error('No dropdown, subbuttons wrapper, or containers wrapper found → cannot add subbutton.');
            return;
        }

        console.debug('Adding subbutton, current selectedOptionIndex:', this.selectedOptionIndex);
        this._addSubbutton();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        this._updateSubbuttonInput();
        this._updateContainerDisplay();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    async removeSubbutton(previewMode) {
        if (previewMode || previewMode === 'reset') {
            console.debug('removeSubbutton skipped: previewMode or reset');
            return;
        }
        if (!this.$dropdown || !this.$dropdown.length || !this.$subbuttonsWrapper || !this.$subbuttonsWrapper.length || !this.$containersWrapper || !this.$containersWrapper.length) {
            console.error('No dropdown, subbuttons wrapper, or containers wrapper found → cannot remove subbutton.');
            return;
        }

        console.debug('Removing subbutton, current selectedSubbuttonIndex:', this.selectedSubbuttonIndex);
        this._removeSubbutton();
        this._updateSubbuttonDisplay();
        this._updateSubbuttonSelect();
        this._updateSubbuttonInput();
        this._updateContainerDisplay();
        if (this.options.wysiwyg?.odooEditor) {
            this.options.wysiwyg.odooEditor.historyStep();
        }
    },

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    _createContainer(optionValue, subbuttonIndex, content = '') {
        const $container = $('<div>').addClass('option-container').attr('data-option', optionValue);
        if (subbuttonIndex !== undefined) {
            $container.attr('data-subbutton', subbuttonIndex);
        }
        $container.attr('id', uniqueId('container_'));
        if (content) {
            $container.html(content);
        } else {
            $container.append('<div class="oe_structure"></div>');
        }
        this.$containersWrapper.append($container);
        console.debug('Created container for option:', optionValue, 'subbutton:', subbuttonIndex, 'id:', $container.attr('id'), 'content:', $container.html());
        if (this.options.wysiwyg) {
            this.options.wysiwyg.odooEditor.observerUnactive();
            this.trigger_up('content_changed', { $target: $container });
            this.options.wysiwyg.odooEditor.observerActive();
        }
        return $container;
    },

    _addOption() {
        const options = this.$dropdown[0].options;
        const optionCount = options.length + 1;
        const newOptionValue = uniqueId('opt_');
        const newOption = document.createElement('option');
        newOption.value = newOptionValue;
        newOption.textContent = `Option ${optionCount}`;
        this.$dropdown[0].appendChild(newOption);

        // options is a live collection; after appendChild, options.length is the new length.
        // The newly added option's index is options.length - 1.
        const newIndex = options.length - 1;
        this.selectedOptionIndex = newIndex;
        this.$dropdown[0].selectedIndex = this.selectedOptionIndex;

        this._createContainer(newOptionValue);
        console.debug('Added option:', newOption.textContent, 'value:', newOptionValue, 'at index:', this.selectedOptionIndex);
        this.trigger_up('content_changed');
    },

    _removeOption() {
        const options = this.$dropdown[0].options;
        if (options.length > 1 && this.selectedOptionIndex >= 0) {
            const removed = options[this.selectedOptionIndex];
            const optionValue = removed.value;
            removed.remove();
            this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`).remove();
            this.$containersWrapper.find(`.option-container[data-option="${optionValue}"]`).remove();
            console.debug('Removed option:', removed.textContent, 'value:', optionValue, 'at index:', this.selectedOptionIndex);
            if (this.selectedOptionIndex >= options.length) {
                this.selectedOptionIndex = options.length - 1;
            }
            this.$dropdown[0].selectedIndex = this.selectedOptionIndex;
            console.debug('Updated selectedOptionIndex after removal:', this.selectedOptionIndex);
            this.trigger_up('content_changed');
        } else {
            console.warn('Cannot remove option: only one left or invalid index.');
        }
    },

    _updateOptionText(index, newText) {
        console.debug('Updating option at index:', index, 'with text:', newText);
        if (!newText) {
            console.warn('Empty text, skipping option update');
            return;
        }
        const option = this.$dropdown[0].options[index];
        if (option) {
            option.textContent = newText;
            console.debug('Updated option text to:', option.textContent);
            this._updateSubbuttonDisplay();
            this._updateSubbuttonSelect();
            this._updateContainerDisplay();
            this.trigger_up('content_changed');
            if (this.options.wysiwyg?.odooEditor) {
                this.options.wysiwyg.odooEditor.historyStep();
            }
        } else {
            console.error('Option at index', index, 'not found.');
        }
    },

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
        newSubbutton.setAttribute('data-subbutton', subbuttonCount - 1);
        newSubbutton.textContent = `Button ${subbuttonCount}`;
        this.$subbuttonsWrapper[0].appendChild(newSubbutton);
        this.selectedSubbuttonIndex = subbuttonCount - 1;
        console.debug('Adding subbutton for option:', optionValue, 'subbutton index:', subbuttonCount - 1);
        this._createContainer(optionValue, subbuttonCount - 1, '');
        console.debug('Added subbutton:', newSubbutton.textContent, 'for option:', optionValue, 'index:', this.selectedSubbuttonIndex);
        this.trigger_up('content_changed');
    },

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
            const removedIndex = parseInt(removed.dataset.subbutton, 10);
            const $removedContainer = this.$containersWrapper.find(`.option-container[data-option="${optionValue}"][data-subbutton="${removedIndex}"]`);
            console.debug('Removing subbutton for option:', optionValue, 'subbutton index:', removedIndex);
            removed.remove();
            $removedContainer.remove();
            console.debug('Removed subbutton:', removed.textContent, 'for option:', optionValue, 'subbutton index:', removedIndex);
            // Since the original option container always exists, no need to recreate it after removing the last subbutton
            // Set selected to the last remaining subbutton index (or -1 if none left)
            this.selectedSubbuttonIndex = subbuttons.length > 0 ? subbuttons.length - 1 : -1;
            console.debug('Updated selectedSubbuttonIndex after removal:', this.selectedSubbuttonIndex);
            this.trigger_up('content_changed');
        } else {
            console.warn('No subbuttons to remove or invalid index.');
        }
    },

    _updateSubbuttonText(index, newText) {
        if (index < 0) {
            console.warn('No subbutton selected to update.');
            return;
        }
        console.debug('Updating subbutton at index:', index, 'with text:', newText);
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
            console.debug('Updated subbutton text to:', subbutton.textContent);
            this._updateSubbuttonSelect();
            this._updateContainerDisplay();
            this.trigger_up('content_changed');
            if (this.options.wysiwyg?.odooEditor) {
                this.options.wysiwyg.odooEditor.historyStep();
            }
        } else {
            console.error('Subbutton at index', index, 'not found for option:', optionValue);
        }
    },

    _updateSubbuttonDisplay() {
        if (!this.$subbuttonsWrapper || !this.$subbuttonsWrapper.length) {
            console.warn('No subbuttons wrapper found.');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        const optionValue = selectedOption ? selectedOption.value : '';
        this.$subbuttonsWrapper.find('button').hide().removeClass('active');
        const $subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        $subbuttons.show();
        console.debug('Subbuttons found for option:', optionValue, 'count:', $subbuttons.length);
        if ($subbuttons.length > 0 && this.selectedSubbuttonIndex >= 0 && this.selectedSubbuttonIndex < $subbuttons.length) {
            $subbuttons.eq(this.selectedSubbuttonIndex).addClass('active');
            console.debug('Set active subbutton at index:', this.selectedSubbuttonIndex);
        }
        console.debug('Updated subbutton display for option:', optionValue);
    },

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
        console.debug('Updating subbutton select, subbuttons count:', subbuttons.length);
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
        console.debug('Updated subbutton select with', subbuttons.length, 'options, selectedValue:', selectedValue);
    },

    _updateSubbuttonInput() {
        if (!this.$editSubbuttonInput || !this.$editSubbuttonInput.length) {
            console.warn('No edit subbutton input found.');
            return;
        }
        if (this.selectedSubbuttonIndex < 0) {
            this.$editSubbuttonInput.val('');
            console.debug('No subbutton selected, cleared editSubbuttonInput');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        if (!selectedOption) {
            this.$editSubbuttonInput.val('');
            console.debug('No selected option, cleared editSubbuttonInput');
            return;
        }
        const optionValue = selectedOption.value;
        const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        const subbutton = subbuttons[this.selectedSubbuttonIndex];
        const currentText = subbutton ? subbutton.textContent : '';
        this.$editSubbuttonInput.val(currentText);
        console.debug('Updated subbutton input with text:', currentText, 'for index:', this.selectedSubbuttonIndex);
    },

    _updateEditInput() {
        if (!this.$editInput || !this.$editInput.length) {
            console.warn('No edit input found.');
            return;
        }
        const option = this.$dropdown[0].options[this.selectedOptionIndex];
        const currentText = option ? option.textContent : '';
        this.$editInput.val(currentText);
        console.debug('Updated edit input with text:', currentText, 'for index:', this.selectedOptionIndex);
    },

    _updateContainerDisplay() {
        if (!this.$containersWrapper || !this.$containersWrapper.length) {
            console.warn('No containers wrapper found.');
            return;
        }
        const selectedOption = this.$dropdown[0].options[this.selectedOptionIndex];
        const optionValue = selectedOption ? selectedOption.value : '';
        console.debug('Updating container display, selectedOptionIndex:', this.selectedOptionIndex, 'optionValue:', optionValue, 'selectedSubbuttonIndex:', this.selectedSubbuttonIndex);

        const allContainers = this.$containersWrapper.children('.option-container');
        console.debug('All containers count:', allContainers.length);
        allContainers.each((index, container) => {
            console.debug(`Container ${index}: data-option=${container.dataset.option}, data-subbutton=${container.dataset.subbutton || 'none'}, content=${container.innerHTML}`);
        });

        allContainers.removeClass('active');
        console.debug('Removed active class from all containers');

        const subbuttons = this.$subbuttonsWrapper.find(`button[data-option="${optionValue}"]`);
        console.debug('Subbuttons for option:', optionValue, 'count:', subbuttons.length);

        if (subbuttons.length > 0 && this.selectedSubbuttonIndex >= 0 && this.selectedSubbuttonIndex < subbuttons.length) {
            const subbuttonIndex = subbuttons.eq(this.selectedSubbuttonIndex).data('subbutton');
            console.debug('Looking for subbutton container, subbuttonIndex:', subbuttonIndex);
            const $container = this.$containersWrapper.children(`.option-container[data-option="${optionValue}"][data-subbutton="${subbuttonIndex}"]`);
            console.debug('Subbutton container found:', $container.length ? 'Yes' : 'No', 'selector:', `.option-container[data-option="${optionValue}"][data-subbutton="${subbuttonIndex}"]`);
            if ($container.length) {
                $container.addClass('active');
                console.debug('Activated subbutton container for option:', optionValue, 'subbutton:', subbuttonIndex, 'content:', $container.html());
                if (this.options.wysiwyg) {
                    this.options.wysiwyg.odooEditor.observerUnactive();
                    this.trigger_up('content_changed', { $target: $container });
                    this.options.wysiwyg.odooEditor.observerActive();
                    this.options.wysiwyg.odooEditor.historyStep();
                }
            } else {
                console.error('Subbutton container not found for option:', optionValue, 'subbutton:', subbuttonIndex);
            }
        } else {
            const $container = this.$containersWrapper.children(`.option-container[data-option="${optionValue}"]:not([data-subbutton])`);
            console.debug('Looking for option container, selector:', `.option-container[data-option="${optionValue}"]:not([data-subbutton])`);
            console.debug('Option container found:', $container.length ? 'Yes' : 'No');
            if ($container.length) {
                $container.addClass('active');
                console.debug('Activated option container for option:', optionValue, 'content:', $container.html());
                if (this.options.wysiwyg) {
                    this.options.wysiwyg.odooEditor.observerUnactive();
                    this.trigger_up('content_changed', { $target: $container });
                    this.options.wysiwyg.odooEditor.observerActive();
                    this.options.wysiwyg.odooEditor.historyStep();
                }
            } else {
                console.error('Option container not found for option:', optionValue);
            }
        }
        // Ensure option_1 content is preserved
        if (optionValue !== 'option_1') {
            const $option1Container = this.$containersWrapper.find(`.option-container[data-option="option_1"]:not([data-subbutton])`);
            if ($option1Container.length && !$option1Container.html()) {
                $option1Container.html('<div class="oe_structure"></div>');
                console.debug('Restored empty content for option_1');
            }
        }
    },

    _computeVisibility() {
        const isVisible = this.$dropdown && this.$dropdown.length > 0;
        console.debug('Computed visibility:', isVisible);
        return isVisible;
    },
});