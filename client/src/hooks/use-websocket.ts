import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Types pour les notifications
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  targetUrl?: string;
}

// Type pour la réponse de l'API
export interface NotificationsResponse {
  notifications: Notification[];
}

/**
 * Hook pour gérer les connections WebSocket et les notifications en temps réel
 * Inclut un système de secours qui fonctionne même si les WebSockets ne sont pas disponibles
 */
export function useNotifications() {
  // États pour stocker les notifications - utilisation minimale pour les affichages simples
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Référence pour la connexion WebSocket
  const ws = useRef<WebSocket | null>(null);
  
  // Référence pour suivre si les données initiales ont été chargées
  const dataLoaded = useRef<boolean>(false);
  
  // Utiliser React Query pour charger les notifications initiales - optimisé pour une performance maximale
  const { data, isLoading, refetch } = useQuery<NotificationsResponse>({
    queryKey: ["/api/notifications/unread"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Optimisations de cache pour réduire les requêtes API
    staleTime: 3 * 60 * 1000,   // Considérer les données fraîches pendant 3 minutes
    gcTime: 10 * 60 * 1000,     // Garder en cache pendant 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,      // Ne pas refetch lors du montage des composants
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes comme solution de secours
  });
  
  // Fonction pour marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      
      // Appeler l'API pour marquer comme lu
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (response.ok) {
        // Mettre à jour l'état local après confirmation du serveur
        setNotifications(prev => {
          return prev.map(notification => {
            if (notification.id === notificationId) {
              return { ...notification, isRead: true };
            }
            return notification;
          });
        });
        
        // Mettre à jour le compteur de non lus
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Tenter d'informer le serveur WebSocket si disponible
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: "NOTIFICATION_READ",
            notificationId
          }));
        }
      }
    } catch (error) {
      console.error("Erreur lors du marquage d'une notification comme lue:", error);
    }
  }, []);
  
  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      
      // Appeler l'API pour marquer toutes les notifications comme lues
      const response = await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (response.ok) {
        // Mettre à jour l'état local après confirmation du serveur
        setNotifications(prev => {
          return prev.map(notification => ({
            ...notification, 
            isRead: true
          }));
        });
        
        // Réinitialiser le compteur
        setUnreadCount(0);
        
        // Tenter d'informer le serveur WebSocket si disponible
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: "ALL_NOTIFICATIONS_READ"
          }));
        }
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    }
  }, []);
  
  // Fonction pour établir la connexion WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      // Déterminer le protocole WebSocket approprié
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      
      // Essayer d'obtenir le token d'authentification
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.log("Pas de token pour la connexion WebSocket, abandon");
        return;
      }
      
      // Créer une URL WebSocket avec le token
      const wsUrl = `${protocol}//${host}/ws?token=${token}`;
      
      // Fermer toute connexion existante avant d'en créer une nouvelle
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      // Créer une nouvelle connexion WebSocket
      ws.current = new WebSocket(wsUrl);
      
      // Configurer les événements WebSocket
      ws.current.onopen = () => {
        console.log("Connexion WebSocket établie");
        // Indiquer que les WebSockets sont actifs pour d'autres composants
        (window as any).__WS_ACTIVE = true;
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Gérer différents types de messages
          if (data.type === "NOTIFICATION") {
            // Nouvelle notification reçue
            const newNotification: Notification = data.notification;
            
            setNotifications(prev => [newNotification, ...prev]);
            if (!newNotification.isRead) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (data.type === "NOTIFICATION_UPDATE") {
            // Mise à jour d'une notification existante
            const updatedNotification: Notification = data.notification;
            
            setNotifications(prev => {
              return prev.map(notification => {
                if (notification.id === updatedNotification.id) {
                  return updatedNotification;
                }
                return notification;
              });
            });
            
            // Mettre à jour le compteur si nécessaire
            if (data.unreadCountChanged) {
              setUnreadCount(data.unreadCount);
            }
          } else if (data.type === "NOTIFICATION_COUNT") {
            // Mise à jour du nombre de notifications non lues
            setUnreadCount(data.count);
          } else if (data.type === "PING") {
            // Répondre au ping pour maintenir la connexion active
            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({ type: "PONG" }));
            }
          }
        } catch (error) {
          console.error("Erreur lors du traitement d'un message WebSocket:", error);
        }
      };
      
      ws.current.onclose = () => {
        console.log("Connexion WebSocket fermée");
        (window as any).__WS_ACTIVE = false;
        
        // Tenter de se reconnecter après un délai
        setTimeout(() => {
          connectWebSocket();
        }, 5000); // 5 secondes
      };
      
      ws.current.onerror = (error) => {
        console.error("Erreur WebSocket:", error);
        (window as any).__WS_ACTIVE = false;
        setError("Erreur de connexion au serveur de notifications");
      };
    } catch (error) {
      console.error("Erreur lors de l'établissement de la connexion WebSocket:", error);
      (window as any).__WS_ACTIVE = false;
    }
  }, []);
  
  // Effet pour charger les notifications initiales et mettre en place la connexion WebSocket
  useEffect(() => {
    if (data && !dataLoaded.current) {
      // Les données initiales sont arrivées
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        // Calculer le nombre de notifications non lues
        const unreadNotifications = data.notifications.filter(notification => !notification.isRead);
        setUnreadCount(unreadNotifications.length);
      }
      
      setLoading(false);
      dataLoaded.current = true;
    }
  }, [data]);
  
  // Effet pour configurer et gérer la connexion WebSocket
  useEffect(() => {
    // Essayer d'établir la connexion WebSocket
    connectWebSocket();
    
    // Fonction de nettoyage pour fermer la connexion lors du démontage
    return () => {
      if (ws.current) {
        ws.current.close();
        (window as any).__WS_ACTIVE = false;
      }
    };
  }, [connectWebSocket]);
  
  // Effet pour rafraîchir périodiquement les données si WebSocket n'est pas disponible
  // Réduit la fréquence de vérification pour améliorer les performances
  useEffect(() => {
    // Vérifier périodiquement si les WebSockets sont actifs
    const checkInterval = setInterval(() => {
      const wsActive = (window as any).__WS_ACTIVE;
      
      // Si les WebSockets ne sont pas actifs, utiliser le polling HTTP
      // mais seulement si le composant est visible pour l'utilisateur
      if (!wsActive && document.visibilityState === 'visible') {
        refetch();
      }
    }, 3 * 60 * 1000); // Vérifier toutes les 3 minutes au lieu d'une minute
    
    return () => clearInterval(checkInterval);
  }, [refetch]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch
  };
}
