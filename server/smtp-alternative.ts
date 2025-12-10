/**
 * Module alternatif pour l'envoi d'emails depuis Replit
 * Cette solution utilise une connexion sur le port 587 avec TLS
 * pour contourner les limitations de Replit qui bloque le port 465 (SSL)
 */

import nodemailer from 'nodemailer';
import { SmtpConfig, NewSubmissionEmailData, PaymentConfirmationEmailData } from './email-service';
import { db } from './db';
import { systemConfigs } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Configuration SMTP pour Replit (utilisant le port 587 TLS)
const replitSmtpConfig: SmtpConfig = {
  host: 'mail.demande-raccordement.fr',
  port: 587,
  secure: false, // false pour TLS
  auth: {
    user: 'notification@demande-raccordement.fr',
    pass: 'Kamaka00'
  },
  defaultFrom: 'notification@demande-raccordement.fr',
  enabled: true
};

// Créer un transporteur spécial pour Replit
const createReplitTransporter = () => {
  return nodemailer.createTransport({
    host: replitSmtpConfig.host,
    port: replitSmtpConfig.port,
    secure: replitSmtpConfig.secure,
    auth: {
      user: replitSmtpConfig.auth.user,
      pass: replitSmtpConfig.auth.pass
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
  });
}

/**
 * Fonction pour envoyer un email en utilisant la configuration Replit
 */
export async function sendEmailWithReplit(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}): Promise<boolean> {
  try {
    const transporter = createReplitTransporter();

    // Récupérer les emails de notification depuis la base de données
    let notificationEmails: string[] = ['marina.alves@demande-raccordement.fr', 'contact@demande-raccordement.fr'];
    
    try {
      const notificationEmailRows = await db.select()
        .from(systemConfigs)
        .where(eq(systemConfigs.configKey, 'notification_email'));
      
      if (notificationEmailRows.length > 0 && notificationEmailRows[0].configValue) {
        notificationEmails = [notificationEmailRows[0].configValue];
        
        // Récupérer les emails additionnels
        const additionalEmails = await db.select()
          .from(systemConfigs)
          .where(eq(systemConfigs.configKey, 'notification_email_2'));
        
        if (additionalEmails.length > 0 && additionalEmails[0].configValue) {
          notificationEmails.push(additionalEmails[0].configValue);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des emails de notification:', err);
    }
    
    // Définir les destinataires si non spécifiés
    const to = Array.isArray(options.to) ? options.to : [options.to];
    const recipients = to.length > 0 ? to : notificationEmails;

    const mailOptions = {
      from: options.from || `"Raccordement.net" <${replitSmtpConfig.defaultFrom}>`,
      to: recipients.join(', '),
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
      attachments: options.attachments
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'email avec la méthode Replit:', error);
    return false;
  }
}

/**
 * Fonction pour envoyer une notification de nouvelle demande
 */
export async function sendNewSubmissionNotificationReplit(data: NewSubmissionEmailData): Promise<boolean> {
  try {
    // Construction du contenu HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.demande-raccordement.fr/logo-dark.png" alt="Raccordement.net" style="max-width: 200px;">
        </div>
        <h2 style="color: #0047AB; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Nouvelle demande de raccordement</h2>
        <p>Une nouvelle demande de raccordement Enedis a été soumise sur le site.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Référence :</strong> ${data.referenceNumber}</p>
          <p style="margin: 5px 0;"><strong>Client :</strong> ${data.clientName} (${data.clientType})</p>
          <p style="margin: 5px 0;"><strong>Email :</strong> ${data.clientEmail}</p>
          <p style="margin: 5px 0;"><strong>Téléphone :</strong> ${data.clientPhone}</p>
          <p style="margin: 5px 0;"><strong>Service demandé :</strong> ${data.serviceType}</p>
          ${data.address ? `<p style="margin: 5px 0;"><strong>Adresse :</strong> ${data.address}</p>` : ''}
          ${data.postalCode ? `<p style="margin: 5px 0;"><strong>Code postal :</strong> ${data.postalCode}</p>` : ''}
          ${data.city ? `<p style="margin: 5px 0;"><strong>Ville :</strong> ${data.city}</p>` : ''}
        </div>
        
        <p>Connectez-vous à votre espace administrateur pour consulter les détails complets de la demande.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://www.demande-raccordement.fr/admin/demandes" style="background-color: #0047AB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Voir la demande
          </a>
        </div>
        
        <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">
          Cet email a été envoyé automatiquement par le système de notification de Raccordement.net
        </p>
      </div>
    `;
    
    // Envoi de l'email
    return await sendEmailWithReplit({
      to: ['marina.alves@demande-raccordement.fr', 'contact@demande-raccordement.fr'],
      subject: `Nouvelle demande - Ref: ${data.referenceNumber}`,
      html: emailHtml,
      text: `Nouvelle demande de raccordement - Référence: ${data.referenceNumber}\n
Client: ${data.clientName} (${data.clientType})
Email: ${data.clientEmail}
Téléphone: ${data.clientPhone}
Service demandé: ${data.serviceType}\n
Connectez-vous à votre espace administrateur pour consulter les détails complets.`
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de nouvelle demande:', error);
    return false;
  }
}

/**
 * Fonction pour envoyer une confirmation de paiement
 */
export async function sendPaymentConfirmationReplit(data: PaymentConfirmationEmailData): Promise<boolean> {
  try {
    // Construction du contenu HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.demande-raccordement.fr/logo-dark.png" alt="Raccordement.net" style="max-width: 200px;">
        </div>
        <h2 style="color: #0047AB; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Confirmation de paiement</h2>
        <p>Cher(e) ${data.clientName},</p>
        <p>Nous vous remercions pour votre paiement pour votre demande de raccordement Enedis.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Référence de la demande :</strong> ${data.referenceNumber}</p>
          <p style="margin: 5px 0;"><strong>Montant payé :</strong> ${typeof data.paymentAmount === 'number' ? data.paymentAmount.toFixed(2) : data.paymentAmount} €</p>
          <p style="margin: 5px 0;"><strong>Date de paiement :</strong> ${data.paymentDate instanceof Date ? data.paymentDate.toLocaleDateString('fr-FR') : data.paymentDate}</p>
          <p style="margin: 5px 0;"><strong>ID de paiement :</strong> ${data.paymentId}</p>
          ${data.cardBrand && data.cardLast4 ? `<p style="margin: 5px 0;"><strong>Carte utilisée :</strong> ${data.cardBrand} **** **** **** ${data.cardLast4}</p>` : ''}
        </div>
        
        <p>Nous allons traiter votre demande dans les plus brefs délais.</p>
        <p>Pour toute question concernant votre demande, n'hésitez pas à nous contacter en répondant à cet email ou en appelant le service client.</p>
        
        <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">
          Raccordement.net - Le spécialiste du raccordement électrique
        </p>
      </div>
    `;
    
    // Envoi de l'email
    return await sendEmailWithReplit({
      to: data.clientEmail,
      subject: `Confirmation de paiement - ${data.referenceNumber}`,
      html: emailHtml,
      text: `Confirmation de paiement - ${data.referenceNumber}\n
Cher(e) ${data.clientName},

Nous vous remercions pour votre paiement pour votre demande de raccordement Enedis.

Référence de la demande : ${data.referenceNumber}
Montant payé : ${typeof data.paymentAmount === 'number' ? data.paymentAmount.toFixed(2) : data.paymentAmount} €
Date de paiement : ${data.paymentDate instanceof Date ? data.paymentDate.toLocaleDateString('fr-FR') : data.paymentDate}
ID de paiement : ${data.paymentId}

Nous allons traiter votre demande dans les plus brefs délais.

Pour toute question concernant votre demande, n'hésitez pas à nous contacter.

Raccordement.net - Le spécialiste du raccordement électrique`
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la confirmation de paiement:', error);
    return false;
  }
}