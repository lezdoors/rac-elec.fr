/**
 * GCLID (Google Click Identifier) Tracking System
 * Captures and preserves GCLID parameters for proper Google Ads attribution
 */

interface GclidData {
  gclid: string;
  timestamp: number;
  source_url: string;
  landing_page: string;
}

/**
 * Extract GCLID and other UTM parameters from URL
 */
export function getGclidFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  // SAFARI FIX: Fallback for browsers without URLSearchParams
  let urlParams: URLSearchParams;
  try {
    urlParams = new URLSearchParams(window.location.search);
  } catch (e) {
    // Manual parsing fallback for older browsers
    const search = window.location.search.substring(1);
    const params = new Map<string, string>();
    if (search) {
      search.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
      });
    }
    const gclid = params.get('gclid') || null;
    if (gclid) {
      const utmData = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_term: params.get('utm_term'),
        utm_content: params.get('utm_content')
      };
      if (Object.values(utmData).some(value => value !== null)) {
        try {
          localStorage.setItem('utm_data', JSON.stringify(utmData));
        } catch (storageError) {
          console.warn('⚠️ Could not store UTM data:', storageError);
        }
      }
    }
    return gclid;
  }
  
  const gclid = urlParams.get('gclid');
  
  if (gclid) {
    // Also capture UTM parameters for enhanced attribution
    const utmData = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content')
    };
    
    // Store UTM data alongside GCLID
    if (Object.values(utmData).some(value => value !== null)) {
      localStorage.setItem('utm_data', JSON.stringify(utmData));
    }
  }
  
  return gclid;
}

/**
 * Store GCLID in localStorage with expiration (90 days as per Google recommendation)
 */
export function storeGclid(gclid: string): void {
  if (!gclid) return;
  
  const gclidData: GclidData = {
    gclid,
    timestamp: Date.now(),
    source_url: window.location.href,
    landing_page: window.location.pathname
  };
  
  try {
    localStorage.setItem('gclid_data', JSON.stringify(gclidData));
    console.log('✅ GCLID stored successfully:', gclid);
  } catch (error) {
    console.warn('⚠️ Failed to store GCLID (Safari privacy settings?):', error);
    // SAFARI FIX: Fallback to sessionStorage if localStorage is blocked
    try {
      sessionStorage.setItem('gclid_data', JSON.stringify(gclidData));
      console.log('✅ GCLID stored in sessionStorage as fallback');
    } catch (sessionError) {
      console.warn('⚠️ Storage completely blocked:', sessionError);
    }
  }
}

/**
 * Retrieve stored GCLID if still valid (within 90 days)
 */
export function getStoredGclid(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    let storedData = localStorage.getItem('gclid_data');
    // SAFARI FIX: Fallback to sessionStorage if localStorage fails
    if (!storedData) {
      try {
        storedData = sessionStorage.getItem('gclid_data');
      } catch (e) {
        console.warn('⚠️ Could not access sessionStorage');
      }
    }
    if (!storedData) return null;
    
    const gclidData: GclidData = JSON.parse(storedData);
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    
    // Check if GCLID is still valid (within 90 days)
    if (Date.now() - gclidData.timestamp < ninetyDaysInMs) {
      return gclidData.gclid;
    } else {
      // Clean up expired GCLID
      localStorage.removeItem('gclid_data');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Failed to retrieve stored GCLID:', error);
    return null;
  }
}

/**
 * Get current GCLID (from URL or stored)
 */
export function getCurrentGclid(): string | null {
  // First try to get from current URL
  const urlGclid = getGclidFromUrl();
  if (urlGclid) {
    // Store new GCLID
    storeGclid(urlGclid);
    return urlGclid;
  }
  
  // Fall back to stored GCLID
  return getStoredGclid();
}

/**
 * Initialize GCLID tracking on page load
 */
export function initializeGclidTracking(): void {
  if (typeof window === 'undefined') return;
  
  const gclid = getGclidFromUrl();
  if (gclid && isValidGclid(gclid)) {
    storeGclid(gclid);
    console.log('✅ GCLID tracking initialized:', gclid);
  }
  
  // Always clean up expired data
  cleanupExpiredGclid();
}

/**
 * Add GCLID to conversion tracking
 */
export function addGclidToConversion(conversionData: Record<string, any>): Record<string, any> {
  const gclid = getCurrentGclid();
  
  if (gclid) {
    return {
      ...conversionData,
      gclid: gclid
    };
  }
  
  return conversionData;
}


/**
 * Validate GCLID format (should be alphanumeric and specific length)
 */
export function isValidGclid(gclid: string): boolean {
  if (!gclid || typeof gclid !== 'string') return false;
  
  // GCLID should be alphanumeric and typically 50-100 characters
  const gclidPattern = /^[A-Za-z0-9_-]{20,150}$/;
  return gclidPattern.test(gclid);
}

/**
 * Get stored UTM data
 */
export function getStoredUtmData(): Record<string, string> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('utm_data');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('⚠️ Failed to retrieve UTM data:', error);
    return null;
  }
}

/**
 * Clean up expired GCLID data
 */
export function cleanupExpiredGclid(): void {
  getStoredGclid(); // This will automatically clean up expired data
}

// Auto-initialize GCLID tracking when module loads
if (typeof window !== 'undefined') {
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeGclidTracking();
    });
  } else {
    initializeGclidTracking();
  }
  
  // Clean up expired GCLID on page load
  cleanupExpiredGclid();
}