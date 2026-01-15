import { useState, useEffect } from 'react';

const getInitialMobileState = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getInitialMobileState);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}