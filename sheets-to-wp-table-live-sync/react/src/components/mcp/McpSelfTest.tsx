import React, { useState } from 'react';
import { Spinner } from './McpUi';
import { toast } from 'react-toastify';
import { mcpApi, t } from './api';

const ICONS: Record< string, string > = {
	pass: '✓',
	warn: '!',
	fail: '✕',
	info: 'i',
};

/**
 * Section 4: Connection test.
 */
const McpSelfTest = ( { enabled }: { enabled: boolean } ) => {
	const [ running, setRunning ] = useState( false );
	const [ result, setResult ] = useState< any >( null );

	const run = async () => {
		setRunning( true );
		try {
			setResult( await mcpApi( 'self-test', 'POST' ) );
		} catch ( e: any ) {
			toast.error( e.message );
		} finally {
			setRunning( false );
		}
	};

	return (
		<div className="mcp-card">
			<div className="mcp-card__head">
				<div>
					<h4 className="mcp-card__title">{ t( 'mcp-test', 'Connection test' ) }</h4>
					<p className="mcp-muted">{ t( 'mcp-test-desc', 'Checks the MCP endpoint from this server: HTTPS, the MCP handshake, tool discovery, that requests without a credential are refused, and that nothing is changed. No credential is created or shown.' ) }</p>
				</div>
				<button type="button" className="mcp-btn mcp-btn--primary" onClick={ run } disabled={ running }>
					{ running ? <><Spinner /> { t( 'mcp-testing', 'Testing…' ) }</> : t( 'mcp-run-test', 'Run connection test' ) }
				</button>
			</div>

			{ ! enabled && ! result && <p className="mcp-note">{ t( 'mcp-test-off', 'Turn on MCP to run all checks.' ) }</p> }

			{ result && (
				<>
					<div className={ `mcp-result-banner ${ result.ok ? 'is-ok' : 'is-fail' }` }>
						{ result.ok ? t( 'mcp-test-ok', 'All required checks passed.' ) : t( 'mcp-test-fail', 'Some checks failed. See the fixes below.' ) }
					</div>
					<ul className="mcp-checklist">
						{ result.rows.map( ( row: any ) => (
							<li key={ row.id } className={ `mcp-checklist__item is-${ row.status }` }>
								<span className="mcp-checklist__icon" aria-hidden="true">{ ICONS[ row.status ] }</span>
								<div>
									<strong>{ row.label }</strong>
									{ row.detail && <span className="mcp-checklist__detail">{ row.detail }</span> }
									{ row.remedy && <span className="mcp-checklist__remedy">{ row.remedy }</span> }
								</div>
							</li>
						) ) }
					</ul>
					<p className="mcp-muted mcp-small">{ result.note }</p>
				</>
			) }
		</div>
	);
};

export default McpSelfTest;
