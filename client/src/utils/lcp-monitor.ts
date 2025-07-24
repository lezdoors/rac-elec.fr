/**
 * LCP Performance Monitor
 * Tracks Largest Contentful Paint improvements and reports metrics
 */

interface LCPMetric {
  value: number;
  element?: Element;
  url?: string;
  timestamp: number;
}

class LCPMonitor {
  private static instance: LCPMonitor;
  private lcpValue: number = 0;
  private isMonitoring: boolean = false;
  private observer: PerformanceObserver | null = null;

  static getInstance(): LCPMonitor {
    if (!LCPMonitor.instance) {
      LCPMonitor.instance = new LCPMonitor();
    }
    return LCPMonitor.instance;
  }

  init() {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.startLCPMonitoring();
    this.optimizeCriticalPath();
  }

  private startLCPMonitoring() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.lcpValue = lastEntry.startTime;
          this.reportLCPMetric({
            value: this.lcpValue,
            element: lastEntry.element,
            timestamp: Date.now()
          });
        }
      });

      try {
        this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }
    }
  }

  private reportLCPMetric(metric: LCPMetric) {
    const isGood = metric.value < 2500;
    const needsImprovement = metric.value >= 2500 && metric.value < 4000;
    const isPoor = metric.value >= 4000;

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      const status = isGood ? '✅ Good' : needsImprovement ? '⚠️ Needs Improvement' : '❌ Poor';
      console.log(`LCP: ${metric.value.toFixed(0)}ms ${status}`);
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'web_vitals', {
        name: 'LCP',
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: isGood ? 'good' : needsImprovement ? 'needs-improvement' : 'poor'
      });
    }
  }

  private optimizeCriticalPath() {
    // Mark LCP elements for priority loading
    const lcpCandidates = document.querySelectorAll('[data-lcp-target]');
    lcpCandidates.forEach(element => {
      element.setAttribute('data-priority', 'high');
      
      // Preload critical images
      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        if (img.loading === 'lazy') {
          img.loading = 'eager';
        }
      }
    });

    // Optimize hero section specifically
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.setAttribute('data-optimized', 'lcp');
    }
  }

  getLCPValue(): number {
    return this.lcpValue;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isMonitoring = false;
  }
}

// Export singleton instance
export const lcpMonitor = LCPMonitor.getInstance();

// Auto-initialize
if (typeof window !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => lcpMonitor.init());
  } else {
    lcpMonitor.init();
  }
}