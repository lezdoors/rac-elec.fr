declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GOOGLE_ADS_ID = 'AW-16683623620';
const CONVERSION_LABELS = {
  FORM_START: 'xhTDCODCy6gbEMTJr5M-',
  FORM_SUBMIT: '20wfCK-NyqgbEMTJr5M-',
  PURCHASE: 'b5XPCPfuirYbEMTJr5M-',
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

  const emailHash = hashEmail(email);
  const dedupeKey = getDedupeKey('form_start', emailHash);

  if (isDuplicate(dedupeKey)) {
    console.log(`ℹ️ form_start already fired for ${emailHash} (skipped)`);
    return false;
  }

  markFired(dedupeKey);

  fireGtagConversion(CONVERSION_LABELS.FORM_START, {
    event_name: 'form_start',
    user_data: {
      email: email.toLowerCase().trim(),
      phone_number: phone?.replace(/\s/g, '') || undefined,
    },
  });

  console.log(`✅ form_start fired [dedupe: ${emailHash}]`);
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

  fireGtagConversion(CONVERSION_LABELS.FORM_SUBMIT, {
    event_name: 'form_submit',
    transaction_id: reference,
    user_data: {
      email: email?.toLowerCase().trim() || undefined,
      phone_number: phone?.replace(/\s/g, '') || undefined,
    },
  });

  console.log(`✅ form_submit fired [ref: ${reference}]`);
  return true;
};

export const trackPurchase = (reference: string, amount: number = 129.80, email?: string, phone?: string): boolean => {
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

  let userEmail = email;
  let userPhone = phone;
  if (typeof sessionStorage !== 'undefined') {
    if (!userEmail) userEmail = sessionStorage.getItem('ec_email') || undefined;
    if (!userPhone) userPhone = sessionStorage.getItem('ec_phone') || undefined;
    sessionStorage.removeItem('ec_email');
    sessionStorage.removeItem('ec_phone');
  }

  fireGtagConversion(CONVERSION_LABELS.PURCHASE, {
    event_name: 'purchase',
    transaction_id: reference,
    value: amount,
    currency: 'EUR',
    user_data: {
      email: userEmail?.toLowerCase().trim() || undefined,
      phone_number: userPhone?.replace(/\s/g, '') || undefined,
    },
  });

  console.log(`✅ purchase fired [ref: ${reference}, €${amount}]`);
  return true;
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
