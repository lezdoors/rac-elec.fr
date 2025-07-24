/**
 * Script pour corriger directement la configuration SMTP
 * Conçu pour résoudre les problèmes de connexion SMTP depuis Replit
 */

import { db } from './db';
import { systemConfigs, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Configuration SMTP correcte (fixe)
const correctConfig = {
  host: 'mail.raccordement.net',
  port: 465,
  secure: true,
  auth: {
    user: 'notification@raccordement.net',
    pass: 'Kamaka00'
  },
  defaultFrom: 'notification@raccordement.net',
  enabled: true,
  // Options avancées
  connectionTimeout: 30000,  // 30 secondes
  greetingTimeout: 30000,    // 30 secondes
  socketTimeout: 60000       // 60 secondes
};

async function fixSmtpConfiguration() {
  console.log('┌────────────────────────────────────────────┐');
  console.log('│       CORRECTION DIRECTE CONFIG SMTP       │');
  console.log('└────────────────────────────────────────────┘');
  
  try {
    // 1. Mise à jour de la configuration système
    const serializedConfig = JSON.stringify(correctConfig);
    
    // Vérifier si une configuration existe déjà
    const existingConfigs = await db.select()
      .from(systemConfigs)
      .where(eq(systemConfigs.configKey, 'smtp_config'));
    
    if (existingConfigs.length > 0) {
      // Mise à jour de la configuration existante
      await db.update(systemConfigs)
        .set({ 
          configValue: serializedConfig,
          updatedAt: new Date()
        })
        .where(eq(systemConfigs.configKey, 'smtp_config'));
      
      console.log('✅ Configuration système SMTP mise à jour');
    } else {
      // Création d'une nouvelle entrée de configuration
      await db.insert(systemConfigs)
        .values({
          configKey: 'smtp_config',
          configValue: serializedConfig,
          configGroup: 'smtp',
          isSecret: false,
          description: 'Configuration du serveur SMTP'
        });
      
      console.log('✅ Configuration système SMTP créée');
    }
    
    // 2. Mise à jour de la configuration pour tous les utilisateurs
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      await db.update(users)
        .set({
          smtpHost: correctConfig.host,
          smtpPort: correctConfig.port,
          smtpSecure: correctConfig.secure,
          smtpUser: correctConfig.auth.user,
          smtpPassword: correctConfig.auth.pass,
          smtpFromEmail: correctConfig.defaultFrom,
          smtpEnabled: true,
          imapHost: correctConfig.host,
          imapPort: 993,
          imapUser: correctConfig.auth.user,
          imapPassword: correctConfig.auth.pass,
          imapEnabled: true
        })
        .where(eq(users.id, user.id));
      
      console.log(`✅ Configuration email de l'utilisateur ${user.id} (${user.email}) mise à jour`);
    }
    
    // 3. Mise à jour des emails de notification
    const notificationEmails = [
      { key: 'notification_email', value: 'marina.alves@raccordement.net' },
      { key: 'notification_email_2', value: 'contact@raccordement.net' }
    ];
    
    for (const email of notificationEmails) {
      const existingEmail = await db.select()
        .from(systemConfigs)
        .where(eq(systemConfigs.configKey, email.key));
      
      if (existingEmail.length > 0) {
        await db.update(systemConfigs)
          .set({ 
            configValue: email.value,
            updatedAt: new Date()
          })
          .where(eq(systemConfigs.configKey, email.key));
        
        console.log(`✅ Email de notification ${email.key} mis à jour`);
      } else {
        await db.insert(systemConfigs)
          .values({
            configKey: email.key,
            configValue: email.value,
            configGroup: 'notification',
            isSecret: false,
            description: 'Email de notification pour les nouvelles demandes'
          });
        
        console.log(`✅ Email de notification ${email.key} créé`);
      }
    }
    
    console.log('\n✅ Configuration SMTP entièrement corrigée');
    console.log('⚠️ Redémarrez l\'application pour appliquer les changements');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la correction de la configuration SMTP:', error);
  }
}

// Auto-exécution
fixSmtpConfiguration().catch(console.error);