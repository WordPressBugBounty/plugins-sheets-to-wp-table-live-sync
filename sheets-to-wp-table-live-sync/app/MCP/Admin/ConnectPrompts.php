<?php
/**
 * "Connect an AI client" prompts, built on the server so client
 * instructions ship with PHP and the React tab only renders them.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Admin;

use GSWPTS\MCP\Abilities\Registrar;
use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Server\ToolCatalog;

defined( 'ABSPATH' ) || exit;

/**
 * Prompt templates for every client tab.
 *
 * @since 3.26.0
 */
class ConnectPrompts {

	/**
	 * Date the client instructions were last checked.
	 */
	const VERIFIED_ON = '2026-10-14';

	/**
	 * Client tabs in display order.
	 *
	 * @return array key => [label, summary]
	 */
	public static function clients() {
		return [
			'claude-code'    => [ 'Claude Code', __( 'Terminal command for Claude Code (CLI and IDE extensions).', 'sheets-to-wp-table-live-sync' ) ],
			'claude-desktop' => [ 'Claude Desktop', __( 'Config for the Claude Desktop app, through the mcp-remote bridge (needs Node.js 18+).', 'sheets-to-wp-table-live-sync' ) ],
			'claude-ai'      => [ 'Claude.ai connector', __( 'Custom connector in claude.ai (needs a public HTTPS site and the request-headers option on your Claude account).', 'sheets-to-wp-table-live-sync' ) ],
			'codex'          => [ 'Codex (ChatGPT)', __( 'Codex CLI, the Codex IDE extension and the ChatGPT desktop app share this config.', 'sheets-to-wp-table-live-sync' ) ],
			'cursor'         => [ 'Cursor', __( 'Cursor mcp.json entry.', 'sheets-to-wp-table-live-sync' ) ],
			'vscode'         => [ 'VS Code', __( 'VS Code (GitHub Copilot) mcp.json entry with a secure input prompt.', 'sheets-to-wp-table-live-sync' ) ],
			'other'          => [ __( 'Others', 'sheets-to-wp-table-live-sync' ), __( 'Kiro, Windsurf, Antigravity, MCP Inspector and any Streamable HTTP client.', 'sheets-to-wp-table-live-sync' ) ],
		];
	}

	/**
	 * Builds the prompt for a client.
	 *
	 * @param string      $client     Client key.
	 * @param string      $username   WordPress username.
	 * @param string|null $header     Full "Basic …" value, or null for a template.
	 * @param int         $expires    Expiry timestamp (0 = never).
	 * @param string      $public_url Optional public base URL (Claude.ai tab).
	 * @return string
	 */
	public static function build( $client, $username, $header = null, $expires = 0, $public_url = '' ) {
		$url    = self::url( $public_url );
		$auth   = null === $header ? 'Basic BASE64_ENCODED_CREDENTIALS' : $header;
		$http   = 0 === strpos( $url, 'http://' );
		$labels = self::clients();
		$label  = isset( $labels[ $client ] ) ? $labels[ $client ][0] : $labels['other'][0];

		$lines   = [];
		$lines[] = sprintf( 'I want to add my WordPress site as an MCP server to %s.', $label );
		$lines[] = '';
		$lines[] = '## Connection details';
		$lines[] = '- Server name: flextable';
		$lines[] = '- Server URL (use exactly this, no trailing slash): ' . $url;
		$lines[] = '- Transport: Streamable HTTP (JSON responses, no SSE, no sessions)';

		if ( null === $header ) {
			$lines[] = sprintf( '- Authentication: HTTP Basic with the WordPress user "%s" and an Application Password I will give you separately.', $username );
			$lines[] = '  Build the header value locally (never paste the password into a shared chat):';
			$lines[] = '  PowerShell: [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("' . $username . ':APPLICATION PASSWORD"))';
			$lines[] = '  bash/zsh:   printf "%s" "' . $username . ':APPLICATION PASSWORD" | base64';
			$lines[] = '  Then use: Authorization: Basic <that value>';
			$lines[] = '  Note: with "Only accept credentials generated here" on, only credentials generated in FlexTable → Settings → MCP work.';
		} else {
			$lines[] = '- Authorization header value (secret): ' . $auth;
			$lines[] = '  This credential only works on the FlexTable MCP endpoint above'
				. ( $expires ? ', expires on ' . gmdate( 'Y-m-d', $expires ) . ' (UTC)' : ', does not expire' )
				. ', and can be revoked in WordPress → FlexTable → Settings → MCP → Connected clients.';
			$lines[] = '  Do not repeat this value in replies, logs, commits or screenshots.';
		}

		$lines[] = '';
		$lines[] = '## Setup';
		$lines   = array_merge( $lines, self::setup( $client, $url, $auth, $http ) );

		$lines[] = '';
		$lines[] = '## Verify';
		$lines[] = '- After connecting, these tools should be listed: ' . implode( ', ', self::expected_tools() ) . '.';
		$lines[] = '- Call flextable-get-status (read-only) and show me the result.';
		$lines[] = '- 401 = the credential is missing, wrong, expired or revoked. 403 = the user is not a FlexTable admin, or the Origin/HTTPS check failed. 404 "mcp_disabled" = MCP is turned off in FlexTable → Settings → MCP.';

		return implode( "\n", $lines );
	}

