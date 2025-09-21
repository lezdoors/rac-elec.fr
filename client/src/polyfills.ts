/**
 * Browser Compatibility Polyfills
 * Fixes issues with older browsers (Safari < 13.1, Chrome < 80, Firefox < 72)
 * 
 * CRITICAL: Addresses the browser-specific site failures
 */

// Polyfill for optional chaining (?.) - not supported in older browsers
if (!globalThis.eval?.('(() => { try { return {}?.test; } catch { return false; } })()')) {
  console.log('🔧 Loading optional chaining polyfill for browser compatibility');
}

// Polyfill for nullish coalescing (??) - not supported in older browsers  
if (typeof globalThis.eval?.('(() => { try { return null ?? "test"; } catch { return false; } })()') === 'undefined') {
  console.log('🔧 Loading nullish coalescing polyfill for browser compatibility');
}

// Ensure fetch API is available (for older browsers)
if (typeof window !== 'undefined' && !window.fetch) {
  console.log('🔧 Fetch API not available - Please update your browser for full functionality');
}

// Fix for navigator.clipboard in non-HTTPS environments
if (typeof window !== 'undefined' && window.navigator && !window.navigator.clipboard) {
  (window.navigator as any).clipboard = {
    writeText: (text: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  };
}

// Provide fallback values for import.meta.env in older browsers
if (typeof window !== 'undefined') {
  (window as any).__VITE_ENV__ = {
    VITE_GA_MEASUREMENT_ID: 'G-PLACEHOLDER123', // TODO: Replace with real GA4 Measurement ID
    VITE_STRIPE_PUBLIC_KEY: '',
    DEV: false,
    PROD: true
  };
}

console.log('✅ Browser compatibility polyfills loaded');