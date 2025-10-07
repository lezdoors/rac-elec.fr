// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Clean analytics for GT-MJKTJGCK only
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track events with new Google tag
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};


// Track form_start conversion when user clicks CTA to access form
export const trackFormStart = () => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'form_start', {
    event_category: 'engagement',
    event_label: 'raccordement_form',
  });
  
  console.log('✅ Form start tracked');
};

// SHA-256 hashing utility function
async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Track to prevent duplicate enhanced conversion calls
let enhancedConversionSent = false;

// Enhanced Conversions for Google Ads with SHA-256 hashing (GDPR compliant)
export const trackEnhancedConversion = async (email?: string, phone?: string) => {
  // Only run in browser environment
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('⚠️ Enhanced conversion: gtag not available');
    return;
  }
  
  // Check for ad_storage consent (Consent Mode v2)
  // Google Ads Enhanced Conversions require ad_storage consent
  if (typeof window.dataLayer !== 'undefined') {
    const consentState = window.dataLayer.find((item: any) => 
      item[0] === 'consent' && item[1] === 'default'
    );
    
    // If consent is explicitly denied, skip
    if (consentState && consentState[2]?.ad_storage === 'denied') {
      console.log('⚠️ Enhanced conversion skipped: ad_storage consent denied');
      return;
    }
  }
  
  // Prevent duplicate submissions
  if (enhancedConversionSent) {
    console.log('⚠️ Enhanced conversion already sent, skipping duplicate');
    return;
  }
  
  // Validate at least one parameter is provided
  if (!email && !phone) {
    console.warn('⚠️ Enhanced conversion: no email or phone provided');
    return;
  }
  
  try {
    const userData: Record<string, string> = {};
    
    // Hash email if provided (SHA-256)
    if (email && email.trim()) {
      const hashedEmail = await sha256Hash(email);
      userData.email = hashedEmail;
    }
    
    // Hash phone if provided (SHA-256)
    if (phone && phone.trim()) {
      // Remove all non-digit characters for consistent hashing
      const cleanPhone = phone.replace(/\D/g, '');
      const hashedPhone = await sha256Hash(cleanPhone);
      userData.phone_number = hashedPhone;
    }
    
    // Send enhanced conversion data to Google Ads
    // This respects Consent Mode v2 as gtag automatically handles consent
    window.gtag('set', 'user_data', userData);
    
    // Mark as sent to prevent duplicates
    enhancedConversionSent = true;
    
    console.log('✅ Enhanced conversion data sent (hashed):', {
      email: userData.email ? 'hashed' : 'not provided',
      phone: userData.phone_number ? 'hashed' : 'not provided'
    });
  } catch (error) {
    console.error('❌ Enhanced conversion error:', error);
  }
};

// Reset enhanced conversion flag (useful for testing or multi-step forms)
export const resetEnhancedConversion = () => {
  enhancedConversionSent = false;
  console.log('🔄 Enhanced conversion flag reset');
};