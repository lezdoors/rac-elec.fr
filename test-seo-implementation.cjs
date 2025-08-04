// SEO Implementation Test
const fs = require('fs');

function testSEOImplementation() {
  console.log('🔍 SEO IMPLEMENTATION TEST');
  console.log('===========================\n');
  
  try {
    // Read the HTML file
    const htmlContent = fs.readFileSync('client/index.html', 'utf8');
    
    // Test for required SEO elements
    const seoTests = [
      {
        name: 'Primary Title Tag',
        test: /<title>.*Raccordement Électrique Enedis.*<\/title>/,
        required: true
      },
      {
        name: 'Meta Description',
        test: /<meta name="description" content=".*Service de raccordement électrique Enedis en ligne.*"/,
        required: true
      },
      {
        name: 'Keywords Meta Tag', 
        test: /<meta name="keywords" content=".*raccordement enedis.*"/,
        required: true
      },
      {
        name: 'Robots Meta Tag',
        test: /<meta name="robots" content="index, follow.*"/,
        required: true
      },
      {
        name: 'Canonical URL',
        test: /<link rel="canonical" href="https:\/\/portail-electricite\.com\/" \/>/,
        required: true
      },
      {
        name: 'Open Graph Title',
        test: /<meta property="og:title" content=".*Raccordement Électrique Enedis.*"/,
        required: true
      },
      {
        name: 'Open Graph Description',
        test: /<meta property="og:description" content=".*"/,
        required: true
      },
      {
        name: 'Open Graph Image',
        test: /<meta property="og:image" content="https:\/\/portail-electricite\.com\/og-image\.jpg">/,
        required: true
      },
      {
        name: 'Twitter Card',
        test: /<meta name="twitter:card" content="summary_large_image">/,
        required: true
      },
      {
        name: 'Schema.org Organization',
        test: /"@type": "Organization"/,
        required: true
      },
      {
        name: 'Schema.org WebSite',
        test: /"@type": "WebSite"/,
        required: true
      },
      {
        name: 'Schema.org LocalBusiness',
        test: /"@type": "LocalBusiness"/,
        required: true
      },
      {
        name: 'Schema.org Service',
        test: /"@type": "Service"/,
        required: true
      },
      {
        name: 'Schema.org BreadcrumbList',
        test: /"@type": "BreadcrumbList"/,
        required: true
      },
      {
        name: 'Theme Color',
        test: /<meta name="theme-color" content="#007bff">/,
        required: true
      },
      {
        name: 'Viewport Meta',
        test: /<meta name="viewport" content="width=device-width, initial-scale=1\.0.*"/,
        required: true
      }
    ];
    
    console.log('📊 Testing SEO Elements:\n');
    
    let passedTests = 0;
    let totalTests = seoTests.length;
    
    seoTests.forEach(test => {
      const result = test.test.test(htmlContent);
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
      if (result) passedTests++;
    });
    
    console.log(`\n📈 SEO Score: ${passedTests}/${totalTests} (${Math.round((passedTests/totalTests)*100)}%)\n`);
    
    // Test for additional files
    console.log('📁 Testing Additional SEO Files:\n');
    
    const fileTests = [
      { file: 'public/sitemap.xml', name: 'Sitemap' },
      { file: 'public/robots.txt', name: 'Robots.txt' }
    ];
    
    fileTests.forEach(fileTest => {
      try {
        const content = fs.readFileSync(fileTest.file, 'utf8');
        console.log(`✅ PASS ${fileTest.name} - File exists and has content`);
      } catch (error) {
        console.log(`❌ FAIL ${fileTest.name} - File missing or unreadable`);
      }
    });
    
    // Detailed analysis
    console.log('\n🔍 DETAILED ANALYSIS:\n');
    
    // Count structured data schemas
    const schemaMatches = htmlContent.match(/"@type": "[^"]+"/g) || [];
    const uniqueSchemas = [...new Set(schemaMatches)];
    console.log(`📊 Structured Data Schemas: ${uniqueSchemas.length}`);
    uniqueSchemas.forEach(schema => {
      console.log(`   - ${schema.replace('"@type": "', '').replace('"', '')}`);
    });
    
    // Count meta tags
    const metaMatches = htmlContent.match(/<meta [^>]+>/g) || [];
    console.log(`\n🏷️  Total Meta Tags: ${metaMatches.length}`);
    
    // Count Open Graph properties
    const ogMatches = htmlContent.match(/<meta property="og:[^"]+"/g) || [];
    console.log(`📱 Open Graph Properties: ${ogMatches.length}`);
    
    // Count Twitter Card properties  
    const twitterMatches = htmlContent.match(/<meta name="twitter:[^"]+"/g) || [];
    console.log(`🐦 Twitter Card Properties: ${twitterMatches.length}`);
    
    console.log('\n🎯 FINAL SEO STATUS:');
    console.log('===================');
    
    if (passedTests === totalTests) {
      console.log('🚀 EXCELLENT - All SEO elements implemented correctly!');
      console.log('✅ Ready for search engine optimization');
      console.log('✅ Social media sharing optimized');
      console.log('✅ Rich snippets enabled');
    } else {
      console.log(`⚠️  NEEDS ATTENTION - ${totalTests - passedTests} elements need fixing`);
    }
    
  } catch (error) {
    console.error('❌ Error testing SEO implementation:', error.message);
  }
}

testSEOImplementation();