/**
 * Composants de titres optimisés pour mobile avec style administratif et professionnel
 * Responsive, performant et compatible avec tous les navigateurs modernes
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileTitleProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  variant?: 'primary' | 'secondary' | 'accent' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  className?: string;
  truncate?: boolean;
  uppercase?: boolean;
}

/**
 * Titre principal optimisé pour mobile avec design administratif
 * S'adapte automatiquement à la taille de l'écran
 */
export function MobileProfessionalTitle({
  children,
  level = 1,
  variant = 'primary',
  size,
  weight = 'semibold',
  align = 'left',
  className,
  truncate = false,
  uppercase = false,
}: MobileTitleProps) {
  // Calcul automatique de la taille basé sur le niveau si non spécifié
  const autoSize = size || (['xl', 'lg', 'md', 'sm'][level - 1] as MobileTitleProps['size']) || 'md';
  
  // Classes de base pour un design administratif et professionnel
  const baseClasses = cn(
    // Typographie de base
    'font-sans leading-tight tracking-tight',
    
    // Couleurs par variante avec contraste élevé pour l'accessibilité
    {
      'text-slate-900 dark:text-slate-50': variant === 'primary',
      'text-slate-700 dark:text-slate-200': variant === 'secondary', 
      'text-blue-700 dark:text-blue-300': variant === 'accent',
      'text-slate-600 dark:text-slate-400': variant === 'subtle',
    },
    
    // Tailles responsives optimisées pour mobile
    {
      'text-lg sm:text-xl md:text-2xl': autoSize === 'xs',
      'text-xl sm:text-2xl md:text-3xl': autoSize === 'sm',
      'text-2xl sm:text-3xl md:text-4xl': autoSize === 'md',
      'text-3xl sm:text-4xl md:text-5xl': autoSize === 'lg',
      'text-4xl sm:text-5xl md:text-6xl': autoSize === 'xl',
    },
    
    // Poids de police
    {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
    },
    
    // Alignement
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    },
    
    // Options additionnelles
    {
      'truncate': truncate,
      'uppercase tracking-wider': uppercase,
    },
    
    // Espacement optimisé pour mobile
    'mb-2 sm:mb-3 md:mb-4',
    
    // Amélioration de la lisibilité sur mobile
    'antialiased subpixel-antialiased',
    
    className
  );
  
  // Sélection du bon élément HTML pour le SEO et l'accessibilité
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Component className={baseClasses}>
      {children}
    </Component>
  );
}

/**
 * Section header administratif avec séparateur et description optionnelle
 * Design moderne et professionnel pour interface d'administration
 */
interface MobileSectionHeaderProps {
  title: string;
  description?: string;
  level?: 1 | 2 | 3;
  variant?: 'primary' | 'secondary';
  showDivider?: boolean;
  action?: ReactNode;
  className?: string;
}

export function MobileSectionHeader({
  title,
  description,
  level = 2,
  variant = 'primary',
  showDivider = true,
  action,
  className,
}: MobileSectionHeaderProps) {
  return (
    <div className={cn('space-y-2 sm:space-y-3', className)}>
      {/* En-tête avec titre et action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <MobileProfessionalTitle
            level={level}
            variant={variant}
            className="mb-0"
          >
            {title}
          </MobileProfessionalTitle>
          
          {description && (
            <p className={cn(
              'text-sm sm:text-base text-slate-600 dark:text-slate-400',
              'leading-relaxed mt-1 sm:mt-2',
              'max-w-none sm:max-w-2xl'
            )}>
              {description}
            </p>
          )}
        </div>
        
        {/* Action (bouton, menu, etc.) */}
        {action && (
          <div className="flex-shrink-0 self-start sm:self-center">
            {action}
          </div>
        )}
      </div>
      
      {/* Séparateur visuel */}
      {showDivider && (
        <div className="border-b border-slate-200 dark:border-slate-700 pt-2 sm:pt-3" />
      )}
    </div>
  );
}

/**
 * Titre de page principal avec breadcrumb et métadonnées
 * Design administratif et professionnel pour les applications d'entreprise
 */
interface MobilePageTitleProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  };
  actions?: ReactNode;
  className?: string;
}

export function MobilePageTitle({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  className,
}: MobilePageTitleProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700',
      'px-4 sm:px-6 py-4 sm:py-6',
      className
    )}>
      {/* Breadcrumbs pour la navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 sm:mb-4" aria-label="Breadcrumb">
          <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
      
      {/* Contenu principal du titre */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
        <div className="min-w-0 flex-1">
          {/* Titre principal avec badge optionnel */}
          <div className="flex items-start gap-3">
            <MobileProfessionalTitle level={1} className="mb-0 flex-1">
              {title}
            </MobileProfessionalTitle>
            
            {badge && (
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                'flex-shrink-0 mt-1',
                {
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': badge.variant === 'success',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': badge.variant === 'warning',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': badge.variant === 'error',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': badge.variant === 'info',
                  'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200': badge.variant === 'neutral' || !badge.variant,
                }
              )}>
                {badge.text}
              </span>
            )}
          </div>
          
          {/* Sous-titre descriptif */}
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions (boutons, menus, etc.) */}
        {actions && (
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:justify-end">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Classes utilitaires pour les composants administratifs mobiles
 */
export const mobileAdminClasses = {
  // Conteneurs principaux
  pageContainer: 'min-h-screen bg-slate-50 dark:bg-slate-900',
  contentContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
  
  // Cartes et panneaux
  card: 'bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700',
  cardHeader: 'px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-700',
  cardContent: 'px-4 sm:px-6 py-4 sm:py-5',
  
  // Espacement cohérent
  sectionSpacing: 'space-y-6 sm:space-y-8',
  elementSpacing: 'space-y-4 sm:space-y-6',
  
  // Boutons administratifs
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors',
  secondaryButton: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-4 py-2 rounded-md transition-colors',
} as const;