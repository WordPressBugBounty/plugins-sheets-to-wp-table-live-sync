<?php
/**
 * MCP (Model Context Protocol) module bootstrap.
 *
 * MCP is off by default. While it is off the module only registers the admin
 * REST routes used by the Settings → MCP tab, the MCP route (which answers
 * `mcp_disabled`) and the credential scope hook, so FlexTable behaves exactly
 * as before.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP;

defined( 'ABSPATH' ) || exit;

/**
 * Wires the MCP module into WordPress.
 *
 * @since 3.26.0
 */
class MCP {

	/**
	 * Module version (also reported as the MCP server version).
	 */
	const VERSION = '1.0.0';

	/**
	 * Fixed Application Password app_id used to tag FlexTable MCP credentials.
	 */
	const APP_ID = '7c1f5e9a-3b2d-4a6e-9f08-2d4c6b8e1a57';

	/**
	 * REST namespace shared by the MCP endpoint and the admin API.
	 */
	const REST_NAMESPACE = 'flextable-mcp/v1';

	/**
	 * Ability category slug.
	 */
	const CATEGORY = 'flextable';

	/**
	 * Class constructor.
	 */
	public function __construct() {
		if ( ! defined( 'FLEXTABLE_MCP_APP_ID' ) ) {
			define( 'FLEXTABLE_MCP_APP_ID', self::APP_ID );
		}

		// Credential scoping must run even while MCP is off, so a FlexTable
		// credential can never be used on any other route.
		Auth\Credentials::init();

		// Without this plugin nothing limits these credentials to the MCP route,
		// so deactivating FlexTable revokes them all.
		if ( defined( 'GSWPTS_PLUGIN_FILE' ) ) {
			register_deactivation_hook( GSWPTS_PLUGIN_FILE, [ __CLASS__, 'deactivate' ] );
		}

		add_action( 'rest_api_init', [ $this, 'register_routes' ] );

		if ( Settings::is_enabled() ) {
			add_action( 'wp_abilities_api_categories_init', [ Abilities\Registrar::class, 'register_category' ] );
			add_action( 'wp_abilities_api_init', [ Abilities\Registrar::class, 'register_abilities' ] );
		}
	}

	/**
	 * Plugin deactivation: revoke every FlexTable MCP credential.
	 *
	 * @return void
	 */
	public static function deactivate() {
		Auth\Credentials::revoke_everyone();
	}

	/**
	 * Registers the MCP endpoint and the admin API.
	 *
	 * @return void
	 */
	public function register_routes() {
		Server\Endpoint::register();
		Admin\RestController::register();
	}

	/**
	 * Returns the public connector URL.
	 *
	 * @return string
	 */
	public static function connector_url() {
		return untrailingslashit( rest_url( self::REST_NAMESPACE . '/mcp' ) );
	}
}
