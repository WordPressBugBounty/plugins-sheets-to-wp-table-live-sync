import App from './components/App';
import { render } from '@wordpress/element';
import { HashRouter } from 'react-router-dom';

wp.element.render(
	<HashRouter>
		<App />
	</HashRouter>,
	document.getElementById( 'swptls-app-root' )
);
