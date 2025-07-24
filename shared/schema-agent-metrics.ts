import { pgTable, serial, integer, text, timestamp, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Table des métriques de performance des agents
 */
export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  periodStart: timestamp("period_start", { mode: "string" }).notNull(),
  periodEnd: timestamp("period_end", { mode: "string" }).notNull(),
  leadsReceived: integer("leads_received").default(0),
  leadsConverted: integer("leads_converted").default(0),
  leadsConversionRate: doublePrecision("leads_conversion_rate").default(0),
  paymentsProcessed: integer("payments_processed").default(0),
  paymentsAmount: integer("payments_amount").default(0),
  commissionsEarned: integer("commissions_earned").default(0),
  taskCompletionRate: doublePrecision("task_completion_rate").default(0),
  averageResponseTime: doublePrecision("average_response_time").default(0),
  appointmentsScheduled: integer("appointments_scheduled").default(0),
  clientsAcquired: integer("clients_acquired").default(0),
  qualityScore: integer("quality_score").default(0),
  efficiency: integer("efficiency").default(0),
  dailyActivity: text("daily_activity"), // Stocké en JSON
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
});

// Schéma Zod pour la validation
export const insertAgentPerformanceMetricsSchema = createInsertSchema(agentPerformanceMetrics, {
  dailyActivity: z.string().optional()
}).omit({ id: true });

// Types dérivés
export type InsertAgentPerformanceMetrics = z.infer<typeof insertAgentPerformanceMetricsSchema>;
export type AgentPerformanceMetrics = typeof agentPerformanceMetrics.$inferSelect;