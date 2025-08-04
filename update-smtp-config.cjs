// Script de mise à jour complète de la configuration SMTP
// Nouvelle configuration stableserver.net

const fs = require('fs');
const path = require('path');

// Nouvelle configuration SMTP
const newConfig = {
  host: 's4015.fra1.stableserver.net',
  port: 465,
  user: 'notification@portail-electricite.com',
  pass: 'xecmug-wakDed-xunje5',
  to: 'bonjour@portail-electricite.com'
};

console.log('🔄 Mise à jour de la configuration SMTP...');

// Fichiers à mettre à jour
const files = [
  'server/email-service.ts',
  'server/email-imap-service.ts',
  'server/routes.ts'
];

// Remplacements à effectuer
const replacements = [
  // Ancien serveur Namecheap
  {
    from: 'premium234.web-hosting.com',
    to: 's4015.fra1.stableserver.net'
  },
  // Messages de log
  {
    from: 'SMTP UNIQUE',
    to: 'SMTP STABLESERVER'
  },
  {
    from: 'SMTP Namecheap',
    to: 'SMTP STABLESERVER'
  }
];

// Fonction pour mettre à jour un fichier
function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Fichier non trouvé: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Appliquer les remplacements
    replacements.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
        console.log(`✅ ${filePath}: ${replacement.from} → ${replacement.to}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`💾 Fichier mis à jour: ${filePath}`);
    } else {
      console.log(`ℹ️  Aucune modification nécessaire: ${filePath}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error.message);
    return false;
  }
}

// Mettre à jour tous les fichiers
console.log('🚀 Démarrage de la mise à jour...\n');

files.forEach(file => {
  console.log(`\n📄 Traitement de ${file}:`);
  updateFile(file);
});

console.log('\n✅ Mise à jour terminée!');
console.log('\n📧 Nouvelle configuration SMTP:');
console.log(`   Serveur: ${newConfig.host}:${newConfig.port}`);
console.log(`   Utilisateur: ${newConfig.user}`);
console.log(`   Destination: ${newConfig.to}`);