import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Home, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { FaqSection } from "@/components/faq-section";
import { TrustSection } from "@/components/trust-section";

export default function RaccordementMaisonNeuvePage() {
  const faqItems = [
    {
      question: "À quel moment dois-je faire ma demande de raccordement pour une maison neuve ?",
      answer: "Il est recommandé de faire votre demande de raccordement dès l'obtention du permis de construire, idéalement avant le démarrage des travaux. Cela permet d'anticiper les délais d'étude et de réalisation (2 à 6 mois selon les cas) et d'avoir l'électricité disponible dès la fin de la construction. Une demande tardive peut retarder votre emménagement."
    },
    {
      question: "Qui doit faire la demande de raccordement : le propriétaire ou le constructeur ?",
      answer: "Le propriétaire du terrain est responsable de la demande de raccordement auprès d'Enedis. Toutefois, le constructeur ou le maître d'œuvre peut effectuer cette démarche en son nom avec un mandat. Dans le cadre d'une construction clé en main, vérifiez si le raccordement électrique est inclus dans le contrat ou s'il reste à votre charge."
    },
    {
      question: "Quelle puissance de raccordement choisir pour une maison neuve ?",
      answer: "Pour une maison individuelle classique (chauffage gaz, eau chaude électrique), 9 kVA en monophasé suffit généralement. Avec un chauffage électrique, prévoyez 12 kVA. Pour une grande maison avec pompe à chaleur, borne de recharge électrique ou piscine, optez pour 15 à 18 kVA, voire du triphasé (18-36 kVA). Une étude personnalisée détermine la puissance optimale."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Raccordement Maison Neuve | Enedis - Procédure Complète</title>
        <meta name="description" content="Raccordement électrique pour maison neuve. Procédure simplifiée et accompagnement complet pour votre projet de construction." />
        <link rel="canonical" href="https://www.demande-raccordement.fr/raccordement-maison-neuve" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Raccordement Maison Neuve",
            "serviceType": "Raccordement Électrique Construction Neuve",
            "description": "Raccordement électrique pour maison neuve. Accompagnement complet de la demande à la mise en service pour votre projet de construction.",
            "provider": {
              "@type": "Organization",
              "name": "demande-raccordement.fr",
              "url": "https://www.demande-raccordement.fr/"
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
                "item": "https://www.demande-raccordement.fr/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Raccordement Maison Neuve",
                "item": "https://www.demande-raccordement.fr/raccordement-maison-neuve"
              }
            ]
          }
        `}</script>
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
                Procédure simple et accompagnement personnalisé du début à la mise en service.
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
                    votre logement en électricité et doit être anticipée dès l'obtention du permis de construire pour respecter le planning de votre projet.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Pourquoi choisir nos services ?</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Expertise reconnue dans les raccordements neufs
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Accompagnement de A à Z jusqu'à la mise en service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Délais maîtrisés et coordination optimale
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Support technique dédié et réactif
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - CTA */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Demandez votre raccordement
                </h2>
                
                <div className="space-y-4 mb-8">
                  <p className="text-gray-600">
                    Lancez votre demande de raccordement dès maintenant pour anticiper les délais et assurer une mise en service rapide de votre maison neuve.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">24h</div>
                      <div className="text-sm text-gray-600">Réponse rapide à votre demande</div>
                    </div>
                  </div>
                </div>

                <Link href="/raccordement-enedis#formulaire-raccordement" >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Faire ma demande maintenant
                  </Button>
                </Link>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Ou contactez-nous directement :</p>
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                      09 70 70 95 70
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Le processus de raccordement maison neuve */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Le processus de raccordement maison neuve
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Dépôt de la demande et étude de faisabilité
                      </h3>
                      <p className="text-gray-600">
                        Soumettez votre demande avec le permis de construire et les plans de votre maison. Nous constituons un dossier complet et le transmettons à Enedis qui réalise une étude technique pour déterminer la faisabilité du raccordement et la puissance disponible sur le réseau à proximité de votre terrain.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Réception de la proposition technique et financière
                      </h3>
                      <p className="text-gray-600">
                        Enedis vous transmet une proposition détaillée (PTF) indiquant les caractéristiques du raccordement, la distance à parcourir, les éventuels travaux d'extension de réseau nécessaires, le délai de réalisation et le coût total des travaux. Cette proposition est valable 3 mois.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Réalisation des travaux de raccordement
                      </h3>
                      <p className="text-gray-600">
                        Après acceptation de la proposition, Enedis programme les travaux : tranchée depuis le réseau public, pose du câble d'alimentation souterrain, installation du coffret de branchement et du disjoncteur. Le compteur Linky est posé à l'emplacement prévu dans votre construction neuve.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Obtention du Consuel et mise en service
                      </h3>
                      <p className="text-gray-600">
                        Une fois l'installation électrique intérieure terminée et conforme, votre électricien obtient l'attestation Consuel qui certifie la conformité de l'installation. Cette attestation permet la mise en service du compteur par Enedis et la souscription d'un contrat d'électricité auprès du fournisseur de votre choix.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link href="/raccordement-enedis#formulaire-raccordement" >
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
                      Commencer ma demande de raccordement
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Documents nécessaires */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Documents nécessaires
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents obligatoires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de situation du terrain (échelle 1/25000)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de masse de la construction avec emplacement du coffret
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Permis de construire validé et purgé des recours
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Pièce d'identité du demandeur (propriétaire)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Puissance de raccordement souhaitée (kVA)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents complémentaires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Titre de propriété ou compromis de vente du terrain
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Photos du lieu de raccordement et de l'environnement
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Autorisation de passage si traversée terrain voisin
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Schéma unifilaire de l'installation électrique intérieure
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Planning prévisionnel des travaux de construction
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Délais moyens */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Délais moyens
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">10j</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Étude de faisabilité Enedis
                      </h3>
                      <p className="text-gray-600">
                        Après dépôt du dossier complet, Enedis réalise l'étude technique de votre projet et vous transmet une proposition technique et financière sous 10 jours ouvrés en moyenne.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">2 mois</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Travaux de raccordement simples
                      </h3>
                      <p className="text-gray-600">
                        Pour un raccordement standard sans extension de réseau, proche d'une ligne électrique existante, comptez environ 6 à 10 semaines entre l'acceptation de la PTF et la fin des travaux.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-amber-600 font-bold">4-6 mois</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Travaux complexes avec extension
                      </h3>
                      <p className="text-gray-600">
                        Si votre maison est éloignée du réseau ou nécessite une extension importante (pose de poteaux, transformateur), les délais peuvent atteindre 4 à 6 mois selon la complexité technique et les autorisations nécessaires.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">5j</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Mise en service du compteur
                      </h3>
                      <p className="text-gray-600">
                        Après obtention de l'attestation Consuel certifiant la conformité de votre installation intérieure, la mise en service du compteur Linky est effectuée sous 5 jours ouvrés maximum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <FaqSection 
              items={faqItems}
              pageTitle="Raccordement Maison Neuve"
            />
          </div>
        </div>

        {/* Trust Section */}
        <TrustSection />
      </Layout>
    </>
  );
}
