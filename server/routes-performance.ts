import { Router } from "express";
import { requireAuth, requireAdmin } from "./auth";
import { USER_ROLES } from "@shared/constants";
import { db } from "./db";
import { add, format, startOfDay, subDays } from "date-fns";
import { and, between, eq, gte, lte, sql, inArray } from "drizzle-orm";
import { performanceMetrics, leads, serviceRequests, payments, users, agentTasks } from "@shared/schema";

export const performanceRouter = Router();

/**
 * Route pour obtenir les métriques de performance d'un utilisateur
 */
performanceRouter.get(
  "/user/performance/metrics", 
  requireAuth,
  requireAdmin,
  async (req, res) => {
  try {
    const userId = req.user!.id;
    console.log(`[Performance] Récupération des métriques pour l'utilisateur ${userId}`);
    
    // Récupérer les métriques de performance existantes
    const [userMetrics] = await db.select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.userId, userId));
    
    if (userMetrics) {
      console.log(`[Performance] Métriques trouvées pour l'utilisateur ${userId}`);
      
      // Récupérer des données additionnelles pour compléter les métriques
      // 1. Tâches en attente/complétées
      const [taskCounts] = await db.select({
        total: sql`count(*)`.mapWith(Number),
        completed: sql`sum(case when ${agentTasks.status} = 'completed' then 1 else 0 end)`.mapWith(Number)
      })
      .from(agentTasks)
      .where(eq(agentTasks.userId, userId));
      
      // 2. Paiements traités (pour le calcul des commissions)
      // Note: Nous utilisons createdBy au lieu de processedBy car cette colonne n'existe pas
      const [paymentData] = await db.select({
        count: sql`count(*)`.mapWith(Number),
        totalAmount: sql`sum(${payments.amount})`.mapWith(Number)
      })
      .from(payments)
      .where(eq(payments.createdBy, userId));
      
      // 3. Nombre de leads générés
      const [leadsCount] = await db.select({
        count: sql`count(*)`.mapWith(Number)
      })
      .from(leads)
      .where(eq(leads.assignedTo, userId));
      
      // Calculer la commission (14€ par paiement de 129.80€)
      const totalCommission = ((paymentData?.totalAmount || 0) / 12980) * 1400;
      
      // Retourner les métriques enrichies
      return res.json({
        metrics: {
          ...userMetrics,
          totalTasks: taskCounts?.total || 0,
          completedTasks: taskCounts?.completed || 0,
          paymentsProcessed: paymentData?.count || 0,
          leadsGenerated: leadsCount?.count || 0,
          totalCommission
        }
      });
    }
    
    // Si aucune métrique n'existe, générer des métriques par défaut
    console.log(`[Performance] Aucune métrique trouvée, génération de métriques par défaut pour l'utilisateur ${userId}`);
    
    // Valeurs par défaut pour éviter les erreurs
    const defaultMetrics = {
      leadConversionRate: 0,
      targetCompletion: 0,
      totalTasks: 0,
      completedTasks: 0,
      leadsGenerated: 0,
      paymentsProcessed: 0,
      totalCommission: 0,
      averageResponseTime: 0,
      clientSatisfaction: 0
    };
    
    res.json({ metrics: defaultMetrics });
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques de performance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des métriques de performance" 
    });
  }
});

/**
 * Route pour obtenir les données de graphique leads/demandes
 */
performanceRouter.get(
  "/user/performance/leads-chart", 
  requireAuth,
  requireAdmin,
  async (req, res) => {
  try {
    const userId = req.user!.id;
    const period = req.query.period as string || '15days';
    
    console.log(`[Performance] Récupération des données graphiques pour l'utilisateur ${userId}, période: ${period}`);
    
    // Déterminer la plage de dates en fonction de la période
    const days = period === '15days' ? 15 : period === '30days' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = add(new Date(), { days: 1 }); // Inclure aujourd'hui
    
    console.log(`[Performance] Plage de dates: ${format(startDate, 'yyyy-MM-dd')} à ${format(endDate, 'yyyy-MM-dd')}`);
    
    // Requête pour les leads
    const leadsData = await db.select({
      date: sql`date_trunc('day', ${leads.createdAt})`.as('date'),
      count: sql`count(*)`.mapWith(Number)
    })
    .from(leads)
    .where(
      and(
        eq(leads.assignedTo, userId),
        between(leads.createdAt, startDate, endDate)
      )
    )
    .groupBy(sql`date_trunc('day', ${leads.createdAt})`)
    .orderBy(sql`date_trunc('day', ${leads.createdAt})`);
    
    // Requête pour les demandes
    const demandsData = await db.select({
      date: sql`date_trunc('day', ${serviceRequests.createdAt})`.as('date'),
      count: sql`count(*)`.mapWith(Number)
    })
    .from(serviceRequests)
    .where(
      and(
        eq(serviceRequests.assignedTo, userId),
        between(serviceRequests.createdAt, startDate, endDate)
      )
    )
    .groupBy(sql`date_trunc('day', ${serviceRequests.createdAt})`)
    .orderBy(sql`date_trunc('day', ${serviceRequests.createdAt})`);
    
    // Générer la structure de données pour le graphique
    // Créer une map de dates pour faciliter la fusion
    const dateMap = new Map();
    
    // Initialiser avec toutes les dates de la période (avec valeurs à zéro)
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap.set(dateStr, { 
        date: dateStr,
        leads: 0,
        demands: 0
      });
    }
    
    // Ajouter les données de leads
    leadsData.forEach(item => {
      if (item.date) {
        const dateStr = format(new Date(item.date), 'yyyy-MM-dd');
        if (dateMap.has(dateStr)) {
          const entry = dateMap.get(dateStr);
          entry.leads = item.count;
          dateMap.set(dateStr, entry);
        }
      }
    });
    
    // Ajouter les données de demandes
    demandsData.forEach(item => {
      if (item.date) {
        const dateStr = format(new Date(item.date), 'yyyy-MM-dd');
        if (dateMap.has(dateStr)) {
          const entry = dateMap.get(dateStr);
          entry.demands = item.count;
          dateMap.set(dateStr, entry);
        }
      }
    });
    
    // Convertir la map en tableau pour le graphique
    const chartData = Array.from(dateMap.values());
    
    res.json({
      success: true,
      chartData,
      period
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données graphiques:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des données graphiques" 
    });
  }
});

