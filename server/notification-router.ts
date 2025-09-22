import { WebSocketServer, WebSocket as WS } from 'ws';
import { Server } from 'http';
import { notifications } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';
import { db } from './db';

// Singleton protection to prevent multiple WebSocket servers
declare global {
  var __WSS: WebSocketServer | undefined;
  var __SERVER_INITIALIZED: boolean;
}

// Extension du type WebSocket pour ajouter nos propriétés personnalisées
declare module 'ws' {
  interface WebSocket {
    isAlive: boolean;
    subscribedDataType?: string;
  }
}

export type NotificationType = 'payment' | 'lead' | 'demand' | 'system' | 'contact' | 'email' | 'performance' | 'dashboard';
export type RealtimeDataType = 'contacts' | 'leads' | 'demandes' | 'paiements' | 'emails' | 'performance' | 'notifications' | 'dashboard';

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
}

export interface GenericUpdateNotification {
  type: string; // Par exemple: 'new_lead', 'update_demand', etc.
  [key: string]: any; // Données spécifiques au type
  timestamp: string;
}

export interface ContactNotification extends GenericUpdateNotification {
  type: 'new_contact';
  contact: any; // Représente les données du contact
}

export interface LeadNotification extends GenericUpdateNotification {
  type: 'new_lead' | 'update_lead';
  lead: any;
}

export interface DemandNotification extends GenericUpdateNotification {
  type: 'new_demande' | 'update_demande';
  demande: any;
}

export interface PaymentNotification extends GenericUpdateNotification {
  type: 'new_paiement' | 'update_paiement';
  paiement: any;
}

export interface EmailNotification extends GenericUpdateNotification {
  type: 'new_email' | 'update_email';
  email: any;
}

export interface PerformanceNotification extends GenericUpdateNotification {
  type: 'update_performance';
  performance: any;
}

/**
 * Configuration du système de notifications en temps réel
 */
import GlobalContext from './global-context';

