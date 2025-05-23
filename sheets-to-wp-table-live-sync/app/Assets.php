<?php
/**
 * Responsible for enqueuing assets.
 *
 * @since 2.12.15
 * @package SWPTLS
 */

namespace SWPTLS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for enqueuing assets.
 *
 * @since 2.12.15
 * @package SWPTLS
 */
class Assets {

	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {
		add_action( 'admin_enqueue_scripts', [ $this, 'admin_scripts' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'gutenberg_files' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'fe_scripts' ] );
	}

	/**
	 * Enqueue backend files.
	 *
	 * @param  mixed $hook The page id.
	 * @since 2.12.15
	 */
	public function admin_scripts( $hook ) {
		$current_screen = get_current_screen();

		if ( 'toplevel_page_gswpts-dashboard' === $current_screen->id ) {

			wp_enqueue_script( 'jquery' );

			$this->data_table_scripts();

			$dependencies = require_once SWPTLS_BASE_PATH . 'react/build/index.asset.php';
			$dependencies['dependencies'][] = 'wp-util';

			wp_enqueue_style(
				'swptls-admin',
				SWPTLS_BASE_URL . 'assets/admin.css',
				'',
				time(),
				'all'
			);

			if ( ! swptls()->helpers->is_pro_active() ) {
				wp_enqueue_style(
					'GSWPTS-style-2',
					SWPTLS_BASE_URL . 'assets/public/styles/style-2.min.css',
					[],
					// SWPTLS_VERSION, Removed and used time().
					time(),
					'all'
				);
			}

			wp_enqueue_style(
				'swptls-app',
				SWPTLS_BASE_URL . 'react/build/index.css',
				'',
				time(),
				'all'
			);

			wp_enqueue_script(
				'swptls-app',
				SWPTLS_BASE_URL . 'react/build/index.js',
				$dependencies['dependencies'],
				time(),
				true
			);

			do_action( 'gswpts_export_dependency_backend' );

			$icons = apply_filters( 'export_buttons_logo_backend', false );

			$localize = [
				'nonce'            => wp_create_nonce( 'swptls-admin-app-nonce-action' ),
				'icons'            => $icons,
				'strings'            => Strings::get(),
				'tables'           => swptls()->database->table->get_all(),
				'theme'           => swptls()->database->table->get_all_theme(),
				'pro'              => [
					'installed'   => swptls()->helpers->check_pro_plugin_exists(),
					'active'      => swptls()->helpers->is_pro_active(),
					'license'     => function_exists( 'swptlspro' ) ? wp_validate_boolean( swptlspro()->license_status ) : false,
					'license_url' => esc_url( admin_url( 'admin.php?page=sheets_to_wp_table_live_sync_pro_settings' ) ),
				],
				'ran_setup_wizard' => wp_validate_boolean( get_option( 'swptls_ran_setup_wizard', false ) ),
			];

			if ( swptls()->helpers->is_pro_active() && swptls()->helpers->is_latest_version() ) {
				$localize['tabs'] = swptlspro()->database->tab->get_all();
			}

			wp_localize_script(
				'swptls-app',
				'SWPTLS_APP',
				$localize
			);

			wp_enqueue_script(
				'SWPTLS-admin-js',
				SWPTLS_BASE_URL . 'assets/public/scripts/backend/admin.min.js',
				[ 'jquery' ],
				time(),
				true
			);

			$this->table_styles_css();
		}

		 /**
		 * Banner content & notices.
		 */
		$pages = [ 'toplevel_page_gswpts-dashboard', 'edit.php', 'plugins.php', 'index.php' ];

		if ( ! in_array($hook, $pages) ) {
			wp_enqueue_style(
				'swptls-notice-prevent-css',
				SWPTLS_BASE_URL . 'assets/swptls-prevent.css',
				'',
				time(),
				'all'
			);
			return;
		}

		if ( 'edit.php' !== $hook || 'product' === get_current_screen()->post_type || in_array($hook, $pages) ) {
			wp_enqueue_style(
				'swptls-admin-css',
				SWPTLS_BASE_URL . 'assets/swptls-notices.css',
				'',
				time(),
				'all'
			);
		}
	}

