import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, MapPin, Phone, Clock, Mail, CheckCircle } from "lucide-react";
import regionsData from "../../../content/geo/regions.json";

interface CityData {
  name: string;
  slug: string;
  region: string;
  region_name: string;
  postal_codes: string[];
  meta_title: string;
  meta_description: string;
  canonical: string;
  nap: {
    business_name: string;
    address: string;
    phone: string;
    email: string;
    hours: Record<string, string>;
  };
  adjacent_cities: string[];
  hero: {
    h1: string;
    subtitle: string;
    trust_indicators: string[];
  };
  content: {
    intro: string;
    process: string;
    benefits: string;
    local_expertise: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  schema_data: {
    local_business_id: string;
    service_area: string;
    geo_coordinates: {
      latitude: string;
      longitude: string;
    };
  };
}

export default function RaccordementCity() {
  const params = useParams();
  const citySlug = params.city as string;
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCityData = async () => {
      try {
        // Find the region that contains this city
        const region = Object.entries(regionsData).find(([_, regionData]) => 
          regionData.cities.includes(citySlug)
        );

        if (!region) {
          setError("Ville non trouvée");
          setLoading(false);
          return;
        }

        const [regionSlug] = region;
        
        // Load city data
        const response = await fetch(`/content/geo/cities/${regionSlug}/${citySlug}.json`);
        if (!response.ok) {
          throw new Error("Données de la ville non trouvées");
        }
        
        const data = await response.json();
        setCityData(data);
      } catch (err) {
        console.error("Error loading city data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadCityData();
  }, [citySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !cityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Ville non trouvée"}</h1>
          <Link href="/raccordement/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const adjacentCitiesLinks = cityData.adjacent_cities.map(slug => ({
    slug,
    name: slug.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  return (
    <>
      <Helmet>
        <title>{cityData.meta_title}</title>
        <meta name="description" content={cityData.meta_description} />
        <meta name="keywords" content={`raccordement électrique, ${cityData.name}, enedis, ${cityData.postal_codes.join(', ')}`} />
        <link rel="canonical" href={`${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}${cityData.canonical}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={cityData.meta_title} />
        <meta property="og:description" content={cityData.meta_description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}${cityData.canonical}`} />
        <meta property="og:site_name" content="Raccordement-Connect.com" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={cityData.meta_title} />
        <meta name="twitter:description" content={cityData.meta_description} />
        
        {/* LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": cityData.schema_data.local_business_id,
            "name": cityData.nap.business_name,
            "description": `Service de raccordement électrique professionnel à ${cityData.name}`,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": cityData.nap.address.split(',')[0],
              "addressLocality": cityData.name,
              "addressRegion": cityData.region_name,
              "addressCountry": "FR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": cityData.schema_data.geo_coordinates.latitude,
              "longitude": cityData.schema_data.geo_coordinates.longitude
            },
            "telephone": cityData.nap.phone,
            "email": cityData.nap.email,
            "serviceArea": cityData.schema_data.service_area,
            "priceRange": "€€",
            "openingHours": Object.entries(cityData.nap.hours).map(([day, hours]) => {
              const dayMap: Record<string, string> = {
                monday: "Mo", tuesday: "Tu", wednesday: "We", 
                thursday: "Th", friday: "Fr", saturday: "Sa", sunday: "Su"
              };
              return hours !== "Fermé" ? `${dayMap[day]} ${hours}` : null;
            }).filter(Boolean)
          })}
        </script>

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": cityData.faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>

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
                "item": `${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}/raccordement/`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": cityData.region_name,
                "item": `${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}/raccordement/${cityData.region}/`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": cityData.name,
                "item": `${import.meta.env.VITE_SITE_URL || 'https://www.raccordement-connect.com'}${cityData.canonical}`
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <nav className="bg-gray-50 border-b py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/raccordement/" className="hover:text-blue-600">
                Raccordement Électrique
              </Link>
              <span>/</span>
              <Link href={`/raccordement/${cityData.region}/`} className="hover:text-blue-600">
                {cityData.region_name}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{cityData.name}</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link href={`/raccordement/${cityData.region}/`} className="inline-flex items-center text-blue-200 hover:text-white mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à {cityData.region_name}
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {cityData.hero.h1}
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6">
                {cityData.hero.subtitle}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {cityData.hero.trust_indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{indicator.replace('✅ ', '')}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                onClick={() => window.scrollTo({ top: document.getElementById('contact-form')?.offsetTop || 0, behavior: 'smooth' })}
              >
                Commencer ma demande
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Raccordement électrique à {cityData.name}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {cityData.content.intro}
                  </p>
                </section>

                {/* Process */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Notre processus à {cityData.name}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {cityData.content.process}
                  </p>
                </section>

                {/* Benefits */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Pourquoi nous choisir ?
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {cityData.content.benefits}
                  </p>
                </section>

                {/* Local Expertise */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Expertise locale
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {cityData.content.local_expertise}
                  </p>
                </section>

                {/* FAQs */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Questions fréquentes à {cityData.name}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {cityData.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>

                {/* Adjacent Cities */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Nos services dans les villes proches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {adjacentCitiesLinks.map((city) => (
                      <Link key={city.slug} href={`/raccordement/${city.slug}/`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{city.name}</span>
                              <Badge variant="outline" className="text-xs">Disponible</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                      Contact local
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold text-gray-900">{cityData.nap.business_name}</p>
                      <p className="text-sm text-gray-600">{cityData.nap.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{cityData.nap.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{cityData.nap.email}</span>
                    </div>
                    <div>
                      <p className="font-medium mb-2 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-600" />
                        Horaires
                      </p>
                      <div className="text-sm space-y-1">
                        {Object.entries(cityData.nap.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day === 'monday' ? 'Lundi' : 
                              day === 'tuesday' ? 'Mardi' : 
                              day === 'wednesday' ? 'Mercredi' : 
                              day === 'thursday' ? 'Jeudi' : 
                              day === 'friday' ? 'Vendredi' : 
                              day === 'saturday' ? 'Samedi' : 'Dimanche'}</span>
                            <span>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Contact Form */}
                <Card id="contact-form">
                  <CardHeader>
                    <CardTitle>Commencer ma demande de raccordement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Votre nom"
                          data-testid="input-nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Téléphone *</label>
                        <input 
                          type="tel" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Votre téléphone"
                          data-testid="input-telephone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Votre email"
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type de projet *</label>
                        <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" data-testid="select-type-projet">
                          <option value="">Sélectionnez</option>
                          <option value="particulier">Particulier</option>
                          <option value="professionnel">Professionnel</option>
                          <option value="collectivite">Collectivité</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-submit-demande">
                        Commencer ma demande
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Réponse sous 24h • Accompagnement complet
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}