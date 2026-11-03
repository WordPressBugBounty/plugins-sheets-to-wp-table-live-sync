import React, { useEffect, useState } from 'react';
import { mcpApi, t } from './api';
import { SkeletonCard } from './McpUi';

/**
 * Recent MCP activity (audit log).
 */
const McpActivity = ( { refreshKey }: { refreshKey: number } ) => {
	const [ items, setItems ] = useState< any[] | null >( null );

	useEffect( () => {
		mcpApi( 'activity?limit=20' )
			.then( ( res ) => setItems( res.activity || [] ) )
			.catch( () => setItems( [] ) );
	}, [ refreshKey ] );

	if ( null === items ) {
		return <SkeletonCard lines={ 4 } label={ t( 'mcp-loading', 'Loading…' ) } />;
	}

	return (
		<div className="mcp-card">
			<h4 className="mcp-card__title">{ t( 'mcp-activity', 'Recent activity' ) }</h4>
			{ 0 === items.length ? (
				<p className="mcp-empty">{ t( 'mcp-no-activity', 'No MCP tool calls yet.' ) }</p>
			) : (
				<div className="mcp-table-wrap">
					<table className="mcp-table">
						<thead>
							<tr>
								<th>{ t( 'mcp-col-time', 'Time (UTC)' ) }</th>
								<th>{ t( 'mcp-col-client', 'Client' ) }</th>
								<th>{ t( 'mcp-col-tool', 'Tool' ) }</th>
								<th>{ t( 'mcp-col-result', 'Result' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ items.map( ( item ) => (
								<tr key={ item.id }>
									<td data-label={ t( 'mcp-col-time', 'Time (UTC)' ) }>{ item.time }</td>
									<td data-label={ t( 'mcp-col-client', 'Client' ) }>{ item.client || item.user }</td>
									<td data-label={ t( 'mcp-col-tool', 'Tool' ) }>
										<code>{ item.tool }</code>
										{ item.dry_run && <span className="mcp-badge mcp-badge--read">{ t( 'mcp-preview', 'Preview' ) }</span> }
									</td>
									<td data-label={ t( 'mcp-col-result', 'Result' ) }>
										<span className={ `mcp-badge ${ 'ok' === item.result ? 'mcp-badge--free' : 'mcp-badge--off' }` }>{ item.result }</span>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				</div>
			) }
		</div>
	);
};

export default McpActivity;
