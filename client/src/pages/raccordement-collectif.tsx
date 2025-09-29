import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Building2, CheckCircle, Phone, Mail, Users, FileText, Clock } from "lucide-react";
import { Link } from "wouter";

export default function RaccordementCollectifPage() {
  return (
    <>
      <Helmet>
        <title>Raccordement Collectif Enedis | Lotissement & Copropriété</title>
        <meta name="description" content="Raccordement collectif pour lotissements, copropriétés et projets immobiliers. Étude, dossier et coordination avec Enedis." />
        <link rel="canonical" href="https://portail-electricite.com/raccordement-collectif" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Raccordement Collectif Enedis",
            "serviceType": "Raccordement Collectif",
            "description": "Raccordement électrique pour lotissements, copropriétés et projets immobiliers multi-logements. Coordination complète avec Enedis de l'étude à la mise en service.",
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
                "name": "Raccordement Collectif",
                "item": "https://portail-electricite.com/raccordement-collectif"
              }
            ]
          }
        `}</script>
      </Helmet>
      
      <Layout>
        {/* Hero Section */}
        <section className="pt-16 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="mx-auto max-w-3xl text-center px-4 sm:px-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Raccordement Collectif Enedis
            </h1>
            <h2 className="mt-6 text-lg leading-8 text-gray-600">
              Pour lotissements, copropriétés et projets immobiliers multi-logements.
              Étude technique, dossier complet et coordination avec Enedis.
            </h2>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg">
                  Faire ma demande
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <a 
                href="tel:+33970709570" 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600 transition-colors"
              >
                09 70 70 95 70
              </a>
            </div>
          </div>
        </section>

        {/* Points clés */}
        <section className="pt-16 pb-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service de raccordement collectif
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Building2 className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Lotissements & Copropriétés
                </h3>
                <p className="text-gray-600">
                  Raccordement multi-logements avec branchements individuels
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <FileText className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dossier complet Enedis
                </h3>
                <p className="text-gray-600">
                  Constitution conforme aux exigences réglementaires
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Coordination projet
                </h3>
                <p className="text-gray-600">
                  Interface unique entre Enedis et les acteurs du projet
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Types de projets */}
        <section className="pt-12 pb-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Types de projets concernés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Lotissements
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Division parcellaire avec création de lots</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Extension réseau électrique nécessaire</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Raccordements individuels par lot</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Copropriétés
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Immeubles collectifs neufs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Branchements multiples dans un même bâtiment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Coordination syndic et promoteur</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Projets immobiliers
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Programmes neufs multi-logements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Zones d'aménagement concerté (ZAC)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Gestion relations promoteur-Enedis</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ZAC & Zones d'activité
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Zones d'activité économique</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Extension réseau HTA/BT</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Coordination collectivités et aménageurs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Processus */}
        <section className="pt-16 pb-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Notre accompagnement
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Étude de faisabilité
                  </h3>
                  <p className="text-gray-600">
                    Analyse du projet, puissance nécessaire, contraintes techniques et estimation budgétaire
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Constitution du dossier
                  </h3>
                  <p className="text-gray-600">
                    Plans, documents administratifs, données techniques conformes aux exigences Enedis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Dépôt et suivi Enedis
                  </h3>
                  <p className="text-gray-600">
                    Soumission du dossier, suivi de l'instruction et coordination avec les équipes Enedis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Coordination travaux
                  </h3>
                  <p className="text-gray-600">
                    Interface avec tous les acteurs du projet jusqu'à la mise en service complète
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="pt-16 pb-16 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Un projet de raccordement collectif ?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Confiez-nous la coordination de votre raccordement collectif pour un projet mené en toute sérénité.
            </p>
            <Link href="/raccordement-enedis#formulaire-raccordement">
              <Button className="bg-white text-purple-600 hover:bg-gray-50 px-10 py-4 text-xl font-semibold rounded-lg shadow-lg">
                Commencer ma demande
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    </>
  );
}
