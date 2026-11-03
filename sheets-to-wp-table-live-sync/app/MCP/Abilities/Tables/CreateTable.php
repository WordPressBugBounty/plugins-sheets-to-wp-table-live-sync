<?php
/**
 * Tool T07: flextable/create-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Safety\RequestContext;
use GSWPTS\MCP\Services\SettingsSchema;
use GSWPTS\MCP\Services\SheetAccess;
use GSWPTS\MCP\Services\TableStore;
use GSWPTS\MCP\Services\ThemeService;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Creates a table from a public Google Sheet, like the dashboard does.
 *
 * @since 3.26.0
 */
class CreateTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/create-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Create a table', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Creates a FlexTable table from a public Google Sheet worksheet, with the same defaults as the dashboard. No GID means gid 0, like the dashboard. Optional: description, theme (a style or theme listed by flextable-list-themes) and settings (see flextable-describe-settings; the whole call fails if a setting is invalid or not available on this site). Use dry_run to preview. Pass an idempotency_key so a retried call does not create a second table. Returns the table ID and shortcode; the table is not placed on any page.';
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
				'sheet_url'              => [
					'type'      => 'string',
					'maxLength' => 2048,
				],
				'gid'                    => [
					'type'    => 'string',
					'pattern' => '^[0-9]{1,12}$',
				],
				'name'                   => [
					'type'      => 'string',
					'minLength' => 1,
					'maxLength' => 200,
				],
				'description'            => [
					'type'      => 'string',
					'maxLength' => 2000,
				],
				'theme'                  => [
					'type'        => 'string',
					'maxLength'   => 64,
					'description' => 'A style id or theme name from flextable-list-themes (e.g. default-style).',
				],
				'settings'               => [
					'type'                 => 'object',
					'additionalProperties' => true,
					'description'          => 'Settings to change from the defaults, e.g. {"search_bar":true,"default_rows_per_page":10}.',
				],
				'allow_duplicate_source' => [
					'type'    => 'boolean',
					'default' => false,
				],
				'idempotency_key'        => [
					'type'    => 'string',
					'pattern' => '^[A-Za-z0-9_-]{8,64}$',
				],
				'dry_run'                => self::dry_run_schema(),
			],
			'required'             => [ 'sheet_url', 'name' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$idem_key = '';
		if ( ! empty( $input['idempotency_key'] ) ) {
			$idem_key = 'flextable_mcp_idem_' . md5( RequestContext::caller_key() . '|' . $input['idempotency_key'] );
			$existing = get_transient( $idem_key );
			if ( $existing && TableStore::get( (int) $existing ) ) {
				$table = TableStore::get( (int) $existing );
				return self::ok(
					self::describe( $table ),
					[ 'warnings' => [ self::warning( 'idempotent_replay', __( 'This idempotency_key was already used, so the existing table is returned and nothing new was created.', 'sheets-to-wp-table-live-sync' ) ) ] ]
				);
			}
		}

		$parsed = SheetAccess::parse( $input['sheet_url'], isset( $input['gid'] ) ? $input['gid'] : null );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$warnings = [];
		if ( 'default' === $parsed['gid_source'] ) {
			$warnings[] = self::warning( 'gid_defaulted', __( 'No GID was given, so gid 0 was used (same as the dashboard). Check the headers below.', 'sheets-to-wp-table-live-sync' ) );
		}

		// Duplicate source check.
		$same = [];
		foreach ( TableStore::all() as $table ) {
			$other = SheetAccess::parse( $table['source_url'] );
			if ( ! is_wp_error( $other ) && $other['sheet_id'] === $parsed['sheet_id'] && $other['gid'] === $parsed['gid'] ) {
				$same[] = TableStore::brief( $table );
			}
		}
		if ( $same && empty( $input['allow_duplicate_source'] ) ) {
			return new WP_Error(
				'duplicate_source',
				__( 'A table already uses this worksheet.', 'sheets-to-wp-table-live-sync' ),
				[
					'hint'    => __( 'Use the existing table, or ask the user and call again with allow_duplicate_source=true.', 'sheets-to-wp-table-live-sync' ),
					'details' => [ 'existing_tables' => $same ],
				]
			);
		}

		// Settings.
		$settings = TableStore::default_settings();
		$patch    = isset( $input['settings'] ) && is_array( $input['settings'] ) ? $input['settings'] : [];
		if ( isset( $input['description'] ) ) {
			$patch['table_description'] = $input['description'];
		}

		$normalized = SettingsSchema::normalize( $patch );
		if ( $normalized['errors'] ) {
			return new WP_Error(
				'settings_invalid',
				__( 'Some settings are not valid. Nothing was created.', 'sheets-to-wp-table-live-sync' ),
				[
					'hint'    => __( 'See details, or call flextable-describe-settings.', 'sheets-to-wp-table-live-sync' ),
					'details' => [ 'errors' => $normalized['errors'] ],
				]
			);
		}
		$settings = SettingsSchema::apply( $settings, $normalized['values'] );

		// Theme.
		if ( ! empty( $input['theme'] ) ) {
			$themed = self::apply_theme( $settings, (string) $input['theme'] );
			if ( is_wp_error( $themed ) ) {
				return $themed;
			}
			$settings = $themed;
		}

		// Check the sheet (FlexTable's own public check).
		$data = SheetAccess::fetch( $parsed['sheet_id'], $parsed['gid'] );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		if ( ! $data['headers'] ) {
			return new WP_Error( 'empty_sheet', __( 'The worksheet is empty, so no table was created.', 'sheets-to-wp-table-live-sync' ) );
		}
		$warnings = array_merge( $warnings, SheetAccess::warnings( $data ) );

		$source = [
			'sheet_id'     => $parsed['sheet_id'],
			'gid'          => $parsed['gid'],
			'gid_source'   => $parsed['gid_source'],
			'row_count'    => count( $data['rows'] ),
			'column_count' => count( $data['headers'] ),
			'headers'      => $data['headers'],
		];

		if ( ! empty( $input['dry_run'] ) ) {
			return self::ok(
				[
					'planned'          => [
						'name'       => sanitize_text_field( $input['name'] ),
						'source_url' => $parsed['canonical_url'],
						'style'      => isset( $settings['table_style'] ) ? $settings['table_style'] : 'default-style',
					],
					'source'           => $source,
					'settings_changed' => array_keys( $normalized['values'] ),
				],
				[
					'dry_run'  => true,
					'warnings' => $warnings,
				]
			);
		}

		$id = TableStore::insert( $input['name'], $parsed['canonical_url'], $settings );
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		if ( $idem_key ) {
			set_transient( $idem_key, $id, DAY_IN_SECONDS );
		}

		$table = TableStore::get( $id );

		return self::ok(
			array_merge(
				self::describe( $table ),
				[
					'source'     => $source,
					'next_steps' => [ 'flextable-embed-table', 'flextable-apply-theme', 'flextable-update-table' ],
				]
			),
			[
				'warnings'     => $warnings,
				'verification' => [
					'verified' => (bool) $table,
					'checked'  => [ 'row_saved' ],
				],
			]
		);
	}

	/**
	 * Short description of a created table.
	 *
	 * @param array $table Hydrated table.
	 * @return array
	 */
	public static function describe( array $table ) {
		return [
			'table' => [
				'id'        => $table['id'],
				'name'      => $table['table_name'],
				'shortcode' => TableStore::shortcode( $table['id'] ),
				'edit_url'  => TableStore::edit_url( $table['id'] ),
				'style'     => isset( $table['settings']['table_style'] ) ? $table['settings']['table_style'] : 'default-style',
			],
		];
	}

	/**
	 * Applies a style or theme to new settings.
	 *
	 * @param array  $settings Settings.
	 * @param string $theme    Theme id/name.
	 * @return array|WP_Error
	 */
	private static function apply_theme( array $settings, $theme ) {
		$resolved = ThemeService::resolve( $theme );

		if ( ! $resolved ) {
			return ThemeService::not_found();
		}

		if ( null !== $resolved['properties'] ) {
			$settings['import_styles_theme_colors'][ $resolved['name'] ] = $resolved['properties'];
		}
		$settings['table_style'] = $resolved['name'];

		return $settings;
	}
}
