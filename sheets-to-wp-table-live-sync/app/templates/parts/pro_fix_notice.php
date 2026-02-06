<?php
/**
 * Displays pro fix notice.
 *
 * @package SWPTLS
 */

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;
?>

<div class="gswpts-pro-fix-banner">
	<span class="gswpts-pro-fix-close"></span>
	<div class="banner-content">
		<div class="gswpts-pro-fix-wrapper">
			<h3 class="pro-fix-heading">
				<?php esc_html_e("Let's Get Your FlexTable Pro Plugin Updated!", 'sheets-to-wp-table-live-sync'); ?>
			</h3>
			<p class="pro-fix-notice">
				<?php esc_html_e('We’ve noticed a small issue with the pro plugin update process. Just click “Fix Now” button to automatically solve the issue, and everything will be back to normal', 'sheets-to-wp-table-live-sync'); ?>
				<a href="#" class="learn-more-link"><?php esc_html_e('Learn more about what we fixed', 'sheets-to-wp-table-live-sync'); ?></a>
			</p>
			<div class="learn-more-content" style="display: none;">
				<p class="learn-more-text">
					<?php
					/* translators: %s: Link to portal.wppool.dev */
					printf(
						esc_html__('This fix resolves a temporary issue on FlexTable Pro plugin that\'s preventing getting automatic updates. By clicking "Fix Now", the update process will be restored, enabling future auto updates. You can also download the latest version anytime from %s', 'sheets-to-wp-table-live-sync'),
						'<a href="' . esc_url('https://portal.wppool.dev/') . '" target="_blank" rel="noopener noreferrer">' . esc_html__('portal.wppool.dev', 'sheets-to-wp-table-live-sync') . '</a>'
					);
					?>
				</p>
			</div>
			<div class="pro-fix-actions">
				<button class="pro-fix-btn auto-fix-btn" data-action="apply_fix">
					<?php esc_html_e('Fix Now', 'sheets-to-wp-table-live-sync'); ?>
				</button>
				<button class="pro-fix-btn cancel-btn" data-action="cancel">
					<?php esc_html_e('Close', 'sheets-to-wp-table-live-sync'); ?>
				</button>
			</div>
		</div>
	</div>

	<!-- Confirmation popup -->
	<div id="pro-fix-popup" class="pro-fix-popup-container" style="display: none;">
		<div class="pro-fix-popup-content">
			<a href="#" class="close pro-fix-close-button">&times;</a>
			<div class="pro-fix-popup-body">
				<h4><?php esc_html_e('Close without fixing the update?', 'sheets-to-wp-table-live-sync'); ?></h4>
				<p>
					<?php
					/* translators: %s: Link to portal.wppool.dev */
					printf(
						esc_html__('You can update the pro plugin anytime manually by downloading the latest version from your portal at %s', 'sheets-to-wp-table-live-sync'),
						'<a href="' . esc_url('https://portal.wppool.dev/') . '" target="_blank" rel="noopener noreferrer">' . esc_html__('portal.wppool.dev', 'sheets-to-wp-table-live-sync') . '</a>'
					);
					?>
				</p>
				<div class="pro-fix-popup-actions">

					<button class="pro-fix-btn cancel-popup-btn">
						<?php esc_html_e('Cancel', 'sheets-to-wp-table-live-sync'); ?>
					</button>

					<button class="pro-fix-btn decline-btn" data-action="decline_fix">
						<?php esc_html_e('Yes, Close at My Risk!', 'sheets-to-wp-table-live-sync'); ?>
					</button>
					
				</div>
			</div>
		</div>
	</div>
</div>

<style>
.gswpts-pro-fix-banner {
	position: relative;
	background: #fff;
	border: 1px solid #c3c4c7;
	border-left: 4px solid #72aee6;
	box-shadow: 0 1px 1px rgba(0, 0, 0, .04);
	margin-top: 35px;
	width: 97%;
	padding: 1px 12px;
}

.gswpts-pro-fix-banner .banner-content {
	display: flex;
	align-items: center;
	padding: 15px 0;
	position: relative;
}

