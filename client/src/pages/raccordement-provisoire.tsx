import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation";
import { ProfessionalHeader } from "@/components/professional-header";
import { ProfessionalFooter } from "@/components/professional-footer";
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
        <title>Raccordement Provisoire Enedis – Démarches et Demande en Ligne | Portail Électricité</title>
        <meta 
          name="description" 
          content="Demande de raccordement provisoire Enedis pour chantier. Dossier complet et conforme, accompagnement administratif et paiement sécurisé." 
        />
        <link rel="canonical" href="https://portail-electricite.com/raccordement-provisoire" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Raccordement Provisoire Enedis – Démarches et Demande en Ligne" />
        <meta property="og:description" content="Demande de raccordement provisoire Enedis pour chantier. Dossier complet et conforme, accompagnement administratif et paiement sécurisé." />
        <meta property="og:url" content="https://portail-electricite.com/raccordement-provisoire" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Raccordement Provisoire Enedis – Démarches et Demande en Ligne" />
        <meta name="twitter:description" content="Demande de raccordement provisoire Enedis pour chantier. Dossier complet et conforme, accompagnement administratif et paiement sécurisé." />

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
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Professional Header */}
        <ProfessionalHeader />

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

        {/* Hero Section - Above the Fold */}
        <section className="bg-white py-8 md:py-12" style={{ maxHeight: "65vh" }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column */}
              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Raccordement Provisoire Enedis – Démarches et Demande en Ligne
                </h1>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  Solution temporaire pour l'alimentation électrique de vos chantiers. Dossier conforme aux exigences Enedis, avec accompagnement administratif complet.
                </p>

                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Installation mise en œuvre après validation Enedis
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Durée limitée (jusqu'à 12 mois)
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Puissance adaptée aux besoins du chantier
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Gestion complète du dossier administratif
                  </li>
                </ul>

                <div className="space-y-4 pt-4">
                  <Link 
                    href="/raccordement-enedis#formulaire-raccordement"
                    className="inline-block"
                    onClick={handlePrimaryCta}
                  >
                    <Button
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-h-12"
                      aria-label="Faire ma demande de raccordement provisoire Enedis"
                    >
                      Faire ma demande
                    </Button>
                  </Link>

                  <div className="md:hidden">
                    <a 
                      href="tel:+33970709570" 
                      className="text-blue-600 hover:text-blue-800 font-medium underline block mt-3"
                      aria-label="Appeler le 09 70 70 95 70"
                    >
                      09 70 70 95 70
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column - CTA Card */}
              <div className="lg:pl-8">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 text-center">
                      Demandez votre raccordement provisoire
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link 
                      href="/raccordement-enedis#formulaire-raccordement"
                      className="block"
                      onClick={handlePrimaryCta}
                    >
                      <Button
                        size="lg"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold rounded-lg min-h-12"
                        aria-label="Faire ma demande de raccordement provisoire"
                      >
                        Faire ma demande
                      </Button>
                    </Link>

                    <a 
                      href="tel:+33970709570" 
                      className="block text-center text-blue-600 hover:text-blue-800 font-medium py-2"
                      aria-label="Appeler le 09 70 70 95 70"
                    >
                      09 70 70 95 70
                    </a>

                    <Link 
                      href="/contact" 
                      className="block text-center text-gray-600 hover:text-gray-800 font-medium py-2"
                    >
                      Nous contacter
                    </Link>

                    <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                      <p>Service certifié professionnel</p>
                      <p>Paiement 100 % sécurisé</p>
                      <p>Dossier conforme Enedis</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Comment procéder Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Comment procéder pour votre raccordement provisoire Enedis
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Soumission de votre demande en ligne
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Remplissez notre formulaire sécurisé avec les informations de votre projet et vos coordonnées. Toutes les données sont traitées de manière confidentielle.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Vérification et constitution du dossier
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nos experts vérifient votre demande et constituent un dossier complet conforme aux exigences Enedis pour votre raccordement provisoire.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transmission à Enedis et suivi administratif
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nous transmettons votre dossier à Enedis et assurons le suivi complet de votre demande jusqu'à la mise en service de votre installation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documents nécessaires Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
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

        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Questions fréquentes sur le raccordement provisoire Enedis
              </h2>

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

        {/* Internal Links Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Découvrez nos autres services
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/raccordement-definitif" className="group">
                  <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      Raccordement définitif
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Solution permanente pour votre installation électrique
                    </p>
                  </div>
                </Link>

                <Link href="/viabilisation-terrain" className="group">
                  <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      Viabilisation de terrain
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Raccordement électrique pour terrains constructibles
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 bg-blue-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Prêt à démarrer votre raccordement provisoire ?
              </h2>
              <p className="text-lg text-blue-100">
                Bénéficiez de notre expertise pour un dossier conforme aux exigences Enedis
              </p>
              <Link 
                href="/raccordement-enedis#formulaire-raccordement"
                onClick={handlePrimaryCta}
              >
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-lg min-h-12"
                  aria-label="Commencer ma demande de raccordement provisoire"
                >
                  Commencer ma demande
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Professional Footer */}
        <ProfessionalFooter />
      </div>
    </>
  );
}