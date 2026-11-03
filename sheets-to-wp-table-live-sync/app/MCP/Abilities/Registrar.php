<?php
/**
 * Registers the FlexTable ability category and abilities.
 *
 * @since 3.26.0
 * @package GSWPTS
 */

namespace GSWPTS\MCP\Abilities;

use GSWPTS\MCP\MCP;

defined( 'ABSPATH' ) || exit;

/**
 * Holds one handler instance per ability.
 *
 * @since 3.26.0
 */
class Registrar {

	/**
	 * Handler instances keyed by ability name.
	 *
	 * @var AbilityBase[]
	 */
	private static $handlers = [];

	/**
	 * Free ability classes, in display order.
	 *
	 * @return string[]
	 */
	public static function core_classes() {
		return [
			// Discovery.
			Discovery\GetStatus::class,
			Discovery\DescribeSettings::class,
			// Sheets and tables.
			Tables\InspectSheet::class,
			Tables\ListTables::class,
			Tables\GetTable::class,
			Tables\GetTableData::class,
			Tables\CreateTable::class,
			Tables\UpdateTable::class,
			Tables\RefreshTable::class,
			Tables\ChangeTableSource::class,
			Tables\DuplicateTable::class,
			Tables\DeleteTable::class,
			// Themes.
			Themes\ListThemes::class,
			Themes\ApplyTheme::class,
			// Publishing.
			Content\FindContent::class,
			Content\EmbedTable::class,
			Content\RemoveEmbed::class,
			Content\SetContentStatus::class,
			// AI.
			AI\GetTableSummary::class,
			AI\GenerateTableSummary::class,
			// Operations.
			Operations\ListRecentOperations::class,
			Operations\UndoOperation::class,
		];
	}

	/**
	 * Every ability class: Free's plus the ones extensions add.
	 *
	 * @return string[]
	 */
	public static function classes() {
		$core = self::core_classes();

		/**
		 * Filters the FlexTable MCP ability classes.
		 *
		 * FlexTable Pro adds its tools here. Each class must extend
		 * GSWPTS\MCP\Abilities\AbilityBase; anything else is ignored.
		 *
		 * @since 3.26.0
		 *
		 * @param string[] $classes Fully qualified class names.
		 */
		$classes = apply_filters( 'flextable_mcp_ability_classes', $core );

		if ( ! is_array( $classes ) ) {
			return $core;
		}

		return array_values(
			array_unique(
				array_filter(
					$classes,
					function ( $class ) {
						return is_string( $class ) && class_exists( $class ) && is_subclass_of( $class, AbilityBase::class );
					}
				)
			)
		);
	}

	/**
	 * Registers the "flextable" category.
	 *
	 * @return void
	 */
	public static function register_category() {
		if ( function_exists( 'wp_has_ability_category' ) && wp_has_ability_category( MCP::CATEGORY ) ) {
			return;
		}

		wp_register_ability_category(
			MCP::CATEGORY,
			[
				'label'       => __( 'FlexTable', 'sheets-to-wp-table-live-sync' ),
				'description' => __( 'Create, configure, theme and publish tables from public Google Sheets.', 'sheets-to-wp-table-live-sync' ),
			]
		);
	}

	/**
	 * Registers every ability.
	 *
	 * @return void
	 */
	public static function register_abilities() {
		foreach ( self::handlers() as $name => $handler ) {
			if ( function_exists( 'wp_has_ability' ) && wp_has_ability( $name ) ) {
				continue;
			}
			$handler->register();
		}
	}

	/**
	 * Handler instances.
	 *
	 * @return AbilityBase[]
	 */
	public static function handlers() {
		// Built once per request, after extensions hooked in (abilities load after init).
		if ( empty( self::$handlers ) ) {
			foreach ( self::classes() as $class ) {
				$handler = new $class();
				if ( 0 === strpos( $handler->name(), MCP::CATEGORY . '/' ) && ! isset( self::$handlers[ $handler->name() ] ) ) {
					self::$handlers[ $handler->name() ] = $handler;
				}
			}
		}

		return self::$handlers;
	}

	/**
	 * Forgets the handler instances (they are rebuilt on next use).
	 *
	 * @return void
	 */
	public static function reset() {
		self::$handlers = [];
	}

	/**
	 * Handler for an ability name.
	 *
	 * @param string $name Ability name.
	 * @return AbilityBase|null
	 */
	public static function handler( $name ) {
		$handlers = self::handlers();
		return isset( $handlers[ $name ] ) ? $handlers[ $name ] : null;
	}
}
