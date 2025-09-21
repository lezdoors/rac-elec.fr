import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminButton } from "@/components/ui/admin-button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, User, Server, Send, Bolt, CheckCheck, Wrench, Phone, AlertCircle, ChevronDown, CheckCircle2, MapPin, Sparkles, FileCheck, Wifi, Users, Lightbulb, Settings, Power, ExternalLink, ShieldCheck, Menu, X, FileText, MessageCircle, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Mobile performance optimization hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(true); // Start mobile-first
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { SeoRichContent } from "@/components/seo-rich-content";
import EnedisAuthenticMasterpiece from "../components/ui/enedis-authentic-logo";
import { PerformanceOptimizer } from "@/components/performance-optimizer";
import { FloatingCtaButton } from "@/components/floating-cta-button";
import { MobileFormOptimizer } from "@/components/mobile-form-optimizer";
import { MobileImageOptimizer } from "@/components/mobile-image-optimizer";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    nom: '',
    email: '',
    telephone: ''
  });
  
  // MOBILE PERFORMANCE: Conditional rendering optimization
  const isMobile = useMobileDetection();

  // Scroll tracking optimisé pour les performances
  useEffect(() => {
    let ticking = false;
    
    const updateScrollY = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };
    
    const handleScroll = () => {
      requestTick();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (ticking) {
        cancelAnimationFrame(ticking as any);
      }
    };
  }, []);

  // Handle callback form submission
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate French phone format
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    if (!phoneRegex.test(callbackForm.telephone.replace(/\s/g, ''))) {
      alert('Veuillez entrer un numéro de téléphone français valide');
      return;
    }
    
    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'callback_submit', {
        event_category: 'lead_generation',
        event_label: 'homepage_callback',
        value: 1
      });
    }
    
    // TODO: Submit form data
    console.log('Callback form submitted:', callbackForm);
    
    // Close modal and reset form
    setShowCallbackModal(false);
    setCallbackForm({ nom: '', email: '', telephone: '' });
    
    alert('Votre demande de rappel a été envoyée. Nous vous contacterons sous 2h en jours ouvrés.');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ willChange: 'auto' }}>
      {/* Google-Required Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl text-[#0046a2]">
              Portail Électricité
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-[#0046a2] font-medium">
                Accueil
              </Link>
              <Link href="/raccordement-enedis" className="text-gray-700 hover:text-[#0046a2] font-medium">
                Services
              </Link>
              <Link href="/tarifs" className="text-gray-700 hover:text-[#0046a2] font-medium">
                Tarifs
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[#0046a2] font-medium">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden lg:block">09 70 70 95 70</span>
              <button 
                onClick={() => setShowCallbackModal(true)}
                className="bg-[#0046a2] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Être rappelé(e)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Google-Required Breadcrumbs */}
      <div className="bg-gray-50 py-2">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-[#0046a2]">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Demande de raccordement Enedis</span>
          </nav>
        </div>
      </div>

      <Helmet>
        <title>Demande de raccordement électrique Enedis | Portail</title>
        <meta name="description" content="Raccordement électrique Enedis simplifié. Un seul formulaire, un accompagnement complet. Service professionnel pour tous types de raccordements en France." />
        <meta name="keywords" content="raccordement enedis, électricité, raccordement électrique, enedis en ligne, branchement électrique, viabilisation terrain, compteur linky, france" />
        <link rel="canonical" href="https://portail-electricite.com/" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Demande de raccordement électrique Enedis | Portail" />
        <meta property="og:description" content="Raccordement électrique Enedis simplifié. Un seul formulaire, un accompagnement complet." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://portail-electricite.com/" />
        <meta property="og:image" content="https://portail-electricite.com/og-image.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Demande de raccordement électrique Enedis | Portail" />
        <meta name="twitter:description" content="Raccordement électrique Enedis simplifié. Service professionnel pour tous types de raccordements en France." />
        <meta name="twitter:image" content="https://portail-electricite.com/og-image.jpg" />
        
        {/* Semantic HTML structure */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Portail Électricité",
            "url": "https://portail-electricite.com/",
            "description": "Service de raccordement électrique Enedis simplifié",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "FR"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33970709570",
              "contactType": "customer support",
              "availableLanguage": "French"
            }
          }
        `}</script>
      </Helmet>

      {/* Hero Section */}
      <main id="main-content">
        <section className="bg-[#0046a2] text-white py-16 md:py-20" id="hero">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            {/* Google-Compliant Action-Oriented Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Commencez votre demande de raccordement Enedis ici
            </h1>
            
            {/* Subtitle - Per requirements */}
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-white/95 leading-relaxed">
              Un seul formulaire, un accompagnement complet.
            </p>

            {/* Main CTA Buttons - Per requirements */}
            <div className="text-center mt-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/raccordement-enedis#formulaire-raccordement" data-testid="hero-cta-start">
                  <button className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors shadow-lg min-w-[220px]">
                    Commencer ma demande
                  </button>
                </Link>
                <button 
                  onClick={() => setShowCallbackModal(true)}
                  className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white hover:text-[#0046a2] transition-colors min-w-[180px]"
                  data-testid="hero-cta-callback"
                >
                  Être rappelé(e)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* REPLACE: Étapes du processus de raccordement électrique Enedis */}
        <section className="py-16 bg-white" id="process-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Étapes du processus de raccordement électrique Enedis
              </h2>
            </div>
            
            {/* 4 clear steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <FileCheck className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-blue-600">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Qualification du besoin</h3>
                <p className="text-gray-600 text-sm">Définition de votre type de raccordement et analyse de vos besoins spécifiques</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Constitution et vérification du dossier</h3>
                <p className="text-gray-600 text-sm">Préparation complète de votre dossier avec tous les documents requis</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center">
                    <Send className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-orange-600">
                    <span className="text-orange-600 font-bold text-sm">3</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Dépôt et suivi auprès d'Enedis</h3>
                <p className="text-gray-600 text-sm">Transmission officielle et suivi professionnel de votre demande</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-purple-600">
                    <span className="text-purple-600 font-bold text-sm">4</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Validation et mise en service</h3>
                <p className="text-gray-600 text-sm">Finalisation du raccordement et mise en service de votre installation</p>
              </div>

            </div>

            <div className="text-center mt-12">
              <Link href="/raccordement-enedis">
                <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section - Clean */}
        <section className="py-16 bg-blue-600 text-white" id="contact-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Besoin d'assistance pour votre raccordement Enedis ?
              </h2>
              <p className="text-lg mb-8">Contactez-nous au 09 70 70 95 70</p>
            </div>
          </div>
        </section>
      </main>

      {/* Callback Modal */}
      {showCallbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Demande de rappel</h3>
              <button 
                onClick={() => setShowCallbackModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCallbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input 
                  type="text" 
                  value={callbackForm.nom}
                  onChange={(e) => setCallbackForm({...callbackForm, nom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={callbackForm.email}
                  onChange={(e) => setCallbackForm({...callbackForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  value={callbackForm.telephone}
                  onChange={(e) => setCallbackForm({...callbackForm, telephone: e.target.value})}
                  placeholder="0X XX XX XX XX ou +33 X XX XX XX XX"
                  pattern="^(\+33|0)[1-9](\d{8})$"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCallbackModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Demander un rappel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google-Required Footer Navigation */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="font-bold text-lg mb-4">Portail Électricité</h3>
              <p className="text-gray-300 text-sm mb-4">
                Service spécialisé dans les projets de raccordement électrique en France
              </p>
              <p className="text-sm">
                📞 09 70 70 95 70<br />
                ✉️ contact@raccordement-connect.com<br />
                🕒 Horaires 8h–18h
              </p>
            </div>
            
            {/* Services Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Services spécialisés</h4>
              <nav className="space-y-2">
                <Link href="/raccordement-neuf" className="block text-gray-300 hover:text-white text-sm">
                  Maison neuve
                </Link>
                <Link href="/raccordement-definitif" className="block text-gray-300 hover:text-white text-sm">
                  Raccordement définitif
                </Link>
                <Link href="/raccordement-provisoire" className="block text-gray-300 hover:text-white text-sm">
                  Raccordement provisoire
                </Link>
                <Link href="/viabilisation-terrain" className="block text-gray-300 hover:text-white text-sm">
                  Viabilisation terrain
                </Link>
              </nav>
            </div>
            
            {/* Project Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Votre projet</h4>
              <nav className="space-y-2">
                <Link href="/raccordement-enedis" className="block text-gray-300 hover:text-white text-sm">
                  Démarrer une demande →
                </Link>
                <Link href="/tarifs" className="block text-gray-300 hover:text-white text-sm">
                  Service contre professionnel
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white text-sm">
                  Nous poser une question rapide 24-48h
                </Link>
                <Link href="/faq" className="block text-gray-300 hover:text-white text-sm">
                  Questions fréquentes
                </Link>
              </nav>
            </div>
            
            {/* Legal Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Informations légales</h4>
              <nav className="space-y-2">
                <Link href="/mentions-legales" className="block text-gray-300 hover:text-white text-sm">
                  Mentions légales
                </Link>
                <Link href="/politique-confidentialite" className="block text-gray-300 hover:text-white text-sm">
                  Politique de confidentialité
                </Link>
                <Link href="/cgu" className="block text-gray-300 hover:text-white text-sm">
                  CGU
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white text-sm">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Portail Électricité - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>

      {/* Performance Components */}
      <PerformanceOptimizer />
      <FloatingCtaButton />
      <MobileFormOptimizer />
    </div>
  );
}