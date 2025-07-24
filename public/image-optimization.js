/**
 * Optimisation d'images pour améliorer le LCP (Largest Contentful Paint)
 * Implémente des techniques sécurisées qui n'affectent pas les fonctionnalités
 */
(function() {
  // S'exécuter uniquement sur les appareils mobiles
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) return;

  // Fonction pour optimiser les images de façon non destructive
  function optimizeImages() {
    // 1. Ajouter l'attribut loading="lazy" aux images non visibles
    const allImages = document.querySelectorAll('img');
    
    allImages.forEach(img => {
      // Ne pas toucher aux images déjà optimisées ou essentielles
      if (img.hasAttribute('loading') || img.classList.contains('critical-image')) {
        return;
      }
      
      // Vérifier si l'image est dans la partie visible initiale de la page
      const rect = img.getBoundingClientRect();
      const isInInitialViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      // N'appliquer le lazy loading qu'aux images hors écran initial
      if (!isInInitialViewport) {
        img.setAttribute('loading', 'lazy');
      } else {
        // Pour les images dans la vue initiale, ajouter un attribut d'importance
        img.setAttribute('fetchpriority', 'high');
      }
    });
    
    // 2. Identifier l'image principale (LCP probable) et la précharger
    const heroImages = document.querySelectorAll('img.hero-image, .header img, .banner img, .hero img, header img');
    
    if (heroImages.length > 0) {
      const mainImage = heroImages[0];
      const imgSrc = mainImage.getAttribute('src');
      
      if (imgSrc) {
        // Précharger l'image probable du LCP
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imgSrc;
        document.head.appendChild(link);
        
        // Marquer cette image comme critique
        mainImage.classList.add('critical-image');
        mainImage.setAttribute('fetchpriority', 'high');
      }
    }
  }
  
  // S'exécuter dès que possible pour optimiser les images visibles
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImages);
  } else {
    optimizeImages();
  }
  
  // Observer les modifications du DOM pour optimiser les nouvelles images
  if ('MutationObserver' in window) {
    const observer = new MutationObserver(mutations => {
      let hasNewImages = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (node.tagName === 'IMG' || node.querySelectorAll)) {
            hasNewImages = true;
          }
        });
      });
      
      if (hasNewImages) {
        optimizeImages();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();