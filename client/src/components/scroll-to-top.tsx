import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Multiple attempts to ensure scroll to top works
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll
    scrollToTop();

    // Scroll after a small delay to handle async content
    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 100);

    // Use requestAnimationFrame for better compatibility
    requestAnimationFrame(scrollToTop);
  }, [location]);

  return null;
}