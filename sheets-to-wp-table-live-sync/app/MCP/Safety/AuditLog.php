<?php
/**
 * Audit log of MCP tool calls.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Safety;

use GSWPTS\MCP\Database\Migrations;

defined( 'ABSPATH' ) || exit;

/**
 * Writes and reads audit rows. Arguments are always redacted first.
 *
 * @since 3.26.0
 */
class AuditLog {

	/**
	 * Days to keep audit rows.
	 */
	const RETENTION_DAYS = 90;

	/**
	 * Records a tool call.
	 *
	 * @param array $row {tool, args, result_code, target_type, target_id, dry_run, duration_ms}.
	 * @return int Audit row ID (0 when the table is missing).
	 */
	public static function record( array $row ) {
		if ( ! Migrations::is_installed() ) {
			return 0;
		}

		global $wpdb;

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			Migrations::audit_table(),
			[
				'created_at'       => current_time( 'mysql', true ),
				'user_id'          => get_current_user_id(),
				'credential_ref'   => substr( (string) RequestContext::get( 'credential' ), 0, 64 ),
				'client_name'      => substr( (string) RequestContext::get( 'client' ), 0, 191 ),
				'tool'             => substr( isset( $row['tool'] ) ? (string) $row['tool'] : '', 0, 100 ),
				'target_type'      => substr( isset( $row['target_type'] ) ? (string) $row['target_type'] : '', 0, 32 ),
				'target_id'        => isset( $row['target_id'] ) ? absint( $row['target_id'] ) : 0,
				'result_code'      => substr( isset( $row['result_code'] ) ? (string) $row['result_code'] : 'ok', 0, 64 ),
				'dry_run'          => empty( $row['dry_run'] ) ? 0 : 1,
				'args_summary'     => wp_json_encode( Redactor::summarize( isset( $row['args'] ) ? $row['args'] : [] ) ),
				'duration_ms'      => isset( $row['duration_ms'] ) ? absint( $row['duration_ms'] ) : 0,
				'protocol_version' => substr( (string) RequestContext::get( 'protocol' ), 0, 20 ),
			],
			[ '%s', '%d', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s', '%d', '%s' ]
		);

		self::maybe_prune();

		return (int) $wpdb->insert_id;
	}

	/**
	 * Recent rows, newest first.
	 *
	 * @param array $filters {user_id, tool, target_id, limit}.
	 * @return array
	 */
	public static function recent( array $filters = [] ) {
		if ( ! Migrations::is_installed() ) {
			return [];
		}

		global $wpdb;

		$table  = Migrations::audit_table();
		$where  = [ '1=1' ];
		$params = [];

		if ( ! empty( $filters['user_id'] ) ) {
			$where[]  = 'user_id = %d';
			$params[] = (int) $filters['user_id'];
		}
		if ( ! empty( $filters['tool'] ) ) {
			$where[]  = 'tool = %s';
			$params[] = (string) $filters['tool'];
		}
		if ( ! empty( $filters['target_id'] ) ) {
			$where[]  = 'target_id = %d';
			$params[] = (int) $filters['target_id'];
		}

		$limit    = isset( $filters['limit'] ) ? max( 1, min( 100, (int) $filters['limit'] ) ) : 20;
		$params[] = $limit;

		$sql = "SELECT id, created_at, user_id, client_name, tool, target_type, target_id, result_code, dry_run, args_summary, duration_ms FROM {$table} WHERE " . implode( ' AND ', $where ) . ' ORDER BY id DESC LIMIT %d';

		$rows = $wpdb->get_results( $wpdb->prepare( $sql, $params ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery

		return is_array( $rows ) ? $rows : [];
	}

	/**
	 * Updates the result code of an audit row (after execution).
	 *
	 * @param int    $audit_id    Row ID.
	 * @param string $result_code Result.
	 * @param int    $duration_ms Duration.
	 * @return void
	 */
	public static function finish( $audit_id, $result_code, $duration_ms ) {
		if ( ! $audit_id || ! Migrations::is_installed() ) {
			return;
		}

		global $wpdb;
		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			Migrations::audit_table(),
			[
				'result_code' => substr( (string) $result_code, 0, 64 ),
				'duration_ms' => absint( $duration_ms ),
			],
			[ 'id' => (int) $audit_id ],
			[ '%s', '%d' ],
			[ '%d' ]
		);
	}

	/**
	 * Deletes rows older than the retention period, at most once a day.
	 *
	 * @return void
	 */
	private static function maybe_prune() {
		if ( get_transient( 'flextable_mcp_audit_pruned' ) ) {
			return;
		}

		set_transient( 'flextable_mcp_audit_pruned', 1, DAY_IN_SECONDS );

		global $wpdb;
		$table = Migrations::audit_table();
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE created_at < %s", gmdate( 'Y-m-d H:i:s', time() - self::RETENTION_DAYS * DAY_IN_SECONDS ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
	}
}
