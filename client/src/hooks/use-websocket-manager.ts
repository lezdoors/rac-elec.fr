import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Types de données pouvant être mis à jour en temps réel
export type RealtimeDataType = 'contacts' | 'leads' | 'demandes' | 'paiements' | 'emails' | 'performance' | 'notifications' | 'dashboard' | 'clients' | 'rendez-vous';

// Interface pour le gestionnaire de mises à jour
interface UpdateHandler {
  dataType: RealtimeDataType;
  queryKeysToInvalidate: string[];
  onNewData?: (data: any) => void;
}

/**
 * Gestionnaire centralisé pour les connexions WebSocket
 * Ce hook crée une seule connexion WebSocket et gère les abonnements/désabonnements pour différents types de données
 */
export function useWebSocketManager() {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const pingTimer = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Stocker les gestionnaires d'événements pour chaque type de données
  const handlers = useRef<Record<RealtimeDataType, UpdateHandler[]>>({
    contacts: [],
    leads: [],
    demandes: [],
    paiements: [],
    emails: [],
    performance: [],
    notifications: [],
    dashboard: [],
    clients: [],
    'rendez-vous': []
  });
  
  // Gestionnaire de reconnexion
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 secondes
  
  // Fonction pour établir une connexion WebSocket
  const connect = useCallback(() => {
    try {
      // Fermer toute connexion existante
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      // Créer une nouvelle connexion
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      ws.current = new WebSocket(wsUrl);
      
      // Configuration des événements
      ws.current.onopen = () => {
        console.log("WebSocket Manager: Connexion établie");
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Envoyer les abonnements actifs
        Object.entries(handlers.current).forEach(([dataType, handlerList]) => {
          if (handlerList.length > 0 && ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
              type: 'subscribe',
              dataType
            }));
          }
        });
        
        // Démarrer le ping périodique
        if (pingTimer.current) {
          clearInterval(pingTimer.current);
        }
        
        pingTimer.current = setInterval(() => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            }));
          }
        }, 30000); // Ping toutes les 30 secondes
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Gérer les pings/pongs
          if (data.type === 'pong') {
            console.log("WebSocket Manager: Pong reçu");
            return;
          }
          
          // Déterminer le type de données et l'action
          let dataType: RealtimeDataType | null = null;
          let actionData: any = null;
          
          if (data.type === 'notifications') {
            dataType = 'notifications';
            actionData = data;
          } else if (data.type.startsWith('new_') || data.type.startsWith('update_')) {
            const actionPrefix = data.type.split('_')[0];
            const dataTypeStr = data.type.substring(actionPrefix.length + 1);
            
            if (Object.keys(handlers.current).includes(dataTypeStr)) {
              dataType = dataTypeStr as RealtimeDataType;
              
              // Extraire les données spécifiques
              const dataKey = dataTypeStr === 'demandes' ? 'demande' : 
                            dataTypeStr === 'paiements' ? 'paiement' : 
                            dataTypeStr.slice(0, -1);
              
              actionData = data[dataKey];
            }
          }
          
          // Si un type de données a été identifié, traiter les gestionnaires correspondants
          if (dataType && actionData) {
            handlers.current[dataType].forEach(handler => {
              // Appeler le callback de nouvelle donnée si fourni
              if (handler.onNewData) {
                handler.onNewData(actionData);
              }
              
              // Invalider les requêtes pour forcer un rafraîchissement
              handler.queryKeysToInvalidate.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
              });
            });
          }
        } catch (error) {
          console.error("WebSocket Manager: Erreur lors du traitement du message", error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log(`WebSocket Manager: Connexion fermée (code: ${event.code})`);
        setIsConnected(false);
        
        // Nettoyer les timers
        if (pingTimer.current) {
          clearInterval(pingTimer.current);
          pingTimer.current = null;
        }
        
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
        
        // Tenter de se reconnecter si la connexion n'a pas été fermée volontairement
        if ((event.code !== 1000 && event.code !== 1001) && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(1.5, reconnectAttempts.current) + Math.random() * 1000,
            30000
          );
          
          console.log(`WebSocket Manager: Tentative de reconnexion dans ${delay/1000}s (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectAttempts.current++;
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error("WebSocket Manager: Erreur", error);
        // Ne pas changer l'état, onclose sera appelé après
      };
    } catch (error) {
      console.error("WebSocket Manager: Erreur lors de la création de la connexion", error);
      setIsConnected(false);
    }
  }, [queryClient, toast]);
  
  // Fonction pour s'abonner à un type de données
  const subscribe = useCallback((handler: UpdateHandler) => {
    const { dataType } = handler;
    
    // Ajouter le gestionnaire à la liste
    handlers.current[dataType] = [...handlers.current[dataType], handler];
    
    // Si c'est le premier gestionnaire pour ce type, s'abonner
    if (handlers.current[dataType].length === 1 && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        dataType
      }));
    }
    
    // Si la connexion n'est pas encore établie, la démarrer
    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      connect();
    }
    
    // Fonction pour se désabonner
    return () => {
      // Retirer le gestionnaire de la liste
      handlers.current[dataType] = handlers.current[dataType].filter(h => h !== handler);
      
      // Si c'était le dernier gestionnaire pour ce type, se désabonner
      if (handlers.current[dataType].length === 0 && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'unsubscribe',
          dataType
        }));
      }
    };
  }, [connect]);
  
  // Établir la connexion au montage
  useEffect(() => {
    connect();
    
    // Nettoyage à la fermeture
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      
      if (pingTimer.current) {
        clearInterval(pingTimer.current);
      }
      
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);
  
  return {
    isConnected,
    subscribe
  };
}

// Instance singleton pour partager le gestionnaire dans toute l'application
let globalWebSocketManager: ReturnType<typeof useWebSocketManager> | null = null;

/**
 * Hook pour utiliser le gestionnaire WebSocket globalement
 */
export function useGlobalWebSocketManager() {
  const manager = useWebSocketManager();
  
  useEffect(() => {
    globalWebSocketManager = manager;
    
    return () => {
      globalWebSocketManager = null;
    };
  }, [manager]);
  
  return manager;
}

/**
 * Hook pour s'abonner à un type de données via le gestionnaire global
 */
export function useRealtimeData(handler: UpdateHandler) {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!globalWebSocketManager) {
      console.error("WebSocket Manager n'est pas initialisé. Assurez-vous d'utiliser useGlobalWebSocketManager dans un composant parent.");
      return;
    }
    
    // S'abonner et récupérer la fonction de désabonnement
    const unsubscribe = globalWebSocketManager.subscribe(handler);
    
    // Mettre à jour l'état de connexion quand le gestionnaire global change
    const updateConnectionStatus = () => {
      setIsConnected(globalWebSocketManager?.isConnected || false);
    };
    
    // Observer l'état de connexion initial
    updateConnectionStatus();
    
    // Définir un intervalle pour vérifier périodiquement l'état de la connexion
    // Optimisé: 30 secondes au lieu de 1 seconde (économise compute units)
    const checkInterval = setInterval(updateConnectionStatus, 30000);
    
    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [handler]);
  
  return {
    isConnected,
  };
}