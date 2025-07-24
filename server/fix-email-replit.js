/**
 * Script pour corriger la configuration email dans l'environnement Replit
 * Ce script modifie la configuration SMTP dans la base de données 
 * pour utiliser le port 587 (TLS) au lieu du port 465 (SSL)
 */

import { db } from './db';
import { systemConfigs, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Configuration SMTP correcte pour Replit
const replitCompatibleConfig = {
  host: 'mail.raccordement.net',
  port: 587,              // Port 587 au lieu de 465
  secure: false,          // false pour TLS (587), true pour SSL (465)
  auth: {
    user: 'notification@raccordement.net',
    pass: 'Kamaka00'
  },
  defaultFrom: 'notification@raccordement.net',
  enabled: true
};

async function fixSmtpForReplit() {
  console.log('┌────────────────────────────────────────────┐');
  console.log('│        CORRECTION SMTP POUR REPLIT         │');
  console.log('└────────────────────────────────────────────┘');
  
  try {
    // 1. Mise à jour de la configuration SMTP système
    console.log("\nMise à jour de la configuration système...");
    const serializedConfig = JSON.stringify(replitCompatibleConfig);
    
    const existingConfigs = await db.select()
      .from(systemConfigs)
      .where(eq(systemConfigs.configKey, 'smtp_config'));
    
    if (existingConfigs.length > 0) {
      await db.update(systemConfigs)
        .set({ 
          configValue: serializedConfig,
          updatedAt: new Date()
        })
        .where(eq(systemConfigs.configKey, 'smtp_config'));
      
      console.log('✓ Configuration SMTP système mise à jour pour utiliser le port 587 (TLS)');
    } else {
      await db.insert(systemConfigs)
        .values({
          configKey: 'smtp_config',
          configValue: serializedConfig,
          configGroup: 'smtp',
          isSecret: false,
          description: 'Configuration SMTP compatible Replit'
        });
      
      console.log('✓ Nouvelle configuration SMTP système créée avec port 587 (TLS)');
    }
    
    // 2. Mise à jour de la configuration pour tous les utilisateurs
    console.log("\nMise à jour des configurations utilisateurs...");
    const allUsers = await db.select().from(users);
    
    let updatedUsers = 0;
    for (const user of allUsers) {
      await db.update(users)
        .set({
          smtpHost: replitCompatibleConfig.host,
          smtpPort: replitCompatibleConfig.port,
          smtpSecure: replitCompatibleConfig.secure,
          smtpUser: replitCompatibleConfig.auth.user,
          smtpPassword: replitCompatibleConfig.auth.pass,
          smtpFromEmail: replitCompatibleConfig.defaultFrom,
          smtpEnabled: true
        })
        .where(eq(users.id, user.id));
      
      updatedUsers++;
    }
    
    console.log(`✓ ${updatedUsers} utilisateurs mis à jour avec la configuration SMTP compatible Replit`);
    
    console.log('\n✓ La configuration SMTP a été optimisée pour fonctionner dans l\'environnement Replit');
    console.log('✓ Redémarrez l\'application pour appliquer les changements');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la mise à jour de la configuration SMTP:', error);
  }
}

// Auto-exécution du script
fixSmtpForReplit().then(() => {
  console.log('\nTerminé!');
  process.exit(0);
}).catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});