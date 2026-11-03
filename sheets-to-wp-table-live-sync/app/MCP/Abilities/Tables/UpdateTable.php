<?php
/**
 * Tool T08: flextable/update-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\CacheService;
use GSWPTS\MCP\Services\SettingsSchema;
use GSWPTS\MCP\Services\TableStore;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Renames a table and changes its settings.
 *
 * @since 3.26.0
 */
class UpdateTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/update-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Update a table', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Renames a table, changes its description, and changes or resets settings. Only the settings you pass change (see flextable-describe-settings for keys and allowed values). Returns a before/after diff and a snapshot_id for undo. If any setting is invalid or not available on this site, nothing is saved (or pass skip_unavailable=true to save the rest and skip settings this site does not have). Presentation only: this never changes the Google Sheet. Use dry_run to preview.';
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
				'table'            => self::table_ref_schema(),
				'name'             => [
					'type'      => 'string',
					'minLength' => 1,
					'maxLength' => 200,
				],
				'description'      => [
					'type'      => 'string',
					'maxLength' => 2000,
				],
				'settings'         => [
					'type'                 => 'object',
					'additionalProperties' => true,
					'description'          => 'Settings to change, e.g. {"pagination":false,"search_bar":true}.',
				],
				'reset'            => [
					'description' => 'Reset settings to the defaults: "all" or a list of setting keys.',
					'oneOf'       => [
						[
							'type' => 'string',
							'enum' => [ 'all' ],
						],
						[
							'type'     => 'array',
							'maxItems' => 100,
							'items'    => [ 'type' => 'string' ],
						],
					],
				],
				'skip_unavailable' => [
					'type'        => 'boolean',
					'default'     => false,
					'description' => 'Save the valid settings and skip the ones this site does not have.',
				],
				'dry_run'          => self::dry_run_schema(),
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

		$patch = isset( $input['settings'] ) && is_array( $input['settings'] ) ? $input['settings'] : [];
		if ( isset( $input['description'] ) ) {
			$patch['table_description'] = $input['description'];
		}

		$normalized = SettingsSchema::normalize( $patch );
		$warnings   = [];

		$errors = $normalized['errors'];
		if ( $normalized['unsupported'] && ! empty( $input['skip_unavailable'] ) ) {
			$errors = array_values(
				array_filter(
					$errors,
					function ( $error ) {
						return 'unknown_setting' !== $error['reason'];
					}
				)
			);
			$warnings[] = self::warning( 'settings_skipped', sprintf( 'Skipped (not available on this site): %s', implode( ', ', $normalized['unsupported'] ) ) );
		}

		if ( $errors ) {
			return new WP_Error(
				'settings_invalid',
				__( 'Some settings are not valid or not available on this site. Nothing was saved.', 'sheets-to-wp-table-live-sync' ),
				[
					'hint'    => __( 'See details, or call flextable-describe-settings.', 'sheets-to-wp-table-live-sync' ),
					'details' => [ 'errors' => $errors ],
				]
			);
		}

		$before_settings = $table['settings'];
		$settings        = $before_settings;

		// Reset first, then apply the patch.
		if ( ! empty( $input['reset'] ) ) {
			$keys     = 'all' === $input['reset'] ? array_keys( SettingsSchema::definitions() ) : (array) $input['reset'];
			$defaults = TableStore::default_settings();
			$values   = [];
			foreach ( $keys as $key ) {
				if ( ! isset( SettingsSchema::definitions()[ $key ] ) ) {
					return new WP_Error( 'unknown_setting', sprintf( 'Unknown setting in reset: %s', $key ) );
				}
				$values[ $key ] = SettingsSchema::public_value( $key, $defaults, $defaults );
			}
			$settings = SettingsSchema::apply( $settings, $values );
		}

		$settings = SettingsSchema::apply( $settings, $normalized['values'] );
		$settings = self::auto_correct( $settings, $warnings, $table );

		$before = SettingsSchema::readable( $before_settings );
		$after  = SettingsSchema::readable( $settings );
		$diff   = [];
		foreach ( $after as $key => $value ) {
			if ( $before[ $key ] !== $value ) {
				$diff[] = [
					'setting' => $key,
					'from'    => $before[ $key ],
					'to'      => $value,
				];
			}
		}

		$name    = isset( $input['name'] ) ? sanitize_text_field( $input['name'] ) : $table['table_name'];
		$renamed = $name !== $table['table_name'];
		if ( $renamed ) {
			$diff[] = [
				'setting' => 'name',
				'from'    => $table['table_name'],
				'to'      => $name,
			];
		}

		$result = [
			'table'   => [
				'id'   => $table['id'],
				'name' => $name,
			],
			'changes' => $diff,
			'no_op'   => empty( $diff ),
		];

		if ( ! empty( $input['dry_run'] ) || empty( $diff ) ) {
			return self::ok(
				$result,
				[
					'dry_run'  => ! empty( $input['dry_run'] ),
					'warnings' => $warnings,
				]
			);
		}

		$snapshot = TableStore::save(
			$table,
			[
				'table_name' => $name,
				'settings'   => $settings,
			]
		);
		if ( is_wp_error( $snapshot ) ) {
			return $snapshot;
		}

		// Render options are baked into the cached sheet data: start fresh.
		CacheService::purge( $table['id'] );

		$saved    = TableStore::get( $table['id'] );
		$verified = $saved && SettingsSchema::readable( $saved['settings'] ) === $after && $saved['table_name'] === $name;

		return self::ok(
			$result,
			[
				'warnings'     => $warnings,
				'snapshot_id'  => $snapshot,
				'verification' => [
					'verified' => $verified,
					'checked'  => [ 'settings_saved' ],
				],
			]
		);
	}

	/**
	 * Fixes combinations the dashboard also corrects.
	 *
	 * @param array $settings Settings.
	 * @param array $warnings Warnings (by reference).
	 * @return array
	 */
	private static function auto_correct( array $settings, array &$warnings, array $table ) {
		if ( ! empty( $settings['enable_ai_summary'] ) && ! \GSWPTS\MCP\Services\SummaryService::provider_configured() ) {
			$warnings[] = self::warning( 'ai_not_configured', __( 'The AI summary is on, but no AI provider key is set in FlexTable → Settings → AI Configuration.', 'sheets-to-wp-table-live-sync' ) );
		}

		/**
		 * Lets extensions fix setting combinations their dashboard also corrects.
		 *
		 * @since 3.26.0
		 *
		 * @param array $state {settings: array, warnings: [{code, message}]}.
		 * @param array $table Hydrated table (before the change).
		 */
		$state = apply_filters(
			'flextable_mcp_settings_auto_correct',
			[
				'settings' => $settings,
				'warnings' => [],
			],
			$table
		);

		if ( is_array( $state ) && isset( $state['settings'] ) && is_array( $state['settings'] ) ) {
			$settings = $state['settings'];
			foreach ( isset( $state['warnings'] ) ? (array) $state['warnings'] : [] as $warning ) {
				if ( isset( $warning['code'], $warning['message'] ) ) {
					$warnings[] = self::warning( $warning['code'], $warning['message'] );
				}
			}
		}

		return $settings;
	}
}
