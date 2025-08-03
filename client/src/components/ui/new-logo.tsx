import React from 'react';

interface NewLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NewLogo({ size = 'md', className = '' }: NewLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-20 w-auto'
  };

  return (
    <img
      src="/logo-raccordement.png"
      alt="Portail Raccordement - Raccordement au réseau public d'électricité Enedis"
      className={`${sizeClasses[size]} ${className}`}
      loading="lazy"
    />
  );
}

export default NewLogo;