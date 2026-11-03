import React, { useCallback, useEffect, useState } from 'react';
import { Notice, SkeletonCard } from './McpUi';
import '../../styles/_mcp.scss';
import McpStatus from './McpStatus';
import McpConnector from './McpConnector';
import McpSecurity from './McpSecurity';
import McpSelfTest from './McpSelfTest';
import McpConnectClient from './McpConnectClient';
import McpConnectedClients from './McpConnectedClients';
import McpAbilities from './McpAbilities';
import McpActivity from './McpActivity';
import { mcpApi, t } from './api';

/**
 * Settings → MCP tab.
 */
const McpSettings = () => {
	const [ status, setStatus ] = useState< any >( null );
	const [ error, setError ] = useState( '' );
	const [ refreshKey, setRefreshKey ] = useState( 0 );

	const load = useCallback( () => {
		mcpApi( 'status' )
			.then( ( res ) => {
				setStatus( res );
				setError( '' );
			} )
			.catch( ( e ) => setError( e.message ) );
	}, [] );

	useEffect( load, [ load ] );

	const refresh = () => {
		load();
		setRefreshKey( ( key ) => key + 1 );
	};

	if ( error ) {
		return <div className="swptls-mcp"><Notice type="error">{ error }</Notice></div>;
	}

	if ( ! status ) {
		return (
			<div className="swptls-mcp" aria-busy="true">
				<SkeletonCard lines={ 2 } label={ t( 'mcp-loading', 'Loading…' ) } />
				<div className="mcp-grid">
					<SkeletonCard lines={ 3 } />
					<SkeletonCard lines={ 5 } />
				</div>
				<SkeletonCard lines={ 4 } />
			</div>
		);
	}

	const enabled = !! status.settings.enabled;

	return (
		<div className="swptls-mcp">
			<McpStatus status={ status } onChange={ refresh } />

			<div className="mcp-grid">
				<McpConnector status={ status } />
				{ enabled && <McpSecurity status={ status } onChange={ refresh } /> }
			</div>

			{ enabled && (
				<>
					<McpConnectClient status={ status } onGenerated={ () => setRefreshKey( ( key ) => key + 1 ) } />
					<McpConnectedClients refreshKey={ refreshKey } onChange={ load } />
					<McpSelfTest enabled={ enabled } />
					<McpAbilities refreshKey={ refreshKey } />
					<McpActivity refreshKey={ refreshKey } />
				</>
			) }
		</div>
	);
};

export default McpSettings;