	/**
	 * Load assets for shortcode based on shortcode.
	 */
	public function fe_scripts() {
		global $post;
		$script_support_mode = get_option('script_support_mode');
		$shortcode = 'gswpts_table';
		$tab_shortcode = 'gswpts_tab';
		$should_enqueue = false;

		if ( 'global_loading' === $script_support_mode ) {
			$this->frontend_scripts();
			return;
		}

		if ( isset($post) && ! empty($post->post_content) ) {
			// Check for [gswpts_table] shortcode.
			if ( has_shortcode($post->post_content, $shortcode) ) {
				$should_enqueue = true;
			}

			// Check for [gswpts_tab] shortcode.
			if ( has_shortcode($post->post_content, $tab_shortcode) ) {
				$should_enqueue = true;
			}
		}

		// Additional conditions that might require enqueuing scripts.
		if ( function_exists('get_field') ) {
			$should_enqueue = true;
		}

		if ( did_action('elementor/loaded') ) {
			if ( isset($post) && is_object($post) && property_exists($post, 'ID') && $post->ID ) {
				$is_built_with_elementor = \Elementor\Plugin::$instance->documents->get($post->ID)->is_built_with_elementor();
				if ( $is_built_with_elementor ) {
					if ( has_shortcode($post->post_content, $shortcode) || has_shortcode($post->post_content, $tab_shortcode) ) {
						$should_enqueue = true;
					}
				}
			}
		}

		if ( $should_enqueue ) {
			$this->frontend_scripts();
		}
	}


	/**
	 * Enqueue frontend files.
	 *
	 * @since 2.12.15
	 */
	public function frontend_scripts() {
		wp_enqueue_script( 'jquery' );

		$this->frontend_tables_assets();

		do_action( 'gswpts_export_dependency_frontend' );

		wp_enqueue_style(
			'GSWPTS-frontend-css',
			SWPTLS_BASE_URL . 'assets/public/styles/frontend.min.css',
			[],
			time(),
			'all'
		);

		if ( ! swptls()->helpers->is_pro_active() ) {
			wp_enqueue_style(
				'GSWPTS-style-1',
				SWPTLS_BASE_URL . 'assets/public/styles/style-1.min.css',
				[],
				time(),
				'all'
			);

			wp_enqueue_style(
				'GSWPTS-style-2',
				SWPTLS_BASE_URL . 'assets/public/styles/style-2.min.css',
				[],
				time(),
				'all'
			);
		}

		$this->table_styles_css();

		wp_enqueue_script(
			'GSWPTS-frontend-js',
			SWPTLS_BASE_URL . 'assets/public/scripts/frontend/frontend.min.js',
			[ 'jquery', 'jquery-ui-draggable' ],
			time(),
			true
		);

		$icons_urls = apply_filters( 'export_buttons_logo_frontend', false );

		wp_localize_script('GSWPTS-frontend-js', 'front_end_data', [
			'admin_ajax'           => esc_url( admin_url( 'admin-ajax.php' ) ),
			'asynchronous_loading' => get_option( 'asynchronous_loading' ) === 'on' ? 'on' : 'off',
			'isProActive'          => swptls()->helpers->is_pro_active(),
			'strings'            => Strings::get(),
			'iconsURL'             => $icons_urls,
			'nonce'                => wp_create_nonce( 'gswpts_sheet_nonce_action' ),
		]);
	}

	/**
	 * Enqueue semantic files.
	 *
	 * @since 2.12.15
	 */
	public function semantic_files() {
		wp_enqueue_style(
			'GSWPTS-semanticui-css',
			SWPTLS_BASE_URL . 'assets/public/common/semantic/semantic.min.css',
			[],
			time(),
			'all'
		);

		wp_enqueue_script(
			'GSWPTS-semantic-js',
			SWPTLS_BASE_URL . 'assets/public/common/semantic/semantic.min.js',
			[ 'jquery' ],
			time(),
			false
		);
	}

	/**
	 * Enqueue semantic files.
	 *
	 * @since 2.12.15
	 */
	public function frontend_tables_assets() {
		wp_enqueue_script(
			'GSWPTS-frontend-table',
			SWPTLS_BASE_URL . 'assets/public/common/datatables/tables/js/jquery.datatables.min.js',
			[ 'jquery' ],
			time(),
			false
		);

		wp_enqueue_script(
			'GSWPTS-frontend-semantic',
			SWPTLS_BASE_URL . 'assets/public/common/datatables/tables/js/datatables.semanticui.min.js',
			[ 'jquery' ],
			time(),
			false
		);

		wp_enqueue_script(
			'moment-js',
			SWPTLS_BASE_URL . 'assets/public/scripts/moment/moment.min.js',
			[ 'jquery' ],
			time(),
			false
		);

		wp_enqueue_script(
			'datetime-moment-js',
			SWPTLS_BASE_URL . 'assets/public/scripts/moment/datetime-moment.js',
			[ 'moment-js', 'GSWPTS-frontend-table' ],
			time(),
			false
		);
	}

