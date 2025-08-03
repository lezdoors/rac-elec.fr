/**
 * Service d'envoi d'emails via Mailjet 
 * Solution de contournement pour les problèmes SMTP dans l'environnement Replit
 */

import type { NewSubmissionEmailData, PaymentConfirmationEmailData, ContactEmailData } from './email-service';

// Types spécifiques à Mailjet
interface MailjetRecipient {
  Email: string;
  Name?: string;
}

interface MailjetMessage {
  From: {
    Email: string;
    Name: string;
  };
  To: MailjetRecipient[];
  Subject: string;
  TextPart?: string;
  HTMLPart?: string;
  CustomID?: string;
}

/**
 * Envoie un email via l'API Mailjet
 */
export async function sendEmailViaMailjet(options: {
  to: string | string[] | { email: string; name?: string }[];
  subject: string;
  html?: string;
  text?: string;
  from?: { email: string; name: string };
  customId?: string;
}): Promise<boolean> {
  try {
    // Import dynamique pour éviter les problèmes d'initialisation
    const Mailjet = await import('node-mailjet');
    
    // Initialiser le client Mailjet
    const mailjet = Mailjet.default.apiConnect(
      process.env.MAILJET_API_KEY || '',
      process.env.MAILJET_API_SECRET || ''
    );

    // Formater les destinataires
    let recipients: MailjetRecipient[] = [];
    
    if (typeof options.to === 'string') {
      recipients = [{ Email: options.to }];
    } else if (Array.isArray(options.to)) {
      if (typeof options.to[0] === 'string') {
        recipients = (options.to as string[]).map(email => ({ Email: email }));
      } else {
        recipients = (options.to as { email: string; name?: string }[]).map(recipient => ({
          Email: recipient.email,
          Name: recipient.name
        }));
      }
    }
    
    // Préparer le message
    const message: MailjetMessage = {
      From: options.from || {
        Email: 'notification@portail-electricite.com',
        Name: 'Raccordement.net'
      },
      To: recipients,
      Subject: options.subject,
      TextPart: options.text,
      HTMLPart: options.html,
      CustomID: options.customId
    };
    
    // Envoyer l'email via Mailjet
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [message]
      });
    
    console.log('✅ Email envoyé avec succès via Mailjet');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi d\'email via Mailjet:', error);
    return false;
  }
}

/**
 * Envoie une notification de nouvelle demande via Mailjet
 */
