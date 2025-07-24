import { Request, Response } from 'express';

// Extension de l'interface Request pour inclure session
interface ExtendedRequest extends Request {
  session?: any;
  user?: any;
}
import * as path from 'path';
import * as fs from 'fs';
import { generatePaymentReceipt, receiptExists, getReceiptUrl } from './payment-receipt-service';
import { requireAuth, requireAdminOrManager } from './auth';

/**
 * Contrôleur pour générer et servir des reçus de paiement au format PDF
 */
export const setupPaymentReceiptRoutes = (app: any) => {
  // Route de test temporaire pour génération de reçus sans auth
  app.get('/api/payment-receipt-test/:paymentId', async (req: any, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'ID de paiement requis' });
      }
      
      // Générer directement le reçu
      const receiptUrl = await generatePaymentReceipt(paymentId);
      
      if (!receiptUrl) {
        return res.status(500).json({ 
          success: false, 
          message: 'Impossible de générer le reçu de paiement' 
        });
      }
      
      // Retourner l'URL du reçu
      res.json({
        success: true,
        receiptUrl: receiptUrl
      });
    } catch (error: any) {
      console.error('Erreur lors de la génération du reçu de paiement:', error);
      
      res.status(500).json({ 
        success: false, 
        message: `Erreur lors de la génération du reçu: ${error.message || 'Erreur inconnue'}` 
      });
    }
  });

  // Note: La route principale /api/payment-receipt/:paymentId est définie dans routes.ts
  // Cette route a été déplacée pour éviter les conflits de routage
  
  // Route pour servir les fichiers PDF des reçus (si besoin)
  app.get('/certificates/:filename', async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), 'certificates', filename);
      
      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          success: false, 
          message: 'Reçu non trouvé' 
        });
      }
      
      // Déterminer le type de contenu
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.html') {
        contentType = 'text/html';
      }
      
      // Définir l'en-tête de type de contenu
      res.setHeader('Content-Type', contentType);
      
      // Si c'est un PDF, ajouter un en-tête Content-Disposition pour le téléchargement
      if (ext === '.pdf') {
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      }
      
      // Envoyer le fichier
      fs.createReadStream(filePath).pipe(res);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du reçu:', error);
      
      res.status(500).json({ 
        success: false, 
        message: `Erreur lors de la récupération du reçu: ${error.message || 'Erreur inconnue'}` 
      });
    }
  });

  // Route pour obtenir l'état d'un reçu (existe ou non)
  app.get('/api/payment-receipt-status/:paymentId', requireAuth, requireAdminOrManager, async (req: any, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'ID de paiement requis' });
      }
      
      // Vérifier si le reçu existe déjà
      const exists = await receiptExists(paymentId);
      const receiptUrl = exists ? await getReceiptUrl(paymentId) : null;
      
      res.json({ 
        success: true, 
        exists,
        receiptUrl
      });
    } catch (error: any) {
      console.error('Erreur lors de la vérification du reçu:', error);
      
      res.status(500).json({ 
        success: false, 
        message: `Erreur lors de la vérification du reçu: ${error.message || 'Erreur inconnue'}` 
      });
    }
  });
};