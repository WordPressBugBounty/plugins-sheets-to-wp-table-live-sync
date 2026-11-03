<?php
/**
 * Which plugins extend the MCP module (reporting only).
 *
 * Free never checks for Pro to unlock anything: Pro tools and settings exist
 * only when FlexTable Pro registers them through the MCP hooks. This class
 * just reports which extensions did so.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Environment;

defined( 'ABSPATH' ) || exit;

/**
 * Extension registry for status reports.
 *
 * @since 3.26.0
 */
class Edition {

	/**
	 * Extensions that registered with MCP.
	 *
	 * @return array slug => {label, version}
	 */
	public static function extensions() {
		/**
		 * Filters the plugins that extend FlexTable MCP.
		 *
		 * FlexTable Pro adds 'pro' => [ 'label' => 'FlexTable Pro', 'version' => '…' ]
		 * when it registers its tools.
		 *
		 * @since 3.26.0
		 *
		 * @param array $extensions slug => {label, version}.
		 */
		$extensions = apply_filters( 'flextable_mcp_extensions', [] );

		return is_array( $extensions ) ? $extensions : [];
	}

	/**
	 * Short form for tool results.
	 *
	 * @return array
	 */
	public static function envelope() {
		return [ 'extensions' => array_keys( self::extensions() ) ];
	}

	/**
	 * Summary used by get-status and the admin API.
	 *
	 * @return array
	 */
	public static function summary() {
		return [
			'free_version' => defined( 'GSWPTS_VERSION' ) ? GSWPTS_VERSION : '',
			'extensions'   => self::extensions(),
		];
	}
}
