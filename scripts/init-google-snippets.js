/**
 * Script d'initialisation des snippets Google
 * Crée les snippets par défaut pour le suivi Google Analytics
 */

import fetch from 'node-fetch';

async function initGoogleSnippets() {
  try {
    console.log("Initialisation des snippets Google...");
    
    // Se connecter en tant qu'admin
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'adminpassword'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Connexion admin échouée: ${loginResponse.statusText}`);
    }
    
    const user = await loginResponse.json();
    console.log(`Connecté en tant que: ${user.username} (${user.role})`);
    
    // Récupérer le cookie de session
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Initialiser les snippets Google par défaut
    const initResponse = await fetch('http://localhost:5000/api/admin/google-snippets/init-defaults', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    if (!initResponse.ok) {
      throw new Error(`Initialisation échouée: ${initResponse.statusText}`);
    }
    
    const result = await initResponse.json();
    console.log(`Initialisation réussie: ${result.snippets.length} snippets configurés`);
    
    console.log("Snippets Google initialisés avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des snippets Google:", error);
  }
}

// Exécuter la fonction d'initialisation
initGoogleSnippets();