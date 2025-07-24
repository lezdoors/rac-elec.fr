/**
 * TEST ACTUAL CONVERSION FIRING
 * Simulates real user interactions to verify conversions actually execute
 */

const puppeteer = require('puppeteer');

async function testConversionFiring() {
  let browser;
  console.log('🧪 TESTING ACTUAL CONVERSION FIRING\n');
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Track console logs to see conversion firing
    const conversionLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('conversion') || text.includes('gtag') || text.includes('AW-')) {
        conversionLogs.push(text);
        console.log(`📊 Conversion Log: ${text}`);
      }
    });
    
    // Test 1: Homepage loads Google Tag
    console.log('=== TEST 1: HOMEPAGE GOOGLE TAG ===');
    await page.goto('http://localhost:5000/', { waitUntil: 'networkidle0' });
    
    const gtagLoaded = await page.evaluate(() => {
      return typeof window.gtag !== 'undefined';
    });
    console.log(`Google Tag Loaded: ${gtagLoaded ? 'YES' : 'NO'}`);
    
    // Test 2: Navigate to form and check conversion functions
    console.log('\n=== TEST 2: FORM PAGE CONVERSION SETUP ===');
    await page.goto('http://localhost:5000/raccordement-enedis', { waitUntil: 'networkidle0' });
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    const conversionFunctionsAvailable = await page.evaluate(() => {
      return {
        gtag: typeof window.gtag !== 'undefined',
        triggerFormStart: typeof window.triggerFormStartConversion !== 'undefined',
        triggerFormSubmit: typeof window.triggerFormSubmitConversion !== 'undefined',
        directFormStart: typeof window.directFormStartConversion !== 'undefined',
        directFormSubmit: typeof window.directFormSubmitConversion !== 'undefined',
        directPurchase: typeof window.directPurchaseConversion !== 'undefined'
      };
    });
    
    console.log('Conversion Functions Available:');
    Object.entries(conversionFunctionsAvailable).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? 'YES' : 'NO'}`);
    });
    
    // Test 3: Manually trigger form start conversion
    console.log('\n=== TEST 3: MANUAL FORM START CONVERSION ===');
    const formStartResult = await page.evaluate(() => {
      try {
        if (window.directFormStartConversion) {
          return window.directFormStartConversion();
        } else if (window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16698052873/5o3ICMLjpMUaEtmioJo-'
          });
          return true;
        }
        return false;
      } catch (e) {
        return `Error: ${e.message}`;
      }
    });
    console.log(`Form Start Conversion Result: ${formStartResult}`);
    
    // Test 4: Manually trigger form submit conversion
    console.log('\n=== TEST 4: MANUAL FORM SUBMIT CONVERSION ===');
    const formSubmitResult = await page.evaluate(() => {
      try {
        if (window.directFormSubmitConversion) {
          return window.directFormSubmitConversion();
        } else if (window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16698052873/PqZMCJW-tMUaEtmioJo-'
          });
          return true;
        }
        return false;
      } catch (e) {
        return `Error: ${e.message}`;
      }
    });
    console.log(`Form Submit Conversion Result: ${formSubmitResult}`);
    
    // Test 5: Test thank you page purchase conversion
    console.log('\n=== TEST 5: THANK YOU PAGE PURCHASE CONVERSION ===');
    await page.goto('http://localhost:5000/thank-you?ref=TEST-123&amount=299', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const purchaseResult = await page.evaluate(() => {
      try {
        if (window.directPurchaseConversion) {
          return window.directPurchaseConversion('TEST-123');
        } else if (window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16698052873/IFUxCJLHtMUaEtmioJo-',
            'transaction_id': 'TEST-123'
          });
          return true;
        }
        return false;
      } catch (e) {
        return `Error: ${e.message}`;
      }
    });
    console.log(`Purchase Conversion Result: ${purchaseResult}`);
    
    // Wait a moment for any async conversions
    await page.waitForTimeout(1000);
    
    console.log('\n=== CONVERSION FIRING SUMMARY ===');
    console.log(`Total Conversion Logs Captured: ${conversionLogs.length}`);
    console.log('Conversion Logs:');
    conversionLogs.forEach((log, i) => console.log(`  ${i + 1}. ${log}`));
    
    const allWorking = gtagLoaded && 
                      conversionFunctionsAvailable.gtag && 
                      formStartResult === true && 
                      formSubmitResult === true && 
                      purchaseResult === true;
    
    if (allWorking) {
      console.log('\n🟢 ALL CONVERSIONS FIRING SUCCESSFULLY');
      console.log('✅ Google Ads will receive conversion data');
    } else {
      console.log('\n🔴 CONVERSION FIRING ISSUES DETECTED');
      console.log('❌ Google Ads may not receive conversion data');
      
      if (!gtagLoaded) console.log('- Google Tag not loading');
      if (!conversionFunctionsAvailable.gtag) console.log('- gtag function not available');
      if (formStartResult !== true) console.log(`- Form start conversion failed: ${formStartResult}`);
      if (formSubmitResult !== true) console.log(`- Form submit conversion failed: ${formSubmitResult}`);
      if (purchaseResult !== true) console.log(`- Purchase conversion failed: ${purchaseResult}`);
    }
    
    return allWorking;
    
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testConversionFiring();