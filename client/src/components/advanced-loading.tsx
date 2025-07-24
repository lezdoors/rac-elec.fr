import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// Skeleton loader avancé avec animations optimisées
export const Skeleton = ({ 
  className, 
  variant = "default",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "text" | "circular" | "rectangular";
}) => {
  const variants = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none"
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

// Composant de chargement de carte
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("border rounded-lg p-6 space-y-4", className)}>
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
    </div>
    <Skeleton variant="rectangular" className="h-10 w-24" />
  </div>
);

// Composant de chargement de formulaire
export const FormSkeleton = ({ fields = 3, className }: { 
  fields?: number; 
  className?: string; 
}) => (
  <div className={cn("space-y-6", className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton variant="text" className="w-24 h-5" />
        <Skeleton variant="rectangular" className="h-10 w-full" />
      </div>
    ))}
    <Skeleton variant="rectangular" className="h-10 w-32" />
  </div>
);

// Composant de chargement de tableau
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) => (
  <div className={cn("space-y-4", className)}>
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {/* En-têtes */}
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" className="h-6 w-full" />
      ))}
      {/* Lignes */}
      {Array.from({ length: rows }).map((_, rowIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`row-${rowIndex}-col-${colIndex}`} 
            variant="text" 
            className="h-5 w-full" 
          />
        ))
      )}
    </div>
  </div>
);

// État de chargement avec message contextuel
export const LoadingState = ({ 
  message = "Chargement en cours...", 
  className,
  showSpinner = true
}: { 
  message?: string; 
  className?: string;
  showSpinner?: boolean;
}) => (
  <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
    {showSpinner && (
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
    )}
    <p className="text-gray-600 font-medium">{message}</p>
  </div>
);

// État d'erreur avec retry
export const ErrorState = ({ 
  message = "Une erreur est survenue", 
  onRetry,
  className
}: { 
  message?: string; 
  onRetry?: () => void;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <p className="text-gray-800 font-medium mb-2">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Réessayer
      </button>
    )}
  </div>
);

// État vide avec action
export const EmptyState = ({ 
  title = "Aucun élément", 
  description,
  action,
  icon,
  className
}: { 
  title?: string; 
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
    {icon && (
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-600 mb-4 max-w-sm">{description}</p>
    )}
    {action}
  </div>
);

// Composant de transition de contenu
export const ContentTransition = ({ 
  isLoading, 
  children, 
  loadingComponent,
  className
}: {
  isLoading: boolean;
  children: ReactNode;
  loadingComponent?: ReactNode;
  className?: string;
}) => (
  <div className={cn("transition-opacity duration-200", isLoading ? "opacity-50" : "opacity-100", className)}>
    {isLoading ? (loadingComponent || <LoadingState />) : children}
  </div>
);