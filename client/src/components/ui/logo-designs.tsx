import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Collection de logos pour Raccordement Enedis 
 * Versions optimisées, responsives et compatibles avec tous les navigateurs modernes
 */

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark';
  animate?: boolean;
}

const sizesMap = {
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-40 h-40',
  xl: 'w-64 h-64',
  header: 'w-48 h-12',
};

export function LogoDesign1({ className, size = 'md', variant = 'light', animate = false }: LogoProps) {
  // Couleurs adaptées selon le variant
  const colors = {
    primary: variant === 'light' ? '#0046AD' : '#1E88E5',
    secondary: variant === 'light' ? '#FFD700' : '#FFEB3B',
    accent: variant === 'light' ? '#F44336' : '#FF5252',
    text: variant === 'light' ? '#333333' : '#FFFFFF',
    background: variant === 'light' ? '#FFFFFF' : '#1A237E',
    border: variant === 'light' ? '#0D47A1' : '#5C6BC0',
  };

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" 
           className="w-full h-full" aria-labelledby="logo-design-1-title">
        <title id="logo-design-1-title">Raccordement Enedis</title>
        
        {/* Définitions des dégradés et filtres */}
        <defs>
          <linearGradient id="circle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="wire-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#555" />
            <stop offset="50%" stopColor="#888" />
            <stop offset="100%" stopColor="#555" />
          </linearGradient>
        </defs>
        
        {/* Cercle de fond */}
        <circle cx="20" cy="20" r="18" fill="url(#circle-gradient)" stroke={colors.border} strokeWidth="1" />
        
        {/* Maison stylisée */}
        <g filter="url(#glow)">
          {/* Toit */}
          <path d="M20 6L32 16H8L20 6Z" fill={colors.secondary} stroke={colors.border} strokeWidth="0.5" />
          
          {/* Corps de la maison */}
          <rect x="11" y="16" width="18" height="14" fill="#FFFFFF" stroke={colors.border} strokeWidth="0.5" />
          
          {/* Porte */}
          <rect x="17" y="22" width="6" height="8" fill={colors.primary} stroke={colors.border} strokeWidth="0.3" />
          
          {/* Fenêtres */}
          <rect x="13" y="18" width="4" height="4" fill="#87CEFA" stroke={colors.border} strokeWidth="0.3" />
          <rect x="23" y="18" width="4" height="4" fill="#87CEFA" stroke={colors.border} strokeWidth="0.3" />
        </g>
        
        {/* Câble électrique connecté à la maison */}
        <path 
          d={animate ? 
            "M38 20C42 20 46 10 53 10C60 10 60 20 65 20C70 20 70 10 80 10C90 10 97 20 105 20" : 
            "M38 20C45 20 50 12 60 12C70 12 75 20 85 20C95 20 100 12 105 12"
          } 
          stroke="url(#wire-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
          strokeDasharray={animate ? "1,0" : "0"}
          className={animate ? "animate-pulse" : ""}
        />
        
        {/* Point de connexion */}
        <circle cx="38" cy="20" r="2" fill={colors.accent} />
        
        {/* Texte */}
        <text x="45" y="17" fill={colors.text} fontSize="10" fontFamily="Arial, sans-serif" fontWeight="bold">
          Raccordement
        </text>
        <text x="45" y="27" fill={colors.text} fontSize="9" fontFamily="Arial, sans-serif">
          Enedis
        </text>
      </svg>
    </div>
  );
}

