<?php
/**
 * Responsible for managing uninstall operations.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

if ( ! class_exists( 'GSWPTS_Uninstall' ) ) {

	/**
	 * Registering plugin uninstall events.
	 *
	 * @since 2.12.15
	 */
	class GSWPTS_Uninstall {

		/**
		 * Class constructor.
		 *
		 * @since 2.12.15
		 */
		public function __construct() {
			$this->delete_tables();
			$this->delete_options();
		}

		/**
		 * Delete database tables.
		 *
		 * @return mixed
		 */
		public function delete_tables() {
			global $wpdb;

			$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}gswpts_tables" );
			$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}gswpts_tabs" );
		}

		/**
		 * Delete options.
		 *
		 * @since 2.12.15
		 */
		public function delete_options() {
			$saved_options = [
				'swptlsActivationTime',
				'swptlsReviewNotice',
				'deafaultNoticeInterval',
				'swptlsAffiliateNotice',
				'deafaultAffiliateInterval',
				'asynchronous_loading',
				'custom_css',
				'css_code_value',
			];

			foreach ( $saved_options as $option ) {
				delete_option( $option );
			}
		}
	}

	new GSWPTS_Uninstall();
}
