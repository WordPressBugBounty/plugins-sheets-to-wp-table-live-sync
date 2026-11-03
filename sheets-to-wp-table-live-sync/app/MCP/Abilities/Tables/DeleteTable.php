<?php
/**
 * Tool T13: flextable/delete-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Tables;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Safety\ConfirmationService;
use GSWPTS\MCP\Safety\SnapshotStore;
use GSWPTS\MCP\Services\CacheService;
use GSWPTS\MCP\Services\ContentService;
use GSWPTS\MCP\Services\TableStore;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Deletes a table (policy-gated, always confirmed).
 *
 * @since 3.26.0
 */
class DeleteTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/delete-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Delete a table', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Deletes a FlexTable table (the Google Sheet is not touched). Only available when the site allows deletes through MCP. Refused while the table is placed on pages/posts unless remove_embeds=true, and while another feature (such as a tab group) still uses it. Always two steps: dry_run=true (default) returns a preview and confirmation_token; apply only after the user agrees.';
	}

	/** {@inheritDoc} */
	public function policy() {
		return 'deletes';
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
				'table'              => self::table_ref_schema(),
				'remove_embeds'      => [
					'type'        => 'boolean',
					'default'     => false,
					'description' => 'Also remove the table from pages/posts (draft content only unless publishing with confirmation is allowed).',
				],
				'dry_run'            => self::dry_run_schema( true ),
				'confirmation_token' => self::confirmation_schema(),
			],
			'required'             => [ 'table' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$table = TableStore::resolve( $input['table'] );
		if ( is_wp_error( $table ) ) {
			return $table;
		}

		$placements = ContentService::placements_of_table( $table['id'] );

		/**
		 * Lets extensions refuse to delete a table that they still use.
		 *
		 * FlexTable Pro refuses while the table is in a tab group.
		 *
		 * @since 3.26.0
		 *
		 * @param true|WP_Error $allowed True, or an error explaining why not.
		 * @param array         $table   Hydrated table.
		 */
		$allowed = apply_filters( 'flextable_mcp_can_delete_table', true, $table );
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		if ( $placements && empty( $input['remove_embeds'] ) ) {
			return new WP_Error(
				'table_embedded',
				__( 'The table is placed on pages or posts. Ask the user, then call again with remove_embeds=true.', 'sheets-to-wp-table-live-sync' ),
				[ 'details' => [ 'placements' => $placements ] ]
			);
		}

		if ( $placements ) {
			$policy = ContentService::check_policy( ContentService::has_live_placement( $placements ) );
			if ( is_wp_error( $policy ) ) {
				return $policy;
			}
		}

		// Check every page first, so nothing is changed when one of them cannot be edited.
		$posts     = [];
		$post_vers = [];
		foreach ( $placements as $placement ) {
			$post = get_post( $placement['post_id'] );
			if ( ! $post ) {
				continue;
			}
			$editable = ContentService::check_editable( $post );
			if ( is_wp_error( $editable ) ) {
				return $editable;
			}
			$posts[]     = $post;
			$post_vers[] = $post->ID . ':' . ContentService::version( $post );
		}

		$result = [
			'table'            => TableStore::brief( $table ),
			'embeds_to_remove' => $placements,
		];

		// Bound to the table and to every page it is on (a new embed invalidates the preview).
		$versions = TableStore::version( $table ) . '|' . implode( ',', $post_vers );

		if ( ! empty( $input['dry_run'] ) ) {
			return self::ok(
				$result,
				[
					'dry_run'      => true,
					'confirmation' => ConfirmationService::issue( $this->name(), $input, $versions, __( 'Delete a table permanently.', 'sheets-to-wp-table-live-sync' ) ),
				]
			);
		}

		$confirmed = ConfirmationService::consume( isset( $input['confirmation_token'] ) ? $input['confirmation_token'] : '', $this->name(), $input, $versions );
		if ( is_wp_error( $confirmed ) ) {
			return $confirmed;
		}

		$removed = [];
		foreach ( $posts as $post ) {
			$changed = ContentService::remove( $post->post_content, 'table', $table['id'] );
			if ( $changed['removed'] ) {
				$saved = ContentService::update_post( $post, [ 'post_content' => $changed['content'] ] );
				if ( is_wp_error( $saved ) ) {
					return $saved;
				}
				$removed[] = $post->ID;
			}
		}

		$snapshot = SnapshotStore::save(
			'table',
			$table['id'],
			[
				'deleted'        => true,
				'id'             => (int) $table['id'],
				'table_name'     => $table['table_name'],
				'source_url'     => $table['source_url'],
				'table_settings' => $table['raw_settings'],
			]
		);

		$deleted = gswpts()->database->table->delete( (int) $table['id'] );
		if ( ! $deleted ) {
			return new WP_Error( 'table_delete_failed', __( 'The table could not be deleted.', 'sheets-to-wp-table-live-sync' ) );
		}
		CacheService::purge( $table['id'] );

		return self::ok(
			array_merge(
				$result,
				[
					'deleted'        => true,
					'embeds_removed' => $removed,
				]
			),
			[ 'snapshot_id' => $snapshot ]
		);
	}
}
