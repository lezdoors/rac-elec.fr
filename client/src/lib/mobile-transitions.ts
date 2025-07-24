/**
 * Utilitaires de transitions et animations optimisées pour les appareils mobiles
 * Fournit des animations plus légères et optimisées pour les performances sur mobile
 */

import { useEffect, useRef, useState } from "react";
import { useIsMobile, useWindowSize } from "./mobile-optimizations";

/**
 * Types d'animations disponibles optimisées pour mobile
 */
export type MobileTransitionType = 
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left" 
  | "slide-right"
  | "scale"
  | "none";

/**
 * Types de courbes d'accélération optimisées
 */
export type MobileEasingType =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "spring-light"
  | "spring-medium";

interface TransitionProps {
  type?: MobileTransitionType;
  duration?: number;
  delay?: number;
  easing?: MobileEasingType;
}

/**
 * Obtient les propriétés CSS pour une transition adaptée au mobile
 */
export function getMobileTransition({
  type = "fade",
  duration = 300,
  delay = 0,
  easing = "ease-out"
}: TransitionProps = {}): string {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  // Réduire la durée sur mobile pour de meilleures performances
  const adjustedDuration = isMobile ? Math.min(duration, 250) : duration;
  
  // Déterminer le timing function
  let timingFunction: string;
  switch (easing) {
    case "linear":
      timingFunction = "linear";
      break;
    case "ease-in":
      timingFunction = "cubic-bezier(0.4, 0, 1, 1)";
      break;
    case "ease-out":
      timingFunction = "cubic-bezier(0, 0, 0.2, 1)";
      break;
    case "ease-in-out":
      timingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";
      break;
    case "spring-light":
      timingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";
      break;
    case "spring-medium":
      timingFunction = "cubic-bezier(0.2, 1.5, 0.5, 1)";
      break;
    default:
      timingFunction = "cubic-bezier(0, 0, 0.2, 1)";
  }
  
  // Construire les propriétés CSS selon le type de transition
  let properties: string[] = [];
  
  switch (type) {
    case "fade":
      properties = ["opacity"];
      break;
    case "slide-up":
    case "slide-down":
    case "slide-left":
    case "slide-right":
      properties = ["transform", "opacity"];
      break;
    case "scale":
      properties = ["transform", "opacity"];
      break;
    case "none":
      return "none";
    default:
      properties = ["opacity"];
  }
  
  return `${properties.join(", ")} ${adjustedDuration}ms ${timingFunction} ${delay}ms`;
}

/**
 * Obtient les classes Tailwind pour une transition adaptée au mobile
 */
