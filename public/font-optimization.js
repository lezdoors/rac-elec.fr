/**
 * Optimisation ciblée des polices pour accélérer le Largest Contentful Paint
 * Ce script charge rapidement la police utilisée dans le titre principal
 */
(function() {
  // Injecter une police Google Fonts optimisée pour le titre principal
  function injectOptimizedFonts() {
    // Polices optimisées
    const fontLink = document.createElement('link');
    fontLink.rel = 'preconnect';
    fontLink.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontLink);

    const fontStaticLink = document.createElement('link');
    fontStaticLink.rel = 'preconnect';
    fontStaticLink.href = 'https://fonts.gstatic.com';
    fontStaticLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontStaticLink);

    // Précharger la police principale en priorité
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'style';
    fontPreload.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap';
    document.head.appendChild(fontPreload);

    // Charger la police
    const fontStyle = document.createElement('link');
    fontStyle.rel = 'stylesheet';
    fontStyle.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap';
    document.head.appendChild(fontStyle);

    // Appliquer la police directement au titre principal pour accélérer le rendu
    const mainTitleStyle = document.createElement('style');
    mainTitleStyle.textContent = `
      h1, .text-5xl, .sm\\:text-6xl, .font-bold, [class*="text-white"] {
        font-family: 'Poppins', sans-serif !important;
        font-display: swap !important;
      }
    `;
    document.head.appendChild(mainTitleStyle);
  }

  // Optimiser les polices dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectOptimizedFonts);
  } else {
    injectOptimizedFonts();
  }

  // Optimiser spécifiquement l'élément identifié comme LCP
  setTimeout(() => {
    try {
      // Trouver le titre principal
      const mainTitle = document.querySelector('h1.text-5xl.sm\\:text-6xl.font-bold.mb-3.text-white');
      if (mainTitle) {
        // Optimisation rendant cet élément prioritaire
        mainTitle.setAttribute('data-lcp-element', 'true');
        
        // Appliquer des styles inline pour éviter les requêtes de style bloquantes
        mainTitle.style.fontFamily = "'Poppins', sans-serif";
        mainTitle.style.fontWeight = "700";
        mainTitle.style.color = "#ffffff";
        
        // Forcer le rendu de cet élément immédiatement
        mainTitle.style.contentVisibility = "auto";
        mainTitle.style.containIntrinsicSize = "auto 120px";
      }
    } catch (e) {
      // Ne pas bloquer l'exécution si une erreur se produit
      console.warn('Optimisation LCP non bloquante:', e);
    }
  }, 0);
})();