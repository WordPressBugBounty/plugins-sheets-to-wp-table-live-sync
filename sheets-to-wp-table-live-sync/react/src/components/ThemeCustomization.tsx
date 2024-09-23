import React, { useState, useEffect, useRef } from 'react';
import { ThemeReset, Cross } from '../icons';
import { getStrings, isProActive } from './../Helpers';
import Modal from './../core/Modal';
import Tooltip from './Tooltip';
import { toast } from 'react-toastify';
import '../styles/_themeCustomization.scss';
import Pagination from './Pagination';
//ThemeReset

const ThemeCustomization = ( { tableSettings, setTableSettings } ) => {
	const [ customizationOptions, setCustomizationOptions ] = useState( {} );
	const [ resetTriggered, setResetTriggered ] = useState( false );
	const confirmImportRef = useRef();
	const [ showModal, setShowModal ] = useState( false );
	const [ showPaginationModal, setShowPaginationModal ] = useState( false );
	const [ themeToReset, setThemeToReset ] = useState( null );

	const [ customTheme, setCustomTheme ] = useState( {
		// name: '',
		headerBGColor: '#ffffff',
		headerTextColor: '#000000',
		bodyBGColor: '#ffffff',
		hoverBGColor: '#e8e8e8',
		hoverTextColor: '#000000',
		borderColor: '#000000',
		outsideborderColor: '#ffffff',
		bodyTextColorCol_1: '#333333',
		bodyTextColorColRest: '#6b6b6b',
		bodyTextColor: '#000000',
		bodyBGColorEven: '#f5f5f5',
		bodyBGColorOdd: '#ffffff',

		borderType: 'rounded',
		borderRadius: '10px',

		activeColumnColor: false,
		activeRowColor: false,
		activeRowColumnMode: false,

		hoverModeNone: false,
		hoverModeRow: false,
		hoverModeColumn: false,

		defaultPagination: false,
		simplePagination: false,
		modernPagination: false,
		tailwindPagination: false,
		outlinedPagination: false,
		paginationStyle: '',
		paginationAciveBtnColor: '#2F80ED',
		pagination_center: false,
	} );

	/**
	 * Alert if clicked on outside of element
	 *
	 * @param  event
	 */
	function handleCancelOutside( event: MouseEvent ) {
		if (
			confirmImportRef.current &&
			! confirmImportRef.current.contains( event.target )
		) {
			handleCloseModal();
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

	// END

	// Effect to update customization options when theme changes
	useEffect( () => {
		const currentTheme = tableSettings?.table_settings?.table_style;
		if ( currentTheme ) {
			setCustomizationOptions( ( prevOptions ) => ( {
				...prevOptions,
				[ currentTheme ]:
					tableSettings?.table_settings?.import_styles_theme_colors?.[
						currentTheme
					] || getDefaultOptions( currentTheme ),
			} ) );
		}
	}, [ tableSettings?.table_settings?.table_style ] );

	// Function to handle changes in customization options.
	const handleCustomizationChange = ( theme, key, value ) => {
		setCustomizationOptions( ( prevOptions ) => {
			const currentOptions =
				prevOptions[ theme ] || getDefaultOptions( theme );
			const updatedOptions = { ...currentOptions, [ key ]: value };
			return { ...prevOptions, [ theme ]: updatedOptions };
		} );

		handleThemeChange( theme, { [ key ]: value } );
	};

	const handleCustomizationPaginationChange = ( theme, key, value ) => {
		const paginationState = {
			defaultPagination: value === 'default_pagination',
			modernPagination: value === 'modern_pagination',
			simplePagination: value === 'simple_pagination',
			tailwindPagination: value === 'tailwind_pagination',
			outlinedPagination: value === 'outlined_pagination',
		};

		// Update the customization options with the new pagination style and state
		setCustomizationOptions( ( prevOptions ) => {
			const currentOptions =
				prevOptions[ theme ] || getDefaultOptions( theme );
			const updatedOptions = {
				...currentOptions,
				[ key ]: value,
				...paginationState,
			};
			return { ...prevOptions, [ theme ]: updatedOptions };
		} );

		// Also update the theme with the new pagination style
		handleThemeChange( theme, { [ key ]: value, ...paginationState } );
	};

	// Function to update table settings with selected theme and customization options
	const handleThemeChange = ( theme, updatedOption ) => {
		setTableSettings( ( prevSettings ) => {
			const newThemeColors = {
				...prevSettings.table_settings.import_styles_theme_colors[
					theme
				],
				...updatedOption,
			};
			return {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					import_styles_theme_colors: {
						...prevSettings.table_settings
							.import_styles_theme_colors,
						[ theme ]: newThemeColors,
					},
				},
			};
		} );
	};

	// Function to get the default customization options for a theme
	const getDefaultOptions = ( theme ) => {
		switch ( theme ) {
			//Simple Theme
			case 'default-style':
				return {
					headerBGColor: '#ffffff',
					headerTextColor: '#000000',
					bodyBGColor: '#ffffff',
					bodyTextColorCol_1: '#333333',
					bodyTextColorColRest: '#6B7280',
					borderColor: '#e0e5f6',
					paginationStyle: 'default_pagination',
					paginationAciveBtnColor: '#828282',
					pagination_center: false,
				};
			//Simple on dark
			case 'style-4':
				return {
					headerBGColor: '#000',
					headerTextColor: '#ffffff',
					bodyBGColor: '#000f',
					bodyTextColor: '#ffffff',
					hoverBGColor: '#504949',
					paginationStyle: 'simple_pagination',
					paginationAciveBtnColor: '#000000',
					pagination_center: true,
				};
			// Minimal
			case 'style-6':
				return {
					headerBGColor: '#E5F1FF',
					headerTextColor: '#0f0f0f',
					bodyTextColor: '#0f0f0f',
					bodyBGColorEven: '#EBF4FF',
					bodyBGColorOdd: '#ffffff',
					hoverBGColor: '#bdcfe4',
					paginationStyle: 'tailwind_pagination',
					paginationAciveBtnColor: '#2D74E7',
					pagination_center: false,
				};

			// Minimal on dark
			case 'style-2':
				return {
					headerBGColor: '#36304a',
					headerTextColor: '#ffffff',
					bodyTextColor: '#0f0f0f',
					bodyBGColorEven: '#f5f5f5',
					bodyBGColorOdd: '#ffffff',
					hoverBGColor: '#d1d1d1',
					borderType: 'solid',
					borderRadius: '10px',
					paginationStyle: 'modern_pagination',
					paginationAciveBtnColor: '#261C3B',
					pagination_center: false,
				};

			// Minimal elegant
			case 'style-3':
				return {
					headerBGColor: '#6c7ae0',
					headerTextColor: '#ffffff',
					bodyTextColor: '#0f0f0f',
					bodyBGColorEven: '#f8f6ff',
					bodyBGColorOdd: '#ffffff',
					hoverBGColor: '#EDE8FC',
					borderColor: '#fafafa',
					borderType: 'solid',
					borderRadius: '10px',
					paginationStyle: 'outlined_pagination',
					paginationAciveBtnColor: '#5C51E0',
					pagination_center: false,
				};

			// Uppercase heading
			case 'style-5':
				return {
					headerBGColor: '#F2F2F2',
					headerTextColor: '#333333',
					bodyBGColor: '#ffffff',
					bodyTextColor: '#0f0f0f',
					hoverBGColor: '#bdcfe4',
					borderColor: '#e4e1e1',
					borderType: 'solid',
					borderRadius: '10px',
					paginationStyle: 'tailwind_pagination',
					paginationAciveBtnColor: '#2F80ED',
					pagination_center: false,
				};

			//Uppercase elegant
			case 'style-8':
				return {
					headerBGColor: '#E0E7FF',
					headerTextColor: '#312E81',
					bodyBGColor: '#ffffff',
					bodyTextColor: '#333333',
					bodyTextColorCol_1: '#333333',
					bodyTextColorColRest: '#6B7280',
					hoverBGColor: '#e4e9f8',
					borderColor: '#e0e5f6',
					borderType: 'solid',
					borderRadius: '10px',
					paginationStyle: 'tailwind_pagination',
					paginationAciveBtnColor: '#5C51E0',
					pagination_center: false,
				};

			//Vertical style
			case 'style-1':
				return {
					headerBGColor: '#6807f9',
					headerTextColor: '#ffffff',
					bodyBGColorEven: '#ffffff',
					bodyBGColorOdd: '#E9E7FF',
					bodyTextColor: '#000',
					borderColor: '#e0e5f6',
					hoverBGColor: '#EDE8FC',
					borderType: 'solid',
					borderRadius: '10px',
					paginationStyle: 'outlined_pagination',
					paginationAciveBtnColor: '#5C51E0',
					pagination_center: false,
				};

			//Dark knight
			case 'style-7':
				return {
					headerBGColor: '#8880F8',
					headerTextColor: '#ffffff',
					bodyBGColor: '#34344C',
					bodyTextColor: '#ffffff',
					hoverBGColor: '#7e78d3',
					borderType: 'solid',
					borderRadius: '10px',
					paginationStyle: 'simple_pagination',
					paginationAciveBtnColor: '#34344C',
					pagination_center: true,
				};

			// Add cases for other themes...
			default:
				// return {};
				return {
					headerBGColor: '#ffffff',
					headerTextColor: '#000000',
					bodyBGColor: '#ffffff',
					bodyTextColor: '#0f0f0f',
					bodyTextColorCol_1: '#333333',
					bodyTextColorColRest: '#6b6b6b',
					borderColor: '#000000',
					outsideborderColor: '#ffffff',
					borderType: 'solid',
					paginationStyle: 'default_pagination',
					paginationAciveBtnColor: '#2F80ED',
					borderRadius: '',
					pagination_center: false,
				};
		}
	};

	// Function to check if any customization option has been modified
	const isThemeModified = ( theme ) => {
		const defaultOptions = getDefaultOptions( theme );
		const currentOptions = customizationOptions[ theme ];
		if ( ! currentOptions ) return false;

		return Object.keys( defaultOptions ).some(
			( key ) => defaultOptions[ key ] !== currentOptions[ key ]
		);
	};

	//Modal

	// Function to open the modal
	const handleOpenModal = ( theme ) => {
		setThemeToReset( theme );
		setShowModal( true );
	};
	const handleOpenPaginationModal = ( theme ) => {
		// console.log(theme);
		const themeColors = theme;
		setCustomTheme( {
			// name: themeName,
			headerBGColor: themeColors.headerBGColor || '',
			headerTextColor: themeColors.headerTextColor || '',
			bodyBGColor: themeColors.bodyBGColor || '',
			hoverBGColor: themeColors.hoverBGColor || '',
			hoverTextColor: themeColors.hoverTextColor || '',
			borderColor: themeColors.borderColor || '',
			outsideborderColor: themeColors.outsideborderColor || '',
			bodyTextColorCol_1: themeColors.bodyTextColorCol_1 || '',
			bodyTextColorColRest: themeColors.bodyTextColorColRest || '',
			bodyTextColor: themeColors.bodyTextColor || '',
			bodyBGColorEven: themeColors.bodyBGColorEven || '',
			bodyBGColorOdd: themeColors.bodyBGColorOdd || '',

			borderType: themeColors.borderType || '',
			borderRadius: themeColors.borderRadius || '',

			activeColumnColor: themeColors.activeColumnColor || false,
			activeRowColor: themeColors.activeRowColor || false,
			activeRowColumnMode: themeColors.activeRowColumnMode || false,

			hoverModeNone: themeColors.hoverModeNone || false,
			hoverModeRow: themeColors.hoverModeRow || false,
			hoverModeColumn: themeColors.hoverModeColumn || false,

			defaultPagination: themeColors.defaultPagination || false,
			simplePagination: themeColors.simplePagination || false,
			modernPagination: themeColors.modernPagination || false,
			tailwindPagination: themeColors.tailwindPagination || false,
			outlinedPagination: themeColors.outlinedPagination || false,
			pagination_center: themeColors.pagination_center || false,

			paginationStyle: themeColors.paginationStyle || '',
			paginationAciveBtnColor:
				themeColors.paginationAciveBtnColor || '#2F80ED',
		} );

		setThemeToReset( theme );
		setShowPaginationModal( true );
	};

	// Function to confirm and reset the theme
	const handleConfirmReset = () => {
		if ( themeToReset ) {
			const defaultOptions = getDefaultOptions( themeToReset );
			setCustomizationOptions( ( prevOptions ) => ( {
				...prevOptions,
				[ themeToReset ]: defaultOptions,
			} ) );
			setResetTriggered( true );
			handleThemeChange( themeToReset, defaultOptions );
			toast.success( 'Theme has been reset!' );
			setShowModal( false );
			setShowPaginationModal( false );
		}
	};

	// Function to close the modal
	const handleCloseModal = () => {
		setShowModal( false );
		setShowPaginationModal( false );
		setThemeToReset( null );
	};

	const handleCustomThemeChange = ( e ) => {
		const { name, value, type, checked } = e.target;

		setCustomTheme( ( prevTheme ) => {
			if ( type === 'checkbox' ) {
				if ( name === 'activeColumnColor' && checked ) {
					return {
						...prevTheme,
						activeColumnColor: true,
						activeRowColor: false,
					};
				} else if ( name === 'activeRowColor' && checked ) {
					return {
						...prevTheme,
						activeRowColor: true,
						activeColumnColor: false,
					};
				} else if ( name === 'hoverModeNone' && checked ) {
					return {
						...prevTheme,
						hoverModeNone: true,
						hoverModeRow: false,
						hoverModeColumn: false,
					};
				} else if ( name === 'hoverModeRow' && checked ) {
					return {
						...prevTheme,
						hoverModeNone: false,
						hoverModeRow: true,
						hoverModeColumn: false,
					};
				} else if ( name === 'hoverModeColumn' && checked ) {
					return {
						...prevTheme,
						hoverModeRow: false,
						hoverModeNone: false,
						hoverModeColumn: true,
					};
				}

				// ColumnRow Toggle Mode
				else if ( name === 'activeRowColumnMode' && checked ) {
					return {
						...prevTheme,
						activeRowColumnMode: checked,
					};
				} else {
					return {
						...prevTheme,
						[ name ]: checked,
					};
				}
			} else {
				return {
					...prevTheme,
					[ name ]: value,
				};
			}
		} );
	};

	const handlePaginationModeChange = ( e ) => {
		const { name, value, type, checked } = e.target;

		setCustomTheme( ( prevTheme ) => {
			if ( type === 'checkbox' ) {
				if ( name === 'defaultPagination' && checked ) {
					return {
						...prevTheme,
						defaultPagination: true,
						paginationStyle: 'default_pagination',
						simplePagination: false,
						tailwindPagination: false,
						outlinedPagination: false,
						modernPagination: false,
					};
				} else if ( name === 'simplePagination' && checked ) {
					return {
						...prevTheme,
						simplePagination: true,
						paginationStyle: 'simple_pagination',
						defaultPagination: false,
						tailwindPagination: false,
						outlinedPagination: false,
						modernPagination: false,
					};
				} else if ( name === 'modernPagination' && checked ) {
					return {
						...prevTheme,
						modernPagination: true,
						paginationStyle: 'modern_pagination',
						simplePagination: false,
						tailwindPagination: false,
						outlinedPagination: false,
						defaultPagination: false,
					};
				} else if ( name === 'tailwindPagination' && checked ) {
					return {
						...prevTheme,
						tailwindPagination: true,
						paginationStyle: 'tailwind_pagination',
						simplePagination: false,
						outlinedPagination: false,
						modernPagination: false,
						defaultPagination: false,
					};
				} else if ( name === 'outlinedPagination' && checked ) {
					return {
						...prevTheme,
						outlinedPagination: true,
						paginationStyle: 'outlined_pagination',
						simplePagination: false,
						tailwindPagination: false,
						modernPagination: false,
						defaultPagination: false,
					};
				} else {
					return {
						...prevTheme,
						[ name ]: checked,
					};
				}
			} else {
				return {
					...prevTheme,
					[ name ]: value,
				};
			}
		} );
	};

	const handleSaveEditedTheme = ( customTheme, themeName ) => {
		// Update the import_styles_theme_colors object
		setTableSettings( ( prevSettings ) => {
			// Get the current import styles theme colors
			const currentStyles =
				prevSettings.table_settings.import_styles_theme_colors;

			// Check if the themeName exists in the currentStyles
			if ( currentStyles[ themeName ] ) {
				// Update the paginationStyle and paginationAciveBtnColor
				currentStyles[ themeName ].paginationStyle =
					customTheme.paginationStyle;
				currentStyles[ themeName ].paginationAciveBtnColor =
					customTheme.paginationAciveBtnColor;
			}

			// Return the updated table settings
			return {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					import_styles_theme_colors: {
						...currentStyles,
					},
				},
			};
		} );

		// Trigger handleCustomizationPaginationChange to update customization options
		handleCustomizationPaginationChange(
			themeName,
			'paginationStyle',
			customTheme.paginationStyle
		);

		// Close the modal after saving
		// handleCloseModal();
		setShowModal( false );
		setShowPaginationModal( false );
		setThemeToReset( null );
	};

	function getPaginationStyleName( value ) {
		const paginationStyles = {
			default_pagination: 'Default pagination',
			modern_pagination: 'Modern pagination',
			simple_pagination: 'Minimal pagination',
			tailwind_pagination: 'Tailwind pagination',
			outlined_pagination: 'Outlined pagination',
		};

		return paginationStyles[ value ] || 'Default pagination';
	}

	/**
	 * Theme render
	 */
	const renderCustomizationFields = ( theme ) => {
		const isModified = isThemeModified( theme );

		if ( theme === 'default-style' ) {
			return (
				<>
					{ /* Default theme Simple */ }
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'default-style'
										]?.headerBGColor || '#ffffff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'default-style',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'default-style'
										]?.headerTextColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'default-style',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColor"
									id="bodyBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'default-style'
										]?.bodyBGColor || '#ffffff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'default-style',
											'bodyBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColor">
									{ getStrings( 'table-bg-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'text-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColorCol_1"
									id="bodyTextColorCol_1"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'default-style'
										]?.bodyTextColorCol_1 || '#333333'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'default-style',
											'bodyTextColorCol_1',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColorCol_1">
									{ getStrings( 'first-cl-txt-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColorColRest"
									id="bodyTextColorColRest"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'default-style'
										]?.bodyTextColorColRest || '#6b6b6b'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'default-style',
											'bodyTextColorColRest',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColorColRest">
									{ getStrings( 'remaning-txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'border-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker borderColor"
									id="borderColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'default-style'
										]?.borderColor || '#e0e5f6'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'default-style',
											'borderColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="borderColor">
									{ getStrings( 'inside-border-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="default_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'default-style'
											]?.paginationAciveBtnColor ||
											'#828282'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'default-style'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'default-style'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'default-style',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'default-style' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-4' ) {
			{
				/* Simple On dark  */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-4'
										]?.headerBGColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-4',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-4'
										]?.headerTextColor || '#ffffff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-4',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColor"
									id="bodyBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-4'
										]?.bodyBGColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-4',
											'bodyBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColor">
									{ getStrings( 'table-bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-4'
										]?.bodyTextColor || '#ffffff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-4',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker hoverBGColor"
									id="hoverBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-4'
										]?.hoverBGColor || '#504949'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-4',
											'hoverBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="hoverBGColor">
									{ getStrings( 'hover-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="simple_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-4'
											]?.paginationAciveBtnColor ||
											'#000000'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-4'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-4'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-4',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ /* Add other customization options for 'style-4' */ }
					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-4' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-6' ) {
			{
				/* Minimal */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-6'
										]?.headerBGColor || '#E5F1FF'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-6',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-6'
										]?.headerTextColor || '#0f0f0f'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-6',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-6'
										]?.bodyTextColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-6',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker hoverBGColor"
									id="hoverBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-6'
										]?.hoverBGColor || '#bdcfe4'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-6',
											'hoverBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="hoverBGColor">
									{ getStrings( 'hover-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'row-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorEven"
									id="bodyBGColorEven"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-6'
										]?.bodyBGColorEven || '#EBF4FF'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-6',
											'bodyBGColorEven',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorEven">
									{ getStrings( 'even-row-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorOdd"
									id="bodyBGColorOdd"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-6'
										]?.bodyBGColorOdd || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-6',
											'bodyBGColorOdd',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorOdd">
									{ getStrings( 'odd-row-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="tailwind_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-6'
											]?.paginationAciveBtnColor ||
											'#2BBAE8'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-6'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-6'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-6',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-6' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-2' ) {
			{
				/* Minimal on dark  */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-2'
										]?.headerBGColor || '#36304a'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-2',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-2'
										]?.headerTextColor || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-2',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-2'
										]?.bodyTextColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-2',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker hoverBGColor"
									id="hoverBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-2'
										]?.hoverBGColor || '#d1d1d1'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-2',
											'hoverBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="hoverBGColor">
									{ getStrings( 'hover-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'row-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorEven"
									id="bodyBGColorEven"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-2'
										]?.bodyBGColorEven || '#f5f5f5'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-2',
											'bodyBGColorEven',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorEven">
									{ getStrings( 'even-row-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorOdd"
									id="bodyBGColorOdd"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-2'
										]?.bodyBGColorOdd || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-2',
											'bodyBGColorOdd',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorOdd">
									{ getStrings( 'odd-row-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="modern_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-2'
											]?.paginationAciveBtnColor ||
											'#261C3B'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-2'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-2'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-2',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-2' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-3' ) {
			{
				/* Minimal elegant */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.headerBGColor || '#6c7ae0'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.headerTextColor || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.bodyTextColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker hoverBGColor"
									id="hoverBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.hoverBGColor || '#EDE8FC'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'hoverBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="hoverBGColor">
									{ getStrings( 'hover-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'row-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorEven"
									id="bodyBGColorEven"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.bodyBGColorEven || '#f8f6ff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'bodyBGColorEven',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorEven">
									{ getStrings( 'even-row-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorOdd"
									id="bodyBGColorOdd"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.bodyBGColorOdd || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'bodyBGColorOdd',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorOdd">
									{ getStrings( 'odd-row-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'border-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker borderColor"
									id="borderColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-3'
										]?.borderColor || '#e0e5f6'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-3',
											'borderColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="borderColor">
									{ getStrings( 'inside-border-color' ) }{ ' ' }
									color
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="outlined_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-3'
											]?.paginationAciveBtnColor ||
											'#2F80ED'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-3'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-3'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-3',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-3' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-5' ) {
			{
				/* Uppercase heading */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-5'
										]?.headerBGColor || '#F2F2F2'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-5',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-5'
										]?.headerTextColor || '#333333'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-5',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColor"
									id="bodyBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-5'
										]?.bodyBGColor || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-5',
											'bodyBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColor">
									{ getStrings( 'table-bg-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-5'
										]?.bodyTextColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-5',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'border-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker borderColor"
									id="borderColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-5'
										]?.borderColor || '#e0e5f6'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-5',
											'borderColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="borderColor">
									{ getStrings( 'table-border-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="tailwind_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-5'
											]?.paginationAciveBtnColor ||
											'#2F80ED'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-5'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-5'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-5',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-5' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-8' ) {
			{
				/* Uppercase elegant */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.headerBGColor || '#E0E7FF'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.headerTextColor || '#312E81'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColor"
									id="bodyBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.bodyBGColor || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'bodyBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColor">
									{ getStrings( 'table-bg-color' ) }
								</label>
							</div>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker hoverBGColor"
									id="hoverBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.hoverBGColor || '#e4e9f8'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'hoverBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="hoverBGColor">
									{ getStrings( 'hover-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'text-color-title' ) }
							</h4>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColorCol_1"
									id="bodyTextColorCol_1"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.bodyTextColorCol_1 || '#333333'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'bodyTextColorCol_1',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColorCol_1">
									{ getStrings( 'first-cl-txt-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColorColRest"
									id="bodyTextColorColRest"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.bodyTextColorColRest || '#6B7280'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'bodyTextColorColRest',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColorColRest">
									{ getStrings( 'rest-txt-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'border-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker borderColor"
									id="borderColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-8'
										]?.borderColor || '#e0e5f6'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-8',
											'borderColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="borderColor">
									{ getStrings( 'out-border-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="tailwind_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-8'
											]?.paginationAciveBtnColor ||
											'#5C51E0'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-8'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-8'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-8',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-8' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-1' ) {
			{
				/* Vertical style */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-1'
										]?.headerBGColor || '#E0E7FF'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-1',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-1'
										]?.headerTextColor || '#312E81'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-1',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-1'
										]?.bodyTextColor || '#000000'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-1',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'column-title' ) }
							</h4>

							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorEven"
									id="bodyBGColorEven"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-1'
										]?.bodyBGColorEven || '#EBF4FF'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-1',
											'bodyBGColorEven',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColorEven">
									{ getStrings( 'even-column-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColorOdd"
									id="bodyBGColorOdd"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-1'
										]?.bodyBGColorOdd || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-1',
											'bodyBGColorOdd',
											e.target.value
										)
									}
								/>
								<label id="bodyBGColorOdd">
									{ getStrings( 'odd-column-color' ) }
								</label>
							</div>
						</div>

						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'border-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker borderColor"
									id="borderColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-1'
										]?.borderColor || '#e0e5f6'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-1',
											'borderColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="borderColor">
									{ getStrings( 'border-color' ) }
								</label>
							</div>
						</div>
					</div>

					{ /* Pagination  */ }
					<div className="table-paginationn">
						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="outlined_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-1'
											]?.paginationAciveBtnColor ||
											'#5C51E0'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-1'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-1'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-1',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-1' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-7' ) {
			{
				/* Dark knight */
			}
			return (
				<>
					<div className="table-design">
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'header-color-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerBGColor"
									id="headerBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-7'
										]?.headerBGColor || '#8880F8'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-7',
											'headerBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerBGColor">
									{ getStrings( 'bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker headerTextColor"
									id="headerTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-7'
										]?.headerTextColor || '#fff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-7',
											'headerTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="headerTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
						</div>
						<div className="theme-colors__palette">
							<h4 className="theme-colors__title text-uppercase">
								{ getStrings( 'body-title' ) }
							</h4>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyBGColor"
									id="bodyBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-7'
										]?.bodyBGColor || '#34344C'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-7',
											'bodyBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyBGColor">
									{ getStrings( 'table-bg-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker bodyTextColor"
									id="bodyTextColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-7'
										]?.bodyTextColor || '#ffffff'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-7',
											'bodyTextColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="bodyTextColor">
									{ getStrings( 'txt-color' ) }
								</label>
							</div>
							<div className="theme-colors__scheme">
								<input
									type="color"
									className="color-picker hoverBGColor"
									id="hoverBGColor"
									value={
										tableSettings?.table_settings
											?.import_styles_theme_colors?.[
											'style-7'
										]?.hoverBGColor || '#7e78d3'
									}
									onChange={ ( e ) =>
										handleCustomizationChange(
											'style-7',
											'hoverBGColor',
											e.target.value
										)
									}
								/>
								<label htmlFor="hoverBGColor">
									{ getStrings( 'hover-color' ) }
								</label>
							</div>
						</div>
					</div>
					<div className="table-paginationn">
						{ /* Pagination  */ }

						<div className="border-style-plate">
							<h4 className="title-divider">
								{ getStrings( 'pagination' ) }
							</h4>
							<div className="border-styles">
								<input
									className="paginationStyle"
									type="hidden"
									id="pagination-style"
									name="paginationStyle"
									value="simple_pagination"
								/>

								<div className="theme-colors__scheme">
									<input
										type="color"
										name="paginationAciveBtnColor"
										id="paginationAciveBtnColor"
										className={ `color-picker paginationAciveBtnColor` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-7'
											]?.paginationAciveBtnColor ||
											'#34344C'
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												theme,
												'paginationAciveBtnColor',
												e.target.value
											)
										}
									/>
									<label htmlFor="paginationAciveBtnColor">
										{ getStrings(
											'active-pagination-color'
										) }
									</label>
								</div>
							</div>

							<div className="border-styles">
								<div className="pagination-checkbox">
									<input
										type="checkbox"
										name="pagination_center"
										id="pagination_center"
										className={ `pagination_center` }
										value={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-7'
											]?.pagination_center || false
										}
										checked={
											tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												'style-7'
											]?.pagination_center
										}
										onChange={ ( e ) =>
											handleCustomizationChange(
												'style-7',
												'pagination_center',
												e.target.checked
											)
										}
									/>
									<label htmlFor="pagination_center">
										{ getStrings(
											'keep-pagination-in-middle'
										) }
									</label>
								</div>
							</div>
						</div>
					</div>

					{ isModified && (
						<button
							className="swptls-reset-theme"
							onClick={ () => handleOpenModal( 'style-7' ) }
						>
							{ ThemeReset } { getStrings( 'theme-reset' ) }
						</button>
					) }
				</>
			);
		} else if ( theme === 'style-new' ) {
			return <></>;
		} else {
			// Handle dynamic themes
			return (
				<>
					{ Object.keys(
						tableSettings?.table_settings
							?.import_styles_theme_colors || {}
					)
						.filter(
							( themeName ) =>
								! [
									'default-style',
									'style-1',
									'style-2',
									'style-3',
									'style-4',
									'style-5',
									'style-6',
									'style-7',
									'style-8',
								].includes( themeName )
						)
						.map(
							( theme ) =>
								tableSettings?.table_settings?.table_style ===
									theme && (
									<>
										<div className="customization-plate-options">
											{ /* HEADER COLORS  */ }
											<div className="theme-colors__palette">
												<h4 className="theme-colors__title text-uppercase">
													{ getStrings(
														'header-color-title'
													) }
												</h4>
												<div className="theme-colors__scheme">
													<input
														type="color"
														id="headerBGColor"
														className="color-picker headerBGColor"
														value={
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]?.headerBGColor ||
															'#ffffff'
														}
														onChange={ ( e ) =>
															handleCustomizationChange(
																theme,
																'headerBGColor',
																e.target.value
															)
														}
													/>
													<label htmlFor="headerBGColor">
														{ getStrings(
															'bg-color'
														) }
													</label>
												</div>
												<div className="theme-colors__scheme">
													<input
														type="color"
														id="headerTextColor"
														className="color-picker headerTextColor"
														value={
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]
																?.headerTextColor ||
															'#000000'
														}
														onChange={ ( e ) =>
															handleCustomizationChange(
																theme,
																'headerTextColor',
																e.target.value
															)
														}
													/>
													<label htmlFor="headerTextColor">
														{ getStrings(
															'txt-color'
														) }
													</label>
												</div>
											</div>

											{ /* TABLE TEXTS  */ }
											<div className="theme-colors__palette">
												<h4 className="theme-colors__title text-uppercase">
													{ getStrings(
														'table-text-title'
													) }
												</h4>

												<div className="theme-colors__scheme">
													<input
														type="color"
														id="bodyTextColorCol_1"
														className="color-picker bodyTextColorCol_1"
														value={
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]
																?.bodyTextColorCol_1 ||
															'#333333'
														}
														onChange={ ( e ) =>
															handleCustomizationChange(
																theme,
																'bodyTextColorCol_1',
																e.target.value
															)
														}
													/>
													<label htmlFor="bodyTextColorCol_1">
														{ getStrings(
															'first-cl-txt-color'
														) }
													</label>
												</div>
												<div className="theme-colors__scheme">
													<input
														type="color"
														id="bodyTextColorColRest"
														className="color-picker bodyTextColorColRest"
														value={
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]
																?.bodyTextColorColRest ||
															'#6b6b6b'
														}
														onChange={ ( e ) =>
															handleCustomizationChange(
																theme,
																'bodyTextColorColRest',
																e.target.value
															)
														}
													/>
													<label htmlFor="bodyTextColorColRest">
														{ getStrings(
															'remaning-txt-color'
														) }
													</label>
												</div>
											</div>

											{ /* BODY COLORS  */ }
											<div className="theme-colors__palette">
												<h4 className="theme-colors__title text-uppercase">
													{ getStrings(
														'body-title'
													) }
												</h4>

												{ tableSettings?.table_settings
													?.import_styles_theme_colors?.[
													theme
												]?.activeRowColumnMode ===
													false && (
													<div className="theme-colors__scheme">
														<input
															type="color"
															id="bodyBGColor"
															className="color-picker bodyBGColor"
															value={
																tableSettings
																	?.table_settings
																	?.import_styles_theme_colors?.[
																	theme
																]
																	?.bodyBGColor ||
																'#ffffff'
															}
															onChange={ ( e ) =>
																handleCustomizationChange(
																	theme,
																	'bodyBGColor',
																	e.target
																		.value
																)
															}
														/>
														<label htmlFor="bodyBGColor">
															{ getStrings(
																'table-bg-color'
															) }
														</label>
													</div>
												) }

												{ /* Column Color  */ }
												{ tableSettings?.table_settings
													?.import_styles_theme_colors?.[
													theme
												]?.activeColumnColor === true &&
													tableSettings
														?.table_settings
														?.import_styles_theme_colors?.[
														theme
													]?.activeRowColumnMode ===
														true && (
														<div className="column-colors">
															{ /* <h4 className="theme-colors__title text-uppercase">{getStrings('column-title')}</h4> */ }
															<div className="theme-colors__scheme">
																<input
																	type="color"
																	id="bodyBGColorEven"
																	className={ `color-picker bodyBGColorEven ${
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.activeColumnColor
																			? 'activeColumnColor'
																			: ''
																	}` }
																	value={
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.bodyBGColorEven ||
																		'#f5f5f5'
																	}
																	onChange={ (
																		e
																	) =>
																		handleCustomizationChange(
																			theme,
																			'bodyBGColorEven',
																			e
																				.target
																				.value
																		)
																	}
																/>
																<label htmlFor="bodyBGColorEven">
																	{ getStrings(
																		'even-column-color'
																	) }
																</label>
															</div>
															<div className="theme-colors__scheme">
																<input
																	type="color"
																	id="bodyBGColorOdd"
																	className={ `color-picker bodyBGColorOdd ${
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.activeColumnColor
																			? 'activeColumnColor'
																			: ''
																	}` }
																	value={
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.bodyBGColorOdd ||
																		'#ffffff'
																	}
																	onChange={ (
																		e
																	) =>
																		handleCustomizationChange(
																			theme,
																			'bodyBGColorOdd',
																			e
																				.target
																				.value
																		)
																	}
																/>
																<label id="bodyBGColorOdd">
																	{ getStrings(
																		'odd-column-color'
																	) }
																</label>
															</div>
														</div>
													) }

												{ /* Row Color  */ }
												{ tableSettings?.table_settings
													?.import_styles_theme_colors?.[
													theme
												]?.activeRowColor === true &&
													tableSettings
														?.table_settings
														?.import_styles_theme_colors?.[
														theme
													]?.activeRowColumnMode ===
														true && (
														<div className="row-colors">
															{ /* <h4 className="theme-colors__title text-uppercase">{getStrings('row-title')}</h4> */ }
															<div className="theme-colors__scheme">
																<input
																	type="color"
																	id="bodyBGColorEven"
																	className={ `color-picker bodyBGColorEven ${
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.activeRowColor
																			? 'activeRowColor'
																			: ''
																	}` }
																	value={
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.bodyBGColorEven ||
																		'#f5f5f5'
																	}
																	onChange={ (
																		e
																	) =>
																		handleCustomizationChange(
																			theme,
																			'bodyBGColorEven',
																			e
																				.target
																				.value
																		)
																	}
																/>
																<label htmlFor="bodyBGColorEven">
																	{ getStrings(
																		'even-row-color'
																	) }
																</label>
															</div>
															<div className="theme-colors__scheme">
																<input
																	type="color"
																	id="bodyBGColorOdd"
																	className={ `color-picker bodyBGColorOdd ${
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.activeRowColor
																			? 'activeRowColor'
																			: ''
																	}` }
																	value={
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.bodyBGColorOdd ||
																		'#ffffff'
																	}
																	onChange={ (
																		e
																	) =>
																		handleCustomizationChange(
																			theme,
																			'bodyBGColorOdd',
																			e
																				.target
																				.value
																		)
																	}
																/>
																<label id="bodyBGColorOdd">
																	{ getStrings(
																		'odd-row-color'
																	) }
																</label>
															</div>
														</div>
													) }
											</div>

											{ /* Hover color  */ }
											{ ! tableSettings?.table_settings
												?.import_styles_theme_colors?.[
												theme
											]?.hoverModeNone === true && (
												<div className="theme-colors__palette">
													<h4 className="theme-colors__title text-uppercase">
														{ getStrings(
															'table-hover-title'
														) }
													</h4>

													<div className="theme-colors__scheme">
														<input
															type="color"
															id="hoverBGColor"
															// className="color-picker hoverBGColor"
															className={ `color-picker hoverBGColor ${
																tableSettings
																	?.table_settings
																	?.import_styles_theme_colors?.[
																	theme
																]?.hoverModeNone
																	? 'hoverModeNone'
																	: tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																	  ]
																			?.hoverModeRow
																	? 'hoverModeRow'
																	: tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																	  ]
																			?.hoverModeColumn
																	? 'hoverModeColumn'
																	: ''
															}` }
															value={
																tableSettings
																	?.table_settings
																	?.import_styles_theme_colors?.[
																	theme
																]
																	?.hoverBGColor ||
																'#e8e8e8'
															}
															onChange={ ( e ) =>
																handleCustomizationChange(
																	theme,
																	'hoverBGColor',
																	e.target
																		.value
																)
															}
														/>
														<label htmlFor="hoverBGColor">
															{ getStrings(
																'hover-color'
															) }
														</label>
													</div>

													{ /* Hover Text colors  */ }
													{ ! tableSettings
														?.table_settings
														?.import_styles_theme_colors?.[
														theme
													]?.hoverModeColumn ===
														true && (
														<div className="theme-colors__scheme">
															<input
																type="color"
																id="hoverTextColor"
																className="color-picker hoverTextColor"
																value={
																	tableSettings
																		?.table_settings
																		?.import_styles_theme_colors?.[
																		theme
																	]
																		?.hoverTextColor ||
																	'#e8e8e8'
																}
																onChange={ (
																	e
																) =>
																	handleCustomizationChange(
																		theme,
																		'hoverTextColor',
																		e.target
																			.value
																	)
																}
															/>
															<label htmlFor="hoverTextColor">
																{ getStrings(
																	'hover-text-color'
																) }
															</label>
														</div>
													) }
												</div>
											) }

											{ /* Border  */ }
											<div className="theme-colors__palette">
												<h4 className="theme-colors__title text-uppercase">
													{ getStrings(
														'border-title'
													) }
												</h4>
												<div className="theme-colors__scheme">
													<input
														type="color"
														id="borderColor"
														className="color-picker borderColor"
														value={
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]?.borderColor ||
															'#000000'
														}
														onChange={ ( e ) =>
															handleCustomizationChange(
																theme,
																'borderColor',
																e.target.value
															)
														}
													/>
													<label htmlFor="borderColor">
														{ getStrings(
															'inside-border-color'
														) }
													</label>
												</div>

												<div className="theme-colors__scheme">
													<input
														type="color"
														id="outside-outsideborderColor"
														// className="color-picker outsideborderColor"
														className={ `color-picker outsideborderColor ${
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]
																?.activeOutsideborder
																? 'activeOutsideborder'
																: ''
														}` }
														value={
															tableSettings
																?.table_settings
																?.import_styles_theme_colors?.[
																theme
															]
																?.outsideborderColor ||
															'#ffffff'
														}
														onChange={ ( e ) =>
															handleCustomizationChange(
																theme,
																'outsideborderColor',
																e.target.value
															)
														}
													/>
													<label htmlFor="outside-outsideborderColor">
														Outside border
													</label>
												</div>
											</div>

											{ /* <button className="swptls-reset-theme" onClick={() => handleResetTheme(theme)}>{ThemeReset} Reset</button> */ }
										</div>
										<div className="customization-plate-others">
											<div className="border-style-plate">
												<h4 className="title-divider">
													{ getStrings(
														'border-style-title'
													) }
												</h4>
												<div className="border-styles">
													<div className="border-styles__field-group">
														<label htmlFor="border-type">
															{ getStrings(
																'outside-border-type'
															) }
														</label>
														<select
															name="border-type"
															id="border-type"
															className="borderType"
															value={
																tableSettings
																	?.table_settings
																	?.import_styles_theme_colors?.[
																	theme
																]?.borderType ||
																'rounded'
															}
															onChange={ ( e ) =>
																handleCustomizationChange(
																	theme,
																	'borderType',
																	e.target
																		.value
																)
															}
														>
															<option value="solid">
																{ getStrings(
																	'solid-border'
																) }
															</option>
															<option value="rounded">
																{ getStrings(
																	'rounded-border'
																) }
															</option>
														</select>
													</div>
													{ tableSettings
														?.table_settings
														?.import_styles_theme_colors?.[
														theme
													]?.borderType ===
														'rounded' && (
														<div className="border-styles__field-group">
															<label htmlFor="border-radius">
																{ getStrings(
																	'border-radius'
																) }
															</label>
															<input
																className="border-radius borderRadius"
																type="text"
																id="border-radius"
																placeholder="10px"
																name="borderRadius"
																value={
																	tableSettings
																		?.table_settings
																		?.import_styles_theme_colors?.[
																		theme
																	]
																		?.borderRadius ||
																	'10px'
																}
																onChange={ (
																	e
																) =>
																	handleCustomizationChange(
																		theme,
																		'borderRadius',
																		e.target
																			.value
																	)
																}
															/>
														</div>
													) }
												</div>
											</div>

											{ /* Pagination  */ }

											<div className="border-style-plate">
												<h4 className="title-divider">
													{ getStrings(
														'pagination'
													) }
												</h4>
												<div className="border-styles pagination-customizer">
													<div className="paginaion-style-panel">
														<div className="border-styles__field-group">
															<label htmlFor="pagination-style">
																{ getStrings(
																	'pg-style'
																) }
															</label>
															<input
																className="paginationStyle"
																type="hidden"
																id="pagination-style"
																placeholder="10px"
																name="paginationStyle"
																value={
																	tableSettings
																		?.table_settings
																		?.import_styles_theme_colors?.[
																		theme
																	]
																		?.paginationStyle ||
																	'default_pagination'
																}
															/>

															{ /* Pagination  */ }
															<div
																className="paginationStyle"
																id="pagination-style"
																onClick={ () =>
																	handleOpenPaginationModal(
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																	)
																}
															>
																{ /* {tableSettings?.table_settings?.import_styles_theme_colors?.[theme]?.paginationStyle} */ }
																{ getPaginationStyleName(
																	tableSettings
																		?.table_settings
																		?.import_styles_theme_colors?.[
																		theme
																	]
																		?.paginationStyle ||
																		'default_pagination'
																) }
															</div>
														</div>

														<div className="theme-colors__scheme pagination-activebtncolor">
															<input
																type="color"
																name="paginationAciveBtnColor"
																id="paginationAciveBtnColor"
																className={ `color-picker paginationAciveBtnColor ${
																	tableSettings
																		?.table_settings
																		?.import_styles_theme_colors?.[
																		theme
																	]
																		?.activeOutsideborder
																		? 'activeOutsideborder'
																		: ''
																}` }
																value={
																	tableSettings
																		?.table_settings
																		?.import_styles_theme_colors?.[
																		theme
																	]
																		?.paginationAciveBtnColor ||
																	'#2F80ED'
																}
																onChange={ (
																	e
																) =>
																	handleCustomizationChange(
																		theme,
																		'paginationAciveBtnColor',
																		e.target
																			.value
																	)
																}
															/>
															<label htmlFor="paginationAciveBtnColor">
																{ getStrings(
																	'active-pagination-color'
																) }
															</label>
														</div>
													</div>
													<div className="paginaion-alignment">
														<div className="border-styles">
															<div className="pagination-checkbox dynamic-theme-pagination-checkbox">
																<input
																	type="checkbox"
																	name="pagination_center"
																	id="pagination_center"
																	className={ `pagination_center` }
																	value={
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.pagination_center ||
																		false
																	}
																	checked={
																		tableSettings
																			?.table_settings
																			?.import_styles_theme_colors?.[
																			theme
																		]
																			?.pagination_center ||
																		false
																	}
																	onChange={ (
																		e
																	) =>
																		handleCustomizationChange(
																			theme,
																			'pagination_center',
																			e
																				.target
																				.checked
																		)
																	}
																/>
																<label htmlFor="pagination_center">
																	{ getStrings(
																		'keep-pagination-in-middle'
																	) }
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</>
								)
						) }
				</>
			);
		}
	};

	return (
		<div className="theme-customization">
			{ showModal && (
				<Modal>
					<div
						className="import-style-modal-wrap modal-content"
						ref={ confirmImportRef }
					>
						<div
							className="cross_sign"
							onClick={ handleCloseModal }
						>
							{ Cross }
						</div>
						<div className="import-style-modal">
							<h4>
								{ getStrings( 'confirmation-theme-reset' ) }
							</h4>
							<p>
								{ ' ' }
								{ getStrings(
									'confirmation-theme-reset-notice'
								) }
							</p>
							<div className="action-buttons">
								<button
									className="swptls-button cancel-button"
									onClick={ handleCloseModal }
								>
									{ getStrings( 'Cancel' ) }
								</button>
								<button
									className="swptls-button confirm-button-reset"
									onClick={ handleConfirmReset }
								>
									{ getStrings( 'yes-reset' ) }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }
			{ showPaginationModal && (
				<Modal>
					<div
						className="import-style-modal-wrap modal-content theme-create-edit customizer-pagination"
						ref={ confirmImportRef }
					>
						<div
							className="cross_sign"
							onClick={ handleCloseModal }
						>
							{ Cross }
						</div>
						<div className="import-style-modal">
							<Pagination
								customTheme={ customTheme }
								handlePaginationModeChange={
									handlePaginationModeChange
								}
								handleCustomThemeChange={
									handleCustomThemeChange
								}
							/>

							<div className="action-buttons">
								<button
									className="swptls-button cancel-button"
									onClick={ handleCloseModal }
								>
									{ getStrings( 'Cancel' ) }
								</button>
								<button
									className={ `swptls-button confirm-button` }
									// onClick={handleSaveEditedTheme}
									onClick={ ( e ) =>
										handleSaveEditedTheme(
											customTheme,
											tableSettings?.table_settings
												?.table_style
										)
									}
								>
									{ ' ' }
									{ getStrings( 'confirm' ) }{ ' ' }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }

			<div className="customizer-header">
				<h2 className="theme-customization-heading">
					{ getStrings( 'customize-theme-options-title' ) }
				</h2>
				<Tooltip content="Customize your theme according to your needs" />
			</div>
			<div className="theme-render">
				<div className="theme-colors">
					<div className="customization-plate-render">
						{ tableSettings?.table_settings?.table_style ===
							'default-style' &&
							renderCustomizationFields( 'default-style' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-4' &&
							renderCustomizationFields( 'style-4' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-6' &&
							renderCustomizationFields( 'style-6' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-2' &&
							renderCustomizationFields( 'style-2' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-3' &&
							renderCustomizationFields( 'style-3' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-5' &&
							renderCustomizationFields( 'style-5' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-8' &&
							renderCustomizationFields( 'style-8' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-1' &&
							renderCustomizationFields( 'style-1' ) }
						{ tableSettings?.table_settings?.table_style ===
							'style-7' &&
							renderCustomizationFields( 'style-7' ) }
						{ Object.keys(
							tableSettings?.table_settings
								?.import_styles_theme_colors || {}
						)
							.filter(
								( themeName ) =>
									! [
										'default-style',
										'style-1',
										'style-2',
										'style-3',
										'style-4',
										'style-5',
										'style-6',
										'style-7',
										'style-8',
									].includes( themeName )
							)
							.map(
								( theme ) =>
									tableSettings?.table_settings
										?.table_style === theme &&
									renderCustomizationFields( theme )
							) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default ThemeCustomization;
