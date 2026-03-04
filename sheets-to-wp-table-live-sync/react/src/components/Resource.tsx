import React from 'react';
import { book, videoPlay, support, YTTutorial, HelpDoc1, HelpDoc2, HelpDoc3, HelpDoc4 } from '../icons';
import { getStrings } from './../Helpers';

import '../styles/_resource.scss';

const Resource = () => {
	const resourceItems = [
		{
			id: 1,
			icon: HelpDoc4,
			title: getStrings('help-doc-1-title'),
			description: getStrings('help-doc-1-description'),
			ctaText: getStrings('help-doc-1-cta'),
			ctaLink: 'https://wppool.dev/docs-category/how-to-use-sheets-to-wp-table/',
		},
		{
			id: 2,
			icon: HelpDoc2,
			title: getStrings('help-doc-2-title'),
			description: getStrings('help-doc-2-description'),
			ctaText: getStrings('help-doc-2-cta'),
			ctaLink: 'https://youtu.be/hKYqE4e_ipY?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP',
		},
		{
			id: 3,
			icon: HelpDoc3,
			title: getStrings('help-doc-3-title'),
			description: getStrings('help-doc-3-description'),
			ctaText: getStrings('help-doc-3-cta'),
			ctaLink: 'https://wppool.dev/contact/',
		},
		{
			id: 4,
			icon: HelpDoc1,
			title: getStrings('help-doc-4-title'),
			description: getStrings('help-doc-4-description'),
			ctaText: getStrings('help-doc-4-cta'),
			ctaLink: 'https://www.facebook.com/groups/wppoolcommunity',
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