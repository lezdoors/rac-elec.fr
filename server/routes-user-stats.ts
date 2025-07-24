import { Router } from "express";
import { userStatsService } from "./user-stats-service";
import { requireAdmin, requireAuth } from "./auth";
import { Request, Response } from "express";
import schedule from "node-schedule";

/**
 * Routeur pour les endpoints liés aux statistiques utilisateurs
 */
export const userStatsRouter = Router();

// Middleware pour vérifier les permissions
const checkPermissions = (req: Request, res: Response, userId?: number) => {
  // Si l'utilisateur n'est pas connecté
  if (!req.user) {
    return false;
  }
  
  // Les administrateurs et managers peuvent voir toutes les statistiques
  if (req.user.role === "admin" || req.user.role === "manager") {
    return true;
  }
  
  // Les utilisateurs standard ne peuvent voir que leurs propres statistiques
  if (userId && req.user.id !== userId) {
    return false;
  }
  
  return true;
};

// Obtenir les statistiques actuelles
userStatsRouter.get("/current", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    
    // Par défaut, les utilisateurs standards ne voient que leurs stats
    const userId = req.user.role === "admin" || req.user.role === "manager"
      ? undefined
      : req.user.id;
    
    const stats = await userStatsService.getCurrentStats(userId);
    res.json(stats || { error: "Aucune statistique disponible" });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir les statistiques actuelles d'un utilisateur spécifique
userStatsRouter.get("/current/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    
    // Permettre aux admins et managers d'accéder aux statistiques
    // Permettre aux utilisateurs d'accéder à leurs propres statistiques
    if (req.user.role !== "admin" && req.user.role !== "manager" && req.user.id !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }
    
    const stats = await userStatsService.getCurrentStats(userId, req.user.role);
    res.json(stats || { error: "Aucune statistique disponible" });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir l'historique des statistiques
userStatsRouter.get("/history", requireAdmin, async (req: Request, res: Response) => {
  try {
    const history = await userStatsService.getStatsHistory();
    res.json({ history });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir l'historique des statistiques d'un utilisateur spécifique
userStatsRouter.get("/history/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!checkPermissions(req, res, userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }
    
    const history = await userStatsService.getStatsHistory(userId);
    res.json({ history });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir l'aperçu global des statistiques (admin uniquement)
userStatsRouter.get("/overview", requireAdmin, async (req: Request, res: Response) => {
  try {
    const overview = await userStatsService.getStatsOverview();
    res.json({ overview });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'aperçu:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Réinitialiser toutes les statistiques (admin uniquement)
userStatsRouter.post("/reset", requireAdmin, async (req: Request, res: Response) => {
  try {
    await userStatsService.resetAllUserStats();
    res.json({ success: true, message: "Statistiques réinitialisées avec succès" });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation des statistiques:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mettre à jour les statistiques pour les leads reçus
userStatsRouter.post("/increment-leads/:userId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const count = req.body.count || 1;
    
    const updated = await userStatsService.incrementLeadsReceived(userId, count);
    res.json({ success: true, stats: updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des leads:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mettre à jour les statistiques pour les leads convertis
userStatsRouter.post("/increment-conversions/:userId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const count = req.body.count || 1;
    
    const updated = await userStatsService.incrementLeadsConverted(userId, count);
    res.json({ success: true, stats: updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des conversions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mettre à jour les statistiques pour les paiements
userStatsRouter.post("/increment-payments/:userId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    let amount = 12980; // Montant par défaut: 129.80€
    
    // Normaliser le montant
    if (req.body && req.body.amount !== undefined) {
      if (typeof req.body.amount === 'string') {
        amount = parseInt(req.body.amount);
      } else {
        amount = req.body.amount;
      }
      
      // Vérifier si c'est un nombre valide
      if (isNaN(amount)) {
        amount = 12980; // Valeur par défaut
      }
    }
    
    console.log(`Incrémentation des paiements pour l'utilisateur ${userId} avec un montant de ${amount}`);
    const updated = await userStatsService.incrementPaymentsProcessed(userId, amount);
    res.json({ success: true, stats: updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paiements:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * Configure le planificateur pour la réinitialisation automatique des statistiques
 */
export function setupStatsResetScheduler() {
  console.log("Planificateur de remise à zéro des statistiques configuré (1er et 16 du mois à minuit)");
  
  // Premier jour du mois à minuit
  schedule.scheduleJob("0 0 1 * *", async () => {
    console.log("Exécution de la réinitialisation planifiée des statistiques (1er du mois)");
    await userStatsService.resetAllUserStats();
  });
  
  // 16ème jour du mois à minuit
  schedule.scheduleJob("0 0 16 * *", async () => {
    console.log("Exécution de la réinitialisation planifiée des statistiques (16 du mois)");
    await userStatsService.resetAllUserStats();
  });
  
  // Vérifier si une réinitialisation est nécessaire au démarrage
  userStatsService.checkResetNeeded().then(resetNeeded => {
    if (resetNeeded) {
      console.log("Réinitialisation des statistiques nécessaire, exécution...");
      userStatsService.resetAllUserStats().then(() => {
        console.log("Statistiques réinitialisées avec succès");
      }).catch(error => {
        console.error("Erreur lors de la réinitialisation automatique des statistiques:", error);
      });
    }
  });
}