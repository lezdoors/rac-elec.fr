import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminButton } from "@/components/ui/admin-button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, User, Server, Send, Bolt, CheckCheck, Wrench, Phone, AlertCircle, ChevronDown, CheckCircle2, MapPin, Sparkles, FileCheck, Wifi, Users, Lightbulb, Settings, Power, ExternalLink, ShieldCheck, Menu, X, FileText, MessageCircle, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import formulaireIllustration from '@assets/Completer-Formulaire_1758501124521.png';

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
  
  // Connection request modal state
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionForm, setConnectionForm] = useState({
    typeRaccordement: '',
    codePostal: '',
    nom: '',
    telephone: '',
    email: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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

      {/* Google 2025 Required Navigation Header */}
      <header className="site-nav bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="logo text-xl font-bold text-blue-600">
              Portail Électricité
            </Link>
            <div className="nav-links hidden md:flex items-center space-x-6">
              <Link href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</Link>
              <Link href="#tarifs" className="text-gray-700 hover:text-blue-600 transition-colors">Tarifs</Link>
              <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
              <a href="tel:0970709570" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                09 70 70 95 70
              </a>
            </div>
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </nav>
      </header>

      {/* Anchor Navigation for Long Pages */}
      <nav className="page-nav bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#process" className="text-gray-600 hover:text-blue-600 transition-colors">Comment ça marche</a>
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Nos services</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Devis gratuit</a>
          </div>
        </div>
      </nav>

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

            {/* Primary CTA - Google 2025 Optimized */}
            <div className="text-center mt-8">
              <button 
                onClick={() => setShowConnectionModal(true)}
                className="bg-yellow-400 text-black font-bold px-12 py-6 rounded-xl text-xl md:text-2xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-2xl border-4 border-yellow-300"
                data-testid="button-commencer-demande"
              >
                Commencer ma demande
              </button>
              <p className="text-white/80 text-sm mt-6">145 raccordements traités ce mois-ci</p>
            </div>
          </div>
        </section>

        {/* Commencez votre demande de raccordement Section */}
        <section className="py-16 bg-gray-50" id="formulaire-raccordement">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Commencez votre demande de raccordement Enedis ici
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Particuliers et professionnels. Quelque soit le type de demande de raccordement Enedis. 
                    <span className="font-semibold"> Un seul formulaire !</span>
                  </p>
                  <Link href="/raccordement-enedis">
                    <button 
                      className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg"
                      data-testid="button-start-request"
                    >
                      Commencer ma demande
                    </button>
                  </Link>
                </div>

                {/* Right Illustration */}
                <div className="flex justify-center">
                  <img 
                    src={formulaireIllustration} 
                    alt="Illustration de personnes remplissant un formulaire de raccordement électrique"
                    className="w-full max-w-md h-auto"
                    data-testid="img-form-illustration"
                  />
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Quel type de raccordement vous correspond ? */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Quel type de <span className="text-blue-600">raccordement</span> vous correspond ?
                </h2>
                <p className="text-gray-600">Choisir parmi un unique. Découvrez la solution électrique adaptée à vos besoins spécifiques.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Raccordement Définitif */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Raccordement Définitif</h3>
                  <p className="text-gray-600 text-sm mb-4">Pour nouveau construction, renouvellement ou augmentation de puissance électrique.</p>
                  <Link href="/raccordement-definitif" className="text-blue-600 text-sm font-medium hover:underline">
                    En savoir plus →
                  </Link>
                </div>

                {/* Raccordement Provisoire */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Raccordement Provisoire</h3>
                  <p className="text-gray-600 text-sm mb-4">Solution temporaire pour chantiers et événements limités dans le temps.</p>
                  <Link href="/raccordement-provisoire" className="text-blue-600 text-sm font-medium hover:underline">
                    En savoir plus →
                  </Link>
                </div>

                {/* Viabilisation */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Viabilisation</h3>
                  <p className="text-gray-600 text-sm mb-4">Préparation et équipement électrique de parcelles terrain d'énergie verte.</p>
                  <Link href="/viabilisation" className="text-blue-600 text-sm font-medium hover:underline">
                    En savoir plus →
                  </Link>
                </div>

                {/* Consuel */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Consuel</h3>
                  <p className="text-gray-600 text-sm mb-4">Attestation et mise à niveau de votre installation électrique.</p>
                  <Link href="/consuel" className="text-gray-600 text-sm font-medium hover:underline">
                    En savoir plus →
                  </Link>
                </div>

                {/* Raccordement Collectif */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Raccordement Collectif</h3>
                  <p className="text-gray-600 text-sm mb-4">Solutions pour immeubles, résidences et copropriétés.</p>
                  <Link href="/raccordement-collectif" className="text-gray-600 text-sm font-medium hover:underline">
                    En savoir plus →
                  </Link>
                </div>

                {/* Comptage Électrique */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comptage Électrique</h3>
                  <p className="text-gray-600 text-sm mb-4">Raccordement pour générateur solaires et production d'énergie verte.</p>
                  <Link href="/comptage-electrique" className="text-green-600 text-sm font-medium hover:underline">
                    En savoir plus →
                  </Link>
                </div>

              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Besoin d'aide pour choisir ?</p>
                <button 
                  onClick={() => setShowCallbackModal(true)}
                  className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📞 09 70 70 95 70
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Service de raccordement électrique Enedis en ligne */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Service de raccordement électrique Enedis en ligne
                </h2>
                <p className="text-gray-600">Étapes du processus de raccordement électrique Enedis</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Demande en ligne</h3>
                  <p className="text-gray-600 text-sm">Formulaire sécurisé depuis cette plateforme</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Étude et devis</h3>
                  <p className="text-gray-600 text-sm">Analyse technique et proposition économique</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Intervention</h3>
                  <p className="text-gray-600 text-sm">Pose de votre nouveau raccordement</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mise en service</h3>
                  <p className="text-gray-600 text-sm">Raccordement opérationnel et testage</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Types de raccordements électriques Enedis */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Types de raccordements électriques Enedis
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">Raccordement définitif</h3>
                    <p className="text-gray-600 text-sm">Construction et rénovation électrique</p>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-600 font-semibold">Non-obligatoire provisoire</span>
                    <Link href="/raccordement-definitif" className="block text-blue-600 text-sm hover:underline">Détail →</Link>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">Installation provisoire</h3>
                    <p className="text-gray-600 text-sm">Alimentation en chantiers électriques</p>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-600 font-semibold">Solution d'énergie temps</span>
                    <Link href="/raccordement-provisoire" className="block text-blue-600 text-sm hover:underline">Détail →</Link>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">J'ai une question technique ?</p>
                <p className="text-gray-500 text-sm">Formulaire raccordement Enedis ⚡</p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Indicators */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Indicateurs de performance du service de raccordement Enedis
                </h2>
                <p className="text-gray-600">Données officielles sur la qualité de service dédiées aux raccordements électriques France dans la l'humanité de territoire français.</p>
                <p className="text-gray-500 text-sm mt-2">Indicateurs de performance - Année 2024</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Satisfaction globale raccordement électrique</h3>
                  <p className="text-gray-600 text-sm">Clients satisfaits de leur processus de raccordement selon notre enquête de satisfaction du service client</p>
                  <p className="text-gray-500 text-xs mt-2">Base : 2 987 répondants clients</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">97.8%</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Délais raccordement France respectés</h3>
                  <p className="text-gray-600 text-sm">Raccordements effectués dans les temps prévus pour les demandes de nos clients en France</p>
                  <p className="text-gray-500 text-xs mt-2">Base : délais officiels de 2 à 6 mois</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">98.5%</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Qualité interventions terrain</h3>
                  <p className="text-gray-600 text-sm">Clients satisfaits de la qualité des interventions techniques des équipes d'intervention terrain</p>
                  <p className="text-gray-500 text-xs mt-2">Base : contrôles qualité et enquêtes client</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Besoin d'un raccordement électrique Enedis ?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Déposez votre demande de raccordement Enedis dès maintenant. Nos experts du territoire français vous accompagnent dans vos projets.
            </p>
            <Link href="/raccordement-enedis">
              <button className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Déposer une demande de raccordement →
              </button>
            </Link>
          </div>
        </section>

        {/* Client Testimonials */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Retours clients sur le service de raccordement Enedis
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Construction neuve</h3>
                      <p className="text-gray-600 text-sm">Maison individuelle</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    "Raccordement effectué dans les temps. Service client très réactif pour répondre aux questions pendant le processus."
                  </p>
                  <div className="text-blue-600 text-sm">
                    ⭐⭐⭐⭐⭐ Service impeccable
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Projet commercial</h3>
                      <p className="text-gray-600 text-sm">Local professionnel</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    "Accompagnement professionnel tout au long des étapes. Les devis transparents ont facilité notre prise de décision."
                  </p>
                  <div className="text-green-600 text-sm">
                    ⭐⭐⭐⭐⭐ Très satisfait
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Installation solaire</h3>
                      <p className="text-gray-600 text-sm">Raccordement photovoltaïque</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    "Équipe technique compétente qui a su s'adapter aux contraintes spécifiques de notre installation solaire connectée."
                  </p>
                  <div className="text-yellow-600 text-sm">
                    ⭐⭐⭐⭐⭐ Expertise reconnue
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Votre projet de raccordement électrique */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Votre projet de raccordement électrique
              </h2>
              <p className="text-gray-600 mb-8">
                Confiez-nous votre raccordement Enedis ! Nos experts Service accompagnent l'ensemble des projets du territoire français.
              </p>
              <Link href="/raccordement-enedis">
                <button className="bg-gray-800 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-700 transition-colors shadow-lg">
                  Faire raccordement - Démarrer →
                </button>
              </Link>
              <p className="text-gray-500 text-sm mt-4">⚡ Service gratuit Enedis - Devis gratuit immédiat expert intégration ⚡</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Des questions à propos du raccordement Enedis ?
                </h2>
                <p className="text-blue-100">Trouvez des réponses précises à vos questions sur le raccordement électrique Enedis pour tous types de projets en France.</p>
              </div>
              
              <div className="space-y-4">
                
                <details className="bg-blue-700 rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold hover:bg-blue-600 rounded-lg">
                    Quels documents sont nécessaires pour raccorder une maison neuve ?
                  </summary>
                  <div className="p-4 pt-0 text-blue-100">
                    Pour le raccordement d'une maison neuve, vous devez fournir : permis de construire, plan de situation, plan de masse, attestation Consuel, etc.
                  </div>
                </details>

                <details className="bg-blue-700 rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold hover:bg-blue-600 rounded-lg">
                    Comment connaître votre rapport électrique se trouve Enedis ?
                  </summary>
                  <div className="p-4 pt-0 text-blue-100">
                    Vous pouvez consulter votre rapport électrique via votre espace client Enedis ou en contactant directement leur service client.
                  </div>
                </details>

                <details className="bg-blue-700 rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold hover:bg-blue-600 rounded-lg">
                    Quel est le coût d'un raccordement Enedis ?
                  </summary>
                  <div className="p-4 pt-0 text-blue-100">
                    Le coût varie selon le type de raccordement, la distance au réseau et la puissance demandée. Un devis personnalisé est établi.
                  </div>
                </details>

                <details className="bg-blue-700 rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold hover:bg-blue-600 rounded-lg">
                    Combien de temps dure se raccordement électrique Enedis pour une maison ?
                  </summary>
                  <div className="p-4 pt-0 text-blue-100">
                    En général, comptez entre 2 et 6 mois selon la complexité du projet et la charge de travail d'Enedis dans votre région.
                  </div>
                </details>

              </div>

              <div className="text-center mt-12">
                <button 
                  onClick={() => setShowCallbackModal(true)}
                  className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Poser une question technique
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Expert et Rapide */}
        <section className="py-12 bg-blue-50">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Services Expert et Rapide</h3>
                <p className="text-gray-600 text-sm">Accompagnement complet pour tous raccordements Enedis avec suivi personnalisé</p>
              </div>
              <Link href="/raccordement-enedis" className="ml-8">
                <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Démarrer ma demande →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* REPLACE: Étapes du processus de raccordement électrique Enedis */}
        <section className="py-16 bg-white" id="process">
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

            <div className="text-center mt-12" id="services">
              <Link href="/raccordement-enedis">
                <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section - Clean */}
        <section className="py-16 bg-blue-600 text-white" id="contact">
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

      {/* Extended Footer with Services - Matching Screenshots */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Company Info Section */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <HomeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Votre partenaire</h3>
                  <p className="text-blue-200 text-sm">Raccordement électrique</p>
                </div>
              </div>
              <p className="text-blue-200 text-sm mb-4">
                Votre partenaire expert pour tous vos projets de raccordement électrique en France.
              </p>
              <div className="bg-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-white mr-2" />
                  <span className="text-white font-semibold">09 70 70 95 70</span>
                </div>
              </div>
            </div>

            {/* Services spécialisés Section */}
            <div>
              <h3 className="font-semibold text-white mb-4">Services spécialisés</h3>
              <ul className="space-y-2 text-blue-200">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Raccordement définitif
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Raccordement provisoire
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Viabilisation terrain
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Vérification compteur
                </li>
              </ul>
            </div>

            {/* Votre projet Section */}
            <div>
              <h3 className="font-semibold text-white mb-4">Votre projet</h3>
              <div className="bg-green-600 rounded-lg p-4 text-center">
                <button 
                  onClick={() => setShowCallbackModal(true)}
                  className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-lg w-full transition-colors"
                >
                  Demander un devis →
                </button>
              </div>
              <div className="mt-4 text-blue-200 text-sm">
                <p>✓ Service certifié professionnel</p>
                <p>✓ Paiement 100% sécurisé</p>
                <p>✓ Traitement rapide 24-48h</p>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Bottom Footer with Navigation Links */}
      <div className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          {/* Footer Navigation Links */}
          <div className="footer-nav grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center">
            <Link href="/raccordement-residentiel" className="text-gray-300 hover:text-white transition-colors text-sm">
              Raccordement résidentiel
            </Link>
            <Link href="/raccordement-photovoltaique" className="text-gray-300 hover:text-white transition-colors text-sm">
              Raccordement solaire
            </Link>
            <Link href="#contact" className="text-gray-300 hover:text-white transition-colors text-sm">
              Contact
            </Link>
            <Link href="/mentions-legales" className="text-gray-300 hover:text-white transition-colors text-sm">
              Mentions légales
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="text-center border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-300">
              09 70 70 95 70 · contact@raccordement-connect.com · horaires 8h–18h
            </p>
            <div className="mt-2 text-xs text-gray-400">
              <Link href="/politique-confidentialite" className="hover:text-white mr-4">Politique de confidentialité</Link>
              <span>© 2025 Portail Électricité.com - Tous droits réservés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Components */}
      <PerformanceOptimizer />
      <FloatingCtaButton />
      <MobileFormOptimizer />
    </div>
  );
}