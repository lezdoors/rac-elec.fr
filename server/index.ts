import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeAnimations } from "./init-animations";
import { performanceService } from "./performance-service";
import { setupStatsResetScheduler } from "./routes-user-stats";
import { googleSnippetsService } from "./services/google-snippets-service";
import { setupSmtpService } from "./email-service";
import { securityHeaders, createBusinessRateLimit, sanitizeInput, paymentEndpointSecurity } from "./security-middleware";
import { securityMonitoringMiddleware } from "./security-monitoring";

// Global error handlers to prevent deployment crashes
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in production
});

const app = express();

// Trust proxy for correct HTTPS detection behind load balancers
app.set('trust proxy', 1);

// Security headers - Essential security hardening
app.use(securityHeaders);

// Security monitoring - Track suspicious activities
app.use(securityMonitoringMiddleware);

// Activer la compression avancée pour performances mobiles optimales
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6, // Balance entre compression et performance CPU
  threshold: 1024, // Compresser tout au-dessus de 1KB
  chunkSize: 16 * 1024, // Chunks de 16KB pour mobile
}));

// Parse body FIRST - required for input sanitization and security checks
app.use(express.json({ limit: '10mb' })); // Increased limit for PDF generation
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enhanced rate limiting for business-critical endpoints
const formRateLimit = createBusinessRateLimit(10, 60 * 1000); // 10 requests per minute for forms
const paymentRateLimit = createBusinessRateLimit(5, 60 * 1000); // 5 requests per minute for payments
const generalRateLimit = createBusinessRateLimit(100, 60 * 1000); // 100 requests per minute general

// Apply rate limiting to specific endpoint patterns
app.use('/api/leads', formRateLimit);
app.use('/api/service-requests', formRateLimit);
app.use('/api/payment', paymentRateLimit);
app.use('/api/stripe', paymentRateLimit);
app.use('/api/admin', generalRateLimit);

// Input sanitization for all form submissions (AFTER body parsing)
app.use(sanitizeInput);

// Special security for payment endpoints (AFTER body parsing)
app.use(paymentEndpointSecurity);


// 📧 NOTIFICATION LEAD - Étape 1 → Étape 2
app.post("/api/notifications/lead-created", async (req, res) => {
  try {
    const leadData = req.body;
    console.log('🎯 LEAD CRÉÉ - Envoi notification:', leadData.email);
    console.log('📱 DONNÉES TÉLÉPHONE REÇUES:', {
      telephone: leadData.telephone,
      phone: leadData.phone,
      allData: leadData
    });
    
    // Vérifier si c'est un test avec template spécifique
    if (leadData.templateType) {
      console.log('🎨 UTILISATION TEMPLATE SPÉCIFIQUE:', leadData.templateType);
      
      if (leadData.templateType === 'clean') {
        const { sendLeadNotification } = await import('./email-service-clean');
        const emailResult = await sendLeadNotification(leadData);
        res.json({ success: true, message: 'Template Clean envoyé', emailResult });
        return;
      }
      
      if (leadData.templateType === 'gradient') {
        const { sendLeadNotification } = await import('./email-service-backup');
        const emailResult = await sendLeadNotification(leadData);
        res.json({ success: true, message: 'Template Gradient envoyé', emailResult });
        return;
      }
    }
    
    // Template par défaut
    const { sendLeadNotification } = await import('./email-service');
    const emailResult = await sendLeadNotification(leadData);
    
    res.json({ success: true, message: 'Notification lead envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification lead:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error' });
  }
});

// Route supprimée - utilisation de la route dans routes.ts uniquement

// 🎨 TEMPLATE 1 - Design Simple et Clean
app.post("/api/test-template-clean", async (req, res) => {
  try {
    const leadData = req.body;
    console.log('🎨 TEST TEMPLATE CLEAN:', leadData.email);
    
    const { sendLeadNotification } = await import('./email-service-clean');
    const emailResult = await sendLeadNotification(leadData);
    
    res.json({ success: true, message: 'Template Clean envoyé', emailResult });
  } catch (error) {
    console.error('❌ Erreur template clean:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error' });
  }
});

