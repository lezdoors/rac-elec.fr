import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { Sun, Zap, CheckCircle, ArrowRight, Calculator, Shield, Clock } from "lucide-react";
import Layout from "@/components/layout";
import { trackFormStart } from "@/lib/analytics";
import { FaqSection } from "@/components/faq-section";
import { TrustSection } from "@/components/trust-section";

export default function SolairePage() {
  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Raccordement photovoltaïques" }
  ];

  const faqItems = [
    {
      question: "Quelle est la différence entre autoconsommation et revente totale ?",
      answer: "L'autoconsommation consiste à consommer directement l'électricité produite par vos panneaux solaires, le surplus étant éventuellement revendu à EDF OA. La revente totale implique de vendre l'intégralité de votre production à un tarif de rachat garanti sur 20 ans, sans consommer votre propre électricité. L'autoconsommation est généralement plus rentable car vous réduisez votre facture d'électricité."
    },
    {
      question: "Combien de temps prend un raccordement photovoltaïque complet ?",
      answer: "Le délai total varie entre 2 et 4 mois : étude technique et constitution du dossier (2-3 semaines), instruction par Enedis (4-6 semaines), installation des panneaux et raccordement au réseau (1-2 semaines), puis mise en service et activation du compteur de production (1 semaine). Ces délais peuvent être rallongés en période de forte demande ou si des travaux d'extension réseau sont nécessaires."
    },
    {
      question: "Ai-je besoin d'une autorisation pour installer des panneaux solaires ?",
      answer: "Pour une installation en toiture de moins de 3 kWc, une simple déclaration préalable de travaux en mairie suffit. Au-delà de 3 kWc ou pour une installation au sol, un permis de construire peut être requis selon la puissance et la zone (ABF, site classé). Le raccordement au réseau Enedis nécessite également une convention d'autoconsommation ou un contrat de rachat selon votre choix."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Raccordement Photovoltaïques Enedis | Installation Panneaux Solaires</title>
        <meta name="description" content="Raccordement de vos installations photovoltaïques au réseau Enedis. Panneaux solaires, autoconsommation et revente d'électricité. Démarches simplifiées." />
        <meta name="keywords" content="raccordement photovoltaïques, installation photovoltaïque, Enedis solaire, panneaux solaires, autoconsommation électrique" />
        <link rel="canonical" href="https://portail-electricite.com/raccordement-panneau-solaire" />
        
        {/* Service JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Raccordement Photovoltaïques Enedis",
            "serviceType": "Raccordement Panneaux Solaires",
            "description": "Raccordement de vos installations photovoltaïques au réseau Enedis. Autoconsommation, revente d'électricité et accompagnement complet.",
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
                "name": "Raccordement Photovoltaïques",
                "item": "https://portail-electricite.com/raccordement-panneau-solaire"
              }
            ]
          }
        `}</script>
      </Helmet>

      <Layout>
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
            <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
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
                Consommez directement l'électricité produite par vos panneaux solaires et réduisez significativement votre facture d'électricité mensuelle.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Installation résidentielle optimisée
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Réduction jusqu'à 70% de votre facture
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Démarches Enedis entièrement prises en charge
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
                Vendez l'électricité produite par vos panneaux solaires et générez des revenus complémentaires stables et sécurisés.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Tarif de rachat garanti par l'État
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Contrat EDF OA de 20 ans
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Accompagnement administratif complet
                </li>
              </ul>
            </div>
          </div>

          {/* Le processus de raccordement photovoltaïques */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Le processus de raccordement photovoltaïques
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Étude technique complète</h4>
                  <p className="text-sm text-gray-600">Analyse de votre toiture, orientation, ensoleillement et dimensionnement optimal de l'installation photovoltaïque selon vos besoins énergétiques.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Constitution dossier Enedis</h4>
                  <p className="text-sm text-gray-600">Préparation et envoi du dossier technique complet à Enedis avec convention d'autoconsommation ou contrat de rachat selon votre projet.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Installation panneaux solaires</h4>
                  <p className="text-sm text-gray-600">Pose professionnelle des panneaux sur votre toiture, installation de l'onduleur et raccordement électrique à votre tableau domestique.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mise en service Enedis</h4>
                  <p className="text-sm text-gray-600">Activation du compteur de production, mise en service et début de la production d'électricité solaire verte immédiatement.</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/raccordement-enedis#formulaire-raccordement" onClick={trackFormStart}>
                  <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-4 rounded-lg text-lg font-semibold">
                    Lancer mon projet photovoltaïque
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents administratifs</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Déclaration préalable de travaux ou permis de construire
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Pièce d'identité du propriétaire du logement
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Justificatif de propriété ou autorisation du propriétaire
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Dernière facture d'électricité avec numéro PDL
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Convention d'autoconsommation ou contrat d'achat EDF OA
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents techniques</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Schéma électrique unifilaire de l'installation
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Certificats de conformité des panneaux et onduleurs
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Photos de la toiture et de l'implantation prévue
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Note de dimensionnement avec puissance installée
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Attestation Consuel pour mise en service
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
                  <div className="flex-shrink-0 w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">2-3 sem</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Étude technique et dossier administratif
                    </h3>
                    <p className="text-gray-600">
                      Réalisation de l'étude de faisabilité sur votre toiture, calcul du dimensionnement optimal, constitution du dossier complet avec demande de raccordement Enedis et convention d'autoconsommation ou contrat EDF OA selon votre choix.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">4-6 sem</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Instruction par Enedis et validation
                    </h3>
                    <p className="text-gray-600">
                      Enedis examine votre dossier technique, vérifie la conformité de l'installation prévue, valide la puissance de raccordement et établit la proposition de raccordement. Ce délai peut varier selon la charge de travail d'Enedis dans votre région.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">1-2 sem</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Installation des panneaux et raccordement
                    </h3>
                    <p className="text-gray-600">
                      Pose des panneaux solaires sur votre toiture, installation de l'onduleur et du coffret de protection AC, raccordement au tableau électrique existant et mise en place du système de monitoring pour suivre votre production en temps réel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">5-7j</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Mise en service et activation production
                    </h3>
                    <p className="text-gray-600">
                      Après obtention du Consuel, intervention d'Enedis pour poser le compteur de production Linky (si nécessaire), activation du système et début de la production d'électricité solaire. Vous commencez immédiatement à bénéficier de votre installation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Avantages */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accompagnement complet</h3>
              <p className="text-gray-600">Prise en charge de toutes les démarches administratives Enedis et EDF OA de A à Z</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Délais optimisés</h3>
              <p className="text-gray-600">Raccordement rapide grâce à notre expertise et nos relations privilégiées avec Enedis</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Experts qualifiés RGE</h3>
              <p className="text-gray-600">Équipe spécialisée certifiée dans l'installation photovoltaïque et le raccordement</p>
            </div>
          </div>

          {/* FAQ Section */}
          <FaqSection 
            items={faqItems}
            pageTitle="Raccordement Photovoltaïques"
          />
        </div>

        {/* Trust Section */}
        <TrustSection />
      </Layout>
    </>
  );
}
