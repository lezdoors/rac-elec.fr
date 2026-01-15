import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, Home, Briefcase, BookOpen, Phone, Shield, Clock, Users } from "lucide-react";
import logoIllu from "@assets/logo-illu_1765394920144.png";

export function ProfessionalHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);


  return (
    <header className={`sticky top-0 z-50 h-16 bg-white/98 backdrop-blur-md border-b border-gray-200 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Lockup: Icon | Separator | Two-line text */}
          <Link href="/" className="flex-shrink-0 outline-none focus:outline-none">
            <div className="flex items-center gap-3">
              {/* Logo Icon */}
              <img 
                src={logoIllu} 
                alt="Service Raccordement Électricité" 
                className="w-10 h-10 object-contain"
              />
              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              {/* Two-line Brand Text */}
              <div className="hidden sm:flex flex-col">
                <span className="text-base font-semibold text-gray-900 leading-tight">
                  Service Raccordement Électricité
                </span>
                <span className="text-xs text-gray-500 leading-tight">
                  Expert raccordement Enedis
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Accueil
            </Link>
            <Link href="/nos-services" className="text-gray-700 hover:text-blue-600 font-medium">
              Nos services
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
              Contact
            </Link>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="tel:+33970709570" 
              className="text-blue-600 hover:text-blue-800 font-medium"
              aria-label="Appeler le 09 70 70 95 70"
            >
              09 70 70 95 70
            </a>
            <Link 
              href="/raccordement-enedis#formulaire-raccordement"
              onClick={handlePrimaryCta}
            >
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 font-semibold rounded-lg min-h-11 shadow-md hover:shadow-lg transition-all duration-150"
                aria-label="Faire ma demande de raccordement"
              >
                Faire ma demande
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu de navigation"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Mobile CTA Button */}
          <div className="md:hidden ml-2">
            <Link 
              href="/raccordement-enedis#formulaire-raccordement"
              onClick={handlePrimaryCta}
            >
              <Button
                size="sm"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-2 text-sm font-semibold rounded-lg min-h-11"
                aria-label="Faire ma demande"
              >
                Faire ma demande
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* Mobile Menu Drawer - Stripe Style */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-50 md:hidden shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <img 
                  src={logoIllu} 
                  alt="Service Raccordement" 
                  className="w-9 h-9 object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-1">
                <Link 
                  href="/" 
                  className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 text-gray-400" />
                  <span className="text-[15px] font-medium">Accueil</span>
                </Link>
                <Link 
                  href="/nos-services" 
                  className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <span className="text-[15px] font-medium">Nos Services</span>
                </Link>
              </div>
            </nav>
            
            {/* Divider */}
            <div className="mx-5 border-t border-gray-100" />
            
            {/* Bottom Section */}
            <div className="px-5 py-6 space-y-5">
              {/* Primary CTA */}
              <Link 
                href="/raccordement-enedis#formulaire-raccordement"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handlePrimaryCta();
                }}
                className="block"
              >
                <Button
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 h-12 text-[15px] font-semibold rounded-lg"
                >
                  Faire ma demande
                </Button>
              </Link>
              
              {/* Phone Contact */}
              <a 
                href="tel:+33970709570" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Appeler le 09 70 70 95 70"
              >
                <Phone className="h-5 w-5 text-blue-500" />
                <span className="text-[15px] font-medium">09 70 70 95 70</span>
              </a>
              
              {/* Trust Indicators */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 px-4">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-[13px] text-gray-500">Paiement 100 % sécurisé</span>
                </div>
                <div className="flex items-center gap-3 px-4">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-[13px] text-gray-500">Dossier traité sous 48 h</span>
                </div>
                <div className="flex items-center gap-3 px-4">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-[13px] text-gray-500">Service client en France</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}