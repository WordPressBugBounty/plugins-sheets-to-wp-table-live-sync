<?php
/**
 * Abstract AI Provider Class
 *
 * @since 3.1.0
 * @package SWPTLS
 */

namespace SWPTLS\AI;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Abstract AI Provider Class
 *
 * Base class for all AI providers (OpenAI, Gemini, Claude, etc.)
 *
 * @since 3.1.0
 * @package SWPTLS
 */
abstract class AIProvider {

	/**
	 * Provider name
	 */
	abstract public function get_provider_name(): string;

	/**
	 * Provider display name
	 */
	abstract public function get_provider_display_name(): string;

	/**
	 * Get available models for this provider
	 *
	 * @return array Available models with their configurations
	 */
	abstract public function get_available_models(): array;

	/**
	 * Get default model for this provider
	 *
	 * @return string Default model identifier
	 */
	abstract public function get_default_model(): string;

	/**
	 * Get provider-specific settings schema
	 *
	 * @return array Settings schema for this provider
	 */
	abstract public function get_settings_schema(): array;

	/**
	 * Validate API credentials
	 *
	 * @param array $credentials Provider credentials
	 * @return bool|WP_Error True if valid, WP_Error if invalid
	 */
	abstract public function validate_credentials( array $credentials );

	/**
	 * Test API connection
	 *
	 * @param array  $credentials Provider credentials
	 * @param string $model Model to test with
	 * @return array|WP_Error Test result
	 */
	abstract public function test_connection( array $credentials, string $model = '' );

	/**
	 * Generate AI response
	 *
	 * @param string $prompt The prompt to send
	 * @param array  $options API options
	 * @param array  $credentials Provider credentials
	 * @return array|WP_Error AI response or error
	 */
	abstract public function generate_response( string $prompt, array $options = [], array $credentials = [] );

	/**
	 * Get the API endpoint for this provider
	 *
	 * @return string API endpoint URL
	 */
	abstract protected function get_api_endpoint(): string;

	/**
	 * Get API timeout in seconds
	 *
	 * @return int Timeout in seconds
	 */
	protected function get_api_timeout(): int {
		return 30;
	}

