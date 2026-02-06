import React, { useEffect, useState, useRef } from 'react';
import { Cross } from '../icons';
import Container from '../core/Container';
import Row from '../core/Row';
import Column from '../core/Column';
import Card from '../core/Card';
import CtaAdd from './CtaAdd';
import Resource from './Resource';
import GetSupport from './GetSupport';
import SupportModel from './SupportModel';
import Header from './Header';
import {
	book,
	videoPlay,
	getstartCheckmark,
	KeyboardArrowDown,
	GetProrightdesign,
} from '../icons';
import { isProActive, getNonce, getStrings } from '../Helpers';

//styles
import '../styles/_getstarted.scss';


function Documentation() {
	const supportModalRef = useRef();
	const [supportModal, setSupportleModal] = useState(false);
	const [activeItems, setActiveItems] = useState([0]);

	const faqs = [
		{ question: getStrings('doc-1'), answer: getStrings('doc-1-ans') },
		{ question: getStrings('doc-10'), answer: getStrings('doc-10-ans') },
		{ question: getStrings('doc-2'), answer: getStrings('doc-2-ans') },
		{ question: getStrings('doc-3'), answer: getStrings('doc-3-ans') },
		// { question: getStrings( 'doc-4' ), answer: getStrings( 'doc-4-ans' ) },
		{ question: getStrings('doc-5'), answer: getStrings('doc-5-ans') },
		{ question: getStrings('doc-6'), answer: getStrings('doc-6-ans') },

		{ question: getStrings('doc-7'), answer: getStrings('doc-7-ans') },
		{ question: getStrings('doc-9'), answer: getStrings('doc-9-ans') },
		// Add more FAQ items as needed
	];

	const handleToggle = (index) => {
		// console.log(index)
		if (activeItems.includes(index)) {
			setActiveItems(activeItems.filter((item) => item !== index));
		} else {
			setActiveItems([...activeItems, index]);
		}
	};

	function AccordionItem({ index, isActive, faq }) {
		return (
			<Card
				customClass={`accordion-body ${isActive ? 'active' : ''}`}
			>
				<div className="accordion-item">
					<div
						className={`accordion-header ${isActive ? 'active' : ''
							}`}
						onClick={() => handleToggle(index)}
					>
						<h5 className="accordion-title">{faq.question}</h5>
						<div
							className={`accordion-icon ${isActive ? 'active' : ''
								}`}
						>
							{KeyboardArrowDown}
						</div>
					</div>
					<div className="accordion-body">
						{isActive && (
							// <p className='accordion-content'>{faq.answer}</p>
							<div
								className="acc-content"
								style={{ lineHeight: '25px' }}
								dangerouslySetInnerHTML={{
									__html: faq.answer,
								}}
							/>
						)}
					</div>
				</div>
			</Card>
		);
	}

	const handleCreateSupportPopup = (e) => {
		e.preventDefault();
		setSupportleModal(true);
	};
	const handleVisitSupportForum = (e) => {
		e.preventDefault();
		window.open(
			'https://wordpress.org/support/plugin/sheets-to-wp-table-live-sync/',
			'_blank'
		);
	};

	const handleClosePopup = (e) => {
		setSupportleModal(false);
	};

	/**
	 * Alert if clicked on outside of element
	 *
	 * @param  event
	 */
	function handleCancelOutside(event: MouseEvent) {
		if (
			supportModalRef.current &&
			!supportModalRef.current.contains(event.target)
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

	return (
		<Container customClass="documentation-page-wrap">
			<Header
				title={getStrings('get-started')}
				description={getStrings('get-started-content')}
				// modalTitle={getStrings('mng-tab-modal-title')}
				showChangesLog={true}
				showProFeatures={true}
			/>

			<CtaAdd />

			<br />
			<h3>Explore helpful resources</h3>
			<Resource />

			{!isProActive() && (
				<Card>

					<div className="get-pro-promo">
						<div className="pro-hint-left">
							<h3>🎁 Get the pro version and unlock endless possibilities</h3>

							<p className="documention-list">
								{getstartCheckmark} {getStrings('link-supp')}
							</p>
							<p className="documention-list">
								{getstartCheckmark} {getStrings('pre-built-sheet-style')}
							</p>
							<p className="documention-list">
								{getstartCheckmark} {getStrings('hide-row-based-on')}
							</p>
							<p className="documention-list">
								{getstartCheckmark} {getStrings('unlimited-fetch-from-gs')}
							</p>

							<a
								href="https://go.wppool.dev/KfVZ"
								target="_blank"
								className="unlock-features button unlock-cta"
							>
								{getStrings('unlock-all')} →
							</a>

						</div>
						<div className="pro-hint-right">
							{GetProrightdesign}
						</div>
					</div>

				</Card>
			)}

			{ /* Frequently Asked Questions*/}
			<Row middleXs={true}>
				<Column xs="12" sm="6" customClass="documentation-page">
					<h3 className="fag-header">{getStrings('faq')}</h3>
					{faqs.map((faq, index) => (
						<AccordionItem
							key={index}
							index={index}
							isActive={activeItems.includes(index)}
							faq={faq}
						/>
					))}
				</Column>
			</Row>

			{supportModal && (
				<GetSupport>
					<div
						className="create-support-modal-wrap modal-content manage-support-modal-content"
						ref={supportModalRef}
					>
						<div
							className="cross_sign"
							onClick={(e) => handleClosePopup(e)}
						>
							{Cross}
						</div>
						<div className="create-table-modal">
							<SupportModel />
						</div>
					</div>
				</GetSupport>
			)}
		</Container>
	);
}

export default Documentation;
