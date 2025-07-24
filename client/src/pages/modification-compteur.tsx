import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Gauge, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function ModificationCompteurPage() {
  return (
    <>
      <Helmet>
        <title>Modification Compteur Électrique | Changement Puissance</title>
        <meta name="description" content="Modification de compteur électrique et changement de puissance. Service Enedis pour adapter votre installation." />
      </Helmet>
      
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Modification Compteur Électrique
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Changement de puissance, remplacement ou mise à niveau de votre compteur électrique.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Modification de Compteur
                </h2>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    Adaptez votre installation électrique à vos nouveaux besoins avec une modification de compteur ou de puissance.
                  </p>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-semibold text-indigo-900 mb-2">Types de modifications</h3>
                    <ul className="space-y-2 text-sm text-indigo-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Changement de puissance
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Passage au compteur Linky
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Remplacement de compteur défaillant
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre modification de compteur
                </h2>
                
                <Link href="/raccordement-enedis">
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