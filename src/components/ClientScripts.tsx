'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

export default function ClientScripts() {
  useEffect(() => {
    // Initialize scripts after component mounts
    if (typeof window !== 'undefined' && window.jQuery) {
      const $ = window.jQuery;

      // Dropdown on mouse hover
      function toggleNavbarMethod() {
        if ($(window).width() > 992) {
          $('.navbar .dropdown')
            .on('mouseover', function () {
              $('.dropdown-toggle', this).trigger('click');
            })
            .on('mouseout', function () {
              $('.dropdown-toggle', this).trigger('click').blur();
            });
        } else {
          $('.navbar .dropdown').off('mouseover').off('mouseout');
        }
      }
      toggleNavbarMethod();
      $(window).resize(toggleNavbarMethod);

      // Date and time picker - wait for tempusdominus to be loaded
      const initDateTimePicker = () => {
        // Only initialize if datetimepicker is available and elements exist
        if ($.fn.datetimepicker) {
          // Initialize elements with class .date
          const dateElements = $('.date');
          if (dateElements.length > 0) {
            dateElements.datetimepicker({
              format: 'L',
            });
          }
          
          // Initialize elements with class .time
          const timeElements = $('.time');
          if (timeElements.length > 0) {
            timeElements.datetimepicker({
              format: 'LT',
            });
          }
          
          // Initialize elements with data-toggle="datetimepicker"
          const toggleElements = $('[data-toggle="datetimepicker"]');
          if (toggleElements.length > 0) {
            toggleElements.each(function() {
              const $this = $(this);
              // Only initialize if not already initialized
              if (!$this.data('DateTimePicker')) {
                $this.datetimepicker();
              }
            });
          }
        }
      };
      
      // Listen for tempusdominus loaded event
      const handleTempusdominusLoaded = () => {
        // Small delay to ensure everything is ready
        setTimeout(initDateTimePicker, 100);
      };
      
      // Check if already loaded, otherwise wait for event
      let retryInterval: NodeJS.Timeout | null = null;
      if ($.fn.datetimepicker) {
        // Small delay to ensure DOM is ready
        setTimeout(initDateTimePicker, 100);
      } else {
        window.addEventListener('tempusdominus-loaded', handleTempusdominusLoaded);
        // Also try periodically as fallback
        let retryCount = 0;
        retryInterval = setInterval(() => {
          if ($.fn.datetimepicker) {
            initDateTimePicker();
            if (retryInterval) clearInterval(retryInterval);
          } else if (retryCount++ > 50) {
            // Stop retrying after 5 seconds
            if (retryInterval) clearInterval(retryInterval);
          }
        }, 100);
      }
      
      // Cleanup
      return () => {
        window.removeEventListener('tempusdominus-loaded', handleTempusdominusLoaded);
        if (retryInterval) clearInterval(retryInterval);
      };

      // Back to top button
      $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
          $('.back-to-top').fadeIn('slow');
        } else {
          $('.back-to-top').fadeOut('slow');
        }
      });
      $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
      });

      // Price carousel
      if ($.fn.owlCarousel) {
        $('.price-carousel').owlCarousel({
          autoplay: true,
          smartSpeed: 1000,
          margin: 45,
          dots: false,
          loop: true,
          nav: true,
          navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>'],
          responsive: {
            0: {
              items: 1,
            },
            992: {
              items: 2,
            },
            1200: {
              items: 3,
            },
          },
        });

        // Team carousel
        $('.team-carousel, .related-carousel').owlCarousel({
          autoplay: true,
          smartSpeed: 1000,
          margin: 45,
          dots: false,
          loop: true,
          nav: true,
          navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>'],
          responsive: {
            0: {
              items: 1,
            },
            992: {
              items: 2,
            },
          },
        });

        // Testimonials carousel
        $('.testimonial-carousel').owlCarousel({
          autoplay: true,
          smartSpeed: 1000,
          items: 1,
          dots: true,
          loop: true,
        });
      }
    }
  }, []);

  return null;
}

