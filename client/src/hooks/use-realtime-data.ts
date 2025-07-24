import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Types de données pouvant être mis à jour en temps réel
 */
export type RealtimeDataType = 'contacts' | 'leads' | 'demandes' | 'paiements' | 'emails' | 'performance' | 'notifications' | 'dashboard';

/**
 * Interface pour les options du hook
 */
interface UseRealtimeDataOptions {
  // Type de données à surveiller
  dataType: RealtimeDataType;
  // Clés de requête à invalider lors d'une mise à jour
  queryKeysToInvalidate: string[];
  // Callback appelé lorsqu'une nouvelle donnée est reçue
  onNewData?: (data: any) => void;
  // Message à afficher dans la notification
  notificationTitle?: string;
  // Format du message de notification
  notificationMessageFormat?: (data: any) => string;
}

/**
 * Hook générique pour gérer les mises à jour en temps réel via WebSocket
 * Peut être utilisé pour différents types de données (contacts, leads, demandes, etc.)
 */
export function useRealtimeData(options: UseRealtimeDataOptions) {
  const {
    dataType,
    queryKeysToInvalidate,
    onNewData,
    notificationTitle = `Nouvelle donnée ${dataType}`,
    notificationMessageFormat = (data) => `Nouvelle entrée reçue`
  } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Variables pour la gestion des tentatives de reconnexion
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 secondes
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour se connecter au WebSocket
  const connect = useCallback(() => {
    try {
      // Déterminer le protocole WebSocket approprié
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      
      // Créer l'URL WebSocket
      const wsUrl = `${protocol}//${host}/ws`;
      
      // Fermer toute connexion existante avant d'en créer une nouvelle
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      // Créer une nouvelle connexion WebSocket
      ws.current = new WebSocket(wsUrl);
      
      // Configurer les événements WebSocket
      ws.current.onopen = () => {
        console.log(`Connexion WebSocket établie pour ${dataType}`);
        setIsConnected(true);
        // Indiquer que les WebSockets sont actifs pour d'autres composants
        (window as any).__WS_ACTIVE = true;
        
        // Réinitialiser le compteur de tentatives de reconnexion
        reconnectAttempts.current = 0;
        
        // Envoyer un message pour s'abonner à ce type de données
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'subscribe',
            dataType: dataType
          }));
        }
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Vérifier si c'est une notification du type que nous surveillons
          const isRelevantUpdate = 
            (data.type === `new_${dataType}` || data.type === `update_${dataType}`) &&
            data[dataType];
          
          if (isRelevantUpdate) {
            // Notification d'une nouvelle donnée
            const newData = data[dataType];
            
            // Incrémenter le compteur
            setNewItemsCount(prev => prev + 1);
            
            // Appeler le callback si fourni
            if (onNewData) {
              onNewData(newData);
            }
            
            // Afficher une notification toast
            toast({
              title: notificationTitle,
              description: notificationMessageFormat(newData),
              variant: "default",
            });
            
            // Invalider les requêtes pour forcer un rafraîchissement
            queryKeysToInvalidate.forEach(queryKey => {
              queryClient.invalidateQueries({ queryKey: [queryKey] });
            });
          }
        } catch (error) {
          console.error("Erreur lors du traitement d'un message WebSocket:", error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log(`Connexion WebSocket fermée pour ${dataType} (code: ${event.code})`);
        setIsConnected(false);
        
        // Annuler toute tentative de reconnexion précédente
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        
        // Ne pas essayer de se reconnecter si la fermeture était volontaire ou si nous avons atteint le nombre maximum de tentatives
        // Les codes 1000 (normal) et 1001 (going away) sont des fermetures normales
        if ((event.code === 1000 || event.code === 1001) || reconnectAttempts.current >= maxReconnectAttempts) {
          console.log(`Fin des tentatives de reconnexion pour ${dataType}`);
          return;
        }
        
        // Calcul du délai exponentiel avec un peu d'aléatoire
        const delay = Math.min(
          baseReconnectDelay * Math.pow(1.5, reconnectAttempts.current) + Math.random() * 1000,
          30000 // Maximum 30 secondes
        );
        
        console.log(`Tentative de reconnexion pour ${dataType} dans ${delay/1000} secondes (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        // Incrémenter le compteur de tentatives
        reconnectAttempts.current++;
        
        // Tenter de se reconnecter après un délai
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
      
      ws.current.onerror = (error) => {
        console.error(`Erreur WebSocket pour ${dataType}:`, error);
        // Ne pas changer l'état connecté ici, laissons le gestionnaire onclose s'en occuper
      };
    } catch (error) {
      console.error(`Erreur lors de l'établissement de la connexion WebSocket pour ${dataType}:`, error);
      setIsConnected(false);
      
      // Annuler toute tentative de reconnexion précédente
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }
  }, [dataType, queryKeysToInvalidate, onNewData, notificationTitle, notificationMessageFormat, queryClient, toast]);
  
  // Ping régulier pour garder la connexion active
  useEffect(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Envoyer un ping toutes les 20 secondes pour maintenir la connexion active
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        } catch (e) {
          console.error(`Erreur lors de l'envoi du ping pour ${dataType}:`, e);
        }
      }
    }, 20000);
    
    return () => clearInterval(pingInterval);
  }, [dataType, isConnected]);

  // Se connecter au WebSocket lors du montage du composant
  useEffect(() => {
    connect();
    
    // Nettoyer la connexion lors du démontage
    return () => {
      // Annuler toute tentative de reconnexion en cours
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      
      if (ws.current) {
        // Se désabonner avant de fermer
        if (ws.current.readyState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify({
              type: 'unsubscribe',
              dataType: dataType
            }));
          } catch (e) {
            console.error(`Erreur lors du désabonnement pour ${dataType}:`, e);
          }
        }
        
        ws.current.close();
        ws.current = null;
        setIsConnected(false);
      }
    };
  }, [connect, dataType]);
  
  // Fonction pour réinitialiser le compteur
  const resetCount = useCallback(() => {
    setNewItemsCount(0);
  }, []);
  
  return {
    isConnected,
    newItemsCount,
    resetCount
  };
}
