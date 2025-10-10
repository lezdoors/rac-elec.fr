// Web Vitals monitoring for Core Web Vitals tracking
// Safe performance monitoring without external dependencies

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte
};

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function logMetric(name: string, value: number) {
  const rating = getRating(name, value);
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
  console.log(`${emoji} ${name}:`, Math.round(value), `(${rating})`);
  
  // Send to GTM dataLayer (GTM-only setup - no direct gtag)
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'web_vitals',
      metric_name: name,
      metric_value: value,
      metric_rating: rating
    });
  }
}

// Monitor LCP (Largest Contentful Paint)
function monitorLCP() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          logMetric('LCP', lastEntry.startTime);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }
  }
}

// Monitor FID (First Input Delay)
function monitorFID() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            logMetric('FID', fid);
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }
  }
}

// Monitor CLS (Cumulative Layout Shift)
function monitorCLS() {
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        logMetric('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }
  }
}

// Monitor TTFB (Time to First Byte)
function monitorTTFB() {
  if ('performance' in window && 'getEntriesByType' in performance) {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        logMetric('TTFB', ttfb);
      }
    } catch (e) {
      console.warn('TTFB monitoring not supported');
    }
  }
}

// Initialize all Web Vitals monitoring
export function initializeWebVitalsMonitoring() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  console.log('🔍 Initializing Core Web Vitals monitoring...');
  
  // Monitor all Core Web Vitals
  monitorLCP();
  monitorFID();
  monitorCLS();
  monitorTTFB();
  
  console.log('✅ Core Web Vitals monitoring active');
}

// Export for manual use
export { logMetric, getRating };