<?php
/**
 * Responsible for managing ajax endpoints.
 *
 * @since 2.12.15
 * @package SWPTLS
 */

namespace SWPTLS\Ajax;

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for fetching products.
 *
 * @since 2.12.15
 * @package SWPTLS
 */
class Products {

	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {
		add_action( 'wp_ajax_gswpts_product_fetch', [ $this, 'fetch_all' ] );
	}

	/**
	 * Fetch products ajax endpoint.
	 *
	 * @since 2.12.15
	 */
	public function fetch_all() {

		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'swptls-admin-app-nonce-action' ) ) {
			wp_send_json_error([
				'message' => __( 'Invalid action', 'sheets-to-wp-table-live-sync' ),
			]);
		}

		// Check if WooCommerce is active
		$is_woocommerce_active = class_exists( 'WooCommerce' ) || is_plugin_active( 'woocommerce/woocommerce.php' );

		// Get filtered products based on WooCommerce status
		ob_start();
		$this->get_other_products( $is_woocommerce_active );
		$plugin_cards_html = ob_get_clean();

		// Prepare header data based on WooCommerce status
		$header_data = [];

		if ( $is_woocommerce_active ) {
			$header_data['woocommerce'] = [
				'title' => '🛒 Boost your WooCommerce store\'s functionality',
				'content' => 'Discover top plugins to supercharge your store with advanced tools and improvements',
			];
		}

		$header_data['general'] = [
			'title' => '🧩 Enhance your WordPress site with powerful tools',
			'content' => 'We\'ve selected top plugins to improve your site. Explore options tailored just for you',
		];

		// Return the HTML content and header data within the JSON response.
		wp_send_json_success([
			'plugin_cards_html' => $plugin_cards_html,
			'is_woocommerce_active' => $is_woocommerce_active,
			'header_data' => $header_data,
		]);
		wp_die();
	}

	/**
	 * Get products from plugins api.
	 *
	 * @since 2.12.15
	 * @param bool $is_woocommerce_active Whether WooCommerce is active or not.
	 */
	public static function get_other_products( $is_woocommerce_active = false ) {
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		remove_all_filters( 'plugins_api' );

		$plugins_allowedtags = [
			'a'       => [
				'href'   => [],
				'title'  => [],
				'target' => [],
			],
			'abbr'    => [ 'title' => [] ],
			'acronym' => [ 'title' => [] ],
			'code'    => [],
			'pre'     => [],
			'em'      => [],
			'strong'  => [],
			'ul'      => [],
			'ol'      => [],
			'li'      => [],
			'p'       => [],
			'br'      => [],
		];

		$recommended_plugins = [];

		// Add WooCommerce plugins only if WooCommerce is active
		if ( $is_woocommerce_active ) {
			/* FlexSync WooCommerce Plugin */
			$args = [
				'slug'   => 'stock-sync-with-google-sheet-for-woocommerce',
				'fields' => [
					'short_description' => true,
					'icons'             => true,
					'reviews'           => false, // Excludes all reviews.
				],
			];

			$data = plugins_api( 'plugin_information', $args );

			if ( $data && ! is_wp_error( $data ) ) {
				$recommended_plugins['stock-sync-with-google-sheet-for-woocommerce']                    = $data;
				$recommended_plugins['stock-sync-with-google-sheet-for-woocommerce']->name              = __( 'Stock Sync with Google Sheets for WooCommerce | Product Sync with Google Sheet, WooCommerce Bulk Edit, Stock Management – FlexStock', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['stock-sync-with-google-sheet-for-woocommerce']->short_description = esc_html__( 'Auto-sync WooCommerce products from Google Sheets. An easy and powerful solution for WooCommerce inventory management.', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['stock-sync-with-google-sheet-for-woocommerce']->group = 'woocommerce';
			}

			/* FlexOrder WooCommerce Plugin */
			$args = [
				'slug'   => 'order-sync-with-google-sheets-for-woocommerce',
				'fields' => [
					'short_description' => true,
					'icons'             => true,
					'reviews'           => false, // Excludes all reviews.
				],
			];

			$data = plugins_api( 'plugin_information', $args );

			if ( $data && ! is_wp_error( $data ) ) {
				$recommended_plugins['order-sync-with-google-sheets-for-woocommerce']                    = $data;
				$recommended_plugins['order-sync-with-google-sheets-for-woocommerce']->name              = __( 'FlexOrder – Manage & Sync Orders with Google Sheets for WooCommerce', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['order-sync-with-google-sheets-for-woocommerce']->short_description = esc_html__( '🔥Seamlessly connect WooCommerce with Google Sheets to manage orders, update statuses in bulk, and simplify your workflow', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['order-sync-with-google-sheets-for-woocommerce']->group = 'woocommerce';
			}

			/* ArchiveMaster Plugin */
			$args = [
				'slug'   => 'archive-master',
				'fields' => [
					'short_description' => true,
					'icons'             => true,
					'reviews'           => false, // Excludes all reviews.
				],
			];

			$data = plugins_api( 'plugin_information', $args );

			if ( $data && ! is_wp_error( $data ) ) {
				$recommended_plugins['archive-master']                    = $data;
				$recommended_plugins['archive-master']->name              = __( 'ArchiveMaster — Auto Archive and Export Old Orders for WooCommerce', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['archive-master']->short_description = esc_html__( 'Optimize your WooCommerce store and store old data in a local or any remote database. With ArchiveMaster, easily archive old orders, export order data, and streamline database performance.', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['archive-master']->group = 'woocommerce';
			}

			/* EchoRewards Plugin */
			$args = [
				'slug'   => 'echo-rewards',
				'fields' => [
					'short_description' => true,
					'icons'             => true,
					'reviews'           => false, // Excludes all reviews.
				],
			];

			$data = plugins_api( 'plugin_information', $args );

			if ( $data && ! is_wp_error( $data ) ) {
				$recommended_plugins['echo-rewards']                    = $data;
				$recommended_plugins['echo-rewards']->name              = __( 'EchoRewards — Refer-a-Friend & Referral Program for WooCommerce', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['echo-rewards']->short_description = esc_html__( 'Create your customer referral program with a refer-a-friend plugin for WordPress. With EchoRewards, automate customer rewards and add a refer-a-friend program to your WooCommerce store', 'sheets-to-wp-table-live-sync' );
				$recommended_plugins['echo-rewards']->group = 'woocommerce';
			}
		}

		/* WP Dark Mode Plugin */
		$args = [
			'slug'   => 'wp-dark-mode',
			'fields' => [
				'short_description' => true,
				'icons'             => true,
				'reviews'           => false, // Excludes all reviews.
			],
		];

		$data = plugins_api( 'plugin_information', $args );

		if ( $data && ! is_wp_error( $data ) ) {
			$recommended_plugins['wp-dark-mode']                    = $data;
			$recommended_plugins['wp-dark-mode']->name              = __( 'WP Dark Mode', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['wp-dark-mode']->short_description = esc_html__( 'Create a dark mode version of your website without any complicated setup. Activate the plugin and your site visitors will experience a dark mode or light mode version of your website as per their preferred operating system preference.', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['wp-dark-mode']->group = 'general';
		}

		/* FormToChat – Connect Contact Form to Chat Apps with Contact Form 7 Integration Plugin. */
		$args = [
			'slug'   => 'social-contact-form',
			'fields' => [
				'short_description' => true,
				'icons'             => true,
				'reviews'           => false, // Excludes all reviews.
			],
		];

		$data = plugins_api( 'plugin_information', $args );

		if ( $data && ! is_wp_error( $data ) ) {
			$recommended_plugins['social-contact-form']                    = $data;
			$recommended_plugins['social-contact-form']->name              = __( 'FormToChat – Connect Contact Form to Chat Apps with Contact Form 7 Integration', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['social-contact-form']->short_description = esc_html__( 'WhatsApp Chat for WordPress🔥. Connect contact forms to WhatsApp. A WhatsApp notifications plugin with Contact Form 7 integration.', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['social-contact-form']->group = 'general';
		}

		/* Jitsi meet Plugin. */
		$args = [
			'slug'   => 'webinar-and-video-conference-with-jitsi-meet',
			'fields' => [
				'short_description' => true,
				'icons'             => true,
				'reviews'           => false, // Excludes all reviews.
			],
		];

		$data = plugins_api( 'plugin_information', $args );

		if ( $data && ! is_wp_error( $data ) ) {
			$recommended_plugins['webinar-and-video-conference-with-jitsi-meet']                    = $data;
			$recommended_plugins['webinar-and-video-conference-with-jitsi-meet']->name              = __( 'Webinar and Video Conference with Jitsi Meet', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['webinar-and-video-conference-with-jitsi-meet']->short_description = esc_html__( 'The best WordPress webinar plugin with branded meetings. Add Jitsi meetings, host webinars and video conferences on your website.', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['webinar-and-video-conference-with-jitsi-meet']->group = 'general';
		}

		/* easy-video-reviews Plugin */
		$args = [
			'slug'   => 'easy-video-reviews',
			'fields' => [
				'short_description' => true,
				'icons'             => true,
				'reviews'           => false, // Excludes all reviews.
			],
		];

		$data = plugins_api( 'plugin_information', $args );
		if ( $data && ! is_wp_error( $data ) ) {
			$recommended_plugins['easy-video-reviews']                    = $data;
			$recommended_plugins['easy-video-reviews']->name              = __( 'Easy Video Reviews', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['easy-video-reviews']->short_description = esc_html__( 'Easy Video Reviews is the best 
			and easiest video review plugin for WordPress, fully compatible with WooCommerce and Easy Digital Downloads plugins.', 'sheets-to-wp-table-live-sync' );
			$recommended_plugins['easy-video-reviews']->group = 'general';
		}

		// END Plugin list .

		$group = ''; // Initialize group variable

		foreach ( (array) $recommended_plugins as $plugin ) {
			if ( is_object( $plugin ) ) {
				$plugin = (array) $plugin;
			}

			// Display the group heading if there is one.
			if ( isset( $plugin['group'] ) && $plugin['group'] !== $group ) {

				$group_name = $plugin['group'];

				// Starting a new group, close off the divs of the last one.
				if ( ! empty( $group ) ) {
					echo '</div>';
				}

				echo '<div class="plugin-group"><h3>' . esc_html( $group_name ) . '</h3>';
				// Needs an extra wrapping div for nth-child selectors to work.
				echo '<div class="plugin-items">';

				$group = $plugin['group'];
			}
			$title = wp_kses( $plugin['name'], $plugins_allowedtags );

			// Remove any HTML from the description.
			$description = wp_strip_all_tags( $plugin['short_description'] );
			$version     = wp_kses( $plugin['version'], $plugins_allowedtags );

			$name = wp_strip_all_tags( $title . ' ' . $version );

			$author = wp_kses( $plugin['author'], $plugins_allowedtags );
			if ( ! empty( $author ) ) {
				/* translators: %s: Plugin author. */
				$author = ' <cite>' . sprintf( __( 'By %s', 'sheets-to-wp-table-live-sync' ), $author ) . '</cite>';
			}

			$requires_php = isset( $plugin['requires_php'] ) ? $plugin['requires_php'] : null;
			$requires_wp  = isset( $plugin['requires'] ) ? $plugin['requires'] : null;

			$compatible_php = is_php_version_compatible( $requires_php );
			$compatible_wp  = is_wp_version_compatible( $requires_wp );
			$tested_wp      = ( empty( $plugin['tested'] ) || version_compare( get_bloginfo( 'version' ), $plugin['tested'], '<=' ) );

			$action_links = [];

			if ( current_user_can( 'install_plugins' ) || current_user_can( 'update_plugins' ) ) {
				$status = install_plugin_install_status( $plugin );

				switch ( $status['status'] ) {
					case 'install':
						if ( $status['url'] ) {
							if ( $compatible_php && $compatible_wp ) {
								$action_links[] = sprintf(
									'<a class="install-now button" data-slug="%s" href="%s" aria-label="%s" data-name="%s">%s</a>',
									esc_attr( $plugin['slug'] ),
									esc_url( $status['url'] ),
									/* translators: %s: Plugin name and version. */
									esc_attr( sprintf( _x( 'Install %s now', 'plugin', 'sheets-to-wp-table-live-sync' ), $name ) ),
									esc_attr( $name ),
									__( 'Install Now', 'sheets-to-wp-table-live-sync' )
								);
							} else {
								$action_links[] = sprintf(
									'<button type="button" class="button button-disabled" disabled="disabled">%s</button>',
									_x( 'Cannot Install', 'plugin', 'sheets-to-wp-table-live-sync' )
								);
							}
						}
						break;

					case 'update_available':
						if ( $status['url'] ) {
							if ( $compatible_php && $compatible_wp ) {
								$action_links[] = sprintf(
									'<a class="update-now button aria-button-if-js" data-plugin="%s" data-slug="%s" href="%s" aria-label="%s" data-name="%s">%s</a>',
									esc_attr( $status['file'] ),
									esc_attr( $plugin['slug'] ),
									esc_url( $status['url'] ),
									/* translators: %s: Plugin name and version. */
									esc_attr( sprintf( _x( 'Update %s now', 'plugin', 'sheets-to-wp-table-live-sync' ), $name ) ),
									esc_attr( $name ),
									__( 'Update Now', 'sheets-to-wp-table-live-sync' )
								);
							} else {
								$action_links[] = sprintf(
									'<button type="button" class="button button-disabled" disabled="disabled">%s</button>',
									_x( 'Cannot Update', 'plugin', 'sheets-to-wp-table-live-sync' )
								);
							}
						}
						break;

					case 'latest_installed':
					case 'newer_installed':
						if ( is_plugin_active( $status['file'] ) ) {
							$action_links[] = sprintf(
								'<button type="button" class="button button-disabled" disabled="disabled">%s</button>',
								_x( 'Active', 'plugin', 'sheets-to-wp-table-live-sync' )
							);
						} elseif ( current_user_can( 'activate_plugin', $status['file'] ) ) {
							$button_text = esc_html__( 'Activate', 'sheets-to-wp-table-live-sync' );
							/* translators: %s: Plugin name. */
							$button_label = _x( 'Activate %s', 'plugin', 'sheets-to-wp-table-live-sync' );
							$activate_url = add_query_arg(
								[
									'_wpnonce' => wp_create_nonce( 'activate-plugin_' . $status['file'] ),
									'action'   => 'activate',
									'plugin'   => $status['file'],
								],
								network_admin_url( 'plugins.php' )
							);

							if ( is_network_admin() ) {
								$button_text = __( 'Network Activate', 'sheets-to-wp-table-live-sync' );
								/* translators: %s: Plugin name. */
								$button_label = _x( 'Network Activate %s', 'plugin', 'sheets-to-wp-table-live-sync' );
								$activate_url = add_query_arg( [ 'networkwide' => 1 ], $activate_url );
							}

							$action_links[] = sprintf(
								'<a href="%1$s" class="button activate-now" aria-label="%2$s">%3$s</a>',
								esc_url( $activate_url ),
								esc_attr( sprintf( $button_label, $plugin['name'] ) ),
								$button_text
							);
						} else {
							$action_links[] = sprintf(
								'<button type="button" class="button button-disabled" disabled="disabled">%s</button>',
								_x( 'Installed', 'plugin', 'sheets-to-wp-table-live-sync' )
							);
						}
						break;
				}
			}

			$details_link = esc_url( self_admin_url(
				'plugin-install.php?tab=plugin-information&amp;plugin=' . $plugin['slug']
				. '&amp;TB_iframe=true&amp;width=600&amp;height=550'
			) );

			$action_links[] = sprintf(
				'<a href="%s" class="thickbox open-plugin-details-modal" aria-label="%s" data-title="%s">%s</a>',
				esc_url( $details_link ),
				/* translators: %s: Plugin name and version. */
				esc_attr( sprintf( __( 'More information about %s', 'sheets-to-wp-table-live-sync' ), $name ) ),
				esc_attr( $name ),
				__( 'More Details', 'sheets-to-wp-table-live-sync' )
			);

			if ( ! empty( $plugin['icons']['svg'] ) ) {
				$plugin_icon_url = $plugin['icons']['svg'];
			} elseif ( ! empty( $plugin['icons']['2x'] ) ) {
				$plugin_icon_url = $plugin['icons']['2x'];
			} elseif ( ! empty( $plugin['icons']['1x'] ) ) {
				$plugin_icon_url = $plugin['icons']['1x'];
			} else {
				$plugin_icon_url = $plugin['icons']['default'];
			}

			/**
			 * Filters the install action links for a plugin.
			 *
			 * @param mixed $action_links An array of plugin action links. Defaults are links to Details and Install Now.
			 * @param array    $plugin       The plugin currently being listed.
			 */
			$action_links = apply_filters( 'plugin_install_action_links', $action_links, $plugin );

			$last_updated_timestamp = strtotime( $plugin['last_updated'] );
			?>
<div class="plugin-card plugin-card-<?php echo sanitize_html_class( $plugin['slug'] ); ?>">
			<?php
			if ( ! $compatible_php || ! $compatible_wp ) {
				echo '<div class="notice inline notice-error notice-alt"><p>';
				if ( ! $compatible_php && ! $compatible_wp ) {
					esc_html_e( 'This plugin doesn&#8217;t work with your versions of WordPress and PHP.', 'sheets-to-wp-table-live-sync' );
					if ( current_user_can( 'update_core' ) && current_user_can( 'update_php' ) ) {
						printf(
							/* translators: 1: URL to WordPress Updates screen, 2: URL to Update PHP page. */
							' ' . wp_kses( '<a href="%1$s">Please update WordPress</a>, and then <a href="%2$s">learn more about updating PHP</a>.', [ 'a' => [ 'href' => '' ] ] ),
							esc_url( self_admin_url( 'update-core.php' ) ),
							esc_url( wp_get_update_php_url() )
						);
						wp_update_php_annotation( '</p><p><em>', '</em>' );
					} elseif ( current_user_can( 'update_core' ) ) {
						printf(
							/* translators: %s: URL to WordPress Updates screen. */
							' ' . wp_kses(
								'<a href="%s">Please update WordPress</a>.',
								[ 'a' => [ 'href' => '' ] ]
							),
							esc_url( self_admin_url( 'update-core.php' ) )
						);
					} elseif ( current_user_can( 'update_php' ) ) {
						printf(
							/* translators: %s: URL to Update PHP page. */
							' ' . wp_kses(
								'<a href="%s">Learn more about updating PHP</a>.',
								[ 'a' => [ 'href' => '' ] ]
							),
							esc_url( wp_get_update_php_url() )
						);
						wp_update_php_annotation( '</p><p><em>', '</em>' );
					}
				} elseif ( ! $compatible_wp ) {
					esc_html_e( 'This plugin doesn&#8217;t work with your version of WordPress.', 'sheets-to-wp-table-live-sync' );
					if ( current_user_can( 'update_core' ) ) {
						printf(
							/* translators: %s: URL to WordPress Updates screen. */
							' ' . wp_kses( '<a href="%s">Please update WordPress</a>.',
								[ 'a' => [ 'href' => '' ] ]
							),
							esc_url( self_admin_url( 'update-core.php' ) )
						);
					}
				} elseif ( ! $compatible_php ) {
					esc_html_e( 'This plugin doesn&#8217;t work with your version of PHP.', 'sheets-to-wp-table-live-sync' );
					if ( current_user_can( 'update_php' ) ) {
						printf(
							/* translators: %s: URL to Update PHP page. */
							' ' . wp_kses(
								'<a href="%s">Learn more about updating PHP</a>.',
								[ 'a' => [ 'href' => '' ] ]
							),
							esc_url( wp_get_update_php_url() )
						);
						wp_update_php_annotation( '</p><p><em>', '</em>' );
					}
				}
				echo '</p></div>';
			}
			?>
	<div class="plugin-card-top">
		<div class="name column-name">
			<h3>
				<a href="<?php echo esc_url( $details_link ); ?>" class="thickbox open-plugin-details-modal">
					<?php echo esc_attr( $title ); ?>
					<img src="<?php echo esc_attr( $plugin_icon_url ); ?>" class="plugin-icon" alt="" />
				</a>
			</h3>
		</div>
		<div class="action-links">
			<?php
			if ( $action_links ) {
				echo '<ul class="plugin-action-buttons">';
				foreach ( $action_links as $link ) {
					echo wp_kses_post( $link ) . '</br>';
				}
				echo '</ul>';
			}
			?>
		</div>
		<div class="desc column-description">
			<p><?php echo esc_html( $description ); ?></p>
            <p class="authors"><?php echo $author; //phpcs:ignore ?></p>
		</div>
	</div>
	<div class="plugin-card-bottom">
		<div class="vers column-rating">
			<?php
				wp_star_rating([
					'rating' => $plugin['rating'],
					'type'   => 'percent',
					'number' => $plugin['num_ratings'],
				]);
			?>
			<span class="num-ratings"
				aria-hidden="true">(<?php echo esc_attr( number_format_i18n( $plugin['num_ratings'] ) ); ?>)</span>
		</div>
		<div class="column-updated">
			<strong><?php esc_attr_e( 'Last Updated:', 'sheets-to-wp-table-live-sync' ); ?></strong>
			<?php
				/* translators: %s: Human-readable time difference. */
				printf( esc_html( __( '%s ago', 'sheets-to-wp-table-live-sync' ) ), esc_html( human_time_diff( $last_updated_timestamp ) ) );
			?>
		</div>
		<div class="column-downloaded">
			<?php
			if ( $plugin['active_installs'] >= 1000000 ) {
				$active_installs_millions = floor( $plugin['active_installs'] / 1000000 );
				$active_installs_text     = sprintf(
					/* translators: %s: Number of millions. */
					_nx( '%s+ Million', '%s+ Million', $active_installs_millions, 'Active plugin installations', 'sheets-to-wp-table-live-sync' ),
					number_format_i18n( $active_installs_millions )
				);
			} elseif ( 0 === $plugin['active_installs'] ) {
				$active_installs_text = _x( 'Less Than 10', 'Active plugin installations', 'sheets-to-wp-table-live-sync' );
			} else {
				$active_installs_text = number_format_i18n( $plugin['active_installs'] ) . '+';
			}
			/* translators: %s: Number of installations. */
			printf( esc_html( __( '%s Active Installations', 'sheets-to-wp-table-live-sync' ) ), esc_html( $active_installs_text ) );
			?>
		</div>
		<div class="column-compatibility">
			<?php
			if ( ! $tested_wp ) {
				echo '<span class="compatibility-untested">' . esc_html( __( 'Untested with your version of WordPress', 'sheets-to-wp-table-live-sync' ) ) . '</span>';
			} elseif ( ! $compatible_wp ) {
				echo '<span class="compatibility-incompatible"><strong>Incompatible</strong> with your version of WordPress</span>';
			} else {
				echo '<span class="compatibility-compatible"><strong>Compatible</strong> with your version of WordPress</span>';
			}
			?>
		</div>
	</div>
</div>
<?php } ?>
		<?php
	}
}
