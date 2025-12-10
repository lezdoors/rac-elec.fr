import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, Phone, CheckCircle, MapPin, FileText, Rocket, ChevronDown, Check, Users, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { FloatingCtaButton } from "@/components/floating-cta-button";
import heroIllustration from "@assets/hero-illustration_1765320964105.webp";
import step1Illustration from "@assets/Definir-le-type_1765357131561.webp";
import step2Illustration from "@assets/Completer-Formulaire_1765357131561.webp";
import step3Illustration from "@assets/Depot-du-dossier_1765357131561.webp";
import step4Illustration from "@assets/Suivi-Dossier_1765357131561.webp";
import raccordementDefinitifIcon from "@assets/Raccordement-Definitif_1765333395814.webp";
import raccordementProvisoireIcon from "@assets/Raccordement-Provisoire_1765333395814.webp";
import raccordementCollectifIcon from "@assets/Raccordement-Collectif_1765333395814.webp";
import augmentationPuissanceIcon from "@assets/augmentation_de_puissance_1765333395814.webp";
import servicesTechniquesIcon from "@assets/services-techniques_1765333395814.webp";
import raccordementEnedisIcon from "@assets/Raccordement-Enedis_1765333395814.webp";
import formIntroIllustration from "@assets/form-intro-illustartion_(Website)_1765358383139.webp";

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
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});
  const isMobile = useMobileDetection();

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
        {/* HERO SECTION - Clean White Design */}
        <section 
          className="relative overflow-hidden py-12 md:py-16 lg:py-20 bg-white"
          data-testid="hero-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Left Content - 50% */}
              <div className="w-full lg:w-[50%] text-center lg:text-left">
                {/* Main Headline - Two Lines */}
                <h1 className="mb-4">
                  <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                    Demande de
                  </span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                    Raccordement Enedis
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0 mb-6">
                  Votre expert raccordement Enedis en ligne.<br />
                  Déposez votre demande en quelques minutes.
                </p>

                {/* Two CTA Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-base px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                      data-testid="cta-hero-button"
                    >
                      Démarrer ma demande
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button 
                      className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-6 py-3 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
                      data-testid="contact-hero-button"
                    >
                      <Phone className="w-4 h-4" />
                      Nous contacter
                    </button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm">100% en ligne</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Réponse en 48h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Sécurisé</span>
                  </div>
                </div>
              </div>

              {/* Right Illustration - 50% */}
              <div className="w-full lg:w-[50%] flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg lg:max-w-xl">
                  <img 
                    src={heroIllustration} 
                    alt="Famille devant une maison avec panneaux solaires et voiture électrique - Raccordement électrique Enedis"
                    className="w-full h-auto"
                    loading="eager"
                    data-testid="hero-illustration"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM INTRO SECTION - Informational, not hero-like */}
        <section className="py-10 md:py-12 bg-white" id="form-intro" data-animate data-testid="form-intro-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            <div className={`flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12 transition-all duration-700 ${isVisible['form-intro'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Left Illustration */}
              <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-xs">
                  <img 
                    src={formIntroIllustration} 
                    alt="Femme remplissant un formulaire en ligne pour sa demande de raccordement electrique"
                    className="w-full h-auto"
                    loading="lazy"
                    data-testid="form-intro-illustration"
                  />
                </div>
              </div>

              {/* Right Content */}
              <div className="w-full lg:w-3/5 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3 leading-snug">
                  Commencez votre demande de raccordement Enedis ici
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 max-w-lg mx-auto lg:mx-0">
                  Demarrez votre demande de raccordement electrique Enedis en quelques clics. Formulaire 100% en ligne, traitement rapide, accompagnement expert inclus.
                </p>
                <Link href="/raccordement-enedis#formulaire-raccordement">
                  <button 
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium text-sm px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    data-testid="cta-form-intro-button"
                  >
                    Demarrer ma demande
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION - "Comment Faire sa Demande" - 4 Steps with Illustrations */}
        <section 
          className="py-16 md:py-20"
          style={{ background: 'linear-gradient(180deg, #EBF4FF 0%, #F0F7FF 50%, #FFFFFF 100%)' }}
          id="process"
          data-animate
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0066CC] mb-3 leading-tight">
                Comment Faire sa Demande de Raccordement Electrique en Ligne ?
              </h2>
              <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Processus 100% en ligne en 4 etapes simples. Votre demande de raccordement Enedis traitee rapidement avec accompagnement personnalise.
              </p>
            </div>

            {/* 4 Steps - Horizontal on desktop, Vertical on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-12">
              
              {/* Step 1 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {/* Numbered Circle */}
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                    1
                  </div>
                  {/* Illustration */}
                  <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-4">
                    <img 
                      src={step1Illustration}
                      alt="Définir le type de raccordement"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step1-illustration"
                    />
                  </div>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight px-2">
                    Définir le type de raccordement correspondant à mon besoin
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-gray-500 px-2">
                    Utilisez notre outil pour cadrer précisément votre demande.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {/* Numbered Circle */}
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                    2
                  </div>
                  {/* Illustration */}
                  <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-4">
                    <img 
                      src={step2Illustration}
                      alt="Compléter un formulaire simple"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step2-illustration"
                    />
                  </div>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight px-2">
                    Compléter un formulaire simple ou demander l'assistance de nos experts
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-gray-500 px-2">
                    Renseignez votre projet en quelques étapes.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {/* Numbered Circle */}
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                    3
                  </div>
                  {/* Illustration */}
                  <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-4">
                    <img 
                      src={step3Illustration}
                      alt="Dépôt du dossier chez Enedis"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step3-illustration"
                    />
                  </div>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight px-2">
                    Nous déposons un dossier complet et conforme chez Enedis
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-gray-500 px-2">
                    Constitution et dépôt de votre dossier.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {/* Numbered Circle */}
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                    4
                  </div>
                  {/* Illustration */}
                  <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-4">
                    <img 
                      src={step4Illustration}
                      alt="Suivi de dossier jusqu'à la mise en service"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step4-illustration"
                    />
                  </div>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight px-2">
                    Suivi personnalisé jusqu'à la mise en service
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-gray-500 px-2">
                    Accompagnement de A à Z.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium text-sm px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  data-testid="cta-process-button"
                >
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - Detailed Cards */}
        <section className="py-16 md:py-20 bg-white" id="types-raccordements" data-animate data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Votre Demande de <span className="text-[#0072CE]">Raccordement</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-5">
                Choisissez le type de raccordement adapte a votre projet
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

            {/* Service Grid - 3x2 - Clean Administrative Design */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-all duration-700 ${isVisible['types-raccordements'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Raccordement Définitif */}
              <Link href="/raccordement-definitif" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0072CE]/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementDefinitifIcon} alt="Raccordement Définitif" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Raccordement Définitif</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">Pour maisons individuelles, appartements et locaux professionnels</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Raccordement Provisoire */}
              <Link href="/raccordement-provisoire" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0072CE]/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementProvisoireIcon} alt="Raccordement Provisoire" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Raccordement Provisoire</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">Solution temporaire pour chantiers et installations éphémères</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Viabilisation */}
              <Link href="/viabilisation-terrain" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0072CE]/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={servicesTechniquesIcon} alt="Viabilisation Terrain" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Viabilisation Terrain</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">Préparation et équipement électrique de votre terrain</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Modification */}
              <Link href="/modification-compteur" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0072CE]/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={augmentationPuissanceIcon} alt="Modification Compteur" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Modification Compteur</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">Augmentation ou modification de puissance électrique</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Raccordement Collectif */}
              <Link href="/raccordement-collectif" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0072CE]/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementCollectifIcon} alt="Raccordement Collectif" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Raccordement Collectif</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">Solutions pour immeubles, résidences et copropriétés</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Maison Neuve / Raccordement Enedis */}
              <Link href="/raccordement-maison-neuve" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0072CE]/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementEnedisIcon} alt="Raccordement Maison Neuve" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Maison Neuve</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">Premier raccordement pour construction neuve</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-sm group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-16 md:py-20 bg-gray-50" id="faq" data-animate data-testid="faq-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Questions frequentes
              </h2>
              <p className="text-gray-600 text-base">
                Retrouvez les reponses aux questions les plus courantes sur nos services
              </p>
            </div>

            <div className={`space-y-4 transition-all duration-700 ${isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* FAQ Item 1 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-1">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Quels documents sont necessaires pour une demande de raccordement ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Les documents requis varient selon le type de raccordement. Generalement, vous aurez besoin d'un justificatif d'identite, d'un plan de situation du terrain, d'un plan de masse, et d'une autorisation d'urbanisme (permis de construire ou declaration prealable).
                </div>
              </details>

              {/* FAQ Item 2 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-2">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Quel est le delai moyen de traitement d'un dossier ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Le delai de traitement depend du type de raccordement. Pour un raccordement provisoire, comptez 2 a 4 semaines. Pour un raccordement definitif, le delai varie de 2 a 6 mois selon la complexite des travaux a realiser.
                </div>
              </details>

              {/* FAQ Item 3 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-3">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Gerez-vous les demandes de raccordement provisoire pour les chantiers ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Oui, nous prenons en charge les demandes de raccordement provisoire pour les chantiers de construction. Ce type de raccordement temporaire permet d'alimenter le chantier en electricite pendant la duree des travaux.
                </div>
              </details>

              {/* FAQ Item 4 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-4">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Votre service inclut-il le depot du dossier aupres d'Enedis ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Oui, notre service comprend la constitution complete de votre dossier et son depot officiel aupres d'Enedis. Nous verifions que tous les documents sont conformes avant transmission pour eviter tout rejet ou retard.
                </div>
              </details>

              {/* FAQ Item 5 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-5">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Puis-je suivre l'avancement de ma demande ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Absolument. Vous recevrez des notifications par email a chaque etape importante de votre dossier. Notre equipe reste disponible pour repondre a vos questions et vous tenir informe de l'avancement.
                </div>
              </details>

              {/* FAQ Item 6 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-6">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Les frais de raccordement Enedis sont-ils inclus dans votre service ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Non, notre tarif couvre uniquement notre service d'accompagnement et de constitution de dossier. Les frais de raccordement factures par Enedis sont a votre charge et vous seront communiques directement par Enedis apres etude de votre dossier.
                </div>
              </details>

              {/* FAQ Item 7 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-7">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Le paiement en ligne est-il securise ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Oui, tous les paiements sont traites via Stripe, une plateforme de paiement certifiee PCI DSS niveau 1. Vos donnees bancaires sont chiffrees et ne sont jamais stockees sur nos serveurs.
                </div>
              </details>

              {/* FAQ Item 8 */}
              <details className="bg-white rounded-lg border border-gray-200 group" data-testid="faq-item-8">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>Comment contacter votre service client ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  Vous pouvez nous contacter par email ou via notre formulaire de contact. Notre equipe repond generalement sous 24 a 48 heures ouvrées. Vous trouverez egalement nos coordonnees telephoniques sur notre page de contact.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* CTA BANNER - Before Footer */}
        <section 
          className="py-16 md:py-20"
          style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' }}
          data-testid="cta-banner-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-3xl text-center">
            {/* Headline */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3">
              Pret a demarrer votre projet ?
            </h2>

            {/* Subtext */}
            <p className="text-base text-white/90 mb-6">
              Rejoignez les centaines de clients satisfaits
            </p>

            {/* CTA Button */}
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <button 
                className="bg-white text-[#4F46E5] font-medium text-sm px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3"
                data-testid="cta-final-button"
              >
                Commencer ma demande
              </button>
            </Link>

            {/* Secondary text */}
            <p className="text-white/70 text-sm">
              Accompagnement personnalise sans engagement
            </p>
          </div>
        </section>

      </main>

      {/* Floating CTA Button */}
      <FloatingCtaButton />
    </>
  );
}
