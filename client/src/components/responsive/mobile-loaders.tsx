import { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/mobile-optimizations";
import { Loader2, RefreshCcw, CircleOff } from "lucide-react";

interface MobileLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  thickness?: "thin" | "medium" | "thick";
  fullPage?: boolean;
  text?: string;
  className?: string;
}

/**
 * Loader adaptatif qui optimise le rendu sur mobile
 */
export function MobileLoader({
  size = "md", 
  color = "primary",
  thickness = "medium",
  fullPage = false,
  text,
  className
}: MobileLoaderProps) {
  const isMobile = useIsMobile();
  
  // Déterminer les tailles adaptées au device
  const getSize = () => {
    const sizes = {
      xs: isMobile ? 12 : 16,
      sm: isMobile ? 16 : 20,
      md: isMobile ? 20 : 24,
      lg: isMobile ? 24 : 32,
      xl: isMobile ? 32 : 40
    };
    
    return sizes[size];
  };
  
  // Déterminer l'épaisseur du trait
  const getStrokeWidth = () => {
    const strokeWidths = {
      thin: isMobile ? 1.5 : 2,
      medium: isMobile ? 2 : 2.5,
      thick: isMobile ? 2.5 : 3
    };
    
    return strokeWidths[thickness];
  };
  
  // Déterminer la couleur
  const getColorClass = () => {
    const colors = {
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
      info: "text-blue-500"
    };
    
    return colors[color];
  };
  
  // Ajuster la vitesse d'animation sur mobile
  const spinDuration = isMobile ? 1 : 1.2;
  
  // Version pleine page
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 z-50">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          <Loader2 
            className={cn(
              "animate-spin", 
              getColorClass(),
              className
            )} 
            size={getSize() * 1.5} 
            strokeWidth={getStrokeWidth()} 
          />
          
          {text && (
            <p className={cn(
              "mt-4 text-gray-600 dark:text-gray-300",
              isMobile ? "text-sm" : "text-base"
            )}>
              {text}
            </p>
          )}
        </motion.div>
      </div>
    );
  }
  
  // Version standard
  return (
    <Loader2 
      className={cn(
        "animate-spin", 
        getColorClass(),
        className
      )} 
      size={getSize()} 
      strokeWidth={getStrokeWidth()} 
      style={{ animationDuration: `${spinDuration}s` }}
    />
  );
}

interface MobileLoadingStateProps {
  isLoading: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  isIdle?: boolean;
  children: ReactNode;
  loaderSize?: "xs" | "sm" | "md" | "lg" | "xl";
  loaderColor?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  loaderText?: string;
  errorText?: string;
  errorIcon?: ReactNode;
  onRetry?: () => void;
  className?: string;
  minimumLoadingTime?: number;
}

/**
 * Composant d'état de chargement qui affiche le contenu approprié selon l'état
 */
export function MobileLoadingState({
  isLoading,
  isError = false,
  isSuccess = false,
  isIdle = false,
  children,
  loaderSize = "md",
  loaderColor = "primary",
  loaderText,
  errorText = "Une erreur est survenue",
  errorIcon,
  onRetry,
  className,
  minimumLoadingTime = 0
}: MobileLoadingStateProps) {
  const isMobile = useIsMobile();
  
  // Si en chargement, afficher le loader
  if (isLoading) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-4 min-h-[150px]",
        className
      )}>
        <MobileLoader 
          size={loaderSize} 
          color={loaderColor} 
          text={loaderText} 
        />
      </div>
    );
  }
  
  // Si en erreur, afficher le message d'erreur
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex flex-col items-center justify-center p-4 min-h-[150px] text-center",
          className
        )}
      >
        <div className="text-red-500 mb-3">
          {errorIcon || <CircleOff size={isMobile ? 24 : 32} />}
        </div>
        
        <p className={cn(
          "mb-3 text-gray-600 dark:text-gray-300",
          isMobile ? "text-sm" : "text-base"
        )}>
          {errorText}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 mt-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCcw size={14} />
            <span>Réessayer</span>
          </button>
        )}
      </motion.div>
    );
  }
  
  // Si idle sans données, ne rien afficher ou afficher un message spécifique
  if (isIdle) {
    return null;
  }
  
  // Si succès ou par défaut, afficher les enfants
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: isMobile ? 0.2 : 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MobileProgressBarProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  showValue?: boolean;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  height?: "xs" | "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Barre de progression adaptée aux appareils mobiles
 */
