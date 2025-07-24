/**
 * Critical Performance Optimizations for Mobile LCP/FCP
 * Target: LCP < 2.0s, FCP < 1.5s on 3G networks
 */

// Inline critical CSS for immediate rendering
export const inlineCriticalCSS = () => {
  const criticalStyles = `
    /* Critical mobile-first styles for instant render */
    html{font-size:16px;-webkit-text-size-adjust:100%;scroll-behavior:smooth}
    body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a202c;background:#fff}
    *{box-sizing:border-box}
    
    /* Hero critical styles for LCP */
    .hero-section{
      min-height:100vh;
      background:linear-gradient(135deg,#0A3A82 0%,#0058B0 50%,#0072CE 100%);
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      position:relative;
      overflow:hidden;
    }
    
    .hero-title-mobile{
      font-size:clamp(1.75rem,5vw,4rem);
      font-weight:700;
      line-height:1.1;
      margin:0 0 1.5rem 0;
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
      transition:background-color 0.2s;
      text-decoration:none;
      display:inline-flex;
      align-items:center;
      gap:0.5rem;
    }
    
    .cta-mobile:hover{background:#059669}
    
    /* Prevent CLS */
    img{max-width:100%;height:auto;display:block}
    .container{max-width:1200px;margin:0 auto;padding:0 1rem}
    
    /* Loading states */
    .loading{opacity:0.7;pointer-events:none}
    .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
    
    @keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @media(max-width:768px){.hero-section{padding:2rem 1rem}}
  `;
  
  const style = document.createElement('style');
  style.innerHTML = criticalStyles;
  style.setAttribute('data-critical', 'mobile');
  document.head.insertBefore(style, document.head.firstChild);
};

// Preload critical resources with priority hints
export const preloadCriticalResources = () => {
  const resources = [
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    },
    {
      href: '/favicon-new.svg',
      as: 'image'
    }
  ];
  
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};

// Resource hints for faster navigation
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: true },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
  ];
  
  hints.forEach(hint => {
    if (!document.querySelector(`link[href="${hint.href}"]`)) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossorigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
};

// Defer non-critical scripts for better FCP
export const deferNonCriticalScripts = () => {
  const scripts = document.querySelectorAll('script:not([data-critical])');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && !src.includes('main.tsx') && !script.hasAttribute('defer')) {
      script.setAttribute('defer', '');
    }
  });
};

// Optimize images for mobile performance
export const optimizeImages = () => {
  const images = document.querySelectorAll('img:not([data-optimized])');
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    
    // First image gets priority for LCP
    if (index === 0) {
      htmlImg.loading = 'eager';
      if ('fetchPriority' in htmlImg) {
        (htmlImg as any).fetchPriority = 'high';
      }
    } else {
      htmlImg.loading = 'lazy';
      htmlImg.decoding = 'async';
    }
    
    // Add aspect ratio to prevent CLS
    if (htmlImg.width && htmlImg.height && !htmlImg.style.aspectRatio) {
      htmlImg.style.aspectRatio = `${htmlImg.width} / ${htmlImg.height}`;
    }
    
    htmlImg.setAttribute('data-optimized', 'true');
  });
};

// Remove animations on mobile for performance
export const simplifyMobileAnimations = () => {
  if (window.innerWidth < 768) {
    const style = document.createElement('style');
    style.innerHTML = `
      *,*::before,*::after{
        animation-duration:0.01ms!important;
        animation-iteration-count:1!important;
        transition-duration:0.01ms!important;
      }
    `;
    style.setAttribute('data-performance', 'mobile-animations');
    document.head.appendChild(style);
  }
};

// Initialize all critical performance optimizations
export const initCriticalPerformance = () => {
  // Immediate optimizations for critical rendering path
  inlineCriticalCSS();
  addResourceHints();
  preloadCriticalResources();
  
  // DOM-dependent optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      deferNonCriticalScripts();
      simplifyMobileAnimations();
    });
  } else {
    optimizeImages();
    deferNonCriticalScripts();
    simplifyMobileAnimations();
  }
};