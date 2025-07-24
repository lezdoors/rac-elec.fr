/**
 * Script pour prévenir le blocage du rendu par les ressources CSS et JavaScript
 *
 * Ce script optimise les ressources qui bloquent le rendu initial de la page
 * pour améliorer significativement le temps de chargement visible.
 */
(function() {
  // Créer un tableau pour suivre les ressources problématiques
  const blockingResources = [];

  // Fonction pour optimiser les ressources bloquantes
  function optimizeBlockingResources() {
    // Optimiser les feuilles de style bloquantes
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      // Ne pas modifier les feuilles de style déjà optimisées
      if (link.hasAttribute('data-optimized')) return;

      // Vérifier si cette feuille de style est une ressource bloquante
      if (link.getAttribute('media') !== 'print' && !link.hasAttribute('disabled')) {
        // Marquer comme optimisée pour éviter le traitement multiple
        link.setAttribute('data-optimized', 'true');
        
        // Ajouter media="print" temporairement pour éviter le blocage du rendu
        const originalMedia = link.getAttribute('media') || 'all';
        link.setAttribute('media', 'print');
        
        // Restaurer le media original après le chargement initial
        setTimeout(() => {
          link.setAttribute('media', originalMedia);
        }, 0);
        
        blockingResources.push('CSS: ' + (link.href || 'inline'));
      }
    });

    // Traiter les scripts non différés qui bloquent le rendu
    document.querySelectorAll('script').forEach(script => {
      // Ne pas modifier les scripts déjà optimisés ou qui sont déjà async/defer
      if (script.hasAttribute('data-optimized') || 
          script.hasAttribute('async') || 
          script.hasAttribute('defer')) return;
      
      // Ne pas toucher aux scripts sans source (scripts inline)
      if (!script.src) return;
      
      // Ne pas toucher à nos scripts d'optimisation
      if (script.src.includes('optimizer') || 
          script.src.includes('instant-render') ||
          script.src.includes('font-optimization')) return;
      
      try {
        // Créer un nouveau script avec defer
        const newScript = document.createElement('script');
        // Copier tous les attributs
        Array.from(script.attributes).forEach(attr => {
          if (attr.name !== 'type') { // Éviter de copier type="module" qui causerait des problèmes
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        // Ajouter defer pour éviter le blocage du rendu
        newScript.defer = true;
        newScript.setAttribute('data-optimized', 'true');
        
        // Remplacer le script original
        if (script.parentNode) {
          script.parentNode.replaceChild(newScript, script);
          blockingResources.push('JS: ' + script.src);
        }
      } catch (e) {
        console.warn('Erreur non critique lors de l\'optimisation d\'un script:', e);
      }
    });

    // Journaliser les ressources optimisées
    if (blockingResources.length > 0) {
      console.debug('Ressources bloquantes optimisées:', blockingResources);
    }
  }

  // Exécuter dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeBlockingResources);
  } else {
    optimizeBlockingResources();
  }
})();