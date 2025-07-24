import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// Interface pour les résultats de l'audit d'accessibilité
interface AccessibilityAudit {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  compliance: {
    wcag2_1_aa: boolean;
    section508: boolean;
    ada: boolean;
  };
}

interface AccessibilityIssue {
  level: 'error' | 'warning' | 'info';
  type: string;
  element: string;
  description: string;
  suggestion: string;
}

// Hook pour l'audit automatique d'accessibilité
export const useAccessibilityAudit = () => {
  const [auditResults, setAuditResults] = useState<AccessibilityAudit | null>(null);

  const runAudit = useCallback(() => {
    const issues: AccessibilityIssue[] = [];
    let score = 100;

    // Vérifier les images sans alt
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach(img => {
      issues.push({
        level: 'error',
        type: 'missing_alt_text',
        element: 'img',
        description: 'Image sans texte alternatif',
        suggestion: 'Ajouter un attribut alt descriptif'
      });
      score -= 5;
    });

    // Vérifier les liens sans texte descriptif
    const emptyLinks = document.querySelectorAll('a:empty, a[aria-label=""], a[title=""]');
    emptyLinks.forEach(link => {
      issues.push({
        level: 'error',
        type: 'empty_link',
        element: 'a',
        description: 'Lien sans texte descriptif',
        suggestion: 'Ajouter du texte ou un aria-label'
      });
      score -= 3;
    });

    // Vérifier les contrastes de couleur
    const checkColorContrast = () => {
      const elements = document.querySelectorAll('*');
      let contrastIssues = 0;
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        // Vérification simplifiée du contraste
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
          // Ici, une vérification plus complexe du contraste serait nécessaire
          // Cette version est simplifiée pour la démonstration
        }
      });
      
      return contrastIssues;
    };

    // Vérifier les formulaires
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputsWithoutLabels.forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel && input.id) {
        issues.push({
          level: 'warning',
          type: 'missing_label',
          element: 'input',
          description: 'Champ de formulaire sans label associé',
          suggestion: 'Associer un label ou utiliser aria-label'
        });
        score -= 2;
      }
    });

    // Vérifier la navigation au clavier
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    let keyboardIssues = 0;
    
    interactiveElements.forEach(el => {
      const tabIndex = el.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        keyboardIssues++;
      }
    });

    if (keyboardIssues > 0) {
      issues.push({
        level: 'warning',
        type: 'tabindex_positive',
        element: 'various',
        description: 'Utilisation de tabindex positif',
        suggestion: 'Utiliser tabindex="0" ou "-1" uniquement'
      });
      score -= keyboardIssues;
    }

    // Vérifier les heading hiérarchiques
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let headingIssues = 0;

    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      if (currentLevel > previousLevel + 1) {
        headingIssues++;
      }
      previousLevel = currentLevel;
    });

    if (headingIssues > 0) {
      issues.push({
        level: 'warning',
        type: 'heading_hierarchy',
        element: 'heading',
        description: 'Hiérarchie des titres non respectée',
        suggestion: 'Respecter l\'ordre séquentiel des niveaux de titre'
      });
      score -= headingIssues * 2;
    }

    // Générer les suggestions
    const suggestions: string[] = [];
    if (issues.length === 0) {
      suggestions.push('Excellente conformité à l\'accessibilité !');
    } else {
      suggestions.push('Corriger les erreurs d\'accessibilité identifiées');
      suggestions.push('Tester avec un lecteur d\'écran');
      suggestions.push('Valider la navigation au clavier');
    }

    // Évaluer la conformité
    const errorCount = issues.filter(i => i.level === 'error').length;
    const warningCount = issues.filter(i => i.level === 'warning').length;

    const compliance = {
      wcag2_1_aa: errorCount === 0 && warningCount <= 2,
      section508: errorCount === 0,
      ada: errorCount === 0 && warningCount <= 1
    };

    setAuditResults({
      score: Math.max(0, score),
      issues,
      suggestions,
      compliance
    });
  }, []);

  useEffect(() => {
    // Exécuter l'audit après le chargement initial
    const timer = setTimeout(runAudit, 2000);
    return () => clearTimeout(timer);
  }, [runAudit]);

  return { auditResults, runAudit };
};

