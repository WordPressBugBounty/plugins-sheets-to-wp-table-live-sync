<?php
/**
 * Public Google Sheets access for MCP.
 *
 * The fetch, the "is this sheet public" check and the CSV parsing are
 * FlexTable's own `gswpts()->helpers->get_csv_data()`, exactly as the
 * dashboard uses them. That function ends the request with
 * wp_send_json_error() when a sheet is not public, so it is called inside an
 * exit guard that turns the exit into a WP_Error.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

use GSWPTS\MCP\Safety\RateLimiter;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Validates sheet URLs and reads public sheet data.
 *
 * @since 3.26.0
 */
class SheetAccess {

	/**
	 * Parses and validates a Google Sheets URL.
	 *
	 * @param string      $url Sheet URL (may contain gid, may be HTML-encoded).
	 * @param string|null $gid Optional explicit GID.
	 * @return array|WP_Error {sheet_id, gid, gid_source, canonical_url}
	 */
	public static function parse( $url, $gid = null ) {
		$url = trim( html_entity_decode( (string) $url, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );

		if ( '' === $url || strlen( $url ) > 2048 ) {
			return self::error( 'sheet_url_malformed', __( 'Send the full Google Sheets URL, for example https://docs.google.com/spreadsheets/d/…/edit#gid=0', 'sheets-to-wp-table-live-sync' ) );
		}

		$parts = wp_parse_url( $url );

		if ( ! is_array( $parts ) || empty( $parts['host'] ) || empty( $parts['scheme'] ) ) {
			return self::error( 'sheet_url_malformed', __( 'This is not a valid URL. Send the full Google Sheets URL.', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( 'https' !== strtolower( $parts['scheme'] ) || 'docs.google.com' !== strtolower( $parts['host'] ) || isset( $parts['user'] ) || isset( $parts['pass'] ) || isset( $parts['port'] ) ) {
			return self::error( 'sheet_host_invalid', __( 'Only Google Sheets URLs on https://docs.google.com are accepted.', 'sheets-to-wp-table-live-sync' ) );
		}

		$path = isset( $parts['path'] ) ? $parts['path'] : '';

		if ( preg_match( '#^/spreadsheets/(?:u/\d+/)?d/e/#', $path ) ) {
			return self::error(
				'sheet_published_url_unsupported',
				__( '"Publish to web" links are not supported. In Google Sheets click Share → General access → "Anyone with the link", then copy the URL from the browser address bar.', 'sheets-to-wp-table-live-sync' )
			);
		}

		if ( ! preg_match( '#^/spreadsheets/(?:u/\d+/)?d/([A-Za-z0-9_-]{20,128})(?:/|$)#', $path, $m ) ) {
			return self::error( 'sheet_url_malformed', __( 'This does not look like a Google Sheets URL (…/spreadsheets/d/<id>/…).', 'sheets-to-wp-table-live-sync' ) );
		}

		$sheet_id = $m[1];

		$url_gid = '';
		$scan    = ( isset( $parts['query'] ) ? $parts['query'] : '' ) . '#' . ( isset( $parts['fragment'] ) ? $parts['fragment'] : '' );
		if ( preg_match( '/(?:^|[?&#])gid=([0-9]+)/', $scan, $g ) ) {
			$url_gid = $g[1];
		}

		$arg_gid = null === $gid ? '' : trim( (string) $gid );
		if ( '' !== $arg_gid && ! preg_match( '/^[0-9]{1,12}$/', $arg_gid ) ) {
			return self::error( 'sheet_url_malformed', __( 'A GID must be a number, for example 0 or 123456789.', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( '' !== $arg_gid && '' !== $url_gid && $arg_gid !== $url_gid ) {
			return self::error(
				'sheet_gid_conflict',
				/* translators: 1: gid in the URL, 2: gid argument. */
				sprintf( __( 'The URL points to worksheet gid=%1$s but gid %2$s was also given. Use one of them.', 'sheets-to-wp-table-live-sync' ), $url_gid, $arg_gid )
			);
		}

		if ( '' !== $arg_gid ) {
			$final  = $arg_gid;
			$source = 'argument';
		} elseif ( '' !== $url_gid ) {
			$final  = $url_gid;
			$source = 'url';
		} else {
			// Same as creating a table in the dashboard: no gid means gid 0.
			$final  = '0';
			$source = 'default';
		}

		return [
			'sheet_id'      => $sheet_id,
			'gid'           => $final,
			'gid_source'    => $source,
			'canonical_url' => sprintf( 'https://docs.google.com/spreadsheets/d/%1$s/edit#gid=%2$s', $sheet_id, $final ),
		];
	}

	/**
	 * Reads a public sheet through FlexTable's own fetch and check.
	 *
	 * @param string $sheet_id Sheet ID.
	 * @param string $gid      GID.
	 * @return array|WP_Error {headers: string[], rows: string[][]}
	 */
	public static function fetch( $sheet_id, $gid ) {
		if ( ! function_exists( 'gswpts' ) ) {
			return self::error( 'flextable_unavailable', __( 'FlexTable is not loaded.', 'sheets-to-wp-table-live-sync' ) );
		}

		$retry = RateLimiter::hit( 'sheet_fetch', 'site' );
		if ( $retry > 0 ) {
			return new WP_Error( 'rate_limited', __( 'Too many Google Sheets requests. Try again shortly.', 'sheets-to-wp-table-live-sync' ), [ 'retry_after' => $retry ] );
		}

		$url    = sprintf( 'https://docs.google.com/spreadsheets/d/%1$s/edit#gid=%2$s', $sheet_id, $gid );
		$result = self::guarded_get_csv( $url, $sheet_id, (int) $gid );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( false !== strpos( $result, 'request-storage-access' ) || false !== strpos( $result, 'show-error' ) ) {
			return self::not_public();
		}

		return self::parse_csv( $result );
	}

	/**
	 * Calls get_csv_data() with exit protection.
	 *
	 * @param string $url      URL.
	 * @param string $sheet_id Sheet ID.
	 * @param int    $gid      GID.
	 * @return string|WP_Error
	 */
	private static function guarded_get_csv( $url, $sheet_id, $gid ) {
		$level   = ob_get_level();
		$ajax    = '__return_true';
		$handler = [ __CLASS__, 'die_handler_factory' ];
		$exited  = false;
		$csv     = '';

		ob_start();
		add_filter( 'wp_doing_ajax', $ajax, PHP_INT_MAX );
		add_filter( 'wp_die_ajax_handler', $handler, PHP_INT_MAX );

		try {
			$csv = gswpts()->helpers->get_csv_data( $url, (string) $sheet_id, (int) $gid );
		} catch ( SheetExit $e ) {
			$exited = true;
		} finally {
			remove_filter( 'wp_doing_ajax', $ajax, PHP_INT_MAX );
			remove_filter( 'wp_die_ajax_handler', $handler, PHP_INT_MAX );
			while ( ob_get_level() > $level ) {
				ob_end_clean();
			}
		}

		if ( $exited ) {
			// get_csv_data() only exits for a sheet that is not public.
			return self::not_public();
		}

		if ( is_wp_error( $csv ) ) {
			return new WP_Error(
				'sheet_fetch_failed',
				__( 'Google Sheets could not be reached. Try again in a moment.', 'sheets-to-wp-table-live-sync' ),
				[ 'hint' => __( 'If this keeps happening, raise the request timeout in FlexTable → Settings → Performance.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		return is_string( $csv ) ? $csv : '';
	}

	/**
	 * Filter callback returning the throwing die handler.
	 *
	 * @return callable
	 */
	public static function die_handler_factory() {
		return [ __CLASS__, 'throw_exit' ];
	}

	/**
	 * Replacement for wp_die() while the guard is active.
	 *
	 * @throws SheetExit Always.
	 */
	public static function throw_exit() {
		throw new SheetExit( 'exit' );
	}

	/**
	 * Parses FlexTable's CSV string.
	 *
	 * @param string $csv CSV.
	 * @return array {headers, rows}
	 */
	public static function parse_csv( $csv ) {
		$rows   = [];
		$handle = fopen( 'php://temp', 'r+' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen

		fwrite( $handle, (string) $csv ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
		rewind( $handle );

		while ( false !== ( $line = fgetcsv( $handle, 0, ',', '"', '\\' ) ) ) { // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition
			if ( [ null ] === $line ) {
				continue;
			}
			$rows[] = $line;
		}

		fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose

		$headers = $rows ? array_shift( $rows ) : [];

		return [
			'headers' => array_map( [ __CLASS__, 'clean_cell' ], (array) $headers ),
			'rows'    => array_map(
				function ( $row ) {
					return array_map( [ __CLASS__, 'clean_cell' ], $row );
				},
				$rows
			),
		];
	}

	/**
	 * Turns stored cell markup into plain text for AI clients.
	 *
	 * FlexTable converts line breaks to <br> and replaces commas in the first
	 * column with U+FE50 (Source Audit §12 d); both are reversed here.
	 *
	 * @param mixed $cell Cell.
	 * @return string
	 */
	public static function clean_cell( $cell ) {
		$cell = (string) $cell;
		$cell = str_replace( "\xEF\xB9\x90", ',', $cell );
		$cell = preg_replace( '#<br\s*/?>#i', "\n", $cell );
		// Keep image and link targets as plain text.
		$cell = preg_replace( '#<img\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>#i', ' $1 ', $cell );
		$cell = preg_replace( '#<a\b[^>]*\bhref=["\']([^"\']+)["\'][^>]*>(.*?)</a>#is', '$2 ($1)', $cell );
		$cell = wp_strip_all_tags( $cell, false );
		$cell = html_entity_decode( $cell, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		return trim( $cell );
	}

	/**
	 * Guesses a type per column.
	 *
	 * @param array $rows Rows.
	 * @param int   $columns Number of columns.
	 * @return string[]
	 */
	public static function guess_types( array $rows, $columns ) {
		$types = [];

		for ( $c = 0; $c < $columns; $c++ ) {
			$counts = [];
			$seen   = 0;

			foreach ( array_slice( $rows, 0, 200 ) as $row ) {
				$value = isset( $row[ $c ] ) ? trim( (string) $row[ $c ] ) : '';
				if ( '' === $value ) {
					continue;
				}
				$seen++;
				$type            = self::value_type( $value );
				$counts[ $type ] = isset( $counts[ $type ] ) ? $counts[ $type ] + 1 : 1;
			}

			if ( ! $seen ) {
				$types[] = 'empty';
				continue;
			}

			arsort( $counts );
			$top     = key( $counts );
			$types[] = ( $counts[ $top ] / $seen ) >= 0.8 ? $top : 'text';
		}

		return $types;
	}

	/**
	 * Type of one value.
	 *
	 * @param string $value Value.
	 * @return string
	 */
	private static function value_type( $value ) {
		if ( preg_match( '/^(true|false)$/i', $value ) ) {
			return 'boolean';
		}
		if ( preg_match( '#^https?://\S+\.(png|jpe?g|gif|svg|webp)(\?\S*)?$#i', $value ) ) {
			return 'image';
		}
		if ( preg_match( '#^https?://\S+$#i', $value ) ) {
			return 'url';
		}
		if ( preg_match( '/^[\$€£¥৳₹]\s?-?[\d,]+(\.\d+)?$|^-?[\d,]+(\.\d+)?\s?[\$€£¥৳₹]$/u', $value ) ) {
			return 'currency';
		}
		if ( preg_match( '/^-?[\d,]+(\.\d+)?\s?%$/', $value ) ) {
			return 'percent';
		}
		if ( preg_match( '/^-?\d{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/', $value ) ) {
			return 'number';
		}
		if ( false !== strtotime( $value ) && preg_match( '/\d/', $value ) && preg_match( '#[-/.]|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)#i', $value ) ) {
			return 'date';
		}
		return 'text';
	}

	/**
	 * Data-quality warnings.
	 *
	 * @param array $data {headers, rows}.
	 * @return array List of {code, message}.
	 */
	public static function warnings( array $data ) {
		$warnings = [];
		$headers  = $data['headers'];

		if ( ! $headers && ! $data['rows'] ) {
			$warnings[] = [
				'code'    => 'empty_sheet',
				'message' => __( 'The worksheet is empty.', 'sheets-to-wp-table-live-sync' ),
			];
			return $warnings;
		}

		if ( in_array( '', $headers, true ) ) {
			$warnings[] = [
				'code'    => 'missing_headers',
				'message' => __( 'Some header cells in row 1 are empty. FlexTable always uses the first row as the header.', 'sheets-to-wp-table-live-sync' ),
			];
		}

		$filled = array_filter(
			$headers,
			function ( $h ) {
				return '' !== $h;
			}
		);
		if ( count( $filled ) !== count( array_unique( array_map( 'strtolower', $filled ) ) ) ) {
			$warnings[] = [
				'code'    => 'duplicate_headers',
				'message' => __( 'Some column headers are duplicated, so refer to those columns by position (Col #n).', 'sheets-to-wp-table-live-sync' ),
			];
		}

		$blank = 0;
		foreach ( $data['rows'] as $row ) {
			if ( '' === implode( '', $row ) ) {
				$blank++;
			}
		}
		if ( $blank ) {
			$warnings[] = [
				'code'    => 'blank_rows',
				/* translators: %d: number of rows. */
				'message' => sprintf( __( '%d blank rows found in the sheet.', 'sheets-to-wp-table-live-sync' ), $blank ),
			];
		}

		if ( count( $data['rows'] ) > 5000 ) {
			$warnings[] = [
				'code'    => 'large_dataset',
				'message' => __( 'This is a large sheet. Turning on the table cache is recommended.', 'sheets-to-wp-table-live-sync' ),
			];
		}

		return $warnings;
	}

	/**
	 * "Not public" error, worded like the dashboard.
	 *
	 * @return WP_Error
	 */
	private static function not_public() {
		return new WP_Error(
			'sheet_not_public',
			__( 'The sheet is not public, or the sheet or worksheet does not exist.', 'sheets-to-wp-table-live-sync' ),
			[ 'hint' => __( 'In Google Sheets click Share → General access → "Anyone with the link" (Viewer), and check that the URL is the one of the worksheet tab you want.', 'sheets-to-wp-table-live-sync' ) ]
		);
	}

	/**
	 * Builds a validation error.
	 *
	 * @param string $code    Code.
	 * @param string $message Message.
	 * @return WP_Error
	 */
	private static function error( $code, $message ) {
		return new WP_Error( $code, $message );
	}
}
