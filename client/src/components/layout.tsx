import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import EnedisAuthenticMasterpiece from "@/components/ui/enedis-authentic-logo";
import { 
  Bolt, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Clock,
  Power,
  Zap,
  HelpCircle, 
  ArrowRight, 
  Home, 
  FileText,
  Send,
  ShieldCheck,
  Lock,
  CheckCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ContactModal } from "@/components/contact-modal";
import { ResponsiveFooter } from "@/components/responsive-footer";
import { ModernFooter } from "@/components/modern-footer";


// Utilisation du composant LogoElectricIcon importé depuis "@/components/ui/logo-electric-icon"

// Composant personnalisé pour les liens qui scrollent vers le haut
const ScrollToTopLink = ({ href, className, children, ...props }: any) => {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        // Défiler vers le haut de la page après la navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      aria-label={typeof children === 'string' ? children : undefined}
      role="link"
      {...props}
    >
      {children}
    </Link>
  );
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [cadastreModalOpen, setCadastreModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initialisation
    handleResize();
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Lock background scroll when mobile menu is open (mobile-compatible)
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileMenuOpen]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col">

      
      {/* HEADER HYPER-PERFECTIONNÉ - Interface mobile optimale */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-50 sticky top-0 backdrop-blur-sm">
        <div className="w-full mx-auto pl-3 pr-0 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-[64px] sm:h-[70px] lg:h-[80px]">
            
            {/* LOGO - Parfaitement aligné à gauche et agrandi pour mobile */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-105">
                {/* Logo mobile - agrandi pour meilleure visibilité */}
                <div className="block lg:hidden">
                  <div className="w-[180px] sm:w-[200px] md:w-[220px] h-auto">
                    <EnedisAuthenticMasterpiece size="lg" variant="light" />
                  </div>
                </div>
                {/* Logo desktop */}
                <div className="hidden lg:block">
                  <div className="w-[260px] xl:w-[300px] h-auto">
                    <EnedisAuthenticMasterpiece size="xl" variant="light" />
                  </div>
                </div>
              </Link>
            </div>
            
            {/* NAVIGATION DESKTOP - Centrée */}
            <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-8 xl:space-x-10">
                <Link href="/" className={`relative text-gray-700 hover:text-[#0072CE] transition-all duration-300 font-semibold text-base xl:text-lg py-2 ${location === '/' ? 'text-[#0072CE]' : ''}`}>
                  Accueil
                  {location === '/' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE] rounded-full"></div>}
                </Link>
                <Link href="/nos-services" className={`relative text-gray-700 hover:text-[#0072CE] transition-all duration-300 font-semibold text-base xl:text-lg py-2 ${location === '/nos-services' ? 'text-[#0072CE]' : ''}`}>
                  Nos Services
                  {location === '/nos-services' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE] rounded-full"></div>}
                </Link>
                <Link href="/contact" className={`relative text-gray-700 hover:text-[#0072CE] transition-all duration-300 font-semibold text-base xl:text-lg py-2 ${location === '/contact' ? 'text-[#0072CE]' : ''}`}>
                  Contact
                  {location === '/contact' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE] rounded-full"></div>}
                </Link>
              </div>
            </nav>
            
            {/* SECTION DROITE - Hamburger poussé à droite dans le container */}
            <div className="flex items-center justify-end flex-1 lg:flex-initial">
              
              {/* Téléphone - Caché sur mobile */}
              <a 
                href="tel:0970709570" 
                className="hidden lg:flex items-center text-gray-700 hover:text-[#0072CE] transition-all duration-300 group mr-4 xl:mr-6"
              >
                <Phone className="h-4 w-4 xl:h-5 xl:w-5 mr-2 xl:mr-3 text-[#0072CE] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm xl:text-base whitespace-nowrap">09 70 70 95 70</span>
              </a>
              
              {/* Bouton CTA - SUPPRIMÉ SUR MOBILE comme demandé */}
              <Link 
                href="/raccordement-enedis#top"
                className="hidden lg:inline-flex bg-[#0072CE] text-white hover:bg-[#005bb5] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-lg px-5 py-3 xl:px-6 xl:py-3.5 text-sm xl:text-base mr-4"
              >
                Faire ma demande
              </Link>
              
              {/* Icône hamburger - Maximisée à droite dans le container */}
              <button 
                className="lg:hidden pl-2 pr-2 py-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300 touch-manipulation"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                data-testid="button-open-menu"
              >
                <Menu className="w-7 h-7 text-gray-700 transition-all duration-200" />
              </button>
              
            </div>
          </div>
        </div>
          
        
        {/* MENU MOBILE CONVERSION-FOCUSED - Slide-in from right */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Dark Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Slide-in Menu from Right - Full Screen */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:hidden fixed top-0 right-0 bottom-0 w-screen bg-white shadow-2xl z-50 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navigation mobile"
                data-testid="dialog-mobile-menu"
              >
                {/* Header: Logo + Tagline + Close Button */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 relative z-10">
                  <div className="flex-1">
                    <div className="w-[160px] h-auto mb-1">
                      <EnedisAuthenticMasterpiece size="md" variant="light" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Service de raccordement électrique</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors touch-manipulation relative z-20"
                    aria-label="Fermer le menu"
                    data-testid="button-close-menu"
                    autoFocus
                  >
                    <X className="h-6 w-6 text-gray-700" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Navigation Section */}
                  <div className="px-6 py-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Navigation</h3>
                    <div className="space-y-1">
                      <Link 
                        href="/" 
                        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-medium text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/' ? 'bg-blue-50 text-[#0072CE]' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="link-nav-accueil"
                      >
                        <Home className="h-5 w-5 mr-3 flex-shrink-0" />
                        Accueil
                      </Link>
                      
                      <Link 
                        href="/nos-services" 
                        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-medium text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/nos-services' ? 'bg-blue-50 text-[#0072CE]' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="link-nav-services"
                      >
                        <Zap className="h-5 w-5 mr-3 flex-shrink-0" />
                        Nos Services
                      </Link>
                      
                      <Link 
                        href="/guide-raccordement" 
                        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-medium text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/guide-raccordement' ? 'bg-blue-50 text-[#0072CE]' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="link-nav-guide"
                      >
                        <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                        Guide
                      </Link>
                      
                      <Link 
                        href="/contact" 
                        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-medium text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/contact' ? 'bg-blue-50 text-[#0072CE]' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="link-nav-contact"
                      >
                        <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                        Contact
                      </Link>
                    </div>
                  </div>

                  {/* Help Section */}
                  <div className="px-6 py-5 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Besoin d'aide ?</h3>
                    <a 
                      href="tel:0970709570" 
                      className="flex items-center justify-center w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-[#0072CE] rounded-lg transition-all duration-200 group touch-manipulation mb-3"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="link-phone-help"
                    >
                      <Phone className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-lg">09 70 70 95 70</span>
                    </a>
                    <Link 
                      href="/faq" 
                      className="flex items-center justify-center w-full p-3 text-gray-600 hover:text-[#0072CE] text-sm font-medium transition-colors touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="link-faq"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Consulter la FAQ
                    </Link>
                  </div>
                </div>

                {/* Bottom Sticky CTA Section */}
                <div className="px-6 py-5 border-t border-gray-200 bg-gray-50" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
                  {/* Main CTA Button */}
                  <Link 
                    href="/raccordement-enedis#formulaire-raccordement" 
                    className="flex items-center justify-center w-full bg-[#0072CE] hover:bg-[#005bb5] text-white py-4 rounded-lg transition-all duration-300 font-bold text-base shadow-lg hover:shadow-xl active:scale-95 touch-manipulation mb-4"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-cta-commencer"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Commencer ma demande
                  </Link>
                  
                  {/* Trust Indicators */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-[#0072CE] flex-shrink-0" />
                      <span className="font-medium">+1200 demandes traitées</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Lock className="h-4 w-4 mr-2 text-[#0072CE] flex-shrink-0" />
                      <span className="font-medium">Paiement 100% sécurisé</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-[#0072CE] flex-shrink-0" />
                      <span className="font-medium">Procédure conforme Enedis</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer moderne optimisé pour la performance et le SEO */}
      <ModernFooter />
      
      {/* Modale de contact email */}
      <ContactModal
        defaultOpen={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        source="footer"
      />

      {/* La modale d'appel téléphonique a été supprimée pour remplacer par des liens directs */}
      
      {/* Modale de recherche cadastrale */}
      <Dialog open={cadastreModalOpen} onOpenChange={setCadastreModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-5">
          <DialogHeader>
            <DialogTitle>Recherchez votre parcelle cadastrale</DialogTitle>
            <DialogDescription>
              Trouvez facilement les informations cadastrales de votre terrain
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse du terrain</Label>
              <Input
                id="address"
                placeholder="123 rue de la Liberté, 75001 Paris"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Vous pouvez également consulter directement le service de cadastre en ligne:</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCadastreModalOpen(false)}>Annuler</Button>
            <Button onClick={() => {
              window.open('https://www.cadastre.gouv.fr', '_blank');
              setCadastreModalOpen(false);
            }}>
              Accéder au cadastre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}