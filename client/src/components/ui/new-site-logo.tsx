import React from 'react';
import { cn } from '@/lib/utils';

interface NewSiteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
}

const sizesMap = {
  sm: 'w-32 h-20',
  md: 'w-48 h-28',
  lg: 'w-64 h-40',
  xl: 'w-80 h-48',
  header: 'w-80 h-16',
};

/**
 * Nouveau logo du site optimisé pour une expérience utilisateur professionnelle
 */
export function NewSiteLogo({ className, size = 'header', variant = 'blue' }: NewSiteLogoProps) {
  // Couleurs adaptées à la charte Enedis avec dégradés professionnels
  const colors = {
    light: {
      primary: '#0046AD', // Bleu Enedis
      primaryGradient: 'linear-gradient(135deg, #0046AD 0%, #0057D9 100%)',
      secondary: '#007bff',
      accent: '#6FB53E', // Vert Enedis
      accentGradient: 'linear-gradient(135deg, #6FB53E 0%, #85D94A 100%)',
      text: '#333333',
      background: '#FFFFFF',
      shadow: 'rgba(0, 70, 173, 0.15)',
    },
    dark: {
      primary: '#0046AD',
      primaryGradient: 'linear-gradient(135deg, #0046AD 0%, #0057D9 100%)',
      secondary: '#4285F4',
      accent: '#6FB53E',
      accentGradient: 'linear-gradient(135deg, #6FB53E 0%, #85D94A 100%)',
      text: '#FFFFFF',
      background: '#162447',
      shadow: 'rgba(0, 0, 0, 0.25)',
    },
    blue: {
      primary: '#0046AD',
      primaryGradient: 'linear-gradient(135deg, #0046AD 0%, #0057D9 100%)',
      secondary: '#4285F4',
      accent: '#6FB53E',
      accentGradient: 'linear-gradient(135deg, #6FB53E 0%, #85D94A 100%)',
      text: '#162447',
      background: '#F7FAFF',
      shadow: 'rgba(0, 70, 173, 0.10)',
    }
  };

  const color = colors[variant] || colors.blue;

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg 
        viewBox="0 0 320 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full" 
        aria-labelledby="new-site-logo-title"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))' }}
      >
        <title id="new-site-logo-title">Portail Enedis - Raccordement</title>
        
        {/* Fond principal avec ombre légère */}
        <rect x="5" y="10" width="310" height="60" rx="10" fill={color.background} />
        <rect x="7" y="12" width="306" height="56" rx="8" fill={color.background} stroke={color.primary} strokeWidth="0.5" strokeOpacity="0.3" />
        
        {/* Effet de brillance subtil */}
        <ellipse cx="30" cy="30" rx="120" ry="15" fill="white" opacity="0.05" />
        
        {/* Icône pylône électrique avec effet 3D amélioré */}
        <g>
          {/* Ombre portée du pylône */}
          <line x1="30" y1="22" x2="30" y2="62" stroke={color.shadow} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
          
          {/* Corps du pylône avec dégradé */}
          <line x1="30" y1="20" x2="30" y2="60" stroke="url(#pyloneMainGradient)" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Traverses avec dégradé amélioré */}
          <line x1="18" y1="25" x2="42" y2="25" stroke="url(#pyloneGradient)" strokeWidth="3" strokeLinecap="round" />
          <line x1="13" y1="35" x2="47" y2="35" stroke="url(#pyloneGradient)" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="45" x2="52" y2="45" stroke="url(#pyloneGradient)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Reflets métalliques améliorés */}
          <line x1="30" y1="25" x2="30" y2="32" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="30" y1="38" x2="30" y2="45" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          
          {/* Points d'ancrage avec reflet */}
          <circle cx="18" cy="25" r="1.5" fill="white" opacity="0.5" />
          <circle cx="42" cy="25" r="1.5" fill="white" opacity="0.5" />
          <circle cx="13" cy="35" r="1.5" fill="white" opacity="0.5" />
          <circle cx="47" cy="35" r="1.5" fill="white" opacity="0.5" />
          <circle cx="8" cy="45" r="1.5" fill="white" opacity="0.5" />
          <circle cx="52" cy="45" r="1.5" fill="white" opacity="0.5" />
        </g>
        
        {/* Icône maison avec effet 3D réaliste */}
        <g>
          {/* Ombre de la maison renforcée */}
          <path d="M57 38L72 28L87 38L87 53L57 53Z" fill={color.shadow} opacity="0.6" transform="translate(1, 1)" />
          
          {/* Corps de la maison avec effets */}
          <rect x="60" y="35" width="24" height="15" fill="url(#houseGradient)" filter="url(#houseLight)" />
          
          {/* Toit avec relief */}
          <path d="M55 35L72 25L89 35H55Z" fill="url(#roofGradient)" filter="url(#roofLight)" />
          
          {/* Contour de la maison */}
          <path d="M55 35L72 25L89 35V50H55V35Z" stroke={color.primary} strokeWidth="0.8" strokeOpacity="0.7" fill="none" />
          
          {/* Fenêtres avec reflet */}
          <rect x="68" y="40" width="8" height="10" fill={color.background} filter="url(#windowGlow)" />
          <rect x="69" y="41" width="6" height="2" fill="white" opacity="0.8" />
          
          {/* Porte avec relief */}
          <rect x="62" y="42" width="4" height="8" fill="url(#doorGradient)" rx="1" />
          <rect x="63" y="42.5" width="1" height="7" fill="white" opacity="0.3" rx="0.5" />
          
          {/* Cheminée */}
          <rect x="78" y="27" width="3" height="5" fill="#003A8C" />
        </g>
        
        {/* Ligne de connexion avec effet d'énergie */}
        <path 
          d="M50 35 C 55 35, 55 35, 60 35" 
          stroke="url(#connectionGradient)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        
        {/* Étincelle d'énergie */}
        <circle cx="55" cy="35" r="2" fill={color.accent} opacity="0.8">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Texte optimisé pour lisibilité */}
        <g filter="url(#strongTextShadow)">
          <text x="105" y="38" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill={color.primary}>
            Portail Enedis
          </text>
          <text x="105" y="58" fontFamily="Arial, sans-serif" fontSize="13" fill={color.primary}>
            Raccordement au réseau public d'électricité
          </text>
        </g>
        
        {/* Définitions des dégradés */}
        <defs>
          <linearGradient id="pyloneMainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0057D9" />
            <stop offset="50%" stopColor={color.primary} />
            <stop offset="100%" stopColor="#003A8C" />
          </linearGradient>
          
          <linearGradient id="pyloneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.primary} stopOpacity="0.9" />
            <stop offset="50%" stopColor={color.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={color.primary} stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.primary} />
            <stop offset="100%" stopColor="#0039A6" />
          </linearGradient>
          
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0057D9" />
            <stop offset="100%" stopColor={color.primary} />
          </linearGradient>
          
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.accent} />
            <stop offset="100%" stopColor={color.primary} />
          </linearGradient>
          
          <filter id="houseLight" x="-10%" y="-10%" width="120%" height="120%">
            <feSpecularLighting result="specOut" specularExponent="20" lightingColor="white">
              <fePointLight x="60" y="20" z="120" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
          
          <filter id="roofLight" x="-10%" y="-10%" width="120%" height="120%">
            <feSpecularLighting result="specOut" specularExponent="20" lightingColor="white">
              <fePointLight x="72" y="15" z="100" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
          
          <filter id="windowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in="SourceGraphic" />
          </filter>
          
          <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.accent} />
            <stop offset="100%" stopColor="#5A9531" />
          </linearGradient>
          
          <filter id="strongTextShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.3" />
          </filter>
          
          <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.2" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export default NewSiteLogo;