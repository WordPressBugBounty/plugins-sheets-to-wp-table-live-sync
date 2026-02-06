<?php
/**
 * Google Gemini Provider Class
 *
 * @since 3.1.0
 * @package SWPTLS
 */

namespace SWPTLS\AI;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Google Gemini Provider Class
 *
 * @since 3.1.0
 * @package SWPTLS
 */
class GeminiProvider extends AIProvider {

	/**
	 * Gemini API endpoint
	 */
	const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent';

	/**
	 * {@inheritdoc}
	 */
	public function get_provider_name(): string {
		return 'gemini';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_provider_display_name(): string {
		return 'Google Gemini';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_available_models(): array {
		return [
			'gemini-2.0-flash-exp' => [
				'name' => 'Gemini 2.0 Flash',
				'description' => 'Latest experimental model with enhanced capabilities',
				'max_tokens' => 8192,
				'cost_per_1k_tokens' => 0.000075,
			],

			'gemini-2.5-flash-lite' => [
				'name'        => 'Gemini 2.5 Flash-Lite',
				'description' => 'Cost-efficient, high throughput Gemini variant',
				'max_tokens'  => 1048576,
				'cost_per_1k_tokens' => 0.00005,
				'recommended' => true,
			],

		];
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_default_model(): string {
		return 'gemini-2.0-flash-exp';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_settings_schema(): array {
		return [
			'api_key' => [
				'type' => 'password',
				'label' => __( 'Google AI API Key', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Your Google AI Studio API key', 'sheets-to-wp-table-live-sync' ),
				'placeholder' => 'AIza...',
				'required' => true,
				'validation' => 'gemini_api_key',
			],
			'model' => [
				'type' => 'select',
				'label' => __( 'Model', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Choose the Gemini model to use', 'sheets-to-wp-table-live-sync' ),
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
			'top_p' => [
				'type' => 'range',
				'label' => __( 'Top P', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Controls diversity via nucleus sampling', 'sheets-to-wp-table-live-sync' ),
				'min' => 0.1,
				'max' => 1,
				'step' => 0.1,
				'default' => 0.95,
			],
			'top_k' => [
				'type' => 'range',
				'label' => __( 'Top K', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Controls diversity by limiting vocabulary', 'sheets-to-wp-table-live-sync' ),
				'min' => 1,
				'max' => 100,
				'step' => 1,
				'default' => 40,
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
			return new \WP_Error( 'no_api_key', __( 'Gemini API key is required', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( ! $this->validate_api_key_format( $api_key ) ) {
			return new \WP_Error( 'invalid_api_key', __( 'Invalid Gemini API key format', 'sheets-to-wp-table-live-sync' ) );
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

		// Test with a simple request - shorter prompt to reduce chances of 503 errors
		$test_request = [
			'contents' => [
				[
					'parts' => [
						[
							'text' => 'Test',
						],
					],
				],
			],
			'generationConfig' => [
				'maxOutputTokens' => 10,
				'temperature' => 0.1,
			],
		];

		$endpoint = str_replace( '{model}', $test_model, $this->get_api_endpoint() ) . '?key=' . $api_key;

		// Add retry logic for rate limiting/overload errors
		$max_retries = 3;
		$retry_delay = 1; // seconds

		for ( $attempt = 1; $attempt <= $max_retries; $attempt++ ) {
			$response = wp_remote_post( $endpoint, [
				'headers' => $this->build_request_headers( $credentials ),
				'body' => wp_json_encode( $test_request ),
				'timeout' => 15, // Longer timeout for API tests
			] );

			$processed_response = $this->handle_api_response( $response );

			// If successful, return result
			if ( ! is_wp_error( $processed_response ) ) {
				if ( isset( $processed_response['candidates'][0]['content']['parts'][0]['text'] ) ) {
					return [
						'success' => true,
						/* translators: %s: AI model name */
						'message' => sprintf( __( 'Gemini API connection successful! Model: %s', 'sheets-to-wp-table-live-sync' ), $test_model ),
						'response' => $processed_response['candidates'][0]['content']['parts'][0]['text'],
						'usage' => $processed_response['usageMetadata'] ?? [],
					];
				}
			}

			// Check if it's a retryable error (503, 429, etc.)
			if ( is_wp_error( $processed_response ) ) {
				$error_message = $processed_response->get_error_message();

				// If it's a rate limit or overload error, retry
				if ( ( strpos( $error_message, '503' ) !== false ||
					  strpos( $error_message, '429' ) !== false ||
					  strpos( $error_message, 'overloaded' ) !== false ) &&
					 $attempt < $max_retries ) {

					// Wait before retrying with exponential backoff
					sleep( $retry_delay );
					$retry_delay *= 2;
					continue;
				}

				// If it's not retryable or we've exhausted retries, return the error
				return $processed_response;
			}
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

		// Build system prompt and user prompt
		$system_prompt = $options['system_prompt'] ?? $this->get_system_prompt();
		$full_prompt = $system_prompt . "\n\n" . $prompt;

		// Prepare API request
		$request_body = [
			'contents' => [
				[
					'parts' => [
						[
							'text' => $full_prompt,
						],
					],
				],
			],
			'generationConfig' => [
				'maxOutputTokens' => intval( $options['max_tokens'] ),
				'temperature' => floatval( $options['temperature'] ),
				'topP' => floatval( $options['top_p'] ?? 0.95 ),
				'topK' => intval( $options['top_k'] ?? 40 ),
			],
			'safetySettings' => [
				[
					'category' => 'HARM_CATEGORY_HARASSMENT',
					'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
				],
				[
					'category' => 'HARM_CATEGORY_HATE_SPEECH',
					'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
				],
				[
					'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
					'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
				],
				[
					'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
					'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
				],
			],
		];

		// Build endpoint URL with API key
		$endpoint = str_replace( '{model}', $options['model'], $this->get_api_endpoint() ) . '?key=' . $credentials['api_key'];

		// Make API request
		$response = wp_remote_post( $endpoint, [
			'headers' => $this->build_request_headers( $credentials ),
			'body' => wp_json_encode( $request_body ),
			'timeout' => $this->get_api_timeout(),
		] );

		$processed_response = $this->handle_api_response( $response );
		if ( is_wp_error( $processed_response ) ) {
			return $processed_response;
		}

		// Validate response structure
		if ( ! isset( $processed_response['candidates'][0]['content']['parts'][0]['text'] ) ) {
			// Check for safety filter blocks
			if ( isset( $processed_response['candidates'][0]['finishReason'] ) &&
				 $processed_response['candidates'][0]['finishReason'] === 'SAFETY' ) {
				return new \WP_Error( 'safety_filter', __( 'Response blocked by Gemini safety filters', 'sheets-to-wp-table-live-sync' ) );
			}

			return new \WP_Error( 'invalid_response', __( 'Invalid response structure from Gemini API', 'sheets-to-wp-table-live-sync' ) );
		}

		// Log usage
		$usage_data = $processed_response['usageMetadata'] ?? [];
		$this->log_api_usage( $usage_data );

		// Return successful response
		return [
			'content' => trim( $processed_response['candidates'][0]['content']['parts'][0]['text'] ),
			'usage' => $usage_data,
			'model' => $options['model'],
			'finish_reason' => $processed_response['candidates'][0]['finishReason'] ?? 'unknown',
		];
	}

	/**
	 * {@inheritdoc}
	 */
	protected function build_request_headers( array $credentials ): array {
		return [
			'Content-Type' => 'application/json',
		];
	}

	/**
	 * {@inheritdoc}
	 */
	protected function extract_error_message( array $response_data, int $response_code ): string {
		// Handle Gemini-specific error structure
		if ( isset( $response_data['error']['message'] ) ) {
			return $response_data['error']['message'];
		}

		if ( isset( $response_data['error']['details'][0]['reason'] ) ) {
			return $response_data['error']['details'][0]['reason'];
		}
		/* translators: %d: HTTP response status code */
		return sprintf( __( 'API returned status code %d', 'sheets-to-wp-table-live-sync' ), $response_code );
	}

	/**
	 * {@inheritdoc}
	 */
	protected function get_saved_options(): array {
		$provider_name = $this->get_provider_name();
		return [
			'model' => get_option( "swptls_{$provider_name}_model", $this->get_default_model() ),
			'max_tokens' => get_option( 'swptls_max_tokens', 500 ),
			'temperature' => get_option( 'swptls_temperature', 0.3 ),
			'top_p' => get_option( 'swptls_gemini_top_p', 0.95 ),
			'top_k' => get_option( 'swptls_gemini_top_k', 40 ),
		];
	}

	/**
	 * Validate Gemini API key format
	 *
	 * @param string $api_key API key to validate
	 * @return bool True if valid format
	 */
	private function validate_api_key_format( string $api_key ): bool {
		return preg_match( '/^AIza[0-9A-Za-z_-]{35}$/', $api_key );
	}
}
