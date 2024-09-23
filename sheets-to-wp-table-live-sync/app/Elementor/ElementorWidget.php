<?php
/**
 * Registering table display elementor widget for the plugin.
 *
 * @since 2.13.1
 * @package SWPTLS
 */

namespace SWPTLS\Elementor;  // phpcs:ignore

use SWPTLS\Elementor\TemplateContent;  // phpcs:ignore

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Registering elementor widget.
 *
 * @since 2.13.1
 */
class ElementorWidget extends \Elementor\Widget_Base {

	/**
	 * Class constructor.
	 *
	 * @param array $data The widget default data.
	 * @param array $args The widget default arguments.
	 * @since 2.13.1
	 */
	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		wp_enqueue_style(
			'GSWPTS-elementor-table',
			SWPTLS_BASE_URL . 'assets/public/styles/elementor.min.css',
			[],
			SWPTLS_VERSION,
			'all'
		);
		swptls()->assets->frontend_scripts();
	}

	/**
	 * Plugin widget name.
	 *
	 * @since 2.13.1
	 */
	public function get_name() {
		return 'sheets-to-wp-table-sync-live';
	}

	/**
	 * Plugin widget title.
	 *
	 * @since 2.13.1
	 */
	public function get_title() {
		return __( 'FlexTable', 'sheetstowptable' );
	}

	/**
	 * Plugin widget icon.
	 *
	 * @since 2.13.1
	 */
	public function get_icon() {
		return 'gswpts_icon';
	}

	/**
	 * Plugin widget categories.
	 *
	 * @since 2.13.1
	 */
	public function get_categories() {
		return [ 'basic' ];
	}

	/**
	 * Registers widget controls.
	 *
	 * @since 2.13.1
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'table_section',
			[
				'label' => 'Tables',
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'choose_table',
			[
				'label'   => __( 'Choose Table', 'sheetstowptable' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => 'select',
				'options' => $this->tables_info(),
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Get tables list.
	 *
	 * @return array
	 */
	protected function tables_info() {
		$options = [
			'select' => 'Select a table',
		];

		$details = swptls()->database->table->get_all();

		if ( $details ) {
			foreach ( $details as $table ) {
				$options[ $table->id ] = $table->table_name;
			}
		}
		return $options;
	}

	/**
	 * Render the widget.
	 *
	 * @return void
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		if ( 'select' === $settings['choose_table'] ) {
			return;
		}

		$table_id  = absint( $settings['choose_table'] );

		$shortcode = do_shortcode( sprintf( '[gswpts_table id="%s"]', $table_id ) );

		// echo $shortcode;// phpcs: ignore.
		echo wp_kses_post( $shortcode );
	}

	/**
	 * Load the dynamic content template.
	 *
	 * @return void
	 */
	protected function content_template() {
		$template = new TemplateContent();

		?>
<# if ( settings.choose_table !='select' ) { #>
		<?php $template->table_container(); ?>
		<?php $template->render_template_js(); ?>
	<# } else{ #>
		<?php $template->init_content(); ?>
		<# } #>
			<?php
	}
}
