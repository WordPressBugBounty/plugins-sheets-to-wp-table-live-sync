<?php
/**
 * AI Manager Class
 *
 * @since 3.1.0
 * @package GSWPTS
 */

namespace GSWPTS\AI;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * AI Manager Class
 *
 * Manages multiple AI providers and handles provider selection
 *
 * @since 3.1.0
 * @package GSWPTS
 */
class GSWPTS_AIManager {

	/**
	 * Available AI providers
	 *
	 * @var array
	 */
	private $providers = [];

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->register_providers();
	}

	/**
	 * Register available AI providers
	 */
	private function register_providers(): void {
		$this->providers = [
			'openai' => new GSWPTS_OpenAIProvider(),
			'gemini' => new GSWPTS_GeminiProvider(),
		];

		// Allow other plugins to register additional providers
		$this->providers = apply_filters( 'gswpts_ai_providers', $this->providers );
	}

	/**
	 * Get provider names with display names
	 *
	 * @return array Provider names and display names
	 */
	public function get_provider_list(): array {
		$list = [];
		foreach ( $this->providers as $key => $provider ) {
			$list[ $key ] = [
				'name' => $provider->get_provider_name(),
				'display_name' => $provider->get_provider_display_name(),
				'models' => $provider->get_available_models(),
				'default_model' => $provider->get_default_model(),
				'settings_schema' => $provider->get_settings_schema(),
			];
		}
		return $list;
	}

	/**
	 * Get currently selected provider
	 *
	 * @return string Current provider name
	 */
	public function get_current_provider(): string {
		return get_option( 'gswpts_ai_provider', 'openai' );
	}


	/**
	 * Get current provider instance
	 *
	 * @return GSWPTS_AIProvider|null Current provider instance
	 */
	public function get_current_provider_instance(): ?GSWPTS_AIProvider {
		$current_provider = $this->get_current_provider();
		return $this->providers[ $current_provider ] ?? null;
	}

	/**
	 * Get specific provider instance
	 *
	 * @param string $provider_name Provider name
	 * @return GSWPTS_AIProvider|null Provider instance
	 */
	public function get_provider( string $provider_name ): ?GSWPTS_AIProvider {
		return $this->providers[ $provider_name ] ?? null;
	}

	/**
	 * Test connection for a specific provider
	 *
	 * @param string $provider_name Provider name
	 * @param array  $credentials Provider credentials
	 * @param string $model Model to test
	 * @return array|WP_Error Test result
	 */
	public function test_provider_connection( string $provider_name, array $credentials, string $model = '' ) {
		$provider = $this->get_provider( $provider_name );
		if ( ! $provider ) {
			return new \WP_Error( 'invalid_provider', __( 'Invalid AI provider', 'sheets-to-wp-table-live-sync' ) );
		}

		return $provider->test_connection( $credentials, $model );
	}

	/**
	 * Generate AI response using current provider
	 *
	 * @param string $prompt The prompt to send
	 * @param array  $options API options
	 * @param array  $credentials Provider credentials (optional)
	 * @return array|WP_Error AI response or error
	 */
	public function generate_response( string $prompt, array $options = [], array $credentials = [] ) {
		$provider = $this->get_current_provider_instance();
		if ( ! $provider ) {
			return new \WP_Error( 'no_provider', __( 'No AI provider configured', 'sheets-to-wp-table-live-sync' ) );
		}

		return $provider->generate_response( $prompt, $options, $credentials );
	}

	/**
	 * Generate AI summary for table data
	 *
	 * @param array $table_data Table data to summarize
	 * @param array $options Generation options
	 * @param array $table_settings Table-specific settings (optional)
	 * @return array|WP_Error AI summary or error
	 */
	public function generate_table_summary( array $table_data, array $options = [], array $table_settings = [] ) {
		$provider = $this->get_current_provider_instance();
		if ( ! $provider ) {
			return new \WP_Error( 'no_provider', __( 'No AI provider configured', 'sheets-to-wp-table-live-sync' ) );
		}

		$formatted_data = $provider->format_table_for_ai( $table_data );

		$user_prompt_template = '';

		if ( isset( $table_settings['summary_prompt'] ) && ! empty( trim( $table_settings['summary_prompt'] ) ) ) {
			$user_prompt_template = trim( $table_settings['summary_prompt'] );
		} elseif ( isset( $table_settings['ai_settings']['summary_prompt'] ) && ! empty( trim( $table_settings['ai_settings']['summary_prompt'] ) ) ) {
			$user_prompt_template = trim( $table_settings['ai_settings']['summary_prompt'] );
		} else {
			// Use default prompt
			$user_prompt_template = 'Give a short summary of this table (max 150 words), highlighting key takeaways and trends.';
		}

		// Add randomization when cache is disabled or regenerating to ensure unique responses
		$enable_cache = $table_settings['enable_ai_cache'] ?? $table_settings['ai_settings']['enable_ai_cache'] ?? true;
		$force_regenerate = $table_settings['force_regenerate'] ?? false;

		if ( ! $enable_cache || $force_regenerate ) {
			// Add a timestamp and random element to make each request unique
			$timestamp = current_time( 'mysql' );
			$random_id = wp_rand( 1000, 9999 );
			$user_prompt_template .= "\n\nNote: Please provide a fresh perspective on this data with new insights. Analysis timestamp: {$timestamp} (Request ID: {$random_id})";
		}

		$full_prompt = $user_prompt_template . "\n\n" . $formatted_data;

		// Generate response
		$response = $provider->generate_response( $full_prompt, $options );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Format response for frontend
		return [
			'summary' => $response['content'],
			'metadata' => [
				'provider' => $provider->get_provider_display_name(),
				'model' => $response['model'] ?? 'unknown',
				'rows_analyzed' => count( $table_data['rows'] ?? [] ),
				'total_rows_in_dataset' => $table_data['tableStructure']['totalVisibleRows'] ?? 'unknown',
				'columns' => count( $table_data['headers'] ?? [] ),
				'prompt_used' => substr( $user_prompt_template, 0, 100 ) . '...',
			],
			'usage' => $response['usage'] ?? [],
			'generated_at' => current_time( 'mysql' ),
			'tokens_used' => $response['usage']['total_tokens'] ?? 'N/A',
			'model_used' => $response['model'] ?? 'unknown',
		];
	}

}
