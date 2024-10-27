import React, { useState, useEffect, useRef } from 'react';
import Title from '../core/Title';
import { Link } from 'react-router-dom';
import {
	WhitePlusIcon,
	searchIcon,
	Cross,
	createTable,
	Unlock,
} from '../icons';
import TabsList from './TabsList';
import Modal from '../core/Modal';
// import Tooltip from './Tooltip';
import Tooltip from './TooltipTab';
import ChangesLog from './ChangesLog';

import { getStrings, getTabs, getNonce, isProActive } from './../Helpers';
import { infoIcon } from '../icons';

import './../styles/_manageTab.scss';
import '../styles/_header.scss';

const ManageTabs = () => {
	const createTableModalRef = useRef();
	const [ tabs, setTabs ] = useState( getTabs() || [] );
	const [ copiedTabs, setCopiedTabs ] = useState( [] );
	const [ tablesLength, setTablesLength ] = useState( 0 );
	const [ createTableModal, setCreateTableModal ] = useState( false );
	const [ searchKey, setSearchKey ] = useState( '' );
	const [ tabCount, setTabCount ] = useState( 0 );

	useEffect( () => {
		if ( isProActive() ) {
			wp.ajax.send( 'swptls_get_tabs', {
				data: {
					nonce: getNonce(),
				},
				success( response ) {
					setTabs( response.tabs );
					setCopiedTabs( response.tabs );
					setTablesLength( response.tables.length );
					setTabCount( response.tabs_count );
				},
				error( error ) {
					console.error( error );
				},
			} );
		} else {
			const handleClick = () => {
				WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
			};

			const proSettings = document.querySelectorAll(
				'.swptls-pro-settings, .btn-pro-lock'
			);
			proSettings.forEach( ( item ) => {
				item.addEventListener( 'click', handleClick );
			} );

			return () => {
				proSettings.forEach( ( item ) => {
					item.removeEventListener( 'click', handleClick );
				} );
			};
		}
	}, [] );

	const handleCreateTablePopup = ( e ) => {
		e.preventDefault();

		if ( isProActive() ) {
			setCreateTableModal( true );
		}
	};
	const handleClosePopup = () => {
		setCreateTableModal( false );
	};

	const handleMovetoDashboards = () => {
		// Remove the 'current' class from the "Manage Tab" li
		const manageTabLi = document.querySelector(
			'#toplevel_page_gswpts-dashboard li.current'
		);
		if ( manageTabLi ) {
			manageTabLi.classList.remove( 'current' );
		}

		// Add the 'current' class to the "Dashboard" li with the class "wp-first-item"
		const dashboardLi = document.querySelector(
			'#toplevel_page_gswpts-dashboard li.wp-first-item'
		);
		if ( dashboardLi ) {
			dashboardLi.classList.add( 'current' );
		}
	};

	// Reseting Tab
	useEffect( () => {
		const currentHash = window.location.hash;
		if ( ! currentHash.startsWith( '#/tabs/edit/' ) ) {
			localStorage.setItem( 'manage-tabs-active_tab', 'manage_tab' );

			localStorage.setItem( 'second_active_tab', 'layout' );
			localStorage.setItem( 'third_active_tab', 'columns' );

			localStorage.setItem( 'forth_active_tab', 'conditional_view' );
		}
	}, [ window.location.hash ] );

	/**
	 * Alert if clicked on outside of element
	 *
	 * @param  event
	 */
	function handleCancelOutside( event: MouseEvent ) {
		if (
			createTableModalRef.current &&
			! createTableModalRef.current.contains( event.target )
		) {
			handleClosePopup();
		}
	}

	useEffect( () => {
		document.addEventListener( 'mousedown', handleCancelOutside );
		return () => {
			document.removeEventListener( 'mousedown', handleCancelOutside );
		};
	}, [ handleCancelOutside ] );

	useEffect( () => {
		if ( searchKey !== '' ) {
			const filtered = copiedTabs.filter( ( { tab_name }: any ) =>
				tab_name
					.toLowerCase()
					.includes( searchKey.toString().toLowerCase() )
			);

			setTabs( filtered );
		} else {
			setTabs( copiedTabs );
		}
	}, [ searchKey ] );

	return (
		<div className={ `create-tabs-wrap` }>
			<header className="setting-header">
				<h5 className="setting-title">Manage Tab</h5>
				<div className="new-unlock-block">
					{ ! isProActive() && (
						<div className="unlock">
							<div className="icon">{ Unlock }</div>
							<p>
								<a
									className="get-ultimate"
									href="https://go.wppool.dev/KfVZ"
									target="_blank"
								>
									{ getStrings( 'get-unlimited-access' ) }
								</a>
							</p>
						</div>
					) }
					<ChangesLog />
				</div>
			</header>
			{ createTableModal && (
				<Modal>
					<div
						className="create-table-modal-wrap modal-content manage-modal-content"
						ref={ createTableModalRef }
					>
						<div
							className="cross_sign"
							onClick={ () => handleClosePopup() }
						>
							{ Cross }
						</div>
						<div className="create-table-modal">
							<div className="modal-media">{ createTable }</div>
							<h2>{ getStrings( 'CTF' ) }</h2>
							<p>
								{ getStrings( 'manage-tab-is-not-available' ) }
							</p>
							<Link
								to="/tables/create"
								className="create-table-popup-button btn"
								id="create-table-popup"
								onClick={ handleMovetoDashboards }
							>
								{ getStrings( 'create-table' ) }
							</Link>
						</div>
					</div>
				</Modal>
			) }

			<div
				className={ `table-header ${
					! isProActive() ? ` swptls-pro-settings` : ``
				}` }
			>
				<Title tagName="h4">
					<strong>{ tabCount }</strong>&nbsp;
					{ getStrings( 'tabs-created' ) }
				</Title>
				<div className="wrapper">
					<div className="table-search-box">
						<input
							type="text"
							placeholder="Search tabs"
							onChange={ ( e ) =>
								setSearchKey( e.target.value.trim() )
							}
						/>
						<div className="icon">{ searchIcon }</div>
					</div>

					<div className="btn-box">
						{ tablesLength < 1 ? (
							<button
								className={ `create-table btn btn-manage ${
									! isProActive()
										? ` swptls-pro-settings`
										: ``
								} ` }
								//<div className={`create-tabs-wrap${!isProActive() ? ` swptls-pro-settings` : ``}`}>
								onClick={ ( e ) => handleCreateTablePopup( e ) }
							>
								{ getStrings( 'manage-new-tabs' ) }{ ' ' }
								{ WhitePlusIcon }
							</button>
						) : (
							<Link
								className="create-table btn btn-manage"
								to="/tabs/create"
							>
								{ getStrings( 'manage-new-tabs' ) }{ ' ' }
								{ WhitePlusIcon }
							</Link>
						) }

						<Tooltip
							content={ `Display multiple tables using tabs. Just like your google sheets` }
						/>
						{ ! isProActive() && (
							<button className="btn-pro">
								{ getStrings( 'pro' ) }
							</button>
						) }
					</div>
				</div>
			</div>

			{ searchKey !== '' && tabs.length < 1 ? (
				// <h1>{getStrings('no-tabs-found')}`{searchKey}`</h1>

				<div className="manage-tab-search">
					<div className="not-found-table">
						<div className="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="53"
								height="52"
								viewBox="0 0 53 52"
								fill="none"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M42.4192 41.9193C43.2002 41.1382 44.4664 41.1382 45.2474 41.9193L51.9141 48.5859C52.6952 49.367 52.6952 50.6331 51.9141 51.4142C51.133 52.1953 49.8669 52.1953 49.0858 51.4142L42.4192 44.7475C41.6381 43.9665 41.6381 42.7003 42.4192 41.9193Z"
									fill="#DDE4E8"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M35 47C42.1797 47 48 41.1797 48 34C48 26.8203 42.1797 21 35 21C27.8203 21 22 26.8203 22 34C22 41.1797 27.8203 47 35 47ZM39.3333 35.3028C40.2308 35.3028 40.9583 34.7196 40.9583 34.0002C40.9583 33.2807 40.2308 32.6974 39.3333 32.6974H30.6667C29.7692 32.6974 29.0417 33.2807 29.0417 34.0002C29.0417 34.7196 29.7692 35.3028 30.6667 35.3028H39.3333Z"
									fill="#DDE4E8"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M0.5 12.6667C0.5 5.67107 6.17107 0 13.1667 0H39.8333C46.8291 0 52.5 5.67107 52.5 12.6667V17C52.5 18.1046 51.6045 19 50.5 19C49.3955 19 48.5 18.1046 48.5 17V12.6667C48.5 7.88019 44.6197 4 39.8333 4H13.1667C8.38019 4 4.5 7.88019 4.5 12.6667V39.3333C4.5 44.1197 8.38019 48 13.1667 48H17.5C18.6046 48 19.5 48.8955 19.5 50C19.5 51.1045 18.6046 52 17.5 52H13.1667C6.17107 52 0.5 46.3291 0.5 39.3333V12.6667Z"
									fill="#DDE4E8"
								/>
							</svg>
						</div>
						<div className="text">
							<h5 className="title">No tab group found!</h5>
							<p>No tab group matches to your search term</p>
						</div>
					</div>
				</div>
			) : (
				<TabsList
					tabs={ tabs }
					setTabs={ setTabs }
					setTabCount={ setTabCount }
				/>
			) }
		</div>
	);
};

export default ManageTabs;
