<?php
/**
 * Tool T05: flextable/get-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\ContentService;
use GSWPTS\MCP\Services\SettingsSchema;
use GSWPTS\MCP\Services\TableData;
use GSWPTS\MCP\Services\TableStore;
use GSWPTS\MCP\Services\ThemeService;

defined( 'ABSPATH' ) || exit;

/**
 * Full table details.
 *
 * @since 3.26.0
 */
class GetTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/get-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Get a table', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Returns one table: name, source worksheet, shortcode, every setting in the same form flextable-update-table accepts, active style, AI summary state and the pages/posts that show it (plus extra details such as hidden items or tab groups when the site has those features). With include_columns=true it also fetches the sheet headers. Read-only.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'table'           => self::table_ref_schema(),
				'include_columns' => [
					'type'        => 'boolean',
					'default'     => false,
					'description' => 'Fetch the current column headers from Google Sheets.',
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

		$settings = $table['settings'];
		$brief    = TableStore::brief( $table );
		$style    = isset( $settings['table_style'] ) ? (string) $settings['table_style'] : 'default-style';
		$builtins = ThemeService::builtins();

		$result = [
			'id'         => $table['id'],
			'name'       => $table['table_name'],
			'shortcode'  => TableStore::shortcode( $table['id'] ),
			'edit_url'   => TableStore::edit_url( $table['id'] ),
			'source'     => [
				'sheet_id' => $brief['sheet_id'],
				'gid'      => $brief['gid'],
				'url'      => $table['source_url'],
			],
			'style'      => [
				'id'     => $style,
				'label'  => isset( $builtins[ $style ] ) ? $builtins[ $style ][0] : $style,
				'custom' => ! isset( $builtins[ $style ] ),
			],
			'settings'   => SettingsSchema::readable( $settings ),
			'ai_summary' => [
				'enabled'      => ! empty( $settings['enable_ai_summary'] ),
				'source'       => isset( $settings['summary_source'] ) ? $settings['summary_source'] : 'generate_on_click',
				'saved_exists' => ! empty( $settings['backend_summary_exists'] ),
			],
			'user_specific_filtering' => TableData::uses_user_filtering( $settings ),
			'placements' => ContentService::placements_of_table( $table['id'] ),
		];

		/**
		 * Filters the flextable/get-table result.
		 *
		 * FlexTable Pro adds the hidden columns/rows/cells and the tab groups
		 * that contain the table.
		 *
		 * @since 3.26.0
		 *
		 * @param array $result Result.
		 * @param array $table  Hydrated table.
		 */
		$result = (array) apply_filters( 'flextable_mcp_table_details', $result, $table );

		$warnings = [];

		if ( ! empty( $input['include_columns'] ) ) {
			$data = TableData::visible( $table );
			if ( is_wp_error( $data ) ) {
				$warnings[] = self::warning( $data->get_error_code(), $data->get_error_message() );
			} else {
				$columns = [];
				foreach ( $data['headers'] as $i => $header ) {
					$columns[] = [
						'column' => 'Col #' . $data['columns'][ $i ],
						'header' => $header,
					];
				}
				$result['columns']   = $columns;
				$result['row_count'] = $data['total_rows'];
			}
		}

		return self::ok( $result, [ 'warnings' => $warnings ] );
	}
}
