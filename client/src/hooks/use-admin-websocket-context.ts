import { useState, useEffect } from 'react';
import { useWebSocketContext } from '@/components/providers/websocket-provider';
import { useDataSubscription } from '@/components/providers/websocket-provider';

// Interface pour les données attendues par les composants qui utilisent ce hook
export interface AdminWebSocketContextType {
  // État de la connexion WebSocket par type de données
  leads?: { isConnected: boolean };
  demandes?: { isConnected: boolean };
  paiements?: { isConnected: boolean };
  emails?: { isConnected: boolean };
  dashboard?: { isConnected: boolean };
  performance?: { isConnected: boolean };
  notifications?: { 
    isConnected: boolean;
    allNotifications?: any[]; // Toutes les notifications (lues et non lues)
    newNotifications?: any[]; // Seulement les nouvelles notifications
    resetNewNotifications?: () => void;
    markAsRead?: (id: string) => void;
  };
  contacts?: { isConnected: boolean };
  
  // Compteurs d'éléments non lus
  unreadCounts?: {
    emails: number;
    notifications: number;
  }
}

/**
 * Hook de compatibilité pour migrer progressivement les composants 
 * du système legacy de WebSockets vers le nouveau système centralisé
 */
export function useAdminWebSocketContext(): AdminWebSocketContextType {
  const { isConnected: globalIsConnected } = useWebSocketContext();
  const [unreadCounts, setUnreadCounts] = useState<{ emails: number; notifications: number }>({
    emails: 0,
    notifications: 0
  });
  
  // État pour stocker les notifications
  const [newNotifications, setNewNotifications] = useState<any[]>([]);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  
  // S'abonner aux notifications
  const { isConnected: notificationsConnected } = useDataSubscription({
    dataType: 'notifications',
    queryKeysToInvalidate: ['/api/notifications/unread', '/api/notifications'],
    onNewData: (data) => {
      if (data && data.notification) {
        // Ajouter aux nouvelles notifications
        setNewNotifications(prev => [data.notification, ...prev]);
        
        // Ajouter également à toutes les notifications
        setAllNotifications(prev => [data.notification, ...prev]);
        
        // Mettre à jour le compteur
        setUnreadCounts(prev => ({
          ...prev,
          notifications: prev.notifications + 1
        }));
      }
    }
  });
  
  // S'abonner aux emails
  const { isConnected: emailsConnected } = useDataSubscription({
    dataType: 'emails',
    queryKeysToInvalidate: ['/api/email-unread-count'],
    onNewData: (data) => {
      if (data && typeof data.count === 'number') {
        setUnreadCounts(prev => ({
          ...prev,
          emails: data.count
        }));
      }
    }
  });
  
  // S'abonner aux autres types de données sans traitement spécifique
  const { isConnected: leadsConnected } = useDataSubscription({
    dataType: 'leads',
    queryKeysToInvalidate: ['/api/leads']
  });
  
  const { isConnected: demandesConnected } = useDataSubscription({
    dataType: 'demandes',
    queryKeysToInvalidate: ['/api/service-requests']
  });
  
  const { isConnected: paiementsConnected } = useDataSubscription({
    dataType: 'paiements',
    queryKeysToInvalidate: ['/api/payments']
  });
  
  const { isConnected: dashboardConnected } = useDataSubscription({
    dataType: 'dashboard',
    queryKeysToInvalidate: ['/api/dashboard']
  });
  
  const { isConnected: performanceConnected } = useDataSubscription({
    dataType: 'performance',
    queryKeysToInvalidate: ['/api/performance-metrics']
  });
  
  const { isConnected: contactsConnected } = useDataSubscription({
    dataType: 'contacts',
    queryKeysToInvalidate: ['/api/contacts']
  });
  
  // Fonction pour réinitialiser les nouvelles notifications
  const resetNewNotifications = () => {
    setNewNotifications([]);
    setUnreadCounts(prev => ({
      ...prev,
      notifications: 0
    }));
  };
  
  // Effet pour initialiser les compteurs au montage du composant
  useEffect(() => {
    // Charger le nombre d'emails non lus - avec gestion améliorée des erreurs
    fetch('/api/email-unread-count', { 
      credentials: 'same-origin',  // Inclure les cookies d'authentification
      headers: { 'Accept': 'application/json' } // S'assurer qu'on demande du JSON
    })
      .then(res => {
        if (!res.ok) {
          // Si l'erreur est 401, on l'ignore silencieusement (utilisateur non authentifié)
          if (res.status === 401) {
            throw new Error('not_authenticated');
          }
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        
        // Vérifier que c'est bien du JSON avant de parser
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('response_not_json');
        }
      })
      .then(data => {
        if (data && typeof data.count === 'number') {
          setUnreadCounts(prev => ({
            ...prev,
            emails: data.count
          }));
        }
      })
      .catch(err => {
        // Gérer silencieusement les erreurs d'authentification attendues
        if (err.message === 'not_authenticated' || err.message === 'response_not_json') {
          console.warn(`Emails: ${err.message}`);
          return;
        }
        
        // Réduire la verbosité des logs - utiliser warn au lieu d'error pour les erreurs attendues
        console.warn("Erreur lors du rafraîchissement du compteur d'emails:", err.message || "Erreur inconnue");
      });
    
    // Charger le nombre de notifications non lues - avec gestion améliorée des erreurs
    fetch('/api/notifications/unread', { 
      credentials: 'same-origin',  // Inclure les cookies d'authentification
      headers: { 'Accept': 'application/json' } // S'assurer qu'on demande du JSON
    })
      .then(res => {
        if (!res.ok) {
          // Si l'erreur est 401, on l'ignore silencieusement (utilisateur non authentifié)
          if (res.status === 401) {
            throw new Error('not_authenticated');
          }
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        
        // Vérifier que c'est bien du JSON avant de parser
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('response_not_json');
        }
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setUnreadCounts(prev => ({
            ...prev,
            notifications: data.length
          }));
        }
      })
      .catch(err => {
        // Gérer silencieusement les erreurs d'authentification attendues
        if (err.message === 'not_authenticated' || err.message === 'response_not_json') {
          console.warn(`Notifications: ${err.message}`);
          return;
        }
        
        // Réduire la verbosité des logs - utiliser warn au lieu d'error
        console.warn("Erreur lors du rafraîchissement du compteur de notifications:", err.message || "Erreur inconnue");
      });
  }, []);
  
  // Fonction pour marquer une notification comme lue
  const markAsRead = (id: string) => {
    console.log(`Marquage de la notification ${id} comme lue - début de l'opération`);
    
    // Mettre à jour l'état local immédiatement pour une expérience fluide
    setNewNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Marquer comme lu dans les notifications complètes
    setAllNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Mettre à jour le compteur
    setUnreadCounts(prev => ({
      ...prev,
      notifications: Math.max(0, prev.notifications - 1)
    }));
    
    console.log(`Envoi de la requête API pour marquer la notification ${id} comme lue`);
    
    // Appeler l'API pour persister le changement avec gestion avancée des erreurs
    fetch(`/api/notifications/${id}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin' // Inclure les cookies d'authentification
    })
    .then(res => {
      console.log(`Réponse de l'API pour marquer la notification ${id} comme lue: status=${res.status}`);
      if (!res.ok && res.status !== 401) {
        // On ignore les 401 car il est possible que l'utilisateur n'ait pas les permissions
        // mais on loggue les autres erreurs
        console.warn(`Erreur HTTP ${res.status} lors du marquage de notification comme lue`);
      } else if (res.ok) {
        console.log(`Notification ${id} marquée comme lue avec succès`);
      }
    })
    .catch(err => {
      // Erreur silencieuse - ne pas perturber l'utilisateur avec des erreurs techniques
      console.error("Erreur lors du marquage de la notification:", err.message || "Erreur inconnue");
    });
  };
  
  // Charger toutes les notifications au montage, mais seulement si on est connecté et autorisé
  // Pour éviter les erreurs 401, on utilise l'API /notifications/unread qui est accessible sans authentification
  useEffect(() => {
    // On récupère les notifications non lues à partir d'une API publique
    fetch('/api/notifications/unread', { 
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        if (!res.ok) {
          // Si l'erreur est 401, on l'ignore silencieusement (utilisateur non authentifié)
          if (res.status === 401) {
            throw new Error('not_authenticated');
          }
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        
        // Vérifier que c'est bien du JSON avant de parser
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('response_not_json');
        }
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          // Les mettre avec la propriété read à false
          const formattedNotifications = data.map((notif: any) => ({
            ...notif,
            read: false
          }));
          setAllNotifications(formattedNotifications);
        }
      })
      .catch(err => {
        // Gérer silencieusement les erreurs d'authentification attendues
        if (err.message === 'not_authenticated' || err.message === 'response_not_json') {
          console.warn(`Chargement notifications: ${err.message}`);
          // Définir un état initial vide
          setAllNotifications([]);
          return;
        }
        
        // Réduire la verbosité des logs - utiliser warn au lieu d'error
        console.warn("Erreur lors du chargement des notifications:", err.message || "Erreur inconnue");
        setAllNotifications([]);
      });
  }, []);

  return {
    leads: { isConnected: leadsConnected },
    demandes: { isConnected: demandesConnected },
    paiements: { isConnected: paiementsConnected },
    emails: { isConnected: emailsConnected },
    dashboard: { isConnected: dashboardConnected },
    performance: { isConnected: performanceConnected },
    notifications: { 
      isConnected: notificationsConnected,
      allNotifications,
      newNotifications,
      resetNewNotifications,
      markAsRead
    },
    contacts: { isConnected: contactsConnected },
    unreadCounts
  };
}