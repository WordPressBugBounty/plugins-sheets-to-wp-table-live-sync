<?php
/**
 * Implementing Internationalize supports for the plugin.
 *
 * @since 2.12.15
 * @package SWPTLS
 */

namespace SWPTLS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for registering strings.
 *
 * @since 2.12.15
 * @package SWPTLS
 */
class Strings {
	/**
	 * Returns the strings.
	 *
	 * @return array
	 */
	public static function get() {
		return [
			/**
			 * Dashboard.
			 */
			'db-title' => __( 'Create beautiful tables from Google Sheets', 'sheets-to-wp-table-live-sync' ),
			'new-tables'  => __( 'Create new table', 'sheets-to-wp-table-live-sync' ),
			'tables-created'  => __( 'Your Tables', 'sheets-to-wp-table-live-sync' ),
			'loading'  => __( 'Loading...', 'sheets-to-wp-table-live-sync' ),

			'no-tables-have-been-created-yet'  => __( '👋 Welcome!', 'sheets-to-wp-table-live-sync' ),
			'no-tables-video-click'  => __( 'Click the button below to create your first table!', 'sheets-to-wp-table-live-sync' ),
			'need-help-watch-a'  => __( 'Need help? Watch a', 'sheets-to-wp-table-live-sync' ),

			'create-new-table'  => __( 'Create new table', 'sheets-to-wp-table-live-sync' ),
			'need-help'  => __( 'Need help?', 'sheets-to-wp-table-live-sync' ),
			'help-text'  => __( 'Help', 'sheets-to-wp-table-live-sync' ),
			'watch-now'  => __( 'Watch Now', 'sheets-to-wp-table-live-sync' ),
			'search-tb'  => __( 'Search tables', 'sheets-to-wp-table-live-sync' ),
			'search-items'  => __( 'Search items', 'sheets-to-wp-table-live-sync' ),

			'search-btn'  => __( 'Search', 'sheets-to-wp-table-live-sync' ),
			'clear-btn'  => __( 'Clear', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Tooltip
			 */

			'tooltip-0'  => __( 'This title will be shown on the top of your table', 'sheets-to-wp-table-live-sync' ),
			'tooltip-1'  => __( 'Copy the URL of your Google Sheet from your browser and paste it in the box below. Make sure your sheet is public.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-2'  => __( 'Copy the Google Sheet URL from your browser and paste it here to create table. Changing this URL will change your table.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-3'  => __( 'If this is enabled, the box showing number of entries will be hidden for the viewers', 'sheets-to-wp-table-live-sync' ),
			'tooltip-4'  => __( 'If enabled, the search box will be hidden for viewers', 'sheets-to-wp-table-live-sync' ),
			'tooltip-5'  => __( 'Enable this option to hide the table title for the viewers', 'sheets-to-wp-table-live-sync' ),
			'tooltip-6'  => __( 'If checked, the sorting option will be enabled for viewers when they view the table', 'sheets-to-wp-table-live-sync' ),
			'tooltip-7'  => __( 'If enabled the entry info showing number of current entries out of all the entries will be hidden', 'sheets-to-wp-table-live-sync' ),
			'tooltip-8'  => __( 'Enable this to hide the pagination for viewers', 'sheets-to-wp-table-live-sync' ),
			'tooltip-9'  => __( 'Display multiple tables using tabs. Just like your google sheets', 'sheets-to-wp-table-live-sync' ),
			'tooltip-10'  => __( 'Title of the tab group', 'sheets-to-wp-table-live-sync' ),
			'tooltip-11'  => __( 'Enter the title for this tab', 'sheets-to-wp-table-live-sync' ),
			'tooltip-12'  => __( 'Select the table which will be shown in this tab from the dropdown below', 'sheets-to-wp-table-live-sync' ),
			'tooltip-13'  => __( 'Enable this to hide the selected columns on mobile', 'sheets-to-wp-table-live-sync' ),
			'tooltip-14'  => __( 'Enable this to hide the selected column on desktop', 'sheets-to-wp-table-live-sync' ),
			'tooltip-15'  => __( 'This is the list of the hidden columns. Removing a column from this list will make them visible again', 'sheets-to-wp-table-live-sync' ),
			'tooltip-16'  => __( 'This is the list of the hidden rows. Removing a row from this list will make them visible again', 'sheets-to-wp-table-live-sync' ),
			'tooltip-17'  => __( 'This is the list of the hidden cells. Removing a cell from this list will make them visible again', 'sheets-to-wp-table-live-sync' ),
			'tooltip-18'  => __( 'Use direct google sheet embed link with text content, More flexiable and easy to use', 'sheets-to-wp-table-live-sync' ),
			'tooltip-19'  => __( 'Use old way [  ] pair to generate link', 'sheets-to-wp-table-live-sync' ),
			'tooltip-20'  => __( 'Copy the URL of your Google Sheet from your browser and paste it in the box below. Make sure your sheet is public..', 'sheets-to-wp-table-live-sync' ),
			'tooltip-21'  => __( 'Copy the URL of your Google Sheet and paste it here.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-22'  => __( 'Allows the users to download the table in the format that you select below', 'sheets-to-wp-table-live-sync' ),
			'tooltip-23'  => __( 'For the links on the table you can decide what will happen when a link is clicked', 'sheets-to-wp-table-live-sync' ),
			'tooltip-24'  => __( 'The link opens in the same tab where the table is', 'sheets-to-wp-table-live-sync' ),
			'tooltip-25'  => __( 'The link will be opened on a new tab', 'sheets-to-wp-table-live-sync' ),
			'tooltip-26'  => __( "Allow 'Smart links' to load multiple embeed links with text from Google Sheet. To use this makesure 'Smart link' support selected from 'link support mechanism' in 'Settings' menu. However, if there is no embeed links in the Sheet or your'e using pretty link format, then there is no need to use it, which will reduces loading time and makes the table load faster.", 'sheets-to-wp-table-live-sync' ),
			'tooltip-27'  => __( 'Allow images to be loaded from sheets. You can use it to import images if you have them in Google Sheets. However, if there is no image in the Sheet, there is no need to use it, which will reduces loading time and makes the table load faster.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-28'  => __( 'If enabled the table will load faster for the viewers', 'sheets-to-wp-table-live-sync' ),
			'tooltip-29'  => __( 'Choose how the table cell will look', 'sheets-to-wp-table-live-sync' ),
			'tooltip-30'  => __( 'Cell will expand according to the content', 'sheets-to-wp-table-live-sync' ),
			'tooltip-31'  => __( 'Cell will be wrapped according to the content', 'sheets-to-wp-table-live-sync' ),
			'tooltip-32'  => __( 'Choose how the table will look on devices with small screens', 'sheets-to-wp-table-live-sync' ),
			'tooltip-33'  => __( 'Let the browser decide the behavior of the responsiveness', 'sheets-to-wp-table-live-sync' ),
			'tooltip-34'  => __( 'The table rows will be collapse on  each other in one column', 'sheets-to-wp-table-live-sync' ),
			'tooltip-35'  => __( 'A horizontal scrollbar will appear for the users to scroll the table left and right', 'sheets-to-wp-table-live-sync' ),
			'tooltip-36'  => __( "Enable this feature to showcase your Sheet's merged cells seamlessly on the WordPress frontend table.", 'sheets-to-wp-table-live-sync' ),
			'tooltip-37'  => __( 'Select the number of rows to show per page', 'sheets-to-wp-table-live-sync' ),
			'tooltip-38'  => __( 'Select the table height. If the table height is lower there will be a vertical scrollbar to scroll through the rows', 'sheets-to-wp-table-live-sync' ),
			'tooltip-39'  => __( "Quickly change your table's look and feel using themes", 'sheets-to-wp-table-live-sync' ),
			'tooltip-40'  => __( 'Enable this feature to import colors and text styles directly from a Google Sheet, instead of using the predefined theme above', 'sheets-to-wp-table-live-sync' ),
			'tooltip-41'  => __( 'If this is checked, the tab group title will not be visible in the front end', 'sheets-to-wp-table-live-sync' ),
			'tooltip-42'  => __( 'Choose where you want to show the tab', 'sheets-to-wp-table-live-sync' ),
			'tooltip-43'  => __( 'The tabs will be shown first and the table will be shown after it', 'sheets-to-wp-table-live-sync' ),
			'tooltip-44'  => __( 'The table will be shown first and the tab will be shown after it', 'sheets-to-wp-table-live-sync' ),

			'tooltip-45'  => __( 'Set the cursor behavior on your table', 'sheets-to-wp-table-live-sync' ),
			'tooltip-46'  => __( 'You can easily highlight text for copy-paste', 'sheets-to-wp-table-live-sync' ),
			'tooltip-47'  => __( 'You can effortlessly move the table horizontally (left-right).', 'sheets-to-wp-table-live-sync' ),

			'tooltip-48'  => __( 'Allow checkbox to be loaded from sheets. You can use it to import checkox if you have them in Google Sheets.', 'sheets-to-wp-table-live-sync' ),

			'tooltip-50' => __( 'Enable row and column coloring', 'sheets-to-wp-table-live-sync' ),
			'tooltip-51' => __( 'Choose the column or row to add colors', 'sheets-to-wp-table-live-sync' ),
			'tooltip-52' => __( 'Add color on column', 'sheets-to-wp-table-live-sync' ),
			'tooltip-53' => __( 'Add color on row', 'sheets-to-wp-table-live-sync' ),

			'tooltip-54'  => __( 'Select which column to sort on load, or keep the format from Google Sheets.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-55'  => __( 'Choose the order of sorting for the selected column.', 'sheets-to-wp-table-live-sync' ),

			'tooltip-56' => __('Specify the maximum time (in seconds) the plugin will wait for a response from the Google server. A higher timeout allows more time to receive a complete response, but may delay table loading; a lower timeout can speed up loading but may result in missing data if the response isn’t fully received. A setting between 10 and 15 seconds is generally recommended for balanced performance.','sheets-to-wp-table-live-sync'),

			'tooltip-57'  => __( 'Choose how you want to sort your table on load. Select a specific column to sort by (either ascending or descending), or keep the same format as in Google Sheets.', 'sheets-to-wp-table-live-sync' ),

			'tooltip-58' => __( 'Select this to make the custom theme available for all tables. If unchecked, the theme will only be used for this table.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-59' => __( 'If selected, any changes made to your theme will be automatically applied to all other tables with the same theme, ensuring consistency across them. If the theme does not exist in other tables, it will be cloned with update style.', 'sheets-to-wp-table-live-sync' ),

			'tooltip-60' => __( 'Adjust the header’s offset to prevent overlap with sticky menus or other elements at the top of the page.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-61' => __( 'Set how many columns from the left side of the table should remain fixed while scrolling.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-62' => __( 'Set how many columns from the right side of the table should remain fixed while scrolling.', 'sheets-to-wp-table-live-sync' ),
			'tooltip-63' => __( "When this option is enabled, the cache won't trigger any API request to update data from sheets. This helps improve performance and reduce server load. Important: If this is enabled before turning on features like merged cells, links, images, or importing table styles from Google Sheets, those features might not appear until the cache expires. To avoid this, enable all necessary features first, then active the cache feaure and then turn on this option. You can also change the cache expiry time in Settings.", 'sheets-to-wp-table-live-sync' ),
			'tooltip-64' => __( 'Set how many days the cache should be stored in transients. Once the transient expires, the data will automatically refresh from the connected Google Sheets with updated data.', 'sheets-to-wp-table-live-sync' ),

			'tooltip-65' => __( 'Allow visitors to ask questions about the table. AI scans the data and returns accurate, easy to understand answers in real time.', 'sheets-to-wp-table-live-sync' ),

			/**
			 * AddNewTable.
			 */
			'add-new-table'  => __( 'Add new table', 'sheets-to-wp-table-live-sync' ),

			/**
			 * App.
			 */
			'please-activate-your-license'  => __( 'Please activate your license', 'sheets-to-wp-table-live-sync' ),
			'activate'  => __( 'Activate', 'sheets-to-wp-table-live-sync' ),

			/**
			 * ChangesLog.
			 */
			'db-headway'  => __( 'What’s new?', 'sheets-to-wp-table-live-sync' ),

			/**
			 * CreateTab.
			 */
			'save-changes'  => __( 'Save changes', 'sheets-to-wp-table-live-sync' ),
			'managing-tabs'  => __( '1. Tab Creation', 'sheets-to-wp-table-live-sync' ),
			'tab-settings'  => __( '2. Tab settings', 'sheets-to-wp-table-live-sync' ),
			'table-settings'  => __( 'Table Settings', 'sheets-to-wp-table-live-sync' ),

			'managing-tabs-title'  => __( 'Create tab view with tables', 'sheets-to-wp-table-live-sync' ),
			'tab-settings-title'  => __( 'Adjust tab appearance and behavior', 'sheets-to-wp-table-live-sync' ),
			'save-and-move'  => __( 'Save & go to Manage Tab', 'sheets-to-wp-table-live-sync' ),
			'save-and-move-dashboard'  => __( 'Save & go to dashboard', 'sheets-to-wp-table-live-sync' ),
			'save-and-move-dashboard'  => __( 'Go to Dashboard', 'sheets-to-wp-table-live-sync' ),
			'go-to-dashboard'  => __( 'Save changes', 'sheets-to-wp-table-live-sync' ),
			'copy-mail'  => __( 'COPY EMAL', 'sheets-to-wp-table-live-sync' ),
			'id-table'  => __( 'ID: TB_', 'sheets-to-wp-table-live-sync' ),
			'tab-short-copy'  => __( 'Copied!', 'sheets-to-wp-table-live-sync' ),
			'wiz-back'  => __( 'Back', 'sheets-to-wp-table-live-sync' ),
			'wiz-next'  => __( 'Next', 'sheets-to-wp-table-live-sync' ),
			'tab-1'  => __( 'Tab title', 'sheets-to-wp-table-live-sync' ),
			'mng-tab'  => __( 'Tab Groups', 'sheets-to-wp-table-live-sync' ),
			'mng-tab-content'  => __( 'Organize multiple tables into tabs, just like Google Sheets!', 'sheets-to-wp-table-live-sync' ),
			'mng-tab-modal-title'  => __( 'Get started with tab groups', 'sheets-to-wp-table-live-sync' ),
			'no-tab'  => __( 'No tab group found!', 'sheets-to-wp-table-live-sync' ),
			'no-tab-match'  => __( 'No tab group matches to your search term', 'sheets-to-wp-table-live-sync' ),
			'select-table-for-tab'  => __( 'Select table for Tab 1', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Pagination
			 */

			'sel-pagination'  => __( 'Select Pagination', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Sorting
			 */
			'sort-by-name'  => __( 'Name', 'sheets-to-wp-table-live-sync' ),
			'sort-by-id'  => __( 'ID', 'sheets-to-wp-table-live-sync' ),
			'sort-by-date'  => __( 'Date', 'sheets-to-wp-table-live-sync' ),
			'ascending'  => __( 'Ascending', 'sheets-to-wp-table-live-sync' ),
			'descending'  => __( 'Descending', 'sheets-to-wp-table-live-sync' ),
			'above'  => __( 'above', 'sheets-to-wp-table-live-sync' ),
			'below'  => __( 'below', 'sheets-to-wp-table-live-sync' ),
			'no-table-found'  => __( 'No tables found!', 'sheets-to-wp-table-live-sync' ),
			'no-table-match'  => __( 'No tables matches to your search term', 'sheets-to-wp-table-live-sync' ),

			/**
			 * EditTab.
			 */
			'shortcode'  => __( 'Shortcode', 'sheets-to-wp-table-live-sync' ),
			'manage-tab'  => __( '1. Managing tabs', 'sheets-to-wp-table-live-sync' ),

			/**
			 * CreateTable.
			 */
			'create-table'  => __( 'Create table', 'sheets-to-wp-table-live-sync' ),
			'create-table-from-url'  => __( 'Create table from URL', 'sheets-to-wp-table-live-sync' ),
			'change-theme-table-style'  => __( 'Change theme and table style', 'sheets-to-wp-table-live-sync' ),
			'change-table-theme'  => __( 'You can change table theme below. You will find more customization in the dashboard. ', 'sheets-to-wp-table-live-sync' ),
			'get-pro'  => __( 'Get Pro ', 'sheets-to-wp-table-live-sync' ),
			'pro'  => __( 'PRO', 'sheets-to-wp-table-live-sync' ),
			// 'pro-lock'  => __( 'PRO', 'sheets-to-wp-table-live-sync' ),
			'to-create-table-from-any-tab'  => __( 'to create table from any tab of your Google SpreadSheet.', 'sheets-to-wp-table-live-sync' ),
			'google-sheet-url'  => __( 'Add your Google Sheet URL to create a table', 'sheets-to-wp-table-live-sync' ),
			'copy-the-url'  => __( 'Paste the browser URL of your Google Sheet below, and the table will be created for you to customize', 'sheets-to-wp-table-live-sync' ),
			'creating-new-table'  => __( 'Creating new table', 'sheets-to-wp-table-live-sync' ),

			/**
			 * CtaAdd.
			 */
			'create-wooCommerce-product'  => __( 'Create WooCommerce product table easily!', 'sheets-to-wp-table-live-sync' ),

			'install-stock-sync-for-wooCommerce'  => __( 'Install Stock Sync for WooCommerce', 'sheets-to-wp-table-live-sync' ),

			'and sync your store products'  => __( 'and sync your store products to Google Sheets. Use the synced Google Sheet to create table. It’s easy!', 'sheets-to-wp-table-live-sync' ),

			'install-now'  => __( 'Install now', 'sheets-to-wp-table-live-sync' ),

			/**
			 * DataSource.
			 */
			'table-title'  => __( 'Table title', 'sheets-to-wp-table-live-sync' ),
			'please-reduce-title-to-save'  => __( 'Please reduce title to save.', 'sheets-to-wp-table-live-sync' ),
			'gsu'  => __( 'Google Sheet URL', 'sheets-to-wp-table-live-sync' ),

			/**
			 * ThemeSettings
			 */
			'show-table-title'  => __( 'Show Table title', 'sheets-to-wp-table-live-sync' ),
			'table-top-elements'  => __( 'Table top elements', 'sheets-to-wp-table-live-sync' ),
			'hide-ent'  => __( 'Show entries', 'sheets-to-wp-table-live-sync' ),
			'hide-search-box'  => __( 'Show search box', 'sheets-to-wp-table-live-sync' ),
			'swap'  => __( 'Swap', 'sheets-to-wp-table-live-sync' ),
			'hide-title'  => __( 'Hide title', 'sheets-to-wp-table-live-sync' ),

			'allow-sorting'  => __( 'Allow Table Sorting', 'sheets-to-wp-table-live-sync' ),
			'sorting-control'  => __( 'Hide sorting controls from table', 'sheets-to-wp-table-live-sync' ),
			'auto-sorting'  => __( 'Set Default Table Sorting on Load', 'sheets-to-wp-table-live-sync' ),
			'col-sorting'  => __( 'Sort By Column', 'sheets-to-wp-table-live-sync' ),
			'order-sorting'  => __( 'Sort By Order', 'sheets-to-wp-table-live-sync' ),
			'sort-by'  => __( 'Sort By', 'sheets-to-wp-table-live-sync' ),

			'enb-fixed-clmn'  => __( 'Freeze Table Columns', 'sheets-to-wp-table-live-sync' ),
			'left-clmn-header'  => __( 'Left Columns Numbers', 'sheets-to-wp-table-live-sync' ),
			'right-clmn-header'  => __( 'Right Columns Numbers', 'sheets-to-wp-table-live-sync' ),
			'fixed-header'  => __( 'Freeze Table Header', 'sheets-to-wp-table-live-sync' ),
			'header-offset'  => __( 'Header Offset', 'sheets-to-wp-table-live-sync' ),

			'table-bottom-ele'  => __( 'Table bottom elements', 'sheets-to-wp-table-live-sync' ),
			'hide-entry-info'  => __( 'Show entry info', 'sheets-to-wp-table-live-sync' ),
			'hide-pagi'  => __( 'Show pagination', 'sheets-to-wp-table-live-sync' ),
			'swap-pos'  => __( 'Swap position', 'sheets-to-wp-table-live-sync' ),
			'swapped-pos'  => __( 'Swapped position', 'sheets-to-wp-table-live-sync' ),
			'theme-alert'  => __( 'Themes cannot be used when the "Import colors and text styles from sheet" feature is enabled', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Documentation.
			 */

			'doc-1'  => __('How does this plugin work?', 'sheets-to-wp-table-live-sync'),
			'doc-1-ans'  => __("Watch how to <a target='_blank' href='https://www.youtube.com/playlist?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP'>get started with FlexTable</a>.",'sheets-to-wp-table-live-sync'),

			'doc-10'  => __('Where can I find tutorials about this plugin?', 'sheets-to-wp-table-live-sync'),
			'doc-10-ans'  => __("Please visit our <a target='_blank' href='https://www.youtube.com/playlist?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP'>Youtube playlist</a>, where we post tutorials on how you can use different features of the plugin.",'sheets-to-wp-table-live-sync'),

			'doc-2'  => __('What date format can I use?', 'sheets-to-wp-table-live-sync'),
			'doc-2-ans'  => __("When working with date formats in your table, you have various options to choose from. Avoid using a <span class='date-format'><code>comma separator</code></span>, but consider formats such as <br> e.g. <span class='date-format'><code>2005-06-07</code> | <code>2005/06/07</code> | <code>2005 06 07</code> | <code>June 7- 2005</code> | <code>June 7 2005</code> | <code>7th June 2005</code></span>",'sheets-to-wp-table-live-sync'),

			'doc-3'  => __('Which one is better for link support?', 'sheets-to-wp-table-live-sync'),
			'doc-3-ans'  => __(
				"For enhanced link functionality, it's advisable to utilize <span class='date-format'><code>Smart Link</code></span> over the <span class='date-format'><code>Pretty Link</code></span>. Smart Link is known for its robust and user-friendly features.",'sheets-to-wp-table-live-sync'),

			'doc-5'  => __('Why my table taking too long to load?', 'sheets-to-wp-table-live-sync'),
			'doc-5-ans'  => __(
				"If your table is taking too long to load, it may be due to the presence of a substantial amount of data in Google Sheets, along with images and links. If your sheet doesn't contain images or links, consider disabling <span class='date-format'><code>links and Image support</code></span> within the <span class='date-format'><code>Utility</code></span> settings of Table Customization to expedite table loading. Utilizing the cache feature can also improve loading times.",'sheets-to-wp-table-live-sync'),

			'doc-6'  => __('How long table data can take to update if Cache is activated?', 'sheets-to-wp-table-live-sync'),
			'doc-6-ans'  => __(
				"When the cache feature is active, updates to your table data are not reliant on your browser's cache. Changes made in your sheet may take approximately 15-40 seconds to reflect. To view the latest updates, simply refresh the page after this timeframe.",'sheets-to-wp-table-live-sync'),

			'doc-7'  => __('How do I find tutorials about using the plugin?', 'sheets-to-wp-table-live-sync'),
			'doc-7-ans'  => __(
				"Please visit our <a target='_blank' href='https://www.youtube.com/playlist?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP'>YouTube playlist</a>, where we post tutorials on how you can use different features of the plugin.",'sheets-to-wp-table-live-sync'),

			'doc-9'  => __( 'How can I create a table from an imported XLSX file in google spreadsheets?', 'sheets-to-wp-table-live-sync' ),
			'doc-9-ans'  => __(
				"Make sure to import the XLSX file into Google Spreadsheets in the following ways. Create a new blank spreadsheet, then navigate to `<span class='date-format'><code> File > Import > Upload</code></span>` Drag the XLSX files to import. Then share the spreadsheets from 'General Access'. Please visit our <a target='_blank' href='https://www.youtube.com/playlist?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP'>YouTube playlist</a>, where we post tutorials on how you can use XLSX file imported in google spreadsheets.",'sheets-to-wp-table-live-sync'),

			// Documentation other text.
			'get-started'  => __( 'Get Started', 'sheets-to-wp-table-live-sync' ),
			'get-started-content'  => __( 'Let’s get you set up so you can start creating awesome tables', 'sheets-to-wp-table-live-sync' ),

			'documentation'  => __( 'Documentation', 'sheets-to-wp-table-live-sync' ),
			'vt'  => __( 'Video Tutorial', 'sheets-to-wp-table-live-sync' ),
			'prof-need-help'  => __( 'Get professional help via our ticketing system', 'sheets-to-wp-table-live-sync' ),
			'faq'  => __( 'Frequently Asked Question', 'sheets-to-wp-table-live-sync' ),
			'get-plugin'  => __( 'Get the most out of the plugin. Go Pro!', 'sheets-to-wp-table-live-sync' ),
			'unlock-all'  => __( 'Unlock all features', 'sheets-to-wp-table-live-sync' ),
			'link-supp'  => __( 'Link Support to import links from sheet', 'sheets-to-wp-table-live-sync' ),
			'pre-built-sheet-style'  => __( 'Pre-built amazing table styles where Each styles is different from one another', 'sheets-to-wp-table-live-sync' ),
			'hide-row-based-on'  => __( 'Hide your google sheet table rows based on your custom row selection', 'sheets-to-wp-table-live-sync' ),
			'unlimited-fetch-from-gs'  => __( 'Unlimited Row Sync and fetch unlimited rows from Google spreadsheet', 'sheets-to-wp-table-live-sync' ),

			/**
			 * EditTable
			 */
			'export-json'  => __( 'Export as JSON', 'sheets-to-wp-table-live-sync' ),
			'export-csv'  => __( 'Export as CSV', 'sheets-to-wp-table-live-sync' ),
			'export-pdf'  => __( 'Export as PDF', 'sheets-to-wp-table-live-sync' ),
			'export-excel'  => __( 'Export as Excel', 'sheets-to-wp-table-live-sync' ),
			'print'  => __( 'Print Table', 'sheets-to-wp-table-live-sync' ),
			'copy'  => __( 'Copy to Clipboard', 'sheets-to-wp-table-live-sync' ),

			'live-sync-is-limited'  => __( 'Live sync is limited to 30 rows.', 'sheets-to-wp-table-live-sync' ),
			'table-10-limited'  => __( 'In your free plan, you are limited to creating 10 tables. Upgrade to create more.', 'sheets-to-wp-table-live-sync' ),
			'upgrade-pro'  => __( 'Upgrade to Pro', 'sheets-to-wp-table-live-sync' ),
			'for-showing-full'  => __( 'for showing full google sheet.', 'sheets-to-wp-table-live-sync' ),

			'data-source'  => __( '1. Data source', 'sheets-to-wp-table-live-sync' ),
			'table-theme'  => __( '2. Table theme', 'sheets-to-wp-table-live-sync' ),
			'tc'  => __( '3. Table customization', 'sheets-to-wp-table-live-sync' ),
			'hide-row-col'  => __( '4. Hide Rows/Column', 'sheets-to-wp-table-live-sync' ),
			'conditional-view'  => __( '5. Conditional Table View', 'sheets-to-wp-table-live-sync' ),
			'ai-integration'  => __( '6. AI Integration', 'sheets-to-wp-table-live-sync' ),
			'table-desc'  => __( 'Table description', 'sheets-to-wp-table-live-sync' ),
			'show-table-desc'  => __( 'Show Table description', 'sheets-to-wp-table-live-sync' ),

			'data-source-title'  => __( 'Connect your Google Sheet ', 'sheets-to-wp-table-live-sync' ),
			'table-theme-title'  => __( 'Choose how your table appears', 'sheets-to-wp-table-live-sync' ),
			'tc-title'  => __( 'Style and personalize your table’s look', 'sheets-to-wp-table-live-sync' ),
			'hide-row-col-title'  => __( 'Show or hide specific rows and columns', 'sheets-to-wp-table-live-sync' ),
			'conditional-view-title'  => __( 'Choose how you want to Display the table', 'sheets-to-wp-table-live-sync' ),
			'ai-integration-title'    => __( 'Auto-summarize data or let visitors ask questions using AI', 'sheets-to-wp-table-live-sync' ),

			'save'  => __( 'Save', 'sheets-to-wp-table-live-sync' ),
			'lp'  => __( 'Loading Preview...', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Header
			 */
			'dashboard'  => __( 'All Tables', 'sheets-to-wp-table-live-sync' ),
			'get-unlimited-access'  => __( 'Upgrade', 'sheets-to-wp-table-live-sync' ),

			/**
			 * ManageTabs
			 */

			 'CTF'  => __( 'Create tables first to manage tabs', 'sheets-to-wp-table-live-sync' ),
			'manage-tab-is-not-available'  => __( 'Manage tab is not available because you don’t have any tables yet. Please create tables first', 'sheets-to-wp-table-live-sync' ),
			'display-multiple'  => __( 'Display multiple tables using tabs.', 'sheets-to-wp-table-live-sync' ),
			'manage-new-tabs'  => __( 'Create New Tab Group', 'sheets-to-wp-table-live-sync' ),
			'tabs-created'  => __( 'Your Tab Groups', 'sheets-to-wp-table-live-sync' ),
			'no-tabs-found'  => __( 'No tabs found with the key', 'sheets-to-wp-table-live-sync' ),

			/**
			 * ManagingTabs
			 */
			'select-table-for-tab'  => __( 'Select table for this tab', 'sheets-to-wp-table-live-sync' ),
			'tab-title'  => __( 'Tab Title', 'sheets-to-wp-table-live-sync' ),
			'add-tab'  => __( 'Add tab', 'sheets-to-wp-table-live-sync' ),
			'tab-group-title'  => __( 'Tab group name', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Promo
			 */
			'lts-data'  => __( 'Let’s bring meaning to your data', 'sheets-to-wp-table-live-sync' ),
			'create-beautifully-designed-tables'  => __( 'Create beautifully designed tables from Google sheets and customize as you need.', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Recommendation
			 */
			'other-prodct'  => __( 'Our Other Products', 'sheets-to-wp-table-live-sync' ),
			'remarkable-product'  => __( 'Experience remarkable WordPress products with a new level of power, beauty, and human-centered designs. Think you know WordPress products? Think Deeper!', 'sheets-to-wp-table-live-sync' ),

			/**
			 * RowSettings
			 */
			// 'hidden-cell'  => __( 'Hidden cells', 'sheets-to-wp-table-live-sync' ),
			'hidden-cell'  => __( 'Hidden Cells on Desktop', 'sheets-to-wp-table-live-sync' ),
			'hidden-cell-mob'  => __( 'Hidden Cells on Mobile', 'sheets-to-wp-table-live-sync' ),

			'hide-cell'  => __( 'Hide Cells', 'sheets-to-wp-table-live-sync' ),

			// 'hidden-row'  => __( 'Hidden rows', 'sheets-to-wp-table-live-sync' ),
			'hidden-row'  => __( 'Hidden Rows on Desktop', 'sheets-to-wp-table-live-sync' ),
			'hidden-row-mob'  => __( 'Hidden Rows on Mobile', 'sheets-to-wp-table-live-sync' ),

			'hide-row'  => __( 'Hide Rows', 'sheets-to-wp-table-live-sync' ),
			'same-desktop'  => __( 'Same as desktop', 'sheets-to-wp-table-live-sync' ),

			// 'hidden-column'  => __( 'Hidden Columns', 'sheets-to-wp-table-live-sync' ),
			'hidden-column'  => __( 'Hidden Columns on Desktop', 'sheets-to-wp-table-live-sync' ),
			'hidden-column-mob'  => __( 'Hidden Columns on Mobile', 'sheets-to-wp-table-live-sync' ),
			'hide-column-desktop'  => __( 'Hide columns on desktop', 'sheets-to-wp-table-live-sync' ),
			'hide-column-mobile'  => __( 'Hide columns on mobile', 'sheets-to-wp-table-live-sync' ),

			'hide-column'  => __( 'Hide Columns', 'sheets-to-wp-table-live-sync' ),
			'hide-desktop'  => __( 'Hide on Desktop', 'sheets-to-wp-table-live-sync' ),
			'hide-mobile'  => __( 'Hide on Mobile', 'sheets-to-wp-table-live-sync' ),
			'desktop'  => __( 'Desktop', 'sheets-to-wp-table-live-sync' ),
			'mobile'  => __( 'Mobile', 'sheets-to-wp-table-live-sync' ),
			'click-on-the-cells'  => __( 'Click on the cells on the table below that you want to hide', 'sheets-to-wp-table-live-sync' ),
			'click-on-the-rows'  => __( 'Click on the rows on the table below that you want to hide', 'sheets-to-wp-table-live-sync' ),
			'click-on-the-col'  => __( 'Click on the column on the table below that you want to hide', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Settings
			 */
			'new'  => __( 'New', 'sheets-to-wp-table-live-sync' ),
			'save-settings'  => __( 'Save settings', 'sheets-to-wp-table-live-sync' ),
			'custom-css'  => __( 'Custom CSS', 'sheets-to-wp-table-live-sync' ),
			'recommended'  => __( 'Recommended', 'sheets-to-wp-table-live-sync' ),
			'with-pretty-link'  => __( 'With Pretty link', 'sheets-to-wp-table-live-sync' ),
			'with-smart-link'  => __( 'With Smart link', 'sheets-to-wp-table-live-sync' ),
			'asynchronous-loading'  => __( 'Asynchronous loading', 'sheets-to-wp-table-live-sync' ),

			'async-content'  => __( 'Enable this feature to load the table faster. The table will load in the frontend after loading all content with a pre-loader. If this feature is disabled then the table will load with the reloading of browser every time.', 'sheets-to-wp-table-live-sync' ),

			'choose-link-support'  => __( 'Choose your link support mechanism in WP Tables', 'sheets-to-wp-table-live-sync' ),
			'write-own-css'  => __( 'Write your own custom CSS to design the table or the page itself. Activate the Pro extension to enable custom CSS option', 'sheets-to-wp-table-live-sync' ),
			'performance'  => __( 'Performance', 'sheets-to-wp-table-live-sync' ),

			'script-content'  => __( 'Choose how you want to load your table scripts', 'sheets-to-wp-table-live-sync' ),
			'global-loading'  => __( 'Global loading', 'sheets-to-wp-table-live-sync' ),
			'global-loading-details'  => __( 'Load the scripts on all the pages and posts in your website.', 'sheets-to-wp-table-live-sync' ),
			'optimized-loading'  => __( 'Optimized loading', 'sheets-to-wp-table-live-sync' ),
			'optimized-loading-details'  => __( 'Load scripts only on the relevant pages/posts in your website where the table is added.', 'sheets-to-wp-table-live-sync' ),

			/**
			 * SupportModel
			 */
			'WPPOOL'  => __( 'WPPOOL', 'sheets-to-wp-table-live-sync' ),
			'powered-by'  => __( 'Powered by', 'sheets-to-wp-table-live-sync' ),
			'default-mail'  => __( 'Default Email App', 'sheets-to-wp-table-live-sync' ),
			'open-default-mail'  => __( 'Open your default email app', 'sheets-to-wp-table-live-sync' ),
			'copy-content'  => __( 'Copy email address to your clipboard', 'sheets-to-wp-table-live-sync' ),
			'yahoo'  => __( 'Yahoo', 'sheets-to-wp-table-live-sync' ),
			'yahoo-content'  => __( 'Open Yahoo in browser', 'sheets-to-wp-table-live-sync' ),
			'outlook'  => __( 'Outlook', 'sheets-to-wp-table-live-sync' ),
			'outlook-content'  => __( 'Open Outlook in browser', 'sheets-to-wp-table-live-sync' ),
			'gmail'  => __( 'Gmail', 'sheets-to-wp-table-live-sync' ),
			'gmail-content'  => __( 'Open Gmail in browser', 'sheets-to-wp-table-live-sync' ),
			'support-modal-title'  => __( 'Select the convenient option to connect with us', 'sheets-to-wp-table-live-sync' ),

			/**
			 * TabItem
			 */
			'Delete'  => __( 'Delete', 'sheets-to-wp-table-live-sync' ),
			'tab-group-delete'  => __( 'This Tab Group will be deleted. It will not appear on your website anymore, if you used it somewhere', 'sheets-to-wp-table-live-sync' ),
			'Cancel'  => __( 'Cancel', 'sheets-to-wp-table-live-sync' ),
			'confirmation-delete'  => __( 'Are you sure to delete this Tab Group?', 'sheets-to-wp-table-live-sync' ),

			/**
			 * TableCustomization
			 */

			'Utility'  => __( 'Utility', 'sheets-to-wp-table-live-sync' ),
			'Style'  => __( 'Styling', 'sheets-to-wp-table-live-sync' ),
			'Layout'  => __( 'Layout', 'sheets-to-wp-table-live-sync' ),
			'table_customization_layout'  => __( 'Layout', 'sheets-to-wp-table-live-sync' ),
			'let-export'  => __( 'Let user export table', 'sheets-to-wp-table-live-sync' ),
			'Excel'  => __( 'Excel', 'sheets-to-wp-table-live-sync' ),
			'JSON'  => __( 'JSON', 'sheets-to-wp-table-live-sync' ),
			'Copy'  => __( 'Copy', 'sheets-to-wp-table-live-sync' ),
			'CSV'  => __( 'CSV', 'sheets-to-wp-table-live-sync' ),
			'PDF'  => __( 'PDF', 'sheets-to-wp-table-live-sync' ),
			'Print'  => __( 'Print', 'sheets-to-wp-table-live-sync' ),
			'link-behave'  => __( 'Link redirection behaviour', 'sheets-to-wp-table-live-sync' ),
			'open-ct-window'  => __( 'Opens in current window', 'sheets-to-wp-table-live-sync' ),
			'open-new-window'  => __( 'Opens in a new window', 'sheets-to-wp-table-live-sync' ),

			'cursor-behavior'  => __( 'Cursor behavior inside the table', 'sheets-to-wp-table-live-sync' ),
			'highlight-and-copy'  => __( 'Text selection mode', 'sheets-to-wp-table-live-sync' ),
			'left-to-right'  => __( 'Table navigation mode (left-right)', 'sheets-to-wp-table-live-sync' ),

			'import-links'  => __( 'Import links from sheet', 'sheets-to-wp-table-live-sync' ),

			'import-checkbox'  => __( 'Import checkbox from sheet', 'sheets-to-wp-table-live-sync' ),
			'specific-column'  => __( 'Enable sorting by specific columns in', 'sheets-to-wp-table-live-sync' ),
			'sorting-ascending'  => __( 'Ascending', 'sheets-to-wp-table-live-sync' ),
			'sorting-descending'  => __( 'Descending', 'sheets-to-wp-table-live-sync' ),
			'sorting-checkbox-content'  => __( 'within the table', 'sheets-to-wp-table-live-sync' ),

			'import-image'  => __( 'Import images from sheet', 'sheets-to-wp-table-live-sync' ),
			'cache-table'  => __( 'Cache table for faster loading time', 'sheets-to-wp-table-live-sync' ),
			'frequent-cache'  => __( 'Prevent frequent cache updates for faster table loading', 'sheets-to-wp-table-live-sync' ),
			'freq-content'  => __( 'New changes from Google Sheets will appear only after the cache expires. Features like links, images, and merged cells may not show until the cache refreshes. Cache expiry time can be adjusted in Settings —> Performance.', 'sheets-to-wp-table-live-sync' ),
			'cell-formatting'  => __( 'Cell formatting style', 'sheets-to-wp-table-live-sync' ),
			'expanded'  => __( 'Expanded', 'sheets-to-wp-table-live-sync' ),
			'wrapped'  => __( 'Wrapped', 'sheets-to-wp-table-live-sync' ),
			'responsive-style'  => __( 'Responsive style', 'sheets-to-wp-table-live-sync' ),
			'default'  => __( 'Default', 'sheets-to-wp-table-live-sync' ),
			'collapsible-style'  => __( 'Collapsible Style', 'sheets-to-wp-table-live-sync' ),
			'scrollable-style'  => __( 'Scrollable Style', 'sheets-to-wp-table-live-sync' ),
			'row-per-page'  => __( 'Rows to show per page', 'sheets-to-wp-table-live-sync' ),
			'All'  => __( 'All', 'sheets-to-wp-table-live-sync' ),
			'100'  => __( '100', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'50'  => __( '50', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'30'  => __( '30', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'15'  => __( '15', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'10'  => __( '10', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'5'  => __( '5', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'1'  => __( '1', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'-1'  => __( '-1', 'sheets-to-wp-table-live-sync' ),//phpcs:ignore
			'limited-to-msg'  => __( 'The table is limited to 100 rows.', 'sheets-to-wp-table-live-sync' ),
			'limited-to-msg-2'  => __( 'to show the full Google Sheet with awesome customizations.', 'sheets-to-wp-table-live-sync' ),

			'upgrade-now'  => __( 'Upgrade Now →', 'sheets-to-wp-table-live-sync' ),
			'table-height'  => __( 'Table height', 'sheets-to-wp-table-live-sync' ),

			'default-height'  => __( 'Default height', 'sheets-to-wp-table-live-sync' ),
			'400px'  => __( '400px', 'sheets-to-wp-table-live-sync' ),
			'500px'  => __( '500px', 'sheets-to-wp-table-live-sync' ),
			'600px'  => __( '600px', 'sheets-to-wp-table-live-sync' ),
			'700px'  => __( '700px', 'sheets-to-wp-table-live-sync' ),
			'800px'  => __( '800px', 'sheets-to-wp-table-live-sync' ),
			'900px'  => __( '900px', 'sheets-to-wp-table-live-sync' ),
			'1000px'  => __( '1000px', 'sheets-to-wp-table-live-sync' ),
			'select-theme'  => __( 'Select theme', 'sheets-to-wp-table-live-sync' ),

			'import-color-from-sheet'  => __( 'Import colors and text styles from sheet', 'sheets-to-wp-table-live-sync' ),
			'unlock'  => __( 'Unlock', 'sheets-to-wp-table-live-sync' ),

			'Default-Style'  => __( 'Default Style', 'sheets-to-wp-table-live-sync' ),
			'Simple'  => __( 'Simple', 'sheets-to-wp-table-live-sync' ),

			'Dark-Table-wiz'  => __( 'Dark Table', 'sheets-to-wp-table-live-sync' ),
			'Dark-Table'  => __( 'Simple on dark', 'sheets-to-wp-table-live-sync' ),

			'Stripped-Table'  => __( 'Stripped Table', 'sheets-to-wp-table-live-sync' ),
			'minimal-Table'  => __( 'Minimal on dark', 'sheets-to-wp-table-live-sync' ),

			'hover-style'  => __( 'Hover Style', 'sheets-to-wp-table-live-sync' ),
			'minimal-elegant-style'  => __( 'Minimal elegant', 'sheets-to-wp-table-live-sync' ),

			'Taliwind-Style'  => __( 'Taliwind Style', 'sheets-to-wp-table-live-sync' ),
			'Uppercase-heading'  => __( 'Uppercase heading', 'sheets-to-wp-table-live-sync' ),
			'create-success'  => __( 'Table creation successfull', 'sheets-to-wp-table-live-sync' ),

			'colored-column'  => __( 'Colored Column', 'sheets-to-wp-table-live-sync' ),
			'vertical-style'  => __( 'Vertical style', 'sheets-to-wp-table-live-sync' ),

			 // NEW.
			'minimal-simple-style'  => __( 'Minimal', 'sheets-to-wp-table-live-sync' ),
			'dark-style-theme'  => __( 'Dark knight', 'sheets-to-wp-table-live-sync' ),
			'uppercase-elegant-theme'  => __( 'Uppercase elegant', 'sheets-to-wp-table-live-sync' ),

			'merge-cells'  => __( 'Merge cells', 'sheets-to-wp-table-live-sync' ),
			'beta'  => __( 'Beta', 'sheets-to-wp-table-live-sync' ),
			'merge-cells-notice'  => __( "Sorting feature is disabled. Your sheet contains vertically merged cells, so you can't use the sorting feature and merge cell feature altogether.", 'sheets-to-wp-table-live-sync' ),

			/**
			 * Modal
			 */
			'are-you-sure-to-disable'  => __( 'Are you sure to disable?', 'sheets-to-wp-table-live-sync' ),
			'imported-style-desc'  => __( 'Colors and text styles from your Google Sheet won’t be imported anymore. A default theme will be selected for you if you haven’t selected one already', 'sheets-to-wp-table-live-sync' ),
			'yes-disable'  => __( 'Yes, Disable', 'sheets-to-wp-table-live-sync' ),

			'yes-enable'  => __( 'Enable for Faster Loading', 'sheets-to-wp-table-live-sync' ),
			'are-you-sure-to-enable-frequent-mode'  => __( 'Prevent Live Sync?', 'sheets-to-wp-table-live-sync' ),
			'frequent-cache-note'  => __( 'Table data will only refresh when the cache expires. This improves performance but may delay content updates. You can adjust the cache expiry time in Settings → Performance.', 'sheets-to-wp-table-live-sync' ),
			'frequent-mode-desc'  => __( "Enabling this feature will skip live sync until your cache expires. Make sure your Google Sheet up to date and you've enabled all necessary features (images, links, merged cells, etc.) from the settings first.", 'sheets-to-wp-table-live-sync' ),

			/**
			 * Admin menus
			 */
			'Dashboard'  => __( 'All Tables', 'sheets-to-wp-table-live-sync' ),
			'Dashboard-title'  => __( 'Manage, create and track all your tables tables in one place', 'sheets-to-wp-table-live-sync' ),
			'manage-tab-submenu'  => __( 'Tab Groups', 'sheets-to-wp-table-live-sync' ),
			'global-settings'  => __( 'Global Settings', 'sheets-to-wp-table-live-sync' ),
			'global-settings-content'  => __( 'Configure default settings for all your tables', 'sheets-to-wp-table-live-sync' ),
			'get-started'  => __( 'Get Started', 'sheets-to-wp-table-live-sync' ),
			'Skip'  => __( 'Skip', 'sheets-to-wp-table-live-sync' ),
			'add-sheets'  => __( 'Add Google Sheet URL', 'sheets-to-wp-table-live-sync' ),
			'recommended-plugins'  => __( 'Recommended Plugins', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Data Table
			 */
			// 'filtering'  => __( 'Show _MENU_ entries', 'sheets-to-wp-table-live-sync' ),
			'filtering_show'  => __( 'Show', 'sheets-to-wp-table-live-sync' ),
			'filtering_entries'  => __( 'entries', 'sheets-to-wp-table-live-sync' ),
			'search'  => __( 'Search:', 'sheets-to-wp-table-live-sync' ),
			// 'dataTables_info'  => __( 'Showing _START_ to _END_ of _TOTAL_ entries', 'sheets-to-wp-table-live-sync' ),
			'dataTables_info_showing'  => __( 'Showing', 'sheets-to-wp-table-live-sync' ),
			'dataTables_info_to'  => __( 'to', 'sheets-to-wp-table-live-sync' ),
			'dataTables_info_of'  => __( 'of', 'sheets-to-wp-table-live-sync' ),
			'first'  => __( 'First', 'sheets-to-wp-table-live-sync' ),
			'previous'  => __( 'Previous', 'sheets-to-wp-table-live-sync' ),
			'next'  => __( 'Next', 'sheets-to-wp-table-live-sync' ),
			'previous2'  => __( 'PREV', 'sheets-to-wp-table-live-sync' ),
			'next2'  => __( 'NEXT', 'sheets-to-wp-table-live-sync' ),
			'last'  => __( 'last', 'sheets-to-wp-table-live-sync' ),
			'data-empty-notice'  => __( 'No matching records found', 'sheets-to-wp-table-live-sync' ),

			/**
			 * TableItem
			 */
			'copy-shortcode'  => __( 'Copy Shortcode', 'sheets-to-wp-table-live-sync' ),
			'copy-shortcode-to-use-in-page'  => __( 'Copy the shortcode to use in in any page or post. Gutenberg and Elementor blocks are also supported', 'sheets-to-wp-table-live-sync' ),
			'are-you-sure-to-delete'  => __( 'Are you sure to delete the table? ', 'sheets-to-wp-table-live-sync' ),
			'confirmation-about-to-delete'  => __( 'You are about to delete the table. This will permanently delete the table(s)', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Merge
			 */
			'merge-alert'  => __( 'Vertical merge found!', 'sheets-to-wp-table-live-sync' ),
			'merge-info'  => __( "Please make sure to keep the sorting feature disabled. Google sheet doesn't filter over a range containing vertical merges.", 'sheets-to-wp-table-live-sync' ),
			'merge-confirm'  => __( 'OK', 'sheets-to-wp-table-live-sync' ),
			'active-merge-condition-alert'  => __( 'Your sheet contains vertically merged cells, so you can not use the sorting feature. Sorting may break the table design and format. Please ensure that you have enabled either the vertical merge cell feature or the sorting feature, or confirm that your sheet has no vertical merges. If your table design still breaks even with sorting disabled, consider reloading the sheet or clicking save again to reflect the necessary fixes. To get the sorting feature visit Display settings > Disable sorting', 'sheets-to-wp-table-live-sync' ),

			/**
			 * TabSettings
			 */
			'After-the-table'  => __( 'After the table', 'sheets-to-wp-table-live-sync' ),
			'Before-the-table'  => __( 'Before the table', 'sheets-to-wp-table-live-sync' ),
			'Tab-position'  => __( 'Tab position in embedded view', 'sheets-to-wp-table-live-sync' ),
			'hide-grp-title'  => __( 'Hide tab group title', 'sheets-to-wp-table-live-sync' ),

			/**
			 * TabsList
			 */
			'do-not-have-table'  => __( 'Manage tab is not available because you don’t have any tables yet. Please create tables first', 'sheets-to-wp-table-live-sync' ),
			'create-table-to-manage'  => __( 'Create tables first to manage tabs', 'sheets-to-wp-table-live-sync' ),
			'no-tab-grp-created'  => __( "👋 Let's create your first tab groups", 'sheets-to-wp-table-live-sync' ),
			'tab-groups-will-appear-here'  => __( 'Click the button below to create tab groups', 'sheets-to-wp-table-live-sync' ),
			'tab-grp-title'  => __( 'Show tab group name in embedded view', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Theme Customization and builder
			 */

			'header-color-title'  => __( 'HEADER COLORS', 'sheets-to-wp-table-live-sync' ),
			'text-color-title'  => __( 'TEXT COLORS', 'sheets-to-wp-table-live-sync' ),
			'body-title'  => __( 'BODY COLORS', 'sheets-to-wp-table-live-sync' ),
			'table-text-title'  => __( 'TABLE TEXTS', 'sheets-to-wp-table-live-sync' ),
			'table-hover-title'  => __( 'TABLE HOVER', 'sheets-to-wp-table-live-sync' ),
			'row-title'  => __( 'ROW COLORS', 'sheets-to-wp-table-live-sync' ),
			'column-title'  => __( 'COLUMN COLORS', 'sheets-to-wp-table-live-sync' ),
			'border-title'  => __( 'BORDER COLORS', 'sheets-to-wp-table-live-sync' ),
			'customize-theme-options-title'  => __( 'Customize Theme Options', 'sheets-to-wp-table-live-sync' ),
			'border-style-title'  => __( 'Border Style', 'sheets-to-wp-table-live-sync' ),
			'theme-reset'  => __( 'Reset', 'sheets-to-wp-table-live-sync' ),

			'bg-color'  => __( 'Background color', 'sheets-to-wp-table-live-sync' ),
			'txt-color'  => __( 'Text color', 'sheets-to-wp-table-live-sync' ),

			'first-cl-txt-color'  => __( 'First column text color', 'sheets-to-wp-table-live-sync' ),
			'rest-txt-color'  => __( 'Rest body text color', 'sheets-to-wp-table-live-sync' ),
			'remaning-txt-color'  => __( 'Remaining column text color', 'sheets-to-wp-table-live-sync' ),

			'hover-color'  => __( 'Hover background color', 'sheets-to-wp-table-live-sync' ),
			'hover-text-color'  => __( 'Hover text color', 'sheets-to-wp-table-live-sync' ),
			'table-bg-color'  => __( 'Table background color', 'sheets-to-wp-table-live-sync' ),
			'table-hover-color'  => __( 'Table hover color', 'sheets-to-wp-table-live-sync' ),
			'table-border-color'  => __( 'Table border color', 'sheets-to-wp-table-live-sync' ),
			'table-text-color'  => __( 'Table text color', 'sheets-to-wp-table-live-sync' ),

			'border-color'  => __( 'Border Color', 'sheets-to-wp-table-live-sync' ),
			'out-border-color'  => __( 'Outside body border', 'sheets-to-wp-table-live-sync' ),
			'inside-border-color'  => __( 'Inside border', 'sheets-to-wp-table-live-sync' ),

			'even-row-color'  => __( 'Even row color', 'sheets-to-wp-table-live-sync' ),
			'odd-row-color'  => __( 'Odd row color', 'sheets-to-wp-table-live-sync' ),

			'even-column-color'  => __( 'Even column color', 'sheets-to-wp-table-live-sync' ),
			'odd-column-color'  => __( 'Odd column color', 'sheets-to-wp-table-live-sync' ),
			'outside-border-type'  => __( 'Outside border type', 'sheets-to-wp-table-live-sync' ),
			'outside-border'  => __( 'Outside border', 'sheets-to-wp-table-live-sync' ),
			'solid-border'  => __( 'Solid border', 'sheets-to-wp-table-live-sync' ),
			'rounded-border'  => __( 'Rounded border', 'sheets-to-wp-table-live-sync' ),
			'border-radius'  => __( 'Border radius', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Theme Builder
			 */
			'update-changes'  => __( 'Update Theme', 'sheets-to-wp-table-live-sync' ),
			'theme-name'  => __( 'Theme name', 'sheets-to-wp-table-live-sync' ),
			'theme-colors'  => __( 'Theme colors', 'sheets-to-wp-table-live-sync' ),
			'active-column-colors'  => __( 'Column color', 'sheets-to-wp-table-live-sync' ),
			'active-row-colors'  => __( 'Row color', 'sheets-to-wp-table-live-sync' ),
			'edit-theme'  => __( 'Edit', 'sheets-to-wp-table-live-sync' ),
			'yes-delete'  => __( 'Yes, Delete', 'sheets-to-wp-table-live-sync' ),
			'yes-reset'  => __( 'Yes, Reset', 'sheets-to-wp-table-live-sync' ),
			'add-theme'  => __( 'Create Theme', 'sheets-to-wp-table-live-sync' ),
			'theme-alert-delete'  => __( 'Can’t delete active theme!', 'sheets-to-wp-table-live-sync' ),
			'theme-delete-notice'  => __( 'The theme is active and currently in use. Please select another theme for your table before deleting this one', 'sheets-to-wp-table-live-sync' ),
			'confirmation-theme-delete'  => __( 'Are you sure to delete theme?', 'sheets-to-wp-table-live-sync' ),
			'confirmation-theme-delete-notice'  => __( 'This theme wil be deleted and it can not be recovered. Are you sure to delete it?', 'sheets-to-wp-table-live-sync' ),

			'confirmation-theme-reset'  => __( 'Are you sure to reset?', 'sheets-to-wp-table-live-sync' ),
			'confirmation-theme-reset-notice'  => __( 'All of your changes & customization will be lost', 'sheets-to-wp-table-live-sync' ),

			'enable-row-column-ordering'  => __( 'Enable row and column coloring', 'sheets-to-wp-table-live-sync' ),
			'none'  => __( 'None', 'sheets-to-wp-table-live-sync' ),
			'row-wise'  => __( 'Row wise', 'sheets-to-wp-table-live-sync' ),
			'col-wise'  => __( 'Column wise', 'sheets-to-wp-table-live-sync' ),
			'select-coloring'  => __( 'Select coloring', 'sheets-to-wp-table-live-sync' ),
			'hover-mode'  => __( 'Hover mode', 'sheets-to-wp-table-live-sync' ),
			'+new-theme'  => __( '+ New Theme', 'sheets-to-wp-table-live-sync' ),

			'apply-theme-globally'  => __( 'Apply this custom theme to all tables', 'sheets-to-wp-table-live-sync' ),
			'style-theme-globally'  => __( 'Apply this same style for the other table', 'sheets-to-wp-table-live-sync' ),

			/**
			 * Pagination.tsx
			 */

			 'df-pagination'  => __( 'Default pagination', 'sheets-to-wp-table-live-sync' ),
			 'md-pagination'  => __( 'Modern pagination', 'sheets-to-wp-table-live-sync' ),
			 'minimal-pagination'  => __( 'Minimal pagination', 'sheets-to-wp-table-live-sync' ),
			 'tailwind-pagination'  => __( 'Tailwind pagination', 'sheets-to-wp-table-live-sync' ),
			 'outline-pagination'  => __( 'Outlined pagination', 'sheets-to-wp-table-live-sync' ),
			 'color-picker'  => __( 'Color Picker', 'sheets-to-wp-table-live-sync' ),
			 'pagination-color-will'  => __( 'Pagination color will change based on your selected color', 'sheets-to-wp-table-live-sync' ),

			 'pg-style'  => __( 'Pagination Style', 'sheets-to-wp-table-live-sync' ),
			 'pagination'  => __( 'Pagination', 'sheets-to-wp-table-live-sync' ),
			 'active-pagination-color'  => __( 'Active pagination color', 'sheets-to-wp-table-live-sync' ),
			 'keep-pagination-in-middle'  => __( 'Keep pagination in middle', 'sheets-to-wp-table-live-sync' ),
			 'confirm'  => __( 'Confirm', 'sheets-to-wp-table-live-sync' ),

			 /**
			  * Conditional view
			  */

			  'basic-display' => __('Basic Display (default)','sheets-to-wp-table-live-sync'),
			  'column-specific' => __('Enable Column-Specific Search','sheets-to-wp-table-live-sync'),
			// 'choose-how-you-want' => __('Choose how you want to Display the table','sheets-to-wp-table-live-sync'),
			  'table-will-show-by-default' => __('Table will show by default and work accordingly. Nothing special here','sheets-to-wp-table-live-sync'),
			  'a-search-field' => __('Turn your table into a powerful search-engine! Visitors will initially see a search box instead of the table. Based on their input, they will receive filtered data in a streamlined table view. Ideal for searching both broad and specific ranges of information from your Google Sheets (e.g., student records, employee info, etc.).','sheets-to-wp-table-live-sync'),

			  'search-only-display' => __('Search-Only Display','sheets-to-wp-table-live-sync'),
			  'user-specific-display' => __('User-Specific Display','sheets-to-wp-table-live-sync'),
			  'Upcoming' => __('Upcoming','sheets-to-wp-table-live-sync'),
			  'displayed-only-to-logged-in-users' => __("Enhance personalization with this mode. It allows the table to be displayed only to the logged-in users based on their credentials or unique data (e.g., username or email) stored in the Google Sheets. There will be no search box, preventing anyone from searching other users' data.",'sheets-to-wp-table-live-sync'),

			  'password-pin-protected' => __('This mode adds an extra layer of security to your data. The table is protected by a password or PIN, ensuring that only authorized users can unlock and see the table information.','sheets-to-wp-table-live-sync'),

			  'protected-view' => __('Protected View','sheets-to-wp-table-live-sync'),
			  'loading-header' => __('Loading headers...','sheets-to-wp-table-live-sync'),
			  'want-to-display-your-search' => __('Choose Search-Result Trigger Option','sheets-to-wp-table-live-sync'),
			  'show-search-result-once-Typing' => __('Show search result once Typing','sheets-to-wp-table-live-sync'),
			  'show-search-result-after-pressing' => __('Show search result after pressing Search button','sheets-to-wp-table-live-sync'),
			  'column-for-table-search' => __('Select a column to search within its data. Results will only show matches from the selected column. If no column is selected, the search will apply to all data in the Google Sheet.','sheets-to-wp-table-live-sync'),

			  'unable-to-access' => __('Unable to access the Sheet! Please follow the instructions below:','sheets-to-wp-table-live-sync'),
			  'on-your-google' => __('On your Google Sheet, click on the','sheets-to-wp-table-live-sync'),
			  'button-located-at' => __('button located at the top-right corner. Then on the popup, choose the','sheets-to-wp-table-live-sync'),
			  'anyone-with-the-link' => __('“Anyone with the link”','sheets-to-wp-table-live-sync'),
			  'option-under-general' => __('option under General access','sheets-to-wp-table-live-sync'),
			  'click-on-the' => __('Click on the','sheets-to-wp-table-live-sync'),
			  'icon-on-the-popup' => __('icon on the popup and ensure that the option','sheets-to-wp-table-live-sync'),
			  'viewers-and-Commenters' => __('“Viewers and commenters can see the option to download, print, and copy”','sheets-to-wp-table-live-sync'),
			  'is-selected' => __('is selected','sheets-to-wp-table-live-sync'),
			  'share' => __('Share','sheets-to-wp-table-live-sync'),
			  'save-the-changes' => __('Save the changes by clicking on the','sheets-to-wp-table-live-sync'),
			  'done' => __('Done','sheets-to-wp-table-live-sync'),
			  'button' => __('button','sheets-to-wp-table-live-sync'),
			  'General' => __('General','sheets-to-wp-table-live-sync'),
			  'seconds' => __('seconds','sheets-to-wp-table-live-sync'),
			  'make-your-first-table' => __('Let’s make your first table','sheets-to-wp-table-live-sync'),
			  'help-on-your-first-table' => __('Let us help you with your first table creation. You are just a step away from creating beautiful tables from your Google Sheets','sheets-to-wp-table-live-sync'),

			  'days' => __('Day ','sheets-to-wp-table-live-sync'),
			  'timeout-label' => __('Response Timeout: ','sheets-to-wp-table-live-sync'),
			  'timestamp-label' => __('Timestamp: ','sheets-to-wp-table-live-sync'),
			  'timeout-content' => __('Choose the maximum response timeout the table need to wait','sheets-to-wp-table-live-sync'),
			  'cache-timestamp' => __('Choose the maximum day to store the cache','sheets-to-wp-table-live-sync'),
			  'the-table' => __('the table','sheets-to-wp-table-live-sync'),
			  'copy-shortcode' => __('Copy shortcode','sheets-to-wp-table-live-sync'),
			  'edit-table' => __('Edit table','sheets-to-wp-table-live-sync'),
			  'duplicate-table' => __('Duplicate table','sheets-to-wp-table-live-sync'),
			  'delete-table' => __('Delete table','sheets-to-wp-table-live-sync'),
			  'name-used' => __('Name already used, please use another name for theme','sheets-to-wp-table-live-sync'),
			  'name-need' => __('Name field can not be empty','sheets-to-wp-table-live-sync'),

			/**
			 *  AI Settings page Strings
			 */
			// Main headers and descriptions
			'ai-summary-configuration' => __('AI Table Summary Configuration','sheets-to-wp-table-live-sync'),
			'ai-configuration-desc' => __('Configure OpenAI integration for intelligent table summaries','sheets-to-wp-table-live-sync'),

			// AI Provider Selection and Settings
			'choose-ai-provider' => __('Engine (AI Provider)','sheets-to-wp-table-live-sync'),
			'choose-ai-provider-title' => __('Select the AI engine that will generate summaries and answer user queries.','sheets-to-wp-table-live-sync'),
			'tooltip-ai-provider' => __('Select your preferred AI provider for generating table summaries','sheets-to-wp-table-live-sync'),
			'tooltip-openai' => __('OpenAI GPT models - industry leading AI with excellent performance','sheets-to-wp-table-live-sync'),
			'tooltip-gemini' => __('Google Gemini models - fast and efficient AI by Google','sheets-to-wp-table-live-sync'),
			'checking' => __('Checking...','sheets-to-wp-table-live-sync'),

			// Gemini-specific settings
			'top-p' => __('Top P','sheets-to-wp-table-live-sync'),
			'tooltip-top-p' => __('Controls diversity via nucleus sampling. Lower values make output more focused.','sheets-to-wp-table-live-sync'),
			'top-k' => __('Top K','sheets-to-wp-table-live-sync'),
			'tooltip-top-k' => __('Limits token selection to top K candidates. Lower values are more focused.','sheets-to-wp-table-live-sync'),
			'precise' => __('Precise','sheets-to-wp-table-live-sync'),
			'diverse' => __('Diverse','sheets-to-wp-table-live-sync'),
			'broad' => __('Broad','sheets-to-wp-table-live-sync'),

			// OpenAI API Key
			'openai-api-key' => __('OpenAI API Key','sheets-to-wp-table-live-sync'),
			'tooltip-api-key' => __('Your OpenAI API key. Get one from https://platform.openai.com/api-keys','sheets-to-wp-table-live-sync'),
			'test-api' => __('Test API','sheets-to-wp-table-live-sync'),

			// AI Model Selection
			'ai-model' => __('AI Model','sheets-to-wp-table-live-sync'),
			'tooltip-ai-model' => __('Choose the OpenAI model for generating summaries. gpt-4o-mini is fast and cost-effective, gpt-4 is more accurate.','sheets-to-wp-table-live-sync'),
			'gpt-4o-mini' => __('GPT-4o Mini','sheets-to-wp-table-live-sync'),
			'gpt-3-5-turbo' => __('GPT-3.5 Turbo','sheets-to-wp-table-live-sync'),
			'gpt-4' => __('GPT-4','sheets-to-wp-table-live-sync'),
			'gpt-4-turbo' => __('GPT-4 Turbo','sheets-to-wp-table-live-sync'),
			'recommended' => __('Recommended','sheets-to-wp-table-live-sync'),

			// Max Tokens
			'max-tokens' => __('Max Tokens','sheets-to-wp-table-live-sync'),
			'tooltip-max-tokens' => __('Maximum number of tokens for AI response. Higher values allow longer summaries but cost more.','sheets-to-wp-table-live-sync'),
			'short-summary' => __('100 (Short)','sheets-to-wp-table-live-sync'),
			'long-summary' => __('2000 (Long)','sheets-to-wp-table-live-sync'),

			// Temperature
			'creativity' => __('Creativity','sheets-to-wp-table-live-sync'),
			'tooltip-temperature' => __('Controls randomness in AI responses. Lower values (0.1-0.3) are more focused, higher values (0.7-1.0) are more creative.','sheets-to-wp-table-live-sync'),
			'focused' => __('0 (Focused)','sheets-to-wp-table-live-sync'),
			'creative' => __('1 (Creative)','sheets-to-wp-table-live-sync'),

			// Frequency Penalty
			'frequency-penalty' => __('Frequency Penalty','sheets-to-wp-table-live-sync'),
			'tooltip-frequency-penalty' => __('Reduces repetition in AI responses. Higher values (0.3-1.0) discourage repetitive text.','sheets-to-wp-table-live-sync'),
			'allow-repetition' => __('0 (Allow Repetition)','sheets-to-wp-table-live-sync'),
			'avoid-repetition' => __('1 (Avoid Repetition)','sheets-to-wp-table-live-sync'),

			// Cache Duration
			'cache-duration-title' => __('Cache Duration','sheets-to-wp-table-live-sync'),
			'cache-duration-label' => __('Duration:','sheets-to-wp-table-live-sync'),
			'tooltip-cache-duration' => __('How long to cache AI responses before making new API calls.','sheets-to-wp-table-live-sync'),
			'30-minutes' => __('30 minutes','sheets-to-wp-table-live-sync'),
			'1-hour' => __('1 hour','sheets-to-wp-table-live-sync'),
			'2-hours' => __('2 hours','sheets-to-wp-table-live-sync'),
			'6-hours' => __('6 hours','sheets-to-wp-table-live-sync'),
			'12-hours' => __('12 hours','sheets-to-wp-table-live-sync'),
			'24-hours' => __('24 hours','sheets-to-wp-table-live-sync'),

			// Advanced Settings Toggle
			'advanced-settings' => __('Advanced Settings','sheets-to-wp-table-live-sync'),
			'advanced-settings-desc' => __('Configure advanced AI model parameters for fine-tuned control over response generation.','sheets-to-wp-table-live-sync'),

			// AI Provider Selection and Settings
			'tooltip-ai-provider' => __('Select your preferred AI provider for generating table summaries','sheets-to-wp-table-live-sync'),
			'tooltip-openai' => __('OpenAI GPT models - industry leading AI with excellent performance','sheets-to-wp-table-live-sync'),
			'tooltip-gemini' => __('Google Gemini models - fast and efficient AI by Google','sheets-to-wp-table-live-sync'),
			'checking' => __('Checking...','sheets-to-wp-table-live-sync'),

			// Gemini-specific settings
			'top-p' => __('Top P','sheets-to-wp-table-live-sync'),
			'tooltip-top-p' => __('Controls diversity via nucleus sampling. Lower values make output more focused.','sheets-to-wp-table-live-sync'),
			'top-k' => __('Top K','sheets-to-wp-table-live-sync'),
			'tooltip-top-k' => __('Limits token selection to top K candidates. Lower values are more focused.','sheets-to-wp-table-live-sync'),
			'precise' => __('Precise','sheets-to-wp-table-live-sync'),
			'diverse' => __('Diverse','sheets-to-wp-table-live-sync'),
			'broad' => __('Broad','sheets-to-wp-table-live-sync'),

			// AI Model description
			'ai-model-desc' => __('Choose the AI model that best fits your needs. Different models have varying capabilities and costs.','sheets-to-wp-table-live-sync'),

			// Editor page
			'enable-summary' => __('Enable AI Table Summary','sheets-to-wp-table-live-sync'),

			// Backend AI Table Summary Settings
			'preview' => __('Preview','sheets-to-wp-table-live-sync'),

			'summary-position' => __('Summary Position','sheets-to-wp-table-live-sync'),
			'summary-position-above' => __('Above Table','sheets-to-wp-table-live-sync'),
			'summary-position-below' => __('Below Table','sheets-to-wp-table-live-sync'),
			'tooltip-summary-position' => __('Choose whether to display the summary above or below the table','sheets-to-wp-table-live-sync'),
			'summary-position-desc' => __('Select the position where the AI Table Summary should be displayed relative to the table.','sheets-to-wp-table-live-sync'),

			'text-min' => __('min','sheets-to-wp-table-live-sync'),
			'cachetime' => __('Cache time:','sheets-to-wp-table-live-sync'),
			'cache-to-load-faster' => __('Cache summary for faster loading','sheets-to-wp-table-live-sync'),
			'decide-where-the' => __('Decide where the AI Table Summary will be displayed in relation to your table.','sheets-to-wp-table-live-sync'),

			'instant-summary' => __('Instant Summary','sheets-to-wp-table-live-sync'),

			'prompt-for-summary' => __('Prompt for Summary','sheets-to-wp-table-live-sync'),
			'you-will-generate-and' => __('You will generate and save the summary in advance. Visitors will see it instantly with no delay.','sheets-to-wp-table-live-sync'),
			'enable-to-reuse-the-same-summary' => __('Enable to reuse the same summary to reduce load time. Turn off to generate a fresh summary each time.','sheets-to-wp-table-live-sync'),
			'write-the-prompt' => __('Write the prompt that AI will follow to generate the summary. Visitors trigger this when they click the summary button.','sheets-to-wp-table-live-sync'),

			// Show Regenerate Button Feature
			'show-regenerate-button' => __('Show regenerate button in summary modal','sheets-to-wp-table-live-sync'),
			'allow-visitors-to-regenerate-summary' => __('Allow visitors to regenerate the AI Table Summary with fresh data by clicking the regenerate button.','sheets-to-wp-table-live-sync'),

			// Summary Display Options
			'summary-display-always-show' => __('Always Show','sheets-to-wp-table-live-sync'),
			'summary-display-collapsed' => __('Collapsed (click to expand)','sheets-to-wp-table-live-sync'),
			'tooltip-summary-display' => __('Choose how the summary appears to visitors - always visible or collapsed with click to expand','sheets-to-wp-table-live-sync'),
			'summary-display-desc' => __('Select how the AI Table Summary should be displayed to your visitors on the frontend.','sheets-to-wp-table-live-sync'),

			// Table Prompt Customization
			'ask-ai-placeholder' => __('Ask AI Placeholder Text','sheets-to-wp-table-live-sync'),
			'ask-ai-button-label' => __('Ask AI Button Label','sheets-to-wp-table-live-sync'),
			'tooltip-ask-ai-placeholder' => __('Customize the placeholder text shown in the AI prompt input field','sheets-to-wp-table-live-sync'),
			'tooltip-ask-ai-button-label' => __('Customize the text displayed on the AI prompt submit button','sheets-to-wp-table-live-sync'),

			// AIView Component Strings new
			'summary-display-title' => __('Summary Display','sheets-to-wp-table-live-sync'),
			'summary-display-description' => __('Decide if visitors see the summary right away or only when they expand it.','sheets-to-wp-table-live-sync'),
			'always-show' => __('Always show','sheets-to-wp-table-live-sync'),
			'collapsed-click-to-expand' => __('Collapsed (click to expand)','sheets-to-wp-table-live-sync'),
			'ai-summary-preview' => __('AI Table Summary Preview','sheets-to-wp-table-live-sync'),
			'ai-summary-preview-description' => __('Review the generated summary. This what your visitors will see. Edit and save to finalize.','sheets-to-wp-table-live-sync'),
			'ready-to-create-first-summary' => __('Ready to create your first summary?','sheets-to-wp-table-live-sync'),
			'add-prompt-and-generate' => __('Add a prompt and click Generate to create one.','sheets-to-wp-table-live-sync'),
			'placeholder-text-title' => __('Placeholder text','sheets-to-wp-table-live-sync'),
			'placeholder-text-description' => __('What visitors see before typing','sheets-to-wp-table-live-sync'),
			'button-label-title' => __('Button label','sheets-to-wp-table-live-sync'),
			'button-label-description' => __('Text on your Ask AI button','sheets-to-wp-table-live-sync'),
			'preview-title' => __('Preview','sheets-to-wp-table-live-sync'),
			'turn-data-into-smart-summarize' => __('Turn on AI to create summaries of your table data.','sheets-to-wp-table-live-sync'),
			'deceide-where-ai-summary-display' => __('Decide where the AI Table Summary will be displayed in relation to your table.','sheets-to-wp-table-live-sync'),
			'customize-the-text-and-colors' => __('Customize the text and colors of the summary button to match your site style.','sheets-to-wp-table-live-sync'),
			'summary-button' => __('Summary Button','sheets-to-wp-table-live-sync'),
			'reset-prompt' => __('Reset prompt','sheets-to-wp-table-live-sync'),

			'Youtube-title' => __('Tutorial','sheets-to-wp-table-live-sync'),
			'summary-source' => __('Summary Source','sheets-to-wp-table-live-sync'),
			'summary-content' => __('Visitors will see a button to summarize the table. When they click, AI will create the summary live using your prompt.','sheets-to-wp-table-live-sync'),
			'generate-onclick' => __('Generate on Click','sheets-to-wp-table-live-sync'),
			'btntext' => __('Button text','sheets-to-wp-table-live-sync'),
			'Upcomming' => __('Upcomming','sheets-to-wp-table-live-sync'),
			'lets-visitors' => __('Allow visitors to ask their own questions about this table.','sheets-to-wp-table-live-sync'),
			'enable-ask-ai' => __('Enable Ask AI','sheets-to-wp-table-live-sync'),
			'analyzing-table' => __('AI is analyzing your table...','sheets-to-wp-table-live-sync'),

			'save-summary' => __('Save Summary','sheets-to-wp-table-live-sync'),
			'update-summary' => __('Update Summary','sheets-to-wp-table-live-sync'),

			'edit-summary' => __('Edit','sheets-to-wp-table-live-sync'),
			'current-backend-summary' => __('Current Stored Summary','sheets-to-wp-table-live-sync'),
			'summary-preview-note' => __('This is exactly how the summary will appear on your frontend table. Click "Edit Summary" above to modify it.','sheets-to-wp-table-live-sync'),
			'summary-content-label' => __('Summary Content','sheets-to-wp-table-live-sync'),
			'summary-content-placeholder' => __('Generated AI Table Summary will appear here...','sheets-to-wp-table-live-sync'),

			'no-summary-stored' => __('No summary has been generated yet. Click "Generate Summary" to create one.','sheets-to-wp-table-live-sync'),
			'summary-last-updated' => __('Last updated','sheets-to-wp-table-live-sync'),
			'save-backend-summary' => __('Keep it','sheets-to-wp-table-live-sync'),
			'delete-backend-summary' => __('Delete','sheets-to-wp-table-live-sync'),
			'confirm-delete-summary' => __('Are you sure you want to delete this summary?','sheets-to-wp-table-live-sync'),

			'backend-summary-modal-edit-desc' => __('Edit and modify the AI-generated summary content before saving it to the database.','sheets-to-wp-table-live-sync'),
			'backend-summary-content-label' => __('Summary Content','sheets-to-wp-table-live-sync'),
			'backend-summary-placeholder' => __('Enter or edit the summary content here...','sheets-to-wp-table-live-sync'),
			'regenerate-summary' => __('Regenerate Summary','sheets-to-wp-table-live-sync'),
			'regenerating-summary' => __('Regenerating...','sheets-to-wp-table-live-sync'),
			'regenerate-summary-desc' => __('Generate a new AI Table Summary and replace the current content.','sheets-to-wp-table-live-sync'),
			'update-summary' => __('Update Summary','sheets-to-wp-table-live-sync'),

			'ai-config-tab' => __('AI Configuration','sheets-to-wp-table-live-sync'),

			// AI Configuration Warning
			'ai-config-warning' => __('AI provider not configured. Please add your API key in settings.','sheets-to-wp-table-live-sync'),
			'configure-ai-settings' => __('Configure AI Settings','sheets-to-wp-table-live-sync'),

			'are-you-sure-to-delete-summary'  => __( 'Are you sure to delete the summary? ', 'sheets-to-wp-table-live-sync' ),
			'confirmation-about-to-delete-summary'  => __( 'You are about to delete the summary. This action cannot be undone.', 'sheets-to-wp-table-live-sync' ),

			'ai-summary-feature'  => __( 'AI Summary Preview', 'sheets-to-wp-table-live-sync' ),
			'ai-summary-editor'  => __( 'AI Summary Editor', 'sheets-to-wp-table-live-sync' ),
			'list-no-1'  => __( '• List', 'sheets-to-wp-table-live-sync' ),
			'list-no-2'  => __( '1. List', 'sheets-to-wp-table-live-sync' ),
			'sec-head'  => __( 'Section Heading', 'sheets-to-wp-table-live-sync' ),
			'customize-main-head'  => __( 'Customize the main heading text for the Ask AI section', 'sheets-to-wp-table-live-sync' ),
			'ask-ai-interface'  => __( 'Ask AI Interface', 'sheets-to-wp-table-live-sync' ),
			'ask-ai-interface-hint'  => __( 'Enter your question and get AI-powered insights about the table data', 'sheets-to-wp-table-live-sync' ),
			'suma-title'  => __( 'Summary Title', 'sheets-to-wp-table-live-sync' ),
			'quick-video'  => __( 'quick video', 'sheets-to-wp-table-live-sync' ),

			'open-ai-gpt-title'  => __( 'OpenAI (GPT)', 'sheets-to-wp-table-live-sync' ),
			'gemini-ai-title'  => __( 'Google Gemini', 'sheets-to-wp-table-live-sync' ),
			'ai-api-key'  => __( 'API Key', 'sheets-to-wp-table-live-sync' ),
			'get-ai-api-key'  => __( 'Get API Key', 'sheets-to-wp-table-live-sync' ),
			'get-ai-api-key-hint'  => __( 'Get your API key from your provider dashboard', 'sheets-to-wp-table-live-sync' ),
			'get-ai-api-key-hint-2'  => __( 'and paste it here. Your key is stored securely and never shared.', 'sheets-to-wp-table-live-sync' ),
			'chat-gpt'  => __( 'ChatGPT', 'sheets-to-wp-table-live-sync' ),
			'gemini-ai-studio'  => __( 'Google AI Studio', 'sheets-to-wp-table-live-sync' ),
			'model-version'  => __( 'Model Version', 'sheets-to-wp-table-live-sync' ),
		];
	}
}
