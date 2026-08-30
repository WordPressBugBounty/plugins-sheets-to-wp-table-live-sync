/**
 * AI Summary functionality for GSWPTS tables
 * Handles AI-powered table summaries with server-side pagination support
 * ES6 Module Version
 */

// Define AISummary class outside jQuery ready block
class AISummary {
    constructor() {
        this.isGenerating = false;
        this.summaryCache = new Map();
        this.$ = jQuery; // Store jQuery reference
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const $ = this.$;
        
        // Handle inline AI summary button clicks
        $(document).on('click', '.swptls-ai-summary-btn-inline', (e) => {
            e.preventDefault();
            const button = $(e.currentTarget);
            const tableId = button.data('table-id');
            const position = button.data('position') || 'above';
            const tableElement = button.closest('.gswpts_tables_container').find('table');
            
            if (tableId && tableElement.length) {
                this.generateInlineSummary(tableId, tableElement, position);
            }
        });


        // Handle inline summary close
        $(document).on('click', '.summary-action-btn.close-btn', (e) => {
            e.preventDefault();
            const tableId = $(e.currentTarget).data('table-id');
            this.closeInlineSummary(tableId);
        });

        // Handle inline summary regenerate
        $(document).on('click', '.summary-action-btn.regenerate-btn', (e) => {
            e.preventDefault();
            const button = $(e.currentTarget);
            const tableId = button.data('table-id');
            
            // Find the table element
            let tableElement = button.closest('.gswpts_tables_container').find('table');
            if (tableElement.length === 0) {
                // Try alternative ways to find the table
                tableElement = $(`.gswpts_tables_container[id="${tableId}"] table`);
                if (tableElement.length === 0) {
                    tableElement = $(`.gswpts_table_${tableId} table`);
                }
                if (tableElement.length === 0) {
                    tableElement = $(`#${tableId} table`);
                }
                if (tableElement.length === 0) {
                    tableElement = $('.gswpts_tables_container table').first();
                }
            }
            
            // Determine position from the result container
            const resultContainer = button.closest('.swptls-ai-summary-result');
            const position = resultContainer.attr('id').includes('-above') ? 'above' : 'below';
            
            if (tableId && tableElement.length) {
                this.showRegeneratingStateInline(button);
                this.showRegeneratingInInline(tableId, position);
                this.generateInlineSummary(tableId, tableElement, position, true); // Force regenerate
            } else {
                console.error('Could not find table element for regeneration');
                this.showInlineSummaryError(tableId, 'Could not find table data for regeneration.');
                this.hideRegeneratingStateInline(button);
            }
        });

    }

    generateInlineSummary(tableId, tableElement, position = 'above', forceRegenerate = false) {
        if (this.isGenerating) {
            return;
        }

        // Check if caching is enabled for this table
        const enableCache = this.getTableSpecificSetting(tableId, 'enable_ai_cache');

        // Generate cache key
        let cacheKey = this.generateCacheKey(tableId, tableElement);

        // If forcing regenerate, clear ALL related cache entries
        if (forceRegenerate) {
            this.summaryCache.delete(cacheKey);
            const cacheKeys = Array.from(this.summaryCache.keys());
            cacheKeys.forEach(key => {
                if (key.startsWith(`ai_summary_${tableId}_`)) {
                    this.summaryCache.delete(key);
                }
            });
            cacheKey = cacheKey + '_regenerate_' + Date.now();
        } else if (enableCache && this.summaryCache.has(cacheKey)) {
            // Use cached summary
            this.showInlineSummary(this.summaryCache.get(cacheKey), tableId, position);
            return;
        }

        this.isGenerating = true;
        this.showGeneratingProgressInline(tableId);

        try {
            const tableData = this.collectAllTableDataFromDataTable(tableElement);

            let table_settings = null;
            if (window.swptlsTableSettings && window.swptlsTableSettings[tableId]) {
                table_settings = window.swptlsTableSettings[tableId];
            }

            const tableSettings = this.getTableSettings(tableId, table_settings);

            // Send to backend for AI processing
            this.requestAISummaryInline(tableId, tableData, tableSettings, cacheKey, position, forceRegenerate);
        } catch (error) {
            console.error('AI Summary Error:', error);
            this.showInlineSummaryError(tableId, 'Failed to prepare table data for AI summary.');
            this.isGenerating = false;
        }
    }

