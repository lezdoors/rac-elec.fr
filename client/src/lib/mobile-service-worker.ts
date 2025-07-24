/**
 * Service Worker pour optimisation mobile
 * Gère l'enregistrement du service worker pour améliorer les performances
 */

/**
 * Vérifie si le navigateur prend en charge les Service Workers
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Détecte si l'utilisateur est sur un appareil mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

/**
 * Enregistre le service worker pour optimisation mobile
 */
export const registerMobileServiceWorker = async (): Promise<void> => {
  // Service Worker complètement désactivé pour éviter les erreurs
  return;
};

/**
 * Désactive le service worker - utile pour le debug ou si problème détecté
 */
export const unregisterMobileServiceWorker = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker désactivé avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de la désactivation du Service Worker:', error);
  }
};

export default {
  registerMobileServiceWorker,
  unregisterMobileServiceWorker,
  isMobileDevice,
  isServiceWorkerSupported
};