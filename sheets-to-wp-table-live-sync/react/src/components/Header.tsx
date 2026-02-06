import React, { useState } from 'react';
import { Thunder, YTTutorial, HelpIcon } from './../icons';
import { isProActive, getStrings } from '../Helpers';
import CTAVideoPlayer from './CTAVideoPlayer';

//styles
import '../styles/_header.scss';
import ChangesLog from './ChangesLog';

interface HeaderProps {
	title?: string;
	description?: string;
	showChangesLog?: boolean;
	showProFeatures?: boolean;
	showYoutubeTutorial?: boolean;
	customClass?: string;
	modalTitle?: string;
	videoURL?: string;
}

function Header({
	title = getStrings('dashboard'),
	description = getStrings('Dashboard-title'),
	showChangesLog = true,
	showProFeatures = true,
	showYoutubeTutorial = true,
	customClass = '',
	modalTitle = 'Get started with table creation',
	videoURL = 'https://www.youtube.com/embed/1b9QXLg0JdQ?si=xKoYo7HD-wGWevnT'
}: HeaderProps) {
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

	return (
		<header className={`swptls-header-wrap ${customClass}`}>
			<div className="header-section">
				<div className="header-title-section">
					<h5 className="header-title">{title}</h5>
					<p>{description}</p>
				</div>
				<div className="new-unlock-block">
					{showProFeatures && !isProActive() && (
						<div className="unlock">
							<div className="unlock-item">
								<div className="icon">{Thunder}</div>
								<p>
									<a
										className="get-ultimate"
										href="https://go.wppool.dev/KfVZ"
										target="_blank"
									>
										{getStrings('get-unlimited-access')}
									</a>
								</p>
							</div>
						</div>
					)}

					{showYoutubeTutorial && (
						<div className="unlock">
							<div className="unlock-item"
								onClick={() => setIsVideoModalOpen(true)}>
								{/* <div className="icon">{YTTutorial}</div>
								<p>{getStrings('Youtube-title')}</p> */}
								<div className="icon">{HelpIcon}</div>
								<p>{getStrings('help-text')}</p>
							</div>
						</div>
					)}

					{showChangesLog && <ChangesLog />}
				</div>

				<CTAVideoPlayer
					// videoUrl="https://www.youtube.com/embed/1b9QXLg0JdQ?si=xKoYo7HD-wGWevnT"
					videoUrl={videoURL}
					title={modalTitle} // Use the prop for title dynamic 
					// title="Get started with table creation"
					isOpen={isVideoModalOpen}
					onClose={() => setIsVideoModalOpen(false)}
				/>

			</div>
		</header>
	);
}

export default Header;
