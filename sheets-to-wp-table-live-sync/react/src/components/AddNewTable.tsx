import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
	getNonce,
	getTables,
	convertToSlug,
	getStrings,
	isProActive,
} from './../Helpers';
import { GrayPlusIcon } from '../icons';
import { toast } from 'react-toastify';

function AddNewTable() {
	const [ tableCount, setTableCount ] = useState( 0 );

	useEffect( () => {
		const handleClick = () => {
			WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
		};

		const proSettings = document.querySelectorAll( '.swptls-pro-lock' );
		proSettings.forEach( ( item ) => {
			item.addEventListener( 'click', handleClick );
		} );

		return () => {
			proSettings.forEach( ( item ) => {
				item.removeEventListener( 'click', handleClick );
			} );
		};
	}, [ tableCount ] );

	useEffect( () => {
		wp.ajax.send( 'swptls_get_tables', {
			data: {
				nonce: getNonce(),
			},
			success( response ) {
				setTableCount( response.tables_count );
			},
			error( error ) {
				console.error( error );
			},
		} );
	}, [] );

	const constructCreateTableUrl = () => {
		// Get the current full URL
		const currentUrl = window.location.href;
		// Get the base URL (before the hash)
		const baseUrl = currentUrl.split( '#' )[ 0 ];
		let newUrl = `${ baseUrl }`;
		newUrl += '#/tables/create';
		return newUrl;
	};

	const handleCreateTable = () => {
		const newUrl = constructCreateTableUrl();

		if ( isProActive() ) {
			window.location.href = newUrl;
		} else {
			if ( tableCount >= 10 ) {
				// alert("You can't create more than 10 tables.");
				toast.warning(
					<>
						{ getStrings( 'table-10-limited' ) }{ ' ' }
						<a target="blank" href="https://go.wppool.dev/DoC">
							{ ' ' }
							{ getStrings( 'upgrade-pro' ) }
						</a>
					</>
				);
			} else {
				window.location.href = newUrl;
			}
		}
	};

	return (
		<>
			{ tableCount < 10 ? (
				<Link
					to="/tables/create"
					className="add-new-table btn add-new-table-btn"
				>
					{ GrayPlusIcon }
					{ getStrings( 'add-new-table' ) }
				</Link>
			) : (
				// <button className="add-new-table btn add-new-table-btn" onClick={handleCreateTable}>
				<button
					className={ `add-new-table btn add-new-table-btn${
						! isProActive() ? ` swptls-pro-lock` : ``
					}` }
					onClick={ handleCreateTable }
				>
					{ GrayPlusIcon }
					{ getStrings( 'add-new-table' ) }
				</button>
			) }
		</>
	);
}

export default AddNewTable;
