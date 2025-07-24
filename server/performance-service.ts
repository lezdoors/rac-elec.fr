import { subDays, startOfDay, isWithinInterval, parseISO, addDays } from "date-fns";
import { db } from "./db";
import { leads, agentTasks as tasks, payments, agentPerformanceMetrics } from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { storage } from "./storage";

/**
 * Service pour le calcul et la gestion des métriques de performance des agents
 */
export class PerformanceService {
  /**
   * Calcule les métriques de performance pour un utilisateur spécifique
   */
  async getUserPerformanceMetrics(userId: number) {
    try {
      // Vérifier si on a déjà des métriques calculées et mises en cache
      const cachedMetrics = await db.select()
        .from(agentPerformanceMetrics)
        .where(eq(agentPerformanceMetrics.userId, userId))
        .orderBy(desc(agentPerformanceMetrics.id))
        .limit(1);

      // Si on a des métriques récentes (moins de 1 heure), on les utilise
      if (cachedMetrics.length > 0) {
        const lastUpdate = new Date(cachedMetrics[0].updatedAt || cachedMetrics[0].createdAt);
        const isRecent = new Date().getTime() - lastUpdate.getTime() < 60 * 60 * 1000; // moins d'une heure
        
        if (isRecent) {
          return this.formatPerformanceMetrics(cachedMetrics[0]);
        }
      }

      // Sinon, on calcule les nouvelles métriques
      return await this.calculateAndStorePerformanceMetrics(userId);
    } catch (error) {
      console.error("Erreur lors de la récupération des métriques de performance:", error);
      throw new Error("Impossible de récupérer les métriques de performance");
    }
  }

  /**
   * Calcule les métriques de performance pour tous les utilisateurs
   */
  async calculateAllUserPerformanceMetrics() {
    try {
      // Récupérer tous les utilisateurs actifs
      const users = await storage.getAllUsers();
      
      // Filtrer pour ne garder que les agents et les managers
      const activeUsers = users.filter(user => 
        user.active && (user.role === "agent" || user.role === "manager")
      );

      // Calculer les métriques pour chaque utilisateur
      const results = await Promise.all(
        activeUsers.map(user => this.calculateAndStorePerformanceMetrics(user.id))
      );

      return {
        success: true,
        count: results.length,
        message: `Métriques calculées pour ${results.length} utilisateurs`
      };
    } catch (error) {
      console.error("Erreur lors du calcul des métriques pour tous les utilisateurs:", error);
      throw new Error("Impossible de calculer les métriques pour tous les utilisateurs");
    }
  }

  /**
   * Calcule et stocke les métriques de performance pour un utilisateur
   */
  private async calculateAndStorePerformanceMetrics(userId: number) {
    try {
      // Définir les dates de début et de fin de la période
      const now = new Date();
      const periodStart = startOfDay(subDays(now, 15)); // 15 derniers jours
      const periodEnd = now;

      // Récupérer les leads de l'utilisateur sur la période
      const userLeads = await db.select()
        .from(leads)
        .where(
          and(
            eq(leads.assignedTo, userId),
            sql`${leads.createdAt} >= ${periodStart.toISOString()}`,
            sql`${leads.createdAt} <= ${periodEnd.toISOString()}`
          )
        );

      // Récupérer les paiements liés à l'utilisateur sur la période
      const userPayments = await storage.getUserPayments(userId);
      
      // Filtrer les paiements pour la période actuelle
      const periodPayments = userPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return isWithinInterval(paymentDate, { start: periodStart, end: periodEnd });
      });

