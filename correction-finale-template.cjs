/**
 * CORRECTION FINALE - Template email pour recevoir les vraies données
 * Problème : Votre équipe reçoit ${data.email} au lieu des vraies coordonnées
 * Solution : Corriger le template pour afficher les données réelles
 */

const fs = require('fs');

console.log('🚨 CORRECTION FINALE - Template email');
console.log('🎯 Objectif : Vos emails doivent contenir les vraies coordonnées des prospects');
console.log('');

const emailServicePath = 'server/email-service.ts';
let content = fs.readFileSync(emailServicePath, 'utf8');

// Remplacer complètement le template défaillant
const newTemplate = `// Templates d'emails professionnels avec design UI/UX parfait
const EMAIL_TEMPLATES = {
  lead: {
    subject: '🎯 Nouveau Lead - Étape 1 Complétée',
    getHtml: (data: any) => {
      // Template qui affiche les VRAIES données saisies
      return \`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Nouveau Lead</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
              
              <h1 style="color: #059669; text-align: center;">🎯 NOUVEAU LEAD GÉNÉRÉ</h1>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>👤 Informations Client</h3>
                <p><strong>Nom :</strong> \${data.prenom || ''} \${data.nom || ''}</p>
                <p><strong>Email :</strong> <a href="mailto:\${data.email}">\${data.email || ''}</a></p>
                <p><strong>Téléphone :</strong> <a href="tel:\${data.telephone}">\${data.telephone || ''}</a></p>
                <p><strong>Type :</strong> \${data.clientType || ''}</p>
                \${data.raisonSociale ? \`<p><strong>Société :</strong> \${data.raisonSociale}</p>\` : ''}
              </div>

              <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-weight: bold; color: #166534;">
                  ⚡ CONTACTER DANS LES 2 HEURES
                </p>
              </div>

            </div>
          </body>
        </html>
      \`;
    }
  },`;

// Remplacer le début du fichier avec le nouveau template
const templateStart = content.indexOf('// Templates d\'emails professionnels');
const templateEnd = content.indexOf('  paiementReussi: {');

if (templateStart !== -1 && templateEnd !== -1) {
  const before = content.substring(0, templateStart);
  const after = content.substring(templateEnd);
  content = before + newTemplate + '\n\n  paiementReussi: {' + after.substring(after.indexOf('\n'));
  
  fs.writeFileSync(emailServicePath, content);
  console.log('✅ Template email corrigé avec succès');
} else {
  console.log('❌ Structure template non trouvée - correction manuelle nécessaire');
}

console.log('');
console.log('🎯 RÉSULTAT ATTENDU :');
console.log('✅ Vos emails contiendront maintenant :');
console.log('   • Les vrais noms de vos prospects');
console.log('   • Les vraies adresses email');
console.log('   • Les vrais numéros de téléphone');
console.log('');
console.log('📞 Votre équipe commerciale pourra maintenant contacter les prospects !');
