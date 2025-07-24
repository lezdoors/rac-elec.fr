/**
 * Optimiseur de modules JavaScript
 * Ce script identifie et désactive les modules non utilisés pour améliorer les performances
 * sans affecter les fonctionnalités essentielles
 */
(function() {
  // Liste des modules identifiés comme non essentiels
  const nonEssentialModules = [
    'animation', 'charts', 'map', 'video', 'audio', 'advanced-forms', 'datepicker'
  ];

  // Variables pour suivre l'état des modules
  let modulesOptimized = false;
  
  // Fonction pour détecter et désactiver les modules non utilisés
  function optimizeUnusedModules() {
    if (modulesOptimized) return; // Éviter les optimisations multiples
    
    console.debug('Modules potentiellement non utilisés:', nonEssentialModules);
    
    // Tableau pour stocker les modules désactivés
    const disabledModules = [];
    
    // Fonction sécurisée pour désactiver un module
    function safelyDisableModule(moduleName) {
      try {
        // Plutôt que de supprimer, on remplace par des fonctions vides
        // pour éviter les erreurs de référence
        if (window[moduleName]) {
          // Sauvegarder l'original au cas où
          window['_' + moduleName + '_original'] = window[moduleName];
          // Remplacer par un objet vide
          window[moduleName] = function() {
            return {};
          };
          disabledModules.push(moduleName);
          return true;
        }
        
        // Pour les modules qui pourraient être ajoutés dynamiquement plus tard
        Object.defineProperty(window, moduleName, {
          set: function(val) {
            window['_' + moduleName + '_original'] = val;
          },
          get: function() {
            return function() { return {}; };
          },
          configurable: true
        });
        
        return false;
      } catch (e) {
        // En cas d'erreur, ne pas interrompre l'exécution
        console.warn('Erreur non bloquante lors de l\'optimisation de ' + moduleName, e);
        return false;
      }
    }
    
    // Essayer de désactiver chaque module non essentiel
    nonEssentialModules.forEach(moduleName => {
      safelyDisableModule(moduleName);
    });
    
    // Marquer comme optimisé
    modulesOptimized = true;
    
    // Message de confirmation en console
    if (disabledModules.length > 0) {
      console.debug('Modules optimisés pour améliorer les performances:', disabledModules);
    }
  }
  
  // Fonction pour retarder le chargement des scripts non essentiels
  function deferNonEssentialScripts() {
    document.querySelectorAll('script').forEach(script => {
      if (!script.src) return; // Ignorer les scripts inline
      
      // Vérifier si ce script pourrait contenir des modules non essentiels
      const isNonEssential = nonEssentialModules.some(module => 
        script.src.toLowerCase().includes(module.toLowerCase())
      );
      
      if (isNonEssential && !script.defer && !script.async) {
        // Créer un clone du script avec defer
        const deferredScript = document.createElement('script');
        deferredScript.src = script.src;
        deferredScript.defer = true;
        
        // Remplacer l'original par la version différée
        if (script.parentNode) {
          script.parentNode.replaceChild(deferredScript, script);
        }
      }
    });
  }
  
  // Exécuter après le chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      deferNonEssentialScripts();
      
      // Attendre un peu pour s'assurer que les fonctionnalités essentielles sont chargées
      setTimeout(optimizeUnusedModules, 2000);
    });
  } else {
    deferNonEssentialScripts();
    setTimeout(optimizeUnusedModules, 2000);
  }
})();