/**
 * Route pour obtenir les métriques de performance par équipe (pour managers)
 */
performanceRouter.get(
  "/team/performance/metrics", 
  requireAuth, 
  requireAdmin, 
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      console.log(`[Performance] Récupération des métriques d'équipe pour ${userRole} ${userId}`);
      
      // Si l'utilisateur est un manager, récupérer uniquement les métriques de son équipe
      let teamQuery = db.select({
        userId: users.id,
        username: users.username,
        fullName: users.fullName
      })
      .from(users);
      
      if (userRole === USER_ROLES.MANAGER) {
        teamQuery = teamQuery.where(eq(users.managerId, userId));
      }
      
      const teamMembers = await teamQuery;
      const teamIds = teamMembers.map(member => member.userId);
      
      if (teamIds.length === 0) {
        return res.json({
          success: true,
          teamMetrics: [],
          aggregateMetrics: {
            avgLeadConversion: 0,
            avgClientSatisfaction: 0,
            totalTasks: 0,
            completedTasks: 0,
            totalLeads: 0,
            totalCommission: 0
          }
        });
      }
      
      // Récupérer les métriques pour tous les membres de l'équipe
      const teamMetrics = await db.select()
        .from(performanceMetrics)
        .where(
          teamIds.length === 1 
            ? eq(performanceMetrics.userId, teamIds[0])
            : inArray(performanceMetrics.userId, teamIds)
        );
      
      // Enrichir les métriques avec les noms des utilisateurs
      const enrichedMetrics = teamMetrics.map(metric => {
        const user = teamMembers.find(member => member.userId === metric.userId);
        return {
          ...metric,
          username: user?.username || '',
          fullName: user?.fullName || ''
        };
      });
      
      // Récupérer les données additionnelles pour l'équipe
      // 1. Tâches en attente/complétées pour l'équipe
      const [teamTaskCounts] = await db.select({
        total: sql`count(*)`.mapWith(Number),
        completed: sql`sum(case when ${agentTasks.status} = 'completed' then 1 else 0 end)`.mapWith(Number)
      })
      .from(agentTasks)
      .where(
        teamIds.length === 1 
          ? eq(agentTasks.userId, teamIds[0])
          : inArray(agentTasks.userId, teamIds)
      );
      
      // 2. Leads générés par l'équipe
      const [teamLeadsCount] = await db.select({
        count: sql`count(*)`.mapWith(Number)
      })
      .from(leads)
      .where(
        teamIds.length === 1 
          ? eq(leads.assignedTo, teamIds[0])
          : inArray(leads.assignedTo, teamIds)
      );
      
      // 3. Commissions totales pour l'équipe
      const [teamPaymentData] = await db.select({
        totalAmount: sql`sum(${payments.amount})`.mapWith(Number)
      })
      .from(payments)
      .where(
        teamIds.length === 1 
          ? eq(payments.createdBy, teamIds[0])
          : inArray(payments.createdBy, teamIds)
      );
      
      // Calculer la commission d'équipe (14€ par paiement de 129.80€)
      const teamCommission = ((teamPaymentData?.totalAmount || 0) / 12980) * 1400;
      
      // Calculer les métriques agrégées de l'équipe
      const aggregateMetrics = {
        avgLeadConversion: enrichedMetrics.reduce((sum, metric) => sum + (metric.leadConversionRate || 0), 0) / (enrichedMetrics.length || 1),
        avgClientSatisfaction: enrichedMetrics.reduce((sum, metric) => sum + (metric.clientSatisfaction || 0), 0) / (enrichedMetrics.length || 1),
        totalTasks: teamTaskCounts?.total || 0,
        completedTasks: teamTaskCounts?.completed || 0,
        totalLeads: teamLeadsCount?.count || 0,
        totalCommission: teamCommission
      };
      
      res.json({
        success: true,
        teamMetrics: enrichedMetrics,
        aggregateMetrics
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des métriques d'équipe:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération des métriques d'équipe" 
      });
    }
  }
);

// Export pour l'utilisation dans routes.ts
export function registerPerformanceRoutes(app: any) {
  app.use("/api", performanceRouter);
}