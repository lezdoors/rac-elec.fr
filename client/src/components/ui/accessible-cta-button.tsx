import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Définition des variantes avec des ratios de contraste améliorés
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[#0D8A45] text-white hover:bg-[#086134] focus:ring-[#0D8A45]", // Vert avec contraste amélioré
        blue: "bg-[#0052CC] text-white hover:bg-[#003E9A] focus:ring-[#0052CC]", // Bleu avec contraste amélioré
        secondary: "bg-[#374151] text-white hover:bg-[#1F2937] focus:ring-[#374151]", // Gris foncé pour meilleur contraste
        outline: "border border-[#6B7280] text-[#111827] hover:bg-gray-100 focus:ring-[#6B7280]", // Bordure plus visible
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        xl: "h-12 px-10 rounded-md text-base",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false
    },
  }
);

// Définition des props du composant
export interface AccessibleCTAButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  target?: string;
  rel?: string;
}

// Implémentation du composant
const AccessibleCTAButton = React.forwardRef<HTMLButtonElement, AccessibleCTAButtonProps>(
  ({ className, variant, size, fullWidth, href, target, rel, ...props }, ref) => {
    // Si un href est fourni, c'est un lien sinon c'est un bouton
    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        >
          {props.children}
        </a>
      );
    }
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

AccessibleCTAButton.displayName = 'AccessibleCTAButton';

export { AccessibleCTAButton, buttonVariants };