<?php
/**
 * Connection self-test for Settings → MCP.
 *
 * Proves the server works from the inside. It cannot prove that a cloud
 * client (Claude.ai, ChatGPT) can reach the site.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Diagnostics;

use GSWPTS\MCP\Admin\ConnectPrompts;
use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Safety\RequestContext;
use GSWPTS\MCP\Server\Endpoint;
use GSWPTS\MCP\Server\Protocol;
use GSWPTS\MCP\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Runs the staged checks.
 *
 * @since 3.26.0
 */
class SelfTest {

	/**
	 * Runs every stage.
	 *
	 * @return array {ok: bool, rows: [{id,label,status,detail,remedy}]}
	 */
	public static function run() {
		$rows = [];
		$url  = MCP::connector_url();

		// ST-01 Configuration.
		$enabled = Settings::is_enabled();
		$rows[]  = self::row( 'config', __( 'MCP is turned on', 'sheets-to-wp-table-live-sync' ), $enabled ? 'pass' : 'fail', $enabled ? '' : __( 'MCP is off.', 'sheets-to-wp-table-live-sync' ), __( 'Turn on "Enable MCP" above.', 'sheets-to-wp-table-live-sync' ) );

		$app_pw = wp_is_application_passwords_available();
		$rows[] = self::row( 'app_passwords', __( 'Application Passwords are available', 'sheets-to-wp-table-live-sync' ), $app_pw ? 'pass' : 'fail', $app_pw ? '' : __( 'WordPress disables them without HTTPS (except local sites) or a security plugin turned them off.', 'sheets-to-wp-table-live-sync' ), __( 'Enable HTTPS, or allow Application Passwords in your security plugin.', 'sheets-to-wp-table-live-sync' ) );

		// ST-02 HTTPS.
		$secure = is_ssl() || 0 === strpos( $url, 'https://' );
		$local  = Endpoint::is_local_environment();
		$rows[] = self::row(
			'https',
			__( 'HTTPS', 'sheets-to-wp-table-live-sync' ),
			$secure ? 'pass' : ( $local ? 'info' : 'fail' ),
			$secure ? '' : ( $local ? __( 'Local development site: plain HTTP is allowed here. On a live site this check needs HTTPS.', 'sheets-to-wp-table-live-sync' ) : __( 'The site does not use HTTPS. AI clients require it.', 'sheets-to-wp-table-live-sync' ) ),
			__( 'Install an SSL certificate. Behind a proxy, make sure WordPress sees HTTPS (X-Forwarded-Proto).', 'sheets-to-wp-table-live-sync' )
		);

		if ( ! $enabled ) {
			return self::finish( $rows );
		}

		// ST-07/08 In-process protocol checks (as the logged-in admin; no credential is created).
		RequestContext::set( 'client', 'Self-test' );
		$protocol = new Protocol();

		$init = $protocol->handle_message(
			[
				'jsonrpc' => '2.0',
				'id'      => 1,
				'method'  => 'initialize',
				'params'  => [
					'protocolVersion' => '2025-06-18',
					'capabilities'    => new \stdClass(),
					'clientInfo'      => [
						'name'    => 'flextable-self-test',
						'version' => MCP::VERSION,
					],
				],
			]
		);
		$init_ok = isset( $init['body']['result']['serverInfo']['name'] ) && 'flextable' === $init['body']['result']['serverInfo']['name'];
		$rows[]  = self::row( 'initialize', __( 'MCP initialize (2025-06-18)', 'sheets-to-wp-table-live-sync' ), $init_ok ? 'pass' : 'fail', $init_ok ? 'protocolVersion ' . $init['body']['result']['protocolVersion'] : wp_json_encode( $init['body'] ), '' );

		$discover = $protocol->handle_message(
			[
				'jsonrpc' => '2.0',
				'id'      => 2,
				'method'  => 'server/discover',
				'params'  => [
					'_meta' => [
						Protocol::META_VERSION      => '2026-07-28',
						Protocol::META_CAPABILITIES => new \stdClass(),
					],
				],
			]
		);
		$discover_ok = isset( $discover['body']['result']['supportedVersions'] );
		$rows[]      = self::row( 'discover', __( 'MCP server/discover (2026-07-28)', 'sheets-to-wp-table-live-sync' ), $discover_ok ? 'pass' : 'fail', $discover_ok ? implode( ', ', $discover['body']['result']['supportedVersions'] ) : wp_json_encode( $discover['body'] ), '' );

		$list     = $protocol->handle_message(
			[
				'jsonrpc' => '2.0',
				'id'      => 3,
				'method'  => 'tools/list',
			]
		);
		$tools    = isset( $list['body']['result']['tools'] ) ? $list['body']['result']['tools'] : [];
		$expected = ConnectPrompts::expected_tools();
		$names    = wp_list_pluck( $tools, 'name' );
		sort( $names );
		$list_ok = $names === $expected && count( $names ) > 0;
		$rows[]  = self::row(
			'tools_list',
			__( 'Tool discovery (tools/list)', 'sheets-to-wp-table-live-sync' ),
			$list_ok ? 'pass' : 'fail',
			/* translators: %d: number of tools. */
			sprintf( _n( '%d tool available for this site.', '%d tools available for this site.', count( $names ), 'sheets-to-wp-table-live-sync' ), count( $names ) ),
			__( 'If no tools are listed, reload this page after enabling MCP.', 'sheets-to-wp-table-live-sync' )
		);

		$before = self::checksum();
		$call   = $protocol->handle_message(
			[
				'jsonrpc' => '2.0',
				'id'      => 4,
				'method'  => 'tools/call',
				'params'  => [
					'name'      => 'flextable-get-status',
					'arguments' => new \stdClass(),
				],
			]
		);
		$call_ok = isset( $call['body']['result']['isError'] ) && false === $call['body']['result']['isError'];
		$rows[]  = self::row( 'tool_call', __( 'Read-only tool call (flextable-get-status)', 'sheets-to-wp-table-live-sync' ), $call_ok ? 'pass' : 'fail', $call_ok ? '' : wp_json_encode( isset( $call['body'] ) ? $call['body'] : [] ), '' );

		// Loopback HTTP checks.
		$loopback = self::post( $url, [] );
		if ( is_wp_error( $loopback ) ) {
			$rows[] = self::row( 'reachable', __( 'Endpoint reachable over HTTP', 'sheets-to-wp-table-live-sync' ), 'warn', $loopback->get_error_message(), __( 'Your server cannot call itself (loopback). This does not always mean clients cannot connect; test with a client.', 'sheets-to-wp-table-live-sync' ) );
		} else {
			$code       = (int) wp_remote_retrieve_response_code( $loopback );
			$body       = json_decode( wp_remote_retrieve_body( $loopback ), true );
			$error_code = is_array( $body ) && isset( $body['code'] ) ? $body['code'] : '';
			$json       = is_array( $body );

			$reachable = 401 === $code && $json && 'mcp_credential_missing' === $error_code;

			$rows[] = self::row(
				'reachable',
				__( 'Endpoint reachable and rejects requests without a credential', 'sheets-to-wp-table-live-sync' ),
				$reachable ? 'pass' : 'fail',
				/* translators: 1: HTTP status, 2: error code. */
				sprintf( __( 'HTTP %1$d %2$s', 'sheets-to-wp-table-live-sync' ), $code, $error_code ),
				404 === $code ? __( 'The REST route is missing: check permalinks or a security plugin that blocks /wp-json.', 'sheets-to-wp-table-live-sync' ) : __( 'A firewall, cache or security plugin may be changing the response.', 'sheets-to-wp-table-live-sync' )
			);

			if ( ! $reachable ) {
				foreach ( [
					'auth_header' => __( 'Authorization header reaches WordPress', 'sheets-to-wp-table-live-sync' ),
					'get_405'     => __( 'GET is refused (no SSE stream)', 'sheets-to-wp-table-live-sync' ),
					'origin'      => __( 'Requests from foreign websites (Origin) are refused', 'sheets-to-wp-table-live-sync' ),
				] as $id => $label ) {
					$rows[] = self::row( $id, $label, 'warn', __( 'Skipped: the endpoint is not reachable over HTTP.', 'sheets-to-wp-table-live-sync' ), __( 'Fix the reachability check first.', 'sheets-to-wp-table-live-sync' ) );
				}

				$after  = self::checksum();
				$rows[] = self::row( 'no_side_effects', __( 'The test changed no tables or posts', 'sheets-to-wp-table-live-sync' ), $before === $after ? 'pass' : 'fail', '', '' );

				return self::finish( array_merge( $rows, [ self::public_row( $url ) ] ) );
			}

			$bogus      = self::post( $url, [ 'Authorization' => 'Basic ' . base64_encode( 'flextable-self-test-nobody:not-a-real-password' ) ] ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
			$bogus_body = is_wp_error( $bogus ) ? [] : json_decode( wp_remote_retrieve_body( $bogus ), true );
			$bogus_code = is_array( $bogus_body ) && isset( $bogus_body['code'] ) ? $bogus_body['code'] : '';
			$bogus_http = is_wp_error( $bogus ) ? 0 : (int) wp_remote_retrieve_response_code( $bogus );
			// A fake Basic credential must be refused as invalid (mcp_credential_invalid);
			// "mcp_credential_missing" means the header never reached PHP.
			$passed = 401 === $bogus_http && '' !== $bogus_code && 'mcp_credential_missing' !== $bogus_code;
			$rows[] = self::row(
				'auth_header',
				__( 'Authorization header reaches WordPress', 'sheets-to-wp-table-live-sync' ),
				$passed ? 'pass' : 'fail',
				$passed
					/* translators: %s: error code. */
					? sprintf( __( 'A fake credential was received and refused (%s).', 'sheets-to-wp-table-live-sync' ), $bogus_code )
					/* translators: 1: HTTP status, 2: error code. */
					: sprintf( __( 'HTTP %1$d %2$s: the header did not reach PHP.', 'sheets-to-wp-table-live-sync' ), $bogus_http, $bogus_code ),
				__( 'Your server removes the Authorization header. Apache: add to .htaccess: SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1. Nginx: add fastcgi_param HTTP_AUTHORIZATION $http_authorization; to the PHP location.', 'sheets-to-wp-table-live-sync' )
			);

			$get      = wp_remote_get(
				$url,
				[
					'timeout'     => 10,
					'redirection' => 0,
					'sslverify'   => apply_filters( 'https_local_ssl_verify', false ),
				]
			);
			$get_code = is_wp_error( $get ) ? 0 : (int) wp_remote_retrieve_response_code( $get );
			$rows[]   = self::row( 'get_405', __( 'GET is refused (no SSE stream)', 'sheets-to-wp-table-live-sync' ), 405 === $get_code || 401 === $get_code ? 'pass' : 'warn', 'HTTP ' . $get_code, '' );

			$origin      = self::post( $url, [ 'Origin' => 'https://evil.example' ] );
			$origin_code = is_wp_error( $origin ) ? 0 : (int) wp_remote_retrieve_response_code( $origin );
			$rows[]      = self::row( 'origin', __( 'Requests from foreign websites (Origin) are refused', 'sheets-to-wp-table-live-sync' ), in_array( $origin_code, [ 401, 403 ], true ) ? 'pass' : 'fail', 'HTTP ' . $origin_code, '' );
		}

		// No side effects.
		$after  = self::checksum();
		$rows[] = self::row( 'no_side_effects', __( 'The test changed no tables or posts', 'sheets-to-wp-table-live-sync' ), $before === $after ? 'pass' : 'fail', '', '' );

		$rows[] = self::public_row( $url );

		return self::finish( $rows );
	}

	/**
	 * Public reachability heuristic row.
	 *
	 * @param string $url Connector URL.
	 * @return array
	 */
	private static function public_row( $url ) {
		$host   = (string) wp_parse_url( $url, PHP_URL_HOST );
		$public = ! Endpoint::is_local_host( $host );

		return self::row(
			'public',
			__( 'Reachable by cloud AI clients', 'sheets-to-wp-table-live-sync' ),
			$public ? 'pass' : 'info',
			$public ? '' : __( 'Local or private address: Claude Desktop, Claude Code, Codex, Cursor and VS Code on this computer can connect. Claude.ai and ChatGPT connect from their cloud, so they need a public HTTPS address (a staging site or a tunnel).', 'sheets-to-wp-table-live-sync' ),
			__( 'Use a public HTTPS URL (staging site or a tunnel) for cloud connectors.', 'sheets-to-wp-table-live-sync' )
		);
	}

	/**
	 * Loopback POST with an initialize body.
	 *
	 * @param string $url     URL.
	 * @param array  $headers Extra headers.
	 * @return array|\WP_Error
	 */
	private static function post( $url, array $headers ) {
		return wp_remote_post(
			$url,
			[
				'timeout'     => 10,
				'redirection' => 0,
				'sslverify'   => apply_filters( 'https_local_ssl_verify', false ),
				'headers'     => array_merge(
					[
						'Content-Type' => 'application/json',
						'Accept'       => 'application/json, text/event-stream',
					],
					$headers
				),
				'body'        => wp_json_encode(
					[
						'jsonrpc' => '2.0',
						'id'      => 1,
						'method'  => 'tools/list',
					]
				),
			]
		);
	}

	/**
	 * Fingerprint of tables and pages/posts.
	 *
	 * @return string
	 */
	private static function checksum() {
		global $wpdb;
		$tables = $wpdb->get_var( "SELECT MD5(GROUP_CONCAT(CONCAT(id, ':', MD5(IFNULL(table_settings,'')), ':', IFNULL(table_name,'')) ORDER BY id)) FROM {$wpdb->prefix}gswpts_tables" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$posts  = $wpdb->get_var( "SELECT CONCAT(COUNT(*), ':', IFNULL(MAX(post_modified_gmt),'')) FROM {$wpdb->posts} WHERE post_type IN ('page','post')" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		return md5( (string) $tables . '|' . (string) $posts );
	}

	/**
	 * Result row.
	 *
	 * @param string $id     ID.
	 * @param string $label  Label.
	 * @param string $status pass|warn|fail.
	 * @param string $detail Detail.
	 * @param string $remedy Remedy.
	 * @return array
	 */
	private static function row( $id, $label, $status, $detail, $remedy ) {
		return [
			'id'     => $id,
			'label'  => $label,
			'status' => $status,
			'detail' => (string) $detail,
			'remedy' => in_array( $status, [ 'pass', 'info' ], true ) ? '' : (string) $remedy,
		];
	}

	/**
	 * Final result.
	 *
	 * @param array $rows Rows.
	 * @return array
	 */
	private static function finish( array $rows ) {
		$ok = true;
		foreach ( $rows as $row ) {
			if ( 'fail' === $row['status'] ) {
				$ok = false;
			}
		}

		return [
			'ok'   => $ok,
			'rows' => $rows,
			'note' => __( 'The self-test proves the server works from the inside. It cannot prove that a cloud client like Claude.ai or ChatGPT can reach this site. After connecting a client, check "Connected clients" for its last-used time.', 'sheets-to-wp-table-live-sync' ),
		];
	}
}