	/**
	 * Enqueue data tables scripts.
	 *
	 * @since 2.12.15
	 */
	public function data_table_scripts() {
		wp_enqueue_script(
			'GSWPTS-jquery-dataTable-js',
			SWPTLS_BASE_URL . 'assets/public/common/datatables/tables/js/jquery.datatables.min.js',
			[ 'jquery' ],
			time(),
			true
		);

		wp_enqueue_script(
			'GSWPTS-dataTable-semanticui-js',
			SWPTLS_BASE_URL . 'assets/public/common/datatables/tables/js/datatables.semanticui.min.js',
			[ 'jquery' ],
			time(),
			true
		);
	}

	/**
	 * Enqueue data tables styles.
	 *
	 * @since 2.12.15
	 */
	public function data_table_styles() {
		wp_enqueue_style(
			'GSWPTS-semanticui-css',
			SWPTLS_BASE_URL . 'assets/public/common/semantic/semantic.min.css',
			[],
			time(),
			'all'
		);

		wp_enqueue_style(
			'GSWPTS-dataTable-semanticui-css',
			SWPTLS_BASE_URL . 'assets/public/common/datatables/tables/css/datatables.semanticui.min.css',
			[],
			time(),
			'all'
		);
	}

	/**
	 * Enqueue gutenberg files.
	 *
	 * @since 2.12.15
	 */
	public function gutenberg_files() {
		wp_enqueue_style(
			'GSWPTS-gutenberg-css',
			SWPTLS_BASE_URL . 'assets/public/styles/gutenberg.min.css',
			[],
			time(),
			'all'
		);

		wp_enqueue_style(
			'GSWPTS-alert-css',
			SWPTLS_BASE_URL . 'assets/public/package/alert.min.css',
			[],
			time(),
			'all'
		);

		wp_enqueue_style(
			'GSWPTS-fontawesome',
			SWPTLS_BASE_URL . 'assets/public/icons/fontawesome/css/all.min.css',
			[],
			time(),
			'all'
		);

		wp_enqueue_script(
			'gswpts-gutenberg',
			SWPTLS_BASE_URL . 'assets/public/scripts/backend/gutenberg/gutenberg.min.js',
			[ 'wp-blocks', 'wp-i18n', 'wp-editor', 'wp-element', 'wp-components', 'jquery' ],
			time(),
			true
		);

		register_block_type(
			'gswpts/google-sheets-to-wp-tables',
			[
				'description'   => __( 'Display Google Spreadsheet data to WordPress table in just a few clicks
				and keep the data always synced. Organize and display all your spreadsheet data in your WordPress quickly and effortlessly.', 'sheetstowptable' ),
				'title'         => __( 'FlexTable', 'sheetstowptable' ),
				'editor_script' => 'gswpts-gutenberg',
				'editor_style'  => 'GSWPTS-gutenberg-css',
			]
		);

		$this->semantic_files();
		$this->data_table_styles();
		$this->data_table_scripts();
		$this->table_styles_css();

		wp_localize_script(
			'gswpts-gutenberg',
			'gswpts_gutenberg_block',
			[
				'admin_ajax'       => esc_url( admin_url( 'admin-ajax.php' ) ),
				'table_details'    => swptls()->database->table->get_all(),
				'isProActive'      => swptls()->helpers->is_pro_active(),
				'nonce'  => wp_create_nonce( 'swptls-admin-app-nonce-action' ),
				'fetch_nonce'     => wp_create_nonce( 'gswpts_sheet_nonce_action' ),
			]
		);
	}

	/**
	 * Enqueue table style css.
	 *
	 * @return null
	 */
	public function table_styles_css() {
		$styles_array = swptls()->settings->table_styles_array();
		$styles_array = apply_filters( 'gswpts_table_styles_path', $styles_array );

		if ( ! $styles_array ) {
			return;
		}

		foreach ( $styles_array as $key => $style ) {
			$table_style_file_url  = isset( $style['cssURL'] ) ? $style['cssURL'] : '';
			$table_style_file_path = isset( $style['cssPath'] ) ? $style['cssPath'] : '';

			if ( file_exists( $table_style_file_path ) ) {
				wp_enqueue_style( 'gswptsProTable_' . $key . '', $table_style_file_url, [], time(), 'all' );
			}
		}
	}

}
