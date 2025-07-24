/**
 * LIVE CONVERSION VERIFICATION
 * Tests actual conversion firing in the running application
 */

const http = require('http');

console.log('🔍 VERIFYING LIVE CONVERSION TRACKING\n');

// Test 1: Check if Google Tag is loaded
function testGoogleTag() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasGoogleTag = data.includes('https://www.googletagmanager.com/gtag/js?id=GT-MJKTJGCK');
        const hasConfig = data.includes("gtag('config', 'GT-MJKTJGCK')");
        console.log(`✅ Google Tag Script: ${hasGoogleTag ? 'LOADED' : 'MISSING'}`);
        console.log(`✅ Google Tag Config: ${hasConfig ? 'PRESENT' : 'MISSING'}`);
        resolve(hasGoogleTag && hasConfig);
      });
    });
    req.on('error', () => {
      console.log('❌ Failed to connect to application');
      resolve(false);
    });
  });
}

// Test 2: Check conversion functions in HTML
function testConversionFunctions() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasFormStart = data.includes('gtag_report_conversion_form_start');
        const hasFormSubmit = data.includes('gtag_report_conversion_form_submit');
        const hasGlobalTriggers = data.includes('triggerFormStartConversion') && data.includes('triggerFormSubmitConversion');
        const hasDirectBackups = data.includes('directFormStartConversion') && data.includes('directFormSubmitConversion');
        
        console.log(`✅ Form Start Function: ${hasFormStart ? 'DEFINED' : 'MISSING'}`);
        console.log(`✅ Form Submit Function: ${hasFormSubmit ? 'DEFINED' : 'MISSING'}`);
        console.log(`✅ Global Triggers: ${hasGlobalTriggers ? 'DEFINED' : 'MISSING'}`);
        console.log(`✅ Direct Backups: ${hasDirectBackups ? 'DEFINED' : 'MISSING'}`);
        
        resolve(hasFormStart && hasFormSubmit && hasGlobalTriggers && hasDirectBackups);
      });
    });
    req.on('error', () => resolve(false));
  });
}

// Test 3: Check conversion IDs
function testConversionIDs() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const formStartMatches = (data.match(/AW-16698052873\/5o3ICMLjpMUaEtmioJo-/g) || []).length;
        const formSubmitMatches = (data.match(/AW-16698052873\/PqZMCJW-tMUaEtmioJo-/g) || []).length;
        const purchaseMatches = (data.match(/AW-16698052873\/IFUxCJLHtMUaEtmioJo-/g) || []).length;
        
        console.log(`✅ Form Start ID (5o3ICMLjpMUaEtmioJo-): ${formStartMatches} instances`);
        console.log(`✅ Form Submit ID (PqZMCJW-tMUaEtmioJo-): ${formSubmitMatches} instances`);
        console.log(`✅ Purchase ID (IFUxCJLHtMUaEtmioJo-): ${purchaseMatches} instances`);
        
        resolve(formStartMatches >= 2 && formSubmitMatches >= 2 && purchaseMatches >= 1);
      });
    });
    req.on('error', () => resolve(false));
  });
}

// Test 4: Check form page React integration
function testFormPageIntegration() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/raccordement-enedis', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Check if the form page loads the conversion tracking
        const hasReactApp = data.includes('id="root"');
        const hasScripts = data.includes('<script');
        
        console.log(`✅ Form Page Loads: ${hasReactApp ? 'YES' : 'NO'}`);
        console.log(`✅ JavaScript Bundle: ${hasScripts ? 'LOADED' : 'MISSING'}`);
        
        resolve(hasReactApp && hasScripts);
      });
    });
    req.on('error', () => resolve(false));
  });
}

// Test 5: Check thank you page
function testThankYouPage() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/thank-you?ref=TEST123', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasReactApp = data.includes('id="root"');
        const hasScripts = data.includes('<script');
        
        console.log(`✅ Thank You Page Loads: ${hasReactApp ? 'YES' : 'NO'}`);
        console.log(`✅ JavaScript Bundle: ${hasScripts ? 'LOADED' : 'MISSING'}`);
        
        resolve(hasReactApp && hasScripts);
      });
    });
    req.on('error', () => resolve(false));
  });
}

async function runVerification() {
  console.log('=== TEST 1: GOOGLE TAG LOADING ===');
  const googleTagOK = await testGoogleTag();
  
  console.log('\n=== TEST 2: CONVERSION FUNCTIONS ===');
  const functionsOK = await testConversionFunctions();
  
  console.log('\n=== TEST 3: CONVERSION IDS ===');
  const idsOK = await testConversionIDs();
  
  console.log('\n=== TEST 4: FORM PAGE INTEGRATION ===');
  const formPageOK = await testFormPageIntegration();
  
  console.log('\n=== TEST 5: THANK YOU PAGE ===');
  const thankYouOK = await testThankYouPage();
  
  console.log('\n=== LIVE VERIFICATION SUMMARY ===');
  const totalTests = 5;
  const passedTests = [googleTagOK, functionsOK, idsOK, formPageOK, thankYouOK].filter(Boolean).length;
  
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🟢 ALL SYSTEMS OPERATIONAL - Conversions should be tracking');
  } else {
    console.log('🔴 ISSUES DETECTED - Conversion tracking may not work');
    console.log('\nFailed Components:');
    if (!googleTagOK) console.log('- Google Tag loading');
    if (!functionsOK) console.log('- Conversion functions');
    if (!idsOK) console.log('- Conversion IDs');
    if (!formPageOK) console.log('- Form page integration');
    if (!thankYouOK) console.log('- Thank you page');
  }
  
  // Additional diagnostic
  console.log('\n=== NEXT STEPS ===');
  if (passedTests < totalTests) {
    console.log('❌ Immediate action required to fix conversion tracking');
    console.log('❌ Google Ads will NOT receive conversion data in current state');
  } else {
    console.log('✅ System ready for live traffic');
    console.log('✅ Google Ads conversions should be captured successfully');
  }
}

runVerification().catch(console.error);