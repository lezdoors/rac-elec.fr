/**
 * GCLID Validation and Testing System
 * Provides validation, testing, and diagnostic functions for GCLID tracking
 */

import { getCurrentGclid, getStoredGclid, initializeGclidTracking } from './gclid-tracking';

export interface GclidValidationResult {
  isValid: boolean;
  checks: {
    urlParameter: boolean;
    localStorage: boolean;
    googleTag: boolean;
    conversionTracking: boolean;
    gclidFormat: boolean;
  };
  currentGclid: string | null;
  storedGclid: string | null;
  errors: string[];
  warnings: string[];
}

/**
 * Validate the complete GCLID setup
 */
export function validateGclidSetup(): GclidValidationResult {
  const result: GclidValidationResult = {
    isValid: false,
    checks: {
      urlParameter: false,
      localStorage: false,
      googleTag: false,
      conversionTracking: false,
      gclidFormat: false
    },
    currentGclid: null,
    storedGclid: null,
    errors: [],
    warnings: []
  };

  try {
    // Check for current GCLID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlGclid = urlParams.get('gclid');
    result.currentGclid = urlGclid;
    result.checks.urlParameter = !!urlGclid;

    // Check stored GCLID
    const storedGclid = getStoredGclid();
    result.storedGclid = storedGclid;
    result.checks.localStorage = !!storedGclid;

    // Validate GCLID format
    const gclid = urlGclid || storedGclid;
    if (gclid) {
      result.checks.gclidFormat = /^[A-Za-z0-9_-]+$/.test(gclid) && gclid.length > 10;
      if (!result.checks.gclidFormat) {
        result.warnings.push('GCLID format may be invalid');
      }
    }

    // Check GTM dataLayer availability (GTM-only setup)
    result.checks.googleTag = Array.isArray(window.dataLayer);
    if (!result.checks.googleTag) {
      result.errors.push('GTM dataLayer not available');
    }

    // Check conversion tracking setup
    result.checks.conversionTracking = result.checks.googleTag && !!gclid;
    if (!result.checks.conversionTracking && result.checks.googleTag) {
      result.warnings.push('Conversion tracking available but no GCLID present');
    }

    // Overall validation
    result.isValid = (result.checks.localStorage || result.checks.urlParameter) && 
                     result.checks.googleTag && 
                     result.checks.gclidFormat;

    if (!result.isValid) {
      if (!gclid) {
        result.errors.push('No GCLID found in URL or localStorage');
      }
      if (!result.checks.googleTag) {
        result.errors.push('Google Analytics not properly initialized');
      }
    }

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Test GCLID conversion tracking via GTM dataLayer
 */
export async function testGclidConversion(conversionId: string): Promise<boolean> {
  try {
    if (!Array.isArray(window.dataLayer)) {
      throw new Error('GTM dataLayer not available');
    }

    const gclid = getCurrentGclid();
    if (!gclid) {
      throw new Error('No GCLID available for testing');
    }

    // Send test conversion with GCLID via dataLayer (GTM-only)
    window.dataLayer.push({
      event: 'ads_conversion',
      conversion_id: conversionId,
      gclid: gclid,
      transaction_id: `test_${Date.now()}`,
      value: 1.0,
      currency: 'EUR'
    });

    console.log('✅ Test conversion pushed to GTM dataLayer with GCLID:', gclid);
    return true;

  } catch (error) {
    console.error('❌ Test conversion failed:', error);
    return false;
  }
}

/**
 * Generate comprehensive GCLID diagnostic report
 */
export function generateGclidDiagnostic(): string {
  const validation = validateGclidSetup();
  const timestamp = new Date().toISOString();
  
  let report = `GCLID DIAGNOSTIC REPORT\n`;
  report += `Generated: ${timestamp}\n`;
  report += `URL: ${window.location.href}\n\n`;
  
  report += `OVERALL STATUS: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
  
  report += `VALIDATION CHECKS:\n`;
  report += `- URL Parameter: ${validation.checks.urlParameter ? '✅' : '❌'}\n`;
  report += `- Local Storage: ${validation.checks.localStorage ? '✅' : '❌'}\n`;
  report += `- Google Tag: ${validation.checks.googleTag ? '✅' : '❌'}\n`;
  report += `- Conversion Tracking: ${validation.checks.conversionTracking ? '✅' : '❌'}\n`;
  report += `- GCLID Format: ${validation.checks.gclidFormat ? '✅' : '❌'}\n\n`;
  
  report += `GCLID VALUES:\n`;
  report += `- Current (URL): ${validation.currentGclid || 'None'}\n`;
  report += `- Stored (localStorage): ${validation.storedGclid || 'None'}\n\n`;
  
  if (validation.errors.length > 0) {
    report += `ERRORS:\n`;
    validation.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }
  
  if (validation.warnings.length > 0) {
    report += `WARNINGS:\n`;
    validation.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += `\n`;
  }
  
  // Additional environment info
  report += `ENVIRONMENT INFO:\n`;
  report += `- User Agent: ${navigator.userAgent}\n`;
  report += `- Local Storage Available: ${typeof Storage !== 'undefined'}\n`;
  report += `- GTM dataLayer Available: ${Array.isArray(window.dataLayer)}\n`;
  report += `- Session Storage: ${Object.keys(sessionStorage).length} items\n`;
  report += `- Local Storage: ${Object.keys(localStorage).length} items\n`;
  
  return report;
}

/**
 * Start real-time GCLID monitoring
 */
export function startGclidMonitoring(): void {
  console.log('🔍 Starting GCLID monitoring...');
  
  // Monitor URL changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    checkGclidChanges();
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    checkGclidChanges();
  };
  
  // Monitor popstate events
  window.addEventListener('popstate', checkGclidChanges);
  
  // Monitor localStorage changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'gclid_data') {
      console.log('📱 GCLID localStorage changed:', e.newValue);
    }
  });
  
  // Initial check
  checkGclidChanges();
  
  console.log('✅ GCLID monitoring active');
}

/**
 * Check for GCLID changes and log them
 */
function checkGclidChanges(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const urlGclid = urlParams.get('gclid');
  const storedGclid = getStoredGclid();
  
  if (urlGclid) {
    console.log('🎯 New GCLID detected in URL:', urlGclid);
    initializeGclidTracking();
  }
  
  console.log('📊 Current GCLID status:', {
    url: urlGclid,
    stored: storedGclid,
    timestamp: new Date().toISOString()
  });
}

// Type declarations for GTM dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}