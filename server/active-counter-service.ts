/**
 * Service pour gérer le compteur dynamique du nombre d'utilisateurs en cours de raccordement
 */
import { db } from "./db";
import { serviceRequests, leads } from "@shared/schema";
import { and, not, eq, gte } from "drizzle-orm";

/**
 * Calcule le nombre d'utilisateurs actuellement en cours de raccordement
 * 
 * Utilise une combinaison de données réelles (demandes en cours, leads récents)
 * et une légère variation aléatoire pour simuler une activité en temps réel
 */
export async function getActiveConnectionCount(): Promise<number> {
  try {
    // Récupérer les demandes actives des dernières 24 heures
    const recentRequests = await db.query.serviceRequests.findMany({
      where: and(
        not(eq(serviceRequests.status, "cancelled")),
        not(eq(serviceRequests.status, "completed")),
        gte(serviceRequests.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      )
    });
    
    // Récupérer le nombre de leads récents (dernières 48 heures)
    const recentLeads = await db.query.leads.findMany({
      where: gte(leads.createdAt, new Date(Date.now() - 48 * 60 * 60 * 1000))
    });
    
    // Calculer un nombre qui semble dynamique et crédible
    const baseCount = 128; // Nombre de base minimum
    const recentFactor = Math.min(20, recentRequests.length * 1.5); // Les demandes récentes ont plus de poids
    const leadsFactor = Math.min(15, recentLeads.length * 0.5); // Les leads récents ont moins de poids
    
    // Ajouter une variation aléatoire de ±8 pour simuler les connexions/déconnexions
    const randomVariation = Math.floor(Math.random() * 16) - 8;
    
    // Calculer le total
    let total = Math.floor(baseCount + recentFactor + leadsFactor + randomVariation);
    
    // S'assurer que le nombre reste dans une plage réaliste (110-160)
    total = Math.max(110, Math.min(160, total));
    
    return total;
  } catch (error) {
    console.error("Erreur lors du calcul des utilisateurs actifs:", error);
    return 128; // Valeur par défaut en cas d'erreur
  }
}