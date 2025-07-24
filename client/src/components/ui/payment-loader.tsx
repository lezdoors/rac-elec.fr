import React from "react";
import { cn } from "@/lib/utils";

interface PaymentLoaderProps {
  className?: string;
  message?: string;
  processingText?: string;
  size?: "sm" | "md" | "lg";
  showSecurityBadge?: boolean;
}

/**
 * Composant de chargement spécifique pour les paiements
 * Design professionnel avec animations subtiles pour rassurer l'utilisateur
 */
export function PaymentLoader({
  className,
  message = "Traitement de votre paiement",
  processingText = "Veuillez patienter",
  size = "md",
  showSecurityBadge = true
}: PaymentLoaderProps) {
  // Mappage des tailles
  const containerSizes = {
    sm: "max-w-xs",
    md: "max-w-sm", 
    lg: "max-w-md"
  };
  
  const iconSizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-5 rounded-lg bg-white shadow-xl border border-gray-100",
      containerSizes[size],
      className
    )}>
      {/* Icône de chargement principale */}
      <div className={cn("relative", iconSizes[size])}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Cercle extérieur de sécurité */}
          <circle
            cx="50"
            cy="50"
            r="48"
            strokeWidth="1"
            className="stroke-blue-100"
            opacity="0.7"
          />
          
          {/* Arc de progression principal */}
          <path
            d="M50 2 A48 48 0 0 1 98 50 A48 48 0 0 1 50 98 A48 48 0 0 1 2 50 A48 48 0 0 1 50 2"
            strokeWidth="4"
            className="stroke-blue-500 fill-none animate-circuit-flow"
            strokeLinecap="round"
            strokeDasharray="301.59 301.59" 
            strokeDashoffset="100"
          />
          
          {/* Effet de dégradé rotatif */}
          <circle
            cx="50"
            cy="50"
            r="40"
            strokeWidth="6"
            className="stroke-blue-200 fill-none animate-spin-slow"
            opacity="0.5"
            strokeDasharray="80 170"
            strokeDashoffset="0"
            style={{ transformOrigin: 'center' }}
          />
          
          {/* Cadenas sécurisé au centre */}
          <rect
            x="38"
            y="42"
            width="24"
            height="20"
            rx="3"
            className="fill-blue-600"
          />
          <rect
            x="44"
            y="36"
            width="12"
            height="10"
            rx="6"
            className="stroke-blue-600 fill-none"
            strokeWidth="3.5"
          />
          <circle
            cx="50"
            cy="52"
            r="2"
            className="fill-white animate-pulse"
          />
          <line
            x1="50"
            y1="52"
            x2="50"
            y2="56"
            className="stroke-white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Particules de sécurité animées */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-1/4 left-0 w-1 h-1 bg-blue-300 rounded-full animate-ping-slow" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-3/4 right-0 w-1 h-1 bg-blue-300 rounded-full animate-ping-slow" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping-slow" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping-slow" style={{ animationDelay: '1.1s' }}></div>
        </div>
      </div>
      
      {/* Message principal */}
      <h3 className="mt-4 text-blue-700 font-semibold text-center">
        {message}
      </h3>
      
      {/* Texte de traitement avec effet de points */}
      <div className="mt-2 flex items-center space-x-1 justify-center">
        <span className="text-gray-500 text-sm">{processingText}</span>
        <span className="inline-block w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
        <span className="inline-block w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
        <span className="inline-block w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
      </div>
      
      {/* Badge de paiement sécurisé */}
      {showSecurityBadge && (
        <div className="mt-4 flex items-center space-x-1 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" className="stroke-green-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L11 14L15 10" className="stroke-green-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Paiement sécurisé</span>
        </div>
      )}
    </div>
  );
}