<?php
/**
 * Maps FlexTable abilities to MCP tools.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Server;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Abilities\Registrar;
use GSWPTS\MCP\Safety\AuditLog;
use GSWPTS\MCP\Safety\RateLimiter;
use GSWPTS\MCP\Safety\RequestContext;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Builds tool definitions and executes tool calls.
 *
 * @since 3.26.0
 */
class ToolCatalog {

	/**
	 * Converts an ability name to an MCP tool name ("/" → "-").
	 *
	 * @param string $ability Ability name.
	 * @return string
	 */
	public static function tool_name( $ability ) {
		return str_replace( '/', '-', $ability );
	}

	/**
	 * FlexTable ability objects keyed by tool name.
	 *
	 * @return array<string,\WP_Ability>
	 */
	public function abilities() {
		$out = [];

		if ( ! function_exists( 'wp_get_abilities' ) ) {
			return $out;
		}

		foreach ( wp_get_abilities() as $ability ) {
			if ( 0 !== strpos( $ability->get_name(), 'flextable/' ) ) {
				continue;
			}
			$out[ self::tool_name( $ability->get_name() ) ] = $ability;
		}

		return $out;
	}

	/**
	 * Whether a tool exists (regardless of availability).
	 *
	 * @param string $tool Tool name.
	 * @return bool
	 */
	public function has_tool( $tool ) {
		$abilities = $this->abilities();
		return isset( $abilities[ $tool ] );
	}

	/**
	 * Tool definitions for tools/list: only tools this site and user can use.
	 *
	 * @return array
	 */
	public function list_tools() {
		$tools = [];

		foreach ( $this->abilities() as $tool => $ability ) {
			$handler = Registrar::handler( $ability->get_name() );

			if ( ! $handler || true !== $handler->availability() ) {
				continue;
			}

			$tools[] = $this->definition( $tool, $ability, $handler );
		}

		usort(
			$tools,
			function ( $a, $b ) {
				return strcmp( $a['name'], $b['name'] );
			}
		);

		return $tools;
	}

	/**
	 * One tool definition.
	 *
	 * @param string       $tool    Tool name.
	 * @param \WP_Ability  $ability Ability.
	 * @param AbilityBase  $handler Handler.
	 * @return array
	 */
	public function definition( $tool, $ability, AbilityBase $handler ) {
		$annotations = $handler->annotations();

		return [
			'name'         => $tool,
			'title'        => $ability->get_label(),
			'description'  => $ability->get_description(),
			'inputSchema'  => self::export_schema( $ability->get_input_schema() ),
			'outputSchema' => self::export_schema( $ability->get_output_schema() ),
			'annotations'  => [
				'title'           => $ability->get_label(),
				'readOnlyHint'    => (bool) $annotations['readonly'],
				'destructiveHint' => (bool) $annotations['destructive'],
				'idempotentHint'  => (bool) $annotations['idempotent'],
				'openWorldHint'   => (bool) $annotations['open_world'],
			],
		];
	}

	/**
	 * Executes a tool and returns a CallToolResult.
	 *
	 * @param string $tool      Tool name.
	 * @param array  $arguments Arguments.
	 * @return array
	 */
	public function call( $tool, array $arguments ) {
		$abilities = $this->abilities();
		$ability   = $abilities[ $tool ];
		$handler   = Registrar::handler( $ability->get_name() );
		$started   = microtime( true );

		RequestContext::set( 'tool', $ability->get_name() );

		$writes = $handler && ! $handler->annotations()['readonly'];
		if ( $writes ) {
			$retry = RateLimiter::hit( 'writes', RequestContext::caller_key() );
			if ( $retry > 0 ) {
				return self::error_result( new WP_Error( 'rate_limited', __( 'Too many changes in a short time. Try again shortly.', 'sheets-to-wp-table-live-sync' ), [ 'retry_after' => $retry ] ) );
			}
		}

		$audit_id = AuditLog::record(
			[
				'tool'        => $ability->get_name(),
				'args'        => $arguments,
				'result_code' => 'started',
				'dry_run'     => ! empty( $arguments['dry_run'] ),
				'target_type' => isset( $arguments['table'] ) ? 'table' : '',
				'target_id'   => isset( $arguments['table'] ) && is_numeric( $arguments['table'] ) ? (int) $arguments['table'] : 0,
			]
		);
		RequestContext::set( 'audit_id', $audit_id );

		// An object with no properties arrives as [] from json_decode.
		$result = $ability->execute( $arguments );

		$duration = (int) round( ( microtime( true ) - $started ) * 1000 );

		if ( is_wp_error( $result ) ) {
			AuditLog::finish( $audit_id, $result->get_error_code(), $duration );
			return self::error_result( $result );
		}

		AuditLog::finish( $audit_id, 'ok', $duration );

		$structured = self::objectify( $result );

		return [
			'content'           => [
				[
					'type' => 'text',
					'text' => (string) wp_json_encode( $structured, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ),
				],
			],
			'structuredContent' => $structured,
			'isError'           => false,
		];
	}

