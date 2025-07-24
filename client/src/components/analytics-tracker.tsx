import { useEffect, useCallback, useRef } from "react";

// Interface pour les événements d'analyse
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Interface pour les données utilisateur
interface UserData {
  user_id?: string;
  session_id: string;
  page_title: string;
  page_location: string;
  engagement_time?: number;
}

// Hook principal pour le suivi analytique
export const useAnalytics = () => {
  const sessionStartTime = useRef<number>(Date.now());
  const lastInteractionTime = useRef<number>(Date.now());
  const pageViewSent = useRef<boolean>(false);

  // Générer un ID de session unique
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Envoyer un événement à Google Analytics
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      const sessionId = getSessionId();
      
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        session_id: sessionId,
        ...event.custom_parameters
      });

      // Log en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event);
      }
    }
  }, [getSessionId]);

  // Suivre les vues de page
  const trackPageView = useCallback((path?: string) => {
    if (pageViewSent.current) return;
    
    if (typeof window !== 'undefined' && window.gtag) {
      const sessionId = getSessionId();
      
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
        session_id: sessionId,
        custom_map: {
          custom_parameter_1: 'raccordement_type',
          custom_parameter_2: 'user_journey_stage'
        }
      });

      pageViewSent.current = true;
    }
  }, [getSessionId]);

  // Suivre l'engagement utilisateur
  const trackEngagement = useCallback(() => {
    const engagementTime = Date.now() - sessionStartTime.current;
    
    trackEvent({
      action: 'user_engagement',
      category: 'engagement',
      value: Math.floor(engagementTime / 1000),
      custom_parameters: {
        engagement_time_msec: engagementTime,
        session_duration: Math.floor(engagementTime / 1000)
      }
    });
  }, [trackEvent]);

  // Suivre les interactions avec les formulaires
  const trackFormInteraction = useCallback((formName: string, fieldName: string, action: 'focus' | 'blur' | 'change') => {
    trackEvent({
      action: 'form_interaction',
      category: 'form',
      label: `${formName}_${fieldName}_${action}`,
      custom_parameters: {
        form_name: formName,
        field_name: fieldName,
        interaction_type: action
      }
    });
  }, [trackEvent]);

  // Suivre les conversions
  const trackConversion = useCallback((conversionType: string, value?: number, currency = 'EUR') => {
    trackEvent({
      action: 'conversion',
      category: 'ecommerce',
      label: conversionType,
      value,
      custom_parameters: {
        currency,
        conversion_type: conversionType,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackEngagement,
    trackFormInteraction,
    trackConversion,
    getSessionId
  };
};

// Hook pour suivre automatiquement les interactions
export const useAutoTracking = () => {
  const { trackEvent, trackPageView, trackEngagement } = useAnalytics();
  const interactionTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Suivre la vue de page au chargement
    trackPageView();

    // Suivre les clics sur les liens externes
    const handleExternalLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href && target.href.startsWith('http')) {
        const isExternal = !target.href.includes(window.location.hostname);
        if (isExternal) {
          trackEvent({
            action: 'click_external_link',
            category: 'navigation',
            label: target.href
          });
        }
      }
    };

    // Suivre les téléchargements
    const handleDownloadClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href) {
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip'];
        const isDownload = downloadExtensions.some(ext => target.href.toLowerCase().includes(ext));
        if (isDownload) {
          trackEvent({
            action: 'download',
            category: 'content',
            label: target.href
          });
        }
      }
    };

    // Suivre l'engagement utilisateur
    const handleUserInteraction = () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      
      interactionTimeoutRef.current = setTimeout(() => {
        trackEngagement();
      }, 30000); // Envoyer après 30 secondes d'inactivité
    };

    // Suivre le défilement
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      // Suivre les jalons de défilement
      const milestones = [25, 50, 75, 90];
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !sessionStorage.getItem(`scroll_${milestone}`)) {
          sessionStorage.setItem(`scroll_${milestone}`, 'true');
          trackEvent({
            action: 'scroll_depth',
            category: 'engagement',
            label: `${milestone}%`,
            value: milestone
          });
        }
      });
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('click', handleExternalLinkClick);
    document.addEventListener('click', handleDownloadClick);
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Suivre l'engagement avant la fermeture de la page
    const handleBeforeUnload = () => {
      trackEngagement();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleExternalLinkClick);
      document.removeEventListener('click', handleDownloadClick);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [trackEvent, trackPageView, trackEngagement]);
};

// Composant pour suivre les vues de section
export const SectionTracker = ({ 
  sectionName, 
  children 
}: { 
  sectionName: string; 
  children: React.ReactNode; 
}) => {
  const { trackEvent } = useAnalytics();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trackEvent({
              action: 'section_view',
              category: 'content',
              label: sectionName,
              custom_parameters: {
                section_name: sectionName,
                viewport_percentage: Math.round(entry.intersectionRatio * 100)
              }
            });
          }
        });
      },
      { threshold: 0.5 } // Déclencher quand 50% de la section est visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [sectionName, trackEvent]);

  return (
    <div ref={sectionRef} data-section={sectionName}>
      {children}
    </div>
  );
};

// Hook pour suivre les performances de formulaire
export const useFormAnalytics = (formName: string) => {
  const { trackEvent, trackFormInteraction } = useAnalytics();
  const formStartTime = useRef<number>();
  const fieldInteractions = useRef<Record<string, number>>({});

  const onFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    trackEvent({
      action: 'form_start',
      category: 'form',
      label: formName
    });
  }, [formName, trackEvent]);

  const onFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    const completionTime = formStartTime.current 
      ? Date.now() - formStartTime.current 
      : undefined;

    trackEvent({
      action: success ? 'form_submit_success' : 'form_submit_error',
      category: 'form',
      label: formName,
      value: completionTime ? Math.floor(completionTime / 1000) : undefined,
      custom_parameters: {
        completion_time_ms: completionTime,
        field_interactions: Object.keys(fieldInteractions.current).length,
        errors: errors?.join(', ')
      }
    });
  }, [formName, trackEvent]);

  const onFieldFocus = useCallback((fieldName: string) => {
    fieldInteractions.current[fieldName] = (fieldInteractions.current[fieldName] || 0) + 1;
    trackFormInteraction(formName, fieldName, 'focus');
  }, [formName, trackFormInteraction]);

  const onFieldBlur = useCallback((fieldName: string) => {
    trackFormInteraction(formName, fieldName, 'blur');
  }, [formName, trackFormInteraction]);

  const onFieldChange = useCallback((fieldName: string) => {
    trackFormInteraction(formName, fieldName, 'change');
  }, [formName, trackFormInteraction]);

  return {
    onFormStart,
    onFormSubmit,
    onFieldFocus,
    onFieldBlur,
    onFieldChange
  };
};