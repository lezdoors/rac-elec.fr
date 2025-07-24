import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Power } from "lucide-react";

// Composant logoElectricIcon moderne et élégant
export const LogoElectricIcon = ({ mode = "light", size = "md", className = "" }: { mode?: "light" | "dark" | "footer", size?: "sm" | "md" | "lg", className?: string }) => {
  // Définition des tailles
  const sizes = {
    sm: "w-6 h-6",
    md: "w-9 h-9",
    lg: "w-12 h-12"
  };
  
  // Définition des couleurs selon le mode
  const colors = {
    light: {
      icon: "text-[#33b060]",
      border: "border-[#33b060]",
      glow: "#33b060",
      highlight: "rgba(255,255,255,0.9)",
      background: "from-gray-50 to-gray-100"
    },
    dark: {
      icon: "text-white",
      border: "border-[#33b060]/80",
      glow: "#33b060",
      highlight: "rgba(255,255,255,0.25)",
      background: "from-blue-900/15 to-blue-950/20" 
    },
    footer: {
      icon: "text-[#33b060]",
      border: "border-[#33b060]",
      glow: "#33b060",
      highlight: "rgba(255,255,255,0.2)",
      background: "from-[#11202e] to-[#0a141f]"
    }
  };
  
  const currentColors = colors[mode];
  const sizeClass = sizes[size];
  
  return (
    <div className={cn("relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300", sizeClass, className)}>
      {/* Fond avec gradient */}
      <div className={cn(
        "absolute inset-0 rounded-full bg-gradient-to-b shadow-sm",
        mode === "footer" ? "shadow-inner" : "",
        `${currentColors.background}`
      )}></div>
      
      {/* Effet de halo subtil */}
      <motion.div 
        className={`absolute -inset-0.5 rounded-full blur-sm ${mode === "light" ? "bg-[#33b060]/10" : mode === "dark" ? "bg-[#33b060]/15" : "bg-[#33b060]/10"}`}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Cercle principal */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2",
        currentColors.border
      )}></div>
      
      {/* Icône Power */}
      <motion.div
        animate={{ 
          scale: mode === "footer" ? [1, 1.05, 1] : [1, 1.08, 1], 
          rotate: mode === "footer" ? [0, 2, 0, -2, 0] : [0, 3, 0, -3, 0] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="z-10"
      >
        <Power className={cn(
          size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-5 w-5" : "h-6 w-6",
          currentColors.icon,
          mode !== "footer" ? "drop-shadow-sm" : ""
        )} />
      </motion.div>
      
      {/* Reflet lumineux élégant */}
      <div 
        className="absolute inset-0 rounded-full overflow-hidden opacity-40"
        style={{ 
          background: `linear-gradient(140deg, ${currentColors.highlight} 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0) 100%)`
        }}
      />
      
      {/* Effet de lueur animée */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ 
          boxShadow: [
            `0 0 0px ${currentColors.glow}20`,
            `0 0 4px ${currentColors.glow}40`,
            `0 0 0px ${currentColors.glow}20`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};