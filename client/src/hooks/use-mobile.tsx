import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Vérifier si l'écran est de taille mobile au montage du composant
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Vérifier immédiatement
    checkIsMobile();
    
    // Ajouter un écouteur d'événement pour détecter les changements de taille de l'écran
    window.addEventListener('resize', checkIsMobile);
    
    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}