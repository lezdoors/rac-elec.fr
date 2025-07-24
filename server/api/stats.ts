import { Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { users } from "@shared/schema";
import { isAdminUser } from "../auth";

/**
 * Récupération des statistiques pour un responsable (pour l'équipe)
 * Les responsables peuvent voir les données de tous les membres de leur équipe
 */
export const getTeamStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Vérification que l'utilisateur est un responsable
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user || (user.role !== "manager" && !isAdminUser(user))) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès non autorisé" 
      });
    }
    
    // Pour simplifier dans cette démo, nous retournons des statistiques fictives
    // Dans une application réelle, nous effectuerions des requêtes sur la base de données
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
  } catch (error: any) {
    console.error("Erreur lors de la récupération des statistiques d'équipe :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

/**
 * Récupération des statistiques pour un agent individuel
 */
export const getAgentStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Vérification que l'utilisateur actuel est l'agent concerné, un responsable ou un admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, currentUserId),
    });
    
    const isAdmin = currentUser && isAdminUser(currentUser);
    const isManager = currentUser && currentUser.role === "manager";
    const isSelfAccess = Number(id) === currentUserId;
    
    if (!currentUser || (!isAdmin && !isManager && !isSelfAccess)) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès non autorisé" 
      });
    }
    
    // Pour simplifier dans cette démo, nous retournons des statistiques fictives
    // Dans une application réelle, nous effectuerions des requêtes sur la base de données
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
  } catch (error: any) {
    console.error("Erreur lors de la récupération des statistiques d'agent :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

/**
 * Récupération des leads pour un responsable (leads de l'équipe)
 */
export const getTeamLeads = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Vérification que l'utilisateur est un responsable
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user || (user.role !== "manager" && !isAdminUser(user))) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès non autorisé" 
      });
    }
    
    // Pour simplifier dans cette démo, nous retournons des données fictives
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
  } catch (error: any) {
    console.error("Erreur lors de la récupération des leads d'équipe :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

/**
 * Récupération des leads pour un agent individuel
 */
export const getAgentLeads = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Vérification que l'utilisateur actuel est l'agent concerné, un responsable ou un admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, currentUserId),
    });
    
    const isAdmin = currentUser && isAdminUser(currentUser);
    const isManager = currentUser && currentUser.role === "manager";
    const isSelfAccess = Number(id) === currentUserId;
    
    if (!currentUser || (!isAdmin && !isManager && !isSelfAccess)) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès non autorisé" 
      });
    }
    
    // Pour simplifier dans cette démo, nous retournons des données fictives
    const leads = [
      { id: 1, name: "Jean Dupont", email: "jean.dupont@example.com", phone: "0612345678", status: "new", assigned_to: Number(id), created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, name: "Pierre Durand", email: "p.durand@example.com", phone: "0634567890", status: "qualified", assigned_to: Number(id), created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, name: "Lucas Bernard", email: "lucas.b@example.com", phone: "0656789012", status: "new", assigned_to: Number(id), created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, name: "Thomas Moreau", email: "t.moreau@example.com", phone: "0678901234", status: "in_progress", assigned_to: Number(id), created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return res.status(200).json(leads);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des leads d'agent :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

/**
 * Récupération des tâches récentes
 */
export const getRecentTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Pour simplifier dans cette démo, nous retournons des données fictives
    const tasks = [
      { id: 1, title: "Appeler Mme Martin", description: "Prendre rendez-vous pour la visite technique", status: "pending", priority: "high", due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 0, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, title: "Vérifier documents", description: "Vérifier que tous les documents du dossier REF-3956-123789 sont complets", status: "completed", priority: "medium", due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 45, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, title: "Préparer devis", description: "Préparer un devis personnalisé pour M. Dubois", status: "in_progress", priority: "medium", due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 30, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, title: "Relancer paiement", description: "Envoyer un rappel pour le paiement en attente REF-7854-456789", status: "pending", priority: "high", due_date: new Date(Date.now()).toISOString(), time_spent: 0, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, title: "Planifier intervention", description: "Coordonner avec le technicien pour l'intervention chez M. Duval", status: "completed", priority: "high", due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), time_spent: 60, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return res.status(200).json(tasks);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des tâches récentes :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};