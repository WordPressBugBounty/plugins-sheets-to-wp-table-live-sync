<?php
/**
 * Represents as plugin base file.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS { //phpcs:ignore

	// If direct access than exit the file.
	defined( 'ABSPATH' ) || exit;

	use GSWPTS_Pluginsdk; //phpcs:ignore

	/**
	 * Represents as plugin base file.
	 *
	 * @since 2.12.15
	 */
	class GSWPTS {

		/**
		 * Holds the instance of the plugin currently in use.
		 *
		 * @var GSWPTS\GSWPTS
		 */
		private static $instance = null;

		/**
		 * Contains the helpers methods.
		 *
		 * @var \GSWPTS\GSWPTS_Helpers
		 */
		public $helpers;

		/**
		 * Contains plugin notices.
		 *
		 * @var \GSWPTS\GSWPTS_Notices
		 */
		public $notices;

		/**
		 * Contains the plugin assets.
		 *
		 * @var \GSWPTS\GSWPTS_Assets
		 */
		public $assets;

		/**
		 * Contains the plugin multisite functionalities.
		 *
		 * @var \GSWPTS\GSWPTS_Multisite
		 */
		public $multisite;

		/**
		 * Contains the admin functionalities.
		 *
		 * @var \GSWPTS\GSWPTS_Admin
		 */
		public $admin;

		/**
		 * Contains the plugin settings.
		 *
		 * @var \GSWPTS\GSWPTS_Settings
		 */
		public $settings;

		/**
		 * Contains the plugin strings.
		 *
		 * @var \GSWPTS\GSWPTS_Strings
		 */
		public $strings;

		/**
		 * Contains the plugin settings api.
		 *
		 * @var \GSWPTS\GSWPTS_SettingsApi
		 */
		public $settingsApi;// phpcs:ignore

		/**
		 * Contains the plugin shortcode.
		 *
		 * @var \GSWPTS\GSWPTS_Shortcode
		 */
		public $shortcode;

		/**
		 * Contains the plugin database helpers.
		 *
		 * @var \GSWPTS\GSWPTS_Database
		 */
		public $database;

		/**
		 * Contains the plugin ajax endpoints.
		 *
		 * @var \GSWPTS\GSWPTS_Ajax
		 */
		public $ajax;


		/**
		 * Contains the plugin ajax endpoints.
		 *
		 * @var \GSWPTS\GSWPTS_Cache
		 */
		public $cache;

		/**
		 * Contains elementor widget.
		 *
		 * @var \GSWPTS\Elementor\GSWPTS_ElementorBase
		 */
		public $elementor;

		/**
		 * Contains Divi module.
		 *
		 * @var \GSWPTS\Divi\GSWPTS_DiviBase
		 */
		public $divi;

		/**
		 * Contains AI manager functionalities.
		 *
		 * @var \GSWPTS\AI\GSWPTS_AIManager
		 */
		public $ai;


		/**
		 * Main Plugin Instance.
		 *
		 * Insures that only one instance of the addon exists in memory at any one
		 * time. Also prevents needing to define globals all over the place.
		 *
		 * @since  1.0.0
		 * @return GSWPTS\GSWPTS
		 */
		public static function get_instance() {
			if ( null === self::$instance || ! self::$instance instanceof self ) {
				self::$instance = new self();

				add_action( 'init', array( self::$instance, 'load_sdk' ) );
				add_action( 'init', array( self::$instance, 'appsero_init' ) );

				self::$instance->init();
			}

			return self::$instance;
		}

		/**
		 * Class constructor.
		 *
		 * @since 2.12.15
		 */
		public function init() {
			$this->includes();
			$this->loader();

			if ( gswpts()->helpers->version_check() ) {
				return;
			}
		}

		/**
		 * Load plugin classes.
		 *
		 * @since  2.12.15
		 * @return void
		 */
		private function loader() {
			add_action( 'admin_init', [ $this, 'redirection' ] );
			add_filter( 'plugin_action_links_' . plugin_basename( GSWPTS_PLUGIN_FILE ), [ $this, 'add_action_links' ] );

			register_activation_hook( GSWPTS_PLUGIN_FILE, [ $this, 'register_active_deactive_hooks' ] );

			$this->helpers     = new \GSWPTS\GSWPTS_Helpers();
			$this->settings    = new \GSWPTS\GSWPTS_Settings();
			$this->strings     = new \GSWPTS\GSWPTS_Strings();
			$this->notices     = new \GSWPTS\GSWPTS_Notices();
			$this->multisite   = new \GSWPTS\GSWPTS_Multisite();
			$this->assets      = new \GSWPTS\GSWPTS_Assets();
			$this->cache       = new \GSWPTS\GSWPTS_Cache();
			$this->elementor   = new \GSWPTS\Elementor\GSWPTS_ElementorBase();
			$this->divi        = new \GSWPTS\Divi\GSWPTS_DiviBase();
			$this->admin       = new \GSWPTS\GSWPTS_Admin();
			$this->shortcode   = new \GSWPTS\GSWPTS_Shortcode();
			$this->database    = new \GSWPTS\GSWPTS_Database();
			$this->ajax        = new \GSWPTS\GSWPTS_Ajax();
			$this->ai          = new \GSWPTS\AI\GSWPTS_AIManager();
		}

		/**
		 * Instantiate plugin available classes.
		 *
		 * @since 2.12.15
		 */
		public function includes() {
			$dependencies = [
				'/vendor/autoload.php',
				'/lib/wppool/class-plugin.php',
			];

			if ( ! class_exists('\GSWPTSFree\Appsero\Client') ) {
				$dependencies[] = '/vendor/appsero/src/Client.php';
			}

			foreach ( $dependencies as $path ) {
				if ( ! file_exists( GSWPTS_BASE_PATH . $path ) ) {
					status_header( 500 );
					wp_die( esc_html__( 'Plugin is missing required dependencies. Please contact support for more information.', 'sheets-to-wp-table-live-sync' ) );
				}

				require GSWPTS_BASE_PATH . $path;
			}
		}

		/**
		 * Add plugin action links.
		 *
		 * @param array $links The plugin links.
		 * @return array
		 */
		public function add_action_links( $links ) {
			$plugin = [
				sprintf(
					'<a href="%s">%s</a>',
					esc_url( admin_url( 'admin.php?page=swptls-dashboard' ) ),
					esc_html__( 'All Tables', 'sheets-to-wp-table-live-sync' )
				),
			];

			// Insertws the WordPress default links (like Deactivate) after first item
			$plugin = array_merge( $plugin, $links );

			if ( ! $this->helpers->check_pro_plugin_exists() ) {
				$plugin[] = sprintf(
					'<a style="font-weight: bold; color: #ff3b00; text-transform: uppercase; font-style: italic;"
						href="%s"
						target="_blank">%s</a>',
					esc_url( 'https://go.wppool.dev/KfVZ' ),
					esc_html__( 'Get Pro', 'sheets-to-wp-table-live-sync' )
				);
			}

			return $plugin;
		}

		/**
		 * Initialize appsero plugin.
		 *
		 * @since 2.12.15
		 */
		public function appsero_init() {
			$client = new \GSWPTSFree\Appsero\Client(
				'e8bb9069-1a77-457b-b1e3-a961ce950e2f',
				__( 'FlexTable', 'sheets-to-wp-table-live-sync' ),
				GSWPTS_PLUGIN_FILE
			);

			// Active insights.
			$client->insights()->init();
		}

		/**
		 * Load SDK for WPPool.
		 *
		 * @since 2.12.15
		 */
		public function load_sdk() {
			if ( function_exists( 'gswpts_pluginsdk_init' ) ) {
				$popup_image_url = GSWPTS_BASE_URL . 'lib/wppool/background-image-not-cached.png';
				$gswpts_plugin = gswpts_pluginsdk_init( 'sheets_to_wp_table_live_sync', $popup_image_url );

				if ( $gswpts_plugin && is_object( $gswpts_plugin ) && method_exists( $gswpts_plugin, 'set_campaign' ) ) {
					try {
						$campaign_image = GSWPTS_BASE_URL . 'lib/wppool/halloween.png';
						$to = '2024-11-05 16:00:00';
						$from = '2024-10-21 16:00:00';
						$cta_text = esc_html__( 'Grab Your Treat!', 'sheets-to-wp-table-live-sync' );
						$gswpts_plugin->set_campaign( $campaign_image, $to, $from, $cta_text );

						 // New Special Campaign.
						 $new_campaign_image = GSWPTS_BASE_URL . 'lib/wppool/special.png';
						 $new_to = '2026-07-14 17:00:00';
						 $new_from = '2026-06-24 17:00:00';
						 $black_friday_cta = esc_html__( 'Save Now💰', 'sheets-to-wp-table-live-sync' );
						 $black_friday_link = 'https://lnk.wppool.dev/mEQnKPb';

						 $gswpts_plugin->set_campaign( $new_campaign_image, $new_to, $new_from, $black_friday_cta, $black_friday_link );

					} catch ( Exception $e ) {// phpcs:ignore
						// phpcs:ignore
						// Catch block intentionally left empty. This is because we do not need to take any action on exception.
					}
				}
			}
		}


		/**
		 * Redirect to admin page on plugin activation
		 *
		 * @since 1.0.0
		 */
		public function redirection() {
			$redirect_to_admin_page = absint( get_option( 'gswpts_activation_redirect', 0 ) );
			$is_first_time = absint( get_option( 'gswpts_first_time_install', 0 ) );

			if ( 1 === $redirect_to_admin_page ) {
				delete_option( 'gswpts_activation_redirect' );

				// Redirect to Get Started page only on first install
				if ( 1 === $is_first_time ) {
					update_option( 'gswpts_first_time_install', 0 );
					wp_safe_redirect( admin_url( 'admin.php?page=swptls-dashboard#/doc' ) );
				} else {
					wp_safe_redirect( admin_url( 'admin.php?page=swptls-dashboard#/' ) );
				}
				exit;
			}
		}

		/**
		 * Registering activation and deactivation Hooks
		 *
		 * @param int $network_wide The network site ID.
		 * @return void
		 */
		public function register_active_deactive_hooks( $network_wide ) {
			gswpts()->database->migration->run( $network_wide );

			if ( ! get_option( 'gswpts_first_time_install' ) ) {
				add_option( 'gswpts_first_time_install', 1 );
			}

			add_option( 'gswpts_activation_redirect', 1 );

			if ( ! get_option( 'swptlsActivationTime' ) ) {
				add_option( 'swptlsActivationTime', time() );
			}

			// Link support options.
			add_option('link_support_mode', 'smart_link');
			add_option('script_support_mode', 'global_loading');

			add_option('link_support_code_has_run', 0);
			add_option('img_link_pro_support_has_run', 0);

			// Review notice options after installation of 7 days.
			add_option( 'swptlsReviewNotice', 0 );
			add_option( 'deafaultNoticeInterval', ( time() + 7 * 24 * 60 * 60 ) );

			// Upgrade notice options.
			add_option( 'swptlsUpgradeNotice', 0 );
			add_option( 'deafaultUpgradeInterval', ( time() + 10 * 24 * 60 * 60 ) );

			// Affiliate notice options.
			add_option( 'swptlsAffiliateNotice', 0 );
			add_option( 'deafaultAffiliateInterval', ( time() + 14 * 24 * 60 * 60 ) );

			// Make the async loading default.
			update_option( 'asynchronous_loading', 'on' );

			// Add manage tab option for managing table tab data.
			add_option( 'swptlsManageTabs', [] );

			flush_rewrite_rules();
		}
	}
}
// phpcs:ignore
namespace {
	// if direct access than exit the file.
	defined( 'ABSPATH' ) || exit;

	/**
	 * This function is responsible for running the main plugin.
	 *
	 * @since  2.12.15
	 * @return object GSWPTS\GSWPTS The plugin instance.
	 */
	function gswpts() {
		return \GSWPTS\GSWPTS::get_instance();
	}
}
