<?php
/**
 * Tool T25: flextable/undo-operation.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Operations;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Database\Migrations;
use GSWPTS\MCP\Safety\ConfirmationService;
use GSWPTS\MCP\Safety\SnapshotStore;
use GSWPTS\MCP\Services\ContentService;
use GSWPTS\MCP\Services\TableStore;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Restores what an MCP operation changed.
 *
 * @since 3.26.0
 */
class UndoOperation extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/undo-operation';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Undo an operation', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Restores the tables, pages/posts and other FlexTable items changed by one earlier MCP operation (see flextable-list-recent-operations) to their state before it. New pages/posts created by the operation are moved to the trash; deleted tables are re-created with a new ID. Refused if the object changed again later, unless force=true. Always two steps: dry_run=true (default), then the confirmation_token.';
	}

	/** {@inheritDoc} */
	public function annotations() {
		return [
			'readonly'    => false,
			'destructive' => true,
			'idempotent'  => false,
			'open_world'  => false,
		];
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'operation_id'       => [
					'type'    => 'integer',
					'minimum' => 1,
				],
				'force'              => [
					'type'    => 'boolean',
					'default' => false,
				],
				'dry_run'            => self::dry_run_schema( true ),
				'confirmation_token' => self::confirmation_schema(),
			],
			'required'             => [ 'operation_id' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		if ( ! Migrations::is_installed() ) {
			return new WP_Error( 'undo_unavailable', __( 'Undo history is not available yet.', 'sheets-to-wp-table-live-sync' ) );
		}

		$snapshots = SnapshotStore::for_audit( (int) $input['operation_id'] );
		$snapshots = array_values(
			array_filter(
				$snapshots,
				function ( $s ) {
					return empty( $s['restored'] ) && (int) $s['user_id'] === get_current_user_id();
				}
			)
		);

		if ( ! $snapshots ) {
			return new WP_Error( 'nothing_to_undo', __( 'This operation has nothing to undo (or it was already undone).', 'sheets-to-wp-table-live-sync' ) );
		}

		$plan     = [];
		$versions = [];

		foreach ( array_reverse( $snapshots ) as $snapshot ) {
			$type   = $snapshot['object_type'];
			$id     = (int) $snapshot['object_id'];
			$state  = is_array( $snapshot['before_state'] ) ? $snapshot['before_state'] : [];
			$newer  = $this->changed_later( $snapshot );
			$plan[] = [
				'object_type'    => $type,
				'object_id'      => $id,
				'action'         => $this->action_for( $type, $state ),
				'changed_later'  => $newer,
			];
			$versions[] = $type . $id . ':' . (string) self::current_version( $type, $id );

			if ( $newer && empty( $input['force'] ) ) {
				return new WP_Error(
					'stale_preview',
					__( 'This object was changed again after that operation. Undo the later operations first, or use force=true.', 'sheets-to-wp-table-live-sync' ),
					[ 'details' => [ 'object' => $type . ' ' . $id ] ]
				);
			}
		}

		$result      = [ 'restores' => $plan ];
		$fingerprint = md5( implode( '|', $versions ) );

		if ( ! empty( $input['dry_run'] ) ) {
			return self::ok(
				$result,
				[
					'dry_run'      => true,
					'confirmation' => ConfirmationService::issue( $this->name(), $input, $fingerprint, __( 'Undo an earlier change.', 'sheets-to-wp-table-live-sync' ) ),
				]
			);
		}

		$confirmed = ConfirmationService::consume( isset( $input['confirmation_token'] ) ? $input['confirmation_token'] : '', $this->name(), $input, $fingerprint );
		if ( is_wp_error( $confirmed ) ) {
			return $confirmed;
		}

		$done = [];
		foreach ( array_reverse( $snapshots ) as $snapshot ) {
			$restored = $this->restore( $snapshot );
			if ( is_wp_error( $restored ) ) {
				return $restored;
			}
			$done[] = (int) $snapshot['id'];
		}
		SnapshotStore::mark_restored( $done );

		return self::ok( $result );
	}

	/**
	 * What restoring a snapshot will do.
	 *
	 * @param string $type  Object type.
	 * @param array  $state State.
	 * @return string
	 */
	private function action_for( $type, array $state ) {
		if ( 'post' === $type && ! empty( $state['created'] ) ) {
			return 'trash_created_post';
		}
		if ( 'table' === $type && ! empty( $state['deleted'] ) ) {
			return 'recreate_deleted_table';
		}
		if ( 'table' !== $type && 'post' !== $type && ! empty( $state['deleted'] ) ) {
			return 'recreate_deleted_' . $type;
		}
		return 'restore_previous_state';
	}

	/**
	 * Whether a newer, unrestored snapshot exists for the same object.
	 *
	 * @param array $snapshot Snapshot.
	 * @return bool
	 */
	private function changed_later( array $snapshot ) {
		// Changed outside MCP (dashboard, editor) since MCP's change?
		if ( ! empty( $snapshot['after_hash'] ) ) {
			$now = self::current_version( $snapshot['object_type'], (int) $snapshot['object_id'] );
			if ( null !== $now && substr( md5( $now ), 0, 32 ) !== $snapshot['after_hash'] ) {
				return true;
			}
		}

		global $wpdb;
		$table = Migrations::snapshot_table();
		$count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE object_type = %s AND object_id = %d AND id > %d AND restored = 0", $snapshot['object_type'], (int) $snapshot['object_id'], (int) $snapshot['id'] ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
		return $count > 0;
	}

	/**
	 * Current version fingerprint of an object, or null when unknown.
	 *
	 * @param string $type Object type.
	 * @param int    $id   Object ID.
	 * @return string|null
	 */
	private static function current_version( $type, $id ) {
		if ( 'table' === $type ) {
			return TableStore::version( TableStore::get( $id ) );
		}
		if ( 'post' === $type ) {
			return ContentService::version( get_post( $id ) );
		}

		/**
		 * Version fingerprint of an object type added by an extension (e.g. tab_group).
		 *
		 * @since 3.26.0
		 *
		 * @param string|null $version Null when unknown.
		 * @param string      $type    Object type.
		 * @param int         $id      Object ID.
		 */
		$version = apply_filters( 'flextable_mcp_object_version', null, $type, $id );
		return null === $version ? null : (string) $version;
	}

	/**
	 * Post date fields to restore (published or scheduled posts only).
	 *
	 * @param array $state Snapshot state.
	 * @return array
	 */
	private static function date_fields( array $state ) {
		if ( empty( $state['post_date_gmt'] ) || '0000-00-00 00:00:00' === $state['post_date_gmt'] ) {
			return [];
		}
		return [
			'post_date_gmt' => $state['post_date_gmt'],
			'post_date'     => get_date_from_gmt( $state['post_date_gmt'] ),
			'edit_date'     => true,
		];
	}

	/**
	 * Restores one snapshot.
	 *
	 * @param array $snapshot Snapshot.
	 * @return true|WP_Error
	 */
	private function restore( array $snapshot ) {
		$id    = (int) $snapshot['object_id'];
		$state = is_array( $snapshot['before_state'] ) ? $snapshot['before_state'] : [];

		switch ( $snapshot['object_type'] ) {
			case 'table':
				if ( ! empty( $state['deleted'] ) ) {
					$new_id = TableStore::recreate( isset( $state['id'] ) ? (int) $state['id'] : $id, $state['table_name'], $state['source_url'], (string) $state['table_settings'] );
					return is_wp_error( $new_id ) ? $new_id : true;
				}
				return TableStore::restore( $id, $state );

			case 'post':
				$post = get_post( $id );
				if ( ! $post || ! current_user_can( 'edit_post', $id ) ) {
					return new WP_Error( 'forbidden', __( 'You can no longer edit this page or post.', 'sheets-to-wp-table-live-sync' ) );
				}
				if ( ! empty( $state['created'] ) ) {
					return wp_trash_post( $id ) ? true : new WP_Error( 'restore_failed', __( 'The page could not be moved to the trash.', 'sheets-to-wp-table-live-sync' ) );
				}
				$result = wp_update_post(
					wp_slash(
						[
							'ID'            => $id,
							'post_content'  => $state['post_content'],
							'post_status'   => $state['post_status'],
							'post_password' => $state['post_password'],
						] + self::date_fields( $state )
					),
					true
				);
				ContentService::flush_placements();
				return is_wp_error( $result ) ? $result : true;
		}

		/**
		 * Restores a snapshot of an object type added by an extension
		 * (FlexTable Pro restores tab groups).
		 *
		 * @since 3.26.0
		 *
		 * @param true|WP_Error|null $restored Null when nobody handled it.
		 * @param array              $snapshot Snapshot row.
		 */
		$restored = apply_filters( 'flextable_mcp_restore_snapshot', null, $snapshot );
		if ( null !== $restored ) {
			return $restored;
		}

		return new WP_Error( 'restore_failed', __( 'This change cannot be undone on this site (the feature that made it is not active).', 'sheets-to-wp-table-live-sync' ) );
	}
}