// 🎨 TEMPLATE 2 - Design Professionnel avec Gradient
app.post("/api/test-template-gradient", async (req, res) => {
  try {
    const leadData = req.body;
    console.log('🎨 TEST TEMPLATE GRADIENT:', leadData.email);
    
    const { sendLeadNotification } = await import('./email-service-backup');
    const emailResult = await sendLeadNotification(leadData);
    
    res.json({ success: true, message: 'Template Gradient envoyé', emailResult });
  } catch (error) {
    console.error('❌ Erreur template gradient:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// 🎨 TEMPLATES PERFECTIONNÉS - Design Simple et Clean
app.post("/api/test-template-clean-perfectionne", async (req, res) => {
  try {
    const leadData = req.body;
    console.log('🎨 TEMPLATE CLEAN PERFECTIONNÉ:', leadData.email);
    
    const { setupSmtpService } = await import('./email-service');
    const transporter = await setupSmtpService();
    
    const cleanHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Design Clean</title></head>
        <body style="margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: #ffffff; padding: 32px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <div style="display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px;">🎯 NOUVEAU PROSPECT</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827;">Lead Qualifié</h1>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">Étape 1 complétée avec succès</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #374151;">Informations Client</h2>
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px;">
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between;"><span style="color: #6b7280; font-weight: 500;">Nom complet</span><span style="color: #111827; font-weight: 600;">${leadData.prenom} ${leadData.nom}</span></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #6b7280; font-weight: 500;">Email</span><a href="mailto:${leadData.email}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${leadData.email}</a></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #6b7280; font-weight: 500;">Téléphone</span><a href="tel:${leadData.telephone}" style="color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 16px;">${leadData.telephone}</a></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #6b7280; font-weight: 500;">Type</span><span style="color: #111827; font-weight: 500;">${leadData.clientType}</span></div>
                </div>
              </div>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin-top: 24px;">
                <div style="color: #1d4ed8; font-weight: 600; font-size: 16px; margin-bottom: 4px;">⚡ Action Recommandée</div>
                <div style="color: #1e40af; font-size: 14px;">Contacter dans les 2 heures pour optimiser la conversion</div>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">Template 1 - Design Simple et Clean<br>${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const emailResult = await fetch('http://localhost:5000/api/send-direct-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'bonjour@portail-electricite.com',
        subject: '[TEMPLATE 1] 🔷 Design Simple et Clean - ' + leadData.prenom + ' ' + leadData.nom,
        html: cleanHtml
      })
    });
    
    res.json({ success: true, message: 'Template Clean Perfectionné envoyé' });
  } catch (error) {
    console.error('❌ Erreur template clean perfectionné:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// 📧 NOTIFICATION PAIEMENT RÉUSSI
app.post("/api/notifications/payment-success", async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('💰 PAIEMENT RÉUSSI - Envoi notification:', paymentData.referenceNumber);
    
    const { sendPaiementReussiNotification } = await import('./email-service');
    const emailResult = await sendPaiementReussiNotification(paymentData);
    
    res.json({ success: true, message: 'Notification paiement réussi envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification paiement réussi:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// 📧 NOTIFICATION PAIEMENT ÉCHOUÉ
app.post("/api/notifications/payment-failed", async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('🚨 PAIEMENT ÉCHOUÉ - Envoi notification:', paymentData.referenceNumber);
    
    const { sendPaiementEchoueNotification } = await import('./email-service');
    const emailResult = await sendPaiementEchoueNotification(paymentData);
    
    res.json({ success: true, message: 'Notification paiement échoué envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification paiement échoué:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});


// Route pour les notifications
app.post("/api/notifications/send", async (req, res) => {
  try {
    const { type, data, timestamp } = req.body;
    console.log('📧 Notification reçue:', { type, timestamp });
    res.json({ success: true, message: 'Notification envoyée' });
  } catch (error) {
    console.error('Erreur notification:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Route pour créer un prelead (étape 1)
app.post("/api/leads/prelead", async (req, res) => {
  try {
    const { clientType, nom, prenom, email, phone, raisonSociale, siren, nomCollectivite, sirenCollectivite } = req.body;
    
    console.log('📝 Création prelead COMPLÈTE:', { 
      nom, 
      prenom, 
      email, 
      telephone: phone,
      clientType,
      raisonSociale,
      siren,
      nomCollectivite,
      sirenCollectivite
    });
    
    // Générer une référence unique
    const referenceNumber = `LEAD-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const leadId = Math.random().toString(36).substr(2, 9);
    
    res.json({ 
      success: true, 
      leadId,
      referenceNumber,
      message: 'Prelead créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création prelead:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Route pour compléter un lead (étape 2)
app.post("/api/leads/complete", async (req, res) => {
  try {
    const { preleadId, adresse, complementAdresse, codePostal, ville, typeRaccordement, typeProjet } = req.body;
    
    console.log('✅ Completion lead:', { preleadId, ville });
    
    res.json({ 
      success: true, 
      leadId: preleadId,
      message: 'Lead complété avec succès'
    });
  } catch (error) {
    console.error('Erreur completion lead:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Servir les fichiers statiques des certificats et contrats
app.use('/certificates', express.static(path.join(process.cwd(), 'certificates')));
app.use('/contracts', express.static(path.join(process.cwd(), 'contracts')));

// Route spécifique pour le sitemap.xml avec le bon type MIME
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(sitemapPath);
});

// Route spécifique pour le robots.txt
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(robotsPath);
});

// Middleware de collecte de métriques de performance désactivé temporairement
// app.use(performanceService.performanceMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Animation initialization disabled for performance optimization
  // await initializeAnimations();
  
  // Initialiser le service email SMTP pour les notifications
  try {
    setupSmtpService();
    console.log("✅ Service email SMTP initialisé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du service email:", error);
  }
  
  // Initialiser les statistiques utilisateurs
  // Skip database initialization to prevent startup blocking
  console.log("Statistiques utilisateurs - initialisation différée");
  
  // Google Snippets removed - will be replaced with working ones
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Only serve production build in production environment
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  const buildExists = fs.existsSync(distPath);
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`🔍 Build check: ${buildExists ? '✅ Production build found' : '❌ No build found'}`);
  console.log(`📁 Dist path: ${distPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  if (buildExists) {
    // Use production build when available (Replit blocks Vite dev servers)
    console.log('🚀 Serving production build (Replit-compatible static files)...');
    // Custom static serving to bypass restricted vite.ts serveStatic function
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    console.log('🔧 No production build found: Setting up Vite dev middleware...');
    
    // Fallback to Vite dev server only when no build exists
    await setupVite(app, server);
    console.log('✅ Vite dev server configured');
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // ✅ MAINTENANT configurer le système de notifications après que le serveur HTTP écoute
    try {
      const { setupNotificationRoutes } = require("./notification-router");
      setupNotificationRoutes(server);
      console.log("🔌 WebSocket notifications configurées après démarrage du serveur");
    } catch (error) {
      console.error("❌ Erreur configuration WebSocket:", error.message);
      console.log("🔄 Application continue sans notifications WebSocket");
    }
  });
})();
