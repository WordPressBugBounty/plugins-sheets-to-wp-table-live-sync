import React, { useEffect, useState } from 'react';
import { Notice } from './McpUi';
import { toast } from 'react-toastify';
import { mcpApi, t } from './api';

type Props = {
	status: any;
	onChange: () => void;
};

export const expiryLabel = ( days: number ): string => {
	if ( 0 === days ) {
		return t( 'mcp-expiry-never', 'Never' );
	}
	return `${ days } ${ t( 'mcp-days', 'days' ) }`;
};

/**
 * Section 3: Credentials (strict mode, default expiry) and policies.
 */
const McpSecurity = ( { status, onChange }: Props ) => {
	const [ form, setForm ] = useState( status.settings );
	const [ saving, setSaving ] = useState( false );

	useEffect( () => setForm( status.settings ), [ status.settings ] );

	const dirty = JSON.stringify( form ) !== JSON.stringify( status.settings );

	const save = async () => {
		setSaving( true );
		try {
			await mcpApi( 'settings', 'POST', {
				strict: form.strict,
				expiry_days: Number( form.expiry_days ),
				publishing: form.publishing,
				allow_deletes: form.allow_deletes,
				data_reads: form.data_reads,
			} );
			toast.success( t( 'mcp-saved', 'MCP settings saved.' ) );
			onChange();
		} catch ( e: any ) {
			toast.error( e.message );
		} finally {
			setSaving( false );
		}
	};

	return (
		<div className="mcp-card">
			<h4 className="mcp-card__title">{ t( 'mcp-security', 'Credentials and policies' ) }</h4>

			{ ! status.app_passwords_available && (
				<Notice type="error">
					{ t( 'mcp-app-passwords-off', 'Application Passwords are not available on this site, so credentials cannot be generated. WordPress needs HTTPS (or a local environment), and some security plugins turn them off.' ) }
				</Notice>
			) }

			<label className="mcp-check">
				<input type="checkbox" checked={ !! form.strict } onChange={ ( e ) => setForm( { ...form, strict: e.target.checked } ) } />
				<span>
					<strong>{ t( 'mcp-strict', 'Only accept credentials generated here (recommended)' ) }</strong>
					<small>{ t( 'mcp-strict-desc', 'Credentials generated in "Connect an AI client" work only on the MCP endpoint and expire. Other Application Passwords open the whole WordPress REST API, so they are refused while this is on.' ) }</small>
				</span>
			</label>

			<div className="mcp-field">
				<label htmlFor="mcp-expiry">{ t( 'mcp-default-expiry', 'Default credential expiry' ) }</label>
				<select id="mcp-expiry" className="mcp-select" value={ form.expiry_days } onChange={ ( e ) => setForm( { ...form, expiry_days: Number( e.target.value ) } ) }>
					{ ( status.expiry_choices || [ 30, 90, 365, 0 ] ).map( ( d: number ) => (
						<option key={ d } value={ d }>{ expiryLabel( d ) }</option>
					) ) }
				</select>
			</div>

			<div className="mcp-field">
				<label htmlFor="mcp-publishing">{ t( 'mcp-publishing', 'Pages and posts' ) }</label>
				<select id="mcp-publishing" className="mcp-select" value={ form.publishing } onChange={ ( e ) => setForm( { ...form, publishing: e.target.value } ) }>
					<option value="drafts">{ t( 'mcp-publishing-drafts', 'Drafts only (recommended)' ) }</option>
					<option value="confirm">{ t( 'mcp-publishing-confirm', 'Allow publishing, with confirmation' ) }</option>
					<option value="off">{ t( 'mcp-publishing-off', 'Off: never change pages or posts' ) }</option>
				</select>
				<small className="mcp-muted">{ t( 'mcp-publishing-desc', 'With "Drafts only", AI clients can create draft pages and edit drafts, but never publish or change live content.' ) }</small>
			</div>

			<label className="mcp-check">
				<input type="checkbox" checked={ !! form.allow_deletes } onChange={ ( e ) => setForm( { ...form, allow_deletes: e.target.checked } ) } />
				<span>
					<strong>{ t( 'mcp-allow-deletes', 'Allow deleting tables and tab groups' ) }</strong>
					<small>{ t( 'mcp-allow-deletes-desc', 'Deletes always need a preview and a confirmation from you in the AI chat.' ) }</small>
				</span>
			</label>

			<label className="mcp-check">
				<input type="checkbox" checked={ !! form.data_reads } onChange={ ( e ) => setForm( { ...form, data_reads: e.target.checked } ) } />
				<span>
					<strong>{ t( 'mcp-data-reads', 'Allow reading table data' ) }</strong>
					<small>{ t( 'mcp-data-reads-desc', 'Lets AI clients read the rows visitors can see, to answer questions or write summaries. Hidden rows, columns and cells are never shared.' ) }</small>
				</span>
			</label>

			<div className="mcp-actions">
				<button type="button" className="mcp-btn mcp-btn--primary" onClick={ save } disabled={ ! dirty || saving }>
					{ saving ? t( 'mcp-saving', 'Saving…' ) : t( 'mcp-save', 'Save changes' ) }
				</button>
			</div>
		</div>
	);
};

export default McpSecurity;
