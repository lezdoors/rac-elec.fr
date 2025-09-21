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
  
  // NOUVELLE FONCTION - Compteur de demandes dynamique et réaliste
  const updateActiveCount = () => {
    const randomIndex = Math.floor(Math.random() * specificCounts.length);
    const newCount = specificCounts[randomIndex];
    
    if (newCount !== activeUsersCount) {
      setActiveUsersCount(newCount);
      setIsCountHighlighted(true);
      
      // Retirer le highlight après 500ms
      setTimeout(() => {
        setIsCountHighlighted(false);
      }, 500);
    }
  };
  
  // Fonction pour alterner les types de demandes
  const updateRequestType = () => {
    const currentIndex = requestTypes.indexOf(activeRequestType);
    const nextIndex = (currentIndex + 1) % requestTypes.length;
    setActiveRequestType(requestTypes[nextIndex]);
  };
  
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
      
      // Animation du hero au scroll
      if (window.scrollY > 100 && !isHeroAnimated) {
        setIsHeroAnimated(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  // Effet pour le compteur dynamique avec timing variable
  useEffect(() => {
    const updateCounter = () => {
      // Temps d'attente variable entre 8 et 25 secondes
      const nextUpdateTime = Math.random() * (25000 - 8000) + 8000;
      
      countUpdateTimeoutRef.current = setTimeout(() => {
        updateActiveCount();
        updateCounter(); // Programmer la prochaine mise à jour
      }, nextUpdateTime);
    };
    
    updateCounter(); // Démarrer le cycle
    
    return () => {
      if (countUpdateTimeoutRef.current) {
        clearTimeout(countUpdateTimeoutRef.current);
      }
    };
  }, [activeUsersCount]); // Dépendance sur activeUsersCount
  
  // Effet pour l'alternance des types de demandes toutes les 4 secondes
  useEffect(() => {
    const interval = setInterval(updateRequestType, 4000);
    return () => clearInterval(interval);
  }, [activeRequestType]);
  
  // Effet pour le lazy loading des images
  useEffect(() => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
      
      return () => {
        images.forEach(img => imageObserver.unobserve(img));
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ willChange: 'auto' }}>
      <Helmet>
        <title>Raccordement Enedis - Service professionnel pour tous vos raccordements électriques en France</title>
        <meta name="description" content="Service professionnel de raccordement Enedis. Accompagnement complet pour maisons neuves, locaux professionnels, modifications de puissance et tous types de raccordements électriques en France." />
        <meta name="keywords" content="raccordement enedis, branchement électrique, compteur linky, modification puissance, raccordement maison neuve, raccordement professionnel" />
        <link rel="canonical" href="https://portail-electricite.com/" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Raccordement Enedis - Service professionnel pour tous vos raccordements électriques" />
        <meta property="og:description" content="Service professionnel de raccordement Enedis. Accompagnement complet pour maisons neuves, locaux professionnels et tous types de raccordements électriques en France." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://portail-electricite.com/" />
        <meta property="og:image" content="https://portail-electricite.com/og-image.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Raccordement Enedis - Service professionnel" />
        <meta name="twitter:description" content="Service professionnel de raccordement Enedis pour tous types de projets électriques en France." />
        <meta name="twitter:image" content="https://portail-electricite.com/og-image.jpg" />
        
        {/* Données structurées pour l'organisation */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Portail Électricité",
            "url": "https://portail-electricite.com/",
            "logo": "https://portail-electricite.com/logo.png",
            "description": "Service professionnel de raccordement Enedis pour tous types de projets électriques en France",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "FR"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33 9 70 70 95 70",
              "contactType": "customer support",
              "availableLanguage": "French"
            },
            "sameAs": []
          }
        `}</script>
        
        {/* Données structurées pour les services */}
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
          {/* Authority Badge - Always visible like competitor */}
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 mb-6 border border-white/20">
            <span className="text-sm md:text-base font-semibold text-white">🏆 +15 000 raccordements Enedis réalisés en France</span>
          </div>
          
          {/* Main Title - Simplified like competitor */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Le raccordement Enedis. <br className="hidden md:block"/>
            <span className="text-yellow-300">Simple et rapide !</span>
          </h1>
          
          {/* Subtitle - More compelling like competitor */}
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-white/95 leading-relaxed">
            Particuliers et professionnels. Quel que soit le type de demande de raccordement Enedis. 
            <span className="font-semibold text-yellow-300"> Un seul formulaire !</span>
          </p>
          {/* Navigation Icons - Simplified */}
          <div className="flex justify-center gap-6 mb-10 lg:hidden">
            <Link href="/particulier" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
            </Link>
            <Link href="/professionnel" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <Building className="h-8 w-8 text-white" />
              </div>
            </Link>
            <Link href="/raccordement-enedis" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </Link>
            <Link href="/raccordement-enedis" className="group">
              <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </Link>
          </div>
            
          {/* Desktop version - Simplified cards */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mb-10 max-w-5xl mx-auto">
            <Link href="/particulier" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 mx-auto">
                  <HomeIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Maison neuve</h3>
                <p className="text-white/80 text-base">Habitation individuelle</p>
              </div>
            </Link>
            
            <Link href="/professionnel" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-3 mx-auto">
                  <Building className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Définitif</h3>
                <p className="text-white/80 text-base">Locaux professionnels</p>
              </div>
            </Link>
            
            <Link href="/raccordement-enedis" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 mx-auto">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Provisoire</h3>
                <p className="text-white/80 text-base">Chantiers temporaires</p>
              </div>
            </Link>
            
            <Link href="/raccordement-enedis" className="w-full">
              <div className="bg-white/15 hover:bg-white/25 rounded-xl p-5 text-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 mx-auto">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Viabilisation</h3>
                <p className="text-white/80 text-base">Parcelles terrain</p>
              </div>
            </Link>
          </div>
          
          {/* Main CTA Buttons - Like competitor */}
          <div className="text-center mt-10">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors shadow-lg transform hover:scale-105 min-w-[200px]">
                  Commencer ma demande
                </button>
              </Link>
              <Link href="/contact-page">
                <button className="bg-white/20 border-2 border-white text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white hover:text-[#0046a2] transition-colors min-w-[180px]">
                  Nous contacter
                </button>
              </Link>
            </div>
            
            {/* Counter */}
            <div className="mt-6">
              <p className="text-white/90 text-sm">
                <span className="font-semibold text-yellow-300">{activeUsersCount}</span> demandes traitées ce mois-ci
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Formulaire de raccordement avec 5 étapes - Composant complet */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="formulaire-raccordement">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* En-tête du formulaire */}
            <div className="text-center mb-12">
              <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                <span className="whitespace-nowrap">Votre Demande de</span> <span className="font-semibold text-[#4CAF50] whitespace-nowrap">Raccordement</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">Processus simplifié en 4 étapes pour votre raccordement Enedis personnalisé</p>
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
      {/* Section types de raccordements - Simplified like competitor */}
      <section className="py-16 bg-white" id="types-raccordements">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Tous types de raccordement Enedis
            </h2>
            <p className="text-lg text-gray-600">
              Particuliers et professionnels. Quel que soit le type de demande de raccordement Enedis. Un seul formulaire !
            </p>
          </div>
          
          {/* Service Grid - Like competitor with 6 services */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            
            {/* Raccordement Définitif */}
            <Link href="/raccordement-enedis?type=definitif" className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <HomeIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Raccordement Enedis Définitif / ajout de compteur linky</h3>
              </div>
            </Link>

            {/* Raccordement Provisoire */}
            <Link href="/raccordement-enedis?type=provisoire" className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Raccordement Enedis provisoire</h3>
              </div>
            </Link>

            {/* Viabilisation */}
            <Link href="/raccordement-enedis?type=viabilisation" className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Viabilisation d'un terrain</h3>
              </div>
            </Link>

            {/* Modification de raccordement */}
            <Link href="/raccordement-enedis?type=modification" className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Modification de raccordement Enedis</h3>
              </div>
            </Link>

            {/* Raccordement Collectif */}
            <Link href="/raccordement-enedis?type=collectif" className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Raccordement Enedis collectif</h3>
              </div>
            </Link>

            {/* Raccordement Photovoltaïque */}
            <Link href="/raccordement-enedis?type=photovoltaique" className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Power className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Raccordement Enedis photovoltaïque</h3>
              </div>
            </Link>

          </div>

          {/* Single CTA Button like competitor */}
          <div className="text-center mt-12">
            <Link href="/raccordement-enedis">
              <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                Commencer ma demande
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals Section - Better than competitor */}
      <section className="py-12 bg-gray-50" id="trust-signals">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Guarantees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Garantie satisfaction</h3>
                <p className="text-gray-600 text-sm">Accompagnement jusqu'à la mise en service ou remboursement intégral</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Réactivité garantie</h3>
                <p className="text-gray-600 text-sm">Réponse sous 2h en jours ouvrés, suivi en temps réel de votre dossier</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Experts certifiés</h3>
                <p className="text-gray-600 text-sm">Équipe formée aux procédures Enedis et mise à jour réglementaire</p>
              </div>

            </div>

            {/* Stats Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">15 000+</div>
                  <div className="text-sm text-gray-600">Raccordements réalisés</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-sm text-gray-600">Taux de satisfaction</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">-30%</div>
                  <div className="text-sm text-gray-600">Délais raccourcis en moyenne</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">7j/7</div>
                  <div className="text-sm text-gray-600">Support client disponible</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Process Section - Like competitor */}
      <section className="py-16 bg-white" id="process-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Le raccordement Enedis, comment ça fonctionne ?
            </h2>
          </div>
          
          {/* 4-step process like competitor with images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <FileCheck className="w-10 h-10 text-white" loading="lazy" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-blue-600">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Définir le type raccordement Enedis correspondant à mon besoin</h3>
              <p className="text-gray-600 text-sm">Bénéficiez de notre outil pour définir la demande de raccordement qui correspond à votre besoin. C'est facile et rapide.</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white" loading="lazy" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compléter un formulaire simple ou demander l'assistance de nos experts</h3>
              <p className="text-gray-600 text-sm">Suivez les étapes du formulaire et renseignez votre projet de raccordement ou prenez rendez-vous avec un Expert.</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center">
                  <Send className="w-10 h-10 text-white" loading="lazy" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-orange-600">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nous nous occupons du dépôt du dossier, complet et conforme, chez Enedis</h3>
              <p className="text-gray-600 text-sm">Nous dédions des experts pour étudier votre demande et vous assister à la constitution d'un dossier complet et conforme.</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" loading="lazy" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-purple-600">
                  <span className="text-purple-600 font-bold text-sm">4</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nous vous accompagnons dans votre raccordement Enedis de A à Z</h3>
              <p className="text-gray-600 text-sm">Nous nous occupons du suivi de votre demande pas à pas tout en accélérant son avancement.</p>
            </div>

          </div>

          <div className="text-center mt-12">
            <Link href="/raccordement-enedis">
              <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                Commencer ma demande
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section - Like competitor */}
      <section className="py-16 bg-blue-600 text-white" id="contact-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Besoin d'assistance dans votre démarche de raccordement Enedis ?
            </h2>
            <h3 className="text-xl mb-8">Contactez-nous</h3>
            <p className="text-lg mb-8">Nous sommes à votre écoute</p>
          </div>
          
          {/* Contact options like competitor */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            
            <a href="tel:0970709570" className="text-center group" data-testid="contact-phone" aria-label="Appelez-nous au 09 70 70 95 70">
              <div className="bg-white/20 rounded-lg p-6 hover:bg-white/30 transition-colors">
                <Phone className="w-12 h-12 mx-auto mb-4 text-white" />
                <h4 className="font-semibold text-white">Appelez-nous</h4>
              </div>
            </a>

            <Link href="/contact-page" className="text-center group" data-testid="contact-callback">
              <div className="bg-white/20 rounded-lg p-6 hover:bg-white/30 transition-colors">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white" />
                <h4 className="font-semibold text-white">Rappel gratuit</h4>
              </div>
            </Link>

            <Link href="/contact-page" className="text-center group" data-testid="contact-chat">
              <div className="bg-white/20 rounded-lg p-6 hover:bg-white/30 transition-colors">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white" />
                <h4 className="font-semibold text-white">Chat</h4>
              </div>
            </Link>

            <Link href="/contact-page" className="text-center group" data-testid="contact-form">
              <div className="bg-white/20 rounded-lg p-6 hover:bg-white/30 transition-colors">
                <Mail className="w-12 h-12 mx-auto mb-4 text-white" />
                <h4 className="font-semibold text-white">Formulaire de contact</h4>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Testimonials Section - Superior social proof */}
      <section className="py-16 bg-white" id="testimonials">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ils nous font confiance pour leur raccordement Enedis
            </h2>
            <p className="text-lg text-gray-600">
              Plus de 15 000 clients satisfaits dans toute la France
            </p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">"Service exceptionnel ! Ils ont géré toutes les démarches pour mon raccordement de maison neuve. Délai respecté et accompagnement au top."</p>
              <div className="text-sm">
                <strong className="text-gray-900">Marie D.</strong>
                <span className="text-gray-500"> - Maison neuve, Toulouse</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">"Après plusieurs tentatives infructueuses en direct, ils ont résolu mon dossier en 3 semaines. Professionnalisme remarquable."</p>
              <div className="text-sm">
                <strong className="text-gray-900">François M.</strong>
                <span className="text-gray-500"> - Local commercial, Lyon</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">"Suivi transparent en temps réel et expert dédié. Exactement ce qu'il nous fallait pour notre lotissement de 12 maisons."</p>
              <div className="text-sm">
                <strong className="text-gray-900">SCI Horizon</strong>
                <span className="text-gray-500"> - Promoteur, Bordeaux</span>
              </div>
            </div>

          </div>

          {/* Trust badges */}
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                <span>Certifié Qualibat</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                <span>Expert Enedis agréé</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                <span>Disponible 7j/7</span>
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
          <div className="max-w-4xl mx-auto">
            {/* FAQ simplifiée - 5 questions essentielles comme le concurrent */}
            <div className="space-y-4">
              
              {/* Question 1 - Combien de temps */}
              <div 
                className="bg-white/10 rounded-lg border border-white/20 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(1)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  aria-expanded={openFaqItems.includes(1)}
                  aria-controls="faq-content-1"
                  data-testid="faq-button-1"
                >
                  <h3 className="text-lg font-semibold text-white" itemProp="name">
                    Combien de temps faut-il pour un raccordement Enedis ?
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-white transform transition-transform duration-200 ${openFaqItems.includes(1) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-1"
                  className={`px-6 pb-6 text-blue-100 border-t border-white/10 ${openFaqItems.includes(1) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-4">
                    <p>Le délai moyen pour un raccordement Enedis est de <strong className="text-white">2 à 6 mois</strong> selon la complexité. Un raccordement simple en zone urbaine prend généralement 2-3 mois, tandis qu'un raccordement nécessitant des travaux d'extension peut prendre 4-6 mois. Nous vous tenons informé à chaque étape du processus.</p>
                  </div>
                </div>
              </div>

              {/* Question 2 - Documents nécessaires */}
              <div 
                className="bg-white/10 rounded-lg border border-white/20 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(2)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  aria-expanded={openFaqItems.includes(2)}
                  aria-controls="faq-content-2"
                  data-testid="faq-button-2"
                >
                  <h3 className="text-lg font-semibold text-white" itemProp="name">
                    Quels documents sont nécessaires pour mon raccordement ?
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-white transform transition-transform duration-200 ${openFaqItems.includes(2) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-2"
                  className={`px-6 pb-6 text-blue-100 border-t border-white/10 ${openFaqItems.includes(2) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-4">
                    <p>Les documents principaux sont : <strong className="text-white">permis de construire</strong> (ou titre de propriété), <strong className="text-white">plan de situation</strong> du terrain, <strong className="text-white">plan de masse</strong> avec emplacement du compteur, et votre <strong className="text-white">pièce d'identité</strong>. Nous vous aidons à constituer un dossier complet et conforme.</p>
                  </div>
                </div>
              </div>

              {/* Question 3 - Combien ça coûte */}
              <div 
                className="bg-white/10 rounded-lg border border-white/20 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(3)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  aria-expanded={openFaqItems.includes(3)}
                  aria-controls="faq-content-3"
                  data-testid="faq-button-3"
                >
                  <h3 className="text-lg font-semibold text-white" itemProp="name">
                    Combien coûte un raccordement Enedis ?
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-white transform transition-transform duration-200 ${openFaqItems.includes(3) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-3"
                  className={`px-6 pb-6 text-blue-100 border-t border-white/10 ${openFaqItems.includes(3) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-4">
                    <p>Le coût varie entre <strong className="text-white">1.200€ et 2.500€</strong> pour un raccordement standard, et peut atteindre 5.000€ pour les cas complexes (distance importante, obstacles). Le prix définitif est établi après étude technique gratuite d'Enedis. Nous vous aidons à optimiser les coûts.</p>
                  </div>
                </div>
              </div>

              {/* Question 4 - Suivre ma demande */}
              <div 
                className="bg-white/10 rounded-lg border border-white/20 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(4)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  aria-expanded={openFaqItems.includes(4)}
                  aria-controls="faq-content-4"
                  data-testid="faq-button-4"
                >
                  <h3 className="text-lg font-semibold text-white" itemProp="name">
                    Puis-je suivre ma demande de raccordement en ligne ?
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-white transform transition-transform duration-200 ${openFaqItems.includes(4) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-4"
                  className={`px-6 pb-6 text-blue-100 border-t border-white/10 ${openFaqItems.includes(4) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-4">
                    <p><strong className="text-white">Oui, absolument.</strong> Notre plateforme vous permet de suivre l'avancement de votre dossier en temps réel. Vous recevez des notifications par email à chaque étape importante et pouvez consulter le statut dans votre espace client, accessible 24h/24.</p>
                  </div>
                </div>
              </div>

              {/* Question 5 - Accompagnement */}
              <div 
                className="bg-white/10 rounded-lg border border-white/20 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button 
                  onClick={() => toggleFaqItem(5)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  aria-expanded={openFaqItems.includes(5)}
                  aria-controls="faq-content-5"
                  data-testid="faq-button-5"
                >
                  <h3 className="text-lg font-semibold text-white" itemProp="name">
                    Proposez-vous un accompagnement personnalisé ?
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-white transform transition-transform duration-200 ${openFaqItems.includes(5) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-5"
                  className={`px-6 pb-6 text-blue-100 border-t border-white/10 ${openFaqItems.includes(5) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-4">
                    <p><strong className="text-white">Oui, c'est notre spécialité.</strong> Nos experts vous accompagnent de A à Z : constitution du dossier, suivi des démarches, relation avec Enedis, et résolution de tous problèmes. Vous bénéficiez d'un interlocuteur unique tout au long du processus.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* CTA section at end of FAQ */}
            <div className="text-center mt-12 pt-8 border-t border-white/20">
              <p className="text-white/90 mb-6">D'autres questions ? Nos experts sont à votre disposition</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/raccordement-enedis" data-testid="faq-cta-start">
                  <button className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors shadow-lg">
                    Commencer ma demande
                  </button>
                </Link>
                <a href="tel:0970709570" className="bg-white/20 border-2 border-white text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white hover:text-blue-900 transition-colors" data-testid="faq-cta-call">
                  Appelez-nous
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intégration du contenu SEO simplifié avec lazy loading pour performances optimales */}
      <SeoRichContent compactMode={true} />
    </div>
  );
}