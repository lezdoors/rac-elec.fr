# GA4/GTM Domain Migration Report
**Date:** September 30, 2025  
**Migration:** portail-electricite.com → raccordement-connect.com

## ✅ Code Review Complete

### Files Analyzed
1. **client/index.html** - Main gtag initialization
2. **client/src/lib/analytics.ts** - GA4 event tracking
3. **client/src/lib/gclid-tracking.ts** - Google Ads GCLID tracking
4. **client/src/components/google-analytics-provider.tsx** - Analytics wrapper
5. **client/src/components/analytics-tracker.tsx** - Page tracking

### ✅ Verification Results

**All analytics configurations are DOMAIN-AGNOSTIC:**
- ✅ gtag config uses dynamic `window.location` (no hardcoded domains)
- ✅ page_location automatically reflects current domain
- ✅ page_referrer uses browser native referrer
- ✅ GCLID tracking captures from URL dynamically
- ✅ Enhanced Conversions use relative URLs
- ✅ All conversion tracking uses Google Ads IDs (not domain-specific)

**Current Configuration:**
```javascript
// client/index.html (lines 306-310)
gtag('config', 'GT-MJKTJGCK', {
  transport_type: 'beacon',
  send_page_view: false
});
```

**Dynamic Tracking Confirmed:**
```javascript
// client/src/components/analytics-tracker.tsx
page_location: window.location.href  // ✅ Auto-updates with new domain
```

---

## 🎯 Required Actions in GA4/GTM Admin Panels

### 1. GA4 Admin Console Actions

**A. Update Data Stream (if needed)**
1. Go to **Admin > Data streams > Web stream**
2. Click on your data stream (GT-MJKTJGCK)
3. Verify "Enhanced measurement" is enabled ✅
4. Check if cross-domain tracking is configured:
   - If you have multiple domains, add `www.raccordement-connect.com` to **Configure tag settings > Configure your domains**
   - If single domain only, no action needed

**B. Update Referral Exclusions (if applicable)**
1. Go to **Admin > Data streams > Configure tag settings**
2. Scroll to **Referral exclusion list**
3. If `portail-electricite.com` is listed, replace with `raccordement-connect.com`

**C. Verify Data Collection**
After deployment:
- Check **Reports > Realtime** to confirm new domain traffic
- Verify page_location shows `https://www.raccordement-connect.com/`

---

### 2. GTM Container Actions (if using GTM)

**⚠️ CRITICAL:** Check your GTM container for hardcoded old domain references:

**A. Search All Tags/Triggers/Variables**
1. Open GTM container
2. Go to **Search** (magnifying glass icon)
3. Search for: `portail-electricite.com`
4. Update any matches to: `www.raccordement-connect.com`

**B. Common Places to Check:**
- **Variables** → Built-in Variables → {{Page URL}}, {{Page Path}} (should be automatic)
- **Variables** → User-Defined Variables → Any custom domain variables
- **Tags** → Google Analytics tags → Configuration fields
- **Triggers** → Page view triggers → URL conditions
- **Triggers** → Click triggers → URL match conditions

**C. GTM Preview Mode**
1. Click **Preview** in GTM
2. Enter: `https://www.raccordement-connect.com`
3. Verify all tags fire correctly
4. Check no 404s or domain errors in console

**D. GTM Container Export (Backup)**
Before changes:
- Go to **Admin > Export Container**
- Save version for rollback if needed

---

### 3. Consent Mode V2 Verification

**Current Implementation:** ✅ Already configured in code
```javascript
// client/src/lib/analytics.ts (lines 128-139)
// Consent Mode v2 compliant - checks ad_storage before Enhanced Conversions
```

**No action required** - consent checks are automatic

---

### 4. Google Ads Conversion Actions

**Existing Conversions (No Changes Needed):**
- ✅ Form Start: `AW-16698052873/5o3ICMLjpMUaEImioJo-`
- ✅ Form Submit: `AW-16698052873/PqZMCJW-tMUaEImioJo-`
- ✅ Purchase: `AW-16698052873/IFUxCJLHtMUaEImioJo-`

