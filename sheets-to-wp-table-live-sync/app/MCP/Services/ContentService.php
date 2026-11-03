<?php
/**
 * Pages and posts: finding them, placing tables (and other embeddable items
 * registered with `flextable_mcp_embed_kinds`), removing placements and
 * changing status. Core post types `page` and `post` only.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

use GSWPTS\MCP\Safety\SnapshotStore;
use GSWPTS\MCP\Settings;
use WP_Error;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * WordPress content helpers.
 *
 * @since 3.26.0
 */
class ContentService {

	const POST_TYPES = [ 'page', 'post' ];

	/**
	 * Regex for table shortcodes ([gswpts_table id="N"] and variants).
	 */
	const TABLE_RE = '/\[gswpts_table\s+id\s*=\s*["\']?\s*(\d+)\s*["\']?\s*\]/i';

	/**
	 * Regex for the FlexTable block comment.
	 */
	const BLOCK_RE = '/<!--\s*wp:swptls\/google-sheets-to-wp-tables\s+(\{.*?\})\s*\/?-->/s';

	/**
	 * Request-level cache of placements.
	 *
	 * @var array|null
	 */
	private static $placements = null;

	/**
	 * Embeddable item kinds.
	 *
	 * @return array kind => {tag, plural, label, schema, resolve}
	 */
	public static function kinds() {
		$kinds = [
			'table' => [
				'tag'     => 'gswpts_table',
				'plural'  => 'tables',
				'label'   => 'table',
				'schema'  => null,
				'resolve' => [ __CLASS__, 'resolve_table_item' ],
			],
		];

		/**
		 * Filters the items that can be placed on pages and posts.
		 *
		 * FlexTable Pro adds 'tab_group' => [ 'tag' => 'gswpts_tab', 'plural' => 'tab_groups',
		 * 'label' => 'tab group', 'schema' => [...], 'resolve' => callable ].
		 * resolve( $ref ) returns {id, name, shortcode} or a WP_Error.
		 *
		 * @since 3.26.0
		 *
		 * @param array $kinds kind => definition.
		 */
		$filtered = apply_filters( 'flextable_mcp_embed_kinds', $kinds );
		$filtered = is_array( $filtered ) ? $filtered : [];
		$out      = [ 'table' => $kinds['table'] ];

		foreach ( $filtered as $kind => $def ) {
			if ( 'table' === $kind || ! is_array( $def ) || empty( $def['tag'] ) || empty( $def['plural'] ) || ! preg_match( '/^[a-z_]+$/', $def['tag'] ) || ! isset( $def['resolve'] ) || ! is_callable( $def['resolve'] ) ) {
				continue;
			}
			$out[ $kind ] = $def + [
				'label'  => $kind,
				'schema' => null,
			];
		}

		return $out;
	}

	/**
	 * Resolves a table for embedding.
	 *
	 * @param mixed $ref Table reference.
	 * @return array|WP_Error {id, name, shortcode}
	 */
	public static function resolve_table_item( $ref ) {
		$table = TableStore::resolve( $ref );
		if ( is_wp_error( $table ) ) {
			return $table;
		}
		return [
			'id'        => $table['id'],
			'name'      => $table['table_name'],
			'shortcode' => TableStore::shortcode( $table['id'] ),
		];
	}

