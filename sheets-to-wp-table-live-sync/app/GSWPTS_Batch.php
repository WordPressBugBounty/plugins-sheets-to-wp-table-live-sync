<?php
/**
 * Server-side pagination (batch loading).
 *
 * The Google CSV export cannot be paged, so the sheet is downloaded once per
 * version (a "snapshot"), split into lines and stored in small chunks. The
 * first batch is rendered immediately and every following batch is a cheap
 * slice of that snapshot. Pro sheet features (styles, merges, images, links)
 * are fetched separately so slow Apps Script calls never block the rows.
 *
 * @since 3.27.0
 * @package GSWPTS
 */

namespace GSWPTS;

use WP_Error;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manages server-side pagination.
 *
 * @since 3.27.0
 */
class GSWPTS_Batch {

	/**
	 * Option names.
	 */
	const OPTION_ENABLED    = 'server_side_pagination';
	const OPTION_BATCH_SIZE = 'server_side_batch_size';
	const OPTION_INDICATOR  = 'batch_loading_indicator';

	/**
	 * Batch size defaults and limits.
	 */
	const DEFAULT_BATCH_SIZE = 25;
	const MAX_BATCH_SIZE     = 5000;
	const BATCH_SIZES        = [ 25, 50, 100, 250, 500, 1000 ];

	/**
	 * Number of rows stored per snapshot chunk.
	 */
	const CHUNK_SIZE = 500;

	/**
	 * Minimum lifetime of a snapshot, long enough for one page load to
	 * fetch every batch.
	 */
	const SESSION_TTL = 900;

	/**
	 * Minimum lifetime of cached feature data when table cache is on. With
	 * table cache off, feature data only serves the page load that fetched it.
	 */
	const FEATURE_TTL = 300;

	/**
	 * Row range limits of one feature (Apps Script) request. Every Apps
	 * Script execution has a fixed start-up cost and counts against the web
	 * app quota, so very small batch sizes are grouped up to the minimum;
	 * large ones are capped to keep each execution short.
	 */
	const MIN_FEATURE_CHUNK = 250;
	const MAX_FEATURE_CHUNK = 1000;

	/**
	 * Class constructor.
	 */
	public function __construct() {
		add_action( 'wp_ajax_gswpts_sheet_fetch_batch', [ $this, 'ajax_fetch_batch' ] );
		add_action( 'wp_ajax_nopriv_gswpts_sheet_fetch_batch', [ $this, 'ajax_fetch_batch' ] );
		add_action( 'wp_ajax_gswpts_sheet_fetch_features', [ $this, 'ajax_fetch_features' ] );
		add_action( 'wp_ajax_nopriv_gswpts_sheet_fetch_features', [ $this, 'ajax_fetch_features' ] );
	}

	/**
	 * Whether server-side pagination is active. It depends on asynchronous
	 * loading and, with Pro active, on a Pro version that supports batches.
	 *
	 * @param int $table_id Optional table id passed to the filter.
	 * @return bool
	 */
	public function is_enabled( int $table_id = 0 ): bool {
		$enabled = 'off' !== get_option( self::OPTION_ENABLED, 'on' ) && 'on' === get_option( 'asynchronous_loading' );

		if ( $enabled && gswpts()->helpers->is_pro_active() && ! $this->pro_supports_batch() ) {
			$enabled = false;
		}

		return (bool) apply_filters( 'gswpts_server_side_pagination_enabled', $enabled, $table_id );
	}

	/**
	 * Whether the installed Pro version can render batches.
	 *
	 * @return bool
	 */
	public function pro_supports_batch(): bool {
		return function_exists( 'swptlspro' ) && isset( swptlspro()->helpers ) && property_exists( swptlspro()->helpers, 'row_offset' );
	}

	/**
	 * Configured batch size.
	 *
	 * @return int
	 */
	public function get_batch_size(): int {
		$size = absint( get_option( self::OPTION_BATCH_SIZE, self::DEFAULT_BATCH_SIZE ) );
		return $size > 0 ? min( $size, self::MAX_BATCH_SIZE ) : self::DEFAULT_BATCH_SIZE;
	}

	/**
	 * Rows per feature (Apps Script) request: the batch size, kept between
	 * MIN_FEATURE_CHUNK and MAX_FEATURE_CHUNK.
	 *
	 * @return int
	 */
	public function get_feature_chunk(): int {
		$chunk = max( self::MIN_FEATURE_CHUNK, min( self::MAX_FEATURE_CHUNK, $this->get_batch_size() ) );
		return (int) apply_filters( 'gswpts_feature_chunk_size', $chunk );
	}

