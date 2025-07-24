import { useState, useEffect, useCallback } from 'react';

interface WebSocketHookResult {
  socket: WebSocket | null;
  connected: boolean;
  error: Error | null;
  send: (data: any) => void;
  lastMessage: any;
}

export function useWebSocket(url: string): WebSocketHookResult {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Établir la connexion WebSocket avec reconnexion automatique
  useEffect(() => {
    console.log(`Connecting to WebSocket at ${url}`);
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let isUnmounting = false;
    
    // Fonction de connexion
    const connect = () => {
      try {
        // Nettoyer une ancienne connexion si elle existe
        if (ws) {
          try {
            ws.close();
          } catch (e) {
            console.warn('Erreur lors de la fermeture du WebSocket:', e);
          }
        }
        
        // Créer une nouvelle connexion
        ws = new WebSocket(url);
        
        ws.onopen = () => {
          console.log('WebSocket connected successfully');
          setConnected(true);
          setError(null);
          
          // Annuler toute tentative de reconnexion en cours
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
            setLastMessage(event.data);
          }
        };
        
        ws.onclose = (event) => {
          console.log(`WebSocket disconnected: code ${event.code}, reason: ${event.reason}`);
          setConnected(false);
          
          // Ne pas reconneter si on est en train de démonter le composant
          if (!isUnmounting) {
            console.log('Attempting to reconnect in 3 seconds...');
            // Tenter de se reconnecter après un délai
            reconnectTimer = setTimeout(connect, 3000);
          }
        };
        
        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError(new Error('WebSocket connection error'));
          setConnected(false);
        };
        
        setSocket(ws);
      } catch (error) {
        console.error('Error establishing WebSocket connection:', error);
        setError(new Error(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`));
        
        // Tenter de se reconnecter après un délai
        if (!isUnmounting) {
          console.log('Attempting to reconnect in 5 seconds...');
          reconnectTimer = setTimeout(connect, 5000);
        }
      }
    };
    
    // Lancer la connexion initiale
    connect();
    
    // Nettoyage lors du démontage
    return () => {
      isUnmounting = true;
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      if (ws) {
        // Indiquer que la fermeture est intentionnelle
        ws.onclose = null;
        
        try {
          ws.close();
        } catch (e) {
          console.warn('Erreur lors de la fermeture du WebSocket:', e);
        }
      }
    };
  }, [url]);
  
  // Fonction pour envoyer des messages
  const send = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      socket.send(message);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, [socket]);
  
  return { socket, connected, error, send, lastMessage };
}

// Hook pour les notifications spécifiquement
export interface Notification {
  id: string;
  type: 'payment' | 'lead' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
}

interface NotificationHookResult {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loading: boolean;
}

export function useNotifications(): NotificationHookResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Établir la connexion WebSocket
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  const { connected, send, lastMessage } = useWebSocket(wsUrl);
  
  // Mettre à jour les notifications à partir des messages WebSocket
  useEffect(() => {
    if (!lastMessage) return;
    
    if (lastMessage.type === 'notifications') {
      setNotifications(lastMessage.notifications);
      setUnreadCount(lastMessage.unreadCount);
      setLoading(false);
    }
  }, [lastMessage]);
  
  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    send({ type: 'markAsRead', id });
    
    // Mettre également à jour l'état local pour une réponse immédiate
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [send]);
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    send({ type: 'markAllAsRead' });
    
    // Mettre également à jour l'état local
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
  }, [send]);
  
  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    loading: !connected || loading
  };
}