<?php
/**
 * MCP database tables (audit log and undo snapshots).
 *
 * Tables are created the first time MCP is enabled, never on plugin
 * activation, so sites that never use MCP get no new tables.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Database;

defined( 'ABSPATH' ) || exit;

/**
 * Creates and versions the MCP tables.
 *
 * @since 3.26.0
 */
class Migrations {

	const DB_VERSION        = '1';
	const DB_VERSION_OPTION = 'flextable_mcp_db_version';

	/**
	 * Audit table name.
	 *
	 * @return string
	 */
	public static function audit_table() {
		global $wpdb;
		return $wpdb->prefix . 'flextable_mcp_audit';
	}

	/**
	 * Snapshot table name.
	 *
	 * @return string
	 */
	public static function snapshot_table() {
		global $wpdb;
		return $wpdb->prefix . 'flextable_mcp_snapshots';
	}

	/**
	 * Whether the tables are installed at the current version.
	 *
	 * @return bool
	 */
	public static function is_installed() {
		return self::DB_VERSION === get_option( self::DB_VERSION_OPTION );
	}

	/**
	 * Creates or upgrades the tables when needed.
	 *
	 * @return void
	 */
	public static function maybe_run() {
		if ( self::is_installed() ) {
			return;
		}

		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset = $wpdb->get_charset_collate();
		$audit   = self::audit_table();
		$snaps   = self::snapshot_table();

		dbDelta(
			"CREATE TABLE {$audit} (
				id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
				created_at DATETIME NOT NULL,
				user_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
				credential_ref VARCHAR(64) NOT NULL DEFAULT '',
				client_name VARCHAR(191) NOT NULL DEFAULT '',
				tool VARCHAR(100) NOT NULL DEFAULT '',
				target_type VARCHAR(32) NOT NULL DEFAULT '',
				target_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
				result_code VARCHAR(64) NOT NULL DEFAULT '',
				dry_run TINYINT(1) NOT NULL DEFAULT 0,
				args_summary TEXT NULL,
				duration_ms INT(10) UNSIGNED NOT NULL DEFAULT 0,
				protocol_version VARCHAR(20) NOT NULL DEFAULT '',
				PRIMARY KEY  (id),
				KEY user_created (user_id, created_at),
				KEY tool (tool)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$snaps} (
				id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
				audit_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
				user_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
				tool VARCHAR(100) NOT NULL DEFAULT '',
				object_type VARCHAR(32) NOT NULL DEFAULT '',
				object_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
				before_state LONGTEXT NULL,
				after_hash CHAR(32) NOT NULL DEFAULT '',
				restored TINYINT(1) NOT NULL DEFAULT 0,
				created_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY object (object_type, object_id),
				KEY user_created (user_id, created_at)
			) {$charset};"
		);

		update_option( self::DB_VERSION_OPTION, self::DB_VERSION, false );
	}

	/**
	 * Drops the tables and the version option (used by uninstall).
	 *
	 * @return void
	 */
	public static function drop() {
		global $wpdb;
		$wpdb->query( 'DROP TABLE IF EXISTS ' . self::audit_table() ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery
		$wpdb->query( 'DROP TABLE IF EXISTS ' . self::snapshot_table() ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery
		delete_option( self::DB_VERSION_OPTION );
	}
}
