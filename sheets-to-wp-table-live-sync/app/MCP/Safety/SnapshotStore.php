<?php
/**
 * Before-change snapshots used by undo-operation.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Safety;

use GSWPTS\MCP\Database\Migrations;

defined( 'ABSPATH' ) || exit;

/**
 * Stores and reads snapshots of tables, tab groups and posts.
 *
 * @since 3.26.0
 */
class SnapshotStore {

	/**
	 * Snapshots kept per object.
	 */
	const KEEP_PER_OBJECT = 20;

	/**
	 * Saves the state of an object before MCP changes it.
	 *
	 * @param string $object_type table, post, or a type added by an extension (e.g. tab_group).
	 * @param int    $object_id   Object ID.
	 * @param array  $before      Previous state.
	 * @return int Snapshot ID (0 when the table is missing).
	 */
	public static function save( $object_type, $object_id, array $before ) {
		if ( ! Migrations::is_installed() ) {
			return 0;
		}

		global $wpdb;
		$table = Migrations::snapshot_table();

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$table,
			[
				'audit_id'     => (int) RequestContext::get( 'audit_id' ),
				'user_id'      => get_current_user_id(),
				'tool'         => substr( (string) RequestContext::get( 'tool' ), 0, 100 ),
				'object_type'  => $object_type,
				'object_id'    => (int) $object_id,
				'before_state' => wp_json_encode( $before ),
				'created_at'   => current_time( 'mysql', true ),
			],
			[ '%d', '%d', '%s', '%s', '%d', '%s', '%s' ]
		);

		$id = (int) $wpdb->insert_id;

		// Keep the newest N snapshots per object.
		$old = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM {$table} WHERE object_type = %s AND object_id = %d ORDER BY id DESC LIMIT 1000 OFFSET %d", $object_type, (int) $object_id, self::KEEP_PER_OBJECT ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
		if ( $old ) {
			$ids = implode( ',', array_map( 'absint', $old ) );
			$wpdb->query( "DELETE FROM {$table} WHERE id IN ({$ids})" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
		}

		return $id;
	}

	/**
	 * Records the object's version right after MCP changed it.
	 *
	 * @param int    $snapshot_id Snapshot ID.
	 * @param string $version     Version fingerprint after the change.
	 * @return void
	 */
	public static function set_after( $snapshot_id, $version ) {
		if ( ! $snapshot_id || ! Migrations::is_installed() ) {
			return;
		}
		global $wpdb;
		$wpdb->update( Migrations::snapshot_table(), [ 'after_hash' => substr( md5( (string) $version ), 0, 32 ) ], [ 'id' => (int) $snapshot_id ], [ '%s' ], [ '%d' ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	}

	/**
	 * Reads a snapshot.
	 *
	 * @param int $id Snapshot ID.
	 * @return array|null
	 */
	public static function get( $id ) {
		if ( ! Migrations::is_installed() ) {
			return null;
		}

		global $wpdb;
		$table = Migrations::snapshot_table();
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery

		if ( ! $row ) {
			return null;
		}

		$row['before_state'] = json_decode( (string) $row['before_state'], true );
		return $row;
	}

	/**
	 * Snapshots created by one audited operation.
	 *
	 * @param int $audit_id Audit row ID.
	 * @return array
	 */
	public static function for_audit( $audit_id ) {
		if ( ! Migrations::is_installed() || ! $audit_id ) {
			return [];
		}

		global $wpdb;
		$table = Migrations::snapshot_table();
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE audit_id = %d ORDER BY id ASC", (int) $audit_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery

		foreach ( (array) $rows as $i => $row ) {
			$rows[ $i ]['before_state'] = json_decode( (string) $row['before_state'], true );
		}

		return is_array( $rows ) ? $rows : [];
	}

	/**
	 * Marks snapshots as restored.
	 *
	 * @param int[] $ids Snapshot IDs.
	 * @return void
	 */
	public static function mark_restored( array $ids ) {
		if ( ! $ids || ! Migrations::is_installed() ) {
			return;
		}

		global $wpdb;
		$table = Migrations::snapshot_table();
		$list  = implode( ',', array_map( 'absint', $ids ) );
		$wpdb->query( "UPDATE {$table} SET restored = 1 WHERE id IN ({$list})" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
	}
}