	/**
	 * Client-specific setup instructions.
	 *
	 * @param string $client Client key.
	 * @param string $url    Server URL.
	 * @param string $auth   Header value.
	 * @param bool   $http   Plain HTTP URL.
	 * @return string[]
	 */
	private static function setup( $client, $url, $auth, $http ) {
		$json = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;

		switch ( $client ) {
			case 'claude-code':
				return [
					'Run this in a terminal (it adds the server for all your projects):',
					'```',
					sprintf( 'claude mcp add --scope user --transport http flextable "%s" --header "Authorization: %s"', $url, $auth ),
					'```',
					'Then run `claude mcp list` — flextable should show "✓ Connected". Start a new Claude Code session and type /mcp to see the FlexTable tools.',
				];

			case 'claude-desktop':
				$args = [ '-y', 'mcp-remote', $url, '--header', 'Authorization:${FLEXTABLE_AUTH}', '--transport', 'http-only' ];
				if ( $http ) {
					$args[] = '--allow-http';
				}
				$config = [
					'mcpServers' => [
						'flextable' => [
							'command' => 'npx',
							'args'    => $args,
							'env'     => [ 'FLEXTABLE_AUTH' => $auth ],
						],
					],
				];
				return [
					'Open Claude Desktop → Settings → Developer → Edit Config (claude_desktop_config.json):',
					'- macOS: ~/Library/Application Support/Claude/claude_desktop_config.json',
					'- Windows: %APPDATA%\\Claude\\claude_desktop_config.json',
					'MERGE this "flextable" entry into the existing "mcpServers" object (do not replace other servers):',
					'```json',
					wp_json_encode( $config, $json ),
					'```',
					'Keep "Authorization:${FLEXTABLE_AUTH}" without a space after the colon (Windows argument quoting). Fully quit Claude Desktop and reopen it. Needs Node.js 18 or newer. Logs: ~/Library/Logs/Claude (macOS) or %APPDATA%\\Claude\\logs (Windows).',
				];

			case 'claude-ai':
				return [
					'This is done by a person in the Claude web app (on Team/Enterprise plans an Owner adds it first):',
					'1. Open claude.ai → Settings → Connectors → Add custom connector.',
					'2. Name: FlexTable',
					'3. Remote MCP server URL: ' . $url,
					'4. Authentication: no sign-in (OAuth is not used yet).',
					'5. Request headers: add Authorization with the value: ' . $auth,
					'6. Click Add, then enable the connector in a chat.',
					'Notes: Claude connects from Anthropic\'s cloud, so the URL must be public HTTPS (a local site needs a tunnel). Request headers are a Claude beta feature and may not be available on every account.',
				];

			case 'codex':
				return [
					'1. Save the header value in a user environment variable named FLEXTABLE_AUTH:',
					'   PowerShell: [Environment]::SetEnvironmentVariable("FLEXTABLE_AUTH", "' . $auth . '", "User")',
					'   bash/zsh:   echo \'export FLEXTABLE_AUTH="' . $auth . '"\' >> ~/.zshrc  (or ~/.bashrc)',
					'2. MERGE this into ~/.codex/config.toml (do not replace other servers):',
					'```toml',
					'[mcp_servers.flextable]',
					'url = "' . $url . '"',
					'env_http_headers = { "Authorization" = "FLEXTABLE_AUTH" }',
					'```',
					'3. Restart Codex / the ChatGPT desktop app, then run `codex mcp list` or type /mcp.',
				];

			case 'cursor':
				$config = [
					'mcpServers' => [
						'flextable' => [
							'url'     => $url,
							'headers' => [ 'Authorization' => $auth ],
						],
					],
				];
				return [
					'MERGE this into ~/.cursor/mcp.json (all projects) or .cursor/mcp.json (this project):',
					'```json',
					wp_json_encode( $config, $json ),
					'```',
					'To keep the secret out of the file, set an environment variable FLEXTABLE_AUTH and use "Authorization": "${env:FLEXTABLE_AUTH}". Then open Cursor Settings → MCP and check that flextable is enabled.',
				];

			case 'vscode':
				$config = [
					'inputs'  => [
						[
							'type'        => 'promptString',
							'id'          => 'flextable-auth',
							'description' => 'FlexTable Authorization header value',
							'password'    => true,
						],
					],
					'servers' => [
						'flextable' => [
							'type'    => 'http',
							'url'     => $url,
							'headers' => [ 'Authorization' => '${input:flextable-auth}' ],
						],
					],
				];
				return [
					'Run "MCP: Add Server" or MERGE this into your mcp.json (note the top-level key is "servers"):',
					'```json',
					wp_json_encode( $config, $json ),
					'```',
					'When VS Code asks for "FlexTable Authorization header value", paste: ' . $auth,
				];

			default:
				return [
					'Use these values in any Streamable HTTP MCP client:',
					'- URL: ' . $url,
					'- Header: Authorization: ' . $auth,
					'Kiro: "url" + "headers". Windsurf and Antigravity: "serverUrl" + "headers". Clients that only support stdio can use: npx -y mcp-remote ' . $url . ' --header "Authorization:${FLEXTABLE_AUTH}"' . ( $http ? ' --allow-http' : '' ) . '.',
					'MCP Inspector (testing): npx @modelcontextprotocol/inspector --cli ' . $url . ' --transport http --header "Authorization: ' . $auth . '" --method tools/list',
					'Note: ChatGPT on the web needs OAuth, which FlexTable will add in a later release.',
				];
		}
	}

