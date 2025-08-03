import React from 'react';

interface NewLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NewLogo({ size = 'md', className = '' }: NewLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto max-w-[120px]',
    md: 'h-8 w-auto max-w-[160px]',
    lg: 'h-10 w-auto max-w-[200px]',
    xl: 'h-12 w-auto max-w-[240px]'
  };

  return (
    <img
      src="/logo-raccordement.png"
      alt="Portail Raccordement - Raccordement au réseau public d'électricité Enedis"
      className={`${sizeClasses[size]} ${className} object-contain`}
      loading="lazy"
      onError={(e) => {
        console.error('Logo failed to load:', e);
      }}
    />
  );
}

export default NewLogo;