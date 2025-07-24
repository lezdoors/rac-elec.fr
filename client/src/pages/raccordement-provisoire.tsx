import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Construction, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function RaccordementProvisoirePage() {
  return (
    <>
      <Helmet>
        <title>Raccordement Provisoire Chantier | Enedis</title>
        <meta name="description" content="Raccordement électrique provisoire pour chantier. Solution temporaire rapide et efficace pour vos travaux de construction." />
      </Helmet>
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Raccordement Provisoire</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Alimentation électrique temporaire pour vos chantiers et travaux de construction.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Raccordement Provisoire
                </h2>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    Solution temporaire pour alimenter vos chantiers en électricité pendant la phase de construction.
                  </p>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-900 mb-2">Caractéristiques</h3>
                    <ul className="space-y-2 text-sm text-orange-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                        Installation rapide
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                        Durée limitée (jusqu'à 12 mois)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                        Puissance adaptée aux besoins du chantier
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre raccordement provisoire
                </h2>
                
                <Link href="/raccordement-enedis">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 mb-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Faire ma demande
                  </Button>
                </Link>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-orange-600 hover:text-orange-800">
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