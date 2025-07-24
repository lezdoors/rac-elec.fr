import { useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Composant pour l'amélioration progressive
export const ProgressiveEnhancement = ({ 
  children, 
  fallback,
  feature,
  className
}: {
  children: ReactNode;
  fallback: ReactNode;
  feature: string;
  className?: string;
}) => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Vérifier le support des fonctionnalités
    const checkSupport = () => {
      switch (feature) {
        case 'intersectionObserver':
          return 'IntersectionObserver' in window;
        case 'webp':
          return document.createElement('canvas').toDataURL('image/webp').indexOf('webp') > -1;
        case 'cssGrid':
          return CSS.supports('display', 'grid');
        case 'cssCustomProperties':
          return CSS.supports('color', 'var(--test)');
        case 'modernInput':
          return 'validity' in document.createElement('input');
        default:
          return true;
      }
    };

    setIsSupported(checkSupport());
  }, [feature]);

  return (
    <div className={cn("progressive-enhancement", className)}>
      {isSupported ? children : fallback}
    </div>
  );
};

// Hook pour la détection des capacités du navigateur
export const useFeatureDetection = () => {
  const [capabilities, setCapabilities] = useState({
    intersectionObserver: false,
    webp: false,
    cssGrid: false,
    cssCustomProperties: false,
    modernInput: false,
    touchSupport: false,
    reducedMotion: false
  });

  useEffect(() => {
    const detectCapabilities = () => {
      setCapabilities({
        intersectionObserver: 'IntersectionObserver' in window,
        webp: document.createElement('canvas').toDataURL('image/webp').indexOf('webp') > -1,
        cssGrid: CSS.supports('display', 'grid'),
        cssCustomProperties: CSS.supports('color', 'var(--test)'),
        modernInput: 'validity' in document.createElement('input'),
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    };

    detectCapabilities();
  }, []);

  return capabilities;
};

// Composant d'image optimisée avec support WebP
export const OptimizedImage = ({
  src,
  webpSrc,
  alt,
  className,
  loading = "lazy",
  ...props
}: {
  src: string;
  webpSrc?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { webp } = useFeatureDetection();

  return (
    <picture className={className}>
      {webp && webpSrc && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img 
        src={src} 
        alt={alt} 
        loading={loading}
        className="w-full h-full object-cover"
        {...props}
      />
    </picture>
  );
};

// Composant pour l'animation avec respect de prefers-reduced-motion
export const AccessibleAnimation = ({
  children,
  className,
  reducedMotionFallback
}: {
  children: ReactNode;
  className?: string;
  reducedMotionFallback?: string;
}) => {
  const { reducedMotion } = useFeatureDetection();

  return (
    <div className={cn(
      reducedMotion ? reducedMotionFallback : className
    )}>
      {children}
    </div>
  );
};