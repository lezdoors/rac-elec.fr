import { ReactNode, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/mobile-optimizations";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, Home, ChevronRight, LogOut } from "lucide-react";

interface MobileNavigationProps {
  items: {
    href: string;
    label: string;
    icon?: ReactNode;
    badge?: number;
    children?: {
      href: string;
      label: string;
      icon?: ReactNode;
    }[];
  }[];
  logo?: ReactNode;
  userMenu?: ReactNode;
  onLogout?: () => void;
  className?: string;
}

/**
 * Navigation responsive qui s'adapte automatiquement aux écrans mobiles
 * Sur desktop: barre latérale fixe
 * Sur mobile: menu hamburger et barre de navigation inférieure
 */
export function MobileNavigation({
  items,
  logo,
  userMenu,
  onLogout,
  className
}: MobileNavigationProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  // Détecter sur quelle page nous sommes pour mettre en évidence le lien actif
  const isActive = (href: string) => {
    // Considérer le lien racine actif uniquement s'il correspond exactement
    if (href === "/") {
      return location === "/";
    }
    // Pour les autres liens, considérer actif si la page actuelle commence par ce lien
    return location.startsWith(href);
  };
  
  // Fermer la barre latérale lors d'un changement de page
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);
  
  // Barre latérale pour mobile (menu hamburger)
  const MobileSidebar = () => (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-lg md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border/40">
                  {logo ? (
                    <div>{logo}</div>
                  ) : (
                    <div className="font-bold text-lg">Menu</div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 py-2">
                  <div className="px-2 space-y-1">
                    {items.map((item, index) => (
                      <div key={index}>
                        {/* Éléments principaux */}
                        {item.children ? (
                          <button
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-md text-left",
                              isActive(item.href)
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            onClick={() =>
                              setActiveSubmenu(
                                activeSubmenu === item.href ? null : item.href
                              )
                            }
                          >
                            <div className="flex items-center">
                              {item.icon && (
                                <span className="mr-3">{item.icon}</span>
                              )}
                              <span>{item.label}</span>
                              {item.badge && item.badge > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 text-gray-500 transition-transform",
                                activeSubmenu === item.href && "rotate-90"
                              )}
                            />
                          </button>
                        ) : (
                          <Link href={item.href}>
                            <a
                              className={cn(
                                "block px-3 py-2 rounded-md",
                                isActive(item.href)
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                              )}
                            >
                              <div className="flex items-center">
                                {item.icon && (
                                  <span className="mr-3">{item.icon}</span>
                                )}
                                <span>{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </a>
                          </Link>
                        )}
                        
                        {/* Sous-menu */}
                        {item.children && activeSubmenu === item.href && (
                          <div className="pl-4 mt-1 mb-1 space-y-1">
                            {item.children.map((child, childIndex) => (
                              <Link key={childIndex} href={child.href}>
                                <a
                                  className={cn(
                                    "block px-3 py-2 text-sm rounded-md",
                                    isActive(child.href)
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                  )}
                                >
                                  <div className="flex items-center">
                                    {child.icon && (
                                      <span className="mr-3">{child.icon}</span>
                                    )}
                                    <span>{child.label}</span>
                                  </div>
                                </a>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Menu utilisateur */}
                <div className="p-4 border-t border-border/40">
                  {userMenu}
                  
                  {onLogout && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start mt-2"
                      onClick={onLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Navigation du bas pour mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-border/40 md:hidden z-30">
        <div className="flex justify-around">
          {items.slice(0, 5).map((item, index) => (
            <Link key={index} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center py-2 px-3",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <div className="relative">
                  {item.icon ? (
                    <div className="mb-1">{item.icon}</div>
                  ) : (
                    <Home className="h-5 w-5 mb-1" />
                  )}
                  
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 text-xs rounded-full bg-primary text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                
                <span className="text-xs">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
  
  // Navigation bureau standard
  const DesktopSidebar = () => (
    <div className={cn(
      "hidden md:flex md:flex-col h-full w-64 border-r border-border/40 fixed top-0 left-0 bg-white dark:bg-gray-900 z-30",
      className
    )}>
      {/* En-tête avec logo */}
      <div className="h-16 flex items-center px-4 border-b border-border/40">
        {logo ? (
          <div>{logo}</div>
        ) : (
          <div className="font-bold text-lg">Navigation</div>
        )}
      </div>
      
      {/* Menu principal */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {items.map((item, index) => (
            <div key={index}>
              {/* Éléments principaux */}
              {item.children ? (
                <button
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-left",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() =>
                    setActiveSubmenu(
                      activeSubmenu === item.href ? null : item.href
                    )
                  }
                >
                  <div className="flex items-center">
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-gray-500 transition-transform",
                      activeSubmenu === item.href && "rotate-90"
                    )}
                  />
                </button>
              ) : (
                <Link href={item.href}>
                  <a
                    className={cn(
                      "block px-3 py-2 rounded-md",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon && <span className="mr-3">{item.icon}</span>}
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </a>
                </Link>
              )}
              
              {/* Sous-menu */}
              {item.children && activeSubmenu === item.href && (
                <div className="pl-4 mt-1 mb-1 space-y-1">
                  {item.children.map((child, childIndex) => (
                    <Link key={childIndex} href={child.href}>
                      <a
                        className={cn(
                          "block px-3 py-2 text-sm rounded-md",
                          isActive(child.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex items-center">
                          {child.icon && (
                            <span className="mr-3">{child.icon}</span>
                          )}
                          <span>{child.label}</span>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Menu utilisateur */}
      {(userMenu || onLogout) && (
        <div className="p-4 border-t border-border/40">
          {userMenu}
          
          {onLogout && (
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          )}
        </div>
      )}
    </div>
  );
  
  // Le conteneur principal qui s'adapte selon la présence de la barre latérale
  const MainContainer = ({ children }: { children: ReactNode }) => (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-950",
      isMobile ? "pb-16" : "md:pl-64"
    )}>
      {children}
    </div>
  );
  
  return {
    MobileSidebar,
    DesktopSidebar,
    MainContainer
  };
}