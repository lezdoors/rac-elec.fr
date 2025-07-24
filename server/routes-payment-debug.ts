import { Express, Request, Response } from "express";
import { requireAuth, requireAdmin } from "./auth";
import { USER_ROLES } from "../shared/constants";
import { storage } from "./storage";
import Stripe from "stripe";

// Initialiser l'API Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2025-03-31.basil",
});

export function registerPaymentDebugRoutes(app: Express) {
  // Récupérer toutes les intentions de paiement Stripe
  app.get(
    "/api/payments/intents", 
    requireAuth, 
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        // Récupérer les intentions de paiement depuis Stripe
        const intents = await stripe.paymentIntents.list({
          limit: 100, // Limite les résultats aux 100 derniers
        });

        return res.status(200).json(intents.data);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des intentions de paiement:", error);
        return res.status(500).json({
          success: false,
          message: "Une erreur est survenue lors de la récupération des intentions de paiement",
          error: error.message
        });
      }
    }
  );

  // Mettre à jour le statut d'un paiement
  app.patch(
    "/api/payments/update-status",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { paymentId, status, message } = req.body;

        if (!paymentId || !status) {
          return res.status(400).json({
            success: false,
            message: "ID de paiement et statut requis"
          });
        }

        // Mettre à jour le statut du paiement dans la base de données
        const updatedPayment = await storage.updatePaymentStatus(paymentId, status, message);

        // Logger l'activité
        await storage.logActivity({
          entityType: "payment",
          entityId: paymentId,
          action: "update_status",
          userId: req.user?.id || 0,
          details: JSON.stringify({
            oldStatus: updatedPayment.previousStatus,
            newStatus: status,
            message: message || "Statut mis à jour manuellement"
          })
        });

        return res.status(200).json({
          success: true,
          message: "Statut du paiement mis à jour avec succès",
          payment: updatedPayment
        });
      } catch (error: any) {
        console.error("Erreur lors de la mise à jour du statut du paiement:", error);
        return res.status(500).json({
          success: false,
          message: "Une erreur est survenue lors de la mise à jour du statut du paiement",
          error: error.message
        });
      }
    }
  );

  // Réessayer un paiement échoué
  app.post(
    "/api/payments/retry",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { paymentId } = req.body;

        if (!paymentId) {
          return res.status(400).json({
            success: false,
            message: "ID de paiement requis"
          });
        }

        // Récupérer les informations du paiement
        const payment = await storage.getPaymentById(paymentId);

        if (!payment) {
          return res.status(404).json({
            success: false,
            message: "Paiement non trouvé"
          });
        }

        // Générer un nouveau lien de paiement
        const newPaymentLink = await storage.generatePaymentLink(payment.reference);

        // Envoyer un email au client avec le nouveau lien de paiement
        // Récupération des données du service request associé au paiement
        const serviceRequest = await storage.getServiceRequestByReference(payment.reference);
        
        if (!serviceRequest || !serviceRequest.customerEmail) {
          return res.status(404).json({
            success: false,
            message: "Demande de service ou email client non trouvé"
          });
        }

        // Envoyer l'email avec le nouveau lien de paiement
        await storage.sendPaymentRetryEmail({
          email: serviceRequest.customerEmail,
          reference: payment.reference,
          firstName: serviceRequest.firstName || '',
          lastName: serviceRequest.lastName || '',
          amount: payment.amount,
          paymentLink: newPaymentLink
        });

        // Mettre à jour le statut du paiement
        await storage.updatePaymentStatus(paymentId, "pending", "Paiement réactivé manuellement");

        // Logger l'activité
        await storage.logActivity({
          entityType: "payment",
          entityId: paymentId,
          action: "retry_payment",
          userId: req.user?.id || 0,
          details: JSON.stringify({
            reference: payment.reference,
            email: serviceRequest.customerEmail,
            newPaymentLink
          })
        });

        return res.status(200).json({
          success: true,
          message: "Email de paiement renvoyé avec succès",
          paymentLink: newPaymentLink
        });
      } catch (error: any) {
        console.error("Erreur lors de la réactivation du paiement:", error);
        return res.status(500).json({
          success: false,
          message: "Une erreur est survenue lors de la réactivation du paiement",
          error: error.message
        });
      }
    }
  );

  // Vérifier le statut d'un paiement dans Stripe
  app.post(
    "/api/payments/verify-status",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { paymentId } = req.body;

        if (!paymentId) {
          return res.status(400).json({
            success: false,
            message: "ID de paiement requis"
          });
        }

        // Récupérer les informations du paiement
        const payment = await storage.getPaymentById(paymentId);

        if (!payment) {
          return res.status(404).json({
            success: false,
            message: "Paiement non trouvé"
          });
        }

        if (!payment.stripePaymentIntentId) {
          return res.status(400).json({
            success: false,
            message: "Ce paiement n'a pas d'identifiant d'intention de paiement Stripe"
          });
        }

        // Récupérer les informations de l'intention de paiement dans Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

        let updatedStatus = payment.status;
        let statusMessage = "";

        // Mettre à jour le statut du paiement en fonction du statut Stripe
        if (paymentIntent.status === "succeeded") {
          updatedStatus = "completed";
          statusMessage = "Paiement confirmé réussi dans Stripe";
        } else if (paymentIntent.status === "canceled" || paymentIntent.status === "requires_payment_method") {
          updatedStatus = "failed";
          statusMessage = `Paiement échoué dans Stripe: ${paymentIntent.status}`;
        } else if (paymentIntent.status === "processing") {
          updatedStatus = "pending";
          statusMessage = "Paiement en cours de traitement dans Stripe";
        }

        // Si le statut a changé, mettre à jour dans la base de données
        if (updatedStatus !== payment.status) {
          await storage.updatePaymentStatus(paymentId, updatedStatus, statusMessage);
          
          // Logger l'activité
          await storage.logActivity({
            entityType: "payment",
            entityId: paymentId,
            action: "verify_payment_status",
            userId: req.user?.id || 0,
            details: JSON.stringify({
              reference: payment.reference,
              oldStatus: payment.status,
              newStatus: updatedStatus,
              stripeStatus: paymentIntent.status
            })
          });

          return res.status(200).json({
            success: true,
            message: `Statut mis à jour: ${updatedStatus} (Stripe: ${paymentIntent.status})`,
            stripeStatus: paymentIntent.status,
            previousStatus: payment.status,
            currentStatus: updatedStatus
          });
        }

        return res.status(200).json({
          success: true,
          message: `Le statut est déjà à jour: ${payment.status} (Stripe: ${paymentIntent.status})`,
          stripeStatus: paymentIntent.status,
          currentStatus: payment.status,
          noChange: true
        });
      } catch (error: any) {
        console.error("Erreur lors de la vérification du statut du paiement:", error);
        
        // Gérer le cas où l'ID d'intention de paiement n'existe pas dans Stripe
        if (error.code === 'resource_missing') {
          return res.status(404).json({
            success: false,
            message: "L'intention de paiement n'existe pas dans Stripe",
            error: error.message
          });
        }
        
        return res.status(500).json({
          success: false,
          message: "Une erreur est survenue lors de la vérification du statut du paiement",
          error: error.message
        });
      }
    }
  );
}