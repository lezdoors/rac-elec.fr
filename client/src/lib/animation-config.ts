/**
 * Configuration globale des animations pour l'application
 * Ce fichier centralise tous les paramètres et réglages d'animation
 */

// Durées d'animation standards (en secondes)
export const ANIMATION_DURATIONS = {
  // Durées pour différents types d'animations
  veryFast: 0.15,
  fast: 0.25,
  normal: 0.4,
  slow: 0.6,
  verySlow: 1,
  
  // Durées pour des éléments spécifiques
  pageTransition: 0.4,
  modalEnter: 0.3,
  modalExit: 0.2,
  toastEnter: 0.35,
  toastExit: 0.2,
  formTransition: 0.3,
  buttonFeedback: 0.1,
  tooltipShow: 0.2,
  menuExpand: 0.3,
  notificationPop: 0.4,
  hoverEffect: 0.2,
};

// Courbes d'accélération (easing) pour différents types d'animations
export const ANIMATION_EASINGS = {
  // Standards
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Avancés
  easeInSine: [0.47, 0, 0.745, 0.715],
  easeOutSine: [0.39, 0.575, 0.565, 1],
  easeInOutSine: [0.445, 0.05, 0.55, 0.95],
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInQuart: [0.895, 0.03, 0.685, 0.22],
  easeOutQuart: [0.165, 0.84, 0.44, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeInQuint: [0.755, 0.05, 0.855, 0.06],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeInOutQuint: [0.86, 0, 0.07, 1],
  easeInExpo: [0.95, 0.05, 0.795, 0.035],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeInOutExpo: [1, 0, 0, 1],
  easeInCirc: [0.6, 0.04, 0.98, 0.335],
  easeOutCirc: [0.075, 0.82, 0.165, 1],
  easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
  easeInBack: [0.6, -0.28, 0.735, 0.045],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  easeInOutBack: [0.68, -0.55, 0.265, 1.55],
  
  // Électronique et énergétique (spécifique au secteur)
  energyPulse: [0.22, 1, 0.36, 1],
  powerSurge: [0.12, 0, 0.39, 0],
  electricFlow: [0.43, 0.13, 0.23, 0.96],
  connectivityWave: [0.76, 0, 0.24, 1],
};

// Configuration pour les ressorts dans les animations
export const ANIMATION_SPRINGS = {
  soft: {
    type: "spring",
    stiffness: 170,
    damping: 26,
  },
  medium: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  stiff: {
    type: "spring",
    stiffness: 500,
    damping: 30,
  },
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 10,
    mass: 1.2,
  },
  gentle: {
    type: "spring",
    stiffness: 120,
    damping: 20,
  },
  energetic: {
    type: "spring",
    stiffness: 400,
    damping: 15,
    mass: 1,
  },
};

// Délais standards pour les animations échelonnées
export const ANIMATION_DELAYS = {
  immediate: 0,
  minimal: 0.05,
  short: 0.1,
  medium: 0.2,
  long: 0.4,
  extraLong: 0.8,
};

// Modes de transition pour les animations de conteneurs
export const ANIMATION_TRANSITION_MODES = {
  wait: "wait",               // Attend que l'animation de sortie soit terminée avant de démarrer l'animation d'entrée
  sync: "sync",               // Exécute les animations d'entrée et de sortie en même temps
  popLayout: "popLayout",     // Utilisé pour les animations de mise en page
};

// Distances standards pour les déplacements dans les animations
export const ANIMATION_DISTANCES = {
  tiny: 5,
  small: 10,
  medium: 20,
  large: 40,
  extraLarge: 80,
};

