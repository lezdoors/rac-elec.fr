/**
 * Middleware pour activer la compression de texte sur les navigateurs mobiles
 * Ce script est chargé en premier dans le head pour optimiser les performances
 */

(function() {
  // Détection mobile simplifiée
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    // Ne pas exécuter les optimisations sur desktop
    return;
  }
  
  // Fonction pour ajouter un en-tête Accept-Encoding à toutes les requêtes fetch
  const originalFetch = window.fetch;
  
  // Remplacer la fonction fetch native par notre version optimisée
  window.fetch = function(resource, options) {
    // Initialiser les options si non fournies
    options = options || {};
    // Initialiser les en-têtes si non fournis
    options.headers = options.headers || {};
    
    // Ajouter l'en-tête d'encodage pour activer la compression
    if (typeof options.headers.append === 'function') {
      options.headers.append('Accept-Encoding', 'br, gzip, deflate');
    } else {
      options.headers['Accept-Encoding'] = 'br, gzip, deflate';
    }
    
    // Appeler la fonction fetch d'origine avec nos options modifiées
    return originalFetch.call(this, resource, options);
  };
  
  // Ajouter un attribut pour marquer que la compression est activée
  document.documentElement.setAttribute('data-compression-enabled', 'true');
  
  // Fonction pour optimiser le chargement des ressources CSS critiques
  function preloadCriticalResources() {
    // Liste des ressources CSS critiques
    const criticalCssFiles = [
      '/assets/index-DLyI948c.css'
    ];
    
    // Précharger chaque fichier CSS critique
    criticalCssFiles.forEach(cssFile => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = cssFile;
      link.setAttribute('data-critical', 'true');
      document.head.appendChild(link);
    });
  }
  
  // Exécuter le préchargement immédiatement
  preloadCriticalResources();
})();