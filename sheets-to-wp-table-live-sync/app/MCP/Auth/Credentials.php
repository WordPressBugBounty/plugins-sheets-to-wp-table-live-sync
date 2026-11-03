<?php
/**
 * Generated MCP-only Application Passwords.
 *
 * A FlexTable MCP credential is a core Application Password tagged with
 * FLEXTABLE_MCP_APP_ID. It is accepted only on the MCP route, expires, and is
 * listed and revocable from Settings → MCP. The plain password exists only in
 * the response of the "Generate prompt" request and is never stored.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Auth;

use GSWPTS\MCP\MCP;
use WP_Application_Passwords;
use WP_Error;
use WP_User;

defined( 'ABSPATH' ) || exit;

/**
 * Creates, scopes, expires and revokes MCP credentials.
 *
 * @since 3.26.0
 */
class Credentials {

	const META_KEY = 'flextable_mcp_credentials';

	/**
	 * Client identifiers accepted by "Generate prompt".
	 *
	 * @var array<string,string>
	 */
	const CLIENTS = [
		'claude-code'    => 'Claude Code',
		'claude-desktop' => 'Claude Desktop',
		'claude-ai'      => 'Claude.ai connector',
		'codex'          => 'Codex (ChatGPT)',
		'cursor'         => 'Cursor',
		'vscode'         => 'VS Code',
		'other'          => 'Other client',
	];

	/**
	 * The Application Password item that authenticated the current request.
	 *
	 * @var array|null
	 */
	private static $authenticated_item = null;

	/**
	 * Hooks into core Application Password authentication.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'wp_authenticate_application_password_errors', [ __CLASS__, 'enforce_scope' ], 10, 3 );
		add_action( 'application_password_did_authenticate', [ __CLASS__, 'remember_item' ], 10, 2 );
	}

	/**
	 * Rejects FlexTable credentials outside the MCP route and after expiry
	 * (while MCP is off the route itself answers 404).
	 *
	 * @param WP_Error $error Error collector.
	 * @param WP_User  $user  User being authenticated.
	 * @param array    $item  Application Password details.
	 * @return void
	 */
	public static function enforce_scope( $error, $user, $item ) {
		if ( ! self::is_flextable_item( $item ) ) {
			return;
		}

		if ( ! self::is_mcp_request() ) {
			$error->add(
				'credential_scope',
				__( 'This FlexTable MCP credential only works on the FlexTable MCP endpoint.', 'sheets-to-wp-table-live-sync' ),
				[ 'status' => 401 ]
			);
			return;
		}

		$meta    = self::get_meta( $user->ID );
		$uuid    = isset( $item['uuid'] ) ? $item['uuid'] : '';
		$expires = isset( $meta[ $uuid ]['expires'] ) ? (int) $meta[ $uuid ]['expires'] : 0;

		if ( $expires > 0 && time() >= $expires ) {
			$error->add(
				'credential_expired',
				__( 'This FlexTable MCP credential has expired. Generate a new prompt in FlexTable → Settings → MCP.', 'sheets-to-wp-table-live-sync' ),
				[ 'status' => 401 ]
			);
		}
	}

	/**
	 * Records which Application Password authenticated this request.
	 *
	 * @param WP_User $user User.
	 * @param array   $item Application Password details.
	 * @return void
	 */
	public static function remember_item( $user, $item ) {
		self::$authenticated_item = is_array( $item ) ? $item : null;
	}

	/**
	 * Application Password item used for the current request, if any.
	 *
	 * @return array|null
	 */
	public static function current_item() {
		return self::$authenticated_item;
	}

	/**
	 * The error core recorded when an Application Password was refused on
	 * this request (wrong password, unknown user, expired, out of scope), if any.
	 *
	 * @return WP_Error|null
	 */
	public static function failed_authentication() {
		global $wp_rest_application_password_status;
		return is_wp_error( $wp_rest_application_password_status ) ? $wp_rest_application_password_status : null;
	}

