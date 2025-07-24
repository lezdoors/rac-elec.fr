// Vercel serverless function entry point
import express from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { registerRoutes } from './routes.js';
import { setupSmtpService } from './email-service.js';

const app = express();

// Configuration pour Vercel
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialiser les services
try {
  setupSmtpService();
  console.log("✅ Service email SMTP initialisé");
} catch (error) {
  console.error("❌ Erreur service email:", error);
}

// Enregistrer les routes API
await registerRoutes(app);

// Servir les fichiers statiques depuis dist/public
const distPath = path.resolve(process.cwd(), 'dist', 'public');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

export default app;