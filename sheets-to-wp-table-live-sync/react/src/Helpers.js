const config = Object.assign( {}, window.SWPTLS_APP );

export function getNonce() {
	return config.nonce;
}

export function getTables() {
	return config.tables;
}

export function getTheme() {
	return config.theme;
}

export function getStrings( key ) {
	return config.strings[ key ];
}

export function getTabs() {
	return config.tabs;
}

export function isValidGoogleSheetsUrl( url ) {
	// Regular expression to match Google Sheets URLs
	var pattern =
		/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/;

	// Test if the URL matches the pattern
	return pattern.test( url );
}

// Default setting once table create.
export function getDefaultSettings() {
	return {
		table_title: false,

		show_description: false,
		description_position: 'above',
		table_description: '',

		default_rows_per_page: 10,
		show_info_block: false,
		responsive_table: false,
		show_x_entries: true,
		swap_filter_inputs: false,
		swap_bottom_options: false,
		allow_sorting: false,
		search_bar: true,
		table_export: [],
		vertical_scroll: null,
		cell_format: 'expand',
		responsive_style: 'default_style',
		redirection_type: '_blank',
		cursor_behavior: 'left_right',
		table_cache: false,
		table_style: 'default-style',
		merged_support: false,
		isvertical: false,

		//Column
		hide_column: [],
		hide_column_mobile: [],
		hide_on_desktop_col: true,
		hide_on_mobile_col: true,

		// ROW
		hide_rows: [],
		hide_rows_mobile: [],
		hide_on_desktop_rows: true,
		hide_on_mobile_rows: true,

		// Cells
		hide_cell: [],
		hide_cell_mobile: [],
		hide_on_desktop_cell: true,
		hide_on_mobile_cell: true,

		import_styles: false,

		checkbox_support: false,
		allow_singleshort: false,
		sorting_mode: 'desc',
		columnnumber: '0', // sorting by column - feature are commented out for now

		table_styles: false,
		table_img_support: false,
		table_link_support: false,

		table_view_mode: 'default-mode',
		table_search_column: [],
		search_by: 'search-by-typing',
		enable_column_specific_search: false,

		import_styles_theme_colors: {
			'default-style': {
				headerBGColor: '#ffffff',
				headerTextColor: '#000000',
				bodyBGColor: '#ffffff',
				bodyTextColorCol_1: '#333333',
				bodyTextColorColRest: '#6B7280',
				borderColor: '#e0e5f6',
				paginationStyle: 'default_pagination',
				paginationAciveBtnColor: '#828282',
				pagination_center: false,
			},
			'style-4': {
				headerBGColor: '#000',
				headerTextColor: '#ffffff',
				bodyBGColor: '#000f',
				bodyTextColor: '#ffffff',
				hoverBGColor: '#504949',
				paginationStyle: 'simple_pagination',
				paginationAciveBtnColor: '#000000',
				pagination_center: true,
			},
			'style-6': {
				headerBGColor: '#E5F1FF',
				headerTextColor: '#0f0f0f',
				bodyTextColor: '#0f0f0f',
				bodyBGColorEven: '#EBF4FF',
				bodyBGColorOdd: '#ffffff',
				hoverBGColor: '#bdcfe4',
				paginationStyle: 'tailwind_pagination',
				paginationAciveBtnColor: '#2D74E7',
				pagination_center: false,
			},
			'style-2': {
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
			},
			'style-3': {
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
			},
			'style-5': {
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
			},
			'style-8': {
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
			},
			'style-1': {
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
			},
			'style-7': {
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
			},
		},
	};
}

export function convertToSlug( str ) {
	return str.toLowerCase().replace( /\s+/g, '-' );
}

export function getLicenseUrl() {
	return config.pro.license_url;
}

export function isProInstalled() {
	return config.pro.installed;
}

export function isProActive() {
	return config.pro.active;
}

export function isProLicenseActive() {
	return config.pro.license;
}

