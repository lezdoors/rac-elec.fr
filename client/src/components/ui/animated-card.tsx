import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardCardAnimation, cardHoverAnimation } from "@/lib/animations";

interface AnimatedCardProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  footer?: ReactNode;
  index?: number;
  withHoverEffect?: boolean;
  onClick?: () => void;
}

/**
 * Carte animée pour le tableau de bord et d'autres contenus
 * Inclut des effets d'entrée et de survol
 */
export function AnimatedCard({
  title,
  description,
  className = "",
  contentClassName = "",
  headerClassName = "",
  footerClassName = "",
  children,
  footer,
  index = 0,
  withHoverEffect = false,
  onClick
}: AnimatedCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate={withHoverEffect ? "rest" : "visible"}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
      variants={withHoverEffect ? cardHoverAnimation : dashboardCardAnimation}
      whileHover={withHoverEffect ? "hover" : undefined}
      whileTap={withHoverEffect ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(onClick ? "cursor-pointer" : "")}
    >
      <Card className={cn("border-border/40 bg-card/70 backdrop-blur-sm", className)}>
        {(title || description) && (
          <CardHeader className={headerClassName}>
            {title && (typeof title === "string" ? <CardTitle>{title}</CardTitle> : title)}
            {description && (typeof description === "string" ? (
              <CardDescription>{description}</CardDescription>
            ) : (
              description
            ))}
          </CardHeader>
        )}
        <CardContent className={cn("pt-0", contentClassName)}>
          {children}
        </CardContent>
        {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
      </Card>
    </motion.div>
  );
}

/**
 * Version simplifiée de la carte animée, pour une utilisation en liste
 */
export function AnimatedSimpleCard({
  className = "",
  children,
  index = 0,
  withHoverEffect = false,
  onClick
}: Omit<AnimatedCardProps, "title" | "description" | "footer" | "headerClassName" | "footerClassName" | "contentClassName">) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate={withHoverEffect ? "rest" : "visible"}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
      variants={withHoverEffect ? cardHoverAnimation : dashboardCardAnimation}
      whileHover={withHoverEffect ? "hover" : undefined}
      whileTap={withHoverEffect ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(onClick ? "cursor-pointer" : "")}
    >
      <Card className={cn("border-border/40 bg-card/70 backdrop-blur-sm", className)}>
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Groupe de cartes animées avec effet d'échelonnement (stagger)
 */
export function AnimatedCardGroup({
  children,
  className = "",
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}