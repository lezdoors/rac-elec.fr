declare global {
  interface Window {
    dataLayer: any[];
    trackFormStart?: (email?: string, phone?: string) => void;
    trackFormSubmit?: (email?: string, phone?: string) => void;
    trackPurchase?: (transactionId?: string, email?: string, phone?: string) => void;
  }
}

// Session storage keys for deduplication
const SESSION_KEYS = {
  FORM_START: 'gtm_form_start_fired',
  FORM_SUBMIT: 'gtm_form_submit_fired',
} as const;

// Wrapper functions that call the GTM dataLayer functions defined in index.html
// WITH sessionStorage guards to prevent duplicate fires

export const trackFormStart = (email?: string, phone?: string) => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
  
  // Guard: only fire once per session
  if (sessionStorage.getItem(SESSION_KEYS.FORM_START)) {
    console.log('ℹ️ trackFormStart already fired this session (skipped)');
    return;
  }
  
  if (window.trackFormStart) {
    sessionStorage.setItem(SESSION_KEYS.FORM_START, 'true');
    window.trackFormStart(email, phone);
    console.log('✅ trackFormStart fired (session guard active)');
  }
};

export const trackFormSubmit = (email?: string, phone?: string) => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
  
  // Guard: only fire once per session
  if (sessionStorage.getItem(SESSION_KEYS.FORM_SUBMIT)) {
    console.log('ℹ️ trackFormSubmit already fired this session (skipped)');
    return;
  }
  
  if (window.trackFormSubmit) {
    sessionStorage.setItem(SESSION_KEYS.FORM_SUBMIT, 'true');
    window.trackFormSubmit(email, phone);
    console.log('✅ trackFormSubmit fired (session guard active)');
  }
};

export const trackPurchase = (transactionId?: string, email?: string, phone?: string) => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
  
  // Guard: only fire once per transaction
  const purchaseKey = `purchase_conversion_${transactionId || 'unknown'}`;
  if (sessionStorage.getItem(purchaseKey)) {
    console.log('ℹ️ trackPurchase already fired for this transaction (skipped)');
    return;
  }
  
  if (window.trackPurchase) {
    sessionStorage.setItem(purchaseKey, 'true');
    window.trackPurchase(transactionId, email, phone);
    console.log('✅ trackPurchase fired (session guard active)');
  }
};

// Generic event tracking (for backward compatibility - events now flow through GTM)
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  // Events now tracked via GTM dataLayer - this is a no-op for backward compatibility
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'custom_event',
      event_action: action,
      event_category: category,
      event_label: label,
      event_value: value
    });
  }
};

export {};
