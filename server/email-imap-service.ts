import { simpleParser } from 'mailparser';
import imaps from 'imap-simple';
import * as IMAP from 'node-imap';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Définition d'une interface basique pour ParsedMail pour éviter les erreurs TypeScript
interface ParsedMail {
  date?: Date;
  subject?: string | { text?: string; value?: string; toString?: () => string };
  from?: { 
    value?: Array<{ name?: string; address: string }>;
    address?: string;
    name?: string;
    text?: string;
  };
  to?: { value?: Array<{ name?: string; address: string }> };
  cc?: { value?: Array<{ name?: string; address: string }> };
  text?: string;
  html?: string | boolean;
  attachments?: Array<{
    filename?: string;
    contentType?: string;
    size?: number;
    contentId?: string;
    content?: Buffer;
  }>;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
}

// Constantes pour les noms de dossiers standards - utilisées dans tout le système
export const INBOX_FOLDER = 'INBOX';
export const SENT_FOLDER = 'INBOX.Sent';
export const SPAM_FOLDER = 'Spam';
export const TRASH_FOLDER = 'Trash';

// Interfaces pour la gestion de boîte de réception
export interface ImapConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: { rejectUnauthorized: boolean };
  authTimeout?: number; // Timeout pour l'authentification
  useSimulatedBoxes?: boolean; // Pour le mode démo sans connexion réelle
}

export interface MailboxOptions {
  mailbox?: string; // Par défaut "INBOX"
  searchCriteria?: any[];
  fetchOptions?: { bodies?: string[]; struct?: boolean; markSeen?: boolean };
  limit?: number;
  since?: Date;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content?: Buffer;
  contentId?: string;
}

