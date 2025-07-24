// Performance optimization utilities for Core Web Vitals improvement

export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
};

export const optimizeImages = () => {
  // Convert images to WebP format if supported
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  if (supportsWebP()) {
    // Add WebP support class to body
    document.body.classList.add('webp-support');
  }
};

export const deferNonCriticalCSS = () => {
  // Load non-critical CSS asynchronously
  const loadCSS = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  };

  // Defer loading of non-critical stylesheets
  const nonCriticalStyles = [
    '/styles/animations.css',
    '/styles/secondary.css'
  ];

  nonCriticalStyles.forEach(loadCSS);
};

export const measureCoreWebVitals = () => {
  const metrics = {
    lcp: 0,
    fcp: 0,
    cls: 0,
    fid: 0
  };

  // Measure LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.lcp = lastEntry.startTime;
    console.log('LCP:', metrics.lcp);
  });

  if ('PerformanceObserver' in window) {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Measure FCP
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime;
    console.log('FCP:', metrics.fcp);
  }

  // Measure CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    metrics.cls = clsValue;
    console.log('CLS:', metrics.cls);
  });

  if ('PerformanceObserver' in window) {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  return metrics;
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResources();
      optimizeImages();
      deferNonCriticalCSS();
      measureCoreWebVitals();
    });
  } else {
    preloadCriticalResources();
    optimizeImages();
    deferNonCriticalCSS();
    measureCoreWebVitals();
  }
};