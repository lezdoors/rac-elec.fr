import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, MapPin, Phone, Clock, CheckCircle } from "lucide-react";
import regionsData from "../../../content/geo/regions.json";

interface RegionData {
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  cities: string[];
}

export default function RaccordementRegion() {
  const params = useParams();
  const regionSlug = params.region as string;
  
  const regionData = regionsData[regionSlug as keyof typeof regionsData] as RegionData;
  
  if (!regionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Région non trouvée</h1>
          <Link href="/raccordement/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cities = regionData.cities.map(citySlug => ({
    slug: citySlug,
    name: citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-'),
    displayName: citySlug.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  return (
    <>
      <Helmet>
        <title>{regionData.meta_title}</title>
        <meta name="description" content={regionData.meta_description} />
        <meta name="keywords" content={`raccordement électrique, ${regionData.name}, enedis, ${regionData.cities.join(', ')}`} />
        <link rel="canonical" href={`${import.meta.env.VITE_SITE_URL || 'https://www.demande-raccordement.fr'}/raccordement/${regionSlug}/`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={regionData.meta_title} />
        <meta property="og:description" content={regionData.meta_description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${import.meta.env.VITE_SITE_URL || 'https://www.demande-raccordement.fr'}/raccordement/${regionSlug}/`} />
        <meta property="og:site_name" content="demande-raccordement.fr" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={regionData.meta_title} />
        <meta name="twitter:description" content={regionData.meta_description} />
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Raccordement Électrique",
                "item": `${import.meta.env.VITE_SITE_URL || 'https://www.demande-raccordement.fr'}/raccordement/`
              },
              {
                "@type": "ListItem", 
                "position": 2,
                "name": regionData.name,
                "item": `${import.meta.env.VITE_SITE_URL || 'https://www.demande-raccordement.fr'}/raccordement/${regionSlug}/`
              }
            ]
          })}
        </script>

        {/* Region Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Raccordement Électrique ${regionData.name}`,
            "description": regionData.description,
            "provider": {
              "@type": "Organization",
              "name": "Raccordement Connect"
            },
            "areaServed": {
              "@type": "AdministrativeArea",
              "name": regionData.name
            },
            "serviceType": "Raccordement électrique Enedis"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumb */}
        <nav className="bg-white border-b py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/raccordement/" className="hover:text-blue-600">
                Raccordement Électrique
              </Link>
              <span>/</span>
              <span className="text-gray-900">{regionData.name}</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link href="/raccordement/" className="inline-flex items-center text-blue-200 hover:text-white mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux régions
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Raccordement Électrique en {regionData.name}
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6">
                {regionData.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Expert régional</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Réponse sous 48h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-sm">{regionData.cities.length} villes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Support local</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Nos services dans {regionData.cities.length} villes
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Sélectionnez votre ville pour obtenir des informations spécifiques 
                  et commencer votre demande de raccordement électrique.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <Card key={city.slug} className="hover:shadow-lg transition-all duration-300 group hover:border-blue-300">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{city.displayName}</span>
                        <Badge variant="outline" className="text-xs">
                          Disponible
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Service de raccordement électrique professionnel à {city.displayName}. 
                        Expert local agréé Enedis.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>✅ Expert local agréé</span>
                          <span>✅ Accompagnement complet</span>
                        </div>
                        
                        <Link href={`/raccordement/${city.slug}/`}>
                          <Button className="w-full group-hover:bg-blue-700 transition-colors">
                            Voir les détails
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Besoin d'aide pour votre projet ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nos experts en {regionData.name} vous accompagnent dans toutes vos démarches Enedis.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/raccordement-enedis">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Commencer ma demande
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 h-5 w-5" />
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}