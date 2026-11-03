<?php
/**
 * Tool T14: flextable/list-themes.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Themes;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\TableStore;
use GSWPTS\MCP\Services\ThemeService;

defined( 'ABSPATH' ) || exit;

/**
 * Styles and themes available on this site.
 *
 * @since 3.26.0
 */
class ListThemes extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/list-themes';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'List themes', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Lists the table styles and themes available on this site, with the tables where each one is active (and, for saved themes, the tables that have it). Pass name to get one theme with all its properties. Read-only.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'name' => [
					'type'      => 'string',
					'maxLength' => 64,
				],
			],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$tables   = TableStore::all();
		$defaults = TableStore::default_settings();
		$wanted   = isset( $input['name'] ) ? strtolower( (string) $input['name'] ) : '';
		$themes   = [];

		$active_counts = [];
		foreach ( $tables as $table ) {
			$style                    = isset( $table['settings']['table_style'] ) ? $table['settings']['table_style'] : 'default-style';
			$active_counts[ $style ][] = $table['id'];
		}

		foreach ( ThemeService::builtins() as $id => $info ) {
			if ( $wanted && $wanted !== $id && $wanted !== strtolower( $info[0] ) ) {
				continue;
			}
			$item = [
				'name'      => $id,
				'label'     => $info[0],
				'kind'      => 'builtin',
				'edition'   => $info[1],
				'active_on' => isset( $active_counts[ $id ] ) ? $active_counts[ $id ] : [],
			];
			if ( $wanted && isset( $defaults['import_styles_theme_colors'][ $id ] ) ) {
				$item['properties'] = $defaults['import_styles_theme_colors'][ $id ];
			}
			$themes[] = $item;
		}

		/**
		 * Filters the themes listed by flextable/list-themes.
		 *
		 * FlexTable Pro adds the custom themes saved on tables here.
		 *
		 * @since 3.26.0
		 *
		 * @param array  $themes Listed themes.
		 * @param string $wanted Lower-case name filter, or ''.
		 * @param array  $tables Hydrated tables.
		 */
		$themes = (array) apply_filters( 'flextable_mcp_list_themes', $themes, $wanted, $tables );

		return self::ok(
			[
				'themes' => array_values( $themes ),
			]
		);
	}
}
