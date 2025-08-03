import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Lazy loading images optimization
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      lazyImages.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
      });
      
      return () => imageObserver.disconnect();
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalResources = [
        '/favicon-new.svg',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.includes('.css') ? 'style' : 'image';
        document.head.appendChild(link);
      });
    };

    // Cache optimization
    const optimizeCache = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Service worker registration failed, but we continue
        });
      }
    };

    // Form validation enhancement
    const enhanceFormValidation = () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
          input.addEventListener('blur', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const errorElement = target.parentElement?.querySelector('.form-error') as HTMLElement;
            
            if (!target.value && target.hasAttribute('required')) {
              if (errorElement) {
                errorElement.textContent = 'Ce champ est obligatoire';
              }
              target.classList.add('border-red-500');
            } else {
              if (errorElement) {
                errorElement.textContent = '';
              }
              target.classList.remove('border-red-500');
            }
          });

          // Email validation
          if ((input as HTMLInputElement).type === 'email') {
            input.addEventListener('blur', (e: Event) => {
              const target = e.target as HTMLInputElement;
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              const errorElement = target.parentElement?.querySelector('.form-error') as HTMLElement;
              
              if (target.value && !emailRegex.test(target.value)) {
                if (errorElement) {
                  errorElement.textContent = 'Format d\'email invalide';
                }
                target.classList.add('border-red-500');
              }
            });
          }

          // Phone validation
          if ((input as HTMLInputElement).type === 'tel') {
            input.addEventListener('blur', (e: Event) => {
              const target = e.target as HTMLInputElement;
              const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
              const errorElement = target.parentElement?.querySelector('.form-error') as HTMLElement;
              
              if (target.value && !phoneRegex.test(target.value)) {
                if (errorElement) {
                  errorElement.textContent = 'Format de téléphone invalide';
                }
                target.classList.add('border-red-500');
              }
            });
          }
        });
      });
    };

    // Initialize optimizations
    preloadCriticalResources();
    optimizeCache();
    enhanceFormValidation();

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      try {
        const perfObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
              console.log('FID:', (entry as any).processingStart - entry.startTime);
            }
          });
        });

        perfObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Performance observer not supported
      }
    }

  }, []);

  return null; // This component doesn't render anything
}