	/**
	 * Whether the loading indicator is shown.
	 *
	 * @return bool
	 */
	public function show_indicator(): bool {
		return 'show' === get_option( self::OPTION_INDICATOR, 'hide' );
	}

	/**
	 * Settings shared with the frontend and the admin app.
	 *
	 * @return array
	 */
	public function get_client_config(): array {
		return [
			'server_side_pagination' => $this->is_enabled() ? 'on' : 'off',
			'batch_size'             => $this->get_batch_size(),
			'batch_indicator'        => $this->show_indicator() ? 'show' : 'hide',
		];
	}

	/**
	 * Render the first batch of a table. Used by the regular fetch and preview
	 * endpoints when the client asked for batch loading.
	 *
	 * @param array  $table      The table row.
	 * @param array  $settings   Settings used for rendering.
	 * @param string $name       The table name.
	 * @param bool   $from_block Whether the request came from the block editor.
	 * @return array|WP_Error { html: string, batch: array }
	 */
	public function render_first_batch( array $table, array $settings, string $name, bool $from_block = false ) {
		$snapshot = $this->get_snapshot( $table );

		if ( is_wp_error( $snapshot ) ) {
			return $snapshot;
		}

		$saved_settings = $this->get_saved_settings( $table );
		$limit          = $this->get_batch_size();
		// Identifies this page load; feature data is scoped to it when table cache is off.
		$load_id        = strtolower( wp_generate_password( 10, false, false ) );
		$features       = $this->get_features( $table, $saved_settings, $snapshot, 0, $limit, false, $load_id );
		$rendered       = $this->render_range( $table, $settings, $name, $snapshot, 0, $limit, $features['data'], $from_block );

		if ( is_wp_error( $rendered ) ) {
			return $rendered;
		}

		return [
			'html'  => $rendered['html'],
			'batch' => [
				'snapshot_id'   => $snapshot['snapshot_id'],
				'load_id'       => $load_id,
				'total_rows'    => $snapshot['total'],
				'loaded'        => $rendered['count'],
				'next_offset'   => $rendered['count'],
				'has_more'      => $rendered['count'] < $snapshot['total'],
				'batch_size'    => $limit,
				'indicator'     => $this->show_indicator(),
				'enriched'      => $features['enriched'],
				'features'      => 'none' !== $features['status'],
				'feature_chunk' => $this->get_feature_chunk(),
			],
		];
	}

	/**
	 * AJAX: fetch the next batch of rows.
	 */
	public function ajax_fetch_batch() {
		$context = $this->get_request_context();

		$snapshot = $this->find_snapshot( $context['table_id'], $this->posted_snapshot_id() );

		if ( ! $snapshot ) {
			wp_send_json_error( [ 'type' => 'snapshot_expired' ] );
		}

		$offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified in get_request_context().
		$limit  = isset( $_POST['limit'] ) ? absint( $_POST['limit'] ) : $this->get_batch_size(); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$limit  = max( 1, min( $limit, self::MAX_BATCH_SIZE ) );

		$features = $this->get_features( $context['table'], $context['saved_settings'], $snapshot, $offset, $limit, false, $context['load_id'] );
		$rendered = $this->render_range( $context['table'], $context['settings'], $context['name'], $snapshot, $offset, $limit, $features['data'], $context['from_block'] );

		if ( is_wp_error( $rendered ) ) {
			wp_send_json_error( [ 'type' => $rendered->get_error_code() ] );
		}

		$next = $offset + $rendered['count'];

		wp_send_json_success([
			'rows_html'   => $this->extract_between( $rendered['html'], '<tbody>', '</tbody>' ),
			'snapshot_id' => $snapshot['snapshot_id'],
			'offset'      => $offset,
			'count'       => $rendered['count'],
			'next_offset' => $next,
			'total_rows'  => $snapshot['total'],
			'has_more'    => $next < $snapshot['total'],
			'enriched'    => $features['enriched'],
		]);
	}

