<?php
/**
 * Registering widget options & settings.
 *
 * @since 2.13.1
 * @package SWPTLS
 */

namespace SWPTLS\Elementor;  // phpcs:ignore

/**
 * Registering controls.
 *
 * @since 2.13.1
 */
class TableSettings {

	/**
	 * Generate display settings fields.
	 *
	 * @return void
	 */
	public function display_settings() {
		$settings = swptls()->settings->display_settings_array();

		foreach ( $settings as $key => $setting ) {
			$field_content = $this->generate_setting_field($setting);

			// Check for NULL before passing to wp_kses_post.
			if ( null !== $field_content ) {
				echo wp_kses_post($field_content);
			}
		}
	}

	/**
	 * Generate sort and filter settings.
	 *
	 * @return void
	 */
	public function sort_and_filter_settings() {
		$settings = swptls()->settings->sort_and_filter_settings_array();

		foreach ( $settings as $key => $setting ) {
			$field_content = $this->generate_setting_field($setting);

			// Check for NULL before passing to wp_kses_post.
			if ( null !== $field_content ) {
				echo wp_kses_post($field_content);
			}
		}
	}

	/**
	 * Generate table tools settings.
	 *
	 * @return void
	 */
	public function table_tools_settings() {
		$table_tools_array = $this->table_tools_array();

		foreach ( $table_tools_array as $key => $setting ) {
			$field_content = $this->generate_setting_field($setting);

			// Check for NULL before passing to wp_kses_post.
			if ( null !== $field_content ) {
				echo wp_kses_post($field_content);
			}
		}
	}

