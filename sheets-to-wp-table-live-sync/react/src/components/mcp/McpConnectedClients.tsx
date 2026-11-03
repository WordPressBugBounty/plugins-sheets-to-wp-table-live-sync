import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal, Skeleton } from './McpUi';
import { formatDate, mcpApi, t } from './api';

/**
 * Section 7: Connected clients (generated credentials) with revoke.
 */
const McpConnectedClients = ( { refreshKey, onChange }: { refreshKey: number; onChange: () => void } ) => {
	const [ items, setItems ] = useState< any[] >( [] );
	const [ profileUrl, setProfileUrl ] = useState( '' );
	const [ loading, setLoading ] = useState( true );
	const [ confirm, setConfirm ] = useState< any >( null );

	const load = () => {
		setLoading( true );
		mcpApi( 'connections' )
			.then( ( res ) => {
				setItems( res.connections || [] );
				setProfileUrl( res.profile_url || '' );
			} )
			.catch( ( e ) => toast.error( e.message ) )
			.finally( () => setLoading( false ) );
	};

	useEffect( load, [ refreshKey ] );

	const revoke = async () => {
		try {
			if ( 'all' === confirm ) {
				await mcpApi( 'connections/revoke-all', 'POST' );
				toast.success( t( 'mcp-revoked-all', 'All MCP credentials were revoked.' ) );
			} else {
				await mcpApi( 'connections/revoke', 'POST', { uuid: confirm.uuid } );
				toast.success( t( 'mcp-revoked', 'Credential revoked.' ) );
			}
			load();
			onChange();
		} catch ( e: any ) {
			toast.error( e.message );
		} finally {
			setConfirm( null );
		}
	};

	return (
		<div className="mcp-card">
			<div className="mcp-card__head">
				<div>
					<h4 className="mcp-card__title">{ t( 'mcp-clients', 'Connected clients' ) }</h4>
					<p className="mcp-muted">
						{ t( 'mcp-clients-desc', 'Credentials generated here. Revoking one disconnects that client on its next request. They also appear under' ) }{ ' ' }
						<a href={ profileUrl }>{ t( 'mcp-profile-link', 'Profile → Application Passwords' ) }</a>.
						{ ' ' }{ t( 'mcp-deactivate-note', 'Deactivating FlexTable revokes all of them.' ) }
					</p>
				</div>
				{ items.length > 0 && (
					<button type="button" className="mcp-btn mcp-btn--danger" onClick={ () => setConfirm( 'all' ) }>
						{ t( 'mcp-revoke-all', 'Revoke all' ) }
					</button>
				) }
			</div>

			{ loading && <Skeleton lines={ 3 } title={ false } /> }
			{ ! loading && 0 === items.length && <p className="mcp-empty">{ t( 'mcp-no-clients', 'No AI client is connected yet.' ) }</p> }

			{ ! loading && items.length > 0 && (
				<div className="mcp-table-wrap">
					<table className="mcp-table">
						<thead>
							<tr>
								<th>{ t( 'mcp-col-client', 'Client' ) }</th>
								<th>{ t( 'mcp-col-created', 'Created' ) }</th>
								<th>{ t( 'mcp-col-expires', 'Expires' ) }</th>
								<th>{ t( 'mcp-col-last-used', 'Last used' ) }</th>
								<th>{ t( 'mcp-col-last-ip', 'Last IP' ) }</th>
								<th aria-label={ t( 'mcp-col-actions', 'Actions' ) } />
							</tr>
						</thead>
						<tbody>
							{ items.map( ( item ) => (
								<tr key={ item.uuid }>
									<td data-label={ t( 'mcp-col-client', 'Client' ) }>
										<strong>{ item.client_label }</strong>
										<span className="mcp-small mcp-muted mcp-block">{ item.name }</span>
									</td>
									<td data-label={ t( 'mcp-col-created', 'Created' ) }>{ formatDate( item.created ) }</td>
									<td data-label={ t( 'mcp-col-expires', 'Expires' ) }>
										{ item.expired
											? <span className="mcp-pill mcp-pill--expired">{ t( 'mcp-expired', 'Expired' ) }</span>
											: item.expires ? formatDate( item.expires ) : t( 'mcp-expiry-never', 'Never' ) }
									</td>
									<td data-label={ t( 'mcp-col-last-used', 'Last used' ) }>{ formatDate( item.last_used ) }</td>
									<td data-label={ t( 'mcp-col-last-ip', 'Last IP' ) }>{ item.last_ip || '—' }</td>
									<td>
										<button type="button" className="mcp-btn mcp-btn--link-danger" onClick={ () => setConfirm( item ) }>
											{ t( 'mcp-revoke', 'Revoke' ) }
										</button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				</div>
			) }

			{ confirm && (
				<ConfirmModal
					title={ 'all' === confirm ? t( 'mcp-revoke-all-title', 'Revoke all MCP credentials?' ) : t( 'mcp-revoke-title', 'Revoke this credential?' ) }
					description={ 'all' === confirm ? t( 'mcp-revoke-all-desc', 'Every connected AI client stops working immediately. You can generate new prompts at any time.' ) : t( 'mcp-revoke-desc', 'The AI client stops working immediately. You can generate a new prompt at any time.' ) }
					onClose={ () => setConfirm( null ) }
					actions={ [
						{ label: t( 'mcp-cancel', 'Cancel' ), onClick: () => setConfirm( null ) },
						{ label: 'all' === confirm ? t( 'mcp-revoke-all', 'Revoke all' ) : t( 'mcp-revoke', 'Revoke' ), onClick: revoke, kind: 'confirm' },
					] }
				/>
			) }
		</div>
	);
};

export default McpConnectedClients;
