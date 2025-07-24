import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Collection de logos professionnels pour Raccordement Enedis
 * Versions épurées, institutionnelles et adaptées à l'image de marque
 */

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
  animate?: boolean;
}

const sizesMap = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
  header: 'w-48 h-12',
};

/**
 * Logo minimal et professionnel avec maison et ligne de connexion
 */
export function ProfessionalLogo1({ className, size = 'md', variant = 'light', animate = false }: LogoProps) {
  // Couleurs adaptées à la charte Enedis
  const colors = {
    light: {
      primary: '#0046AD', // Bleu Enedis
      secondary: '#007bff',
      accent: '#6FB53E', // Vert Enedis
      text: '#333333',
      background: '#FFFFFF',
    },
    dark: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent: '#6FB53E',
      text: '#FFFFFF',
      background: '#162447',
    },
    blue: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent: '#6FB53E',
      text: '#162447',
      background: '#E8F0FE',
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg 
        viewBox="0 0 240 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full" 
        aria-labelledby="professional-logo1-title"
      >
        <title id="professional-logo1-title">Raccordement Enedis</title>
        
        {/* Cercle */}
        <circle cx="36" cy="36" r="28" fill={color.background} stroke={color.primary} strokeWidth="2" />
        
        {/* Maison stylisée simple */}
        <g>
          <path d="M20 45V30L36 20L52 30V45H20Z" fill={color.primary} />
          <rect x="32" y="35" width="8" height="10" fill={color.background} />
        </g>
        
        {/* Ligne de connexion horizontale */}
        <line 
          x1="65" 
          y1="36" 
          x2="110" 
          y2="36" 
          stroke={color.primary} 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeDasharray={animate ? "1, 4" : "0"}
          className={animate ? "animate-[dash_15s_linear_infinite]" : ""}
        />
        
        {/* Texte */}
        <text x="120" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={color.primary}>
          Raccordement
        </text>
        <text x="120" y="48" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.primary}>
          Enedis
        </text>
        
        {/* Point de connexion */}
        {animate && (
          <circle cx="65" cy="36" r="3" fill={color.accent} className="animate-pulse" />
        )}
      </svg>
    </div>
  );
}

/**
 * Logo professionnel avec éléments de raccordement électrique
 */
export function ProfessionalLogo2({ className, size = 'md', variant = 'blue', animate = false }: LogoProps) {
  // Couleurs adaptées à la charte Enedis
  const colors = {
    light: {
      primary: '#0046AD', // Bleu Enedis
      secondary: '#007bff',
      accent: '#6FB53E', // Vert Enedis
      text: '#333333',
      background: '#FFFFFF',
    },
    dark: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent: '#6FB53E',
      text: '#FFFFFF',
      background: '#162447',
    },
    blue: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent: '#6FB53E',
      text: '#162447',
      background: '#E8F0FE',
    }
  };

  const color = colors[variant] || colors.blue;

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg 
        viewBox="0 0 240 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full" 
        aria-labelledby="professional-logo2-title"
      >
        <title id="professional-logo2-title">Raccordement Enedis</title>
        
        {/* Fond arrondi */}
        <rect x="5" y="10" width="230" height="60" rx="8" fill={color.background} />
        
        {/* Icône pylône électrique stylisé */}
        <g>
          <line x1="30" y1="20" x2="30" y2="60" stroke={color.primary} strokeWidth="2" />
          <line x1="20" y1="25" x2="40" y2="25" stroke={color.primary} strokeWidth="2" />
          <line x1="15" y1="35" x2="45" y2="35" stroke={color.primary} strokeWidth="2" />
          <line x1="10" y1="45" x2="50" y2="45" stroke={color.primary} strokeWidth="2" />
        </g>
        
        {/* Icône maison */}
        <g>
          <rect x="60" y="35" width="24" height="15" fill={color.primary} />
          <path d="M55 35L72 25L89 35H55Z" fill={color.primary} />
          <rect x="68" y="40" width="8" height="10" fill={color.background} />
        </g>
        
        {/* Ligne de connexion */}
        <path 
          d="M50 35 C 55 35, 55 35, 60 35" 
          stroke={color.primary} 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeDasharray={animate ? "1, 2" : "0"}
          className={animate ? "animate-[dash_15s_linear_infinite]" : ""}
        />
        
        {/* Texte */}
        <text x="100" y="40" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={color.primary}>
          Votre partenaire Raccordement Enedis
        </text>
        
        {/* Effet d'énergie subtil */}
        {animate && (
          <g className="animate-pulse">
            <path 
              d="M55 35 L53 40 L57 40 L55 45" 
              stroke={color.accent} 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Logo simple avec connexion directe (plus institutionnel)
 */
export function InstitutionalLogo({ className, size = 'md', variant = 'light', animate = false }: LogoProps) {
  // Couleurs adaptées à la charte Enedis
  const colors = {
    light: {
      primary: '#0046AD', // Bleu Enedis
      secondary: '#007bff',
      accent: '#6FB53E', // Vert Enedis
      text: '#333333',
      background: '#FFFFFF',
    },
    dark: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent: '#6FB53E',
      text: '#FFFFFF',
      background: '#162447',
    },
    blue: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent: '#6FB53E',
      text: '#162447',
      background: '#E8F0FE',
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg 
        viewBox="0 0 240 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full" 
        aria-labelledby="institutional-logo-title"
      >
        <title id="institutional-logo-title">Raccordement Enedis</title>
        
        {/* Cercle principal */}
        <circle cx="40" cy="40" r="30" fill={color.background} stroke={color.primary} strokeWidth="2" />
        
        {/* Maison très simplifiée */}
        <g>
          <path d="M25 50V35L40 25L55 35V50H25Z" fill={color.primary} />
          <rect x="30" y="40" width="20" height="10" fill={color.primary} stroke={color.background} strokeWidth="1" />
        </g>
        
        {/* Ligne de connexion directe avec flèche */}
        <g>
          <line 
            x1="70" 
            y1="40" 
            x2="110" 
            y2="40" 
            stroke={color.primary} 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeDasharray={animate ? "1, 3" : "0"}
            className={animate ? "animate-[dash_15s_linear_infinite]" : ""}
          />
          <path d="M110 35L120 40L110 45" fill="none" stroke={color.primary} strokeWidth="2" strokeLinejoin="round" />
        </g>
        
        {/* Texte */}
        <text x="140" y="32" fontFamily="Arial, sans-serif" fontSize="12" fill={color.primary}>
          Raccordement
        </text>
        <text x="140" y="48" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.primary}>
          Enedis
        </text>
        
        {/* Point de connexion subtil */}
        {animate && (
          <circle cx="70" cy="40" r="3" fill={color.accent} className="animate-pulse" />
        )}
      </svg>
    </div>
  );
}

