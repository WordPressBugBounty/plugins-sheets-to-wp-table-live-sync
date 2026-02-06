
import React, { useState } from 'react';
import { PlayerRound, WhitePlusIcon } from '../icons';
import { getStrings } from './../Helpers';
import CTAVideoPlayer from './CTAVideoPlayer';
import how_to_install_video_player from '../images/how-to-install-video-player.png';
import '../styles/_ctaAdd.scss';

const CtaAdd = () => {
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

	const handleCreateTable = () => {
		// Navigate to create table page
		const currentUrl = window.location.href;
		const baseUrl = currentUrl.split('#')[0];
		const newUrl = `${baseUrl}#/tables/create`;
		window.location.href = newUrl;
	};

	return (
		<div className="ctaWrapper">
			<div className="gradient-border">
				<div className="content">
					<div className="leftside-content">
						<h6 className="cta-title">Get started with your first table</h6>
						<p className="cta-description">
							Let's create your first table from Google Sheets – it's as easy as pie!
						</p>
						<button
							className="btn btn-lg cta-button"
							onClick={handleCreateTable}
						>
							{getStrings('new-tables')}
							{WhitePlusIcon}
						</button>
					</div>
					<div className="rightside-content">
						<b className='video-title-text'>Watch a quick tutorial</b>
						<div className="cta-video-player-container">
							<div className="cta-video-player-wrapper">
								<div className="cta-video-thumbnail"
									onClick={() => setIsVideoModalOpen(true)}
								>
									<img
										src={how_to_install_video_player}
										alt="How to install video player"
										className="cta-video-player-image"
									/>
									<button
										className="cta-video-play-button"
										onClick={() => setIsVideoModalOpen(true)}
										aria-label="Play video tutorial"
									>
										{PlayerRound}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<CTAVideoPlayer
				videoUrl="https://www.youtube.com/embed/1b9QXLg0JdQ?si=xKoYo7HD-wGWevnT"
				title="Get started with table creation"
				isOpen={isVideoModalOpen}
				onClose={() => setIsVideoModalOpen(false)}
			/>
		</div>
	);
};

export default CtaAdd;