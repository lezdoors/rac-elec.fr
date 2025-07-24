/**
 * Utilitaire pour implémenter la compression de ressources
 * Permet d'appliquer automatiquement les en-têtes de compression nécessaires
 * Pour améliorer les performances mobiles
 */

/**
 * Vérifie si le navigateur prend en charge la compression brotli
 */
export const supportsBrotli = (): boolean => {
  // Vérifie si l'en-tête "Accept-Encoding" contient "br"
  try {
    // Approche de détection basée sur les User-Agent
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Chrome 56+, Firefox 78+, Edge 79+, Safari 14+, Opera 43+
    if (
      (userAgent.includes('chrome') && !userAgent.includes('edge') && parseInt(userAgent.split('chrome/')[1]) >= 56) ||
      (userAgent.includes('firefox') && parseInt(userAgent.split('firefox/')[1]) >= 78) ||
      (userAgent.includes('edg') && parseInt(userAgent.split('edg/')[1]) >= 79) ||
      (userAgent.includes('safari') && !userAgent.includes('chrome') && parseInt(userAgent.split('safari/')[1]) >= 14) ||
      (userAgent.includes('opera') && parseInt(userAgent.split('opera/')[1]) >= 43)
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la détection de la prise en charge de brotli:', error);
    return false;
  }
};

/**
 * Vérifie si le navigateur prend en charge la compression gzip
 */
export const supportsGzip = (): boolean => {
  // Pratiquement tous les navigateurs modernes prennent en charge gzip
  return true;
};

/**
 * Applique les métadonnées de compression aux requêtes si supportées
 */
export const applyCompressionHeaders = (url: string): RequestInit => {
  const headers: HeadersInit = {};
  
  // Ajouter les en-têtes de compression appropriés
  if (supportsBrotli()) {
    headers['Accept-Encoding'] = 'br, gzip, deflate';
  } else if (supportsGzip()) {
    headers['Accept-Encoding'] = 'gzip, deflate';
  }
  
  return { headers };
};

/**
 * Préchargement des ressources CSS critiques avec compression
 */
export const preloadCriticalCssWithCompression = () => {
  try {
    // Liste des ressources CSS critiques
    const criticalCssFiles = [
      '/assets/index-DLyI948c.css'
    ];
    
    // Préchargement avec en-têtes de compression
    criticalCssFiles.forEach(cssFile => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = cssFile;
      
      if (supportsBrotli()) {
        link.setAttribute('data-encoding', 'br');
      } else if (supportsGzip()) {
        link.setAttribute('data-encoding', 'gzip');
      }
      
      document.head.appendChild(link);
    });
  } catch (error) {
    // Ignorer les erreurs non bloquantes
    console.warn('Erreur lors du préchargement CSS:', error);
  }
};

export default {
  supportsBrotli,
  supportsGzip,
  applyCompressionHeaders,
  preloadCriticalCssWithCompression
};