export function LogoDesign2({ className, size = 'md', variant = 'light', animate = false }: LogoProps) {
  // Couleurs adaptées selon le variant
  const colors = {
    primary: variant === 'light' ? '#0D47A1' : '#2196F3',
    secondary: variant === 'light' ? '#E65100' : '#FF9800',
    accent: variant === 'light' ? '#4CAF50' : '#8BC34A',
    text: variant === 'light' ? '#212121' : '#FFFFFF',
    background: variant === 'light' ? '#FFFFFF' : '#263238',
    border: variant === 'light' ? '#0D47A1' : '#5C6BC0',
  };

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" 
           className="w-full h-full" aria-labelledby="logo-design-2-title">
        <title id="logo-design-2-title">Raccordement Enedis</title>
        
        {/* Définitions des dégradés et filtres */}
        <defs>
          <linearGradient id="design2-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>
          <filter id="design2-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#00000044" />
          </filter>
          <linearGradient id="design2-power-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>
        </defs>
        
        {/* Logo principal */}
        <g filter="url(#design2-shadow)">
          {/* Pylône électrique stylisé */}
          <rect x="15" y="5" width="2" height="30" fill={colors.border} />
          <rect x="10" y="10" width="12" height="2" fill={colors.border} />
          <rect x="5" y="20" width="22" height="2" fill={colors.border} />
          <rect x="0" y="30" width="32" height="2" fill={colors.border} />
          
          {/* Maison */}
          <rect x="38" y="18" width="16" height="12" fill={colors.background} stroke={colors.border} strokeWidth="1" />
          <polygon points="38,18 46,10 54,18" fill={colors.primary} stroke={colors.border} strokeWidth="1" />
          <rect x="42" y="22" width="3" height="8" fill={colors.secondary} />
          <rect x="47" y="20" width="4" height="4" fill="#B3E5FC" stroke={colors.border} strokeWidth="0.5" />
          
          {/* Câble de connexion */}
          <path 
            d={animate ? 
              "M16 20C24 20 30 12 35 18C38 22 48 10 56 12" : 
              "M16 20C24 20 30 15 38 18"
            } 
            stroke={colors.secondary} 
            strokeWidth="2" 
            strokeLinecap="round"
            fill="none"
            className={animate ? "animate-pulse" : ""}
          />
          
          {/* Éclair/Symbole d'électricité */}
          <path d="M26 14L23 20H28L25 26" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        
        {/* Texte */}
        <text x="60" y="17" fill={colors.text} fontSize="9" fontFamily="Arial, sans-serif" fontWeight="bold">
          Raccordement
        </text>
        <text x="60" y="27" fill={colors.text} fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold">
          Enedis
        </text>
        
        {/* Ligne décorative */}
        <line x1="60" y1="29" x2="100" y2="29" stroke={colors.primary} strokeWidth="1" strokeDasharray={animate ? "4,2" : "0"} />
      </svg>
    </div>
  );
}

export function LogoDesign3({ className, size = 'md', variant = 'light', animate = false }: LogoProps) {
  // Couleurs adaptées selon le variant
  const colors = {
    primary: variant === 'light' ? '#1565C0' : '#42A5F5',
    secondary: variant === 'light' ? '#FFC107' : '#FFD54F',
    accent: variant === 'light' ? '#00BCD4' : '#4DD0E1',
    text: variant === 'light' ? '#212121' : '#FAFAFA',
    background: variant === 'light' ? '#FFFFFF' : '#263238',
  };

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" 
           className="w-full h-full" aria-labelledby="logo-design-3-title">
        <title id="logo-design-3-title">Raccordement Enedis</title>
        
        {/* Définitions de styles */}
        <defs>
          <linearGradient id="design3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
          <linearGradient id="design3-flash" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFEB3B" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
          <filter id="design3-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Forme principale */}
        <rect x="5" y="5" width="30" height="30" rx="15" fill="url(#design3-bg)" />
        
        {/* Icône maison avec câble de raccordement */}
        <g filter="url(#design3-glow)">
          {/* Maison simplifiée et moderne */}
          <path d="M20 10L28 18H12L20 10Z" fill="#FFFFFF" />
          <rect x="14" y="18" width="12" height="10" fill="#FFFFFF" />
          
          {/* Circuit électrique stylisé */}
          <g className={animate ? "animate-pulse" : ""}>
            <path d="M28 20H32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 20H12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="34" cy="20" r="2" fill="#FFFFFF" />
            <circle cx="6" cy="20" r="2" fill="#FFFFFF" />
            
            {/* Éclair - Symbole d'électricité */}
            <path d="M19 17L17 22H23L21 27" fill="url(#design3-flash)" stroke="#FFA000" strokeWidth="0.5" />
          </g>
        </g>
        
        {/* Lignes de connexion */}
        <path 
          d={animate ? 
            "M35 20C42 20 46 10 56 10C66 10 70 20 80 20C90 20 94 10 104 10" : 
            "M35 20C45 20 50 15 60 15C70 15 75 20 85 20C95 20 100 15 110 15"
          } 
          stroke={colors.accent} 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeDasharray={animate ? "1,1" : "0"}
          className={animate ? "animate-[dash_3s_linear_infinite]" : ""}
          fill="none"
        />
        
        {/* Texte */}
        <g>
          <text x="42" y="18" fill={colors.text} fontSize="10" fontFamily="Arial, sans-serif" fontWeight="bold">
            Votre partenaire
          </text>
          <text x="42" y="30" fill={colors.text} fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold">
            Raccordement Enedis
          </text>
        </g>
      </svg>
      
      {/* Animation définie dans les styles globaux ou Tailwind */}
    </div>
  );
}

/**
 * Logo inspiré directement du design original mais modernisé
 */
