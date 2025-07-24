import { Request, Response, Router } from 'express';
import { requireAuth, requireAdmin } from './auth';
import { USER_ROLES } from '@shared/schema';
import { db } from './db';
import { notifications } from '@shared/schema';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Variable globale pour stocker la référence au service de notification
// Cette variable sera initialisée dans l'exportation
let notificationService: any = null;

// Fonction pour définir le service de notification
export function setNotificationService(service: any) {
  notificationService = service;
  console.log('Service de notification configuré pour les routes de test');
}

const router = Router();

// Fonction pour créer une notification de test (uniquement en mode développement)
const createNotificationSchema = z.object({
  type: z.enum(['payment', 'lead', 'system']),
  title: z.string().min(3),
  message: z.string().min(5),
  data: z.object({}).passthrough().optional()
});

router.post('/test/create-notification', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validation du corps de la requête
    const validation = createNotificationSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errors = fromZodError(validation.error);
      return res.status(400).json({
        success: false,
        message: 'Données de notification invalides',
        errors: errors.details
      });
    }
    
    const { type, title, message, data } = validation.data;
    
    // Créer la notification
    const [notification] = await db.insert(notifications)
      .values({
        type,
        title,
        message,
        read: false,
        data: data ? JSON.stringify(data) : null
      })
      .returning();
      
    // Diffuser la notification à tous les clients WebSocket si le service est disponible
    if (notificationService && notificationService.broadcastNotifications) {
      console.log('Diffusion de la notification à tous les clients WebSocket');
      await notificationService.broadcastNotifications();
    } else {
      console.warn('Service de notification non disponible, impossible de diffuser la notification');
    }
      
    // Envoyer la réponse
    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      notification
    });
  } catch (error: any) {
    console.error('Erreur lors de la création d\'une notification de test:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
});

// Récupérer toutes les notifications (pour les tests)
router.get('/test/notifications', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const allNotifications = await db.select().from(notifications).orderBy(notifications.created_at);
    
    res.status(200).json({
      success: true,
      notifications: allNotifications
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
});

export const testRouter = router;