.gswpts-pro-fix-close {
	position: absolute;
	top: 8px;
	right: 8px;
	width: 20px;
	height: 20px;
	cursor: pointer;
	background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15.8 4.2a1 1 0 0 0-1.4 0L10 8.6 5.6 4.2a1 1 0 0 0-1.4 1.4L8.6 10l-4.4 4.4a1 1 0 1 0 1.4 1.4L10 11.4l4.4 4.4a1 1 0 0 0 1.4-1.4L11.4 10l4.4-4.4a1 1 0 0 0 0-1.4z"/></svg>') no-repeat center;
	background-size: 16px;
	opacity: 0.6;
	z-index: 10;
}

.gswpts-pro-fix-close:hover {
	opacity: 1;
}

.gswpts-pro-fix-image {
	margin-right: 15px;
}

.gswpts-pro-fix-image img {
	width: 40px;
	height: 40px;
}

.gswpts-pro-fix-wrapper {
	flex: 1;
}

.pro-fix-heading {
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
	color: #1d2327;
}

.pro-fix-notice {
	margin: 0 0 15px 0;
	color: #646970;
	font-size: 14px;
	line-height: 1.5;
}

.learn-more-link {
	color: #2271b1;
	text-decoration: none;
	font-size: 13px;
	margin-left: 8px;
	cursor: pointer;
}

.learn-more-link:hover {
	text-decoration: underline;
}

.learn-more-content {
	margin: 0 0 15px 0;
	padding: 12px;
	background: #f8f9fa;
	border-radius: 4px;
}

.learn-more-text {
	margin: 0;
	color: #646970;
	font-size: 13px;
	line-height: 1
}

.pro-fix-actions {
	display: flex;
	gap: 10px;
}

.pro-fix-btn {
	padding: 8px 16px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	text-decoration: none;
	transition: all 0.2s ease;
}

.auto-fix-btn {
	background: #2271b1;
	color: #fff;
}

.auto-fix-btn:hover {
	background: #135e96;
}

.cancel-btn {
	background: #f6f7f7;
	color: #2c3338;
	border: 1px solid #c3c4c7;
}

.cancel-btn:hover {
	background: #f0f0f1;
}

.decline-btn {
	background: #d63638;
	color: #fff;
}

.decline-btn:hover {
	background: #b32d2e;
}

.cancel-popup-btn {
	background: #f6f7f7;
	color: #2c3338;
	border: 1px solid #c3c4c7;
}

.cancel-popup-btn:hover {
	background: #f0f0f1;
}

