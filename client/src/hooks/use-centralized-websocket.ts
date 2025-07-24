/**
 * Hook centralisé pour remplacer progressivement tous les hooks de données en temps réel
 * Ce fichier sert de transition entre l'ancien système (useRealtimeData) et le nouveau (useDataSubscription)
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useDataSubscription } from '@/components/providers/websocket-provider';
import type { RealtimeDataType } from '@/components/providers/websocket-provider';

/**
 * Hook unifié pour gérer les données en temps réel de n'importe quel type
 * Utilise le WebSocketProvider centralisé pour réduire le nombre de connexions
 */
export function useCentralizedWebSocket({
  dataType,
  queryKeysToInvalidate,
  notificationTitle,
  notificationMessageFormat,
  formatData
}: {
  dataType: RealtimeDataType;
  queryKeysToInvalidate: string[];
  notificationTitle?: string;
  notificationMessageFormat?: (data: any) => string;
  formatData?: (data: any) => any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>([]);
  const [itemsCount, setItemsCount] = useState(0);
  
  // Fonction pour formater les données reçues du websocket
  const defaultFormatData = useCallback((data: any) => data, []);
  const dataFormatter = formatData || defaultFormatData;
  
  // Fonction pour formater le message de notification
  const defaultNotificationFormatter = useCallback((data: any) => 'Nouvelle mise à jour reçue', []);
  const messageFormatter = notificationMessageFormat || defaultNotificationFormatter;
  
  // Titre par défaut pour les notifications
  const defaultTitle = `Nouvelle mise à jour ${dataType}`;
  const title = notificationTitle || defaultTitle;
  
  // Callback pour traiter les nouvelles données
  const handleNewData = useCallback((data: any) => {
    // Formater les données si nécessaire
    const formattedData = dataFormatter(data);
    
    // Ajouter à la liste des éléments (limité à 10)
    setItems(prev => [formattedData, ...prev].slice(0, 10));
    setItemsCount(prev => prev + 1);
    
    // Afficher une notification
    toast({
      title: title,
      description: messageFormatter(formattedData),
      variant: 'default',
    });
  }, [dataFormatter, messageFormatter, title, toast]);
  
  // Utiliser le hook centralisé du WebSocketProvider
  const { isConnected } = useDataSubscription({
    dataType,
    queryKeysToInvalidate,
    onNewData: handleNewData
  });
  
  // Fonction pour réinitialiser le compteur
  const resetCount = useCallback(() => {
    setItemsCount(0);
  }, []);
  
  // Effacer les items lorsque la page devient visible à nouveau
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && items.length > 0) {
        setItems([]);
        resetCount();
        // Actualiser les données
        queryKeysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [items.length, queryClient, queryKeysToInvalidate, resetCount]);
  
  return {
    isConnected,
    items,
    itemsCount,
    resetItems: useCallback(() => {
      setItems([]);
      resetCount();
    }, [resetCount])
  };
}

/**
 * Hook pour les paiements - Migré vers le système centralisé
 */
export function usePaiementsRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'paiements',
    queryKeysToInvalidate: [
      'api/paiements',
      'api/paiements-count',
      'api/paiements-stats',
      'api/paiements-recent'
    ],
    notificationTitle: 'Nouveau paiement',
    notificationMessageFormat: (paiement) => {
      const montant = paiement.amount 
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(paiement.amount / 100) 
        : 'N/A';
      return `Réf: ${paiement.referenceNumber || 'N/A'} - Montant: ${montant}`;
    }
  });
  
  return {
    isConnected,
    newPaiementsCount: itemsCount,
    newPaiements: items,
    resetNewPaiements: resetItems
  };
}

/**
 * Hook pour le tableau de bord - Migré vers le système centralisé
 */
export function useDashboardRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'dashboard',
    queryKeysToInvalidate: [
      'api/dashboard/stats',
      'api/dashboard/recent-activities',
      'api/dashboard/kpis'
    ],
    notificationTitle: 'Tableau de bord actualisé',
    notificationMessageFormat: (data) => {
      const statType = data.type || 'générale';
      return `Statistiques ${statType} mises à jour`;
    }
  });
  
  return {
    isConnected,
    updatesCount: itemsCount,
    dashboardUpdates: items,
    resetUpdates: resetItems
  };
}

