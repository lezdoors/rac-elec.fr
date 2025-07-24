/**
 * COMPLETE GOOGLE ADS CONVERSION VERIFICATION
 * Ensures all three conversion points are properly implemented
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 COMPLETE GOOGLE ADS CONVERSION VERIFICATION\n');

// 1. Verify Google Tag is loaded in index.html
console.log('=== 1. GOOGLE TAG VERIFICATION ===');
try {
  const indexHtml = fs.readFileSync('client/index.html', 'utf8');
  const hasGoogleTag = indexHtml.includes('GT-MJKTJGCK');
  const hasGtagScript = indexHtml.includes('https://www.googletagmanager.com/gtag/js');
  console.log('✅ Google Tag ID present:', hasGoogleTag);
  console.log('✅ Google Tag script loading:', hasGtagScript);
} catch (error) {
  console.log('❌ Error reading index.html:', error.message);
}

// 2. Verify conversion functions in index.html
console.log('\n=== 2. CONVERSION FUNCTIONS VERIFICATION ===');
try {
  const indexHtml = fs.readFileSync('client/index.html', 'utf8');
  const hasFormStartFunc = indexHtml.includes('function gtag_report_conversion_form_start');
  const hasFormSubmitFunc = indexHtml.includes('function gtag_report_conversion_form_submit');
  const hasGlobalAssignment = indexHtml.includes('window.gtag_report_conversion_form_start');
  
  console.log('✅ Form start function defined:', hasFormStartFunc);
  console.log('✅ Form submit function defined:', hasFormSubmitFunc);
  console.log('✅ Functions made global:', hasGlobalAssignment);
  
  // Extract conversion IDs
  const formStartMatch = indexHtml.match(/gtag_report_conversion_form_start[^}]*AW-16698052873\/([^']+)/);
  const formSubmitMatch = indexHtml.match(/gtag_report_conversion_form_submit[^}]*AW-16698052873\/([^']+)/);
  console.log('✅ Form start conversion ID:', formStartMatch ? formStartMatch[1] : 'NOT FOUND');
  console.log('✅ Form submit conversion ID:', formSubmitMatch ? formSubmitMatch[1] : 'NOT FOUND');
} catch (error) {
  console.log('❌ Error verifying conversion functions:', error.message);
}

// 3. Verify React component calls
console.log('\n=== 3. REACT COMPONENT CALLS VERIFICATION ===');
try {
  const raccordementFile = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');
  const hasFormStartCall = raccordementFile.includes('gtag_report_conversion_form_start()');
  const hasFormSubmitCall = raccordementFile.includes('gtag_report_conversion_form_submit()');
  
  console.log('✅ Form start called in React:', hasFormStartCall);
  console.log('✅ Form submit called in React:', hasFormSubmitCall);
  
  // Count occurrences
  const formStartMatches = (raccordementFile.match(/gtag_report_conversion_form_start\(\)/g) || []).length;
  const formSubmitMatches = (raccordementFile.match(/gtag_report_conversion_form_submit\(\)/g) || []).length;
  console.log('✅ Form start call count:', formStartMatches);
  console.log('✅ Form submit call count:', formSubmitMatches);
} catch (error) {
  console.log('❌ Error verifying React calls:', error.message);
}

// 4. Verify purchase conversion
console.log('\n=== 4. PURCHASE CONVERSION VERIFICATION ===');
try {
  const paymentFile = fs.readFileSync('client/src/pages/paiement-confirmation.tsx', 'utf8');
  const hasPurchaseConversion = paymentFile.includes('AW-16698052873/IFUxCJLHtMUaEtmioJo-');
  const hasGtagCall = paymentFile.includes("window.gtag('event', 'conversion'");
  
  console.log('✅ Purchase conversion ID present:', hasPurchaseConversion);
  console.log('✅ Purchase gtag call present:', hasGtagCall);
  
  // Extract purchase conversion details
  const purchaseMatch = paymentFile.match(/send_to':\s*'(AW-16698052873\/[^']+)'/);
  console.log('✅ Purchase conversion ID:', purchaseMatch ? purchaseMatch[1] : 'NOT FOUND');
} catch (error) {
  console.log('❌ Error verifying purchase conversion:', error.message);
}

// 5. Live site verification
console.log('\n=== 5. LIVE SITE VERIFICATION ===');
try {
  const homePageResponse = execSync('curl -s http://localhost:5000/', { encoding: 'utf8' });
  const formPageResponse = execSync('curl -s http://localhost:5000/raccordement-enedis', { encoding: 'utf8' });
  
  const homeHasGtag = homePageResponse.includes('GT-MJKTJGCK');
  const formHasFunctions = formPageResponse.includes('gtag_report_conversion_form_start');
  const allConversionIds = [...homePageResponse.matchAll(/AW-16698052873\/[^'"]*/g), ...formPageResponse.matchAll(/AW-16698052873\/[^'"]*/g)];
  
  console.log('✅ Homepage has Google Tag:', homeHasGtag);
  console.log('✅ Form page has conversion functions:', formHasFunctions);
  console.log('✅ All conversion IDs found:', [...new Set(allConversionIds.map(m => m[0]))]);
  
  // Check if React calls are in compiled JS
  const reactCallsInJS = formPageResponse.includes('gtag_report_conversion_form_start()');
  console.log('✅ React calls compiled in JS:', reactCallsInJS);
  
} catch (error) {
  console.log('❌ Error in live site verification:', error.message);
}

console.log('\n=== CONVERSION TRACKING SUMMARY ===');
console.log('Required conversion IDs:');
console.log('1. Form Start: AW-16698052873/5o3ICMLjpMUaEtmioJo-');
console.log('2. Form Submit: AW-16698052873/PqZMCJW-tMUaEtmioJo-');
console.log('3. Purchase: AW-16698052873/IFUxCJLHtMUaEtmioJo-');
console.log('\nVerification complete. Check above for any ❌ issues that need fixing.');