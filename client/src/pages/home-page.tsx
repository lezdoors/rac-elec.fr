import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, Phone, CheckCircle, MapPin, FileText, Rocket, ChevronDown, Check, Users, Lock, Mail, Star, Plus } from "lucide-react";
import { ContactModal } from "@/components/contact-modal";
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
        <title>Demande de Raccordement Enedis en Ligne | Raccordement Électrique</title>
        <meta name="description" content="Faites votre demande de raccordement Enedis. Provisoire, définitif, collectif ou augmentation de puissance. Procédure simplifiée et sécurisée." />
        <meta name="keywords" content="demande de raccordement enedis, raccordement électrique, compteur Linky, branchement EDF" />
        <link rel="canonical" href="https://www.demande-raccordement.fr/" />
        <meta property="og:title" content="Demande de Raccordement Enedis en Ligne" />
        <meta property="og:description" content="Faites votre demande de raccordement Enedis simplifiée et sécurisée." />
        <meta property="og:url" content="https://www.demande-raccordement.fr/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "demande-raccordement.fr",
            "url": "https://www.demande-raccordement.fr/",
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
        {/* HERO SECTION - Premium Design - Fully Responsive */}
        <section 
          className="relative overflow-hidden pt-6 sm:pt-8 md:pt-12 lg:pt-16 pb-8 sm:pb-10 md:pb-14 lg:pb-16 bg-white"
          data-testid="hero-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-screen-xl">
            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
              {/* Left Content */}
              <div className="w-full lg:w-1/2 xl:w-[45%] text-center lg:text-left">
                {/* Main Headline - Responsive sizing */}
                <h1 className="mb-4 sm:mb-5 md:mb-6">
                  <span className="block text-[28px] sm:text-[32px] md:text-[40px] lg:text-[44px] xl:text-[48px] font-bold text-gray-900 leading-[1.1] tracking-tight">
                    Demande de
                  </span>
                  <span className="block text-[28px] sm:text-[32px] md:text-[40px] lg:text-[44px] xl:text-[48px] font-bold text-gray-900 leading-[1.1] tracking-tight">
                    Raccordement Enedis
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-[500px] mx-auto lg:mx-0 mb-6 sm:mb-8 md:mb-10">
                  Votre expert raccordement Enedis en ligne.<br className="hidden sm:block" />
                  Déposez votre demande en quelques minutes.
                </p>

                {/* Two CTA Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="w-full sm:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      data-testid="cta-hero-button"
                    >
                      Démarrer ma demande
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button 
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                      data-testid="contact-hero-button"
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                      Nous contacter
                    </button>
                  </Link>
                </div>

              </div>

              {/* Right Illustration - Responsive sizing */}
              <div className="w-full lg:w-1/2 xl:w-[55%] flex justify-center lg:justify-end mt-4 sm:mt-6 lg:mt-0">
                <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[550px] xl:max-w-[650px]">
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

        {/* 4-STEP PROCESS SECTION - Right after Hero */}
        <section 
          className="py-10 md:py-14"
          style={{ background: 'linear-gradient(180deg, #EBF4FF 0%, #F8FAFF 100%)' }}
          id="process"
          data-animate
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-[#0066CC] mb-4 leading-tight">
                Traitement des Demandes de Raccordement Électrique par Enedis
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Processus 100% en ligne en 4 étapes simples. Votre demande de raccordement Enedis traitée rapidement avec accompagnement personnalisé.
              </p>
            </div>

            {/* 4 Steps Grid - Parfaitement symétrique */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-16 transition-all duration-700 ${isVisible['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Step 1 */}
              <div className="text-center h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-5 shadow-lg flex-shrink-0">
                    1
                  </div>
                  <div className="w-40 h-40 md:w-44 md:h-44 flex items-center justify-center mb-5 flex-shrink-0">
                    <img 
                      src={step1Illustration}
                      alt="Définir le type de raccordement"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step1-illustration"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 leading-snug min-h-[3.5rem] flex items-center justify-center">
                      Définir le type de raccordement
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                      Utilisez notre outil pour cadrer votre demande.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-5 shadow-lg flex-shrink-0">
                    2
                  </div>
                  <div className="w-40 h-40 md:w-44 md:h-44 flex items-center justify-center mb-5 flex-shrink-0">
                    <img 
                      src={step2Illustration}
                      alt="Compléter un formulaire simple"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step2-illustration"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 leading-snug min-h-[3.5rem] flex items-center justify-center">
                      Compléter le formulaire en ligne
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                      Renseignez votre projet en quelques minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-5 shadow-lg flex-shrink-0">
                    3
                  </div>
                  <div className="w-40 h-40 md:w-44 md:h-44 flex items-center justify-center mb-5 flex-shrink-0">
                    <img 
                      src={step3Illustration}
                      alt="Dépôt du dossier chez Enedis"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step3-illustration"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 leading-snug min-h-[3.5rem] flex items-center justify-center">
                      Dépôt du dossier chez Enedis
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                      Constitution et envoi de votre dossier complet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-5 shadow-lg flex-shrink-0">
                    4
                  </div>
                  <div className="w-40 h-40 md:w-44 md:h-44 flex items-center justify-center mb-5 flex-shrink-0">
                    <img 
                      src={step4Illustration}
                      alt="Suivi jusqu'à la mise en service"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step4-illustration"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 leading-snug min-h-[3.5rem] flex items-center justify-center">
                      Suivi jusqu'à la mise en service
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                      Accompagnement personnalisé de A à Z.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid="cta-process-button"
                >
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 STEPS SIMPLE SECTION - Like original site */}
        <section 
          className="py-10 md:py-14"
          style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)' }}
          id="steps-simple"
          data-animate
          data-testid="steps-simple-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-[#0066CC] mb-4 leading-tight">
                3 Étapes Simples Pour Votre Raccordement Enedis
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Remplissez notre formulaire en ligne en quelques minutes. Nous nous occupons du reste.
              </p>
            </div>

            {/* Two Column Layout - Illustration + Steps */}
            <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 transition-all duration-700 ${isVisible['steps-simple'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Left - Large Illustration */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-full max-w-[450px]">
                  <img 
                    src={formIntroIllustration} 
                    alt="Femme remplissant un formulaire en ligne"
                    className="w-full h-auto"
                    loading="lazy"
                    data-testid="form-intro-illustration"
                  />
                </div>
              </div>

              {/* Right - 3 Steps List */}
              <div className="w-full lg:w-1/2">
                <div className="space-y-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Renseignez vos informations</h3>
                      <p className="text-base md:text-lg text-gray-600">Coordonnées et détails de votre projet</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Recevez votre devis</h3>
                      <p className="text-base md:text-lg text-gray-600">Sous 48h, un devis détaillé et personnalisé</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Validation et raccordement</h3>
                      <p className="text-base md:text-lg text-gray-600">Nous gérons toutes les démarches avec Enedis</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-12">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      data-testid="cta-steps-simple-button"
                    >
                      Démarrer ma demande maintenant
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - Centered Card Layout Like Original */}
        <section className="py-10 md:py-14 bg-white" id="types-raccordements" data-animate data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-4">
                Tous les Types de Raccordement Électrique Enedis
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Quelle que soit la nature de votre projet, nous vous accompagnons dans votre demande de raccordement électrique
              </p>
            </div>

            {/* Service Grid - Centered Cards with Icons Above */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 transition-all duration-700 ${isVisible['types-raccordements'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Raccordement Provisoire */}
              <Link href="/raccordement-enedis" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementProvisoireIcon} alt="Raccordement Provisoire" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Raccordement Provisoire</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Pour chantiers, événements temporaires et installations provisoires</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Definitif */}
              <Link href="/raccordement-enedis" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementDefinitifIcon} alt="Raccordement Définitif" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Raccordement Définitif</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Maisons neuves, locaux commerciaux et installations permanentes</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Augmentation de Puissance */}
              <Link href="/raccordement-enedis" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={augmentationPuissanceIcon} alt="Augmentation de Puissance" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Augmentation de Puissance</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Augmentez la capacité de votre raccordement électrique existant</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Collectif */}
              <Link href="/raccordement-enedis" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementCollectifIcon} alt="Raccordement Collectif" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Raccordement Collectif</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Immeubles résidentiels, copropriétés et bâtiments multi-logements</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Viabilisation Terrain */}
              <Link href="/raccordement-enedis" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={servicesTechniquesIcon} alt="Viabilisation Terrain" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Viabilisation Terrain</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Préparation électrique de votre terrain à bâtir</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Modification Raccordement */}
              <Link href="/raccordement-enedis" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementEnedisIcon} alt="Maison Neuve" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Maison Neuve</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Premier raccordement pour votre construction neuve</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>

            {/* FAQ Link */}
            <div className="text-center mt-16">
              <p className="text-lg text-gray-600 mb-4">Vous ne savez pas quel type de raccordement choisir ?</p>
              <button 
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center text-[#0072CE] font-medium text-lg hover:text-[#005eaa] cursor-pointer"
              >
                Consultez notre FAQ <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* ASSISTANCE SECTION - Transparent icons like original site */}
        <section className="py-10 md:py-14 bg-gray-50" id="assistance" data-animate data-testid="assistance-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-3">
                Assistance pour Votre Demande de Raccordement Enedis
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Nous sommes à votre écoute
              </p>
            </div>

            {/* 4 Assistance Icons - Transparent backgrounds like original site */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 transition-all duration-700 ${isVisible['assistance'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Appelez-nous */}
              <a href="tel:0970709570" className="group text-center" data-testid="assistance-card-call">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 flex items-center justify-center group-hover:-translate-y-1 transition-all duration-200">
                  <img 
                    src={appelezNousIllustration} 
                    alt="Appelez-nous" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0072CE]">Appelez-nous</h3>
              </a>

              {/* Rappel gratuit */}
              <Link href="/contact" className="group text-center" data-testid="assistance-card-callback">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 flex items-center justify-center group-hover:-translate-y-1 transition-all duration-200">
                  <img 
                    src={rappelGratuitIllustration} 
                    alt="Rappel gratuit" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0072CE]">Rappel gratuit</h3>
              </Link>

              {/* Chat */}
              <Link href="/contact" className="group text-center" data-testid="assistance-card-chat">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 flex items-center justify-center group-hover:-translate-y-1 transition-all duration-200">
                  <img 
                    src={chatIllustration} 
                    alt="Chat" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0072CE]">Chat</h3>
              </Link>

              {/* Formulaire de contact */}
              <Link href="/contact" className="group text-center" data-testid="assistance-card-form">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 flex items-center justify-center group-hover:-translate-y-1 transition-all duration-200">
                  <img 
                    src={contactFormIllustration} 
                    alt="Formulaire de contact" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0072CE]">Formulaire de contact</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* BESOIN D'AIDE SECTION - Like Original */}
        <section className="py-10 md:py-14 bg-white" id="besoin-aide" data-animate data-testid="besoin-aide-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 transition-all duration-700 ${isVisible['besoin-aide'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Left - Illustration */}
              <div className="w-full lg:w-2/5 flex justify-center">
                <div className="w-full max-w-[350px]">
                  <img 
                    src={contactFormIllustration} 
                    alt="Support client disponible"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right - Content */}
              <div className="w-full lg:w-3/5 text-center lg:text-left">
                <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-6">
                  Besoin d'aide ?
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0">
                  Notre équipe d'experts est disponible pour répondre à toutes vos questions
                </p>
                
                {/* Contact Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                  <a 
                    href="tel:0970709570" 
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    09 70 70 95 70
                  </a>
                  <Link href="/contact">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-8 py-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      Envoyer un email
                    </button>
                  </Link>
                </div>
                
                <p className="text-base text-gray-500">
                  Lundi - Vendredi, 8h à 18h
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION - Professional Design */}
        <section className="py-12 md:py-16 bg-white" id="testimonials" data-animate data-testid="testimonials-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-[28px] sm:text-[32px] md:text-[42px] font-bold text-[#0066CC] mb-4">
                Ce que nos clients disent de nous
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Des centaines de particuliers et professionnels nous font confiance pour leurs démarches de raccordement électrique
              </p>
            </div>

            {/* Testimonial Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Testimonial 1 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    SB
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sophie Bertrand</p>
                    <p className="text-sm text-gray-500">Raccordement maison neuve - Bordeaux</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Service impeccable du début à la fin. Mon dossier de raccordement pour ma maison neuve a été traité en 3 semaines. L'équipe m'a tenu informé à chaque étape. Je recommande vivement."
                </p>
                <p className="text-xs text-gray-400 mt-4">Novembre 2024</p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    MD
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Marc Dupont</p>
                    <p className="text-sm text-gray-500">Raccordement provisoire chantier - Lyon</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "En tant que chef de chantier, j'ai besoin de réactivité. La demande de raccordement provisoire a été traitée rapidement et le suivi était parfait. Très professionnel."
                </p>
                <p className="text-xs text-gray-400 mt-4">Octobre 2024</p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    CL
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Claire Laurent</p>
                    <p className="text-sm text-gray-500">Modification compteur - Nantes</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Je ne savais pas par où commencer pour augmenter la puissance de mon compteur. Tout a été pris en charge, je n'ai eu qu'à valider. Simple et efficace."
                </p>
                <p className="text-xs text-gray-400 mt-4">Décembre 2024</p>
              </div>

              {/* Testimonial 4 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    PG
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Philippe Garcia</p>
                    <p className="text-sm text-gray-500">Viabilisation terrain - Marseille</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Pour la viabilisation de mon terrain, les démarches administratives étaient complexes. Cette équipe a su gérer tout le processus avec Enedis. Merci !"
                </p>
                <p className="text-xs text-gray-400 mt-4">Septembre 2024</p>
              </div>

              {/* Testimonial 5 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#EC4899] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    AM
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Amélie Martin</p>
                    <p className="text-sm text-gray-500">Raccordement définitif - Paris</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Le formulaire en ligne est très intuitif et l'équipe répond rapidement aux questions. Mon raccordement définitif a été effectué dans les délais annoncés."
                </p>
                <p className="text-xs text-gray-400 mt-4">Novembre 2024</p>
              </div>

              {/* Testimonial 6 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#06B6D4] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    TR
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Thomas Roux</p>
                    <p className="text-sm text-gray-500">Raccordement collectif - Lille</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Pour notre projet de lotissement, nous avions besoin d'un partenaire fiable. La coordination avec Enedis a été parfaitement gérée. Très satisfait du service."
                </p>
                <p className="text-xs text-gray-400 mt-4">Octobre 2024</p>
              </div>
            </div>

            {/* Trust Indicator */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full">
                <div className="flex -space-x-2">
                  {['SB', 'MD', 'CL', 'PG'].map((initials, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-[#3B82F6] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">Plus de <strong className="text-gray-900">1 200 clients</strong> satisfaits</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION - Professional Multi-Column Design */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white" id="faq" data-animate data-testid="faq-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-[28px] sm:text-[32px] md:text-[42px] font-bold text-[#0066CC] mb-4 italic">
                Questions fréquemment posées
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Trouvez rapidement les réponses à vos questions sur le raccordement électrique Enedis
              </p>
            </div>

            {/* FAQ Categories Grid - 2 columns for better balance */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-10 transition-all duration-700 ${isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Category 1: Demarches et Documents */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#3B82F6]">
                  Démarches et documents
                </h3>
                <div className="space-y-3">
                  {[
                    { q: "Quels documents fournir pour mon dossier ?", a: "Un justificatif d'identité, plan de situation, plan de masse et autorisation d'urbanisme (permis ou déclaration préalable)." },
                    { q: "Mon dossier est-il déposé auprès d'Enedis ?", a: "Oui, nous constituons et déposons votre dossier complet auprès d'Enedis après vérification de conformité." },
                    { q: "Puis-je modifier ma demande après envoi ?", a: "Oui, contactez notre équipe pour toute modification. Nous ajusterons votre dossier avant sa transmission finale." }
                  ].map((item, idx) => (
                    <details key={idx} className="group" data-testid={`faq-demarches-${idx + 1}`}>
                      <summary className="flex items-center justify-between cursor-pointer py-3 text-gray-700 hover:text-[#3B82F6] group-open:text-[#3B82F6] transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&::-webkit-details-marker]:hidden list-none">
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <Plus className="w-4 h-4 text-gray-400 group-open:rotate-45 group-open:text-[#3B82F6] transition-transform flex-shrink-0" />
                      </summary>
                      <div className="pb-3 text-sm text-gray-500 leading-relaxed pl-0">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Category 2: Delais et Suivi */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#3B82F6]">
                  Délais et suivi
                </h3>
                <div className="space-y-3">
                  {[
                    { q: "Quel est le délai de traitement moyen ?", a: "Raccordement provisoire : 2-4 semaines. Raccordement définitif : 2-6 mois selon la complexité des travaux." },
                    { q: "Puis-je suivre l'avancement de ma demande ?", a: "Oui, vous recevez des notifications email à chaque étape et notre équipe reste disponible pour vous informer." },
                    { q: "Quand intervient Enedis sur mon terrain ?", a: "Après validation du devis et réalisation des travaux préalables, Enedis planifie l'intervention sous 2 à 8 semaines." }
                  ].map((item, idx) => (
                    <details key={idx} className="group" data-testid={`faq-delais-${idx + 1}`}>
                      <summary className="flex items-center justify-between cursor-pointer py-3 text-gray-700 hover:text-[#3B82F6] group-open:text-[#3B82F6] transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&::-webkit-details-marker]:hidden list-none">
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <Plus className="w-4 h-4 text-gray-400 group-open:rotate-45 group-open:text-[#3B82F6] transition-transform flex-shrink-0" />
                      </summary>
                      <div className="pb-3 text-sm text-gray-500 leading-relaxed pl-0">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Category 3: Tarifs et Paiement */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#3B82F6]">
                  Tarifs et paiement
                </h3>
                <div className="space-y-3">
                  {[
                    { q: "Le paiement en ligne est-il sécurisé ?", a: "Oui, notre système de paiement est certifié PCI DSS niveau 1. Vos données bancaires sont chiffrées et jamais stockées." },
                    { q: "Quels sont les frais de service ?", a: "Nos frais de constitution de dossier sont affichés clairement. Les frais Enedis sont facturés séparément par le gestionnaire." },
                    { q: "Puis-je payer en plusieurs fois ?", a: "Actuellement, le paiement s'effectue en une fois lors de la validation de votre demande." }
                  ].map((item, idx) => (
                    <details key={idx} className="group" data-testid={`faq-tarifs-${idx + 1}`}>
                      <summary className="flex items-center justify-between cursor-pointer py-3 text-gray-700 hover:text-[#3B82F6] group-open:text-[#3B82F6] transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&::-webkit-details-marker]:hidden list-none">
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <Plus className="w-4 h-4 text-gray-400 group-open:rotate-45 group-open:text-[#3B82F6] transition-transform flex-shrink-0" />
                      </summary>
                      <div className="pb-3 text-sm text-gray-500 leading-relaxed pl-0">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Category 4: Types de Raccordement */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#3B82F6]">
                  Types de raccordement
                </h3>
                <div className="space-y-3">
                  {[
                    { q: "Gérez-vous les raccordements provisoires ?", a: "Oui, pour les chantiers de construction. Ce raccordement temporaire alimente votre chantier pendant les travaux." },
                    { q: "Quelle différence entre provisoire et définitif ?", a: "Le provisoire est temporaire pour les chantiers. Le définitif est permanent pour l'habitation terminée." },
                    { q: "Proposez-vous le raccordement collectif ?", a: "Oui, pour les lotissements et immeubles collectifs avec gestion des parties communes." }
                  ].map((item, idx) => (
                    <details key={idx} className="group" data-testid={`faq-types-${idx + 1}`}>
                      <summary className="flex items-center justify-between cursor-pointer py-3 text-gray-700 hover:text-[#3B82F6] group-open:text-[#3B82F6] transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 [&::-webkit-details-marker]:hidden list-none">
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <Plus className="w-4 h-4 text-gray-400 group-open:rotate-45 group-open:text-[#3B82F6] transition-transform flex-shrink-0" />
                      </summary>
                      <div className="pb-3 text-sm text-gray-500 leading-relaxed pl-0">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 text-center sm:text-left">
                <p className="text-sm sm:text-base font-semibold text-gray-900">Une question&nbsp;? Nos conseillers vous répondent.</p>
                <div className="flex items-center text-sm text-gray-600">
                  <a href="tel:0970709570" className="flex items-center gap-2 hover:text-[#3B82F6] transition-colors">
                    <Phone className="w-4 h-4" />
                    09 70 70 95 70
                  </a>
                </div>
              </div>
              <ContactModal 
                source="faq_callback"
                trigger={
                  <button 
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-200"
                    data-testid="faq-callback-button"
                  >
                    Être rappelé
                  </button>
                }
              />
            </div>
          </div>
        </section>

      </main>

      {/* Floating CTA Button */}
      <FloatingCtaButton />
    </>
  );
}
