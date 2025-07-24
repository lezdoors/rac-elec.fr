import React from "react";
import { cn } from "@/lib/utils";

interface CircuitLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
  className?: string;
  text?: string;
  showText?: boolean;
}

/**
 * Circuit-themed loader animation component
 * 
 * @param size - Size of the loader (sm, md, lg, xl)
 * @param variant - Color variant (primary, secondary, white)
 * @param className - Additional CSS classes
 * @param text - Custom loading text
 * @param showText - Whether to show loading text
 */
export function CircuitLoader({
  size = "md",
  variant = "primary",
  className,
  text = "Chargement en cours",
  showText = true,
}: CircuitLoaderProps) {
  // Size mappings
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };
  
  // Color variants
  const variantClasses = {
    primary: {
      circuit: "stroke-blue-600",
      pulse: "fill-blue-600",
      dots: "fill-blue-400",
      lines: "stroke-blue-500",
      text: "text-blue-700"
    },
    secondary: {
      circuit: "stroke-[#32b34a]",
      pulse: "fill-[#32b34a]",
      dots: "fill-[#4cc866]",
      lines: "stroke-[#4cc866]",
      text: "text-[#32b34a]"
    },
    white: {
      circuit: "stroke-white",
      pulse: "fill-white",
      dots: "fill-white/80",
      lines: "stroke-white/80",
      text: "text-white"
    }
  };

  const selectedSize = sizeClasses[size];
  const selectedVariant = variantClasses[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", selectedSize)}>
        {/* Circuit Base */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Circuit Paths */}
          <path
            d="M50 10 L50 20 M50 80 L50 90 M20 50 L30 50 M70 50 L80 50 M30 30 L37 37 M63 37 L70 30 M30 70 L37 63 M63 63 L70 70"
            className={cn("stroke-2 animate-circuit-pulse", selectedVariant.circuit)}
            strokeLinecap="round"
          />

          {/* Circuit Dots */}
          <circle 
            cx="50" 
            cy="20" 
            r="3" 
            className={cn("animate-circuit-dot-1", selectedVariant.dots)} 
          />
          <circle 
            cx="70" 
            cy="30" 
            r="3" 
            className={cn("animate-circuit-dot-2", selectedVariant.dots)} 
          />
          <circle 
            cx="80" 
            cy="50" 
            r="3" 
            className={cn("animate-circuit-dot-3", selectedVariant.dots)} 
          />
          <circle 
            cx="70" 
            cy="70" 
            r="3" 
            className={cn("animate-circuit-dot-4", selectedVariant.dots)} 
          />
          <circle 
            cx="50" 
            cy="80" 
            r="3" 
            className={cn("animate-circuit-dot-5", selectedVariant.dots)} 
          />
          <circle 
            cx="30" 
            cy="70" 
            r="3" 
            className={cn("animate-circuit-dot-6", selectedVariant.dots)} 
          />
          <circle 
            cx="20" 
            cy="50" 
            r="3" 
            className={cn("animate-circuit-dot-7", selectedVariant.dots)} 
          />
          <circle 
            cx="30" 
            cy="30" 
            r="3" 
            className={cn("animate-circuit-dot-8", selectedVariant.dots)} 
          />

          {/* Central Element */}
          <circle
            cx="50"
            cy="50"
            r="15"
            className={cn("animate-pulse-slow", selectedVariant.pulse)}
            opacity="0.8"
          />

          {/* Lightning Bolt */}
          <path
            d="M54 38 L46 46 L54 54 L48 62"
            className={cn("stroke-2", selectedVariant.lines)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <p className={cn("mt-3 font-medium animate-pulse", selectedVariant.text)}>
          {text}
        </p>
      )}
    </div>
  );
}