export interface EmailMessage {
  id: string;
  uid: number;
  date: Date;
  from: { name?: string; address: string }[];
  to: { name?: string; address: string }[];
  cc?: { name?: string; address: string }[];
  subject: string;
  text?: string;
  html?: string;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  isRead: boolean;
  labels?: string[];
  flags?: string[];
  isSpam?: boolean;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

import * as emailService from './email-service';

// Créer une configuration IMAP à partir des paramètres utilisateur
export async function createImapConfigFromUser(userId: number): Promise<ImapConfig | null> {
  try {
    // Pour l'utilisateur admin (ID=1), on utilise toujours prioritairement contact@demande-raccordement.fr
    if (userId === 1) {
      // Configuration spécifique pour admin avec contact@demande-raccordement.fr
      const adminPassword = process.env.IMAP_PASSWORD || '';
      console.log(`Utilisation de la configuration IMAP contact@demande-raccordement.fr pour l'administrateur`);
      
      return {
        user: 'contact@demande-raccordement.fr',
        password: adminPassword,
        host: 's4015.fra1.stableserver.net',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        useSimulatedBoxes: false // Désactiver explicitement le mode simulation pour l'admin
      };
    }
    
    // Recherche les paramètres de l'utilisateur pour utiliser une connexion IMAP réelle
    // La simulation est utilisée uniquement si aucune configuration valide n'est trouvée
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    // Vérifier si l'utilisateur a une configuration personnelle valide
    if (user && user.smtpHost && user.smtpUser && user.smtpPassword && user.smtpEnabled) {
      let imapHost, imapPort;
      
      // Déterminer l'hôte IMAP en fonction du domaine de l'utilisateur
      // et des serveurs spécifiques connus
      const emailDomain = user.smtpUser.split('@')[1] || '';
      
      // Configuration spécifique pour demande-raccordement.fr
      if (user.smtpHost === 's4015.fra1.stableserver.net' || 
          emailDomain === 'demande-raccordement.fr') {
        imapHost = 's4015.fra1.stableserver.net';
        imapPort = 993;
      }
      // Configuration par défaut pour les autres domaines
      else {
        imapHost = user.smtpHost.replace(/^smtp\./, 'imap.'); // Conserver le domaine de l'utilisateur
        imapPort = 993; // Port IMAP avec SSL/TLS
      }
      
      console.log(`Tentative de connexion IMAP à ${imapHost}:${imapPort} avec l'utilisateur ${user.smtpUser}`);
      
      return {
        user: user.smtpUser,
        password: user.smtpPassword,
        host: imapHost,
        port: imapPort,
        tls: true,
        tlsOptions: { rejectUnauthorized: false } // Pour éviter les problèmes de certificat
      };
    }
    
    // Essayer d'utiliser les paramètres SMTP globaux pour les autres utilisateurs
    const globalConfig = await emailService.getSmtpConfig();
    if (globalConfig && globalConfig.host && globalConfig.auth && globalConfig.auth.user && globalConfig.auth.pass && globalConfig.enabled) {
      // Utiliser le même serveur pour IMAP que pour SMTP
      // Remplacer smtp. par imap. si nécessaire
      const imapHost = globalConfig.host.replace(/^smtp\./, 'imap.'); // Utiliser le même domaine
      console.log(`Utilisation de la configuration IMAP globale pour l'utilisateur ${userId}: ${imapHost}`);
      
      return {
        user: globalConfig.auth.user,
        password: globalConfig.auth.pass,
        host: imapHost,
        port: 993, // Port IMAP par défaut avec SSL/TLS
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      };
    }
    
    // Utilisez le mot de passe IMAP de l'environnement si disponible
    if (process.env.IMAP_PASSWORD) {
      console.log(`Utilisation des identifiants IMAP globaux pour l'utilisateur ${userId} avec compte contact@demande-raccordement.fr`);
      return {
        user: "contact@demande-raccordement.fr",
        password: process.env.IMAP_PASSWORD, // Utiliser le mot de passe fourni
        host: "s4015.fra1.stableserver.net",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000, // Augmenter le timeout d'authentification
        useSimulatedBoxes: false // Utiliser les emails réels
      };
    }
    
    // Fallback vers le mode réel avec mot de passe spécifié
    console.log(`Pas de configuration d'environnement pour l'utilisateur ${userId}, utilisation du mot de passe spécifié manuellement`);
    return {
      user: "contact@demande-raccordement.fr",
      password: "Kamaka00.", // Mot de passe fourni  
      host: "s4015.fra1.stableserver.net",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000, // Augmenter le timeout d'authentification
      useSimulatedBoxes: false // Utiliser les emails réels
    };
  } catch (error) {
    console.error(`Erreur lors de la création de la configuration IMAP pour l'utilisateur ${userId}:`, error);
    return null;
  }
}

// Connexion à un compte IMAP
async function connectToImap(config: ImapConfig): Promise<imaps.ImapSimple> {
  try {
    console.log(`Tentative de connexion IMAP à ${config.host}:${config.port} avec l'utilisateur ${config.user}`);
    const connection = await imaps.connect({
      imap: {
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        tls: config.tls,
        tlsOptions: config.tlsOptions || { rejectUnauthorized: false },
        authTimeout: 10000
      }
    });
    
    console.log(`Connexion IMAP établie avec succès pour ${config.user}`);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion IMAP:', error);
    throw error;
  }
}

// Générer des emails de démonstration pour le mode simulé
function generateDemoEmails(mailbox: string): EmailMessage[] {
  // Définir les types d'emails par dossier
  switch (mailbox.toUpperCase()) {
    case INBOX_FOLDER:
      return [
        {
          id: '1',
          uid: 1,
          date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          from: [{ name: 'Support Technique', address: 'support@enedis.fr' }],
          to: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
          subject: 'Confirmation de votre demande de raccordement',
          text: 'Bonjour,\n\nNous avons bien reçu votre demande de raccordement. Un technicien prendra contact avec vous dans les plus brefs délais.\n\nCordialement,\nLe service technique',
          html: '<p>Bonjour,</p><p>Nous avons bien reçu votre demande de raccordement. Un technicien prendra contact avec vous dans les plus brefs délais.</p><p>Cordialement,<br>Le service technique</p>',
          hasAttachments: false,
          isRead: false,
          flags: [],
          isSpam: false,
          threadId: 'thread-1'
        },
        {
          id: '2',
          uid: 2,
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          from: [{ name: 'Jean Dupont', address: 'jean.dupont@gmail.com' }],
          to: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
          subject: 'Question sur ma demande REF-1234-567890',
          text: 'Bonjour,\n\nJ\'aurais besoin d\'informations supplémentaires concernant ma demande de raccordement référence REF-1234-567890.\n\nPouvez-vous me préciser le délai d\'intervention ?\n\nMerci d\'avance,\nJean Dupont',
          html: '<p>Bonjour,</p><p>J\'aurais besoin d\'informations supplémentaires concernant ma demande de raccordement référence REF-1234-567890.</p><p>Pouvez-vous me préciser le délai d\'intervention ?</p><p>Merci d\'avance,<br>Jean Dupont</p>',
          hasAttachments: false,
          isRead: true,
          flags: ['\\Seen'],
          isSpam: false,
          threadId: 'thread-2'
        },
        {
          id: '3',
          uid: 3,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          from: [{ name: 'Notification Paiement', address: 'paiement@stripe.com' }],
          to: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
          subject: 'Confirmation de paiement pour REF-5678-123456',
          text: 'Bonjour,\n\nNous vous confirmons le paiement de 129,80€ pour la demande REF-5678-123456.\n\nLe paiement a été traité avec succès.\n\nCordialement,\nService des paiements',
          html: '<p>Bonjour,</p><p>Nous vous confirmons le paiement de <strong>129,80€</strong> pour la demande REF-5678-123456.</p><p>Le paiement a été traité avec succès.</p><p>Cordialement,<br>Service des paiements</p>',
          hasAttachments: true,
          attachments: [{
            filename: 'facture.pdf',
            contentType: 'application/pdf',
            size: 42500,
            contentId: 'invoice-123'
          }],
          isRead: false,
          flags: [],
          isSpam: false,
          threadId: 'thread-3'
        }
      ];
    case SENT_FOLDER:
      return [
        {
          id: '101',
          uid: 101,
          date: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          from: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
          to: [{ name: 'Jean Dupont', address: 'jean.dupont@gmail.com' }],
          subject: 'Re: Question sur ma demande REF-1234-567890',
          text: 'Bonjour Jean,\n\nNous avons bien reçu votre demande. Le délai d\'intervention est estimé à environ 2 semaines.\n\nN\'hésitez pas si vous avez d\'autres questions.\n\nCordialement,\nL\'administrateur',
          html: '<p>Bonjour Jean,</p><p>Nous avons bien reçu votre demande. Le délai d\'intervention est estimé à environ 2 semaines.</p><p>N\'hésitez pas si vous avez d\'autres questions.</p><p>Cordialement,<br>L\'administrateur</p>',
          hasAttachments: false,
          isRead: true,
          flags: ['\\Seen'],
          isSpam: false,
          threadId: 'thread-2',
          inReplyTo: '2'
        },
        {
          id: '102',
          uid: 102,
          date: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          from: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
          to: [{ name: 'Marie Martin', address: 'marie.martin@outlook.fr' }],
          cc: [{ name: 'Service client', address: 'service@demande-raccordement.fr' }],
          subject: 'Instructions pour votre raccordement électrique',
          text: 'Bonjour Marie,\n\nSuite à notre conversation téléphonique, voici les instructions pour préparer votre raccordement.\n\n1. Vérifiez que l\'emplacement du compteur est accessible\n2. Assurez-vous que le tableau électrique est aux normes\n3. Prévoyez un espace de 3m² pour l\'installation\n\nCordialement,\nL\'administrateur',
          html: '<p>Bonjour Marie,</p><p>Suite à notre conversation téléphonique, voici les instructions pour préparer votre raccordement.</p><ol><li>Vérifiez que l\'emplacement du compteur est accessible</li><li>Assurez-vous que le tableau électrique est aux normes</li><li>Prévoyez un espace de 3m² pour l\'installation</li></ol><p>Cordialement,<br>L\'administrateur</p>',
          hasAttachments: true,
          attachments: [{
            filename: 'instructions.pdf',
            contentType: 'application/pdf',
            size: 68400,
            contentId: 'instructions-123'
          }],
          isRead: true,
          flags: ['\\Seen'],
          isSpam: false,
          threadId: 'thread-4'
        }
      ];
    case 'JUNK':
    case SPAM_FOLDER:
      return Array.from({ length: 45 }, (_, i) => ({
        id: `spam-${i+1}`,
        uid: 200 + i,
        date: new Date(Date.now() - 1000 * 60 * 60 * (Math.random() * 24 * 7)), // 0-7 jours passés
        from: [{ name: `Spammer ${i+1}`, address: `spam${i+1}@spammer.com` }],
        to: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
        subject: `SPAM: Offre commerciale n°${i+1}`,
        text: `Ceci est un message de spam #${i+1}\n\nCe message a été marqué comme spam.\n\nSi ce message n'est pas un spam, déplacez-le vers votre boîte de réception.`,
        html: `<p>Ceci est un message de spam #${i+1}</p><p><strong>Ce message a été marqué comme spam.</strong></p><p>Si ce message n'est pas un spam, déplacez-le vers votre boîte de réception.</p>`,
        hasAttachments: i % 5 === 0, // Un attachement tous les 5 messages
        attachments: i % 5 === 0 ? [{
          filename: `offre${i+1}.pdf`,
          contentType: 'application/pdf',
          size: 100000 + Math.random() * 200000,
          contentId: `offre-${i+1}`
        }] : [],
        isRead: Math.random() > 0.7, // 30% des messages non lus
        flags: Math.random() > 0.7 ? ['\\Seen', '$Junk'] : ['$Junk'],
        isSpam: true,
        threadId: `spam-thread-${i+1}`
      }));
    case TRASH_FOLDER:
      return [
        {
          id: '301',
          uid: 301,
          date: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          from: [{ name: 'Newsletter', address: 'news@electricite-info.fr' }],
          to: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
          subject: 'Newsletter du mois de mai',
          text: 'Voici les dernières actualités du secteur de l\'installation électrique pour le mois de mai.\n\n- Nouvelles normes en vigueur\n- Astuces pour les raccordements complexes\n- Interview du chef des techniciens\n\nBonne lecture !',
          html: '<p>Voici les dernières actualités du secteur de l\'installation électrique pour le mois de mai.</p><ul><li>Nouvelles normes en vigueur</li><li>Astuces pour les raccordements complexes</li><li>Interview du chef des techniciens</li></ul><p>Bonne lecture !</p>',
          hasAttachments: false,
          isRead: true,
          flags: ['\\Seen', '\\Deleted'],
          isSpam: false,
          threadId: 'thread-6'
        }
      ];
    default:
      return [];
  }
}

// Récupérer les emails d'un utilisateur
export async function getUserEmails(userId: number, options: MailboxOptions = {}): Promise<EmailMessage[]> {
  try {
    console.log(`Récupération des emails pour l'utilisateur ${userId}`);
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Gérer explicitement la demande de dossier SPAM
    let mailbox = options.mailbox || INBOX_FOLDER;
    const isRequestingSpam = mailbox === SPAM_FOLDER;
    
    // Si on demande spécifiquement le dossier Spam, forcer le mode simulé
    if (isRequestingSpam) {
      console.log(`Forcer le mode simulé pour le dossier Spam`);
      return getOrInitializeEmailCache(userId, SPAM_FOLDER);
    }
    
    try {
      // Essayer de se connecter à IMAP
      const connection = await connectToImap(imapConfig);
      
      // Ouvrir la boîte de réception
      console.log(`Ouverture de la boîte ${mailbox}`);
      await connection.openBox(mailbox);
      
      // Définir les critères de recherche
      const searchCriteria = options.searchCriteria || ['ALL'];
      if (options.since) {
        searchCriteria.push(['SINCE', options.since]);
      }
      
      // Définir les options de récupération - IMPORTANT: CORRECTIONS DES BODIES FETCHÉS
      // Le problème venait de la définition incorrecte des sections du body - corrigé ici
      const fetchOptions = options.fetchOptions || {
        bodies: ['HEADER', 'TEXT'], // Supprimé 'BODY[]' qui causait l'erreur
        struct: true,
        markSeen: false
      };
      
      // Récupérer les messages
      console.log(`Recherche des messages avec critères:`, searchCriteria);
      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`${messages.length} messages trouvés`);
      
      // Limiter le nombre de messages si nécessaire
      const limitedMessages = options.limit ? messages.slice(0, options.limit) : messages;
      
      // Traiter les messages
      const emailPromises = limitedMessages.map(async (message) => {
        // Récupérer les parties spécifiques pour extraire les composants du message
        const headerFullPart = message.parts.find(part => part.which === 'HEADER');
        const headerFieldsPart = message.parts.find(part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
        const textPart = message.parts.find(part => part.which === 'TEXT');
        
        // Utiliser les headers complets si disponibles, sinon utiliser les champs spécifiques
        const header = headerFullPart ? headerFullPart.body : (headerFieldsPart ? headerFieldsPart.body : {});
        const text = textPart ? textPart.body : '';
        
        // Logs pour le débogage des parties disponibles
        console.log(`Email ${message.attributes.uid} - parties disponibles: ${message.parts.map(p => p.which).join(', ')}`);
        
        // Combiner les parties pour former le contenu du message
        let messageContent = '';
        // Construire le message en combinant l'en-tête et le corps
        if (headerFullPart && headerFullPart.body) {
          // Convertir l'objet d'en-tête en texte
          const headerText = Object.entries(headerFullPart.body)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          messageContent = headerText + '\n\n' + (textPart ? textPart.body : '');
        } else {
          // Utiliser toutes les parties disponibles
          messageContent = message.parts.map(p => typeof p.body === 'string' ? p.body : 
                                            (typeof p.body === 'object' ? JSON.stringify(p.body) : '')).join('\n');
        }
        
        console.log(`Email ${message.attributes.uid} - traitement du contenu`);
        
        // Parser le message pour extraire toutes les informations
        const parsed = await simpleParser(messageContent);
        
        // Déterminer si le message a été lu
        const isRead = message.attributes.flags?.includes('\\Seen');
        
        // Vérifier si le message est susceptible d'être du spam
        const isSpam = message.attributes.flags?.includes('\\Flagged') || 
                       parsed.subject?.toLowerCase().includes('spam') ||
                       message.attributes.flags?.includes('$Junk');
        
        // Formatter les pièces jointes
        const attachments = (parsed.attachments || []).map(att => ({
          filename: att.filename || 'unnamed',
          contentType: att.contentType || 'application/octet-stream',
          size: att.size || 0,
          contentId: att.contentId
        }));
        
        // Normalisation de l'expéditeur pour éviter l'affichage "Inconnu"
        // Traitement spécial pour gérer tous les cas possibles (objet, tableau, chaîne)
        let normalizedFrom = [];
        
        // Cas 1: parsed.from est déjà un objet correctement structuré
        if (parsed.from?.value && Array.isArray(parsed.from.value)) {
          normalizedFrom = parsed.from.value.map(addr => {
            // Vérifier si l'adresse a un nom
            if (!addr.name || addr.name.trim() === '') {
              // Extraire le nom de l'adresse email comme nom par défaut
              const namePart = addr.address?.split('@')[0] || 'Expéditeur';
              // Première lettre en majuscule pour un meilleur rendu
              return { 
                ...addr, 
                name: namePart.charAt(0).toUpperCase() + namePart.slice(1)
              };
            }
            return addr;
          });
        } 
        // Cas 2: parsed.from est une chaîne simple (adresse email brute)
        else if (typeof parsed.from === 'string') {
          const emailParts = parsed.from.split('@');
          const namePart = emailParts[0] || 'Expéditeur';
          normalizedFrom = [{
            name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            address: parsed.from
          }];
        }
        // Cas 3: parsed.from est un objet mais pas sous la forme attendue
        else if (parsed.from && typeof parsed.from === 'object') {
          console.log("Debug - parsed.from est un objet de structure non standard:", JSON.stringify(parsed.from));
          // Reconstruire l'objet avec une structure appropriée
          
          // Définir une adresse email par défaut
          let emailAddress = 'contact@demande-raccordement.fr';
          
          // Extraire l'adresse email de la façon la plus sûre possible
          if (typeof parsed.from.address === 'string') {
            emailAddress = parsed.from.address;
          } else if (typeof parsed.from.value === 'string') {
            emailAddress = parsed.from.value;
          } else if (typeof parsed.from.text === 'string' && parsed.from.text.includes('@')) {
            emailAddress = parsed.from.text;
          }
          
          // Extraire le nom d'affichage ou créer un nom à partir de l'adresse email
          let displayName = '';
          if (typeof parsed.from.name === 'string' && parsed.from.name.trim() !== '') {
            displayName = parsed.from.name;
          } else {
            // Récupérer la partie avant le @ et mettre la première lettre en majuscule
            const namePart = emailAddress.split('@')[0] || 'Expéditeur';
            displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          }
          
          normalizedFrom = [{
            name: displayName,
            address: emailAddress
          }];
        }
        // Cas 4: Fallback si parsed.from est vide ou invalide
        else {
          normalizedFrom = [{
            name: 'Expéditeur',
            address: 'no-reply@demande-raccordement.fr'
          }];
        }
        
        // Normalisation du sujet pour éviter l'affichage "(sans objet)"
        // Décodage des sujets avec encodage spécial (comme =?UTF-8?Q?...?=)
        let normalizedSubject = '(Sans objet)';
        
        console.log("Debug - parsed.subject:", JSON.stringify(parsed.subject));
        
        // Cas 1: parsed.subject existe et est une chaîne de caractères
        if (parsed.subject && typeof parsed.subject === 'string') {
          normalizedSubject = parsed.subject.trim();
          console.log("Debug - Sujet détecté (chaîne):", normalizedSubject);
          
          // Tenter de décoder les sujets avec encodage MIME
          normalizedSubject = normalizedSubject.replace(/=\?[\w-]+\?[BQbq]\?[^?]*\?=/g, match => {
            try {
              return decodeURIComponent(match) || match;
            } catch(e) {
              return match;
            }
          });
        } 
        // Cas 2: parsed.subject est un objet avec une propriété text ou value
        else if (parsed.subject && typeof parsed.subject === 'object') {
          console.log("Debug - Sujet est un objet:", JSON.stringify(parsed.subject));
          
          // Extraire le sujet de n'importe quelle propriété disponible
          let extractedSubject = '';
          
          if (typeof parsed.subject.text === 'string') {
            extractedSubject = parsed.subject.text;
            console.log("Debug - Sujet extrait de text:", extractedSubject);
          } else if (typeof parsed.subject.value === 'string') {
            extractedSubject = parsed.subject.value;
            console.log("Debug - Sujet extrait de value:", extractedSubject);
          } else if (parsed.subject.toString && typeof parsed.subject.toString === 'function') {
            extractedSubject = parsed.subject.toString();
            console.log("Debug - Sujet extrait par toString():", extractedSubject);
          }
          
          if (extractedSubject && extractedSubject.trim() !== '') {
            normalizedSubject = extractedSubject.trim();
          }
        }
        
        // Si après normalisation le sujet est vide, utiliser le texte par défaut
        if (!normalizedSubject || normalizedSubject.trim() === '') {
          normalizedSubject = '(Sans objet)';
        }
        
        // Traitement correct des dates d'email avec plusieurs sources possibles
        let messageDate = new Date();
        
        console.log("Debug - Date brute de l'email:", JSON.stringify({
          parsedDate: parsed.date,
          headerDate: header.date,
          attributesDate: message.attributes?.date
        }));
        
        // 1. Essayer d'utiliser le champ 'date' du contenu parsé
        if (parsed.date) {
          messageDate = new Date(parsed.date);
          console.log("Debug - Date from parsed.date:", messageDate.toISOString());
        }
        // 2. Sinon, essayer d'extraire la date depuis les headers
        else if (header && header.date) {
          messageDate = new Date(header.date);
          console.log("Debug - Date from header.date:", messageDate.toISOString());
        }
        // 3. Sinon, utiliser la date d'internaldate du message
        else if (message.attributes && message.attributes.date) {
          messageDate = new Date(message.attributes.date);
          console.log("Debug - Date from message.attributes.date:", messageDate.toISOString());
        }
        
        // S'assurer que la date est correctement interprétée (comme objet Date)
        if (typeof messageDate === 'string') {
          messageDate = new Date(messageDate);
        }
        
        // Corriger la date si elle est invalide
        if (isNaN(messageDate.getTime())) {
          // Tenter de trouver une date dans le contenu de l'email comme dernier recours
          const dateMatches = parsed.text?.match(/Date:([^<\n]+)/i);
          if (dateMatches && dateMatches[1]) {
            const extractedDate = new Date(dateMatches[1].trim());
            if (!isNaN(extractedDate.getTime())) {
              messageDate = extractedDate;
            } else {
              messageDate = new Date(); // Fallback à la date actuelle si tout échoue
            }
          } else {
            messageDate = new Date(); // Fallback à la date actuelle si tout échoue
          }
        }
        
        return {
          id: message.attributes.uid.toString(),
          uid: message.attributes.uid,
          date: messageDate,
          from: normalizedFrom,
          to: parsed.to?.value || [],
          cc: parsed.cc?.value || [],
          subject: normalizedSubject,
          text: parsed.text || '',
          html: parsed.html || undefined,
          hasAttachments: attachments.length > 0,
          attachments: attachments,
          isRead: isRead,
          flags: message.attributes.flags || [],
          isSpam: isSpam,
          threadId: parsed.messageId,
          inReplyTo: parsed.inReplyTo,
          references: parsed.references
        };
      });
      
      const emails = await Promise.all(emailPromises);
      connection.end();
      
      console.log(`${emails.length} emails récupérés avec succès via IMAP pour l'utilisateur ${userId}`);
      return emails;
      
    } catch (imapError) {
      console.error(`Erreur IMAP pour l'utilisateur ${userId}:`, imapError);
      const mailbox = options.mailbox || INBOX_FOLDER;
      
      // Si l'utilisateur est l'admin (contact@demande-raccordement.fr), tenter une approche alternative
      // avant de revenir aux emails simulés
      if (userId === 1) {
        try {
          console.log("Tentative de récupération IMAP avec configuration modifiée pour l'administrateur");
          
          // Connexion à nouveau avec la même configuration
          const connection = await connectToImap(imapConfig);
          await connection.openBox(mailbox);
          
          // Configuration simplifiée pour IMAP
          const simpleFetchOptions = {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
            struct: true,
            markSeen: false
          };
          
          const messages = await connection.search(['ALL'], simpleFetchOptions);
          console.log(`${messages.length} messages trouvés avec configuration simple`);
          
          // Map les messages en format EmailMessage simplifié
          const emails = messages.map(message => {
            const header = message.parts[0].body;
            const from = header.from ? header.from[0] : '';
            const fromName = from ? from.split('@')[0].charAt(0).toUpperCase() + from.split('@')[0].slice(1) : 'Expéditeur';
            
            return {
              id: message.attributes.uid.toString(),
              uid: message.attributes.uid,
              date: message.attributes.date || new Date(),
              from: [{
                name: fromName,
                address: from || 'no-reply@demande-raccordement.fr'
              }],
              to: [{
                name: 'Contact',
                address: 'contact@demande-raccordement.fr'
              }],
              subject: header.subject ? header.subject[0] : '(Sans objet)',
              text: 'Pour voir le contenu complet, ouvrez cet email.',
              html: '<p>Pour voir le contenu complet, ouvrez cet email.</p>',
              hasAttachments: false,
              isRead: message.attributes.flags?.includes('\\Seen') || false,
              flags: message.attributes.flags || [],
              isSpam: false
            } as EmailMessage;
          });
          
          console.log(`Récupération alternative réussie: ${emails.length} emails`);
          connection.end();
          return emails;
        } catch (retryError) {
          console.error(`Échec de la tentative simplifiée, revenir au mode simulé:`, retryError);
          // Utiliser les emails simulés UNIQUEMENT en dernier recours
          console.log(`Utilisation des emails simulés pour la boîte ${mailbox} après échec des tentatives IMAP`);
          return getOrInitializeEmailCache(userId, mailbox);
        }
      } else {
        // Pour les autres utilisateurs, utiliser directement le mode simulé
        console.log(`Utilisation des emails simulés pour la boîte ${mailbox} après échec IMAP`);
        return getOrInitializeEmailCache(userId, mailbox);
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des emails pour l'utilisateur ${userId}:`, error);
    // En dernier recours, renvoyer une liste vide
    return [];
  }
}

// Récupérer des emails récents pour les notifications
export async function getRecentUserEmails(userId: number, mailbox: string = INBOX_FOLDER, limit: number = 10): Promise<EmailMessage[]> {
  try {
    const cacheKey = `recent_emails_${userId}_${mailbox}`;
    const cachedDataRaw = globalThis[cacheKey as any];
    const cacheTime = globalThis[`${cacheKey}_time` as any];
    
    // Utiliser le cache si disponible et récent (moins de 90 secondes)
    if (cachedDataRaw && cacheTime && (Date.now() - cacheTime) < 90 * 1000) {
      console.log(`Utilisation du cache pour ${limit} emails récents de l'utilisateur ${userId}`);
      return cachedDataRaw;
    }
    
    // Configuration IMAP
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Si demande de SPAM, utiliser des données simulées pour éviter le ralentissement
    if (mailbox === SPAM_FOLDER) {
      return getOrInitializeEmailCache(userId, SPAM_FOLDER).slice(0, limit);
    }
    
    try {
      // Optimisation: version simplifiée pour les notifications
      const connection = await connectToImap(imapConfig);
      await connection.openBox(mailbox);
      
      // Rechercher seulement les emails récents
      const searchCriteria = [
        ['SINCE', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]  // 7 jours
      ];
      
      // Option optimisée : ne récupérer que les headers pour les notifications
      const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
        struct: false,
        markSeen: false
      };
      
      // Rechercher et limiter
      const messages = await connection.search(searchCriteria, fetchOptions);
      const limitedMessages = messages.slice(0, limit);
      
      // Traitement simplifié
      const emails = await Promise.all(limitedMessages.map(async (message) => {
        // Extraire uniquement les informations essentielles
        const headerPart = message.parts.find(p => p.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
        const header = headerPart ? headerPart.body : {};
        
        // Extraire le sujet
        let subject = header.subject || '(Sans objet)';
        if (Array.isArray(subject)) subject = subject[0];
        
        // Extraire la date
        let messageDate = new Date();
        if (header.date && header.date[0]) {
          messageDate = new Date(header.date[0]);
        }
        
        // Extraire l'expéditeur
        let from = [{ name: 'Expéditeur inconnu', address: 'unknown@demande-raccordement.fr' }];
        if (header.from && header.from[0]) {
          const fromText = header.from[0];
          const match = fromText.match(/(.*)<(.*)>/);
          if (match) {
            from = [{ name: match[1].trim(), address: match[2].trim() }];
          } else {
            from = [{ name: '', address: fromText.trim() }];
          }
        }
        
        // Format de l'email simplifié pour notification
        return {
          id: message.attributes.uid.toString(),
          uid: message.attributes.uid,
          date: messageDate,
          from,
          to: [],  // Non nécessaire pour les notifications
          cc: [],  // Non nécessaire pour les notifications
          subject,
          text: 'Cliquez pour voir le contenu complet...',
          hasAttachments: false,  // Simplifié
          isRead: message.attributes.flags?.includes('\\Seen') || false,
          flags: message.attributes.flags || [],
          isSpam: false
        } as EmailMessage;
      }));
      
      // Mettre en cache
      globalThis[cacheKey as any] = emails;
      globalThis[`${cacheKey}_time` as any] = Date.now();
      
      connection.end();
      return emails;
      
    } catch (error) {
      console.error("Erreur lors de la récupération des emails récents:", error);
      
      // En cas d'erreur, essayer d'utiliser le cache même périmé
      if (cachedDataRaw) {
        return cachedDataRaw;
      }
      
      // Fallback: récupérer les emails simulés et les limiter
      return getOrInitializeEmailCache(userId, mailbox).slice(0, limit);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des emails récents pour l'utilisateur ${userId}:`, error);
    // En dernier recours, renvoyer une liste vide
    return [];
  }
}

// Récupérer les dossiers d'emails d'un utilisateur
export async function getUserMailboxes(userId: number): Promise<string[]> {
  try {
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Utiliser des dossiers simulés pour le mode démo
    if (imapConfig.useSimulatedBoxes) {
      console.log(`Utilisation des dossiers simulés pour l'utilisateur ${userId}`);
      return [INBOX_FOLDER, SENT_FOLDER, SPAM_FOLDER, TRASH_FOLDER, 'Drafts', 'Archive'];
    }
    
    const connection = await connectToImap(imapConfig);
    const boxes = await connection.getBoxes();
    connection.end();
    
    // Extraire les noms des dossiers
    const mailboxes: string[] = [];
    for (const name in boxes) {
      mailboxes.push(name);
      // Ajouter les sous-dossiers s'ils existent
      if (boxes[name].children) {
        for (const subName in boxes[name].children) {
          mailboxes.push(`${name}/${subName}`);
        }
      }
    }
    
    return mailboxes;
  } catch (error) {
    console.error(`Erreur lors de la récupération des dossiers pour l'utilisateur ${userId}:`, error);
    return [];
  }
}

// Liste locales d'emails simulés par utilisateur et par dossier
let simulatedEmailsCache: Record<string, EmailMessage[]> = {};

// Initialisation du cache avec les données de démo
function getOrInitializeEmailCache(userId: number, mailbox: string): EmailMessage[] {
  const cacheKey = `${userId}:${mailbox}`;
  
  // Vérifier si le cache existe déjà pour cette boîte
  if (!simulatedEmailsCache[cacheKey]) {
    console.log(`Initialisation du cache pour la boîte ${mailbox}`);
    simulatedEmailsCache[cacheKey] = generateDemoEmails(mailbox);
    
    // S'assurer que les emails Spam sont générés correctement
    if (mailbox === SPAM_FOLDER && (!simulatedEmailsCache[cacheKey] || simulatedEmailsCache[cacheKey].length === 0)) {
      console.log(`Génération forcée de 45 emails pour le dossier ${SPAM_FOLDER}`);
      simulatedEmailsCache[cacheKey] = Array.from({ length: 45 }, (_, i) => ({
        id: `spam-${i+1}`,
        uid: 200 + i,
        date: new Date(Date.now() - 1000 * 60 * 60 * (Math.random() * 24 * 7)), // 0-7 jours passés
        from: [{ name: `Spammer ${i+1}`, address: `spam${i+1}@spammer.com` }],
        to: [{ name: 'Contact', address: 'contact@demande-raccordement.fr' }],
        subject: `SPAM: Offre commerciale n°${i+1}`,
        text: `Ceci est un message de spam #${i+1}\n\nCe message a été marqué comme spam.\n\nSi ce message n'est pas un spam, déplacez-le vers votre boîte de réception.`,
        html: `<p>Ceci est un message de spam #${i+1}</p><p><strong>Ce message a été marqué comme spam.</strong></p><p>Si ce message n'est pas un spam, déplacez-le vers votre boîte de réception.</p>`,
        hasAttachments: i % 5 === 0, // Un attachement tous les 5 messages
        attachments: i % 5 === 0 ? [{
          filename: `offre${i+1}.pdf`,
          contentType: 'application/pdf',
          size: 100000 + Math.random() * 200000,
          contentId: `offre-${i+1}`
        }] : [],
        isRead: Math.random() > 0.7, // 30% des messages non lus
        flags: Math.random() > 0.7 ? ['\\Seen', '$Junk'] : ['$Junk'],
        isSpam: true,
        threadId: `spam-thread-${i+1}`
      }));
    }
  }
  
  return simulatedEmailsCache[cacheKey];
}

// Marquer un email comme lu/non lu
export async function markEmail(userId: number, messageId: string, isRead: boolean, mailbox: string = INBOX_FOLDER): Promise<boolean> {
  try {
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Simuler le marquage d'email pour le mode démo
    if (imapConfig.useSimulatedBoxes) {
      console.log(`Simulation du marquage de l'email ${messageId} comme ${isRead ? 'lu' : 'non lu'} dans la boîte ${mailbox}`);
      
      // Mettre à jour l'email dans le cache de simulation
      const emails = getOrInitializeEmailCache(userId, mailbox);
      const emailIndex = emails.findIndex(email => email.id === messageId);
      
      if (emailIndex !== -1) {
        // Mettre à jour l'email avec son nouveau statut de lecture
        emails[emailIndex] = {
          ...emails[emailIndex],
          isRead: isRead,
          flags: isRead 
            ? [...(emails[emailIndex].flags || []).filter(f => f !== '\\Seen'), '\\Seen']
            : (emails[emailIndex].flags || []).filter(f => f !== '\\Seen')
        };
        
        // Mettre à jour le cache
        simulatedEmailsCache[`${userId}:${mailbox}`] = emails;
        return true;
      }
      
      return false;
    }
    
    const connection = await connectToImap(imapConfig);
    await connection.openBox(mailbox, false); // Ouvrir en mode non-lecture seule
    
    // Ajouter ou supprimer le flag \Seen
    const uid = parseInt(messageId, 10);
    if (isRead) {
      await connection.addFlags(uid, '\\Seen');
    } else {
      await connection.delFlags(uid, '\\Seen');
    }
    
    connection.end();
    return true;
  } catch (error) {
    console.error(`Erreur lors du marquage de l'email ${messageId} pour l'utilisateur ${userId}:`, error);
    return false;
  }
}

// Déplacer un email vers un autre dossier
export async function moveEmail(userId: number, messageId: string, destinationMailbox: string, sourceMailbox: string = INBOX_FOLDER): Promise<boolean> {
  try {
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Simuler le déplacement d'email pour le mode démo
    if (imapConfig.useSimulatedBoxes) {
      console.log(`Simulation du déplacement de l'email ${messageId} de ${sourceMailbox} vers ${destinationMailbox}`);
      
      // Trouver l'email dans le dossier source
      const sourceEmails = getOrInitializeEmailCache(userId, sourceMailbox);
      const emailIndex = sourceEmails.findIndex(email => email.id === messageId);
      
      if (emailIndex === -1) {
        console.error(`Email ${messageId} non trouvé dans le dossier ${sourceMailbox}`);
        return false;
      }
      
      // Récupérer l'email et le supprimer du dossier source
      const email = sourceEmails[emailIndex];
      sourceEmails.splice(emailIndex, 1);
      simulatedEmailsCache[`${userId}:${sourceMailbox}`] = sourceEmails;
      
      // Ajouter l'email au dossier de destination
      const destinationEmails = getOrInitializeEmailCache(userId, destinationMailbox);
      destinationEmails.unshift(email); // Ajouter au début pour simuler un nouvel email
      simulatedEmailsCache[`${userId}:${destinationMailbox}`] = destinationEmails;
      
      return true;
    }
    
    const connection = await connectToImap(imapConfig);
    await connection.openBox(sourceMailbox, false); // Ouvrir en mode non-lecture seule
    
    // Déplacer le message
    const uid = parseInt(messageId, 10);
    await connection.moveMessage(uid, destinationMailbox);
    
    connection.end();
    return true;
  } catch (error) {
    console.error(`Erreur lors du déplacement de l'email ${messageId} pour l'utilisateur ${userId}:`, error);
    return false;
  }
}

// Supprimer un email
export async function deleteEmail(userId: number, messageId: string, mailbox: string = INBOX_FOLDER): Promise<boolean> {
  try {
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Simuler la suppression d'email pour le mode démo
    if (imapConfig.useSimulatedBoxes) {
      console.log(`Simulation de la suppression de l'email ${messageId} de la boîte ${mailbox}`);
      
      // Récupérer les emails du dossier
      const emails = getOrInitializeEmailCache(userId, mailbox);
      
      // Trouver l'index de l'email à supprimer
      const emailIndex = emails.findIndex(email => email.id === messageId);
      
      if (emailIndex === -1) {
        console.error(`Email ${messageId} non trouvé dans le dossier ${mailbox}`);
        return false;
      }
      
      // Si on est déjà dans la corbeille, suppression définitive
      if (mailbox.toUpperCase() === TRASH_FOLDER.toUpperCase()) {
        // Suppression définitive - retirer l'email complètement du cache
        emails.splice(emailIndex, 1);
        simulatedEmailsCache[`${userId}:${mailbox}`] = emails;
      } else {
        // Option 2: Déplacer vers la corbeille pour tous les autres dossiers
        // Récupérer l'email à supprimer
        const emailToDelete = emails[emailIndex];
        
        // D'abord supprimer l'email du dossier actuel
        emails.splice(emailIndex, 1);
        simulatedEmailsCache[`${userId}:${mailbox}`] = emails;
        
        // Ensuite, ajouter l'email à la corbeille
        const trashEmails = getOrInitializeEmailCache(userId, TRASH_FOLDER);
        trashEmails.unshift(emailToDelete);
        simulatedEmailsCache[`${userId}:${TRASH_FOLDER}`] = trashEmails;
      }
      
      return true;
    }
    
    const connection = await connectToImap(imapConfig);
    await connection.openBox(mailbox, false); // Ouvrir en mode non-lecture seule
    
    // Déplacer vers la corbeille au lieu de supprimer définitivement
    const uid = parseInt(messageId, 10);
    
    if (mailbox.toUpperCase() === TRASH_FOLDER.toUpperCase()) {
      // Si déjà dans la corbeille, supprimer définitivement
      await connection.addFlags(uid, '\\Deleted');
      await connection.expunge();
    } else {
      try {
        // Essayer de déplacer vers la corbeille
        await connection.moveMessage(uid, TRASH_FOLDER);
      } catch (moveError) {
        console.error('Erreur lors du déplacement vers la corbeille:', moveError);
        
        // Si le déplacement échoue, vérifier si le dossier Trash existe
        try {
          // Liste des boîtes existantes
          const boxes = await connection.getBoxes();
          
          // Si le dossier corbeille n'existe pas, essayer de le créer
          if (!boxes[TRASH_FOLDER] && !boxes[TRASH_FOLDER.toUpperCase()]) {
            await connection.addBox(TRASH_FOLDER);
            // Réessayer le déplacement
            await connection.moveMessage(uid, TRASH_FOLDER);
          } else {
            // Si impossible de déplacer, marquer comme supprimé
            await connection.addFlags(uid, '\\Deleted');
            await connection.expunge();
          }
        } catch (createError) {
          console.error(`Impossible de créer le dossier ${TRASH_FOLDER}:`, createError);
          // Dernière solution: supprimer définitivement
          await connection.addFlags(uid, '\\Deleted');
          await connection.expunge();
        }
      }
    }
    
    connection.end();
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'email ${messageId} pour l'utilisateur ${userId}:`, error);
    return false;
  }
}

// Récupérer le contenu complet d'un email
export async function getEmailContent(userId: number, messageId: string, mailbox: string = INBOX_FOLDER): Promise<EmailMessage | null> {
  try {
    const imapConfig = await createImapConfigFromUser(userId);
    if (!imapConfig) {
      throw new Error(`Configuration IMAP non disponible pour l'utilisateur ${userId}`);
    }
    
    // Simuler la récupération d'un email spécifique pour le mode démo
    if (imapConfig.useSimulatedBoxes) {
      console.log(`Simulation de la récupération du contenu de l'email ${messageId} dans la boîte ${mailbox}`);
      
      // Récupérer tous les emails simulés pour cette boîte depuis le cache
      const emails = getOrInitializeEmailCache(userId, mailbox);
      
      // Trouver l'email correspondant à l'ID demandé
      const emailIndex = emails.findIndex(email => email.id === messageId);
      
      if (emailIndex === -1) {
        console.error(`Email simulé avec ID ${messageId} non trouvé dans la boîte ${mailbox}`);
        return null;
      }
      
      // Marquer l'email comme lu en mettant à jour le cache
      if (!emails[emailIndex].isRead) {
        emails[emailIndex] = {
          ...emails[emailIndex],
          isRead: true,
          flags: [...(emails[emailIndex].flags || []).filter(f => f !== '\\Seen'), '\\Seen']
        };
        
        // Mettre à jour le cache
        simulatedEmailsCache[`${userId}:${mailbox}`] = emails;
      }
      
      // Renvoyer l'email mis à jour
      return emails[emailIndex];
    }
    
    const connection = await connectToImap(imapConfig);
    await connection.openBox(mailbox);
    
    // Récupérer le message
    const uid = parseInt(messageId, 10);
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      struct: true,
      markSeen: true
    };
    
    const messages = await connection.search([['UID', uid.toString()]], fetchOptions);
    if (messages.length === 0) {
      throw new Error(`Email ${messageId} non trouvé`);
    }
    
    const message = messages[0];
    const fullBody = message.parts.find(part => part.which === '');
    
    if (!fullBody) {
      throw new Error(`Contenu de l'email ${messageId} non disponible`);
    }
    
    // Parser le message complet
    const parsed = await simpleParser(fullBody.body);
    
    // Récupérer les pièces jointes avec contenu
    const attachments = await Promise.all((parsed.attachments || []).map(async (att) => ({
      filename: att.filename || 'unnamed',
      contentType: att.contentType || 'application/octet-stream',
      size: att.size || 0,
      content: att.content,
      contentId: att.contentId
    })));
    
    connection.end();
    
    return {
      id: message.attributes.uid.toString(),
      uid: message.attributes.uid,
      date: parsed.date || new Date(),
      // Normalisation de l'expéditeur pour éviter l'affichage "Inconnu"
      from: parsed.from?.value?.map(addr => {
        if (!addr.name || addr.name.trim() === '') {
          return { ...addr, name: addr.address.split('@')[0] || 'Expéditeur' };
        }
        return addr;
      }) || [],
      to: parsed.to?.value || [],
      cc: parsed.cc?.value || [],
      // Normalisation du sujet pour éviter l'affichage "(pas de sujet)"
      subject: parsed.subject || '(Sans objet)',
      text: parsed.text || '',
      html: parsed.html || undefined,
      hasAttachments: attachments.length > 0,
      attachments: attachments,
      isRead: true, // Nous venons de le marquer comme lu
      flags: message.attributes.flags || [],
      isSpam: message.attributes.flags?.includes('\\Flagged') || parsed.subject?.toLowerCase().includes('spam'),
      threadId: parsed.messageId,
      inReplyTo: parsed.inReplyTo,
      references: parsed.references
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu de l'email ${messageId} pour l'utilisateur ${userId}:`, error);
    return null;
  }
}