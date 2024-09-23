import theme_one_default_style from '../images/theme-one-default-style.png';
import theme_two_stripped_table from '../images/theme-two-stripped-table.png';
import theme_three_dark_table from '../images/theme-three-dark-table.png';
import theme_four_tailwind_style from '../images/theme-four-tailwind-style.png';
import theme_five_colored_column from '../images/theme-five-colored-column.png';
import theme_six_hovered_style from '../images/theme-six-hovered-style.png';
import theme_minimal_six_hovered_style from '../images/theme_minimal_six_hovered_style.png';
import theme_dark_knight_style from '../images/theme_dark_knight_style.png';
import theme_uppercase_elegant_style from '../images/theme_uppercase_elegant_style.png';
import newTheme from '../images/newTheme.png';

import Modal from './../core/Modal';
import React, { useState, useEffect, useRef } from 'react';
import { getStrings, isProActive } from './../Helpers';
import ThemeCustomization from './ThemeCustomization';
import {
	swapIcon,
	lockWhite,
	lockBTN,
	hintIcon,
	Cross,
	editOnhoverDot,
	Backbtn,
	lockpro,
	ThemeReset,
} from '../icons';
import Tooltip from './Tooltip';
import Pagination from './Pagination';
import { toast } from 'react-toastify';
import '../styles/_tableTheme.scss';

