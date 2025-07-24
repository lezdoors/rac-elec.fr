import { useQuery } from "@tanstack/react-query";
import { UiAnimation } from "@shared/schema";
import { LoaderOptions } from "@/components/ui/professional-loader";

// Type pour la configuration des loaders en fonction de la catégorie
export type LoaderConfigByCategory = Record<string, LoaderOptions>;

/**
 * Hook pour récupérer la configuration des loaders
 * 
 * @param category Catégorie optionnelle de l'animation (form, payment, loading, etc.)
 * @returns Configuration des loaders et indication de chargement
 */
export function useLoaderConfig(category?: string) {
  const { data: animations, isLoading } = useQuery<UiAnimation[]>({
    queryKey: ["/api/ui-animations"],
    // Si les données ne peuvent pas être récupérées, on utilisera la configuration par défaut
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fonction pour obtenir la configuration d'animation par défaut
  function getDefaultLoaderConfig(): LoaderOptions {
    return {
      animation: "tricolor",
      variant: "primary",
      size: "md",
      showText: true,
      text: "Chargement en cours",
      showIcon: true,
      invertColors: false,
      opacity: 1,
      speed: "normal",
      strokeWidth: 2.5,
      dotCount: 3,
      progressValue: 75,
    };
  }

  // Fonction pour obtenir la configuration d'animation par catégorie
  function getLoaderConfigByCategory(requestedCategory: string): LoaderOptions {
    // Si pas d'animations ou chargement en cours, retourner la config par défaut
    if (!animations || animations.length === 0) {
      return getDefaultLoaderConfig();
    }

    // Trouver l'animation de la catégorie demandée qui est activée et par défaut
    const categoryAnimation = animations.find(
      (anim) => anim.category === requestedCategory && anim.enabled && anim.default
    );

    // Ou prendre n'importe quelle animation activée de cette catégorie
    if (!categoryAnimation) {
      const anyEnabled = animations.find(
        (anim) => anim.category === requestedCategory && anim.enabled
      );

      if (anyEnabled) {
        return anyEnabled.config as unknown as LoaderOptions;
      }
    } else {
      return categoryAnimation.config as unknown as LoaderOptions;
    }

    // Fallback sur l'animation par défaut
    return getDefaultLoaderConfig();
  }

  // Fonction pour vérifier si les animations sont globalement activées
  function areAnimationsEnabled(): boolean {
    // Si chargement en cours ou données indisponibles, considérer activé
    if (isLoading || !animations) {
      return true;
    }
    
    // Vérifier s'il y a au moins une animation activée
    return animations.some(anim => anim.enabled);
  }

  // Retourne les fonctions et données utiles
  return {
    getDefaultLoaderConfig,
    getLoaderConfigByCategory,
    areAnimationsEnabled,
    isLoading,
    animations
  };
}