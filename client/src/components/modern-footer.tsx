import { useState } from "react";
import { Link } from "wouter";
import { Phone, Mail, Clock, ArrowRight, ShieldCheck, Check, Globe, Building, User, MapPin } from "lucide-react";
import { EnedisAuthenticMasterpiece } from '@/components/ui/enedis-authentic-logo';

interface ScrollToTopLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// Composant de lien optimisé avec remontée auto en haut de page
const ScrollToTopLink = ({ href, className, children, onClick }: ScrollToTopLinkProps) => {
  return (
    <Link 
      href={href}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onClick && onClick(e);
      }}
      className={className}
    >
      {children}
    </Link>
  );
};

/**
 * Footer moderne optimisé pour l'UI/UX et les performances
 * - Design compact et professionnel
 * - Optimisé pour le SEO avec mots-clés stratégiques
 * - Chargement rapide et responsive sur tous les appareils
 */
export function ModernFooter() {
  const [year] = useState(new Date().getFullYear());
  
  return (
    <footer className="w-full bg-gradient-to-b from-[#0A3A82] to-[#162042] text-white py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section principale du footer - Design premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Colonne 1: Logo et contact */}
          <div className="text-center md:text-left">
            {/* Logo authentique - Taille augmentée */}
            <div className="mb-6 flex justify-center md:justify-start">
              <div className="transform scale-110">
                <EnedisAuthenticMasterpiece size="lg" variant="dark" />
              </div>
            </div>
            
            {/* Description courte */}
            <p className="text-gray-300 text-sm mb-6 max-w-xs mx-auto md:mx-0">
              Votre partenaire expert pour tous vos projets de raccordement électrique en France.
            </p>
            
            {/* Contact téléphone - Ultra visible */}
            <div className="mb-4">
              <a 
                href="tel:0970709570" 
                className="group inline-flex items-center justify-center md:justify-start bg-[#0072CE] hover:bg-[#005eaa] text-white rounded-lg py-3 px-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-white/20 mr-3 group-hover:bg-white/30 transition-colors">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-blue-100 font-medium">Appelez maintenant</div>
                    <div className="text-lg font-bold">09 70 70 95 70</div>
                  </div>
                </div>
              </a>
            </div>
            

          </div>
          
          {/* Colonne 2: Services spécialisés - Navigation optimisée */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base mb-4">Services spécialisés</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1">
              <ScrollToTopLink 
                href="/raccordement-maison-neuve" 
                className="text-gray-300 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 rounded px-3 py-2 flex items-center justify-center md:justify-start group"
              >
                <ArrowRight className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                Maison neuve
              </ScrollToTopLink>
              <ScrollToTopLink 
                href="/raccordement-definitif" 
                className="text-gray-300 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 rounded px-3 py-2 flex items-center justify-center md:justify-start group"
              >
                <ArrowRight className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                Raccordement définitif
              </ScrollToTopLink>
              <ScrollToTopLink 
                href="/raccordement-provisoire" 
                className="text-gray-300 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 rounded px-3 py-2 flex items-center justify-center md:justify-start group"
              >
                <ArrowRight className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                Raccordement provisoire
              </ScrollToTopLink>
              <ScrollToTopLink 
                href="/viabilisation-terrain" 
                className="text-gray-300 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 rounded px-3 py-2 flex items-center justify-center md:justify-start group"
              >
                <ArrowRight className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                Viabilisation terrain
              </ScrollToTopLink>
              <ScrollToTopLink 
                href="/modification-compteur" 
                className="text-gray-300 hover:text-white text-sm transition-all duration-200 hover:bg-white/10 rounded px-3 py-2 flex items-center justify-center md:justify-start group"
              >
                <ArrowRight className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                Modification compteur
              </ScrollToTopLink>
            </div>
          </div>
          
          {/* Colonne 3: CTA et certifications */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base mb-4">Votre projet</h3>
            
            {/* CTA principal */}
            <div className="mb-6">
              <ScrollToTopLink 
                href="/raccordement-enedis"
                className="inline-flex items-center justify-center w-full md:w-auto bg-gradient-to-r from-[#5BC248] to-[#4a9c3a] hover:from-[#4a9c3a] hover:to-[#3d8230] text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">Démarrer ma demande</span>
                <ArrowRight className="h-4 w-4" />
              </ScrollToTopLink>
            </div>
            
            {/* Labels de confiance */}
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start text-xs">
                <Check className="h-3 w-3 text-[#5BC248] mr-2" />
                <span className="text-gray-300">Service certifié professionnel</span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-xs">
                <ShieldCheck className="h-3 w-3 text-[#5BC248] mr-2" />
                <span className="text-gray-300">Paiement 100% sécurisé</span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-xs">
                <Clock className="h-3 w-3 text-[#5BC248] mr-2" />
                <span className="text-gray-300">Traitement rapide 24-48h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur elegant */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>
        
        {/* Footer bottom - Ligne professionnelle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start text-xs text-gray-400 gap-x-4 gap-y-1">
            <div className="flex items-center">
              <span className="text-[#5BC248] mr-1">©</span> {year} <span className="text-white/80 mx-1">Portail-Electricite.com</span> - Tous droits réservés
              <ScrollToTopLink 
                href="/admin" 
                className="text-gray-400 hover:text-white transition-all duration-300 cursor-pointer ml-1 inline-flex items-center"
                onClick={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  setTimeout(() => {
                    if (e.currentTarget) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }, 150);
                }}
              >
                ®
              </ScrollToTopLink>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <ScrollToTopLink href="/faq" className="hover:text-white transition-colors">FAQ</ScrollToTopLink>
            <ScrollToTopLink href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</ScrollToTopLink>
            <ScrollToTopLink href="/cgu" className="hover:text-white transition-colors">CGU</ScrollToTopLink>
            <ScrollToTopLink href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</ScrollToTopLink>
            <ScrollToTopLink href="/contact" className="hover:text-white transition-colors">Contact</ScrollToTopLink>
          </div>
        </div>
        

      </div>
    </footer>
  );
}