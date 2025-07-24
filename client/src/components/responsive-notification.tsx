import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { Bell, X, Check, CheckCheck, Calendar, MailIcon, InfoIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
  icon?: ReactNode;
  link?: string;
  onView?: () => void;
}

interface ResponsiveNotificationProps {
  notifications: Notification[];
  onMarkAsRead: (id: string | number) => void;
  onMarkAllAsRead: () => void;
  onViewAll?: () => void;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Composant de notification responsive qui s'adapte automatiquement aux écrans mobiles
 * Sur desktop: menu dropdown
 * Sur mobile: tiroir latéral
 */
export function ResponsiveNotification({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  className,
  fullWidth = false
}: ResponsiveNotificationProps) {
  const isMobile = useIsMobile();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [isOpen, setIsOpen] = useState(false);
  
  // Convertir les chaînes de date en objets Date
  const formattedNotifications = notifications.map(notification => ({
    ...notification,
    timestamp: notification.timestamp instanceof Date
      ? notification.timestamp
      : new Date(notification.timestamp)
  }));
  
  // Trier les notifications par date (plus récentes en premier) et non lues en premier
  const sortedNotifications = [...formattedNotifications].sort((a, b) => {
    // D'abord trier par statut de lecture
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Ensuite par date
    return (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime();
  });
  
  // Obtenir l'icône du type de notification
  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Fonction pour obtenir l'icône dans le contexte du Toast
  const getToastIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Formatage de la date relative (il y a X minutes/heures)
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };
  
  // Gérer le clic sur une notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.onView) {
      notification.onView();
    }
    
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    setIsOpen(false);
  };
  
  // Composant de notification individuelle
  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        "p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-border/30 last:border-0",
        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className={cn(
              "text-sm font-medium",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </p>
            
            {!notification.read && (
              <div className="ml-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {notification.message}
          </p>
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatRelativeTime(notification.timestamp as Date)}
          </p>
        </div>
      </div>
    </motion.div>
  );
  
  // Version mobile avec tiroir latéral
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">Notifications</SheetTitle>
              
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={e => {
                    e.stopPropagation();
                    onMarkAllAsRead();
                  }}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1">
            {sortedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Vous n'avez pas de notification
                </p>
              </div>
            ) : (
              <div>
                {sortedNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          
          {onViewAll && (
            <SheetFooter className="p-3 border-t border-border/30">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onViewAll();
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }
  
  // Version desktop avec dropdown
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent
        align="end"
        alignOffset={-5}
        sideOffset={15}
        className={cn(
          "p-0 w-80 shadow-lg",
          fullWidth && "sm:w-96"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <div className="flex items-center">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} non {unreadCount > 1 ? "lues" : "lue"}
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={e => {
                e.stopPropagation();
                onMarkAllAsRead();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Tout lire
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Vous n'avez pas de notification
              </p>
            </div>
          ) : (
            <div>
              {sortedNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        {onViewAll && (
          <div className="p-2 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                onViewAll();
                setIsOpen(false);
              }}
            >
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Composant de notification toast responsive
interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

/**
 * Notification toast responsive qui s'affiche à une position donnée
 */
export function ResponsiveToastNotification({
  notification,
  onClose,
  duration = 5000,
  position = "top-right"
}: ToastNotificationProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  
  // Positionner le toast selon l'option choisie
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2";
      case "top-right":
      default:
        return "top-4 right-4";
    }
  };
  
  // Fermer automatiquement après la durée spécifiée
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  // Animation de fermeture terminée
  const handleAnimationComplete = () => {
    if (!isVisible) {
      onClose();
    }
  };
  
  // Variantes d'animation différentes pour mobile/desktop
  const variants = {
    initial: isMobile
      ? { opacity: 0, y: 50, scale: 0.8 }
      : { opacity: 0, y: -10, x: position.includes("left") ? -10 : 10 },
    animate: { opacity: 1, y: 0, x: 0, scale: 1 },
    exit: isMobile
      ? { opacity: 0, y: 50, scale: 0.8 }
      : { opacity: 0, y: -10, x: position.includes("left") ? -10 : 10 }
  };
  
  return (
    <div
      className={cn(
        "fixed z-50 max-w-lg",
        isMobile ? "left-4 right-4" : "max-w-sm",
        getPositionClasses()
      )}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ type: "spring", duration: 0.5 }}
            onAnimationComplete={handleAnimationComplete}
            className={cn(
              "bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border/50 overflow-hidden",
              notification.type === "success" && "border-l-4 border-l-green-500",
              notification.type === "warning" && "border-l-4 border-l-yellow-500",
              notification.type === "error" && "border-l-4 border-l-red-500",
              notification.type === "info" && "border-l-4 border-l-blue-500"
            )}
          >
            <div className="flex p-4">
              <div className="flex-shrink-0 mr-3">
                {getToastIcon(notification)}
              </div>
              
              <div className="flex-1 mr-2">
                <h5 className="font-medium text-sm">{notification.title}</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
              </div>
              
              <button
                className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Barre de progression */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800 w-full">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={cn(
                  "h-full",
                  notification.type === "success" && "bg-green-500",
                  notification.type === "warning" && "bg-yellow-500",
                  notification.type === "error" && "bg-red-500",
                  notification.type === "info" && "bg-blue-500"
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}