// Palettes d'animation pour différentes sections de l'application
export const ANIMATION_PALETTES = {
  // Page principale
  homepage: {
    heroSection: {
      container: {
        duration: ANIMATION_DURATIONS.slow,
        easing: ANIMATION_EASINGS.easeOutQuart,
      },
      title: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.easeOutExpo,
        delay: ANIMATION_DELAYS.short,
      },
      subtitle: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.easeOutExpo,
        delay: ANIMATION_DELAYS.medium,
      },
      cta: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.bouncy,
        delay: ANIMATION_DELAYS.long,
      },
    },
    features: {
      container: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.easeOutQuart,
      },
      item: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.easeOutQuart,
        staggerDelay: ANIMATION_DELAYS.minimal,
      },
    },
  },
  
  // Formulaire
  multistepForm: {
    container: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeInOutQuart,
    },
    step: {
      enter: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.easeOutQuint,
      },
      exit: {
        duration: ANIMATION_DURATIONS.fast,
        easing: ANIMATION_EASINGS.easeInQuint,
      },
    },
    progress: {
      duration: ANIMATION_DURATIONS.slow,
      easing: ANIMATION_EASINGS.easeInOutQuad,
    },
    validation: {
      duration: ANIMATION_DURATIONS.fast,
      easing: ANIMATION_EASINGS.easeOutBack,
    },
  },
  
  // Tableau de bord
  dashboard: {
    container: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeOutQuart,
    },
    card: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeOutBack,
      staggerDelay: ANIMATION_DELAYS.short,
    },
    chart: {
      duration: ANIMATION_DURATIONS.slow,
      easing: ANIMATION_EASINGS.easeOutQuart,
      delay: ANIMATION_DELAYS.medium,
    },
    notification: {
      duration: ANIMATION_DURATIONS.fast,
      easing: ANIMATION_EASINGS.easeOutBack,
    },
  },
  
  // Interface d'administration
  admin: {
    container: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeOutQuart,
    },
    table: {
      row: {
        duration: ANIMATION_DURATIONS.fast,
        easing: ANIMATION_EASINGS.easeOutQuad,
        staggerDelay: ANIMATION_DELAYS.minimal,
      },
    },
    modal: {
      open: {
        duration: ANIMATION_DURATIONS.modalEnter,
        easing: ANIMATION_EASINGS.easeOutQuart,
      },
      close: {
        duration: ANIMATION_DURATIONS.modalExit,
        easing: ANIMATION_EASINGS.easeInQuad,
      },
    },
  },
  
  // Pages de confirmation et paiement
  confirmation: {
    container: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeOutQuart,
    },
    icon: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeOutBack,
      delay: ANIMATION_DELAYS.short,
    },
    message: {
      duration: ANIMATION_DURATIONS.normal,
      easing: ANIMATION_EASINGS.easeOutQuart,
      delay: ANIMATION_DELAYS.medium,
    },
  },
  
  // Animations partagées
  shared: {
    buttonHover: {
      duration: ANIMATION_DURATIONS.buttonFeedback,
      easing: ANIMATION_EASINGS.easeOutQuad,
    },
    buttonTap: {
      duration: ANIMATION_DURATIONS.buttonFeedback,
      easing: ANIMATION_EASINGS.easeInQuad,
    },
    tooltip: {
      duration: ANIMATION_DURATIONS.tooltipShow,
      easing: ANIMATION_EASINGS.easeOutBack,
    },
    menu: {
      duration: ANIMATION_DURATIONS.menuExpand,
      easing: ANIMATION_EASINGS.easeOutQuart,
    },
    toast: {
      enter: {
        duration: ANIMATION_DURATIONS.toastEnter,
        easing: ANIMATION_EASINGS.easeOutBack,
      },
      exit: {
        duration: ANIMATION_DURATIONS.toastExit,
        easing: ANIMATION_EASINGS.easeInQuad,
      },
    },
  },
};

// Configuration spécifique aux animations des éléments de secteur électrique
export const ELECTRICITY_ANIMATIONS = {
  connectionLine: {
    duration: 1.2,
    easing: ANIMATION_EASINGS.electricFlow,
    pathLength: {
      from: 0,
      to: 1,
    },
  },
  powerIndicator: {
    duration: 0.8,
    easing: ANIMATION_EASINGS.powerSurge,
    scale: {
      from: 0.8,
      to: 1.1,
      finalScale: 1,
    },
  },
  circuitPath: {
    duration: 2.5,
    easing: ANIMATION_EASINGS.linear,
    repeat: Infinity,
    dashOffset: {
      from: 0,
      to: -100,
    },
  },
  transformerPulse: {
    duration: 1.5,
    easing: ANIMATION_EASINGS.energyPulse,
    opacity: {
      sequence: [0.2, 1, 0.2],
    },
    scale: {
      sequence: [0.95, 1.05, 0.95],
    },
    repeat: Infinity,
    repeatDelay: 0.5,
  },
};