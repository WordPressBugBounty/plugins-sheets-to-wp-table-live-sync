<?php
/**
 * Table settings that MCP may read and change, with validation.
 *
 * Keys and allowed values mirror the Free dashboard
 * (react/src/components/TableCustomization.tsx, AIView.tsx and Helpers.js
 * getDefaultSettings()). Free defines only the settings Free renders; other
 * plugins (FlexTable Pro) add theirs with the
 * `flextable_mcp_settings_definitions` filter.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Settings definitions and the patch normaliser.
 *
 * @since 3.26.0
 */
class SettingsSchema {

	/**
	 * Definitions keyed by public setting name (dotted for nested keys).
	 *
	 * Fields: type (bool|int|enum|text|hex|enum_list|int_list|column|height),
	 * values, min, max, max_length, edition, group, description, and the
	 * optional callables apply( $settings, $value ) and read( $settings ) for
	 * settings whose storage differs from their public form.
	 *
	 * @return array
	 */
	public static function definitions() {
		$bool = function ( $group, $description ) {
			return [
				'type'        => 'bool',
				'group'       => $group,
				'edition'     => 'free',
				'description' => $description,
			];
		};

		$definitions = [
			// Display.
			'show_title'            => $bool( 'display', 'Show the table name above the table.' ),
			'show_description'      => $bool( 'display', 'Show the table description.' ),
			'description_position'  => [
				'type'        => 'enum',
				'values'      => [ 'above', 'below' ],
				'group'       => 'display',
				'edition'     => 'free',
				'description' => 'Where the description is shown.',
			],
			'table_description'     => [
				'type'        => 'text',
				'max_length'  => 2000,
				'group'       => 'display',
				'edition'     => 'free',
				'description' => 'Table description (plain text).',
			],
			'show_x_entries'        => $bool( 'display', 'Show the "Show N entries" selector.' ),
			'show_info_block'       => $bool( 'display', 'Show the "Showing 1 to N of M entries" info.' ),
			'swap_filter_inputs'    => $bool( 'display', 'Swap the positions of the search box and the entries selector.' ),
			'swap_bottom_options'   => $bool( 'display', 'Swap the positions of the info block and the pagination.' ),

			// Pagination and sorting.
			'pagination'            => $bool( 'pagination', 'Show pagination. Off shows every row on one page.' ),
			'default_rows_per_page' => [
				'type'        => 'enum',
				'values'      => [ 1, 5, 10 ],
				'group'       => 'pagination',
				'edition'     => 'free',
				'description' => 'Rows per page.',
			],
			'allow_sorting'         => $bool( 'sorting', 'Let visitors sort columns.' ),
			'sorting_mode'          => [
				'type'        => 'enum',
				'values'      => [ 'asc', 'desc' ],
				'group'       => 'sorting',
				'edition'     => 'free',
				'description' => 'Sort direction for the default sort column.',
			],

			// Search and view modes.
			'search_bar'            => $bool( 'search', 'Show the search box.' ),
			'search_by'             => [
				'type'        => 'enum',
				'values'      => [ 'search-by-typing', 'search-by-press' ],
				'group'       => 'search',
				'edition'     => 'free',
				'description' => 'Search while typing, or after pressing Enter.',
			],
			'table_view_mode'       => [
				'type'        => 'enum',
				'values'      => [ 'default-mode' ],
				'group'       => 'search',
				'edition'     => 'free',
				'description' => 'default-mode shows the table.',
			],

			// Layout.
			'responsive_style'      => [
				'type'        => 'enum',
				'values'      => [ 'default_style', 'collapse_style', 'scroll_style' ],
				'group'       => 'layout',
				'edition'     => 'free',
				'description' => 'Mobile behaviour: default, collapse rows, or horizontal scroll.',
			],
			'cell_format'           => [
				'type'        => 'enum',
				'values'      => [ 'expand', 'wrap' ],
				'group'       => 'layout',
				'edition'     => 'free',
				'description' => 'Expand cells to fit content, or wrap long text.',
			],
			'vertical_scrolling'    => [
				'type'        => 'height',
				'values'      => [ 400, 500, 600, 700, 800, 900, 1000 ],
				'group'       => 'layout',
				'edition'     => 'free',
				'description' => 'Table height in px with vertical scrolling (400–1000, step 100), or null for the default height.',
			],

			// Cells.
			'redirection_type'      => [
				'type'        => 'enum',
				'values'      => [ '_blank', '_self' ],
				'group'       => 'cells',
				'edition'     => 'free',
				'description' => 'Open links in a new tab (_blank) or the same tab (_self).',
			],

			// Cache.
			'table_cache'           => $bool( 'cache', 'Cache the sheet data for faster loading.' ),
			'disable_frequent_cache' => $bool( 'cache', 'With the cache on, skip the "has the sheet changed?" check on every load.' ),

			// AI summary.
			'enable_ai_summary'     => $bool( 'ai_summary', 'Show an AI summary of the table (needs an AI provider key in Settings → AI Configuration).' ),
			'summary_source'        => [
				'type'        => 'enum',
				'values'      => [ 'generate_on_click' ],
				'group'       => 'ai_summary',
				'edition'     => 'free',
				'description' => 'generate_on_click: visitors click a button to generate the summary.',
			],
			'summary_prompt'        => [
				'type'        => 'text',
				'max_length'  => 1000,
				'group'       => 'ai_summary',
				'edition'     => 'free',
				'description' => 'Prompt used to generate the summary.',
			],
			'summary_position_goc'  => [
				'type'        => 'enum',
				'values'      => [ 'below', 'above' ],
				'group'       => 'ai_summary',
				'edition'     => 'free',
				'description' => 'Position of the "Generate summary" button and result.',
			],
			'enable_ai_cache'       => $bool( 'ai_summary', 'Cache generated summaries.' ),
		];

		/**
		 * Filters the table settings MCP can read and change.
		 *
		 * FlexTable Pro adds its settings and the extra values of shared
		 * settings (e.g. more rows-per-page choices) here.
		 *
		 * @since 3.26.0
		 *
		 * @param array $definitions Definitions keyed by public setting name.
		 */
		$filtered = apply_filters( 'flextable_mcp_settings_definitions', $definitions );

		return is_array( $filtered ) ? $filtered : $definitions;
	}

