import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import Column from '../core/Column';
import Row from '../core/Row';
import Title from '../core/Title';
import DataSource from './DataSource';
import ConditionalView from './ConditionalView';
import ThemeSettings from './ThemeSettings';
import TableCustomization from './TableCustomization';
import RowSettings from './RowSettings';
import DataTable from 'datatables.net-dt';
import {
	getNonce,
	getStrings,
	isProActive,
	setPdfUrl,
	handleTableAppearance,
} from '../Helpers';
import {
	OrangeCopyIcon,
	Cross,
	Cloud,
	Merge,
	PaginationTailwindBack1,
	PaginationTainwildNext1,
	PaginationTailwindBack2,
	PaginationTainwildNext2,
} from '../icons';
import Modal from './../core/Modal';

import './../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css';
import '../styles/_editTable.scss';
import '../styles/_frontend.scss';
import '../styles/_create_table.scss';

import { toast } from 'react-toastify';

function EditTable() {
	const { id } = useParams();
	const sheetUrlRef = useRef();
	const verticalModelRef = useRef();
	const [ loader, setLoader ] = useState< boolean >( false );
	const [ verticalmodal, setVerticalmodal ] = useState< boolean >( false );
	const [ previewLoader, setPreviewLoader ] = useState< boolean >( false );

	const [ privatesheetmessage, setPrivateSheetmessage ] = useState( false );
	const [ limitedtmessage, setLimitedmessage ] = useState( false );

	const [ hidingContext, setHidingContext ] = useState(
		localStorage.getItem( 'third_active_tab' ) || 'columns'
	);
	const [ copySuccess, setCopySuccess ] = useState( false );

	//Main parent tabs
	const [ activeTab, setActiveTab ] = useState(
		localStorage.getItem( 'active_tab' ) || 'data_source'
	);

	//Second
	const [ secondActiveTabs, setSecondActiveTabs ] = useState(
		localStorage.getItem( 'second_active_tab' ) || 'layout'
	);

	//Third Row
	const [ thirdActiveTabs, setThirdActiveTabs ] = useState< string >(
		localStorage.getItem( 'third_active_tab' ) || 'columns'
	);

	//Third Row
	const [ forthActiveTabs, setForthActiveTabs ] = useState< string >(
		localStorage.getItem( 'forth_active_tab' ) || 'conditional_view'
	);

	const handleSetActiveTab = ( key ) => {
		setActiveTab( key );
		localStorage.setItem( 'active_tab', key );

		// Reset thirdActiveTabs when changing main tabs, except when moving to 'conditional_view'
		if ( key !== 'conditional_view' ) {
			setThirdActiveTabs( 'columns' );
			localStorage.setItem( 'third_active_tab', 'columns' );
		}

		// Reset forthActiveTabs if necessary
		if ( key !== 'conditional_view' ) {
			setForthActiveTabs( 'conditional_view' );
			localStorage.setItem( 'forth_active_tab', 'conditional_view' );
		}

		if ( key === 'data_source' || key === 'theme_settings' ) {
			setSecondActiveTabs( 'layout' );
			localStorage.setItem( 'second_active_tab', 'layout' );

			if ( key !== 'conditional_view' ) {
				setThirdActiveTabs( 'columns' );
				localStorage.setItem( 'third_active_tab', 'columns' );
			}
		}
	};

	const handleSetsecondTab = ( key ) => {
		setSecondActiveTabs( key );
		localStorage.setItem( 'second_active_tab', key );
	};

	// Callback function to update secondActiveTab in EditTable component
	const updateSecondActiveTab = ( tab ) => {
		setSecondActiveTabs( tab );
	};

	// Callback function to update thirdActiveTab in EditTable component
	const updateThirdActiveTab = ( tab ) => {
		setThirdActiveTabs( tab );
	};

	const [ tableSettings, setTableSettings ] = useState( {} );

	const [ previewClasses, setPreviewClasses ] =
		useState( 'mode-hide-columns' );

	const [ previewModeClasses, setPreviewModeClasses ] =
		useState( 'columns-desktop' );

	const [ tablePreview, setTablePreview ] = useState();
	const [ paginated, setPaginated ] = useState( false );

	const [ openDropdown, setOpenDropdown ] = useState( false );
	const [ openDropdownShortCode, setOpenDropdownShortCode ] =
		useState( false );

	const getTitleForTab = ( tab ) => {
		switch ( tab ) {
			case 'data_source':
				return getStrings( 'data-source-title' );
			case 'theme_settings':
				return getStrings( 'table-theme-title' );
			case 'table_customization':
				return getStrings( 'tc-title' );
			case 'row_settings':
				return getStrings( 'hide-row-col-title' );
			case 'conditional_view':
				return getStrings( 'conditional-view-title' );
			default:
				return getStrings( 'data-source-title' );
		}
	};

	const handleNext = () => {
		const mainTabs = [
			'data_source',
			'theme_settings',
			'table_customization',
			'row_settings',
			'conditional_view',
		];
		const secondTabs = [ 'layout', 'utility', 'style' ];
		const thirdTabs = [ 'columns', 'rows', 'cells' ];

		const currentMainIndex = mainTabs.indexOf( activeTab );

		if ( activeTab === 'table_customization' ) {
			const currentSecondIndex = secondTabs.indexOf( secondActiveTabs );
			if ( currentSecondIndex < secondTabs.length - 1 ) {
				// Move to next second-level tab
				const nextSecondTab = secondTabs[ currentSecondIndex + 1 ];
				setSecondActiveTabs( nextSecondTab );
				localStorage.setItem( 'second_active_tab', nextSecondTab );
			} else {
				// Completed second-level tabs, move to 'row_settings'
				handleSetActiveTab( 'row_settings' );
			}
		} else if ( activeTab === 'row_settings' ) {
			const currentThirdIndex = thirdTabs.indexOf( thirdActiveTabs );
			if ( currentThirdIndex < thirdTabs.length - 1 ) {
				// Move to next third-level tab
				const nextThirdTab = thirdTabs[ currentThirdIndex + 1 ];
				setThirdActiveTabs( nextThirdTab );
				localStorage.setItem( 'third_active_tab', nextThirdTab );
			} else {
				// Completed third-level tabs, move to 'conditional_view'
				handleSetActiveTab( 'conditional_view' );
			}
		} else {
			if ( currentMainIndex < mainTabs.length - 1 ) {
				// Move to next main tab
				handleSetActiveTab( mainTabs[ currentMainIndex + 1 ] );

				// Reset secondActiveTabs if moving to 'table_customization'
				if (
					mainTabs[ currentMainIndex + 1 ] === 'table_customization'
				) {
					handleSetsecondTab( 'layout' );
				}
			} else {
				// Optionally handle end of navigation
				console.log( 'End of navigation.' );
			}
		}
	};

	const handleBack = () => {
		const mainTabs = [
			'data_source',
			'theme_settings',
			'table_customization',
			'row_settings',
			'conditional_view',
		];
		const secondTabs = [ 'layout', 'utility', 'style' ];
		const thirdTabs = [ 'columns', 'rows', 'cells' ];

		const currentMainIndex = mainTabs.indexOf( activeTab );

		if ( activeTab === 'conditional_view' ) {
			// Move back to 'row_settings' and set to last third-level tab
			handleSetActiveTab( 'row_settings' );
			setThirdActiveTabs( 'cells' );
			localStorage.setItem( 'third_active_tab', 'cells' );
		} else if ( activeTab === 'row_settings' ) {
			const currentThirdIndex = thirdTabs.indexOf( thirdActiveTabs );
			if ( currentThirdIndex > 0 ) {
				// Move to previous third-level tab
				const prevThirdTab = thirdTabs[ currentThirdIndex - 1 ];
				setThirdActiveTabs( prevThirdTab );
				localStorage.setItem( 'third_active_tab', prevThirdTab );
			} else {
				// Move back to 'table_customization'
				handleSetActiveTab( 'table_customization' );
				setSecondActiveTabs( 'style' ); // Optionally, set to last second-level tab
				localStorage.setItem( 'second_active_tab', 'style' );
			}
		} else if ( activeTab === 'table_customization' ) {
			const currentSecondIndex = secondTabs.indexOf( secondActiveTabs );
			if ( currentSecondIndex > 0 ) {
				// Move to previous second-level tab
				const prevSecondTab = secondTabs[ currentSecondIndex - 1 ];
				setSecondActiveTabs( prevSecondTab );
				localStorage.setItem( 'second_active_tab', prevSecondTab );
			} else {
				// Move back to previous main tab
				if ( currentMainIndex > 0 ) {
					handleSetActiveTab( mainTabs[ currentMainIndex - 1 ] );
				}
			}
		} else {
			if ( currentMainIndex > 0 ) {
				// Move back to previous main tab
				handleSetActiveTab( mainTabs[ currentMainIndex - 1 ] );
			}
		}
	};

	const getTableData = () => {
		setLoader( true );

		wp.ajax.send( 'swptls_edit_table', {
			data: {
				nonce: getNonce(),
				id,
			},
			success( response ) {
				setTableSettings( {
					...response,
					id,
				} );

				getTablePreview( response );
				setLoader( false );
			},
			error( error ) {
				console.error( error );
			},
		} );
	};

	/**
	 * Paginations
	 */
	const theme = tableSettings?.table_settings?.table_style || 'default-style';
	const paginationStyle =
		tableSettings?.table_settings?.import_styles_theme_colors?.[ theme ]
			?.paginationStyle || 'default_pagination';

	const getPaginateSettings = ( style ) => {
		const paginationStyle =
			tableSettings?.table_settings?.import_styles_theme_colors?.[ theme ]
				?.paginationStyle || 'default_pagination';

		if ( paginationStyle === 'default_pagination' ) {
			return {
				first: `<span class='paging-first-${ style }'>${ getStrings(
					'first'
				) }</span>`,
				previous: `<span class='paging-backward-${ style }'>${ getStrings(
					'previous'
				) }</span>`,
				next: `<span class='paging-forward-${ style }'>${ getStrings(
					'next'
				) }</span>`,
				last: `<span class='paging-last-${ style }'>${ getStrings(
					'last'
				) }</span>`,
			};
		} else {
			return {
				first: `<span class='paging-first-${ style }'>${ getStrings(
					'first'
				) }</span>`,
				previous: `<span class='paging-backward-${ style }'>‹</span>`,
				next: `<span class='paging-forward-${ style }'>›</span>`,
				last: `<span class='paging-last-${ style }'>${ getStrings(
					'last'
				) }</span>`,
			};
		}
	};

	const getTablePreview = ( values ) => {
		setPreviewLoader( true );
		wp.ajax.send( 'swptls_get_table_preview', {
			data: {
				nonce: getNonce(),
				...values,
				table_settings: JSON.stringify( values.table_settings ),
				id,
			},
			success( response ) {
				setTablePreview( {
					...response,
				} );

				setPreviewLoader( false );

				if ( response.is_private ) {
					setPrivateSheetmessage( response.is_private );
				}
				// console.log(response.is_private)

				let dom = `<"#filtering_input"lf>rt<"#bottom_options"ip>`;

				if ( isProActive() ) {
					dom = `B<"#filtering_input"lf>rt<"#bottom_options"ip>`;
				}

				if ( ! previewLoader ) {
					const tableOptions = {
						pageLength: parseInt(
							values.table_settings.default_rows_per_page
						),
						dom,
						ordering: values.table_settings.allow_sorting,

						order: values.table_settings.allow_sorting ? [] : [],
						// order: [[2, 'desc']],
						/* order: values.table_settings.allow_singleshort
							? [[(values.table_settings.columnnumber ? values.table_settings.columnnumber - 1 : 0), values.table_settings.sorting_mode ? values.table_settings.sorting_mode : 'desc']]
							: (values.table_settings.allow_sorting ? [] : []), */

						lengthMenu: [
							[ 1, 5, 10, 15, 30, 50 ],
							[
								getStrings( '1' ),
								getStrings( '5' ),
								getStrings( '10' ),
								getStrings( '15' ),
								getStrings( '30' ),
								getStrings( '50' ),
							],
						],
						language: {
							search: getStrings( 'search' ),
							searchPlaceholder: getStrings( 'search-items' ),
							lengthMenu:
								getStrings( 'filtering_show' ) +
								' _MENU_ ' +
								getStrings( 'filtering_entries' ),
							info:
								getStrings( 'dataTables_info_showing' ) +
								' _START_ ' +
								getStrings( 'dataTables_info_to' ) +
								' _END_ ' +
								getStrings( 'dataTables_info_of' ) +
								' _TOTAL_ ' +
								getStrings( 'filtering_entries' ),
							emptyTable: getStrings( 'data-empty-notice' ),
							zeroRecords: getStrings( 'data-empty-notice' ),
							paginate: getPaginateSettings( paginationStyle ),
						},
						buttons: [
							{
								text: `<img src="${ SWPTLS_APP.icons.curlyBrackets }" />`,
								className:
									'ui inverted button transition hidden json_btn',

								action: function ( e, dt, button, config ) {
									var data = dt.buttons.exportData();
									var json = JSON.stringify( data );
									var blob = new Blob( [ json ], {
										type: 'application/json',
									} );
									var url = URL.createObjectURL( blob );

									// Create a link element
									var link = document.createElement( 'a' );
									link.href = url;
									link.download = `${ values.table_name }.json`;

									// Append the link to the document body and trigger the click event
									document.body.appendChild( link );
									link.click();

									// Cleanup
									document.body.removeChild( link );
									URL.revokeObjectURL( url );
								},

								titleAttr: getStrings( 'export-json' ),
							},
							{
								text: `<img src="${ SWPTLS_APP.icons.fileCSV }" />`,
								extend: 'csv',
								className:
									'ui inverted button transition hidden csv_btn',
								title: `${ values.table_name }`,
								titleAttr: getStrings( 'export-csv' ),
							},
							{
								text: `<img src="${ SWPTLS_APP.icons.fileExcel }" />`,
								extend: 'excel',
								className:
									'ui inverted button transition hidden excel_btn',
								title: `${ values.table_name }`,
								titleAttr: getStrings( 'export-excel' ),
							},
							{
								text: `<img src="${ SWPTLS_APP.icons.printIcon }" />`,
								extend: 'print',
								className:
									'ui inverted button transition hidden print_btn',
								title: `${ values.table_name }`,
								titleAttr: getStrings( 'print' ),
							},
							{
								text: `<img src="${ SWPTLS_APP.icons.copySolid }" />`,
								extend: 'copy',
								className:
									'ui inverted button transition hidden copy_btn',
								title: `${ values.table_name }`,
								titleAttr: getStrings( 'copy' ),
							},
						],
					};

					// Making sorting on Clicking - correct ordering
					const container =
						document.querySelector( '#create_tables' );
					// Event listener for column sorting
					if ( container ) {
						const numberOfColumns =
							container.querySelectorAll( 'thead th' ).length;
						// Track the sorting order for each column
						const sortingOrders = Array.from(
							{ length: numberOfColumns },
							() => 'asc'
						);

						container.addEventListener(
							'click',
							function ( event ) {
								const target = event.target;

								// Check if the click is on a th element
								if ( target.tagName === 'TH' ) {
									const columnIndex = target.cellIndex;

									if ( sortingOrders ) {
										// Toggle sorting order for the clicked column
										sortingOrders[ columnIndex ] =
											sortingOrders[ columnIndex ] ===
											'asc'
												? 'desc'
												: 'asc';

										// Clear the existing sorting order
										window.swptlsDataTable.order( [] );

										// Apply sorting to the clicked column with the updated order
										window.swptlsDataTable
											.order( [
												columnIndex,
												sortingOrders[ columnIndex ],
											] )
											.draw();
									}
								}
							}
						);
					}

					if ( isProActive() ) {
						tableOptions.lengthMenu = [
							[ 1, 5, 10, 15, 30, 50, 100, -1 ],
							[
								getStrings( '1' ),
								getStrings( '5' ),
								getStrings( '10' ),
								getStrings( '15' ),
								getStrings( '30' ),
								getStrings( '50' ),
								getStrings( '100' ),
								getStrings( 'All' ),
							],
						];
					}

					if ( values.table_settings.vertical_scrolling ) {
						tableOptions.scrollY = `${ values.table_settings.vertical_scrolling }px`;
					}

					window.swptlsDataTable = new DataTable(
						'#create_tables',
						tableOptions
					);

					if ( isProActive() ) {
						setPdfUrl( values?.source_url );
					}
				}
			},
			error( error ) {
				toast.error( error.message );
				setTablePreview( '' );
				setPreviewLoader( false );
			},
		} );
	};

	const handleClosePopup = () => {
		setVerticalmodal( false );
	};

	function handleCancelOutside( event: MouseEvent ) {
		if (
			verticalModelRef.current &&
			! verticalModelRef.current.contains( event.target )
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

	const handleTableSettingsSave = ( e ) => {
		e.preventDefault();

		delete tableSettings.output;
		delete tableSettings.table_data;
		delete tableSettings.message;
		delete tableSettings.table_columns;
		delete tableSettings.id;

		wp.ajax.send( 'swptls_save_table', {
			data: {
				nonce: getNonce(),
				id,
				settings: JSON.stringify( tableSettings ),
			},
			success( response ) {
				setTableSettings( {
					...response,
				} );

				if ( ! previewLoader ) {
					getTablePreview( response );
				}

				toast.success( 'Settings saved successfully.' );
			},
			error( error ) {},
		} );
	};

	const handleUpdateTableandRedirect = ( e ) => {
		e.preventDefault();

		delete tableSettings.output;
		delete tableSettings.table_data;
		delete tableSettings.message;
		delete tableSettings.table_columns;
		delete tableSettings.id;

		wp.ajax.send( 'swptls_save_table', {
			data: {
				nonce: getNonce(),
				id,
				settings: JSON.stringify( tableSettings ),
			},
			success( response ) {
				toast.success( 'Settings saved successfully.' );
				const baseUrl = window.location.href.replace(
					/\/tables.*/,
					''
				);
				window.location.replace( baseUrl );
			},
			error( error ) {},
		} );
	};

	useEffect( () => {
		getTableData();

		if ( ! isProActive() ) {
			/* toast.warning(
				<>
					{ getStrings( 'live-sync-is-limited' ) }
					<a target="blank" href="https://go.wppool.dev/DoC">
						{ getStrings( 'upgrade-pro' ) }
					</a>{ ' ' }
					{ getStrings( 'for-showing-full' ) }
				</>
			); */
			setLimitedmessage( true );
		}
	}, [] );

	// Hiding feature
	useEffect( () => {
		if ( ! previewLoader ) {
			const container = document.querySelector(
				'.gswpts_tables_container'
			);
			if ( ! container ) return; // Check if the container exists
			const table = window?.swptlsDataTable?.table().node();

			if ( ! table || activeTab !== 'row_settings' ) {
				return;
			}

			if ( table ) {
				const handleClick = ( event ) => {
					const target = event.target;
					const currentNode = target.nodeName;
					if ( ! isProActive() ) {
						return false;
					}

					// Update isDesktop and isMobile based on the current state
					const isColumnsDesktop =
						container.classList.contains( 'columns-desktop' );
					const isColumnsMobile =
						container.classList.contains( 'columns-mobile' );
					const isColumnAutomode =
						container.classList.contains( 'auto-columns-mode' );

					const isRowDesktop =
						container.classList.contains( 'rows-desktop' );
					const isRowsMobile =
						container.classList.contains( 'rows-mobile' );
					const isRowAutomode =
						container.classList.contains( 'auto-rows-mode' );

					const isCellDesktop =
						container.classList.contains( 'cells-desktop' );
					const isCellsMobile =
						container.classList.contains( 'cells-mobile' );
					const isCellAutomode =
						container.classList.contains( 'auto-cells-mode' );

					// Determine the hiding context mode based on the current platform.
					let hidingContextMode;
					if ( isColumnsDesktop ) {
						hidingContextMode = 'columns-desktop';
					} else if ( isColumnsMobile ) {
						hidingContextMode = 'columns-mobile';
					} else if ( isColumnAutomode ) {
						hidingContextMode = 'auto-columns-mode';
					} else if ( isRowDesktop ) {
						hidingContextMode = 'rows-desktop';
					} else if ( isRowsMobile ) {
						hidingContextMode = 'rows-mobile';
					} else if ( isRowAutomode ) {
						hidingContextMode = 'auto-rows-mode';
					} else if ( isCellDesktop ) {
						hidingContextMode = 'cells-desktop';
					} else if ( isCellsMobile ) {
						hidingContextMode = 'cells-mobile';
					} else if ( isCellAutomode ) {
						hidingContextMode = 'auto-cells-mode';
					} else {
						hidingContextMode = 'columns-desktop';
					}

					switch ( hidingContextMode ) {
						case 'columns-desktop':
							// Handle hiding columns for desktop
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'columns':
										// Check if the clicked element is a table cell
										if ( target.nodeName === 'TD' ) {
											const columnIndex =
												target.cellIndex;
											let hiddenColumnsDesktop = [
												...( tableSettings
													?.table_settings
													?.hide_column || [] ),
											];

											if (
												hiddenColumnsDesktop.includes(
													columnIndex
												)
											) {
												hiddenColumnsDesktop =
													hiddenColumnsDesktop.filter(
														( item ) =>
															item !== columnIndex
													);
												target.classList.remove(
													'hidden-column'
												);
											} else {
												hiddenColumnsDesktop.push(
													columnIndex
												);
												target.classList.add(
													'hidden-column'
												);
											}

											const cells =
												table.querySelectorAll(
													`td:nth-child(${
														columnIndex + 1
													})`
												);
											cells.forEach( ( cell ) => {
												cell.classList.toggle(
													'hidden-column',
													hiddenColumnsDesktop.includes(
														columnIndex
													)
												);
											} );

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings?.table_settings,
													hide_column:
														hiddenColumnsDesktop,
												},
											} );
										}
										break;
								}
							}
							break;

						case 'columns-mobile':
							// Handle hiding columns for mobile
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'columns':
										// Check if the clicked element is a table cell
										if ( target.nodeName === 'TD' ) {
											const columnIndex =
												target.cellIndex;
											let hiddenColumnsMobile = [
												...( tableSettings
													?.table_settings
													?.hide_column_mobile ||
													[] ),
											];

											if (
												hiddenColumnsMobile.includes(
													columnIndex
												)
											) {
												hiddenColumnsMobile =
													hiddenColumnsMobile.filter(
														( item ) =>
															item !== columnIndex
													);
												target.classList.remove(
													'hidden-column-mobile'
												);
											} else {
												hiddenColumnsMobile.push(
													columnIndex
												);
												target.classList.add(
													'hidden-column-mobile'
												);
											}

											const cells =
												table.querySelectorAll(
													`td:nth-child(${
														columnIndex + 1
													})`
												);
											cells.forEach( ( cell ) => {
												cell.classList.toggle(
													'hidden-column-mobile',
													hiddenColumnsMobile.includes(
														columnIndex
													)
												);
											} );

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings?.table_settings,
													hide_column_mobile:
														hiddenColumnsMobile,
												},
											} );
										}
										break;
								}
							}
							break;

						case 'auto-columns-mode':
							// Handle hiding columns for mobile
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'columns':
										// Check if the clicked element is a table cell
										if ( target.nodeName === 'TD' ) {
											// Get the column index of the clicked cell
											const columnIndex =
												target.cellIndex;

											// console.log(columnIndex);

											let hiddenColumnsDesktop = [
												...( tableSettings
													?.table_settings
													?.hide_column || [] ),
											];
											let hiddenColumnsMobile = [
												...( tableSettings
													?.table_settings
													?.hide_column_mobile ||
													[] ),
											];

											if (
												hiddenColumnsDesktop.includes(
													columnIndex
												)
											) {
												hiddenColumnsDesktop =
													hiddenColumnsDesktop.filter(
														( item ) =>
															item !== columnIndex
													);
												target.classList.remove(
													'hidden-column'
												);
											} else {
												hiddenColumnsDesktop.push(
													columnIndex
												);
												target.classList.add(
													'hidden-column'
												);
											}
											if (
												hiddenColumnsMobile.includes(
													columnIndex
												)
											) {
												hiddenColumnsMobile =
													hiddenColumnsMobile.filter(
														( item ) =>
															item !== columnIndex
													);
												target.classList.remove(
													'hidden-column'
												);
											} else {
												hiddenColumnsMobile.push(
													columnIndex
												);
												target.classList.add(
													'hidden-column'
												);
											}

											// Toggle 'hidden' class on every cell in the column
											const cells =
												table.querySelectorAll(
													`td:nth-child(${
														columnIndex + 1
													})`
												);
											cells.forEach( ( cell ) => {
												cell.classList.toggle(
													'hidden-column',
													hiddenColumnsDesktop.includes(
														columnIndex
													)
												);
											} );
											cells.forEach( ( cell ) => {
												cell.classList.toggle(
													'hidden-column',
													hiddenColumnsMobile.includes(
														columnIndex
													)
												);
											} );

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings?.table_settings,
													hide_column:
														hiddenColumnsDesktop,
												},
											} );

											setTableSettings(
												( prevSettings ) => ( {
													...prevSettings,
													table_settings: {
														...prevSettings?.table_settings,
														hide_column_mobile:
															hiddenColumnsMobile,
													},
												} )
											);
										}
										break;
								}
							}
							break;

						// ROW

						case 'rows-desktop':
							// Handle hiding columns for desktop
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'rows':
										// Handle hiding rows for desktop
										if ( currentNode === 'TD' ) {
											const row = target.parentNode;
											const rowIndex = target.dataset.row;
											let hiddenRowsDesktop = [
												...( tableSettings
													?.table_settings
													?.hide_rows || [] ),
											];

											if (
												hiddenRowsDesktop.includes(
													rowIndex
												)
											) {
												hiddenRowsDesktop =
													hiddenRowsDesktop.filter(
														( item ) =>
															item !== rowIndex
													);
												row.classList.remove(
													'hidden-row'
												);
											} else {
												hiddenRowsDesktop.push(
													rowIndex
												);
												row.classList.add(
													'hidden-row'
												);
											}

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings.table_settings,
													hide_rows:
														hiddenRowsDesktop,
												},
											} );
										}
										break;
								}
							}
							break;

						case 'rows-mobile':
							// Handle hiding columns for mobile
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'rows':
										// Handle hiding rows for mobile
										if ( currentNode === 'TD' ) {
											const row = target.parentNode;
											const rowIndex = target.dataset.row;
											let hiddenRowsMobile = [
												...( tableSettings
													?.table_settings
													?.hide_rows_mobile || [] ),
											];

											if (
												hiddenRowsMobile.includes(
													rowIndex
												)
											) {
												hiddenRowsMobile =
													hiddenRowsMobile.filter(
														( item ) =>
															item !== rowIndex
													);
												row.classList.remove(
													'hidden-row-mobile'
												);
											} else {
												hiddenRowsMobile.push(
													rowIndex
												);
												row.classList.add(
													'hidden-row-mobile'
												);
											}

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings.table_settings,
													hide_rows_mobile:
														hiddenRowsMobile,
												},
											} );
										}
										break;
								}
							}
							break;

						case 'auto-rows-mode':
							// Handle hiding columns for mobile
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'rows':
										// Check if the clicked element is a table cell
										if ( currentNode === 'TD' ) {
											// Get the parent row (tr element)
											const row = target.parentNode;
											const td = target;

											// You can also access the row index of the current row
											const rowIndex = td.dataset.row;

											let hiddenRowsDesktop = [
												...( tableSettings
													?.table_settings
													?.hide_rows || [] ),
											];
											let hiddenRowsMobile = [
												...( tableSettings
													?.table_settings
													?.hide_rows_mobile || [] ),
											];

											if (
												hiddenRowsDesktop.includes(
													rowIndex
												)
											) {
												hiddenRowsDesktop =
													hiddenRowsDesktop.filter(
														( item ) =>
															item !== rowIndex
													);
												row.classList.remove(
													'hidden-row'
												);
											} else {
												hiddenRowsDesktop.push(
													rowIndex
												);
												row.classList.add(
													'hidden-row'
												);
											}

											if (
												hiddenRowsMobile.includes(
													rowIndex
												)
											) {
												hiddenRowsMobile =
													hiddenRowsMobile.filter(
														( item ) =>
															item !== rowIndex
													);
												row.classList.remove(
													'hidden-row'
												);
											} else {
												hiddenRowsMobile.push(
													rowIndex
												);
												row.classList.add(
													'hidden-row'
												);
											}

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings.table_settings,
													hide_rows:
														hiddenRowsDesktop,
												},
											} );

											setTableSettings(
												( prevSettings ) => ( {
													...prevSettings,
													table_settings: {
														...prevSettings.table_settings,
														hide_rows_mobile:
															hiddenRowsMobile,
													},
												} )
											);
										}
										break;
								}
							}
							break;
						// CELLS
						case 'cells-desktop':
							// Handle hiding columns for desktop
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'cells':
										// Handle hiding cells for desktop
										if ( target.nodeName === 'TD' ) {
											const cellIndex =
												target.dataset.index;
											let hiddenCellsDesktop = [
												...( tableSettings
													?.table_settings
													?.hide_cell || [] ),
											];

											if (
												hiddenCellsDesktop.includes(
													cellIndex
												)
											) {
												hiddenCellsDesktop =
													hiddenCellsDesktop.filter(
														( item ) =>
															item !== cellIndex
													);
												target.classList.remove(
													'hidden-cell'
												);
											} else {
												hiddenCellsDesktop.push(
													cellIndex
												);
												target.classList.add(
													'hidden-cell'
												);
											}

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings?.table_settings,
													hide_cell:
														hiddenCellsDesktop,
												},
											} );
										}
										break;
								}
							}
							break;

						case 'cells-mobile':
							// Handle hiding columns for mobile
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'cells':
										// Handle hiding cells for mobile
										if ( target.nodeName === 'TD' ) {
											const cellIndex =
												target.dataset.index;
											let hiddenCellsMobile = [
												...( tableSettings
													?.table_settings
													?.hide_cell_mobile || [] ),
											];

											if (
												hiddenCellsMobile.includes(
													cellIndex
												)
											) {
												hiddenCellsMobile =
													hiddenCellsMobile.filter(
														( item ) =>
															item !== cellIndex
													);
												target.classList.remove(
													'hidden-cell-mobile'
												);
											} else {
												hiddenCellsMobile.push(
													cellIndex
												);
												target.classList.add(
													'hidden-cell-mobile'
												);
											}

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings?.table_settings,
													hide_cell_mobile:
														hiddenCellsMobile,
												},
											} );
										}
										break;
								}
							}
							break;

						case 'auto-cells-mode':
							// Handle hiding columns for mobile
							if ( currentNode === 'TD' ) {
								switch ( hidingContext ) {
									case 'cells':
										// Check if the clicked element is a table cell
										if ( target.nodeName === 'TD' ) {
											const cellIndex =
												target.dataset.index;

											let hiddenCellsDesktop = [
												...( tableSettings
													?.table_settings
													?.hide_cell || [] ),
											];
											let hiddenCellsMobile = [
												...( tableSettings
													?.table_settings
													?.hide_cell_mobile || [] ),
											];

											if (
												hiddenCellsDesktop.includes(
													cellIndex
												)
											) {
												hiddenCellsDesktop =
													hiddenCellsDesktop.filter(
														( item ) =>
															item !== cellIndex
													);
												target.classList.remove(
													'hidden-cell'
												);
											} else {
												hiddenCellsDesktop.push(
													cellIndex
												);
												target.classList.add(
													'hidden-cell'
												);
											}

											if (
												hiddenCellsMobile.includes(
													cellIndex
												)
											) {
												hiddenCellsMobile =
													hiddenCellsMobile.filter(
														( item ) =>
															item !== cellIndex
													);
												target.classList.remove(
													'hidden-cell'
												);
											} else {
												hiddenCellsMobile.push(
													cellIndex
												);
												target.classList.add(
													'hidden-cell'
												);
											}

											setTableSettings( {
												...tableSettings,
												table_settings: {
													...tableSettings?.table_settings,
													hide_cell:
														hiddenCellsDesktop,
												},
											} );

											setTableSettings(
												( prevSettings ) => ( {
													...prevSettings,
													table_settings: {
														...prevSettings.table_settings,
														hide_cell_mobile:
															hiddenCellsMobile,
													},
												} )
											);
										}
										break;
								}
							}
							break;

						default:
						// Handle default case
					}
				};

				table.addEventListener( 'click', handleClick );

				return () => {
					table.removeEventListener( 'click', handleClick );
				};
			}
		}
	}, [ previewLoader, tableSettings, hidingContext, activeTab ] );

	useEffect(
		() => handleTableAppearance( tableSettings.table_settings ),
		[ tableSettings.table_settings, previewLoader ]
	);

	// POPUP
	useEffect( () => {
		const handleClick = () => {
			WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
		};

		const proSettings = document.querySelectorAll(
			'.swptls-pro-settings, .btn-pro-lock'
		);

		// console.log(proSettings)
		proSettings.forEach( ( item ) => {
			item.addEventListener( 'click', handleClick );
		} );

		return () => {
			proSettings.forEach( ( item ) => {
				item.removeEventListener( 'click', handleClick );
			} );
		};
	}, [] );

	const handleClick = () => {
		WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
	};
	const handleVisit = () => {
		window.open( 'https://go.wppool.dev/KfVZ', '_blank' );
	};

	/* const handleCopyShortcode = async (id) => {
		const shortcode = `[gswpts_table id="${id}"]`;

		try {
			await navigator.clipboard.writeText(shortcode);
			setCopySuccess(true);
			toast.success('Shortcode copied successfully.');
			setTimeout(() => {
				setCopySuccess(false);
			}, 1000);
		} catch (err) {
			setCopySuccess(false);
			toast.success('Shortcode copy failed.');
		}
	}; */

	const handleCopyShortcode = async ( id ) => {
		// console.log(id);
		const shortcode = `[gswpts_table id="${ id }"]`;
		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			try {
				await navigator.clipboard.writeText( shortcode );
				setCopySuccess( true );
				toast.success( 'Shortcode copied successfully.' );
				// Reset copySuccess state after 1 second
				setTimeout( () => {
					setCopySuccess( false );
				}, 1000 );
			} catch ( err ) {
				console.error(
					'Failed to copy text using clipboard API: ',
					err
				);
				setCopySuccess( false );
				toast.success( 'Shortcode copy failed.' );
			}
		} else {
			// Fallback method for unsupported browsers
			try {
				const textArea = document.createElement( 'textarea' );
				textArea.value = shortcode;
				textArea.style.position = 'fixed';
				textArea.style.opacity = '0';
				document.body.appendChild( textArea );
				textArea.select();
				textArea.setSelectionRange( 0, textArea.value.length );
				document.execCommand( 'copy' );
				document.body.removeChild( textArea );
				setCopySuccess( true );
				toast.success( 'Shortcode copied successfully.' );
				setTimeout( () => {
					setCopySuccess( false );
				}, 1000 );
			} catch ( err ) {
				console.error( 'Fallback copy method failed: ', err );
				setCopySuccess( false );
				toast.success( 'Shortcode copy failed.' );
			}
		}
	};

	return (
		<div>
			{ loader ? (
				<h2>{ getStrings( 'loading' ) }</h2>
			) : (
				// Tabs desgin
				<>
					<div className="navbar-step">
						<ul className="navbar-step__tab-list">
							<li
								className={ `${
									activeTab === 'data_source' ? 'active' : ''
								}` }
							>
								<a
									onClick={ () =>
										handleSetActiveTab( 'data_source' )
									}
								>
									<span className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="15"
											height="15"
											viewBox="0 0 15 15"
											fill="none"
										>
											<path
												d="M4.68799 9.13283L9.1312 4.68961C9.2087 4.61212 9.3007 4.55065 9.40195 4.50871C9.5032 4.46677 9.61172 4.44518 9.72132 4.44518C9.83091 4.44518 9.93943 4.46677 10.0407 4.50871C10.1419 4.55065 10.2339 4.61212 10.3114 4.68961C10.3889 4.76711 10.4504 4.85911 10.4923 4.96036C10.5343 5.06161 10.5559 5.17013 10.5559 5.27973C10.5559 5.38932 10.5343 5.49784 10.4923 5.59909C10.4504 5.70035 10.3889 5.79235 10.3114 5.86984L5.86822 10.3131C5.71171 10.4696 5.49944 10.5575 5.2781 10.5575C5.05677 10.5575 4.84449 10.4696 4.68799 10.3131C4.53148 10.1565 4.44355 9.94428 4.44355 9.72294C4.44355 9.50161 4.53148 9.28934 4.68799 9.13283ZM13.7827 1.21835C13.0007 0.438159 11.9412 0 10.8366 0C9.73203 0 8.67253 0.438159 7.89057 1.21835L5.79948 3.30736C5.64298 3.46386 5.55505 3.67613 5.55505 3.89747C5.55505 4.11881 5.64298 4.33108 5.79948 4.48759C5.95599 4.64409 6.16826 4.73202 6.3896 4.73202C6.61094 4.73202 6.82321 4.64409 6.97971 4.48759L9.06733 2.40066C9.29945 2.1685 9.57503 1.98432 9.87832 1.85866C10.1816 1.73299 10.5067 1.6683 10.835 1.66827C11.1633 1.66823 11.4884 1.73287 11.7917 1.85847C12.095 1.98408 12.3706 2.1682 12.6028 2.40032C12.835 2.63244 13.0191 2.90801 13.1448 3.21131C13.2705 3.51461 13.3352 3.83968 13.3352 4.16798C13.3352 4.49628 13.2706 4.82137 13.145 5.1247C13.0194 5.42802 12.8353 5.70363 12.6032 5.9358L10.5128 8.02202C10.3563 8.17853 10.2683 8.3908 10.2683 8.61214C10.2683 8.83347 10.3563 9.04574 10.5128 9.20225C10.6693 9.35876 10.8815 9.44669 11.1029 9.44669C11.3242 9.44669 11.5365 9.35876 11.693 9.20225L13.7813 7.11533C14.5619 6.3329 15.0001 5.27268 14.9997 4.16745C14.9993 3.06222 14.5604 2.00232 13.7792 1.22043L13.7827 1.21835ZM8.02179 10.513L5.93417 12.6013C5.702 12.8334 5.42639 13.0176 5.12307 13.1432C4.81975 13.2688 4.49466 13.3334 4.16636 13.3334C3.83806 13.3333 3.51298 13.2686 3.20968 13.143C2.90639 13.0173 2.63081 12.8331 2.39869 12.601C1.9299 12.1321 1.66658 11.4962 1.66664 10.8332C1.66671 10.1701 1.93016 9.53427 2.39904 9.06548L4.48596 6.97787C4.56345 6.90037 4.62493 6.80837 4.66687 6.70712C4.70881 6.60587 4.73039 6.49735 4.73039 6.38775C4.73039 6.27816 4.70881 6.16964 4.66687 6.06839C4.62493 5.96713 4.56345 5.87513 4.48596 5.79764C4.40846 5.72014 4.31646 5.65867 4.21521 5.61673C4.11396 5.57479 4.00544 5.55321 3.89584 5.55321C3.78625 5.55321 3.67773 5.57479 3.57648 5.61673C3.47522 5.65867 3.38322 5.72014 3.30573 5.79764L1.2202 7.88734C0.438853 8.66877 -6.50915e-05 9.72859 7.24039e-09 10.8336C6.5106e-05 11.9387 0.439108 12.9985 1.22054 13.7798C2.00198 14.5611 3.0618 15.0001 4.16685 15C5.2719 14.9999 6.33167 14.5609 7.11301 13.7795L9.19993 11.6918C9.35644 11.5353 9.44437 11.3231 9.44437 11.1017C9.44437 10.8804 9.35644 10.6681 9.19993 10.5116C9.04343 10.3551 8.83115 10.2672 8.60982 10.2672C8.38848 10.2672 8.17621 10.3551 8.0197 10.5116L8.02179 10.513Z"
												fill="#879EB1"
											/>
										</svg>
									</span>

									<span className="text">
										{ getStrings( 'data-source' ) }
									</span>
								</a>
							</li>
							<li
								className={ `${
									activeTab === 'theme_settings'
										? 'active'
										: ''
								}` }
							>
								<a
									onClick={ () =>
										handleSetActiveTab( 'theme_settings' )
									}
								>
									<span className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="15"
											viewBox="0 0 16 15"
											fill="none"
										>
											<path
												d="M8 15C7.01509 15 6.03982 14.806 5.12987 14.4291C4.21993 14.0522 3.39314 13.4997 2.6967 12.8033C1.29018 11.3968 0.5 9.48912 0.5 7.5C0.5 5.51088 1.29018 3.60322 2.6967 2.1967C4.10322 0.790176 6.01088 0 8 0C12.125 0 15.5 3 15.5 6.75C15.5 7.94347 15.0259 9.08807 14.182 9.93198C13.3381 10.7759 12.1935 11.25 11 11.25H9.65C9.425 11.25 9.275 11.4 9.275 11.625C9.275 11.7 9.35 11.775 9.35 11.85C9.65 12.225 9.8 12.675 9.8 13.125C9.875 14.175 9.05 15 8 15ZM8 1.5C6.4087 1.5 4.88258 2.13214 3.75736 3.25736C2.63214 4.38258 2 5.9087 2 7.5C2 9.0913 2.63214 10.6174 3.75736 11.7426C4.88258 12.8679 6.4087 13.5 8 13.5C8.225 13.5 8.375 13.35 8.375 13.125C8.375 12.975 8.3 12.9 8.3 12.825C8 12.45 7.85 12.075 7.85 11.625C7.85 10.575 8.675 9.75 9.725 9.75H11C11.7956 9.75 12.5587 9.43393 13.1213 8.87132C13.6839 8.30871 14 7.54565 14 6.75C14 3.825 11.3 1.5 8 1.5ZM3.875 6C4.475 6 5 6.525 5 7.125C5 7.725 4.475 8.25 3.875 8.25C3.275 8.25 2.75 7.725 2.75 7.125C2.75 6.525 3.275 6 3.875 6ZM6.125 3C6.725 3 7.25 3.525 7.25 4.125C7.25 4.725 6.725 5.25 6.125 5.25C5.525 5.25 5 4.725 5 4.125C5 3.525 5.525 3 6.125 3ZM9.875 3C10.475 3 11 3.525 11 4.125C11 4.725 10.475 5.25 9.875 5.25C9.275 5.25 8.75 4.725 8.75 4.125C8.75 3.525 9.275 3 9.875 3ZM12.125 6C12.725 6 13.25 6.525 13.25 7.125C13.25 7.725 12.725 8.25 12.125 8.25C11.525 8.25 11 7.725 11 7.125C11 6.525 11.525 6 12.125 6Z"
												fill="#879EB1"
											/>
										</svg>
									</span>

									<span className="text">
										{ getStrings( 'table-theme' ) }
									</span>
								</a>
							</li>
							<li
								className={ `${
									activeTab === 'table_customization'
										? 'active'
										: ''
								}` }
							>
								<a
									onClick={ () =>
										handleSetActiveTab(
											'table_customization'
										)
									}
								>
									<span className="icon">
										<svg
											width="16"
											height="15"
											viewBox="0 0 16 15"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M12.5 1.125H3.5C2.46447 1.125 1.625 1.96447 1.625 3V4.65L14.375 4.65V3C14.375 1.96447 13.5355 1.125 12.5 1.125ZM14.375 5.85H10.85V9.15H14.375V5.85ZM9.64996 5.85L6.34996 5.85V9.15L9.64996 9.15V5.85ZM5.14996 5.85H1.625V9.15H5.14996V5.85ZM1.625 12V10.35H5.14996V13.875H3.5C2.46447 13.875 1.625 13.0355 1.625 12ZM6.34996 13.875V10.35L9.64996 10.35V13.875H6.34996ZM10.85 13.875V10.35H14.375V12C14.375 13.0355 13.5355 13.875 12.5 13.875H10.85ZM3.5 0C1.84315 0 0.5 1.34315 0.5 3V12C0.5 13.6569 1.84315 15 3.5 15H12.5C14.1569 15 15.5 13.6569 15.5 12V3C15.5 1.34315 14.1569 0 12.5 0H3.5Z"
												fill="#879EB1"
											/>
										</svg>
									</span>

									<span className="text">
										{ getStrings( 'tc' ) }
									</span>
								</a>
							</li>
							<li
								className={ `${
									activeTab === 'row_settings' ? 'active' : ''
								}` }
							>
								<a
									onClick={ () =>
										handleSetActiveTab( 'row_settings' )
									}
								>
									<span className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="15"
											height="11"
											viewBox="0 0 15 11"
											fill="none"
										>
											<path
												d="M7.5 3.3C8.04249 3.3 8.56276 3.53178 8.94635 3.94436C9.32995 4.35695 9.54545 4.91652 9.54545 5.5C9.54545 6.08348 9.32995 6.64306 8.94635 7.05564C8.56276 7.46822 8.04249 7.7 7.5 7.7C6.95751 7.7 6.43724 7.46822 6.05365 7.05564C5.67005 6.64306 5.45455 6.08348 5.45455 5.5C5.45455 4.91652 5.67005 4.35695 6.05365 3.94436C6.43724 3.53178 6.95751 3.3 7.5 3.3ZM7.5 0C10.9091 0 13.8205 2.28067 15 5.5C13.8205 8.71933 10.9091 11 7.5 11C4.09091 11 1.17955 8.71933 0 5.5C1.17955 2.28067 4.09091 0 7.5 0ZM1.48636 5.5C2.03745 6.71023 2.89316 7.72988 3.95624 8.44305C5.01931 9.15623 6.24709 9.5343 7.5 9.5343C8.75291 9.5343 9.98069 9.15623 11.0438 8.44305C12.1068 7.72988 12.9626 6.71023 13.5136 5.5C12.9626 4.28977 12.1068 3.27012 11.0438 2.55695C9.98069 1.84378 8.75291 1.4657 7.5 1.4657C6.24709 1.4657 5.01931 1.84378 3.95624 2.55695C2.89316 3.27012 2.03745 4.28977 1.48636 5.5Z"
												fill="#879EB1"
											/>
										</svg>
									</span>

									<span className="text">
										{ getStrings( 'hide-row-col' ) }
									</span>
								</a>
							</li>
							{ /* Condition view panel */ }
							<li
								className={ `${
									activeTab === 'conditional_view'
										? 'active'
										: ''
								}` }
							>
								<a
									onClick={ () =>
										handleSetActiveTab( 'conditional_view' )
									}
								>
									<span className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M4.70241 1.28693L3.08245 1.28693C2.06589 1.28693 1.24181 2.11102 1.24181 3.12758L1.24181 4.74733L4.70241 4.74733L4.70241 1.28693ZM5.88042 1.28693V4.74733H9.11968V1.28693H5.88042ZM10.2977 1.28693L10.2977 4.74733L10.4451 4.74733L13.7582 4.74733L13.7582 3.12758C13.7582 2.11102 12.9341 1.28693 11.9175 1.28693H10.2977ZM13.7582 5.92535V6.80887L14.8626 6.80887L14.8626 3.12758C14.8626 1.50108 13.544 0.182544 11.9175 0.182544H3.08245C1.45596 0.182544 0.13742 1.50108 0.13742 3.12758L0.137421 11.9627C0.137421 13.5892 1.45596 14.9077 3.08245 14.9077L6.76374 14.9077V13.8033H5.88042L5.88042 10.3429H6.76389V9.16489H5.88042V5.92535H9.11968V6.80887L10.2977 6.80887V5.92535L10.4451 5.92535L13.7582 5.92535ZM4.70241 13.8033L4.70241 10.3429L1.24181 10.3429L1.24181 11.9627C1.24181 12.9792 2.06589 13.8033 3.08245 13.8033L4.70241 13.8033ZM1.24181 9.16489L4.70241 9.16489V5.92535L1.24181 5.92535V9.16489ZM10.7685 14.1482C10.985 13.7205 11.3865 13.4551 11.7798 13.3539C11.7926 13.3506 11.8053 13.3472 11.818 13.3437C12.2085 13.2355 12.688 13.2648 13.0888 13.5265L13.4814 13.1338C13.2198 12.733 13.1905 12.2535 13.2987 11.8631C13.3001 11.858 13.3015 11.8529 13.3029 11.8478C13.3049 11.8402 13.3069 11.8326 13.3089 11.8249C13.4101 11.4316 13.6755 11.0301 14.1032 10.8136L13.9595 10.2774C13.4817 10.3037 13.0513 10.0899 12.7666 9.79993L12.7525 9.78563L12.7382 9.77146C12.4483 9.48681 12.2344 9.05642 12.2608 8.57861L11.7245 8.43494C11.508 8.86261 11.1065 9.12807 10.7132 9.22924C10.7005 9.23251 10.6877 9.2359 10.6751 9.23942C10.2846 9.34761 9.80507 9.3183 9.40424 9.05664L9.01159 9.44928C9.27326 9.85012 9.30258 10.3296 9.19439 10.7201C9.19088 10.7328 9.18749 10.7455 9.18421 10.7583C9.08305 11.1516 8.8176 11.5531 8.38992 11.7696L8.5336 12.3058C9.01143 12.2794 9.44184 12.4933 9.72652 12.7833L9.74062 12.7975L9.75486 12.8116C10.0448 13.0963 10.2587 13.5267 10.2323 14.0045L10.7685 14.1482ZM9.74177 14.7878C9.43162 14.7046 9.24757 14.3859 9.33067 14.0757C9.39192 13.8471 9.30471 13.6078 9.13586 13.442L9.11589 13.4222L9.0961 13.4023C8.9303 13.2334 8.69097 13.1462 8.46239 13.2074C8.15224 13.2905 7.83345 13.1065 7.75035 12.7963L7.46629 11.7362C7.38324 11.4263 7.56718 11.1077 7.87714 11.0246C8.10598 10.9633 8.26954 10.7677 8.32854 10.5382C8.33318 10.5202 8.33798 10.5022 8.34296 10.4842C8.40614 10.2562 8.36224 10.0053 8.19491 9.83796C7.96807 9.61112 7.96807 9.24334 8.19491 9.01649L8.97146 8.23995C9.19829 8.01311 9.56606 8.01311 9.7929 8.23995C9.96022 8.40728 10.2111 8.45117 10.4392 8.38798C10.4571 8.38301 10.4751 8.37821 10.4931 8.37357C10.7225 8.31456 10.9182 8.151 10.9795 7.92216C11.0626 7.6122 11.3812 7.42825 11.6911 7.51131L12.7513 7.79537C13.0614 7.87847 13.2454 8.19723 13.1623 8.50736C13.1011 8.73593 13.1883 8.97524 13.3572 9.14102L13.3772 9.1609L13.3971 9.18095C13.5629 9.34981 13.8022 9.43701 14.0307 9.37577C14.3409 9.29267 14.6596 9.47671 14.7427 9.78683L15.0268 10.847C15.1098 11.1569 14.9259 11.4755 14.6159 11.5586C14.3871 11.6199 14.2236 11.8156 14.1645 12.045C14.1599 12.063 14.1551 12.081 14.1501 12.099C14.0869 12.327 14.1308 12.5779 14.2982 12.7452C14.525 12.972 14.525 13.3398 14.2982 13.5666L13.5215 14.3432C13.2947 14.57 12.927 14.57 12.7001 14.3432C12.5328 14.1759 12.2819 14.132 12.0539 14.1952C12.0359 14.2001 12.0179 14.2049 11.9999 14.2096C11.7704 14.2686 11.5748 14.4321 11.5135 14.661C11.4304 14.9709 11.1118 15.1549 10.8019 15.0718L9.74177 14.7878ZM11.8338 11.7937C11.533 12.0945 11.0452 12.0945 10.7444 11.7937C10.4436 11.4929 10.4436 11.0051 10.7444 10.7043C11.0452 10.4034 11.533 10.4034 11.8338 10.7043C12.1347 11.0051 12.1347 11.4929 11.8338 11.7937ZM12.3545 12.3143C11.7661 12.9027 10.8122 12.9027 10.2238 12.3143C9.63543 11.7259 9.63543 10.772 10.2238 10.1836C10.8122 9.59528 11.7661 9.59528 12.3545 10.1836C12.9428 10.772 12.9428 11.7259 12.3545 12.3143Z"
												fill="#879EB1"
											/>
										</svg>
										<div className="badge-new-circle"></div>
									</span>

									<span className="text">
										{ getStrings( 'conditional-view' ) }
									</span>
								</a>
							</li>
						</ul>
					</div>

					{ /* Action  */ }
					<div className="table-action">
						{ /* <div className="action-title">Enter details of your Google Sheet</div> */ }
						<div className="action-title">
							{ ' ' }
							{ getTitleForTab( activeTab ) }
						</div>

						<div className="table-action__wrapper">
							<button
								className={ `copy-shortcode btn-shortcode ${
									! copySuccess ? '' : 'btn-success'
								}` }
								onClick={ () => handleCopyShortcode( id ) }
							>
								{ ! copySuccess ? (
									<>
										<span>{ `[gswpts_table="${ id }"]` }</span>
										<div className="icon">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="14"
												height="15"
												viewBox="0 0 14 15"
												fill="none"
											>
												<path
													d="M12.6 0.5H5.6C4.8279 0.5 4.2 1.1279 4.2 1.9V4.7H1.4C0.6279 4.7 0 5.3279 0 6.1V13.1C0 13.8721 0.6279 14.5 1.4 14.5H8.4C9.1721 14.5 9.8 13.8721 9.8 13.1V10.3H12.6C13.3721 10.3 14 9.6721 14 8.9V1.9C14 1.1279 13.3721 0.5 12.6 0.5ZM1.4 13.1V6.1H8.4L8.4014 13.1H1.4ZM12.6 8.9H9.8V6.1C9.8 5.3279 9.1721 4.7 8.4 4.7H5.6V1.9H12.6V8.9Z"
													fill="#666873"
												/>
											</svg>
										</div>
									</>
								) : (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 14 14"
											fill="none"
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M9.67946 13.4688C8.83002 13.8207 7.91943 14.0012 7 14C6.08058 14.0012 5.16998 13.8206 4.32055 13.4688C3.47112 13.1169 2.69959 12.6007 2.0503 11.9497C1.39931 11.3004 0.883055 10.5289 0.531195 9.67946C0.179336 8.83002 -0.00118543 7.91943 5.85779e-06 7C-0.00116625 6.08058 0.179364 5.16998 0.531222 4.32055C0.88308 3.47112 1.39933 2.69959 2.0503 2.0503C2.69959 1.39933 3.47112 0.88308 4.32055 0.531222C5.16998 0.179364 6.08058 -0.00116625 7 5.85779e-06C7.91943 -0.00118543 8.83002 0.179336 9.67946 0.531195C10.5289 0.883055 11.3004 1.39931 11.9497 2.0503C12.6007 2.69959 13.1169 3.47112 13.4688 4.32055C13.8206 5.16998 14.0012 6.08058 14 7C14.0012 7.91943 13.8207 8.83002 13.4688 9.67946C13.1169 10.5289 12.6007 11.3004 11.9497 11.9497C11.3004 12.6007 10.5289 13.1169 9.67946 13.4688ZM10.995 5.39522C11.2683 5.12186 11.2683 4.67864 10.995 4.40527C10.7216 4.13191 10.2784 4.13191 10.005 4.40527L6.29999 8.1103L4.69497 6.50527C4.4216 6.2319 3.97839 6.2319 3.70502 6.50527C3.43165 6.77864 3.43165 7.22185 3.70502 7.49522L5.80502 9.59522C6.07838 9.86859 6.5216 9.86859 6.79497 9.59522L10.995 5.39522Z"
												fill="white"
											/>
										</svg>
										{ getStrings( 'tab-short-copy' ) }
									</>
								) }
							</button>
							<div className="table-action__step">
								<button
									className={ `table-action__prev ${
										activeTab === 'data_source'
											? 'swptls-wizard-disabled'
											: ''
									}` }
									onClick={ handleBack }
								>
									{ /* <button className='table-action__prev' onClick={handleBack}>  */ }
									<span className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="15"
											viewBox="0 0 14 15"
											fill="none"
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M14 7.5C14 7.08579 13.6642 6.75 13.25 6.75L2.56066 6.75L7.28033 2.03033C7.57322 1.73744 7.57322 1.26256 7.28033 0.96967C6.98744 0.676777 6.51256 0.676777 6.21967 0.96967L0.219671 6.96967C-0.0732228 7.26256 -0.0732228 7.73744 0.219671 8.03033L6.21967 14.0303C6.51256 14.3232 6.98744 14.3232 7.28033 14.0303C7.57322 13.7374 7.57322 13.2626 7.28033 12.9697L2.56066 8.25L13.25 8.25C13.6642 8.25 14 7.91421 14 7.5Z"
												fill="#666873"
											/>
										</svg>
									</span>
									<span className="text">
										{ getStrings( 'wiz-back' ) }
									</span>
								</button>
								<button
									className={ `table-action__next ${
										activeTab === 'conditional_view'
											? 'swptls-wizard-disabled'
											: ''
									}` }
									onClick={ handleNext }
								>
									{ /* <button className='table-action__next' onClick={handleNext}> */ }
									<span className="text">
										{ getStrings( 'wiz-next' ) }
									</span>
									<span className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="15"
											viewBox="0 0 14 15"
											fill="none"
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M-2.95052e-07 7.5C-3.13158e-07 7.08579 0.335786 6.75 0.75 6.75L11.4393 6.75L6.71967 2.03033C6.42678 1.73744 6.42678 1.26256 6.71967 0.96967C7.01256 0.676777 7.48744 0.676777 7.78033 0.96967L13.7803 6.96967C14.0732 7.26256 14.0732 7.73744 13.7803 8.03033L7.78033 14.0303C7.48744 14.3232 7.01256 14.3232 6.71967 14.0303C6.42678 13.7374 6.42678 13.2626 6.71967 12.9697L11.4393 8.25L0.75 8.25C0.335786 8.25 -2.76946e-07 7.91421 -2.95052e-07 7.5Z"
												fill="#666873"
											/>
										</svg>
									</span>
								</button>
							</div>
							<div className="table-action__group">
								<div
									className={ `table-action__dropdown ${
										openDropdown ? 'show' : ''
									}` }
								>
									<div className="action-group">
										<button
											onClick={ ( e ) =>
												handleTableSettingsSave( e )
											}
											className="table-action__save"
										>
											Fetch & Save
										</button>
										<span
											onClick={ () =>
												setOpenDropdown(
													! openDropdown
												)
											}
											className="caret-down"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="13"
												height="9"
												viewBox="0 0 13 9"
												fill="none"
											>
												<path
													d="M6.12617 8.31106L0.642609 1.52225C0.551067 1.40898 0.5 1.25848 0.5 1.10199C0.5 0.945487 0.551067 0.794995 0.642609 0.68172L0.648805 0.67441C0.693183 0.619307 0.7466 0.575429 0.805807 0.545446C0.865014 0.515462 0.928773 0.5 0.993206 0.5C1.05764 0.5 1.1214 0.515462 1.1806 0.545446C1.23981 0.575429 1.29323 0.619307 1.33761 0.67441L6.50103 7.06732L11.6624 0.67441C11.7068 0.619307 11.7602 0.575429 11.8194 0.545446C11.8786 0.515462 11.9424 0.5 12.0068 0.5C12.0712 0.5 12.135 0.515462 12.1942 0.545446C12.2534 0.575429 12.3068 0.619307 12.3512 0.67441L12.3574 0.68172C12.4489 0.794995 12.5 0.945487 12.5 1.10199C12.5 1.25848 12.4489 1.40898 12.3574 1.52225L6.87383 8.31106C6.82561 8.37077 6.76761 8.4183 6.70335 8.45078C6.63909 8.48325 6.56991 8.5 6.5 8.5C6.43009 8.5 6.36091 8.48325 6.29665 8.45078C6.23239 8.4183 6.17439 8.37077 6.12617 8.31106Z"
													fill="white"
												/>
											</svg>
										</span>
									</div>

									{ openDropdown ? (
										<div
											onClick={ () =>
												setOpenDropdown( false )
											}
											className="table-action__dropdown-outarea"
										></div>
									) : (
										''
									) }

									<div
										className="table-action__dropdown-menu"
										onClick={ handleUpdateTableandRedirect }
									>
										<a>
											{ getStrings(
												'save-and-move-dashboard'
											) }
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>

					{ /* Edit part  */ }

					<div className="edit-body">
						<div className="tab-card">
							<div
								className={ `edit-tab-content ${
									activeTab === 'table_customization'
										? 'table-customization'
										: activeTab === 'row_settings'
										? 'row_settings'
										: activeTab === 'theme_settings'
										? 'theme_settings'
										: ''
								}` }
							>
								{ 'data_source' === activeTab && (
									<DataSource
										tableSettings={ tableSettings }
										setTableSettings={ setTableSettings }
										sheetUrlRef={ sheetUrlRef }
									/>
								) }

								{ 'theme_settings' === activeTab && (
									<ThemeSettings
										tableSettings={ tableSettings }
										setTableSettings={ setTableSettings }
									/>
								) }

								{ 'table_customization' === activeTab && (
									<TableCustomization
										tableSettings={ tableSettings }
										setTableSettings={ setTableSettings }
										secondActiveTabs={ secondActiveTabs }
										//Next and Prev button update below
										updateSecondActiveTab={
											updateSecondActiveTab
										}
									/>
								) }

								{ 'row_settings' === activeTab && (
									<RowSettings
										tableSettings={ tableSettings }
										setTableSettings={ setTableSettings }
										setPreviewClasses={ setPreviewClasses }
										setPreviewModeClasses={
											setPreviewModeClasses
										}
										hidingContext={ hidingContext }
										setHidingContext={ setHidingContext }
										thirdActiveTabs={ thirdActiveTabs }
										//Next and Prev button update below
										updateThirdActiveTab={
											updateThirdActiveTab
										}
									/>
								) }

								{ 'conditional_view' === activeTab && (
									<ConditionalView
										tableSettings={ tableSettings }
										setTableSettings={ setTableSettings }
									/>
								) }

								{ privatesheetmessage === true ? (
									<>
										<div className="private-sheet-notice-container invalid-download">
											<div className="invalid-card">
												<label className="invalid-download-new">
													<span className="icon">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="16"
															height="15"
															viewBox="0 0 16 15"
															fill="none"
														>
															<path
																d="M1.67982 14.5H14.3202C15.6128 14.5 16.4185 13.1253 15.7722 12.0305L9.45205 1.32111C8.80576 0.226297 7.19424 0.226297 6.54795 1.32111L0.227771 12.0305C-0.418516 13.1253 0.387244 14.5 1.67982 14.5ZM8 8.73784C7.53837 8.73784 7.16067 8.36741 7.16067 7.91467V6.26834C7.16067 5.8156 7.53837 5.44517 8 5.44517C8.46163 5.44517 8.83933 5.8156 8.83933 6.26834V7.91467C8.83933 8.36741 8.46163 8.73784 8 8.73784ZM8.83933 12.0305H7.16067V10.3842H8.83933V12.0305Z"
																fill="#FF8023"
															/>
														</svg>
													</span>
													<span>
														Unable to access the
														Sheet! Please follow the
														instructions below:
													</span>
												</label>

												<div className="text">
													<ol>
														<li>
															On your Google
															Sheet, click on the{ ' ' }
															<button>
																Share
															</button>
															button located at
															the top-right
															corner. Then on the
															popup, choose the{ ' ' }
															<span className="swptls-text-highlight">
																“Anyone with the
																link”
															</span>{ ' ' }
															option under General
															access
														</li>
														<li>
															Click on the
															<span className="icon settings-icon">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="20"
																	height="21"
																	viewBox="0 0 20 21"
																	fill="none"
																>
																	<rect
																		y="0.5"
																		width="20"
																		height="20"
																		rx="5"
																		fill="#727A80"
																	/>
																	<path
																		fill-rule="evenodd"
																		clip-rule="evenodd"
																		d="M11.7321 3.52122C12.4285 3.69368 13.095 3.96996 13.7092 4.34078C13.8323 4.41508 13.9303 4.52461 13.9905 4.6552C14.0508 4.7858 14.0705 4.93146 14.0471 5.07335C13.9658 5.56869 14.0895 5.94755 14.3202 6.17904C14.5517 6.41053 14.9313 6.53347 15.4259 6.45223C15.5679 6.42866 15.7137 6.44827 15.8445 6.50851C15.9752 6.56875 16.0849 6.66686 16.1592 6.79012C16.53 7.40429 16.8063 8.07075 16.9788 8.76713C17.0135 8.90685 17.0055 9.05376 16.9557 9.18886C16.906 9.32396 16.8169 9.44101 16.6998 9.52487C16.2915 9.81747 16.1103 10.1719 16.1103 10.4997C16.1103 10.8275 16.2915 11.1827 16.6998 11.4753C16.8167 11.5591 16.9058 11.676 16.9555 11.811C17.0052 11.9459 17.0133 12.0927 16.9788 12.2323C16.8063 12.9287 16.53 13.5951 16.1592 14.2093C16.0849 14.3326 15.9752 14.4307 15.8445 14.4909C15.7137 14.5512 15.5679 14.5708 15.4259 14.5472C14.9306 14.466 14.5524 14.5896 14.321 14.8204C14.0895 15.0519 13.9658 15.4315 14.0478 15.9261C14.0713 16.0681 14.0517 16.2139 13.9915 16.3446C13.9312 16.4754 13.8331 16.585 13.7099 16.6594C13.0953 17.0303 12.4283 17.3066 11.7314 17.4789C11.5918 17.5135 11.4451 17.5054 11.3101 17.4557C11.1752 17.4059 11.0582 17.3169 10.9744 17.2C10.6825 16.7917 10.3274 16.6105 9.99957 16.6105C9.67246 16.6105 9.3166 16.7917 9.02472 17.2C8.94091 17.3169 8.82398 17.4059 8.68902 17.4557C8.55407 17.5054 8.40731 17.5135 8.2677 17.4789C7.57082 17.3066 6.90386 17.0303 6.28925 16.6594C6.16599 16.585 6.06788 16.4754 6.00764 16.3446C5.9474 16.2139 5.92779 16.0681 5.95136 15.9261C6.03332 15.4315 5.91038 15.0526 5.67817 14.8211C5.4474 14.5896 5.06853 14.466 4.5732 14.5479C4.43131 14.5713 4.28565 14.5517 4.15505 14.4914C4.02446 14.4312 3.91493 14.3332 3.84063 14.21C3.46968 13.5954 3.1934 12.9285 3.02107 12.2316C2.98651 12.092 2.99461 11.9452 3.04434 11.8103C3.09406 11.6753 3.18312 11.5584 3.30001 11.4746C3.70763 11.1827 3.88952 10.8275 3.88952 10.4997C3.88952 10.1726 3.70763 9.81675 3.30001 9.52487C3.18312 9.44106 3.09406 9.32413 3.04434 9.18918C2.99461 9.05422 2.98651 8.90746 3.02107 8.76785C3.19346 8.07122 3.46974 7.4045 3.84063 6.79012C3.91493 6.66699 4.02446 6.56897 4.15505 6.50873C4.28565 6.4485 4.43131 6.42882 4.5732 6.45223C5.06853 6.53347 5.4474 6.41053 5.67889 6.17904C5.91038 5.94755 6.03332 5.56797 5.95208 5.07335C5.92866 4.93146 5.94835 4.7858 6.00858 4.6552C6.06882 4.52461 6.16683 4.41508 6.28997 4.34078C6.90413 3.96997 7.5706 3.69369 8.26698 3.52122C8.40669 3.4865 8.55361 3.49453 8.68871 3.54426C8.82381 3.59399 8.94086 3.68314 9.02472 3.80016C9.31732 4.20778 9.67174 4.38967 9.99957 4.38967C10.3274 4.38967 10.6825 4.20778 10.9751 3.80016C11.0589 3.68327 11.1759 3.59421 11.3108 3.54449C11.4458 3.49476 11.5925 3.48666 11.7321 3.52122ZM11.8055 5.03813C11.3332 5.51045 10.7127 5.82678 9.99957 5.82678C9.2864 5.82678 8.66598 5.51117 8.19365 5.03741C7.92626 5.12588 7.66579 5.23401 7.41435 5.36092C7.41507 6.02951 7.19939 6.69091 6.69544 7.19559C6.19148 7.69955 5.52936 7.91522 4.86077 7.9145C4.73424 8.16468 4.6264 8.42493 4.53726 8.6938C5.01102 9.16613 5.32662 9.78655 5.32662 10.4997C5.32662 11.2129 5.01102 11.8333 4.53726 12.3056C4.6264 12.5745 4.73496 12.8355 4.86077 13.0856C5.52936 13.0842 6.19076 13.2999 6.69544 13.8046C7.19939 14.3078 7.41507 14.9699 7.41435 15.6385C7.66381 15.765 7.92478 15.8729 8.19365 15.962C8.66598 15.4883 9.2864 15.1727 9.99957 15.1727C10.7127 15.1727 11.3332 15.489 11.8055 15.962C12.0731 15.8736 12.3338 15.7655 12.5855 15.6385C12.5841 14.9699 12.7997 14.3085 13.3044 13.8038C13.8077 13.2999 14.4698 13.0849 15.1384 13.0849C15.2649 12.8355 15.3727 12.5745 15.4619 12.3056C14.9881 11.8333 14.6725 11.2129 14.6725 10.4997C14.6725 9.78655 14.9888 9.16613 15.4619 8.6938C15.3734 8.42641 15.2653 8.16593 15.1384 7.9145C14.4698 7.91522 13.8084 7.69955 13.3037 7.19559C12.7997 6.69163 12.5848 6.02951 12.5848 5.36092C12.3333 5.23402 12.0729 5.1266 11.8055 5.03813ZM9.99957 7.62406C10.7622 7.62406 11.4937 7.92703 12.033 8.46632C12.5723 9.00561 12.8752 9.73704 12.8752 10.4997C12.8752 11.2624 12.5723 11.9938 12.033 12.5331C11.4937 13.0724 10.7622 13.3754 9.99957 13.3754C9.23689 13.3754 8.50546 13.0724 7.96617 12.5331C7.42688 11.9938 7.12391 11.2624 7.12391 10.4997C7.12391 9.73704 7.42688 9.00561 7.96617 8.46632C8.50546 7.92703 9.23689 7.62406 9.99957 7.62406ZM9.99957 9.06189C9.61823 9.06189 9.25251 9.21337 8.98287 9.48302C8.71322 9.75266 8.56174 10.1184 8.56174 10.4997C8.56174 10.8811 8.71322 11.2468 8.98287 11.5164C9.25251 11.7861 9.61823 11.9375 9.99957 11.9375C10.3809 11.9375 10.7466 11.7861 11.0163 11.5164C11.2859 11.2468 11.4374 10.8811 11.4374 10.4997C11.4374 10.1184 11.2859 9.75266 11.0163 9.48302C10.7466 9.21337 10.3809 9.06189 9.99957 9.06189Z"
																		fill="white"
																	/>
																</svg>
															</span>
															icon on the popup
															and ensure that the
															option{ ' ' }
															<span className="swptls-text-highlight">
																“Viewers and
																commenters can
																see the option
																to download,
																print, and copy”
															</span>{ ' ' }
															is selected
														</li>
														<li>
															<span>
																Save the changes
																by clicking on
																the
																<button className="done-btn">
																	Done
																</button>
																button
															</span>
														</li>
													</ol>
												</div>
											</div>
											<div className="private-video-player">
												<iframe
													className="private-player"
													width="360"
													height="215"
													src="https://www.youtube.com/embed/ZBYD3F7k0jg?si=ifNLQQkE8wcAfFxA"
													title="YouTube video player"
													frameborder="1"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
													allowfullscreen
												></iframe>
											</div>
										</div>
									</>
								) : (
									<></>
								) }
							</div>
						</div>

						<div className="table-preview wrapper">
							{ privatesheetmessage === true && (
								<style>
									{ `
									.table-preview::before {
									background-color: unset !important;
									}
								` }
								</style>
							) }

							{ previewLoader ? (
								<h2>{ getStrings( 'lp' ) }</h2>
							) : (
								<>
									{ /* For limitation notice  */ }

									{ limitedtmessage === true ? (
										<>
											<div className="invalid-card has--limit-upgrade">
												<label
													className="invalid-upgrade"

													// onClick={() => handleVisit()}
												>
													<span className="icon">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="16"
															height="15"
															viewBox="0 0 16 15"
															fill="none"
														>
															<path
																d="M1.67982 14.5H14.3202C15.6128 14.5 16.4185 13.1253 15.7722 12.0305L9.45205 1.32111C8.80576 0.226297 7.19424 0.226297 6.54795 1.32111L0.227771 12.0305C-0.418516 13.1253 0.387244 14.5 1.67982 14.5ZM8 8.73784C7.53837 8.73784 7.16067 8.36741 7.16067 7.91467V6.26834C7.16067 5.8156 7.53837 5.44517 8 5.44517C8.46163 5.44517 8.83933 5.8156 8.83933 6.26834V7.91467C8.83933 8.36741 8.46163 8.73784 8 8.73784ZM8.83933 12.0305H7.16067V10.3842H8.83933V12.0305Z"
																fill="#FF8023"
															/>
														</svg>
													</span>
													<span>
														{ getStrings(
															'limited-to-msg'
														) }{ ' ' }
														<a
															className="upgrade-now-btn-txt"
															onClick={ () =>
																handleVisit()
															}
														>
															{ getStrings(
																'upgrade-pro'
															) }
														</a>{ ' ' }
														{ getStrings(
															'limited-to-msg-2'
														) }
													</span>
												</label>

												<button
													className="btn"
													onClick={ () =>
														handleVisit()
													}
												>
													{ getStrings(
														'upgrade-now'
													) }
												</button>
											</div>
										</>
									) : (
										<div></div>
									) }

									{ /* If table is private after create  */ }
									{ privatesheetmessage === true ? (
										<>{ /* Show nothing  */ }</>
									) : (
										<div
											className={ `gswpts_tables_container table-preview ${
												activeTab === 'row_settings'
													? previewClasses +
													  ' ' +
													  previewModeClasses
													: ''
											} gswpts_${
												tableSettings?.table_settings
													?.table_style
											}${
												! isProActive()
													? ` swptls-lite-table-preview`
													: ``
											}${
												tableSettings?.table_settings
													?.hide_on_desktop
													? ` hide-column-on-desktop`
													: ``
											}${
												tableSettings?.table_settings
													?.hide_on_mobile
													? ` hide-column-on-mobile`
													: ``
											}${
												tableSettings?.table_settings
													?.swap_filter_inputs
													? ` swap-filter-inputs`
													: ``
											}${
												tableSettings?.table_settings
													?.swap_bottom_options
													? ` swap-bottom-options`
													: ``
											}${
												tableSettings?.table_settings
													?.allow_sorting
													? ``
													: ` sorting-off`
											}` }
											id="table-preview"
											dangerouslySetInnerHTML={ {
												__html: tablePreview?.html,
											} }
										></div>
									) }
								</>
							) }
						</div>
					</div>
				</>
			) }

			{ verticalmodal && (
				<Modal>
					<div
						className="delete-table-modal-wrap modal-content"
						ref={ verticalModelRef }
					>
						<div
							className="cross_sign"
							onClick={ () => handleClosePopup() }
						>
							{ Cross }
						</div>
						<div className="delete-table-modal">
							<div className="modal-media">{ Merge }</div>
							<h2>{ getStrings( 'merge-alert' ) }</h2>
							<p>{ getStrings( 'merge-info' ) }</p>
							<div className="action-buttons">
								<button
									className="swptls-button cancel-button"
									onClick={ handleClosePopup }
								>
									{ getStrings( 'merge-confirm' ) }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }
		</div>
	);
}

export default EditTable;
