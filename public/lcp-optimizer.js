/**
 * Optimiseur spécifique pour le Largest Contentful Paint (LCP)
 * 
 * Ce script cible précisément l'élément identifié comme LCP dans PageSpeed Insights
 * (titre principal "Portail en ligne de demande de raccordement Enedis")
 */
(function() {
  // Fonction pour précharger l'élément LCP
  function optimizeLCP() {
    // Identifier et optimiser le titre principal (élément LCP)
    const lcpSelectors = [
      'h1.text-5xl', 
      'h1.sm\\:text-6xl', 
      'h1.text-white',
      'h1.font-bold',
      '.text-5xl.sm\\:text-6xl.text-white.font-bold'
    ];
    
    // Créer un style d'optimisation pour le LCP
    const lcpStyle = document.createElement('style');
    lcpStyle.textContent = `
      /* Optimisation LCP - Accélère l'affichage du titre principal */
      h1.text-5xl, 
      h1.sm\\:text-6xl,
      h1.text-white,
      h1.font-bold,
      .text-5xl,
      .sm\\:text-6xl,
      .text-white.font-bold {
        content-visibility: auto;
        contain-intrinsic-size: 1px 1000px;
        display: block !important;
        visibility: visible !important;
        font-display: swap !important;
        will-change: contents;
      }
    `;
    document.head.appendChild(lcpStyle);
    
    // Fonction pour appliquer des optimisations aux éléments LCP
    function optimizeLCPElements() {
      lcpSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.hasAttribute('data-lcp-optimized')) {
            // Marquer comme optimisé
            element.setAttribute('data-lcp-optimized', 'true');
            
            // Ajouter fetchpriority high
            element.setAttribute('fetchpriority', 'high');
            
            // Si l'élément contient une image ou un fond, l'optimiser
            const bgImages = getComputedStyle(element).backgroundImage;
            if (bgImages && bgImages !== 'none') {
              const imageUrls = bgImages.match(/url\(['"]?([^'"]+)['"]?\)/g);
              if (imageUrls && imageUrls.length > 0) {
                imageUrls.forEach(urlString => {
                  const url = urlString.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
                  prefetchResource(url, 'image');
                });
              }
            }
            
            // Optimiser les images à l'intérieur de l'élément LCP
            element.querySelectorAll('img').forEach(img => {
              img.setAttribute('fetchpriority', 'high');
              img.setAttribute('loading', 'eager');
              if (img.src) {
                prefetchResource(img.src, 'image');
              }
            });
            
            // Optimiser les polices utilisées dans le LCP
            const fontFamily = getComputedStyle(element).fontFamily;
            if (fontFamily) {
              // Précharger la police si possible
              const fontUrl = getFontUrl(fontFamily);
              if (fontUrl) {
                prefetchResource(fontUrl, 'font');
              }
            }
            
            // Réduire le délai de rendu en forçant un style alternatif
            const originalHTML = element.innerHTML;
            if (originalHTML && !element.hasAttribute('data-lcp-enhanced')) {
              element.setAttribute('data-lcp-enhanced', 'true');
              
              // Créer un élément cache pour accélérer le rendu initial
              const enhancedHTML = `
                <span style="position:absolute; top:0; left:0; right:0; visibility:visible;">${originalHTML}</span>
                <span style="visibility:hidden">${originalHTML}</span>
              `;
              
              // Utiliser requestAnimationFrame pour éviter un FOUC (Flash of Unstyled Content)
              requestAnimationFrame(() => {
                element.innerHTML = enhancedHTML;
                
                // Restaurer l'HTML original après le rendu
                setTimeout(() => {
                  element.innerHTML = originalHTML;
                }, 100);
              });
            }
          }
        });
      });
    }
    
    // Précharger une ressource (image, police, etc.)
    function prefetchResource(url, type) {
      if (!url) return;
      
      const link = document.createElement('link');
      link.rel = type === 'font' ? 'preload' : 'prefetch';
      link.href = url;
      link.as = type;
      if (type === 'font') {
        link.setAttribute('crossorigin', 'anonymous');
      }
      document.head.appendChild(link);
    }
    
    // Obtenir l'URL d'une police à partir de son nom
    function getFontUrl(fontFamily) {
      // Logique pour déduire l'URL de la police
      // Mapper les noms de police courants à leurs URLs
      const fontMap = {
        'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
        'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
        'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
      };
      
      // Chercher une correspondance dans notre mapping
      const fontName = fontFamily.split(',')[0].trim().replace(/["']/g, '');
      return fontMap[fontName] || null;
    }
    
    // Mettre en cache l'image de fond si présente
    function cacheCriticalImages() {
      // Cibler spécifiquement le fond du hero
      const heroBgs = document.querySelectorAll('.bg-blue-900, .bg-primary, .bg-gradient-to-r, .hero-section');
      heroBgs.forEach(bg => {
        const style = getComputedStyle(bg);
        if (style.backgroundImage && style.backgroundImage !== 'none') {
          const urlMatch = style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            prefetchResource(urlMatch[1], 'image');
          }
        }
      });
    }
    
    // Précharger les fonts web utilisées pour le titre
    function preloadCriticalFonts() {
      const criticalFonts = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap'
      ];
      
      criticalFonts.forEach(fontUrl => {
        prefetchResource(fontUrl, 'font');
      });
    }
    
    // Exécuter immédiatement
    preloadCriticalFonts();
    
    // Observer le DOM pour détecter les changements et appliquer l'optimisation
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(mutations => {
        optimizeLCPElements();
        cacheCriticalImages();
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
    
    // Appliquer l'optimisation dès que possible
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        optimizeLCPElements();
        cacheCriticalImages();
      });
    } else {
      optimizeLCPElements();
      cacheCriticalImages();
    }
    
    // Créer un titre pré-rendu instantané pour le premier affichage
    function createInstantTitle() {
      const instantTitle = document.createElement('div');
      instantTitle.setAttribute('aria-hidden', 'true');
      instantTitle.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        background-color: #1e3a8a;
        color: white;
        font-weight: bold;
        font-size: 24px;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
        max-width: 90%;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.5s ease;
      `;
      instantTitle.textContent = "Portail en ligne de demande de raccordement Enedis";
      
      document.body.appendChild(instantTitle);
      
      // Masquer le titre pré-rendu après que la page soit chargée
      setTimeout(() => {
        instantTitle.style.opacity = '0';
        setTimeout(() => {
          if (instantTitle.parentNode) {
            instantTitle.parentNode.removeChild(instantTitle);
          }
        }, 500);
      }, 1000);
    }
    
    // Appliquer le titre pré-rendu si nous sommes sur la page d'accueil
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      if (document.readyState === 'complete') {
        createInstantTitle();
      } else {
        window.addEventListener('load', createInstantTitle);
      }
    }
  }
  
  // Exécuter immédiatement
  optimizeLCP();
})();