	/**
	 * Setting groups, in display order.
	 *
	 * @return string[]
	 */
	public static function groups() {
		$groups = [];
		foreach ( self::definitions() as $def ) {
			if ( ! in_array( $def['group'], $groups, true ) ) {
				$groups[] = $def['group'];
			}
		}
		return $groups;
	}

	/**
	 * Settings that exist but are not changed through update-table.
	 *
	 * @return array key => reason
	 */
	public static function read_only() {
		$read_only = [
			'table_style'                     => 'Use flextable-apply-theme.',
			'import_styles_theme_colors'      => 'Not changeable through update-table.',
			'hide_column'                     => 'Not changeable through update-table.',
			'hide_rows'                       => 'Not changeable through update-table.',
			'hide_cell'                       => 'Not changeable through update-table.',
			'user_auth_filtering'             => 'Not available through MCP (security-sensitive). Change it in the dashboard.',
			'show_table_prompt_fields'        => 'The visitor "Ask AI" box is not available through MCP. Change it in the dashboard.',
			'column_filtering.column_filters' => 'Per-column filters are configured in the dashboard.',
			'isvertical'                      => 'Set automatically by the dashboard.',
		];

		/**
		 * Filters the stored settings MCP must not change through update-table.
		 *
		 * @since 3.26.0
		 *
		 * @param array $read_only key => reason.
		 */
		return (array) apply_filters( 'flextable_mcp_settings_read_only', $read_only );
	}

	/**
	 * Features that FlexTable does not have (so MCP must not fake them).
	 *
	 * @return array
	 */
	public static function not_supported() {
		return [
			[
				'feature' => 'Column widths',
				'reason'  => 'FlexTable has no per-column width setting.',
			],
			[
				'feature' => 'Per-column alignment, fonts, padding',
				'reason'  => 'Not available as table settings.',
			],
			[
				'feature' => 'Hide the header row',
				'reason'  => 'Not available.',
			],
			[
				'feature' => 'Editing sheet data',
				'reason'  => 'FlexTable reads public Google Sheets and never writes to them. Edit the sheet in Google Sheets, then call flextable-refresh-table.',
			],
			[
				'feature' => 'Private Google Sheets',
				'reason'  => 'Only sheets shared as "Anyone with the link" are supported.',
			],
		];
	}

