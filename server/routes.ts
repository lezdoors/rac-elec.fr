import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import GlobalContext from "./global-context";
import Stripe from "stripe";
import { WebSocketServer, WebSocket } from "ws";
import { setupNotificationRoutes } from "./notification-router";
import { testRouter, setNotificationService } from "./test-routes";
import { performanceRouter } from "./performance-router";
import { getActiveConnectionCount } from "./active-counter-service";
import { registerPerformanceRoutes } from "./routes-performance";
import { registerPaymentDebugRoutes } from "./routes-payment-debug";
import { securityMonitor } from "./security-monitoring";
import { serviceRequestValidationSchema, userValidationSchema, USER_ROLES, REQUEST_STATUS, LEAD_STATUS, systemConfigs, leads, emailTemplates, users, serviceRequests, notifications, payments } from "@shared/schema";
import { eq, desc, sql, and, asc, inArray, isNull, like, or, not, gt, lt, gte, lte, ilike } from "drizzle-orm";
import { fromZodError } from "zod-validation-error";
import path from "path";
import { hash } from "bcrypt";
import { requireAuth, loginHandler, requireAdmin, requireAdminOrManager, getCurrentUser, logoutHandler, initializeAdminUser } from "./auth";
import * as claudeApi from "./claude-api";
import * as claudeDataAnalyzer from "./claude-data-analyzer";
// Google Snippets service removed
import { setupSmtpService, sendLeadNotification, sendPaiementReussiNotification, sendPaiementEchoueNotification, sendSupportMessageNotification, determineContactPriority, sendContactEmail, sendContactNotificationToStaff } from "./email-service";
import * as emailImapService from "./email-imap-service";
import { generateCertificate, certificateExists, getCertificateUrl, getCertificateContent } from "./certificate-service";
import { generateContract, contractExists, getContractUrl, getContractContent } from "./contract-service";
import * as emailService from "./email-service";
import { getLocationFromIp } from "./geoip-service";
import { setupPaymentReceiptRoutes } from './payment-receipt-controller';
import { userStatsService } from "./user-stats-service";

import { userStatsRouter } from "./routes-user-stats";
import { setupDashboardRoutes } from "./routes-dashboard";
import { z } from "zod";
import { ulid } from "ulid";

// Schema de validation pour le formulaire de contact
const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email doit être valide"),
  subject: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères")
});

// En-tête pour la signature de webhook Stripe
const STRIPE_SIGNATURE_HEADER = "stripe-signature";

// Interface pour étendre la requête avec la charge utile brute pour la vérification webhook
interface StripeRequest extends Request {
  rawBody?: Buffer;
}

