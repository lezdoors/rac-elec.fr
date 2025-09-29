import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Zap, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";
import { FaqSection } from "@/components/faq-section";
import { TrustSection } from "@/components/trust-section";

export default function RaccordementDefinitifPage() {
  const faqItems = [
    {
      question: "Quelle est la différence entre un raccordement définitif et provisoire ?",
      answer: "Le raccordement définitif est une installation électrique permanente destinée à alimenter durablement une habitation ou un local professionnel. Contrairement au raccordement provisoire limité à 12 mois, il est conçu pour une utilisation continue et illimitée dans le temps. Il implique des installations pérennes et répond aux normes d'habitation."
    },
    {
      question: "Combien de temps faut-il pour obtenir un raccordement définitif ?",
      answer: "Le délai global varie entre 2 et 6 mois selon la complexité du projet. L'étude de faisabilité prend environ 10 jours, les travaux simples nécessitent 6 à 10 semaines, tandis que les travaux complexes avec extension de réseau peuvent prendre jusqu'à 4-6 mois. La mise en service finale est réalisée sous 5 jours ouvrés après la fin des travaux."
    },
    {
      question: "Puis-je choisir ma puissance de raccordement librement ?",
      answer: "La puissance de raccordement dépend de vos besoins réels et de la capacité du réseau existant. Les puissances courantes pour les particuliers vont de 3 kVA à 36 kVA. Pour les professionnels, des puissances supérieures peuvent être demandées. Enedis réalise une étude de faisabilité pour valider la puissance souhaitée et vérifier la compatibilité avec le réseau local."
    }
  ];

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
                    Le raccordement définitif vous permet d'être alimenté en électricité de manière permanente par le réseau public Enedis. Cette solution est adaptée aux habitations neuves, aux bâtiments professionnels ou à toute construction nécessitant une alimentation électrique durable.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Avantages</h3>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Alimentation électrique permanente et fiable
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Compteur individuel à votre nom
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Puissance adaptée à vos besoins réels
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Installation conforme aux normes en vigueur
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
                  <p className="text-sm text-gray-600">Besoin d'aide ? Contactez-nous</p>
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-green-600 hover:text-green-800 font-medium">
                      09 70 70 95 70
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Le processus de raccordement définitif */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Le processus de raccordement définitif
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Demande et étude préalable
                      </h3>
                      <p className="text-gray-600">
                        Soumettez votre demande avec les informations de votre projet. Nous réalisons une première analyse de faisabilité technique et vérifions la conformité de votre dossier avant transmission à Enedis pour l'étude officielle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Proposition de raccordement Enedis
                      </h3>
                      <p className="text-gray-600">
                        Enedis étudie votre dossier et vous transmet une proposition technique et financière détaillée (PTF) comprenant les caractéristiques du raccordement, le délai de réalisation et le montant des travaux à réaliser.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Réalisation des travaux
                      </h3>
                      <p className="text-gray-600">
                        Après acceptation de la proposition, Enedis programme et réalise les travaux de raccordement : tranchée, pose du câble d'alimentation, installation du coffret et du compteur électrique individuel sur votre propriété.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Mise en service et ouverture du compteur
                      </h3>
                      <p className="text-gray-600">
                        Une fois les travaux terminés et l'attestation de conformité Consuel obtenue, la mise en service du compteur est effectuée. Vous pouvez alors souscrire un contrat auprès du fournisseur d'énergie de votre choix pour bénéficier de l'électricité.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
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
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Pièce d'identité du demandeur (CNI ou passeport)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de situation du terrain (échelle 1/25000)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de masse avec emplacement du coffret
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Formulaire de demande Enedis complété
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Puissance de raccordement souhaitée (kVA)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents complémentaires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Permis de construire ou déclaration de travaux
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Titre de propriété ou compromis de vente
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Autorisation de passage si nécessaire
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Photos du lieu de raccordement
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Schéma de l'installation électrique intérieure
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
                    <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">10j</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Étude de faisabilité Enedis
                      </h3>
                      <p className="text-gray-600">
                        Délai moyen pour recevoir la proposition technique et financière (PTF) d'Enedis après dépôt du dossier complet.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">2-3m</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Travaux de raccordement simples
                      </h3>
                      <p className="text-gray-600">
                        Pour un raccordement standard ne nécessitant pas d'extension de réseau, comptez entre 6 et 10 semaines de délai de réalisation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-amber-600 font-bold">4-6m</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Travaux complexes avec extension
                      </h3>
                      <p className="text-gray-600">
                        Si votre raccordement nécessite une extension du réseau électrique public ou des travaux d'envergure, les délais peuvent atteindre 4 à 6 mois.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">5j</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Mise en service du compteur
                      </h3>
                      <p className="text-gray-600">
                        Après obtention de l'attestation Consuel, la mise en service effective est réalisée sous 5 jours ouvrés maximum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <FaqSection 
              items={faqItems}
              pageTitle="Raccordement Définitif"
            />

            {/* Services Connexes - Internal Linking SILO */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Autres types de raccordement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/raccordement-provisoire" className="block">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Raccordement Provisoire
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Pour chantiers et événements temporaires
                    </p>
                    <span className="text-blue-600 font-medium text-sm inline-flex items-center">
                      En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </Link>
                
                <Link href="/modification-compteur" className="block">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Augmentation de Puissance
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Passage mono/triphasé et changement de puissance
                    </p>
                    <span className="text-blue-600 font-medium text-sm inline-flex items-center">
                      En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </Link>

                <Link href="/raccordement-collectif" className="block">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Raccordement Collectif
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Pour lotissements et copropriétés
                    </p>
                    <span className="text-blue-600 font-medium text-sm inline-flex items-center">
                      En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </Link>
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
