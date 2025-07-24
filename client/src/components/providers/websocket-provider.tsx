import { createContext, useContext, ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Types de données pouvant être mis à jour en temps réel
export type RealtimeDataType = 'contacts' | 'leads' | 'demandes' | 'paiements' | 'emails' | 'performance' | 'notifications' | 'dashboard' | 'clients' | 'rendez-vous';

// Interface pour le gestionnaire d'abonnement
interface Subscription {
  dataType: RealtimeDataType;
  queryKeysToInvalidate: string[];
  onNewData?: (data: any) => void;
}

// Créer un contexte pour partager l'état des WebSockets
interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (subscription: Subscription) => () => void;
  reconnect: () => void; // Fonction pour forcer une reconnexion
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Provider pour initialiser une seule connexion WebSocket partagée
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Map<string, Subscription[]>>(new Map());
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const MAX_RECONNECT_ATTEMPTS = 5; // Limiter pour éviter de surcharger le serveur
  const BASE_RECONNECT_DELAY = 3000; // 3 secondes, délai plus approprié pour les reconnexions
  const connectionInProgressRef = useRef(false); // Éviter les connexions simultanées
  
  // Fonction pour établir la connexion WebSocket
  const connect = useCallback(() => {
    // Éviter les connexions simultanées
    if (connectionInProgressRef.current) {
      console.log("WebSocket Provider: Connexion déjà en cours, ignorer cette tentative");
      return;
    }
    
    connectionInProgressRef.current = true;
    
    try {
      // Fermer toute connexion existante
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }
      
      // Vérification si nous sommes sur Replit
      const isReplit = window.location.hostname.includes('replit') || 
                      window.location.hostname.includes('repl.co');
      
      if (isReplit) {
        // Sur Replit, désactiver les WebSockets et simuler une connexion pour éviter les erreurs
        console.log("WebSocket Provider: Fonctionnalité désactivée pour Replit");
        console.log("WebSocket: Fonctionnalité désactivée pour le site public");
        console.log("WebSocket: Fonctionnalité désactivée");
        console.log("WebSocket: Simulation d'abonnement aux données de type 'notifications'");
        
        // Simuler une connexion réussie après un délai
        setTimeout(() => {
          connectionInProgressRef.current = false;
          setIsConnected(true);
        }, 500);
        
        return;
      } else {
        // Création normale de la connexion pour l'environnement de production
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        
        // Utilisation explicite de la route /ws pour le WebSocket
        const wsUrl = `${protocol}//${host}/ws`;
        
        // Récupération du token d'authentification depuis le localStorage s'il existe
        const token = localStorage.getItem('auth_token');
        
        // Ajout de paramètres d'authentification pour éviter une déconnexion immédiate
        const timestamp = Date.now();
        let secureUrl = `${wsUrl}?timestamp=${timestamp}&client=webapp`;
        
        // Ajouter le token d'authentification si disponible
        if (token) {
          secureUrl += `&token=${encodeURIComponent(token)}`;
        }
        
        // Mode de performance optimisé (moins de messages fréquents)
        secureUrl += '&mode=optimized';
        
        console.log("WebSocket Provider: Connexion à", secureUrl);
        wsRef.current = new WebSocket(secureUrl);
      }
      
      // Définir un timeout pour la connexion
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
          console.log("WebSocket Provider: Timeout de connexion, fermeture forcée");
          wsRef.current.close();
        }
      }, 5000); // 5 secondes de timeout
      
      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        connectionInProgressRef.current = false; // Réinitialiser le flag
        console.log("WebSocket Provider: Connexion centralisée établie");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // S'abonner à tous les types de données actifs
        subscriptionsRef.current.forEach((subscriptions, dataType) => {
          if (subscriptions.length > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log(`WebSocket Provider: Abonnement au type ${dataType} via le système centralisé`);
            wsRef.current.send(JSON.stringify({
              type: 'subscribe',
              dataType
            }));
          }
        });
        
        // Mettre en place un heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
        }
        
        heartbeatTimerRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            }));
          }
        }, 30000); // Ping toutes les 30 secondes
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Gérer les réponses ping/pong
          if (data.type === 'pong') {
            console.log("WebSocket Provider: Pong reçu");
            return;
          }
          
          // Traiter les notifications ou mises à jour
          if (data.type === 'notifications') {
            // Notifier tous les abonnés aux notifications
            const notificationSubscriptions = subscriptionsRef.current.get('notifications') || [];
            if (notificationSubscriptions.length > 0) {
              notificationSubscriptions.forEach(sub => {
                // Invalider les requêtes
                sub.queryKeysToInvalidate.forEach(key => {
                  queryClient.invalidateQueries({ queryKey: [key] });
                });
                
                // Appeler le callback si fourni
                if (sub.onNewData) {
                  sub.onNewData(data);
                }
              });
            }
          }
          // Gérer les mises à jour de notification spécifiques
          else if (data.type === 'NOTIFICATION_UPDATE' || data.type === 'ALL_NOTIFICATIONS_READ') {
            console.log(`WebSocket Provider: Message ${data.type} reçu`);
            
            // Notifier tous les abonnés aux notifications
            const notificationSubscriptions = subscriptionsRef.current.get('notifications') || [];
            if (notificationSubscriptions.length > 0) {
              notificationSubscriptions.forEach(sub => {
                // Invalider les requêtes
                sub.queryKeysToInvalidate.forEach(key => {
                  queryClient.invalidateQueries({ queryKey: [key] });
                });
                
                // Appeler le callback si fourni
                if (sub.onNewData) {
                  sub.onNewData(data);
                }
              });
            }
          } 
          else if (data.type.startsWith('new_') || data.type.startsWith('update_')) {
            // Extraire le type de données de l'événement
            const actionPrefix = data.type.split('_')[0]; // 'new' ou 'update'
            const dataTypeRaw = data.type.substring(actionPrefix.length + 1); // Le reste après "new_" ou "update_"
            const dataType = dataTypeRaw as RealtimeDataType;
            
            // S'assurer que nous avons des abonnements pour ce type de données
            const subscriptions = subscriptionsRef.current.get(dataType) || [];
            if (subscriptions.length === 0) return;
            
            // Extraire les données spécifiques
            const dataKey = dataType === 'demandes' ? 'demande' : 
                          dataType === 'paiements' ? 'paiement' : 
                          dataType.slice(0, -1); // Ex: 'leads' -> 'lead'
            
            const entityData = data[dataKey];
            
            // Notifier tous les abonnés
            subscriptions.forEach(sub => {
              // Invalider les requêtes
              sub.queryKeysToInvalidate.forEach(key => {
                queryClient.invalidateQueries({ queryKey: [key] });
              });
              
              // Appeler le callback si fourni
              if (sub.onNewData) {
                sub.onNewData(entityData);
              }
            });
          }
        } catch (error) {
          console.error("WebSocket Provider: Erreur lors du traitement du message", error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log(`WebSocket Provider: Connexion fermée (code: ${event.code})`);
        setIsConnected(false);
        
        // Nettoyer les timers
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        
        // Vérifier si nous devons nous reconnecter
        const hasSubscriptions = Array.from(subscriptionsRef.current.values()).some(subs => subs.length > 0);
        
        if (hasSubscriptions && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          // Calculer le délai avec backoff exponentiel
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current) + Math.random() * 1000,
            60000 // Max 1 minute
          );
          
          console.log(`WebSocket Provider: Tentative de reconnexion dans ${delay/1000}s (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectAttemptsRef.current++;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.log("WebSocket Provider: Nombre maximum de tentatives de reconnexion atteint");
          toast({
            title: "Problème de connexion en temps réel",
            description: "Nous rencontrons des difficultés à maintenir une connexion en temps réel. Rechargez la page pour réessayer.",
            variant: "destructive",
          });
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error("WebSocket Provider: Erreur de connexion", error);
        // onclose sera appelé après
      };
    } catch (error) {
      console.error("WebSocket Provider: Erreur lors de la création de la connexion", error);
      setIsConnected(false);
    }
  }, [queryClient, toast]);
  
  // Fonction pour s'abonner à un type de données
  const subscribe = useCallback((subscription: Subscription) => {
    const { dataType } = subscription;
    
    // Ajouter l'abonnement
    const currentSubscriptions = subscriptionsRef.current.get(dataType) || [];
    currentSubscriptions.push(subscription);
    subscriptionsRef.current.set(dataType, currentSubscriptions);
    
    // S'abonner au websocket si c'est le premier abonnement pour ce type
    if (currentSubscriptions.length === 1 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        dataType
      }));
    }
    
    // Se connecter si pas encore fait
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED || wsRef.current.readyState === WebSocket.CLOSING) {
      connect();
    }
    
    // Retourner une fonction de nettoyage
    return () => {
      // Supprimer l'abonnement
      const subs = subscriptionsRef.current.get(dataType) || [];
      const newSubs = subs.filter(s => s !== subscription);
      
      if (newSubs.length === 0) {
        // Se désabonner si c'était le dernier abonnement pour ce type
        subscriptionsRef.current.delete(dataType);
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'unsubscribe',
            dataType
          }));
        }
        
        // Si plus aucun abonnement, fermer la connexion
        const hasAnySubscriptions = Array.from(subscriptionsRef.current.values()).some(s => s.length > 0);
        if (!hasAnySubscriptions && wsRef.current) {
          wsRef.current.close();
        }
      } else {
        subscriptionsRef.current.set(dataType, newSubs);
      }
    };
  }, [connect]);
  
  // Établir la connexion au montage si nécessaire
  useEffect(() => {
    // Ne pas se connecter immédiatement - les composants s'abonneront
    
    // Nettoyage
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Fonction pour forcer une reconnexion manuelle
  const reconnect = useCallback(() => {
    console.log("WebSocket Provider: Reconnexion manuelle initiée");
    
    // Réinitialiser les compteurs de tentatives pour permettre une nouvelle série complète
    reconnectAttemptsRef.current = 0;
    
    // Annuler toute tentative de reconnexion auto programmée
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    // Fermer la connexion existante si nécessaire et établir une nouvelle connexion
    connect();
    
    return true;
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook pour accéder au contexte WebSocket
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext doit être utilisé à l'intérieur d'un WebSocketProvider");
  }
  return context;
}

// Hook facile à utiliser pour surveiller un type spécifique de données en temps réel
export function useDataSubscription({
  dataType,
  queryKeysToInvalidate,
  onNewData,
}: {
  dataType: RealtimeDataType;
  queryKeysToInvalidate: string[];
  onNewData?: (data: any) => void;
}) {
  const { isConnected, subscribe, reconnect } = useWebSocketContext();
  
  useEffect(() => {
    // S'abonner aux données en temps réel
    const unsubscribe = subscribe({
      dataType,
      queryKeysToInvalidate,
      onNewData,
    });
    
    // Nettoyer l'abonnement
    return unsubscribe;
  }, [dataType, subscribe, ...queryKeysToInvalidate]);
  
  return { isConnected, reconnect };
}