      // Récupérer les tâches de l'utilisateur sur la période
      const userTasks = await db.select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            sql`${tasks.createdAt} >= ${periodStart.toISOString()}`,
            sql`${tasks.createdAt} <= ${periodEnd.toISOString()}`
          )
        );

      // Calculer les métriques
      const leadsReceived = userLeads.length;
      const leadsConverted = userLeads.filter(lead => lead.status === "converted").length;
      const leadsConversionRate = leadsReceived > 0 ? (leadsConverted / leadsReceived) * 100 : 0;
      
      const paymentsProcessed = periodPayments.length;
      // Convertir les montants de paiement de string à number
      const paymentsAmount = periodPayments.reduce((sum, payment) => {
        const amount = parseFloat(payment.amount) || 0;
        return sum + amount;
      }, 0);
      // Calculer les commissions (14€ par tranche de 129.80€)
      const commissionsEarned = periodPayments.reduce((sum, payment) => {
        const amount = parseFloat(payment.amount) || 0;
        // Calculer combien de fois 129.80€ est présent dans le montant
        const baseAmount = 129.80;
        const baseCommission = 14; // 14€
        // Math.ceil pour arrondir au supérieur (ex: 1.1 tranches = 2 tranches complètes)
        const multiplier = Math.ceil(amount / baseAmount);
        return sum + (baseCommission * multiplier);
      }, 0);

      // Calculer les métriques de tâches
      const completedTasks = userTasks.filter(task => task.status === "completed").length;
      const totalTasks = userTasks.length;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculer le temps moyen de réponse (en minutes)
      const tasksWithCompletion = userTasks.filter(task => 
        task.status === "completed" && task.createdAt && task.completedAt
      );
      
      let totalResponseTime = 0;
      tasksWithCompletion.forEach(task => {
        const createdAt = new Date(task.createdAt);
        const completedAt = new Date(task.completedAt!);
        const diffMinutes = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60);
        totalResponseTime += diffMinutes;
      });
      
      const averageResponseTime = tasksWithCompletion.length > 0 
        ? totalResponseTime / tasksWithCompletion.length 
        : 0;

      // Autres métriques
      // Vérifier si les leads ont des rendez-vous programmés (ils ont une date de rappel programmée)
      const appointmentsScheduled = userLeads.filter(lead => lead.callbackDate !== null).length;
      const clientsAcquired = leadsConverted; // Simplification, mais pourrait être différent
      
      // Score de qualité: formule arbitraire basée sur plusieurs facteurs
      const qualityScore = Math.min(100, Math.round(
        (leadsConversionRate * 0.3) + // 30% basé sur le taux de conversion
        (taskCompletionRate * 0.3) + // 30% basé sur l'achèvement des tâches
        (Math.min(100, paymentsProcessed * 10) * 0.2) + // 20% basé sur les paiements (max 10 = 100%)
        (Math.min(100, 100 - Math.min(100, averageResponseTime / 2))) * 0.2 // 20% basé sur temps de réponse
      ));

      // Efficacité globale: formule arbitraire combinant plusieurs facteurs
      const efficiency = Math.min(100, Math.round(
        (leadsConversionRate * 0.4) + // 40% basé sur le taux de conversion
        (taskCompletionRate * 0.3) + // 30% basé sur l'achèvement des tâches
        (qualityScore * 0.3 / 100) // 30% basé sur le score de qualité
      ));

      // Préparer les données d'activité quotidienne
      const dailyActivity: Record<string, any> = {};
      
      // Initialiser les jours avec des valeurs par défaut
      for (let i = 0; i < 90; i++) { // 90 jours d'historique max
        const day = subDays(now, i);
        const dateStr = day.toISOString().split('T')[0]; // Format YYYY-MM-DD
        dailyActivity[dateStr] = {
          leads: 0,
          conversions: 0,
          payments: 0,
          tasks: 0
        };
      }
      
      // Remplir avec les données réelles
      userLeads.forEach(lead => {
        const dateStr = new Date(lead.createdAt).toISOString().split('T')[0];
        if (dailyActivity[dateStr]) {
          dailyActivity[dateStr].leads += 1;
          if (lead.status === "converted") {
            dailyActivity[dateStr].conversions += 1;
          }
        }
      });
      
      periodPayments.forEach(payment => {
        const dateStr = new Date(payment.createdAt).toISOString().split('T')[0];
        if (dailyActivity[dateStr]) {
          dailyActivity[dateStr].payments += 1;
        }
      });
      
      userTasks.forEach(task => {
        const dateStr = new Date(task.createdAt).toISOString().split('T')[0];
        if (dailyActivity[dateStr]) {
          dailyActivity[dateStr].tasks += 1;
        }
      });

      // Stocker les métriques calculées dans la base de données
      const [savedMetrics] = await db.insert(agentPerformanceMetrics)
        .values({
          userId,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          leadsReceived,
          leadsConverted,
          leadsConversionRate,
          paymentsProcessed,
          paymentsAmount,
          commissionsEarned,
          taskCompletionRate,
          averageResponseTime,
          appointmentsScheduled,
          clientsAcquired,
          qualityScore,
          efficiency,
          dailyActivity: JSON.stringify(dailyActivity),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();

      return this.formatPerformanceMetrics(savedMetrics);
    } catch (error) {
      console.error("Erreur lors du calcul des métriques de performance:", error);
      throw new Error("Impossible de calculer les métriques de performance");
    }
  }

  /**
   * Formatte les métriques de performance pour l'API
   */
  private formatPerformanceMetrics(metrics: any) {
    return {
      userId: metrics.userId,
      periodStart: metrics.periodStart,
      periodEnd: metrics.periodEnd,
      metrics: {
        leadsReceived: metrics.leadsReceived,
        leadsConverted: metrics.leadsConverted,
        leadsConversionRate: metrics.leadsConversionRate,
        paymentsProcessed: metrics.paymentsProcessed,
        paymentsAmount: metrics.paymentsAmount,
        commissionsEarned: metrics.commissionsEarned,
        taskCompletionRate: metrics.taskCompletionRate,
        averageResponseTime: metrics.averageResponseTime,
        appointmentsScheduled: metrics.appointmentsScheduled,
        clientsAcquired: metrics.clientsAcquired,
        qualityScore: metrics.qualityScore,
        efficiency: metrics.efficiency,
        dailyActivity: typeof metrics.dailyActivity === 'string' 
          ? JSON.parse(metrics.dailyActivity) 
          : metrics.dailyActivity
      },
      createdAt: metrics.createdAt,
      updatedAt: metrics.updatedAt
    };
  }
}

export const performanceService = new PerformanceService();