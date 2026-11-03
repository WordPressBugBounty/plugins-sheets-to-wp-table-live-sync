<?php
/**
 * Thrown by the exit guard when FlexTable code tries to end the request.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Internal control-flow exception (never leaves SheetAccess).
 *
 * @since 3.26.0
 */
class SheetExit extends \Exception {
}
