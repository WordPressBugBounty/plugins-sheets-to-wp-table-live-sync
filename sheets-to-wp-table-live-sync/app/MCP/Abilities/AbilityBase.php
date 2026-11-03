<?php
/**
 * Base class for FlexTable abilities.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities;

use GSWPTS\MCP\Environment\Edition;
use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Server\Endpoint;
use GSWPTS\MCP\Settings;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * One ability = one MCP tool. Subclasses describe the tool and implement
 * execute(); this class handles registration, policy gating and
 * the shared result envelope.
 *
 * @since 3.26.0
 */
abstract class AbilityBase {

	/**
	 * Ability name, e.g. "flextable/get-status".
	 *
	 * @return string
	 */
	abstract public function name();

	/**
	 * Short title.
	 *
	 * @return string
	 */
	abstract public function label();

	/**
	 * Description written for an AI agent.
	 *
	 * @return string
	 */
	abstract public function description();

	/**
	 * JSON Schema of the arguments (type object).
	 *
	 * @return array
	 */
	abstract public function input_schema();

	/**
	 * Runs the tool with validated input.
	 *
	 * @param array $input Arguments.
	 * @return array|WP_Error Envelope from self::ok() or an error.
	 */
	abstract protected function execute( array $input );

	/**
	 * Input schema after extensions had their say.
	 *
	 * @return array
	 */
	public function schema() {
		$schema = $this->input_schema();

		/**
		 * Filters the input schema of a FlexTable MCP tool.
		 *
		 * FlexTable Pro uses it to add Pro-only arguments (e.g. colour
		 * overrides on flextable/apply-theme).
		 *
		 * @since 3.26.0
		 *
		 * @param array  $schema Input schema (type object).
		 * @param string $name   Ability name.
		 */
		$filtered = apply_filters( 'flextable_mcp_ability_input_schema', $schema, $this->name() );

		return is_array( $filtered ) ? $filtered : $schema;
	}

	/**
	 * Behaviour hints: readonly, destructive, idempotent, open_world.
	 *
	 * @return array
	 */
	public function annotations() {
		return [
			'readonly'    => true,
			'destructive' => false,
			'idempotent'  => true,
			'open_world'  => false,
		];
	}

	/**
	 * Edition label shown in the tool list: "free", or "pro" for tools added by FlexTable Pro.
	 *
	 * @return string
	 */
	public function edition() {
		return 'free';
	}

	/**
	 * Policy key that can switch the tool off (deletes, data_reads), or ''.
	 *
	 * @return string
	 */
	public function policy() {
		return '';
	}

