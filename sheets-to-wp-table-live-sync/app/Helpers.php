<?php
/**
 * Responsible for managing helper methods.
 *
 * @since 2.12.15
 * @package SWPTLS
 */

namespace SWPTLS;

use WP_Error; //phpcs:ignore

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manages notices.
 *
 * @since 2.12.15
 */
class Helpers {

	/**
	 * Check if the pro plugin exists.
	 *
	 * @return boolean
	 */
	public function check_pro_plugin_exists(): bool {
		return file_exists( WP_PLUGIN_DIR . '/sheets-to-wp-table-live-sync-pro/sheets-to-wp-table-live-sync-pro.php' );
	}

	/**
	 * Check if pro plugin is active or not
	 *
	 * @return boolean
	 */
	public function is_pro_active(): bool {
		if ( is_multisite() ) {
			$site_id = get_current_blog_id();
			if ( $site_id ) {
				// Check if the pro plugin and standard plugin are installed.
				$is_pro_installed = $this->check_pro_plugin_exists();
				$is_standard_installed = function_exists('swptls');

				if ( $is_pro_installed && $is_standard_installed ) {
					return function_exists('swptlspro') && swptlspro()->license_status;
				}
			}
		} else {
			return function_exists('swptlspro') && swptlspro()->license_status;
		}

		return false;
	}

	/**
	 * Checks for php versions.
	 *
	 * @return bool
	 */
	public function version_check(): bool {
		return version_compare( PHP_VERSION, '5.4' ) < 0;
	}

	/**
	 * Get nonce field.
	 *
	 * @param string $nonce_action The nonce action.
	 * @param string $nonce_name   The nonce input name.
	 */
	public function nonce_field( $nonce_action, $nonce_name ) {
		wp_nonce_field( $nonce_action, $nonce_name );
	}

	/**
	 * Extract google sheet id.
	 *
	 * @param string $url The sheet url.
	 * @return string|false
	 */
	public function get_sheet_id( string $url ) {
		$parts = wp_parse_url( $url );

		if ( ! $parts ) {
			return false;
		}

		if ( isset( $parts['query'] ) ) {
			parse_str( $parts['query'], $query );

			if ( isset( $query['id'] ) ) {
				return $query['id'];
			}
		}

		$path = explode( '/', $parts['path'] );
		return ! empty( $path[3] ) ? sanitize_text_field( $path[3] ) : false;
	}

	/**
	 * Get grid id.
	 *
	 * @param string $url The sheet url.
	 * @return mixed
	 */
	public function get_grid_id( string $url ) {
		$gid = 0;
		$pattern = '/gid=(\w+)/i';

		if ( preg_match_all( $pattern, $url, $matches ) ) {
			$matched_id = $matches[1][0];
			if ( $matched_id || '0' === $matched_id ) {
				$gid = '' . $matched_id . '';
			}
		}

		return $gid;
	}

	/**
	 * Retrieves the table type.
	 *
	 * @param  string $type The table type.
	 * @return string
	 */
	public function get_table_type( string $type ): string {
		switch ( $type ) {
			case 'spreadsheet':
				return 'Spreadsheet';
			case 'csv':
				return 'CSV';
			default:
				return 'No type';
		}
	}

	/**
	 * Sheet url constructor.
	 *
	 * @param  string $sheet_id The sheet ID.
	 * @param  int    $gid     The sheet tab id.
	 * @return string
	 */
	public function prepare_export_url( string $sheet_id, int $gid ): string {
		apply_filters( 'swptls_export_url', $gid );
		return sprintf( 'https://docs.google.com/spreadsheets/d/%1$s/export?format=csv&id=%1$s&gid=%2$s', $sheet_id, $gid );
	}

