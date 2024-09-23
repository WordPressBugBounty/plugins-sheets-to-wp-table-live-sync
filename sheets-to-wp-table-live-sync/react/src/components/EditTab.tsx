import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Column from '../core/Column';
import Row from '../core/Row';
import Title from '../core/Title';
import { getNonce, getTabs, getStrings } from '../Helpers';
import { OrangeCopyIcon } from '../icons';

import DataTable from 'datatables.net-dt';
import './../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css';

//styles
import '../styles/_editTable.scss';
import ManagingTabs from './ManagingTabs';
import TabSettings from './TabSettings';
import { toast } from 'react-toastify';

function EditTab() {
	const { id } = useParams();
	const [ loader, setLoader ] = useState< boolean >( true );
	const [ activeTab, setActiveTab ] = useState(
		localStorage.getItem( 'manage-tabs-active_tab' ) || 'manage_tab'
	);
	const [ currentTab, setCurrentTab ] = useState( {} );
	const [ copySuccess, setCopySuccess ] = useState( false );

	const [ openDropdown, setOpenDropdown ] = useState( false );
	const [ openDropdownShortCode, setOpenDropdownShortCode ] =
		useState( false );

	const getTitleForTab = ( tab ) => {
		switch ( tab ) {
			case 'manage_tab':
				return getStrings( 'managing-tabs-title' );
			case 'tab_settings':
				return getStrings( 'tab-settings-title' );

			default:
				return getStrings( 'managing-tabs-title' );
		}
	};

	useEffect( () => {
		wp.ajax.send( 'swptls_get_tab', {
			data: {
				nonce: getNonce(),
				id,
			},
			success( { tab } ) {
				setCurrentTab( tab );
			},
			error( error ) {},
		} );
	}, [] );

	const handleActiveTab = ( name ) => {
		localStorage.setItem( 'manage-tabs-active_tab', name );
		setActiveTab( name );
	};

	/**
	 * Handle Next and Back for Tabs movement.
	 */
	const handleNext = () => {
		if ( activeTab === 'manage_tab' ) {
			handleActiveTab( 'tab_settings' );
		}
	};

	const handleBack = () => {
		if ( activeTab === 'tab_settings' ) {
			handleActiveTab( 'manage_tab' );
		}
	};

	const handleUpdateTab = () => {
		wp.ajax.send( 'swptls_save_tab', {
			data: {
				nonce: getNonce(),
				tab: JSON.stringify( currentTab ),
			},
			success( { message } ) {
				toast.success( message );
			},
			error( { message } ) {
				toast.error( message );
			},
		} );
	};

	const handleUpdateTabandRedirect = () => {
		wp.ajax.send( 'swptls_save_tab', {
			data: {
				nonce: getNonce(),
				tab: JSON.stringify( currentTab ),
			},
			success( { message } ) {
				toast.success( message );

				// Redirect to the dashboard.
				const baseUrl = window.location.href.split( '/edit/' )[ 0 ];
				let redirectUrl = baseUrl.endsWith( '/tabs' )
					? baseUrl
					: baseUrl + '/#/tabs';
				window.location.href = redirectUrl;
			},
			error( { message } ) {
				toast.error( message );
			},
		} );
	};

	const handleCopyShortcode = async ( id ) => {
		const shortcode = `[gswpts_tab id="${ id }"]`;

		try {
			await navigator.clipboard.writeText( shortcode );
			setCopySuccess( true );
			toast.success( 'Shortcode copied successfully.' );
			setTimeout( () => {
				setCopySuccess( false );
			}, 1000 );
		} catch ( err ) {
			setCopySuccess( false );
			toast.success( 'Shortcode copy failed.' );
		}
	};

	return (
		<div>
			<div className="navbar-step manage-tab">
				<ul className="navbar-step__tab-list">
					<li
						className={ `${
							activeTab === 'manage_tab' ? 'active' : ''
						}` }
					>
						<a onClick={ () => handleActiveTab( 'manage_tab' ) }>
							<span className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
								>
									<path
										d="M5.15625 0C4.53465 0 3.93851 0.24693 3.49897 0.686468C3.05943 1.12601 2.8125 1.72215 2.8125 2.34375V9.84375C2.8125 10.4654 3.05943 11.0615 3.49897 11.501C3.93851 11.9406 4.53465 12.1875 5.15625 12.1875H12.6562C13.2779 12.1875 13.874 11.9406 14.3135 11.501C14.7531 11.0615 15 10.4654 15 9.84375V2.34375C15 1.72215 14.7531 1.12601 14.3135 0.686468C13.874 0.24693 13.2779 0 12.6562 0H5.15625ZM14.0625 2.34375V2.8125H7.96875C7.84443 2.8125 7.7252 2.76311 7.63729 2.67521C7.54939 2.5873 7.5 2.46807 7.5 2.34375V0.9375H12.6562C13.0292 0.9375 13.3869 1.08566 13.6506 1.34938C13.9143 1.6131 14.0625 1.97079 14.0625 2.34375ZM6.5625 2.34375C6.5625 2.71671 6.71066 3.0744 6.97438 3.33812C7.2381 3.60184 7.59579 3.75 7.96875 3.75H14.0625V9.84375C14.0625 10.2167 13.9143 10.5744 13.6506 10.8381C13.3869 11.1018 13.0292 11.25 12.6562 11.25H5.15625C4.78329 11.25 4.4256 11.1018 4.16188 10.8381C3.89816 10.5744 3.75 10.2167 3.75 9.84375V2.34375C3.75 1.97079 3.89816 1.6131 4.16188 1.34938C4.4256 1.08566 4.78329 0.9375 5.15625 0.9375H6.5625V2.34375ZM9.84375 15C10.3841 15.0001 10.9078 14.8135 11.3264 14.4719C11.7449 14.1302 12.0326 13.6544 12.1406 13.125H11.1703C11.0733 13.3993 10.8937 13.6368 10.6561 13.8047C10.4185 13.9726 10.1347 14.0627 9.84375 14.0625H3.75C3.00408 14.0625 2.28871 13.7662 1.76126 13.2387C1.23382 12.7113 0.9375 11.9959 0.9375 11.25V5.15625C0.937347 4.86532 1.02743 4.5815 1.19534 4.34391C1.36325 4.10633 1.60071 3.92666 1.875 3.82969V2.85938C1.34561 2.96744 0.869815 3.25509 0.528138 3.67364C0.186461 4.09219 -0.000110227 4.61594 4.8857e-08 5.15625V11.25C4.8857e-08 12.2446 0.395088 13.1984 1.09835 13.9016C1.80161 14.6049 2.75544 15 3.75 15H9.84375Z"
										fill="#879EB1"
									/>
								</svg>
							</span>

							<span className="text">
								{ getStrings( 'manage-tab' ) }
							</span>
						</a>
					</li>
					<li
						className={ `${
							activeTab === 'tab_settings' ? 'active' : ''
						}` }
					>
						<a onClick={ () => handleActiveTab( 'tab_settings' ) }>
							<span className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="15"
									viewBox="0 0 18 15"
									fill="none"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M2.85714 1.5C2.49721 1.5 2.15201 1.64298 1.8975 1.8975C1.64298 2.15201 1.5 2.49721 1.5 2.85714V4.21429H16.2857V2.85714C16.2857 2.49721 16.1427 2.15201 15.8882 1.8975C15.6337 1.64298 15.2885 1.5 14.9286 1.5H2.85714ZM1.5 5.21429H16.6464C16.7304 5.21429 16.8135 5.19775 16.8911 5.16562C16.9686 5.1335 17.0391 5.08641 17.0985 5.02704C17.1578 4.96768 17.2049 4.89721 17.2371 4.81964C17.2692 4.74207 17.2857 4.65894 17.2857 4.575V2.85714C17.2857 2.23199 17.0374 1.63244 16.5953 1.19039C16.1533 0.748341 15.5537 0.5 14.9286 0.5H2.85714C2.23199 0.5 1.63244 0.748341 1.19039 1.19039C0.748341 1.63244 0.5 2.23199 0.5 2.85714V12.1429C0.5 12.768 0.748341 13.3676 1.19039 13.8096C1.63244 14.2517 2.23199 14.5 2.85714 14.5H8.42857C8.70471 14.5 8.92857 14.2761 8.92857 14C8.92857 13.7239 8.70471 13.5 8.42857 13.5H2.85714C2.49721 13.5 2.15201 13.357 1.8975 13.1025C1.64298 12.848 1.5 12.5028 1.5 12.1429V9.85714H6.57143C6.84757 9.85714 7.07143 9.63328 7.07143 9.35714C7.07143 9.081 6.84757 8.85714 6.57143 8.85714H1.5V5.21429Z"
										fill="#879EB1"
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M13.5276 7.00392L13.5434 7.00391L14.1609 7.01319C14.1831 7.01356 14.2056 7.01391 14.2272 7.01425C14.6153 7.02036 14.9144 7.02507 15.193 7.11751C15.4366 7.19848 15.6614 7.32823 15.8533 7.49869C16.0733 7.69437 16.2284 7.95383 16.4301 8.29159C16.4397 8.3075 16.4493 8.32359 16.459 8.33986M16.459 8.33986L16.7766 8.87008L16.7846 8.88404L17.0845 9.42341C17.0845 9.42345 17.0845 9.42337 17.0845 9.42341C17.0945 9.44139 17.1045 9.45928 17.1142 9.47682C17.3046 9.81846 17.4505 10.0805 17.5103 10.3665L17.5105 10.3678C17.5626 10.62 17.5626 10.8802 17.5105 11.1325L17.5103 11.1337C17.4505 11.4198 17.3046 11.6818 17.1142 12.0234C17.1045 12.041 17.0946 12.0587 17.0846 12.0767C17.0845 12.0768 17.0846 12.0767 17.0846 12.0767L16.7846 12.6162L16.7764 12.6305L16.4594 13.1588C16.4593 13.159 16.4596 13.1586 16.4594 13.1588C16.4501 13.1744 16.4406 13.1904 16.4315 13.2057C16.2292 13.545 16.0738 13.8058 15.8523 14.0015C15.6605 14.172 15.436 14.3016 15.1924 14.3826L15.0346 13.9082L15.1934 14.3823C14.9144 14.4758 14.6121 14.4799 14.222 14.4853C14.202 14.4856 14.1817 14.4859 14.1612 14.4861C14.161 14.4862 14.1614 14.4861 14.1612 14.4861L13.5442 14.4964L13.5284 14.4964L12.9109 14.4871C12.8887 14.4867 12.8662 14.4864 12.8446 14.486C12.4566 14.4799 12.1574 14.4752 11.8788 14.3828C11.6353 14.3018 11.4104 14.172 11.2185 14.0016C10.9986 13.8059 10.8435 13.5464 10.6417 13.2087C10.6322 13.1928 10.6226 13.1767 10.6128 13.1604L10.2953 12.6302L10.2872 12.6162L9.98734 12.0769C9.98731 12.0768 9.98736 12.0769 9.98734 12.0769C9.97736 12.0589 9.96742 12.0411 9.95767 12.0236C9.76725 11.6818 9.62119 11.4196 9.56146 11.1324L9.56122 11.1312C9.50954 10.8798 9.50954 10.6205 9.56122 10.369L9.56146 10.3679C9.62119 10.0807 9.76725 9.81849 9.95767 9.47668C9.96742 9.45918 9.97729 9.44147 9.98726 9.42354L10.2872 8.88404L10.2955 8.86974L10.6124 8.34152C10.6125 8.34134 10.6123 8.34169 10.6124 8.34152C10.6217 8.32588 10.6313 8.30989 10.6404 8.29458C10.8426 7.95527 10.9981 7.69448 11.2195 7.49876L11.5506 7.87342L11.2182 7.49998C11.4102 7.32902 11.635 7.19898 11.8789 7.11777C12.1578 7.0245 12.4599 7.02034 12.8498 7.01497C12.8698 7.0147 12.8901 7.01442 12.9107 7.01412C12.9109 7.01412 12.9105 7.01413 12.9107 7.01412L13.5276 7.00392M13.5363 8.00391L12.9267 8.014L12.9256 8.01401C12.4413 8.02097 12.3073 8.0289 12.196 8.06619L12.195 8.06651C12.0799 8.10481 11.9737 8.16617 11.8831 8.24686L11.8817 8.24809C11.7939 8.32572 11.7193 8.43807 11.4711 8.8539L11.4705 8.85496L11.1572 9.37716L10.8613 9.90944C10.6264 10.3317 10.5652 10.4534 10.5406 10.571C10.5164 10.6892 10.5164 10.8111 10.5406 10.9293C10.5652 11.0469 10.6263 11.1684 10.8612 11.5907L11.1573 12.1233L11.4707 12.6466C11.7187 13.0613 11.7939 13.175 11.8829 13.2542C11.9735 13.3346 12.0791 13.3955 12.194 13.4337C12.3084 13.4716 12.4428 13.4793 12.9262 13.4872C12.9264 13.4872 12.9261 13.4872 12.9262 13.4872L13.5355 13.4964L14.1451 13.4863L14.1462 13.4863C14.6306 13.4793 14.7645 13.4714 14.8759 13.4341L14.8768 13.4338C14.992 13.3955 15.0981 13.3341 15.1887 13.2534L15.1901 13.2522C15.2779 13.1746 15.3526 13.0622 15.6007 12.6464L15.6013 12.6453L15.9146 12.1231L16.2105 11.5908C16.4455 11.1686 16.5067 11.0468 16.5313 10.9299C16.5556 10.8113 16.5556 10.689 16.5313 10.5704C16.5067 10.4535 16.4455 10.3318 16.2106 9.90958L15.9145 9.37699L15.6011 8.85369C15.3531 8.439 15.2779 8.32527 15.1889 8.24608C15.0984 8.16567 14.9927 8.10472 14.8778 8.06653C14.7634 8.02863 14.629 8.02102 14.1456 8.01307C14.1455 8.01307 14.1457 8.01308 14.1456 8.01307L13.5363 8.00391Z"
										fill="#879EB1"
									/>
									<path
										d="M13.5355 11.6784C14.0483 11.6784 14.4641 11.2627 14.4641 10.7499C14.4641 10.237 14.0483 9.82129 13.5355 9.82129C13.0227 9.82129 12.6069 10.237 12.6069 10.7499C12.6069 11.2627 13.0227 11.6784 13.5355 11.6784Z"
										fill="#879EB1"
									/>
								</svg>
							</span>

							<span className="text">
								{ getStrings( 'tab-settings' ) }
							</span>
						</a>
					</li>
				</ul>
			</div>

			<div className="table-action">
				<div className="action-title">
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
								<span>{ `[gswpts_tab id="${ id }"]` }</span>{ ' ' }
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
							className="table-action__prev"
							onClick={ handleBack }
						>
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
							className="table-action__next"
							onClick={ handleNext }
						>
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
									onClick={ handleUpdateTab }
									className="table-action__save"
								>
									{ getStrings( 'save-and-update' ) }
								</button>
								<span
									onClick={ () =>
										setOpenDropdown( ! openDropdown )
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
									onClick={ () => setOpenDropdown( false ) }
									className="table-action__dropdown-outarea"
								></div>
							) : (
								''
							) }

							<div
								className="table-action__dropdown-menu"
								onClick={ handleUpdateTabandRedirect }
							>
								{ /* Save & go to Manage Tab */ }
								<a>{ getStrings( 'save-and-move' ) }</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="edit-body">
				<div className="tab-card">
					<div
						className={ `edit-tab-content ${
							activeTab === 'manage_tab'
								? 'manage-tab'
								: activeTab === 'tab_settings'
								? 'tab-settings'
								: ''
						}` }
					>
						{ 'manage_tab' === activeTab && (
							<ManagingTabs
								currentTab={ currentTab }
								setCurrentTab={ setCurrentTab }
							/>
						) }

						{ 'tab_settings' === activeTab && (
							<TabSettings
								currentTab={ currentTab }
								setCurrentTab={ setCurrentTab }
							/>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditTab;
