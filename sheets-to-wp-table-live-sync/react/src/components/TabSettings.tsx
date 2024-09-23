import React from 'react';
import { getStrings } from './../Helpers';
//styles
import '../styles/_tabSettings.scss';
// import Tooltip from './Tooltip';
import Tooltip from './TooltipTab';

const TabSettings = ( { currentTab, setCurrentTab } ) => {
	return (
		<div className="tab-settings-wrap">
			<div className="hide-tab-group-title-wrap">
				<input
					type="checkbox"
					name="hide_tab_group_title"
					id="hide-tab-group-title"
					checked={
						currentTab?.show_name === '1' ||
						currentTab?.show_name === 1
					}
					onChange={ ( e ) => {
						setCurrentTab( {
							...currentTab,
							show_name: e.target.checked ? 1 : 0,
						} );
					} }
				/>
				<label htmlFor="hide-tab-group-title">
					{ getStrings( 'tab-grp-title' ) }
					<span>
						<Tooltip
							content={ `If this is checked, the tab group title will not be visible in the front end` }
						/>
					</span>
				</label>
			</div>

			<div className="tab-position-title">
				<label htmlFor="select-table-for-tab">
					{ getStrings( 'Tab-position' ) }
					<span>
						<Tooltip
							content={ `Choose where you want to show the tab` }
						/>
					</span>
				</label>
			</div>
			<div className="tab-positions-wrap">
				<button
					className={ `tab-position after-table${
						! parseInt( currentTab?.reverse_mode ) ? ' active' : ''
					}` }
					onClick={ ( e ) => {
						setCurrentTab( {
							...currentTab,
							reverse_mode: 0,
						} );
					} }
				>
					<span>
						{ getStrings( 'Before-the-table' ) }
						<Tooltip
							content={ `The tabs will be shown first and the table will be shown after it` }
						/>
					</span>
					<div className="control__indicator"></div>
				</button>

				<button
					className={ `tab-position before-table${
						parseInt( currentTab?.reverse_mode ) ? ' active' : ''
					}` }
					onClick={ ( e ) => {
						setCurrentTab( {
							...currentTab,
							reverse_mode: 1,
						} );
					} }
				>
					<span>
						{ getStrings( 'After-the-table' ) }
						<Tooltip
							content={ `The table will be shown first and the tab will be shown after it` }
						/>
					</span>
					<div className="control__indicator"></div>
				</button>
			</div>
		</div>
	);
};

export default TabSettings;
