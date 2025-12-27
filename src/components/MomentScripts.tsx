'use client';

import Script from 'next/script';

export default function MomentScripts() {
  const loadMomentTimezone = () => {
    if (typeof window === 'undefined') return;
    
    const timezoneScript = document.createElement('script');
    timezoneScript.id = 'moment-timezone-js';
    timezoneScript.src = '/lib/tempusdominus/js/moment-timezone.min.js';
    timezoneScript.onload = () => {
      // Load tempusdominus only after moment-timezone is loaded
      if ((window as any).moment && (window as any).moment.tz) {
        // Ensure jQuery is available before loading tempusdominus
        if (!(window as any).jQuery && !(window as any).$) {
          console.warn('jQuery is not available, waiting...');
          setTimeout(() => {
            if ((window as any).jQuery || (window as any).$) {
              loadTempusdominus();
            }
          }, 500);
          return;
        }
        loadTempusdominus();
      }
    };
    timezoneScript.onerror = () => {
      console.error('Failed to load moment-timezone.js');
    };
    document.body.appendChild(timezoneScript);
  };
  
  const loadTempusdominus = () => {
    if (typeof window === 'undefined') return;
    
    const tempusScript = document.createElement('script');
    tempusScript.id = 'tempusdominus-js';
    tempusScript.src = '/lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js';
    tempusScript.onload = () => {
      // Dispatch custom event when tempusdominus is loaded
      if (typeof window !== 'undefined') {
        // Verify datetimepicker is available
        const $ = (window as any).jQuery || (window as any).$;
        if ($ && $.fn && $.fn.datetimepicker) {
          window.dispatchEvent(new Event('tempusdominus-loaded'));
        } else {
          console.warn('datetimepicker not found after loading tempusdominus');
        }
      }
    };
    tempusScript.onerror = () => {
      console.error('Failed to load tempusdominus-bootstrap-4.js');
    };
    document.body.appendChild(tempusScript);
  };

  return (
    <>
      <Script
        id="moment-js"
        src="/lib/tempusdominus/js/moment.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Load moment-timezone only after moment is fully loaded
          if (typeof window !== 'undefined' && (window as any).moment && (window as any).moment.version) {
            // Ensure jQuery is available
            if (!(window as any).jQuery && !(window as any).$) {
              console.warn('jQuery is not available yet, waiting...');
              setTimeout(() => {
                if ((window as any).jQuery || (window as any).$) {
                  loadMomentTimezone();
                }
              }, 500);
              return;
            }
            loadMomentTimezone();
          }
        }}
      />
    </>
  );
}
