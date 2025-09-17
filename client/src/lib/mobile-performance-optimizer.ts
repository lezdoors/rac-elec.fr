/**
 * Mobile Performance Optimizer
 * Targets LCP < 2.0s and FCP < 1.5s on mobile devices
 */

// Critical CSS for mobile-first approach
export const inlineCriticalMobileCSS = () => {
  const criticalCSS = `
    /* Mobile-first critical styles */
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased}
    body{font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1a202c}
    
    /* Hero section optimized for mobile LCP */
    .hero-mobile{
      min-height:100vh;
      background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:1rem;
    }
    
    .hero-content-mobile{
      max-width:100%;
      text-align:center;
      color:white;
    }
    
    .hero-title-mobile{
      font-size:2rem;
      font-weight:700;
      margin-bottom:1rem;
      line-height:1.2;
    }
    
    /* Critical button styles */
    .cta-mobile{
      background:#48bb78;
      color:white;
      padding:0.875rem 1.5rem;
      border:none;
      border-radius:0.5rem;
      font-size:1rem;
      font-weight:600;
      text-decoration:none;
      display:inline-block;
      touch-action:manipulation;
    }
    
    /* Prevent layout shifts */
    img{max-width:100%;height:auto;display:block}
    .aspect-ratio{position:relative;overflow:hidden}
    .aspect-ratio::before{content:'';display:block;padding-bottom:var(--aspect-ratio)}
    .aspect-ratio>*{position:absolute;top:0;left:0;width:100%;height:100%}
    
    /* Mobile navigation */
    .mobile-nav{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px)}
    
    @media(min-width:768px){
      .hero-title-mobile{font-size:3rem}
      .hero-mobile{padding:2rem}
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};

// Preload critical resources for mobile
export const preloadCriticalMobileResources = () => {
  const criticalResources = [
    { href: '/favicon-new.svg', as: 'image' },
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Optimize images for mobile performance
export const optimizeMobileImages = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach((img, index) => {
    // Skip first image (hero) for LCP optimization
    if (index === 0) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
      return;
    }
    
    // Lazy load all other images
    img.loading = 'lazy';
    img.decoding = 'async';
    
    // Add responsive sizing if missing
    if (!img.style.aspectRatio && img.width && img.height) {
      img.style.aspectRatio = `${img.width} / ${img.height}`;
    }
  });
};

// Defer non-critical JavaScript for mobile
export const deferNonCriticalMobile = () => {
  // Move analytics and tracking to load after user interaction
  const deferredScripts = [
    'gtag',
    'statcounter',
    'analytics',
    'facebook',
    'twitter'
  ];
  
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    const shouldDefer = deferredScripts.some(pattern => src.includes(pattern));
    
    if (shouldDefer && !script.hasAttribute('defer') && !script.hasAttribute('async')) {
      script.setAttribute('defer', '');
    }
  });
};

// Reduce DOM complexity for mobile
export const optimizeMobileDOM = () => {
  // Hide decorative elements on mobile to reduce DOM complexity
  const decorativeElements = document.querySelectorAll('.decoration, .ornament, .background-pattern');
  decorativeElements.forEach(element => {
    if (window.innerWidth < 768 && element instanceof HTMLElement) {
      element.style.display = 'none';
    }
  });
  
  // Simplify animations on mobile for better performance
  if (window.innerWidth < 768) {
    const style = document.createElement('style');
    style.textContent = `
      *,*::before,*::after{
        animation-duration:0.01ms!important;
        animation-iteration-count:1!important;
        transition-duration:0.01ms!important;
        scroll-behavior:auto!important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Service Worker for aggressive caching on mobile
export const initMobileServiceWorker = () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    const swCode = `
      const CACHE_NAME = 'raccordement-elec-v1';
      const CRITICAL_ASSETS = [
        '/',
        '/src/main.tsx',
        '/src/App.tsx',
        '/favicon-new.svg',
      ];
      
      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_ASSETS))
        );
      });
      
      self.addEventListener('fetch', event => {
        if (event.request.destination === 'document' || 
            event.request.destination === 'script' ||
            event.request.destination === 'style') {
          event.respondWith(
            caches.match(event.request)
              .then(response => response || fetch(event.request))
          );
        }
      });
    `;
    
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    
    navigator.serviceWorker.register(swUrl)
      .then(() => console.log('✅ Mobile SW registered'))
      .catch(() => {}); // Silent fail
  }
};

// Initialize all mobile optimizations
export const initMobilePerformanceOptimizations = () => {
  // Run immediately for critical rendering path
  inlineCriticalMobileCSS();
  preloadCriticalMobileResources();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeMobileImages();
      deferNonCriticalMobile();
      optimizeMobileDOM();
    });
  } else {
    optimizeMobileImages();
    deferNonCriticalMobile();
    optimizeMobileDOM();
  }
  
  // Initialize service worker for mobile caching
  if (window.innerWidth < 768) {
    setTimeout(initMobileServiceWorker, 2000);
  }
  
  // Progressive enhancement after load
  window.addEventListener('load', () => {
    // Remove loading placeholders
    document.querySelectorAll('.loading-placeholder').forEach(el => {
      el.remove();
    });
  });
};