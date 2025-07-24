/**
 * Améliorations de performance pour l'application
 * Implémente des optimisations sécurisées qui n'affectent pas les fonctionnalités existantes
 */

/**
 * Vérifie si l'utilisateur est sur un appareil mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

/**
 * Fonction qui optimise les ressources de manière sécurisée
 * N'affecte aucune fonctionnalité existante
 */
export const optimizeResources = (): void => {
  // Ne s'exécuter que sur les appareils mobiles
  if (!isMobileDevice()) return;
  
  try {
    // Précharger la CSS critique
    const criticalStylesheets = [
      '/assets/index-DLyI948c.css'
    ];
    
    criticalStylesheets.forEach(css => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = css;
      document.head.appendChild(link);
    });
    
    // Optimiser le rendu
    optimizeRender();
    
    // Retarder les scripts non critiques
    deferNonCriticalScripts();
  } catch (error) {
    // Ne pas perturber l'expérience utilisateur
    console.error('Erreur non bloquante lors de l\'optimisation:', error);
  }
};

/**
 * Optimise le rendu pour un meilleur LCP
 */
const optimizeRender = (): void => {
  // S'exécuter après le chargement initial
  const optimize = () => {
    // Trouver les images héros potentielles et leur donner la priorité
    const potentialLCPElements = document.querySelectorAll('img.hero, .header img, h1, .banner, header');
    
    potentialLCPElements.forEach(el => {
      if (el instanceof HTMLImageElement) {
        el.setAttribute('fetchpriority', 'high');
      }
    });
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimize);
  } else {
    optimize();
  }
};

/**
 * Retarde les scripts non critiques pour améliorer le temps de chargement initial
 */
const deferNonCriticalScripts = (): void => {
  // Liste des scripts à retarder, basée sur des termes qui indiquent qu'ils ne sont pas critiques
  const nonCriticalPatterns = [
    'analytics', 'tracking', 'social', 'chat', 'feedback'
  ];
  
  // Tous les scripts sans attribut async ou defer
  document.querySelectorAll('script:not([async]):not([defer])')
    .forEach(script => {
      const src = script.getAttribute('src') || '';
      
      // Vérifier si le script correspond à un modèle non critique
      const isNonCritical = nonCriticalPatterns.some(pattern => 
        src.toLowerCase().includes(pattern)
      );
      
      if (isNonCritical && src) {
        // Créer une nouvelle balise script avec defer
        const newScript = document.createElement('script');
        newScript.src = src;
        newScript.defer = true;
        
        // Remplacer l'ancien script par le nouveau
        if (script.parentNode) {
          script.parentNode.replaceChild(newScript, script);
        }
      }
    });
};

export default {
  isMobileDevice,
  optimizeResources
};