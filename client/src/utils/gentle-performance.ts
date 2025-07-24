/**
 * Gentle Mobile Performance Optimizations
 * Progressive enhancements that improve LCP without aggressive changes
 */

class GentlePerformanceOptimizer {
  private static instance: GentlePerformanceOptimizer;
  private isInitialized = false;
  private observer: IntersectionObserver | null = null;

  static getInstance(): GentlePerformanceOptimizer {
    if (!GentlePerformanceOptimizer.instance) {
      GentlePerformanceOptimizer.instance = new GentlePerformanceOptimizer();
    }
    return GentlePerformanceOptimizer.instance;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initOptimizations());
    } else {
      this.initOptimizations();
    }
  }

  private initOptimizations() {
    this.optimizeImages();
    this.setupProgressiveLoading();
    this.optimizeFonts();
    this.setupCriticalPathOptimization();
  }

  private optimizeImages() {
    // Progressive image loading without aggressive changes
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.complete) {
            img.classList.add('loaded');
          } else {
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
          }
          this.observer?.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    images.forEach(img => this.observer?.observe(img));
  }

  private setupProgressiveLoading() {
    // Mark above-fold and below-fold content
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.classList.add('above-fold');
    }

    // Mark sections below the fold for progressive loading
    const sections = document.querySelectorAll('section, .service-card, .footer');
    sections.forEach((section, index) => {
      if (index > 1) { // Keep first two sections as critical
        section.classList.add('below-fold');
      }
    });
  }

  private optimizeFonts() {
    // Ensure font-display swap is working
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }
  }

  private setupCriticalPathOptimization() {
    // Identify LCP candidates
    const lcpCandidates = document.querySelectorAll('h1, .hero-content, img, video');
    lcpCandidates.forEach(element => {
      element.setAttribute('data-lcp-target', 'true');
    });

    // Optimize form inputs for mobile
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      (input as HTMLInputElement).setAttribute('autocomplete', 'on');
    });
  }

  // Method to be called when components mount
  optimizeComponent(element: HTMLElement) {
    // Gentle optimizations for dynamically loaded components
    const images = element.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => this.observer?.observe(img));

    // Mark as performance optimized
    element.classList.add('performance-optimized');
  }

  // Clean up resources
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isInitialized = false;
  }
}

// Export singleton instance
export const gentlePerformance = GentlePerformanceOptimizer.getInstance();

// Auto-initialize on import in browser environment
if (typeof window !== 'undefined') {
  gentlePerformance.init();
}