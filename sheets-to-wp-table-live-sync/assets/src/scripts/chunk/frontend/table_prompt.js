/**
 * Table Prompt functionality for GSWPTS tables
 * Handles user prompt inputs and AI responses directly in table modals
 */

// Define TablePrompt class outside jQuery ready block
class TablePrompt {
    constructor() {
        this.isProcessing = false;
        this.promptCache = new Map();
        this.$ = jQuery; // Store jQuery reference
        this.init();
    }

    // Method to safely check if DataTable is ready
    isDataTableReady(tableElement) {
        const $ = this.$;
        try {
            if (!$.fn.DataTable.isDataTable(tableElement)) {
                return false;
            }
            const dt = $(tableElement).DataTable();
            if (!dt || !dt.settings || dt.settings().length === 0) {
                return false;
            }
            // Test basic functionality
            dt.rows().count();
            return true;
        } catch (e) {
            // console.log('Table Prompt: DataTable readiness check failed:', e.message);
            return false;
        }
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const $ = this.$;

        // Prevent multiple event bindings
        if (window.swptlsTablePromptEventsbound) {
            return;
        }
        window.swptlsTablePromptEventsbound = true;

        // Handle prompt input submission
        $(document).on('click', '.swptls-prompt-send-btn', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling

            const tableId = $(e.currentTarget).data('table-id');
            const container = $(e.currentTarget).closest('.gswpts_tables_container');
            const promptInput = container.find('.swptls-prompt-input');
            const promptText = promptInput.val().trim();

            if (!promptText) {
                this.showNotification('Please enter a prompt first', 'warning');
                return;
            }

            const tableElement = container.find('table');
            if (tableId && tableElement.length) {
                this.processPrompt(tableId, promptText, tableElement, container);
            }
        });

        // Handle Enter key in prompt input
        $(document).on('keypress', '.swptls-prompt-input', (e) => {
            if (e.which === 13) { // Enter key
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                const sendBtn = $(e.currentTarget).closest('.swptls-prompt-interface').find('.swptls-prompt-send-btn');
                sendBtn.click();
            }
        });

