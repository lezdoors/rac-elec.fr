import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StartupAnimationProps {
  onComplete?: () => void;
}

export function StartupAnimation({ onComplete }: StartupAnimationProps) {
  const [isActive, setIsActive] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  
  useEffect(() => {
    // Vérifier si l'animation a déjà été montrée dans cette session
    const hasSeenAnimation = sessionStorage.getItem('hasSeenStartupAnimation');
    
    if (hasSeenAnimation) {
      // Si déjà vue, ne pas afficher l'animation
      setIsActive(false);
      if (onComplete) onComplete();
      return;
    }
    
    let timeoutIds: number[] = [];
    
    // Phase 1: Animation initiale (0-400ms)
    timeoutIds.push(window.setTimeout(() => {
      setCurrentPhase(2);
    }, 400));
    
    // Phase 2: Animation complète (400-1500ms)
    timeoutIds.push(window.setTimeout(() => {
      setCurrentPhase(3);
    }, 1500));
    
    // Phase 3: Disparition (1500-2500ms)
    timeoutIds.push(window.setTimeout(() => {
      setCurrentPhase(4);
      
      // Phase 4: Fin de l'animation après 600ms
      timeoutIds.push(window.setTimeout(() => {
        setIsActive(false);
        
        // Marquer l'animation comme vue pour cette session
        sessionStorage.setItem('hasSeenStartupAnimation', 'true');
        
        // Callback de fin d'animation
        if (onComplete) {
          onComplete();
        }
      }, 600));
    }, 2500));
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [onComplete]);
  
  if (!isActive) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center bg-blue-900",
      "transition-opacity duration-600",
      currentPhase >= 4 ? "opacity-0" : "opacity-100"
    )}>
      <div className="relative max-w-lg w-full h-96 flex items-center justify-center">
        {/* Logo et éléments électriques */}
        <div className={cn(
          "relative z-10 flex flex-col items-center justify-center",
          "transition-all duration-700",
          currentPhase >= 2 ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}>
          {/* Logo animé */}
          <div className="relative h-32 w-48 mb-8">
            {/* Forme de base fluide */}
            <svg className={cn(
              "w-full h-full transform transition-transform duration-700",
              currentPhase >= 3 ? "scale-110" : "scale-100"
            )} 
              viewBox="0 0 100 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Définition du dégradé */}
              <defs>
                <linearGradient id="gradient-blue-startup" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="gradient-yellow-startup" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              
              {/* Forme fluide électrique */}
              <path 
                d="M30 20C20 35 50 50 30 65C40 75 70 75 80 55C95 30 65 5 30 20Z" 
                className={cn(
                  "fill-blue-300 opacity-90 transition-all duration-700",
                  currentPhase >= 3 ? "opacity-100" : "opacity-80"
                )}
              />
              
              {/* Formes d'énergie fluides */}
              <path 
                d="M35 30C30 40 45 45 40 55C45 60 60 60 65 50C75 35 55 20 35 30Z" 
                className={cn(
                  "fill-blue-400 transition-all duration-700",
                  currentPhase >= 3 ? "opacity-100" : "opacity-90"
                )}
              />
              
              {/* Élément central lumineux */}
              <path 
                d="M45 35C43 40 50 42 48 48C50 50 57 50 60 45C65 37 55 30 45 35Z" 
                fill="url(#gradient-yellow-startup)" 
                className={cn(
                  "animate-morph transition-opacity duration-700",
                  currentPhase >= 3 ? "opacity-100" : "opacity-90"
                )}
              />
            </svg>
            
            {/* Éclair central */}
            <svg 
              className={cn(
                "absolute top-1/2 left-1/2 h-16 w-16 transform -translate-x-1/2 -translate-y-1/2",
                "transition-all duration-700",
                currentPhase >= 3 ? "scale-110 animate-subtle-pulse" : "scale-100"
              )} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M14.5 4H9.5L7 13H10.5L8 20L17 9H13L14.5 4Z" 
                className="fill-white drop-shadow-glow-lg" 
              />
            </svg>
          </div>
          
          {/* Texte du logo */}
          <div className={cn(
            "flex flex-col items-center transition-all duration-700",
            currentPhase >= 3 ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
          )}>
            <div className="flex items-center">
              <span className="font-bold text-4xl text-[#33b060] tracking-tight">Services</span>
              <span className="font-bold text-4xl text-white tracking-tight ml-2">Enedis</span>
            </div>
            <div className="text-sm text-white/90 mt-1 tracking-wide">
              Raccordement et services électriques
            </div>
          </div>
        </div>
        
        {/* Lignes électriques animées */}
        <div className={cn(
          "absolute inset-0 overflow-hidden",
          currentPhase >= 2 ? "opacity-100" : "opacity-0",
          "transition-opacity duration-500"
        )}>
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "absolute h-[2px] bg-blue-300 transition-all duration-700 ease-in-out",
                i % 2 === 0 ? "left-0" : "right-0",
                i < 4 ? "top-[calc(25%_*_var(--offset))]" : "bottom-[calc(25%_*_var(--offset))]"
              )}
              style={{
                width: currentPhase >= 3 ? '100%' : `${30 + (i * 5)}%`,
                '--offset': i % 4 + 1,
                transitionDelay: `${i * 50}ms`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
        
        {/* Pulsations d'énergie autour */}
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
              "border-4 border-blue-400/30",
              "animate-ripple",
              currentPhase < 3 ? "opacity-0" : "opacity-100",
              "transition-opacity duration-500"
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