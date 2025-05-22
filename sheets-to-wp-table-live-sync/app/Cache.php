<?php
/**
 * Handles plugin table caching.
 *
 * @since 3.0.0
 * @package SWPTLSPRO
 */

namespace SWPTLS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;
/**
 * Manages plugin Cache.
 *
 * @since 2.12.15
 * @package SWPTLS
 */
class Cache {
	/**
	 * Cache expiration time in seconds.
	 *
	 * @var int
	 */
	const TIMESTAMP_CACHE_TTL = 300; // 5 minutes for timestamp cache.
	const DATA_CACHE_TTL = 2592000; // 30 days for data cache by default.
	const UPDATE_CHECK_FREQUENCY = 300; // 5 minutes between update checks.


	/**
	 * Get sheet last updated timestamp.
	 *
	 * @param  string $sheet_id The sheet ID.
	 * @return mixed
	 */
	public function get_last_sheet_updated_timestamp( string $sheet_id ) {

		$url = 'https://script.google.com/macros/s/AKfycbzBVcMW-7v4avyTH4FJCrogXY8_-TMKBVCvikNRzIKrojHoXXc1zJc2-rJD7P30L6oGXQ/exec';
		$args = [
			'timeout' => 10,
			'headers' => [
				'Content-Type' => 'application/json',
			],
			'body'    => [
				'sheetID' => $sheet_id,
				'action'  => 'lastUpdatedTimestamp',
			],
		];
		$response = wp_remote_get( $url, $args );
		if ( is_wp_error( $response ) ) {
			return false;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		$body          = json_decode( wp_remote_retrieve_body( $response ) );

		if ( 200 !== $response_code || ! isset( $body->lastUpdatedTimestamp ) ) {
			return false;
		}
		return $body->lastUpdatedTimestamp;
	}

	/**
	 * Get the dynamic data cache expiration time.
	 *
	 * @return int
	 */
	public function get_data_cache_ttl() {
		$minutes = get_option('cache_timestamp', 30);
		$cache_ttl = ! empty($minutes) ? (int) $minutes : 30;
		$cache_ttl = $cache_ttl * 60; // Convert minutes to seconds

		return $cache_ttl;
	}

	/**
	 * Get last sheet updated time.
	 *
	 * @param  string $url The sheet url.
	 * @return string
	 */
	public function get_last_sheet_updated_time( string $url ): string {
		$sheet_id     = swptls()->helpers->get_sheet_id( $url );
		$updated_time = $this->get_last_sheet_updated_timestamp( $sheet_id );

		if ( ! $updated_time ) {
			return false;
		}

		return strtotime( $updated_time );
	}


	/**
	 * Set last updated time.
	 *
	 * @param int    $table_id The table ID.
	 * @param string $url The sheet url.
	 */
	public function set_last_updated_time( int $table_id, string $url ): bool {

		if ( empty($url) || $table_id <= 0 ) {
			return false;
		}
		$sheet_id = swptls()->helpers->get_sheet_id($url);

		if ( empty($sheet_id) ) {
			return false;
		}
		// Get the last updated timestamp from Google.
		$last_updated_timestamp_str = $this->get_last_sheet_updated_timestamp($sheet_id);

		if ( $last_updated_timestamp_str === false ) {
			return false;
		}

		// Convert to timestamp.
		$last_updated_timestamp = strtotime($last_updated_timestamp_str);
		$timestamp_key = sprintf('gswpts_sheet_updated_time_%d', $table_id);
		$save_result = update_option($timestamp_key, $last_updated_timestamp, 'no');
		$verified_timestamp = get_option($timestamp_key);

		return $save_result;
	}

	/**
	 * Checks if the sheet has any changes.
	 *
	 * @param  int    $table_id The table id.
	 * @param  string $url The sheet url.
	 * @return boolean
	 */
	public function is_updated( int $table_id, string $url ): bool {
		$option_key = sprintf('gswpts_sheet_updated_time_%d', $table_id);

		// Get the saved timestamp .
		$saved_timestamp = get_option($option_key);
		$sheet_id = swptls()->helpers->get_sheet_id($url);
		if ( empty($sheet_id) ) {
			return false;
		}

		// Get the current sheet update timestamp.
		$current_timestamp_str = $this->get_last_sheet_updated_timestamp($sheet_id);

		if ( $current_timestamp_str === false ) {
			return false;
		}

		$current_timestamp = strtotime($current_timestamp_str);

		// Ensure saved_timestamp is a valid number.
		$saved_timestamp = $saved_timestamp !== false ? intval($saved_timestamp) : 0;
		$is_updated = $current_timestamp > $saved_timestamp;

		return $is_updated;
	}

	/**
	 * Generates a unique cache key for a given table ID and data type.
	 *
	 * @param int    $table_id Table identifier.
	 * @param string $type     Type of data (e.g., 'data', 'styles', 'images').
	 * @return string          Generated cache key.
	 */
	private function get_cache_key( int $table_id, string $type = 'data' ) {
		return sprintf('gswpts_sheet_%s_%d', $type, $table_id);
	}

	/**
	 * Saves data to the WordPress transient cache.
	 *
	 * @param int    $table_id Table identifier.
	 * @param mixed  $data     Data to be cached.
	 * @param string $type     Type of data (default: 'data').
	 * @return bool            True on success, false on failure.
	 */
	private function save_to_cache( int $table_id, $data, string $type = 'data' ) {
		if ( empty($data) || $table_id <= 0 ) {
			return false;
		}

		// Set the cache expiration using a filter to allow customization.
		$expiration = apply_filters('gswpts_cache_expiration', $this->get_data_cache_ttl());
		$key = $this->get_cache_key($table_id, $type);

		return set_transient($key, $data, $expiration);
	}


	/**
	 * Retrieves data from the WordPress transient cache.
	 *
	 * @param int    $table_id Table identifier.
	 * @param string $type     Type of data (default: 'data').
	 * @return mixed|null      Cached data or null if not found or invalid ID.
	 */
	private function get_from_cache( int $table_id, string $type = 'data' ) {
		if ( $table_id <= 0 ) {
			return null;
		}

		$key = $this->get_cache_key($table_id, $type);
		return get_transient($key);
	}

	/**
	 * Save sheet data in transient.
	 *
	 * @param int    $table_id The table ID.
	 * @param string $sheet_response The sheet data to save.
	 * @return void
	 */
	public function save_sheet_data( int $table_id, $sheet_response ) {
		return $this->save_to_cache($table_id, $sheet_response, 'data');
	}

	/**
	 * Get the data from transient.
	 *
	 * @param int $table_id The table id.
	 * @return mixed
	 */
	public function get_saved_sheet_data( int $table_id ) {
		return $this->get_from_cache($table_id, 'data');
	}



	/**
	 * Save the table merge in WordPress transient.
	 *
	 * @param  int    $table_id The table ID.
	 * @param  string $sheet_mergedata The sheet merge data.
	 * @return void
	 */
	public function save_merged_styles( int $table_id, $sheet_mergedata ) {
		return $this->save_to_cache($table_id, $sheet_mergedata, 'merged');
	}

	/**
	 * Save sheet images in transient.
	 *
	 * @param int    $table_id The table ID.
	 * @param string $images_data The sheet images data to save.
	 * @return void
	 */
	public function save_sheet_images( int $table_id, $images_data ) {
		return $this->save_to_cache($table_id, $images_data, 'images');
	}

	/**
	 * Save sheet link in transient.
	 *
	 * @param int $table_id The table ID.
	 * @param int $link_data The table link data.
	 */
	public function save_sheet_link( int $table_id, $link_data ) {
		return $this->save_to_cache($table_id, $link_data, 'link');
	}


	/**
	 * Get saved sheet styles.
	 *
	 * @param  int    $table_id The table id.
	 * @param  string $sheet_url The sheet url.
	 * @return mixed
	 */
	public function get_saved_merge_styles( int $table_id, string $sheet_url ) {
		return $this->get_from_cache($table_id, 'merged');
	}

	/**
	 * Get the table images in WordPress transient.
	 *
	 * @param int    $table_id The table ID.
	 *
	 * @param string $sheet_url The table sheet url.
	 *
	 * @return mixed
	 */
	public function get_saved_sheet_images( $table_id, $sheet_url ) {
		return $this->get_from_cache($table_id, 'images');
	}

	/**
	 * Get the table sheet style link from WordPress transient.
	 *
	 * @param int    $table_id The table ID.
	 *
	 * @param string $sheet_url The table sheet url.
	 */
	public function get_saved_sheet_link_styles( $table_id, $sheet_url ) {
		return $this->get_from_cache($table_id, 'link');
	}
}
