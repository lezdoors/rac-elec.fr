import React from "react";
import { cn } from "@/lib/utils";

// Types d'animations disponibles
export type LoaderAnimationType = 
  | "circuit" 
  | "dots" 
  | "progress" 
  | "pulse" 
  | "wave" 
  | "spinner"
  | "tricolor"
  | "elegant";

// Types de variantes de couleurs
export type LoaderVariant = 
  | "primary" 
  | "secondary" 
  | "success" 
  | "info" 
  | "warning" 
  | "danger" 
  | "light" 
  | "dark";

// Tailles disponibles
export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

// Options configurables via l'interface admin
export interface LoaderOptions {
  animation: LoaderAnimationType;
  variant: LoaderVariant;
  size: LoaderSize;
  showText: boolean;
  text?: string;
  showIcon?: boolean;
  invertColors?: boolean;
  opacity?: number;
  speed?: "slow" | "normal" | "fast";
  // Options spécifiques aux animations
  strokeWidth?: number;
  dotCount?: number;
  progressValue?: number;
}

interface ProfessionalLoaderProps {
  options?: Partial<LoaderOptions>;
  className?: string;
}

/**
 * Composant de chargement professionnel configurable via l'interface admin
 */
export function ProfessionalLoader({
  options,
  className,
}: ProfessionalLoaderProps) {
  // Valeurs par défaut combinées avec les options fournies
  const config: LoaderOptions = {
    animation: options?.animation || "circuit",
    variant: options?.variant || "primary",
    size: options?.size || "md",
    showText: options?.showText !== undefined ? options?.showText : true,
    text: options?.text || "Chargement en cours",
    showIcon: options?.showIcon !== undefined ? options?.showIcon : true,
    invertColors: options?.invertColors || false,
    opacity: options?.opacity || 1,
    speed: options?.speed || "normal",
    strokeWidth: options?.strokeWidth || 2,
    dotCount: options?.dotCount || 3,
    progressValue: options?.progressValue || 75,
  };

  // Mappage des tailles
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-24 h-24 text-lg",
    xl: "w-32 h-32 text-xl",
  };

  // Mappage des variantes de couleurs
  const variantClasses: Record<LoaderVariant, { base: string; light: string; dark: string; bg: string; text: string }> = {
    primary: {
      base: "fill-blue-500 stroke-blue-500",
      light: "fill-blue-300 stroke-blue-300",
      dark: "fill-blue-700 stroke-blue-700",
      bg: "bg-blue-100",
      text: "text-blue-700"
    },
    secondary: {
      base: "fill-gray-500 stroke-gray-500",
      light: "fill-gray-300 stroke-gray-300",
      dark: "fill-gray-700 stroke-gray-700",
      bg: "bg-gray-100",
      text: "text-gray-700"
    },
    success: {
      base: "fill-green-500 stroke-green-500",
      light: "fill-green-300 stroke-green-300",
      dark: "fill-green-700 stroke-green-700",
      bg: "bg-green-100",
      text: "text-green-700"
    },
    info: {
      base: "fill-cyan-500 stroke-cyan-500",
      light: "fill-cyan-300 stroke-cyan-300",
      dark: "fill-cyan-700 stroke-cyan-700",
      bg: "bg-cyan-100",
      text: "text-cyan-700"
    },
    warning: {
      base: "fill-amber-500 stroke-amber-500",
      light: "fill-amber-300 stroke-amber-300",
      dark: "fill-amber-700 stroke-amber-700",
      bg: "bg-amber-100",
      text: "text-amber-700"
    },
    danger: {
      base: "fill-red-500 stroke-red-500",
      light: "fill-red-300 stroke-red-300",
      dark: "fill-red-700 stroke-red-700",
      bg: "bg-red-100",
      text: "text-red-700"
    },
    light: {
      base: "fill-gray-200 stroke-gray-200",
      light: "fill-gray-100 stroke-gray-100",
      dark: "fill-gray-300 stroke-gray-300",
      bg: "bg-gray-50",
      text: "text-gray-600"
    },
    dark: {
      base: "fill-gray-800 stroke-gray-800",
      light: "fill-gray-600 stroke-gray-600",
      dark: "fill-gray-900 stroke-gray-900",
      bg: "bg-gray-200",
      text: "text-gray-900"
    }
  };

  // Styles de vitesse pour les animations
  const speedClasses = {
    slow: {
      pulse: "animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]",
      spin: "animate-[spin_3s_linear_infinite]",
      ping: "animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"
    },
    normal: {
      pulse: "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
      spin: "animate-[spin_1.5s_linear_infinite]",
      ping: "animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
    },
    fast: {
      pulse: "animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]",
      spin: "animate-[spin_0.75s_linear_infinite]",
      ping: "animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"
    }
  };

  // Appliquer l'opacité
  const opacityStyle = { opacity: config.opacity };

  // Sélection du thème de couleur
  const selectedVariant = variantClasses[config.variant];
  const selectedSize = sizeClasses[config.size];
  const speedVariant = speedClasses[config.speed || "normal"];

  // Fonction de rendu pour les différentes animations
  const renderAnimation = () => {
    switch (config.animation) {
      case "dots":
        return renderDotsAnimation();
      case "circuit":
        return renderCircuitAnimation();
      case "progress":
        return renderProgressAnimation();
      case "pulse":
        return renderPulseAnimation();
      case "wave":
        return renderWaveAnimation();
      case "tricolor":
        return renderTricolorAnimation();
      case "elegant":
        return renderElegantAnimation();
      case "spinner":
      default:
        return renderSpinnerAnimation();
    }
  };

  // Animation de chargement avec points (...)
  const renderDotsAnimation = () => {
    const dots = [];
    const dotCount = config.dotCount || 3;
    for (let i = 0; i < dotCount; i++) {
      dots.push(
        <div
          key={i}
          className={cn(
            "rounded-full",
            selectedVariant.base,
            "animate-[bounce_1.4s_infinite]"
          )}
          style={{
            width: `${Math.max(8, 24 / dotCount)}px`,
            height: `${Math.max(8, 24 / dotCount)}px`,
            margin: "0 3px",
            animationDelay: `${i * 0.16}s`
          }}
        />
      );
    }

    return (
      <div className="flex justify-center items-center">
        {dots}
      </div>
    );
  };

  // Animation de circuit électrique professionnel
  const renderCircuitAnimation = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fond semi-transparent */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="5"
          className={selectedVariant.bg}
          opacity="0.3"
        />
        
        {/* Cercle principal */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          strokeWidth={config.strokeWidth}
          className={cn(selectedVariant.base, speedVariant.pulse)}
          strokeDasharray="15,5"
        />
        
        {/* Lignes de circuit horizontales */}
        <line
          x1="20" y1="30" x2="80" y2="30"
          strokeWidth={config.strokeWidth}
          className={selectedVariant.light}
          strokeDasharray="5,3"
        />
        <line
          x1="20" y1="70" x2="80" y2="70"
          strokeWidth={config.strokeWidth}
          className={selectedVariant.light}
          strokeDasharray="5,3"
        />
        
        {/* Lignes de circuit verticales */}
        <line
          x1="30" y1="20" x2="30" y2="80"
          strokeWidth={config.strokeWidth}
          className={selectedVariant.light}
          strokeDasharray="5,3"
        />
        <line
          x1="70" y1="20" x2="70" y2="80"
          strokeWidth={config.strokeWidth}
          className={selectedVariant.light}
          strokeDasharray="5,3"
        />
        
        {/* Connexions de circuit */}
        <circle cx="30" cy="30" r="3" className={cn(selectedVariant.base, "animate-[pulse_1.5s_ease-in-out_infinite_0.1s]")} />
        <circle cx="30" cy="70" r="3" className={cn(selectedVariant.base, "animate-[pulse_1.5s_ease-in-out_infinite_0.2s]")} />
        <circle cx="70" cy="30" r="3" className={cn(selectedVariant.base, "animate-[pulse_1.5s_ease-in-out_infinite_0.3s]")} />
        <circle cx="70" cy="70" r="3" className={cn(selectedVariant.base, "animate-[pulse_1.5s_ease-in-out_infinite_0.4s]")} />
        
        {/* Icône d'électricité */}
        {config.showIcon && (
          <path
            d="M50 30 L55 45 L65 45 L55 55 L60 70 L48 60 L36 70 L40 55 L30 45 L40 45 L45 30"
            fill="none"
            strokeWidth={config.strokeWidth! + 0.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            className={cn(selectedVariant.dark, speedVariant.pulse)}
          />
        )}
      </svg>
    );
  };

  // Animation de barre de progression
  const renderProgressAnimation = () => {
    return (
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            config.variant === "primary" ? "bg-blue-600" : 
            config.variant === "success" ? "bg-green-600" :
            config.variant === "warning" ? "bg-amber-600" :
            config.variant === "danger" ? "bg-red-600" :
            config.variant === "info" ? "bg-cyan-600" :
            config.variant === "secondary" ? "bg-gray-600" :
            config.variant === "light" ? "bg-gray-400" :
            "bg-gray-800", // dark
            speedVariant.pulse
          )}
          style={{
            width: `${config.progressValue}%`,
            transition: "width 0.3s ease-in-out"
          }}
        />
      </div>
    );
  };

  // Animation pulsante
  const renderPulseAnimation = () => {
    return (
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-full",
          selectedVariant.base,
          "opacity-75",
          speedVariant.ping
        )} />
        <div className={cn(
          "relative rounded-full",
          selectedVariant.dark,
          "w-full h-full"
        )} />
      </div>
    );
  };

  // Animation d'onde (wave)
  const renderWaveAnimation = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M10,50 Q25,30 40,50 T70,50 T100,50"
          fill="none"
          strokeWidth={config.strokeWidth}
          className={cn(selectedVariant.base, speedVariant.pulse)}
          strokeLinecap="round"
        />
        <path
          d="M10,50 Q25,70 40,50 T70,50 T100,50"
          fill="none"
          strokeWidth={config.strokeWidth}
          className={cn(selectedVariant.light, "animate-[pulse_2s_ease-in-out_infinite_0.5s]")}
          strokeLinecap="round"
        />
        
        {config.showIcon && (
          <g className={speedVariant.pulse}>
            <circle cx="40" cy="50" r="5" className={selectedVariant.dark} />
            <circle cx="70" cy="50" r="5" className={selectedVariant.dark} />
          </g>
        )}
      </svg>
    );
  };

  // Animation de spinner
  const renderSpinnerAnimation = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full", speedVariant.spin)}
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          strokeWidth={config.strokeWidth}
          className={selectedVariant.light}
          opacity="0.3"
        />
        <path
          d="M50 10 A40 40 0 0 1 90 50"
          strokeWidth={config.strokeWidth! + 1}
          strokeLinecap="round"
          className={selectedVariant.base}
        />
        
        {config.showIcon && (
          <circle cx="90" cy="50" r="5" className={selectedVariant.dark} />
        )}
      </svg>
    );
  };

  // Animation tricolore avec les couleurs de la France
  const renderTricolorAnimation = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Cercle de fond */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#f5f5f5"
          strokeWidth={config.strokeWidth! * 0.8}
          opacity="0.2"
        />
        
        {/* Anneau bleu */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#005cbf"
          strokeWidth={config.strokeWidth}
          strokeDasharray="50 150"
          strokeDashoffset="25"
          className={speedVariant.spin}
        />
        
        {/* Anneau blanc */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="#ffffff"
          strokeWidth={config.strokeWidth}
          strokeDasharray="40 120"
          strokeDashoffset="0"
          className={cn(speedVariant.spin, "animate-[spin_2s_linear_infinite]")}
        />
        
        {/* Anneau rouge */}
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke="#ef4444"
          strokeWidth={config.strokeWidth}
          strokeDasharray="30 90"
          strokeDashoffset="15"
          className={cn(speedVariant.spin, "animate-[spin_1.5s_linear_infinite_reverse]")}
        />
        
        {/* Emblème au centre */}
        {config.showIcon && (
          <>
            <circle cx="50" cy="50" r="12" fill="#f5f5f5" opacity="0.9" className="animate-pulse" />
            <path
              d="M45 42 L55 42 L50 50 L55 58 L45 58 L50 50 Z"
              fill="#005cbf"
              className="animate-pulse"
            />
          </>
        )}
      </svg>
    );
  };

  // Animation élégante avec effet de particules
  const renderElegantAnimation = () => {
    // Créer plusieurs points qui se déplacent en cercle
    const particles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const delay = i * (1 / particleCount);
      const angle = (i / particleCount) * 360;
      const radius = 35;
      const sizeVariation = Math.floor(i % 3);
      
      const particleSize = 2.5 + sizeVariation * 0.8;
      
      // Couleur basée sur la position (variation de la couleur sélectionnée)
      const colorClass = i % 3 === 0 
        ? selectedVariant.dark 
        : i % 3 === 1 
          ? selectedVariant.base 
          : selectedVariant.light;
      
      particles.push(
        <g key={i} className="transform-origin-center" style={{ animationDelay: `${delay}s` }}>
          <circle
            cx={50 + radius * Math.cos(angle * Math.PI / 180)}
            cy={50 + radius * Math.sin(angle * Math.PI / 180)}
            r={particleSize}
            className={cn(
              colorClass,
              "animate-elegant-particle"
            )}
            style={{ 
              transformOrigin: "center",
              opacity: 0.9 - (i % 3) * 0.15,
              animationDelay: `${delay}s` 
            }}
          />
        </g>
      );
    }
    
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Cercle de fond avec motion blur */}
        <circle
          cx="50"
          cy="50"
          r="42"
          className={cn(selectedVariant.bg)}
          opacity="0.2"
        />
        
        {/* Anneau principal */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          strokeWidth={config.strokeWidth}
          className={selectedVariant.light}
          opacity="0.4"
          strokeDasharray="3,3"
        />
        
        {/* Particules */}
        {particles}
        
        {/* Icône centrale */}
        {config.showIcon && (
          <circle
            cx="50"
            cy="50"
            r="8"
            className={cn(selectedVariant.base, "animate-pulse")}
            style={{ animationDuration: "2s" }}
          />
        )}
      </svg>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        className
      )}
      style={opacityStyle}
    >
      <div className={cn("relative", selectedSize)}>
        {renderAnimation()}
      </div>

      {config.showText && (
        <p className={cn(
          "mt-3 font-medium animate-pulse",
          selectedVariant.text
        )}>
          {config.text}
        </p>
      )}
    </div>
  );
}