import { db } from "../db";
import { sql } from "drizzle-orm";
import { systemConfigs } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface GoogleSnippet {
  id: string;
  name: string;
  description: string;
  code: string;
  enabled: boolean;
  triggerPage: string;
  triggerEvent: string;
  triggerSelector?: string;
  lastUpdated: string;
  createdBy: string;
}

const SNIPPET_CONFIG_KEY_PREFIX = "google_snippet_";

// Service pour la gestion des snippets Google
export class GoogleSnippetsService {
  /**
   * Récupère tous les snippets Google enregistrés
   */
  async getAllSnippets(): Promise<GoogleSnippet[]> {
    try {
      const configEntries = await db
        .select()
        .from(systemConfigs)
        .where(sql`${systemConfigs.configKey} LIKE ${SNIPPET_CONFIG_KEY_PREFIX + '%'}`);
      
      return configEntries.map((entry) => {
        try {
          return JSON.parse(entry.configValue as string) as GoogleSnippet;
        } catch (e) {
          console.error(`Erreur lors du parsing du snippet ${entry.configKey}:`, e);
          return null;
        }
      }).filter((snippet): snippet is GoogleSnippet => snippet !== null);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des snippets Google:", error);
      return [];
    }
  }
  
  /**
   * Récupère un snippet Google spécifique par son ID
   */
  async getSnippetById(id: string): Promise<GoogleSnippet | null> {
    try {
      const configKey = SNIPPET_CONFIG_KEY_PREFIX + id;
      const [configEntry] = await db
        .select()
        .from(systemConfigs)
        .where(eq(systemConfigs.configKey, configKey));
      
      if (!configEntry) {
        return null;
      }
      
      return JSON.parse(configEntry.configValue as string) as GoogleSnippet;
      
    } catch (error) {
      console.error(`Erreur lors de la récupération du snippet Google ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Sauvegarde un snippet Google
   */
  async saveSnippet(snippet: GoogleSnippet): Promise<boolean> {
    try {
      const configKey = SNIPPET_CONFIG_KEY_PREFIX + snippet.id;
      const configValue = JSON.stringify(snippet);
      
      // Vérifier si le snippet existe déjà
      const [existingConfig] = await db
        .select()
        .from(systemConfigs)
        .where(eq(systemConfigs.configKey, configKey));
      
      if (existingConfig) {
        // Mettre à jour le snippet existant
        await db
          .update(systemConfigs)
          .set({ configValue, updatedAt: new Date() })
          .where(eq(systemConfigs.configKey, configKey));
      } else {
        // Créer un nouveau snippet
        await db
          .insert(systemConfigs)
          .values({
            configKey,
            configValue,
            configGroup: "google_analytics",
            isSecret: false,
            description: `Google Snippet: ${snippet.name}`,
          });
      }
      
      return true;
      
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du snippet Google ${snippet.id}:`, error);
      return false;
    }
  }
  
  /**
   * Récupère tous les snippets actifs pour une page spécifique
   */
  async getActiveSnippetsForPage(page: string): Promise<GoogleSnippet[]> {
    try {
      const allSnippets = await this.getAllSnippets();
      return allSnippets.filter(snippet => 
        snippet.enabled && 
        snippet.triggerPage === page
      );
      
    } catch (error) {
      console.error(`Erreur lors de la récupération des snippets actifs pour la page ${page}:`, error);
      return [];
    }
  }
  
  /**
   * Supprime un snippet Google
   */
  async deleteSnippet(id: string): Promise<boolean> {
    try {
      const configKey = SNIPPET_CONFIG_KEY_PREFIX + id;
      
      await db
        .delete(systemConfigs)
        .where(eq(systemConfigs.configKey, configKey));
      
      return true;
      
    } catch (error) {
      console.error(`Erreur lors de la suppression du snippet Google ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Active ou désactive un snippet Google
   */
  async toggleSnippetStatus(id: string, enabled: boolean): Promise<boolean> {
    try {
      const snippet = await this.getSnippetById(id);
      
      if (!snippet) {
        return false;
      }
      
      snippet.enabled = enabled;
      snippet.lastUpdated = new Date().toISOString();
      
      return await this.saveSnippet(snippet);
      
    } catch (error) {
      console.error(`Erreur lors du changement de statut du snippet Google ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Initialise les snippets par défaut s'ils n'existent pas
   */
  async initDefaultSnippets(createdBy: string = "System"): Promise<void> {
    const defaultSnippets: GoogleSnippet[] = [
      {
        id: "form-init-snippet",
        name: "Initialisation Formulaire",
        description: "Snippet déclenché lorsque l'utilisateur commence le formulaire (étape 1/3)",
        code: "<!-- Google snippet pour l'étape 1 - Ajoutez votre code ici -->",
        enabled: false,
        triggerPage: "/raccordement-enedis",
        triggerEvent: "click",
        triggerSelector: ".next-step-btn, .btn-start-form",
        lastUpdated: new Date().toISOString(),
        createdBy
      },
      {
        id: "form-submit-snippet",
        name: "Soumission Formulaire",
        description: "Snippet déclenché lorsque l'utilisateur soumet le formulaire complet",
        code: "<!-- Google snippet pour l'étape 2 - Ajoutez votre code ici -->",
        enabled: false,
        triggerPage: "/raccordement-enedis",
        triggerEvent: "click",
        triggerSelector: ".submit-form-btn, .btn-submit",
        lastUpdated: new Date().toISOString(),
        createdBy
      },
      {
        id: "payment-success-snippet",
        name: "Paiement Réussi",
        description: "Snippet déclenché lorsque le paiement est confirmé avec succès",
        code: "<!-- Google snippet pour l'étape 3 - Ajoutez votre code ici -->",
        enabled: false,
        triggerPage: "/paiement-confirmation",
        triggerEvent: "load",
        lastUpdated: new Date().toISOString(),
        createdBy
      }
    ];
    
    for (const snippet of defaultSnippets) {
      const existingSnippet = await this.getSnippetById(snippet.id);
      
      if (!existingSnippet) {
        await this.saveSnippet(snippet);
        console.log(`Snippet par défaut créé: ${snippet.name}`);
      }
    }
  }
}

// Exporter une instance unique du service
export const googleSnippetsService = new GoogleSnippetsService();