/**
 * Script de test pour vérifier la connexion IMAP
 * 
 * Exécuter avec: node server/test-imap-connection.js
 */

import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import 'dotenv/config';

async function testImapConnection() {
  console.log('Démarrage du test de connexion IMAP...');
  
  // Configuration minimale pour le test
  const config = {
    imap: {
      user: 'contact@raccordement.net',
      password: process.env.IMAP_PASSWORD,
      host: 's4015.fra1.stableserver.net',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      },
      authTimeout: 10000
    }
  };

  try {
    console.log('Tentative de connexion au serveur IMAP...');
    const connection = await imaps.connect(config);
    console.log('✓ Connexion réussie au serveur IMAP');

    // Lister les boîtes mail disponibles
    console.log('Récupération de la liste des boîtes mail...');
    const boxes = await connection.getBoxes();
    console.log('✓ Boîtes mail disponibles:', Object.keys(boxes));

    // Ouvrir la boîte de réception
    console.log('Ouverture de la boîte INBOX...');
    await connection.openBox('INBOX');
    console.log('✓ Boîte INBOX ouverte avec succès');

    // Récupérer les messages récents (max 5)
    console.log('Recherche des messages récents...');
    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
      struct: true,
      markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`✓ ${messages.length} messages trouvés`);

    // Afficher un résumé des 3 premiers messages
    const messageLimit = Math.min(3, messages.length);
    if (messageLimit > 0) {
      console.log(`Affichage des ${messageLimit} messages les plus récents:`);
      
      for (let i = 0; i < messageLimit; i++) {
        const message = messages[i];
        const headerPart = message.parts.find(part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
        const header = headerPart.body;

        console.log(`\nMessage #${i + 1}:`);
        console.log(`- De: ${header.from[0] || 'Non disponible'}`);
        console.log(`- À: ${header.to[0] || 'Non disponible'}`);
        console.log(`- Sujet: ${header.subject[0] || '(Sans objet)'}`);
        console.log(`- Date: ${header.date[0] || 'Non disponible'}`);
      }
    }

    // Terminer la connexion
    console.log('\nFermeture de la connexion IMAP...');
    connection.end();
    console.log('✓ Connexion fermée');
    
    console.log('\n✅ Test IMAP terminé avec succès');
  } catch (error) {
    console.error('\n❌ Erreur lors du test IMAP:', error);
    if (error.source) {
      console.error('Source de l\'erreur:', error.source);
    }
  }
}

// Exécuter le test
testImapConnection()
  .then(() => {
    console.log('Test terminé');
  })
  .catch(error => {
    console.error('Erreur non gérée:', error);
  });