    collectAllTableDataFromDataTable(tableElement) {
        const $ = this.$;
        const data = {
            headers: [],
            rows: [],
            title: '',
            totalVisibleRows: 0,
            tableStructure: {}
        };

        // Get table title
        const titleElement = tableElement.closest('.gswpts_tables_container').find('.table-title, h2, h3');
        if (titleElement.length) {
            data.title = titleElement.first().text().trim();
        }

        // Try to get DataTable instance with better error handling
        let dataTable = null;
        let isDataTableReady = false;

        try {
            // Check if DataTable is initialized and ready
            if ($.fn.DataTable.isDataTable(tableElement)) {
                dataTable = $(tableElement).DataTable();
                // Test if DataTable is fully functional
                dataTable.rows().count();
                isDataTableReady = true;
            }
        } catch (e) {
            isDataTableReady = false;
        }

        // Get headers with column information
        const headerCells = tableElement.find('thead tr:first th, thead tr:first td');
        headerCells.each((index, element) => {
            const headerText = $(element).text().trim();
            if (headerText) {
                data.headers.push({
                    index: index,
                    text: headerText,
                    type: this.detectColumnType(tableElement, index)
                });
            }
        });

        if (dataTable && isDataTableReady) {
            // Use DataTable API to get ALL data (not just visible)
            try {
                const allData = dataTable.rows().data();
                data.totalVisibleRows = allData.length;

                // Process all rows from DataTable
                allData.each((rowData) => {
                    const row = [];
                    for (let i = 0; i < rowData.length; i++) {
                        let cellText = '';

                        // Handle different data types from DataTable
                        if (typeof rowData[i] === 'string') {
                            cellText = rowData[i];
                        } else if (rowData[i] && rowData[i].innerHTML) {
                            cellText = rowData[i].innerHTML;
                        } else if (rowData[i] && rowData[i].textContent) {
                            cellText = rowData[i].textContent;
                        } else {
                            cellText = String(rowData[i] || '');
                        }

                        // Clean up HTML and extract text content
                        const $temp = $('<div>').html(cellText);

                        // Handle special content types
                        const img = $temp.find('img');
                        if (img.length) {
                            const altText = img.attr('alt') || 'Image';
                            cellText = `[Image: ${altText}]`;
                        } else {
                            const link = $temp.find('a');
                            if (link.length && !cellText.trim()) {
                                cellText = `[Link: ${link.text().trim() || 'URL'}]`;
                            } else {
                                cellText = $temp.text().trim();
                            }
                        }

                        // Limit cell content length to prevent token overflow
                        if (cellText.length > 100) {
                            cellText = cellText.substring(0, 97) + '...';
                        }
                        row.push(cellText || '');
                    }
                    if (row.length > 0) {
                        data.rows.push(row);
                    }
                });

            } catch (e) {
               // Fallback to DOM parsing
                return this.collectCurrentTableData(tableElement);
            }
        } else {
             return this.collectCurrentTableData(tableElement);
        }

        // Add table structure information
        data.tableStructure = {
            totalColumns: data.headers.length,
            totalVisibleRows: data.totalVisibleRows,
            sampleSize: data.rows.length,
            hasImages: tableElement.find('img').length > 0,
            hasLinks: tableElement.find('a').length > 0,
            hasPagination: tableElement.closest('.gswpts_tables_container').find('.pagination, .load-more-btn').length > 0
        };

        return data;
    }

