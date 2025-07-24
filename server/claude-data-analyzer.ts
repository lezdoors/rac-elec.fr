import { db } from './db';
import { serviceRequests } from '@shared/schema';
import * as claudeApi from './claude-api';
import { eq } from 'drizzle-orm';

/**
 * Script utilitaire pour analyser les données des demandes avec Claude
 * Cet outil est conçu pour être utilisé par l'administrateur système
 * pour générer des insights sur les données stockées
 */

/**
 * Analyse toutes les demandes récentes et stocke les insights dans la base de données
 * Cette fonction peut être exécutée périodiquement via un cron
 */
export async function analyzeRecentRequests() {
  try {
    console.log("Démarrage de l'analyse des demandes récentes avec Claude...");
    
    // Récupérer les 10 dernières demandes qui n'ont pas été analysées
    const recentRequests = await db.query.serviceRequests.findMany({
      where: (serviceRequests, { isNull, and, eq }) => 
        and(
          isNull(serviceRequests.aiAnalysis),
          eq(serviceRequests.status, 'pending')
        ),
      limit: 10,
      orderBy: (serviceRequests, { desc }) => [desc(serviceRequests.createdAt)]
    });
    
    console.log(`${recentRequests.length} demandes à analyser`);
    
    // Analyser chaque demande avec Claude
    for (const request of recentRequests) {
      console.log(`Analyse de la demande ${request.referenceNumber}...`);
      
      try {
        // Utiliser Claude pour analyser la demande
        const analysis = await claudeApi.analyzeServiceRequest(request);
        
        // Estimer le prix
        const priceEstimate = await claudeApi.estimatePrice(request);
        
        // Mettre à jour la demande avec l'analyse
        await db.update(serviceRequests)
          .set({ 
            aiAnalysis: analysis,
            priceEstimate,
            updatedAt: new Date()
          })
          .where(eq(serviceRequests.id, request.id));
        
        console.log(`Demande ${request.referenceNumber} analysée avec succès`);
      } catch (error) {
        console.error(`Erreur lors de l'analyse de la demande ${request.referenceNumber}:`, error);
      }
    }
    
    console.log("Analyse des demandes terminée");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'analyse des demandes:", error);
    throw error;
  }
}

/**
 * Génère une réponse personnalisée pour une demande spécifique
 */
export async function generateResponseForRequest(referenceNumber: string) {
  try {
    console.log(`Génération d'une réponse pour la demande ${referenceNumber}...`);
    
    // Récupérer la demande
    const [request] = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.referenceNumber, referenceNumber));
    
    if (!request) {
      throw new Error(`Demande ${referenceNumber} introuvable`);
    }
    
    // Utiliser Claude pour générer une réponse
    const response = await claudeApi.generateCustomerResponse(request);
    
    // Stocker la réponse générée dans la base de données
    await db.update(serviceRequests)
      .set({ 
        customerResponse: response,
        updatedAt: new Date()
      })
      .where(eq(serviceRequests.id, request.id));
    
    console.log(`Réponse générée avec succès pour la demande ${referenceNumber}`);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la génération de la réponse pour la demande ${referenceNumber}:`, error);
    throw error;
  }
}

/**
 * Catégorise automatiquement les demandes selon leur contenu
 * Peut être utilisé pour trier et prioriser les demandes
 */
export async function categorizeRequests() {
  try {
    console.log("Démarrage de la catégorisation des demandes...");
    
    // Récupérer les demandes sans catégorie
    const uncategorizedRequests = await db.query.serviceRequests.findMany({
      where: (serviceRequests, { isNull }) => 
        isNull(serviceRequests.category),
      limit: 20
    });
    
    console.log(`${uncategorizedRequests.length} demandes à catégoriser`);
    
    // Nombre de demandes catégorisées
    let categorizedCount = 0;
    
    // Catégoriser chaque demande en utilisant Claude pour analyser le contenu
    for (const request of uncategorizedRequests) {
      try {
        // La catégorie devrait être déterminée par l'analyse du contenu de la demande
        // Ceci est une logique simplifiée et devrait être adaptée selon vos besoins
        let category = 'standard';
        
        // Déterminer la priorité et la complexité basées sur les détails de la demande
        if (request.clientType === 'professionnel' && Number(request.powerRequired) > 50) {
          category = 'high_priority';
        } else if (request.requestType === 'temporary_connection') {
          category = 'urgent';
        } else if (request.comments && request.comments.length > 200) {
          category = 'complex';
        }
        
        // Mettre à jour la demande avec la catégorie
        await db.update(serviceRequests)
          .set({ 
            category,
            updatedAt: new Date()
          })
          .where(eq(serviceRequests.id, request.id));
        
        categorizedCount++;
      } catch (error) {
        console.error(`Erreur lors de la catégorisation de la demande ${request.referenceNumber}:`, error);
      }
    }
    
    console.log(`${categorizedCount} demandes catégorisées avec succès`);
    return categorizedCount;
  } catch (error) {
    console.error("Erreur lors de la catégorisation des demandes:", error);
    throw error;
  }
}