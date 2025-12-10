import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield, Phone, CheckCircle, MapPin, Rocket, Check, Lock } from "lucide-react";
import { Helmet } from "react-helmet";
import { TrustSection } from "@/components/trust-section";
import { FloatingCtaButton } from "@/components/floating-cta-button";
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
        {/* HERO SECTION - Clean White Design (No Animations) */}
        <section 
          className="relative py-12 md:py-16 lg:py-20 bg-white"
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
                      className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-base px-6 py-3 rounded-lg transition-colors duration-200"
                      data-testid="cta-hero-button"
                    >
                      Démarrer ma demande
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button 
                      className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-6 py-3 rounded-lg border border-gray-300 transition-colors duration-200 flex items-center gap-2"
                      data-testid="contact-hero-button"
                    >
                      <Phone className="w-4 h-4" />
                      Nous contacter
                    </button>
                  </Link>
                </div>

                {/* Trust Badges - Static */}
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
                    width="600"
                    height="450"
                    loading="eager"
                    fetchPriority="high"
                    data-testid="hero-illustration"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION - "Comment Faire sa Demande" */}
        <section 
          className="py-16 md:py-20 bg-[#F8F9FB]"
          id="process"
          data-testid="process-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                Processus simplifié
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Comment Faire sa Demande de Raccordement Électrique en Ligne ?
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Suivez notre processus en 4 étapes simples pour votre raccordement Enedis
              </p>
            </div>

            {/* Steps Timeline - 4 columns on desktop, vertical on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-10">
              {/* Step 1 */}
              <div className="relative bg-white rounded-xl p-6 border border-gray-200" data-testid="step-1">
                {/* Number Circle */}
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                {/* Illustration */}
                <div className="w-full h-32 flex items-center justify-center mb-4">
                  <img 
                    src="/assets/definir-type.webp" 
                    alt="Personne remplissant un formulaire sur ordinateur" 
                    className="max-w-[160px] max-h-[120px] object-contain"
                    loading="lazy"
                    width="160"
                    height="120"
                  />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Complétez le formulaire en ligne</h3>
                <p className="text-sm text-gray-600 mb-3">Renseignez les informations de votre projet : adresse, type de raccordement, puissance souhaitée. Le formulaire prend 5 minutes.</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">5 min</span>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white rounded-xl p-6 border border-gray-200" data-testid="step-2">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <div className="w-full h-32 flex items-center justify-center mb-4">
                  <img 
                    src="/assets/completer-formulaire.webp" 
                    alt="Équipe travaillant sur un formulaire" 
                    className="max-w-[160px] max-h-[120px] object-contain"
                    loading="lazy"
                    width="160"
                    height="120"
                  />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Joignez vos documents</h3>
                <p className="text-sm text-gray-600 mb-3">Téléchargez les pièces justificatives : titre de propriété, plan de situation, autorisation d'urbanisme si nécessaire.</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Immédiat</span>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white rounded-xl p-6 border border-gray-200" data-testid="step-3">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <div className="w-full h-32 flex items-center justify-center mb-4">
                  <img 
                    src="/assets/depot-dossier.webp" 
                    alt="Dépôt de dossier auprès d'Enedis" 
                    className="max-w-[160px] max-h-[120px] object-contain"
                    loading="lazy"
                    width="160"
                    height="120"
                  />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Recevez votre devis personnalisé</h3>
                <p className="text-sm text-gray-600 mb-3">Notre équipe analyse votre demande et vous transmet un devis détaillé sous 48 heures ouvrées.</p>
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">48h</span>
              </div>

              {/* Step 4 */}
              <div className="relative bg-white rounded-xl p-6 border border-gray-200" data-testid="step-4">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  4
                </div>
                <div className="w-full h-32 flex items-center justify-center mb-4">
                  <img 
                    src="/assets/suivi-dossier.webp" 
                    alt="Suivi du dossier en ligne" 
                    className="max-w-[160px] max-h-[120px] object-contain"
                    loading="lazy"
                    width="160"
                    height="120"
                  />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Suivi et réalisation</h3>
                <p className="text-sm text-gray-600 mb-3">Après validation, votre dossier est transmis à Enedis. Suivez l'avancement en temps réel depuis votre espace client.</p>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">2-6 semaines</span>
              </div>
            </div>

            {/* Connecting Line - Desktop only */}
            <div className="hidden lg:block relative -mt-[270px] mb-[220px] mx-auto max-w-4xl px-16">
              <div className="border-t-2 border-dashed border-gray-300"></div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <button 
                  className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-base px-9 py-4 rounded-lg transition-colors duration-200"
                  data-testid="cta-process-button"
                >
                  Démarrer ma demande maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICE TYPES SECTION - 6 Detailed Cards */}
        <section className="py-16 md:py-20 bg-white" id="types-raccordements" data-testid="service-types-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Types de Raccordement Électrique
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Choisissez le raccordement adapté à votre situation
              </p>
              
              {/* Help section */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <span className="text-gray-500">Besoin d'aide pour choisir ?</span>
                <a href="tel:0970709570" className="flex items-center hover:text-[#0066CC] transition-colors">
                  <Phone className="w-4 h-4 mr-2 text-[#0066CC]" />
                  09 70 70 95 70
                </a>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#0066CC]" />
                  Lundi-Vendredi 9h-18h
                </div>
              </div>
            </div>

            {/* Service Grid - 3x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Raccordement Définitif */}
              <Link href="/raccordement-definitif" className="group">
                <div className="relative bg-white border border-gray-200 rounded-xl p-7 hover:border-[#0066CC] transition-colors duration-200" data-testid="card-definitif">
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">DEF</span>
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img src={raccordementDefinitifIcon} alt="Raccordement Définitif" className="w-16 h-16 object-contain" loading="lazy" width="64" height="64" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Définitif</h3>
                  <p className="text-gray-600 text-sm mb-4">Pour maisons individuelles, appartements et locaux professionnels. Solution permanente pour une installation électrique complète.</p>
                  <span className="inline-flex items-center text-[#0066CC] font-medium text-sm hover:underline">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Provisoire */}
              <Link href="/raccordement-provisoire" className="group">
                <div className="relative bg-white border border-gray-200 rounded-xl p-7 hover:border-[#0066CC] transition-colors duration-200" data-testid="card-provisoire">
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">PROV</span>
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img src={raccordementProvisoireIcon} alt="Raccordement Provisoire" className="w-16 h-16 object-contain" loading="lazy" width="64" height="64" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Provisoire</h3>
                  <p className="text-gray-600 text-sm mb-4">Solution temporaire pour chantiers, installations éphémères et événements. Durée limitée avec conditions spécifiques.</p>
                  <span className="inline-flex items-center text-[#0066CC] font-medium text-sm hover:underline">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>

              {/* Viabilisation */}
              <Link href="/viabilisation-terrain" className="group">
                <div className="relative bg-white border border-gray-200 rounded-xl p-7 hover:border-[#0066CC] transition-colors duration-200" data-testid="card-viabilisation">
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">VIA</span>
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <MapPin className="w-12 h-12 text-[#0066CC]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Viabilisation Terrain</h3>
                  <p className="text-gray-600 text-sm mb-4">Préparation et équipement électrique de votre terrain constructible. Extension du réseau Enedis jusqu'à votre parcelle.</p>
                  <span className="inline-flex items-center text-[#0066CC] font-medium text-sm hover:underline">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>

              {/* Modification Puissance */}
              <Link href="/modification-compteur" className="group">
                <div className="relative bg-white border border-gray-200 rounded-xl p-7 hover:border-[#0066CC] transition-colors duration-200" data-testid="card-modification">
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">MODIF</span>
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img src={augmentationPuissanceIcon} alt="Modification Puissance" className="w-16 h-16 object-contain" loading="lazy" width="64" height="64" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Modification de Puissance</h3>
                  <p className="text-gray-600 text-sm mb-4">Augmentation ou modification de la puissance de votre compteur existant. Adaptation à vos nouveaux besoins énergétiques.</p>
                  <span className="inline-flex items-center text-[#0066CC] font-medium text-sm hover:underline">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>

              {/* Raccordement Collectif */}
              <Link href="/raccordement-collectif" className="group">
                <div className="relative bg-white border border-gray-200 rounded-xl p-7 hover:border-[#0066CC] transition-colors duration-200" data-testid="card-collectif">
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">COLL</span>
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img src={raccordementCollectifIcon} alt="Raccordement Collectif" className="w-16 h-16 object-contain" loading="lazy" width="64" height="64" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Collectif</h3>
                  <p className="text-gray-600 text-sm mb-4">Solutions pour immeubles, résidences, copropriétés et lotissements. Gestion de projets multi-logements.</p>
                  <span className="inline-flex items-center text-[#0066CC] font-medium text-sm hover:underline">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>

              {/* Maison Neuve - with Popular badge */}
              <Link href="/raccordement-maison-neuve" className="group">
                <div className="relative bg-white border border-gray-200 rounded-xl p-7 hover:border-[#0066CC] transition-colors duration-200" data-testid="card-maison-neuve">
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">NEUF</span>
                  <span className="absolute top-4 left-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Populaire</span>
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img src={raccordementEnedisIcon} alt="Maison Neuve" className="w-16 h-16 object-contain" loading="lazy" width="64" height="64" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Maison Neuve</h3>
                  <p className="text-gray-600 text-sm mb-4">Premier raccordement pour construction neuve. De la demande initiale jusqu'à la mise en service de votre compteur Linky.</p>
                  <span className="inline-flex items-center text-[#0066CC] font-medium text-sm hover:underline">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST SECTION - Simple White Background */}
        <section className="py-16 md:py-20 bg-white" id="trust" data-testid="trust-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi Choisir Notre Service ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 text-center" data-testid="trust-pillar-1">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-16 h-16 text-blue-500" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">+1200</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">demandes traitées</div>
                <p className="text-gray-600 text-sm">Des centaines de clients satisfaits nous font confiance pour leurs projets de raccordement électrique.</p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 text-center" data-testid="trust-pillar-2">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-16 h-16 text-green-500" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">Procédure conforme</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">Normes Enedis</div>
                <p className="text-gray-600 text-sm">Notre processus respecte scrupuleusement les normes et exigences officielles imposées par Enedis.</p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 text-center" data-testid="trust-pillar-3">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-16 h-16 text-orange-500" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">Paiement sécurisé</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">100% protégé</div>
                <p className="text-gray-600 text-sm">Transactions protégées par Stripe. Accompagnement personnalisé à chaque étape de votre projet.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER - Solid Blue */}
        <section 
          className="py-16 md:py-20 bg-[#0066CC]"
          data-testid="cta-banner-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl text-center">
            {/* Icon */}
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-7 h-7 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Prêt à Démarrer Votre Projet ?
            </h2>

            {/* Subtext */}
            <p className="text-lg text-white/90 mb-8">
              Rejoignez les centaines de clients qui nous ont fait confiance
            </p>

            {/* CTA Button */}
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <button 
                className="bg-white text-[#0066CC] font-semibold text-lg px-10 py-5 rounded-lg hover:bg-gray-100 transition-colors duration-200 mb-4"
                data-testid="cta-final-button"
              >
                Commencer ma demande
              </button>
            </Link>

            {/* Secondary text */}
            <p className="text-white/80 text-sm">
              Devis gratuit - Sans engagement - Réponse sous 48h
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
