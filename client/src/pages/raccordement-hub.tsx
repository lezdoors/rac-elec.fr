import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Phone, Clock, CheckCircle } from "lucide-react";
import regionsData from "../../../content/geo/regions.json";

export default function RaccordementHub() {
  const regions = Object.values(regionsData);

  return (
    <>
      <Helmet>
        <title>Raccordement Électrique France | Service Enedis National</title>
        <meta name="description" content="Service de raccordement électrique professionnel dans toute la France ⚡ Experts Enedis agréés, réponse sous 48h. Particuliers et professionnels." />
        <meta name="keywords" content="raccordement électrique, enedis, france, demande, expert, professionnel" />
        <link rel="canonical" href={`${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}/raccordement/`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Raccordement Électrique France | Service Enedis National" />
        <meta property="og:description" content="Service de raccordement électrique professionnel dans toute la France ⚡ Experts Enedis agréés, réponse sous 48h." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}/raccordement/`} />
        
        {/* Schema.org Service Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Raccordement Électrique France",
            "description": "Service professionnel de raccordement électrique Enedis dans toute la France",
            "provider": {
              "@type": "Organization",
              "name": "Raccordement Connect",
              "url": "https://www.raccordement-connect.com"
            },
            "areaServed": {
              "@type": "Country",
              "name": "France"
            },
            "serviceType": "Raccordement électrique Enedis"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Raccordement Électrique dans Toute la France
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Service professionnel Enedis pour particuliers et entreprises. Experts agréés dans toutes les régions françaises.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Experts agréés</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Réponse sous 48h</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Toute la France</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Support dédié</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
                onClick={() => window.scrollTo({ top: document.getElementById('regions')?.offsetTop || 0, behavior: 'smooth' })}
              >
                Trouvez votre région
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Regions Grid */}
        <section id="regions" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sélectionnez votre région
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Nos experts interviennent dans toutes les régions françaises. 
                  Cliquez sur votre région pour découvrir nos services locaux.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regions.map((region) => (
                  <Card key={region.slug} className="hover:shadow-lg transition-shadow duration-300 group">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{region.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {region.cities.length} villes
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {region.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <strong>Principales villes :</strong>
                          <div className="mt-1">
                            {region.cities.slice(0, 4).map((city, index) => (
                              <span key={city} className="capitalize">
                                {city.replace('-', ' ')}{index < 3 && index < region.cities.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                            {region.cities.length > 4 && <span>...</span>}
                          </div>
                        </div>
                        
                        <Link href={`/raccordement/${region.slug}/`}>
                          <Button className="w-full group-hover:bg-blue-700 transition-colors">
                            Voir les villes
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
                Besoin d'un raccordement électrique ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nos experts vous accompagnent dans toutes vos démarches Enedis. 
                Accompagnement complet et réponse sous 48h.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/raccordement-enedis">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Commencer ma demande
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 h-5 w-5" />
                  01 83 62 41 33
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}