	/**
	 * Validates a patch.
	 *
	 * @param array $patch {public key => value}.
	 * @return array {values: path=>value, errors: list, unsupported: list}
	 */
	public static function normalize( array $patch ) {
		$definitions = self::definitions();
		$read_only   = self::read_only();
		$values      = [];
		$errors      = [];
		$unsupported = [];

		foreach ( $patch as $key => $value ) {
			$key = (string) $key;

			if ( isset( $read_only[ $key ] ) ) {
				$errors[] = [
					'key'    => $key,
					'reason' => 'read_only',
					'hint'   => $read_only[ $key ],
				];
				continue;
			}

			if ( ! isset( $definitions[ $key ] ) ) {
				$unsupported[] = $key;
				$errors[]      = [
					'key'         => $key,
					'reason'      => 'unknown_setting',
					'hint'        => 'This setting is not available on this site. Call flextable-describe-settings for the settings you can change.',
					'suggestions' => self::suggest( $key ),
				];
				continue;
			}

			$checked = self::check_value( $definitions[ $key ], $value );

			if ( is_array( $checked ) && isset( $checked['__error'] ) ) {
				$errors[] = [
					'key'            => $key,
					'reason'         => 'invalid_value',
					'allowed_values' => $checked['allowed'],
				];
				continue;
			}

			$values[ $key ] = $checked;
		}

		return [
			'values'      => $values,
			'errors'      => $errors,
			'unsupported' => $unsupported,
		];
	}

	/**
	 * Applies normalised values to stored settings (storage translation).
	 *
	 * @param array $settings Stored settings.
	 * @param array $values   Normalised values.
	 * @return array
	 */
	public static function apply( array $settings, array $values ) {
		$definitions = self::definitions();

		foreach ( $values as $key => $value ) {
			if ( isset( $definitions[ $key ]['apply'] ) && is_callable( $definitions[ $key ]['apply'] ) ) {
				$settings = call_user_func( $definitions[ $key ]['apply'], $settings, $value );
				continue;
			}

			if ( 'show_title' === $key ) {
				$settings['show_title']  = $value;
				$settings['table_title'] = $value; // Legacy alias kept in sync.
				continue;
			}

			$settings = self::set_path( $settings, $key, $value );
		}

		return $settings;
	}

	/**
	 * Current values in public form (for get-table and diffs).
	 *
	 * @param array $settings Stored settings.
	 * @return array
	 */
	public static function readable( array $settings ) {
		$defaults = TableStore::default_settings();
		$out      = [];

		foreach ( self::definitions() as $key => $def ) {
			$out[ $key ] = self::public_value( $key, $settings, $defaults );
		}

		return $out;
	}

	/**
	 * Public value of one setting.
	 *
	 * @param string $key      Public key.
	 * @param array  $settings Stored settings.
	 * @param array  $defaults Default settings.
	 * @return mixed
	 */
	public static function public_value( $key, array $settings, array $defaults ) {
		$definitions = self::definitions();

		if ( isset( $definitions[ $key ]['read'] ) && is_callable( $definitions[ $key ]['read'] ) ) {
			return call_user_func( $definitions[ $key ]['read'], $settings );
		}

		switch ( $key ) {
			case 'show_title':
				if ( array_key_exists( 'show_title', $settings ) ) {
					return (bool) $settings['show_title'];
				}
				return ! empty( $settings['table_title'] );

			case 'pagination':
				// The dashboard leaves the key out by default and the frontend only
				// paginates when it is set, so a missing key means "off".
				return ! empty( $settings['pagination'] );

			case 'vertical_scrolling':
				$value = self::get_path( $settings, 'vertical_scrolling', null );
				return is_numeric( $value ) && (int) $value > 0 ? (int) $value : null;
		}

		$value = self::get_path( $settings, $key, null );
		if ( null === $value ) {
			$value = self::get_path( $defaults, $key, null );
		}

		return $value;
	}

	/**
	 * Public definition fields for describe-settings (no callables).
	 *
	 * @param array $def Definition.
	 * @return array
	 */
	public static function describe( array $def ) {
		unset( $def['apply'], $def['read'] );
		return $def;
	}

