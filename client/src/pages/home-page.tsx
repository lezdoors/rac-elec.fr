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
import appelezNousIllustration from "@assets/Appelez-nous_1765363264301.webp";
import rappelGratuitIllustration from "@assets/Appelez--nous_1765363489714.webp";
import chatIllustration from "@assets/Chat_1765363276867.webp";
import contactFormIllustration from "@assets/Besoin_d'aide_1765363456384.webp";

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
        <title>Demande de Raccordement Enedis en Ligne | Raccordement Electrique</title>
        <meta name="description" content="Faites votre demande de raccordement Enedis. Provisoire, definitif, collectif ou augmentation de puissance. Procedure simplifiee et securisee." />
        <meta name="keywords" content="demande de raccordement enedis, raccordement electrique, compteur Linky, branchement EDF" />
        <link rel="canonical" href="https://www.raccordement-connect.com/" />
        <meta property="og:title" content="Demande de Raccordement Enedis en Ligne" />
        <meta property="og:description" content="Faites votre demande de raccordement Enedis simplifiee et securisee." />
        <meta property="og:url" content="https://www.raccordement-connect.com/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Raccordement-Connect.com",
            "url": "https://www.raccordement-connect.com/",
            "description": "Services professionnels de raccordement electrique Enedis pour particuliers et professionnels en France.",
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
        {/* HERO SECTION - Clean White Design with subtle gradient background */}
        <section 
          className="relative overflow-hidden pt-[120px] pb-24 border-b"
          style={{ 
            background: 'radial-gradient(circle at 70% 30%, #EEF2FF 0%, #FFFFFF 60%)',
            borderBottomColor: 'rgba(15, 23, 42, 0.06)'
          }}
          data-testid="hero-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left Content - 50% */}
              <div className="w-full lg:w-[50%] text-center lg:text-left">
                {/* Main Headline - H1: 48px semibold */}
                <h1 className="mb-6">
                  <span className="block text-[32px] sm:text-[40px] md:text-[48px] font-semibold text-gray-900 leading-tight tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                    Demande de
                  </span>
                  <span className="block text-[32px] sm:text-[40px] md:text-[48px] font-semibold text-gray-900 leading-tight tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                    Raccordement Enedis
                  </span>
                </h1>

                {/* Subheadline - max-width 620px */}
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-[620px] mx-auto lg:mx-0 mb-8">
                  Votre expert raccordement Enedis en ligne.<br />
                  Deposez votre demande en quelques minutes.
                </p>

                {/* Two CTA Buttons - more spacing */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-base px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
                      data-testid="cta-hero-button"
                    >
                      Demarrer ma demande
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button 
                      className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-7 py-3.5 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-150 flex items-center gap-2"
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
                    <span className="text-sm">Reponse en 48h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Securise</span>
                  </div>
                </div>
              </div>

              {/* Right Illustration - 50% - Increased size by 15-20% */}
              <div className="w-full lg:w-[50%] flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg lg:max-w-2xl">
                  <img 
                    src={heroIllustration} 
                    alt="Famille devant une maison avec panneaux solaires et voiture electrique - Raccordement electrique Enedis"
                    className="w-full h-auto"
                    loading="eager"
                    data-testid="hero-illustration"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM INTRO SECTION - 80px top padding from hero */}
        <section className="pt-20 pb-24 bg-white" id="form-intro" data-animate data-testid="form-intro-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            <div className={`flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16 transition-all duration-700 ${isVisible['form-intro'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Left Illustration - Larger sizing */}
              <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-sm">
                  <img 
                    src={formIntroIllustration} 
                    alt="Femme remplissant un formulaire en ligne pour sa demande de raccordement electrique"
                    className="w-full h-auto"
                    loading="lazy"
                    data-testid="form-intro-illustration"
                  />
                </div>
              </div>

              {/* Right Content - max-width 560-600px */}
              <div className="w-full lg:w-3/5 text-center lg:text-left">
                <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-gray-900 mb-6 leading-snug max-w-[600px] mx-auto lg:mx-0">
                  Commencez votre demande de raccordement Enedis ici
                </h2>
                <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-[560px] mx-auto lg:mx-0">
                  Demarrez votre demande de raccordement electrique Enedis en quelques clics. Formulaire 100% en ligne, traitement rapide, accompagnement expert inclus.
                </p>
                <Link href="/raccordement-enedis#formulaire-raccordement">
                  <button 
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium text-base px-7 py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
                    data-testid="cta-form-intro-button"
                  >
                    Demarrer ma demande
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION - 96px vertical padding */}
        <section 
          className="py-24"
          style={{ background: 'linear-gradient(180deg, #EBF4FF 0%, #F0F7FF 50%, #FFFFFF 100%)' }}
          id="process"
          data-animate
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header - H2: 32-36px */}
            <div className="text-center mb-12">
              <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold text-[#0066CC] mb-6 leading-tight">
                Comment faire sa demande de raccordement electrique en ligne ?
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Processus 100% en ligne en 4 etapes simples. Votre demande de raccordement Enedis traitee rapidement avec accompagnement personnalise.
              </p>
            </div>

            {/* 4 Steps - gap-10 (40px) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
              
              {/* Step 1 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {/* Numbered Circle - consistent sizing */}
                  <div className="w-14 h-14 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-5 shadow-md">
                    1
                  </div>
                  {/* Illustration - increased size */}
                  <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center mb-5">
                    <img 
                      src={step1Illustration}
                      alt="Definir le type de raccordement"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step1-illustration"
                    />
                  </div>
                  {/* Title - H3: 22-24px */}
                  <h3 className="text-[18px] md:text-[20px] font-medium text-gray-900 mb-3 leading-tight px-2">
                    Definir le type de raccordement correspondant a mon besoin
                  </h3>
                  {/* Description - 16px */}
                  <p className="text-base text-gray-500 px-2">
                    Utilisez notre outil pour cadrer precisement votre demande.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-5 shadow-md">
                    2
                  </div>
                  <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center mb-5">
                    <img 
                      src={step2Illustration}
                      alt="Completer un formulaire simple"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step2-illustration"
                    />
                  </div>
                  <h3 className="text-[18px] md:text-[20px] font-medium text-gray-900 mb-3 leading-tight px-2">
                    Completer un formulaire simple ou demander l'assistance de nos experts
                  </h3>
                  <p className="text-base text-gray-500 px-2">
                    Renseignez votre projet en quelques minutes.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-5 shadow-md">
                    3
                  </div>
                  <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center mb-5">
                    <img 
                      src={step3Illustration}
                      alt="Depot du dossier chez Enedis"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step3-illustration"
                    />
                  </div>
                  <h3 className="text-[18px] md:text-[20px] font-medium text-gray-900 mb-3 leading-tight px-2">
                    Nous deposons un dossier complet et conforme chez Enedis
                  </h3>
                  <p className="text-base text-gray-500 px-2">
                    Constitution et depot de votre dossier.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-5 shadow-md">
                    4
                  </div>
                  <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center mb-5">
                    <img 
                      src={step4Illustration}
                      alt="Suivi de dossier jusqu'a la mise en service"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step4-illustration"
                    />
                  </div>
                  <h3 className="text-[18px] md:text-[20px] font-medium text-gray-900 mb-3 leading-tight px-2">
                    Suivi personnalise jusqu'a la mise en service
                  </h3>
                  <p className="text-base text-gray-500 px-2">
                    Accompagnement de A a Z.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium text-base px-7 py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
                  data-testid="cta-process-button"
                >
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - 80px top, 96px bottom */}
        <section className="pt-20 pb-24 bg-white" id="types-raccordements" data-animate data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header - H2: 32-36px */}
            <div className="text-center mb-12">
              <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold text-gray-900 mb-6">
                Votre Demande de <span className="text-[#0072CE]">Raccordement</span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
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

            {/* Service Grid - Unified Card Styles: 16px radius, subtle border/shadow, p-8 padding */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${isVisible['types-raccordements'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Raccordement Definitif */}
              <Link href="/raccordement-definitif" className="group">
                <div 
                  className="bg-white rounded-2xl p-8 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F7FF';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementDefinitifIcon} alt="Raccordement Definitif" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] md:text-[22px] font-medium text-gray-900 mb-2">Raccordement Definitif</h3>
                      <p className="text-gray-600 text-base mb-3">Pour maisons individuelles, appartements et locaux professionnels</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-base group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Raccordement Provisoire */}
              <Link href="/raccordement-provisoire" className="group">
                <div 
                  className="bg-white rounded-2xl p-8 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F7FF';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementProvisoireIcon} alt="Raccordement Provisoire" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] md:text-[22px] font-medium text-gray-900 mb-2">Raccordement Provisoire</h3>
                      <p className="text-gray-600 text-base mb-3">Solution temporaire pour chantiers et installations ephemeres</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-base group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Viabilisation */}
              <Link href="/viabilisation-terrain" className="group">
                <div 
                  className="bg-white rounded-2xl p-8 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F7FF';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={servicesTechniquesIcon} alt="Viabilisation Terrain" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] md:text-[22px] font-medium text-gray-900 mb-2">Viabilisation Terrain</h3>
                      <p className="text-gray-600 text-base mb-3">Preparation et equipement electrique de votre terrain</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-base group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Modification */}
              <Link href="/modification-compteur" className="group">
                <div 
                  className="bg-white rounded-2xl p-8 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F7FF';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={augmentationPuissanceIcon} alt="Modification Compteur" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] md:text-[22px] font-medium text-gray-900 mb-2">Modification Compteur</h3>
                      <p className="text-gray-600 text-base mb-3">Augmentation ou modification de puissance electrique</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-base group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Raccordement Collectif */}
              <Link href="/raccordement-collectif" className="group">
                <div 
                  className="bg-white rounded-2xl p-8 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F7FF';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementCollectifIcon} alt="Raccordement Collectif" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] md:text-[22px] font-medium text-gray-900 mb-2">Raccordement Collectif</h3>
                      <p className="text-gray-600 text-base mb-3">Pour lotissements, immeubles et projets multi-logements</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-base group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Maison Neuve */}
              <Link href="/raccordement-maison-neuve" className="group">
                <div 
                  className="bg-white rounded-2xl p-8 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F7FF';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={raccordementEnedisIcon} alt="Raccordement Maison Neuve" className="w-14 h-14 object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] md:text-[22px] font-medium text-gray-900 mb-2">Maison Neuve</h3>
                      <p className="text-gray-600 text-base mb-3">Premier raccordement pour construction neuve</p>
                      <span className="inline-flex items-center text-[#0072CE] font-medium text-base group-hover:text-[#005eaa]">
                        En savoir plus <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ SECTION - 96px vertical padding, reduced accordion padding */}
        <section className="py-24 bg-gray-50" id="faq" data-animate data-testid="faq-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold text-gray-900 mb-6">
                Questions frequentes
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Retrouvez les reponses aux questions les plus courantes sur nos services
              </p>
            </div>

            <div className={`space-y-3 transition-all duration-700 ${isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* FAQ Item 1 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-1"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Quels documents sont necessaires pour une demande de raccordement ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Les documents requis varient selon le type de raccordement. Generalement, vous aurez besoin d'un justificatif d'identite, d'un plan de situation du terrain, d'un plan de masse, et d'une autorisation d'urbanisme (permis de construire ou declaration prealable).
                </div>
              </details>

              {/* FAQ Item 2 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-2"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Quel est le delai moyen de traitement d'un dossier ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Le delai de traitement depend du type de raccordement. Pour un raccordement provisoire, comptez 2 a 4 semaines. Pour un raccordement definitif, le delai varie de 2 a 6 mois selon la complexite des travaux a realiser.
                </div>
              </details>

              {/* FAQ Item 3 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-3"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Gerez-vous les demandes de raccordement provisoire pour les chantiers ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Oui, nous prenons en charge les demandes de raccordement provisoire pour les chantiers de construction. Ce type de raccordement temporaire permet d'alimenter le chantier en electricite pendant la duree des travaux.
                </div>
              </details>

              {/* FAQ Item 4 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-4"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Votre service inclut-il le depot du dossier aupres d'Enedis ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Oui, notre service comprend la constitution complete de votre dossier et son depot officiel aupres d'Enedis. Nous verifions que tous les documents sont conformes avant transmission pour eviter tout rejet ou retard.
                </div>
              </details>

              {/* FAQ Item 5 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-5"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Puis-je suivre l'avancement de ma demande ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Absolument. Vous recevrez des notifications par email a chaque etape importante de votre dossier. Notre equipe reste disponible pour repondre a vos questions et vous tenir informe de l'avancement.
                </div>
              </details>

              {/* FAQ Item 6 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-6"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Les frais de raccordement Enedis sont-ils inclus dans votre service ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Non, notre tarif couvre uniquement notre service d'accompagnement et de constitution de dossier. Les frais de raccordement factures par Enedis sont a votre charge et vous seront communiques directement par Enedis apres etude de votre dossier.
                </div>
              </details>

              {/* FAQ Item 7 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-7"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Le paiement en ligne est-il securise ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Oui, tous les paiements sont traites via Stripe, une plateforme de paiement certifiee PCI DSS niveau 1. Vos donnees bancaires sont chiffrees et ne sont jamais stockees sur nos serveurs.
                </div>
              </details>

              {/* FAQ Item 8 */}
              <details 
                className="bg-white rounded-2xl group"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                data-testid="faq-item-8"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-[18px] md:text-[20px] font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                  <span>Comment contacter votre service client ?</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-base leading-relaxed">
                  Vous pouvez nous contacter par email ou via notre formulaire de contact. Notre equipe repond generalement sous 24 a 48 heures ouvrees. Vous trouverez egalement nos coordonnees telephoniques sur notre page de contact.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* ASSISTANCE SECTION - 96px vertical padding */}
        <section className="py-24 bg-white" id="assistance" data-animate data-testid="assistance-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
            {/* Header - H2: 32-36px */}
            <div className="text-center mb-12">
              <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold text-gray-900 mb-6">
                Assistance pour votre demande de raccordement Enedis
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Nous sommes a votre ecoute pour vous accompagner.
              </p>
            </div>

            {/* 4 Cards Grid - gap-10 (40px), unified card style */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${isVisible['assistance'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Card 1 - Appelez-nous */}
              <a 
                href="tel:0970709570" 
                className="group bg-white rounded-2xl p-8 text-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F7FF';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                }}
                data-testid="assistance-card-call"
              >
                <div className="w-[130px] h-[130px] mx-auto mb-5">
                  <img 
                    src={appelezNousIllustration} 
                    alt="Appelez-nous" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-[20px] md:text-[22px] font-medium text-[#0072CE] mb-3">Appelez-nous</h3>
                <p className="text-gray-600 text-base">Parlez directement avec un conseiller.</p>
              </a>

              {/* Card 2 - Rappel gratuit */}
              <Link 
                href="/contact"
                className="group bg-white rounded-2xl p-8 text-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F7FF';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                }}
                data-testid="assistance-card-callback"
              >
                <div className="w-[130px] h-[130px] mx-auto mb-5">
                  <img 
                    src={rappelGratuitIllustration} 
                    alt="Rappel gratuit" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-[20px] md:text-[22px] font-medium text-[#0072CE] mb-3">Rappel gratuit</h3>
                <p className="text-gray-600 text-base">Laissez votre numero, nous vous rappelons rapidement.</p>
              </Link>

              {/* Card 3 - Chat */}
              <Link 
                href="/contact"
                className="group bg-white rounded-2xl p-8 text-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F7FF';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                }}
                data-testid="assistance-card-chat"
              >
                <div className="w-[130px] h-[130px] mx-auto mb-5">
                  <img 
                    src={chatIllustration} 
                    alt="Chat" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-[20px] md:text-[22px] font-medium text-[#0072CE] mb-3">Chat</h3>
                <p className="text-gray-600 text-base">Obtenez une reponse en direct.</p>
              </Link>

              {/* Card 4 - Formulaire de contact */}
              <Link 
                href="/contact"
                className="group bg-white rounded-2xl p-8 text-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F7FF';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                }}
                data-testid="assistance-card-form"
              >
                <div className="w-[130px] h-[130px] mx-auto mb-5">
                  <img 
                    src={contactFormIllustration} 
                    alt="Formulaire de contact" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-[20px] md:text-[22px] font-medium text-[#0072CE] mb-3">Formulaire de contact</h3>
                <p className="text-gray-600 text-base">Envoyez votre demande, reponse sous 24 heures.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BANNER - Reduced height: 56-72px vertical padding, 40px space before footer */}
        <section 
          className="py-14 md:py-[72px]"
          style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' }}
          data-testid="cta-banner-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-3xl text-center">
            {/* Headline - H2 */}
            <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-white mb-4">
              Pret a demarrer votre projet ?
            </h2>

            {/* Subtext */}
            <p className="text-base md:text-lg text-white/90 mb-8">
              Rejoignez les centaines de clients satisfaits
            </p>

            {/* CTA Button */}
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <button 
                className="bg-white text-[#4F46E5] font-medium text-base px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 mb-4"
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

        {/* Spacer before footer - 40px */}
        <div className="h-10 bg-white" aria-hidden="true"></div>

      </main>

      {/* Floating CTA Button */}
      <FloatingCtaButton />
    </>
  );
}
