// Frontend Data table design and other config applied like pagination, shorting and so on 

export default class Global_Table_Config {

    constructor() {
        this.PaginationTailwindBack1 = `
        <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.77056 8.8019C5.91747 8.67501 6 8.50294 6 8.32353C6 8.14411 5.91747 7.97205 5.77056 7.84516L1.89154 4.49592L5.77056 1.14667C5.91331 1.01906 5.99229 0.848143 5.99051 0.670736C5.98872 0.49333 5.90631 0.323626 5.76101 0.198175C5.61572 0.0727263 5.41917 0.00156787 5.21371 2.57836e-05C5.00824 -0.00151535 4.81029 0.0666838 4.66249 0.189935L0.229439 4.01755C0.0825293 4.14443 -2.04722e-07 4.3165 -1.9688e-07 4.49592C-1.89037e-07 4.67533 0.0825294 4.8474 0.229439 4.97428L4.66249 8.8019C4.80945 8.92874 5.00873 9 5.21653 9C5.42432 9 5.62361 8.92874 5.77056 8.8019Z" fill="#FFFFFF"/>
        </svg>

        `;
        this.PaginationTainwildNext1 = `
        <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.229439 8.8019C0.0825295 8.67501 2.1727e-08 8.50294 2.95695e-08 8.32353C3.74119e-08 8.14411 0.0825296 7.97205 0.229439 7.84516L4.10846 4.49592L0.22944 1.14667C0.0866933 1.01906 0.00770646 0.848143 0.00949193 0.670736C0.0112774 0.49333 0.0936922 0.323626 0.238986 0.198175C0.384279 0.0727263 0.580825 0.00156787 0.786293 2.57836e-05C0.991761 -0.00151535 1.18971 0.0666838 1.33751 0.189935L5.77056 4.01755C5.91747 4.14443 6 4.3165 6 4.49592C6 4.67533 5.91747 4.8474 5.77056 4.97428L1.33751 8.8019C1.19055 8.92874 0.991266 9 0.783473 9C0.57568 9 0.376394 8.92874 0.229439 8.8019Z" fill="#FFFFFF"/>
        </svg>

        `;


        this.PaginationTailwindBack2 = `
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.35416 0.854143C5.40065 0.807655 5.43753 0.752466 5.46268 0.691727C5.48784 0.630987 5.50079 0.565887 5.50079 0.500143C5.50079 0.434399 5.48784 0.369299 5.46268 0.30856C5.43753 0.24782 5.40065 0.192631 5.35416 0.146143C5.30767 0.0996553 5.25248 0.0627792 5.19174 0.0376201C5.13101 0.012461 5.06591 -0.000488282 5.00016 -0.000488281C4.93442 -0.00048828 4.86932 0.012461 4.80858 0.0376201C4.74784 0.0627792 4.69265 0.0996553 4.64616 0.146143L0.646161 4.14614C0.599598 4.19259 0.562655 4.24776 0.537449 4.30851C0.512242 4.36926 0.499268 4.43438 0.499268 4.50014C0.499268 4.56591 0.512242 4.63103 0.537449 4.69178C0.562655 4.75252 0.599598 4.8077 0.646161 4.85414L4.64616 8.85414C4.74005 8.94803 4.86739 9.00077 5.00016 9.00077C5.13294 9.00077 5.26027 8.94803 5.35416 8.85414C5.44805 8.76026 5.50079 8.63292 5.50079 8.50014C5.50079 8.36737 5.44805 8.24003 5.35416 8.14614L1.70716 4.50014L5.35416 0.854143ZM11.3542 0.854143C11.4006 0.807655 11.4375 0.752466 11.4627 0.691727C11.4878 0.630987 11.5008 0.565887 11.5008 0.500143C11.5008 0.434399 11.4878 0.369299 11.4627 0.30856C11.4375 0.24782 11.4006 0.192631 11.3542 0.146143C11.3077 0.0996553 11.2525 0.0627792 11.1917 0.0376201C11.131 0.012461 11.0659 -0.000488281 11.0002 -0.000488281C10.9344 -0.000488281 10.8693 0.012461 10.8086 0.0376201C10.7478 0.0627792 10.6926 0.0996553 10.6462 0.146143L6.64616 4.14614C6.5996 4.19259 6.56266 4.24776 6.53745 4.30851C6.51224 4.36926 6.49927 4.43438 6.49927 4.50014C6.49927 4.56591 6.51224 4.63103 6.53745 4.69178C6.56266 4.75252 6.5996 4.8077 6.64616 4.85414L10.6462 8.85414C10.74 8.94803 10.8674 9.00077 11.0002 9.00077C11.1329 9.00077 11.2603 8.94803 11.3542 8.85414C11.448 8.76026 11.5008 8.63292 11.5008 8.50014C11.5008 8.36737 11.448 8.24003 11.3542 8.14614L7.70716 4.50014L11.3542 0.854143Z" fill="#333333"/>
        </svg>
        `;
        this.PaginationTainwildNext2 = `
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.64587 0.854143C6.59938 0.807655 6.5625 0.752466 6.53735 0.691727C6.51219 0.630987 6.49924 0.565887 6.49924 0.500143C6.49924 0.434399 6.51219 0.369299 6.53735 0.30856C6.5625 0.24782 6.59938 0.192631 6.64587 0.146143C6.69236 0.0996553 6.74755 0.0627792 6.80829 0.0376201C6.86903 0.012461 6.93413 -0.000488282 6.99987 -0.000488281C7.06561 -0.00048828 7.13071 0.012461 7.19145 0.0376201C7.25219 0.0627792 7.30738 0.0996553 7.35387 0.146143L11.3539 4.14614C11.4004 4.19259 11.4374 4.24776 11.4626 4.30851C11.4878 4.36926 11.5008 4.43438 11.5008 4.50014C11.5008 4.56591 11.4878 4.63103 11.4626 4.69178C11.4374 4.75252 11.4004 4.8077 11.3539 4.85414L7.35387 8.85414C7.25998 8.94803 7.13265 9.00077 6.99987 9.00077C6.86709 9.00077 6.73976 8.94803 6.64587 8.85414C6.55198 8.76026 6.49924 8.63292 6.49924 8.50014C6.49924 8.36737 6.55198 8.24003 6.64587 8.14614L10.2929 4.50014L6.64587 0.854143ZM0.645869 0.854143C0.599381 0.807655 0.562505 0.752466 0.537346 0.691727C0.512187 0.630987 0.499238 0.565887 0.499238 0.500143C0.499238 0.434399 0.512187 0.369299 0.537346 0.30856C0.562505 0.24782 0.599381 0.192631 0.645869 0.146143C0.692357 0.0996553 0.747546 0.0627792 0.808286 0.0376201C0.869025 0.012461 0.934126 -0.000488281 0.999869 -0.000488281C1.06561 -0.000488281 1.13071 0.012461 1.19145 0.0376201C1.25219 0.0627792 1.30738 0.0996553 1.35387 0.146143L5.35387 4.14614C5.40043 4.19259 5.43738 4.24776 5.46258 4.30851C5.48779 4.36926 5.50076 4.43438 5.50076 4.50014C5.50076 4.56591 5.48779 4.63103 5.46258 4.69178C5.43738 4.75252 5.40043 4.8077 5.35387 4.85414L1.35387 8.85414C1.25998 8.94803 1.13264 9.00077 0.999869 9.00077C0.867094 9.00077 0.739756 8.94803 0.645869 8.85414C0.551983 8.76026 0.499238 8.63292 0.499238 8.50014C0.499238 8.36737 0.551983 8.24003 0.645869 8.14614L4.29287 4.50014L0.645869 0.854143Z" fill="#333333"/>
        </svg>
        `;
    }

    table_configuration($, i, elem, table_name, table_settings, sheetUrl) {
        let dom = `<"filtering_input filtering_input_${i}"${
                table_settings?.show_x_entries ? "l" : ""
            }${
                table_settings?.search_bar ? "f" : ""
            }>rt<"bottom_options bottom_options_${i}"${
                table_settings?.show_info_block ? "i" : ""
            }${  table_settings?.pagination ? "p" : ""}>`;

        if (this.isProPluginActive()) {
            dom = `B<"filtering_input filtering_input_${i}"${
                table_settings?.show_x_entries ? "l" : ""
            }${
                table_settings?.search_bar ? "f" : ""
            }>rt<"bottom_options bottom_options_${i}"${
                table_settings?.show_info_block ? "i" : ""
            }${  table_settings?.pagination ? "p" : ""}>`;

            // change the cell format according to feature saved at database
            this.changeRedirectionType(
                table_settings?.redirection_type,
                $(elem).find("#create_tables a"),
                $
            );
        }

         // For free it need to use without pro checked
         this.changeCellFormat(
            table_settings?.cell_format,
            $(elem).find("#create_tables th, td"),
            $
        );

        if (table_settings.table_view_mode === 'default-mode') {
            // Without search 
            if ($.fn.DataTable && $(elem).find("#create_tables").length) {
                $(elem).find("#create_tables").DataTable(this.table_obj($, table_name, table_settings, dom));
            }
        } else if (table_settings.table_view_mode === 'search-only-mode') {
        
            if ($.fn.DataTable && $(elem).find("#create_tables").length) {
                // Initialize DataTable and capture the instance
                let table = $(elem).find("#create_tables").DataTable(this.table_obj($, table_name, table_settings, dom));
        
                // Implement Custom Search using table-specific approach instead of global
                this.setupCustomSearch(table, table_settings, elem, $);
            }
        } else {
            // Without search 
            if ($.fn.DataTable && $(elem).find("#create_tables").length) {
                $(elem).find("#create_tables").DataTable(this.table_obj($, table_name, table_settings, dom));
            }
        }
        

        
        this.setPdfUrl(sheetUrl, $(elem).find(".dt-buttons"));

        if (this.isProPluginActive()) {
            this.reveal_export_btns($, elem, table_settings);
        }

        this.swap_input_filter($, i, table_settings);

        this.swap_bottom_options($, i, table_settings);
        
        // Store table settings globally for AI features to access later
        if (!window.swptlsTableSettings) {
            window.swptlsTableSettings = {};
        }
        // Store by both table name and table ID for compatibility
        const tableId = $(elem).attr('id');
        window.swptlsTableSettings[table_name] = table_settings;
        if (tableId) {
            window.swptlsTableSettings[tableId] = table_settings;
        }

        // Initialize AI features after DataTable is ready (with delay to ensure full initialization)
        setTimeout(() => {
            try {
                // Initialize Table Prompt if enabled
                if (table_settings.show_table_prompt_fields && window.swptlsTablePrompt) {
                    window.swptlsTablePrompt.initializeForTable(tableId || table_name, table_settings);
                }
                
                // Initialize AI Summary if enabled
                if (table_settings.show_ai_summary_button && window.swptlsAISummary) {
                    window.swptlsAISummary.initializeForTable(tableId || table_name, table_settings);
                }
            } catch (e) {
                console.warn('Error initializing AI features:', e);
            }
        }, 100);
    }

