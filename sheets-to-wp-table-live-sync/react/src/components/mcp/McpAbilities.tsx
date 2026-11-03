import React, { useEffect, useState } from 'react';
import { SkeletonCard } from './McpUi';
import { toast } from 'react-toastify';
import { mcpApi, t } from './api';

const kindOf = ( annotations: any ): [ string, string ] => {
	if ( annotations && annotations.readonly ) {
		return [ 'read', t( 'mcp-kind-read', 'Read-only' ) ];
	}
	if ( annotations && annotations.destructive ) {
		return [ 'destructive', t( 'mcp-kind-confirm', 'Needs confirmation' ) ];
	}
	return [ 'write', t( 'mcp-kind-write', 'Changes data' ) ];
};

/**
 * Section 5: Registered abilities (MCP tools).
 */
const McpAbilities = ( { refreshKey }: { refreshKey: number } ) => {
	const [ data, setData ] = useState< any >( null );
	const [ open, setOpen ] = useState< string >( '' );

	useEffect( () => {
		mcpApi( 'abilities' )
			.then( setData )
			.catch( ( e ) => toast.error( e.message ) );
	}, [ refreshKey ] );

	if ( ! data ) {
		return <SkeletonCard lines={ 6 } label={ t( 'mcp-loading', 'Loading…' ) } />;
	}

	return (
		<div className="mcp-card">
			<h4 className="mcp-card__title">{ t( 'mcp-abilities', 'Available tools' ) }</h4>
			<p className="mcp-muted">
				{ data.enabled
					? `${ data.flextable } ${ t( 'mcp-abilities-count', 'FlexTable abilities are registered on this site' ) } (${ data.total } ${ t( 'mcp-abilities-total', 'abilities in total' ) }). `
					: t( 'mcp-abilities-off', 'Abilities are registered when MCP is on. Reload this page after turning it on.' ) }
			</p>

			{ data.abilities.length > 0 && (
				<ul className="mcp-abilities">
					{ data.abilities.map( ( ability: any ) => {
						const kind = kindOf( ability.annotations );
						const isOpen = open === ability.name;
						return (
							<li key={ ability.name } className={ `mcp-ability ${ ability.available ? '' : 'is-unavailable' }` }>
								<button type="button" className="mcp-ability__head" onClick={ () => setOpen( isOpen ? '' : ability.name ) } aria-expanded={ isOpen }>
									<span className="mcp-ability__name">
										<code>{ ability.tool }</code>
										<span className="mcp-ability__label">{ ability.label }</span>
									</span>
									<span className="mcp-ability__badges">
										<span className={ `mcp-badge mcp-badge--${ ability.edition }` }>{ 'pro' === ability.edition ? 'Pro' : 'Free' }</span>
										<span className={ `mcp-badge mcp-badge--${ kind[ 0 ] }` }>{ kind[ 1 ] }</span>
										{ ! ability.available && (
											<span className="mcp-badge mcp-badge--off">
												{ t( 'mcp-turned-off', 'Turned off by policy' ) }
											</span>
										) }
									</span>
								</button>
								{ isOpen && (
									<div className="mcp-ability__body">
										<p>{ ability.description }</p>
										<p className="mcp-small mcp-muted">
											{ ability.name } · { ability.can_run ? t( 'mcp-you-can-run', 'You may run it' ) : t( 'mcp-you-cannot-run', 'Your account cannot run it' ) }
										</p>
										<pre className="mcp-prompt mcp-prompt--schema">{ JSON.stringify( ability.input_schema, null, 2 ) }</pre>
									</div>
								) }
							</li>
						);
					} ) }
				</ul>
			) }
		</div>
	);
};

export default McpAbilities;