	/**
	 * Format table data for AI consumption
	 *
	 * @param array $table_data Raw table data
	 * @param int   $max_tokens Maximum tokens allowed for input
	 * @return string Formatted table data
	 */
	public function format_table_for_ai( array $table_data, int $max_tokens = 12000 ): string {
		$formatted = '';

		// Add table title if available
		if ( ! empty( $table_data['title'] ) ) {
			$formatted .= "Table: {$table_data['title']}\n\n";
		}

		// Add table structure information
		$structure = $table_data['tableStructure'] ?? [];
		if ( ! empty( $structure ) ) {
			$formatted .= "Table Structure:\n";
			$formatted .= '- Total Columns: ' . ( $structure['totalColumns'] ?? 'Unknown' ) . "\n";
			$formatted .= '- Total Rows: ' . ( $structure['totalVisibleRows'] ?? count( $table_data['rows'] ?? [] ) ) . "\n";

			if ( $structure['hasImages'] ?? false ) {
				$formatted .= "- Contains Images: Yes\n";
			}
			if ( $structure['hasLinks'] ?? false ) {
				$formatted .= "- Contains Links: Yes\n";
			}
			if ( $structure['hasPagination'] ?? false ) {
				$formatted .= "- Has Pagination: Yes\n";
			}
			$formatted .= "\n";
		}

		// Add headers with type information
		if ( ! empty( $table_data['headers'] ) ) {
			$formatted .= "Columns:\n";
			foreach ( $table_data['headers'] as $index => $header ) {
				$header_text = is_array( $header ) ? $header['text'] : $header;
				$header_type = is_array( $header ) ? ( $header['type'] ?? 'text' ) : 'text';
				$formatted .= '- Column ' . ( $index + 1 ) . ": {$header_text} ({$header_type})\n";
			}
			$formatted .= "\n";
		}

		// Add data with intelligent sampling for large datasets
		if ( ! empty( $table_data['rows'] ) ) {
			$total_rows = count( $table_data['rows'] );
			$formatted .= "Data Analysis:\n";

			// For large datasets, use intelligent sampling
			if ( $total_rows > 100 ) {
				// Take first 30%, middle 30%, and last 30% of data
				$sample_size = min( 100, $total_rows );
				$first_count = intval( $sample_size * 0.3 );
				$middle_count = intval( $sample_size * 0.4 );
				$last_count = intval( $sample_size * 0.3 );

				$sample_rows = [];

				// First rows
				$sample_rows = array_merge( $sample_rows, array_slice( $table_data['rows'], 0, $first_count ) );

				// Middle rows
				$middle_start = intval( ( $total_rows - $middle_count ) / 2 );
				$sample_rows = array_merge( $sample_rows, array_slice( $table_data['rows'], $middle_start, $middle_count ) );

				// Last rows
				$sample_rows = array_merge( $sample_rows, array_slice( $table_data['rows'], -$last_count ) );

				$formatted .= "[Analyzing representative sample of {$total_rows} total rows]\n\n";
			} else {
				// For smaller datasets, use all data
				$sample_rows = $table_data['rows'];
				$formatted .= "[Analyzing all {$total_rows} rows]\n\n";
			}

			// Format the sample rows
			foreach ( $sample_rows as $row_index => $row ) {
				$formatted .= 'Row ' . strval( $row_index + 1 ) . ': ';

				// Ensure $row is an array before processing
				if ( is_array( $row ) ) {
					$formatted .= implode( ' | ', array_map( function ( $cell ) {
						// Ensure cell is a string and limit content to prevent token overflow
						$cell_str = is_string( $cell ) ? $cell : strval( $cell );
						return strlen( $cell_str ) > 100 ? substr( $cell_str, 0, 97 ) . '...' : $cell_str;
					}, $row ) );
				} else {
					// Handle non-array row data
					$row_str = is_string( $row ) ? $row : strval( $row );
					$formatted .= strlen( $row_str ) > 100 ? substr( $row_str, 0, 97 ) . '...' : $row_str;
				}
				$formatted .= "\n";
			}

			// Add note about sampling
			if ( $total_rows > 100 ) {
				$formatted .= "\n[Note: This analysis is based on a representative sample of " . count( $sample_rows ) . ' rows from ' . $total_rows . " total rows. The sample includes data from the beginning, middle, and end of the dataset to ensure comprehensive coverage.]\n";
			}
		}

		// Check if we're within token limits, if not, truncate further
		$estimated_tokens = $this->estimate_tokens( $formatted );
		if ( $estimated_tokens > $max_tokens ) {
			$formatted = $this->truncate_to_tokens( $formatted, $max_tokens );
		}

		return $formatted;
	}

	/**
	 * Get estimated token count for text
	 *
	 * @param string $text Text to estimate tokens for
	 * @return int Estimated token count
	 */
	public function estimate_tokens( string $text ): int {
		// Rough estimation: 1 token ≈ 4 characters for English text
		return ceil( strlen( $text ) / 4 );
	}

	/**
	 * Truncate text to fit within token limit
	 *
	 * @param string $text Text to truncate
	 * @param int    $max_tokens Maximum tokens allowed
	 * @return string Truncated text
	 */
	public function truncate_to_tokens( string $text, int $max_tokens ): string {
		$estimated_tokens = $this->estimate_tokens( $text );

		if ( $estimated_tokens <= $max_tokens ) {
			return $text;
		}

		// Calculate approximate character limit
		$char_limit = $max_tokens * 4 * 0.9; // 90% to be safe

		if ( strlen( $text ) <= $char_limit ) {
			return $text;
		}

		// Truncate and add note
		$truncated = substr( $text, 0, $char_limit );
		$last_newline = strrpos( $truncated, "\n" );

		if ( $last_newline !== false ) {
			$truncated = substr( $truncated, 0, $last_newline );
		}

		return $truncated . "\n\n[Note: Data truncated to fit token limit]";
	}

