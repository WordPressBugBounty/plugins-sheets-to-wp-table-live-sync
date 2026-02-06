<?php
/**
 * OpenAI Provider Class
 *
 * @since 3.1.0
 * @package SWPTLS
 */

namespace SWPTLS\AI;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * OpenAI Provider Class
 *
 * @since 3.1.0
 * @package SWPTLS
 */
class OpenAIProvider extends AIProvider {

	/**
	 * OpenAI API endpoint
	 */
	const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

	/**
	 * {@inheritdoc}
	 */
	public function get_provider_name(): string {
		return 'openai';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_provider_display_name(): string {
		return 'OpenAI';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_available_models(): array {
		return [
			'gpt-4o-mini' => [
				'name' => 'GPT-4o Mini',
				'description' => 'Fast and cost-effective for most tasks',
				'max_tokens' => 16384,
				'cost_per_1k_tokens' => 0.00015,
				'recommended' => true,
			],
			'gpt-4o' => [
				'name' => 'GPT-4o',
				'description' => 'Most capable general model for text and vision',
				'max_tokens' => 128000,
				'cost_per_1k_tokens' => 0.005,
			],
			'gpt-4.1' => [
				'name' => 'GPT-4.1',
				'description' => 'Latest general-purpose model (text + vision) in OpenAI API',
				'max_tokens' => 1048576,
				'cost_per_1k_tokens' => 0.00,
				// 'recommended' => true,
			],
			'gpt-4.1-mini' => [
				'name' => 'GPT-4.1 Mini',
				'description' => 'Cost-efficient version of GPT-4.1 for simpler tasks',
				'max_tokens' => 1048576,
				'cost_per_1k_tokens' => 0.00,
			],
			'o4-mini' => [
				'name' => 'O4-Mini',
				'description' => 'Reasoning-specialized model from OpenAI (text + vision) ',
				'max_tokens' => 128000,
				'cost_per_1k_tokens' => 0.00,
			],
		];
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_default_model(): string {
		return 'gpt-4o-mini';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_settings_schema(): array {
		return [
			'api_key' => [
				'type' => 'password',
				'label' => __( 'OpenAI API Key', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Your OpenAI API key (starts with sk-)', 'sheets-to-wp-table-live-sync' ),
				'placeholder' => 'sk-...',
				'required' => true,
				'validation' => 'openai_api_key',
			],
			'model' => [
				'type' => 'select',
				'label' => __( 'Model', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Choose the OpenAI model to use', 'sheets-to-wp-table-live-sync' ),
				'options' => $this->get_available_models(),
				'default' => $this->get_default_model(),
			],
			'max_tokens' => [
				'type' => 'range',
				'label' => __( 'Max Tokens', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Maximum tokens for the response', 'sheets-to-wp-table-live-sync' ),
				'min' => 100,
				'max' => 2000,
				'step' => 50,
				'default' => 500,
			],
			'temperature' => [
				'type' => 'range',
				'label' => __( 'Creativity', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Controls randomness in responses', 'sheets-to-wp-table-live-sync' ),
				'min' => 0,
				'max' => 1,
				'step' => 0.1,
				'default' => 0.3,
			],
			'frequency_penalty' => [
				'type' => 'range',
				'label' => __( 'Frequency Penalty', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Reduces repetition in responses', 'sheets-to-wp-table-live-sync' ),
				'min' => 0,
				'max' => 1,
				'step' => 0.1,
				'default' => 0.3,
			],
		];
	}

	/**
	 * {@inheritdoc}
	 */
	protected function get_api_endpoint(): string {
		return self::API_ENDPOINT;
	}

	/**
	 * {@inheritdoc}
	 */
	public function validate_credentials( array $credentials ) {
		$api_key = $credentials['api_key'] ?? '';

		if ( empty( $api_key ) ) {
			return new \WP_Error( 'no_api_key', __( 'OpenAI API key is required', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( ! $this->validate_api_key_format( $api_key ) ) {
			return new \WP_Error( 'invalid_api_key', __( 'Invalid OpenAI API key format', 'sheets-to-wp-table-live-sync' ) );
		}

		return true;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection( array $credentials, string $model = '' ) {
		$validation = $this->validate_credentials( $credentials );
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		$api_key = $credentials['api_key'];
		$test_model = $model ?: $this->get_default_model();

		// Test with a simple request
		$test_request = [
			'model' => $test_model,
			'messages' => [
				[
					'role' => 'user',
					'content' => 'Hello, this is a test message. Please respond with "API connection successful".',
				],
			],
			'max_tokens' => 50,
			'temperature' => 0.1,
		];

		$response = wp_remote_post( $this->get_api_endpoint(), [
			'headers' => $this->build_request_headers( $credentials ),
			'body' => wp_json_encode( $test_request ),
			'timeout' => $this->get_api_timeout(),
		] );

		$processed_response = $this->handle_api_response( $response );
		if ( is_wp_error( $processed_response ) ) {
			return $processed_response;
		}

		if ( isset( $processed_response['choices'][0]['message']['content'] ) ) {
			return [
				'success' => true,
				/* translators: %s: AI model name */
				'message' => sprintf( __( 'OpenAI API connection successful! Model: %s', 'sheets-to-wp-table-live-sync' ), $test_model ),
				'response' => $processed_response['choices'][0]['message']['content'],
				'usage' => $processed_response['usage'] ?? [],
			];
		}

		return new \WP_Error( 'api_test_failed', __( 'API test failed: Invalid response structure', 'sheets-to-wp-table-live-sync' ) );
	}

	/**
	 * {@inheritdoc}
	 */
	public function generate_response( string $prompt, array $options = [], array $credentials = [] ) {
		// Use saved credentials if none provided
		if ( empty( $credentials ) ) {
			$credentials = $this->get_saved_credentials();
		}

		// Validate credentials
		$validation = $this->validate_credentials( $credentials );
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		// Merge options with defaults
		$default_options = $this->get_saved_options();
		$options = wp_parse_args( $options, $default_options );

		// Build system prompt
		$system_prompt = $options['system_prompt'] ?? $this->get_system_prompt();

		// Prepare API request
		$request_body = [
			'model' => $options['model'],
			'messages' => [
				[
					'role' => 'system',
					'content' => $system_prompt,
				],
				[
					'role' => 'user',
					'content' => $prompt,
				],
			],
			'max_tokens' => intval( $options['max_tokens'] ),
			'temperature' => floatval( $options['temperature'] ),
			'frequency_penalty' => floatval( $options['frequency_penalty'] ),
		];

		// Make API request
		$response = wp_remote_post( $this->get_api_endpoint(), [
			'headers' => $this->build_request_headers( $credentials ),
			'body' => wp_json_encode( $request_body ),
			'timeout' => $this->get_api_timeout(),
		] );

		$processed_response = $this->handle_api_response( $response );
		if ( is_wp_error( $processed_response ) ) {
			return $processed_response;
		}

		// Validate response structure
		if ( ! isset( $processed_response['choices'][0]['message']['content'] ) ) {
			return new \WP_Error( 'invalid_response', __( 'Invalid response structure from OpenAI API', 'sheets-to-wp-table-live-sync' ) );
		}

		// Log usage
		$usage_data = $processed_response['usage'] ?? [];
		$this->log_api_usage( $usage_data );

		// Return successful response
		return [
			'content' => trim( $processed_response['choices'][0]['message']['content'] ),
			'usage' => $usage_data,
			'model' => $processed_response['model'] ?? $options['model'],
			'finish_reason' => $processed_response['choices'][0]['finish_reason'] ?? 'unknown',
		];
	}

	/**
	 * {@inheritdoc}
	 */
	protected function build_request_headers( array $credentials ): array {
		$headers = parent::build_request_headers( $credentials );
		$headers['Authorization'] = 'Bearer ' . $credentials['api_key'];
		return $headers;
	}

	/**
	 * {@inheritdoc}
	 */
	protected function extract_error_message( array $response_data, int $response_code ): string {
		return $response_data['error']['message'] ??
			/* translators: %d: HTTP response status code */
			sprintf( __( 'API returned status code %d', 'sheets-to-wp-table-live-sync' ), $response_code );
	}

	/**
	 * Validate OpenAI API key format
	 *
	 * @param string $api_key API key to validate
	 * @return bool True if valid format
	 */
	private function validate_api_key_format( string $api_key ): bool {
		return preg_match( '/^sk-[a-zA-Z0-9_-]{20,}$/', $api_key );
	}
}