export function ModernizedOriginalLogo({ className, size = 'md', variant = 'light', animate = false }: LogoProps) {
  // Couleurs adaptées selon le variant
  const colors = {
    primary: variant === 'light' ? '#0046AD' : '#1E88E5',
    secondary: variant === 'light' ? '#FFFFFF' : '#E1F5FE',
    accent: variant === 'light' ? '#F44336' : '#FF5252',
    text: variant === 'light' ? '#333333' : '#FFFFFF',
  };

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" 
           className="w-full h-full" aria-labelledby="modernized-original-title">
        <title id="modernized-original-title">Raccordement Enedis</title>
        
        {/* Définitions */}
        <defs>
          <linearGradient id="logo-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#00000033" />
          </filter>
        </defs>
        
        {/* Cercle principal */}
        <circle cx="20" cy="20" r="18" fill="url(#logo-bg-gradient)" filter="url(#soft-shadow)" />
        
        {/* Maison modernisée */}
        <g>
          {/* Toit */}
          <path d="M20 8L30 18H10L20 8Z" fill={colors.secondary} stroke="#0D47A1" strokeWidth="0.5" />
          
          {/* Murs */}
          <rect x="12" y="18" width="16" height="14" fill={colors.secondary} stroke="#0D47A1" strokeWidth="0.5" />
          
          {/* Porte et Fenêtres */}
          <rect x="17" y="24" width="6" height="8" fill={colors.primary} stroke={colors.secondary} strokeWidth="0.3" />
          <rect x="14" y="20" width="4" height="3" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="0.3" />
          <rect x="22" y="20" width="4" height="3" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="0.3" />
        </g>

        {/* Électricité/Connexion */}
        {animate && (
          <g className="animate-pulse">
            <circle cx="20" cy="20" r="22" stroke={colors.primary} strokeWidth="0.5" strokeDasharray="2,2" fill="none" />
            <path d="M32 20L36 20" stroke={colors.secondary} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4 20L8 20" stroke={colors.secondary} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20 4L20 8" stroke={colors.secondary} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20 32L20 36" stroke={colors.secondary} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
        
        {/* Texte à droite du logo */}
        <g filter="url(#soft-shadow)">
          <text x="45" y="18" fill={colors.text} fontSize="10" fontFamily="Arial, sans-serif" fontWeight="600">
            Votre partenaire
          </text>
          <text x="45" y="30" fill={colors.text} fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold">
            Raccordement Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Logo composant à utiliser dans l'application avec choix du design
 */
interface MainLogoProps extends LogoProps {
  design?: 'design1' | 'design2' | 'design3' | 'original';
}

export function RaccordementLogo({ 
  className, 
  size = 'md', 
  variant = 'light', 
  design = 'original', 
  animate = false 
}: MainLogoProps) {
  // Sélection du design approprié
  switch (design) {
    case 'design1':
      return <LogoDesign1 className={className} size={size} variant={variant} animate={animate} />;
    case 'design2':
      return <LogoDesign2 className={className} size={size} variant={variant} animate={animate} />;
    case 'design3':
      return <LogoDesign3 className={className} size={size} variant={variant} animate={animate} />;
    case 'original':
    default:
      return <ModernizedOriginalLogo className={className} size={size} variant={variant} animate={animate} />;
  }
}

/**
 * Galerie de logos pour présentation
 */
export function LogoGallery() {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-xl font-bold mb-4">Propositions de logos pour Raccordement Enedis</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-2">Design Original Modernisé</h3>
          <div className="flex items-center gap-4">
            <ModernizedOriginalLogo size="lg" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Version modernisée du logo actuel, conservant l'identité de marque.</p>
              <div className="flex gap-2">
                <ModernizedOriginalLogo size="sm" variant="dark" />
                <ModernizedOriginalLogo size="sm" animate={true} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-2">Design 1: Maison avec Câble Électrique</h3>
          <div className="flex items-center gap-4">
            <LogoDesign1 size="lg" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Design moderne avec maison et câble électrique, symbolisant la connexion.</p>
              <div className="flex gap-2">
                <LogoDesign1 size="sm" variant="dark" />
                <LogoDesign1 size="sm" animate={true} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-2">Design 2: Maison et Pylône</h3>
          <div className="flex items-center gap-4">
            <LogoDesign2 size="lg" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Combinaison d'éléments d'infrastructure électrique et d'habitation.</p>
              <div className="flex gap-2">
                <LogoDesign2 size="sm" variant="dark" />
                <LogoDesign2 size="sm" animate={true} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-2">Design 3: Maison Électrifiée</h3>
          <div className="flex items-center gap-4">
            <LogoDesign3 size="lg" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Concept minimaliste avec circuit électrique intégré à une maison.</p>
              <div className="flex gap-2">
                <LogoDesign3 size="sm" variant="dark" />
                <LogoDesign3 size="sm" animate={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaccordementLogo;