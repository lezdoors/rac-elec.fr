/**
 * Optimisation du rendu instantané pour l'élément LCP
 * Cette approche ciblée améliore significativement les performances sans risquer les fonctionnalités
 */
(function() {
  // CSS inline d'extrême priorité pour le titre
  const priorityCss = `
    /* Styles d'extrême priorité pour l'élément LCP (le titre principal) */
    @font-face {
      font-family: 'Express-Title';
      src: local('Arial Bold'), local('Helvetica Bold'), local('Roboto Bold'), local('Segoe UI Bold');
      font-weight: bold;
      font-display: swap;
    }
    
    h1, h1.text-5xl, h1.sm\\:text-6xl, h1.font-bold, h1.text-white,
    .hero-title, header h1, .banner h1, .header h1 {
      font-family: 'Express-Title', 'Poppins', sans-serif !important;
      font-weight: bold !important;
      visibility: visible !important;
      color: #ffffff !important;
      display: block !important;
      text-rendering: optimizeSpeed !important;
      -webkit-font-smoothing: antialiased !important;
      content-visibility: visible !important;
    }

    /* Garantir que les images d'en-tête sont affichées rapidement */
    header img.logo, .logo img, header picture img {
      content-visibility: visible !important;
      display: inline-block !important;
    }
  `;

  // Injecter les styles instantanément
  const styleElement = document.createElement('style');
  styleElement.innerHTML = priorityCss;
  
  // Insérer au tout début du document
  if (document.head) {
    document.head.insertBefore(styleElement, document.head.firstChild);
  } else {
    // Si document.head n'est pas encore disponible, surveiller jusqu'à ce qu'il le soit
    const observer = new MutationObserver((mutations, obs) => {
      if (document.head) {
        document.head.insertBefore(styleElement, document.head.firstChild);
        obs.disconnect(); // Arrêter d'observer une fois l'élément inséré
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Optimisation directe après le chargement
  document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
      mainTitle.setAttribute('importance', 'high');
    }
  });
})();