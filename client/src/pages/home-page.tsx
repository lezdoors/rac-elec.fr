import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Building, Home as HomeIcon, BarChart, Clock, Shield, Phone, CheckCircle, MapPin, FileText, Rocket, ChevronDown, Check, Users, Lock, Mail, Star } from "lucide-react";
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
        {/* HERO SECTION - Premium Design */}
        <section 
          className="relative overflow-hidden pt-12 md:pt-16 lg:pt-20 pb-16 md:pb-20 lg:pb-24 bg-white"
          data-testid="hero-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left Content */}
              <div className="w-full lg:w-[45%] text-center lg:text-left">
                {/* Main Headline - H1: 48px bold */}
                <h1 className="mb-6">
                  <span className="block text-[36px] sm:text-[44px] md:text-[48px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                    Demande de
                  </span>
                  <span className="block text-[36px] sm:text-[44px] md:text-[48px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                    Raccordement Enedis
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-[500px] mx-auto lg:mx-0 mb-10">
                  Votre expert raccordement Enedis en ligne.<br />
                  Deposez votre demande en quelques minutes.
                </p>

                {/* Two CTA Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-12">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      data-testid="cta-hero-button"
                    >
                      Demarrer ma demande
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button 
                      className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-8 py-4 rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                      data-testid="contact-hero-button"
                    >
                      <Phone className="w-5 h-5" />
                      Nous contacter
                    </button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-base">100% en ligne</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-base">Reponse en 48h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-base">Securise</span>
                  </div>
                </div>
              </div>

              {/* Right Illustration - MUCH LARGER (+35-40%) */}
              <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[600px] lg:max-w-[700px]">
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

        {/* 3 STEPS SIMPLE SECTION - Like original site */}
        <section 
          className="py-16 md:py-20 lg:py-24"
          style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)' }}
          id="steps-simple"
          data-animate
          data-testid="steps-simple-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-[#0066CC] mb-4 leading-tight">
                3 Etapes Simples Pour Votre Raccordement Enedis
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
                      <p className="text-base md:text-lg text-gray-600">Coordonnees et details de votre projet</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Recevez votre devis</h3>
                      <p className="text-base md:text-lg text-gray-600">Sous 48h, un devis detaille et personnalise</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Validation et raccordement</h3>
                      <p className="text-base md:text-lg text-gray-600">Nous gerons toutes les demarches avec Enedis</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-12">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                      data-testid="cta-steps-simple-button"
                    >
                      Demarrer ma demande maintenant
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - Centered Card Layout Like Original */}
        <section className="py-16 md:py-20 lg:py-24 bg-white" id="types-raccordements" data-animate data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-4">
                Tous les Types de Raccordement Electrique Enedis
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Quelle que soit la nature de votre projet, nous vous accompagnons dans votre demande de raccordement electrique
              </p>
            </div>

            {/* Service Grid - Centered Cards with Icons Above */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 transition-all duration-700 ${isVisible['types-raccordements'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Raccordement Provisoire */}
              <Link href="/raccordement-provisoire" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementProvisoireIcon} alt="Raccordement Provisoire" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Raccordement Provisoire</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Pour chantiers, evenements temporaires et installations provisoires</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Definitif */}
              <Link href="/raccordement-definitif" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementDefinitifIcon} alt="Raccordement Definitif" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Raccordement Definitif</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Maisons neuves, locaux commerciaux et installations permanentes</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Augmentation de Puissance */}
              <Link href="/modification-compteur" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={augmentationPuissanceIcon} alt="Augmentation de Puissance" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Augmentation de Puissance</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Augmentez la capacite de votre raccordement electrique existant</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Collectif */}
              <Link href="/raccordement-collectif" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={raccordementCollectifIcon} alt="Raccordement Collectif" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Raccordement Collectif</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Immeubles residentiels, coproprietes et batiments multi-logements</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Viabilisation Terrain */}
              <Link href="/viabilisation-terrain" className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-gray-100 h-full">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                    <img src={servicesTechniquesIcon} alt="Viabilisation Terrain" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0072CE] mb-4">Viabilisation Terrain</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">Preparation electrique de votre terrain a batir</p>
                  <span className="inline-flex items-center text-[#3B82F6] font-medium text-base group-hover:text-[#2563EB]">
                    Faire une demande <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Modification Raccordement */}
              <Link href="/raccordement-maison-neuve" className="group">
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
              <Link href="#faq" className="inline-flex items-center text-[#0072CE] font-medium text-lg hover:text-[#005eaa]">
                Consultez notre FAQ <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* ASSISTANCE SECTION - Transparent icons like original site */}
        <section className="py-16 md:py-20 lg:py-24 bg-gray-50" id="assistance" data-animate data-testid="assistance-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-3">
                Assistance pour Votre Demande de Raccordement Enedis
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Nous sommes a votre ecoute
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

        {/* 4-STEP PROCESS SECTION - Larger Icons & Numbers */}
        <section 
          className="py-16 md:py-20 lg:py-24"
          style={{ background: 'linear-gradient(180deg, #EBF4FF 0%, #F8FAFF 100%)' }}
          id="process"
          data-animate
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-[#0066CC] mb-4 leading-tight">
                Comment Faire sa Demande de Raccordement Electrique en Ligne ?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Processus 100% en ligne en 4 etapes simples. Votre demande de raccordement Enedis traitee rapidement avec accompagnement personnalise.
              </p>
            </div>

            {/* 4 Steps Grid - Larger Icons (56px+) and Numbers (44px) */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16 transition-all duration-700 ${isVisible['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Step 1 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg">
                    1
                  </div>
                  <div className="w-44 h-44 md:w-52 md:h-52 flex items-center justify-center mb-6">
                    <img 
                      src={step1Illustration}
                      alt="Definir le type de raccordement"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step1-illustration"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    Definir le type de raccordement correspondant a mon besoin
                  </h3>
                  <p className="text-base md:text-lg text-gray-500">
                    Utilisez notre outil pour cadrer precisement votre demande.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg">
                    2
                  </div>
                  <div className="w-44 h-44 md:w-52 md:h-52 flex items-center justify-center mb-6">
                    <img 
                      src={step2Illustration}
                      alt="Completer un formulaire simple"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step2-illustration"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    Completer un formulaire simple ou demander l'assistance de nos experts
                  </h3>
                  <p className="text-base md:text-lg text-gray-500">
                    Renseignez votre projet en quelques etapes.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg">
                    3
                  </div>
                  <div className="w-44 h-44 md:w-52 md:h-52 flex items-center justify-center mb-6">
                    <img 
                      src={step3Illustration}
                      alt="Depot du dossier chez Enedis"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step3-illustration"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    Nous deposons un dossier complet et conforme chez Enedis
                  </h3>
                  <p className="text-base md:text-lg text-gray-500">
                    Constitution et depot de votre dossier.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg">
                    4
                  </div>
                  <div className="w-44 h-44 md:w-52 md:h-52 flex items-center justify-center mb-6">
                    <img 
                      src={step4Illustration}
                      alt="Suivi de dossier jusqu'a la mise en service"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      data-testid="step4-illustration"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    Suivi personnalise jusqu'a la mise en service
                  </h3>
                  <p className="text-base md:text-lg text-gray-500">
                    Accompagnement de A a Z.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid="cta-process-button"
                >
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* BESOIN D'AIDE SECTION - Like Original */}
        <section className="py-16 md:py-20 bg-white" id="besoin-aide" data-animate data-testid="besoin-aide-section">
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
                  Notre equipe d'experts est disponible pour repondre a toutes vos questions
                </p>
                
                {/* Contact Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                  <a 
                    href="tel:0970709570" 
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    09 70 70 95 70
                  </a>
                  <Link href="/contact">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-8 py-4 rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      Envoyer un email
                    </button>
                  </Link>
                </div>
                
                <p className="text-base text-gray-500">
                  Lundi - Vendredi, 8h a 18h
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-16 md:py-20 bg-gray-50" id="testimonials" data-animate data-testid="testimonials-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-6">
                Temoignages de nos clients
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Ils nous ont fait confiance
              </p>
            </div>

            {/* 3 Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Testimonial 1 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "Ils m'ont accompagne du debut a la fin, service rapide et clair."
                </p>
                <p className="text-base font-semibold text-gray-900">Karim, Marseille</p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "Demande faite en quelques minutes, dossier valide rapidement."
                </p>
                <p className="text-base font-semibold text-gray-900">Julie, Lyon</p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "Excellent suivi, tout est gere en ligne sans complication."
                </p>
                <p className="text-base font-semibold text-gray-900">Marc, Paris</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-16 md:py-20 bg-white" id="faq" data-animate data-testid="faq-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-6">
                Questions frequentes
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Retrouvez les reponses aux questions les plus courantes
              </p>
            </div>

            <div className={`space-y-4 transition-all duration-700 ${isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* FAQ Items */}
              {[
                {
                  q: "Quels documents sont necessaires pour une demande de raccordement ?",
                  a: "Les documents requis varient selon le type de raccordement. Generalement, vous aurez besoin d'un justificatif d'identite, d'un plan de situation du terrain, d'un plan de masse, et d'une autorisation d'urbanisme (permis de construire ou declaration prealable)."
                },
                {
                  q: "Quel est le delai moyen de traitement d'un dossier ?",
                  a: "Le delai de traitement depend du type de raccordement. Pour un raccordement provisoire, comptez 2 a 4 semaines. Pour un raccordement definitif, le delai varie de 2 a 6 mois selon la complexite des travaux a realiser."
                },
                {
                  q: "Gerez-vous les demandes de raccordement provisoire pour les chantiers ?",
                  a: "Oui, nous prenons en charge les demandes de raccordement provisoire pour les chantiers de construction. Ce type de raccordement temporaire permet d'alimenter le chantier en electricite pendant la duree des travaux."
                },
                {
                  q: "Votre service inclut-il le depot du dossier aupres d'Enedis ?",
                  a: "Oui, notre service comprend la constitution complete de votre dossier et son depot officiel aupres d'Enedis. Nous verifions que tous les documents sont conformes avant transmission pour eviter tout rejet ou retard."
                },
                {
                  q: "Puis-je suivre l'avancement de ma demande ?",
                  a: "Absolument. Vous recevrez des notifications par email a chaque etape importante de votre dossier. Notre equipe reste disponible pour repondre a vos questions et vous tenir informe de l'avancement."
                },
                {
                  q: "Le paiement en ligne est-il securise ?",
                  a: "Oui, tous les paiements sont traites via Stripe, une plateforme de paiement certifiee PCI DSS niveau 1. Vos donnees bancaires sont chiffrees et ne sont jamais stockees sur nos serveurs."
                }
              ].map((item, index) => (
                <details 
                  key={index}
                  className="bg-white rounded-2xl group border border-gray-100 shadow-sm"
                  data-testid={`faq-item-${index + 1}`}
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-left text-lg md:text-xl font-medium text-gray-900 hover:bg-gray-50 transition-colors rounded-2xl">
                    <span>{item.q}</span>
                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 text-base md:text-lg leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER - Blue Gradient */}
        <section 
          className="py-16 md:py-20"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
          data-testid="cta-banner-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-3xl text-center">
            <h2 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-white mb-6">
              Pret a demarrer votre projet ?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10">
              Rejoignez les centaines de clients satisfaits
            </p>
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <button 
                className="bg-white text-[#3B82F6] font-semibold text-base px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                data-testid="cta-final-button"
              >
                Commencer ma demande
              </button>
            </Link>
          </div>
        </section>

      </main>

      {/* Floating CTA Button */}
      <FloatingCtaButton />
    </>
  );
}
