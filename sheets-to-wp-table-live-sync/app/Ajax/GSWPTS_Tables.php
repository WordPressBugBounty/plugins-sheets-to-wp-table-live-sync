<?php
/**
 * Responsible for managing ajax endpoints.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS\Ajax;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for handling table operations.
 *
 * @since 2.12.15
 * @package GSWPTS
 */
class GSWPTS_Tables {

	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {
		add_action( 'wp_ajax_gswpts_sheet_create', [ $this, 'sheet_creation' ] );
		add_action( 'wp_ajax_gswpts_manage_tab_toggle', [ $this, 'tab_name_toggle' ] );

		add_action( 'wp_ajax_gswpts_create_table', [ $this, 'create' ] );
		add_action( 'wp_ajax_gswpts_edit_table', [ $this, 'edit' ] );
		add_action( 'wp_ajax_gswpts_delete_table', [ $this, 'delete' ] );
		add_action( 'wp_ajax_gswpts_copy_table', [ $this, 'copy_table' ] );
		add_action( 'wp_ajax_gswpts_get_tables', [ $this, 'get_all' ] );

		add_action( 'wp_ajax_gswpts_save_table', [ $this, 'save' ] );

		add_action( 'wp_ajax_gswpts_update_sorting', [ $this, 'update_sorting' ] );
		add_action( 'wp_ajax_gswpts_update_sorting_fe', [ $this, 'update_sorting_fe' ] );

		add_action( 'wp_ajax_gswpts_sheet_fetch', [ $this, 'get' ] );
		add_action( 'wp_ajax_nopriv_gswpts_sheet_fetch', [ $this, 'get' ] );
		add_action( 'wp_ajax_gswpts_get_table_preview', [ $this, 'get_table_preview' ] );

		// AI Integration testing.
		add_action( 'wp_ajax_gswpts_test_ai_api', [ $this, 'test_ai_api' ] );
		add_action( 'wp_ajax_gswpts_get_ai_providers', [ $this, 'get_ai_providers' ] );

		add_action( 'wp_ajax_gswpts_generate_ai_summary', [ $this, 'generate_ai_summary' ] );
		add_action( 'wp_ajax_nopriv_gswpts_generate_ai_summary', [ $this, 'generate_ai_summary' ] );

		// CTA Notice dismiss handler
		add_action( 'wp_ajax_gswpts_dismiss_cta_notice', [ $this, 'dismiss_cta_notice' ] );

		// CTA Notice Tabs dismiss handler
		add_action( 'wp_ajax_gswpts_dismiss_cta_notice_tabs', [ $this, 'dismiss_cta_notice_tabs' ] );
	}

