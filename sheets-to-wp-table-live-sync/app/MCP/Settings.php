<?php
/**
 * MCP settings storage (option `flextable_mcp_settings`).
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP;

defined( 'ABSPATH' ) || exit;

/**
 * Reads, validates and stores the MCP settings.
 *
 * @since 3.26.0
 */
class Settings {

	const OPTION = 'flextable_mcp_settings';

	/**
	 * Allowed credential expiry values in days (0 = never).
	 *
	 * @var int[]
	 */
	const EXPIRY_CHOICES = [ 30, 90, 365, 0 ];

	/**
	 * Allowed publishing policies.
	 *
	 * @var string[]
	 */
	const PUBLISHING_CHOICES = [ 'off', 'drafts', 'confirm' ];

	/**
	 * Default values.
	 *
	 * @return array
	 */
	public static function defaults() {
		return [
			'enabled'       => false,
			'strict'        => true,
			'expiry_days'   => 90,
			'publishing'    => 'drafts',
			'allow_deletes' => false,
			'data_reads'    => true,
		];
	}

	/**
	 * Returns all settings merged with defaults.
	 *
	 * @return array
	 */
	public static function all() {
		$stored = get_option( self::OPTION, [] );
		$stored = is_array( $stored ) ? $stored : [];

		return self::sanitize( array_merge( self::defaults(), $stored ) );
	}

	/**
	 * Returns one setting.
	 *
	 * @param string $key Setting key.
	 * @return mixed
	 */
	public static function get( $key ) {
		$all = self::all();
		return isset( $all[ $key ] ) ? $all[ $key ] : null;
	}

	/**
	 * Whether MCP is switched on.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return (bool) self::get( 'enabled' );
	}

	/**
	 * Updates settings with a partial patch.
	 *
	 * @param array $patch Partial settings.
	 * @return array The stored settings.
	 */
	public static function update( array $patch ) {
		$current = self::all();
		$known   = array_intersect_key( $patch, self::defaults() );
		$next    = self::sanitize( array_merge( $current, $known ) );

		update_option( self::OPTION, $next, false );

		if ( $next['enabled'] && ! $current['enabled'] ) {
			Database\Migrations::maybe_run();
		}

		return $next;
	}

	/**
	 * Normalises raw values.
	 *
	 * @param array $raw Raw values.
	 * @return array
	 */
	private static function sanitize( array $raw ) {
		$expiry = isset( $raw['expiry_days'] ) ? (int) $raw['expiry_days'] : 90;
		if ( ! in_array( $expiry, self::EXPIRY_CHOICES, true ) ) {
			$expiry = 90;
		}

		$publishing = isset( $raw['publishing'] ) ? (string) $raw['publishing'] : 'drafts';
		if ( ! in_array( $publishing, self::PUBLISHING_CHOICES, true ) ) {
			$publishing = 'drafts';
		}

		return [
			'enabled'       => wp_validate_boolean( $raw['enabled'] ),
			'strict'        => wp_validate_boolean( $raw['strict'] ),
			'expiry_days'   => $expiry,
			'publishing'    => $publishing,
			'allow_deletes' => wp_validate_boolean( $raw['allow_deletes'] ),
			'data_reads'    => wp_validate_boolean( $raw['data_reads'] ),
		];
	}
}
