import Global_Table_Config from "./common_func";

jQuery(document).ready(function ($) {
    class Data_Tables_Async {
        constructor() {
            this.frontend_table = $(".gswpts_tables_container");

            if (gswpts_frontend_data.asynchronous_loading == "on") {
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
                let id = $(elem).attr("id");
                $.ajax({
                    url  : gswpts_frontend_data.admin_ajax,
                    data : {
                        action : "gswpts_sheet_fetch",
                        id     : id,
                        nonce  : window?.gswpts_frontend_data?.nonce,
                    },
                    type: "post",
                    success: (res) => {
                        // [track1] Handle non-logged-in restriction before any table init (pro only)
                        if (!res.success) {
                            if (
                                gswpts_frontend_data.isProActive &&
                                res.data && res.data.type === 'non_logged_restricted'
                            ) {
                                const msg = res.data.message || '';
                                const loginUrl = res.data.login_url || '';
                                const loginBtn = loginUrl
                                    ? ` <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" class="swptls-non-logged-login-btn">Log In</a>`
                                    : '';
                                $(elem).find('.gswpts_tables_content').html(
                                    '<div class="swptls-non-logged-message">' + msg + loginBtn + '</div>'
                                );
                            } else {
                                $(elem).find('.gswpts_tables_content').html(
                                    '<strong>Table could not be loaded. Try again</strong>'
                                );
                            }
                            return;
                        }
                        // [/track1]

                        let tableClass = new Global_Table_Config();
                        let table_settings = res.data.table_settings;

                        // if (tableClass.isProPluginActive()) {
                        if (table_settings?.responsive_style) {
                            $(elem).addClass(table_settings?.responsive_style);
                        }

                        if (table_settings?.import_styles) {
                            $(elem).addClass(`gswpts_default-style`);
                        } else {
                            $(elem).addClass(
                                `gswpts_${
                                    table_settings?.table_style
                                        ? table_settings?.table_style
                                        : "default-style"
                                }`
                            );
                        }

                        $(elem).addClass(`gswpts_default-style`);
                        // }

                        if (table_settings?.show_title == "true") {
                            $(elem).find("h3").html(res.data.table_name);
                        }

                        $(elem).find(".gswpts_tables_content").html(res.data.output);

                        let table_name = res.data.name;
                        let sheetUrl   = res.data.source_url;

                        tableClass.table_configuration(
                            $,
                            i,
                            elem,
                            table_name,
                            table_settings,
                            sheetUrl
                        );

                        let scrollerContainer = $(elem).find(".dataTables_scroll");
                        let scrollerElement = $(elem).find(".dataTables_scrollBody");

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

                        // END 

                        // Additional code for handling merged cells and text alignment
                        tableClass.handleMergedCells($, elem);

                        //Additional code for handling header merged cells and text alignment
                        tableClass.handleHeaderMergedCells($, elem);
                        
                        tableClass.loadThemeStyle($, elem);

                        if (gswpts_frontend_data.isProActive) {
                            if (table_settings?.cursor_behavior == "left_right") {
                                // Add functionality of scrolling the table.
                                tableClass.bindDragScroll(scrollerContainer, scrollerElement);
                            }
                            tableClass.addGrabCursonOnMouseDown($(elem).find("#create_tables"));
                        }
                        
                        // table width fixing 
                        /* if (table_settings?.merged_support) {
                            tableClass.handleTableWidth($, $(elem).find(".gswpts_tables_container"));
                        } */

                        setInterval(function() {
                            tableClass.handleTableWidth($, $(elem).find(".gswpts_tables_container"));
                        }, 600);

                        tableClass.handlePaginations($, elem);
                        // tableClass.defaultThemepaginationStyle($, elem);

                         // Disable sorting from the table
                        if (table_settings?.hide_sorting_icon) {
                            tableClass.handleSortingDisable($, $(elem).find(".gswpts_tables_container"));
                        }
                        
                        // Makes the table hide and unhide
                        if (table_settings?.table_view_mode === 'search-only-mode') {
                            tableClass.handleSearchoptions($, $(elem).find(".gswpts_tables_container"), table_settings.search_by);
                        }
                        
                        // Condition to load the search button and disable search in type and show search value once search button click or enter press        
                        if (table_settings?.table_view_mode === 'search-only-mode' && table_settings?.search_by === 'search-by-press') {
                            tableClass.CreateSearchoptions($, $(elem).find(".gswpts_tables_container"), table_settings.search_by);
                        }

                        if (tableClass.isProPluginActive()) {

                            if (table_settings?.enable_fixed_columns || table_settings?.fixed_headers) {
                                tableClass.handleSticky($, $(elem).find(".gswpts_tables_container"), table_settings.enable_fixed_columns, table_settings.left_columns, table_settings.right_columns, table_settings.fixed_headers, table_settings.header_offset );
                                
                                // Re-apply sticky on DataTables re-render (pagination, filtering, search)
                                const dataTable = $(elem).find('#create_tables').DataTable();
                                if (dataTable) {
                                    dataTable.on('draw.dt', function() {
                                        tableClass.handleSticky($, $(elem).find(".gswpts_tables_container"), table_settings.enable_fixed_columns, table_settings.left_columns, table_settings.right_columns, table_settings.fixed_headers, table_settings.header_offset );
                                    });
                                }
                            }
                        }

                        
                        tableClass.clearOverflow();

                        /**
                         * FE Sorting fix by disable the sorting when has vertical merge 
                         */
                        var tableRows = document.querySelectorAll('.gswpts_rows');
                        var verticalMergeFound = false;
                        if(tableRows){
                            tableRows.forEach(function (row) {
                                var cells = row.querySelectorAll('td');
                                cells.forEach(function (cell, index) {
                                    var rowspan = cell.getAttribute('rowspan');

                                    if (rowspan && parseInt(rowspan) > 1) {
                                        verticalMergeFound = true;
                                    }
                                });
                            });
                        }

                        if (verticalMergeFound) {
                            $.ajax({
                                url  : gswpts_frontend_data.admin_ajax,
                                data : {
                                    action : "gswpts_update_sorting_fe",
                                    id     : id,
                                    nonce  : window?.gswpts_frontend_data?.nonce,
                                    allow_sorting: false,  
                                },
                                type: "post",
                                success: (res) => {
                                    
                                },
                                error: (err) => {
                                
                                },
                            });

                        }
                        // END 
                        
                    },
                    error: (err) => {
                        alert("Something went wrong");
                        console.error(err);
                        $(elem)
                            .find(".gswpts_tables_content")
                            .html("<strong>Table could not be loaded. Try again</strong>");
                    },
                });


                

            });
        }
    }

    new Data_Tables_Async();
});

