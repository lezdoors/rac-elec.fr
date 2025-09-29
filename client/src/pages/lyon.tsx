import { Helmet } from "react-helmet";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Zap, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";
import { TrustSection } from "@/components/trust-section";

export default function LyonPage() {
  return (
    <>
      <Helmet>
        <title>Demande de Raccordement Enedis Lyon | Raccordement Électrique</title>
        <meta name="description" content="Simplifiez votre demande de raccordement Enedis à Lyon. Provisoire, définitif, collectif ou augmentation de puissance." />
        <link rel="canonical" href="https://portail-electricite.com/lyon" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD with areaServed */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Demande de Raccordement Enedis Lyon",
            "serviceType": "Raccordement Électrique",
            "description": "Service de demande de raccordement électrique Enedis à Lyon. Provisoire, définitif, collectif et augmentation de puissance pour particuliers et professionnels lyonnais.",
            "provider": {
              "@type": "Organization",
              "name": "Portail-Electricite.com",
              "url": "https://portail-electricite.com/"
            },
            "areaServed": {
              "@type": "City",
              "name": "Lyon",
              "@id": "https://www.wikidata.org/wiki/Q456"
            }
          }
        `}</script>
      </Helmet>
      
      <Layout>
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-blue-600 font-semibold text-lg">Lyon</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Demande de raccordement électrique à Lyon
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Résidents et professionnels lyonnais, bénéficiez d'un accompagnement expert pour votre demande de raccordement Enedis. 
                Raccordement provisoire pour vos chantiers, raccordement définitif pour votre nouvelle construction, 
                projet collectif ou augmentation de puissance : nous gérons toutes vos démarches administratives.
              </p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-6 h-6 text-blue-600 mr-2" />
                    Raccordement électrique à Lyon
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Lyon, troisième ville de France et capitale de la région Auvergne-Rhône-Alpes, connaît un développement urbain soutenu. 
                    Les nouveaux quartiers (Confluence, Part-Dieu, Gerland) et les projets de rénovation dans les arrondissements 
                    historiques génèrent de nombreuses demandes de raccordement électrique.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    La métropole lyonnaise présente des particularités : zones urbaines denses nécessitant des raccordements souterrains, 
                    quartiers en transformation avec modernisation du réseau électrique, et zones périurbaines en expansion. 
                    Notre connaissance du territoire lyonnais facilite vos démarches auprès d'Enedis Rhône-Alpes.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos services à Lyon</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement provisoire</strong> pour tous vos chantiers de construction dans la métropole lyonnaise
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement définitif</strong> pour maisons individuelles, appartements et locaux professionnels
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement collectif</strong> pour résidences neuves, copropriétés et opérations immobilières
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Augmentation de puissance</strong> pour installations électriques existantes (véhicules électriques, climatisation)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Spécificités lyonnaises</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  À Lyon, les délais de raccordement varient selon la localisation du projet. Les nouveaux écoquartiers 
                  (Confluence, La Duchère rénovée) disposent d'infrastructures électriques modernes facilitant les raccordements, 
                  tandis que les quartiers anciens (Vieux Lyon, Croix-Rousse) peuvent nécessiter des adaptations techniques spécifiques.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nous coordonnons l'ensemble des intervenants : Enedis, Métropole de Lyon pour les autorisations de voirie, 
                  et collectivités locales. Notre expertise locale garantit un raccordement conforme aux normes en vigueur dans l'agglomération lyonnaise, 
                  avec une attention particulière aux zones classées et au patrimoine UNESCO.
                </p>
              </div>

              <div className="text-center">
                <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg rounded-lg shadow-lg"
                    data-testid="button-cta-lyon"
                  >
                    Commencer ma demande à Lyon
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-600 mt-4">
                  Ou appelez-nous au <a href="tel:0970709570" className="text-blue-600 hover:text-blue-700 font-semibold">09 70 70 95 70</a>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Section */}
        <TrustSection />
      </Layout>
    </>
  );
}
