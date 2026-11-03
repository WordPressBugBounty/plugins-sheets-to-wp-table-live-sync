<?php
/**
 * Fixed-window rate limits for MCP traffic.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Safety;

defined( 'ABSPATH' ) || exit;

/**
 * Transient-backed counters.
 *
 * @since 3.26.0
 */
class RateLimiter {

	/**
	 * Default limits: bucket => [max, window seconds].
	 *
	 * @return array
	 */
	public static function limits() {
		return apply_filters(
			'flextable_mcp_rate_limits',
			[
				'calls'        => [ 120, MINUTE_IN_SECONDS ],
				'writes'       => [ 30, MINUTE_IN_SECONDS ],
				'sheet_fetch'  => [ 20, MINUTE_IN_SECONDS ],
				'ai_generate'  => [ 10, HOUR_IN_SECONDS ],
			]
		);
	}

	/**
	 * Counts one hit and reports whether the bucket is over its limit.
	 *
	 * @param string $bucket Bucket name.
	 * @param string $scope  Who is counted (caller key or "site").
	 * @return int 0 when allowed, otherwise seconds until the window resets.
	 */
	public static function hit( $bucket, $scope ) {
		$limits = self::limits();
		if ( ! isset( $limits[ $bucket ] ) ) {
			return 0;
		}

		list( $max, $window ) = $limits[ $bucket ];

		$key   = 'flextable_mcp_rl_' . md5( $bucket . '|' . $scope );
		$state = get_transient( $key );
		$now   = time();

		if ( ! is_array( $state ) || $state['reset'] <= $now ) {
			$state = [
				'count' => 0,
				'reset' => $now + (int) $window,
			];
		}

		$state['count']++;
		set_transient( $key, $state, max( 1, $state['reset'] - $now ) );

		return $state['count'] > (int) $max ? max( 1, $state['reset'] - $now ) : 0;
	}
}
