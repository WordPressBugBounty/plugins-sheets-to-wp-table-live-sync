import React, { useState } from 'react';
import { getStrings, isProActive } from './../Helpers';
import Tooltip from './Tooltip';
import { lockBTN } from '../icons';
import '../styles/_user_specific_display.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AuthSettings
 * @property {boolean} enable_auth_auto_select
 * @property {string}  match_user_by           - WP user field: 'email' | 'username' | 'display_name' | etc.
 * @property {number}  match_column_index      - Google Sheets column index to match against
 * @property {string}  non_logged_action       - 'show_prompt' | 'hide_table'
 * @property {string}  non_logged_message
 * @property {boolean} show_login_button
 * @property {string}  login_button_label
 * @property {string}  non_logged_login_url
 */

const USER_FIELD_OPTIONS = [
    { value: 'email',        label: 'Email' },
    { value: 'username',     label: 'Username' },
    { value: 'display_name', label: 'Display Name' },
    { value: 'first_name',   label: 'First Name' },
    { value: 'last_name',    label: 'Last Name' },
    { value: 'nickname',     label: 'Nickname' },
    { value: 'roles',        label: 'User Roles' },
    { value: 'user_id',      label: 'User ID' },
];

// ─── Sub-component: Pro Lock Overlay ──────────────────────────────────────────

const ProLockOverlay = () => (
    <div className="user-specific__pro-lock">
        <div className="pro-lock__inner">
            <span className="pro-lock__icon">{lockBTN}</span>
            <p className="pro-lock__text">
                This is a <strong>Pro</strong> feature. Upgrade to unlock user-specific display.
            </p>
            <button type="button" className="pro-lock__cta swptls-pro-settings">
                Upgrade to Pro
            </button>
        </div>
    </div>
);

// ─── Sub-component: Toggle Row ─────────────────────────────────────────────────

const ToggleRow = ({ id, label, tooltip, checked, onChange, disabled }) => (
    <div className={`us-toggle-row${disabled ? ' us-toggle-row--disabled' : ''}`}>
        <div className="us-toggle-row__control">
            <div className={`us-toggle ${checked ? 'us-toggle--on' : ''}`}>
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
                <label htmlFor={id} className="us-toggle__track">
                    <span className="us-toggle__thumb" />
                </label>
            </div>
        </div>
        <div className="us-toggle-row__label">
            <label htmlFor={id}>{label}</label>
            {tooltip && <Tooltip content={tooltip} />}
        </div>
    </div>
);

// ─── Sub-component: Radio Option ──────────────────────────────────────────────

const RadioOption = ({ id, name, value, label, tooltip, checked, onChange, disabled }) => (
    <label
        className={`us-radio-option${checked ? ' us-radio-option--active' : ''}${disabled ? ' us-radio-option--disabled' : ''}`}
        htmlFor={id}
    >
        <input
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
            disabled={disabled}
        />
        <span className="us-radio-dot">
            <span className="us-radio-dot-inner" />
        </span>
        {label}
        {tooltip && <Tooltip content={tooltip} />}
    </label>
);

// ─── Main: UserSpecificDisplay ────────────────────────────────────────────────

