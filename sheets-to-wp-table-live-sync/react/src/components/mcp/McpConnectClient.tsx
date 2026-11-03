import React, { useEffect, useState } from 'react';
import { Notice, Skeleton, Spinner } from './McpUi';
import { toast } from 'react-toastify';
import CopyButton from './CopyButton';
import { expiryLabel } from './McpSecurity';
import { mcpApi, t } from './api';

type Props = {
	status: any;
	onGenerated: () => void;
};

/**
 * Section 6: Connect an AI client (Generate prompt / Copy prompt).
 */
const McpConnectClient = ( { status, onGenerated }: Props ) => {
	const [ tabs, setTabs ] = useState< any[] >( [] );
	const [ verifiedOn, setVerifiedOn ] = useState( '' );
	const [ active, setActive ] = useState( 'claude-code' );
	const [ ack, setAck ] = useState( false );
	const [ expiry, setExpiry ] = useState< number >( status.settings.expiry_days );
	const [ publicUrl, setPublicUrl ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ generated, setGenerated ] = useState< any >( null );

	useEffect( () => {
		mcpApi( 'connect-prompts' )
			.then( ( res ) => {
				setTabs( res.tabs || [] );
				setVerifiedOn( res.verified_on || '' );
			} )
			.catch( ( e ) => toast.error( e.message ) );
	}, [] );

	useEffect( () => setExpiry( status.settings.expiry_days ), [ status.settings.expiry_days ] );

	const tab = tabs.find( ( item ) => item.client === active ) || tabs[ 0 ];
	const shown = generated && tab && generated.client === tab.client ? generated : null;
	const enabled = !! status.settings.enabled;

	const switchTab = ( client: string ) => {
		setActive( client );
		setAck( false );
	};

	const generate = async () => {
		if ( ! tab ) {
			return;
		}
		setBusy( true );
		try {
			const res = await mcpApi( 'connect/generate', 'POST', {
				client: tab.client,
				expiry_days: Number( expiry ),
				acknowledged: ack,
				public_url: 'claude-ai' === tab.client ? publicUrl : '',
			} );
			setGenerated( res );
			setAck( false );
			onGenerated();
			toast.success( t( 'mcp-generated', 'Credential created. Copy the prompt now: it is shown only once.' ) );
		} catch ( e: any ) {
			toast.error( e.message );
		} finally {
			setBusy( false );
		}
	};

	return (
		<div className="mcp-card">
			<h4 className="mcp-card__title">{ t( 'mcp-connect', 'Connect an AI client' ) }</h4>
			<p className="mcp-muted">
				{ t( 'mcp-connect-desc', 'Pick your client, then Generate prompt. You get a ready-to-paste prompt (or command) with a credential that works only on this MCP endpoint. Paste it into your AI assistant and it sets everything up.' ) }
			</p>

			<div className="mcp-tabs" role="tablist">
				{ tabs.map( ( item ) => (
					<button
						type="button"
						role="tab"
						aria-selected={ item.client === active }
						key={ item.client }
						className={ `mcp-tabs__tab ${ item.client === active ? 'is-active' : '' }` }
						onClick={ () => switchTab( item.client ) }
					>
						{ item.label }
					</button>
				) ) }
			</div>

			{ ! tab && <Skeleton lines={ 5 } title={ false } /> }

			{ tab && (
				<div className="mcp-connect">
					<div className="mcp-connect__side">
						<p className="mcp-connect__summary">{ tab.summary }</p>

						{ 'claude-ai' === tab.client && (
							<div className="mcp-field">
								<label htmlFor="mcp-public-url">{ t( 'mcp-public-url', 'Public HTTPS site URL (optional)' ) }</label>
								<input
									id="mcp-public-url"
									className="mcp-input"
									type="url"
									placeholder="https://staging.example.com"
									value={ publicUrl }
									onChange={ ( e ) => setPublicUrl( e.target.value ) }
								/>
								<small className="mcp-muted">{ t( 'mcp-public-url-desc', 'Use this when the site is reached through a tunnel or another public address.' ) }</small>
							</div>
						) }

						<div className="mcp-field">
							<label htmlFor="mcp-gen-expiry">{ t( 'mcp-expires-after', 'Credential expires after' ) }</label>
							<select id="mcp-gen-expiry" className="mcp-select" value={ expiry } onChange={ ( e ) => setExpiry( Number( e.target.value ) ) }>
								{ ( status.expiry_choices || [ 30, 90, 365, 0 ] ).map( ( d: number ) => (
									<option key={ d } value={ d }>{ expiryLabel( d ) }</option>
								) ) }
							</select>
						</div>

						<label className="mcp-check">
							<input type="checkbox" checked={ ack } onChange={ ( e ) => setAck( e.target.checked ) } disabled={ ! enabled } />
							<span>
								<small>
									{ t( 'mcp-ack-1', 'I understand that Generate prompt creates an Application Password for' ) } <strong>{ status.username }</strong> { t( 'mcp-ack-2', 'that lets' ) } <strong>{ tab.label }</strong> { t( 'mcp-ack-3', 'use FlexTable tools as me.' ) }
								</small>
							</span>
						</label>

						<div className="mcp-actions mcp-actions--stack">
							<button
								type="button"
								className="mcp-btn mcp-btn--primary"
								onClick={ generate }
								disabled={ ! enabled || ! ack || busy || ! status.app_passwords_available }
							>
								{ busy ? <><Spinner /> { t( 'mcp-generating', 'Generating…' ) }</> : t( 'mcp-generate', 'Generate prompt' ) }
							</button>
							<CopyButton text={ shown ? shown.prompt : tab.template } label={ t( 'mcp-copy-prompt', 'Copy prompt' ) } />
							{ shown && <CopyButton text={ shown.header } label={ t( 'mcp-copy-header', 'Copy header value' ) } /> }
						</div>

						{ ! enabled && <p className="mcp-note">{ t( 'mcp-generate-off', 'Turn on MCP to generate a credential.' ) }</p> }
						{ verifiedOn && <p className="mcp-muted mcp-small">{ t( 'mcp-verified-on', 'Instructions checked on' ) } { verifiedOn }</p> }
					</div>

					<div className="mcp-connect__prompt">
						{ shown && (
							<Notice type="warn" className="mcp-once">
								{ t( 'mcp-shown-once', 'Shown once. This prompt contains a working credential. Copy it now and treat it like a password: do not paste it into shared chats, tickets or screenshots.' ) }
							</Notice>
						) }
						<pre className={ `mcp-prompt ${ shown ? 'is-generated' : '' }` } tabIndex={ 0 }>
							{ shown ? shown.prompt : tab.template }
						</pre>
					</div>
				</div>
			) }
		</div>
	);
};

export default McpConnectClient;
