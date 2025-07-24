/**
 * Optimiseur de police pour améliorer les performances
 * Implémente un chargement optimisé des polices sans risquer de casser l'application
 */

/**
 * Vérifie si l'utilisateur est sur un appareil mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

/**
 * Charge les polices de manière optimisée
 */
export const loadOptimizedFonts = (): void => {
  // Ne pas exécuter sur desktop pour éviter tout risque
  if (!isMobileDevice()) return;
  
  try {
    // S'assurer que le document est prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFontOptimization);
    } else {
      initFontOptimization();
    }
  } catch (error) {
    console.error('Erreur non bloquante lors de l\'optimisation des polices:', error);
  }
};

/**
 * Initialise l'optimisation des polices
 */
function initFontOptimization(): void {
  // Ajouter l'attribut display=swap sur tous les liens de polices
  document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]').forEach(link => {
    if (!link.getAttribute('href')?.includes('&display=swap')) {
      const href = link.getAttribute('href');
      if (href) {
        link.setAttribute('href', `${href}${href.includes('?') ? '&' : '?'}display=swap`);
      }
    }
  });
  
  // Ajouter l'optimisation font-display: swap dans une règle CSS
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

export default {
  loadOptimizedFonts,
  isMobileDevice
};