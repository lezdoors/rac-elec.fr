import { pgTable, serial, integer, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Table des statistiques utilisateurs pour la période en cours
 */
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  leadsReceived: integer("leads_received").notNull().default(0),
  leadsConverted: integer("leads_converted").notNull().default(0),
  paymentsProcessed: integer("payments_processed").notNull().default(0),
  paymentsAmount: text("payments_amount").notNull().default("0"),
  commissionsEarned: text("commissions_earned").notNull().default("0"),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

/**
 * Table de l'historique des statistiques utilisateurs
 */
export const userStatsHistory = pgTable("user_stats_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  leadsReceived: integer("leads_received").notNull().default(0),
  leadsConverted: integer("leads_converted").notNull().default(0),
  paymentsProcessed: integer("payments_processed").notNull().default(0),
  paymentsAmount: text("payments_amount").notNull().default("0"),
  commissionsEarned: text("commissions_earned").notNull().default("0"),
  dailyData: jsonb("daily_data").notNull().default({}),
  createdAt: text("created_at").notNull()
});

// Schémas Zod pour l'insertion et la mise à jour
export const insertUserStatSchema = createInsertSchema(userStats, {
  userId: z.number(),
  leadsReceived: z.number(),
  leadsConverted: z.number(),
  paymentsProcessed: z.number(),
  paymentsAmount: z.string(),
  commissionsEarned: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  isActive: z.boolean()
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateUserStatSchema = insertUserStatSchema.partial().omit({ userId: true });

export const insertUserStatHistorySchema = createInsertSchema(userStatsHistory, {
  userId: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  leadsReceived: z.number(),
  leadsConverted: z.number(),
  paymentsProcessed: z.number(),
  paymentsAmount: z.string(),
  commissionsEarned: z.string(),
  dailyData: z.record(z.string(), z.object({
    leads: z.number(),
    conversions: z.number(),
    payments: z.number(),
    amount: z.number(),
    commissions: z.number()
  }))
}).omit({ id: true, createdAt: true });

// Types
export type InsertUserStat = z.infer<typeof insertUserStatSchema>;
export type UpdateUserStat = z.infer<typeof updateUserStatSchema>;
export type InsertUserStatHistory = z.infer<typeof insertUserStatHistorySchema>;

export enum ResetPeriod {
  DAILY = "daily",
  HALF_MONTH = "half_month",
  MONTHLY = "monthly"
}