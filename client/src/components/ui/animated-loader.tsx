import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LoaderVariant = 
  | "spinner" 
  | "dots" 
  | "pulse" 
  | "bounce" 
  | "bars" 
  | "wave" 
  | "circle" 
  | "progress" 
  | "ellipsis";

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

export type LoaderColor = 
  | "primary" 
  | "secondary" 
  | "accent" 
  | "white" 
  | "blue" 
  | "green" 
  | "amber" 
  | "red" 
  | "purple" 
  | "default";

interface AnimatedLoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: LoaderColor;
  className?: string;
  text?: string;
  progress?: number;
  isOverlay?: boolean;
  isIndeterminate?: boolean;
}

/**
 * Loader animé avec plusieurs variantes
 * Pour les transitions de chargement et les états d'attente
 */
export function AnimatedLoader({
  variant = "spinner",
  size = "md",
  color = "primary",
  className = "",
  text,
  progress,
  isOverlay = false,
  isIndeterminate = true
}: AnimatedLoaderProps) {
  // Taille selon la prop
  const getSize = () => {
    switch (size) {
      case "xs": return "h-4 w-4";
      case "sm": return "h-6 w-6";
      case "md": return "h-8 w-8";
      case "lg": return "h-12 w-12";
      case "xl": return "h-16 w-16";
      default: return "h-8 w-8";
    }
  };

  // Couleur selon la prop
  const getColor = () => {
    switch (color) {
      case "primary": return "text-primary";
      case "secondary": return "text-secondary";
      case "accent": return "text-accent";
      case "white": return "text-white";
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "amber": return "text-amber-500";
      case "red": return "text-red-600";
      case "purple": return "text-purple-600";
      case "default": return "text-foreground";
      default: return "text-primary";
    }
  };

  // Taille du conteneur pour les variantes spécifiques
  const getContainerSize = () => {
    switch (size) {
      case "xs": return "h-4";
      case "sm": return "h-6";
      case "md": return "h-8";
      case "lg": return "h-12";
      case "xl": return "h-16";
      default: return "h-8";
    }
  };

  // Fonction de conversion des caractères pour l'ellipsis
  // Peut être utilisée pour d'autres variantes si nécessaire
  const getSizeForText = () => {
    switch (size) {
      case "xs": return "text-xs";
      case "sm": return "text-sm";
      case "md": return "text-base";
      case "lg": return "text-lg";
      case "xl": return "text-xl";
      default: return "text-base";
    }
  };

  // Rendu selon la variante
  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <motion.div 
            className={cn("border-t-transparent rounded-full border-solid", getSize(), getColor())}
            style={{ 
              borderWidth: size === "xs" ? 2 : size === "sm" ? 3 : 4,
              borderStyle: "solid",
            }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 0.8, 
              ease: "linear", 
              repeat: Infinity 
            }}
          />
        );
        
      case "dots":
        return (
          <div className="flex space-x-1.5 justify-center items-center">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={cn("rounded-full", getColor())}
                style={{ 
                  width: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : size === "lg" ? 10 : 12,
                  height: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : size === "lg" ? 10 : 12,
                  backgroundColor: "currentColor" 
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.15
                }}
              />
            ))}
          </div>
        );
        
      case "pulse":
        return (
          <motion.div
            className={cn("rounded-full", getColor(), getSize())}
            style={{ backgroundColor: "currentColor" }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.9, 0.7]
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut", 
              repeat: Infinity 
            }}
          />
        );
        
      case "bounce":
        return (
          <div className="flex space-x-1.5 justify-center items-center">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={cn("rounded-full", getColor())}
                style={{ 
                  width: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : size === "lg" ? 10 : 12,
                  height: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : size === "lg" ? 10 : 12,
                  backgroundColor: "currentColor" 
                }}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.15
                }}
              />
            ))}
          </div>
        );
        
      case "bars":
        return (
          <div className="flex space-x-1 justify-center items-center">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className={cn("rounded-sm", getColor())}
                style={{ 
                  width: size === "xs" ? 3 : size === "sm" ? 4 : size === "md" ? 5 : size === "lg" ? 6 : 7,
                  height: size === "xs" ? 12 : size === "sm" ? 16 : size === "md" ? 24 : size === "lg" ? 32 : 40,
                  backgroundColor: "currentColor" 
                }}
                animate={{
                  height: [
                    size === "xs" ? 8 : size === "sm" ? 12 : size === "md" ? 16 : size === "lg" ? 24 : 32,
                    size === "xs" ? 16 : size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 40 : 48,
                    size === "xs" ? 8 : size === "sm" ? 12 : size === "md" ? 16 : size === "lg" ? 24 : 32,
                  ]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.15
                }}
              />
            ))}
          </div>
        );
        
      case "wave":
        return (
          <div className={cn("flex space-x-0.5 justify-center items-center", getContainerSize())}>
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className={cn("rounded-sm", getColor())}
                style={{ 
                  width: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : size === "lg" ? 5 : 6,
                  height: '100%',
                  backgroundColor: "currentColor" 
                }}
                animate={{
                  scaleY: [0.4, 1, 0.4],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.1
                }}
              />
            ))}
          </div>
        );
        
      case "circle":
        return (
          <svg className={cn(getSize(), getColor())} viewBox="0 0 50 50">
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
              stroke="currentColor"
              strokeDasharray={80}
              strokeDashoffset={80}
              animate={{ 
                strokeDashoffset: [80, 0, 80] 
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
          </svg>
        );
        
      case "progress":
        return (
          <div className={cn("w-full h-2 bg-gray-200 rounded-full overflow-hidden", getColor())}>
            <motion.div
              className="h-full rounded-full"
              style={{ 
                backgroundColor: "currentColor",
                width: isIndeterminate ? '100%' : `${progress || 0}%`
              }}
              {...(isIndeterminate 
                ? {
                    initial: { x: '-100%' },
                    animate: { x: '100%' },
                    transition: { 
                      duration: 1.5, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }
                  }
                : {
                    initial: { width: 0 },
                    animate: { width: `${progress || 0}%` },
                    transition: { duration: 0.3, ease: "easeOut" }
                  }
              )}
            />
          </div>
        );
        
      case "ellipsis":
        return (
          <div className={cn("flex h-full items-center", getSizeForText(), getColor())}>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut", 
                repeat: Infinity,
                times: [0, 0.5, 1],
                repeatDelay: 0.25
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut", 
                repeat: Infinity,
                times: [0, 0.5, 1],
                delay: 0.2,
                repeatDelay: 0.25
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut", 
                repeat: Infinity,
                times: [0, 0.5, 1],
                delay: 0.4,
                repeatDelay: 0.25
              }}
            >
              .
            </motion.span>
          </div>
        );
        
      default:
        return (
          <motion.div 
            className={cn("border-t-transparent rounded-full border-4 border-solid", getSize(), getColor())}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 0.8, 
              ease: "linear", 
              repeat: Infinity 
            }}
          />
        );
    }
  };

  if (isOverlay) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          {renderLoader()}
          {text && <p className="mt-4 text-center text-foreground">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {renderLoader()}
      {text && <p className={cn("mt-2", getSizeForText(), getColor())}>{text}</p>}
    </div>
  );
}