const ThemeSettings = ( { tableSettings, setTableSettings } ) => {
	//Old name: DisplaySettings

	const [ activeSection, setActiveSection ] = useState( null );
	const [ isHovered, setIsHovered ] = useState( null );
	const [ importModal, setImportModal ] = useState< boolean >( false );
	const confirmImportRef = useRef();
	const [ customThemeModal, setCustomThemeModal ] = useState( false );
	const [ customTheme, setCustomTheme ] = useState( {
		name: '',
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
	} );
	const customThemeRef = useRef();
	const [ isEditing, setIsEditing ] = useState( false );
	const [ currentThemeName, setCurrentThemeName ] = useState( '' );
	const [ deleteConfirmationModal, setDeleteConfirmationModal ] =
		useState( false );
	const [ activeThemeErrorModal, setActiveThemeErrorModal ] =
		useState( false );
	const [ themeToDelete, setThemeToDelete ] = useState( '' );

	const [ themeNameError, setThemeNameError ] = useState( false );
	const [ emptyNameError, setEmptyNameError ] = useState( false );

	const toggleSection = ( section ) => {
		setActiveSection( activeSection === section ? null : section );
	};

	const scrollToTop = () => {
		if ( customThemeRef.current ) {
			customThemeRef.current.scrollTop = 0;
		}
	};

	const handleImportStyle = ( e ) => {
		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				import_styles: e.target.checked,
			},
		} );

		if ( e.target.checked === false ) {
			setImportModal( true );
		}
	};

	const handleClosePopup = () => {
		setImportModal( false );
		setCustomThemeModal( false );
		setIsEditing( false );
		resetCustomTheme();
		setCurrentThemeName( '' );
		setDeleteConfirmationModal( false );
		setActiveThemeErrorModal( false );
	};

	const handleDisableImportStyle = () => {
		handleClosePopup();
		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				import_styles: false,
			},
		} );
	};

	const handleCloseImportStylemodal = () => {
		handleClosePopup();

		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				import_styles: true,
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

	/**
	 * New Theme code
	 */
	const handleAddCustomTheme = () => {
		const newThemeName = customTheme.name;

		if ( ! customTheme.name ) {
			setEmptyNameError( true );
			scrollToTop();
			return;
		}

		if ( isThemeNameUsed( newThemeName ) ) {
			setThemeNameError( true );
			scrollToTop();
			return;
		}

		const newThemeColors = {
			headerBGColor: customTheme.headerBGColor,
			headerTextColor: customTheme.headerTextColor,
			bodyBGColor: customTheme.bodyBGColor,
			hoverBGColor: customTheme.hoverBGColor,
			hoverTextColor: customTheme.hoverTextColor,
			borderColor: customTheme.borderColor,
			outsideborderColor: customTheme.outsideborderColor,
			bodyTextColorCol_1: customTheme.bodyTextColorCol_1,
			bodyTextColorColRest: customTheme.bodyTextColorColRest,
			bodyTextColor: customTheme.bodyTextColor,
			bodyBGColorEven: customTheme.bodyBGColorEven,
			bodyBGColorOdd: customTheme.bodyBGColorOdd,

			borderType: customTheme.borderType,
			borderRadius: customTheme.borderRadius,

			activeColumnColor: customTheme.activeColumnColor,
			activeRowColor: customTheme.activeRowColor,
			activeRowColumnMode: customTheme.activeRowColumnMode,

			hoverModeNone: customTheme.hoverModeNone,
			hoverModeRow: customTheme.hoverModeRow,
			hoverModeColumn: customTheme.hoverModeColumn,

			defaultPagination: customTheme.defaultPagination,
			simplePagination: customTheme.simplePagination,
			modernPagination: customTheme.modernPagination,
			tailwindPagination: customTheme.tailwindPagination,
			outlinedPagination: customTheme.outlinedPagination,

			paginationStyle: customTheme.paginationStyle,
			paginationAciveBtnColor: customTheme.paginationAciveBtnColor,
		};

		setTableSettings( ( prevSettings ) => ( {
			...prevSettings,
			table_settings: {
				...prevSettings.table_settings,
				import_styles_theme_colors: {
					...prevSettings.table_settings.import_styles_theme_colors,
					[ newThemeName ]: newThemeColors,
				},
			},
		} ) );

		resetCustomTheme();
		handleClosePopup();
	};

	// Column and Row colors
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

		setThemeNameError( false );
		setEmptyNameError( false );
	};

	// Hover colors
	const handleCustomHovermodeChange = ( e ) => {
		const { name, value, type, checked } = e.target;

		setCustomTheme( ( prevTheme ) => {
			if ( type === 'checkbox' ) {
				if ( name === 'hoverModeNone' && checked ) {
					return {
						...prevTheme,
						hoverModeNone: true,
						hoverModeRow: false,
						hoverModeColumn: false,
					};
				} else if ( name === 'hoverModeRow' && checked ) {
					return {
						...prevTheme,
						hoverModeRow: true,
						hoverModeNone: false,
						hoverModeColumn: false,
					};
				} else if ( name === 'hoverModeColumn' && checked ) {
					return {
						...prevTheme,
						hoverModeColumn: true,
						hoverModeRow: false,
						hoverModeNone: false,
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

		setThemeNameError( false );
		setEmptyNameError( false );
	};

	// Paginaton mode
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

		setThemeNameError( false );
		setEmptyNameError( false );
	};

	const isThemeNameUsed = ( themeName ) => {
		const normalizedThemeName = themeName.toLowerCase();
		return Object.keys(
			tableSettings.table_settings.import_styles_theme_colors
		).some(
			( existingThemeName ) =>
				existingThemeName.toLowerCase() === normalizedThemeName
		);
	};

	/**
	 * Edit and delete
	 */
	const handleEditTheme = ( themeName ) => {
		const themeColors =
			tableSettings.table_settings.import_styles_theme_colors[
				themeName
			];
		setCustomTheme( {
			name: themeName,
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

			paginationStyle: themeColors.paginationStyle || '',
			paginationAciveBtnColor:
				themeColors.paginationAciveBtnColor || '#2F80ED',
		} );
		setIsEditing( true );
		setCurrentThemeName( themeName );
		setCustomThemeModal( true );
	};

	const handleDeleteTheme = ( themeName ) => {
		if ( tableSettings.table_settings.table_style === themeName ) {
			// Show error modal if trying to delete active theme
			setActiveThemeErrorModal( true );
		} else {
			// Show confirmation modal for other themes
			setThemeToDelete( themeName );
			setDeleteConfirmationModal( true );
		}
	};

	const handleCloseActiveThemeErrorModal = () => {
		setActiveThemeErrorModal( false );
	};

	const handleCloseDeleteConfirmationModal = () => {
		setDeleteConfirmationModal( false );
		setThemeToDelete( '' );
	};

	const handleConfirmDeleteTheme = () => {
		const { [ themeToDelete ]: _, ...newThemes } =
			tableSettings.table_settings.import_styles_theme_colors;
		setTableSettings( ( prevSettings ) => ( {
			...prevSettings,
			table_settings: {
				...prevSettings.table_settings,
				import_styles_theme_colors: newThemes,
			},
		} ) );
		handleCloseDeleteConfirmationModal();
		toast.success( 'Theme has been been deleted !' );
	};

	// End

	const handleSaveEditedTheme = () => {
		if ( ! customTheme.name ) {
			setEmptyNameError( true );
			scrollToTop();
			return;
		}

		const newThemeColors = {
			headerBGColor: customTheme.headerBGColor,
			headerTextColor: customTheme.headerTextColor,
			bodyBGColor: customTheme.bodyBGColor,
			hoverBGColor: customTheme.hoverBGColor,
			hoverTextColor: customTheme.hoverTextColor,
			borderColor: customTheme.borderColor || '#000000',
			outsideborderColor: customTheme.outsideborderColor || '#ffffff',
			bodyTextColorCol_1: customTheme.bodyTextColorCol_1,
			bodyTextColorColRest: customTheme.bodyTextColorColRest,
			bodyTextColor: customTheme.bodyTextColor,
			bodyBGColorEven: customTheme.bodyBGColorEven,
			bodyBGColorOdd: customTheme.bodyBGColorOdd,

			borderType: customTheme.borderType,
			borderRadius: customTheme.borderRadius,

			activeColumnColor: customTheme.activeColumnColor,
			activeRowColor: customTheme.activeRowColor,
			activeRowColumnMode: customTheme.activeRowColumnMode,

			hoverModeNone: customTheme.hoverModeNone,
			hoverModeRow: customTheme.hoverModeRow,
			hoverModeColumn: customTheme.hoverModeColumn,

			defaultPagination: customTheme.defaultPagination,
			simplePagination: customTheme.simplePagination,
			modernPagination: customTheme.modernPagination,
			tailwindPagination: customTheme.tailwindPagination,
			outlinedPagination: customTheme.outlinedPagination,

			paginationStyle: customTheme.paginationStyle,
			paginationAciveBtnColor: customTheme.paginationAciveBtnColor,
		};

		setTableSettings( ( prevSettings ) => {
			const updatedThemes = {
				...prevSettings.table_settings.import_styles_theme_colors,
			};
			if ( currentThemeName !== customTheme.name ) {
				delete updatedThemes[ currentThemeName ];
			}
			updatedThemes[ customTheme.name ] = newThemeColors;

			return {
				...prevSettings,
				table_settings: {
					...prevSettings.table_settings,
					import_styles_theme_colors: updatedThemes,
				},
			};
		} );

		resetCustomTheme();
		handleClosePopup();
	};

	const resetCustomTheme = () => {
		setCustomTheme( {
			name: '',
			headerBGColor: '',
			headerTextColor: '',
			bodyBGColor: '',
			hoverBGColor: '',
			hoverTextColor: '',
			borderColor: '',
			outsideborderColor: '',
			bodyTextColorCol_1: '',
			bodyTextColorColRest: '',
			bodyTextColor: '',
			bodyBGColorEven: '',
			bodyBGColorOdd: '',
			borderType: '',
			borderRadius: '',

			activeColumnColor: false,
			activeRowColor: true,
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
			paginationAciveBtnColor: '',
		} );
		setIsEditing( false );
		setCurrentThemeName( '' );
	};

	/**
	 *
	 * @param style Handle theme selection
	 * @returns
	 */
	const handleThemeClick = ( style ) => {
		if ( ! isProActive() ) {
			return;
		}
		setTableSettings( {
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				table_style: style,
			},
		} );
	};

	const handleMouseEnter = ( style ) => {
		setIsHovered( style );
	};

	const handleMouseLeave = () => {
		setIsHovered( null );
	};

	const handleCustomthememodal = ( style ) => {
		if ( ! isProActive() ) {
			return;
		}
		if ( style === 'swptls-new-theme' ) {
			setCustomThemeModal( true );
		}
	};

	return (
		<div>
			{ /* Import modal  */ }
			{ importModal && (
				<Modal>
					<div
						className="import-style-modal-wrap modal-content"
						ref={ confirmImportRef }
					>
						<div
							className="cross_sign"
							onClick={ handleCloseImportStylemodal }
						>
							{ Cross }
						</div>
						<div className="import-style-modal">
							<h2>{ getStrings( 'are-you-sure-to-disable' ) }</h2>
							<p>{ getStrings( 'imported-style-desc' ) }</p>
							<div className="action-buttons">
								<button
									className="swptls-button cancel-button"
									onClick={ handleCloseImportStylemodal }
								>
									{ getStrings( 'Cancel' ) }
								</button>
								<button
									className="swptls-button confirm-button"
									onClick={ handleDisableImportStyle }
								>
									{ getStrings( 'yes-disable' ) }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }

			{ /* Theme Create and Edit modal  */ }
			{ customThemeModal && (
				<Modal>
					<div className="import-style-modal-wrap modal-content theme-create-edit">
						<div
							className="cross_sign left-back"
							onClick={ handleClosePopup }
						>
							{ Cross }
						</div>
						<div
							className="import-style-modal"
							ref={ customThemeRef }
						>
							<h2 className="heading-title">
								<span
									className="back-btn"
									onClick={ handleClosePopup }
								>
									{ Backbtn }
								</span>{ ' ' }
								{ isEditing
									? 'Edit Custom Theme'
									: 'Create Custom Theme' }
							</h2>
							<div className="custom-theme-field-group name-field">
								<label htmlFor="custom-theme-name-field">
									{ getStrings( 'theme-name' ) }
								</label>
								<input
									className="customThemename"
									type="text"
									id="custom-theme-name-field"
									name="name"
									placeholder="Enter Your Theme Name"
									value={ customTheme.name }
									onChange={ handleCustomThemeChange }
								/>

								{ ! isEditing && themeNameError && (
									<div className="error-message">
										Name already used, please use another
										name for theme
									</div>
								) }

								{ emptyNameError && (
									<div className="error-message">
										Name field can not be empty
									</div>
								) }
							</div>

							<h4 className="title-divider">
								{ getStrings( 'theme-colors' ) }
							</h4>

							<div className="theme-colors">
								<div className="theme-design-modal">
									{ /* Header Colors  */ }
									<div className="theme-colors__palette">
										<h4 className="theme-colors__title text-uppercase">
											{ getStrings(
												'header-color-title'
											) }
										</h4>

										<div className="theme-colors__scheme">
											<input
												className="color-picker headerBGColor"
												type="color"
												name="headerBGColor"
												id="color-picker-headerBGColor"
												value={
													customTheme.headerBGColor ||
													'#ffffff'
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-headerBGColor">
												{ getStrings( 'bg-color' ) }
											</label>
										</div>
										<div className="theme-colors__scheme">
											<input
												className="color-picker headerTextColor"
												type="color"
												name="headerTextColor"
												id="color-picker-headerTextColor"
												value={
													customTheme.headerTextColor ||
													'#000000'
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-headerTextColor">
												{ getStrings( 'txt-color' ) }
											</label>
										</div>
									</div>

									{ /* border color  */ }
									<div className="theme-colors__palette">
										<h4 className="theme-colors__title text-uppercase">
											{ getStrings( 'border-title' ) }
										</h4>

										<div className="theme-colors__scheme">
											<input
												className="color-picker borderColor"
												type="color"
												name="borderColor"
												id="color-picker-borderColor"
												value={
													customTheme.borderColor ||
													'#000000'
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-borderColor">
												{ getStrings(
													'inside-border-color'
												) }
											</label>
										</div>
										<div className="theme-colors__scheme">
											<input
												className="color-picker outsideborderColor"
												type="color"
												name="outsideborderColor"
												id="color-picker-outside-outsideborderColor"
												value={
													customTheme.outsideborderColor ||
													'#ffffff'
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-outside-outsideborderColor">
												Outside border
											</label>
										</div>
									</div>

									{ /* Table Body Text  */ }
									<div className="theme-colors__palette">
										<h4 className="theme-colors__title text-uppercase">
											{ getStrings( 'table-text-title' ) }
										</h4>

										<div className="theme-colors__scheme">
											<input
												className="color-picker bodyTextColorCol_1"
												type="color"
												name="bodyTextColorCol_1"
												id="color-picker-bodyTextColorCol_1"
												value={
													customTheme.bodyTextColorCol_1 ||
													'#333333'
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-bodyTextColorCol_1">
												{ getStrings(
													'first-cl-txt-color'
												) }
											</label>
										</div>

										<div className="theme-colors__scheme">
											<input
												className="color-picker bodyTextColorColRest"
												type="color"
												name="bodyTextColorColRest"
												id="color-picker-bodyTextColorColRest"
												value={
													customTheme.bodyTextColorColRest ||
													'#6b6b6b'
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-bodyTextColorColRest">
												{ getStrings(
													'rest-txt-color'
												) }
											</label>
										</div>
									</div>

									{ /* Body Colors  */ }
									<div className="theme-colors__palette body-colors">
										<h4 className="theme-colors__title text-uppercase">
											{ getStrings( 'body-title' ) }
										</h4>

										{ customTheme.activeRowColumnMode ===
											false && (
											<div className="theme-colors__scheme">
												<input
													className="color-picker bodyBGColor"
													type="color"
													name="bodyBGColor"
													id="color-picker-bodyBGColor"
													value={
														customTheme.bodyBGColor
													}
													onChange={
														handleCustomThemeChange
													}
												/>
												<label htmlFor="color-picker-bodyBGColor">
													{ getStrings(
														'table-bg-color'
													) }
												</label>
											</div>
										) }

										{ /* Toggle for active row and column  */ }
										<div className="edit-form-group active-rowcol-style">
											<label
												className={ `${
													! isProActive()
														? `swptls-pro-settings`
														: ``
												}` }
												htmlFor="active-rowcol-style"
											>
												<div className="toggle-switch">
													<input
														type="hidden"
														name="activeRowColumnMode"
														value={
															customTheme.activeRowColumnMode
																? 'enabled'
																: 'disabled'
														}
													/>
													<input
														type="checkbox"
														id="active-rowcol-style"
														name="activeRowColumnMode"
														checked={
															customTheme.activeRowColumnMode
														}
														onChange={
															handleCustomThemeChange
														}
													/>
													<div className="slider round"></div>
												</div>
												{ getStrings(
													'enable-row-column-ordering'
												) }{ ' ' }
												<Tooltip
													content={ getStrings(
														'tooltip-50'
													) }
												/>{ ' ' }
											</label>
										</div>

										{ customTheme.activeRowColumnMode ===
											true && (
											<>
												{ /* Selection Row and Column  */ }
												<div
													className={ `edit-form-group` }
												>
													<h4>
														<span
															className={ `${
																! isProActive()
																	? ` swptls-pro-settings`
																	: ``
															}` }
														>
															{ getStrings(
																'select-coloring'
															) }{ ' ' }
															<Tooltip
																content={ getStrings(
																	'tooltip-51'
																) }
															/>{ ' ' }
														</span>
													</h4>

													<div
														className={ `utility-checkbox-wrapper${
															! isProActive()
																? ` swptls-pro-settings`
																: ``
														}` }
													>
														<label
															className={ `utility-checkboxees${
																customTheme.activeRowColor
																	? ' active'
																	: ''
															}` }
															htmlFor="active_row_color_id"
														>
															<input
																type="checkbox"
																id="active_row_color_id"
																name="activeRowColor"
																checked={
																	customTheme.activeRowColor
																}
																onChange={
																	handleCustomThemeChange
																}
															/>
															<span>
																{ getStrings(
																	'active-row-colors'
																) }{ ' ' }
																<Tooltip
																	content={ getStrings(
																		'tooltip-53'
																	) }
																/>
															</span>
															<div
																className={ `control__indicator${
																	customTheme.activeRowColor
																		? ' active'
																		: ''
																}` }
															></div>
														</label>

														<label
															className={ `utility-checkboxees${
																customTheme.activeColumnColor
																	? ' active'
																	: ''
															}` }
															htmlFor="active_column_color_id"
														>
															<input
																type="checkbox"
																id="active_column_color_id"
																name="activeColumnColor"
																checked={
																	customTheme.activeColumnColor
																}
																onChange={
																	handleCustomThemeChange
																}
															/>
															<span>
																{ getStrings(
																	'active-column-colors'
																) }{ ' ' }
																<Tooltip
																	content={ getStrings(
																		'tooltip-52'
																	) }
																/>
															</span>
															<div
																className={ `control__indicator${
																	customTheme.activeColumnColor
																		? ' active'
																		: ''
																}` }
															></div>
														</label>
													</div>
												</div>

												{ /* Color plate  */ }
												<div className="column-row-selection">
													{ /* Column Mode  */ }
													{ customTheme.activeColumnColor ===
														true && (
														<div className="column-mode-parent">
															<div className="theme-colors__scheme">
																<input
																	className="color-picker bodyBGColorEven"
																	type="color"
																	name="bodyBGColorEven"
																	id="color-picker-column-bodyBGColorEven"
																	value={
																		customTheme.bodyBGColorEven
																	}
																	onChange={
																		handleCustomThemeChange
																	}
																/>
																<label htmlFor="color-picker-column-bodyBGColorEven">
																	{ getStrings(
																		'even-column-color'
																	) }
																</label>
															</div>
															<div className="theme-colors__scheme">
																<input
																	className="color-picker bodyBGColorOdd"
																	type="color"
																	name="bodyBGColorOdd"
																	id="color-picker-column-bodyBGColorOdd"
																	value={
																		customTheme.bodyBGColorOdd
																	}
																	onChange={
																		handleCustomThemeChange
																	}
																/>
																<label htmlFor="color-picker-column-bodyBGColorOdd">
																	{ getStrings(
																		'odd-column-color'
																	) }
																</label>
															</div>
														</div>
													) }

													{ /* Row mode  */ }

													{ customTheme.activeRowColor ===
														true && (
														<div className="row-mode-parent">
															<div className="theme-colors__scheme">
																<input
																	className="color-picker bodyBGColorEven"
																	type="color"
																	name="bodyBGColorEven"
																	id="color-picker-bodyBGColorEven"
																	value={
																		customTheme.bodyBGColorEven
																	}
																	onChange={
																		handleCustomThemeChange
																	}
																/>
																<label htmlFor="color-picker-bodyBGColorEven">
																	{ getStrings(
																		'even-row-color'
																	) }
																</label>
															</div>
															<div className="theme-colors__scheme">
																<input
																	className="color-picker bodyBGColorOdd"
																	type="color"
																	name="bodyBGColorOdd"
																	id="color-picker-bodyBGColorOdd"
																	value={
																		customTheme.bodyBGColorOdd
																	}
																	onChange={
																		handleCustomThemeChange
																	}
																/>
																<label htmlFor="color-picker-bodyBGColorOdd">
																	{ getStrings(
																		'odd-row-color'
																	) }
																</label>
															</div>
														</div>
													) }
												</div>
											</>
										) }
									</div>

									{ /* Hover mode  */ }

									<div className="theme-colors__palette hover-mode-customization">
										<h4 className="theme-colors__title text-uppercase">
											{ getStrings(
												'table-hover-title'
											) }
										</h4>
										{ /* Hover Mode  */ }
										<div className={ `edit-form-group` }>
											<h4>
												<span
													className={ `${
														! isProActive()
															? ` swptls-pro-settings`
															: ``
													}` }
												>
													{ getStrings(
														'hover-mode'
													) }{ ' ' }
												</span>
											</h4>

											<div
												className={ `utility-checkbox-wrapper${
													! isProActive()
														? ` swptls-pro-settings`
														: ``
												}` }
											>
												<label
													className={ `utility-checkboxees${
														customTheme.hoverModeNone
															? ' active'
															: ''
													}` }
													htmlFor="hover_mode_none"
												>
													<input
														type="checkbox"
														id="hover_mode_none"
														name="hoverModeNone"
														checked={
															customTheme.hoverModeNone
														}
														onChange={
															handleCustomHovermodeChange
														}
													/>
													<span>
														{ getStrings( 'none' ) }
													</span>
													<div
														className={ `control__indicator${
															customTheme.hoverModeNone
																? ' active'
																: ''
														}` }
													></div>
												</label>

												<label
													className={ `utility-checkboxees${
														customTheme.hoverModeRow
															? ' active'
															: ''
													}` }
													htmlFor="hover_mode_row"
												>
													<input
														type="checkbox"
														id="hover_mode_row"
														name="hoverModeRow"
														checked={
															customTheme.hoverModeRow
														}
														onChange={
															handleCustomHovermodeChange
														}
													/>
													<span>
														{ getStrings(
															'row-wise'
														) }
													</span>
													<div
														className={ `control__indicator${
															customTheme.hoverModeRow
																? ' active'
																: ''
														}` }
													></div>
												</label>

												<label
													className={ `utility-checkboxees${
														customTheme.hoverModeColumn
															? ' active'
															: ''
													}` }
													htmlFor="hover_mode_column"
												>
													<input
														type="checkbox"
														id="hover_mode_column"
														name="hoverModeColumn"
														checked={
															customTheme.hoverModeColumn
														}
														onChange={
															handleCustomHovermodeChange
														}
													/>
													<span>
														{ getStrings(
															'col-wise'
														) }
													</span>
													<div
														className={ `control__indicator${
															customTheme.hoverModeColumn
																? ' active'
																: ''
														}` }
													></div>
												</label>
											</div>
										</div>

										<div className="theme-colors__scheme">
											<input
												className="color-picker hoverBGColor"
												type="color"
												name="hoverBGColor"
												id="color-picker-hoverBGColor"
												value={
													customTheme.hoverBGColor
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-hoverBGColor">
												{ getStrings( 'hover-color' ) }
											</label>
										</div>

										{ /* Hover Text color  */ }

										{ /* {!customTheme.hoverModeColumn === true && ( */ }
										<div className="theme-colors__scheme">
											<input
												className="color-picker hoverTextColor"
												type="color"
												name="hoverTextColor"
												id="color-picker-hoverTextColor"
												value={
													customTheme.hoverTextColor
												}
												onChange={
													handleCustomThemeChange
												}
											/>
											<label htmlFor="color-picker-hoverTextColor">
												{ getStrings(
													'hover-text-color'
												) }
											</label>
										</div>
										{ /* )} */ }
									</div>

									{ /* Add more  */ }
								</div>

								<h4 className="title-divider">
									{ getStrings( 'border-style-title' ) }
								</h4>
								<div className="border-styles">
									<div className="border-styles__field-group">
										<label htmlFor="border-type">
											{ getStrings(
												'outside-border-type'
											) }
										</label>
										<select
											className="borderType"
											id="border-type"
											name="borderType"
											value={ customTheme.borderType }
											onChange={ handleCustomThemeChange }
										>
											<option value="solid">
												{ getStrings( 'solid-border' ) }
											</option>
											<option value="rounded">
												{ getStrings(
													'rounded-border'
												) }
											</option>
										</select>
									</div>
									<div className="border-styles__field-group">
										<label htmlFor="border-radius">
											{ getStrings( 'border-radius' ) }
										</label>
										<input
											className="border-radius borderRadius"
											placeholder="10px"
											type="text"
											id="border-radius"
											name="borderRadius"
											value={ customTheme.borderRadius }
											onChange={ handleCustomThemeChange }
										/>
									</div>
								</div>

								{ /* Paginations  */ }
								<div className="pagination-section">
									<h4
										className="title-divider"
										onClick={ () =>
											toggleSection( 'pagination' )
										}
									>
										{ getStrings( 'pg-style' ) }{ ' ' }
										<span
											className={ `accordion-icon ${
												activeSection === 'pagination'
													? 'open'
													: ''
											}` }
										>
											<svg
												width="11"
												height="7"
												viewBox="0 0 11 7"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M5.34058e-05 1.81036C-0.00034523 1.93843 0.0255585 2.06498 0.0758619 2.1807C0.126165 2.29641 0.199591 2.39836 0.290741 2.47905L5.00458 6.61979C5.14516 6.74589 5.32149 6.81482 5.50346 6.81482C5.68544 6.81482 5.86177 6.74589 6.00235 6.61979L10.7162 2.33331C10.8766 2.18779 10.9775 1.97869 10.9967 1.752C11.0158 1.5253 10.9517 1.29959 10.8183 1.12452C10.685 0.949446 10.4933 0.839348 10.2856 0.818448C10.0779 0.797547 9.87101 0.867555 9.71057 1.01307L5.49954 4.84519L1.2885 1.14167C1.17318 1.03683 1.03276 0.970241 0.883841 0.949769C0.734923 0.929297 0.583747 0.955802 0.448202 1.02615C0.312658 1.09649 0.198417 1.20774 0.118997 1.34671C0.0395756 1.48569 -0.00169945 1.64658 5.34058e-05 1.81036Z"
													fill="#1E1E1E"
												/>
											</svg>
										</span>
									</h4>

									<div
										className={ `info-section ${
											activeSection === 'pagination'
												? 'open'
												: ''
										}` }
									>
										<div className="section-header">
											{ activeSection ===
												'pagination' && (
												<Pagination
													customTheme={ customTheme }
													handlePaginationModeChange={
														handlePaginationModeChange
													}
													handleCustomThemeChange={
														handleCustomThemeChange
													}
												/>
											) }
										</div>
									</div>
								</div>

								{ /* Actions button to save theme  */ }
								<div className="action-buttons">
									<button
										className="swptls-button cancel-button"
										onClick={ handleClosePopup }
									>
										{ getStrings( 'Cancel' ) }
									</button>
									<button
										className={ `swptls-button confirm-button ${
											themeNameError ? 'name-erros' : ''
										}` }
										onClick={
											isEditing
												? handleSaveEditedTheme
												: handleAddCustomTheme
										}
										// disabled={!customTheme.name}
									>
										{ isEditing
											? getStrings( 'update-changes' )
											: getStrings( 'add-theme' ) }
									</button>
								</div>
							</div>
						</div>
					</div>
				</Modal>
			) }

			{ /* Active Theme Delete warning Error Modal */ }
			{ activeThemeErrorModal && (
				<Modal>
					<div className="import-style-modal-wrap modal-content theme-delete-warning-modal">
						<div
							className="cross_sign"
							onClick={ handleClosePopup }
						>
							{ Cross }
						</div>
						<div className="import-style-modal delete-modal">
							<h3>{ getStrings( 'theme-alert-delete' ) }</h3>
							<p>{ getStrings( 'theme-delete-notice' ) }</p>

							<div className="action-btn">
								<button
									className="delete-warning"
									onClick={ handleCloseActiveThemeErrorModal }
								>
									{ getStrings( 'merge-confirm' ) }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }

			{ /* Delete Confirmation Modal */ }
			{ deleteConfirmationModal && (
				<Modal>
					<div className="import-style-modal-wrap modal-content theme-delete-warning-modal">
						<div
							className="cross_sign"
							onClick={ handleClosePopup }
						>
							{ Cross }
						</div>
						<div className="import-style-modal delete-modal">
							<h3>
								{ getStrings( 'confirmation-theme-delete' ) }
							</h3>
							<p>
								{ getStrings(
									'confirmation-theme-delete-notice'
								) }
							</p>

							<div className="action-btn">
								<button
									className="delete-cancle"
									onClick={
										handleCloseDeleteConfirmationModal
									}
								>
									{ getStrings( 'Cancel' ) }
								</button>
								<button
									className="delete-confirm"
									onClick={ handleConfirmDeleteTheme }
								>
									{ getStrings( 'yes-delete' ) }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }

			<div className="edit-table-customization-wrap">
				<div className="edit-form-group">
					<div className="table-customization-theme-wrapper">
						<div className={ `edit-form-group table-style` }>
							<label
								className={ `${
									! isProActive() ? `swptls-pro-settings` : ``
								}` }
								htmlFor="table-style"
							>
								<div className="toggle-switch">
									<input
										type="hidden"
										name="import_styles"
										value={
											tableSettings?.table_settings
												?.import_styles
										}
									/>
									<input
										type="checkbox"
										id="table-style"
										checked={
											tableSettings?.table_settings
												?.import_styles
										}
										onChange={ handleImportStyle }
										disabled={ ! isProActive() }
									/>
									<div className="slider round"></div>
								</div>
								{ getStrings( 'import-color-from-sheet' ) }{ ' ' }
								<Tooltip
									content={ getStrings( 'tooltip-40' ) }
								/>{ ' ' }
							</label>
							<span className="import-tooltip">
								{ ! isProActive() && (
									<button className="btn-pro">
										{ getStrings( 'pro' ) }
									</button>
								) }
							</span>
						</div>

						{ /* Theme  */ }
						<h4>
							{ getStrings( 'select-theme' ) }{ ' ' }
							<Tooltip
								content={ `Quickly change your table's look and feel using themes` }
							/>
						</h4>

						{ tableSettings?.table_settings?.import_styles && (
							<>
								<div className="invalid-card has--import-enabled">
									<label className="import-enabled">
										<span className="icon">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="14"
												height="15"
												viewBox="0 0 14 15"
												fill="none"
											>
												<path
													d="M7 0.5C5.61553 0.5 4.26216 0.910543 3.11101 1.67971C1.95987 2.44888 1.06266 3.54213 0.532846 4.82122C0.00303299 6.1003 -0.13559 7.50776 0.134506 8.86563C0.404603 10.2235 1.07129 11.4708 2.05026 12.4497C3.02922 13.4287 4.2765 14.0954 5.63437 14.3655C6.99224 14.6356 8.3997 14.497 9.67879 13.9672C10.9579 13.4373 12.0511 12.5401 12.8203 11.389C13.5895 10.2378 14 8.88447 14 7.5C13.998 5.64409 13.2599 3.86475 11.9476 2.55242C10.6353 1.24009 8.85592 0.50196 7 0.5ZM6.73077 3.73077C6.89052 3.73077 7.04668 3.77814 7.1795 3.86689C7.31233 3.95564 7.41585 4.08178 7.47698 4.22937C7.53811 4.37696 7.55411 4.53936 7.52294 4.69603C7.49178 4.85271 7.41485 4.99663 7.3019 5.10959C7.18894 5.22254 7.04502 5.29947 6.88834 5.33063C6.73167 5.3618 6.56927 5.3458 6.42168 5.28467C6.27409 5.22354 6.14795 5.12001 6.0592 4.98719C5.97045 4.85437 5.92308 4.69821 5.92308 4.53846C5.92308 4.32425 6.00817 4.11881 6.15965 3.96734C6.31112 3.81586 6.51656 3.73077 6.73077 3.73077ZM7.53846 11.2692C7.25285 11.2692 6.97893 11.1558 6.77696 10.9538C6.575 10.7518 6.46154 10.4779 6.46154 10.1923V7.5C6.31873 7.5 6.18177 7.44327 6.08079 7.34229C5.97981 7.24131 5.92308 7.10435 5.92308 6.96154C5.92308 6.81873 5.97981 6.68177 6.08079 6.58079C6.18177 6.47981 6.31873 6.42308 6.46154 6.42308C6.74716 6.42308 7.02108 6.53654 7.22304 6.7385C7.425 6.94046 7.53846 7.21438 7.53846 7.5V10.1923C7.68127 10.1923 7.81823 10.249 7.91921 10.35C8.0202 10.451 8.07692 10.588 8.07692 10.7308C8.07692 10.8736 8.0202 11.0105 7.91921 11.1115C7.81823 11.2125 7.68127 11.2692 7.53846 11.2692Z"
													fill="#FF8023"
												/>
											</svg>
										</span>

										<span>
											{ getStrings( 'theme-alert' ) }
										</span>
									</label>
								</div>
							</>
						) }

						{ /* Default Style - default-style = new name: Simple  */ }
						<div
							className={ `table-customization-theme ${
								tableSettings?.table_settings?.import_styles
									? 'active_sheetstyle'
									: 'disable_sheetstyle'
							}` }
						>
							<button
								className={ `single-theme ${
									tableSettings?.table_settings
										?.table_style === 'default-style'
										? ' active'
										: ''
								}` }
								onClick={ () =>
									setTableSettings( {
										...tableSettings,
										table_settings: {
											...tableSettings.table_settings,
											table_style: 'default-style',
										},
									} )
								}
							>
								<div className="media">
									<img
										src={ theme_one_default_style }
										alt="theme_one_default_style"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings( 'Simple' ) }
											</div>
										</div>
									</div>
								</div>
							</button>

							{ /* Dark Table - style-4 : new name: Simple on dark*/ }
							<button
								className={ `single-theme${
									tableSettings?.table_settings
										?.table_style === 'style-4'
										? ' active'
										: ''
								}` }
								onClick={ () =>
									setTableSettings( {
										...tableSettings,
										table_settings: {
											...tableSettings.table_settings,
											table_style: 'style-4',
										},
									} )
								}
							>
								<div className="media">
									<img
										src={ theme_three_dark_table }
										alt="theme_three_dark_table"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings( 'Dark-Table' ) }
											</div>
										</div>
									</div>
								</div>
							</button>

							{ /* PRO Theme  */ }

							{ /* Vertical style place on last  */ }

							{ /* Minimal new styke - style-6 : new name: Minimal */ }
							<button
								className={ `single-theme${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-6'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-6' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-6' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_minimal_six_hovered_style }
										alt="theme_minimal_six_hovered_style"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'minimal-simple-style'
												) }
											</div>
										</div>
									</div>
									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
										<span className="theme-new-tags">
											{ getStrings( 'new' ) }
										</span>
									</div>
								</div>
								{ isHovered === 'style-6' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Stripped Table style-2 : new name: Minimal on dark */ }
							<button
								className={ `single-theme${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-2'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-2' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-2' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_two_stripped_table }
										alt="theme_two_stripped_table"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'minimal-Table'
												) }
											</div>
										</div>
									</div>

									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags single-pro">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
									</div>
								</div>
								{ isHovered === 'style-2' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Hover Style - style-3: new name: minimal-elegant-style */ }
							<button
								className={ `single-theme${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-3'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-3' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-3' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_six_hovered_style }
										alt="theme_six_hovered_style"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'minimal-elegant-style'
												) }
											</div>
										</div>
									</div>
									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags single-pro">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
									</div>
								</div>

								{ isHovered === 'style-3' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Taliwind Style - style-5 : new name: Uppercase-heading*/ }
							<button
								className={ `single-theme${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-5'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-5' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-5' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_four_tailwind_style }
										alt="theme_four_tailwind_style"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'Uppercase-heading'
												) }
											</div>
										</div>
									</div>
									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags single-pro">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
									</div>
								</div>
								{ isHovered === 'style-5' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Uppercase elegant style new style - style-8 : new name: Uppercase elegant */ }
							<button
								className={ `single-theme${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-8'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-8' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-8' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_uppercase_elegant_style }
										alt="theme_uppercase_elegant_style"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'uppercase-elegant-theme'
												) }
											</div>
										</div>
									</div>
									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
										<span className="theme-new-tags">
											{ getStrings( 'new' ) }
										</span>
									</div>
								</div>
								{ isHovered === 'style-8' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Colored Column - style-1 : new name: vertical-style */ }
							<button
								className={ `single-theme${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-1'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-1' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-1' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_five_colored_column }
										alt="theme_five_colored_column"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'vertical-style'
												) }
											</div>
										</div>
									</div>
									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags single-pro">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
									</div>
								</div>
								{ isHovered === 'style-1' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Dark Style new style - style-7 : new name: Dark */ }
							<button
								className={ `single-theme ${
									! isProActive() ? ` swptls-pro-theme` : ``
								} ${
									tableSettings?.table_settings
										?.table_style === 'style-7'
										? 'active'
										: ''
								}` }
								onClick={ () => handleThemeClick( 'style-7' ) }
								onMouseEnter={ () =>
									handleMouseEnter( 'style-7' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="media">
									<img
										src={ theme_dark_knight_style }
										alt="theme_dark_knight_style"
									/>
								</div>
								<div className="text">
									<div className="top">
										<div className="label">
											<div className="radio-field"></div>
											<div className="label-title">
												{ getStrings(
													'dark-style-theme'
												) }
											</div>
										</div>
									</div>
									<div className="bottom">
										{ ! isProActive() && (
											<span className="theme-pro-tags">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
										<span className="theme-new-tags">
											{ getStrings( 'new' ) }
										</span>
									</div>
								</div>
								{ isHovered === 'style-7' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>

							{ /* Add new theme here below */ }

							{ /* Render existing themes */ }
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
								// .sort()
								.map( ( themeName, index ) => (
									<button
										key={ index }
										className={ `single-theme new-custom-theme${
											tableSettings?.table_settings
												?.table_style === themeName
												? ' active'
												: ''
										}` }
										onClick={ () =>
											handleThemeClick( themeName )
										}
										onMouseEnter={ () =>
											handleMouseEnter( themeName )
										}
										onMouseLeave={ handleMouseLeave }
									>
										<div className="text">
											<div className="top">
												<div className="label">
													<div className="radio-field"></div>
													<div className="label-title">
														{ themeName }
													</div>
													<div className="action">
														<div className="action-icon-wrapper">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="3"
																height="13"
																viewBox="0 0 3 13"
																fill="none"
															>
																<path
																	d="M0.700195 11.1649C0.700195 10.8599 0.821356 10.5674 1.03702 10.3518C1.25269 10.1361 1.5452 10.0149 1.8502 10.0149C2.15519 10.0149 2.4477 10.1361 2.66337 10.3518C2.87903 10.5674 3.0002 10.8599 3.0002 11.1649C3.0002 11.4699 2.87903 11.7624 2.66337 11.9781C2.4477 12.1938 2.15519 12.3149 1.8502 12.3149C1.5452 12.3149 1.25269 12.1938 1.03702 11.9781C0.821356 11.7624 0.700195 11.4699 0.700195 11.1649ZM0.700195 6.56494C0.700195 6.25994 0.821356 5.96744 1.03702 5.75177C1.25269 5.5361 1.5452 5.41494 1.8502 5.41494C2.15519 5.41494 2.4477 5.5361 2.66337 5.75177C2.87903 5.96744 3.0002 6.25994 3.0002 6.56494C3.0002 6.86994 2.87903 7.16245 2.66337 7.37811C2.4477 7.59378 2.15519 7.71494 1.8502 7.71494C1.5452 7.71494 1.25269 7.59378 1.03702 7.37811C0.821356 7.16245 0.700195 6.86994 0.700195 6.56494ZM0.700195 1.96494C0.700195 1.65994 0.821356 1.36744 1.03702 1.15177C1.25269 0.936102 1.5452 0.814941 1.8502 0.814941C2.15519 0.814941 2.4477 0.936102 2.66337 1.15177C2.87903 1.36744 3.0002 1.65994 3.0002 1.96494C3.0002 2.26994 2.87903 2.56245 2.66337 2.77811C2.4477 2.99378 2.15519 3.11494 1.8502 3.11494C1.5452 3.11494 1.25269 2.99378 1.03702 2.77811C0.821356 2.56245 0.700195 2.26994 0.700195 1.96494Z"
																	fill="#828282"
																/>
															</svg>
														</div>
														<div className="action-dropdown-menu">
															<button
																className="theme-actions-buttons action-edit"
																onClick={ (
																	e
																) => {
																	e.stopPropagation();
																	handleEditTheme(
																		themeName
																	);
																} }
															>
																{ getStrings(
																	'edit-theme'
																) }
															</button>
															<button
																className="theme-actions-buttons action-delete"
																onClick={ (
																	e
																) => {
																	e.stopPropagation();
																	handleDeleteTheme(
																		themeName
																	);
																} }
															>
																{ getStrings(
																	'Delete'
																) }
															</button>
														</div>
													</div>
												</div>
											</div>
											<div className="bottom">
												<div className="icon-wrapper">
													<svg
														width="66"
														height="65"
														viewBox="0 0 66 65"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<circle
															cx="33"
															cy="32.5"
															r="32.5"
															fill={
																tableSettings
																	?.table_settings
																	?.import_styles_theme_colors?.[
																	themeName
																]
																	?.headerBGColor ||
																'#ffffff'
															}
														/>
														<path
															d="M33 48C30.9645 48 28.949 47.5991 27.0684 46.8201C25.1879 46.0412 23.4792 44.8995 22.0398 43.4602C19.133 40.5533 17.5 36.6109 17.5 32.5C17.5 28.3891 19.133 24.4467 22.0398 21.5398C24.9467 18.633 28.8891 17 33 17C41.525 17 48.5 23.2 48.5 30.95C48.5 33.4165 47.5202 35.782 45.7761 37.5261C44.032 39.2702 41.6665 40.25 39.2 40.25H36.41C35.945 40.25 35.635 40.56 35.635 41.025C35.635 41.18 35.79 41.335 35.79 41.49C36.41 42.265 36.72 43.195 36.72 44.125C36.875 46.295 35.17 48 33 48ZM33 20.1C29.7113 20.1 26.5573 21.4064 24.2319 23.7319C21.9064 26.0573 20.6 29.2113 20.6 32.5C20.6 35.7887 21.9064 38.9427 24.2319 41.2681C26.5573 43.5936 29.7113 44.9 33 44.9C33.465 44.9 33.775 44.59 33.775 44.125C33.775 43.815 33.62 43.66 33.62 43.505C33 42.73 32.69 41.955 32.69 41.025C32.69 38.855 34.395 37.15 36.565 37.15H39.2C40.8443 37.15 42.4213 36.4968 43.5841 35.3341C44.7468 34.1713 45.4 32.5943 45.4 30.95C45.4 24.905 39.82 20.1 33 20.1ZM24.475 29.4C25.715 29.4 26.8 30.485 26.8 31.725C26.8 32.965 25.715 34.05 24.475 34.05C23.235 34.05 22.15 32.965 22.15 31.725C22.15 30.485 23.235 29.4 24.475 29.4ZM29.125 23.2C30.365 23.2 31.45 24.285 31.45 25.525C31.45 26.765 30.365 27.85 29.125 27.85C27.885 27.85 26.8 26.765 26.8 25.525C26.8 24.285 27.885 23.2 29.125 23.2ZM36.875 23.2C38.115 23.2 39.2 24.285 39.2 25.525C39.2 26.765 38.115 27.85 36.875 27.85C35.635 27.85 34.55 26.765 34.55 25.525C34.55 24.285 35.635 23.2 36.875 23.2ZM41.525 29.4C42.765 29.4 43.85 30.485 43.85 31.725C43.85 32.965 42.765 34.05 41.525 34.05C40.285 34.05 39.2 32.965 39.2 31.725C39.2 30.485 40.285 29.4 41.525 29.4Z"
															fill="white"
														/>
													</svg>
												</div>
											</div>
										</div>

										{ isHovered === themeName &&
											! isProActive() && (
												<div className="btn-pro-lock theme-lock-blur">
													{ lockBTN }
												</div>
											) }
									</button>
								) ) }

							{ /* Add new theme button */ }
							<button
								className="single-theme add-new-theme"
								onClick={ () =>
									handleCustomthememodal( 'swptls-new-theme' )
								}
								onMouseEnter={ () =>
									handleMouseEnter( 'swptls-new-theme' )
								}
								onMouseLeave={ handleMouseLeave }
							>
								<div className="text-center">
									<div className="icon-wrapper">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="23"
											viewBox="0 0 24 23"
											fill="none"
										>
											<path
												d="M12 23C10.4898 23 8.99438 22.7025 7.59914 22.1246C6.2039 21.5467 4.93615 20.6996 3.86827 19.6317C1.7116 17.4751 0.5 14.55 0.5 11.5C0.5 8.45001 1.7116 5.52494 3.86827 3.36827C6.02494 1.2116 8.95001 0 12 0C18.325 0 23.5 4.6 23.5 10.35C23.5 12.18 22.773 13.935 21.479 15.229C20.185 16.523 18.43 17.25 16.6 17.25H14.53C14.185 17.25 13.955 17.48 13.955 17.825C13.955 17.94 14.07 18.055 14.07 18.17C14.53 18.745 14.76 19.435 14.76 20.125C14.875 21.735 13.61 23 12 23ZM12 2.3C9.56001 2.3 7.21995 3.26928 5.49462 4.99462C3.76928 6.71995 2.8 9.06001 2.8 11.5C2.8 13.94 3.76928 16.28 5.49462 18.0054C7.21995 19.7307 9.56001 20.7 12 20.7C12.345 20.7 12.575 20.47 12.575 20.125C12.575 19.895 12.46 19.78 12.46 19.665C12 19.09 11.77 18.515 11.77 17.825C11.77 16.215 13.035 14.95 14.645 14.95H16.6C17.82 14.95 18.99 14.4654 19.8527 13.6027C20.7154 12.74 21.2 11.57 21.2 10.35C21.2 5.865 17.06 2.3 12 2.3ZM5.675 9.2C6.595 9.2 7.4 10.005 7.4 10.925C7.4 11.845 6.595 12.65 5.675 12.65C4.755 12.65 3.95 11.845 3.95 10.925C3.95 10.005 4.755 9.2 5.675 9.2ZM9.125 4.6C10.045 4.6 10.85 5.405 10.85 6.325C10.85 7.245 10.045 8.05 9.125 8.05C8.205 8.05 7.4 7.245 7.4 6.325C7.4 5.405 8.205 4.6 9.125 4.6ZM14.875 4.6C15.795 4.6 16.6 5.405 16.6 6.325C16.6 7.245 15.795 8.05 14.875 8.05C13.955 8.05 13.15 7.245 13.15 6.325C13.15 5.405 13.955 4.6 14.875 4.6ZM18.325 9.2C19.245 9.2 20.05 10.005 20.05 10.925C20.05 11.845 19.245 12.65 18.325 12.65C17.405 12.65 16.6 11.845 16.6 10.925C16.6 10.005 17.405 9.2 18.325 9.2Z"
												fill="#34A0FA"
											/>
										</svg>
									</div>
									<div className="title">
										{ getStrings( '+new-theme' ) }
									</div>

									<div className="new-theme-tags">
										{ ! isProActive() && (
											<span className="theme-pro-tags">
												{ lockpro }
												{ ` ` }
												{ getStrings( 'pro' ) }
											</span>
										) }
										<span className="theme-new-tags">
											{ getStrings( 'new' ) }
										</span>
									</div>
								</div>

								{ isHovered === 'swptls-new-theme' &&
									! isProActive() && (
										<div className="btn-pro-lock theme-lock-blur">
											{ lockBTN }
										</div>
									) }
							</button>
						</div>

						{ /* END  */ }
					</div>

					<div
						className={ `theme-customization-options-parent ${
							tableSettings?.table_settings?.import_styles
								? 'active_sheetstyle'
								: 'disable_sheetstyle'
						}` }
					>
						<ThemeCustomization
							tableSettings={ tableSettings }
							setTableSettings={ setTableSettings }
						/>
						{ ! isProActive() && (
							<div className="btn-pro-lock theme-lock-blur">
								{ lockBTN }
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default ThemeSettings;