	/**
	 * Save table by id.
	 */
	public function save() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$id = ! empty( $_POST['id'] ) ? absint( $_POST['id'] ) : false;
		$settings = ! empty( $_POST['settings'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['settings'] ) ), true ) : false;
		$settings['table_settings'] = wp_json_encode( $settings['table_settings'] );

		if ( ! $id || ! $settings ) {
			wp_send_json_error([
				'message' => __( 'Invalid data to save.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Ensure GlobalThemeCreate is set to false and return the updated settings.
		$updated_table_settings = gswpts()->database->table->check_and_update_global_theme( $settings['table_settings'] );

		// Now, assign the updated table settings back to settings array.
		$settings['table_settings'] = $updated_table_settings;

		// Save the updated settings.
		$response = gswpts()->database->table->update( $id, $settings );

		wp_send_json_success([
			'message' => __( 'Table updated successfully.', 'sheets-to-wp-table-live-sync' ),
			'table_name'     => esc_attr( $settings['table_name'] ),
			'source_url'     => esc_url( $settings['source_url'] ),
			'table_settings' => json_decode( $settings['table_settings'], true ),
		]);
	}

	/**
	 * Sorting disabled BE.
	 */
	public function update_sorting() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$id = ! empty( $_POST['id'] ) ? absint( $_POST['id'] ) : false;
		$allow_sorting = isset( $_POST['allow_sorting'] ) ? filter_var( wp_unslash( $_POST['allow_sorting'] ), FILTER_VALIDATE_BOOLEAN ) : false;

		if ( false !== $id && true !== $allow_sorting ) {
			global $wpdb;
			$table_name = $wpdb->prefix . 'gswpts_tables';

			// Fetch the existing table_settings value for the specified ID.
			$current_settings = $wpdb->get_var( $wpdb->prepare(
				'SELECT table_settings FROM `' . esc_sql( $table_name ) . '` WHERE id = %d',
				$id
			) );

			if ( null !== $current_settings ) {
				// Decode the JSON string into an associative array.
				$current_settings_array = json_decode( $current_settings, true );

				// Update the 'allow_sorting' property.
				$current_settings_array['allow_sorting'] = $allow_sorting;

				// Encode the array back to JSON.
				$new_settings = json_encode( $current_settings_array );

				// Update the 'table_settings' column for the specified ID.
				$wpdb->update(
					$table_name,
					array( 'table_settings' => $new_settings ),
					array( 'id' => $id ),
					array( '%s' ),
					array( '%d' )
				);

				// Check if the update was successful.
				if ( $wpdb->rows_affected > 0 ) {
					wp_send_json_success([
						'message' => __( 'Sorting updated successfully', 'sheets-to-wp-table-live-sync' ),
					]);
				} else {
					wp_send_json_error([
						'message' => __( 'Failed to update sorting', 'sheets-to-wp-table-live-sync' ),
					]);
				}
			} else {
				wp_send_json_error([
					'message' => __( 'Record not found', 'sheets-to-wp-table-live-sync' ),
				]);
			}
		} else {
			wp_send_json_error([
				'message' => __( 'Invalid ID or sorting value', 'sheets-to-wp-table-live-sync' ),
			]);
		}
	}

	/**
	 * Sorting disabled FE.
	 */
	public function update_sorting_fe() {

		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'gswpts_sheet_nonce_action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$id = isset($_POST['id']) ? absint($_POST['id']) : 0;
		$allow_sorting = isset( $_POST['allow_sorting'] ) ? filter_var( wp_unslash( $_POST['allow_sorting'] ), FILTER_VALIDATE_BOOLEAN ) : false;

		if ( false !== $id && true !== $allow_sorting ) {
			global $wpdb;
			$table_name = $wpdb->prefix . 'gswpts_tables';

			// Fetch the existing table_settings value for the specified ID.
			$current_settings = $wpdb->get_var( $wpdb->prepare(
				'SELECT table_settings FROM `' . esc_sql( $table_name ) . '` WHERE id = %d',
				$id
			) );

			if ( null !== $current_settings ) {
				// Decode the JSON string into an associative array.
				$current_settings_array = json_decode( $current_settings, true );

				// Update the 'allow_sorting' property.
				$current_settings_array['allow_sorting'] = $allow_sorting;

				// Encode the array back to JSON.
				$new_settings = json_encode( $current_settings_array );

				// Update the 'table_settings' column for the specified ID.
				$wpdb->update(
					$table_name,
					array( 'table_settings' => $new_settings ),
					array( 'id' => $id ),
					array( '%s' ),
					array( '%d' )
				);

				// Check if the update was successful.
				if ( $wpdb->rows_affected > 0 ) {
					wp_send_json_success([
						'message' => __( 'Sorting updated successfully', 'sheets-to-wp-table-live-sync' ),
					]);
				} else {
					wp_send_json_error([
						'message' => __( 'Failed to update sorting', 'sheets-to-wp-table-live-sync' ),
					]);
				}
			} else {
				wp_send_json_error([
					'message' => __( 'Record not found', 'sheets-to-wp-table-live-sync' ),
				]);
			}
		} else {
			wp_send_json_error([
				'message' => __( 'Invalid ID or sorting value', 'sheets-to-wp-table-live-sync' ),
			]);
		}
	}

	/**
	 * Delete table by id.
	 */
	public function delete() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$id = ! empty( $_POST['id'] ) ? absint( $_POST['id'] ) : false;
		$tables = gswpts()->database->table->get_all();

		if ( $id ) {
			$response = gswpts()->database->table->delete( $id );

			if ( $response ) {
				wp_send_json_success([// phpcs:ignore
					'message'      => sprintf( __( '%s table deleted.', 'sheets-to-wp-table-live-sync' ), $response ),// phpcs:ignore
					'tables'       => $tables,
					'tables_count' => count( gswpts()->database->table->get_all() ),
				]);
			}

			wp_send_json_error([
				'message'      => sprintf( __( 'Failed to delete table with id %d', 'sheets-to-wp-table-live-sync' ), $id ),// phpcs:ignore
				'tables'       => $tables,
				'tables_count' => count( gswpts()->database->table->get_all() ),
			]);
		}

		wp_send_json_error([
			'message'      => __( 'Invalid table to perform delete.', 'sheets-to-wp-table-live-sync' ),
			'tables'       => $tables,
			'tables_count' => count( gswpts()->database->table->get_all() ),
		]);
	}

	/**
	 * Copy Table.
	 */
	public function copy_table() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$id = ! empty( $_POST['id'] ) ? absint( $_POST['id'] ) : false;
		$tables = gswpts()->database->table->get_all();

		if ( $id ) {
			$response = gswpts()->database->table->copied_table( $id );

			if ( $response ) {
				wp_send_json_success([// phpcs:ignore
					'message'      => sprintf( __( '%s table copied.', 'sheets-to-wp-table-live-sync' ), $response ),// phpcs:ignore
					'tables'       => $tables,
					'tables_count' => count( gswpts()->database->table->get_all() ),
				]);
			}

			wp_send_json_error([
				'message'      => sprintf( __( 'Failed to copy table with id %d', 'sheets-to-wp-table-live-sync' ), $id ),// phpcs:ignore
				'tables'       => $tables,
				'tables_count' => count( gswpts()->database->table->get_all() ),
			]);
		}

		wp_send_json_error([
			'message'      => __( 'Invalid table to perform copied.', 'sheets-to-wp-table-live-sync' ),
			'tables'       => $tables,
			'tables_count' => count( gswpts()->database->table->get_all() ),
		]);
	}



	/**
	 * Get all tables on ajax request.
	 *
	 * @since 3.0.0
	 */
	public function get_all() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$tables = gswpts()->database->table->get_all();

		wp_send_json_success([
			'tables'       => $tables,
			'tables_count' => count( $tables ),
		]);
	}

	/**
	 * Create table on ajax request.
	 *
	 * @since 3.0.0
	 */
	public function create() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$sheet_url = isset( $_POST['sheet_url'] ) ? sanitize_text_field( wp_unslash($_POST['sheet_url'] )) : '';

		if ( empty( $sheet_url ) ) {
			wp_send_json_error([
				'message' => __( 'Empty or invalid google sheet url.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$settings = ! empty( $_POST['settings'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['settings'] )), true ) : [];
		$name     = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash($_POST['name'] )) : __( 'Untitled', 'sheets-to-wp-table-live-sync' );

		if ( ! is_array( $settings ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid settings to save.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$gid = gswpts()->helpers->get_grid_id( $sheet_url );

		if ( false === $gid ) {
			wp_send_json_error([
				'message'       => __( 'Copy the Google sheet URL from browser URL bar that includes <i>gid</i> parameter', 'sheets-to-wp-table-live-sync' ),
				'response_type' => esc_html( 'invalid_request' ),
			]);
		}

		$sheet_id = gswpts()->helpers->get_sheet_id( $sheet_url );
		$response = gswpts()->helpers->get_csv_data( $sheet_url, $sheet_id, $gid );

		if ( is_string( $response ) && ( strpos( $response, 'request-storage-access' ) !== false || strpos( $response, 'show-error' ) !== false ) ) {
			wp_send_json_error([
				'message' => __( 'The spreadsheet is restricted. Please make it public by clicking on share button at the top of the spreadsheet', 'sheets-to-wp-table-live-sync' ),
				'type'    => 'private_sheet',
			]);
		}

		$table = [
			'table_name'     => sanitize_text_field( $name ),
			'source_url'     => esc_url_raw( $sheet_url ),
			'source_type'    => 'spreadsheet',
			'table_settings' => wp_json_encode( $settings ),
		];

		$table_id = gswpts()->database->table->insert( $table );

		$context = ! empty( $_POST['context'] ) ? sanitize_text_field( wp_unslash( $_POST['context'] )) : false;

		if ( 'wizard' === $context ) {
			update_option( 'gswpts_ran_setup_wizard', true );
		}

		if ( 'block' === $context ) {
			$this->get_plain( $table_id );
			die();
		}

		wp_send_json_success([
			'id'      => absint( $table_id ),
			'url'     => $sheet_url,
			'message' => esc_html__( 'Table created successfully', 'sheets-to-wp-table-live-sync' ),
		]);
	}

	/**
	 * Edit table on ajax request.
	 *
	 * @since 3.0.0
	 */
	public function edit() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$table_id = ! empty( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;

		if ( ! $table_id ) {
			wp_send_json_error([
				'message' => __( 'Invalid table to edit.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$table = gswpts()->database->table->get( $table_id );

		if ( ! $table ) {
			wp_send_json_error([
				'type'   => 'invalid_request',
				'output' => esc_html__( 'Request is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$settings   = json_decode( $table['table_settings'], true );
		$settings   = null !== $settings ? $settings : unserialize( $table['table_settings'] ); // phpcs:ignore

		wp_send_json_success([
			'table_name'     => esc_attr( $table['table_name'] ),
			'source_url'     => esc_url( $table['source_url'] ),
			'table_settings' => $settings,
		]);
	}

	/**
	 * Edit table on ajax request.
	 *
	 * @since 3.0.0
	 */
	public function get_table_preview() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$settings   = ! empty( $_POST['table_settings'] ) && ! is_array( $_POST['table_settings'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['table_settings'] )), 1 ) : [];
		$sheet_url  = ! empty( $_POST['source_url'] ) ? esc_url_raw( wp_unslash($_POST['source_url'] )) : '';
		$table_name = isset($_POST['table_name']) ? sanitize_text_field(wp_unslash($_POST['table_name'])) : '';
		$table_id = isset($_POST['id']) ? absint($_POST['id']) : 0;

		$sheet_id   = gswpts()->helpers->get_sheet_id( $sheet_url );
		$sheet_gid  = gswpts()->helpers->get_grid_id( $sheet_url );
		$styles     = [];

		/**
		 * Check if create table is private.
		 */
		 $sheet_id = gswpts()->helpers->get_sheet_id( $sheet_url );
		 $gid = gswpts()->helpers->get_grid_id( $sheet_url );
		 $response = gswpts()->helpers->get_csv_data( $sheet_url, $sheet_id, $gid );

		 $is_private = is_string($response) && ( strpos($response, 'request-storage-access') !== false || strpos($response, 'show-error') !== false ) ? true : false;

		// Load Pro classes and functions when Pro is active; otherwise, use the Free implementation. The Free version remains fully functional; this only selects the implementation to load.
		if ( gswpts()->helpers->is_pro_active() ) {
			$table_data = swptlspro()->helpers->load_table_data( $sheet_url, $table_id );
			$response   = swptlspro()->helpers->generate_html( $table_name, $settings, $table_data, false, $table_id );
		} else {
			$table_data = gswpts()->helpers->load_table_data( $sheet_url, $table_id );
			$response = gswpts()->helpers->generate_html( $table_name, $settings, $table_data, false, $table_id );
		}

		if ( empty( $response ) ) {
			wp_send_json_error([
				'type'   => 'invalid_request',
				'output' => esc_html__( 'Please make it public by clicking on share button at the top of spreadsheet', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		wp_send_json_success( [
			'html'     => $response,
			'settings' => $settings,
			'is_private' => $is_private,
		] );
	}

	/**
	 * Responsible for fetching tables.
	 *
	 * @since 2.12.15
	 */
	public function table_fetch() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] )), 'tables_related_nonce_action' ) ) {
			wp_send_json_error([
				'message' => __( 'Action is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$page_slug = isset($_POST['page_slug']) ? sanitize_text_field(wp_unslash($_POST['page_slug'])) : '';

		if ( empty( $page_slug ) ) {
			wp_send_json_error([
				'message' => __( 'Action is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$fetched_tables = gswpts()->database->get_all();
		$tables_html    = $this->table_html( $fetched_tables );

		wp_send_json_success([
			'message' => __( 'Tables fetched successfully.', 'sheets-to-wp-table-live-sync' ),
			'output'  => $tables_html,
			'no_data' => ! $fetched_tables,
		]);
	}

	/**
	 * Populates table html.
	 *
	 * @param array $fetched_tables Fetched tables from db.
	 * @since 2.12.15
	 */
	public function table_html( array $fetched_tables ) {
		$table = '<table id="manage_tables" class="ui celled table">
			<thead>
				<tr>
					<th class="text-center">
						<input data-show="false" type="checkbox" name="manage_tables_main_checkbox"  id="manage_tables_checkbox">
					</th>
					<th class="text-center">' . esc_html__( 'Table ID', 'sheets-to-wp-table-live-sync' ) . '</th>
					<th class="text-center">' . esc_html__( 'Type', 'sheets-to-wp-table-live-sync' ) . '</th>
					<th class="text-center">' . esc_html__( 'Shortcode', 'sheets-to-wp-table-live-sync' ) . '</th>
					<th class="text-center">' . esc_html__( 'Table Name', 'sheets-to-wp-table-live-sync' ) . '</th>
					<th class="text-center">' . esc_html__( 'Delete', 'sheets-to-wp-table-live-sync' ) . '</th>
				</tr>
			</thead>
		<tbody>';

		foreach ( $fetched_tables as $table_data ) {
			$table .= '<tr>';
				$table .= '<td class="text-center">';
					$table .= '<input type="checkbox" value="' . esc_attr( $table_data->id ) . '" name="manage_tables_checkbox" class="manage_tables_checkbox">';
				$table .= '</td>';
				$table .= '<td class="text-center">' . esc_attr( $table_data->id ) . '</td>';
				$table .= '<td class="text-center">';
					/* translators: %s: The table type. */
					$table .= gswpts()->helpers->get_table_type( $table_data->source_type );
				$table .= '</td>';
				$table .= '<td class="text-center" style="display: flex; justify-content: center; align-items: center; height: 35px;">';
						$table .= '<input type="hidden" class="table_copy_sortcode" value="[gswpts_table id=' . esc_attr( $table_data->id ) . ']">';
						$table .= '<span class="gswpts_sortcode_copy" style="display: flex; align-items: center; white-space: nowrap; margin-right: 12px">[gswpts_table id=' . esc_attr( $table_data->id ) . ']</span>';
						$table .= '<i class="fas fa-copy gswpts_sortcode_copy" style="font-size: 20px;color: #b7b8ba; cursor: copy"></i>';
				$table .= '</td>';
				$table .= '<td class="text-center">';
				$table .= '<div style="line-height: 38px;">';
					$table .= '<div class="ui input table_name_hidden">';
						$table .= '<input type="text" class="table_name_hidden_input" value="' . esc_attr( $table_data->table_name ) . '" />';
					$table .= '</div>';

					$table .= '<a style="margin-right: 5px; padding: 5px 15px;white-space: nowrap;"
					class="table_name" href="' . esc_url( admin_url( 'admin.php?page=swptls-dashboard&subpage=create-table&id=' . esc_attr( $table_data->id ) . '' ) ) . '">';
						/* translators: %s: The table type. */
						$table .= esc_html( $table_data->table_name );
					$table .= '</a>';
					$table .= '<button type="button" value="edit" class="copyToken ui right icon button gswpts_edit_table ml-1" id="' . esc_attr( $table_data->id ) . '" style="width: 50px;height: 38px;">';
						$table .= '<img src="' . GSWPTS_BASE_URL . 'assets/public/icons/rename.svg" width="24px" height="15px" alt="rename-icon"/>';
					$table .= '</button>';

					$table .= '</div>';
				$table .= '</td>';
				$table .= '<td class="text-center">';
					$table .= '<button data-id="' . esc_attr( $table_data->id ) . '" id="table-' . esc_attr( $table_data->id ) . '" class="negative ui button gswpts_table_delete_btn">';
						$table .= esc_html__( 'Delete', 'sheets-to-wp-table-live-sync' );
						$table .= '<i class="fas fa-trash"></i>';
				$table .= '</button>';
				$table .= '</td>';
			$table .= '</tr>';
		}
			$table .= '</tbody>';
		$table .= '</table>';

		return $table;
	}

	/**
	 * Handles tab name toggle.
	 *
	 * @return void
	 */
	public function tab_name_toggle() {
		$nonce = isset($_POST['nonce']) ? sanitize_key(wp_unslash($_POST['nonce'])) : '';

		if ( ! wp_verify_nonce($nonce, 'gswpts_tabs_nonce') || ! isset( $_POST['show_name']) ) {
			wp_send_json_error([
				'response_type' => 'invalid_action',
				'output' => __('Action is invalid', 'sheets-to-wp-table-live-sync'),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$id = isset($_POST['tabID']) ? sanitize_text_field(wp_unslash($_POST['tabID'])) : '';
		$name = isset($_POST['show_name']) ? rest_sanitize_boolean(wp_unslash($_POST['show_name'])) : ''; // phpcs:ignore
		$response = gswpts()->database->update_tab_name_toggle( $id, $name );

		if ( $response ) {
			wp_send_json_success([
				'response_type' => 'success',
				'output'        => __( 'Tab updated successfully', 'sheets-to-wp-table-live-sync' ),
			]);
		} else {
			wp_send_json_error([
				'response_type' => 'error',
				'output'        => __( 'Tab could not be updated. Try again', 'sheets-to-wp-table-live-sync' ),
			]);
		}
	}

	/**
	 * Handle sheet fetching.
	 *
	 * @since 2.12.15
	 */
	public function get() {
		// phpcs:ignore
		if ( empty( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'gswpts_sheet_nonce_action' ) ) {
			wp_send_json_error([
				'message' => __( 'Action is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}
		$id = isset($_POST['id']) ? absint($_POST['id']) : 0;

		if ( ! $id ) {
			wp_send_json_error([
				'type'    => 'invalid_request',
				'message' => __( 'Request is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$table = gswpts()->database->table->get( $id );

		if ( ! $table ) {
			wp_send_json_error([
				'type'    => 'no_table_found',
				'message' => esc_html__( 'No table found.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$from_block = isset( $_POST['fromGutenBlock'] ) ? wp_validate_boolean( wp_unslash( $_POST['fromGutenBlock'] ) ) : false; // phpcs:ignore
		$url        = esc_url( $table['source_url'] );
		$name       = esc_attr( $table['table_name'] );
		$sheet_id   = gswpts()->helpers->get_sheet_id( $table['source_url'] );
		$sheet_gid  = gswpts()->helpers->get_grid_id( $table['source_url'] );
		$settings   = json_decode( $table['table_settings'], true );
		$settings   = null !== $settings ? $settings : unserialize( $table['table_settings'] ); // phpcs:ignore
		$styles     = [];

		// Block non-logged-in users when disable_for_non_logged is active (async path)
		$disable_for_non_logged = isset( $settings['user_auth_filtering']['disable_for_non_logged'] )
			&& wp_validate_boolean( $settings['user_auth_filtering']['disable_for_non_logged'] );

		if ( $disable_for_non_logged && ! is_user_logged_in() ) {
			$non_logged_message = ! empty( $settings['user_auth_filtering']['non_logged_message'] )
				? wp_kses_post( $settings['user_auth_filtering']['non_logged_message'] )
				: __( 'This table is only available to logged-in users.', 'sheets-to-wp-table-live-sync' );

			// Build login URL from admin-configured path
			$login_path = ! empty( $settings['user_auth_filtering']['non_logged_login_url'] )
				? sanitize_text_field( $settings['user_auth_filtering']['non_logged_login_url'] )
				: '';

			$login_url = $login_path ? esc_url( trailingslashit( home_url() ) . ltrim( $login_path, '/' ) ) : '';

			wp_send_json_error([
				'type'      => 'non_logged_restricted',
				'message'   => $non_logged_message,
				'login_url' => $login_url,
			]);
		}

		// Load Pro classes and functions when Pro is active; otherwise, use the Free implementation. The Free version remains fully functional; this only selects the implementation to load.
		if ( gswpts()->helpers->is_pro_active() ) {
			$table_data = swptlspro()->helpers->load_table_data( $url, $id );
			$response   = swptlspro()->helpers->generate_html( $name, $settings, $table_data, $from_block, $id );
		} else {
			$table_data = gswpts()->helpers->load_table_data( $url, $id );
			$response = gswpts()->helpers->generate_html( $name, $settings, $table_data, $from_block, $id );

		}

		if ( empty( $response ) ) {
			wp_send_json_error([
				'type'   => 'invalid_request',
				'output' => esc_html__( 'Please make it public by clicking on share button at the top of spreadsheet', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		wp_send_json_success([
			'output'         => $response,
			'table_settings' => $settings,
			'name'           => $name,
			'source_url'     => $url,
			'type'           => 'success',
		]);
	}

	/**
	 * Get sheet fetching in plain values.
	 *
	 * @param int $id The table id.
	 *
	 * @since 2.12.15
	 */
	public function get_plain( int $id ) {
		if ( ! $id ) {
			wp_send_json_error([
				'type'    => 'invalid_request',
				'message' => __( 'Request is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$table = gswpts()->database->table->get( $id );

		if ( ! $table ) {
			wp_send_json_error([
				'type'    => 'no_table_found',
				'message' => esc_html__( 'No table found.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$url        = esc_url( $table['source_url'] );
		$name       = esc_attr( $table['table_name'] );
		$sheet_id   = gswpts()->helpers->get_sheet_id( $table['source_url'] );
		$sheet_gid  = gswpts()->helpers->get_grid_id( $table['source_url'] );
		$settings   = json_decode( $table['table_settings'], true );
		$settings   = null !== $settings ? $settings : unserialize( $table['table_settings'] ); // phpcs:ignore
		$styles     = [];

		// Load Pro classes and functions when Pro is active; otherwise, use the Free implementation. The Free version remains fully functional; this only selects the implementation to load.
		if ( gswpts()->helpers->is_pro_active() ) {
			$table_data = swptlspro()->helpers->load_table_data( $url, $id );
			$response   = swptlspro()->helpers->generate_html( $name, $settings, $table_data, false, $id );
		} else {
			$table_data = gswpts()->helpers->load_table_data( $url, $id );
			$response   = gswpts()->helpers->generate_html( $name, $settings, $table_data, false, $id );

		}

		if ( empty( $response ) ) {
			wp_send_json_error([
				'type'   => 'invalid_request',
				'output' => esc_html__( 'Please make it public by clicking on share button at the top of spreadsheet', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		wp_send_json_success([
			'id'             => $id,
			'output'         => $response,
			'table_settings' => $settings,
			'name'           => $name,
			'source_url'     => $url,
			'type'           => 'success',
		]);
	}

	/**
	 * Handles sheet creation.
	 *
	 * @return mixed
	 */
	public function sheet_creation() {
		if ( empty( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'gswpts_sheet_creation_nonce' ) ) { // phpcs:ignore
			wp_send_json_error([
				'message' => __( 'Action is invalid', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Check if user has permission to create tables.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to create tables', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( isset( $_POST['gutenberg_req'] ) && sanitize_text_field( wp_unslash($_POST['gutenberg_req'] )) ) {
			$this->table_creation_for_gutenberg();
		} else {

			if ( isset( $_POST['form_data'] ) ) {
				$unslashed_form_data = wp_unslash( $_POST['form_data'] ); // phpcs:ignore
				parse_str( $unslashed_form_data, $parsed_data );
				$parsed_data = array_map( 'sanitize_text_field', $parsed_data );

				$sheet_url   = sanitize_text_field( $parsed_data['file_input'] );
				$raw_settings = ! empty( $_POST['table_settings'] ) ? sanitize_text_field( wp_unslash( $_POST['table_settings'] ) ) : '';
				$settings = json_decode( $raw_settings, true );
				$name        = isset( $_POST['table_name'] ) ? sanitize_text_field( wp_unslash($_POST['table_name'] )) : __( 'Untitled', 'sheets-to-wp-table-live-sync' );

				if ( ! is_array( $settings ) ) {
					wp_send_json_error([
						'message' => __( 'Invalid settings to save.', 'sheets-to-wp-table-live-sync' ),
					]);
				}

				if ( empty( $sheet_url ) ) {
					wp_send_json_error([
						'message' => __( 'Form field is empty. Please fill out the field', 'sheets-to-wp-table-live-sync' ),
					]);
				}

				if ( ! empty( $_POST['type'] ) && 'fetch' === sanitize_text_field( wp_unslash($_POST['type'] ) ) ) {
					$this->generate_sheet_html( $sheet_url, $settings, $name, false );
				}

				if ( 'save' === sanitize_text_field( wp_unslash( $_POST['type'] )) || 'saved' === sanitize_text_field( wp_unslash($_POST['type'] )) ) {
					$this->save_table( $sheet_url, $name, $settings );
				}

				if ( isset( $_POST['type'] ) && 'save_changes' === sanitize_text_field( wp_unslash($_POST['type'] )) && isset( $_POST['id'] ) ) {
					$this->update_changes( absint( $_POST['id'] ), $settings );
				}
			}
		}
	}

	/**
	 * Handles sheet html.
	 *
	 * @param string $url The sheet url.
	 *
	 * @param string $settings The sheet settings.
	 *
	 * @param string $name The sheet name.
	 */
	public static function generate_table_html_for_gt( string $url, $settings, $name ) {
		$gid = gswpts()->helpers->get_grid_id( $url );

		if ( false === $gid ) {
			wp_send_json_error([
				'message'       => __( 'Copy the Google sheet URL from browser URL bar that includes <i>gid</i> parameter', 'sheets-to-wp-table-live-sync' ),
				'response_type' => esc_html( 'invalid_request' ),
			]);
		}

		$sheet_id = gswpts()->helpers->get_sheet_id( $url );
		$response = gswpts()->helpers->get_csv_data( $url, $sheet_id, $gid );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error([
				'message' => __( 'The spreadsheet is restricted. Please make it public by clicking on share button at the top of spreadsheet', 'sheets-to-wp-table-live-sync' ),
				'type'    => 'private_sheet',
			]);
		}

		// Load Pro classes and functions when Pro is active; otherwise, use the Free implementation. The Free version remains fully functional; this only selects the implementation to load.
		if ( gswpts()->helpers->is_pro_active() ) {
			$with_style  = wp_validate_boolean( $settings['importStyles'] ?? false );
			$table_style = $with_style ? 'default-style' : ( ! empty( $settings['table_style'] ) ? 'gswpts_' . $settings['table_style'] : '' );
			$images_data = json_decode( swptlspro()->helpers->get_images_data( $sheet_id, $gid ), true );
			$response    = swptlspro()->helpers->generate_html( $name, $settings, $response, $images_data, true );
		} else {
			$response = gswpts()->helpers->generate_html( $response, $settings, $name );
		}

		wp_send_json_success( $response );
	}

	/**
	 * Handles sheet html.
	 *
	 * @param string $url The sheet url.
	 *
	 * @param array  $settings The sheet settings.
	 *
	 * @param string $name The sheet name.
	 *
	 * @param array  $from_block The sheet block.
	 */
	public static function generate_sheet_html( string $url, $settings, $name, $from_block ) {
		$gid = gswpts()->helpers->get_grid_id( $url );

		if ( false === $gid ) {
			wp_send_json_error([
				'message'       => __( 'Copy the Google sheet URL from browser URL bar that includes <i>gid</i> parameter', 'sheets-to-wp-table-live-sync' ),
				'response_type' => esc_html( 'invalid_request' ),
			]);
		}

		$sheet_id = gswpts()->helpers->get_sheet_id( $url );
		$response = gswpts()->helpers->get_csv_data( $url, $sheet_id, $gid );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error([
				'message' => __( 'The spreadsheet is restricted. Please make it public by clicking on share button at the top of spreadsheet', 'sheets-to-wp-table-live-sync' ),
				'type'    => 'private_sheet',
			]);
		}

		// Load Pro classes and functions when Pro is active; otherwise, use the Free implementation. The Free version remains fully functional; this only selects the implementation to load.
		if ( gswpts()->helpers->is_pro_active() ) {
			$images_data = json_decode( swptlspro()->helpers->get_images_data( $sheet_id, $gid ), true );
			$response    = swptlspro()->helpers->generate_html( $response, [], 'untitled', [], $images_data, $from_block );
		} else {
			$response = gswpts()->helpers->generate_html( $response, $settings, $name, $from_block );
		}

		wp_send_json_success( $response );
	}

	/**
	 * Handle saving table.
	 *
	 * @param string $url The parsed data to save.
	 * @param string $table_name  The table name.
	 * @param array  $settings    The table settings to save.
	 */
	public function save_table( string $url, string $table_name, array $settings ) {
		if ( gswpts()->database->has( $url ) ) {
			wp_send_json_error([
				'type'   => 'sheet_exists',
				'output' => esc_html__( 'This Google sheet already saved. Try creating a new one', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$settings = $this->migrate_settings( $settings );

		$data = [
			'table_name'     => sanitize_text_field( $table_name ),
			'source_url'     => esc_url_raw( $url ),
			'source_type'    => 'spreadsheet',
			'table_settings' => wp_json_encode( $settings ),
		];

		$response = gswpts()->database->table->insert( $data );

		wp_send_json_success([
			'type'   => 'saved',
			'id'     => absint( $response ),
			'url'    => $url,
			'output' => esc_html__( 'Table saved successfully', 'sheets-to-wp-table-live-sync' ),
		]);
	}

	/**
	 * Handles update changes.
	 *
	 * @param int   $table_id The table id.
	 * @param array $settings Settings to update.
	 */
	public function update_changes( int $table_id, array $settings ) {
		$settings = $this->migrate_settings( $settings );
		$response = gswpts()->database->update( $table_id, $settings );

		wp_send_json_success([
			'type'   => 'updated',
			'output' => esc_html__( 'Table changes updated successfully', 'sheets-to-wp-table-live-sync' ),
		]);
	}

	/**
	 * Retrieves table settings.
	 *
	 * @param  array $table_settings The table settings.
	 * @return array
	 */
	public static function migrate_settings( array $table_settings ) {
		$settings = [
			'table_title'           => isset( $table_settings['table_title'] ) ? wp_validate_boolean( $table_settings['table_title'] ) : false,
			'default_rows_per_page' => isset( $table_settings['defaultRowsPerPage'] ) ? absint( $table_settings['defaultRowsPerPage'] ) : 10,
			'show_info_block'       => isset( $table_settings['showInfoBlock'] ) ? wp_validate_boolean( $table_settings['showInfoBlock'] ) : false,
			'show_x_entries'        => isset( $table_settings['showXEntries'] ) ? wp_validate_boolean( $table_settings['showXEntries'] ) : false,
			'swap_filter_inputs'    => isset( $table_settings['swapFilterInputs'] ) ? wp_validate_boolean( $table_settings['swapFilterInputs'] ) : false,
			'swap_bottom_options'   => isset( $table_settings['swapBottomOptions'] ) ? wp_validate_boolean( $table_settings['swapBottomOptions'] ) : false,
			'allow_sorting'         => isset( $table_settings['allowSorting'] ) ? wp_validate_boolean( $table_settings['allowSorting'] ) : false,
			'search_bar'            => isset( $table_settings['searchBar'] ) ? wp_validate_boolean( $table_settings['searchBar'] ) : false,
		];

		return apply_filters( 'gswpts_table_settings', $settings, $table_settings );
	}

	/**
	 * Table creation for gutenberg.
	 *
	 * @since 2.12.15
	 *
	 * @phpcs:disable WordPress.Security.NonceVerification
	 */
	public function table_creation_for_gutenberg() {
		$url = isset( $_POST['file_input'] ) ? sanitize_text_field( wp_unslash($_POST['file_input'] )) : '';
		$action = isset( $_POST['type'] ) ? sanitize_text_field( wp_unslash($_POST['type'] )) : 'fetch';

		if ( ! $url && 'fetch' === $action ) {
			wp_send_json_error([
				'response_type' => 'empty_field',
				'output'        => __( 'Form field is empty. Please fill out the field', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$table_id = ! empty( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
		$name     = ! empty( $_POST['table_name'] ) ? sanitize_text_field( wp_unslash($_POST['table_name'] )) : '';
		$settings = ! empty( $_POST['table_settings'] ) && is_array( $_POST['table_settings'] ) ? sanitize_text_field( wp_unslash( $_POST['table_settings'] ) ) : [];
		$action   = sanitize_text_field( wp_unslash($_POST['type'] ));
		$from_block = isset( $_POST['fromGutenBlock'] ) ? sanitize_text_field( wp_validate_boolean( wp_unslash( $_POST['fromGutenBlock'] ) ) ) : false; // phpcs:ignore

		switch ( $action ) {
			case 'fetch':
				$this->generate_table_html_for_gt( $url, $settings, $name, true );
				break;

			case 'save':
			case 'saved':
				$this->save_table( $url, $name, $settings );
				break;

			case 'save_changes':
				$this->update_changes( $table_id, $settings );
				break;
		}
	}

	/**
	 * Performs delete operations on given ids.
	 *
	 * @param int[] $ids The given int ids.
	 */
	public function delete_all( $ids ) {
		foreach ( $ids as $id ) {
			$response = $this->delete( $id );

			if ( ! $response ) {
				wp_send_json_error([
					'type'   => 'invalid_request',
					'output' => __( 'Request is invalid', 'sheets-to-wp-table-live-sync' ),
				]);

				break;
			}
		}

		wp_send_json_success([
			'output' => __( 'Selected tables deleted successfully', 'sheets-to-wp-table-live-sync' ),
		]);
	}

	/**
	 * Performs updates on tables and tabs.
	 *
	 * @param string $name    The name to update.
	 * @param int    $id      The id where to update.
	 */
	public function update_name( $name, $id ) {
		global $wpdb;

		$table  = $wpdb->prefix . 'gswpts_tables';
		$data   = [ 'table_name' => $name ];
		$output = __( 'Table name updated successfully', 'sheets-to-wp-table-live-sync' );

		$response = $wpdb->update(
			$table,
			$data,
			[ 'id' => $id ],
			[ '%s' ],
			[ '%d' ]
		);

		if ( $response ) {
			wp_send_json_success([
				'output' => $output,
				'type'   => 'updated',
			]);
		}

		wp_send_json_success([
			'output' => __( 'Could not update the data.', 'sheets-to-wp-table-live-sync' ),
			'type'   => 'invalid_action',
		]);
	}




	/**
	 * Test AI API for any provider.
	 *
	 * @since 3.0.0
	 */
	public function test_ai_api() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		$provider = isset( $_POST['provider'] ) ? sanitize_text_field( wp_unslash( $_POST['provider'] ) ) : 'openai';
		$api_key = isset( $_POST['api_key'] ) ? sanitize_text_field( wp_unslash( $_POST['api_key'] ) ) : '';
		$model = isset( $_POST['model'] ) ? sanitize_text_field( wp_unslash( $_POST['model'] ) ) : '';

		if ( empty( $api_key ) ) {
			wp_send_json_error([
				'message' => __( 'API key is required', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Use the AI Manager to test the connection.
		$ai_manager = isset( gswpts()->ai ) ? gswpts()->ai : new \GSWPTS\AI\GSWPTS_AIManager();
		$credentials = [ 'api_key' => $api_key ];
		if ( ! empty( $model ) ) {
			$credentials['model'] = $model;
		}
		$test_result = $ai_manager->test_provider_connection( $provider, $credentials, $model );

		if ( is_wp_error( $test_result ) ) {
			wp_send_json_error([
				'message' => $test_result->get_error_message(),
			]);
		} else {
			wp_send_json_success([
				'message' => $test_result['message'],
				'response' => $test_result['response'] ?? '',
				'usage' => $test_result['usage'] ?? [],
			]);
		}
	}

	/**
	 * Get available AI providers.
	 *
	 * @since 3.0.0
	 */
	public function get_ai_providers() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Get available AI providers.
		$ai_manager = isset( gswpts()->ai ) ? gswpts()->ai : new \GSWPTS\AI\GSWPTS_AIManager();
		$providers = $ai_manager->get_provider_list();

		wp_send_json_success([
			'providers' => $providers,
			'current_provider' => $ai_manager->get_current_provider(),
		]);
	}


	/**
	 * Generate AI Summary for table data.
	 * Handle frontend AI summary generation via AJAX.
	 *
	 * Security note for automated reviewers:
	 * This endpoint is intentionally public (nopriv) because it serves visitors
	 * viewing tables on front-end pages. AI summary generation is a read-only,
	 * visitor-facing feature — no data is written or modified.
	 *
	 * Transient cache key security:
	 *  1. wp_verify_nonce() blocks CSRF / unauthorized requests.
	 *  2. $table_id is cast with intval() and verified against the database.
	 *  3. The cache key is derived entirely server-side: "{table_id}_{md5_of_admin_prompt}".
	 *     No user-supplied value contributes to the key, so unbounded row creation
	 *     is not possible. Each table + prompt combination maps to exactly one entry.
	 *  4. $prompt_hash is MD5 of the admin-configured prompt (fixed 32 chars).
	 *  5. Transients auto-expire via the admin-configured cache duration.
	 *  6. A bulk-delete clears all entries for a table on force-regenerate.
	 *
	 * @since 3.0.0
	 */
	public function generate_ai_summary() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'gswpts_sheet_nonce_action' ) ) {
			wp_send_json_error( 'Security check failed' );
		}

		$table_id = isset( $_POST['table_id'] ) ? intval( $_POST['table_id'] ) : 0;
		$table_data = isset( $_POST['table_data'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['table_data'] ) ), true ) : [];
		$table_settings = isset( $_POST['table_settings'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['table_settings'] ) ), true ) : [];
		$cache_key = isset( $_POST['cache_key'] ) ? sanitize_text_field( wp_unslash( $_POST['cache_key'] ) ) : '';
		$force_regenerate = isset( $_POST['force_regenerate'] ) ? wp_validate_boolean( wp_unslash( $_POST['force_regenerate'] ) ) : false; // phpcs:ignore

		if ( $table_id <= 0 || empty( $table_data ) ) {
			wp_send_json_error( 'Invalid table data provided' );
		}

		// Rate limit per IP + table, BEFORE any DB lookup or AI call happens.
		// This prevents unbounded transient creation and API cost drain.
		$client_ip = gswpts()->helpers->get_client_ip();
		$rl_key    = 'gswpts_ai_rl_' . $table_id . '_' . md5( $client_ip );
		$rl_count  = (int) get_transient( $rl_key );

		if ( $rl_count >= 5 ) {
			wp_send_json_error( [
				'message'    => 'Too many requests. Please wait a moment and try again.',
				'error_type' => 'rate_limited',
			] );
		}
		set_transient( $rl_key, $rl_count + 1, MINUTE_IN_SECONDS );

		// Check if AI Summary is enabled for this table.
		$table = gswpts()->database->table->get( $table_id );
		if ( ! $table ) {
			wp_send_json_error( 'Table not found' );
		}

		// Get table settings from database and merge with defaults FIRST - this is the trusted source.
		$table_settings_json = json_decode( $table['table_settings'], true );

		// Default AI settings
		$default_ai_settings = [
			'show_table_prompt_fields' => false,
			'ask_ai_placeholder' => 'Ask anything about this table… e.g., Top 5 products by sales',
			'ask_ai_button_label' => 'Ask AI',
			'backend_ai_summary' => '',
			'backend_summary_exists' => false,
			'show_regenerate_button' => false,
			'enable_backend_ai_trigger' => false,
			'edit_summary_content' => false,
			'show_summary_in_table' => false,
			'summary_prompt' => 'Give a short summary of this table (max 50 words), highlighting key takeaways and trends.',
			'enable_ai_cache' => true,
			'enable_ai_summary' => false,
		];

		// Merge database settings with defaults - this is the trusted source.
		$merged_settings = array_merge( $default_ai_settings, $table_settings_json ?: [] );

		// Only accept a client-supplied prompt if the admin actually turned on "Ask AI" for THIS table.
		// Read that flag from $merged_settings (built from the trusted DB record above),
		// never from the client-supplied $table_settings blob.
		$prompt_fields_enabled = wp_validate_boolean( $merged_settings['show_table_prompt_fields'] ?? false );

		if ( $prompt_fields_enabled ) {
			$client_prompt = '';

			if ( isset( $table_settings['ai_settings']['summary_prompt'] ) ) {
				$client_prompt = (string) $table_settings['ai_settings']['summary_prompt'];
			} elseif ( isset( $table_settings['summary_prompt'] ) ) {
				$client_prompt = (string) $table_settings['summary_prompt'];
			}

			$client_prompt = trim( $client_prompt );

			if ( '' !== $client_prompt ) {
				// Cap length server-side too, don't just trust the client.
				$merged_settings['summary_prompt'] = mb_substr( $client_prompt, 0, 1000 );
			}
		}
		// else: any client-supplied summary_prompt is silently ignored -
		// the admin-configured default from $merged_settings is used.

		$ai_enabled = wp_validate_boolean( $merged_settings['enable_ai_summary'] ?? false );

		if ( ! $ai_enabled ) {
			wp_send_json_error( 'AI Summary is not enabled for this table' );
		}

		// Get AI settings and check if AI is available.
		if ( gswpts()->helpers->is_pro_active() ) {
			$ai_manager = isset( swptlspro()->ai ) ? swptlspro()->ai : new \SWPTLSPRO\AI\AIManager();
		} else {
			$ai_manager = isset( gswpts()->ai ) ? gswpts()->ai : new \GSWPTS\AI\GSWPTS_AIManager();
		}
		$current_provider = $ai_manager->get_current_provider_instance();

		if ( ! $current_provider ) {
			wp_send_json_error( 'AI is not configured. Please configure an AI provider in the plugin settings.' );
		}

		// Check if the current provider has valid credentials.
		$provider_name = $ai_manager->get_current_provider();
		$api_key_option = "gswpts_{$provider_name}_api_key";
		$api_key = get_option( $api_key_option, '' );

		if ( empty( $api_key ) ) {
			wp_send_json_error( 'AI provider API key is not configured. Please configure it in the plugin settings.' );
		}

		try {
			// Check cache first (unless forcing regenerate).
			$enable_cache = wp_validate_boolean( $merged_settings['enable_ai_cache'] ?? true );

			// Build the cache key entirely server-side from validated data so the
			// public endpoint cannot create unbounded transient rows.
			// Format: {verified_table_id}_{md5_of_admin_prompt} — fully bounded.
			$prompt_hash = md5( $merged_settings['summary_prompt'] ?? '' );
			$unique_cache_key = $table_id . '_' . $prompt_hash;

			// If cache is disabled or force regenerate, ensure we get fresh results
			if ( ! $enable_cache || $force_regenerate ) {
				// Clear all related cache entries for this table to ensure fresh results
				global $wpdb;
				$like = $wpdb->esc_like( "_transient_gswpts_ai_summary_{$table_id}_" ) . '%';
				$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like ) );
				$like_timeout = $wpdb->esc_like( "_transient_timeout_gswpts_ai_summary_{$table_id}_" ) . '%';
				$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like_timeout ) );
			} elseif ( $enable_cache && ! $force_regenerate ) {
				$cached_summary = get_transient( "gswpts_ai_summary_{$unique_cache_key}" );
				if ( $cached_summary ) {
					wp_send_json_success( $cached_summary );
					return;
				}
			}

			// Generate AI summary with the merged settings (including custom prompt)
			$summary_data = $this->call_ai_api( $table_data, $merged_settings );

			// Check if AI call returned an error
			if ( is_wp_error( $summary_data ) ) {
				$error_message = $summary_data->get_error_message();
				$error_type = $summary_data->get_error_code();

				wp_send_json_error( [
					'message' => esc_html( $error_message ),
					'error_type' => $error_type,
					'table_id' => $table_id,
				] );
				return;
			}

			// Cache the result only if caching is enabled.
			// Security: key = "gswpts_ai_summary_{validated_table_id}_{md5_prompt_hash}".
			// $table_id is verified against the DB above; $cache_key is sanitize_text_field();
			// $prompt_hash is MD5 (fixed length). Transients auto-expire via $cache_duration.
			if ( $enable_cache ) {
				$cache_duration = get_option( 'gswpts_cache_duration', 1800 );

				// Cap distinct cached prompts per table so custom prompts can't
				// accumulate unbounded transient rows over time.
				$max_cached_prompts = apply_filters( 'gswpts_ai_cache_max_prompts', 10, $table_id );

				global $wpdb;
				$like     = $wpdb->esc_like( "_transient_timeout_gswpts_ai_summary_{$table_id}_" ) . '%';
				$existing = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE %s ORDER BY option_value ASC",
						$like
					)
				);

				if ( count( $existing ) >= $max_cached_prompts ) {
					// option_value on a _timeout_ row is the expiry timestamp — oldest evicted first.
					$to_evict = array_slice( $existing, 0, count( $existing ) - $max_cached_prompts + 1 );
					foreach ( $to_evict as $row ) {
						$key = str_replace( '_transient_timeout_', '', $row->option_name );
						delete_transient( $key );
					}
				}

				set_transient( "gswpts_ai_summary_{$unique_cache_key}", $summary_data, $cache_duration );
			}

			wp_send_json_success( $summary_data );

		} catch ( Exception $e ) {
			// Fallback error handling for any unexpected exceptions
			wp_send_json_error( [
				'message' => 'An unexpected error occurred while generating the summary.',
				'error_type' => 'general_error',
				'table_id' => $table_id,
			] );
		}
	}

	/**
	 * Format table data for AI processing (convert CSV to structured format like frontend).
	 *
	 * @since 3.0.0
	 *
	 * @param array $table_data Raw table data from load_table_data.
	 * @param array $table      Table database record.
	 * @return array Structured table data with headers, rows, title, etc.
	 */
	private function format_table_data_for_ai( $table_data, $table ) {
		$structured_data = [
			'headers' => [],
			'rows' => [],
			'title' => sanitize_text_field( $table['table_name'] ),
			'totalVisibleRows' => 0,
		];

		// Get CSV data from the response.
		$csv_data = $table_data['sheet_data'] ?? '';
		if ( empty( $csv_data ) ) {
			return $structured_data;
		}

		// Parse CSV data into rows.
		$lines = explode( "\n", trim( $csv_data ) );
		if ( empty( $lines ) ) {
			return $structured_data;
		}

		$parsed_rows = [];
		foreach ( $lines as $line ) {
			if ( empty( trim( $line ) ) ) {
				continue;
			}
			$parsed_rows[] = str_getcsv( $line );
		}

		if ( empty( $parsed_rows ) ) {
			return $structured_data;
		}

		// First row is headers.
		$headers = array_shift( $parsed_rows );
		if ( ! empty( $headers ) ) {
			$structured_data['headers'] = array_map( function ( $header ) {
				// Clean header text (remove HTML, limit length).
				$clean_header = wp_strip_all_tags( $header );
				return trim( $clean_header );
			}, $headers );
		}

		// Process data rows.
		foreach ( $parsed_rows as $row ) {
			if ( empty( $row ) ) {
				continue;
			}

			$cleaned_row = [];
			foreach ( $row as $cell ) {
				// Clean cell content (remove HTML, limit length to prevent token overflow).
				$clean_cell = wp_strip_all_tags( $cell );
				$clean_cell = trim( $clean_cell );

				// Limit cell content length to prevent token overflow (like frontend does).
				if ( strlen( $clean_cell ) > 100 ) {
					$clean_cell = substr( $clean_cell, 0, 97 ) . '...';
				}

				$cleaned_row[] = $clean_cell;
			}

			if ( ! empty( $cleaned_row ) ) {
				$structured_data['rows'][] = $cleaned_row;
			}
		}

		$structured_data['totalVisibleRows'] = count( $structured_data['rows'] );

		return $structured_data;
	}

	/**
	 * Call AI API to generate summary with proper token management.
	 *
	 * @since 3.0.0
	 *
	 * @param array $table_data The table data to summarize.
	 * @param array $table_settings The table settings including custom prompt.
	 * @return array|WP_Error Summary data with metadata or error.
	 */
	private function call_ai_api( $table_data, $table_settings = [] ) {
		// Generate AI summary using the AI manager with table settings
		if ( gswpts()->helpers->is_pro_active() ) {
			$ai_manager = isset( swptlspro()->ai ) ? swptlspro()->ai : new \SWPTLSPRO\AI\AIManager();
		} else {
			$ai_manager = isset( gswpts()->ai ) ? gswpts()->ai : new \GSWPTS\AI\GSWPTS_AIManager();
		}
		$summary_result = $ai_manager->generate_table_summary( $table_data, [], $table_settings );

		if ( is_wp_error( $summary_result ) ) {
			$error_message = $summary_result->get_error_message();

			// Handle specific API errors with user-friendly messages
			if ( strpos( $error_message, 'Rate limit reached' ) !== false ) {
				// Extract wait time from the error message
				preg_match('/Please try again in ([^.]+)/', $error_message, $matches);
				$wait_time = isset($matches[1]) ? $matches[1] : 'a few minutes';
				$error_message = "Rate limit reached. Please try again in {$wait_time}. You can increase your rate limit by adding a payment method to your OpenAI account.";
			} elseif ( strpos( $error_message, 'max_tokens is too large' ) !== false ) {
				$error_message = 'The table data is too large for the selected AI model. Please try with a smaller dataset or use a model with higher token limits.';
			} elseif ( strpos( $error_message, 'context_length_exceeded' ) !== false ) {
				$error_message = 'The table data exceeds the maximum context length for the selected AI model. Please try with a smaller dataset or use a different model.';
			} elseif ( strpos( $error_message, 'insufficient_quota' ) !== false ) {
				$error_message = 'Your OpenAI account has exceeded its quota. Please check your billing and usage limits.';
			} elseif ( strpos( $error_message, 'invalid_api_key' ) !== false ) {
				$error_message = 'Invalid API key. Please check your OpenAI API key configuration.';
			} elseif ( strpos( $error_message, 'model_not_found' ) !== false ) {
				$error_message = 'The selected AI model is not available. Please try a different model.';
			}

			// Determine error type for better frontend handling
			$error_code = 'general_error';
			if ( strpos( $error_message, 'Rate limit reached' ) !== false ) {
				$error_code = 'rate_limit';
			} elseif ( strpos( $error_message, 'quota' ) !== false ) {
				$error_code = 'quota_exceeded';
			} elseif ( strpos( $error_message, 'API key' ) !== false ) {
				$error_code = 'invalid_api_key';
			} elseif ( strpos( $error_message, 'too large' ) !== false || strpos( $error_message, 'context_length' ) !== false ) {
				$error_code = 'token_limit';
			}

			// Return WP_Error instead of throwing exception
			return new \WP_Error( $error_code, esc_html( $error_message ) );
		}

		return $summary_result;
	}




	/**
	 * Handle CTA notice dismissal.
	 *
	 * @since 3.0.0
	 */
	public function dismiss_cta_notice() {
		// Verify nonce for security
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Update option to mark CTA notice as dismissed
		$result = update_option( 'gswpts_cta_notice_dismissed', true );

		if ( $result ) {
			wp_send_json_success([
				'message' => __( 'CTA notice dismissed successfully', 'sheets-to-wp-table-live-sync' ),
			]);
		} else {
			wp_send_json_error([
				'message' => __( 'Failed to dismiss CTA notice', 'sheets-to-wp-table-live-sync' ),
			]);
		}
	}

	/**
	 * Dismiss CTA notice for tabs.
	 *
	 * @since 3.0.0
	 */
	public function dismiss_cta_notice_tabs() {
		// Verify nonce for security
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error([
				'message' => __( 'You do not have permission to perform this action.', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Update option to mark CTA notice tabs as dismissed
		$result = update_option( 'gswpts_cta_notice_tabs_dismissed', true );

		if ( $result ) {
			wp_send_json_success([
				'message' => __( 'CTA notice for tabs dismissed successfully', 'sheets-to-wp-table-live-sync' ),
			]);
		} else {
			wp_send_json_error([
				'message' => __( 'Failed to dismiss CTA notice for tabs', 'sheets-to-wp-table-live-sync' ),
			]);
		}
	}


}
