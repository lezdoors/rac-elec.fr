import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, Phone, CheckCircle, MapPin, FileText, Rocket, ChevronDown, Check, Users, Lock, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { TrustSection } from "@/components/trust-section";
import { FloatingCtaButton } from "@/components/floating-cta-button";

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(true);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

export default function HomePage() {
  const [activeUsersCount, setActiveUsersCount] = useState(114);
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});
  const isMobile = useMobileDetection();
  const specificCounts = [311, 256, 148, 382, 99, 114, 214, 74, 277, 128, 312, 298];
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * specificCounts.length);
    setActiveUsersCount(specificCounts[randomIndex]);
    
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * specificCounts.length);
      setActiveUsersCount(specificCounts[newIndex]);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);
  
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">Aller au contenu principal</a>
      <Helmet>
        <title>Demande de Raccordement Enedis en Ligne | Raccordement Électrique</title>
        <meta name="description" content="Faites votre demande de raccordement Enedis. Provisoire, définitif, collectif ou augmentation de puissance. Procédure simplifiée et sécurisée." />
        <meta name="keywords" content="demande de raccordement enedis, raccordement électrique, compteur Linky, branchement EDF" />
        <link rel="canonical" href="https://www.raccordement-connect.com/" />
        <meta property="og:title" content="Demande de Raccordement Enedis en Ligne" />
        <meta property="og:description" content="Faites votre demande de raccordement Enedis simplifiée et sécurisée." />
        <meta property="og:url" content="https://www.raccordement-connect.com/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Raccordement-Connect.com",
            "url": "https://www.raccordement-connect.com/",
            "description": "Services professionnels de raccordement électrique Enedis pour particuliers et professionnels en France.",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33 9 70 70 16 43",
              "contactType": "customer support",
              "availableLanguage": "French"
            }
          }
        `}</script>
      </Helmet>

      <main id="main-content">
        {/* HERO SECTION - Modern Gradient Design */}
        <section 
          className="relative overflow-hidden py-16 md:py-24 lg:py-28"
          style={{ background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)' }}
          data-testid="hero-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left Content - 55% */}
              <div className="w-full lg:w-[55%] text-center lg:text-left">
                {/* Partner Badge - Glassmorphism */}
                <div 
                  className="inline-flex items-center px-5 py-2.5 rounded-full mb-6 border"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  data-testid="partner-badge"
                >
                  <Star className="w-4 h-4 text-yellow-300 mr-2 fill-yellow-300" />
                  <span className="text-sm font-semibold text-white">Partenaire n°1 en France</span>
                </div>

                {/* Main Headline - Two Lines */}
                <h1 className="mb-6" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
                  <span className="block text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    Demande de
                  </span>
                  <span className="block text-4xl sm:text-5xl md:text-[58px] font-bold text-white leading-tight tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                    Raccordement Enedis
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                  Particuliers, professionnels ou terrains à viabiliser — un seul formulaire, un service 100% en ligne.
                </p>

                {/* CTA Button */}
                <Link href="/raccordement-enedis#formulaire-raccordement">
                  <button 
                    className="bg-white text-[#0052D4] font-semibold text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                    data-testid="cta-hero-button"
                  >
                    Commencer ma demande
                  </button>
                </Link>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 mt-7 text-white/90">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-300" />
                    <span className="text-sm sm:text-base">100% en ligne</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-200" />
                    <span className="text-sm sm:text-base">Réponse en 48h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-200" />
                    <span className="text-sm sm:text-base">Sécurisé</span>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-white/85">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{activeUsersCount}</span> demandes traitées en temps réel
                  </span>
                </div>
              </div>

              {/* Right Illustration - 45% */}
              <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
                <div 
                  className="relative w-full max-w-md lg:max-w-lg animate-float"
                  style={{
                    animation: 'float 4s ease-in-out infinite'
                  }}
                >
                  <svg viewBox="0 0 400 350" className="w-full h-auto drop-shadow-2xl">
                    {/* House */}
                    <rect x="100" y="150" width="200" height="150" fill="white" rx="8"/>
                    <polygon points="200,80 80,170 320,170" fill="white"/>
                    <rect x="170" y="220" width="60" height="80" fill="#0052D4" rx="4"/>
                    <circle cx="215" cy="260" r="6" fill="white"/>
                    {/* Windows */}
                    <rect x="120" y="180" width="40" height="40" fill="#6FB1FC" rx="4"/>
                    <rect x="240" y="180" width="40" height="40" fill="#6FB1FC" rx="4"/>
                    {/* Power lines */}
                    <line x1="0" y1="100" x2="80" y2="120" stroke="white" strokeWidth="3"/>
                    <line x1="80" y1="120" x2="100" y2="130" stroke="white" strokeWidth="3"/>
                    <circle cx="80" cy="120" r="8" fill="#FFD700"/>
                    {/* Lightning bolt */}
                    <path d="M340 60 L320 110 L335 110 L310 160 L350 100 L330 100 L355 60 Z" fill="#FFD700" opacity="0.9"/>
                    {/* Meter */}
                    <rect x="290" y="200" width="50" height="70" fill="#4364F7" rx="6"/>
                    <rect x="300" y="215" width="30" height="20" fill="white" rx="2"/>
                    <circle cx="315" cy="255" r="8" fill="#22C55E"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* CSS for float animation */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
          `}</style>
        </section>

        {/* SERVICE CARDS SECTION */}
        <section className="py-20 md:py-24 bg-white" id="services" data-animate data-testid="services-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-700 ${isVisible['services'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Card 1 - Maison neuve */}
              <Link href="/raccordement-enedis?type=definitif#top" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[#0066CC] transition-all duration-300" data-testid="card-maison-neuve">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    <HomeIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Maison neuve</h3>
                  <p className="text-sm text-gray-600">Habitation individuelle</p>
                </div>
              </Link>

              {/* Card 2 - Définitif */}
              <Link href="/raccordement-enedis?type=definitif#top" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[#0066CC] transition-all duration-300" data-testid="card-definitif">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                  >
                    <Building className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Définitif</h3>
                  <p className="text-sm text-gray-600">Locaux professionnels</p>
                </div>
              </Link>

              {/* Card 3 - Provisoire */}
              <Link href="/raccordement-enedis?type=provisoire#top" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[#0066CC] transition-all duration-300" data-testid="card-provisoire">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
                  >
                    <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Provisoire</h3>
                  <p className="text-sm text-gray-600">Chantiers temporaires</p>
                </div>
              </Link>

              {/* Card 4 - Viabilisation */}
              <Link href="/raccordement-enedis?type=viabilisation#top" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[#0066CC] transition-all duration-300" data-testid="card-viabilisation">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
                  >
                    <MapPin className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Viabilisation</h3>
                  <p className="text-sm text-gray-600">Parcelles terrain</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* PROCESS TIMELINE SECTION - "Comment ça marche?" */}
        <section 
          className="py-20 md:py-28"
          style={{ background: 'linear-gradient(180deg, #F8F9FB 0%, #FFFFFF 100%)' }}
          id="process"
          data-animate
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                Processus simplifié
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Votre raccordement Enedis en 4 étapes simples et rapides
              </p>
            </div>

            {/* Timeline Steps */}
            <div className="relative">
              {/* Connecting Line - Desktop only */}
              <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-gray-300"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {/* Step 1 */}
                <div className={`relative text-center transition-all duration-500 delay-100 ${isVisible['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-500">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Remplissez le formulaire</h3>
                  <p className="text-sm text-gray-600 mb-2">Complétez votre demande en 5 minutes avec toutes les informations nécessaires</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">5 min</span>
                </div>

                {/* Step 2 */}
                <div className={`relative text-center transition-all duration-500 delay-200 ${isVisible['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-500">
                    <BarChart className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Recevez votre devis</h3>
                  <p className="text-sm text-gray-600 mb-2">Sous 48h, recevez un devis détaillé et personnalisé pour votre projet</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">48h</span>
                </div>

                {/* Step 3 */}
                <div className={`relative text-center transition-all duration-500 delay-300 ${isVisible['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-orange-500">
                    <CheckCircle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Validation du dossier</h3>
                  <p className="text-sm text-gray-600 mb-2">Notre équipe analyse votre demande et prépare votre dossier Enedis</p>
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">2-3 semaines</span>
                </div>

                {/* Step 4 */}
                <div className={`relative text-center transition-all duration-500 delay-400 ${isVisible['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-purple-500">
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    4
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Intervention Enedis</h3>
                  <p className="text-sm text-gray-600 mb-2">Enedis réalise les travaux et active votre compteur électrique</p>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">4-6 semaines</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-16">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-[#0052D4] hover:bg-[#0046a2] text-white font-semibold text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  data-testid="cta-process-button"
                >
                  Commencer ma demande maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - Detailed Cards */}
        <section className="py-20 md:py-24 bg-white" id="types-raccordements" data-animate data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Votre Demande de <span className="text-[#0072CE]">Raccordement</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Choisissez le type de raccordement adapté à votre projet
              </p>
              
              {/* Help section */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <a href="tel:0970701643" className="flex items-center hover:text-[#0072CE] transition-colors">
                  <Phone className="w-4 h-4 mr-2 text-[#0072CE]" />
                  09 70 70 16 43
                </a>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#0072CE]" />
                  Lundi-Vendredi 9h-18h
                </div>
              </div>
            </div>

            {/* Service Grid - 3x2 */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${isVisible['types-raccordements'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Raccordement Définitif */}
              <Link href="/raccordement-definitif" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-[#0072CE]/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <HomeIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Définitif</h3>
                  <p className="text-gray-600 text-sm mb-4">Pour maisons individuelles, appartements et locaux professionnels</p>
                  <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Provisoire */}
              <Link href="/raccordement-provisoire" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-[#0072CE]/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Provisoire</h3>
                  <p className="text-gray-600 text-sm mb-4">Solution temporaire pour chantiers et installations éphémères</p>
                  <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Viabilisation */}
              <Link href="/viabilisation-terrain" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-[#0072CE]/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Viabilisation Terrain</h3>
                  <p className="text-gray-600 text-sm mb-4">Préparation et équipement électrique de votre terrain</p>
                  <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Modification */}
              <Link href="/modification-compteur" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-[#0072CE]/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Modification Compteur</h3>
                  <p className="text-gray-600 text-sm mb-4">Augmentation ou modification de puissance électrique</p>
                  <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Collectif */}
              <Link href="/raccordement-collectif" className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-[#0072CE]/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Collectif</h3>
                  <p className="text-gray-600 text-sm mb-4">Solutions pour immeubles, résidences et copropriétés</p>
                  <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Production Électrique - Highlighted */}
              <Link href="/raccordement-enedis?type=production#top" className="group">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-green-300 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Production Électrique</h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-200 text-green-800 rounded-full">Écologique</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Raccordement panneaux solaires et production d'énergie verte</p>
                  <span className="inline-flex items-center text-green-600 font-medium text-sm group-hover:text-green-700">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST SECTION - "Pourquoi nous faire confiance?" */}
        <section className="py-20 md:py-24 bg-gray-50" id="trust" data-animate data-testid="trust-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi nous faire confiance ?
              </h2>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${isVisible['trust'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Pillar 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">+1200</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">demandes traitées</div>
                <p className="text-gray-600 text-sm">Des centaines de clients satisfaits nous font confiance</p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">Procédure conforme</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">Normes Enedis</div>
                <p className="text-gray-600 text-sm">Processus respectant les normes officielles Enedis</p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">Paiement sécurisé</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">100% protégé</div>
                <p className="text-gray-600 text-sm">Transactions protégées par Stripe</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER - Before Footer */}
        <section 
          className="py-20 md:py-24"
          style={{ background: 'linear-gradient(135deg, #6FB1FC 0%, #4364F7 50%, #0052D4 100%)' }}
          data-testid="cta-banner-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Rocket className="w-10 h-10 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à démarrer votre projet ?
            </h2>

            {/* Subtext */}
            <p className="text-lg text-white/90 mb-8">
              Rejoignez les centaines de clients satisfaits
            </p>

            {/* CTA Button */}
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <button 
                className="bg-white text-[#0052D4] font-semibold text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 mb-4"
                data-testid="cta-final-button"
              >
                Commencer ma demande
              </button>
            </Link>

            {/* Secondary text */}
            <p className="text-white/80 text-sm">
              Accompagnement personnalisé sans engagement
            </p>
          </div>
        </section>

        {/* TrustSection component */}
        <TrustSection />
      </main>

      {/* Floating CTA Button */}
      <FloatingCtaButton />
    </>
  );
}
