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
	 *
	 * @param  string $url     The sheet url.
	 * @param  string $sheet_id The sheet ID.
	 * @param  int    $gid     The sheet tab id.
	 * @return string|WP_Error
	 */
	public function get_csv_data( string $url, string $sheet_id, int $gid ) {
		$url      = $this->prepare_export_url( $sheet_id, $gid );
		$response = wp_remote_get( $url );

		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'private_sheet', __( 'You are offline.', 'sheetstowptable' ) );
		}

		$headers = $response['headers'];

		if ( ! isset( $headers['X-Frame-Options'] ) || 'DENY' === $headers['X-Frame-Options'] ) {
			wp_send_json_error([
				'message' => __( 'Sheet is not public or shared', 'sheetstowptable' ),
				'type'    => 'private_sheet',
			]);
		}

		$csv_data = wp_remote_retrieve_body( $response );

		$sanitized_csv_data = wp_kses_post( $csv_data );

		return $sanitized_csv_data;
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
			return new \WP_Error( 'feature_not_compatible', __( 'The feature is not compatible or something went wrong', 'sheetstowptable' ) );
		}

		$url = sprintf( 'https://script.google.com/macros/s/AKfycbzBVcMW-7v4avyTH4FJCrogXY8_-TMKBVCvikNRzIKrojHoXXc1zJc2-rJD7P30L6oGXQ/exec?sheetID=%1$s&gID=%2$d&action=getMergedCells', $sheet_id, $gid );

		$response = wp_remote_get( $url );

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
		$table = swptls()->database->table->get($table_id);

		// Decode JSON settings.
		$table_settings = ! empty($table['table_settings']) ? json_decode(wp_unslash($table['table_settings']), true) : [];
		$table_cache = isset($table_settings['table_cache']) ? wp_validate_boolean($table_settings['table_cache']) : false;

		$merged_support = isset($table_settings['merged_support']) ? wp_validate_boolean($table_settings['merged_support']) : false;

		$table_img_support = isset($table_settings['table_img_support']) ? wp_validate_boolean($table_settings['table_img_support']) : false;
		$table_link_support = isset($table_settings['table_link_support']) ? wp_validate_boolean($table_settings['table_link_support']) : false;

		$sheet_id = swptls()->helpers->get_sheet_id($sheet_url);
		$sheet_gid = swptls()->helpers->get_grid_id($sheet_url);

		// Helper functions to get data.
		$get_csv_data = function () use ( $sheet_url, $sheet_id, $sheet_gid ) {
			return swptls()->helpers->get_csv_data($sheet_url, $sheet_id, $sheet_gid);
		};

		if ( $merged_support ) {
			$get_merged_style = function () use ( $sheet_id, $sheet_gid ) {
				return $this->get_merged_styles($sheet_id, $sheet_gid);
			};
		}

		if ( $table_img_support ) {
			$get_images_data = function () use ( $sheet_id, $sheet_gid ) {
				return $this->get_images_data($sheet_id, $sheet_gid);
			};
		}

		if ( $table_link_support ) {
			$get_links_data = function () use ( $sheet_id, $sheet_gid ) {
				return $this->get_links_data($sheet_id, $sheet_gid);
			};
		}

			/**
			 * Cache not active: Direct fetch data from Google Sheets.
			 */

		if ( ! $table_cache ) {

			$response['sheet_data'] = $get_csv_data();

			if ( $merged_support ) {
				$response['sheet_merged_data'] = $get_merged_style();
			}

			if ( $table_img_support ) {
				$response['sheet_images'] = $get_images_data();
			}
			if ( $table_link_support ) {
				$response['sheet_links'] = $get_links_data();
			}

			return $response;
		}

			$is_sheet_updated = swptls()->cache->is_updated($table_id, $sheet_url);
			$is_url_updated = esc_url($sheet_url) !== esc_url($table['source_url']);

		if ( $is_sheet_updated || $editor_mode ) {
			swptls()->cache->set_last_updated_time($table_id, $sheet_url);

			// Get and cache data.
			$csv_data = $get_csv_data();
			$response['sheet_data'] = $csv_data;
			swptls()->cache->save_sheet_data($table_id, $csv_data);

			if ( $merged_support ) {
				$sheet_merged_data = $get_merged_style();
				$response['sheet_merged_data'] = $sheet_merged_data;
					swptls()->cache->save_merged_styles($table_id, $sheet_merged_data);
			}

			if ( $table_img_support ) {
				$sheet_images = $get_images_data();
				$response['sheet_images'] = $sheet_images;
				swptls()->cache->save_sheet_images($table_id, $sheet_images);
			}

			if ( $table_link_support ) {
				$sheet_links = $get_links_data();
				$response['sheet_links'] = $sheet_links;
				swptls()->cache->save_sheet_link($table_id, $sheet_links);
			}

				return $response;
		}

			// Retrieve cached data.
			$response['sheet_data'] = swptls()->cache->get_saved_sheet_data($table_id, $sheet_url);

		if ( $merged_support ) {
			$response['sheet_merged_data'] = swptls()->cache->get_saved_merge_styles($table_id, $sheet_url);
		}

		if ( $table_img_support ) {
			$response['sheet_images'] = swptls()->cache->get_saved_sheet_images($table_id, $sheet_url, $sheet_gid);
		}
		if ( $table_link_support ) {
			$response['sheet_links'] = swptls()->cache->get_saved_sheet_link_styles($table_id, $sheet_url, $sheet_gid);
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

		// If link text is empty load default link as link text.
		if ( '' === $link_text ) {
			$link_text = $this->check_https_in_string( $matched_link[0], true );
		}
		$replaced_string = str_replace( $holder_text, '', $replaced_string );
		$replaced_string = str_replace( $matched_link[0], '<a href="' . $this->check_https_in_string( $matched_link[0], true ) . '" class="swptls-table-link" target="' . $redirection_type . '">' . $link_text . '</a>', $replaced_string );

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

		// Check for image URLs and return the image tag.
		if ( filter_var($string, FILTER_VALIDATE_URL) && preg_match($img_matching_regex, $string) ) {
			return '<img src="' . $string . '" alt="' . $string . '"/>';
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
				$link_text = $match[1];
				$link_data = $match[2];

				// Split the $link_data into text and URL.
				if ( preg_match('/^\s*([^[]+)\s*(.*)$/i', $link_data, $url_match) ) {
					$link_url = $url_match[1];
					// Check if the linkURL starts with "http://" or "https://".
					if ( ! preg_match('/^https?:\/\//i', $link_url) ) {
						// If it doesn't, add "http://" by default.
						$link_url = 'http://' . $link_url; // phpcs:ignore.
					}
					// Create the formatted anchor tag.
					// phpcs:ignore.
					$formatted_link = '<a href="' . $link_url . '" target="' . $redirection_type . '">' . $link_text . '</a>' . ' '; // phpcs:ignore.
					// Store the replacement in an array.
					$replacement[ $match[0] ] = $formatted_link;
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
		$rest_url = sprintf(
			'https://script.google.com/macros/s/AKfycbzBVcMW-7v4avyTH4FJCrogXY8_-TMKBVCvikNRzIKrojHoXXc1zJc2-rJD7P30L6oGXQ/exec?sheetID=%s&gID=%s&action=getImages',
			$sheet_id,
			$gid
		);

		$response = wp_remote_get( $rest_url );

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

		$rest_url = sprintf(
			'https://script.google.com/macros/s/AKfycbzBVcMW-7v4avyTH4FJCrogXY8_-TMKBVCvikNRzIKrojHoXXc1zJc2-rJD7P30L6oGXQ/exec?sheetID=%s&gID=%s&action=getLinks',
			$sheet_id,
			$gid
		);

		$response = wp_remote_get( $rest_url );

		return ! is_wp_error( $response ) ? wp_remote_retrieve_body( $response ) : [];
	}


	/**
	 * Get organized images data for each cell.
	 *
	 * @param string $index      The string index to pickup the images data.
	 * @param array  $images_data The images data retrieved from the sheet.
	 * @param mixed  $cell_data   The current cell data.
	 */
	public function get_organized_image_data( $index, $images_data, $cell_data ) {
		$images_data = ! is_array( $images_data ) ? json_decode( $images_data, 1 ) : null;

		if ( ! $images_data ) {
			return $cell_data;
		}

		if ( isset( $images_data[ $index ] ) ) {

			$img_url = $images_data[ $index ]['imgUrl'][0];
			$width = $images_data[ $index ]['width'];
			$height = $images_data[ $index ]['height'];

			return '<img src="' . $img_url . '" alt="swptls-image" style="width: ' . ( floatval( $width ) + 50 ) . 'px; height: ' . ( floatval( $height ) + 50 ) . 'px" />';
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
				$link_url = isset($link_item['linkUrl']) ? htmlspecialchars($link_item['linkUrl']) : null;
				$link_text = $link_item['linkText'];

				if ( ! preg_match('/^\[(.*?)\](.*?)$/', $link_text, $matches) ) {
					if ( ! empty($link_url) ) {
						$result .= '<a href="' . $link_url . '" class="swptls-table-link" target="' . $redirection_type . '">' . $link_text . '</a>' . ' '; //phpcs:ignore
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
	 *
	 * @return mixed
	 */
	public function generate_html( $name, $settings, $table_data, $from_block = false ) {
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

		$show_title = isset($settings['show_title']) ? wp_validate_boolean($settings['show_title']) : false;

		$show_description = isset($settings['show_description']) ? wp_validate_boolean($settings['show_description']) : false;
		$description_position = isset($settings['description_position']) && in_array($settings['description_position'], [ 'above', 'below' ]) ? $settings['description_position'] : 'above';
		$description = isset($settings['table_description']) ? sanitize_text_field($settings['table_description']) : '';

		$merged_support = ( isset($settings['merged_support']) && wp_validate_boolean($settings['merged_support']) ) ?? false;
		$checkbox_support = ( isset($settings['checkbox_support']) && wp_validate_boolean($settings['checkbox_support']) ) ?? false;

		$link_support = get_option('link_support_mode', 'smart_link');

		$pagination_center = ( isset($theme_data['pagination_center']) && wp_validate_boolean($theme_data['pagination_center']) ) ?? false;
		$pagination_acive_btn_color = isset($theme_data['paginationAciveBtnColor']) ? $theme_data['paginationAciveBtnColor'] : '#2F80ED';

		$table .= sprintf('<h3 class="swptls-table-title%s" id="swptls-table-title">%s</h3>', $show_title ? '' : ' hidden', $name );

		if ( 'above' === $description_position && false !== $show_description ) {
			$table .= sprintf('<p class="swptls-table-description%s" id="swptls-table-description">%s</p>', $show_description ? '' : ' hidden', $description );
		}

		$table .= '<table id="create_tables" class="ui celled display table gswpts_tables" style="width:100%;';

		$table .= "--pagination_center: $pagination_center;";
		$table .= "--pagination-colors: $pagination_acive_btn_color;";
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

				$cell_data = ( $row_data[ $j ] === '' ) ? '' : $row_data[ $j ];

				if ( ! empty($table_data['sheet_images']) ) {
					$cell_data = $this->get_organized_image_data($c_index, $table_data['sheet_images'], $cell_data);
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
}
