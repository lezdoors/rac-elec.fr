import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminButton } from "@/components/ui/admin-button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, User, Server, Send, Bolt, CheckCheck, Wrench, Phone, AlertCircle, ChevronDown, CheckCircle2, MapPin, Sparkles, FileCheck, Wifi, Users, Lightbulb, Settings, Power, ExternalLink, ShieldCheck, Menu, X, FileText } from "lucide-react";
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
import { EnhancedCtaButton, StickyMobileCta } from "@/components/ui/enhanced-cta-button";
import { ProcessStepsSection } from "@/components/ui/process-steps-section";
import { TestimonialsPerformanceSection } from "@/components/ui/testimonials-performance-section";

// Performance optimization - lazy loading will be implemented inline

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(188);
  const [isCountHighlighted, setIsCountHighlighted] = useState(false);
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("tous");
  const countUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeRequestType, setActiveRequestType] = useState("définitif");
  const [isHeroAnimated, setIsHeroAnimated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // MOBILE PERFORMANCE: Conditional rendering optimization
  const isMobile = useMobileDetection();
  
  // Valeurs spécifiques pour le compteur de demandes - liste améliorée
  const specificCounts = [311, 256, 148, 382, 99, 114, 214, 74, 277, 128, 312, 298, 214, 318, 266, 270, 261, 265];
  
  // Types de demandes pour le compteur amélioré
  const requestTypes = ["définitif", "provisoire", "collectif", "modification", "production"];
  
  // Fonction pour gérer l'ouverture/fermeture d'un seul élément FAQ
  const toggleFaqItem = (itemId: number) => {
    // Si l'item est déjà ouvert, on le ferme
    if (openFaqItems.includes(itemId)) {
      setOpenFaqItems([]);
    } else {
      // Sinon, on ferme tous les autres et on n'ouvre que celui-ci
      setTimeout(() => { // Utilisation d'un délai pour éviter les problèmes de rendu
        setOpenFaqItems([itemId]);
      }, 10);
    }
  };
  
  // Fonction pour filtrer les questions FAQ par catégorie
  const filterFaqByCategory = (category: string) => {
    setActiveCategory(category);
    setOpenFaqItems([]); // Fermer toutes les questions ouvertes lors du changement de catégorie
  };

  // Gestion optimisée du défilement avec throttling
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
    
    window.addEventListener("scroll", requestTick, { passive: true });
    return () => window.removeEventListener("scroll", requestTick);
  }, []);

  // Simulation du nombre d'utilisateurs actifs avec variations réalistes
  useEffect(() => {
    // Fonction pour obtenir un nombre aléatoire de la liste prédéfinie
    const getRandomCount = () => {
      return specificCounts[Math.floor(Math.random() * specificCounts.length)];
    };
    
    // Fonction pour obtenir un type de demande aléatoire
    const getRandomRequestType = () => {
      return requestTypes[Math.floor(Math.random() * requestTypes.length)];
    };
    
    const updateUserCount = () => {
      const newCount = getRandomCount();
      const newType = getRandomRequestType();
      
      // Animation de highlight
      setIsCountHighlighted(true);
      setActiveUsersCount(newCount);
      setActiveRequestType(newType);
      
      // Retirer le highlight après 500ms
      setTimeout(() => {
        setIsCountHighlighted(false);
      }, 500);
    };
    
    // Première mise à jour après 3 secondes
    const initialTimeout = setTimeout(updateUserCount, 3000);
    
    // Mise à jour toutes les 8-15 secondes (intervalle variable pour plus de réalisme)
    const updateInterval = () => {
      const randomInterval = Math.random() * 7000 + 8000; // Entre 8 et 15 secondes
      countUpdateTimeoutRef.current = setTimeout(() => {
        updateUserCount();
        updateInterval(); // Programmer la prochaine mise à jour
      }, randomInterval);
    };
    
    updateInterval();
    
    return () => {
      clearTimeout(initialTimeout);
      if (countUpdateTimeoutRef.current) {
        clearTimeout(countUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Loading state pour les images critiques - optimisé pour les performances
  useEffect(() => {
    if ('loading' in HTMLImageElement.prototype) {
      // Si le navigateur supporte le lazy loading natif, on marque comme chargé immédiatement
      setImagesLoaded(true);
    } else {
      // Fallback pour les navigateurs plus anciens
      setImagesLoaded(true);
    }
  }, []);

  // Effet de défilement ultra-optimisé avec throttling avancé pour performances maximales
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;
    
    const optimizedScrollHandler = () => {
      const currentScrollY = window.scrollY;
      
      // Seulement mettre à jour si le changement est significatif (> 5px)
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setScrollY(currentScrollY);
        lastScrollY = currentScrollY;
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(optimizedScrollHandler);
        ticking = true;
      }
    };
    
    // Déclencher immédiatement au chargement sans délai
    setIsHeroAnimated(true);
    
    // Utilisation d'options optimisées pour les performances maximales
    window.addEventListener("scroll", requestTick, { 
      passive: true, 
      capture: false 
    });
    
    return () => {
      window.removeEventListener("scroll", requestTick);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Raccordement Électrique Enedis | Demande Rapide en 2 min | Portail-Electricite.com</title>
        <meta name="description" content="⚡ Raccordement électrique Enedis simplifié ! ✅ Demande en 2 min ✅ Accompagnement expert ✅ Suivi complet. Maison neuve, local pro, panneaux solaires → Devis gratuit immédiat !" />
        
        {/* Meta tags essentiels */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Balises Open Graph (Facebook) */}
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Raccordement Électrique Enedis | Demande Rapide en 2 min" />
        <meta property="og:description" content="⚡ Raccordement électrique Enedis simplifié ! ✅ Demande en 2 min ✅ Accompagnement expert ✅ Suivi complet. Devis gratuit immédiat !" />
        <meta property="og:url" content="https://portail-electricite.com/" />
        <meta property="og:site_name" content="Portail-Electricite.com" />
        <meta property="og:image" content="https://portail-electricite.com/images/raccordement-enedis-expert.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Service de raccordement électrique Enedis professionnel" />
        
        {/* Balises Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Raccordement Électrique Enedis | Demande Rapide en 2 min" />
        <meta name="twitter:description" content="⚡ Raccordement électrique Enedis simplifié ! ✅ Demande en 2 min ✅ Accompagnement expert ✅ Suivi complet" />
        <meta name="twitter:image" content="https://portail-electricite.com/images/raccordement-enedis-expert.jpg" />
        
        {/* Données structurées Schema.org - Page d'accueil */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Portail-Electricite.com",
            "alternateName": "Portail Électricité",
            "url": "https://portail-electricite.com",
            "description": "Service de raccordement électrique Enedis professionnel en France",
            "publisher": {
              "@type": "Organization",
              "name": "Portail-Electricite.com",
              "url": "https://portail-electricite.com"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://portail-electricite.com/recherche?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          }
        `}</script>

        {/* Données structurées - Service */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Raccordement Électrique Enedis",
            "description": "Service professionnel de raccordement électrique Enedis pour particuliers et entreprises en France",
            "provider": {
              "@type": "Organization",
              "name": "Portail-Electricite.com",
              "url": "https://portail-electricite.com"
            },
            "areaServed": {
              "@type": "Country",
              "name": "France"
            },
            "serviceType": "Raccordement électrique",
            "offers": {
              "@type": "Offer",
              "description": "Demande de raccordement électrique Enedis",
              "price": "0",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock"
            }
          }
        `}</script>

        {/* Données structurées - LocalBusiness pour SEO local */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Portail-Electricite.com",
            "description": "Spécialiste du raccordement électrique Enedis en France",
            "url": "https://portail-electricite.com",
            "telephone": "+33970709570",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "FR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "46.2276",
              "longitude": "2.2137"
            },
            "openingHours": [
              "Mo-Fr 09:00-18:00"
            ],
            "serviceArea": {
              "@type": "Country",
              "name": "France"
            }
          }
        `}</script>
        
        {/* Préchargement des ressources critiques */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://portail-electricite.com/" />
        
        {/* Hreflang pour le SEO international */}
        <link rel="alternate" hrefLang="fr" href="https://portail-electricite.com/" />
        <link rel="alternate" hrefLang="fr-FR" href="https://portail-electricite.com/" />

      </Helmet>
      
      {/* Hero Section - Optimized for Performance */}
      <main id="main-content">
      <section className="bg-[#0046a2] text-white py-16 md:py-20" id="hero">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          {/* Badge */}
          <div className="hidden sm:inline-flex items-center rounded-full bg-white/10 px-3 py-1 mb-6 border border-white/20">
            <span className="text-sm font-medium text-white">Partenaire n°1 en France</span>
          </div>
          
          {/* Hero Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            <span className="block">Raccordement Électrique</span>
            <span className="block text-[#4CAF50]">Enedis Simplifié</span>
          </h1>
          
          {/* Hero Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100 leading-relaxed">
            Demande en <span className="font-semibold text-white">2 minutes</span>, accompagnement expert et suivi complet pour votre raccordement électrique
          </p>
          
          {/* Hero CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <EnhancedCtaButton 
              href="/raccordement-enedis#formulaire-raccordement"
              size="xl"
              className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#3d8b40] shadow-2xl"
            >
              Demander un devis en 2 min
            </EnhancedCtaButton>
            
            <EnhancedCtaButton 
              href="tel:0970709570"
              variant="secondary"
              size="lg"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              showIcon={false}
            >
              <Phone className="w-5 h-5 mr-2" />
              09 70 70 95 70
            </EnhancedCtaButton>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#4CAF50]" />
              <span>Gratuit et sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#4CAF50]" />
              <span>Réponse sous 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#4CAF50]" />
              <span>Agréé Enedis</span>
            </div>
          </div>
          
          {/* Live counter */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                <span className="text-sm text-white">
                  <span className={`font-semibold transition-all duration-300 ${isCountHighlighted ? 'text-[#4CAF50] scale-110' : ''}`}>
                    {activeUsersCount}
                  </span> demandes <span className="text-blue-200">{activeRequestType}</span> ce mois
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards Section */}
      <section className="py-16 md:py-20 bg-gray-50" id="services">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
              <span className="whitespace-nowrap">Types de</span> <span className="font-semibold text-[#4CAF50] whitespace-nowrap">Raccordement</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">Choisissez le type de raccordement adapté à votre projet</p>
          </div>

          {/* Mobile version - Compact stacked cards */}
          {isMobile && (
          <div className="space-y-4 max-w-md mx-auto">
            {/* Raccordement Définitif */}
            <Link href="/raccordement-enedis?type=definitif#top" className="group">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center flex-shrink-0">
                    <HomeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Raccordement Définitif</h3>
                    <p className="text-gray-600 text-sm">Maisons, appartements, locaux professionnels</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#0072CE] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Raccordement Provisoire */}
            <Link href="/raccordement-enedis?type=provisoire#top" className="group">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#8B5CF6]/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Raccordement Provisoire</h3>
                    <p className="text-gray-600 text-sm">Chantiers, événements temporaires</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#8B5CF6] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Raccordement Collectif */}
            <Link href="/raccordement-enedis?type=collectif#top" className="group">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#F59E0B]/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Raccordement Collectif</h3>
                    <p className="text-gray-600 text-sm">Lotissements, copropriétés</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#F59E0B] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Production Électrique */}
            <Link href="/raccordement-enedis?type=production#top" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-green-200 hover:shadow-lg hover:border-green-300 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5BC248] to-[#4a9c3a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Production Électrique</h3>
                    <p className="text-gray-600 text-sm">Panneaux solaires, énergie verte</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded-full">Écologique</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#5BC248] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
          )}

          {/* Desktop version - Keep full cards avec optimisations performance */}
          {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto layout-optimized deferred-content">
            {/* Raccordement Définitif */}
            <Link href="/raccordement-enedis?type=definitif#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HomeIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Définitif</h3>
                <p className="text-gray-600 mb-4">Pour maisons individuelles, appartements et locaux professionnels</p>
                <div className="flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Raccordement Provisoire */}
            <Link href="/raccordement-enedis?type=provisoire#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#8B5CF6]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Provisoire</h3>
                <p className="text-gray-600 mb-4">Pour chantiers, événements temporaires et installations courte durée</p>
                <div className="flex items-center text-[#8B5CF6] font-medium text-sm group-hover:text-[#7C3AED]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Raccordement Collectif */}
            <Link href="/raccordement-enedis?type=collectif#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#F59E0B]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Raccordement Collectif</h3>
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-200 text-orange-800 rounded-full">Projet</span>
                </div>
                <p className="text-gray-600 mb-4">Pour lotissements, copropriétés et projets multi-logements</p>
                <div className="flex items-center text-[#F59E0B] font-medium text-sm group-hover:text-[#D97706]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Production Électrique */}
            <Link href="/raccordement-enedis?type=production#top" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#5BC248] to-[#4a9c3a] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Production Électrique</h3>
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded-full">Écologique</span>
                </div>
                <p className="text-gray-600 mb-4">Raccordement pour panneaux solaires et production d'énergie verte</p>
                <div className="flex items-center text-[#5BC248] font-medium text-sm group-hover:text-[#4a9c3a]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
          )}
          
          {/* Help section */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Besoin d'aide pour choisir ?</h3>
              <p className="text-gray-600 mb-4">Nos experts vous accompagnent dans le choix de la solution la plus adaptée à votre projet.</p>
              <a href="tel:0970709570" className="inline-flex items-center text-[#0072CE] font-medium hover:text-[#005eaa] transition-colors">
                <Phone className="h-4 w-4 mr-2" />
                09 70 70 95 70
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Intégration du contenu SEO simplifié avec lazy loading pour performances optimales */}
      <SeoRichContent compactMode={true} />
      
      {/* Enhanced Process Steps Section */}
      <ProcessStepsSection />
      
      {/* Enhanced Performance & Testimonials Section */}
      <TestimonialsPerformanceSection />
      
      {/* Add sticky mobile CTA */}
      <StickyMobileCta />
      
      {/* Section FAQ optimisée SEO avec données structurées et accordéon interactif - Lazy loaded */}
      <section 
        id="faq-raccordement" 
        className="py-16 bg-gradient-to-b from-blue-950 to-blue-900 relative overflow-hidden below-fold"
        style={{ willChange: 'auto' }}
      >
        {/* Éléments décoratifs optimisés pour performance */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none" style={{ transform: 'translateZ(0)' }}>
          <div className="absolute w-96 h-96 rounded-full bg-blue-400 filter blur-3xl -top-48 -left-48" style={{ willChange: 'auto' }}></div>
          <div className="absolute w-96 h-96 rounded-full bg-blue-600 filter blur-3xl -bottom-48 -right-48" style={{ willChange: 'auto' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            {/* Badge d'introduction */}
            <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full bg-blue-800/50 text-blue-200 text-xs font-medium backdrop-blur-sm border border-blue-700/30">
              Réponses à vos questions
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Des questions à propos du raccordement Enedis ?
            </h2>
            
            <p className="text-blue-100 mb-6 text-base max-w-2xl mx-auto leading-relaxed">
              Trouvez des réponses précises à vos questions sur le raccordement électrique Enedis pour tous types de projets en France.
            </p>
            <div className="flex justify-center mb-6">
              <Link 
                href="/raccordement-enedis#formulaire-raccordement"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-800 text-xs font-medium rounded-md shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                data-seo-action="demarrer-apres-faq"
              >
                <span>Démarrer ma demande de raccordement</span>
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="max-w-5xl mx-auto">
            {/* FAQ compacte - Questions essentielles sur 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              
              {/* Question 1 - Raccordement maison neuve */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="maison-neuve"
              >
                <button 
                  onClick={() => toggleFaqItem(1)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(1)}
                  data-testid="faq-question-maison-neuve"
                >
                  <span itemProp="name" className="text-sm font-medium text-white pr-3">
                    Combien coûte un raccordement Enedis pour une maison neuve ?
                  </span>
                  <ChevronDown className="h-4 w-4 text-white transition-transform duration-300" />
                </button>
                
                {openFaqItems.includes(1) && (
                  <div 
                    className="px-3 pb-3"
                    itemScope 
                    itemProp="acceptedAnswer" 
                    itemType="https://schema.org/Answer"
                  >
                    <div itemProp="text" className="pt-3">
                      <p>Le coût d'un raccordement Enedis pour une maison neuve varie selon la puissance et la distance. Pour un raccordement 12 kVA standard, comptez entre 1 200€ et 2 500€. Nos experts vous établissent un devis personnalisé gratuit.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Question 2 - Délais */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="delais"
              >
                <button 
                  onClick={() => toggleFaqItem(2)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(2)}
                  data-testid="faq-question-delais"
                >
                  <span itemProp="name" className="text-sm font-medium text-white pr-3">
                    Quels sont les délais pour un raccordement Enedis ?
                  </span>
                  <ChevronDown className="h-4 w-4 text-white transition-transform duration-300" />
                </button>
                
                {openFaqItems.includes(2) && (
                  <div 
                    className="px-3 pb-3"
                    itemScope 
                    itemProp="acceptedAnswer" 
                    itemType="https://schema.org/Answer"
                  >
                    <div itemProp="text" className="pt-3">
                      <p>Le délai pour un raccordement Enedis s'établit généralement entre 6 et 12 semaines après validation du dossier technique. Ce délai comprend l'étude, la proposition commerciale et les travaux de raccordement.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section de confiance finale - Call-to-action de conversion - Performance optimized */}
      <section className="py-16 bg-white below-fold" id="confiance-finale" style={{ willChange: 'auto' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#F5F9FF] to-[#EDF4FF] rounded-xl p-8 shadow-sm border border-blue-100/80 flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center mb-6 md:mb-0">
              <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mb-4 md:mb-0 md:mr-6 border-2 border-[#0072CE]/10">
                <ShieldCheck className="h-8 w-8 text-[#0072CE]" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Service Expert et Rapide</h3>
                <p className="text-gray-600 max-w-md">Accompagnement complet pour votre raccordement Enedis avec <span className="font-medium text-[#0072CE]">suivi prioritaire</span></p>
              </div>
            </div>
            <Link href="/raccordement-enedis#top">
              <div 
                className="inline-flex items-center bg-[#0072CE] hover:bg-[#005eaa] text-white font-medium py-3 px-6 rounded-md shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                {/* Élément graphique en arrière-plan pour dynamisme visuel */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" style={{ willChange: 'transform' }}></span>
                <span className="font-medium mr-2 relative z-10">Démarrer ma demande</span>
                <ArrowRight className="h-5 w-5 relative z-10" />
              </div>
            </Link>
          </div>
        </div>
      </section>
      </main>
      
      {/* Performance optimization component */}
      <PerformanceOptimizer />
      
      {/* Mobile optimizations */}
      <MobileFormOptimizer />
      <MobileImageOptimizer />
      
      {/* Mobile floating CTA button */}
      <FloatingCtaButton />

    </>
  );
}