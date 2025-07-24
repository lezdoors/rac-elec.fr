/**
 * Export des composants mobiles professionnels et administratifs
 * Interface optimisée pour les performances et l'expérience utilisateur
 */

// Composants de titres et en-têtes
export {
  MobileProfessionalTitle,
  MobileSectionHeader,
  MobilePageTitle,
  mobileAdminClasses,
} from './professional-mobile-titles';

// Composants de layout et structure
export {
  MobileAdminLayout,
  MobileContentContainer,
  MobileAdminCard,
  MobileBreadcrumb,
} from './professional-mobile-layout';

// Composants de formulaires
export {
  MobileFormField,
  MobileInput,
  MobileSelect,
  MobileTextarea,
  MobileStepForm,
  MobileFormSection,
  MobileActionButton,
} from './professional-mobile-forms';

/**
 * Hook utilitaire pour la détection mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
}

/**
 * Classes CSS utilitaires pour mobile administratif
 */
export const mobileUtils = {
  // Conteneurs responsive
  container: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  maxWidth: {
    sm: 'max-w-sm mx-auto',
    md: 'max-w-md mx-auto',
    lg: 'max-w-lg mx-auto',
    xl: 'max-w-xl mx-auto',
    '2xl': 'max-w-2xl mx-auto',
    full: 'max-w-full',
  },
  
  // Espacement cohérent
  spacing: {
    tight: 'space-y-4',
    normal: 'space-y-6',
    relaxed: 'space-y-8',
  },
  
  // Grilles responsive
  grid: {
    single: 'grid grid-cols-1',
    double: 'grid grid-cols-1 sm:grid-cols-2',
    triple: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  
  // Typographie mobile
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
  },
  
  // Boutons responsive
  button: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm sm:text-base',
    lg: 'h-12 px-6 text-base sm:text-lg',
  },
} as const;