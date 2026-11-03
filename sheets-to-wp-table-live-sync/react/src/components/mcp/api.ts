import { getStrings } from '../../Helpers';

type McpConfig = {
	enabled?: boolean;
	rest_base?: string;
	rest_nonce?: string;
	connector_url?: string;
	username?: string;
};

export const mcpConfig = (): McpConfig =>
	( ( window as any ).GSWPTS_APP && ( window as any ).GSWPTS_APP.mcp ) || {};

/**
 * Translated UI string with an English fallback.
 */
export const t = ( key: string, fallback: string ): string => {
	const value = getStrings( key );
	return value ? value : fallback;
};

/**
 * Calls the MCP admin REST API (flextable-mcp/v1/admin/*).
 */
export async function mcpApi( path: string, method = 'GET', body?: any ): Promise< any > {
	const config = mcpConfig();
	const base = config.rest_base || '';
	const url = base.indexOf( '?' ) !== -1 && path.indexOf( '?' ) !== -1
		? base + path.replace( '?', '&' )
		: base + path;

	const response = await fetch( url, {
		method,
		credentials: 'same-origin',
		cache: 'no-store',
		headers: {
			'X-WP-Nonce': config.rest_nonce || '',
			'Content-Type': 'application/json',
		},
		body: body ? JSON.stringify( body ) : undefined,
	} );

	let data: any = {};
	try {
		data = await response.json();
	} catch ( e ) {
		data = {};
	}

	if ( ! response.ok ) {
		const error: any = new Error( ( data && data.message ) || t( 'mcp-request-failed', 'The request failed.' ) );
		error.code = data && data.code;
		throw error;
	}

	return data;
}

/**
 * Copies text to the clipboard.
 */
export async function copyText( text: string ): Promise< boolean > {
	try {
		if ( navigator.clipboard && window.isSecureContext ) {
			await navigator.clipboard.writeText( text );
			return true;
		}
	} catch ( e ) {
		// Fall back below.
	}

	const area = document.createElement( 'textarea' );
	area.value = text;
	area.setAttribute( 'readonly', '' );
	area.style.position = 'fixed';
	area.style.top = '-1000px';
	document.body.appendChild( area );
	area.select();
	let ok = false;
	try {
		ok = document.execCommand( 'copy' );
	} catch ( e ) {
		ok = false;
	}
	document.body.removeChild( area );
	return ok;
}

/**
 * Formats a Unix timestamp for display.
 */
export const formatDate = ( timestamp?: number | null ): string => {
	if ( ! timestamp ) {
		return '—';
	}
	return new Date( timestamp * 1000 ).toLocaleString();
};
