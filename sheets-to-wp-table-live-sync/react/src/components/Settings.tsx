import React, { useState, useEffect, useRef } from 'react';
import { Route } from 'react-router-dom';
import { toast } from 'react-toastify';
import Tooltip from './Tooltip';
import { infoIcon, Unlock } from '../icons';
import Modal from './../core/Modal';
import '../styles/_code.scss';
import '../styles/_header.scss';
import '../styles/_settings.scss';
import ChangesLog from './ChangesLog';
import { getNonce, isProActive, getStrings } from './../Helpers';

import CodeEditor from '@uiw/react-textarea-code-editor';

function Settings() {
	const [ importModal, setImportModal ] = useState< boolean >( false );
	const confirmImportRef = useRef();

	const [ settings, setSettings ] = useState( {
		css_code_value: '',
		async_loading: 'on',
		link_support: 'smart_link',
		script_support: 'global_loading',
	} );

	const [ activeTab, setActiveTab ] = useState(
		localStorage.getItem( 'setting-active_tab' ) || 'general'
	);

	const handleActiveTab = ( name ) => {
		localStorage.setItem( 'manage-tabs-active_tab', name );
		setActiveTab( name );
	};

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

		wp.ajax.send( 'swptls_get_settings', {
			data: {
				nonce: getNonce(),
			},
			success( { css, async, link_support, script_support } ) {
				setSettings( {
					css_code_value: css,
					async_loading: async,
					link_support: link_support,
					script_support: script_support,
				} );
			},
			error( error ) {
				// console.log(error);
			},
		} );

		return () => {
			proSettings.forEach( ( item ) => {
				item.removeEventListener( 'click', handleClick );
			} );
		};
	}, [] );

	const handleSaveSettings = ( e ) => {
		e.preventDefault();

		wp.ajax.send( 'swptls_save_settings', {
			data: {
				nonce: getNonce(),
				settings: JSON.stringify( settings ),
			},
			success( { message, css, async, link_support, script_support } ) {
				setSettings( {
					css_code_value: css,
					async_loading: async,
					link_support: link_support,
					script_support: script_support,
				} );

				toast.success( message );
			},
			error( error ) {
				// console.log(error);
			},
		} );
	};

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
		<>
			<header className="setting-header">
				<h5 className="setting-title">Settings</h5>
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

			<div className="setting-navbar">
				<div className="setting-navbar__nav">
					<button
						className={ `setting-tab ${
							activeTab === 'general' ? 'active' : ''
						}` }
						onClick={ () => handleActiveTab( 'general' ) }
					>
						<span className="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="15"
								height="17"
								viewBox="0 0 15 17"
								fill="none"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M7.45632 5.75293C6.72775 5.75293 6.02901 6.04235 5.51383 6.55753C4.99865 7.07271 4.70923 7.77145 4.70923 8.50002C4.70923 9.2286 4.99865 9.92733 5.51383 10.4425C6.02901 10.9577 6.72775 11.2471 7.45632 11.2471C8.1849 11.2471 8.88363 10.9577 9.39881 10.4425C9.91399 9.92733 10.2034 9.2286 10.2034 8.50002C10.2034 7.77145 9.91399 7.07271 9.39881 6.55753C8.88363 6.04235 8.1849 5.75293 7.45632 5.75293ZM5.80807 8.50002C5.80807 8.06288 5.98172 7.64364 6.29083 7.33453C6.59994 7.02542 7.01918 6.85177 7.45632 6.85177C7.89347 6.85177 8.31271 7.02542 8.62181 7.33453C8.93092 7.64364 9.10458 8.06288 9.10458 8.50002C9.10458 8.93717 8.93092 9.35641 8.62181 9.66552C8.31271 9.97462 7.89347 10.1483 7.45632 10.1483C7.01918 10.1483 6.59994 9.97462 6.29083 9.66552C5.98172 9.35641 5.80807 8.93717 5.80807 8.50002Z"
									fill="#666873"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M7.43802 0.625C7.11203 0.625 6.84025 0.625 6.61755 0.639651C6.38992 0.64913 6.16542 0.696159 5.95312 0.778837C5.70863 0.879996 5.48646 1.02833 5.29931 1.21536C5.11215 1.40239 4.96367 1.62446 4.86234 1.86888C4.75612 2.12528 4.72755 2.39633 4.71583 2.69081C4.71466 2.79852 4.68615 2.90415 4.63297 2.99782C4.5798 3.09149 4.5037 3.17011 4.41182 3.22631C4.31723 3.27796 4.21107 3.30472 4.10331 3.30408C3.99554 3.30344 3.8897 3.27542 3.79574 3.22265C3.53495 3.08493 3.28588 2.97431 3.01044 2.93769C2.74814 2.90318 2.48162 2.92068 2.22608 2.98919C1.97055 3.05769 1.73101 3.17585 1.52115 3.33693C1.3437 3.47969 1.19099 3.65071 1.06916 3.84313C0.944623 4.0292 0.808367 4.26435 0.64574 4.54638L0.627426 4.57862C0.464065 4.86065 0.328542 5.0958 0.230379 5.29652C0.127821 5.50603 0.0472395 5.71262 0.0179372 5.94117C-0.0519486 6.47081 0.0913979 7.00651 0.416449 7.43047C0.58567 7.65097 0.80617 7.8114 1.05524 7.96816C1.1481 8.02306 1.22546 8.10068 1.28006 8.19372C1.33465 8.28676 1.36468 8.39216 1.36731 8.5C1.36468 8.60784 1.33465 8.71324 1.28006 8.80628C1.22546 8.89932 1.1481 8.97694 1.05524 9.03184C0.80617 9.1886 0.586402 9.34904 0.416449 9.56954C0.255372 9.7794 0.137208 10.0189 0.0687057 10.2745C0.000203239 10.53 -0.0172968 10.7965 0.0172047 11.0588C0.0472396 11.2874 0.127088 11.494 0.229647 11.7035C0.328542 11.9042 0.464065 12.1393 0.627426 12.4214L0.64574 12.4536C0.808367 12.7357 0.944623 12.9708 1.06916 13.1569C1.19882 13.3495 1.33801 13.5232 1.52115 13.6623C1.73096 13.8235 1.97047 13.9418 2.22601 14.0105C2.48154 14.0791 2.74809 14.0967 3.01044 14.0623C3.28588 14.0257 3.53495 13.9158 3.79574 13.7773C3.88959 13.7246 3.9953 13.6967 4.10294 13.696C4.21058 13.6954 4.31661 13.7221 4.41109 13.7737C4.50348 13.8295 4.58005 13.9079 4.63353 14.0017C4.687 14.0954 4.71558 14.2013 4.71657 14.3092C4.72755 14.6037 4.75612 14.8747 4.86308 15.1311C4.96424 15.3756 5.11257 15.5978 5.2996 15.7849C5.48663 15.9721 5.7087 16.1206 5.95312 16.2219C6.16557 16.3098 6.38533 16.3442 6.61755 16.3596C6.84025 16.375 7.11203 16.375 7.43802 16.375H7.47465C7.80063 16.375 8.07241 16.375 8.29511 16.3603C8.52807 16.3442 8.7471 16.3098 8.95954 16.2212C9.20403 16.12 9.4262 15.9717 9.61336 15.7846C9.80052 15.5976 9.949 15.3755 10.0503 15.1311C10.1565 14.8747 10.1851 14.6037 10.1968 14.3092C10.1979 14.2014 10.2263 14.0956 10.2795 14.0018C10.3327 13.908 10.4089 13.8292 10.5008 13.773C10.5955 13.7214 10.7017 13.6948 10.8095 13.6956C10.9172 13.6963 11.023 13.7245 11.1169 13.7773C11.3777 13.9151 11.6268 14.0257 11.9022 14.0616C12.4319 14.1315 12.9676 13.9881 13.3915 13.6631C13.5747 13.5224 13.7138 13.3495 13.8435 13.1569C13.968 12.9708 14.1043 12.7357 14.2669 12.4536L14.2852 12.4214C14.4486 12.1393 14.5841 11.9042 14.6823 11.7035C14.7848 11.494 14.8654 11.2867 14.8947 11.0588C14.9646 10.5292 14.8213 9.99349 14.4962 9.56954C14.327 9.34904 14.1065 9.1886 13.8574 9.03184C13.7646 8.97694 13.6872 8.89932 13.6326 8.80628C13.578 8.71324 13.548 8.60784 13.5454 8.5C13.5454 8.29635 13.6567 8.09416 13.8574 7.96816C14.1065 7.8114 14.3263 7.65097 14.4962 7.43047C14.6573 7.2206 14.7755 6.98106 14.844 6.72553C14.9125 6.46999 14.93 6.20347 14.8955 5.94117C14.8606 5.71607 14.7888 5.49826 14.683 5.29652C14.5579 5.05313 14.4253 4.81371 14.2852 4.57862L14.2669 4.54638C14.1331 4.30763 13.9919 4.0731 13.8435 3.84313C13.7217 3.65092 13.569 3.48013 13.3915 3.33766C13.1817 3.17646 12.9422 3.05816 12.6867 2.98953C12.4311 2.9209 12.1646 2.90329 11.9022 2.93769C11.6268 2.97431 11.3777 3.0842 11.1169 3.22265C11.023 3.27529 10.9173 3.30324 10.8097 3.30388C10.7021 3.30452 10.5961 3.27783 10.5016 3.22631C10.4094 3.17029 10.333 3.09174 10.2796 2.99806C10.2262 2.90438 10.1974 2.79865 10.1961 2.69081C10.1851 2.39633 10.1565 2.12528 10.0496 1.86888C9.94843 1.62439 9.8001 1.40222 9.61307 1.21507C9.42603 1.02791 9.20397 0.879427 8.95954 0.778105C8.7471 0.690198 8.52733 0.655767 8.29511 0.640384C8.07241 0.625 7.80063 0.625 7.47465 0.625H7.43802ZM6.37361 1.79343C6.43002 1.76999 6.51573 1.74874 6.69227 1.73629C6.87322 1.72384 7.10764 1.72384 7.45633 1.72384C7.80503 1.72384 8.03945 1.72384 8.22039 1.73629C8.39694 1.74874 8.48265 1.76999 8.53905 1.79343C8.76395 1.88647 8.94196 2.06448 9.035 2.28937C9.0643 2.3597 9.08847 2.47031 9.098 2.73184C9.11997 3.31202 9.41959 3.87097 9.95143 4.17791C10.4833 4.48558 11.1169 4.46507 11.6304 4.19402C11.8619 4.07169 11.9696 4.03726 12.0458 4.02773C12.2865 3.99593 12.53 4.06101 12.7227 4.20867C12.771 4.24604 12.8326 4.30977 12.9315 4.45628C13.0333 4.60719 13.1505 4.8101 13.3249 5.11192C13.4992 5.41373 13.6157 5.61738 13.6955 5.78001C13.7739 5.93898 13.7981 6.02395 13.8054 6.08476C13.8372 6.32545 13.7721 6.56892 13.6245 6.76164C13.5776 6.82244 13.4941 6.89863 13.2728 7.03781C12.7806 7.34695 12.4465 7.88612 12.4465 8.5C12.4465 9.11388 12.7806 9.65305 13.2728 9.96219C13.4941 10.1014 13.5776 10.1776 13.6245 10.2384C13.7724 10.431 13.8369 10.6742 13.8054 10.9152C13.7981 10.976 13.7732 11.0618 13.6955 11.22C13.6157 11.3833 13.4992 11.5863 13.3249 11.8881C13.1505 12.1899 13.0326 12.3928 12.9315 12.5437C12.8326 12.6902 12.771 12.754 12.7227 12.7913C12.53 12.939 12.2865 13.0041 12.0458 12.9723C11.9696 12.9627 11.8627 12.9283 11.6304 12.806C11.1177 12.5349 10.4833 12.5144 9.95143 12.8214C9.41959 13.129 9.11997 13.688 9.098 14.2682C9.08847 14.5297 9.0643 14.6403 9.035 14.7106C8.98897 14.8218 8.92149 14.9229 8.83639 15.008C8.75129 15.0931 8.65025 15.1606 8.53905 15.2066C8.48265 15.23 8.39694 15.2513 8.22039 15.2637C8.03945 15.2762 7.80503 15.2762 7.45633 15.2762C7.10764 15.2762 6.87322 15.2762 6.69227 15.2637C6.51573 15.2513 6.43002 15.23 6.37361 15.2066C6.26241 15.1606 6.16137 15.0931 6.07628 15.008C5.99118 14.9229 5.92369 14.8218 5.87767 14.7106C5.84837 14.6403 5.82419 14.5297 5.81467 14.2682C5.79269 13.688 5.49308 13.129 4.96124 12.8221C4.4294 12.5144 3.79574 12.5349 3.28222 12.806C3.05073 12.9283 2.94304 12.9627 2.86686 12.9723C2.62616 13.0041 2.38269 12.939 2.18997 12.7913C2.14162 12.754 2.08009 12.6902 1.98119 12.5437C1.84341 12.3292 1.71222 12.1106 1.58781 11.8881C1.41346 11.5863 1.29698 11.3826 1.21713 11.22C1.13875 11.061 1.11458 10.976 1.10725 10.9152C1.07545 10.6746 1.14053 10.4311 1.28819 10.2384C1.33508 10.1776 1.41859 10.1014 1.63982 9.96219C2.1321 9.65305 2.46615 9.11388 2.46615 8.5C2.46615 7.88612 2.1321 7.34695 1.63982 7.03781C1.41859 6.89863 1.33508 6.82244 1.28819 6.76164C1.14053 6.56892 1.07545 6.32545 1.10725 6.08476C1.11458 6.02395 1.13948 5.93824 1.21713 5.78001C1.29698 5.61665 1.41346 5.41373 1.58781 5.11192C1.76216 4.8101 1.8801 4.60719 1.98119 4.45628C2.08009 4.30977 2.14162 4.24604 2.18997 4.20867C2.38269 4.06101 2.62616 3.99593 2.86686 4.02773C2.94304 4.03726 3.05 4.07169 3.28222 4.19402C3.79501 4.46507 4.4294 4.48558 4.96124 4.17791C5.49308 3.87097 5.79269 3.31202 5.81467 2.73184C5.82419 2.47031 5.84837 2.3597 5.87767 2.28937C5.97071 2.06448 6.14872 1.88647 6.37361 1.79343Z"
									fill="#666873"
								/>
							</svg>
						</span>
						<span>General</span>
					</button>
					<button
						className={ `setting-tab ${
							activeTab === 'performance' ? 'active' : ''
						}` }
						onClick={ () => handleActiveTab( 'performance' ) }
					>
						<span className="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="15"
								height="17"
								viewBox="0 0 15 17"
								fill="none"
							>
								<path
									d="M11.9811 10.6733C11.8215 11.5316 11.3927 12.3222 10.7524 12.9387C10.112 13.5552 9.29093 13.968 8.39958 14.1215C8.36574 14.1267 8.33154 14.1294 8.29727 14.1296C8.14291 14.1296 7.9942 14.0737 7.88063 13.973C7.76707 13.8723 7.69694 13.7342 7.68416 13.5861C7.67138 13.4379 7.71688 13.2906 7.81164 13.1732C7.9064 13.0559 8.04349 12.9771 8.19574 12.9526C9.47035 12.7459 10.5519 11.7044 10.768 10.4748C10.7954 10.3198 10.8855 10.1816 11.0187 10.0906C11.1518 9.99958 11.3171 9.96325 11.478 9.98958C11.639 10.0159 11.7825 10.1027 11.877 10.2309C11.9715 10.3592 12.0092 10.5183 11.9819 10.6733H11.9811ZM14.4511 9.98143C14.4511 11.7103 13.7379 13.3683 12.4685 14.5908C11.199 15.8132 9.4772 16.5 7.68189 16.5C5.88658 16.5 4.1648 15.8132 2.89532 14.5908C1.62584 13.3683 0.912659 11.7103 0.912659 9.98143C0.912659 7.91327 1.75881 5.79844 3.42497 3.6962C3.47771 3.62963 3.5445 3.57459 3.62093 3.53468C3.69737 3.49478 3.78173 3.47093 3.86843 3.4647C3.95514 3.45847 4.04223 3.47001 4.12397 3.49855C4.20571 3.52709 4.28025 3.57198 4.34266 3.63027L6.19804 5.36436L7.89035 0.889513C7.92416 0.800263 7.97976 0.720149 8.05246 0.655925C8.12515 0.591701 8.21282 0.545249 8.30807 0.520486C8.40331 0.495722 8.50334 0.493373 8.59973 0.513637C8.69611 0.5339 8.78603 0.576182 8.86189 0.636918C10.5442 1.98137 14.4511 5.5777 14.4511 9.98143ZM13.2204 9.98143C13.2204 6.56733 10.4673 3.61694 8.74266 2.10508L7.02958 6.62881C6.99442 6.72173 6.93568 6.80469 6.8587 6.87014C6.78172 6.93559 6.68896 6.98145 6.58886 7.00355C6.48876 7.02564 6.38452 7.02325 6.28562 6.99662C6.18673 6.96998 6.09633 6.91993 6.02266 6.85104L3.9942 4.95621C2.76574 6.66363 2.14343 8.35179 2.14343 9.98143C2.14343 11.3959 2.72694 12.7525 3.76561 13.7527C4.80427 14.7529 6.213 15.3148 7.68189 15.3148C9.15078 15.3148 10.5595 14.7529 11.5982 13.7527C12.6368 12.7525 13.2204 11.3959 13.2204 9.98143Z"
									fill="#666873"
								/>
							</svg>
						</span>
						<span>Performance</span>
					</button>

					<button
						className={ `setting-tab ${
							activeTab === 'custom_css' ? 'active' : ''
						}` }
						onClick={ () => handleActiveTab( 'custom_css' ) }
					>
						<span className="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="21"
								height="17"
								viewBox="0 0 21 17"
								fill="none"
							>
								<path
									d="M12.8527 0.361649C13.0448 0.412993 13.2087 0.538546 13.3082 0.710697C13.4078 0.882848 13.4349 1.0875 13.3837 1.27965L9.41066 16.1096C9.35907 16.3019 9.23322 16.4658 9.06078 16.5653C8.88834 16.6648 8.68344 16.6917 8.49116 16.6402C8.29888 16.5886 8.13496 16.4627 8.03547 16.2903C7.93599 16.1178 7.90907 15.9129 7.96066 15.7206L11.9347 0.890649C11.9602 0.795496 12.0042 0.706303 12.0642 0.628167C12.1242 0.55003 12.199 0.484481 12.2844 0.435263C12.3697 0.386045 12.4639 0.354123 12.5616 0.341321C12.6593 0.328518 12.7585 0.335086 12.8537 0.360649L12.8527 0.361649ZM15.1157 3.41365C15.2487 3.26582 15.435 3.17688 15.6336 3.16638C15.8322 3.15587 16.0268 3.22468 16.1747 3.35765L17.9117 4.92165C18.6487 5.58365 19.2587 6.13365 19.6787 6.63165C20.1187 7.15665 20.4327 7.71965 20.4327 8.41565C20.4327 9.11065 20.1197 9.67365 19.6787 10.1976C19.2587 10.6966 18.6487 11.2466 17.9117 11.9086L16.1747 13.4726C16.0268 13.6058 15.8321 13.6747 15.6334 13.6643C15.4347 13.6539 15.2483 13.565 15.1152 13.4171C14.982 13.2693 14.9131 13.0746 14.9235 12.8759C14.9339 12.6772 15.0228 12.4908 15.1707 12.3576L16.8677 10.8306C17.6557 10.1216 18.1867 9.64065 18.5307 9.23265C18.8607 8.83965 18.9327 8.61065 18.9327 8.41465C18.9327 8.21965 18.8607 7.99065 18.5307 7.59765C18.1867 7.18865 17.6557 6.70765 16.8677 5.99965L15.1707 4.47265C15.0973 4.40677 15.0377 4.32707 14.9952 4.23812C14.9526 4.14917 14.9281 4.05271 14.9229 3.95426C14.9177 3.85581 14.9319 3.7573 14.9649 3.66436C14.9978 3.57143 15.0487 3.48589 15.1147 3.41265L15.1157 3.41365ZM6.17466 4.47265C6.24787 4.40673 6.30738 4.32703 6.34979 4.2381C6.3922 4.14918 6.41669 4.05278 6.42184 3.95439C6.42699 3.85601 6.41272 3.75757 6.37983 3.66471C6.34694 3.57184 6.29608 3.48636 6.23016 3.41315C6.16424 3.33994 6.08454 3.28043 5.99561 3.23802C5.90669 3.1956 5.81029 3.17112 5.7119 3.16597C5.61352 3.16082 5.51508 3.17509 5.42222 3.20798C5.32935 3.24087 5.24387 3.29173 5.17066 3.35765L3.43366 4.92165C2.69666 5.58365 2.08666 6.13365 1.66666 6.63165C1.22666 7.15665 0.912659 7.71965 0.912659 8.41565C0.912659 9.11065 1.22566 9.67365 1.66666 10.1976C2.08666 10.6966 2.69666 11.2466 3.43366 11.9086L5.17066 13.4726C5.31852 13.6058 5.51321 13.6747 5.7119 13.6643C5.9106 13.6539 6.09702 13.565 6.23016 13.4171C6.3633 13.2693 6.43225 13.0746 6.42184 12.8759C6.41143 12.6772 6.32252 12.4908 6.17466 12.3576L4.47766 10.8306C3.68966 10.1216 3.15866 9.64065 2.81466 9.23265C2.48466 8.83965 2.41266 8.61065 2.41266 8.41465C2.41266 8.21965 2.48466 7.99065 2.81466 7.59765C3.15866 7.18865 3.68966 6.70765 4.47766 5.99965L6.17466 4.47265Z"
									fill="#666873"
								/>
							</svg>
						</span>
						<span>Custom CSS</span>
					</button>

					<button className="save-settings-btn">
						<div className="btn-box text-right">
							<button
								className="btn"
								onClick={ ( e ) => handleSaveSettings( e ) }
							>
								{ getStrings( 'save-settings' ) }
							</button>
						</div>
					</button>
				</div>
			</div>

			<div className="setting-tab-content">
				{ 'general' === activeTab && (
					<>
						<div className="asynchronous-loading-setting">
							{ /* Link support new*/ }
							<div className="swptls-link-support">
								<div className="title">
									<label htmlFor="link-support">
										{ getStrings( 'choose-link-support' ) }
									</label>
									{ /* {<button className='btn-pro btn-new'>{getStrings('new')}</button>} */ }
								</div>
								<div className="link-modes">
									<input
										type="radio"
										name="link_support"
										id="smart_link"
										value="smart_link"
										checked={
											settings.link_support ===
											'smart_link'
										}
										onChange={ () =>
											setSettings( {
												...settings,
												link_support: 'smart_link',
											} )
										}
									/>
									<label
										className="smart_link"
										htmlFor="smart_link"
									>
										{ getStrings( 'with-smart-link' ) }
									</label>
									<Tooltip
										content={ getStrings( 'tooltip-18' ) }
									/>
									{
										<button className="btn-pro recommended-pro">
											{ getStrings( 'recommended' ) }
										</button>
									}
								</div>
								<div className="link-modes">
									<input
										type="radio"
										name="link_support"
										id="pretty_link"
										value="pretty_link"
										checked={
											settings.link_support ===
											'pretty_link'
										}
										onChange={ () =>
											setSettings( {
												...settings,
												link_support: 'pretty_link',
											} )
										}
									/>
									<label htmlFor="pretty_link">
										{ getStrings( 'with-pretty-link' ) }
									</label>
									<Tooltip
										content={ getStrings( 'tooltip-19' ) }
									/>
								</div>
							</div>
						</div>

						{ /* <div className='btn-box text-right'>
							<button
								className="btn"
								onClick={(e) => handleSaveSettings(e)}
							>
								{getStrings('save-settings')}
							</button>
						</div> */ }
					</>
				) }

				{ 'performance' === activeTab && (
					<>
						{ /* Script loading support new*/ }

						<div className="swptls-async-settings">
							<div className="async_loading">
								<input
									type="checkbox"
									name="async_loading"
									id="async-loading"
									checked={ settings.async_loading === 'on' }
									onChange={ ( e ) =>
										setSettings( {
											...settings,
											async_loading: e.target.checked
												? 'on'
												: '',
										} )
									}
								/>
								<label htmlFor="async-loading">
									{ getStrings( 'asynchronous-loading' ) }
								</label>
							</div>
							<p>{ getStrings( 'async-content' ) }</p>
						</div>

						<div className={ `swptls-performance-settings` }>
							{ /* <div className="title">
								{getStrings('performance')}
								<Tooltip content={`Write your own custom CSS to design the table or the page itself.`} />
								{<button className='btn-pro btn-new'>{getStrings('new')}</button>}
							</div> */ }
							<p className="performance-title">
								{ getStrings( 'script-content' ) }
							</p>
							<div className="scripts-modes">
								<input
									type="radio"
									name="script_support"
									className="global_loading_field"
									id="global_loading"
									value="global_loading"
									checked={
										settings.script_support ===
										'global_loading'
									}
									onChange={ () =>
										setSettings( {
											...settings,
											script_support: 'global_loading',
										} )
									}
								/>
								<label
									className="link_support"
									htmlFor="global_loading"
								>
									{ getStrings( 'global-loading' ) }
								</label>
							</div>
							<p className="tooltip-content">
								{ getStrings( 'global-loading-details' ) }
							</p>
							<div
								className={ `scripts-modes${
									! isProActive()
										? ` swptls-pro-settings`
										: ``
								}` }
							>
								{ /* <div className='scripts-modes'> */ }
								<input
									type="radio"
									name="script_support"
									className={ `optimized_loading_field${
										! isProActive()
											? ` swptls-pro-settings`
											: ``
									}` }
									id="optimized_loading"
									value="optimized_loading"
									checked={
										settings.script_support ===
										'optimized_loading'
									}
									onChange={ () =>
										setSettings( {
											...settings,
											script_support: 'optimized_loading',
										} )
									}
								/>
								<label
									className={ `link_support${
										! isProActive()
											? ` swptls-pro-settings`
											: ``
									}` }
									htmlFor="optimized_loading"
								>
									{ getStrings( 'optimized-loading' ) }
								</label>
								{ /* {<button className='btn-pro recommended-pro'>{getStrings('recommended')}</button>} */ }
								{ ! isProActive() && (
									<button className="btn-pro">
										{ getStrings( 'pro' ) }
									</button>
								) }
							</div>
							<p
								className={ `tooltip-content${
									! isProActive()
										? ` swptls-pro-settings`
										: ``
								}` }
							>
								{ getStrings( 'optimized-loading-details' ) }
							</p>
						</div>

						{ /* <div className='btn-box text-right'>
							<button
								className="btn"
								onClick={(e) => handleSaveSettings(e)}
							>
								{getStrings('save-settings')}
							</button>
						</div> */ }
					</>
				) }

				{ 'custom_css' === activeTab && (
					<>
						{ /* CSS Support  */ }
						<div
							className={ `swptls-custom-css-settings${
								! isProActive() ? ` swptls-pro-settings` : ``
							}` }
						>
							<div className="title">
								{ getStrings( 'custom-css' ) }
								{ /* <span className='info'>{infoIcon}</span> */ }
								<Tooltip
									content={ `Write your own custom CSS to design the table or the page itself.` }
								/>
								{ ! isProActive() && (
									<button className="btn-pro">
										{ getStrings( 'pro' ) }
									</button>
								) }
							</div>
							<p className="custom-css-desc">
								{ getStrings( 'write-own-css' ) }
							</p>
							<CodeEditor
								value={ settings.css_code_value }
								language="css"
								placeholder="# # Insert custom CSS code here to modify looks and feel"
								onChange={ ( evn ) =>
									setSettings( {
										...settings,
										css_code_value: evn.target.value,
									} )
								}
								padding={ 15 }
								minHeight={ 350 }
								style={ {
									fontFamily:
										'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
									fontSize: 12,
								} }
							/>
						</div>
						{ /* <div className='btn-box text-right'>
							<button
								className="btn"
								onClick={(e) => handleSaveSettings(e)}
							>
								{getStrings('save-settings')}
							</button>
						</div> */ }
					</>
				) }
			</div>
		</>
	);
}

export default Settings;