	/**
	 * Validates one value.
	 *
	 * @param array $def   Definition.
	 * @param mixed $value Value.
	 * @return mixed Normalised value or ['__error' => …].
	 */
	private static function check_value( array $def, $value ) {
		switch ( $def['type'] ) {
			case 'bool':
				if ( is_bool( $value ) ) {
					return $value;
				}
				return [
					'__error' => 'invalid',
					'allowed' => [ true, false ],
				];

			case 'int':
				if ( is_int( $value ) && $value >= $def['min'] && $value <= $def['max'] ) {
					return $value;
				}
				return [
					'__error' => 'invalid',
					'allowed' => sprintf( 'integer %d–%d', $def['min'], $def['max'] ),
				];

			case 'column':
				if ( is_int( $value ) && $value >= 0 && $value <= 200 ) {
					return $value;
				}
				return [
					'__error' => 'invalid',
					'allowed' => 'integer: 0 (sheet order) or a 1-based column position',
				];

			case 'enum':
				if ( in_array( $value, $def['values'], true ) ) {
					return $value;
				}
				return [
					'__error' => 'invalid',
					'allowed' => $def['values'],
				];

			case 'enum_list':
				if ( is_array( $value ) && ! array_diff( $value, $def['values'] ) ) {
					return array_values( array_unique( $value ) );
				}
				return [
					'__error' => 'invalid',
					'allowed' => $def['values'],
				];

			case 'int_list':
				if ( is_array( $value ) ) {
					$clean = [];
					foreach ( $value as $n ) {
						if ( ! is_int( $n ) || $n < $def['min'] || $n > $def['max'] ) {
							$clean = null;
							break;
						}
						$clean[] = $n;
					}
					if ( null !== $clean ) {
						return array_values( array_unique( $clean ) );
					}
				}
				return [
					'__error' => 'invalid',
					'allowed' => 'array of 1-based column positions',
				];

			case 'text':
				if ( is_string( $value ) && ( function_exists( 'mb_strlen' ) ? mb_strlen( $value ) : strlen( $value ) ) <= $def['max_length'] ) {
					return sanitize_textarea_field( $value );
				}
				return [
					'__error' => 'invalid',
					'allowed' => sprintf( 'plain text, up to %d characters', $def['max_length'] ),
				];

			case 'hex':
				$hex = self::hex( $value );
				if ( $hex ) {
					return $hex;
				}
				return [
					'__error' => 'invalid',
					'allowed' => 'hex colour: #rgb, #rgba, #rrggbb or #rrggbbaa',
				];

			case 'height':
				if ( null === $value ) {
					return null;
				}
				if ( in_array( $value, $def['values'], true ) ) {
					return $value;
				}
				return [
					'__error' => 'invalid',
					'allowed' => array_merge( [ null ], $def['values'] ),
				];
		}

		return [
			'__error' => 'invalid',
			'allowed' => [],
		];
	}

	/**
	 * Normalises a hex colour or returns ''.
	 *
	 * @param mixed $value Value.
	 * @return string
	 */
	public static function hex( $value ) {
		if ( ! is_string( $value ) ) {
			return '';
		}
		$value = trim( $value );
		if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value ) ) {
			return strtolower( $value );
		}
		return '';
	}

	/**
	 * Close matches for an unknown key.
	 *
	 * @param string $key Unknown key.
	 * @return string[]
	 */
	private static function suggest( $key ) {
		$scores = [];
		foreach ( array_keys( self::definitions() ) as $candidate ) {
			$scores[ $candidate ] = levenshtein( strtolower( $key ), strtolower( $candidate ) );
		}
		asort( $scores );
		return array_slice( array_keys( $scores ), 0, 3 );
	}

	/**
	 * Reads a dotted path.
	 *
	 * @param array  $data    Data.
	 * @param string $path    Path.
	 * @param mixed  $default Default.
	 * @return mixed
	 */
	public static function get_path( array $data, $path, $default = null ) {
		foreach ( explode( '.', $path ) as $segment ) {
			if ( ! is_array( $data ) || ! array_key_exists( $segment, $data ) ) {
				return $default;
			}
			$data = $data[ $segment ];
		}
		return $data;
	}

	/**
	 * Writes a dotted path.
	 *
	 * @param array  $data  Data.
	 * @param string $path  Path.
	 * @param mixed  $value Value.
	 * @return array
	 */
	public static function set_path( array $data, $path, $value ) {
		$segments = explode( '.', $path );
		$first    = array_shift( $segments );

		if ( ! $segments ) {
			$data[ $first ] = $value;
			return $data;
		}

		$child          = isset( $data[ $first ] ) && is_array( $data[ $first ] ) ? $data[ $first ] : [];
		$data[ $first ] = self::set_path( $child, implode( '.', $segments ), $value );

		return $data;
	}
}
