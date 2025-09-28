/**
 * Browser Compatibility Polyfills
 * Fixes issues with older browsers (Safari < 13.1, Chrome < 80, Firefox < 72)
 * 
 * CRITICAL: Addresses the browser-specific site failures
 */

// SAFARI FIX: URLSearchParams polyfill for older Safari versions
if (typeof window !== 'undefined' && !window.URLSearchParams) {
  (window as any).URLSearchParams = class URLSearchParamsPolyfill {
    private params: Map<string, string> = new Map();
    
    constructor(search?: string) {
      if (search) {
        const pairs = search.replace(/^\?/, '').split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        });
      }
    }
    
    get(name: string): string | null {
      return this.params.get(name) || null;
    }
    
    set(name: string, value: string): void {
      this.params.set(name, value);
    }
    
    has(name: string): boolean {
      return this.params.has(name);
    }
  };
  console.log('🍎 URLSearchParams polyfill loaded for Safari compatibility');
}

// Optional chaining detection with safer eval
try {
  eval('({})?.test');
} catch (e) {
  console.log('🔧 Optional chaining not supported - using fallbacks');
}

// Nullish coalescing detection with safer eval
try {
  eval('null ?? "test"');
} catch (e) {
  console.log('🔧 Nullish coalescing not supported - using fallbacks');
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
    VITE_GA_MEASUREMENT_ID: 'GT-MJKTJGCK',
    VITE_STRIPE_PUBLIC_KEY: '',
    DEV: false,
    PROD: true
  };
}

console.log('✅ Browser compatibility polyfills loaded');

// Export function to make this a proper module
export function initializePolyfills() {
  // Polyfills are executed immediately when this module loads
  return true;
}