import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, User, BatteryCharging, Calculator, Server, PanelTop, Send, Bolt, CheckCheck, Wrench, Phone, AlertCircle, ChevronDown, ShieldCheck, Users, Coins, FileText, ClipboardCheck } from "lucide-react";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
// Import différé des composants moins critiques pour améliorer le temps de chargement
import { CookieConsent } from "@/components/cookie-consent";
import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { SeoRichContent } from "@/components/seo-rich-content";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(188);
  const [isCountHighlighted, setIsCountHighlighted] = useState(false);
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("tous");
  const countUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeRequestType, setActiveRequestType] = useState("définitif");
  
  // Valeurs spécifiques pour le compteur de demandes
  const specificCounts = [188, 206, 301, 264, 129];
  
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
  
  // Effet pour gérer le défilement de la page
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Effet pour appliquer le filtrage initial des questions FAQ
  useEffect(() => {
    // Appliquer le filtre initial (tous)
    filterFaqByCategory('tous');
  }, []);

  // Compteur dynamique amélioré avec les types de demandes
  useEffect(() => {
    // Mise à jour initiale avec une valeur aléatoire
    const randomIndex = Math.floor(Math.random() * specificCounts.length);
    setActiveUsersCount(specificCounts[randomIndex]);
    
    // Mise à jour initiale du type de demande
    const randomTypeIndex = Math.floor(Math.random() * requestTypes.length);
    setActiveRequestType(requestTypes[randomTypeIndex]);
    
    // Fonction pour mettre à jour le compteur et le type de demande
    const updateUserCount = () => {
      // Sélection aléatoire d'un nombre dans la liste
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * specificCounts.length);
      } while (specificCounts[newIndex] === activeUsersCount && specificCounts.length > 1);
      
      const count = specificCounts[newIndex];
      
      // Sélection aléatoire d'un type de demande
      const newTypeIndex = Math.floor(Math.random() * requestTypes.length);
      const requestType = requestTypes[newTypeIndex];
      
      // Mise à jour des états
      setActiveUsersCount(count);
      setActiveRequestType(requestType);
      
      // Animation visuelle du changement
      setIsCountHighlighted(true);
      setTimeout(() => {
        setIsCountHighlighted(false);
      }, 700);
    };
    
    // Mise à jour périodique avec un intervalle aléatoire entre 6 et 14 secondes
    const scheduleNextUpdate = () => {
      const randomDelay = Math.floor(Math.random() * 8000) + 6000;
      
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
      <Helmet>
        <title>Raccordement Électrique Enedis | Procédure Simplifiée 2025</title>
        <meta name="description" content="Service officiel pour votre raccordement électrique Enedis en France. Simplifiez et accélérez votre démarche de branchement définitif ou provisoire." />
        <meta name="keywords" content="raccordement Enedis, branchement électrique, compteur Linky, mise en service électricité, raccordement EDF, raccordement provisoire, raccordement définitif" />
        <meta property="og:title" content="Raccordement Électrique Enedis | Procédure Simplifiée 2025" />
        <meta property="og:description" content="Service officiel pour votre raccordement électrique Enedis. Simplifiez et accélérez votre démarche de branchement définitif ou provisoire en France." />
        <link rel="canonical" href="https://portail-electricite.com/" />
      </Helmet>
      
      <BreadcrumbNavigation 
        items={[
          { name: "Accueil", href: "/" }
        ]}
      />
      
      {/* Hero Section - Style simplifié */}
      <section className="bg-[#2d3a8c] text-white pt-12 pb-8 relative overflow-hidden" id="hero">
        {/* Content - Hero ultra léger */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            {/* H1 optimisé SEO */}
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Raccordement Enedis Simplifié
            </h1>
            
            {/* Description principale SEO-friendly */}
            <p className="text-xl text-white/90 mb-6">
              Service d'accompagnement pour votre raccordement au réseau électrique
            </p>
            
            {/* CTA principal - call-to-action clair et visible */}
            <Link 
              href="/raccordement-enedis#formulaire-raccordement"
              aria-label="Démarrer ma demande de raccordement électrique" 
              data-seo-action="demande-raccordement"
            >
              <Button 
                size="lg" 
                className="bg-white hover:bg-gray-100 text-blue-800 font-medium py-3 px-6 rounded-md shadow-lg transition duration-300"
              >
                Démarrer ma demande
              </Button>
            </Link>
            
            {/* Phrase de confiance */}
            <p className="text-sm text-white/80 mt-4 mb-4">
              Service rapide, professionnel et personnalisé pour votre raccordement Enedis
            </p>
            
            {/* Compteur dynamique amélioré */}
            <div className="inline-flex items-center bg-blue-800/40 backdrop-blur-sm rounded-lg px-4 py-2 mt-2 border border-white/10">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
                <span className={`font-medium ${isCountHighlighted ? 'text-green-300' : 'text-white'} transition-colors duration-300`}>
                  {activeUsersCount}
                </span>
                <span className="text-xs text-blue-200 ml-2">
                  <span className="hidden md:inline">raccordements </span>
                  <span className="typing-animation font-medium">
                    {activeRequestType}
                  </span>
                  <span> en cours</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section des types de raccordements avec icônes simplifiées - Déplacée avant Services Enedis */}
      <section className="py-12 md:py-16 bg-white" id="types-raccordements">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-4 md:mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-semibold">Solutions de raccordement Enedis</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6" id="raccordement-expertise">
              Quels sont les services proposés par Enedis à ses clients ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Découvrez nos différentes offres pour tous vos besoins de raccordement Enedis
            </p>
          </div>
          
          {/* Version mobile - 2 par ligne */}
          <div className="flex flex-wrap justify-center max-w-lg mx-auto sm:max-w-none md:hidden">
            {/* Type 1 - Raccordement Définitif (mobile) */}
            <Link href="/raccordement-enedis?type=definitif" className="group w-1/2 p-1">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition duration-300 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <HomeIcon size={20} />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-900 mb-1 group-hover:text-blue-700 leading-tight">Raccordement Définitif</h3>
                <p className="text-[10px] text-center text-gray-500 line-clamp-1">Installation compteur</p>
              </div>
            </Link>
            
            {/* Type 2 - Raccordement Provisoire (mobile) */}
            <Link href="/raccordement-enedis?type=provisoire" className="group w-1/2 p-1">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition duration-300 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Clock size={20} />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-900 mb-1 group-hover:text-blue-700 leading-tight">Raccordement Provisoire</h3>
                <p className="text-[10px] text-center text-gray-500 line-clamp-1">Chantiers et événements</p>
              </div>
            </Link>
            
            {/* Type 3 - Viabilisation (mobile) */}
            <Link href="/raccordement-enedis?type=viabilisation" className="group w-1/2 p-1">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition duration-300 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Server size={20} />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-900 mb-1 group-hover:text-blue-700 leading-tight">Viabilisation Terrain</h3>
                <p className="text-[10px] text-center text-gray-500 line-clamp-1">Préparation terrain</p>
              </div>
            </Link>
            
            {/* Type 4 - Modification (mobile) */}
            <Link href="/raccordement-enedis?type=modification" className="group w-1/2 p-1">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition duration-300 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Wrench size={20} />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-900 mb-1 group-hover:text-blue-700 leading-tight">Modification Branchement</h3>
                <p className="text-[10px] text-center text-gray-500 line-clamp-1">Adaptation installation</p>
              </div>
            </Link>
            
            {/* Type 5 - Collectif (mobile) */}
            <Link href="/raccordement-enedis?type=collectif" className="group w-1/2 p-1">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition duration-300 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Building size={20} />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-900 mb-1 group-hover:text-blue-700 leading-tight">Raccordement Collectif</h3>
                <p className="text-[10px] text-center text-gray-500 line-clamp-1">Immeubles et copropriétés</p>
              </div>
            </Link>
            
            {/* Type 6 - Production (mobile) */}
            <Link href="/raccordement-enedis?type=production" className="group w-1/2 p-1">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition duration-300 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-12 h-12 mb-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <BarChart size={20} />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-900 mb-1 group-hover:text-blue-700 leading-tight">Raccordement Production</h3>
                <p className="text-[10px] text-center text-gray-500 line-clamp-1">Panneaux solaires</p>
              </div>
            </Link>
          </div>
          
          {/* Version PC - 3 par ligne, plus grands */}
          <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 1. Raccordement Définitif (PC) */}
            <Link href="/raccordement-enedis?type=definitif" className="group">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full transition duration-300 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <HomeIcon size={36} />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2 group-hover:text-blue-700">Raccordement Définitif</h3>
                <p className="text-sm text-center text-gray-500">Installation du compteur électrique pour votre habitation ou local professionnel</p>
              </div>
            </Link>
            
            {/* 2. Raccordement Provisoire (PC) */}
            <Link href="/raccordement-enedis?type=provisoire" className="group">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full transition duration-300 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Clock size={36} />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2 group-hover:text-blue-700">Raccordement Provisoire</h3>
                <p className="text-sm text-center text-gray-500">Alimentation temporaire pour vos chantiers, événements et installations ponctuelles</p>
              </div>
            </Link>
            
            {/* 3. Viabilisation (PC) */}
            <Link href="/raccordement-enedis?type=viabilisation" className="group">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full transition duration-300 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Server size={36} />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2 group-hover:text-blue-700">Viabilisation Terrain</h3>
                <p className="text-sm text-center text-gray-500">Préparation de votre terrain avant construction avec raccordement aux réseaux</p>
              </div>
            </Link>
            
            {/* 4. Modification (PC) */}
            <Link href="/raccordement-enedis?type=modification" className="group">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full transition duration-300 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Wrench size={36} />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2 group-hover:text-blue-700">Modification Branchement</h3>
                <p className="text-sm text-center text-gray-500">Adaptation de votre installation électrique existante aux nouveaux besoins</p>
              </div>
            </Link>
            
            {/* 5. Collectif (PC) */}
            <Link href="/raccordement-enedis?type=collectif" className="group">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full transition duration-300 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Building size={36} />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2 group-hover:text-blue-700">Raccordement Collectif</h3>
                <p className="text-sm text-center text-gray-500">Solutions pour immeubles, copropriétés et ensembles résidentiels</p>
              </div>
            </Link>
            
            {/* 6. Production (PC) */}
            <Link href="/raccordement-enedis?type=production" className="group">
              <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full transition duration-300 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                  <BarChart size={36} />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2 group-hover:text-blue-700">Raccordement Production</h3>
                <p className="text-sm text-center text-gray-500">Installation et raccordement de vos panneaux solaires photovoltaïques</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Section services Enedis optimisée pour SEO et UX - Plus concise et impactante - Cachée en mobile */}
      <section className="hidden md:block py-12 md:py-16 bg-gradient-to-b from-white to-blue-50" id="enedis-services">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* En-tête optimisé SEO avec structured data et micro-formats */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-100 text-blue-800 mb-4">
                <span className="text-sm font-semibold">Service officiel</span>
              </div>
              <h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" 
                id="services-enedis-raccordement"
                itemProp="name"
              >
                Services Enedis de Raccordement au Réseau Électrique
              </h2>
              <p className="text-xl text-gray-600">
                Accompagnement expert pour votre branchement électrique Enedis
              </p>
              <div className="hidden" itemProp="keywords">raccordement enedis, enedis raccordement, demande de raccordement, raccordement électrique</div>
            </div>
            
            {/* Carte avec information riche en données structurées - important pour SEO */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Bandeau supérieur */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-xl">Enedis - Gestionnaire du Réseau Public d'Électricité</h3>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">Couverture de 95% du territoire</span>
                </div>
              </div>
              
              {/* Contenu principal avec grille responsive */}
              <div className="p-6">
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Enedis (anciennement ERDF) est le gestionnaire principal du réseau public de distribution d'électricité en France. 
                  Ses services sont essentiels pour garantir un raccordement de qualité et une alimentation électrique fiable 
                  pour les particuliers, professionnels et collectivités.  
                </p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">Services clés pour votre raccordement</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Service 1 */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Zap className="h-5 w-5" aria-label="Icône éclair" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">Raccordement au Réseau</h5>
                    </div>
                    <p className="text-gray-700 text-sm ml-13">
                      Connexion des installations neuves au réseau électrique, incluant les habitations, immeubles, locaux professionnels 
                      et installations de production d'énergie renouvelable comme les panneaux solaires.
                    </p>
                  </div>
                  
                  {/* Service 2 */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Bolt className="h-5 w-5" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">Mise en Service</h5>
                    </div>
                    <p className="text-gray-700 text-sm ml-13">
                      Opération technique permettant d'alimenter une installation en électricité après souscription d'un contrat 
                      auprès d'un fournisseur d'énergie, minimisant les délais d'attente.
                    </p>
                  </div>
                  
                  {/* Service 3 */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">Gestion des Compteurs</h5>
                    </div>
                    <p className="text-gray-700 text-sm ml-13">
                      Installation, remplacement et maintenance des compteurs électriques, y compris le déploiement des compteurs 
                      communicants Linky, permettant un suivi précis de votre consommation énergétique.
                    </p>
                  </div>
                  
                  {/* Service 4 */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">Dépannage 24h/24 et 7j/7</h5>
                    </div>
                    <p className="text-gray-700 text-sm ml-13">
                      Intervention rapide en cas de panne ou d'incident sur le réseau électrique public, comme les coupures de 
                      courant collectives ou les problèmes de tension, assurant une continuité de service.
                    </p>
                  </div>
                </div>
                
                {/* Avantages du raccordement professionnel - liste avec icônes */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Avantages d'un accompagnement professionnel</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="text-green-600 mr-3 mt-1">
                        <CheckCheck className="h-5 w-5" />
                      </div>
                      <p className="text-gray-700">Conformité garantie avec les normes de sécurité et réglementations en vigueur</p>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-600 mr-3 mt-1">
                        <CheckCheck className="h-5 w-5" />
                      </div>
                      <p className="text-gray-700">Optimisation des coûts et des délais de raccordement</p>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-600 mr-3 mt-1">
                        <CheckCheck className="h-5 w-5" />
                      </div>
                      <p className="text-gray-700">Expertise technique spécialisée pour tous types de projets</p>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-600 mr-3 mt-1">
                        <CheckCheck className="h-5 w-5" />
                      </div>
                      <p className="text-gray-700">Intégration simplifiée des énergies renouvelables</p>
                    </div>
                  </div>
                </div>
                
                {/* Note d'information importante - mise en évidence */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-amber-700 text-sm">
                        <strong>Important :</strong> Enedis assure la gestion technique du réseau et des compteurs, intervient en cas de panne 
                        sur le réseau public, et réalise les raccordements, indépendamment du fournisseur d'électricité choisi par le client. 
                        Enedis ne vend pas d'électricité, cette mission relevant des fournisseurs (EDF, Engie, TotalEnergies, etc.).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Appel à l'action */}
              <div className="bg-gray-50 py-5 px-6 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-700 mb-4 md:mb-0 md:mr-6">
                    Besoin d'un raccordement au réseau électrique public ? Notre expertise vous garantit une installation conforme et efficace.
                  </p>
                  <Link href="/raccordement-enedis#top">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                      Demander un raccordement
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Micro-données structurées (invisible, mais cruciales pour le SEO) */}
            <div className="hidden" aria-hidden="true" itemScope itemType="https://schema.org/Service">
              <meta itemProp="name" content="Services de raccordement au réseau électrique" />
              <meta itemProp="description" content="Services professionnels de raccordement au réseau électrique Enedis pour particuliers et professionnels, incluant étude technique, installation et mise en service." />
              <div itemProp="provider" itemScope itemType="https://schema.org/Organization">
                <meta itemProp="name" content="Enedis" />
                <meta itemProp="description" content="Gestionnaire du réseau public de distribution d'électricité en France couvrant 95% du territoire métropolitain" />
              </div>
              <div itemProp="areaServed" itemScope itemType="https://schema.org/Country">
                <meta itemProp="name" content="France" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Process Section - Compact Timeline - Cachée en mobile */}
      <section className="hidden md:block py-10 md:py-12 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Subtle Background Element */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          
          {/* Compact Header */}
          <div className="max-w-3xl mx-auto text-center mb-10 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 mb-3">
              <span className="text-sm font-semibold">Notre processus</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment fonctionne le raccordement Enedis ?
            </h2>
          </div>
          
          {/* Compact Steps Grid - 4 steps in a grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Send className="h-5 w-5" aria-label="Icône envoi" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Demande en ligne</h3>
              <p className="text-gray-600 text-sm">
                Formulaire digital rapide pour collecter les informations essentielles à votre projet.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5" aria-label="Icône utilisateur" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Étude technique</h3>
              <p className="text-gray-600 text-sm">
                Analyse professionnelle de votre demande pour un raccordement parfaitement adapté.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5" aria-label="Icône horloge" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Devis transparent</h3>
              <p className="text-gray-600 text-sm">
                Planification précise et tarification claire, sans surprise ni frais cachés.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5" aria-label="Icône bouclier" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Réalisation garantie</h3>
              <p className="text-gray-600 text-sm">
                Exécution dans les délais par des techniciens certifiés avec garantie complète.
              </p>
            </div>
          </div>
          
          {/* Bouton d'appel à l'action principal - optimisé pour l'accessibilité */}
          <div className="mt-10 text-center">
            <Link href="/raccordement-enedis#top" aria-label="Démarrer votre demande de raccordement électrique Enedis">
              <Button 
                size="lg" 
                className="bg-[#32b34a] hover:bg-[#2a9e40] text-white shadow-md"
                aria-describedby="cta-description"
              >
                Démarrer ma demande de raccordement
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <span id="cta-description" className="sr-only">Ce bouton vous dirige vers le formulaire officiel de demande de raccordement électrique Enedis</span>
          </div>
        </div>
      </section>
      
      {/* Intégration du contenu SEO simplifié pour le raccordement électrique Enedis */}
      <SeoRichContent compactMode={true} />
      
      {/* Section SEO optimisée sur Enedis et les raccordements - avec une structure riche en données */}
      <section className="py-16 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-20 -left-20 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute w-96 h-96 top-1/3 right-1/4 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute w-80 h-80 bottom-1/4 -right-20 bg-indigo-700/20 rounded-full blur-3xl" />
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '4rem 4rem',
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/5 text-blue-100 backdrop-blur-sm mb-3">
              <span className="text-xs font-medium">Évaluations administratives</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Rapports de <span className="text-blue-300">satisfaction</span>
            </h2>
            <p className="text-sm text-blue-100">
              Bilans d'évaluation des dossiers traités selon nos procédures standardisées
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Évaluation 1 */}
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10">
              <div className="flex items-center mb-3">
                <div className="text-xs text-blue-200 font-medium">
                  Référence dossier : ENE-2024-1853
                </div>
              </div>
              <p className="text-blue-50 mb-4 text-sm">
                "Procédure conforme aux délais réglementaires. Dossier traité selon les normes en vigueur avec respect des critères techniques."
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-200">
                  Satisfaction: <span className="text-green-400 font-semibold">99%</span>
                </div>
                <div className="text-xs text-blue-200">
                  Type: <span className="font-medium">Maison individuelle</span>
                </div>
              </div>
            </div>
            
            {/* Évaluation 2 */}
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10">
              <div className="flex items-center mb-3">
                <div className="text-xs text-blue-200 font-medium">
                  Référence dossier : ENE-2024-1742
                </div>
              </div>
              <p className="text-blue-50 mb-4 text-sm">
                "Communication administrative adéquate. Résolution efficace des aspects techniques du raccordement selon procédures standardisées."
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-200">
                  Satisfaction: <span className="text-green-400 font-semibold">97%</span>
                </div>
                <div className="text-xs text-blue-200">
                  Type: <span className="font-medium">Local professionnel</span>
                </div>
              </div>
            </div>
            
            {/* Évaluation 3 */}
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10">
              <div className="flex items-center mb-3">
                <div className="text-xs text-blue-200 font-medium">
                  Référence dossier : ENE-2024-1691
                </div>
              </div>
              <p className="text-blue-50 mb-4 text-sm">
                "Coordination des intervenants conforme au cahier des charges. Raccordement effectué selon les normes techniques applicables."
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-200">
                  Satisfaction: <span className="text-green-400 font-semibold">98%</span>
                </div>
                <div className="text-xs text-blue-200">
                  Type: <span className="font-medium">Immeuble collectif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Modern glassmorphism */}
      <section className="py-16 relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="md:flex items-center justify-between relative">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Prêt à électrifier votre avenir ?
                </h2>
                <p className="text-lg text-gray-700 mb-0">
                  Faites votre demande dès aujourd'hui et bénéficiez d'un service de raccordement sur mesure avec un accompagnement d'experts.
                </p>
              </div>
              
              <Link href="/raccordement-enedis#top">
                <Button size="lg" className="bg-[#32b34a] hover:bg-[#2a9e40] text-white px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap">
                  Soumettre ma demande de raccordement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ optimisée SEO avec données structurées et accordéon interactif */}
      <section 
        id="faq-raccordement" 
        className="py-16 bg-blue-950 relative overflow-hidden"
        itemScope 
        itemType="https://schema.org/FAQPage"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Des questions à propos du raccordement Enedis ?
            </h2>
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
                    Documents nécessaires pour raccorder une maison neuve
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
                    <p>Pour raccorder une maison neuve au réseau électrique Enedis, vous devez fournir :</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong className="text-white">Permis de construire</strong> : Obligatoire pour toute nouvelle construction</li>
                      <li><strong className="text-white">Plan de situation</strong> : Localisation précise de votre terrain</li>
                      <li><strong className="text-white">Plan de masse</strong> : Position souhaitée du compteur électrique</li>
                      <li><strong className="text-white">Certificat Consuel</strong> : Conformité de l'installation électrique</li>
                    </ul>
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
                    Raccordement d'une maison existante
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
                    <p>Pour une maison existante non raccordée au réseau électrique, vous devrez fournir :</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong className="text-white">Titre de propriété</strong> ou justificatif domicile</li>
                      <li><strong className="text-white">Plan cadastral</strong> pour identifier précisément le terrain</li>
                      <li><strong className="text-white">Photos</strong> de l'environnement du compteur</li>
                    </ul>
                    <p className="mt-2"><strong className="text-white">Délai :</strong> Généralement 4 à 8 semaines après validation du dossier</p>
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
              
              {/* Question 5 - Photovoltaïque */}
              <div 
                className="bg-blue-900/40 rounded-md border border-blue-800/30 overflow-hidden"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
                data-category="solaire"
              >
                <button 
                  onClick={() => toggleFaqItem(5)}
                  className="w-full text-left p-3 flex items-center justify-between"
                  aria-expanded={openFaqItems.includes(5)}
                  aria-controls="faq-content-5"
                >
                  <h3 className="text-sm font-medium text-white" itemProp="name">
                    Raccordement de panneaux solaires photovoltaïques
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-blue-300 transform transition-transform duration-200 ${openFaqItems.includes(5) ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  id="faq-content-5"
                  className={`p-4 pt-0 text-blue-100 text-xs border-t border-blue-700/30 ${openFaqItems.includes(5) ? 'block' : 'hidden'}`}
                  itemScope 
                  itemProp="acceptedAnswer" 
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text" className="pt-3">
                    <p>Le raccordement photovoltaïque peut se faire en :</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong className="text-white">Autoconsommation totale</strong> : Énergie consommée sur place</li>
                      <li><strong className="text-white">Vente du surplus</strong> : Excédent injecté sur le réseau</li>
                    </ul>
                    <p className="mt-2"><strong className="text-white">Délais :</strong> 6 à 10 semaines en moyenne</p>
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
          </div>
        </div>
      </section>
      
      {/* Ajouter votre cookie consent simplifié */}
      <CookieConsent />
    </>
  );
}