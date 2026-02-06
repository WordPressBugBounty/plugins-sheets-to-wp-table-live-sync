<?php
/**
 * Responsible for managing ajax endpoints.
 *
 * @since 2.12.15
 * @package SWPTLS
 */

namespace SWPTLS\Ajax;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manage notices.
 *
 * @since 2.12.15
 */
class Settings {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_ajax_swptls_get_settings', [ $this, 'get' ] );
		add_action( 'wp_ajax_swptls_save_settings', [ $this, 'save' ] );
	}

	/**
	 * Get field.
	 */
	public function get() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		wp_send_json_success([
			'async' => get_option( 'asynchronous_loading', false ),
			'css'   => get_option( 'css_code_value' ),
			'link_support'   => get_option( 'link_support_mode', 'pretty_link' ),
			'script_support'   => get_option( 'script_support_mode', 'global_loading' ),
			'timeout'   => get_option( 'timeout_values', 10 ),
			'cache_timestamp'   => get_option( 'cache_timestamp', 30 ),

			// AI Provider Settings
			'ai_provider' => get_option( 'swptls_ai_provider', 'openai' ),
			'openai_api_key' => get_option( 'swptls_openai_api_key', '' ),
			'openai_model' => get_option( 'swptls_openai_model', 'gpt-4o-mini' ),
			'gemini_api_key' => get_option( 'swptls_gemini_api_key', '' ),
			'gemini_model' => get_option( 'swptls_gemini_model', 'gemini-2.5-flash-lite' ),
			'gemini_top_p' => get_option( 'swptls_gemini_top_p', 0.95 ),
			'gemini_top_k' => get_option( 'swptls_gemini_top_k', 40 ),
			'max_tokens' => get_option( 'swptls_max_tokens', 500 ),
			'temperature' => get_option( 'swptls_temperature', 0.3 ),
			'frequency_penalty' => get_option( 'swptls_frequency_penalty', 0.3 ),
			'cache_duration' => get_option( 'swptls_cache_duration', 1800 ),

		]);
	}

	/**
	 * Save field.
	 */
	public function save() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$settings_raw = isset( $_POST['settings'] ) ? sanitize_text_field( wp_unslash( $_POST['settings'] ) ) : '';
		$settings = ! empty( $settings_raw ) ? json_decode( $settings_raw, true ) : false;

		update_option( 'asynchronous_loading', isset( $settings['async_loading'] ) ? sanitize_text_field( $settings['async_loading'] ) : '' );

		update_option( 'css_code_value', isset( $settings['css_code_value'] ) ? sanitize_text_field( $settings['css_code_value'] ) : '' );

		update_option( 'link_support_mode', isset( $settings['link_support'] ) ? sanitize_text_field( $settings['link_support'] ) : '' );

		update_option( 'script_support_mode', isset( $settings['script_support'] ) ? sanitize_text_field( $settings['script_support'] ) : '' );

		update_option( 'timeout_values', isset( $settings['timeout'] ) ? sanitize_text_field( $settings['timeout'] ) : 10 );

		update_option( 'cache_timestamp', isset( $settings['cache_timestamp'] ) ? sanitize_text_field( $settings['cache_timestamp'] ) : 30 );

		// Save AI provider settings.
		if ( isset( $settings['ai_provider'] ) ) {
			update_option( 'swptls_ai_provider', sanitize_text_field( $settings['ai_provider'] ) );
		}
		if ( isset( $settings['openai_api_key'] ) ) {
			update_option( 'swptls_openai_api_key', sanitize_text_field( $settings['openai_api_key'] ) );
		}
		if ( isset( $settings['openai_model'] ) ) {
			update_option( 'swptls_openai_model', sanitize_text_field( $settings['openai_model'] ) );
		}
		if ( isset( $settings['gemini_api_key'] ) ) {
			update_option( 'swptls_gemini_api_key', sanitize_text_field( $settings['gemini_api_key'] ) );
		}
		if ( isset( $settings['gemini_model'] ) ) {
			update_option( 'swptls_gemini_model', sanitize_text_field( $settings['gemini_model'] ) );
		}
		if ( isset( $settings['gemini_top_p'] ) ) {
			update_option( 'swptls_gemini_top_p', floatval( $settings['gemini_top_p'] ) );
		}
		if ( isset( $settings['gemini_top_k'] ) ) {
			update_option( 'swptls_gemini_top_k', absint( $settings['gemini_top_k'] ) );
		}
		if ( isset( $settings['max_tokens'] ) ) {
			update_option( 'swptls_max_tokens', absint( $settings['max_tokens'] ) );
		}
		if ( isset( $settings['temperature'] ) ) {
			update_option( 'swptls_temperature', floatval( $settings['temperature'] ) );
		}
		if ( isset( $settings['frequency_penalty'] ) ) {
			update_option( 'swptls_frequency_penalty', floatval( $settings['frequency_penalty'] ) );
		}

		if ( isset( $settings['cache_duration'] ) ) {
			update_option( 'swptls_cache_duration', absint( $settings['cache_duration'] ) );
		}

		wp_send_json_success([
			'message' => __( 'Settings saved successfully.', 'sheets-to-wp-table-live-sync' ),
			'async' => get_option( 'asynchronous_loading', false ),
			'css'   => get_option( 'css_code_value' ),
			'link_support'   => get_option( 'link_support_mode', 'pretty_link' ),
			'script_support'   => get_option( 'script_support_mode', 'global_loading' ),
			'timeout'   => get_option( 'timeout_values', 10 ),
			'cache_timestamp'   => get_option( 'cache_timestamp', 30 ),

			// AI Provider Settings
			'ai_provider' => get_option( 'swptls_ai_provider', 'openai' ),
			'openai_api_key' => get_option( 'swptls_openai_api_key', '' ),
			'openai_model' => get_option( 'swptls_openai_model', 'gpt-4o-mini' ),
			'gemini_api_key' => get_option( 'swptls_gemini_api_key', '' ),
			'gemini_model' => get_option( 'swptls_gemini_model', 'gemini-2.5-flash-lite' ),
			'gemini_top_p' => get_option( 'swptls_gemini_top_p', 0.95 ),
			'gemini_top_k' => get_option( 'swptls_gemini_top_k', 40 ),
			'max_tokens' => get_option( 'swptls_max_tokens', 500 ),
			'temperature' => get_option( 'swptls_temperature', 0.3 ),
			'frequency_penalty' => get_option( 'swptls_frequency_penalty', 0.3 ),
			'cache_duration' => get_option( 'swptls_cache_duration', 1800 ),

		]);
	}
}
