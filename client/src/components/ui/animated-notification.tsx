import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationBadgeAnimation } from "@/lib/animations";

interface AnimatedNotificationBadgeProps {
  count: number;
  className?: string;
  max?: number;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
}

/**
 * Badge de notification animé qui apparaît avec un effet de pop
 */
export function AnimatedNotificationBadge({
  count,
  className = "",
  max = 99,
  variant = "primary"
}: AnimatedNotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-500 text-white";
      case "warning":
        return "bg-amber-500 text-white";
      case "danger":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      case "primary":
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={notificationBadgeAnimation}
        className={cn(
          "absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium px-1.5",
          getVariantClasses(),
          className
        )}
      >
        {displayCount}
      </motion.div>
    </AnimatePresence>
  );
}

interface AnimatedNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  type?: "success" | "warning" | "error" | "info";
  duration?: number;
  className?: string;
}

/**
 * Notification toast animée avec différents types d'alertes
 */
export function AnimatedNotification({
  isVisible,
  onClose,
  title,
  message,
  type = "info",
  duration = 5000,
  className = ""
}: AnimatedNotificationProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case "success":
        return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600";
      case "warning":
        return "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600";
      case "error":
        return "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600";
      case "info":
      default:
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600";
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8,
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95, 
      transition: { 
        duration: 0.2, 
        ease: "easeIn" 
      } 
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={notificationVariants}
          className={cn(
            "rounded-md shadow-md p-4 mb-3 relative",
            getTypeClasses(),
            className
          )}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {message}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NotificationIconProps {
  hasNotifications?: boolean;
  count?: number;
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
}

/**
 * Icône de notification avec badge animé
 */
export function NotificationIcon({
  hasNotifications = false,
  count = 0,
  className = "",
  iconClassName = "",
  badgeClassName = ""
}: NotificationIconProps) {
  return (
    <div className={cn("relative", className)}>
      <Bell className={cn("h-5 w-5", iconClassName)} />
      {hasNotifications && (
        <AnimatedNotificationBadge 
          count={count} 
          className={badgeClassName} 
        />
      )}
    </div>
  );
}