<?php
/**
 * Registering WordPress shortcode for the plugin.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for registering shortcode.
 *
 * @since 2.12.15
 * @package GSWPTS
 */
class GSWPTS_Shortcode {

	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {
		add_shortcode( 'gswpts_table', [ $this, 'shortcode' ] );
	}

	/**
	 * Escape/sanitize the assembled shortcode HTML before returning it to
	 * WordPress, while preserving table markup and this plugin's own
	 * static SVG icons.
	 *
	 * This method wraps the final shortcode output in wp_kses() with an
	 * extended allow-list to satisfy WordPress.org's automated scanner,
	 * which requires escaping at the return point of shortcode callbacks.
	 * 
	 * The allow-list includes all standard post HTML plus SVG elements
	 * needed for the login button icons in the auth-gate feature.
	 *
	 * @param string $html The assembled table HTML.
	 * @return string Sanitized HTML safe for output.
	 * @since 3.24.6
	 */
	private function kses_table_output( $html ) {
		static $allowed_html = null;

		if ( null === $allowed_html ) {
			// Start with WordPress's default post HTML allow-list
			$allowed_html = wp_kses_allowed_html( 'post' );

			// Extend for SVG icons used in the login/auth-gate block
			$svg_attrs = [
				'class'           => true,
				'aria-hidden'     => true,
				'xmlns'           => true,
				'viewbox'         => true,
				'fill'            => true,
				'stroke'          => true,
				'stroke-width'    => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'width'           => true,
				'height'          => true,
			];

			$allowed_html['svg']      = $svg_attrs;
			$allowed_html['path']     = array_merge( $svg_attrs, [ 'd' => true ] );
			$allowed_html['polyline'] = array_merge( $svg_attrs, [ 'points' => true ] );
			$allowed_html['line']     = array_merge( $svg_attrs, [ 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true ] );

			/**
			 * Filters the allowed HTML tags and attributes for FlexTable's shortcode output.
			 *
			 * @since 3.24.6
			 * @param array $allowed_html Array of allowed HTML tags and their attributes.
			 */
			$allowed_html = apply_filters( 'gswpts_shortcode_allowed_html', $allowed_html );
		}

		return wp_kses( $html, $allowed_html );
	}

	/**
	 * Generate table html asynchronously.
	 *
	 * Security note: All cell data is sanitized upstream via wp_kses_post()
	 * in get_csv_data() (Helpers.php line ~195). Links and images receive
	 * additional escaping (esc_url/esc_html) in check_link_exists() and
	 * transform_links(). This final wp_kses() call at the return point
	 * satisfies WordPress.org's automated scanner requirements while
	 * preserving the table structure and SVG icons.
	 *
	 * @param  array $atts The shortcode attributes data.
	 * @return string Sanitized HTML output safe for rendering.
	 */
	public function shortcode( $atts ) {
		$html = ( defined( 'ELEMENTOR_VERSION' ) && \Elementor\Plugin::$instance->editor->is_edit_mode() ) || 'on' !== get_option( 'asynchronous_loading' ) ? $this->plain_shortcode( $atts ) : $this->asynchronous_shortcode( $atts );

		return $this->kses_table_output( $html );
	}