	/**
	 * Generate table tools array list.
	 *
	 * @return array
	 */
	public function table_tools_array(): array {
		$settings_array = [
			'table_export' => [
				'feature_title' => __( 'Table Exporting', 'sheetstowptable' ),
				'feature_desc'  => __( 'Enable this feature in order to allow your user to download your table content as various format.', 'sheetstowptable' ),
				'input_name'    => 'table_exporting',
				'is_pro'        => true,
				'type'          => 'multi-select',
				'values'        => $this->table_export_values(),
				'default_text'  => 'Choose Type',
				'show_tooltip'  => true,
			],
			'table_cache'  => [
				'feature_title' => __( 'Table Caching', 'sheetstowptable' ),
				'feature_desc'  => __('Enabling this feature would cache the Google sheet data & therefore the table will load faster than before.
                                        Also it will load the updated data when there is a change in your Google sheet.', 'sheetstowptable'),
				'input_name'    => 'table_cache',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'checkbox',
				'show_tooltip'  => true,
			],

			'hide_column'  => [
				'feature_title' => __( 'Hide Column', 'sheetstowptable' ),
				'feature_desc'  => __( 'Hide your table columns based on multiple screen sizes.', 'sheetstowptable' ),
				'input_name'    => 'hide_column',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'custom-type',
				'default_text'  => 'Hide Column',
				'show_tooltip'  => false,
				'icon_url'      => SWPTLS_BASE_URL . 'assets/public/icons/hide_column.svg',
			],
			'hide_column_mobile'  => [
				'feature_title' => __( 'Hide Column on Mobile', 'sheetstowptable' ),
				'feature_desc'  => __( 'Hide your table columns based on mobile screen sizes.', 'sheetstowptable' ),
				'input_name'    => 'hide_column_mobile',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'custom-type',
				'default_text'  => 'Hide Column',
				'show_tooltip'  => false,
				'icon_url'      => SWPTLS_BASE_URL . 'assets/public/icons/hide_column.svg',
			],

			'hide_rows'    => [
				'feature_title' => __( 'Hide Row\'s', 'sheetstowptable' ),
				'feature_desc'  => __( 'Hide your table rows based on your custom selection', 'sheetstowptable' ),
				'input_name'    => 'hide_rows',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'custom-type',
				'default_text'  => 'Hide Row',
				'show_tooltip'  => false,
				'icon_url'      => SWPTLS_BASE_URL . 'assets/public/icons/hide_column.svg',
			],
			'hide_rows_mobile'    => [
				'feature_title' => __( 'Hide Row\'s', 'sheetstowptable' ),
				'feature_desc'  => __( 'Hide your table rows based on your custom selection', 'sheetstowptable' ),
				'input_name'    => 'hide_rows_mobile',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'custom-type',
				'default_text'  => 'Hide Row',
				'show_tooltip'  => false,
				'icon_url'      => SWPTLS_BASE_URL . 'assets/public/icons/hide_column.svg',
			],

			'hide_cell'    => [
				'feature_title' => __( 'Hide Cell', 'sheetstowptable' ),
				'feature_desc'  => __( 'Hide your specific table cell that is not going to visibile to your user\'s.', 'sheetstowptable' ),
				'input_name'    => 'hide_cell',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'custom-type',
				'default_text'  => 'Hide Cell',
				'show_tooltip'  => false,
				'icon_url'      => SWPTLS_BASE_URL . 'assets/public/icons/hide_column.svg',
			],
			'hide_cell_mobile'    => [
				'feature_title' => __( 'Hide Cell', 'sheetstowptable' ),
				'feature_desc'  => __( 'Hide your specific table cell that is not going to visibile to your user\'s.', 'sheetstowptable' ),
				'input_name'    => 'hide_cell_mobile',
				'checked'       => false,
				'is_pro'        => true,
				'type'          => 'custom-type',
				'default_text'  => 'Hide Cell',
				'show_tooltip'  => false,
				'icon_url'      => SWPTLS_BASE_URL . 'assets/public/icons/hide_column.svg',
			],
		];

		$settings_array = apply_filters( 'gswpts_table_tools_settings_arr', $settings_array );

		return $settings_array;
	}

	/**
	 * Generate table export values.
	 *
	 * @return array
	 */
	public function table_export_values(): array {
		$export_values = [
			'json'  => [
				'val'   => 'JSON',
				'isPro' => true,
			],
			'pdf'   => [
				'val'   => 'PDF',
				'isPro' => true,
			],
			'csv'   => [
				'val'   => 'CSV',
				'isPro' => true,
			],
			'excel' => [
				'val'   => 'Excel',
				'isPro' => true,
			],
			'print' => [
				'val'   => 'Print',
				'isPro' => true,
			],
			'copy'  => [
				'val'   => 'Copy',
				'isPro' => true,
			],
		];

		$export_values = apply_filters( 'gswpts_table_export_values', $export_values );

		return $export_values;
	}

	/**
	 * Generate single setting field.
	 *
	 * @param array $setting The setting data.
	 * @return HTML
	 */
	public function generate_setting_field( $setting ) {
		if ( 'checkbox' === $setting['type'] ) {
			return '
            <div class="card_container">
                <div class="ui cards">
                    <div class="card">
                        <div class="content">
                            <div class="card-top-header">
                                <span>
                                    ' . $setting['feature_title'] . '
                                </span>
                                <div class="ui toggle checkbox">
                                    <input type="checkbox"
                                        name="' . $setting['input_name'] . '" id="' . $setting['input_name'] . '">
                                    <label for="' . $setting['input_name'] . '"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ';
		}

		if ( 'select' === $setting['type'] ) {
			return '
            <div class="card_container">
                <div class="ui cards">
                    <div class="card">
                        <div class="content">

                            <div class="card-top-header">
                                <span>
                                    ' . $setting['feature_title'] . '
                                </span>
                                <select id="' . $setting['input_name'] . '" style="width: 150px;">
                                    ' . $this->select_values( $setting['values'], $setting['default_value'] ?? '' ) . '
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ';
		}
	}

	/**
	 * Generate select fields.
	 *
	 * @param  array  $values  The select values.
	 * @param  string $default The default value.
	 * @return HTML
	 */
	public function select_values( array $values, string $default ) {
		$html = '';
		foreach ( $values as $key => $value ) {
			$html .= '<option value="' . $key . '" ' . $this->selected( $default, $key ) . '>' . $value['val'] . '</option>';
		}

		return $html;
	}

	/**
	 * Set select attribute on select fields.
	 *
	 * @param string $default The default value.
	 * @param string $key The key to compare.
	 */
	public function selected( $default, $key ) {
		return $default === $key ? 'selected' : '';
	}
}
