/**
 * Clean GCLID tracking for Google Ads attribution
 * GT-MJKTJGCK integration
 */

const GCLID_KEY = 'gclid';
const GCLID_EXPIRY = 90; // days

export function captureGclid(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const gclid = urlParams.get('gclid');
  
  if (gclid) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + GCLID_EXPIRY);
    
    localStorage.setItem(GCLID_KEY, gclid);
    localStorage.setItem(`${GCLID_KEY}_expiry`, expiry.toISOString());
    
    return gclid;
  }
  
  return null;
}

export function getGclid(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try URL first
  const urlGclid = captureGclid();
  if (urlGclid) return urlGclid;
  
  // Check stored GCLID
  const stored = localStorage.getItem(GCLID_KEY);
  const expiry = localStorage.getItem(`${GCLID_KEY}_expiry`);
  
  if (!stored || !expiry) return null;
  
  if (new Date() > new Date(expiry)) {
    localStorage.removeItem(GCLID_KEY);
    localStorage.removeItem(`${GCLID_KEY}_expiry`);
    return null;
  }
  
  return stored;
}

// Auto-capture on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', captureGclid);
  } else {
    captureGclid();
  }
}