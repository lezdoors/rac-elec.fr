declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    trackFormStart?: (email?: string, phone?: string) => void;
    trackFormSubmit?: (email?: string, phone?: string) => void;
    trackPurchase?: (transactionId?: string, email?: string, phone?: string) => void;
  }
}

// Wrapper functions that call the GTM dataLayer functions defined in index.html
export const trackFormStart = (email?: string, phone?: string) => {
  if (typeof window !== 'undefined' && window.trackFormStart) {
    window.trackFormStart(email, phone);
  }
};

export const trackFormSubmit = (email?: string, phone?: string) => {
  if (typeof window !== 'undefined' && window.trackFormSubmit) {
    window.trackFormSubmit(email, phone);
  }
};

export const trackPurchase = (transactionId?: string, email?: string, phone?: string) => {
  if (typeof window !== 'undefined' && window.trackPurchase) {
    window.trackPurchase(transactionId, email, phone);
  }
};

export {};
