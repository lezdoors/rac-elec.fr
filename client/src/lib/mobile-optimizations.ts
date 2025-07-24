/**
 * Optimisations et adaptations pour les appareils mobiles
 * Ce fichier contient des utilitaires et configurations pour améliorer l'expérience sur petit écran
 */

import { useEffect, useState } from "react";

// Dimensions de référence pour les breakpoints
export const BREAKPOINTS = {
  xs: 375,  // Petits smartphones
  sm: 640,  // Smartphones standards
  md: 768,  // Tablettes portrait
  lg: 1024, // Tablettes paysage et petits ordinateurs portables
  xl: 1280, // Ordinateurs standards
  xxl: 1536 // Grands écrans
};

/**
 * Hook pour détecter si l'écran est considéré comme mobile
 * @param breakpoint Dimension en pixels en dessous de laquelle l'appareil est considéré comme mobile
 * @returns Booléen indiquant si l'écran est en taille mobile
 */
export function useIsMobile(breakpoint = BREAKPOINTS.md) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Définir l'état initial basé sur la taille actuelle de l'écran
    setIsMobile(window.innerWidth < breakpoint);

    // Gestionnaire d'événement pour mettre à jour l'état lors du redimensionnement
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener("resize", handleResize);

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook pour obtenir la taille actuelle de la fenêtre
 * @returns Objet contenant les dimensions actuelles de la fenêtre
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Gestionnaire de redimensionnement
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Définir la taille initiale
    handleResize();

    // Ajouter l'écouteur d'événement
    window.addEventListener("resize", handleResize);

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook pour déterminer le facteur d'échelle approprié en fonction de la taille de l'écran
 * @param baseWidth Largeur de base pour laquelle le facteur d'échelle est 1
 * @returns Facteur d'échelle adapté à la taille actuelle de l'écran
 */
export function useScaleFactor(baseWidth = BREAKPOINTS.lg) {
  const { width } = useWindowSize();
  
  // Calculer le facteur d'échelle avec une limite minimale
  const scaleFactor = Math.max(0.6, width / baseWidth);
  
  return scaleFactor < 1 ? scaleFactor : 1; // Ne pas agrandir sur grands écrans, seulement réduire sur petits
}

/**
 * Configurations pour optimiser les animations sur mobile
 */
export const MOBILE_ANIMATION_ADJUSTMENTS = {
  // Réduire la complexité et l'intensité des animations sur mobile
  reduceMotion: true,
  
  // Facteur d'échelle pour les distances d'animation
  distanceScale: 0.7,
  
  // Réduire les durées d'animation sur mobile pour améliorer les performances
  durationScale: 0.8,
  
  // Limiter les animations en parallèle sur mobile
  maxConcurrentAnimations: 3,
  
  // Désactiver certains types d'animations coûteuses sur mobile
  disableTypes: [
    "parallax",
    "background-particles",
    "complex-path",
    "3d-rotation"
  ],
  
  // Optimiser les sprites et images animées pour mobile
  spriteOptimizations: {
    reducedFrameRate: true,
    lowerResolution: true,
    simplifyPaths: true
  }
};

/**
 * Configurations pour améliorer l'ergonomie sur mobile
 */
export const MOBILE_UX_IMPROVEMENTS = {
  // Augmenter la taille des zones cliquables sur mobile
  touchTargetMinSize: 44, // en pixels, recommandation WCAG
  
  // Espacement entre les éléments cliquables
  touchTargetSpacing: 8, // en pixels
  
  // Augmenter le padding des éléments interactifs
  inputPadding: {
    horizontal: 16,
    vertical: 12
  },
  
  // Adapter la typographie pour mobile
  typography: {
    baseFontSizeAdjustment: 1.1, // Facteur d'augmentation pour le texte de base
    minFontSize: 14, // Taille minimale en pixels pour le texte standard
    headingScale: 0.9, // Facteur pour réduire proportionnellement les titres
    lineHeightAdjustment: 1.2 // Augmenter l'espacement des lignes pour la lisibilité
  },
  
  // Simplifier les menus et la navigation
  navigation: {
    maxVisibleItems: 5,
    useHamburgerUnder: BREAKPOINTS.md,
    collapseSectionsUnder: BREAKPOINTS.sm
  },
  
  // Optimiser les formulaires
  forms: {
    stackLabels: true, // Empiler les labels au-dessus des champs plutôt qu'à côté
    fullWidthInputs: true, // Utiliser toute la largeur disponible pour les champs
    increaseFocusIndicator: true, // Rendre l'indicateur de focus plus visible
    useNativeSelects: true // Utiliser les sélecteurs natifs plutôt que personnalisés
  }
};

/**
 * Classes CSS conditionnelles pour les adaptations mobiles
 * @param isMobile Booléen indiquant si le mode mobile est actif
 * @returns Objet contenant des classes CSS à appliquer conditionnellement
 */
export function getMobileClasses(isMobile: boolean) {
  return {
    // Conteneurs
    container: isMobile ? "px-4 py-3" : "px-6 py-4",
    card: isMobile ? "p-4 rounded-lg" : "p-6 rounded-xl",
    section: isMobile ? "py-8" : "py-12",
    
    // Typographie
    heading: isMobile ? "text-xl mb-3" : "text-2xl mb-4",
    subheading: isMobile ? "text-lg mb-2" : "text-xl mb-3",
    paragraph: isMobile ? "text-sm" : "text-base",
    
    // Espacement
    gap: isMobile ? "gap-3" : "gap-4",
    margin: isMobile ? "mb-4" : "mb-6",
    padding: isMobile ? "p-3" : "p-4",
    
    // Mise en page
    layout: isMobile 
      ? "flex flex-col space-y-4" 
      : "grid grid-cols-2 gap-6",
    sidebar: isMobile ? "hidden" : "block w-64",
    
    // Formulaires
    form: isMobile ? "space-y-4" : "space-y-6",
    input: isMobile 
      ? "h-12 px-3 py-2 text-sm" 
      : "h-10 px-4 py-2 text-base",
    button: isMobile 
      ? "h-12 px-4 py-2 text-sm" 
      : "h-10 px-6 py-2 text-base",
    
    // Navigation
    nav: isMobile ? "py-2 px-3" : "py-3 px-5",
    menu: isMobile ? "flex flex-col" : "flex flex-row",
    
    // Tableaux
    table: isMobile ? "text-xs" : "text-sm",
    tableCell: isMobile ? "px-2 py-1" : "px-4 py-2",
  };
}

/**
 * Optimisations de performance pour les appareils mobiles
 */
export function applyMobilePerformanceOptimizations() {
  if (typeof window === "undefined") return;
  
  // Détecter si c'est un appareil mobile
  const isMobile = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  
  if (isMobile) {
    // Réduire la fréquence des animations
    document.body.classList.add("reduce-motion");
    
    // Optimiser le rendu CSS
    document.body.classList.add("optimize-performance");
    
    // Désactiver certains effets visuels coûteux
    document.documentElement.style.setProperty("--enable-parallax", "0");
    document.documentElement.style.setProperty("--enable-complex-shadows", "0");
    document.documentElement.style.setProperty("--enable-background-animations", "0");
    
    // Optimiser le comportement de défilement
    if ("scrollBehavior" in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = "auto";
    }
    
    console.info("Optimisations mobiles appliquées");
  }
}