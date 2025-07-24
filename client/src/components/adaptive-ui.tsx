import { useState, useEffect, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Interface pour les capacités de l'appareil
interface DeviceCapabilities {
  isLowEndDevice: boolean;
  hasSlowConnection: boolean;
  prefersReducedMotion: boolean;
  supportsWebP: boolean;
  supportsIntersectionObserver: boolean;
  deviceMemory: number;
  effectiveConnectionType: string;
  saveData: boolean;
}

// Hook pour détecter les capacités de l'appareil
export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isLowEndDevice: false,
    hasSlowConnection: false,
    prefersReducedMotion: false,
    supportsWebP: false,
    supportsIntersectionObserver: true,
    deviceMemory: 4,
    effectiveConnectionType: '4g',
    saveData: false
  });

  useEffect(() => {
    const detectCapabilities = () => {
      const navigator = window.navigator as any;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      // Détecter la mémoire de l'appareil
      const deviceMemory = navigator.deviceMemory || 4;
      const isLowEndDevice = deviceMemory <= 2;

      // Détecter la qualité de connexion
      const effectiveConnectionType = connection?.effectiveType || '4g';
      const hasSlowConnection = ['slow-2g', '2g', '3g'].includes(effectiveConnectionType);
      const saveData = connection?.saveData || false;

      // Détecter les préférences d'accessibilité
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Détecter le support WebP
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('webp') > -1;

      // Détecter IntersectionObserver
      const supportsIntersectionObserver = 'IntersectionObserver' in window;

      setCapabilities({
        isLowEndDevice,
        hasSlowConnection: hasSlowConnection || saveData,
        prefersReducedMotion,
        supportsWebP,
        supportsIntersectionObserver,
        deviceMemory,
        effectiveConnectionType,
        saveData
      });
    };

    detectCapabilities();

    // Écouter les changements de connexion
    const connection = (window.navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', detectCapabilities);
      return () => connection.removeEventListener('change', detectCapabilities);
    }
  }, []);

  return capabilities;
};

// Composant d'image adaptative selon les capacités
export const AdaptiveImage = ({
  src,
  webpSrc,
  lowQualitySrc,
  alt,
  className,
  priority = false,
  ...props
}: {
  src: string;
  webpSrc?: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { supportsWebP, hasSlowConnection, isLowEndDevice } = useDeviceCapabilities();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    // Choisir la meilleure source d'image selon les capacités
    let selectedSrc = src;

    if (hasSlowConnection || isLowEndDevice) {
      selectedSrc = lowQualitySrc || src;
    } else if (supportsWebP && webpSrc) {
      selectedSrc = webpSrc;
    }

    setCurrentSrc(selectedSrc);
  }, [src, webpSrc, lowQualitySrc, supportsWebP, hasSlowConnection, isLowEndDevice]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        {...props}
      />
    </div>
  );
};

// Composant d'animation adaptative
export const AdaptiveAnimation = ({
  children,
  fallback,
  className,
  animationClass,
  reducedMotionClass
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  animationClass?: string;
  reducedMotionClass?: string;
}) => {
  const { prefersReducedMotion, isLowEndDevice } = useDeviceCapabilities();
  
  const shouldReduceAnimation = prefersReducedMotion || isLowEndDevice;
  
  if (shouldReduceAnimation && fallback) {
    return <div className={cn(className, reducedMotionClass)}>{fallback}</div>;
  }

  return (
    <div className={cn(
      className,
      shouldReduceAnimation ? reducedMotionClass : animationClass
    )}>
      {children}
    </div>
  );
};

// Hook pour le lazy loading adaptatif
export const useAdaptiveLazyLoading = () => {
  const { supportsIntersectionObserver, hasSlowConnection } = useDeviceCapabilities();
  
  const createObserver = useCallback((callback: (entry: IntersectionObserverEntry) => void) => {
    if (!supportsIntersectionObserver) {
      // Fallback pour les navigateurs sans IntersectionObserver
      return {
        observe: () => setTimeout(() => callback({} as IntersectionObserverEntry), 100),
        disconnect: () => {}
      };
    }

    const rootMargin = hasSlowConnection ? '200px' : '50px';
    
    return new IntersectionObserver(
      (entries) => entries.forEach(callback),
      { rootMargin }
    );
  }, [supportsIntersectionObserver, hasSlowConnection]);

  return { createObserver };
};

// Composant de contenu adaptatif selon la bande passante
export const AdaptiveContent = ({
  highBandwidthContent,
  lowBandwidthContent,
  className
}: {
  highBandwidthContent: ReactNode;
  lowBandwidthContent: ReactNode;
  className?: string;
}) => {
  const { hasSlowConnection, saveData } = useDeviceCapabilities();
  
  return (
    <div className={className}>
      {hasSlowConnection || saveData ? lowBandwidthContent : highBandwidthContent}
    </div>
  );
};

// Hook pour optimiser les requêtes selon les capacités
export const useAdaptiveRequests = () => {
  const { hasSlowConnection, isLowEndDevice } = useDeviceCapabilities();
  
  const getRequestConfig = useCallback(() => {
    const config = {
      timeout: hasSlowConnection ? 15000 : 8000,
      retries: hasSlowConnection ? 3 : 1,
      batchSize: isLowEndDevice ? 5 : 10,
      prefetch: !hasSlowConnection && !isLowEndDevice
    };
    
    return config;
  }, [hasSlowConnection, isLowEndDevice]);

  const optimizedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const config = getRequestConfig();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, [getRequestConfig]);

  return { getRequestConfig, optimizedFetch };
};

// Composant de mise en page adaptative
export const AdaptiveLayout = ({
  children,
  desktopLayout,
  mobileLayout,
  className
}: {
  children?: ReactNode;
  desktopLayout?: ReactNode;
  mobileLayout?: ReactNode;
  className?: string;
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { isLowEndDevice } = useDeviceCapabilities();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || isLowEndDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isLowEndDevice]);

  if (mobileLayout && isMobile) {
    return <div className={className}>{mobileLayout}</div>;
  }

  if (desktopLayout && !isMobile) {
    return <div className={className}>{desktopLayout}</div>;
  }

  return <div className={className}>{children}</div>;
};

// Hook pour la gestion adaptative des ressources
export const useResourceManagement = () => {
  const { isLowEndDevice, hasSlowConnection } = useDeviceCapabilities();
  
  const shouldPreload = useCallback((resourceType: 'image' | 'script' | 'style') => {
    if (isLowEndDevice || hasSlowConnection) {
      return resourceType === 'style'; // Précharger seulement les styles critiques
    }
    return true;
  }, [isLowEndDevice, hasSlowConnection]);

  const getImageQuality = useCallback(() => {
    if (isLowEndDevice || hasSlowConnection) {
      return 'low';
    }
    return 'high';
  }, [isLowEndDevice, hasSlowConnection]);

  const shouldEnableAnimation = useCallback(() => {
    return !isLowEndDevice;
  }, [isLowEndDevice]);

  return {
    shouldPreload,
    getImageQuality,
    shouldEnableAnimation
  };
};

// Composant pour les notifications adaptatives
export const AdaptiveNotification = ({
  message,
  type = 'info',
  duration,
  className
}: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  className?: string;
}) => {
  const { prefersReducedMotion } = useDeviceCapabilities();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-all duration-200',
      typeStyles[type],
      prefersReducedMotion ? '' : 'animate-in slide-in-from-top-2',
      className
    )}>
      {message}
    </div>
  );
};