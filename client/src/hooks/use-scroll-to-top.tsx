import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to automatically scroll to top when route changes
 */
export const useScrollToTop = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Force immediate scroll to top when location changes
    window.scrollTo(0, 0);
    
    // Also try with requestAnimationFrame for better compatibility
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location]);
};

/**
 * Hook for smooth scroll to top with optional behavior
 */
export const useScrollToTopSmooth = () => {
  const scrollToTop = (behavior: 'smooth' | 'instant' = 'smooth') => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  };
  
  return scrollToTop;
};