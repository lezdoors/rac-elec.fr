import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Collection de logos professionnels statiques pour Raccordement Enedis
 * Versions épurées, institutionnelles et adaptées à l'image de marque
 */

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
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
export function ProfessionalLogo1({ className, size = 'md', variant = 'light' }: LogoProps) {
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
        />
        
        {/* Texte */}
        <text x="120" y="30" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={color.primary}>
          Raccordement
        </text>
        <text x="120" y="48" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.primary}>
          Enedis
        </text>
        
        {/* Point de connexion */}
        <circle cx="65" cy="36" r="3" fill={color.accent} />
      </svg>
    </div>
  );
}

/**
 * Logo professionnel avec éléments de raccordement électrique
 */
export function ProfessionalLogo2({ className, size = 'md', variant = 'blue' }: LogoProps) {
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
        />
        
        {/* Texte */}
        <text x="100" y="40" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={color.primary}>
          Votre partenaire Raccordement Enedis
        </text>
      </svg>
    </div>
  );
}

/**
 * Logo simple avec connexion directe (plus institutionnel)
 */
export function InstitutionalLogo({ className, size = 'md', variant = 'light' }: LogoProps) {
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
        <circle cx="70" cy="40" r="3" fill={color.accent} />
      </svg>
    </div>
  );
}

/**
 * Logo inspiré du style institutionnel Enedis
 */
export function EnedisStyleLogo({ className, size = 'md', variant = 'light' }: LogoProps) {
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
        aria-labelledby="enedis-style-logo-title"
      >
        <title id="enedis-style-logo-title">Raccordement Enedis</title>
        
        {/* Cercle style Enedis */}
        <circle cx="36" cy="40" r="26" fill={color.primary} />
        
        {/* Maison blanche dans cercle bleu */}
        <g>
          <path d="M24 48V34L36 26L48 34V48H24Z" fill="white" />
          <rect x="32" y="38" width="8" height="10" fill={color.primary} />
        </g>
        
        {/* Ligne de séparation verticale */}
        <line x1="80" y1="20" x2="80" y2="60" stroke={color.primary} strokeWidth="1" />
        
        {/* Texte */}
        <text x="100" y="35" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="normal" fill={color.primary}>
          Raccordement
        </text>
        <text x="100" y="55" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill={color.primary}>
          Enedis
        </text>
        
        {/* Texte additionnel optionnel */}
        <text x="100" y="70" fontFamily="Arial, sans-serif" fontSize="8" fill={color.primary}>
          Votre partenaire pour les démarches de raccordement
        </text>
      </svg>
    </div>
  );
}

/**
 * Composant de galerie de logos professionnels
 */
export function StaticProfessionalLogoGallery() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Logos Professionnels</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Professionnel 1</h3>
          <ProfessionalLogo1 size="md" />
          <p className="mt-6 text-gray-600 text-center">
            Design épuré et professionnel avec maison et ligne de connexion, conforme aux codes visuels du secteur de l'énergie.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <ProfessionalLogo1 size="sm" variant="light" />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <ProfessionalLogo1 size="sm" variant="dark" />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <ProfessionalLogo1 size="sm" variant="blue" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Professionnel 2</h3>
          <ProfessionalLogo2 size="md" />
          <p className="mt-6 text-gray-600 text-center">
            Design institutionnel avec pylône et maison, représentant clairement le raccordement au réseau électrique.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <ProfessionalLogo2 size="sm" variant="light" />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <ProfessionalLogo2 size="sm" variant="dark" />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <ProfessionalLogo2 size="sm" variant="blue" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Institutionnel</h3>
          <InstitutionalLogo size="md" />
          <p className="mt-6 text-gray-600 text-center">
            Approche sobre et institutionnelle, parfaitement alignée avec l'identité visuelle d'Enedis.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <InstitutionalLogo size="sm" variant="light" />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <InstitutionalLogo size="sm" variant="dark" />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <InstitutionalLogo size="sm" variant="blue" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6">Logo Style Enedis</h3>
          <EnedisStyleLogo size="md" />
          <p className="mt-6 text-gray-600 text-center">
            Design directement inspiré de la charte graphique Enedis, pour une intégration parfaite avec la marque.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Standard</p>
              <EnedisStyleLogo size="sm" variant="light" />
            </div>
            <div className="p-2 bg-gray-800 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1 text-white">Foncé</p>
              <EnedisStyleLogo size="sm" variant="dark" />
            </div>
            <div className="p-2 bg-blue-50 rounded flex flex-col items-center">
              <p className="text-xs text-center mb-1">Bleu</p>
              <EnedisStyleLogo size="sm" variant="blue" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Exemples d'intégration en en-tête</h3>
        
        <div className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <div className="bg-white shadow-sm p-4 flex justify-between items-center">
              <ProfessionalLogo1 size="header" />
              <div className="hidden md:flex space-x-4">
                <span className="text-gray-700">Accueil</span>
                <span className="text-gray-700">Services</span>
                <span className="text-gray-700">Contact</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Demande en ligne</button>
              </div>
            </div>
            <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
              Exemple d'en-tête avec Logo Professionnel 1
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="bg-blue-50 shadow-sm p-4 flex justify-between items-center">
              <ProfessionalLogo2 size="header" />
              <div className="hidden md:flex space-x-4">
                <span className="text-gray-700">Accueil</span>
                <span className="text-gray-700">Services</span>
                <span className="text-gray-700">Contact</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Demande en ligne</button>
              </div>
            </div>
            <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
              Exemple d'en-tête avec Logo Professionnel 2 sur fond bleu léger
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="bg-white shadow-sm p-4 flex justify-between items-center">
              <EnedisStyleLogo size="header" />
              <div className="hidden md:flex space-x-4">
                <span className="text-gray-700">Accueil</span>
                <span className="text-gray-700">Services</span>
                <span className="text-gray-700">Contact</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Demande en ligne</button>
              </div>
            </div>
            <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
              Exemple d'en-tête avec Logo Style Enedis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaticProfessionalLogos() {
  return <StaticProfessionalLogoGallery />;
}