<?php
/**
 * Tool T24: flextable/list-recent-operations.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities\Operations;

use GSWPTS\MCP\Abilities\AbilityBase;
use GSWPTS\MCP\Safety\AuditLog;
use GSWPTS\MCP\Safety\SnapshotStore;

defined( 'ABSPATH' ) || exit;

/**
 * Recent MCP operations of the current user.
 *
 * @since 3.26.0
 */
class ListRecentOperations extends AbilityBase {

	/** {@inheritDoc} */
	public function name() {
		return 'flextable/list-recent-operations';
	}

	/** {@inheritDoc} */
	public function label() {
		return __( 'List recent operations', 'sheets-to-wp-table-live-sync' );
	}

	/** {@inheritDoc} */
	public function description() {
		return 'Lists your recent FlexTable MCP tool calls (newest first): tool, target, result and whether it can be undone with flextable-undo-operation. Arguments are shown redacted. Read-only.';
	}

	/** {@inheritDoc} */
	public function input_schema() {
		return [
			'type'                 => 'object',
			'properties'           => [
				'limit' => [
					'type'    => 'integer',
					'minimum' => 1,
					'maximum' => 50,
					'default' => 20,
				],
				'tool'  => [
					'type'      => 'string',
					'maxLength' => 100,
				],
			],
			'additionalProperties' => false,
		];
	}

	/** {@inheritDoc} */
	protected function execute( array $input ) {
		$tool = isset( $input['tool'] ) ? str_replace( 'flextable-', 'flextable/', (string) $input['tool'] ) : '';

		$rows = AuditLog::recent(
			[
				'user_id' => get_current_user_id(),
				'tool'    => $tool,
				'limit'   => isset( $input['limit'] ) ? (int) $input['limit'] : 20,
			]
		);

		$items = [];
		foreach ( $rows as $row ) {
			if ( 'flextable/list-recent-operations' === $row['tool'] ) {
				continue;
			}
			$snapshots = SnapshotStore::for_audit( (int) $row['id'] );
			$undoable  = false;
			foreach ( $snapshots as $snapshot ) {
				if ( empty( $snapshot['restored'] ) ) {
					$undoable = true;
				}
			}
			$items[] = [
				'operation_id' => (int) $row['id'],
				'time'         => $row['created_at'] . ' UTC',
				'tool'         => str_replace( '/', '-', $row['tool'] ),
				'client'       => $row['client_name'],
				'result'       => $row['result_code'],
				'dry_run'      => (bool) $row['dry_run'],
				'arguments'    => json_decode( (string) $row['args_summary'], true ),
				'undoable'     => $undoable && ! $row['dry_run'],
			];
		}

		return self::ok( [ 'operations' => $items ] );
	}
}
