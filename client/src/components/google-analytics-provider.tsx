import { useEffect } from 'react';
import { initGA } from '@/lib/analytics';

/**
 * Composant qui vérifie la présence et initialise Google Analytics si nécessaire
 * Ce composant est utilisé au niveau racine de l'application
 */
export function GoogleAnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Google Analytics/gtag first
    initGA();
    
    // Vérifier si Google Analytics est déjà chargé après un délai
    const checkGtag = () => {
      if (typeof window !== 'undefined') {
        if (typeof window.gtag !== 'function') {
          console.warn('⚠️ La fonction gtag() n\'est pas disponible. Les conversions Google Ads ne fonctionneront pas correctement.');
          
          // Créer une fonction gtag de secours pour éviter les erreurs
          window.gtag = function() {
            console.warn('⚠️ Appel à gtag() mais la fonction originale n\'est pas disponible:', 
              Array.from(arguments));
          };
          
          console.log('ℹ️ Une fonction gtag() de secours a été créée pour éviter les erreurs.');
        } else {
          console.log('✅ Google Analytics est correctement chargé et disponible.');
          
          // Envoyer un événement de test pour vérifier que tout fonctionne
          try {
            const gtagResult = window.gtag('event', 'app_initialized', {
              'app_name': 'RaccordementElec',
              'app_version': '1.0.0'
            });
            
            // Si gtag retourne une promesse, gérer les rejections potentielles
            if (gtagResult && typeof gtagResult.catch === 'function') {
              gtagResult.catch((error: any) => {
                console.warn('⚠️ Erreur non critique lors de l\'envoi de l\'événement Google Analytics:', error);
              });
            }
            
            console.log('✅ Événement de test envoyé à Google Analytics.');
          } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'événement de test:', error);
          }
        }
      }
    };

    // Wait 2 seconds for gtag to load
    setTimeout(checkGtag, 2000);
  }, []);
  
  // Pas de rendu spécifique, juste retourner les enfants
  return <>{children}</>;
}

export default GoogleAnalyticsProvider;