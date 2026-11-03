import React from 'react';
import { Notice } from './McpUi';
import CopyButton from './CopyButton';
import { t } from './api';

type Props = {
	status: any;
};

/**
 * Section 2: Connector URL and reachability notes.
 */
const McpConnector = ( { status }: Props ) => (
	<div className="mcp-card">
		<h4 className="mcp-card__title">{ t( 'mcp-connector-url', 'Connector URL' ) }</h4>
		<p className="mcp-muted">{ t( 'mcp-connector-url-desc', 'Paste this exact URL into your AI client. Do not add a trailing slash.' ) }</p>
		<div className="mcp-input-row">
			<input className="mcp-input mcp-input--mono" type="text" readOnly value={ status.connector_url } onFocus={ ( e ) => e.target.select() } />
			<CopyButton text={ status.connector_url } label={ t( 'mcp-copy-url', 'Copy URL' ) } />
		</div>
		<div className="mcp-hints">
			{ status.local_site && (
				<Notice type="warn">
					{ t( 'mcp-local-warning', 'This is a local or private address. Cloud connectors (Claude.ai, ChatGPT) cannot reach it. Claude Code, Claude Desktop, Codex, Cursor and VS Code on this computer can. For cloud connectors use a public HTTPS site or a tunnel.' ) }
				</Notice>
			) }
			{ ! status.https && ! status.local_site && (
				<Notice type="error">{ t( 'mcp-https-warning', 'This site does not use HTTPS. AI clients and Application Passwords require HTTPS.' ) }</Notice>
			) }
			{ status.scheme_mismatch && (
				<Notice type="warn">{ t( 'mcp-scheme-warning', 'The WordPress Address and Site Address use different schemes (http/https). Use HTTPS for both.' ) }</Notice>
			) }
		</div>
	</div>
);

export default McpConnector;
