/**
 * Section d'informations de sécurité bancaire
 * 
 * Composant responsive et optimisé pour les performances affichant :
 * - Informations de protection des données bancaires
 * - Acceptation des conditions générales
 * - Compatible avec tous les navigateurs modernes
 * - Design mobile-first avec optimisations pour tablettes et desktop
 */

import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function BankingSecuritySection() {
  return (
    <section 
      className="bg-white border-t border-gray-100"
      role="region"
      aria-label="Informations de sécurité et conditions"
    >
      {/* Container principal responsive avec design épuré */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        
        {/* Section sécurité compacte et moderne */}
        <div className="text-center space-y-4 mb-6">
          {/* Titre principal simplifié */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-green-600" aria-hidden="true" />
            <h2 className="text-lg md:text-xl font-medium text-gray-900">
              Paiement 100% sécurisé
            </h2>
          </div>
          
          {/* Message de sécurité concis */}
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Vos données bancaires sont <strong className="text-gray-900">chiffrées et protégées</strong> par nos partenaires certifiés.
            Aucune information n'est conservée sur nos serveurs.
          </p>
        </div>

        {/* Badges de sécurité en ligne horizontale */}
        <div className="flex items-center justify-center flex-wrap gap-4 md:gap-6 mb-6">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-full">
            <Lock className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="text-xs md:text-sm font-medium text-gray-700">SSL 256-bit</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-full">
            <Shield className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="text-xs md:text-sm font-medium text-gray-700">PCI DSS</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="text-xs md:text-sm font-medium text-gray-700">RGPD</span>
          </div>
        </div>

        {/* Section conditions intégrée et minimale */}
        <div className="text-center border-t border-gray-100 pt-4">
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
            En procédant au paiement, vous acceptez nos{' '}
            <a 
              href="/cgu" 
              className="text-blue-600 hover:text-blue-700 underline decoration-blue-300 hover:decoration-blue-500 transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir les conditions générales de service dans un nouvel onglet"
            >
              conditions générales de service
            </a>
            {' '}et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </section>
  );
}