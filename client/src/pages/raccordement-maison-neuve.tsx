import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Home, Zap, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function RaccordementMaisonNeuvePage() {
  return (
    <>
      <Helmet>
        <title>Raccordement Maison Neuve | Enedis - Devis et Procédure</title>
        <meta name="description" content="Raccordement électrique pour maison neuve. Devis gratuit, procédure simplifiée et accompagnement complet pour votre projet de construction." />
      </Helmet>
      
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Raccordement Maison Neuve
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Obtenez votre raccordement électrique Enedis pour votre nouvelle construction. 
                Procédure simple, devis gratuit et accompagnement personnalisé.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Left Column - Information */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Qu'est-ce qu'un raccordement maison neuve ?
                </h2>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    Le raccordement d'une maison neuve consiste à connecter votre nouvelle construction 
                    au réseau électrique public Enedis. Cette étape est indispensable pour alimenter 
                    votre logement en électricité.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Pourquoi choisir nos services ?</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Expertise reconnue par Enedis
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Accompagnement de A à Z
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Délais maîtrisés
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Support technique dédié
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Étapes du processus</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Étude de faisabilité</h4>
                      <p className="text-sm text-gray-600">Analyse de votre projet et du réseau existant</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Devis personnalisé</h4>
                      <p className="text-sm text-gray-600">Proposition détaillée adaptée à vos besoins</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Réalisation des travaux</h4>
                      <p className="text-sm text-gray-600">Intervention de nos équipes qualifiées</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Mise en service</h4>
                      <p className="text-sm text-gray-600">Activation de votre compteur électrique</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - CTA */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre raccordement
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <Zap className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-900">Service professionnel certifié</span>
                    </div>
                    <p className="text-sm text-green-800">
                      Accompagnement complet pour votre projet de raccordement
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">24h</div>
                      <div className="text-sm text-gray-600">Réponse rapide</div>
                    </div>
                  </div>
                </div>

                <Link href="/raccordement-enedis">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Faire ma demande maintenant
                  </Button>
                </Link>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Ou contactez-nous directement :</p>
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

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informations importantes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Documents nécessaires</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Plan de situation du terrain</li>
                    <li>• Plan de masse de la construction</li>
                    <li>• Permis de construire</li>
                    <li>• Fiche d'identité du demandeur</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Délais moyens</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Étude : 10 jours ouvrés</li>
                    <li>• Travaux simples : 2 mois</li>
                    <li>• Travaux complexes : 4-6 mois</li>
                    <li>• Mise en service : 5 jours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}