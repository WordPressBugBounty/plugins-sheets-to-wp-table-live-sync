<?php
/**
 * Clears FlexTable's cached sheet data for one table.
 *
 * FlexTable has no public cache-clear method (Source Audit §3.3), so the
 * known transient and option keys of Free and Pro are deleted directly.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Cache purging.
 *
 * @since 3.26.0
 */
class CacheService {

	/**
	 * Deletes all cached data of a table.
	 *
	 * @param int $table_id Table ID.
	 * @return string[] Purged keys.
	 */
	public static function purge( $table_id ) {
		$table_id = (int) $table_id;
		$purged   = [];

		foreach ( [ 'data', 'merged', 'styles', 'images', 'link' ] as $kind ) {
			$key = 'gswpts_sheet_' . $kind . '_' . $table_id;
			delete_transient( $key );
			$purged[] = $key;
		}

		delete_option( 'gswpts_sheet_updated_time_' . $table_id );
		$purged[] = 'gswpts_sheet_updated_time_' . $table_id;

		return $purged;
	}
}
