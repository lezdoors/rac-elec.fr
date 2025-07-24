/**
 * Tests de vérification automatique de l'adaptation mobile
 * Ce fichier contient des fonctions pour vérifier que les composants s'adaptent correctement
 */

/**
 * Vérifie si l'appareil est mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
}

/**
 * Types de problèmes d'adaptation mobile
 */
export enum MobileIssueType {
  TOUCH_TARGET_TOO_SMALL = "touch-target-too-small",
  FONT_SIZE_TOO_SMALL = "font-size-too-small",
  OVERFLOW_CONTENT = "overflow-content",
  SPACING_TOO_SMALL = "spacing-too-small",
  ANIMATION_PERFORMANCE = "animation-performance"
}

/**
 * Interface pour les problèmes détectés
 */
export interface MobileIssue {
  type: MobileIssueType;
  element: string;
  severity: "warning" | "error";
  message: string;
  recommendation: string;
}

/**
 * Vérifie les tailles des cibles tactiles
 */
export function checkTouchTargets(): MobileIssue[] {
  if (typeof document === 'undefined') return [];
  
  const issues: MobileIssue[] = [];
  const MIN_TOUCH_SIZE = 44; // pixels, selon les recommandations WCAG
  
  // Sélecteurs pour les éléments interactifs
  const interactiveElements = document.querySelectorAll(
    'button, a, input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], select, [role="button"]'
  );
  
  interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const elementInfo = element.tagName.toLowerCase();
    const elementId = element.id ? `#${element.id}` : '';
    const elementDescription = `${elementInfo}${elementId}`;
    
    if (rect.width < MIN_TOUCH_SIZE || rect.height < MIN_TOUCH_SIZE) {
      issues.push({
        type: MobileIssueType.TOUCH_TARGET_TOO_SMALL,
        element: elementDescription,
        severity: "error",
        message: `Zone tactile trop petite (${Math.round(rect.width)}×${Math.round(rect.height)}px)`,
        recommendation: `Augmenter la taille à au moins ${MIN_TOUCH_SIZE}×${MIN_TOUCH_SIZE}px`
      });
    }
  });
  
  return issues;
}

/**
 * Vérifie les tailles de police
 */
export function checkFontSizes(): MobileIssue[] {
  if (typeof document === 'undefined') return [];
  
  const issues: MobileIssue[] = [];
  const MIN_FONT_SIZE = 12; // pixels
  const RECOMMENDED_BASE_FONT_SIZE = 16; // pixels
  
  // Sélectionner tous les éléments de texte
  const textElements = document.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, span, a, button, input, textarea, select, label'
  );
  
  textElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const elementInfo = element.tagName.toLowerCase();
    
    if (fontSize < MIN_FONT_SIZE) {
      issues.push({
        type: MobileIssueType.FONT_SIZE_TOO_SMALL,
        element: elementInfo,
        severity: "error",
        message: `Taille de police trop petite (${fontSize}px)`,
        recommendation: `Augmenter la taille de police à au moins ${MIN_FONT_SIZE}px`
      });
    } else if (fontSize < RECOMMENDED_BASE_FONT_SIZE && (elementInfo === 'p' || elementInfo === 'span')) {
      issues.push({
        type: MobileIssueType.FONT_SIZE_TOO_SMALL,
        element: elementInfo,
        severity: "warning",
        message: `Taille de police inférieure à la recommandation (${fontSize}px)`,
        recommendation: `Envisager d'augmenter la taille à ${RECOMMENDED_BASE_FONT_SIZE}px pour le texte principal`
      });
    }
  });
  
  return issues;
}

/**
 * Vérifie les problèmes de débordement de contenu
 */
export function checkContentOverflow(): MobileIssue[] {
  if (typeof document === 'undefined') return [];
  
  const issues: MobileIssue[] = [];
  const windowWidth = window.innerWidth;
  
  // Vérifier le débordement horizontal
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    
    // Ignorer les éléments avec overflow caché intentionnellement
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.overflowX === 'hidden' || computedStyle.overflow === 'hidden') {
      return;
    }
    
    if (rect.width > windowWidth) {
      const elementInfo = element.tagName.toLowerCase();
      const elementId = element.id ? `#${element.id}` : '';
      const elementDescription = `${elementInfo}${elementId}`;
      
      issues.push({
        type: MobileIssueType.OVERFLOW_CONTENT,
        element: elementDescription,
        severity: "error",
        message: `Débordement horizontal détecté (largeur: ${Math.round(rect.width)}px)`,
        recommendation: "Ajouter 'max-width: 100%' ou 'overflow-x: auto'"
      });
    }
  });
  
  return issues;
}

/**
 * Vérifie l'espacement entre les éléments interactifs
 */
