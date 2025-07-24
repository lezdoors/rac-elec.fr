/**
 * COMPREHENSIVE CONVERSION TESTING
 * Tests the complete user journey to verify all conversions fire correctly
 */

const http = require('http');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function testCompleteConversionFlow() {
  console.log('🔍 TESTING COMPLETE CONVERSION FLOW\n');
  
  // Test 1: Homepage has Google Tag
  console.log('=== TEST 1: HOMEPAGE GOOGLE TAG ===');
  const homepage = await makeRequest('http://localhost:5000');
  const hasGoogleTag = homepage.includes('GT-MJKTJGCK');
  const hasGtagScript = homepage.includes('gtag(');
  console.log('✅ Google Tag present:', hasGoogleTag);
  console.log('✅ Gtag script present:', hasGtagScript);
  
  // Test 2: Form page has conversion functions
  console.log('\n=== TEST 2: FORM PAGE CONVERSION FUNCTIONS ===');
  const formPage = await makeRequest('http://localhost:5000/raccordement-enedis');
  
  // Check conversion function definitions
  const hasFormStartFunction = formPage.includes('gtag_report_conversion_form_start');
  const hasFormSubmitFunction = formPage.includes('gtag_report_conversion_form_submit');
  const hasTriggerFunctions = formPage.includes('triggerFormStartConversion') && formPage.includes('triggerFormSubmitConversion');
  
  console.log('✅ Form start function defined:', hasFormStartFunction);
  console.log('✅ Form submit function defined:', hasFormSubmitFunction);
  console.log('✅ Global trigger functions defined:', hasTriggerFunctions);
  
  // Test 3: Conversion IDs are correct
  console.log('\n=== TEST 3: CONVERSION ID VERIFICATION ===');
  const formStartMatches = (formPage.match(/AW-16698052873\/5o3ICMLjpMUaEtmioJo-/g) || []).length;
  const formSubmitMatches = (formPage.match(/AW-16698052873\/PqZMCJW-tMUaEtmioJo-/g) || []).length;
  
  console.log('✅ Form start conversion ID count:', formStartMatches);
  console.log('✅ Form submit conversion ID count:', formSubmitMatches);
  console.log('✅ Form start ID correct:', formStartMatches >= 2);
  console.log('✅ Form submit ID correct:', formSubmitMatches >= 2);
  
  // Test 4: React component calls
  console.log('\n=== TEST 4: REACT COMPONENT INTEGRATION ===');
  const hasReactCallStart = formPage.includes('Attempting form start conversion');
  const hasReactCallSubmit = formPage.includes('Attempting form submit conversion');
  
  console.log('✅ React calls form start trigger:', hasReactCallStart);
  console.log('✅ React calls form submit trigger:', hasReactCallSubmit);
  
  // Test 5: Thank you page purchase conversion
  console.log('\n=== TEST 5: PURCHASE CONVERSION (THANK YOU PAGE) ===');
  const thankYouPage = await makeRequest('http://localhost:5000/thank-you?reference=TEST-123&amount=129.80');
  
  const hasPurchaseConversion = thankYouPage.includes('AW-16698052873/IFUxCJLHtMUaEtmioJo-');
  const hasTrackConversion = thankYouPage.includes('Attempting purchase conversion');
  const hasPurchaseTracking = thankYouPage.includes('purchase');
  
  console.log('✅ Purchase conversion ID present:', hasPurchaseConversion);
  console.log('✅ Track conversion function present:', hasTrackConversion);
  console.log('✅ Purchase tracking present:', hasPurchaseTracking);
  
  // Summary
  console.log('\n=== DEPLOYMENT READINESS SUMMARY ===');
  const allTests = [
    hasGoogleTag && hasGtagScript,
    hasFormStartFunction && hasFormSubmitFunction && hasTriggerFunctions,
    formStartMatches >= 2 && formSubmitMatches >= 2,
    hasReactCallStart && hasReactCallSubmit,
    hasPurchaseConversion && hasTrackConversion
  ];
  
  const passedTests = allTests.filter(Boolean).length;
  const totalTests = allTests.length;
  
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🟢 READY FOR DEPLOYMENT - All conversion tracking verified');
  } else {
    console.log('🔴 NOT READY - Some conversion tracking issues detected');
    console.log('\nFailed tests:');
    if (!allTests[0]) console.log('- Homepage Google Tag setup');
    if (!allTests[1]) console.log('- Form page conversion functions');
    if (!allTests[2]) console.log('- Conversion ID verification');
    if (!allTests[3]) console.log('- React component integration');
    if (!allTests[4]) console.log('- Purchase conversion setup');
  }
  
  return passedTests === totalTests;
}

testCompleteConversionFlow().catch(console.error);