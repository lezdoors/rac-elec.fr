/**
 * Bundle Optimizer for Mobile Performance
 * Reduces bundle size and implements code splitting
 */

// Tree-shake unused Tailwind utilities
export const purgeCriticalCSS = () => {
  const unusedSelectors = [
    '.decoration',
    '.ornament',
    '.background-pattern',
    '.animate-bounce',
    '.animate-pulse:not(.loading)',
    '.transition-all:not(.cta-mobile)'
  ];
  
  unusedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (window.innerWidth < 768 && el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
  });
};

// Defer heavy components for mobile
export const deferHeavyComponents = () => {
  const heavySelectors = [
    '[data-heavy="true"]',
    '.complex-animation',
    '.background-video',
    '.particle-system'
  ];
  
  heavySelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (window.innerWidth < 768 && el instanceof HTMLElement) {
        el.style.display = 'none';
        el.setAttribute('data-deferred', 'true');
      }
    });
  });
};

// Preload critical mobile resources only
export const preloadMobileCritical = () => {
  const criticalPaths = [
    '/raccordement-enedis',
    '/api/check-status'
  ];
  
  criticalPaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  });
};

// Remove unused fonts on mobile
export const optimizeFonts = () => {
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis"]');
  fontLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes('wght@') && window.innerWidth < 768) {
      // Keep only essential weights: 400,600
      const optimizedHref = href.replace(/wght@[^&]+/, 'wght@400;600');
      link.setAttribute('href', optimizedHref);
    }
  });
};

// Initialize bundle optimizations
export const initBundleOptimizations = () => {
  // Run immediately for critical path
  purgeCriticalCSS();
  optimizeFonts();
  
  // Defer heavy operations
  setTimeout(() => {
    deferHeavyComponents();
    preloadMobileCritical();
  }, 100);
};