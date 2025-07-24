/**
 * Script pour corriger la configuration SMTP en base de données
 * 
 * Ce script permet de s'assurer que les paramètres SMTP sont correctement
 * stockés dans la base de données pour être utilisés par l'application.
 */

import { db } from './db.js';
import { systemConfigs, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function fixSmtpConfig() {
  console.log('┌────────────────────────────────────────────┐');
  console.log('│          CORRECTION CONFIG SMTP            │');
  console.log('└────────────────────────────────────────────┘');
  
  try {
    // Configuration SMTP à partir des variables d'environnement
    const smtpConfig = {
      host: process.env.SMTP_HOST || 's3474.fra1.stableserver.net',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'false' ? false : true,
      auth: {
        user: process.env.SMTP_USER || 'notification@raccordement.net',
        pass: process.env.SMTP_PASSWORD || ''
      },
      defaultFrom: process.env.SMTP_FROM || 'notification@raccordement.net',
      enabled: true
    };
    
    console.log('\nConfiguration à utiliser:');
    console.log(`Hôte: ${smtpConfig.host}`);
    console.log(`Port: ${smtpConfig.port}`);
    console.log(`Sécurisé: ${smtpConfig.secure}`);
    console.log(`Utilisateur: ${smtpConfig.auth.user}`);
    console.log(`Mot de passe défini: ${smtpConfig.auth.pass ? 'Oui' : 'Non'}`);
    console.log(`Longueur mot de passe: ${smtpConfig.auth.pass ? smtpConfig.auth.pass.length : 0} caractères`);
    console.log(`Expéditeur par défaut: ${smtpConfig.defaultFrom}`);
    
    // Sérialiser la configuration
    const serializedConfig = JSON.stringify(smtpConfig);
    
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
      
      console.log('\n✅ Configuration SMTP mise à jour avec succès');
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
      
      console.log('\n✅ Configuration SMTP créée avec succès');
    }
    
    // Mettre également à jour la configuration IMAP de l'utilisateur admin
    const adminId = 1;
    const adminUser = await db.select()
      .from(users)
      .where(eq(users.id, adminId));
    
    if (adminUser.length > 0) {
      await db.update(users)
        .set({
          smtpHost: smtpConfig.host,
          smtpPort: smtpConfig.port,
          smtpSecure: smtpConfig.secure,
          smtpUser: smtpConfig.auth.user,
          smtpPassword: smtpConfig.auth.pass,
          smtpFromEmail: smtpConfig.defaultFrom,
          smtpEnabled: true,
          imapHost: smtpConfig.host,
          imapPort: 993,
          imapUser: smtpConfig.auth.user,
          imapPassword: smtpConfig.auth.pass,
          imapEnabled: true
        })
        .where(eq(users.id, adminId));
      
      console.log(`\n✅ Configuration email de l'utilisateur admin (ID=${adminId}) mise à jour avec succès`);
    } else {
      console.log(`\n❌ Utilisateur admin (ID=${adminId}) non trouvé`);
    }
  } catch (error) {
    console.error('\n❌ Erreur lors de la mise à jour de la configuration:', error);
  }
}

// Auto-exécution du script
fixSmtpConfig().catch(console.error);