/**
 * Chargeur de CSS critique pour améliorer le Largest Contentful Paint
 * Optimise le chargement des styles sans risquer de casser l'application
 */
(function() {
  // Fonction pour précharger la CSS critique
  function loadCriticalCSS() {
    const criticalStyles = [
      // Styles critiques pour le rendu initial
      { href: '/assets/index-DLyI948c.css' }
    ];

    criticalStyles.forEach(style => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = style.href;
      link.onload = function() {
        // Convertir en stylesheet une fois chargé
        this.rel = 'stylesheet';
        this.onload = null;
      };
      document.head.appendChild(link);
    });
  }

  // Exécuter dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCriticalCSS);
  } else {
    loadCriticalCSS();
  }
})();