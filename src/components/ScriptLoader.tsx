'use client';

import Script from 'next/script';

export default function ScriptLoader() {
  return (
    <>
      <Script
        src="https://code.jquery.com/jquery-3.4.1.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
      <Script src="/lib/easing/easing.min.js" strategy="afterInteractive" />
      <Script
        src="/lib/waypoints/waypoints.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/lib/owlcarousel/owl.carousel.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Mark owlCarousel as loaded
          if (typeof window !== 'undefined' && window.jQuery) {
            window.dispatchEvent(new Event('owlcarousel-loaded'));
          }
        }}
      />
      <Script
        src="/js/main.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('main.js loaded');
        }}
      />
    </>
  );
}

