import React from "react";
import { EnedisPremiumLoader } from "./enedis-premium-loader";
import { EnedisEnhancedLoader } from "./enedis-enhanced-loader";
import { FrenchElectricLoader } from "./french-electric-loader";
import { cn } from "@/lib/utils";

type LoaderType = "premium" | "enhanced" | "electric" | "minimal";

interface EnedisLoaderManagerProps {
  type?: LoaderType;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showInfo?: boolean;
  showSteps?: boolean;
  showSecurity?: boolean;
}

/**
 * Gestionnaire centralisé des différents loaders Enedis
 * Permet de facilement changer le style de loader utilisé
 */
export function EnedisLoaderManager({
  type = "enhanced",
  size = "lg",
  className,
  showInfo = true,
  showSteps = true,
  showSecurity = true
}: EnedisLoaderManagerProps) {
  // Mettre la taille par défaut selon le type de loader
  const defaultSizeByType: Record<LoaderType, string> = {
    premium: "xl",
    enhanced: "lg",
    electric: "lg",
    minimal: "md"
  };
  
  // Utiliser la taille par défaut si aucune n'est spécifiée
  const effectiveSize = size || defaultSizeByType[type];
  
  // Rendu du loader selon le type
  return (
    <div className={cn("w-full", className)}>
      {type === "premium" && (
        <EnedisPremiumLoader
          size={effectiveSize as any}
          showFacts={showInfo}
          showSteps={showSteps}
          showTrustBadges={showSecurity}
        />
      )}
      
      {type === "enhanced" && (
        <EnedisEnhancedLoader
          size={effectiveSize as any}
          showInfo={showInfo}
          showSecurity={showSecurity}
        />
      )}
      
      {type === "electric" && (
        <FrenchElectricLoader
          size={effectiveSize as any}
          showFacts={showInfo}
          showSteps={showSteps}
        />
      )}
      
      {type === "minimal" && (
        <div className="flex flex-col items-center p-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1d4ed8" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">Raccordement Enedis</h3>
            <p className="text-sm text-gray-500 mb-4">Chargement en cours...</p>
          </div>
          <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full animate-[progress-bar_4s_ease-in-out_infinite]"></div>
          </div>
          {showSecurity && (
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mr-1"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Connexion sécurisée
            </div>
          )}
        </div>
      )}
    </div>
  );
}