	/**
	 * Generate table html via ajax.
	 *
	 * @param  array $atts The shortcode attributes.
	 * @return HTML
	 */
	private function asynchronous_shortcode( $atts ) {

		$id = isset( $atts['id'] ) ? absint( $atts['id'] ) : 0;

		$output = '';

		$table = gswpts()->database->table->get( $id );

		if ( ! $table ) {
			$output = '<h5><b>' . __( 'Table maybe deleted or can\'t be loaded.', 'sheets-to-wp-table-live-sync' ) . '</b></h5> <br>';
			return $output;
		}

		// Get table settings to check if AI Summary is enabled
		$table_settings = json_decode( $table['table_settings'], true );

		// [track1] Block non-logged-in users based on new settings structure
		$auth = $table_settings['user_auth_filtering'] ?? [];

		$enable_auth       = ! empty( $auth['enable_auth_auto_select'] ) && wp_validate_boolean( $auth['enable_auth_auto_select'] );
		$non_logged_action   = isset( $auth['non_logged_action'] ) ? sanitize_key( $auth['non_logged_action'] ) : 'show_prompt';

		if ( $enable_auth ) {

			if ( $non_logged_action === 'hide_table' ) {
				// Hide everything — no message, no button
				return '';
			}

			// non_logged_action === 'show_prompt' (default)
			$non_logged_heading = ! empty( $auth['non_logged_heading'] )
				? esc_html( $auth['non_logged_heading'] )
				: esc_html__( 'Members-Only Content', 'sheets-to-wp-table-live-sync' );

			$non_logged_message = ! empty( $auth['non_logged_message'] )
				? wp_kses_post( $auth['non_logged_message'] )
				: __( 'This table is only available to logged-in users.', 'sheets-to-wp-table-live-sync' );

			$show_login_button = isset( $auth['show_login_button'] ) ? wp_validate_boolean( $auth['show_login_button'] ) : true;
			$login_button_label = ! empty( $auth['login_button_label'] )
				? esc_html( $auth['login_button_label'] )
				: esc_html__( 'Log In to View', 'sheets-to-wp-table-live-sync' );

			$login_btn = '';
			if ( $show_login_button ) {
				$login_path = ! empty( $auth['non_logged_login_url'] )
					? sanitize_text_field( $auth['non_logged_login_url'] )
					: '';

				$login_url = $login_path
					? esc_url( trailingslashit( home_url() ) . ltrim( $login_path, '/' ) )
					: esc_url( wp_login_url( get_permalink() ) );

				$login_btn = '<a href="' . $login_url . '" target="_blank" rel="noopener noreferrer" class="swptls-non-logged-login-btn" aria-label="' . esc_attr__( 'Log in to view the table', 'sheets-to-wp-table-live-sync' ) . '">'
					. '<svg class="swptls-btn-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>'
					. '<span>' . $login_button_label . '</span>'
					. '<svg class="swptls-btn-arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
					. '</a>';
			}

			return '
			<div class="swptls-non-logged-wrapper" role="alert" aria-live="polite">
				<div class="swptls-non-logged-card">
					<div class="swptls-non-logged-icon-wrap" aria-hidden="true">
						<div class="swptls-icon-ring">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
								<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
							</svg>
						</div>
					</div>
					<div class="swptls-non-logged-body">
						<div class="swptls-non-logged-text">
							<h4 class="swptls-non-logged-title">' . $non_logged_heading . '</h4>
							<p class="swptls-non-logged-desc">' . $non_logged_message . '</p>
						</div>
						<div class="swptls-non-logged-actions">' . $login_btn . '</div>
					</div>
				</div>
			</div>';
		}
		// [/track1]

		$ai_summary_enabled = wp_validate_boolean( $table_settings['enable_ai_summary'] ?? false );
		$summary_source = $table_settings['summary_source'] ?? 'generate_on_click';
		$summary_display = $table_settings['summary_display'] ?? 'always_show';

		$output .= '<div class="gswpts_tables_container gswpts_table_' . $id . '" id="' . $id . '" data-nonce="' . esc_attr( wp_create_nonce( 'gswpts_sheet_nonce_action' ) ) . '" data-ai-summary="' . ( $ai_summary_enabled ? 'true' : 'false' ) . '" data-summary-source="' . esc_attr( $summary_source ) . '" data-summary-display="' . esc_attr( $summary_display ) . '">';

		$output .= '<div class="gswpts_tables_content">';

		$output .= '
			<div class="ui segment gswpts_table_loader">
				<div class="ui active inverted dimmer">
					<div class="ui large text loader">' . __( 'Loading', 'sheets-to-wp-table-live-sync' ) . '</div>
				</div>
				<p></p>
				<p></p>
				<p></p>
			</div>
		';

		$output .= '</div>';
		$output .= $this->edit_table_link( $id );
		$output .= '</div>';
		$output .= '<br><br>';

		return $output;
	}



