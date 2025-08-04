import React, { ReactNode, useEffect } from "react";
import { Link } from "wouter";

import { Helmet } from "react-helmet";
import { Phone, Mail, Facebook, Instagram, Twitter, ChevronRight, ArrowRight } from "lucide-react";
// Removed PortailRaccordementLogo import - using direct SVG now
import { ModernFooter } from "../modern-footer";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  includeHelmet?: boolean;
  showBankingSecurity?: boolean;
}

export default function MainLayout({ 
  children, 
  title = "Raccordement Enedis | Service de raccordement électrique simplifié",
  description = "Service spécialisé dans le raccordement au réseau électrique Enedis. Accompagnement personnalisé et suivi de dossier pour particuliers et professionnels.",
  includeHelmet = true,
  showBankingSecurity = false
}: MainLayoutProps) {
  // Défilement automatique vers le haut au changement de page
  // Compatible avec tous les navigateurs modernes
  useEffect(() => {
    // Scrolle vers le haut de la page avec une animation fluide
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    
    // Fallback pour les navigateurs anciens
    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  }, [children]);

  return (
    <div className="flex flex-col min-h-screen">
      {includeHelmet && (
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          
          {/* Google Tag Manager */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=GT-MJKTJGCK"></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GT-MJKTJGCK');
            `}
          </script>
          
          <script src="/google-ads-conversion.js"></script>
        </Helmet>
      )}
      
      {/* Header - Professional mobile-first administrative design */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        {/* Mobile Header - Clean and professional */}
        <div className="block md:hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between h-12">
              {/* Mobile Logo - Clean SVG */}
              <a href="/" className="flex items-center flex-shrink-0" aria-label="Retour à l'accueil - Portail Raccordement">
                <img 
                  src="/logo-portail-raccordement.svg" 
                  alt="Portail Raccordement - Raccordement au réseau public d'électricité ENEDIS" 
                  className="h-10 w-auto object-contain"
                />
              </a>
              
              {/* Mobile Action Zone - Clean administrative design */}
              <div className="flex items-center space-x-3">
                {/* Professional Contact Button */}
                <a href="tel:0970709570" 
                   className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center shadow-sm transition-colors duration-200">
                  <Phone className="h-4 w-4 text-white" />
                </a>
                
                {/* Professional CTA Button */}
                <Link href="/raccordement-enedis" 
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2">
                  <span>Demande</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile Professional Sub-header */}
          <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 px-4 py-2">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Service professionnel</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <span>⚡</span>
                <span className="font-medium">Traitement rapide</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Header - Optimisé responsive et performance */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4 lg:px-6 xl:px-8">
            {/* 
              Design header responsive optimisé :
              - Hauteur adaptative selon taille écran
              - Espacement intelligent entre éléments
              - Compatible tous navigateurs modernes
              - Performance maximisée avec flexbox
            */}
            <div className="flex items-center justify-between h-14 md:h-16 lg:h-18 xl:h-20">
              
              {/* Logo Desktop - Clean SVG */}
              <a href="/" className="flex items-center flex-shrink-0 min-w-0 transition-transform duration-200 hover:scale-105" aria-label="Retour à l'accueil - Portail Raccordement">
                <img 
                  src="/logo-portail-raccordement.svg" 
                  alt="Portail Raccordement - Raccordement au réseau public d'électricité ENEDIS" 
                  className="h-12 w-auto object-contain"
                />
              </a>
              
              {/* Navigation Desktop - Espacement responsive */}
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8 flex-1 justify-center max-w-md">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-[#0072CE] transition-colors duration-200 font-medium text-sm lg:text-base whitespace-nowrap"
                >
                  Accueil
                </Link>
                <Link 
                  href="/raccordement-enedis" 
                  className="text-gray-600 hover:text-[#0072CE] transition-colors duration-200 font-medium text-sm lg:text-base whitespace-nowrap"
                >
                  Nos Services
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-[#0072CE] transition-colors duration-200 font-medium text-sm lg:text-base whitespace-nowrap"
                >
                  Contact
                </Link>
              </nav>
              
              {/* CTA Desktop - Responsive et accessible */}
              <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
                {/* Numéro de téléphone - Caché sur petits écrans desktop */}
                <a 
                  href="tel:0970709570" 
                  className="hidden lg:inline-flex text-gray-600 hover:text-[#0072CE] transition-colors duration-200 font-medium text-sm lg:text-base whitespace-nowrap"
                  aria-label="Appeler le 09 70 70 95 70"
                >
                  09 70 70 95 70
                </a>
                
                {/* Bouton principal - Taille adaptative */}
                <Link 
                  href="/raccordement-enedis" 
                  className="bg-[#0072CE] text-white px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 rounded-lg hover:bg-[#005eaa] transition-all duration-200 font-medium text-sm lg:text-base whitespace-nowrap shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                  aria-label="Créer une nouvelle demande de raccordement"
                >
                  <span className="hidden sm:inline">Nouvelle demande</span>
                  <span className="sm:hidden">Demande</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Section de sécurité bancaire - Uniquement sur les pages de paiement */}
      {showBankingSecurity && (
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 border-t border-gray-100">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* 
              Design responsive optimisé pour mobile et desktop
              Compatible avec tous les navigateurs modernes
              Performance optimisée avec commentaires d'intégration
            */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between space-y-4 md:space-y-0 md:space-x-8">
              {/* Icône de sécurité avec animation subtle */}
              <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                <svg 
                  className="w-8 h-8 md:w-10 md:h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>

              {/* Texte de sécurité - Responsive typography */}
              <div className="flex-1 text-center md:text-left">
                <div className="space-y-2">
                  <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Vos informations bancaires sont protégées et ne sont jamais stockées sur nos serveurs.
                    </span>
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    En procédant au paiement, vous acceptez nos{' '}
                    <a 
                      href="/conditions-generales" 
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                      aria-label="Consulter nos conditions générales de service"
                    >
                      conditions générales de service
                    </a>.
                  </p>
                </div>
              </div>

              {/* Badges de confiance - Mobile optimized */}
              <div className="flex items-center space-x-3 md:space-x-4">
                {/* Badge SSL */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-1">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">SSL</span>
                </div>

                {/* Badge Sécurité Bancaire */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-1">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Vérifié</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* Use the deployed ModernFooter component */}
      <ModernFooter />

      {/* Barre de contact flottante - Mobile only */}
      <div className="bg-[#5BC248] py-2 w-full md:hidden">
        <div className="container mx-auto px-3">
          <div className="flex justify-center items-center space-x-2 text-white">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <a href="tel:0970709570" className="font-medium text-sm hover:underline">
              09 70 70 95 70
            </a>
          </div>
        </div>
      </div>


      

    </div>
  );
}

export { MainLayout };