<?php
/**
 * Managing database operations for tables.
 *
 * @since 3.0.0
 * @package SWPTLS
 */

namespace SWPTLS\Database;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Manages plugin database operations.
 *
 * @since 3.0.0
 */
class Table {

	/**
	 * Fetch table with specific ID.
	 *
	 * @param  int $id The table id.
	 * @return mixed
	 */
	public function get( int $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'gswpts_tables';

		$result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id=%d", absint( $id ) ), ARRAY_A ); // phpcs:ignore

		return ! is_null( $result ) ? $result : null;
	}

	/**
	 * Insert table into the db.
	 *
	 * @param array $data The data to save.
	 * @return int|false
	 */
	public function insert( array $data ) {
		global $wpdb;

		$table  = $wpdb->prefix . 'gswpts_tables';
		$format = [ '%s', '%s', '%s', '%s', '%s' ];

		$wpdb->insert( $table, $data, $format );
		return $wpdb->insert_id;
	}

	/**
	 * Update table with specific ID.
	 *
	 * @param int   $id The table id.
	 * @param array $data The data to update.
	 */
	public function update( int $id, array $data ) {
		global $wpdb;
		$table = $wpdb->prefix . 'gswpts_tables';

		$where  = [ 'id' => $id ];
		$format = [ '%s', '%s', '%s', '%s' ];

		$where_format = [ '%d' ];

		return $wpdb->update( $table, $data, $where, $format, $where_format );
	}


	/**
	 * Check and update global themes in all tables.
	 *
	 * @param string $table_settings JSON-encoded table settings.
	 */
	public function check_and_update_global_theme( $table_settings ) {
		global $wpdb;

		$table_settings = json_decode( $table_settings, true );

		// Check if 'import_styles_theme_colors' exists.
		if ( isset( $table_settings['import_styles_theme_colors'] ) ) {
			foreach ( $table_settings['import_styles_theme_colors'] as $theme_name => $theme_data ) {
				// Only modify GlobalThemeCreate if it exists.
				if ( isset( $theme_data['GlobalThemeCreate'] ) && true === $theme_data['GlobalThemeCreate'] ) {
					$table_settings['import_styles_theme_colors'][ $theme_name ]['GlobalThemeCreate'] = false;
					$this->clone_theme_to_all_tables( $theme_name, $theme_data );
				}
			}
		}

		// Return the updated table settings.
		return wp_json_encode( $table_settings );
	}






	/**
	 * Clone a theme to all tables.
	 *
	 * @param string $theme_name Name of the theme.
	 * @param array  $theme_data Theme data to clone.
	 */
	private function clone_theme_to_all_tables( $theme_name, $theme_data ) {
		global $wpdb;

		$table_name = $wpdb->prefix . 'gswpts_tables';
		$rows = $wpdb->get_results( "SELECT id, table_settings FROM {$table_name}", ARRAY_A ); // phpcs:ignore

		foreach ( $rows as $row ) {
			$current_table_settings = json_decode( $row['table_settings'], true );

			// Ensure `import_styles_theme_colors` exists.
			if ( ! isset( $current_table_settings['import_styles_theme_colors'] ) ) {
				$current_table_settings['import_styles_theme_colors'] = [];
			}

			// Add the theme if it doesn't already exist.
			if ( ! isset( $current_table_settings['import_styles_theme_colors'][ $theme_name ] ) ) {
				$current_table_settings['import_styles_theme_colors'][ $theme_name ] = $theme_data;

				// Update the table.
				$updated_table_settings = wp_json_encode( $current_table_settings );
				$wpdb->update(
					$table_name,
					[ 'table_settings' => $updated_table_settings ],
					[ 'id' => $row['id'] ],
					[ '%s' ],
					[ '%d' ]
				);
			}
		}
	}

	/**
	 * Delete table data from the DB.
	 *
	 * @param int $id  The table id to delete.
	 * @return int|false
	 */
	public function delete( int $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'gswpts_tables';

		return $wpdb->delete( $table, [ 'id' => $id ], [ '%d' ] );
	}

	/**
	 * Copied table data from the DB.
	 *
	 * @param int $id  The table id to copied.
	 * @return int|false
	 */
	public function copied_table( int $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'gswpts_tables';

		// Retrieve the row with the given ID.
		$original_row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id),ARRAY_A ); // phpcs:ignore

		if ( null === $original_row ) {
			return new WP_Error( 'no_row_found', 'No row found with the given ID' );
		}

		// Modify the table_name.
		$original_row['table_name'] = 'copy of ' . $original_row['table_name'];

		// Remove the id field to insert a new row.
		unset($original_row['id']);

		// Insert the modified row back into the table.
		$inserted = $wpdb->insert(
			$table,
			$original_row
		);

		if ( false === $inserted ) {
			return new WP_Error( 'insert_failed', 'Failed to insert the copied row' );
		}

		return $wpdb->insert_id;
	}


	/**
	 * Fetch all the saved tables
	 *
	 * @return mixed
	 */
	public function get_all() {
		global $wpdb;

		$table  = $wpdb->prefix . 'gswpts_tables';
		$query  = "SELECT * FROM $table";
		$result = $wpdb->get_results( $query ); // phpcs:ignore

		return $result;
	}


	/**
	 * Fetch all theme style data
	 *
	 * @return mixed
	 */
	public function get_all_theme() {
		global $wpdb;

		$table = $wpdb->prefix . 'gswpts_tables';
		$query = "SELECT * FROM $table";

		$results = $wpdb->get_results($query); // phpcs:ignore

		if ( $results ) {
			$themes = array();

			foreach ( $results as $result ) {
				$table_settings = json_decode($result->table_settings, true);

				$import_styles_theme_colors = isset($table_settings['import_styles_theme_colors']) ? $table_settings['import_styles_theme_colors'] : array();
				$table_style = isset($table_settings['table_style']) ? $table_settings['table_style'] : null;

				// Prepare the theme data.
				$theme = array(
					'theme_name' => $table_style,
					'theme_style_properties' => $import_styles_theme_colors,
				);

				$themes[] = $theme;
			}

			return $themes;
		}

		// Return an empty array if no themes found.
		return array();
	}



	/**
	 * Checks for sheet duplication.
	 *
	 * @param string $url The sheet url.
	 * @return boolean
	 */
	public function has( string $url ): bool {
		global $wpdb;

		$result = $wpdb->get_row(
			$wpdb->prepare( "SELECT * from {$wpdb->prefix}gswpts_tables WHERE `source_url` LIKE %s", $url )
		);

		return ! is_null( $result );
	}
}
