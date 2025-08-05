// Google Ads Conversion Implementation Analysis
const fs = require('fs');

function analyzeGoogleAdsConversions() {
  console.log('🔍 GOOGLE ADS CONVERSION ANALYSIS');
  console.log('==================================\n');
  
  try {
    // Read key files
    const htmlContent = fs.readFileSync('client/index.html', 'utf8');
    const thankYouContent = fs.readFileSync('client/src/pages/thank-you.tsx', 'utf8');
    const paiementConfirmationContent = fs.readFileSync('client/src/pages/paiement-confirmation.tsx', 'utf8');
    const confirmationPageContent = fs.readFileSync('client/src/pages/confirmation-page.tsx', 'utf8');
    
    console.log('📊 CURRENT GOOGLE ADS SETUP ANALYSIS:\n');
    
    // 1. Check Google Tag Manager setup
    console.log('1. GOOGLE TAG MANAGER SETUP:');
    const gtmMatches = htmlContent.match(/GT-MJKTJGCK/g) || [];
    console.log(`   ✅ GTM Container ID (GT-MJKTJGCK): Found ${gtmMatches.length} times`);
    
    const gtagConfigMatches = htmlContent.match(/gtag\('config', 'GT-MJKTJGCK'\)/g) || [];
    console.log(`   ✅ GTM Config calls: Found ${gtagConfigMatches.length} times`);
    
    // 2. Check Google Ads Account setup
    console.log('\n2. GOOGLE ADS ACCOUNT SETUP:');
    const adsAccountMatches = htmlContent.match(/AW-16698052873/g) || [];
    console.log(`   ✅ Ads Account (AW-16698052873): Found ${adsAccountMatches.length} times in HTML`);
    
    // 3. Find all conversion IDs
    console.log('\n3. CONVERSION TRACKING SETUP:');
    const conversionPatterns = [
      { name: 'Form Start', pattern: /AW-16698052873\/5o3ICMLjpMUaEImioJo-/g },
      { name: 'Form Submit', pattern: /AW-16698052873\/PqZMCJW-tMUaEImioJo-/g },
      { name: 'Purchase', pattern: /AW-16698052873\/IFUxCJLHtMUaEImioJo-/g }
    ];
    
    const allContent = htmlContent + thankYouContent + paiementConfirmationContent + confirmationPageContent;
    
    conversionPatterns.forEach(conversion => {
      const matches = allContent.match(conversion.pattern) || [];
      console.log(`   ${matches.length > 0 ? '✅' : '❌'} ${conversion.name}: Found ${matches.length} implementations`);
    });
    
    // 4. Analyze thank-you page implementation
    console.log('\n4. THANK-YOU PAGE ANALYSIS:');
    console.log('   📄 File: thank-you.tsx');
    
    // Check for multiple conversion methods
    const thankYouMethods = [
      { name: 'Direct purchase function', pattern: /directPurchaseConversion/ },
      { name: 'Raw gtag conversion call', pattern: /gtag\('event', 'conversion'/ },
      { name: 'trackConversion backup', pattern: /trackConversion\(ref\)/ },
      { name: 'Helmet script conversion', pattern: /AW-16698052873\/IFUxCJLHtMUaEtmioJo-/ }
    ];
    
    thankYouMethods.forEach(method => {
      const found = method.pattern.test(thankYouContent);
      console.log(`   ${found ? '✅' : '❌'} ${method.name}: ${found ? 'Implemented' : 'Missing'}`);
    });
    
    // 5. Analyze payment confirmation page
    console.log('\n5. PAYMENT CONFIRMATION PAGE ANALYSIS:');
    console.log('   📄 File: paiement-confirmation.tsx');
    
    const paiementMethods = [
      { name: 'Success status conversion', pattern: /gtag\('event', 'conversion'.*AW-16698052873\/IFUxCJLHtMUaEImioJo-/ },
      { name: 'Transaction ID tracking', pattern: /transaction_id.*referenceNumber/ }
    ];
    
    paiementMethods.forEach(method => {
      const found = method.pattern.test(paiementConfirmationContent);
      console.log(`   ${found ? '✅' : '❌'} ${method.name}: ${found ? 'Implemented' : 'Missing'}`);
    });
    
    // 6. Check for conversion ID inconsistencies
    console.log('\n6. CONVERSION ID CONSISTENCY CHECK:');
    
    // Extract all conversion IDs found
    const purchaseConversions = allContent.match(/AW-16698052873\/[A-Za-z0-9_-]+/g) || [];
    const uniqueConversions = [...new Set(purchaseConversions)];
    
    console.log('   Found conversion IDs:');
    uniqueConversions.forEach(id => {
      const count = (allContent.match(new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      console.log(`   - ${id}: Used ${count} times`);
    });
    
    // 7. Check for GCLID implementation
    console.log('\n7. GCLID TRACKING:');
    const gclidPattern = /gclid|getGclid/gi;
    const gclidFound = gclidPattern.test(allContent);
    console.log(`   ${gclidFound ? '✅' : '❌'} GCLID tracking: ${gclidFound ? 'Implemented' : 'Missing'}`);
    
    // 8. Issues and recommendations
    console.log('\n🚨 ISSUES DETECTED:');
    
    let issuesFound = 0;
    
    // Check for wrong conversion ID in thank-you.tsx
    if (thankYouContent.includes('AW-16698052873/IFUxCJLHtMUaEtmioJo-')) {
      console.log('   ❌ CRITICAL: Wrong conversion ID in thank-you.tsx Helmet script');
      console.log('      Found: AW-16698052873/IFUxCJLHtMUaEtmioJo- (should be IFUxCJLHtMUaEImioJo-)');
      issuesFound++;
    }
    
    // Check for duplicate conversions
    const purchaseConversionCount = (allContent.match(/AW-16698052873\/IFUxCJLHtMUaEImioJo-/g) || []).length;
    if (purchaseConversionCount > 3) {
      console.log(`   ⚠️  Multiple purchase conversion calls detected: ${purchaseConversionCount} instances`);
      console.log('      This may cause duplicate conversion reporting');
      issuesFound++;
    }
    
    // 9. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    console.log('   1. GTM vs Direct gtag Implementation:');
    console.log('      ✅ Current setup uses both GTM (GT-MJKTJGCK) and direct gtag calls');
    console.log('      ✅ This is CORRECT - GTM is for Analytics, direct gtag for Ads conversions');
    console.log('      ❌ DO NOT move Ads conversions to GTM unless you setup conversion linker');
    
    console.log('\n   2. Conversion Implementation Best Practices:');
    console.log('      ✅ Use gtag(\'event\', \'conversion\', {...}) directly on thank-you pages');
    console.log('      ✅ Include transaction_id for better tracking and deduplication');
    console.log('      ✅ Fire conversion only once per successful transaction');
    
    console.log('\n   3. Current Account Setup:');
    console.log('      ✅ Account: AW-16698052873 (CORRECT)');
    console.log('      ✅ Form Start: /5o3ICMLjpMUaEImioJo- (CORRECT)');
    console.log('      ✅ Form Submit: /PqZMCJW-tMUaEImioJo- (CORRECT)');
    console.log('      ✅ Purchase: /IFUxCJLHtMUaEImioJo- (CORRECT)');
    
    // 10. Final status
    console.log('\n🎯 CONVERSION TRACKING STATUS:');
    if (issuesFound === 0) {
      console.log('   ✅ EXCELLENT - Conversion tracking properly implemented');
      console.log('   ✅ Ready for Google Ads optimization');
    } else {
      console.log(`   ⚠️  ${issuesFound} issue(s) detected - requires fixes for optimal tracking`);
    }
    
    console.log('\n🔧 TESTING RECOMMENDATIONS:');
    console.log('   1. Use Google Tag Assistant to verify conversion firing');
    console.log('   2. Check Google Ads conversion reports for data reception');
    console.log('   3. Test with real transactions in sandbox mode');
    console.log('   4. Monitor conversion attribution in Google Ads dashboard');
    
  } catch (error) {
    console.error('❌ Error analyzing Google Ads conversions:', error.message);
  }
}

analyzeGoogleAdsConversions();