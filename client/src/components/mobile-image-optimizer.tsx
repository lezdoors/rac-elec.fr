import { useEffect } from 'react';

export function MobileImageOptimizer() {
  useEffect(() => {
    // Lazy loading implementation for mobile
    const implementLazyLoading = () => {
      const images = document.querySelectorAll('img:not([data-lazy-loaded])');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              
              // Load image
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              
              // Add loaded class for animations
              img.classList.add('lazy-loaded');
              img.setAttribute('data-lazy-loaded', 'true');
              
              // Stop observing this image
              imageObserver.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px', // Start loading 50px before entering viewport
          threshold: 0.01
        });

        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          
          // Set up lazy loading
          if (imgElement.src && !imgElement.dataset.src) {
            imgElement.dataset.src = imgElement.src;
            imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIvPjwvc3ZnPg=='; // Placeholder
          }
          
          // Add lazy class for styling
          imgElement.classList.add('lazy-image');
          
          imageObserver.observe(imgElement);
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.dataset.src) {
            imgElement.src = imgElement.dataset.src;
            imgElement.removeAttribute('data-src');
          }
        });
      }
    };

    // Mobile-specific image optimization
    const optimizeImagesForMobile = () => {
      if (window.innerWidth <= 768) {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          
          // Add responsive attributes
          imgElement.loading = 'lazy';
          imgElement.decoding = 'async';
          
          // Optimize image sizes for mobile
          if (!imgElement.sizes) {
            imgElement.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
          }
          
          // Add mobile-optimized styles
          if (!imgElement.style.maxWidth) {
            imgElement.style.maxWidth = '100%';
            imgElement.style.height = 'auto';
          }
        });
      }
    };

    // Preload critical images for mobile
    const preloadCriticalImages = () => {
      const criticalImages = [
        '/favicon-new.svg',
        // Add other critical images here
      ];
      
      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Mobile-first loading strategy
    const implementMobileFirstLoading = () => {
      // Progressive image enhancement for mobile
      const images = document.querySelectorAll('img[data-mobile-src]');
      
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        const mobileSrc = imgElement.dataset.mobileSrc;
        const desktopSrc = imgElement.dataset.desktopSrc || imgElement.src;
        
        if (window.innerWidth <= 768 && mobileSrc) {
          imgElement.src = mobileSrc;
        } else if (desktopSrc) {
          imgElement.src = desktopSrc;
        }
      });
    };

    // WebP support detection and optimization
    const optimizeImageFormats = () => {
      const supportsWebP = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      };
      
      if (supportsWebP()) {
        const images = document.querySelectorAll('img[data-webp]');
        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          const webpSrc = imgElement.dataset.webp;
          if (webpSrc) {
            imgElement.src = webpSrc;
          }
        });
      }
    };

    // Network-aware loading for mobile
    const implementNetworkAwareLoading = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (connection) {
          const effectiveType = connection.effectiveType;
          
          // Reduce image quality on slow connections
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            const images = document.querySelectorAll('img[data-low-quality]');
            images.forEach(img => {
              const imgElement = img as HTMLImageElement;
              const lowQualitySrc = imgElement.dataset.lowQuality;
              if (lowQualitySrc) {
                imgElement.src = lowQualitySrc;
              }
            });
          }
        }
      }
    };

    // Initialize all optimizations
    const initializeImageOptimizations = () => {
      implementLazyLoading();
      optimizeImagesForMobile();
      preloadCriticalImages();
      implementMobileFirstLoading();
      optimizeImageFormats();
      implementNetworkAwareLoading();
    };

    // Run on load and resize
    initializeImageOptimizations();
    
    const handleResize = () => {
      optimizeImagesForMobile();
      implementMobileFirstLoading();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    
  }, []);

  return null;
}