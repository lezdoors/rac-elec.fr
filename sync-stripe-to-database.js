/**
 * Synchronisation Stripe vers base de données locale
 * Importe les vraies données Stripe pour corriger le tableau de bord
 */

import Stripe from 'stripe';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { payments } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function syncStripeToDatabase() {
  console.log('🔄 SYNCHRONISATION STRIPE → BASE DE DONNÉES');
  
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
    
    // Filtrer les paiements RAC-
    const racPayments = allPayments.filter(payment => {
      const metadata = payment.metadata || {};
      const reference = metadata.referenceNumber || '';
      return reference.startsWith('RAC-');
    });
    
    console.log(`📥 ${racPayments.length} paiements RAC- trouvés dans Stripe`);
    
    let imported = 0;
    let updated = 0;
    
    for (const payment of racPayments) {
      const metadata = payment.metadata || {};
      const paymentData = {
        paymentId: payment.id,
        referenceNumber: metadata.referenceNumber || '',
        amount: (payment.amount / 100).toString(),
        status: payment.status,
        method: 'card',
        customerName: metadata.customerName || '',
        customerEmail: metadata.customerEmail || '',
        cardBrand: payment.charges?.data[0]?.payment_method_details?.card?.brand || '',
        cardLast4: payment.charges?.data[0]?.payment_method_details?.card?.last4 || '',
        cardExpMonth: payment.charges?.data[0]?.payment_method_details?.card?.exp_month || null,
        cardExpYear: payment.charges?.data[0]?.payment_method_details?.card?.exp_year || null,
        billingName: payment.charges?.data[0]?.billing_details?.name || '',
        metadata: JSON.stringify(metadata),
        createdAt: new Date(payment.created * 1000),
        updatedAt: new Date()
      };
      
      // Vérifier si le paiement existe déjà
      const existingPayment = await db
        .select()
        .from(payments)
        .where(eq(payments.paymentId, payment.id))
        .limit(1);
      
      if (existingPayment.length === 0) {
        // Insérer nouveau paiement
        await db.insert(payments).values(paymentData);
        imported++;
        console.log(`✅ Importé: ${metadata.referenceNumber} - ${paymentData.amount}€`);
      } else {
        // Mettre à jour paiement existant
        await db
          .update(payments)
          .set({
            status: paymentData.status,
            updatedAt: new Date()
          })
          .where(eq(payments.paymentId, payment.id));
        updated++;
      }
    }
    
    console.log(`\n📊 SYNCHRONISATION TERMINÉE:`);
    console.log(`- ${imported} nouveaux paiements importés`);
    console.log(`- ${updated} paiements mis à jour`);
    
    // Vérifier les totaux par jour
    const verification = await db
      .select()
      .from(payments)
      .where(eq(payments.referenceNumber, 'RAC-%'));
    
    const totalLocal = verification.length;
    console.log(`\n🔍 VÉRIFICATION:`);
    console.log(`- Stripe: ${racPayments.length} paiements RAC-`);
    console.log(`- Base locale: ${totalLocal} paiements RAC-`);
    
    await sql.end();
    
    return {
      imported,
      updated,
      total: imported + updated
    };
    
  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error.message);
    await sql.end();
    throw error;
  }
}

syncStripeToDatabase()
  .then(results => {
    console.log('\n✅ Synchronisation réussie');
    console.log(`📈 ${results.total} paiements traités`);
  })
  .catch(console.error);