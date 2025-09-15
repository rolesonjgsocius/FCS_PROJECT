/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.homeJs = publicWidget.Widget.extend({
    selector: '.landng_fcs',
    events: {
        'click .category-accordion .drop_active': '_onAccordionItemClick',
        'click #static_menu .drop_active': '_onStaticMenuItemClick',
        'click #subcategory-grid .grid-item.drop_active': '_onGridItemClick',
        'click .buy-now-btn': '_onBuyNowButtonClick',
        'click .breadcrumb-item a': '_onBreadcrumbClick',
        'click #ldemo_id .drop_active': '_onSolutionConfClick',
    },

    start: function () {
        const self = this;
        return this._super.apply(this, arguments).then(async () => {
            self.$el.on('website:save oe:save content_changed', () => self._onEditorSave());
            $(document).on('website:save oe:save content_changed', () => {
                self._onEditorSave();
            });
            self._monitorEditorChanges();
            self._initializeDisplayHandler();
            self._initializeGridHandler();
            await self._fetchCategoryData();
        });
    },

    _monitorEditorChanges: function () {
        const isEditorMode = this.$el.closest('.o_editable').length > 0 || $('body').hasClass('editor_enable');
        if (isEditorMode) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'subtree') {
                        this._onEditorSave();
                    }
                });
            });
            const $rowContainer = this.$('#dis_div');
            if ($rowContainer.length) {
                observer.observe($rowContainer[0], { childList: true, subtree: true, characterData: true });
            } else {
                console.log('dis_div');
            }
        }
    },

    async _fetchCategoryData() {
        try {
            const categories = await window.categoryDataPromise;
            this.categories = categories;

            if (this.categories && this.categories.parent_categories && this.categories.parent_categories.length) {
                this.$target.find('.category-container').html(
                    `<div>Loaded ${this.categories.parent_categories.length} categories</div>`
                );

                // Recursive function to process featured images for a category and its children
                const processFeaturedImages = (category) => {
                    if (category.featured_images_ids) {
                        category.featured_images = category.featured_images_ids.map(id => `/web/image/ir.attachment/${id}/datas`);
                        console.log(`Processed featured_images for category ${category.id}:`, category.featured_images);
                    } else {
                        category.featured_images = [];
                        console.log(`No featured_images_ids for category ${category.id}`);
                    }
                    if (category.children) {
                        category.children.forEach(child => {
                            processFeaturedImages(child); // Recursively process children
                        });
                    }
                };

                this.categories.parent_categories.forEach(category => {
                    console.log('Processing category:', category.id, category.name);
                    processFeaturedImages(category);
                });
            } else {
                console.warn('No categories found in home.js');
                this.$target.find('.category-container').html('<p>No categories data available</p>');
            }
        } catch (error) {
            this.$target.find('.category-container').html('<p>Error loading categories</p>');
        }
    },

    _initializeDisplayHandler: function (attempt = 1) {
        try {
            const $parentCategoryMenu = this.$('.category-accordion .custom-dropdown');
            const $parentCategoryMenuItem = this.$('.category-accordion .custom-dropdown-menu');
            const $subcategoryGrid = this.$('#subcategory-grid');
            const $staticContentDivs = this.$('.center-div');
            const $wholeDiv = this.$('#whole');
            const $staticGrid = this.$('#static-grid');
            const $imageGridDisplay = this.$('.image_grid_display');

            let $rowContainer = this.$('.FCS_HOME #dis_div');
            if (!$rowContainer.length) {
                this._renderDefaultLogo($imageGridDisplay);
                return;
            }

            this._cleanupDuplicateCategoryDivs();
            this._hideAllDivs($staticContentDivs, $subcategoryGrid);
            this._categoryMenuHide($parentCategoryMenu, $parentCategoryMenuItem);
            $wholeDiv.removeClass('d-none');
            $staticGrid.removeClass('d-none');

            // Display default FCS logo during initialization
            this._renderDefaultLogo($imageGridDisplay);
        } catch (error) {
            if (attempt < 10) {
                setTimeout(() => this._initializeDisplayHandler(attempt + 1), 100);
            }
        }
    },

    _renderDefaultLogo: function ($imageGridDisplay) {
        $imageGridDisplay.html('').find('.main_logo').remove();
        $imageGridDisplay.append(
            $('<img>', {
                class: 'w-100 main_logo',
                style: 'max-width:300px;',
                src: '/FCS_PAY_OLD/static/src/images/new_fcslogo.png',
                alt: 'Default Logo',
            })
        );
        console.log('Rendered default FCS logo in .image_grid_display');
    },

    _cleanupDuplicateCategoryDivs: function () {
        const $rowContainer = this.$('.FCS_HOME #dis_div');
        if (!$rowContainer.length) {
            return;
        }

        const seenIds = new Set();
        const $categoryDivs = $rowContainer.find('.category-display');

        $categoryDivs.each(function () {
            const $div = $(this);
            const divId = $div.attr('id');
            if (seenIds.has(divId)) {
                $div.remove();
            } else {
                seenIds.add(divId);
            }
        });
    },

    _initializeGridHandler: function (attempt = 1) {
        try {
            const $subcategoryGrid = this.$('#subcategory-grid');
            const $staticGrid = this.$('#static-grid');
            const $subcategoryGroups = this.$('.subcategory-group');
            const $staticContentDivs = this.$('.center-div');
            const $staticMenuDropdown = this.$('#static_menu');
            const $staticMenuItems = this.$('#static_menu_items');
            const $wholeDiv = this.$('#whole');

            this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs);
            this._staticMenuHide($staticMenuDropdown, $staticMenuItems);
            $wholeDiv.removeClass('d-none');
            $staticGrid.removeClass('d-none');
        } catch (error) {
            if (attempt < 10) {
                setTimeout(() => this._initializeGridHandler(attempt + 1), 100);
            }
        }
    },

    _categoryMenuHide: function ($parentCategoryMenu, $parentCategoryMenuItem, keepOpenId = null) {
        $parentCategoryMenu.each(function () {
            if (keepOpenId == null || $(this).attr('data-category-id') !== keepOpenId.toString()) {
                $(this).removeClass('active');
            }
        });
        $parentCategoryMenuItem.each(function () {
            if (keepOpenId == null || $(this).attr('id') !== `category${keepOpenId}`) {
                $(this).removeClass('show');
            }
        });
    },

    _staticMenuHide: function ($staticMenuDropdown, $staticMenuItems) {
        $staticMenuDropdown.removeClass('active');
        $staticMenuItems.removeClass('show');
    },

    _hideAllDivs: function ($staticContentDivs, $subcategoryGrid, defaultDivId = null) {
        $staticContentDivs.each(function () {
            if (this.id !== defaultDivId) {
                $(this).addClass('d-none');
            }
        });
        this.$('.category-display').addClass('d-none');
        $subcategoryGrid.addClass('d-none');
    },

    _hideAllGridsAndDivs: function ($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs, defaultDivId = null) {
        $staticGrid.addClass('d-none');
        $subcategoryGrid.addClass('d-none');
        $subcategoryGroups.addClass('d-none');
        $staticContentDivs.each(function () {
            if (this.id !== defaultDivId) {
                $(this).addClass('d-none');
            }
        });
        this.$('.category-display').addClass('d-none');
    },

    _showStaticDiv: function (divId) {
        const $parentCategoryMenu = this.$('.category-accordion .custom-dropdown');
        const $parentCategoryMenuItem = this.$('.category-accordion .custom-dropdown-menu');
        const $staticContentDivs = this.$('.center-div');
        const $subcategoryGrid = this.$('#subcategory-grid');
        const $staticGrid = this.$('#static-grid');
        const $imageGridDisplay = this.$('.image_grid_display');

        this._categoryMenuHide($parentCategoryMenu, $parentCategoryMenuItem);
        this._hideAllDivs($staticContentDivs, $subcategoryGrid, divId);
        this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, this.$('.subcategory-group'), $staticContentDivs, divId);

        const $targetDiv = this.$(`#${divId}`);
        if ($targetDiv.length) {
            $targetDiv.removeClass('d-none');
        } else {
            console.warn(`No static div found for ID: ${divId}`);
        }

        if (divId === 'whole') {
            $staticGrid.removeClass('d-none');
        }

        // Clear any existing carousel and render default FCS logo
        $imageGridDisplay.find('.carousel').remove();
        this._renderDefaultLogo($imageGridDisplay);
    },

    _onStaticMenuItemClick: function (ev) {
        console.log('fhghfghfgesgf');
        ev.stopPropagation();
        ev.preventDefault();
        const $parentCategoryMenu = this.$('.category-accordion .custom-dropdown');
        const $parentCategoryMenuItem = this.$('.category-accordion .custom-dropdown-menu');
        const $imageGridDisplay = this.$('.image_grid_display');
        this._categoryMenuHide($parentCategoryMenu, $parentCategoryMenuItem);
        const $staticGrid = this.$('#static-grid');
        const divId = ev.currentTarget.getAttribute('data-div-id');
        if (divId) {
            this._showStaticDiv(divId);
            if (divId === 'whole') {
                $staticGrid.removeClass('d-none');
                $imageGridDisplay.find('.main_logo').removeClass('d-none');
            }
        }
    },

    _onEditorSave: function () {
        const $rowContainer = this.$('.FCS_HOME #dis_div');
        if (!$rowContainer.length) {
            return;
        }

        $rowContainer.find('.category-display').each((index, div) => {
            const $div = $(div);
            const divId = $div.attr('id');
            const categoryId = divId.replace('category-display-', '');
            const $description = $div.find(`#category-description-${categoryId}`);
            if ($description.length) {
                const currentContent = $description.html().trim();
                if (currentContent) {
                    rpc('/update_category_description', {
                        category_id: categoryId,
                        description: currentContent
                    }).then((result) => {
                        if (this.categories && this.categories.parent_categories) {
                            const updateCategory = (cats) => {
                                for (const cat of cats) {
                                    if (cat.id === parseInt(categoryId)) {
                                        cat.website_description = currentContent;
                                        return true;
                                    }
                                    if (cat.children) {
                                        for (const child of cat.children) {
                                            if (child.id === parseInt(categoryId)) {
                                                child.website_description = currentContent;
                                                return true;
                                            }
                                            if (child.children) {
                                                for (const nested of child.children) {
                                                    if (nested.id === parseInt(categoryId)) {
                                                        nested.website_description = currentContent;
                                                        return true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                return false;
                            };
                            updateCategory(this.categories.parent_categories);
                        }
                    }).catch(error => {
                        console.error(`saving editor content for category ${categoryId}:`, error);
                    });
                }
            }
        });
    },

    _renderSubcategoryGrid: function (categoryId, categories) {
        const $subcategoryGrid = this.$('#subcategory-grid');
        const $imageGridDisplay = this.$('.image_grid_display');
        // Clear image grid display and remove logo
        $imageGridDisplay.find('.main_logo').addClass('d-none');
        $subcategoryGrid.html('');

        const findCategory = (categories, id) => {
            const searchCategory = (cat, id) => {
                if (cat.id === parseInt(id)) {
                    return cat;
                }
                if (cat.children) {
                    for (const child of cat.children) {
                        const found = searchCategory(child, id);
                        if (found) {
                            return found;
                        }
                    }
                }
                return null;
            };
            for (const cat of categories.parent_categories) {
                const found = searchCategory(cat, id);
                if (found) {
                    return found;
                }
            }
            return null;
        };

//        const getBreadcrumbPath = (categories, categoryId) => {
//            const path = [];
//            const findPath = (cats, id, currentPath) => {
//                for (const cat of cats) {
//                    if (cat.id === parseInt(id)) {
//                        path.push({ id: cat.id, name: cat.name, description: cat.website_description || '' });
//                        return true;
//                    }
//                    if (cat.children) {
//                        for (const child of cat.children) {
//                            if (child.id === parseInt(id)) {
//                                path.push(
//                                    { id: cat.id, name: cat.name, description: cat.website_description || '' },
//                                    { id: child.id, name: child.name, description: child.website_description || '' }
//                                );
//                                return true;
//                            }
//                            if (child.children) {
//                                for (const nested of child.children) {
//                                    if (nested.id === parseInt(id)) {
//                                        path.push(
//                                            { id: cat.id, name: cat.name, description: cat.website_description || '' },
//                                            { id: child.id, name: child.name, description: child.website_description || '' },
//                                            { id: nested.id, name: nested.name, description: nested.website_description || '' }
//                                        );
//                                        return true;
//                                    }
//                                }
//                            }
//                        }
//                    }
//                }
//                return false;
//            };
//            findPath(categories.parent_categories, categoryId, []);
//            return path;
//        };
//
//        const category = findCategory(categories, categoryId);
//        if (!category || !category.id || isNaN(category.id)) {
//            console.warn(`No valid category found for ID: ${categoryId}`);
//            this._renderDefaultLogo($imageGridDisplay);
//            return;
//        }
//
//        console.log('Selected Category:', JSON.stringify(category, null, 2));
//
//        const displayDivId = `category-display-${categoryId}`;
//        let $rowContainer = this.$('.FCS_HOME #dis_div');
//
//        if (!$rowContainer.length) {
//            this._renderDefaultLogo($imageGridDisplay);
//            return;
//        }
//
//        let $displayDiv = $rowContainer.find(`#${displayDivId}`);
//        this.$('.category-display').addClass('d-none');
//
//        const isEditorMode = this.$el.closest('.o_editable').length > 0 || $('body').hasClass('editor_enable');
//
//        if ($displayDiv.length) {
//            const $description = $displayDiv.find(`#category-description-${categoryId}`);
//            if (isEditorMode) {
//                $displayDiv.removeClass('d-none');
//            } else {
//                if ($description.length) {
//                    const currentContent = $description.html().trim();
//                    const backendContent = category.website_description ? category.website_description.trim() : '';
//                    if (!currentContent && backendContent) {
//                        $description.html(backendContent);
//                    }
//                } else {
//                    $displayDiv.append(
//                        $('<div>', {
//                            id: `category-description-${categoryId}`,
//                            class: 'div-body',
//                            html: category.website_description || 'No description available'
//                        })
//                    );
//                }
//                $displayDiv.removeClass('d-none');
//            }
//        } else {
//            $displayDiv = $('<div>', {
//                id: displayDivId,
//                class: 'col-12 col-md-7 category-display categry-div center-div'
//            }).append(
//                $('<h4>', {
//                    id: `category-name-${categoryId}`,
//                    class: 'div-head',
//                    text: category.name || 'Unnamed'
//                }),
//                $('<div>', {
//                    id: `category-description-${categoryId}`,
//                    class: 'div-body',
//                    html: category.website_description || 'No description available'
//                }),
//                $('<button>', {
//                    class: 'buy-now-btn',
//                    'data-category-id': categoryId,
//                    text: 'Shop'
//                })
//            );
//            $rowContainer.append($displayDiv);
//        }
//
//        $displayDiv.removeClass('d-none');
//
//        const $staticContentDivs = this.$('.center-div');
//        const $staticGrid = this.$('#static-grid');
//        const $subcategoryGroups = this.$('.subcategory-group');
//        this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs);
//        $displayDiv.removeClass('d-none');
//
//        // Render carousel for category image and featured images
//        this._renderImageCarousel(categoryId, categories);
//
//        const $breadcrumb = $('<nav>', {
//            'aria-label': 'breadcrumb'
//        }).append(
//            $('<ol>', { class: 'breadcrumb' }).append(
//                ...getBreadcrumbPath(categories, categoryId).map((item, index, arr) =>
//                    $('<li>', {
//                        class: `breadcrumb-item${index === arr.length - 1 ? ' active' : ''}`,
//                        'aria-current': index === arr.length - 1 ? 'page' : undefined
//                    }).append(
//                        index === arr.length - 1
//                            ? item.name
//                            : $('<a>', {
//                                  href: '#',
//                                  text: item.name,
//                                  'data-category-id': item.id,
//                                  'data-name': item.name || 'Unnamed',
//                                  'data-description': item.description || ''
//                              })
//                    )
//                )
//            )
//        );
//
//        const $group = $('<div>', {
//            class: 'subcategory-group row',
//            'data-parent-id': categoryId
//        });
//
//        if (category.children && category.children.length > 0) {
//            category.children.forEach(child => {
//                const $item = $('<div>', {
//                    class: 'col-12 col-md-4 categry-div grid-item drop_active',
//                    'data-category-id': child.id,
//                    'data-name': child.name || 'Unnamed',
//                    'data-description': child.website_description || ''
//                });
//
//                const $heading = $('<div>', {
//                    class: 'o_image_40_cover oe_img_bg o_bg_img_center flex-shrink-0 rounded-3',
//                    style: child.id && !isNaN(child.id) ? `background-image: url(/web/image/product.public.category/${child.id}/image_1920)` : ''
//                });
//
//                const $description = $('<p>', {
//                    class: 'text-center mb-0 mt-1 cat_desc',
//                    html: child.name || 'No description available'
//                });
//
//                const $button = $('<button>', {
//                    class: 'buy-now-btn oe_structure',
//                    'data-category-id': child.id,
//                    text: 'Shop'
//                });
//
//                $item.append($heading, $description, $button);
//                $group.append($item);
//            });
//        } else if (category.products && category.products.length > 0) {
//            category.products.forEach(product => {
//                const $item = $('<div>', {
//                    class: 'col-12 col-md-4 categry-div cat_product',
//                    'data-product-id': product.id
//                });
//
//                const $heading = $('<div>', {
//                    class: 'o_image_40_cover oe_img_bg o_bg_img_center flex-shrink-0 rounded-3',
//                    style: product.id && !isNaN(product.id) ? `background-image: url(/web/image/product.template/${product.id}/image_1920)` : ''
//                });
//
//                const $description = $('<p>', {
//                    class: 'text-center mb-0 mt-1 cat_desc',
//                    text: product.name || 'Unnamed'
//                });
//
//                const $link = $('<a>', {
//                    class: 'view_pro mt-3',
//                    href: `/shop/${product.name.toLowerCase().replace(/[\s&\/,.():;]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '')}-${product.id}`,
//                    text: 'Shop'
//                });
//
//                $item.append($heading, $description, $link);
//                $group.append($item);
//            });
//        }
//
//        $subcategoryGrid.append($breadcrumb, $group);
//        $subcategoryGrid.removeClass('d-none');
//    },

    const getBreadcrumbPath = (categories, categoryId) => {
        const path = [];
        const findPath = (cats, id) => {
            for (const cat of cats) {
                if (cat.id === parseInt(id)) {
                    path.unshift({ id: cat.id, name: cat.name, description: cat.website_description || '' });
                    if (cat.parentId) findPath(categories.parent_categories, cat.parentId);
                    return true;
                }
                if (cat.children && findPath(cat.children, id)) {
                    path.unshift({ id: cat.id, name: cat.name, description: cat.website_description || '' });
                    return true;
                }
            }
            return false;
        };
        findPath(categories.parent_categories, categoryId);
        return path;
    };

    const category = findCategory(categories, categoryId);
        if (!category || !category.id || isNaN(category.id)) {
            console.warn(`No valid category found for ID: ${categoryId}`);
            this._renderDefaultLogo($imageGridDisplay);
            return;
        }

        console.log('Selected Category:', JSON.stringify(category, null, 2));

        const displayDivId = `category-display-${categoryId}`;
        let $rowContainer = this.$('.FCS_HOME #dis_div');

        if (!$rowContainer.length) {
            console.error('Could not find .FCS_HOME #dis_div in DOM. Please ensure it exists.');
            this._renderDefaultLogo($imageGridDisplay);
            return;
        }

        let $displayDiv = $rowContainer.find(`#${displayDivId}`);
        this.$('.category-display').addClass('d-none');

        const isEditorMode = this.$el.closest('.o_editable').length > 0 || $('body').hasClass('editor_enable');

        if ($displayDiv.length) {
            const $description = $displayDiv.find(`#category-description-${categoryId}`);
            if (isEditorMode) {
                $displayDiv.removeClass('d-none');
            } else {
                if ($description.length) {
                    const currentContent = $description.html().trim();
                    const backendContent = category.website_description ? category.website_description.trim() : '';
                    if (!currentContent && backendContent) {
                        $description.html(backendContent);
                    }
                } else {
                    $displayDiv.append(
                        $('<div>', {
                            id: `category-description-${categoryId}`,
                            class: 'div-body',
                            html: category.website_description || 'No description available'
                        })
                    );
                }
                $displayDiv.removeClass('d-none');
            }
        } else {
            $displayDiv = $('<div>', {
                id: displayDivId,
                class: 'col-12 col-md-7 category-display categry-div center-div'
            }).append(
                $('<h4>', {
                    id: `category-name-${categoryId}`,
                    class: 'div-head',
                    text: category.name || 'Unnamed'
                }),
                $('<div>', {
                    id: `category-description-${categoryId}`,
                    class: 'div-body',
                    html: category.website_description || 'No description available'
                }),
                $('<button>', {
                    class: 'buy-now-btn',
                    'data-category-id': categoryId,
                    text: 'Shop'
                })
            );
            $rowContainer.append($displayDiv);
        }

        $displayDiv.removeClass('d-none');

        const $staticContentDivs = this.$('.center-div');
        const $staticGrid = this.$('#static-grid');
        const $subcategoryGroups = this.$('.subcategory-group');
        this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs);
        $displayDiv.removeClass('d-none');

        // Render carousel for category image and featured images
        this._renderImageCarousel(categoryId, categories);

        const $breadcrumb = $('<nav>', {
            'aria-label': 'breadcrumb'
        }).append(
            $('<ol>', { class: 'breadcrumb' }).append(
                ...getBreadcrumbPath(categories, categoryId).map((item, index, arr) =>
                    $('<li>', {
                        class: `breadcrumb-item${index === arr.length - 1 ? ' active' : ''}`,
                        'aria-current': index === arr.length - 1 ? 'page' : undefined
                    }).append(
                        index === arr.length - 1
                            ? item.name
                            : $('<a>', {
                                  href: '#',
                                  text: item.name,
                                  'data-category-id': item.id,
                                  'data-name': item.name || 'Unnamed',
                                  'data-description': item.description || ''
                              })
                    )
                )
            )
        );

        const $group = $('<div>', {
            class: 'subcategory-group row',
            'data-parent-id': categoryId
        });

        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                const $item = $('<div>', {
                    class: 'col-12 col-md-4 categry-div grid-item drop_active',
                    'data-category-id': child.id,
                    'data-name': child.name || 'Unnamed',
                    'data-description': child.website_description || ''
                });

                const $heading = $('<div>', {
                    class: 'o_image_40_cover oe_img_bg o_bg_img_center flex-shrink-0 rounded-3',
                    style: child.id && !isNaN(child.id) ? `background-image: url(/web/image/product.public.category/${child.id}/image_1920)` : ''
                });

                const $description = $('<p>', {
                    class: 'text-center mb-0 mt-1 cat_desc',
                    html: child.name || 'No description available'
                });

                const $button = $('<button>', {
                    class: 'buy-now-btn oe_structure',
                    'data-category-id': child.id,
                    text: 'Shop'
                });

                $item.append($heading, $description, $button);
                $group.append($item);
            });
        } else if (category.products && category.products.length > 0) {
            category.products.forEach(product => {
                const $item = $('<div>', {
                    class: 'col-12 col-md-4 categry-div cat_product',
                    'data-product-id': product.id
                });

                const $heading = $('<div>', {
                    class: 'o_image_40_cover oe_img_bg o_bg_img_center flex-shrink-0 rounded-3',
                    style: product.id && !isNaN(product.id) ? `background-image: url(/web/image/product.template/${product.id}/image_1920)` : ''
                });

                const $description = $('<p>', {
                    class: 'text-center mb-0 mt-1 cat_desc',
                    text: product.name || 'Unnamed'
                });

                const $link = $('<a>', {
                    class: 'view_pro mt-3',
                    href: `/shop/${product.name.toLowerCase().replace(/[\s&\/,.():;]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '')}-${product.id}`,
                    text: 'Shop'
                });

                $item.append($heading, $description, $link);
                $group.append($item);
            });
        }

        $subcategoryGrid.append($breadcrumb, $group);
        $subcategoryGrid.removeClass('d-none');
    },

    _renderImageCarousel: function (categoryId, categories) {
        const $imageGridDisplay = this.$('.image_grid_display');
        // Clear image grid display
        $imageGridDisplay.html('');

        const findCategory = (categories, id) => {
            const searchCategory = (cat, id) => {
                if (cat.id === parseInt(id)) return cat;
                if (cat.children) {
                    for (const child of cat.children) {
                        const found = searchCategory(child, id);
                        if (found) return found;
                    }
                }
                return null;
            };
            for (const cat of categories.parent_categories) {
                const found = searchCategory(cat, id);
                if (found) return found;
            }
            return null;
        };

        const collectAllImages = (category) => {
            let images = [];
            if (category.id && !isNaN(category.id)) {
                images.push(`/web/image/product.public.category/${category.id}/image_1920`);
            }
            if (category.featured_images && category.featured_images.length > 0) {
                images = images.concat(category.featured_images);
            }
            return images;
        };

        const category = findCategory(categories, categoryId);
        if (!category) {
            console.warn(`No category found for ID: ${categoryId}`);
            this._renderDefaultLogo($imageGridDisplay);
            return;
        }

        const allImages = collectAllImages(category);
        if (!allImages || allImages.length === 0) {
            console.warn(`No images found for category ${categoryId}`);
            this._renderDefaultLogo($imageGridDisplay);
            return;
        }

        // Create carousel container
        const $carousel = $('<div>', {
            class: 'carousel slide',
            id: `image-carousel-${categoryId}`,
            'data-bs-ride': 'carousel'
        });

        // Carousel inner
        const $carouselInner = $('<div>', { class: 'carousel-inner' });
        let validImages = 0;
        allImages.forEach((imageUrl, index) => {
            if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                const $item = $('<div>', {
                    class: `carousel-item ${index === 0 ? 'active' : ''}`
                });
                const $img = $('<img>', {
                    src: imageUrl,
                    class: 'd-block w-100',
                    style: 'max-width:300px; margin: auto; object-fit: contain;',
                    alt: `Category image ${index + 1}`,
                    error: function () {
                        const $carouselItem = $(this).closest('.carousel-item');
                        if ($carouselItem.hasClass('active') && $carouselInner.find('.carousel-item').length > 1) {
                            const $nextItem = $carouselItem.next('.carousel-item');
                            if ($nextItem.length) {
                                $nextItem.addClass('active');
                            } else {
                                const $prevItem = $carouselItem.prev('.carousel-item');
                                if ($prevItem.length) {
                                    $prevItem.addClass('active');
                                }
                            }
                        }
                        $carouselItem.remove();
                        if ($carouselInner.find('.carousel-item').length === 0) {
                            $carousel.remove();
                            this._renderDefaultLogo($imageGridDisplay);
                        }
                    }.bind(this)
                });
                $item.append($img);
                $carouselInner.append($item);
                validImages++;
            } else {
                console.warn(`Skipping invalid image URL: ${imageUrl}`);
            }
        });

        if (validImages === 0) {
            console.warn(`No valid images available for category ID: ${categoryId}`);
            this._renderDefaultLogo($imageGridDisplay);
            return;
        }

        // Carousel controls
        if (validImages > 1) {
            const $prevControl = $('<button>', {
                class: 'carousel-control-prev',
                type: 'button',
                'data-bs-target': `#image-carousel-${categoryId}`,
                'data-bs-slide': 'prev'
            }).append(
                $('<span>', { class: 'carousel-control-prev-icon', 'aria-hidden': 'true' }),
                $('<span>', { class: 'visually-hidden', text: 'Previous' })
            );

            const $nextControl = $('<button>', {
                class: 'carousel-control-next',
                type: 'button',
                'data-bs-target': `#image-carousel-${categoryId}`,
                'data-bs-slide': 'next'
            }).append(
                $('<span>', { class: 'carousel-control-next-icon', 'aria-hidden': 'true' }),
                $('<span>', { class: 'visually-hidden', text: 'Next' })
            );

            $carousel.append($carouselInner, $prevControl, $nextControl);
        } else {
            $carousel.append($carouselInner);
        }

        $imageGridDisplay.append($carousel);

        // Explicitly hide the main_logo when carousel is present
        $imageGridDisplay.find('.main_logo').addClass('d-none');

        $(`#image-carousel-${categoryId}`).carousel({
            interval: 3000,
            wrap: true
        });
    },

    _onAccordionItemClick: function (ev) {
        ev.preventDefault();
        const $target = $(ev.currentTarget);
        const $staticGrid = this.$('#static-grid');
        const $subcategoryGrid = this.$('#subcategory-grid');
        const $subcategoryGroups = this.$('.subcategory-group');
        const $staticContentDivs = this.$('.center-div');
        const $staticMenuDropdown = this.$('#static_menu');
        const $staticMenuItems = this.$('#static_menu_items');

        const parentId = $target.attr('data-parent-id') || '';
        const targetId = $target.attr('data-bs-target');

        const $dropdownMenu = this.$(targetId);
        const isChildCategory = $target.closest('.custom-dropdown').parent().is('li');

        if (!isChildCategory) {
            this.$('.category-accordion > .custom-dropdown').each((index, element) => {
                const $parentDropdown = $(element);
                if ($parentDropdown.find($target).length === 0) {
                    $parentDropdown.find('.custom-dropdown-menu').removeClass('show');
                    $parentDropdown.find('.custom-dropdown-toggle').addClass('collapsed').attr('aria-expanded', 'false');
                    $parentDropdown.removeClass('active');
                }
            });
        }

        this._staticMenuHide($staticMenuDropdown, $staticMenuItems);
        this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs);

        if (this.categories && this.categories.parent_categories && parentId && !isNaN(parentId)) {
            this._renderSubcategoryGrid(parentId, this.categories);
        } else {
            console.warn('Category data not available or invalid parentId for rendering subcategory grid:', { parentId, categoriesAvailable: !!this.categories });
            this._renderDefaultLogo(this.$('.image_grid_display'));
        }
    },

    _onGridItemClick: function (ev) {
        if (!$(ev.target).hasClass('buy-now-btn') && !$(ev.target).hasClass('view_pro')) {
            ev.preventDefault();
            const $staticGrid = this.$('#static-grid');
            const $subcategoryGrid = this.$('#subcategory-grid');
            const $subcategoryGroups = this.$('.subcategory-group');
            const $staticContentDivs = this.$('.center-div');
            const $parentCategoryMenu = this.$('.category-accordion .custom-dropdown');
            const $parentCategoryMenuItem = this.$('.category-accordion .custom-dropdown-menu');

            const categoryId = ev.currentTarget.getAttribute('data-category-id');
            const parentCategoryId = this.categories ? this._findParentCategoryId(this.categories, categoryId) : null;

            this._categoryMenuHide($parentCategoryMenu, $parentCategoryMenuItem, parentCategoryId);

            if (parentCategoryId) {
                const $parentToggle = this.$(`.category-accordion .drop_active[data-parent-id="${parentCategoryId}"]`);
                $parentToggle.removeClass('collapsed').attr('aria-expanded', 'true');
                $parentToggle.closest('.custom-dropdown').addClass('active');
            }

            this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs);

            const $rowContainer = this.$('.FCS_HOME #dis_div');
            if (!$rowContainer.length) {
                this._renderDefaultLogo(this.$('.image_grid_display'));
                return;
            }

            if (this.categories && this.categories.parent_categories && categoryId && !isNaN(categoryId)) {
                this._renderSubcategoryGrid(categoryId, this.categories);
            } else {
                console.warn('Category data not available or invalid categoryId for rendering subcategory grid:', { categoryId, categoriesAvailable: !!this.categories });
                this._renderDefaultLogo(this.$('.image_grid_display'));
            }
        }
    },

    _findParentCategoryId: function (categories, childId) {
        if (!categories || !childId) return null;
        for (const cat of categories.parent_categories) {
            if (cat.id === parseInt(childId)) {
                return cat.id;
            }
            if (cat.children) {
                const found = cat.children.find(child => child.id === parseInt(childId));
                if (found) {
                    return cat.id;
                }
                for (const child of cat.children) {
                    if (child.children) {
                        const nestedFound = child.children.find(nested => nested.id === parseInt(childId));
                        if (nestedFound) {
                            return cat.id;
                        }
                    }
                }
            }
        }
        return null;
    },

    _onBuyNowButtonClick: function (ev) {
        ev.preventDefault();
        const categoryId = ev.currentTarget.getAttribute('data-category-id');
        if (categoryId) {
            const shopUrl = `/shop?category=${categoryId}`;
            window.location.href = shopUrl;
        } else {
            console.warn('No category ID found for Shop Now/Buy Now button');
        }
    },

    _onSolutionConfClick: function (ev) {
        ev.preventDefault();
        const divId = ev.currentTarget.getAttribute('data-div-id');
        if (divId) {
            this._showStaticDiv(divId);
        }
    },

    _onBreadcrumbClick: function (ev) {
        ev.preventDefault();
        const $target = $(ev.currentTarget);
        const divId = $target.attr('data-div-id');
        const categoryId = $target.attr('data-category-id');

        if (divId) {
            this._showStaticDiv(divId);
        } else if (categoryId) {
            const $staticGrid = this.$('#static-grid');
            const $subcategoryGrid = this.$('#subcategory-grid');
            const $subcategoryGroups = this.$('.subcategory-group');
            const $staticContentDivs = this.$('.center-div');
            const $staticMenuDropdown = this.$('#static_menu');
            const $staticMenuItems = this.$('#static_menu_items');
            const $parentCategoryMenu = this.$('.category-accordion .custom-dropdown');
            const $parentCategoryMenuItem = this.$('.category-accordion .custom-dropdown-menu');

            const parentCategoryId = this.categories ? this._findParentCategoryId(this.categories, categoryId) : null;
            this._categoryMenuHide($parentCategoryMenu, $parentCategoryMenuItem, parentCategoryId);
            this._staticMenuHide($staticMenuDropdown, $staticMenuItems);
            this._hideAllGridsAndDivs($staticGrid, $subcategoryGrid, $subcategoryGroups, $staticContentDivs);

            const $rowContainer = this.$('.FCS_HOME #dis_div');
            if (!$rowContainer.length) {
                this._renderDefaultLogo(this.$('.image_grid_display'));
                return;
            }

            if (this.categories && this.categories.parent_categories && categoryId && !isNaN(categoryId)) {
                this._renderSubcategoryGrid(categoryId, this.categories);
            } else {
                console.warn('Category data not available or invalid categoryId for rendering subcategory grid:', { categoryId, categoriesAvailable: !!this.categories });
                this._renderDefaultLogo(this.$('.image_grid_display'));
            }
        }
    },
});