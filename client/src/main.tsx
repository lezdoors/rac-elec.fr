// Load browser compatibility polyfills first
import "./polyfills";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

// Function to load non-critical performance scripts (can be deferred)
function loadNonCriticalPerformanceScripts(): void {
  // Load performance optimizers after user interaction (non-critical)
  import("./utils/gentle-performance").catch(error => {
    console.warn('Gentle performance optimizer failed to load:', error);
  });

  // Load LCP monitor after user interaction (non-critical)
  import("./utils/lcp-monitor").catch(error => {
    console.warn('LCP monitor failed to load:', error);
  });

  console.log('✅ Non-critical performance scripts loaded after user interaction');
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
function setupCriticalGclidLoading(): void {
  // Load GCLID tracking immediately on DOM ready (critical for ads attribution)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCriticalGclidTracking);
  } else {
    // DOM already ready, load immediately
    loadCriticalGclidTracking();
  }
}

// PHASE 3A: Initialize deferred script loading for non-critical scripts only
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

  // Fallback: Load after 3 seconds if no user interaction
  setTimeout(() => {
    if (!scriptsLoaded) {
      triggerLoad();
    }
  }, 3000);
}

// Render React app with mobile-optimized root
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// Add error boundary for startup issues
try {
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  root.render(
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
        <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement de l'application.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Recharger la page
        </button>
      </div>
    </div>
  );
}

// CRITICAL FIX: Initialize critical GCLID tracking immediately
setupCriticalGclidLoading();

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