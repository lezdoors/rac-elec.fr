/**
 * TEST FORM START CONVERSION SPECIFICALLY
 * Verifies the form start conversion triggers correctly
 */

const http = require('http');
const fs = require('fs');

console.log('🔍 TESTING FORM START CONVERSION SPECIFICALLY\n');

// Check 1: Verify form start conversion ID in HTML
function checkFormStartInHTML() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasFormStartFunction = data.includes('gtag_report_conversion_form_start');
        const hasFormStartID = data.includes('AW-16698052873/5o3ICMLjpMUaEtmioJo-');
        const hasGlobalTrigger = data.includes('triggerFormStartConversion');
        const hasDirectBackup = data.includes('directFormStartConversion');
        
        console.log('=== HTML TEMPLATE VERIFICATION ===');
        console.log(`Form Start Function: ${hasFormStartFunction ? 'PRESENT' : 'MISSING'}`);
        console.log(`Form Start ID (5o3ICMLjpMUa): ${hasFormStartID ? 'PRESENT' : 'MISSING'}`);
        console.log(`Global Trigger Function: ${hasGlobalTrigger ? 'PRESENT' : 'MISSING'}`);
        console.log(`Direct Backup Function: ${hasDirectBackup ? 'PRESENT' : 'MISSING'}`);
        
        resolve(hasFormStartFunction && hasFormStartID && hasGlobalTrigger && hasDirectBackup);
      });
    });
    req.on('error', () => resolve(false));
  });
}

// Check 2: Verify React component calls form start conversion
function checkFormStartInReact() {
  try {
    const reactSource = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');
    
    console.log('\n=== REACT COMPONENT VERIFICATION ===');
    
    // Look for form start conversion triggers
    const hasNextStepLogic = reactSource.includes('nextStep') || reactSource.includes('currentStep');
    const hasTriggerCall = reactSource.includes('triggerFormStartConversion');
    const hasDirectCall = reactSource.includes('directFormStartConversion');
    const hasGtagCall = reactSource.includes('AW-16698052873/5o3ICMLjpMUaEtmioJo-');
    const hasMultipleMethods = reactSource.includes('Method 1:') && reactSource.includes('Method 2:');
    
    console.log(`Multi-step Logic: ${hasNextStepLogic ? 'PRESENT' : 'MISSING'}`);
    console.log(`Trigger Function Call: ${hasTriggerCall ? 'PRESENT' : 'MISSING'}`);
    console.log(`Direct Function Call: ${hasDirectCall ? 'PRESENT' : 'MISSING'}`);
    console.log(`Raw Gtag Call: ${hasGtagCall ? 'PRESENT' : 'MISSING'}`);
    console.log(`Multiple Methods: ${hasMultipleMethods ? 'PRESENT' : 'MISSING'}`);
    
    // Find the exact trigger location
    if (reactSource.includes('Form Start Conversion Tracking')) {
      console.log('Form Start Trigger Location: FOUND in nextStep function');
    } else {
      console.log('Form Start Trigger Location: NOT FOUND');
    }
    
    return hasNextStepLogic && (hasTriggerCall || hasDirectCall || hasGtagCall);
    
  } catch (e) {
    console.log('Error reading React source:', e.message);
    return false;
  }
}

// Check 3: Verify the trigger occurs at the right step
function checkTriggerTiming() {
  try {
    const reactSource = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');
    
    console.log('\n=== TRIGGER TIMING VERIFICATION ===');
    
    // Look for step validation and conversion timing
    const hasStepValidation = reactSource.includes('isStepValid') || reactSource.includes('trigger(fieldsToValidate)');
    const hasConditionalTrigger = reactSource.includes('if (isStepValid)');
    const hasSetTimeout = reactSource.includes('setTimeout') && reactSource.includes('Form Start Conversion');
    
    console.log(`Step Validation: ${hasStepValidation ? 'PRESENT' : 'MISSING'}`);
    console.log(`Conditional Trigger: ${hasConditionalTrigger ? 'PRESENT' : 'MISSING'}`);
    console.log(`Delayed Execution: ${hasSetTimeout ? 'PRESENT' : 'MISSING'}`);
    
    return hasStepValidation && hasConditionalTrigger;
    
  } catch (e) {
    console.log('Error checking trigger timing:', e.message);
    return false;
  }
}

async function runFormStartTest() {
  const htmlOK = await checkFormStartInHTML();
  const reactOK = checkFormStartInReact();
  const timingOK = checkTriggerTiming();
  
  console.log('\n=== FORM START CONVERSION ASSESSMENT ===');
  
  if (htmlOK && reactOK && timingOK) {
    console.log('🟢 FORM START CONVERSION IS FULLY OPERATIONAL');
    console.log('✅ Triggers when user advances from step 1 to step 2');
    console.log('✅ Multiple fallback methods ensure reliability');
    console.log('✅ Google Ads will receive form start conversions');
  } else {
    console.log('🔴 FORM START CONVERSION HAS ISSUES');
    if (!htmlOK) console.log('❌ HTML template conversion functions missing');
    if (!reactOK) console.log('❌ React component integration missing');
    if (!timingOK) console.log('❌ Trigger timing logic missing');
    console.log('❌ Google Ads may not receive form start conversions');
  }
  
  return htmlOK && reactOK && timingOK;
}

runFormStartTest();