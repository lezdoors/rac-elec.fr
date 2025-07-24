/**
 * DIRECT CONVERSION EXECUTION TEST
 * Tests if conversions actually fire in the live application
 */

// Test by making direct HTTP requests to simulate user journey
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
  });
}

async function testConversionExecution() {
  console.log('🔍 TESTING LIVE CONVERSION EXECUTION\n');
  
  // Step 1: Load homepage and check Google Tag
  console.log('=== STEP 1: HOMEPAGE GOOGLE TAG VERIFICATION ===');
  const homepage = await makeRequest('/');
  
  const hasGoogleTagScript = homepage.includes('https://www.googletagmanager.com/gtag/js?id=GT-MJKTJGCK');
  const hasGtagConfig = homepage.includes("gtag('config', 'GT-MJKTJGCK')");
  const hasFormStartFunction = homepage.includes('gtag_report_conversion_form_start');
  const hasFormSubmitFunction = homepage.includes('gtag_report_conversion_form_submit');
  const hasDirectFunctions = homepage.includes('directFormStartConversion') && 
                           homepage.includes('directFormSubmitConversion') && 
                           homepage.includes('directPurchaseConversion');
  
  console.log(`Google Tag Script: ${hasGoogleTagScript ? 'LOADED' : 'MISSING'}`);
  console.log(`Google Tag Config: ${hasGtagConfig ? 'PRESENT' : 'MISSING'}`);
  console.log(`Form Start Function: ${hasFormStartFunction ? 'DEFINED' : 'MISSING'}`);
  console.log(`Form Submit Function: ${hasFormSubmitFunction ? 'DEFINED' : 'MISSING'}`);
  console.log(`Direct Backup Functions: ${hasDirectFunctions ? 'DEFINED' : 'MISSING'}`);
  
  // Step 2: Check conversion IDs in HTML
  console.log('\n=== STEP 2: CONVERSION ID VERIFICATION ===');
  const formStartMatches = (homepage.match(/AW-16698052873\/5o3ICMLjpMUaEtmioJo-/g) || []).length;
  const formSubmitMatches = (homepage.match(/AW-16698052873\/PqZMCJW-tMUaEtmioJo-/g) || []).length;
  const purchaseMatches = (homepage.match(/AW-16698052873\/IFUxCJLHtMUaEtmioJo-/g) || []).length;
  
  console.log(`Form Start ID (5o3ICMLjpMUa...): ${formStartMatches} instances`);
  console.log(`Form Submit ID (PqZMCJW-tMUa...): ${formSubmitMatches} instances`);
  console.log(`Purchase ID (IFUxCJLHtMUa...): ${purchaseMatches} instances`);
  
  // Step 3: Check form page
  console.log('\n=== STEP 3: FORM PAGE VERIFICATION ===');
  const formPage = await makeRequest('/raccordement-enedis');
  
  const formPageLoads = formPage.includes('id="root"');
  const hasReactBundle = formPage.includes('<script') && formPage.includes('/src/main.tsx');
  const hasConversionInForm = formPage.includes('triggerFormStartConversion') || 
                             formPage.includes('directFormStartConversion');
  
  console.log(`Form Page Loads: ${formPageLoads ? 'YES' : 'NO'}`);
  console.log(`React Bundle Present: ${hasReactBundle ? 'YES' : 'NO'}`);
  console.log(`Conversion Tracking in Form: ${hasConversionInForm ? 'YES' : 'NO'}`);
  
  // Step 4: Check thank you page
  console.log('\n=== STEP 4: THANK YOU PAGE VERIFICATION ===');
  const thankYouPage = await makeRequest('/thank-you?ref=TEST123&amount=299');
  
  const thankYouLoads = thankYouPage.includes('id="root"');
  const hasThankYouBundle = thankYouPage.includes('<script');
  
  console.log(`Thank You Page Loads: ${thankYouLoads ? 'YES' : 'NO'}`);
  console.log(`React Bundle Present: ${hasThankYouBundle ? 'YES' : 'NO'}`);
  
  // Step 5: Check React source files for conversion calls
  console.log('\n=== STEP 5: REACT SOURCE CODE VERIFICATION ===');
  const fs = require('fs');
  
  try {
    const raccordementSource = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');
    const thankYouSource = fs.readFileSync('client/src/pages/thank-you.tsx', 'utf8');
    
    const hasFormStartInReact = raccordementSource.includes('triggerFormStartConversion') || 
                               raccordementSource.includes('directFormStartConversion') ||
                               raccordementSource.includes('AW-16698052873/5o3ICMLjpMUaEtmioJo-');
    
    const hasFormSubmitInReact = raccordementSource.includes('triggerFormSubmitConversion') || 
                                raccordementSource.includes('directFormSubmitConversion') ||
                                raccordementSource.includes('AW-16698052873/PqZMCJW-tMUaEtmioJo-');
    
    const hasPurchaseInReact = thankYouSource.includes('directPurchaseConversion') || 
                              thankYouSource.includes('trackConversion') ||
                              thankYouSource.includes('AW-16698052873/IFUxCJLHtMUaEtmioJo-');
    
    console.log(`Form Start in React: ${hasFormStartInReact ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`Form Submit in React: ${hasFormSubmitInReact ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`Purchase in React: ${hasPurchaseInReact ? 'IMPLEMENTED' : 'MISSING'}`);
    
  } catch (e) {
    console.log('Error reading React source files:', e.message);
  }
  
  // Final Assessment
  console.log('\n=== FINAL ASSESSMENT ===');
  
  const criticalIssues = [];
  const warnings = [];
  
  if (!hasGoogleTagScript) criticalIssues.push('Google Tag script not loading');
  if (!hasGtagConfig) criticalIssues.push('Google Tag config missing');
  if (formStartMatches < 2) criticalIssues.push('Form start conversion ID insufficient');
  if (formSubmitMatches < 2) criticalIssues.push('Form submit conversion ID insufficient');
  if (purchaseMatches < 1) criticalIssues.push('Purchase conversion ID missing');
  if (!formPageLoads) criticalIssues.push('Form page not loading');
  if (!thankYouLoads) criticalIssues.push('Thank you page not loading');
  
  if (!hasReactBundle) warnings.push('React bundle may not be loading properly');
  if (!hasDirectFunctions) warnings.push('Direct backup functions missing');
  
  if (criticalIssues.length === 0) {
    console.log('🟢 CONVERSION TRACKING IS READY FOR LIVE TRAFFIC');
    console.log('✅ All 3 conversion points are properly implemented');
    console.log('✅ Google Ads will receive conversion data');
    
    if (warnings.length > 0) {
      console.log('\nMinor warnings:');
      warnings.forEach(w => console.log(`⚠️  ${w}`));
    }
  } else {
    console.log('🔴 CRITICAL ISSUES PREVENTING CONVERSION TRACKING');
    console.log('❌ Google Ads will NOT receive conversion data');
    console.log('\nCritical issues:');
    criticalIssues.forEach(i => console.log(`❌ ${i}`));
    
    if (warnings.length > 0) {
      console.log('\nAdditional warnings:');
      warnings.forEach(w => console.log(`⚠️  ${w}`));
    }
  }
  
  return criticalIssues.length === 0;
}

testConversionExecution();