export const UserSpecificDisplay = ({ tableSettings, setTableSettings, tableHeaders }) => {
    const isPro = isProActive();
    const authSettings = tableSettings?.table_settings?.user_auth_filtering || {};

    // ── Derived values ──
    const enabled           = authSettings.enable_auth_auto_select || false;
    const matchUserBy       = authSettings.match_user_by           || 'email';
    const matchColumnIndex  = authSettings.match_column_index      ?? 0;
    const nonLoggedAction   = authSettings.non_logged_action       || 'show_prompt';
    const nonLoggedMessage  = authSettings.non_logged_message      || '';
    const showLoginButton   = authSettings.show_login_button       !== false; // default true
    const loginButtonLabel  = authSettings.login_button_label      || '';
    const loginUrl          = authSettings.non_logged_login_url    || '';

    // ── Generic setting updater ──
    const update = (key, value) => {
        setTableSettings({
            ...tableSettings,
            table_settings: {
                ...tableSettings.table_settings,
                user_auth_filtering: {
                    ...authSettings,
                    [key]: value,
                },
            },
        });
    };

    const isPrompt   = nonLoggedAction === 'show_prompt';
    const isHide     = nonLoggedAction === 'hide_table';
    const fieldsActive = enabled && isPro;

    return (
        <div className="user-specific-settings">
            {/* Pro lock overlay for free users */}
            {!isPro && <ProLockOverlay />}

            <div className={`us-section${!isPro ? ' us-section--locked' : ''}`}>

                {/* ── Master enable toggle ── */}
                <div className="us-global-settings">
                    <div className="us-section-header">
                        <ToggleRow
                            id="enable-user-specific"
                            label={getStrings('enable-user-specific-display') || 'Enable User-Specific Display'}
                            tooltip="Show each logged-in user only the data that matches their account"
                            checked={enabled}
                            onChange={(v) => update('enable_auth_auto_select', v)}
                            disabled={!isPro}
                        />
                        <p className="us-section-desc" style={{ marginTop: 6, paddingLeft: 1 }}>
                            {getStrings('how-table-data') || 'Show each logged-in user only the data that matches their account.'}
                        </p>
                    </div>
                </div>

                {/* ── Settings (only when enabled) ── */}
                {enabled && isPro && (
                    <div className="us-filter-config">

                        {/* Match logged-in user by */}
                        <div className="us-form-group">
                            <label htmlFor="match-user-by" className="us-form-group__label">
                                {getStrings('match-logged-in-user-by') || 'Match logged-in user by'}
                            </label>
                            <p className="us-form-group__hint">
                                {getStrings('match-user-by-desc') || 'Choose which WordPress user value FlexTable should use for matching.'}
                            </p>
                            <select
                                id="match-user-by"
                                className="us-select"
                                value={matchUserBy}
                                onChange={(e) => update('match_user_by', e.target.value)}
                            >
                                {USER_FIELD_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Match with Google Sheets column */}
                        <div className="us-form-group">
                            <label htmlFor="match-column" className="us-form-group__label">
                                {getStrings('match-with-google-sheets-column') || 'Match with Google Sheets column'}
                            </label>
                            <p className="us-form-group__hint">
                                {getStrings('match-column-desc') || 'Choose the sheet column that contains the value to match with the logged-in user.'}
                            </p>
                            <select
                                id="match-column"
                                className="us-select"
                                value={matchColumnIndex}
                                onChange={(e) => update('match_column_index', parseInt(e.target.value))}
                            >
                                {tableHeaders.length === 0 && (
                                    <option value={0}>Loading columns...</option>
                                )}
                                {tableHeaders.map((header, i) => (
                                    <option key={i} value={i}>{header.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="us-toggles-card__divider" />

                        {/* If visitor is not logged in */}
                        <div className="us-form-group us-form-group--no-margin">
                            <label className="us-form-group__label">
                                {getStrings('if-visitor-not-logged-in') || 'If visitor is not logged in'}
                            </label>
                            <p className="us-form-group__hint">
                                {getStrings('choose-what-visitors-see') || 'Choose what visitors should see before signing in.'}
                            </p>

                            {/* Radio options */}
                            <div className="us-radio-group">
                                <RadioOption
                                    id="action-show-prompt"
                                    name="non-logged-action"
                                    value="show_prompt"
                                    label={getStrings('show-login-prompt') || 'Show login prompt'}
                                    tooltip="Shows a message and optional login button to non-logged visitors"
                                    checked={isPrompt}
                                    onChange={(v) => update('non_logged_action', v)}
                                />
                                <RadioOption
                                    id="action-hide-table"
                                    name="non-logged-action"
                                    value="hide_table"
                                    label={getStrings('hide-table-completely') || 'Hide table completely'}
                                    tooltip="Table is fully invisible for visitors who are not logged in"
                                    checked={isHide}
                                    onChange={(v) => update('non_logged_action', v)}
                                />
                            </div>

                            {/* Login prompt sub-panel */}
                            {isPrompt && (
                                <div className="us-sub-panel">
                                    {/* Heading */}
                                    <div className="us-sub-field">
                                        <label htmlFor="non-logged-heading" className="us-sub-field__label">
                                            {/* <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M4 6h16M4 12h8M4 18h16" />
                                            </svg> */}
                                            {getStrings('non-logged-heading') || 'Heading'}
                                        </label>
                                        <input
                                            type="text"
                                            id="non-logged-heading"
                                            className="us-input"
                                            placeholder="e.g. Members-Only Content"
                                            value={authSettings.non_logged_heading || ''}
                                            onChange={(e) => update('non_logged_heading', e.target.value)}
                                        />
                                    </div>

                                    {/* Default message */}
                                    <div className="us-sub-field">
                                        <label htmlFor="non-logged-message" className="us-sub-field__label">
                                           {/*  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg> */}
                                            {getStrings('default-message') || 'Default message'}
                                        </label>
                                        <textarea
                                            id="non-logged-message"
                                            className="us-textarea"
                                            rows={3}
                                            placeholder="e.g. Please log in to view your information."
                                            value={nonLoggedMessage}
                                            onChange={(e) => update('non_logged_message', e.target.value)}
                                        />
                                    </div>

                                    {/* Show login button toggle */}
                                    <ToggleRow
                                        id="show-login-button"
                                        label={getStrings('show-login-button') || 'Show login button'}
                                        checked={showLoginButton}
                                        onChange={(v) => update('show_login_button', v)}
                                    />

                                    {/* Button fields — shown only when login button is ON */}
                                    {showLoginButton && (
                                        <>
                                            <div className="us-sub-field">
                                                <label htmlFor="login-btn-label" className="us-sub-field__label">
                                                    {getStrings('button-label') || 'Button label'}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="login-btn-label"
                                                    className="us-input"
                                                    placeholder="e.g. Log In"
                                                    value={loginButtonLabel}
                                                    onChange={(e) => update('login_button_label', e.target.value)}
                                                />
                                            </div>

                                            <div className="us-sub-field">
                                                <label htmlFor="login-page-url" className="us-sub-field__label">
                                                    {/* <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                    </svg> */}
                                                    {getStrings('login-page-url') || 'Login page URL'}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="login-page-url"
                                                    className="us-input"
                                                    placeholder="e.g. wp-admin"
                                                    value={loginUrl}
                                                    onChange={(e) => update('non_logged_login_url', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};