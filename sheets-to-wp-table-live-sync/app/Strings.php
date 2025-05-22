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
			'db-title' => __( 'Create beautiful tables from Google Sheets', 'sheetstowptable' ),
			'new-tables'  => __( 'Create new table', 'sheetstowptable' ),
			'tables-created'  => __( 'Tables created', 'sheetstowptable' ),
			'loading'  => __( 'Loading...', 'sheetstowptable' ),

			'no-tables-have-been-created-yet'  => __( 'No tables have been created yet', 'sheetstowptable' ),
			'tables-will-be-appeared-here-once-you-create-them'  => __( 'Tables will be appeared here once you create them', 'sheetstowptable' ),

			'create-new-table'  => __( 'Create new table', 'sheetstowptable' ),
			'need-help'  => __( 'Need help?', 'sheetstowptable' ),
			'watch-now'  => __( 'Watch Now', 'sheetstowptable' ),
			'search-tb'  => __( 'Search tables', 'sheetstowptable' ),
			'search-items'  => __( 'Search items', 'sheetstowptable' ),

			'search-btn'  => __( 'Search', 'sheetstowptable' ),
			'clear-btn'  => __( 'Clear', 'sheetstowptable' ),

			/**
			 * Tooltip
			 */

			'tooltip-0'  => __( 'This title will be shown on the top of your table', 'sheetstowptable' ),
			'tooltip-1'  => __( 'Copy the URL of your Google Sheet from your browser and paste it in the box below. Make sure your sheet is public.', 'sheetstowptable' ),
			'tooltip-2'  => __( 'Copy the Google Sheet URL from your browser and paste it here to create table. Changing this URL will change your table.', 'sheetstowptable' ),
			'tooltip-3'  => __( 'If this is enabled, the box showing number of entries will be hidden for the viewers', 'sheetstowptable' ),
			'tooltip-4'  => __( 'If enabled, the search box will be hidden for viewers', 'sheetstowptable' ),
			'tooltip-5'  => __( 'Enable this option to hide the table title for the viewers', 'sheetstowptable' ),
			'tooltip-6'  => __( 'If checked, the sorting option will be enabled for viewers when they view the table', 'sheetstowptable' ),
			'tooltip-7'  => __( 'If enabled the entry info showing number of current entries out of all the entries will be hidden', 'sheetstowptable' ),
			'tooltip-8'  => __( 'Enable this to hide the pagination for viewers', 'sheetstowptable' ),
			'tooltip-9'  => __( 'Display multiple tables using tabs. Just like your google sheets', 'sheetstowptable' ),
			'tooltip-10'  => __( 'Title of the tab group', 'sheetstowptable' ),
			'tooltip-11'  => __( 'Enter the title for this tab', 'sheetstowptable' ),
			'tooltip-12'  => __( 'Select the table which will be shown in this tab from the dropdown below', 'sheetstowptable' ),
			'tooltip-13'  => __( 'Enable this to hide the selected columns on mobile', 'sheetstowptable' ),
			'tooltip-14'  => __( 'Enable this to hide the selected column on desktop', 'sheetstowptable' ),
			'tooltip-15'  => __( 'This is the list of the hidden columns. Removing a column from this list will make them visible again', 'sheetstowptable' ),
			'tooltip-16'  => __( 'This is the list of the hidden rows. Removing a row from this list will make them visible again', 'sheetstowptable' ),
			'tooltip-17'  => __( 'This is the list of the hidden cells. Removing a cell from this list will make them visible again', 'sheetstowptable' ),
			'tooltip-18'  => __( 'Use direct google sheet embed link with text content, More flexiable and easy to use', 'sheetstowptable' ),
			'tooltip-19'  => __( 'Use old way [  ] pair to generate link', 'sheetstowptable' ),
			'tooltip-20'  => __( 'Copy the URL of your Google Sheet from your browser and paste it in the box below. Make sure your sheet is public..', 'sheetstowptable' ),
			'tooltip-21'  => __( 'Copy the URL of your Google Sheet and paste it here.', 'sheetstowptable' ),
			'tooltip-22'  => __( 'Allows the users to download the table in the format that you select below', 'sheetstowptable' ),
			'tooltip-23'  => __( 'For the links on the table you can decide what will happen when a link is clicked', 'sheetstowptable' ),
			'tooltip-24'  => __( 'The link opens in the same tab where the table is', 'sheetstowptable' ),
			'tooltip-25'  => __( 'The link will be opened on a new tab', 'sheetstowptable' ),
			'tooltip-26'  => __( "Allow 'Smart links' to load multiple embeed links with text from Google Sheet. To use this makesure 'Smart link' support selected from 'link support mechanism' in 'Settings' menu. However, if there is no embeed links in the Sheet or your'e using pretty link format, then there is no need to use it, which will reduces loading time and makes the table load faster.", 'sheetstowptable' ),
			'tooltip-27'  => __( 'Allow images to be loaded from sheets. You can use it to import images if you have them in Google Sheets. However, if there is no image in the Sheet, there is no need to use it, which will reduces loading time and makes the table load faster.', 'sheetstowptable' ),
			'tooltip-28'  => __( 'If enabled the table will load faster for the viewers', 'sheetstowptable' ),
			'tooltip-29'  => __( 'Choose how the table cell will look', 'sheetstowptable' ),
			'tooltip-30'  => __( 'Cell will expand according to the content', 'sheetstowptable' ),
			'tooltip-31'  => __( 'Cell will be wrapped according to the content', 'sheetstowptable' ),
			'tooltip-32'  => __( 'Choose how the table will look on devices with small screens', 'sheetstowptable' ),
			'tooltip-33'  => __( 'Let the browser decide the behavior of the responsiveness', 'sheetstowptable' ),
			'tooltip-34'  => __( 'The table rows will be collapse on  each other in one column', 'sheetstowptable' ),
			'tooltip-35'  => __( 'A horizontal scrollbar will appear for the users to scroll the table left and right', 'sheetstowptable' ),
			'tooltip-36'  => __( "Enable this feature to showcase your Sheet's merged cells seamlessly on the WordPress frontend table.", 'sheetstowptable' ),
			'tooltip-37'  => __( 'Select the number of rows to show per page', 'sheetstowptable' ),
			'tooltip-38'  => __( 'Select the table height. If the table height is lower there will be a vertical scrollbar to scroll through the rows', 'sheetstowptable' ),
			'tooltip-39'  => __( "Quickly change your table's look and feel using themes", 'sheetstowptable' ),
			'tooltip-40'  => __( 'Enable this feature to import colors and text styles directly from a Google Sheet, instead of using the predefined theme above', 'sheetstowptable' ),
			'tooltip-41'  => __( 'If this is checked, the tab group title will not be visible in the front end', 'sheetstowptable' ),
			'tooltip-42'  => __( 'Choose where you want to show the tab', 'sheetstowptable' ),
			'tooltip-43'  => __( 'The tabs will be shown first and the table will be shown after it', 'sheetstowptable' ),
			'tooltip-44'  => __( 'The table will be shown first and the tab will be shown after it', 'sheetstowptable' ),

			'tooltip-45'  => __( 'Set the cursor behavior on your table', 'sheetstowptable' ),
			'tooltip-46'  => __( 'You can easily highlight text for copy-paste', 'sheetstowptable' ),
			'tooltip-47'  => __( 'You can effortlessly move the table horizontally (left-right).', 'sheetstowptable' ),

			'tooltip-48'  => __( 'Allow checkbox to be loaded from sheets. You can use it to import checkox if you have them in Google Sheets.', 'sheetstowptable' ),

			'tooltip-50' => __( 'Enable row and column coloring', 'sheetstowptable' ),
			'tooltip-51' => __( 'Choose the column or row to add colors', 'sheetstowptable' ),
			'tooltip-52' => __( 'Add color on column', 'sheetstowptable' ),
			'tooltip-53' => __( 'Add color on row', 'sheetstowptable' ),

			'tooltip-54'  => __( 'Select which column to sort on load, or keep the format from Google Sheets.', 'sheetstowptable' ),
			'tooltip-55'  => __( 'Choose the order of sorting for the selected column.', 'sheetstowptable' ),

			'tooltip-56' => __('Specify the maximum time (in seconds) the plugin will wait for a response from the Google server. A higher timeout allows more time to receive a complete response, but may delay table loading; a lower timeout can speed up loading but may result in missing data if the response isn’t fully received. A setting between 10 and 15 seconds is generally recommended for balanced performance.','sheetstowptable'),

			'tooltip-57'  => __( 'Choose how you want to sort your table on load. Select a specific column to sort by (either ascending or descending), or keep the same format as in Google Sheets.', 'sheetstowptable' ),

			'tooltip-58' => __( 'Select this to make the custom theme available for all tables. If unchecked, the theme will only be used for this table.', 'sheetstowptable' ),
			'tooltip-59' => __( 'If selected, any changes made to your theme will be automatically applied to all other tables with the same theme, ensuring consistency across them. If the theme does not exist in other tables, it will be cloned with update style.', 'sheetstowptable' ),

			'tooltip-60' => __( 'Adjust the header’s offset to prevent overlap with sticky menus or other elements at the top of the page.', 'sheetstowptable' ),
			'tooltip-61' => __( 'Set how many columns from the left side of the table should remain fixed while scrolling.', 'sheetstowptable' ),
			'tooltip-62' => __( 'Set how many columns from the right side of the table should remain fixed while scrolling.', 'sheetstowptable' ),
			'tooltip-63' => __( "When this option is enabled, the cache won't trigger any API request to update data from sheets. This helps improve performance and reduce server load. Important: If this is enabled before turning on features like merged cells, links, images, or importing table styles from Google Sheets, those features might not appear until the cache expires. To avoid this, enable all necessary features first, then active the cache feaure and then turn on this option. You can also change the cache expiry time in Settings.", 'sheetstowptable' ),
			'tooltip-64' => __( 'Set how many days the cache should be stored in transients. Once the transient expires, the data will automatically refresh from the connected Google Sheets with updated data.', 'sheetstowptable' ),

			/**
			 * AddNewTable.
			 */
			'add-new-table'  => __( 'Add new table', 'sheetstowptable' ),

			/**
			 * App.
			 */
			'please-activate-your-license'  => __( 'Please activate your license', 'sheetstowptable' ),
			'activate'  => __( 'Activate', 'sheetstowptable' ),

			/**
			 * ChangesLog.
			 */
			'db-headway'  => __( 'What’s new?', 'sheetstowptable' ),

			/**
			 * CreateTab.
			 */
			'save-changes'  => __( 'Save changes', 'sheetstowptable' ),
			'managing-tabs'  => __( '1. Managing tabs', 'sheetstowptable' ),
			'tab-settings'  => __( '2. Tab settings', 'sheetstowptable' ),
			'table-settings'  => __( 'Table Settings', 'sheetstowptable' ),

			'managing-tabs-title'  => __( 'Managing tabs', 'sheetstowptable' ),
			'tab-settings-title'  => __( 'Tab settings', 'sheetstowptable' ),
			'save-and-move'  => __( 'Save & go to Manage Tab', 'sheetstowptable' ),
			'save-and-move-dashboard'  => __( 'Save & go to dashboard', 'sheetstowptable' ),
			'save-and-move-dashboard'  => __( 'Go to Dashboard', 'sheetstowptable' ),
			'go-to-dashboard'  => __( 'Save changes', 'sheetstowptable' ),
			'copy-mail'  => __( 'COPY EMAL', 'sheetstowptable' ),
			'id-table'  => __( 'ID: TB_', 'sheetstowptable' ),
			'tab-short-copy'  => __( 'Copied!', 'sheetstowptable' ),
			'wiz-back'  => __( 'Back', 'sheetstowptable' ),
			'wiz-next'  => __( 'Next', 'sheetstowptable' ),
			'tab-1'  => __( 'Tab 1 title', 'sheetstowptable' ),
			'mng-tab'  => __( 'Manage Tab', 'sheetstowptable' ),
			'no-tab'  => __( 'No tab group found!', 'sheetstowptable' ),
			'no-tab-match'  => __( 'No tab group matches to your search term', 'sheetstowptable' ),
			'select-table-for-tab'  => __( 'Select table for Tab 1', 'sheetstowptable' ),

			/**
			 * Pagination
			 */

			'sel-pagination'  => __( 'Select Pagination', 'sheetstowptable' ),

			/**
			 * Sorting
			 */
			'sort-by-name'  => __( 'Name', 'sheetstowptable' ),
			'sort-by-id'  => __( 'ID', 'sheetstowptable' ),
			'sort-by-date'  => __( 'Date', 'sheetstowptable' ),
			'ascending'  => __( 'Ascending', 'sheetstowptable' ),
			'descending'  => __( 'Descending', 'sheetstowptable' ),
			'above'  => __( 'above', 'sheetstowptable' ),
			'below'  => __( 'below', 'sheetstowptable' ),
			'no-table-found'  => __( 'No tables found!', 'sheetstowptable' ),
			'no-table-match'  => __( 'No tables matches to your search term', 'sheetstowptable' ),

			/**
			 * EditTab.
			 */
			'shortcode'  => __( 'Shortcode', 'sheetstowptable' ),
			'manage-tab'  => __( '1. Managing tabs', 'sheetstowptable' ),

			/**
			 * CreateTable.
			 */
			'create-table'  => __( 'Create table', 'sheetstowptable' ),
			'change-theme-table-style'  => __( 'Change theme and table style', 'sheetstowptable' ),
			'change-table-theme'  => __( 'You can change table theme below. You will find more customization in the dashboard. ', 'sheetstowptable' ),
			'get-pro'  => __( 'Get Pro ', 'sheetstowptable' ),
			'pro'  => __( 'PRO', 'sheetstowptable' ),
			// 'pro-lock'  => __( 'PRO', 'sheetstowptable' ),
			'to-create-table-from-any-tab'  => __( 'to create table from any tab of your Google SpreadSheet.', 'sheetstowptable' ),
			'copy-the-url'  => __( 'Copy the URL of your Google Sheet and paste it here.', 'sheetstowptable' ),
			'google-sheet-url'  => __( 'Add Google Sheet URL', 'sheetstowptable' ),
			'creating-new-table'  => __( 'Creating new table', 'sheetstowptable' ),

			/**
			 * CtaAdd.
			 */
			'create-wooCommerce-product'  => __( 'Create WooCommerce product table easily!', 'sheetstowptable' ),

			'install-stock-sync-for-wooCommerce'  => __( 'Install Stock Sync for WooCommerce', 'sheetstowptable' ),

			'and sync your store products'  => __( 'and sync your store products to Google Sheets. Use the synced Google Sheet to create table. It’s easy!', 'sheetstowptable' ),

			'install-now'  => __( 'Install now', 'sheetstowptable' ),

			/**
			 * DataSource.
			 */
			'table-title'  => __( 'Table title', 'sheetstowptable' ),
			'please-reduce-title-to-save'  => __( 'Please reduce title to save.', 'sheetstowptable' ),
			'gsu'  => __( 'Google Sheet URL', 'sheetstowptable' ),

			/**
			 * ThemeSettings
			 */
			'show-table-title'  => __( 'Show Table title', 'sheetstowptable' ),
			'table-top-elements'  => __( 'Table top elements', 'sheetstowptable' ),
			'hide-ent'  => __( 'Show entries', 'sheetstowptable' ),
			'hide-search-box'  => __( 'Show search box', 'sheetstowptable' ),
			'swap'  => __( 'Swap', 'sheetstowptable' ),
			'hide-title'  => __( 'Hide title', 'sheetstowptable' ),

			'allow-sorting'  => __( 'Allow Table Sorting', 'sheetstowptable' ),
			'sorting-control'  => __( 'Hide sorting controls from table', 'sheetstowptable' ),
			'auto-sorting'  => __( 'Set Default Table Sorting on Load', 'sheetstowptable' ),
			'col-sorting'  => __( 'Sort By Column', 'sheetstowptable' ),
			'order-sorting'  => __( 'Sort By Order', 'sheetstowptable' ),
			'sort-by'  => __( 'Sort By', 'sheetstowptable' ),

			'enb-fixed-clmn'  => __( 'Freeze Table Columns', 'sheetstowptable' ),
			'left-clmn-header'  => __( 'Left Columns Numbers', 'sheetstowptable' ),
			'right-clmn-header'  => __( 'Right Columns Numbers', 'sheetstowptable' ),
			'fixed-header'  => __( 'Freeze Table Header', 'sheetstowptable' ),
			'header-offset'  => __( 'Header Offset', 'sheetstowptable' ),

			'table-bottom-ele'  => __( 'Table bottom elements', 'sheetstowptable' ),
			'hide-entry-info'  => __( 'Show entry info', 'sheetstowptable' ),
			'hide-pagi'  => __( 'Show pagination', 'sheetstowptable' ),
			'swap-pos'  => __( 'Swap position', 'sheetstowptable' ),
			'swapped-pos'  => __( 'Swapped position', 'sheetstowptable' ),
			'theme-alert'  => __( 'Themes cannot be used when the "Import colors and text styles from sheet" feature is enabled', 'sheetstowptable' ),

			/**
			 * Documentation.
			 */

			'doc-2'  => __('What date format can I use?', 'sheetstowptable'),
			'doc-2-ans'  => __("When working with date formats in your table, you have various options to choose from. Avoid using a <span class='date-format'><code>comma separator</code></span>, but consider formats such as <br> e.g. <span class='date-format'><code>2005-06-07</code> | <code>2005/06/07</code> | <code>2005 06 07</code> | <code>June 7- 2005</code> | <code>June 7 2005</code> | <code>7th June 2005</code></span>",'sheetstowptable'),

			'doc-3'  => __('Which one is better for link support?', 'sheetstowptable'),
			'doc-3-ans'  => __(
				"For enhanced link functionality, it's advisable to utilize <span class='date-format'><code>Smart Link</code></span> over the <span class='date-format'><code>Pretty Link</code></span>. Smart Link is known for its robust and user-friendly features.",'sheetstowptable'),

			'doc-5'  => __('Why my table taking too long to load?', 'sheetstowptable'),
			'doc-5-ans'  => __(
				"If your table is taking too long to load, it may be due to the presence of a substantial amount of data in Google Sheets, along with images and links. If your sheet doesn't contain images or links, consider disabling <span class='date-format'><code>links and Image support</code></span> within the <span class='date-format'><code>Utility</code></span> settings of Table Customization to expedite table loading. Utilizing the cache feature can also improve loading times.",'sheetstowptable'),

			'doc-6'  => __('How long table data can take to update if Cache is activated?', 'sheetstowptable'),
			'doc-6-ans'  => __(
				"When the cache feature is active, updates to your table data are not reliant on your browser's cache. Changes made in your sheet may take approximately 15-40 seconds to reflect. To view the latest updates, simply refresh the page after this timeframe.",'sheetstowptable'),

			'doc-7'  => __('How do I find tutorials about using the plugin?', 'sheetstowptable'),
			'doc-7-ans'  => __(
				"Please visit our <a target='_blank' href='https://www.youtube.com/playlist?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP'>YouTube playlist</a>, where we post tutorials on how you can use different features of the plugin.",'sheetstowptable'),

			'doc-9'  => __( 'How can I create a table from an imported XLSX file in google spreadsheets?', 'sheetstowptable' ),
			'doc-9-ans'  => __(
				"Make sure to import the XLSX file into Google Spreadsheets in the following ways. Create a new blank spreadsheet, then navigate to `<span class='date-format'><code> File > Import > Upload</code></span>` Drag the XLSX files to import. Then share the spreadsheets from 'General Access'. Please visit our <a target='_blank' href='https://www.youtube.com/playlist?list=PLd6WEu38CQSyY-1rzShSfsHn4ZVmiGNLP'>YouTube playlist</a>, where we post tutorials on how you can use XLSX file imported in google spreadsheets.",'sheetstowptable'),

			// Documentation other text.
			'documentation'  => __( 'Documentation', 'sheetstowptable' ),
			'vt'  => __( 'Video Tutorial', 'sheetstowptable' ),
			'prof-need-help'  => __( 'Get professional help via our ticketing system', 'sheetstowptable' ),
			'faq'  => __( 'Frequently Asked Question', 'sheetstowptable' ),
			'get-plugin'  => __( 'Get the most out of the plugin. Go Pro!', 'sheetstowptable' ),
			'unlock-all'  => __( 'Unlock all features', 'sheetstowptable' ),
			'link-supp'  => __( 'Link Support to import links from sheet', 'sheetstowptable' ),
			'pre-built-sheet-style'  => __( 'Pre-built amazing table styles where Each styles is different from one another', 'sheetstowptable' ),
			'hide-row-based-on'  => __( 'Hide your google sheet table rows based on your custom row selection', 'sheetstowptable' ),
			'unlimited-fetch-from-gs'  => __( 'Unlimited Row Sync and fetch unlimited rows from Google spreadsheet', 'sheetstowptable' ),

			/**
			 * EditTable
			 */
			'export-json'  => __( 'Export as JSON', 'sheetstowptable' ),
			'export-csv'  => __( 'Export as CSV', 'sheetstowptable' ),
			'export-pdf'  => __( 'Export as PDF', 'sheetstowptable' ),
			'export-excel'  => __( 'Export as Excel', 'sheetstowptable' ),
			'print'  => __( 'Print Table', 'sheetstowptable' ),
			'copy'  => __( 'Copy to Clipboard', 'sheetstowptable' ),

			'live-sync-is-limited'  => __( 'Live sync is limited to 30 rows.', 'sheetstowptable' ),
			'table-10-limited'  => __( 'In your free plan, you are limited to creating 10 tables. Upgrade to create more.', 'sheetstowptable' ),
			'upgrade-pro'  => __( 'Upgrade to Pro', 'sheetstowptable' ),
			'for-showing-full'  => __( 'for showing full google sheet.', 'sheetstowptable' ),

			'data-source'  => __( '1. Data source', 'sheetstowptable' ),
			'table-theme'  => __( '2. Table theme', 'sheetstowptable' ),
			'tc'  => __( '3. Table customization', 'sheetstowptable' ),
			'hide-row-col'  => __( '4. Hide Rows/Column', 'sheetstowptable' ),
			'conditional-view'  => __( '5. Conditional Table View', 'sheetstowptable' ),
			'table-desc'  => __( 'Table description', 'sheetstowptable' ),
			'show-table-desc'  => __( 'Show Table description', 'sheetstowptable' ),

			'data-source-title'  => __( 'Data source', 'sheetstowptable' ),
			'table-theme-title'  => __( 'Table theme', 'sheetstowptable' ),
			'tc-title'  => __( 'Table customization', 'sheetstowptable' ),
			'hide-row-col-title'  => __( 'Hide Rows/Column', 'sheetstowptable' ),
			'conditional-view-title'  => __( 'Conditional Table View', 'sheetstowptable' ),

			'save'  => __( 'Save', 'sheetstowptable' ),
			'lp'  => __( 'Loading Preview...', 'sheetstowptable' ),

			/**
			 * Header
			 */
			'dashboard'  => __( 'Dashboard', 'sheetstowptable' ),
			'get-unlimited-access'  => __( 'Get unlimited access', 'sheetstowptable' ),

			/**
			 * ManageTabs
			 */

			 'CTF'  => __( 'Create tables first to manage tabs', 'sheetstowptable' ),
			'manage-tab-is-not-available'  => __( 'Manage tab is not available because you don’t have any tables yet. Please create tables first', 'sheetstowptable' ),
			'display-multiple'  => __( 'Display multiple tables using tabs.', 'sheetstowptable' ),
			'manage-new-tabs'  => __( 'Manage new tabs', 'sheetstowptable' ),
			'tabs-created'  => __( 'Tabs created', 'sheetstowptable' ),
			'no-tabs-found'  => __( 'No tabs found with the key', 'sheetstowptable' ),

			/**
			 * ManagingTabs
			 */
			'select-table-for-tab'  => __( 'Select table for this tab.', 'sheetstowptable' ),
			'tab-title'  => __( 'Tab Title', 'sheetstowptable' ),
			'add-tab'  => __( 'Add tab', 'sheetstowptable' ),
			'tab-group-title'  => __( 'Tab group title', 'sheetstowptable' ),

			/**
			 * Promo
			 */
			'lts-data'  => __( 'Let’s bring meaning to your data', 'sheetstowptable' ),
			'create-beautifully-designed-tables'  => __( 'Create beautifully designed tables from Google sheets and customize as you need.', 'sheetstowptable' ),

			/**
			 * Recommendation
			 */
			'other-prodct'  => __( 'Our Other Products', 'sheetstowptable' ),
			'remarkable-product'  => __( 'Experience remarkable WordPress products with a new level of power, beauty, and human-centered designs. Think you know WordPress products? Think Deeper!', 'sheetstowptable' ),

			/**
			 * RowSettings
			 */
			// 'hidden-cell'  => __( 'Hidden cells', 'sheetstowptable' ),
			'hidden-cell'  => __( 'Hidden Cells on Desktop', 'sheetstowptable' ),
			'hidden-cell-mob'  => __( 'Hidden Cells on Mobile', 'sheetstowptable' ),

			'hide-cell'  => __( 'Hide Cells', 'sheetstowptable' ),

			// 'hidden-row'  => __( 'Hidden rows', 'sheetstowptable' ),
			'hidden-row'  => __( 'Hidden Rows on Desktop', 'sheetstowptable' ),
			'hidden-row-mob'  => __( 'Hidden Rows on Mobile', 'sheetstowptable' ),

			'hide-row'  => __( 'Hide Rows', 'sheetstowptable' ),
			'same-desktop'  => __( 'Same as desktop', 'sheetstowptable' ),

			// 'hidden-column'  => __( 'Hidden Columns', 'sheetstowptable' ),
			'hidden-column'  => __( 'Hidden Columns on Desktop', 'sheetstowptable' ),
			'hidden-column-mob'  => __( 'Hidden Columns on Mobile', 'sheetstowptable' ),
			'hide-column-desktop'  => __( 'Hide columns on desktop', 'sheetstowptable' ),
			'hide-column-mobile'  => __( 'Hide columns on mobile', 'sheetstowptable' ),

			'hide-column'  => __( 'Hide Columns', 'sheetstowptable' ),
			'hide-desktop'  => __( 'Hide on Desktop', 'sheetstowptable' ),
			'hide-mobile'  => __( 'Hide on Mobile', 'sheetstowptable' ),
			'desktop'  => __( 'Desktop', 'sheetstowptable' ),
			'mobile'  => __( 'Mobile', 'sheetstowptable' ),
			'click-on-the-cells'  => __( 'Click on the cells on the table below that you want to hide', 'sheetstowptable' ),
			'click-on-the-rows'  => __( 'Click on the rows on the table below that you want to hide', 'sheetstowptable' ),
			'click-on-the-col'  => __( 'Click on the column on the table below that you want to hide', 'sheetstowptable' ),

			/**
			 * Settings
			 */
			'new'  => __( 'New', 'sheetstowptable' ),
			'save-settings'  => __( 'Save settings', 'sheetstowptable' ),
			'custom-css'  => __( 'Custom CSS', 'sheetstowptable' ),
			'recommended'  => __( 'Recommended', 'sheetstowptable' ),
			'with-pretty-link'  => __( 'With Pretty link', 'sheetstowptable' ),
			'with-smart-link'  => __( 'With Smart link', 'sheetstowptable' ),
			'asynchronous-loading'  => __( 'Asynchronous loading', 'sheetstowptable' ),

			'async-content'  => __( 'Enable this feature to load the table faster. The table will load in the frontend after loading all content with a pre-loader. If this feature is disabled then the table will load with the reloading of browser every time.', 'sheetstowptable' ),

			'choose-link-support'  => __( 'Choose your link support mechanism in WP Tables', 'sheetstowptable' ),
			'write-own-css'  => __( 'Write your own custom CSS to design the table or the page itself. Activate the Pro extension to enable custom CSS option', 'sheetstowptable' ),
			'performance'  => __( 'Performance', 'sheetstowptable' ),

			'script-content'  => __( 'Choose how you want to load your table scripts', 'sheetstowptable' ),
			'global-loading'  => __( 'Global loading', 'sheetstowptable' ),
			'global-loading-details'  => __( 'Load the scripts on all the pages and posts in your website.', 'sheetstowptable' ),
			'optimized-loading'  => __( 'Optimized loading', 'sheetstowptable' ),
			'optimized-loading-details'  => __( 'Load scripts only on the relevant pages/posts in your website where the table is added.', 'sheetstowptable' ),

			/**
			 * SupportModel
			 */
			'WPPOOL'  => __( 'WPPOOL', 'sheetstowptable' ),
			'powered-by'  => __( 'Powered by', 'sheetstowptable' ),
			'default-mail'  => __( 'Default Email App', 'sheetstowptable' ),
			'open-default-mail'  => __( 'Open your default email app', 'sheetstowptable' ),
			'copy-content'  => __( 'Copy email address to your clipboard', 'sheetstowptable' ),
			'yahoo'  => __( 'Yahoo', 'sheetstowptable' ),
			'yahoo-content'  => __( 'Open Yahoo in browser', 'sheetstowptable' ),
			'outlook'  => __( 'Outlook', 'sheetstowptable' ),
			'outlook-content'  => __( 'Open Outlook in browser', 'sheetstowptable' ),
			'gmail'  => __( 'Gmail', 'sheetstowptable' ),
			'gmail-content'  => __( 'Open Gmail in browser', 'sheetstowptable' ),
			'support-modal-title'  => __( 'Select the convenient option to connect with us', 'sheetstowptable' ),

			/**
			 * TabItem
			 */
			'Delete'  => __( 'Delete', 'sheetstowptable' ),
			'tab-group-delete'  => __( 'This Tab Group will be deleted. It will not appear on your website anymore, if you used it somewhere', 'sheetstowptable' ),
			'Cancel'  => __( 'Cancel', 'sheetstowptable' ),
			'confirmation-delete'  => __( 'Are you sure to delete this Tab Group?', 'sheetstowptable' ),

			/**
			 * TableCustomization
			 */

			'Utility'  => __( 'Utility', 'sheetstowptable' ),
			'Style'  => __( 'Styling', 'sheetstowptable' ),
			'Layout'  => __( 'Layout', 'sheetstowptable' ),
			'table_customization_layout'  => __( 'Layout', 'sheetstowptable' ),
			'let-export'  => __( 'Let user export table', 'sheetstowptable' ),
			'Excel'  => __( 'Excel', 'sheetstowptable' ),
			'JSON'  => __( 'JSON', 'sheetstowptable' ),
			'Copy'  => __( 'Copy', 'sheetstowptable' ),
			'CSV'  => __( 'CSV', 'sheetstowptable' ),
			'PDF'  => __( 'PDF', 'sheetstowptable' ),
			'Print'  => __( 'Print', 'sheetstowptable' ),
			'link-behave'  => __( 'Link redirection behaviour', 'sheetstowptable' ),
			'open-ct-window'  => __( 'Opens in current window', 'sheetstowptable' ),
			'open-new-window'  => __( 'Opens in a new window', 'sheetstowptable' ),

			'cursor-behavior'  => __( 'Cursor behavior inside the table', 'sheetstowptable' ),
			'highlight-and-copy'  => __( 'Text selection mode', 'sheetstowptable' ),
			'left-to-right'  => __( 'Table navigation mode (left-right)', 'sheetstowptable' ),

			'import-links'  => __( 'Import links from sheet', 'sheetstowptable' ),

			'import-checkbox'  => __( 'Import checkbox from sheet', 'sheetstowptable' ),
			'specific-column'  => __( 'Enable sorting by specific columns in', 'sheetstowptable' ),
			'sorting-ascending'  => __( 'Ascending', 'sheetstowptable' ),
			'sorting-descending'  => __( 'Descending', 'sheetstowptable' ),
			'sorting-checkbox-content'  => __( 'within the table', 'sheetstowptable' ),

			'import-image'  => __( 'Import images from sheet', 'sheetstowptable' ),
			'cache-table'  => __( 'Cache table for faster loading time', 'sheetstowptable' ),
			'frequent-cache'  => __( 'Prevent frequent cache updates for faster table loading', 'sheetstowptable' ),
			'freq-content'  => __( 'New changes from Google Sheets will appear only after the cache expires. Features like links, images, and merged cells may not show until the cache refreshes. Cache expiry time can be adjusted in Settings —> Performance.', 'sheetstowptable' ),
			'cell-formatting'  => __( 'Cell formatting style', 'sheetstowptable' ),
			'expanded'  => __( 'Expanded', 'sheetstowptable' ),
			'wrapped'  => __( 'Wrapped', 'sheetstowptable' ),
			'responsive-style'  => __( 'Responsive style', 'sheetstowptable' ),
			'default'  => __( 'Default', 'sheetstowptable' ),
			'collapsible-style'  => __( 'Collapsible Style', 'sheetstowptable' ),
			'scrollable-style'  => __( 'Scrollable Style', 'sheetstowptable' ),
			'row-per-page'  => __( 'Rows to show per page', 'sheetstowptable' ),
			'All'  => __( 'All', 'sheetstowptable' ),
			'100'  => __( '100', 'sheetstowptable' ),//phpcs:ignore
			'50'  => __( '50', 'sheetstowptable' ),//phpcs:ignore
			'30'  => __( '30', 'sheetstowptable' ),//phpcs:ignore
			'15'  => __( '15', 'sheetstowptable' ),//phpcs:ignore
			'10'  => __( '10', 'sheetstowptable' ),//phpcs:ignore
			'5'  => __( '5', 'sheetstowptable' ),//phpcs:ignore
			'1'  => __( '1', 'sheetstowptable' ),//phpcs:ignore
			'-1'  => __( '-1', 'sheetstowptable' ),//phpcs:ignore
			'limited-to-msg'  => __( 'The table is limited to 50 rows.', 'sheetstowptable' ),
			'limited-to-msg-2'  => __( 'to show the full Google Sheet with awesome customizations.', 'sheetstowptable' ),

			'upgrade-now'  => __( 'Upgrade Now →', 'sheetstowptable' ),
			'table-height'  => __( 'Table height', 'sheetstowptable' ),

			'default-height'  => __( 'Default height', 'sheetstowptable' ),
			'400px'  => __( '400px', 'sheetstowptable' ),
			'500px'  => __( '500px', 'sheetstowptable' ),
			'600px'  => __( '600px', 'sheetstowptable' ),
			'700px'  => __( '700px', 'sheetstowptable' ),
			'800px'  => __( '800px', 'sheetstowptable' ),
			'900px'  => __( '900px', 'sheetstowptable' ),
			'1000px'  => __( '1000px', 'sheetstowptable' ),
			'select-theme'  => __( 'Select theme', 'sheetstowptable' ),

			'import-color-from-sheet'  => __( 'Import colors and text styles from sheet', 'sheetstowptable' ),
			'unlock'  => __( 'Unlock', 'sheetstowptable' ),

			'Default-Style'  => __( 'Default Style', 'sheetstowptable' ),
			'Simple'  => __( 'Simple', 'sheetstowptable' ),

			'Dark-Table-wiz'  => __( 'Dark Table', 'sheetstowptable' ),
			'Dark-Table'  => __( 'Simple on dark', 'sheetstowptable' ),

			'Stripped-Table'  => __( 'Stripped Table', 'sheetstowptable' ),
			'minimal-Table'  => __( 'Minimal on dark', 'sheetstowptable' ),

			'hover-style'  => __( 'Hover Style', 'sheetstowptable' ),
			'minimal-elegant-style'  => __( 'Minimal elegant', 'sheetstowptable' ),

			'Taliwind-Style'  => __( 'Taliwind Style', 'sheetstowptable' ),
			'Uppercase-heading'  => __( 'Uppercase heading', 'sheetstowptable' ),
			'create-success'  => __( 'Table creation successfull', 'sheetstowptable' ),

			'colored-column'  => __( 'Colored Column', 'sheetstowptable' ),
			'vertical-style'  => __( 'Vertical style', 'sheetstowptable' ),

			 // NEW.
			'minimal-simple-style'  => __( 'Minimal', 'sheetstowptable' ),
			'dark-style-theme'  => __( 'Dark knight', 'sheetstowptable' ),
			'uppercase-elegant-theme'  => __( 'Uppercase elegant', 'sheetstowptable' ),

			'merge-cells'  => __( 'Merge cells', 'sheetstowptable' ),
			'beta'  => __( 'Beta', 'sheetstowptable' ),
			'merge-cells-notice'  => __( "Sorting feature is disabled. Your sheet contains vertically merged cells, so you can't use the sorting feature and merge cell feature altogether.", 'sheetstowptable' ),

			/**
			 * Modal
			 */

			'are-you-sure-to-disable'  => __( 'Are you sure to disable?', 'sheetstowptable' ),
			'imported-style-desc'  => __( 'Colors and text styles from your Google Sheet won’t be imported anymore. A default theme will be selected for you if you haven’t selected one already', 'sheetstowptable' ),
			'yes-disable'  => __( 'Yes, Disable', 'sheetstowptable' ),

			'yes-enable'  => __( 'Enable for Faster Loading', 'sheetstowptable' ),
			'are-you-sure-to-enable-frequent-mode'  => __( 'Prevent Live Sync?', 'sheetstowptable' ),
			'frequent-cache-note'  => __( 'Table data will only refresh when the cache expires. This improves performance but may delay content updates. You can adjust the cache expiry time in Settings → Performance.', 'sheetstowptable' ),
			'frequent-mode-desc'  => __( "Enabling this feature will skip live sync until your cache expires. Make sure your Google Sheet up to date and you've enabled all necessary features (images, links, merged cells, etc.) from the settings first.", 'sheetstowptable' ),

			/**
			 * Admin menus
			 */
			'Dashboard'  => __( 'Dashboard', 'sheetstowptable' ),
			'manage-tab-submenu'  => __( 'Manage Tab', 'sheetstowptable' ),
			'Settings'  => __( 'Settings', 'sheetstowptable' ),
			'get-started'  => __( 'Get Started', 'sheetstowptable' ),
			'Skip'  => __( 'Skip', 'sheetstowptable' ),
			'add-sheets'  => __( 'Add Google Sheet URL', 'sheetstowptable' ),
			'recommended-plugins'  => __( 'Recommended Plugins', 'sheetstowptable' ),

			/**
			 * Data Table
			 */
			// 'filtering'  => __( 'Show _MENU_ entries', 'sheetstowptable' ),
			'filtering_show'  => __( 'Show', 'sheetstowptable' ),
			'filtering_entries'  => __( 'entries', 'sheetstowptable' ),
			'search'  => __( 'Search:', 'sheetstowptable' ),
			// 'dataTables_info'  => __( 'Showing _START_ to _END_ of _TOTAL_ entries', 'sheetstowptable' ),
			'dataTables_info_showing'  => __( 'Showing', 'sheetstowptable' ),
			'dataTables_info_to'  => __( 'to', 'sheetstowptable' ),
			'dataTables_info_of'  => __( 'of', 'sheetstowptable' ),
			'first'  => __( 'First', 'sheetstowptable' ),
			'previous'  => __( 'Previous', 'sheetstowptable' ),
			'next'  => __( 'Next', 'sheetstowptable' ),
			'last'  => __( 'last', 'sheetstowptable' ),
			'data-empty-notice'  => __( 'No matching records found', 'sheetstowptable' ),

			/**
			 * TableItem
			 */
			'copy-shortcode'  => __( 'Copy Shortcode', 'sheetstowptable' ),
			'copy-shortcode-to-use-in-page'  => __( 'Copy the shortcode to use in in any page or post. Gutenberg and Elementor blocks are also supported', 'sheetstowptable' ),
			'are-you-sure-to-delete'  => __( 'Are you sure to delete the table? ', 'sheetstowptable' ),
			'confirmation-about-to-delete'  => __( 'You are about to delete the table. This will permanently delete the table(s)', 'sheetstowptable' ),

			/**
			 * Merge
			 */
			'merge-alert'  => __( 'Vertical merge found!', 'sheetstowptable' ),
			'merge-info'  => __( "Please make sure to keep the sorting feature disabled. Google sheet doesn't filter over a range containing vertical merges.", 'sheetstowptable' ),
			'merge-confirm'  => __( 'OK', 'sheetstowptable' ),
			'active-merge-condition-alert'  => __( 'Your sheet contains vertically merged cells, so you can not use the sorting feature. Sorting may break the table design and format. Please ensure that you have enabled either the vertical merge cell feature or the sorting feature, or confirm that your sheet has no vertical merges. If your table design still breaks even with sorting disabled, consider reloading the sheet or clicking save again to reflect the necessary fixes. To get the sorting feature visit Display settings > Disable sorting', 'sheetstowptable' ),

			/**
			 * TabSettings
			 */
			'After-the-table'  => __( 'After the table', 'sheetstowptable' ),
			'Before-the-table'  => __( 'Before the table', 'sheetstowptable' ),
			'Tab-position'  => __( 'Tab position', 'sheetstowptable' ),
			'hide-grp-title'  => __( 'Hide tab group title', 'sheetstowptable' ),

			/**
			 * TabsList
			 */
			'do-not-have-table'  => __( 'Manage tab is not available because you don’t have any tables yet. Please create tables first', 'sheetstowptable' ),
			'create-table-to-manage'  => __( 'Create tables first to manage tabs', 'sheetstowptable' ),
			'tab-groups-will-appear-here'  => __( 'Tab groups will appear here once you create them', 'sheetstowptable' ),
			'no-tab-grp-created'  => __( 'No tab groups have been created yet', 'sheetstowptable' ),
			'tab-grp-title'  => __( 'Show tab group title', 'sheetstowptable' ),

			/**
			 * Theme Customization and builder
			 */

			'header-color-title'  => __( 'HEADER COLORS', 'sheetstowptable' ),
			'text-color-title'  => __( 'TEXT COLORS', 'sheetstowptable' ),
			'body-title'  => __( 'BODY COLORS', 'sheetstowptable' ),
			'table-text-title'  => __( 'TABLE TEXTS', 'sheetstowptable' ),
			'table-hover-title'  => __( 'TABLE HOVER', 'sheetstowptable' ),
			'row-title'  => __( 'ROW COLORS', 'sheetstowptable' ),
			'column-title'  => __( 'COLUMN COLORS', 'sheetstowptable' ),
			'border-title'  => __( 'BORDER COLORS', 'sheetstowptable' ),
			'customize-theme-options-title'  => __( 'Customize Theme Options', 'sheetstowptable' ),
			'border-style-title'  => __( 'Border Style', 'sheetstowptable' ),
			'theme-reset'  => __( 'Reset', 'sheetstowptable' ),

			'bg-color'  => __( 'Background color', 'sheetstowptable' ),
			'txt-color'  => __( 'Text color', 'sheetstowptable' ),

			'first-cl-txt-color'  => __( 'First column text color', 'sheetstowptable' ),
			'rest-txt-color'  => __( 'Rest body text color', 'sheetstowptable' ),
			'remaning-txt-color'  => __( 'Remaining column text color', 'sheetstowptable' ),

			'hover-color'  => __( 'Hover color', 'sheetstowptable' ),
			'hover-text-color'  => __( 'Hover text color', 'sheetstowptable' ),
			'table-bg-color'  => __( 'Table background color', 'sheetstowptable' ),
			'table-hover-color'  => __( 'Table hover color', 'sheetstowptable' ),
			'table-border-color'  => __( 'Table border color', 'sheetstowptable' ),
			'table-text-color'  => __( 'Table text color', 'sheetstowptable' ),

			'border-color'  => __( 'Border Color', 'sheetstowptable' ),
			'out-border-color'  => __( 'Outside body border', 'sheetstowptable' ),
			'inside-border-color'  => __( 'Inside border', 'sheetstowptable' ),

			'even-row-color'  => __( 'Even row color', 'sheetstowptable' ),
			'odd-row-color'  => __( 'Odd row color', 'sheetstowptable' ),

			'even-column-color'  => __( 'Even column color', 'sheetstowptable' ),
			'odd-column-color'  => __( 'Odd column color', 'sheetstowptable' ),
			'outside-border-type'  => __( 'Outside border type', 'sheetstowptable' ),
			'outside-border'  => __( 'Outside border', 'sheetstowptable' ),
			'solid-border'  => __( 'Solid border', 'sheetstowptable' ),
			'rounded-border'  => __( 'Rounded border', 'sheetstowptable' ),
			'border-radius'  => __( 'Border radius', 'sheetstowptable' ),

			/**
			 * Theme Builder
			 */
			'update-changes'  => __( 'Update Theme', 'sheetstowptable' ),
			'theme-name'  => __( 'Theme name', 'sheetstowptable' ),
			'theme-colors'  => __( 'Theme colors', 'sheetstowptable' ),
			'active-column-colors'  => __( 'Column color', 'sheetstowptable' ),
			'active-row-colors'  => __( 'Row color', 'sheetstowptable' ),
			'edit-theme'  => __( 'Edit', 'sheetstowptable' ),
			'yes-delete'  => __( 'Yes, Delete', 'sheetstowptable' ),
			'yes-reset'  => __( 'Yes, Reset', 'sheetstowptable' ),
			'add-theme'  => __( 'Create Theme', 'sheetstowptable' ),
			'theme-alert-delete'  => __( 'Can’t delete active theme!', 'sheetstowptable' ),
			'theme-delete-notice'  => __( 'The theme is active and currently in use. Please select another theme for your table before deleting this one', 'sheetstowptable' ),
			'confirmation-theme-delete'  => __( 'Are you sure to delete theme?', 'sheetstowptable' ),
			'confirmation-theme-delete-notice'  => __( 'This theme wil be deleted and it can not be recovered. Are you sure to delete it?', 'sheetstowptable' ),

			'confirmation-theme-reset'  => __( 'Are you sure to reset?', 'sheetstowptable' ),
			'confirmation-theme-reset-notice'  => __( 'All of your changes & customization will be lost', 'sheetstowptable' ),

			'enable-row-column-ordering'  => __( 'Enable row and column coloring', 'sheetstowptable' ),
			'none'  => __( 'None', 'sheetstowptable' ),
			'row-wise'  => __( 'Row wise', 'sheetstowptable' ),
			'col-wise'  => __( 'Column wise', 'sheetstowptable' ),
			'select-coloring'  => __( 'Select coloring', 'sheetstowptable' ),
			'hover-mode'  => __( 'Hover mode', 'sheetstowptable' ),
			'+new-theme'  => __( '+ New Theme', 'sheetstowptable' ),

			'apply-theme-globally'  => __( 'Apply this custom theme to all tables', 'sheetstowptable' ),
			'style-theme-globally'  => __( 'Apply this same style for the other table', 'sheetstowptable' ),

			/**
			 * Pagination.tsx
			 */

			 'df-pagination'  => __( 'Default pagination', 'sheetstowptable' ),
			 'md-pagination'  => __( 'Modern pagination', 'sheetstowptable' ),
			 'minimal-pagination'  => __( 'Minimal pagination', 'sheetstowptable' ),
			 'tailwind-pagination'  => __( 'Tailwind pagination', 'sheetstowptable' ),
			 'outline-pagination'  => __( 'Outlined pagination', 'sheetstowptable' ),
			 'color-picker'  => __( 'Color Picker', 'sheetstowptable' ),
			 'pagination-color-will'  => __( 'Pagination color will change based on your selected color', 'sheetstowptable' ),

			 'pg-style'  => __( 'Pagination Style', 'sheetstowptable' ),
			 'pagination'  => __( 'Pagination', 'sheetstowptable' ),
			 'active-pagination-color'  => __( 'Active pagination color', 'sheetstowptable' ),
			 'keep-pagination-in-middle'  => __( 'Keep pagination in middle', 'sheetstowptable' ),
			 'confirm'  => __( 'Confirm', 'sheetstowptable' ),

			 /**
			  * Conditional view
			  */

			  'basic-display' => __('Basic Display (default)','sheetstowptable'),
			  'column-specific' => __('Enable Column-Specific Search','sheetstowptable'),
			  'choose-how-you-want' => __('Choose how you want to Display the table','sheetstowptable'),
			  'table-will-show-by-default' => __('Table will show by default and work accordingly. Nothing special here','sheetstowptable'),
			  'a-search-field' => __('Turn your table into a powerful search-engine! Visitors will initially see a search box instead of the table. Based on their input, they will receive filtered data in a streamlined table view. Ideal for searching both broad and specific ranges of information from your Google Sheets (e.g., student records, employee info, etc.).','sheetstowptable'),

			  'search-only-display' => __('Search-Only Display','sheetstowptable'),
			  'user-specific-display' => __('User-Specific Display','sheetstowptable'),
			  'Upcoming' => __('Upcoming','sheetstowptable'),
			  'displayed-only-to-logged-in-users' => __("Enhance personalization with this mode. It allows the table to be displayed only to the logged-in users based on their credentials or unique data (e.g., username or email) stored in the Google Sheets. There will be no search box, preventing anyone from searching other users' data.",'sheetstowptable'),

			  'password-pin-protected' => __('This mode adds an extra layer of security to your data. The table is protected by a password or PIN, ensuring that only authorized users can unlock and see the table information.','sheetstowptable'),

			  'protected-view' => __('Protected View','sheetstowptable'),
			  'loading-header' => __('Loading headers...','sheetstowptable'),
			  'want-to-display-your-search' => __('Choose Search-Result Trigger Option','sheetstowptable'),
			  'show-search-result-once-Typing' => __('Show search result once Typing','sheetstowptable'),
			  'show-search-result-after-pressing' => __('Show search result after pressing Search button','sheetstowptable'),
			  'column-for-table-search' => __('Select a column to search within its data. Results will only show matches from the selected column. If no column is selected, the search will apply to all data in the Google Sheet.','sheetstowptable'),

			  'unable-to-access' => __('Unable to access the Sheet! Please follow the instructions below:','sheetstowptable'),
			  'on-your-google' => __('On your Google Sheet, click on the','sheetstowptable'),
			  'button-located-at' => __('button located at the top-right corner. Then on the popup, choose the','sheetstowptable'),
			  'anyone-with-the-link' => __('“Anyone with the link”','sheetstowptable'),
			  'option-under-general' => __('option under General access','sheetstowptable'),
			  'click-on-the' => __('Click on the','sheetstowptable'),
			  'icon-on-the-popup' => __('icon on the popup and ensure that the option','sheetstowptable'),
			  'viewers-and-Commenters' => __('“Viewers and commenters can see the option to download, print, and copy”','sheetstowptable'),
			  'is-selected' => __('is selected','sheetstowptable'),
			  'share' => __('Share','sheetstowptable'),
			  'save-the-changes' => __('Save the changes by clicking on the','sheetstowptable'),
			  'done' => __('Done','sheetstowptable'),
			  'button' => __('button','sheetstowptable'),
			  'General' => __('General','sheetstowptable'),
			  'seconds' => __('seconds','sheetstowptable'),
			  'make-your-first-table' => __('Let’s make your first table','sheetstowptable'),
			  'help-on-your-first-table' => __('Let us help you with your first table creation. You are just a step away from creating beautiful tables from your Google Sheets','sheetstowptable'),

			  'days' => __('Day ','sheetstowptable'),
			  'timeout-label' => __('Response Timeout: ','sheetstowptable'),
			  'timestamp-label' => __('Timestamp: ','sheetstowptable'),
			  'timeout-content' => __('Choose the maximum response timeout the table need to wait','sheetstowptable'),
			  'cache-timestamp' => __('Choose the maximum day to store the cache','sheetstowptable'),
			  'the-table' => __('the table','sheetstowptable'),
			  'copy-shortcode' => __('Copy shortcode','sheetstowptable'),
			  'edit-table' => __('Edit table','sheetstowptable'),
			  'duplicate-table' => __('Duplicate table','sheetstowptable'),
			  'delete-table' => __('Delete table','sheetstowptable'),
			  'name-used' => __('Name already used, please use another name for theme','sheetstowptable'),
			  'name-need' => __('Name field can not be empty','sheetstowptable'),

		];
	}
}
