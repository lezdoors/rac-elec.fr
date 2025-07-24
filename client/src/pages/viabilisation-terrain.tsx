import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, MapPin, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function ViabilisationTerrainPage() {
  return (
    <>
      <Helmet>
        <title>Viabilisation Terrain | Raccordement Électrique</title>
        <meta name="description" content="Viabilisation de terrain avec raccordement électrique. Service complet pour rendre votre terrain constructible." />
      </Helmet>
      
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Viabilisation Terrain
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Raccordement aux réseaux électriques pour rendre votre terrain constructible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Viabilisation Électrique
                </h2>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    La viabilisation électrique consiste à amener l'électricité jusqu'à votre terrain nu pour le rendre constructible.
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">Services inclus</h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                        Étude de faisabilité
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                        Extension du réseau si nécessaire
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                        Installation du point de livraison
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre viabilisation
                </h2>
                
                <Link href="/raccordement-enedis">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 mb-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Faire ma demande
                  </Button>
                </Link>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-purple-600 hover:text-purple-800">
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