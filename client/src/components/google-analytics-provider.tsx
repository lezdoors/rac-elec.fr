import { useEffect } from 'react';

/**
 * GTM Analytics Provider for demande-raccordement.fr
 * GTM: GTM-K597C4C2 | GA4: G-D92SQT9L1P | Google Ads: AW-16683623620
 */
export function GoogleAnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verify GTM dataLayer is available
      if (window.dataLayer) {
        console.log('GTM dataLayer available - analytics ready');
        
        // Send app initialization event via dataLayer
        window.dataLayer.push({
          event: 'app_initialized',
          app_name: 'DemandeRaccordement',
          app_version: '2.0.0'
        });
      } else {
        console.warn('GTM dataLayer not found - check GTM container GTM-K597C4C2');
      }
    }
  }, []);
  
  return <>{children}</>;
}

export default GoogleAnalyticsProvider;