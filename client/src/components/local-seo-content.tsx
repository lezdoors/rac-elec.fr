import React from 'react';
import { MapPin, Phone, Clock, CheckCircle } from 'lucide-react';

interface LocalSeoContentProps {
  city?: string;
  department?: string;
  region?: string;
}

/**
 * Composant SEO local pour optimiser le référencement géographique
 * Intègre dynamiquement les noms de villes dans les mots-clés
 */
export function LocalSeoContent({ 
  city = "votre ville", 
  department = "votre département", 
  region = "votre région" 
}: LocalSeoContentProps) {
  
  const majorCities = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", 
    "Montpellier", "Strasbourg", "Bordeaux", "Lille", "Rennes", 
    "Reims", "Saint-Étienne", "Toulon", "Le Havre", "Grenoble"
  ];

  return (
    <section className="py-12 bg-white" id="seo-local">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Titre local optimisé */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Raccordement Électrique <span className="text-[#0072CE]">{city}</span>
            </h2>
            <p className="text-lg text-gray-600">
              <strong>Service Enedis {city}</strong> - Demande de <strong>branchement Enedis {department}</strong> en ligne
            </p>
          </div>

          {/* Services locaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#0072CE]" />
                Raccordement Électrique {city}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Notre <strong>service raccordement Enedis {city}</strong> vous accompagne pour votre 
                <strong>demande Enedis {city}</strong>. Intervention locale rapide dans {region}.
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-[#5BC248]" />
                  <span>Couverture {department} complète</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-[#0072CE]" />
                  <span>Intervention sous 48h {city}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-[#0072CE]" />
                Contact Local {region}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Équipe locale spécialisée en <strong>branchement Enedis {department}</strong>. 
                Connaissance parfaite des spécificités techniques de {region}.
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-[#5BC248]" />
                  <span>Expert local {city}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#0072CE]" />
                  <span>Support téléphonique dédié</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section villes principales */}
          <div className="bg-blue-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Service <span className="text-[#0072CE]">Raccordement Enedis</span> France Entière
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
              {majorCities.map((cityName, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm font-medium text-gray-800">{cityName}</div>
                  <div className="text-xs text-gray-500 mt-1">Service actif</div>
                </div>
              ))}
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-6">
              <strong>Raccordement électrique</strong> disponible dans plus de 500 villes françaises. 
              Votre <strong>demande de raccordement électrique</strong> traitée par nos experts locaux.
            </p>
          </div>

          {/* Données structurées pour SEO local */}
          <div className="hidden" itemScope itemType="https://schema.org/LocalBusiness">
            <meta itemProp="name" content={`Service raccordement électrique ${city}`} />
            <meta itemProp="description" content={`Raccordement Enedis ${city} - Service local de branchement électrique ${department}`} />
            <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <meta itemProp="addressLocality" content={city} />
              <meta itemProp="addressRegion" content={region} />
              <meta itemProp="addressCountry" content="FR" />
            </div>
            <meta itemProp="telephone" content="09 70 70 95 70" />
            <meta itemProp="url" content="https://www.demande-raccordement.fr" />
          </div>
        </div>
      </div>
    </section>
  );
}