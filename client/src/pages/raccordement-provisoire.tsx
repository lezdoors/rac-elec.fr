import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import Layout from "@/components/layout";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RaccordementProvisoirePage() {
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);

  const toggleFaqItem = (itemId: number) => {
    if (openFaqItems.includes(itemId)) {
      setOpenFaqItems([]);
    } else {
      setOpenFaqItems([itemId]);
    }
  };

  const handlePrimaryCta = () => {
    // Trigger Google Ads form_start conversion
    if (typeof window !== 'undefined' && (window as any).triggerFormStartConversion) {
      try {
        (window as any).triggerFormStartConversion();
        console.log('✅ Form start conversion triggered from raccordement provisoire CTA');
      } catch (error) {
        console.error('❌ Error triggering form start conversion:', error);
      }
    }
  };

  const faqItems = [
    {
      id: 1,
      question: "Qu'est-ce qu'un raccordement provisoire ?",
      answer: "Un raccordement provisoire est une installation électrique temporaire permettant d'alimenter un chantier, un événement ou toute autre activité nécessitant une alimentation limitée dans le temps. Il est mis en place pour une durée définie, généralement pendant la phase de travaux, avant un raccordement définitif."
    },
    {
      id: 2,
      question: "Quels documents fournir ?",
      answer: "Pour constituer le dossier, les pièces suivantes sont généralement nécessaires :\n\n• Pièce d'identité du demandeur\n• Justificatif de propriété ou d'autorisation d'occupation du terrain\n• Plan de situation et plan de masse\n• Puissance souhaitée et nature de l'installation\n\nD'autres documents peuvent être demandés par Enedis en fonction de la configuration."
    },
    {
      id: 3,
      question: "Quelle durée maximale pour un raccordement provisoire ?",
      answer: "La durée d'un raccordement provisoire est limitée à 12 mois. Une prolongation peut être demandée, sous réserve de validation par Enedis et de la justification du maintien de l'activité temporaire."
    },
    {
      id: 4,
      question: "Quelle puissance est disponible ?",
      answer: "La puissance disponible dépend des besoins déclarés et de la faisabilité technique sur le site. Les puissances les plus courantes pour les chantiers vont de 3 kVA à 36 kVA, en monophasé ou triphasé. Une étude de faisabilité peut être nécessaire pour des puissances supérieures."
    },
    {
      id: 5,
      question: "Quelle différence avec un raccordement définitif ?",
      answer: "Le raccordement provisoire est limité dans le temps et destiné à un usage temporaire. Il utilise des installations adaptées aux besoins ponctuels et peut être démonté à la fin de l'utilisation. Le raccordement définitif est permanent et conçu pour une utilisation continue de l'électricité."
    },
    {
      id: 6,
      question: "Peut-on modifier la puissance en cours d'utilisation ?",
      answer: "Oui, il est possible de demander une modification de puissance pendant la période de raccordement provisoire. Cette modification doit être validée par Enedis et peut entraîner un délai de traitement ainsi que des frais supplémentaires."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Demande de Raccordement Provisoire Enedis | Chantier</title>
        <meta 
          name="description" 
          content="Raccordement provisoire Enedis pour chantiers et événements. Démarche complète et rapide. Lancez votre demande en ligne." 
        />
        <link rel="canonical" href="https://portail-electricite.com/raccordement-provisoire" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Demande de Raccordement Provisoire Enedis | Chantier" />
        <meta property="og:description" content="Raccordement provisoire Enedis pour chantiers et événements. Démarche complète et rapide. Lancez votre demande en ligne." />
        <meta property="og:url" content="https://portail-electricite.com/raccordement-provisoire" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Demande de Raccordement Provisoire Enedis | Chantier" />
        <meta name="twitter:description" content="Raccordement provisoire Enedis pour chantiers et événements. Démarche complète et rapide." />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": "https://portail-electricite.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Nos services",
                "item": "https://portail-electricite.com/nos-services"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Raccordement provisoire",
                "item": "https://portail-electricite.com/raccordement-provisoire"
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Quelle est la durée maximale d'un raccordement provisoire ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Un raccordement provisoire Enedis peut être accordé pour une durée maximale de 12 mois, renouvelable une fois sous conditions particulières. Cette solution temporaire est idéale pour les chantiers de construction ou les événements éphémères."
                }
              },
              {
                "@type": "Question",
                "name": "Quelle puissance puis-je obtenir avec un raccordement provisoire ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "La puissance disponible varie selon vos besoins et la configuration du réseau local. Elle peut aller de 12 kVA à 250 kVA selon les contraintes techniques. Nos experts étudient votre demande pour déterminer la puissance optimale."
                }
              },
              {
                "@type": "Question",
                "name": "Combien de temps prend l'installation d'un raccordement provisoire ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Une fois le dossier validé par Enedis, l'installation prend généralement entre 4 et 8 semaines selon la complexité du projet et la disponibilité des équipes. Nous assurons le suivi complet de votre dossier."
                }
              },
              {
                "@type": "Question",
                "name": "Puis-je transformer un raccordement provisoire en définitif ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, il est possible de faire évoluer un raccordement provisoire vers un raccordement définitif en constituant un nouveau dossier adapté. Nous vous accompagnons dans cette démarche si nécessaire."
                }
              },
              {
                "@type": "Question",
                "name": "Quels sont les coûts d'un raccordement provisoire Enedis ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Les tarifs dépendent de la puissance demandée et des travaux nécessaires. Comptez entre 800€ et 3000€ selon la configuration de votre projet. Une proposition personnalisée vous sera fournie après étude de votre demande."
                }
              },
              {
                "@type": "Question",
                "name": "Quels documents sont nécessaires pour la demande ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Vous devez fournir un plan de situation, un plan de masse indiquant l'emplacement souhaité du raccordement, une pièce d'identité et l'autorisation du propriétaire du terrain si vous n'en êtes pas propriétaire."
                }
              }
            ]
          })}
        </script>

        {/* Service Schema for Transactional SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Demande de Raccordement Provisoire Enedis",
            "serviceType": "Raccordement Provisoire",
            "description": "Service de demande de raccordement provisoire Enedis pour chantiers et événements. Installation électrique temporaire avec accompagnement complet.",
            "provider": {
              "@type": "Organization",
              "name": "Portail-Electricite.com",
              "url": "https://portail-electricite.com/"
            },
            "areaServed": {
              "@type": "Country",
              "name": "France"
            },
            "offers": {
              "@type": "Offer",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
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

        {/* Centered Hero Section */}
        <section className="pt-16 pb-14 sm:pt-20 sm:pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="mx-auto max-w-3xl text-center px-4 sm:px-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Demande de Raccordement Provisoire
            </h1>
            <h2 className="mt-6 text-lg leading-8 text-gray-600">
              Raccordement provisoire Enedis pour chantiers et événements. 
              Dossier conforme aux exigences Enedis, accompagnement administratif complet.
            </h2>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link 
                href="/raccordement-enedis#formulaire-raccordement"
                onClick={handlePrimaryCta}
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

        {/* Comment ça fonctionne Section */}
        <section className="pt-16 pb-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment ça fonctionne
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Processus simplifié en 3 étapes pour votre raccordement provisoire
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Soumission de la demande en ligne
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Remplissez notre formulaire sécurisé avec les informations de votre projet. 
                  Toutes les données sont traitées de manière confidentielle.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Vérification et constitution du dossier
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Nos experts vérifient votre demande et constituent un dossier complet 
                  conforme aux exigences Enedis.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Transmission à Enedis et suivi administratif
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Nous transmettons votre dossier à Enedis et assurons le suivi complet 
                  jusqu'à la mise en service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Documents nécessaires Section */}
        <section className="pt-10 pb-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Documents nécessaires pour votre raccordement provisoire
              </h2>

              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents obligatoires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Pièce d'identité du demandeur
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de situation du terrain
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Puissance électrique demandée
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Déclaration sur l'honneur d'usage temporaire
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents complémentaires</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Autorisation du propriétaire (si locataire)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Plan de masse du chantier
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Justificatif de propriété du terrain
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Planning prévisionnel des travaux
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section with Structured Data */}
        <section className="pt-16 pb-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-lg text-gray-600">
                Trouvez des réponses à vos questions sur le raccordement provisoire Enedis
              </p>
            </div>
            <div className="max-w-4xl mx-auto">

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg">
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFaqItem(item.id)}
                      aria-expanded={openFaqItems.includes(item.id)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${
                          openFaqItems.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaqItems.includes(item.id) && (
                      <div className="px-6 pb-4">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {item.answer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Documents nécessaires Section */}
        <section className="pt-16 pb-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Documents nécessaires
              </h2>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Documents obligatoires
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• Plan de situation du terrain</li>
                  <li>• Plan de masse avec emplacement du raccordement</li>
                  <li>• Pièce d'identité du demandeur</li>
                  <li>• Formulaire de demande complété</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Documents complémentaires
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• Autorisation du propriétaire si locataire</li>
                  <li>• Photos du site d'implantation</li>
                  <li>• Plan des installations électriques prévues</li>
                  <li>• Justificatif de l'entreprise</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc de réassurance */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Service certifié professionnel
                </h3>
                <p className="text-gray-600">
                  Expertise reconnue dans les démarches Enedis
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Support 8h–18h
                </h3>
                <p className="text-gray-600">
                  Assistance téléphonique du lundi au vendredi
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Données traitées de manière confidentielle
                </h3>
                <p className="text-gray-600">
                  Protection complète de vos informations personnelles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="pt-16 pb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à démarrer votre raccordement provisoire ?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Bénéficiez de notre expertise pour un dossier conforme aux exigences Enedis.
            </p>
            <Link 
              href="/raccordement-enedis#formulaire-raccordement"
              onClick={handlePrimaryCta}
            >
              <Button className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 text-xl font-semibold rounded-lg shadow-lg">
                Commencer ma demande
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    </>
  );
}