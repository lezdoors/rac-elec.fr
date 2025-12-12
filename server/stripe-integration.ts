import Stripe from 'stripe';
import { db } from './db';
import { payments } from '../shared/schema';
import { sql } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export interface StripePaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer?: string;
  description?: string | null;
  metadata?: Record<string, string>;
  payment_method?: any;
  charges?: any;
}

export async function fetchStripePayments(
  startDate: Date,
  endDate: Date,
  limit: number = 100
): Promise<StripePaymentData[]> {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
      limit,
      expand: ['data.payment_method', 'data.charges'],
    });

    // Filter only payments with RAC- references
    const racPayments = paymentIntents.data.filter(payment => {
      const description = payment.description || '';
      const metadata = payment.metadata || {};
      return description.includes('RAC-') || 
             Object.values(metadata).some(value => value.includes('RAC-'));
    });

    return racPayments.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100, // Convert from cents
      currency: payment.currency,
      status: payment.status,
      created: payment.created,
      customer: payment.customer as string,
      description: payment.description,
      metadata: payment.metadata,
      payment_method: payment.payment_method as any,
      charges: payment.charges as any,
    }));
  } catch (error) {
    console.error('Error fetching Stripe payments:', error);
    throw error;
  }
}

export async function syncStripePayments(startDate: Date, endDate: Date) {
  try {
    const stripePayments = await fetchStripePayments(startDate, endDate);
    let inserted = 0;
    let updated = 0;
    
    for (const payment of stripePayments) {
      // Extract reference from description or metadata
      const reference = extractRacReference(payment.description, payment.metadata);
      
      if (!reference) continue;

      // Check if payment already exists
      const existingPayment = await db.select()
        .from(payments)
        .where(sql`payment_id = ${payment.id}`)
        .limit(1);

      if (existingPayment.length === 0) {
        // Insert new payment
        await db.insert(payments).values({
          paymentId: payment.id,
          referenceNumber: reference,
          amount: payment.amount.toString(),
          status: payment.status,
          method: 'card',
          customerName: extractCustomerName(payment),
          customerEmail: extractCustomerEmail(payment),
          cardBrand: payment.payment_method?.card?.brand || null,
          cardLast4: payment.payment_method?.card?.last4 || null,
          cardExpMonth: payment.payment_method?.card?.exp_month || null,
          cardExpYear: payment.payment_method?.card?.exp_year || null,
          metadata: JSON.stringify(payment.metadata),
          createdAt: new Date(payment.created * 1000),
          updatedAt: new Date(),
        });
        inserted++;
      } else {
        // Update existing payment status and amount if different
        const existing = existingPayment[0];
        if (existing.status !== payment.status || parseFloat(existing.amount) !== payment.amount) {
          await db.execute(sql`
            UPDATE payments 
            SET status = ${payment.status}, 
                amount = ${payment.amount.toString()},
                updated_at = NOW()
            WHERE payment_id = ${payment.id}
          `);
          updated++;
        }
      }
    }

    console.log(`Stripe sync complete: ${inserted} inserted, ${updated} updated from ${stripePayments.length} payments`);
    return { total: stripePayments.length, inserted, updated };
  } catch (error) {
    console.error('Error syncing Stripe payments:', error);
    throw error;
  }
}

function extractRacReference(description?: string, metadata?: Record<string, string>): string | null {
  if (description && description.includes('RAC-')) {
    const match = description.match(/RAC-[\w-]+/);
    if (match) return match[0];
  }
  
  if (metadata) {
    for (const value of Object.values(metadata)) {
      if (value.includes('RAC-')) {
        const match = value.match(/RAC-[\w-]+/);
        if (match) return match[0];
      }
    }
  }
  
  return null;
}

function extractCustomerName(payment: StripePaymentData): string | null {
  if (payment.charges?.data?.[0]?.billing_details?.name) {
    return payment.charges.data[0].billing_details.name;
  }
  return null;
}

function extractCustomerEmail(payment: StripePaymentData): string | null {
  if (payment.charges?.data?.[0]?.billing_details?.email) {
    return payment.charges.data[0].billing_details.email;
  }
  return null;
}