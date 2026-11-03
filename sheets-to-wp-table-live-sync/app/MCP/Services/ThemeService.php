<?php
/**
 * Table styles, stored exactly where FlexTable keeps them:
 * table_settings.import_styles_theme_colors[<theme>] and table_style.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Built-in styles and theme lookup.
 *
 * Free ships the two Free styles. Other plugins (FlexTable Pro) add styles
 * with `flextable_mcp_builtin_themes` and custom themes with
 * `flextable_mcp_resolve_theme` / `flextable_mcp_list_themes`.
 *
 * @since 3.26.0
 */
class ThemeService {

	/**
	 * Built-in styles available on this site (ThemeSettings.tsx).
	 *
	 * @return array id => [label, edition]
	 */
	public static function builtins() {
		$builtins = [
			'default-style' => [ 'Simple', 'free' ],
			'style-4'       => [ 'Simple on dark', 'free' ],
		];

		/**
		 * Filters the built-in table styles MCP can apply.
		 *
		 * @since 3.26.0
		 *
		 * @param array $builtins id => [label, edition].
		 */
		$filtered = apply_filters( 'flextable_mcp_builtin_themes', $builtins );

		return is_array( $filtered ) ? $filtered : $builtins;
	}

	/**
	 * Whether a theme id is built in.
	 *
	 * @param string $id Theme id.
	 * @return bool
	 */
	public static function is_builtin( $id ) {
		$builtins = self::builtins();
		return isset( $builtins[ $id ] );
	}

	/**
	 * Resolves a theme name to what should be stored on a table.
	 *
	 * @param string $name Requested style id or theme name.
	 * @return array|null {name, properties|null} or null when unknown.
	 */
	public static function resolve( $name ) {
		if ( self::is_builtin( $name ) ) {
			return [
				'name'       => $name,
				'properties' => null,
			];
		}

		/**
		 * Resolves a theme that is not a built-in style (e.g. a Pro custom theme).
		 *
		 * @since 3.26.0
		 *
		 * @param array|null $theme Null, or {name: stored name, properties: array}.
		 * @param string     $name  Requested name.
		 */
		$theme = apply_filters( 'flextable_mcp_resolve_theme', null, $name );

		return is_array( $theme ) && isset( $theme['name'] ) ? $theme : null;
	}

	/**
	 * "Unknown theme" error listing what this site offers.
	 *
	 * @return \WP_Error
	 */
	public static function not_found() {
		return new \WP_Error(
			'theme_not_found',
			__( 'No style or theme with that name is available on this site.', 'sheets-to-wp-table-live-sync' ),
			[
				'hint'    => __( 'Call flextable-list-themes. Nothing was changed.', 'sheets-to-wp-table-live-sync' ),
				'details' => [ 'available_styles' => array_keys( self::builtins() ) ],
			]
		);
	}
}
