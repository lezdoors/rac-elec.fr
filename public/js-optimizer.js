/**
 * Optimiseur JavaScript - Réduit les ressources inutilisées sans affecter les fonctionnalités
 * 
 * Ce script optimise le chargement des ressources JavaScript identifiées
 * comme pouvant être retardées ou optimisées selon la capture d'écran PageSpeed
 */
(function() {
  // Liste des scripts à optimiser
  const scriptsToOptimize = [
    { pattern: 'stripe.js', type: 'defer' },
    { pattern: 'googletagmanager', type: 'async' },
    { pattern: 'index-w5kn9XvB.js', type: 'defer' },
    { pattern: 'prevent-render-blocking.js', type: 'defer' }
  ];
  
  // Fonction pour optimiser les scripts existants
  function optimizeScripts() {
    document.querySelectorAll('script').forEach(script => {
      if (!script.src) return; // Ignorer les scripts inline
      
      // Vérifier si ce script correspond à un de nos patterns
      const matchedScript = scriptsToOptimize.find(s => 
        script.src.indexOf(s.pattern) !== -1
      );
      
      if (matchedScript) {
        // Sauvegarder l'attribut src original
        const originalSrc = script.src;
        
        // Créer un nouveau script optimisé
        const optimizedScript = document.createElement('script');
        optimizedScript.src = originalSrc;
        
        // Appliquer le type d'optimisation
        if (matchedScript.type === 'defer') {
          optimizedScript.defer = true;
        } else if (matchedScript.type === 'async') {
          optimizedScript.async = true;
        }
        
        // Remplacer l'ancien script par le nouveau
        if (script.parentNode) {
          script.parentNode.replaceChild(optimizedScript, script);
        }
      }
    });
  }
  
  // Observer les modifications du DOM pour les scripts ajoutés dynamiquement
  function startScriptObserver() {
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            // Vérifier si c'est un script
            if (node.nodeName === 'SCRIPT' && node.src) {
              // Vérifier si ce script correspond à un de nos patterns
              const matchedScript = scriptsToOptimize.find(s => 
                node.src.indexOf(s.pattern) !== -1
              );
              
              if (matchedScript && node.parentNode) {
                // Sauvegarder l'attribut src original
                const originalSrc = node.src;
                
                // Créer un nouveau script optimisé
                const optimizedScript = document.createElement('script');
                optimizedScript.src = originalSrc;
                
                // Appliquer le type d'optimisation
                if (matchedScript.type === 'defer') {
                  optimizedScript.defer = true;
                } else if (matchedScript.type === 'async') {
                  optimizedScript.async = true;
                }
                
                // Remplacer le script par la version optimisée
                node.parentNode.replaceChild(optimizedScript, node);
              }
            }
          });
        });
      });
      
      // Observer tout le document
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Exécuter lorsque le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeScripts();
      startScriptObserver();
    });
  } else {
    optimizeScripts();
    startScriptObserver();
  }
})();