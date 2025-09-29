import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Gauge, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";

export default function ModificationCompteurPage() {
  return (
    <>
      <Helmet>
        <title>Augmentation de Puissance Compteur Enedis | Mono & Triphasé</title>
        <meta name="description" content="Passez à la puissance adaptée (mono/triphasé). Étude, dossier et suivi jusqu'à modification du contrat." />
        <link rel="canonical" href="https://portail-electricite.com/modification-compteur" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Augmentation de Puissance Compteur Enedis",
            "serviceType": "Augmentation de Puissance Électrique",
            "description": "Service d'augmentation de puissance électrique (mono/triphasé). Étude technique, dossier et accompagnement jusqu'à modification du contrat Enedis.",
            "provider": {
              "@type": "Organization",
              "name": "Portail-Electricite.com",
              "url": "https://portail-electricite.com/"
            },
            "areaServed": {
              "@type": "Country",
              "name": "France"
            }
          }
        `}</script>
        
        {/* BreadcrumbList JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": "https://portail-electricite.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Augmentation de Puissance",
                "item": "https://portail-electricite.com/modification-compteur"
              }
            ]
          }
        `}</script>
      </Helmet>
      
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Augmentation de Puissance Compteur
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Augmentez la puissance de votre installation électrique (mono/triphasé) pour répondre à vos besoins.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Augmentation de Puissance
                </h2>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    Adaptez votre installation électrique à vos nouveaux besoins avec une modification de compteur ou de puissance.
                  </p>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-semibold text-indigo-900 mb-2">Services inclus</h3>
                    <ul className="space-y-2 text-sm text-indigo-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Étude de faisabilité technique
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Passage monophasé/triphasé
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Suivi jusqu'à modification contrat
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre augmentation de puissance
                </h2>
                
                <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 mb-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Faire ma demande
                  </Button>
                </Link>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-indigo-600 hover:text-indigo-800">
                      <Phone className="h-4 w-4 mr-1" />
                      <span className="font-medium">09 70 70 95 70</span>
                    </a>
                    <Link href="/contact" className="flex items-center text-blue-600 hover:text-blue-800">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="font-medium">Contact</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}