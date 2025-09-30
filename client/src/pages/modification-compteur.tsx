import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Gauge, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";
import { FaqSection } from "@/components/faq-section";
import { TrustSection } from "@/components/trust-section";

export default function ModificationCompteurPage() {
  const faqItems = [
    {
      question: "Quand faut-il augmenter la puissance de son compteur électrique ?",
      answer: "Une augmentation de puissance est nécessaire lorsque vous installez de nouveaux équipements énergivores (pompe à chaleur, borne de recharge électrique, climatisation), que vous agrandissez votre habitation, ou si votre disjoncteur saute régulièrement. Des coupures fréquentes indiquent que votre installation actuelle ne suffit plus à vos besoins réels en électricité."
    },
    {
      question: "Quelle est la différence entre monophasé et triphasé ?",
      answer: "Le monophasé (230V) est le plus courant dans les logements et suffit pour la plupart des usages domestiques jusqu'à 12 kVA. Le triphasé (400V) distribue l'électricité sur trois phases et permet des puissances supérieures (18 à 36 kVA) ou l'alimentation d'équipements professionnels spécifiques. Le passage en triphasé nécessite des travaux plus importants et une modification de l'installation intérieure."
    },
    {
      question: "Peut-on augmenter la puissance sans changer de compteur ?",
      answer: "Avec les compteurs Linky, le changement de puissance peut souvent se faire à distance sans intervention physique, dans la limite de la capacité de votre branchement. Toutefois, pour passer d'une puissance de 12 kVA à 18 kVA ou plus, ou pour passer du monophasé au triphasé, des travaux sur le branchement et le compteur sont généralement nécessaires. Une étude technique détermine la faisabilité."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Augmentation de Puissance Compteur Enedis | Mono & Triphasé</title>
        <meta name="description" content="Passez à la puissance adaptée (mono/triphasé). Étude, dossier et suivi jusqu'à modification du contrat." />
        <link rel="canonical" href="https://www.raccordement-connect.com/modification-compteur" />
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
              "name": "Raccordement-Connect.com",
              "url": "https://www.raccordement-connect.com/"
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
                "item": "https://www.raccordement-connect.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Augmentation de Puissance",
                "item": "https://www.raccordement-connect.com/modification-compteur"
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
                    Adaptez votre installation électrique à vos nouveaux besoins avec une modification de compteur ou de puissance. Que vous installiez une borne de recharge, une pompe à chaleur ou agrandissiez votre habitation, nous vous accompagnons dans votre démarche.
                  </p>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-semibold text-indigo-900 mb-2">Services inclus</h3>
                    <ul className="space-y-2 text-sm text-indigo-800">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Étude de faisabilité technique complète
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Passage monophasé vers triphasé si nécessaire
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Suivi jusqu'à modification du contrat Enedis
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                        Coordination avec votre fournisseur d'énergie
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
                  <p className="text-sm text-gray-600">Besoin d'informations ? Appelez-nous</p>
                  <div className="flex items-center justify-center space-x-4">
                    <a href="tel:0970709570" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                      09 70 70 95 70
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Le processus d'augmentation de puissance */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Le processus d'augmentation de puissance
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Diagnostic de votre installation actuelle
                      </h3>
                      <p className="text-gray-600">
                        Nous analysons votre installation électrique existante : puissance souscrite actuelle, type de branchement (monophasé ou triphasé), capacité du coffret et de la ligne. Nous déterminons la puissance nécessaire en fonction de vos nouveaux équipements et de vos besoins futurs pour éviter tout sous-dimensionnement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Étude technique et proposition Enedis
                      </h3>
                      <p className="text-gray-600">
                        Nous constituons votre dossier technique et le transmettons à Enedis. Enedis réalise une étude de faisabilité pour vérifier que le réseau peut supporter l'augmentation de puissance demandée. Si des travaux sur le branchement sont nécessaires (passage au triphasé, remplacement du câble), ils sont identifiés dans la proposition technique et financière.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Réalisation des travaux si nécessaires
                      </h3>
                      <p className="text-gray-600">
                        Si l'augmentation de puissance nécessite des travaux physiques, Enedis intervient pour modifier le branchement : remplacement du câble d'alimentation, changement du disjoncteur de branchement, passage en triphasé. Pour les compteurs Linky, une simple modification à distance peut suffire dans certains cas sans intervention sur site.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Mise à jour du contrat et activation
                      </h3>
                      <p className="text-gray-600">
                        Une fois les travaux terminés, nous vous aidons à mettre à jour votre contrat auprès de votre fournisseur d'énergie pour bénéficier de la nouvelle puissance. La modification est effective immédiatement et vous pouvez profiter pleinement de vos nouveaux équipements sans risque de coupure.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
                      Démarrer ma demande d'augmentation
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
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Pièce d'identité du titulaire du contrat
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Numéro de Point de Livraison (PDL) ou de compteur
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Facture d'électricité récente
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Puissance actuelle et puissance souhaitée
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Coordonnées complètes du logement
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents complémentaires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Liste des nouveaux équipements à installer
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Photos du tableau électrique existant
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Attestation de conformité Consuel (si rénovation récente)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Justificatif de propriété ou bail locatif
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Estimation des travaux électriques intérieurs si nécessaire
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
                    <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">5j</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Étude de faisabilité Enedis
                      </h3>
                      <p className="text-gray-600">
                        Enedis analyse votre demande et vérifie que le réseau et votre branchement peuvent supporter l'augmentation de puissance. La réponse technique est fournie sous 5 jours ouvrés en moyenne.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">Immédiat</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Modification simple (Linky sans travaux)
                      </h3>
                      <p className="text-gray-600">
                        Si votre compteur Linky permet l'augmentation à distance et qu'aucun travaux physique n'est requis, la modification de puissance est activée immédiatement après validation du dossier, généralement en 24-48h.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-amber-600 font-bold">2-4 sem</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Modification avec travaux légers
                      </h3>
                      <p className="text-gray-600">
                        Si des travaux sont nécessaires (changement de disjoncteur, remplacement câble), comptez 2 à 4 semaines pour la planification et la réalisation de l'intervention Enedis sur votre installation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold">6-10 sem</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Passage monophasé vers triphasé
                      </h3>
                      <p className="text-gray-600">
                        Le passage en triphasé nécessite des travaux plus importants : modification du branchement, remplacement du câble et du coffret. Le délai total varie entre 6 et 10 semaines selon la complexité et la disponibilité des équipes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <FaqSection 
              items={faqItems}
              pageTitle="Augmentation de Puissance"
            />

            {/* Services Connexes - Internal Linking SILO */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Autres services de raccordement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/raccordement-definitif" className="block">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Raccordement Définitif
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Alimentation permanente pour habitations et locaux
                    </p>
                    <span className="text-indigo-600 font-medium text-sm inline-flex items-center">
                      En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </Link>
                
                <Link href="/raccordement-provisoire" className="block">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Raccordement Provisoire
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Pour chantiers et événements temporaires
                    </p>
                    <span className="text-indigo-600 font-medium text-sm inline-flex items-center">
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
