<?php
/**
 * Tool T11: flextable/change-table-source.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Safety\ConfirmationService;
use GSWPTS\MCP\Services\CacheService;
use GSWPTS\MCP\Services\ContentService;
use GSWPTS\MCP\Services\SheetAccess;
use GSWPTS\MCP\Services\TableStore;

defined( 'ABSPATH' ) || exit;

/**
 * Points a table at another public sheet or worksheet.
 *
 * @since 3.26.0
 */
class ChangeTableSource extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/change-table-source';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Change a table’s Google Sheet', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Points an existing table at another public Google Sheet or worksheet (GID), keeping its settings. The preview (dry_run, default true) compares the columns and lists settings that refer to column positions. If the table is shown on a published page, applying needs the confirmation_token from the preview.';
	}

	/** {@inheritDoc} */
	public function annotations() {
		return [
			'readonly'    => false,
			'destructive' => true,
			'idempotent'  => true,
			'open_world'  => true,
		];
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'table'              => self::table_ref_schema(),
				'sheet_url'          => [
					'type'      => 'string',
					'maxLength' => 2048,
				],
				'gid'                => [
					'type'    => 'string',
					'pattern' => '^[0-9]{1,12}$',
				],
				'dry_run'            => self::dry_run_schema( true ),
				'confirmation_token' => self::confirmation_schema(),
			],
			'required'             => [ 'table', 'sheet_url' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$table = TableStore::resolve( $input['table'] );
		if ( is_wp_error( $table ) ) {
			return $table;
		}

		$parsed = SheetAccess::parse( $input['sheet_url'], isset( $input['gid'] ) ? $input['gid'] : null );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$new = SheetAccess::fetch( $parsed['sheet_id'], $parsed['gid'] );
		if ( is_wp_error( $new ) ) {
			return $new;
		}

		$old_headers = [];
		$old_parsed  = SheetAccess::parse( $table['source_url'] );
		if ( ! is_wp_error( $old_parsed ) ) {
			$old = SheetAccess::fetch( $old_parsed['sheet_id'], $old_parsed['gid'] );
			if ( ! is_wp_error( $old ) ) {
				$old_headers = $old['headers'];
			}
		}

		$settings = $table['settings'];
		$review   = [];
		foreach ( [ 'hide_column', 'hide_column_mobile', 'hide_cell', 'hide_cell_mobile', 'table_search_column' ] as $key ) {
			if ( ! empty( $settings[ $key ] ) ) {
				$review[] = $key;
			}
		}
		if ( ! empty( $settings['column_filtering']['column_filters'] ) ) {
			$review[] = 'column_filtering.column_filters';
		}
		if ( ! empty( $settings['allow_singleshort'] ) ) {
			$review[] = 'sort_column';
		}

		$placements = ContentService::placements_of_table( $table['id'] );
		$live       = ContentService::has_live_placement( $placements );

		$result = [
			'table'                   => [
				'id'   => $table['id'],
				'name' => $table['table_name'],
			],
			'from'                    => is_wp_error( $old_parsed ) ? null : [
				'sheet_id' => $old_parsed['sheet_id'],
				'gid'      => $old_parsed['gid'],
			],
			'to'                      => [
				'sheet_id'   => $parsed['sheet_id'],
				'gid'        => $parsed['gid'],
				'gid_source' => $parsed['gid_source'],
				'row_count'  => count( $new['rows'] ),
			],
			'column_compatibility'    => [
				'old_headers' => $old_headers,
				'new_headers' => $new['headers'],
				'added'       => array_values( array_diff( $new['headers'], $old_headers ) ),
				'removed'     => array_values( array_diff( $old_headers, $new['headers'] ) ),
				'same_order'  => $old_headers === $new['headers'],
			],
			'settings_needing_review' => $review,
			'affected_posts'          => $placements,
		];

		$versions = TableStore::version( $table );
		$args     = $input;

		if ( ! empty( $input['dry_run'] ) ) {
			$extra = [ 'dry_run' => true ];
			if ( $live ) {
				$extra['confirmation'] = ConfirmationService::issue( $this->name(), $args, $versions, __( 'Change the Google Sheet of a table shown on published content.', 'sheets-to-wp-table-live-sync' ) );
			}
			return self::ok( $result, $extra );
		}

		if ( $live ) {
			$confirmed = ConfirmationService::consume( isset( $input['confirmation_token'] ) ? $input['confirmation_token'] : '', $this->name(), $args, $versions );
			if ( is_wp_error( $confirmed ) ) {
				return $confirmed;
			}
		}

		$snapshot = TableStore::save( $table, [ 'source_url' => $parsed['canonical_url'] ] );
		if ( is_wp_error( $snapshot ) ) {
			return $snapshot;
		}
		CacheService::purge( $table['id'] );

		return self::ok( $result, [ 'snapshot_id' => $snapshot ] );
	}
}
