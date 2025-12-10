import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import serviceLogo from "@assets/service-logo.png.png_1765371343702.png";

export function ProfessionalHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePrimaryCta = () => {
    // Trigger Google Ads form_start conversion
    if (typeof window !== 'undefined' && (window as any).triggerFormStartConversion) {
      try {
        (window as any).triggerFormStartConversion();
        console.log('Form start conversion triggered from header CTA');
      } catch (error) {
        console.error('Error triggering form start conversion:', error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Lockup: Icon | Separator | Two-line text */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Logo Icon */}
              <img 
                src={serviceLogo} 
                alt="Service Raccordement Electricite" 
                className="w-8 h-8 object-contain"
              />
              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              {/* Two-line Brand Text */}
              <div className="hidden sm:flex flex-col">
                <span className="text-base font-semibold text-gray-900 leading-tight">
                  Service Raccordement Electricite
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
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 font-semibold rounded-lg min-h-11"
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              href="/nos-services" 
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nos services
            </Link>
            <Link 
              href="/contact" 
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <a 
              href="tel:+33970709570" 
              className="block text-blue-600 hover:text-blue-800 font-medium py-2"
              aria-label="Appeler le 09 70 70 95 70"
            >
              09 70 70 95 70
            </a>
          </div>
        )}
      </div>
    </header>
  );
}