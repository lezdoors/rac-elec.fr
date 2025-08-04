import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// Removed EnedisAuthenticMasterpiece import - replaced with new logo
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
  ShieldCheck
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

  return (
    <div className="min-h-screen flex flex-col">

      
      {/* HEADER HYPER-PERFECTIONNÉ - Interface mobile optimale */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-50 sticky top-0 backdrop-blur-sm">
        <div className="w-full mx-auto pl-3 pr-0 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-[64px] sm:h-[70px] lg:h-[80px]">
            
            {/* LOGO - Parfaitement aligné à gauche et agrandi pour mobile */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-105" aria-label="Retour à l'accueil">
                <img src="/logo-portail-raccordement.svg" alt="Portail Raccordement" className="h-10 w-auto sm:h-12" />
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
              >
                {mobileMenuOpen ? (
                  <ChevronRight className="w-7 h-7 text-gray-700 transition-all duration-200 rotate-90" />
                ) : (
                  <Menu className="w-7 h-7 text-gray-700 transition-all duration-200" />
                )}
              </button>
              
            </div>
          </div>
        </div>
          
        
        {/* MENU MOBILE PERFECTIONNÉ - Interface optimale */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-40">
            <div className="px-3 py-5">
              
              {/* Navigation mobile simplifiée */}
              <div className="space-y-1">
                <Link 
                  href="/" 
                  className={`flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-semibold text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/' ? 'bg-blue-50 text-[#0072CE] border-l-4 border-[#0072CE]' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3 flex-shrink-0" />
                  Accueil
                </Link>
                
                <Link 
                  href="/nos-services" 
                  className={`flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-semibold text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/nos-services' ? 'bg-blue-50 text-[#0072CE] border-l-4 border-[#0072CE]' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Zap className="h-5 w-5 mr-3 flex-shrink-0" />
                  Nos Services
                </Link>
                
                <Link 
                  href="/faq" 
                  className={`flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-semibold text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/faq' ? 'bg-blue-50 text-[#0072CE] border-l-4 border-[#0072CE]' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  Guide
                </Link>
                
                <Link 
                  href="/contact" 
                  className={`flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-[#0072CE] font-semibold text-base rounded-lg transition-all duration-200 touch-manipulation ${location === '/contact' ? 'bg-blue-50 text-[#0072CE] border-l-4 border-[#0072CE]' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                  Contact
                </Link>
              </div>
              
              {/* Séparateur */}
              <div className="border-t border-gray-100 my-5"></div>
              
              {/* Actions principales */}
              <div className="space-y-3">
                {/* Bouton principal CTA */}
                <Link 
                  href="/raccordement-enedis#top" 
                  className="flex items-center justify-center w-full bg-[#0072CE] hover:bg-[#005bb5] text-white py-4 rounded-lg transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Send className="h-5 w-5 mr-3" />
                  Faire ma demande
                </Link>
                
                {/* Appel téléphonique */}
                <a 
                  href="tel:0970709570" 
                  className="flex items-center justify-center w-full p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-[#0072CE] rounded-lg transition-all duration-200 group touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Phone className="h-5 w-5 mr-3 text-[#0072CE] group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-base">09 70 70 95 70</span>
                </a>
              </div>
              
            </div>
          </div>
        )}
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