export function getMobileTransitionClasses(
  type: MobileTransitionType = "fade",
  state: "enter" | "entered" | "exit" | "exited" = "enter"
): string {
  const baseClasses = "transition-all";
  
  if (type === "none") return "";
  
  // Classes pour l'état entrant
  if (state === "enter" || state === "entered") {
    switch (type) {
      case "fade":
        return `${baseClasses} ${state === "enter" ? "opacity-0" : "opacity-100"}`;
      case "slide-up":
        return `${baseClasses} ${state === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`;
      case "slide-down":
        return `${baseClasses} ${state === "enter" ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`;
      case "slide-left":
        return `${baseClasses} ${state === "enter" ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`;
      case "slide-right":
        return `${baseClasses} ${state === "enter" ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"}`;
      case "scale":
        return `${baseClasses} ${state === "enter" ? "opacity-0 scale-95" : "opacity-100 scale-100"}`;
      default:
        return baseClasses;
    }
  }
  
  // Classes pour l'état sortant
  if (state === "exit" || state === "exited") {
    switch (type) {
      case "fade":
        return `${baseClasses} ${state === "exit" ? "opacity-100" : "opacity-0"}`;
      case "slide-up":
        return `${baseClasses} ${state === "exit" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;
      case "slide-down":
        return `${baseClasses} ${state === "exit" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`;
      case "slide-left":
        return `${baseClasses} ${state === "exit" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`;
      case "slide-right":
        return `${baseClasses} ${state === "exit" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`;
      case "scale":
        return `${baseClasses} ${state === "exit" ? "opacity-100 scale-100" : "opacity-0 scale-95"}`;
      default:
        return baseClasses;
    }
  }
  
  return baseClasses;
}

/**
 * Hook pour créer un délai d'animation intelligent qui s'adapte aux performances de l'appareil
 * @param baseDelay Délai de base en ms
 * @returns Délai ajusté en fonction de l'appareil
 */
export function useAdaptiveDelay(baseDelay: number): number {
  const isMobile = useIsMobile();
  const [adaptiveDelay, setAdaptiveDelay] = useState(baseDelay);
  
  useEffect(() => {
    // Réduire les délais sur mobile pour une meilleure réactivité
    if (isMobile) {
      setAdaptiveDelay(Math.max(baseDelay * 0.7, 50));
    } else {
      setAdaptiveDelay(baseDelay);
    }
  }, [isMobile, baseDelay]);
  
  return adaptiveDelay;
}

/**
 * Hook pour détecter quand un élément est visible dans le viewport
 * Optimisé pour les performances mobiles avec gestion du throttling
 */
export function useInView(options: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}) {
  const { threshold = 0.1, rootMargin = "0px", once = false, delay = 100 } = options;
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    let timeoutId: NodeJS.Timeout;
    const optimizedThreshold = isMobile ? Math.min(threshold, 0.05) : threshold;
    const optimizedDelay = isMobile ? Math.max(delay, 150) : delay;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Utiliser le throttling pour optimiser les performances
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (entry.isIntersecting && (!once || !hasTriggered)) {
            setIsInView(true);
            setHasTriggered(true);
            
            // Si seulement besoin de détecter une fois
            if (once) {
              observer.disconnect();
            }
          } else if (!entry.isIntersecting && !once) {
            setIsInView(false);
          }
        }, optimizedDelay);
      },
      { threshold: optimizedThreshold, rootMargin }
    );
    
    observer.observe(currentRef);
    
    return () => {
      clearTimeout(timeoutId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, once, hasTriggered, isMobile, delay]);
  
  return { ref, isInView };
}

/**
 * Hook pour obtenir les valeurs de transition optimisées pour mobile
 */
export function useMobileTransition(options: TransitionProps = {}) {
  const isMobile = useIsMobile();
  const [transitionStyle, setTransitionStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    // Ajuster les transitions en fonction du device
    const transition = getMobileTransition({
      ...options,
      // Réduire encore plus la durée sur les appareils très petits
      duration: isMobile ? Math.min(options.duration || 300, 200) : options.duration,
    });
    
    setTransitionStyle({
      transition
    });
  }, [isMobile, options]);
  
  return transitionStyle;
}

/**
 * Hook pour créer une transition d'entrée intelligente qui se déclenche une seule fois
 */
export function useEntryTransition(options: {
  type?: MobileTransitionType;
  duration?: number;
  delay?: number;
  easing?: MobileEasingType;
  threshold?: number;
  rootMargin?: string;
}) {
  const {
    type = "fade",
    duration = 300,
    delay = 0,
    easing = "ease-out",
    threshold = 0.1,
    rootMargin = "0px"
  } = options;
  
  const isMobile = useIsMobile();
  const { ref, isInView } = useInView({ 
    threshold, 
    rootMargin, 
    once: true,
    delay: isMobile ? 150 : 100
  });
  
  // Ajuster les durées pour les mobiles
  const adjustedDuration = isMobile ? Math.min(duration, 250) : duration;
  const adjustedDelay = isMobile ? Math.min(delay, 100) : delay;
  
  // Déterminer les styles CSS de transition
  const transitionStyle: React.CSSProperties = {
    transition: getMobileTransition({
      type,
      duration: adjustedDuration,
      delay: adjustedDelay,
      easing
    })
  };
  
  // Appliquer les styles de transformation selon le type de transition
  const transformStyle: React.CSSProperties = {};
  
  // État initial (avant d'être visible)
  if (!isInView) {
    transformStyle.opacity = 0;
    
    switch (type) {
      case "slide-up":
        transformStyle.transform = "translateY(20px)";
        break;
      case "slide-down":
        transformStyle.transform = "translateY(-20px)";
        break;
      case "slide-left":
        transformStyle.transform = "translateX(20px)";
        break;
      case "slide-right":
        transformStyle.transform = "translateX(-20px)";
        break;
      case "scale":
        transformStyle.transform = "scale(0.95)";
        break;
    }
  }
  
  return {
    ref,
    style: {
      ...transitionStyle,
      ...transformStyle
    },
    isInView
  };
}