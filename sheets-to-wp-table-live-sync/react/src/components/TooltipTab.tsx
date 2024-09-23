import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { infoIconWithQuestionMark } from '../icons';

const Tooltip = ( { content } ) => {
	// const randomId = Math.floor(Math.random() * (1 - 1000 + 1)) + 1;
	const randomId = `app-help-${ Date.now() }-${ Math.floor(
		Math.random() * 1000
	) }`;

	return (
		<>
			<ReactTooltip
				className="swptls-react-tooltip"
				anchorId={ `app-help-${ randomId }` }
				content={ content }
				style={ {
					maxWidth: '300px',
					lineHeight: '1.3',
					whiteSpace: 'initial',
					textAlign: 'center',
					zIndex: '999',
				} }
			/>
			<div className="swptls-tooltip" id={ `app-help-${ randomId }` }>
				{ infoIconWithQuestionMark }
			</div>
		</>
	);
};

export default Tooltip;
