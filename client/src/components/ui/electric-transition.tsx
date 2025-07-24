import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface ElectricTransitionProps {
  isActive: boolean;
  destination: string;
  onComplete?: () => void;
}

export function ElectricTransition({ isActive, destination, onComplete }: ElectricTransitionProps) {
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isActive) return;
    
    let timeoutId: number;
    
    // Phase 1: Initier l'animation (0-300ms)
    setCurrentPhase(1);
    
    // Phase 2: Intensifier l'animation (300-700ms)
    timeoutId = window.setTimeout(() => {
      setCurrentPhase(2);
    }, 300);
    
    // Phase 3: Transition complète et redirection (700-1000ms)
    const redirectTimeoutId = window.setTimeout(() => {
      setCurrentPhase(3);
      
      // Phase 4: Navigation et transition sortante
      const navigationTimeoutId = window.setTimeout(() => {
        navigate(destination);
        
        // Callback optionnel après complétion
        if (onComplete) {
          onComplete();
        }
        
        // Phase 5: Fin de l'animation (après 500ms supplémentaires)
        const cleanupTimeoutId = window.setTimeout(() => {
          setCurrentPhase(0);
        }, 500);
        
        return () => clearTimeout(cleanupTimeoutId);
      }, 300);
      
      return () => clearTimeout(navigationTimeoutId);
    }, 700);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(redirectTimeoutId);
    };
  }, [isActive, destination, navigate, onComplete]);
  
  if (!isActive && currentPhase === 0) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-500",
      currentPhase === 0 ? "opacity-0 pointer-events-none" : "opacity-100",
      currentPhase >= 3 ? "bg-blue-900" : "bg-blue-800/80"
    )}>
      {/* Conteneur principal */}
      <div className="relative max-w-lg w-full h-96 flex items-center justify-center">
        {/* Lignes électriques animées */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "absolute h-[2px] bg-blue-300 transition-all duration-700 ease-in-out",
                currentPhase >= 2 ? "opacity-100" : "opacity-60",
                i % 2 === 0 ? "left-0" : "right-0",
                i < 4 ? "top-[calc(25%_*_var(--offset))]" : "bottom-[calc(25%_*_var(--offset))]"
              )}
              style={{
                width: currentPhase >= 2 ? '100%' : `${30 + (i * 5)}%`,
                '--offset': i % 4 + 1,
                transitionDelay: `${i * 50}ms`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
        
        {/* Éclairs centraux */}
        <div className={cn(
          "relative z-10 flex flex-col items-center justify-center",
          currentPhase >= 2 ? "scale-110" : "scale-100",
          "transition-all duration-500"
        )}>
          {/* Orbe d'énergie */}
          <div className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center",
            "bg-gradient-to-r from-blue-500 to-electric-500",
            "before:absolute before:inset-0 before:rounded-full before:blur-lg before:bg-blue-400",
            "after:absolute after:inset-0 after:rounded-full after:blur-xl after:bg-blue-300/30",
            currentPhase >= 2 ? "animate-pulse-fast" : "animate-pulse",
          )}>
            <div className={cn(
              "absolute inset-2 rounded-full bg-white/20",
              "animate-ping",
              currentPhase >= 2 ? "opacity-70" : "opacity-30"
            )}></div>
            <div className="text-white text-xl font-bold">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={cn(
                  "w-10 h-10 stroke-white", 
                  currentPhase >= 2 ? "animate-pulse-fast" : ""
                )} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Texte de chargement */}
          <p className={cn(
            "mt-8 text-white font-medium transition-opacity duration-300",
            currentPhase >= 2 ? "opacity-100" : "opacity-80" 
          )}>
            Préparation de votre demande...
          </p>
        </div>
        
        {/* Pulsations d'énergie autour */}
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
              "border-4 border-blue-400/30",
              "animate-ripple",
              currentPhase < 2 ? "opacity-0" : "opacity-100"
            )}
            style={{
              width: `${200 + (i * 100)}px`,
              height: `${200 + (i * 100)}px`,
              animationDelay: `${i * 200}ms`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}