<?php //phpcs:ignore
/**
 * Responsible for managing plugin admin area.
 *
 * @since 2.12.15
 * @package GSWPTS
 */

namespace GSWPTS; // phpcs:ignore

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for registering admin menus.
 *
 * @since 2.12.15
 * @package GSWPTS
 */
class GSWPTS_Admin {

	/**
	 * Class constructor.
	 *
	 * @since 2.12.15
	 */
	public function __construct() {
		add_action( 'admin_menu', [ $this, 'admin_menus' ] );
	}

	/**
	 * Registers admin menus.
	 *
	 * @since 2.12.15
	 */
	public function admin_menus() {
		$strings_collection = GSWPTS_Strings::get();

		add_menu_page(
			__( 'FlexTable', 'sheets-to-wp-table-live-sync' ),
			__( 'FlexTable', 'sheets-to-wp-table-live-sync' ),
			'manage_options',
			'swptls-dashboard',
			[ $this, 'dashboard_page' ],
			GSWPTS_BASE_URL . 'assets/public/images/admin-icon.svg'
		);

		if ( current_user_can( 'manage_options' ) ) {
			global $submenu;

			$submenu['swptls-dashboard'][] = [ __( 'All Tables', 'sheets-to-wp-table-live-sync' ), 'manage_options', 'admin.php?page=swptls-dashboard#/' ]; // phpcs:ignore

			$submenu['swptls-dashboard'][] = [ __( 'Tab Groups', 'sheets-to-wp-table-live-sync' ), 'manage_options', 'admin.php?page=swptls-dashboard#/tabs' ]; // phpcs:ignore

			$submenu['swptls-dashboard'][] = [ __( 'Global Settings', 'sheets-to-wp-table-live-sync' ), 'manage_options', 'admin.php?page=swptls-dashboard#/settings' ]; // phpcs:ignore				

			$submenu['swptls-dashboard'][] = [ __( 'Get Started', 'sheets-to-wp-table-live-sync' ), 'manage_options', 'admin.php?page=swptls-dashboard#/doc' ]; // phpcs:ignore

			$submenu['swptls-dashboard'][] = [ __( 'Recommended Plugins', 'sheets-to-wp-table-live-sync' ), 'manage_options', 'admin.php?page=swptls-dashboard#/recommendation' ]; // phpcs:ignore
		}

		// It simply creates a menu item labeled "Upgrade". It doesn't add or enable any functionality.
		if ( ! gswpts()->helpers->check_pro_plugin_exists() || ! gswpts()->helpers->is_pro_active() ) {
			add_submenu_page(
				'swptls-dashboard',
				__( 'Get PRO', 'sheets-to-wp-table-live-sync' ),// phpcs:ignore
				__( '<span style="display: flex; align-items: center; gap: 7px; color: #29be7c; font-weight: 700; text-transform:uppercase; font-size: 12px;"> Upgrade Now <svg width="21" height="17" viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M11.8012 7.66016L10.0813 4.26172L8.36133 7.66016C8.9104 7.69498 9.48392 7.71466 10.0813 7.71466C10.6786 7.71466 11.2522 7.69498 11.8012 7.66016Z" fill="#34D399"/>
					<path d="M13.5164 3.93457C12.5221 4.00909 11.4463 4.05114 10.3535 4.05712L12.0518 7.41268L13.5164 3.93457Z" fill="#34D399"/>
					<path d="M17.655 6.58984C18.9408 6.17882 19.7993 5.76404 20.1634 5.57337L17.6901 3.27344L16.8496 6.82924C17.1409 6.74883 17.4099 6.6682 17.655 6.58984Z" fill="#34D399"/>
					<path d="M13.8256 4.06055L12.3262 7.62137C13.8894 7.49126 15.2336 7.24006 16.3194 6.96869L13.8256 4.06055Z" fill="#34D399"/>
					<path d="M3.84375 6.96869C4.92956 7.24006 6.27375 7.49126 7.83695 7.62137L6.33749 4.06055L3.84375 6.96869Z" fill="#34D399"/>
					<path d="M14.1152 3.88492L16.5346 6.70624L17.3326 3.33008C17.0083 3.4568 16.4276 3.60162 15.3786 3.74365C14.9823 3.79731 14.5586 3.84437 14.1152 3.88492Z" fill="#34D399"/>
					<path d="M9.8103 4.05712C8.71747 4.0511 7.64174 4.00905 6.64746 3.93457L8.11206 7.41268L9.8103 4.05712Z" fill="#34D399"/>
					<path d="M10.0818 3.72428C11.9183 3.72428 13.7348 3.62004 15.1969 3.43079C16.4383 3.27009 17.054 3.09714 17.3042 2.98362C17.0203 2.8663 16.3914 2.69009 15.2275 2.52161C13.739 2.30616 11.9115 2.1875 10.0818 2.1875C8.25205 2.1875 6.42458 2.30616 4.93603 2.52161C3.77219 2.69009 3.14329 2.8663 2.85938 2.98362C3.10952 3.09718 3.7253 3.27009 4.96671 3.43079C6.42872 3.62004 8.24524 3.72428 10.0818 3.72428Z" fill="#34D399"/>
					<path d="M10.082 8.04847C9.46536 8.04847 8.87357 8.02778 8.30762 7.99121L10.082 16.352L11.8563 7.99121C11.2904 8.02782 10.6986 8.04847 10.082 8.04847Z" fill="#34D399"/>
					<path d="M6.04742 3.88492C5.60405 3.84437 5.18037 3.79731 4.78402 3.74365C3.73508 3.60167 3.15437 3.4568 2.83008 3.33008L3.62808 6.70624L6.04742 3.88492Z" fill="#34D399"/>
					<path d="M12.2028 7.96734L10.4326 16.3084L16.2509 7.33008C15.1406 7.59983 13.779 7.84508 12.2028 7.96734Z" fill="#34D399"/>
					<path d="M16.7281 7.20887L11.3818 15.4589L19.7314 6.15625C19.2695 6.36611 18.6125 6.63452 17.7695 6.9046C17.4591 7.00407 17.1111 7.10714 16.7281 7.20887Z" fill="#34D399"/>
					<path d="M3.91211 7.33008L9.73035 16.3084L7.96014 7.96734C6.38399 7.84504 5.02233 7.59979 3.91211 7.33008Z" fill="#34D399"/>
					<path d="M2.39357 6.9046C1.55059 6.63452 0.893524 6.36611 0.431641 6.15625L8.78123 15.4589L3.43499 7.20887C3.05198 7.10714 2.70398 7.00407 2.39357 6.9046Z" fill="#34D399"/>
					<path d="M3.31381 6.8292L2.47334 3.27344L0 5.57332C0.364207 5.764 1.22261 6.17878 2.50845 6.58979C2.75354 6.66816 3.02249 6.74878 3.31381 6.8292Z" fill="#34D399"/>
					<path d="M1.78207 1.06487C1.84142 1.14328 1.88961 1.23343 1.92864 1.32785C1.96768 1.23347 2.01583 1.14332 2.07522 1.06487C2.21164 0.884688 2.40578 0.753868 2.57995 0.663923C2.40578 0.573979 2.21164 0.443117 2.07522 0.262978C2.01583 0.184569 1.96768 0.0943745 1.92864 0C1.88961 0.0943745 1.84146 0.184528 1.78207 0.262978C1.64565 0.443159 1.45151 0.573979 1.27734 0.663923C1.45151 0.753868 1.64565 0.884688 1.78207 1.06487Z" fill="#34D399"/>
					<path d="M16.8194 12.844C16.76 12.7656 16.7118 12.6754 16.6728 12.5811C16.6337 12.6754 16.5856 12.7656 16.5262 12.844C16.3898 13.0242 16.1957 13.155 16.0215 13.245C16.1957 13.3349 16.3898 13.4658 16.5262 13.6459C16.5856 13.7243 16.6337 13.8145 16.6728 13.9089C16.7118 13.8145 16.76 13.7243 16.8194 13.6459C16.9558 13.4657 17.1499 13.3349 17.3241 13.245C17.1499 13.155 16.9557 13.0242 16.8194 12.844Z" fill="#34D399"/>
					</svg>
					
				</span>', 'sheets-to-wp-table-live-sync' ),// phpcs:ignore	
				'manage_options', 'https://go.wppool.dev/KfVZ', '', 9999
			);

			// Open the link in a new tab.
			add_action('admin_footer', function () {
				echo "<script>
					jQuery(document).ready(function($) {
						$('#toplevel_page_swptls-dashboard .wp-submenu a[href=\"https://go.wppool.dev/KfVZ\"]').attr('target', '_blank');
					});
				</script>";
			});

		}
	}

	/**
	 * Displays admin page.
	 *
	 * @return void
	 */
	public static function dashboard_page() {
		echo '<div id="swptls-app-root"></div>';
		echo '<div id="swptls-app-portal"></div>';
	}
}