    setupCustomSearch(table, table_settings, elem, $) {
        // Only setup custom search if column specific search is enabled
        if (!table_settings.enable_column_specific_search) {
            return; // Let DataTable handle default search
        }

        // Create a unique search function for this specific table
        const tableNode = table.table().node();
        const tableId = $(elem).attr('id');
        
        const searchFunction = (settings, data, dataIndex) => {
            // Only apply to this specific table
            if (settings.nTable !== tableNode) {
                return true;
            }

            // Get the search term for this specific table
            let searchTerm = $(elem).find("#create_tables_filter input").val();
            if (!searchTerm) {
                return true;
            }
            searchTerm = searchTerm.toLowerCase();

            // If table_search_column is specified, search only in those columns
            if (table_settings.table_search_column && table_settings.table_search_column.length > 0) {
                for (let i = 0; i < table_settings.table_search_column.length; i++) {
                    let colIndex = table_settings.table_search_column[i];
                    if (data[colIndex] && data[colIndex].toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                }
                return false;
            } else {
                // Search across all columns
                for (let i = 0; i < data.length; i++) {
                    if (data[i] && data[i].toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                }
                return false;
            }
        };

        // Add the search function only if not already added
        if (!$.fn.dataTable.ext.search.includes(searchFunction)) {
            $.fn.dataTable.ext.search.push(searchFunction);
        }

        // Store reference for cleanup
        if (!window.swptlsSearchFunctions) {
            window.swptlsSearchFunctions = new Map();
        }
        window.swptlsSearchFunctions.set(tableId, searchFunction);
    }

    changeRedirectionType(type, links, $) {
        if (!links.length) return;
        $.each(links, function (i, link) {
            $(link).attr("target", type);
        });
    }

    changeCellFormat(formatStyle, tableCell, $) {
        switch (formatStyle) {
            case "wrap":
                $.each(tableCell, function (i, cell) {
                    $(cell).removeClass("clip_style");
                    $(cell).removeClass("expanded_style");
                    $(cell).addClass("wrap_style");
                });
                break;

            case "clip":
                $.each(tableCell, function (i, cell) {
                    $(cell).removeClass("wrap_style");
                    $(cell).removeClass("expanded_style");
                    $(cell).addClass("clip_style");
                });
                break;
            case "expand":
                $.each(tableCell, function (i, cell) {
                    $(cell).removeClass("clip_style");
                    $(cell).removeClass("wrap_style");
                    $(cell).addClass("expanded_style");
                });
                break;

            default:
                break;
        }
    }

    // Cleanup method to remove table-specific search functions
    cleanupTableSearchFunctions() {
        if (window.swptlsSearchFunctions) {
            window.swptlsSearchFunctions.forEach((searchFunction, tableId) => {
                // Remove the search function from global array
                const index = $.fn.dataTable.ext.search.indexOf(searchFunction);
                if (index > -1) {
                    $.fn.dataTable.ext.search.splice(index, 1);
                }
            });
            window.swptlsSearchFunctions.clear();
        }
    }

    isProPluginActive() {
        if (gswpts_frontend_data.isProActive || gswpts_frontend_data.isProActive != '') {
            return true;
        } else {
            return false;
        }
    }

    getSpreadsheetID(url) {
        if (!url || url == "") return;

        let sheetID = null;

        sheetID = url.split(/\//)[5];

        if (sheetID) return sheetID;

        return null;
    }

    getGridID(url) {
        if (!url || url == "") return;

        let gridID = null;

        gridID = url.match(/gid=(\w+)/);

        if ( gridID != null ) {
            gridID = gridID[1];
        }

        if (gridID) {
            return gridID;
        }

        return null;
    }

    //PDF Export as PDF
    setPdfUrl(url, elem) {
        let spreadsheetID = this.getSpreadsheetID(url);
        let gridID = this.getGridID(url);
        let pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/export?format=pdf&id=${spreadsheetID}&gid=${gridID}`;
        // Forntend part design `<a class="ui dt-button inverted button transition pdf_btn"
        elem.append(
            `<a class="ui inverted button export_btns pdf_btn"
                href="${pdfUrl}"
                download
                title="${gswpts_frontend_data.strings['export-pdf']}"
                >
                <span>
                    <img src="${gswpts_frontend_data.iconsURL.filePdf}" />
                </span>
            </a>`
        );
    }

    getPaginateSettings = (tableSettings) => {
        const theme = tableSettings?.table_style || "default-style";
        const themePageStyles = tableSettings?.import_styles_theme_colors?.[theme] || {};
        const PageStyles = themePageStyles.paginationStyle || 'default_pagination';

        if (PageStyles === 'default_pagination') {
			return {
				first: `<span class='paging-first-${PageStyles}'>${gswpts_frontend_data.strings['first']}</span>`,
				previous: `<span class='paging-backward-${PageStyles}'>${gswpts_frontend_data.strings['previous']}</span>`,
				next: `<span class='paging-forward-${PageStyles}'>${gswpts_frontend_data.strings['next']}</span>`,
				last: `<span class='paging-last-${PageStyles}'>${gswpts_frontend_data.strings['last']}</span>`
			};
		} 
        else if(PageStyles === 'modern_pagination') {
			return {
				first: `<span class='paging-first-${PageStyles}'>${gswpts_frontend_data.strings['first']}</span>`,
                previous: `<span class='paging-backward-${PageStyles}'>← ${gswpts_frontend_data.strings['previous2'].toUpperCase()}</span>`,
				next: `<span class='paging-forward-${PageStyles}'>${gswpts_frontend_data.strings['next2'].toUpperCase()} →</span>`,
                
				last: `<span class='paging-last-${PageStyles}'>${gswpts_frontend_data.strings['last']}</span>`
			};
		}
        else if(PageStyles === 'tailwind_pagination') {
			return {
				first: `<span class='paging-first-${PageStyles}'>${gswpts_frontend_data.strings['first']}</span>`,
				previous: `<span class='paging-backward-${PageStyles}'>${this.PaginationTailwindBack2}</span>`,
				next: `<span class='paging-forward-${PageStyles}'>${this.PaginationTainwildNext2}</span>`,
				last: `<span class='paging-last-${PageStyles}'>${gswpts_frontend_data.strings['last']}</span>`
			};
		}
        else if(PageStyles === 'outlined_pagination') {
			return {
				first: `<span class='paging-first-${PageStyles}'>${gswpts_frontend_data.strings['first']}</span>`,
				previous: `<span class='paging-backward-${PageStyles}'>${this.PaginationTailwindBack1}</span>`,
				next: `<span class='paging-forward-${PageStyles}'>${this.PaginationTainwildNext1}</span>`,
				last: `<span class='paging-last-${PageStyles}'>${gswpts_frontend_data.strings['last']}</span>`
			};
		}
        else if(PageStyles === 'simple_pagination') {
			return {
				first: `<span class='paging-first-${PageStyles}'>${gswpts_frontend_data.strings['first']}</span>`,
				previous: `<span class='paging-backward-${PageStyles}'>${this.PaginationTailwindBack1}</span>`,
				next: `<span class='paging-forward-${PageStyles}'>${this.PaginationTainwildNext1}</span>`,
				last: `<span class='paging-last-${PageStyles}'>${gswpts_frontend_data.strings['last']}</span>`
			};
		}
        else {
			return {
				first: `<span class='paging-first-${PageStyles}'>${gswpts_frontend_data.strings['first']}</span>`,
				previous: `<span class='paging-backward-${PageStyles}'>${gswpts_frontend_data.strings['previous']}</span>`,
				next: `<span class='paging-forward-${PageStyles}'>${gswpts_frontend_data.strings['next']}</span>`,
				last: `<span class='paging-last-${PageStyles}'>${gswpts_frontend_data.strings['last']}</span>`
			};
		}

    }
    
    table_obj($, table_name, table_settings, dom) {

         // Register the date format with DataTables
        if (table_settings.allow_sorting && $.fn.dataTable && $.fn.dataTable.moment) {
           
            // European date formats with dots 
            $.fn.dataTable.moment('DD.MM.YYYY');
            $.fn.dataTable.moment('D.M.YYYY');
            $.fn.dataTable.moment('DD.MM.YY');
            $.fn.dataTable.moment('D.M.YY');
            
            // Common date formats with slashes
            $.fn.dataTable.moment('DD/MM/YYYY');
            $.fn.dataTable.moment('MM/DD/YYYY');
            $.fn.dataTable.moment('YYYY/MM/DD');
            $.fn.dataTable.moment('D/M/YYYY');
            
            // Common date formats with dashes
            $.fn.dataTable.moment('DD-MM-YYYY');
            $.fn.dataTable.moment('MM-DD-YYYY');
            $.fn.dataTable.moment('YYYY-MM-DD');
            $.fn.dataTable.moment('D-M-YYYY');
            
            // Month name formats
            $.fn.dataTable.moment('D-MMM-YY');
            $.fn.dataTable.moment('D-MMM-YYYY');
            $.fn.dataTable.moment('D MMM YYYY');
            $.fn.dataTable.moment('DD MMM YYYY');
            $.fn.dataTable.moment('MMMM D, YYYY');
            $.fn.dataTable.moment('MMMM Do, YYYY');
            $.fn.dataTable.moment('Do MMMM YYYY');
            $.fn.dataTable.moment('D MMMM YYYY');
            
            // Full text date formats
            $.fn.dataTable.moment('dddd, MMMM D, YYYY');
            $.fn.dataTable.moment('dddd, MMMM Do, YYYY');
            $.fn.dataTable.moment('ddd, MMM D, YYYY');
            $.fn.dataTable.moment('dd, MM, YYYY');
            
            // Time formats
            $.fn.dataTable.moment('HH:mm MMM D, YY');
            $.fn.dataTable.moment('HH:mm DD.MM.YYYY');
            $.fn.dataTable.moment('HH:mm DD/MM/YYYY');
        }
        

        let table_object = {
            dom: dom,
        
            // order: [[2, 'desc']],
            order: table_settings.allow_singleshort
						? [[(table_settings.columnnumber ? table_settings.columnnumber : 0), table_settings.sorting_mode ? table_settings.sorting_mode : 'desc']]
						: (table_settings.allow_sorting ? [] : []),
            
            responsive: true,
            lengthMenu: [
                [1, 5, 10, 15, 30, 50],
                [
                    gswpts_frontend_data.strings['1'],
                    gswpts_frontend_data.strings['5'],
                    gswpts_frontend_data.strings['10'],
                    gswpts_frontend_data.strings['15'],
                    gswpts_frontend_data.strings['30'],
                    gswpts_frontend_data.strings['50'],
                ]
            ],

            language: {
                search: gswpts_frontend_data.strings['search'], 
                searchPlaceholder: gswpts_frontend_data.strings['search-items'],
                lengthMenu: gswpts_frontend_data.strings['filtering_show'] + " _MENU_ " + gswpts_frontend_data.strings['filtering_entries'],
                info: gswpts_frontend_data.strings['dataTables_info_showing'] + " _START_ " + gswpts_frontend_data.strings['dataTables_info_to'] + " _END_ " + gswpts_frontend_data.strings['dataTables_info_of'] + " _TOTAL_ " + gswpts_frontend_data.strings['filtering_entries'],

                emptyTable: gswpts_frontend_data.strings['data-empty-notice'],
                zeroRecords: gswpts_frontend_data.strings['data-empty-notice'],
                paginate: this.getPaginateSettings(table_settings),
            },
           
            pagingType: 'simple_numbers', // simple_numbers // simple // numbers // full  // first_last_numbers // full_numbers
            pageLength: parseInt(table_settings.default_rows_per_page),
            lengthChange: true,
            ordering: table_settings.allow_sorting,
            destroy: true,
            scrollX: true,
        };

        // ========== FILTER CONFIGURATION SETUP START ==========
        const filterConfig = this.setupFilterConfiguration(table_settings);
        
        // ========== CONFIGURE orderCellsTop FOR INLINE HEADER FILTERS ==========
        // When inline filters are placed in the header, we need orderCellsTop: true
        // This tells DataTables that the first row is for sorting, second row is for filters
        if (filterConfig.shouldInitialize && 
            filterConfig.config.filter_display_mode === 'inline' && 
            filterConfig.config.filter_location === 'above_table') {
            table_object.orderCellsTop = true;
        }
        
        // ========== FILTER INITIALIZATION ==========
        if (filterConfig.shouldInitialize) {
            var self = this; // Capture class instance
            table_object.initComplete = function () {
                var api = this.api(); // Get DataTables API
                self.initializeFilterSystem($, api, table_settings, filterConfig);
            };
        }
        
        // Filter feature end 
        $('.gswpts_tables_container').each(function () {
            let numberOfColumns = $(this).find('thead th').length;
            let table_object = {
                order: []
            };
        
            for (let i = 0; i < numberOfColumns; i++) {
                // table_object.order.push([i, 'asc']);
                table_object.order.push([i, '']);
            }
        });

        if (this.isProPluginActive()) {
            table_object.buttons = [
                {
                    text: `<img src="${gswpts_frontend_data.iconsURL.curlyBrackets}" />`,
                    className: "ui inverted button export_btns json_btn",
                    action: function (e, dt, button, config) {
                        var data = dt.buttons.exportData();
                        $.fn.dataTable.fileSave(
                            new Blob([JSON.stringify(data)]),
                            `${table_name}.json`
                        );
                    },
                    titleAttr: gswpts_frontend_data.strings['export-json']
                },
                {
                    text: `<img src="${gswpts_frontend_data.iconsURL.fileCSV}" />`,
                    extend: "csv",
                    className: "ui inverted button export_btns csv_btn",
                    title: `${table_name}`,
                    // titleAttr: "Export as CSV",
                    titleAttr: gswpts_frontend_data.strings['export-csv'],
                },
                {
                    text: `<img src="${gswpts_frontend_data.iconsURL.fileExcel}" />`,
                    extend: "excel",
                    className: "ui inverted button export_btns excel_btn",
                    title: `${table_name}`,
                    titleAttr: gswpts_frontend_data.strings['export-excel']
                },
                {
                    text: `<img src="${gswpts_frontend_data.iconsURL.printIcon}" />`,
                    extend: "print",
                    className: "ui inverted button export_btns print_btn",
                    title: `${table_name}`,
                    titleAttr: gswpts_frontend_data.strings['print']
                },
                {
                    text: `<img src="${gswpts_frontend_data.iconsURL.copySolid}" />`,
                    extend: "copy",
                    className: "ui inverted button export_btns copy_btn",
                    title: `${table_name}`,
                    titleAttr: gswpts_frontend_data.strings['copy']
                },
            ];

            table_object.lengthMenu = [
                [1, 5, 10, 15, 30, 50, 100, -1],
                [
                    gswpts_frontend_data.strings['1'],
                    gswpts_frontend_data.strings['5'],
                    gswpts_frontend_data.strings['10'],
                    gswpts_frontend_data.strings['15'],
                    gswpts_frontend_data.strings['30'],
                    gswpts_frontend_data.strings['50'],
                    gswpts_frontend_data.strings['100'],
                    gswpts_frontend_data.strings['All']
                ]
            ];
 
            //Column is needed to hide and backend code is not used actually to hide.
            if ((table_settings?.hide_on_desktop_col && this.screenSize() === "desktop") || (table_settings?.hide_on_mobile_col && this.screenSize() === "mobile")) {
                if (this.screenSize() === "desktop" && table_settings.hide_column) {
                    table_object.columnDefs = this.hideColumnByScreen(
                        table_settings.hide_column
                    );
                } else if (this.screenSize() === "mobile" && table_settings.hide_column_mobile) {
                    table_object.columnDefs = this.hideColumnByScreen(
                        table_settings.hide_column_mobile
                    );
                }
            } 
        }
        
        // Table height 
        if (table_settings.vertical_scrolling) {
            table_object.scrollY = `${table_settings.vertical_scrolling}px`;
        }

        return table_object;
    }

    // Return an array that will define the columns to hide
    hideColumnByScreen(arrayValues) {
        return [
            {
                targets: this.convertArrayStringToInteger(arrayValues),
                visible: false,
                searchable: false,
            },
        ];
    }

    // get the current screen size of user if greater than 740 return desktop or return mobile
    screenSize() {
        // Desktop screen size
        if (screen.width > 740) {
            return "desktop";
        } else {
            return "mobile";
        }
    }

    // convert string to integer from arrays
    convertArrayStringToInteger(arr) {
        if (!arr) return [];
        return arr.map((val) => parseInt(val));
    }

    reveal_export_btns($, elem, table_settings) {
        if (!table_settings) return;

        let export_btns = table_settings.table_export;

        if (export_btns != "empty" && export_btns) {
            export_btns.forEach((btn) => {
                $(elem)
                    .find("." + btn + "_btn")
                    .removeClass("export_btns");
            });
        }
    }

    swap_input_filter($, i, table_settings) {
        /* If checkbox is checked then swap filter */
        if (table_settings?.swap_filter_inputs) {
            $(".filtering_input_" + i + "").css("flex-direction", "row-reverse");
            $(".filtering_input_" + i + " > #create_tables_length").css({
                "margin-right": "0",
                "margin-left": "auto",
            });
            $(".filtering_input_" + i + " > #create_tables_filter").css({
                "margin-left": "0",
                "margin-right": "auto",
            });
        } else {
            /* Set back to default position */
            $(".filtering_input_" + i + "").css("flex-direction", "row");
            $(".filtering_input_" + i + " > #create_tables_length").css({
                "margin-right": "auto",
                "margin-left": "0",
            });
            $(".filtering_input_" + i + " > #create_tables_filter").css({
                "margin-left": "auto",
                "margin-right": "0",
            });
        }
    }

    swap_bottom_options($, i, table_settings) {
        let style = {
            flex_direction: "row-reverse",
            table_info_style: {
                margin_left: "auto",
                margin_right: 0,
            },
            table_paginate_style: {
                margin_left: 0,
                margin_right: "auto",
            },
        };

        if (table_settings?.swap_bottom_options) {
            this.bottom_option_style($, style, i);
        } else {
            style["flex_direction"] = "row";

            style.table_info_style["margin_left"] = 0;
            style.table_info_style["margin_right"] = "auto";

            style.table_paginate_style["margin_left"] = "auto";
            style.table_paginate_style["margin_right"] = 0;

            this.bottom_option_style($, style, i);
        }
    }

    bottom_option_style($, $arg, i) {
        $(".bottom_options_" + i + "").css("flex-direction", $arg["flex_direction"]);
        $(".bottom_options_" + i + " > #create_tables_info").css({
            "margin-left": $arg["table_info_style"]["margin_left"],
            "margin-right": $arg["table_info_style"]["margin_right"],
        });
        $(".bottom_options_" + i + " > #create_tables_paginate").css({
            "margin-left": $arg["table_paginate_style"]["margin_left"],
            "margin-right": $arg["table_paginate_style"]["margin_right"],
        });
    }

    /**
     * Header merge 
     */
    handleHeaderMergedCells($, elem) {
        var tableHeaders = $(elem).find('.thead-item[data-merge]');
        
        if(tableHeaders){
            tableHeaders.each(function (index, header) {
                // Check if the current header has the data-merge attribute.
                var dataMerge = $(header).attr('data-merge');
        
                if (dataMerge) {
                    dataMerge = JSON.parse(dataMerge);
                    var startCol = dataMerge[0];
                    var numCols = dataMerge[1];
        
                    // Add parentCellstart class to the starting cell
                    $(header).addClass('parentCellstart');
                    
                    $(header).css({
                        'text-align': 'center',
                    });
        
                    // Update colspan attribute
                    $(header).attr('colspan', numCols);
        
                    // Get the next cell in the row
                    var nextCell = $(header).next();
        
                    // Loop through numCols starting from 1
                    for (var i = 1; i < numCols; i++) {
                        if (nextCell && nextCell.length) {
                            $(nextCell).addClass('childCell');
                            // nextCell.style.display = 'none'; 
                            nextCell = $(nextCell).next();
                        }
                    }
    
                    $(elem).find('.childCell').css('display', 'none');
    
                }
            });
        }
    }

    /**
     * Table body merge
     * @param {* table body merge} $ 
     * @param {*} elem 
     */

    handleMergedCells($, elem) {
        var tableRows = $(elem).find('.gswpts_rows');
    
        tableRows.each(function () {
            var cells = $(this).find('td');
    
            cells.each(function () {
                if ($(this).hasClass('parentCellstart')) {

                    // Apply the logic from the previous conversation here
                    var dataMerge = JSON.parse($(this).attr('data-merge'));
                    var dataIndex = JSON.parse($(this).attr('data-index'));
    
                    for (var i = 0; i < dataMerge[0]; i++) {
                        for (var j = 0; j < dataMerge[1]; j++) {
                            var targetIndex = [
                                dataIndex[0] + i,
                                dataIndex[1] + j
                            ];
    
                            var targetCell = $(elem).find('[data-index="[' + targetIndex.join(',') + ']"]');
    
                            if (targetCell) {
                                var cellDivContent = targetCell.find('.cell_div').text().trim();
                                if (cellDivContent === '') {
                                    targetCell.addClass('merged-cell');
                                    targetCell.hide();

                                    if ($(this).hasClass('parentCellstart')) {
                                        $(this).css({
                                            'text-align': 'center',
                                            'vertical-align': 'middle'
                                        });
                                    }
                                } else {
                                    targetCell.addClass('normal-cell');
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {Calculate the width and fixed the header issues, zoom in/out issues} $ 
     * @param {*} Add dynamic table width in header from body td calculated on tr
     * @returns 
     */
    handleTableWidth($, elem) {
        // Store the original table widths to prevent continuous reduction.
        if (!window.originalTableWidths) {
            window.originalTableWidths = {};
        }
    
        function setConsistentTableWidth(container) {
            var tableId = $(container).attr('id') || 'table-' + Math.random().toString(36).substring(2, 10);

            var table = $(container).find(".ui.celled.display.table.gswpts_tables.dataTable.no-footer");
            
            // Get container width as a fallback.
            var containerWidth = $(container).width();
            
            // Get the first visible row.
            var row = $(container).find("tr.gswpts_rows:visible").first();
            
            if (row.length > 0) {
                var rect = row[0].getBoundingClientRect();
                var rowWidth = rect.width;
                
                // Check if this is the first time we're setting width for this table.
                if (!window.originalTableWidths[tableId]) {
                    // For tables with 4 or fewer columns, use container width instead of row width
                    if ($(row).find('td, th').length <= 4) {
                        window.originalTableWidths[tableId] = containerWidth;
                    } else {
                        window.originalTableWidths[tableId] = rowWidth;
                    }
                }
                
                // Use the stored original width
                var targetWidth = window.originalTableWidths[tableId];
                
                // Make sure the width is never less than the container
                if (targetWidth < containerWidth * 0.95) {
                    targetWidth = containerWidth;
                }
                
                // Apply the width to the table
                table.css('width', targetWidth + "px");
                
                // Ensure headers have proper width
                var headers = table.find("th");
                if (headers.length > 0) {
                    headers.each(function() {
                        var headerWidth = $(this).width();
                        if (headerWidth === 0) {
                            $(this).css('width', 'auto');
                        }
                    });
                }
            } else {
                // If no visible rows, use container width
                table.css('width', containerWidth + "px");
            }
        }
        
        if (elem.prevObject && elem.prevObject.length > 0) {
            elem = elem.prevObject;
        }
        
        if (elem.length === 0) {
            return;
        }
        
        // Apply width setting to each table container
        elem.each(function(index, container) {
            setConsistentTableWidth(container);
        });
        
        // Handle resize events
        $(window).off('resize.tableWidth').on('resize.tableWidth', function() {
            elem.each(function(index, container) {
                setConsistentTableWidth(container);
            });
        });
    }

        

    /**
     * Handle paginations
     */
    handlePaginations($, elem) {
        // Store reference to 'this' for use inside nested functions
        const self = this;
        
        function updatePaginationContent(container, style) {
            // Find the previous/next buttons and check if they have the correct span structure
            var prevButton = container.find('.paginate_button.previous');
            var nextButton = container.find('.paginate_button.next');
            
            // Handle Previous button
            if (prevButton.length) {
                var prevSpan = prevButton.find('span[class*="paging-backward-"]');
                
                // If span doesn't exist or lost its class, recreate it
                if (!prevSpan.length || prevSpan.text() === 'Previous' || prevSpan.text() === 'Next') {
                    var content = '';
                    if (style === 'simple_pagination') {
                        content = self.PaginationTailwindBack1;
                    } else if (style === 'modern_pagination') {
                        content = '← ' + gswpts_frontend_data.strings['previous'].toUpperCase();
                    } else if (style === 'tailwind_pagination') {
                        content = self.PaginationTailwindBack2;
                    } else if (style === 'outlined_pagination') {
                        content = self.PaginationTailwindBack1;
                    } else {
                        content = gswpts_frontend_data.strings['previous'];
                    }
                    prevButton.html(`<span class='paging-backward-${style}'>${content}</span>`);
                }
            }
            
            // Handle Next button
            if (nextButton.length) {
                var nextSpan = nextButton.find('span[class*="paging-forward-"]');
                
                // If span doesn't exist or lost its class, recreate it
                if (!nextSpan.length || nextSpan.text() === 'Next' || nextSpan.text() === 'Previous') {
                    var content = '';
                    if (style === 'simple_pagination') {
                        content = self.PaginationTainwildNext1;
                    } else if (style === 'modern_pagination') {
                        content = gswpts_frontend_data.strings['next'].toUpperCase() + ' →';
                    } else if (style === 'tailwind_pagination') {
                        content = self.PaginationTainwildNext2;
                    } else if (style === 'outlined_pagination') {
                        content = self.PaginationTainwildNext1;
                    } else {
                        content = gswpts_frontend_data.strings['next'];
                    }
                    nextButton.html(`<span class='paging-forward-${style}'>${content}</span>`);
                }
            }
        }
        

        // Find the pagination containers within the specified element
        var tablePage = $(elem).find('.dataTables_paginate.paging_simple_numbers');

        if (tablePage.length) {
            tablePage.each(function () {
                var container = $(this);
                // console.log(container)
                var style = ''; // Variable to store the detected style

                // Check for simple pagination
                if (container.find('.paging-forward-simple_pagination, .paging-backward-simple_pagination, .paging-first-simple_pagination, .paging-last-simple_pagination').length) {
                    container.addClass('simple-pagination-active');
                    style = 'simple_pagination';
                } 
                
                else if (container.find('.paging-forward-modern_pagination, .paging-backward-modern_pagination, .paging-first-modern_pagination, .paging-last-modern_pagination').length) {
                    container.addClass('modern-pagination-active');
                    style = 'modern_pagination';
                }
                
                else if (container.find('.paging-forward-tailwind_pagination, .paging-backward-tailwind_pagination, .paging-first-tailwind_pagination, .paging-last-tailwind_pagination').length) {
                    container.addClass('tailwind-pagination-active');
                    style = 'tailwind_pagination';
                }

                else if (container.find('.paging-forward-outlined_pagination, .paging-backward-outlined_pagination, .paging-first-outlined_pagination, .paging-last-outlined_pagination').length) {
                    container.addClass('outlined-pagination-active');
                    style = 'outlined_pagination';
                }
                
                else if (container.find('.paging-forward-default_pagination, .paging-backward-default_pagination, .paging-first-default_pagination, .paging-last-default_pagination').length) {
                    container.addClass('default-pagination-active');
                    style = 'default_pagination';
                } 
                
                else if (container.find('.paging-forward-undefined, .paging-backward-undefined, .paging-first-undefined, .paging-last-undefined').length) {
                    container.addClass('default-preset-pagination-active');
                    style = 'default_preset_pagination';
                }

                // Initial update of the pagination content
                updatePaginationContent(container, style);

                // Attach event listener to update content on pagination click
                container.on('click', function () {
                    updatePaginationContent(container, style);
                });


                // Trigger pagination design 
                var sortingElements = document.querySelectorAll('.sorting');
                var dataTablesLength = document.querySelectorAll('.dataTables_length');
                var dataTables_filter = document.querySelectorAll('.dataTables_filter');
                var createTablesFilterInputs = document.querySelectorAll('.dataTables_filter input');

                sortingElements.forEach(function (sortingElement) {
                    sortingElement.addEventListener('click', function () {
                        updatePaginationContent(container, style);
                    });
                });
            
                // Add a click event listener to each dataTablesLength element
                dataTablesLength.forEach(function (LengthElement) {
                    LengthElement.addEventListener('click', function () {
                        updatePaginationContent(container, style);
                        
                    });
                });
            
                // Add a click event listener to each dataTables_filter element
                dataTables_filter.forEach(function (FilterElement) {
                    FilterElement.addEventListener('click', function () {
                        updatePaginationContent(container, style);
                    });
                });

                createTablesFilterInputs.forEach(function (createTablesFilterInput) {
                    createTablesFilterInput.addEventListener('input',function () {
                        updatePaginationContent(container, style);
                       
                    });
                });

                
            });
        }
    }

    // ========== HELPER FUNCTIONS ::  Filter System start ==========

    /**
     * Setup filter configuration based on backend settings
     */
  
    setupFilterConfiguration(table_settings) {
        const enable_column_filtering = table_settings?.column_filtering?.enable_column_filtering || false;
        const COLUMN_FILTERS          = table_settings?.column_filtering?.column_filters          || [];
        const HIDE_ENTIRE_FILTER_UI   = table_settings?.column_filtering?.hide_entire_filter_ui   || false;
        const filter_display_mode     = table_settings?.column_filtering?.filter_display_mode     || 'horizontal';
        const filter_location         = table_settings?.column_filtering?.filter_location         || 'above_table';
        const filter_position         = table_settings?.column_filtering?.filter_position         ||
                                        table_settings?.user_auth_filtering?.search_position       || 'above_table';
        const filter_title            = table_settings?.column_filtering?.filter_title            || '';
        const hide_clear_button       = table_settings?.column_filtering?.hide_clear_button       || false;
    
        // ── New flat auth settings ──
        const enable_auth_auto_select = table_settings?.user_auth_filtering?.enable_auth_auto_select || false;
        const userAuth                = gswpts_frontend_data?.user_auth || {};
        const userIsLoggedIn          = userAuth.logged_in === true;
    
        let filterSystem     = null;
        let authFilterConfig = null;
    
        if (enable_auth_auto_select && userIsLoggedIn) {
            authFilterConfig = this.setupAuthFilters(table_settings, userAuth);
            if (authFilterConfig && authFilterConfig.hasFilters) {
                filterSystem = 'auth';
            }
        }
    
        if (!filterSystem && enable_column_filtering) {
            filterSystem = 'column';
        }
    
        return {
            shouldInitialize: filterSystem !== null,
            filterSystem,
            config: {
                COLUMN_FILTERS,
                HIDE_ENTIRE_FILTER_UI,
                filter_display_mode,
                filter_location,
                filter_position,
                hide_clear_button,
                filter_title,
            },
            authConfig: authFilterConfig,
        };
    }

    /**
     * Setup authentication-based filters
     */
    
    initializeFilterSystem($, api, table_settings, filterConfig) {
        const { filterSystem, config, authConfig } = filterConfig;

        const initKey = 'data-swptls-' + filterSystem + '-initialized';
        if (api.table().node().hasAttribute(initKey)) return;
        api.table().node().setAttribute(initKey, 'true');

        const tableWrapper = $(api.table().container());

        // ✅ Auth filter: hideEntireUI always true — never read from settings
        const hideEntireUI = filterSystem === 'auth'
            ? true
            : config.HIDE_ENTIRE_FILTER_UI;

        const displayMode    = filterSystem === 'auth' ? 'horizontal' : (config.filter_display_mode || 'horizontal');
        const filterLocation = filterSystem === 'auth'
            ? (config.filter_position === 'footer' ? 'below_table' : 'above_table')
            : config.filter_location;

        const filterTitle = filterSystem === 'auth' ? '' : (config.filter_title || '');

        const allFilters    = [];
        const hiddenFilters = [];

        if (displayMode === 'inline') {
            this.initInlineFilters($, api, filterConfig, allFilters, hiddenFilters, hideEntireUI);

        } else {
            const filterContainer = this.createFilterContainer($, tableWrapper, filterLocation, filterSystem, displayMode, filterTitle);

            if (hideEntireUI) filterContainer.hide();

            if (filterSystem === 'auth') {
                this.initAuthFilters($, api, filterContainer, authConfig, allFilters, hiddenFilters, hideEntireUI);
            } else {
                this.initColumnFilters($, api, filterContainer, config, allFilters, hiddenFilters, hideEntireUI);
            }

            // ✅ Clear button: never show for auth — structurally gated, no settings can override
            if (!hideEntireUI && allFilters.length > 0) {
                const shouldShowClear = filterSystem !== 'auth' && !config.hide_clear_button;
                if (shouldShowClear) {
                    this.addClearButton($, api, filterContainer, allFilters, filterSystem, filterConfig);
                }
            }

            if (displayMode === 'horizontal') {
                this.setupScrollSync($, tableWrapper, filterContainer);
            }
        }

    }

    /**
     * No native sidebar found.
     * Build a flex-row layout by inserting a wrapper SIBLING to the tableWrapper
     * and moving the tableWrapper inside it — this avoids wrapping the DataTables
     * container directly (which would break scrollX/scrollY).
     *
     */
    injectSidebarLayout($, tableWrapper, filterContainer, side) {
        // Idempotency check — if already wrapped, just insert the filter
        if (tableWrapper.parent().hasClass('swptls-sidebar-layout')) {
            const flexRow = tableWrapper.parent();
            if (side === 'left') {
                flexRow.prepend(filterContainer);
            } else {
                flexRow.append(filterContainer);
            }
            return;
        }

        // Create the flex row wrapper
        const flexRow = $(
            '<div class="swptls-sidebar-layout"' +
            ' style="display:flex;flex-direction:row;align-items:flex-start;' +
            'gap:12px;width:100%;box-sizing:border-box;"></div>'
        );

      
        tableWrapper.before(flexRow);

        // The table wrapper must fill remaining space and allow its own overflow
        tableWrapper.css({
            'flex':      '1 1 auto',
            'min-width': '0',        // crucial: prevents flex child from overflowing
            'overflow':  'visible',  // let DataTables manage its own scroll containers
        });

        if (side === 'left') {
            flexRow.append(filterContainer);
            flexRow.append(tableWrapper);
        } else {
            flexRow.append(tableWrapper);
            flexRow.append(filterContainer);
        }

        // console.log('GSWPTS: Created sidebar layout (' + side + ') without wrapping DataTables container');
    }
    
    // ========== HELPER FUNCTIONS :: Filter System ==========

    /**
     * Setup authentication-based filters
     */
    setupAuthFilters(table_settings, userAuth) {
        const authSettings = table_settings?.user_auth_filtering || {};
    
        const enabled            = authSettings.enable_auth_auto_select || false;
        const matchUserBy        = authSettings.match_user_by        || 'email';   // WP user field
        const matchColumnIndex   = authSettings.match_column_index   ?? 0;         // sheet column
    
        if (!enabled || !userAuth.logged_in) return null;
    
        const matchedValue = userAuth[matchUserBy] ?? null;
    
        if (matchedValue === null || matchedValue === undefined || matchedValue === '') {
            return { hasFilters: false, defaultValues: {} };
        }
    
        // Normalise: roles is an array, everything else is a scalar
        const isArray   = Array.isArray(matchedValue);
        const filterVal = isArray ? matchedValue : matchedValue.toString();
    
        const authDefaultValues = {
            [matchColumnIndex]: {
                type:               'text',       // always exact-text match
                value:              isArray ? '' : filterVal,
                values:             isArray ? filterVal : [],
                enabled:            true,
                change_not_allowed: true,         // user cannot override their own filter
                hide_filter:        true,         // never expose auth filter UI
            },
        };
    
        return {
            hasFilters:            true,
            defaultValues:         authDefaultValues,
            hide_entire_filter_ui: true,   // always hidden — structural, not a setting
            auth_strict_mode:      true,   // always exact match
            hide_clear_button:     true,   // never show clear for auth
        };
    }

    /**
     * Create filter container
     */
    createFilterContainer($, tableWrapper, filterLocation, filterSystem, displayMode, filterTitle = '') {
        const filterId = 'swptls-filters-' + Math.random().toString(36).substr(2, 9);

        const containerClasses = [
            'swptls-filter-container',
            'swptls-' + filterSystem + '-filters',
            'swptls-mode-' + displayMode,
        ].join(' ');

        const filterContainer = $(
            '<div id="' + filterId + '" class="' + containerClasses + '" role="search" aria-label="Table filters"></div>'
        );

        // ✅ Build title element (reused below)
        const titleEl = filterTitle
            ? $(
                '<div class="swptls-filter-title">' +
                '<span class="swptls-filter-title__text">' + filterTitle + '</span>' +
                '</div>'
            )
            : null;

        if (filterLocation === 'above_table') {
            filterContainer.addClass('swptls-filter-container--above');

            // ✅ Title sits OUTSIDE the scrollable container, above it
            if (titleEl) {
                tableWrapper.prepend(filterContainer);
                filterContainer.before(titleEl);
            } else {
                tableWrapper.prepend(filterContainer);
            }

        } else if (filterLocation === 'below_table') {
            filterContainer.addClass('swptls-filter-container--below');

            // ✅ Title sits OUTSIDE, above the container (still reads top→bottom)
            if (titleEl) {
                tableWrapper.append(titleEl);
                tableWrapper.append(filterContainer);
            } else {
                tableWrapper.append(filterContainer);
            }

        } else if (filterLocation === 'left_sidebar' || filterLocation === 'right_sidebar') {
            const side = filterLocation === 'left_sidebar' ? 'left' : 'right';
            filterContainer.addClass('swptls-filter-container--sidebar swptls-filter-container--sidebar-' + side);

            // ✅ Sidebar: title stays INSIDE (column layout, no horizontal scroll issue)
            if (titleEl) {
                filterContainer.append(titleEl);
            }

            const injected = this.injectIntoNativeSidebar($, tableWrapper, filterContainer, side);
            if (!injected) {
                this.injectSidebarLayout($, tableWrapper, filterContainer, side);
            }

        } else {
            filterContainer.addClass('swptls-filter-container--above');
            if (titleEl) {
                tableWrapper.prepend(filterContainer);
                filterContainer.before(titleEl);
            } else {
                tableWrapper.prepend(filterContainer);
            }
        }

        return filterContainer;
    }

    /**
     * Try to inject filterContainer into an existing aside/.sidebar element
     */
    injectIntoNativeSidebar($, tableWrapper, filterContainer, side) {
        const sidebarSelectors = [
            'aside',
            '[class*="sidebar"]',
            '[class*="side-bar"]',
            '[class*="side_bar"]',
            '.widget-area',
            '#secondary',
        ].join(',');

        let node = tableWrapper.parent();
        for (let i = 0; i < 5; i++) {
            if (!node || !node.length || node.is('body, html')) break;

            const siblings = node.children();
            let nativeSidebar = null;

            siblings.each(function () {
                if ($(this).is(sidebarSelectors)) {
                    const rowParent   = node.parent();
                    const rowChildren = rowParent.children();
                    const nodeIdx     = rowChildren.index(node);
                    const siblingIdx  = rowChildren.index($(this));

                    if (side === 'left'  && siblingIdx < nodeIdx) { nativeSidebar = $(this); }
                    if (side === 'right' && siblingIdx > nodeIdx) { nativeSidebar = $(this); }
                }
            });

            if (nativeSidebar) {
                nativeSidebar.append(filterContainer);
                // console.log('GSWPTS: Injected filter into native sidebar (' + side + ')', nativeSidebar[0]);
                return true;
            }

            node = node.parent();
        }

        return false;
    }

    /**
     * Build a flex-row sidebar layout without wrapping the DataTables container
     */
    injectSidebarLayout($, tableWrapper, filterContainer, side) {
        if (tableWrapper.parent().hasClass('swptls-sidebar-layout')) {
            const flexRow = tableWrapper.parent();
            if (side === 'left') {
                flexRow.prepend(filterContainer);
            } else {
                flexRow.append(filterContainer);
            }
            return;
        }

        const flexRow = $('<div class="swptls-sidebar-layout"></div>');

        tableWrapper.before(flexRow);
        tableWrapper.addClass('swptls-sidebar-layout__table');

        if (side === 'left') {
            flexRow.append(filterContainer);
            flexRow.append(tableWrapper);
        } else {
            flexRow.append(tableWrapper);
            flexRow.append(filterContainer);
        }

        // console.log('GSWPTS: Created sidebar layout (' + side + ') without wrapping DataTables container');
    }

    // ========== COLUMN FILTER INITIALIZER ==========

    initColumnFilters($, api, filterContainer, config, allFilters, hiddenFilters, hideEntireUI) {
        const columnFiltersMap = this.buildColumnFiltersMap(config.COLUMN_FILTERS);
        const self = this;

        api.columns().every(function () {
            const column      = this;
            const columnIndex = column.index();
            const title       = column.header().textContent.trim();
            const filterInfo  = self.getColumnFilterInfo(columnIndex, columnFiltersMap);

            if (!filterInfo.isEnabled) return;

            const result = self.createFilterElement($, column, columnIndex, title, filterInfo, hideEntireUI, false);

            if (result.shouldCreateUI) {
                filterContainer.append(result.group);
                allFilters.push(result.element);
            }
            if (result.hiddenFilter) {
                hiddenFilters.push(result.hiddenFilter);
            }
        });
    }

    // ========== INLINE FILTER INITIALIZER ==========

    initInlineFilters($, api, filterConfig, allFilters, hiddenFilters, hideEntireUI) {
        const { filterSystem, config, authConfig } = filterConfig;
        const self           = this;
        const tableNode      = $(api.table().node());
        const isAuth         = filterSystem === 'auth';
        const isHidden       = hideEntireUI;
        const filterLocation = config.filter_location || 'below_table';
        const placeAbove     = filterLocation === 'above_table';
 
        const columnFiltersMap = isAuth ? null : self.buildColumnFiltersMap(config.COLUMN_FILTERS);
        const totalColumns     = api.columns().count();
 
        const filterRow = $(
            '<tr class="swptls-inline-filter-row" role="row" aria-label="Column filters"></tr>'
        );
 
        for (let colIdx = 0; colIdx < totalColumns; colIdx++) {
            const column = api.column(colIdx);
            const title  = column.header().textContent.trim();
            const td     = $('<td class="swptls-inline-filter-cell"></td>');
 
            let filterInfo;
            if (isAuth) {
                const authColCfg = authConfig.defaultValues[colIdx];
                if (!authColCfg || !authColCfg.enabled) { filterRow.append(td); continue; }
                filterInfo = {
                    isEnabled:  true,
                    type:       authColCfg.type,
                    value:      authColCfg.type === 'multi_select' ? '' : (authColCfg.value || ''),
                    values:     authColCfg.type === 'multi_select'
                                    ? (Array.isArray(authColCfg.value) ? authColCfg.value : [authColCfg.value])
                                    : [],
                    isLocked:   authColCfg.change_not_allowed === true,   // ✅ FIXED
                    isHidden:   authColCfg.hide_filter === true,
                    strictMode: authConfig.auth_strict_mode,
                };
            } else {
                filterInfo = self.getColumnFilterInfo(colIdx, columnFiltersMap);
            }
 
            if (!filterInfo.isEnabled) { filterRow.append(td); continue; }
 
            if (filterInfo.isHidden || isHidden) {
                const hasValue = (filterInfo.type === 'multi_select' && filterInfo.values.length > 0) ||
                                (filterInfo.type !== 'multi_select' && filterInfo.value);
                if (hasValue) {
                    self.applyColumnFilter(column, filterInfo.type, filterInfo.value, filterInfo.values, filterInfo.strictMode);
                    hiddenFilters.push({ column, columnIndex: colIdx, type: filterInfo.type });
                }
                filterRow.append(td);
                continue;
            }
 
            const el = self.buildFilterInput($, column, colIdx, title, filterInfo, isAuth);
 
            if ((filterInfo.type === 'multi_select' && filterInfo.values.length > 0) ||
                (filterInfo.type !== 'multi_select' && filterInfo.value)) {
                self.applyColumnFilter(column, filterInfo.type, filterInfo.value, filterInfo.values, filterInfo.strictMode);
            }
 
            allFilters.push(el);
            td.append(el);
            filterRow.append(td);
        }
 
        if (!isHidden && allFilters.length > 0) {
            const shouldShowClear = !isAuth && !(filterConfig.config?.hide_clear_button || false);

            if (shouldShowClear) {
                const clearTd  = $('<td class="swptls-inline-filter-cell swptls-inline-filter-cell--clear"></td>');
                const clearBtn = $(
                    '<button type="button" class="swptls-btn swptls-btn--clear swptls-btn--sm" aria-label="Clear all filters">Clear</button>'
                );
                clearTd.append(clearBtn);
                filterRow.append(clearTd);
                clearBtn.on('click', function () {
                    self._clearAllFilters($, api, allFilters, filterSystem, filterConfig);
                });
            }
        }
 
        filterRow.on('click mousedown', function (e) { e.stopPropagation(); });
 
        function insertFilterRow() {
            if (placeAbove) {
                const thead = tableNode.find('thead');
                if (!thead.find(filterRow).length) thead.append(filterRow);
            } else {
                let tfoot = tableNode.find('tfoot');
                if (!tfoot.length) { tfoot = $('<tfoot></tfoot>'); tableNode.append(tfoot); }
                if (!tfoot.find(filterRow).length) tfoot.append(filterRow);
            }
        }
 
        insertFilterRow();
 
        let focusedElement = null;
        let cursorPosition = null;
 
        api.on('preDraw.dt', function () {
            const activeElement = document.activeElement;
            if (filterRow.find(activeElement).length > 0) {
                focusedElement = activeElement;
                if (activeElement.tagName === 'INPUT' && activeElement.type === 'text') {
                    cursorPosition = activeElement.selectionStart;
                }
            }
            filterRow.detach();
        });
 
        api.on('draw.dt', function () {
            insertFilterRow();
            if (focusedElement) {
                setTimeout(function () {
                    try {
                        focusedElement.focus();
                        if (cursorPosition !== null && focusedElement.tagName === 'INPUT' && focusedElement.type === 'text') {
                            focusedElement.setSelectionRange(cursorPosition, cursorPosition);
                        }
                    } catch (e) { 
                        console.log('GSWPTS: Could not restore focus:', e); 
                    }
                    focusedElement = null;
                    cursorPosition = null;
                }, 0);
            }
        });
    }

    // ========== AUTH FILTER INITIALIZER ==========

    
    initAuthFilters($, api, filterContainer, authConfig, allFilters, hiddenFilters, hideEntireUI) {
        const self = this;
    
        api.columns().every(function () {
            const column      = this;
            const columnIndex = column.index();
            const title       = column.header().textContent.trim();
            const authColCfg  = authConfig.defaultValues[columnIndex];
    
            if (!authColCfg || !authColCfg.enabled) return;
    
            const filterInfo = {
                isEnabled:  true,
                type:       authColCfg.type,
                value:      authColCfg.type === 'multi_select' ? '' : (authColCfg.value || ''),
                values:     authColCfg.type === 'multi_select'
                                ? (Array.isArray(authColCfg.value) ? authColCfg.value : [authColCfg.value])
                                : [],
                isLocked:   true,   // auth filters are always locked — user cannot change them
                isHidden:   true,   // auth filters never show UI
                strictMode: true,   // always exact-match
            };
    
            // hideEntireUI is always true for auth — hardcoded, not from caller
            const result = self.createFilterElement($, column, columnIndex, title, filterInfo, true, true);
    
            if (result.shouldCreateUI) {
                filterContainer.append(result.group);
                allFilters.push(result.element);
            }
            if (result.hiddenFilter) {
                hiddenFilters.push(result.hiddenFilter);
            }
        });
    }

    // ========== FILTER INFO HELPERS ==========

    buildColumnFiltersMap(columnFilters) {
        const map = {};
        if (Array.isArray(columnFilters)) {
            columnFilters.forEach(function (cfg) {
                if (cfg.columnIndex !== undefined) map[cfg.columnIndex] = cfg;
            });
        }
        return map;
    }

    getColumnFilterInfo(columnIndex, columnFiltersMap) {
        const cfg = columnFiltersMap[columnIndex];
        if (!cfg) return { isEnabled: false };
        if (cfg.enabled === false) return { isEnabled: false };
 
        const filterType  = cfg.type || 'text';
        const loadDefault = cfg.load_default === true;
 
        let defaultValue  = '';
        let defaultValues = [];
 
        if (loadDefault && cfg.value) {
            if (filterType === 'multi_select') {
                defaultValues = Array.isArray(cfg.value) ? cfg.value : [cfg.value];
            } else {
                defaultValue = cfg.value;
            }
        }
 
        return {
            isEnabled:  true,
            type:       filterType,
            value:      defaultValue,
            values:     defaultValues,
            isLocked:   cfg.change_not_allowed === true,   // ✅ FIXED: true means locked
            isHidden:   cfg.hide_filter === true,
            strictMode: cfg.strict_mode === true,
        };
    }

    // ========== FILTER ELEMENT FACTORY ==========

    createFilterElement($, column, columnIndex, title, filterInfo, hideEntireUI, isAuthFilter) {
        const { type: filterType, value: defaultValue, values: defaultValues,
                isLocked, isHidden, strictMode } = filterInfo;   // ✅ isLocked (was isnotDisabled)
 
        if (isHidden || hideEntireUI) {
            const hasValue = (filterType === 'multi_select' && defaultValues.length > 0) ||
                            (filterType !== 'multi_select' && defaultValue);
            if (hasValue) {
                this.applyColumnFilter(column, filterType, defaultValue, defaultValues, strictMode);
                return { shouldCreateUI: false, hiddenFilter: { column, columnIndex, type: filterType } };
            }
            return { shouldCreateUI: false };
        }
 
        const groupClasses = [
            'swptls-filter-group',
            isAuthFilter ? 'swptls-filter-group--auth' : '',
        ].filter(Boolean).join(' ');
 
        const group = $(
            '<div class="' + groupClasses + '">' +
            '<label class="swptls-filter-label" for="swptls-col-' + columnIndex + '">' +
            '<span class="swptls-filter-label__text">' + title + '</span>' +
            (isLocked ? '<span class="swptls-filter-label__lock" aria-label="Locked" aria-hidden="true">🔒</span>' : '') +
            '</label>' +
            '</div>'
        );
 
        const el = this.buildFilterInput($, column, columnIndex, title, filterInfo, isAuthFilter);
        el.attr('id', 'swptls-col-' + columnIndex);
        group.append(el);
 
        if ((filterType === 'multi_select' && defaultValues.length > 0) ||
            (filterType !== 'multi_select' && defaultValue)) {
            this.applyColumnFilter(column, filterType, defaultValue, defaultValues, strictMode);
        }
 
        return { shouldCreateUI: true, group, element: el };
    }
 
    buildFilterInput($, column, columnIndex, title, filterInfo, isAuthFilter) {
        const { type: filterType, value: defaultValue, values: defaultValues, isLocked, strictMode } = filterInfo;
 
        if (filterType === 'multi_select') {
            return this.createMultiSelectFilter($, column, columnIndex, title, defaultValues, isLocked, strictMode);
        } else if (filterType === 'select') {
            return this.createSelectFilter($, column, columnIndex, title, defaultValue, isLocked, strictMode, isAuthFilter);
        } else {
            return this.createTextFilter($, column, columnIndex, title, defaultValue, isLocked, strictMode, isAuthFilter);
        }
    }

    // ========== INPUT BUILDERS ==========

    createTextFilter($, column, columnIndex, title, defaultValue, isLocked, strictMode, isAuthFilter) {
        const inputClasses = [
            'swptls-filter-input',
            isAuthFilter ? 'swptls-filter-input--auth'     : '',
            isLocked     ? 'swptls-filter-input--disabled' : '',   // ✅ isLocked
        ].filter(Boolean).join(' ');
 
        const input = $(
            '<input type="text"' +
            ' data-column="' + columnIndex + '"' +
            ' placeholder="' + (isLocked ? 'Auto-filtered' : 'Search ' + title + '...') + '"' +
            ' value="' + (defaultValue || '') + '"' +
            ' class="' + inputClasses + '"' +
            ' aria-label="Filter ' + title + '"' +
            (isLocked ? ' disabled readonly' : '') +   // ✅ isLocked
            '/>'
        );
 
        if (!isLocked) {   // ✅ isLocked
            input.on('keyup change input', function () {
                const val = this.value;
                if (column.search() !== val) {
                    if (strictMode && val) {
                        column.search('^' + val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', true, false).draw();
                    } else {
                        column.search(val).draw();
                    }
                }
            });
        }
 
        return input;
    }

    createSelectFilter($, column, columnIndex, title, defaultValue, isLocked, strictMode, isAuthFilter) {
        const selectClasses = [
            'swptls-filter-select',
            isAuthFilter ? 'swptls-filter-select--auth'     : '',
            isLocked     ? 'swptls-filter-select--disabled' : '',   // ✅ isLocked
        ].filter(Boolean).join(' ');
 
        const select = $(
            '<select' +
            ' data-column="' + columnIndex + '"' +
            ' class="' + selectClasses + '"' +
            ' aria-label="Filter ' + title + '"' +
            (isLocked ? ' disabled' : '') +   // ✅ isLocked
            '>' +
            '<option value="">All</option>' +
            '</select>'
        );
 
        this.extractUniqueValues(column).forEach(function (val) {
            select.append(
                '<option value="' + val + '"' + (val === defaultValue ? ' selected' : '') + '>' + val + '</option>'
            );
        });
 
        select.val(defaultValue || '');
 
        if (!isLocked) {   // ✅ isLocked
            select.on('change', function () {
                const val = this.value;
                if (strictMode && val) {
                    column.search('^' + val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', true, false).draw();
                } else {
                    column.search(val, { exact: true }).draw();
                }
            });
        }
 
        return select;
    }

    createMultiSelectFilter($, column, columnIndex, title, defaultValues, isLocked, strictMode) {
        const self = this;
 
        const selectClasses = [
            'swptls-filter-multi-select',
            isLocked ? 'swptls-filter-multi-select--disabled' : '',   // ✅ isLocked
        ].filter(Boolean).join(' ');
 
        const multiSelect = $(
            '<select multiple' +
            ' data-column="' + columnIndex + '"' +
            ' class="' + selectClasses + '"' +
            ' aria-label="Filter ' + title + '"' +
            ' aria-multiselectable="true"' +
            (isLocked ? ' disabled' : '') +   // ✅ isLocked
            '>' +
            '</select>'
        );
 
        this.extractUniqueValues(column).forEach(function (val) {
            multiSelect.append(
                '<option value="' + val + '"' + (defaultValues.includes(val) ? ' selected' : '') + '>' + val + '</option>'
            );
        });
 
        multiSelect.val(defaultValues);
 
        if (!isLocked) {   // ✅ isLocked
            multiSelect.on('change', function () {
                const selected = $(this).val();
                if (selected && selected.length > 0) {
                    column.search(self.buildMultiSelectPattern(selected, strictMode), true, false).draw();
                } else {
                    column.search('').draw();
                }
            });
        }
 
        return multiSelect;
    }

    // ========== APPLY / PATTERN HELPERS ==========

    applyColumnFilter(column, filterType, defaultValue, defaultValues, strictMode) {
        if (filterType === 'multi_select') {
            column.search(this.buildMultiSelectPattern(defaultValues, strictMode), true, false).draw();
        } else if (strictMode && defaultValue) {
            column.search('^' + defaultValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', true, false).draw();
        } else {
            column.search(defaultValue, filterType === 'select').draw();
        }
    }

    buildMultiSelectPattern(values, strictMode) {
        return values.map(function (val) {
            const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return strictMode ? ('^' + escaped + '$') : escaped;
        }).join('|');
    }

    extractUniqueValues(column) {
        const result = [];
        column.data().unique().sort().each(function (d) {
            if (!d || d.toString().trim() === '') return;
            let text = d;
            if (typeof d === 'string' && d.includes('<')) {
                const div = document.createElement('div');
                div.innerHTML = d;
                text = div.textContent || div.innerText || d;
            }
            text = text.toString().trim();
            if (text && result.indexOf(text) === -1) result.push(text);
        });
        return result;
    }

    // ========== CLEAR BUTTON ==========

    addClearButton($, api, filterContainer, allFilters, filterSystem, filterConfig) {
        const self     = this;
        const isAuth   = filterSystem === 'auth';
        const btnLabel = isAuth ? 'Clear Filters' : 'Clear All';

        const clearGroup = $(
            '<div class="swptls-filter-group swptls-filter-group--clear">' +
            '<span class="swptls-filter-label swptls-filter-label--spacer" aria-hidden="true"></span>' +
            '<button type="button" class="swptls-btn swptls-btn--clear" aria-label="' + btnLabel + '">' +
            '<svg class="swptls-btn__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>' +
            '<span>' + btnLabel + '</span>' +
            '</button>' +
            '</div>'
        );

        filterContainer.append(clearGroup);

        clearGroup.find('.swptls-btn--clear').on('click', function () {
            self._clearAllFilters($, api, allFilters, filterSystem, filterConfig);
        });
    }

     _clearAllFilters($, api, allFilters, filterSystem, filterConfig) {
        const self             = this;
        const columnFiltersMap = filterSystem !== 'auth'
            ? self.buildColumnFiltersMap(filterConfig.config.COLUMN_FILTERS)
            : null;
 
        allFilters.forEach(function (filter) {
            const colIdx = parseInt(filter.attr('data-column'));
            if (filter.prop('disabled')) return;   // already skipped by disabled attr — belt-and-braces
 
            let isProtected = false;
            if (filterSystem === 'auth') {
                const ac = filterConfig.authConfig?.defaultValues?.[colIdx];
                isProtected = !!(ac && ac.change_not_allowed === true);   // ✅ FIXED: was === false
            } else {
                const cc = columnFiltersMap[colIdx];
                isProtected = !!(cc && cc.change_not_allowed === true);   // ✅ FIXED: was === false
            }
 
            if (isProtected) return;
 
            if (filter.is('select[multiple]')) {
                filter.val([]).trigger('change');
            } else if (filter.is('select')) {
                filter.val('').trigger('change');
            } else {
                filter.val('').trigger('input');
            }
        });
 
        api.columns().every(function () {
            const colIdx = this.index();
            let isProtected = false;
 
            if (filterSystem === 'auth') {
                const ac = filterConfig.authConfig?.defaultValues?.[colIdx];
                isProtected = !!(ac && ac.change_not_allowed === true);   // ✅ FIXED
            } else if (columnFiltersMap) {
                const cc = columnFiltersMap[colIdx];
                isProtected = !!(cc && cc.change_not_allowed === true);   // ✅ FIXED
            }
 
            if (!isProtected) this.search('');
        });
 
        api.draw();
    }

    // ========== SCROLL SYNC (horizontal mode only) ==========

    setupScrollSync($, tableWrapper, filterContainer) {
        const scrollBody = tableWrapper.find('.dataTables_scrollBody');

        if (scrollBody.length) {
            scrollBody.on('scroll.swptls', function () {
                filterContainer[0].scrollLeft = this.scrollLeft;
            });
            filterContainer.on('scroll.swptls', function () {
                scrollBody[0].scrollLeft = this.scrollLeft;
            });
        }

        const self = this;
        setTimeout(function () {
            if (self.syncFilterColumnWidths) self.syncFilterColumnWidths($, tableWrapper);
        }, 200);

        $(window).on('resize.swptls-filters', function () {
            if (self.syncFilterColumnWidths) self.syncFilterColumnWidths($, tableWrapper);
        });
    }

    // ========== UTILITY ==========

    checkColumnDisabled(columnIndex, filterConfig) {
        if (filterConfig.filterSystem === 'auth') {
            const ac = filterConfig.authConfig?.defaultValues?.[columnIndex];
            return !!(ac && ac.change_not_allowed === true);   // ✅ FIXED
        }
        const map = this.buildColumnFiltersMap(filterConfig.config.COLUMN_FILTERS);
        return !!(map[columnIndex] && map[columnIndex].change_not_allowed === true);   // ✅ FIXED
    }

// ========== Filter System End ==========

    /**
     * Generate and load theme style into head
     * @param {string} themeName - The theme name to be used in the CSS class names.
     */
    loadThemeStyle($, elem) {
        let themeName = '';
        let classList = $(elem).attr('class').split(/\s+/);
        let swptlsCount = 0;

        for (let className of classList) {
            if (className.startsWith('gswpts_')) {
                swptlsCount++;
                if (swptlsCount === 3) {
                    themeName = className.replace('gswpts_', '');
                    break;
                }
            }
        }

        // Check if the themeName is a default style
        if (['default-style', 'style-1', 'style-2', 'style-3', 'style-4', 'style-5', 'style-6', 'style-7', 'style-8'].includes(themeName)) {
            
            // Find the table element within the provided elem
            const tableElem = $(elem).find('table.ui.celled.display.table.gswpts_tables');

            if (tableElem.length === 0) {
                console.error('Table element not found');
                return;
            }

            const tableStyles = tableElem.attr('style');

            function getCustomPropertyValue(styleString, propertyName) {
                const regex = new RegExp(`${propertyName}:\\s*([^;]+);?`, 'i');
                const match = styleString.match(regex);
                return match ? match[1].trim() : null;
            }
            

            const paginationColors = getCustomPropertyValue(tableStyles, '--pagination-colors');

            const hexToRgba = (hex, opacity) => {
				const bigint = parseInt(hex.slice(1), 16);
				const r = (bigint >> 16) & 255;
				const g = (bigint >> 8) & 255;
				const b = bigint & 255;
			
				return `rgba(${r}, ${g}, ${b}, ${opacity})`;
			}


            let backgroundColor;
			let textColor;

            if(paginationColors){
                backgroundColor = hexToRgba(paginationColors, 0.1); 
                textColor = hexToRgba(paginationColors, 0.9); 
            }

            let defaultPaginationColor = paginationColors || '#828282';
            let simplePaginationColor = paginationColors || '#000'; 



            let styleContent = `
                .gswpts_${themeName} .dataTables_paginate a.paginate_button.item {
                    color: #000;
                }

                .gswpts_${themeName} .dataTables_paginate.default-pagination-active .paginate_button.item.active {
                    background-color: ${defaultPaginationColor} !important;
                    color: #ffffff !important;
                }

                // Simple pagination free -------------------
                .gswpts_${themeName} .simple-pagination-active .paginate_button, 
                .gswpts_${themeName} .simple-pagination-active .paginate_button.disabled, 
                .gswpts_${themeName} .simple-pagination-active .ellipsis{

                    font-size: 14px;
                    border: none;
                    // margin: 0;
                    // padding: 9px 16px;
                    margin: 5px;
                    padding: 5px 11px 4px 11px;

                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;

                }

                .gswpts_${themeName} .simple-pagination-active .pagination.menu a{
                    text-decoration: none;
                }

                .gswpts_${themeName} .dataTables_paginate.simple-pagination-active .paginate_button.item.active {
                    background-color: ${simplePaginationColor} !important;
                    color: #ffffff !important;
                }

                    
                // Tailwind -----------------------------------------
                .gswpts_${themeName} .tailwind-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .tailwind-pagination-active .paginate_button.item.next.disabled{
                    border: unset !important;
                    box-shadow: unset !important;
                }

                .gswpts_${themeName} .dataTables_paginate.tailwind-pagination-active .paginate_button.item.active {
                    background-color: ${backgroundColor} !important;
                    color: ${textColor} !important;
                    border-radius: 5px !important;
                }

                .gswpts_${themeName} .dataTables_paginate.modern-pagination-active .paginate_button.item.active {
                    background-color: ${paginationColors} !important;
                    color: #ffffff !important;
                }

                // outlined
               

                .gswpts_${themeName} .outlined-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .outlined-pagination-active .paginate_button.item.next.disabled{
                    border: unset !important;
                    box-shadow: unset !important;
                }

                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active .paginate_button.item.active {
                    background-color: #fff !important;
                    border: 1px solid ${paginationColors} !important;
                    color: ${paginationColors} !important;
                }

                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active .pagination.menu .previous
                {
                    background-color: ${paginationColors} !important;
                    color: #fff !important;
                }

                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active .pagination.menu .previous.disabled
                {
                    background-color: #F2F2F2 !important;
                    color: #666 !important;
                     svg path {
                        fill: #666 !important
                    }
                }

                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active .pagination.menu .next
                {
                    background-color: ${paginationColors} !important;
                    color: #fff !important;
                }

                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active .pagination.menu .next.disabled
                {
                    background-color: #F2F2F2 !important;
                    color: #666 !important;
                     svg path {
                        fill: #666 !important;
                    }
                }

                

            `;
            

            if (tableStyles.includes('--pagination_center: 1;')) {
                // console.log("Found");
                styleContent += `
                    .gswpts_${themeName} #create_tables_paginate#create_tables_paginate {
                        margin-left: 40% !important;
                        position: absolute;
                        margin-top: 30px;
                        margin-right: 28% !important;
                    }
                    
                `;
            }

            // Create a <style> element and append it to the head
            const styleElement = document.createElement('style');
            styleElement.id = `swptls-default-theme-pagination-${themeName}`;
            styleElement.textContent = styleContent;
            document.head.appendChild(styleElement);
        
            // return;
        }
        else{
            // Find the table element within the provided elem
            const tableElem = $(elem).find('table.ui.celled.display.table.gswpts_tables');

            if (tableElem.length === 0) {
                console.error('Table element not found');
                return;
            }

            const tableStyles = tableElem.attr('style');

            function getCustomPropertyValue(styleString, propertyName) {
                // Create a regular expression to find the property name followed by its value
                const regex = new RegExp(`${propertyName}:\\s*([^;]+);?`, 'i');
                const match = styleString.match(regex);
                return match ? match[1].trim() : null;
            }
            const paginationColors = getCustomPropertyValue(tableStyles, '--pagination-colors');

            const hexToRgba = (hex, opacity) => {
				const bigint = parseInt(hex.slice(1), 16);
				const r = (bigint >> 16) & 255;
				const g = (bigint >> 8) & 255;
				const b = bigint & 255;
			
				return `rgba(${r}, ${g}, ${b}, ${opacity})`;
			}


            let backgroundColor;
			let textColor;

            backgroundColor = hexToRgba(paginationColors, 0.1); 
			textColor = hexToRgba(paginationColors, 0.9); 


            let styleContent = `
                
                .gswpts_${themeName} table.ui.celled.display {
                    border: none;
                    border-collapse: unset;
                }   
                    
                // Pagination 
                // Default pagination -------------------------------------------//

                .gswpts_${themeName} .default-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .default-pagination-active .paginate_button.item.next.disabled
                {
                    border: 1px solid rgba(169,161,161,0.23922) !important;
                    box-shadow: unset !important;
                }

                .gswpts_${themeName} .dataTables_paginate.default-pagination-active{
                --pagination-colors: ${paginationColors};
                    a.paginate_button.item.active {
                        background-color: var(--pagination-colors) !important;
                        color: #ffffff !important;
                    }
                }

                // Modern pagination -------------------------------------------//
                
                .gswpts_${themeName} .modern-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .modern-pagination-active .paginate_button.item.next.disabled{
                    border: unset !important;
                    box-shadow: unset !important;
                }
                
                .gswpts_${themeName} .dataTables_paginate.modern-pagination-active{
                --pagination-colors: ${paginationColors};
                    a.paginate_button.item.active {
                        background-color: var(--pagination-colors) !important;
                        color: #ffffff !important;
                        border-radius: 50%;
                        border: transparent;

                    }
                }

                .paginate_button.previous.disabled {
                    opacity: 0.5;
                }

                .paginate_button.next.disabled .paging-forward-modern_pagination{
                    opacity: 0.5;
                }

                .gswpts_${themeName} .dataTables_paginate.modern-pagination-active .paginate_button{
                    box-sizing: border-box;
                    display: inline-block;
                    min-width: 1.5em;
                    padding: .5em 1em;
                    margin-left: 2px;
                    text-align: center;
                    text-decoration: none !important;
                    cursor: pointer;
                    color: inherit !important;
                    border: 1px solid transparent;
                    border-radius: 2px;
                    background: transparent;

                }

                // Simple pagination -------------------------------------------//
                
                .gswpts_${themeName} .simple-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .simple-pagination-active .paginate_button.item.next.disabled{
                    border: unset !important;
                    box-shadow: unset !important;
                }
                
                .gswpts_${themeName} .dataTables_paginate.simple-pagination-active{
                --pagination-colors: ${paginationColors};
                    a.paginate_button.item.active {
                        background-color: var(--pagination-colors) !important;
                        color: #ffffff !important;
                        border-radius: 4px;
                        border: transparent;

                    }
                }

                .paginate_button.previous.disabled {
                    opacity: 0.5;
                }

                .paginate_button.next.disabled .paging-forward-simple_pagination{
                    opacity: 0.5;
                }

                .gswpts_${themeName} .dataTables_paginate.simple-pagination-active .paginate_button{
                    box-sizing: border-box;
                    display: inline-block;
                    min-width: 1.5em;
                    padding: .5em 1em;
                    margin-left: 2px;
                    text-align: center;
                    text-decoration: none !important;
                    cursor: pointer;
                    color: inherit !important;
                    border: 1px solid transparent;
                    border-radius: 2px;
                    background: transparent;

                }

                // Tailwind pagination -------------------------------------------//
                
                .gswpts_${themeName} .tailwind-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .tailwind-pagination-active .paginate_button.item.next.disabled{
                    border: unset !important;
                    box-shadow: unset !important;
                }
                
                .gswpts_${themeName} .dataTables_paginate.tailwind-pagination-active{
                --pagination-colors: ${paginationColors};
                    a.paginate_button.item.active {
                        background-color: ${backgroundColor} !important;
                        color: ${textColor} !important;
                        border-radius: 4px;
                        border: transparent;

                    }
                }

                .paginate_button.previous.disabled {
                    opacity: 0.5;
                }

                .paginate_button.next.disabled .paging-forward-tailwind_pagination{
                    opacity: 0.5;
                }

                .gswpts_${themeName} .dataTables_paginate.tailwind-pagination-active .paginate_button{
                    box-sizing: border-box;
                    display: inline-block;
                    min-width: 1.5em;
                    padding: .5em 1em;
                    margin-left: 2px;
                    text-align: center;
                    text-decoration: none !important;
                    cursor: pointer;
                    color: inherit !important;
                    border: 1px solid transparent;
                    border-radius: 2px;
                    background: transparent;

                }

                // Outline pagination -------------------------------------------//
                
                .gswpts_${themeName} .outlined-pagination-active .paginate_button.item.previous.disabled,
                .gswpts_${themeName} .outlined-pagination-active .paginate_button.item.next.disabled{
                    border: unset !important;
                    box-shadow: unset !important;
                }
                
                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active{
                --pagination-colors: ${paginationColors};
                    a.paginate_button.item.active {
                        background-color: #ffffff !important;
                        color: var(--pagination-colors) !important;
                        border: 1px solid var(--pagination-colors) !important;
                        border-radius: 5px !important;

                    }

                    span.paging-forward-outlined_pagination{
                        background-color: var(--pagination-colors) !important;
                        color: #ffffff !important;
                        border-radius: 5px !important;
                        padding: 10px 18px;
                    }

                    .paginate_button.previous{
                        background-color: var(--pagination-colors) !important;
                        border-radius: 5px !important;
                        
                        svg path {
                            fill: #ffffff !important;
                        }
                    }

                    .paginate_button.previous.disabled {
                        background-color: #F2F2F2 !important;
                        color: #666 !important; 
                        svg path {
                            fill: #666 !important;
                        }
                    }

                    .paginate_button.next.disabled .paging-forward-outlined_pagination{
                        background-color: #F2F2F2 !important;
                        color: #666 !important; 
                        svg path {
                            fill: #666 !important;
                        }
                    }
                }
                    
                .gswpts_${themeName} .dataTables_paginate.outlined-pagination-active .paginate_button{
                    box-sizing: border-box;
                    display: inline-block;
                    min-width: 1.5em;
                    padding: .5em 1em;
                    margin-left: 2px;
                    text-align: center;
                    text-decoration: none !important;
                    cursor: pointer;
                    color: inherit !important;
                    border: 1px solid transparent;
                    border-radius: 2px;
                    background: transparent;

                }
                   
            `;


            // Check for border type
            if (tableStyles.includes('--border-type: rounded;')) {
                styleContent += `
                    .gswpts_${themeName} thead th:first-child {
                        border-radius: var(--border-radius) 0 0 0 !important
                    }
                    .gswpts_${themeName} thead th:last-child {
                        border-radius: 0 var(--border-radius) 0 0 !important
                    }
                    .gswpts_${themeName} tr:last-child td:first-child {
                        border-radius: 0 0 0 var(--border-radius) !important
                    }
                    .gswpts_${themeName} tr:last-child td:last-child {
                        border-radius: 0 0 var(--border-radius) 0 !important
                    }
                `;
            }

            
            // Outside border 
            styleContent += `
                /* .gswpts_${themeName} tbody tr td:first-child {
                    border-left: 1px solid var(--outside-border-color) !important;
                }

                .gswpts_${themeName}  tbody tr td:last-child {
                    border-right: 1px solid var(--outside-border-color) !important;
                } */

                .gswpts_${themeName} tbody tr:last-child td {
                    border-bottom: 1px solid var(--outside-border-color) !important;
                }

            `;

            // Roundeed border 
            if (tableStyles.includes('--border-type: rounded;')) {
                styleContent += `
                    .gswpts_${themeName} thead th:first-child {
                        border-radius: var(--border-radius) 0 0 0 !important;
                        border-right: none !important;
                    }

                    .gswpts_${themeName} thead th:last-child {
                        border-radius: 0 var(--border-radius) 0 0 !important;
                        border-left: none !important;
                    }

                    .gswpts_${themeName} tr:last-child td:first-child {
                        border-radius: 0 0 0 var(--border-radius) !important;
                    }

                    .gswpts_${themeName} tr:last-child td:last-child {
                        border-radius: 0 0 var(--border-radius) 0 !important;
                    }
                `;
            }

            // Check for column color activation
            if (tableStyles.includes('--active-row-column-mode: 1;') && tableStyles.includes('--column-color-active: 1;')) {
                styleContent += `
                    .gswpts_${themeName} tbody td:nth-child(odd) {
                        background-color: var(--body-bg-color-odd) !important;
                    }
                    .gswpts_${themeName} tbody td:nth-child(even) {
                        background-color: var(--body-bg-color-even) !important;
                    }
                `;
            }

            // Check for row color activation
            if (tableStyles.includes('--active-row-column-mode: 1;') && tableStyles.includes('--row-color-active: 1;')) {
                styleContent += `
                    .gswpts_${themeName} tbody tr:nth-child(even) > td {
                        background-color: var(--body-bg-color-even) !important;
                    }
                    .gswpts_${themeName} tbody tr:nth-child(odd) > td {
                        background-color: var(--body-bg-color-odd) !important;
                    }
                `;
                
            }

        

            // Hover 
            // Check for column hover activation
            if (tableStyles.includes('--hover-mode-row: 1;')) {
                styleContent += `
                    .gswpts_${themeName} tbody tr:hover td,
                    .gswpts_${themeName} tbody tr:hover th {
                        background-color: var(--hover-bg-color) !important;
                        color: var(--hover-text-color) !important;
                    }
                `;
            }

            if (tableStyles.includes('--hover-mode-col: 1;')) {
                styleContent += `
                    .gswpts_${themeName} table {
                        overflow: hidden;
                    }
                    .gswpts_${themeName} td, th{
                        border: 1px solid #999;
                        padding: 10px;
                        position: relative;
                    }
                    .gswpts_${themeName} td:hover::after { 
                        background-color: var(--hover-bg-color) !important;
                        opacity: 0.2; 
                        content: '';  
                        height: 10000px;    
                        left: 0;
                        position: absolute;  
                        top: -5000px;
                        width: 100%;
                        z-index: 1;     
                        transition: 300ms;  
                    }
                `;
            }
            

            if (tableStyles.includes('--hover-mode-none: 1;')) {
                styleContent += `
                    .gswpts_${themeName} tbody td:hover,
                    .gswpts_${themeName} tbody th:hover {
                        background-color: var(--body-bg-color);
                            color: var(--body-text-color);
                    }
                `;
            }

            if (tableStyles.includes('--pagination_center: 1;')) {
                // console.log("Found");
                styleContent += `
                    .gswpts_${themeName} #create_tables_paginate#create_tables_paginate {
                        margin-left: 40% !important;
                    }
                    
                `;
            }
            

            // Create a <style> element and append it to the head
            const styleElement = document.createElement('style');
            styleElement.id = `swptls-custom-theme-style-${themeName}`;
            styleElement.textContent = styleContent;
            document.head.appendChild(styleElement);
        }
        

        
    }


    /**
     * Sort disable and hide from table
     * @returns 
     */

    handleSortingDisable($, elem) {
        // Check if elem has a prevObject, and use it if present
        if (elem.prevObject && elem.prevObject.length > 0) {
            elem = elem.prevObject;
        }
    
        // Check if the element exists
        if (elem.length === 0) {
            // console.log("No element found within the given object.");
            return;
        }
    
        // Iterate over the table containers
        elem.each(function (index, container) {
            var wrapper = $(container).find("#create_tables_wrapper");
            var sortingHeaders = wrapper.find("th.thead-item, th.sorting_asc, th.sorting_desc"); // to hide full sorting 
    
            // Disable click and pointer events
            sortingHeaders.css({
                "pointer-events": "none", 
                "cursor": "default",     
            });
    
            // Add a class to hide the sorting icon
            sortingHeaders.each(function () {
                var element = $(this);
    
                // Add class to hide ::after icons
                element.addClass("sorting-icon-hidden");
            });
        });
    }


    // Updaet one with fix empty search click issues 
    /**
     * Search wise table show and hide 
     * @returns 
     */
    handleSearchoptions($, elem, search_by) {
        if (elem.prevObject && elem.prevObject.length > 0) {
            elem = elem.prevObject;
        }

        if (elem.length === 0) {
            // console.log("No element found within the given object.");
            return;
        }

        elem.each(function (index, container) {
            var wrapper = $(container).find("#create_tables_wrapper");
            var searchInput = wrapper.find("#create_tables_filter input[type='search']");
            var tableContainer = wrapper.find(".dataTables_scroll");
            var paginationContainer = wrapper.find(".bottom_options.bottom_options_0");

            if (searchInput.length === 0) {
                // console.log('Search input not found inside #create_tables_filter for container:', container);
                return;
            }
            if (tableContainer.length === 0) {
                // console.log('Table container not found for container:', container);
                return;
            }

            wrapper.find(".dataTables_length").hide();
           
            function toggleTableVisibility() {
                var searchTerm = searchInput.val();

                // Condition for search-by-typing
                if (search_by === 'search-by-typing') {
                    if (!searchTerm || searchTerm.length < 1) {
                        tableContainer.hide();
                        paginationContainer.hide(); // Hide pagination when table is hidden
                    } else {
                        tableContainer.show();
                        paginationContainer.show(); // Show pagination when table is visible
                    }
                } 
                // Condition for search-by-press
                else if (search_by === 'search-by-press') {
                    tableContainer.hide(); // Initially hide the table
                    paginationContainer.hide(); // Initially hide pagination

                    // Wait for the button click or Enter key event to show the table
                    $(document).on('keypress', function (event) {
                        if (event.which == 13) { // Enter key press
                            var searchTerm = searchInput.val(); // Check the value again
                            if (searchTerm && searchTerm.length >= 1) {
                                tableContainer.show(); // Show the table only if search term is valid
                                paginationContainer.show(); // Show pagination when table is visible
                            } else {
                                tableContainer.hide(); // Keep table hidden if search is empty
                                paginationContainer.hide(); // Keep pagination hidden
                                // console.log("Search is empty. Table will not be shown.");
                            }
                        }
                    });
                }
            }

            toggleTableVisibility();

            searchInput.on('input', function () {
                toggleTableVisibility();
            });

            wrapper.find("#create_tables_filter").css({ width: '100%' });
        });
    }

     /**
     * Sticky header and column 
     * @returns 
     */
    handleSticky($, elem, enable_fixed_columns, left_columns, right_columns, enable_fixed_headers, header_offset) {
        if (elem.prevObject && elem.prevObject.length > 0) {
            elem = elem.prevObject;
        }
    
        if (elem.length === 0) {
            // console.log("No element found within the given object.");
            return;
        }
    
        // Find the table and scroll elements
        const tableElem = $(elem).find('div.dataTables_scrollHead thead th');
        const bodyElem = $(elem).find('div.dataTables_scrollBody tbody td');
        const scrollElem = $(elem).find('div.dataTables_scroll');
    
        if (tableElem.length === 0) {
            console.error('Table element not found');
            return;
        }
    
        // Enable fixed headers
        if (enable_fixed_headers) {
            $(elem).find('div.dataTables_scrollHead').addClass('fixed-header-active').css({
                position: 'sticky',
                top: `${header_offset}px`,
                zIndex: 100,
                boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
            });
        }
    
        // Handle left sticky columns
        if (enable_fixed_columns && left_columns > 0) {
            let leftWidth = 0;
    
            $(tableElem).each(function (index) {
                if (index < left_columns) {
                    const columnWidth = $(this).outerWidth();
                    leftWidth += columnWidth;
    
                    // Apply sticky position for headers and add a class
                    $(this).addClass(`sticky-applied-lft sticky-left-head sticky-left-col-${index + 1}`).css({
                        position: 'sticky',
                        left: `${leftWidth - columnWidth}px`,
                        zIndex: 2,
                        boxShadow: '2px 0px 5px rgba(0,0,0,0.1)', 
                    });
    
                    // Apply sticky position for body cells and add a class
                    $(bodyElem).each(function () {
                        const cell = $(this).parent().children(`:nth-child(${index + 1})`);
                        cell.addClass(`sticky-applied-lft sticky-left-body sticky-left-col-${index + 1}`).css({
                            position: 'sticky',
                            left: `${leftWidth - columnWidth}px`,
                            zIndex: 1,
                            boxShadow: '2px 0px 5px rgba(0,0,0,0.1)', 
                        });
                    });
                }
            });
        }
    
        // Handle right sticky columns
        if (enable_fixed_columns && right_columns > 0) {
            let rightWidth = 0;
    
            $(tableElem.get().reverse()).each(function (reverseIndex) {
                const totalColumns = tableElem.length;
                const columnIndex = totalColumns - reverseIndex - 1;
    
                if (reverseIndex < right_columns) {
                    const columnWidth = $(this).outerWidth();
                    rightWidth += columnWidth;
    
                    // Apply sticky position for headers and add a class
                    $(this).addClass(`sticky-applied-rgt sticky-right-head sticky-right-col-${reverseIndex + 1}`).css({
                        position: 'sticky',
                        right: `${rightWidth - columnWidth}px`,
                        zIndex: 2,
                        boxShadow: '-2px 0px 5px rgba(0,0,0,0.1)', 
                    });
    
                    // Apply sticky position for body cells and add a class
                    $(bodyElem).each(function () {
                        const cell = $(this).parent().children(`:nth-child(${columnIndex + 1})`);
                        cell.addClass(`sticky-applied-rgt sticky-right-body sticky-right-col-${reverseIndex + 1}`).css({
                            position: 'sticky',
                            right: `${rightWidth - columnWidth}px`,
                            zIndex: 1,
                            boxShadow: '-2px 0px 5px rgba(0,0,0,0.1)', 
                        });
                    });
                }
            });
        }
    
        // Add fixed columns class for easier styling
        if (enable_fixed_columns) {
            scrollElem.addClass('fixed-col-active');
        }
    }

    


    /**
     * Create search button and disable the search auto and serch using search button
     * @returns Search button empty press issue fix 
     */
    CreateSearchoptions($, elem, search_by) {
        if (elem.prevObject && elem.prevObject.length > 0) {
            elem = elem.prevObject;
        }

        if (elem.length === 0) {
            // console.log("No element found within the given object.");
            return;
        }

        elem.each(function (index, container) {
            var table = $(container).find('#create_tables').DataTable();
            var filter_input = $(container).find('#create_tables_filter input[type="search"]').unbind();
            var wrapper = $(container).find("#create_tables_wrapper");
            var tableContainer = $(container).find(".dataTables_scroll");
            var paginationContainer = $(container).find(".bottom_options.bottom_options_0");

            // Check if search_by is 'search-by-press' and add the class
            if (search_by === 'search-by-press') {
                $(container).find('#create_tables_filter').addClass('searchBypress');
            }

            // Create Search button gswpts_frontend_data.strings['search']
            var search_button = $('<button type="button" class="ui button search-by-press search-btn"></button>')
            .text(gswpts_frontend_data.strings['search-btn'])
            .click(function () {
                var searchTerm = filter_input.val();

                // Ensure the search only triggers if there is a valid input
                if (searchTerm && searchTerm.trim().length > 0) {
                    table.search(searchTerm).draw();

                    // Show table and pagination if there is valid input
                    if (search_by === 'search-by-press') {
                        tableContainer.show();
                        paginationContainer.show(); // Show pagination when showing table
                    }
                } else {
                    // Keep the table and pagination hidden if search input is empty
                    tableContainer.hide();
                    paginationContainer.hide(); // Hide pagination when hiding table
                    /* console.log("Search input is empty. Table will not be shown."); */
                }
            });

            // Create Clear button gswpts_frontend_data.strings['clear']
            var clear_button = $('<button type="button" class="ui button search-by-press clear-btn"></button>')
            .text(gswpts_frontend_data.strings['clear-btn'])
            .click(function () {
                filter_input.val('');
                table.search('').draw();

                // Hide table and pagination when cleared
                if (search_by === 'search-by-press') {
                    tableContainer.hide();
                    paginationContainer.hide(); // Hide pagination when hiding table
                } else if (search_by === 'search-by-typing') {
                    tableContainer.hide();
                    paginationContainer.hide(); // Also handle the typing case for clear button
                }
            });

            // Append the search and clear buttons
            $(container).find('#create_tables_filter').append(search_button, clear_button);

            // Handle Enter keypress event
            $(document).keypress(function (event) {
                if (event.which == 13) { // Enter key is pressed
                    search_button.click();
                }
            });
        });
    }

    
        
    html_loader() {
        let loader = `
               <div class="ui segment gswpts_table_loader">
                        <div class="ui active inverted dimmer">
                            <div class="ui large text loader">Loading</div>
                        </div>
                        <p></p>
                        <p></p>
                        <p></p>
                </div>
            `;
        return loader;
    }

    clearOverflow() {
        if (
            /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            )
        ) {
            if (
                this.detectBrowser() == "Chrome" ||
                this.detectBrowser() == "Safari" ||
                this.detectBrowser() == "MSIE"
            ) {
                let tableScrollBody = document.querySelectorAll(
                    ".gswpts_tables_container .dataTables_scrollBody"
                );

                if (tableScrollBody) {
                    tableScrollBody.forEach((element) => {
                        if (
                            element.parentElement.parentElement.parentElement.parentElement.classList.contains(
                                "collapse_style"
                            )
                        ) {
                            element.style.overflow = "unset";
                            element.style.height = "unset";
                            element.style.maxHeight = "unset";
                        }
                    });
                }

                // this.hideEmptyCell();
            }
        }
    }

    detectBrowser() {
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
            return "Opera";
        } else if (navigator.userAgent.indexOf("Chrome") != -1) {
            return "Chrome";
        } else if (navigator.userAgent.indexOf("Safari") != -1) {
            return "Safari";
        } else if (navigator.userAgent.indexOf("Firefox") != -1) {
            return "Firefox";
        } else if (navigator.userAgent.indexOf("MSIE") != -1 || !!document.documentMode == true) {
            return "IE"; //crap
        } else {
            return "Unknown";
        }
    }

    hideEmptyCell() {
        let tableCells = document.querySelectorAll(".gswpts_tables_container td");
        if (!tableCells) return;

        tableCells.forEach((element) => {
            if (element.innerText == "") {
                // element.style.display = "none";
                element.innerText = "No data";
            }
        });
    }

    bindDragScroll($container, $scroller) {
        var $window = jQuery(window);

        var x = 0;
        var y = 0;

        var x2 = 0;
        var y2 = 0;
        var t = 0;

        $container.on("mousedown", down);
        $container.on("click", preventDefault);
        $scroller.on("mousewheel", horizontalMouseWheel); // prevent macbook trigger prev/next page while scrolling

        function down(evt) {
            if (evt.button === 0) {
                t = Date.now();
                x = x2 = evt.pageX;
                y = y2 = evt.pageY;

                $container.addClass("down");
                $window.on("mousemove", move);
                $window.on("mouseup", up);

                evt.preventDefault();
            }
        }

        function move(evt) {
            // alert("move");
            if ($container.hasClass("down")) {
                var _x = evt.pageX;
                var _y = evt.pageY;
                var deltaX = _x - x;
                var deltaY = _y - y;

                $scroller[0].scrollLeft -= deltaX;

                x = _x;
                y = _y;
            }
        }

        function up(evt) {
            $window.off("mousemove", move);
            $window.off("mouseup", up);

            var deltaT = Date.now() - t;
            var deltaX = evt.pageX - x2;
            var deltaY = evt.pageY - y2;
            if (deltaT <= 300) {
                $scroller.stop().animate(
                    {
                        scrollTop: "-=" + deltaY * 3,
                        scrollLeft: "-=" + deltaX * 3,
                    },
                    500,
                    function (x, t, b, c, d) {
                        // easeOutCirc function from http://gsgd.co.uk/sandbox/jquery/easing/
                        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
                    }
                );
            }

            t = 0;

            $container.removeClass("down");
        }

        function preventDefault(evt) {
            if (x2 !== evt.pageX || y2 !== evt.pageY) {
                evt.preventDefault();
                return false;
            }
        }

        function horizontalMouseWheel(evt) {
            evt = evt.originalEvent;
            var x = $scroller.scrollLeft();
            var max = $scroller[0].scrollWidth - $scroller[0].offsetWidth;
            var dir = evt.deltaX || evt.wheelDeltaX;
            var stop = dir > 0 ? x >= max : x <= 0;
            if (stop && dir) {
                evt.preventDefault();
            }
        }
    }

    addGrabCursonOnMouseDown(elem) {
        elem.mousedown((e) => {
            elem.css({
                cursor: "grab",
            });
        });
        elem.mouseup((e) => {
            elem.css({
                cursor: "auto",
            });
        });
    }
}
