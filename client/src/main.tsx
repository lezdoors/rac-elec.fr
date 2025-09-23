// PERFORMANCE FIX: Polyfills moved to feature detection + dynamic import
// No longer blocking the critical rendering path!

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// PERFORMANCE FIX: Feature-detected polyfill loading
function loadPolyfillsIfNeeded(): void {
  // Only load polyfills if browser actually needs them
  const needsPolyfills = (
    !window.fetch || 
    !window.navigator?.clipboard ||
    !('eval' in window) ||
    typeof window.eval?.('(() => { try { return {}?.test; } catch { return false; } })()') === 'undefined'
  );
  
  if (needsPolyfills) {
    console.log('🔧 Loading polyfills for browser compatibility');
    import("./polyfills").then(module => {
      module.initializePolyfills();
    }).catch(error => {
      console.warn('Polyfills failed to load:', error);
    });
  } else {
    console.log('✅ Modern browser detected - no polyfills needed');
  }
}

// PHASE 3A: Defer non-critical tracking and performance scripts
// These will be loaded after user interaction or with delay

// CRITICAL FIX: Load GCLID tracking immediately on DOMContentLoaded
// GCLID must be captured immediately for Google ads attribution - no deferral!
function loadCriticalGclidTracking(): void {
  import("./lib/gclid-tracking").then(module => {
    // Initialize GCLID tracking immediately
    module.initializeGclidTracking();
    console.log('✅ CRITICAL: GCLID tracking initialized immediately for ads attribution');
  }).catch(error => {
    console.error('❌ CRITICAL: GCLID tracking failed to load - ads attribution at risk!', error);
  });
}

// Function to load non-critical performance scripts (deferred until after page loads)
function loadNonCriticalPerformanceScripts(): void {
  // PERFORMANCE FIX: Only load monitoring in development, skip in production
  if (import.meta.env.DEV) {
    // Load Web Vitals monitoring only in development
    import("./utils/web-vitals-monitor").then(module => {
      module.initializeWebVitalsMonitoring();
    }).catch(error => {
      console.warn('Web Vitals monitoring failed to load:', error);
    });
    
    console.log('✅ Development performance monitoring loaded');
  } else {
    // In production, skip heavy monitoring scripts that slow LCP
    console.log('✅ Production: Skipping performance monitoring for faster LCP');
  }
}

// Set up critical GCLID loading on DOMContentLoaded (immediate for ads attribution)
function setupCriticalGclidLoading(): void {
  // Load GCLID tracking immediately on DOM ready (critical for ads attribution)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCriticalGclidTracking);
  } else {
    // DOM already ready, load immediately
    loadCriticalGclidTracking();
  }
}

// Set up polyfill loading after initial render (non-blocking)
function setupPolyfillLoading(): void {
  // Load polyfills after React has mounted (non-critical path)
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => loadPolyfillsIfNeeded(), { timeout: 1000 });
  } else {
    setTimeout(loadPolyfillsIfNeeded, 100);
  }
}

// Set up deferred loading for non-critical performance scripts only
function setupDeferredLoading(): void {
  let scriptsLoaded = false;
  
  // Load after user interaction (only non-critical performance scripts)
  const triggerEvents = ['click', 'scroll', 'touchstart', 'keydown'];
  const triggerLoad = () => {
    if (!scriptsLoaded) {
      scriptsLoaded = true;
      loadNonCriticalPerformanceScripts(); // Only non-critical scripts deferred
      
      // Remove event listeners after loading
      triggerEvents.forEach(event => {
        document.removeEventListener(event, triggerLoad, { passive: true } as any);
      });
    }
  };
  
  // Set up event listeners for user interaction
  triggerEvents.forEach(event => {
    document.addEventListener(event, triggerLoad, { passive: true, once: true });
  });
  
  // PERFORMANCE FIX: Load after window.load + idle time (much later than LCP)
  window.addEventListener('load', () => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        if (!scriptsLoaded) triggerLoad();
      }, { timeout: 8000 });
    } else {
      // Fallback: Load after 8 seconds if no requestIdleCallback
      setTimeout(() => {
        if (!scriptsLoaded) triggerLoad();
      }, 8000);
    }
  });
}

// Ensure conversion tracking functions are available globally
declare global {
  interface Window {
    triggerFormStartConversion: () => void;
    triggerFormSubmitConversion: () => void;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// CRITICAL FIX: Remove global error suppression that hides bugs
// Proper error handling without hiding critical issues
window.addEventListener('unhandledrejection', (event) => {
  // Log the error for debugging but don't prevent in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled promise rejection:', event.reason);
  }
  // Only prevent in production for user experience, but still log
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled promise rejection (production):', event.reason);
    event.preventDefault(); // Only prevent in production after logging
  }
});

window.addEventListener('error', (event) => {
  // Log the error for debugging but don't prevent in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Global error:', event.error || event.message);
  }
  // Only prevent in production for user experience, but still log
  if (process.env.NODE_ENV === 'production') {
    console.error('Global error (production):', event.error || event.message);
    event.preventDefault(); // Only prevent in production after logging
  }
});

// Render React app with mobile-optimized root
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

// CRITICAL FIX: Initialize critical GCLID tracking immediately
setupCriticalGclidLoading();

// PERFORMANCE FIX: Initialize polyfill loading after React mounts
setupPolyfillLoading();

// PHASE 3A: Initialize deferred script loading for non-critical scripts only
setupDeferredLoading();

// Safe performance optimization without external files

// MOBILE PERFORMANCE: Optimized image loading strategy
document.addEventListener('DOMContentLoaded', () => {
  // Aggressive lazy loading for mobile performance
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    // Keep first 2 images eager for LCP, rest lazy
    if (index < 2) {
      img.loading = 'eager';
      img.decoding = 'sync'; // Immediate decode for above-fold
    } else {
      img.loading = 'lazy';
      img.decoding = 'async'; // Background decode for below-fold
    }
  });
});
