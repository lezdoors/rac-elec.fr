import React from "react";
import { cn } from "@/lib/utils";

// Définir un type pour les couleurs pour éviter les erreurs TypeScript
interface ColorPalette {
  roof: string;
  roofHighlight: string; 
  roofShadow: string;
  wall: string;
  wallShadow: string;
  wallHighlight: string;
  door: string;
  doorHighlight: string;
  window: string;
  windowFrame: string;
  chimney: string;
  smoke: string;
  grass: string;
  sky: string;
  ground: string;
  shadow: string;
  sun: string;
  sunRays: string;
  moon: string;
  moonGlow: string;
}

interface HouseIconProps {
  mode?: "light" | "dark" | "footer";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  responsive?: boolean;
  className?: string;
}

/**
 * Composant d'icône de maison photoréaliste 
 * Design ultra-détaillé avec textures et effets 3D
 */
export function HouseIcon({
  mode = "light",
  size = "md",
  responsive = false, 
  className = ""
}: HouseIconProps) {
  // Définition des tailles pour adaptabilité responsive
  const sizes = {
    sm: "w-12 h-12",      
    md: "w-16 h-16",      
    lg: "w-24 h-24",      
    xl: "w-32 h-32",      
    "2xl": "w-40 h-40",   
    "3xl": "w-48 h-48",   
    "4xl": "w-64 h-64"    
  };
  
  // Classes responsive pour adapter automatiquement la taille selon l'écran
  const responsiveClasses = responsive 
    ? "w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-36 xl:h-36 2xl:w-44 2xl:h-44 3xl:w-50 3xl:h-50"
    : "";
  
  // Couleurs selon le mode d'affichage
  const colors = {
    light: {
      // Mode jour avec couleurs réalistes
      roof: "#8B4513",          // Toiture marron
      roofHighlight: "#A0522D", // Lueur sur la toiture
      roofShadow: "#5D2906",    // Ombre sur la toiture
      wall: "#F5F5DC",          // Mur beige clair
      wallShadow: "#E8E8D0",    // Ombre sur le mur
      wallHighlight: "#FFFFF0", // Lueur sur le mur
      door: "#8B4513",          // Porte en bois
      doorHighlight: "#A0522D", // Lueur sur la porte
      window: "#87CEEB",        // Fenêtre bleu ciel
      windowFrame: "#A0522D",   // Cadre de fenêtre
      chimney: "#B22222",       // Cheminée rouge brique
      smoke: "#D3D3D3",         // Fumée grisâtre
      grass: "#228B22",         // Herbe verte
      sky: "#87CEEB",           // Ciel bleu clair
      sun: "#FFD700",           // Soleil doré
      sunRays: "#FFA500",       // Rayons de soleil
      moon: "#F0F0F0",          // Lune blanche (pour compatibilité)
      moonGlow: "#FFFFF0",      // Halo lunaire (pour compatibilité)
      ground: "#8B4513",        // Sol terrain
      shadow: "rgba(0,0,0,0.5)" // Ombre portée
    },
    dark: {
      // Mode nuit avec couleurs adaptées
      roof: "#4A2511",          // Toiture marron foncé
      roofHighlight: "#5A3015", // Lueur sur la toiture
      roofShadow: "#2A1506",    // Ombre sur la toiture  
      wall: "#CCCCBA",          // Mur beige grisé
      wallShadow: "#AAAAAA",    // Ombre sur le mur
      wallHighlight: "#DDDDCC", // Lueur sur le mur
      door: "#4A2511",          // Porte en bois foncé
      doorHighlight: "#5A3015", // Lueur sur la porte
      window: "#4682B4",        // Fenêtre bleu acier
      windowFrame: "#5A3015",   // Cadre de fenêtre foncé
      chimney: "#8B2222",       // Cheminée rouge foncé
      smoke: "#A9A9A9",         // Fumée gris foncé
      grass: "#006400",         // Herbe vert foncé
      sky: "#191970",           // Ciel bleu nuit
      moon: "#F0F0F0",          // Lune blanche
      moonGlow: "#FFFFF0",      // Halo lunaire
      ground: "#4A2511",        // Sol terrain foncé
      shadow: "rgba(0,0,0,0.7)" // Ombre portée plus prononcée
    },
    footer: {
      // Mode footer avec palette élégante
      roof: "#4E6096",          // Toiture bleu-gris
      roofHighlight: "#5D70A5", // Lueur sur la toiture
      roofShadow: "#3D5087",    // Ombre sur la toiture
      wall: "#F0F0F0",          // Mur blanc
      wallShadow: "#E0E0E0",    // Ombre sur le mur
      wallHighlight: "#FFFFFF", // Lueur sur le mur
      door: "#4E6096",          // Porte assortie à la toiture
      doorHighlight: "#5D70A5", // Lueur sur la porte
      window: "#B8E2F2",        // Fenêtre bleu clair
      windowFrame: "#4E6096",   // Cadre de fenêtre
      chimney: "#4E6096",       // Cheminée assortie
      smoke: "#F0F0F0",         // Fumée blanche
      grass: "#68B088",         // Herbe vert-bleu
      sky: "#B8E2F2",           // Ciel bleu clair
      glow: "#FFFFFF",          // Lueur
      sun: "#FFD700",           // Soleil doré
      sunRays: "#4E6096",       // Rayons de soleil assortis
      moon: "#F0F0F0",          // Lune blanche
      moonGlow: "#FFFFFF",      // Halo lunaire
      ground: "#68B088",        // Sol terrain
      shadow: "rgba(0,0,0,0.3)" // Ombre portée subtile
    }
  };
  
  const c = colors[mode];
  const sizeClass = responsive ? responsiveClasses : sizes[size];
  const isDark = mode === "dark";
  
  return (
    <div className={cn("relative flex items-center justify-center", sizeClass, className)}>
      {/* SVG avec maison réaliste */}
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
        style={{ filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.25))" }}
      >
        <defs>
          {/* Dégradé pour le ciel */}
          <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#0C1445" : "#87CEEB"} />
            <stop offset="100%" stopColor={isDark ? "#1A2980" : "#B0E2FF"} />
          </linearGradient>
          
          {/* Dégradé pour le toit */}
          <linearGradient id="roof-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.roofHighlight} />
            <stop offset="60%" stopColor={c.roof} />
            <stop offset="100%" stopColor={c.roofShadow} />
          </linearGradient>
          
          {/* Dégradé pour les murs */}
          <linearGradient id="wall-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.wallHighlight} />
            <stop offset="60%" stopColor={c.wall} />
            <stop offset="100%" stopColor={c.wallShadow} />
          </linearGradient>
          
          {/* Dégradé pour la porte */}
          <linearGradient id="door-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.doorHighlight} />
            <stop offset="60%" stopColor={c.door} />
            <stop offset="100%" stopColor={c.door} />
          </linearGradient>
          
          {/* Dégradé pour le gazon */}
          <linearGradient id="grass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.grass} />
            <stop offset="100%" stopColor="#006400" />
          </linearGradient>
          
          {/* Filtre pour l'ombre portée */}
          <filter id="shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor={c.shadow} floodOpacity="0.5" />
          </filter>
          
          {/* Filtre pour le flou de la fumée */}
          <filter id="smoke-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
          
          {/* Effet de brillance pour les fenêtres */}
          <linearGradient id="window-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Arrière-plan / ciel */}
        <rect width="100" height="100" fill="url(#sky-gradient)" rx="5" />
        
        {/* Soleil ou Lune selon le mode */}
        {isDark ? (
          <g>
            <circle cx="75" cy="25" r="8" fill={c.moon} />
            <circle cx="75" cy="25" r="12" fill="none" stroke={c.moonGlow} strokeWidth="0.5" opacity="0.6" />
            <circle cx="75" cy="25" r="16" fill="none" stroke={c.moonGlow} strokeWidth="0.3" opacity="0.3" />
          </g>
        ) : (
          <g>
            <circle cx="75" cy="25" r="8" fill={c.sun} />
            <g opacity="0.7">
              <line x1="75" y1="10" x2="75" y2="15" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="75" y1="35" x2="75" y2="40" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="60" y1="25" x2="65" y2="25" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="85" y1="25" x2="90" y2="25" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="65" y1="15" x2="68" y2="18" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="82" y1="32" x2="85" y2="35" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="65" y1="35" x2="68" y2="32" stroke={c.sunRays} strokeWidth="1.5" />
              <line x1="82" y1="18" x2="85" y2="15" stroke={c.sunRays} strokeWidth="1.5" />
            </g>
          </g>
        )}
        
        {/* Terrain / Sol */}
        <rect x="0" y="80" width="100" height="20" fill="url(#grass-gradient)" />
        
        {/* Maison - Structure principale avec ombre portée */}
        <g filter="url(#shadow-filter)">
          {/* Murs de la maison */}
          <rect x="25" y="50" width="50" height="30" fill="url(#wall-gradient)" stroke="#666" strokeWidth="0.5" />
          
          {/* Toit de la maison */}
          <polygon points="20,50 50,25 80,50" fill="url(#roof-gradient)" stroke="#333" strokeWidth="0.5" />
          
          {/* Cheminée */}
          <rect x="65" y="35" width="7" height="10" fill={c.chimney} stroke="#333" strokeWidth="0.3" />
          
          {/* Fumée (si visible) */}
          <g filter="url(#smoke-blur)" opacity="0.7">
            <ellipse cx="68.5" cy="30" rx="2.5" ry="2" fill={c.smoke} />
            <ellipse cx="69.5" cy="26" rx="3" ry="2.5" fill={c.smoke} opacity="0.8" />
            <ellipse cx="71" cy="22" rx="3.5" ry="3" fill={c.smoke} opacity="0.6" />
          </g>
        </g>
        
        {/* Porte */}
        <rect x="45" y="60" width="10" height="20" fill="url(#door-gradient)" stroke="#333" strokeWidth="0.3" />
        <circle cx="48" cy="70" r="1" fill="#FFFF00" /> {/* Poignée dorée */}
        
        {/* Fenêtres */}
        <g>
          {/* Fenêtre gauche */}
          <rect x="30" y="60" width="10" height="10" fill={c.window} stroke={c.windowFrame} strokeWidth="0.8" />
          <line x1="35" y1="60" x2="35" y2="70" stroke={c.windowFrame} strokeWidth="0.8" />
          <line x1="30" y1="65" x2="40" y2="65" stroke={c.windowFrame} strokeWidth="0.8" />
          <rect x="30" y="60" width="5" height="2.5" fill="url(#window-shine)" opacity="0.5" />
          
          {/* Fenêtre droite */}
          <rect x="60" y="60" width="10" height="10" fill={c.window} stroke={c.windowFrame} strokeWidth="0.8" />
          <line x1="65" y1="60" x2="65" y2="70" stroke={c.windowFrame} strokeWidth="0.8" />
          <line x1="60" y1="65" x2="70" y2="65" stroke={c.windowFrame} strokeWidth="0.8" />
          <rect x="60" y="60" width="5" height="2.5" fill="url(#window-shine)" opacity="0.5" />
          
          {/* Fenêtre triangulaire (grenier) */}
          <polygon points="45,35 50,30 55,35" fill={c.window} stroke={c.windowFrame} strokeWidth="0.8" />
          <line x1="50" y1="30" x2="50" y2="35" stroke={c.windowFrame} strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  );
}