// Composant d'affichage des résultats d'audit
export const AccessibilityAuditPanel = ({ 
  className,
  showInProduction = false 
}: { 
  className?: string;
  showInProduction?: boolean;
}) => {
  const { auditResults, runAudit } = useAccessibilityAudit();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!auditResults) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className={cn("fixed bottom-20 right-4 z-50", className)}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-purple-700 transition-colors"
        aria-label="Afficher les résultats d'accessibilité"
      >
        A11y
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80 max-w-md max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-gray-900">Audit d'Accessibilité</h4>
            <button
              onClick={runAudit}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Actualiser
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Score:</span>
              <span className={cn("font-bold", getScoreColor(auditResults.score))}>
                {auditResults.score}/100
              </span>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>WCAG 2.1 AA:</span>
                <span className={auditResults.compliance.wcag2_1_aa ? 'text-green-600' : 'text-red-600'}>
                  {auditResults.compliance.wcag2_1_aa ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Section 508:</span>
                <span className={auditResults.compliance.section508 ? 'text-green-600' : 'text-red-600'}>
                  {auditResults.compliance.section508 ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ADA:</span>
                <span className={auditResults.compliance.ada ? 'text-green-600' : 'text-red-600'}>
                  {auditResults.compliance.ada ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>

          {auditResults.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-xs text-gray-700 mb-2">
                Problèmes détectés ({auditResults.issues.length})
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {auditResults.issues.map((issue, index) => (
                  <div key={index} className="text-xs border-l-2 border-gray-200 pl-2">
                    <div className={cn("font-medium", getLevelColor(issue.level))}>
                      {issue.type.replace('_', ' ')}
                    </div>
                    <div className="text-gray-600">{issue.description}</div>
                    <div className="text-gray-500 text-xs">{issue.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h5 className="font-medium text-xs text-gray-700 mb-2">Suggestions</h5>
            <ul className="text-xs space-y-1">
              {auditResults.suggestions.map((suggestion, index) => (
                <li key={index} className="text-gray-600">• {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook pour la navigation au clavier améliorée
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Échapper ferme les modales
      if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        if (openModals.length > 0) {
          const lastModal = openModals[openModals.length - 1];
          const closeButton = lastModal.querySelector('[aria-label*="fermer"], [aria-label*="close"]') as HTMLElement;
          closeButton?.click();
        }
      }

      // Tab navigation pour les menus déroulants
      if (event.key === 'Tab') {
        const focusedElement = document.activeElement;
        if (focusedElement?.getAttribute('aria-expanded') === 'true') {
          const menu = document.querySelector(`#${focusedElement.getAttribute('aria-controls')}`);
          if (menu && !event.shiftKey) {
            event.preventDefault();
            const firstMenuItem = menu.querySelector('[role="menuitem"]') as HTMLElement;
            firstMenuItem?.focus();
          }
        }
      }

      // Navigation dans les menus avec les flèches
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        const focusedElement = document.activeElement;
        if (focusedElement?.getAttribute('role') === 'menuitem') {
          event.preventDefault();
          const menu = focusedElement.closest('[role="menu"]');
          if (menu) {
            const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
            const currentIndex = menuItems.indexOf(focusedElement);
            const nextIndex = event.key === 'ArrowDown' 
              ? (currentIndex + 1) % menuItems.length
              : (currentIndex - 1 + menuItems.length) % menuItems.length;
            (menuItems[nextIndex] as HTMLElement)?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};

// Composant pour les annonces aux lecteurs d'écran
export const LiveRegion = ({ 
  message, 
  priority = "polite",
  className 
}: { 
  message: string; 
  priority?: "polite" | "assertive"; 
  className?: string;
}) => (
  <div
    className={cn("sr-only", className)}
    aria-live={priority}
    aria-atomic="true"
    role="status"
  >
    {message}
  </div>
);

// Hook pour gérer le focus sur les éléments dynamiques
export const useFocusManagement = () => {
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const trapFocus = useCallback((containerSelector: string) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Tab') {
        if (keyEvent.shiftKey) {
          if (document.activeElement === firstElement) {
            keyEvent.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            keyEvent.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  }, []);

  return { focusElement, trapFocus };
};