<?php
/**
 * Tool T18: flextable/find-content.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Content;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Services\ContentService;

defined( 'ABSPATH' ) || exit;

/**
 * Finds pages and posts.
 *
 * @since 3.26.0
 */
class FindContent extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/find-content';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Find pages and posts', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Finds pages and posts by title text, slug or ID, or the ones showing a given table (or other embeddable item). Returns status (draft, publish, private…), visibility, whether you can edit/publish it, which editor or page builder it uses, and the FlexTable items already on it. If several match, ask the user which one. Read-only.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		$schema = [
			'type'                 => 'object',
			'properties'           => [
				'query'              => [
					'type'      => 'string',
					'maxLength' => 200,
				],
				'id'                 => [
					'type'    => 'integer',
					'minimum' => 1,
				],
				'slug'               => [
					'type'      => 'string',
					'maxLength' => 200,
				],
				'post_type'          => [
					'type'    => 'string',
					'enum'    => [ 'page', 'post', 'any' ],
					'default' => 'any',
				],
				'status'             => [
					'type'    => 'string',
					'enum'    => [ 'any', 'draft', 'publish', 'private', 'pending', 'future' ],
					'default' => 'any',
				],
				'contains_table'     => [
					'type'    => 'integer',
					'minimum' => 1,
				],
				'limit'              => [
					'type'    => 'integer',
					'minimum' => 1,
					'maximum' => 25,
					'default' => 10,
				],
			],
			'additionalProperties' => false,
		];

		foreach ( ContentService::kinds() as $kind => $def ) {
			if ( 'table' !== $kind ) {
				$schema['properties'][ 'contains_' . $kind ] = [
					'type'        => 'integer',
					'minimum'     => 1,
					'description' => sprintf( 'Find pages/posts showing this %s ID.', $def['label'] ),
				];
			}
		}

		return $schema;
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$type = isset( $input['post_type'] ) ? $input['post_type'] : 'any';

		if ( ! empty( $input['id'] ) || ! empty( $input['slug'] ) ) {
			$ref  = ! empty( $input['id'] ) ? [ 'id' => (int) $input['id'] ] : [ 'slug' => $input['slug'] ];
			$post = ContentService::resolve( $ref, $type );
			if ( is_wp_error( $post ) ) {
				return 'destination_ambiguous' === $post->get_error_code() ? self::ok( [ 'items' => $post->get_error_data()['details']['candidates'] ] ) : $post;
			}
			return self::ok( [ 'items' => [ ContentService::describe( $post ) ] ] );
		}

		$contains = '';
		foreach ( array_keys( ContentService::kinds() ) as $kind ) {
			if ( ! empty( $input[ 'contains_' . $kind ] ) ) {
				$contains = $kind;
				break;
			}
		}

		if ( '' !== $contains ) {
			$placements = ContentService::placements_of( $contains, (int) $input[ 'contains_' . $contains ] );

			$items = [];
			foreach ( $placements as $placement ) {
				$post = get_post( $placement['post_id'] );
				if ( $post && ( current_user_can( 'edit_post', $post->ID ) || 'publish' === $post->post_status ) ) {
					$items[] = ContentService::describe( $post );
				}
			}
			return self::ok( [ 'items' => $items ] );
		}

		return self::ok(
			[
				'items' => ContentService::search(
					[
						'query'     => isset( $input['query'] ) ? $input['query'] : '',
						'post_type' => $type,
						'status'    => isset( $input['status'] ) ? $input['status'] : 'any',
						'limit'     => isset( $input['limit'] ) ? $input['limit'] : 10,
					]
				),
			]
		);
	}
}