	/**
	 * Converts a WP_Error into a tool execution error result.
	 *
	 * @param WP_Error $error Error.
	 * @return array
	 */
	public static function error_result( WP_Error $error ) {
		$data    = $error->get_error_data();
		$data    = is_array( $data ) ? $data : [];
		$code    = $error->get_error_code();
		$message = wp_strip_all_tags( $error->get_error_message() );

		// Map core Abilities API codes to clearer FlexTable codes.
		if ( 'ability_invalid_input' === $code ) {
			$code = 'invalid_arguments';
		} elseif ( 'ability_invalid_permissions' === $code ) {
			$code = 'forbidden';
		}

		$payload = [
			'ok'    => false,
			'error' => [
				'code'    => (string) $code,
				'message' => $message,
				'hint'    => isset( $data['hint'] ) ? (string) $data['hint'] : '',
				'details' => isset( $data['details'] ) ? $data['details'] : new \stdClass(),
			],
		];

		return [
			'content'           => [
				[
					'type' => 'text',
					'text' => (string) wp_json_encode( $payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ),
				],
			],
			'structuredContent' => $payload,
			'isError'           => true,
		];
	}

	/**
	 * Prepares an ability schema for MCP: empty `properties` become `{}` and
	 * WordPress-only keys are removed.
	 *
	 * @param array $schema Schema.
	 * @return array|\stdClass
	 */
	public static function export_schema( $schema ) {
		if ( empty( $schema ) ) {
			return [
				'type'                 => 'object',
				'properties'           => new \stdClass(),
				'additionalProperties' => false,
			];
		}

		unset( $schema['default'] );

		return self::clean_schema( $schema );
	}

	/**
	 * Recursively fixes empty objects in a schema.
	 *
	 * @param mixed $node Schema node.
	 * @return mixed
	 */
	private static function clean_schema( $node ) {
		if ( ! is_array( $node ) ) {
			return $node;
		}

		foreach ( $node as $key => $value ) {
			if ( 'properties' === $key && is_array( $value ) && empty( $value ) ) {
				$node[ $key ] = new \stdClass();
			} elseif ( 'default' === $key && is_array( $value ) && empty( $value ) ) {
				// Keep [] defaults as they are (arrays); objects are not used as defaults.
				$node[ $key ] = $value;
			} elseif ( is_array( $value ) ) {
				$node[ $key ] = self::clean_schema( $value );
			}
		}

		return $node;
	}

	/**
	 * Makes sure the result and the known object fields encode as JSON objects.
	 *
	 * @param array $envelope Envelope.
	 * @return array
	 */
	private static function objectify( $envelope ) {
		if ( ! is_array( $envelope ) ) {
			return [ 'ok' => true, 'result' => new \stdClass() ];
		}

		foreach ( [ 'result', 'confirmation', 'verification', 'edition' ] as $key ) {
			if ( isset( $envelope[ $key ] ) && is_array( $envelope[ $key ] ) && empty( $envelope[ $key ] ) ) {
				$envelope[ $key ] = new \stdClass();
			}
		}

		return $envelope;
	}
}
