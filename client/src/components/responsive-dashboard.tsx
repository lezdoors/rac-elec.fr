import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile, getMobileClasses, BREAKPOINTS } from "@/lib/mobile-optimizations";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ScrollReveal } from "@/components/ui/scroll-animation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  BarChart3, 
  Bell, 
  User, 
  FileText, 
  Calendar, 
  Settings, 
  List,
  Globe,
  Menu,
  X
} from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendLabel?: string;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Carte de tableau de bord réactive pour afficher des statistiques clés
 */
export function ResponsiveDashboardCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  footer,
  className,
  onClick
}: DashboardCardProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);

  return (
    <AnimatedCard
      title={
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <span className={cn("font-medium", isMobile ? "text-sm" : "text-base")}>{title}</span>
        </div>
      }
      withHoverEffect={!!onClick}
      onClick={onClick}
      className={cn(
        "border border-border/50 h-full",
        isMobile ? "p-3" : "p-4",
        className
      )}
      contentClassName={cn("pt-2")}
    >
      <div className="flex flex-col">
        <span className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>
          {value}
        </span>

        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={cn(
                trend.isPositive ? "text-green-500" : "text-red-500",
                "flex items-center text-xs font-medium"
              )}
            >
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              {trend.isPositive ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </span>
            {trendLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {trendLabel}
              </span>
            )}
          </div>
        )}

        {footer && (
          <div className={cn("mt-3 pt-3 border-t border-border/40 text-sm text-gray-500", 
            isMobile ? "text-xs" : "text-sm"
          )}>
            {footer}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Grille responsive pour le tableau de bord qui s'adapte aux appareils mobiles
 */
export function ResponsiveDashboardGrid({
  children,
  className,
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  }
}: DashboardGridProps) {
  const { width } = useWindowSize();
  
  // Détermine le nombre de colonnes basé sur la largeur de l'écran
  const getColumnCount = () => {
    if (width < BREAKPOINTS.sm) return columns.sm || 1;
    if (width < BREAKPOINTS.md) return columns.md || 2;
    if (width < BREAKPOINTS.lg) return columns.lg || 3;
    return columns.xl || 4;
  };
  
  const columnCount = getColumnCount();
  
  return (
    <div
      className={cn(
        "grid gap-4",
        columnCount === 1 && "grid-cols-1",
        columnCount === 2 && "grid-cols-1 sm:grid-cols-2",
        columnCount === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columnCount === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

/**
 * Section du tableau de bord adaptative pour mobile
 */
export function ResponsiveDashboardSection({
  title,
  description,
  children,
  className,
  action
}: DashboardSectionProps) {
  const isMobile = useIsMobile();

  return (
    <ScrollReveal className={cn("mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className={cn(
            "font-semibold text-gray-900 dark:text-gray-100", 
            isMobile ? "text-lg" : "text-xl"
          )}>
            {title}
          </h2>
          {description && (
            <p className={cn(
              "text-gray-500 dark:text-gray-400 mt-1",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {description}
            </p>
          )}
        </div>
        
        {action && <div className="mt-2 sm:mt-0">{action}</div>}
      </div>
      
      {children}
    </ScrollReveal>
  );
}

interface MobileDashboardTabsProps {
  tabs: {
    id: string;
    label: string;
    icon: ReactNode;
    content: ReactNode;
  }[];
  defaultTab?: string;
  className?: string;
}

/**
 * Navigation par onglets adaptée aux mobiles pour le tableau de bord
 */
export function MobileDashboardTabs({
  tabs,
  defaultTab,
  className
}: MobileDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const isMobile = useIsMobile();

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className={cn(className)}
    >
      <TabsList className={cn(
        "w-full border-b border-border/40 bg-transparent",
        isMobile 
          ? "overflow-x-auto flex-nowrap justify-start py-1 px-1 gap-1" 
          : "justify-center"
      )}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
              isMobile && "flex-shrink-0 flex-grow-0 px-3 py-1 gap-1.5"
            )}
          >
            {tab.icon}
            <span className={cn(isMobile && tab.id !== activeTab ? "sr-only" : "")}>
              {tab.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      <AnimatePresence mode="wait">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="mt-4"
            tabIndex={-1}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab.content}
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  );
}

interface MobileSidebarProps {
  items: {
    id: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    isActive?: boolean;
  }[];
  className?: string;
}

/**
 * Barre latérale adaptative pour mobile avec mode déroulant
 */
export function MobileSidebar({
  items,
  className
}: MobileSidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Version mobile: menu hamburger qui s'ouvre en overlay
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-30 rounded-full p-2 w-10 h-10 flex items-center justify-center"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <h2 className="font-semibold text-lg">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto p-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                      item.isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Version bureau: sidebar normale
  return (
    <aside
      className={cn(
        "w-64 h-full border-r border-border/40 flex-shrink-0 hidden lg:block",
        className
      )}
    >
      <nav className="p-4 flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
              item.isActive
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={item.onClick}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Exporter le hook de la taille de la fenêtre depuis mobile-optimizations
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Gestionnaire de redimensionnement
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Définir la taille initiale
    handleResize();

    // Ajouter l'écouteur d'événement
    window.addEventListener("resize", handleResize);

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}