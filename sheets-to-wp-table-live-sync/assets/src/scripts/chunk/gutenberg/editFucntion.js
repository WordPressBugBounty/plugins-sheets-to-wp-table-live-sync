import React from "react";
// import Select from "react-select";
import { Dropdown } from "semantic-ui-react";

import { saveChanges, callAlert } from "./parts/helperFunctions";
import { formatCellValues, rows_per_page, scrollHeights, redirectionValues, tableStyles, responsive_styles } from "./parts/selectValues";

const { useEffect, useRef, useState } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { Panel, PanelBody, PanelRow, SelectControl, ToggleControl } = wp.components;

var $ = jQuery.noConflict();

export default function editFucntion({ attributes, setAttributes }) {
    // const [gridError, setGridError] = useState(false);

    useEffect(() => {
        if (attributes.sortcode_id) {
            setAttributes({ table_selection: attributes.sortcode_id });
            setAttributes({ show_choose_table: true });
            setAttributes({ initializer_button_action: "choose_table" });
            fetch_data_by_id(attributes.sortcode_id);
        }
    }, []);

    const spreadsheet_container = useRef(null);
    const sheetUrlRef = useRef(null);

    function get_table_name_and_data() {
        let select_options = [{ value: "no_selection", label: "Select a table" }];
        if (attributes.saved_tables) {
            attributes.saved_tables.forEach((table) => {
                select_options.push({
                    value: parseInt(table.id),
                    label: table.table_name,
                });
            });
        }
        return select_options;
    }

    function getGridId(url) {
        if (!url || url == "") return;

        let gridID = null;

        gridID = url.match(/gid=(\w+)/);

        if (!gridID) {
            return null;
        }

        gridID = gridID[1];

        if (gridID) return gridID;

        return null;
    }   

    function fetch_data_by_url(url) {
		/* if (!isProPluginActive()) {
            const gridId = getGridId(url);

			if (gridId > 0) {
				setGridError(true);
				return false;
			} else {
				setGridError(false);
			}
		} */

        $.ajax({
            url: gswpts_gutenberg_block.admin_ajax,
            data: {
                action: "gswpts_create_table",
                name: attributes.init_table_name,
                settings: JSON.stringify(attributes.table_settings),
                sheet_url: url,
                context: "block",
                nonce: window?.gswpts_gutenberg_block?.nonce
            },
            type: "POST",
            beforeSend: () => {
                setAttributes({ show_settings: false });
                if (attributes.req_type != "save") {
                    setAttributes({ innerHTML: loader });
                    setAttributes({ btn_text: "Create" });
                }
                setAttributes({ req_type: "fetch" });
            },

            success: (res) => {
                if ( ! res.success ) {
                    callAlert("Error &#128683;", res.data.message, "error", 4);
                    setAttributes({ req_type: "fetch" });
                    setAttributes({ btn_text: "Create" });
                    setAttributes({ show_settings: false });
                    setAttributes({ innerHTML: res.data.output });

                    if (res.data.type == "empty_field") {
                        callAlert("Warning &#9888;&#65039;", res.data.output, "warning", 3);
                    }
                }



                if ( res.success ) {
                    setAttributes({ sortcode_id: res.data.id });
                    setAttributes({ req_type: "save" });
                    setAttributes({ btn_text: "Save Table" });
                    setAttributes({ innerHTML: res.data.output });
                    setAttributes({ show_settings: true });
                }

                // let tableColumns = res.data.tableColumns;
                // let formattedColumnValues = constructColumnValues(tableColumns);

                // Set the column header values in tableColumns attribute
                // setAttributes({ tableColumns: formattedColumnValues });

                // immediateSaveTable(url);
            },
            complete: (res) => {
                if (JSON.parse(res.responseText).success) {
                    let default_settings = table_default_settings();
                    let defaultRowsPerPage = default_settings.default_rows_per_page;
                    let allowSorting = default_settings.allow_sorting;
                    let verticalScroll = default_settings.vertical_scroll;
                    let dom = '<"#filtering_input"lf>rt<"#bottom_options"ip>';
                    let handle = `#${spreadsheet_container.current.id} #create_tables`;
                    setAttributes({ is_table_saved_to_db: true });

                    setTimeout(() => {
                        $(handle).DataTable(
                            table_object(defaultRowsPerPage, allowSorting, dom, verticalScroll)
                        );

                        callAlert("Successfull &#128077;", "<b>Google Sheet data fetched successfully</b>", "success", 3);
                    }, 300);

                    /* setTimeout(() => {
                        if (!isProPluginActive()) {
                            callAlert(
                                "Warning &#9888;&#65039;",
                                "<b>Live sync is limited to 30 rows.<br/><a target='blank' href='https://go.wppool.dev/DoC'>Upgrade to Pro</a> for showing full google sheet.</b>",
                                "warning",
                                10
                            );
                        }
                    }, 700); */
                }
            },
            error: (err) => {
                callAlert("Error &#128683;", "<b>Something went wrong</b>", "error", 3);
                setAttributes({ show_settings: false });
                setAttributes({ innerHTML: "<b>Something went wrong</b>" });
            },
        });
    }

    function immediateSaveTable(url) {
        $.ajax({
            url: gswpts_gutenberg_block.admin_ajax,
            data: {
                action: "gswpts_sheet_create",
                type: "save",
                table_name: attributes.init_table_name,
                table_settings: attributes.table_settings,
                file_input: url,
                source_type: "spreadsheet",
                gutenberg_req: true,
                nonce: window?.gswpts_gutenberg_block?.create_nonce
            },
            type: "POST",
            beforeSend: () => {
                setAttributes({ show_settings: false });
            },
            success: (res) => {
                if (res.data.type == "invalid_action" || res.data.type == "invalid_request") {
                    callAlert("Error &#128683;", res.data.output, "error", 4);
                }

                if (res.data.type == "empty_field") {
                    callAlert("Warning &#9888;&#65039;", res.data.output, "warning", 3);
                }

                if (res.data.type == "saved") {
                    let id = res.data.id;
                    let tableName = attributes.init_table_name;
                    setAttributes({ sortcode_id: parseInt(id) });
                    setAttributes({ is_table_saved_to_db: true });
                    setAttributes({ show_settings: true });
                    setAttributes({ table_name: tableName });

                    callAlert("Successfull &#128077;", res.data.output, "success", 3);
                }

                if (res.data.type == "sheet_exists") {
                    setAttributes({ show_settings: false });

                    setAttributes({ block_init: false });
                    setAttributes({ sheet_url: null });
                    setAttributes({ btn_text: "Create" });
                    setAttributes({ req_type: "fetch" });
                    callAlert("Warning &#9888;&#65039;", "<b>Google sheet previously saved. Try choose table instead of creating</b>", "warning", 6);
                }
            },

            error: (err) => {
                callAlert("Error &#128683;", "<b>Something went wrong</b>", "error", 3);
                setAttributes({ show_settings: false });
                setAttributes({ innerHTML: "<b>Something went wrong</b>" });
            },
        });
    }

    function table_default_settings() {
        return {
            table_title: false,
            show_description: false,
            description_position: 'above',
            table_description: '',
            default_rows_per_page: 10,
            show_info_block: false,
            responsive_table: false,
            show_x_entries: true,
            swap_filter_inputs: false,
            swap_bottom_options: false,
            allow_sorting:false,
            hide_sorting_icon: false,
            search_bar: true,
            table_export: [],
            vertical_scroll: null,
            cell_format: "expand",
            responsive_style: "default_style",
            redirection_type: "_blank",
            cursor_behavior: "left_right",
            table_cache: false,
            disable_frequent_cache: false,
            table_style: 'default-style',
            merged_support: false,
            isvertical: false,
            enable_ai_summary: false,

            //Column 
            hide_column: [],
            hide_column_mobile: [],
            hide_on_desktop_col:true,
            hide_on_mobile_col:true,

            // ROW 
            hide_rows: [],
            hide_rows_mobile: [],
            hide_on_desktop_rows:true,
            hide_on_mobile_rows:true,

            // Cells 
            hide_cell: [],
            hide_cell_mobile: [],
            hide_on_desktop_cell:true,
            hide_on_mobile_cell:true,

            import_styles: false,
            
            checkbox_support: false,
            
            allow_singleshort: false,
            columnnumber: -1,
            sorting_mode: 'asc',

            table_styles: false,
            table_img_support: false,
            img_lightbox_support: false,
            table_link_support: false,

            table_view_mode: 'default-mode',
            table_search_column: [],
            search_by: 'search-by-typing',
            enable_column_specific_search: false,

            enable_fixed_columns: false,
            left_columns: 0,
            right_columns: 0,
            fixed_headers: false,
            header_offset: 0,

            // AI-related
            enable_ai_summary: false,
            summary_prompt: 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.',
            show_regenerate_button: false,
            enable_ai_cache: false,
            show_table_prompt_fields: false,

            // Backend AI Summary
            enable_backend_ai_trigger: false,
            edit_summary_content: false,
            show_summary_in_table: false,
            summary_position_goc: 'below',
            summary_position: 'above',

            // Storage for backend AI
            backend_ai_summary: '',
            backend_summary_exists: false,

            // Column Filtering Settings
            column_filtering: {
                enable_column_search: false,
                enable_column_select: false,
                enable_column_multi_select: false,
                strict_mode: false,
                search_position: 'footer',
                hide_entire_filter_ui: false,
                load_default_filters: false,
                enable_all_column_active: false,
                default_filter_values: []
            },

            // User Authentication Filtering Settings
            user_auth_filtering: {
                enable_auth_auto_select: false,
                strict_mode: false,
                hide_entire_filter_ui: false,
                auth_filters: []
            },

            import_styles_theme_colors: {
                'default-style': {
                    headerBGColor: '#ffffff',
                    headerTextColor: '#000000',
                    bodyBGColor: '#ffffff',
                    bodyTextColorCol_1: '#333333',
                    bodyTextColorColRest: '#6B7280',
                    borderColor: '#e0e5f6',
                    hoverBGColor: '#F3F4F6',
				    hoverTextColor: '#111827',
                    paginationStyle: 'default_pagination',
                    paginationAciveBtnColor: '#828282',
                    pagination_center: false,
                },
                'style-4': {
                    headerBGColor: '#000',
                    headerTextColor: '#ffffff',
                    bodyBGColor: '#000f',
                    bodyTextColor: '#ffffff',
                   	hoverBGColor: '#504949',
					hoverTextColor: '#ebebeb',
                    paginationStyle: 'simple_pagination',
                    paginationAciveBtnColor: '#000000',
                    pagination_center: true,
                },
                'style-6': {
                    headerBGColor: '#E5F1FF',
                    headerTextColor: '#0f0f0f',
                    bodyTextColor: '#0f0f0f',
                    bodyBGColorEven: '#EBF4FF',
                    bodyBGColorOdd: '#ffffff',
                    hoverBGColor: '#D1E7FF',
					hoverTextColor: '#0a1929',
                    paginationStyle: 'tailwind_pagination',
                    paginationAciveBtnColor: '#2D74E7',
                    pagination_center: false,
                },
                'style-2': {
                    headerBGColor: '#36304a',
                    headerTextColor: '#ffffff',
                    bodyTextColor: '#0f0f0f',
                    bodyBGColorEven: '#f5f5f5',
                    bodyBGColorOdd: '#ffffff',
                    hoverBGColor: '#4a4560',
				    hoverTextColor: '#ffffff',
                    borderType: 'solid',
                    borderRadius: '10px',
                    paginationStyle: 'modern_pagination',
                    paginationAciveBtnColor: '#261C3B',
                    pagination_center: false,
                },
                'style-3': {
                    headerBGColor: '#6c7ae0',
                    headerTextColor: '#ffffff',
                    bodyTextColor: '#0f0f0f',
                    bodyBGColorEven: '#f8f6ff',
                    bodyBGColorOdd: '#ffffff',
                    hoverBGColor: '#D5CCFF',
					hoverTextColor: '#1a1a3e',
                    borderColor: '#fafafa',
                    borderType: 'solid',
                    borderRadius: '10px',
                    paginationStyle: 'outlined_pagination',
                    paginationAciveBtnColor: '#5C51E0',
                    pagination_center: false,
                },
                'style-5': {
                    headerBGColor: '#F2F2F2',
                    headerTextColor: '#333333',
                    bodyBGColor: '#ffffff',
                    bodyTextColor: '#0f0f0f',
                    hoverBGColor: '#E8E8E8',
					hoverTextColor: '#1a1a1a',
                    borderColor: '#e4e1e1',
                    borderType: 'solid',
                    borderRadius: '10px',
                    paginationStyle: 'tailwind_pagination',
                    paginationAciveBtnColor: '#2F80ED',
                    pagination_center: false,
                },
                'style-8': {
                    headerBGColor: '#E0E7FF',
                    headerTextColor: '#312E81',
                    bodyBGColor: '#ffffff',
                    bodyTextColor: '#333333',
                    bodyTextColorCol_1: '#333333',
                    bodyTextColorColRest: '#6B7280',
                    hoverBGColor: '#e4e9f8',
					hoverTextColor: '#010613',
                    borderColor: '#e0e5f6',
                    borderType: 'solid',
                    borderRadius: '10px',
                    paginationStyle: 'tailwind_pagination',
                    paginationAciveBtnColor: '#5C51E0',
                    pagination_center: false,
                },
                'style-1': {
                    headerBGColor: '#6807f9',
                    headerTextColor: '#ffffff',
                    bodyBGColorEven: '#ffffff',
                    bodyBGColorOdd: '#E9E7FF',
                    bodyTextColor: '#000',
                    borderColor: '#e0e5f6',
                    hoverBGColor: '#6807f9',
                    hoverTextColor: '#ffffff',
                    borderType: 'solid',
                    borderRadius: '10px',
                    paginationStyle: 'outlined_pagination',
                    paginationAciveBtnColor: '#5C51E0',
                    pagination_center: false,
                },
                'style-7': {
                    headerBGColor: '#8880F8',
                    headerTextColor: '#ffffff',
                    bodyBGColor: '#34344C',
                    bodyTextColor: '#ffffff',
                    hoverBGColor: '#7e78d3',
					hoverTextColor: '#f9f8ff',
                    borderType: 'solid',
                    borderRadius: '10px',
                    paginationStyle: 'simple_pagination',
                    paginationAciveBtnColor: '#34344C',
                    pagination_center: true,
                },
            },
        };
    }

    function fetch_data_by_id(id) {
        if (typeof parseInt(id) != "number") {
            setAttributes({
                innerHTML: "<h4>Choose saved table from block settings</h4>",
            });
            return;
        }

        $.ajax({
            url: gswpts_gutenberg_block.admin_ajax,
            data: {
                action: "gswpts_sheet_fetch",
                id: parseInt(id),
                nonce: window?.gswpts_gutenberg_block?.fetch_nonce
            },
            type: "POST",
            beforeSend: () => {
                setAttributes({ show_settings: false });
                setAttributes({ table_name: "" });
                setAttributes({ innerHTML: loader });
            },
            success: (res) => {
                if (res.data.type == "invalid_action" || res.data.response_type == "invalid_request") {
                    setAttributes({ innerHTML: res.data.output });
                    setAttributes({ show_settings: false });
                    setAttributes({ table_name: "" });

                    callAlert("Error &#128683;", res.data.output, "error", 4);
                }

                if ( res.data.type == "no_table_found") {
                    setAttributes({ innerHTML: res.data.message });
                    setAttributes({ show_settings: false });

                    callAlert("Error &#128683;", "<b>No table found.</b>", "error", 3);
                }

                if ( res.success) {
                    setAttributes({ innerHTML: res.data.output });
                    setAttributes({ show_settings: true });

                    // let tableColumns = res.data.tableColumns;
                    // let formattedColumnValues = constructColumnValues(tableColumns);

                    // Set the column header values in tableColumns attribute
                    // setAttributes({ tableColumns: formattedColumnValues });

                    callAlert("Successfull &#128077;", "<b>Google Sheet data fetched successfully</b>", "success", 3);
                }
            },

            error: (err) => {
                callAlert("Error &#128683;", "<b>Something went wrong</b>", "error", 3);
                setAttributes({ innerHTML: "" });
                setAttributes({ btn_text: "Create" });
            },

            complete: (res) => {
                if (JSON.parse(res.responseText).success) {
                    let table_settings = JSON.parse(res.responseText).data.table_settings;
                    let table_name = JSON.parse(res.responseText).data.name;

                    let dom = `<"#filtering_input"${table_settings.show_x_entries ? "l" : ""}${
                        table_settings.search_bar ? "f" : ""
                    }>rt<"#bottom_options"${table_settings.show_info_block ? "i" : ""}p>`;

                    let defaultRowsPerPage = table_settings.default_rows_per_page;
                    let allowSorting = table_settings.allow_sorting;
                    let verticalScroll = table_settings.vertical_scroll;
                    let cellFormat = table_settings.cell_format;
                    let redirectionType = table_settings.redirection_type;
                    let hideColumn = table_settings.hide_column;

                    setAttributes({ table_name: table_name });

                    setTimeout(() => {
                        if (isProPluginActive()) {
                            changeCellFormat(cellFormat, id);
                            changeRedirectionType(redirectionType, id);
                        }

                        // Intitiale the data table feature in gutenberg table
                        $("#" + id + " #create_tables").DataTable(table_object(defaultRowsPerPage, allowSorting, dom, verticalScroll, hideColumn));

                        update_default_attributes(table_settings);

                        let swap_filter_state = table_settings.swap_filter_inputs;
                        let swap_bottom_state = table_settings.swap_bottom_options;

                        swap_input_filter(id, swap_filter_state);
                        // swap_bottom_options(id, swap_bottom_state);
                    }, 700);
                }
            },
        });
    }

    function constructColumnValues(columns) {
        let columnValues = [];

        if (!columns) return columnValues;

        columns.forEach((column, i) => {
            columnValues.push({
                key: i,
                value: i,
                text: column,
            });
        });

        return columnValues;
    }

    function update_default_attributes(ajax_table_settings) {
        const prevSettingObj = { ...attributes.table_settings };
        prevSettingObj.show_title = ajax_table_settings.show_title;
        prevSettingObj.defaultRowsPerPage = ajax_table_settings.default_rows_per_page;
        prevSettingObj.showInfoBlock = ajax_table_settings.show_info_block;

        prevSettingObj.showXEntries = ajax_table_settings.show_x_entries;
        prevSettingObj.swapFilterInputs = ajax_table_settings.swap_filter_inputs;
        prevSettingObj.swapBottomOptions = ajax_table_settings.swap_bottom_options;
        prevSettingObj.allowSorting = ajax_table_settings.allow_sorting;
        prevSettingObj.searchBar = ajax_table_settings.search_bar;

        if (ajax_table_settings.responsive_style) {
            prevSettingObj.responsive_style = ajax_table_settings.responsive_style;
            }
            
            if (ajax_table_settings.vertical_scroll) {
                prevSettingObj.verticalScroll = ajax_table_settings.vertical_scroll;
            }

            if (ajax_table_settings.cell_format) {
                prevSettingObj.cellFormat = ajax_table_settings.cell_format;
            }
            
            if (ajax_table_settings.redirection_type) {
                prevSettingObj.redirectionType = ajax_table_settings.redirection_type;
            }
            
            // update the table cache input value
            prevSettingObj.tableCache = ajax_table_settings.table_cache;
            
        if (isProPluginActive()) {
            // update the table style input
            if (ajax_table_settings.redirection_type) {
                prevSettingObj.tableStyle = ajax_table_settings.table_style;
            }

            // Update the Hide column values to show it in input field
            if (ajax_table_settings.hide_column) {
                prevSettingObj.hideColumn = ajax_table_settings.hide_column;
            }

            // Update the Import sheet style input value
            prevSettingObj.importStyles = ajax_table_settings.import_styles;
        }
        setAttributes({ table_settings: prevSettingObj });
    }

    function table_changer(id = null, prevSettingObj) {
        let dom = `<"#filtering_input"${prevSettingObj.showXEntries ? "l" : ""}${prevSettingObj.searchBar ? "f" : ""}>rt<"#bottom_options"${
            prevSettingObj.showInfoBlock ? "i" : ""
        }p>`;
        if (id == null) {
            $("#" + spreadsheet_container.current.id + " #create_tables").DataTable(
                table_object(
                    prevSettingObj.defaultRowsPerPage,
                    prevSettingObj.allowSorting,
                    dom,
                    prevSettingObj.verticalScroll,
                    prevSettingObj.hideColumn
                )
            );
        } else {
            $("#" + id + " #create_tables").DataTable(
                table_object(
                    prevSettingObj.defaultRowsPerPage,
                    prevSettingObj.allowSorting,
                    dom,
                    prevSettingObj.verticalScroll,
                    prevSettingObj.hideColumn
                )
            );
        }
    }

    function swap_input_filter(table_id, filter_state) {
        let selector = null;

        if (table_id == null) {
            selector = spreadsheet_container.current.id;
        } else {
            selector = table_id;
        }

        /* If checkbox is checked then swap filter */

        if (filter_state) {
            $("#" + selector + " #filtering_input").css("flex-direction", "row-reverse");
            $("#" + selector + " #create_tables_length").css({
                "margin-right": "0",
                "margin-left": "auto",
            });
            $("#" + selector + " #create_tables_filter").css({
                "margin-left": "0",
                "margin-right": "auto",
            });
        } else {
            /* Set back to default position */
            $("#" + selector + " #filtering_input").css("flex-direction", "row");
            $("#" + selector + " #create_tables_length").css({
                "margin-right": "auto",
                "margin-left": "0",
            });
            $("#" + selector + " #create_tables_filter").css({
                "margin-left": "auto",
                "margin-right": "0",
            });
        }
    }

    function swap_bottom_options(table_id, bottom_state) {
        let selector = null;

        if (table_id == null) {
            selector = spreadsheet_container.current.id;
        } else {
            selector = table_id;
        }

        let pagination_menu = $("#" + selector + " #bottom_options .pagination.menu");

        let style = {
            flex_direction: "row-reverse",
            table_info_style: {
                margin_right: 0,
                margin_left: "auto",
            },
            table_paginate_style: {
                margin_right: "auto",
                margin_left: 0,
            },
        };

        if (bottom_state) {
            if (pagination_menu.children().length > 5) {
                overflow_menu_style(selector);
            } else {
                bottom_option_style(style, selector);
            }
        } else {
            if (pagination_menu.children().length > 5) {
                overflow_menu_style(selector);
            } else {
                style["flex_direction"] = "row";

                style.table_info_style["margin_left"] = 0;
                style.table_info_style["margin_right"] = "auto";

                style.table_paginate_style["margin_left"] = "auto";
                style.table_paginate_style["margin_right"] = 0;

                bottom_option_style(style, selector);
            }
        }
    }

    function overflow_menu_style(selector) {
        $("#" + selector + " #bottom_options").css("flex-direction", "column");
        $("#" + selector + " #create_tables_info").css({
            margin: "5px auto",
        });
        $("#" + selector + " #create_tables_paginate").css({
            margin: "5px auto",
        });
    }

    function bottom_option_style($arg, selector) {
        $("#" + selector + " #bottom_options").css("flex-direction", $arg["flex_direction"]);
        $("#" + selector + " #create_tables_info").css({
            "margin-left": $arg["table_info_style"]["margin_left"],
            "margin-right": $arg["table_info_style"]["margin_right"],
        });
        $("#" + selector + " #create_tables_paginate").css({
            "margin-left": $arg["table_paginate_style"]["margin_left"],
            "margin-right": $arg["table_paginate_style"]["margin_right"],
        });
    }

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

    function table_object(pageLength, ordering, dom, verticalScroll, hideColumn) {
        let obj = {
            dom: dom,
            order: [],
            responsive: true,
            lengthMenu: [
                [1, 5, 10, 15],
                [1, 5, 10, 15],
            ],
            pageLength: parseInt(pageLength),
            lengthChange: true,
            ordering: ordering,
            destroy: true,
            scrollX: true,
        };

        if (isProPluginActive()) {
            obj.lengthMenu = [
                [1, 5, 10, 15, 25, 50, 100, -1],
                [1, 5, 10, 15, 25, 50, 100, "All"],
            ];

            if (verticalScroll != "default") {
                obj.scrollY = `${verticalScroll}px`;
            }
        }

        if (screenSize() === "desktop") {
            if (hideColumn?.desktopValues) {
                obj.columnDefs = hideColumnByScreen(hideColumn.desktopValues);
            }
        } else {
            if (hideColumn?.mobileValues) {
                obj.columnDefs = hideColumnByScreen(hideColumn.mobileValues);
            }
        }

        return obj;
    }

    // Return an array that will define the columns to hide
    function hideColumnByScreen(arrayValues) {
        return [
            {
                targets: convertArrayStringToInteger(arrayValues),
                visible: false,
                searchable: false,
            },
        ];
    }

    // convert string to integer from arrays
    function convertArrayStringToInteger(arr) {
        if (!arr) return [];
        return arr.map((val) => parseInt(val));
    }
    // convert string to integer from arrays
    function convertArrayIntegerToString(arr) {
        if (!arr) return [];
        return arr.map((val) => `${val}`);
    }

    // get the current screen size of user. If greater than 740 return desktop or return mobile
    function screenSize() {
        // Desktop screen size
        if (screen.width > 740) {
            return "desktop";
        } else {
            return "mobile";
        }
    }

    function isProPluginActive() {
        if (gswpts_gutenberg_block.isProActive) {
            return true;
        } else {
            return false;
        }
    }

    // Change the cell format of the table
    function changeCellFormat(formatStyle, tableID) {
        let tableCells = null;
        if (tableID == null) {
            tableCells = $("#" + spreadsheet_container.current.id + " table th, td");
        } else {
            tableCells = $("#" + tableID + " table th, td");
        }

        switch (formatStyle) {
            case "wrap":
                $.each(tableCells, function (i, cell) {
                    $(cell).removeClass("clip_style");
                    $(cell).removeClass("expanded_style");
                    $(cell).addClass("wrap_style");
                });
                break;

            case "clip":
                $.each(tableCells, function (i, cell) {
                    $(cell).removeClass("wrap_style");
                    $(cell).removeClass("expanded_style");
                    $(cell).addClass("clip_style");
                });
                break;
            case "expand":
                $.each(tableCells, function (i, cell) {
                    $(cell).removeClass("clip_style");
                    $(cell).removeClass("wrap_style");
                    $(cell).addClass("expanded_style");
                });
                break;

            default:
                break;
        }
    }

    function changeRedirectionType(type, tableID = null) {
        let links = null;
        if (tableID == null) {
            links = $("#" + spreadsheet_container.current.id + " table a");
        } else {
            links = $("#" + tableID + " table a");
        }
        if (!links.length) return;
        $.each(links, function (i, link) {
            $(link).attr("target", type);
        });
    }

    function displayProPopup() {
        WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
    }

    return [
        <InspectorControls style="margin-top: 40px">
            <Panel header="FlexTable">
                {attributes.show_choose_table ? (
                    <PanelBody title="Choose Table" icon="media-text" initialOpen={true}>
                        <SelectControl
                            label="Select Table"
                            value={attributes.table_selection}
                            onChange={(val) => {
                                setAttributes({ table_selection: val });
                                setAttributes({
                                    sortcode_id: typeof val == "string" ? parseInt(val) : null,
                                });
                                fetch_data_by_id(val);
                            }}
                            options={get_table_name_and_data()}
                        />
                    </PanelBody>
                ) : (
                    <></>
                )}

                {attributes.show_settings ? (
                    <>
                        {/* <PanelBody title="Display Settings" icon="admin-settings" initialOpen={false}>
                            <PanelRow>
                                <ToggleControl
                                    label="Show Title"
                                    help="Enable this to show the table title in h3 tag above the table"
                                    checked={attributes.table_settings.show_title}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.show_title = !prevSettingObj.show_title;
                                        setAttributes({ table_settings: prevSettingObj });

                                        saveChanges(attributes.sortcode_id, prevSettingObj);
                                    }}
                                />
                                <br />
                            </PanelRow>

                            <PanelRow>
                                <div class="default_rows">
                                    <h5 class="header">Default rows per page</h5>
                                    <p>This will show rows per page in the frontend</p>

                                    <SelectControl
                                        label="Default rows per page"
                                        value={attributes.table_settings.defaultRowsPerPage}
                                        onChange={(val) => {
                                            const prevSettingObj = {
                                                ...attributes.table_settings,
                                            };
                                            prevSettingObj.defaultRowsPerPage = val;
                                            setAttributes({ table_settings: prevSettingObj });

                                            saveChanges(attributes.sortcode_id, prevSettingObj);

                                            table_changer(attributes.sortcode_id, prevSettingObj);

                                            swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                            swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                        }}
                                        options={rows_per_page(isProPluginActive())}
                                    />
                                </div>
                                <br />
                            </PanelRow>

                            <PanelRow>
                                <ToggleControl
                                    label="Show info block"
                                    help="Show Showing X to Y of Z entries block below the table"
                                    checked={attributes.table_settings.showInfoBlock}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.showInfoBlock = !prevSettingObj.showInfoBlock;
                                        setAttributes({ table_settings: prevSettingObj });

                                        saveChanges(attributes.sortcode_id, prevSettingObj);

                                        table_changer(attributes.sortcode_id, prevSettingObj);

                                        swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                        swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                    }}
                                />
                                <br />
                            </PanelRow>

                            {isProPluginActive() ? (
                                <PanelRow>
                                    <div class="responsive_style">
                                        <h5 class="header">Responsive Style</h5>
                                        <p>Allow the table to collapse or scroll on mobile and tablet screen.</p>

                                        <SelectControl
                                            label="Responsive Style"
                                            value={attributes.table_settings.responsive_style}
                                            onChange={(val) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };

                                                prevSettingObj.responsive_style = val;
                                                setAttributes({ table_settings: prevSettingObj });

                                                saveChanges(attributes.sortcode_id, prevSettingObj);
                                            }}
                                            options={responsive_styles(isProPluginActive(), gswpts_gutenberg_block.responsive_styles)}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            ) : null}

                            <PanelRow>
                                <ToggleControl
                                    label="Show X entries"
                                    help="Show X entries per page dropdown"
                                    checked={attributes.table_settings.showXEntries}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.showXEntries = !prevSettingObj.showXEntries;
                                        setAttributes({ table_settings: prevSettingObj });

                                        saveChanges(attributes.sortcode_id, prevSettingObj);

                                        table_changer(attributes.sortcode_id, prevSettingObj);
                                        swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                        swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                    }}
                                />
                                <br />
                            </PanelRow>

                            {isProPluginActive() ? (
                                <PanelRow>
                                    <div class="verticall_scrolling">
                                        <h5 class="header">Table Height</h5>
                                        <p>
                                            Choose the height of the table to scroll vertically. Activating this feature will allow the table to
                                            behave as sticky header
                                        </p>

                                        <SelectControl
                                            label="Vertical Scroll"
                                            value={attributes.table_settings.verticalScroll}
                                            onChange={(val) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };

                                                prevSettingObj.verticalScroll = val;
                                                setAttributes({ table_settings: prevSettingObj });

                                                saveChanges(attributes.sortcode_id, prevSettingObj);
                                                table_changer(attributes.sortcode_id, prevSettingObj);
                                                swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                                swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                            }}
                                            options={scrollHeights(isProPluginActive(), gswpts_gutenberg_block.scrollHeights)}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            ) : null}

                            {isProPluginActive() ? (
                                <PanelRow>
                                    <div class="cell_format">
                                        <h5 class="header">Format Table Cell</h5>
                                        <p>
                                            Format the table cell as like google sheet cell formatting. Format your cell as Wrap or Clip or Expanded
                                            style
                                        </p>

                                        <SelectControl
                                            label="Cell Format"
                                            value={attributes.table_settings.cellFormat}
                                            onChange={(val) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };

                                                prevSettingObj.cellFormat = val;
                                                setAttributes({ table_settings: prevSettingObj });

                                                saveChanges(attributes.sortcode_id, prevSettingObj);

                                                changeCellFormat(prevSettingObj.cellFormat, attributes.sortcode_id);

                                                table_changer(attributes.sortcode_id, prevSettingObj);
                                                swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                                swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                            }}
                                            options={formatCellValues(isProPluginActive())}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            ) : null}

                            {isProPluginActive() ? (
                                <PanelRow>
                                    <div class="redirection_type">
                                        <h5 class="header">Link Redirection Type</h5>
                                        <p>
                                            Choose your desired table style for this table. This will change the design & color of this table
                                            according to your selected table design
                                        </p>

                                        <SelectControl
                                            label="Redirection Type"
                                            value={attributes.table_settings.redirectionType}
                                            onChange={(val) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };

                                                prevSettingObj.redirectionType = val;
                                                setAttributes({ table_settings: prevSettingObj });

                                                saveChanges(attributes.sortcode_id, prevSettingObj);

                                                changeRedirectionType(prevSettingObj.redirectionType, attributes.sortcode_id);

                                                table_changer(attributes.sortcode_id, prevSettingObj);
                                                swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                                swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                            }}
                                            options={redirectionValues(isProPluginActive())}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            ) : null}

                            <PanelRow>
                                <ToggleControl
                                    label="Swap Filters"
                                    help="Swap the places of X entries dropdown and search filter input"
                                    checked={attributes.table_settings.swapFilterInputs}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.swapFilterInputs = !prevSettingObj.swapFilterInputs;
                                        setAttributes({ table_settings: prevSettingObj });
                                        swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);

                                        saveChanges(attributes.sortcode_id, prevSettingObj);
                                    }}
                                />
                                <br />
                            </PanelRow>

                            <PanelRow>
                                <ToggleControl
                                    label="Swap Bottom Elements"
                                    help="Swap the places of Showing X to Y of Z entries with table pagination filter"
                                    checked={attributes.table_settings.swapBottomOptions}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.swapBottomOptions = !prevSettingObj.swapBottomOptions;
                                        setAttributes({ table_settings: prevSettingObj });
                                        swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);

                                        saveChanges(attributes.sortcode_id, prevSettingObj);
                                    }}
                                />
                                <br />
                            </PanelRow>

                            {isProPluginActive() ? (
                                <PanelRow>
                                    <div class="table_style">
                                        <h5 class="header">Table Style</h5>
                                        <p>
                                            Choose your desired table style for this table. This will change the design & color of this table
                                            according to your selected table design
                                        </p>

                                        <SelectControl
                                            label="Choose Style"
                                            value={attributes.table_settings.tableStyle}
                                            onChange={(val) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };

                                                prevSettingObj.tableStyle = val;
                                                setAttributes({ table_settings: prevSettingObj });

                                                saveChanges(attributes.sortcode_id, prevSettingObj);

                                                table_changer(attributes.sortcode_id, prevSettingObj);
                                            }}
                                            options={tableStyles(isProPluginActive(), gswpts_gutenberg_block.tableStyles)}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            ) : null}

                            {isProPluginActive() ? (
                                <PanelRow>
                                    <div class="import_styles">
                                        <h5 class="header">Import Sheet Styles</h5>
                                        <ToggleControl
                                            label="Import Sheet Styles"
                                            help=" Import cell background color & cell font color from
                                            google sheet. If you activate this feature it will
                                            override <i>Table Style</i> settings"
                                            checked={attributes.table_settings.importStyles}
                                            onChange={(val) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };

                                                prevSettingObj.importStyles = !prevSettingObj.importStyles;

                                                setAttributes({ table_settings: prevSettingObj });

                                                saveChanges(attributes.sortcode_id, prevSettingObj);
                                            }}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            ) : null}
                        </PanelBody> */}

                        {/* <PanelBody title="Sort & Filter" icon="filter" initialOpen={false}>
                            <PanelRow>
                                <ToggleControl
                                    label="Allow Sorting"
                                    help="Enable this feature to sort table data for frontend."
                                    checked={attributes.table_settings.allowSorting}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.allowSorting = !prevSettingObj.allowSorting;
                                        setAttributes({ table_settings: prevSettingObj });
                                        table_changer(attributes.sortcode_id, prevSettingObj);
                                        swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                        swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);

                                        saveChanges(attributes.sortcode_id, prevSettingObj);
                                    }}
                                />
                                <br />
                            </PanelRow>

                            <PanelRow>
                                <ToggleControl
                                    label="Search Bar"
                                    help="Enable this feature to show a search bar in for the table. It will help user to search data in the table"
                                    checked={attributes.table_settings.searchBar}
                                    onChange={() => {
                                        const prevSettingObj = { ...attributes.table_settings };
                                        prevSettingObj.searchBar = !prevSettingObj.searchBar;
                                        setAttributes({ table_settings: prevSettingObj });
                                        table_changer(attributes.sortcode_id, prevSettingObj);
                                        swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                        swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);

                                        saveChanges(attributes.sortcode_id, prevSettingObj);
                                    }}
                                />
                                <br />
                            </PanelRow>
                        </PanelBody> */}

                        {/* {isProPluginActive() ? (
                            <PanelBody title="Table Tools" icon="admin-tools" initialOpen={false}>
                                <PanelRow>
                                    <div class="hide_column">
                                        <h5 class="header">Hide Columns In Desktop Screen:</h5>
                                        <p>Hide your table columns on desktop screen size.</p>

                                        <Dropdown
                                            placeholder=""
                                            defaultValue={
                                                attributes.table_settings.hideColumn?.desktopValues
                                                    ? convertArrayStringToInteger(attributes.table_settings.hideColumn.desktopValues)
                                                    : ""
                                            }
                                            selection
                                            multiple
                                            options={attributes.tableColumns}
                                            onChange={(e, { value }) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };
                                                prevSettingObj.hideColumn.desktopValues = convertArrayIntegerToString(value);

                                                setAttributes({ table_settings: prevSettingObj });
                                                saveChanges(attributes.sortcode_id, prevSettingObj);

                                                table_changer(attributes.sortcode_id, prevSettingObj);
                                                swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                                swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                            }}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>

                                <PanelRow>
                                    <div class="hide_column">
                                        <h5 class="header">Hide Columns In Mobile Screen:</h5>
                                        <p>Hide your table columns on mobile screen size.</p>
                                        <Dropdown
                                            placeholder=""
                                            defaultValue={
                                                attributes.table_settings.hideColumn?.mobileValues != null
                                                    ? convertArrayStringToInteger(attributes.table_settings.hideColumn.mobileValues)
                                                    : ""
                                            }
                                            selection
                                            multiple
                                            options={attributes.tableColumns}
                                            onChange={(e, { value }) => {
                                                const prevSettingObj = {
                                                    ...attributes.table_settings,
                                                };
                                                prevSettingObj.hideColumn.mobileValues = convertArrayIntegerToString(value);
                                                setAttributes({ table_settings: prevSettingObj });
                                                saveChanges(attributes.sortcode_id, prevSettingObj);

                                                table_changer(attributes.sortcode_id, prevSettingObj);
                                                swap_input_filter(attributes.sortcode_id, prevSettingObj.swapFilterInputs);
                                                swap_bottom_options(attributes.sortcode_id, prevSettingObj.swapBottomOptions);
                                            }}
                                        />
                                    </div>
                                    <br />
                                </PanelRow>
                            </PanelBody>
                        ) : null} */}
                    </>
                ) : (
                    <></>
                )}
            </Panel>
        </InspectorControls>,
        <div
            class={`gswpts_create_table_container gswpts_create_table_container gswpts_${embedTableStyleClass(attributes)}`}
            id={attributes.sortcode_id}
            style={{ marginRight: "0" }}
        >
            {" "}
            {/* {attributes.table_name != "" && attributes.table_settings.show_title ? <h3> {attributes.table_name} </h3> : <> </>}{" "} */}
            {attributes.block_init ? (
                attributes.initializer_button_action == "choose_table" ? (
                    <div id="spreadsheet_container" dangerouslySetInnerHTML={{ __html: attributes.innerHTML }}></div>
                ) : (
                    <>
                        {attributes.is_table_saved_to_db == false ? (
                            <div class="create_table_input">
                                <div>
                                    <div class="ui icon input">
                                        <input
                                            required
                                            type="text"
                                            name="table_name"
                                            placeholder="Table Name"
                                            value={attributes.init_table_name}
                                            onChange={(e) => {
                                                setAttributes({ init_table_name: e.target.value });
                                            }}
                                        />{" "}
                                    </div>

                                    <div class="ui icon input">
                                        <input
                                            required
                                            type="text"
                                            name="file_input"
                                            placeholder="Enter the google spreadsheet public url."
                                            value={attributes.sheet_url}
                                            ref={sheetUrlRef}
                                            onChange={(e) => {
                                                setAttributes({ sheet_url: e.target.value });
                                            }}
                                        />{" "}
                                        <i class="file icon"> </i>{" "}
                                    </div>

                                    <button
                                        class="ui violet button"
                                        type="button"
                                        id="fetch_save_btn"
                                        onClick={(e) => {
                                            fetch_data_by_url(attributes.sheet_url);
                                        }}
                                    >
                                        {" "}
                                        {attributes.btn_text}{" "}
                                    </button>
                                </div>
                                {/* {gridError && (<p className='swptls-grid-not-supported-error'>On free plan tables can be created from the first sheet tab only. <span onClick={displayProPopup}>Get Pro</span> to create table from any tab of your Google SpreadSheet.</p>)} */}
                            </div>
                        ) : (
                            <></>
                        )}
                        <div ref={spreadsheet_container} id="spreadsheet_container" dangerouslySetInnerHTML={{ __html: attributes.innerHTML }}></div>{" "}
                    </>
                )
            ) : (
                <div class="block_initializer">
                    <button
                        id="create_button"
                        class="positive ui button"
                        onClick={(e) => {
                            setAttributes({ block_init: true });
                            setAttributes({ initializer_button_action: "create_new" });
                            setAttributes({ innerHTML: "" });
                        }}
                    >
                        Create New &nbsp; <i class="plus icon"> </i>{" "}
                    </button>

                    <button
                        class="ui violet button"
                        type="button"
                        onClick={(e) => {
                            setAttributes({ block_init: true });
                            setAttributes({ initializer_button_action: "choose_table" });
                            setAttributes({ show_choose_table: true });
                            // document.querySelector(".interface-pinned-items > button").click();
                        }}
                    >
                        Choose Table{" "}
                    </button>
                </div>
            )}
        </div>,
    ];
}

// Inject the table style class if import style is not active
function embedTableStyleClass(attributes) {
    if (attributes.table_settings.importStyles) {
        return "default-style";
    } else {
        return attributes.table_settings.tableStyle;
    }
}
