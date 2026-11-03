<?php
/**
 * MCP JSON-RPC protocol handling for both protocol eras.
 *
 * Legacy era (2025-11-25, 2025-06-18, 2025-03-26): `initialize` handshake,
 * then stateless tools/list and tools/call.
 * Modern era (2026-07-28): no handshake, every request carries
 * `_meta["io.modelcontextprotocol/protocolVersion"]`, `server/discover`,
 * `resultType`, caching hints and HTTP header validation.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Server;

use GSWPTS\MCP\MCP;
use GSWPTS\MCP\Safety\RequestContext;

defined( 'ABSPATH' ) || exit;

/**
 * Parses, validates and dispatches JSON-RPC messages.
 *
 * @since 3.26.0
 */
class Protocol {

	const MODERN_VERSIONS = [ '2026-07-28' ];
	const LEGACY_VERSIONS = [ '2025-03-26', '2025-06-18', '2025-11-25' ];

	const META_VERSION      = 'io.modelcontextprotocol/protocolVersion';
	const META_CLIENT       = 'io.modelcontextprotocol/clientInfo';
	const META_CAPABILITIES = 'io.modelcontextprotocol/clientCapabilities';
	const META_SERVER       = 'io.modelcontextprotocol/serverInfo';

	const PARSE_ERROR      = -32700;
	const INVALID_REQUEST  = -32600;
	const METHOD_NOT_FOUND = -32601;
	const INVALID_PARAMS   = -32602;
	const INTERNAL_ERROR   = -32603;
	const HEADER_MISMATCH  = -32020;
	const UNSUPPORTED      = -32022;

	/**
	 * Tool catalog.
	 *
	 * @var ToolCatalog
	 */
	private $catalog;

	/**
	 * Constructor.
	 *
	 * @param ToolCatalog|null $catalog Catalog (injected in tests / self-test).
	 */
	public function __construct( $catalog = null ) {
		$this->catalog = $catalog ? $catalog : new ToolCatalog();
	}

	/**
	 * Handles a raw HTTP body.
	 *
	 * @param string $raw     Body.
	 * @param array  $headers Lower-case header map (mcp-protocol-version, mcp-method, mcp-name).
	 * @return array {status:int, body:array|null}
	 */
	public function handle_raw( $raw, array $headers = [] ) {
		$message = json_decode( $raw, true );

		if ( null === $message && JSON_ERROR_NONE !== json_last_error() ) {
			return self::reply( 400, null, self::error( self::PARSE_ERROR, 'Parse error: the body is not valid JSON.' ) );
		}

		if ( ! is_array( $message ) || ( $message && array_keys( $message ) === range( 0, count( $message ) - 1 ) ) ) {
			return self::reply( 400, null, self::error( self::INVALID_REQUEST, 'Invalid request: send one JSON-RPC object per POST (batching is not supported).' ) );
		}

		return $this->handle_message( $message, $headers );
	}

	/**
	 * Handles one decoded JSON-RPC message.
	 *
	 * @param array $message Message.
	 * @param array $headers Header map.
	 * @return array {status, body}
	 */
	public function handle_message( array $message, array $headers = [] ) {
		$has_id = array_key_exists( 'id', $message );
		$id     = $has_id ? $message['id'] : null;

		// A JSON-RPC response sent by the client (e.g. to a server request) is accepted without a body.
		if ( isset( $message['jsonrpc'] ) && '2.0' === $message['jsonrpc'] && ! isset( $message['method'] ) && ( array_key_exists( 'result', $message ) || array_key_exists( 'error', $message ) ) ) {
			return [
				'status' => 202,
				'body'   => null,
			];
		}

		if ( ! isset( $message['jsonrpc'] ) || '2.0' !== $message['jsonrpc'] || empty( $message['method'] ) || ! is_string( $message['method'] ) ) {
			return self::reply( 400, $id, self::error( self::INVALID_REQUEST, 'Invalid request: expected a JSON-RPC 2.0 request with a method.' ) );
		}

		if ( $has_id && ! is_string( $id ) && ! is_int( $id ) ) {
			return self::reply( 400, null, self::error( self::INVALID_REQUEST, 'Invalid request: id must be a string or an integer.' ) );
		}

		$method = $message['method'];
		$params = isset( $message['params'] ) && is_array( $message['params'] ) ? $message['params'] : [];

		// Notifications (and stray responses) are accepted without a body.
		if ( ! $has_id ) {
			return [
				'status' => 202,
				'body'   => null,
			];
		}

		$meta   = isset( $params['_meta'] ) && is_array( $params['_meta'] ) ? $params['_meta'] : [];
		$modern = isset( $meta[ self::META_VERSION ] ) || 'server/discover' === $method;

		if ( $modern ) {
			return $this->handle_modern( $id, $method, $params, $meta, $headers );
		}

		return $this->handle_legacy( $id, $method, $params, $headers );
	}

