import { useEffect } from 'react';

/**
 * GTM Analytics Provider - Validates GTM-only setup
 * NO direct gtag.js - all analytics flow through GTM-T2VZD5DL
 */
export function GoogleAnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verify GTM dataLayer is available (GTM-only setup)
      if (window.dataLayer) {
        console.log('✅ GTM dataLayer available - analytics ready');
        
        // Send app initialization event via dataLayer
        window.dataLayer.push({
          event: 'app_initialized',
          app_name: 'RaccordementConnect',
          app_version: '2.0.0'
        });
      } else {
        console.warn('⚠️ GTM dataLayer not found - check GTM container GTM-T2VZD5DL');
      }
      
      // Warn if legacy gtag() exists (should not be present in GTM-only setup)
      if (typeof window.gtag === 'function') {
        console.warn('⚠️ Legacy gtag() detected - should use GTM dataLayer only');
      }
    }
  }, []);
  
  return <>{children}</>;
}

export default GoogleAnalyticsProvider;