<?php
/**
 * Admin REST API used by Settings → MCP (flextable-mcp/v1/admin/*).
 *
 * Cookie authentication with the wp_rest nonce and manage_options only.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Admin;

use GSWPTS\MCP\Abilities\Registrar;
use GSWPTS\MCP\Auth\Credentials;
use GSWPTS\MCP\Environment\Edition;
use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Safety\AuditLog;
use GSWPTS\MCP\Server\Endpoint;
use GSWPTS\MCP\Server\ToolCatalog;
use GSWPTS\MCP\Settings;
use GSWPTS\MCP\Diagnostics\SelfTest;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Admin routes.
 *
 * @since 3.26.0
 */
class RestController {

	const API_VERSION = 1;

	/**
	 * Registers the routes.
	 *
	 * @return void
	 */
	public static function register() {
		$routes = [
			'/admin/status'                  => [ 'GET', 'status' ],
			'/admin/settings'                => [ 'POST', 'save_settings' ],
			'/admin/self-test'               => [ 'POST', 'self_test' ],
			'/admin/abilities'               => [ 'GET', 'abilities' ],
			'/admin/connect-prompts'         => [ 'GET', 'connect_prompts' ],
			'/admin/connect/generate'        => [ 'POST', 'generate' ],
			'/admin/connections'             => [ 'GET', 'connections' ],
			'/admin/connections/revoke'      => [ 'POST', 'revoke' ],
			'/admin/connections/revoke-all'  => [ 'POST', 'revoke_all' ],
			'/admin/activity'                => [ 'GET', 'activity' ],
		];

		foreach ( $routes as $route => $config ) {
			register_rest_route(
				MCP::REST_NAMESPACE,
				$route,
				[
					'methods'             => $config[0],
					'callback'            => [ __CLASS__, $config[1] ],
					'permission_callback' => [ __CLASS__, 'can_manage' ],
				]
			);
		}
	}

