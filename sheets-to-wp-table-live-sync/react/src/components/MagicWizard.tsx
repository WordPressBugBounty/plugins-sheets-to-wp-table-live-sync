import React from 'react'

const MagicWizard = ({ isAIConfigured, tableSettings, setTableSettings }) => {

    const handleToggleWithAnimation = (toggleType: string, value: boolean) => {
        if (!isAIConfigured) {
            const wizardSection = document.querySelector('.wizard-setup-content');
            if (wizardSection) {
                const scrollableParent = wizardSection.closest('[style*="overflow"]') || window;
                const isWindow = scrollableParent === window;

                // Calculate scroll position
                const currentScroll = isWindow ? window.scrollY : (scrollableParent as Element).scrollTop;
                const maxScroll = isWindow
                    ? document.documentElement.scrollHeight - window.innerHeight
                    : (scrollableParent as Element).scrollHeight - (scrollableParent as Element).clientHeight;

                // Calculate current scroll percentage
                const scrollPercentage = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 100;

                // If less than 20%, scroll first then shake
                if (scrollPercentage < 20) {
                    const targetScroll = Math.min(currentScroll + (maxScroll * 0.4), maxScroll);

                    scrollableParent.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });

                    // Shake after scroll completes
                    setTimeout(() => {
                        wizardSection.classList.add('shake-animation');
                        setTimeout(() => {
                            wizardSection.classList.remove('shake-animation');
                        }, 600);
                    }, 350);
                } else {
                    // If 40% or more, just shake immediately
                    wizardSection.classList.add('shake-animation');
                    setTimeout(() => {
                        wizardSection.classList.remove('shake-animation');
                    }, 600);
                }
            }
            return;
        }

        // Update the setting
        setTableSettings({
            ...tableSettings,
            table_settings: {
                ...tableSettings.table_settings,
                [toggleType]: value,
            },
        });
    };

    return (
        <div className="ai-wizard-section">

            <div className="wizard-toggles">
                <div className="wizard-toggle-item">
                    <div className="toggle-switch-container">

                        <div className="toggle-content">
                            <h4>🤖 AI Table Summary</h4>
                            <p>Turn your data into quick and smart summary</p>
                        </div>

                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={isAIConfigured && (tableSettings?.table_settings?.enable_ai_summary || false)}
                                onChange={(e) => handleToggleWithAnimation('enable_ai_summary', e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>

                    </div>
                </div>

                <div className="wizard-toggle-item">
                    <div className="toggle-switch-container">

                        <div className="toggle-content">
                            <h4>💬 Ask AI</h4>
                            <p>Lets visitors chat with your table data</p>
                        </div>

                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={tableSettings?.table_settings?.show_table_prompt_fields || false}
                                onChange={(e) => handleToggleWithAnimation('show_table_prompt_fields', e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>

                    </div>
                </div>
            </div>

            <div className="wizard-setup">
                {/* <div className="wizard-icon">🧙‍♂️</div> */}
                <div className="wizard-icon">
                    <svg height="70px" width="70px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.163 15.163"><g><path style={{ fill: "#5c606a" }} d="M11.649,10.797c-0.025-0.014-0.053-0.022-0.079-0.032L7.947,1.183l0.017-0.02
        C8.003,1.139,8.045,1.121,8.09,1.116c0.265-0.025,0.626,0.11,0.804,0.481c0.392,1.185,1.217,1.252,1.217,1.252
        S9.309,2.554,9.099,1.718C8.984,1.25,8.65,1.02,8.65,1.02C8.501,0.901,8.314,0.822,8.072,0.823c-0.033,0-0.063,0.01-0.096,0.016
        c0.02-0.025,0.039-0.047,0.066-0.062c0.181-0.093,0.477-0.1,0.71,0.114C8.973,1.152,9.19,1.293,9.382,1.37
        c0.422,0.655,0.974,0.701,0.974,0.701s-0.479-0.18-0.802-0.646c0.251,0.058,0.422,0.009,0.422,0.009S9.76,1.437,9.505,1.342
        C9.43,1.217,9.362,1.079,9.32,0.915C9.204,0.437,8.863,0.202,8.863,0.202C8.709,0.08,8.518-0.001,8.271,0
        C8.017,0.001,7.807,0.174,7.687,0.344c-0.014,0.02-0.089,0.124-0.104,0.144C7.524,0.564,7.166,1.303,7.166,1.303
        s-0.063,0.158-0.12,0.3c-0.01,0.018-0.018,0.036-0.022,0.056c-0.576,1.438-2.547,6.371-3.61,9.187
        c-0.887,0.382-2.531,1.252-2.331,2.391c0.153,0.871,1.085,1.708,6.832,1.923c0.118,0.002,0.241,0.003,0.368,0.003
        c2.154,0,5.412-0.241,5.777-1.669C14.343,12.389,12.921,11.473,11.649,10.797z M8.161,0.348C8.201,0.323,8.244,0.305,8.289,0.3
        C8.56,0.274,8.93,0.412,9.111,0.792C9.17,0.97,9.239,1.12,9.312,1.252c-0.134-0.076-0.267-0.18-0.379-0.334
        c-0.214-0.3-0.519-0.37-0.519-0.37C8.284,0.51,8.14,0.506,7.982,0.563L8.161,0.348z M7.811,13.959
        c-4.87,0.079-5.483-1.016-5.611-1.152c0.054-0.119,0.33-0.292,0.598-0.477c-0.041,0.129-0.069,0.225-0.076,0.271
        c-0.102,0.71,8.629,1.457,9.625,0l-0.097-0.256c0.569,0.411,0.638,0.618,0.648,0.618C12.651,13.397,10.867,13.908,7.811,13.959z"/>
                    </g>
                    </svg>
                </div>
                <div className="wizard-setup-content">
                    <h4>Connect AI to Unlock Features</h4>
                    <p>Set up your preferred provider (like Gemini or OpenAI) to use these AI tools.</p>
                    <div className="wizard-buttons">
                        <a
                            href="?page=gswpts-dashboard#/settings-aiconfig"
                            className="setup-ai-button"
                        >

                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">

                                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

                                <g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0175 19C10.6601 19 10.3552 18.7347 10.297 18.373C10.2434 18.0804 10.038 17.8413 9.76171 17.75C9.53658 17.6707 9.31645 17.5772 9.10261 17.47C8.84815 17.3365 8.54289 17.3565 8.30701 17.522C8.02156 17.7325 7.62943 17.6999 7.38076 17.445L6.41356 16.453C6.15326 16.186 6.11944 15.7651 6.33361 15.458C6.49878 15.2105 6.52257 14.8914 6.39601 14.621C6.31262 14.4332 6.23906 14.2409 6.17566 14.045C6.08485 13.7363 5.8342 13.5051 5.52533 13.445C5.15287 13.384 4.8779 13.0559 4.87501 12.669V11.428C4.87303 10.9821 5.18705 10.6007 5.61601 10.528C5.94143 10.4645 6.21316 10.2359 6.33751 9.921C6.37456 9.83233 6.41356 9.74433 6.45451 9.657C6.61989 9.33044 6.59705 8.93711 6.39503 8.633C6.1424 8.27288 6.18119 7.77809 6.48668 7.464L7.19746 6.735C7.54802 6.37532 8.1009 6.32877 8.50396 6.625L8.52638 6.641C8.82735 6.84876 9.21033 6.88639 9.54428 6.741C9.90155 6.60911 10.1649 6.29424 10.2375 5.912L10.2473 5.878C10.3275 5.37197 10.7536 5.00021 11.2535 5H12.1115C12.6248 4.99976 13.0629 5.38057 13.1469 5.9L13.1625 5.97C13.2314 6.33617 13.4811 6.63922 13.8216 6.77C14.1498 6.91447 14.5272 6.87674 14.822 6.67L14.8707 6.634C15.2842 6.32834 15.8528 6.37535 16.2133 6.745L16.8675 7.417C17.1954 7.75516 17.2366 8.28693 16.965 8.674C16.7522 8.99752 16.7251 9.41325 16.8938 9.763L16.9358 9.863C17.0724 10.2045 17.3681 10.452 17.7216 10.521C18.1837 10.5983 18.5235 11.0069 18.525 11.487V12.6C18.5249 13.0234 18.2263 13.3846 17.8191 13.454C17.4842 13.5199 17.2114 13.7686 17.1083 14.102C17.0628 14.2353 17.0121 14.3687 16.9562 14.502C16.8261 14.795 16.855 15.1364 17.0323 15.402C17.2662 15.7358 17.2299 16.1943 16.9465 16.485L16.0388 17.417C15.7792 17.6832 15.3698 17.7175 15.0716 17.498C14.8226 17.3235 14.5001 17.3043 14.2331 17.448C14.0428 17.5447 13.8475 17.6305 13.6481 17.705C13.3692 17.8037 13.1636 18.0485 13.1099 18.346C13.053 18.7203 12.7401 18.9972 12.3708 19H11.0175Z" stroke="#f5f4f4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9747 12C13.9747 13.2885 12.9563 14.333 11.7 14.333C10.4437 14.333 9.42533 13.2885 9.42533 12C9.42533 10.7115 10.4437 9.66699 11.7 9.66699C12.9563 9.66699 13.9747 10.7115 13.9747 12Z" stroke="#f5f4f4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /> </g>

                            </svg>
                            {` `} Setup AI Provider
                        </a>
                        <a
                            href="https://www.youtube.com/watch?v=Mi2VYNtMU4s"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="watch-tutorial-button"
                        >
                            <span className='yt-icosn'>
                                <svg width="20px" height="20px" viewBox="0 -7 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <defs>

                                    </defs>
                                    <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g id="Color-" transform="translate(-200.000000, -368.000000)" fill="#008717">
                                            <path d="M219.044,391.269916 L219.0425,377.687742 L232.0115,384.502244 L219.044,391.269916 Z M247.52,375.334163 C247.52,375.334163 247.0505,372.003199 245.612,370.536366 C243.7865,368.610299 241.7405,368.601235 240.803,368.489448 C234.086,368 224.0105,368 224.0105,368 L223.9895,368 C223.9895,368 213.914,368 207.197,368.489448 C206.258,368.601235 204.2135,368.610299 202.3865,370.536366 C200.948,372.003199 200.48,375.334163 200.48,375.334163 C200.48,375.334163 200,379.246723 200,383.157773 L200,386.82561 C200,390.73817 200.48,394.64922 200.48,394.64922 C200.48,394.64922 200.948,397.980184 202.3865,399.447016 C204.2135,401.373084 206.612,401.312658 207.68,401.513574 C211.52,401.885191 224,402 224,402 C224,402 234.086,401.984894 240.803,401.495446 C241.7405,401.382148 243.7865,401.373084 245.612,399.447016 C247.0505,397.980184 247.52,394.64922 247.52,394.64922 C247.52,394.64922 248,390.73817 248,386.82561 L248,383.157773 C248,379.246723 247.52,375.334163 247.52,375.334163 L247.52,375.334163 Z" id="Youtube">

                                            </path>
                                        </g>
                                    </g>
                                </svg>
                            </span>

                            {` `}Help?
                        </a>
                    </div>
                </div>

                <div className="wizard-note">
                    💡 Not ready? No worries - you can enable AI anytime later.
                </div>

            </div>

        </div>
    )
}

export default MagicWizard