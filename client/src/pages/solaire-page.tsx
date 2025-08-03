import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { Sun, Zap, CheckCircle, ArrowRight, Calculator, Shield, Clock, Users } from "lucide-react";

export default function SolairePage() {
  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Raccordement photovoltaïques" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Helmet>
        <title>Raccordement Photovoltaïques Enedis | Installation Panneaux Solaires</title>
        <meta name="description" content="Raccordement de vos installations photovoltaïques au réseau Enedis. Panneaux solaires, autoconsommation et revente d'électricité. Démarches simplifiées." />
        <meta name="keywords" content="raccordement photovoltaïques, installation photovoltaïque, Enedis solaire, panneaux solaires, autoconsommation électrique" />
        <link rel="canonical" href="https://portail-electricite.com/raccordement-panneau-solaire" />
      </Helmet>

      {/* Fil d'Ariane */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-3">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Raccordement <span className="text-orange-600">Photovoltaïques</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Installation et raccordement de vos panneaux solaires photovoltaïques au réseau Enedis. 
            Autoconsommation, revente d'électricité et démarches administratives simplifiées.
          </p>
          <Link href="/raccordement-enedis">
            <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 text-lg">
              Démarrer ma demande
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Types de raccordement solaire */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full mr-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Autoconsommation</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Consommez directement l'électricité produite par vos panneaux solaires et réduisez votre facture d'électricité.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Installation résidentielle
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Réduction facture électricité
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Démarches Enedis incluses
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Revente d'électricité</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Vendez l'électricité produite par vos panneaux solaires et générez des revenus complémentaires.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Tarif de rachat garanti
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Contrat 20 ans
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Accompagnement administratif
              </li>
            </ul>
          </div>
        </div>

        {/* Processus de raccordement */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Processus de raccordement photovoltaïques
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Étude technique</h4>
              <p className="text-sm text-gray-600">Analyse de votre installation et dimensionnement</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Demande Enedis</h4>
              <p className="text-sm text-gray-600">Constitution et envoi du dossier technique</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Installation</h4>
              <p className="text-sm text-gray-600">Pose des panneaux et raccordement électrique</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mise en service</h4>
              <p className="text-sm text-gray-600">Activation et production d'électricité solaire</p>
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Accompagnement complet</h3>
            <p className="text-gray-600">Prise en charge de toutes les démarches administratives Enedis</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Délais optimisés</h3>
            <p className="text-gray-600">Raccordement rapide grâce à notre expertise technique</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Experts qualifiés</h3>
            <p className="text-gray-600">Équipe spécialisée dans l'installation photovoltaïque</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Prêt à installer vos panneaux solaires ?</h2>
          <p className="text-lg mb-6">
            Obtenez votre devis personnalisé et commencez votre transition énergétique dès aujourd'hui.
          </p>
          <Link href="/raccordement-enedis">
            <Button className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
              Demander un devis gratuit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}