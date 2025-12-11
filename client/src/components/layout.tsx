import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  Briefcase,
  BookOpen,
  Shield
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
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
                <img 
                  src="/logo-service-raccordement.png" 
                  alt="Service Raccordement Électricité - Expert raccordement Enedis" 
                  className="h-[40px] sm:h-[45px] lg:h-[55px] xl:h-[60px] w-auto object-contain"
                />
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
          
        
        {/* MOBILE MENU DRAWER - Using Shadcn Sheet for reliable solid background */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[85%] max-w-sm p-0 bg-white border-l border-gray-200 [&>button]:hidden">
            {/* Custom Header with Logo */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img 
                  src="/logo-service-raccordement.png" 
                  alt="Service Raccordement" 
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navigation Links - Stripe Style */}
            <nav className="flex-1 px-5 py-8 bg-white">
              <div className="space-y-0">
                <Link 
                  href="/" 
                  className="flex items-center justify-between py-4 text-gray-800 hover:text-[#635bff] transition-colors border-b border-dashed border-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-[17px] font-semibold">Accueil</span>
                </Link>
                <Link 
                  href="/nos-services" 
                  className="flex items-center justify-between py-4 text-gray-800 hover:text-[#635bff] transition-colors border-b border-dashed border-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-[17px] font-semibold">Nos Services</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link 
                  href="/guide-raccordement" 
                  className="flex items-center justify-between py-4 text-gray-800 hover:text-[#635bff] transition-colors border-b border-dashed border-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-[17px] font-semibold">Guide</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </nav>
            
            {/* Divider */}
            <div className="mx-5 border-t border-gray-100 bg-white" />
            
            {/* Bottom Section */}
            <div className="px-5 py-6 space-y-5 bg-white">
              {/* Primary CTA */}
              <Link 
                href="/raccordement-enedis#formulaire-raccordement"
                onClick={() => setMobileMenuOpen(false)}
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
          </SheetContent>
        </Sheet>
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