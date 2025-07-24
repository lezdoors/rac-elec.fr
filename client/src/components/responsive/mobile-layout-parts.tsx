import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { useMobileTransition } from "@/lib/mobile-transitions";
import { ChevronLeft, ChevronRight, ArrowLeft, Menu, X, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResponsiveNotification } from "@/components/responsive-notification";
import { Link } from "wouter";

interface MobileHeaderProps {
  title: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  backTo?: string;
  rightContent?: ReactNode;
  showBorder?: boolean;
  sticky?: boolean;
  showShadow?: boolean;
  transparent?: boolean;
  logo?: ReactNode;
  menuItems?: { 
    label: string; 
    onClick: () => void; 
    icon?: ReactNode;
    danger?: boolean;
  }[];
  notifications?: any[];
  onMarkAsRead?: (id: string | number) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
  hideOnScroll?: boolean;
  elevation?: "none" | "sm" | "md" | "lg";
}

/**
 * En-tête adaptatif pour les appareils mobiles
 */
export function MobileHeader({
  title,
  showBackButton = false,
  onBack,
  backTo,
  rightContent,
  showBorder = true,
  sticky = true,
  showShadow = false,
  transparent = false,
  logo,
  menuItems,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
  hideOnScroll = false,
  elevation = "none"
}: MobileHeaderProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Transitions adaptées au mobile
  const transitionStyle = useMobileTransition({
    type: "slide-up",
    duration: 300,
    easing: "spring-light"
  });
  
  // Gérer le défilement pour cacher l'en-tête si nécessaire
  useEffect(() => {
    if (!hideOnScroll) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hideOnScroll, lastScrollY]);
  
  // Obtenir les classes d'élévation
  const getElevationClasses = () => {
    if (transparent) return "";
    
    switch (elevation) {
      case "none":
        return "";
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow";
      case "lg":
        return "shadow-lg";
      default:
        return showShadow ? "shadow-sm" : "";
    }
  };
  
  return (
    <>
      <header
        className={cn(
          "w-full z-40",
          sticky && "sticky top-0",
          !transparent && "bg-white dark:bg-gray-900",
          showBorder && !transparent && "border-b border-border/40",
          getElevationClasses(),
          hideOnScroll && !isVisible && "transform -translate-y-full",
          className
        )}
        style={
          hideOnScroll ? { 
            transition: "transform 0.3s ease", 
            ...transitionStyle 
          } : {}
        }
      >
        <div className={cn(
          "flex items-center justify-between h-14 px-4",
          mobileClasses.container
        )}>
          {/* Partie gauche */}
          <div className="flex items-center">
            {showBackButton && (
              backTo ? (
                <Link href={backTo}>
                  <a className="mr-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </a>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-3 h-9 w-9"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )
            )}
            
            {menuItems && menuItems.length > 0 && isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-3 h-9 w-9"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {logo && (
              <div className="mr-3">
                {logo}
              </div>
            )}
            
            <div className={cn(
              "font-medium truncate",
              isMobile ? "text-base" : "text-lg"
            )}>
              {title}
            </div>
          </div>
          
          {/* Partie droite */}
          <div className="flex items-center space-x-2">
            {notifications && onMarkAsRead && onMarkAllAsRead && (
              <ResponsiveNotification
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
              />
            )}
            
            {rightContent}
          </div>
        </div>
      </header>
      
      {/* Menu mobile */}
      <AnimatePresence>
        {isMenuOpen && menuItems && menuItems.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-border/30"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="font-medium">{typeof title === "string" ? title : "Menu"}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 max-h-[calc(100vh-4rem)]">
                <div className="py-2">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left",
                        item.danger && "text-red-500"
                      )}
                      onClick={() => {
                        item.onClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.icon && (
                        <span className="mr-3">{item.icon}</span>
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface MobileSearchHeaderProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backTo?: string;
  rightContent?: ReactNode;
  showBorder?: boolean;
  sticky?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * En-tête de recherche avec adaptation mobile
 */
export function MobileSearchHeader({
  onSearch,
  placeholder = "Rechercher...",
  initialValue = "",
  showBackButton = true,
  onBack,
  backTo,
  rightContent,
  showBorder = true,
  sticky = true,
  autoFocus = false,
  className
}: MobileSearchHeaderProps) {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState(initialValue);
  
  // Gérer le changement dans le champ de recherche
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };
  
  // Réinitialiser la recherche
  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };
  
  return (
    <header
      className={cn(
        "w-full bg-white dark:bg-gray-900 z-10",
        sticky && "sticky top-0",
        showBorder && "border-b border-border/40",
        className
      )}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {showBackButton && (
          backTo ? (
            <Link href={backTo}>
              <a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )
        )}
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleChange}
            className="pl-9 pr-8 h-10"
            autoFocus={autoFocus}
          />
          {searchValue && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        
        {rightContent}
      </div>
    </header>
  );
}

interface MobileFooterProps {
  children: ReactNode;
  showBorder?: boolean;
  sticky?: boolean;
  padded?: boolean;
  transparent?: boolean;
  className?: string;
  elevation?: "none" | "sm" | "md" | "lg";
}

/**
 * Pied de page adaptatif pour les appareils mobiles
 */
export function MobileFooter({
  children,
  showBorder = true,
  sticky = true,
  padded = true,
  transparent = false,
  className,
  elevation = "sm"
}: MobileFooterProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  
  // Obtenir les classes d'élévation (ombre)
  const getElevationClasses = () => {
    if (transparent) return "";
    
    switch (elevation) {
      case "none":
        return "";
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow";
      case "lg":
        return "shadow-lg";
      default:
        return "shadow-sm";
    }
  };
  
  return (
    <footer
      className={cn(
        "w-full z-10",
        sticky && "sticky bottom-0",
        !transparent && "bg-white dark:bg-gray-900",
        showBorder && !transparent && "border-t border-border/40",
        getElevationClasses(),
        className
      )}
    >
      <div className={cn(
        padded && (isMobile ? "px-4 py-3" : "px-6 py-4"),
        mobileClasses.container
      )}>
        {children}
      </div>
    </footer>
  );
}

interface MobileFooterButtonsProps {
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
  };
  tertiaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
  };
  fullWidth?: boolean;
  showBorder?: boolean;
  sticky?: boolean;
  className?: string;
}

