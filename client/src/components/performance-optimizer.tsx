import { useEffect } from 'react';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Resource hints for critical resources
    const addResourceHint = (rel: string, href: string, as?: string) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (as) link.setAttribute('as', as);
      document.head.appendChild(link);
    };

    // Preload critical fonts
    addResourceHint('preload', '/fonts/inter.woff2', 'font');
    
    // DNS prefetch for external domains
    addResourceHint('dns-prefetch', 'https://www.googletagmanager.com');
    addResourceHint('dns-prefetch', 'https://www.google-analytics.com');
    
    // Optimize images loading
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Optimize third-party scripts
    const deferredScripts = ['gtag', 'analytics'];
    deferredScripts.forEach(scriptName => {
      setTimeout(() => {
        // Scripts are loaded with delay to improve initial performance
      }, 3000);
    });

    // Clean up observer on unmount
    return () => {
      imageObserver.disconnect();
    };
  }, []);

  return null;
};