export const getSpreadsheetID = ( url ) => {
	if ( ! url || url == '' ) return;

	let sheetID = null;

	sheetID = url.split( /\// )[ 5 ];

	if ( sheetID ) return sheetID;

	return null;
};

export const getGridID = ( url ) => {
	if ( ! url || url == '' ) return;

	let gridID = null;

	gridID = url.match( /gid=(\w+)/ );

	if ( ! gridID ) {
		return null;
	}

	gridID = gridID[ 1 ];

	if ( gridID ) return gridID;

	return null;
};

export const setPdfUrl = ( url ) => {
	const spreadsheetID = getSpreadsheetID( url );
	const gridID = getGridID( url );
	const pdfUrl =
		'https://docs.google.com/spreadsheets/d/' +
		spreadsheetID +
		'/export?format=pdf&id=' +
		spreadsheetID +
		'&gid=' +
		gridID;

	const createTablesWrapper = document.getElementById(
		'create_tables_wrapper'
	);

	if ( createTablesWrapper ) {
		const dtButtons =
			createTablesWrapper.getElementsByClassName( 'dt-buttons' )[ 0 ];

		if (
			dtButtons &&
			! dtButtons.getElementsByClassName( 'pdf_btn' ).length
		) {
			const pdfBtn = document.createElement( 'a' );
			// pdfBtn.className = "ui dt-button inverted red button transition hidden pdf_btn";
			pdfBtn.className =
				'ui dt-button inverted button transition hidden pdf_btn';
			pdfBtn.href = pdfUrl;
			pdfBtn.download = '';

			const span = document.createElement( 'span' );
			pdfBtn.appendChild( span );

			const img = document.createElement( 'img' );
			img.src = SWPTLS_APP.icons.filePdf;
			span.appendChild( img );
			//Tooltip for pdf.
			pdfBtn.setAttribute( 'title', getStrings( 'export-pdf' ) );

			dtButtons.appendChild( pdfBtn );
		}
	}
};

export const screenSize = () => {
	// Desktop screen size
	if ( screen.width > 740 ) {
		return 'desktop';
	} else {
		return 'mobile';
	}
};

// Return an array that will define the columns to hide
export const hideColumnByScreen = ( arrayValues ) => {
	return [
		{
			targets: arrayValues,
			visible: false,
			searchable: false,
		},
	];
};

export function getExportButtonOptions( values ) {
	return [
		{
			text: `<img src="${ SWPTLS_APP.iconsURL.curlyBrackets }" />`,
			className: 'ui inverted button transition hidden json_btn',
			action( e, dt, button, config ) {
				const data = dt.buttons.exportData();

				$.fn.dataTable.fileSave(
					new Blob( [ JSON.stringify( data ) ] ),
					`${ values.table_name }.json`
				);
			},
		},
		{
			text: `<img src="${ SWPTLS_APP.iconsURL.fileCSV }" />`,
			extend: 'csv',
			className: 'ui inverted button transition hidden csv_btn',
			title: `${ values.table_name }`,
		},
		{
			text: `<img src="${ SWPTLS_APP.iconsURL.fileExcel }" />`,
			extend: 'excel',
			className: 'ui inverted button transition hidden excel_btn',
			title: `${ values.table_name }`,
		},
		{
			text: `<img src="${ SWPTLS_APP.iconsURL.printIcon }" />`,
			extend: 'print',
			className: 'ui inverted button transition hidden print_btn',
			title: `${ values.table_name }`,
		},
		{
			text: `<img src="${ SWPTLS_APP.iconsURL.copySolid }" />`,
			extend: 'copy',
			className: 'ui inverted button transition hidden copy_btn',
			title: `${ values.table_name }`,
		},
	];
}

export const export_buttons_row_revealer = ( export_btns ) => {
	if ( export_btns ) {
		export_btns.forEach( ( btn ) => {
			setTimeout( () => {
				export_button_revealer_by_other_input( btn );
			}, 300 );
		} );
	}
};

const export_button_revealer_by_other_input = ( btn ) => {
	const button = document.querySelector( '.' + btn + '_btn' );
	if ( button.classList.contains( 'hidden' ) ) {
		button.classList.remove( 'hidden' );
		button.classList.add( 'scale' );
	}
};

export const swap_bottom_options = ( state ) => {
	let pagination_menu = document.querySelector( '#bottom_options' );

	if ( state ) {
		pagination_menu.classList.add( 'swap' );
	} else {
		pagination_menu.classList.remove( 'swap' );
	}
};

export const swap_top_options = ( state ) => {
	let pagination_menu = document.querySelector( '#filtering_input' );

	if ( state ) {
		pagination_menu.classList.add( 'swap' );
	} else {
		pagination_menu.classList.remove( 'swap' );
	}
};

const bottom_option_style = ( $arg ) => {
	document.querySelector( '#bottom_options' ).style.flexDirection =
		$arg[ 'flex_direction' ];
	document.querySelector( '#create_tables_info' ).style.marginLeft =
		$arg[ 'table_info_style' ][ 'margin_left' ];
	document.querySelector( '#create_tables_info' ).style.marginRight =
		$arg[ 'table_info_style' ][ 'margin_right' ];
	document.querySelector( '#create_tables_paginate' ).style.marginLeft =
		$arg[ 'table_paginate_style' ][ 'margin_left' ];
	document.querySelector( '#create_tables_paginate' ).style.marginRight =
		$arg[ 'table_paginate_style' ][ 'margin_right' ];
};

export const changeCellFormat = ( formatStyle, tableCell ) => {
	tableCell = document.querySelectorAll( tableCell );
	switch ( formatStyle ) {
		case 'wrap':
			tableCell.forEach( ( cell ) => {
				cell.classList.remove( 'clip_style' );
				cell.classList.remove( 'expanded_style' );
				cell.classList.add( 'wrap_style' );
			} );
			break;

		case 'clip':
			tableCell.forEach( ( cell ) => {
				cell.classList.remove( 'wrap_style' );
				cell.classList.remove( 'expanded_style' );
				cell.classList.add( 'clip_style' );
			} );
			break;

		case 'expand':
			tableCell.forEach( ( cell ) => {
				cell.classList.remove( 'clip_style' );
				cell.classList.remove( 'wrap_style' );
				cell.classList.add( 'expanded_style' );
			} );
			break;

		default:
			break;
	}
};

export const displayProPopup = () => {
	WPPOOL.Popup( 'sheets_to_wp_table_live_sync' ).show();
};

export const getSetupWizardStatus = () => {
	return config.ran_setup_wizard;
};

export function show_export_buttons( buttons ) {
	if ( buttons ) {
		buttons.forEach( ( btn ) => {
			if ( document.querySelector( '.' + btn + '_btn' ) ) {
				if ( ! buttons.includes( btn ) ) {
					document.querySelector( '.' + btn + '_btn' ).style =
						'display: block;';
				} else {
					document.querySelector( '.' + btn + '_btn' ).style =
						'display: block;';
				}
			}
		} );
	}
}

// Hide table title instant
export function handleTableAppearance( settings ) {
	/**
	 * Pagination icon
	 */

	const PaginationTailwindBack1 = `
	<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M5.77056 8.8019C5.91747 8.67501 6 8.50294 6 8.32353C6 8.14411 5.91747 7.97205 5.77056 7.84516L1.89154 4.49592L5.77056 1.14667C5.91331 1.01906 5.99229 0.848143 5.99051 0.670736C5.98872 0.49333 5.90631 0.323626 5.76101 0.198175C5.61572 0.0727263 5.41917 0.00156787 5.21371 2.57836e-05C5.00824 -0.00151535 4.81029 0.0666838 4.66249 0.189935L0.229439 4.01755C0.0825293 4.14443 -2.04722e-07 4.3165 -1.9688e-07 4.49592C-1.89037e-07 4.67533 0.0825294 4.8474 0.229439 4.97428L4.66249 8.8019C4.80945 8.92874 5.00873 9 5.21653 9C5.42432 9 5.62361 8.92874 5.77056 8.8019Z" fill="#ffffff"/>
	</svg>

	`;
	const PaginationTainwildNext1 = `
	<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M0.229439 8.8019C0.0825295 8.67501 2.1727e-08 8.50294 2.95695e-08 8.32353C3.74119e-08 8.14411 0.0825296 7.97205 0.229439 7.84516L4.10846 4.49592L0.22944 1.14667C0.0866933 1.01906 0.00770646 0.848143 0.00949193 0.670736C0.0112774 0.49333 0.0936922 0.323626 0.238986 0.198175C0.384279 0.0727263 0.580825 0.00156787 0.786293 2.57836e-05C0.991761 -0.00151535 1.18971 0.0666838 1.33751 0.189935L5.77056 4.01755C5.91747 4.14443 6 4.3165 6 4.49592C6 4.67533 5.91747 4.8474 5.77056 4.97428L1.33751 8.8019C1.19055 8.92874 0.991266 9 0.783473 9C0.57568 9 0.376394 8.92874 0.229439 8.8019Z" fill="#FFFFFF"/>
	</svg>

	`;

	const PaginationTailwindBack2 = `
	<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd" d="M5.35416 0.854143C5.40065 0.807655 5.43753 0.752466 5.46268 0.691727C5.48784 0.630987 5.50079 0.565887 5.50079 0.500143C5.50079 0.434399 5.48784 0.369299 5.46268 0.30856C5.43753 0.24782 5.40065 0.192631 5.35416 0.146143C5.30767 0.0996553 5.25248 0.0627792 5.19174 0.0376201C5.13101 0.012461 5.06591 -0.000488282 5.00016 -0.000488281C4.93442 -0.00048828 4.86932 0.012461 4.80858 0.0376201C4.74784 0.0627792 4.69265 0.0996553 4.64616 0.146143L0.646161 4.14614C0.599598 4.19259 0.562655 4.24776 0.537449 4.30851C0.512242 4.36926 0.499268 4.43438 0.499268 4.50014C0.499268 4.56591 0.512242 4.63103 0.537449 4.69178C0.562655 4.75252 0.599598 4.8077 0.646161 4.85414L4.64616 8.85414C4.74005 8.94803 4.86739 9.00077 5.00016 9.00077C5.13294 9.00077 5.26027 8.94803 5.35416 8.85414C5.44805 8.76026 5.50079 8.63292 5.50079 8.50014C5.50079 8.36737 5.44805 8.24003 5.35416 8.14614L1.70716 4.50014L5.35416 0.854143ZM11.3542 0.854143C11.4006 0.807655 11.4375 0.752466 11.4627 0.691727C11.4878 0.630987 11.5008 0.565887 11.5008 0.500143C11.5008 0.434399 11.4878 0.369299 11.4627 0.30856C11.4375 0.24782 11.4006 0.192631 11.3542 0.146143C11.3077 0.0996553 11.2525 0.0627792 11.1917 0.0376201C11.131 0.012461 11.0659 -0.000488281 11.0002 -0.000488281C10.9344 -0.000488281 10.8693 0.012461 10.8086 0.0376201C10.7478 0.0627792 10.6926 0.0996553 10.6462 0.146143L6.64616 4.14614C6.5996 4.19259 6.56266 4.24776 6.53745 4.30851C6.51224 4.36926 6.49927 4.43438 6.49927 4.50014C6.49927 4.56591 6.51224 4.63103 6.53745 4.69178C6.56266 4.75252 6.5996 4.8077 6.64616 4.85414L10.6462 8.85414C10.74 8.94803 10.8674 9.00077 11.0002 9.00077C11.1329 9.00077 11.2603 8.94803 11.3542 8.85414C11.448 8.76026 11.5008 8.63292 11.5008 8.50014C11.5008 8.36737 11.448 8.24003 11.3542 8.14614L7.70716 4.50014L11.3542 0.854143Z" fill="#333333"/>
	</svg>
	`;
	const PaginationTainwildNext2 = `
	<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" clip-rule="evenodd" d="M6.64587 0.854143C6.59938 0.807655 6.5625 0.752466 6.53735 0.691727C6.51219 0.630987 6.49924 0.565887 6.49924 0.500143C6.49924 0.434399 6.51219 0.369299 6.53735 0.30856C6.5625 0.24782 6.59938 0.192631 6.64587 0.146143C6.69236 0.0996553 6.74755 0.0627792 6.80829 0.0376201C6.86903 0.012461 6.93413 -0.000488282 6.99987 -0.000488281C7.06561 -0.00048828 7.13071 0.012461 7.19145 0.0376201C7.25219 0.0627792 7.30738 0.0996553 7.35387 0.146143L11.3539 4.14614C11.4004 4.19259 11.4374 4.24776 11.4626 4.30851C11.4878 4.36926 11.5008 4.43438 11.5008 4.50014C11.5008 4.56591 11.4878 4.63103 11.4626 4.69178C11.4374 4.75252 11.4004 4.8077 11.3539 4.85414L7.35387 8.85414C7.25998 8.94803 7.13265 9.00077 6.99987 9.00077C6.86709 9.00077 6.73976 8.94803 6.64587 8.85414C6.55198 8.76026 6.49924 8.63292 6.49924 8.50014C6.49924 8.36737 6.55198 8.24003 6.64587 8.14614L10.2929 4.50014L6.64587 0.854143ZM0.645869 0.854143C0.599381 0.807655 0.562505 0.752466 0.537346 0.691727C0.512187 0.630987 0.499238 0.565887 0.499238 0.500143C0.499238 0.434399 0.512187 0.369299 0.537346 0.30856C0.562505 0.24782 0.599381 0.192631 0.645869 0.146143C0.692357 0.0996553 0.747546 0.0627792 0.808286 0.0376201C0.869025 0.012461 0.934126 -0.000488281 0.999869 -0.000488281C1.06561 -0.000488281 1.13071 0.012461 1.19145 0.0376201C1.25219 0.0627792 1.30738 0.0996553 1.35387 0.146143L5.35387 4.14614C5.40043 4.19259 5.43738 4.24776 5.46258 4.30851C5.48779 4.36926 5.50076 4.43438 5.50076 4.50014C5.50076 4.56591 5.48779 4.63103 5.46258 4.69178C5.43738 4.75252 5.40043 4.8077 5.35387 4.85414L1.35387 8.85414C1.25998 8.94803 1.13264 9.00077 0.999869 9.00077C0.867094 9.00077 0.739756 8.94803 0.645869 8.85414C0.551983 8.76026 0.499238 8.63292 0.499238 8.50014C0.499238 8.36737 0.551983 8.24003 0.645869 8.14614L4.29287 4.50014L0.645869 0.854143Z" fill="#333333"/>
	</svg>
	`;

	if ( document.getElementById( 'swptls-table-title' ) ) {
		if ( ! settings?.show_title ) {
			document.getElementById( 'swptls-table-title' ).style =
				'display: none;';
		} else {
			document.getElementById( 'swptls-table-title' ).style =
				'display:block;';
		}
	}

	// Hide table description and change position
	if ( document.getElementById( 'swptls-table-description' ) ) {
		var description = document.getElementById( 'swptls-table-description' );
		var wrapper = document.getElementById( 'create_tables_wrapper' );
		const textarea = document.getElementById( 'table-description' );

		if ( ! settings?.show_description ) {
			document.getElementById( 'swptls-table-description' ).style =
				'display: none;';
		} else {
			document.getElementById( 'swptls-table-description' ).style =
				'display:block;';
		}

		if ( settings?.description_position === 'above' ) {
			// Move description above the wrapper
			if ( description && wrapper ) {
				wrapper.parentNode.insertBefore( description, wrapper );
			}
		} else if ( settings?.description_position === 'below' ) {
			// Move description below the wrapper
			if ( description && wrapper ) {
				wrapper.parentNode.insertBefore(
					description,
					wrapper.nextSibling
				);
			}
		}

		// Add an event listener to the textarea input event
		if ( description && textarea ) {
			textarea.addEventListener( 'input', () => {
				description.textContent = textarea.value;
			} );
		}
	}

	if ( document.getElementById( 'create_tables_filter' ) ) {
		if ( ! settings?.search_bar ) {
			document.getElementById( 'create_tables_filter' ).style =
				'display: none;';
		} else {
			document.getElementById( 'create_tables_filter' ).style =
				'display: block;';
		}
	}

	// Here Paginate
	if ( document.getElementById( 'create_tables_paginate' ) ) {
		if ( ! settings?.pagination ) {
			document.getElementById( 'create_tables_paginate' ).style =
				'display: none;';
		} else {
			document.getElementById( 'create_tables_paginate' ).style =
				'display: block;';
		}
	}

	if ( document.getElementById( 'create_tables_info' ) ) {
		if ( ! settings?.show_info_block ) {
			document.getElementById( 'create_tables_info' ).style =
				'display: none;';
		} else {
			document.getElementById( 'create_tables_info' ).style =
				'display: block;';
		}
	}

	if ( document.getElementById( 'create_tables_length' ) ) {
		if ( ! settings?.show_x_entries ) {
			document.getElementById( 'create_tables_length' ).style =
				'display: none;';
		} else {
			document.getElementById( 'create_tables_length' ).style =
				'display: block;';
		}
	}

	/**
	 * Pagination color generator
	 */
	const hexToRgba = ( hex, opacity ) => {
		const bigint = parseInt( hex.slice( 1 ), 16 );
		const r = ( bigint >> 16 ) & 255;
		const g = ( bigint >> 8 ) & 255;
		const b = bigint & 255;

		return `rgba(${ r }, ${ g }, ${ b }, ${ opacity })`;
	};

	const updatePaginationButtonColor = ( colorValue, themeName ) => {
		const paginationButtons = document.querySelectorAll(
			'a.paginate_button.current'
		);
		const paginationButtonsNext = document.querySelectorAll(
			'.paginate_button.next'
		);
		const paginationButtonsPrev = document.querySelectorAll(
			'.paginate_button.previous'
		);
		const paginationButtonsDisabled = document.querySelectorAll(
			'.paginate_button.disabled'
		);

		// Reset the styles to their default values
		const resetStyles = () => {
			paginationButtons.forEach( ( button ) => {
				button.style.removeProperty( 'background-color' );
				button.style.removeProperty( 'color' );
				button.style.removeProperty( 'border' );
			} );
			paginationButtonsNext.forEach( ( button ) => {
				button.style.removeProperty( 'background-color' );
				button.style.removeProperty( 'color' );
			} );
			paginationButtonsPrev.forEach( ( button ) => {
				button.style.removeProperty( 'background-color' );
				button.style.removeProperty( 'color' );
			} );
			paginationButtonsDisabled.forEach( ( button ) => {
				button.style.removeProperty( 'background-color' );
				button.style.removeProperty( 'color' );
			} );
		};

		// Apply reset before applying new styles
		resetStyles();

		let backgroundColor;
		let textColor;

		// Check for specific theme names and apply hexToRgba for backgroundColor
		if (
			themeName === 'style-6' ||
			themeName === 'style-5' ||
			themeName === 'style-8'
		) {
			backgroundColor = hexToRgba( colorValue, 0.1 );
			textColor = hexToRgba( colorValue, 0.9 );
		} else {
			backgroundColor = colorValue;
			textColor = '#ffffff';
		}

		paginationButtons.forEach( ( button ) => {
			if ( themeName === 'style-1' || themeName === 'style-3' ) {
				button.style.setProperty(
					'background-color',
					'unset',
					'important'
				);
				button.style.setProperty(
					'border',
					`1px solid ${ backgroundColor }`,
					'important'
				);
				button.style.setProperty( 'color', '#000', 'important' );
				paginationButtonsNext.forEach( ( nextButton ) => {
					nextButton.style.setProperty(
						'background-color',
						backgroundColor,
						'important'
					);
					nextButton.style.setProperty(
						'color',
						textColor,
						'important'
					);
				} );
				paginationButtonsPrev.forEach( ( prevButton ) => {
					prevButton.style.setProperty(
						'background-color',
						backgroundColor,
						'important'
					);
					prevButton.style.setProperty(
						'color',
						textColor,
						'important'
					);
				} );
				paginationButtonsPrev.forEach( ( prevButton ) => {
					prevButton.style.setProperty(
						'background-color',
						backgroundColor,
						'important'
					);
					prevButton.style.setProperty(
						'color',
						textColor,
						'important'
					);
				} );
				paginationButtonsDisabled.forEach( ( prevButton ) => {
					prevButton.style.setProperty(
						'background-color',
						'#F2F2F2',
						'important'
					);
					prevButton.style.setProperty(
						'color',
						textColor,
						'important'
					);
				} );
			} else if (
				themeName === 'default-style' ||
				themeName === 'style-2' ||
				themeName === 'style-4' ||
				themeName === 'style-5' ||
				themeName === 'style-6' ||
				themeName === 'style-7' ||
				themeName === 'style-8'
			) {
				button.style.setProperty(
					'background-color',
					backgroundColor,
					'important'
				);
				button.style.setProperty( 'color', textColor, 'important' );
				button.style.setProperty( 'border', 'unset', 'important' );
				paginationButtonsNext.forEach( ( nextButton ) => {
					nextButton.style.setProperty(
						'background-color',
						'unset',
						'important'
					);
					nextButton.style.setProperty( 'color', textColor );
				} );
				paginationButtonsPrev.forEach( ( prevButton ) => {
					prevButton.style.setProperty(
						'background-color',
						'unset',
						'important'
					);
					prevButton.style.setProperty( 'color', '#000' );
				} );
			} else {
				button.style.setProperty( 'background-color', backgroundColor );
				button.style.setProperty( 'color', textColor );
			}
		} );
	};

	/**
	 * Dynamic theme class added to style the pagination
	 */
	if ( document.getElementById( 'create_tables' ) ) {
		// Detect theme name
		let themeName = '';
		const classList = document.getElementById( 'table-preview' ).classList;
		let gswptsCount = 0;

		for ( let className of classList ) {
			if ( className.startsWith( 'gswpts_' ) ) {
				gswptsCount++;
				if ( gswptsCount === 2 ) {
					// Select the second occurrence
					themeName = className.replace( 'gswpts_', '' ); // Strip the prefix
					break;
				}
			}
		}
		document
			.getElementById( 'table-preview' )
			.classList.add( 'gswpts_' + themeName );

		// Pagination btn value add and update
		const paginationContainers = document.querySelectorAll(
			'.dataTables_paginate.paging_simple_numbers'
		);

		if ( paginationContainers ) {
			paginationContainers.forEach( ( container ) => {
				// Check for simple pagination
				if (
					container.querySelector(
						'.paging-forward-simple_pagination, .paging-backward-simple_pagination, .paging-first-simple_pagination, .paging-last-simple_pagination'
					)
				) {
					container.classList.add( 'simple-pagination-active' );
				}

				// Check for modern pagination
				if (
					container.querySelector(
						'.paging-forward-modern_pagination, .paging-backward-modern_pagination, .paging-first-modern_pagination, .paging-last-modern_pagination'
					)
				) {
					container.classList.add( 'modern-pagination-active' );
				}
				// Check for tailwind pagination
				if (
					container.querySelector(
						'.paging-forward-tailwind_pagination, .paging-backward-tailwind_pagination, .paging-first-tailwind_pagination, .paging-last-tailwind_pagination'
					)
				) {
					container.classList.add( 'modern-pagination-active' );
				}
				// Check for outlined pagination
				if (
					container.querySelector(
						'.paging-forward-outlined_pagination, .paging-backward-outlined_pagination, .paging-first-outlined_pagination, .paging-last-outlined_pagination'
					)
				) {
					container.classList.add( 'modern-pagination-active' );
				}

				// Check for default pagination
				if (
					container.querySelector(
						'.paging-forward-default_pagination, .paging-backward-default_pagination, .paging-first-default_pagination, .paging-last-default_pagination'
					)
				) {
					container.classList.add( 'default-pagination-active' );
				}
			} );

			// Update realtime
			const Pagination = document.querySelector(
				'.dataTables_paginate.paging_simple_numbers'
			);
			const updatePaginationStyle = ( style ) => {
				// Remove all style-related classes first
				Pagination.classList.remove(
					'simple-pagination-active',
					'modern-pagination-active',
					'default-pagination-active',
					'tailwind-pagination-active',
					'outlined-pagination-active'
				);

				// Add the selected style class
				switch ( style ) {
					case 'default_pagination':
						Pagination.classList.add( 'default-pagination-active' );
						break;
					case 'modern_pagination':
						Pagination.classList.add( 'modern-pagination-active' );
						break;
					case 'simple_pagination':
						Pagination.classList.add( 'simple-pagination-active' );
						break;
					case 'tailwind_pagination':
						Pagination.classList.add(
							'tailwind-pagination-active'
						);
						break;
					case 'outlined_pagination':
						Pagination.classList.add(
							'outlined-pagination-active'
						);
						break;

					default:
						// Add default class if needed
						Pagination.classList.add( 'default-pagination-active' );
						break;
				}

				// update the content for all case
				Pagination.querySelectorAll( 'span' ).forEach( ( span ) => {
					// Backward BTN
					if (
						span.classList.contains(
							'paging-backward-default_pagination'
						) ||
						span.classList.contains(
							'paging-backward-modern_pagination'
						) ||
						span.classList.contains(
							'paging-backward-simple_pagination'
						) ||
						span.classList.contains(
							'paging-backward-tailwind_pagination'
						) ||
						span.classList.contains(
							'paging-backward-outlined_pagination'
						)
					) {
						if ( style === 'simple_pagination' ) {
							span.innerHTML = '‹'; // ⇐ ⇒  |  ⇦ ⇨  |  ⇚⇛ |  ← → |  ‹‹  ››
						} else if ( style === 'modern_pagination' ) {
							span.innerHTML = '← PREV';
						} else if ( style === 'tailwind_pagination' ) {
							// span.innerHTML = '‹‹'
							span.innerHTML = PaginationTailwindBack2;
						} else if ( style === 'outlined_pagination' ) {
							span.innerHTML = PaginationTailwindBack1;
						} else {
							span.innerHTML = 'Previous';
						}
					}

					// Forward BTN
					if (
						span.classList.contains(
							'paging-forward-default_pagination'
						) ||
						span.classList.contains(
							'paging-forward-modern_pagination'
						) ||
						span.classList.contains(
							'paging-forward-simple_pagination'
						) ||
						span.classList.contains(
							'paging-forward-tailwind_pagination'
						) ||
						span.classList.contains(
							'paging-forward-outlined_pagination'
						)
					) {
						if ( style === 'simple_pagination' ) {
							span.innerHTML = '›';
						} else if ( style === 'modern_pagination' ) {
							span.innerHTML = 'NEXT →';
						} else if ( style === 'tailwind_pagination' ) {
							// span.innerHTML = '››'
							span.innerHTML = PaginationTainwildNext2;
						} else if ( style === 'outlined_pagination' ) {
							span.innerHTML = PaginationTainwildNext1;
						} else {
							span.innerHTML = 'Next';
						}
					}
				} );
			};

			const paginationSelect =
				document.getElementById( 'pagination-style' );
			if ( paginationSelect ) {
				// Initial setup based on the current selection
				updatePaginationStyle( paginationSelect.value );

				// Update on change
				if ( paginationSelect ) {
					paginationSelect.addEventListener( 'change', function () {
						updatePaginationStyle( this.value );
					} );
				}
			}

			// Retrigger on each pagination click
			var paginateContainer = document.getElementById(
				'create_tables_paginate'
			);
			if ( paginateContainer ) {
				paginateContainer.addEventListener(
					'click',
					function ( event ) {
						// Check if the clicked element is a paginate button
						updatePaginationStyle( paginationSelect.value );

						// Update on change
						if ( paginationSelect ) {
							paginationSelect.addEventListener(
								'change',
								function () {
									updatePaginationStyle( this.value );
								}
							);
						}
					}
				);
			}

			var entriesContainer = document.getElementById(
				'create_tables_length'
			);
			if ( entriesContainer ) {
				entriesContainer.addEventListener( 'click', function ( event ) {
					updatePaginationStyle( paginationSelect.value );
					updatePaginationButtonColor(
						paginationAciveBtnColor.value,
						themeName
					);

					// Update on change
					if ( paginationSelect ) {
						paginationSelect.addEventListener(
							'change',
							function () {
								updatePaginationStyle( this.value );
								updatePaginationButtonColor(
									paginationAciveBtnColor.value,
									themeName
								);
							}
						);
					}
				} );
			}

			var searchContainer = document.querySelector(
				'#create_tables_filter input[type="search"]'
			);
			if ( searchContainer ) {
				searchContainer.addEventListener( 'input', function ( event ) {
					// Check if the clicked element is a paginate button
					updatePaginationStyle( paginationSelect.value );
					updatePaginationButtonColor(
						paginationAciveBtnColor.value,
						themeName
					);

					// Update on change
					if ( paginationSelect ) {
						paginationSelect.addEventListener(
							'change',
							function () {
								updatePaginationStyle( this.value );
								updatePaginationButtonColor(
									paginationAciveBtnColor.value,
									themeName
								);
							}
						);
					}
				} );
			}
		}
	}

	/**
	 * Pagination alignement movement and conflict issue fix
	 * Function to update the margin based on the checkbox state
	 */
	function updateMargin() {
		const paginationCheckbox =
			document.querySelector( '#pagination_center' );
		const tablePaginate = document.querySelector(
			'#create_tables_paginate'
		);
		const tableInfo = document.querySelector( '#create_tables_info' );
		const tablePreview = document.querySelector( '#table-preview' );

		if ( paginationCheckbox && tablePaginate ) {
			// Check if #create_tables_info is visible
			const tableInfoIsVisible = tableInfo && tableInfo.offsetWidth > 0;

			// console.log(tableInfoIsVisible)

			if ( paginationCheckbox.checked ) {
				if ( tableInfoIsVisible ) {
					tablePaginate.style.position = 'absolute';
					tablePaginate.style.left = '40%';
					if ( tablePreview ) {
						tablePreview.style.overflow = 'unset';
					}
				} else {
					// Center the pagination when tableInfo is not visible
					tablePaginate.style.marginLeft = '40%';

					tablePaginate.style.position = ''; // Reset position
					tablePaginate.style.left = ''; // Reset left
					if ( tablePreview ) {
						tablePreview.style.overflow = ''; // Reset overflow when centering
					}
				}
			} else {
				// Default alignment when checkbox is not checked
				tablePaginate.style.marginLeft = 'auto';
			}
		}
	}

	// Attach the event listener to the checkbox
	const paginationCheckbox = document.querySelector( '#pagination_center' );
	const hideentryinfo = document.querySelector( '#hide-entry-info' );

	if ( paginationCheckbox ) {
		paginationCheckbox.addEventListener( 'change', updateMargin );
	}

	if ( hideentryinfo ) {
		hideentryinfo.addEventListener( 'change', updateMargin );
	}

	if ( hideentryinfo || paginationCheckbox ) {
		updateMargin();
	}

	const create_tables_paginate = document.querySelector(
		'#create_tables_paginate'
	);
	if ( create_tables_paginate ) {
		updateMargin();
	}

	// End

	/**
	 * Dynamic Theme Style
	 *
	 */

	if ( document.getElementById( 'create_tables' ) ) {
		const table = document.getElementById( 'create_tables' );

		if ( table ) {
			const headerBGColorInput =
				document.querySelector( '.headerBGColor' );
			const headerTextColorInput =
				document.querySelector( '.headerTextColor' );
			const bodyBGColor = document.querySelector( '.bodyBGColor' );
			const bodyTextColor = document.querySelector( '.bodyTextColor' );
			const bodyTextColorCol_1 = document.querySelector(
				'.bodyTextColorCol_1'
			);
			const bodyTextColorColRest = document.querySelector(
				'.bodyTextColorColRest'
			);

			const columnbodyBGColorEvenInput =
				document.querySelector( '.bodyBGColorEven' );
			const columnbodyBGColorOddInput =
				document.querySelector( '.bodyBGColorOdd' );

			const rowbodyBGColorEvenInput =
				document.querySelector( '.bodyBGColorEven' );
			const rowbodyBGColorOddInput =
				document.querySelector( '.bodyBGColorOdd' );

			const hoverBGColorInput = document.querySelector( '.hoverBGColor' );
			const hoverTextColorInput =
				document.querySelector( '.hoverTextColor' );
			const borderColorInput = document.querySelector( '.borderColor' );
			const outsideborderColor = document.querySelector(
				'.outsideborderColor'
			);

			const borderType = document.querySelector( '.borderType' );
			const borderRadius = document.querySelector( '.borderRadius' );

			// Checkboxes for activating even/odd row and column colors
			const activeOutsideborder = document.querySelector(
				'.activeOutsideborder'
			);
			const activateEvenOddRowColors =
				document.querySelector( '.activeRowColor' );
			const activateEvenOddColumnColors =
				document.querySelector( '.activeColumnColor' );

			const hover_mode_none = document.querySelector( '.hoverModeNone' );
			const hoverModeRow = document.querySelector( '.hoverModeRow' );
			const hoverModeColumn =
				document.querySelector( '.hoverModeColumn' );
			const paginationAciveBtnColor = document.querySelector(
				'.paginationAciveBtnColor'
			);
			const pagination_center =
				document.querySelector( '.pagination_center' );

			// Function to update the CSS variable
			const updateTableStyle = ( variable, value ) => {
				if ( value ) {
					table.style.setProperty( variable, value );
				}
			};

			// Function to add event listeners to input fields
			const addInputEventListener = ( inputElement, cssVariable ) => {
				if ( inputElement ) {
					inputElement.addEventListener( 'input', ( e ) =>
						updateTableStyle( cssVariable, e.target.value )
					);
				}
			};

			// Add event listeners to each input field
			addInputEventListener( headerBGColorInput, '--header-bg-color' );
			addInputEventListener(
				headerTextColorInput,
				'--header-text-color'
			);
			addInputEventListener( bodyBGColor, '--body-bg-color' );
			addInputEventListener( bodyTextColor, '--body-text-color' );
			addInputEventListener(
				bodyTextColorCol_1,
				'--body-text-color-col-1'
			);
			addInputEventListener(
				bodyTextColorColRest,
				'--body-text-color-rest'
			);

			addInputEventListener(
				columnbodyBGColorEvenInput,
				'--body-bg-color-even'
			);
			addInputEventListener(
				columnbodyBGColorOddInput,
				'--body-bg-color-odd'
			);

			addInputEventListener(
				rowbodyBGColorEvenInput,
				'--body-bg-color-even'
			);
			addInputEventListener(
				rowbodyBGColorOddInput,
				'--body-bg-color-odd'
			);

			addInputEventListener( hoverBGColorInput, '--hover-bg-color' );
			addInputEventListener( hoverTextColorInput, '--hover-text-color' );
			addInputEventListener( borderColorInput, '--border-color' );
			addInputEventListener(
				outsideborderColor,
				'--outside-border-color'
			);
			addInputEventListener( borderType, '--border-type' );
			addInputEventListener( borderRadius, '--border-radius' );
			addInputEventListener(
				paginationAciveBtnColor,
				'--pagination-colors'
			);

			// Initialize the table styles from the input values on page load
			const initTableStyles = () => {
				if ( headerBGColorInput )
					updateTableStyle(
						'--header-bg-color',
						headerBGColorInput.value
					);
				if ( headerTextColorInput )
					updateTableStyle(
						'--header-text-color',
						headerTextColorInput.value
					);
				if ( bodyBGColor )
					updateTableStyle( '--body-bg-color', bodyBGColor.value );
				if ( bodyTextColor )
					updateTableStyle(
						'--body-text-color',
						bodyTextColor.value
					);
				if ( bodyTextColorCol_1 )
					updateTableStyle(
						'--body-text-color-col-1',
						bodyTextColorCol_1.value
					);
				if ( bodyTextColorColRest )
					updateTableStyle(
						'--body-text-color-rest',
						bodyTextColorColRest.value
					);

				if ( columnbodyBGColorEvenInput )
					updateTableStyle(
						'--body-bg-color-even',
						columnbodyBGColorEvenInput.value
					);
				if ( columnbodyBGColorOddInput )
					updateTableStyle(
						'--body-bg-color-odd',
						columnbodyBGColorOddInput.value
					);

				if ( rowbodyBGColorEvenInput )
					updateTableStyle(
						'--body-bg-color-even',
						rowbodyBGColorEvenInput.value
					);
				if ( rowbodyBGColorOddInput )
					updateTableStyle(
						'--body-bg-color-odd',
						rowbodyBGColorOddInput.value
					);

				if ( hoverBGColorInput )
					updateTableStyle(
						'--hover-bg-color',
						hoverBGColorInput.value
					);
				if ( hoverTextColorInput )
					updateTableStyle(
						'--hover-text-color',
						hoverTextColorInput.value
					);
				if ( borderColorInput )
					updateTableStyle(
						'--border-color',
						borderColorInput.value
					);
				if ( outsideborderColor )
					updateTableStyle(
						'--outside-border-color',
						outsideborderColor.value
					);
				if ( borderType )
					updateTableStyle( '--border-type', borderType.value );
				if ( borderRadius )
					updateTableStyle( '--border-radius', borderRadius.value );
				if ( paginationAciveBtnColor )
					updateTableStyle(
						'--pagination-colors',
						paginationAciveBtnColor.value
					);
			};

			// Function to create or update a style element for a new theme
			const createOrUpdateThemeStyle = ( themeName ) => {
				const paginationColorValue = paginationAciveBtnColor
					? paginationAciveBtnColor.value
					: '#2F80ED';

				// Update CSS rules based on theme name and input values
				let styleContent = `
					.gswpts_${ themeName } table {
						border-collapse: unset;
					}
	
					.gswpts_${ themeName } thead th,
					.gswpts_${ themeName } tbody tr td {
						background-color: var(--header-bg-color);
						color: var(--header-text-color);
						border: none;
					}
	
					.gswpts_${ themeName } tbody tr td {
						background-color: var(--body-bg-color);
						color: var(--body-text-color);
					}
	
					.gswpts_${ themeName } th.thead-item.expanded_style {
						text-align: left;
					}
	
					.gswpts_${ themeName } tbody td:first-child {
						color: var(--body-text-color-col-1);
					}
	
					.gswpts_${ themeName } tbody td:not(:first-child) {
						color: var(--body-text-color-rest);
						font-weight: 400;
					}
	
					.gswpts_${ themeName } thead th {
						border: none;
						text-transform: uppercase;
						font-weight: 600;
					}

					
					
					.gswpts_${ themeName } a {
						color: orange;
					}
	
					.gswpts_${ themeName } a:hover {
						color: #2ecc40;
					}
	
					.gswpts_${ themeName } .sorting.sorting.sorting::after {
						color: #ffffff;
					}
	
					.gswpts_${ themeName } table.ui.celled.display {
						border: none;
					}
	
					table.dataTable.row-border tbody th,
					table.dataTable.row-border tbody td,
					table.dataTable.display tbody th,
					table.dataTable.display tbody td {
						border-top: 1px solid var(--border-color);
					}
						
					// Pagination 

					.gswpts_${ themeName } a.paginate_button.current{
						background-color: ${ paginationColorValue } !important;
					}

					.gswpts_${ themeName } .tailwind-pagination-active a.paginate_button.current{
						background-color: ${ hexToRgba( paginationColorValue, 0.1 ) } !important;
						color: ${ paginationColorValue } !important;
					}

					// New 
					.gswpts_${ themeName } .outlined-pagination-active .paginate_button.previous {
						 background-color: ${ paginationColorValue } !important;
						 color: #ffffff !important;
						 border-radius: 5px !important;
					}

					.gswpts_${ themeName } .dataTables_paginate.outlined-pagination-active .paginate_button.previous{
						background-color: ${ paginationColorValue } !important;
						border-radius: 5px !important;
						
						svg path {
							fill: #ffffff !important;
						}
					}
			

					.gswpts_${ themeName } .outlined-pagination-active .paginate_button.previous.disabled {
						background-color: #F2F2F2 !important;
						color: #666 !important; 
						svg path {
							fill: #666 !important;
						}
					}

					.gswpts_${ themeName } .outlined-pagination-active a.paginate_button.current{
						 background: #ffffff !important;
						 color: ${ paginationColorValue } !important;
						 border: 1px solid ${ paginationColorValue } !important;
						border-radius: 5px !important;
					}

					.gswpts_${ themeName } .outlined-pagination-active a.paginate_button.next{
						 background-color: ${ paginationColorValue } !important;
						 color: #ffffff !important;
						 border-radius: 5px !important;
					}
					
				`;

				//row hover
				if ( hoverModeRow ) {
					styleContent += `
						.gswpts_${ themeName } tbody tr:hover td,
						.gswpts_${ themeName } tbody tr:hover th {
							background-color: var(--hover-bg-color) !important;
							color: var(--hover-text-color) !important;
						}
						
					`;
				}
				// Column
				if ( hoverModeColumn ) {
					styleContent += `
						.gswpts_${ themeName } table {
							overflow: hidden;
						}
						.gswpts_${ themeName } td, th{
							border: 1px solid #999;
							padding: 10px;
							position: relative;
						}
						.gswpts_${ themeName } td:hover::after { 
							background-color: var(--hover-bg-color) !important;
							opacity: 0.2; 
							content: '';  
							height: 10000px;    
							left: 0;
							position: absolute;  
							top: -5000px;
							width: 100%;
							z-index: 1;       
							transition: 300ms;
						}
					`;
				}

				// Conditionally add even/odd row colors
				if ( activateEvenOddRowColors ) {
					styleContent += `
						.gswpts_${ themeName } tbody tr:nth-child(even) > td {
							background-color: var(--body-bg-color-even) ;
						}
	
						.gswpts_${ themeName } tbody tr:nth-child(odd) > td {
							background-color: var(--body-bg-color-odd) ;
						}
					`;
				}

				// Conditionally add even/odd column colors
				if ( activateEvenOddColumnColors ) {
					styleContent += `
						.gswpts_${ themeName } tbody td:nth-child(odd) {
							background-color: var(--body-bg-color-odd) ;
						}
	
						.gswpts_${ themeName } tbody td:nth-child(even) {
							background-color: var(--body-bg-color-even) ;
						}
					`;
				}

				// outside border
				styleContent += `
					.gswpts_${ themeName } tbody tr td:first-child {
						border-left: 1px solid var(--outside-border-color);
					}

					.gswpts_${ themeName }  tbody tr td:last-child {
						border-right: 1px solid var(--outside-border-color);
					}

					.gswpts_${ themeName } tbody tr:last-child td {
						border-bottom: 1px solid var(--outside-border-color);
					}
					
				`;

				// Conditionally add even/odd column colors
				if ( borderType && borderType.value === 'rounded' ) {
					styleContent += `
						.gswpts_${ themeName } thead th:first-child {
							border-radius: var(--border-radius) 0 0 0 ;
							border-right: none ;
						}
		
						.gswpts_${ themeName } thead th:last-child {
							border-radius: 0 var(--border-radius) 0 0 ;
							border-left: none ;
						}
		
						.gswpts_${ themeName } tr:last-child td:first-child {
							border-radius: 0 0 0 var(--border-radius) ;
						}
		
						.gswpts_${ themeName } tr:last-child td:last-child {
							border-radius: 0 0 var(--border-radius) 0 ;
						}
					`;
				}

				// Create or update style element
				let styleElement = document.getElementById(
					`swptls-custom-theme-style-${ themeName }`
				);
				if ( ! styleElement ) {
					styleElement = document.createElement( 'style' );
					styleElement.id = `swptls-custom-theme-style-${ themeName }`;
					document.head.appendChild( styleElement );
				}
				styleElement.textContent = styleContent;

				// Apply the color directly to the active pagination button
				updatePaginationButtonColor( paginationColorValue, themeName );
			};

			// Initialize the table styles
			initTableStyles();

			let themeName = '';
			// Detect theme change and apply styles
			const applyThemeStyles = () => {
				// Find the theme name from the table's class list

				const classList =
					document.getElementById( 'table-preview' ).classList;
				let gswptsCount = 0;

				for ( let className of classList ) {
					if ( className.startsWith( 'gswpts_' ) ) {
						gswptsCount++;
						if ( gswptsCount === 2 ) {
							// Select the second occurrence
							themeName = className.replace( 'gswpts_', '' ); // Strip the prefix
							break;
						}
					}
				}

				// Retrieve the toggle switch value
				const importStylesInput = document.querySelector(
					'.toggle-switch input[name="import_styles"]'
				);
				const importStylesValue = importStylesInput
					? importStylesInput.value
					: 'false';

				if (
					themeName &&
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
					].includes( themeName ) &&
					importStylesValue === 'false'
				) {
					createOrUpdateThemeStyle( themeName );
					document
						.getElementById( 'table-preview' )
						.classList.add( 'gswpts_' + themeName ); // Add the full class name back
				} else {
					// Directly update the color of the active pagination button
					if ( paginationAciveBtnColor ) {
						updatePaginationButtonColor(
							paginationAciveBtnColor.value,
							themeName
						);
					}
				}
			};

			// Apply theme styles on page load and theme change
			applyThemeStyles();
			table.addEventListener( 'change', applyThemeStyles );

			// Update pagination button color on input change
			if ( paginationAciveBtnColor ) {
				paginationAciveBtnColor.addEventListener( 'input', () => {
					updatePaginationButtonColor(
						paginationAciveBtnColor.value,
						themeName
					);
				} );
			}

			// Retrigger pagination color
			var paginateContainer = document.getElementById(
				'create_tables_paginate'
			);
			if ( paginateContainer ) {
				paginateContainer.addEventListener(
					'click',
					function ( event ) {
						// Check if the clicked element is a paginate button
						updatePaginationButtonColor(
							paginationAciveBtnColor.value,
							themeName
						);

						const paginationSelect =
							document.getElementById( 'pagination-style' );
						// Update on change
						if ( paginationAciveBtnColor ) {
							paginationSelect.addEventListener(
								'change',
								function () {
									updatePaginationButtonColor(
										paginationAciveBtnColor.value,
										themeName
									);
								}
							);
						}
					}
				);
			}
		}
	}

	/**
	 * Table Height and sorting fixing
	 */
	const selectElement2 = document.querySelector(
		'#create_tables_length select'
	);
	const selectElement = document.querySelector( '#rows-per-page' );
	const bottomOptions = document.querySelector(
		'.gswpts_tables_container #bottom_options'
	);
	const table_height = document.querySelector( '#table_height' );
	const scrollBodyElement = document.querySelector(
		'.dataTables_scrollBody'
	);
	const createTables = document.getElementById( 'create_tables' );

	if ( selectElement2 && selectElement ) {
		selectElement.addEventListener( 'change', ( event ) => {
			const selectedValue = event.target.value;

			// Check if the user is not active and the selected value is '100', or '-1'
			if (
				! isProActive() &&
				( selectedValue === '100' || selectedValue === '-1' )
			) {
				// If the user is not pro and the selected value is '100', or '-1', prevent the event
				event.preventDefault();
			} else {
				// Otherwise, set the value of selectElement2 and dispatch the event
				selectElement2.value = selectedValue;
				const changeEvent = new Event( 'change', { bubbles: true } );
				selectElement2.dispatchEvent( changeEvent );
			}
		} );
	}

	if ( table_height ) {
		table_height.addEventListener( 'change', ( event ) => {
			const selectedHeight = event.target.value;
			if ( bottomOptions ) {
				bottomOptions.style.position = 'relative';
				bottomOptions.style.overflow = 'auto';
				bottomOptions.style.maxHeight = '';
				bottomOptions.style.height = '';
				bottomOptions.style.width = '100%';
			}

			if ( selectedHeight === 'default_height' ) {
				if ( bottomOptions ) {
					bottomOptions.style.maxHeight = 'auto';
					bottomOptions.style.height = 'auto';

					if ( scrollBodyElement ) {
						scrollBodyElement.style.maxHeight = 'auto';
						scrollBodyElement.style.height = 'auto';
					}
				}
			} else {
				if ( bottomOptions ) {
					bottomOptions.style.position = 'relative';
					bottomOptions.style.overflow = 'auto';
					bottomOptions.style.maxHeight = selectedHeight + 'px';
					bottomOptions.style.height = selectedHeight + 'px';
					bottomOptions.style.width = '100%';
				}
			}
		} );
	}

	/**
	 * For table header merge feature
	 */

	var tableHeaders = document.querySelectorAll( '.thead-item[data-merge]' );

	tableHeaders.forEach( function ( header ) {
		// Check if the current header has the data-merge attribute.
		var dataMerge = header.getAttribute( 'data-merge' );
		if ( dataMerge ) {
			dataMerge = JSON.parse( dataMerge );
			var startCol = dataMerge[ 0 ];
			var numCols = dataMerge[ 1 ];

			// Add parentCellstart class to the starting cell
			header.classList.add( 'parentCellstart' );
			header.style.textAlign = 'center';
			header.style.verticalAlign = 'middle';

			// Update colspan attribute
			header.setAttribute( 'colspan', numCols );

			// Get the next cell in the row
			var nextCell = header.nextElementSibling;
			// Loop through numCols starting from 1
			for ( var i = 1; i < numCols; i++ ) {
				if ( nextCell ) {
					// Add childCell class to subsequent cells
					nextCell.classList.add( 'childCell' );
					// Hide subsequent cells
					nextCell.style.display = 'none';
					// Move to the next cell in the row
					nextCell = nextCell.nextElementSibling;
				}
			}
		}
	} );

	/**
	 * Merge feature extra cell removed
	 * corresponding cell finder algoritham by Sabbirsam
	 */
	var tableRows = document.querySelectorAll( '.gswpts_rows' );

	tableRows.forEach( function ( row ) {
		var cells = row.querySelectorAll( 'td' );

		cells.forEach( function ( cell, index ) {
			// Check if the current cell has the parentCellstart class.
			if ( cell.classList.contains( 'parentCellstart' ) ) {
				// Get the data-merge and data-index attributes.
				var dataMerge = JSON.parse( cell.getAttribute( 'data-merge' ) );
				var dataIndex = JSON.parse( cell.getAttribute( 'data-index' ) );

				// Loop through numRows and numCols.
				for ( var i = 0; i < dataMerge[ 0 ]; i++ ) {
					for ( var j = 0; j < dataMerge[ 1 ]; j++ ) {
						// Calculate the target data-index for each iteration.
						var targetIndex = [
							dataIndex[ 0 ] + i,
							dataIndex[ 1 ] + j,
						];

						// Find the corresponding cell.
						var targetCell = document.querySelector(
							'[data-index="[' + targetIndex.join( ',' ) + ']"]'
						);

						if ( targetCell ) {
							// Check if the cell has an empty cell_div.
							var cellDivContent = targetCell
								.querySelector( '.cell_div' )
								.innerText.trim();
							if ( cellDivContent === '' ) {
								// Add a class to hide the cell.
								targetCell.classList.add( 'merged-cell' );
								targetCell.style.display = 'none';

								if (
									cell.classList.contains( 'parentCellstart' )
								) {
									cell.style.textAlign = 'center';
									// cell.style.lineHeight = cell.offsetHeight + 'px';
									cell.style.verticalAlign = 'middle';
								}
							} else {
								targetCell.classList.add( 'normal-cell' );
							}
						}
					}
				}
			}
		} );
	} );

	/**
	 *
	 * @param {Sorting disabled and show alert below the sorting} e
	 */

	var tableRows = document.querySelectorAll( '.gswpts_rows' );
	var disableSortingCheckbox = document.getElementById( 'disable-sorting' );
	var labelForCheckbox = document.querySelector(
		'label[for="disable-sorting"]'
	);

	if ( disableSortingCheckbox && labelForCheckbox ) {
		// Create a div for the message if it doesn't exist
		var messageDiv = document.getElementById( 'vertical-merge-message' );

		if ( ! messageDiv ) {
			messageDiv = document.createElement( 'div' );
			messageDiv.id = 'vertical-merge-message';
			messageDiv.style.fontStyle = 'normal';
			messageDiv.style.fontWeight = 400;
			messageDiv.style.fontSize = '16px';
			messageDiv.style.lineHeight = '21px';
			messageDiv.style.margin = '20px 0 24px 0';
			messageDiv.style.padding = '10px 10px 10px 13px';
			messageDiv.style.color = '#ce6d26';
			messageDiv.style.backgroundColor = '#fff4ec';
			messageDiv.style.display = 'none'; // Change display to none initially
			messageDiv.style.alignItems = 'center';
			messageDiv.style.justifyContent = 'flex-start';
			messageDiv.style.borderRadius = '4px';

			// Find the label associated with the checkbox
			var labelForCheckbox = document.querySelector(
				'label[for="disable-sorting"]'
			);

			if ( labelForCheckbox ) {
				// Insert the message div after the label
				labelForCheckbox.parentNode.insertBefore(
					messageDiv,
					labelForCheckbox.nextSibling
				);
			} else {
				console.error( 'Label for checkbox not found!' );
			}
		}

		var verticalMergeFound = false;
		tableRows.forEach( function ( row ) {
			var cells = row.querySelectorAll( 'td' );
			cells.forEach( function ( cell, index ) {
				// Check if the cell has rowspan attribute
				var rowspan = cell.getAttribute( 'rowspan' );
				if ( rowspan && parseInt( rowspan ) > 1 ) {
					// disableSortingCheckbox.disabled = true;
					messageDiv.textContent = getStrings( 'merge-cells-notice' );
					var dataIndex = cell.getAttribute( 'data-index' );
					verticalMergeFound = true;
				}
			} );
		} );

		if ( verticalMergeFound ) {
			// disableSortingCheckbox.click();
			if ( disableSortingCheckbox.checked ) {
				// Trigger click only if the checkbox is unchecked
				disableSortingCheckbox.click();
			}

			// ajax to update the sorting and make it disabled for vertical merge.
			var currentURL = window.location.href;
			var match = currentURL.match( /\/edit\/(\d+)/ );
			if ( match ) {
				var idValue = match[ 1 ];
				wp.ajax.send( 'swptls_update_sorting', {
					data: {
						nonce: getNonce(),
						id: idValue,
						allow_sorting: false,
					},
					success( response ) {},
					error( error ) {},
				} );
			} else {
				console.error( 'ID not found in the URL' );
			}
			// END

			messageDiv.style.display = verticalMergeFound ? 'block' : 'none';

			disableSortingCheckbox.checked = false; // Keep the checkbox checked
			disableSortingCheckbox.disabled = false; // Disable the checkbox
			labelForCheckbox.style.opacity = 0.5; // lable disaled
			labelForCheckbox.style.pointerEvents = 'none'; // Disable pointer events for the label
		} else {
			messageDiv.style.display = verticalMergeFound ? 'block' : 'none';

			disableSortingCheckbox.disabled = false; // Enable the checkbox
			labelForCheckbox.style.opacity = 1; // Reset opcity
			labelForCheckbox.style.pointerEvents = 'auto'; // Enable pointer events for the label
		}
	} else {
		// console.error('Checkbox element not found!');
	}

	/**
	 * Hide merge cell notice if vertical merge found.
	 * No need now as we removed one notice from below the merge cell
	 */
	/* var tableRows = document.querySelectorAll('.gswpts_rows');
	var mergeTipsElement = document.getElementById('merge-hints');

	var verticalMergeFound = false;

	tableRows.forEach(function (row) {
	var cells = row.querySelectorAll('td');

	cells.forEach(function (cell) {
			var rowspan = cell.getAttribute('rowspan');
			if (rowspan && parseInt(rowspan) > 1) {
			// Vertical merge found
			verticalMergeFound = true;
			}
		});
	});

	if (mergeTipsElement) {
		mergeTipsElement.style.display = verticalMergeFound ? 'block' : 'none';
	} */

	/**
	 *
	 * @param {Sorting disabled} e
	 */
	function handleDisableSorting( e ) {
		e.stopPropagation();
		window.swptlsDataTable.order( [ 0, 'asc' ] ).draw();
	}

	if ( ! settings?.allow_sorting ) {
		if ( document.getElementsByClassName( 'thead-item sorting' ).length ) {
			const headers =
				document.getElementsByClassName( 'thead-item sorting' );

			for ( let item of headers ) {
				item.addEventListener( 'click', handleDisableSorting );
			}
		}
	} else {
		if ( document.getElementsByClassName( 'thead-item' ).length ) {
			const headers = document.getElementsByClassName( 'thead-item' );

			var clicked = false;

			function reloadTable() {
				if ( ! clicked ) {
					window.swptlsDataTable.order( [ 0, 'desc' ] ).draw();
					clicked = true;
				} else {
					window.swptlsDataTable.order( [ 0, 'asc' ] ).draw();
					clicked = false;
				}
			}

			for ( let item of headers ) {
				item.removeEventListener( 'click', handleDisableSorting );
				item.addEventListener( 'click', reloadTable );
			}
		}
	}

	if ( document.querySelectorAll( '.dt-button' ).length ) {
		const buttons = document.querySelectorAll( '.dt-button' );
		for ( let btn of buttons ) {
			btn.classList.add( 'hidden' );
		}
	}

	settings?.table_export.forEach( ( btn ) => {
		if ( document.querySelector( '.' + btn + '_btn' ) ) {
			document
				.querySelector( '.' + btn + '_btn' )
				.classList.remove( 'hidden' );
		}
	} );

	if ( document.querySelectorAll( '.swptls-table-link' ).length ) {
		const links = document.querySelectorAll( '.swptls-table-link' );

		for ( let link of links ) {
			link.target = settings?.redirection_type || '_self';
		}
	}

	changeCellFormat(
		settings?.cell_format,
		'#create_tables_wrapper th, #create_tables_wrapper td'
	);
	changeCellFormat(
		settings?.responsive_style,
		'#create_tables_wrapper th, #create_tables_wrapper td'
	);
}
