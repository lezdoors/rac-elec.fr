import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { users } from "../shared/schema";
import {
  userStats,
  userStatsHistory,
  ResetPeriod,
  InsertUserStat,
  UpdateUserStat,
  InsertUserStatHistory,
} from "../shared/schema-user-stats";

/**
 * Service pour la gestion des statistiques utilisateurs
 */
export class UserStatsService {
  /**
   * Récupère les statistiques actuelles selon le rôle et les permissions
   * @param userId Identifiant de l'utilisateur (optionnel)
   * @param userRole Rôle de l'utilisateur ('admin', 'manager', 'agent')
   * @param managedUserIds IDs des utilisateurs gérés par le manager (si applicable)
   */
  async getCurrentStats(userId?: number, userRole?: string, managedUserIds?: number[]) {
    try {
      const conditions = [eq(userStats.isActive, true)];
      
      // Si c'est un admin, retourner toutes les statistiques ou celles d'un utilisateur spécifique
      if (userRole === 'admin') {
        if (userId) {
          conditions.push(eq(userStats.userId, userId));
          const results = await db.select().from(userStats).where(and(...conditions));
          return results.length > 0 ? results[0] : null;
        } else {
          // Admin sans userId spécifié - retourner toutes les statistiques
          const results = await db.select().from(userStats).where(and(...conditions));
          return results;
        }
      }
      
      // Si c'est un manager, retourner ses statistiques et celles des agents qu'il gère
      else if (userRole === 'manager' && managedUserIds && managedUserIds.length > 0) {
        if (userId) {
          // Vérifier si l'ID est le manager lui-même ou un de ses agents
          if (userId === managedUserIds[0] || managedUserIds.slice(1).includes(userId)) {
            conditions.push(eq(userStats.userId, userId));
            const results = await db.select().from(userStats).where(and(...conditions));
            return results.length > 0 ? results[0] : null;
          } else {
            throw new Error("Accès non autorisé aux statistiques de cet utilisateur");
          }
        } else {
          // Retourner les statistiques du manager et de tous ses agents
          conditions.push(userStats.userId.in(managedUserIds));
          const results = await db.select().from(userStats).where(and(...conditions));
          return results;
        }
      }
      
      // Si c'est un agent ou un rôle non spécifié, retourner uniquement ses propres statistiques
      else {
        if (!userId) {
          throw new Error("ID utilisateur requis pour les agents");
        }
        conditions.push(eq(userStats.userId, userId));
        const results = await db.select().from(userStats).where(and(...conditions));
        return results.length > 0 ? results[0] : null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques actuelles:", error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des statistiques selon le rôle et les permissions
   * @param userId Identifiant de l'utilisateur (optionnel)
   * @param userRole Rôle de l'utilisateur ('admin', 'manager', 'agent')
   * @param managedUserIds IDs des utilisateurs gérés par le manager (si applicable)
   */
  async getStatsHistory(userId?: number, userRole?: string, managedUserIds?: number[]) {
    try {
      // Si c'est un admin, retourner tout l'historique ou celui d'un utilisateur spécifique
      if (userRole === 'admin') {
        if (userId) {
          return await db.select()
            .from(userStatsHistory)
            .where(eq(userStatsHistory.userId, userId))
            .orderBy(desc(userStatsHistory.periodEnd));
        } else {
          return await db.select()
            .from(userStatsHistory)
            .orderBy(desc(userStatsHistory.periodEnd));
        }
      }
      
      // Si c'est un manager, retourner son historique et celui des agents qu'il gère
      else if (userRole === 'manager' && managedUserIds && managedUserIds.length > 0) {
        if (userId) {
          // Vérifier si l'ID est le manager lui-même ou un de ses agents
          if (userId === managedUserIds[0] || managedUserIds.slice(1).includes(userId)) {
            return await db.select()
              .from(userStatsHistory)
              .where(eq(userStatsHistory.userId, userId))
              .orderBy(desc(userStatsHistory.periodEnd));
          } else {
            throw new Error("Accès non autorisé à l'historique de cet utilisateur");
          }
        } else {
          // Retourner l'historique du manager et de tous ses agents
          return await db.select()
            .from(userStatsHistory)
            .where(userStatsHistory.userId.in(managedUserIds))
            .orderBy(desc(userStatsHistory.periodEnd));
        }
      }
      
      // Si c'est un agent ou un rôle non spécifié, retourner uniquement son propre historique
      else {
        if (!userId) {
          throw new Error("ID utilisateur requis pour accéder à l'historique");
        }
        return await db.select()
          .from(userStatsHistory)
          .where(eq(userStatsHistory.userId, userId))
          .orderBy(desc(userStatsHistory.periodEnd));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des statistiques:", error);
      throw error;
    }
  }

  /**
   * Récupère une vue d'ensemble des statistiques pour tous les utilisateurs
   */
  async getStatsOverview() {
    try {
      const activeStats = await db.select().from(userStats)
        .where(eq(userStats.isActive, true));
      
      const usersData = await db.select().from(users);
      
      // Calculer les totaux
      const overview = {
        totalLeads: 0,
        totalConversions: 0, 
        totalPayments: 0,
        totalAmount: 0,
        totalCommissions: 0,
        byUser: {} as Record<number, any>
      };
      
      for (const stat of activeStats) {
        overview.totalLeads += stat.leadsReceived;
        overview.totalConversions += stat.leadsConverted;
        overview.totalPayments += stat.paymentsProcessed;
        overview.totalAmount += parseFloat(stat.paymentsAmount);
        overview.totalCommissions += parseFloat(stat.commissionsEarned);
        
        const userData = usersData.find(u => u.id === stat.userId);
        if (userData) {
          overview.byUser[stat.userId] = {
            ...stat,
            username: userData.username,
            fullName: userData.fullName || null,
            role: userData.role
          };
        }
      }
      
      return overview;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'aperçu des statistiques:", error);
      throw error;
    }
  }

  /**
   * Met à jour les statistiques d'un utilisateur
   */
  async updateUserStats(userId: number, updates: Partial<UpdateUserStat>) {
    try {
      const currentStats = await this.getCurrentStats(userId);
      
      if (!currentStats) {
        return this.createUserStats({
          userId,
          leadsReceived: updates.leadsReceived || 0,
          leadsConverted: updates.leadsConverted || 0,
          paymentsProcessed: updates.paymentsProcessed || 0,
          paymentsAmount: updates.paymentsAmount || "0",
          commissionsEarned: updates.commissionsEarned || "0",
          periodStart: this.getCurrentPeriodStart().toISOString(),
          periodEnd: this.getNextPeriodStart().toISOString(),
          isActive: true
        });
      }
      
      // Mettre à jour uniquement les champs fournis
      const updatedStats = { ...currentStats };
      
      if (updates.leadsReceived !== undefined) {
        updatedStats.leadsReceived = currentStats.leadsReceived + updates.leadsReceived;
      }
      
      if (updates.leadsConverted !== undefined) {
        updatedStats.leadsConverted = currentStats.leadsConverted + updates.leadsConverted;
      }
      
      if (updates.paymentsProcessed !== undefined) {
        updatedStats.paymentsProcessed = currentStats.paymentsProcessed + updates.paymentsProcessed;
      }
      
      if (updates.paymentsAmount !== undefined) {
        const currentAmount = parseFloat(currentStats.paymentsAmount);
        const addAmount = parseFloat(updates.paymentsAmount);
        updatedStats.paymentsAmount = (currentAmount + addAmount).toString();
      }
      
      if (updates.commissionsEarned !== undefined) {
        const currentCommissions = parseFloat(currentStats.commissionsEarned);
        const addCommissions = parseFloat(updates.commissionsEarned);
        updatedStats.commissionsEarned = (currentCommissions + addCommissions).toString();
      }
      
      await db.update(userStats)
        .set({
          ...updatedStats,
          updatedAt: new Date().toISOString()
        })
        .where(eq(userStats.id, currentStats.id));
      
      return await this.getCurrentStats(userId);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statistiques utilisateur:", error);
      throw error;
    }
  }

  /**
   * Crée des statistiques pour un utilisateur
   */
  async createUserStats(data: InsertUserStat) {
    try {
      await db.insert(userStats).values({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return await this.getCurrentStats(data.userId);
    } catch (error) {
      console.error("Erreur lors de la création des statistiques utilisateur:", error);
      throw error;
    }
  }

  /**
   * Réinitialise les statistiques de tous les utilisateurs et archive la période actuelle
   */
  async resetAllUserStats() {
    try {
      // Récupérer toutes les statistiques actives
      const activeStats = await db.select().from(userStats)
        .where(eq(userStats.isActive, true));
      
      // Archiver les statistiques actuelles
      for (const stat of activeStats) {
        await this.archiveUserStat(stat);
      }
      
      // Réinitialiser toutes les statistiques actives
      await db.update(userStats)
        .set({
          leadsReceived: 0,
          leadsConverted: 0,
          paymentsProcessed: 0,
          paymentsAmount: "0",
          commissionsEarned: "0",
          periodStart: this.getCurrentPeriodStart().toISOString(),
          periodEnd: this.getNextPeriodStart().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(userStats.isActive, true));
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des statistiques:", error);
      throw error;
    }
  }

  /**
   * Archive les statistiques d'un utilisateur
   */
  private async archiveUserStat(stat: any) {
    try {
      const historyData = {
        userId: stat.userId,
        periodStart: stat.periodStart,
        periodEnd: stat.periodEnd,
        leadsReceived: stat.leadsReceived,
        leadsConverted: stat.leadsConverted,
        paymentsProcessed: stat.paymentsProcessed,
        paymentsAmount: stat.paymentsAmount,
        commissionsEarned: stat.commissionsEarned,
        dailyData: {} // À implémenter : données quotidiennes
      };
      
      await db.insert(userStatsHistory).values({
        ...historyData,
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'archivage des statistiques:", error);
      throw error;
    }
  }

  /**
   * Initialise les statistiques pour un utilisateur
   */
  async initializeUserStats(userId: number) {
    try {
      const existingStats = await this.getCurrentStats(userId);
      
      if (existingStats) {
        return existingStats;
      }
      
      return await this.createUserStats({
        userId,
        leadsReceived: 0,
        leadsConverted: 0,
        paymentsProcessed: 0,
        paymentsAmount: "0",
        commissionsEarned: "0",
        periodStart: this.getCurrentPeriodStart().toISOString(),
        periodEnd: this.getNextPeriodStart().toISOString(),
        isActive: true
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation des statistiques:", error);
      throw error;
    }
  }

  /**
   * Incrémente le nombre de leads reçus pour un utilisateur
   */
  async incrementLeadsReceived(userId: number, count: number = 1) {
    return this.updateUserStats(userId, { leadsReceived: count });
  }

  /**
   * Incrémente le nombre de leads convertis pour un utilisateur
   */
  async incrementLeadsConverted(userId: number, count: number = 1) {
    return this.updateUserStats(userId, { leadsConverted: count });
  }

  /**
   * Incrémente le nombre de paiements pour un utilisateur
   */
  async incrementPaymentsProcessed(userId: number, amount: number) {
    // Assurer que amount est un nombre
    let amountValue = 0;
    if (typeof amount === 'string') {
      amountValue = parseInt(amount);
    } else {
      amountValue = amount;
    }
    
    // Valeur par défaut si NaN
    if (isNaN(amountValue)) {
      amountValue = 12980; // 129.80€ en centimes
    }
    
    // Calcul de la commission (10.8% du montant)
    const commission = Math.round(amountValue * 0.108); // 14€ de commission pour 129.80€ => 10.8%
    
    return this.updateUserStats(userId, { 
      paymentsProcessed: 1,
      paymentsAmount: amountValue.toString(),
      commissionsEarned: commission.toString()
    });
  }

  /**
   * Vérifie si la réinitialisation des statistiques est nécessaire
   */
  async checkResetNeeded() {
    const now = new Date();
    const today = now.getDate();
    
    // Réinitialisation le 1er et le 16 du mois
    if (today === 1 || today === 16) {
      // Vérifier si la réinitialisation a déjà été effectuée aujourd'hui
      const stats = await db.select().from(userStats).limit(1);
      
      if (stats.length > 0) {
        const lastResetDate = new Date(stats[0].updatedAt);
        
        // Si la dernière mise à jour n'est pas aujourd'hui, réinitialiser
        if (
          lastResetDate.getDate() !== now.getDate() ||
          lastResetDate.getMonth() !== now.getMonth() ||
          lastResetDate.getFullYear() !== now.getFullYear()
        ) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Calcule la date de début de la période actuelle
   */
  private getCurrentPeriodStart(): Date {
    const now = new Date();
    const day = now.getDate();
    
    // Si nous sommes entre le 1er et le 15, la période a commencé le 1er
    // Si nous sommes entre le 16 et la fin du mois, la période a commencé le 16
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(day <= 15 ? 1 : 16);
    currentPeriodStart.setHours(0, 0, 0, 0);
    
    return currentPeriodStart;
  }

  /**
   * Calcule la date de début de la prochaine période
   */
  private getNextPeriodStart(): Date {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    let nextPeriodStart: Date;
    
    // Si nous sommes entre le 1er et le 15, la prochaine période commence le 16
    if (day <= 15) {
      nextPeriodStart = new Date(year, month, 16);
    } 
    // Si nous sommes entre le 16 et la fin du mois, la prochaine période commence le 1er du mois suivant
    else {
      nextPeriodStart = new Date(year, month + 1, 1);
    }
    
    nextPeriodStart.setHours(0, 0, 0, 0);
    
    return nextPeriodStart;
  }
}

export const userStatsService = new UserStatsService();