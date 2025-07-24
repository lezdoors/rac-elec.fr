/**
 * Optimisation du Critical CSS pour améliorer le LCP (Largest Contentful Paint)
 * Ce script injecte directement les styles critiques dans la page
 * pour éviter de bloquer le rendu lors du chargement des feuilles de style externes
 */
(function() {
  // Identifier les styles critiques pour le LCP (titre principal)
  const criticalCSS = `
    /* Styles critiques pour le titre principal (LCP) */
    h1.text-5xl, 
    h1.sm\\:text-6xl,
    h1.text-white,
    h1.font-bold,
    .text-5xl.sm\\:text-6xl.text-white.font-bold,
    .text-5xl.text-white.font-bold {
      /* Optimisation du rendu */
      content-visibility: auto;
      contain-intrinsic-size: auto 120px;
      display: block !important;
      visibility: visible !important;
      font-display: swap !important;
      will-change: contents;
      translate: 0;
      
      /* Styles spécifiques pour mobile */
      font-size: calc(2rem + 1vw) !important;
      line-height: 1.2 !important;
      color: white !important;
      margin: 0 auto !important;
      padding: 0.5rem 1rem !important;
      text-align: center !important;
      max-width: 100% !important;
      overflow-wrap: break-word !important;
      background-color: #1e3a8a !important;
    }

    /* Optimisation pour le conteneur du titre */
    .hero-section, 
    .header-section,
    .bg-blue-900 {
      min-height: 250px !important;
      background-color: #1e3a8a !important;
      display: block !important;
      visibility: visible !important;
    }
    
    /* Style pour améliorer le bouton principal */
    .hero-section button,
    .header-section button,
    .cta-button,
    .btn-primary,
    .bg-blue-900 button {
      font-display: swap !important;
      background-color: #ffffff !important;
      color: #1e3a8a !important;
      border: none !important;
      border-radius: 0.375rem !important;
      padding: 0.5rem 1rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      display: inline-block !important;
      text-align: center !important;
    }
    
    @media screen and (max-width: 768px) {
      h1.text-5xl, 
      h1.sm\\:text-6xl,
      h1.text-white,
      h1.font-bold,
      .text-5xl.text-white.font-bold {
        font-size: 1.75rem !important;
        padding: 0.5rem !important;
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
        line-height: 1.3 !important;
      }
    }
  `;

  // Fonction pour injecter les styles critiques
  function injectCriticalCSS() {
    // Créer un élément style
    const style = document.createElement('style');
    style.setAttribute('id', 'critical-css');
    style.setAttribute('type', 'text/css');
    style.textContent = criticalCSS;
    
    // Insérer en haut du document pour priorité maximale
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      // Si head n'est pas encore disponible, attendre le chargement
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (document.head) {
            document.head.insertBefore(style, document.head.firstChild);
            observer.disconnect();
          }
        });
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Cache chaude pour le titre principal (pré-rendu instantané)
  function createInstantCacheForTitle() {
    // Créer un élément temporaire pour le titre principal
    const preRenderedTitleContainer = document.createElement('div');
    preRenderedTitleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #1e3a8a;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      z-index: 9999;
      transform: translateY(0);
      transition: transform 0.5s ease;
      display: none;
    `;
    preRenderedTitleContainer.setAttribute('aria-hidden', 'true');
    preRenderedTitleContainer.setAttribute('id', 'pre-rendered-lcp');
    preRenderedTitleContainer.textContent = "Portail en ligne de demande de raccordement Enedis";
    
    // Ajouter à la page
    document.body.appendChild(preRenderedTitleContainer);
    
    // Afficher immédiatement
    setTimeout(() => {
      preRenderedTitleContainer.style.display = 'block';
      
      // Masquer après le chargement complet
      window.addEventListener('load', () => {
        preRenderedTitleContainer.style.transform = 'translateY(-100%)';
        
        // Supprimer après la transition
        setTimeout(() => {
          if (preRenderedTitleContainer.parentNode) {
            preRenderedTitleContainer.parentNode.removeChild(preRenderedTitleContainer);
          }
        }, 500);
      });
    }, 10);
  }
  
  // Fonction pour optimiser les polices déjà chargées
  function optimizeFonts() {
    // Précharger la police principale
    const fontPreloadLink = document.createElement('link');
    fontPreloadLink.rel = 'preload';
    fontPreloadLink.as = 'font';
    fontPreloadLink.type = 'font/woff2';
    fontPreloadLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap';
    fontPreloadLink.crossOrigin = 'anonymous';
    
    // Ajouter au document
    if (document.head) {
      document.head.appendChild(fontPreloadLink);
    }
    
    // Optimiser les polices Google existantes
    document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
      // Ajouter l'attribut font-display pour éviter le blocage du rendu
      const href = link.getAttribute('href');
      if (href && !href.includes('&display=swap')) {
        link.setAttribute('href', href + '&display=swap');
      }
      
      // Ajouter priorité élevée pour les polices
      link.setAttribute('fetchpriority', 'high');
    });
  }
  
  // Injecter les styles critiques immédiatement
  injectCriticalCSS();
  
  // Exécuter les autres optimisations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeFonts();
      if (document.body) {
        createInstantCacheForTitle();
      } else {
        window.addEventListener('load', createInstantCacheForTitle);
      }
    });
  } else {
    optimizeFonts();
    createInstantCacheForTitle();
  }
})();