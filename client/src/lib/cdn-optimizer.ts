/**
 * CDN and Asset Optimization for Mobile Performance
 * Implements aggressive caching and asset optimization
 */

// Critical CSS for immediate mobile rendering
export const injectCriticalMobileCSS = () => {
  const criticalCSS = `
    /* Mobile-first critical path CSS */
    html{font-size:16px;-webkit-text-size-adjust:100%}
    body{margin:0;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a202c}
    *{box-sizing:border-box}
    
    /* Hero section for LCP optimization */
    .hero-section{
      min-height:100vh;
      background:linear-gradient(135deg,#0A3A82,#0058B0,#0072CE);
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      position:relative;
    }
    
    .hero-title-mobile{
      font-size:clamp(1.75rem,5vw,4rem);
      font-weight:700;
      line-height:1.1;
      margin:0 0 1.5rem;
      text-align:center;
    }
    
    .cta-mobile{
      background:#10b981;
      color:white;
      padding:1rem 2rem;
      border:none;
      border-radius:0.5rem;
      font-size:1.125rem;
      font-weight:600;
      cursor:pointer;
      text-decoration:none;
      display:inline-flex;
      align-items:center;
      gap:0.5rem;
    }
    
    /* Prevent layout shifts */
    img{max-width:100%;height:auto;display:block}
    
    /* Loading optimization */
    .loading{opacity:0.7;pointer-events:none}
    
    @media(max-width:768px){
      .hero-section{padding:2rem 1rem}
      .container{padding:0 1rem}
    }
  `;
  
  const style = document.createElement('style');
  style.innerHTML = criticalCSS;
  style.setAttribute('data-critical', 'mobile-lcp');
  document.head.insertBefore(style, document.head.firstChild);
};

// Preload critical fonts with optimal loading
export const preloadCriticalFonts = () => {
  const fontPreloads = [
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      weight: '400'
    },
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGlyfAZ9hiJ-Ek-_EeAmhQ.woff2',
      weight: '600'
    }
  ];
  
  fontPreloads.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.href;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Implement resource hints for faster loading
export const addPerformanceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: true },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true }
  ];
  
  hints.forEach(hint => {
    const existing = document.querySelector(`link[href="${hint.href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossOrigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
};

// Defer non-critical resources
export const deferNonCriticalResources = () => {
  // Defer analytics scripts
  const analyticsScripts = document.querySelectorAll('script[src*="gtag"], script[src*="analytics"], script[src*="statcounter"]');
  analyticsScripts.forEach(script => {
    if (!script.hasAttribute('defer')) {
      script.setAttribute('defer', '');
    }
  });
  
  // Defer non-critical stylesheets
  const nonCriticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  nonCriticalStyles.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.includes('critical') && !href.includes('fonts.googleapis')) {
      link.setAttribute('media', 'print');
      link.addEventListener('load', () => {
        link.setAttribute('media', 'all');
      });
    }
  });
};

// Optimize bundle size by removing unused CSS
export const purgeMobileCSS = () => {
  if (window.innerWidth < 768) {
    const unusedClasses = [
      '.hidden',
      '.lg\\:block',
      '.xl\\:flex',
      '.2xl\\:grid',
      '.decoration',
      '.animate-bounce:not(.loading)',
      '.transition-all:not(.cta-mobile)'
    ];
    
    const style = document.createElement('style');
    style.innerHTML = unusedClasses.map(cls => `${cls}{display:none!important}`).join('');
    style.setAttribute('data-mobile-purge', 'true');
    document.head.appendChild(style);
  }
};

// Initialize all CDN optimizations
export const initCDNOptimizations = () => {
  // Critical path optimizations (immediate)
  injectCriticalMobileCSS();
  addPerformanceHints();
  preloadCriticalFonts();
  
  // Deferred optimizations
  requestAnimationFrame(() => {
    deferNonCriticalResources();
    purgeMobileCSS();
  });
};