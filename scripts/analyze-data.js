#!/usr/bin/env node

/**
 * Script utilitaire pour analyser les données avec Claude
 * 
 * Utilisation:
 *   node scripts/analyze-data.js analyzeRecent
 *   node scripts/analyze-data.js generateResponse REF-1234-567890
 *   node scripts/analyze-data.js categorize
 */

const http = require('http');

// Vérifier les arguments de la ligne de commande
const command = process.argv[2];
const param = process.argv[3];

// Configuration pour les requêtes HTTP
const config = {
  host: 'localhost',
  port: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_token' // Utiliser un token d'authentification approprié
  }
};

// Fonction pour effectuer une requête HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      ...config,
      path,
      method
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}: ${parsedData.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Fonction principale
async function main() {
  try {
    // Exécuter la commande appropriée
    switch (command) {
      case 'analyzeRecent':
        console.log('Analyse des demandes récentes...');
        const analysisResult = await makeRequest('POST', '/api/admin/analyze-requests');
        console.log('Résultat:', analysisResult.message);
        break;

      case 'generateResponse':
        if (!param) {
          console.error('Erreur: Numéro de référence requis');
          process.exit(1);
        }
        console.log(`Génération d'une réponse pour la demande ${param}...`);
        const responseResult = await makeRequest('POST', `/api/admin/generate-response/${param}`);
        console.log('Réponse générée:', responseResult.message);
        console.log('\n', responseResult.response);
        break;

      case 'categorize':
        console.log('Catégorisation des demandes...');
        const categorizeResult = await makeRequest('POST', '/api/admin/categorize-requests');
        console.log('Résultat:', categorizeResult.message);
        break;

      default:
        console.error('Commande non reconnue. Utilisez une des commandes suivantes:');
        console.error('  analyzeRecent - Analyser les demandes récentes');
        console.error('  generateResponse <reference> - Générer une réponse pour une demande spécifique');
        console.error('  categorize - Catégoriser les demandes');
        process.exit(1);
    }

  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
main();