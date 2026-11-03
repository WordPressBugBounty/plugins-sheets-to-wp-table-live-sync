<?php
/**
 * Removes secrets and personal data from values before they are logged.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Safety;

defined( 'ABSPATH' ) || exit;

/**
 * Builds safe argument summaries for the audit log.
 *
 * @since 3.26.0
 */
class Redactor {

	/**
	 * Keys whose values are never logged.
	 *
	 * @var string[]
	 */
	const SECRET_PATTERNS = [ 'token', 'password', 'secret', 'api_key', 'authorization', 'code_verifier' ];

	/**
	 * Summarises tool arguments: ids and short scalar values only, with
	 * secrets, free text and sheet URLs reduced.
	 *
	 * @param mixed $args  Arguments.
	 * @param int   $depth Recursion depth.
	 * @return mixed
	 */
	public static function summarize( $args, $depth = 0 ) {
		if ( $depth > 3 ) {
			return '[…]';
		}

		if ( ! is_array( $args ) ) {
			return self::scalar( '', $args );
		}

		$out   = [];
		$count = 0;

		foreach ( $args as $key => $value ) {
			if ( ++$count > 25 ) {
				$out['…'] = 'truncated';
				break;
			}

			$key_string = is_string( $key ) ? strtolower( $key ) : '';

			if ( self::is_secret_key( $key_string ) ) {
				$out[ $key ] = '[redacted]';
				continue;
			}

			$out[ $key ] = is_array( $value ) ? self::summarize( $value, $depth + 1 ) : self::scalar( $key_string, $value );
		}

		return $out;
	}

	/**
	 * Whether a key names a secret.
	 *
	 * @param string $key Lower-cased key.
	 * @return bool
	 */
	public static function is_secret_key( $key ) {
		foreach ( self::SECRET_PATTERNS as $pattern ) {
			if ( false !== strpos( $key, $pattern ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Reduces one scalar.
	 *
	 * @param string $key   Key.
	 * @param mixed  $value Value.
	 * @return mixed
	 */
	private static function scalar( $key, $value ) {
		if ( is_bool( $value ) || is_int( $value ) || is_float( $value ) || null === $value ) {
			return $value;
		}

		$value = (string) $value;

		if ( false !== strpos( $key, 'url' ) && preg_match( '#/spreadsheets/(?:u/\d+/)?d/([A-Za-z0-9_-]+)#', $value, $m ) ) {
			$gid = preg_match( '/gid=(\d+)/', $value, $g ) ? $g[1] : '';
			return 'sheet:' . substr( md5( $m[1] ), 0, 12 ) . ( '' !== $gid ? '#gid=' . $gid : '' );
		}

		if ( strlen( $value ) > 60 ) {
			return '[text ' . strlen( $value ) . ' chars]';
		}

		return $value;
	}
}
