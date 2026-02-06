import React from 'react';
import { book, videoPlay, support, YTTutorial, HelpDoc1, HelpDoc2, HelpDoc3, HelpDoc4 } from '../icons';
import { getStrings } from './../Helpers';

import '../styles/_resource.scss';

const Resource = () => {
	const resourceItems = [
		{
			id: 1,
			icon: HelpDoc4,
			title: 'Documentation',
			description: 'Find comprehensive guides and step-by-step instructions to get the most out of FlexTable',
			ctaText: 'Open Docs',
			ctaLink: 'https://wppool.dev/flextable-documentation',
		},
		{
			id: 2,
			icon: HelpDoc2,
			title: 'Video Tutorials',
			description: 'Watch detailed video tutorials to learn FlexTable features and best practices',
			ctaText: 'Watch Videos',
			ctaLink: 'https://youtu.be/hKYqE4e_ipY?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP',
		},
		{
			id: 3,
			icon: HelpDoc3,
			title: 'Get Support',
			description: 'Need help? Our support team is ready to assist you with any questions or issues',
			ctaText: 'Contact Support',
			ctaLink: 'https://wordpress.org/support/plugin/sheets-to-wp-table-live-sync/',
		},
		{
			id: 4,
			icon: HelpDoc1,
			title: 'Community Forum',
			description: 'Join our community to share ideas, get tips, and connect with other FlexTable users',
			ctaText: 'Join Forum',
			ctaLink: 'https://wordpress.org/support/plugin/sheets-to-wp-table-live-sync/',
		},
	];

	const handleCtaClick = (link: string) => {
		window.open(link, '_blank', 'noopener,noreferrer');
	};

	return (
		<div className="ResourceWrapper">
			<div className="gradient-border">
				<div className="content">
					<div className="resource-grid">
						{resourceItems.map((item) => (
							<div key={item.id} className="resource-item" onClick={() => handleCtaClick(item.ctaLink)}>
								<div className="resource-icon">
									{item.icon}
								</div>
								<div className="resource-content">
									<h6 className="resource-title">{item.title}</h6>
									<p className="resource-description">{item.description}</p>
									<button
										className="resource-cta"
										onClick={() => handleCtaClick(item.ctaLink)}
										aria-label={`${item.ctaText} - opens in new tab`}
									>
										{item.ctaText} →
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Resource;