	/**
	 * Admins only, signed in with the browser (not an Application Password).
	 *
	 * @return bool|WP_Error
	 */
	public static function can_manage() {
		// Resolve the user first: core authenticates Application Passwords lazily.
		$logged_in = is_user_logged_in();

		if ( Credentials::current_item() || ( function_exists( 'rest_get_authenticated_app_password' ) && rest_get_authenticated_app_password() ) ) {
			return new WP_Error( 'rest_forbidden', __( 'Use the WordPress dashboard for these settings.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 403 ] );
		}
		return $logged_in && current_user_can( 'manage_options' );
	}

	/**
	 * GET status.
	 *
	 * @return WP_REST_Response
	 */
	public static function status() {
		$settings = Settings::all();
		$url      = MCP::connector_url();
		$host     = (string) wp_parse_url( $url, PHP_URL_HOST );
		$clients  = Credentials::list_for_user( get_current_user_id() );

		$last_used = 0;
		foreach ( $clients as $client ) {
			$last_used = max( $last_used, (int) $client['last_used'] );
		}

		$app_pw = wp_is_application_passwords_available();

		if ( ! $settings['enabled'] ) {
			$state = 'off';
		} elseif ( ! $app_pw ) {
			$state = 'needs_attention';
		} elseif ( $last_used && time() - $last_used < DAY_IN_SECONDS ) {
			$state = 'connected';
		} else {
			$state = 'ready';
		}

		return self::respond(
			[
				'state'                   => $state,
				'settings'                => $settings,
				'connector_url'           => $url,
				'username'                => wp_get_current_user()->user_login,
				'edition'                 => Edition::summary(),
				'mcp_version'             => MCP::VERSION,
				'app_passwords_available' => $app_pw,
				'https'                   => is_ssl() || 0 === strpos( $url, 'https://' ),
				'local_site'              => Endpoint::is_local_host( $host ),
				'scheme_mismatch'         => wp_parse_url( home_url(), PHP_URL_SCHEME ) !== wp_parse_url( site_url(), PHP_URL_SCHEME ),
				'last_used'               => $last_used ? $last_used : null,
				'expiry_choices'          => Settings::EXPIRY_CHOICES,
				'tools_count'             => $settings['enabled'] ? count( ConnectPrompts::expected_tools() ) : 0,
			]
		);
	}

	/**
	 * POST settings.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function save_settings( WP_REST_Request $request ) {
		$params = (array) $request->get_json_params();
		$saved  = Settings::update( $params );

		$revoked = 0;
		if ( empty( $saved['enabled'] ) && ! empty( $params['revoke_all'] ) ) {
			$revoked = Credentials::revoke_all( get_current_user_id() );
		}

		return self::respond(
			[
				'settings' => $saved,
				'revoked'  => $revoked,
			]
		);
	}

	/**
	 * POST self-test.
	 *
	 * @return WP_REST_Response
	 */
	public static function self_test() {
		return self::respond( SelfTest::run() );
	}

	/**
	 * GET abilities.
	 *
	 * @return WP_REST_Response
	 */
	public static function abilities() {
		$items = [];
		$total = 0;

		if ( function_exists( 'wp_get_abilities' ) ) {
			$all   = wp_get_abilities();
			$total = count( $all );

			foreach ( $all as $ability ) {
				if ( 0 !== strpos( $ability->get_name(), 'flextable/' ) ) {
					continue;
				}

				$handler      = Registrar::handler( $ability->get_name() );
				$availability = $handler ? $handler->availability() : true;
				$annotations  = $handler ? $handler->annotations() : [];

				$items[] = [
					'name'         => $ability->get_name(),
					'tool'         => ToolCatalog::tool_name( $ability->get_name() ),
					'label'        => $ability->get_label(),
					'description'  => $ability->get_description(),
					'category'     => $ability->get_category(),
					'edition'      => $handler ? $handler->edition() : 'free',
					'annotations'  => $annotations,
					'show_in_rest' => (bool) $ability->get_meta_item( 'show_in_rest', false ),
					'available'    => true === $availability,
					'reason'       => true === $availability ? '' : $availability->get_error_code(),
					'can_run'      => true === $ability->check_permissions( [] ),
					'input_schema' => ToolCatalog::export_schema( $ability->get_input_schema() ),
				];
			}
		}

		return self::respond(
			[
				'enabled'    => Settings::is_enabled(),
				'abilities'  => $items,
				'flextable'  => count( $items ),
				'total'      => $total,
				'rest_index' => rest_url( 'wp-abilities/v1/abilities?category=' . MCP::CATEGORY ),
			]
		);
	}

	/**
	 * GET connect-prompts (templates without secrets).
	 *
	 * @return WP_REST_Response
	 */
	public static function connect_prompts() {
		$username = wp_get_current_user()->user_login;
		$tabs     = [];

		foreach ( ConnectPrompts::clients() as $key => $info ) {
			$tabs[] = [
				'client'   => $key,
				'label'    => $info[0],
				'summary'  => $info[1],
				'template' => ConnectPrompts::build( $key, $username ),
			];
		}

		return self::respond(
			[
				'tabs'        => $tabs,
				'username'    => $username,
				'verified_on' => ConnectPrompts::VERIFIED_ON,
			]
		);
	}

	/**
	 * POST connect/generate: creates an MCP-only credential and returns the
	 * prompt that contains it. The plain password is not stored anywhere.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function generate( WP_REST_Request $request ) {
		if ( ! Settings::is_enabled() ) {
			return new WP_Error( 'mcp_disabled', __( 'Turn on MCP first.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 400 ] );
		}

		$params = (array) $request->get_json_params();

		if ( empty( $params['acknowledged'] ) ) {
			return new WP_Error( 'acknowledgement_required', __( 'Confirm that you understand the credential acts as you.', 'sheets-to-wp-table-live-sync' ), [ 'status' => 400 ] );
		}

		$client = isset( $params['client'] ) ? sanitize_key( $params['client'] ) : 'other';
		$expiry = isset( $params['expiry_days'] ) ? (int) $params['expiry_days'] : (int) Settings::get( 'expiry_days' );
		if ( ! in_array( $expiry, Settings::EXPIRY_CHOICES, true ) ) {
			$expiry = 90;
		}

		$user    = wp_get_current_user();
		$created = Credentials::generate( $user->ID, $client, $expiry );

		if ( is_wp_error( $created ) ) {
			$created->add_data( [ 'status' => 400 ] );
			return $created;
		}

		$header     = 'Basic ' . base64_encode( $user->user_login . ':' . $created['password'] ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
		$public_url = isset( $params['public_url'] ) ? esc_url_raw( (string) $params['public_url'] ) : '';

		return self::respond(
			[
				'client'  => $client,
				'name'    => $created['name'],
				'uuid'    => $created['uuid'],
				'expires' => $created['expires'] ? $created['expires'] : null,
				'header'  => $header,
				'prompt'  => ConnectPrompts::build( $client, $user->user_login, $header, $created['expires'], $public_url ),
			]
		);
	}

	/**
	 * GET connections.
	 *
	 * @return WP_REST_Response
	 */
	public static function connections() {
		return self::respond(
			[
				'connections' => Credentials::list_for_user( get_current_user_id() ),
				'profile_url' => admin_url( 'profile.php#application-passwords-section' ),
			]
		);
	}

	/**
	 * POST connections/revoke.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function revoke( WP_REST_Request $request ) {
		$params = (array) $request->get_json_params();
		$uuid   = isset( $params['uuid'] ) ? sanitize_text_field( $params['uuid'] ) : '';
		$result = Credentials::revoke( get_current_user_id(), $uuid );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return self::respond(
			[
				'revoked'     => true,
				'connections' => Credentials::list_for_user( get_current_user_id() ),
			]
		);
	}

	/**
	 * POST connections/revoke-all.
	 *
	 * @return WP_REST_Response
	 */
	public static function revoke_all() {
		$count = Credentials::revoke_all( get_current_user_id() );

		return self::respond(
			[
				'revoked'     => $count,
				'connections' => [],
			]
		);
	}

	/**
	 * GET activity.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function activity( WP_REST_Request $request ) {
		$rows = AuditLog::recent( [ 'limit' => min( 100, max( 1, (int) $request->get_param( 'limit' ) ? (int) $request->get_param( 'limit' ) : 50 ) ) ] );

		$items = [];
		foreach ( $rows as $row ) {
			$user    = get_userdata( (int) $row['user_id'] );
			$items[] = [
				'id'       => (int) $row['id'],
				'time'     => $row['created_at'],
				'user'     => $user ? $user->display_name : '',
				'client'   => $row['client_name'],
				'tool'     => str_replace( '/', '-', $row['tool'] ),
				'result'   => $row['result_code'],
				'dry_run'  => (bool) $row['dry_run'],
				'duration' => (int) $row['duration_ms'],
			];
		}

		return self::respond( [ 'activity' => $items ] );
	}

	/**
	 * Response with the API version and no-store caching.
	 *
	 * @param array $data Data.
	 * @return WP_REST_Response
	 */
	private static function respond( array $data ) {
		$response = new WP_REST_Response( array_merge( [ 'api_version' => self::API_VERSION ], $data ) );
		$response->header( 'Cache-Control', 'no-store, private' );
		return $response;
	}
}
