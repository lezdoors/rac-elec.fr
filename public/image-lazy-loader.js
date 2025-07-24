/**
 * Script léger pour activer le chargement différé des images
 * Améliore les performances mobiles sans perturber les fonctionnalités
 */
(function() {
  // Ne s'exécuter que lorsque le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }

  // Fonction principale pour initialiser le lazy loading
  function initLazyLoading() {
    // Cibler uniquement les images qui n'ont pas encore d'attribut loading
    const images = document.querySelectorAll('img:not([loading])');
    
    // Appliquer le lazy loading natif
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
    
    // Observer les nouvelles images ajoutées dynamiquement
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            // Vérifier si c'est un élément DOM et une image
            if (node.nodeType === 1 && node.tagName === 'IMG' && !node.hasAttribute('loading')) {
              node.setAttribute('loading', 'lazy');
            }
          });
        });
      });
      
      // Observer tout le document pour les nouvelles images
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
})();