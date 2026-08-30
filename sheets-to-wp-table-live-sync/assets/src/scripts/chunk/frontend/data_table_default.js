import Global_Table_Config from "./common_func";

jQuery(document).ready(function ($) {
    class Data_Tables_Default {
        constructor() {
            this.frontend_table = $(".gswpts_tables_container");
            if (gswpts_frontend_data.asynchronous_loading == "off") {
                this.events();
            } else {
                return;
            }
        }
        events() {
            this.get_frontend_table();
        }

        get_frontend_table() {
            $.each(this.frontend_table, function (i, elem) {
                let table_settings = JSON.parse($(elem).attr("data-table_settings"));

                let table_name = $(elem).attr("data-table_name");
                let sheetUrl = $(elem).attr("data-url");

                let table_obj = new Global_Table_Config();

                table_obj.table_configuration($, i, elem, table_name, table_settings, sheetUrl);

                let scrollerContainer = $(elem).find(".dataTables_scroll");
                let scrollerElement = $(elem).find(".dataTables_scrollBody");

                    
                
                // Fix extra header when clicking the sort icon and has header merge
                if (scrollerElement) {

                    //Extra header issue fix it how it was before when click the sort icon and has header merge
                    function handleCommonActions(theadElement) {
                        console.clear(); // Clearing a few basic logs that are not needed to show
                        if (theadElement) {
                            // Select all tr elements within theadElement
                            var trElements = theadElement.querySelectorAll('tr');
                    
                            // Iterate through each trElement
                            trElements.forEach(function(trElement) {
                                // Apply height style to each trElement
                                trElement.style.height = '0px';
                    
                                // Select all th elements within theadElement
                                var thElements = trElement.querySelectorAll('th');
                    
                                // Iterate through each thElement
                                thElements.forEach(function(thElement) {
                                    // Create a new div element with the required styles
                                    var divElement = document.createElement('div');
                                    divElement.className = 'dataTables_sizing';
                                    divElement.style.height = '0px';
                                    divElement.style.overflow = 'hidden';
                                    divElement.innerText = thElement.innerText; // Copy the text content
                    
                                    // Empty the thElement and append the divElement
                                    thElement.innerHTML = '';
                                    thElement.appendChild(divElement);
                    
                                    // Apply styles to each thElement
                                    thElement.style.paddingTop = '0px';
                                    thElement.style.paddingBottom = '0px';
                                    thElement.style.borderTopWidth = '0px';
                                    thElement.style.borderBottomWidth = '0px';
                                    thElement.style.height = '0px';
                                    thElement.style.textAlign = 'center';
                                    // thElement.style.display = 'none';
                                });
                            });
                        }
                    }
                    
                    function handlePagination() {
                        var createTablesPaginate = document.getElementById('create_tables_paginate');
                        if (createTablesPaginate) {
                            var container = createTablesPaginate.closest(".gswpts_tables_container");
                            var scrollBody = container.querySelector('.dataTables_scrollBody');
                            var thead = scrollBody.querySelector('thead');
                            handleCommonActions(thead);
                        }
                    }


                    var tableHeaders = document.querySelectorAll('.thead-item[data-merge]');
                    tableHeaders.forEach(function (header) {
                        // Check if the current header has the data-merge attribute.
                        var dataMerge = header.getAttribute('data-merge');
                        if (dataMerge) {
                            var sortingElements = document.querySelectorAll('.sorting');
                            var dataTablesLength = document.querySelectorAll('.dataTables_length');
                            var dataTables_filter = document.querySelectorAll('.dataTables_filter');
                            var createTablesFilterInputs = document.querySelectorAll('.dataTables_filter input');
                            var paginateContainer = document.getElementById('create_tables_paginate');

                            // Add a click event listener to each sorting element
                            sortingElements.forEach(function (sortingElement) {
                                sortingElement.addEventListener('click', function () {
                                    // Find the .dataTables_scrollBody element within the same container
                                    var container = sortingElement.closest(".gswpts_tables_container");
                                    var scrollBody = container.querySelector('.dataTables_scrollBody');
                                    // Find the <thead> element within the .dataTables_scrollBody
                                    var thead = scrollBody.querySelector('thead');
                                    handleCommonActions(thead);
                                });
                            });
                        
                            // Add a click event listener to each dataTablesLength element
                            dataTablesLength.forEach(function (LengthElement) {
                                LengthElement.addEventListener('click', function () {
                                    var container = LengthElement.closest(".gswpts_tables_container");
                                    var scrollBody = container.querySelector('.dataTables_scrollBody');
                                    var thead = scrollBody.querySelector('thead');
                                    handleCommonActions(thead);
                                    // console.log("click on dataTablesLength");
                                });
                            });
                        
                            // Add a click event listener to each dataTables_filter element
                            dataTables_filter.forEach(function (FilterElement) {
                                FilterElement.addEventListener('click', function () {
                                    var container = FilterElement.closest(".gswpts_tables_container");
                                    var scrollBody = container.querySelector('.dataTables_scrollBody');
                                    var thead = scrollBody.querySelector('thead');
                                    handleCommonActions(thead);
                                    // console.log("click on dataTables_filter");
                                });
                            });
        
                            createTablesFilterInputs.forEach(function (createTablesFilterInput) {
                                createTablesFilterInput.addEventListener('input',function () {
                                    var container = createTablesFilterInput.closest(".gswpts_tables_container");
                                    var scrollBody = container.querySelector('.dataTables_scrollBody');
                                    var thead = scrollBody.querySelector('thead');
                                    handleCommonActions(thead);
                                    // console.log("click on handleSearchFilter");
                                });
                            });

                            if (paginateContainer) {
                                paginateContainer.addEventListener('click', function (event) {
                                    // Check if the clicked element is a paginate button
                                    if (event.target.classList.contains('paginate_button')) {
                                        handlePagination();
                                        // console.log("click on paginate");
                                    }
                                });
                            }   
                        }
                    });
                    
                }

                if (gswpts_frontend_data.isProActive) {
                    if (table_settings?.cursor_behavior == "left_right") {
                        // Add functionality of scrolling the table.
                        table_obj.bindDragScroll(scrollerContainer, scrollerElement);
                    }
                    table_obj.addGrabCursonOnMouseDown($(elem).find("#create_tables"));
                }
                
                // Additional code for handling merged cells and text alignment
                table_obj.handleMergedCells($, elem);
                table_obj.loadThemeStyle($, elem);
                // table_obj.defaultThemepaginationStyle($, elem);
                table_obj.handleHeaderMergedCells($, elem);

                
                /* if (table_settings?.merged_support) {
                    table_obj.handleTableWidth($, $(elem).find(".gswpts_tables_container"));
                } */

                setInterval(function() {
                    table_obj.handleTableWidth($, $(elem).find(".gswpts_tables_container"));
                }, 600);

                /* $(window).on('resize', function () {
                    table_obj.handleTableWidth($, $(elem).find(".gswpts_tables_container"));
                }); */

                table_obj.handlePaginations($, elem);

                 // Disable sorting from the table
                 if (table_settings?.hide_sorting_icon) {
                    table_obj.handleSortingDisable($, $(elem).find(".gswpts_tables_container"));
                }

                if (table_settings?.table_view_mode === 'search-only-mode') {
                    table_obj.handleSearchoptions($, $(elem).find(".gswpts_tables_container"), table_settings.search_by);
                }
                
                // Condition to load the search button and disable search in type and show search value once search button click or enter press        
                if (table_settings?.table_view_mode === 'search-only-mode' && table_settings?.search_by === 'search-by-press') {
                    table_obj.CreateSearchoptions($, $(elem).find(".gswpts_tables_container"), table_settings.search_by);
                }

                // Sticky feature development
                if (table_obj.isProPluginActive()) {
                    if (table_settings?.enable_fixed_columns || table_settings?.fixed_headers) {
                        table_obj.handleSticky($, $(elem).find(".gswpts_tables_container"), table_settings.enable_fixed_columns, table_settings.left_columns, table_settings.right_columns, table_settings.fixed_headers, table_settings.header_offset );
                    }
                }
                    

                table_obj.clearOverflow();
            });
        }
    }

    new Data_Tables_Default();
});

