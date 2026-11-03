<?php
/**
 * Tool T21: flextable/set-content-status.
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
 * Changes the status or visibility of a page or post.
 *
 * @since 3.26.0
 */
class SetContentStatus extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/set-content-status';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'Publish or change page/post visibility', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Sets a page or post to draft, pending review, published (public), private, or scheduled (future, with publish_at), and can set or remove a password. Always two steps: dry_run=true (default) shows the change and returns a confirmation_token; apply only after the user explicitly agrees. Respects WordPress permissions and the site publishing policy (by default MCP may not publish).';
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
		return [
			'type'                 => 'object',
			'properties'           => [
				'post'               => [
					'type'       => [ 'integer', 'object' ],
					'minimum'    => 1,
					'properties' => [
						'id'    => [ 'type' => 'integer' ],
						'slug'  => [ 'type' => 'string' ],
						'title' => [ 'type' => 'string' ],
					],
				],
				'status'             => [
					'type' => 'string',
					'enum' => [ 'draft', 'pending', 'publish', 'private', 'future' ],
				],
				'publish_at'         => [
					'type'        => 'string',
					'maxLength'   => 40,
					'description' => 'Required for future: ISO 8601 date-time, e.g. 2026-11-01T09:00:00+06:00.',
				],
				'password'           => [
					'type'        => [ 'string', 'null' ],
					'maxLength'   => 100,
					'description' => 'Set a password (published content becomes password-protected), or null to remove it.',
				],
				'dry_run'            => self::dry_run_schema( true ),
				'confirmation_token' => self::confirmation_schema(),
			],
			'required'             => [ 'post', 'status' ],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$post = ContentService::resolve( $input['post'] );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$editable = ContentService::check_editable( $post );
		if ( is_wp_error( $editable ) ) {
			return $editable;
		}

		$status   = $input['status'];
		$type_obj = get_post_type_object( $post->post_type );

		if ( in_array( $status, [ 'publish', 'private', 'future' ], true ) && ! current_user_can( $type_obj->cap->publish_posts ) ) {
			return new WP_Error( 'forbidden', __( 'You are not allowed to publish this kind of content.', 'sheets-to-wp-table-live-sync' ) );
		}

		$changes = [ 'post_status' => $status ];

		if ( 'future' === $status ) {
			$time = empty( $input['publish_at'] ) ? false : strtotime( (string) $input['publish_at'] );
			if ( ! $time || $time <= time() ) {
				return new WP_Error( 'invalid_arguments', __( 'Scheduling needs publish_at in the future.', 'sheets-to-wp-table-live-sync' ) );
			}
			$changes['post_date_gmt'] = gmdate( 'Y-m-d H:i:s', $time );
			$changes['post_date']     = get_date_from_gmt( $changes['post_date_gmt'] );
			$changes['edit_date']     = true;
		}

		if ( 'publish' === $status && strtotime( $post->post_date_gmt . ' UTC' ) > time() ) {
			$changes['post_date_gmt'] = current_time( 'mysql', true );
			$changes['post_date']     = current_time( 'mysql' );
			$changes['edit_date']     = true;
		}

		$password_change = array_key_exists( 'password', $input );
		if ( $password_change ) {
			$changes['post_password'] = null === $input['password'] ? '' : sanitize_text_field( $input['password'] );
		}

		$touches_live = ContentService::is_live( $post ) || in_array( $status, [ 'publish', 'private', 'future' ], true );
		$policy       = ContentService::check_policy( $touches_live );
		if ( is_wp_error( $policy ) ) {
			return $policy;
		}

		$result = [
			'post'     => [
				'id'    => $post->ID,
				'title' => get_the_title( $post ),
			],
			'previous' => [
				'status'     => $post->post_status,
				'visibility' => '' !== $post->post_password ? 'password' : ( 'private' === $post->post_status ? 'private' : 'public' ),
			],
			'next'     => [
				'status'     => $status,
				'visibility' => ( $password_change ? '' !== $changes['post_password'] : '' !== $post->post_password ) ? 'password' : ( 'private' === $status ? 'private' : 'public' ),
				'publish_at' => isset( $changes['post_date_gmt'] ) ? $changes['post_date_gmt'] . ' UTC' : null,
				'password'   => $password_change ? ( '' === $changes['post_password'] ? 'removed' : 'set' ) : 'unchanged',
			],
		];

		$versions = ContentService::version( $post );

		if ( ! empty( $input['dry_run'] ) ) {
			return self::ok(
				$result,
				[
					'dry_run'      => true,
					'confirmation' => ConfirmationService::issue( $this->name(), $input, $versions, __( 'Change who can see this page or post.', 'sheets-to-wp-table-live-sync' ) ),
				]
			);
		}

		$confirmed = ConfirmationService::consume( isset( $input['confirmation_token'] ) ? $input['confirmation_token'] : '', $this->name(), $input, $versions );
		if ( is_wp_error( $confirmed ) ) {
			return $confirmed;
		}

		$snapshot = ContentService::update_post( $post, $changes );
		if ( is_wp_error( $snapshot ) ) {
			return $snapshot;
		}

		$saved = get_post( $post->ID );

		$result['post'] = ContentService::describe( $saved );

		return self::ok(
			$result,
			[
				'snapshot_id'  => $snapshot,
				'verification' => [
					'verified' => $saved && $saved->post_status === $status,
					'checked'  => [ 'status' ],
				],
			]
		);
	}
}
