import { useState, useEffect } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'wouter';

export function FloatingCtaButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const observeHero = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHeroVisible(entry.isIntersecting);
          // Show floating button when hero is not visible
          setIsVisible(!entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px 0px 0px'
      }
    );

    observeHero.observe(heroSection);

    // Also hide when in form sections
    const formSections = document.querySelectorAll('form, [data-form-section]');
    const observeForm = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(false);
          } else if (!isHeroVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    formSections.forEach(form => {
      observeForm.observe(form);
    });

    return () => {
      observeHero.disconnect();
      observeForm.disconnect();
    };
  }, [isHeroVisible]);

  // Don't render on desktop screens
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <Link href="/raccordement-enedis#top">
      <div 
        className={`floating-cta ${isVisible ? 'floating-cta-visible' : 'floating-cta-hidden'}`}
        style={{
          position: 'fixed',
          bottom: '15px',
          right: '15px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #007bff, #0056b3)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '14px 20px',
          fontWeight: '600',
          fontSize: '13px',
          boxShadow: '0 4px 20px rgba(0,123,255,0.4)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: '60px',
          animation: isVisible ? 'gentle-pulse 3s infinite' : 'none',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)',
          opacity: isVisible ? 1 : 0,
          touchAction: 'manipulation',
          userSelect: 'none',
          willChange: 'transform, opacity'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isVisible ? 'translateY(-2px) scale(1.02)' : 'translateY(100px) scale(0.8)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,123,255,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isVisible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,123,255,0.4)';
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = isVisible ? 'translateY(0) scale(0.95)' : 'translateY(100px) scale(0.8)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = isVisible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)';
        }}
        aria-label="Démarrer ma demande de raccordement électrique"
        role="button"
      >
        <Phone className="h-4 w-4" />
        <span>Démarrer ma demande</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}