/**
 * Pied de page avec boutons d'action adapté aux mobiles
 */
export function MobileFooterButtons({
  primaryAction,
  secondaryAction,
  tertiaryAction,
  fullWidth = true,
  showBorder = true,
  sticky = true,
  className
}: MobileFooterButtonsProps) {
  const isMobile = useIsMobile();
  
  // Ajuster la disposition selon le nombre d'actions
  const getButtonLayout = () => {
    // Compter les actions disponibles
    const actionCount = [primaryAction, secondaryAction, tertiaryAction]
      .filter(Boolean)
      .length;
    
    if (actionCount === 1) {
      return "flex justify-center";
    }
    
    if (actionCount === 2) {
      return isMobile
        ? "grid grid-cols-2 gap-3"
        : "flex justify-end space-x-3";
    }
    
    if (actionCount === 3) {
      return isMobile
        ? "grid grid-cols-3 gap-2"
        : "flex justify-between";
    }
    
    return "flex justify-end space-x-3";
  };
  
  return (
    <MobileFooter
      showBorder={showBorder}
      sticky={sticky}
      className={className}
      padded={true}
    >
      <div className={getButtonLayout()}>
        {tertiaryAction && (
          <Button
            variant="ghost"
            disabled={tertiaryAction.disabled}
            onClick={tertiaryAction.onClick}
            className={cn(
              isMobile && "text-sm",
              fullWidth && "w-full"
            )}
          >
            {tertiaryAction.icon && (
              <span className="mr-2">{tertiaryAction.icon}</span>
            )}
            <span>{tertiaryAction.label}</span>
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            variant="outline"
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onClick}
            className={cn(
              isMobile && "text-sm",
              fullWidth && "w-full"
            )}
          >
            {secondaryAction.icon && (
              <span className="mr-2">{secondaryAction.icon}</span>
            )}
            <span>{secondaryAction.label}</span>
          </Button>
        )}
        
        {primaryAction && (
          <Button
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            className={cn(
              isMobile && "text-sm",
              fullWidth && "w-full"
            )}
            isLoading={primaryAction.loading}
          >
            {!primaryAction.loading && primaryAction.icon && (
              <span className="mr-2">{primaryAction.icon}</span>
            )}
            <span>{primaryAction.label}</span>
          </Button>
        )}
      </div>
    </MobileFooter>
  );
}