export function MobileProgressBar({
  value,
  max = 100,
  showPercentage = false,
  showValue = false,
  color = "primary",
  height = "md",
  animated = true,
  className,
  style
}: MobileProgressBarProps) {
  const isMobile = useIsMobile();
  
  // Calculer le pourcentage et le limiter entre 0 et 100
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Déterminer la hauteur de la barre
  const getHeightClass = () => {
    const heights = {
      xs: isMobile ? "h-1" : "h-1.5",
      sm: isMobile ? "h-1.5" : "h-2",
      md: isMobile ? "h-2" : "h-3",
      lg: isMobile ? "h-3" : "h-4"
    };
    
    return heights[height];
  };
  
  // Déterminer la couleur de la barre
  const getColorClass = () => {
    const colors = {
      primary: "bg-primary",
      secondary: "bg-secondary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      info: "bg-blue-500"
    };
    
    return colors[color];
  };
  
  return (
    <div className={cn("w-full", className)}>
      {(showPercentage || showValue) && (
        <div className="flex justify-between mb-1">
          {showValue && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {value} / {max}
            </span>
          )}
          
          {showPercentage && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
          getHeightClass()
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            getColorClass(),
            animated && "relative overflow-hidden"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0,
            ease: "easeOut" 
          }}
          style={style}
        >
          {animated && percentage > 15 && (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                animation: "shimmer 1.5s infinite",
                backgroundSize: "200% 100%"
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface MobileSkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar" | "button";
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animation?: "pulse" | "shimmer" | "none";
  className?: string;
  style?: CSSProperties;
}

/**
 * Squelette de chargement optimisé pour mobile
 */
export function MobileSkeleton({
  variant = "text",
  width,
  height,
  rounded = false,
  animation = "pulse",
  className,
  style
}: MobileSkeletonProps) {
  const isMobile = useIsMobile();
  
  // Déterminer les dimensions par défaut selon le variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case "text":
        return { width: "100%", height: isMobile ? "1rem" : "1.25rem" };
      case "circular":
        return { width: isMobile ? "2.5rem" : "3rem", height: isMobile ? "2.5rem" : "3rem" };
      case "rectangular":
        return { width: "100%", height: isMobile ? "8rem" : "10rem" };
      case "card":
        return { width: "100%", height: isMobile ? "12rem" : "15rem" };
      case "avatar":
        return { width: isMobile ? "2rem" : "2.5rem", height: isMobile ? "2rem" : "2.5rem" };
      case "button":
        return { width: isMobile ? "6rem" : "8rem", height: isMobile ? "2rem" : "2.5rem" };
      default:
        return { width: "100%", height: "1.25rem" };
    }
  };
  
  const defaultDimensions = getDefaultDimensions();
  
  // Déterminer les classes pour la forme
  const getShapeClasses = () => {
    switch (variant) {
      case "text":
        return "rounded";
      case "circular":
      case "avatar":
        return "rounded-full";
      case "button":
        return "rounded-md";
      case "card":
        return "rounded-lg";
      default:
        return rounded ? "rounded-md" : "";
    }
  };
  
  // Déterminer les classes pour l'animation
  const getAnimationClasses = () => {
    switch (animation) {
      case "pulse":
        return "animate-pulse";
      case "shimmer":
        return "skeleton-shimmer";
      default:
        return "";
    }
  };
  
  // Ajustement des animations pour mobile
  const mobileAnimationStyle = isMobile && animation === "shimmer" ? {
    animationDuration: "1.5s" // Plus rapide sur mobile
  } : {};
  
  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-700",
        getShapeClasses(),
        getAnimationClasses(),
        className
      )}
      style={{
        width: width || defaultDimensions.width,
        height: height || defaultDimensions.height,
        ...mobileAnimationStyle,
        ...style
      }}
    />
  );
}