import React, { useState } from 'react';
import { YTiconmini, PlayerRound, Cross } from '../icons';
import { getStrings, getNonce } from './../Helpers';
import how_to_install_video_player from '../images/how-to-install-video-player.png';

import '../styles/_ctaNotice.scss';

interface CtaNoticeProps {
	onDismiss?: () => void;
}

const CtaNotice: React.FC<CtaNoticeProps> = ({ onDismiss }) => {
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

	const handleDismissNotice = async () => {
		setIsDismissing(true);

		try {
			// Make AJAX request to dismiss the notice
			const response = await fetch(ajaxurl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'swptls_dismiss_cta_notice',
					nonce: getNonce(),
				}),
			});

			const result = await response.json();

			if (result.success) {
				// Call the onDismiss callback if provided
				if (onDismiss) {
					onDismiss();
				}
			} else {
				console.error('Failed to dismiss notice:', result.data);
				setIsDismissing(false);
			}
		} catch (error) {
			console.error('Error dismissing notice:', error);
			setIsDismissing(false);
		}
	};

	return (
		<>
			<div className="ctaNotice">
				<div className="gradient-border">
					<div className="content">
						<div className="leftside-content">
							<h6 className="cta-title">Get Help with Table Creation</h6>
							<p className="cta-description">
								Create awesome tables from your Google Sheets. Just paste the link and see the magic
							</p>
						</div>
						<div className="rightside-content">
							<div className="cta-buttons">
								<button
									className="cta-tutorial-button"
									onClick={handleQuickTutorial}
									aria-label="Open quick tutorial video"
								>

									Quick Tutorial

									{YTiconmini}
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
							<h3>Get started with table creation</h3>
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
												alt="Get started with table creation"
												className="cta-video-player-image"
											/>
											<button
												className="cta-video-play-button"
												onClick={() => setIsVideoPlaying(true)}
												aria-label="Play video tutorial"
											>
												{PlayerRound}
											</button>
										</div>
									) : (
										<div className="cta-video-embed">
											<iframe
												src="https://www.youtube.com/embed/1b9QXLg0JdQ?si=xKoYo7HD-wGWevnT"
												title="Get started with table creation"
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

export default CtaNotice;