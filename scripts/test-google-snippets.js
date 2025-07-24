/**
 * Script de test des snippets Google
 * Ce script permet de tester si les snippets Google se chargent correctement 
 * et si les variables de remplacement fonctionnent
 * 
 * Utilisation:
 *   tsx scripts/test-google-snippets.js
 */

import { db } from '../server/db';
import { eq, like } from 'drizzle-orm';
import { systemConfigs } from '../server/schema';

// Fonction pour transformer et tester un snippet Google
function testVariableReplacement(snippetCode, variables) {
  let modifiedCode = snippetCode;
  const replacements = [];
  
  // Parcourir toutes les variables et tester leur remplacement
  Object.entries(variables).forEach(([key, value]) => {
    // Rechercher les occurrences de la variable dans le format {{variable}}
    const regex = new RegExp(`{{${key}}}`, 'g');
    const matchCount = (snippetCode.match(regex) || []).length;
    
    if (matchCount > 0) {
      replacements.push({
        variable: key,
        value: value,
        occurrences: matchCount
      });
      
      // Remplacer la variable
      modifiedCode = modifiedCode.replace(regex, value);
    }
  });
  
  return {
    originalCode: snippetCode,
    modifiedCode: modifiedCode,
    replacements: replacements,
    success: replacements.length > 0
  };
}

// Fonction pour vérifier les variables de paiement
async function testPaymentSnippet() {
  try {
    console.log('\n🔍 Test du snippet de paiement réussi...');
    
    // Récupérer le snippet de paiement avec Drizzle ORM
    const paymentSnippetResult = await db.select({
      configValue: systemConfigs.configValue
    })
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, 'google_snippet_payment-success-snippet'));
    
    if (paymentSnippetResult.length === 0) {
      console.log('❌ Snippet de paiement non trouvé dans la base de données');
      return;
    }
    
    const paymentSnippet = JSON.parse(paymentSnippetResult[0].configValue);
    console.log(`✅ Snippet trouvé: "${paymentSnippet.name}" (${paymentSnippet.id})`);
    
    // Variables de test
    const testVariables = {
      reference: 'REF-1234-567890',
      amount: '129.80',
      email: 'test@example.com'
    };
    
    // Tester le remplacement des variables
    const testResult = testVariableReplacement(paymentSnippet.code, testVariables);
    
    if (testResult.success) {
      console.log('✅ Remplacement de variables réussi:');
      testResult.replacements.forEach(replacement => {
        console.log(`   - {{${replacement.variable}}} → ${replacement.value} (${replacement.occurrences} occurrences)`);
      });
      
      // Vérifier si l'ID de transaction est inclus dans le code
      if (testResult.modifiedCode.includes('transaction_id')) {
        if (testResult.modifiedCode.includes(`"transaction_id": "${testVariables.reference}"`)) {
          console.log('✅ L\'ID de transaction est correctement inclus dans le snippet');
        } else {
          console.log('⚠️ L\'ID de transaction est présent mais pourrait ne pas être correctement formaté');
        }
      } else {
        console.log('❌ ERREUR: L\'ID de transaction n\'est pas inclus dans le snippet');
      }
      
      // Afficher le code modifié pour vérification
      console.log('\n📝 Code du snippet après remplacement des variables:');
      console.log('---------------------------------------------------');
      console.log(testResult.modifiedCode);
      console.log('---------------------------------------------------');
    } else {
      console.log('⚠️ Aucune variable remplacée dans le snippet. Variables disponibles:');
      Object.entries(testVariables).forEach(([key, value]) => {
        console.log(`   - {{${key}}}: ${value}`);
      });
      
      // Afficher le code du snippet pour aider au débogage
      console.log('\n📝 Code du snippet (aucune variable détectée):');
      console.log('---------------------------------------------------');
      console.log(paymentSnippet.code);
      console.log('---------------------------------------------------');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test du snippet de paiement:', error);
  }
}

// Fonction principale
async function main() {
  try {
    // Test du snippet de paiement
    await testPaymentSnippet();
    
    console.log('\n📋 Résumé des tests:');
    console.log('1. Assurez-vous que le tag Google Analytics est bien chargé sur toutes les pages');
    console.log('2. Vérifiez que les variables {{reference}} sont correctement remplacées');
    console.log('3. Testez en production pour valider le fonctionnement complet');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
main();