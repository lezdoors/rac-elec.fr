import { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface AnimationProviderProps {
  children: ReactNode;
}

/**
 * Animation provider disabled for performance optimization
 * Returns children without any animations
 */
export function AnimationProvider({ children }: AnimationProviderProps) {
  // Performance optimization: disable all page transition animations
  return <>{children}</>;
}

/**
 * Hook pour déterminer le mode d'animation basé sur la complexité de la page
 * et le type de contexte ou d'interaction.
 */
export function useAnimationPreset() {
  // Détermine le type d'animation à utiliser basé sur la route actuelle
  const [location] = useLocation();
  
  // Type d'animation par défaut (peut être ajusté en fonction de la route)
  let animationType = "default";
  
  // Ajuste le type d'animation en fonction de la route
  if (location.startsWith("/admin")) {
    animationType = "admin";
  } else if (location.startsWith("/confirmation")) {
    animationType = "confirmation";
  } else if (location.startsWith("/raccordement")) {
    animationType = "form";
  }
  
  // Retourne les paramètres d'animation
  switch (animationType) {
    case "admin":
      return {
        transition: { type: "spring", stiffness: 300, damping: 30 },
        duration: 0.3,
        cardStagger: 0.05,
      };
    case "form":
      return {
        transition: { type: "spring", stiffness: 400, damping: 35 },
        duration: 0.4,
        cardStagger: 0.08,
      };
    case "confirmation":
      return {
        transition: { type: "spring", stiffness: 250, damping: 25 },
        duration: 0.5,
        cardStagger: 0.1,
      };
    default:
      return {
        transition: { type: "tween", ease: "easeInOut" },
        duration: 0.3,
        cardStagger: 0.05,
      };
  }
}