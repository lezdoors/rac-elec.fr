import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Zap, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";

export default function RaccordementDefinitifPage() {
  return (
    <>
      <Helmet>
        <title>Demande de Raccordement Définitif | Mise en Service</title>
        <meta name="description" content="Raccordement définitif au réseau Enedis. Étapes, pièces requises et accompagnement clé en main." />
        <link rel="canonical" href="https://portail-electricite.com/raccordement-definitif" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Demande de Raccordement Définitif",
            "serviceType": "Raccordement Définitif Enedis",
            "description": "Raccordement électrique permanent pour habitations et locaux professionnels. Accompagnement complet de la demande à la mise en service.",
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
                "name": "Raccordement Définitif",
                "item": "https://portail-electricite.com/raccordement-definitif"
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
                Demande de Raccordement Définitif
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Raccordement permanent au réseau électrique public pour votre logement ou entreprise.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Raccordement Définitif
                </h2>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    Le raccordement définitif vous permet d'être alimenté en électricité de manière permanente par le réseau public Enedis.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Avantages</h3>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Alimentation électrique permanente
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Compteur individuel
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Puissance adaptée à vos besoins
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre raccordement
                </h2>
                
                <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mb-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Faire ma demande
                  </Button>
                </Link>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-green-600 hover:text-green-800">
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