<?php
/**
 * FlexTable table storage for MCP.
 *
 * Reads and writes rows through FlexTable's own data-access class
 * (`gswpts()->database->table`), never through the AJAX handlers.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

use GSWPTS\MCP\Safety\RequestContext;
use GSWPTS\MCP\Safety\SnapshotStore;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Table rows, references and default settings.
 *
 * @since 3.26.0
 */
class TableStore {

	/**
	 * Cached default settings.
	 *
	 * @var array|null
	 */
	private static $defaults = null;

	/**
	 * Dashboard default table settings (copy of react/src/Helpers.js
	 * getDefaultSettings(), generated into app/MCP/Data).
	 *
	 * @return array
	 */
	public static function default_settings() {
		if ( null === self::$defaults ) {
			$file           = dirname( __DIR__ ) . '/Data/default-table-settings.json';
			$json           = file_exists( $file ) ? file_get_contents( $file ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$decoded        = json_decode( (string) $json, true );
			self::$defaults = is_array( $decoded ) ? $decoded : [];
		}

		return self::$defaults;
	}

	/**
	 * One table, or null.
	 *
	 * @param int $id Table ID.
	 * @return array|null {id, table_name, source_url, source_type, settings, raw_settings}
	 */
	public static function get( $id ) {
		$row = gswpts()->database->table->get( (int) $id );
		return $row ? self::hydrate( $row ) : null;
	}

	/**
	 * All tables (hydrated), newest first.
	 *
	 * @return array
	 */
	public static function all() {
		$rows = gswpts()->database->table->get_all();
		$out  = [];

		foreach ( (array) $rows as $row ) {
			$out[] = self::hydrate( (array) $row );
		}

		usort(
			$out,
			function ( $a, $b ) {
				return $b['id'] - $a['id'];
			}
		);

		return $out;
	}

	/**
	 * Decodes a stored row.
	 *
	 * @param array $row DB row.
	 * @return array
	 */
	public static function hydrate( array $row ) {
		$raw = isset( $row['table_settings'] ) ? (string) $row['table_settings'] : '';

		return [
			'id'           => (int) $row['id'],
			'table_name'   => isset( $row['table_name'] ) ? (string) $row['table_name'] : '',
			'source_url'   => html_entity_decode( isset( $row['source_url'] ) ? (string) $row['source_url'] : '', ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
			'source_type'  => isset( $row['source_type'] ) ? (string) $row['source_type'] : '',
			'settings'     => self::decode_settings( $raw ),
			'raw_settings' => $raw,
		];
	}

	/**
	 * Decodes table_settings (JSON, or legacy serialized data).
	 *
	 * @param string $raw Raw value.
	 * @return array
	 */
	public static function decode_settings( $raw ) {
		$decoded = json_decode( $raw, true );

		if ( is_array( $decoded ) ) {
			return $decoded;
		}

		if ( is_serialized( $raw ) ) {
			$value = @unserialize( trim( $raw ), [ 'allowed_classes' => false ] ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize
			if ( is_array( $value ) ) {
				return $value;
			}
		}

		return [];
	}

	/**
	 * Fingerprint of a row, used to detect changes between preview and apply.
	 *
	 * @param array|null $table Hydrated table.
	 * @return string
	 */
	public static function version( $table ) {
		if ( ! $table ) {
			return 'missing';
		}
		return md5( $table['table_name'] . '|' . $table['source_url'] . '|' . $table['raw_settings'] );
	}

	/**
	 * Inserts a table the same way the dashboard does.
	 *
	 * @param string $name       Name.
	 * @param string $source_url Source URL.
	 * @param array  $settings   Settings.
	 * @return int|WP_Error New ID.
	 */
	public static function insert( $name, $source_url, array $settings ) {
		$id = gswpts()->database->table->insert(
			[
				'table_name'     => sanitize_text_field( $name ),
				'source_url'     => esc_url_raw( $source_url ),
				'source_type'    => 'spreadsheet',
				'table_settings' => wp_json_encode( $settings ),
			]
		);

		if ( ! $id ) {
			return new WP_Error( 'table_insert_failed', __( 'The table could not be saved.', 'sheets-to-wp-table-live-sync' ) );
		}

		return (int) $id;
	}

	/**
	 * Re-creates a deleted table, with its original ID when that ID is free
	 * (so existing shortcodes [gswpts_table id="N"] keep working).
	 *
	 * @param int    $id         Original ID.
	 * @param string $name       Name.
	 * @param string $source_url Source URL.
	 * @param string $settings   Stored settings JSON.
	 * @return int|WP_Error ID used.
	 */
	public static function recreate( $id, $name, $source_url, $settings ) {
		global $wpdb;

		if ( $id > 0 && ! self::get( (int) $id ) ) {
			$ok = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->prefix . 'gswpts_tables',
				[
					'id'             => (int) $id,
					'table_name'     => sanitize_text_field( $name ),
					'source_url'     => esc_url_raw( $source_url ),
					'source_type'    => 'spreadsheet',
					'table_settings' => (string) $settings,
				],
				[ '%d', '%s', '%s', '%s', '%s' ]
			);
			if ( $ok ) {
				return (int) $id;
			}
		}

		return self::insert( $name, $source_url, self::decode_settings( (string) $settings ) );
	}

	/**
	 * Saves fields of an existing table, snapshotting the previous state.
	 *
	 * @param array $table  Hydrated table (current state).
	 * @param array $fields Subset of table_name, source_url, settings.
	 * @return int|WP_Error Snapshot ID.
	 */
	public static function save( array $table, array $fields ) {
		$snapshot = SnapshotStore::save(
			'table',
			$table['id'],
			[
				'table_name'     => $table['table_name'],
				'source_url'     => $table['source_url'],
				'table_settings' => $table['raw_settings'],
			]
		);

		$data = [];

		if ( isset( $fields['table_name'] ) ) {
			$data['table_name'] = sanitize_text_field( $fields['table_name'] );
		}
		if ( isset( $fields['source_url'] ) ) {
			$data['source_url'] = esc_url_raw( $fields['source_url'] );
		}
		if ( isset( $fields['settings'] ) ) {
			$data['table_settings'] = wp_json_encode( $fields['settings'] );
		}

		if ( ! $data ) {
			return $snapshot;
		}

		$updated = gswpts()->database->table->update( (int) $table['id'], $data );

		if ( false === $updated ) {
			return new WP_Error( 'table_update_failed', __( 'The table could not be saved.', 'sheets-to-wp-table-live-sync' ) );
		}

		SnapshotStore::set_after( $snapshot, self::version( self::get( (int) $table['id'] ) ) );

		return $snapshot;
	}

	/**
	 * Restores a table from a snapshot state.
	 *
	 * @param int   $id    Table ID.
	 * @param array $state {table_name, source_url, table_settings}.
	 * @return true|WP_Error
	 */
	public static function restore( $id, array $state ) {
		$updated = gswpts()->database->table->update(
			(int) $id,
			[
				'table_name'     => (string) $state['table_name'],
				'source_url'     => (string) $state['source_url'],
				'table_settings' => (string) $state['table_settings'],
			]
		);

		return false === $updated ? new WP_Error( 'restore_failed', __( 'The table could not be restored.', 'sheets-to-wp-table-live-sync' ) ) : true;
	}

	/**
	 * Resolves a table reference: ID, {id}, {name} or {list_position}.
	 *
	 * @param mixed $ref Reference.
	 * @return array|WP_Error Hydrated table.
	 */
	public static function resolve( $ref ) {
		if ( is_numeric( $ref ) ) {
			$ref = [ 'id' => (int) $ref ];
		}

		if ( ! is_array( $ref ) || ! $ref ) {
			return new WP_Error( 'table_not_found', __( 'Tell me which table: an ID, an exact name or a list position.', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( isset( $ref['id'] ) ) {
			$table = self::get( (int) $ref['id'] );
			if ( ! $table ) {
				return new WP_Error(
					'table_not_found',
					/* translators: %d: table ID. */
					sprintf( __( 'There is no table with ID %d.', 'sheets-to-wp-table-live-sync' ), (int) $ref['id'] ),
					[ 'hint' => __( 'Call flextable-list-tables to see the available tables.', 'sheets-to-wp-table-live-sync' ) ]
				);
			}
			return $table;
		}

		if ( isset( $ref['list_position'] ) ) {
			$ids      = get_transient( self::list_key() );
			$position = (int) $ref['list_position'];

			if ( ! is_array( $ids ) || ! isset( $ids[ $position - 1 ] ) ) {
				return new WP_Error(
					'table_ambiguous',
					__( 'That list position is unknown or expired.', 'sheets-to-wp-table-live-sync' ),
					[ 'hint' => __( 'Call flextable-list-tables again and use a position from that result, or use the table ID.', 'sheets-to-wp-table-live-sync' ) ]
				);
			}

			return self::resolve( [ 'id' => (int) $ids[ $position - 1 ] ] );
		}

		if ( isset( $ref['name'] ) ) {
			$name    = strtolower( trim( (string) $ref['name'] ) );
			$matches = [];
			$similar = [];

			foreach ( self::all() as $table ) {
				$candidate = strtolower( trim( $table['table_name'] ) );
				if ( $candidate === $name ) {
					$matches[] = $table;
				} elseif ( '' !== $name && false !== strpos( $candidate, $name ) ) {
					$similar[] = $table;
				}
			}

			if ( 1 === count( $matches ) ) {
				return $matches[0];
			}

			if ( count( $matches ) > 1 ) {
				return new WP_Error(
					'table_ambiguous',
					__( 'Several tables have this name. Ask the user which one, then use its ID.', 'sheets-to-wp-table-live-sync' ),
					[ 'details' => [ 'candidates' => array_map( [ __CLASS__, 'brief' ], $matches ) ] ]
				);
			}

			return new WP_Error(
				'table_not_found',
				__( 'No table has exactly this name.', 'sheets-to-wp-table-live-sync' ),
				[
					'hint'    => __( 'Use one of the suggestions or call flextable-list-tables.', 'sheets-to-wp-table-live-sync' ),
					'details' => [ 'suggestions' => array_map( [ __CLASS__, 'brief' ], array_slice( $similar, 0, 5 ) ) ],
				]
			);
		}

		return new WP_Error( 'table_not_found', __( 'Tell me which table: an ID, an exact name or a list position.', 'sheets-to-wp-table-live-sync' ) );
	}

	/**
	 * Stores the order of the latest list-tables result for this caller.
	 *
	 * @param int[] $ids Table IDs in list order.
	 * @return void
	 */
	public static function remember_list( array $ids ) {
		set_transient( self::list_key(), array_values( array_map( 'intval', $ids ) ), 30 * MINUTE_IN_SECONDS );
	}

	/**
	 * Transient key for list positions.
	 *
	 * @return string
	 */
	private static function list_key() {
		return 'flextable_mcp_list_' . md5( RequestContext::caller_key() );
	}

	/**
	 * Compact table description.
	 *
	 * @param array $table Hydrated table.
	 * @return array
	 */
	public static function brief( array $table ) {
		$parsed = SheetAccess::parse( $table['source_url'] );

		return [
			'id'       => $table['id'],
			'name'     => $table['table_name'],
			'sheet_id' => is_wp_error( $parsed ) ? '' : $parsed['sheet_id'],
			'gid'      => is_wp_error( $parsed ) ? '' : $parsed['gid'],
		];
	}

	/**
	 * Shortcode for a table.
	 *
	 * @param int $id Table ID.
	 * @return string
	 */
	public static function shortcode( $id ) {
		return sprintf( '[gswpts_table id="%d"]', (int) $id );
	}

	/**
	 * Dashboard edit URL for a table.
	 *
	 * @param int $id Table ID.
	 * @return string
	 */
	public static function edit_url( $id ) {
		return admin_url( 'admin.php?page=swptls-dashboard#/tables/edit/' . (int) $id );
	}
}
