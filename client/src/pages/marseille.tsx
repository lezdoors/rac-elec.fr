import { Helmet } from "react-helmet";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Zap, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";
import { TrustSection } from "@/components/trust-section";

export default function MarseillePage() {
  return (
    <>
      <Helmet>
        <title>Demande de Raccordement Enedis Marseille | Raccordement Électrique</title>
        <meta name="description" content="Simplifiez votre demande de raccordement Enedis à Marseille. Provisoire, définitif, collectif ou augmentation de puissance." />
        <link rel="canonical" href="https://www.raccordement-connect.com/marseille" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD with areaServed */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Demande de Raccordement Enedis Marseille",
            "serviceType": "Raccordement Électrique",
            "description": "Service de demande de raccordement électrique Enedis à Marseille. Provisoire, définitif, collectif et augmentation de puissance pour particuliers et professionnels marseillais.",
            "provider": {
              "@type": "Organization",
              "name": "Raccordement-Connect.com",
              "url": "https://www.raccordement-connect.com/"
            },
            "areaServed": {
              "@type": "City",
              "name": "Marseille",
              "@id": "https://www.wikidata.org/wiki/Q23482"
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
                <span className="text-blue-600 font-semibold text-lg">Marseille</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Demande de raccordement électrique à Marseille
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Habitants et entreprises marseillaises, facilitez votre demande de raccordement Enedis avec notre accompagnement personnalisé. 
                Que vous ayez besoin d'un raccordement provisoire pour un chantier, d'un raccordement définitif pour votre logement neuf, 
                d'un projet collectif ou d'une augmentation de puissance, nous simplifions vos démarches.
              </p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-6 h-6 text-blue-600 mr-2" />
                    Raccordement électrique à Marseille
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Marseille, deuxième ville de France et capitale provençale, connaît un fort développement immobilier. 
                    Les projets de rénovation urbaine (Euroméditerranée, Castellane), les nouvelles constructions dans les quartiers Nord, 
                    et la revitalisation du centre-ville génèrent une demande importante en raccordements électriques.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    La diversité du territoire marseillais impose des solutions adaptées : zones urbaines denses, quartiers pavillonnaires, 
                    zones en développement, et secteurs littoraux avec leurs contraintes spécifiques. 
                    Notre expérience marseillaise garantit un traitement efficace de votre dossier auprès d'Enedis Provence-Alpes-Côte d'Azur.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos services à Marseille</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement provisoire</strong> pour vos chantiers de construction dans tous les arrondissements marseillais
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement définitif</strong> pour habitations neuves, appartements et locaux commerciaux
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement collectif</strong> pour programmes immobiliers, copropriétés et ensembles résidentiels
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Augmentation de puissance</strong> pour moderniser votre installation électrique (borne de recharge, piscine)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Spécificités marseillaises</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  À Marseille, les délais et modalités de raccordement dépendent fortement de la localisation du projet. 
                  Les zones en pleine mutation (Euroméditerranée, Smartseille) bénéficient d'infrastructures électriques récentes et performantes, 
                  tandis que les quartiers anciens (Panier, Endoume) peuvent nécessiter des études techniques approfondies et des adaptations du réseau existant.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nous gérons l'intégralité des démarches administratives : coordination avec Enedis, obtention des autorisations 
                  de la Métropole Aix-Marseille-Provence, respect des contraintes architecturales dans les zones protégées. 
                  Notre expertise locale assure un raccordement conforme et dans les meilleurs délais pour votre projet marseillais.
                </p>
              </div>

              <div className="text-center">
                <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg rounded-lg shadow-lg"
                    data-testid="button-cta-marseille"
                  >
                    Commencer ma demande à Marseille
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
