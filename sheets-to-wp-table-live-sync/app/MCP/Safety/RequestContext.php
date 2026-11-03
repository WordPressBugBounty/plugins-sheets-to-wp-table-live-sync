<?php
/**
 * Per-request MCP context (credential, client, protocol version, audit id).
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Safety;

defined( 'ABSPATH' ) || exit;

/**
 * Holds information about the MCP request being served.
 *
 * @since 3.26.0
 */
class RequestContext {

	/**
	 * Context values.
	 *
	 * @var array
	 */
	private static $data = [
		'credential' => '',
		'client'     => '',
		'protocol'   => '',
		'tool'       => '',
		'audit_id'   => 0,
		'mcp'        => false,
	];

	/**
	 * Sets a value.
	 *
	 * @param string $key   Key.
	 * @param mixed  $value Value.
	 * @return void
	 */
	public static function set( $key, $value ) {
		self::$data[ $key ] = $value;
	}

	/**
	 * Reads a value.
	 *
	 * @param string $key Key.
	 * @return mixed
	 */
	public static function get( $key ) {
		return isset( self::$data[ $key ] ) ? self::$data[ $key ] : null;
	}

	/**
	 * Stable identifier for the caller, used to scope confirmations, list
	 * positions and rate limits.
	 *
	 * @return string
	 */
	public static function caller_key() {
		$credential = (string) self::get( 'credential' );
		return get_current_user_id() . ':' . ( '' !== $credential ? $credential : 'local' );
	}
}
