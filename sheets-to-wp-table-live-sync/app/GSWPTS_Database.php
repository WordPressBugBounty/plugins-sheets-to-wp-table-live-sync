<?php
/**
 * Managing database operations for the plugin.
 *
 * @since 3.0.0
 * @package GSWPTS
 */

namespace GSWPTS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manages plugin database operations.
 *
 * @since 3.0.0
 */
class GSWPTS_Database {

	/**
	 * Contains plugins database migrations.
	 *
	 * @var \GSWPTS\Database\GSWPTS_Migration
	 */
	public $migration;

	/**
	 * Contains tables related database operations.
	 *
	 * @var \GSWPTS\Database\GSWPTS_Table
	 */
	public $table;

	/**
	 * Class constructor.
	 *
	 * @since 3.0.0
	 */
	public function __construct() {
		$this->migration = new \GSWPTS\Database\GSWPTS_Migration();
		$this->table     = new \GSWPTS\Database\GSWPTS_Table();
	}
}
