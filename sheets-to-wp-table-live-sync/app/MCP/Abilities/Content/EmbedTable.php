<?php
/**
 * Tool T19: flextable/embed-table.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Content;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Safety\ConfirmationService;
use GSWPTS\MCP\Safety\SnapshotStore;
use GSWPTS\MCP\Services\ContentService;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Places a table (or another embeddable item) on a page or post.
 *
 * @since 3.26.0
 */
class EmbedTable extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/embed-table';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Place a table on a page or post', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Places a table (or another item listed in the arguments, such as a tab group when available) on an existing page/post or on a new one. New pages/posts are drafts unless you ask otherwise. Existing content keeps its status unless "status" is given. Never adds the same table twice. Pages built with Elementor, Divi or Beaver Builder are refused. Changing published, private or scheduled content, or publishing, depends on the site policy and needs dry_run=true first, then the confirmation_token after the user agrees. Returns the post ID, edit URL and preview URL or permalink.';
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
				'table'              => self::table_ref_schema(),
				'destination'        => [
					'type'                 => 'object',
					'description'          => 'Either {"post": ID or {"id"|"slug"|"title"}} for existing content, or {"new": {"post_type":"page","title":"…"}}.',
					'properties'           => [
						'post'      => [
							'type'       => [ 'integer', 'object' ],
							'minimum'    => 1,
							'properties' => [
								'id'    => [ 'type' => 'integer' ],
								'slug'  => [ 'type' => 'string' ],
								'title' => [ 'type' => 'string' ],
							],
						],
						'post_type' => [
							'type' => 'string',
							'enum' => [ 'page', 'post', 'any' ],
						],
						'new'       => [
							'type'                 => 'object',
							'properties'           => [
								'post_type'   => [
									'type' => 'string',
									'enum' => [ 'page', 'post' ],
								],
								'title'       => [
									'type'      => 'string',
									'minLength' => 1,
									'maxLength' => 200,
								],
								'intro_text'  => [
									'type'      => 'string',
									'maxLength' => 5000,
								],
								'parent_page' => [
									'type'    => 'integer',
									'minimum' => 1,
								],
							],
							'required'             => [ 'post_type', 'title' ],
							'additionalProperties' => false,
						],
					],
					'additionalProperties' => false,
				],
				'position'           => [
					'type'                 => 'object',
					'properties'           => [
						'where'        => [
							'type'    => 'string',
							'enum'    => [ 'end', 'start', 'after_heading' ],
							'default' => 'end',
						],
						'heading_text' => [
							'type'      => 'string',
							'maxLength' => 200,
						],
					],
					'additionalProperties' => false,
				],
				'status'             => [
					'type'        => 'string',
					'enum'        => [ 'draft', 'pending', 'publish', 'private', 'keep' ],
					'description' => 'Default: draft for new content, keep for existing content.',
				],
				'dry_run'            => self::dry_run_schema(),
				'confirmation_token' => self::confirmation_schema(),
			],
			'required'             => [ 'destination' ],
			'additionalProperties' => false,
		];

		return self::with_item_kinds( $schema );
	}

	/**
	 * Adds one argument per extra embeddable kind (e.g. tab_group from Pro).
	 *
	 * @param array $schema Schema.
	 * @return array
	 */
	public static function with_item_kinds( array $schema ) {
		foreach ( ContentService::kinds() as $kind => $def ) {
			if ( 'table' !== $kind && is_array( $def['schema'] ) ) {
				$schema['properties'][ $kind ] = $def['schema'];
			}
		}
		return $schema;
	}

	/**
	 * Picks the item to place from the arguments.
	 *
	 * @param array $input Arguments.
	 * @return array|WP_Error {kind, plural, id, name, shortcode}
	 */
	public static function pick_item( array $input ) {
		$labels = [];
		foreach ( ContentService::kinds() as $kind => $def ) {
			$labels[] = '"' . $kind . '"';
			if ( ! isset( $input[ $kind ] ) ) {
				continue;
			}
			$item = call_user_func( $def['resolve'], $input[ $kind ] );
			if ( is_wp_error( $item ) ) {
				return $item;
			}
			return [
				'kind'      => $kind,
				'plural'    => $def['plural'],
				'id'        => (int) $item['id'],
				'name'      => (string) $item['name'],
				'shortcode' => (string) $item['shortcode'],
			];
		}

		/* translators: %s: list of argument names. */
		return new WP_Error( 'invalid_arguments', sprintf( __( 'Give one of: %s.', 'sheets-to-wp-table-live-sync' ), implode( ', ', $labels ) ) );
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		// What to place.
		$item = self::pick_item( $input );
		if ( is_wp_error( $item ) ) {
			return $item;
		}
		$kind      = $item['kind'];
		$item_id   = $item['id'];
		$item_name = $item['name'];
		$shortcode = $item['shortcode'];

		$destination = $input['destination'];
		$position    = isset( $input['position'] ) ? $input['position'] : [ 'where' => 'end' ];
		$post        = null;

		if ( isset( $destination['new'] ) ) {
			$post_type = $destination['new']['post_type'];
			$type_obj  = get_post_type_object( $post_type );
			if ( ! $type_obj || ! current_user_can( $type_obj->cap->create_posts ) ) {
				return new WP_Error( 'forbidden', __( 'You are not allowed to create this kind of content.', 'sheets-to-wp-table-live-sync' ) );
			}
			$status = isset( $input['status'] ) && 'keep' !== $input['status'] ? $input['status'] : 'draft';
		} elseif ( isset( $destination['post'] ) ) {
			$post = ContentService::resolve( $destination['post'], isset( $destination['post_type'] ) ? $destination['post_type'] : 'any' );
			if ( is_wp_error( $post ) ) {
				return $post;
			}
			$editable = ContentService::check_editable( $post );
			if ( is_wp_error( $editable ) ) {
				return $editable;
			}
			$post_type = $post->post_type;
			$type_obj  = get_post_type_object( $post_type );
			$status    = isset( $input['status'] ) && 'keep' !== $input['status'] ? $input['status'] : $post->post_status;
		} else {
			return new WP_Error( 'invalid_arguments', __( 'destination needs "post" or "new".', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( in_array( $status, [ 'publish', 'private' ], true ) && ! current_user_can( $type_obj->cap->publish_posts ) ) {
			return new WP_Error( 'forbidden', __( 'You are not allowed to publish this kind of content.', 'sheets-to-wp-table-live-sync' ) );
		}

		$touches_live = ( $post && ContentService::is_live( $post ) ) || in_array( $status, [ 'publish', 'private', 'future' ], true );

		$policy = ContentService::check_policy( $touches_live );
		if ( is_wp_error( $policy ) ) {
			return $policy;
		}

		// Already there?
		$current = $post ? $post->post_content : '';
		$embeds  = ContentService::embeds_in( $current );
		$present = isset( $embeds[ $item['plural'] ] ) && in_array( $item_id, $embeds[ $item['plural'] ], true );

		$blocks = $post ? 'block' === ContentService::editor_of( $post ) : ( function_exists( 'use_block_editor_for_post_type' ) ? use_block_editor_for_post_type( $post_type ) : true );

		if ( $present ) {
			$content = $current;
		} else {
			$base = $current;
			if ( ! $post && ! empty( $destination['new']['intro_text'] ) ) {
				$intro = esc_html( sanitize_textarea_field( $destination['new']['intro_text'] ) );
				$base  = $blocks ? "<!-- wp:paragraph -->\n<p>" . nl2br( $intro ) . "</p>\n<!-- /wp:paragraph -->" : wpautop( $intro );
			}
			$content = ContentService::insert( $base, ContentService::markup( $shortcode, $blocks ), $blocks, $position );
			if ( is_wp_error( $content ) ) {
				return $content;
			}
		}

		$status_change = $post && $status !== $post->post_status;

		$result = [
			'item'  => [
				'kind'      => $kind,
				'id'        => $item_id,
				'name'      => $item_name,
				'shortcode' => $shortcode,
			],
			'post'  => $post ? ContentService::describe( $post ) : [
				'id'     => null,
				'type'   => $post_type,
				'title'  => $destination['new']['title'],
				'status' => $status,
			],
			'embed' => [
				'method'          => $blocks ? 'shortcode_block' : 'classic_shortcode',
				'already_present' => $present,
				'position'        => isset( $position['where'] ) ? $position['where'] : 'end',
				'new_status'      => $status,
			],
		];

		if ( $present && ! $status_change ) {
			return self::ok( $result, [ 'warnings' => [ self::warning( 'already_present', __( 'It is already on this page/post, so nothing was changed.', 'sheets-to-wp-table-live-sync' ) ) ] ] );
		}

		$versions = ContentService::version( $post ) . '|' . $kind . $item_id;

		if ( ! empty( $input['dry_run'] ) ) {
			$extra = [ 'dry_run' => true ];
			if ( $touches_live ) {
				$extra['confirmation'] = ConfirmationService::issue( $this->name(), $input, $versions, __( 'Change content that visitors can see, or publish it.', 'sheets-to-wp-table-live-sync' ) );
			}
			return self::ok( $result, $extra );
		}

		if ( $touches_live ) {
			$confirmed = ConfirmationService::consume( isset( $input['confirmation_token'] ) ? $input['confirmation_token'] : '', $this->name(), $input, $versions );
			if ( is_wp_error( $confirmed ) ) {
				return $confirmed;
			}
		}

		$snapshot = 0;

		if ( $post ) {
			$changes = [ 'post_content' => $content ];
			if ( $status_change ) {
				$changes['post_status'] = $status;
			}
			$snapshot = ContentService::update_post( $post, $changes );
			if ( is_wp_error( $snapshot ) ) {
				return $snapshot;
			}
			$post_id = $post->ID;
		} else {
			$args = [
				'post_type'    => $post_type,
				'post_title'   => sanitize_text_field( $destination['new']['title'] ),
				'post_content' => $content,
				'post_status'  => $status,
			];
			if ( 'page' === $post_type && ! empty( $destination['new']['parent_page'] ) ) {
				$args['post_parent'] = (int) $destination['new']['parent_page'];
			}
			$post_id = wp_insert_post( wp_slash( $args ), true );
			if ( is_wp_error( $post_id ) ) {
				return $post_id;
			}
			$snapshot = SnapshotStore::save( 'post', $post_id, [ 'created' => true ] );
			ContentService::flush_placements();
		}

		$saved    = get_post( $post_id );
		$check    = ContentService::embeds_in( $saved ? $saved->post_content : '' );
		$verified = $saved && isset( $check[ $item['plural'] ] ) && in_array( $item_id, $check[ $item['plural'] ], true ) && $saved->post_status === $status;

		$result['post'] = ContentService::describe( $saved );

		return self::ok(
			$result,
			[
				'snapshot_id'  => $snapshot,
				'verification' => [
					'verified' => $verified,
					'checked'  => [ 'embed_present', 'status' ],
				],
			]
		);
	}
}