	/**
	 * Legacy (initialize-based) request handling.
	 *
	 * @param string|int $id      Request ID.
	 * @param string     $method  Method.
	 * @param array      $params  Params.
	 * @param array      $headers Headers.
	 * @return array
	 */
	private function handle_legacy( $id, $method, array $params, array $headers ) {
		$header_version = isset( $headers['mcp-protocol-version'] ) ? trim( (string) $headers['mcp-protocol-version'] ) : '';

		if ( 'initialize' !== $method && '' !== $header_version && ! in_array( $header_version, self::LEGACY_VERSIONS, true ) ) {
			return self::reply(
				400,
				$id,
				self::error(
					self::INVALID_REQUEST,
					'Unsupported MCP-Protocol-Version header.',
					[
						'supported' => array_merge( self::MODERN_VERSIONS, self::LEGACY_VERSIONS ),
						'requested' => $header_version,
					]
				)
			);
		}

		$version = '' !== $header_version ? $header_version : '2025-03-26';
		RequestContext::set( 'protocol', $version );

		switch ( $method ) {
			case 'initialize':
				$requested = isset( $params['protocolVersion'] ) ? (string) $params['protocolVersion'] : '';
				$version   = in_array( $requested, self::LEGACY_VERSIONS, true ) ? $requested : self::LEGACY_VERSIONS[ count( self::LEGACY_VERSIONS ) - 1 ];
				RequestContext::set( 'protocol', $version );

				return self::reply(
					200,
					$id,
					[
						'protocolVersion' => $version,
						'capabilities'    => [ 'tools' => [ 'listChanged' => false ] ],
						'serverInfo'      => self::server_info(),
						'instructions'    => Instructions::text(),
					]
				);

			case 'ping':
				return self::reply( 200, $id, new \stdClass() );

			case 'tools/list':
				return self::reply( 200, $id, [ 'tools' => $this->catalog->list_tools() ] );

			case 'tools/call':
				return $this->call_tool( $id, $params, false );

			default:
				return self::reply( 200, $id, self::error( self::METHOD_NOT_FOUND, sprintf( 'Method not found: %s', $method ) ) );
		}
	}

	/**
	 * Modern (2026-07-28) request handling.
	 *
	 * @param string|int $id      Request ID.
	 * @param string     $method  Method.
	 * @param array      $params  Params.
	 * @param array      $meta    Request _meta.
	 * @param array      $headers Headers.
	 * @return array
	 */
	private function handle_modern( $id, $method, array $params, array $meta, array $headers ) {
		$version = isset( $meta[ self::META_VERSION ] ) ? (string) $meta[ self::META_VERSION ] : '';

		if ( '' === $version ) {
			return self::reply( 400, $id, self::error( self::INVALID_PARAMS, 'Invalid params: _meta["' . self::META_VERSION . '"] is required.' ) );
		}

		if ( ! in_array( $version, self::MODERN_VERSIONS, true ) ) {
			return self::reply(
				400,
				$id,
				self::error(
					self::UNSUPPORTED,
					'Unsupported protocol version',
					[
						'supported' => array_merge( self::MODERN_VERSIONS, self::LEGACY_VERSIONS ),
						'requested' => $version,
					]
				)
			);
		}

		if ( ! isset( $meta[ self::META_CAPABILITIES ] ) || ( ! is_array( $meta[ self::META_CAPABILITIES ] ) && ! is_object( $meta[ self::META_CAPABILITIES ] ) ) ) {
			return self::reply( 400, $id, self::error( self::INVALID_PARAMS, 'Invalid params: _meta["' . self::META_CAPABILITIES . '"] is required.' ) );
		}

		$mismatch = $this->header_mismatch( $method, $params, $version, $headers );
		if ( $mismatch ) {
			return self::reply( 400, $id, self::error( self::HEADER_MISMATCH, $mismatch ) );
		}

		RequestContext::set( 'protocol', $version );

		switch ( $method ) {
			case 'server/discover':
				return self::reply(
					200,
					$id,
					self::modern_result(
						[
							'supportedVersions' => array_merge( self::MODERN_VERSIONS, self::LEGACY_VERSIONS ),
							'capabilities'      => [ 'tools' => new \stdClass() ],
							'instructions'      => Instructions::text(),
						],
						true
					)
				);

			case 'tools/list':
				return self::reply( 200, $id, self::modern_result( [ 'tools' => $this->catalog->list_tools() ], true ) );

			case 'tools/call':
				return $this->call_tool( $id, $params, true );

			default:
				return self::reply( 404, $id, self::error( self::METHOD_NOT_FOUND, sprintf( 'Method not found: %s', $method ) ) );
		}
	}

