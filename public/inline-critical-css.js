/**
 * Script pour injecter des styles CSS critiques directement dans la page
 * Cela permet d'éviter le blocage de rendu causé par le chargement des CSS externes
 */
(function() {
  // Styles CSS critiques pour accélérer le rendu du titre principal
  const criticalStyles = `
    /* Styles critiques pour le titre principal (LCP) */
    h1.text-5xl.sm\\:text-6xl.font-bold.mb-3.text-white,
    h1.text-white,
    .hero-title {
      font-family: 'Poppins', sans-serif !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      text-rendering: optimizeSpeed !important;
      -webkit-font-smoothing: antialiased !important;
      visibility: visible !important;
      display: block !important;
    }

    /* Optimisations pour les éléments visibles initialement */
    header, .header, .banner, .hero {
      content-visibility: auto;
      contain-intrinsic-size: auto 300px;
    }

    /* Corrections pour les éléments typographiques */
    .font-bold {
      font-weight: 700 !important;
    }

    /* Optimisations pour les images dans la partie visible initiale */
    .header img, .hero img, header img, .banner img {
      display: block !important;
      visibility: visible !important;
    }
  `;
  
  // Injecter les styles critiques en haut de la page
  const styleElement = document.createElement('style');
  styleElement.setAttribute('id', 'critical-lcp-styles');
  styleElement.textContent = criticalStyles;
  
  // S'assurer que ces styles sont appliqués avant toute autre feuille de style
  if (document.head.firstChild) {
    document.head.insertBefore(styleElement, document.head.firstChild);
  } else {
    document.head.appendChild(styleElement);
  }
  
  // Optimiser spécifiquement le titre principal (cause du LCP élevé)
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      try {
        // Cibler le titre principal
        const mainTitle = document.querySelector('h1.text-5xl, h1.text-white, .hero-title, h1');
        
        if (mainTitle) {
          // Optimisation pour le rendu rapide
          mainTitle.style.fontFamily = "'Poppins', sans-serif";
          mainTitle.style.fontWeight = "700";
          mainTitle.style.visibility = "visible";
          mainTitle.style.display = "block";
          mainTitle.style.color = "#ffffff";
          
          // Marquer comme élément LCP
          mainTitle.setAttribute('data-lcp-element', 'true');
        }
      } catch (e) {
        // Ignorer les erreurs - non bloquant
      }
    }, 0);
  });
})();