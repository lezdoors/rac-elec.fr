import { useState, useEffect, useCallback } from 'react';
import { Phone, MessageCircle, PhoneCall, X } from 'lucide-react';

export function FloatingContactButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-floating-contact]')) {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded, handleClickOutside]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const bubbleSize = isMobile ? 52 : 56;
  const iconSize = isMobile ? 22 : 24;
  const position = isMobile ? 20 : 32;
  const menuWidth = isMobile ? 200 : 240;

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section') || document.getElementById('formulaire-raccordement');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/raccordement-enedis#formulaire-raccordement';
    }
    setIsExpanded(false);
  };

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-[9998] transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        data-floating-contact
        className="fixed z-[9999]"
        style={{
          bottom: `${position}px`,
          right: `${position}px`,
        }}
      >
        {isExpanded && (
          <div
            role="menu"
            aria-expanded="true"
            className="absolute bottom-[72px] right-0 bg-white rounded-xl border border-gray-200 p-2 transition-all duration-300 ease-out"
            style={{
              minWidth: `${menuWidth}px`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <a
              href="tel:0970709570"
              role="menuitem"
              aria-label="Appeler le 09 70 70 95 70"
              data-testid="contact-option-phone"
              className="flex items-center gap-3 px-4 py-[14px] rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:bg-[#F9FAFB] hover:border-[#3B82F6] hover:-translate-x-0.5 mb-1 no-underline"
              onClick={() => setIsExpanded(false)}
            >
              <Phone size={20} className="text-[#3B82F6] flex-shrink-0" />
              <span className="text-[15px] font-semibold text-[#1F2937]">09 70 70 95 70</span>
            </a>

            <a
              href="https://wa.me/33970709570"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              aria-label="Démarrer un chat en direct"
              data-testid="contact-option-chat"
              className="flex items-center gap-3 px-4 py-[14px] rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:bg-[#F9FAFB] hover:border-[#3B82F6] hover:-translate-x-0.5 mb-1 no-underline"
              onClick={() => setIsExpanded(false)}
            >
              <MessageCircle size={20} className="text-[#3B82F6] flex-shrink-0" />
              <span className="text-[15px] font-medium text-[#1F2937]">Chat en direct</span>
            </a>

            <button
              role="menuitem"
              aria-label="Demander un rappel gratuit"
              data-testid="contact-option-callback"
              className="w-full flex items-center gap-3 px-4 py-[14px] rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:bg-[#F9FAFB] hover:border-[#3B82F6] hover:-translate-x-0.5 bg-transparent"
              onClick={scrollToContact}
            >
              <PhoneCall size={20} className="text-[#3B82F6] flex-shrink-0" />
              <span className="text-[15px] font-medium text-[#1F2937]">Rappel gratuit</span>
            </button>
          </div>
        )}

        <button
          onClick={toggleExpanded}
          aria-label="Options de contact"
          aria-expanded={isExpanded}
          data-testid="floating-contact-button"
          className="relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ease-out hover:scale-105 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
          style={{
            width: `${bubbleSize}px`,
            height: `${bubbleSize}px`,
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
            boxShadow: isExpanded 
              ? '0 6px 28px rgba(30, 58, 138, 0.4)' 
              : '0 4px 20px rgba(30, 58, 138, 0.3)',
            animation: !isExpanded ? 'subtleGlow 4s ease-in-out infinite' : 'none',
          }}
        >
          <div
            className="transition-transform duration-300 ease-out"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            {isExpanded ? (
              <X size={iconSize} className="text-white" />
            ) : (
              <Phone size={iconSize} className="text-white" />
            )}
          </div>
        </button>
      </div>

      <style>{`
        @keyframes subtleGlow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
          }
          50% {
            box-shadow: 0 6px 28px rgba(30, 58, 138, 0.5);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
