import React, { useState, useEffect, useRef } from 'react';
import TablesList from './TablesList';
import Title from '../core/Title';
import CTAVideoPlayer from './CTAVideoPlayer';
import how_to_install_video_player from '../images/how-to-install-video-player.png';
import {
	WhitePlusIcon,
	searchIcon,
	sortIcon,
	arrowTop,
	arrowBottom,
	PlayerRound
} from '../icons';
import { Link } from 'react-router-dom';
import AddNewTable from './AddNewTable';
import Header from './Header';
import CtaNotice from './CtaNotice';
import {
	getNonce,
	getTables,
	convertToSlug,
	getStrings,
	isProActive,
	getCta_notice_status
} from './../Helpers';
import { toast } from 'react-toastify';
//styles
import '../styles/_dashboard.scss';
import Card from '../core/Card';

function Dashboard() {
	const sortingRef = useRef();
	const [loader, setLoader] = useState<boolean>(false);
	const [tables, setTables] = useState(getTables());
	const [copiedTables, setCopiedTables] = useState(getTables());
	const [sortingTables, setSortingTables] = useState(getTables());
	const [searchKey, setSearchKey] = useState<string>('');
	const [tableCount, setTableCount] = useState(0);
	const [isDropdownVisible, setDropdownVisible] = useState(false);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [showCtaNotice, setShowCtaNotice] = useState(true);
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // CTA Video Modal

	// Load initial sort settings from localStorage
	const initialSortField = localStorage.getItem('sortField') || 'Id';
	const initialSortOrder =
		localStorage.getItem('sortOrder') || 'Descending';
	const [sortField, setSortField] = useState(initialSortField);
	const [sortOrder, setSortOrder] = useState(initialSortOrder);

	// console.log(copiedTables)

	useEffect(() => {
		setLoader(true);

		wp.ajax.send('swptls_get_tables', {
			data: {
				nonce: getNonce(),
			},
			success(response) {
				const sortedTables = sortTables(
					response.tables,
					initialSortField,
					initialSortOrder
				);
				setTables(sortedTables);
				setCopiedTables(sortedTables);
				setSortingTables(sortedTables);
				setTableCount(response.tables_count);
				setLoader(false);
			},
			error(error) {
				console.error(error);
			},
		});


		// Check if CTA notice should be shown based on backend status
		const ctaNoticeStatus = getCta_notice_status();

		// Update localStorage based on backend status
		if (ctaNoticeStatus === 1 || ctaNoticeStatus === '1' || ctaNoticeStatus === true) {
			localStorage.setItem('swptls_cta_notice_dismissed', 'true');
			setShowCtaNotice(false);
		} else {
			localStorage.setItem('swptls_cta_notice_dismissed', 'false');
			setShowCtaNotice(true);
		}

		// Check if CTA notice should be shown
		const ctaDismissed = localStorage.getItem('swptls_cta_notice_dismissed');
		if (ctaDismissed === 'true') {
			setShowCtaNotice(false);
		}

	}, []);

	useEffect(() => {
		if (searchKey !== '') {
			const filtered = tables.filter(({ table_name }: any) =>
				table_name
					.toLowerCase()
					.includes(searchKey.toString().toLowerCase())
			);

			setCopiedTables(filtered);
		} else {
			setCopiedTables(tables);
		}
	}, [searchKey]);

	// Reseting Table
	useEffect(() => {
		const currentHash = window.location.hash;
		if (!currentHash.startsWith('#/tables/edit/')) {
			localStorage.setItem('active_tab', 'data_source');
			localStorage.setItem('second_active_tab', 'layout');
			localStorage.setItem('third_active_tab', 'columns');
			localStorage.setItem('forth_active_tab', 'conditional_view');
		}
	}, [window.location.hash]);

	// Table creation
	const constructCreateTableUrl = () => {
		const currentUrl = window.location.href; // Get the current full URL
		const baseUrl = currentUrl.split('#')[0]; // Get the base URL (before the hash)
		let newUrl = `${baseUrl}`;
		newUrl += '#/tables/create';
		return newUrl;
	};

	const handleCreateTable = () => {
		const newUrl = constructCreateTableUrl();

		if (isProActive()) {
			window.location.href = newUrl;
		} else {
			if (tableCount >= 10) {
				// alert("You can't create more than 10 tables.");
				toast.warning(
					<>
						{getStrings('table-10-limited')}{' '}
						<a target="blank" href="https://go.wppool.dev/DoC">
							{' '}
							{getStrings('upgrade-pro')}
						</a>
					</>
				);
			} else {
				window.location.href = newUrl;
			}
		}
	};

	const handleSortChange = (field, order) => {
		setSortField(field);
		setSortOrder(order);

		// Save to localStorage
		localStorage.setItem('sortField', field);
		localStorage.setItem('sortOrder', order);

		const sortedTables = sortTables(copiedTables, field, order);
		setCopiedTables(sortedTables);
	};

	const sortTables = (tables, field, order) => {
		return [...tables].sort((a, b) => {
			if (field === 'Name') {
				const nameA = a.table_name.toLowerCase();
				const nameB = b.table_name.toLowerCase();
				if (nameA < nameB) return order === 'Ascending' ? -1 : 1;
				if (nameA > nameB) return order === 'Ascending' ? 1 : -1;
				return 0;
			} else if (field === 'Id') {
				const idA = parseInt(a.id);
				const idB = parseInt(b.id);
				return order === 'Ascending' ? idA - idB : idB - idA;
			}
			return 0;
		});
	};

	const toggleDropdown = () => {
		setDropdownVisible(!isDropdownVisible);
	};

	const handleCtaNoticeDismiss = () => {
		setShowCtaNotice(false);
		localStorage.setItem('swptls_cta_notice_dismissed', 'true');
	};

	//
	function handleCancelOutside(event: MouseEvent) {
		if (
			sortingRef.current &&
			!sortingRef.current.contains(event.target)
		) {
			toggleDropdown();
		}
	}
	useEffect(() => {
		document.addEventListener('mousedown', handleCancelOutside);
		return () => {
			document.removeEventListener('mousedown', handleCancelOutside);
		};
	}, [handleCancelOutside]);

	return (
		<>
			<Header
				title={getStrings('dashboard')}
				description={getStrings('Dashboard-title')}
				// modalTitle={getStrings('mng-tab-modal-title')}
				showChangesLog={false}
				showProFeatures={true}
				showYoutubeTutorial={true}
			/>

			{/* CTA Notice - can be dismissed */}
			{showCtaNotice && tables.length > 0 && (
				<CtaNotice onDismiss={handleCtaNoticeDismiss} />
			)}


			{tables.length < 1 ? (
				<>
					<div className="no-tables-created-intro text-center">

						<h2>
							{getStrings('no-tables-have-been-created-yet')}
						</h2>
						<p>{getStrings('no-tables-video-click')}</p>

						<button
							className="btn btn-lg"
							onClick={handleCreateTable}
						>
							{getStrings('new-tables')}
							{WhitePlusIcon}
						</button>

						<br />
						<br />

						<p>
							{getStrings('need-help-watch-a')}{' '}
							<span
								onClick={() => setIsVideoModalOpen(true)}
								style={{
									color: '#575757',
									cursor: 'pointer',
									textDecoration: 'underline',
									fontWeight: 600,
									fontSize: '14px'
								}}
							>
								quick video
							</span>
						</p>


						<CTAVideoPlayer
							videoUrl="https://www.youtube.com/embed/1b9QXLg0JdQ?si=xKoYo7HD-wGWevnT"
							title="Get started with table creation"
							isOpen={isVideoModalOpen}
							onClose={() => setIsVideoModalOpen(false)}
						/>

					</div>
				</>
			) : (
				<>
					<div className="table-header">
						<Title tagName="h4">
							{getStrings('tables-created')} &nbsp; (<strong>{tableCount}</strong>)
						</Title>
						<div className="wrapper">
							{ /* Sorting code */}

							<div className="sort-wrapper"
								onClick={toggleDropdown}
							>
								<div className="sort-by">
									<div className="dropdown">
										<div
											className="header-sort-content"
											onClick={toggleDropdown}
										>
											<button className="dropbtn">
												{getStrings('sort-by')}
											</button>
											<span className="header-sort-icon">
												{sortIcon}
											</span>
										</div>

										{isDropdownVisible && (
											<div
												className={`dropdown-content ${isDropdownVisible
													? 'visible'
													: ''
													}`}
												ref={sortingRef}
											>
												<h4 className="sort-by-title">
													{getStrings('sort-by')}
												</h4>
												<hr />
												<label>
													<input
														className="sort-checkbox"
														type="radio"
														checked={
															sortField === 'Name'
														}
														onChange={() =>
															handleSortChange(
																'Name',
																sortOrder
															)
														}
													/>
													{getStrings('sort-by-name')}
												</label>

												<label>
													<input
														className="sort-checkbox"
														type="radio"
														checked={
															sortField === 'Id'
														}
														onChange={() =>
															handleSortChange(
																'Id',
																sortOrder
															)
														}
													/>
													{getStrings('sort-by-id')}
												</label>
												<hr />
												<label className="selective-sorting">
													<input
														className="sort-checkbox"
														type="radio"
														checked={
															sortOrder ===
															'Ascending'
														}
														onChange={() =>
															handleSortChange(
																sortField,
																'Ascending'
															)
														}
													/>
													{getStrings('ascending')}{arrowTop}
												</label>

												<label className="selective-sorting">
													<input
														className="sort-checkbox"
														type="radio"
														checked={
															sortOrder ===
															'Descending'
														}
														onChange={() =>
															handleSortChange(
																sortField,
																'Descending'
															)
														}
													/>
													{getStrings('descending')}{arrowBottom}
												</label>
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="table-search-box">
								<input
									type="text"
									placeholder={getStrings('search-tb')}
									onChange={(e) =>
										setSearchKey(e.target.value.trim())
									}
								/>
								<div className="icon">{searchIcon}</div>
							</div>
							{tableCount < 10 ? (
								<Link
									className="create-table btn btn-md"
									to="/tables/create"
								>
									{getStrings('new-tables')}{' '}
									{WhitePlusIcon}
								</Link>
							) : (
								<button
									className={`create-table btn btn-md${!isProActive()
										? ` swptls-pro-lock`
										: ``
										}`}
									onClick={handleCreateTable}
								>
									{getStrings('new-tables')}{' '}
									{WhitePlusIcon}
								</button>
							)}
						</div>
					</div>

					{loader ? (
						<Card>
							<h1>{getStrings('loading')}</h1>
						</Card>
					) : (
						<Card
							customClass={`table-item-card ${copiedTables.length === 0
								? 'has--not-found'
								: ''
								}`}
						>
							<TablesList
								// tables={tables}
								tables={copiedTables}
								copiedTables={copiedTables}
								setCopiedTables={setCopiedTables}
								setTables={setTables}
								setTableCount={setTableCount}
								setLoader={setLoader}
							/>

							<>
								{copiedTables.length === 0 ? (
									<div className="not-found-table">
										<div className="icon">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="53"
												height="52"
												viewBox="0 0 53 52"
												fill="none"
											>
												<path
													fill-rule="evenodd"
													clip-rule="evenodd"
													d="M42.4192 41.9193C43.2002 41.1382 44.4664 41.1382 45.2474 41.9193L51.9141 48.5859C52.6952 49.367 52.6952 50.6331 51.9141 51.4142C51.133 52.1953 49.8669 52.1953 49.0858 51.4142L42.4192 44.7475C41.6381 43.9665 41.6381 42.7003 42.4192 41.9193Z"
													fill="#DDE4E8"
												/>
												<path
													fill-rule="evenodd"
													clip-rule="evenodd"
													d="M35 47C42.1797 47 48 41.1797 48 34C48 26.8203 42.1797 21 35 21C27.8203 21 22 26.8203 22 34C22 41.1797 27.8203 47 35 47ZM39.3333 35.3028C40.2308 35.3028 40.9583 34.7196 40.9583 34.0002C40.9583 33.2807 40.2308 32.6974 39.3333 32.6974H30.6667C29.7692 32.6974 29.0417 33.2807 29.0417 34.0002C29.0417 34.7196 29.7692 35.3028 30.6667 35.3028H39.3333Z"
													fill="#DDE4E8"
												/>
												<path
													fill-rule="evenodd"
													clip-rule="evenodd"
													d="M0.5 12.6667C0.5 5.67107 6.17107 0 13.1667 0H39.8333C46.8291 0 52.5 5.67107 52.5 12.6667V17C52.5 18.1046 51.6045 19 50.5 19C49.3955 19 48.5 18.1046 48.5 17V12.6667C48.5 7.88019 44.6197 4 39.8333 4H13.1667C8.38019 4 4.5 7.88019 4.5 12.6667V39.3333C4.5 44.1197 8.38019 48 13.1667 48H17.5C18.6046 48 19.5 48.8955 19.5 50C19.5 51.1045 18.6046 52 17.5 52H13.1667C6.17107 52 0.5 46.3291 0.5 39.3333V12.6667Z"
													fill="#DDE4E8"
												/>
											</svg>
										</div>
										<div className="text">
											<h5 className="title">
												{getStrings('no-table-found')}
											</h5>
											<p>
												{getStrings('no-table-match')}
											</p>
										</div>
									</div>
								) : (
									<div className="add-new-wrapper">
										{/* <AddNewTable /> */}
									</div>
								)}
							</>
						</Card>
					)}
				</>
			)}
		</>
	);
}

export default Dashboard;
