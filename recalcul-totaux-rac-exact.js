/**
 * Recalcul exact des totaux RAC- uniquement
 * Correction des statistiques affichées dans le tableau de bord
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function recalculerTotauxRacExacts() {
  console.log('🧮 RECALCUL EXACT - Paiements RAC- uniquement\n');
  
  try {
    // Période juin 2025
    const debutJuin = Math.floor(new Date('2025-06-01T00:00:00Z').getTime() / 1000);
    const finJuin = Math.floor(new Date('2025-06-06T23:59:59Z').getTime() / 1000);
    
    // Récupérer tous les paiements Stripe
    let allPayments = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = {
        limit: 100,
        created: { gte: debutJuin, lte: finJuin }
      };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const paymentsList = await stripe.paymentIntents.list(params);
      allPayments = allPayments.concat(paymentsList.data);
      hasMore = paymentsList.has_more;
      
      if (hasMore && paymentsList.data.length > 0) {
        startingAfter = paymentsList.data[paymentsList.data.length - 1].id;
      }
    }
    
    // Filtrer UNIQUEMENT les paiements avec référence RAC-
    const racPayments = allPayments.filter(payment => {
      const metadata = payment.metadata || {};
      const reference = metadata.referenceNumber || '';
      return reference.startsWith('RAC-');
    });
    
    console.log(`🎯 TOTAL PAIEMENTS RAC- TROUVÉS: ${racPayments.length}`);
    console.log(`📊 TOTAL TOUS PAIEMENTS STRIPE: ${allPayments.length}`);
    console.log(`🔍 DIFFÉRENCE: ${allPayments.length - racPayments.length} paiements non-RAC-\n`);
    
    // Analyser par jour - UNIQUEMENT paiements RAC-
    const analyseParJour = {
      '2025-06-05': { count: 0, totalEuros: 0, payments: [] }, // Aujourd'hui
      '2025-06-04': { count: 0, totalEuros: 0, payments: [] }, // Hier
      '2025-06-03': { count: 0, totalEuros: 0, payments: [] },
      '2025-06-02': { count: 0, totalEuros: 0, payments: [] },
      '2025-06-01': { count: 0, totalEuros: 0, payments: [] }
    };
    
    racPayments.forEach(payment => {
      const date = new Date(payment.created * 1000).toISOString().split('T')[0];
      const montantEuros = payment.amount / 100; // Convertir centimes en euros
      const reference = payment.metadata.referenceNumber || 'SANS_REF';
      
      if (analyseParJour[date]) {
        analyseParJour[date].count++;
        analyseParJour[date].totalEuros += montantEuros;
        analyseParJour[date].payments.push({
          reference,
          montant: montantEuros,
          status: payment.status
        });
      }
    });
    
    console.log('📋 TOTAUX EXACTS PAR JOUR (RAC- UNIQUEMENT):');
    Object.keys(analyseParJour).forEach(date => {
      const data = analyseParJour[date];
      const label = date === '2025-06-05' ? 'AUJOURD\'HUI (5 juin)' : 
                   date === '2025-06-04' ? 'HIER (4 juin)' : 
                   date === '2025-06-03' ? '3 juin' : date;
      
      console.log(`${label}: ${data.count} transactions RAC- = ${data.totalEuros.toFixed(2)}€`);
      
      if (data.payments.length > 0) {
        console.log('  Détail:');
        data.payments.forEach(p => {
          console.log(`    - ${p.reference}: ${p.montant.toFixed(2)}€ (${p.status})`);
        });
      }
      console.log('');
    });
    
    // Calculs pour le tableau de bord
    const aujourdhui = analyseParJour['2025-06-05'];
    const hier = analyseParJour['2025-06-04'];
    const troiJuin = analyseParJour['2025-06-03'];
    
    const totalSemaine = aujourdhui.count + hier.count + troiJuin.count;
    const revenuSemaine = aujourdhui.totalEuros + hier.totalEuros + troiJuin.totalEuros;
    
    console.log('🎯 DONNÉES POUR LE TABLEAU DE BORD:');
    console.log(`- Aujourd'hui: ${aujourdhui.count} transactions RAC- pour ${aujourdhui.totalEuros.toFixed(2)}€`);
    console.log(`- Hier: ${hier.count} transactions RAC- pour ${hier.totalEuros.toFixed(2)}€`);
    console.log(`- Cette semaine: ${totalSemaine} transactions RAC- pour ${revenuSemaine.toFixed(2)}€`);
    
    // Vérification des statuts réussis
    const paiementsReussis = racPayments.filter(p => p.status === 'succeeded').length;
    const tauxReussite = racPayments.length > 0 ? Math.round((paiementsReussis / racPayments.length) * 100) : 0;
    
    console.log(`\n📈 STATISTIQUES GLOBALES RAC-:`);
    console.log(`- Total transactions: ${racPayments.length}`);
    console.log(`- Paiements réussis: ${paiementsReussis}`);
    console.log(`- Taux de réussite: ${tauxReussite}%`);
    
    return {
      aujourdhui: { count: aujourdhui.count, montant: aujourdhui.totalEuros },
      hier: { count: hier.count, montant: hier.totalEuros },
      semaine: { count: totalSemaine, montant: revenuSemaine },
      tauxReussite
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

recalculerTotauxRacExacts()
  .then(results => {
    if (results) {
      console.log('\n✅ Recalcul terminé - Données corrigées pour le tableau de bord');
    }
  })
  .catch(console.error);