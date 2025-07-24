import { useState, useEffect } from 'react';

interface MobileHeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const MobileHeroImage = ({ src, alt, className = '' }: MobileHeroImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    // Generate responsive sources for mobile performance
    const generateMobileSrc = () => {
      if (window.innerWidth < 768) {
        // Mobile: use smaller, optimized version
        return src.replace(/\.(jpg|jpeg|png)$/i, '_mobile.webp');
      } else if (window.innerWidth < 1200) {
        // Tablet: medium size
        return src.replace(/\.(jpg|jpeg|png)$/i, '_tablet.webp');
      } else {
        // Desktop: full size with WebP
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
    };

    setCurrentSrc(generateMobileSrc());

    // Update source on resize (throttled)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCurrentSrc(generateMobileSrc());
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder to prevent CLS */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 animate-pulse"
          style={{ aspectRatio: '16/9' }}
        />
      )}
      
      <picture>
        {/* Mobile WebP */}
        <source
          media="(max-width: 767px)"
          srcSet={`${src.replace(/\.(jpg|jpeg|png)$/i, '_320w.webp')} 320w, ${src.replace(/\.(jpg|jpeg|png)$/i, '_640w.webp')} 640w`}
          sizes="100vw"
          type="image/webp"
        />
        
        {/* Tablet WebP */}
        <source
          media="(max-width: 1199px)"
          srcSet={`${src.replace(/\.(jpg|jpeg|png)$/i, '_768w.webp')} 768w, ${src.replace(/\.(jpg|jpeg|png)$/i, '_1024w.webp')} 1024w`}
          sizes="100vw"
          type="image/webp"
        />
        
        {/* Desktop WebP */}
        <source
          srcSet={`${src.replace(/\.(jpg|jpeg|png)$/i, '_1280w.webp')} 1280w, ${src.replace(/\.(jpg|jpeg|png)$/i, '_1920w.webp')} 1920w`}
          sizes="100vw"
          type="image/webp"
        />
        
        {/* Fallback */}
        <img
          src={currentSrc || src}
          alt={alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ aspectRatio: '16/9' }}
        />
      </picture>
    </div>
  );
};