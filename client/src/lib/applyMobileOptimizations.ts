/**
 * Fonction pour appliquer automatiquement toutes les optimisations mobiles
 * Cette fonction peut être importée et appelée lors de l'initialisation de l'application
 */

import { applyMobilePerformanceOptimizations, useIsMobile } from "./mobile-optimizations";
import { useEffect } from "react";

/**
 * Fonctions internes pour appliquer les optimisations CSS pour mobile
 */
function _injectOptimizationStyles() {
  // Ne pas exécuter côté serveur
  if (typeof document === "undefined") return;
  
  // Éviter les doubles injections
  if (document.getElementById("mobile-optimization-styles")) return;
  
  // Créer l'élément de style
  const styleEl = document.createElement("style");
  styleEl.id = "mobile-optimization-styles";
  
  // Optimisations CSS pour mobile
  styleEl.textContent = `
    /* Optimisations mobiles automatiques */
    @media (max-width: 768px) {
      /* Améliorer la taille des zones tactiles */
      button, 
      a[role="button"],
      input[type="button"],
      input[type="submit"],
      input[type="reset"],
      .clickable {
        min-height: 44px !important;
        min-width: 44px !important;
      }
      
      /* Améliorer l'espacement des éléments cliquables */
      .form-controls > * {
        margin-bottom: 16px !important;
      }
      
      /* Améliorer la lisibilité du texte */
      body {
        font-size: 16px !important;
        line-height: 1.6 !important;
      }
      
      /* Optimiser les entrées */
      input, select, textarea {
        font-size: 16px !important; /* Éviter le zoom sur iOS */
      }
      
      /* Optimiser le padding pour les petits écrans */
      .container {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      
      /* Désactiver les effets hover qui n'ont pas de sens sur mobile */
      .hover\\:scale-105:hover {
        transform: none !important;
      }
      
      /* Optimiser les tables pour petits écrans */
      table {
        display: block;
        width: 100%;
        overflow-x: auto;
      }
    }
    
    /* Classe utilitaires pour les transitions adaptatives */
    .mobile-transition-fade {
      transition-property: opacity;
      transition-duration: 300ms;
    }
    
    @media (max-width: 768px) {
      .mobile-transition-fade {
        transition-duration: 200ms;
      }
    }
    
    /* Animation de shimmer optimisée */
    @keyframes optimized-shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0)
      );
      background-size: 200% 100%;
      animation: optimized-shimmer 2s infinite;
    }
    
    @media (max-width: 768px) {
      .skeleton-shimmer {
        animation-duration: 1.5s;
      }
    }
    
    /* Optimisation des animations */
    .optimize-for-mobile {
      --enable-complex-animations: 0;
      --enable-parallax: 0;
      --enable-bg-animations: 0;
    }
    
    @media (max-width: 768px) {
      .reduce-motion * {
        transition-duration: 0.2s !important;
        animation-duration: 0.2s !important;
      }
      
      .optimize-performance {
        will-change: auto !important;
      }
      
      .optimize-performance * {
        backdrop-filter: none !important;
        box-shadow: none !important;
      }
    }
  `;
  
  // Injecter les styles
  document.head.appendChild(styleEl);
}

/**
 * Fonction de nettoyage des optimisations
 */
function _cleanupOptimizations() {
  // Ne pas exécuter côté serveur
  if (typeof document === "undefined") return;
  
  // Supprimer les styles d'optimisation
  const styleEl = document.getElementById("mobile-optimization-styles");
  if (styleEl) {
    styleEl.remove();
  }
  
  // Nettoyer les classes ajoutées
  document.body.classList.remove("optimize-for-mobile");
  document.body.classList.remove("reduce-motion");
  document.documentElement.style.removeProperty("--enable-complex-animations");
  document.documentElement.style.removeProperty("--enable-parallax");
  document.documentElement.style.removeProperty("--enable-background-animations");
}

/**
 * Hook pour appliquer automatiquement les optimisations mobiles
 * Usage : useApplyMobileOptimizations() dans le composant racine
 */
export function useApplyMobileOptimizations() {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Injecter les styles CSS
    _injectOptimizationStyles();
    
    // Appliquer les optimisations de performance
    if (isMobile) {
      applyMobilePerformanceOptimizations();
      document.body.classList.add("optimize-for-mobile");
      document.body.classList.add("reduce-motion");
      
      // Optimiser le scroll
      if ("scrollBehavior" in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = "auto";
      }
    }
    
    // Nettoyage au démontage
    return () => {
      _cleanupOptimizations();
    };
  }, [isMobile]);
}

/**
 * Fonction principale pour appliquer toutes les optimisations mobiles
 */
export function applyMobileOptimizations() {
  // Injecter les styles CSS
  _injectOptimizationStyles();
  
  // Appliquer les optimisations de performance
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    applyMobilePerformanceOptimizations();
    document.body.classList.add("optimize-for-mobile");
    document.body.classList.add("reduce-motion");
    
    // Optimiser le scroll
    if ("scrollBehavior" in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = "auto";
    }
  }
  
  // Retourner la fonction de nettoyage
  return _cleanupOptimizations;
}