export async function sendNewSubmissionNotificationViaMailjet(data: NewSubmissionEmailData): Promise<boolean> {
  try {
    // Préparer les destinataires
    const recipients = ['marina.alves@portail-electricite.com', 'contact@portail-electricite.com'];
    
    // Créer le sujet
    const subject = `Nouvelle demande de raccordement: ${data.referenceNumber}`;
    
    // Créer le contenu HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0047AB;">Nouvelle demande de raccordement</h2>
        <p>Une nouvelle demande de raccordement a été soumise avec les informations suivantes :</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Référence :</strong> ${data.referenceNumber}</p>
          <p><strong>Client :</strong> ${data.clientName}</p>
          <p><strong>Email :</strong> ${data.clientEmail}</p>
          <p><strong>Téléphone :</strong> ${data.clientPhone}</p>
          <p><strong>Type de client :</strong> ${data.clientType}</p>
          <p><strong>Date de soumission :</strong> ${new Date(data.submissionDate).toLocaleString('fr-FR')}</p>
          <p><strong>Type de service :</strong> ${data.serviceType}</p>
          ${data.address ? `<p><strong>Adresse :</strong> ${data.address}</p>` : ''}
          ${data.postalCode ? `<p><strong>Code postal :</strong> ${data.postalCode}</p>` : ''}
          ${data.city ? `<p><strong>Ville :</strong> ${data.city}</p>` : ''}
        </div>
        
        <p>Connectez-vous à l'interface d'administration pour voir les détails complets.</p>
      </div>
    `;
    
    // Créer le contenu texte
    const text = `
      Nouvelle demande de raccordement
      
      Une nouvelle demande de raccordement a été soumise avec les informations suivantes :
      
      Référence : ${data.referenceNumber}
      Client : ${data.clientName}
      Email : ${data.clientEmail}
      Téléphone : ${data.clientPhone}
      Type de client : ${data.clientType}
      Date de soumission : ${new Date(data.submissionDate).toLocaleString('fr-FR')}
      Type de service : ${data.serviceType}
      ${data.address ? `Adresse : ${data.address}` : ''}
      ${data.postalCode ? `Code postal : ${data.postalCode}` : ''}
      ${data.city ? `Ville : ${data.city}` : ''}
      
      Connectez-vous à l'interface d'administration pour voir les détails complets.
    `;
    
    // Envoyer l'email via Mailjet
    return await sendEmailViaMailjet({
      to: recipients,
      subject,
      html,
      text,
      from: {
        email: 'notification@portail-electricite.com',
        name: 'Raccordement.net'
      },
      customId: `new-submission-${data.referenceNumber}`
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification de nouvelle demande via Mailjet:', error);
    return false;
  }
}

/**
 * Envoie une confirmation de paiement via Mailjet
 */
export async function sendPaymentConfirmationViaMailjet(data: PaymentConfirmationEmailData): Promise<boolean> {
  try {
    // Créer le sujet
    const subject = `Confirmation de paiement - ${data.referenceNumber}`;
    
    // Créer le contenu HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0047AB;">Confirmation de paiement</h2>
        <p>Bonjour ${data.clientName},</p>
        <p>Nous vous confirmons que votre paiement a bien été reçu et traité.</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Référence de votre demande :</strong> ${data.referenceNumber}</p>
          <p><strong>Date du paiement :</strong> ${new Date(data.paymentDate).toLocaleString('fr-FR')}</p>
          <p><strong>Montant :</strong> ${typeof data.paymentAmount === 'number' ? data.paymentAmount.toFixed(2) : data.paymentAmount} €</p>
          <p><strong>Identifiant du paiement :</strong> ${data.paymentId}</p>
          ${data.cardBrand && data.cardLast4 ? `<p><strong>Carte :</strong> ${data.cardBrand} se terminant par ${data.cardLast4}</p>` : ''}
        </div>
        
        <p>Notre équipe a été informée et va traiter votre demande dans les plus brefs délais.</p>
        <p>Un membre de notre équipe vous contactera prochainement pour organiser la suite des démarches.</p>
        
        <p>Cordialement,</p>
        <p>L'équipe Raccordement.net</p>
      </div>
    `;
    
    // Créer le contenu texte
    const text = `
      Confirmation de paiement
      
      Bonjour ${data.clientName},
      
      Nous vous confirmons que votre paiement a bien été reçu et traité.
      
      Référence de votre demande : ${data.referenceNumber}
      Date du paiement : ${new Date(data.paymentDate).toLocaleString('fr-FR')}
      Montant : ${typeof data.paymentAmount === 'number' ? data.paymentAmount.toFixed(2) : data.paymentAmount} €
      Identifiant du paiement : ${data.paymentId}
      ${data.cardBrand && data.cardLast4 ? `Carte : ${data.cardBrand} se terminant par ${data.cardLast4}` : ''}
      
      Notre équipe a été informée et va traiter votre demande dans les plus brefs délais.
      Un membre de notre équipe vous contactera prochainement pour organiser la suite des démarches.
      
      Cordialement,
      L'équipe Raccordement.net
    `;
    
    // Envoyer l'email via Mailjet
    return await sendEmailViaMailjet({
      to: data.clientEmail,
      subject,
      html,
      text,
      from: {
        email: 'notification@portail-electricite.com',
        name: 'Raccordement.net'
      },
      customId: `payment-confirmation-${data.referenceNumber}`
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la confirmation de paiement via Mailjet:', error);
    return false;
  }
}

/**
 * Envoie un email de contact via Mailjet
 */
export async function sendContactEmailViaMailjet(data: ContactEmailData): Promise<boolean> {
  try {
    // Déterminer la priorité
    const priorityLabels = {
      high: '⚠️ HAUTE',
      medium: '⚡ MOYENNE',
      normal: 'NORMALE'
    };
    
    // Déterminer la priorité en fonction du contenu du message
    let priority = 'normal';
    if (data.message.toLowerCase().includes('urgent') || 
        data.message.toLowerCase().includes('urgence') ||
        data.message.toLowerCase().includes('immédiat')) {
      priority = 'high';
    } else if (data.message.toLowerCase().includes('rapide') ||
               data.message.toLowerCase().includes('rapidement') ||
               data.message.toLowerCase().includes('besoin')) {
      priority = 'medium';
    }
    
    const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels];
    
    // Créer le sujet
    const subject = `${priorityLabel} - Nouveau message de contact: ${data.name}`;
    
    // Créer le contenu HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0047AB;">Nouveau message de contact (Priorité: ${priorityLabel})</h2>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Nom :</strong> ${data.name}</p>
          <p><strong>Email :</strong> ${data.email}</p>
          ${data.subject ? `<p><strong>Sujet :</strong> ${data.subject}</p>` : ''}
          <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            <p><strong>Message :</strong></p>
            <p style="white-space: pre-line;">${data.message}</p>
          </div>
        </div>
        
        <p>Vous pouvez répondre directement à cet email pour contacter le client.</p>
      </div>
    `;
    
    // Créer le contenu texte
    const text = `
      Nouveau message de contact (Priorité: ${priorityLabel})
      
      Nom : ${data.name}
      Email : ${data.email}
      ${data.subject ? `Sujet : ${data.subject}` : ''}
      
      Message :
      ${data.message}
      
      Vous pouvez répondre directement à cet email pour contacter le client.
    `;
    
    // Envoyer l'email aux administrateurs
    const result = await sendEmailViaMailjet({
      to: ['marina.alves@portail-electricite.com', 'contact@portail-electricite.com'],
      subject,
      html,
      text,
      from: {
        email: 'notification@portail-electricite.com',
        name: 'Raccordement.net'
      },
      customId: `contact-notification-${Date.now()}`
    });
    
    // Envoyer une confirmation au client
    const confirmationResult = await sendEmailViaMailjet({
      to: data.email,
      subject: 'Votre message a bien été reçu - Raccordement.net',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #0047AB;">Confirmation de réception</h2>
          <p>Bonjour ${data.name},</p>
          <p>Nous vous confirmons avoir bien reçu votre message.</p>
          <p>Notre équipe l'examinera dans les plus brefs délais et reviendra vers vous rapidement.</p>
          <p>Cordialement,</p>
          <p>L'équipe Raccordement.net</p>
        </div>
      `,
      text: `
        Confirmation de réception
        
        Bonjour ${data.name},
        
        Nous vous confirmons avoir bien reçu votre message.
        Notre équipe l'examinera dans les plus brefs délais et reviendra vers vous rapidement.
        
        Cordialement,
        L'équipe Raccordement.net
      `,
      from: {
        email: 'notification@portail-electricite.com',
        name: 'Raccordement.net'
      },
      customId: `contact-confirmation-${Date.now()}`
    });
    
    return result && confirmationResult;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de contact via Mailjet:', error);
    return false;
  }
}