	/**
	 * Validates Streamable HTTP request metadata headers (2026-07-28).
	 *
	 * Headers are only checked when the request arrived over HTTP (the
	 * in-process self-test passes no headers).
	 *
	 * @param string $method  Method.
	 * @param array  $params  Params.
	 * @param string $version Body version.
	 * @param array  $headers Headers.
	 * @return string Empty when valid, otherwise a message.
	 */
	private function header_mismatch( $method, array $params, $version, array $headers ) {
		if ( empty( $headers ) ) {
			return '';
		}

		$h_version = isset( $headers['mcp-protocol-version'] ) ? trim( (string) $headers['mcp-protocol-version'] ) : '';
		$h_method  = isset( $headers['mcp-method'] ) ? trim( (string) $headers['mcp-method'] ) : '';
		$h_name    = isset( $headers['mcp-name'] ) ? trim( (string) $headers['mcp-name'] ) : '';

		if ( '' === $h_version ) {
			return 'Header mismatch: the MCP-Protocol-Version header is required.';
		}
		if ( $h_version !== $version ) {
			return sprintf( "Header mismatch: MCP-Protocol-Version header value '%s' does not match body value '%s'", $h_version, $version );
		}
		if ( '' === $h_method ) {
			return 'Header mismatch: the Mcp-Method header is required.';
		}
		if ( $h_method !== $method ) {
			return sprintf( "Header mismatch: Mcp-Method header value '%s' does not match body value '%s'", $h_method, $method );
		}

		if ( 'tools/call' === $method ) {
			$body_name = isset( $params['name'] ) ? (string) $params['name'] : '';
			$decoded   = self::decode_header_value( $h_name );

			if ( '' === $h_name ) {
				return 'Header mismatch: the Mcp-Name header is required for tools/call.';
			}
			if ( $decoded !== $body_name ) {
				return sprintf( "Header mismatch: Mcp-Name header value '%s' does not match body value '%s'", $h_name, $body_name );
			}
		}

		return '';
	}

	/**
	 * Decodes the `=?base64?…?=` sentinel format.
	 *
	 * @param string $value Header value.
	 * @return string
	 */
	private static function decode_header_value( $value ) {
		if ( preg_match( '/^=\?base64\?(.*)\?=$/', $value, $m ) ) {
			$decoded = base64_decode( $m[1], true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
			return false === $decoded ? '' : $decoded;
		}
		return $value;
	}

	/**
	 * tools/call for both eras.
	 *
	 * @param string|int $id     Request ID.
	 * @param array      $params Params.
	 * @param bool       $modern Modern era.
	 * @return array
	 */
	private function call_tool( $id, array $params, $modern ) {
		$name = isset( $params['name'] ) ? (string) $params['name'] : '';

		if ( '' === $name ) {
			return self::reply( 200, $id, self::error( self::INVALID_PARAMS, 'Invalid params: "name" is required.' ) );
		}

		if ( ! $this->catalog->has_tool( $name ) ) {
			return self::reply( 200, $id, self::error( self::INVALID_PARAMS, sprintf( 'Unknown tool: %s', $name ) ) );
		}

		$arguments = isset( $params['arguments'] ) ? $params['arguments'] : [];
		if ( is_object( $arguments ) ) {
			$arguments = json_decode( (string) wp_json_encode( $arguments ), true );
			$arguments = is_array( $arguments ) ? $arguments : [];
		}
		if ( ! is_array( $arguments ) ) {
			return self::reply( 200, $id, self::error( self::INVALID_PARAMS, 'Invalid params: "arguments" must be an object.' ) );
		}

		$result = $this->catalog->call( $name, $arguments );

		return self::reply( 200, $id, $modern ? self::modern_result( $result, false ) : $result );
	}

	/**
	 * Adds modern-era result fields.
	 *
	 * @param array $result    Result.
	 * @param bool  $cacheable Whether caching hints are required.
	 * @return array
	 */
	private static function modern_result( array $result, $cacheable ) {
		$result = array_merge( [ 'resultType' => 'complete' ], $result );

		$result['_meta'] = [ self::META_SERVER => self::server_info() ];

		if ( $cacheable ) {
			// Lists depend on the user's edition and policies, so they are private.
			$result['ttlMs']      = 60000;
			$result['cacheScope'] = 'private';
		}

		return $result;
	}

	/**
	 * serverInfo / Implementation object.
	 *
	 * @return array
	 */
	public static function server_info() {
		return [
			'name'    => 'flextable',
			'title'   => 'FlexTable',
			'version' => MCP::VERSION,
		];
	}

	/**
	 * Builds a JSON-RPC error object.
	 *
	 * @param int    $code    Code.
	 * @param string $message Message.
	 * @param mixed  $data    Optional data.
	 * @return array
	 */
	public static function error( $code, $message, $data = null ) {
		$error = [
			'code'    => (int) $code,
			'message' => $message,
		];
		if ( null !== $data ) {
			$error['data'] = $data;
		}
		return [ '__error' => $error ];
	}

	/**
	 * Wraps a result or error in a JSON-RPC response.
	 *
	 * @param int        $status  HTTP status.
	 * @param string|int $id      Request ID.
	 * @param mixed      $payload Result, or an error built by self::error().
	 * @return array
	 */
	private static function reply( $status, $id, $payload ) {
		$body = [ 'jsonrpc' => '2.0' ];

		// JSON-RPC 2.0: id is always present; null when it could not be determined.
		$body['id'] = ( is_string( $id ) || is_int( $id ) ) ? $id : null;

		if ( is_array( $payload ) && isset( $payload['__error'] ) ) {
			$body['error'] = $payload['__error'];
		} else {
			$body['result'] = $payload;
		}

		return [
			'status' => (int) $status,
			'body'   => $body,
		];
	}
}
