(function ($) {
  "use strict";

  // Dropdown on mouse hover
  $(document).ready(function () {
    function toggleNavbarMethod() {
      if ($(window).width() > 992) {
        $(".navbar .dropdown")
          .on("mouseover", function () {
            $(".dropdown-toggle", this).trigger("click");
          })
          .on("mouseout", function () {
            $(".dropdown-toggle", this).trigger("click").blur();
          });
      } else {
        $(".navbar .dropdown").off("mouseover").off("mouseout");
      }
    }
    toggleNavbarMethod();
    $(window).resize(toggleNavbarMethod);
  });

  // Date and time picker - only initialize if datetimepicker is available
  function initDateTimePicker() {
    if ($.fn.datetimepicker) {
      $(".date").datetimepicker({
        format: "L",
      });
      $(".time").datetimepicker({
        format: "LT",
      });
      $('[data-toggle="datetimepicker"]').each(function () {
        var $this = $(this);
        if (!$this.data("DateTimePicker")) {
          $this.datetimepicker();
        }
      });
    }
  }

  // Try to initialize immediately, or wait for tempusdominus to load
  if ($.fn.datetimepicker) {
    $(document).ready(initDateTimePicker);
  } else {
    // Listen for tempusdominus loaded event
    $(window).on("tempusdominus-loaded", function () {
      setTimeout(initDateTimePicker, 100);
    });

    // Also retry periodically as fallback
    var retryCount = 0;
    var retryInterval = setInterval(function () {
      if ($.fn.datetimepicker) {
        initDateTimePicker();
        clearInterval(retryInterval);
      } else if (retryCount++ > 50) {
        clearInterval(retryInterval);
      }
    }, 100);
  }

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Initialize owlCarousel - wait for it to be loaded
  function initOwlCarousel() {
    if (!$.fn.owlCarousel) {
      // Retry after a short delay if owlCarousel is not yet loaded
      setTimeout(initOwlCarousel, 100);
      return;
    }

    // Price carousel
    if ($(".price-carousel").length > 0) {
      $(".price-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 45,
        dots: false,
        loop: true,
        nav: true,
        navText: [
          '<i class="bi bi-arrow-left"></i>',
          '<i class="bi bi-arrow-right"></i>',
        ],
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
    }

    // Team carousel
    if ($(".team-carousel, .related-carousel").length > 0) {
      $(".team-carousel, .related-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 45,
        dots: false,
        loop: true,
        nav: true,
        navText: [
          '<i class="bi bi-arrow-left"></i>',
          '<i class="bi bi-arrow-right"></i>',
        ],
        responsive: {
          0: {
            items: 1,
          },
          992: {
            items: 2,
          },
        },
      });
    }

    // Testimonials carousel
    if ($(".testimonial-carousel").length > 0) {
      $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
      });
    }
  }

  // Initialize when document is ready
  $(document).ready(function () {
    // Try to initialize immediately
    initOwlCarousel();

    // Also set a timeout as fallback (max 5 seconds)
    var retryCount = 0;
    var maxRetries = 50;
    var retryInterval = setInterval(function () {
      if ($.fn.owlCarousel) {
        initOwlCarousel();
        clearInterval(retryInterval);
      } else if (retryCount++ >= maxRetries) {
        console.warn("owlCarousel failed to load after 5 seconds");
        clearInterval(retryInterval);
      }
    }, 100);
  });
})(jQuery);
