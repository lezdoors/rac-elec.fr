import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// Interface pour les métriques de performance
interface PerformanceMetrics {
  cls: number;
  fid: number;
  lcp: number;
  fcp: number;
  ttfb: number;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  navigation?: {
    type: string;
    redirectCount: number;
  };
}

// Hook pour surveiller les Core Web Vitals
export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: 0,
    fid: 0,
    lcp: 0,
    fcp: 0,
    ttfb: 0
  });

  useEffect(() => {
    // Observer pour Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    // Observer pour First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
      }
    });

    // Observer pour Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    // Mesures de navigation
    const measureNavigationTiming = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
        
        setMetrics(prev => ({
          ...prev,
          ttfb,
          fcp,
          navigation: {
            type: (navigation as any).type || 'unknown',
            redirectCount: navigation.redirectCount
          }
        }));
      }
    };

    // Mesures de mémoire (si disponible)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        }));
      }
    };

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      measureNavigationTiming();
      measureMemory();
      
      // Mesure périodique de la mémoire
      const memoryInterval = setInterval(measureMemory, 5000);
      
      return () => {
        clsObserver.disconnect();
        fidObserver.disconnect();
        lcpObserver.disconnect();
        clearInterval(memoryInterval);
      };
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }, []);

  return metrics;
};

// Composant d'affichage des métriques de performance
export const PerformanceDisplay = ({ 
  className,
  showDetails = false 
}: { 
  className?: string;
  showDetails?: boolean;
}) => {
  const metrics = useWebVitals();
  const [isVisible, setIsVisible] = useState(false);

  // Évaluation des seuils Core Web Vitals
  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      lcp: { good: 2500, poor: 4000 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatValue = (metric: string, value: number) => {
    if (metric === 'cls') return value.toFixed(3);
    if (metric === 'memory') return `${(value / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(value)} ms`;
  };

  if (process.env.NODE_ENV === 'production' && !showDetails) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-gray-800 transition-colors"
        aria-label="Afficher les métriques de performance"
      >
        Perf
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64">
          <h4 className="font-semibold text-sm mb-3 text-gray-900">Core Web Vitals</h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={getScoreColor('cls', metrics.cls)}>
                {formatValue('cls', metrics.cls)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={getScoreColor('fid', metrics.fid)}>
                {formatValue('fid', metrics.fid)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={getScoreColor('lcp', metrics.lcp)}>
                {formatValue('lcp', metrics.lcp)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={getScoreColor('fcp', metrics.fcp)}>
                {formatValue('fcp', metrics.fcp)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>TTFB:</span>
              <span className={getScoreColor('ttfb', metrics.ttfb)}>
                {formatValue('ttfb', metrics.ttfb)}
              </span>
            </div>
            
            {metrics.memory && (
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Mémoire:</span>
                  <span className="text-gray-600">
                    {formatValue('memory', metrics.memory.used)}
                  </span>
                </div>
              </div>
            )}
            
            {metrics.navigation && (
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Navigation:</span>
                  <span className="text-gray-600 capitalize">
                    {metrics.navigation.type}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook pour optimiser les images selon les Core Web Vitals
export const useImageOptimization = () => {
  const [shouldOptimize, setShouldOptimize] = useState(false);
  
  useEffect(() => {
    // Détecter la connexion lente
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData;
      setShouldOptimize(isSlowConnection);
    }
    
    // Détecter les appareils avec peu de mémoire
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory <= 2) {
        setShouldOptimize(true);
      }
    }
  }, []);
  
  return { shouldOptimize };
};

// Composant d'image optimisée pour les performances
export const OptimizedImage = ({
  src,
  alt,
  className,
  loading = "lazy",
  priority = false,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { shouldOptimize } = useImageOptimization();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Optimiser la qualité selon les conditions réseau
  const getOptimizedSrc = (originalSrc: string) => {
    if (!shouldOptimize) return originalSrc;
    
    // Ici vous pourriez implémenter une logique pour servir des images de moindre qualité
    // ou utiliser un service d'optimisation d'images
    return originalSrc;
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={getOptimizedSrc(src)}
        alt={alt}
        loading={priority ? "eager" : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "hidden"
        )}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          Image non disponible
        </div>
      )}
    </div>
  );
};