	/**
	 * Generate table html straight.
	 *
	 * @param  array $atts The shortcode attributes.
	 * @return HTML
	 */
	private function plain_shortcode( $atts ) {
		$output = '<h5><b>' . __( 'Table maybe deleted or can\'t be loaded.', 'sheets-to-wp-table-live-sync' ) . '</b></h5><br>';
		$table = gswpts()->database->table->get( absint( $atts['id'] ) );

		if ( ! $table ) {
			return $output;
		}

		$settings = null !== json_decode( $table['table_settings'] ) ? json_decode( $table['table_settings'], true ) : unserialize( $table['table_settings'] );

		// [track1] Block non-logged-in users based on new settings structure
		$auth = $settings['user_auth_filtering'] ?? [];

		$enable_auth       = ! empty( $auth['enable_auth_auto_select'] ) && wp_validate_boolean( $auth['enable_auth_auto_select'] );
		$non_logged_action = isset( $auth['non_logged_action'] ) ? sanitize_key( $auth['non_logged_action'] ) : 'show_prompt';

		if ( $enable_auth ) {

			if ( $non_logged_action === 'hide_table' ) {
				return '';
			}

			// show_prompt
			$non_logged_heading = ! empty( $auth['non_logged_heading'] )
				? esc_html( $auth['non_logged_heading'] )
				: esc_html__( 'Members-Only Content', 'sheets-to-wp-table-live-sync' );

			$non_logged_message = ! empty( $auth['non_logged_message'] )
				? wp_kses_post( $auth['non_logged_message'] )
				: __( 'This table is only available to logged-in users.', 'sheets-to-wp-table-live-sync' );

			$show_login_button  = isset( $auth['show_login_button'] ) ? wp_validate_boolean( $auth['show_login_button'] ) : true;
			$login_button_label = ! empty( $auth['login_button_label'] )
				? esc_html( $auth['login_button_label'] )
				: esc_html__( 'Log In', 'sheets-to-wp-table-live-sync' );

			$login_btn = '';
			if ( $show_login_button ) {
				$login_path = ! empty( $auth['non_logged_login_url'] )
					? sanitize_text_field( $auth['non_logged_login_url'] )
					: '';
				$login_url = $login_path
					? esc_url( trailingslashit( home_url() ) . ltrim( $login_path, '/' ) )
					: esc_url( wp_login_url( get_permalink() ) );
				$login_btn = '<a href="' . $login_url . '" target="_blank" rel="noopener noreferrer" class="swptls-non-logged-login-btn">' . $login_button_label . '</a>';
			}

			return '
			<div class="swptls-non-logged-wrapper" role="alert" aria-live="polite">
				<div class="swptls-non-logged-card">
					<div class="swptls-non-logged-icon-wrap" aria-hidden="true">
						<div class="swptls-icon-ring">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
								<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
							</svg>
						</div>
					</div>
					<div class="swptls-non-logged-body">
						<div class="swptls-non-logged-text">
							<h4 class="swptls-non-logged-title">' . $non_logged_heading . '</h4>
							<p class="swptls-non-logged-desc">' . $non_logged_message . '</p>
						</div>
						<div class="swptls-non-logged-actions">' . $login_btn . '</div>
					</div>
				</div>
			</div>';
		}
		// [/track1]

		$name     = esc_attr( $table['table_name'] );
		$url      = esc_url( $table['source_url'] );
		$sheet_id = gswpts()->helpers->get_sheet_id( $url );
		$gid      = gswpts()->helpers->get_grid_id( $url );
		$response = gswpts()->helpers->get_csv_data( $url, $sheet_id, $gid );

		if ( ! $response ) {
			return $output;
		}

		$with_style  = wp_validate_boolean( $settings['importStyles'] ?? false );
		$table_style = $with_style ? 'default-style' : ( ! empty( $settings['table_style'] ) ? 'gswpts_' . $settings['table_style'] : '' );

		// Load Pro classes and functions when Pro is active; otherwise, use the Free implementation.
		if ( gswpts()->helpers->is_pro_active() ) {
			$table_data  = swptlspro()->helpers->load_table_data( $url, absint( $table['id'] ) );
			$response    = swptlspro()->helpers->generate_html( $name, $settings, $table_data, false, absint( $table['id'] ) );
		} else {
			$table_data  = gswpts()->helpers->load_table_data( $url, absint( $table['id'] ) );
			$response    = gswpts()->helpers->generate_html( $name, $settings, $table_data, false, absint( $table['id'] ) );
		}

		$table      = $response;
		$responsive = isset( $settings['responsive_style'] ) && $settings['responsive_style'] ? $settings['responsive_style'] : null;

		// Check if AI Summary is enabled
		$ai_summary_enabled = wp_validate_boolean( $settings['enable_ai_summary'] ?? false );
		$summary_source = $settings['summary_source'] ?? 'generate_on_click';
		$summary_display = $settings['summary_display'] ?? 'always_show';

		$output = sprintf(
			'<div class="gswpts_tables_container gswpts_table_%1$d %2$s %3$s" id="%1$d" data-table_name="%4$s" data-table_settings=\'%5$s\' data-url="%6$s" data-ai-summary="%7$s" data-summary-source="%8$s" data-summary-display="%9$s">',
			absint( $atts['id'] ),
			esc_attr( $responsive ),
			esc_attr( $table_style ),
			esc_attr( $name ),
			wp_json_encode( $settings ),
			esc_attr( $url ),
			$ai_summary_enabled ? 'true' : 'false',
			esc_attr( $summary_source ),
			esc_attr( $summary_display )
		);

		$output .= '<div class="gswpts_tables_content">';
			$output .= $table;
		$output .= '</div>';
		$output .= '<br/>';
		$output .= $this->edit_table_link( absint( $atts['id'] ) );
		$output .= '</div>';
		$output .= '<br><br>';

		return $output;
	}

	/**
	 * Generate table edit link.
	 *
	 * @param int $table_id The table ID.
	 * @return null|HTML
	 */
	public function edit_table_link( int $table_id ) {
		if ( current_user_can( 'manage_options' ) ) {
			return '<a class="table_customizer_link" style="position: relative; top: 20px;" href="' . esc_url( admin_url( 'admin.php?page=swptls-dashboard#/tables/edit/' . $table_id . '' ) ) . '" target="_blank">Customize Table</a>';
		}

		return null;
	}
}