	/**
	 * Resolves a post reference: integer ID, {id}, {slug} or {title}.
	 *
	 * @param mixed  $ref       Reference.
	 * @param string $post_type page|post|any.
	 * @return WP_Post|WP_Error
	 */
	public static function resolve( $ref, $post_type = 'any' ) {
		$types = 'any' === $post_type ? self::POST_TYPES : [ $post_type ];

		if ( is_numeric( $ref ) ) {
			$ref = [ 'id' => (int) $ref ];
		}

		if ( ! is_array( $ref ) ) {
			return new WP_Error( 'post_not_found', __( 'Give the page or post ID, slug or title.', 'sheets-to-wp-table-live-sync' ) );
		}

		if ( isset( $ref['id'] ) ) {
			$post = get_post( (int) $ref['id'] );
			if ( ! $post || ! in_array( $post->post_type, $types, true ) || in_array( $post->post_status, [ 'trash', 'auto-draft', 'inherit' ], true ) ) {
				return new WP_Error( 'post_not_found', __( 'No page or post with that ID.', 'sheets-to-wp-table-live-sync' ) );
			}
			return $post;
		}

		$query = [
			'post_type'        => $types,
			'post_status'      => [ 'publish', 'draft', 'pending', 'private', 'future' ],
			'posts_per_page'   => 6,
			'no_found_rows'    => true,
			'suppress_filters' => true,
		];

		if ( isset( $ref['slug'] ) ) {
			$query['name'] = sanitize_title( (string) $ref['slug'] );
		} elseif ( isset( $ref['title'] ) ) {
			$query['title'] = (string) $ref['title'];
		} else {
			return new WP_Error( 'post_not_found', __( 'Give the page or post ID, slug or title.', 'sheets-to-wp-table-live-sync' ) );
		}

		$posts = array_values(
			array_filter(
				get_posts( $query ),
				function ( $post ) {
					return current_user_can( 'edit_post', $post->ID );
				}
			)
		);

		if ( 1 === count( $posts ) ) {
			return $posts[0];
		}

		if ( ! $posts ) {
			return new WP_Error(
				'post_not_found',
				__( 'No page or post you can edit matches that.', 'sheets-to-wp-table-live-sync' ),
				[ 'hint' => __( 'Use flextable-find-content to search, or give the ID.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		return new WP_Error(
			'destination_ambiguous',
			__( 'Several pages or posts match. Ask the user which one, then use its ID.', 'sheets-to-wp-table-live-sync' ),
			[ 'details' => [ 'candidates' => array_map( [ __CLASS__, 'describe' ], $posts ) ] ]
		);
	}

	/**
	 * Searches pages and posts.
	 *
	 * @param array $args {query, post_type, status, limit}.
	 * @return array
	 */
	public static function search( array $args ) {
		$types  = isset( $args['post_type'] ) && 'any' !== $args['post_type'] ? [ $args['post_type'] ] : self::POST_TYPES;
		$status = isset( $args['status'] ) && 'any' !== $args['status'] ? [ $args['status'] ] : [ 'publish', 'draft', 'pending', 'private', 'future' ];

		$query = [
			'post_type'        => $types,
			'post_status'      => $status,
			'posts_per_page'   => isset( $args['limit'] ) ? max( 1, min( 25, (int) $args['limit'] ) ) : 10,
			'no_found_rows'    => true,
			'suppress_filters' => true,
			'orderby'          => 'modified',
		];

		if ( ! empty( $args['query'] ) ) {
			$query['s'] = (string) $args['query'];
		}

		$out = [];
		foreach ( get_posts( $query ) as $post ) {
			if ( current_user_can( 'edit_post', $post->ID ) || ( 'publish' === $post->post_status && '' === $post->post_password ) ) {
				$out[] = self::describe( $post );
			}
		}

		return $out;
	}

	/**
	 * Describes a post for tool results.
	 *
	 * @param WP_Post $post Post.
	 * @return array
	 */
	public static function describe( WP_Post $post ) {
		$type   = get_post_type_object( $post->post_type );
		$embeds = self::embeds_in( $post->post_content );

		$out = [
			'id'                    => $post->ID,
			'type'                  => $post->post_type,
			'title'                 => get_the_title( $post ),
			'slug'                  => $post->post_name,
			'status'                => $post->post_status,
			'visibility'            => '' !== $post->post_password ? 'password' : ( 'private' === $post->post_status ? 'private' : 'public' ),
			'permalink'             => 'publish' === $post->post_status ? get_permalink( $post ) : null,
			'edit_url'              => self::edit_url( $post->ID ),
			'preview_url'           => 'publish' === $post->post_status ? null : get_preview_post_link( $post ),
			'can_edit'              => current_user_can( 'edit_post', $post->ID ),
			'can_publish'           => $type && current_user_can( $type->cap->publish_posts ),
			'editor'                => self::editor_of( $post ),
			'locked_by_other_user'  => self::is_locked( $post->ID ),
			'modified'              => $post->post_modified_gmt,
		];

		foreach ( self::kinds() as $def ) {
			$out[ $def['plural'] . '_embedded' ] = isset( $embeds[ $def['plural'] ] ) ? $embeds[ $def['plural'] ] : [];
		}

		return $out;
	}

	/**
	 * IDs of the embeddable items referenced in content.
	 *
	 * @param string $content Post content.
	 * @return array plural => int[] (e.g. {tables: [12]})
	 */
	public static function embeds_in( $content ) {
		$tables = [];

		if ( preg_match_all( self::TABLE_RE, (string) $content, $m ) ) {
			$tables = array_map( 'intval', $m[1] );
		}
		if ( preg_match_all( self::BLOCK_RE, (string) $content, $b ) ) {
			foreach ( $b[1] as $json ) {
				$attrs = json_decode( $json, true );
				if ( isset( $attrs['sortcode_id'] ) ) {
					$tables[] = (int) $attrs['sortcode_id'];
				}
			}
		}
		$out = [ 'tables' => array_values( array_unique( $tables ) ) ];

		foreach ( self::kinds() as $kind => $def ) {
			if ( 'table' === $kind ) {
				continue;
			}
			$ids = [];
			if ( preg_match_all( self::shortcode_re( $def['tag'] ), (string) $content, $m ) ) {
				$ids = array_map( 'intval', $m[1] );
			}
			$out[ $def['plural'] ] = array_values( array_unique( $ids ) );
		}

		return $out;
	}

	/**
	 * Where embeddable items are placed (pages/posts, any status).
	 *
	 * @return array plural => {id => post[]}
	 */
	public static function placements() {
		if ( null !== self::$placements ) {
			return self::$placements;
		}

		global $wpdb;

		$rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			"SELECT ID, post_title, post_status, post_type, post_content FROM {$wpdb->posts}
			WHERE post_type IN ('page','post') AND post_status IN ('publish','draft','pending','private','future')
			AND ( post_content LIKE '%gswpts%' OR post_content LIKE '%google-sheets-to-wp-tables%' )
			LIMIT 2000"
		);

		$out = [];
		foreach ( self::kinds() as $def ) {
			$out[ $def['plural'] ] = [];
		}

		foreach ( (array) $rows as $row ) {
			$embeds = self::embeds_in( $row->post_content );
			$brief  = [
				'post_id' => (int) $row->ID,
				'title'   => $row->post_title,
				'type'    => $row->post_type,
				'status'  => $row->post_status,
			];
			foreach ( $embeds as $plural => $ids ) {
				foreach ( $ids as $id ) {
					$out[ $plural ][ $id ][] = $brief;
				}
			}
		}

		self::$placements = $out;
		return $out;
	}

	/**
	 * Placements of one table.
	 *
	 * @param int $table_id Table ID.
	 * @return array
	 */
	public static function placements_of_table( $table_id ) {
		return self::placements_of( 'table', $table_id );
	}

	/**
	 * Placements of one embeddable item.
	 *
	 * @param string $kind Kind (table, or one added by an extension).
	 * @param int    $id   Item ID.
	 * @return array
	 */
	public static function placements_of( $kind, $id ) {
		$kinds = self::kinds();
		if ( ! isset( $kinds[ $kind ] ) ) {
			return [];
		}
		$plural = $kinds[ $kind ]['plural'];
		$all    = self::placements();
		return isset( $all[ $plural ][ (int) $id ] ) ? $all[ $plural ][ (int) $id ] : [];
	}

	/**
	 * Shortcode regex for a tag.
	 *
	 * @param string $tag Shortcode tag.
	 * @return string
	 */
	private static function shortcode_re( $tag ) {
		return '/\[' . preg_quote( $tag, '/' ) . '\s+id\s*=\s*["\']?\s*(\d+)\s*["\']?\s*\]/i';
	}

	/**
	 * Whether any placement is visible to the public (published or scheduled).
	 *
	 * @param array $placements Placements.
	 * @return bool
	 */
	public static function has_live_placement( array $placements ) {
		foreach ( $placements as $placement ) {
			if ( in_array( $placement['status'], [ 'publish', 'private', 'future' ], true ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Forgets cached placements (after writing content).
	 *
	 * @return void
	 */
	public static function flush_placements() {
		self::$placements = null;
	}

	/**
	 * Which editor/builder owns the content.
	 *
	 * @param WP_Post $post Post.
	 * @return string block|classic|elementor|divi|beaver
	 */
	public static function editor_of( WP_Post $post ) {
		if ( 'builder' === get_post_meta( $post->ID, '_elementor_edit_mode', true ) ) {
			return 'elementor';
		}
		if ( 'on' === get_post_meta( $post->ID, '_et_pb_use_builder', true ) ) {
			return 'divi';
		}
		if ( get_post_meta( $post->ID, '_fl_builder_enabled', true ) ) {
			return 'beaver';
		}
		return has_blocks( $post->post_content ) || ( '' === trim( $post->post_content ) && use_block_editor_for_post( $post ) ) ? 'block' : 'classic';
	}

	/**
	 * Whether another user is editing the post right now.
	 *
	 * @param int $post_id Post ID.
	 * @return bool
	 */
	public static function is_locked( $post_id ) {
		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once ABSPATH . 'wp-admin/includes/post.php';
		}
		return (bool) wp_check_post_lock( $post_id );
	}

	/**
	 * Raw edit URL.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	public static function edit_url( $post_id ) {
		return admin_url( 'post.php?post=' . (int) $post_id . '&action=edit' );
	}

	/**
	 * Version fingerprint of a post (for confirmations).
	 *
	 * @param WP_Post|null $post Post.
	 * @return string
	 */
	public static function version( $post ) {
		if ( ! $post ) {
			return 'new';
		}
		return md5( $post->post_modified_gmt . '|' . $post->post_status . '|' . md5( $post->post_content ) . '|' . $post->post_password );
	}

	/**
	 * Whether a post is visible to visitors.
	 *
	 * @param WP_Post $post Post.
	 * @return bool
	 */
	public static function is_live( WP_Post $post ) {
		return in_array( $post->post_status, [ 'publish', 'private', 'future' ], true );
	}

	/**
	 * Checks the publishing policy for a change.
	 *
	 * @param bool $touches_live Whether the change affects visible content
	 *                           or a non-draft status.
	 * @return true|WP_Error
	 */
	public static function check_policy( $touches_live ) {
		$policy = Settings::get( 'publishing' );

		if ( 'off' === $policy ) {
			return new WP_Error(
				'policy_disabled',
				__( 'Changing pages and posts through MCP is turned off on this site.', 'sheets-to-wp-table-live-sync' ),
				[ 'hint' => __( 'An administrator can change this in FlexTable → Settings → MCP → Policies.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		if ( $touches_live && 'confirm' !== $policy ) {
			return new WP_Error(
				'policy_drafts_only',
				__( 'This site only allows MCP to work on drafts. Published, private and scheduled content can’t be changed through MCP.', 'sheets-to-wp-table-live-sync' ),
				[ 'hint' => __( 'Save the change as a draft, or ask an administrator to allow publishing with confirmation in FlexTable → Settings → MCP → Policies.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		return true;
	}

	/**
	 * Refuses content managed by page builders or locked by another user.
	 *
	 * @param WP_Post $post Post.
	 * @return true|WP_Error
	 */
	public static function check_editable( WP_Post $post ) {
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			return new WP_Error( 'forbidden', __( 'You are not allowed to edit this page or post.', 'sheets-to-wp-table-live-sync' ) );
		}

		$editor = self::editor_of( $post );
		if ( in_array( $editor, [ 'elementor', 'divi', 'beaver' ], true ) ) {
			return new WP_Error(
				'builder_unsupported',
				/* translators: %s: page builder. */
				sprintf( __( 'This page is built with %s. MCP does not edit page-builder layouts.', 'sheets-to-wp-table-live-sync' ), ucfirst( $editor ) ),
				[ 'hint' => __( 'Add the table in the builder with the FlexTable widget/module or a shortcode element, using the shortcode from the table result.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		if ( self::is_locked( $post->ID ) ) {
			return new WP_Error( 'post_locked', __( 'Someone is editing this page right now. Try again later.', 'sheets-to-wp-table-live-sync' ) );
		}

		return true;
	}

	/**
	 * Builds the markup for a shortcode in the right editor format.
	 *
	 * @param string $shortcode Shortcode.
	 * @param bool   $blocks    Block content.
	 * @return string
	 */
	public static function markup( $shortcode, $blocks ) {
		return $blocks
			? "<!-- wp:shortcode -->\n" . $shortcode . "\n<!-- /wp:shortcode -->"
			: $shortcode;
	}

	/**
	 * Inserts markup into content.
	 *
	 * @param string $content  Content.
	 * @param string $markup   Markup.
	 * @param bool   $blocks   Block content.
	 * @param array  $position {where: end|start|after_heading, heading_text}.
	 * @return string|WP_Error
	 */
	public static function insert( $content, $markup, $blocks, array $position ) {
		$where = isset( $position['where'] ) ? $position['where'] : 'end';

		if ( 'start' === $where ) {
			return '' === trim( $content ) ? $markup : $markup . "\n\n" . $content;
		}

		if ( 'after_heading' === $where ) {
			$heading = isset( $position['heading_text'] ) ? strtolower( trim( (string) $position['heading_text'] ) ) : '';
			if ( '' === $heading ) {
				return new WP_Error( 'heading_not_found', __( 'Give the heading text to insert after.', 'sheets-to-wp-table-live-sync' ) );
			}

			if ( $blocks ) {
				$parsed = parse_blocks( $content );
				$out    = [];
				$done   = false;

				foreach ( $parsed as $block ) {
					$out[] = $block;
					if ( ! $done && 'core/heading' === $block['blockName'] && false !== strpos( strtolower( wp_strip_all_tags( $block['innerHTML'] ) ), $heading ) ) {
						$out[] = [
							'blockName'    => 'core/shortcode',
							'attrs'        => [],
							'innerBlocks'  => [],
							'innerHTML'    => "\n" . self::shortcode_of( $markup ) . "\n",
							'innerContent' => [ "\n" . self::shortcode_of( $markup ) . "\n" ],
						];
						$done  = true;
					}
				}

				if ( ! $done ) {
					return new WP_Error( 'heading_not_found', __( 'No heading with that text was found.', 'sheets-to-wp-table-live-sync' ) );
				}

				return serialize_blocks( $out );
			}

			if ( preg_match_all( '#<h([1-6])[^>]*>(.*?)</h\1>#is', $content, $m, PREG_OFFSET_CAPTURE ) ) {
				foreach ( $m[2] as $i => $text ) {
					if ( false !== strpos( strtolower( wp_strip_all_tags( $text[0] ) ), $heading ) ) {
						$end = $m[0][ $i ][1] + strlen( $m[0][ $i ][0] );
						return substr( $content, 0, $end ) . "\n\n" . $markup . "\n\n" . substr( $content, $end );
					}
				}
			}

			return new WP_Error( 'heading_not_found', __( 'No heading with that text was found.', 'sheets-to-wp-table-live-sync' ) );
		}

		return '' === trim( $content ) ? $markup : rtrim( $content ) . "\n\n" . $markup;
	}

	/**
	 * Removes an item's placement from content.
	 *
	 * @param string $content Content.
	 * @param string $kind    table, or a kind added by an extension.
	 * @param int    $id      ID.
	 * @return array {content, removed}
	 */
	public static function remove( $content, $kind, $id ) {
		$kinds   = self::kinds();
		$tag     = isset( $kinds[ $kind ] ) ? $kinds[ $kind ]['tag'] : 'gswpts_table';
		$pattern = '\[' . $tag . '\s+id\s*=\s*["\']?\s*' . (int) $id . '\s*["\']?\s*\]';
		$removed = 0;

		// Shortcode blocks containing only this shortcode.
		$content = preg_replace( '#<!--\s*wp:shortcode\s*-->\s*' . $pattern . '\s*<!--\s*/wp:shortcode\s*-->\s*#i', '', $content, -1, $count );
		$removed += (int) $count;

		if ( 'table' === $kind ) {
			// FlexTable blocks for this table.
			$content = preg_replace_callback(
				'#<!--\s*wp:swptls/google-sheets-to-wp-tables\s+(\{.*?\})\s*(/-->|-->.*?<!--\s*/wp:swptls/google-sheets-to-wp-tables\s*-->)\s*#s',
				function ( $match ) use ( $id, &$removed ) {
					$attrs = json_decode( $match[1], true );
					if ( isset( $attrs['sortcode_id'] ) && (int) $attrs['sortcode_id'] === (int) $id ) {
						$removed++;
						return '';
					}
					return $match[0];
				},
				$content
			);
		}

		// Remaining bare shortcodes.
		$content = preg_replace( '#' . $pattern . '#i', '', $content, -1, $count );
		$removed += (int) $count;

		return [
			'content' => trim( $content ),
			'removed' => $removed,
		];
	}

	/**
	 * Shortcode text from markup.
	 *
	 * @param string $markup Markup.
	 * @return string
	 */
	private static function shortcode_of( $markup ) {
		return trim( preg_replace( '#<!--.*?-->#s', '', $markup ) );
	}

	/**
	 * Saves post content with a snapshot.
	 *
	 * @param WP_Post $post    Post.
	 * @param array   $changes Post fields to update.
	 * @return int|WP_Error Snapshot ID.
	 */
	public static function update_post( WP_Post $post, array $changes ) {
		$snapshot = SnapshotStore::save(
			'post',
			$post->ID,
			[
				'post_content'  => $post->post_content,
				'post_status'   => $post->post_status,
				'post_password' => $post->post_password,
				'post_date_gmt' => $post->post_date_gmt,
			]
		);

		$changes['ID'] = $post->ID;
		$result        = wp_update_post( wp_slash( $changes ), true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		self::flush_placements();
		clean_post_cache( $post->ID );
		SnapshotStore::set_after( $snapshot, self::version( get_post( $post->ID ) ) );

		return $snapshot;
	}
}