export function setupNotificationRoutes(httpServer: Server) {
  try {
    // Singleton protection: prevent creating multiple WebSocket servers
    if (globalThis.__WSS) {
      console.log('🔄 WebSocket server already exists, reusing existing instance');
      return globalThis.__WSS;
    }

    console.log('🚀 Creating new WebSocket server...');
    // Configurer le serveur WebSocket pour les notifications en temps réel
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    // Store in global singleton
    globalThis.__WSS = wss;
    
    // Stocker les connexions actives
    const activeConnections = new Set<WS>();
    
    // Stocker le WebSocketServer dans le GlobalContext pour usage global
    GlobalContext.setWebSocketServer(wss);
  
  // Configurer le WebSocketServer pour qu'il soit plus performant et stable
  wss.on('headers', (headers, request) => {
    // Augmenter le timeout pour éviter les déconnexions prématurées
    headers.push('Connection: keep-alive');
    headers.push('Keep-Alive: timeout=120'); // 120 secondes
    
    // Ajouter des en-têtes CORS pour permettre les connexions cross-domain
    headers.push('Access-Control-Allow-Origin: *');
    headers.push('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    headers.push('Access-Control-Allow-Headers: Content-Type');
    headers.push('Access-Control-Max-Age: 86400');
  });

  // Configuration de gestion des erreurs de niveau serveur
  wss.on('error', (error) => {
    console.error('❌ Erreur WebSocket (non fatale):', error.message);
    console.log('🔄 Application continue sans WebSocket en temps réel');
    // Ne pas propager l'erreur pour éviter qu'elle fasse planter l'application
  });
  
  // Garder le serveur en vie en envoyant des pings régulièrement
  const pingInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        try {
          client.ping(() => {}); // Empty callback for ping acknowledgment
        } catch (e) {
          console.error('Erreur lors de l\'envoi du ping WebSocket:', e);
        }
      }
    });
  }, 15000); // Ping toutes les 15 secondes pour plus de fiabilité
  
  // Gérer les connexions entrantes
  wss.on('connection', (ws: WS, req) => {
    // Extraire des informations de la requête pour le diagnostic
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const clientType = url.searchParams.get('client') || 'unknown';
    const timestamp = url.searchParams.get('timestamp') || 'none';
    
    console.log(`Nouvelle connexion WebSocket établie: Client=${clientType}, Timestamp=${timestamp}`);
    
    // Activer les heartbeat pour détecter les déconnexions
    ws.isAlive = true;
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Récupérer l'ID client (si disponible)
    const clientId = req.headers['x-client-id'] || Math.random().toString(36).substring(2, 15);
    
    // Log supplémentaire pour le diagnostic
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Client WebSocket connecté - ID: ${clientId}, IP: ${clientIp}`);
    
    // Ajouter cette connexion à notre liste
    activeConnections.add(ws);
    
    // Envoyer les notifications initiales
    sendNotifications(ws);
    
    // Écouter les messages du client
    ws.on('message', async (message: Buffer | string | ArrayBuffer | Buffer[]) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          // Simple ping-pong pour maintenir la connexion
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          return;
        } else if (data.type === 'markAsRead') {
          // Marquer une notification comme lue
          await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.id, parseInt(data.id)));
          
          // Diffuser la mise à jour à tous les clients
          broadcastNotifications();
        } else if (data.type === 'markAllAsRead') {
          // Marquer toutes les notifications comme lues
          await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.read, false));
          
          // Diffuser la mise à jour à tous les clients
          broadcastNotifications();
        } else if (data.type === 'subscribe') {
          // Enregistrer le type de données auquel le client s'abonne
          ws.subscribedDataType = data.dataType;
          console.log(`Client WebSocket ID: ${clientId} s'est abonné à ${data.dataType}`);
        } else if (data.type === 'unsubscribe') {
          // Supprimer l'abonnement du client
          delete ws.subscribedDataType;
          console.log(`Client WebSocket ID: ${clientId} s'est désabonné de ${data.dataType}`);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message WebSocket:', error);
      }
    });
    
    // Gérer la déconnexion
    ws.on('close', (code, reason) => {
      console.log(`Connexion WebSocket fermée - ID: ${clientId}, Code: ${code}, Raison: ${reason || 'non spécifiée'}`);
      activeConnections.delete(ws);
    });
    
    // Gérer les erreurs
    ws.on('error', (error) => {
      console.error(`Erreur WebSocket pour le client ID: ${clientId}:`, error);
      // Ne pas supprimer la connexion ici, laissons le gestionnaire 'close' s'en occuper
    });
  });
  
  // Vérifier périodiquement les connexions inactives
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      // Cast to our extended WS type
      const wsClient = client as WS;
      
      if (wsClient.isAlive === false) {
        console.log('Fermeture d\'une connexion WebSocket inactive');
        return wsClient.terminate();
      }
      
      wsClient.isAlive = false;
      try {
        wsClient.ping();
      } catch (e) {
        console.error('Erreur lors de l\'envoi du ping de heartbeat:', e);
      }
    });
  }, 45000); // Vérification toutes les 45 secondes
  
  // Nettoyer les intervalles en cas d'arrêt du serveur
  process.on('SIGINT', () => {
    clearInterval(pingInterval);
    clearInterval(heartbeatInterval);
    // Graceful shutdown without forcing exit
    console.log('WebSocket server stopping gracefully...');
  });
  
  // Fonction pour envoyer des notifications à un client spécifique
  async function sendNotifications(ws: WS) {
    try {
      // Récupérer les notifications depuis la base de données
      const dbNotifications = await db.select()
        .from(notifications)
        .orderBy(desc(notifications.created_at))
        .limit(30);
      
      // Formater les notifications pour le client
      const notificationsFormatted = dbNotifications.map(n => {
        let parsedData = null;
        if (n.data) {
          try {
            // Si n.data est déjà un objet, l'utiliser directement
            // sinon essayer de le parser depuis une chaîne JSON
            parsedData = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
          } catch (e) {
            console.error('Error parsing JSON data:', e);
          }
        }
        
        return {
          id: n.id.toString(),
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          time: n.created_at.toISOString(),
          read: n.read,
          data: parsedData
        };
      });
      
      // Calculer le nombre de notifications non lues
      const unreadCount = notificationsFormatted.filter(n => !n.read).length;
      
      // Envoyer les notifications au client
      ws.send(JSON.stringify({
        type: 'notifications',
        notifications: notificationsFormatted,
        unreadCount: unreadCount,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  }
  
  // Fonction pour diffuser les notifications à tous les clients connectés
  async function broadcastNotifications() {
    activeConnections.forEach((ws: WS) => {
      if (ws.readyState === WS.OPEN) {
        sendNotifications(ws);
      }
    });
  }
  
  // Fonction générique pour diffuser des données en temps réel
  function broadcastData(dataType: RealtimeDataType, data: any, actionType: 'new' | 'update' = 'new') {
    const type = `${actionType}_${dataType}`;
    const message: GenericUpdateNotification = {
      type,
      [dataType === 'demandes' ? 'demande' : dataType === 'paiements' ? 'paiement' : dataType.slice(0, -1)]: data,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Diffusion temps réel: ${type}`);
    
    activeConnections.forEach((ws: WS) => {
      // Envoyer à tous les clients connectés et:
      // - Soit ils n'ont pas d'abonnement spécifique (comportement par défaut)
      // - Soit ils sont abonnés spécifiquement à ce type de données
      if (ws.readyState === WS.OPEN && (!ws.subscribedDataType || ws.subscribedDataType === dataType)) {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Erreur lors de l'envoi d'une mise à jour ${dataType}:`, error);
        }
      }
    });
  }
  
  // Fonction pour notifier un nouveau contact à tous les clients connectés
  function broadcastNewContact(contact: any) {
    broadcastData('contacts', contact);
  }
  
  // Fonction pour notifier un nouveau lead
  function broadcastNewLead(lead: any) {
    broadcastData('leads', lead);
  }
  
  // Fonction pour notifier la mise à jour d'un lead
  function broadcastUpdateLead(lead: any) {
    broadcastData('leads', lead, 'update');
  }
  
  // Fonction pour notifier une nouvelle demande
  function broadcastNewDemande(demande: any) {
    broadcastData('demandes', demande);
  }
  
  // Fonction pour notifier la mise à jour d'une demande
  function broadcastUpdateDemande(demande: any) {
    broadcastData('demandes', demande, 'update');
  }
  
  // Fonction pour notifier un nouveau paiement
  function broadcastNewPaiement(paiement: any) {
    broadcastData('paiements', paiement);
  }
  
  // Fonction pour notifier la mise à jour d'un paiement
  function broadcastUpdatePaiement(paiement: any) {
    broadcastData('paiements', paiement, 'update');
  }
  
  // Fonction pour notifier un nouvel email
  function broadcastNewEmail(email: any) {
    broadcastData('emails', email);
  }
  
  // Fonction pour notifier la mise à jour des métriques de performance
  function broadcastPerformanceUpdate(performance: any) {
    broadcastData('performance', performance, 'update');
  }
  
  // Fonction pour notifier la mise à jour du tableau de bord
  function broadcastDashboardUpdate(dashboardData: any) {
    broadcastData('dashboard', dashboardData, 'update');
  }

  // Retourner les fonctions utiles pour d'autres parties de l'application
  return {
    // Fonctions de base pour les notifications
    broadcastNotifications,
    createNotification: async (type: NotificationType, title: string, message: string, data?: any) => {
      // Insérer la notification en base de données
      await db.insert(notifications).values({
        type,
        title,
        message,
        read: false,
        data: data ? JSON.stringify(data) : null
      });
      
      // Diffuser à tous les clients connectés
      broadcastNotifications();
    },
    
    // Fonction générique pour diffuser des données en temps réel
    broadcastData,
    
    // Contacts
    broadcastNewContact,
    createContactNotification: async (contact: any) => {
      // Créer une notification dans le système
      await db.insert(notifications).values({
        type: 'contact',
        title: 'Nouveau contact',
        message: `Nouveau message de ${contact.name}`,
        read: false,
        data: JSON.stringify(contact)
      });
      
      // Diffuser la notification régulière à tous les clients
      broadcastNotifications();
      
      // Diffuser la notification spécifique du contact
      broadcastNewContact(contact);
    },
    
    // Leads
    broadcastNewLead,
    broadcastUpdateLead,
    
    // Demandes
    broadcastNewDemande,
    broadcastUpdateDemande,
    
    // Paiements
    broadcastNewPaiement,
    broadcastUpdatePaiement,
    
    // Emails
    broadcastNewEmail,
    
    // Performance
    broadcastPerformanceUpdate,
    
    // Tableau de bord
    broadcastDashboardUpdate
  };
  
  } catch (error) {
    console.error('❌ Erreur lors de la configuration du serveur WebSocket:', error);
    console.log('🔄 Application en cours d\'exécution sans notifications WebSocket en temps réel');
    
    // Créer un service de notification factice pour éviter les erreurs
    return {
      createContactNotification: async (contact: any) => {
        console.log('📧 Notification contact (mode dégradé):', contact.name);
      },
      broadcastNewLead: () => {},
      broadcastUpdateLead: () => {},
      broadcastNewDemande: () => {},
      broadcastUpdateDemande: () => {},
      broadcastNewPaiement: () => {},
      broadcastUpdatePaiement: () => {},
      broadcastNewEmail: () => {},
      broadcastPerformanceUpdate: () => {},
      broadcastDashboardUpdate: () => {}
    };
  }
}
