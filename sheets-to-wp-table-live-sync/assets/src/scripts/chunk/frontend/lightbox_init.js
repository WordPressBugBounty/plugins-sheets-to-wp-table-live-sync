/**
 * Image Lightbox functionality for GSWPTS tables
 * Handles click events on images with lightbox support
 */

jQuery(document).ready(function ($) {
    class ImageLightbox {
        constructor() {
            this.lightboxId = 'swptls-image-lightbox';
            this.isOpen = false;
            this.currentImage = null;

            this.init();
        }

        init() {
            this.createLightboxHTML();
            this.bindEvents();
        }

        createLightboxHTML() {
            // Remove existing lightbox if any
            $('#' + this.lightboxId).remove();

            const lightboxHTML = `
                <div id="${this.lightboxId}" class="swptls-lightbox-overlay" style="display: none;">
                    <div class="swptls-lightbox-container">
                        <div class="swptls-lightbox-header">
                            <button class="swptls-lightbox-close" aria-label="Close lightbox">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="swptls-lightbox-content">
                            <img class="swptls-lightbox-image" src="" alt="Lightbox Image" />
                            <div class="swptls-lightbox-loading">
                                <div class="swptls-spinner"></div>
                                <span>Loading image...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $('body').append(lightboxHTML);
        }

        bindEvents() {
            const self = this;

            // Handle clicks on lightbox images - ONLY in table cells, NOT in buttons
            $(document).on('click', 'td .swptls-lightbox-image[data-lightbox-src]', function (e) {
                if ($(this).closest('button, .dt-button, .dt-buttons, .dataTables_wrapper .dt-button').length > 0) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();

                const imageSrc = $(this).attr('data-lightbox-src');
                if (imageSrc) {
                    self.openLightbox(imageSrc);
                }
            });

            // Close lightbox events
            $(document).on('click', '#' + this.lightboxId + ' .swptls-lightbox-close', function (e) {
                e.preventDefault();
                self.closeLightbox();
            });

            // Close on overlay click
            $(document).on('click', '#' + this.lightboxId + ' .swptls-lightbox-overlay', function (e) {
                if (e.target === this) {
                    self.closeLightbox();
                }
            });

            // Close on escape key
            $(document).on('keydown', function (e) {
                if (e.key === 'Escape' && self.isOpen) {
                    self.closeLightbox();
                }
            });

            // Prevent scrolling when lightbox is open
            $(document).on('wheel touchmove', '#' + this.lightboxId, function (e) {
                if (self.isOpen) {
                    e.preventDefault();
                }
            });
        }

        openLightbox(imageSrc) {
            const $lightbox = $('#' + this.lightboxId);
            const $lightboxImage = $lightbox.find('.swptls-lightbox-image');
            const $loading = $lightbox.find('.swptls-lightbox-loading');

            this.isOpen = true;
            this.currentImage = imageSrc;

            // Show lightbox and loading state
            $lightbox.fadeIn(300);
            $loading.show();
            $lightboxImage.hide();

            // Prevent body scrolling
            $('body').addClass('swptls-lightbox-open');

            // Load the image
            const img = new Image();

            img.onload = () => {
                $lightboxImage.attr('src', imageSrc);
                $loading.hide();
                $lightboxImage.fadeIn(300);
            };

            img.onerror = () => {
                $loading.html('<span style="color: #ff6b6b;">Failed to load image</span>');
                setTimeout(() => {
                    this.closeLightbox();
                }, 2000);
            };

            img.src = imageSrc;
        }

        closeLightbox() {
            const $lightbox = $('#' + this.lightboxId);

            this.isOpen = false;
            this.currentImage = null;

            // Hide lightbox
            $lightbox.fadeOut(300);

            // Restore body scrolling
            $('body').removeClass('swptls-lightbox-open');

            // Reset image
            setTimeout(() => {
                $lightbox.find('.swptls-lightbox-image').attr('src', '').hide();
                $lightbox.find('.swptls-lightbox-loading').show();
            }, 300);
        }

        // Method to reinitialize for dynamically loaded content
        reinitialize() {
            console.log('ImageLightbox: Reinitialized for new content');
        }
    }

    // Initialize the lightbox
    const lightbox = new ImageLightbox();

    // Make it globally available for other scripts to reinitialize if needed
    window.swptlsImageLightbox = lightbox;
});