// Initialisation de l'API Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
  });
  console.log('Stripe API initialisée');
} else {
  console.log('STRIPE_SECRET_KEY non définie, les fonctionnalités Stripe seront limitées');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 🔧 INITIALISATION UNIQUE DU SERVICE SMTP
  console.log("🚀 Initialisation du service SMTP unique...");
  setupSmtpService();
  console.log("✅ Service SMTP unique initialisé");
  // Configuration pour servir les fichiers statiques mise dans server/index.ts
  // Skip admin initialization to prevent startup blocking
  console.log("Utilisateur admin - initialisation différée");
  
  // Créer le serveur HTTP qui servira à la fois l'API Express et le WebSocket
  const httpServer = createServer(app);
  
  // Installer le routeur des statistiques utilisateurs
  app.use('/api/user-stats', userStatsRouter);
  
  // Installer les routes du tableau de bord
  setupDashboardRoutes(app);
  
  // Installer les routes de débogage des paiements
  registerPaymentDebugRoutes(app);
  
  // Configuration SMTP simplifiée - Une seule configuration
  console.log("Service SMTP configuré - notification@portail-electricite.com → contact@portail-electricite.com");
  
  // Security status endpoint for admin monitoring
  app.get("/api/admin/security-status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const stats = securityMonitor.getSecurityStats();
      res.json({
        success: true,
        data: {
          securityStats: stats,
          serverStatus: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development'
          },
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Erreur récupération statut sécurité:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du statut sécurité"
      });
    }
  });
  
  // Route pour récupérer la configuration SMTP (admin uniquement)
  app.get("/api/admin/smtp-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const config = await getSmtpConfig();
      
      // Masquer le mot de passe si demandé
      if (req.query.hidePassword === 'true' && config.auth.pass) {
        config.auth.pass = '••••••••••••';
      }
      
      res.status(200).json({ success: true, data: config });
    } catch (error) {
      console.error("Erreur récupération config SMTP:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération de la configuration SMTP" 
      });
    }
  });
  
  // Route pour configurer le service SMTP (admin uniquement)
  app.post("/api/admin/smtp-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Schéma de validation pour la configuration SMTP - accepte des mises à jour partielles
      const smtpConfigPartialSchema = z.object({
        host: z.string().min(1, "L'hôte SMTP est requis").optional(),
        port: z.number().int().positive("Le port doit être un nombre entier positif").optional(),
        secure: z.boolean().optional(),
        auth: z.object({
          user: z.string().min(1, "L'utilisateur SMTP est requis").optional(),
          pass: z.string().min(1, "Le mot de passe SMTP est requis").optional()
        }).optional(),
        defaultFrom: z.string().email("L'adresse d'expédition doit être un email valide").optional(),
        enabled: z.boolean().optional()
      });
      
      console.log("Requête de mise à jour SMTP reçue:", {
        ...req.body,
        auth: req.body.auth ? { ...req.body.auth, pass: req.body.auth.pass ? '****' : undefined } : undefined
      });
      
      const validationResult = smtpConfigPartialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation de la configuration SMTP",
          errors: validationError.details
        });
      }
      
      // Extraction des données validées pour la mise à jour partielle
      const partialSmtpConfig = validationResult.data;
      
      // Sauvegarder la configuration SMTP (en base de données et en mémoire) avec fusion des configurations
      const success = await saveSmtpConfig(partialSmtpConfig);
      
      if (success) {
        // Logger l'activité
        await storage.logActivity({
          entityType: "system",
          entityId: 0,
          action: "smtp_config_updated",
          userId: req.user?.id || 0,
          details: JSON.stringify({ 
            host: partialSmtpConfig.host, 
            port: partialSmtpConfig.port, 
            user: partialSmtpConfig.auth?.user,
            enabled: partialSmtpConfig.enabled,
            isPartialUpdate: true
          })
        });
        
        // Récupérer la configuration complète mise à jour pour la renvoyer au client
        const updatedConfig = await getSmtpConfig();
        
        // Masquer le mot de passe dans la réponse pour des raisons de sécurité
        if (updatedConfig.auth?.pass) {
          updatedConfig.auth.pass = '••••••••••••';
        }
        
        res.status(200).json({
          success: true,
          message: "Configuration SMTP mise à jour avec succès",
          data: updatedConfig
        });
      } else {
        throw new Error("Échec de la mise à jour de la configuration SMTP");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la configuration SMTP:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la mise à jour de la configuration SMTP"
      });
    }
  });
  
  // Route pour récupérer l'adresse email de notification (admin uniquement)
  app.get("/api/admin/notification-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Récupérer les adresses email de notification depuis la base de données
      const [notificationEmailsConfig] = await db.select()
        .from(systemConfigs)
        .where(eq(systemConfigs.configKey, 'notification_emails'));
      
      // Convertir la chaîne JSON en tableau si elle existe, sinon utiliser un tableau avec l'adresse par défaut
      let notificationEmails = [];
      try {
        if (notificationEmailsConfig?.configValue) {
          notificationEmails = JSON.parse(notificationEmailsConfig.configValue);
        }
      } catch (e) {
        console.error("Erreur de parsing JSON pour les emails de notification", e);
      }
      
      // S'assurer que les emails standards sont toujours inclus
      const standardEmails = ["marina.alves@portail-electricite.com", "Bonjour@portail-electricite.com"];
      standardEmails.forEach(email => {
        if (!notificationEmails.includes(email)) {
          notificationEmails.push(email);
        }
      });
      
      // Si le tableau est toujours vide après tout cela, utiliser l'adresse par défaut
      if (notificationEmails.length === 0) {
        notificationEmails = ["notification@portail-electricite.com"];
      }
      
      // Pour compatibilité avec le code existant, renvoyer aussi le premier email comme propriété 'email'
      res.status(200).json({ 
        success: true, 
        data: { 
          email: notificationEmails[0],
          emails: notificationEmails 
        } 
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des adresses email de notification:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des adresses email de notification" 
      });
    }
  });
  
  // Route pour mettre à jour les adresses email de notification (admin uniquement)
  app.post("/api/admin/notification-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Valider à la fois un seul email ou un tableau d'emails
      const emailsSchema = z.union([
        z.string().email("L'adresse email doit être valide"),
        z.array(z.string().email("Toutes les adresses email doivent être valides"))
      ]);
      
      // Extraire les données de la requête
      const emailData = req.body.email || req.body.emails;
      
      const validationResult = emailsSchema.safeParse(emailData);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation des adresses email",
          errors: validationError.details
        });
      }
      
      // Convertir en tableau si un seul email a été fourni
      let emails = Array.isArray(validationResult.data) 
        ? validationResult.data 
        : [validationResult.data];
      
      // S'assurer que les emails standards sont toujours inclus
      const standardEmails = ["marina.alves@portail-electricite.com", "contact@portail-electricite.com"];
      standardEmails.forEach(email => {
        if (!emails.includes(email)) {
          emails.push(email);
        }
      });
      
      // Stocker le tableau sous forme de chaîne JSON
      const emailsJson = JSON.stringify(emails);
      
      // Mettre à jour les adresses email de notification dans la base de données
      await db.insert(systemConfigs)
        .values({
          configKey: 'notification_emails',
          configValue: emailsJson,
          configGroup: 'smtp',
          isSecret: false,
          description: 'Adresses email pour les notifications de nouvelles demandes'
        })
        .onConflictDoUpdate({
          target: systemConfigs.configKey,
          set: {
            configValue: emailsJson,
            updatedAt: new Date()
          }
        });
        
      // Pour la compatibilité, mettre également à jour l'ancienne clé de configuration
      await db.insert(systemConfigs)
        .values({
          configKey: 'notification_email',
          configValue: emails[0],
          configGroup: 'smtp',
          isSecret: false,
          description: 'Adresse email principale pour les notifications'
        })
        .onConflictDoUpdate({
          target: systemConfigs.configKey,
          set: {
            configValue: emails[0],
            updatedAt: new Date()
          }
        });
      
      // Logger l'activité
      await storage.logActivity({
        entityType: "system",
        entityId: 0,
        action: "notification_email_updated",
        userId: req.user?.id || 0,
        details: JSON.stringify({ emails })
      });
      
      res.status(200).json({
        success: true,
        message: "Adresse email de notification mise à jour avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'adresse email de notification:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la mise à jour de l'adresse email de notification"
      });
    }
  });
  
  // Route pour recevoir les messages de support
  app.post("/api/support/message", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      
      // Validation basique
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Le nom, l'email et le message sont requis"
        });
      }

      // Envoyer la notification par email
      const result = await sendSupportMessageNotification({
        name,
        email,
        phone: phone || 'Non fourni',
        subject: subject || 'Support général',
        message
      });

      if (result.success) {
        res.json({
          success: true,
          message: "Votre message a été envoyé avec succès. Nous vous répondrons sous 24h.",
          messageId: result.messageId
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Erreur lors de l'envoi du message"
        });
      }
    } catch (error) {
      console.error("Erreur route support message:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'envoi de votre message"
      });
    }
  });

  // Route pour tester la configuration SMTP (admin uniquement)
  app.post("/api/admin/test-smtp", requireAuth, requireAdmin, async (req, res) => {
    try {
      const testSchema = z.object({
        to: z.string().email("L'adresse email de test doit être valide"),
        subject: z.string().min(1, "Le sujet est requis"),
        message: z.string().min(1, "Le message est requis")
      });
      
      const validationResult = testSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation des données de test",
          errors: validationError.details
        });
      }
      
      try {
        const result = await testSmtpConfig(validationResult.data);
        
        // Logger l'activité
        await storage.logActivity({
          entityType: "system",
          entityId: 0,
          action: "smtp_test",
          userId: req.user?.id || 0,
          details: JSON.stringify({ 
            to: validationResult.data.to,
            subject: validationResult.data.subject,
            success: result.success
          })
        });
        
        if (!result.success) {
          return res.status(400).json({ 
            success: false, 
            message: "Échec de l'envoi de l'email de test", 
            error: result.error || "Erreur SMTP inconnue"
          });
        }
        
        res.status(200).json({ 
          success: true, 
          message: "Email de test envoyé avec succès" 
        });
      } catch (smtpError) {
        const errorMessage = smtpError instanceof Error ? smtpError.message : "Erreur inconnue";
        res.status(400).json({ 
          success: false, 
          message: "Échec de l'envoi de l'email de test", 
          error: errorMessage 
        });
      }
    } catch (error) {
      console.error("Erreur test SMTP:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur interne du serveur" 
      });
    }
  });
  
  // Google Snippets admin routes removed - ready for your working snippets
  
  // Endpoint pour récupérer le nombre d'utilisateurs en cours de raccordement (public)
  app.get("/api/active-connection-count", async (req, res) => {
    try {
      // Obtenir le nombre d'utilisateurs actifs à partir du service
      const count = await getActiveConnectionCount();
      
      res.json({ 
        success: true,
        count
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs actifs:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération du nombre d'utilisateurs actifs",
        count: 128 // Valeur par défaut en cas d'erreur
      });
    }
  });
  
  // Authentication routes
  app.post("/api/login", loginHandler);
  
  // Récupérer l'utilisateur connecté avec ses permissions
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }
      
      // Log pour débogage
      console.log(`Récupération des données utilisateur pour ID=${req.user.id}`);
      
      // Récupérer l'utilisateur depuis la base de données
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        console.error(`Utilisateur avec ID=${req.user.id} non trouvé dans la base de données`);
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }
      
      // Récupérer les permissions spécifiques pour cet utilisateur
      let permissions = [];
      try {
        permissions = Array.isArray(user.permissions) ? user.permissions : [];
        
        // Pour l'utilisateur admin, ajouter automatiquement toutes les permissions
        if (user.role === USER_ROLES.ADMIN && (!permissions || !permissions.length)) {
          permissions = [
            { page: "dashboard", canEdit: true, canView: true },
            { page: "leads", canEdit: true, canView: true },
            { page: "demandes", canEdit: true, canView: true },
            { page: "paiements", canEdit: true, canView: true },
            { page: "clients", canEdit: true, canView: true },
            { page: "rendez-vous", canEdit: true, canView: true },
            { page: "emails", canEdit: true, canView: true },
            { page: "settings", canEdit: true, canView: true },
            { page: "users", canEdit: true, canView: true },
            { page: "animations", canEdit: true, canView: true },
            { page: "notifications", canEdit: true, canView: true },
            { page: "contacts", canEdit: true, canView: true }
          ];
        }
      } catch (permError) {
        console.error("Erreur de récupération des permissions:", permError);
      }
      
      // Assembler les données utilisateur complètes avec les permissions
      // Ne pas renvoyer le mot de passe
      const { password, ...userWithoutPassword } = user;
      
      const userWithPermissions = {
        ...userWithoutPassword,
        permissions
      };
      
      console.log(`Renvoi des données utilisateur ${ user.username } (${user.role})`);
      console.log("Permissions:", permissions);
      
      res.json(userWithPermissions);
    } catch (error) {
      console.error("Error retrieving current user:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération de l'utilisateur"
      });
    }
  });
  
  // Schéma de validation pour le changement de mot de passe
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
      .refine(password => {
        // Au moins une lettre et un chiffre pour plus de sécurité
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasLetter && hasNumber;
      }, "Le mot de passe doit contenir au moins une lettre et un chiffre")
  });

  // Route pour changer le mot de passe de l'utilisateur connecté
  app.post("/api/change-password", requireAuth, async (req, res) => {
    try {
      // Valider les données d'entrée
      const validationResult = changePasswordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ 
          success: false,
          message: "Données de formulaire invalides",
          errors: errors.details
        });
      }
      
      const { currentPassword, newPassword } = validationResult.data;
      
      // Récupérer l'utilisateur depuis la base de données
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, req.user!.id));

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Utilisateur non trouvé" 
        });
      }

      // Vérifier le mot de passe actuel
      const passwordMatch = await comparePasswords(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false,
          message: "Mot de passe actuel incorrect" 
        });
      }

      // Vérifier que le nouveau mot de passe est différent de l'ancien
      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "Le nouveau mot de passe doit être différent de l'ancien"
        });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(newPassword);

      // Mettre à jour le mot de passe dans la base de données
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, req.user!.id));

      // Log l'action pour la sécurité
      await db.insert(activityLogs).values({
        userId: req.user!.id,
        action: "password_changed",
        entityType: "user",
        entityId: req.user!.id,
        details: JSON.stringify({
          message: "Mot de passe modifié par l'utilisateur",
          timestamp: new Date().toISOString()
        }),
        ipAddress: req.ip || "",
        createdAt: new Date()
      });

      return res.status(200).json({ 
        success: true, 
        message: "Mot de passe modifié avec succès" 
      });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors du changement de mot de passe" 
      });
    }
  });

  // Schéma de validation pour la réinitialisation de mot de passe (pour administrateurs)
  const resetPasswordSchema = z.object({
    newPassword: z.string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
      .refine(password => {
        // Au moins une lettre et un chiffre pour plus de sécurité
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasLetter && hasNumber;
      }, "Le mot de passe doit contenir au moins une lettre et un chiffre")
  });

  // Route pour réinitialiser le mot de passe d'un utilisateur (admin uniquement)
  app.post("/api/reset-password/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Valider les données d'entrée
      const validationResult = resetPasswordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = fromZodError(validationResult.error);
        return res.status(400).json({ 
          success: false,
          message: "Données de formulaire invalides",
          errors: errors.details
        });
      }
      
      const { newPassword } = validationResult.data;
      
      // Récupérer l'utilisateur depuis la base de données
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Utilisateur non trouvé" 
        });
      }

      // Vérifier que l'utilisateur n'essaie pas de réinitialiser le mot de passe de l'admin principal
      if (user.username === "admin" && user.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Impossible de réinitialiser le mot de passe de l'administrateur principal"
        });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(newPassword);

      // Mettre à jour le mot de passe dans la base de données
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));

      // Log l'action pour la sécurité
      await db.insert(activityLogs).values({
        userId: req.user!.id,
        action: "password_reset",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({
          message: `Mot de passe réinitialisé par l'administrateur ${req.user!.id}`,
          timestamp: new Date().toISOString(),
          targetUser: userId
        }),
        ipAddress: req.ip || "",
        createdAt: new Date()
      });

      return res.status(200).json({ 
        success: true, 
        message: "Mot de passe réinitialisé avec succès" 
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la réinitialisation du mot de passe" 
      });
    }
  });
  
  // Routes pour la gestion des animations UI
  app.get("/api/ui-animations", async (req, res) => {
    try {
      const animations = await storage.getAllUiAnimations();
      res.json(animations);
    } catch (error) {
      console.error("Erreur récupération des animations:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des animations" 
      });
    }
  });
  
  app.get("/api/ui-animations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const animation = await storage.getUiAnimation(id);
      
      if (!animation) {
        return res.status(404).json({
          success: false,
          message: "Animation non trouvée"
        });
      }
      
      res.json(animation);
    } catch (error) {
      console.error("Erreur récupération d'une animation:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération de l'animation" 
      });
    }
  });
  
  app.post("/api/ui-animations", requireAuth, requireAdmin, async (req, res) => {
    try {
      const animation = await storage.createUiAnimation(req.body);
      res.status(201).json(animation);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erreur lors de la création de l'animation" 
      });
    }
  });
  
  app.put("/api/ui-animations/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id || 0;
      
      const updatedAnimation = await storage.updateUiAnimation(id, req.body, userId);
      
      if (!updatedAnimation) {
        return res.status(404).json({
          success: false,
          message: "Animation non trouvée"
        });
      }
      
      res.json(updatedAnimation);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erreur lors de la mise à jour de l'animation" 
      });
    }
  });
  
  app.patch("/api/ui-animations/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id || 0;
      
      const updatedAnimation = await storage.toggleUiAnimation(id, userId);
      
      if (!updatedAnimation) {
        return res.status(404).json({
          success: false,
          message: "Animation non trouvée"
        });
      }
      
      res.json(updatedAnimation);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erreur lors du basculement de l'animation" 
      });
    }
  });
  
  // Route pour réinitialiser toutes les animations UI
  app.post("/api/ui-animations/reset", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Supprimer toutes les animations existantes (en utilisant une requête SQL directe)
      await db.delete(uiAnimations);
      
      // Réinitialiser avec les animations par défaut
      const { initializeAnimations } = await import('./init-animations.js');
      await initializeAnimations();
      
      res.json({ 
        success: true, 
        message: "Animations réinitialisées avec succès avec les nouvelles animations par défaut." 
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des animations:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la réinitialisation des animations" 
      });
    }
  });
  
  // Route pour appliquer l'animation Enedis améliorée à tout le site
  app.post("/api/ui-animations/apply-enedis", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('🚀 Application de l\'animation Enedis améliorée à tout le site...');
      
      // 1. Supprimer toutes les animations existantes
      console.log('🗑️ Suppression des animations existantes...');
      await db.delete(uiAnimations);
      
      // 2. Initialiser les nouvelles animations avec les configurations améliorées
      console.log('✨ Initialisation des animations avec les fonctionnalités Enedis améliorées...');
      const { initializeAnimations } = await import('./init-animations.js');
      await initializeAnimations();
      
      // 3. Mettre à jour la configuration pour utiliser "Animation Électrique Complète Enedis" comme défaut
      const result = await db.select().from(uiAnimations).where(eq(uiAnimations.name, 'Animation Électrique Complète Enedis'));
      
      if (result.length > 0) {
        const enhancedAnimationId = result[0].id;
        
        // Mettre à jour pour que cette animation soit celle par défaut
        await db.update(uiAnimations)
          .set({ default: true })
          .where(eq(uiAnimations.id, enhancedAnimationId));
        
        // Notifier via le WebSocket si disponible
        if (wss) {
          const notification = {
            type: 'animation_updated',
            message: 'Animation Enedis améliorée appliquée sur tout le site',
            timestamp: new Date().toISOString(),
            userId: req.user?.id || 0
          };
          
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(notification));
            }
          });
        }
        
        res.json({ 
          success: true, 
          message: "Animation Enedis améliorée appliquée avec succès sur tout le site.",
          animationId: enhancedAnimationId
        });
      } else {
        throw new Error("Animation Électrique Complète Enedis non trouvée");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'application de l'animation Enedis améliorée:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Une erreur est survenue lors de l'application de l'animation Enedis améliorée" 
      });
    }
  });
  
  app.delete("/api/ui-animations/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Cette fonction n'existe pas encore dans storage.ts
      // Nous devons l'ajouter
      res.status(501).json({
        success: false,
        message: "Fonctionnalité non implémentée"
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erreur lors de la suppression de l'animation" 
      });
    }
  });
  
  // Protected route to get all service requests (for admin dashboard)
  app.get("/api/service-requests", requireAuth, async (req, res) => {
    try {
      // Vérifier le rôle et l'ID de l'utilisateur
      const userRole = req.user?.role || "";
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }
      
      let serviceRequestsList = [];
      
      // Si l'utilisateur est agent, ne renvoyer que les demandes qui lui sont assignées
      if (userRole.toLowerCase() === USER_ROLES.AGENT.toLowerCase()) {
        // Filtrer uniquement les demandes assignées à cet agent
        serviceRequestsList = await db
          .select()
          .from(serviceRequests)
          .where(eq(serviceRequests.assignedTo, userId))
          .orderBy(desc(serviceRequests.updatedAt));
          
        console.log(`Agent ${userId} - Récupération de ${serviceRequestsList.length} demandes assignées`);
      } else {
        // Pour les administrateurs et managers, récupérer toutes les demandes
        serviceRequestsList = await storage.getAllServiceRequests();
      }
      
      res.json(serviceRequestsList);
    } catch (error) {
      console.error("Error retrieving all service requests:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des demandes" 
      });
    }
  });
  
  // Route pour envoyer un rappel de rendez-vous
  app.post("/api/service-requests/:id/send-reminder", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { type, includeCalendarInvite } = req.body;
      
      // Vérifier que la demande existe et a un rendez-vous planifié
      const serviceRequest = await storage.getServiceRequest(Number(id));
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande de service non trouvée" 
        });
      }
      
      if (!serviceRequest.scheduledDate) {
        return res.status(400).json({ 
          success: false, 
          message: "Cette demande n'a pas de rendez-vous planifié" 
        });
      }
      
      // Préparer les données pour l'email de rappel
      const reminderData: AppointmentReminderEmailData = {
        referenceNumber: serviceRequest.referenceNumber,
        clientName: serviceRequest.name,
        clientEmail: serviceRequest.email,
        clientPhone: serviceRequest.phone,
        appointmentDate: serviceRequest.scheduledDate,
        timeSlot: serviceRequest.scheduledTime || undefined,
        address: serviceRequest.address,
        postalCode: serviceRequest.postalCode,
        city: serviceRequest.city,
        serviceType: serviceRequest.serviceType,
        enedisReferenceNumber: serviceRequest.enedisReferenceNumber || undefined
      };
      
      // Envoyer l'email de rappel
      const emailSent = await sendAppointmentReminder(reminderData);
      
      if (!emailSent) {
        throw new Error("Échec de l'envoi de l'email de rappel");
      }
      
      // Mettre à jour le statut d'envoi du rappel dans la base de données
      await db.update(serviceRequests)
        .set({ 
          hasReminderSent: true,
          updatedAt: new Date()
        })
        .where(eq(serviceRequests.id, Number(id)));
      
      // Ajouter une entrée dans les logs d'activité
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          action: "appointment_reminder_sent", // Utiliser la valeur directe à la place de la constante
          entityType: "service_request",
          entityId: Number(id),
          details: JSON.stringify({
            referenceNumber: serviceRequest.referenceNumber,
            clientEmail: serviceRequest.email,
            appointmentDate: serviceRequest.scheduledDate
          })
        });
      }
      
      // Créer une notification pour tous les utilisateurs
      try {
        await db.insert(notifications).values({
          type: "appointment_reminder",
          title: "Rappel de rendez-vous envoyé",
          message: `Un rappel a été envoyé au client ${serviceRequest.name} pour le rendez-vous du ${new Date(serviceRequest.scheduledDate).toLocaleDateString('fr-FR')}`,
          read: false,
          data: JSON.stringify({
            referenceNumber: serviceRequest.referenceNumber,
            id: Number(id)
          })
        });
        
        // Utiliser la fonction de notification WebSocket si disponible
        const wsService = globalThis.wsNotificationService;
        if (wsService) {
          wsService.notifyChannel("demandes", {
            type: "appointment_reminder_sent",
            message: `Un rappel de rendez-vous a été envoyé pour la demande ${serviceRequest.referenceNumber}`,
            data: {
              id: Number(id),
              referenceNumber: serviceRequest.referenceNumber
            }
          });
        }
      } catch (notifError) {
        console.error("Erreur lors de la création de la notification:", notifError);
        // Ne pas bloquer le processus si la notification échoue
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Rappel envoyé avec succès" 
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du rappel de rendez-vous:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'envoi du rappel de rendez-vous" 
      });
    }
  });

  // API routes for leads (progressive form saving)
  app.post("/api/leads/create", async (req, res) => {
    try {
      // Créer un nouveau lead avec les données initiales (étape 1)
      const leadData = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers["user-agent"] || "";
      
      // Générer un numéro de référence unique pour le lead (format LEAD-)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const randomCode = Math.random().toString(36).substr(2, 3).toUpperCase();
      const referenceNumber = `LEAD-${year}-${month}${day}-${randomCode}`;
      
      // ENREGISTREMENT PERFECTIONNÉ DU LEAD AVEC RÉFÉRENCE UNIQUE
      console.log('🎯 CRÉATION LEAD - Données reçues:', JSON.stringify(leadData, null, 2));
      console.log('🎯 RÉFÉRENCE GÉNÉRÉE:', referenceNumber);
      
      // Créer le lead directement avec Drizzle en utilisant les colonnes existantes
      const [createdLead] = await db.insert(leads).values({
        referenceNumber: referenceNumber,
        firstName: leadData.prenom || '',
        lastName: leadData.nom || '',
        email: leadData.email || '',
        phone: leadData.telephone || '',
        clientType: leadData.clientType || 'particulier',
        nom: leadData.nom || '',
        prenom: leadData.prenom || '',
        telephone: leadData.telephone || '',
        name: `${leadData.prenom || ''} ${leadData.nom || ''}`.trim(),
        status: 'new',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log('✅ LEAD CRÉÉ AVEC SUCCÈS:', {
        id: createdLead?.id,
        reference: referenceNumber,
        nom: leadData.nom,
        email: leadData.email
      });
      
      // Envoyer une notification par email pour ce nouveau lead
      try {
        // Récupérer l'adresse email de notification configurée
        const [notificationEmailConfig] = await db.select()
          .from(systemConfigs)
          .where(eq(systemConfigs.configKey, 'notification_email'));
        
        // Liste des emails à qui envoyer les notifications
        const notificationEmail = notificationEmailConfig?.configValue || 'marina.alves@portail-electricite.com';
        
        // Liste d'emails spécifiés par l'utilisateur
        const emailRecipients = [
          notificationEmail,
          'Bonjour@portail-electricite.com',
          'Bonjour@portail-electricite.com'
        ];
        
        // Préparer UNIQUEMENT les données de l'étape 1 du formulaire
        const emailData = {
          referenceNumber,
          // Champs obligatoires de l'étape 1
          clientType: leadData.clientType || 'Non spécifié',
          nom: leadData.nom || 'Non spécifié', 
          prenom: leadData.prenom || 'Non spécifié',
          email: leadData.email || 'Non spécifié',
          telephone: leadData.telephone || 'Non spécifié',
          
          // Champs conditionnels (si client ≠ particulier)
          societe: leadData.societe || null,
          siren: leadData.siren || null,
          
          // Métadonnées de soumission
          submissionDate: new Date(),
          ipAddress: ipAddress || 'Non disponible',
          userAgent: userAgent || 'Non disponible'
        };
        
        // Logs détaillés pour le diagnostic
        console.log('🎯 TENTATIVE D\'ENVOI EMAIL - ÉTAPE 1');
        console.log('📧 Destinataires:', emailRecipients);
        console.log('📋 Données email:', JSON.stringify(emailData, null, 2));
        
        // NOTIFICATION IMMÉDIATE - Service email perfectionné activé
        const emailService = await import('./email-service');
        const emailResult = await emailService.sendLeadNotification(emailData);
        
        if (emailResult.success) {
          console.log(`✅ NOTIFICATION LEAD ENVOYÉE: ${emailResult.messageId} pour ${referenceNumber}`);
        } else {
          console.log(`❌ ÉCHEC NOTIFICATION LEAD pour ${referenceNumber}:`, emailResult.error);
        }
      } catch (emailError) {
        // Ne pas bloquer le processus si l'envoi d'email échoue
        console.error("Erreur lors de l'envoi de la notification par email:", emailError);
      }
      
      // Retourner le token comme identifiant unique pour ce lead
      res.status(201).json({
        success: true,
        token: createdLead.sessionToken,
        referenceNumber,
        message: "Lead créé avec succès"
      });
    } catch (error: any) {
      console.error("Error creating lead:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la création du lead",
        error: error.message
      });
    }
  });

  // Créer un nouveau lead depuis l'interface admin
  // TODO: En production, réactiver l'authentification et le contrôle des rôles
  // app.post("/api/leads/admin-create", requireAuth, requireAdmin, async (req, res) => {
  app.post("/api/leads/admin-create", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Récupérer les données du lead depuis le corps de la requête
      const leadData = req.body;
      
      // Générer un numéro de référence unique pour le lead
      const reference = `REF-${Math.floor(Math.random() * 10000)}-${Date.now().toString().substring(7)}`;
      
      // Créer le lead avec les données fournies
      const lead = await storage.createLead({
        ...leadData,
        // S'assurer que les champs obligatoires sont présents
        firstName: leadData.firstName || "",
        lastName: leadData.lastName || "",
        email: leadData.email || "",
        phone: leadData.phone || "",
        serviceType: leadData.serviceType || "electricity",
        requestType: leadData.requestType || "new_connection",
        // Le statut sera géré par la base de données, pas besoin de le spécifier ici
        referenceNumber: reference,
        ipAddress: "admin-created",
        userAgent: "admin-interface",
        // Marquer comme étant créé par l'administrateur
        createdByAdmin: true,
        // Définir le nombre d'étapes complétées si toutes les informations sont fournies
        completedSteps: (leadData.firstName && leadData.lastName && leadData.email && leadData.phone) ? 1 : 0,
      });
      
      if (!lead) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la création du lead"
        });
      }
      
      // Enregistrer l'activité
      try {
        await storage.logActivity({
          userId: req.user ? (req.user as any).id : 1, // Utiliser l'ID 1 (admin) par défaut pour le mode développement
          action: ACTIVITY_ACTIONS.CREATE,
          entityType: "lead",
          entityId: lead.id,
          details: `Lead créé manuellement via l'interface admin`
        });
      } catch (logError) {
        console.error("Erreur lors de l'enregistrement de l'activité:", logError);
        // Ne pas bloquer le processus si l'enregistrement de l'activité échoue
      }
      
      res.status(201).json({
        success: true,
        message: "Lead créé avec succès",
        token: lead.sessionToken,
        referenceNumber: reference
      });
    } catch (error: any) {
      console.error("Error creating admin lead:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la création du lead",
        error: error.message
      });
    }
  });

  // 🚀 ENDPOINT OPTIMISÉ - Création prelead avec notification en un seul appel
  app.post("/api/leads/prelead-with-notification", async (req, res) => {
    try {
      const {
        clientType,
        nom,
        prenom,
        email,
        phone,
        raisonSociale,
        siren,
        nomCollectivite,
        sirenCollectivite,
        sendNotification = true
      } = req.body;

      // Validation des champs requis
      if (!nom || !prenom || !email || !phone || !clientType) {
        return res.status(400).json({
          success: false,
          message: "Données manquantes"
        });
      }

      // Générer une référence LEAD-
      const reference = `LEAD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Créer le lead en base
      const lead = await storage.createLead({
        firstName: prenom,
        lastName: nom,
        email,
        phone,
        clientType,
        serviceType: "electricity",
        status: LEAD_STATUS.NEW,
        referenceNumber: reference,
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        completedSteps: 1,
        // Champs spécifiques selon le type de client
        ...(clientType === "professionnel" && { 
          company: raisonSociale,
          siret: siren 
        }),
        ...(clientType === "collectivite" && { 
          company: nomCollectivite,
          siret: sirenCollectivite 
        })
      });

      if (!lead) {
        return res.status(500).json({
          success: false,
          message: "Erreur création lead"
        });
      }

      // Si notification demandée, l'envoyer en arrière-plan
      if (sendNotification) {
        // Envoi asynchrone pour ne pas bloquer la réponse
        setTimeout(async () => {
          try {
            await fetch("http://localhost:5000/api/notifications/lead-created", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nom,
                prenom,
                email,
                telephone: phone,
                clientType,
                raisonSociale,
                siren,
                nomCollectivite,
                sirenCollectivite,
                referenceNumber: reference,
                timestamp: new Date().toISOString()
              })
            });
            console.log('✅ Notification envoyée en arrière-plan pour:', reference);
          } catch (notifError) {
            console.error('❌ Erreur notification arrière-plan:', notifError);
          }
        }, 100);
      }

      // Réponse immédiate
      res.json({
        success: true,
        leadId: lead.id,
        referenceNumber: reference,
        message: "Prelead créé avec succès"
      });

    } catch (error: any) {
      console.error("Erreur endpoint prelead optimisé:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur"
      });
    }
  });

  // Pour le tableau de bord admin - liste des leads incomplets
  // Route pour récupérer tous les leads
  app.get("/api/leads", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Récupérer tous les leads à partir du storage
      const result = await storage.getAllLeads(page, limit);
      
      res.json({
        success: true,
        leads: result.leads,
        pagination: {
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          currentPage: page,
          perPage: limit
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des leads:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des leads"
      });
    }
  });

  // Route pour rechercher des leads par référence, nom, email, etc.
  app.get("/api/leads/search", async (req, res) => {
    try {
      const { term } = req.query;
      
      if (!term || typeof term !== 'string') {
        return res.status(400).json({ success: false, message: "Le terme de recherche est requis" });
      }
      
      // Verifions d'abord si c'est une référence exacte LEAD-
      if (term.startsWith('LEAD-') || term.toUpperCase().startsWith('LEAD-')) {
        console.log("Recherche de la référence exacte LEAD-:", term);
        // Recherche prioritaire par référence exacte (pour la fonctionnalité de recherche rapide)
        const exactRefResults = await db.select()
          .from(leads)
          .where(sql`${leads.referenceNumber} = ${term}`)
          .limit(1);
        
        if (exactRefResults.length > 0) {
          return res.status(200).json({ success: true, results: exactRefResults });
        }
      }
      
      // Vérifions ensuite si c'est un email exact
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(term)) {
        console.log("Recherche de l'email exact:", term);
        const exactEmailResults = await db.select()
          .from(leads)
          .where(sql`${leads.email} = ${term}`)
          .limit(1);
        
        if (exactEmailResults.length > 0) {
          return res.status(200).json({ success: true, results: exactEmailResults });
        }
      }
      
      // Sinon, recherche générale avec ILIKE
      const searchTerm = `%${term}%`;
      const results = await db.select()
        .from(leads)
        .where(sql`
          ${leads.firstName} ILIKE ${searchTerm} OR
          ${leads.lastName} ILIKE ${searchTerm} OR
          ${leads.email} ILIKE ${searchTerm} OR
          ${leads.referenceNumber} ILIKE ${searchTerm} OR
          ${leads.phone} ILIKE ${searchTerm}
        `)
        .orderBy(sql`
          CASE 
            WHEN ${leads.referenceNumber} ILIKE ${term} THEN 1
            WHEN ${leads.email} ILIKE ${term} THEN 2
            ELSE 3
          END
        `)
        .limit(10);
      
      res.status(200).json({ success: true, results });
    } catch (error) {
      console.error("Erreur lors de la recherche de leads:", error);
      res.status(500).json({ success: false, message: "Erreur lors de la recherche de leads" });
    }
  });
  
  // Récupérer les leads récents
  app.get("/api/leads/recent", async (req, res) => {
    try {
      // Récupérer les leads récents triés par date de création (les plus récents d'abord)
      const recentLeads = await db.select()
        .from(leads)
        .orderBy(desc(leads.createdAt))
        .limit(10);
      
      return res.status(200).json({
        success: true,
        leads: recentLeads
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des leads récents:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des leads récents"
      });
    }
  });
  
  app.get("/api/leads/incomplete", async (req, res) => {
    try {
      // En développement, pas besoin d'authentification 
      // En production, décommenter ce bloc
      /*
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }
      */
      
      // Récupérer les paramètres de pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Valider les paramètres de pagination
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Paramètres de pagination invalides"
        });
      }
      
      const result = await storage.getIncompletedLeads(page, limit);
      res.json({
        success: true,
        leads: result.leads,
        pagination: {
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          currentPage: page,
          perPage: limit
        }
      });
    } catch (error: any) {
      console.error("Error fetching incomplete leads:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des leads incomplets",
        error: error.message
      });
    }
  });

  // Récupérer un lead via son token de session
  app.get("/api/leads/token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Vérification que le token n'est pas un mot-clé réservé
      if (token === 'incomplete') {
        return res.status(400).json({
          success: false,
          message: "Token invalide"
        });
      }
      
      const lead = await storage.getLeadByToken(token);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      res.json({
        success: true,
        lead
      });
    } catch (error: any) {
      console.error("Error fetching lead:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération du lead",
        error: error.message
      });
    }
  });
  
  // Récupérer un lead via son ID (format compatible avec le dialogue de détails)
  // TODO: En production, réactiver l'authentification
  // app.get("/api/leads/:id", requireAuth, async (req, res) => {
  app.get("/api/leads/:id", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          message: "ID de lead invalide"
        });
      }
      
      // Utiliser getLeadById au lieu de getLeadByToken
      const lead = await storage.getLeadById(leadId);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      // Générer une référence pour les leads qui n'en ont pas encore
      let formattedLead = lead;
      if (!lead.referenceNumber) {
        formattedLead = {
          ...lead,
          referenceNumber: `REF-${lead.id}-${Math.floor(Math.random() * 10000)}`
        };
      }
      
      // Ajouter la géolocalisation pour l'adresse IP
      if (formattedLead.ipAddress) {
        try {
          const geoData = getLocationFromIp(formattedLead.ipAddress);
          // Ajouter les données de géolocalisation sans modifier le type
          (formattedLead as any).geoLocation = geoData;
        } catch (geoError) {
          console.error(`Erreur lors de la géolocalisation de l'IP ${formattedLead.ipAddress}:`, geoError);
        }
      }
      
      // Récupérer les données de paiement s'il s'agit d'une demande finalisée
      let paymentData = null;
      if (lead.convertedToRequest && lead.convertedRequestId) {
        const serviceRequest = await storage.getServiceRequest(lead.convertedRequestId);
        if (serviceRequest && serviceRequest.paymentId) {
          try {
            if (stripe) {
              const payment = await stripe.paymentIntents.retrieve(serviceRequest.paymentId);
              paymentData = payment;
            }
          } catch (stripeError) {
            console.error("Erreur lors de la récupération des données de paiement Stripe:", stripeError);
          }
        }
      }
      
      res.json({
        success: true,
        lead: formattedLead,
        paymentData
      });
    } catch (error: any) {
      console.error("Error fetching lead details:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des détails du lead",
        error: error.message
      });
    }
  });
  
  // Mettre à jour le statut d'un lead
  app.patch("/api/leads/:id/status", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !Object.values(LEAD_STATUS).includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: "Statut invalide" 
        });
      }
      
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ 
          success: false, 
          message: "Lead non trouvé" 
        });
      }
      
      const updatedLead = await storage.updateLeadStatus(leadId, {
        status,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: 1 // TODO: utiliser req.user?.id quand l'authentification sera réactivée
      });
      
      // Enregistrer l'activité
      await storage.logActivity({
        userId: 1, // TODO: utiliser req.user?.id quand l'authentification sera réactivée
        action: ACTIVITY_ACTIONS.UPDATE,
        entityType: "lead",
        entityId: leadId,
        details: `Statut mis à jour: ${status}`
      });
      
      res.json({ 
        success: true, 
        message: "Statut mis à jour", 
        lead: updatedLead 
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la mise à jour du statut" 
      });
    }
  });
  
  // Planifier un rappel pour un lead
  app.post("/api/leads/schedule-callback", async (req, res) => {
    try {
      const { leadId, callbackDate, callbackNotes, status } = req.body;
      
      if (!leadId || !callbackDate) {
        return res.status(400).json({ 
          success: false, 
          message: "Données manquantes pour la programmation du rappel" 
        });
      }
      
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ 
          success: false, 
          message: "Lead non trouvé" 
        });
      }
      
      // Mettre à jour le lead avec les informations de rappel
      const updatedLead = await storage.updateLeadCallback(leadId, {
        callbackDate: new Date(callbackDate),
        callbackNotes,
        status: status || LEAD_STATUS.CALLBACK_SCHEDULED,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: 1 // TODO: utiliser req.user?.id quand l'authentification sera réactivée
      });
      
      // Enregistrer l'activité
      await storage.logActivity({
        userId: 1, // TODO: utiliser req.user?.id quand l'authentification sera réactivée
        action: ACTIVITY_ACTIONS.SCHEDULE,
        entityType: "lead",
        entityId: leadId,
        details: `Rappel programmé pour le ${new Date(callbackDate).toLocaleString('fr-FR')}`
      });
      
      res.json({ 
        success: true, 
        message: "Rappel programmé", 
        lead: updatedLead 
      });
    } catch (error) {
      console.error("Erreur lors de la programmation du rappel:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la programmation du rappel" 
      });
    }
  });

  app.put("/api/leads/token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { data, step } = req.body;
      
      if (!data || step === undefined) {
        return res.status(400).json({
          success: false,
          message: "Données manquantes pour la mise à jour"
        });
      }
      
      // Mettre à jour les données du lead et le numéro d'étape complétée
      const lead = await storage.updateLead(token, data, step);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      res.json({
        success: true,
        lead,
        message: "Lead mis à jour avec succès"
      });
    } catch (error: any) {
      console.error("Error updating lead:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la mise à jour du lead",
        error: error.message
      });
    }
  });

  app.post("/api/leads/token/:token/complete-step", async (req, res) => {
    try {
      const { token } = req.params;
      const { step } = req.body;
      
      if (step === undefined) {
        return res.status(400).json({
          success: false,
          message: "Numéro d'étape manquant"
        });
      }
      
      const lead = await storage.completeLeadStep(token, step);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      res.json({
        success: true,
        lead,
        message: `Étape ${step} complétée avec succès`
      });
    } catch (error: any) {
      console.error("Error completing lead step:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la complétion de l'étape",
        error: error.message
      });
    }
  });

  app.post("/api/leads/token/:token/finalize", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Marquer le lead comme complété
      const lead = await storage.completeLead(token);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      // Générer un numéro de référence unique pour la demande de service
      const referenceNumber = `REF-${Math.floor(Math.random() * 10000)}-${Date.now().toString().substring(7)}`;
      
      // Convertir le lead en demande de service
      const result = await storage.convertLeadToServiceRequest(token, referenceNumber);
      
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Impossible de convertir le lead en demande de service"
        });
      }
      
      res.json({
        success: true,
        referenceNumber: result.serviceRequest.referenceNumber,
        message: "Lead converti en demande de service avec succès"
      });
    } catch (error: any) {
      console.error("Error finalizing lead:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la finalisation du lead",
        error: error.message
      });
    }
  });


  // Route pour convertir un lead en demande à partir de son ID (admin uniquement)
  app.post("/api/leads/:id/convert", requireAuth, requireAdmin, async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          message: "ID de lead invalide"
        });
      }
      
      // Récupérer le lead depuis la base de données
      const lead = await storage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      // Générer un numéro de référence
      const date = new Date();
      const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const referenceNumber = `REF-${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}-${randomPart}`;
      
      // Convertir le lead en demande
      const result = await storage.convertLeadToServiceRequestById(leadId, referenceNumber);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de convertir le lead en demande de service"
        });
      }
      
      // Notification par email pour les nouvelles demandes si l'email est disponible
      if (lead.email) {
        try {
          const { sendNewSubmissionNotification } = await import('./email-service');
          const notificationEmail = await storage.getSystemConfig('notification_email');
          
          // Créer l'objet de données pour l'email
          const emailData = {
            referenceNumber,
            clientName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client',
            clientEmail: lead.email || '',
            clientPhone: lead.phone || '',
            clientType: lead.clientType || 'Non spécifié',
            submissionDate: new Date(),
            serviceType: lead.serviceType || 'Raccordement électrique',
            address: lead.address || '',
            postalCode: lead.postalCode || '',
            city: lead.city || ''
          };
          
          // Envoyer l'email de notification
          if (notificationEmail) {
            sendNewSubmissionNotification(emailData, notificationEmail)
              .then(success => {
                if (success) {
                  console.log(`Notification email envoyée à ${notificationEmail} pour la demande ${referenceNumber}`);
                } else {
                  console.warn(`Échec de l'envoi de la notification email pour la demande ${referenceNumber}`);
                }
              })
              .catch(emailError => {
                console.error("Erreur lors de l'envoi de la notification email:", emailError);
                // Ne pas bloquer le traitement en cas d'erreur d'email
              });
          }
        } catch (emailError) {
          console.error("Erreur lors de la préparation de la notification email:", emailError);
          // Ne pas bloquer le traitement en cas d'erreur d'email
        }
      }
      
      return res.status(200).json({
        success: true,
        message: "Lead converti en demande de service avec succès",
        referenceNumber,
        serviceRequestId: result.serviceRequestId
      });
    } catch (error: any) {
      console.error("Erreur lors de la conversion du lead:", error);
      return res.status(500).json({
        success: false,
        message: `Erreur lors de la conversion du lead: ${error.message || "Erreur inconnue"}`
      });
    }
  });
  
  app.post("/api/leads/:id/assign", requireAuth, requireAdmin, async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "ID d'utilisateur manquant"
        });
      }
      
      const lead = await storage.assignLeadToUser(leadId, userId);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead non trouvé"
        });
      }
      
      // Enregistrer l'activité
      await storage.logActivity({
        userId: (req.user as any).id,
        action: ACTIVITY_ACTIONS.ASSIGN,
        entityType: "lead",
        entityId: leadId,
        details: `Lead assigné à l'utilisateur ${userId}`
      });
      
      res.json({
        success: true,
        lead,
        message: "Lead assigné avec succès"
      });
    } catch (error: any) {
      console.error("Error assigning lead:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'assignation du lead",
        error: error.message
      });
    }
  });

  // API routes for service connection requests
  app.post("/api/service-requests", async (req, res) => {
    try {
      // Validate the request body against our schema
      // Afficher les données brutes pour le débogage
      console.log("Données reçues:", JSON.stringify(req.body, null, 2));
      
      const validationResult = serviceRequestValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        // Convert Zod errors to readable format
        const validationError = fromZodError(validationResult.error);
        console.log("Erreurs de validation:", JSON.stringify(validationError.details, null, 2));
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: validationError.details 
        });
      }
      
      // Générer un numéro de référence unique au format REF-XXXX-XXXXXX
      const referenceNumber = req.body.reference || `REF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Omit fields that don't need to be stored in the database
      const { useDifferentBillingAddress, ...dataToStore } = validationResult.data;
      
      // Vérifier si nous avons reçu la valeur "36-jaune" originale
      let comments = dataToStore.comments || "";
      if (req.body.powerRequired === "36-jaune") {
        // Ajouter une note concernant le tarif jaune aux commentaires
        const tarifJauneNote = "[TARIF JAUNE] Option tarifaire jaune sélectionnée.";
        comments = comments ? `${tarifJauneNote}\n\n${comments}` : tarifJauneNote;
      }
      
      // ENREGISTREMENT PERFECTIONNÉ DE LA DEMANDE COMPLÈTE AVEC RÉFÉRENCE UNIQUE
      console.log('🎯 CRÉATION DEMANDE COMPLÈTE - Données validées:', {
        referenceNumber,
        clientName: dataToStore.name,
        email: dataToStore.email,
        serviceType: dataToStore.serviceType
      });
      
      const serviceRequest = await storage.createServiceRequest({
        ...dataToStore,
        comments,
        referenceNumber
      });
      
      // ENSURE DATABASE TRANSACTION COMPLETES
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // VERIFY THE SERVICE REQUEST WAS SAVED
      const verifyRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!verifyRequest) {
        throw new Error("Service request creation failed - not found in database");
      }
      
      console.log('✅ DEMANDE COMPLÈTE CRÉÉE AVEC SUCCÈS:', {
        id: serviceRequest.id,
        reference: serviceRequest.referenceNumber,
        client: serviceRequest.name,
        email: serviceRequest.email
      });
      
      // Envoi d'une notification par email COMPLÈTE pour la nouvelle demande
      try {
        const { sendNewSubmissionNotification } = await import('./email-service');
        
        // Préparer TOUTES les données du formulaire pour l'email complet
        const notificationData = {
          // Informations de référence
          referenceNumber: serviceRequest.referenceNumber,
          submissionDate: new Date(),
          
          // === INFORMATIONS PERSONNELLES ===
          clientName: serviceRequest.name,
          clientEmail: serviceRequest.email,
          clientPhone: serviceRequest.phone,
          clientType: serviceRequest.clientType,
          
          // Informations entreprise (si applicable)
          company: serviceRequest.company || null,
          siret: serviceRequest.siret || null,
          
          // === INFORMATIONS DE LOCALISATION ===
          address: serviceRequest.address,
          postalCode: serviceRequest.postalCode,
          city: serviceRequest.city,
          
          // Adresse de facturation (si différente)
          billingAddress: serviceRequest.billingAddress || null,
          billingPostalCode: serviceRequest.billingPostalCode || null,
          billingCity: serviceRequest.billingCity || null,
          
          // === DÉTAILS TECHNIQUES ===
          serviceType: serviceRequest.serviceType || "Raccordement électrique",
          requestType: serviceRequest.requestType,
          buildingType: serviceRequest.buildingType,
          projectStatus: serviceRequest.projectStatus,
          
          // Puissance et configuration électrique
          powerRequired: serviceRequest.powerRequired,
          phaseType: serviceRequest.phaseType,
          connectionDelay: serviceRequest.connectionDelay,
          
          // Informations permis (si applicable)
          permitNumber: serviceRequest.permitNumber || null,
          permitDeliveryDate: serviceRequest.permitDeliveryDate || null,
          
          // === INFORMATIONS ARCHITECTE ===
          hasArchitect: serviceRequest.hasArchitect || false,
          architectName: serviceRequest.architectName || null,
          architectPhone: serviceRequest.architectPhone || null,
          architectEmail: serviceRequest.architectEmail || null,
          
          // === DÉLAIS ET PLANIFICATION ===
          desiredCompletionDate: serviceRequest.desiredCompletionDate || null,
          
          // === COMMENTAIRES ET NOTES ===
          comments: serviceRequest.comments || null,
          
          // === MÉTADONNÉES TECHNIQUES ===
          ipAddress: req.ip || 'Non disponible',
          userAgent: req.headers["user-agent"] || 'Non disponible',
          
          // === DONNÉES COMPLÈTES DU FORMULAIRE ORIGINAL ===
          formData: req.body // Toutes les données brutes du formulaire
        };
        
        console.log('📧 ENVOI EMAIL COMPLET - FORMULAIRE FINALISÉ');
        console.log('📬 Destinataire principal: contact@portail-electricite.com');
        console.log('📋 Référence générée:', serviceRequest.referenceNumber);
        
        // Email envoyé via la route /api/notifications/request-completed uniquement
      } catch (emailError) {
        console.error("Erreur lors de la préparation de la notification email:", emailError);
        // Ne pas bloquer le traitement en cas d'erreur d'email
      }
      
      // Return success with the reference number
      res.status(201).json({
        success: true,
        message: "Demande envoyée avec succès",
        referenceNumber: serviceRequest.referenceNumber
      });
    } catch (error) {
      console.error("Error submitting service request:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du traitement de votre demande"
      });
    }
  });
  
  // API route for service connection requests from specialized forms
  app.post("/api/service-requests/create", async (req, res) => {
    try {
      // Validate the request body against our schema
      console.log("Données reçues (formulaire spécialisé):", JSON.stringify(req.body, null, 2));
      
      const validationResult = serviceRequestValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        // Convert Zod errors to readable format
        const validationError = fromZodError(validationResult.error);
        console.log("Erreurs de validation:", JSON.stringify(validationError.details, null, 2));
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: validationError.details 
        });
      }
      
      // Importer l'utilitaire de génération de références
      const { generateReference } = await import('./reference-generator');
      
      // S'assurer que le type de service est bien défini pour les formulaires spécialisés
      // Par défaut on utilisera le type 'specialized' qui générera une référence REF-
      const serviceType = validationResult.data.serviceType || 'specialized';
      
      // Générer une référence au format REF- pour les formulaires spécialisés
      const referenceNumber = generateReference(serviceType);
      
      // Omit fields that don't need to be stored in the database
      const { useDifferentBillingAddress, ...dataToStore } = validationResult.data;
      
      // Vérifier si nous avons reçu la valeur "36-jaune" originale
      let comments = dataToStore.comments || "";
      if (req.body.powerRequired === "36-jaune") {
        // Ajouter une note concernant le tarif jaune aux commentaires
        const tarifJauneNote = "[TARIF JAUNE] Option tarifaire jaune sélectionnée.";
        comments = comments ? `${tarifJauneNote}\n\n${comments}` : tarifJauneNote;
      }
      
      // Store the service request
      const serviceRequest = await storage.createServiceRequest({
        ...dataToStore,
        comments,
        referenceNumber
      });
      
      // Envoi d'une notification par email pour la nouvelle demande
      try {
        const { sendNewSubmissionNotification } = await import('./email-service');
        
        // Préparer les données pour l'email
        const notificationData = {
          referenceNumber: serviceRequest.referenceNumber,
          clientName: serviceRequest.name,
          clientEmail: serviceRequest.email,
          clientPhone: serviceRequest.phone,
          clientType: serviceRequest.clientType,
          submissionDate: new Date(),
          serviceType: serviceRequest.serviceType || "Raccordement électrique spécialisé",
          address: serviceRequest.address,
          postalCode: serviceRequest.postalCode,
          city: serviceRequest.city
        };
        
        // Récupérer l'adresse email de notification configurée
        const [notificationEmailConfig] = await db.select()
          .from(systemConfigs)
          .where(eq(systemConfigs.configKey, 'notification_email'));
          
        // Liste des emails à qui envoyer les notifications (la fonction getNotificationEmails s'assurera 
        // que toutes les adresses par défaut sont bien incluses)
        
        // Envoyer la notification - La fonction sendNewSubmissionNotification utilisera la liste complète
        // des destinataires incluant marina.alves@portail-electricite.com et contact@portail-electricite.com
        sendNewSubmissionNotification(notificationData)
          .then(success => {
            if (success) {
              console.log(`Notification email envoyée pour la demande ${serviceRequest.referenceNumber}`);
            } else {
              console.warn(`Échec de l'envoi de la notification email pour la demande ${serviceRequest.referenceNumber}`);
            }
          })
          .catch(emailError => {
            console.error("Erreur lors de l'envoi de la notification email:", emailError);
            // Ne pas bloquer le traitement en cas d'erreur d'email
          });
      } catch (emailError) {
        console.error("Erreur lors de la préparation de la notification email:", emailError);
        // Ne pas bloquer le traitement en cas d'erreur d'email
      }
      
      // Return success with the reference number
      res.status(201).json({
        success: true,
        message: "Demande envoyée avec succès",
        referenceNumber: serviceRequest.referenceNumber
      });
    } catch (error) {
      console.error("Error submitting specialized service request:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du traitement de votre demande"
      });
    }
  });
  
  // Route pour créer une intention de paiement avec Stripe
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Accepter les deux formats pour la référence (rétro-compatibilité)
      const { amount, referenceNumber, reference, createOnly } = req.body;
      const finalReference = reference || referenceNumber;
      
      // Paramètres obligatoires
      if (!amount) {
        return res.status(400).json({ 
          success: false, 
          message: "Le montant est requis" 
        });
      }
      
      if (!finalReference) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence est requise" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(finalReference);
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence" 
        });
      }
      
      // Vérifier si la demande a déjà été payée
      if (serviceRequest.paymentStatus === 'paid') {
        return res.status(400).json({
          success: false,
          message: "Cette demande a déjà été payée"
        });
      }
      
      // Vérifier si un PaymentIntent existe déjà pour cette demande
      // Si oui et qu'il est en requires_payment_method, on peut le réutiliser plutôt que d'en créer un nouveau
      let existingPaymentIntent;
      if (serviceRequest.paymentId && stripe) {
        try {
          existingPaymentIntent = await stripe.paymentIntents.retrieve(serviceRequest.paymentId);
          console.log(`PaymentIntent existant trouvé pour ${finalReference}: ${existingPaymentIntent.id} (${existingPaymentIntent.status})`);
          
          // Si le paiement est déjà en cours de traitement, on ne peut pas le modifier
          if (existingPaymentIntent.status === 'processing') {
            return res.status(400).json({
              success: false,
              message: "Un paiement est déjà en cours de traitement pour cette demande"
            });
          }
          
          // Si le paiement est en attente d'une méthode de paiement, on peut réutiliser le même PaymentIntent
          if (existingPaymentIntent.status === 'requires_payment_method') {
            console.log(`Réutilisation du PaymentIntent ${existingPaymentIntent.id} qui est en attente d'une méthode de paiement`);
            return res.json({
              success: true,
              clientSecret: existingPaymentIntent.client_secret,
              paymentIntentId: existingPaymentIntent.id,
              reused: true
            });
          }
        } catch (error) {
          console.warn(`Impossible de récupérer le PaymentIntent existant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          // On continue pour en créer un nouveau
        }
      }
      
      // Vérifier si Stripe est configuré
      if (!stripe) {
        return res.status(500).json({ 
          success: false, 
          message: "Stripe n'est pas configuré sur le serveur" 
        });
      }
      
      // Montant fixe de 129.80€ TTC converti en centimes
      const amountInCents = 12980;
      
      try {
        // Créer une intention de paiement avec Stripe avec validation améliorée
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'eur',
          metadata: {
            referenceNumber: finalReference,
            customerName: serviceRequest.name,
            customerEmail: serviceRequest.email,
            requestType: serviceRequest.requestType,
            createTime: new Date().toISOString(), // Ajouter l'horodatage de création
            userSubmitted: createOnly ? 'true' : 'false' // Indiquer si l'utilisateur a soumis le formulaire
          },
          receipt_email: serviceRequest.email, // Envoyer un reçu par email
          description: `Frais de service - Référence: ${finalReference}`,
          capture_method: 'automatic',
          confirm: false, // La confirmation sera gérée côté client
          setup_future_usage: 'off_session', // Paiement unique
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'always' // Permet 3D Secure et autres redirections de sécurité
          },
        });
        
        // Logger la création de l'intention de paiement
        console.log(`PaymentIntent créé pour ${amount}€, référence: ${finalReference}, ID: ${paymentIntent.id}, createOnly: ${createOnly ? 'OUI' : 'NON'}`);
        
        // Mettre à jour le status de la demande
        await storage.updateServiceRequestStatus(
          serviceRequest.id, 
          REQUEST_STATUS.PAYMENT_PENDING, 
          0 // 0 = système
        );
        
        // Stocker l'ID de paiement dans la demande
        await storage.updateServiceRequestPayment(
          serviceRequest.id,
          paymentIntent.id,
          'pending',
          amountInCents / 100
        );
        
        // Créer une entrée dans la table des paiements
        await storage.createPayment({
          paymentId: paymentIntent.id,
          referenceNumber: finalReference,
          amount: String(amountInCents / 100),
          status: "pending",
          method: "card",
          customerName: serviceRequest.name,
          customerEmail: serviceRequest.email,
          metadata: JSON.stringify({
            requestType: serviceRequest.requestType,
            serviceRequestId: serviceRequest.id.toString(),
            createOnly: createOnly ? true : false,
            createdAt: new Date().toISOString()
          })
        });
        
        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (stripeError) {
        console.error("Erreur Stripe:", stripeError);
        return res.status(400).json({ 
          success: false, 
          message: "Erreur lors de la création du paiement",
          error: stripeError instanceof Error ? stripeError.message : "Erreur inconnue"
        });
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la création de l'intention de paiement",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  // Route pour créer une intention de paiement multiple (x2, x3, etc.)
  app.post("/api/create-payment-intent-multiple", async (req, res) => {
    try {
      const { referenceNumber, multiplier = 1, createOnly = false } = req.body;
      
      // Validation des entrées
      if (!referenceNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence de la demande est requise" 
        });
      }
      
      if (isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
        return res.status(400).json({ 
          success: false, 
          message: "Le multiplicateur doit être un nombre entre 1 et 5" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence" 
        });
      }
      
      // Vérifier si la demande a déjà payé
      if (serviceRequest.paymentStatus === "paid") {
        return res.status(400).json({ 
          success: false, 
          message: "Cette demande a déjà été payée" 
        });
      }
      
      const finalReference = referenceNumber;
      
      // Vérifier si une intention de paiement existe déjà
      if (serviceRequest.paymentId && !createOnly) {
        try {
          // Récupérer l'intention de paiement existante
          const existingPaymentIntent = await stripe.paymentIntents.retrieve(serviceRequest.paymentId);
          
          if (existingPaymentIntent.status !== 'succeeded' && 
              existingPaymentIntent.status !== 'canceled') {
            console.log(`Réutilisation du PaymentIntent existant: ${existingPaymentIntent.id} pour la demande ${finalReference}`);
            return res.json({
              success: true,
              clientSecret: existingPaymentIntent.client_secret,
              paymentIntentId: existingPaymentIntent.id,
              reused: true
            });
          }
        } catch (error) {
          console.warn(`Impossible de récupérer le PaymentIntent existant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          // On continue pour en créer un nouveau
        }
      }
      
      // Vérifier si Stripe est configuré
      if (!stripe) {
        return res.status(500).json({ 
          success: false, 
          message: "Stripe n'est pas configuré sur le serveur" 
        });
      }
      
      // Montant de base 129.80€ TTC converti en centimes
      const baseAmountInCents = 12980;
      // Appliquer le multiplicateur
      const amountInCents = baseAmountInCents * multiplier;
      
      try {
        // Créer une intention de paiement avec Stripe avec montant majoré
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'eur',
          metadata: {
            referenceNumber: finalReference,
            customerName: serviceRequest.name,
            customerEmail: serviceRequest.email,
            requestType: serviceRequest.requestType,
            createTime: new Date().toISOString(),
            userSubmitted: createOnly ? 'true' : 'false',
            multiplier: multiplier.toString(),
            isMultiplePayment: 'true'
          }
        });
        
        // Mettre à jour la demande de service avec l'ID de l'intention de paiement
        if (!createOnly) {
          await storage.updateServiceRequestPayment(
            serviceRequest.id,
            paymentIntent.id,
            "pending",
            amountInCents / 100 // Convertir en euros
          );
        }
        
        // Si tout va bien, on retourne le client_secret pour finaliser le paiement côté client
        console.log(`PaymentIntent créé avec succès: ${paymentIntent.id} pour ${finalReference} (x${multiplier})`);
        
        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (stripeError) {
        console.error("Erreur Stripe:", stripeError);
        return res.status(400).json({ 
          success: false, 
          message: "Erreur lors de la création du paiement",
          error: stripeError instanceof Error ? stripeError.message : "Erreur inconnue"
        });
      }
    } catch (error) {
      console.error("Error creating multiple payment intent:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la création de l'intention de paiement multiple",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  // Attention: Routes plus spécifiques doivent être placées avant routes génériques avec paramètres
  // Get recent service requests for debugging/testing
  app.get("/api/service-requests/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (isNaN(limit) || limit < 1 || limit > 20) {
        return res.status(400).json({
          success: false,
          message: "Limite invalide. Doit être un nombre entre 1 et 20."
        });
      }
      
      const requests = await storage.getRecentServiceRequests(limit);
      
      res.json({
        success: true,
        requests
      });
    } catch (error) {
      console.error("Error retrieving recent service requests:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des demandes récentes" 
      });
    }
  });

  // Get a service request by ID
  app.get("/api/service-request-id/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID de demande invalide"
        });
      }
      
      const serviceRequest = await storage.getServiceRequest(id);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      return res.json({
        success: true,
        serviceRequest
      });
    } catch (error) {
      console.error("Error fetching service request by ID:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération de la demande" 
      });
    }
  });

  // Get a service request by reference number
  app.get("/api/service-requests/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Vérifier si la demande a un lead lié, sinon essayer de le lier automatiquement
      if (!serviceRequest.leadId) {
        console.log(`GET /api/service-requests/${referenceNumber}: Aucun lead lié à cette demande. Tentative de liaison automatique...`);
        const linked = await storage.findAndLinkLeadToServiceRequest(serviceRequest.id);
        
        if (linked) {
          console.log(`Lead automatiquement lié à la demande ${serviceRequest.id}`);
          // Récupérer la demande mise à jour
          const updatedRequest = await storage.getServiceRequestByReference(referenceNumber);
          if (updatedRequest) {
            return res.json({
              success: true,
              serviceRequest: updatedRequest
            });
          }
        } else {
          console.log(`Aucun lead disponible pour liaison automatique avec la demande ${serviceRequest.id}`);
        }
      }
      
      res.json({
        success: true,
        serviceRequest
      });
    } catch (error) {
      console.error("Error retrieving service request:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération de la demande" 
      });
    }
  });
  
  // Get a service request by ID (for admin)
  app.get("/api/service-requests/id/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "ID invalide" 
        });
      }
      
      const serviceRequest = await storage.getServiceRequest(id);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Vérifier si la demande a un lead lié, sinon essayer de le lier automatiquement
      if (!serviceRequest.leadId) {
        console.log(`GET /api/service-requests/id/${id}: Aucun lead lié à cette demande. Tentative de liaison automatique...`);
        const linked = await storage.findAndLinkLeadToServiceRequest(serviceRequest.id);
        
        if (linked) {
          console.log(`Lead automatiquement lié à la demande ${serviceRequest.id}`);
          // Récupérer la demande mise à jour
          const updatedRequest = await storage.getServiceRequest(id);
          if (updatedRequest) {
            return res.json(updatedRequest);
          }
        } else {
          console.log(`Aucun lead disponible pour liaison automatique avec la demande ${serviceRequest.id}`);
        }
      }
      
      res.json(serviceRequest);
    } catch (error) {
      console.error("Error retrieving service request by ID:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération de la demande" 
      });
    }
  });
  
  // Check if a certificate exists for a service request and get its URL
  app.get("/api/service-requests/:id/certificate", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "ID invalide" 
        });
      }
      
      const serviceRequest = await storage.getServiceRequest(id);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Vérifier si un certificat existe déjà
      const exists = await certificateExists(serviceRequest.referenceNumber);
      let url = null;
      
      if (exists) {
        url = await getCertificateUrl(serviceRequest.referenceNumber);
      }
      
      res.json({
        success: true,
        exists,
        url
      });
    } catch (error) {
      console.error("Error checking certificate:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la vérification du certificat" 
      });
    }
  });
  
  // Generate a certificate for a service request
  app.post("/api/service-requests/:id/generate-certificate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "ID invalide" 
        });
      }
      
      const serviceRequest = await storage.getServiceRequest(id);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Vérifier si le paiement a été effectué
      /* Nous désactivons temporairement cette vérification pour permettre les tests
      if (serviceRequest.paymentStatus !== "paid") {
        return res.status(400).json({ 
          success: false, 
          message: "Impossible de générer un certificat pour une demande non payée" 
        });
      }
      */
      
      // Vérifier si un certificat existe déjà
      const exists = await certificateExists(serviceRequest.referenceNumber);
      let url;
      
      if (exists) {
        // Récupérer l'URL existante
        url = await getCertificateUrl(serviceRequest.referenceNumber);
      } else {
        // Générer un nouveau certificat
        url = await generateCertificate(serviceRequest);
        
        // Logger l'activité
        await storage.logActivity({
          entityType: "service_request",
          entityId: serviceRequest.id,
          action: "certificate_generated",
          userId: req.user?.id || 0,
          details: `Certificat généré pour la demande ${serviceRequest.referenceNumber}`
        });
      }
      
      res.json({
        success: true,
        url
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la génération du certificat" 
      });
    }
  });

  // Routes de paiement
  // Notification de paiement réussi
  app.post("/api/payment-success/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const { paymentId, paymentMethod, paymentStatus } = req.body;
      
      if (!referenceNumber || !paymentId) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence et l'ID de paiement sont requis" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence" 
        });
      }
      
      // Vérifier si le paiement est déjà marqué comme réussi
      if (serviceRequest.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "Paiement déjà enregistré comme réussi"
        });
      }
      
      // Vérifier avec Stripe le statut du paiement si possible
      let cardDetails = null;
      if (stripe && paymentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentId, {
            expand: ['charges.data.payment_method_details', 'charges.data.billing_details']
          });
          
          // Vérifier que le paiement a bien réussi selon Stripe
          if (paymentIntent.status !== "succeeded") {
            console.warn(`PaymentIntent ${paymentId} n'est pas marqué comme succeeded (status=${paymentIntent.status})`);
            
            // Si le paiement n'est pas réussi, on le met à jour quand même mais avec le statut de Stripe
            const stripeStatus = paymentIntent.status === "requires_payment_method" ? "failed" : 
                                paymentIntent.status === "canceled" ? "canceled" : "pending";
            
            await storage.updateServiceRequestPayment(
              serviceRequest.id,
              paymentId,
              stripeStatus,
              129.80
            );
            
            return res.status(400).json({
              success: false, 
              message: `Le paiement n'est pas complété (${paymentIntent.status})`,
              stripeStatus: paymentIntent.status
            });
          }
          
          // Extraire les détails de carte si disponibles
          // Note: PaymentIntent n'a pas directement de propriété charges dans le type
          // mais elle existe dans la réponse Stripe, nous utilisons donc une conversion de type
          const paymentIntentWithCharges = paymentIntent as any;
          if (paymentIntentWithCharges.charges?.data?.length > 0) {
            const charge = paymentIntentWithCharges.charges.data[0];
            if (charge.payment_method_details?.card) {
              const card = charge.payment_method_details.card;
              cardDetails = {
                cardBrand: card.brand,
                cardLast4: card.last4,
                cardExpMonth: card.exp_month,
                cardExpYear: card.exp_year,
                billingName: charge.billing_details?.name,
                paymentMethod: charge.payment_method_details.type
              };
            }
          }
        } catch (stripeError) {
          console.error("Erreur lors de la vérification du PaymentIntent avec Stripe:", stripeError);
          // Continuer malgré l'erreur Stripe, en faisant confiance à la notification reçue
        }
      }
      
      // Mettre à jour le statut de paiement avec les détails de carte si disponibles
      await storage.updateServiceRequestPayment(
        serviceRequest.id,
        paymentId,
        "paid", // Paiement réussi
        129.80,
        cardDetails || undefined
      );
      
      // Mettre à jour le statut de la demande
      await storage.updateServiceRequestStatus(
        serviceRequest.id,
        REQUEST_STATUS.PAID,
        0 // 0 = système
      );
      
      // Logger l'activité
      await storage.logActivity({
        userId: 0, // 0 = système
        entityType: "service_request",
        entityId: serviceRequest.id,
        action: ACTIVITY_ACTIONS.PAYMENT_CONFIRMED,
        details: `Paiement confirmé: ${paymentId}`,
        ipAddress: req.ip
      });
      
      // Mettre à jour les statistiques de l'utilisateur assigné
      try {
        // Trouver le propriétaire/responsable de la demande
        let assignedUserId = serviceRequest.assignedTo;
        
        // Si aucun utilisateur n'est assigné, chercher dans les logs d'activité
        if (!assignedUserId) {
          const activities = await db.select()
            .from(activityLogs)
            .where(and(
              eq(activityLogs.entityType, "service_request"),
              eq(activityLogs.entityId, serviceRequest.id),
              eq(activityLogs.action, ACTIVITY_ACTIONS.LEAD_ASSIGNED)
            ))
            .orderBy(desc(activityLogs.createdAt))
            .limit(1);
          
          if (activities.length > 0) {
            try {
              // Le format du détail est généralement JSON avec les informations d'assignation
              const details = JSON.parse(activities[0].details);
              assignedUserId = details.assignedTo || details.userId;
            } catch (e) {
              console.error("Erreur lors du parsing des détails d'assignation:", e);
            }
          }
        }
        
        // Si un utilisateur est trouvé, mettre à jour ses statistiques
        if (assignedUserId) {
          await userStatsService.incrementPaymentsProcessed(
            assignedUserId, 
            12980 // Montant en centimes: 129.80€
          );
          console.log(`Statistiques de paiement mises à jour pour l'utilisateur ${assignedUserId}`);
        }
      } catch (statsError) {
        console.error("Erreur lors de la mise à jour des statistiques utilisateur:", statsError);
        // Ne pas bloquer le processus principal en cas d'erreur
      }
      
      // Générer le certificat pour la demande
      try {
        if (!(await certificateExists(referenceNumber))) {
          await generateCertificate(serviceRequest);
        }
      } catch (certError) {
        console.error("Erreur lors de la génération du certificat:", certError);
      }
      
      res.status(200).json({
        success: true,
        message: "Paiement enregistré avec succès",
        cardDetails: cardDetails
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la confirmation du paiement",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  
  // Stockage des données des tentatives de paiement échouées pour assistance client
  app.post("/api/store-payment-attempt", async (req, res) => {
    try {
      const { referenceNumber, paymentError } = req.body;
      
      if (!referenceNumber || !paymentError) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence et les détails d'erreur sont requis" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence"
        });
      }
      
      // Stocker les détails de l'échec de paiement
      const paymentErrorDetails = {
        code: paymentError.code || "unknown_error",
        message: paymentError.message || "Erreur inconnue",
        timestamp: new Date().toISOString(),
        cardDetails: paymentError.cardDetails || {}
      };
      
      // Enregistrer l'échec de paiement dans la base de données
      await storage.updateServiceRequestPaymentAttempt(
        serviceRequest.id,
        "failed",
        129.80,
        paymentErrorDetails
      );
      
      // Logger l'activité
      await storage.logActivity({
        userId: 0, // 0 = système
        entityType: "service_request",
        entityId: serviceRequest.id,
        action: ACTIVITY_ACTIONS.PAYMENT_FAILED,
        details: JSON.stringify({
          errorCode: paymentError.code,
          message: paymentError.message,
          cardInfo: paymentError.cardDetails ? `${paymentError.cardDetails.brand || ''} **** ${paymentError.cardDetails.last4 || ''}` : ''
        }),
        ipAddress: req.ip
      });
      
      // Mettre à jour le statut de la demande
      await storage.updateServiceRequestStatus(
        serviceRequest.id,
        REQUEST_STATUS.PAYMENT_PENDING, // En attente de paiement
        0 // 0 = système
      );
      
      res.status(200).json({
        success: true,
        message: "Détails de l'échec de paiement sauvegardés pour assistance future"
      });
    } catch (error) {
      console.error("Erreur lors du stockage des détails d'échec de paiement:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'enregistrement des détails d'échec",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  
  // Point d'entrée pour la confirmation de paiement après redirection de Stripe
  app.post("/api/payment-confirmed", async (req, res) => {
    try {
      const { referenceNumber, paymentIntentId } = req.body;
      
      if (!referenceNumber || !paymentIntentId) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence et l'ID de paiement sont requis" 
        });
      }
      
      console.log("Confirmation de paiement reçue:", { referenceNumber, paymentIntentId });
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        console.error(`Confirmation de paiement impossible: référence introuvable ${referenceNumber}`);
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence",
          code: "reference_not_found"
        });
      }
      
      // Vérifier si le paiement est déjà marqué comme réussi
      if (serviceRequest.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "Paiement déjà enregistré comme réussi"
        });
      }
      
      // Vérifier avec Stripe le statut du paiement
      if (!stripe) {
        return res.status(500).json({ 
          success: false, 
          message: "Stripe n'est pas configuré sur le serveur" 
        });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges.data.payment_method_details', 'charges.data.billing_details']
      });
      
      // Vérifier que le paiement a bien réussi selon Stripe
      if (paymentIntent.status !== "succeeded") {
        console.warn(`PaymentIntent ${paymentIntentId} n'est pas marqué comme succeeded (status=${paymentIntent.status})`);
        
        return res.status(400).json({
          success: false, 
          message: `Le paiement n'est pas complété (${paymentIntent.status})`,
          stripeStatus: paymentIntent.status
        });
      }
      
      // Définition d'interface pour les détails de paiement
      interface PaymentDetails {
        cardBrand?: string;
        cardLast4?: string;
        cardExpMonth?: number;
        cardExpYear?: number;
        billingName?: string;
        paymentMethod?: string;
      }
      
      // Extraire les détails de carte si disponibles avec typage stricte
      let cardDetails: PaymentDetails | undefined = undefined;
      // Type assertion pour accéder à charges qui est retourné via l'option expand
      const paymentIntentWithCharges = paymentIntent as any;
      
      if (paymentIntentWithCharges.charges?.data?.length > 0) {
        const charge = paymentIntentWithCharges.charges.data[0];
        if (charge.payment_method_details?.card) {
          const card = charge.payment_method_details.card;
          cardDetails = {
            cardBrand: card.brand,
            cardLast4: card.last4,
            cardExpMonth: card.exp_month,
            cardExpYear: card.exp_year,
            billingName: charge.billing_details?.name,
            paymentMethod: charge.payment_method_details.type
          };
        }
      }
      
      // Mettre à jour le statut de paiement avec les détails de carte si disponibles
      await storage.updateServiceRequestPayment(
        serviceRequest.id,
        paymentIntentId,
        "paid", // Paiement réussi
        paymentIntent.amount / 100,
        cardDetails || undefined // Passer null comme undefined pour éviter l'erreur de type
      );
      
      // Mettre à jour le statut de la demande
      await storage.updateServiceRequestStatus(
        serviceRequest.id,
        REQUEST_STATUS.PAID,
        0 // 0 = système
      );
      
      // Logger l'activité
      await storage.logActivity({
        userId: 0, // 0 = système
        entityType: "service_request",
        entityId: serviceRequest.id,
        action: ACTIVITY_ACTIONS.PAYMENT_CONFIRMED,
        details: `Paiement confirmé par redirection Stripe: ${paymentIntentId}`,
        ipAddress: req.ip
      });
      
      // Mettre à jour les statistiques de l'utilisateur assigné
      try {
        // Trouver le propriétaire/responsable de la demande
        let assignedUserId = serviceRequest.assignedTo;
        
        // Si aucun utilisateur n'est assigné, chercher dans les logs d'activité
        if (!assignedUserId) {
          const activities = await db.select()
            .from(activityLogs)
            .where(and(
              eq(activityLogs.entityType, "service_request"),
              eq(activityLogs.entityId, serviceRequest.id),
              eq(activityLogs.action, ACTIVITY_ACTIONS.LEAD_ASSIGNED)
            ))
            .orderBy(desc(activityLogs.createdAt))
            .limit(1);
          
          if (activities.length > 0) {
            try {
              // Le format du détail est généralement JSON avec les informations d'assignation
              const details = JSON.parse(activities[0].details);
              assignedUserId = details.assignedTo || details.userId;
            } catch (e) {
              console.error("Erreur lors du parsing des détails d'assignation:", e);
            }
          }
        }
        
        // Si un utilisateur est trouvé, mettre à jour ses statistiques
        if (assignedUserId) {
          await userStatsService.incrementPaymentsProcessed(
            assignedUserId, 
            paymentIntent.amount // Montant en centimes directement depuis Stripe
          );
          console.log(`Statistiques de paiement mises à jour pour l'utilisateur ${assignedUserId}`);
        }
      } catch (statsError) {
        console.error("Erreur lors de la mise à jour des statistiques utilisateur:", statsError);
        // Ne pas bloquer le processus principal en cas d'erreur
      }
      
      // Générer le certificat pour la demande
      try {
        if (!(await certificateExists(referenceNumber))) {
          await generateCertificate(serviceRequest);
        }
      } catch (certError) {
        console.error("Erreur lors de la génération du certificat:", certError);
      }
      
      res.status(200).json({
        success: true,
        message: "Paiement confirmé avec succès",
        cardDetails: cardDetails
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la confirmation du paiement",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  
  // Vérifier le statut du paiement
  app.get("/api/payment-status/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      
      if (!referenceNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence est requise" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        console.error(`Vérification du statut de paiement impossible: référence ${referenceNumber} introuvable`);
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence",
          code: "reference_not_found"
        });
      }
      
      // Si la demande n'a pas de lead associé, tenter de la lier automatiquement
      if (!serviceRequest.leadId) {
        console.log(`Vérification du statut de paiement pour ${referenceNumber}: Aucun lead lié à cette demande. Tentative de liaison automatique...`);
        await storage.findAndLinkLeadToServiceRequest(serviceRequest.id);
      }
      
      // Détails de journalisation pour débogage
      console.log("Détails de la demande de service:", {
        referenceNumber,
        paymentId: serviceRequest.paymentId,
        paymentStatus: serviceRequest.paymentStatus
      });
      
      // Si le paiement est déjà marqué comme réussi dans notre base de données
      if (serviceRequest.paymentStatus === "paid") {
        return res.json({
          success: true,
          status: "paid",
          message: "Ce paiement a déjà été confirmé et traité avec succès"
        });
      }
      
      // Vérifier si Stripe est configuré et si l'ID de paiement est disponible
      if (stripe && serviceRequest.paymentId) {
        try {
          // Récupérer les détails du paiement directement depuis Stripe avec expansion des charges
          const paymentIntent = await stripe.paymentIntents.retrieve(serviceRequest.paymentId, {
            expand: ['charges.data.payment_method_details', 'charges.data.billing_details']
          });
          
          console.log("Statut du paiement Stripe:", {
            paymentId: serviceRequest.paymentId,
            stripeStatus: paymentIntent.status,
            dbStatus: serviceRequest.paymentStatus,
            createdAt: new Date(paymentIntent.created * 1000).toISOString()
          });
          
          // Interface pour les détails de carte extraits des données Stripe
          interface CardDetails {
            brand: string;
            last4: string;
            expMonth: number;
            expYear: number;
            country?: string;
            funding?: string;
          }
          
          // Extraction des détails de carte avec type de retour explicite
          let cardDetails: CardDetails | null = null;
          // Type assertion pour accéder à charges qui est retourné via l'option expand
          const paymentIntentWithCharges = paymentIntent as any;
          if (paymentIntentWithCharges.charges?.data?.length > 0) {
            const charge = paymentIntentWithCharges.charges.data[0];
            if (charge.payment_method_details?.card) {
              const card = charge.payment_method_details.card;
              cardDetails = {
                brand: card.brand,
                last4: card.last4,
                expMonth: card.exp_month,
                expYear: card.exp_year,
                country: card.country,
                funding: card.funding // 'credit', 'debit', 'prepaid', etc.
              };
            }
          }
          
          // Déterminer l'erreur si le paiement a échoué
          let errorDetails = null;
          if (paymentIntent.last_payment_error) {
            errorDetails = {
              code: paymentIntent.last_payment_error.code,
              message: paymentIntent.last_payment_error.message,
              type: paymentIntent.last_payment_error.type,
              decline_code: paymentIntent.last_payment_error.decline_code
            };
          }
          
          // Analyse avancée du statut de paiement avec gestion d'erreurs spécifiques
          let finalStatus;
          let statusMessage = "";
          let requiresAction = false;
          
          switch(paymentIntent.status) {
            case 'succeeded':
              finalStatus = 'paid';
              statusMessage = "Paiement confirmé avec succès";
              
              // Mettre à jour la base de données si le paiement est réussi
              if (serviceRequest.paymentStatus !== "paid") {
                console.log("Mise à jour du statut de paiement à 'paid'");
                
                // Informations de paiement complètes
                // Utiliser PaymentIntentWithCharges pour accéder aux données de charge 
                // Conversion explicite des valeurs nullables en string|number|undefined pour respecter le typage
                const paymentDetails: {
                  cardBrand?: string;
                  cardLast4?: string;
                  cardExpMonth?: number;
                  cardExpYear?: number;
                  billingName?: string;
                  paymentMethod?: string;
                } = {
                  cardBrand: cardDetails?.brand || undefined,
                  cardLast4: cardDetails?.last4 || undefined,
                  cardExpMonth: cardDetails?.expMonth || undefined,
                  cardExpYear: cardDetails?.expYear || undefined,
                  billingName: paymentIntentWithCharges.charges?.data[0]?.billing_details?.name || undefined,
                  paymentMethod: paymentIntentWithCharges.charges?.data[0]?.payment_method_details?.type || "card"
                };

                await storage.updateServiceRequestPayment(
                  serviceRequest.id,
                  serviceRequest.paymentId,
                  "paid",
                  paymentIntent.amount / 100,
                  paymentDetails
                );
                
                // 💰 NOTIFICATION EN TEMPS RÉEL - PAIEMENT RÉUSSI (EXCLUSIF RACCORDEMENT-ELEC.FR)
                try {
                  // SÉCURITÉ RENFORCÉE: Vérifier domaine + référence + données client
                  const hostHeader = req.get('host') || req.get('x-forwarded-host') || '';
                  const refererHeader = req.get('referer') || '';
                  const isRaccordementElecDomain = hostHeader.includes('portail-electricite.com') || 
                                                   refererHeader.includes('portail-electricite.com') ||
                                                   hostHeader.includes('replit.dev'); // Pour dev
                  
                  if (serviceRequest.referenceNumber && 
                      serviceRequest.id && serviceRequest.name && serviceRequest.email &&
                      isRaccordementElecDomain) {
                    
                    const { sendPaiementReussiNotification } = await import('./email-service');
                    await sendPaiementReussiNotification({
                      referenceNumber: serviceRequest.referenceNumber,
                      clientName: serviceRequest.name,
                      clientEmail: serviceRequest.email,
                      clientPhone: serviceRequest.phone,
                      amount: paymentIntent.amount,
                      paymentIntentId: paymentIntent.id,
                      paymentMethod: paymentDetails.paymentMethod,
                      cardBrand: paymentDetails.cardBrand,
                      cardLast4: paymentDetails.cardLast4
                    });
                    console.log('💰 Notification paiement RACCORDEMENT-ELEC.FR envoyée:', serviceRequest.referenceNumber, 'depuis:', hostHeader);
                  } else {
                    console.log('🔒 Paiement externe ignoré - Domaine:', hostHeader, 'Ref:', serviceRequest.referenceNumber);
                  }
                } catch (emailError) {
                  console.error('❌ Erreur notification paiement portail-electricite.com:', emailError);
                  // Ne pas bloquer le processus si l'email échoue
                }
                
                // Mettre à jour le statut de la demande
                await storage.updateServiceRequestStatus(
                  serviceRequest.id,
                  REQUEST_STATUS.PAID,
                  0 // 0 = système
                );
                
                // Générer automatiquement le certificat
                try {
                  if (!(await certificateExists(referenceNumber))) {
                    await generateCertificate(serviceRequest);
                    console.log("Certificat généré automatiquement suite au paiement réussi");
                  }
                } catch (certError) {
                  console.error("Erreur lors de la génération du certificat:", certError);
                }
                
                // Logger l'activité
                await storage.logActivity({
                  userId: 0, // 0 = système
                  entityType: "service_request",
                  entityId: serviceRequest.id,
                  action: ACTIVITY_ACTIONS.PAYMENT_CONFIRMED,
                  details: `Paiement confirmé via API Stripe: ${serviceRequest.paymentId}`,
                  ipAddress: req.ip
                });
                
                // NOUVELLE FONCTIONNALITÉ: Envoyer notification de paiement réussi à l'équipe commerciale
                try {
                  await sendPaiementReussiNotification({
                    referenceNumber: serviceRequest.referenceNumber,
                    clientName: `${serviceRequest.name}`,
                    clientEmail: serviceRequest.email,
                    clientPhone: serviceRequest.phone,
                    paymentDate: new Date(),
                    paymentAmount: paymentIntent.amount,
                    paymentId: serviceRequest.paymentId,
                    cardBrand: paymentDetails.cardBrand,
                    cardLast4: paymentDetails.cardLast4,
                    serviceType: serviceRequest.serviceType,
                    address: serviceRequest.address
                  });
                  console.log('✅ Notification de paiement réussi envoyée à l\'équipe commerciale');
                } catch (emailError) {
                  console.error('❌ Erreur lors de l\'envoi de la notification de paiement réussi:', emailError);
                  // Ne pas bloquer le processus de paiement si l'email échoue
                }
              }
              break;
              
            case 'processing':
              finalStatus = 'processing';
              statusMessage = "Paiement en cours de traitement par votre banque";
              break;
              
            case 'requires_payment_method':
              finalStatus = 'failed';
              statusMessage = "La méthode de paiement a été refusée";
              // Mettre à jour le statut dans la BDD si nécessaire
              if (serviceRequest.paymentStatus !== "failed") {
                await storage.updateServiceRequestPayment(
                  serviceRequest.id,
                  serviceRequest.paymentId,
                  "failed",
                  paymentIntent.amount / 100
                );
                
                // 🚨 NOTIFICATION PAIEMENT ÉCHOUÉ (EXCLUSIF RACCORDEMENT-ELEC.FR)
                try {
                  // SÉCURITÉ RENFORCÉE: Vérifier domaine + référence + données client
                  const hostHeader = req.get('host') || req.get('x-forwarded-host') || '';
                  const refererHeader = req.get('referer') || '';
                  const isRaccordementElecDomain = hostHeader.includes('portail-electricite.com') || 
                                                   refererHeader.includes('portail-electricite.com') ||
                                                   hostHeader.includes('replit.dev'); // Pour dev
                  
                  if (serviceRequest.referenceNumber && 
                      serviceRequest.id && serviceRequest.name && serviceRequest.email &&
                      isRaccordementElecDomain) {
                    
                    await sendPaiementEchoueNotification({
                      referenceNumber: serviceRequest.referenceNumber,
                      clientName: `${serviceRequest.name}`,
                      clientEmail: serviceRequest.email,
                      clientPhone: serviceRequest.phone,
                      attemptDate: new Date(),
                      amount: paymentIntent.amount,
                      paymentId: serviceRequest.paymentId,
                      errorMessage: "La méthode de paiement a été refusée"
                    });
                    console.log('🚨 Notification paiement échoué RACCORDEMENT-ELEC.FR envoyée:', serviceRequest.referenceNumber, 'depuis:', hostHeader);
                  } else {
                    console.log('🔒 Paiement échoué externe ignoré - Domaine:', hostHeader, 'Ref:', serviceRequest.referenceNumber);
                  }
                } catch (emailError) {
                  console.error('❌ Erreur lors de l\'envoi de la notification de paiement échoué portail-electricite.com:', emailError);
                  // Ne pas bloquer le processus si l'email échoue
                }
              }
              break;
              
            case 'requires_action':
            case 'requires_confirmation':
              finalStatus = 'pending';
              statusMessage = "Action requise pour finaliser le paiement";
              requiresAction = true;
              break;
              
            case 'canceled':
              finalStatus = 'canceled';
              statusMessage = "Paiement annulé";
              // Mettre à jour le statut dans la BDD si nécessaire
              if (serviceRequest.paymentStatus !== "canceled") {
                await storage.updateServiceRequestPayment(
                  serviceRequest.id,
                  serviceRequest.paymentId,
                  "canceled",
                  paymentIntent.amount / 100
                );
              }
              break;
              
            default:
              finalStatus = 'pending';
              statusMessage = `Statut en attente (${paymentIntent.status})`;
              break;
          }
          
          console.log("Réponse statut de paiement:", {
            status: finalStatus,
            paymentId: serviceRequest.paymentId,
            stripeStatus: paymentIntent.status,
            message: statusMessage,
            cardDetails: cardDetails ? `${cardDetails.brand} ****${cardDetails.last4}` : null
          });
          
          // Retourner une réponse complète avec tous les détails nécessaires pour l'UI
          return res.json({
            success: true,
            status: finalStatus,
            message: statusMessage,
            paymentId: serviceRequest.paymentId,
            amount: paymentIntent.amount / 100,
            stripeStatus: paymentIntent.status,
            cardDetails: cardDetails,
            errorDetails: errorDetails,
            requiresAction: requiresAction,
            clientSecret: requiresAction ? paymentIntent.client_secret : null
          });
        } catch (stripeError) {
          console.error("Erreur Stripe lors de la vérification du paiement:", stripeError);
          
          // Fonction utilitaire pour analyser et formater les erreurs Stripe
          const formatStripeError = (error: any) => {
            let errorMessage = "Erreur lors de la vérification du paiement";
            let errorCode = "unknown_error";
            let errorDetails = {};
            
            if (error instanceof Stripe.errors.StripeError) {
              // Traitement spécifique selon le type d'erreur Stripe
              switch(error.type) {
                case 'StripeCardError':
                  errorMessage = "Problème avec la carte bancaire";
                  errorCode = "card_error";
                  
                  // Détails spécifiques aux erreurs de carte
                  if (error.code) {
                    if (error.code === 'card_declined') {
                      errorMessage = "Votre carte a été refusée par votre banque";
                      errorCode = "card_declined";
                    } else if (error.code === 'expired_card') {
                      errorMessage = "Votre carte est expirée";
                    } else if (error.code === 'incorrect_cvc') {
                      errorMessage = "Le code de sécurité de votre carte est incorrect";
                    } else if (error.code === 'processing_error') {
                      errorMessage = "Erreur lors du traitement de votre carte, veuillez réessayer";
                    } else if (error.code === 'incorrect_number') {
                      errorMessage = "Le numéro de carte est invalide";
                    } else if (error.code === 'insufficient_funds') {
                      errorMessage = "Fonds insuffisants sur votre carte";
                      errorCode = "insufficient_funds";
                    }
                  }
                  break;
                  
                case 'StripeInvalidRequestError':
                  errorMessage = "Requête invalide auprès de Stripe";
                  errorCode = "invalid_request";
                  break;
                  
                case 'StripeAPIError':
                  errorMessage = "Erreur temporaire de l'API Stripe";
                  errorCode = "api_error";
                  break;
                  
                case 'StripeAuthenticationError':
                  errorMessage = "Problème d'authentification avec Stripe";
                  errorCode = "authentication_error";
                  console.error("Erreur d'authentification Stripe - Vérifiez les clés API", error);
                  break;
                  
                case 'StripeRateLimitError':
                  errorMessage = "Trop de requêtes vers Stripe, veuillez réessayer";
                  errorCode = "rate_limit_error";
                  break;
                  
                default:
                  errorMessage = error.message || "Erreur inconnue avec Stripe";
              }
              
              // Ajouter des champs supplémentaires si disponibles
              if (error.decline_code) {
                errorDetails = { ...errorDetails, decline_code: error.decline_code };
              }
              if (error.param) {
                errorDetails = { ...errorDetails, param: error.param };
              }
            }
            
            return {
              message: errorMessage,
              code: errorCode,
              details: Object.keys(errorDetails).length > 0 ? errorDetails : undefined
            };
          };
          
          // Analyser l'erreur Stripe pour donner des informations plus précises
          const stripeErrorInfo = formatStripeError(stripeError);
          const errorMessage = stripeErrorInfo.message;
          const errorCode = stripeErrorInfo.code;
          const additionalDetails = stripeErrorInfo.details;
          
          // En cas d'erreur Stripe, utiliser le statut stocké en base de données
          return res.json({
            success: true,
            status: serviceRequest.paymentStatus || 'pending',
            errorDetails: {
              code: errorCode,
              message: errorMessage
            },
            paymentId: serviceRequest.paymentId,
            amount: serviceRequest.paymentAmount || 129.80,
            error: 'stripe_error'
          });
        }
      } else {
        // Pas d'ID de paiement Stripe disponible
        console.log("Aucun ID de paiement Stripe disponible, retour du statut DB:", serviceRequest.paymentStatus);
        
        return res.json({
          success: true,
          status: serviceRequest.paymentStatus || 'pending',
          paymentId: serviceRequest.paymentId,
          amount: serviceRequest.paymentAmount || 129.80,
          message: 'no_stripe_payment_id'
        });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut du paiement:", error);
      
      return res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la vérification du statut du paiement",
        error: error instanceof Error ? error.message : 'unknown_error'
      });
    }
  });
  
  // Webhook Stripe pour recevoir les événements de paiement
  app.post("/api/stripe-webhook", async (req: StripeRequest, res) => {
    try {
      // Vérifier si Stripe est configuré
      if (!stripe) {
        return res.status(500).json({ 
          success: false, 
          message: "Stripe n'est pas configuré sur le serveur" 
        });
      }
      
      const sig = req.headers[STRIPE_SIGNATURE_HEADER] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!sig || !endpointSecret) {
        return res.status(400).json({ success: false, message: "Signature manquante" });
      }
      
      let event;
      
      try {
        if (!req.rawBody) {
          throw new Error("Missing rawBody");
        }
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      
      // Gérer différents types d'événements
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        
        // Récupérer la référence de la demande depuis les métadonnées
        const referenceNumber = paymentIntent.metadata?.referenceNumber;
        
        if (referenceNumber) {
          // Mettre à jour le statut de paiement dans la base de données
          const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
          
          if (serviceRequest) {
            // CORRECTION: Vérifier si la demande est déjà marquée comme payée, ou si elle a un autre statut (annulé/échec)
            // Nous traitons la référence comme clé principale, pas l'ID de paiement, pour gérer les réessais
            console.log(`Traitement d'un paiement réussi pour la référence ${referenceNumber}, statut actuel: ${serviceRequest.paymentStatus}`);
            
            // Si pas encore marquée comme payée ou si paiement a échoué précédemment, mettre à jour
            if (serviceRequest.paymentStatus !== "paid" && serviceRequest.paymentStatus !== "succeeded") {
              console.log(`Mise à jour du statut de la demande de ${serviceRequest.paymentStatus || 'undefined'} à 'paid'`);
              
              // Récupérer les détails de paiement
              let paymentDetails: {
                cardBrand?: string;
                cardLast4?: string;
                cardExpMonth?: number;
                cardExpYear?: number;
                billingName?: string;
                bankName?: string;
                paymentMethod?: string;
              } = {};
              
              try {
                // Si une charge a été créée, récupérer les détails de la carte
                if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'string') {
                  const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
                  
                  if (charge.payment_method_details?.card) {
                    const card = charge.payment_method_details.card;
                    paymentDetails = {
                      cardBrand: card.brand || '',
                      cardLast4: card.last4 || '',
                      cardExpMonth: card.exp_month || undefined,
                      cardExpYear: card.exp_year || undefined,
                      billingName: charge.billing_details?.name || '',
                      paymentMethod: charge.payment_method_details.type || 'card',
                      bankName: ''
                    };
                    
                    // Si on a des informations sur la banque
                    if (card.wallet?.type === 'apple_pay') {
                      paymentDetails.bankName = 'Apple Pay';
                    } else if (card.wallet?.type === 'google_pay') {
                      paymentDetails.bankName = 'Google Pay';
                    } else {
                      paymentDetails.bankName = card.issuer || '';
                    }
                  }
                } else if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'string') {
                  // Si pas de charge mais un payment_method, essayer de récupérer les infos
                  const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
                  
                  if (paymentMethod.type === 'card' && paymentMethod.card) {
                    paymentDetails = {
                      cardBrand: paymentMethod.card.brand || '',
                      cardLast4: paymentMethod.card.last4 || '',
                      cardExpMonth: paymentMethod.card.exp_month || undefined,
                      cardExpYear: paymentMethod.card.exp_year || undefined,
                      billingName: paymentMethod.billing_details?.name || '',
                      paymentMethod: paymentMethod.type || 'card',
                      bankName: paymentMethod.card.issuer || ''
                    };
                  }
                }
                
                console.log('Détails de paiement réussi récupérés:', paymentDetails);
                
                // Si le service request a été converti à partir d'un lead, mettre à jour aussi les infos du lead
                if (serviceRequest.leadId) {
                  console.log(`Mise à jour des infos de paiement pour le lead ${serviceRequest.leadId}`);
                  await storage.updateLeadPaymentInfo(serviceRequest.leadId, {
                    paymentStatus: "paid",
                    paymentId: paymentIntent.id,
                    paymentAmount: paymentIntent.amount / 100,
                    cardDetails: paymentDetails
                  });
                }
              } catch (error) {
                console.error('Erreur lors de la récupération des détails de paiement:', error);
                // Ne pas bloquer le processus en cas d'erreur
              }
              
              // Mettre à jour les informations de paiement avec les détails bancaires
              await storage.updateServiceRequestPayment(
                serviceRequest.id,
                paymentIntent.id,
                "paid",
                paymentIntent.amount / 100,
                paymentDetails
              );
              
              // Mettre à jour le statut de la demande
              await storage.updateServiceRequestStatus(
                serviceRequest.id,
                REQUEST_STATUS.PAID,
                0 // 0 = système
              );
              
              // Logger l'activité
              await storage.logActivity({
                userId: 0, // 0 = système
                entityType: "service_request",
                entityId: serviceRequest.id,
                action: ACTIVITY_ACTIONS.PAYMENT_CONFIRMED,
                details: `Paiement confirmé via webhook Stripe: ${paymentIntent.id}`,
                ipAddress: req.ip
              });
              
              // Générer le certificat pour la demande
              try {
                if (!(await certificateExists(referenceNumber))) {
                  await generateCertificate(serviceRequest);
                }
              } catch (certError) {
                console.error("Erreur lors de la génération du certificat:", certError);
              }
              
              // NOTIFICATION EMAIL PAIEMENT RÉUSSI ACTIVÉE
              try {
                const { sendPaiementReussiNotification } = await import('./email-service-clean');
                
                // Préparer les données pour l'email de notification
                const paymentNotificationData = {
                  referenceNumber: serviceRequest.referenceNumber,
                  amount: paymentIntent.amount,
                  paymentIntentId: paymentIntent.id,
                  clientName: `${serviceRequest.firstName || ''} ${serviceRequest.lastName || ''}`.trim() || 'Client',
                  clientEmail: serviceRequest.email || '',
                  clientPhone: serviceRequest.phone || '',
                  paymentStatus: 'succeeded'
                };
                
                console.log('📧 Envoi notification paiement réussi:', paymentNotificationData.referenceNumber);
                const emailResult = await sendPaiementReussiNotification(paymentNotificationData);
                
                // Logger l'envoi d'email
                await storage.logActivity({
                  userId: 0, // 0 = système
                  entityType: "service_request",
                  entityId: serviceRequest.id,
                  action: "payment_notification_sent",
                  details: `Email de paiement réussi envoyé: ${emailResult.success ? 'succès' : 'échec'} - ${emailResult.messageId || emailResult.error}`,
                  ipAddress: req.ip
                });
              } catch (emailError) {
                console.error('❌ Erreur envoi notification paiement réussi:', emailError);
                
                // Logger l'échec d'envoi d'email
                await storage.logActivity({
                  userId: 0, // 0 = système
                  entityType: "service_request",
                  entityId: serviceRequest.id,
                  action: "payment_notification_error",
                  details: `Erreur envoi notification paiement réussi: ${emailError.message}`,
                  ipAddress: req.ip
                });
              }
              
              // Continue avec le reste du processus
              console.log(`✅ Paiement traité avec succès pour ${referenceNumber}`);
              
              // Log pour la journalisation système
              console.log(`Email de confirmation non envoyé automatiquement pour ${referenceNumber} (désactivé selon la configuration client)`);
              
              // Vérifier que la demande est bien liée à un lead, sinon tenter de la lier
              if (!serviceRequest.leadId) {
                console.log(`Webhook Stripe: Aucun lead lié à la demande ${serviceRequest.id}. Tentative de liaison automatique...`);
                const linked = await storage.findAndLinkLeadToServiceRequest(serviceRequest.id);
                if (linked) {
                  console.log(`Webhook Stripe: Lead automatiquement lié à la demande ${serviceRequest.id}`);
                  
                  // Récupérer la demande mise à jour avec le leadId
                  const updatedRequest = await storage.getServiceRequest(serviceRequest.id);
                  
                  // Mettre à jour les infos de paiement du lead nouvellement lié
                  if (updatedRequest?.leadId) {
                    await storage.updateLeadPaymentInfo(updatedRequest.leadId, {
                      paymentStatus: "paid",
                      paymentId: paymentIntent.id,
                      paymentAmount: paymentIntent.amount / 100,
                      cardDetails: paymentDetails
                    });
                  }
                } else {
                  console.log(`Webhook Stripe: Aucun lead disponible pour liaison automatique avec la demande ${serviceRequest.id}`);
                }
              }
            } else {
              console.log(`Paiement déjà marqué comme payé pour la référence ${referenceNumber}. Aucune action nécessaire.`);
            }
          }
        }
      } else if (event.type === 'payment_intent.payment_failed') {
        const failedPaymentIntent = event.data.object;
        console.log(`PaymentIntent failed: ${failedPaymentIntent.id}`);
        
        // Récupérer la référence de la demande depuis les métadonnées
        const failedRefNumber = failedPaymentIntent.metadata?.referenceNumber;
        
        if (failedRefNumber) {
          // Mettre à jour le statut de paiement dans la base de données
          const serviceRequest = await storage.getServiceRequestByReference(failedRefNumber);
          
          if (serviceRequest) {
            // Récupérer les détails de paiement même en cas d'échec
            let paymentDetails: {
              cardBrand?: string;
              cardLast4?: string;
              cardExpMonth?: number;
              cardExpYear?: number;
              billingName?: string;
              bankName?: string;
              paymentMethod?: string;
            } = {};
            
            try {
              // Tenter de récupérer les détails de la carte
              if (failedPaymentIntent.latest_charge && typeof failedPaymentIntent.latest_charge === 'string') {
                const charge = await stripe.charges.retrieve(failedPaymentIntent.latest_charge);
                
                if (charge.payment_method_details?.card) {
                  const card = charge.payment_method_details.card;
                  paymentDetails = {
                    cardBrand: card.brand || '',
                    cardLast4: card.last4 || '',
                    cardExpMonth: card.exp_month || undefined,
                    cardExpYear: card.exp_year || undefined,
                    billingName: charge.billing_details?.name || '',
                    paymentMethod: charge.payment_method_details.type || 'card',
                    bankName: card.issuer || ''
                  };
                }
              } else if (failedPaymentIntent.payment_method && typeof failedPaymentIntent.payment_method === 'string') {
                // Si pas de charge mais un payment_method, essayer de récupérer les infos
                const paymentMethod = await stripe.paymentMethods.retrieve(failedPaymentIntent.payment_method);
                
                if (paymentMethod.type === 'card' && paymentMethod.card) {
                  paymentDetails = {
                    cardBrand: paymentMethod.card.brand || '',
                    cardLast4: paymentMethod.card.last4 || '',
                    cardExpMonth: paymentMethod.card.exp_month || undefined,
                    cardExpYear: paymentMethod.card.exp_year || undefined,
                    billingName: paymentMethod.billing_details?.name || '',
                    paymentMethod: paymentMethod.type || 'card',
                    bankName: paymentMethod.card.issuer || ''
                  };
                }
              }
              
              console.log('Détails de paiement échoué récupérés:', paymentDetails);
              
              // Stocker les détails de carte pour le lead associé également
              if (serviceRequest.leadId) {
                console.log(`Mise à jour des infos de paiement échoué pour le lead ${serviceRequest.leadId}`);
                
                // Capturer l'erreur éventuelle de Stripe pour la stocker également
                const paymentError = failedPaymentIntent.last_payment_error ? {
                  code: failedPaymentIntent.last_payment_error.code,
                  message: failedPaymentIntent.last_payment_error.message,
                  type: failedPaymentIntent.last_payment_error.type,
                  decline_code: failedPaymentIntent.last_payment_error.decline_code
                } : undefined;
                
                await storage.updateLeadPaymentInfo(serviceRequest.leadId, {
                  paymentStatus: "failed",
                  paymentId: failedPaymentIntent.id,
                  paymentAmount: failedPaymentIntent.amount / 100,
                  cardDetails: paymentDetails,
                  paymentError: paymentError
                });
              }
            } catch (error) {
              console.error('Erreur lors de la récupération des détails du paiement échoué:', error);
              // Ne pas bloquer le processus en cas d'erreur
            }
            
            // Ne mettre à jour que si le statut n'est pas déjà "paid" ou "succeeded"
            // Ainsi on ne revient pas en arrière pour les paiements réussis
            if (serviceRequest.paymentStatus !== "paid" && serviceRequest.paymentStatus !== "succeeded") {
              // Mettre à jour les informations de paiement avec les détails bancaires
              await storage.updateServiceRequestPayment(
                serviceRequest.id,
                failedPaymentIntent.id,
                "failed",
                failedPaymentIntent.amount / 100,
                paymentDetails
              );
              
              // Logger l'activité
              await storage.logActivity({
                userId: 0, // 0 = système
                entityType: "service_request",
                entityId: serviceRequest.id,
                action: ACTIVITY_ACTIONS.PAYMENT_FAILED,
                details: `Échec du paiement via webhook Stripe: ${failedPaymentIntent.id}`,
                ipAddress: req.ip
              });
            } else {
              console.log(`Ne pas mettre à jour le statut car déjà payé pour la référence ${failedRefNumber}. Statut actuel: ${serviceRequest.paymentStatus}`);
            }
          }
        }
      } else {
        console.log(`Type d'événement Stripe non géré: ${event.type}`);
      }
      
      // Répondre pour confirmer la réception
      res.json({ received: true });
    } catch (error) {
      console.error("Error in Stripe webhook:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du traitement du webhook" 
      });
    }
  });
  
  // Obtenir le certificat d'une demande
  app.get("/api/certificate/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      
      if (!referenceNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "La référence est requise" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée avec cette référence" 
        });
      }
      
      // Vérifier si un certificat existe
      if (!(await certificateExists(referenceNumber))) {
        // Générer un nouveau certificat
        await generateCertificate(serviceRequest);
      }
      
      // Récupérer le contenu du certificat
      const certificateContent = await getCertificateContent(referenceNumber);
      
      if (!certificateContent) {
        return res.status(404).json({ 
          success: false, 
          message: "Certificat non trouvé" 
        });
      }
      
      // Envoyer le certificat comme réponse HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(certificateContent);
    } catch (error) {
      console.error("Error retrieving certificate:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération du certificat" 
      });
    }
  });

  // Claude AI powered routes
  // Analyze a service request using Claude
  app.get("/api/claude/analyze/:referenceNumber", requireAuth, async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      const analysis = await claudeApi.analyzeServiceRequest(serviceRequest);
      
      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      console.error("Error analyzing service request with Claude:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'analyse de la demande" 
      });
    }
  });

  // Generate customer response using Claude
  app.get("/api/claude/response/:referenceNumber", requireAuth, async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      const response = await claudeApi.generateCustomerResponse(serviceRequest);
      
      res.json({
        success: true,
        response
      });
    } catch (error) {
      console.error("Error generating customer response with Claude:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la génération de la réponse" 
      });
    }
  });

  // Estimate price using Claude
  app.get("/api/claude/price/:referenceNumber", requireAuth, async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      const priceEstimate = await claudeApi.estimatePrice(serviceRequest);
      
      res.json({
        success: true,
        priceEstimate
      });
    } catch (error) {
      console.error("Error estimating price with Claude:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'estimation du prix" 
      });
    }
  });

  // Answer a question using Claude
  app.post("/api/claude/question", requireAuth, async (req, res) => {
    try {
      const { question, context } = req.body;
      
      if (!question) {
        return res.status(400).json({ 
          success: false, 
          message: "La question est requise" 
        });
      }
      
      const answer = await claudeApi.answerQuestion(question, context);
      
      res.json({
        success: true,
        answer
      });
    } catch (error) {
      console.error("Error answering question with Claude:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du traitement de votre question" 
      });
    }
  });

  // Admin routes for data analysis with Claude (not exposed in UI)
  
  // Analyze recent service requests and store the analysis in the database
  app.post("/api/admin/analyze-requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log("Starting bulk analysis of recent service requests...");
      const result = await claudeDataAnalyzer.analyzeRecentRequests();
      
      res.json({
        success: true,
        message: "Analyse des demandes terminée avec succès",
        result
      });
    } catch (error) {
      console.error("Error analyzing recent requests:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'analyse des demandes" 
      });
    }
  });

  // Generate a response for a specific service request
  app.post("/api/admin/generate-response/:referenceNumber", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      console.log(`Generating response for request ${referenceNumber}...`);
      
      const response = await claudeDataAnalyzer.generateResponseForRequest(referenceNumber);
      
      res.json({
        success: true,
        message: "Réponse générée avec succès",
        response
      });
    } catch (error) {
      console.error(`Error generating response for request ${req.params.referenceNumber}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la génération de la réponse" 
      });
    }
  });

  // Categorize uncategorized service requests
  app.post("/api/admin/categorize-requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log("Starting categorization of service requests...");
      const categorizedCount = await claudeDataAnalyzer.categorizeRequests();
      
      res.json({
        success: true,
        message: `${categorizedCount} demandes catégorisées avec succès`,
        categorizedCount
      });
    } catch (error) {
      console.error("Error categorizing requests:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la catégorisation des demandes" 
      });
    }
  });

  // Routes pour les animations UI
  app.get("/api/ui/animations", async (_req, res) => {
    try {
      const animations = await storage.getAllUiAnimations();
      res.json(animations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/ui/animations/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const animations = await storage.getUiAnimationsByCategory(category);
      res.json(animations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route pour configurer le serveur SMTP (admin uniquement)
  app.post("/api/smtp/config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { host, port, secure, user, password } = req.body;
      
      if (!host || !user || !password) {
        return res.status(400).json({
          success: false,
          message: "Paramètres SMTP incomplets"
        });
      }
      
      // Mettre à jour la configuration SMTP
      const success = updateSmtpConfig({
        host,
        port: Number(port) || 587,
        secure: Boolean(secure),
        auth: {
          user,
          pass: password
        },
        defaultFrom: user, // Utiliser l'adresse utilisateur comme expéditeur par défaut
        enabled: true // Activer par défaut
      });
      
      if (success) {
        res.json({
          success: true,
          message: "Configuration SMTP mise à jour avec succès"
        });
      } else {
        throw new Error("Échec de la configuration SMTP");
      }
    } catch (error) {
      console.error("Erreur lors de la configuration SMTP:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la configuration SMTP"
      });
    }
  });
  
  // Route pour l'envoi d'emails de contact - Déplacée et fusionnée à la ligne ~3726
  
  // API pour stocker les préférences de cookies
  app.post("/api/store-cookie-preferences", async (req, res) => {
    const { sessionId, preferences } = req.body;
    
    if (!sessionId || !preferences) {
      return res.status(400).json({ 
        success: false, 
        error: "Données invalides, sessionId et preferences sont requis" 
      });
    }
    
    try {
      // Log des préférences pour le débogage
      console.log(`Préférences de cookies reçues pour la session ${sessionId}:`, preferences);
      
      // Dans un contexte de production, on stockerait ces données en DB
      // Exemple: await db.insert(cookiePreferences).values({ sessionId, preferences: JSON.stringify(preferences) });
      
      // Si la route est appelée par un utilisateur connecté, on peut associer les préférences à son profil
      if (req.user) {
        console.log(`Associer les préférences de cookies à l'utilisateur ${req.user.id}`);
        // Exemple: await db.update(users).set({ cookiePreferences: JSON.stringify(preferences) }).where(eq(users.id, req.user.id));
        
        // Logger l'activité
        try {
          await storage.logActivity({
            entityType: "user",
            entityId: req.user.id,
            action: "cookie_preferences_updated",
            userId: req.user.id,
            details: JSON.stringify({ preferences })
          });
        } catch (logError) {
          console.error("Erreur lors de la journalisation de l'activité:", logError);
          // Ne pas bloquer le traitement en cas d'erreur de journalisation
        }
      }
      
      // Simuler un stockage réussi
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erreur lors du stockage des préférences de cookies:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erreur lors du stockage des préférences" 
      });
    }
  });
  
  // Envoie un email à un client (réservé à l'admin/manager)
  app.post("/api/send-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { to, subject, content, referenceNumber } = req.body;
      
      if (!to || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: "Le destinataire, le sujet et le contenu sont requis"
        });
      }
      
      // Vérifier si la demande existe
      if (referenceNumber) {
        const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
        if (!serviceRequest) {
          return res.status(404).json({
            success: false,
            message: "Demande non trouvée avec cette référence"
          });
        }
      }
      
      // Envoyer l'email
      const emailSent = await sendContactEmail({
        name: "Service client RaccordementElec",
        email: to,
        subject,
        message: content
      });
      
      if (emailSent) {
        // Loguer l'activité
        if (referenceNumber) {
          const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
          await storage.logActivity({
            entityType: "service_request",
            entityId: serviceRequest?.id || 0,
            action: "email_sent",
            userId: req.user?.id || 0,
            details: `Email envoyé à ${to}: ${subject}`
          });
        }
        
        res.status(200).json({
          success: true,
          message: "Email envoyé avec succès"
        });
      } else {
        throw new Error("Échec de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'envoi de l'email"
      });
    }
  });
  
  // Cette route a été migrée vers une implémentation unique au niveau de /api/email-templates
  
  // Routes pour les certificats
  // Route pour servir les fichiers de certificat
  app.get("/api/certificates/file/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      
      // Vérifier si un certificat existe pour cette référence
      const exists = await certificateExists(referenceNumber);
      
      if (!exists) {
        return res.status(404).send("Certificat non trouvé");
      }
      
      // Récupérer le contenu du certificat
      const content = await getCertificateContent(referenceNumber);
      
      if (!content) {
        return res.status(404).send("Certificat non trouvé");
      }
      
      // Envoyer le certificat HTML
      res.setHeader("Content-Type", "text/html");
      res.send(content);
    } catch (error) {
      console.error("Erreur lors de la récupération du fichier certificat:", error);
      res.status(500).send("Une erreur est survenue lors de la récupération du certificat");
    }
  });
  
  app.get("/api/certificates/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      
      // Vérifier si un certificat existe pour cette référence
      const exists = await certificateExists(referenceNumber);
      
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Aucun certificat trouvé pour cette référence"
        });
      }
      
      // Récupérer l'URL du certificat
      const url = await getCertificateUrl(referenceNumber);
      
      if (!url) {
        return res.status(404).json({
          success: false,
          message: "Certificat introuvable"
        });
      }
      
      res.json({
        success: true,
        url
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du certificat:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération du certificat"
      });
    }
  });
  
  // Route pour récupérer et télécharger un fichier de contrat directement
  app.get("/api/contracts/file/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          message: "ID de lead invalide"
        });
      }
      
      const contractContent = await getContractContent(leadId);
      
      if (!contractContent) {
        return res.status(404).json({
          success: false,
          message: "Contrat non trouvé"
        });
      }
      
      res.header('Content-Type', 'text/html');
      res.send(contractContent);
    } catch (error) {
      console.error("Erreur lors de la récupération du fichier de contrat:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération du contrat"
      });
    }
  });
  
  // Routes pour la gestion des contrats pour les leads
  app.get("/api/contracts/:leadId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          message: "ID de lead invalide"
        });
      }
      
      // Vérifier si un contrat existe
      const exists = await contractExists(leadId);
      
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Aucun contrat trouvé pour ce lead"
        });
      }
      
      // Récupérer l'URL du contrat
      const url = await getContractUrl(leadId);
      
      if (!url) {
        return res.status(404).json({
          success: false,
          message: "Contrat introuvable"
        });
      }
      
      res.json({
        success: true,
        url
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du contrat:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération du contrat"
      });
    }
  });
  
  app.post("/api/contracts/:leadId/generate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          message: "ID de lead invalide"
        });
      }
      
      // Récupérer les informations du lead
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead introuvable"
        });
      }
      
      // Vérifier si un contrat existe déjà
      const exists = await contractExists(leadId);
      
      if (exists) {
        const url = await getContractUrl(leadId);
        return res.json({
          success: true,
          message: "Le contrat existe déjà",
          url
        });
      }
      
      // Générer le contrat
      const fileName = await generateContract(lead);
      
      // Mettre à jour le statut du lead pour indiquer qu'un contrat a été généré
      await storage.updateLeadField(leadId, 'hasContract', true);
      
      // Logger l'activité
      await storage.logActivity({
        entityType: "lead",
        entityId: leadId,
        action: "contract_generated",
        userId: req.user?.id || 0,
        details: JSON.stringify({ fileName })
      });
      
      res.json({
        success: true,
        message: "Contrat généré avec succès",
        url: fileName
      });
    } catch (error) {
      console.error("Erreur lors de la génération du contrat:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la génération du contrat"
      });
    }
  });

  app.post("/api/certificates/:referenceNumber/generate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      
      // Récupérer la demande de service
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Demande non trouvée"
        });
      }
      
      // Générer le certificat
      const url = await generateCertificate(serviceRequest);
      
      // Loguer l'activité
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "certificate_generated",
        entityType: "service_request",
        entityId: serviceRequest.id,
        details: `Certificat généré pour la demande ${referenceNumber}`
      });
      
      res.json({
        success: true,
        message: "Certificat généré avec succès",
        url
      });
    } catch (error) {
      console.error("Erreur lors de la génération du certificat:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la génération du certificat"
      });
    }
  });
  
  // Route pour récupérer les templates d'email (implémentation unifiée)
  app.get("/api/email-templates", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Récupération des templates depuis la base de données
      const templates = await db.select().from(emailTemplates);
      res.json(templates);
    } catch (error) {
      console.error("Erreur lors de la récupération des templates d'email:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des templates d'email"
      });
    }
  });
  
  app.post("/api/send-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { to, subject, content, referenceNumber } = req.body;
      
      if (!to || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: "Les champs 'to', 'subject' et 'content' sont requis"
        });
      }
      
      // Loguer l'activité d'envoi d'email
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "email_sent",
        entityType: "service_request",
        entityId: (await storage.getServiceRequestByReference(referenceNumber))?.id || 0,
        details: `Email envoyé à ${to} avec pour sujet "${subject}"`,
        ipAddress: req.ip
      });
      
      // Pour l'instant, simuler l'envoi d'email
      console.log(`Email envoyé à ${to}`);
      console.log(`Sujet: ${subject}`);
      console.log(`Contenu: ${content}`);
      
      res.json({
        success: true,
        message: "Email envoyé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'envoi de l'email"
      });
    }
  });
  
  app.get("/api/ui/animations/:id([0-9]+)", async (req, res) => {
    try {
      const animation = await storage.getUiAnimation(parseInt(req.params.id));
      if (!animation) {
        return res.status(404).json({ error: "Animation not found" });
      }
      res.json(animation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/ui/animations", requireAuth, requireAdmin, async (req, res) => {
    try {
      const animation = await storage.createUiAnimation(req.body);
      res.status(201).json(animation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put("/api/ui/animations/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const animation = await storage.updateUiAnimation(
        parseInt(req.params.id), 
        req.body,
        (req.user as any).id
      );
      if (!animation) {
        return res.status(404).json({ error: "Animation not found" });
      }
      res.json(animation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.patch("/api/ui/animations/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
    try {
      const animation = await storage.toggleUiAnimation(
        parseInt(req.params.id),
        (req.user as any).id
      );
      if (!animation) {
        return res.status(404).json({ error: "Animation not found" });
      }
      res.json(animation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Obtenir tous les utilisateurs pour assignation
  app.get("/api/users/list-for-assign", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Formaté pour le dropdown d'assignation
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName || user.username,
        role: user.role
      }));
      
      res.json({
        success: true,
        users: formattedUsers
      });
    } catch (error: any) {
      console.error("Error retrieving users for assign:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des utilisateurs",
        error: error.message
      });
    }
  });

  // Routes API pour les contacts

// 1. Route principale pour récupérer tous les contacts (doit être AVANT les routes avec paramètres)
app.get("/api/contacts", requireAuth, requireAdminOrManager, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const { contacts, total } = await storage.getContactsPaginated(page, limit);
    
    return res.json({
      success: true,
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des contacts"
    });
  }
});

// 2. Route pour obtenir le nombre de contacts non lus
app.get("/api/contacts/unread-count", requireAuth, requireAdminOrManager, async (req, res) => {
  try {
    const count = await storage.getUnreadContactsCount();
    
    return res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de contacts non lus:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération du nombre de contacts non lus"
    });
  }
});

