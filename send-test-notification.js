/**
 * Script pour tester l'envoi de notifications d'une nouvelle demande
 */
import { db } from './server/db.js';
import { eq } from 'drizzle-orm';
import { users, systemConfigs } from './migrations/schema.js';
import nodemailer from 'nodemailer';

async function main() {
  try {
    console.log("Test d'envoi de notification de nouvelle demande");
    
    // 1. Récupérer la configuration SMTP actuelle
    const [smtpConfigRow] = await db.select()
      .from(systemConfigs)
      .where(eq(systemConfigs.configKey, 'smtp_config'));
    
    if (!smtpConfigRow) {
      console.error("Configuration SMTP non trouvée");
      return;
    }
    
    const smtpConfig = JSON.parse(smtpConfigRow.configValue);
    console.log("Configuration SMTP:");
    console.log(`- Host: ${smtpConfig.host}`);
    console.log(`- Port: ${smtpConfig.port}`);
    console.log(`- Secure: ${smtpConfig.secure}`);
    console.log(`- User: ${smtpConfig.auth.user}`);
    
    // 2. Récupérer les adresses email des destinataires
    const [notificationEmailRow] = await db.select()
      .from(systemConfigs)
      .where(eq(systemConfigs.configKey, 'notification_email'));
    
    const recipients = notificationEmailRow.configValue.split(',');
    console.log(`Destinataires: ${recipients.join(', ')}`);
    
    // 3. Créer le transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // 4. Préparer et envoyer l'email
    const referenceNumber = `REF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const emailContent = {
      from: `"Service Raccordement" <${smtpConfig.auth.user}>`,
      to: recipients.join(', '),
      subject: `🆕 Nouvelle demande de raccordement - ${referenceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #33b060;">Nouvelle demande de raccordement</h2>
          <p>Une nouvelle demande de raccordement a été soumise sur le site.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Référence:</strong> ${referenceNumber}</p>
            <p><strong>Nom du client:</strong> Client Test</p>
            <p><strong>Email:</strong> client-test@exemple.fr</p>
            <p><strong>Téléphone:</strong> 06 12 34 56 78</p>
            <p><strong>Type de raccordement:</strong> Raccordement neuf</p>
            <p><strong>Adresse:</strong> 123 Rue de Test, 75000 Paris</p>
          </div>
          
          <p>Connectez-vous à l'espace administrateur pour traiter cette demande.</p>
          <div style="margin: 20px 0;">
            <a href="https://raccordement.net/admin" style="background-color: #33b060; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accéder à l'espace admin
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Email automatique envoyé par le système de notification de raccordement.net
          </p>
        </div>
      `
    };
    
    // Envoyer l'email
    const info = await transporter.sendMail(emailContent);
    
    console.log(`✅ Email de test envoyé avec succès à ${recipients.join(', ')}`);
    console.log(`ID du message: ${info.messageId}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de test:", error);
  }
}

main().catch(console.error);