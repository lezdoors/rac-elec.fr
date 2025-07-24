/**
 * Module de correction SMTP pour contourner les limitations de Replit
 * Cette solution utilise une méthode alternative pour envoyer des emails
 * depuis l'environnement Replit qui bloque les connexions SMTP classiques
 */

import nodemailer from 'nodemailer';
import { NewSubmissionEmailData, PaymentConfirmationEmailData, AppointmentReminderEmailData, ContactEmailData } from './email-service';

// Transporter alternatif qui fonctionne avec Replit
const alternativeTransporter = nodemailer.createTransport({
  host: 'mail.raccordement.net',
  port: 587, // Utiliser le port 587 (STARTTLS) au lieu de 465 (SSL)
  secure: false, // false pour TLS - vrai serait SSL
  auth: {
    user: 'notification@raccordement.net',
    pass: 'Kamaka00'
  },
  tls: {
    rejectUnauthorized: false, // Accepter les certificats auto-signés
    ciphers: 'SSLv3' // Utiliser SSLv3 pour plus de compatibilité
  },
  connectionTimeout: 60000, // 60 secondes de timeout
  greetingTimeout: 60000,
  debug: true,
  logger: true
});

// Fonction pour envoyer notification de nouvelle demande
export async function sendNewSubmissionDirectly(data: NewSubmissionEmailData): Promise<boolean> {
  try {
    const notificationEmails = ['marina.alves@raccordement.net', 'contact@raccordement.net'];
    
    // Construction du contenu HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://raccordement.net/logo-dark.png" alt="Raccordement.net" style="max-width: 200px;">
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
          <a href="https://raccordement.net/admin/demandes" style="background-color: #0047AB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Voir la demande
          </a>
        </div>
        
        <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">
          Cet email a été envoyé automatiquement par le système de notification de Raccordement.net
        </p>
      </div>
    `;
    
    // Envoi de l'email
    await alternativeTransporter.sendMail({
      from: '"Raccordement.net" <notification@raccordement.net>',
      to: notificationEmails.join(', '),
      subject: `Nouvelle demande - Ref: ${data.referenceNumber}`,
      html: emailHtml,
      text: `Nouvelle demande de raccordement - Référence: ${data.referenceNumber}\n
Client: ${data.clientName} (${data.clientType})
Email: ${data.clientEmail}
Téléphone: ${data.clientPhone}
Service demandé: ${data.serviceType}\n
Connectez-vous à votre espace administrateur pour consulter les détails complets.`
    });
    
    console.log(`✅ Notification envoyée directement pour la demande ${data.referenceNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi direct de la notification de nouvelle demande:', error);
    return false;
  }
}

// Fonction pour envoyer confirmation de paiement
export async function sendPaymentConfirmationDirectly(data: PaymentConfirmationEmailData): Promise<boolean> {
  try {
    // Construction du contenu HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://raccordement.net/logo-dark.png" alt="Raccordement.net" style="max-width: 200px;">
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
    await alternativeTransporter.sendMail({
      from: '"Raccordement.net" <notification@raccordement.net>',
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
    
    console.log(`✅ Confirmation de paiement envoyée directement pour ${data.referenceNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi direct de la confirmation de paiement:', error);
    return false;
  }
}

// Fonction utilitaire pour tester la connexion
export async function testSmtpConnection(): Promise<boolean> {
  try {
    console.log('Test de connexion SMTP alternative...');
    
    await alternativeTransporter.verify();
    console.log('✅ Connexion SMTP alternative fonctionnelle');
    
    return true;
  } catch (error) {
    console.error('❌ Échec de la connexion SMTP alternative:', error);
    return false;
  }
}