/**
 * Hook pour les leads - Migré vers le système centralisé
 */
export function useLeadsRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'leads',
    queryKeysToInvalidate: [
      'api/leads',
      'api/leads-count',
      'api/leads-stats'
    ],
    notificationTitle: 'Nouveau lead',
    notificationMessageFormat: (lead) => `${lead.firstName || ''} ${lead.lastName || ''} - ${lead.email || 'Email non fourni'}`
  });
  
  return {
    isConnected,
    newLeadCount: itemsCount,
    newLeads: items,
    resetNewLeads: resetItems
  };
}

/**
 * Hook pour les demandes - Migré vers le système centralisé
 */
export function useDemandesRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'demandes',
    queryKeysToInvalidate: [
      'api/demandes',
      'api/demandes-count',
      'api/demandes-stats'
    ],
    notificationTitle: 'Nouvelle demande de service',
    notificationMessageFormat: (demande) => `Réf: ${demande.referenceNumber || 'N/A'} - ${demande.status || 'Nouveau'}`
  });
  
  return {
    isConnected,
    newDemandeCount: itemsCount,
    newDemandes: items,
    resetNewDemandes: resetItems
  };
}

/**
 * Hook pour les emails - Migré vers le système centralisé
 */
export function useEmailsRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'emails',
    queryKeysToInvalidate: [
      'api/user-emails',
      'api/email-unread-count',
      'api/email-folders'
    ],
    notificationTitle: 'Nouvel email',
    notificationMessageFormat: (email) => `De: ${email.from?.[0]?.address || 'Inconnu'} - Sujet: ${email.subject || '(Sans sujet)'}`
  });
  
  return {
    isConnected,
    newEmailsCount: itemsCount,
    newEmails: items,
    resetNewEmails: resetItems
  };
}

/**
 * Hook pour les notifications - Migré vers le système centralisé
 */
export function useNotificationsRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'notifications',
    queryKeysToInvalidate: [
      'api/notifications',
      'api/notifications/unread'
    ],
    notificationTitle: 'Nouvelle notification',
    notificationMessageFormat: (notification) => notification.content || 'Nouvelle notification reçue'
  });
  
  return {
    isConnected,
    newNotificationsCount: itemsCount,
    newNotifications: items,
    resetNewNotifications: resetItems
  };
}

/**
 * Hook pour les performance - Migré vers le système centralisé
 */
export function usePerformanceRealtimeCentralized() {
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'performance',
    queryKeysToInvalidate: [
      'api/performance-metrics',
      'api/performance-reports'
    ],
    notificationTitle: 'Mise à jour des performances',
    notificationMessageFormat: (data) => `Indicateur ${data.metricName || 'inconnu'} mis à jour`
  });
  
  return {
    isConnected,
    updatesCount: itemsCount,
    metricUpdates: items,
    resetUpdates: resetItems
  };
}

/**
 * Hook pour les contacts - Migré vers le système centralisé
 */
export function useContactsRealtimeCentralized() {
  const queryClient = useQueryClient();
  const { isConnected, items, itemsCount, resetItems } = useCentralizedWebSocket({
    dataType: 'contacts',
    queryKeysToInvalidate: [
      'api/contacts',
      'api/contacts/unread-count'
    ],
    notificationTitle: 'Nouveau contact',
    notificationMessageFormat: (contact) => `Nouveau message de ${contact.name || 'Inconnu'}`,
    formatData: (contact) => {
      // Mettre à jour le compteur dans le sessionStorage pour le hook du compteur non lu
      try {
        const currentCount = sessionStorage.getItem('contacts_unread_count');
        const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
        sessionStorage.setItem('contacts_unread_count', newCount.toString());
        sessionStorage.setItem('contacts_last_check', new Date().getTime().toString());
      } catch (e) {
        // Ignorer les erreurs de stockage
      }
      return contact;
    }
  });
  
  // Actualiser le compteur lorsque l'onglet redevient actif
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && itemsCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['api/contacts/unread-count'] });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [itemsCount, queryClient]);
  
  return {
    isConnected,
    newContactCount: itemsCount,
    newContacts: items,
    resetNewContactCount: resetItems
  };
}