	/**
	 * Whether the request carried a Basic Authorization header that reached PHP.
	 *
	 * @return bool
	 */
	public static function authorization_sent() {
		if ( isset( $_SERVER['PHP_AUTH_USER'] ) ) {
			return true;
		}
		foreach ( [ 'HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION' ] as $key ) {
			if ( isset( $_SERVER[ $key ] ) && 0 === stripos( (string) $_SERVER[ $key ], 'basic ' ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
				return true;
			}
		}
		return false;
	}

	/**
	 * Whether the given item is a FlexTable MCP credential.
	 *
	 * @param array|null $item Application Password details.
	 * @return bool
	 */
	public static function is_flextable_item( $item ) {
		return is_array( $item ) && isset( $item['app_id'] ) && MCP::APP_ID === $item['app_id'];
	}

	/**
	 * Whether the current HTTP request targets the MCP endpoint.
	 *
	 * Authentication runs before REST routing, so the route is read from the
	 * request itself (pretty permalinks or ?rest_route=).
	 *
	 * @return bool
	 */
	public static function is_mcp_request() {
		if ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) {
			return false;
		}

		$route = '';

		if ( isset( $GLOBALS['wp'] ) && isset( $GLOBALS['wp']->query_vars['rest_route'] ) ) {
			$route = (string) $GLOBALS['wp']->query_vars['rest_route'];
		} elseif ( isset( $_GET['rest_route'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$route = sanitize_text_field( wp_unslash( $_GET['rest_route'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		} elseif ( isset( $_SERVER['REQUEST_URI'] ) ) {
			$path   = (string) wp_parse_url( esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH );
			$prefix = '/' . trim( rest_get_url_prefix(), '/' ) . '/';
			$pos    = strpos( $path, $prefix );
			if ( false !== $pos ) {
				$route = substr( $path, $pos + strlen( $prefix ) - 1 );
			}
		}

		$route = '/' . trim( strtolower( $route ), '/' );

		return '/' . MCP::REST_NAMESPACE . '/mcp' === $route;
	}

	/**
	 * Creates a credential for the current user and returns the plain value.
	 *
	 * @param int    $user_id     User ID.
	 * @param string $client      Client key from self::CLIENTS.
	 * @param int    $expiry_days 0 for no expiry.
	 * @return array|WP_Error {uuid, name, password, expires}
	 */
	public static function generate( $user_id, $client, $expiry_days ) {
		if ( ! wp_is_application_passwords_available() ) {
			return new WP_Error( 'application_passwords_unavailable', __( 'Application Passwords are not available on this site. They need HTTPS or a local environment.', 'sheets-to-wp-table-live-sync' ) );
		}

		$user = get_userdata( $user_id );
		if ( ! $user || ! wp_is_application_passwords_available_for_user( $user ) ) {
			return new WP_Error( 'application_passwords_unavailable_for_user', __( 'Application Passwords are not available for this user.', 'sheets-to-wp-table-live-sync' ) );
		}

		$client = isset( self::CLIENTS[ $client ] ) ? $client : 'other';
		$label  = self::CLIENTS[ $client ];
		$name   = sprintf( 'FlexTable MCP – %s – %s', $label, wp_date( 'Y-m-d H:i' ) );

		$created = WP_Application_Passwords::create_new_application_password(
			$user_id,
			[
				'name'   => $name,
				'app_id' => MCP::APP_ID,
			]
		);

		if ( is_wp_error( $created ) ) {
			return $created;
		}

		list( $password, $item ) = $created;

		$expires = $expiry_days > 0 ? time() + ( (int) $expiry_days * DAY_IN_SECONDS ) : 0;
		$meta    = self::get_meta( $user_id );

		$meta[ $item['uuid'] ] = [
			'client'  => $client,
			'expires' => $expires,
		];
		update_user_meta( $user_id, self::META_KEY, $meta );

		return [
			'uuid'     => $item['uuid'],
			'name'     => $name,
			'password' => $password,
			'expires'  => $expires,
		];
	}

	/**
	 * Lists the user's FlexTable credentials (no secrets).
	 *
	 * @param int $user_id User ID.
	 * @return array
	 */
	public static function list_for_user( $user_id ) {
		$meta  = self::get_meta( $user_id );
		$items = WP_Application_Passwords::get_user_application_passwords( $user_id );
		$out   = [];

		foreach ( $items as $item ) {
			if ( ! self::is_flextable_item( $item ) ) {
				continue;
			}

			$uuid    = $item['uuid'];
			$client  = isset( $meta[ $uuid ]['client'] ) ? $meta[ $uuid ]['client'] : 'other';
			$expires = isset( $meta[ $uuid ]['expires'] ) ? (int) $meta[ $uuid ]['expires'] : 0;

			$out[] = [
				'uuid'         => $uuid,
				'name'         => $item['name'],
				'client'       => $client,
				'client_label' => isset( self::CLIENTS[ $client ] ) ? self::CLIENTS[ $client ] : self::CLIENTS['other'],
				'created'      => (int) $item['created'],
				'expires'      => $expires,
				'expired'      => $expires > 0 && time() >= $expires,
				'last_used'    => empty( $item['last_used'] ) ? null : (int) $item['last_used'],
				'last_ip'      => empty( $item['last_ip'] ) ? null : (string) $item['last_ip'],
			];
		}

		usort(
			$out,
			function ( $a, $b ) {
				return $b['created'] - $a['created'];
			}
		);

		return $out;
	}

	/**
	 * Revokes one FlexTable credential.
	 *
	 * @param int    $user_id User ID.
	 * @param string $uuid    Credential UUID.
	 * @return true|WP_Error
	 */
	public static function revoke( $user_id, $uuid ) {
		$item = WP_Application_Passwords::get_user_application_password( $user_id, $uuid );

		if ( ! $item || ! self::is_flextable_item( $item ) ) {
			return new WP_Error( 'credential_not_found', __( 'No FlexTable MCP credential with that ID was found.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 404 ] );
		}

		$deleted = WP_Application_Passwords::delete_application_password( $user_id, $uuid );
		if ( is_wp_error( $deleted ) ) {
			return $deleted;
		}

		$meta = self::get_meta( $user_id );
		unset( $meta[ $uuid ] );
		update_user_meta( $user_id, self::META_KEY, $meta );

		return true;
	}

	/**
	 * Revokes every FlexTable credential of a user.
	 *
	 * @param int $user_id User ID.
	 * @return int Number revoked.
	 */
	public static function revoke_all( $user_id ) {
		$count = 0;
		$meta  = self::get_meta( $user_id );

		foreach ( WP_Application_Passwords::get_user_application_passwords( $user_id ) as $item ) {
			if ( self::is_flextable_item( $item ) && true === WP_Application_Passwords::delete_application_password( $user_id, $item['uuid'] ) ) {
				unset( $meta[ $item['uuid'] ] );
				$count++;
			}
		}

		// Drop records of passwords that no longer exist; keep the rest (and their expiry).
		$existing = wp_list_pluck( WP_Application_Passwords::get_user_application_passwords( $user_id ), 'uuid' );
		$meta     = array_intersect_key( $meta, array_flip( $existing ) );

		if ( $meta ) {
			update_user_meta( $user_id, self::META_KEY, $meta );
		} else {
			delete_user_meta( $user_id, self::META_KEY );
		}

		return $count;
	}

	/**
	 * Revokes FlexTable credentials of every user (deactivation, uninstall).
	 *
	 * Looks at every user with Application Passwords on the whole network,
	 * not only users with a FlexTable record.
	 *
	 * @return void
	 */
	public static function revoke_everyone() {
		$users = [];
		foreach ( [ self::META_KEY, WP_Application_Passwords::USERMETA_KEY_APPLICATION_PASSWORDS ] as $meta_key ) {
			$users = array_merge(
				$users,
				get_users(
					[
						'blog_id'  => 0,
						'meta_key' => $meta_key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
						'fields'   => 'ID',
					]
				)
			);
		}

		foreach ( array_unique( array_map( 'intval', $users ) ) as $user_id ) {
			self::revoke_all( (int) $user_id );
		}
	}

	/**
	 * Client name for the credential that authenticated this request.
	 *
	 * @return string
	 */
	public static function current_client_label() {
		$item = self::current_item();
		if ( ! $item ) {
			return '';
		}

		$meta   = self::get_meta( get_current_user_id() );
		$client = isset( $meta[ $item['uuid'] ]['client'] ) ? $meta[ $item['uuid'] ]['client'] : '';

		if ( $client && isset( self::CLIENTS[ $client ] ) ) {
			return self::CLIENTS[ $client ];
		}

		return isset( $item['name'] ) ? (string) $item['name'] : '';
	}

	/**
	 * Per-user credential metadata.
	 *
	 * @param int $user_id User ID.
	 * @return array
	 */
	private static function get_meta( $user_id ) {
		$meta = get_user_meta( $user_id, self::META_KEY, true );
		return is_array( $meta ) ? $meta : [];
	}
}
