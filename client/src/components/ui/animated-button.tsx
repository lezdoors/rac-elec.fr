import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { buttonTapAnimation } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary-gradient" | "success" | "purple" | "blue";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Bouton animé avec effets de pression et de survol
 * Étend le composant Button de shadcn/ui
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = "default", size = "default", className = "", isLoading, loadingText, ...props }, ref) => {
    return (
      <motion.div
        whileTap="tap"
        initial="rest"
        animate="rest"
        variants={buttonTapAnimation}
      >
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn("relative overflow-hidden", 
            variant === "primary-gradient" && "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-0",
            variant === "success" && "bg-green-600 text-white hover:bg-green-700 border-0",
            className
          )}
          disabled={isLoading}
          {...props}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
              {loadingText || children}
            </div>
          ) : (
            children
          )}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

/**
 * Bouton avec effet de surbrillance pour attirer l'attention
 */
export const PulseButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = "default", size = "default", className = "", isLoading, loadingText, ...props }, ref) => {
    return (
      <motion.div
        initial={{ boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)" }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(79, 70, 229, 0)",
            "0 0 0 4px rgba(79, 70, 229, 0.3)",
            "0 0 0 8px rgba(79, 70, 229, 0)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.5, 1]
        }}
        className="rounded-md"
      >
        <AnimatedButton
          ref={ref}
          variant={variant}
          size={size}
          className={className}
          isLoading={isLoading}
          loadingText={loadingText}
          {...props}
        >
          {children}
        </AnimatedButton>
      </motion.div>
    );
  }
);

PulseButton.displayName = "PulseButton";

/**
 * Bouton avec effet de glissement au survol
 */
export const GlowButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = "default", size = "default", className = "", isLoading, loadingText, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden group",
          variant === "primary-gradient" && "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-0",
          variant === "success" && "bg-green-600 text-white hover:bg-green-700 border-0",
          className
        )}
        disabled={isLoading}
        {...props}
      >
        <span className="relative z-10">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
              />
              {loadingText || children}
            </div>
          ) : (
            children
          )}
        </span>
        
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full z-0"
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </Button>
    );
  }
);

GlowButton.displayName = "GlowButton";