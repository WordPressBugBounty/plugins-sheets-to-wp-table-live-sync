<?php
/**
 * AI summaries through FlexTable's own AI manager.
 *
 * Unlike the front-end button (which sends table data from the browser),
 * MCP always builds the summary input on the server from the visible rows.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Services;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Summary statistics and generation.
 *
 * @since 3.26.0
 */
class SummaryService {

	/**
	 * Whether an AI provider key is configured (never returns the key).
	 *
	 * @return bool
	 */
	public static function provider_configured() {
		$provider = (string) get_option( 'gswpts_ai_provider', 'openai' );
		$provider = preg_replace( '/[^a-z0-9_]/', '', strtolower( $provider ) );
		return '' !== trim( (string) get_option( 'gswpts_' . $provider . '_api_key', '' ) );
	}

	/**
	 * Column statistics of visible data.
	 *
	 * @param array $visible Result of TableData::visible().
	 * @return array
	 */
	public static function stats( array $visible ) {
		$rows    = array_map(
			function ( $row ) {
				return $row['cells'];
			},
			$visible['rows']
		);
		$types   = SheetAccess::guess_types( $rows, count( $visible['headers'] ) );
		$columns = [];

		foreach ( $visible['headers'] as $i => $header ) {
			$values = [];
			foreach ( $rows as $row ) {
				if ( isset( $row[ $i ] ) && '' !== $row[ $i ] ) {
					$values[] = $row[ $i ];
				}
			}

			$column = [
				'column'    => 'Col #' . $visible['columns'][ $i ],
				'header'    => $header,
				'type'      => $types[ $i ],
				'non_empty' => count( $values ),
			];

			if ( in_array( $types[ $i ], [ 'number', 'currency', 'percent' ], true ) && $values ) {
				$numbers = array_map(
					function ( $v ) {
						return (float) preg_replace( '/[^\d.\-]/', '', $v );
					},
					$values
				);
				$column['min']  = min( $numbers );
				$column['max']  = max( $numbers );
				$column['mean'] = round( array_sum( $numbers ) / count( $numbers ), 4 );
			} else {
				$counts = array_count_values( array_map( 'strval', $values ) );
				arsort( $counts );
				$top = [];
				foreach ( array_slice( $counts, 0, 5, true ) as $value => $count ) {
					$top[] = [
						'value' => TableData::truncate( (string) $value, 100 ),
						'count' => $count,
					];
				}
				$column['top_values'] = $top;
			}

			$columns[] = $column;
		}

		return [
			'untrusted_data' => true,
			'row_count'      => count( $rows ),
			'columns'        => $columns,
			'sample_rows'    => array_map(
				function ( $row ) {
					return array_map(
						function ( $cell ) {
							return TableData::truncate( $cell, 200 );
						},
						$row
					);
				},
				array_slice( $rows, 0, 20 )
			),
		];
	}

	/**
	 * Generates a summary with the site's AI provider.
	 *
	 * @param array  $table   Hydrated table.
	 * @param array  $visible Visible data.
	 * @param string $prompt  Optional prompt override.
	 * @return array|WP_Error {summary, provider, model}
	 */
	public static function generate( array $table, array $visible, $prompt = '' ) {
		/**
		 * Filters the AI manager used to generate table summaries.
		 *
		 * Must provide generate_table_summary( $data, $context, $settings ).
		 * FlexTable Pro passes its own AI manager.
		 *
		 * @since 3.26.0
		 *
		 * @param object|null $manager Free's AI manager.
		 */
		$manager = apply_filters( 'flextable_mcp_ai_manager', isset( gswpts()->ai ) ? gswpts()->ai : null );

		if ( ! $manager || ! method_exists( $manager, 'generate_table_summary' ) ) {
			return new WP_Error( 'ai_not_configured', __( 'The FlexTable AI integration is not available.', 'sheets-to-wp-table-live-sync' ) );
		}

		$rows = array_map(
			function ( $row ) {
				return $row['cells'];
			},
			$visible['rows']
		);

		$data = [
			'title'          => $table['table_name'],
			'tableStructure' => [
				'totalColumns'     => count( $visible['headers'] ),
				'totalVisibleRows' => count( $rows ),
			],
			'headers'        => $visible['headers'],
			'rows'           => $rows,
		];

		$settings = $table['settings'];
		if ( '' !== trim( (string) $prompt ) ) {
			$settings['summary_prompt'] = sanitize_textarea_field( $prompt );
		}
		$settings['enable_ai_cache'] = true;

		$result = $manager->generate_table_summary( $data, [], $settings );

		if ( is_wp_error( $result ) ) {
			return new WP_Error(
				'ai_provider_error',
				wp_strip_all_tags( $result->get_error_message() ),
				[ 'hint' => __( 'Check the provider, model and API key in FlexTable → Settings → AI Configuration.', 'sheets-to-wp-table-live-sync' ) ]
			);
		}

		return [
			'summary'  => isset( $result['summary'] ) ? (string) $result['summary'] : '',
			'provider' => isset( $result['metadata']['provider'] ) ? (string) $result['metadata']['provider'] : '',
			'model'    => isset( $result['model_used'] ) ? (string) $result['model_used'] : '',
		];
	}
}
