<?php
/**
 * Visible table data: what a desktop visitor sees, never more.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Loads a table's sheet and applies its hide rules.
 *
 * @since 3.26.0
 */
class TableData {

	/**
	 * Loads sheet data for a table and removes hidden columns, rows and cells.
	 *
	 * Hides whenever the lists are set; extensions can switch rules off with
	 * `flextable_mcp_hide_rule_active` (Pro honours its hide_on_desktop_* switches).
	 *
	 * @param array $table Hydrated table.
	 * @return array|WP_Error {headers, rows, hidden:{columns,rows,cells}, total_rows}
	 */
	public static function visible( array $table ) {
		$parsed = SheetAccess::parse( $table['source_url'] );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$data = SheetAccess::fetch( $parsed['sheet_id'], $parsed['gid'] );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		return self::apply_rules( $data, $table['settings'] );
	}

	/**
	 * Applies hide rules to parsed data.
	 *
	 * @param array $data     {headers, rows}.
	 * @param array $settings Stored settings.
	 * @return array
	 */
	public static function apply_rules( array $data, array $settings ) {
		$active = function ( $flag ) use ( $settings ) {
			/**
			 * Filters whether a stored hide rule applies to the data MCP returns.
			 *
			 * FlexTable Pro applies its per-device switches here.
			 *
			 * @since 3.26.0
			 *
			 * @param bool   $active   Default true.
			 * @param string $flag     hide_on_desktop_col|hide_on_desktop_rows|hide_on_desktop_cell.
			 * @param array  $settings Stored settings.
			 */
			return (bool) apply_filters( 'flextable_mcp_hide_rule_active', true, $flag, $settings );
		};

		$hide_columns = $active( 'hide_on_desktop_col' ) && isset( $settings['hide_column'] ) ? array_map( 'intval', (array) $settings['hide_column'] ) : [];
		$hide_rows    = $active( 'hide_on_desktop_rows' ) && isset( $settings['hide_rows'] ) ? array_map( 'intval', (array) $settings['hide_rows'] ) : [];
		$hide_cells   = $active( 'hide_on_desktop_cell' ) && isset( $settings['hide_cell'] ) ? array_map( 'strval', (array) $settings['hide_cell'] ) : [];

		$keep_columns = [];
		foreach ( $data['headers'] as $index => $header ) {
			if ( ! in_array( $index, $hide_columns, true ) ) {
				$keep_columns[] = $index;
			}
		}

		$headers = [];
		foreach ( $keep_columns as $index ) {
			$headers[] = $data['headers'][ $index ];
		}

		$rows         = [];
		$hidden_cells = 0;

		foreach ( $data['rows'] as $i => $row ) {
			$row_number = $i + 1;

			if ( in_array( $row_number, $hide_rows, true ) ) {
				continue;
			}

			$out = [];
			foreach ( $keep_columns as $index ) {
				$cell_key = sprintf( '[%d,%d]', $index + 1, $row_number );
				if ( in_array( $cell_key, $hide_cells, true ) ) {
					$out[] = '';
					$hidden_cells++;
					continue;
				}
				$out[] = isset( $row[ $index ] ) ? $row[ $index ] : '';
			}

			$rows[] = [
				'row'   => $row_number,
				'cells' => $out,
			];
		}

		return [
			'headers'    => $headers,
			'columns'    => array_map(
				function ( $index ) {
					return $index + 1;
				},
				$keep_columns
			),
			'rows'       => $rows,
			'total_rows' => count( $data['rows'] ),
			'hidden'     => [
				'columns' => count( $data['headers'] ) - count( $keep_columns ),
				'rows'    => count( $data['rows'] ) - count( $rows ),
				'cells'   => $hidden_cells,
			],
		];
	}

	/**
	 * Error for tables with user-specific row filtering, unless acknowledged.
	 *
	 * @param array $table Hydrated table.
	 * @param array $input Tool arguments.
	 * @return \WP_Error|null
	 */
	public static function unfiltered_error( array $table, array $input ) {
		if ( ! self::uses_user_filtering( $table['settings'] ) || ! empty( $input['acknowledge_unfiltered'] ) ) {
			return null;
		}
		return new \WP_Error(
			'auth_filtered_table',
			__( 'This table shows each visitor only their own rows. That filtering happens in the browser, so the full sheet is not protected data, but MCP will only use it if you confirm you understand this.', 'sheets-to-wp-table-live-sync' ),
			[ 'hint' => __( 'Ask the user, then call again with acknowledge_unfiltered=true.', 'sheets-to-wp-table-live-sync' ) ]
		);
	}

	/**
	 * Schema fragment for acknowledge_unfiltered.
	 *
	 * @return array
	 */
	public static function acknowledge_schema() {
		return [
			'type'        => 'boolean',
			'default'     => false,
			'description' => 'Required for tables with user-specific row filtering (that filtering is visual only).',
		];
	}

	/**
	 * Whether the table uses user-specific (logged-in) row filtering.
	 *
	 * @param array $settings Stored settings.
	 * @return bool
	 */
	public static function uses_user_filtering( array $settings ) {
		return ! empty( $settings['user_auth_filtering']['enable_auth_auto_select'] )
			|| ( isset( $settings['table_view_mode'] ) && 'user-specific-mode' === $settings['table_view_mode'] );
	}

	/**
	 * Truncates a cell for transport.
	 *
	 * @param string $cell  Cell.
	 * @param int    $limit Characters.
	 * @return string
	 */
	public static function truncate( $cell, $limit = 1000 ) {
		if ( function_exists( 'mb_strlen' ) && mb_strlen( $cell ) > $limit ) {
			return mb_substr( $cell, 0, $limit ) . '…';
		}
		return $cell;
	}
}
