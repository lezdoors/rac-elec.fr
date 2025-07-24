import React from "react";
import { cn } from "@/lib/utils";
import { ProfessionalLoader, LoaderOptions } from "./professional-loader";
import { useLoaderConfig } from "@/hooks/use-loader-config";

interface SmartLoaderProps {
  category?: string;
  options?: Partial<LoaderOptions>;
  className?: string;
}

/**
 * Composant de chargement intelligent qui utilise les configurations de la base de données
 * Affiche l'animation appropriée en fonction de la catégorie et des paramètres d'activation
 */
export function SmartLoader({
  category = "loading",
  options = {},
  className,
}: SmartLoaderProps) {
  const { 
    getLoaderConfigByCategory, 
    areAnimationsEnabled
  } = useLoaderConfig();

  // Si les animations sont désactivées, on affiche un loader basique amélioré
  if (!areAnimationsEnabled()) {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <div className="relative w-14 h-14">
          {/* Anneau de fond */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-30"></div>
          
          {/* Anneau rotatif principal */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500 animate-spin"></div>
          
          {/* Point lumineux */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          
          {/* Anneau central lumineux */}
          <div className="absolute inset-1/4 rounded-full bg-blue-50 opacity-30 animate-pulse"></div>
        </div>
        
        {options.showText !== false && (
          <p className="mt-3 text-sm font-medium text-blue-700">
            {options.text || "Chargement..."}
          </p>
        )}
      </div>
    );
  }

  // Récupérer la configuration en fonction de la catégorie
  const baseConfig = getLoaderConfigByCategory(category);
  
  // Fusionner avec les options spécifiques
  const mergedConfig: LoaderOptions = {
    ...baseConfig,
    ...options
  };

  // Rendu du loader avec les options fusionnées
  return (
    <ProfessionalLoader 
      options={mergedConfig} 
      className={className} 
    />
  );
}