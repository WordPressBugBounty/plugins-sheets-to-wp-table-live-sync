import React, { useState, useEffect, useRef } from 'react';

import { lockWhite, hintIcon, Cross, swapIcon } from '../icons';
import Modal from './../core/Modal';
import { isProActive, getStrings } from './../Helpers';

import theme_one_default_style from '../images//theme-one-default-style.png';
import theme_two_stripped_table from '../images/theme-two-stripped-table.png';
import theme_three_dark_table from '../images/theme-three-dark-table.png';
import theme_four_tailwind_style from '../images/theme-four-tailwind-style.png';
import theme_five_colored_column from '../images/theme-five-colored-column.png';
import theme_six_hovered_style from '../images/theme-six-hovered-style.png';

//styles
import '../styles/_tableCustomization.scss';
import Tooltip from './Tooltip';
import ThemeFields from './ThemeFields';

const TableCustomization = ({
	tableSettings,
	setTableSettings,
	secondActiveTabs,
	updateSecondActiveTab,
}) => {
	const [importModal, setImportModal] = useState<boolean>(false);
	const [frequentCacheModal, setFrequentCacheModal] = useState<boolean>(false);
	const [pendingFrequentCacheValue, setPendingFrequentCacheValue] = useState<boolean>(false);
	const confirmImportRef = useRef();
	const [tableHeaders, setTableHeaders] = useState([]);
	const [selectedOption, setSelectedOption] = useState(
		tableSettings?.table_settings?.columnnumber?.[0] ?? -1
	);

	const [sortOrder, setSortOrder] = useState(tableSettings?.table_settings?.sorting_mode || 'asc');

	useEffect(() => {
		setSecondActiveTab(secondActiveTabs);
		localStorage.setItem('second_active_tab', secondActiveTabs);
		// Update the secondActiveTab in the parent component
		updateSecondActiveTab(secondActiveTabs);
	}, [secondActiveTabs]);

	const [secondActiveTab, setSecondActiveTab] = useState<string>(
		localStorage.getItem('second_active_tab') || 'layout'
	);

	const handleSecondSetActiveTab = (key) => {
		setSecondActiveTab(key);
		localStorage.setItem('second_active_tab', key);

		// Update the secondActiveTab in the parent component
		updateSecondActiveTab(key);
	};

	const handleExportOptions = (e) => {
		const exportOption = e.target.dataset.item;
		const currentExports =
			tableSettings?.table_settings?.table_export || [];
		const newExports = currentExports.includes(exportOption)
			? currentExports.filter((item) => item !== exportOption)
			: [...currentExports, exportOption];

		setTableSettings({
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				table_export: [...newExports],
			},
		});
	};

	//This used when we change the tab alert gone but we need to show this always
	useEffect(() => {
		var tableRows = document.querySelectorAll('.gswpts_rows');
		var mergeTipsElement = document.getElementById('merge-hints');

		var verticalMergeFound = false;

		tableRows.forEach(function (row) {
			var cells = row.querySelectorAll('td');

			cells.forEach(function (cell) {
				var rowspan = cell.getAttribute('rowspan');

				if (rowspan && parseInt(rowspan) > 1) {
					// Vertical merge found
					verticalMergeFound = true;
				}
			});
		});

		if (mergeTipsElement) {
			mergeTipsElement.style.display = verticalMergeFound
				? 'block'
				: 'none';
		}
	}, [tableSettings]);

	/**
	 *
	 * @param e Pro alert
	 * @returns
	 */
	function handleSelectChange(e) {
		const value = e.target.value;

		if (
			!isProActive() &&
			// (value === '50' || value === '100' || value === '-1')
			(value === '100' || value === '-1')
		) {
			WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
		} else {
			setTableSettings({
				...tableSettings,
				table_settings: {
					...tableSettings.table_settings,
					default_rows_per_page: parseInt(e.target.value),
				},
			});
		}
	}

	const handleClosePopup = () => {
		setImportModal(false);
		setFrequentCacheModal(false);
	};



	// Sticky header 
	const handleCheckboxChange = (key) => {
		setTableSettings({
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				[key]: !tableSettings.table_settings?.[key],
			},
		});
	};

	const handleValueChange = (key, type) => {
		setTableSettings({
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				[key]:
					type === 'increment'
						? (tableSettings.table_settings?.[key] || 0) + 1
						: Math.max((tableSettings.table_settings?.[key] || 0) - 1, 0),
			},
		});
	};

	// Handle manual input for header_offset, ensure it's a valid number and non-negative
	const handleManualValueChange = (key, event) => {
		const newValue = event.target.value;

		// Only allow valid numbers (non-negative)
		if (/^\d+$/.test(newValue)) {
			setTableSettings({
				...tableSettings,
				table_settings: {
					...tableSettings.table_settings,
					[key]: parseInt(newValue, 10),
				},
			});
		}
	};

	// Start 
	useEffect(() => {
		// Extract headers logic
		const checkTableContainer = () => {
			const tableContainer = document.getElementById("table-preview");
			if (!tableContainer) return false;
			return true;
		};

		const intervalId = setInterval(() => {
			if (checkTableContainer()) {
				const tableHead = document.querySelector("#create_tables thead");
				if (tableHead) {
					const headers = [
						{ label: "Prioritize Google Sheets Format (default)", value: -1 },
						...Array.from(tableHead.querySelectorAll("th")).map((th, index) => ({
							label: th.textContent.trim(),
							value: index,
						})),
					];
					setTableHeaders(headers);
					clearInterval(intervalId);
				}
			}
		}, 500);

		return () => clearInterval(intervalId);
	}, []);


	const handleOptionSelect = (value) => {

		if (value !== -1 && !isProActive()) {
			WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
			return;
		}

		setSelectedOption(value);

		setTableSettings({
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				columnnumber: value === -1 ? [] : [value],
				allow_singleshort: value === -1 ? false : true,
			},
		});
	};




	const handleSortOrderChange = (e) => {
		setSortOrder(e.target.value);

		setTableSettings((prevSettings) => ({
			...prevSettings,
			table_settings: {
				...prevSettings.table_settings,
				sorting_mode: e.target.value,
			},
		}));

	};


	// END 

	const handleFrequentCacheCheckboxClick = (e) => {
		// If unchecking (current value is true, new value will be false), just update directly
		if (tableSettings?.table_settings?.disable_frequent_cache) {
			setTableSettings({
				...tableSettings,
				table_settings: {
					...tableSettings.table_settings,
					disable_frequent_cache: false,
				},
			});
		} else {
			// If checking (current value is false, new value will be true), show modal first
			setPendingFrequentCacheValue(true);
			setFrequentCacheModal(true);
		}
	};

	const handleConfirmFrequentCache = () => {
		setTableSettings({
			...tableSettings,
			table_settings: {
				...tableSettings.table_settings,
				disable_frequent_cache: pendingFrequentCacheValue,
			},
		});
		handleClosePopup();
	};

	const handleCancelFrequentCache = () => {
		handleClosePopup();
	};



	/**
	 * Alert if clicked on outside of element
	 *
	 * @param  event
	 */
	function handleCancelOutside(event: MouseEvent) {
		if (
			confirmImportRef.current &&
			!confirmImportRef.current.contains(event.target)
		) {
			handleClosePopup();
		}
	}

	useEffect(() => {
		const handleClick = () => {
			WPPOOL.Popup('sheets_to_wp_table_live_sync').show();
		};
		document.addEventListener('mousedown', handleCancelOutside);

		const proSettings = document.querySelectorAll(
			'.swptls-pro-settings, .btn-pro-lock'
		);
		proSettings.forEach((item) => {
			item.addEventListener('click', handleClick);
		});

		return () => {
			document.removeEventListener('mousedown', handleCancelOutside);
			proSettings.forEach((item) => {
				item.removeEventListener('click', handleClick);
			});
		};
	}, [secondActiveTab, handleCancelOutside]);

	/**
	 * Display Settings code
	 * Merge render conditionally
	 */

	useEffect(() => {
		const mergedSupport =
			tableSettings?.table_settings?.merged_support || false;

		if (mergedSupport) {
			var tableRows = document.querySelectorAll('.gswpts_rows');

			tableRows.forEach(function (row) {
				var cells = row.querySelectorAll('td');

				cells.forEach(function (cell, index) {
					var rowspan = cell.getAttribute('rowspan');

					if (rowspan && parseInt(rowspan) > 1) {
						var dataIndex = cell.getAttribute('data-index');
						// console.log('Found rowspan:', dataIndex);

						// Update isvertical to true and exit the loop
						setTableSettings((prevSettings) => ({
							...prevSettings,
							table_settings: {
								...prevSettings.table_settings,
								isvertical: true,
							},
						}));
						return;
					}
				});
			});
		}
	}, [setTableSettings]);

	return (
		<div>

			{frequentCacheModal && (
				<Modal>
					<div
						className="frequent-modal-wrap modal-content"
						ref={confirmImportRef}
					>
						<div
							className="cross_sign"
							onClick={handleCancelFrequentCache}
						>
							{Cross}
						</div>
						<div className="active-frequent-modal">

							<h2>{getStrings('are-you-sure-to-enable-frequent-mode')}</h2>
							<p>{getStrings('frequent-mode-desc')}</p>

							<div className="content-note">
								<span className="content-note-icon">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
										<line x1="12" y1="9" x2="12" y2="13"></line>
										<line x1="12" y1="17" x2="12.01" y2="17"></line>
									</svg>
								</span>
								<div className="content-note-text">
									{getStrings('frequent-cache-note')}
								</div>
							</div>

							<div className="action-buttons">
								<button
									className="swptls-button cancel-button"
									onClick={handleCancelFrequentCache}
								>
									{getStrings('Cancel')}
								</button>
								<button
									className="swptls-button confirm-button"
									onClick={handleConfirmFrequentCache}
								>
									{getStrings('yes-enable')}
								</button>
							</div>
						</div>
					</div>
				</Modal>
			)}

			<div className="edit-table-customization-wrap">
				<div className="edit-form-group">
					{ /* Render Theme style for hidden values  */}
					<div className="edit-form-group themeFields">
						<ThemeFields tableSettings={tableSettings} />
					</div>

					<div className="table-customization-tab-wrap">
						<div className="table-customization-tab-nav">
							<button
								className={`${secondActiveTab === 'layout' ? 'active' : ''
									}`}
								onClick={() =>
									handleSecondSetActiveTab('layout')
								}
							>
								{getStrings('table_customization_layout')}
							</button>

							<button
								className={`${secondActiveTab === 'utility'
									? 'active'
									: ''
									}`}
								onClick={() =>
									handleSecondSetActiveTab('utility')
								}
							>
								{getStrings('Utility')}
							</button>

							<button
								className={`${secondActiveTab === 'style' ? 'active' : ''
									}`}
								onClick={() =>
									handleSecondSetActiveTab('style')
								}
							>
								{getStrings('Style')}
							</button>
						</div>
						<div className="table-customization-tab-content">
							{ /* Style Tabs content */}

							{ /* New Import and Theme  */}
							{'layout' === secondActiveTab && (
								<div className="table-customization-theme-wrapper">
									{ /* Display Settings Code */}
									<div className="edit-display-settings-wrap">
										<div className="edit-form-group">
											<div className="edit-form-elements">
												<div className="swptls-table-top-elements">
													<h4 className="mt-0">
														{getStrings(
															'table-top-elements'
														)}
													</h4>

													<div className="display-settings-block-wrapper">
														<div className="top-elements-wrapper">
															<div className="edit-form-group">
																<input
																	type="checkbox"
																	name="hide_entries"
																	id="hide-entries"
																	checked={
																		tableSettings
																			.table_settings
																			?.show_x_entries
																	}
																	onChange={(
																		e
																	) =>
																		setTableSettings(
																			{
																				...tableSettings,
																				table_settings:
																				{
																					...tableSettings.table_settings,
																					show_x_entries:
																						!tableSettings
																							.table_settings
																							?.show_x_entries,
																				},
																			}
																		)
																	}
																/>
																<label htmlFor="hide-entries">
																	{getStrings(
																		'hide-ent'
																	)}{' '}
																	<Tooltip
																		content={`If this is enabled, the box showing number of entries will be hidden for the viewers`}
																	/>
																</label>
															</div>
															<div className="edit-form-group">
																<input
																	type="checkbox"
																	name="hide_search_box"
																	id="hide-search-box"
																	checked={
																		tableSettings
																			.table_settings
																			?.search_bar
																	}
																	onChange={(
																		e
																	) =>
																		setTableSettings(
																			{
																				...tableSettings,
																				table_settings:
																				{
																					...tableSettings.table_settings,
																					search_bar:
																						!tableSettings
																							.table_settings
																							.search_bar,
																				},
																			}
																		)
																	}
																/>
																<label htmlFor="hide-search-box">
																	{getStrings(
																		'hide-search-box'
																	)}{' '}
																	<Tooltip
																		content={`If enabled, the search box will be hidden for viewers`}
																	/>
																</label>
															</div>
														</div>

														<div
															className={`swap-position ${!tableSettings
																?.table_settings
																?.search_bar &&
																!tableSettings
																	?.table_settings
																	?.show_x_entries
																? 'swptls-swap-disabled'
																: ''
																}`}
														>
															{ /* <div className="swap-position"> */}
															<input
																type="checkbox"
																name="swap_filter_inputs"
																id="swap_table_top"
																checked={
																	tableSettings
																		.table_settings
																		?.swap_filter_inputs
																}
																onChange={(
																	e
																) =>
																	setTableSettings(
																		{
																			...tableSettings,
																			table_settings:
																			{
																				...tableSettings.table_settings,
																				swap_filter_inputs:
																					!tableSettings
																						.table_settings
																						.swap_filter_inputs,
																			},
																		}
																	)
																}
																// Disable input based on condition
																disabled={
																	!tableSettings
																		?.table_settings
																		?.search_bar &&
																	!tableSettings
																		?.table_settings
																		?.show_x_entries
																}
															/>
															<label
																htmlFor="swap_table_top"
																className="swapped-pos-lab"
															>
																<div className="icon">
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="13"
																		height="15"
																		viewBox="0 0 13 15"
																		fill="none"
																	>
																		<path
																			d="M4 7.75L1 10.75L4 13.75M11.5 10.75H1M8.5 1.25L11.5 4.25L8.5 7.25M1 4.25H11.5"
																			stroke="#34A0FA"
																			stroke-width="1.5"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		/>
																	</svg>
																</div>

																{tableSettings
																	.table_settings
																	?.swap_filter_inputs ? (
																	<span>
																		{getStrings(
																			'swapped-pos'
																		)}
																	</span>
																) : (
																	<span>
																		{getStrings(
																			'swap-pos'
																		)}
																	</span>
																)}
															</label>
														</div>
													</div>
												</div>

												<div className="swptls-table-bottom-elements">
													<h4>
														{getStrings(
															'table-bottom-ele'
														)}
													</h4>

													<div className="display-settings-block-wrapper">
														<div className="top-elements-wrapper">
															<div className="edit-form-group">
																<input
																	type="checkbox"
																	name="hide_entry_info"
																	id="hide-entry-info"
																	checked={
																		tableSettings
																			.table_settings
																			?.show_info_block
																	}
																	onChange={(
																		e
																	) =>
																		setTableSettings(
																			{
																				...tableSettings,
																				table_settings:
																				{
																					...tableSettings.table_settings,
																					show_info_block:
																						!tableSettings
																							.table_settings
																							?.show_info_block,
																				},
																			}
																		)
																	}
																/>
																<label htmlFor="hide-entry-info">
																	{getStrings(
																		'hide-entry-info'
																	)}{' '}
																	<Tooltip
																		content={`If enabled the entry info showing number of current entries out of all the entries will be hidden`}
																	/>
																</label>
															</div>
															<div className="edit-form-group">
																<input
																	type="checkbox"
																	name="hide_pagination"
																	id="hide-pagination"
																	checked={
																		tableSettings
																			.table_settings
																			?.pagination
																	}
																	onChange={(
																		e
																	) =>
																		setTableSettings(
																			{
																				...tableSettings,
																				table_settings:
																				{
																					...tableSettings.table_settings,
																					pagination:
																						!tableSettings
																							.table_settings
																							?.pagination,
																				},
																			}
																		)
																	}
																/>
																<label htmlFor="hide-pagination">
																	{getStrings(
																		'hide-pagi'
																	)}{' '}
																	<Tooltip
																		content={`Enable this to hide the pagination for viewers`}
																	/>
																</label>
															</div>
														</div>

														<div
															className={`swap-position ${!tableSettings
																?.table_settings
																?.show_info_block &&
																!tableSettings
																	?.table_settings
																	?.pagination
																? 'swptls-swap-disabled'
																: ''
																}`}
														>
															<input
																type="checkbox"
																name="swap_bottom_options"
																className={
																	tableSettings
																		.table_settings
																		?.swap_bottom_options
																		? 'bottomswapon'
																		: 'bottomswapoff'
																}
																id="swap-bottom-options"
																checked={
																	tableSettings
																		.table_settings
																		?.swap_bottom_options
																}
																onChange={(
																	e
																) =>
																	setTableSettings(
																		{
																			...tableSettings,
																			table_settings:
																			{
																				...tableSettings.table_settings,
																				swap_bottom_options:
																					!tableSettings
																						.table_settings
																						?.swap_bottom_options,
																			},
																		}
																	)
																}
																// Disable input based on condition
																disabled={
																	!tableSettings
																		?.table_settings
																		?.show_info_block &&
																	!tableSettings
																		?.table_settings
																		?.pagination
																}
															/>
															<label
																htmlFor="swap-bottom-options"
																className="swapped-pos-lab"
															>
																<div className="icon">
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="13"
																		height="15"
																		viewBox="0 0 13 15"
																		fill="none"
																	>
																		<path
																			d="M4 7.75L1 10.75L4 13.75M11.5 10.75H1M8.5 1.25L11.5 4.25L8.5 7.25M1 4.25H11.5"
																			stroke="#34A0FA"
																			stroke-width="1.5"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		/>
																	</svg>
																</div>
																{ /* <span>{getStrings('swap-pos')}</span> */}
																{tableSettings
																	.table_settings
																	?.swap_bottom_options ? (
																	<span>
																		{getStrings(
																			'swapped-pos'
																		)}
																	</span>
																) : (
																	<span>
																		{getStrings(
																			'swap-pos'
																		)}
																	</span>
																)}
															</label>
														</div>
													</div>
												</div>
											</div>

											<div className="swptls-table-basic-elements">
												<div className="edit-form-group">
													<input
														type="checkbox"
														name="show_title"
														id="show-title"
														checked={
															tableSettings
																.table_settings
																?.show_title
														}
														onChange={(e) =>
															setTableSettings({
																...tableSettings,
																table_settings:
																{
																	...tableSettings.table_settings,
																	show_title:
																		!tableSettings
																			.table_settings
																			.show_title,
																},
															})
														}
													/>
													<label htmlFor="show-title">
														{ /* Show Table title */}
														{getStrings(
															'show-table-title'
														)}
														<Tooltip
															content={`Enable this option to show the table title for the viewers`}
														/>
													</label>
												</div>

												{ /* Description show feature will work later on */}
												<div className="edit-form-group">
													<input
														type="checkbox"
														name="show_description"
														id="show-description"
														checked={
															tableSettings
																.table_settings
																?.show_description
														}
														onChange={(e) =>
															setTableSettings({
																...tableSettings,
																table_settings:
																{
																	...tableSettings.table_settings,
																	show_description:
																		!tableSettings
																			.table_settings
																			.show_description,
																	// description_position: e.target.checked ? 'above' : 'below'
																},
															})
														}
													/>
													<label htmlFor="show-description">
														{' '}
														{getStrings('show-table-desc')}
														<span className="select-wrapper">
															<select
																name="description_position"
																id="description-position"
																value={
																	tableSettings
																		.table_settings
																		?.description_position
																}
																onChange={(
																	e
																) =>
																	setTableSettings(
																		{
																			...tableSettings,
																			table_settings:
																			{
																				...tableSettings.table_settings,
																				description_position:
																					e
																						.target
																						.value,
																			},
																		}
																	)
																}
															>
																<option value="above">
																	{getStrings('above')}
																</option>
																<option value="below">
																	{getStrings('below')}
																</option>
															</select>

															<div className="icon">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="11"
																	height="6"
																	viewBox="0 0 11 6"
																	fill="none"
																>
																	<path
																		d="M10.9999 0.995538C11.0003 1.12361 10.9744 1.25016 10.9241 1.36588C10.8738 1.48159 10.8004 1.58354 10.7093 1.66423L5.99542 5.80497C5.85484 5.93107 5.67851 6 5.49654 6C5.31456 6 5.13823 5.93107 4.99765 5.80497L0.283814 1.51849C0.123373 1.37297 0.0224779 1.16387 0.00332422 0.937177C-0.0158295 0.710485 0.0483274 0.484775 0.181681 0.309701C0.315034 0.134626 0.506661 0.024529 0.714405 0.00362822C0.922149 -0.0172725 1.12899 0.0527358 1.28943 0.198252L5.50046 4.03037L9.7115 0.326847C9.82682 0.222014 9.96724 0.155421 10.1162 0.134949C10.2651 0.114478 10.4163 0.140983 10.5518 0.211329C10.6873 0.281675 10.8016 0.392918 10.881 0.531895C10.9604 0.670871 11.0017 0.831765 10.9999 0.995538Z"
																		fill="#1E1E1E"
																	/>
																</svg>
															</div>
														</span>
														{getStrings('the-table')}
														<Tooltip
															content={`Enable this option to show table description for the viewers`}
														/>
														{
															// <button className="btn-pro btn-new">
															// 	{ getStrings(
															// 		'new'
															// 	) }
															// </button>
														}
													</label>
												</div>

												{ /* Merge Feature  */}

												<div className="edit-form-group">
													<div
														className={`edit-form-group table-style`}
														id="merged-activattion"
													>
														<input
															type="checkbox"
															name="merge-cells"
															id="merge-cells"
															checked={
																tableSettings
																	?.table_settings
																	?.merged_support
															}
															onChange={(e) =>
																setTableSettings(
																	{
																		...tableSettings,
																		table_settings:
																		{
																			...tableSettings.table_settings,
																			merged_support:
																				e.target.checked,
																		},
																	}
																)
															}
														/>
														<label htmlFor="merge-cells">
															{getStrings(
																'merge-cells'
															)}{' '}
															<span className="tooltip-cache">
																<Tooltip
																	content={getStrings(
																		'tooltip-36'
																	)}
																/>{' '}
															</span>
														</label>
													</div>
												</div>

												{ /* Enable sorting  */}
												<div className="edit-form-group">
													<input
														type="checkbox"
														name="disable_sorting"
														id="disable-sorting"
														checked={
															tableSettings
																.table_settings
																?.allow_sorting
														}
														onChange={(e) =>
															setTableSettings({
																...tableSettings,
																table_settings:
																{
																	...tableSettings.table_settings,
																	allow_sorting:
																		!tableSettings
																			.table_settings
																			?.allow_sorting,
																},
															})
														}
													/>
													<label htmlFor="disable-sorting">
														{getStrings(
															'allow-sorting'
														)}
														<Tooltip
															content={getStrings(
																'tooltip-6'
															)}
														/>
													</label>
												</div>


												{/* Single Select Dropdown */}
												<div className={`edit-form-group sorting-feature-with-priority ${tableSettings?.table_settings
													?.allow_sorting === false
													? 'feature-disabled'
													: ''
													}`}>

													<div className="auto_sorting-label">{getStrings('auto-sorting')}

														<Tooltip
															content={getStrings(
																'tooltip-57'
															)}
														/>

														<button className="btn-pro btn-new">
															{getStrings(
																'new'
															)}
														</button>
													</div>

													{/* Sort order  */}
													<div className="conditional-view">
														<div className="conditional-dropdown-select">
															<label htmlFor="headerSelect" className="auto_sorting-title">
																{getStrings('col-sorting')}
																<Tooltip content={getStrings('tooltip-54')} />
															</label>
															<div className="select-with-icon">
																<select
																	id="headerSelect"
																	value={selectedOption}
																	onChange={(e) => handleOptionSelect(Number(e.target.value))}
																	disabled={tableSettings?.table_settings?.allow_sorting === false}
																>
																	{tableHeaders.map((header) => (
																		<option key={header.value} value={header.value}>
																			{header.label}
																		</option>
																	))}
																</select>
																<span
																	className={`select-icon`}
																>
																	<svg xmlns="http://www.w3.org/2000/svg" width="11" height="6" viewBox="0 0 11 6" fill="none"><path d="M10.9999 0.995538C11.0003 1.12361 10.9744 1.25016 10.9241 1.36588C10.8738 1.48159 10.8004 1.58354 10.7093 1.66423L5.99542 5.80497C5.85484 5.93107 5.67851 6 5.49654 6C5.31456 6 5.13823 5.93107 4.99765 5.80497L0.283814 1.51849C0.123373 1.37297 0.0224779 1.16387 0.00332422 0.937177C-0.0158295 0.710485 0.0483274 0.484775 0.181681 0.309701C0.315034 0.134626 0.506661 0.024529 0.714405 0.00362822C0.922149 -0.0172725 1.12899 0.0527358 1.28943 0.198252L5.50046 4.03037L9.7115 0.326847C9.82682 0.222014 9.96724 0.155421 10.1162 0.134949C10.2651 0.114478 10.4163 0.140983 10.5518 0.211329C10.6873 0.281675 10.8016 0.392918 10.881 0.531895C10.9604 0.670871 11.0017 0.831765 10.9999 0.995538Z" fill="#1E1E1E"></path></svg>
																</span>
															</div>

															{/* sorting-control */}
															<div className='sorting-control'>
																<div className={`${!isProActive()
																	? ` swptls-pro-settings`
																	: ``
																	}`}>
																	<input
																		type="checkbox"
																		name="hide_sorting_control"
																		id="hide-sorting-control"
																		checked={
																			tableSettings
																				.table_settings
																				?.hide_sorting_icon
																		}
																		onChange={(e) =>
																			setTableSettings({
																				...tableSettings,
																				table_settings:
																				{
																					...tableSettings.table_settings,
																					hide_sorting_icon:
																						!tableSettings
																							.table_settings
																							?.hide_sorting_icon,
																				},
																			})
																		}
																	/>

																	<label htmlFor="hide-sorting-control">
																		{getStrings(
																			'sorting-control'
																		)}
																	</label>
																</div>
																<span className='pro-tag-sorting-control'>
																	{!isProActive() && (
																		<button className="btn-pro">
																			{getStrings('pro')}
																		</button>
																	)}

																</span>

															</div>

															{/* End  */}

														</div>

														{/* Sorting Order Dropdown */}
														{selectedOption !== -1 && selectedOption !== null && selectedOption !== '' && (
															<div className="sort-order-select">
																<label htmlFor="sortOrder" className="auto_sorting-title">
																	{getStrings('order-sorting')}
																	<Tooltip content={getStrings('tooltip-55')} />
																</label>
																<div className="select-with-icon">
																	<span className={`select-icon-sort`}>
																		{sortOrder === 'asc' ? (
																			<svg fill="#666" width="15" height="20" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#666" stroke-width="1">
																				<g id="SVGRepo_bgCarrier" stroke-width="0" />
																				<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
																				<g id="SVGRepo_iconCarrier"> <title>arrow-down-a-z</title> <path d="M11.47 24.469l-3.72 3.721v-26.189c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v0 26.188l-3.72-3.72c-0.136-0.134-0.322-0.218-0.528-0.218-0.415 0-0.751 0.336-0.751 0.751 0 0.207 0.083 0.394 0.218 0.529l5 5c0.026 0.026 0.065 0.017 0.093 0.038 0.052 0.040 0.088 0.098 0.15 0.124 0.085 0.035 0.184 0.056 0.287 0.057h0c0.207 0 0.394-0.084 0.53-0.219l5-5c0.135-0.136 0.218-0.323 0.218-0.529 0-0.415-0.336-0.751-0.751-0.751-0.206 0-0.393 0.083-0.528 0.218l0-0zM23.557 1.872c-0.049-0.102-0.152-0.172-0.271-0.172-0 0-0.001 0-0.001 0h-0.584c-0 0-0.001 0-0.001 0-0.119 0-0.222 0.069-0.27 0.17l-0.001 0.002-5.64 12c-0.018 0.037-0.029 0.081-0.029 0.128 0 0.166 0.134 0.3 0.3 0.3 0 0 0 0 0 0h0.531c0 0 0 0 0 0 0.119 0 0.222-0.070 0.271-0.171l0.001-0.002 1.343-2.861h7.557l1.357 2.863c0.050 0.102 0.153 0.171 0.271 0.171h0.531c0 0 0.001 0 0.002 0 0.165 0 0.299-0.134 0.299-0.299 0-0.047-0.011-0.091-0.030-0.13l0.001 0.002zM19.711 10.169l3.281-6.95 3.264 6.95zM27.584 17.704h-8.908c-0 0-0 0-0.001 0-0.166 0-0.3 0.134-0.3 0.3v0 0.496c0 0.166 0.135 0.301 0.301 0.301h7.615l-8.129 10.604c-0.039 0.050-0.062 0.113-0.063 0.182v0.41c0 0.166 0.135 0.301 0.301 0.301h9.166c0.166-0 0.301-0.135 0.301-0.301v0-0.496c-0-0.166-0.135-0.301-0.301-0.301h-7.873l8.129-10.604c0.039-0.050 0.062-0.113 0.063-0.182v-0.41c-0-0.166-0.134-0.3-0.3-0.3-0 0-0.001 0-0.001 0h0z" /> </g>
																			</svg>
																		) : (
																			<svg width="15" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
																				<path d="M7 3V21M7 3L11 7M7 3L3 7M15.5 3H20.5L15.5 10H20.5M16 20H20M15 21L18 14L21 21" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
																			</svg>
																		)}
																	</span>
																	<select
																		id="sortOrder"
																		value={sortOrder}
																		onChange={handleSortOrderChange}
																		disabled={tableSettings?.table_settings?.allow_sorting === false}
																	>
																		<option value="asc">{getStrings('sorting-ascending')}</option>
																		<option value="desc">{getStrings('sorting-descending')}</option>
																	</select>
																	<span
																		className={`select-icon`}
																	>
																		<svg xmlns="http://www.w3.org/2000/svg" width="11" height="6" viewBox="0 0 11 6" fill="none"><path d="M10.9999 0.995538C11.0003 1.12361 10.9744 1.25016 10.9241 1.36588C10.8738 1.48159 10.8004 1.58354 10.7093 1.66423L5.99542 5.80497C5.85484 5.93107 5.67851 6 5.49654 6C5.31456 6 5.13823 5.93107 4.99765 5.80497L0.283814 1.51849C0.123373 1.37297 0.0224779 1.16387 0.00332422 0.937177C-0.0158295 0.710485 0.0483274 0.484775 0.181681 0.309701C0.315034 0.134626 0.506661 0.024529 0.714405 0.00362822C0.922149 -0.0172725 1.12899 0.0527358 1.28943 0.198252L5.50046 4.03037L9.7115 0.326847C9.82682 0.222014 9.96724 0.155421 10.1162 0.134949C10.2651 0.114478 10.4163 0.140983 10.5518 0.211329C10.6873 0.281675 10.8016 0.392918 10.881 0.531895C10.9604 0.670871 11.0017 0.831765 10.9999 0.995538Z" fill="#1E1E1E"></path></svg>
																	</span>
																</div>


															</div>
														)}
													</div>
												</div>


												{/* Sticky Header  */}
												<div className="sticky-header-settings">
													{/* -----------Fixed Headers------------ */}
													<div className="edit-form-group header-section">
														<div className={`${!isProActive()
															? ` swptls-pro-settings`
															: ``
															}`}>
															<label>
																<input
																	id='enable_fixed_headers'
																	type="checkbox"
																	checked={tableSettings.table_settings?.fixed_headers || false}
																	onChange={() => handleCheckboxChange('fixed_headers')}
																/>
																{getStrings('fixed-header')}

															</label>
														</div>
														<span className='pro-tag-sorting-control'>
															{!isProActive() && (
																<button className="btn-pro">
																	{getStrings('pro')}
																</button>
															)}
															<button className="btn-pro btn-new">
																{getStrings(
																	'new'
																)}
															</button>
														</span>
													</div>
													{tableSettings.table_settings?.fixed_headers && (
														<div className={`header-settings ${!isProActive()
															? ` swptls-pro-settings`
															: ``
															}`}>
															<div className="column-input">
																<label>{getStrings('header-offset')}
																	<Tooltip content={getStrings('tooltip-60')} />
																</label>
																<div className="sticky-number-input">
																	<button
																		type="button"
																		onClick={() => handleValueChange('header_offset', 'decrement')}
																		disabled={(tableSettings.table_settings?.header_offset || 0) === 0}
																	>
																		-
																	</button>
																	<input
																		id='header_offset'
																		type="number"
																		value={tableSettings.table_settings?.header_offset || 0}
																		onChange={(e) => handleManualValueChange('header_offset', e)}
																		min="0"
																	/>
																	<button
																		type="button"
																		onClick={() => handleValueChange('header_offset', 'increment')}
																	>
																		+
																	</button>
																</div>
															</div>
														</div>
													)}

													{/* --------------Enable Fixed Columns --------------*/}
													<div className="edit-form-group header-section">
														<div className={`${!isProActive()
															? ` swptls-pro-settings`
															: ``
															}`}>
															<label>
																<input
																	id='enable_fixed_columns'
																	type="checkbox"
																	checked={tableSettings.table_settings?.enable_fixed_columns || false}
																	onChange={() => handleCheckboxChange('enable_fixed_columns')}
																/>
																{getStrings('enb-fixed-clmn')}


															</label>
														</div>
														<span className='pro-tag-sorting-control'>
															{!isProActive() && (
																<button className="btn-pro">
																	{getStrings('pro')}
																</button>
															)}
															<button className="btn-pro btn-new">
																{getStrings(
																	'new'
																)}
															</button>
														</span>
													</div>
													{tableSettings.table_settings?.enable_fixed_columns && (
														<div className={`column-settings ${!isProActive()
															? ` swptls-pro-settings`
															: ``
															}`}>
															<div className="column-input">
																<label>{getStrings('left-clmn-header')}
																	<Tooltip content={getStrings('tooltip-61')} />
																</label>
																<div className="sticky-number-input">
																	<button
																		type="button"
																		onClick={() => handleValueChange('left_columns', 'decrement')}
																		disabled={(tableSettings.table_settings?.left_columns || 0) === 0}
																	>
																		-
																	</button>
																	<input
																		id='left_columns'
																		type="number"
																		value={tableSettings.table_settings?.left_columns || 0}
																		readOnly
																	/>
																	<button
																		type="button"
																		onClick={() => handleValueChange('left_columns', 'increment')}
																	>
																		+
																	</button>
																</div>
															</div>
															<div className="column-input">
																<label>{getStrings('right-clmn-header')}
																	<Tooltip content={getStrings('tooltip-62')} />
																</label>
																<div className="sticky-number-input">
																	<button
																		type="button"
																		onClick={() => handleValueChange('right_columns', 'decrement')}
																		disabled={(tableSettings.table_settings?.right_columns || 0) === 0}
																	>
																		-
																	</button>
																	<input
																		id='right_columns'
																		type="number"
																		value={tableSettings.table_settings?.right_columns || 0}
																		readOnly
																	/>
																	<button
																		type="button"
																		onClick={() => handleValueChange('right_columns', 'increment')}
																	>
																		+
																	</button>
																</div>
															</div>
														</div>
													)}
												</div>
												{/* End */}
											</div>
										</div>
									</div>
								</div>
							)}

							{'utility' === secondActiveTab && (
								<div className="table-customization-utility">
									<div className={`edit-form-group`}>
										<h4>
											<span
												className={`${!isProActive()
													? ` swptls-pro-settings`
													: ``
													}`}
											>
												{getStrings('let-export')}{' '}
												<Tooltip
													content={getStrings(
														'tooltip-22'
													)}
												/>{' '}
											</span>

											{!isProActive() && (
												<button className="btn-pro">
													{getStrings('pro')}
												</button>
											)}
										</h4>

										<div
											className={`exports-btns${!isProActive()
												? ` swptls-pro-settings`
												: ``
												}`}
										>
											<button
												className={
													tableSettings &&
														tableSettings?.table_settings?.table_export?.includes(
															'excel'
														)
														? 'active'
														: ''
												}
												data-item="excel"
												onClick={(e) =>
													handleExportOptions(e)
												}
											>
												{getStrings('Excel')}
											</button>
											<button
												className={
													tableSettings?.table_settings?.table_export?.includes(
														'json'
													)
														? 'active'
														: ''
												}
												data-item="json"
												onClick={(e) =>
													handleExportOptions(e)
												}
											>
												{getStrings('JSON')}
											</button>
											<button
												className={
													tableSettings?.table_settings?.table_export?.includes(
														'pdf'
													)
														? 'active'
														: ''
												}
												data-item="pdf"
												onClick={(e) =>
													handleExportOptions(e)
												}
											>
												{getStrings('PDF')}
											</button>
											<button
												className={
													tableSettings?.table_settings?.table_export?.includes(
														'csv'
													)
														? 'active'
														: ''
												}
												data-item="csv"
												onClick={(e) =>
													handleExportOptions(e)
												}
											>
												{getStrings('CSV')}
											</button>
											<button
												className={
													tableSettings?.table_settings?.table_export?.includes(
														'print'
													)
														? 'active'
														: ''
												}
												data-item="print"
												onClick={(e) =>
													handleExportOptions(e)
												}
											>
												{getStrings('Print')}
											</button>
											<button
												className={
													tableSettings?.table_settings?.table_export?.includes(
														'copy'
													)
														? 'active'
														: ''
												}
												data-item="copy"
												onClick={(e) =>
													handleExportOptions(e)
												}
											>
												{getStrings('Copy')}
											</button>
										</div>
									</div>

									{ /* Cursor behavior on the Table */}
									<div className={`edit-form-group`}>
										<h4>
											<span
												className={`${!isProActive()
													? ` swptls-pro-settings`
													: ``
													}`}
											>
												{getStrings(
													'cursor-behavior'
												)}{' '}
												<Tooltip
													content={getStrings(
														'tooltip-45'
													)}
												/>{' '}
											</span>

											{!isProActive() && (
												<button className="btn-pro">
													{getStrings('pro')}
												</button>
											)}
											{ /* {<button className='btn-pro btn-new cursor-behave'>{getStrings('new')}</button>} */}
										</h4>

										<div
											className={`utility-checkbox-wrapper${!isProActive()
												? ` swptls-pro-settings`
												: ``
												}`}
										>
											<label
												className={`utility-checkboxees${tableSettings
													?.table_settings
													?.cursor_behavior ===
													'copy_paste' ||
													!isProActive()
													? ' active'
													: ''
													}`}
												htmlFor="copy-paste"
											>
												<input
													type="radio"
													name="cursor_behavior"
													id="copy-paste"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																cursor_behavior:
																	'copy_paste',
															},
														})
													}
												/>
												<span>
													{getStrings(
														'highlight-and-copy'
													)}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-46'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.cursor_behavior ===
														'copy_paste' ||
														!isProActive()
														? ' active'
														: ''
														}`}
												></div>
											</label>
											<label
												className={`utility-checkboxees${isProActive() &&
													tableSettings
														?.table_settings
														?.cursor_behavior ===
													'left_right'
													? ' active'
													: ''
													}`}
												htmlFor="left-right"
											>
												<input
													type="radio"
													name="cursor_behavior"
													id="left-right"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																cursor_behavior:
																	'left_right',
															},
														})
													}
												/>
												<span>
													{getStrings(
														'left-to-right'
													)}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-47'
														)}
													/>
												</span>
												<div
													className={`control__indicator${isProActive() &&
														tableSettings
															?.table_settings
															?.cursor_behavior ===
														'left_right'
														? ' active'
														: ''
														}`}
												></div>
											</label>
										</div>
									</div>

									{ /* link redirection behavior */}
									<div className={`edit-form-group`}>
										<h4>
											{getStrings('link-behave')}{' '}
											<Tooltip
												content={getStrings(
													'tooltip-23'
												)}
											/>{' '}
											{ /* {!isProActive() && (<button className='btn-pro'>{getStrings('pro')}</button>)} */}
										</h4>

										{ /* <div className={`utility-checkbox-wrapper${!isProActive() ? ` swptls-pro-settings` : ``}`}> */}
										<div className="utility-checkbox-wrapper">
											<label
												className={`utility-checkboxees${tableSettings
													?.table_settings
													?.redirection_type ===
													'_self'
													? ' active'
													: ''
													}`}
												htmlFor="current-window"
											>
												<input
													type="radio"
													name="redirection_type"
													id="current-window"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																redirection_type:
																	'_self',
															},
														})
													}
												/>
												<span>
													{getStrings(
														'open-ct-window'
													)}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-24'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.redirection_type ===
														'_self'
														? ' active'
														: ''
														}`}
												></div>
											</label>
											<label
												className={`utility-checkboxees${tableSettings
													?.table_settings
													?.redirection_type ===
													'_blank'
													? ' active'
													: ''
													}`}
												htmlFor="new-window"
											>
												<input
													type="radio"
													name="redirection_type"
													id="new-window"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																redirection_type:
																	'_blank',
															},
														})
													}
												/>
												<span>
													{getStrings(
														'open-new-window'
													)}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-25'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.redirection_type ===
														'_blank'
														? ' active'
														: ''
														}`}
												></div>
											</label>
										</div>
									</div>

									{ /* image and link support */}
									<div
										className={`edit-form-group special-feature`}
									>
										<label
											className="cache-table"
											// className={`cache-table ${!isProActive() ? ` swptls-pro-settings` : ``}`}
											htmlFor="table_link_support"
										>
											<input
												type="checkbox"
												name="table_link_support"
												id="table_link_support"
												checked={
													tableSettings
														?.table_settings
														?.table_link_support
												}
												onClick={(e) =>
													setTableSettings({
														...tableSettings,
														table_settings: {
															...tableSettings.table_settings,
															table_link_support:
																e.target
																	.checked,
														},
													})
												}
											// disabled={!isProActive()} // added to disable click if its not pro
											/>
											{getStrings('import-links')}{' '}
										</label>
										<span className="tooltip-cache">
											<Tooltip
												content={getStrings(
													'tooltip-26'
												)}
											/>{' '}
											{ /* {!isProActive() && (<button className='btn-pro cache-pro-tag'>{getStrings('pro')}</button>)} */}
											{ /* {<button className='btn-pro btn-new'>{getStrings('new')}</button>} */}
										</span>
									</div>
									{ /* )} */}

									{ /* image and link support */}
									<div
										className={`edit-form-group special-feature`}
									>
										<label
											className="cache-table"
											// className={`cache-table ${!isProActive() ? ` swptls-pro-settings` : ``}`}
											htmlFor="table_img_support"
										>
											<input
												type="checkbox"
												name="table_img_support"
												id="table_img_support"
												checked={
													tableSettings
														?.table_settings
														?.table_img_support
												}
												onClick={(e) =>
													setTableSettings({
														...tableSettings,
														table_settings: {
															...tableSettings.table_settings,
															table_img_support:
																e.target
																	.checked,
														},
													})
												}
											// disabled={!isProActive()} // added to disable click if its not pro
											/>
											{getStrings('import-image')}{' '}
										</label>
										<span className="tooltip-cache">
											<Tooltip
												content={getStrings(
													'tooltip-27'
												)}
											/>{' '}
											{ /* {!isProActive() && (<button className='btn-pro cache-pro-tag'>{getStrings('pro')}</button>)} */}
											{ /* {<button className='btn-pro btn-new'>{getStrings('new')}</button>} */}
										</span>
									</div>

									{ /* Checkbox support */}
									<div
										className={`edit-form-group special-feature`}
									>
										<label
											className="cache-table"
											htmlFor="checkbox_support"
										>
											<input
												type="checkbox"
												name="checkbox_support"
												id="checkbox_support"
												checked={
													tableSettings
														?.table_settings
														?.checkbox_support
												}
												onClick={(e) =>
													setTableSettings({
														...tableSettings,
														table_settings: {
															...tableSettings.table_settings,
															checkbox_support:
																e.target
																	.checked,
														},
													})
												}
											/>
											{getStrings('import-checkbox')}{' '}
										</label>
										<span className="tooltip-cache">
											<Tooltip
												content={getStrings(
													'tooltip-48'
												)}
											/>{' '}
											{
												// <button className="btn-pro btn-new">
												// 	{ getStrings( 'new' ) }
												// </button>
											}
										</span>
									</div>

									<br />
									{ /* Cache feature  */}
									<div
										className={`edit-form-group cache-feature`}
									>
										<label
											className="cache-table"
											// className={`cache-table ${!isProActive() ? ` swptls-pro-settings` : ``}`}
											htmlFor="table-cache"
										>
											<input
												type="checkbox"
												name="table_cache"
												id="table-cache"
												checked={
													tableSettings
														?.table_settings
														?.table_cache
												}
												onClick={(e) =>
													setTableSettings({
														...tableSettings,
														table_settings: {
															...tableSettings.table_settings,
															table_cache:
																e.target
																	.checked,
														},
													})
												}
											// disabled={!isProActive()} // added to disable click if its not pro
											/>
											{getStrings('cache-table')}{' '}
										</label>
										<span className="tooltip-cache">
											<Tooltip
												content={getStrings(
													'tooltip-28'
												)}
											/>{' '}
											{ /* {!isProActive() && (<button className='btn-pro cache-pro-tag'>{getStrings('pro')}</button>)} */}
										</span>
									</div>

									{ /* Frequent Cache update disable feature  */}

									{tableSettings?.table_settings
										?.table_cache ===
										true && (
											<>
												<div className={`edit-form-group cache-feature frequent-mode ${tableSettings?.table_settings
													?.table_cache === false
													? 'feature-disabled'
													: ''
													}`}>

													<div className="freq-settings">
														<label
															className="cache-table"
															// className={`cache-table ${!isProActive() ? ` swptls-pro-settings` : ``}`}
															htmlFor="disable-frequent-cache"
														>
															<input
																type="checkbox"
																name="disable_frequent_cache"
																id="disable-frequent-cache"
																checked={
																	tableSettings
																		?.table_settings
																		?.disable_frequent_cache
																}
																/* onClick={(e) =>
																	setTableSettings({
																		...tableSettings,
																		table_settings: {
																			...tableSettings.table_settings,
																			disable_frequent_cache:
																				e.target
																					.checked,
																		},
																	})
																} */
																onChange={handleFrequentCacheCheckboxClick}

																disabled={!tableSettings
																	?.table_settings
																	?.table_cache} // added to disable click if cache not enabled
															/>
															{getStrings('frequent-cache')}{' '}
														</label>

														<span className="tooltip-cache">
															<Tooltip
																content={getStrings(
																	'tooltip-63'
																)}
															/>{' '}
															{ /* {!isProActive() && (<button className='btn-pro cache-pro-tag'>{getStrings('pro')}</button>)} */}
															{<button className='btn-pro btn-new cursor-behave'>{getStrings('new')}</button>}
															<button className="beta-badge">{getStrings('beta')}</button>
														</span>
													</div>
													<p className="content-paragraph">{getStrings('freq-content')}</p>

												</div>
											</>
										)}

									{ /* Add more here  */}
								</div>
							)}

							{'style' === secondActiveTab && (
								<div className="table-customization-style">
									<div className={`edit-form-group`}>
										<h4>
											{getStrings('cell-formatting')}{' '}
											<Tooltip
												content={getStrings(
													'tooltip-29'
												)}
											/>
											{ /* {!isProActive() && (<button className='btn-pro'>{getStrings('pro')}</button>)} */}
										</h4>

										<div className="style-checkbox-items">
											{ /* <div className={`style-checkbox-items${!isProActive() ? ` swptls-pro-settings` : ``}`}> */}
											<label
												className={`style-checkbox${tableSettings
													?.table_settings
													?.cell_format ===
													'expand'
													? ' active'
													: ''
													}`}
												htmlFor="expand"
											>
												<input
													type="radio"
													name="cell_format"
													id="expand"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																cell_format:
																	'expand',
															},
														})
													}
												/>
												<span>
													{getStrings('expanded')}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-30'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.cell_format ===
														'expand'
														? ' active'
														: ''
														}`}
												></div>
											</label>
											<label
												className={`style-checkbox${tableSettings
													?.table_settings
													?.cell_format === 'wrap'
													? ' active'
													: ''
													}`}
												htmlFor="wrap"
											>
												<input
													type="radio"
													name="responsive_style"
													id="wrap"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																cell_format:
																	'wrap',
															},
														})
													}
												/>
												<span>
													{getStrings('wrapped')}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-31'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.cell_format ===
														'wrap'
														? ' active'
														: ''
														}`}
												></div>
											</label>
										</div>
									</div>

									<div className={`edit-form-group`}>
										<h4>
											{getStrings('responsive-style')}{' '}
											<Tooltip
												content={getStrings(
													'tooltip-32'
												)}
											/>
											{ /* {!isProActive() && (<button className='btn-pro'>{getStrings('')}{getStrings('pro')}</button>)} */}
										</h4>
										<div className="style-checkbox-items">
											{ /* <div className={`style-checkbox-items${!isProActive() ? ` swptls-pro-settings` : ``}`}> */}
											<label
												className={`style-checkbox${tableSettings
													?.table_settings
													?.responsive_style ===
													'default_style'
													? ' active'
													: ''
													}`}
												htmlFor="default_style"
											>
												<input
													type="radio"
													name="responsive_style"
													id="default_style"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																responsive_style:
																	'default_style',
															},
														})
													}
												/>
												<span>
													{getStrings('default')}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-33'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.responsive_style ===
														'default_style'
														? ' active'
														: ''
														}`}
												></div>
											</label>
											<label
												className={`style-checkbox${tableSettings
													?.table_settings
													?.responsive_style ===
													'collapse_style'
													? ' active'
													: ''
													}`}
												htmlFor="collapse_style"
											>
												<input
													type="checkbox"
													name="collapse_style"
													id="collapse_style"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																responsive_style:
																	'collapse_style',
															},
														})
													}
												/>
												<span>
													{getStrings(
														'collapsible-style'
													)}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-34'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.responsive_style ===
														'collapse_style'
														? ' active'
														: ''
														}`}
												></div>
											</label>
											<label
												className={`style-checkbox${tableSettings
													?.table_settings
													?.responsive_style ===
													'scroll_style'
													? ' active'
													: ''
													}`}
												htmlFor="scroll_style"
											>
												<input
													type="checkbox"
													name="scroll_style"
													id="scroll_style"
													onClick={() =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																responsive_style:
																	'scroll_style',
															},
														})
													}
												/>
												<span>
													{getStrings(
														'scrollable-style'
													)}{' '}
													<Tooltip
														content={getStrings(
															'tooltip-35'
														)}
													/>
												</span>
												<div
													className={`control__indicator${tableSettings
														?.table_settings
														?.responsive_style ===
														'scroll_style'
														? ' active'
														: ''
														}`}
												></div>
											</label>
										</div>
									</div>

									<div className="table-customization-layout">
										<div className="edit-form-group">
											<label htmlFor="rows-per-page">
												{getStrings('row-per-page')}{' '}
												<Tooltip
													content={getStrings(
														'tooltip-37'
													)}
												/>
											</label>
											<select
												name="rows_per_page"
												id="rows-per-page"
												value={
													tableSettings
														?.table_settings
														?.default_rows_per_page
												}
												onChange={handleSelectChange}
											>
												<>
													{isProActive() ? (
														<>
															<option value="1">
																{getStrings(
																	'1'
																)}
															</option>
															<option value="5">
																{getStrings(
																	'5'
																)}
															</option>
															<option value="10">
																{getStrings(
																	'10'
																)}
															</option>
															<option value="15">
																{getStrings(
																	'15'
																)}
															</option>
															<option value="30">
																{getStrings(
																	'30'
																)}
															</option>
															<option value="50">
																{getStrings(
																	'50'
																)}
															</option>
															<option value="100">
																{getStrings(
																	'100'
																)}
															</option>
															<option value="-1">
																{getStrings(
																	'All'
																)}
															</option>
														</>
													) : (
														<>
															<option value="1">
																{getStrings(
																	'1'
																)}
															</option>
															<option value="5">
																{getStrings(
																	'5'
																)}
															</option>
															<option value="10">
																{getStrings(
																	'10'
																)}
															</option>
															<option value="15">
																{getStrings(
																	'15'
																)}
															</option>
															<option value="30">
																{getStrings(
																	'30'
																)}
															</option>

															<option value="50">
																{getStrings(
																	'50'
																)}
															</option>

															<option
																value="100"
																className={`${!isProActive()
																	? `swptls-pro-settings row-to-show-per-page`
																	: ``
																	}`}
															>
																{getStrings(
																	'100'
																)}
															</option>
															<option
																value="-1"
																className={`${!isProActive()
																	? `swptls-pro-settings row-to-show-per-page`
																	: ``
																	}`}
															>
																{getStrings(
																	'All'
																)}
															</option>
														</>
													)}
												</>
											</select>
										</div>

										<div className={`edit-form-group`}>
											<label htmlFor="table_height">
												<span
													className={`table_height_label`}
												>
													{getStrings(
														'table-height'
													)}{' '}
													<Tooltip
														content={`Select the table height. If the table height is lower there will be a vertical scrollbar to scroll through the rows`}
													/>
												</span>
												{ /* {!isProActive() && (<button className='btn-pro'>{getStrings('pro')}</button>)} */}
											</label>
											<div
												className={`edit-form-group swptls-select`}
											>
												<select
													// className={`${!isProActive() ? ` swptls-pro-settings` : ``}`}
													name="table_height"
													id="table_height"
													value={
														tableSettings
															?.table_settings
															?.vertical_scrolling
													}
													onChange={(e) =>
														setTableSettings({
															...tableSettings,
															table_settings: {
																...tableSettings.table_settings,
																vertical_scrolling:
																	parseInt(
																		e.target
																			.value
																	),
															},
														})
													}
												>
													<option value="default_height">
														{getStrings(
															'default-height'
														)}
													</option>
													<option value="400">
														{getStrings(
															'400px'
														)}
													</option>
													<option value="500">
														{getStrings(
															'500px'
														)}
													</option>
													<option value="600">
														{getStrings(
															'600px'
														)}
													</option>
													<option value="700">
														{getStrings(
															'700px'
														)}
													</option>
													<option value="800">
														{getStrings(
															'800px'
														)}
													</option>
													<option value="900">
														{getStrings(
															'900px'
														)}
													</option>
													<option value="1000">
														{getStrings(
															'1000px'
														)}
													</option>
												</select>
											</div>
										</div>
									</div>

									{ /* Merge featre are here berfor  */}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TableCustomization;
