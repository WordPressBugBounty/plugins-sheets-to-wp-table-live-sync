import React, { useState } from 'react';
import { YTiconmini, Cross } from '../icons';
import { getStrings, getNonce } from './../Helpers';
import how_to_install_video_player from '../images/how-to-install-video-player.png';

import '../styles/_ctaNotice.scss';

interface CtaNoticeTabsProps {
	onDismiss?: () => void;
}

const CtaNoticeTabs: React.FC<CtaNoticeTabsProps> = ({ onDismiss }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [isDismissing, setIsDismissing] = useState(false);

	const handleQuickTutorial = () => {
		setIsModalOpen(true);
		setIsVideoPlaying(false); // Reset video state when opening modal
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsVideoPlaying(false);
	};

	const handleDismissNotice = () => {
		setIsDismissing(true);

		wp.ajax.send('swptls_dismiss_cta_notice_tabs', {
			data: {
				nonce: getNonce(),
			},
			success() {
				// Call the onDismiss callback if provided
				if (onDismiss) {
					onDismiss();
				}
			},
			error(error) {
				console.error('Failed to dismiss tabs notice:', error);
				setIsDismissing(false);
			},
		});
	};

	return (
		<>
			<div className="ctaNotice">
				<div className="gradient-border">
					<div className="content">
						<div className="leftside-content">
							<h6 className="cta-title">Get Help with Creating Tab Groups</h6>
							<p className="cta-description">
								Tabs let you group multiple tables into tabbed views and embed in your pages or posts
							</p>
						</div>
						<div className="rightside-content">
							<div className="cta-buttons">
								<button
									className="cta-tutorial-button"
									onClick={handleQuickTutorial}
									aria-label="Open quick tutorial video for tab groups"
								>
									{YTiconmini}
									Quick Tutorial
								</button>
								<button
									className="cta-close-button"
									onClick={handleDismissNotice}
									disabled={isDismissing}
									aria-label="Dismiss this notice"
								>
									{isDismissing ? 'Closing...' : 'Close'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Video Tutorial Modal */}
			{isModalOpen && (
				<div className="cta-modal-overlay" onClick={handleCloseModal}>
					<div className="cta-modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="cta-modal-header">
							<h3>Get started with Tab Groups</h3>
							<button
								className="cta-modal-close"
								onClick={handleCloseModal}
								aria-label="Close modal"
							>
								{Cross}
							</button>
						</div>
						<div className="cta-modal-body">
							<div className="cta-video-player-container">
								<div className="cta-video-player-wrapper">
									{!isVideoPlaying ? (
										<div className="cta-video-thumbnail"
											onClick={() => setIsVideoPlaying(true)}
										>
											<img
												src={how_to_install_video_player}
												alt="Get started with tab groups"
												className="cta-video-player-image"
											/>
											<button
												className="cta-video-play-button"
												onClick={() => setIsVideoPlaying(true)}
												aria-label="Play tab groups tutorial"
											>
												{YTiconmini}
											</button>
										</div>
									) : (
										<div className="cta-video-embed">
											<iframe
												src="https://www.youtube.com/embed/nG-9-7wM0l0?si=NqhL8C-Z6Eq-4AKL"
												title="Get started with tab groups"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
												allowFullScreen
											></iframe>
										</div>
									)}
								</div>
							</div>

							{/* Description and Actions */}
							<div className="cta-modal-description">

								<div className="modal-actions">
									<button
										className="modal-docs-button"
										onClick={() => window.open('https://wppool.dev/docs/what-is-sheets-to-wp-table-live-sync/', '_blank', 'noopener,noreferrer')}
										aria-label="Read documentation - opens in new tab"
									>
										Read Documentation
									</button>
									<button
										className="modal-close-button"
										onClick={handleCloseModal}
										aria-label="Close modal"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default CtaNoticeTabs;