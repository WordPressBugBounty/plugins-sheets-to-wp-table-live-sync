import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { infoIconWithQuestionMark } from '../icons';

const Tooltip = ( { content } ) => {
	const randomId = `app-help-${ Date.now() }-${ Math.floor(
		Math.random() * 1000
	) }`;

	return (
		<>
			<ReactTooltip
				className="swptls-react-tooltip"
				anchorId={ `app-help-${ randomId }` }
				content={ content }
				clickable
				// style={{ maxWidth: '500px', lineHeight: '1.5', wordBreak: 'break-word' }}
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
