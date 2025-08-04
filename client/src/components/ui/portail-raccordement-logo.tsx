import { cn } from "../../lib/utils";
import { Link } from "wouter";

interface PortailRaccordementLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark';
  linkTo?: string;
  showText?: boolean;
}

const sizesMap = {
  sm: 'h-6 w-auto max-w-[140px]',
  md: 'h-8 w-auto max-w-[180px]',
  lg: 'h-12 w-auto max-w-[220px]',
  xl: 'h-16 w-auto max-w-[280px]',
  header: 'h-8 w-auto max-w-[200px] md:h-10 md:max-w-[240px] lg:h-12 lg:max-w-[280px]'
};

export function PortailRaccordementLogo({ 
  className, 
  size = 'header', 
  variant = 'light',
  linkTo = "/",
  showText = false
}: PortailRaccordementLogoProps) {
  
  // Import the logo images properly for Vite
  const logoSrc = variant === 'dark' 
    ? 'https://page.gensparksite.com/v1/base64_upload/fe7b58ed748706e923cfdf6372acd4fa'
    : 'https://page.gensparksite.com/v1/base64_upload/ab9eec9b7f5d761adbf4d7e047d11b8d';

  const LogoComponent = () => (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src={logoSrc}
        alt="Portail Raccordement - Service Enedis"
        className={cn(
          sizesMap[size],
          "object-contain transition-all duration-200 hover:scale-105"
        )}
        loading="eager"
        decoding="async"
      />
      {showText && (
        <div className={cn(
          "hidden md:flex flex-col justify-center",
          variant === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          <div className="text-sm font-semibold leading-tight">
            Raccordement au réseau
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            Service Enedis
          </div>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link 
        href={linkTo} 
        className="inline-block transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none"
        aria-label="Retour à l'accueil - Portail Raccordement"
      >
        <LogoComponent />
      </Link>
    );
  }

  return <LogoComponent />;
}

// Export default pour compatibilité
export default PortailRaccordementLogo;