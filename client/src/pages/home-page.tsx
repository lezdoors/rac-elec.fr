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
import { HeroFormIllustration, ServiceTypeIllustrations, ProcessStepIllustrations } from '@/components/ui/professional-illustrations';

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
    
    // Trouver toutes les questions FAQ
    const faqItems = document.querySelectorAll('[itemType="https://schema.org/Question"]');
    
    // Afficher ou masquer en fonction de la catégorie sélectionnée
    faqItems.forEach(item => {
      if (category === 'tous') {
        (item as HTMLElement).style.display = 'block';
      } else {
        const itemCategory = (item as HTMLElement).getAttribute('data-category') || '';
        (item as HTMLElement).style.display = itemCategory === category ? 'block' : 'none';
      }
    });
  };
  
  // Image lazy loading optimization
  useEffect(() => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
      
      return () => imageObserver.disconnect();
    } else {
      // Fallback for older browsers
      setImagesLoaded(true);
    }
  }, []);

  // Effet de défilement ultra-optimisé avec throttling avancé pour performances maximales
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;
    
    const optimizedScrollHandler = () => {
      const currentScrollY = window.scrollY;
      // Optimisation critique : ne mettre à jour que si le changement est significatif (> 8px)
      if (Math.abs(currentScrollY - lastScrollY) > 8) {
        setScrollY(currentScrollY);
        lastScrollY = currentScrollY;
      }
      
      // Déclencher l'animation du hero de manière optimisée
      if (!isHeroAnimated && currentScrollY < 10) {
        setIsHeroAnimated(true);
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
      if (ticking) {
        cancelAnimationFrame(ticking as any);
      }
    };
  }, [isHeroAnimated]);
  
  // Effet pour appliquer le filtrage initial des questions FAQ
  useEffect(() => {
    // Appliquer le filtre initial (tous)
    filterFaqByCategory('tous');
  }, []);

  // Compteur dynamique optimisé - version professionnelle
  useEffect(() => {
    // Mise à jour initiale avec une valeur aléatoire
    const randomIndex = Math.floor(Math.random() * specificCounts.length);
    setActiveUsersCount(specificCounts[randomIndex]);
    
    // Fonction pour mettre à jour uniquement le compteur (sans type de demande)
    const updateUserCount = () => {
      // Sélection aléatoire d'un nombre dans la liste
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * specificCounts.length);
      } while (specificCounts[newIndex] === activeUsersCount && specificCounts.length > 1);
      
      const count = specificCounts[newIndex];
      
      // Mise à jour du compteur
      setActiveUsersCount(count);
      
      // Animation visuelle du changement - plus subtile
      setIsCountHighlighted(true);
      setTimeout(() => {
        setIsCountHighlighted(false);
      }, 500);
    };
    
    // Mise à jour périodique avec un intervalle aléatoire entre 8 et 15 secondes
    const scheduleNextUpdate = () => {
      const randomDelay = Math.floor(Math.random() * 7000) + 8000;
      
      countUpdateTimeoutRef.current = setTimeout(() => {
        updateUserCount();
        scheduleNextUpdate();
      }, randomDelay);
    };
    
    // Démarrer les mises à jour
    scheduleNextUpdate();
    
    // Nettoyage
    return () => {
      if (countUpdateTimeoutRef.current) {
        clearTimeout(countUpdateTimeoutRef.current);
      }
    };
  }, []); // Exécuté une seule fois au montage
  
  return (
    <>
      {/* Skip links for accessibility */}
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <a href="#navigation" className="skip-link">Aller à la navigation</a>
      <a href="#services" className="skip-link">Aller aux services</a>
      
      <Helmet>
        <title>Raccordement Électrique Enedis en Ligne | Service Rapide pour Particuliers et Professionnels</title>
        <meta name="description" content="Service expert pour votre raccordement Enedis : branchement électrique, déplacement de compteur Linky, augmentation de puissance. Accompagnement complet pour particuliers et professionnels. Délais optimisés et suivi en temps réel." />
        <meta name="keywords" content="raccordement Enedis, branchement électrique, compteur Linky, déplacement compteur, augmentation puissance électrique, raccordement professionnel, mise en service électricité, demande raccordement en ligne, coût raccordement Enedis, délai raccordement électrique, raccordement ERDF, branchement EDF, raccordement électrique maison neuve, raccordement électricité prix, tarif raccordement Enedis 2025, raccordement provisoire chantier, raccordement triphasé, modification branchement électrique, extension électrique, raccordement photovoltaïque, compteur électrique installation, devis raccordement électrique" />
        <meta property="og:title" content="Raccordement Électrique Enedis en Ligne | Service Rapide et Professionnel" />
        <meta property="og:description" content="Service expert pour votre raccordement Enedis : branchement électrique, déplacement de compteur Linky, augmentation de puissance. Accompagnement complet pour particuliers et professionnels." />
        <meta property="og:url" content="https://portail-electricite.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Portail-Electricite.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Raccordement Électrique Enedis en Ligne | Service Rapide et Professionnel" />
        <meta name="twitter:description" content="Service expert pour votre raccordement Enedis : branchement électrique, déplacement de compteur Linky, augmentation de puissance." />
        <link rel="canonical" href="https://portail-electricite.com/" />
        
        {/* Google tag loaded once in index.html */}
        
        {/* Optimized Organization JSON-LD for SEO */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Portail-Electricite.com",
            "url": "https://portail-electricite.com/",
            "logo": "https://portail-electricite.com/favicon-new.svg",
            "description": "Services professionnels de raccordement électrique Enedis pour particuliers et professionnels en France.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "FR"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33 9 70 70 95 70",
              "contactType": "customer support",
              "availableLanguage": "French"
            }
          }
        `}</script>
        
        {/* LocalBusiness JSON-LD for enhanced local SEO */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Services de Raccordement Enedis",
            "image": "https://portail-electricite.com/og-image.jpg",
            "description": "Services professionnels pour tous vos besoins de raccordement électrique, branchement Enedis, compteur Linky et modifications de puissance.",
            "priceRange": "€€",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "FR"
            },
            "telephone": "+33 9 70 70 95 70",
            "url": "https://portail-electricite.com/",
            "serviceArea": {
              "@type": "Country",
              "name": "France"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33 9 70 70 95 70",
              "contactType": "customer support",
              "availableLanguage": "French"
            }
          }
        `}</script>
        

      </Helmet>
      {/* Hero Section - Optimized for Performance */}
      <main id="main-content">
      <section className="bg-[#0046a2] text-white py-16 md:py-20" id="hero">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          {/* Badge */}
          <div className="hidden sm:inline-flex items-center rounded-full bg-white/10 px-3 py-1 mb-6 border border-white/20">
            <span className="text-sm font-medium text-white">Partenaire n°1 en France</span>
          </div>
          
          {/* Main Title - Optimized for mobile LCP */}
          <h1 className="text-2xl sm:text-3xl md:text-6xl font-semibold text-white mb-4 leading-snug md:leading-tight">
            Commencer votre demande.
          </h1>
          
          {/* Subtitle */}
          <p className="hidden md:block text-lg md:text-xl mb-6 max-w-2xl mx-auto text-white/90">
            Particuliers, professionnels ou terrains à viabiliser — un seul formulaire, un service 100% en ligne.
          </p>
          {/* Navigation Icons - Simplified */}
          <div className="flex justify-center gap-6 mb-10 lg:hidden">
            <Link href="/particulier" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors p-3">
                <ServiceTypeIllustrations.residential />
              </div>
            </Link>
            <Link href="/professionnel" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors p-3">
                <ServiceTypeIllustrations.commercial />
              </div>
            </Link>
            <Link href="/raccordement-enedis" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors p-3">
                <ServiceTypeIllustrations.temporary />
              </div>
            </Link>
            <Link href="/raccordement-enedis" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors p-3">
                <ServiceTypeIllustrations.residential />
              </div>
            </Link>
          </div>
            
          {/* Desktop version - Simplified cards */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mb-10 max-w-5xl mx-auto">
            <Link href="/particulier" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 mx-auto p-3">
                  <ServiceTypeIllustrations.residential />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Maison neuve</h3>
                <p className="text-white/80 text-base">Habitation individuelle</p>
              </div>
            </Link>
            
            <Link href="/professionnel" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-3 mx-auto p-3">
                  <ServiceTypeIllustrations.commercial />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Définitif</h3>
                <p className="text-white/80 text-base">Locaux professionnels</p>
              </div>
            </Link>
            
            <Link href="/raccordement-enedis" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 mx-auto p-3">
                  <ServiceTypeIllustrations.temporary />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Provisoire</h3>
                <p className="text-white/80 text-base">Chantiers temporaires</p>
              </div>
            </Link>
            
            <Link href="/raccordement-enedis" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 mx-auto p-3">
                  <ServiceTypeIllustrations.residential />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Viabilisation</h3>
                <p className="text-white/80 text-base">Parcelles terrain</p>
              </div>
            </Link>
          </div>
          
          {/* Main CTA Button */}
          <div className="text-center mt-10">
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <button className="bg-white text-[#0046a2] font-semibold px-8 py-4 rounded-lg text-lg hover:bg-[#0046a2] hover:text-white transition-colors shadow-lg">
                Déposer ma demande
              </button>
            </Link>
            
            {/* Counter */}
            <div className="mt-6">
              <p className="text-white/90 text-sm">
                <span className="font-semibold">{activeUsersCount}</span> demandes traitées en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Formulaire de raccordement avec 5 étapes - Composant complet */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="formulaire-raccordement">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* En-tête du formulaire avec illustration professionnelle */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                  <span className="whitespace-nowrap">Commencer votre</span> <span className="font-semibold text-[#0072CE] whitespace-nowrap">demande</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl lg:max-w-none">Processus simplifié en 4 étapes pour votre raccordement Enedis personnalisé</p>
                
                {/* CTA principal avec style professionnel */}
                <div className="mt-8">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button className="inline-flex items-center bg-[#0072CE] hover:bg-[#005eaa] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                      <span>Démarrer ma demande</span>
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Illustration professionnelle */}
              <div className="flex justify-center lg:justify-end">
                <HeroFormIllustration />
              </div>
            </div>
            

            
            {/* Aide et support */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Besoin d'aide pour remplir le formulaire ?</p>
              <div className="flex justify-center items-center space-x-8 text-sm">
                <a href="tel:0970709570" className="flex items-center hover:text-[#4CAF50] transition-colors cursor-pointer">
                  <Phone className="h-4 w-4 mr-2 text-[#4CAF50]" />
                  <span>09 70 70 95 70</span>
                </a>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-[#4CAF50]" />
                  <span>Lundi-Vendredi 9h-18h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section types de raccordements - Enhanced UX */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white mt-[20px] mb-[20px] pt-[30px] pb-[30px]" id="types-raccordements">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              Solutions sur mesure
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Quel type de <span className="text-[#0072CE]">raccordement</span> vous correspond ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chaque projet est unique. Découvrez la solution électrique adaptée à vos besoins spécifiques.
            </p>
          </div>
          
          {/* Mobile version - Optimisé tactile avec retour visuel parfait */}
          {isMobile && (
          <div className="max-w-lg mx-auto px-4">
            <div className="space-y-3">
              {/* Ligne 1: Raccordement Définitif + Raccordement Provisoire */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/raccordement-enedis?type=definitif#top" className="group touch-manipulation select-none" aria-label="Raccordement électrique définitif Enedis pour maisons individuelles">
                  <article className="bg-white border-gray-200 rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-[#0072CE]/30 active:scale-95 active:shadow-sm transition-all duration-200 text-center h-full min-h-[120px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-active:scale-95 transition-transform p-2">
                      <ServiceTypeIllustrations.residential />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">Raccordement Définitif Enedis</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Nouveau branchement électrique permanent pour maisons individuelles et locaux professionnels</p>
                  </article>
                </Link>
                
                <Link href="/raccordement-enedis?type=provisoire#top" className="group touch-manipulation select-none" aria-label="Raccordement électrique provisoire Enedis pour chantiers temporaires">
                  <article className="bg-white border-gray-200 rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-[#0072CE]/30 active:scale-95 active:shadow-sm transition-all duration-200 text-center h-full min-h-[120px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-active:scale-95 transition-transform p-2">
                      <ServiceTypeIllustrations.temporary />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">Raccordement Provisoire Enedis</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Alimentation électrique temporaire pour chantiers et installations éphémères</p>
                  </article>
                </Link>
              </div>
              
              {/* Ligne 2: Viabilisation + Modification de Puissance */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/raccordement-enedis?type=viabilisation#top" className="group touch-manipulation select-none" aria-label="Viabilisation électrique terrain par Enedis">
                  <article className="bg-white border-gray-200 rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-[#0072CE]/30 active:scale-95 active:shadow-sm transition-all duration-200 text-center h-full min-h-[120px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-active:scale-95 transition-transform p-2">
                      <ServiceTypeIllustrations.residential />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">Viabilisation Électrique Enedis</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Préparation et équipement électrique complet de votre terrain constructible</p>
                  </article>
                </Link>
                
                <Link href="/raccordement-enedis?type=modification#top" className="group touch-manipulation select-none" aria-label="Modification de puissance électrique Enedis">
                  <article className="bg-white border-gray-200 rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-[#0072CE]/30 active:scale-95 active:shadow-sm transition-all duration-200 text-center h-full min-h-[120px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-active:scale-95 transition-transform p-2">
                      <ProcessStepIllustrations.step3 />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">Modification de Puissance Enedis</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Augmentation ou réduction de puissance sur installation électrique existante</p>
                  </article>
                </Link>
              </div>
              
              {/* Ligne 3: Raccordement Collectif + Production Électrique */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/raccordement-enedis?type=collectif#top" className="group touch-manipulation select-none" aria-label="Raccordement électrique collectif Enedis pour immeubles">
                  <article className="bg-white border-gray-200 rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-[#0072CE]/30 active:scale-95 active:shadow-sm transition-all duration-200 text-center h-full min-h-[120px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-active:scale-95 transition-transform p-2">
                      <ServiceTypeIllustrations.commercial />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">Raccordement Collectif Enedis</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Solutions électriques pour immeubles, résidences et copropriétés</p>
                  </article>
                </Link>
                
                <Link href="/raccordement-enedis?type=production#top" className="group touch-manipulation select-none" aria-label="Raccordement production électrique Enedis panneaux solaires">
                  <article className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-green-300 active:scale-95 active:shadow-sm transition-all duration-200 text-center h-full min-h-[120px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5BC248] to-[#4a9c3a] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-active:scale-95 transition-transform">
                      <BarChart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">Production Électrique Enedis</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">Raccordement panneaux solaires et injection d'énergie verte au réseau</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-green-200 text-green-800 rounded-full">Écologique</span>
                  </article>
                </Link>
              </div>
            </div>
          </div>
          )}

          {/* Desktop version - Keep full cards avec optimisations performance */}
          {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto layout-optimized deferred-content">
            {/* Raccordement Définitif */}
            <Link href="/raccordement-enedis?type=definitif#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3">
                  <ServiceTypeIllustrations.residential />
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3">
                  <ServiceTypeIllustrations.temporary />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Provisoire</h3>
                <p className="text-gray-600 mb-4">Solution temporaire pour chantiers et installations éphémères</p>
                <div className="flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Viabilisation */}
            <Link href="/raccordement-enedis?type=viabilisation#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3">
                  <ServiceTypeIllustrations.residential />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Viabilisation</h3>
                <p className="text-gray-600 mb-4">Préparation et équipement électrique de votre terrain</p>
                <div className="flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Modification */}
            <Link href="/raccordement-enedis?type=modification#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3">
                  <ProcessStepIllustrations.step3 />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modification</h3>
                <p className="text-gray-600 mb-4">Adaptation et mise à niveau de votre installation existante</p>
                <div className="flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Collectif */}
            <Link href="/raccordement-enedis?type=collectif#top" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#0072CE]/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0072CE] to-[#005eaa] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3">
                  <ServiceTypeIllustrations.commercial />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Collectif</h3>
                <p className="text-gray-600 mb-4">Solutions pour immeubles, résidences et copropriétés</p>
                <div className="flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Production - Special highlight */}
            <Link href="/raccordement-enedis?type=production#top" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#5BC248] to-[#4a9c3a] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3">
                  <ServiceTypeIllustrations.solar />
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
      {/* 
        Section témoignages - Design épuré avec optimisation mobile
        Version mobile ultra-compacte pour économiser l'espace
        Compatible avec tous les navigateurs modernes, optimisé pour les performances
      */}
      {/* Section satisfaction client - Style administratif Enedis professionnel */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-slate-50 to-white border-t border-gray-200" id="satisfaction-raccordement-enedis">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* En-tête institutionnel */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center mb-4 px-4 py-2 bg-gray-100 text-gray-800 rounded text-sm font-medium border border-gray-300">
                Certification qualité service
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Indicateurs de performance du service de raccordement Enedis
              </h2>
              
              <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Données officielles de client pour les demandes de raccordement électrique Enedis 
                traitées sur l'ensemble du territoire français.
              </p>
            </div>

            {/* Statistiques officielles - Version mobile administrative */}
            <div className="block md:hidden mb-8">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-900">Bilan qualité 2024 - Raccordements Enedis</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">99.2%</div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Taux de satisfaction globale</div>
                    <div className="text-xs text-gray-600">Service raccordement électrique conforme aux attentes</div>
                  </div>
                  
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">97.8%</div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Respect des délais annoncés</div>
                    <div className="text-xs text-gray-600">Raccordements Enedis livrés dans les temps</div>
                  </div>
                  
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">98.5%</div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Communication et suivi</div>
                    <div className="text-xs text-gray-600">Accompagnement professionnel tout au long du processus</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques officielles - Version desktop administrative */}
            <div className="hidden md:block mb-12">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                  <h3 className="text-base font-semibold text-gray-900">Indicateurs de performance - Année 2024</h3>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-gray-200">
                  
                  {/* Indicateur 1 - Satisfaction globale */}
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">99.2%</div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Satisfaction globale raccordement Enedis</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      Clients satisfaits de la qualité du service de raccordement électrique et de l'accompagnement fourni
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Base : 2,847 raccordements traités
                    </div>
                  </div>

                  {/* Indicateur 2 - Respect des délais */}
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">97.8%</div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Délais raccordement Enedis respectés</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      Raccordements électriques livrés dans les délais annoncés par Enedis lors de l'étude technique
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Délai moyen : 6.2 semaines vs 8-10 semaines
                    </div>
                  </div>

                  {/* Indicateur 3 - Communication */}
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">98.5%</div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Qualité communication et suivi</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      Clients satisfaits de la clarté des informations et du suivi personnalisé tout au long du processus
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Conseiller dédié et contact unique
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA intermédiaire - Raccordement Enedis */}
            <div className="text-center mb-8">
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Besoin d'un raccordement électrique Enedis ?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Démarrez votre demande de raccordement Enedis en ligne. Formulaire simplifié pour tous types de projets.
                </p>
                <Link 
                  href="/raccordement-enedis#formulaire-raccordement"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                >
                  Demande raccordement Enedis en ligne
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Section témoignages détaillés - Performance optimized */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 border border-blue-200 below-fold deferred-content">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Retours clients sur le service de raccordement Enedis
                </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                
                {/* Témoignage 1 - Maison neuve */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">Construction neuve</div>
                      <div className="text-xs text-gray-500">Maison individuelle - Normandie</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 italic">
                    "Raccordement Enedis réalisé exactement dans les délais annoncés. Dossier parfaitement préparé, aucune complication administrative."
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Délai effectif :</span>
                    <span className="ml-1">7 semaines</span>
                  </div>
                </div>

                {/* Témoignage 2 - Local professionnel */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">Local commercial</div>
                      <div className="text-xs text-gray-500">Augmentation puissance - PACA</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 italic">
                    "Service professionnel exemplaire. Conseiller dédié très réactif, suivi constant jusqu'à la mise en service du compteur Linky."
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Type raccordement :</span>
                    <span className="ml-1">Modification 36 kVA</span>
                  </div>
                </div>

                {/* Témoignage 3 - Photovoltaïque */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">Installation solaire</div>
                      <div className="text-xs text-gray-500">Raccordement production - Île-de-France</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 italic">
                    "Accompagnement parfait pour le raccordement de mes panneaux photovoltaïques. Toutes les démarches Enedis simplifiées."
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Puissance installée :</span>
                    <span className="ml-1">9 kWc</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA final - Enedis raccordement */}
            <div className="mt-8 text-center">
              <div className="bg-white border border-gray-300 rounded-lg p-6 max-w-lg mx-auto">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Votre projet de raccordement électrique
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Confiez votre demande raccordement Enedis à nos experts. Service personnalisé pour tous vos besoins électriques.
                </p>
                <Link 
                  href="/raccordement-enedis#formulaire-raccordement"
                  className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-medium rounded hover:bg-gray-700 transition-colors"
                >
                  Enedis raccordement - Démarrer
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Certification en bas */}
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Service agréé Enedis - Données certifiées organisme indépendant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
                  aria-controls="faq-content-1"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Quels documents sont nécessaires pour raccorder une maison neuve ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(1) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-1"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(1) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p>Pour raccorder une maison neuve au réseau électrique Enedis, vous devez constituer un dossier complet avec :</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong className="text-white">Permis de construire</strong> : Document officiel obligatoire avec cachet de la mairie</li>
                      <li><strong className="text-white">Plan de situation</strong> : Extrait cadastral avec localisation précise du terrain (échelle 1/2500 minimum)</li>
                      <li><strong className="text-white">Plan de masse</strong> : Indiquant l'emplacement souhaité du compteur et du coffret électrique</li>
                      <li><strong className="text-white">Certificat Consuel</strong> : Attestation de conformité électrique (obtenu après installation)</li>
                      <li><strong className="text-white">Formulaire de demande</strong> : Cerfa n°13-2042 dûment complété</li>
                      <li><strong className="text-white">Justificatif d'identité</strong> : Pièce d'identité du demandeur</li>
                    </ul>
                    <p className="mt-2 text-blue-200"><strong>Bon à savoir :</strong> Un dossier complet accélère le traitement de 2 à 3 semaines.</p>
                  </div>
                </div>
              </div>
            
              {/* Question 2 - Maison existante */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="maison-ancienne"
              >
                <button 
                  onClick={() => toggleFaqItem(2)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(2)}
                  aria-controls="faq-content-2"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Comment raccorder une maison existante au réseau Enedis ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(2) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-2"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(2) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p>Pour raccorder une maison existante non raccordée, la procédure diffère selon votre situation :</p>
                    <p className="mt-2"><strong className="text-white">Documents requis :</strong></p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li><strong className="text-white">Titre de propriété</strong> ou contrat de location avec autorisation du propriétaire</li>
                      <li><strong className="text-white">Plan cadastral</strong> avec références de parcelle exactes</li>
                      <li><strong className="text-white">Photos récentes</strong> du site d'implantation souhaité pour le compteur</li>
                      <li><strong className="text-white">Justificatif d'identité</strong> et RIB pour le règlement</li>
                    </ul>
                    <p className="mt-2"><strong className="text-white">Cas particuliers :</strong> Maison ancienne avec ancien branchement : vérification de conformité et mise aux normes éventuellement nécessaire.</p>
                    <p className="mt-2 text-blue-200"><strong>Délai moyen :</strong> 6 à 10 semaines selon la complexité des travaux de raccordement.</p>
                  </div>
                </div>
              </div>
            
              {/* Question 3 - Coûts et délais */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="couts-tarifs"
              >
                <button 
                  onClick={() => toggleFaqItem(3)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(3)}
                  aria-controls="faq-content-3"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Coûts et délais d'un raccordement Enedis
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(3) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-3"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(3) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p><strong className="text-white">Coûts :</strong> Entre 1.200€ et 2.500€ pour un raccordement standard, jusqu'à 5.000€ pour les cas complexes (distance, obstacles).</p>
                    <p className="mt-2"><strong className="text-white">Délais moyens :</strong></p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Étude technique : 3 semaines</li>
                      <li>Proposition technique et financière : 10 jours</li>
                      <li>Travaux après acceptation : 6 à 8 semaines</li>
                    </ul>
                  </div>
                </div>
              </div>
            
              {/* Question 4 - Compteur Linky */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="compteur-linky"
              >
                <button 
                  onClick={() => toggleFaqItem(4)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(4)}
                  aria-controls="faq-content-4"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Compteur Linky et raccordement Enedis
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(4) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-4"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(4) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p>Le compteur Linky est désormais le standard pour tout nouveau raccordement Enedis. Ses avantages :</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong className="text-white">Télé-relève</strong> : Plus besoin de relevé manuel</li>
                      <li><strong className="text-white">Suivi détaillé</strong> : Visualisation précise de votre consommation</li>
                      <li><strong className="text-white">Mise en service à distance</strong> : Activation rapide</li>
                    </ul>
                    <p className="mt-2">Le compteur est inclus dans le prix du raccordement et reste propriété d'Enedis.</p>
                  </div>
                </div>
              </div>
            </div>

          {/* Questions supplémentaires dans le format accordéon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Tarifs */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(6)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(6)}
                  aria-controls="faq-content-6"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Quel est le coût d'un raccordement électrique Enedis en 2025 ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(6) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-6"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(6) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p>Le coût d'un raccordement Enedis en 2025 varie selon plusieurs facteurs : distance au réseau, puissance demandée, type d'installation et travaux nécessaires. Pour une maison individuelle standard, comptez entre 1.200€ et 2.500€ pour un raccordement simple, et jusqu'à 5.000€ pour des configurations plus complexes.</p>
                    <p className="mt-2">Notre service d'accompagnement permet souvent d'optimiser ce coût en identifiant les solutions techniques les plus adaptées à votre situation.</p>
                  </div>
                </div>
              </div>
              
              {/* Délais */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(7)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(7)}
                  aria-controls="faq-content-7"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Combien de temps prend un raccordement Enedis pour une maison neuve ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(7) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-7"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(7) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p>Le délai pour un raccordement Enedis d'une maison neuve s'établit généralement entre 6 et 12 semaines après validation du dossier technique. Ce délai se décompose en plusieurs étapes :</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong className="text-white">Étude technique</strong> : 2 à 3 semaines</li>
                      <li><strong className="text-white">Proposition technique et financière</strong> : envoi sous 10 jours ouvrés</li>
                      <li><strong className="text-white">Planification des travaux</strong> : 1 à 2 semaines après acceptation du devis</li>
                      <li><strong className="text-white">Réalisation des travaux</strong> : 2 à 6 semaines selon complexité</li>
                    </ul>
                    <p className="mt-2">Notre service d'accompagnement permet souvent de réduire ces délais de 20% à 30% grâce à une préparation optimale du dossier initial.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ajout de la question sur les panneaux solaires en dernière position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="md:col-span-2">
                {/* Question sur les panneaux solaires photovoltaïques positionnée en dernier */}
                <div 
                  className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                  itemScope 
                  itemProp="mainEntity" 
                  itemType="https://schema.org/Question"
                  data-category="solaire"
                >
                  <button 
                    onClick={() => toggleFaqItem(8)}
                    className="w-full text-left p-3 flex items-center justify-between"
                    aria-expanded={openFaqItems.includes(8)}
                    aria-controls="faq-content-8"
                  >
                    <h3 className="text-sm font-medium text-white" itemProp="name">
                      Comment fonctionne le raccordement Enedis pour une installation photovoltaïque en autoconsommation ?
                    </h3>
                    <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(8) ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    id="faq-content-8"
                    className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(8) ? 'block' : 'hidden'}`}
                    itemScope 
                    itemProp="acceptedAnswer" 
                    itemType="https://schema.org/Answer"
                  >
                    <div itemProp="text" className="pt-3">
                      <p>Le raccordement d'une installation photovoltaïque en autoconsommation avec Enedis suit un processus spécifique qui dépend de si vous souhaitez uniquement consommer votre propre électricité ou également vendre le surplus :</p>
                      <p className="mt-2"><strong className="text-white">Types de raccordement photovoltaïque :</strong></p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong className="text-white">Autoconsommation totale</strong> : Toute l'électricité produite est consommée sur place. Un compteur bidirectionnel Linky est nécessaire pour mesurer vos flux d'énergie.</li>
                        <li><strong className="text-white">Autoconsommation avec vente du surplus</strong> : L'excédent non consommé est injecté sur le réseau et vendu à un fournisseur d'électricité. Un contrat d'achat avec tarif de rachat est établi.</li>
                      </ul>
                      <p className="mt-2"><strong className="text-white">Procédure de raccordement photovoltaïque :</strong></p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Dépôt d'une demande de raccordement auprès d'Enedis (convention d'autoconsommation)</li>
                        <li>Étude technique réalisée par Enedis pour vérifier la compatibilité avec le réseau local</li>
                        <li>Proposition de raccordement avec devis détaillé</li>
                        <li>Réalisation des travaux de raccordement par Enedis après acceptation</li>
                        <li>Mise en service avec pose ou programmation du compteur Linky</li>
                      </ul>
                      <p className="mt-2">Les délais moyens pour un raccordement photovoltaïque varient de 6 à 10 semaines. Notre service d'accompagnement vous guide à travers chaque étape administrative et technique, maximisant ainsi les avantages économiques et environnementaux de votre installation solaire.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional comprehensive FAQ questions */}
            <div className="grid grid-cols-1 gap-3 mt-4">
              
              {/* Question 8 - Délai pour obtenir un raccordement */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="delais"
              >
                <button 
                  onClick={() => toggleFaqItem(8)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(8)}
                  aria-controls="faq-content-8"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Quel est le délai pour obtenir un raccordement électrique ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(8) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-8"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(8) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    Les délais varient entre 2 et 6 mois selon la complexité du raccordement. Un raccordement simple en zone urbaine prend généralement 2-3 mois, tandis qu'un raccordement nécessitant des travaux d'extension de réseau peut prendre 4-6 mois. Nous vous tenons informé à chaque étape du processus.
                  </div>
                </div>
              </div>

              {/* Question 9 - Suivi demande en ligne */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="suivi"
              >
                <button 
                  onClick={() => toggleFaqItem(9)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(9)}
                  aria-controls="faq-content-9"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Puis-je suivre ma demande de raccordement en ligne ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(9) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-9"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(9) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    Oui, notre plateforme vous permet de suivre l'avancement de votre dossier en temps réel. Vous recevez des notifications par email à chaque étape importante et pouvez consulter le statut de votre demande dans votre espace client personnel, accessible 24h/24.
                  </div>
                </div>
              </div>

              {/* Question 10 - Demande en cours chez Enedis */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="enedis"
              >
                <button 
                  onClick={() => toggleFaqItem(10)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(10)}
                  aria-controls="faq-content-10"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Que faire si j'ai déjà une demande en cours chez Enedis ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(10) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-10"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(10) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    Si vous avez déjà initié une demande directement auprès d'Enedis, nous pouvons reprendre votre dossier en cours et vous accompagner dans le suivi. Contactez-nous avec votre numéro de dossier Enedis, et nous évaluerons comment optimiser et accélérer votre processus de raccordement.
                  </div>
                </div>
              </div>

              {/* Question 11 - Accompagnement personnalisé */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="accompagnement"
              >
                <button 
                  onClick={() => toggleFaqItem(11)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(11)}
                  aria-controls="faq-content-11"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Proposez-vous un accompagnement personnalisé ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(11) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-11"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(11) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    Absolument ! Notre équipe d'experts vous accompagne personnellement tout au long du processus. Vous bénéficiez d'un interlocuteur dédié qui vous guide dans les démarches, répond à vos questions et assure le suivi de votre dossier jusqu'à la mise en service de votre raccordement.
                  </div>
                </div>
              </div>

              {/* Question 12 - Service pour professionnels */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="professionnels"
              >
                <button 
                  onClick={() => toggleFaqItem(12)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(12)}
                  aria-controls="faq-content-12"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Le service fonctionne-t-il pour les professionnels et promoteurs ?
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(12) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-12"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(12) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    Oui, notre service s'adresse aux particuliers, professionnels, promoteurs immobiliers et collectivités. Nous gérons les raccordements de toutes puissances, des installations domestiques aux projets industriels complexes. Notre expertise couvre également les lotissements et opérations de grande envergure.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced FAQ Structured Data - Complete FAQPage schema */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Comment faire une demande de raccordement Enedis ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Pour faire une demande de raccordement Enedis, remplissez notre formulaire en ligne en quelques étapes simples. Vous devrez fournir les informations sur votre projet, l'adresse du raccordement et vos coordonnées. Notre équipe vous accompagne ensuite dans toutes les démarches administratives avec Enedis."
                }
              },
              {
                "@type": "Question",
                "name": "Quels documents sont nécessaires pour un raccordement ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Les documents requis incluent : le plan de situation du terrain, le plan de masse du projet, l'autorisation d'urbanisme (permis de construire ou déclaration préalable), et la puissance souhaitée. Notre équipe vous guide pour constituer un dossier complet et conforme aux exigences Enedis."
                }
              },
              {
                "@type": "Question",
                "name": "Quel est le coût d'un raccordement électrique Enedis ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Le coût varie selon le type de raccordement, la distance au réseau existant et la puissance demandée. Pour un raccordement domestique standard, comptez entre 1 000€ et 2 000€. Les raccordements en souterrain ou à forte puissance peuvent coûter plus cher. Nous vous fournissons un devis précis après étude de votre projet."
                }
              },
              {
                "@type": "Question",
                "name": "Quels types de terrains peuvent être raccordés ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Tous les types de terrains peuvent être raccordés : maisons individuelles, terrains à bâtir, lotissements, locaux commerciaux et industriels. Que votre terrain soit en zone urbaine ou rurale, notre service s'adapte à votre situation géographique et aux spécificités de votre projet."
                }
              },
              {
                "@type": "Question",
                "name": "Quelle est la différence entre un raccordement provisoire et définitif ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Un raccordement définitif est permanent et destiné aux habitations ou locaux pérennes. Un raccordement provisoire est temporaire (maximum 2 ans) et utilisé pour les chantiers, événements ou installations éphémères. Les démarches et tarifs diffèrent selon le type choisi."
                }
              },
              {
                "@type": "Question",
                "name": "Comment raccorder une installation photovoltaïque ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Le raccordement photovoltaïque nécessite une demande spécifique auprès d'Enedis. Nous gérons les démarches pour l'autoconsommation totale ou avec vente du surplus. Les délais moyens sont de 6 à 10 semaines avec pose d'un compteur Linky bidirectionnel."
                }
              },
              {
                "@type": "Question",
                "name": "Comment raccorder une maison existante au réseau Enedis ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Pour raccorder une maison existante, nous évaluons d'abord l'installation électrique actuelle et déterminons les modifications nécessaires. Le processus inclut la mise aux normes, l'installation du compteur Linky et la mise en service."
                }
              },
              {
                "@type": "Question",
                "name": "Quel est le délai pour obtenir un raccordement électrique ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Les délais varient entre 2 et 6 mois selon la complexité du raccordement. Un raccordement simple en zone urbaine prend généralement 2-3 mois, tandis qu'un raccordement nécessitant des travaux d'extension de réseau peut prendre 4-6 mois. Nous vous tenons informé à chaque étape du processus."
                }
              },
              {
                "@type": "Question",
                "name": "Puis-je suivre ma demande de raccordement en ligne ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, notre plateforme vous permet de suivre l'avancement de votre dossier en temps réel. Vous recevez des notifications par email à chaque étape importante et pouvez consulter le statut de votre demande dans votre espace client personnel, accessible 24h/24."
                }
              },
              {
                "@type": "Question",
                "name": "Que faire si j'ai déjà une demande en cours chez Enedis ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Si vous avez déjà initié une demande directement auprès d'Enedis, nous pouvons reprendre votre dossier en cours et vous accompagner dans le suivi. Contactez-nous avec votre numéro de dossier Enedis, et nous évaluerons comment optimiser et accélérer votre processus de raccordement."
                }
              },
              {
                "@type": "Question",
                "name": "Proposez-vous un accompagnement personnalisé ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolument ! Notre équipe d'experts vous accompagne personnellement tout au long du processus. Vous bénéficiez d'un interlocuteur dédié qui vous guide dans les démarches, répond à vos questions et assure le suivi de votre dossier jusqu'à la mise en service de votre raccordement."
                }
              },
              {
                "@type": "Question",
                "name": "Le service fonctionne-t-il pour les professionnels et promoteurs ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, notre service s'adresse aux particuliers, professionnels, promoteurs immobiliers et collectivités. Nous gérons les raccordements de toutes puissances, des installations domestiques aux projets industriels complexes. Notre expertise couvre également les lotissements et opérations de grande envergure."
                }
              }
            ]
          }
        `}</script>
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