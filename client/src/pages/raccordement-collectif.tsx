import { Helmet } from "react-helmet";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { ArrowRight, Building2, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trackFormStart } from "@/lib/analytics";
import { FaqSection } from "@/components/faq-section";
import { TrustSection } from "@/components/trust-section";

export default function RaccordementCollectifPage() {
  const faqItems = [
    {
      question: "Quelle est la différence entre un raccordement collectif et individuel ?",
      answer: "Le raccordement collectif concerne les projets multi-logements (lotissements, copropriétés) où plusieurs habitations sont alimentées via une infrastructure commune. Il nécessite une étude globale et une coordination entre tous les acteurs. Le raccordement individuel ne concerne qu'une seule habitation avec son propre branchement direct depuis le réseau public."
    },
    {
      question: "Qui paie les frais de raccordement dans un lotissement ?",
      answer: "Dans un lotissement, les frais de raccordement sont généralement pris en charge par le promoteur ou l'aménageur qui répercute ensuite ces coûts sur le prix de vente des lots. Pour une extension de réseau, la participation financière peut être partagée entre l'aménageur et Enedis selon les règles du TURPE (Tarif d'Utilisation des Réseaux Publics d'Électricité)."
    },
    {
      question: "Combien de temps prend un raccordement collectif complet ?",
      answer: "Un raccordement collectif prend généralement entre 6 et 12 mois selon la complexité du projet. Ce délai comprend l'étude de faisabilité (1-2 mois), l'obtention des autorisations (variable), la réalisation des travaux d'extension de réseau si nécessaire (3-6 mois) et les raccordements individuels de chaque lot (1-2 mois par vague)."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Raccordement Collectif Enedis | Lotissement & Copropriété</title>
        <meta name="description" content="Raccordement collectif pour lotissements, copropriétés et projets immobiliers. Étude, dossier et coordination avec Enedis." />
        <link rel="canonical" href="https://www.demande-raccordement.fr/raccordement-collectif" />
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
                "name": "Raccordement Collectif",
                "item": "https://www.demande-raccordement.fr/raccordement-collectif"
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
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Pour lotissements, copropriétés et projets immobiliers multi-logements.
              Étude technique, dossier complet et coordination avec Enedis.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
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
                  Raccordement multi-logements avec branchements individuels coordonnés
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dossier complet Enedis
                </h3>
                <p className="text-gray-600">
                  Constitution conforme aux exigences réglementaires spécifiques
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <ArrowRight className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Coordination projet
                </h3>
                <p className="text-gray-600">
                  Interface unique entre Enedis, promoteur et acteurs du projet
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Le processus de raccordement collectif */}
        <section className="pt-16 pb-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Le processus de raccordement collectif
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Étude de faisabilité globale
                  </h3>
                  <p className="text-gray-600">
                    Analyse complète du projet immobilier : nombre de logements, puissance totale nécessaire, configuration du réseau électrique existant à proximité, contraintes techniques locales et estimation budgétaire prévisionnelle. Nous réalisons un audit complet pour anticiper les besoins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Constitution du dossier technique complet
                  </h3>
                  <p className="text-gray-600">
                    Préparation de l'ensemble des documents requis : plans masse et situation, données techniques par lot, schémas électriques, permis d'aménager, documents administratifs du lotissement ou de la copropriété. Le dossier doit être exhaustif et conforme aux normes Enedis pour éviter tout retard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Dépôt et instruction par Enedis
                  </h3>
                  <p className="text-gray-600">
                    Soumission du dossier collectif à Enedis et suivi de l'instruction. Enedis étudie la capacité du réseau, détermine si une extension est nécessaire, établit la proposition technique et financière (PTF) pour l'ensemble du projet. Nous assurons les échanges et suivons chaque étape de validation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">4</span>
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Coordination des travaux et mise en service
                  </h3>
                  <p className="text-gray-600">
                    Planification et coordination des travaux d'extension de réseau si nécessaire, puis réalisation des raccordements individuels par lots. Nous servons d'interface entre Enedis, le promoteur, les différents constructeurs et coordonnons les interventions jusqu'à la mise en service complète de tous les logements.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg">
                  Lancer mon projet de raccordement collectif
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Documents nécessaires */}
        <section className="pt-16 pb-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Documents nécessaires
            </h2>
            <div className="bg-gray-50 rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents administratifs</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Permis d'aménager ou permis de construire collectif
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Plans de masse et de situation du lotissement
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Titre de propriété ou promesse de vente
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Pièce d'identité du représentant légal
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Statuts de la société aménageuse ou SCI
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents techniques</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Tableau récapitulatif des lots et puissances
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Schéma d'implantation des coffrets électriques
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Plans de voirie et réseaux divers (VRD)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Calendrier prévisionnel de construction
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Autorisations de passage si nécessaire
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Délais moyens */}
        <section className="pt-16 pb-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Délais moyens
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">1-2 mois</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Étude de faisabilité et proposition Enedis
                    </h3>
                    <p className="text-gray-600">
                      Enedis réalise l'étude technique du projet collectif, vérifie la capacité du réseau et établit une proposition technique et financière détaillée pour l'ensemble du lotissement ou de la copropriété.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">3-6 mois</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Travaux d'extension de réseau (si nécessaire)
                    </h3>
                    <p className="text-gray-600">
                      Si le réseau électrique existant ne peut pas supporter la charge supplémentaire, Enedis réalise une extension : pose de nouveaux câbles, installation de transformateurs, création de postes de distribution. Ce délai varie selon l'ampleur des travaux.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">2-4 mois</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Raccordements individuels par tranches
                    </h3>
                    <p className="text-gray-600">
                      Les raccordements individuels de chaque lot sont réalisés par vagues au fur et à mesure de l'avancement de la construction. Chaque tranche de 10-20 lots nécessite environ 1 à 2 mois de travaux selon la coordination avec les constructeurs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Délai total moyen :</strong> Comptez entre 6 et 12 mois pour un projet complet de raccordement collectif, du dépôt du dossier à la mise en service du dernier logement. Les projets avec extension de réseau nécessitent des délais plus longs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-8 pb-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <FaqSection 
              items={faqItems}
              pageTitle="Raccordement Collectif"
            />
          </div>
        </section>

        {/* Services Connexes - Internal Linking SILO */}
        <section className="pt-12 pb-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Autres types de raccordement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/raccordement-definitif" className="block">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Raccordement Définitif
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Alimentation permanente pour habitations et locaux
                  </p>
                  <span className="text-purple-600 font-medium text-sm inline-flex items-center">
                    En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </Link>
              
              <Link href="/raccordement-provisoire" className="block">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Raccordement Provisoire
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Pour chantiers et événements temporaires
                  </p>
                  <span className="text-purple-600 font-medium text-sm inline-flex items-center">
                    En savoir plus <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <TrustSection />
      </Layout>
    </>
  );
}
