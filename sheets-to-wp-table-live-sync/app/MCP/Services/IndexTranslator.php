<?php
/**
 * Parses dashboard position labels ("Col #2", "Row #4", "Col #3, Row #4")
 * and column headers into 1-based positions.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Label parsing and conversion.
 *
 * @since 3.26.0
 */
class IndexTranslator {

	/**
	 * Resolves a target into {kind: column|row|cell, column?, row?}.
	 *
	 * @param mixed    $target  "Col #2", "Row #4", "Col #3, Row #4" or an object.
	 * @param string[] $headers Column headers (to resolve column_header).
	 * @return array|WP_Error
	 */
	public static function resolve( $target, array $headers ) {
		$column = null;
		$row    = null;

		if ( is_string( $target ) ) {
			$label = trim( $target );
			if ( preg_match( '/^col\s*#\s*(\d+)\s*,\s*row\s*#\s*(\d+)$/i', $label, $m ) ) {
				$column = (int) $m[1];
				$row    = (int) $m[2];
			} elseif ( preg_match( '/^col\s*#\s*(\d+)$/i', $label, $m ) ) {
				$column = (int) $m[1];
			} elseif ( preg_match( '/^row\s*#\s*(\d+)$/i', $label, $m ) ) {
				$row = (int) $m[1];
			} else {
				return new WP_Error(
					'invalid_target',
					/* translators: %s: label. */
					sprintf( __( 'Unknown position "%s". Use "Col #2", "Row #4" or "Col #3, Row #4".', 'sheets-to-wp-table-live-sync' ), $label )
				);
			}
		} elseif ( is_array( $target ) ) {
			if ( isset( $target['column_header'] ) ) {
				$found = self::find_header( (string) $target['column_header'], $headers );
				if ( is_wp_error( $found ) ) {
					return $found;
				}
				$column = $found;
			} elseif ( isset( $target['column'] ) ) {
				$column = (int) $target['column'];
			}
			if ( isset( $target['row'] ) ) {
				$row = (int) $target['row'];
			}
		}

		if ( null === $column && null === $row ) {
			return new WP_Error( 'invalid_target', __( 'Give a column, a row, or both (a cell).', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( null !== $column && $column < 1 ) {
			return new WP_Error( 'column_out_of_range', __( 'Columns start at Col #1.', 'sheets-to-wp-table-live-sync' ) );
		}
		if ( null !== $row && $row < 1 ) {
			return new WP_Error( 'row_out_of_range', __( 'Rows start at Row #1 (the first data row below the header).', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( null !== $column && null !== $row ) {
			return [
				'kind'   => 'cell',
				'column' => $column,
				'row'    => $row,
			];
		}

		return null !== $column ? [
			'kind'   => 'column',
			'column' => $column,
		] : [
			'kind' => 'row',
			'row'  => $row,
		];
	}

	/**
	 * Finds a column by header text (case-insensitive).
	 *
	 * @param string   $name    Header text.
	 * @param string[] $headers Headers.
	 * @return int|WP_Error 1-based column.
	 */
	public static function find_header( $name, array $headers ) {
		$needle  = strtolower( trim( $name ) );
		$matches = [];

		foreach ( $headers as $i => $header ) {
			if ( strtolower( trim( (string) $header ) ) === $needle ) {
				$matches[] = $i + 1;
			}
		}

		if ( 1 === count( $matches ) ) {
			return $matches[0];
		}

		if ( count( $matches ) > 1 ) {
			return new WP_Error(
				'column_header_ambiguous',
				__( 'Several columns have this header. Use the position instead (Col #n).', 'sheets-to-wp-table-live-sync' ),
				[ 'details' => [ 'columns' => array_map( [ __CLASS__, 'column_label' ], $matches ) ] ]
			);
		}

		return new WP_Error(
			'column_header_not_found',
			/* translators: %s: header. */
			sprintf( __( 'No column is called "%s".', 'sheets-to-wp-table-live-sync' ), $name ),
			[ 'details' => [ 'headers' => array_values( $headers ) ] ]
		);
	}

	/**
	 * "Col #n".
	 *
	 * @param int $column 1-based column.
	 * @return string
	 */
	public static function column_label( $column ) {
		return 'Col #' . (int) $column;
	}

	/**
	 * Dashboard label for a resolved target.
	 *
	 * @param array $target Resolved target.
	 * @return string
	 */
	public static function label( array $target ) {
		if ( 'column' === $target['kind'] ) {
			return self::column_label( $target['column'] );
		}
		if ( 'row' === $target['kind'] ) {
			return 'Row #' . (int) $target['row'];
		}
		return sprintf( 'Col #%d, Row #%d', $target['column'], $target['row'] );
	}
}
