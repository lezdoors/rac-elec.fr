import { useState } from "react";
import { Link } from "wouter";
import { Phone, Mail, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoElectricIcon } from "@/components/ui/logo-electric-icon";
import { HouseIcon } from "@/components/ui/house-icon";

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

// Composant Footer responsive avec informations de contact et liens
export function ResponsiveFooter() {
  const [year] = useState(new Date().getFullYear());
  
  return (
    <footer className="w-full bg-gradient-to-b from-[#0A3A82] to-[#162042] text-white py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Logo et description - aligné avec le style du hero */}
          <div className="space-y-4">
            {/* Logo en version footer optimisée pour le chargement */}
            <div className="flex items-start">
              <div className="relative flex items-center">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="flex flex-col justify-center">
                    <div className="text-xl font-bold text-white leading-tight tracking-tight">
                      Raccordement-Elec.fr
                    </div>
                    <div className="text-xs text-white/80 tracking-wide">
                      Partenaire n°1 pour vos démarches Enedis
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 max-w-xs mt-1 leading-relaxed">
              Service expert d'accompagnement pour tous types de raccordements électriques auprès d'Enedis pour particuliers et professionnels.
            </p>
            
            {/* Coordonnées de contact - informations essentielles */}
            <div className="mt-6 space-y-3">
              <a href="tel:0970709570" className="flex items-center text-gray-300 hover:text-white transition-colors group">
                <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-[#0072CE]/20 group-hover:bg-[#0072CE]/30 transition-colors">
                  <Phone className="h-4 w-4 text-[#5BC248]" />
                </div>
                <span>09 70 70 95 70</span>
              </a>
              <a href="mailto:contact@raccordement-elec.fr" className="flex items-center text-gray-300 hover:text-white transition-colors group">
                <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-[#0072CE]/20 group-hover:bg-[#0072CE]/30 transition-colors">
                  <Mail className="h-4 w-4 text-[#5BC248]" />
                </div>
                <span>contact@raccordement-elec.fr</span>
              </a>
            </div>
          </div>
          
          {/* Liens rapides avec mots-clés prioritaires */}
          <div>
            <h3 className="text-white font-medium text-base mb-3">Raccordement Électrique</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis#top" 
                  className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                >
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  Raccordement Enedis en ligne
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis#top" 
                  className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                >
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  Branchement Enedis maison neuve
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis#top" 
                  className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                >
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  Demande raccordement électrique rapide
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis#top" 
                  className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                >
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  Estimation coût raccordement
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/faq" 
                  className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                >
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  FAQ Raccordement Enedis
                </ScrollToTopLink>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-medium text-base mb-3">Services Raccordement</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis#top" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Raccordement électrique particulier
                  </ScrollToTopLink>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis#top" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Raccordement électrique professionnel
                  </ScrollToTopLink>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis#top" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Branchement compteur Linky
                  </ScrollToTopLink>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis#top" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Déplacement compteur électrique
                  </ScrollToTopLink>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-panneau-solaire" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Raccordement photovoltaïques
                  </ScrollToTopLink>
                </li>
              </ul>
            </div>
            
            {/* Contact et Services Spéciaux */}
            <div>
              <h3 className="text-white font-medium text-base mb-3">Services Spécialisés</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Raccordement provisoire chantier
                  </ScrollToTopLink>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Modification branchement électrique
                  </ScrollToTopLink>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/raccordement-enedis" 
                    className="text-gray-300 hover:text-white text-sm relative group transition-colors"
                  >
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    Raccordement photovoltaïque
                  </ScrollToTopLink>
                </li>
                <li className="flex items-center">
                  <Phone size={14} className="text-gray-300 mr-2" />
                  <a href="tel:0970709570" className="text-gray-300 hover:text-white">09 70 70 95 70</a>
                </li>
                <li>
                  <ScrollToTopLink 
                    href="/contact" 
                    className="text-gray-300 hover:text-white text-sm transition-colors flex items-center"
                  >
                    <Mail size={14} className="text-gray-300 mr-2" />
                    Demande d'accompagnement
                  </ScrollToTopLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Section de services spéciaux et géolocalisés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-blue-900/40">
          {/* Services émergents */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3">Solutions Spécifiques</h3>
            <ul className="grid grid-cols-1 gap-2 text-xs">
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique bornes de recharge
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique autoconsommation
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique pompe à chaleur
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Modification puissance raccordement électrique
                </ScrollToTopLink>
              </li>
            </ul>
          </div>
          
          {/* Services régionalisés */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3">Services Par Région</h3>
            <ul className="grid grid-cols-1 gap-2 text-xs">
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique Paris
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement Enedis Marseille
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique Lyon
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique terrain agricole
                </ScrollToTopLink>
              </li>
            </ul>
          </div>
          
          {/* Services spéciaux */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3">Services Professionnels</h3>
            <ul className="grid grid-cols-1 gap-2 text-xs">
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique bâtiment professionnel
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement électrique zones isolées
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Délais raccordement électrique 2025
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink 
                  href="/raccordement-enedis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Raccordement photovoltaïque Enedis
                </ScrollToTopLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Mentions de copyright */}
        <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-blue-900/40 text-xs text-gray-400">
          <div className="flex items-center">
            <span className="text-blue-300 font-medium mr-1">©</span> {year} <span className="text-blue-200 font-medium mx-1">Portail Enedis</span> Tous droits réservés.
          </div>
          <div className="flex space-x-4">
            <ScrollToTopLink href="/mentions-legales" className="hover:text-white">Mentions légales</ScrollToTopLink>
            <span>|</span>
            <ScrollToTopLink href="/confidentialite" className="hover:text-white">Confidentialité</ScrollToTopLink>
            <span>|</span>
            <ScrollToTopLink href="/cgu" className="hover:text-white">CGU</ScrollToTopLink>
            <span>|</span>
            <ScrollToTopLink href="/cookies" className="hover:text-white">Cookies</ScrollToTopLink>
            <span>|</span>
            <ScrollToTopLink href="/admin" className="hover:text-white">Se connecter</ScrollToTopLink>
          </div>
        </div>
      </div>
    </footer>
  );
}