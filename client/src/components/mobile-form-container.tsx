import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { MOBILE_UX_IMPROVEMENTS } from "@/lib/mobile-optimizations";

interface MobileFormContainerProps {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
}

/**
 * Conteneur adaptatif pour les formulaires sur mobile
 * Applique automatiquement les bonnes marges, paddings et styles en fonction de la taille d'écran
 */
export function MobileFormContainer({
  children,
  className,
  fullHeight = false,
  noPadding = false
}: MobileFormContainerProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  
  // Appliquer les optimisations de performance sur mobile
  useEffect(() => {
    if (isMobile) {
      // Ajouter des classes d'optimisation au body
      document.body.classList.add("optimize-for-mobile");
      document.body.classList.add("reduce-motion");
      
      // Limiter les animations sur mobile
      document.documentElement.style.setProperty("--enable-complex-animations", "0");
      
      return () => {
        // Nettoyer lors du démontage
        document.body.classList.remove("optimize-for-mobile");
        document.body.classList.remove("reduce-motion");
        document.documentElement.style.setProperty("--enable-complex-animations", "1");
      };
    }
  }, [isMobile]);
  
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-950 border border-border/40 rounded-lg shadow-sm",
        isMobile ? "mx-2 mt-2 mb-4" : "mx-auto my-6 max-w-4xl",
        !noPadding && (isMobile ? "p-4" : "p-6"),
        fullHeight && "min-h-[calc(100vh-4rem)]",
        mobileClasses.container,
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileFormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Section de formulaire optimisée pour mobile
 */
export function MobileFormSection({
  children,
  title,
  description,
  icon,
  className
}: MobileFormSectionProps) {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "mb-6 border border-border/40 rounded-md bg-white dark:bg-gray-900 shadow-sm",
        isMobile ? "p-3" : "p-5",
        className
      )}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          {icon && (
            <span className="text-primary">{icon}</span>
          )}
          
          <div>
            {title && (
              <h3 className={cn(
                "font-medium text-gray-800 dark:text-gray-100",
                isMobile ? "text-base" : "text-lg"
              )}>
                {title}
              </h3>
            )}
            
            {description && (
              <p className={cn(
                "text-gray-500 dark:text-gray-400",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        isMobile ? "space-y-3" : "space-y-4"
      )}>
        {children}
      </div>
    </div>
  );
}

interface MobileFormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * Grille de formulaire adaptative pour mobile
 */
export function MobileFormGrid({
  children,
  columns = 1,
  className
}: MobileFormGridProps) {
  const isMobile = useIsMobile();
  
  // Sur mobile, toujours une colonne
  const effectiveColumns = isMobile ? 1 : columns;
  
  return (
    <div
      className={cn(
        "grid gap-4",
        effectiveColumns === 1 && "grid-cols-1",
        effectiveColumns === 2 && "grid-cols-1 md:grid-cols-2",
        effectiveColumns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileFormButtonsProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "column";
}

/**
 * Conteneur pour les boutons de formulaire adapté au mobile
 */
export function MobileFormButtons({
  children,
  className,
  direction = "row"
}: MobileFormButtonsProps) {
  const isMobile = useIsMobile();
  
  // Sur mobile, toujours en colonne si spécifié, sinon adapter selon la direction
  const mobileDirection = direction === "column" || isMobile ? "flex-col space-y-3" : "flex-row space-x-3";
  
  return (
    <div
      className={cn(
        "flex mt-6",
        mobileDirection,
        className
      )}
    >
      {children}
    </div>
  );
}