import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { MapPin, Phone, Clock, ArrowRight, CheckCircle, Zap, Building, Home as HomeIcon, Users, Star, Shield } from "lucide-react";

interface CityData {
  name: string;
  slug: string;
  postalCodes: string[];
  population: string;
  region: string;
  description: string;
  localInfo: string;
  nearbyAreas: string[];
}

interface CityLandingPageProps {
  cityData: CityData;
}

export function CityLandingPageTemplate({ cityData }: CityLandingPageProps) {
  const { name, slug, postalCodes, population, region, description, localInfo, nearbyAreas } = cityData;
  
  return (
    <>
      <Helmet>
        <title>Raccordement Électrique Enedis {name} | Service Rapide et Professionnel</title>
        <meta name="description" content={`Service expert de raccordement électrique Enedis à ${name} (${region}). Branchement électrique, déplacement compteur Linky, augmentation de puissance. Accompagnement complet pour particuliers et professionnels.`} />
        <meta name="keywords" content={`raccordement Enedis ${name}, branchement électrique ${name}, compteur Linky ${name}, raccordement électricité ${postalCodes.join(' ')}, électricien ${name}, raccordement ERDF ${name}, installation électrique ${region}`} />
        
        <meta property="og:title" content={`Raccordement Électrique Enedis ${name} | Service Rapide et Professionnel`} />
        <meta property="og:description" content={`Service expert de raccordement électrique Enedis à ${name}. Branchement électrique, déplacement de compteur Linky, augmentation de puissance.`} />
        <meta property="og:url" content={`https://www.raccordement-connect.com/raccordement-electrique-${slug}`} />
        <link rel="canonical" href={`https://www.raccordement-connect.com/raccordement-electrique-${slug}`} />
        
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
                "name": "Services",
                "item": "https://www.raccordement-connect.com/nos-services"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Raccordement ${name}",
                "item": "https://www.raccordement-connect.com/raccordement-electrique-${slug}"
              }
            ]
          }
        `}</script>

        {/* Local Business JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Services de Raccordement Enedis ${name}",
            "description": "Services professionnels de raccordement électrique Enedis à ${name} - Branchement, compteur Linky et modifications de puissance.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "${name}",
              "addressRegion": "${region}",
              "postalCode": "${postalCodes.join(', ')}",
              "addressCountry": "FR"
            },
            "telephone": "+33 9 70 70 95 70",
            "url": "https://www.raccordement-connect.com/raccordement-electrique-${slug}",
            "priceRange": "€€",
            "serviceArea": {
              "@type": "City",
              "name": "${name}"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Services de Raccordement Électrique",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Raccordement Électrique Nouveau",
                    "description": "Nouveau raccordement électrique pour maisons et locaux professionnels"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Déplacement Compteur Linky",
                    "description": "Déplacement et modification de compteur électrique existant"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Augmentation de Puissance",
                    "description": "Modification et augmentation de la puissance électrique"
                  }
                }
              ]
            }
          }
        `}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-red-50/20">
        
        {/* Hero Section Localisé */}
        <section className="bg-gradient-to-br from-[#0046a2] to-[#0056c4] text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-blue-100">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/nos-services" className="hover:text-white transition-colors">Services</Link>
                </li>
                <li>/</li>
                <li className="text-white font-medium">Raccordement {name}</li>
              </ol>
            </nav>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 mb-6 border border-white/20">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Service local - {region}</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Raccordement Électrique Enedis à <span className="text-yellow-300">{name}</span>
                </h1>
                
                <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                  {description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/raccordement-enedis#formulaire-raccordement" data-testid="link-demarrer-demande-hero">
                    <Button className="bg-white text-[#0046a2] font-semibold px-8 py-4 rounded-lg text-lg hover:bg-blue-50 transition-colors shadow-lg" data-testid="button-demarrer-demande-hero">
                      <Zap className="w-5 h-5 mr-2" />
                      Démarrer ma demande
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="tel:0970709570" data-testid="link-phone-hero">
                    <Button variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg text-lg hover:bg-white/20 transition-all" data-testid="button-phone-hero">
                      <Phone className="w-5 h-5 mr-2" />
                      09 70 70 95 70
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span>Service local {name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-yellow-300" />
                    <span>Réponse sous 24h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-300" />
                    <span>100% Sécurisé</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-6">Zone d'intervention {name}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Population:</span>
                      <span className="font-semibold">{population}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Région:</span>
                      <span className="font-semibold">{region}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Codes postaux:</span>
                      <span className="font-semibold">{postalCodes.slice(0, 3).join(', ')}{postalCodes.length > 3 ? '...' : ''}</span>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-sm text-blue-100">
                        {nearbyAreas.length > 0 && `Également : ${nearbyAreas.slice(0, 3).join(', ')}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section Localisée */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nos Services de Raccordement à <span className="text-[#0072CE]">{name}</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {localInfo}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Maisons Individuelles</h3>
                <p className="text-gray-600 mb-6">
                  Raccordement électrique complet pour les nouvelles constructions et rénovations à {name}.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Étude personnalisée</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Installation complète</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Mise en service</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Locaux Professionnels</h3>
                <p className="text-gray-600 mb-6">
                  Solutions électriques adaptées aux entreprises et commerces de {name}.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Forte puissance</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Triphasé</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Solutions sur mesure</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Modification & Dépannage</h3>
                <p className="text-gray-600 mb-6">
                  Modification de puissance et déplacement de compteur Linky à {name}.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Augmentation puissance</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Déplacement compteur</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Mise aux normes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Zone de Couverture */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Zone de Couverture - {name} et Environs
              </h2>
              <p className="text-xl text-gray-600">
                Nous intervenons dans toute l'agglomération de {name} et les communes environnantes.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Codes Postaux Couverts</h3>
                <div className="grid grid-cols-3 gap-3">
                  {postalCodes.map((code, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-center font-semibold text-blue-600 border border-blue-100">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Communes Environnantes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nearbyAreas.map((area, index) => (
                    <div key={index} className="flex items-center">
                      <MapPin className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages Locaux */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ce que disent nos clients de {name}
              </h2>
              <div className="flex justify-center items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-700">4.9/5 • 127 avis</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Excellent service pour notre raccordement à {name}. Équipe professionnelle et délais respectés."
                </p>
                <div className="font-semibold text-gray-900">Marie D. - {name}</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Raccordement professionnel réalisé rapidement. Je recommande pour tous travaux électriques sur {name}."
                </p>
                <div className="font-semibold text-gray-900">Jean-Pierre M. - {name}</div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Déplacement de compteur effectué sans problème. Service client très réactif pour {name}."
                </p>
                <div className="font-semibold text-gray-900">Sophie L. - {name}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-[#0046a2] to-[#0056c4] text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt pour votre raccordement électrique à {name} ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Démarrez dès maintenant votre demande de raccordement Enedis. Accompagnement personnalisé et service local.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/raccordement-enedis#formulaire-raccordement" data-testid="link-commencer-demande-cta">
                <Button className="bg-white text-[#0046a2] font-semibold px-8 py-4 rounded-lg text-lg hover:bg-blue-50 transition-colors shadow-lg" data-testid="button-commencer-demande-cta">
                  <Zap className="w-5 h-5 mr-2" />
                  Commencer ma demande
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="tel:0970709570" data-testid="link-phone-cta">
                <Button variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg text-lg hover:bg-white/20 transition-all" data-testid="button-phone-cta">
                  <Phone className="w-5 h-5 mr-2" />
                  09 70 70 95 70
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span>Service local {name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-300" />
                  <span>+500 clients satisfaits</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-yellow-300" />
                  <span>Garantie qualité</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}