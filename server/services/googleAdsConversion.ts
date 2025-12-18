import { GoogleAdsApi, enums } from 'google-ads-api';
import crypto from 'crypto';

const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;
const GOOGLE_ADS_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

const CONVERSION_ACTION_ID = '16683623620';

function hashSHA256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '+33' + cleaned.substring(1);
  } else if (cleaned.startsWith('33') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+33' + cleaned;
  }
  
  return cleaned;
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

export interface ConversionData {
  gclid?: string;
  reference: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  postalCode?: string;
  amount?: number;
}

export async function sendGoogleAdsConversion(data: ConversionData): Promise<boolean> {
  console.log('🔄 Initializing Google Ads conversion...', {
    reference: data.reference,
    hasGclid: !!data.gclid,
    hasEmail: !!data.email,
    hasPhone: !!data.phone
  });

  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN || 
      !GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
    console.error('❌ Google Ads API credentials missing');
    return false;
  }

  if (!data.gclid && !data.email && !data.phone) {
    console.warn('⚠️ No gclid or user identifiers provided - cannot send conversion');
    return false;
  }

  try {
    const client = new GoogleAdsApi({
      client_id: GOOGLE_ADS_CLIENT_ID,
      client_secret: GOOGLE_ADS_CLIENT_SECRET,
      developer_token: GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: GOOGLE_ADS_CUSTOMER_ID,
      login_customer_id: GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
    });

    console.log('🔐 Hashing user data...');
    
    const userIdentifiers: any[] = [];
    
    if (data.email) {
      userIdentifiers.push({
        hashed_email: hashSHA256(normalizeEmail(data.email)),
      });
    }
    
    if (data.phone) {
      userIdentifiers.push({
        hashed_phone_number: hashSHA256(normalizePhone(data.phone)),
      });
    }
    
    if (data.firstName || data.lastName || data.city || data.postalCode) {
      const addressInfo: any = {
        country_code: 'FR',
      };
      
      if (data.firstName) {
        addressInfo.hashed_first_name = hashSHA256(normalizeName(data.firstName));
      }
      if (data.lastName) {
        addressInfo.hashed_last_name = hashSHA256(normalizeName(data.lastName));
      }
      if (data.city) {
        addressInfo.city = data.city;
      }
      if (data.postalCode) {
        addressInfo.postal_code = data.postalCode;
      }
      
      userIdentifiers.push({
        address_info: addressInfo,
      });
    }

    const conversionDateTime = new Date().toISOString().replace('T', ' ').split('.')[0] + '+00:00';
    
    const conversionAction = `customers/${GOOGLE_ADS_CUSTOMER_ID}/conversionActions/${CONVERSION_ACTION_ID}`;

    const clickConversion: any = {
      conversion_action: conversionAction,
      conversion_date_time: conversionDateTime,
      conversion_value: data.amount || 129.80,
      currency_code: 'EUR',
      order_id: data.reference,
    };

    if (data.gclid) {
      clickConversion.gclid = data.gclid;
      console.log('📌 Using GCLID for attribution');
    }

    if (userIdentifiers.length > 0) {
      clickConversion.user_identifiers = userIdentifiers;
      console.log(`📌 Using ${userIdentifiers.length} user identifier(s) for Enhanced Conversions`);
    }

    console.log('📤 Sending conversion to Google Ads API...', {
      conversion_action: conversionAction,
      order_id: data.reference,
      value: clickConversion.conversion_value,
      hasGclid: !!clickConversion.gclid,
      userIdentifiersCount: userIdentifiers.length
    });

    const response = await customer.conversionUploads.uploadClickConversions({
      customer_id: GOOGLE_ADS_CUSTOMER_ID!,
      conversions: [clickConversion],
      partial_failure: true,
    });

    if (response.partial_failure_error) {
      console.error('⚠️ Partial failure in conversion upload:', JSON.stringify(response.partial_failure_error));
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.gclid || result.order_id) {
        console.log(`✅ Google Ads conversion sent successfully for ${data.reference}`, {
          gclid: result.gclid,
          order_id: result.order_id,
          conversion_action: result.conversion_action,
          conversion_date_time: result.conversion_date_time
        });
        return true;
      }
    }

    console.log(`✅ Google Ads conversion request completed for ${data.reference}`);
    return true;

  } catch (error: any) {
    console.error(`❌ Error sending Google Ads conversion for ${data.reference}:`, error.message);
    
    if (error.errors) {
      console.error('API Errors:', JSON.stringify(error.errors, null, 2));
    }
    
    return false;
  }
}

export async function testGoogleAdsConnection(): Promise<boolean> {
  console.log('🧪 Testing Google Ads API connection...');
  
  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN || 
      !GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
    console.error('❌ Google Ads API credentials missing');
    return false;
  }

  try {
    const client = new GoogleAdsApi({
      client_id: GOOGLE_ADS_CLIENT_ID,
      client_secret: GOOGLE_ADS_CLIENT_SECRET,
      developer_token: GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: GOOGLE_ADS_CUSTOMER_ID,
      login_customer_id: GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
    });

    const query = `SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1`;
    const results = await customer.query(query);
    
    if (results && results.length > 0) {
      console.log('✅ Google Ads API connection successful:', results[0]);
      return true;
    }
    
    console.log('✅ Google Ads API connection successful (no results returned)');
    return true;

  } catch (error: any) {
    console.error('❌ Google Ads API connection failed:', error.message);
    return false;
  }
}
