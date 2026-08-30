<?php
/**
 * Plugin Name:       FlexTable
 * Plugin URI:        https://wppool.dev/sheets-to-wp-table-live-sync/
 * Description:       Display Google Spreadsheet data to WordPress table in just a few clicks and keep the data always synced. Organize and display all your spreadsheet data in your WordPress quickly and effortlessly.
 * Version:           3.24.6
 * Requires at least: 6.9
 * Requires PHP:      7.2
 * Author:            WPPOOL
 * Author URI:        https://wppool.dev/
 * Text Domain:       sheets-to-wp-table-live-sync
 * Domain Path:       /languages/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txts
 *
 * @package GSWPTS
 */

// if direct access than exit the file.
defined( 'ABSPATH' ) || exit;

define( 'GSWPTS_VERSION', '3.24.6' );
define( 'GSWPTS_BASE_PATH', plugin_dir_path( __FILE__ ) );
define( 'GSWPTS_BASE_URL', plugin_dir_url( __FILE__ ) );
define( 'GSWPTS_PLUGIN_FILE', __FILE__ );
define( 'GSWPTS_PLUGIN_NAME', 'FlexTable' );

// Define the class and the function.
require_once __DIR__ . '/app/GSWPTS.php';
gswpts();
