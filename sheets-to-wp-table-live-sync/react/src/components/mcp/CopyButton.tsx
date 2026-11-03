import React, { useState } from 'react';
import { copyText, t } from './api';

type Props = {
	text: string;
	label?: string;
	className?: string;
	disabled?: boolean;
};

/**
 * Copy-to-clipboard button showing "Copied ✓" for a moment.
 */
const CopyButton = ( { text, label, className, disabled }: Props ) => {
	const [ copied, setCopied ] = useState( false );

	const onClick = async () => {
		if ( await copyText( text ) ) {
			setCopied( true );
			window.setTimeout( () => setCopied( false ), 2000 );
		}
	};

	return (
		<button
			type="button"
			className={ `mcp-btn mcp-btn--ghost ${ className || '' }` }
			onClick={ onClick }
			disabled={ disabled || ! text }
		>
			{ copied ? t( 'mcp-copied', 'Copied ✓' ) : label || t( 'mcp-copy', 'Copy' ) }
		</button>
	);
};

export default CopyButton;