        // Handle clear response button
        $(document).on('click', '.swptls-prompt-clear-btn', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            const container = $(e.currentTarget).closest('.gswpts_tables_container');
            this.clearPromptResponse(container);
        });
    }

    updatePromptInterface(container, placeholder, buttonLabel, heading) {
        const $ = this.$;

        if (!container || !container.length) {
            console.warn('Table Prompt: Invalid container provided for interface update');
            return;
        }

        const prompHeading = container.find('.swptls-prompt-heading');
        
        // Update placeholder text if prompt input exists - Need with backend - rest can ignore like promptButton or heading
        const promptInput = container.find('.swptls-prompt-input');
        if (promptInput.length && placeholder) {
            promptInput.attr('placeholder', placeholder);
            // console.log(`Table Prompt: Updated placeholder to "${placeholder}"`);
        }

        // Update button label if prompt button exists
        const promptButton = container.find('.swptls-prompt-send-btn .button-text');
        if (promptButton.length && buttonLabel) {
            promptButton.text(buttonLabel);
            // console.log(`Table Prompt: Updated button label to "${buttonLabel}"`);
        }
    }

    getTableSetting(container, settingKey) {
        const $ = this.$;

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
            console.warn('Failed to parse table settings:', e);
        }

        return null;
    }

    processPrompt(tableId, promptText, tableElement, container) {
        if (this.isProcessing) {
            return;
        }

        // Safety check: ensure DataTable is ready before processing
        if (!this.isDataTableReady(tableElement)) {
            // console.log('Table Prompt: DataTable not ready, will use DOM parsing only');
        }

        this.isProcessing = true;
        this.showProcessingState(container);

        try {
            // Collect all table data similar to AI summary
            const tableData = this.collectCurrentTableData(tableElement);

            // Get table settings
            const tableSettings = this.getTableSettings(tableId, container);

            // Send to backend for AI processing
            this.requestAIPromptResponse(tableId, promptText, tableData, tableSettings, container);
        } catch (error) {
            console.error('Table Prompt Error:', error);
            this.showError(container, 'Failed to prepare table data for AI prompt.');
            this.isProcessing = false;
        }
    }

    collectCurrentTableData(tableElement) {
        const $ = this.$;
        const data = {
            headers: [],
            rows: [],
            title: '',
            totalVisibleRows: 0
        };

        // Get table title
        const titleElement = tableElement.closest('.gswpts_tables_container').find('.table-title, h2, h3');
        if (titleElement.length) {
            data.title = titleElement.first().text().trim();
        }

        // Try to get DataTable instance with better error handling (same as AI Summary)
        let dataTable = null;
        let isDataTableReady = this.isDataTableReady(tableElement);

        if (isDataTableReady) {
            try {
                dataTable = $(tableElement).DataTable();
                // console.log('Table Prompt: DataTable instance found and ready');
            } catch (e) {
                // console.log('Table Prompt: Error getting DataTable instance:', e.message);
                isDataTableReady = false;
            }
        }

        // Get headers
        const headerCells = tableElement.find('thead tr:first th, thead tr:first td');
        headerCells.each((index, element) => {
            const headerText = $(element).text().trim();
            if (headerText) {
                data.headers.push(headerText);
            }
        });

        if (dataTable && isDataTableReady) {
            // Use DataTable API to get ALL data
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
                        cellText = $temp.text().trim();

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
                return this.collectVisibleTableData(tableElement);
            }
        } else {
            // Fallback to DOM parsing if DataTable not available
            // console.log('Table Prompt: Using DOM parsing as fallback');
            return this.collectVisibleTableData(tableElement);
        }

        return data;
    }

    collectVisibleTableData(tableElement) {
        const $ = this.$;
        const data = {
            headers: [],
            rows: [],
            title: '',
            totalVisibleRows: 0
        };

        // Get table title
        const titleElement = tableElement.closest('.gswpts_tables_container').find('.table-title, h2, h3');
        if (titleElement.length) {
            data.title = titleElement.first().text().trim();
        }

        // Get headers
        const headerCells = tableElement.find('thead tr:first th, thead tr:first td');
        headerCells.each((index, element) => {
            const headerText = $(element).text().trim();
            if (headerText) {
                data.headers.push(headerText);
            }
        });

        // Get currently visible rows
        const visibleRows = tableElement.find('tbody tr:visible');
        data.totalVisibleRows = visibleRows.length;

        // Collect visible rows for AI analysis
        visibleRows.each((index, element) => {
            const row = [];
            $(element).find('td').each((cellIndex, cellElement) => {
                let cellText = $(cellElement).text().trim();

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

        return data;
    }

    getTableSettings(tableId, container) {
        const $ = this.$;

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
            })()
        };
    }

    requestAIPromptResponse(tableId, promptText, tableData, tableSettings, container) {
        const formData = new FormData();
        formData.append('action', 'gswpts_process_table_prompt');
        formData.append('table_id', tableId);
        formData.append('prompt_text', promptText);
        formData.append('table_data', JSON.stringify(tableData));
        formData.append('table_settings', JSON.stringify(tableSettings));

        // Add nonce if available
        const nonce = gswpts_frontend_data?.nonce;
        const ajaxUrl = gswpts_frontend_data?.admin_ajax;

        if (nonce) {
            formData.append('nonce', nonce);
        }

        fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data.response) {
                    this.showPromptResponse(container, data.data, promptText);
                } else {
                    this.showError(container, data.data || 'Failed to process AI prompt.');
                }
            })
            .catch(error => {
                console.error('AI Prompt Processing Error:', error);
                this.showError(container, 'Network error while processing prompt.');
            })
            .finally(() => {
                this.isProcessing = false;
                this.hideProcessingState(container);
            });
    }

    showProcessingState(container) {
        const $ = this.$;
        const sendBtn = container.find('.swptls-prompt-send-btn');

        sendBtn.prop('disabled', true)
            .addClass('processing')
            .html(`
                    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    <span class="button-text">Processing...</span>
                `);
    }

    hideProcessingState(container) {
        const $ = this.$;
        const sendBtn = container.find('.swptls-prompt-send-btn');

        // Get the custom button label from data attributes or use default
        const customButtonLabel = container.data('ask-ai-button-label') || 'Ask AI';

        sendBtn.prop('disabled', false)
            .removeClass('processing')
            .html(`
                    <span class="prompt-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                        </svg>
                    </span>
                    <span class="button-text">${customButtonLabel}</span>
                `);
    }

    showPromptResponse(container, responseData, originalPrompt) {
        const $ = this.$;
        const {
            response,
            metadata,
            generated_at,
            tokens_used,
            model_used
        } = responseData;

        const responseContainer = container.find('.swptls-prompt-response');
        const responseContent = responseContainer.find('.response-content');
        const responseMeta = responseContainer.find('.response-meta');

        // Format and display the response
        responseContent.html(this.formatResponse(response));

        // Add metadata
        responseMeta.html(`
                <div class="original-prompt">
                    <strong>Your question:</strong> "${originalPrompt}"
                </div>
            `);

        // Show the response container
        responseContainer.show();

        // Clear the input
        container.find('.swptls-prompt-input').val('');

        // Scroll to response
        responseContainer[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    clearPromptResponse(container) {
        const $ = this.$;
        const responseContainer = container.find('.swptls-prompt-response');
        responseContainer.hide();
        responseContainer.find('.response-content').empty();
        responseContainer.find('.response-meta').empty();
    }

    formatResponse(response) {
        // Convert markdown-like formatting to HTML
        return response
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

    showError(container, message) {
        this.showNotification(message, 'error');

        // Also show error in response area if available
        const responseContainer = container.find('.swptls-prompt-response');
        const responseContent = responseContainer.find('.response-content');

        responseContent.html(`
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <span>${message}</span>
                </div>
            `);
        responseContainer.show();
    }

    showNotification(message, type = 'info') {
        const $ = this.$;

        const notification = $(`
                <div class="swptls-notification swptls-notification-${type}">
                    <div class="swptls-notification-content">
                        <span class="swptls-notification-message">${message}</span>
                        <button class="swptls-notification-close">&times;</button>
                    </div>
                </div>
            `);

        $('body').append(notification);
        setTimeout(() => {
            notification.addClass('show');
        }, 100);

        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);

        notification.find('.swptls-notification-close').on('click', () => {
            this.hideNotification(notification);
        });
    }

    hideNotification(notification) {
        notification.removeClass('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Method to integrate with table configuration (following common_func.js pattern)
    initializeForTable(tableId, table_settings) {
        const $ = this.$;
        const container = $(`.gswpts_tables_container[id="${tableId}"]`);

        // Check if prompt fields are enabled for this table
        const showPromptFields = table_settings?.show_table_prompt_fields;
        if (tableId && (showPromptFields === 'true' || showPromptFields === true)) {
            // Store table settings for this table
            if (!window.swptlsTableSettings) {
                window.swptlsTableSettings = {};
            }
            window.swptlsTableSettings[tableId] = table_settings;

            // Get customizable settings from data attributes or table settings
            const askAiPlaceholder = table_settings?.ask_ai_placeholder || 'Ask anything about this table… e.g., Top 5 products by sales';
            const askAiButtonLabel = table_settings?.ask_ai_button_label || 'Ask AI';
            const askAiHeading = table_settings?.ask_ai_heading || 'Ask AI';

            // Update existing prompt interface with custom settings
            this.updatePromptInterface(container, askAiPlaceholder, askAiButtonLabel, askAiHeading);

            // console.log('Table Prompt initialized for table:', tableId, 'with settings:', table_settings);
        }
    }
}


// Initialize the Table Prompt system outside jQuery ready block
const tablePrompt = new TablePrompt();

// Make it globally available for other scripts
window.swptlsTablePrompt = tablePrompt;

// Re-initialize when new content is loaded (for batch loading)
jQuery(document).ready(function ($) {
    if (window.swptlsBatchLoader) {
        const originalAppendBatchData = window.swptlsBatchLoader.appendBatchData;
        window.swptlsBatchLoader.appendBatchData = function (data) {
            originalAppendBatchData.call(this, data);
            // Wait a bit before reinitializing to ensure new content is ready
            setTimeout(() => {
                tablePrompt.reinitialize();
            }, 500);
        };
    }
});