<?php
/**
 * Tool T16: flextable/apply-theme.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Themes;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\TableStore;
use GSWPTS\MCP\Services\ThemeService;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Switches tables to a style or theme.
 *
 * @since 3.26.0
 */
class ApplyTheme extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/apply-theme';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Apply a theme to tables', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Makes a style or theme the active look of one or more tables. Use a name from flextable-list-themes. theme=default-style resets the look. Returns a snapshot_id per table for undo.';
	}

	/** {@inheritDoc} */
	public function annotations() {
		return [
			'readonly'    => false,
			'destructive' => false,
			'idempotent'  => true,
			'open_world'  => false,
		];
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'tables'    => [
					'type'     => 'array',
					'minItems' => 1,
					'maxItems' => 20,
					'items'    => self::table_ref_schema(),
				],
				'theme'     => [
					'type'      => 'string',
					'minLength' => 1,
					'maxLength' => 64,
				],
				'dry_run'   => self::dry_run_schema(),
			],
			'required'             => [ 'tables', 'theme' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$resolved = ThemeService::resolve( (string) $input['theme'] );
		if ( ! $resolved ) {
			return ThemeService::not_found();
		}

		$theme      = $resolved['name'];
		$properties = $resolved['properties'];

		/**
		 * Filters per-table theme overrides for flextable/apply-theme.
		 *
		 * Extensions that add arguments to the tool (see
		 * flextable_mcp_ability_input_schema) turn them into stored theme keys here.
		 *
		 * @since 3.26.0
		 *
		 * @param array $extension {overrides: array, warnings: [{code, message}]}.
		 * @param array $input     Tool arguments.
		 * @param string $theme    Resolved theme name.
		 */
		$extension = apply_filters(
			'flextable_mcp_apply_theme_overrides',
			[
				'overrides' => [],
				'warnings'  => [],
			],
			$input,
			$theme
		);
		if ( is_wp_error( $extension ) ) {
			return $extension;
		}

		$overrides = isset( $extension['overrides'] ) && is_array( $extension['overrides'] ) ? $extension['overrides'] : [];
		$defaults  = TableStore::default_settings();
		$tables    = [];

		foreach ( $input['tables'] as $ref ) {
			$table = TableStore::resolve( $ref );
			if ( is_wp_error( $table ) ) {
				return $table;
			}
			$tables[] = $table;
		}

		$results = [];
		foreach ( $tables as $table ) {
			$settings = $table['settings'];
			$colors   = isset( $settings['import_styles_theme_colors'] ) && is_array( $settings['import_styles_theme_colors'] ) ? $settings['import_styles_theme_colors'] : [];

			if ( ! isset( $colors[ $theme ] ) ) {
				if ( null !== $properties ) {
					$colors[ $theme ] = $properties;
				} elseif ( isset( $defaults['import_styles_theme_colors'][ $theme ] ) ) {
					$colors[ $theme ] = $defaults['import_styles_theme_colors'][ $theme ];
				}
			}

			if ( $overrides ) {
				$colors[ $theme ] = array_merge( isset( $colors[ $theme ] ) ? (array) $colors[ $theme ] : [], $overrides );
			}

			$from                                   = isset( $settings['table_style'] ) ? $settings['table_style'] : 'default-style';
			$settings['import_styles_theme_colors'] = $colors;
			$settings['table_style']                = $theme;

			$row = [
				'table_id' => $table['id'],
				'name'     => $table['table_name'],
				'from'     => $from,
				'to'       => $theme,
			];

			$row['no_op'] = $settings === $table['settings'];

			if ( empty( $input['dry_run'] ) && ! $row['no_op'] ) {
				$snapshot = TableStore::save( $table, [ 'settings' => $settings ] );
				if ( is_wp_error( $snapshot ) ) {
					return $snapshot;
				}
				$row['snapshot_id'] = $snapshot;
			}

			$results[] = $row;
		}

		$warnings = [];
		foreach ( isset( $extension['warnings'] ) ? (array) $extension['warnings'] : [] as $warning ) {
			if ( isset( $warning['code'], $warning['message'] ) ) {
				$warnings[] = self::warning( $warning['code'], $warning['message'] );
			}
		}

		return self::ok(
			[
				'theme'     => $theme,
				'overrides' => $overrides,
				'tables'    => $results,
			],
			[
				'dry_run'  => ! empty( $input['dry_run'] ),
				'warnings' => $warnings,
			]
		);
	}
}
