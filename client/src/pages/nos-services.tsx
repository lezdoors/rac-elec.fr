import { Link } from "wouter";
import { 
  Home, 
  Zap, 
  Wrench, 
  Settings, 
  Sun, 
  Building, 
  ArrowRight,
  CheckCircle,
  Clock,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout";
import { Helmet } from "react-helmet";

export default function NosServicesPage() {
  const services = [
    {
      id: "raccordement-maison-neuve",
      title: "Raccordement Maison Neuve",
      description: "Raccordement électrique complet pour votre nouvelle construction avec accompagnement personnalisé.",
      icon: Home,
      features: [
        "Étude de faisabilité incluse",
        "Installation compteur Linky",
        "Viabilisation terrain si nécessaire"
      ],
      duration: "15-30 jours",
      link: "/raccordement-maison-neuve",
      popular: true
    },
    {
      id: "raccordement-definitif",
      title: "Raccordement Définitif",
      description: "Raccordement permanent au réseau Enedis pour tous types de bâtiments et installations.",
      icon: Zap,
      features: [
        "Raccordement permanent",
        "Toutes puissances disponibles",
        "Conformité réglementaire",
        "Garantie constructeur"
      ],
      duration: "20-45 jours",
      link: "/raccordement-definitif",
      popular: false
    },
    {
      id: "raccordement-provisoire",
      title: "Raccordement Provisoire",
      description: "Solution temporaire pour chantiers, événements ou installations provisoires.",
      icon: Settings,
      features: [
        "Installation rapide",
        "Durée flexible",
        "Matériel fourni",
        "Démontage inclus"
      ],
      duration: "5-10 jours",
      link: "/raccordement-provisoire",
      popular: false
    },
    {
      id: "viabilisation-terrain",
      title: "Viabilisation de Terrain",
      description: "Préparation complète de votre terrain pour le raccordement aux réseaux électriques.",
      icon: Building,
      features: [
        "Étude géotechnique",
        "Tranchées et passages",
        "Raccordement multi-réseaux",
        "Coordination travaux"
      ],
      duration: "30-60 jours",
      link: "/viabilisation-terrain",
      popular: false
    },
    {
      id: "panneau-solaire",
      title: "Raccordement Solaire",
      description: "Raccordement de vos panneaux solaires au réseau avec revente d'électricité.",
      icon: Sun,
      features: [
        "Raccordement photovoltaïque",
        "Contrat de rachat EDF",
        "Compteur production",
        "Mise en service"
      ],
      duration: "25-40 jours",
      link: "/raccordement-panneau-solaire",
      popular: true
    },
    {
      id: "modification-compteur",
      title: "Modification Compteur",
      description: "Changement de puissance, déplacement ou remplacement de votre compteur électrique.",
      icon: Wrench,
      features: [
        "Augmentation de puissance",
        "Déplacement compteur",
        "Remplacement Linky",
        "Mise aux normes"
      ],
      duration: "10-20 jours",
      link: "/modification-compteur",
      popular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>Nos Services de Raccordement Électrique | Enedis</title>
        <meta name="description" content="Découvrez tous nos services de raccordement électrique Enedis : maison neuve, définitif, provisoire, viabilisation, solaire et modification compteur." />
      </Helmet>
      
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
          {/* Hero Section - Professional enterprise design */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB]">
            <div className="container mx-auto px-4 py-16 md:py-20">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Nos Services de Raccordement Électrique
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-8">
                  Solutions complètes pour tous vos besoins de raccordement au réseau Enedis
                </p>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Service agréé Enedis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-200" />
                    <span>Intervention rapide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-200" />
                    <span>Support dédié</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card key={service.id} className="relative hover:shadow-lg transition-all duration-300 group">
                    <CardHeader className="pb-4">
                      <div className="mb-2">
                        <CardTitle className="text-lg mb-2">{service.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-gray-600 mb-4">
                        {service.description}
                      </CardDescription>
                      
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href={service.link}>
                        <Button className="w-full group/btn">
                          En savoir plus
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Besoin d'aide pour choisir ?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Nos experts vous conseillent pour déterminer la solution la plus adaptée à votre projet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="px-8">
                    <Phone className="h-5 w-5 mr-2" />
                    Nous contacter
                  </Button>
                </Link>
                <Link href="/raccordement-enedis">
                  <Button size="lg" variant="outline" className="px-8">
                    Commencer ma demande
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Process Section */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-gray-600">
                Un processus simple et transparent en 4 étapes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Demande en ligne",
                  description: "Remplissez notre formulaire sécurisé en quelques minutes"
                },
                {
                  step: "2", 
                  title: "Étude personnalisée",
                  description: "Nos experts analysent votre projet et vous proposent la meilleure solution"
                },
                {
                  step: "3",
                  title: "Validation Enedis",
                  description: "Nous nous occupons de toutes les démarches administratives"
                },
                {
                  step: "4",
                  title: "Mise en service",
                  description: "Intervention technique et mise en service de votre installation"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}