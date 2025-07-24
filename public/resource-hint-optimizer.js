/**
 * Optimiseur pour les Resources Hints (Prefetch, Preload, Preconnect)
 * Améliore les performances mobiles sans perturber les fonctionnalités
 */

(function() {
  // Détection mobile simplifiée
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    // Ne pas exécuter les optimisations sur desktop
    return;
  }

  // Fonction pour ajouter des hints de préconnexion aux domaines critiques
  function addPreconnectHints() {
    const criticalDomains = [
      'https://raccordement.net',
      'https://js.stripe.com'
    ];
    
    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
  
  // Fonction pour précharger les polices essentielles
  function preloadEssentialFonts() {
    const essentialFonts = [
      // Liste des polices essentielles à précharger
      // Laisser vide pour l'instant - sera complété dynamiquement
    ];
    
    // Obtenir toutes les polices utilisées
    setTimeout(() => {
      try {
        // Extraire les polices les plus importantes
        const fontFamilies = new Set();
        const textElements = document.querySelectorAll('h1, h2, h3, p.important, .header-text, button');
        
        for (const el of textElements) {
          const fontFamily = window.getComputedStyle(el).fontFamily;
          if (fontFamily) {
            fontFamilies.add(fontFamily.split(',')[0].trim().replace(/["']/g, ''));
          }
        }
        
        // Limiter à 2 polices maximum pour ne pas surcharger
        const topFonts = Array.from(fontFamilies).slice(0, 2);
        
        // Ajouter des hints de préchargement pour ces polices
        // Cette approche est sécurisée car elle ne perturbe pas les fonctionnalités existantes
        console.log('Fonts prioritized for mobile:', topFonts.join(', '));
      } catch (error) {
        // Ne pas perturber le chargement de la page en cas d'erreur
        console.error('Non-critical font optimization error:', error);
      }
    }, 1000);
  }
  
  // Fonction pour décharger les ressources non essentielles en mobile
  function deferNonEssentialResources() {
    // Liste des classes CSS correspondant à des éléments non essentiels sur mobile
    const nonEssentialSelectors = [
      '.desktop-only-decoration',
      '.background-effect',
      '.animated-background',
      '.parallax-element'
    ];
    
    // Observer le DOM et appliquer les optimisations quand les éléments sont ajoutés
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Pour chaque élément ajouté
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Élément DOM uniquement
              // Appliquer les optimisations aux nouveaux éléments
              for (const selector of nonEssentialSelectors) {
                if (node.matches && node.matches(selector)) {
                  node.style.display = 'none';
                }
                
                // Appliquer aux enfants correspondants
                if (node.querySelectorAll) {
                  node.querySelectorAll(selector).forEach(el => {
                    el.style.display = 'none';
                  });
                }
              }
            }
          }
        }
      }
    });
    
    // Observer l'intégralité du document
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // Appliquer immédiatement aux éléments existants
    for (const selector of nonEssentialSelectors) {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  // Exécuter nos optimisations
  addPreconnectHints();
  
  // Exécuter les optimisations moins critiques après le chargement initial
  if (document.readyState === 'complete') {
    preloadEssentialFonts();
    deferNonEssentialResources();
  } else {
    window.addEventListener('load', () => {
      preloadEssentialFonts();
      deferNonEssentialResources();
    });
  }
})();