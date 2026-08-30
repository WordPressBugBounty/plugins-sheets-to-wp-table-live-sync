import Block_Logo from "./logo";
import editFucntion from "./editFucntion";

const { registerBlockType } = wp.blocks;

registerBlockType("swptls/google-sheets-to-wp-tables", {
    title: "FlexTable",
    description:
        "Display Google Spreadsheet data to WordPress table in just a few clicks and keep the data always synced. Organize and display all your spreadsheet data in your WordPress quickly and effortlessly.",
    category: "common",
    example: {},
    icon: Block_Logo,
    keywords: ["spreadsheet", "google", "table"],
    attributes: {
        sortcode_id: {
            type: "integer",
            default: null,
        },

        block_init: {
            type: "boolean",
            default: false,
        },

        initializer_button_action: {
            type: "string",
            default: "",
        },

        show_choose_table: {
            type: "boolean",
            default: false,
        },

        btn_text: {
            type: "string",
            default: "Create",
        },

        req_type: {
            type: "string",
            default: "fetch",
        },

        init_table_name: {
            type: "string",
            default: "GSWPTS Table",
        },

        sheet_url: {
            type: "string",
            default: "",
        },

        is_table_saved_to_db: {
            type: "boolean",
            default: false,
        },

        table_selection: {
            type: "string",
            default: "no_selection",
        },

        innerHTML: {
            type: "string",
            default: "<h4>Choose table from block settings</h4>",
        },

        saved_tables: {
            type: "object",
            default: gswpts_gutenberg_block.table_details,
        },

        table_name: {
            type: "string",
            default: "",
        },

        show_settings: {
            type: "boolean",
            default: false,
        },

        table_settings: {
            type: "object",
            default: {
              
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
                
                
                table_styles: false,
                table_img_support: false,
                img_lightbox_support: false,
                table_link_support: false,

                table_view_mode: 'default-mode',
                table_search_column: [],
                search_by: 'search-by-typing',
                enable_column_specific_search: false,


                allow_singleshort: false,
                columnnumber: -1,
                sorting_mode: 'asc',

                enable_fixed_columns: false,
                left_columns: 0,
                right_columns: 0,
                fixed_headers: false,
                header_offset: 0,

                // AI Summary Settings
                enable_ai_summary: false,
                summary_source: 'generate_on_click', 
                summary_prompt: 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.',
                summary_position_goc: 'below', 
                summary_position: 'above', 
                summary_display: 'always_show', 
                summary_button_text: '✨ Generate Summary', 
                summary_title: 'Table Summary', 
                instant_summary_title: 'Table Summary', 
                summary_button_bg_color: '#3B82F6',
                summary_button_text_color: '#ffffff', 
                enable_ai_cache: false,
                
                // Ask AI Settings
                show_table_prompt_fields: false, 
                ask_ai_placeholder: 'Ask anything about this table… e.g., Top 5 products by sales', 
                ask_ai_button_label: 'Ask AI', 
                ask_ai_heading: 'Ask AI',

                // Backend AI Summary (for instant_summary source)
                backend_ai_summary: '',
                backend_summary_exists: false,
                show_regenerate_button: false,
                
                // Legacy/Deprecated (keeping for backward compatibility)
                enable_backend_ai_trigger: false,
                edit_summary_content: false,
                show_summary_in_table: false,

                // Column Filtering Settings
                column_filtering: {
                    enable_column_search: false,
                    enable_column_select: false,
                    enable_column_multi_select: false,
                    search_position: 'footer',
                    strict_mode: false,
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
                        hoverBGColor: '#F3F4F6',
				        hoverTextColor: '#111827',
                        borderColor: '#e0e5f6',
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
                        hoverBGColor: '#bdcfe4',
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
                        hoverBGColor: '#d1d1d1',
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
                        hoverBGColor: '#EDE8FC',
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
                        hoverBGColor: '#bdcfe4',
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
                        hoverBGColor: '#EDE8FC',
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
                        borderType: 'solid',
                        borderRadius: '10px',
                        paginationStyle: 'simple_pagination',
                        paginationAciveBtnColor: '#34344C',
                        pagination_center: true,
                    },
                },
                
            },
        },

        // Column Header values of table that will set on the run
        tableColumns: {
            type: "object",
            default: null,
        },
    },

    edit: editFucntion,

    save: ({ attributes }) => {
        const { sortcode_id } = attributes;
        return <>[gswpts_table id = {sortcode_id}] </>;
    },
});
