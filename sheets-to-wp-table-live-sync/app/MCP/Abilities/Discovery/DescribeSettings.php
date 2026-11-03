<?php
/**
 * Tool T02: flextable/describe-settings.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Discovery;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\SettingsSchema;
use GSWPTS\MCP\Services\TableStore;
use GSWPTS\MCP\Services\ThemeService;

defined( 'ABSPATH' ) || exit;

/**
 * Settings schema with allowed values, as available on this site.
 *
 * @since 3.26.0
 */
class DescribeSettings extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/describe-settings';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Describe table settings', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Lists every table setting you can change on this site with flextable-update-table: type, allowed values, default and group. Also lists the built-in styles, theme properties where available, and features FlexTable does not have. Read-only. Call this before changing settings you are unsure about.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'group'                    => [
					'type' => 'string',
					'enum' => SettingsSchema::groups(),
				],
				'keys'                     => [
					'type'     => 'array',
					'maxItems' => 50,
					'items'    => [ 'type' => 'string' ],
				],
				'include_theme_properties' => [
					'type'    => 'boolean',
					'default' => false,
				],
			],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$defaults = TableStore::default_settings();
		$settings = [];

		foreach ( SettingsSchema::definitions() as $key => $def ) {
			if ( ! empty( $input['group'] ) && $input['group'] !== $def['group'] ) {
				continue;
			}
			if ( ! empty( $input['keys'] ) && ! in_array( $key, $input['keys'], true ) ) {
				continue;
			}

			$row = [
				'key'         => $key,
				'group'       => $def['group'],
				'type'        => $def['type'],
				'edition'     => $def['edition'],
				'default'     => SettingsSchema::public_value( $key, $defaults, $defaults ),
				'description' => $def['description'],
			];

			if ( isset( $def['values'] ) ) {
				$row['allowed'] = $def['values'];
			}
			if ( isset( $def['min'] ) ) {
				$row['min'] = $def['min'];
				$row['max'] = $def['max'];
			}
			if ( isset( $def['max_length'] ) ) {
				$row['max_length'] = $def['max_length'];
			}

			$settings[] = $row;
		}

		$result = [
			'settings'      => $settings,
			'not_changeable_here' => SettingsSchema::read_only(),
			'not_supported' => SettingsSchema::not_supported(),
			'colour_format' => 'Hex only: #rgb, #rgba, #rrggbb or #rrggbbaa.',
		];

		if ( ! empty( $input['include_theme_properties'] ) ) {
			$builtins = [];
			foreach ( ThemeService::builtins() as $id => $info ) {
				$builtins[] = [
					'id'      => $id,
					'label'   => $info[0],
					'edition' => $info[1],
				];
			}
			$result['builtin_styles'] = $builtins;
		}

		/**
		 * Filters the flextable/describe-settings result.
		 *
		 * FlexTable Pro adds the custom theme properties here.
		 *
		 * @since 3.26.0
		 *
		 * @param array $result Result.
		 * @param array $input  Tool arguments.
		 */
		$result = (array) apply_filters( 'flextable_mcp_describe_settings', $result, $input );

		return self::ok( $result );
	}
}
