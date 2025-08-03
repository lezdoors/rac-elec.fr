import { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, ShieldCheck, Lock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Composant HouseIcon pour la page de paiement
const HouseIcon = ({ mode = "light", size = "md", className = "" }: { mode?: "light" | "dark" | "footer", size?: "sm" | "md" | "lg", className?: string }) => {
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
      
      {/* Icône Maison */}
      <motion.div
        animate={{ 
          scale: mode === "footer" ? [1, 1.05, 1] : [1, 1.08, 1], 
          rotate: mode === "footer" ? [0, 2, 0, -2, 0] : [0, 3, 0, -3, 0] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="z-10"
      >
        <Home className={cn(
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

interface PaymentLayoutProps {
  children: ReactNode;
}

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header simplifié pour pages de paiement */}
      <header 
        className="bg-white shadow-lg py-3 border-b-2 border-blue-600 fixed top-0 left-0 right-0 w-full z-50"
        role="banner" 
        aria-label="En-tête de paiement"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo & Site Title */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="flex items-center group">
                  {/* Logo maison en mode clair */}
                  <HouseIcon mode="light" size="md" className="mr-2.5" />

                  {/* Texte du logo */}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-bold text-2xl sm:text-3xl text-[#33b060] tracking-tight leading-none">Services</span>
                      <span className="font-bold text-2xl sm:text-3xl text-[#2e3d96] tracking-tight ml-1 relative leading-none">
                        Enedis
                        <motion.span 
                          className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#33b060]/70"
                          animate={{ width: ["0%", "100%", "0%"] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        ></motion.span>
                      </span>
                    </div>
                    <div className="text-[12px] text-[#2e3d96]/90 mt-0.5 tracking-wide font-semibold">
                      Espace Paiement Sécurisé
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Indicateurs de sécurité */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center text-gray-600 text-sm">
                <Lock className="h-4 w-4 text-green-600 mr-1" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm ml-4">
                <ShieldCheck className="h-4 w-4 text-green-600 mr-1" />
                <span>Données protégées</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with top padding for fixed header */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer simplifié pour pages de paiement */}
      <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white py-6 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer minimaliste pour page de paiement */}
          <div className="flex flex-col items-center text-center">
            {/* Logo et copyright */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex items-center justify-center w-6 h-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#11202e] to-[#0a141f]"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#33b060]"></div>
                <Home className="h-3.5 w-3.5 text-[#33b060] z-10" />
              </div>
              <span className="text-sm text-gray-400">
                © {new Date().getFullYear()} Portail-Electricite.com - Tous droits réservés
              </span>
            </div>
            
            {/* Message de sécurité paiement */}
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck className="w-4 h-4 mr-2 text-[#33b060]" />
              <span className="text-sm text-gray-300">Transaction sécurisée</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}