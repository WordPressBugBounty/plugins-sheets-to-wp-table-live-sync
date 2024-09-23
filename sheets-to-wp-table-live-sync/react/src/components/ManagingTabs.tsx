import React, { useState, useEffect } from 'react';
import { getStrings, getNonce } from '../Helpers';
import { BluePlusIcon, DragIcon } from '../icons';
import Tooltip from './TooltipTab';
import Select from 'react-select';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './../styles/_managingTabs.scss';

const ManagingTabs = ( { currentTab, setCurrentTab } ) => {
	const [ activeTab, setActiveTab ] = useState(
		localStorage.getItem( 'swptls_managing_active_tab' ) || 1
	);
	const [ tables, setTables ] = useState( [] );
	const [ selectedTables, setSelectedTables ] = useState( [] );

	const handleActiveTab = ( index ) => {
		localStorage.setItem( 'swptls_managing_active_tab', index );
		setActiveTab( index );
	};

	const handleAddNewCollection = () => {
		const tabId = currentTab.tab_settings.length + 1;

		setCurrentTab( {
			...currentTab,
			tab_settings: [
				...currentTab.tab_settings,
				{ id: tabId, name: `Untitled`, tableId: [] },
			],
		} );

		setActiveTab( currentTab.tab_settings.length );
		setSelectedTables( [] );
	};

	const handleRemoveTab = ( index ) => {
		const newTabs = currentTab?.tab_settings?.filter(
			( tab, cIndex ) => parseInt( cIndex ) !== parseInt( index )
		);

		setCurrentTab( {
			...currentTab,
			tab_settings: newTabs,
			/* tab_settings: [
				...newTabs
			] */
		} );
	};

	// onDragEnd placed the update position and removed old position.
	const onDragEnd = ( result ) => {
		if ( ! result.destination ) return;

		const newTabs = Array.from( currentTab.tab_settings );
		const [ movedTab ] = newTabs.splice( result.source.index, 1 );
		newTabs.splice( result.destination.index, 0, movedTab );

		setCurrentTab( {
			...currentTab,
			tab_settings: newTabs,
		} );
		setActiveTab( result.destination.index );
	};

	useEffect( () => {
		wp.ajax.send( 'swptls_get_tables', {
			data: {
				nonce: getNonce(),
			},
			success( response ) {
				setTables(
					response?.tables.map( ( table ) => ( {
						value: table.id,
						label: table.table_name,
					} ) )
				);
			},
			error( error ) {
				console.error( error );
			},
		} );
	}, [] );

	useEffect( () => {
		const newCollection = { ...currentTab?.tab_settings };
		const collection = newCollection[ activeTab ];
		const result =
			collection?.tableID &&
			collection?.tableID.map( ( tableID ) => {
				return tables?.find( ( table ) => table.value === tableID );
			} );

		// Reset to an empty array if result is falsy
		setSelectedTables( result || [] ); // Fix empty selection if new tab added.
	}, [ currentTab.tab_settings, activeTab, tables ] );

	return (
		<div className="managing-tabs-wrap">
			<div className="tab-group-title">
				<label htmlFor="tab-group-title">
					{ getStrings( 'tab-group-title' ) }
					<span>
						<Tooltip content={ `Title of the tab group` } />
					</span>
				</label>

				<input
					type="text"
					name="tab_name"
					id="tab-group-title"
					value={ currentTab.tab_name }
					onChange={ ( e ) => {
						setCurrentTab( {
							...currentTab,
							tab_name: e.target.value,
						} );
					} }
				/>
			</div>

			{ /* Drag and DROP Implementation  */ }
			<DragDropContext onDragEnd={ onDragEnd }>
				<Droppable droppableId="tabs" direction="horizontal">
					{ ( provided ) => (
						<div
							className="managing-tab-head"
							{ ...provided.droppableProps }
							ref={ provided.innerRef }
						>
							{ currentTab?.tab_settings &&
								currentTab?.tab_settings?.map(
									( tab, index ) => (
										<Draggable
											key={ tab.id }
											draggableId={ `${ tab.id }` }
											index={ index }
										>
											{ ( provided ) => (
												<div
													key={ tab.id }
													data-tab-index={ index }
													onClick={ () =>
														handleActiveTab( index )
													}
													className={ `tab-button${
														index == activeTab
															? ` active`
															: ``
													}` }
													ref={ provided.innerRef }
													{ ...provided.draggableProps }
													{ ...provided.dragHandleProps }
												>
													<span className="drag-icon">
														{ DragIcon }
													</span>
													<span className="seperate-cross">
														{ tab.name || '\u00A0' }
													</span>
													<span
														className="tab-close-btn"
														onClick={ () =>
															handleRemoveTab(
																index
															)
														}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="8"
															height="8"
															viewBox="0 0 8 8"
															fill="none"
														>
															<path
																d="M1 7L7.0017 1M1 1L7.0017 7"
																stroke="#666873"
																strokeWidth="1.5"
																strokeLinecap="round"
															/>
														</svg>
													</span>
												</div>
											) }
										</Draggable>
									)
								) }
							{ provided.placeholder }
							<button
								className="add-tab"
								onClick={ handleAddNewCollection }
							>
								{ BluePlusIcon }
								{ getStrings( 'add-tab' ) }
							</button>
						</div>
					) }
				</Droppable>
			</DragDropContext>

			<div className="managing-tab-body">
				{ currentTab?.tab_settings &&
					currentTab.tab_settings?.map( ( tab, index ) => (
						<div
							className={ `single-tab-body${
								index == activeTab ? ` active` : ` hidden`
							}` }
							key={ index }
							data-tab-id={ index }
						>
							<div className="tab-title">
								<label htmlFor="tab-title">
									Tab 1 title
									<span>
										<Tooltip
											content={ `Enter the title for this tab` }
										/>
									</span>
								</label>
								<input
									type="text"
									name="tab_title"
									id="tab-title"
									value={ tab.name }
									onBlur={ ( e ) => {
										if ( '' === e.target.value ) {
											const newCollection = [
												...currentTab?.tab_settings,
											];

											newCollection[ index ] = {
												...newCollection[ index ],
												name: 'Untitled',
											};

											setCurrentTab( {
												...currentTab,
												tab_settings: newCollection,
											} );
										}
									} }
									onChange={ ( e ) => {
										const newCollection = [
											...currentTab?.tab_settings,
										];

										newCollection[ index ] = {
											...newCollection[ index ],
											name: e.target.value,
										};

										setCurrentTab( {
											...currentTab,
											tab_settings: newCollection,
										} );
									} }
								/>
							</div>
							<div className="select-table-for-tab-wrap">
								<label htmlFor="select-table-for-tab">
									Select table for Tab 1
									<span>
										<Tooltip
											content={ `Select the table which will be shown in this tab from the dropdown below` }
										/>
									</span>
								</label>
								<Select
									name="select_table_for_tab"
									id="select-table-for-tab"
									isMulti
									options={ tables }
									value={ selectedTables }
									onChange={ ( e ) => {
										const newCollection = [
											...currentTab?.tab_settings,
										];

										newCollection[ index ] = {
											...newCollection[ index ],
											tableID: [
												...[ ...e ].map(
													( { value } ) => value
												),
											],
										};

										setCurrentTab( {
											...currentTab,
											tab_settings: newCollection,
										} );
									} }
									menuShouldBlockScroll={ false }
									menuPortalTarget={ document.body }
									className="tab-select-listbox"
								/>
							</div>
						</div>
					) ) }
			</div>
		</div>
	);
};

export default ManagingTabs;
