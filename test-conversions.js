// Test conversion tracking in live environment
import puppeteer from 'puppeteer';

async function testConversions() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  try {
    console.log('🔍 Testing conversion tracking on live site...');
    
    // Navigate to the form page
    await page.goto('http://localhost:5000/raccordement-enedis', { waitUntil: 'networkidle0' });
    
    // Wait for page to load completely
    await page.waitForTimeout(3000);
    
    // Check if Google Tag is loaded
    const gtagExists = await page.evaluate(() => {
      return typeof window.gtag !== 'undefined';
    });
    console.log('✅ Google Tag loaded:', gtagExists);
    
    // Check if conversion functions exist
    const functionsExist = await page.evaluate(() => {
      return {
        formStart: typeof window.gtag_report_conversion_form_start === 'function',
        formSubmit: typeof window.gtag_report_conversion_form_submit === 'function'
      };
    });
    console.log('✅ Conversion functions exist:', functionsExist);
    
    // Test calling the functions directly
    const testResults = await page.evaluate(() => {
      const results = [];
      
      // Test form start conversion
      if (typeof window.gtag_report_conversion_form_start === 'function') {
        try {
          const result = window.gtag_report_conversion_form_start();
          results.push({ function: 'form_start', result, success: true });
        } catch (e) {
          results.push({ function: 'form_start', error: e.message, success: false });
        }
      }
      
      // Test form submit conversion
      if (typeof window.gtag_report_conversion_form_submit === 'function') {
        try {
          const result = window.gtag_report_conversion_form_submit();
          results.push({ function: 'form_submit', result, success: true });
        } catch (e) {
          results.push({ function: 'form_submit', error: e.message, success: false });
        }
      }
      
      return results;
    });
    
    console.log('🎯 Function test results:', testResults);
    
    // Test actual form interaction
    console.log('🔄 Testing real form interaction...');
    
    // Fill form fields
    await page.type('input[name="nom"]', 'Test');
    await page.type('input[name="prenom"]', 'User');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '0123456789');
    
    // Listen for conversion events
    const conversionEvents = [];
    page.on('console', msg => {
      if (msg.text().includes('conversion') || msg.text().includes('gtag')) {
        conversionEvents.push(msg.text());
      }
    });
    
    // Click the "Continuer" button to trigger form start conversion
    await page.click('button[type="submit"]');
    
    // Wait a bit for conversion to fire
    await page.waitForTimeout(2000);
    
    console.log('📊 Conversion events captured:', conversionEvents);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testConversions().catch(console.error);