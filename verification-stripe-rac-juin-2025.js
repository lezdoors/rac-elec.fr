/**
 * 🔍 VÉRIFICATION STRIPE - Paiements RAC- juin 2025
 * Analyse complète des vrais paiements pour corriger le tableau de bord
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY manquant');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function verifierPaiementsRacJuin2025() {
  console.log('🔍 VÉRIFICATION STRIPE - Paiements RAC- juin 2025\n');
  
  try {
    // Période juin 2025
    const debutJuin = Math.floor(new Date('2025-06-01T00:00:00Z').getTime() / 1000);
    const finJuin = Math.floor(new Date('2025-06-06T23:59:59Z').getTime() / 1000);
    
    console.log('📅 Période analysée: 1er juin - 6 juin 2025');
    console.log('Timestamp début:', debutJuin, '- Timestamp fin:', finJuin);
    
    // Récupérer tous les paiements de juin
    let allPayments = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = {
        limit: 100,
        created: {
          gte: debutJuin,
          lte: finJuin
        }
      };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const payments = await stripe.paymentIntents.list(params);
      allPayments = allPayments.concat(payments.data);
      hasMore = payments.has_more;
      
      if (hasMore && payments.data.length > 0) {
        startingAfter = payments.data[payments.data.length - 1].id;
      }
    }
    
    console.log(`\n📊 TOTAL PAIEMENTS STRIPE JUIN: ${allPayments.length}`);
    
    // Filtrer les paiements avec référence RAC-
    const racPayments = allPayments.filter(payment => {
      const metadata = payment.metadata || {};
      const reference = metadata.referenceNumber || '';
      return reference.startsWith('RAC-');
    });
    
    console.log(`🎯 PAIEMENTS AVEC RAC-: ${racPayments.length}`);
    
    // Analyser par jour
    const analyseParJour = {
      '2025-06-05': { count: 0, amount: 0, payments: [] }, // Aujourd'hui
      '2025-06-04': { count: 0, amount: 0, payments: [] }, // Hier
      '2025-06-03': { count: 0, amount: 0, payments: [] },
      '2025-06-02': { count: 0, amount: 0, payments: [] },
      '2025-06-01': { count: 0, amount: 0, payments: [] }
    };
    
    racPayments.forEach(payment => {
      const date = new Date(payment.created * 1000).toISOString().split('T')[0];
      const amount = payment.amount / 100; // Convertir centimes en euros
      const reference = payment.metadata.referenceNumber || 'SANS_REF';
      const customerName = payment.metadata.customerName || 'INCONNU';
      const customerEmail = payment.metadata.customerEmail || 'INCONNU';
      
      if (analyseParJour[date]) {
        analyseParJour[date].count++;
        analyseParJour[date].amount += amount;
        analyseParJour[date].payments.push({
          id: payment.id,
          reference,
          amount,
          status: payment.status,
          customerName,
          customerEmail,
          created: new Date(payment.created * 1000).toISOString()
        });
      }
    });
    
    console.log('\n📋 RÉPARTITION PAR JOUR:');
    Object.keys(analyseParJour).forEach(date => {
      const data = analyseParJour[date];
      const label = date === '2025-06-05' ? 'AUJOURD\'HUI' : 
                   date === '2025-06-04' ? 'HIER' : date;
      console.log(`${label}: ${data.count} paiements - ${data.amount.toFixed(2)}€`);
      
      if (data.payments.length > 0) {
        data.payments.forEach(p => {
          console.log(`  - ${p.reference}: ${p.amount}€ (${p.status}) - ${p.customerName}`);
        });
      }
    });
    
    // Statistiques de la semaine
    const totalSemaine = Object.values(analyseParJour).reduce((sum, day) => sum + day.count, 0);
    const revenuSemaine = Object.values(analyseParJour).reduce((sum, day) => sum + day.amount, 0);
    
    console.log('\n📊 RÉSUMÉ CETTE SEMAINE:');
    console.log(`Total transactions: ${totalSemaine}`);
    console.log(`Chiffre d'affaires: ${revenuSemaine.toFixed(2)}€`);
    
    // Vérifier les statuts
    const statutsCount = {};
    racPayments.forEach(payment => {
      const status = payment.status;
      statutsCount[status] = (statutsCount[status] || 0) + 1;
    });
    
    console.log('\n📈 RÉPARTITION PAR STATUT:');
    Object.keys(statutsCount).forEach(status => {
      console.log(`${status}: ${statutsCount[status]} paiements`);
    });
    
    return {
      aujourd_hui: analyseParJour['2025-06-05'],
      hier: analyseParJour['2025-06-04'],
      cette_semaine: { count: totalSemaine, amount: revenuSemaine },
      tous_paiements: racPayments.length
    };
    
  } catch (error) {
    console.error('❌ Erreur Stripe:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('🔑 Problème d\'authentification - vérifier STRIPE_SECRET_KEY');
    }
    return null;
  }
}

verifierPaiementsRacJuin2025()
  .then(results => {
    if (results) {
      console.log('\n✅ Vérification terminée avec succès');
      console.log('📊 Données à utiliser pour corriger le tableau de bord:');
      console.log(`- Aujourd'hui: ${results.aujourd_hui.count} transactions (${results.aujourd_hui.amount.toFixed(2)}€)`);
      console.log(`- Hier: ${results.hier.count} transactions (${results.hier.amount.toFixed(2)}€)`);
      console.log(`- Cette semaine: ${results.cette_semaine.count} transactions (${results.cette_semaine.amount.toFixed(2)}€)`);
    }
  })
  .catch(console.error);