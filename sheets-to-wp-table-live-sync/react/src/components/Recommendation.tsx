import React, { useState, useEffect } from 'react';
import { SpinLoader } from './../icons';
import { getStrings, getNonce } from '../Helpers';
//styles
import '../styles/_recommendation.scss';

interface HeaderData {
	title: string;
	content: string;
}

interface ResponseData {
	plugin_cards_html: string;
	is_woocommerce_active: boolean;
	header_data: {
		woocommerce?: HeaderData;
		general: HeaderData;
	};
}

function Recommendation() {
	const [loader, setLoader] = useState<boolean>(true);
	const [pluginlist, setPluginlist] = useState<string>('');
	const [isWooCommerceActive, setIsWooCommerceActive] = useState<boolean>(false);
	const [headerData, setHeaderData] = useState<ResponseData['header_data'] | null>(null);

	useEffect(() => {
		wp.ajax.send('gswpts_product_fetch', {
			data: {
				nonce: getNonce(),
			},
			success(response: ResponseData) {
				// console.log('Response data:', response);
				// console.log('Header data:', response.header_data);
				setPluginlist(response.plugin_cards_html);
				setIsWooCommerceActive(response.is_woocommerce_active);
				setHeaderData(response.header_data);
				setLoader(false);
			},
			error(error) {
				console.error(error);
				setPluginlist(error);
				setLoader(false);
			},
		});
	}, []);

	// Function to process the plugin HTML and inject headers
	const processPluginHTML = (html: string) => {
		if (!headerData) {
			return html;
		}
		
		// Split the HTML by plugin-group to process each section independently
		const sections: string[] = [];
		let remainingHTML = html;

		// Process WooCommerce section if it exists
		const woocommerceMatch = remainingHTML.match(/<div class="plugin-group"><h3>woocommerce<\/h3>[\s\S]*?(?=<div class="plugin-group">|$)/);
		if (woocommerceMatch && isWooCommerceActive && headerData.woocommerce) {
			const woocommerceSection = `<div class="recommendation-section woocommerce-section">
				<h3>${headerData.woocommerce.title}</h3>
				<p>${headerData.woocommerce.content}</p>
			</div>
			${woocommerceMatch[0].replace('<div class="plugin-group">', '<div class="plugin-group woocommerce-group">')}`;
			sections.push(woocommerceSection);
			remainingHTML = remainingHTML.replace(woocommerceMatch[0], '');
		}

		// Process General section if it exists
		const generalMatch = remainingHTML.match(/<div class="plugin-group"><h3>general<\/h3>[\s\S]*?$/);
		if (generalMatch && headerData.general) {
			const generalSection = `<div class="recommendation-section general-section">
				<h3>${headerData.general.title}</h3>
				<p>${headerData.general.content}</p>
			</div>
			${generalMatch[0].replace('<div class="plugin-group">', '<div class="plugin-group general-group">')}`;
			sections.push(generalSection);
		}

		return sections.join('');
	};

	return (
		<div>
			{loader ? (
				<div className="loader-container">
					<div className="plugin-list-loader">{SpinLoader}</div>
				</div>
			) : (
				<div>
					{/* Plugin List with integrated headers */}
					<div
						className="plugin-list"
						dangerouslySetInnerHTML={{ __html: processPluginHTML(pluginlist) }}
					/>
				</div>
			)}
		</div>
	);
}

export default Recommendation;
