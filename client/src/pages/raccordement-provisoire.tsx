import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import Layout from "@/components/layout";
import { FaqSection } from "@/components/faq-section";
import { TrustSection } from "@/components/trust-section";

export default function RaccordementProvisoirePage() {
  const faqItems = [
    {
      question: "Qu'est-ce qu'un raccordement provisoire et dans quels cas en ai-je besoin ?",
      answer: "Un raccordement provisoire est une installation électrique temporaire permettant d'alimenter un chantier, un événement ou toute activité nécessitant une alimentation limitée dans le temps. Il est idéal pour les travaux de construction, les chantiers temporaires, les événements extérieurs ou les manifestations. Ce type de raccordement est conçu pour une durée maximale de 12 mois."
    },
    {
      question: "Quelle est la différence entre un raccordement provisoire et définitif ?",
      answer: "Le raccordement provisoire est limité dans le temps (maximum 12 mois) et destiné à un usage temporaire comme un chantier. Il utilise des installations adaptées aux besoins ponctuels et peut être démonté à la fin de l'utilisation. Le raccordement définitif est permanent, conçu pour une utilisation continue de l'électricité dans une habitation ou un local commercial, et nécessite des installations pérennes."
    },
    {
      question: "Puis-je prolonger la durée de mon raccordement provisoire au-delà de 12 mois ?",
      answer: "Oui, une prolongation peut être demandée sous réserve de validation par Enedis et de la justification du maintien de l'activité temporaire. Toutefois, la prolongation n'est pas automatique et doit être motivée par des raisons techniques ou organisationnelles valables. Dans certains cas, Enedis peut demander la transformation en raccordement définitif."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Demande de Raccordement Provisoire Enedis | Chantier & Événement</title>
        <meta 
          name="description" 
          content="Raccordement provisoire pour chantiers et événements. Démarrez votre demande en ligne, prise en charge complète." 
        />
        <link rel="canonical" href="https://www.demande-raccordement.fr/raccordement-provisoire" />
        <meta name="robots" content="index, follow" />
        
        {/* Service JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Demande de Raccordement Provisoire Enedis",
            "serviceType": "Raccordement Provisoire",
            "description": "Raccordement électrique temporaire pour chantiers, événements et activités à durée limitée. Accompagnement complet de la demande à la mise en service.",
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
                "name": "Raccordement Provisoire",
                "item": "https://www.demande-raccordement.fr/raccordement-provisoire"
              }
            ]
          }
        `}</script>
        <meta property="og:title" content="Demande de Raccordement Provisoire Enedis | Chantier" />
        <meta property="og:description" content="Raccordement provisoire Enedis pour chantiers et événements. Démarche complète et rapide. Lancez votre demande en ligne." />
        <meta property="og:url" content="https://www.demande-raccordement.fr/raccordement-provisoire" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Demande de Raccordement Provisoire Enedis | Chantier" />
        <meta name="twitter:description" content="Raccordement provisoire Enedis pour chantiers et événements. Démarche complète et rapide." />
      </Helmet>

      <Layout>
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <BreadcrumbNavigation 
              items={[
                { label: "Accueil", href: "/" },
                { label: "Nos services", href: "/nos-services" },
                { label: "Raccordement provisoire", href: "/raccordement-provisoire" }
              ]}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-16 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="mx-auto max-w-3xl text-center px-4 sm:px-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Demande de Raccordement Provisoire
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Raccordement provisoire Enedis pour chantiers et événements. 
              Dossier conforme aux exigences Enedis, accompagnement administratif complet.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link 
                href="/raccordement-enedis#formulaire-raccordement"
              >
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg">
                  Faire ma demande
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <a 
                href="tel:+33970709570" 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors"
              >
                09 70 70 95 70
              </a>
            </div>
          </div>
        </section>

        {/* Points clés Section */}
        <section className="pt-16 pb-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Points clés de notre service
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dossier conforme Enedis
                </h3>
                <p className="text-gray-600">
                  Constitution complète selon les exigences réglementaires
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gestion administrative complète
                </h3>
                <p className="text-gray-600">
                  Prise en charge totale des démarches et du suivi
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Puissance adaptée au chantier
                </h3>
                <p className="text-gray-600">
                  Étude personnalisée selon vos besoins électriques
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Paiement 100 % sécurisé
                </h3>
                <p className="text-gray-600">
                  Transactions protégées par cryptage SSL
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Le processus de raccordement provisoire */}
        <section className="pt-16 pb-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Le processus de raccordement provisoire
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Un accompagnement structuré en 4 étapes pour votre raccordement temporaire
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Analyse de votre projet
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Remplissez notre formulaire en ligne avec les détails de votre chantier ou événement. Nous étudions vos besoins en puissance électrique et la configuration du site.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Constitution du dossier technique
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Nos experts préparent un dossier complet conforme aux exigences Enedis : plans, documents administratifs et caractéristiques techniques de l'installation provisoire.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Dépôt et suivi Enedis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Transmission de votre demande à Enedis et suivi rigoureux de l'instruction. Nous restons votre interlocuteur unique pendant toute la procédure administrative.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Mise en service et activation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Coordination de l'intervention Enedis pour l'installation du raccordement provisoire et activation du compteur temporaire sur votre chantier.
                </p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg">
                  Démarrer ma demande maintenant
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Documents nécessaires Section */}
        <section className="pt-16 pb-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Documents nécessaires pour votre raccordement provisoire
              </h2>

              <div className="bg-gray-50 rounded-lg shadow-sm border p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents obligatoires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Pièce d'identité du demandeur (carte d'identité ou passeport)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de situation du terrain (échelle 1/25000)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Puissance électrique demandée et type de raccordement
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Déclaration sur l'honneur d'usage temporaire
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Dates prévisionnelles de début et fin d'utilisation
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents complémentaires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Autorisation du propriétaire du terrain (si vous n'êtes pas propriétaire)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de masse du chantier avec emplacement souhaité
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Justificatif de propriété ou bail commercial
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Planning prévisionnel des travaux ou de l'événement
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Attestation d'assurance responsabilité civile
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Bon à savoir :</strong> Nous vous accompagnons dans la préparation de votre dossier et vérifions que tous les documents sont conformes avant transmission à Enedis, évitant ainsi les refus ou demandes de compléments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Délais moyens Section */}
        <section className="pt-16 pb-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Délais moyens pour un raccordement provisoire
              </h2>
              
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Traitement de votre demande : 24-48h
                      </h3>
                      <p className="text-gray-600">
                        Analyse de votre projet, vérification des documents et préparation du dossier technique complet par nos équipes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Étude Enedis : 10-15 jours ouvrés
                      </h3>
                      <p className="text-gray-600">
                        Examen technique du dossier par Enedis, vérification de la faisabilité et proposition de raccordement avec conditions tarifaires.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Réalisation des travaux : 3-6 semaines
                      </h3>
                      <p className="text-gray-600">
                        Installation du coffret provisoire, pose du câble d'alimentation et mise en place du compteur temporaire sur votre chantier.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Mise en service : Immédiate
                      </h3>
                      <p className="text-gray-600">
                        Activation du raccordement provisoire dès la fin des travaux, vous permettant d'alimenter immédiatement votre chantier ou votre événement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-900">
                    <strong>Important :</strong> Ces délais sont donnés à titre indicatif et peuvent varier selon la complexité du projet, la disponibilité des équipes Enedis et les contraintes locales. Les raccordements en zone rurale ou nécessitant une extension de réseau peuvent prendre plus de temps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-8 pb-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <FaqSection 
              items={faqItems}
              pageTitle="Raccordement Provisoire"
            />
          </div>
        </section>

        {/* Trust Section */}
        <TrustSection />
      </Layout>
    </>
  );
}
