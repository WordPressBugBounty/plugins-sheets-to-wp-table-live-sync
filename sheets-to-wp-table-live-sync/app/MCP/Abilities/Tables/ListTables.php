<?php
/**
 * Tool T04: flextable/list-tables.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\ContentService;
use GSWPTS\MCP\Services\SheetAccess;
use GSWPTS\MCP\Services\TableStore;

defined( 'ABSPATH' ) || exit;

/**
 * Lists and searches tables.
 *
 * @since 3.26.0
 */
class ListTables extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/list-tables';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'List tables', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Lists FlexTable tables, newest first, with ID, name, source worksheet, active style and how many pages/posts show it. Filter by name, by Google Sheet URL or by a page/post ID. Each result has a list_position you can use as a table reference ({"list_position":1}) for 30 minutes. Read-only.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'search'    => [
					'type'        => 'string',
					'maxLength'   => 200,
					'description' => 'Part of the table name.',
				],
				'sheet_url' => [
					'type'      => 'string',
					'maxLength' => 2048,
				],
				'in_post'   => [
					'type'        => 'integer',
					'minimum'     => 1,
					'description' => 'Only tables placed on this page/post ID.',
				],
				'page'      => [
					'type'    => 'integer',
					'minimum' => 1,
					'default' => 1,
				],
				'per_page'  => [
					'type'    => 'integer',
					'minimum' => 1,
					'maximum' => 50,
					'default' => 20,
				],
			],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$tables = TableStore::all();

		if ( ! empty( $input['search'] ) ) {
			$needle = strtolower( (string) $input['search'] );
			$tables = array_values(
				array_filter(
					$tables,
					function ( $t ) use ( $needle ) {
						return false !== strpos( strtolower( $t['table_name'] ), $needle );
					}
				)
			);
		}

		if ( ! empty( $input['sheet_url'] ) ) {
			$wanted = SheetAccess::parse( $input['sheet_url'] );
			if ( is_wp_error( $wanted ) ) {
				return $wanted;
			}
			$check_gid = false !== strpos( (string) $input['sheet_url'], 'gid=' );
			$tables    = array_values(
				array_filter(
					$tables,
					function ( $t ) use ( $wanted, $check_gid ) {
						$p = SheetAccess::parse( $t['source_url'] );
						return ! is_wp_error( $p ) && $p['sheet_id'] === $wanted['sheet_id'] && ( ! $check_gid || $p['gid'] === $wanted['gid'] );
					}
				)
			);
		}

		if ( ! empty( $input['in_post'] ) ) {
			$post = get_post( (int) $input['in_post'] );
			$ids  = $post ? ContentService::embeds_in( $post->post_content )['tables'] : [];
			$tables = array_values(
				array_filter(
					$tables,
					function ( $t ) use ( $ids ) {
						return in_array( $t['id'], $ids, true );
					}
				)
			);
		}

		$per_page = isset( $input['per_page'] ) ? (int) $input['per_page'] : 20;
		$page     = isset( $input['page'] ) ? (int) $input['page'] : 1;
		$total    = count( $tables );
		$slice    = array_slice( $tables, ( $page - 1 ) * $per_page, $per_page );

		TableStore::remember_list( wp_list_pluck( $slice, 'id' ) );

		$items = [];
		foreach ( $slice as $i => $table ) {
			$brief      = TableStore::brief( $table );
			$placements = ContentService::placements_of_table( $table['id'] );

			$items[] = [
				'list_position' => $i + 1,
				'id'            => $table['id'],
				'name'          => $table['table_name'],
				'sheet_id'      => $brief['sheet_id'],
				'gid'           => $brief['gid'],
				'style'         => isset( $table['settings']['table_style'] ) ? $table['settings']['table_style'] : 'default-style',
				'ai_summary'    => ! empty( $table['settings']['enable_ai_summary'] ),
				'placements'    => count( $placements ),
				'shortcode'     => TableStore::shortcode( $table['id'] ),
			];
		}

		return self::ok(
			[
				'tables'      => $items,
				'total'       => $total,
				'page'        => $page,
				'total_pages' => (int) ceil( $total / max( 1, $per_page ) ),
			]
		);
	}
}
