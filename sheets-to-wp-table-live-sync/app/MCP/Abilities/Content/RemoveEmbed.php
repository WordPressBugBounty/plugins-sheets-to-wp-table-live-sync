<?php
/**
 * Tool T20: flextable/remove-embed.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Content;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Safety\ConfirmationService;
use GSWPTS\MCP\Services\ContentService;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Removes a table or tab group from a page or post (the table is kept).
 *
 * @since 3.26.0
 */
class RemoveEmbed extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/remove-embed';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Remove a table from a page or post', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Removes a table (or another embeddable item, such as a tab group when available) shortcode/block from one page or post. The item itself is not deleted. For published, private or scheduled content this depends on the site policy and needs dry_run=true first, then the confirmation_token.';
	}

	/** {@inheritDoc} */
	public function annotations() {
		return [
			'readonly'    => false,
			'destructive' => true,
			'idempotent'  => true,
			'open_world'  => false,
		];
	}

	/** {@inheritDoc} */
	public function input_schema() {
		$schema = [
			'type'                 => 'object',
			'properties'           => [
				'table'              => [
					'type'    => 'integer',
					'minimum' => 1,
				],
				'post'               => [
					'type'       => [ 'integer', 'object' ],
					'minimum'    => 1,
					'properties' => [
						'id'    => [ 'type' => 'integer' ],
						'slug'  => [ 'type' => 'string' ],
						'title' => [ 'type' => 'string' ],
					],
				],
				'dry_run'            => self::dry_run_schema(),
				'confirmation_token' => self::confirmation_schema(),
			],
			'required'             => [ 'post' ],
			'additionalProperties' => false,
		];

		foreach ( ContentService::kinds() as $kind => $def ) {
			if ( 'table' !== $kind ) {
				$schema['properties'][ $kind ] = [
					'type'        => 'integer',
					'minimum'     => 1,
					'description' => sprintf( 'ID of the %s to remove instead of a table.', $def['label'] ),
				];
			}
		}

		return $schema;
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$kind = '';
		foreach ( array_keys( ContentService::kinds() ) as $candidate ) {
			if ( ! empty( $input[ $candidate ] ) ) {
				$kind = $candidate;
				break;
			}
		}
		if ( '' === $kind ) {
			/* translators: %s: list of argument names. */
			return new WP_Error( 'invalid_arguments', sprintf( __( 'Give one of: %s (ID).', 'sheets-to-wp-table-live-sync' ), implode( ', ', array_keys( ContentService::kinds() ) ) ) );
		}
		$id = (int) $input[ $kind ];

		$post = ContentService::resolve( $input['post'] );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$editable = ContentService::check_editable( $post );
		if ( is_wp_error( $editable ) ) {
			return $editable;
		}

		$live   = ContentService::is_live( $post );
		$policy = ContentService::check_policy( $live );
		if ( is_wp_error( $policy ) ) {
			return $policy;
		}

		$changed = ContentService::remove( $post->post_content, $kind, $id );

		$result = [
			'post'          => [
				'id'     => $post->ID,
				'title'  => get_the_title( $post ),
				'status' => $post->post_status,
			],
			'removed_count' => $changed['removed'],
		];

		if ( ! $changed['removed'] ) {
			return new WP_Error( 'not_embedded', __( 'That item is not on this page/post.', 'sheets-to-wp-table-live-sync' ) );
		}

		$versions = ContentService::version( $post );

		if ( ! empty( $input['dry_run'] ) ) {
			$extra = [ 'dry_run' => true ];
			if ( $live ) {
				$extra['confirmation'] = ConfirmationService::issue( $this->name(), $input, $versions, __( 'Remove a table from visible content.', 'sheets-to-wp-table-live-sync' ) );
			}
			return self::ok( $result, $extra );
		}

		if ( $live ) {
			$confirmed = ConfirmationService::consume( isset( $input['confirmation_token'] ) ? $input['confirmation_token'] : '', $this->name(), $input, $versions );
			if ( is_wp_error( $confirmed ) ) {
				return $confirmed;
			}
		}

		$snapshot = ContentService::update_post( $post, [ 'post_content' => $changed['content'] ] );
		if ( is_wp_error( $snapshot ) ) {
			return $snapshot;
		}

		return self::ok( $result, [ 'snapshot_id' => $snapshot ] );
	}
}
