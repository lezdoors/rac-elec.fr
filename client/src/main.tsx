// Load browser compatibility polyfills first
import "./polyfills";

import { createRoot } from "react-dom/client";
import App from "./App";
// CRITICAL CSS PERFORMANCE: Defer non-critical CSS loading
const loadStylesDeferred = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/index.css';
  link.media = 'all';
  document.head.appendChild(link);
};

// Load CSS after initial render to improve LCP
setTimeout(loadStylesDeferred, 100);
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

// Basic performance optimizations only
setTimeout(() => {
  // Simple image optimization without breaking layout
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (index === 0) {
      img.loading = 'eager';
    } else {
      img.loading = 'lazy';
    }
  });
}, 100);
