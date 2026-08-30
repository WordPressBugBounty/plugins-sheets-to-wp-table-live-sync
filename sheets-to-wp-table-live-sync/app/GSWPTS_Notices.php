<?php
/**
 * Responsible for displaying notices in the plugin.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manages notices.
 *
 * @since 2.12.15
 */
class GSWPTS_Notices {
	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {

		/**
		 * Detect plugin. For frontend only.
		 */
		include_once ABSPATH . 'wp-admin/includes/plugin.php';

		if ( \is_plugin_active( plugin_basename( GSWPTS_PLUGIN_FILE ) ) ) {
			// $this->review_notice_by_condition();
			// $this->review_affiliate_notice_by_condition();
		}

		$this->version_check();
	}

	/**
	 * Running version check.
	 *
	 * @since 2.12.15
	 */
	public function version_check() {
		if ( gswpts()->helpers->version_check() ) {
			if ( is_plugin_active( plugin_basename( GSWPTS_PLUGIN_FILE ) ) ) {
				deactivate_plugins( plugin_basename( GSWPTS_PLUGIN_FILE ) );
				add_action( 'admin_notices', [ $this, 'show_notice' ] );
			}
		}
	}

	/**
	 * Loads review notice based on condition.
	 *
	 * @since 2.12.15
	 */
	public function review_notice_by_condition() {
		$gswpts_review_notice = get_option('swptlsReviewNotice');
		/*
		 if ( time() >= intval( get_option( 'deafaultNoticeInterval' ) ) ) {
			if ( false === $gswpts_review_notice || empty($gswpts_review_notice) ) {
				add_action( 'admin_notices', [ $this, 'show_review_notice' ] );
			}
		} */
	}

	/**
	 * Load review affiliate notice condition.
	 *
	 * @since 2.12.15
	 */
	public function review_affiliate_notice_by_condition() {
		$affiliate_notice = get_option('swptlsAffiliateNotice');
		/*
		 if ( time() >= intval( get_option( 'deafaultAffiliateInterval' ) ) ) {
			if ( false === $affiliate_notice || empty($affiliate_notice) ) {
				add_action( 'admin_notices', [ $this, 'show_affiliate_notice' ] );
			}
		} */
	}


	/**
	 * Display plugin error notice.
	 *
	 * @return void
	 */
	public function show_notice() {
		printf(
			'<div class="notice notice-error is-dismissible"><h3><strong>%s </strong></h3><p>%s</p></div>',
			esc_html__( 'Plugin', 'sheets-to-wp-table-live-sync' ),
			esc_html__( 'cannot be activated - requires at least PHP 5.4. Plugin automatically deactivated.', 'sheets-to-wp-table-live-sync' )
		);
	}

	/**
	 * Display plugin review notice.
	 *
	 * @return void
	 */
	public function show_review_notice() {
		load_template( GSWPTS_BASE_PATH . 'app/templates/parts/review_notice.php' );
	}

	/**
	 * Displays plugin affiliate notice.
	 *
	 * @return void
	 */
	public function show_affiliate_notice() {
		load_template( GSWPTS_BASE_PATH . 'app/templates/parts/affiliate_notice.php' );
	}

	/**
	 * Displays plugin Influencer notice.
	 *
	 * @return void
	 */
	public function show_upgrade_notice() {
		load_template( GSWPTS_BASE_PATH . 'app/templates/parts/plugin_upgrade_notice.php' );
	}
}