**Verify in Google Ads:**
1. Go to **Tools > Conversions**
2. Click each conversion action
3. Check **Event snippet** section - should NOT reference domain
4. Verify "Enhanced conversions" toggle is ON

---

## 📊 Updated Analytics Configuration Summary

### Current Setup (All Dynamic)
| Component | Status | Details |
|-----------|--------|---------|
| GA4 Measurement ID | ✅ Active | GT-MJKTJGCK |
| Google Ads Account | ✅ Active | AW-16698052873 |
| Domain Tracking | ✅ Dynamic | Uses window.location |
| GCLID Capture | ✅ Dynamic | Captures from URL params |
| Enhanced Conversions | ✅ Active | SHA-256 hashing enabled |
| Consent Mode v2 | ✅ Enabled | ad_storage checks active |
| Cross-Domain | ❓ TBD | Configure if needed |

---

## 🧪 Testing & Verification

### Immediate Tests (After Deployment)
```bash
# 1. Check page_location in GA4 Realtime
# Expected: https://www.raccordement-connect.com/

# 2. Verify GCLID capture
# Visit: https://www.raccordement-connect.com/?gclid=TEST123
# Check localStorage: Should store TEST123

# 3. Test conversion tracking
# Trigger form start → Check Google Ads conversions
# Should see conversion with new domain source
```

### Browser Console Verification
```javascript
// Run in browser console on new domain:
console.log(window.location.href);
// Expected: https://www.raccordement-connect.com/...

console.log(localStorage.getItem('gclid_data'));
// Should show GCLID if present in URL

window.gtag('event', 'test_event', {event_category: 'test'});
// Should fire without errors
```

---

## 📝 GTM Preview Link

**To test GTM configuration:**
1. Go to GTM workspace
2. Click **Preview** button
3. Enter: `https://www.raccordement-connect.com`
4. **Preview URL:** `https://tagassistant.google.com/`
5. In Tag Assistant, connect to your domain
6. Verify all tags fire correctly

**Expected Tags:**
- ✅ Google Analytics: GA4 Configuration
- ✅ Google Ads: Conversion Tracking
- ✅ Google Ads: Remarketing
- ✅ Enhanced Conversions (if configured)

---

## 🎯 Action Checklist

### Before Go-Live
- [ ] Add `VITE_SITE_URL=https://www.raccordement-connect.com` to `.env`
- [ ] Configure 301 redirects from old domain
- [ ] Review GTM container for hardcoded old domains
- [ ] Update GA4 data stream settings (if cross-domain)
- [ ] Export GTM container backup

### After Go-Live
- [ ] Test real-time data in GA4 dashboard
- [ ] Verify page_location shows new domain
- [ ] Test conversion tracking flow
- [ ] Monitor Google Ads conversions for 24h
- [ ] Check for any 404s or tracking errors

### Optional (If Using GTM)
- [ ] Publish new GTM container version
- [ ] Test with GTM Preview mode
- [ ] Verify all tags fire on new domain
- [ ] Update GTM container notes with migration date

---

## 📧 Support & Questions

All analytics code is already domain-agnostic. No code changes required.

**If you encounter issues:**
1. Check browser console for gtag errors
2. Verify GA4 Realtime shows new domain
3. Test GCLID capture with test parameter
4. Review GTM Debug Console for tag failures

**Success Indicators:**
- ✅ GA4 Realtime shows www.raccordement-connect.com traffic
- ✅ Conversions appear in Google Ads with new domain
- ✅ GCLID tracking works on test URLs
- ✅ No console errors related to gtag

---

**Migration Status:** 🟢 Ready for deployment  
**Code Changes Required:** ✅ None (all dynamic)  
**Admin Panel Updates:** ⚠️ Required (GA4/GTM review)
