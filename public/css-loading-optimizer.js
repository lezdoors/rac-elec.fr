/**
 * Optimiseur de chargement CSS - Élimine les ressources qui bloquent le rendu
 * 
 * Ce script s'attaque spécifiquement au problème identifié dans PageSpeed:
 * "Éliminez les ressources qui bloquent le rendu"
 */
(function() {
  // Liste des feuilles de style à optimiser
  const stylesToOptimize = [
    { url: 'index-CDUCqx8w.css', priority: 'high' }
  ];
  
  // Fonction pour optimiser le chargement des CSS
  function optimizeCssLoading() {
    // Parcourir toutes les feuilles de style externes
    document.querySelectorAll('link[rel="stylesheet"]').forEach(linkElement => {
      if (!linkElement.href) return;
      
      // Vérifier si cette feuille de style correspond à l'une de nos cibles
      const matchedStyle = stylesToOptimize.find(style => 
        linkElement.href.indexOf(style.url) !== -1
      );
      
      if (matchedStyle) {
        // Sauvegarder l'URL originale
        const originalHref = linkElement.href;
        
        // Remplacer par une version optimisée
        const parent = linkElement.parentNode;
        if (parent) {
          // Supprimer le lien bloquant
          parent.removeChild(linkElement);
          
          // Créer un lien preload
          const preloadLink = document.createElement('link');
          preloadLink.rel = 'preload';
          preloadLink.href = originalHref;
          preloadLink.as = 'style';
          
          // Donner la priorité si nécessaire
          if (matchedStyle.priority === 'high') {
            preloadLink.setAttribute('fetchpriority', 'high');
          }
          
          // Charger la feuille de style de manière non bloquante
          preloadLink.onload = function() {
            const styleElement = document.createElement('link');
            styleElement.rel = 'stylesheet';
            styleElement.href = originalHref;
            document.head.appendChild(styleElement);
          };
          
          // Ajouter le preload au document
          document.head.appendChild(preloadLink);
          
          // Ajouter un style critique inline pour éviter FOUC (Flash Of Unstyled Content)
          if (matchedStyle.priority === 'high') {
            const criticalStyle = document.createElement('style');
            criticalStyle.textContent = `
              /* Styles critiques minimaux pendant le chargement */
              body { 
                opacity: 1; 
                transition: opacity 0.3s ease;
                visibility: visible;
              }
              h1, h2, .text-5xl, .text-white, .font-bold {
                visibility: visible !important;
                display: block !important;
              }
            `;
            document.head.appendChild(criticalStyle);
          }
        }
      }
    });
  }
  
  // Exécuter dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeCssLoading);
  } else {
    optimizeCssLoading();
  }
})();