	/**
	 * Get csv data.
	 * Support line break.
	 *
	 * @param  string $url     The sheet url.
	 * @param  string $sheet_id The sheet ID.
	 * @param  int    $gid     The sheet tab id.
	 * @return string|WP_Error
	 */
	public function get_csv_data( string $url, string $sheet_id, int $gid ) {
		$timeout = get_option('timeout_values', 10);
		$timeout = ! empty($timeout) ? (int) $timeout : 10;
		$args = array(
			'timeout' => $timeout,
		);

		$url = $this->prepare_export_url($sheet_id, $gid);
		$response = wp_remote_get($url, $args);

		if ( is_wp_error($response) ) {
			return new WP_Error('private_sheet', __('You are offline.', 'sheets-to-wp-table-live-sync'));
		}

		$headers = $response['headers'];

		if ( ! isset($headers['X-Frame-Options']) || 'DENY' === $headers['X-Frame-Options'] ) {
			wp_send_json_error([
				'message' => __('Sheet is not public or shared', 'sheets-to-wp-table-live-sync'),
				'type'    => 'private_sheet',
			]);
		}

		$csv_data = wp_remote_retrieve_body($response);

		// Open CSV data stream for processing - use CSV RAW data
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- Using in-memory stream, not file I/O
		$data_stream = fopen('php://temp', 'r+');
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite -- Writing to memory stream
		fwrite($data_stream, $csv_data);
		rewind($data_stream);

		$rows = [];

		while ( ( $data = fgetcsv($data_stream, 0, ',') ) !== false ) {
			foreach ( $data as $index => &$cell ) {
				// ✅ Sanitize each cell AFTER parsing
				$cell = wp_kses_post($cell);

				// Handle line breaks for all columns
				$cell = str_replace("\n", '<br>', $cell);
				$cell = str_replace("\r", '', $cell);

				// Apply special handling for the first column
				if ( $index === 0 ) {
					$cell = str_replace(',', '﹐', $cell);
				}
			}
			$rows[] = $data;
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing memory stream
		fclose($data_stream);

		// ✅ Use fputcsv() for proper CSV encoding
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- Using in-memory stream for CSV generation
		$output_stream = fopen('php://temp', 'r+');
		foreach ( $rows as $row ) {
			fputcsv($output_stream, $row, ',');
		}
		rewind($output_stream);
		$output_csv = stream_get_contents($output_stream);
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing memory stream
		fclose($output_stream);

		return $output_csv;
	}


	/**
	 * Retrieve merged styles.
	 *
	 * @param string $sheet_id The sheet id.
	 * @param int    $gid The sheet gid.
	 * @return mixed
	 */
	public function get_merged_styles( string $sheet_id, int $gid ) {
		if ( empty( $sheet_id ) || '' === $gid ) {
			return new \WP_Error( 'feature_not_compatible', __( 'The feature is not compatible or something went wrong', 'sheets-to-wp-table-live-sync' ) );
		}

		$timeout = get_option( 'timeout_values', 10 );
		$timeout = ! empty( $timeout ) ? (int) $timeout : 10;

		$args = array(
			'timeout' => $timeout,
		);

		$url = sprintf( 'https://script.google.com/macros/s/AKfycbx1Uj8F5kesVvf98y4sDmCJP9EGcBJhclFSa0zAbuk8dzfPkY6dn-P2AbYOsRaTUAdE9w/exec?sheetID=%1$s&gID=%2$d&action=getMergedCells', $sheet_id, $gid );

		$response = wp_remote_get( $url, $args );

		if ( is_wp_error( $response ) ) {
			return '';
		}

		$code     = wp_remote_retrieve_response_code( $response );
		$body     = wp_remote_retrieve_body( $response );

		return 200 === $code ? json_decode( $body, true ) : $response;
	}





	/**
	 * Loads data based on the condition.
	 *
	 * @param string $sheet_url    The condition sheet_url.
	 * @param int    $table_id The table table_id.
	 * @param bool   $editor_mode The table editor.
	 * @return mixed
	 */
	public function load_table_data( string $sheet_url, int $table_id, $editor_mode = false ) {
		$response = [];
		$table_id = absint($table_id);

		if ( empty($sheet_url) || $table_id <= 0 ) {
			return $response;
		}

		// Get table settings.
		$table = swptls()->database->table->get($table_id);

		if ( empty($table) ) {
			return $response;
		}

		$table_settings = ! empty($table['table_settings']) ? json_decode(wp_unslash($table['table_settings']), true) : [];

		$cache_disable_frequent = isset($table_settings['disable_frequent_cache']) ? wp_validate_boolean($table_settings['disable_frequent_cache']) : false;

		$table_cache = isset($table_settings['table_cache']) ? wp_validate_boolean($table_settings['table_cache']) : false;
		$import_styles = isset($table_settings['import_styles']) ? wp_validate_boolean($table_settings['import_styles']) : false;
		$merged_support = isset($table_settings['merged_support']) ? wp_validate_boolean($table_settings['merged_support']) : false;
		$table_img_support = isset($table_settings['table_img_support']) ? wp_validate_boolean($table_settings['table_img_support']) : false;
		$table_link_support = isset($table_settings['table_link_support']) ? wp_validate_boolean($table_settings['table_link_support']) : false;

		// Get sheet identifiers.
		$sheet_id = swptls()->helpers->get_sheet_id($sheet_url);
		$sheet_gid = swptls()->helpers->get_grid_id($sheet_url);

		// If cache active and frequent is enabled, bypass timestamp checks entirely.
		if ( $table_cache && $cache_disable_frequent && ! $editor_mode ) {
			// Retrieve ALL cached data at once.
			$cached_data = [
				'sheet_data' => swptls()->cache->get_saved_sheet_data($table_id),
				'sheet_merged_data' => $merged_support ? swptls()->cache->get_saved_merge_styles($table_id, null) : null,
				'sheet_images' => $table_img_support ? swptls()->cache->get_saved_sheet_images($table_id, null) : null,
				'sheet_links' => $table_link_support ? swptls()->cache->get_saved_sheet_link_styles($table_id, null) : null,
			];

			// Check if we have valid cached data.
			$cached_data_exists = ! empty($cached_data['sheet_data']);

			// If cached data exists, use it without timestamp checks.
			if ( $cached_data_exists ) {
				// Construct response from cached data, filtering out null values. Using cached data (cache disable frequent mode).
				$response = array_filter([
					'sheet_data' => $cached_data['sheet_data'],
					'sheet_merged_data' => $cached_data['sheet_merged_data'],
					'sheet_images' => $cached_data['sheet_images'],
					'sheet_links' => $cached_data['sheet_links'],
				]);

				// We successfully used cache and avoided API calls - return early.
				return $response;
			}
		}

		if ( $table_cache && ! $editor_mode && ! $cache_disable_frequent ) {
			$isUrlUpdated = esc_url($sheet_url) !== esc_url($table['source_url']);

			if ( ! $isUrlUpdated ) {
				// Retrieve ALL cached data at once.
				$cached_data = [
					'sheet_data' => swptls()->cache->get_saved_sheet_data($table_id),
					'sheet_merged_data' => $merged_support ? swptls()->cache->get_saved_merge_styles($table_id, null) : null,
					'sheet_images' => $table_img_support ? swptls()->cache->get_saved_sheet_images($table_id, null) : null,
					'sheet_links' => $table_link_support ? swptls()->cache->get_saved_sheet_link_styles($table_id, null) : null,
				];

				// Check if we have valid cached data.
				$cached_data_exists = ! empty($cached_data['sheet_data']);

				if ( $cached_data_exists ) {
					$is_sheet_updated = swptls()->cache->is_updated($table_id, $sheet_url);

					// If sheet is NOT updated, use cached data.
					if ( ! $is_sheet_updated ) {
						$response = array_filter([
							'sheet_data' => $cached_data['sheet_data'],
							'sheet_merged_data' => $cached_data['sheet_merged_data'],
							'sheet_images' => $cached_data['sheet_images'],
							'sheet_links' => $cached_data['sheet_links'],
						]);

						// We successfully used cache and avoided API calls - return early.
						return $response;
					}
				}
			}
		}

		// Need to fetch new data (cache miss, cache disabled, or editor mode) Fetch essential sheet data.
		$response['sheet_data'] = swptls()->helpers->get_csv_data($sheet_url, $sheet_id, $sheet_gid);

		// Only proceed with caching and additional data if sheet_data is not empty.
		if ( ! empty($response['sheet_data']) ) {

			if ( $table_cache ) {
				swptls()->cache->set_last_updated_time($table_id, $sheet_url);
			}

			if ( $merged_support ) {
				$response['sheet_merged_data'] = $this->get_merged_styles($sheet_id, $sheet_gid);
			}

			if ( $table_img_support ) {
				$response['sheet_images'] = $this->get_images_data($sheet_id, $sheet_gid);
			}

			if ( $table_link_support ) {
				$response['sheet_links'] = $this->get_links_data($sheet_id, $sheet_gid);
			}

			// If caching is enabled, save all fetched data to cache.
			if ( $table_cache ) {
				if ( ! empty($response['sheet_data']) ) {
					swptls()->cache->save_sheet_data($table_id, $response['sheet_data']);
				}

				if ( $merged_support && ! empty($response['sheet_merged_data']) ) {
					swptls()->cache->save_merged_styles($table_id, $response['sheet_merged_data']);
				}

				if ( $table_img_support && ! empty($response['sheet_images']) ) {
					swptls()->cache->save_sheet_images($table_id, $response['sheet_images']);
				}

				if ( $table_link_support && ! empty($response['sheet_links']) ) {
					swptls()->cache->save_sheet_link($table_id, $response['sheet_links']);
				}
			}
		}

		return $response;
	}


	/**
	 * Performs format cells.
	 *
	 * @return mixed
	 */
	public function embed_cell_format_class(): string {
		return 'expanded_style';
	}

	/**
	 * Get cell alignment.
	 *
	 * @param string $alignment The cell alignment.
	 * @return string The corresponding CSS text-align property.
	 */
	public function get_cell_alignment( string $alignment ): string {
		switch ( strtolower( $alignment ) ) {
			case 'general-right':
			case 'right':
				return 'right';
			case 'General-left':
			case 'left':
				return 'left';
			case 'center':
				return 'center';
			default:
				return 'left';
		}
	}

	/**
	 * Transform boolean values based on the sheet logic.
	 *
	 * @param  string $cell_value The cell value.
	 * @return string
	 */
	public function transform_boolean_values( $cell_value ) {
		$filtered_cell_value = '';

		switch ( $cell_value ) {
			case 'TRUE':
				$filtered_cell_value = '&#10004;';
				break;
			case 'FALSE':
				$filtered_cell_value = '&#10006;';
				break;
			default:
				$filtered_cell_value = $cell_value;
				break;
		}

		return $filtered_cell_value;
	}


	/**
	 * Transform checkbox values based on the sheet logic.
	 *
	 * @param  string $cell_value The cell value.
	 * @return string
	 */
	public function transform_checkbox_values( $cell_value ) {
		$class_name = '';
		$is_checked = '';
		$hidden_value = '0';

		// Determine the values based on the cell value.
		switch ( $cell_value ) {
			case 'TRUE':
				$class_name = 'checked';       // Add 'checked' class for true.
				$is_checked = 'checked';       // Set the checkbox as checked.
				$hidden_value = '1';           // Set hidden value to '1'.
				break;
			case 'FALSE':
				$class_name = 'unchecked';     // Add 'unchecked' class for false.
				$is_checked = '';              // Checkbox is not checked.
				$hidden_value = '0';           // Set hidden value to '0'.
				break;
			default:
				// For other values, return the cell value as is.
				return $cell_value;
		}

		// Return the constructed HTML for the checkbox and hidden value.
		return '<input type="checkbox" class="flexsync-checkbox flexsync-free ' . $class_name . '" ' . $is_checked . '>'
			 . '<p style="visibility: hidden; display: none;">' . $hidden_value . '</p>';
	}




	// phpcs:ignore
	/**
	 * Transforms links to transform the link in to embeed text.
	 *
	 * @param  array  $matched_link The matchedLink links.
	 *
	 * @param  string $string The string url.
	 *
	 * @param string $redirection_type The redirection_type to hold.
	 *
	 * @param  string $link_text The link_text text.
	 *
	 * @param  string $holder_text The link text to hold holder_text value.
	 *
	 * @return mixed
	 */
	public function transform_links( array $matched_link, string $string, $redirection_type, $link_text = '', $holder_text = '' ): string {
		$replaced_string = $string;

		// Sanitize URL and link text to prevent XSS attacks
		if ( '' === $link_text ) {
			$link_text = $this->check_https_in_string( $matched_link[0], true );
		}

		// Sanitize the URL and link text
		$safe_url = esc_url( $this->check_https_in_string( $matched_link[0], true ) );
		$safe_link_text = esc_html( $link_text );
		$safe_redirection = esc_attr( $redirection_type );

		$replaced_string = str_replace( $holder_text, '', $replaced_string );
		$replaced_string = str_replace( $matched_link[0], '<a href="' . $safe_url . '" class="swptls-table-link" target="' . $safe_redirection . '">' . $safe_link_text . '</a>', $replaced_string );

		return (string) $replaced_string;
	}

	/**
	 * Check if the https is in the URL.
	 *
	 * @param string  $string The url string.
	 * @param boolean $add_http  Flag to add http on the url or not.
	 * @return array
	 */
	public function check_https_in_string( string $string, $add_http = false ): string {
		$pattern = '/((https|ftp|file)):\/\//i';
		if ( ! preg_match_all( $pattern, $string, $matches ) ) {
			if ( $add_http ) {
				return 'http://' . $string;
			} else {
				return $string;
			}
		} else {
			return $string;
		}
		return $string;
	}

	/**
	 * Check if the link is already exists.
	 *
	 * @param  string $string The url.
	 * @param  string $settings The url.
	 * @return mixed
	 */
	public function check_link_exists( $string, $settings ) {
		$link_support = get_option('link_support_mode', 'smart_link');

		$redirection_type = ! empty($settings['redirection_type']) ? sanitize_text_field($settings['redirection_type']) : '_blank';

		if ( ! is_string($string) ) {
			return;
		}

		$img_matching_regex = '/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i';

		// Sanitize image URLs to prevent XSS attacks
		if ( filter_var($string, FILTER_VALIDATE_URL) && preg_match($img_matching_regex, $string) ) {
			$safe_img_url = esc_url( $string );
			$safe_alt_text = esc_attr( basename( $string ) );
			return '<img src="' . $safe_img_url . '" alt="' . $safe_alt_text . '"/>';
		}

		// Check for iframe or img tags and return the original string if found.
		if ( preg_match('/<iframe|<img/i', $string) ) {
			return $string;
		}

		$link_pattern = '/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/i';

		$pattern = '/\[(.*?)\]\s*([^\[\]]+)/i';

		if ( preg_match_all($pattern, $string, $matches, PREG_SET_ORDER) ) {
			$replacement = array();
			foreach ( $matches as $match ) {
				// Sanitize link text and URL to prevent XSS attacks
				$link_text = esc_html( $match[1] );
				$link_data = $match[2];

				// Split the $link_data into text and URL.
				if ( preg_match('/^\s*([^[]+)\s*(.*)$/i', $link_data, $url_match) ) {
					$link_url = trim( $url_match[1] );

					// Check if the linkURL starts with "http://" or "https://".
					if ( ! preg_match('/^https?:\/\//i', $link_url) ) {
						// If it doesn't, add "http://" by default.
						$link_url = 'http://' . $link_url;
					}

					// Sanitize the URL to prevent XSS (blocks javascript:, data:, etc.)
					$safe_url = esc_url( $link_url );
					$safe_redirection = esc_attr( $redirection_type );

					// Only create link if URL is valid
					if ( filter_var($safe_url, FILTER_VALIDATE_URL) || strpos($safe_url, 'http') === 0 ) {
						// Create the formatted anchor tag.
						$formatted_link = '<a href="' . $safe_url . '" target="' . $safe_redirection . '">' . $link_text . '</a>' . ' ';
						// Store the replacement in an array.
						$replacement[ $match[0] ] = $formatted_link;
					} else {
						// If URL is invalid, just use the text
						$replacement[ $match[0] ] = $link_text;
					}
				}
			}

			// Replace the original [text] url with the formatted links in the string.
			if ( 'pretty_link' === $link_support ) {
				$string = strtr($string, $replacement);
			}
		} elseif ( preg_match_all($link_pattern, $string, $matches) ) {
			if ( 'pretty_link' === $link_support ) {
				return $this->transform_links($matches[0], $string, '', '', $redirection_type);
			}
		}

		return $string;
	}


	/**
	 * Get the images from google sheet
	 *
	 * @param  string $sheet_id The google sheet id.
	 * @param number $gid      The google sheet grid id.
	 * @return array
	 */
	public function get_images_data( $sheet_id, $gid ) {

		$timeout = get_option( 'timeout_values', 10 );
		$timeout = ! empty( $timeout ) ? (int) $timeout : 10;

		$args = array(
			'timeout' => $timeout,
		);

		$rest_url = sprintf(
			'https://script.google.com/macros/s/AKfycbx1Uj8F5kesVvf98y4sDmCJP9EGcBJhclFSa0zAbuk8dzfPkY6dn-P2AbYOsRaTUAdE9w/exec?sheetID=%s&gID=%s&action=getImages',
			$sheet_id,
			$gid
		);

		$response = wp_remote_get( $rest_url, $args );

		return ! is_wp_error( $response ) ? wp_remote_retrieve_body( $response ) : [];
	}


	/**
	 * Get the sheets embeed links from google sheet
	 *
	 * @param  string $sheet_id The google sheet id.
	 * @param number $gid      The google sheet grid id.
	 * @return array
	 */
	public function get_links_data( $sheet_id, $gid ) {

		$timeout = get_option( 'timeout_values', 10 );
		$timeout = ! empty( $timeout ) ? (int) $timeout : 10;

		$args = array(
			'timeout' => $timeout,
		);

		$rest_url = sprintf(
			'https://script.google.com/macros/s/AKfycbx1Uj8F5kesVvf98y4sDmCJP9EGcBJhclFSa0zAbuk8dzfPkY6dn-P2AbYOsRaTUAdE9w/exec?sheetID=%s&gID=%s&action=getLinks',
			$sheet_id,
			$gid
		);

		$response = wp_remote_get( $rest_url, $args );

		return ! is_wp_error( $response ) ? wp_remote_retrieve_body( $response ) : [];
	}


	/**
	 * Get organized images data for each cell.
	 *
	 * @param string $index      The string index to pickup the images data.
	 * @param array  $images_data The images data retrieved from the sheet.
	 * @param mixed  $cell_data   The current cell data.
	 */
	public function get_organized_image_data( $index, $images_data, $cell_data, $table_settings = [] ) {
		$images_data = ! is_array( $images_data ) ? json_decode( $images_data, 1 ) : null;

		if ( ! $images_data ) {
			return $cell_data;
		}

		if ( isset( $images_data[ $index ] ) ) {
			// Sanitize image URL and dimensions to prevent XSS attacks
			$img_url = esc_url( $images_data[ $index ]['imgUrl'][0] );
			$width = floatval( $images_data[ $index ]['width'] ) + 50;
			$height = floatval( $images_data[ $index ]['height'] ) + 50;

			return '<img src="' . $img_url . '" alt="swptls-image" style="width: ' . esc_attr( $width ) . 'px; height: ' . esc_attr( $height ) . 'px" />';

		}

		return $cell_data;
	}


	/**
	 * Get organized checkbox data for each cell.
	 *
	 * @param string $index      The string index to pickup the images data.
	 * @param array  $check_data The checkbox data retrieved from the sheet.
	 * @param mixed  $cell_data   The current cell data.
	 */
	public function get_custom_checkbox_data( $index, $check_data, $cell_data ) {

		if ( ! is_array( $check_data ) ) {
			// Use true to return an associative array.
			$check_data = json_decode( $check_data, true );

			// If decoding fails, $check_data will be null.
			if ( is_null( $check_data ) ) {
				return $cell_data;
			}
		}

		// Check if the specific index exists in the check_data array.
		if ( isset( $check_data[ $index ] ) ) {
			$status = $check_data[ $index ]['status'];
			$is_checked = ( 'ctrue' === $status ) ? 'checked' : '';
			$class_name = ( 'ctrue' === $status ) ? 'checked' : 'unchecked';
			$hidden_value = ( 'ctrue' === $status ) ? '1' : '0';

			 return '<input type="checkbox" class="flexsync-checkbox flexsync-free ' . $class_name . '" ' . $is_checked . '>'
			 . '<p style="visibility: hidden; display: none;">' . $hidden_value . '</p>';

		}

		return $cell_data;
	}


	/**
	 * Get sheets embeed link data for each cell.
	 *
	 * @param string $index      The string index to pickup the images data.
	 * @param array  $link_data The images data retrieved from the sheet.
	 * @param mixed  $cell_data   The current cell data.
	 * @param mixed  $settings   The current settings data.
	 */
	public function get_transform_simple_link_values( $index, $link_data, $cell_data, $settings ) {
		$link_data = ! is_array($link_data) ? json_decode($link_data, true) : null;

		if ( ! $link_data ) {
			return $cell_data;
		}

		$redirection_type = ! empty($settings['redirection_type']) ? sanitize_text_field($settings['redirection_type']) : '_blank';

		if ( isset($link_data[ $index ]['cellData']) ) {
			$cell_data = $link_data[ $index ]['cellData'];
			$result = '';

			foreach ( $cell_data as $link_item ) {
				// Sanitize both URL and link text to prevent XSS attacks
				$link_url = isset($link_item['linkUrl']) ? esc_url($link_item['linkUrl']) : null;
				$link_text = isset($link_item['linkText']) ? esc_html($link_item['linkText']) : '';

				if ( ! preg_match('/^\[(.*?)\](.*?)$/', $link_text, $matches) ) {
					if ( ! empty($link_url) ) {
						// Validate that the URL is safe (not javascript:, data:, etc.)
						if ( filter_var($link_url, FILTER_VALIDATE_URL) || strpos($link_url, 'http') === 0 ) {
							$result .= '<a href="' . $link_url . '" class="swptls-table-link" target="' . esc_attr($redirection_type) . '">' . $link_text . '</a>' . ' ';
						} else {
							// If URL is invalid, treat as normal text
							$result .= '<span class="swptls-table-normal-text">' . $link_text . '</span>';
						}
					} else {
						// Treat linkUrl as null and add as normal text.
						$result .= '<span class="swptls-table-normal-text">' . $link_text . '</span>';
					}
				}
			}

			return $result;
		}

		return $cell_data;
	}


	/**
	 * Generate the table.
	 *
	 * @param string $name The table name.
	 * @param array  $settings  The table settings.
	 * @param array  $table_data The sheet $table_data.
	 * @param bool   $from_block The request context type.
	 * @param int    $table_id The table ID for backend AI summary.
	 *
	 * @return mixed
	 */
	public function generate_html( $name, $settings, $table_data, $from_block = false, $table_id = 0 ) {
		$table = '';

		$hidden_fields = [
			'hide_column' => $settings['hide_column'] ?? [],
			'hide_rows'   => $settings['hide_rows'] ?? [],
			'hide_cell'   => $settings['hide_cell'] ?? [],
		];

		$is_hidden_column = '';
		$is_hidden_row = '';
		$is_hidden_cell = '';

		/**
		 * Extract theme data based on table_style.
		 */
		$theme_data = [];
		$table_style = isset($settings['table_style']) ? $settings['table_style'] : 'default-style';
		$import_styles_theme_colors = isset($settings['import_styles_theme_colors']) ? $settings['import_styles_theme_colors'] : [];

		if ( isset($import_styles_theme_colors[ $table_style ]) ) {
			$theme_data = $import_styles_theme_colors[ $table_style ];
		}

		$hover_color = isset($theme_data['hoverBGColor']) ? $theme_data['hoverBGColor'] : '#F3F4F6';
		$hover_text_color = isset($theme_data['hoverTextColor']) ? $theme_data['hoverTextColor'] : '#fff';

		$show_title = isset($settings['show_title']) ? wp_validate_boolean($settings['show_title']) : false;

		$show_description = isset($settings['show_description']) ? wp_validate_boolean($settings['show_description']) : false;
		$description_position = isset($settings['description_position']) && in_array($settings['description_position'], [ 'above', 'below' ]) ? $settings['description_position'] : 'above';
		$description = isset($settings['table_description']) ? sanitize_text_field($settings['table_description']) : '';

		// AI Summary settings
		$enable_ai_summary = isset($settings['enable_ai_summary']) ? wp_validate_boolean($settings['enable_ai_summary']) : false;
		$summary_source = isset($settings['summary_source']) ? $settings['summary_source'] : 'generate_on_click';
		$summary_position_goc = isset($settings['summary_position_goc']) && in_array($settings['summary_position_goc'], [ 'above', 'below' ]) ? $settings['summary_position_goc'] : 'below';

		// Determine what to show based on summary_source
		$show_frontend_summary_button = $enable_ai_summary && $summary_source === 'generate_on_click';

		$merged_support = ( isset($settings['merged_support']) && wp_validate_boolean($settings['merged_support']) ) ?? false;
		$checkbox_support = ( isset($settings['checkbox_support']) && wp_validate_boolean($settings['checkbox_support']) ) ?? false;

		$link_support = get_option('link_support_mode', 'smart_link');

		$pagination_center = ( isset($theme_data['pagination_center']) && wp_validate_boolean($theme_data['pagination_center']) ) ?? false;
		$pagination_acive_btn_color = isset($theme_data['paginationAciveBtnColor']) ? $theme_data['paginationAciveBtnColor'] : '#2F80ED';

		$table .= sprintf('<h3 class="swptls-table-title%s" id="swptls-table-title">%s</h3>', $show_title ? '' : ' hidden', $name );

		// Display AI Summary result container above table if position is 'above'
		if ( $show_frontend_summary_button && 'above' === $summary_position_goc ) {
			$table .= $this->render_ai_summary_result_container($table_id, 'above');
		}

		// Display frontend AI Summary button above table (always)
		if ( $show_frontend_summary_button ) {
			$table .= $this->render_ai_summary_button($table_id, $settings, $summary_position_goc);
		}

		if ( 'above' === $description_position && false !== $show_description ) {
			$table .= sprintf('<p class="swptls-table-description%s" id="swptls-table-description">%s</p>', $show_description ? '' : ' hidden', $description );
		}

		$table .= '<table id="create_tables" class="ui celled display table gswpts_tables" style="width:100%;';

		$table .= "--pagination_center: $pagination_center;";
		$table .= "--pagination-colors: $pagination_acive_btn_color;";
		$table .= "--hover-bg-color: $hover_color;";
		$table .= "--hover-text-color: $hover_text_color;";

		$table .= '">';

		if ( is_string($table_data['sheet_data']) ) {
			$tbody = str_getcsv($table_data['sheet_data'], "\n");
			$head = array_shift($tbody);
			$thead = str_getcsv($head, ',');
		}

		$table .= '<thead><tr>';
		$total_count = count($thead);

		if ( isset($settings['hide_column']) ) {
			$hidden_columns = array_flip( (array) $settings['hide_column']);
		} else {
			$hidden_columns = [];
		}

		$row_index = 0;

		for ( $k = 0; $k < $total_count; $k++ ) {
			$is_hidden_column = isset($hidden_columns[ $k ]) ? 'hidden-column' : '';
			$th_style = '';
			$mergetd = '';
			$is_merged_cell = false;

			// Header merge.
			if ( $merged_support && ! empty($table_data['sheet_merged_data']) ) {

				foreach ( $table_data['sheet_merged_data'] as $merged_cell ) {
					$merged_row = $merged_cell['startRow'];
					$start_col = $merged_cell['startCol'];
					$num_rows = $merged_cell['numRows'];
					$num_cols = $merged_cell['numCols'];

					// Check if the current cell is part of a merged range.
					$is_merged_cell = (
						$row_index === $merged_row && $k + 1 === $start_col
					);

					// If the current cell is part of a merged range.
					if ( $is_merged_cell ) {
						// Add classes based on merged cell information.
						if ( $row_index === $merged_row && $k + 1 === $start_col ) {
							$mergetd = 'data-merge="[' . $start_col . ',' . $num_cols . ']"';
						}
						// Break the loop to prevent duplicated attributes.
						break;
					}
				}
			}

			$table .= sprintf(
				'<th style="%s" class="thead-item %s" %s>',
				$th_style,
				$is_hidden_column,
				$mergetd
			);

			$thead_value = $this->transform_boolean_values($this->check_link_exists($thead[ $k ], $settings));
			$table .= $thead_value;

			$table .= '</th>';
		}
		$table .= '</tr></thead>';

		$table .= '<tbody>';
		$count = count($tbody);

		$count = $count > SWPTLS::TBODY_MAX ? SWPTLS::TBODY_MAX : $count;

		for ( $i = 0; $i < $count; $i++ ) {
			$row_data = str_getcsv($tbody[ $i ], ',');
			$row_index = ( $i + 1 );

			$is_hidden_row = isset($settings['hide_rows']) && in_array($row_index, (array) $settings['hide_rows']) ? 'hidden-row' : '';

			$table .= sprintf(
				'<tr class="gswpts_rows row_%1$d %2$s" data-index="%1$d">',
				$row_index,
				$is_hidden_row
			);

			for ( $j = 0; $j < $total_count; ++$j ) {
				$cell_index = ( $j + 1 );
				$c_index = "row_{$row_index}_col_{$j}";

				$cell_data = ( '' === $row_data[ $j ] ) ? '' : $row_data[ $j ];

				/* if ( ! empty($table_data['sheet_images']) ) {
					$cell_data = $this->get_organized_image_data($c_index, $table_data['sheet_images'], $cell_data);
				} */

				if ( ! empty($table_data['sheet_images']) ) {
					$cell_data = $this->get_organized_image_data($c_index, $table_data['sheet_images'], $cell_data, $settings);
				}

				if ( 'smart_link' === $link_support ) {
					if ( ! empty($table_data['sheet_links']) ) {
						$cell_data = $this->get_transform_simple_link_values($c_index, $table_data['sheet_links'], $cell_data, $settings);
					}
				}

				if ( $checkbox_support ) {
					$cell_data = $this->transform_checkbox_values($this->check_link_exists($cell_data, $settings));
				} else {
					$cell_data = $this->transform_boolean_values($this->check_link_exists($cell_data, $settings));
				}

				$is_hidden_column = isset($settings['hide_column']) && in_array($j, (array) $settings['hide_column']) ? 'hidden-column' : '';

				$to_check = sprintf('[%s,%s]', $cell_index, $row_index);

				$is_hidden_cell = isset($hidden_fields['hide_cell']) && in_array($to_check, (array) $hidden_fields['hide_cell']) ? 'hidden-cell' : '';

				$responsive_class = 'wrap_style';
				$cell_style = isset($settings['cell_format']) ? sanitize_text_field($settings['cell_format']) : 'wrap';

				if ( 'expand' === $cell_style ) {
					$responsive_class = 'expanded_style';
				} elseif ( 'clip' === $cell_style ) {
					$responsive_class = 'clip_style';
				}

				$cell_style_attribute = '';

				// Merged support checked.
				$mergetd = '';
				$is_merged_cell = false;

				if ( $merged_support && ! empty($table_data['sheet_merged_data']) ) {
					foreach ( $table_data['sheet_merged_data'] as $merged_cell ) {
						$merged_row = $merged_cell['startRow'];
						$merged_col = $merged_cell['startCol'];
						$num_rows = $merged_cell['numRows'];
						$num_cols = $merged_cell['numCols'];

						// Check if the current cell is part of a merged range.
						$is_merged_cell = (
							$row_index === $merged_row && $j + 1 === $merged_col
						);

						// If the current cell is part of a merged range.
						if ( $is_merged_cell ) {
							// Apply colspan and rowspan attributes.
							$mergetd .= '  colspan="' . $num_cols . '"';
							$mergetd .= '  rowspan="' . $num_rows . '"';
							// Add classes based on merged cell information.
							if ( $row_index === $merged_row && $j + 1 === $merged_col ) {
								$mergetd .= ' class=" parentCellstart"';
								$mergetd .= ' data-merge="[' . $num_cols . ',' . $num_rows . ']"';
							}
							// Break the loop to prevent duplicated attributes.
							break;
						}
					}
				}

				$table .= sprintf(
					'<td %10$s data-index="%1$s" data-column="%5$s" data-content="%2$s" class="cell_index_%3$s %6$s %7$s %8$s" style="%4$s" data-row="%9$s">',
					$to_check,
					"$thead[$j]: &nbsp;",
					( $cell_index ) . '-' . $row_index,
					$cell_style_attribute,
					$j,
					$is_hidden_column,
					$is_hidden_cell,
					$responsive_class,
					$row_index,
					$mergetd
				);

				if ( $is_merged_cell ) {
					// Check if it's the starting cell.
					if ( $j + 1 === $merged_col ) {
						// Starting cell.
						$table .= '<div class="cell_div mergeCellStart">' . $cell_data . '</div>';
					} else {
						// Non-starting cell within a merged range.
						$table .= '<div class="cell_div">' . $cell_data . '</div>';
					}
				} else {
					// Normal cells.
					$table .= '<div class="cell_div">' . $cell_data . '</div>';
				}

				$table .= '</td>';
			}

			$table .= '</tr>';
		}

		$table .= '</tbody>';
		$table .= '</table>';

		$table .= ' <input type="hidden" class="swptls-extra-settings" paging-align-data-id="' . esc_attr( $pagination_center ) . '" paging-color-data-id="' . esc_attr( $pagination_acive_btn_color ) . '">';

		if ( 'below' === $description_position && false !== $show_description ) {
			$table .= sprintf('<p class="swptls-table-description%s" id="swptls-table-description">%s</p>', $show_description ? '' : ' hidden', $description );
		}

		// Display AI Summary result container below table if position is 'below'
		if ( $show_frontend_summary_button && 'below' === $summary_position_goc ) {
			$table .= $this->render_ai_summary_result_container($table_id, 'below');
		}

		return $table;
	}


	/**
	 * Pluck multiple fields from a list and get a new array.
	 *
	 * @param  array $list The item list.
	 * @param  array $fields The fields to pick from the list.
	 * @return array
	 */
	public function swptls_list_pluck_multiple( array $list, array $fields ): array {
		$bucket = [];

		foreach ( $fields as $pick ) {
			if ( isset( $list [ $pick ] ) ) {
				$bucket[ $pick ] = $list [ $pick ];
			} else {
				continue;
			}
		}

		return $bucket;
	}

	/**
	 * A wrapper method to escape data with post allowed html including input field.
	 *
	 * @param string $content The content to escape.
	 * @return string
	 */
	public function swptls_escape_list_item( $content ) {
		$allowed_tags = wp_kses_allowed_html( 'post' );

		$allowed_tags['input'] = [
			'id'          => true,
			'type'        => true,
			'name'        => true,
			'value'       => true,
			'placeholder' => true,
			'class'       => true,
			'data-*'      => true,
			'style'       => true,
			'checked'     => true,
		];

		return wp_kses( $content, $allowed_tags );
	}

	/**
	 * Generate the table.
	 *
	 * @param string $response   The retrieved sheet string data.
	 *
	 * @return array
	 */
	public function convert_csv_to_array( $response ) {
		$tbody = str_getcsv( $response, "\n" );
		$head  = array_shift( $tbody );
		$thead = str_getcsv( $head, ',' );
		$thead = array_map( function ( $value ) {
			return [ 'title' => $value ];
		}, $thead );
		$rows = [];
		$tbody_count = count( $tbody );
		$tbody_count = $tbody_count > SWPTLS::TBODY_MAX ? SWPTLS::TBODY_MAX : $tbody_count;

		for ( $i = 0; $i < $tbody_count; $i++ ) {
			$row_data = str_getcsv( $tbody[ $i ], ',' );

			$rows[] = $row_data;
		}

		return [
			'thead' => $thead,
			'tbody' => $rows,
		];
	}

	/**
	 * Checks plugin version is greater than 2.13.4 (after revamp).
	 *
	 * @since 3.0.0
	 * @return bool
	 */
	public function is_latest_version(): bool {
		return version_compare( SWPTLS_VERSION, '2.13.4', '>' );
	}

	/**
	 * Render AI Summary button for frontend interaction (always above table)
	 *
	 * @param int    $table_id The table ID for AI summary generation
	 * @param array  $settings The table settings
	 * @param string $summary_position_goc The position where result should appear
	 * @return string The formatted HTML for the AI summary button
	 */
	private function render_ai_summary_button( $table_id, $settings = [], $summary_position_goc = 'below' ) {
		if ( empty($table_id) ) {
			return '';
		}

		// Get customizable button settings
		$button_text = isset($settings['summary_button_text']) ? $settings['summary_button_text'] : '✨ Generate Summary';
		$button_bg_color = isset($settings['summary_button_bg_color']) ? $settings['summary_button_bg_color'] : '#3B82F6';
		$button_text_color = isset($settings['summary_button_text_color']) ? $settings['summary_button_text_color'] : '#ffffff';

		$html = '<div class="swptls-ai-summary-controls">';
		$html .= '<button class="swptls-ai-summary-btn-inline" data-table-id="' . esc_attr($table_id) . '" data-position="' . esc_attr($summary_position_goc) . '" title="' . esc_attr(__('Generate AI-powered summary of this table data', 'sheets-to-wp-table-live-sync')) . '" style="background-color: ' . esc_attr($button_bg_color) . '; color: ' . esc_attr($button_text_color) . ';">';
		$html .= '<span class="button-text">' . esc_html($button_text) . '</span>';
		$html .= '</button>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render AI Summary result container based on position
	 *
	 * @param int    $table_id The table ID for AI summary generation
	 * @param string $position The position (above/below)
	 * @return string The formatted HTML for the result container
	 */
	private function render_ai_summary_result_container( $table_id, $position = 'above' ) {
		if ( empty($table_id) ) {
			return '';
		}

		$result_id = 'swptls-ai-summary-result-' . $table_id . '-' . $position;
		$scroll_target_id = 'swptls-ai-summary-scroll-target-' . $table_id;

		$html = '<div class="swptls-ai-summary-result-container" data-position="' . esc_attr($position) . '">';

		// Add scroll target for 'below' position
		if ( $position === 'below' ) {
			$html .= '<div id="' . esc_attr($scroll_target_id) . '" class="ai-summary-scroll-target"></div>';
		}

		$html .= '<div class="swptls-ai-summary-result" id="' . esc_attr($result_id) . '" style="display: none;">';
		$html .= '<div class="summary-header">';
		$html .= '<span class="ai-icon">';
		$html .= '<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">';
		$html .= '<g clip-path="url(#clip0_2856_18445)">
					<path d="M21.4284 11.2353C15.681 11.582 11.0818 16.1813 10.7352 21.9287H10.6932C10.3465 16.1813 5.74734 11.582 0 11.2353V11.1934C5.74734 10.8467 10.3465 6.24744 10.6932 0.5H10.7352C11.0818 6.24744 15.681 10.8467 21.4284 11.1934V11.2353Z" fill="url(#paint0_radial_2856_18445)"/>
					<path d="M24.001 20.2228C21.7021 20.3615 19.8624 22.2012 19.7238 24.5002H19.707C19.5683 22.2012 17.7286 20.3615 15.4297 20.2228V20.2061C17.7286 20.0674 19.5683 18.2277 19.707 15.9287H19.7238C19.8624 18.2277 21.7021 20.0674 24.001 20.2061V20.2228Z" fill="url(#paint1_radial_2856_18445)"/>
					</g>
					<defs>
					<radialGradient id="paint0_radial_2856_18445" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.12658 9.20886) rotate(18.6835) scale(22.8078 182.707)">
					<stop offset="0.0671246" stop-color="#9168C0"/>
					<stop offset="0.342551" stop-color="#5684D1"/>
					<stop offset="0.672076" stop-color="#1BA1E3"/>
					</radialGradient>
					<radialGradient id="paint1_radial_2856_18445" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16.2803 19.4123) rotate(18.6835) scale(9.12314 73.083)">
					<stop offset="0.0671246" stop-color="#9168C0"/>
					<stop offset="0.342551" stop-color="#5684D1"/>
					<stop offset="0.672076" stop-color="#1BA1E3"/>
					</radialGradient>
					<clipPath id="clip0_2856_18445">
					<rect width="24" height="24" fill="white" transform="translate(0 0.5)"/>
					</clipPath>
					</defs>';
		$html .= '</svg>';
		$html .= '<h4 class="summary-title">AI Summary</h4>';
		$html .= '</span>';
		$html .= '<div class="summary-actions">';
		// Regenerate button - visibility controlled by JavaScript based on table settings
		$html .= '<button class="summary-action-btn regenerate-btn" data-table-id="' . esc_attr($table_id) . '" title="Regenerate summary" style="display: none;">';
		$html .= '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
		$html .= '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>';
		$html .= '</svg>';
		$html .= '</button>';
		$html .= '<button class="summary-action-btn close-btn" data-table-id="' . esc_attr($table_id) . '" title="Close summary">';
		$html .= '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
		$html .= '<path d="M18 6L6 18M6 6l12 12"/>';
		$html .= '</svg>';
		$html .= '</button>';
		$html .= '</div>';
		$html .= '</div>';
		$html .= '<div class="summary-content"></div>';
		$html .= '</div>';
		$html .= '</div>';

		return $html;
	}
}