	/**
	 * AJAX: fetch Pro sheet features for a row range and return the rows
	 * rendered with them. Slow Apps Script work happens here, outside the
	 * batch requests.
	 */
	public function ajax_fetch_features() {
		$context = $this->get_request_context();

		$snapshot = $this->find_snapshot( $context['table_id'], $this->posted_snapshot_id() );

		if ( ! $snapshot ) {
			wp_send_json_error( [ 'type' => 'snapshot_expired' ] );
		}

		$start = isset( $_POST['start'] ) ? absint( $_POST['start'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified in get_request_context().
		$count = isset( $_POST['count'] ) ? absint( $_POST['count'] ) : $this->get_feature_chunk(); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		// The first range is the first batch, later ranges follow get_feature_chunk().
		$count = max( 1, min( $count, max( $this->get_feature_chunk(), $this->get_batch_size() ) ) );

		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}

		$features = $this->get_features( $context['table'], $context['saved_settings'], $snapshot, $start, $count, true, $context['load_id'] );

		if ( in_array( $features['status'], [ 'busy', 'none' ], true ) ) {
			wp_send_json_success( [ 'status' => $features['status'] ] );
		}

		$rendered = $this->render_range( $context['table'], $context['settings'], $context['name'], $snapshot, $start, $count, $features['data'], $context['from_block'] );

		if ( is_wp_error( $rendered ) ) {
			wp_send_json_error( [ 'type' => $rendered->get_error_code() ] );
		}

		wp_send_json_success([
			'status'    => $features['status'],
			'start'     => $start,
			'count'     => $rendered['count'],
			'rows_html' => $this->extract_between( $rendered['html'], '<tbody>', '</tbody>' ),
			'head_html' => 0 === $start ? $this->extract_between( $rendered['html'], '<thead>', '</thead>' ) : '',
		]);
	}

	/**
	 * Validate a batch/feature request and collect what is needed to render it.
	 * Frontend requests use the public sheet nonce and saved settings; editor
	 * previews use the admin nonce and may send unsaved settings.
	 *
	 * @return array
	 */
	private function get_request_context(): array {
		$nonce      = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		$is_preview = false;

		if ( ! wp_verify_nonce( $nonce, 'gswpts_sheet_nonce_action' ) ) {
			if ( wp_verify_nonce( $nonce, 'swptls-admin-app-nonce-action' ) && current_user_can( 'manage_options' ) ) {
				$is_preview = true;
			} else {
				wp_send_json_error([
					'type'    => 'invalid_request',
					'message' => __( 'Action is invalid', 'sheets-to-wp-table-live-sync' ),
				]);
			}
		}

		$table_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
		$table    = $table_id ? gswpts()->database->table->get( $table_id ) : null;

		if ( ! $table ) {
			wp_send_json_error([
				'type'    => 'no_table_found',
				'message' => esc_html__( 'No table found.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$saved_settings = $this->get_saved_settings( $table );
		$settings       = $saved_settings;

		if ( $is_preview && ! empty( $_POST['table_settings'] ) && ! is_array( $_POST['table_settings'] ) ) {
			$posted = json_decode( sanitize_text_field( wp_unslash( $_POST['table_settings'] ) ), true );
			if ( is_array( $posted ) ) {
				$settings = $posted;
			}
		}

		$disable_for_non_logged = isset( $saved_settings['user_auth_filtering']['disable_for_non_logged'] )
			&& wp_validate_boolean( $saved_settings['user_auth_filtering']['disable_for_non_logged'] );

		if ( ! $is_preview && $disable_for_non_logged && ! is_user_logged_in() ) {
			wp_send_json_error( [ 'type' => 'non_logged_restricted' ] );
		}

		$name = $is_preview && isset( $_POST['table_name'] ) ? sanitize_text_field( wp_unslash( $_POST['table_name'] ) ) : esc_attr( $table['table_name'] );

		return [
			'table_id'       => $table_id,
			'table'          => $table,
			'settings'       => $settings,
			'saved_settings' => $saved_settings,
			'name'           => $name,
			'from_block'     => isset( $_POST['fromGutenBlock'] ) && wp_validate_boolean( wp_unslash( $_POST['fromGutenBlock'] ) ), // phpcs:ignore
			'load_id'        => isset( $_POST['load_id'] ) ? sanitize_key( wp_unslash( $_POST['load_id'] ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified above.
		];
	}

	/**
	 * Posted snapshot id.
	 *
	 * @return string
	 */
	private function posted_snapshot_id(): string {
		return isset( $_POST['snapshot_id'] ) ? sanitize_key( wp_unslash( $_POST['snapshot_id'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified in get_request_context().
	}

	/**
	 * Saved table settings.
	 *
	 * @param array $table The table row.
	 * @return array
	 */
	private function get_saved_settings( array $table ): array {
		$settings = json_decode( $table['table_settings'], true );
		$settings = null !== $settings ? $settings : maybe_unserialize( $table['table_settings'] );
		return is_array( $settings ) ? $settings : [];
	}

	/**
	 * Whether "Cache table for faster loading time" is on for the table.
	 *
	 * @param array $saved_settings Saved table settings.
	 * @return bool
	 */
	private function is_table_cache_on( array $saved_settings ): bool {
		return wp_validate_boolean( $saved_settings['table_cache'] ?? false );
	}

	/**
	 * Lifetime of a snapshot: the table cache duration when table cache is on,
	 * otherwise just long enough for one page load to fetch every batch.
	 *
	 * @param array $saved_settings Saved table settings.
	 * @return int
	 */
	private function get_snapshot_ttl( array $saved_settings ): int {
		return $this->is_table_cache_on( $saved_settings ) ? max( self::SESSION_TTL, (int) gswpts()->cache->get_data_cache_ttl() ) : self::SESSION_TTL;
	}

	/**
	 * Get the snapshot (row pieces) to serve a page load from.
	 *
	 * With table cache on, the snapshot is the table cache: a pointer records
	 * the current version, and it is reused as long as the sheet is unchanged
	 * (one last-updated check per page load, none with "disable frequent
	 * cache"). The first batch then reads one small piece, whatever the sheet
	 * size, and the legacy single full sheet cache entry is not written.
	 * With table cache off, the sheet is downloaded on every page load, as
	 * before, and the pieces only live for that page load.
	 *
	 * @param array $table The table row.
	 * @return array|WP_Error
	 */
	public function get_snapshot( array $table ) {
		$table_id       = absint( $table['id'] );
		$saved_settings = $this->get_saved_settings( $table );
		$sheet_url      = esc_url( $table['source_url'] );
		$cache_on       = $this->is_table_cache_on( $saved_settings );

		if ( $cache_on ) {
			$cached = $this->get_cached_snapshot( $table_id, $sheet_url, $saved_settings );

			if ( $cached ) {
				return $cached;
			}
		}

		$csv = gswpts()->helpers->get_csv_data( $sheet_url, gswpts()->helpers->get_sheet_id( $sheet_url ), gswpts()->helpers->get_grid_id( $sheet_url ) );

		if ( ! is_string( $csv ) || '' === trim( $csv ) ) {
			return new WP_Error( 'invalid_request', __( 'Please make it public by clicking on share button at the top of spreadsheet', 'sheets-to-wp-table-live-sync' ) );
		}

		$ttl      = $this->get_snapshot_ttl( $saved_settings );
		$snapshot = $this->store_snapshot( $table_id, $csv, $ttl );

		if ( $cache_on ) {
			// Same last-updated bookkeeping the table cache always used.
			gswpts()->cache->set_last_updated_time( $table_id, $sheet_url );

			// The cached version is served for exactly the configured cache duration;
			// its pieces may live longer ($ttl) so a page load in progress can finish.
			set_transient(
				$this->pointer_key( $table_id ),
				[
					'snapshot_id' => $snapshot['snapshot_id'],
					'source_url'  => $sheet_url,
				],
				(int) gswpts()->cache->get_data_cache_ttl()
			);
		}

		return $snapshot;
	}

	/**
	 * The cached snapshot of a table, when it is still valid.
	 *
	 * @param int    $table_id       The table id.
	 * @param string $sheet_url      The table sheet url.
	 * @param array  $saved_settings Saved table settings.
	 * @return array|null
	 */
	private function get_cached_snapshot( int $table_id, string $sheet_url, array $saved_settings ) {
		$pointer = get_transient( $this->pointer_key( $table_id ) );

		// A changed sheet url always starts a new version.
		if ( ! is_array( $pointer ) || ( $pointer['source_url'] ?? '' ) !== $sheet_url ) {
			return null;
		}

		$snapshot = $this->find_snapshot( $table_id, (string) $pointer['snapshot_id'] );

		if ( ! $snapshot || ( $snapshot['chunks'] > 0 && ! is_array( get_transient( $this->chunk_key( $table_id, $snapshot['snapshot_id'], 0 ) ) ) ) ) {
			return null;
		}

		$disable_frequent = wp_validate_boolean( $saved_settings['disable_frequent_cache'] ?? false );

		if ( ! $disable_frequent && gswpts()->cache->is_updated( $table_id, $sheet_url ) ) {
			return null;
		}

		return $snapshot;
	}

	/**
	 * Remove a table's cached version, so the next page load fetches the sheet.
	 * The pieces themselves expire on their own.
	 *
	 * @param int $table_id The table id.
	 */
	public function clear_table_cache( int $table_id ) {
		delete_transient( $this->pointer_key( $table_id ) );
	}

	/**
	 * Split a CSV into row pieces and store them. The snapshot id is derived
	 * from the content, so identical content reuses the stored pieces.
	 *
	 * @param int    $table_id The table id.
	 * @param string $csv      The sheet CSV.
	 * @param int    $ttl      Lifetime in seconds.
	 * @return array
	 */
	private function store_snapshot( int $table_id, string $csv, int $ttl ): array {
		$snapshot_id = substr( md5( $csv ), 0, 12 );
		$existing    = get_transient( $this->snapshot_key( $table_id, $snapshot_id ) );

		// Reuse stored pieces while they still have at least half of the wanted lifetime left.
		if ( is_array( $existing ) && (int) $existing['ttl'] >= $ttl && ( time() - (int) $existing['created'] ) < ( $ttl / 2 ) ) {
			return $existing;
		}

		// Same split generate_html() uses, so batches render exactly like a full table.
		$lines  = str_getcsv( $csv, "\n" );
		$header = array_shift( $lines );
		$chunks = array_chunk( $lines, self::CHUNK_SIZE );

		foreach ( $chunks as $index => $chunk ) {
			set_transient( $this->chunk_key( $table_id, $snapshot_id, $index ), $chunk, $ttl );
		}

		$snapshot = [
			'snapshot_id' => $snapshot_id,
			'header'      => $header,
			'total'       => count( $lines ),
			'chunks'      => count( $chunks ),
			'chunk_size'  => self::CHUNK_SIZE,
			'created'     => time(),
			'ttl'         => $ttl,
		];

		set_transient( $this->snapshot_key( $table_id, $snapshot_id ), $snapshot, $ttl );

		return $snapshot;
	}

	/**
	 * Find a stored snapshot.
	 *
	 * @param int    $table_id    The table id.
	 * @param string $snapshot_id The snapshot id.
	 * @return array|null
	 */
	public function find_snapshot( int $table_id, string $snapshot_id ) {
		if ( ! $table_id || '' === $snapshot_id ) {
			return null;
		}

		$snapshot = get_transient( $this->snapshot_key( $table_id, $snapshot_id ) );

		return is_array( $snapshot ) ? $snapshot : null;
	}

	/**
	 * Read body lines from a snapshot.
	 *
	 * @param int   $table_id The table id.
	 * @param array $snapshot The snapshot.
	 * @param int   $offset   0-based body row offset.
	 * @param int   $limit    Number of rows.
	 * @return array|WP_Error
	 */
	private function get_lines( int $table_id, array $snapshot, int $offset, int $limit ) {
		$total = (int) $snapshot['total'];

		if ( $offset >= $total || $limit <= 0 ) {
			return [];
		}

		$size  = (int) $snapshot['chunk_size'];
		$end   = min( $offset + $limit, $total );
		$lines = [];

		for ( $chunk_index = intdiv( $offset, $size ); $chunk_index * $size < $end; $chunk_index++ ) {
			$chunk = get_transient( $this->chunk_key( $table_id, $snapshot['snapshot_id'], $chunk_index ) );

			if ( ! is_array( $chunk ) ) {
				return new WP_Error( 'snapshot_expired' );
			}

			$chunk_start = $chunk_index * $size;
			$from        = max( $offset, $chunk_start ) - $chunk_start;
			$to          = min( $end, $chunk_start + count( $chunk ) ) - $chunk_start;

			if ( $to > $from ) {
				array_push( $lines, ...array_slice( $chunk, $from, $to - $from ) );
			}
		}

		return $lines;
	}

	/**
	 * Render a range of rows with the free or Pro renderer.
	 *
	 * @param array  $table      The table row.
	 * @param array  $settings   Settings used for rendering.
	 * @param string $name       The table name.
	 * @param array  $snapshot   The snapshot.
	 * @param int    $offset     0-based body row offset.
	 * @param int    $limit      Number of rows.
	 * @param array  $features   Feature data (Pro).
	 * @param bool   $from_block Whether the request came from the block editor.
	 * @return array|WP_Error { html: string, count: int }
	 */
	private function render_range( array $table, array $settings, string $name, array $snapshot, int $offset, int $limit, array $features = [], bool $from_block = false ) {
		$lines = $this->get_lines( absint( $table['id'] ), $snapshot, $offset, $limit );

		if ( is_wp_error( $lines ) ) {
			return $lines;
		}

		$table_data = array_merge(
			[ 'sheet_styles' => [] ],
			$features,
			[
				'sheet_data'  => '',
				'sheet_lines' => array_merge( [ $snapshot['header'] ], $lines ),
			]
		);

		$helpers = gswpts()->helpers->is_pro_active() ? swptlspro()->helpers : gswpts()->helpers;

		$helpers->row_offset = $offset;

		try {
			$html = $helpers->generate_html( $name, $settings, $table_data, $from_block, absint( $table['id'] ) );
		} finally {
			$helpers->row_offset = 0;
		}

		return [
			'html'  => (string) $html,
			'count' => count( $lines ),
		];
	}

	/**
	 * Feature data for a row range.
	 *
	 * Status values: `none` (no Pro features enabled), `ok`, `pending` (not
	 * fetched yet), `busy` (another request is fetching), `failed`.
	 *
	 * @param array $table          The table row.
	 * @param array $saved_settings Saved table settings (feature flags).
	 * @param array $snapshot       The snapshot.
	 * @param int   $start          0-based body row offset.
	 * @param int    $count          Number of rows.
	 * @param bool   $fetch          Whether Apps Script may be called.
	 * @param string $load_id        The page load id (scopes the data when table cache is off).
	 * @return array { status: string, enriched: bool, data: array }
	 */
	private function get_features( array $table, array $saved_settings, array $snapshot, int $start, int $count, bool $fetch, string $load_id = '' ): array {
		if ( ! gswpts()->helpers->is_pro_active() || ! method_exists( swptlspro()->helpers, 'get_batch_feature_data' ) || ! $this->has_features( $saved_settings ) ) {
			return [ 'status' => 'none', 'enriched' => true, 'data' => [] ];
		}

		$table_id = absint( $table['id'] );
		$scope    = $this->feature_scope( $saved_settings, $snapshot, $load_id );

		// Fallback for web apps without row ranges: the whole sheet, fetched once.
		$full = get_transient( $this->feature_key( $table_id, $scope, 'full' ) );
		if ( is_array( $full ) ) {
			return [ 'status' => 'ok', 'enriched' => true, 'data' => $this->slice_features( $full, $start, $count ) ];
		}

		// Features are stored in fixed, aligned row blocks, so any batch (and any
		// visitor) finds them, whatever range it asks for.
		$block_size = $this->get_feature_chunk();
		$first      = intdiv( $start, $block_size );
		$last       = intdiv( $start + max( 1, $count ) - 1, $block_size );
		$blocks     = [];
		$missing    = [];

		for ( $block = $first; $block <= $last; $block++ ) {
			$data = get_transient( $this->feature_key( $table_id, $scope, 'b' . $block ) );

			if ( is_array( $data ) ) {
				$blocks[ $block ] = $data;
			} else {
				$missing[] = $block;
			}
		}

		if ( empty( $missing ) ) {
			return [ 'status' => 'ok', 'enriched' => true, 'data' => $this->slice_features( $this->merge_blocks( $blocks ), $start, $count ) ];
		}

		if ( ! $fetch ) {
			return [ 'status' => 'pending', 'enriched' => false, 'data' => [] ];
		}

		$ttl       = $this->is_table_cache_on( $saved_settings ) ? max( self::FEATURE_TTL, (int) gswpts()->cache->get_data_cache_ttl() ) : self::SESSION_TTL;
		$sheet_url = $table['source_url'];
		$sheet_id  = (string) gswpts()->helpers->get_sheet_id( $sheet_url );
		$gid       = (int) gswpts()->helpers->get_grid_id( $sheet_url );
		$support   = method_exists( swptlspro()->helpers, 'get_appscript_range_support' ) ? swptlspro()->helpers->get_appscript_range_support() : 'no';
		$failed    = false;
		$busy      = false;

		if ( 'no' === $support ) {
			$missing = [ -1 ];
		}

		foreach ( $missing as $block ) {
			// Only one request at a time fetches a block (or the whole sheet).
			$lock_key = $this->feature_key( $table_id, $scope, $block < 0 ? 'lock' : 'lock_b' . $block );

			if ( get_transient( $lock_key ) ) {
				$busy = true;
				continue;
			}

			set_transient( $lock_key, 1, 120 );

			$result = $block < 0
				? swptlspro()->helpers->get_batch_feature_data( $saved_settings, $sheet_id, $gid )
				: swptlspro()->helpers->get_batch_feature_data( $saved_settings, $sheet_id, $gid, $block * $block_size, $block_size );

			delete_transient( $lock_key );

			$data = $this->index_features( $result['data'] );

			// The web app turned out not to support ranges: it answered with the whole sheet.
			if ( 'full' === $result['scope'] ) {
				if ( $result['ok'] ) {
					set_transient( $this->feature_key( $table_id, $scope, 'full' ), $data, $ttl );
				}

				return [ 'status' => $result['ok'] ? 'ok' : 'failed', 'enriched' => true, 'data' => $this->slice_features( $data, $start, $count ) ];
			}

			if ( $result['ok'] ) {
				set_transient( $this->feature_key( $table_id, $scope, 'b' . $block ), $data, $ttl );
			} else {
				$failed = true;
			}

			$blocks[ $block ] = $data;
		}

		// Another request is fetching a block we need; the client asks again shortly.
		if ( $busy ) {
			return [ 'status' => 'busy', 'enriched' => false, 'data' => [] ];
		}

		return [ 'status' => $failed ? 'failed' : 'ok', 'enriched' => true, 'data' => $this->slice_features( $this->merge_blocks( $blocks ), $start, $count ) ];
	}

	/**
	 * Cache scope of feature data: the sheet version and the enabled features,
	 * plus the page load when table cache is off (so every visit is fresh).
	 *
	 * @param array  $saved_settings Saved table settings.
	 * @param array  $snapshot       The snapshot.
	 * @param string $load_id        The page load id.
	 * @return string
	 */
	private function feature_scope( array $saved_settings, array $snapshot, string $load_id ): string {
		$flags = [];
		foreach ( [ 'import_styles', 'merged_support', 'table_img_support', 'table_link_support' ] as $flag ) {
			$flags[] = wp_validate_boolean( $saved_settings[ $flag ] ?? false ) ? 1 : 0;
		}

		$scope = $snapshot['snapshot_id'] . implode( '', $flags );

		if ( ! $this->is_table_cache_on( $saved_settings ) ) {
			$scope .= '_' . ( '' !== $load_id ? $load_id : 'x' );
		}

		return $scope;
	}

	/**
	 * Merge indexed feature blocks into one indexed data set.
	 *
	 * @param array $blocks Indexed feature data per block.
	 * @return array
	 */
	private function merge_blocks( array $blocks ): array {
		$merged = [];

		foreach ( $blocks as $data ) {
			foreach ( (array) ( $data['sheet_styles'] ?? [] ) as $style => $rows ) {
				$merged['sheet_styles'][ $style ] = ( $merged['sheet_styles'][ $style ] ?? [] ) + (array) $rows;
			}

			foreach ( (array) ( $data['sheet_merged_data'] ?? [] ) as $merge ) {
				// A merge spanning two blocks is returned by both.
				$merged['sheet_merged_data'][ md5( wp_json_encode( $merge ) ) ] = $merge;
			}

			foreach ( [ 'sheet_images', 'sheet_links' ] as $key ) {
				foreach ( (array) ( $data[ $key ] ?? [] ) as $row => $cells ) {
					$merged[ $key ][ $row ] = ( $merged[ $key ][ $row ] ?? [] ) + (array) $cells;
				}
			}
		}

		if ( isset( $merged['sheet_merged_data'] ) ) {
			$merged['sheet_merged_data'] = array_values( $merged['sheet_merged_data'] );
		}

		return $merged;
	}

	/**
	 * Whether any Pro sheet feature is enabled for the table.
	 *
	 * @param array $settings Saved table settings.
	 * @return bool
	 */
	private function has_features( array $settings ): bool {
		foreach ( [ 'import_styles', 'merged_support', 'table_img_support', 'table_link_support' ] as $flag ) {
			if ( wp_validate_boolean( $settings[ $flag ] ?? false ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Decode full sheet feature data once and group image/link entries by row,
	 * so each batch only touches the rows it renders.
	 *
	 * @param array $data Raw feature data.
	 * @return array
	 */
	private function index_features( array $data ): array {
		foreach ( [ 'sheet_images', 'sheet_links' ] as $key ) {
			if ( ! isset( $data[ $key ] ) ) {
				continue;
			}

			$decoded = is_string( $data[ $key ] ) ? json_decode( $data[ $key ], true ) : $data[ $key ];
			$by_row  = [];

			foreach ( (array) $decoded as $cell_key => $value ) {
				if ( preg_match( '/^row_(\d+)_col_/', (string) $cell_key, $match ) ) {
					$by_row[ (int) $match[1] ][ $cell_key ] = $value;
				}
			}

			$data[ $key ] = $by_row;
		}

		return $data;
	}

	/**
	 * Limit indexed full sheet feature data to the rows of one range.
	 *
	 * @param array $data  Indexed feature data.
	 * @param int   $start 0-based body row offset.
	 * @param int   $count Number of rows.
	 * @return array
	 */
	private function slice_features( array $data, int $start, int $count ): array {
		// Absolute body rows are 1-based, the header is row 0.
		$from  = $start + 1;
		$to    = $start + $count;
		$slice = [];

		if ( isset( $data['sheet_styles'] ) && is_array( $data['sheet_styles'] ) ) {
			foreach ( $data['sheet_styles'] as $style => $rows ) {
				if ( ! is_array( $rows ) ) {
					continue;
				}
				$slice['sheet_styles'][ $style ] = [];
				foreach ( $rows as $row => $values ) {
					if ( 0 === $row || ( $row >= $from && $row <= $to ) ) {
						$slice['sheet_styles'][ $style ][ $row ] = $values;
					}
				}
			}
		}

		if ( isset( $data['sheet_merged_data'] ) && is_array( $data['sheet_merged_data'] ) ) {
			$slice['sheet_merged_data'] = array_values( array_filter( $data['sheet_merged_data'], function ( $merge ) use ( $from, $to ) {
				$first = (int) ( $merge['startRow'] ?? -1 );
				$last  = $first + max( 1, (int) ( $merge['numRows'] ?? 1 ) ) - 1;
				return 0 === $first || ( $first <= $to && $last >= $from );
			} ) );
		}

		foreach ( [ 'sheet_images', 'sheet_links' ] as $key ) {
			if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
				continue;
			}

			$cells = [];
			for ( $row = $from; $row <= $to; $row++ ) {
				if ( isset( $data[ $key ][ $row ] ) ) {
					$cells += $data[ $key ][ $row ];
				}
			}

			// generate_html() expects the image and link data as JSON strings.
			$slice[ $key ] = wp_json_encode( (object) $cells );
		}

		return $slice;
	}

	/**
	 * Return the markup between the first $open and the last $close tag.
	 *
	 * @param string $html  The html.
	 * @param string $open  Opening tag.
	 * @param string $close Closing tag.
	 * @return string
	 */
	private function extract_between( string $html, string $open, string $close ): string {
		$start = strpos( $html, $open );
		$end   = '</thead>' === $close ? strpos( $html, $close ) : strrpos( $html, $close );

		if ( false === $start || false === $end || $end < $start ) {
			return '';
		}

		$start += strlen( $open );

		return substr( $html, $start, $end - $start );
	}

	/**
	 * Snapshot meta transient key.
	 *
	 * @param int    $table_id    The table id.
	 * @param string $snapshot_id The snapshot id.
	 * @return string
	 */
	private function snapshot_key( int $table_id, string $snapshot_id ): string {
		return sprintf( 'gswpts_snap_%d_%s', $table_id, $snapshot_id );
	}

	/**
	 * Snapshot chunk transient key.
	 *
	 * @param int    $table_id    The table id.
	 * @param string $snapshot_id The snapshot id.
	 * @param int    $index       The chunk index.
	 * @return string
	 */
	private function chunk_key( int $table_id, string $snapshot_id, int $index ): string {
		return sprintf( 'gswpts_snap_%d_%s_%d', $table_id, $snapshot_id, $index );
	}

	/**
	 * Transient key of the pointer to a table's cached version (table cache on).
	 *
	 * @param int $table_id The table id.
	 * @return string
	 */
	private function pointer_key( int $table_id ): string {
		return sprintf( 'gswpts_snap_current_%d', $table_id );
	}

	/**
	 * Feature data transient key.
	 *
	 * @param int    $table_id The table id.
	 * @param string $scope    The feature scope (see feature_scope()).
	 * @param string $suffix   Block, full sheet or lock.
	 * @return string
	 */
	private function feature_key( int $table_id, string $scope, string $suffix ): string {
		return sprintf( 'gswpts_snapf_%d_%s_%s', $table_id, $scope, $suffix );
	}
}
