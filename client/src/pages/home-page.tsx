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
            {/* Main Title - Per requirements */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Raccordement électrique Enedis, simplifié.
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

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50" id="faq-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="flex justify-center mb-6">
                <img 
                  src="@assets/FAQ_1758491045946.png" 
                  alt="Service client FAQ"
                  className="w-20 h-20"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-gray-600">Trouvez les réponses aux questions les plus courantes sur les raccordements Enedis</p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              
              <details className="bg-white rounded-lg shadow-sm border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src="@assets/Raccordement-Definitif_1758491045946.png" alt="Raccordement définitif" className="w-8 h-8" />
                    <span className="font-semibold text-gray-900">Qu'est-ce qu'un raccordement définitif ?</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">Un raccordement définitif permet d'alimenter votre logement ou local professionnel de façon permanente. Il est nécessaire pour toute nouvelle construction ou rénovation importante nécessitant une nouvelle arrivée électrique.</p>
                </div>
              </details>

              <details className="bg-white rounded-lg shadow-sm border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src="@assets/Raccordement-Provisoire_1758491045946.png" alt="Raccordement provisoire" className="w-8 h-8" />
                    <span className="font-semibold text-gray-900">Dans quels cas demander un raccordement provisoire ?</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">Le raccordement provisoire est idéal pour les chantiers temporaires, événements ou installations de courte durée (maximum 18 mois). Il permet d'avoir une alimentation électrique temporaire pour vos besoins ponctuels.</p>
                </div>
              </details>

              <details className="bg-white rounded-lg shadow-sm border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src="@assets/augmentation de puissance_1758491045946.png" alt="Augmentation puissance" className="w-8 h-8" />
                    <span className="font-semibold text-gray-900">Comment augmenter la puissance de mon compteur ?</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">L'augmentation de puissance peut se faire directement via votre compteur Linky pour certaines puissances, ou nécessiter des travaux Enedis pour des puissances plus importantes. Nous vous accompagnons dans cette démarche.</p>
                </div>
              </details>

              <details className="bg-white rounded-lg shadow-sm border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src="@assets/Photovoltaic_1758491045946.png" alt="Photovoltaïque" className="w-8 h-8" />
                    <span className="font-semibold text-gray-900">Quel raccordement pour mes panneaux solaires ?</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">Le raccordement photovoltaïque nécessite une demande spécifique auprès d'Enedis pour pouvoir injecter l'électricité produite dans le réseau. Nous gérons toutes les démarches administratives pour votre projet solaire.</p>
                </div>
              </details>

              <details className="bg-white rounded-lg shadow-sm border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src="@assets/Raccordement-Collectif_1758491045946.png" alt="Raccordement collectif" className="w-8 h-8" />
                    <span className="font-semibold text-gray-900">Qu'est-ce qu'un raccordement collectif ?</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">Le raccordement collectif concerne les immeubles, lotissements ou zones d'activité nécessitant plusieurs points de livraison. Il implique la création d'une infrastructure partagée pour alimenter plusieurs logements ou locaux.</p>
                </div>
              </details>

              <details className="bg-white rounded-lg shadow-sm border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src="@assets/Completer-Formulaire_1758491045946.png" alt="Compléter formulaire" className="w-8 h-8" />
                    <span className="font-semibold text-gray-900">Quels documents fournir pour ma demande ?</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">Les documents requis dépendent de votre projet : plan de masse, permis de construire, plan architectural, certificat d'urbanisme. Nous vous guidons pour constituer votre dossier complet selon votre situation.</p>
                </div>
              </details>

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

      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            09 70 70 95 70 · contact@raccordement-connect.com · horaires 8h–18h
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <Link href="/mentions-legales" className="hover:text-white mr-4">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:text-white">Politique de confidentialité</Link>
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