	/**
	 * Connector URL, optionally on a public base URL.
	 *
	 * @param string $public_url Public base (https://…), or ''.
	 * @return string
	 */
	public static function url( $public_url = '' ) {
		$url = MCP::connector_url();

		if ( '' === $public_url ) {
			return $url;
		}

		$public = wp_parse_url( $public_url );
		$own    = wp_parse_url( home_url() );

		if ( empty( $public['host'] ) || 'https' !== ( isset( $public['scheme'] ) ? $public['scheme'] : '' ) ) {
			return $url;
		}

		$prefix = untrailingslashit( home_url() );
		$base   = 'https://' . $public['host'] . ( ! empty( $public['port'] ) ? ':' . $public['port'] : '' ) . ( isset( $own['path'] ) ? untrailingslashit( $own['path'] ) : '' );

		return 0 === strpos( $url, $prefix ) ? $base . substr( $url, strlen( $prefix ) ) : $url;
	}

	/**
	 * Tools that should be listed for this site's edition and policies.
	 *
	 * @return string[]
	 */
	public static function expected_tools() {
		$tools = [];
		foreach ( Registrar::handlers() as $name => $handler ) {
			if ( true === $handler->availability() ) {
				$tools[] = ToolCatalog::tool_name( $name );
			}
		}
		sort( $tools );
		return $tools;
	}
}
