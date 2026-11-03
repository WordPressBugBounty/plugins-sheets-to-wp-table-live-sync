<?php
/**
 * Tool T01: flextable/get-status.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Discovery;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Abilities\Registrar;
use GSWPTS\MCP\Environment\Edition;
use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Safety\RateLimiter;
use GSWPTS\MCP\Server\Protocol;
use GSWPTS\MCP\Server\ToolCatalog;
use GSWPTS\MCP\Services\SettingsSchema;
use GSWPTS\MCP\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Connection, edition, available tools and policies.
 *
 * @since 3.26.0
 */
class GetStatus extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/get-status';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Get FlexTable status', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'START HERE. Returns the FlexTable version, which extensions (such as FlexTable Pro) added tools, which tools are available on this site (and why others are not), the site policies for publishing and deleting, rate limits and the row/column conventions. Read-only. Pass "check" with tool names or setting keys to ask whether they are supported.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'check' => [
					'type'        => 'array',
					'maxItems'    => 20,
					'items'       => [
						'type'      => 'string',
						'maxLength' => 100,
					],
					'description' => 'Optional tool names (e.g. "flextable-save-theme") or setting keys (e.g. "merged_support") to check.',
				],
			],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$enabled     = [];
		$unavailable = [];

		foreach ( Registrar::handlers() as $name => $handler ) {
			$state = $handler->availability();
			$tool  = ToolCatalog::tool_name( $name );
			if ( true === $state ) {
				$enabled[] = $tool;
			} else {
				$unavailable[] = [
					'tool'   => $tool,
					'reason' => $state->get_error_code(),
				];
			}
		}

		$checks = [];
		if ( ! empty( $input['check'] ) ) {
			$definitions = SettingsSchema::definitions();
			foreach ( $input['check'] as $item ) {
				$item = (string) $item;
				if ( in_array( $item, $enabled, true ) ) {
					$checks[] = [
						'item'      => $item,
						'available' => true,
					];
				} elseif ( isset( $definitions[ $item ] ) ) {
					$checks[] = [
						'item'      => $item,
						'available' => true,
					];
				} else {
					$found = null;
					foreach ( $unavailable as $row ) {
						if ( $row['tool'] === $item ) {
							$found = $row['reason'];
						}
					}
					$checks[] = [
						'item'      => $item,
						'available' => false,
						'reason'    => $found ? $found : 'not_supported',
					];
				}
			}
		}

		$limits = [];
		foreach ( RateLimiter::limits() as $bucket => $limit ) {
			$limits[ $bucket ] = [
				'max'            => $limit[0],
				'window_seconds' => $limit[1],
			];
		}

		$user     = wp_get_current_user();
		$settings = Settings::all();

		return self::ok(
			[
				'server'      => [
					'name'               => 'flextable',
					'version'            => MCP::VERSION,
					'protocol_versions'  => array_merge( Protocol::MODERN_VERSIONS, Protocol::LEGACY_VERSIONS ),
					'connector_url'      => MCP::connector_url(),
				],
				'flextable'   => Edition::summary(),
				'user'        => [
					'display_name' => $user ? $user->display_name : '',
				],
				'tools'       => [
					'enabled'     => $enabled,
					'unavailable' => $unavailable,
				],
				'policies'    => [
					'publishing'    => $settings['publishing'],
					'allow_deletes' => $settings['allow_deletes'],
					'data_reads'    => $settings['data_reads'],
				],
				'limits'      => $limits,
				'conventions' => [
					'columns' => 'Col #1 is the first column of the sheet.',
					'rows'    => 'Row #1 is the first data row below the header row.',
					'cells'   => 'A cell is "Col #3, Row #4".',
					'colours' => 'Hex only (#rrggbb). Convert colour names yourself.',
				],
				'unsupported' => SettingsSchema::not_supported(),
				'checks'      => $checks,
			]
		);
	}
}