export function checkSpacing(): MobileIssue[] {
  if (typeof document === 'undefined') return [];
  
  const issues: MobileIssue[] = [];
  const MIN_SPACING = 8; // pixels
  
  // Sélecteurs pour les éléments interactifs
  const interactiveElements = document.querySelectorAll(
    'button, a, input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], select, [role="button"]'
  );
  
  const elements = Array.from(interactiveElements);
  
  for (let i = 0; i < elements.length; i++) {
    const element1 = elements[i];
    const rect1 = element1.getBoundingClientRect();
    
    for (let j = i + 1; j < elements.length; j++) {
      const element2 = elements[j];
      const rect2 = element2.getBoundingClientRect();
      
      // Vérifier si les éléments se chevauchent ou sont trop proches
      const horizontalDistance = Math.min(
        Math.abs(rect1.left - rect2.right),
        Math.abs(rect1.right - rect2.left)
      );
      
      const verticalDistance = Math.min(
        Math.abs(rect1.top - rect2.bottom),
        Math.abs(rect1.bottom - rect2.top)
      );
      
      // Si les rectangles se chevauchent horizontalement et verticalement
      const overlapsHorizontally = rect1.left < rect2.right && rect1.right > rect2.left;
      const overlapsVertically = rect1.top < rect2.bottom && rect1.bottom > rect2.top;
      
      if (overlapsHorizontally && overlapsVertically) {
        // Les éléments se chevauchent
        const element1Info = element1.tagName.toLowerCase();
        const element2Info = element2.tagName.toLowerCase();
        
        issues.push({
          type: MobileIssueType.SPACING_TOO_SMALL,
          element: `${element1Info} et ${element2Info}`,
          severity: "error",
          message: "Éléments interactifs qui se chevauchent",
          recommendation: "Augmenter l'espacement entre les éléments interactifs"
        });
      } else if (
        (overlapsHorizontally && verticalDistance < MIN_SPACING) ||
        (overlapsVertically && horizontalDistance < MIN_SPACING)
      ) {
        // Les éléments sont trop proches
        const element1Info = element1.tagName.toLowerCase();
        const element2Info = element2.tagName.toLowerCase();
        
        issues.push({
          type: MobileIssueType.SPACING_TOO_SMALL,
          element: `${element1Info} et ${element2Info}`,
          severity: "warning",
          message: `Espacement insuffisant (${Math.min(horizontalDistance, verticalDistance).toFixed(1)}px)`,
          recommendation: `Augmenter l'espacement à au moins ${MIN_SPACING}px`
        });
      }
    }
  }
  
  return issues;
}

/**
 * Vérifie les performances d'animation
 * Note: cette fonction est approximative car il est difficile de mesurer précisément les performances
 */
export function checkAnimationPerformance(): MobileIssue[] {
  if (typeof document === 'undefined') return [];
  
  const issues: MobileIssue[] = [];
  
  // Sélectionner tous les éléments avec des animations
  const animatedElements = document.querySelectorAll(
    '[class*="animate-"], [class*="motion-"], [style*="animation"], [style*="transition"]'
  );
  
  let complexAnimationsCount = 0;
  
  animatedElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const hasTransform = computedStyle.transform !== 'none';
    const hasOpacity = computedStyle.opacity !== '1';
    const hasFilter = computedStyle.filter !== 'none';
    const hasBlur = computedStyle.filter.includes('blur');
    
    // Détecter les animations complexes
    if ((hasTransform && hasFilter) || hasBlur) {
      complexAnimationsCount++;
      
      const elementInfo = element.tagName.toLowerCase();
      const elementId = element.id ? `#${element.id}` : '';
      const elementDescription = `${elementInfo}${elementId}`;
      
      issues.push({
        type: MobileIssueType.ANIMATION_PERFORMANCE,
        element: elementDescription,
        severity: "warning",
        message: "Animation potentiellement coûteuse (transform + filter/blur)",
        recommendation: "Simplifier l'animation ou désactiver sur mobile"
      });
    }
  });
  
  // Vérifier le nombre total d'animations
  if (complexAnimationsCount > 5) {
    issues.push({
      type: MobileIssueType.ANIMATION_PERFORMANCE,
      element: "document",
      severity: "warning",
      message: `Nombre élevé d'animations complexes (${complexAnimationsCount})`,
      recommendation: "Réduire le nombre d'animations simultanées sur mobile"
    });
  }
  
  return issues;
}

/**
 * Exécute tous les tests d'adaptation mobile
 */
export function runAllMobileTests(): MobileIssue[] {
  return [
    ...checkTouchTargets(),
    ...checkFontSizes(),
    ...checkContentOverflow(),
    ...checkSpacing(),
    ...checkAnimationPerformance()
  ];
}

/**
 * Obtient un rapport de problèmes catégorisés par type et sévérité
 */
export function getMobileIssuesReport(): {
  summary: { errors: number; warnings: number; total: number };
  categorized: Record<MobileIssueType, { errors: MobileIssue[]; warnings: MobileIssue[] }>;
} {
  const issues = runAllMobileTests();
  
  // Initialiser la structure de catégorisation
  const categorized: Record<MobileIssueType, { errors: MobileIssue[]; warnings: MobileIssue[] }> = {
    [MobileIssueType.TOUCH_TARGET_TOO_SMALL]: { errors: [], warnings: [] },
    [MobileIssueType.FONT_SIZE_TOO_SMALL]: { errors: [], warnings: [] },
    [MobileIssueType.OVERFLOW_CONTENT]: { errors: [], warnings: [] },
    [MobileIssueType.SPACING_TOO_SMALL]: { errors: [], warnings: [] },
    [MobileIssueType.ANIMATION_PERFORMANCE]: { errors: [], warnings: [] }
  };
  
  // Catégoriser les problèmes
  issues.forEach(issue => {
    if (issue.severity === "error") {
      categorized[issue.type].errors.push(issue);
    } else {
      categorized[issue.type].warnings.push(issue);
    }
  });
  
  // Compter les totaux
  const errorCount = issues.filter(issue => issue.severity === "error").length;
  const warningCount = issues.filter(issue => issue.severity === "warning").length;
  
  return {
    summary: {
      errors: errorCount,
      warnings: warningCount,
      total: issues.length
    },
    categorized
  };
}

// Attacher ces fonctions à window pour les rendre accessibles dans la console
if (typeof window !== 'undefined') {
  (window as any).mobileTests = {
    runAllMobileTests,
    getMobileIssuesReport,
    checkTouchTargets,
    checkFontSizes,
    checkContentOverflow,
    checkSpacing,
    checkAnimationPerformance
  };
}