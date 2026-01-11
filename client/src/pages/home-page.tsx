import { Link } from "wouter";
import { ArrowRight, Phone, ChevronRight, Mail, Star, Plus } from "lucide-react";
import { ContactModal } from "@/components/contact-modal";
import { Helmet } from "react-helmet";
import { FloatingContactButton } from "@/components/floating-contact-button";
import heroIllustration from "@assets/hero-illustration_1765320964105.webp";
import raccordementDefinitifIcon from "@assets/Raccordement-Definitif_1765333395814.webp";
import raccordementProvisoireIcon from "@assets/Raccordement-Provisoire_1765333395814.webp";
import raccordementCollectifIcon from "@assets/Raccordement-Collectif_1765333395814.webp";
import augmentationPuissanceIcon from "@assets/augmentation_de_puissance_1765333395814.webp";
import servicesTechniquesIcon from "@assets/services-techniques_1765333395814.webp";
import raccordementEnedisIcon from "@assets/Raccordement-Enedis_1765333395814.webp";

export default function HomePage() {
  
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">Aller au contenu principal</a>
      <Helmet>
        <title>Demande de Raccordement Enedis en Ligne | Raccordement Électrique</title>
        <meta name="description" content="Demande de raccordement Enedis en ligne : formulaire simple, assistance dédiée, réponse rapide. Déposez votre dossier en quelques minutes." />
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

      <main id="main-content" className="overflow-x-hidden">
        {/* HERO SECTION - Premium Design - Fully Responsive */}
        <section 
          className="relative overflow-hidden pt-4 sm:pt-8 md:pt-10 lg:pt-16 pb-4 sm:pb-8 md:pb-10 lg:pb-16 bg-white"
          data-testid="hero-section"
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 max-w-screen-xl">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-8 lg:gap-12 xl:gap-16">
              {/* Left Content */}
              <div className="w-full md:w-1/2 lg:w-1/2 xl:w-[45%] text-center md:text-left">
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
                <p className="text-base sm:text-lg md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-[500px] mx-auto md:mx-0 mb-6 sm:mb-8 md:mb-8">
                  Votre expert raccordement Enedis en ligne.<br className="hidden sm:block" />
                  Déposez votre demande en quelques minutes.
                </p>

                {/* CTA Buttons - Compact, balanced design */}
                <div className="flex flex-row justify-center md:justify-start gap-2 sm:gap-3 mb-4">
                  <Link href="/raccordement-enedis#formulaire-raccordement">
                    <button 
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm px-4 sm:px-5 py-2.5 rounded-md shadow-sm hover:shadow transition-all"
                      data-testid="cta-hero-button"
                    >
                      Démarrer ma demande
                    </button>
                  </Link>
                  <a href="tel:0970709570">
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 sm:px-5 py-2.5 rounded-md transition-all flex items-center gap-1.5"
                      data-testid="contact-hero-button"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      09 70 70 95 70
                    </button>
                  </a>
                </div>

              </div>

              {/* Right Illustration - HIDDEN on mobile for better conversion, visible md+ */}
              <div className="hidden md:flex w-full md:w-1/2 lg:w-1/2 xl:w-[55%] justify-center md:justify-end mt-0">
                <div className="relative w-full max-w-[280px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[550px]">
                  <img 
                    src={heroIllustration} 
                    alt="Famille devant une maison avec panneaux solaires et voiture électrique - Raccordement électrique Enedis"
                    className="w-full h-auto"
                    width="550"
                    height="380"
                    loading="eager"
                    fetchPriority="high"
                    data-testid="hero-illustration"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ENTERPRISE TRUST BAR - Professional trust signals with SVG icons */}
        <section className="py-4 md:py-6 bg-gray-50 border-t border-b border-gray-200" data-testid="trust-bar">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12">
              {[
                { text: "Paiement 100% sécurisé" },
                { text: "Plus de 2000 clients satisfaits" },
                { text: "Réponse sous 48h" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#059669] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-base text-gray-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4-STEP PROCESS SECTION - Ultra Compact Timeline */}
        <section 
          className="py-4 md:py-6 bg-[#F8FAFC]"
          id="process"
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Raccordement en 4 étapes simples
              </h2>
            </div>

            {/* Horizontal Timeline - All screens */}
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 md:gap-2 mb-4">
              {[
                { num: 1, title: "Définir le type", desc: "Cadrez votre demande" },
                { num: 2, title: "Remplir le formulaire", desc: "Renseignez votre projet" },
                { num: 3, title: "Dépôt chez Enedis", desc: "Envoi du dossier complet" },
                { num: 4, title: "Suivi & mise en service", desc: "Accompagnement de A à Z" }
              ].map((step, idx) => (
                <div key={step.num} className="flex-1 flex items-center md:flex-col md:text-center gap-3 md:gap-0 relative">
                  {/* Connector line - Desktop only */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-4 left-[60%] w-[80%] h-0.5 bg-gray-200" />
                  )}
                  {/* Number badge */}
                  <div className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 relative z-10">
                    {step.num}
                  </div>
                  {/* Text */}
                  <div className="md:mt-2">
                    <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-xs text-gray-500 hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1e40af] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                  data-testid="cta-process-button"
                >
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - Centered Card Layout Like Original */}
        <section className="py-6 md:py-10 bg-white" id="types-raccordements" data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-4 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Tous les Types de Raccordement
              </h2>
              <p className="text-base text-gray-600 max-w-xl mx-auto">
                Nous vous accompagnons dans votre demande de raccordement électrique
              </p>
            </div>

            {/* Service Cards - Horizontal on mobile, Grid on desktop */}
            <div>
              
              {/* Mobile: Horizontal compact cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {[
                  { icon: raccordementProvisoireIcon, title: "Raccordement Provisoire", desc: "Chantiers et installations temporaires" },
                  { icon: raccordementDefinitifIcon, title: "Raccordement Définitif", desc: "Maisons neuves et locaux commerciaux" },
                  { icon: augmentationPuissanceIcon, title: "Augmentation de Puissance", desc: "Augmentez votre capacité électrique" },
                  { icon: raccordementCollectifIcon, title: "Raccordement Collectif", desc: "Immeubles et copropriétés" },
                  { icon: servicesTechniquesIcon, title: "Viabilisation Terrain", desc: "Préparation de votre terrain" },
                  { icon: raccordementEnedisIcon, title: "Maison Neuve", desc: "Premier raccordement construction" }
                ].map((service, idx) => (
                  <Link key={idx} href="/raccordement-enedis" className="group">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#2563EB] hover:shadow-sm active:scale-[0.99] transition-all">
                      <div className="w-11 h-11 flex-shrink-0">
                        <img src={service.icon} alt={service.title} className="w-full h-full object-contain" width="44" height="44" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">{service.title}</h3>
                        <p className="text-[13px] text-gray-500 leading-snug">{service.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {[
                  { icon: raccordementProvisoireIcon, title: "Raccordement Provisoire", desc: "Pour chantiers, événements temporaires et installations provisoires" },
                  { icon: raccordementDefinitifIcon, title: "Raccordement Définitif", desc: "Maisons neuves, locaux commerciaux et installations permanentes" },
                  { icon: augmentationPuissanceIcon, title: "Augmentation de Puissance", desc: "Augmentez la capacité de votre raccordement électrique existant" },
                  { icon: raccordementCollectifIcon, title: "Raccordement Collectif", desc: "Immeubles résidentiels, copropriétés et bâtiments multi-logements" },
                  { icon: servicesTechniquesIcon, title: "Viabilisation Terrain", desc: "Préparation électrique de votre terrain à bâtir" },
                  { icon: raccordementEnedisIcon, title: "Maison Neuve", desc: "Premier raccordement pour votre construction neuve" }
                ].map((service, idx) => (
                  <Link key={idx} href="/raccordement-enedis" className="group">
                    <div className="bg-white rounded-lg p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-gray-200 h-full">
                      <div className="w-12 h-12 mx-auto mb-3">
                        <img src={service.icon} alt={service.title} className="w-full h-full object-contain" width="48" height="48" loading="lazy" />
                      </div>
                      <h3 className="text-base font-semibold text-[#0072CE] mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{service.desc}</p>
                      <span className="inline-flex items-center text-[#2563EB] font-medium text-sm">
                        Faire une demande <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ Link */}
            <div className="text-center mt-6">
              <button 
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center text-[#0072CE] font-medium text-base hover:text-[#005eaa] cursor-pointer"
              >
                Consultez notre FAQ <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </section>

        {/* ASSISTANCE SECTION - Professional Contact Options */}
        <section className="py-6 md:py-8 bg-gray-50" id="assistance" data-testid="assistance-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-5 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold text-gray-900 mb-1">
                Besoin d'assistance ?
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Notre équipe est disponible pour vous accompagner
              </p>
            </div>

            {/* 3 Contact Options - Professional Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
              
              {/* Appelez-nous */}
              <a href="tel:0970709570" className="group bg-white rounded-xl p-4 md:p-5 border border-gray-200 hover:border-[#2563EB] hover:shadow-md transition-all flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0" data-testid="assistance-card-call">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-full flex items-center justify-center sm:mx-auto sm:mb-3 flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB]" />
                </div>
                <div className="flex-1 sm:flex-none">
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">Appelez-nous</h3>
                  <p className="text-sm text-[#2563EB] font-medium">09 70 70 95 70</p>
                </div>
              </a>

              {/* Rappel gratuit */}
              <Link href="/contact" className="group bg-white rounded-xl p-4 md:p-5 border border-gray-200 hover:border-[#2563EB] hover:shadow-md transition-all flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0" data-testid="assistance-card-callback">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-full flex items-center justify-center sm:mx-auto sm:mb-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 sm:flex-none">
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">Rappel gratuit</h3>
                  <p className="text-sm text-gray-500">Nous vous rappelons</p>
                </div>
              </Link>

              {/* Formulaire de contact */}
              <Link href="/contact" className="group bg-white rounded-xl p-4 md:p-5 border border-gray-200 hover:border-[#2563EB] hover:shadow-md transition-all flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0" data-testid="assistance-card-form">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-full flex items-center justify-center sm:mx-auto sm:mb-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#EA580C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 sm:flex-none">
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">Formulaire</h3>
                  <p className="text-sm text-gray-500">Écrivez-nous</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* BESOIN D'AIDE SECTION - Like Original */}
        <section className="py-6 md:py-10 bg-white" id="besoin-aide" data-testid="besoin-aide-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            <div className="flex flex-col items-center">
              {/* Content - Centered */}
              <div className="w-full max-w-2xl text-center">
                <h2 className="text-[24px] sm:text-[32px] md:text-[38px] font-bold text-gray-900 mb-4">
                  Besoin d'aide ?
                </h2>
                <p className="text-base md:text-xl text-gray-600 mb-6 max-w-lg mx-auto">
                  Notre équipe d'experts est disponible pour répondre à toutes vos questions
                </p>
                
                {/* Contact Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <a 
                    href="tel:0970709570" 
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base px-6 py-[14px] rounded-md shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center gap-2 min-h-[52px]"
                  >
                    <Phone className="w-[18px] h-[18px]" />
                    09 70 70 95 70
                  </a>
                  <Link href="/contact">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 font-medium text-base px-6 py-[13px] rounded-md border border-gray-300 shadow-sm hover:shadow-md transition-all duration-150 flex items-center gap-2 min-h-[48px]">
                      <Mail className="w-[18px] h-[18px]" />
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
        <section className="py-6 md:py-10 bg-white" id="testimonials" data-testid="testimonials-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-[28px] sm:text-[32px] md:text-[42px] font-bold text-[#0066CC] mb-4">
                Ce que nos clients disent de nous
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Des centaines de particuliers et professionnels nous font confiance pour leurs démarches de raccordement électrique
              </p>
            </div>

            {/* Testimonial Cards Carousel - Infinite scroll */}
            <div className="overflow-hidden">
              <div 
                className="flex gap-6 animate-scroll-testimonials"
                style={{
                  width: 'max-content',
                  animation: 'scrollTestimonials 30s linear infinite'
                }}
              >
                {/* First set of testimonials */}
                {[
                  { initials: 'SB', color: '#3B82F6', name: 'Sophie Bertrand', location: 'Raccordement maison neuve - Bordeaux', text: '"Service impeccable du début à la fin. Mon dossier de raccordement pour ma maison neuve a été traité en 3 semaines. L\'équipe m\'a tenu informé à chaque étape."', date: 'Novembre 2025' },
                  { initials: 'MD', color: '#10B981', name: 'Marc Dupont', location: 'Raccordement provisoire - Lyon', text: '"En tant que chef de chantier, j\'ai besoin de réactivité. La demande de raccordement provisoire a été traitée rapidement et le suivi était parfait."', date: 'Octobre 2025' },
                  { initials: 'CL', color: '#8B5CF6', name: 'Claire Laurent', location: 'Modification compteur - Nantes', text: '"Je ne savais pas par où commencer pour augmenter la puissance de mon compteur. Tout a été pris en charge, je n\'ai eu qu\'à valider. Simple et efficace."', date: 'Décembre 2025' },
                  { initials: 'PG', color: '#F59E0B', name: 'Philippe Garcia', location: 'Viabilisation terrain - Marseille', text: '"Pour la viabilisation de mon terrain, les démarches administratives étaient complexes. Cette équipe a su gérer tout le processus avec Enedis."', date: 'Septembre 2025' },
                  { initials: 'AM', color: '#EC4899', name: 'Amélie Martin', location: 'Raccordement définitif - Paris', text: '"Le formulaire en ligne est très intuitif et l\'équipe répond rapidement aux questions. Mon raccordement définitif a été effectué dans les délais."', date: 'Novembre 2025' },
                  { initials: 'TR', color: '#06B6D4', name: 'Thomas Roux', location: 'Raccordement collectif - Lille', text: '"Pour notre projet de lotissement, nous avions besoin d\'un partenaire fiable. La coordination avec Enedis a été parfaitement gérée."', date: 'Octobre 2025' },
                ].map((testimonial, idx) => (
                  <div key={`first-${idx}`} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm min-w-[320px] max-w-[320px] flex-shrink-0 border-l-4 border-l-[#2563EB]">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-[#2563EB]">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">{testimonial.text}</p>
                    <p className="text-sm text-gray-400 mt-4">{testimonial.date}</p>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[
                  { initials: 'SB', name: 'Sophie Bertrand', location: 'Raccordement maison neuve - Bordeaux', text: '"Service impeccable du début à la fin. Mon dossier de raccordement pour ma maison neuve a été traité en 3 semaines. L\'équipe m\'a tenu informé à chaque étape."', date: 'Novembre 2025' },
                  { initials: 'MD', name: 'Marc Dupont', location: 'Raccordement provisoire - Lyon', text: '"En tant que chef de chantier, j\'ai besoin de réactivité. La demande de raccordement provisoire a été traitée rapidement et le suivi était parfait."', date: 'Octobre 2025' },
                  { initials: 'CL', name: 'Claire Laurent', location: 'Modification compteur - Nantes', text: '"Je ne savais pas par où commencer pour augmenter la puissance de mon compteur. Tout a été pris en charge, je n\'ai eu qu\'à valider. Simple et efficace."', date: 'Décembre 2025' },
                  { initials: 'PG', name: 'Philippe Garcia', location: 'Viabilisation terrain - Marseille', text: '"Pour la viabilisation de mon terrain, les démarches administratives étaient complexes. Cette équipe a su gérer tout le processus avec Enedis."', date: 'Septembre 2025' },
                  { initials: 'AM', name: 'Amélie Martin', location: 'Raccordement définitif - Paris', text: '"Le formulaire en ligne est très intuitif et l\'équipe répond rapidement aux questions. Mon raccordement définitif a été effectué dans les délais."', date: 'Novembre 2025' },
                  { initials: 'TR', name: 'Thomas Roux', location: 'Raccordement collectif - Lille', text: '"Pour notre projet de lotissement, nous avions besoin d\'un partenaire fiable. La coordination avec Enedis a été parfaitement gérée."', date: 'Octobre 2025' },
                ].map((testimonial, idx) => (
                  <div key={`second-${idx}`} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm min-w-[320px] max-w-[320px] flex-shrink-0 border-l-4 border-l-[#2563EB]">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-[#2563EB]">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">{testimonial.text}</p>
                    <p className="text-sm text-gray-400 mt-4">{testimonial.date}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <style>{`
              @keyframes scrollTestimonials {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>

            {/* Trust Indicator */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full">
                <div className="flex -space-x-2">
                  {['SB', 'MD', 'CL', 'PG'].map((initials, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
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
        <section className="py-6 md:py-10 bg-gradient-to-b from-gray-50 to-white" id="faq" data-testid="faq-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-xl">
            {/* Header */}
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-[28px] sm:text-[32px] md:text-[42px] font-bold text-[#0066CC] mb-4 italic">
                Questions fréquemment posées
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Trouvez rapidement les réponses à vos questions sur le raccordement électrique Enedis
              </p>
            </div>

            {/* FAQ Categories Grid - 2 columns for better balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-10 mb-6 md:mb-10">
              
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-center md:text-left">
                <p className="text-sm md:text-base font-semibold text-gray-900">Une question&nbsp;? Nos conseillers vous répondent.</p>
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
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base px-6 py-[14px] rounded-md shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 min-h-[52px]"
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

      {/* Floating Contact Button */}
      <FloatingContactButton />
    </>
  );
}
