// Load browser compatibility polyfills first
import "./polyfills";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/gclid-tracking";
import "./utils/gentle-performance";
import "./utils/lcp-monitor";

// Ensure conversion tracking functions are available globally
declare global {
  interface Window {
    triggerFormStartConversion: () => void;
    triggerFormSubmitConversion: () => void;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Global error handlers to prevent deployment crashes
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault(); // Silently prevent the default behavior
});

window.addEventListener('error', (event) => {
  event.preventDefault(); // Silently prevent error logging
});

// Render React app with mobile-optimized root
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

// Safe performance optimization without external files

// MOBILE PERFORMANCE: Optimized image loading strategy
setTimeout(() => {
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
}, 50); // Faster execution for mobile
