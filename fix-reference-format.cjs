const fs = require('fs');

// Lire le fichier routes.ts
const content = fs.readFileSync('server/routes.ts', 'utf8');

// Corriger tous les formats de référence pour utiliser "REF-" au lieu de "LEAD-" ou "ENE-"
let fixedContent = content
  .replace(/LEAD-/g, 'REF-')
  .replace(/ENE-/g, 'REF-')
  .replace(/`LEAD-\${/g, '`REF-${')
  .replace(/`ENE-\${/g, '`REF-${');

// Écrire le fichier corrigé
fs.writeFileSync('server/routes.ts', fixedContent);

console.log('✅ Format des références standardisé sur "REF-XXXX-XXXXXX"');

// Aussi corriger le fichier principal de soumission de formulaire
const formContent = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');
const fixedFormContent = formContent
  .replace(/LEAD-/g, 'REF-')
  .replace(/ENE-/g, 'REF-');

fs.writeFileSync('client/src/pages/raccordement-enedis.tsx', fixedFormContent);

console.log('✅ Format des références corrigé dans le formulaire aussi');
