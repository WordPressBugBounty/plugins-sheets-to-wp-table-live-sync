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
			$this->delete_mcp_data();
			$this->delete_batch_cache();
		}

		/**
		 * Removes the server-side pagination snapshot and feature transients.
		 *
		 * @since 3.27.0
		 */
		public function delete_batch_cache() {
			global $wpdb;

			$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '\_transient\_gswpts\_snap%' OR option_name LIKE '\_transient\_timeout\_gswpts\_snap%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		}

		/**
		 * Removes MCP data: its tables, options and the FlexTable MCP
		 * Application Passwords (other Application Passwords are kept).
		 *
		 * @since 3.26.0
		 */
		public function delete_mcp_data() {
			global $wpdb;

			$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}flextable_mcp_audit" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}flextable_mcp_snapshots" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery

			delete_option( 'flextable_mcp_settings' );
			delete_option( 'flextable_mcp_db_version' );

			if ( ! class_exists( 'WP_Application_Passwords' ) ) {
				return;
			}

			$app_id = '7c1f5e9a-3b2d-4a6e-9f08-2d4c6b8e1a57';
			$users  = [];
			// Every user with Application Passwords on the network, not only those with a FlexTable record.
			foreach ( [ 'flextable_mcp_credentials', '_application_passwords' ] as $meta_key ) {
				$users = array_merge(
					$users,
					get_users(
						[
							'blog_id'  => 0,
							'meta_key' => $meta_key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
							'fields'   => 'ID',
						]
					)
				);
			}

			foreach ( array_unique( array_map( 'intval', $users ) ) as $user_id ) {
				foreach ( WP_Application_Passwords::get_user_application_passwords( $user_id ) as $item ) {
					if ( isset( $item['app_id'] ) && $app_id === $item['app_id'] ) {
						WP_Application_Passwords::delete_application_password( $user_id, $item['uuid'] );
					}
				}
				delete_user_meta( $user_id, 'flextable_mcp_credentials' );
			}
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
				'server_side_pagination',
				'server_side_batch_size',
				'batch_loading_indicator',
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
