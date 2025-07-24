/**
 * Layout professionnel et administratif optimisé pour mobile
 * Design moderne, responsive et performant pour tous les navigateurs
 */

import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MobileProfessionalTitle, MobileSectionHeader, MobilePageTitle } from './professional-mobile-titles';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight, Bell, User } from 'lucide-react';

interface MobileAdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  headerActions?: ReactNode;
  sidebarContent?: ReactNode;
  showNotifications?: boolean;
  userMenu?: ReactNode;
  className?: string;
}

/**
 * Layout principal administratif pour mobile et desktop
 * Interface professionnelle avec navigation adaptative
 */
export function MobileAdminLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  headerActions,
  sidebarContent,
  showNotifications = true,
  userMenu,
  className,
}: MobileAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection responsive optimisée
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermeture automatique du sidebar sur mobile lors du changement de route
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, title]);

  return (
    <div className={cn('min-h-screen bg-slate-50 dark:bg-slate-900', className)}>
      {/* Header administratif fixe */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
          {/* Bouton menu mobile + logo/titre */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isMobile && sidebarContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 -ml-2"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              {title && (
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {title}
                </h1>
              )}
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Notifications */}
            {showNotifications && (
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            )}
            
            {/* Menu utilisateur */}
            {userMenu || (
              <Button variant="ghost" size="sm" className="p-2">
                <User className="h-5 w-5" />
                <span className="sr-only">Profil utilisateur</span>
              </Button>
            )}
            
            {/* Actions personnalisées */}
            {headerActions}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar administratif */}
        {sidebarContent && (
          <>
            {/* Overlay mobile */}
            {isMobile && sidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <aside className={cn(
              'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700',
              'transform transition-transform duration-200 ease-in-out pt-14 sm:pt-16',
              isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
              !isMobile && 'static'
            )}>
              <div className="flex flex-col h-full">
                {/* Header sidebar mobile */}
                {isMobile && (
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Menu
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="p-2"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                
                {/* Contenu sidebar */}
                <div className="flex-1 overflow-y-auto p-4">
                  {sidebarContent}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Contenu principal */}
        <main className={cn(
          'flex-1 min-w-0',
          !isMobile && sidebarContent && 'ml-64'
        )}>
          {/* En-tête de page avec breadcrumbs */}
          {(title || subtitle || breadcrumbs) && (
            <MobilePageTitle
              title={title || ''}
              subtitle={subtitle}
              breadcrumbs={breadcrumbs}
            />
          )}
          
          {/* Contenu de la page */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Conteneur de contenu avec espacement cohérent
 * Optimisé pour l'affichage administratif sur mobile
 */
interface MobileContentContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export function MobileContentContainer({
  children,
  maxWidth = 'full',
  spacing = 'normal',
  className,
}: MobileContentContainerProps) {
  return (
    <div className={cn(
      'w-full mx-auto',
      {
        'max-w-sm': maxWidth === 'sm',
        'max-w-md': maxWidth === 'md', 
        'max-w-lg': maxWidth === 'lg',
        'max-w-xl': maxWidth === 'xl',
        'max-w-2xl': maxWidth === '2xl',
        'max-w-none': maxWidth === 'full',
      },
      {
        'space-y-4': spacing === 'tight',
        'space-y-6': spacing === 'normal',
        'space-y-8': spacing === 'relaxed',
      },
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Carte administrative professionnelle
 * Design moderne et responsive pour les interfaces d'administration
 */
interface MobileAdminCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileAdminCard({
  title,
  description,
  children,
  headerAction,
  footer,
  variant = 'default',
  size = 'md',
  className,
}: MobileAdminCardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700',
      {
        'shadow-sm': variant === 'default',
        'shadow-none border-2': variant === 'outlined',
        'shadow-lg': variant === 'elevated',
      },
      className
    )}>
      {/* En-tête de carte */}
      {(title || description || headerAction) && (
        <div className={cn(
          'flex items-start justify-between border-b border-slate-200 dark:border-slate-700',
          {
            'px-4 py-3': size === 'sm',
            'px-6 py-4': size === 'md',
            'px-8 py-6': size === 'lg',
          }
        )}>
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          
          {headerAction && (
            <div className="flex-shrink-0 ml-4">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      {/* Contenu de la carte */}
      <div className={cn({
        'px-4 py-3': size === 'sm',
        'px-6 py-5': size === 'md', 
        'px-8 py-6': size === 'lg',
      })}>
        {children}
      </div>
      
      {/* Pied de carte */}
      {footer && (
        <div className={cn(
          'border-t border-slate-200 dark:border-slate-700',
          {
            'px-4 py-3': size === 'sm',
            'px-6 py-4': size === 'md',
            'px-8 py-5': size === 'lg',
          }
        )}>
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Navigation breadcrumb responsive et accessible
 */
interface MobileBreadcrumbProps {
  items: { label: string; href?: string }[];
  separator?: ReactNode;
  className?: string;
}

export function MobileBreadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  className,
}: MobileBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <span className="text-slate-400 dark:text-slate-500 mx-2">
              {separator}
            </span>
          )}
          
          {item.href ? (
            <a
              href={item.href}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}