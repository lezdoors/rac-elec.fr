import { Helmet } from "react-helmet";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Zap, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";
import { TrustSection } from "@/components/trust-section";

export default function ParisPage() {
  return (
    <>
      <Helmet>
        <title>Demande de Raccordement Enedis Paris | Raccordement Électrique</title>
        <meta name="description" content="Simplifiez votre demande de raccordement Enedis à Paris. Provisoire, définitif, collectif ou augmentation de puissance." />
        <link rel="canonical" href="https://portail-electricite.com/paris" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD with areaServed */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Demande de Raccordement Enedis Paris",
            "serviceType": "Raccordement Électrique",
            "description": "Service de demande de raccordement électrique Enedis à Paris. Provisoire, définitif, collectif et augmentation de puissance pour particuliers et professionnels parisiens.",
            "provider": {
              "@type": "Organization",
              "name": "Portail-Electricite.com",
              "url": "https://portail-electricite.com/"
            },
            "areaServed": {
              "@type": "City",
              "name": "Paris",
              "@id": "https://www.wikidata.org/wiki/Q90"
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
                <span className="text-blue-600 font-semibold text-lg">Paris</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Demande de raccordement électrique à Paris
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Habitants et professionnels parisiens, simplifiez votre demande de raccordement Enedis. 
                Que ce soit pour un raccordement provisoire sur un chantier, un raccordement définitif pour votre nouvelle habitation, 
                un projet collectif en copropriété ou une augmentation de puissance, nous vous accompagnons dans toutes vos démarches.
              </p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-6 h-6 text-blue-600 mr-2" />
                    Raccordement électrique à Paris
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Paris, capitale et plus grande ville de France, connaît une forte dynamique de construction et de rénovation. 
                    Les demandes de raccordement électrique y sont nombreuses, que ce soit pour des constructions neuves dans les nouveaux quartiers 
                    (Batignolles, Clichy-Batignolles), des rénovations dans les arrondissements historiques, ou des projets professionnels.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    La densité urbaine de Paris impose des contraintes spécifiques : raccordements souterrains obligatoires, 
                    coordination avec la Ville de Paris pour les travaux sur la voie publique, et respect des règlements 
                    d'urbanisme stricts. Notre expertise locale nous permet de naviguer efficacement dans ces démarches administratives complexes.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos services à Paris</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement provisoire</strong> pour vos chantiers de construction et rénovation dans tous les arrondissements parisiens
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement définitif</strong> pour appartements, maisons individuelles et locaux commerciaux neufs
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Raccordement collectif</strong> pour copropriétés, immeubles neufs et lotissements urbains
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Augmentation de puissance</strong> pour adapter votre installation aux nouveaux équipements (borne électrique, climatisation)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Spécificités parisiennes</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  À Paris, les délais de raccordement peuvent varier selon l'arrondissement et la disponibilité du réseau électrique local. 
                  Les zones en pleine transformation urbaine (13e, 17e, 19e arrondissements) bénéficient souvent d'infrastructures modernes, 
                  tandis que le centre historique (1er au 6e) peut nécessiter des études plus approfondies du fait des contraintes patrimoniales.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nous gérons pour vous les autorisations de voirie parisiennes, les coordinations avec Enedis Île-de-France, 
                  et l'ensemble des démarches administratives pour un raccordement conforme aux normes en vigueur dans la capitale.
                </p>
              </div>

              <div className="text-center">
                <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg rounded-lg shadow-lg"
                    data-testid="button-cta-paris"
                  >
                    Commencer ma demande à Paris
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
