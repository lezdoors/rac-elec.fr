import React from "react";
import { cn } from "@/lib/utils";

interface LogoElectricIconProps {
  mode?: "light" | "dark" | "footer";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"; // Encore plus de tailles
  responsive?: boolean; // Option de responsive automatique
  className?: string;
}

/**
 * Composant de logo professionnel Enedis en qualité 8K photorealistic
 * Représentant une prise électrique avec éclair et éclaboussures d'eau
 * Design hyperréaliste avec effets dynamiques et textures ultra-détaillées
 */
export function LogoElectricIcon({ 
  mode = "light", 
  size = "md", 
  responsive = false,
  className = "" 
}: LogoElectricIconProps) {
  // Définition des tailles pour adaptabilité responsive (considérablement agrandies)
  const sizes = {
    sm: "w-12 h-12",      // Base augmentée
    md: "w-16 h-16",      // Medium agrandi
    lg: "w-24 h-24",      // Large optimisé pour visibilité
    xl: "w-32 h-32",      // Extra-large pour affichage détaillé
    "2xl": "w-40 h-40",   // Double extra-large
    "3xl": "w-48 h-48",   // Triple extra-large pour grands écrans
    "4xl": "w-64 h-64"    // Quadruple extra-large pour affichage maximum
  };
  
  // Classes responsive pour adapter automatiquement la taille selon l'écran
  const responsiveClasses = responsive 
    ? "w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-36 xl:h-36 2xl:w-44 2xl:h-44 3xl:w-52 3xl:h-52"
    : "";
  
  // Couleurs selon le mode d'affichage (palette étendue ultra-réaliste)
  const colors = {
    light: {
      // Mode jour avec couleurs photorealistic
      plugBase: "#00BCD4",      // Bleu clair pour la base de la prise
      plugDark: "#0097A7",      // Bleu plus foncé pour les ombres
      plugLight: "#4DD0E1",     // Bleu turquoise clair pour les reflets
      plugShadow: "#006064",    // Bleu très foncé pour les ombres profondes
      plugHighlight: "#B2EBF2", // Bleu très clair pour les reflets brillants
      bolts: "#006064",         // Bleu foncé pour les broches
      boltsMetal: "#607D8B",    // Gris métallique pour les broches
      boltsShine: "#CFD8DC",    // Gris clair pour les reflets métalliques
      lightning: "#FFEA00",     // Jaune vif pour l'éclair
      lightningGlow: "#FFC400", // Jaune orangé pour le halo de l'éclair
      lightningInner: "#FFFFFF", // Blanc pour le cœur de l'éclair
      lightningBorder: "#FFFFFF", // Contour blanc pour l'éclair
      splash: "#01579B",        // Bleu profond pour les éclaboussures
      splashLight: "#039BE5",   // Bleu ciel plus vif pour les détails
      splashHighlight: "#80D8FF", // Bleu très clair pour les reflets
      splashSecondary: "#0277BD", // Bleu secondaire pour texture des éclaboussures
      background: "transparent", 
      stroke: "#006064",        // Contour pour définition améliorée
      highlight: "#B3E5FC",     // Surbrillance pour effets 3D
      ambient: "#E1F5FE"        // Couleur ambiante pour effets de lumière
    },
    dark: {
      // Mode nuit ultra-détaillé avec palette colorée
      plugBase: "#4FC3F7",      // Bleu ciel lumineux pour la base (plus coloré)
      plugDark: "#0288D1",      // Bleu foncé pour les ombres
      plugLight: "#81D4FA",     // Bleu clair lumineux pour les reflets
      plugShadow: "#01579B",    // Bleu très foncé pour les ombres profondes
      plugHighlight: "#E1F5FE", // Bleu très clair pour les reflets brillants
      bolts: "#29B6F6",         // Bleu vif pour les broches
      boltsMetal: "#90A4AE",    // Gris bleuté métallique pour les broches
      boltsShine: "#ECEFF1",    // Gris très clair pour les reflets métalliques
      lightning: "#FFF176",     // Jaune clair lumineux pour l'éclair
      lightningGlow: "#FFEE58", // Jaune vif pour le halo
      lightningInner: "#FFFFFF", // Blanc pur pour le cœur de l'éclair
      lightningBorder: "#FFFFFF", // Contour blanc lumineux
      splash: "#2196F3",        // Bleu primaire pour les éclaboussures
      splashLight: "#64B5F6",   // Bleu ciel pour les détails
      splashHighlight: "#BBDEFB", // Bleu très clair pour les reflets
      splashSecondary: "#1976D2", // Bleu roi pour texture des éclaboussures
      background: "transparent", 
      stroke: "#0D47A1",        // Contour bleu foncé pour définition
      highlight: "#E3F2FD",     // Surbrillance pour effets 3D
      ambient: "#E1F5FE"        // Couleur ambiante pour effets de lumière
    },
    footer: {
      // Mode footer avec palette élégante
      plugBase: "#4FC3F7",      // Bleu ciel lumineux pour la base
      plugDark: "#0288D1",      // Bleu foncé pour les ombres
      plugLight: "#81D4FA",     // Bleu clair lumineux pour les reflets
      plugShadow: "#01579B",    // Bleu très foncé pour les ombres profondes
      plugHighlight: "#E1F5FE", // Bleu très clair pour les reflets brillants
      bolts: "#29B6F6",         // Bleu vif pour les broches
      boltsMetal: "#90A4AE",    // Gris bleuté métallique pour les broches
      boltsShine: "#ECEFF1",    // Gris très clair pour les reflets métalliques
      lightning: "#FFF176",     // Jaune clair lumineux pour l'éclair
      lightningGlow: "#FFEE58", // Jaune vif pour le halo
      lightningInner: "#FFFFFF", // Blanc pur pour le cœur de l'éclair
      lightningBorder: "#FFFFFF", // Contour blanc lumineux
      splash: "#2196F3",        // Bleu primaire pour les éclaboussures
      splashLight: "#64B5F6",   // Bleu ciel pour les détails
      splashHighlight: "#BBDEFB", // Bleu très clair pour les reflets
      splashSecondary: "#1976D2", // Bleu roi pour texture des éclaboussures
      background: "transparent", 
      stroke: "#0D47A1",        // Contour bleu foncé pour définition
      highlight: "#E3F2FD",     // Surbrillance pour effets 3D
      ambient: "#E1F5FE"        // Couleur ambiante pour effets de lumière
    }
  };
  
  const c = colors[mode]; // Raccourci pour les couleurs actuelles
  const sizeClass = responsive ? responsiveClasses : sizes[size];
  
  // Déterminer si on est en mode sombre
  const isDark = mode === "dark" || mode === "footer";
  
  return (
    <div className={cn("relative flex items-center justify-center", sizeClass, className)}>
      {/* SVG avec logo hyperréaliste 8K */}
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
      >
        <defs>
          {/* Effet de lueur amélioré pour l'éclair (halo dynamique) */}
          <filter id="lightning-glow-8k" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 3 0"
              result="glow" />
            <feBlend in="SourceGraphic" in2="glow" mode="screen" />
          </filter>
          
          {/* Effet d'ombre portée hyperréaliste */}
          <filter id="shadow-8k" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.8" dy="1.2" stdDeviation="1.5" flood-opacity="0.6" flood-color="#000000" />
          </filter>
          
          {/* Texture réaliste pour le corps de la prise */}
          <linearGradient id="plug-gradient-8k" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.plugHighlight} />
            <stop offset="30%" stopColor={c.plugLight} />
            <stop offset="60%" stopColor={c.plugBase} />
            <stop offset="100%" stopColor={c.plugShadow} />
          </linearGradient>
          
          {/* Texture métallique pour les broches */}
          <linearGradient id="metal-gradient-8k" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.boltsShine} />
            <stop offset="50%" stopColor={c.boltsMetal} />
            <stop offset="100%" stopColor={c.bolts} />
          </linearGradient>
          
          {/* Dégradé ultra-réaliste pour l'éclair */}
          <linearGradient id="lightning-gradient-8k" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={c.lightningInner} />
            <stop offset="30%" stopColor={c.lightning} />
            <stop offset="100%" stopColor={c.lightningGlow} />
          </linearGradient>
          
          {/* Dégradé radial pour le halo énergétique */}
          <radialGradient id="lightning-energy-8k" cx="50%" cy="50%" r="80%" fx="45%" fy="45%">
            <stop offset="0%" stopColor={c.lightningInner} stopOpacity="0.9" />
            <stop offset="30%" stopColor={c.lightning} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c.lightningGlow} stopOpacity="0" />
          </radialGradient>
          
          {/* Reflets réalistes sur la prise */}
          <linearGradient id="shine-gradient-8k" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          
          {/* Texture eau pour les éclaboussures (plus réaliste) */}
          <radialGradient id="water-gradient-8k" cx="60%" cy="50%" r="80%" fx="60%" fy="50%">
            <stop offset="0%" stopColor={c.splashHighlight} stopOpacity="0.9" />
            <stop offset="40%" stopColor={c.splashLight} stopOpacity="0.8" />
            <stop offset="70%" stopColor={c.splash} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c.splashSecondary} stopOpacity="0.6" />
          </radialGradient>
          
          {/* Texture profondeur pour les éclaboussures */}
          <linearGradient id="water-depth-8k" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor={c.splashHighlight} />
            <stop offset="40%" stopColor={c.splashLight} />
            <stop offset="80%" stopColor={c.splash} />
            <stop offset="100%" stopColor={c.splashSecondary} />
          </linearGradient>
        </defs>
        
        {/* Fond lumineux ambiant autour du logo (aura) */}
        <circle 
          cx="50" 
          cy="50" 
          r="42" 
          fill={c.ambient} 
          opacity="0.15" 
          filter="url(#shadow-8k)"
        />
        
        {/* Éclaboussures d'eau/électricité hyperréalistes */}
        <path 
          d="M58,48 C67,43 74,57 81,50 C87,44 89,64 75,66 C84,72 67,80 59,71 C55,78 47,77 42,70 C34,76 28,65 33,59 C25,55 23,42 40,42 C46,36 51,39 58,48 Z" 
          fill="url(#water-gradient-8k)"
          stroke={c.stroke}
          strokeWidth="0.8"
          filter="url(#shadow-8k)"
        />
        
        {/* Couche de profondeur pour les éclaboussures (effet 3D) */}
        <path 
          d="M60,50 C66,47 70,57 75,53 C79,50 80,61 73,62 C78,65 70,70 65,66 C63,70 58,69 55,66 C51,69 47,64 49,61 C45,59 43,52 51,50 C54,48 57,48 60,50 Z" 
          fill="url(#water-depth-8k)"
          opacity="0.7"
          strokeWidth="0"
        />
        
        {/* Détails des éclaboussures avec textures et ondulations */}
        <path 
          d="M66,52 C72,49 76,59 81,56 C85,54 82,63 76,64 C81,68 70,75 64,70" 
          fill={c.splashLight}
          stroke={c.splash}
          strokeWidth="0.3"
          strokeOpacity="0.5"
          opacity="0.8"
        />
        
        <path 
          d="M45,65 C40,69 34,63 38,59" 
          fill={c.splashLight}
          stroke={c.splash}
          strokeWidth="0.3"
          strokeOpacity="0.3"
          opacity="0.8"
        />
        
        <path 
          d="M40,50 C36,46 40,42 45,44" 
          fill={c.splashLight}
          stroke={c.splash}
          strokeWidth="0.3"
          strokeOpacity="0.3"
          opacity="0.8"
        />
        
        {/* Corps principal de la prise électrique en relief hyperréaliste */}
        <path 
          d="M30,30 C30,22 38,15 50,15 C62,15 70,22 70,30 C70,38 66,44 69,51 C65,58 57,59 56,65 L44,65 C44,59 36,58 31,51 C34,44 30,38 30,30 Z" 
          fill="url(#plug-gradient-8k)"
          stroke={c.stroke}
          strokeWidth="1.2"
          filter="url(#shadow-8k)"
        />
        
        {/* Texture interne de la prise (effet 3D) */}
        <path 
          d="M34,30 C34,24 40,19 50,19 C60,19 66,24 66,30 C66,36 63,41 66,47 C63,53 56,54 55,59 L45,59 C45,54 38,53 34,47 C37,41 34,36 34,30 Z" 
          fill="url(#plug-gradient-8k)"
          opacity="0.7"
          stroke="none"
        />
        
        {/* Broches de la prise avec effet métallique réaliste */}
        <rect 
          x="42" 
          y="5" 
          width="5" 
          height="17" 
          rx="2.5" 
          fill="url(#metal-gradient-8k)"
          stroke={isDark ? c.stroke : c.bolts}
          strokeWidth={isDark ? 1 : 0.75}
          filter="url(#shadow-8k)"
        />
        
        <rect 
          x="53" 
          y="5" 
          width="5" 
          height="17" 
          rx="2.5" 
          fill="url(#metal-gradient-8k)"
          stroke={isDark ? c.stroke : c.bolts}
          strokeWidth={isDark ? 1 : 0.75}
          filter="url(#shadow-8k)"
        />
        
        {/* Détails ultra-réalistes sur les broches pour effet métallique */}
        <rect 
          x="43" 
          y="6" 
          width="3" 
          height="8" 
          rx="1.5" 
          fill={c.boltsShine}
          opacity="0.6"
        />
        
        <rect 
          x="54" 
          y="6" 
          width="3" 
          height="8" 
          rx="1.5" 
          fill={c.boltsShine}
          opacity="0.6"
        />
        
        {/* Reflets supplémentaires sur les broches */}
        <rect 
          x="43.5" 
          y="7" 
          width="2" 
          height="3" 
          rx="1" 
          fill="#FFFFFF"
          opacity="0.8"
        />
        
        <rect 
          x="54.5" 
          y="7" 
          width="2" 
          height="3" 
          rx="1" 
          fill="#FFFFFF"
          opacity="0.8"
        />
        
        {/* Éclair central hyperréaliste avec effet lumineux */}
        <path 
          d="M50,26 L41,40 L53,40 L35,62 L59,42 L47,42 L50,26 Z" 
          fill="url(#lightning-gradient-8k)"
          stroke={c.lightningBorder}
          strokeWidth={isDark ? 1.2 : 0.8}
          filter="url(#lightning-glow-8k)"
        />
        
        {/* Halo énergétique lumineux (effet supernova) */}
        <path 
          d="M50,26 L41,40 L53,40 L35,62 L59,42 L47,42 L50,26 Z" 
          fill="url(#lightning-energy-8k)"
          stroke="none"
          opacity="0.6"
        />
        
        {/* Reflets photoréalistes sur la prise */}
        <path 
          d="M35,25 Q45,21 55,25" 
          fill="none"
          stroke="url(#shine-gradient-8k)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        
        <path 
          d="M38,35 Q50,32 62,35" 
          fill="none"
          stroke="url(#shine-gradient-8k)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        <path 
          d="M40,45 Q50,43 60,45" 
          fill="none"
          stroke="url(#shine-gradient-8k)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        
        {/* Points de détail sur les éclaboussures (effet goutte d'eau ultra-HD) */}
        <circle cx="74" cy="54" r="2.2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="66" cy="63" r="1.8" fill="#FFFFFF" opacity="0.8" />
        <circle cx="40" cy="62" r="2" fill="#FFFFFF" opacity="0.85" />
        <circle cx="80" cy="58" r="1.4" fill="#FFFFFF" opacity="0.9" />
        <circle cx="55" cy="72" r="1.2" fill="#FFFFFF" opacity="0.8" />
        <circle cx="36" cy="56" r="1.7" fill="#FFFFFF" opacity="0.7" />
        <circle cx="85" cy="54" r="1" fill="#FFFFFF" opacity="0.75" />
        
        {/* Gouttes pour effet de dynamisme et de texture */}
        <circle cx="69" cy="48" r="0.8" fill="#FFFFFF" opacity="0.95" />
        <circle cx="76" cy="62" r="0.9" fill="#FFFFFF" opacity="0.85" />
        <circle cx="48" cy="56" r="0.7" fill="#FFFFFF" opacity="0.9" />
        <circle cx="62" cy="54" r="0.6" fill="#FFFFFF" opacity="0.95" />
        <circle cx="52" cy="66" r="0.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="71" cy="69" r="0.7" fill="#FFFFFF" opacity="0.8" />
        <circle cx="82" cy="50" r="0.4" fill="#FFFFFF" opacity="0.95" />
        <circle cx="38" cy="46" r="0.6" fill="#FFFFFF" opacity="0.9" />
        <circle cx="44" cy="68" r="0.5" fill="#FFFFFF" opacity="0.85" />
        <circle cx="59" cy="75" r="0.4" fill="#FFFFFF" opacity="0.8" />
        
        {/* Points de brillance supplémentaires pour l'effet photoréaliste */}
        <circle cx="50" cy="32" r="0.7" fill="#FFFFFF" opacity="0.8" />
        <circle cx="59" cy="36" r="0.5" fill="#FFFFFF" opacity="0.7" />
        <circle cx="41" cy="36" r="0.6" fill="#FFFFFF" opacity="0.7" />
        <circle cx="50" cy="39" r="0.4" fill="#FFFFFF" opacity="0.6" />
      </svg>
    </div>
  );
}