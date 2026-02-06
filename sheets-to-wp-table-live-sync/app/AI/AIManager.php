<?php
/**
 * AI Manager Class
 *
 * @since 3.1.0
 * @package SWPTLS
 */

namespace SWPTLS\AI;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * AI Manager Class
 *
 * Manages multiple AI providers and handles provider selection
 *
 * @since 3.1.0
 * @package SWPTLS
 */
class AIManager {

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
			'openai' => new OpenAIProvider(),
			'gemini' => new GeminiProvider(),
		];

		// Allow other plugins to register additional providers
		$this->providers = apply_filters( 'swptls_ai_providers', $this->providers );
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
		return get_option( 'swptls_ai_provider', 'openai' );
	}


	/**
	 * Get current provider instance
	 *
	 * @return AIProvider|null Current provider instance
	 */
	public function get_current_provider_instance(): ?AIProvider {
		$current_provider = $this->get_current_provider();
		return $this->providers[ $current_provider ] ?? null;
	}

	/**
	 * Get specific provider instance
	 *
	 * @param string $provider_name Provider name
	 * @return AIProvider|null Provider instance
	 */
	public function get_provider( string $provider_name ): ?AIProvider {
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

		// Enhance the prompt with better context for length requirements
		$enhanced_prompt = $this->enhance_prompt_for_length_clarity( $user_prompt_template );

		$full_prompt = $enhanced_prompt . "\n\n" . $formatted_data;

		// Calculate appropriate token limit based on prompt requirements
		$dynamic_max_tokens = $this->calculate_dynamic_token_limit( $user_prompt_template, $options );
		if ( $dynamic_max_tokens > 0 ) {
			$options['max_tokens'] = $dynamic_max_tokens;
		}

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

	/**
	 * Process AI prompt for table data
	 *
	 * @param string $prompt_text User's custom prompt
	 * @param array  $table_data Table data to analyze
	 * @param array  $options Generation options
	 * @param array  $table_settings Table-specific settings (optional)
	 * @return array|WP_Error AI response or error
	 */
	public function process_table_prompt( string $prompt_text, array $table_data, array $options = [], array $table_settings = [] ) {
		$provider = $this->get_current_provider_instance();
		if ( ! $provider ) {
			return new \WP_Error( 'no_provider', __( 'No AI provider configured', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( empty( trim( $prompt_text ) ) ) {
			return new \WP_Error( 'empty_prompt', __( 'Prompt cannot be empty', 'sheets-to-wp-table-live-sync' ) );
		}

		$formatted_data = $provider->format_table_for_ai( $table_data );

		$context_prompt = "You are an AI assistant analyzing table data. Please answer the user's question based solely on the provided table data. If the data doesn't contain the information needed to answer the question, please say so clearly.";

		$full_prompt = $context_prompt . "\n\n"
					  . "Table Data:\n" . $formatted_data . "\n\n"
					  . 'User Question: ' . $prompt_text;

		// Generate response
		$response = $provider->generate_response( $full_prompt, $options );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Format response for frontend
		return [
			'response' => $response['content'],
			'metadata' => [
				'provider' => $provider->get_provider_display_name(),
				'model' => $response['model'] ?? 'unknown',
				'rows_analyzed' => count( $table_data['rows'] ?? [] ),
				'total_rows_in_dataset' => $table_data['tableStructure']['totalVisibleRows'] ?? 'unknown',
				'columns' => count( $table_data['headers'] ?? [] ),
				'prompt_length' => strlen( $prompt_text ),
			],
			'usage' => $response['usage'] ?? [],
			'generated_at' => current_time( 'mysql' ),
			'tokens_used' => $response['usage']['total_tokens'] ?? 'N/A',
			'model_used' => $response['model'] ?? 'unknown',
		];
	}

	/**
	 * Calculate dynamic token limit based on prompt requirements
	 *
	 * @param string $prompt_text The user prompt
	 * @param array  $options Current options
	 * @return int Dynamic token limit or 0 to use default
	 */
	private function calculate_dynamic_token_limit( string $prompt_text, array $options ): int {
		// Get the user-defined max_tokens from global settings as the absolute maximum
		$user_max_tokens = intval( $options['max_tokens'] ?? 500 );
		$content_matches = [];

		// Enhanced pattern to catch various content length specifications - "15 words", "15 content", "15 items", "15 points", "15 sentences", "15 lines", etc.
		if ( preg_match_all( '/(?:max(?:imum)?|min(?:imum)?|exactly|about|around|provide|give|write)?\s*(?:a\s+)?(?:concise\s+)?(?:summary\s+)?(\d+)\s*(?:words?|content|items?|points?|sentences?|lines?|characters?|bullets?)/i', $prompt_text, $content_matches ) ) {
			// Get the highest number mentioned
			$max_content = max( array_map( 'intval', $content_matches[1] ) );

			if ( $max_content <= 50 ) {
				$estimated_words = $max_content;
			} elseif ( $max_content <= 500 ) {
				if ( $max_content <= 200 ) {
					$estimated_words = $max_content; // Treat as words
				} else {
					$estimated_words = intval( $max_content / 5 ); // Treat as characters (avg 5 chars per word)
				}
			} else {
				// Large numbers (500+) likely mean characters
				$estimated_words = intval( $max_content / 5 ); // Convert characters to words
			}

			// Convert words to tokens (1 word ≈ 1.3 tokens) + 40% buffer for formatting and safety
			$estimated_tokens = intval( $estimated_words * 1.3 * 1.4 );

			// Ensure reasonable bounds
			$estimated_tokens = max( 150, min( $estimated_tokens, $user_max_tokens ) );

			return $estimated_tokens;
		}

		// Look for explicit token-based requirements
		if ( preg_match_all( '/(?:max(?:imum)?|min(?:imum)?|exactly|about|around)?\s*(\d+)\s*tokens?/i', $prompt_text, $token_matches ) ) {
			$max_tokens = max( array_map( 'intval', $token_matches[1] ) );

			// Add 20% buffer for safety
			$estimated_tokens = intval( $max_tokens * 1.2 );

			// Respect user's maximum setting
			$estimated_tokens = max( 200, min( $estimated_tokens, $user_max_tokens ) );

			return $estimated_tokens;
		}

		// Look for "long", "detailed", "comprehensive" keywords that suggest longer responses
		if ( preg_match( '/\b(?:long|detailed|comprehensive|extensive|thorough|in-depth|elaborate|full|complete)\b/i', $prompt_text ) ) {
			// Use 80% of user's max setting for detailed requests
			return intval( $user_max_tokens * 0.8 );
		}

		// Look for "short", "brief", "concise" keywords that suggest shorter responses
		if ( preg_match( '/\b(?:short|brief|concise|quick|summary|compact|condensed)\b/i', $prompt_text ) ) {
			// Use 40% of user's max setting for brief requests, minimum 300 tokens
			return max( 300, intval( $user_max_tokens * 0.4 ) );
		}

		// Default: use existing max_tokens from user settings
		return 0;
	}

	/**
	 * Enhance prompt to provide better context for length requirements
	 *
	 * @param string $original_prompt The original user prompt
	 * @return string Enhanced prompt with better context
	 */
	private function enhance_prompt_for_length_clarity( string $original_prompt ): string {
		// Check if prompt contains ambiguous length specifications
		if ( preg_match( '/(\d+)\s*(?:content|items?|points?|elements?)/i', $original_prompt, $matches ) ) {
			$number = intval( $matches[1] );

			// Add clarification based on the number size
			if ( $number <= 50 ) {
				$clarification = "\n\nIMPORTANT: When you see '{$number} content' or '{$number} items', interpret this as {$number} words or {$number} key points. Keep your response concise and within this limit.";
			} else {
				$clarification = "\n\nIMPORTANT: The user requested {$number} content units. For numbers this large, provide a proportionally sized response that matches the user's expectation for content volume.";
			}

			return $original_prompt . $clarification;
		}

		// Check for other ambiguous terms and provide context
		if ( preg_match( '/\b(?:concise|brief|short)\b.*?(\d+)/i', $original_prompt, $matches ) ) {
			$number = intval( $matches[1] );
			$clarification = "\n\nIMPORTANT: The user wants a concise response with {$number} units of content. Prioritize brevity and precision.";
			return $original_prompt . $clarification;
		}

		return $original_prompt;
	}
}
