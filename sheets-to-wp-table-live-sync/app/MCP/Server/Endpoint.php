<?php
/**
 * The MCP endpoint: rest_url( 'flextable-mcp/v1/mcp' ).
 *
 * Streamable HTTP, JSON responses only, stateless (no sessions, no SSE).
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Server;

use GSWPTS\MCP\Auth\Credentials;
use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Safety\RateLimiter;
use GSWPTS\MCP\Safety\RequestContext;
use GSWPTS\MCP\Settings;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the route, guards it and hands requests to the protocol layer.
 *
 * @since 3.26.0
 */
class Endpoint {

	/**
	 * Maximum accepted request body in bytes.
	 */
	const MAX_BODY_BYTES = 262144;

	/**
	 * Whether the current response must be sent with an empty body (202).
	 *
	 * @var bool
	 */
	private static $empty_body = false;

	/**
	 * Guard results for this request. Core's Allow header calls the permission
	 * callback once per registered method, so the guard (and its rate limit)
	 * must only run once. The request object is kept so its id is not reused.
	 *
	 * @var array
	 */
	private static $guard_results = [];

	/**
	 * Registers the REST route.
	 *
	 * @return void
	 */
	public static function register() {
		register_rest_route(
			MCP::REST_NAMESPACE,
			'/mcp',
			[
				'methods'             => [ 'POST', 'GET', 'DELETE' ],
				'callback'            => [ __CLASS__, 'handle' ],
				'permission_callback' => [ __CLASS__, 'guard' ],
			]
		);

		add_filter( 'rest_post_dispatch', [ __CLASS__, 'add_headers' ], 10, 3 );
		add_filter( 'rest_pre_serve_request', [ __CLASS__, 'maybe_serve_empty' ], 10, 4 );
	}

	/**
	 * Transport guard. Order: enabled → method → HTTPS → Origin → size →
	 * credential → strict mode → capability → rate limit.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return true|WP_Error
	 */
	public static function guard( WP_REST_Request $request ) {
		$id = spl_object_id( $request );
		if ( isset( self::$guard_results[ $id ] ) && self::$guard_results[ $id ][0] === $request ) {
			return self::$guard_results[ $id ][1];
		}

		$result                     = self::check( $request );
		self::$guard_results[ $id ] = [ $request, $result ];

		return $result;
	}

