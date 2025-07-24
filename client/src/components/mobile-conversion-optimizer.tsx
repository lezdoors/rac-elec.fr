import { useEffect, useState } from 'react';
import '../styles/mobile-optimizations.css';

interface MobileConversionOptimizerProps {
  children: React.ReactNode;
}

/**
 * Mobile Conversion Optimizer Component
 * Enhances mobile experience for better conversions while preserving desktop layout
 */
export default function MobileConversionOptimizer({ children }: MobileConversionOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (isMobile) {
      // Mobile-specific optimizations
      document.body.classList.add('mobile-optimized');
      
      // Enhanced touch feedback
      const handleTouchStart = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.mobile-touch-feedback')) {
          target.style.transform = 'scale(0.98)';
        }
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.mobile-touch-feedback')) {
          setTimeout(() => {
            target.style.transform = '';
          }, 150);
        }
      };
      
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        document.body.classList.remove('mobile-optimized');
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile]);
  
  return (
    <div className={`mobile-conversion-wrapper ${isMobile ? 'is-mobile' : 'is-desktop'}`}>
      {children}
    </div>
  );
}

/**
 * Enhanced Mobile Button Component
 * Better visibility and conversion rates on mobile
 */
export function MobileEnhancedButton({ 
  children, 
  className = '', 
  onClick,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`
        mobile-touch-target mobile-touch-feedback mobile-performance-hint
        sm:transform-none sm:hover:scale-105 
        transition-all duration-200 ease-out
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Enhanced Mobile Input Component  
 * Better usability and prevents zoom on iOS
 */
export function MobileEnhancedInput({ 
  className = '', 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`
        mobile-input-enhanced mobile-performance-hint
        sm:text-base sm:p-3 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${className}
      `}
      {...props}
    />
  );
}

/**
 * Enhanced Mobile Card Component
 * Better touch targets and visual feedback
 */
export function MobileEnhancedCard({ 
  children, 
  className = '',
  clickable = false,
  onClick,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { clickable?: boolean }) {
  return (
    <div
      className={`
        mobile-card-enhanced mobile-performance-hint
        ${clickable ? 'mobile-touch-feedback cursor-pointer' : ''}
        sm:p-6 sm:shadow-sm sm:hover:shadow-md
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}