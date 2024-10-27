import React, { useState, useEffect, useRef } from 'react';
import { getStrings, isProActive } from './../Helpers';
//styles
import Tooltip from './Tooltip';
import ThemeFields from './ThemeFields';
import { lockBTN } from '../icons';

import '../styles/_conditionalview.scss';

const ConditionalView = ( { tableSettings, setTableSettings } ) => {
	const [ tableHeaders, setTableHeaders ] = useState( [] );
	const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
	const [ selectedOptions, setSelectedOptions ] = useState(
		tableSettings?.table_settings?.table_search_column || []
	);

	const dropdownRef = useRef( null ); // Create a ref for the dropdown
	const [ previewGif, setPreviewGif ] = useState( true );

	const handleColumnSpecificSearchToggle = ( e ) => {
		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				enable_column_specific_search: e.target.checked,
			},
		} );

		setIsDropdownOpen( false );
	};

	useEffect( () => {
		const checkTableContainer = () => {
			const tableContainer = document.getElementById( 'table-preview' );
			if ( ! tableContainer ) {
				// console.error('Table container with ID "table-preview" not found.');
				return false;
			}
			return true;
		};

		// Check for the table and try to extract headers every 500ms
		const intervalId = setInterval( () => {
			if ( checkTableContainer() ) {
				const tableHead = document.querySelector(
					'#create_tables thead'
				);
				if ( tableHead ) {
					const headers = Array.from(
						tableHead.querySelectorAll( 'th' )
					).map( ( th, index ) => ( {
						label: th.textContent.trim(),
						value: index,
					} ) );
					// console.log('Extracted Headers:', headers);
					setTableHeaders( headers );
					clearInterval( intervalId ); // Stop checking once headers are found
				}
			}
		}, 500 ); // Check every 500ms

		// Cleanup function to stop the interval
		return () => clearInterval( intervalId );
	}, [] ); // Empty dependency array ensures this runs once when the component mounts

	const handleOptionChange = ( headerValue ) => {
		setSelectedOptions( ( prevSelected ) => {
			const updatedSelection = prevSelected.includes( headerValue )
				? prevSelected.filter( ( value ) => value !== headerValue ) // Remove the selected option
				: [ ...prevSelected, headerValue ]; // Add the selected option

			// Update tableSettings to reflect the new selection
			setTableSettings( ( prevSettings ) => ( {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					table_search_column: updatedSelection,
				},
			} ) );

			return updatedSelection;
		} );
	};

	const handleDropdownToggle = () => {
		setIsDropdownOpen( ( prev ) => ! prev );
	};

	const handleRemoveOption = ( value ) => {
		setSelectedOptions( ( prevSelected ) => {
			const updatedSelection = prevSelected.filter(
				( v ) => v !== value
			);

			// Update tableSettings to reflect the removal
			setTableSettings( ( prevSettings ) => ( {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					table_search_column: updatedSelection,
				},
			} ) );

			return updatedSelection;
		} );
	};

	// Prevent dropdown from closing when clicking on checkboxes
	const handleCheckboxClick = ( event ) => {
		event.stopPropagation();
	};

	const handleOutsideClick = ( event ) => {
		if (
			dropdownRef.current &&
			! dropdownRef.current.contains( event.target )
		) {
			setIsDropdownOpen( false ); // Close dropdown if clicked outside
		}
	};

	useEffect( () => {
		document.addEventListener( 'mousedown', handleOutsideClick );
		return () => {
			document.removeEventListener( 'mousedown', handleOutsideClick );
		};
	}, [] );

	/**
	 *
	 * @param style Handle theme selection
	 * @returns
	 */
	const handleModeSelect = ( style ) => {
		if ( ! isProActive() ) {
			return;
		}

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				table_view_mode: style,
			},
		} );
	};

	/**
	 * Alert if clicked on outside of element
	 *
	 * @param  event
	 */
	function handleCancelOutside( event: MouseEvent ) {
		if (
			dropdownRef.current &&
			! dropdownRef.current.contains( event.target )
		) {
			// handleClosePopup();
		}
	}

	useEffect( () => {
		const handleClick = () => {
			WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
		};
		document.addEventListener( 'mousedown', handleCancelOutside );

		const proSettings = document.querySelectorAll(
			'.swptls-pro-settings, .swptls-pro-theme'
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

	console.log( tableSettings?.table_settings?.enable_column_specific_search );

	return (
		<div className="edit-data-source-wrap conditional-view-wrapper">
			<h4 className="title">{ getStrings( 'choose-how-you-want' ) }</h4>
			<div
				className={ `table-view__list ${
					tableSettings?.table_settings?.import_styles
						? 'active_sheetstyle'
						: 'disable_sheetstyle'
				}` }
			>
				<button
					className={ `table-view__item ${
						tableSettings?.table_settings?.table_view_mode ===
						'default-mode'
							? ' active'
							: ''
					}` }
					onClick={ () =>
						setTableSettings( {
							...tableSettings,
							table_settings: {
								...tableSettings.table_settings,
								table_view_mode: 'default-mode',
							},
						} )
					}
				>
					<div className="table-view__card">
						<div className="icon-wrap">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="30"
									height="30"
									viewBox="0 0 30 30"
									fill="none"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M18.3 2.25H11.7V9.3L18.3 9.3V2.25ZM18.3 11.7L11.7 11.7V18.3H18.3V11.7ZM9.3 9.3V2.25H6C3.92893 2.25 2.25 3.92893 2.25 6V9.3H9.3ZM2.25 11.7H9.3V18.3H2.25V11.7ZM20.7 11.7H27.75V18.3H20.7V11.7ZM27.75 9.3H20.7V2.25H24C26.0711 2.25 27.75 3.92893 27.75 6V9.3ZM9.3 20.7H2.25V24C2.25 26.0711 3.92893 27.75 6 27.75H9.3V20.7ZM18.3 20.7L11.7 20.7V27.75H18.3V20.7ZM20.7 27.75V20.7H27.75V24C27.75 26.0711 26.0711 27.75 24 27.75H20.7ZM6 0C2.68629 0 0 2.68629 0 6V24C0 27.3137 2.68629 30 6 30H24C27.3137 30 30 27.3137 30 24V6C30 2.68629 27.3137 0 24 0H6Z"
										fill="#879EB1"
									/>
								</svg>
							</div>
						</div>
						<div className="text">
							<p>
								{ getStrings( 'table-will-show-by-default' ) }
							</p>
						</div>
					</div>
					<div className="table-view__lable">
						<div className="radio-field"></div>
						<div className="label-title">
							{ getStrings( 'basic-display' ) }{ ' ' }
						</div>
					</div>
				</button>

				{ /* Search  */ }
				<button
					className={ `table-view__item ${
						tableSettings?.table_settings?.table_view_mode ===
						'search-only-mode'
							? ' active'
							: ''
					}  ${ ! isProActive() ? 'swptls-pro-theme' : '' }` }
					onClick={ () => handleModeSelect( 'search-only-mode' ) }
				>
					<div className="table-view__card">
						<div className="icon-wrap">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="30"
									height="25"
									viewBox="0 0 30 25"
									fill="none"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M5.78311 2.16867H23.1324C25.0842 2.16867 26.6747 3.71572 26.7445 5.65047C27.602 6.41749 28.3367 7.31891 28.9156 8.32164V5.78311C28.9156 2.58919 26.3264 0 23.1324 0H5.78311C2.58919 0 0 2.58919 0 5.78311V10.1204C0 13.3144 2.58919 15.9036 5.78311 15.9036H8.89157C8.74933 15.2028 8.67467 14.4776 8.67467 13.7349H5.78311C3.78691 13.7349 2.16867 12.1166 2.16867 10.1204V5.78311C2.16867 3.78691 3.78691 2.16867 5.78311 2.16867ZM19.4523 19.3865C22.6099 19.3865 25.1697 16.8268 25.1697 13.6691C25.1697 10.5115 22.6099 7.95175 19.4523 7.95175C16.2947 7.95175 13.7349 10.5115 13.7349 13.6691C13.7349 16.8268 16.2947 19.3865 19.4523 19.3865ZM25.7428 18.4259C26.7442 17.1036 27.3384 15.4558 27.3384 13.6691C27.3384 9.31379 23.8077 5.78309 19.4523 5.78309C15.097 5.78309 11.5662 9.31379 11.5662 13.6691C11.5662 18.0245 15.097 21.5552 19.4523 21.5552C21.239 21.5552 22.887 20.961 24.2093 19.9594L28.149 23.8991C28.5725 24.3226 29.259 24.3226 29.6825 23.8991C30.1059 23.4757 30.1059 22.7891 29.6825 22.3656L25.7428 18.4259Z"
										fill="#879EB1"
									/>
								</svg>
							</div>
							<div className="badge-wrap">
								<button className="beta-badge">Beta</button>
								{ /* <button className="tutorial-badge">
									<span className="icon">
										<svg xmlns="http://www.w3.org/2000/svg" width="6" height="7" viewBox="0 0 6 7" fill="none">
											<path d="M1.61548 0.633108C1.08519 0.328931 0.655273 0.578117 0.655273 1.18924V5.69903C0.655273 6.31076 1.08519 6.55962 1.61548 6.25573L5.55726 3.99514C6.08772 3.69086 6.08772 3.19787 5.55726 2.89366L1.61548 0.633108Z" fill="#FF0000" />
										</svg>
									</span>
									<span className="text-label">Tutorial</span>
								</button> */ }
							</div>
						</div>
						<div className="text">
							<p>{ getStrings( 'a-search-field' ) }</p>
						</div>

						{ ! isProActive() && (
							<button className="btn-pro-lock theme-lock-blur">
								{ lockBTN }
							</button>
						) }
					</div>
					<div className="table-view__lable">
						<div className="radio-field"></div>
						<div className="label-title">
							{ getStrings( 'search-only-display' ) }{ ' ' }
							<Tooltip
								content={ getStrings( 'a-search-field' ) }
							/>
						</div>
					</div>
				</button>

				{ /* User specific  */ }
				<button
					disabled
					className={ `table-view__item disabled ${
						tableSettings?.table_settings?.table_view_mode ===
						'user-specific-mode'
							? ' active'
							: ''
					}  ${ ! isProActive() ? 'swptls-pro-theme' : '' }` }
					onClick={ () => handleModeSelect( 'user-specific-mode' ) }
				>
					<div className="table-view__card">
						<div className="icon-wrap">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="30"
									height="30"
									viewBox="0 0 30 30"
									fill="none"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M24.2655 23.7036C26.3792 21.4333 27.6721 18.3887 27.6721 15.0421C27.6721 12.9277 27.156 10.9338 26.2428 9.17957L27.6985 7.20128C29.1046 9.48116 29.9158 12.1669 29.9158 15.0421C29.9158 19.3751 28.0735 23.2777 25.1294 26.0095C25.1294 26.0095 25.1294 26.0095 25.1294 26.0095C24.5102 26.5841 23.8422 27.1068 23.1324 27.5709C23.1324 27.5709 23.1324 27.5709 23.1324 27.5709C20.7828 29.107 17.9746 30.0001 14.9579 30.0001C6.69679 30.0001 -0.00012207 23.3032 -0.00012207 15.0421C-0.00012207 6.78108 6.69679 0.0841675 14.9579 0.0841675C16.9895 0.0841675 18.9265 0.489195 20.6925 1.22291L19.1169 3.02368C17.8137 2.57278 16.4144 2.32786 14.9579 2.32786C7.93595 2.32786 2.24357 8.02024 2.24357 15.0421C2.24357 18.3887 3.53656 21.4334 5.65022 23.7037C6.89976 21.2859 9.0637 19.4174 11.6845 18.5556C10.0526 17.487 8.97461 15.6426 8.97461 13.5463C8.97461 10.2419 11.6534 7.56314 14.9578 7.56314C18.2622 7.56314 20.941 10.2419 20.941 13.5463C20.941 15.6425 19.863 17.487 18.2311 18.5555C20.852 19.4173 23.016 21.2858 24.2655 23.7036ZM22.5216 25.2629C21.2635 22.331 18.3505 20.2774 14.9579 20.2774C11.5653 20.2774 8.65229 22.331 7.39418 25.2629C9.50792 26.8297 12.1247 27.7564 14.9579 27.7564C17.7911 27.7564 20.4078 26.8297 22.5216 25.2629ZM14.9578 17.2858C17.0231 17.2858 18.6973 15.6116 18.6973 13.5463C18.6973 11.4811 17.0231 9.80683 14.9578 9.80683C12.8925 9.80683 11.2183 11.4811 11.2183 13.5463C11.2183 15.6116 12.8925 17.2858 14.9578 17.2858Z"
										fill="#879EB1"
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M30 1.43632L23.5918 9.1261L19.3641 5.74395L20.7658 3.99192L23.2761 6.00019L28.2763 -6.10352e-05L30 1.43632Z"
										fill="#879EB1"
									/>
								</svg>
							</div>
							<div className="badge-wrap">
								{ /* <button className="tutorial-badge">
									<span className="icon">
										<svg xmlns="http://www.w3.org/2000/svg" width="6" height="7" viewBox="0 0 6 7" fill="none">
											<path d="M1.61548 0.633108C1.08519 0.328931 0.655273 0.578117 0.655273 1.18924V5.69903C0.655273 6.31076 1.08519 6.55962 1.61548 6.25573L5.55726 3.99514C6.08772 3.69086 6.08772 3.19787 5.55726 2.89366L1.61548 0.633108Z" fill="#FF0000" />
										</svg>
									</span>
									<span className="text-label">Tutorial</span>
								</button> */ }
							</div>
						</div>
						<div className="text">
							<p>
								{ getStrings(
									'displayed-only-to-logged-in-users'
								) }
							</p>
						</div>
						<button className="btn-pro-lock btn-upcooming theme-lock-blur">
							<span>{ getStrings( 'Upcomming' ) }</span>
						</button>
					</div>
					<div className="table-view__lable">
						<div className="radio-field"></div>
						<div className="label-title">
							{ getStrings( 'user-specific-display' ) }{ ' ' }
							<Tooltip
								content={ getStrings(
									'displayed-only-to-logged-in-users'
								) }
							/>
						</div>
					</div>
				</button>

				{ /* Procted mode  */ }
				<button
					disabled
					// className={`table-view__item disabled ${tableSettings?.table_settings?.table_view_mode === 'protected-mode' ? ' active' : ''}` }
					className={ `table-view__item disabled ${
						tableSettings?.table_settings?.table_view_mode ===
						'protected-mode'
							? ' active'
							: ''
					} ${ ! isProActive() ? 'swptls-pro-theme' : '' }` }
					onClick={ () => handleModeSelect( 'protected-mode' ) }
				>
					<div className="table-view__card">
						<div className="icon-wrap">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="30"
									height="30"
									viewBox="0 0 30 30"
									fill="none"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M24 12H25.5C27.9853 12 30 14.0147 30 16.5V25.5C30 27.9853 27.9853 30 25.5 30H4.5C2.01472 30 0 27.9853 0 25.5V16.5C0 14.0147 2.01472 12 4.5 12H6V9C6 4.02944 10.0294 0 15 0C19.9706 0 24 4.02944 24 9V12ZM21.75 12V9C21.75 5.27208 18.7279 2.25 15 2.25C11.2721 2.25 8.25 5.27208 8.25 9V12H21.75ZM8.25 14.25H4.5C3.25736 14.25 2.25 15.2574 2.25 16.5V25.5C2.25 26.7426 3.25736 27.75 4.5 27.75H25.5C26.7426 27.75 27.75 26.7426 27.75 25.5V16.5C27.75 15.2574 26.7426 14.25 25.5 14.25H21.75H8.25Z"
										fill="#879EB1"
									/>
								</svg>
							</div>
							<div className="badge-wrap">
								{ /* <button className="tutorial-badge">
									<span className="icon">
										<svg xmlns="http://www.w3.org/2000/svg" width="6" height="7" viewBox="0 0 6 7" fill="none">
											<path d="M1.61548 0.633108C1.08519 0.328931 0.655273 0.578117 0.655273 1.18924V5.69903C0.655273 6.31076 1.08519 6.55962 1.61548 6.25573L5.55726 3.99514C6.08772 3.69086 6.08772 3.19787 5.55726 2.89366L1.61548 0.633108Z" fill="#FF0000" />
										</svg>
									</span>
									<span className="text-label">Tutorial</span>
								</button> */ }
							</div>
						</div>
						<div className="text">
							<p>{ getStrings( 'password-pin-protected' ) }</p>
						</div>
						<button className="btn-pro-lock btn-upcooming theme-lock-blur">
							<span>{ getStrings( 'Upcomming' ) }</span>
						</button>
					</div>
					<div className="table-view__lable">
						<div className="radio-field"></div>
						<div className="label-title">
							{ getStrings( 'protected-view' ) }{ ' ' }
							<Tooltip
								content={ getStrings(
									'password-pin-protected'
								) }
							/>
						</div>
					</div>
				</button>
			</div>

			{ tableSettings?.table_settings?.table_view_mode ===
				'search-only-mode' && (
				<div className="edit-form-group">
					{ /* Here will be Select column(s) to search through their header data*/ }
					<div
						className="condition-select-fields"
						ref={ dropdownRef }
					>
						<div className="switch-toggle">
							<input
								type="checkbox"
								name="same_as_desktop"
								id="enable-column-specific-search"
								checked={
									tableSettings?.table_settings
										?.enable_column_specific_search
								}
								onChange={ handleColumnSpecificSearchToggle }
								disabled={ ! isProActive() }
							/>

							<label htmlFor="enable-column-specific-search">
								{ getStrings( 'column-specific' ) }{ ' ' }
								<Tooltip content='Use this feature to streamline your search by focusing on specific columns. For example, if you select a column (e.g., "Roll Number") and search for a number (e.g., 60), only rows with 60 in that column will be displayed. Any instances of 60 in other columns will not appear in the search results if they do not match accordingly.' />
							</label>
						</div>
						<label htmlFor="column-select">
							{ getStrings( 'column-for-table-search' ) }
						</label>
						<div
							className={ `conditional-dropdown-select ${
								tableSettings?.table_settings
									?.enable_column_specific_search === false
									? 'select-disabled'
									: ''
							}` }
							onClick={ () =>
								tableSettings?.table_settings
									?.enable_column_specific_search &&
								handleDropdownToggle()
							}
						>
							<div className="selected-options">
								{ selectedOptions.length > 0
									? selectedOptions.map( ( value ) => {
											const header = tableHeaders.find(
												( h ) => h.value === value
											);
											return header ? (
												<div
													key={ header.value }
													className="selected-item"
												>
													{ header.label }
													<span
														className="remove-icon"
														onClick={ ( e ) => {
															// Prevent dropdown from closing
															e.stopPropagation();
															handleRemoveOption(
																header.value
															);
														} }
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="8"
															height="8"
															viewBox="0 0 8 8"
															fill="none"
														>
															<path
																d="M1 7L7.0017 1M1 1L7.0017 7"
																stroke="#666873"
																stroke-width="1.5"
																stroke-linecap="round"
															/>
														</svg>
													</span>
												</div>
											) : null;
									  } )
									: 'Select a column (optional)' }
								<div className="select-arrow">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="11"
										height="6"
										viewBox="0 0 11 6"
										fill="none"
									>
										<path
											d="M10.9999 0.995538C11.0003 1.12361 10.9744 1.25016 10.9241 1.36588C10.8738 1.48159 10.8004 1.58354 10.7093 1.66423L5.99542 5.80497C5.85484 5.93107 5.67851 6 5.49654 6C5.31456 6 5.13823 5.93107 4.99765 5.80497L0.283814 1.51849C0.123373 1.37297 0.0224779 1.16387 0.00332422 0.937177C-0.0158295 0.710485 0.0483274 0.484775 0.181681 0.309701C0.315034 0.134626 0.506661 0.024529 0.714405 0.00362822C0.922149 -0.0172725 1.12899 0.0527358 1.28943 0.198252L5.50046 4.03037L9.7115 0.326847C9.82682 0.222014 9.96724 0.155421 10.1162 0.134949C10.2651 0.114478 10.4163 0.140983 10.5518 0.211329C10.6873 0.281675 10.8016 0.392918 10.881 0.531895C10.9604 0.670871 11.0017 0.831765 10.9999 0.995538Z"
											fill="#1E1E1E"
										/>
									</svg>
								</div>
							</div>
							<div
								className={ `dropdown-menu ${
									isDropdownOpen ? 'open' : ''
								}` }
							>
								{ tableHeaders.length > 0 ? (
									tableHeaders.map( ( header ) => (
										<label
											htmlFor={ `option-${ header.value }` }
											style={ {
												display: 'flex',
												alignItems: 'center',
											} }
											onClick={ handleCheckboxClick }
											className="dropdown-item"
										>
											<input
												type="checkbox"
												id={ `option-${ header.value }` }
												value={ header.value }
												checked={ selectedOptions.includes(
													header.value
												) }
												onChange={ () =>
													handleOptionChange(
														header.value
													)
												}
											/>
											{ header.label }
										</label>
									) )
								) : (
									<div className="dropdown-item">
										{ getStrings( 'loading-header' ) }
									</div>
								) }
							</div>
						</div>
					</div>

					{ /* Choose when you want to display your search result*/ }
					<div className="swptls-search-support">
						<h4 className="title">
							{ getStrings( 'want-to-display-your-search' ) }
						</h4>
						<div className="wrapper">
							<div className="search-by-modes">
								<input
									type="radio"
									name="search_by_typing"
									id="search_by_typing"
									value="search_by_typing"
									checked={
										tableSettings?.table_settings
											?.search_by === 'search-by-typing'
									}
									onChange={ () =>
										setTableSettings( {
											...tableSettings,
											table_settings: {
												...tableSettings.table_settings,
												search_by: 'search-by-typing',
											},
										} )
									}
								/>
								<label
									className="search-by-modes__lable"
									htmlFor="search_by_typing"
								>
									<div className="radio-field"></div>
									<div className="label-title">
										{ getStrings(
											'show-search-result-once-Typing'
										) }{ ' ' }
										<Tooltip content="Select this option if you prefer to view your search results dynamically as you type. " />
									</div>
								</label>
							</div>
							<div className="search-by-modes">
								<input
									type="radio"
									name="search_by_press"
									id="search_by_press"
									value="search_by_press"
									checked={
										tableSettings?.table_settings
											?.search_by === 'search-by-press'
									}
									onChange={ () =>
										setTableSettings( {
											...tableSettings,
											table_settings: {
												...tableSettings.table_settings,
												search_by: 'search-by-press',
											},
										} )
									}
								/>
								<label
									className="search-by-modes__lable"
									htmlFor="search_by_press"
								>
									<div className="radio-field"></div>
									<div className="label-title">
										{ getStrings(
											'show-search-result-after-pressing'
										) }{ ' ' }
										<Tooltip content="Select this option if you prefer to view your search results only after pressing enter or any button." />
									</div>
								</label>
							</div>
						</div>

						{ /* Preview panel */ }
						{ /* <div className="preview-wrapper">  
							<div className="preview-title">
								Preview
								<span className={`caret ${previewGif === false ? 'rotated' : ''}`} onClick={() => setPreviewGif(!previewGif)}>
									<svg xmlns="http://www.w3.org/2000/svg" width="11" height="6" viewBox="0 0 11 6" fill="none">
										<path d="M10.9999 0.995538C11.0003 1.12361 10.9744 1.25016 10.9241 1.36588C10.8738 1.48159 10.8004 1.58354 10.7093 1.66423L5.99542 5.80497C5.85484 5.93107 5.67851 6 5.49654 6C5.31456 6 5.13823 5.93107 4.99765 5.80497L0.283814 1.51849C0.123373 1.37297 0.0224779 1.16387 0.00332422 0.937177C-0.0158295 0.710485 0.0483274 0.484775 0.181681 0.309701C0.315034 0.134626 0.506661 0.024529 0.714405 0.00362822C0.922149 -0.0172725 1.12899 0.0527358 1.28943 0.198252L5.50046 4.03037L9.7115 0.326847C9.82682 0.222014 9.96724 0.155421 10.1162 0.134949C10.2651 0.114478 10.4163 0.140983 10.5518 0.211329C10.6873 0.281675 10.8016 0.392918 10.881 0.531895C10.9604 0.670871 11.0017 0.831765 10.9999 0.995538Z" fill="#1E1E1E" />
									</svg>
								</span>
							</div>
							{previewGif &&

								<div className="preview-gif">
									<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1384 1124" width="346" height="281">
										<path transform="translate(0)" d="m0 0h1384v1124h-1384z" fill="#E0E4EA" />
										<path transform="translate(562,388)" d="m0 0 10 4 23 12 48 28 26 15 27 16 28 16 24 14 52 30 27 16 22 14 2 4h-2l-2 5-19 12-24 14-52 30-17 10-24 14-26 15-24 14-26 15-24 14-19 11-21 12-6 3h-3l-1-32v-260z" fill="#91A3B0" />
										<path transform="translate(1371,1118)" d="m0 0h13v6h-1384v-5z" fill="#FAFCFE" />
										<path transform="translate(623,524)" d="m0 0h10l9 3 6 5 3 5v7l-2 1h-6l-8-7-4-2h-7l-5 4-3 9v24l3 7 5 3h7l6-3 2-2 1-9-10-1-2-1v-9l2-1h20l2 1 1 3v14l-3 9-5 6-8 4h-16l-7-3-6-5-4-9-1-4v-24l3-12 4-6 6-5z" fill="#F6F8FB" />
										<path transform="translate(689,525)" d="m0 0h43v10l-2 1h-31l1 2 1 18h22l5 1v9l-1 1-16 1-11-1v26l-1 1h-8l-2-1z" fill="#F6F8FB" />
										<path transform="translate(665,525)" d="m0 0h12v68l-1 1h-9l-2-1z" fill="#F5F7FA" />
									</svg>
								</div>
							}
						</div> */ }
					</div>
				</div>
			) }
		</div>
	);
};

export default ConditionalView;
