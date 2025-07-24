import React from "react";
import { cn } from "@/lib/utils";

interface FrenchFlagLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  text?: string;
}

/**
 * Composant de chargement avec le drapeau français, animation spéciale d'ondes tricolores
 */
export function FrenchFlagLoader({
  className,
  size = "md",
  showText = true,
  text = "Chargement en cours"
}: FrenchFlagLoaderProps) {
  // Mappage des tailles
  const sizeClasses = {
    sm: "w-16 h-16 text-xs",
    md: "w-24 h-24 text-sm",
    lg: "w-32 h-32 text-base",
    xl: "w-40 h-40 text-lg",
  };
  
  const selectedSize = sizeClasses[size];
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", selectedSize)}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Cercle de fond */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="1"
            opacity="0.2"
          />
          
          {/* Section bleue */}
          <path
            d="M60 10 A50 50 0 0 0 10 60 A50 50 0 0 0 60 110 L60 10 Z"
            className="fill-blue-600 opacity-90"
          />
          
          {/* Section blanche */}
          <path
            d="M60 10 A50 50 0 0 1 110 60 A50 50 0 0 1 60 110 L60 10 Z"
            className="fill-white opacity-90"
          />
          
          {/* Effet d'onde bleue */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="#1e40af"
            strokeWidth="2.5"
            strokeDasharray="60 180"
            strokeDashoffset="25"
            className="animate-spin"
            style={{ animationDuration: "3s" }}
          />
          
          {/* Effet d'onde blanche */}
          <circle
            cx="60"
            cy="60"
            r="32"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="50 150"
            strokeDashoffset="0"
            className="animate-spin"
            style={{ animationDuration: "4s" }}
          />
          
          {/* Effet d'onde rouge */}
          <circle
            cx="60"
            cy="60"
            r="24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeDasharray="40 120"
            strokeDashoffset="15"
            className="animate-spin-reverse"
            style={{ animationDuration: "3.5s" }}
          />
          
          {/* Cercle central tricolore */}
          <circle
            cx="60"
            cy="60"
            r="15"
            className="fill-white animate-pulse"
            style={{ animationDuration: "2s" }}
          />
          
          {/* Emblème au centre */}
          <path
            d="M55 50 L65 50 L60 58 L65 70 L55 70 L60 58 Z"
            className="fill-blue-600 animate-pulse"
            style={{ transformOrigin: "center", animationDuration: "2s" }}
          />
          
          {/* Effet de brillance */}
          <circle 
            cx="60" 
            cy="60" 
            r="48" 
            strokeWidth="0.5" 
            stroke="url(#blue-glow)" 
            className="opacity-50 animate-pulse-slow"
          />
          
          {/* Définition du dégradé pour la brillance */}
          <defs>
            <radialGradient id="blue-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="97%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <p className="mt-4 font-medium text-blue-600 animate-pulse"
           style={{ animationDuration: "3s" }}>
          {text}
        </p>
      )}
    </div>
  );
}