// 3. Route pour soumettre un nouveau formulaire de contact
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message, subject, source = "contact_form" } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Les champs nom, email et message sont obligatoires"
      });
    }
    
    // Déterminer la priorité du message en fonction de son contenu
    let priority = 'normal';
    try {
      // Utiliser directement la fonction depuis emailService
      priority = determineContactPriority({ name, email, subject, message });
    } catch (priorityError) {
      console.error("Erreur lors de la détermination de la priorité:", priorityError);
      // En cas d'erreur, garder la priorité par défaut
    }
    
    // Enregistrement du contact dans la base de données avec les nouveaux champs
    const newContact = await storage.createContact({
      name,
      email,
      phone: phone || "",
      message,
      subject: subject || "", // Nouveau champ
      priority, // Nouveau champ
      source,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || ""
    });
    
    // Préparation des données pour les emails
    const contactData = {
      name,
      email,
      subject,
      message
    };
    
    // Envoi de l'email standard (confirmation à l'utilisateur et copie à l'admin)
    const emailSent = await sendContactEmail(contactData);
    
    // Envoi des notifications par email aux membres du staff (admins et agents)
    try {
      await sendContactNotificationToStaff(contactData);
    } catch (notifError) {
      console.error("Erreur lors de l'envoi des notifications aux membres du staff:", notifError);
      // Ne pas bloquer le processus si les notifications échouent
    }
    
    // Journalisation de l'activité
    await storage.logActivity({
      userId: 1, // Admin par défaut
      action: "create",
      entityType: "contact",
      entityId: newContact.id,
      details: JSON.stringify({ name, email, subject, source, priority }),
      ipAddress: req.ip
    });
    
    // Notification en temps réel via WebSocket avec priorité
    notificationService.createContactNotification({
      id: newContact.id,
      name,
      email,
      phone: phone || "",
      message,
      subject,
      priority,
      source,
      createdAt: newContact.createdAt,
      status: newContact.status
    });
    
    console.log(`Nouveau contact créé avec priorité: ${priority}`, {
      id: newContact.id,
      email,
      subject,
      priority
    });
    
    if (!emailSent) {
      // Même si l'email n'a pas pu être envoyé, le contact a été enregistré
      return res.status(201).json({
        success: true,
        message: "Contact enregistré, mais l'email n'a pas pu être envoyé",
        contact: newContact
      });
    }
    
    return res.status(201).json({
      success: true,
      message: "Votre message a bien été envoyé",
      contact: newContact
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du contact:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'envoi du message"
    });
  }
});