	/**
	 * The checks behind guard().
	 *
	 * @param WP_REST_Request $request Request.
	 * @return true|WP_Error
	 */
	private static function check( WP_REST_Request $request ) {
		if ( ! Settings::is_enabled() ) {
			return new WP_Error( 'mcp_disabled', __( 'FlexTable MCP is turned off. Turn it on in FlexTable → Settings → MCP.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 404 ] );
		}

		if ( 'POST' !== $request->get_method() ) {
			return new WP_Error( 'method_not_allowed', __( 'The MCP endpoint only accepts POST (no SSE stream, no sessions).', 'sheets-to-wp-table-live-sync' ), [ 'status' => 405 ] );
		}

		if ( ! self::transport_is_secure() ) {
			return new WP_Error( 'https_required', __( 'The MCP endpoint requires HTTPS.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 403 ] );
		}

		$origin = $request->get_header( 'origin' );
		if ( $origin && ! self::origin_allowed( $origin ) ) {
			return new WP_Error( 'origin_forbidden', __( 'Requests from this Origin are not allowed.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 403 ] );
		}

		if ( strlen( (string) $request->get_body() ) > self::MAX_BODY_BYTES ) {
			return new WP_Error( 'payload_too_large', __( 'The request body is too large.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 413 ] );
		}

		// Resolve the user first: core re-checks Application Passwords lazily
		// on REST requests, after rest_authentication_errors has already run.
		$logged_in = is_user_logged_in();
		$item      = Credentials::current_item();

		if ( ! $item || ! $logged_in ) {
			$failure = Credentials::failed_authentication();

			if ( $failure && 'credential_expired' === $failure->get_error_code() ) {
				return new WP_Error( 'credential_expired', $failure->get_error_message(), [ 'status' => 401 ] );
			}

			if ( $failure || Credentials::authorization_sent() ) {
				// One answer for unknown user and wrong password (no user enumeration).
				return new WP_Error(
					'mcp_credential_invalid',
					__( 'The credential was refused: the username or Application Password is wrong, or it was revoked. Generate a new prompt in FlexTable → Settings → MCP → Connect an AI client.', 'sheets-to-wp-table-live-sync' ),
					[ 'status' => 401 ]
				);
			}

			return new WP_Error(
				'mcp_credential_missing',
				__( 'Missing credential. Send "Authorization: Basic …" with a credential generated in FlexTable → Settings → MCP → Connect an AI client.', 'sheets-to-wp-table-live-sync' ),
				[ 'status' => 401 ]
			);
		}

		if ( Settings::get( 'strict' ) && ! Credentials::is_flextable_item( $item ) ) {
			return new WP_Error(
				'credential_not_mcp',
				__( 'This Application Password is not a FlexTable MCP credential. Generate one in FlexTable → Settings → MCP, or turn off "Only accept credentials generated here".', 'sheets-to-wp-table-live-sync' ),
				[ 'status' => 401 ]
			);
		}

		if ( ! current_user_can( self::required_capability() ) ) {
			return new WP_Error( 'user_not_permitted', __( 'Your WordPress account is not allowed to manage FlexTable.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 403 ] );
		}

		RequestContext::set( 'mcp', true );
		RequestContext::set( 'credential', isset( $item['uuid'] ) ? (string) $item['uuid'] : '' );
		RequestContext::set( 'client', Credentials::current_client_label() );

		$retry = RateLimiter::hit( 'calls', RequestContext::caller_key() );
		if ( $retry > 0 ) {
			return new WP_Error( 'rate_limited', __( 'Too many requests. Try again shortly.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 429, 'retry_after' => $retry ] );
		}

		return true;
	}

	/**
	 * Route callback.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function handle( WP_REST_Request $request ) {
		$headers = [
			'mcp-protocol-version' => (string) $request->get_header( 'mcp_protocol_version' ),
			'mcp-method'           => (string) $request->get_header( 'mcp_method' ),
			'mcp-name'             => (string) $request->get_header( 'mcp_name' ),
		];

		$outcome = ( new Protocol() )->handle_raw( (string) $request->get_body(), $headers );

		if ( null === $outcome['body'] ) {
			self::$empty_body = true;
			return new WP_REST_Response( null, $outcome['status'] );
		}

		return new WP_REST_Response( $outcome['body'], $outcome['status'] );
	}

	/**
	 * Adds no-store and protocol headers to every MCP response.
	 *
	 * @param WP_REST_Response $response Response.
	 * @param mixed            $server   Server.
	 * @param WP_REST_Request  $request  Request.
	 * @return WP_REST_Response
	 */
	public static function add_headers( $response, $server, $request ) {
		if ( ! $request instanceof WP_REST_Request || ! self::is_mcp_route( $response instanceof WP_REST_Response ? $response->get_matched_route() : '', $request ) ) {
			return $response;
		}

		if ( $response instanceof WP_REST_Response ) {
			$response->header( 'Cache-Control', 'no-store, private' );
			$response->header( 'X-Content-Type-Options', 'nosniff' );

			if ( 405 === $response->get_status() ) {
				$response->header( 'Allow', 'POST' );
			}

			$data = $response->get_data();
			if ( 429 === $response->get_status() && is_array( $data ) && isset( $data['data']['retry_after'] ) ) {
				$response->header( 'Retry-After', (string) (int) $data['data']['retry_after'] );
			}
		}

		return $response;
	}

	/**
	 * Sends an empty body for accepted notifications (HTTP 202).
	 *
	 * @param bool             $served  Whether the request was served.
	 * @param WP_REST_Response $result  Response.
	 * @param WP_REST_Request  $request Request.
	 * @param mixed            $server  Server.
	 * @return bool
	 */
	public static function maybe_serve_empty( $served, $result, $request, $server ) {
		if ( self::$empty_body && $request instanceof WP_REST_Request && self::is_mcp_route( $result instanceof WP_REST_Response ? $result->get_matched_route() : '', $request ) ) {
			self::$empty_body = false;
			return true;
		}
		return $served;
	}

	/**
	 * Whether a response belongs to the MCP route (route matching ignores case).
	 *
	 * @param string          $matched Matched route pattern.
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	private static function is_mcp_route( $matched, WP_REST_Request $request ) {
		$route = '/' . MCP::REST_NAMESPACE . '/mcp';
		return $route === $matched || 0 === strcasecmp( $route, untrailingslashit( (string) $request->get_route() ) );
	}

	/**
	 * Capability required to use MCP.
	 *
	 * @return string
	 */
	public static function required_capability() {
		return (string) apply_filters( 'flextable_mcp_required_capability', 'manage_options' );
	}

	/**
	 * HTTPS is required, except on local development hosts.
	 *
	 * @return bool
	 */
	public static function transport_is_secure() {
		if ( is_ssl() ) {
			return true;
		}

		return self::is_local_environment();
	}

	/**
	 * Local environment on a local host name (core only enables Application
	 * Passwords over plain HTTP for "local").
	 *
	 * @return bool
	 */
	public static function is_local_environment() {
		if ( 'local' !== wp_get_environment_type() ) {
			return false;
		}

		return self::is_local_host( (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
	}

	/**
	 * Whether a host name is loopback, private or a dev TLD.
	 *
	 * @param string $host Host name.
	 * @return bool
	 */
	public static function is_local_host( $host ) {
		$host = strtolower( trim( $host, '[]' ) );

		if ( in_array( $host, [ 'localhost', '127.0.0.1', '::1' ], true ) ) {
			return true;
		}

		if ( preg_match( '/\.(local|test|localhost|invalid|example)$/', $host ) ) {
			return true;
		}

		if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
			return ! filter_var( $host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE );
		}

		return false;
	}

	/**
	 * Origin allowlist: the site itself plus filterable extras.
	 *
	 * @param string $origin Origin header.
	 * @return bool
	 */
	private static function origin_allowed( $origin ) {
		$origin  = strtolower( untrailingslashit( $origin ) );
		$allowed = [
			strtolower( untrailingslashit( self::origin_of( home_url() ) ) ),
			strtolower( untrailingslashit( self::origin_of( site_url() ) ) ),
		];

		$allowed = (array) apply_filters( 'flextable_mcp_allowed_origins', $allowed );

		return in_array( $origin, array_map( 'strtolower', $allowed ), true );
	}

	/**
	 * Scheme://host[:port] of a URL.
	 *
	 * @param string $url URL.
	 * @return string
	 */
	private static function origin_of( $url ) {
		$parts = wp_parse_url( $url );
		if ( empty( $parts['host'] ) ) {
			return '';
		}
		$origin = ( isset( $parts['scheme'] ) ? $parts['scheme'] : 'https' ) . '://' . $parts['host'];
		if ( ! empty( $parts['port'] ) ) {
			$origin .= ':' . $parts['port'];
		}
		return $origin;
	}
}
