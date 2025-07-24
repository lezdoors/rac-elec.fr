/**
 * 🔍 DIAGNOSTIC COMPLET STRIPE - Tous les paiements sans filtrage
 * Analyse approfondie pour trouver où sont stockées les références RAC-
 */

import fetch from 'node-fetch';

async function makeRequest(method, endpoint, data = null) {
  const url = `http://localhost:5000${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer admin-session-1749140126108'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

async function diagnosticStripeComplet() {
  console.log('🔍 DIAGNOSTIC COMPLET STRIPE - RECHERCHE RÉFÉRENCES RAC-\n');
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log(`📅 Aujourd'hui: ${today}`);
  console.log(`📅 Hier: ${yesterday}`);
  console.log(`📅 Semaine dernière: ${lastWeek}\n`);
  
  // 1. Vérifier les paiements en base locale d'abord
  console.log('🏪 1. PAIEMENTS EN BASE LOCALE');
  const localPayments = await makeRequest('GET', '/api/payments');
  console.log(`Status: ${localPayments.status}`);
  
  if (localPayments.data && Array.isArray(localPayments.data)) {
    console.log(`Total paiements en base: ${localPayments.data.length}`);
    const racPayments = localPayments.data.filter(p => p.referenceNumber && p.referenceNumber.includes('RAC-'));
    console.log(`Paiements RAC- en base: ${racPayments.length}`);
    
    racPayments.forEach((payment, index) => {
      console.log(`  ${index + 1}. Réf: ${payment.referenceNumber} - ${payment.amount}€ - ${payment.status} - Créé: ${payment.createdAt}`);
    });
    
    // Analyser les dates des paiements RAC-
    const todayRac = racPayments.filter(p => p.createdAt && p.createdAt.startsWith(today));
    const yesterdayRac = racPayments.filter(p => p.createdAt && p.createdAt.startsWith(yesterday));
    
    console.log(`\n📊 RÉPARTITION PAR DATE:`);
    console.log(`Aujourd'hui (${today}): ${todayRac.length} paiements RAC-`);
    console.log(`Hier (${yesterday}): ${yesterdayRac.length} paiements RAC-`);
  }
  
  // 2. Test API Stripe sans filtrage pour voir tous les paiements
  console.log('\n🔌 2. TEST API STRIPE DIRECTE (sans filtrage RAC-)');
  
  // Créer un endpoint temporaire pour récupérer TOUS les paiements Stripe
  const testStripeAll = await makeRequest('POST', '/api/test/stripe-all-payments', {
    startDate: lastWeek,
    endDate: today
  });
  
  console.log(`Status test Stripe: ${testStripeAll.status}`);
  
  if (testStripeAll.data) {
    console.log('Réponse Stripe:', JSON.stringify(testStripeAll.data, null, 2));
  }
  
  // 3. Vérifier le dashboard pour comprendre d'où viennent les chiffres
  console.log('\n📊 3. DONNÉES DASHBOARD');
  const dashboardPayments = await makeRequest('GET', '/api/dashboard/payments');
  console.log(`Status dashboard: ${dashboardPayments.status}`);
  console.log('Dashboard payments:', JSON.stringify(dashboardPayments.data, null, 2));
  
  // 4. Analyser la structure des données Stripe
  console.log('\n🔍 4. ANALYSE PROBLÈME FILTRAGE');
  console.log('Le problème identifié:');
  console.log('- L\'API /api/stripe/payments filtre uniquement les paiements avec "RAC-" dans description ou metadata');
  console.log('- Mais les références RAC- peuvent être stockées ailleurs dans Stripe');
  console.log('- Ou les paiements RAC- sont en base locale mais pas synchronisés avec Stripe');
  
  // 5. Test direct de la base de données
  console.log('\n💾 5. VÉRIFICATION BASE DE DONNÉES DIRECTE');
  const dbTest = await makeRequest('POST', '/api/test/db-payments-rac', {
    dateFrom: lastWeek,
    dateTo: today
  });
  
  console.log(`Status DB test: ${dbTest.status}`);
  if (dbTest.data) {
    console.log('Données DB:', JSON.stringify(dbTest.data, null, 2));
  }
}

// Exécuter le diagnostic
diagnosticStripeComplet().catch(console.error);