	/**
	 * Whether the tool can be used right now.
	 *
	 * @return true|WP_Error
	 */
	public function availability() {
		$policy = $this->policy();

		if ( 'deletes' === $policy && ! Settings::get( 'allow_deletes' ) ) {
			return new WP_Error(
				'policy_disabled',
				__( 'Deleting through MCP is turned off on this site.', 'sheets-to-wp-table-live-sync' ),
				[ 'hint' => __( 'An administrator can allow it in FlexTable → Settings → MCP → Policies.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		if ( 'data_reads' === $policy && ! Settings::get( 'data_reads' ) ) {
			return new WP_Error(
				'data_reads_disabled',
				__( 'Reading table data through MCP is turned off on this site.', 'sheets-to-wp-table-live-sync' ),
				[ 'hint' => __( 'An administrator can allow it in FlexTable → Settings → MCP → Policies.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		return true;
	}

	/**
	 * Registers the ability with the core Abilities API.
	 *
	 * @return void
	 */
	public function register() {
		$annotations = $this->annotations();

		$schema = $this->schema();
		if ( ! isset( $schema['default'] ) ) {
			$schema['default'] = [];
		}

		wp_register_ability(
			$this->name(),
			[
				'label'               => $this->label(),
				'description'         => $this->description(),
				'category'            => MCP::CATEGORY,
				'input_schema'        => $schema,
				'output_schema'       => self::envelope_schema(),
				'execute_callback'    => [ $this, 'run' ],
				'permission_callback' => [ $this, 'permission' ],
				'meta'                => [
					// Only the MCP endpoint (strict mode, audit log, rate limits) runs these tools.
					'show_in_rest' => false,
					'annotations'  => [
						'readonly'    => (bool) $annotations['readonly'],
						'destructive' => (bool) $annotations['destructive'],
						'idempotent'  => (bool) $annotations['idempotent'],
					],
					'mcp'          => [ 'public' => false ],
					'flextable'    => [
						'edition'    => $this->edition(),
						'open_world' => (bool) $annotations['open_world'],
						'policy'     => $this->policy(),
					],
				],
			]
		);
	}

	/**
	 * Permission callback.
	 *
	 * @return bool
	 */
	public function permission() {
		return current_user_can( Endpoint::required_capability() );
	}

	/**
	 * Execute callback: gating, then execute().
	 *
	 * @param mixed $input Validated input.
	 * @return array|WP_Error
	 */
	public function run( $input = [] ) {
		$available = $this->availability();
		if ( is_wp_error( $available ) ) {
			return $available;
		}

		$input = is_array( $input ) ? $input : [];

		// Core validates input but does not fill property defaults, so apply
		// them here (e.g. dry_run=true by default on consequential tools).
		$schema = $this->schema();
		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			foreach ( $schema['properties'] as $key => $definition ) {
				if ( ! array_key_exists( $key, $input ) && is_array( $definition ) && array_key_exists( 'default', $definition ) ) {
					$input[ $key ] = $definition['default'];
				}
			}
		}

		try {
			return $this->execute( $input );
		} catch ( \Throwable $e ) {
			return new WP_Error(
				'internal_error',
				__( 'Unexpected error while running the tool.', 'sheets-to-wp-table-live-sync' ),
				[ 'details' => [ 'ref' => substr( md5( $e->getMessage() . microtime() ), 0, 10 ) ] ]
			);
		}
	}

	/**
	 * Successful envelope.
	 *
	 * @param array $result Tool result.
	 * @param array $extra  Optional: warnings, dry_run, confirmation, verification, snapshot_id.
	 * @return array
	 */
	protected static function ok( array $result, array $extra = [] ) {
		return [
			'ok'           => true,
			'result'       => $result,
			'warnings'     => isset( $extra['warnings'] ) ? array_values( $extra['warnings'] ) : [],
			'dry_run'      => ! empty( $extra['dry_run'] ),
			'confirmation' => isset( $extra['confirmation'] ) ? $extra['confirmation'] : [ 'required' => false ],
			'verification' => isset( $extra['verification'] ) ? $extra['verification'] : [ 'verified' => true ],
			'snapshot_id'  => isset( $extra['snapshot_id'] ) ? (int) $extra['snapshot_id'] : 0,
			'edition'      => Edition::envelope(),
		];
	}

	/**
	 * Warning item.
	 *
	 * @param string $code    Code.
	 * @param string $message Message.
	 * @return array
	 */
	protected static function warning( $code, $message ) {
		return [
			'code'    => $code,
			'message' => $message,
		];
	}

	/**
	 * Output schema shared by every tool.
	 *
	 * @return array
	 */
	public static function envelope_schema() {
		return [
			'type'       => 'object',
			'properties' => [
				'ok'           => [ 'type' => 'boolean' ],
				'result'       => [
					'type'                 => 'object',
					'additionalProperties' => true,
				],
				'warnings'     => [
					'type'  => 'array',
					'items' => [
						'type'       => 'object',
						'properties' => [
							'code'    => [ 'type' => 'string' ],
							'message' => [ 'type' => 'string' ],
						],
					],
				],
				'dry_run'      => [ 'type' => 'boolean' ],
				'confirmation' => [
					'type'                 => 'object',
					'additionalProperties' => true,
				],
				'verification' => [
					'type'                 => 'object',
					'additionalProperties' => true,
				],
				'snapshot_id'  => [ 'type' => 'integer' ],
				'edition'      => [
					'type'                 => 'object',
					'additionalProperties' => true,
				],
			],
			'required'   => [ 'ok', 'result' ],
		];
	}

	/**
	 * Schema fragment: reference to a table (ID, name or list position).
	 *
	 * @return array
	 */
	public static function table_ref_schema() {
		return [
			'description' => 'Table to use: its ID (integer), or {"id":12}, {"name":"Prices"} (exact name, case-insensitive) or {"list_position":1} (position in your latest list-tables result).',
			'type'        => [ 'integer', 'object' ],
			'minimum'     => 1,
			'properties'  => [
				'id'            => [
					'type'    => 'integer',
					'minimum' => 1,
				],
				'name'          => [
					'type'      => 'string',
					'minLength' => 1,
					'maxLength' => 512,
				],
				'list_position' => [
					'type'    => 'integer',
					'minimum' => 1,
				],
			],
			'additionalProperties' => false,
		];
	}

	/**
	 * Schema fragment: dry_run flag.
	 *
	 * @param bool $default Default value.
	 * @return array
	 */
	public static function dry_run_schema( $default = false ) {
		return [
			'type'        => 'boolean',
			'default'     => $default,
			'description' => 'Preview the change without saving anything.',
		];
	}

	/**
	 * Schema fragment: confirmation token.
	 *
	 * @return array
	 */
	public static function confirmation_schema() {
		return [
			'type'        => 'string',
			'maxLength'   => 64,
			'description' => 'Token returned by the dry_run preview. Only send it after the user has approved the preview.',
		];
	}
}
