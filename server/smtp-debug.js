/**
 * Script de débogage SMTP
 * 
 * Ce script permet de tester la connexion SMTP et le paramétrage des identifiants
 * pour identifier les problèmes d'authentification.
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function testSMTPConnection() {
  // Configuration par défaut
  const config = {
    host: process.env.SMTP_HOST || 's3474.fra1.stableserver.net',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'false' ? false : true,
    auth: {
      user: process.env.SMTP_USER || 'notification@raccordement.net',
      pass: process.env.SMTP_PASSWORD || ''
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  };

  console.log('┌────────────────────────────────────────────┐');
  console.log('│           TEST CONNEXION SMTP              │');
  console.log('└────────────────────────────────────────────┘');
  
  console.log('\nConfiguration utilisée:');
  console.log(`Hôte: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`Sécurisé: ${config.secure}`);
  console.log(`Utilisateur: ${config.auth.user}`);
  console.log(`Mot de passe défini: ${config.auth.pass ? 'Oui' : 'Non'}`);
  console.log(`Longueur mot de passe: ${config.auth.pass ? config.auth.pass.length : 0} caractères`);
  
  try {
    console.log('\nCréation du transporteur...');
    const transporter = nodemailer.createTransport(config);
    
    console.log('\nTest de connexion (verify)...');
    await transporter.verify();
    
    console.log('\n✅ Connexion SMTP réussie!');
    
    // Tester également l'envoi d'un email
    console.log('\nTest d\'envoi d\'un email...');
    
    const info = await transporter.sendMail({
      from: `"Test SMTP" <${config.auth.user}>`,
      to: "notification@raccordement.net",
      subject: "Test de la connexion SMTP",
      text: "Ce message est un test automatique de la connexion SMTP.",
      html: "<p>Ce message est un test automatique de la connexion SMTP.</p>"
    });
    
    console.log(`\n✅ Email envoyé avec succès! ID du message: ${info.messageId}`);
    
  } catch (error) {
    console.log('\n❌ Erreur de connexion SMTP:');
    console.error(error);
    
    // Ajouter des conseils de débogage spécifiques
    if (error.code === 'EAUTH') {
      console.log('\nErreur d\'authentification (EAUTH):');
      console.log('- Vérifiez que le nom d\'utilisateur est correct');
      console.log('- Vérifiez que le mot de passe est correct');
      console.log('- Assurez-vous que le compte n\'est pas bloqué');
    } else if (error.code === 'ESOCKET') {
      console.log('\nErreur de connexion (ESOCKET):');
      console.log('- Vérifiez que le serveur SMTP est accessible');
      console.log('- Vérifiez que le port est correct');
      console.log('- Vérifiez que le paramètre secure (SSL/TLS) est correctement configuré');
    }
  }
}

// Exécution du test
testSMTPConnection().catch(console.error);