import React, { useState, useEffect, useRef } from 'react';
import { hintIcon, Cross } from '../icons';
import { isProActive, getStrings } from '../Helpers';
import Tooltip from './Tooltip';
import ThemeFields from './ThemeFields';

const RowSettings = ( {
	tableSettings,
	setTableSettings,
	setPreviewClasses,
	setPreviewModeClasses,
	hidingContext,
	setHidingContext,
	thirdActiveTabs,
	updateThirdActiveTab,
} ) => {
	const [ importModal, setImportModal ] = useState< boolean >( false );
	const [ sameAsDesktop, setSameAsDesktop ] = useState< boolean >( false );
	const [ sameAsDesktopRows, setSameAsDesktopRows ] =
		useState< boolean >( false );
	const [ sameAsDesktopCells, setSameAsDesktopCells ] =
		useState< boolean >( false );

	const confirmImportRef = useRef();

	useEffect( () => {
		// Update the active tab based on the prop value
		setThirdActiveTab( thirdActiveTabs );
		handleThirdSetActiveTab( thirdActiveTabs );
		localStorage.setItem( 'third_active_tab', thirdActiveTabs );

		// Update the thirdActiveTab in the parent component
		updateThirdActiveTab( thirdActiveTabs );
	}, [ thirdActiveTabs ] );

	const [ thirdActiveTab, setThirdActiveTab ] = useState< string >(
		localStorage.getItem( 'third_active_tab' ) || 'columns'
	);
	const [ screenTab, setScreenTab ] = useState< string >(
		localStorage.getItem( 'screen_media' ) || 'desktop'
	);

	const handleThirdSetActiveTab = ( key: React.SetStateAction< string > ) => {
		setThirdActiveTab( key );
		setHidingContext( key );
		localStorage.setItem( 'third_active_tab', key );

		// Update the thirdActiveTab in the parent component
		updateThirdActiveTab( key );
	};

	// Load values from localStorage on component mount same as desktop mode
	useEffect( () => {
		const sameAsDesktopValue = localStorage.getItem( 'sameAsDesktop' );
		if ( sameAsDesktopValue !== null ) {
			setSameAsDesktop( JSON.parse( sameAsDesktopValue ) );
		}

		const sameAsDesktopRowsValue =
			localStorage.getItem( 'sameAsDesktopRows' );
		if ( sameAsDesktopRowsValue !== null ) {
			setSameAsDesktopRows( JSON.parse( sameAsDesktopRowsValue ) );
		}

		const sameAsDesktopCellsValue =
			localStorage.getItem( 'sameAsDesktopCells' );
		if ( sameAsDesktopCellsValue !== null ) {
			setSameAsDesktopCells( JSON.parse( sameAsDesktopCellsValue ) );
		}
	}, [] );

	const handleScreenActiveTab = ( key: React.SetStateAction< string > ) => {
		setScreenTab( key );
		localStorage.setItem( 'screen_media', key );
	};

	useEffect( () => {
		// Screen divide
		switch ( hidingContext ) {
			case 'columns':
				setPreviewClasses( 'mode-hide-columns' );
				break;
			case 'rows':
				setPreviewClasses( 'mode-hide-rows' );
				break;
			case 'cells':
				setPreviewClasses( 'mode-hide-cells' );
				break;
		}

		// For screen mode like desktop or mobile wise added
		if ( screenTab === 'desktop' ) {
			switch ( hidingContext ) {
				case 'columns':
					setPreviewModeClasses( 'columns-desktop' );
					break;
				case 'rows':
					setPreviewModeClasses( 'rows-desktop' );
					break;
				case 'cells':
					setPreviewModeClasses( 'cells-desktop' );
					break;
			}
		} else {
			switch ( hidingContext ) {
				case 'columns':
					setPreviewModeClasses( 'columns-mobile' );
					break;
				case 'rows':
					setPreviewModeClasses( 'rows-mobile' );
					break;
				case 'cells':
					setPreviewModeClasses( 'cells-mobile' );
					break;
			}
		}

		// For auto mode

		if ( sameAsDesktop === true ) {
			switch ( hidingContext ) {
				case 'columns':
					setPreviewModeClasses( 'auto-columns-mode' );
					break;
			}
		}
		if ( sameAsDesktopRows === true ) {
			switch ( hidingContext ) {
				case 'rows':
					setPreviewModeClasses( 'auto-rows-mode' );
					break;
			}
		}
		if ( sameAsDesktopCells === true ) {
			switch ( hidingContext ) {
				case 'cells':
					setPreviewModeClasses( 'auto-cells-mode' );
					break;
			}
		}
	}, [
		hidingContext,
		screenTab,
		sameAsDesktop,
		sameAsDesktopRows,
		sameAsDesktopCells,
	] );

	useEffect( () => {
		const handleClick = () => {
			WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
		};

		const proSettings = document.querySelectorAll( '.swptls-pro-settings' );
		proSettings.forEach( ( item ) => {
			item.addEventListener( 'click', handleClick );
		} );

		return () => {
			proSettings.forEach( ( item ) => {
				item.removeEventListener( 'click', handleClick );
			} );
		};
	}, [ thirdActiveTab ] );

	// Column For Desktop -----------------------------------------------------
	const handleRemoveColumnOnDesktop = ( value ) => {
		const newColumns = tableSettings?.table_settings?.hide_column.filter(
			( item ) => item !== value
		);
		const table = window?.swptlsDataTable?.table().node();

		const cells = table.querySelectorAll( `td:nth-child(${ value + 1 })` );

		cells.forEach( ( cell ) => {
			cell.classList.remove( 'hidden-column' );
		} );

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				hide_column: newColumns,
			},
		} );

		// Update table_settings for mobile if sameAsDesktop is true means delete what deleted from desktop mode
		if ( sameAsDesktop ) {
			setTableSettings( ( prevSettings ) => ( {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					hide_column_mobile: newColumns,
				},
			} ) );
		}
	};

	//Column For Mobile
	const handleRemoveColumnOnMobile = ( value ) => {
		const newColumns =
			tableSettings?.table_settings?.hide_column_mobile.filter(
				( item ) => item !== value
			);
		const table = window?.swptlsDataTable?.table().node();

		const cells = table.querySelectorAll( `td:nth-child(${ value + 1 })` );

		cells.forEach( ( cell ) => {
			cell.classList.remove( 'hidden-column-mobile' );
		} );

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				hide_column_mobile: newColumns,
			},
		} );
	};

	// Row For Desktop ---------------------------------------------------------
	const handleRemoveRowDesktop = ( value ) => {
		const newRows = tableSettings?.table_settings?.hide_rows.filter(
			( item ) => item !== value
		);

		const currentRow = document.querySelector( `.row_${ value }` );
		currentRow?.classList.remove( 'hidden-row' );

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				hide_rows: newRows,
			},
		} );

		// Update table_settings for mobile if sameAsDesktoprows is true means delete what deleted from desktop mode
		if ( sameAsDesktopRows ) {
			setTableSettings( ( prevSettings ) => ( {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					hide_rows_mobile: newRows,
				},
			} ) );
		}
	};

	// Row For Mobile
	const handleRemoveRowMobile = ( value ) => {
		const newRows = tableSettings?.table_settings?.hide_rows_mobile.filter(
			( item ) => item !== value
		);

		const currentRow = document.querySelector( `.row_${ value }` );
		currentRow?.classList.remove( 'hidden-row-mobile' );

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				hide_rows_mobile: newRows,
			},
		} );
	};

	// Cell For Desktop ---------------------------------------------------------
	const handleCloseCellsDesktop = ( value ) => {
		const newCells = tableSettings?.table_settings?.hide_cell.filter(
			( item ) => item !== value
		);

		const indices = JSON.parse( value );
		const selector = `.cell_index_${ indices[ 0 ] }-${ indices[ 1 ] }`;
		const cell = document.querySelector( selector );
		cell?.classList.remove( 'hidden-cell' );

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				hide_cell: newCells,
			},
		} );

		// Update table_settings for mobile if sameAsDesktopCells is true means delete what deleted from desktop mode
		if ( sameAsDesktopCells ) {
			setTableSettings( ( prevSettings ) => ( {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					hide_cell_mobile: newCells,
				},
			} ) );
		}
	};
	// Cells For Mobile
	const handleCloseCellsMobile = ( value ) => {
		const newCells = tableSettings?.table_settings?.hide_cell_mobile.filter(
			( item ) => item !== value
		);

		const indices = JSON.parse( value );
		const selector = `.cell_index_${ indices[ 0 ] }-${ indices[ 1 ] }`;
		const cell = document.querySelector( selector );
		cell?.classList.remove( 'hidden-cell-mobile' );

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				hide_cell_mobile: newCells,
			},
		} );
	};

	// END

	// Handler function for "Same as desktop" checkbox
	const handleSameAsDesktopChange = ( e ) => {
		const { checked } = e.target;
		setSameAsDesktop( checked );

		localStorage.setItem( 'sameAsDesktop', JSON.stringify( checked ) );

		if ( checked ) {
			// If "Same as desktop" is checked, synchronize hidden columns from desktop to mobile
			setTableSettings( {
				...tableSettings,
				table_settings: {
					...tableSettings.table_settings,
					hide_column_mobile: [
						...tableSettings.table_settings.hide_column,
					],
				},
			} );
		}
	};

	// Handler function for "Same as desktop" checkbox for rows
	const handleSameAsDesktopRowsChange = ( e ) => {
		const { checked } = e.target;
		setSameAsDesktopRows( checked );

		localStorage.setItem( 'sameAsDesktopRows', JSON.stringify( checked ) );

		if ( checked ) {
			// If "Same as desktop" is checked, synchronize hidden rows from desktop to mobile
			setTableSettings( {
				...tableSettings,
				table_settings: {
					...tableSettings.table_settings,
					hide_rows_mobile: [
						...tableSettings.table_settings.hide_rows,
					],
				},
			} );
		}
	};

	// Handler function for "Same as desktop" checkbox for cells
	const handleSameAsDesktopCellsChange = ( e ) => {
		const { checked } = e.target;
		setSameAsDesktopCells( checked );

		localStorage.setItem( 'sameAsDesktopCells', JSON.stringify( checked ) );

		if ( checked ) {
			// If "Same as desktop" is checked, synchronize hidden cells from desktop to mobile
			setTableSettings( {
				...tableSettings,
				table_settings: {
					...tableSettings.table_settings,
					hide_cell_mobile: [
						...tableSettings.table_settings.hide_cell,
					],
				},
			} );
		}
	};

	// Modal
	// Modal for Pro
	const handleClosePopup = () => {
		setImportModal( false );
	};

	function handleCancelOutside( event: MouseEvent ) {
		if (
			confirmImportRef.current &&
			! confirmImportRef.current.contains( event.target )
		) {
			handleClosePopup();
		}
	}

	useEffect( () => {
		const handleClick = () => {
			WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
		};
		document.addEventListener( 'mousedown', handleCancelOutside );

		const proSettings = document.querySelectorAll(
			'.swptls-pro-settings, .btn-pro-lock'
		);
		proSettings.forEach( ( item ) => {
			item.addEventListener( 'click', handleClick );
		} );

		return () => {
			document.removeEventListener( 'mousedown', handleCancelOutside );
			proSettings.forEach( ( item ) => {
				item.removeEventListener( 'click', handleClick );
			} );
		};
	}, [ handleCancelOutside ] );

	return (
		<div>
			<div className="edit-row-settings-wrap">
				<div className="edit-form-group">
					{ /* Render Theme style for hidden values  */ }
					<div className="edit-form-group themeFields">
						<ThemeFields tableSettings={ tableSettings } />
					</div>

					<div className="hide-table-elements-tab-wrap">
						<div className="hide-table-elements-tab-nav">
							<button
								className={ `${
									thirdActiveTab === 'columns' ? 'active' : ''
								} ` }
								onClick={ () =>
									handleThirdSetActiveTab( 'columns' )
								}
							>
								{ getStrings( 'hide-column' ) }
							</button>
							<button
								className={ `${
									thirdActiveTab === 'rows' ? 'active' : ''
								} ` }
								onClick={ () =>
									handleThirdSetActiveTab( 'rows' )
								}
							>
								{ getStrings( 'hide-row' ) }
							</button>
							<button
								className={ `${
									thirdActiveTab === 'cells' ? 'active' : ''
								} ` }
								onClick={ () =>
									handleThirdSetActiveTab( 'cells' )
								}
							>
								{ getStrings( 'hide-cell' ) }
							</button>
						</div>
						<div className="hide-table-elements-tab-content">
							{ 'columns' === thirdActiveTab && (
								<div className={ `hide-columns-tab-content` }>
									<div className="navbar-screen-nav">
										<button
											className={ `${
												screenTab === 'desktop'
													? 'active'
													: ''
											} ` }
											onClick={ () =>
												handleScreenActiveTab(
													'desktop'
												)
											}
										>
											<span className="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="16"
													viewBox="0 0 24 16"
													fill="none"
												>
													<path
														d="M20 14C21.1 14 22 13.1 22 12V2C22 0.9 21.1 0 20 0H4C2.9 0 2 0.9 2 2V12C2 13.1 2.9 14 4 14H1C0.45 14 0 14.45 0 15C0 15.55 0.45 16 1 16H23C23.55 16 24 15.55 24 15C24 14.45 23.55 14 23 14H20ZM5 2H19C19.55 2 20 2.45 20 3V11C20 11.55 19.55 12 19 12H5C4.45 12 4 11.55 4 11V3C4 2.45 4.45 2 5 2Z"
														fill="#1F2937"
													/>
												</svg>
											</span>
											<span>Desktop</span>
										</button>
										<button
											className={ `${
												screenTab === 'mobile'
													? 'active'
													: ''
											} ` }
											onClick={ () =>
												handleScreenActiveTab(
													'mobile'
												)
											}
										>
											<span className="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="20"
													viewBox="0 0 12 20"
													fill="none"
												>
													<path
														d="M10.004 0H1.996C1.46663 0 0.958937 0.210292 0.584615 0.584615C0.210292 0.958938 0 1.46663 0 1.996V18.003C0 19.106 0.894 20 1.996 20H10.003C10.5325 20 11.0403 19.7897 11.4147 19.4154C11.7892 19.0412 11.9997 18.5335 12 18.004V1.996C12 1.46663 11.7897 0.958938 11.4154 0.584615C11.0411 0.210292 10.5334 0 10.004 0ZM6 19C5.31 19 4.75 18.553 4.75 18C4.75 17.447 5.31 17 6 17C6.69 17 7.25 17.447 7.25 18C7.25 18.553 6.69 19 6 19ZM10 16H2V2H10V16Z"
														fill="#1F2937"
													/>
												</svg>
											</span>
											<span>Mobile</span>
										</button>
									</div>
									<div className="screen-tab-content">
										{ 'desktop' === screenTab && (
											<div className="screen-tab-content__desktop">
												<div
													className={ `screen-desktop-and-mobile ${
														tableSettings
															?.table_settings
															?.hide_on_desktop_col
															? ''
															: 'disable'
													} ` }
												>
													<h4>
														<span>
															{ hintIcon }
														</span>{ ' ' }
														{ getStrings(
															'click-on-the-col'
														) }
													</h4>
													<div
														className={ `hidden-columns${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
													>
														<label
															htmlFor="hidden-columns"
															className={ `hidden-columns-label` }
														>
															<span
																className={ `${
																	! isProActive()
																		? ` swptls-pro-settings`
																		: ``
																}` }
															>
																{ getStrings(
																	'hidden-column'
																) }{ ' ' }
															</span>

															<span>
																<Tooltip
																	content={ `This is the list of the hidden columns. Removing a column from this list will make them visible again` }
																/>
																{ ! isProActive() && (
																	<button className="btn-pro">
																		{ getStrings(
																			'pro'
																		) }
																	</button>
																) }
															</span>
														</label>

														<ul
															className={ `hidden-columns-list${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ tableSettings
																?.table_settings
																?.hide_column &&
																tableSettings?.table_settings?.hide_column.map(
																	(
																		value:
																			| string
																			| number,
																		index: any
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			{ ' ' }
																			{ `Col #${
																				Number(
																					value
																				) +
																				1
																			}` }{ ' ' }
																			<span
																				className="cross_sign"
																				onClick={ () =>
																					handleRemoveColumnOnDesktop(
																						value
																					)
																				}
																			>
																				{
																					Cross
																				}
																			</span>
																		</li>
																	)
																) }
														</ul>
													</div>
												</div>
												<div className="input-checkbox">
													{ /* Column Hide in desktop */ }
													<input
														type="checkbox"
														name="hide_on_desktop_col"
														id="hide-on-desktop"
														defaultChecked={ true } // aded by me forcefully it checked
														checked={
															tableSettings
																.table_settings
																?.hide_on_desktop_col
														}
														onChange={ ( e ) =>
															setTableSettings( {
																...tableSettings,
																table_settings:
																	{
																		...tableSettings.table_settings,
																		hide_on_desktop_col:
																			e
																				.target
																				.checked,
																	},
															} )
														}
														disabled={
															! isProActive()
														}
													/>
													<label
														className={ `${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
														htmlFor="hide-on-desktop"
													>
														Hide columns on desktop
														<span className="tooltip-hide-on">
															<Tooltip
																content={ `Enable this to hide the selected column on desktop` }
															/>
															{ ! isProActive() && (
																<button className="btn-pro">
																	{ getStrings(
																		'pro'
																	) }
																</button>
															) }
														</span>
													</label>
												</div>
											</div>
										) }
										{ 'mobile' === screenTab && (
											<div className="screen-tab-content__desktop">
												<div className="switch-toggle">
													<input
														type="checkbox"
														name="same_as_desktop"
														id="same-as-desktop"
														checked={
															sameAsDesktop
														}
														onChange={
															handleSameAsDesktopChange
														}
													/>

													<label htmlFor="same-as-desktop">
														Same as desktop
													</label>
												</div>

												<div
													className={ `screen-desktop-and-mobile ${
														tableSettings
															?.table_settings
															?.hide_on_mobile_col
															? ''
															: 'disable'
													} ${
														sameAsDesktop === true
															? 'screen-disable'
															: ''
													}` }
												>
													<h4>
														<span>
															{ hintIcon }
														</span>{ ' ' }
														{ getStrings(
															'click-on-the-col'
														) }
													</h4>

													<div
														className={ `hidden-columns${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														} ${
															sameAsDesktop ===
															true
																? 'screen-pointer-none'
																: ''
														}` }
													>
														<label
															htmlFor="hidden-columns"
															className={ `hidden-columns-label` }
														>
															<span
																className={ `${
																	! isProActive()
																		? ` swptls-pro-settings`
																		: ``
																}` }
															>
																{ getStrings(
																	'hidden-column-mob'
																) }{ ' ' }
															</span>

															<span>
																<Tooltip
																	content={ `This is the list of the hidden columns for mobile. Removing a column from this list will make them visible again` }
																/>
																{ ! isProActive() && (
																	<button className="btn-pro">
																		{ getStrings(
																			'pro'
																		) }
																	</button>
																) }
															</span>
														</label>

														<ul
															className={ `hidden-columns-list${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ tableSettings
																?.table_settings
																?.hide_column_mobile &&
																tableSettings?.table_settings?.hide_column_mobile.map(
																	(
																		value:
																			| string
																			| number,
																		index: any
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			{ ' ' }
																			{ `Col #${
																				Number(
																					value
																				) +
																				1
																			}` }{ ' ' }
																			<span
																				className="cross_sign"
																				onClick={ () =>
																					handleRemoveColumnOnMobile(
																						value
																					)
																				}
																			>
																				{
																					Cross
																				}
																			</span>
																		</li>
																	)
																) }
														</ul>
													</div>
												</div>
												<div className="input-checkbox">
													<input
														type="checkbox"
														name="hide_on_mobile_col"
														id="hide-on-mobile"
														checked={
															tableSettings
																.table_settings
																?.hide_on_mobile_col
														}
														onChange={ ( e ) =>
															setTableSettings( {
																...tableSettings,
																table_settings:
																	{
																		...tableSettings.table_settings,
																		hide_on_mobile_col:
																			e
																				.target
																				.checked,
																	},
															} )
														}
														disabled={
															! isProActive()
														}
													/>
													<label
														className={ `${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
														htmlFor="hide-on-mobile"
													>
														Hide columns on mobile
														<span className="tooltip-hide-on">
															<Tooltip
																content={ `Enable this to hide the selected columns on mobile` }
															/>
															{ ! isProActive() && (
																<button className="btn-pro">
																	{ getStrings(
																		'pro'
																	) }
																</button>
															) }
														</span>
													</label>
												</div>
											</div>
										) }
									</div>
								</div>
							) }
							{ 'rows' === thirdActiveTab && (
								<div className={ `hide-rows-tab-content` }>
									<div className="navbar-screen-nav">
										<button
											className={ `${
												screenTab === 'desktop'
													? 'active'
													: ''
											} ` }
											onClick={ () =>
												handleScreenActiveTab(
													'desktop'
												)
											}
										>
											<span className="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="16"
													viewBox="0 0 24 16"
													fill="none"
												>
													<path
														d="M20 14C21.1 14 22 13.1 22 12V2C22 0.9 21.1 0 20 0H4C2.9 0 2 0.9 2 2V12C2 13.1 2.9 14 4 14H1C0.45 14 0 14.45 0 15C0 15.55 0.45 16 1 16H23C23.55 16 24 15.55 24 15C24 14.45 23.55 14 23 14H20ZM5 2H19C19.55 2 20 2.45 20 3V11C20 11.55 19.55 12 19 12H5C4.45 12 4 11.55 4 11V3C4 2.45 4.45 2 5 2Z"
														fill="#1F2937"
													/>
												</svg>
											</span>
											<span>Desktop</span>
										</button>
										<button
											className={ `${
												screenTab === 'mobile'
													? 'active'
													: ''
											} ` }
											onClick={ () =>
												handleScreenActiveTab(
													'mobile'
												)
											}
										>
											<span className="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="20"
													viewBox="0 0 12 20"
													fill="none"
												>
													<path
														d="M10.004 0H1.996C1.46663 0 0.958937 0.210292 0.584615 0.584615C0.210292 0.958938 0 1.46663 0 1.996V18.003C0 19.106 0.894 20 1.996 20H10.003C10.5325 20 11.0403 19.7897 11.4147 19.4154C11.7892 19.0412 11.9997 18.5335 12 18.004V1.996C12 1.46663 11.7897 0.958938 11.4154 0.584615C11.0411 0.210292 10.5334 0 10.004 0ZM6 19C5.31 19 4.75 18.553 4.75 18C4.75 17.447 5.31 17 6 17C6.69 17 7.25 17.447 7.25 18C7.25 18.553 6.69 19 6 19ZM10 16H2V2H10V16Z"
														fill="#1F2937"
													/>
												</svg>
											</span>
											<span>Mobile</span>
										</button>
									</div>

									{ /* Row Hidden area  */ }
									<div className="screen-tab-content">
										{ 'desktop' === screenTab && (
											<div className="screen-tab-content__desktop">
												<div
													className={ `screen-desktop-and-mobile ${
														tableSettings
															?.table_settings
															?.hide_on_desktop_rows
															? ''
															: 'disable'
													}` }
												>
													<h4>
														<span>
															{ hintIcon }
														</span>{ ' ' }
														{ getStrings(
															'click-on-the-rows'
														) }
													</h4>
													<div
														className={ `hidden-rows${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
													>
														<label htmlFor="hidden-rows">
															<span
																className={ `${
																	! isProActive()
																		? ` swptls-pro-settings`
																		: ``
																}` }
															>
																{ getStrings(
																	'hidden-row'
																) }{ ' ' }
															</span>
															<span>
																<Tooltip
																	content={ `This is the list of the hidden rows. Removing a row from this list will make them visible again` }
																/>
																{ ! isProActive() && (
																	<button className="btn-pro">
																		{ getStrings(
																			'pro'
																		) }
																	</button>
																) }
															</span>
														</label>
														<ul
															className={ `hidden-columns-list ${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ tableSettings
																?.table_settings
																?.hide_rows &&
																tableSettings?.table_settings?.hide_rows.map(
																	(
																		value:
																			| string
																			| number,
																		index: any
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			{ ' ' }
																			{ `Row #${ value }` }{ ' ' }
																			<span
																				className="cross_sign"
																				onClick={ () =>
																					handleRemoveRowDesktop(
																						value
																					)
																				}
																			>
																				{
																					Cross
																				}
																			</span>
																		</li>
																	)
																) }
														</ul>
													</div>
												</div>

												<div className="input-checkbox">
													<input
														type="checkbox"
														name="hide_rows"
														id="hide_rows"
														defaultChecked={ true } // aded by me forcefully it checked
														checked={
															tableSettings
																.table_settings
																?.hide_on_desktop_rows
														}
														onChange={ ( e ) =>
															setTableSettings( {
																...tableSettings,
																table_settings:
																	{
																		...tableSettings.table_settings,
																		hide_on_desktop_rows:
																			e
																				.target
																				.checked,
																	},
															} )
														}
														disabled={
															! isProActive()
														}
													/>
													<label
														className={ `${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
														htmlFor="hide-rows-desktop"
													>
														Hide columns on desktop
														<span className="tooltip-hide-on">
															<Tooltip
																content={ `Enable this to hide the selected column on desktop` }
															/>
															{ ! isProActive() && (
																<button className="btn-pro">
																	{ getStrings(
																		'pro'
																	) }
																</button>
															) }
														</span>
													</label>
												</div>
											</div>
										) }
										{ 'mobile' === screenTab && (
											<div className="screen-tab-content__desktop">
												<div className="switch-toggle">
													<input
														type="checkbox"
														name="same_as_desktop"
														id="same-as-desktop"
														checked={
															sameAsDesktopRows
														}
														onChange={
															handleSameAsDesktopRowsChange
														}
													/>
													<label htmlFor="same-as-desktop">
														Same as desktop
													</label>
												</div>

												<div
													className={ `screen-desktop-and-mobile ${
														tableSettings
															?.table_settings
															?.hide_on_mobile_rows
															? ''
															: 'disable'
													} ${
														sameAsDesktopRows ===
														true
															? 'screen-disable'
															: ''
													}` }
												>
													<h4>
														<span>
															{ hintIcon }
														</span>{ ' ' }
														{ getStrings(
															'click-on-the-rows'
														) }
													</h4>
													<div
														className={ `hidden-rows${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														} ${
															sameAsDesktopRows ===
															true
																? 'screen-pointer-none'
																: ''
														}` }
													>
														<label htmlFor="hidden-rows">
															<span
																className={ `${
																	! isProActive()
																		? ` swptls-pro-settings`
																		: ``
																}` }
															>
																{ getStrings(
																	'hidden-row-mob'
																) }{ ' ' }
															</span>
															<span>
																<Tooltip
																	content={ `This is the list of the hidden rows on mobile. Removing a row from this list will make them visible again` }
																/>
																{ ! isProActive() && (
																	<button className="btn-pro">
																		{ getStrings(
																			'pro'
																		) }
																	</button>
																) }
															</span>
														</label>
														<ul
															className={ `hidden-columns-list ${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ tableSettings
																?.table_settings
																?.hide_rows_mobile &&
																tableSettings?.table_settings?.hide_rows_mobile.map(
																	(
																		value:
																			| string
																			| number,
																		index: any
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			{ ' ' }
																			{ `Row #${ value }` }{ ' ' }
																			<span
																				className="cross_sign"
																				onClick={ () =>
																					handleRemoveRowMobile(
																						value
																					)
																				}
																			>
																				{
																					Cross
																				}
																			</span>
																		</li>
																	)
																) }
														</ul>
													</div>
												</div>
												<div className="input-checkbox">
													<input
														type="checkbox"
														name="hide_rows_mobile"
														id="hide-rows-mobile"
														checked={
															tableSettings
																.table_settings
																?.hide_on_mobile_rows
														}
														onChange={ ( e ) =>
															setTableSettings( {
																...tableSettings,
																table_settings:
																	{
																		...tableSettings.table_settings,
																		hide_on_mobile_rows:
																			e
																				.target
																				.checked,
																	},
															} )
														}
														disabled={
															! isProActive()
														}
													/>
													<label
														className={ `${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
														htmlFor="hide-rows-mobile"
													>
														Hide columns on mobile
														<span className="tooltip-hide-on">
															<Tooltip
																content={ `Enable this to hide the selected columns on mobile` }
															/>
															{ ! isProActive() && (
																<button className="btn-pro">
																	{ getStrings(
																		'pro'
																	) }
																</button>
															) }
														</span>
													</label>
												</div>
											</div>
										) }
									</div>
								</div>
							) }
							{ 'cells' === thirdActiveTab && (
								<div className={ `hide-cells-tab-content` }>
									<div className="navbar-screen-nav">
										<button
											className={ `${
												screenTab === 'desktop'
													? 'active'
													: ''
											} ` }
											onClick={ () =>
												handleScreenActiveTab(
													'desktop'
												)
											}
										>
											<span className="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="16"
													viewBox="0 0 24 16"
													fill="none"
												>
													<path
														d="M20 14C21.1 14 22 13.1 22 12V2C22 0.9 21.1 0 20 0H4C2.9 0 2 0.9 2 2V12C2 13.1 2.9 14 4 14H1C0.45 14 0 14.45 0 15C0 15.55 0.45 16 1 16H23C23.55 16 24 15.55 24 15C24 14.45 23.55 14 23 14H20ZM5 2H19C19.55 2 20 2.45 20 3V11C20 11.55 19.55 12 19 12H5C4.45 12 4 11.55 4 11V3C4 2.45 4.45 2 5 2Z"
														fill="#1F2937"
													/>
												</svg>
											</span>
											<span>Desktop</span>
										</button>
										<button
											className={ `${
												screenTab === 'mobile'
													? 'active'
													: ''
											} ` }
											onClick={ () =>
												handleScreenActiveTab(
													'mobile'
												)
											}
										>
											<span className="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="20"
													viewBox="0 0 12 20"
													fill="none"
												>
													<path
														d="M10.004 0H1.996C1.46663 0 0.958937 0.210292 0.584615 0.584615C0.210292 0.958938 0 1.46663 0 1.996V18.003C0 19.106 0.894 20 1.996 20H10.003C10.5325 20 11.0403 19.7897 11.4147 19.4154C11.7892 19.0412 11.9997 18.5335 12 18.004V1.996C12 1.46663 11.7897 0.958938 11.4154 0.584615C11.0411 0.210292 10.5334 0 10.004 0ZM6 19C5.31 19 4.75 18.553 4.75 18C4.75 17.447 5.31 17 6 17C6.69 17 7.25 17.447 7.25 18C7.25 18.553 6.69 19 6 19ZM10 16H2V2H10V16Z"
														fill="#1F2937"
													/>
												</svg>
											</span>
											<span>Mobile</span>
										</button>
									</div>
									{ /* Cells Area  */ }
									<div className="screen-tab-content">
										{ 'desktop' === screenTab && (
											<div className="screen-tab-content__desktop">
												<div
													className={ `screen-desktop-and-mobile ${
														tableSettings
															?.table_settings
															?.hide_on_desktop_cell
															? ''
															: 'disable'
													}` }
												>
													<h4>
														<span>
															{ hintIcon }
														</span>{ ' ' }
														{ getStrings(
															'click-on-the-cells'
														) }
													</h4>
													<div
														className={ `hidden-cells${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
													>
														<label htmlFor="hidden-cells">
															<span
																className={ `${
																	! isProActive()
																		? ` swptls-pro-settings`
																		: ``
																}` }
															>
																{ getStrings(
																	'hidden-cell'
																) }{ ' ' }
															</span>
															<span>
																<Tooltip
																	content={ `This is the list of the hidden cells. Removing a cell from this list will make them visible again` }
																/>
																{ ! isProActive() && (
																	<button className="btn-pro">
																		{ getStrings(
																			'pro'
																		) }
																	</button>
																) }
															</span>
														</label>
														<ul
															className={ `hidden-columns-list ${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ tableSettings
																?.table_settings
																?.hide_cell &&
																tableSettings?.table_settings?.hide_cell.map(
																	(
																		value: any,
																		index: any
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			{ ' ' }
																			{ value
																				.slice(
																					1,
																					-1
																				)
																				.split(
																					','
																				)
																				.map(
																					(
																						celValue: any,
																						key: number
																					) =>
																						`${
																							key ==
																							0
																								? `Col #${ celValue }, `
																								: `Row #${ celValue }`
																						}`
																				) }{ ' ' }
																			<span
																				className="cross_sign"
																				onClick={ () =>
																					handleCloseCellsDesktop(
																						value
																					)
																				}
																			>
																				{
																					Cross
																				}
																			</span>
																		</li>
																	)
																) }
														</ul>
													</div>
												</div>
												<div className="input-checkbox">
													<input
														type="checkbox"
														name="hide_cells_desktop"
														id="hide-cells-desktop"
														defaultChecked={ true } // aded by me forcefully it checked
														checked={
															tableSettings
																.table_settings
																?.hide_on_desktop_cell
														}
														onChange={ ( e ) =>
															setTableSettings( {
																...tableSettings,
																table_settings:
																	{
																		...tableSettings.table_settings,
																		hide_on_desktop_cell:
																			e
																				.target
																				.checked,
																	},
															} )
														}
														disabled={
															! isProActive()
														}
													/>
													<label
														className={ `${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
														htmlFor="hide-cells-desktop"
													>
														Hide columns on desktop
														<span className="tooltip-hide-on">
															<Tooltip
																content={ `Enable this to hide the selected column on desktop` }
															/>
															{ ! isProActive() && (
																<button className="btn-pro">
																	{ getStrings(
																		'pro'
																	) }
																</button>
															) }
														</span>
													</label>
												</div>
											</div>
										) }
										{ 'mobile' === screenTab && (
											<div className="screen-tab-content__desktop">
												<div className="switch-toggle">
													<input
														type="checkbox"
														name="same_as_desktop"
														id="same-as-desktop"
														checked={
															sameAsDesktopCells
														}
														onChange={
															handleSameAsDesktopCellsChange
														}
													/>
													<label htmlFor="same-as-desktop">
														Same as desktop
													</label>
												</div>

												<div
													className={ `screen-desktop-and-mobile ${
														tableSettings
															?.table_settings
															?.hide_on_mobile_cell
															? ''
															: 'disable'
													} ${
														sameAsDesktopCells ===
														true
															? 'screen-disable'
															: ''
													}` }
												>
													<h4>
														<span>
															{ hintIcon }
														</span>{ ' ' }
														{ getStrings(
															'click-on-the-cells'
														) }
													</h4>
													<div
														className={ `hidden-cells${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														} ${
															sameAsDesktopCells ===
															true
																? 'screen-pointer-none'
																: ''
														}` }
													>
														<label htmlFor="hidden-cells">
															<span
																className={ `${
																	! isProActive()
																		? ` swptls-pro-settings`
																		: ``
																}` }
															>
																{ getStrings(
																	'hidden-cell-mob'
																) }{ ' ' }
															</span>
															<span>
																<Tooltip
																	content={ `This is the list of the hidden cells on mobile. Removing a cell from this list will make them visible again` }
																/>
																{ ! isProActive() && (
																	<button className="btn-pro">
																		{ getStrings(
																			'pro'
																		) }
																	</button>
																) }
															</span>
														</label>
														<ul
															className={ `hidden-columns-list ${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ tableSettings
																?.table_settings
																?.hide_cell_mobile &&
																tableSettings?.table_settings?.hide_cell_mobile.map(
																	(
																		value: any,
																		index: any
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			{ ' ' }
																			{ value
																				.slice(
																					1,
																					-1
																				)
																				.split(
																					','
																				)
																				.map(
																					(
																						celValue: any,
																						key: number
																					) =>
																						`${
																							key ==
																							0
																								? `Col #${ celValue }, `
																								: `Row #${ celValue }`
																						}`
																				) }{ ' ' }
																			<span
																				className="cross_sign"
																				onClick={ () =>
																					handleCloseCellsMobile(
																						value
																					)
																				}
																			>
																				{
																					Cross
																				}
																			</span>
																		</li>
																	)
																) }
														</ul>
													</div>
												</div>
												<div className="input-checkbox">
													<input
														type="checkbox"
														name="hide_cells_mobile"
														id="hide-cells-mobile"
														checked={
															tableSettings
																.table_settings
																?.hide_on_mobile_cell
														}
														onChange={ ( e ) =>
															setTableSettings( {
																...tableSettings,
																table_settings:
																	{
																		...tableSettings.table_settings,
																		hide_on_mobile_cell:
																			e
																				.target
																				.checked,
																	},
															} )
														}
														disabled={
															! isProActive()
														}
													/>
													<label
														className={ `${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
														htmlFor="hide-cells-mobile"
													>
														Hide columns on mobile
														<span className="tooltip-hide-on">
															<Tooltip
																content={ `Enable this to hide the selected columns on mobile` }
															/>
															{ ! isProActive() && (
																<button className="btn-pro">
																	{ getStrings(
																		'pro'
																	) }
																</button>
															) }
														</span>
													</label>
												</div>
											</div>
										) }
									</div>
								</div>
							) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RowSettings;
