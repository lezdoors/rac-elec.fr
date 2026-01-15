declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GOOGLE_ADS_ID = 'AW-16683623620';
const CONVERSION_LABELS = {
  PURCHASE: 'asGUCJix06gbEMTJr5M-',
} as const;

const hashEmail = (email: string): string => {
  const normalized = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const getDedupeKey = (event: string, identifier: string): string => {
  return `tracking_${event}_${identifier}`;
};

const isDuplicate = (key: string): boolean => {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(key) === 'true';
};

const markFired = (key: string): void => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, 'true');
  }
};

const fireGtagConversion = (conversionLabel: string, data: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;
  
  if ((window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
      ...data,
    });
  }
  
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: data.event_name || 'conversion',
      send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
      ...data,
    });
  }
};

export const trackFormStart = (email: string, phone?: string): boolean => {
  if (typeof window === 'undefined') return false;
  if (!email || !email.includes('@')) {
    console.warn('⚠️ trackFormStart: valid email required');
    return false;
  }

  // SIMPLIFIED: Single flag per session - form_start fires ONCE per session, regardless of email
  const dedupeKey = 'tracking_form_start_fired';

  if (isDuplicate(dedupeKey)) {
    console.log(`ℹ️ form_start already fired this session (skipped)`);
    return false;
  }

  markFired(dedupeKey);

  // Push to dataLayer for analytics only (NOT a conversion)
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: 'form_start',
      user_data: {
        email: email.toLowerCase().trim(),
        phone_number: phone?.replace(/\s/g, '') || undefined,
      },
    });
  }

  console.log(`✅ form_start fired ONCE [session dedupe] (analytics only, not conversion)`);
  return true;
};

export const trackFormSubmit = (reference: string, email?: string, phone?: string): boolean => {
  if (typeof window === 'undefined') return false;
  if (!reference) {
    console.warn('⚠️ trackFormSubmit: reference required');
    return false;
  }

  const dedupeKey = getDedupeKey('form_submit', reference);

  if (isDuplicate(dedupeKey)) {
    console.log(`ℹ️ form_submit already fired for ${reference} (skipped)`);
    return false;
  }

  markFired(dedupeKey);

  if (email) {
    sessionStorage.setItem('ec_email', email.toLowerCase().trim());
  }
  if (phone) {
    sessionStorage.setItem('ec_phone', phone.replace(/\s/g, ''));
  }

  // Push to dataLayer for analytics only (NOT a conversion)
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: 'form_submit',
      transaction_id: reference,
      user_data: {
        email: email?.toLowerCase().trim() || undefined,
        phone_number: phone?.replace(/\s/g, '') || undefined,
      },
    });
  }

  console.log(`✅ form_submit fired [ref: ${reference}] (analytics only, not conversion)`);
  return true;
};

const getGclidValue = (): string | null => {
  if (typeof window === 'undefined') return null;
  const storedGclid = localStorage.getItem('gclid');
  if (storedGclid) return storedGclid;
  const urlGclid = new URLSearchParams(window.location.search).get('gclid');
  return urlGclid;
};

export interface PurchaseUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export const trackPurchase = (
  reference: string, 
  amount: number = 129.80, 
  userData?: PurchaseUserData
): boolean => {
  if (typeof window === 'undefined') return false;
  if (!reference) {
    console.warn('⚠️ trackPurchase: reference required');
    return false;
  }

  const dedupeKey = getDedupeKey('purchase', reference);

  if (isDuplicate(dedupeKey)) {
    console.log(`ℹ️ purchase already fired for ${reference} (skipped)`);
    return false;
  }

  markFired(dedupeKey);

  let userEmail = userData?.email;
  let userPhone = userData?.phone;
  if (typeof sessionStorage !== 'undefined') {
    if (!userEmail) userEmail = sessionStorage.getItem('ec_email') || undefined;
    if (!userPhone) userPhone = sessionStorage.getItem('ec_phone') || undefined;
    sessionStorage.removeItem('ec_email');
    sessionStorage.removeItem('ec_phone');
  }

  const gclid = getGclidValue();

  console.log('🔍 PURCHASE CONVERSION:', {
    reference,
    value: amount,
    gclid: gclid,
    userData: userData,
    timestamp: new Date().toISOString(),
  });

  // 1. Fire Google Ads conversion via gtag
  fireGtagConversion(CONVERSION_LABELS.PURCHASE, {
    event_name: 'purchase',
    transaction_id: reference,
    value: amount,
    currency: 'EUR',
    gclid: gclid || undefined,
    user_data: {
      email: userEmail?.toLowerCase().trim() || undefined,
      phone_number: userPhone?.replace(/\s/g, '') || undefined,
    },
  });

  // 2. Push DIRECT purchase event to dataLayer for GTM (exact format expected)
  if (Array.isArray(window.dataLayer)) {
    const purchaseEvent: Record<string, any> = {
      event: 'purchase',
      transaction_id: reference,
      value: amount,
      currency: 'EUR',
    };
    
    // Add user_data with Enhanced Conversions format
    const userDataPayload: Record<string, any> = {};
    if (userEmail) userDataPayload.email = userEmail.toLowerCase().trim();
    if (userPhone) userDataPayload.phone_number = userPhone.replace(/\s/g, '');
    if (userData?.firstName) userDataPayload.address_first_name = userData.firstName;
    if (userData?.lastName) userDataPayload.address_last_name = userData.lastName;
    if (userData?.city) userDataPayload.address_city = userData.city;
    if (userData?.postalCode) userDataPayload.address_postal_code = userData.postalCode;
    if (userData?.country) userDataPayload.address_country = userData.country || 'FR';
    
    if (Object.keys(userDataPayload).length > 0) {
      purchaseEvent.user_data = userDataPayload;
    }
    
    window.dataLayer.push(purchaseEvent);
    console.log('🎯 GTM dataLayer.push:', purchaseEvent);
  }

  console.log(`✅ purchase fired [ref: ${reference}, €${amount}, gclid: ${gclid || 'none'}]`);
  return true;
};

// Track form step progress (informational, NOT a conversion)
export const trackFormStep = (stepNumber: number, stepName: string): void => {
  if (typeof window === 'undefined') return;
  
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: 'form_step',
      step_number: stepNumber,
      step_name: stepName,
    });
    console.log(`📊 form_step fired [step ${stepNumber}: ${stepName}]`);
  }
};

export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
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