	/**
	 * Get saved credentials for this provider
	 *
	 * @return array Provider credentials
	 */
	protected function get_saved_credentials(): array {
		$provider_name = $this->get_provider_name();
		return [
			'api_key' => get_option( "swptls_{$provider_name}_api_key", '' ),
		];
	}

	/**
	 * Get saved options for this provider
	 *
	 * @return array Provider options
	 */
	protected function get_saved_options(): array {
		$provider_name = $this->get_provider_name();
		return [
			'model' => get_option( "swptls_{$provider_name}_model", $this->get_default_model() ),
			'max_tokens' => get_option( 'swptls_max_tokens', 500 ),
			'temperature' => get_option( 'swptls_temperature', 0.3 ),
			'frequency_penalty' => get_option( 'swptls_frequency_penalty', 0.3 ),
		];
	}

	/**
	 * Build default request headers
	 *
	 * @param array $credentials Provider credentials
	 * @return array Request headers
	 */
	protected function build_request_headers( array $credentials ): array {
		return [
			'Content-Type' => 'application/json',
		];
	}

	/**
	 * Handle API response
	 *
	 * @param array|WP_Error $response WordPress HTTP response
	 * @return array|WP_Error Processed response
	 */
	protected function handle_api_response( $response ) {
		// Handle request errors
		if ( is_wp_error( $response ) ) {
			/* translators: 1: API provider name, 2: Error message */
			return new \WP_Error( 'api_request_failed',
				sprintf( __( '%1$s API request failed: %2$s', 'sheets-to-wp-table-live-sync' ), $this->get_provider_display_name(), $response->get_error_message() )
			);
		}

		// Parse response
		$response_code = wp_remote_retrieve_response_code( $response );
		$response_body = wp_remote_retrieve_body( $response );
		$response_data = json_decode( $response_body, true );

		// Handle API errors
		if ( $response_code !== 200 ) {
			$error_message = $this->extract_error_message( $response_data, $response_code );

			/* translators: 1: API provider name, 2: HTTP status code, 3: Error message */
			return new \WP_Error( 'api_error',
				sprintf( __( '%1$s API error (%2$d): %3$s', 'sheets-to-wp-table-live-sync' ), $this->get_provider_display_name(), $response_code, $error_message )
			);
		}

		return $response_data;
	}

	/**
	 * Extract error message from API response
	 *
	 * @param array $response_data Response data
	 * @param int   $response_code Response code
	 * @return string Error message
	 */
	abstract protected function extract_error_message( array $response_data, int $response_code ): string;

	/**
	 * Build system prompt for AI requests
	 *
	 * @return string System prompt
	 */
	protected function get_system_prompt(): string {
		$default_prompt = 'You are a data analyst expert. Provide clear, concise, and insightful summaries of table data. Focus on key trends, patterns, and important insights.

IMPORTANT LENGTH GUIDELINES:
- When user specifies a number + content type (e.g., "15 content", "20 items", "10 points"), interpret intelligently:
  * Small numbers (1-50): Usually means words, sentences, or bullet points
  * "15 content" = 15 words or 15 key points
  * "20 items" = 20 bullet points or 20 words
  * "10 sentences" = exactly 10 sentences
- Always respect the specified length constraint precisely
- If length is ambiguous, default to words for small numbers (under 50)
- For "concise" requests, aim for brevity regardless of other instructions';

		return get_option( 'swptls_system_prompt', $default_prompt );
	}

	/**
	 * Get default user prompt template
	 *
	 * @return string Default user prompt template
	 */
	protected function get_user_prompt_template(): string {
		return 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.';
	}

	/**
	 * Log API usage for monitoring
	 *
	 * @param array $usage_data Usage data
	 */
	protected function log_api_usage( array $usage_data ): void {
		// Can be extended for usage tracking/monitoring
		do_action( 'swptls_ai_api_usage', $this->get_provider_name(), $usage_data );
	}
}
