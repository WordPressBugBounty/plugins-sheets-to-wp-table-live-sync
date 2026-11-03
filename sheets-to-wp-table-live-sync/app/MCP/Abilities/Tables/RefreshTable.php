<?php
/**
 * Tool T10: flextable/refresh-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\CacheService;
use GSWPTS\MCP\Services\SheetAccess;
use GSWPTS\MCP\Services\TableStore;

defined( 'ABSPATH' ) || exit;

/**
 * Clears a table's cache and re-reads the sheet.
 *
 * @since 3.26.0
 */
class RefreshTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/refresh-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Refresh a table', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Clears the cached sheet data of a table so visitors see the latest Google Sheet content, then re-reads the sheet and reports the current row and column counts. Use it after the sheet was edited in Google Sheets.';
	}

	/** {@inheritDoc} */
	public function annotations() {
		return [
			'readonly'    => false,
			'destructive' => false,
			'idempotent'  => true,
			'open_world'  => true,
		];
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'table' => self::table_ref_schema(),
			],
			'required'             => [ 'table' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$table = TableStore::resolve( $input['table'] );
		if ( is_wp_error( $table ) ) {
			return $table;
		}

		$purged = CacheService::purge( $table['id'] );

		$parsed = SheetAccess::parse( $table['source_url'] );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$data = SheetAccess::fetch( $parsed['sheet_id'], $parsed['gid'] );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		return self::ok(
			[
				'table'        => [
					'id'   => $table['id'],
					'name' => $table['table_name'],
				],
				'purged'       => $purged,
				'row_count'    => count( $data['rows'] ),
				'column_count' => count( $data['headers'] ),
				'headers'      => $data['headers'],
			],
			[ 'warnings' => SheetAccess::warnings( $data ) ]
		);
	}
}
