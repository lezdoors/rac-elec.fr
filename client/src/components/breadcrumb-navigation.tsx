import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNavigation({ items, className }: BreadcrumbNavigationProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("flex text-sm opacity-70", className)}>
      <div className="flex flex-wrap items-center space-x-1 md:space-x-2">
        {/* Accueil - Rendu invisible visuellement mais maintenu pour l'accessibilité */}
        <div className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-blue-200/80 hover:text-blue-100">
            <Home className="h-3 w-3" />
            <span className="sr-only">Accueil</span>
          </Link>
        </div>

        {/* Séparateur après l'accueil */}
        <div className="text-blue-200/60">
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </div>

        {/* Éléments du fil d'Ariane */}
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn("inline-flex items-center", {
                "text-blue-200/80": item.href,
                "text-blue-100 font-medium": !item.href
              })}
            >
              {item.href ? (
                <Link href={item.href} className="hover:text-blue-100 text-xs">
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs">{item.label}</span>
              )}
            </div>
            
            {/* Séparateur pour tous sauf le dernier élément */}
            {index < items.length - 1 && (
              <div className="text-blue-200/60 ml-1 md:ml-2" aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Balisage Schema.org caché pour le SEO */}
      <div className="hidden">
        <ol itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/">
              <span itemProp="name">Accueil</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          
          {items.map((item, index) => (
            <li key={index} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              {item.href ? (
                <Link href={item.href}>
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span itemProp="name">{item.label}</span>
              )}
              <meta itemProp="position" content={`${index + 2}`} />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}