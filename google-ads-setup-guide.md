# Google Ads Setup Guide for Raccordement-Elec.fr

## 🎯 Complete Google Ads Integration

Your Google Ads conversion tracking system is now ready! Here's how to configure it:

### 1. Configuration Required

Open `public/google-ads-conversion.js` and replace these values with your actual Google Ads account information:

```javascript
const GOOGLE_ADS_CONFIG = {
  conversionId: 'AW-XXXXXXXXXX',        // Your Google Ads Conversion ID
  conversionLabel: 'XXXXXXXXXXXXXX',    // Your Conversion Label
  currency: 'EUR',
  value: 1.0
};
```

### 2. Conversion Types Tracked

The system automatically tracks these conversions:

#### 📋 **Form Submissions**
- Connection request forms
- Contact forms
- Service inquiries
- **Automatic**: Triggers when any form is submitted

#### 📞 **Phone Calls**
- Clicks on phone numbers (tel: links)
- **Current number**: 07 90 90 16 43
- **Automatic**: Triggers on phone link clicks

#### 📧 **Email Contacts**
- Clicks on email addresses (mailto: links)
- Contact form submissions
- **Automatic**: Triggers on email interactions

#### 💳 **Payment Completions**
- Stripe payment confirmations
- Service purchases
- **Manual trigger**: Call `trackPaymentCompletion()` after successful payment

### 3. How to Get Your Google Ads IDs

1. **Log into Google Ads**
2. **Go to Tools & Settings > Conversions**
3. **Create or select your conversion action**
4. **Copy the Conversion ID and Label**

Example format:
- Conversion ID: `AW-123456789`
- Conversion Label: `abc123DEF456ghi789`

### 4. Advanced Tracking Features

#### Custom Event Tracking
```javascript
// Track specific user actions
window.GoogleAdsTracking.trackFormSubmission({
  formType: 'connection_request',
  userType: 'residential',
  serviceType: 'new_connection'
});
```

#### Payment Tracking
```javascript
// Track completed payments
window.GoogleAdsTracking.trackPaymentCompletion({
  amount: 150.00,
  transactionId: 'stripe_payment_123',
  method: 'stripe',
  serviceType: 'electrical_connection'
});
```

### 5. Testing Your Setup

1. **Open browser developer tools**
2. **Visit your site**
3. **Check console for**: `Google Ads conversion tracking initialized`
4. **Perform test actions** (submit form, click phone)
5. **Verify conversions** in Google Ads (may take up to 24 hours)

### 6. Conversion Labels to Set Up

Create these conversion actions in Google Ads:

| Action | Suggested Name | Value |
|--------|----------------|-------|
| Form submission | Connection Request | €5.00 |
| Phone call | Phone Contact | €3.00 |
| Email contact | Email Inquiry | €2.00 |
| Payment completion | Service Purchase | Actual amount |

### 7. Performance Optimization

#### High-Value Conversions
- **Connection requests**: €50+ value
- **Phone consultations**: €25+ value
- **Service purchases**: Actual payment amount

#### Attribution Settings
- **Click-through window**: 30 days
- **View-through window**: 1 day
- **Data-driven attribution**: Recommended

### 8. Privacy Compliance

✅ **GDPR Compliant**: Tracking only activates after user consent
✅ **Cookie Policy**: Integrated with your privacy policy
✅ **Opt-out Support**: Users can disable tracking

### 9. Monitoring & Analytics

Check these metrics in Google Ads:
- **Conversion rate**
- **Cost per conversion**
- **Return on ad spend (ROAS)**
- **Attribution reports**

### 10. Support

If you need help with setup:
- Review Google Ads Help Center
- Contact Google Ads support
- Check browser console for error messages

---

## 🚀 Ready to Launch!

Your conversion tracking is now integrated and ready to capture valuable customer actions. Update your Google Ads IDs and start optimizing your campaigns!