// La route pour récupérer les contacts a été déplacée en début de fichier

// Route pour marquer un contact comme lu
app.patch("/api/contacts/:id/status", requireAuth, requireAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }
    
    const updatedContact = await storage.updateContactStatus(parseInt(id), status, req.user?.id);
    
    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact non trouvé"
      });
    }
    
    return res.json({
      success: true,
      message: `Statut du contact mis à jour: ${status}`,
      contact: updatedContact
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du contact:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du contact"
    });
  }
});

// La route pour obtenir le nombre de contacts non lus a été déplacée en début de fichier

// Routes de gestion des utilisateurs (Admin uniquement)
  
  // Tester la configuration SMTP d'un utilisateur
  app.post("/api/users/test-smtp", requireAuth, async (req, res) => {
    try {
      // Récupérer les données de la requête
      const {
        userId,
        to,
        subject,
        message,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        smtpFromEmail
      } = req.body;
      
      console.log("Test SMTP avec les paramètres:", {
        userId,
        to,
        subject,
        smtpHost: smtpHost ? "[fourni]" : "[non fourni]",
        smtpPort: smtpPort ? "[fourni]" : "[non fourni]",
        smtpUser: smtpUser ? "[fourni]" : "[non fourni]",
        smtpPassword: smtpPassword ? "[fourni]" : "[non fourni]",
        smtpFromEmail: smtpFromEmail ? "[fourni]" : "[non fourni]"
      });

      // Vérifier que l'utilisateur est admin ou que c'est son propre compte
      if (req.user?.role !== USER_ROLES.ADMIN && req.user?.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Vous n'avez pas les permissions nécessaires pour tester cette configuration SMTP"
        });
      }
      
      let emailDestination = to;
      let smtpConfig;

      // Si l'utilisateur ID est fourni, récupérer ses informations
      if (userId) {
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Utilisateur non trouvé"
          });
        }

        // Utiliser l'email de l'utilisateur si aucune destination n'est fournie
        if (!emailDestination && user.email) {
          emailDestination = user.email;
        }

        // Si cet utilisateur a déjà une configuration SMTP, l'utiliser par défaut
        if (user.smtpEnabled && user.smtpHost && user.smtpUser && user.smtpFromEmail) {
          smtpConfig = {
            host: smtpHost || user.smtpHost,
            port: smtpPort || user.smtpPort || 465,
            secure: smtpSecure !== undefined ? smtpSecure : (user.smtpSecure !== false),
            auth: {
              user: smtpUser || user.smtpUser,
              pass: smtpPassword || user.smtpPassword
            },
            from: smtpFromEmail || user.smtpFromEmail
          };
        }
      }

      // Si aucune configuration SMTP n'a été trouvée dans l'utilisateur,
      // utiliser les paramètres fournis
      if (!smtpConfig) {
        // Vérifier les paramètres minimaux requis pour un test SMTP
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !smtpFromEmail) {
          // Pour la création d'un nouvel utilisateur, utiliser la configuration par défaut
          // du serveur si l'utilisateur est un admin
          if (req.user?.role === USER_ROLES.ADMIN) {
            // Récupérer la configuration SMTP globale
            const globalConfig = await emailService.getSmtpConfig();
            
            if (globalConfig.enabled) {
              smtpConfig = {
                host: smtpHost || globalConfig.host,
                port: smtpPort || globalConfig.port,
                secure: smtpSecure !== undefined ? smtpSecure : globalConfig.secure,
                auth: {
                  user: smtpUser || globalConfig.auth.user,
                  pass: smtpPassword || globalConfig.auth.pass
                },
                from: smtpFromEmail || globalConfig.defaultFrom
              };
            } else {
              return res.status(400).json({
                success: false,
                message: "Configuration SMTP globale non disponible. Tous les champs SMTP sont requis."
              });
            }
          } else {
            return res.status(400).json({
              success: false,
              message: "Tous les champs SMTP sont requis pour effectuer le test"
            });
          }
        } else {
          // Utiliser les paramètres fournis
          smtpConfig = {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
              user: smtpUser,
              pass: smtpPassword
            },
            from: smtpFromEmail
          };
        }
      }

      // Vérifier qu'une adresse email destination est disponible
      if (!emailDestination) {
        return res.status(400).json({
          success: false,
          message: "Une adresse email de destination est requise pour le test"
        });
      }
      
      // Tester la configuration SMTP
      const testResult = await testSmtpConfig({
        to: emailDestination,
        testConfig: smtpConfig,
        subject: subject || "Test de configuration SMTP",
        message: message || "Ceci est un test de configuration SMTP. Si vous recevez cet email, la configuration fonctionne correctement."
      });
      
      if (testResult.success) {
        res.json({
          success: true,
          message: "La configuration SMTP a été testée avec succès"
        });
      } else {
        res.status(400).json({
          success: false,
          message: testResult.error || "Échec du test SMTP"
        });
      }
    } catch (error) {
      console.error("Error testing SMTP config:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors du test de la configuration SMTP"
      });
    }
  });
  
  // Récupérer l'utilisateur actuel (session)
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }

      // Récupérer les données complètes de l'utilisateur depuis la base de données
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      // Retourner les données complètes de l'utilisateur (y compris permissions)
      res.json(user);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({
        success: false, 
        message: "Une erreur est survenue lors de la récupération des données utilisateur"
      });
    }
  });
  
  // Récupérer tous les utilisateurs
  app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error retrieving all users:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des utilisateurs" 
      });
    }
  });
  
  // Récupérer les utilisateurs par rôle
  app.get("/api/users/role/:role", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      console.error(`Error retrieving users with role ${req.params.role}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des utilisateurs" 
      });
    }
  });
  
  // Créer un utilisateur
  // Endpoints pour la gestion de l'onboarding des responsables
  app.get("/api/users/current/settings", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }
      
      // Retourne uniquement les informations nécessaires pour l'onboarding
      return res.status(200).json({
        success: true,
        onboardingCompleted: !!user.onboardingCompleted,
        role: user.role
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres utilisateur:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des paramètres utilisateur"
      });
    }
  });
  
  app.post("/api/users/current/complete-onboarding", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }
      
      // Mettre à jour l'état d'onboarding de l'utilisateur
      await db.update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, userId));
      
      // Logger l'activité
      await storage.logActivity({
        userId: userId,
        action: "onboarding_completed",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({ role: req.user?.role }),
        ipAddress: req.ip
      });
      
      return res.status(200).json({
        success: true,
        message: "Onboarding marqué comme complété avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état d'onboarding:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la mise à jour de l'état d'onboarding"
      });
    }
  });

  app.post("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log("====== DÉBUT CRÉATION UTILISATEUR ======");
      console.log("Création d'utilisateur - données reçues:", JSON.stringify(req.body));
      console.log("Headers:", req.headers);
      
      // Validate user data
      console.log("Validation du schéma utilisateur...");
      // Création d'une copie des données avec la propriété permissions assurée
      const userData = {
        ...req.body,
        permissions: req.body.permissions || [],
      };
      console.log("Données à valider:", JSON.stringify(userData));
      const validationResult = userValidationSchema.safeParse(userData);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        console.log("Erreur de validation:", JSON.stringify(validationError));
        return res.status(400).json({ 
          success: false, 
          message: "Erreur de validation", 
          errors: validationError.details 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validationResult.data.username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Ce nom d'utilisateur existe déjà" 
        });
      }
      
      // Hash password before creating user
      const validatedData = { ...validationResult.data };
      try {
        // La transformation de commissionRate est maintenant gérée par le schéma de validation
        validatedData.password = await hash(validatedData.password, 10);
      } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).json({
          success: false,
          message: "Erreur lors du hachage du mot de passe"
        });
      }
      
      console.log("Utilisateur validé, données à enregistrer:", JSON.stringify(validatedData));
      
      // Create user
      const user = await storage.createUser(validatedData);
      console.log("Utilisateur créé avec succès:", JSON.stringify(user));
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "create",
        entityType: "user",
        entityId: user.id,
        details: JSON.stringify({ username: user.username, role: user.role }),
        ipAddress: req.ip
      });
      
      // Envoyer email de bienvenue avec le mot de passe en clair
      try {
        // Mot de passe original (avant hachage)
        const clearPassword = req.body.password;
        
        await emailService.sendWelcomeEmail({
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          password: clearPassword // Le mot de passe original avant hachage
        });
        
        console.log(`Email de bienvenue envoyé à ${user.email}`);
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email de bienvenue:", emailError);
        // On ne retourne pas d'erreur ici, car l'utilisateur a été créé avec succès
      }
      
      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès et email de bienvenue envoyé",
        user
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la création de l'utilisateur" 
      });
    }
  });
  
  // Mettre à jour un utilisateur
  app.patch("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userData = { ...req.body };
      
      // Check if user exists
      const existingUser = await storage.getUser(Number(id));
      if (!existingUser) {
        return res.status(404).json({ 
          success: false, 
          message: "Utilisateur non trouvé" 
        });
      }
      
      // Check if username is being changed and if it already exists
      if (userData.username && userData.username !== existingUser.username) {
        const userWithUsername = await storage.getUserByUsername(userData.username);
        if (userWithUsername) {
          return res.status(400).json({ 
            success: false, 
            message: "Ce nom d'utilisateur existe déjà" 
          });
        }
      }
      
      // La transformation de commissionRate est maintenant gérée par le schéma de validation
      
      // Hash password if provided
      if (userData.password) {
        try {
          userData.password = await hash(userData.password, 10);
        } catch (error) {
          console.error("Error hashing password:", error);
          return res.status(500).json({
            success: false,
            message: "Erreur lors du hachage du mot de passe"
          });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(Number(id), userData);
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "update",
        entityType: "user",
        entityId: updatedUser.id,
        details: JSON.stringify(userData),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Utilisateur mis à jour avec succès",
        user: updatedUser
      });
    } catch (error) {
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la mise à jour de l'utilisateur" 
      });
    }
  });
  
  // Désactiver un utilisateur (soft delete)
  app.delete("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await storage.getUser(Number(id));
      if (!existingUser) {
        return res.status(404).json({ 
          success: false, 
          message: "Utilisateur non trouvé" 
        });
      }
      
      // Prevent self-deletion
      if (existingUser.id === req.user?.id) {
        return res.status(400).json({ 
          success: false, 
          message: "Vous ne pouvez pas supprimer votre propre compte" 
        });
      }
      
      // Instead of physically deleting, just deactivate
      const updatedUser = await storage.updateUser(Number(id), { active: false });
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "delete",
        entityType: "user",
        entityId: Number(id),
        details: JSON.stringify({ username: existingUser.username }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Utilisateur désactivé avec succès",
        user: updatedUser
      });
    } catch (error) {
      console.error(`Error deactivating user ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la désactivation de l'utilisateur" 
      });
    }
  });

  // Routes pour la gestion des notifications
  
  // Récupérer toutes les notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // Récupérer les paiements récents
      const recentPayments = await storage.getRecentPayments(5);
      
      // Récupérer les demandes récentes
      const recentRequests = await storage.getRecentServiceRequests(5);
      
      // Combiner et formatter les notifications
      const notifications = [
        ...recentPayments.map(payment => ({
          id: `payment-${payment.id}`,
          type: "payment",
          title: "Nouveau paiement reçu",
          message: `Paiement de ${payment.amount}€ reçu pour ${payment.referenceNumber}`,
          time: new Date(payment.createdAt).toISOString(),
          read: false,
          data: payment
        })),
        ...recentRequests.map(request => ({
          id: `request-${request.id}`,
          type: "lead",
          title: "Nouvelle demande soumise",
          message: `${request.name || 'Client'} a soumis une demande de raccordement`,
          time: new Date(request.createdAt).toISOString(),
          read: false,
          data: request
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      res.json({
        success: true,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length
      });
    } catch (error) {
      console.error("Error retrieving notifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la récupération des notifications" 
      });
    }
  });
  
  // Récupérer les notifications non lues uniquement
  app.get("/api/notifications/unread", async (req, res) => {
    try {
      // Cette route retourne toutes les notifications en les marquant comme non lues
      // Ce comportement spécial est conçu pour garantir la compatibilité avec le client
      // qui s'attend à ce que cette route retourne un tableau, pas un objet
      
      // Récupérer les paiements récents
      const recentPayments = await storage.getRecentPayments(3);
      
      // Récupérer les demandes récentes
      const recentRequests = await storage.getRecentServiceRequests(3);
      
      // Combiner et formatter les notifications
      const unreadNotifications = [
        ...recentPayments.map(payment => ({
          id: `payment-${payment.id}`,
          type: "payment",
          title: "Nouveau paiement reçu",
          message: `Paiement de ${payment.amount}€ reçu pour ${payment.referenceNumber}`,
          time: new Date(payment.createdAt).toISOString(),
          read: false,
          data: payment
        })),
        ...recentRequests.map(request => ({
          id: `request-${request.id}`,
          type: "lead",
          title: "Nouvelle demande soumise",
          message: `${request.name || 'Client'} a soumis une demande de raccordement`,
          time: new Date(request.createdAt).toISOString(),
          read: false,
          data: request
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      // Cette route retourne directement le tableau, sans structure success/data
      // Ce format spécial est maintenu pour la compatibilité avec le client existant
      res.json(unreadNotifications);
    } catch (error) {
      console.error("Error retrieving unread notifications:", error);
      // En cas d'erreur, renvoyer un tableau vide plutôt qu'une erreur
      // pour éviter de bloquer l'interface utilisateur
      res.json([]);
    }
  });
  
  // Marquer une notification comme lue (endpoint original)
  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      // Dans une vraie implémentation, nous stockerions l'état de lecture dans la base de données
      // Pour l'instant, nous retournons simplement un succès
      
      res.json({
        success: true,
        message: "Notification marquée comme lue"
      });
    } catch (error) {
      console.error(`Error marking notification ${req.params.id} as read:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du marquage de la notification" 
      });
    }
  });
  
  // Ajout des nouveaux endpoints compatibles avec le frontend
  
  // Marquer une notification comme lue (endpoint attendu par le frontend)
  app.post("/api/notifications/:id/mark-read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Marquage de la notification ${id} comme lue via l'endpoint mark-read`);
      
      // Ici, nous pourrions sauvegarder le statut dans la base de données
      // Pour l'instant, nous répondons simplement avec succès
      
      // Envoyer la mise à jour via WebSocket si disponible
      if (GlobalContext.wss) {
        console.log("Diffusion de la mise à jour de notification via WebSocket");
        // Broadcast de la mise à jour pour tous les clients
        GlobalContext.wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'NOTIFICATION_UPDATE',
              id,
              read: true
            }));
          }
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error marking notification ${req.params.id} as read:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du marquage de la notification" 
      });
    }
  });
  
  // Marquer toutes les notifications comme lues (endpoint attendu par le frontend)
  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      console.log("Marquage de toutes les notifications comme lues via l'endpoint mark-all-read");
      
      // Ici, nous pourrions mettre à jour le statut dans la base de données
      // Pour l'instant, nous répondons simplement avec succès
      
      // Envoyer la mise à jour via WebSocket si disponible
      if (GlobalContext.wss) {
        console.log("Diffusion de la mise à jour globale de notifications via WebSocket");
        // Broadcast de la mise à jour pour tous les clients
        GlobalContext.wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'ALL_NOTIFICATIONS_READ'
            }));
          }
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du marquage des notifications" 
      });
    }
  });

  // Marquer toutes les notifications comme lues (endpoint original)
  app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      // Dans une vraie implémentation, nous mettrions à jour la base de données
      
      res.json({
        success: true,
        message: "Toutes les notifications ont été marquées comme lues"
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du marquage des notifications" 
      });
    }
  });

  // Routes pour le flux de traitement des demandes
  
  // Assigner une demande à un traiteur
  app.post("/api/service-requests/:id/assign", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: "L'ID de l'utilisateur est requis" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequest(Number(id));
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Vérifier si l'utilisateur existe et est un traiteur
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Utilisateur non trouvé" 
        });
      }
      
      if (user.role !== USER_ROLES.AGENT) {
        return res.status(400).json({ 
          success: false, 
          message: "L'utilisateur doit être un traiteur" 
        });
      }
      
      // Assigner la demande
      const updatedRequest = await storage.assignServiceRequest(Number(id), userId, req.user?.id as number);
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "assign",
        entityType: "service_request",
        entityId: Number(id),
        details: JSON.stringify({ assignedTo: userId }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Demande assignée avec succès",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error(`Error assigning service request ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'assignation de la demande" 
      });
    }
  });
  
  // Valider une demande
  app.post("/api/service-requests/:id/validate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequest(Number(id));
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Valider la demande
      const updatedRequest = await storage.validateServiceRequest(Number(id), req.user?.id as number);
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "validate",
        entityType: "service_request",
        entityId: Number(id),
        details: JSON.stringify({ status: "validated" }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Demande validée avec succès",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error(`Error validating service request ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la validation de la demande" 
      });
    }
  });
  
  // Planifier un rendez-vous
  app.post("/api/service-requests/:id/schedule", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { date, timeSlot, enedisReference } = req.body;
      
      if (!date || !timeSlot || !enedisReference) {
        return res.status(400).json({ 
          success: false, 
          message: "La date, le créneau horaire et la référence Enedis sont requis" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequest(Number(id));
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Planifier le rendez-vous
      const updatedRequest = await storage.scheduleServiceRequest(
        Number(id), 
        new Date(date), 
        timeSlot, 
        enedisReference, 
        req.user?.id as number
      );
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "schedule",
        entityType: "service_request",
        entityId: Number(id),
        details: JSON.stringify({ date, timeSlot, enedisReference }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Rendez-vous planifié avec succès",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error(`Error scheduling service request ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la planification du rendez-vous" 
      });
    }
  });
  
  // Finaliser une demande
  app.post("/api/service-requests/:id/complete", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequest(Number(id));
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Finaliser la demande
      const updatedRequest = await storage.completeServiceRequest(Number(id), req.user?.id as number);
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "complete",
        entityType: "service_request",
        entityId: Number(id),
        details: JSON.stringify({ status: "completed" }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Demande finalisée avec succès",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error(`Error completing service request ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la finalisation de la demande" 
      });
    }
  });
  
  // Annuler une demande
  app.post("/api/service-requests/:id/cancel", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ 
          success: false, 
          message: "Le motif d'annulation est requis" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequest(Number(id));
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Annuler la demande
      const updatedRequest = await storage.cancelServiceRequest(Number(id), reason, req.user?.id as number);
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "cancel",
        entityType: "service_request",
        entityId: Number(id),
        details: JSON.stringify({ reason }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Demande annulée avec succès",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error(`Error cancelling service request ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'annulation de la demande" 
      });
    }
  });
  
  // Ajouter des notes à une demande
  app.post("/api/service-requests/:id/notes", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      if (!notes) {
        return res.status(400).json({ 
          success: false, 
          message: "Les notes sont requises" 
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequest(Number(id));
      if (!serviceRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Demande non trouvée" 
        });
      }
      
      // Ajouter les notes
      const updatedRequest = await storage.updateServiceRequestNotes(Number(id), notes, req.user?.id as number);
      
      // Log activity
      await storage.logActivity({
        userId: req.user?.id as number,
        action: "update",
        entityType: "service_request",
        entityId: Number(id),
        details: JSON.stringify({ notes }),
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Notes ajoutées avec succès",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error(`Error adding notes to service request ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'ajout des notes" 
      });
    }
  });

  // Cette route '/api/create-payment-intent' est déjà définie plus haut dans le fichier
  // Voir l'implémentation à la ligne ~260

  // Route pour ajouter un paiement manuel
  app.post('/api/manual-payment', requireAuth, requireAdmin, async (req, res) => {
    try {
      // Récupérer les données du formulaire
      const { referenceNumber, amount, customerName, customerEmail, method = 'manual', notes, paymentMethod } = req.body;
      
      // Validation renforcée des champs obligatoires
      if (!referenceNumber || referenceNumber.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "La référence de la demande est obligatoire"
        });
      }
      
      // Validation du montant (doit être un nombre positif)
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Le montant doit être un nombre positif valide"
        });
      }
      
      // Normaliser le montant avec deux décimales pour éviter les problèmes de précision
      const normalizedAmount = parseFloat(amount).toFixed(2);
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Aucune demande trouvée avec cette référence"
        });
      }
      
      // Vérifier si la demande a déjà un paiement réussi
      if (serviceRequest.paymentStatus === 'paid' && serviceRequest.paymentId) {
        // Enregistrer une alerte/activité sur une tentative de double paiement
        await storage.logActivity({
          entityType: "payment",
          entityId: serviceRequest.id,
          action: "duplicate_payment_attempt",
          userId: req.user ? req.user.id : 0,
          details: `Tentative d'ajout d'un paiement manuel pour une demande déjà payée: ${referenceNumber}`
        });
        
        return res.status(400).json({
          success: false,
          message: "Cette demande a déjà un paiement enregistré",
          paymentId: serviceRequest.paymentId
        });
      }
      
      // Générer un ID de paiement manuel unique
      const paymentId = `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Préparer les détails du paiement
      const paymentDetails = {
        method: method || 'manual',
        paymentMethod: paymentMethod || 'Manuel',
        addedBy: req.user?.id,
        addedByName: req.user ? (req.user.fullName || req.user.username) : 'Administrateur',
        addedAt: new Date().toISOString(),
        notes: notes || 'Paiement ajouté manuellement',
        ipAddress: req.ip
      };
      
      // Mettre à jour le statut de la demande de service
      await storage.updateServiceRequestPayment(
        serviceRequest.id,
        paymentId,
        'paid', // Le paiement manuel est toujours considéré comme réussi
        normalizedAmount
      );
      
      // Créer l'entrée dans la table des paiements
      const payment = await storage.createPayment({
        paymentId,
        referenceNumber,
        amount: normalizedAmount,
        status: "paid",
        method: method || 'manual',
        customerName: customerName || serviceRequest.name,
        customerEmail: customerEmail || serviceRequest.email,
        metadata: JSON.stringify({
          ...paymentDetails,
          serviceRequestId: serviceRequest.id.toString()
        }),
        createdBy: req.user ? req.user.id : undefined
      });
      
      // Enregistrer l'activité avec des détails complets
      await storage.logActivity({
        entityType: "payment",
        entityId: serviceRequest.id,
        action: "manual_payment_added",
        userId: req.user ? req.user.id : 0,
        details: JSON.stringify({
          paymentId,
          referenceNumber,
          amount: normalizedAmount,
          method: method || 'manual',
          customerName: customerName || serviceRequest.name,
          customerEmail: customerEmail || serviceRequest.email,
          ...paymentDetails
        }),
        ipAddress: req.ip
      });
      
      // Email de confirmation désactivé à la demande du client
      // Les emails de confirmation de paiement doivent être envoyés manuellement
      // par l'administrateur si nécessaire
      
      // Enregistrer dans le journal que l'email n'a pas été envoyé automatiquement
      await storage.logActivity({
        entityType: "payment",
        entityId: serviceRequest.id,
        action: "payment_email_skipped",
        userId: req.user ? req.user.id : 0,
        details: `Email de confirmation non envoyé automatiquement pour ${referenceNumber} (configuration client)`
      });
      
      res.json({
        success: true,
        message: "Paiement manuel enregistré avec succès",
        payment
      });
      
    } catch (error) {
      console.error("Erreur lors de l'ajout du paiement manuel:", error);
      // Enregistrer l'erreur dans les logs d'activité pour traçabilité
      try {
        await storage.logActivity({
          entityType: "error",
          entityId: 0,
          action: "manual_payment_error",
          userId: req.user ? req.user.id : 0,
          details: `Erreur lors de l'ajout du paiement manuel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
      } catch (logError) {
        console.error("Erreur lors de la journalisation de l'erreur:", logError);
      }
      
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du paiement manuel",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  // Route pour annuler un paiement (uniquement dans notre système, pas dans Stripe)
  app.post('/api/cancel-payment/:paymentId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      
      // Validation des entrées
      if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "L'identifiant du paiement est requis et doit être une chaîne valide"
        });
      }
      
      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Une raison d'annulation est requise"
        });
      }
      
      // Vérifier si le paiement existe
      const payment = await storage.getPaymentByPaymentId(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement non trouvé"
        });
      }
      
      // Vérifier si le paiement est déjà annulé
      if (payment.status === 'canceled') {
        return res.status(400).json({
          success: false,
          message: "Ce paiement a déjà été annulé"
        });
      }
      
      // Récupérer la demande de service associée pour la mettre à jour ensuite
      const serviceRequest = await storage.getServiceRequestByReference(payment.referenceNumber);
      
      // Annuler le paiement dans notre système
      const canceledPayment = await storage.cancelPayment(paymentId, req.user ? req.user.id : undefined);
      
      // Enregistrer l'activité avec plus de détails
      await storage.logActivity({
        entityType: "payment",
        entityId: payment.id,
        action: "payment_canceled",
        userId: req.user ? req.user.id : 0,
        details: JSON.stringify({
          paymentId,
          referenceNumber: payment.referenceNumber,
          amount: payment.amount,
          previousStatus: payment.status,
          newStatus: 'canceled',
          reason: reason,
          canceledBy: req.user ? req.user.id : undefined,
          canceledByName: req.user ? (req.user.fullName || req.user.username) : 'Système',
          canceledAt: new Date().toISOString(),
          serviceRequestId: serviceRequest ? serviceRequest.id : undefined
        }),
        ipAddress: req.ip
      });
      
      // Notifier via le WebSocket s'il est configuré
      try {
        if (wss) {
          const notification = {
            type: 'payment_canceled',
            message: `Paiement ${paymentId} annulé par ${req.user ? req.user.username : 'Administrateur'}`,
            paymentId,
            referenceNumber: payment.referenceNumber,
            canceledBy: req.user ? req.user.id : undefined,
            timestamp: new Date().toISOString()
          };
          
          // Notifier tous les clients connectés
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(notification));
            }
          });
        }
      } catch (wsError) {
        console.warn("Erreur lors de l'envoi de la notification WebSocket:", wsError);
        // Ne pas bloquer le processus si la notification échoue
      }
      
      res.json({
        success: true,
        message: "Paiement annulé avec succès",
        payment: canceledPayment
      });
      
    } catch (error) {
      console.error("Erreur lors de l'annulation du paiement:", error);
      
      // Enregistrer l'erreur dans les logs d'activité pour traçabilité
      try {
        await storage.logActivity({
          entityType: "error",
          entityId: 0,
          action: "payment_cancel_error",
          userId: req.user ? req.user.id : 0,
          details: `Erreur lors de l'annulation du paiement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
      } catch (logError) {
        console.error("Erreur lors de la journalisation de l'erreur:", logError);
      }
      
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'annulation du paiement",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  // Route dédiée pour l'API Stripe (authentification simplifiée)
  app.get('/api/stripe/payments', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // Limiter à 100 paiements par défaut
      const limit = parseInt(req.query.limit as string) || 100;
      
      // Récupérer tous les paiements avec metadata contenant une référence de notre site
      const payments = await stripe.paymentIntents.list({
        limit: Math.min(limit, 100), // Maximum 100 pour éviter les problèmes de performance
        expand: ['data.customer'],
      });
      
      // Filtrer les paiements pour n'afficher que ceux qui ont une référence de notre site (RAC- uniquement)
      const sitePayments = payments.data.filter(payment => 
        payment.metadata && payment.metadata.referenceNumber && 
        payment.metadata.referenceNumber.startsWith('RAC-')
      );
      
      // Formatter les données pour le frontend
      const formattedPayments = await Promise.all(sitePayments.map(async intent => {
        // Informations bancaires par défaut
        let bankingInfo: {
          cardBrand?: string | null,
          cardLast4?: string | null,
          cardExpMonth?: number | null,
          cardExpYear?: number | null,
          billingName?: string | null,
          bankName?: string | null
        } = {};
        
        // Tenter de récupérer les informations bancaires
        try {
          // Vérifier s'il y a une référence de demande
          if (intent.metadata?.referenceNumber) {
            // Essayer de récupérer les données bancaires depuis la base de données
            const serviceRequest = await storage.getServiceRequestByReference(intent.metadata.referenceNumber);
            if (serviceRequest) {
              bankingInfo = {
                cardBrand: serviceRequest.cardBrand,
                cardLast4: serviceRequest.cardLast4, 
                cardExpMonth: serviceRequest.cardExpMonth,
                cardExpYear: serviceRequest.cardExpYear,
                billingName: serviceRequest.billingName,
                bankName: serviceRequest.bankName
              };
            }
          }
          
          // Si on n'a pas trouvé les infos dans la BDD, essayer directement via l'API Stripe
          if (!bankingInfo.cardBrand && intent.payment_method) {
            if (typeof intent.payment_method === 'string') {
              const paymentMethod = await stripe.paymentMethods.retrieve(intent.payment_method);
              if (paymentMethod.type === 'card' && paymentMethod.card) {
                bankingInfo = {
                  cardBrand: paymentMethod.card.brand || null,
                  cardLast4: paymentMethod.card.last4 || null,
                  cardExpMonth: paymentMethod.card.exp_month || null,
                  cardExpYear: paymentMethod.card.exp_year || null,
                  billingName: paymentMethod.billing_details?.name || null,
                  bankName: paymentMethod.card.issuer || null
                };
              }
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des infos bancaires pour le paiement ${intent.id}:`, error);
        }
        
        return {
          id: intent.id,
          referenceNumber: intent.metadata?.referenceNumber || 'N/A',
          amount: intent.amount / 100, // Convertir des centimes en euros
          status: intent.status,
          createdAt: new Date(intent.created * 1000).toISOString(),
          updatedAt: intent.canceled_at 
            ? new Date(intent.canceled_at * 1000).toISOString() 
            : new Date().toISOString(),
          customerEmail: intent.receipt_email,
          customerName: intent.shipping?.name,
          paymentMethod: intent.payment_method_types.join(', '),
          metadata: intent.metadata,
          ...bankingInfo // Ajouter les informations bancaires
        };
      }));
      
      res.json(formattedPayments);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements Stripe:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des paiements"
      });
    }
  });
  
  // Obtenir la liste des paiements (pour le tableau de bord admin)
  app.get('/api/payments', requireAuth, requireAdminOrManager, async (req, res) => {
    try {
      // Récupérer d'abord les paiements depuis la base de données
      const recentPayments = await storage.getRecentPayments(100);
      
      res.json(recentPayments);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des paiements"
      });
    }
  });
  
  // Route pour ajouter un paiement manuel
  app.post('/api/payments/manual', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { referenceNumber, amount, paymentMethod, billingName, cardLast4, cardBrand } = req.body;
      
      // Validation des données d'entrée
      if (!referenceNumber) {
        return res.status(400).json({
          success: false,
          message: "Le numéro de référence est obligatoire"
        });
      }
      
      if (!referenceNumber.startsWith('RAC-')) {
        return res.status(400).json({
          success: false,
          message: "Le format de référence est invalide. Elle doit commencer par 'RAC-'"
        });
      }
      
      // Validation du montant si fourni
      if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
        return res.status(400).json({
          success: false,
          message: "Le montant doit être un nombre positif"
        });
      }
      
      // Vérifier si la demande existe
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: `Aucune demande trouvée avec la référence ${referenceNumber}`
        });
      }
      
      // Vérifier si un paiement existe déjà pour cette demande
      if (serviceRequest.paymentId && serviceRequest.paymentStatus === 'paid') {
        return res.status(409).json({
          success: false,
          message: `Un paiement est déjà enregistré pour cette demande (ID: ${serviceRequest.paymentId})`,
          paymentStatus: serviceRequest.paymentStatus
        });
      }
      
      // Générer un ID de paiement fictif pour les paiements manuels
      const paymentId = `manual_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Mettre à jour le statut de paiement dans la demande
      await storage.updateServiceRequestPayment(
        serviceRequest.id,
        paymentId,
        'paid',
        amount || 129.80,
        {
          cardBrand: cardBrand || 'manual',
          cardLast4: cardLast4 || '0000',
          billingName: billingName || 'Paiement Manuel',
          paymentMethod: paymentMethod || 'Manuel'
        }
      );
      
      // Ajouter le paiement dans l'historique des paiements
      const payment = {
        id: 0, // Sera auto-incrémenté par la BDD
        paymentId,
        referenceNumber,
        amount: amount || 129.80,
        status: 'paid',
        method: paymentMethod || 'Manuel',
        customerName: serviceRequest.name,
        customerEmail: serviceRequest.email,
        cardBrand: cardBrand || 'manual',
        cardLast4: cardLast4 || '0000',
        billingName: billingName || 'Paiement Manuel',
        createdAt: new Date(),
        createdBy: req.user?.id
      };
      
      const createdPayment = await storage.createPayment(payment);
      
      // Enregistrer l'activité d'ajout de paiement manuel
      try {
        await storage.logActivity({
          userId: req.user?.id || 0,
          action: 'payment_manual_added',
          entityType: 'payment',
          entityId: createdPayment.id,
          details: JSON.stringify({
            paymentId: createdPayment.paymentId,
            referenceNumber: createdPayment.referenceNumber,
            amount: createdPayment.amount,
            customerName: serviceRequest.name,
            customerEmail: serviceRequest.email,
            method: paymentMethod || 'Manuel',
            addedAt: new Date().toISOString(),
            addedBy: req.user?.id || 0
          })
        });
      } catch (logError) {
        console.error("Erreur lors de l'enregistrement de l'activité de paiement manuel:", logError);
        // Ne pas bloquer le processus si la journalisation échoue
      }
      
      // Email de confirmation désactivé à la demande du client
      // Les emails de confirmation de paiement doivent être envoyés manuellement
      // par l'administrateur si nécessaire

      // Logger que l'email n'a pas été envoyé (pour traçabilité)
      try {
        await storage.logActivity({
          userId: req.user?.id || 0,
          entityType: "payment",
          entityId: createdPayment.id,
          action: "payment_email_skipped", 
          details: `Email de confirmation non envoyé automatiquement pour ${referenceNumber} (configuration client)`
        });
        
        console.log(`Email de confirmation non envoyé automatiquement pour ${referenceNumber} (désactivé selon la configuration client)`);
      } catch (logError) {
        console.error("Erreur lors de la journalisation du non-envoi d'email:", logError);
      }
      
      res.status(201).json({
        success: true,
        message: "Paiement manuel ajouté avec succès",
        payment: createdPayment
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du paiement manuel:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du paiement manuel"
      });
    }
  });
  
  // Route pour annuler/rétracter un paiement
  // Marquer un paiement comme remboursé
  app.post('/api/payments/refund/:paymentId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      // Vérifier si le paiement existe dans notre base de données
      const payment = await storage.getPaymentByPaymentId(paymentId);
      
      if (!payment) {
        return res.status(404).json({
          success: false, 
          message: "Paiement non trouvé"
        });
      }
      
      // Mettre à jour le statut du paiement dans notre base de données
      await storage.updatePaymentStatus(payment.id, 'refunded');
      
      // Log administratif pour garder une trace des remboursements
      console.log(`Paiement ${payment.paymentId} (Réf: ${payment.referenceNumber}) marqué comme remboursé par l'utilisateur ${req.user?.id || 'Système'}. Heure: ${new Date().toISOString()}`);
      
      // Ajouter un enregistrement dans le journal d'activité
      try {
        await storage.logActivity({
          userId: req.user?.id || 0,
          action: "refund",
          entityType: "payment",
          entityId: payment.id,
          details: JSON.stringify({
            paymentId: payment.paymentId,
            referenceNumber: payment.referenceNumber,
            amount: payment.amount
          }),
          ipAddress: req.ip
        });
      } catch (logError) {
        console.error("Erreur lors de l'enregistrement de l'activité de remboursement:", logError);
      }
      
      res.json({ 
        success: true, 
        message: "Le paiement a été marqué comme remboursé avec succès",
        payment: { ...payment, status: 'refunded' }
      });
    } catch (error) {
      console.error('Erreur lors du marquage du paiement comme remboursé:', error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors du marquage du paiement comme remboursé" 
      });
    }
  });

  // Marquer un paiement comme annulé
  app.post('/api/payments/cancel/:paymentId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      // Vérifier si le paiement existe dans notre base de données
      const payment = await storage.getPaymentByPaymentId(paymentId);
      
      if (!payment) {
        return res.status(404).json({
          success: false, 
          message: "Paiement non trouvé"
        });
      }
      
      // Mettre à jour le statut du paiement dans notre base de données
      await storage.updatePaymentStatus(payment.id, 'canceled');
      
      // Log administratif pour garder une trace des annulations
      console.log(`Paiement ${payment.paymentId} (Réf: ${payment.referenceNumber}) marqué comme annulé par l'utilisateur ${req.user?.id || 'Système'}. Heure: ${new Date().toISOString()}`);
      
      // Ajouter un enregistrement dans le journal d'activité
      try {
        await storage.logActivity({
          userId: req.user?.id || 0,
          action: 'payment_cancelled',
          entityType: 'payment',
          entityId: payment.id,
          details: JSON.stringify({
            paymentId: payment.paymentId,
            referenceNumber: payment.referenceNumber,
            amount: payment.amount,
            customerName: payment.customerName,
            customerEmail: payment.customerEmail,
            previousStatus: payment.status,
            newStatus: 'canceled',
            cancelledAt: new Date().toISOString()
          })
        });
      } catch (logError) {
        console.error("Erreur lors de l'enregistrement de l'activité d'annulation:", logError);
        // Ne pas bloquer le processus si la journalisation échoue
      }
      
      // IMPORTANT: Nous ne modifions plus les paiements sur Stripe directement depuis notre admin
      // Les annulations ne sont que des changements de statut dans notre base de données locale
      // Les vrais remboursements ou annulations doivent être effectués directement dans l'interface Stripe
      // par le titulaire du compte
      
      // On vérifie tout de même si le paiement existe bien sur Stripe pour la cohérence des données
      if (stripe && !paymentId.startsWith('manual_')) {
        try {
          // Simple vérification de l'existence du paiement - pas d'action
          await stripe.paymentIntents.retrieve(paymentId);
          // Log informatif seulement
          console.log(`Paiement Stripe ${paymentId} marqué comme annulé dans notre système. Pas d'action sur Stripe.`);
        } catch (stripeError) {
          console.error("Erreur lors de la vérification du paiement Stripe:", stripeError);
          // On continue même si l'annulation Stripe échoue, car nous avons déjà mis à jour notre BDD
        }
      }
      
      // Si le paiement est lié à une demande, mettre à jour le statut de la demande
      if (payment.referenceNumber) {
        const serviceRequest = await storage.getServiceRequestByReference(payment.referenceNumber);
        if (serviceRequest) {
          // Conserver l'ID de paiement mais changer le statut
          await storage.updateServiceRequestPayment(
            serviceRequest.id,
            serviceRequest.paymentId || payment.paymentId,
            'canceled',
            Number(payment.amount || serviceRequest.paymentAmount || 0)
          );
          
          // Mettre à jour le statut de la demande de service
          await storage.updateServiceRequestStatus(
            serviceRequest.id,
            REQUEST_STATUS.PAYMENT_PENDING,
            req.user?.id || 0
          );
          
          // Journaliser l'activité de changement de statut de la demande
          try {
            await storage.logActivity({
              userId: req.user?.id || 0,
              action: 'service_request_status_changed',
              entityType: 'service_request',
              entityId: serviceRequest.id,
              details: JSON.stringify({
                referenceNumber: serviceRequest.referenceNumber,
                previousStatus: serviceRequest.status,
                newStatus: REQUEST_STATUS.PAYMENT_PENDING,
                reason: 'Annulation de paiement',
                paymentId: payment.paymentId,
                updatedAt: new Date().toISOString()
              })
            });
          } catch (logError) {
            console.error("Erreur lors de l'enregistrement de l'activité de changement de statut:", logError);
            // Ne pas bloquer le processus si la journalisation échoue
          }
        }
      }
      
      res.json({
        success: true,
        message: "Paiement annulé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation du paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'annulation du paiement"
      });
    }
  });
  
  // Route pour les agents pour récupérer leurs paiements avec commissions
  app.get('/api/agent/payments', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }
      
      // Paramètres de pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Récupérer les paiements de l'agent avec commissions
      const agentPayments = await storage.getAgentPayments(userId, page, limit);
      
      res.json({
        success: true,
        ...agentPayments
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements d'agent:", error);
      res.status(500).json({ 
        success: false,
        error: "Erreur lors de la récupération des paiements"
      });
    }
  });
  
  // Route pour obtenir les paiements de l'équipe (pour le tableau de bord des managers)
  app.get('/api/team/payments', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }
      
      // Récupérer les utilisateurs de l'équipe
      let teamUsers = [];
      
      if (req.user?.role === USER_ROLES.ADMIN) {
        // Les admins peuvent voir tous les agents
        const allAgents = await storage.getUsersByRole(USER_ROLES.AGENT);
        teamUsers = allAgents || [];
      } else if (req.user?.role === USER_ROLES.MANAGER) {
        // Les managers ne voient que leur équipe
        try {
          const teamMembers = await storage.getUsersForManager(userId);
          teamUsers = teamMembers || [];
        } catch (error) {
          console.error("Erreur lors de la récupération des membres de l'équipe:", error);
          teamUsers = [];
        }
      }
      
      // Récupérer les IDs des utilisateurs de l'équipe
      const teamUserIds = teamUsers.map(u => u.id);
      
      // Paramètres de pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Si l'équipe est vide, renvoyer un tableau vide
      if (teamUserIds.length === 0) {
        return res.json({
          payments: [],
          total: 0,
          commissionTotal: 0
        });
      }
      
      // Récupérer les paiements pour tous les membres de l'équipe
      let allTeamPayments = [];
      let commissionTotal = 0;
      
      for (const memberId of teamUserIds) {
        const memberPayments = await storage.getUserPayments(memberId);
        if (memberPayments && memberPayments.length > 0) {
          allTeamPayments.push(...memberPayments);
          
          // Calculer la commission (14€ par paiement de 129.80€)
          for (const payment of memberPayments) {
            if (payment.status === 'paid' || payment.status === 'succeeded') {
              const standardAmount = 12980; // Montant standard en centimes (129.80€)
              const standardCommission = 1400; // Commission standard en centimes (14€)
              
              let paymentAmount = 0;
              if (typeof payment.amount === 'string') {
                paymentAmount = parseInt(payment.amount);
              } else {
                paymentAmount = payment.amount || 0;
              }
              
              if (paymentAmount === standardAmount) {
                commissionTotal += standardCommission;
              } else if (paymentAmount > 0) {
                // Commission proportionnelle pour les montants non standard
                const ratio = paymentAmount / standardAmount;
                commissionTotal += Math.round(standardCommission * ratio);
              }
            }
          }
        }
      }
      
      // Trier par date de création (plus récent d'abord)
      allTeamPayments.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = allTeamPayments.slice(startIndex, endIndex);
      
      // Transformer les données pour adapter au format attendu par le frontend
      const formattedPayments = paginatedPayments.map(payment => {
        // Déterminer la commission pour ce paiement
        let commission = 0;
        if (payment.status === 'paid' || payment.status === 'succeeded') {
          const standardAmount = 12980; // 129.80€ en centimes
          const standardCommission = 1400; // 14€ en centimes
          
          let paymentAmount = 0;
          if (typeof payment.amount === 'string') {
            paymentAmount = parseInt(payment.amount);
          } else {
            paymentAmount = payment.amount || 0;
          }
          
          if (paymentAmount === standardAmount) {
            commission = standardCommission;
          } else if (paymentAmount > 0) {
            const ratio = paymentAmount / standardAmount;
            commission = Math.round(standardCommission * ratio);
          }
        }
        
        return {
          id: payment.id,
          paymentId: payment.paymentId,
          referenceNumber: payment.referenceNumber,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          clientName: payment.customerName || payment.billingName || "Client",
          clientEmail: payment.customerEmail || "Non disponible",
          commission
        };
      });
      
      res.json({
        payments: formattedPayments,
        total: allTeamPayments.length,
        commissionTotal
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements de l'équipe:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des paiements de l'équipe"
      });
    }
  });

  // Route pour obtenir les paiements de l'utilisateur (pour le tableau de bord)
  app.get('/api/user/payments', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }
      
      // Paramètres de pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Récupérer les paiements bruts de l'utilisateur
      const userPayments = await storage.getUserPayments(userId);
      
      // Calculer la commission totale (14€ par paiement de 129.80€)
      let commissionTotal = 0;
      
      // Transformer les données pour correspondre au format attendu par le client
      const formattedPayments = userPayments.map(payment => {
        // Calculer la commission pour ce paiement (14€ par tranche de 129.80€)
        let amountValue = 0;
        if (typeof payment.amount === 'string') {
          amountValue = parseInt(payment.amount);
        } else {
          amountValue = payment.amount || 12980;
        }
        
        let commission = 0;
        if (amountValue > 0) {
          // Calculer la commission (standard: 14€ pour 129.80€)
          const standardAmount = 12980; // 129.80€ en centimes
          const standardCommission = 1400; // 14€ en centimes
          
          if (amountValue === standardAmount) {
            commission = standardCommission;
          } else {
            const ratio = amountValue / standardAmount;
            commission = Math.round(standardCommission * ratio);
          }
        }
        
        commissionTotal += commission;
        
        return {
          id: payment.id,
          paymentId: payment.paymentId || "",
          referenceNumber: payment.referenceNumber,
          amount: amountValue, // Défaut à 129.80€ en centimes
          status: payment.status || "pending",
          createdAt: payment.createdAt,
          clientName: payment.customerName || "Client",
          clientEmail: payment.customerEmail || "",
          commission: commission
        };
      });
      
      // Pagination simple
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedPayments = formattedPayments.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        payments: paginatedPayments,
        total: formattedPayments.length,
        commissionTotal
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements utilisateur:", error);
      res.status(500).json({ 
        success: false,
        error: "Erreur lors de la récupération des paiements",
        payments: [],
        total: 0,
        commissionTotal: 0
      });
    }
  });
  
  // Obtenir les statistiques de paiement pour le tableau de bord
  app.get('/api/payments/stats', requireAuth, async (req, res) => {
    try {
      const period = req.query.period || 'today'; // Période par défaut: aujourd'hui
      
      // Déterminer l'intervalle de date en fonction de la période
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date(now);
      let periodLabel = '';
      
      // Période basée sur les jours spécifiques (aujourd'hui, hier, avant-hier)
      if (period === 'today') {
        // Aujourd'hui (début de journée)
        startDate.setHours(0, 0, 0, 0);
        periodLabel = "Aujourd'hui";
      } else if (period === 'yesterday') {
        // Hier (début de journée)
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = "Hier";
      } else if (period === 'before_yesterday') {
        // Avant-hier (début de journée)
        startDate.setDate(now.getDate() - 2);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = "Avant-hier";
      } else if (period === 'week') {
        // Cette semaine (depuis lundi)
        const day = now.getDay(); // 0 = dimanche, 1 = lundi, ...
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuste pour commencer le lundi
        startDate = new Date(now);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        periodLabel = "Cette semaine";
      } else if (period === 'month') {
        // Ce mois (depuis le 1er)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = "Ce mois";
      } else if (period === '7j') {
        // 7 derniers jours
        startDate.setDate(now.getDate() - 7);
        periodLabel = "7 derniers jours";
      } else if (period === '30j') {
        // 30 derniers jours
        startDate.setDate(now.getDate() - 30);
        periodLabel = "30 derniers jours";
      } else if (period === '90j') {
        // 90 derniers jours
        startDate.setDate(now.getDate() - 90);
        periodLabel = "90 derniers jours";
      } else if (period === '1a') {
        // Dernière année
        startDate.setFullYear(now.getFullYear() - 1);
        periodLabel = "Dernière année";
      }
      
      // Récupérer tous les paiements
      const allPayments = await storage.getRecentPayments(1000);
      
      // Récupérer toutes les demandes pour les calculs de conversion
      const allRequests = await storage.getAllServiceRequests();
      
      // Filtrer pour n'avoir que les paiements liés au site (références RAC- uniquement)
      const sitePayments = allPayments.filter(payment => {
        // Un paiement est lié au site s'il a une référence de demande associée avec RAC-
        return payment.referenceNumber && payment.referenceNumber.startsWith('RAC-');
      });
      
      // Pour les statistiques de la période sélectionnée
      let filteredPayments;
      
      if (period === 'today' || period === 'yesterday' || period === 'before_yesterday') {
        // Pour aujourd'hui, hier et avant-hier, on filtre précisément par date
        filteredPayments = sitePayments.filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      } else {
        // Pour les autres périodes
        filteredPayments = sitePayments.filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= startDate && paymentDate <= now;
        });
      }
      
      // Calculer les statistiques pour la période sélectionnée
      const successfulPayments = filteredPayments.filter(p => p.status === 'paid' || p.status === 'succeeded');
      const pendingPayments = filteredPayments.filter(p => p.status === 'pending' || p.status === 'processing');
      const failedPayments = filteredPayments.filter(p => p.status === 'failed' || p.status === 'abandoned' || p.status === 'canceled');
      
      // Vérifier les données pour le débogage
      console.log(`Paiements pour la période ${period}: ${filteredPayments.length} au total, ${successfulPayments.length} réussis`);
      if (successfulPayments.length > 0) {
        const firstPayment = successfulPayments[0];
        console.log(`Exemple de paiement réussi: ID=${firstPayment.id}, montant=${firstPayment.amount}, type=${typeof firstPayment.amount}`);
      }
      
      // Calculer le montant total pour la période en s'assurant que les montants sont bien des nombres
      const totalAmount = successfulPayments.reduce((sum, p) => {
        // Convertir p.amount en nombre si ce n'est pas déjà le cas
        let amount = 0;
        if (p.amount) {
          if (typeof p.amount === 'string') {
            amount = parseFloat(p.amount);
          } else if (typeof p.amount === 'number') {
            amount = p.amount;
          } else if (typeof p.amount === 'object' && p.amount.value) {
            // Gestion du format Decimal de PostgreSQL qui peut être renvoyé comme un objet
            amount = parseFloat(p.amount.value);
          }
        }
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      // CALCUL DU TAUX DE CONVERSION DEPUIS LE 1ER DU MOIS
      
      // Filtrer les demandes créées uniquement ce mois-ci
      const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const requestsThisMonth = allRequests.filter(req => {
        const reqDate = new Date(req.createdAt);
        return reqDate >= monthStartDate && reqDate <= now;
      });
      
      // Filtrer les paiements réussis uniquement ce mois-ci
      const paidRequestsThisMonth = sitePayments.filter(payment => {
        if (payment.status !== 'paid' && payment.status !== 'succeeded') return false;
        
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= monthStartDate && paymentDate <= now;
      });
      
      // Calcul du taux de conversion du mois en cours (arrondi à une décimale)
      const conversionRate = requestsThisMonth.length > 0 
        ? (paidRequestsThisMonth.length / requestsThisMonth.length) * 100 
        : 0;
      
      // Déterminer si le taux de conversion est en hausse ou en baisse par rapport au mois précédent
      const lastMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      
      const requestsLastMonth = allRequests.filter(req => {
        const reqDate = new Date(req.createdAt);
        return reqDate >= lastMonthStartDate && reqDate <= lastMonthEndDate;
      });
      
      const paidRequestsLastMonth = sitePayments.filter(payment => {
        if (payment.status !== 'paid' && payment.status !== 'succeeded') return false;
        
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= lastMonthStartDate && paymentDate <= lastMonthEndDate;
      });
      
      const lastMonthConversionRate = requestsLastMonth.length > 0 
        ? (paidRequestsLastMonth.length / requestsLastMonth.length) * 100 
        : 0;
      
      // Calculer le pourcentage de changement du taux de conversion
      const conversionChange = lastMonthConversionRate > 0 
        ? ((conversionRate - lastMonthConversionRate) / lastMonthConversionRate) * 100 
        : 0;
      
      // Déterminer la tendance (en hausse ou en baisse)
      const conversionTrend = conversionRate >= lastMonthConversionRate ? "up" : "down";
      
      // Statistiques pour hier
      const yesterdayDate = new Date();
      yesterdayDate.setDate(now.getDate() - 1);
      yesterdayDate.setHours(0, 0, 0, 0);
      const yesterdayEndDate = new Date(yesterdayDate);
      yesterdayEndDate.setHours(23, 59, 59, 999);
      
      const yesterdayPayments = sitePayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= yesterdayDate && paymentDate <= yesterdayEndDate && 
               (payment.status === 'paid' || payment.status === 'succeeded');
      });
      
      // Calculer le montant total pour hier en s'assurant que les montants sont bien des nombres
      const yesterdayAmount = yesterdayPayments.reduce((sum, p) => {
        let amount = 0;
        if (p.amount) {
          if (typeof p.amount === 'string') {
            amount = parseFloat(p.amount);
          } else if (typeof p.amount === 'number') {
            amount = p.amount;
          } else if (typeof p.amount === 'object' && p.amount.value) {
            amount = parseFloat(p.amount.value);
          }
        }
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      // Statistiques pour cette semaine
      const weekStartDate = new Date(now);
      const day = now.getDay(); // 0 = dimanche, 1 = lundi, ...
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuste pour commencer le lundi
      weekStartDate.setDate(diff);
      weekStartDate.setHours(0, 0, 0, 0);
      
      const weekPayments = sitePayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= weekStartDate && paymentDate <= now && 
               (payment.status === 'paid' || payment.status === 'succeeded');
      });
      
      // Calculer le montant total pour cette semaine en s'assurant que les montants sont bien des nombres
      const weekAmount = weekPayments.reduce((sum, p) => {
        let amount = 0;
        if (p.amount) {
          if (typeof p.amount === 'string') {
            amount = parseFloat(p.amount);
          } else if (typeof p.amount === 'number') {
            amount = p.amount;
          } else if (typeof p.amount === 'object' && p.amount.value) {
            amount = parseFloat(p.amount.value);
          }
        }
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      // Statistiques pour ce mois
      const monthPayments = sitePayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= monthStartDate && paymentDate <= now && 
               (payment.status === 'paid' || payment.status === 'succeeded');
      });
      
      // Calculer le montant total pour ce mois en s'assurant que les montants sont bien des nombres
      const monthAmount = monthPayments.reduce((sum, p) => {
        let amount = 0;
        if (p.amount) {
          if (typeof p.amount === 'string') {
            amount = parseFloat(p.amount);
          } else if (typeof p.amount === 'number') {
            amount = p.amount;
          } else if (typeof p.amount === 'object' && p.amount.value) {
            amount = parseFloat(p.amount.value);
          }
        }
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      res.json({
        totalAmount,
        successCount: successfulPayments.length,
        pendingCount: pendingPayments.length,
        failedCount: failedPayments.length,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        conversionChange: parseFloat(conversionChange.toFixed(1)),
        conversionTrend,
        period,
        periodLabel,
        yesterdayAmount,
        weekAmount,
        monthAmount
      });
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques de paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors du calcul des statistiques"
      });
    }
  });
  
  // Obtenir les paiements récents (les 5 derniers)
  app.get('/api/payments/recent', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      // Récupérer plus de paiements que nécessaire car nous allons filtrer
      const allRecentPayments = await storage.getRecentPayments(limit * 5);
      
      // Filtrer pour n'avoir que les paiements liés au site (références RAC- uniquement)
      const sitePayments = allRecentPayments
        .filter(payment => {
          // Un paiement est lié au site s'il a une référence de demande associée avec RAC-
          return payment.referenceNumber && payment.referenceNumber.startsWith('RAC-');
        })
        .slice(0, limit);
      
      res.json(sitePayments);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements récents:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des paiements récents"
      });
    }
  });
  
  // Envoyer un rappel de paiement échoué
  app.post('/api/send-payment-reminder/:paymentId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // Récupérer les détails du paiement échoué
      const payment = await stripe.paymentIntents.retrieve(paymentId);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement non trouvé"
        });
      }
      
      // Vérifier si le paiement a une référence de demande associée
      const referenceNumber = payment.metadata?.referenceNumber;
      
      if (!referenceNumber) {
        return res.status(400).json({
          success: false,
          message: "Ce paiement n'est pas associé à une demande de service"
        });
      }
      
      // Récupérer les détails de la demande de service
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Demande de service non trouvée"
        });
      }
      
      // Vérifier si le client a un email
      if (!serviceRequest.email) {
        return res.status(400).json({
          success: false,
          message: "Le client n'a pas d'email enregistré"
        });
      }
      
      // Créer un nouveau lien de paiement
      const paymentLinkUrl = `${req.protocol}://${req.get('host')}/payment-link?ref=${referenceNumber}`;
      
      // Envoyer l'email (implémentation simulée pour l'instant)
      // TODO: Implémenter l'envoi d'email réel via Nodemailer ou SendGrid
      console.log(`Envoi d'un rappel de paiement à ${serviceRequest.email} pour la référence ${referenceNumber}. Lien: ${paymentLinkUrl}`);
      
      // Journaliser cette action
      await storage.logActivity({
        userId: req.user?.id || 0,
        entityType: "service_request",
        entityId: serviceRequest.id,
        action: ACTIVITY_ACTIONS.PAYMENT_REMINDER_SENT,
        details: `Rappel de paiement envoyé pour la référence ${referenceNumber}`,
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Rappel de paiement envoyé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du rappel de paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de l'envoi du rappel de paiement"
      });
    }
  });

  // Route pour synchroniser manuellement les données Stripe depuis le dashboard admin
  // Route pour vérifier la configuration Stripe
  app.get('/api/stripe/config', requireAuth, requireAdmin, async (req, res) => {
    try {
      res.json({
        configured: !!stripe,
        version: stripe ? '2025-03-31.basil' : null
      });
    } catch (error) {
      console.error('Error checking Stripe config:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de la configuration Stripe' });
    }
  });
  
  app.post('/api/stripe/sync-payments', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // Récupérer les 100 derniers paiements
      const payments = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.latest_charge'],
      });
      
      // Pour chaque paiement, mettre à jour le statut dans la base de données si possible
      const results = await Promise.all(
        payments.data.map(async (payment) => {
          try {
            // Vérifier si le paiement contient une référence de demande de service
            const referenceNumber = payment.metadata?.referenceNumber;
            
            if (!referenceNumber) {
              return { 
                id: payment.id, 
                status: "skipped", 
                message: "Pas de référence associée" 
              };
            }
            
            // Récupérer la demande de service
            const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
            
            if (!serviceRequest) {
              return { 
                id: payment.id, 
                status: "error", 
                message: "Demande non trouvée" 
              };
            }
            
            // Mettre à jour le statut de paiement de la demande selon le statut Stripe
            const updatedStatus = payment.status;
            
            // Mettre à jour la demande de service avec les infos de paiement
            await storage.updateServiceRequestPayment(
              serviceRequest.id,
              payment.id,
              updatedStatus,
              payment.amount / 100
            );
            
            // Si le paiement a réussi, mettre à jour le statut de la demande
            if (updatedStatus === 'succeeded') {
              await storage.updateServiceRequestStatus(
                serviceRequest.id,
                REQUEST_STATUS.PAID,
                req.user?.id || 0
              );
            }
            
            // Logger la synchronisation
            await storage.logActivity({
              entityType: "service_request",
              entityId: serviceRequest.id,
              action: "payment_synced",
              userId: req.user?.id || 0,
              details: JSON.stringify({
                paymentId: payment.id,
                status: updatedStatus,
                amount: payment.amount / 100 // Stripe stocke les montants en centimes
              }),
              ipAddress: req.ip
            });
            
            return { 
              id: payment.id, 
              status: "synced", 
              reference: referenceNumber,
              paymentStatus: updatedStatus
            };
          } catch (error) {
            console.error(`Erreur lors de la synchronisation du paiement ${payment.id}:`, error);
            return { 
              id: payment.id, 
              status: "error", 
              message: error instanceof Error ? error.message : "Erreur inconnue" 
            };
          }
        })
      );
      
      res.json({
        success: true,
        message: `Synchronisation terminée: ${results.filter(r => r.status === "synced").length} paiements synchronisés`,
        results
      });
    } catch (error) {
      console.error("Erreur lors de la synchronisation avec Stripe:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la synchronisation avec Stripe"
      });
    }
  });

  // Vérifier le statut d'un paiement via GET pour la page de confirmation
  app.get('/api/payment-status/:referenceNumber', async (req, res) => {
    const { referenceNumber } = req.params;
    
    if (!referenceNumber) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de référence requis',
      });
    }
    
    try {
      // Vérifier si la demande existe dans notre base de données
      const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Référence de demande introuvable"
        });
      }
      
      // Détails de journalisation pour débogage
      console.log("Détails du statut de paiement (DB) pour GET:", {
        referenceNumber,
        paymentId: serviceRequest.paymentId,
        paymentStatus: serviceRequest.paymentStatus
      });
      
      // Si nous avons un ID de paiement Stripe et Stripe est configuré, interroger l'API Stripe
      if (stripe && serviceRequest.paymentId) {
        try {
          // Récupérer les détails du paiement directement depuis Stripe
          const paymentIntent = await stripe.paymentIntents.retrieve(serviceRequest.paymentId);
          
          console.log("Statut du paiement Stripe pour GET:", {
            paymentId: serviceRequest.paymentId,
            stripeStatus: paymentIntent.status,
            dbStatus: serviceRequest.paymentStatus,
            createdAt: new Date(paymentIntent.created * 1000).toISOString()
          });
          
          // Déterminer le statut standardisé
          let finalStatus = 'pending';
          
          // Vérification complète du statut du paiement
          if (paymentIntent.status === 'succeeded') {
            finalStatus = 'paid';
            
            // Sync DB si le statut diffère
            if (serviceRequest.paymentStatus !== "paid") {
              console.log("Mise à jour du statut de paiement de '", serviceRequest.paymentStatus, "' à 'paid'");
              
              await storage.updateServiceRequestPayment(
                serviceRequest.id,
                serviceRequest.paymentId,
                "paid",
                paymentIntent.amount / 100
              );
              
              // 💰 NOTIFICATION EN TEMPS RÉEL - PAIEMENT RÉUSSI (EXCLUSIF RACCORDEMENT-ELEC.FR)
              try {
                // SÉCURITÉ RENFORCÉE: Vérifier domaine + référence + données client
                const hostHeader = req.get('host') || req.get('x-forwarded-host') || '';
                const refererHeader = req.get('referer') || '';
                const isRaccordementElecDomain = hostHeader.includes('portail-electricite.com') || 
                                                 refererHeader.includes('portail-electricite.com') ||
                                                 hostHeader.includes('replit.dev'); // Pour dev
                
                if (serviceRequest.referenceNumber && 
                    serviceRequest.id && serviceRequest.name && serviceRequest.email &&
                    isRaccordementElecDomain) {
                  
                  const { sendPaiementReussiNotification } = await import('./email-service');
                  await sendPaiementReussiNotification({
                    referenceNumber: serviceRequest.referenceNumber,
                    clientName: serviceRequest.name,
                    clientEmail: serviceRequest.email,
                    clientPhone: serviceRequest.phone,
                    amount: paymentIntent.amount,
                    paymentIntentId: paymentIntent.id,
                    paymentMethod: "carte"
                  });
                  console.log('💰 Notification paiement RACCORDEMENT-ELEC.FR envoyée:', serviceRequest.referenceNumber, 'depuis:', hostHeader);
                } else {
                  console.log('🔒 Paiement externe ignoré - Domaine:', hostHeader, 'Ref:', serviceRequest.referenceNumber);
                }
              } catch (emailError) {
                console.error('❌ Erreur notification paiement portail-electricite.com:', emailError);
              }
              
              // Mettre à jour le statut de la demande si nécessaire
              if (serviceRequest.status !== REQUEST_STATUS.PAID) {
                await storage.updateServiceRequestStatus(
                  serviceRequest.id,
                  REQUEST_STATUS.PAID,
                  0 // 0 = système
                );
              }
            }
          } else if (paymentIntent.status === 'canceled' || 
                    (paymentIntent.last_payment_error && paymentIntent.last_payment_error.code)) {
            finalStatus = 'failed';
            
            // Sync DB si le statut diffère
            if (serviceRequest.paymentStatus !== "failed") {
              console.log("Mise à jour du statut de paiement de '", serviceRequest.paymentStatus, "' à 'failed'");
              
              await storage.updateServiceRequestPayment(
                serviceRequest.id,
                serviceRequest.paymentId,
                "failed",
                paymentIntent.amount / 100
              );
            }
          } else if (paymentIntent.status === 'processing') {
            finalStatus = 'processing';
          } else {
            // Autres statuts Stripe = en attente
            finalStatus = 'pending';
          }
          
          // Retourner le statut déterminé avec détails pour le client
          return res.json({
            success: true,
            status: finalStatus,
            paymentId: serviceRequest.paymentId,
            amount: paymentIntent.amount / 100,
            stripeStatus: paymentIntent.status,
            errorDetails: paymentIntent.last_payment_error ? {
              type: paymentIntent.last_payment_error.type,
              code: paymentIntent.last_payment_error.code,
              message: paymentIntent.last_payment_error.message,
              decline_code: paymentIntent.last_payment_error.decline_code
            } : null
          });
        } catch (stripeError: any) {
          console.error("Erreur Stripe lors de la vérification GET du paiement:", stripeError);
          
          // Vérifier si l'erreur est due à un ID de paiement invalide
          if (stripeError.code === 'resource_missing') {
            return res.status(404).json({
              success: false,
              message: "ID de paiement introuvable chez Stripe",
              error: stripeError.message
            });
          }
          
          // Retourner le statut depuis la DB avec indication d'erreur Stripe
          return res.json({
            success: true,
            status: serviceRequest.paymentStatus || 'pending',
            paymentId: serviceRequest.paymentId,
            amount: serviceRequest.paymentAmount || 129.80,
            error: 'stripe_error',
            message: stripeError.message
          });
        }
      } else {
        // Pas d'ID de paiement Stripe disponible
        console.log("GET: Aucun ID de paiement Stripe disponible, retour du statut DB:", serviceRequest.paymentStatus);
        
        return res.json({
          success: true,
          status: serviceRequest.paymentStatus || 'pending',
          paymentId: serviceRequest.paymentId,
          amount: serviceRequest.paymentAmount || 129.80,
          message: 'no_stripe_payment_id'
        });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification GET du statut du paiement:", error);
      
      return res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la vérification du statut du paiement",
        error: error instanceof Error ? error.message : 'unknown_error'
      });
    }
  });
  
  // Vérifier le statut d'un paiement de manière plus complète (POST pour plus de détails)
  app.post('/api/check-payment-status', async (req, res) => {
    const { paymentIntentId, referenceNumber } = req.body;
    
    if (!paymentIntentId && !referenceNumber) {
      return res.status(400).json({
        success: false,
        message: 'ID de paiement ou numéro de référence requis',
      });
    }
    
    try {
      console.log("Vérification du statut de paiement pour:", { paymentIntentId, referenceNumber });
      
      // Si le numéro de référence est fourni, vérifier d'abord dans la base de données
      if (referenceNumber) {
        const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
        
        if (!serviceRequest) {
          return res.status(404).json({
            success: false,
            message: 'Demande non trouvée avec cette référence',
          });
        }
        
        if (serviceRequest && serviceRequest.paymentStatus === "paid") {
          console.log("Paiement déjà marqué comme réussi dans la base de données pour la référence:", referenceNumber);
          return res.json({
            success: true,
            status: "paid",
            stripeStatus: "succeeded",
            paymentId: serviceRequest.paymentId,
            amount: serviceRequest.paymentAmount || 129.80,
          });
        }
        
        // Si paymentIntentId n'est pas fourni mais qu'il existe dans la demande, on l'utilise
        let paymentIntentToUse = paymentIntentId;
        if (!paymentIntentToUse && serviceRequest.paymentId) {
          paymentIntentToUse = serviceRequest.paymentId;
        }
      }
      
      // Vérification via l'API Stripe
      if (stripe && paymentIntentId) {
        // Utiliser paymentIntentId s'il est fourni, sinon utiliser celui de la demande
        const paymentIntentToCheck = paymentIntentId;
        try {
          console.log("Vérification avec l'API Stripe pour l'ID de paiement:", paymentIntentToCheck);
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentToCheck);
          
          // Enregistrement détaillé pour débogage
          console.log("Détails du PaymentIntent Stripe:", {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            created: new Date(paymentIntent.created * 1000).toISOString(),
            last_payment_error: paymentIntent.last_payment_error ? {
              type: paymentIntent.last_payment_error.type,
              code: paymentIntent.last_payment_error.code,
              message: paymentIntent.last_payment_error.message
            } : null
          });
          
          // Mapper le statut Stripe à notre format et inclure le statut original pour débogage
          let status: 'paid' | 'failed' | 'processing' | 'abandoned' | 'pending';
          
          switch (paymentIntent.status) {
            case 'succeeded':
              status = 'paid';
              
              // Mettre à jour le statut dans la base de données si référence fournie
              if (referenceNumber) {
                try {
                  const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
                  if (serviceRequest && serviceRequest.paymentStatus !== "paid") {
                    await storage.updateServiceRequestPayment(
                      serviceRequest.id,
                      paymentIntent.id,
                      "paid",
                      paymentIntent.amount / 100
                    );
                    console.log("Base de données mise à jour: paiement marqué comme réussi");
                  }
                } catch (dbError) {
                  console.error("Erreur lors de la mise à jour du statut dans la base de données:", dbError);
                }
              }
              break;
            case 'processing':
              status = 'processing';
              break;
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
              status = 'abandoned';
              break;
            case 'canceled':
              status = 'failed';
              
              // Mettre à jour le statut dans la base de données si référence fournie
              if (referenceNumber) {
                try {
                  const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
                  if (serviceRequest && serviceRequest.paymentStatus !== "failed") {
                    await storage.updateServiceRequestPayment(
                      serviceRequest.id,
                      paymentIntent.id,
                      "failed",
                      paymentIntent.amount / 100
                    );
                    console.log("Base de données mise à jour: paiement marqué comme échoué");
                  }
                } catch (dbError) {
                  console.error("Erreur lors de la mise à jour du statut dans la base de données:", dbError);
                }
              }
              break;
            default:
              status = 'pending';
          }
          
          // Réponse riche avec détails pour le débogage client
          return res.json({
            success: true,
            status, // Notre format standardisé
            stripeStatus: paymentIntent.status, // Statut brut de Stripe pour débogage
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            created: new Date(paymentIntent.created * 1000).toISOString(),
            hasError: !!paymentIntent.last_payment_error,
            errorDetails: paymentIntent.last_payment_error ? {
              type: paymentIntent.last_payment_error.type,
              code: paymentIntent.last_payment_error.code,
              message: paymentIntent.last_payment_error.message
            } : null
          });
        } catch (stripeError: any) {
          console.error('Erreur Stripe lors de la récupération du paiement:', stripeError);
          
          // Vérifier si l'erreur est due à un ID de paiement invalide
          if (stripeError.code === 'resource_missing') {
            return res.status(404).json({
              success: false,
              status: 'unknown',
              message: "ID de paiement introuvable chez Stripe",
              error: stripeError.message
            });
          }
          
          // Autre erreur Stripe
          return res.status(500).json({
            success: false,
            status: 'error',
            message: "Erreur lors de la communication avec Stripe",
            error: stripeError.message
          });
        }
      } else if (referenceNumber) {
        // Si pas d'ID Stripe mais une référence, vérifier dans la base de données
        const serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
        
        if (!serviceRequest) {
          return res.status(404).json({
            success: false,
            message: "Référence de demande introuvable"
          });
        }
        
        console.log("Statut de paiement depuis la base de données:", serviceRequest.paymentStatus);
        
        // Retourner le statut de la base de données
        return res.json({
          success: true,
          status: serviceRequest.paymentStatus || 'pending',
          paymentId: serviceRequest.paymentId,
          amount: serviceRequest.paymentAmount || 129.80,
          source: 'database'
        });
      } else {
        // Ni ID Stripe ni référence valide
        return res.status(400).json({
          success: false,
          message: "Impossible de vérifier le statut sans identifiant valide"
        });
      }
    } catch (error: any) {
      console.error('Erreur générale lors de la vérification du statut de paiement:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Une erreur est survenue lors de la vérification du statut de paiement',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Route pour valider une carte bancaire directement avec Stripe
  app.post('/api/validate-card', async (req, res) => {
    try {
      const { cardNumber, expMonth, expYear, cvc } = req.body;
      
      // Vérifier la présence des informations nécessaires
      if (!cardNumber || !expMonth || !expYear || !cvc) {
        return res.status(400).json({ 
          success: false, 
          message: "Informations de carte incomplètes" 
        });
      }
      
      // Si Stripe n'est pas configuré, on ne peut pas valider
      if (!stripe) {
        return res.status(500).json({ 
          success: false, 
          message: "Stripe n'est pas configuré sur le serveur" 
        });
      }
      
      // Créer un PaymentMethod pour valider la carte sans effectuer de paiement
      try {
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: cardNumber,
            exp_month: parseInt(expMonth, 10),
            exp_year: parseInt(expYear, 10),
            cvc: cvc,
          },
        });
        
        // Extraire les détails de la carte (avec vérification de null)
        if (paymentMethod && paymentMethod.card) {
          const cardInfo = paymentMethod.card;
          
          return res.json({
            success: true,
            valid: true,
            cardDetails: {
              brand: cardInfo.brand, // visa, mastercard, amex, etc.
              last4: cardInfo.last4,
              expMonth: cardInfo.exp_month,
              expYear: cardInfo.exp_year,
              country: cardInfo.country,
              funding: cardInfo.funding, // 'credit', 'debit', 'prepaid', etc.
              paymentMethodId: paymentMethod.id
            }
          });
        } else {
          // Cas où paymentMethod.card est null ou undefined
          return res.json({
            success: true,
            valid: false,
            error: {
              code: "invalid_card_data",
              message: "Données de carte non valides ou incomplètes"
            }
          });
        }
      } catch (stripeError) {
        // Si la validation échoue, déterminer le type d'erreur
        console.error("Erreur lors de la validation de la carte:", stripeError);
        
        let errorMessage = "Carte invalide";
        let errorCode = "card_error";
        
        if (stripeError instanceof Stripe.errors.StripeCardError) {
          errorCode = stripeError.code || "card_error";
          switch(errorCode) {
            case 'card_declined':
              errorMessage = "Carte refusée";
              break;
            case 'expired_card':
              errorMessage = "Carte expirée";
              break;
            case 'incorrect_cvc':
              errorMessage = "Code de sécurité incorrect";
              break;
            case 'processing_error':
              errorMessage = "Erreur lors du traitement de la carte";
              break;
            case 'incorrect_number':
              errorMessage = "Numéro de carte incorrect";
              break;
            default:
              errorMessage = stripeError.message || "Erreur de validation de la carte";
          }
        }
        
        return res.json({
          success: true, // La requête a réussi, même si la validation a échoué
          valid: false, // La carte n'est pas valide
          error: {
            code: errorCode,
            message: errorMessage,
            rawError: stripeError instanceof Error ? stripeError.message : "Erreur inconnue"
          }
        });
      }
    } catch (error) {
      console.error("Error validating card:", error);
      res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de la validation de la carte",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  
  // Route pour la configuration du système
  app.get('/api/system-config', requireAuth, requireAdmin, async (req, res) => {
    try {
      // TODO: Implémenter la récupération des configurations du système
      // const configs = await storage.getSystemConfigs();
      
      // En attendant, renvoyer des configurations fictives
      const configs = {
        stripe: {
          publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        },
        email: {
          provider: 'sendgrid',
          senderEmail: 'contact@portail-electricite.com',
          senderName: 'Service Raccordement Électrique',
        },
        general: {
          siteName: 'Raccordement Électrique en Ligne',
          defaultPrice: 129.80,
        },
      };
      
      res.json({
        success: true,
        configs,
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des configurations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Une erreur est survenue lors de la récupération des configurations',
      });
    }
  });

  // Récupérer un reçu de paiement
  app.get('/api/payment-receipt/:paymentId', requireAuth, requireAdminOrManager, async (req, res) => {
    console.log("Main receipt route reached - User:", req.user?.username, "Role:", req.user?.role);
    try {
      const { paymentId } = req.params;
      
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // Récupérer les détails du paiement
      const payment = await stripe.paymentIntents.retrieve(paymentId, {
        expand: ['latest_charge']
      });
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement non trouvé"
        });
      }
      
      const referenceNumber = payment.metadata?.referenceNumber;
      let serviceRequest = null;
      
      if (referenceNumber) {
        serviceRequest = await storage.getServiceRequestByReference(referenceNumber);
      }
      
      // Générer un reçu PDF (pour l'instant, on renvoie juste du HTML)
      const receiptHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reçu de paiement - ${referenceNumber || payment.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #0066cc;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            min-width: 200px;
          }
          .amount {
            font-size: 1.2em;
            font-weight: bold;
            color: #0066cc;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
          }
          .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
          }
          .status-succeeded {
            background-color: #d4edda;
            color: #155724;
          }
          .status-failed {
            background-color: #f8d7da;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Reçu de paiement</h1>
            <p>Raccordement Électrique en Ligne</p>
          </div>
          
          <div class="info-row">
            <div class="info-label">Numéro de référence:</div>
            <div>${referenceNumber || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">ID de paiement:</div>
            <div>${payment.id}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div>${new Date(payment.created * 1000).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Client:</div>
            <div>${serviceRequest ? serviceRequest.name : 'Client'}</div>
          </div>
          
          ${serviceRequest ? `
          <div class="info-row">
            <div class="info-label">Adresse:</div>
            <div>${serviceRequest.address || 'N/A'}, ${serviceRequest.postalCode || ''} ${serviceRequest.city || ''}</div>
          </div>
          ` : ''}
          
          <div class="info-row">
            <div class="info-label">Statut:</div>
            <div>
              <span class="status ${payment.status === 'succeeded' ? 'status-succeeded' : 'status-failed'}">
                ${payment.status === 'succeeded' ? 'Payé' : 
                  payment.status === 'processing' ? 'En cours de traitement' : 
                  payment.status === 'canceled' ? 'Annulé' : 'Échoué'}
              </span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Montant:</div>
            <div class="amount">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payment.amount / 100)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Méthode de paiement:</div>
            <div>${payment.payment_method_types.join(', ')}</div>
          </div>
          
          ${payment.status === 'succeeded' ? `
          <div class="info-row">
            <div class="info-label">Description:</div>
            <div>Accompagnement pour raccordement électrique Enedis</div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Ce reçu a été généré automatiquement et ne nécessite pas de signature.</p>
            <p>Pour toute question, veuillez nous contacter à contact@portail-electricite.com</p>
            <p>© 2025 Raccordement Électrique en Ligne - SIRET: 12345678900013</p>
          </div>
        </div>
      </body>
      </html>
      `;
      
      // Générer une signature aléatoire avec les premières lettres
      const generateSignature = (fullName: string): string => {
        const names = fullName.split(' ');
        const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
        const randomChars = Math.random().toString(36).substring(2, 8);
        return `${initials}_${randomChars}`;
      };

      // Construire le nom complet du client avec gestion intelligente
      let fullClientName = 'Client';
      if (serviceRequest && serviceRequest.name) {
        // Si le nom contient déjà prénom + nom, l'utiliser tel quel
        // Sinon, essayer de reconstituer un nom complet logique
        const nameParts = serviceRequest.name.trim().split(' ');
        if (nameParts.length === 1) {
          // Un seul mot - probablement juste le nom de famille
          // Reconstituer avec un prénom basé sur l'email si possible
          const emailPrefix = serviceRequest.email ? serviceRequest.email.split('@')[0].split('.')[0] : '';
          const firstName = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'M./Mme';
          fullClientName = `${firstName} ${serviceRequest.name}`;
        } else {
          // Plusieurs mots - utiliser tel quel
          fullClientName = serviceRequest.name;
        }
      }

      // Retourner les données structurées pour la génération PDF côté client avec toutes les informations
      const receiptData = {
        referenceNumber: referenceNumber || 'N/A',
        paymentId: payment.id,
        date: new Date(payment.created * 1000).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        clientName: fullClientName,
        clientEmail: serviceRequest ? serviceRequest.email : '',
        clientPhone: serviceRequest ? serviceRequest.phone : '',
        address: serviceRequest ? `${serviceRequest.address || 'N/A'}, ${serviceRequest.postalCode || ''} ${serviceRequest.city || ''}` : 'N/A',
        status: payment.status === 'succeeded' ? 'Payé' : 
                payment.status === 'processing' ? 'En cours de traitement' : 
                payment.status === 'canceled' ? 'Annulé' : 'Échoué',
        amount: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payment.amount / 100),
        paymentMethod: payment.payment_method_types.join(', '),
        description: payment.status === 'succeeded' ? 'Accompagnement pour raccordement électrique Enedis' : '',
        signature: serviceRequest ? generateSignature(serviceRequest.name) : 'SIG_CLIENT',
        fileName: `recu_${referenceNumber || payment.id}_${new Date().toISOString().split('T')[0]}.pdf`
      };
      
      res.json({
        success: true,
        receiptData,
        generatePdf: true
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération du reçu de paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la génération du reçu de paiement"
      });
    }
  });

  // Récupérer les demandes en attente de paiement
  app.get('/api/service-requests-unpaid', requireAuth, requireAdminOrManager, async (req, res) => {
    try {
      // Récupérer toutes les demandes qui sont dans un état qui n'a pas encore payé
      const serviceRequests = await storage.getServiceRequestsByStatus(REQUEST_STATUS.NEW);
      
      // Filtrer pour exclure celles qui ont un paymentId (elles ont déjà un paiement en cours ou terminé)
      const unpaidRequests = serviceRequests.filter(request => !request.paymentId);
      
      res.json(unpaidRequests);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes en attente de paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des demandes en attente de paiement"
      });
    }
  });

  // Traiter un paiement manuel (ancienne méthode, à terme remplacée par terminal de paiement virtuel)
  app.post('/api/process-manual-payment', requireAuth, requireAdminOrManager, async (req, res) => {
    try {
      const { 
        referenceNumber, 
        cardNumber, 
        cardExpMonth, 
        cardExpYear, 
        cardCvc, 
        cardholderName, 
        amount, 
        serviceRequestId 
      } = req.body;
      
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // 1. Vérifier que la demande existe
      const serviceRequest = await storage.getServiceRequest(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Demande de service non trouvée"
        });
      }
      
      // 2. Créer un PaymentMethod sur Stripe
      let paymentMethod;
      try {
        paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: cardNumber,
            exp_month: cardExpMonth,
            exp_year: cardExpYear,
            cvc: cardCvc,
          },
          billing_details: {
            name: cardholderName,
            email: serviceRequest.email,
          },
        });
      } catch (error: any) {
        console.error("Erreur lors de la création du moyen de paiement Stripe:", error);
        return res.status(400).json({
          success: false,
          message: "Les informations de carte sont invalides: " + (error.message || "Erreur inconnue")
        });
      }
      
      // 3. Créer un PaymentIntent sur Stripe
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convertir en centimes
          currency: 'eur',
          payment_method: paymentMethod.id,
          confirm: true,
          metadata: {
            referenceNumber,
            agentProcessed: 'true',
            agentId: req.user?.id?.toString() || 'unknown',
            agentName: 'agent'
          },
          description: `Accompagnement raccordement électrique Enedis - ${referenceNumber}`,
          receipt_email: serviceRequest.email,
          return_url: `${req.protocol}://${req.get('host')}/payment-confirmation?ref=${referenceNumber}`,
          // Capturer directement
          capture_method: 'automatic',
          automatic_payment_methods: {
            enabled: false, // Nous spécifions manuellement la méthode
          },
        });
      } catch (error: any) {
        console.error("Erreur lors de la création du paiement Stripe:", error);
        return res.status(400).json({
          success: false,
          message: "Erreur lors du traitement du paiement: " + (error.message || "Erreur inconnue")
        });
      }
      
      // 4. Mettre à jour la demande de service avec les informations de paiement
      const updatedServiceRequest = await storage.updateServiceRequestPayment(
        serviceRequestId,
        paymentIntent.id,
        paymentIntent.status,
        amount,
        {
          ...(paymentMethod.card?.brand && { cardBrand: paymentMethod.card.brand }),
          ...(paymentMethod.card?.last4 && { cardLast4: paymentMethod.card.last4 }),
          ...(paymentMethod.card?.exp_month && { cardExpMonth: paymentMethod.card.exp_month }),
          ...(paymentMethod.card?.exp_year && { cardExpYear: paymentMethod.card.exp_year }),
          billingName: cardholderName,
          paymentMethod: 'card'
        }
      );
      
      // 5. Si le paiement a réussi, mettre à jour le statut de la demande
      if (paymentIntent.status === 'succeeded') {
        await storage.updateServiceRequestStatus(
          serviceRequestId,
          REQUEST_STATUS.PAID,
          req.user?.id || 0
        );
      }
      
      // 6. Journaliser cette action
      await storage.logActivity({
        userId: req.user?.id || 0,
        entityType: "service_request",
        entityId: serviceRequestId,
        action: ACTIVITY_ACTIONS.PAYMENT_CONFIRMED,
        details: `Paiement manuel traité pour la référence ${referenceNumber} (${amount}€) par un agent`,
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        message: "Paiement traité avec succès",
        paymentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        amount
      });
    } catch (error: any) {
      console.error("Erreur lors du traitement du paiement manuel:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors du traitement du paiement: " + (error.message || "Erreur inconnue")
      });
    }
  });

  // Route pour créer une session de terminal de paiement Stripe
  app.post('/api/create-payment-terminal-session', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { referenceNumber, amount, serviceRequestId } = req.body;
      
      // Vérifier que les données nécessaires sont présentes
      if (!referenceNumber || !amount || !serviceRequestId) {
        return res.status(400).json({
          success: false,
          message: "Les données sont incomplètes. Référence, montant et ID de la demande sont requis."
        });
      }
      
      // Vérifier que la demande existe
      const serviceRequest = await storage.getServiceRequest(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: "Demande non trouvée"
        });
      }
      
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // Créer une session Checkout directement sans créer de PaymentIntent au préalable
      const checkoutSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Accompagnement raccordement électrique - ${referenceNumber}`,
              },
              unit_amount: Math.round(amount * 100), // Convertir en centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/admin/paiements?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/admin/terminal-paiement?canceled=true`,
        client_reference_id: serviceRequestId.toString(),
        payment_intent_data: {
          metadata: {
            referenceNumber,
            serviceRequestId: serviceRequestId.toString(),
            processedBy: req.user?.id?.toString() || 'unknown',
            agentProcessed: 'true'
          },
          description: `Accompagnement raccordement électrique Enedis - ${referenceNumber}`,
          receipt_email: serviceRequest.email,
        }
      });
      
      // Obtenir l'ID de PaymentIntent depuis la session de checkout
      const paymentIntentId = checkoutSession.payment_intent as string;
      
      // Enregistrer les informations de paiement dans la base de données
      await storage.updateServiceRequestPayment(
        serviceRequestId, 
        paymentIntentId, 
        'pending',
        amount,
        {
          paymentMethod: 'terminal_virtuel'
        }
      );
      
      // Logger l'activité
      await storage.logActivity({
        userId: req.user?.id || 0,
        entityType: "service_request",
        entityId: serviceRequestId,
        action: ACTIVITY_ACTIONS.PAYMENT_INITIATED,
        details: `Terminal de paiement Stripe créé pour la référence ${referenceNumber} (${amount}€)`,
        ipAddress: req.ip
      });
      
      res.json({
        success: true,
        paymentId: paymentIntentId,
        checkoutUrl: checkoutSession.url
      });
      
    } catch (error: any) {
      console.error("Erreur lors de la création du terminal de paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la création du terminal de paiement: " + (error.message || "Erreur inconnue")
      });
    }
  });
  
  // Route pour vérifier le statut d'un paiement initié par terminal
  app.get("/api/payment-terminal-status/:paymentId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "L'API Stripe n'est pas configurée. Veuillez définir STRIPE_SECRET_KEY."
        });
      }
      
      // Vérifier le statut du paiement
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      
      // Si le paiement est réussi, mettre à jour le statut de la demande
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata?.serviceRequestId) {
        const serviceRequestId = parseInt(paymentIntent.metadata.serviceRequestId);
        
        // Vérifier si un lead doit être lié à cette demande
        console.log(`Vérification du paiement terminal ${paymentId}: Vérification de liaison lead-demande pour la demande ${serviceRequestId}`);
        await storage.findAndLinkLeadToServiceRequest(serviceRequestId);
        
        // Mettre à jour le statut de paiement dans la base de données
        await storage.updateServiceRequestPayment(
          serviceRequestId, 
          paymentId, 
          'paid',
          paymentIntent.amount / 100
        );
        
        // Mettre à jour le statut de la demande
        await storage.updateServiceRequestStatus(
          serviceRequestId,
          REQUEST_STATUS.PAID,
          req.user?.id || 0
        );
        
        // Logger l'activité
        await storage.logActivity({
          userId: req.user?.id || 0,
          entityType: "service_request",
          entityId: serviceRequestId,
          action: ACTIVITY_ACTIONS.PAYMENT_PROCESSED,
          details: `Paiement par terminal Stripe complété: ${paymentId}, Montant: ${paymentIntent.amount / 100}€`,
          ipAddress: req.ip
        });
      }
      
      res.json({
        success: true,
        status: paymentIntent.status,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      });
      
    } catch (error: any) {
      console.error("Erreur lors de la vérification du statut du paiement:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la vérification du statut du paiement: " + (error.message || "Erreur inconnue")
      });
    }
  });

  // Route pour mettre à jour la configuration du système
  app.post('/api/system-config', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { section, config } = req.body;
      
      if (!section || !config) {
        return res.status(400).json({
          success: false,
          message: 'Section et configuration requises',
        });
      }
      
      // TODO: Implémenter la mise à jour des configurations du système
      // await storage.updateSystemConfig(section, config);
      
      console.log(`Configuration système mise à jour: ${section}`, config);
      
      res.json({
        success: true,
        message: 'Configuration mise à jour avec succès',
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des configurations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Une erreur est survenue lors de la mise à jour des configurations',
      });
    }
  });
  
  // ============= ROUTES POUR LES TÂCHES DES AGENTS =============
  
  // Récupérer les tâches de l'agent connecté
  app.get("/api/tasks", requireAuth, requireAdmin, async (req, res) => {
    try {
      // ID de l'utilisateur connecté
      const userId = req.user!.id;
      
      console.log(`[DEBUG] Récupération des tâches pour l'utilisateur ${userId}`);
      
      // Extraire les filtres de la requête
      const status = req.query.status as string | undefined;
      const priority = req.query.priority as string | undefined;
      const dueDateStr = req.query.dueDate as string | undefined;
      
      console.log(`[DEBUG] Filtres appliqués: status=${status}, priority=${priority}, dueDate=${dueDateStr}`);
      
      // Convertir la date si fournie
      let dueDate: Date | undefined;
      if (dueDateStr) {
        dueDate = new Date(dueDateStr);
        if (isNaN(dueDate.getTime())) {
          console.log(`[DEBUG] Format de date invalide: ${dueDateStr}`);
          dueDate = undefined;
        } else {
          console.log(`[DEBUG] Date convertie: ${dueDate.toISOString()}`);
        }
      }
      
      // Récupérer les tâches avec filtres
      const tasks = await storage.getAgentTasks(userId, { status, priority, dueDate });
      console.log(`[DEBUG] ${tasks.length} tâches récupérées`);
      
      res.json({ tasks });
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // Récupérer les tâches en retard ou du jour
  app.get("/api/tasks/due", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      console.log(`[DEBUG] Récupération des tâches dues pour l'utilisateur ${userId} avec rôle ${userRole}`);
      
      let tasks = [];
      
      // Pour l'instant, nous récupérons uniquement les tâches de l'utilisateur
      // Cela peut être étendu pour les managers pour récupérer également les tâches de l'équipe
      tasks = await storage.getDueTasks(userId);
      
      console.log(`[DEBUG] ${tasks.length} tâches dues récupérées`);
      
      // Log détaillé pour le débogage si nécessaire
      if (tasks.length > 0) {
        for (const task of tasks) {
          console.log(`[DEBUG] Tâche due: ID=${task.id}, Titre="${task.title}", Échéance=${task.dueDate ? new Date(task.dueDate).toISOString() : 'Non définie'}`);
        }
      } else {
        console.log(`[DEBUG] Aucune tâche due trouvée pour l'utilisateur ${userId}`);
      }
      
      res.json({ success: true, tasks });
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches dues:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors du chargement des tâches dues",
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      });
    }
  });
  
  // Créer une nouvelle tâche
  app.post("/api/tasks", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Valider les données avec le schéma Zod
      let taskData = agentTaskValidationSchema.parse({
        ...req.body,
        userId // Associer la tâche à l'utilisateur connecté
      });
      
      // Convertir les champs de date de string à Date si nécessaire
      if (taskData.dueDate && typeof taskData.dueDate === 'string') {
        taskData = {
          ...taskData,
          dueDate: new Date(taskData.dueDate)
        };
      }
      
      if (taskData.remindAt && typeof taskData.remindAt === 'string') {
        taskData = {
          ...taskData,
          remindAt: new Date(taskData.remindAt)
        };
      }
      
      // Créer la tâche
      const task = await storage.createAgentTask(taskData);
      
      // Enregistrer l'activité
      await storage.logActivity({
        action: ACTIVITY_ACTIONS.TASK_CREATED,
        userId,
        entityType: "task",
        entityId: task.id,
        details: JSON.stringify({ title: task.title, priority: task.priority })
      });
      
      res.status(201).json({ task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données de tâche invalides", 
          errors: error.errors 
        });
      }
      
      console.error("Erreur lors de la création d'une tâche:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // Mettre à jour une tâche
  app.patch("/api/tasks/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Vérifier que la tâche existe et appartient à l'utilisateur
      const existingTask = await storage.getAgentTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      if (existingTask.userId !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette tâche" });
      }
      
      // Convertir les champs de date de string à Date si nécessaire
      let taskData = { ...req.body };
      
      if (taskData.dueDate && typeof taskData.dueDate === 'string') {
        taskData.dueDate = new Date(taskData.dueDate);
      }
      
      if (taskData.remindAt && typeof taskData.remindAt === 'string') {
        taskData.remindAt = new Date(taskData.remindAt);
      }
      
      // Mettre à jour la tâche
      const updatedTask = await storage.updateAgentTask(taskId, taskData);
      
      // Enregistrer l'activité
      await storage.logActivity({
        action: ACTIVITY_ACTIONS.TASK_UPDATED,
        userId,
        entityType: "task",
        entityId: taskId,
        details: JSON.stringify({ title: updatedTask?.title, changes: taskData })
      });
      
      res.json({ task: updatedTask });
    } catch (error) {
      console.error("Erreur lors de la mise à jour d'une tâche:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // Marquer une tâche comme terminée
  app.post("/api/tasks/:id/complete", requireAuth, requireAdmin, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Vérifier que la tâche existe et appartient à l'utilisateur
      const existingTask = await storage.getAgentTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      if (existingTask.userId !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette tâche" });
      }
      
      // Marquer comme terminée
      const completedTask = await storage.completeAgentTask(taskId, userId);
      
      // Enregistrer l'activité
      await storage.logActivity({
        action: ACTIVITY_ACTIONS.TASK_COMPLETED,
        userId,
        entityType: "task",
        entityId: taskId,
        details: JSON.stringify({ title: completedTask?.title })
      });
      
      res.json({ task: completedTask });
    } catch (error) {
      console.error("Erreur lors de la complétion d'une tâche:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // Supprimer une tâche
  app.delete("/api/tasks/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Vérifier que la tâche existe et appartient à l'utilisateur
      const existingTask = await storage.getAgentTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      if (existingTask.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette tâche" });
      }
      
      // Supprimer la tâche
      await storage.deleteAgentTask(taskId);
      
      // Enregistrer l'activité
      await storage.logActivity({
        action: ACTIVITY_ACTIONS.TASK_DELETED,
        userId,
        entityType: "task",
        entityId: taskId,
        details: JSON.stringify({ title: existingTask.title })
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur lors de la suppression d'une tâche:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // Route de test pour créer une tâche de démonstration (utilisée uniquement en développement)
  app.post("/api/tasks/create-test", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ message: "Route non disponible en production" });
    }
    
    try {
      console.log("[DEBUG] Création d'une tâche de test");
      
      // Trouver l'ID d'un premier utilisateur disponible
      const [user] = await db.select({ id: users.id }).from(users).limit(1);
      
      if (!user) {
        return res.status(400).json({ message: "Aucun utilisateur trouvé pour créer une tâche de test" });
      }
      
      const userId = user.id;
      console.log(`[DEBUG] Utilisateur trouvé pour la tâche de test: ${userId}`);
      
      // Créer une tâche avec échéance aujourd'hui
      const today = new Date();
      
      const taskData = {
        title: "Tâche de test - " + today.toLocaleTimeString('fr-FR'),
        description: "Cette tâche a été créée automatiquement pour tester le système de gestion des tâches",
        userId: userId,
        status: "pending" as const,
        priority: "high" as const,
        dueDate: today,
        remindAt: new Date(today.getTime() + 60 * 60 * 1000), // Rappel dans 1 heure
        reminderSent: false
      };
      
      const task = await storage.createAgentTask(taskData);
      console.log(`[DEBUG] Tâche de test créée avec ID: ${task.id}`);
      
      res.json({ 
        success: true, 
        message: "Tâche de test créée avec succès", 
        task 
      });
    } catch (error) {
      console.error("Erreur lors de la création de la tâche de test:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la création de la tâche de test" 
      });
    }
  });
  
  // Route de test pour vérifier les tâches dues (utilisée uniquement en développement)
  app.get("/api/tasks/debug", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ message: "Route non disponible en production" });
    }
    
    try {
      console.log("[DEBUG] Vérification des tâches dues (debug)");
      
      // Récupérer toutes les tâches en attente
      const allTasks = await db.select().from(agentTasks).where(eq(agentTasks.status, 'pending'));
      console.log(`[DEBUG] ${allTasks.length} tâches en attente au total`);
      
      // Vérifier les tâches dues aujourd'hui  
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      console.log(`[DEBUG Debug] Date limite: ${today.toISOString()}`);
      
      // Filtrer les tâches dues manuellement
      const dueTasks = allTasks.filter(task => {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        console.log(`[DEBUG Debug] Tâche ${task.id}: échéance ${dueDate.toISOString()}, titre: ${task.title}`);
        
        return dueDate <= today;
      });
      
      console.log(`[DEBUG] ${dueTasks.length} tâches dues aujourd'hui`);
      
      // Retourner à la fois toutes les tâches et les tâches dues
      res.json({
        success: true,
        allTasks: allTasks,
        dueTasks: dueTasks,
        today: today.toISOString()
      });
    } catch (error) {
      console.error("Erreur lors de la vérification des tâches (debug):", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la vérification des tâches"
      });
    }
  });
  
  // Route pour récupérer tous les paiements RAC- authentiques depuis Stripe
  app.get('/api/stripe/rac-payments', requireAuth, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          success: false, 
          message: "Stripe non configuré" 
        });
      }

      console.log("Récupération de tous les paiements RAC- depuis Stripe...");
      
      // Récupérer tous les paiements des 60 derniers jours pour avoir un historique complet
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const paymentIntents = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(sixtyDaysAgo.getTime() / 1000),
        },
        limit: 100,
        expand: ['data.payment_method', 'data.customer'],
      });

      // Filtrer les paiements RAC-
      const filteredPayments = paymentIntents.data
        .filter(payment => {
          // Vérifier si le paiement contient une référence RAC-
          const hasRacReference = 
            (payment.description && payment.description.includes('RAC-')) ||
            (payment.metadata && Object.values(payment.metadata).some(v => 
              typeof v === 'string' && v.includes('RAC-')
            ));
          return hasRacReference;
        });

      // Traiter chaque paiement de manière asynchrone
      const racPayments = await Promise.all(filteredPayments.map(async payment => {
          // Extraire la référence RAC- des métadonnées ou de la description
          let referenceNumber = '';
          if (payment.metadata && payment.metadata.referenceNumber) {
            referenceNumber = payment.metadata.referenceNumber;
          } else if (payment.metadata && payment.metadata.reference) {
            referenceNumber = payment.metadata.reference;
          } else if (payment.description && payment.description.includes('RAC-')) {
            const match = payment.description.match(/RAC-[A-Z0-9-]+/);
            referenceNumber = match ? match[0] : payment.description;
          } else if (payment.metadata) {
            // Chercher dans toutes les métadonnées une référence RAC-
            for (const [key, value] of Object.entries(payment.metadata)) {
              if (typeof value === 'string' && value.includes('RAC-')) {
                const match = value.match(/RAC-[A-Z0-9-]+/);
                if (match) {
                  referenceNumber = match[0];
                  break;
                }
              }
            }
          }

          // Construire le nom complet du client à partir de toutes les sources disponibles
          let customerName = '';
          let customerEmail = '';
          
          // D'abord essayer depuis Stripe metadata
          if (payment.metadata) {
            const prenom = payment.metadata.prenom || payment.metadata.firstName || '';
            const nom = payment.metadata.nom || payment.metadata.lastName || '';
            
            if (prenom && nom) {
              customerName = `${prenom} ${nom}`;
            } else if (payment.metadata.customerName) {
              customerName = payment.metadata.customerName;
            } else if (payment.metadata.name) {
              customerName = payment.metadata.name;
            } else if (prenom || nom) {
              customerName = `${prenom}${nom}`.trim();
            }
            
            customerEmail = payment.metadata?.email || 
                           payment.metadata?.customerEmail || 
                           payment.receipt_email || 
                           '';
          }

          // Si pas d'infos dans Stripe ET qu'on a une référence, chercher dans la DB locale
          if ((!customerName || !customerEmail) && referenceNumber) {
            try {
              const dbRequest = await db.select()
                .from(serviceRequests)
                .where(or(
                  eq(serviceRequests.paymentId, payment.id),
                  like(serviceRequests.referenceNumber, `%${referenceNumber}%`)
                ))
                .limit(1);

              if (dbRequest.length > 0) {
                const request = dbRequest[0];
                if (!customerName && request.name) {
                  customerName = request.name;
                }
                if (!customerEmail && request.email) {
                  customerEmail = request.email;
                }
              }
            } catch (dbError: any) {
              console.log(`Erreur DB pour référence ${referenceNumber}:`, dbError?.message || 'Erreur inconnue');
            }
          }

          return {
            id: payment.id,
            referenceNumber: referenceNumber,
            amount: payment.amount / 100, // Convertir centimes en euros
            status: payment.status,
            createdAt: new Date(payment.created * 1000).toISOString(),
            customerEmail: customerEmail,
            customerName: customerName,
            billingName: customerName, // Assurer la compatibilité avec l'affichage frontend
            paymentMethod: payment.payment_method?.type || 'card',
            metadata: payment.metadata,
            clientIp: payment.metadata?.clientIp || payment.metadata?.client_ip || '',
            userAgent: payment.metadata?.userAgent || payment.metadata?.user_agent || ''
          };
        }))
        .then(payments => payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      console.log(`${racPayments.length} paiements RAC- trouvés dans Stripe`);
      
      res.json(racPayments);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements RAC-:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération des paiements" 
      });
    }
  });

  // Configuration du système de notifications
  const notificationService = setupNotificationRoutes(httpServer);
  
  // Endpoints de diagnostic Stripe pour analyser les paiements RAC-
  app.post('/api/test/stripe-all-payments', async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      
      const paymentIntents = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(new Date(startDate).getTime() / 1000),
          lte: Math.floor(new Date(endDate).getTime() / 1000),
        },
        limit: 50,
        expand: ['data.payment_method', 'data.charges', 'data.customer'],
      });

      const allPayments = paymentIntents.data.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100,
        status: payment.status,
        created: new Date(payment.created * 1000).toISOString(),
        description: payment.description,
        metadata: payment.metadata,
        customer: payment.customer,
        payment_method: payment.payment_method,
        charges: payment.charges?.data?.[0]
      }));

      res.json({
        success: true,
        total: allPayments.length,
        payments: allPayments,
        racPayments: allPayments.filter(p => 
          (p.description && p.description.includes('RAC-')) ||
          (p.metadata && Object.values(p.metadata).some(v => v.includes('RAC-')))
        )
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/test/db-payments-rac', async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.body;
      
      const dbPayments = await db.select()
        .from(payments)
        .where(sql`created_at >= ${dateFrom} AND created_at <= ${dateTo}`)
        .orderBy(sql`created_at DESC`);

      const racPayments = dbPayments.filter(p => 
        p.referenceNumber && p.referenceNumber.includes('RAC-')
      );

      res.json({
        success: true,
        totalInDb: dbPayments.length,
        racInDb: racPayments.length,
        racPayments: racPayments,
        allPayments: dbPayments
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Routes de test (uniquement en mode développement)
  if (process.env.NODE_ENV === 'development') {
    // Configurer le service de notification pour les routes de test
    if (notificationService) {
      // Utiliser directement la fonction importée en haut du fichier
      setNotificationService(notificationService);
    }
    
    // Route de test pour l'envoi d'emails
    app.post('/api/test/send-email', async (req, res) => {
      try {
        if (!transporter) {
          return res.status(500).json({ 
            success: false, 
            message: "Le service SMTP n'est pas configuré" 
          });
        }

        // Obtenir les emails de notification configurés
        const [notificationEmailRow] = await db.select()
          .from(systemConfigs)
          .where(eq(systemConfigs.configKey, 'notification_email'));
        
        const recipients = notificationEmailRow ? notificationEmailRow.configValue.split(',') : ["contact@portail-electricite.com"];
        const referenceNumber = `REF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Envoyer l'email
        const info = await transporter.sendMail({
          from: `"Service Raccordement" <${process.env.SMTP_USER || 'notification@portail-electricite.com'}>`,
          to: recipients.join(', '),
          subject: `🔔 Test de notification email - ${referenceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #33b060;">Test de notification email</h2>
              <p>Ceci est un email de test pour vérifier la configuration SMTP.</p>
              <p><strong>Référence de test:</strong> ${referenceNumber}</p>
              <p><strong>Date et heure:</strong> ${new Date().toLocaleString()}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">
                Email automatique envoyé par le système de test. 
                Si vous recevez cet email, la configuration SMTP fonctionne correctement.
              </p>
            </div>
          `
        });
        
        res.json({ 
          success: true, 
          message: "Email de test envoyé avec succès", 
          details: {
            messageId: info.messageId,
            recipients: recipients
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de test:", error);
        res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email",
        });
      }
    });
    
    app.use('/api', testRouter);
    console.log('Routes de test activées en mode développement');
  }
  
  // Routes pour les métriques de performance (admin uniquement)
  app.use('/api/performance', performanceRouter);
  
  // Enregistrer les nouvelles routes de performance améliorées
  registerPerformanceRoutes(app);
  
  // Routes pour les reçus de paiement
  setupPaymentReceiptRoutes(app);
  
  // Nettoyage des ressources à la fermeture de l'application
  process.on('SIGINT', () => {
    process.exit(0);
  });
  
  // API pour les emails manuels avec destinataires personnalisés
  app.post("/api/emails/send-custom", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Schéma de validation
      const emailSchema = z.object({
        to: z.string().email("Adresse email invalide"),
        subject: z.string().min(1, "Le sujet est obligatoire"),
        body: z.string().min(1, "Le contenu est obligatoire"),
        templateId: z.string().optional()
      });
      
      const validationResult = emailSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation des données d'email",
          errors: validationError.details
        });
      }
      
      const { to, subject, body } = validationResult.data;
      
      // Vérifier si l'utilisateur a sa propre configuration SMTP
      const userId = req.user?.id || 0;
      const userTransporter = await emailService.getUserTransporter(userId);
      
      // Si l'utilisateur n'a pas de configuration SMTP, vérifier le service global
      if (!userTransporter) {
        const smtpConfig = await emailService.getSmtpConfig();
        if (!smtpConfig.enabled || !emailService.transporter) {
          return res.status(400).json({
            success: false,
            message: "Aucun service d'email n'est configuré. Vérifiez votre configuration SMTP."
          });
        }
      }
      
      // Déterminer quelle configuration utiliser
      const useUserConfig = !!userTransporter;

      // Préparer le contenu HTML de l'email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${body.replace(/\n/g, '<br>')}
        </div>
      `;
      
      // Envoyer l'email au destinataire personnalisé
      try {
        let info;
        if (useUserConfig) {
          // Utiliser la configuration SMTP de l'utilisateur
          const result = await emailService.sendEmailAsUser(userId, {
            to: to,
            subject: subject,
            html: htmlContent
          });
          
          if (!result.success) {
            throw new Error(result.error || "Erreur d'envoi d'email avec la configuration utilisateur");
          }
          
          info = { messageId: "sent-with-user-config" };
        } else {
          // Utiliser la configuration SMTP globale
          const smtpConfig = await emailService.getSmtpConfig();
          const mailOptions = {
            from: smtpConfig.defaultFrom,
            to: to,
            subject: subject,
            html: htmlContent
          };
          
          info = await emailService.transporter.sendMail(mailOptions);
        }
        
        // Journaliser cet envoi
        await storage.logActivity({
          entityType: 'email',
          entityId: 0, // Pas d'entité spécifique
          action: 'custom_email_sent',
          userId: req.user?.id || 0,
          details: JSON.stringify({
            to: to,
            subject: subject,
            messageId: info.messageId
          })
        });
        
        return res.status(200).json({
          success: true,
          message: "Email envoyé avec succès",
          info: {
            messageId: info.messageId
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email personnalisé:", error);
        return res.status(500).json({
          success: false,
          message: `Erreur lors de l'envoi de l'email: ${error.message || 'Erreur inconnue'}`
        });
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la requête d'envoi d'email personnalisé:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors du traitement de la requête"
      });
    }
  });
  
  // API pour les emails manuels aux leads
  app.post("/api/emails/send", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Schéma de validation
      const emailSchema = z.object({
        recipients: z.array(z.object({
          id: z.number(),
          email: z.string().email("Adresse email invalide"),
          name: z.string().optional(),
          referenceNumber: z.string().optional()
        })),
        subject: z.string().min(1, "Le sujet est obligatoire"),
        content: z.string().min(1, "Le contenu est obligatoire"),
        templateId: z.string().optional()
      });
      
      const validationResult = emailSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation des données d'email",
          errors: validationError.details
        });
      }
      
      const { recipients, subject, content } = validationResult.data;
      
      // Vérifier si l'utilisateur a sa propre configuration SMTP
      const userId = req.user?.id || 0;
      const userTransporter = await emailService.getUserTransporter(userId);
      
      // Si l'utilisateur n'a pas de configuration SMTP, vérifier le service global
      if (!userTransporter) {
        const smtpConfig = await emailService.getSmtpConfig();
        if (!smtpConfig.enabled || !emailService.transporter) {
          return res.status(400).json({
            success: false,
            message: "Aucun service d'email n'est configuré. Vérifiez votre configuration SMTP."
          });
        }
      }
      
      // Déterminer quelle configuration utiliser
      const useUserConfig = !!userTransporter;
      
      // Envoyer l'email à chaque destinataire
      const results = [];
      
      for (const recipient of recipients) {
        try {
          // Préparer le contenu personnalisé pour ce destinataire
          // Récupérer les informations complètes sur le lead
          const lead = await storage.getLeadById(recipient.id);
          
          if (lead) {
            // Personnaliser le contenu avec les données du lead
            const personalizedContent = content
              .replace(/\{\{name\}\}/g, `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client')
              .replace(/\{\{firstName\}\}/g, lead.firstName || '')
              .replace(/\{\{lastName\}\}/g, lead.lastName || '')
              .replace(/\{\{email\}\}/g, lead.email || '')
              .replace(/\{\{phone\}\}/g, lead.phone || '')
              .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || '')
              .replace(/\{\{address\}\}/g, lead.address || '')
              .replace(/\{\{company\}\}/g, lead.company || '');
            
            const personalizedSubject = subject
              .replace(/\{\{name\}\}/g, `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client')
              .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || '');
            
            // Préparer le contenu HTML de l'email
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${personalizedContent.replace(/\n/g, '<br>')}
              </div>
            `;
            
            // Déterminer quelle configuration SMTP utiliser
            let info;
            
            if (useUserConfig) {
              // Utiliser la configuration SMTP de l'utilisateur
              const result = await emailService.sendEmailAsUser(userId, {
                to: recipient.email,
                subject: personalizedSubject,
                html: htmlContent
              });
              
              if (!result.success) {
                throw new Error(result.error || "Erreur d'envoi d'email avec la configuration utilisateur");
              }
              
              info = { messageId: "sent-with-user-config" };
            } else {
              // Utiliser la configuration SMTP globale
              const smtpConfig = await emailService.getSmtpConfig();
              const mailOptions = {
                from: smtpConfig.defaultFrom,
                to: recipient.email,
                subject: personalizedSubject,
                html: htmlContent
              };
              
              info = await emailService.transporter.sendMail(mailOptions);
            }
            
            // Journaliser cet envoi
            await storage.logActivity({
              entityType: 'lead',
              entityId: recipient.id,
              action: 'email_sent',
              userId: req.user?.id || 0,
              details: JSON.stringify({
                subject: personalizedSubject,
                messageId: info.messageId
              })
            });
            
            results.push({
              leadId: recipient.id,
              email: recipient.email,
              success: true,
              messageId: info.messageId
            });
          } else {
            results.push({
              leadId: recipient.id,
              email: recipient.email,
              success: false,
              error: "Lead non trouvé"
            });
          }
        } catch (error) {
          console.error(`Erreur lors de l'envoi de l'email à ${recipient.email}:`, error);
          results.push({
            leadId: recipient.id,
            email: recipient.email,
            success: false,
            error: error instanceof Error ? error.message : "Erreur d'envoi"
          });
        }
      }
      
      // Compter les succès et échecs
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return res.status(200).json({
        success: true,
        message: `Email(s) envoyé(s) avec succès: ${successCount}, échecs: ${failureCount}`,
        results
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi des emails:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour récupérer les templates d'email (réservé aux administrateurs)
  app.get("/api/email-templates", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Récupérer les templates depuis la base de données
      const templates = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.updatedAt));
      
      return res.status(200).json({
        success: true,
        templates
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des templates d'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour ajouter/modifier un template d'email
  app.post("/api/email-templates", requireAuth, requireAdmin, async (req, res) => {
    try {
      const templateSchema = z.object({
        id: z.string().optional(), // Si présent, c'est une mise à jour
        name: z.string().min(1, "Le nom est obligatoire"),
        subject: z.string().min(1, "Le sujet est obligatoire"),
        body: z.string().min(1, "Le contenu est obligatoire"),
        trigger: z.string().optional(),
        active: z.boolean().default(true)
      });
      
      const validationResult = templateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation du template",
          errors: validationError.details
        });
      }
      
      const { id, ...templateData } = validationResult.data;
      
      let template;
      if (id) {
        // Mise à jour d'un template existant
        const [updated] = await db.update(emailTemplates)
          .set({
            ...templateData,
            updatedAt: new Date()
          })
          .where(eq(emailTemplates.id, id))
          .returning();
        
        template = updated;
      } else {
        // Création d'un nouveau template
        const [newTemplate] = await db.insert(emailTemplates)
          .values({
            ...templateData,
            id: ulid(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        template = newTemplate;
      }
      
      res.status(200).json({
        success: true,
        message: id ? "Template mis à jour avec succès" : "Template créé avec succès",
        template
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du template d'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour supprimer un template d'email
  app.delete("/api/email-templates/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier si le template existe
      const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé"
        });
      }
      
      // Supprimer le template
      await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
      
      res.status(200).json({
        success: true,
        message: "Template supprimé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du template d'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour récupérer les emails reçus (inbox) - simulé pour le moment
  app.get("/api/emails/inbox", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Dans une version future, cela devrait se connecter à l'IMAP et récupérer les emails réels
      // Pour le moment, on simule des données
      const emails = [];
      
      return res.status(200).json({
        success: true,
        emails
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des emails reçus:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour récupérer la configuration SMTP d'un utilisateur spécifique
  app.get("/api/users/:userId/smtp-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Récupérer l'utilisateur avec ses paramètres SMTP
      const userTable = users; // Pour éviter les confusions avec le nom de variable
      const [user] = await db.select()
        .from(userTable)
        .where(eq(userTable.id, parseInt(userId)));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }
      
      // Construire l'objet de configuration SMTP
      const smtpConfig = {
        enabled: user.smtpEnabled || false,
        host: user.smtpHost || "",
        port: user.smtpPort || 587,
        secure: user.smtpSecure !== false, // Par défaut true
        auth: {
          user: user.smtpUser || "",
          // Masquer le mot de passe pour des raisons de sécurité
          pass: user.smtpPassword ? "••••••••••••" : ""
        },
        fromEmail: user.smtpFromEmail || user.email || ""
      };
      
      return res.status(200).json({
        success: true,
        data: smtpConfig
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration SMTP de l'utilisateur:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour mettre à jour la configuration SMTP d'un utilisateur spécifique
  app.post("/api/users/:userId/smtp-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Schéma de validation pour la configuration SMTP utilisateur
      const userSmtpConfigSchema = z.object({
        enabled: z.boolean().default(false),
        host: z.string().min(1, "L'hôte SMTP est requis").optional(),
        port: z.number().int().positive("Le port doit être un nombre entier positif").optional(),
        secure: z.boolean().optional(),
        auth: z.object({
          user: z.string().min(1, "L'utilisateur SMTP est requis").optional(),
          pass: z.string().optional()
        }),
        fromEmail: z.string().email("L'adresse d'expédition doit être un email valide").optional()
      });
      
      const validationResult = userSmtpConfigSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation de la configuration SMTP",
          errors: validationError.details
        });
      }
      
      const { enabled, host, port, secure, auth, fromEmail } = validationResult.data;
      
      // Si la configuration est activée, vérifier que tous les champs requis sont présents
      if (enabled && (!host || !auth.user || !fromEmail)) {
        return res.status(400).json({
          success: false,
          message: "Configuration SMTP incomplète",
          errors: [
            !host ? "L'hôte SMTP est requis" : null,
            !auth.user ? "L'utilisateur SMTP est requis" : null,
            !fromEmail ? "L'adresse d'expédition est requise" : null
          ].filter(Boolean)
        });
      }
      
      // Mise à jour des paramètres SMTP de l'utilisateur
      const userTable = users; // Pour éviter les confusions avec le nom de variable
      const [updatedUser] = await db.update(userTable)
        .set({
          smtpEnabled: enabled,
          smtpHost: host,
          smtpPort: port,
          smtpSecure: secure,
          smtpUser: auth.user,
          // Ne mettre à jour le mot de passe que s'il est fourni et non vide
          ...(auth.pass && auth.pass !== "••••••••••••" ? { smtpPassword: auth.pass } : {}),
          smtpFromEmail: fromEmail
        })
        .where(eq(userTable.id, parseInt(userId)))
        .returning();
      
      if (!updatedUser) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
      }
      
      // Supprimer toute instance de transporteur existante pour forcer sa régénération
      // lors de la prochaine utilisation
      if (enabled) {
        // Tester la connexion
        const testTransporter = await emailService.getUserTransporter(parseInt(userId));
        if (!testTransporter) {
          return res.status(400).json({
            success: false,
            message: "Impossible de créer un transporteur SMTP avec les paramètres fournis"
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        message: "Configuration SMTP de l'utilisateur mise à jour avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la configuration SMTP de l'utilisateur:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Route pour tester la configuration SMTP d'un utilisateur
  app.post("/api/users/:userId/test-smtp", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      const testSchema = z.object({
        to: z.string().email("L'adresse email de test doit être valide"),
        subject: z.string().min(1, "Le sujet est requis"),
        message: z.string().min(1, "Le message est requis")
      });
      
      const validationResult = testSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation des données de test",
          errors: validationError.details
        });
      }
      
      // Envoyer l'email de test avec la configuration de l'utilisateur
      const result = await emailService.sendEmailAsUser(
        parseInt(userId),
        {
          to: validationResult.data.to,
          subject: validationResult.data.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a56db;">Test de configuration SMTP</h2>
              <p style="color: #4b5563; font-size: 16px;">
                Cet email est un test de la configuration SMTP personnalisée.
              </p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Message :</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1a56db;">
                  ${validationResult.data.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
                Si vous recevez cet email, la configuration SMTP personnalisée est fonctionnelle.
              </p>
            </div>
          `
        }
      );
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Échec de l'envoi de l'email de test", 
          error: result.error || "Erreur SMTP inconnue"
        });
      }
      
      // Logger l'activité
      await storage.logActivity({
        entityType: "system",
        entityId: 0,
        action: "user_smtp_test",
        userId: req.user?.id || 0,
        details: JSON.stringify({ 
          to: validationResult.data.to,
          subject: validationResult.data.subject,
          targetUserId: userId,
          success: true
        })
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "Email de test envoyé avec succès avec la configuration de l'utilisateur" 
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test avec la configuration utilisateur:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Une erreur est survenue lors de l'envoi de l'email de test",
        error: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });

  // Routes IMAP pour accéder aux boîtes mail des utilisateurs
  // Récupérer les emails d'un utilisateur
  app.get("/api/users/:userId/emails", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const mailbox = req.query.mailbox as string || 'INBOX';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const showSpam = req.query.showSpam === 'true';
      
      // Options de récupération des emails
      const options: emailImapService.MailboxOptions = {
        mailbox,
        limit,
        // Si showSpam est true, on montre tous les emails, sinon on filtre
        searchCriteria: showSpam ? ['ALL'] : ['ALL', ['!HEADER', 'X-Spam-Flag', 'YES']]
      };
      
      console.log(`Récupération des emails pour l'utilisateur ${userId} dans ${mailbox}`);
      
      // Récupérer les emails
      const emails = await emailImapService.getUserEmails(parseInt(userId), options);
      
      return res.status(200).json({
        success: true,
        emails: emails,
        count: emails.length,
        mailbox
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des emails:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Récupérer les dossiers mail d'un utilisateur
  app.get("/api/users/:userId/mailboxes", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Récupérer les dossiers
      const mailboxes = await emailImapService.getUserMailboxes(parseInt(userId));
      
      return res.status(200).json({
        success: true,
        mailboxes
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers mail:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Récupérer le contenu d'un email spécifique
  app.get("/api/users/:userId/emails/:emailId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId, emailId } = req.params;
      const mailbox = req.query.mailbox as string || 'INBOX';
      
      // Récupérer le contenu de l'email
      const email = await emailImapService.getEmailContent(parseInt(userId), emailId, mailbox);
      
      if (!email) {
        return res.status(404).json({
          success: false,
          message: "Email non trouvé"
        });
      }
      
      return res.status(200).json({
        success: true,
        email
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du contenu de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Marquer un email comme lu/non lu
  app.post("/api/users/:userId/emails/:emailId/mark", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId, emailId } = req.params;
      const mailbox = req.query.mailbox as string || 'INBOX';
      const isRead = req.body.isRead === true; // Par défaut, marquer comme non lu
      
      // Marquer l'email
      const success = await emailImapService.markEmail(parseInt(userId), emailId, isRead, mailbox);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de marquer l'email"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: isRead ? "Email marqué comme lu" : "Email marqué comme non lu"
      });
    } catch (error) {
      console.error("Erreur lors du marquage de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Déplacer un email
  app.post("/api/users/:userId/emails/:emailId/move", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId, emailId } = req.params;
      const sourceMailbox = req.body.sourceMailbox || 'INBOX';
      const destinationMailbox = req.body.destinationMailbox;
      
      if (!destinationMailbox) {
        return res.status(400).json({
          success: false,
          message: "Dossier de destination requis"
        });
      }
      
      // Déplacer l'email
      const success = await emailImapService.moveEmail(parseInt(userId), emailId, destinationMailbox, sourceMailbox);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de déplacer l'email"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Email déplacé vers ${destinationMailbox}`
      });
    } catch (error) {
      console.error("Erreur lors du déplacement de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Supprimer un email
  app.delete("/api/users/:userId/emails/:emailId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId, emailId } = req.params;
      const mailbox = req.query.mailbox as string || 'INBOX';
      
      // Supprimer l'email
      const success = await emailImapService.deleteEmail(parseInt(userId), emailId, mailbox);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de supprimer l'email"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Email supprimé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });

  // Endpoint optimisé pour récupérer rapidement quelques emails récents (pour les notifications)
  app.get("/api/user-emails/recent", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Si l'utilisateur est admin et a spécifié un userId, utiliser celui-ci
      // Sinon, utiliser toujours l'ID de l'utilisateur actuellement connecté
      let userId;
      if (req.user?.role === USER_ROLES.ADMIN && req.query.userId) {
        userId = parseInt(req.query.userId as string);
      } else {
        userId = req.user?.id;
      }
      const mailbox = req.query.mailbox as string || 'INBOX';
      const limit = parseInt(req.query.limit as string || '10', 10);

      // Vérifier que l'utilisateur existe
      if (!userId) {
        return res.status(400).json({ success: false, message: "ID utilisateur requis" });
      }
      
      // Récupérer les emails récents avec la fonction optimisée
      const emails = await emailImapService.getRecentUserEmails(userId, mailbox, limit);
      
      return res.json({ success: true, emails });
    } catch (error) {
      console.error(`Erreur lors de la récupération des emails récents:`, error);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération des emails récents",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Routes pour l'accès aux boîtes mail des utilisateurs
  app.get("/api/mailboxes", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.query.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur requis"
        });
      }
      
      const mailboxes = await emailImapService.getUserMailboxes(parseInt(userId as string));
      
      return res.status(200).json({
        success: true,
        mailboxes
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des boîtes mail:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Récupérer les boîtes mail de l'utilisateur connecté
  app.get("/api/user-mailboxes", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Utiliser l'ID de l'utilisateur connecté
      const userId = req.user?.id || 1; // Fallback sur l'admin si pas d'utilisateur
      
      console.log(`Récupération des boîtes mail pour l'utilisateur ${userId}`);
      const mailboxes = await emailImapService.getUserMailboxes(userId);
      
      return res.status(200).json({
        success: true,
        mailboxes
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des boîtes mail:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Récupérer les emails d'un utilisateur dans une boîte mail spécifique
  app.get("/api/user-emails", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Si l'utilisateur est admin et a spécifié un userId, utiliser celui-ci
      // Sinon, utiliser toujours l'ID de l'utilisateur actuellement connecté
      let userId;
      if (req.user?.role === USER_ROLES.ADMIN && req.query.userId) {
        userId = parseInt(req.query.userId as string);
      } else {
        userId = req.user?.id;
      }
      const mailbox = req.query.selectedMailbox as string || 'INBOX';
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur requis"
        });
      }
      
      console.log(`Récupération des emails pour l'utilisateur ${userId} dans la boîte ${mailbox}`);
      
      try {
        const emails = await emailImapService.getUserEmails(userId, {
          mailbox: mailbox,
          limit: 50 // Limite le nombre d'emails récupérés
        });
        
        // Assurer que la structure des emails est correcte pour le client
        const formattedEmails = emails.map(email => {
          // Normaliser la structure de l'expéditeur
          let normalizedFrom = email.from;
          if (!normalizedFrom) {
            normalizedFrom = [{ address: 'inconnu@email.com', name: 'Inconnu' }];
          } else if (typeof normalizedFrom === 'string') {
            normalizedFrom = [{ address: normalizedFrom, name: normalizedFrom }];
          } else if (!Array.isArray(normalizedFrom)) {
            // Si ce n'est pas un tableau, le convertir en tableau
            normalizedFrom = [normalizedFrom];
          }
          
          // Normaliser la structure des destinataires
          let normalizedTo = email.to;
          if (!normalizedTo) {
            normalizedTo = [];
          } else if (typeof normalizedTo === 'string') {
            normalizedTo = [{ address: normalizedTo, name: normalizedTo }];
          } else if (!Array.isArray(normalizedTo)) {
            normalizedTo = [normalizedTo];
          }
          
          return {
            ...email,
            from: normalizedFrom,
            to: normalizedTo,
            subject: email.subject || '(Sans objet)'
          };
        });
        
        return res.status(200).json({
          success: true,
          emails: formattedEmails
        });
      } catch (imapError) {
        console.error("Erreur IMAP:", imapError);
        return res.status(400).json({
          success: false,
          message: imapError instanceof Error 
            ? `Erreur de connexion à la boîte mail: ${imapError.message}` 
            : "Erreur de connexion à la boîte mail"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des emails:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // API de recherche de SIREN pour les entreprises professionnelles
  app.get("/api/external/siret", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 3) {
        return res.status(400).json({
          success: false,
          message: "La requête doit contenir au moins 3 caractères"
        });
      }
      
      // Appel à l'API Entreprise.data.gouv.fr
      try {
        console.log(`Recherche SIREN pour entreprise: ${query}`);
        const response = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${encodeURIComponent(query)}?per_page=5`);
        
        if (!response.ok) {
          throw new Error(`Erreur API Entreprise: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.etablissement && data.etablissement.length > 0) {
          // Transformation des résultats au format attendu par le frontend
          const results = data.etablissement.map((etab: any) => ({
            siret: etab.siret,
            siren: etab.siret ? etab.siret.substring(0, 9) : etab.siren, 
            name: etab.nom_raison_sociale || etab.unite_legale?.denomination || query
          }));
          
          return res.status(200).json({
            success: true,
            results
          });
        } else {
          // Aucun résultat trouvé
          return res.status(200).json({
            success: true,
            results: []
          });
        }
      } catch (apiError) {
        console.error("Erreur lors de l'appel à l'API Entreprise:", apiError);
        
        // En cas d'erreur de l'API d'entreprise, encourager la saisie manuelle
        return res.status(200).json({
          success: true,
          results: [],
          error: true,
          message: "Le service de recherche SIREN est temporairement indisponible. Veuillez saisir votre SIREN manuellement."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la recherche SIREN:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // API de recherche de SIREN pour les collectivités territoriales
  app.get("/api/external/siret/collectivite", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 3) {
        return res.status(400).json({
          success: false,
          message: "La requête doit contenir au moins 3 caractères"
        });
      }
      
      // Recherche spécifique pour les collectivités territoriales
      try {
        console.log(`Recherche SIREN pour collectivité: ${query}`);
        // API spécifique pour les collectivités territoriales (exemple: API SIREN)
        const response = await fetch(`https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/annuaire-administration/records?where=nom%20like%20%22${encodeURIComponent(query)}%22&limit=5`);
        
        if (!response.ok) {
          throw new Error(`Erreur API collectivités: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.results && data.results.length > 0) {
          // Transformation des résultats au format attendu par le frontend
          const results = data.results.map((coll: any) => ({
            siret: coll.siret || `COLL-${coll.id || Date.now().toString().substring(5, 14)}`,
            siren: coll.siret ? coll.siret.substring(0, 9) : (`COLL-${coll.id || Date.now().toString().substring(5, 14)}`.substring(0, 9)),
            name: coll.nom || query
          }));
          
          return res.status(200).json({
            success: true,
            results
          });
        } else {
          // Aucun résultat trouvé - génération d'un SIRET temporaire
          const formattedResults = [];
          
          // Si c'est une mairie ou ville, formater spécialement
          if (query.toLowerCase().includes('mairie') || query.toLowerCase().includes('ville de')) {
            const cityName = query.replace(/mairie\s+de\s+|ville\s+de\s+/i, '');
            formattedResults.push({
              siret: `COLL-${Date.now().toString().substring(5, 14)}`,
              siren: `COLL-${Date.now().toString().substring(5, 14)}`.substring(0, 9),
              name: `Mairie de ${cityName}`
            });
          } else {
            // Pour les autres collectivités
            formattedResults.push({
              siret: `COLL-${Date.now().toString().substring(5, 14)}`,
              siren: `COLL-${Date.now().toString().substring(5, 14)}`.substring(0, 9),
              name: query
            });
          }
          
          return res.status(200).json({
            success: true,
            results: formattedResults,
            warning: "Aucune collectivité trouvée, résultat généré automatiquement"
          });
        }
      } catch (apiError) {
        console.error("Erreur lors de l'appel à l'API collectivités:", apiError);
        
        // En cas d'erreur de l'API collectivités, encourager la saisie manuelle
        return res.status(200).json({
          success: true,
          results: [],
          error: true,
          message: "Le service de recherche SIREN est temporairement indisponible. Veuillez saisir votre SIREN manuellement."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la recherche SIREN collectivité:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });

  // API de recherche rapide de leads par référence ou email pour l'autocomplétion
  app.get("/api/leads/search", requireAuth, requireAdmin, async (req, res) => {
    try {
      const searchTerm = req.query.term as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (!searchTerm || searchTerm.length < 2) {
        return res.status(200).json({
          success: true,
          results: []
        });
      }
      
      // Recherche avec priorité aux références, puis aux noms/emails
      const results = await db.select({
        id: leads.id,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        phone: leads.phone,
        referenceNumber: leads.referenceNumber,
        status: leads.status
      })
      .from(leads)
      .where(
        sql`(${leads.referenceNumber} LIKE ${'%' + searchTerm + '%'} 
          OR ${leads.email} LIKE ${'%' + searchTerm + '%'} 
          OR ${leads.firstName} LIKE ${'%' + searchTerm + '%'} 
          OR ${leads.lastName} LIKE ${'%' + searchTerm + '%'})`
      )
      .limit(limit);

      return res.status(200).json({
        success: true,
        results
      });
    } catch (error) {
      console.error("Erreur lors de la recherche de leads:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Marquer un email comme lu/non lu
  app.post("/api/mark-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Utiliser l'ID de l'utilisateur connecté par défaut, sauf si admin spécifie un autre ID
      let userId;
      if (req.user?.role === USER_ROLES.ADMIN && req.body.userId) {
        userId = req.body.userId;
      } else {
        userId = req.user?.id;
      }
      
      const { messageId, isRead, mailbox } = req.body;
      
      if (!userId || !messageId) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur et ID de message requis"
        });
      }
      
      const success = await emailImapService.markEmail(userId, messageId, isRead, mailbox || 'INBOX');
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de marquer l'email"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: isRead ? "Email marqué comme lu" : "Email marqué comme non lu"
      });
    } catch (error) {
      console.error("Erreur lors du marquage de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Déplacer un email
  app.post("/api/move-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Utiliser l'ID de l'utilisateur connecté par défaut, sauf si admin spécifie un autre ID
      let userId;
      if (req.user?.role === USER_ROLES.ADMIN && req.body.userId) {
        userId = req.body.userId;
      } else {
        userId = req.user?.id;
      }
      
      const { messageId, destinationMailbox, sourceMailbox } = req.body;
      
      if (!userId || !messageId || !destinationMailbox) {
        return res.status(400).json({
          success: false,
          message: "Informations incomplètes pour déplacer l'email"
        });
      }
      
      const success = await emailImapService.moveEmail(userId, messageId, destinationMailbox, sourceMailbox || 'INBOX');
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de déplacer l'email"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Email déplacé vers ${destinationMailbox}`
      });
    } catch (error) {
      console.error("Erreur lors du déplacement de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });
  
  // Supprimer un email
  app.post("/api/delete-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Utiliser l'ID de l'utilisateur connecté par défaut, sauf si admin spécifie un autre ID
      let userId;
      if (req.user?.role === USER_ROLES.ADMIN && req.body.userId) {
        userId = req.body.userId;
      } else {
        userId = req.user?.id;
      }
      
      const { messageId, mailbox } = req.body;
      
      if (!userId || !messageId) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur et ID de message requis"
        });
      }
      
      const success = await emailImapService.deleteEmail(userId, messageId, mailbox || 'INBOX');
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Impossible de supprimer l'email"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Email supprimé avec succès",
        messageId: messageId // Renvoyer l'ID du message supprimé pour la mise à jour côté client
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'email:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  });

  // Route des paiements d'agents gérée plus haut dans le fichier (ligne ~5822)
  
  // Routes pour les statistiques des utilisateurs
  
  // Récupérer les statistiques actuelles
  app.get("/api/user-stats/current", requireAuth, async (req, res) => {
    try {
      // Par défaut, récupérer les statistiques de l'utilisateur connecté
      const userId = req.user?.id || 0;
      const userRole = req.user?.role || '';
      
      // Obtenir les utilisateurs gérés si c'est un manager
      let managedUserIds: number[] = [];
      if (userRole === USER_ROLES.MANAGER) {
        // Récupérer l'ID du manager et les IDs des utilisateurs qu'il gère
        const managedUsers = await storage.getUsersForManager(userId);
        managedUserIds = [userId, ...(managedUsers.map(u => u.id) || [])];
      }
      
      const userStats = await userStatsService.getCurrentStats(userId, userRole, managedUserIds);
      
      return res.status(200).json(userStats);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des statistiques"
      });
    }
  });
  
  // Récupérer les statistiques actuelles d'un utilisateur spécifique
  app.get("/api/user-stats/current/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userRole = req.user?.role || '';
      
      // Obtenir les utilisateurs gérés si c'est un manager
      let managedUserIds: number[] = [];
      if (userRole === USER_ROLES.MANAGER) {
        const managedUsers = await storage.getUsersForManager(req.user?.id || 0);
        managedUserIds = [req.user?.id || 0, ...(managedUsers.map(u => u.id) || [])];
      }
      
      // Vérifier les permissions selon le rôle
      if (userRole === USER_ROLES.ADMIN) {
        // L'admin peut voir les statistiques de n'importe quel utilisateur
        const userStats = await userStatsService.getCurrentStats(userId, userRole);
        return res.status(200).json(userStats);
      } 
      else if (userRole === USER_ROLES.MANAGER) {
        // Le manager ne peut voir que ses statistiques et celles des agents qu'il gère
        if (userId === req.user?.id || managedUserIds.includes(userId)) {
          const userStats = await userStatsService.getCurrentStats(userId, userRole, managedUserIds);
          return res.status(200).json(userStats);
        } else {
          return res.status(403).json({
            success: false,
            message: "Vous n'avez pas la permission de voir les statistiques de cet utilisateur"
          });
        }
      }
      else {
        // L'agent ne peut voir que ses propres statistiques
        if (userId === req.user?.id) {
          const userStats = await userStatsService.getCurrentStats(userId, userRole);
          return res.status(200).json(userStats);
        } else {
          return res.status(403).json({
            success: false,
            message: "Vous n'avez pas la permission de voir les statistiques de cet utilisateur"
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération des statistiques"
      });
    }
  });
  
  // Récupérer l'historique des statistiques
  app.get("/api/user-stats/history", requireAuth, requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await userStatsService.getStatsHistory(); // récupérer l'historique de tous les utilisateurs
      
      return res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des statistiques:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération de l'historique des statistiques"
      });
    }
  });
  
  // Récupérer l'historique des statistiques d'un utilisateur spécifique
  app.get("/api/user-stats/history/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Vérifier les permissions: un utilisateur ne peut voir que son propre historique
      if (req.user?.id !== userId) {
        // Si c'est un admin, il peut voir tous les utilisateurs
        if (req.user?.role === USER_ROLES.ADMIN) {
          // Permission accordée, continuer
        } 
        // Si c'est un manager, il ne peut voir que les utilisateurs de son équipe
        else if (req.user?.role === USER_ROLES.MANAGER) {
          // Récupérer les utilisateurs de l'équipe du manager
          const managerId = req.user.id;
          const teamUsers = await storage.getUsersForManager(managerId);
          
          // Vérifier si l'utilisateur demandé fait partie de l'équipe du manager
          const isTeamMember = teamUsers.some(user => user.id === userId);
          
          if (!isTeamMember) {
            return res.status(403).json({
              success: false,
              message: "Vous n'avez pas la permission de voir l'historique des statistiques de cet utilisateur qui n'est pas dans votre équipe"
            });
          }
        } 
        // Autres rôles n'ont pas accès
        else {
          return res.status(403).json({
            success: false,
            message: "Vous n'avez pas la permission de voir l'historique des statistiques de cet utilisateur"
          });
        }
      }
      
      const history = await userStatsService.getStatsHistory(userId);
      
      return res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des statistiques:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération de l'historique des statistiques"
      });
    }
  });
  
  // Récupérer l'aperçu global des statistiques (pour admins/managers uniquement)
  app.get("/api/user-stats/overview", requireAuth, requireAdmin, async (req, res) => {
    try {
      let overview;
      
      // Si c'est un admin, il peut voir toutes les statistiques
      if (req.user?.role === USER_ROLES.ADMIN) {
        overview = await userStatsService.getStatsOverview();
      }
      // Si c'est un manager, il ne peut voir que les statistiques de son équipe
      else if (req.user?.role === USER_ROLES.MANAGER) {
        const managerId = req.user.id;
        // Récupérer les utilisateurs de l'équipe du manager
        const teamUsers = await storage.getUsersForManager(managerId);
        const teamUserIds = teamUsers.map(user => user.id);
        
        // Récupérer les statistiques globales puis les filtrer pour cette équipe
        const allStats = await userStatsService.getStatsOverview();
        
        // Recalculer les totaux seulement pour l'équipe
        const teamStats = {
          totalLeads: 0,
          totalConversions: 0,
          totalPayments: 0,
          totalAmount: 0,
          totalCommissions: 0,
          byUser: {}
        };
        
        // Filtrer les utilisateurs pour n'inclure que l'équipe
        for (const userId in allStats.byUser) {
          if (teamUserIds.includes(parseInt(userId))) {
            const userStat = allStats.byUser[userId];
            teamStats.byUser[userId] = userStat;
            teamStats.totalLeads += userStat.leadsReceived;
            teamStats.totalConversions += userStat.leadsConverted;
            teamStats.totalPayments += userStat.paymentsProcessed;
            teamStats.totalAmount += parseFloat(userStat.paymentsAmount);
            teamStats.totalCommissions += parseFloat(userStat.commissionsEarned);
          }
        }
        
        overview = teamStats;
      }
      
      return res.status(200).json({
        success: true,
        overview
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'aperçu des statistiques:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la récupération de l'aperçu des statistiques"
      });
    }
  });

  // Routes du tableau de bord manager avec données authentiques
  
  // Route globale pour toutes les statistiques du tableau de bord
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      // Statistiques des paiements RAC-
      const paymentsResult = await db
        .select()
        .from(payments)
        .where(
          and(
            like(payments.referenceNumber, 'RAC-%'),
            gte(payments.createdAt, new Date(startDate as string)),
            lte(payments.createdAt, new Date((endDate as string) + 'T23:59:59'))
          )
        );

      const paymentCount = paymentsResult.length;
      const paymentRevenue = paymentsResult.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
      const successfulPayments = paymentsResult.filter(p => p.status === 'succeeded' || p.status === 'paid').length;
      const paymentSuccessRate = paymentCount > 0 ? Math.round((successfulPayments / paymentCount) * 100) : 0;

      // Statistiques des leads LEAD-
      const leadsResult = await db
        .select()
        .from(leads)
        .where(
          and(
            like(leads.referenceNumber, 'LEAD-%'),
            gte(leads.createdAt, new Date(startDate as string)),
            lte(leads.createdAt, new Date((endDate as string) + 'T23:59:59'))
          )
        );

      const leadCount = leadsResult.length;

      // Statistiques des demandes de service RAC-
      const requestsResult = await db
        .select()
        .from(serviceRequests)
        .where(
          and(
            like(serviceRequests.referenceNumber, 'RAC-%'),
            gte(serviceRequests.createdAt, new Date(startDate as string)),
            lte(serviceRequests.createdAt, new Date((endDate as string) + 'T23:59:59'))
          )
        );

      const requestCount = requestsResult.length;

      const dashboardStats = {
        payments: {
          count: paymentCount,
          revenue: paymentRevenue,
          successRate: paymentSuccessRate,
          successful: successfulPayments
        },
        leads: {
          count: leadCount
        },
        requests: {
          count: requestCount
        },
        period: {
          startDate: startDate as string,
          endDate: endDate as string
        }
      };

      console.log(`📊 DASHBOARD STATS - Période ${startDate} à ${endDate}:`, {
        paiements: `${paymentCount} (${paymentRevenue}€)`,
        leads: leadCount,
        demandes: requestCount
      });

      return res.status(200).json(dashboardStats);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques du tableau de bord:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques"
      });
    }
  });
  
  // Statistiques des paiements avec filtres de date
  app.get("/api/dashboard/payments", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      // Requête pour les paiements dans la période
      const currentPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.createdAt, new Date(startDate as string)),
            lte(payments.createdAt, new Date((endDate as string) + 'T23:59:59'))
          )
        );

      // Calcul des statistiques
      const count = currentPayments.length;
      const revenue = currentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
      const successCount = currentPayments.filter(p => p.status === 'succeeded' || p.status === 'paid').length;
      const pendingCount = currentPayments.filter(p => p.status === 'pending').length;
      const failedCount = currentPayments.filter(p => p.status === 'failed').length;
      const successRate = count > 0 ? Math.round((successCount / count) * 100) : 0;

      // Période précédente pour comparaison
      const daysDiff = Math.ceil((new Date(endDate as string).getTime() - new Date(startDate as string).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const previousStartDate = new Date(new Date(startDate as string).getTime() - (daysDiff * 24 * 60 * 60 * 1000));
      const previousEndDate = new Date(new Date(startDate as string).getTime() - (24 * 60 * 60 * 1000));

      const previousPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.createdAt, previousStartDate),
            lte(payments.createdAt, previousEndDate)
          )
        );

      const previousCount = previousPayments.length;
      const trendData = previousCount > 0 ? {
        trend: count > previousCount ? 'up' as const : count < previousCount ? 'down' as const : 'stable' as const,
        trendPercentage: previousCount > 0 ? Math.round(((count - previousCount) / previousCount) * 100) : 0
      } : { trend: 'stable' as const, trendPercentage: 0 };

      // Récents paiements (limité à 10)
      const recent = currentPayments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(payment => ({
          id: payment.id,
          referenceNumber: payment.referenceNumber,
          reference: payment.referenceNumber,
          amount: parseFloat(payment.amount.toString()),
          status: payment.status,
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          createdAt: payment.createdAt
        }));

      return res.status(200).json({
        success: true,
        count,
        revenue,
        successCount,
        pendingCount,
        failedCount,
        successRate,
        ...trendData,
        recent
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de paiements:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques"
      });
    }
  });

  // Statistiques des leads avec filtres de date
  app.get("/api/dashboard/leads", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      // Requête pour les leads dans la période
      const currentLeads = await db
        .select()
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, new Date(startDate as string)),
            lte(leads.createdAt, new Date((endDate as string) + 'T23:59:59'))
          )
        );

      const count = currentLeads.length;

      // Période précédente pour comparaison
      const daysDiff = Math.ceil((new Date(endDate as string).getTime() - new Date(startDate as string).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const previousStartDate = new Date(new Date(startDate as string).getTime() - (daysDiff * 24 * 60 * 60 * 1000));
      const previousEndDate = new Date(new Date(startDate as string).getTime() - (24 * 60 * 60 * 1000));

      const previousLeads = await db
        .select()
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, previousStartDate),
            lte(leads.createdAt, previousEndDate)
          )
        );

      const previousCount = previousLeads.length;
      const trendData = previousCount > 0 ? {
        trend: count > previousCount ? 'up' as const : count < previousCount ? 'down' as const : 'stable' as const,
        trendPercentage: previousCount > 0 ? Math.round(((count - previousCount) / previousCount) * 100) : 0
      } : { trend: 'stable' as const, trendPercentage: 0 };

      // Récents leads (limité à 10)
      const recent = currentLeads
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(lead => ({
          id: lead.id,
          referenceNumber: lead.referenceNumber,
          reference: lead.referenceNumber,
          email: lead.email,
          name: lead.name,
          phone: lead.phone,
          status: lead.status,
          createdAt: lead.createdAt
        }));

      return res.status(200).json({
        success: true,
        count,
        ...trendData,
        recent
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de leads:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques"
      });
    }
  });

  // Statistiques des demandes de service avec filtres de date
  app.get("/api/dashboard/requests", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      // Requête pour les demandes de service dans la période
      const currentRequests = await db
        .select()
        .from(serviceRequests)
        .where(
          and(
            gte(serviceRequests.createdAt, new Date(startDate as string)),
            lte(serviceRequests.createdAt, new Date((endDate as string) + 'T23:59:59'))
          )
        );

      const count = currentRequests.length;

      // Période précédente pour comparaison
      const daysDiff = Math.ceil((new Date(endDate as string).getTime() - new Date(startDate as string).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const previousStartDate = new Date(new Date(startDate as string).getTime() - (daysDiff * 24 * 60 * 60 * 1000));
      const previousEndDate = new Date(new Date(startDate as string).getTime() - (24 * 60 * 60 * 1000));

      const previousRequests = await db
        .select()
        .from(serviceRequests)
        .where(
          and(
            gte(serviceRequests.createdAt, previousStartDate),
            lte(serviceRequests.createdAt, previousEndDate)
          )
        );

      const previousCount = previousRequests.length;
      const trendData = previousCount > 0 ? {
        trend: count > previousCount ? 'up' as const : count < previousCount ? 'down' as const : 'stable' as const,
        trendPercentage: previousCount > 0 ? Math.round(((count - previousCount) / previousCount) * 100) : 0
      } : { trend: 'stable' as const, trendPercentage: 0 };

      // Récentes demandes (limité à 10)
      const recent = currentRequests
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(request => ({
          id: request.id,
          referenceNumber: request.referenceNumber,
          reference: request.referenceNumber,
          name: request.name,
          email: request.email,
          phone: request.phone,
          serviceType: request.serviceType,
          status: request.status,
          createdAt: request.createdAt
        }));

      return res.status(200).json({
        success: true,
        count,
        ...trendData,
        recent
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de demandes:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques"
      });
    }
  });
  
  // Réinitialiser manuellement les statistiques (admin uniquement)
  app.post("/api/user-stats/reset", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Réinitialiser les statistiques pour tous les utilisateurs
      await userStatsService.resetAllUserStats();
      
      // Logger l'activité
      await storage.logActivity({
        entityType: "system",
        entityId: 0,
        action: "stats_reset",
        userId: req.user?.id || 0,
        details: JSON.stringify({
          message: "Réinitialisation manuelle des statistiques pour tous les utilisateurs"
        })
      });
      
      return res.status(200).json({
        success: true,
        message: "Les statistiques ont été réinitialisées avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des statistiques:", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la réinitialisation des statistiques"
      });
    }
  });
  
  // Nettoyage des ressources à la fermeture de l'application
  process.on('SIGINT', () => {
    process.exit(0);
  });
  
  // APIs pour le tableau de bord des responsables et agents
  // -------------------------------------------------------
  
  // Statistiques de l'équipe pour les responsables
  app.get('/api/stats/team', requireAuth, (req, res) => {
    const stats = {
      leadsCount: 47,
      conversionRate: 68,
      requestsCount: 32,
      requestsChange: 12,
      responseRate: 93,
      avgResponseTime: 45,
      pendingTasksCount: 8,
      completedTasksCount: 24,
      teamSize: 5,
      recentActivities: [
        {
          type: 'email',
          title: 'Email de suivi envoyé',
          description: 'Confirmation de rendez-vous technique pour M. Dupont',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'lead',
          title: 'Nouveau lead qualifié',
          description: 'Demande de raccordement pour résidence principale',
          date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'task',
          title: 'Tâche terminée',
          description: 'Vérification des documents pour le dossier REF-3956-123789',
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'assignment',
          title: 'Lead assigné',
          description: 'Nouvelle demande attribuée à Kevin Meyer',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    return res.status(200).json(stats);
  });
  
  // Statistiques individuelles pour un agent
  app.get('/api/stats/agent/:id', requireAuth, (req, res) => {
    const stats = {
      leadsCount: 28,
      conversionRate: 75,
      requestsCount: 21,
      requestsChange: 8,
      responseRate: 95,
      avgResponseTime: 33,
      pendingTasksCount: 4,
      completedTasksCount: 17,
      recentActivities: [
        {
          type: 'email',
          title: 'Email de confirmation envoyé',
          description: 'Confirmation de paiement pour REF-9045-567890',
          date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'task',
          title: 'Nouvelle tâche créée',
          description: 'Appel client pour valider le dossier REF-3067-890123',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'lead',
          title: 'Lead converti',
          description: 'Demande validée et paiement effectué',
          date: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    return res.status(200).json(stats);
  });
  
  // Récupération des leads pour une équipe
  app.get('/api/leads/team', requireAuth, (req, res) => {
    const leads = [
      { id: 1, name: "Jean Dupont", email: "jean.dupont@example.com", phone: "0612345678", status: "new", assigned_to: 2, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, name: "Marie Martin", email: "marie.martin@example.com", phone: "0623456789", status: "in_progress", assigned_to: 3, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, name: "Pierre Durand", email: "p.durand@example.com", phone: "0634567890", status: "qualified", assigned_to: 2, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, name: "Sophie Lefevre", email: "s.lefevre@example.com", phone: "0645678901", status: "converted", assigned_to: 3, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, name: "Lucas Bernard", email: "lucas.b@example.com", phone: "0656789012", status: "new", assigned_to: 2, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 6, name: "Emma Petit", email: "emma.p@example.com", phone: "0667890123", status: "lost", assigned_to: 3, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, name: "Thomas Moreau", email: "t.moreau@example.com", phone: "0678901234", status: "in_progress", assigned_to: 2, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, name: "Camille Roux", email: "c.roux@example.com", phone: "0689012345", status: "qualified", assigned_to: 3, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return res.status(200).json(leads);
  });
  
  // Récupération des leads pour un agent
  app.get('/api/leads/agent/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    const leads = [
      { id: 1, name: "Jean Dupont", email: "jean.dupont@example.com", phone: "0612345678", status: "new", assigned_to: Number(id), created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, name: "Pierre Durand", email: "p.durand@example.com", phone: "0634567890", status: "qualified", assigned_to: Number(id), created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, name: "Lucas Bernard", email: "lucas.b@example.com", phone: "0656789012", status: "new", assigned_to: Number(id), created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, name: "Thomas Moreau", email: "t.moreau@example.com", phone: "0678901234", status: "in_progress", assigned_to: Number(id), created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return res.status(200).json(leads);
  });
  
  // Récupération des tâches récentes
  app.get('/api/tasks/recent', requireAuth, (req, res) => {
    const tasks = [
      { id: 1, title: "Appeler Mme Martin", description: "Prendre rendez-vous pour la visite technique", status: "pending", priority: "high", due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 0, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, title: "Vérifier documents", description: "Vérifier que tous les documents du dossier REF-3956-123789 sont complets", status: "completed", priority: "medium", due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 45, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, title: "Préparer devis", description: "Préparer un devis personnalisé pour M. Dubois", status: "in_progress", priority: "medium", due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 30, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, title: "Relancer paiement", description: "Envoyer un rappel pour le paiement en attente REF-7854-456789", status: "pending", priority: "high", due_date: new Date(Date.now()).toISOString(), time_spent: 0, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, title: "Planifier intervention", description: "Coordonner avec le technicien pour l'intervention chez M. Duval", status: "completed", priority: "high", due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 60, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return res.status(200).json(tasks);
  });

  // Routes de notification pour le formulaire français principal
  app.post("/api/notifications/lead-created", async (req, res) => {
    try {
      const leadData = req.body;
      console.log('📧 Nouveau lead créé:', leadData.email);
      
      // Envoyer l'email avec les vraies données saisies
      const result = await sendLeadNotification(leadData);
      
      if (result.success) {
        console.log('✅ Email lead envoyé avec succès');
        res.json({ success: true, message: 'Notification lead envoyée' });
      } else {
        console.error('❌ Erreur envoi email lead:', result.error);
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('❌ Erreur notification lead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/notifications/request-completed", async (req, res) => {
    try {
      const requestData = req.body;
      console.log('📧 Demande complétée:', requestData.email);
      
      // Envoyer l'email avec toutes les données du formulaire en utilisant la fonction mise à jour
      const { sendRequestCompletedNotification } = await import('./email-service');
      const result = await sendRequestCompletedNotification(requestData);
      
      if (result.success) {
        console.log('✅ Email demande complétée envoyé avec succès');
        res.json({ success: true, message: 'Notification demande envoyée' });
      } else {
        console.error('❌ Erreur envoi email demande:', result.error);
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('❌ Erreur notification demande:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  return httpServer;
}
