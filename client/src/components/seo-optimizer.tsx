import { useEffect } from "react";
import { Helmet } from "react-helmet";

// Interface pour les données SEO
interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schema?: object;
  noindex?: boolean;
  nofollow?: boolean;
}

// Composant SEO principal
export const SEOOptimizer = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = "/images/og-default.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  schema,
  noindex = false,
  nofollow = false
}: SEOData) => {
  const fullTitle = title.includes("Raccordement-Elec.fr") 
    ? title 
    : `${title} | Raccordement-Elec.fr`;

  const defaultKeywords = "raccordement électrique, Enedis, branchement électrique, compteur Linky, raccordement maison, électricité, France";
  const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Titre et description */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Robots directives */}
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      
      {/* URL canonique */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Raccordement-Elec.fr" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Données structurées */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      
      {/* Meta tags additionnels pour l'optimisation */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      <meta name="geo.region" content="FR" />
      <meta name="geo.placename" content="France" />
    </Helmet>
  );
};

// Hook pour le suivi des interactions utilisateur
export const useUserEngagement = () => {
  useEffect(() => {
    let startTime = Date.now();
    let maxScroll = 0;
    let interactions = 0;

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScroll = Math.max(maxScroll, scrollPercent);
    };

    const trackInteraction = () => {
      interactions++;
    };

    const trackEngagement = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      // Envoyer les métriques d'engagement
      if (window.gtag) {
        window.gtag('event', 'user_engagement', {
          engagement_time_msec: timeSpent * 1000,
          scroll_depth: maxScroll,
          interactions: interactions
        });
      }
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
    window.addEventListener('click', trackInteraction);
    window.addEventListener('beforeunload', trackEngagement);

    return () => {
      window.removeEventListener('scroll', trackScroll);
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('beforeunload', trackEngagement);
    };
  }, []);
};

// Composant pour les données structurées locales
export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Raccordement-Elec.fr",
    "description": "Service professionnel de raccordement électrique Enedis en France",
    "url": "https://portail-electricite.com",
    "telephone": "09 70 70 95 70",
    "priceRange": "€€",
    "areaServed": {
      "@type": "Country",
      "name": "France"
    },
    "serviceType": [
      "Raccordement électrique Enedis",
      "Branchement électrique",
      "Installation compteur Linky",
      "Viabilisation terrain"
    ],
    "openingHours": "Mo-Fr 09:00-18:00",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "234",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// Composant pour optimiser les images pour le SEO
export const SEOImage = ({
  src,
  alt,
  title,
  className,
  width,
  height,
  loading = "lazy"
}: {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}) => (
  <img
    src={src}
    alt={alt}
    title={title || alt}
    className={className}
    width={width}
    height={height}
    loading={loading}
    decoding="async"
  />
);

// Hook pour optimiser les Core Web Vitals
export const useCoreWebVitals = () => {
  useEffect(() => {
    // Optimiser les images lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }

    // Optimiser les ressources critiques
    const prefetchCriticalResources = () => {
      const criticalPaths = ['/api/stats', '/api/forms'];
      criticalPaths.forEach(path => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        document.head.appendChild(link);
      });
    };

    // Retarder l'exécution non critique
    requestIdleCallback ? 
      requestIdleCallback(prefetchCriticalResources) : 
      setTimeout(prefetchCriticalResources, 1000);

  }, []);
};

// Composant de breadcrumb pour le SEO
export const SEOBreadcrumb = ({ 
  items 
}: { 
  items: Array<{ name: string; url?: string }> 
}) => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `https://portail-electricite.com${item.url}` : undefined
    }))
  };

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-sm text-gray-600 mb-4">
        <ol className="flex space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {item.url ? (
                <a href={item.url} className="hover:text-blue-600">
                  {item.name}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </>
  );
};