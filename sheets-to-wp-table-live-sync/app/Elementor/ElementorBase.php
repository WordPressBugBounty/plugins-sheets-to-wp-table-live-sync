<?php
/**
 * Responsible for registering and managing plugin elementor widget.
 *
 * @since   2.13.1
 * @package SWPTLS
 */

namespace SWPTLS\Elementor;  // phpcs:ignore

use SWPTLS\Elementor\ElementorWidget;  // phpcs:ignore

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Registering elementor widget for the plugin.
 *
 * @since 2.13.1
 */
class ElementorBase {

	/**
	 * Minimum Elementor Version
	 *
	 * @var string Minimum Elementor version required to run the plugin.
	 * @since 1.0.0
	 */
	const MINIMUM_ELEMENTOR_VERSION = '2.0.0';

	/**
	 * Class constructor
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function __construct() {
		$this->initialize_elementor_widget();
	}

	/**
	 * On Plugins Loaded.
	 *
	 * Checks if Elementor has loaded, and performs some compatibility checks.
	 * If All checks pass, inits the plugin.
	 *
	 * Fired by `plugins_loaded` action hook.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function initialize_elementor_widget() {

		if ( $this->is_compatible() ) {
			add_action( 'elementor/init', [ $this, 'init' ] );

			// Register Widget Styles.
			add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'load_widget_css' ] );
		}
	}

	/**
	 * Loads widget styles.
	 *
	 * @since 2.13.1
	 */
	public function load_widget_css() {
		echo '<style>
			.gswpts_icon {
				background: url(' . esc_url( SWPTLS_BASE_URL . 'assets/public/images/admin-icon-elementor.svg' ) . ');
				display: block;
				width: 30px;
				height: 30px;
				background-repeat: no-repeat;
				margin-left: calc(50% - 15px);
			}
        </style>';
	}

	/**
	 * Compatibility Checks.
	 *
	 * Checks if the installed version of Elementor meets the plugin's minimum requirement.
	 * Checks if the installed PHP version meets the plugin's minimum requirement.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function is_compatible() {
		// Check if Elementor installed and activated.
		if ( ! did_action( 'elementor/loaded' ) ) {
			return false;
		}

		// Check for required Elementor version.
		if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_elementor_version' ] );
			return false;
		}

		return true;
	}

	/**
	 * Initialize the plugin
	 *
	 * Load the files required to run the plugin.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function init() {
		// Add Plugin actions.
		add_action( 'elementor/widgets/register', [ $this, 'init_widgets' ] );
	}

	/**
	 * Init Widgets
	 *
	 * Include widgets files and register them
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function init_widgets() {
		\Elementor\Plugin::instance()->widgets_manager->register( new ElementorWidget() );
	}

	/**
	 * Admin notice
	 *
	 * Warning when the site doesn't have a minimum required Elementor version.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function admin_notice_minimum_elementor_version() {
		if ( isset( $_GET['activate'] ) ) { // phpcs:ignore
			unset( $_GET['activate'] ); // phpcs:ignore
		}

		$message = sprintf(
			/* translators: 1: Plugin name 2: Elementor 3: Required Elementor version */
			'"%1$s" requires "%2$s" version %3$s or greater.',
			'<strong>Google Spreadsheet to WP Table Sync</strong>',
			'<strong>Elementor</strong>',
			self::MINIMUM_ELEMENTOR_VERSION
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', wp_kses_post( $message ) );
	}
}
