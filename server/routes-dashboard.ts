import { Application } from 'express';
import { db } from './db';
import { leads, payments, serviceRequests } from '../shared/schema';
import { sql, desc, and, gte, lte } from 'drizzle-orm';
import { requireAuth } from './auth';
import { fetchStripePayments, syncStripePayments } from './stripe-integration';

export function setupDashboardRoutes(app: Application) {
  // RAC payments API - Uses local database with RAC- references
  app.get('/api/stripe/payments', requireAuth, async (req, res) => {
    try {
      let { startDate, endDate } = req.query;
      
      // Si pas de dates, utiliser aujourd'hui par défaut
      if (!startDate || !endDate) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        startDate = todayStr;
        endDate = todayStr;
      }

      const startDateTime = new Date(startDate as string);
      const endDateTime = new Date(endDate as string);
      
      // Get RAC- payments from local database
      const racPayments = await db.select()
        .from(payments)
        .where(
          and(
            sql`reference_number LIKE 'RAC-%'`,
            gte(payments.createdAt, startDateTime),
            lte(payments.createdAt, endDateTime)
          )
        )
        .orderBy(desc(payments.createdAt));
      
      // Transform to match expected format with safe data handling
      const formattedPayments = racPayments.map(payment => {
        let metadata = {};
        try {
          if (payment.metadata && typeof payment.metadata === 'string') {
            metadata = JSON.parse(payment.metadata);
          } else if (payment.metadata && typeof payment.metadata === 'object') {
            metadata = payment.metadata;
          }
        } catch (e) {
          metadata = {};
        }
        
        return {
          id: payment.paymentId || payment.id.toString(),
          referenceNumber: payment.referenceNumber,
          amount: parseFloat(payment.amount),
          status: payment.status,
          createdAt: payment.createdAt.toISOString(),
          customerEmail: payment.customerEmail,
          customerName: payment.customerName,
          paymentMethod: payment.method,
          cardBrand: payment.cardBrand,
          cardLast4: payment.cardLast4,
          cardExpMonth: payment.cardExpMonth,
          cardExpYear: payment.cardExpYear,
          metadata: metadata
        };
      });
      
      res.json(formattedPayments);
    } catch (error: any) {
      console.error('Error fetching RAC payments:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des paiements RAC: " + error.message
      });
    }
  });

  // Dashboard stats API with authentic RAC- data
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      let { startDate, endDate } = req.query;
      
      // Si pas de dates, utiliser aujourd'hui par défaut
      if (!startDate || !endDate) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        startDate = todayStr;
        endDate = todayStr;
      }

      const startDateTime = new Date(startDate as string);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(endDate as string);
      endDateTime.setHours(23, 59, 59, 999);
      
      // Debug logging
      console.log('Dashboard API - Date range:', { startDateTime, endDateTime });
      
      // Get RAC- payments from local database
      const racPayments = await db.select()
        .from(payments)
        .where(
          and(
            sql`reference_number LIKE 'RAC-%'`,
            gte(payments.createdAt, startDateTime),
            lte(payments.createdAt, endDateTime)
          )
        )
        .orderBy(desc(payments.createdAt));

      console.log('Dashboard API - RAC payments found:', racPayments.length);
      if (racPayments.length > 0) {
        console.log('First payment:', { 
          ref: racPayments[0].referenceNumber, 
          amount: racPayments[0].amount, 
          status: racPayments[0].status, 
          created: racPayments[0].createdAt 
        });
      }

      // Compter TOUS les paiements sans déduplication incorrecte
      // Un paiement est "réussi" s'il a un des statuts suivants
      const successStatuses = ['succeeded', 'paid'];
      const successfulPaymentsList = racPayments.filter(p => successStatuses.includes(p.status));
      
      const totalPayments = racPayments.length;
      const totalRevenue = successfulPaymentsList.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const successfulPayments = successfulPaymentsList.length;
      const successRate = totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0;
      
      console.log('Dashboard API - Stats calculated:', { totalPayments, totalRevenue, successfulPayments, successRate });

      // Get leads for the same period
      const leadsData = await db.select()
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, startDateTime),
            lte(leads.createdAt, endDateTime)
          )
        );

      // Get service requests for the same period
      const requestsData = await db.select()
        .from(serviceRequests)
        .where(
          and(
            gte(serviceRequests.createdAt, startDateTime),
            lte(serviceRequests.createdAt, endDateTime)
          )
        );

      res.json({
        payments: {
          count: totalPayments,
          revenue: totalRevenue,
          successRate: Math.round(successRate),
          successful: successfulPayments
        },
        leads: {
          count: leadsData.length
        },
        requests: {
          count: requestsData.length
        },
        period: {
          startDate: startDate,
          endDate: endDate
        }
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: `Erreur lors de la récupération des statistiques: ${error.message}`
      });
    }
  });

  // Dashboard statistics for payments
  app.get('/api/dashboard/payments', requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      const startDateTime = new Date(startDate as string);
      const endDateTime = new Date(endDate as string);
      
      // Get current period payments
      const currentPayments = await db.select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`COALESCE(sum(CAST(amount AS DECIMAL)), 0)`,
      })
      .from(payments)
      .where(and(
        gte(payments.createdAt, startDateTime),
        lte(payments.createdAt, endDateTime),
        sql`status IN ('paid', 'succeeded')`,
        sql`reference_number LIKE 'RAC-%'`
      ));

      // Get previous period for comparison
      const periodDiff = endDateTime.getTime() - startDateTime.getTime();
      const prevStartDate = new Date(startDateTime.getTime() - periodDiff);
      const prevEndDate = new Date(startDateTime.getTime());

      const previousPayments = await db.select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`COALESCE(sum(CAST(amount AS DECIMAL)), 0)`,
      })
      .from(payments)
      .where(and(
        gte(payments.createdAt, prevStartDate),
        lte(payments.createdAt, prevEndDate),
        sql`status IN ('paid', 'succeeded')`,
        sql`reference_number LIKE 'RAC-%'`
      ));

      const current = currentPayments[0] || { count: 0, revenue: 0 };
      const previous = previousPayments[0] || { count: 0, revenue: 0 };

      // Calculate trends
      const countTrend = previous.count === 0 ? 'stable' : 
        current.count > previous.count ? 'up' : 
        current.count < previous.count ? 'down' : 'stable';
      
      const countTrendPercentage = previous.count === 0 ? 0 :
        Math.round(((current.count - previous.count) / previous.count) * 100);

      // Get success rate
      const totalAttempts = await db.select({
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .where(and(
        gte(payments.createdAt, startDateTime),
        lte(payments.createdAt, endDateTime)
      ));

      const successRate = totalAttempts[0]?.count > 0 ? 
        Math.round((current.count / totalAttempts[0].count) * 100) : 0;

      // Get recent payments
      const recentPayments = await db.select()
        .from(payments)
        .where(and(
          gte(payments.createdAt, startDateTime),
          lte(payments.createdAt, endDateTime),
          sql`reference_number LIKE 'RAC-%'`
        ))
        .orderBy(desc(payments.createdAt))
        .limit(5);

      res.json({
        count: current.count,
        revenue: current.revenue,
        successRate,
        trend: countTrend,
        trendPercentage: Math.abs(countTrendPercentage),
        recent: recentPayments
      });

    } catch (error) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques de paiement"
      });
    }
  });

  // Dashboard statistics for leads
  app.get('/api/dashboard/leads', requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      const startDateTime = new Date(startDate as string);
      const endDateTime = new Date(endDate as string);
      
      // Get current period leads
      const currentLeads = await db.select({
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, startDateTime),
        lte(leads.createdAt, endDateTime)
      ));

      // Get previous period for comparison
      const periodDiff = endDateTime.getTime() - startDateTime.getTime();
      const prevStartDate = new Date(startDateTime.getTime() - periodDiff);
      const prevEndDate = new Date(startDateTime.getTime());

      const previousLeads = await db.select({
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, prevStartDate),
        lte(leads.createdAt, prevEndDate)
      ));

      const current = currentLeads[0] || { count: 0 };
      const previous = previousLeads[0] || { count: 0 };

      // Calculate trends
      const trend = previous.count === 0 ? 'stable' : 
        current.count > previous.count ? 'up' : 
        current.count < previous.count ? 'down' : 'stable';
      
      const trendPercentage = previous.count === 0 ? 0 :
        Math.round(((current.count - previous.count) / previous.count) * 100);

      // Get recent leads
      const recentLeads = await db.select()
        .from(leads)
        .where(and(
          gte(leads.createdAt, startDateTime),
          lte(leads.createdAt, endDateTime)
        ))
        .orderBy(desc(leads.createdAt))
        .limit(5);

      res.json({
        count: current.count,
        trend,
        trendPercentage: Math.abs(trendPercentage),
        recent: recentLeads
      });

    } catch (error) {
      console.error('Error fetching leads stats:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques de leads"
      });
    }
  });

  // Dashboard statistics for service requests
  app.get('/api/dashboard/requests', requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Dates de début et de fin requises"
        });
      }

      const startDateTime = new Date(startDate as string);
      const endDateTime = new Date(endDate as string);
      
      // Get current period requests
      const currentRequests = await db.select({
        count: sql<number>`count(*)::int`,
      })
      .from(serviceRequests)
      .where(and(
        gte(serviceRequests.createdAt, startDateTime),
        lte(serviceRequests.createdAt, endDateTime)
      ));

      // Get previous period for comparison
      const periodDiff = endDateTime.getTime() - startDateTime.getTime();
      const prevStartDate = new Date(startDateTime.getTime() - periodDiff);
      const prevEndDate = new Date(startDateTime.getTime());

      const previousRequests = await db.select({
        count: sql<number>`count(*)::int`,
      })
      .from(serviceRequests)
      .where(and(
        gte(serviceRequests.createdAt, prevStartDate),
        lte(serviceRequests.createdAt, prevEndDate)
      ));

      const current = currentRequests[0] || { count: 0 };
      const previous = previousRequests[0] || { count: 0 };

      // Calculate trends
      const trend = previous.count === 0 ? 'stable' : 
        current.count > previous.count ? 'up' : 
        current.count < previous.count ? 'down' : 'stable';
      
      const trendPercentage = previous.count === 0 ? 0 :
        Math.round(((current.count - previous.count) / previous.count) * 100);

      // Get recent requests
      const recentRequests = await db.select()
        .from(serviceRequests)
        .where(and(
          gte(serviceRequests.createdAt, startDateTime),
          lte(serviceRequests.createdAt, endDateTime)
        ))
        .orderBy(desc(serviceRequests.createdAt))
        .limit(5);

      res.json({
        count: current.count,
        trend,
        trendPercentage: Math.abs(trendPercentage),
        recent: recentRequests
      });

    } catch (error) {
      console.error('Error fetching requests stats:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques de demandes"
      });
    }
  });

  // API de synchronisation automatique avec Stripe (références RAC- uniquement)
  app.post('/api/stripe/sync', requireAuth, async (req, res) => {
    try {
      // Par défaut, synchroniser les 7 derniers jours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      console.log(`🔄 Synchronisation Stripe RAC- du ${startDate.toISOString()} au ${endDate.toISOString()}`);
      
      const result = await syncStripePayments(startDate, endDate);
      
      res.json({
        success: true,
        message: `Synchronisation terminée: ${result.inserted} nouveaux, ${result.updated} mis à jour`,
        ...result
      });
    } catch (error: any) {
      console.error('Error syncing Stripe payments:', error);
      res.status(500).json({
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`
      });
    }
  });

  // API de synchronisation pour aujourd'hui uniquement (appelée automatiquement par le frontend)
  app.get('/api/stripe/sync-today', requireAuth, async (req, res) => {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      console.log(`🔄 Synchronisation Stripe RAC- aujourd'hui: ${startDate.toISOString()} → ${endDate.toISOString()}`);
      
      const result = await syncStripePayments(startDate, endDate);
      
      res.json({
        success: true,
        synced: true,
        ...result
      });
    } catch (error: any) {
      console.error('Error syncing today Stripe payments:', error);
      res.status(500).json({
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`
      });
    }
  });
}