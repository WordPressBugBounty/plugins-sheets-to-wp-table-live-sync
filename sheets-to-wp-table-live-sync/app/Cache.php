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
	 * Get sheet last updated timestamp.
	 *
	 * @param  string $sheet_id The sheet ID.
	 * @return mixed
	 */
	public function get_last_sheet_updated_timestamp( string $sheet_id ) {
		$url = 'https://script.google.com/macros/s/AKfycbxFQqs02vfk887crE4jEK_i9SXnFcaWYpb9qNnvDZe09YL-DmDkFqVELaMB2F7EhzXeFg/exec';
		$args = [
			'timeout' => 10, // Set a reasonable timeout value.
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
		//phpcs:ignore
		if ( 200 !== $response_code || ! isset( $body->lastUpdatedTimestamp ) ) { //phpcs:ignore
			return false;
		}

		return $body->lastUpdatedTimestamp;//phpcs:ignore
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
	public function set_last_updated_time( int $table_id, string $url ) {

		if ( ! $url ) {
			return false;
		}

		$last_updated_timestamp = $this->get_last_sheet_updated_time( $url );

		if ( ! $last_updated_timestamp ) {
			return false;
		}

		$option_key      = sprintf( 'gswpts_sheet_updated_time_%d', $table_id );
		$saved_timestamp = get_option( $option_key );

		if ( $saved_timestamp && ( $saved_timestamp !== $last_updated_timestamp ) ) {
			update_option( $option_key, $last_updated_timestamp );
		} else {
			update_option( $option_key, $last_updated_timestamp );
		}
	}

	/**
	 * Save sheet data in transient.
	 *
	 * @param int    $table_id The table ID.
	 * @param string $sheet_response The sheet data to save.
	 * @return void
	 */
	public function save_sheet_data( int $table_id, $sheet_response ) {
		set_transient( 'gswpts_sheet_data_' . $table_id . '', $sheet_response, ( time() + 86400 * 30 ), '/' );
	}

	/**
	 * Get the data from transient.
	 *
	 * @param int $table_id The table id.
	 * @return mixed
	 */
	public function get_saved_sheet_data( int $table_id ) {
		$transient_key = sprintf( 'gswpts_sheet_data_%d', $table_id );
		$saved         = get_transient( $transient_key ) ? get_transient( $transient_key ) : null;

		if ( ! $saved ) {
			$table     = swptls()->database->table->get( $table_id );
			$sheet_id  = swptls()->helpers->get_sheet_id( $table['source_url'] );
			$sheet_gid = swptls()->helpers->get_grid_id( $table['source_url'] );
			$response  = swptls()->helpers->get_csv_data( $table['source_url'], $sheet_id, $sheet_gid );

			// Save sheet data to local storage.
			$this->save_sheet_data( $table_id, $response );

			// Update the last updated time.
			$this->set_last_updated_time( $table_id, $table['source_url'] );

			return $response;
		}

		return $saved;
	}

	/**
	 * Checks if the sheet has any changes.
	 *
	 * @param  int    $table_id The table id.
	 * @param  string $url The sheet url.
	 * @return boolean
	 */
	public function is_updated( int $table_id, string $url ): bool {
		$updated_timestamp = $this->get_last_sheet_updated_time( $url );
		$saved_timestamp   = get_option( sprintf( 'gswpts_sheet_updated_time_%s', $table_id ) );

		return $saved_timestamp !== $updated_timestamp;
	}


	/**
	 * Get saved sheet styles.
	 *
	 * @param  int    $table_id The table id.
	 * @param  string $sheet_url The sheet url.
	 * @return mixed
	 */
	public function get_saved_merge_styles( int $table_id, string $sheet_url ) {
		$table_id = absint( $table_id );
		$sheet_id = swptls()->helpers->get_sheet_id( $sheet_url );
		$sheet_gid = swptls()->helpers->get_grid_id( $sheet_url );

		$sheet_mergedata = null;

		$sheet_mergedata = get_transient( 'gswpts_sheet_merged_' . $table_id . '' ) ? get_transient( 'gswpts_sheet_merged_' . $table_id . '' ) : null;

		if ( ! $sheet_mergedata ) {
			$sheet_mergedata = swptlspro()->helpers->get_merged_styles( $sheet_id, $sheet_gid );

			// Save sheet merge data to local storage.
			$this->save_merged_styles( $table_id, $sheet_mergedata );
		}

		return $sheet_mergedata;
	}

	/**
	 * Save the table merge in WordPress transient.
	 *
	 * @param  int    $table_id The table ID.
	 * @param  string $sheet_mergedata The sheet merge data.
	 * @return void
	 */
	public function save_merged_styles( int $table_id, $sheet_mergedata ) {
		set_transient( 'gswpts_sheet_merged_' . $table_id . '', $sheet_mergedata, ( time() + 86400 * 30 ), '/' );
	}

	/**
	 * Save sheet images in transient.
	 *
	 * @param int    $table_id The table ID.
	 * @param string $images_data The sheet images data to save.
	 * @return void
	 */
	public function save_sheet_images( int $table_id, $images_data ) {
		set_transient( 'gswpts_sheet_images_' . $table_id . '', $images_data, ( time() + 86400 * 30 ), '/' );
	}

	/**
	 * Save sheet link in transient.
	 *
	 * @param int $table_id The table ID.
	 * @param int $link_data The table link data.
	 */
	public function save_sheet_link( int $table_id, $link_data ) {
		set_transient( 'gswpts_sheet_link_' . $table_id . '', $link_data, ( time() + 86400 * 30 ), '/' );
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
		$images_data = null;

		$images_data = get_transient( 'gswpts_sheet_images_' . $table_id . '' ) ? get_transient( 'gswpts_sheet_images_' . $table_id . '' ) : null;

		if ( ! $images_data ) {
			$sheet_id = swptls()->helpers->get_sheet_id( $sheet_url );
			$sheet_gid = swptls()->helpers->get_grid_id( $sheet_url );
			$images_data = swptlspro()->helpers->get_images_data( $sheet_id, $sheet_gid );

			// save sheet data to local storage.
			$this->save_sheet_images( $table_id, $images_data );
			// update the last updated time.
			$this->set_last_updated_time( $table_id, $sheet_url );
		}

		return $images_data;
	}

	/**
	 * Get the table sheet style link from WordPress transient.
	 *
	 * @param int    $table_id The table ID.
	 *
	 * @param string $sheet_url The table sheet url.
	 */
	public function get_saved_sheet_link_styles( $table_id, $sheet_url ) {
		$link_data = null;

		$link_data = get_transient( 'gswpts_sheet_link_' . $table_id . '' ) ? get_transient( 'gswpts_sheet_link_' . $table_id . '' ) : null;

		if ( ! $link_data ) {
			$sheet_id = swptls()->helpers->get_sheet_id( $sheet_url );
			$sheet_gid = swptls()->helpers->get_grid_id( $sheet_url );
			$link_data = swptlspro()->helpers->get_links_data( $sheet_id, $sheet_gid );

			// save sheet data to local storage.
			$this->save_sheet_link( $table_id, $link_data );
			// update the last updated time.
			$this->set_last_updated_time( $table_id, $sheet_url );
		}

		return $link_data;
	}
}
