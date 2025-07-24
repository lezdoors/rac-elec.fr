/**
 * Service de gestion des notifications
 * Ce service permet de stocker et gérer les notifications pour les utilisateurs
 */

import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db';
import { notifications } from '@shared/schema';
import { eq, desc, and, sql, asc } from 'drizzle-orm';

export enum NotificationType {
  PAYMENT = 'payment',
  LEAD = 'lead',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
}

// Map pour stocker les connexions WebSocket actives
const clients = new Map();

// Initialiser le WebSocket server
export function initNotificationService(wss: WebSocketServer) {
  console.log('Service de notifications initialisé');
  
  wss.on('connection', (ws, req) => {
    const id = Math.random().toString(36).substring(2, 15);
    console.log(`Client WebSocket connecté`);
    
    // Stocker la connexion
    clients.set(id, ws);
    
    // Envoyer les notifications à ce client
    sendNotificationsToClient(ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Message WebSocket reçu:`, data);
        
        // Traiter les différentes actions
        if (data.type === 'markAsRead') {
          await markNotificationAsRead(data.id);
          sendNotificationsToAllClients();
        } else if (data.type === 'markAllAsRead') {
          await markAllNotificationsAsRead();
          sendNotificationsToAllClients();
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message WebSocket:', error);
      }
    });
    
    ws.on('close', () => {
      console.log(`Client WebSocket déconnecté`);
      clients.delete(id);
    });
  });
}

// Créer et stocker une nouvelle notification
export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Promise<void> {
  try {
    await db.insert(notifications).values({
      type: type,
      title: title,
      message: message,
      created_at: new Date(),
      read: false,
      data: data ? JSON.stringify(data) : null,
    });
    
    // Envoyer la notification mise à jour à tous les clients connectés
    sendNotificationsToAllClients();
  } catch (error) {
    console.error('Erreur lors de la création d\'une notification:', error);
  }
}

// Marquer une notification comme lue
async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, parseInt(id)));
  } catch (error) {
    console.error(`Erreur lors du marquage de la notification ${id} comme lue:`, error);
  }
}

// Marquer toutes les notifications comme lues
async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.read, false));
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
  }
}

// Récupérer les notifications
async function getNotifications(): Promise<Notification[]> {
  try {
    const notifs = await db.select()
      .from(notifications)
      .orderBy(desc(notifications.created_at))
      .limit(30);
      
    return notifs.map(n => {
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
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
}

// Récupérer le nombre de notifications non lues
async function getUnreadCount(): Promise<number> {
  try {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.read, false));
      
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    return 0;
  }
}

// Envoyer les notifications à un client spécifique
async function sendNotificationsToClient(ws: WebSocket): Promise<void> {
  try {
    const allNotifications = await getNotifications();
    const unreadCount = await getUnreadCount();
    
    ws.send(JSON.stringify({
      type: 'notifications',
      notifications: allNotifications,
      unreadCount: unreadCount
    }));
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications au client:', error);
  }
}

// Envoyer les notifications à tous les clients connectés
async function sendNotificationsToAllClients(): Promise<void> {
  try {
    const allNotifications = await getNotifications();
    const unreadCount = await getUnreadCount();
    
    const message = JSON.stringify({
      type: 'notifications',
      notifications: allNotifications,
      unreadCount: unreadCount
    });
    
    clients.forEach((ws) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications à tous les clients:', error);
  }
}

// Créer une notification pour un nouvel email
export async function createEmailNotification(from: string, subject: string): Promise<void> {
  await createNotification(
    NotificationType.SYSTEM,
    'Nouvel email reçu',
    `De: ${from} - Sujet: ${subject}`,
    { type: 'email' }
  );
}

// Créer une notification pour un nouveau paiement
export async function createPaymentNotification(amount: number, clientName: string): Promise<void> {
  await createNotification(
    NotificationType.PAYMENT,
    'Nouveau paiement reçu',
    `Paiement de ${amount.toFixed(2)}€ reçu de ${clientName}`,
    { amount, clientName }
  );
}

// Créer une notification pour un nouveau lead
export async function createLeadNotification(name: string, service: string): Promise<void> {
  await createNotification(
    NotificationType.LEAD,
    'Nouveau lead créé',
    `${name} a fait une demande pour ${service}`,
    { name, service }
  );
}
