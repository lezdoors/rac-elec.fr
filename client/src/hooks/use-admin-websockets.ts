/**
 * Hook central pour initialiser et coordonner tous les hooks WebSocket de l'interface admin
 * Ce hook s'assure que tous les hooks WebSocket sont correctement initialisés et synchronisés
 * 
 * Mise à jour : Nous utilisons maintenant le WebSocketProvider centralisé pour réduire
 * le nombre de connexions WebSocket simultanées et améliorer la stabilité de l'application
 */

import { useEffect } from 'react';
import { useContactsWebSocket } from './use-contacts-websocket';
import { useLeadsRealtime } from './use-leads-realtime'; 
import { useDemandesRealtime } from './use-demandes-realtime';
import { usePaiementsRealtime } from './use-paiements-realtime';
import { useEmailsRealtime } from './use-emails-realtime';
import { useDashboardRealtime } from './use-dashboard-realtime';
import { usePerformanceRealtime } from './use-performance-realtime';
import { useNotificationsRealtime } from './use-notifications-realtime';
import { useAuth } from './use-auth';
import { useWebSocketContext } from '@/components/providers/websocket-provider';

// Déclaration pour étendre l'interface Window
declare global {
  interface Window {
    __WS_STATUS?: Record<string, boolean>;
  }
}

/**
 * Ce hook sert à initialiser tous les hooks WebSocket nécessaires pour l'admin
 * Il garantit que toutes les connexions sont établies une seule fois
 * et coordonne les éventuelles dépendances entre les différents flux de données
 */
export function useAdminWebSockets() {
  // Récupérer les informations d'authentification de l'utilisateur
  const { user } = useAuth();
  
  // Obtenir l'état de la connexion WebSocket centralisée
  const { isConnected: isCentralConnected } = useWebSocketContext();
  
  // Initialiser tous les hooks WebSocket individuels
  const contactsWS = useContactsWebSocket();
  const leadsRealtime = useLeadsRealtime();
  const demandesRealtime = useDemandesRealtime();
  const paiementsRealtime = usePaiementsRealtime();
  const emailsRealtime = useEmailsRealtime();
  const dashboardRealtime = useDashboardRealtime();
  const performanceRealtime = usePerformanceRealtime();
  const notificationsRealtime = useNotificationsRealtime();
  
  // Variable globale pour suivre l'état de la connexion WebSocket
  useEffect(() => {
    // Exposer l'état de la connexion WebSocket pour le débogage
    console.log('Hooks WebSocket initialisés');
    
    // Fonction pour exposer l'état des connexions WebSocket
    const exposeWebSocketStatus = () => {
      const wsStatus = {
        contacts: contactsWS.isConnected,
        leads: leadsRealtime.isConnected,
        demandes: demandesRealtime.isConnected,
        paiements: paiementsRealtime.isConnected,
        emails: emailsRealtime.isConnected,
        dashboard: dashboardRealtime.isConnected,
        performance: performanceRealtime.isConnected,
        notifications: notificationsRealtime.isConnected,
        clients: contactsWS.isConnected,
        'rendez-vous': demandesRealtime.isConnected
      };
      
      window.__WS_STATUS = wsStatus;
      console.log('État des connexions WebSocket:', wsStatus);
    };
    
    // Exposer l'état des connexions toutes les 30 secondes pour le débogage
    const intervalId = setInterval(exposeWebSocketStatus, 30000);
    
    // Nettoyer l'intervalle à la fermeture
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Vérifier si l'utilisateur a les permissions nécessaires pour chaque type de données
  const hasPermission = (page: string) => {
    if (!user || !user.permissions) return false;
    
    const permission = user.permissions.find((p: { page: string, canView: boolean }) => p.page === page);
    return permission ? permission.canView : false;
  };
  
  return {
    // État global de la connexion WebSocket - maintenant inclut aussi le provider centralisé
    isConnected: isCentralConnected || contactsWS.isConnected || leadsRealtime.isConnected || 
                 demandesRealtime.isConnected || paiementsRealtime.isConnected || emailsRealtime.isConnected || 
                 dashboardRealtime.isConnected || performanceRealtime.isConnected || notificationsRealtime.isConnected,
    
    // Export des hooks individuels pour un accès facile
    contacts: hasPermission('clients') ? contactsWS : null,
    leads: hasPermission('leads') ? leadsRealtime : null,
    demandes: hasPermission('demandes') ? demandesRealtime : null,
    paiements: hasPermission('paiements') ? paiementsRealtime : null,
    emails: hasPermission('emails') ? emailsRealtime : null,
    dashboard: hasPermission('dashboard') ? dashboardRealtime : null,
    performance: hasPermission('settings') ? performanceRealtime : null,
    notifications: hasPermission('notifications') ? notificationsRealtime : null,
    
    // Nouvelles propriétés pour les nouveaux types (utilisant les hooks existants)
    clients: hasPermission('clients') ? contactsWS : null,
    'rendez-vous': hasPermission('rendez-vous') ? demandesRealtime : null,
    
    // Agrégation des compteurs non lus
    unreadCounts: {
      contacts: contactsWS.newContactCount || 0,
      emails: emailsRealtime.newEmailsCount || 0,
      notifications: notificationsRealtime.newNotificationsCount || 0
    }
  };
}
