<?php
/**
 * Responsible for managing ajax endpoints.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for handling ajax endpoints.
 *
 * @since 2.12.15
 * @package GSWPTS
 */
class GSWPTS_Ajax {

	/**
	 * Contains promotional wppool products.
	 *
	 * @var \GSWPTS\Ajax\GSWPTS_Products
	 */
	public $products;

	/**
	 * Contains plugins notices ajax operations.
	 *
	 * @var \GSWPTS\Ajax\GSWPTS_Notices
	 */
	public $notices;

	/**
	 * Contains table delete ajax operations.
	 *
	 * @var \GSWPTS\Ajax\UdTables
	 */
	public $ud_tables;

	/**
	 * Contains plugin tables ajax operations.
	 *
	 * @var mixed
	 */
	public $tables;

	/**
	 * Contains plugin tabs ajax operations.
	 *
	 * @var mixed
	 */
	public $tabs;

	/**
	 * Contains plugin settings ajax endpoints.
	 *
	 * @var mixed
	 */
	public $settings;

	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {
		$this->products = new \GSWPTS\Ajax\GSWPTS_Products();
		$this->notices  = new \GSWPTS\Ajax\GSWPTS_Notices();
		$this->tables   = new \GSWPTS\Ajax\GSWPTS_Tables();
		$this->settings = new \GSWPTS\Ajax\GSWPTS_Settings();
	}
}
