import React, { useState } from 'react';
import { PlayerRound, Cross } from '../icons';
import how_to_install_video_player from '../images/how-to-install-video-player.png';

import '../styles/_ctaVideoPlayer.scss';

interface CTAVideoPlayerProps {
    videoUrl: string;
    thumbnailUrl?: string;
    title?: string;
    isOpen: boolean;
    onClose: () => void;
}

const CTAVideoPlayer: React.FC<CTAVideoPlayerProps> = ({
    videoUrl,
    thumbnailUrl = how_to_install_video_player,
    title = "Get started with table creation",
    isOpen,
    onClose,
}) => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const handleClose = () => {
        setIsVideoPlaying(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="cta-video-modal-overlay" onClick={handleClose}>
            <div className="cta-video-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cta-video-modal-header">
                    <h3>{title}</h3>
                    <button
                        className="cta-video-modal-close"
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        {Cross}
                    </button>
                </div>
                <div className="cta-video-modal-body">
                    <div className="cta-video-player-container">
                        <div className="cta-video-player-wrapper">
                            {!isVideoPlaying ? (
                                <div className="cta-video-thumbnail">
                                    <img
                                        src={thumbnailUrl}
                                        alt="Video thumbnail"
                                        className="cta-video-player-image"
                                        onClick={() => setIsVideoPlaying(true)}
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
                                        src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&enablejsapi=1`}
                                        title={title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                        </div>

                    </div>

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
                                onClick={handleClose}
                                aria-label="Close modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CTAVideoPlayer;