<?php
/**
 * Responsible for registering and managing plugin Divi module.
 *
 * @since   2.14.0
 * @package SWPTLS
 */

namespace SWPTLS\Divi;  // phpcs:ignore

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Registering Divi module for the plugin.
 *
 * @since 2.14.0
 */
class DiviBase {

	/**
	 * Class constructor
	 *
	 * @access public
	 * @since 2.14.0
	 */
	public function __construct() {
		$this->initialize_divi_module();
	}

	/**
	 * Initialize Divi module.
	 *
	 * @access public
	 * @since 2.14.0
	 */
	public function initialize_divi_module() {
		add_action( 'et_builder_ready', [ $this, 'register_module' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'load_module_styles' ] );
	}

	/**
	 * Register the Divi module.
	 * 
	 * IMPORTANT: Only require the file - DO NOT instantiate the class.
	 * Divi's framework will automatically discover and register any class
	 * that extends ET_Builder_Module.
	 *
	 * @since 2.14.0
	 */
	public function register_module() {
		if ( ! $this->is_compatible() ) {
			return;
		}

		// Only load the class definition - Divi handles the rest
		if ( ! class_exists( 'GSWPTS_FlexTable_Module' ) ) {
			require_once SWPTLS_BASE_PATH . 'app/Divi/DiviModule.php';
		}
	}

	/**
	 * Load module styles.
	 *
	 * @since 2.14.0
	 */
	public function load_module_styles() {
		if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) {
			wp_enqueue_style(
				'gswpts-divi-module',
				SWPTLS_BASE_URL . 'assets/public/styles/divi.min.css',
				[],
				SWPTLS_VERSION,
				'all'
			);

			wp_enqueue_script(
				'gswpts-divi-module',
				SWPTLS_BASE_URL . 'assets/public/scripts/backend/divi.min.js',
				[ 'jquery' ],
				SWPTLS_VERSION,
				true
			);
		}
	}

	/**
	 * Compatibility Checks.
	 *
	 * @access public
	 * @since 2.14.0
	 */
	public function is_compatible() {
		return class_exists( 'ET_Builder_Module' );
	}
}