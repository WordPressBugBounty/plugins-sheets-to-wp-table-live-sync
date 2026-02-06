import React, { useState, useEffect, useRef } from 'react';

import { Link } from 'react-router-dom';
import Card from '../core/Card';
import TabItem from './TabItem';
import CTAVideoPlayer from './CTAVideoPlayer';
import { GrayPlusIcon, Cross, createTable, TabPRObtn, WhitenewPlusIcon } from '../icons';
import Modal from '../core/Modal';
import { getTables, getStrings, getNonce, isProActive, getCta_notice_tabs_status } from './../Helpers';
// import CtaNoticeTabs from './CtaNoticeTabs';
import how_to_install_video_player from '../images/how-to-install-video-player.png';

const TabsList = ({ tabs, setTabs, setTabCount }) => {
	const [loader, setLoader] = useState<boolean>(false);
	const [createTableModal, setCreateTableModal] = useState(false);
	const [tablesLength, setTablesLength] = useState(0);
	// const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	// const [showCtaNotice, setShowCtaNotice] = useState(true);
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // CTA Video Modal

	const createTableModalRef = useRef();
	const handleCreateTablePopup = (e) => {
		e.preventDefault();

		setCreateTableModal(true);
	};

	const handleClosePopup = () => {
		setCreateTableModal(false);
	};
	const handleMovetoDashboard = () => {
		// Remove the 'current' class from the "Manage Tab" li
		const manageTabLi = document.querySelector(
			'#toplevel_page_gswpts-dashboard li.current'
		);
		if (manageTabLi) {
			manageTabLi.classList.remove('current');
		}

		// Add the 'current' class to the "Dashboard" li with the class "wp-first-item"
		const dashboardLi = document.querySelector(
			'#toplevel_page_gswpts-dashboard li.wp-first-item'
		);
		if (dashboardLi) {
			dashboardLi.classList.add('current');
		}
	};

	function handleCancelOutside(event: MouseEvent) {
		if (
			createTableModalRef.current &&
			!createTableModalRef.current.contains(event.target)
		) {
			handleClosePopup();
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleCancelOutside);
		return () => {
			document.removeEventListener('mousedown', handleCancelOutside);
		};
	}, [handleCancelOutside]);

	useEffect(() => {
		setLoader(true);
		if (isProActive()) {
			wp.ajax.send('swptls_get_tabs', {
				data: {
					nonce: getNonce(),
				},
				success(response) {
					setTablesLength(response.tables.length);
					setLoader(false);
				},
				error(error) {
					console.error(error);
				},
			});
		} else {
			const handleClick = () => {
				WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
			};

			const proSettings = document.querySelectorAll(
				'.swptls-pro-settings, .btn-pro-lock'
			);
			proSettings.forEach((item) => {
				item.addEventListener('click', handleClick);
			});

			return () => {
				proSettings.forEach((item) => {
					item.removeEventListener('click', handleClick);
				});
			};
		}
	}, []);

	return (
		<>

			{tabs.length < 1 ? (
				<>
					<div className="no-tables-created-intro text-center">
						<h2>
							{getStrings('no-tab-grp-created')}
						</h2>



						<p>
							{getStrings('tab-groups-will-appear-here')}
						</p>

						{isProActive() ? (
							<Link
								to="/tabs/create"
								className="btn btn-lg tab-btn"
							>
								{getStrings('manage-new-tabs')}
								{WhitenewPlusIcon}
							</Link>
						) : (
							<button
								className="btn btn-lg tab-btn swptls-pro-settings"
								onClick={() => {
									if (typeof WPPOOL !== 'undefined') {
										WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
									}
								}}
							>
								{getStrings('manage-new-tabs')}
								{WhitenewPlusIcon} {TabPRObtn}
							</button>
						)}


						<br />
						<br />

						{isProActive() && (
							<p>
								{getStrings('need-help-watch-a')}{' '}
								<span
									onClick={() => setIsVideoModalOpen(true)}
									style={{
										color: '#575757',
										cursor: 'pointer',
										textDecoration: 'underline'
									}}
								>
									{getStrings('quick-video')}
								</span>
							</p>
						)}

						{isProActive() && (
							<CTAVideoPlayer
								videoUrl="https://www.youtube.com/embed/nG-9-7wM0l0?si=NqhL8C-Z6Eq-4AKL"
								title="Get started with tab creation"
								isOpen={isVideoModalOpen}
								onClose={() => setIsVideoModalOpen(false)}
							/>

						)}
					</div>
				</>
			) : (
				<Card
					customClass={`table-item-card manage-table-card ${!isProActive() ? ` swptls-pro-settings` : ``
						}`}
				>
					{loader && isProActive() ? (
						<Card>
							<h1>{getStrings('loading')}</h1>
						</Card>
					) : (
						// If tabs exist, display them
						tabs.map((tab) => (
							<TabItem
								key={tab.id}
								tab={tab}
								setTabs={setTabs}
								setTabCount={setTabCount}
							/>
						))
					)}
				</Card>
			)}

			{/* Modal */}
			{createTableModal && (
				<Modal>
					<div
						className="create-table-modal-wrap modal-content manage-modal-content"
						ref={createTableModalRef}
					>
						<div
							className="cross_sign"
							onClick={() => handleClosePopup()}
						>
							{Cross}
						</div>
						<div className="create-table-modal">
							<div className="modal-media">{createTable}</div>
							<h2>{getStrings('create-table-to-manage')}</h2>
							<p>{getStrings('do-not-have-table')}</p>
							<Link
								to="/tables/create"
								className="create-table-popup-button btn"
								id="create-table-popup"
								onClick={handleMovetoDashboard}
							>
								{getStrings('create-table')}
							</Link>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};

export default TabsList;
