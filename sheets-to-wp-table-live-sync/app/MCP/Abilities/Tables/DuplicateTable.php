<?php
/**
 * Tool T12: flextable/duplicate-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\SheetAccess;
use GSWPTS\MCP\Services\TableStore;

defined( 'ABSPATH' ) || exit;

/**
 * Copies a table (optionally onto another worksheet).
 *
 * Re-implemented with get + insert because FlexTable's copied_table() has a
 * fatal error path (Source Audit §12 b).
 *
 * @since 3.26.0
 */
class DuplicateTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/duplicate-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Duplicate a table', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Copies a table with all its settings and theme. Optionally give a new name and/or another public sheet URL (and GID) for the copy. The copy is not placed on any page.';
	}

	/** {@inheritDoc} */
	public function annotations() {
		return [
			'readonly'    => false,
			'destructive' => false,
			'idempotent'  => false,
			'open_world'  => true,
		];
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'table'     => self::table_ref_schema(),
				'name'      => [
					'type'      => 'string',
					'minLength' => 1,
					'maxLength' => 200,
				],
				'sheet_url' => [
					'type'      => 'string',
					'maxLength' => 2048,
				],
				'gid'       => [
					'type'    => 'string',
					'pattern' => '^[0-9]{1,12}$',
				],
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

		$source = $table['source_url'];

		if ( ! empty( $input['sheet_url'] ) ) {
			$parsed = SheetAccess::parse( $input['sheet_url'], isset( $input['gid'] ) ? $input['gid'] : null );
			if ( is_wp_error( $parsed ) ) {
				return $parsed;
			}
			$data = SheetAccess::fetch( $parsed['sheet_id'], $parsed['gid'] );
			if ( is_wp_error( $data ) ) {
				return $data;
			}
			$source = $parsed['canonical_url'];
		}

		$name = ! empty( $input['name'] ) ? $input['name'] : 'copy of ' . $table['table_name'];

		$settings = $table['settings'];
		unset( $settings['backend_ai_summary'] );
		$settings['backend_summary_exists'] = false;

		$id = TableStore::insert( $name, $source, $settings );
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		return self::ok( CreateTable::describe( TableStore::get( $id ) ) );
	}
}
