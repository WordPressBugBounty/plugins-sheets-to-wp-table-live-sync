<?php
/**
 * Single-use confirmation tokens for consequential actions.
 *
 * A preview (dry run) of a consequential change returns a token bound to the
 * caller, the tool, the exact arguments and the version of the objects it
 * touches. Applying the change requires that token with identical arguments.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Safety;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Issues and consumes confirmation tokens.
 *
 * @since 3.26.0
 */
class ConfirmationService {

	/**
	 * Token lifetime in seconds.
	 */
	const TTL = 600;

	/**
	 * Issues a token.
	 *
	 * @param string $tool     Ability name.
	 * @param array  $args     Tool arguments.
	 * @param string $versions Fingerprint of the objects that will change.
	 * @param string $summary  Human readable summary of the change.
	 * @return array {required, token, expires_at, summary}
	 */
	public static function issue( $tool, array $args, $versions, $summary ) {
		$token = wp_generate_password( 32, false, false );

		set_transient(
			self::key( $token ),
			[
				'caller'   => RequestContext::caller_key(),
				'tool'     => $tool,
				'args'     => self::fingerprint( $args ),
				'versions' => (string) $versions,
			],
			self::TTL
		);

		return [
			'required'   => true,
			'token'      => $token,
			'expires_at' => gmdate( 'c', time() + self::TTL ),
			'summary'    => $summary,
		];
	}

	/**
	 * Validates and consumes a token.
	 *
	 * @param string $token    Token from the preview.
	 * @param string $tool     Ability name.
	 * @param array  $args     Arguments of the apply call.
	 * @param string $versions Current fingerprint of the objects.
	 * @return true|WP_Error
	 */
	public static function consume( $token, $tool, array $args, $versions ) {
		$token = (string) $token;
		if ( '' === $token || ! preg_match( '/^[A-Za-z0-9]{32}$/', $token ) ) {
			return self::error( 'confirmation_required', __( 'This change needs confirmation. Call the tool with dry_run=true, show the preview to the user, then repeat the call with the returned confirmation_token.', 'sheets-to-wp-table-live-sync' ) );
		}

		$stored = get_transient( self::key( $token ) );

		if ( ! is_array( $stored ) ) {
			return self::error( 'confirmation_expired', __( 'The confirmation token has expired or was already used. Run the preview again.', 'sheets-to-wp-table-live-sync' ) );
		}

		// Single use, also under concurrency: only the caller whose delete succeeds wins.
		if ( ! delete_transient( self::key( $token ) ) ) {
			return self::error( 'confirmation_expired', __( 'The confirmation token has expired or was already used. Run the preview again.', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( $stored['caller'] !== RequestContext::caller_key() || $stored['tool'] !== $tool || ! hash_equals( $stored['args'], self::fingerprint( $args ) ) ) {
			return self::error( 'confirmation_mismatch', __( 'The confirmation token does not match these arguments. Run the preview again with the exact arguments you want to apply.', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( ! hash_equals( $stored['versions'], (string) $versions ) ) {
			return self::error( 'stale_preview', __( 'The content changed after the preview. Run the preview again.', 'sheets-to-wp-table-live-sync' ) );
		}

		return true;
	}

	/**
	 * Canonical hash of the arguments, ignoring dry_run and the token itself.
	 *
	 * @param array $args Arguments.
	 * @return string
	 */
	private static function fingerprint( array $args ) {
		unset( $args['dry_run'], $args['confirmation_token'] );
		$args = self::ksort_recursive( $args );
		return hash( 'sha256', (string) wp_json_encode( $args ) );
	}

	/**
	 * Sorts keys recursively so argument order does not matter.
	 *
	 * @param mixed $value Value.
	 * @return mixed
	 */
	private static function ksort_recursive( $value ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}
		foreach ( $value as $k => $v ) {
			$value[ $k ] = self::ksort_recursive( $v );
		}
		if ( array_keys( $value ) !== range( 0, count( $value ) - 1 ) ) {
			ksort( $value );
		}
		return $value;
	}

	/**
	 * Transient key for a token (only the hash is stored).
	 *
	 * @param string $token Token.
	 * @return string
	 */
	private static function key( $token ) {
		return 'flextable_mcp_cf_' . substr( hash( 'sha256', $token . wp_salt( 'auth' ) ), 0, 40 );
	}

	/**
	 * Builds a confirmation error.
	 *
	 * @param string $code    Code.
	 * @param string $message Message.
	 * @return WP_Error
	 */
	private static function error( $code, $message ) {
		return new WP_Error( $code, $message, [ 'hint' => __( 'Call again with dry_run=true to get a new confirmation_token.', 'sheets-to-wp-table-live-sync' ) ] );
	}
}