    collectCurrentTableData(tableElement) {
        const $ = this.$;
        const data = {
            headers: [],
            rows: [],
            title: '',
            totalVisibleRows: 0,
            tableStructure: {}
        };

        // Get table title
        const titleElement = tableElement.closest('.gswpts_tables_container').find('.table-title, h2, h3');
        if (titleElement.length) {
            data.title = titleElement.first().text().trim();
        }

        // Get headers with column information
        const headerCells = tableElement.find('thead tr:first th, thead tr:first td');
        headerCells.each((index, element) => {
            const headerText = $(element).text().trim();
            if (headerText) {
                data.headers.push({
                    index: index,
                    text: headerText,
                    type: this.detectColumnType(tableElement, index)
                });
            }
        });

        // Get currently visible rows (respects pagination and filters)
        const visibleRows = tableElement.find('tbody tr:visible');
        data.totalVisibleRows = visibleRows.length;

        // Collect ALL visible rows for AI analysis - no artificial limits
        // The backend will handle token limits and chunking if needed
        const sampleRows = visibleRows;
        sampleRows.each((index, element) => {
            const row = [];
            $(element).find('td').each((cellIndex, cellElement) => {
                let cellText = $(cellElement).text().trim();

                // Handle special content types
                const img = $(cellElement).find('img');
                if (img.length) {
                    const altText = img.attr('alt') || 'Image';
                    cellText = `[Image: ${altText}]`;
                }

                const link = $(cellElement).find('a');
                if (link.length && !cellText) {
                    cellText = `[Link: ${link.text().trim() || 'URL'}]`;
                }

                // Limit cell content length to prevent token overflow
                if (cellText.length > 100) {
                    cellText = cellText.substring(0, 97) + '...';
                }

                row.push(cellText || '');
            });
            if (row.length > 0) {
                data.rows.push(row);
            }
        });

        // Add table structure information
        data.tableStructure = {
            totalColumns: data.headers.length,
            totalVisibleRows: data.totalVisibleRows,
            sampleSize: data.rows.length,
            hasImages: tableElement.find('img').length > 0,
            hasLinks: tableElement.find('a').length > 0,
            hasPagination: tableElement.closest('.gswpts_tables_container').find('.pagination, .load-more-btn').length > 0
        };

        return data;
    }

    detectColumnType(tableElement, columnIndex) {
        const $ = this.$;
        // Analyze first few cells to detect column type
        const cells = tableElement.find(`tbody tr:visible td:nth-child(${columnIndex + 1})`).slice(0, 5);
        let hasNumbers = 0;
        let hasDates = 0;
        let hasImages = 0;
        let hasLinks = 0;

        cells.each((index, element) => {
            const text = $(element).text().trim();
            if ($(element).find('img').length > 0) hasImages++;
            if ($(element).find('a').length > 0) hasLinks++;
            if (!isNaN(parseFloat(text)) && isFinite(text)) hasNumbers++;
            if (this.isDateString(text)) hasDates++;
        });

        if (hasImages > 0) return 'image';
        if (hasLinks > 0) return 'link';
        if (hasNumbers >= cells.length * 0.6) return 'number';
        if (hasDates >= cells.length * 0.6) return 'date';
        return 'text';
    }

