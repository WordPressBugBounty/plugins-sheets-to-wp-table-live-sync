import React, { useState, useEffect, useRef } from 'react';
import { getStrings, getNonce, isProActive } from './../Helpers';
import { toast } from 'react-toastify';
import Tooltip from './Tooltip';
import Modal from './../core/Modal';
import { Cross, TrashCan } from '../icons';

// @ts-ignore
import '../styles/_aiview.scss';
import MagicWizard from './MagicWizard';

const AIView = ({ tableSettings, setTableSettings, tableId }) => {
    // Global AI Settings state
    const [globalAISettings, setGlobalAISettings] = useState<any>(null);
    const [isLoadingAISettings, setIsLoadingAISettings] = useState<boolean>(true);

    // Backend AI Summary states
    const [isGeneratingBackendSummary, setIsGeneratingBackendSummary] = useState(false);
    const [existingBackendSummary, setExistingBackendSummary] = useState('');
    const [editedSummary, setEditedSummary] = useState('');
    const [lastGeneratedAt, setLastGeneratedAt] = useState<string>('');

    // Delete confirmation modal state
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const confirmDeleteRef = useRef<HTMLDivElement>(null);

    // Fetch global AI settings when component mounts
    useEffect(() => {
        const fetchGlobalAISettings = () => {
            setIsLoadingAISettings(true);
            wp.ajax.send('swptls_get_settings', {
                data: {
                    nonce: getNonce(),
                },
                success: function (response: any) {
                    setGlobalAISettings(response);
                    setIsLoadingAISettings(false);
                },
                error: function (error: any) {
                    console.error('Failed to fetch AI settings:', error);
                    setIsLoadingAISettings(false);
                },
            });
        };

        fetchGlobalAISettings();
    }, []);

    // Load existing summary when component mounts or table ID changes
    useEffect(() => {
        loadExistingBackendSummary();
    }, [tableId]);


    /**
     * Alert if clicked on outside of element
     *
     * @param  event
     */
    function handleCancelOutside(event: MouseEvent) {
        if (
            confirmImportRef.current &&
            !confirmImportRef.current.contains(event.target)
        ) {
            handleClosePopup();
        }
    }

    useEffect(() => {
        const handleClick = () => {
            WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
        };
        document.addEventListener('mousedown', handleCancelOutside);

        const proSettings = document.querySelectorAll(
            '.swptls-pro-settings, .btn-pro-lock'
        );
        proSettings.forEach((item) => {
            item.addEventListener('click', handleClick);
        });

        return () => {
            document.removeEventListener('mousedown', handleCancelOutside);
            proSettings.forEach((item) => {
                item.removeEventListener('click', handleClick);
            });
        };
    }, [handleCancelOutside]);


    // Backend AI Summary Functions
    const loadExistingBackendSummary = async () => {
        if (!tableId) return;

        try {
            const response: any = await new Promise((resolve, reject) => {
                wp.ajax.send('swptls_get_backend_summary', {
                    data: {
                        nonce: getNonce(),
                        table_id: tableId,
                    },
                    success: (data: any) => resolve({ success: true, data }),
                    error: (error: any) => reject(error),
                });
            });

            if (response?.success && response?.data?.summary) {
                setExistingBackendSummary(response.data.summary);
                setEditedSummary(response.data.summary);

                // Disable prompt editing when summary exists
                setIsEditingPrompt(false);

                // Set timestamp from backend if available
                if (response.data.updated) {
                    const timestamp = new Date(response.data.updated * 1000); // Convert from Unix timestamp
                    const timeString = timestamp.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });
                    const dateString = timestamp.toLocaleDateString('en-US', {
                        weekday: 'long'
                    });
                    setLastGeneratedAt(`Last generated at ${dateString}, ⏱ ${timeString}`);
                }
            } else {
                setExistingBackendSummary('');
                setEditedSummary('');
                setLastGeneratedAt('');

                // Enable prompt editing when no summary exists
                setIsEditingPrompt(true);
            }
        } catch (error) {
            console.error('Error loading existing backend summary:', error);
            setExistingBackendSummary('');
            setEditedSummary('');
            setLastGeneratedAt('');
        }
    };

    const handleGenerateBackendSummary = async () => {
        if (!tableId) {
            console.error('Table ID is required for generating backend summary');
            return;
        }

        // Always generate new summary (whether it's first time or regeneration)
        await generateNewBackendSummary();
    };

    const generateNewBackendSummary = async () => {
        if (!tableId) {
            console.error('Table ID is required for generating backend summary');
            return;
        }

        // Prevent multiple simultaneous requests
        if (isGeneratingBackendSummary) {
            return;
        }

        setIsGeneratingBackendSummary(true);
        // Reset edit mode to show loading in preview
        setIsEditingPreview(false);

        try {
            const response: any = await new Promise((resolve, reject) => {
                wp.ajax.send('swptls_generate_backend_summary', {
                    data: {
                        nonce: getNonce(),
                        table_id: tableId,
                        summary_prompt: tableSettings?.table_settings?.summary_prompt || '',
                    },
                    success: (data: any) => resolve({ success: true, data }),
                    error: (error: any) => reject(error),
                });
            });

            if (response?.success && response?.data?.summary) {
                // Set the generated summary
                setEditedSummary(response.data.summary);
                setExistingBackendSummary(response.data.summary);

                // Set a current timestamp since we just generated it
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                const dateString = now.toLocaleDateString('en-US', {
                    weekday: 'long'
                });
                setLastGeneratedAt(`Last generated at ${dateString}, ⏱ ${timeString}`);

                // Small delay to show the generated content briefly, then switch to edit mode
                setTimeout(() => {
                    setIsEditingPreview(true);
                    // Disable prompt editing after successful generation
                    setIsEditingPrompt(false);
                }, 500);
            } else {
                console.error('No summary received from backend');
                toast.error('Failed to generate summary. Please try again.');
            }
        } catch (error: any) {
            console.error('Error generating backend summary:', error);

            // Handle different error types
            let errorMessage = 'Error generating summary. Please try again.';

            // Check if it's a structured error response from the backend
            if (error?.responseJSON?.error_type) {
                const errorType = error.responseJSON.error_type;
                const message = error.responseJSON.message || '';

                switch (errorType) {
                    case 'rate_limit':
                        errorMessage = message || 'Rate limit reached. Please wait before trying again or upgrade your OpenAI plan.';
                        break;
                    case 'quota_exceeded':
                        errorMessage = message || 'OpenAI quota exceeded. Please check your billing and usage limits.';
                        break;
                    case 'invalid_api_key':
                        errorMessage = message || 'Invalid API key. Please check your OpenAI configuration.';
                        break;
                    case 'context_too_large':
                        errorMessage = message || 'Table data is too large. Please try with a smaller dataset.';
                        break;
                    case 'network_error':
                        errorMessage = message || 'Network error occurred. Please check your connection and try again.';
                        break;
                    default:
                        errorMessage = message || 'Error generating summary. Please try again.';
                }
            } else if (error?.message) {
                // Fallback to checking error message for backwards compatibility
                const message = error.message.toLowerCase();
                if (message.includes('rate limit')) {
                    errorMessage = 'Rate limit reached. Please wait before trying again or upgrade your OpenAI plan.';
                } else if (message.includes('quota')) {
                    errorMessage = 'OpenAI quota exceeded. Please check your billing and usage limits.';
                } else if (message.includes('api key')) {
                    errorMessage = 'Invalid API key. Please check your OpenAI configuration.';
                } else if (message.includes('too large') || message.includes('context')) {
                    errorMessage = 'Table data is too large. Please try with a smaller dataset.';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsGeneratingBackendSummary(false);
        }
    };

    const handleSaveBackendSummary = async () => {
        if (!tableId || !editedSummary.trim()) {
            console.error('Table ID and summary content are required');
            return;
        }

        try {
            const response: any = await new Promise((resolve, reject) => {
                wp.ajax.send('swptls_save_backend_summary', {
                    data: {
                        nonce: getNonce(),
                        table_id: tableId,
                        summary: editedSummary.trim(),
                    },
                    success: (data: any) => resolve({ success: true, data }),
                    error: (error: any) => reject(error),
                });
            });

            if (response?.success) {
                console.log('Backend summary saved successfully');
                // Show success toast
                toast.success('Backend summary saved successfully!');

                // Update table settings to reflect that summary exists
                setTableSettings({
                    ...tableSettings,
                    table_settings: {
                        ...tableSettings.table_settings,
                        backend_summary_exists: true,
                        backend_ai_summary: editedSummary.trim(),
                    },
                });
                // Update existing summary state
                setExistingBackendSummary(editedSummary.trim());
                // Switch back to preview mode
                setIsEditingPreview(false);
            } else {
                console.error('Failed to save backend summary');
                toast.error('Failed to save backend summary. Please try again.');
            }
        } catch (error: any) {
            console.error('Error saving backend summary:', error);

            // Handle different error types
            let errorMessage = 'Error saving backend summary. Please try again.';
            if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    };

    // Remove modal close handler as we no longer use modal

    // Handle delete confirmation modal
    const handleShowDeleteConfirmation = () => {
        setDeleteConfirmationModal(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setDeleteConfirmationModal(false);
    };

    /**
     * Alert if clicked on outside of element
     */
    function handleCancelOutside(event: MouseEvent) {
        if (
            confirmDeleteRef.current &&
            !confirmDeleteRef.current.contains(event.target as Node)
        ) {
            handleCloseDeleteConfirmation();
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleCancelOutside);
        return () => {
            document.removeEventListener('mousedown', handleCancelOutside);
        };
    }, []);

    const handleDeleteBackendSummary = async () => {
        if (!tableId) {
            return;
        }

        try {
            const response: any = await new Promise((resolve, reject) => {
                wp.ajax.send('swptls_save_backend_summary', {
                    data: {
                        nonce: getNonce(),
                        table_id: tableId,
                        summary: '', // Empty summary to delete
                    },
                    success: (data: any) => resolve({ success: true, data }),
                    error: (error: any) => reject(error),
                });
            });

            if (response?.success) {
                console.log('Backend summary deleted successfully');
                // Show success toast
                toast.success('Backend summary deleted successfully!');

                // Close the delete confirmation modal
                setDeleteConfirmationModal(false);

                // Update table settings to reflect that summary is deleted
                setTableSettings({
                    ...tableSettings,
                    table_settings: {
                        ...tableSettings.table_settings,
                        backend_summary_exists: false,
                        backend_ai_summary: '',
                    },
                });
                // Update existing summary state
                setExistingBackendSummary('');
                setEditedSummary('');
                setLastGeneratedAt(''); // Clear timestamp
                // Reset to preview mode since there's no summary to edit
                setIsEditingPreview(false);
                // Enable prompt editing when summary is deleted
                setIsEditingPrompt(true);
            } else {
                console.error('Failed to delete backend summary');
                toast.error('Failed to delete backend summary. Please try again.');
            }
        } catch (error: any) {
            console.error('Error deleting backend summary:', error);

            // Handle different error types
            let errorMessage = 'Error deleting backend summary. Please try again.';
            if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    };

    const handleCheckboxChange = (key: string) => {
        setTableSettings({
            ...tableSettings,
            table_settings: {
                ...tableSettings.table_settings,
                [key]: !tableSettings.table_settings?.[key],
            },
        });
    };

    // Unified markdown processing function for consistent rendering
    const processMarkdownToHTML = (text: string) => {
        if (!text) return '';

        return text
            // Process bold text: **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Process italic text: *text* -> <em>text</em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Process numbered lists: 1. text -> <li>text</li>
            .replace(/^(\d+\.)\s+(.*)$/gm, '<li>$2</li>')
            // Process bullet lists: - text or * text -> <li>text</li>
            .replace(/^[-*]\s+(.*)$/gm, '<li>$1</li>')
            // Wrap consecutive <li> elements in <ol> for numbered lists
            .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, (match) => {
                // Check if this was originally a numbered list by looking at the original text
                const lines = text.split('\n');
                let hasNumberedList = false;
                for (let line of lines) {
                    if (/^\d+\.\s+/.test(line.trim())) {
                        hasNumberedList = true;
                        break;
                    }
                }
                return hasNumberedList ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
            })
            // Process paragraphs: double newlines -> </p><p>
            .replace(/\n\n/g, '</p><p>')
            // Process single newlines -> <br>
            .replace(/\n/g, '<br>')
            // Wrap content in paragraphs if not already wrapped in lists
            .replace(/^(?!<[ou]l>)/gm, '<p>')
            .replace(/(?<!<\/[ou]l>)$/gm, '</p>')
            // Clean up empty paragraphs and fix paragraph wrapping
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<[ou]l>.*?<\/[ou]l>)<\/p>/g, '$1');
    };

    // Initialize AI settings from tableSettings or use defaults
    const summarySource = tableSettings?.table_settings?.summary_source || 'generate_on_click';
    const summaryPositionGoc = tableSettings?.table_settings?.summary_position_goc || 'below';
    const summaryPosition = tableSettings?.table_settings?.summary_position || 'above';
    const summaryDisplay = tableSettings?.table_settings?.summary_display || 'always_show';
    const summaryButtonText = tableSettings?.table_settings?.summary_button_text || '✨ Generate Summary';
    const summaryTitle = tableSettings?.table_settings?.summary_title || 'Table Summary';
    const instant_summaryTitle = tableSettings?.table_settings?.instant_summary_title || 'Table Summary';
    const summaryButtonBgColor = tableSettings?.table_settings?.summary_button_bg_color || '#3B82F6';
    const summaryButtonTextColor = tableSettings?.table_settings?.summary_button_text_color || '#ffffff';
    const askAIPlaceholder = tableSettings?.table_settings?.ask_ai_placeholder || 'Ask anything about this table… e.g., Top 5 products by sales';
    const askAIButtonLabel = tableSettings?.table_settings?.ask_ai_button_label || 'Ask AI';
    const askAIHeading = tableSettings?.table_settings?.ask_ai_heading || 'Ask AI';

    // Ensure we have a default prompt if none is set
    const defaultPrompt = 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.';
    const currentPrompt = tableSettings?.table_settings?.summary_prompt || defaultPrompt;

    // Additional state for editing
    const [isEditingPreview, setIsEditingPreview] = useState(false);

    // State for controlling prompt textarea editing
    const [isEditingPrompt, setIsEditingPrompt] = useState(true);

    // Ref for textarea to handle markdown toolbar
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Helper function to update AI settings
    const updateAISetting = (key: string, value: any) => {
        setTableSettings({
            ...tableSettings,
            table_settings: {
                ...tableSettings.table_settings,
                [key]: value,
            },
        });
    };

    // Check if AI is configured - with smart fallback to avoid loading blink
    const isAIConfigured = (() => {
        // If we're still loading, check if we can determine from existing table settings
        if (isLoadingAISettings) {
            // If table has AI features enabled, assume AI is configured to avoid blink
            if (tableSettings?.table_settings?.enable_ai_summary ||
                tableSettings?.table_settings?.show_table_prompt_fields ||
                tableSettings?.table_settings?.backend_summary_exists) {
                return true;
            }
            // If no AI features are enabled, we can safely show wizard while loading
            return false;
        }

        // Normal check when globalAISettings is loaded
        if (!globalAISettings) return false;

        const selectedProvider = globalAISettings.ai_provider || 'openai';
        const apiKeyField = `${selectedProvider}_api_key`;
        const apiKeyValue = globalAISettings[apiKeyField];
        return apiKeyValue && apiKeyValue.trim() !== '';
    })();



    // Reset prompt to default
    const resetPromptToDefault = () => {
        setTableSettings({
            ...tableSettings,
            table_settings: {
                ...tableSettings.table_settings,
                summary_prompt: defaultPrompt
            }
        });
    };

    const isPromptDefault = () => {
        return currentPrompt === defaultPrompt;
    };

    // Markdown toolbar functions
    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = editedSummary.substring(start, end);
        const beforeText = editedSummary.substring(0, start);
        const afterText = editedSummary.substring(end);

        const newText = beforeText + before + selectedText + after + afterText;
        setEditedSummary(newText);

        // Set cursor position after the inserted text
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleBold = () => insertMarkdown('**', '**');
    const handleItalic = () => insertMarkdown('*', '*');
    const handleBulletList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const beforeText = editedSummary.substring(0, start);
        const afterText = editedSummary.substring(start);

        // Check if we're at the beginning of a line
        const isNewLine = beforeText === '' || beforeText.endsWith('\n');
        const prefix = isNewLine ? '- ' : '\n- ';

        const newText = beforeText + prefix + afterText;
        setEditedSummary(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleNumberedList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const beforeText = editedSummary.substring(0, start);
        const afterText = editedSummary.substring(start);

        // Check if we're at the beginning of a line
        const isNewLine = beforeText === '' || beforeText.endsWith('\n');
        const prefix = isNewLine ? '1. ' : '\n1. ';

        const newText = beforeText + prefix + afterText;
        setEditedSummary(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className="edit-data-source-wrap ai-view-wrapper">
            {/* Delete Confirmation Modal */}
            {deleteConfirmationModal && (
                <Modal>
                    <div
                        className="delete-table-modal-wrap modal-content"
                        ref={confirmDeleteRef}
                    >
                        <div
                            className="cross_sign"
                            onClick={handleCloseDeleteConfirmation}
                        >
                            {Cross}
                        </div>
                        <div className="delete-table-modal">
                            <div className="modal-media">{TrashCan}</div>
                            <h2>{getStrings('are-you-sure-to-delete-summary')}</h2>
                            <p>
                                {getStrings('confirmation-about-to-delete-summary')}
                            </p>
                            <div className="action-buttons">
                                <button
                                    className="swptls-button cancel-button"
                                    onClick={handleCloseDeleteConfirmation}
                                >
                                    {getStrings('Cancel')}
                                </button>
                                <button
                                    className="swptls-button confirm-button"
                                    onClick={handleDeleteBackendSummary}
                                >
                                    {getStrings('Delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* AI Magic Wizard Section - Show when AI is not configured */}
            {!isAIConfigured && (
                <MagicWizard
                    isAIConfigured={isAIConfigured}
                    tableSettings={tableSettings}
                    setTableSettings={setTableSettings}
                />
            )}

            {/* AI Settings - Show when AI is configured */}
            {isAIConfigured && (
                <div className="ai-settings-container">
                    {/* AI Summary Section */}
                    <div className="ai-feature-section">
                        <div className="feature-toggle">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={tableSettings?.table_settings?.enable_ai_summary || false}
                                    onChange={(e) =>
                                        setTableSettings({
                                            ...tableSettings,
                                            table_settings: {
                                                ...tableSettings.table_settings,
                                                enable_ai_summary: e.target.checked,
                                            },
                                        })
                                    }
                                />
                                <span className="slider"></span>
                            </label>
                            <div className="feature-info">
                                <h4>{getStrings('enable-summary')}</h4>
                                <p>{getStrings('turn-data-into-smart-summarize')}</p>
                            </div>
                            <span className="tooltip-cache ai-table-sum-tooltip">
                                <Tooltip content={getStrings('tooltip-65')} />

                                {/* we will add video later then use this  */}
                                {/* <button
                                    className="btn-pro btn-youtube"
                                    onClick={() => window.open('https://www.youtube.com/watch?v=YOUR_VIDEO_ID', '_blank', 'noopener,noreferrer')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor" />
                                    </svg>
                                    {getStrings('Youtube-title')}
                                </button> */}
                            </span>
                        </div>

                        {/* Summary Source Selection */}
                        {tableSettings?.table_settings?.enable_ai_summary && (
                            <div className="summary-source-section">
                                <h5 className="section-title">{getStrings('summary-source')}</h5>
                                <div className="source-options">

                                    {/* Generate onClick  */}
                                    <div
                                        className={`source-option ${summarySource === 'generate_on_click' ? 'active' : ''}`}
                                        onClick={() => updateAISetting('summary_source', 'generate_on_click')}
                                    >
                                        <div className="option-icon">
                                            <svg width="40px" height="40px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#d6d6d6" stroke="#d6d6d6">

                                                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

                                                <g id="SVGRepo_iconCarrier"> <title>mouse-click</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="icon" fill="#a3a3a3" transform="translate(42.688000, 42.666667)"> <path d="M170.616335,85.3333333 L213.270419,85.3333333 L213.270419,-2.13162821e-14 L170.616335,-2.13162821e-14 L170.616335,85.3333333 Z M-2.13162821e-14,213.333333 L85.3081674,213.333333 L85.3081674,170.666667 L-2.13162821e-14,170.666667 L-2.13162821e-14,213.333333 Z M101.465534,131.658667 L41.15266,71.3066667 L71.3090971,41.1413333 L131.621972,101.493333 L101.465534,131.658667 Z M71.3069644,342.845867 L41.1505273,312.680533 L101.463402,252.328533 L131.619839,282.493867 L71.3069644,342.845867 Z M282.431883,131.658667 L252.275445,101.493333 L312.58832,41.1413333 L342.744757,71.3066667 L282.431883,131.658667 Z M285.588285,309.700267 L345.17604,369.3056 L369.318251,345.156267 L309.709169,285.550933 L352.640504,242.628267 L202.028935,201.9456 L242.699604,352.6016 L285.588285,309.700267 Z M222.929436,426.670933 L147.538343,147.460267 L426.666667,222.852267 L364.007818,285.550933 L423.6169,345.156267 L345.17604,423.598933 L285.588285,363.9936 L222.929436,426.670933 Z" id="interaction-click"> </path> </g> </g> </g>

                                            </svg>
                                        </div>
                                        <div className="option-content">
                                            <div className="summary-sorce">
                                                <h6>{getStrings('generate-onclick')}</h6>
                                                <Tooltip content="👉 Best if your data changes often and you want fresh results every time." />

                                            </div>
                                            <p> {getStrings('summary-content')}</p>
                                        </div>
                                        <div className="option-check">
                                            {summarySource === 'generate_on_click' && <span>✓</span>}
                                        </div>
                                    </div>

                                    {/* Instant Summary  */}
                                    <div className={`source-option ${summarySource === 'instant_summary' ? 'active' : ''} `}
                                        onClick={() => {
                                            if (!isProActive()) {
                                                return;
                                            }
                                            updateAISetting('summary_source', 'instant_summary');
                                        }}
                                    >
                                        <div className="option-icon">⚡</div>
                                        <div className="option-content">

                                            <div className="summary-sorce">
                                                <h6>{getStrings('instant-summary')}</h6>
                                                <Tooltip content="👉 Best if you want faster load times and consistent summaries." />
                                                {!isProActive() && (
                                                    <button className="btn-pro btn-new">
                                                        {getStrings('pro')}
                                                    </button>
                                                )}
                                            </div>
                                            <p>{getStrings('you-will-generate-and')}</p>
                                        </div>

                                        <div className="option-check">
                                            {summarySource === 'instant_summary' && <span>✓</span>}
                                        </div>

                                        {!isProActive() && (
                                            <div className="btn-pro-lock AI-lock-blur"><svg width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="26" rx="5" fill="#ff3b30"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M13 8.5C11.7574 8.5 10.75 9.50736 10.75 10.75V12.5H10.5C9.94772 12.5 9.5 12.9477 9.5 13.5V16.5C9.5 17.0523 9.94772 17.5 10.5 17.5H15.5C16.0523 17.5 16.5 17.0523 16.5 16.5V13.5C16.5 12.9477 16.0523 12.5 15.5 12.5H15.25V10.75C15.25 9.50736 14.2426 8.5 13 8.5ZM14.5 12.5V10.75C14.5 9.92157 13.8284 9.25 13 9.25C12.1716 9.25 11.5 9.92157 11.5 10.75V12.5H14.5Z" fill="white"></path><path d="M28.875 13.8848C28.875 16.0475 27.8509 17.1289 25.8027 17.1289C23.8405 17.1289 22.8594 16.0887 22.8594 14.0083V9.29785H24.1377V13.7451C24.1377 15.2562 24.7249 16.0117 25.8994 16.0117C27.0309 16.0117 27.5967 15.283 27.5967 13.8257V9.29785H28.875V13.8848ZM31.813 16.189H31.7915V19.5298H30.5454V11.5H31.7915V12.4668H31.813C32.2391 11.7363 32.8621 11.3711 33.6821 11.3711C34.3804 11.3711 34.9246 11.6164 35.3149 12.1069C35.7052 12.5975 35.9004 13.2563 35.9004 14.0835C35.9004 15.0002 35.6802 15.7342 35.2397 16.2856C34.7993 16.8371 34.1978 17.1128 33.4351 17.1128C32.7332 17.1128 32.1925 16.8049 31.813 16.189ZM31.7808 14.019V14.7012C31.7808 15.1022 31.9079 15.4424 32.1621 15.7217C32.4199 16.001 32.7458 16.1406 33.1396 16.1406C33.6016 16.1406 33.9632 15.9616 34.2246 15.6035C34.4896 15.2419 34.6221 14.7388 34.6221 14.0942C34.6221 13.5535 34.4985 13.131 34.2515 12.8267C34.008 12.5187 33.6768 12.3647 33.2578 12.3647C32.8138 12.3647 32.4557 12.5223 32.1836 12.8374C31.915 13.1525 31.7808 13.5464 31.7808 14.019ZM42.1792 16.5596C42.1792 18.5791 41.1641 19.5889 39.1338 19.5889C38.4176 19.5889 37.7928 19.4689 37.2593 19.229V18.0903C37.8608 18.4341 38.432 18.606 38.9727 18.606C40.2796 18.606 40.9331 17.9632 40.9331 16.6777V16.0762H40.9116C40.4998 16.778 39.8804 17.1289 39.0532 17.1289C38.3836 17.1289 37.8429 16.8854 37.4312 16.3984C37.0229 15.9079 36.8188 15.2508 36.8188 14.4272C36.8188 13.4927 37.0391 12.7497 37.4795 12.1982C37.9199 11.6468 38.5251 11.3711 39.2949 11.3711C40.0218 11.3711 40.5607 11.6683 40.9116 12.2627H40.9331V11.5H42.1792V16.5596ZM40.9438 14.481V13.7666C40.9438 13.3799 40.8149 13.0505 40.5571 12.7783C40.3029 12.5026 39.9842 12.3647 39.6011 12.3647C39.1284 12.3647 38.7578 12.5402 38.4893 12.8911C38.2243 13.2384 38.0918 13.7254 38.0918 14.3521C38.0918 14.8927 38.2189 15.326 38.4731 15.6519C38.731 15.9741 39.0711 16.1353 39.4937 16.1353C39.9233 16.1353 40.2725 15.9813 40.541 15.6733C40.8096 15.3618 40.9438 14.9644 40.9438 14.481ZM46.9917 12.687C46.8413 12.5688 46.6247 12.5098 46.3418 12.5098C45.973 12.5098 45.665 12.6763 45.418 13.0093C45.1709 13.3423 45.0474 13.7952 45.0474 14.3682V17H43.8013V11.5H45.0474V12.6333H45.0688C45.1906 12.2466 45.3768 11.9458 45.6274 11.731C45.8817 11.5125 46.1646 11.4033 46.4761 11.4033C46.7017 11.4033 46.8735 11.4373 46.9917 11.5054V12.687ZM52.0942 17H50.8857V16.1406H50.8643C50.4847 16.7995 49.9279 17.1289 49.1938 17.1289C48.6532 17.1289 48.2288 16.9821 47.9209 16.6885C47.6165 16.3949 47.4644 16.0063 47.4644 15.5229C47.4644 14.4845 48.0623 13.8794 49.2583 13.7075L50.8911 13.4766C50.8911 12.6924 50.5187 12.3003 49.7739 12.3003C49.1187 12.3003 48.5278 12.5259 48.0015 12.9771V11.8867C48.5815 11.543 49.2511 11.3711 50.0103 11.3711C51.3996 11.3711 52.0942 12.055 52.0942 13.4229V17ZM50.8911 14.2983L49.7363 14.4595C49.3783 14.506 49.1079 14.5938 48.9253 14.7227C48.7463 14.848 48.6567 15.07 48.6567 15.3887C48.6567 15.6214 48.7391 15.813 48.9038 15.9634C49.0721 16.1102 49.2959 16.1836 49.5752 16.1836C49.9548 16.1836 50.2681 16.0511 50.5151 15.7861C50.7658 15.5176 50.8911 15.181 50.8911 14.7764V14.2983ZM58.6201 17H57.374V16.0654H57.3525C56.9515 16.7744 56.3338 17.1289 55.4995 17.1289C54.8228 17.1289 54.2803 16.8836 53.8721 16.3931C53.4674 15.8989 53.2651 15.2275 53.2651 14.3789C53.2651 13.4694 53.4889 12.7407 53.9365 12.1929C54.3877 11.645 54.9875 11.3711 55.7358 11.3711C56.4771 11.3711 57.016 11.6683 57.3525 12.2627H57.374V8.85742H58.6201V17ZM57.3901 14.4863V13.7666C57.3901 13.3763 57.263 13.0451 57.0088 12.7729C56.7546 12.5008 56.4305 12.3647 56.0366 12.3647C55.5711 12.3647 55.2041 12.5384 54.9355 12.8857C54.6706 13.2331 54.5381 13.7147 54.5381 14.3306C54.5381 14.8892 54.6652 15.3314 54.9194 15.6572C55.1772 15.9795 55.5228 16.1406 55.9561 16.1406C56.3822 16.1406 56.7277 15.9849 56.9927 15.6733C57.2576 15.3582 57.3901 14.9626 57.3901 14.4863ZM64.9043 14.5884H61.1553C61.1696 15.0968 61.3254 15.4889 61.6226 15.7646C61.9233 16.0404 62.3351 16.1782 62.8579 16.1782C63.4451 16.1782 63.984 16.0028 64.4746 15.6519V16.6562C63.9733 16.9714 63.3109 17.1289 62.4873 17.1289C61.6781 17.1289 61.0425 16.88 60.5806 16.3823C60.1222 15.881 59.8931 15.1774 59.8931 14.2715C59.8931 13.4157 60.1455 12.7192 60.6504 12.1821C61.1589 11.6414 61.7891 11.3711 62.541 11.3711C63.293 11.3711 63.8748 11.6128 64.2866 12.0962C64.6984 12.5796 64.9043 13.251 64.9043 14.1104V14.5884ZM63.7012 13.7075C63.6976 13.2599 63.592 12.9126 63.3843 12.6655C63.1766 12.4149 62.8901 12.2896 62.5249 12.2896C62.1668 12.2896 61.8625 12.4202 61.6118 12.6816C61.3647 12.943 61.2126 13.285 61.1553 13.7075H63.7012ZM75.7915 17H74.395L70.7158 11.3389C70.6227 11.1956 70.5457 11.047 70.4849 10.8931H70.4526C70.4813 11.0578 70.4956 11.4105 70.4956 11.9512V17H69.2603V9.29785H70.748L74.3037 14.8247C74.4541 15.0539 74.5508 15.2114 74.5938 15.2974H74.6152C74.5794 15.0933 74.5615 14.7477 74.5615 14.2607V9.29785H75.7915V17ZM80.0024 17.1289C79.1538 17.1289 78.4753 16.8729 77.9668 16.3608C77.4619 15.8452 77.2095 15.1631 77.2095 14.3145C77.2095 13.3906 77.4727 12.6691 77.999 12.1499C78.529 11.6307 79.2415 11.3711 80.1367 11.3711C80.9961 11.3711 81.6657 11.6235 82.1455 12.1284C82.6253 12.6333 82.8652 13.3333 82.8652 14.2285C82.8652 15.1058 82.6056 15.8094 82.0864 16.3394C81.5708 16.8657 80.8761 17.1289 80.0024 17.1289ZM80.0615 12.3647C79.5745 12.3647 79.1896 12.5348 78.9067 12.875C78.6239 13.2152 78.4824 13.6842 78.4824 14.2822C78.4824 14.8587 78.6257 15.3135 78.9121 15.6465C79.1986 15.9759 79.5817 16.1406 80.0615 16.1406C80.5521 16.1406 80.9281 15.9777 81.1895 15.6519C81.4544 15.326 81.5869 14.8623 81.5869 14.2607C81.5869 13.6556 81.4544 13.1883 81.1895 12.8589C80.9281 12.5295 80.5521 12.3647 80.0615 12.3647ZM91.5342 11.5L89.9121 17H88.6069L87.6079 13.2725C87.5685 13.1292 87.5435 12.9681 87.5327 12.7891H87.5112C87.5041 12.9108 87.4718 13.0684 87.4146 13.2617L86.3296 17H85.0513L83.4346 11.5H84.7236L85.7227 15.4639C85.7549 15.582 85.7764 15.7396 85.7871 15.9365H85.8247C85.8354 15.7861 85.8641 15.625 85.9106 15.4531L87.0225 11.5H88.1934L89.1816 15.48C89.2139 15.6053 89.2371 15.7629 89.2515 15.9526H89.2891C89.2962 15.8201 89.3231 15.6626 89.3696 15.48L90.3472 11.5H91.5342Z" fill="white"></path></svg></div>
                                        )}

                                    </div>
                                </div>

                                {/* Generate on Click Settings */}
                                {summarySource === 'generate_on_click' && (
                                    <div className="generate-on-click-settings">
                                        <div className={`prompt-section`}>
                                            <div className="section-title-wrapper">
                                                <h5 className="section-title">{getStrings('prompt-for-summary')}</h5>
                                            </div>

                                            <p>{getStrings('write-the-prompt')}</p>
                                            <div className={`summary-text-prompt`}>
                                                <textarea
                                                    id="summary_prompt"
                                                    className={`setting-textarea`}
                                                    rows={4}
                                                    value={currentPrompt}
                                                    onChange={(e) => setTableSettings({
                                                        ...tableSettings,
                                                        table_settings: {
                                                            ...tableSettings.table_settings,
                                                            summary_prompt: e.target.value
                                                        }
                                                    })}
                                                    placeholder="Enter your custom prompt for AI summary generation..."
                                                />

                                            </div>

                                            <div className="prompt-actions">
                                                <button
                                                    className={`reset-prompt-btn ${isPromptDefault() ? 'disabled' : ''}`}
                                                    onClick={resetPromptToDefault}
                                                    disabled={isPromptDefault()}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M21.5 2V8M21.5 8H16M21.5 8L18.5 5C17.0699 3.56988 15.2204 2.60131 13.1872 2.23364C11.1539 1.86596 9.0504 2.11773 7.16783 2.95214C5.28527 3.78656 3.72063 5.16428 2.68896 6.8987C1.6573 8.63312 1.20947 10.6472 1.40683 12.6606C1.60419 14.674 2.43769 16.5757 3.79362 18.1027C5.14955 19.6296 6.95991 20.7065 8.96134 21.1878C10.9628 21.6691 13.0626 21.5317 14.9821 20.7942C16.9017 20.0567 18.5515 18.7541 19.7 17.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {getStrings('reset-prompt')}
                                                </button>
                                            </div>


                                        </div>

                                        <div className={`summary-button-section`}>
                                            <div className="summary-title-toggle">
                                                <h6>{getStrings('summary-button')}</h6>
                                                <Tooltip content="This button is what visitors click to view the AI-generated summary." />

                                            </div>
                                            <p>{getStrings('customize-the-text-and-colors')}</p>

                                            <div className={`button-settings generate-click-customization`}>
                                                <div className={`setting-row ${!isProActive() ? 'swptls-pro-settings' : ''}`}>
                                                    <div className="summary-btn-text">
                                                        <label >Button text</label>
                                                        <Tooltip content="Customize the summary button label. This button is what visitors click to view the AI-generated summary." />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={summaryButtonText}
                                                        onChange={(e) => updateAISetting('summary_button_text', e.target.value)}
                                                        placeholder="✨ Generate Summary"
                                                        disabled={!isProActive()}
                                                    />
                                                </div>

                                                <div className={`color-settings ${!isProActive() ? 'swptls-pro-settings' : ''}`}>
                                                    <div className="color-setting">
                                                        <input
                                                            type="color"
                                                            className="round-color-input"
                                                            value={summaryButtonBgColor}
                                                            onChange={(e) => updateAISetting('summary_button_bg_color', e.target.value)}
                                                            disabled={!isProActive()}
                                                        />
                                                        <label>{getStrings('bg-color')}</label>
                                                        <Tooltip content="Customize the summary button’s background color" />
                                                    </div>
                                                    <div className="color-setting">
                                                        <input
                                                            type="color"
                                                            className="round-color-input"
                                                            value={summaryButtonTextColor}
                                                            onChange={(e) => updateAISetting('summary_button_text_color', e.target.value)}
                                                            disabled={!isProActive()}
                                                        />
                                                        <label>{getStrings('txt-color')}</label>
                                                        <Tooltip content="Customize the summary button’s text color" />
                                                    </div>
                                                </div>

                                                {!isProActive() && (
                                                    <div className="btn-pro-lock AI-lock-blur"><svg width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="26" rx="5" fill="#ff3b30"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M13 8.5C11.7574 8.5 10.75 9.50736 10.75 10.75V12.5H10.5C9.94772 12.5 9.5 12.9477 9.5 13.5V16.5C9.5 17.0523 9.94772 17.5 10.5 17.5H15.5C16.0523 17.5 16.5 17.0523 16.5 16.5V13.5C16.5 12.9477 16.0523 12.5 15.5 12.5H15.25V10.75C15.25 9.50736 14.2426 8.5 13 8.5ZM14.5 12.5V10.75C14.5 9.92157 13.8284 9.25 13 9.25C12.1716 9.25 11.5 9.92157 11.5 10.75V12.5H14.5Z" fill="white"></path><path d="M28.875 13.8848C28.875 16.0475 27.8509 17.1289 25.8027 17.1289C23.8405 17.1289 22.8594 16.0887 22.8594 14.0083V9.29785H24.1377V13.7451C24.1377 15.2562 24.7249 16.0117 25.8994 16.0117C27.0309 16.0117 27.5967 15.283 27.5967 13.8257V9.29785H28.875V13.8848ZM31.813 16.189H31.7915V19.5298H30.5454V11.5H31.7915V12.4668H31.813C32.2391 11.7363 32.8621 11.3711 33.6821 11.3711C34.3804 11.3711 34.9246 11.6164 35.3149 12.1069C35.7052 12.5975 35.9004 13.2563 35.9004 14.0835C35.9004 15.0002 35.6802 15.7342 35.2397 16.2856C34.7993 16.8371 34.1978 17.1128 33.4351 17.1128C32.7332 17.1128 32.1925 16.8049 31.813 16.189ZM31.7808 14.019V14.7012C31.7808 15.1022 31.9079 15.4424 32.1621 15.7217C32.4199 16.001 32.7458 16.1406 33.1396 16.1406C33.6016 16.1406 33.9632 15.9616 34.2246 15.6035C34.4896 15.2419 34.6221 14.7388 34.6221 14.0942C34.6221 13.5535 34.4985 13.131 34.2515 12.8267C34.008 12.5187 33.6768 12.3647 33.2578 12.3647C32.8138 12.3647 32.4557 12.5223 32.1836 12.8374C31.915 13.1525 31.7808 13.5464 31.7808 14.019ZM42.1792 16.5596C42.1792 18.5791 41.1641 19.5889 39.1338 19.5889C38.4176 19.5889 37.7928 19.4689 37.2593 19.229V18.0903C37.8608 18.4341 38.432 18.606 38.9727 18.606C40.2796 18.606 40.9331 17.9632 40.9331 16.6777V16.0762H40.9116C40.4998 16.778 39.8804 17.1289 39.0532 17.1289C38.3836 17.1289 37.8429 16.8854 37.4312 16.3984C37.0229 15.9079 36.8188 15.2508 36.8188 14.4272C36.8188 13.4927 37.0391 12.7497 37.4795 12.1982C37.9199 11.6468 38.5251 11.3711 39.2949 11.3711C40.0218 11.3711 40.5607 11.6683 40.9116 12.2627H40.9331V11.5H42.1792V16.5596ZM40.9438 14.481V13.7666C40.9438 13.3799 40.8149 13.0505 40.5571 12.7783C40.3029 12.5026 39.9842 12.3647 39.6011 12.3647C39.1284 12.3647 38.7578 12.5402 38.4893 12.8911C38.2243 13.2384 38.0918 13.7254 38.0918 14.3521C38.0918 14.8927 38.2189 15.326 38.4731 15.6519C38.731 15.9741 39.0711 16.1353 39.4937 16.1353C39.9233 16.1353 40.2725 15.9813 40.541 15.6733C40.8096 15.3618 40.9438 14.9644 40.9438 14.481ZM46.9917 12.687C46.8413 12.5688 46.6247 12.5098 46.3418 12.5098C45.973 12.5098 45.665 12.6763 45.418 13.0093C45.1709 13.3423 45.0474 13.7952 45.0474 14.3682V17H43.8013V11.5H45.0474V12.6333H45.0688C45.1906 12.2466 45.3768 11.9458 45.6274 11.731C45.8817 11.5125 46.1646 11.4033 46.4761 11.4033C46.7017 11.4033 46.8735 11.4373 46.9917 11.5054V12.687ZM52.0942 17H50.8857V16.1406H50.8643C50.4847 16.7995 49.9279 17.1289 49.1938 17.1289C48.6532 17.1289 48.2288 16.9821 47.9209 16.6885C47.6165 16.3949 47.4644 16.0063 47.4644 15.5229C47.4644 14.4845 48.0623 13.8794 49.2583 13.7075L50.8911 13.4766C50.8911 12.6924 50.5187 12.3003 49.7739 12.3003C49.1187 12.3003 48.5278 12.5259 48.0015 12.9771V11.8867C48.5815 11.543 49.2511 11.3711 50.0103 11.3711C51.3996 11.3711 52.0942 12.055 52.0942 13.4229V17ZM50.8911 14.2983L49.7363 14.4595C49.3783 14.506 49.1079 14.5938 48.9253 14.7227C48.7463 14.848 48.6567 15.07 48.6567 15.3887C48.6567 15.6214 48.7391 15.813 48.9038 15.9634C49.0721 16.1102 49.2959 16.1836 49.5752 16.1836C49.9548 16.1836 50.2681 16.0511 50.5151 15.7861C50.7658 15.5176 50.8911 15.181 50.8911 14.7764V14.2983ZM58.6201 17H57.374V16.0654H57.3525C56.9515 16.7744 56.3338 17.1289 55.4995 17.1289C54.8228 17.1289 54.2803 16.8836 53.8721 16.3931C53.4674 15.8989 53.2651 15.2275 53.2651 14.3789C53.2651 13.4694 53.4889 12.7407 53.9365 12.1929C54.3877 11.645 54.9875 11.3711 55.7358 11.3711C56.4771 11.3711 57.016 11.6683 57.3525 12.2627H57.374V8.85742H58.6201V17ZM57.3901 14.4863V13.7666C57.3901 13.3763 57.263 13.0451 57.0088 12.7729C56.7546 12.5008 56.4305 12.3647 56.0366 12.3647C55.5711 12.3647 55.2041 12.5384 54.9355 12.8857C54.6706 13.2331 54.5381 13.7147 54.5381 14.3306C54.5381 14.8892 54.6652 15.3314 54.9194 15.6572C55.1772 15.9795 55.5228 16.1406 55.9561 16.1406C56.3822 16.1406 56.7277 15.9849 56.9927 15.6733C57.2576 15.3582 57.3901 14.9626 57.3901 14.4863ZM64.9043 14.5884H61.1553C61.1696 15.0968 61.3254 15.4889 61.6226 15.7646C61.9233 16.0404 62.3351 16.1782 62.8579 16.1782C63.4451 16.1782 63.984 16.0028 64.4746 15.6519V16.6562C63.9733 16.9714 63.3109 17.1289 62.4873 17.1289C61.6781 17.1289 61.0425 16.88 60.5806 16.3823C60.1222 15.881 59.8931 15.1774 59.8931 14.2715C59.8931 13.4157 60.1455 12.7192 60.6504 12.1821C61.1589 11.6414 61.7891 11.3711 62.541 11.3711C63.293 11.3711 63.8748 11.6128 64.2866 12.0962C64.6984 12.5796 64.9043 13.251 64.9043 14.1104V14.5884ZM63.7012 13.7075C63.6976 13.2599 63.592 12.9126 63.3843 12.6655C63.1766 12.4149 62.8901 12.2896 62.5249 12.2896C62.1668 12.2896 61.8625 12.4202 61.6118 12.6816C61.3647 12.943 61.2126 13.285 61.1553 13.7075H63.7012ZM75.7915 17H74.395L70.7158 11.3389C70.6227 11.1956 70.5457 11.047 70.4849 10.8931H70.4526C70.4813 11.0578 70.4956 11.4105 70.4956 11.9512V17H69.2603V9.29785H70.748L74.3037 14.8247C74.4541 15.0539 74.5508 15.2114 74.5938 15.2974H74.6152C74.5794 15.0933 74.5615 14.7477 74.5615 14.2607V9.29785H75.7915V17ZM80.0024 17.1289C79.1538 17.1289 78.4753 16.8729 77.9668 16.3608C77.4619 15.8452 77.2095 15.1631 77.2095 14.3145C77.2095 13.3906 77.4727 12.6691 77.999 12.1499C78.529 11.6307 79.2415 11.3711 80.1367 11.3711C80.9961 11.3711 81.6657 11.6235 82.1455 12.1284C82.6253 12.6333 82.8652 13.3333 82.8652 14.2285C82.8652 15.1058 82.6056 15.8094 82.0864 16.3394C81.5708 16.8657 80.8761 17.1289 80.0024 17.1289ZM80.0615 12.3647C79.5745 12.3647 79.1896 12.5348 78.9067 12.875C78.6239 13.2152 78.4824 13.6842 78.4824 14.2822C78.4824 14.8587 78.6257 15.3135 78.9121 15.6465C79.1986 15.9759 79.5817 16.1406 80.0615 16.1406C80.5521 16.1406 80.9281 15.9777 81.1895 15.6519C81.4544 15.326 81.5869 14.8623 81.5869 14.2607C81.5869 13.6556 81.4544 13.1883 81.1895 12.8589C80.9281 12.5295 80.5521 12.3647 80.0615 12.3647ZM91.5342 11.5L89.9121 17H88.6069L87.6079 13.2725C87.5685 13.1292 87.5435 12.9681 87.5327 12.7891H87.5112C87.5041 12.9108 87.4718 13.0684 87.4146 13.2617L86.3296 17H85.0513L83.4346 11.5H84.7236L85.7227 15.4639C85.7549 15.582 85.7764 15.7396 85.7871 15.9365H85.8247C85.8354 15.7861 85.8641 15.625 85.9106 15.4531L87.0225 11.5H88.1934L89.1816 15.48C89.2139 15.6053 89.2371 15.7629 89.2515 15.9526H89.2891C89.2962 15.8201 89.3231 15.6626 89.3696 15.48L90.3472 11.5H91.5342Z" fill="white"></path></svg></div>
                                                )}

                                            </div>
                                        </div>

                                        <div className="summary-position-section">
                                            <h6>{getStrings('summary-position')}</h6>
                                            <p>{getStrings('decide-where-the')}</p>
                                            <select
                                                value={summaryPositionGoc}
                                                onChange={(e) => updateAISetting('summary_position_goc', e.target.value)}
                                                className="position-select"
                                            >
                                                <option value="below">{getStrings('summary-position-below')}</option>
                                                <option value="above">{getStrings('summary-position-above')}</option>
                                            </select>
                                            <Tooltip content="You can show the summary above the table for quick context, or below it for post-analysis insights." />

                                            <br />
                                            <br />
                                            <div className={`summary-title-section ${!isProActive() ? 'swptls-pro-settings' : ''}`}>
                                                <div className="summary-btn-text">
                                                    <label >{getStrings('suma-title')}</label>
                                                    <Tooltip content="Customize the summary title of the generated backend summary" />

                                                    {!isProActive() && (
                                                        <button className="btn-pro">
                                                            {getStrings('pro')}
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={instant_summaryTitle}
                                                    onChange={(e) => updateAISetting('instant_summary_title', e.target.value)}
                                                    placeholder="Table Summary"
                                                    disabled={!isProActive()}
                                                />


                                            </div>
                                        </div>


                                        {/* Cache feature  */}

                                        <div className={`cache-section `}>
                                            <div className={`checkbox-toggle`}>
                                                {/* <label className={`checkbox-label ${!isProActive() ? 'swptls-pro-settings' : ''}`}> */}
                                                <label className={`checkbox-label`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tableSettings?.table_settings?.enable_ai_cache || false}
                                                        onChange={(e) =>
                                                            setTableSettings({
                                                                ...tableSettings,
                                                                table_settings: {
                                                                    ...tableSettings.table_settings,
                                                                    enable_ai_cache: e.target.checked
                                                                }
                                                            })
                                                        }
                                                    // disabled={!isProActive()}
                                                    />
                                                    {getStrings('cache-to-load-faster')}

                                                    <Tooltip content="When enabled, visitors see the cached version (default 15 min). Turn off if you want a fresh summary every time." />

                                                    {tableSettings?.table_settings?.enable_ai_cache && (
                                                        <span className="cache-time">
                                                            {getStrings('cachetime')} {globalAISettings?.cache_duration ? Math.round(globalAISettings.cache_duration / 60) : '15'} {getStrings('text-min')}
                                                            <a href="?page=gswpts-dashboard#/settings-aiconfig" className="adjust-link">(adjust)</a>
                                                        </span>
                                                    )}

                                                </label>
                                            </div>
                                            <p className="setting-description">{getStrings('enable-to-reuse-the-same-summary')}</p>
                                        </div>

                                        {/* Show regenerate button feature  */}
                                        <div className={`regenerate-button-section`}>
                                            <div className={`checkbox-toggle`}>
                                                <label className={`checkbox-label ${!isProActive() ? 'swptls-pro-settings' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tableSettings?.table_settings?.show_regenerate_button || false}
                                                        onChange={(e) => {
                                                            if (!isProActive()) {
                                                                return;
                                                            }
                                                            setTableSettings({
                                                                ...tableSettings,
                                                                table_settings: {
                                                                    ...tableSettings.table_settings,
                                                                    show_regenerate_button: e.target.checked
                                                                }
                                                            })
                                                        }}
                                                        disabled={!isProActive()}
                                                    />
                                                    {getStrings('show-regenerate-button')}

                                                    <Tooltip content="When enabled, visitors can regenerate the AI summary with fresh data by clicking the regenerate button in the summary modal." />

                                                    {!isProActive() && (
                                                        <button className="btn-pro">
                                                            {getStrings('pro')}
                                                        </button>
                                                    )}

                                                </label>
                                            </div>


                                            <p className="setting-description">{getStrings('allow-visitors-to-regenerate-summary')}</p>
                                        </div>

                                    </div>
                                )}

                                {/* Instant Summary Settings */}

                                {summarySource === 'instant_summary' && isProActive() && (
                                    <div className="instant-summary-settings">
                                        <div className="instant-summary-layout">
                                            <div className="instant-summary-left">
                                                <div className="prompt-section">
                                                    <h6>{getStrings('prompt-for-summary')}</h6>
                                                    <p>{getStrings('write-the-prompt')}</p>

                                                    <div className="textarea-container">
                                                        <textarea
                                                            className={`setting-textarea ${!isEditingPrompt ? 'disabled' : ''}`}
                                                            rows={4}
                                                            value={tableSettings?.table_settings?.summary_prompt ?? 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.'}
                                                            onChange={(e) => setTableSettings({
                                                                ...tableSettings,
                                                                table_settings: {
                                                                    ...tableSettings.table_settings,
                                                                    summary_prompt: e.target.value
                                                                }
                                                            })}
                                                            placeholder="Enter your custom prompt for AI summary generation..."
                                                            disabled={!isEditingPrompt}
                                                        />

                                                        {/* Edit icon - only show when summary exists */}
                                                        {existingBackendSummary && (
                                                            <button
                                                                className={`edit-prompt-icon ${isEditingPrompt ? 'editing' : ''}`}
                                                                onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                                                                title={isEditingPrompt ? 'Lock prompt' : 'Edit prompt'}
                                                            >
                                                                {isEditingPrompt ? (
                                                                    <>
                                                                        {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C11.45 17 11 16.55 11 16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16C13 16.55 12.55 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor" />
                                                                    </svg> */}
                                                                    </>

                                                                ) : (
                                                                    // Edit icon when locked (to enable editing)
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <button
                                                        className="generate-summary-btn"
                                                        onClick={handleGenerateBackendSummary}
                                                        disabled={isGeneratingBackendSummary}
                                                    >
                                                        {isGeneratingBackendSummary
                                                            ? 'Wait we are generating summary...'
                                                            : existingBackendSummary
                                                                ? 'Regenerate Summary'
                                                                : 'Analyze Table & Generate Summary'
                                                        }
                                                    </button>

                                                    <div className="prompt-actions">
                                                        <button
                                                            className={`reset-prompt-btn ${isPromptDefault() ? 'disabled' : ''}`}
                                                            onClick={resetPromptToDefault}
                                                            disabled={isPromptDefault()}
                                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M21.5 2V8M21.5 8H16M21.5 8L18.5 5C17.0699 3.56988 15.2204 2.60131 13.1872 2.23364C11.1539 1.86596 9.0504 2.11773 7.16783 2.95214C5.28527 3.78656 3.72063 5.16428 2.68896 6.8987C1.6573 8.63312 1.20947 10.6472 1.40683 12.6606C1.60419 14.674 2.43769 16.5757 3.79362 18.1027C5.14955 19.6296 6.95991 20.7065 8.96134 21.1878C10.9628 21.6691 13.0626 21.5317 14.9821 20.7942C16.9017 20.0567 18.5515 18.7541 19.7 17.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            {getStrings('reset-prompt')}
                                                        </button>
                                                        {existingBackendSummary && lastGeneratedAt && (
                                                            <span className="last-generated">
                                                                {lastGeneratedAt}
                                                            </span>
                                                        )}
                                                    </div>


                                                </div>

                                                <div className="summary-position-section">
                                                    <h6>{getStrings('summary-position')}</h6>
                                                    <p>{getStrings('deceide-where-ai-summary-display')}</p>
                                                    <select
                                                        value={summaryPosition}
                                                        onChange={(e) => updateAISetting('summary_position', e.target.value)}
                                                        className="position-select"
                                                    >
                                                        <option value="above">{getStrings('summary-position-above')}</option>
                                                        <option value="below">{getStrings('summary-position-below')}</option>
                                                    </select>
                                                    <br />
                                                    <br />

                                                    <div className={`summary-title-section ${!isProActive() ? 'swptls-pro-settings' : ''}`}>
                                                        <div className="summary-btn-text">
                                                            <label >{getStrings('suma-title')}</label>
                                                            <Tooltip content="Customize the summary title of the generated backend summary" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={summaryTitle}
                                                            onChange={(e) => updateAISetting('summary_title', e.target.value)}
                                                            placeholder="Table Summary"
                                                            disabled={!isProActive()}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Code commented as per product team request  */}
                                                {/* <div className="swptls-link-support">
                                                    <div className="title">
                                                        <label htmlFor="summary-display-selection">
                                                            {getStrings('summary-display-title')}
                                                        </label>
                                                        <Tooltip content={getStrings('summary-display-description')} />
                                                    </div>
                                                    <div className="link-modes">
                                                        <input
                                                            type="radio"
                                                            name="summary_display"
                                                            id="always_show"
                                                            value="always_show"
                                                            checked={summaryDisplay === 'always_show'}
                                                            onChange={(e) => updateAISetting('summary_display', e.target.value)}
                                                        />
                                                        <label
                                                            className="smart_link"
                                                            htmlFor="always_show"
                                                        >
                                                            {getStrings('always-show')}
                                                        </label>
                                                        <Tooltip content="Summary is always visible to visitors" />
                                                        
                                                    </div>
                                                    <div className="link-modes">
                                                        <input
                                                            type="radio"
                                                            name="summary_display"
                                                            id="collapsed"
                                                            value="collapsed"
                                                            checked={summaryDisplay === 'collapsed'}
                                                            onChange={(e) => updateAISetting('summary_display', e.target.value)}
                                                        />
                                                        <label htmlFor="collapsed">
                                                            {getStrings('collapsed-click-to-expand')}
                                                        </label>
                                                        <Tooltip content="Summary is collapsed by default, visitors can expand it" />
                                                    </div>
                                                </div> */}
                                            </div>

                                            <div className="instant-summary-right">
                                                <div className="summary-preview-section">
                                                    <div className="summary-preview-title">
                                                        <h6>{getStrings('ai-summary-preview')}</h6>
                                                        <p>{getStrings('ai-summary-preview-description')}</p>
                                                    </div>

                                                    {!existingBackendSummary && !editedSummary && !isGeneratingBackendSummary ? (
                                                        <div className="browser-mockup-enhanced">
                                                            <div className="browser-header">
                                                                <div className="browser-dots">
                                                                    <span className="dot red"></span>
                                                                    <span className="dot yellow"></span>
                                                                    <span className="dot green"></span>
                                                                </div>
                                                                <div className="browser-title">{getStrings('ai-summary-feature')}</div>
                                                            </div>
                                                            <div className="browser-content browser-content-ai-empty">
                                                                <div className="no-summary-placeholder">
                                                                    <div className="placeholder-icon">👏</div>
                                                                    <div className="placeholder-content">
                                                                        <h6>{getStrings('ready-to-create-first-summary')}</h6>
                                                                        <p>{getStrings('add-prompt-and-generate')}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="browser-mockup-enhanced">
                                                            <div className="browser-header">
                                                                <div className="browser-dots">
                                                                    <span className="dot red"></span>
                                                                    <span className="dot yellow"></span>
                                                                    <span className="dot green"></span>
                                                                </div>
                                                                <div className="browser-title">{getStrings('ai-summary-editor')}</div>
                                                            </div>
                                                            <div className="browser-content browser-content-ai-summary">
                                                                <div className="summary-preview-container">
                                                                    <div className="github-editor-header">
                                                                        <div className="preview-tabs">
                                                                            <button
                                                                                className={`preview-tab ${isEditingPreview ? 'active' : ''}`}
                                                                                onClick={() => setIsEditingPreview(true)}
                                                                            >
                                                                                <span className="tab-icon">
                                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                                                        <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Z" />
                                                                                    </svg>
                                                                                </span>
                                                                                {getStrings('edit-theme')}
                                                                            </button>
                                                                            <button
                                                                                className={`preview-tab ${!isEditingPreview ? 'active' : ''}`}
                                                                                onClick={() => setIsEditingPreview(false)}
                                                                            >
                                                                                <span className="tab-icon">
                                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                                                        <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136C13.91 7.310 13.08 6.183 11.955 5.215 10.825 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
                                                                                    </svg>
                                                                                </span>
                                                                                {getStrings('preview')}
                                                                            </button>
                                                                        </div>

                                                                        <div className="header-right-section">
                                                                            {/* Markdown Toolbar - Show only in edit mode */}
                                                                            {isEditingPreview && (
                                                                                <div className="markdown-toolbar">
                                                                                    <button
                                                                                        className="markdown-btn"
                                                                                        title="Bold"
                                                                                        onClick={handleBold}
                                                                                    >
                                                                                        <strong>B</strong>
                                                                                    </button>
                                                                                    <button
                                                                                        className="markdown-btn"
                                                                                        title="Italic"
                                                                                        onClick={handleItalic}
                                                                                    >
                                                                                        <em>I</em>
                                                                                    </button>
                                                                                    <button
                                                                                        className="markdown-btn"
                                                                                        title="Bullet List"
                                                                                        onClick={handleBulletList}
                                                                                    >
                                                                                        {getStrings('list-no-1')}
                                                                                    </button>
                                                                                    <button
                                                                                        className="markdown-btn"
                                                                                        title="Numbered List"
                                                                                        onClick={handleNumberedList}
                                                                                    >
                                                                                        {getStrings('list-no-2')}
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {isEditingPreview ? (
                                                                        <div className="edit-summary-container">
                                                                            <textarea
                                                                                ref={textareaRef}
                                                                                className="edit-summary-textarea"
                                                                                value={editedSummary}
                                                                                onChange={(e) => setEditedSummary(e.target.value)}
                                                                                rows={8}
                                                                            />
                                                                            <div className="edit-actions">
                                                                                <button
                                                                                    className="save-summary-btn"
                                                                                    onClick={handleSaveBackendSummary}
                                                                                    disabled={!editedSummary.trim()}
                                                                                >
                                                                                    {getStrings('save-backend-summary')}
                                                                                </button>
                                                                                <button
                                                                                    className="delete-summary-btn"
                                                                                    onClick={handleShowDeleteConfirmation}
                                                                                >
                                                                                    {getStrings('delete-backend-summary')}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : isGeneratingBackendSummary ? (
                                                                        <div className="summary-preview-content">
                                                                            <div className="summary-panel">
                                                                                <div className="generating-message">
                                                                                    <div className="spinner"></div>
                                                                                    <p>{getStrings('analyzing-table')}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="summary-preview-content">
                                                                            <div className="summary-panel">
                                                                                {summarySource === 'instant_summary' && (
                                                                                    <div className="ai-summary-header">
                                                                                        <span className="ai-icon">
                                                                                            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                <g clipPath="url(#clip0_2856_18445)">
                                                                                                    <path d="M21.4284 11.2353C15.681 11.582 11.0818 16.1813 10.7352 21.9287H10.6932C10.3465 16.1813 5.74734 11.582 0 11.2353V11.1934C5.74734 10.8467 10.3465 6.24744 10.6932 0.5H10.7352C11.0818 6.24744 15.681 10.8467 21.4284 11.1934V11.2353Z" fill="url(#paint0_radial_2856_18445)" />
                                                                                                    <path d="M24.001 20.2228C21.7021 20.3615 19.8624 22.2012 19.7238 24.5002H19.707C19.5683 22.2012 17.7286 20.3615 15.4297 20.2228V20.2061C17.7286 20.0674 19.5683 18.2277 19.707 15.9287H19.7238C19.8624 18.2277 21.7021 20.0674 24.001 20.2061V20.2228Z" fill="url(#paint1_radial_2856_18445)" />
                                                                                                </g>
                                                                                                <defs>
                                                                                                    <radialGradient id="paint0_radial_2856_18445" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.12658 9.20886) rotate(18.6835) scale(22.8078 182.707)">
                                                                                                        <stop offset="0.0671246" stopColor="#9168C0" />
                                                                                                        <stop offset="0.342551" stopColor="#5684D1" />
                                                                                                        <stop offset="0.672076" stopColor="#1BA1E3" />
                                                                                                    </radialGradient>
                                                                                                    <radialGradient id="paint1_radial_2856_18445" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16.2803 19.4123) rotate(18.6835) scale(9.12314 73.083)">
                                                                                                        <stop offset="0.0671246" stopColor="#9168C0" />
                                                                                                        <stop offset="0.342551" stopColor="#5684D1" />
                                                                                                        <stop offset="0.672076" stopColor="#1BA1E3" />
                                                                                                    </radialGradient>
                                                                                                    <clipPath id="clip0_2856_18445">
                                                                                                        <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
                                                                                                    </clipPath>
                                                                                                </defs>
                                                                                            </svg>
                                                                                        </span>
                                                                                        <h4 className="summary-title">{summaryTitle}</h4>
                                                                                    </div>
                                                                                )}
                                                                                <div
                                                                                    className="summary-content"
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: processMarkdownToHTML(existingBackendSummary || editedSummary)
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Separator line - Show only when AI Summary is enabled */}
                    {tableSettings?.table_settings?.enable_ai_summary && (
                        <div className="ai-section-separator"></div>
                    )}

                    {/* Ask AI Section */}
                    <div className={`ai-feature-section`}>
                        <div className="feature-toggle">
                            <label className={`toggle-switch ${!isProActive() ? 'swptls-pro-settings' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={tableSettings?.table_settings?.show_table_prompt_fields || false}
                                    onChange={(e) =>
                                        setTableSettings({
                                            ...tableSettings,
                                            table_settings: {
                                                ...tableSettings.table_settings,
                                                show_table_prompt_fields: e.target.checked,
                                            },
                                        })
                                    }
                                    disabled={!isProActive()}
                                />
                                <span className="slider"></span>
                            </label>


                            <div className="feature-info">
                                <h4>{getStrings('enable-ask-ai')}</h4>
                                <p>{getStrings('lets-visitors')}</p>
                            </div>

                            <span className="tooltip-cache ai-table-prompt-tooltip">
                                <Tooltip content={getStrings('tooltip-65')} />
                                {!isProActive() && (
                                    <button className="btn-pro btn-new">
                                        {getStrings('pro')}
                                    </button>
                                )}

                                {/* we will add video later then use this  */}
                                {/* <button className="btn-pro btn-youtube">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor" />
                                    </svg>
                                    {getStrings('Youtube-title')}
                                </button> */}
                            </span>
                        </div>

                        {tableSettings?.table_settings?.show_table_prompt_fields && isProActive() && (
                            <div className="ask-ai-settings">
                                <div className="ask-ai-layout">
                                    <div className="ask-ai-left">
                                        <div className="placeholder-section">
                                            <h6>{getStrings('sec-head')}</h6>
                                            <p>{getStrings('customize-main-head')}</p>
                                            <input
                                                type="text"
                                                value={askAIHeading}
                                                onChange={(e) => updateAISetting('ask_ai_heading', e.target.value)}
                                                placeholder="Ask AI"
                                            />
                                        </div>

                                        <div className="placeholder-section">
                                            <h6>{getStrings('placeholder-text-title')}</h6>
                                            <p>{getStrings('placeholder-text-description')}</p>
                                            <input
                                                type="text"
                                                value={askAIPlaceholder}
                                                onChange={(e) => updateAISetting('ask_ai_placeholder', e.target.value)}
                                                placeholder="Ask anything about this table… e.g., Top 5 products by sales"
                                            />
                                        </div>

                                        <div className="button-label-section">
                                            <h6>{getStrings('button-label-title')}</h6>
                                            <p>{getStrings('button-label-description')}</p>
                                            <input
                                                type="text"
                                                value={askAIButtonLabel}
                                                onChange={(e) => updateAISetting('ask_ai_button_label', e.target.value)}
                                                placeholder="Ask AI"
                                            />
                                        </div>
                                    </div>

                                    <div className="ask-ai-right">
                                        <div className="ask-ai-preview">
                                            <h6>Live Preview</h6>
                                            <div className="browser-mockup-enhanced">
                                                <div className="browser-header">
                                                    <div className="browser-dots">
                                                        <span className="dot red"></span>
                                                        <span className="dot yellow"></span>
                                                        <span className="dot green"></span>
                                                    </div>
                                                    <div className="browser-title">{getStrings('ask-ai-interface')}</div>
                                                </div>
                                                <div className="browser-content browser-content-ai-ask">
                                                    <h4>{askAIHeading}</h4>
                                                    <div className="preview-container">
                                                        <input
                                                            type="text"
                                                            placeholder={askAIPlaceholder}
                                                            className="preview-input"
                                                            readOnly
                                                        />
                                                        <button className="preview-button">
                                                            {askAIButtonLabel}
                                                        </button>
                                                    </div>
                                                    <p className="preview-hint">
                                                        {getStrings('ask-ai-interface-hint')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}


                    </div>

                </div>
            )}
        </div >
    );
};

export default AIView;