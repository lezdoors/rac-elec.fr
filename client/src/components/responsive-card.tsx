import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { ChevronDown, ChevronUp, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResponsiveCardProps {
  title: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success";
  footer?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (isOpen: boolean) => void;
  headerAction?: ReactNode;
  noPadding?: boolean;
  noBorder?: boolean;
  href?: string;
  elevation?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

/**
 * Carte responsive avec support pour mode plié/déplié sur mobile
 */
export function ResponsiveCard({
  title,
  children,
  icon,
  className,
  badge,
  badgeVariant = "default",
  footer,
  collapsible = false,
  defaultCollapsed = false,
  onToggle,
  headerAction,
  noPadding = false,
  noBorder = false,
  href,
  elevation = "sm",
  rounded = "md",
}: ResponsiveCardProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [isCollapsed, setIsCollapsed] = useState(isMobile && defaultCollapsed);
  
  // Obtenir les classes d'élévation
  const getElevationClasses = () => {
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
  
  // Obtenir les classes d'arrondi
  const getRoundedClasses = () => {
    switch (rounded) {
      case "none":
        return "";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };
  
  // Gérer le clic sur le titre pour plier/déplier
  const handleToggle = () => {
    if (!collapsible) return;
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };
  
  // Wrapper pour les liens
  const CardWrapper = ({ children }: { children: ReactNode }) => {
    if (href) {
      return (
        <a
          href={href}
          className={cn(
            "block transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
            getRoundedClasses()
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };
  
  return (
    <CardWrapper>
      <div
        className={cn(
          "bg-white dark:bg-gray-900",
          !noBorder && "border border-border/40",
          getElevationClasses(),
          getRoundedClasses(),
          className
        )}
      >
        {/* En-tête de la carte */}
        <div
          className={cn(
            "flex items-center justify-between",
            noPadding ? "px-0 py-3" : mobileClasses.card,
            collapsible && "cursor-pointer select-none",
            href && "pr-2"
          )}
          onClick={collapsible ? handleToggle : undefined}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "font-medium",
                  typeof title === "string" ? "truncate" : "",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  {title}
                </div>
                
                {badge && (
                  <Badge variant={badgeVariant} className="text-xs font-normal">
                    {badge}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {headerAction && <div>{headerAction}</div>}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={e => {
                  e.stopPropagation();
                  handleToggle();
                }}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {href && (
              <ExternalLink className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Contenu de la carte */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  !noPadding && mobileClasses.card,
                  "pt-0"
                )}
              >
                {children}
              </div>
              
              {/* Pied de carte optionnel */}
              {footer && (
                <div
                  className={cn(
                    "border-t border-border/30",
                    !noPadding && mobileClasses.card,
                    "pt-3"
                  )}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CardWrapper>
  );
}

interface CollapsibleSectionProps {
  title: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  collapsedHeight?: number;
}

/**
 * Section repliable optimisée pour mobile avec animation fluide
 */
export function CollapsibleSection({
  title,
  children,
  icon,
  className,
  defaultOpen = false,
  onToggle,
  collapsedHeight = 0
}: CollapsibleSectionProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };
  
  return (
    <div className={cn("mb-4", className)}>
      <button
        className={cn(
          "w-full flex items-center justify-between py-2 px-3 text-left rounded-md",
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          isOpen ? "mb-2" : ""
        )}
        onClick={toggle}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <span className={cn(
            "font-medium",
            isMobile ? "text-sm" : "text-base"
          )}>
            {title}
          </span>
        </div>
        
        <ChevronRight
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: collapsedHeight, opacity: 0.8 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: collapsedHeight, opacity: 0.8 }}
            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className={cn(
              "rounded-md",
              isMobile ? "px-3" : "px-4",
              "pb-2"
            )}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionCardProps {
  items: {
    id: string;
    title: ReactNode;
    content: ReactNode;
    icon?: ReactNode;
    badge?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success";
  }[];
  className?: string;
  allowMultiple?: boolean;
  defaultOpenId?: string;
}

/**
 * Groupe de cartes accordéon adaptatif pour mobile
 */
export function AccordionCard({
  items,
  className,
  allowMultiple = false,
  defaultOpenId
}: AccordionCardProps) {
  const [openItems, setOpenItems] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );
  
  const handleToggle = (id: string) => {
    if (allowMultiple) {
      // Mode multi-ouvert: ajouter/retirer de la liste
      setOpenItems(current =>
        current.includes(id)
          ? current.filter(item => item !== id)
          : [...current, id]
      );
    } else {
      // Mode accordéon: un seul ouvert à la fois
      setOpenItems(current =>
        current.includes(id) ? [] : [id]
      );
    }
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      {items.map(item => (
        <ResponsiveCard
          key={item.id}
          title={item.title}
          icon={item.icon}
          badge={item.badge}
          badgeVariant={item.badgeVariant}
          collapsible
          defaultCollapsed={!openItems.includes(item.id)}
          onToggle={(isOpen) => {
            if (isOpen) {
              handleToggle(item.id);
            } else {
              handleToggle(item.id);
            }
          }}
        >
          {item.content}
        </ResponsiveCard>
      ))}
    </div>
  );
}