<?php
/**
 * Responsible for managing ajax endpoints.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS\Ajax;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manage notices.
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
		add_action( 'wp_ajax_gswpts_notice_action', [ $this, 'manage_notices' ] );
	}

	/**
	 * Manage notices ajax endpoint response.
	 *
	 * @since 2.12.15
	 */
	public function manage_notices() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'gswpts_notices_nonce' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$action_type = isset( $_POST['actionType'] ) ? sanitize_text_field( wp_unslash( $_POST['actionType'] ) ) : '';
		$info_type   = isset( $_POST['info']['type'] ) ? sanitize_text_field( wp_unslash( $_POST['info']['type'] ) ) : '';
		$info_value  = isset( $_POST['info']['value'] ) ? sanitize_text_field( wp_unslash( $_POST['info']['value'] ) ) : '';

		if ( 'hide_notice' === $info_type ) {
			$this->hide_notice( $action_type );
		}

		if ( 'reminder' === $info_type ) {
			$this->set_reminder( $action_type, $info_value );
		}
	}

	/**
	 * Hide notices.
	 *
	 * @param string $action_type The action type.
	 * @since 2.12.15
	 */
	public function hide_notice( $action_type ) {
		if ( 'review_notice' === $action_type ) {
			update_option( 'swptlsReviewNotice', true );
		}

		if ( 'affiliate_notice' === $action_type ) {
			update_option( 'swptlsAffiliateNotice', true );
		}

		if ( 'upgrade_notice' === $action_type ) {
			update_option( 'swptlsUpgradeNotice', true );
		}

		if ( 'pro_fix_notice' === $action_type ) {
			update_option( 'gswpts_pro_appsero_fix_declined', true );
		}

		wp_send_json_success([
			'response_type' => 'success',
		]);
	}

	/**
	 * Set reminder to display notice.
	 *
	 * @param string $action_type The action type.
	 * @param string $info_value  The reminder value.
	 * @since 2.12.15
	 */
	public function set_reminder( $action_type, $info_value = '' ) {
		if ( 'hide_notice' === $info_value ) {
			$this->hide_notice( $action_type );
			wp_send_json_success([
				'response_type' => 'success',
			]);
		} else {

			if ( 'review_notice' === $action_type ) {
				update_option( 'deafaultNoticeInterval', ( time() + intval( $info_value ) * 24 * 60 * 60 ) );
			}

			if ( 'affiliate_notice' === $action_type ) {
				update_option( 'deafaultAffiliateInterval', ( time() + intval( $info_value ) * 24 * 60 * 60 ) );
			}

			if ( 'upgrade_notice' === $action_type ) {
				update_option( 'deafaultUpgradeInterval', ( time() + intval( $info_value ) * 24 * 60 * 60 ) );
			}

			wp_send_json_success([
				'response_type' => 'success',
			]);
		}
	}
}