    isDateString(str) {
        return !isNaN(Date.parse(str)) && str.match(/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}/);
    }

    sampleRows(rows, maxRows) {
        const $ = this.$;

        if (rows.length <= maxRows) {
            return rows;
        }

        // Intelligent sampling: take first few, last few, and some from middle
        const firstRows = Math.floor(maxRows * 0.4);
        const lastRows = Math.floor(maxRows * 0.3);
        const middleRows = maxRows - firstRows - lastRows;
        const sampled = [];

        // First rows
        for (let i = 0; i < firstRows && i < rows.length; i++) {
            sampled.push(rows[i]);
        }

        // Middle rows (evenly distributed)
        if (middleRows > 0 && rows.length > firstRows + lastRows) {
            const middleStart = firstRows;
            const middleEnd = rows.length - lastRows;
            const step = Math.floor((middleEnd - middleStart) / middleRows);

            for (let i = 0; i < middleRows; i++) {
                const index = middleStart + (i * step);
                if (index < middleEnd) {
                    sampled.push(rows[index]);
                }
            }
        }

        // Last rows
        for (let i = Math.max(0, rows.length - lastRows); i < rows.length; i++) {
            sampled.push(rows[i]);
        }

        return $(sampled);
    }

    getTableSettings(tableId, table_settings = null) {
        const $ = this.$;
        const container = $(`.gswpts_tables_container table[id*="${tableId}"]`).closest('.gswpts_tables_container');

        // Default AI settings
        const defaultAISettings = {
            show_table_prompt_fields: false,
            ask_ai_placeholder: 'Ask anything about this table… e.g., Top 5 products by sales',
            ask_ai_button_label: 'Ask AI',
            ask_ai_heading: 'Ask AI',
            backend_ai_summary: '',
            backend_summary_exists: false,
            show_regenerate_button: false,
            enable_backend_ai_trigger: false,
            edit_summary_content: false,
            show_summary_in_table: false,
            summary_prompt: 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.',
            enable_ai_cache: true,
            enable_ai_summary: false
        };

        // If table_settings are provided as parameter (from gswpts_sheet_fetch response), use them
        let tableSpecificSettings = { ...defaultAISettings };
        if (table_settings) {
            // Merge provided settings with defaults, giving priority to provided settings
            tableSpecificSettings = {
                ...defaultAISettings,
                ...table_settings
            };
        } else {
            // Fallback: Try to get from global window.swptlsTableSettings first
            if (window.swptlsTableSettings && window.swptlsTableSettings[tableId]) {
                tableSpecificSettings = {
                    ...defaultAISettings,
                    ...window.swptlsTableSettings[tableId]
                };
            } else {
                // Last resort: Get table-specific AI settings from data-table_settings attribute
                try {
                    const tableSettingsJson = container.attr('data-table_settings');
                    if (tableSettingsJson) {
                        const tableSettings = JSON.parse(tableSettingsJson);
                        tableSpecificSettings = {
                            ...defaultAISettings,
                            ...tableSettings
                        };
                    }
                } catch (e) {
                    console.warn('Failed to parse table settings for table:', tableId, e);
                }
            }
        }

        return {
            tableId: tableId,
            hasTitle: container.find('.table-title').length > 0,
            hasPagination: container.find('.pagination, .load-more-btn').length > 0,
            hasFilters: container.find('.dataTables_filter, .search-input').length > 0,
            theme: (() => {
                const className = container.attr('class');
                if (className && className.match(/gswpts_style-\d+/)) {
                    const match = className.match(/gswpts_style-(\d+)/);
                    return match ? match[1] : 'default';
                }
                return 'default';
            })(),
            // Include table-specific AI settings with defaults
            ai_settings: tableSpecificSettings
        };
    }

    getTableSpecificSetting(tableId, settingKey) {
        const $ = this.$;

        // Default AI settings
        const defaults = {
            show_table_prompt_fields: false,
            ask_ai_placeholder: 'Ask anything about this table… e.g., Top 5 products by sales',
            ask_ai_button_label: 'Ask AI',
            ask_ai_heading: 'Ask AI',
            backend_ai_summary: '',
            backend_summary_exists: false,
            show_regenerate_button: false,
            enable_backend_ai_trigger: false,
            edit_summary_content: false,
            show_summary_in_table: false,
            summary_prompt: 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.',
            enable_ai_cache: true,
            enable_ai_summary: false
        };

        // First try to get from stored table settings (preferred method)
        if (window.swptlsTableSettings && window.swptlsTableSettings[tableId]) {
            const table_settings = window.swptlsTableSettings[tableId];
            if (table_settings.hasOwnProperty(settingKey)) {
                return table_settings[settingKey];
            }
        }

        // Fallback to parsing from DOM attribute
        const container = $(`.gswpts_tables_container table[id*="${tableId}"]`).closest('.gswpts_tables_container');

        try {
            const tableSettingsJson = container.attr('data-table_settings');
            if (tableSettingsJson) {
                const tableSettings = JSON.parse(tableSettingsJson);

                // Return table-specific setting if it exists
                if (tableSettings.hasOwnProperty(settingKey)) {
                    return tableSettings[settingKey];
                }
            }
        } catch (e) {
            console.warn('Failed to parse table settings for table:', tableId, e);
        }

        // Return default value
        return defaults[settingKey] !== undefined ? defaults[settingKey] : null;
    }

    

    requestAISummaryInline(tableId, tableData, tableSettings, cacheKey, position, forceRegenerate = false) {
        const formData = new FormData();
        formData.append('action', 'gswpts_generate_ai_summary');
        formData.append('table_id', tableId);
        formData.append('table_data', JSON.stringify(tableData));
        formData.append('table_settings', JSON.stringify(tableSettings));
        formData.append('cache_key', cacheKey);
        formData.append('force_regenerate', forceRegenerate ? '1' : '0');

        const nonce = gswpts_frontend_data?.nonce;
        const ajaxUrl = gswpts_frontend_data?.admin_ajax;

        if (nonce) {
            formData.append('nonce', nonce);
        }

        fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.data.summary) {
                    const enableCache = this.getTableSpecificSetting(tableId, 'enable_ai_cache');
                    if (enableCache) {
                        this.summaryCache.set(cacheKey, data.data);

                        if (forceRegenerate && cacheKey.includes('_regenerate_')) {
                            const tableElement = this.findTableElement(tableId);
                            if (tableElement && tableElement.length > 0) {
                                const originalCacheKey = this.generateCacheKey(tableId, tableElement);
                                this.summaryCache.set(originalCacheKey, data.data);
                            }
                        }
                    }
                    
                    // Show inline summary
                    this.showInlineSummary(data.data, tableId, position);
                } else {
                    this.showInlineSummaryError(tableId, data.data || { message: 'Failed to generate AI summary.', error_type: 'general_error' });
                }
            })
            .catch(error => {
                console.error('AI Summary Generation Error:', error);
                let errorMessage = 'Network error while generating summary.';
                if (error.name === 'SyntaxError') {
                    errorMessage = 'Server returned an invalid response. Please try again.';
                } else if (error.message && error.message.includes('fetch')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
                }

                this.showInlineSummaryError(tableId, {
                    message: errorMessage,
                    error_type: 'network_error'
                });
            })
            .finally(() => {
                this.isGenerating = false;
                this.hideGeneratingProgressInline(tableId);
                
                // Also hide regenerating state for regenerate button
                const $ = this.$;
                const resultContainer = $(`#swptls-ai-summary-result-${tableId}-${position}`);
                const regenerateBtn = resultContainer.find('.regenerate-btn');
                if (regenerateBtn.hasClass('regenerating')) {
                    this.hideRegeneratingStateInline(regenerateBtn);
                }
            });
    }

    generateCacheKey(tableId, tableElement) {
        // Generate a cache key based on current table state
        const visibleRows = tableElement.find('tbody tr:visible').length;
        const tableContent = tableElement.find('tbody').text().substring(0, 100);
        const contentHash = this.simpleHash(tableContent);
        return `ai_summary_${tableId}_${visibleRows}_${contentHash}`;
    }

    findTableElement(tableId) {
        const $ = this.$;
        // Try multiple ways to find the table element
        let tableElement = $(`.gswpts_tables_container[id="${tableId}"] table`);
        if (tableElement.length === 0) {
            tableElement = $(`.gswpts_table_${tableId} table`);
        }
        if (tableElement.length === 0) {
            tableElement = $(`#${tableId} table`);
        }
        if (tableElement.length === 0) {
            tableElement = $(`.gswpts_tables_container table[id*="${tableId}"]`);
        }
        if (tableElement.length === 0) {
            tableElement = $('.gswpts_tables_container table').first();
        }
        return tableElement;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    showGeneratingProgress(tableId) {
        const $ = this.$;
        const button = $(`.swptls-ai-summary-btn[data-table-id="${tableId}"]`);

        // Store the original button HTML for restoration later
        if (!button.data('original-html')) {
            button.data('original-html', button.html());
        }

        button.prop('disabled', true)
            .addClass('generating')
            .html(`
                    <span class="ai-icon">
                            <svg class="fWWlmf JzISke" height="24" width="24" aria-hidden="true" viewBox="0 0 471 471" xmlns="http://www.w3.org/2000/svg"><path fill="var(--m3c23)" d="M235.5 471C235.5 438.423 229.22 407.807 216.66 379.155C204.492 350.503 187.811 325.579 166.616 304.384C145.421 283.189 120.498 266.508 91.845 254.34C63.1925 241.78 32.5775 235.5 0 235.5C32.5775 235.5 63.1925 229.416 91.845 217.249C120.498 204.689 145.421 187.811 166.616 166.616C187.811 145.421 204.492 120.497 216.66 91.845C229.22 63.1925 235.5 32.5775 235.5 0C235.5 32.5775 241.584 63.1925 253.751 91.845C266.311 120.497 283.189 145.421 304.384 166.616C325.579 187.811 350.503 204.689 379.155 217.249C407.807 229.416 438.423 235.5 471 235.5C438.423 235.5 407.807 241.78 379.155 254.34C350.503 266.508 325.579 283.189 304.384 304.384C283.189 325.579 266.311 350.503 253.751 379.155C241.584 407.807 235.5 438.423 235.5 471Z"></path>
                            </svg>
                        </span>
                    <span class="button-text">Generating...</span>
                `);
    }

    hideGeneratingProgress(tableId) {
        const $ = this.$;
        const button = $(`.swptls-ai-summary-btn[data-table-id="${tableId}"]`);

        // Restore the original button HTML if it was stored
        const originalHtml = button.data('original-html');

        if (originalHtml) {
            button.prop('disabled', false)
                .removeClass('generating')
                .html(originalHtml);
        } else {
            // Fallback to default if original HTML wasn't stored
            button.prop('disabled', false)
                .removeClass('generating')
                .html(`
                        <span class="ai-icon">
                                <svg class="fWWlmf JzISke" height="24" width="24" aria-hidden="true" viewBox="0 0 471 471" xmlns="http://www.w3.org/2000/svg"><path fill="var(--m3c23)" d="M235.5 471C235.5 438.423 229.22 407.807 216.66 379.155C204.492 350.503 187.811 325.579 166.616 304.384C145.421 283.189 120.498 266.508 91.845 254.34C63.1925 241.78 32.5775 235.5 0 235.5C32.5775 235.5 63.1925 229.416 91.845 217.249C120.498 204.689 145.421 187.811 166.616 166.616C187.811 145.421 204.492 120.497 216.66 91.845C229.22 63.1925 235.5 32.5775 235.5 0C235.5 32.5775 241.584 63.1925 253.751 91.845C266.311 120.497 283.189 145.421 304.384 166.616C325.579 187.811 350.503 204.689 379.155 217.249C407.807 229.416 438.423 235.5 471 235.5C438.423 235.5 407.807 241.78 379.155 254.34C350.503 266.508 325.579 283.189 304.384 304.384C283.189 325.579 266.311 350.503 253.751 379.155C241.584 407.807 235.5 438.423 235.5 471Z"></path>
                                </svg>
                            </span>
                        <span class="button-text hint-icon" title="Click to generate an intelligent summary of the table data using AI">AI Summary</span>
                    `);
        }
    }

    
    formatSummary(summary) {
        // Convert markdown-like formatting to HTML
        return summary
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    formatDate(dateString) {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return date.toLocaleDateString();
    }


    // New inline summary methods
    showInlineSummary(summaryData, tableId, position) {
        const $ = this.$;
        // Find the correct result container based on position
        const resultContainer = $(`#swptls-ai-summary-result-${tableId}-${position}`);

        if (resultContainer.length === 0) {
            console.error('Could not find result container for table:', tableId, 'position:', position);
            return;
        }

        const { summary } = summaryData;
        
        // Update content
        resultContainer.find('.summary-content').html(this.formatSummary(summary));
        
        // Check if regenerate button should be shown based on table settings
        const showRegenerateButton = this.getTableSpecificSetting(tableId, 'show_regenerate_button');
        const regenerateBtn = resultContainer.find('.regenerate-btn');
        
        if (showRegenerateButton) {
            regenerateBtn.addClass('show').show().html(`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
            `);
        } else {
            regenerateBtn.removeClass('show').hide();
        }
        
        // Show the result container
        resultContainer.slideDown(400, () => {
            // Scroll to the result based on position
            if (position === 'below') {
                // Find the scroll target for this table
                const scrollTarget = $(`#swptls-ai-summary-scroll-target-${tableId}`);
                if (scrollTarget.length > 0) {
                    // Scroll to the scroll target (which is just above the result)
                    $('html, body').animate({
                        scrollTop: scrollTarget.offset().top - 20
                    }, 500);
                } else {
                    // Fallback: scroll to the result container itself
                    $('html, body').animate({
                        scrollTop: resultContainer.offset().top - 20
                    }, 500);
                }
            }
        });
    }

    closeInlineSummary(tableId) {
        const $ = this.$;
        // Close both above and below result containers for this table
        const resultContainerAbove = $(`#swptls-ai-summary-result-${tableId}-above`);
        const resultContainerBelow = $(`#swptls-ai-summary-result-${tableId}-below`);
        
        resultContainerAbove.slideUp(300);
        resultContainerBelow.slideUp(300);
    }

    showGeneratingProgressInline(tableId) {
        const $ = this.$;
        const button = $(`.swptls-ai-summary-btn-inline[data-table-id="${tableId}"]`);
        const position = button.data('position') || 'above';
        const resultContainer = $(`#swptls-ai-summary-result-${tableId}-${position}`);

        // Store original button content
        if (!button.data('original-html')) {
            button.data('original-html', button.html());
        }

        // Update button to show generating state
        button.prop('disabled', true)
            .addClass('generating')
            .html(`
                <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                </svg>
                <span class="button-text">Generating...</span>
            `);

        // Show result container with loading message
        if (resultContainer.length > 0) {
            resultContainer.find('.summary-content').html(`
                <div class="generating-message">
                    <div class="loading-spinner">
                        <svg class="spinner" width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    </div>
                    <p>Analyzing table data and generating AI summary...</p>
                </div>
            `);
            
            resultContainer.slideDown(300);
        }
    }

    hideGeneratingProgressInline(tableId) {
        const $ = this.$;
        const button = $(`.swptls-ai-summary-btn-inline[data-table-id="${tableId}"]`);
        
        // Restore original button content
        const originalHtml = button.data('original-html');
        if (originalHtml) {
            button.prop('disabled', false)
                .removeClass('generating')
                .html(originalHtml);
        }
    }

    showRegeneratingStateInline(button) {
        const $ = this.$;
        button.prop('disabled', true)
            .addClass('regenerating')
            .html(`
                <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                </svg>
            `);
    }

    hideRegeneratingStateInline(button) {
        const $ = this.$;
        button.prop('disabled', false)
            .removeClass('regenerating')
            .html(`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
            `);
    }

    showRegeneratingInInline(tableId, position) {
        const $ = this.$;
        const resultContainer = $(`#swptls-ai-summary-result-${tableId}-${position}`);
        if (resultContainer.length) {
            resultContainer.find('.summary-content').html(`
                <div class="regenerating-message">
                    <div class="loading-spinner">
                        <svg class="spinner" width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    </div>
                    <h3>Regenerating AI Summary...</h3>
                    <p>Analyzing current table data and generating a fresh summary. This may take a few moments.</p>
                </div>
            `);
        }
    }

    showInlineSummaryError(tableId, errorData) {
        const $ = this.$;
        const button = $(`.swptls-ai-summary-btn-inline[data-table-id="${tableId}"]`);
        const position = button.data('position') || 'above';
        const resultContainer = $(`#swptls-ai-summary-result-${tableId}-${position}`);
        
        let message = '';
        if (typeof errorData === 'string') {
            message = errorData;
        } else if (errorData && typeof errorData === 'object') {
            message = errorData.message || 'Failed to generate AI summary.';
        } else {
            message = 'Failed to generate AI summary.';
        }

        // Show error in result container
        if (resultContainer.length > 0) {
            resultContainer.find('.summary-content').html(`
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <p>${message}</p>
                </div>
            `);
            
            resultContainer.slideDown(300);
        }
    }
}

// Initialize the AI Summary system
const aiSummary = new AISummary();

// Make it globally available for other scripts
window.swptlsAISummary = aiSummary;
