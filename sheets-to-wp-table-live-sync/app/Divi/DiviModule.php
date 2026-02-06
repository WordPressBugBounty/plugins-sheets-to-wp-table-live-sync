<?php
/**
 * Divi module for displaying tables.
 *
 * @since 2.14.0
 * @package SWPTLS
 */

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * FlexTable Divi module class.
 *
 * @since 2.14.0
 */
class GSWPTS_FlexTable_Module extends ET_Builder_Module {

	public $slug = 'gswpts_flextable';
	public $vb_support = 'off';
	public $icon_path;
	
	protected $module_credits = array(
		'module_uri' => 'https://wppool.dev/sheets-to-wp-table-live-sync/',
		'author'     => 'WPPOOL',
		'author_uri' => 'https://wppool.dev/',
	);

	public function __construct() {
		$this->icon_path = SWPTLS_BASE_PATH . 'assets/public/images/icon-guten.svg';
		parent::__construct();
	}

	public function init() {
		$this->name = esc_html__( 'FlexTable', 'sheetstowptable' );
		
		$this->settings_modal_toggles = array(
			'general' => array(
				'toggles' => array(
					'main_content' => esc_html__( 'Table Selection', 'sheetstowptable' ),
				),
			),
		);
	}

	public function get_fields() {
		return array(
			'table_id' => array(
				'label'           => esc_html__( 'Choose Table', 'sheetstowptable' ),
				'type'            => 'select',
				'option_category' => 'basic_option',
				'options'         => $this->get_tables_list(),
				'default'         => 'select',
				'toggle_slug'     => 'main_content',
				'description'     => esc_html__( 'Select a table to display.', 'sheetstowptable' ),
			),
		);
	}

	protected function get_tables_list() {
		$options = array(
			'select' => esc_html__( 'Select a table', 'sheetstowptable' ),
		);

		if ( function_exists( 'swptls' ) && isset( swptls()->database->table ) ) {
			$tables = swptls()->database->table->get_all();
			if ( $tables ) {
				foreach ( $tables as $table ) {
					$options[ $table->id ] = $table->table_name;
				}
			}
		}

		return $options;
	}

	public function render( $unprocessed_props, $content, $render_slug ) {
		$table_id = $this->props['table_id'];

		if ( 'select' === $table_id || empty( $table_id ) ) {
			if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) {
				return sprintf(
					'<div class="gswpts-divi-placeholder" style="padding: 20px; text-align: center; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; color: #6c757d;">%s</div>',
					esc_html__( 'Please select a table to display.', 'sheetstowptable' )
				);
			}
			return '';
		}

		$table_id = absint( $table_id );
		$this->add_classname( 'gswpts-divi-module' );
		
		// Get the shortcode output
		$shortcode_output = do_shortcode( sprintf( '[gswpts_table id="%s"]', $table_id ) );
		
		return sprintf(
			'<div class="gswpts-divi-table-container" data-table-id="%d">%s</div>',
			$table_id,
			$shortcode_output
		);
	}

}

new GSWPTS_FlexTable_Module();