/* Popup styles */
.pro-fix-popup-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	z-index: 100000;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pro-fix-popup-content {
	background: #fff;
	border-radius: 8px;
	padding: 20px;
	max-width: 500px;
	width: 90%;
	position: relative;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.pro-fix-close-button {
	position: absolute;
	top: 15px;
	right: 20px;
	font-size: 24px;
	color: #666;
	text-decoration: none;
	line-height: 1;
}

.pro-fix-close-button:hover {
	color: #000;
}

.pro-fix-popup-body h4 {
	margin: 0 0 15px 0;
	font-size: 18px;
	color: #1d2327;
}

.pro-fix-popup-body p {
	margin: 0 0 20px 0;
	color: #646970;
	line-height: 1.5;
}

.pro-fix-popup-actions {
	display: flex;
	gap: 10px;
	justify-content: flex-end;
}

/* Loading state */
.pro-fix-btn.loading {
	opacity: 0.6;
	pointer-events: none;
}

.pro-fix-btn.loading::after {
	content: '';
	display: inline-block;
	width: 12px;
	height: 12px;
	margin-left: 8px;
	border: 2px solid transparent;
	border-top: 2px solid currentColor;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>

<script>
jQuery(document).ready(function($) {
	// Handle learn more toggle
	$('.learn-more-link').click(function(e) {
		e.preventDefault();
		var $content = $('.learn-more-content');
		var $link = $(this);
		
		if ($content.is(':visible')) {
			$content.slideUp();
			$link.text('<?php esc_html_e('Learn more about what we fixed', 'sheets-to-wp-table-live-sync'); ?>');
		} else {
			$content.slideDown();
			$link.text('<?php esc_html_e('Show less', 'sheets-to-wp-table-live-sync'); ?>');
		}
	});

	// Close notice when X is clicked
	$('.gswpts-pro-fix-close').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#pro-fix-popup').show();
	});

	// Handle auto fix button
	$('.auto-fix-btn').click(function(e) {
		e.preventDefault();
		var $btn = $(this);
		
		$btn.addClass('loading').text('<?php esc_html_e('Applying Fix...', 'sheets-to-wp-table-live-sync'); ?>');
		
		$.ajax({
			type: "POST",
			url: "<?php echo esc_url(admin_url( 'admin-ajax.php' )); ?>",
			data: {
				action: 'gswpts_pro_fix_action',
				nonce: '<?php echo esc_attr( wp_create_nonce( 'swptls_pro_fix_nonce' ) ); ?>',
				action_type: 'apply_fix'
			},
			success: function(response) {
				if (response.success) {
					$btn.removeClass('loading').text('<?php esc_html_e('Fixed!', 'sheets-to-wp-table-live-sync'); ?>').css('background', '#00a32a');
					setTimeout(function() {
						$('.gswpts-pro-fix-banner').slideUp();
					}, 2000);
				} else {
					$btn.removeClass('loading').text('<?php esc_html_e('Auto Fix', 'sheets-to-wp-table-live-sync'); ?>');
					alert(response.data.message || '<?php esc_html_e('Failed to apply fix. Please try again.', 'sheets-to-wp-table-live-sync'); ?>');
				}
			},
			error: function() {
				$btn.removeClass('loading').text('<?php esc_html_e('Auto Fix', 'sheets-to-wp-table-live-sync'); ?>');
				alert('<?php esc_html_e('An error occurred. Please try again.', 'sheets-to-wp-table-live-sync'); ?>');
			}
		});
	});

	// Handle cancel button - show popup
	$('.cancel-btn').click(function(e) {
		console.log('Cancel button clicked - showing popup');
		e.preventDefault();
		e.stopPropagation(); // Prevent event bubbling
		$('#pro-fix-popup').show();
	});

	// Handle decline button in popup
	$('.decline-btn').click(function(e) {
		e.preventDefault();
		var $btn = $(this);
		
		$btn.addClass('loading').text('<?php esc_html_e('Processing...', 'sheets-to-wp-table-live-sync'); ?>');
		
		$.ajax({
			type: "POST",
			url: "<?php echo esc_url(admin_url( 'admin-ajax.php' )); ?>",
			data: {
				action: 'gswpts_pro_fix_action',
				nonce: '<?php echo esc_attr( wp_create_nonce( 'swptls_pro_fix_nonce' ) ); ?>',
				action_type: 'decline_fix'
			},
			success: function(response) {
				if (response.success) {
					$('#pro-fix-popup').hide();
					$('.gswpts-pro-fix-banner').slideUp();
				} else {
					$btn.removeClass('loading').text('<?php esc_html_e('OK', 'sheets-to-wp-table-live-sync'); ?>');
					alert(response.data.message || '<?php esc_html_e('An error occurred. Please try again.', 'sheets-to-wp-table-live-sync'); ?>');
				}
			},
			error: function() {
				$btn.removeClass('loading').text('<?php esc_html_e('OK', 'sheets-to-wp-table-live-sync'); ?>');
				alert('<?php esc_html_e('An error occurred. Please try again.', 'sheets-to-wp-table-live-sync'); ?>');
			}
		});
	});

	// Handle cancel button in popup - just close popup
	$('.cancel-popup-btn').click(function(e) {
		e.preventDefault();
		$('#pro-fix-popup').hide();
	});

	// Handle close button in popup
	$('.pro-fix-close-button').click(function(e) {
		e.preventDefault();
		$('#pro-fix-popup').hide();
	});

	// Close popup when clicking outside
	$(document).on('click', function(event) {
		// Check if popup is visible first
		if ($('#pro-fix-popup').is(':visible')) {
			var isInsidePopup = $(event.target).closest('.pro-fix-popup-content').length > 0;
			var isCancelBtn = $(event.target).is('.cancel-btn') || $(event.target).closest('.cancel-btn').length > 0;
			var isXIcon = $(event.target).is('.gswpts-pro-fix-close') || $(event.target).closest('.gswpts-pro-fix-close').length > 0;
			
			console.log('Outside click detected:', {
				target: event.target.className,
				isInsidePopup: isInsidePopup,
				isCancelBtn: isCancelBtn,
				isXIcon: isXIcon
			});
			
			if (!isInsidePopup && !isCancelBtn && !isXIcon) {
				console.log('Closing popup due to outside click');
				$('#pro-fix-popup').hide();
			}
		}
	});
});
</script>
