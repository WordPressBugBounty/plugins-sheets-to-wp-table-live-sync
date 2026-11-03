import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal } from './McpUi';
import { mcpApi, t } from './api';

type Props = {
	status: any;
	onChange: () => void;
};

const STATE_LABELS: Record< string, [ string, string ] > = {
	off: [ 'mcp-state-off', 'Off' ],
	needs_attention: [ 'mcp-state-attention', 'Needs attention' ],
	ready: [ 'mcp-state-ready', 'Ready' ],
	connected: [ 'mcp-state-connected', 'Connected' ],
};

/**
 * Section 1: Enable MCP with a status pill.
 */
const McpStatus = ( { status, onChange }: Props ) => {
	const [ saving, setSaving ] = useState( false );
	const [ confirmOff, setConfirmOff ] = useState( false );
	const enabled = !! status.settings.enabled;
	const label = STATE_LABELS[ status.state ] || STATE_LABELS.off;

	const save = async ( value: boolean, revokeAll = false ) => {
		setSaving( true );
		try {
			const res = await mcpApi( 'settings', 'POST', { enabled: value, revoke_all: revokeAll } );
			toast.success(
				value
					? t( 'mcp-enabled-toast', 'MCP is on. Connect an AI client below.' )
					: revokeAll
						? t( 'mcp-disabled-revoked-toast', 'MCP is off and all MCP credentials were revoked.' )
						: t( 'mcp-disabled-toast', 'MCP is off. AI clients can no longer connect.' )
			);
			if ( res && res.settings ) {
				onChange();
			}
		} catch ( e: any ) {
			toast.error( e.message );
		} finally {
			setSaving( false );
			setConfirmOff( false );
		}
	};

	const onToggle = () => {
		if ( enabled ) {
			setConfirmOff( true );
		} else {
			save( true );
		}
	};

	return (
		<div className="mcp-card mcp-card--hero">
			<div className="mcp-hero">
				<div className="mcp-hero__text">
					<div className="mcp-title-row">
						<h3 className="mcp-title">{ t( 'mcp-title', 'MCP: connect AI clients' ) }</h3>
						<span className={ `mcp-pill mcp-pill--${ status.state }` }>{ t( label[ 0 ], label[ 1 ] ) }</span>
					</div>
					<p className="mcp-muted">
						{ t( 'mcp-intro', 'Let AI assistants such as Claude, ChatGPT (Codex), Cursor and VS Code create, style and publish FlexTable tables from public Google Sheets, using your WordPress permissions. Nothing is shared until you turn MCP on and connect a client.' ) }
					</p>
				</div>
				<label className={ `mcp-switch ${ saving ? 'is-busy' : '' }` }>
					<input
						type="checkbox"
						checked={ enabled }
						onChange={ onToggle }
						disabled={ saving }
						aria-label={ t( 'mcp-enable', 'Enable MCP' ) }
					/>
					<span className="mcp-switch__track" />
					<span className="mcp-switch__label">{ t( 'mcp-enable', 'Enable MCP' ) }</span>
				</label>
			</div>
			{ ! enabled && (
				<p className="mcp-note">
					{ t( 'mcp-off-note', 'While MCP is off, the MCP endpoint answers "mcp_disabled" and no AI client can read or change any table.' ) }
				</p>
			) }

			{ confirmOff && (
				<ConfirmModal
					title={ t( 'mcp-disable-title', 'Turn off MCP?' ) }
					description={ t( 'mcp-disable-desc', 'Connected AI clients stop working immediately. You can keep their credentials (they work again when you turn MCP back on) or revoke them all.' ) }
					onClose={ () => setConfirmOff( false ) }
					busy={ saving }
					actions={ [
						{ label: t( 'mcp-disable-keep', 'Turn off, keep credentials' ), onClick: () => save( false, false ) },
						{ label: t( 'mcp-disable-revoke', 'Turn off and revoke all' ), onClick: () => save( false, true ), kind: 'confirm' },
					] }
				/>
			) }
		</div>
	);
};

export default McpStatus;