/**
 * Composant de galerie de logos professionnels
 */
export function ProfessionalLogoGallery() {
  const [animate, setAnimate] = React.useState(true);
  
  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Logos Professionnels</h2>
        <button 
          onClick={() => setAnimate(!animate)} 
          className={`px-4 py-2 rounded text-white transition-colors ${animate ? 'bg-blue-700' : 'bg-gray-500'}`}
        >
          {animate ? 'Animations activées' : 'Animations désactivées'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Professionnel 1</h3>
          <ProfessionalLogo1 size="md" animate={animate} />
          <p className="mt-6 text-gray-600 text-center">
            Design épuré et professionnel avec maison et ligne de connexion, conforme aux codes visuels du secteur de l'énergie.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <ProfessionalLogo1 size="sm" variant="light" animate={animate} />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <ProfessionalLogo1 size="sm" variant="dark" animate={animate} />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <ProfessionalLogo1 size="sm" variant="blue" animate={animate} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Professionnel 2</h3>
          <ProfessionalLogo2 size="md" animate={animate} />
          <p className="mt-6 text-gray-600 text-center">
            Design institutionnel avec pylône et maison, représentant clairement le raccordement au réseau électrique.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <ProfessionalLogo2 size="sm" variant="light" animate={animate} />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <ProfessionalLogo2 size="sm" variant="dark" animate={animate} />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <ProfessionalLogo2 size="sm" variant="blue" animate={animate} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Institutionnel</h3>
          <InstitutionalLogo size="md" animate={animate} />
          <p className="mt-6 text-gray-600 text-center">
            Approche sobre et institutionnelle, parfaitement alignée avec l'identité visuelle d'Enedis.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <InstitutionalLogo size="sm" variant="light" animate={animate} />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <InstitutionalLogo size="sm" variant="dark" animate={animate} />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <InstitutionalLogo size="sm" variant="blue" animate={animate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant d'en-tête avec logo professionnel
 */
export function ProfessionalHeader({ logo = 'professional1', animate = true }) {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {logo === 'professional1' && <ProfessionalLogo1 size="header" animate={animate} />}
            {logo === 'professional2' && <ProfessionalLogo2 size="header" animate={animate} />}
            {logo === 'institutional' && <InstitutionalLogo size="header" animate={animate} />}
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Accueil</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Services</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Contact</a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Demande de raccordement
            </button>
          </nav>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

// Animation keyframes pour les effets subtils
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes dash {
    to {
      stroke-dashoffset: 30;
    }
  }
`;
document.head.appendChild(styleSheet);

export default function ProfessionalLogos() {
  return <ProfessionalLogoGallery />;
}