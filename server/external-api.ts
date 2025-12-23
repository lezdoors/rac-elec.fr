import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { leads, serviceRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendLeadNotification } from './email-service';
import { ulid } from 'ulid';
import Stripe from 'stripe';
import { z } from 'zod';

const router = Router();

const API_KEY = process.env.EXTERNAL_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ EXTERNAL_API_KEY not set - external API endpoints will reject all requests');
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' });
}

const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'API key required',
      code: 'MISSING_API_KEY'
    });
  }
  
  if (apiKey !== API_KEY) {
    console.warn(`[EXTERNAL API] Invalid API key attempt: ${apiKey.substring(0, 10)}...`);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
};

router.use(validateApiKey);

const leadSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  serviceType: z.string().optional(),
  clientType: z.string().optional().default('Particulier'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

const requestSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().min(5, 'Code postal requis'),
  serviceType: z.string().default('electricity'),
  requestType: z.string().default('Nouveau raccordement'),
  clientType: z.string().default('Particulier'),
  buildingType: z.string().default('Maison individuelle'),
  projectStatus: z.string().default('Projet'),
  powerRequired: z.string().default('6'),
  comments: z.string().optional(),
});

const paymentSessionSchema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  amount: z.number().positive('Montant invalide').default(129.80),
  customerEmail: z.string().email('Email invalide'),
  customerName: z.string().min(1, 'Nom client requis'),
  successUrl: z.string().url('URL de succès invalide'),
  cancelUrl: z.string().url('URL d\'annulation invalide'),
});

router.post('/leads', async (req: Request, res: Response) => {
  try {
    const validation = leadSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }
    
    const data = validation.data;
    const referenceNumber = `LD-${new Date().getFullYear()}-${ulid().substring(0, 8).toUpperCase()}`;
    
    const [lead] = await db.insert(leads).values({
      referenceNumber,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      clientType: data.clientType,
      serviceType: data.serviceType || 'electricity',
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      status: 'new',
    }).returning();
    
    try {
      await sendLeadNotification({
        prenom: data.firstName,
        nom: data.lastName,
        email: data.email,
        telephone: data.phone,
        typeRaccordement: data.serviceType || 'Non spécifié',
      });
    } catch (emailError) {
      console.error('[EXTERNAL API] Email notification failed:', emailError);
    }
    
    console.log(`[EXTERNAL API] Lead created: ${lead.id} - ${data.email}`);
    
    res.status(201).json({
      success: true,
      data: {
        id: lead.id,
        referenceNumber: lead.referenceNumber,
        email: lead.email,
      },
    });
    
  } catch (error) {
    console.error('[EXTERNAL API] Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/requests', async (req: Request, res: Response) => {
  try {
    const validation = requestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }
    
    const data = validation.data;
    const referenceNumber = `DR-${new Date().getFullYear()}-${ulid().substring(0, 8).toUpperCase()}`;
    const fullName = `${data.firstName} ${data.lastName}`;
    
    const [request] = await db.insert(serviceRequests).values({
      referenceNumber,
      name: fullName,
      email: data.email,
      phone: data.phone,
      clientType: data.clientType,
      serviceType: data.serviceType,
      requestType: data.requestType,
      buildingType: data.buildingType,
      projectStatus: data.projectStatus,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      powerRequired: data.powerRequired,
      comments: data.comments,
      status: 'new',
      paymentStatus: 'pending',
      paymentAmount: '129.80',
    }).returning();
    
    console.log(`[EXTERNAL API] Request created: ${referenceNumber} - ${data.email}`);
    
    res.status(201).json({
      success: true,
      data: {
        id: request.id,
        referenceNumber: request.referenceNumber,
        email: request.email,
        paymentAmount: request.paymentAmount,
      },
    });
    
  } catch (error) {
    console.error('[EXTERNAL API] Error creating request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/payment-session', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment service unavailable',
      });
    }
    
    const validation = paymentSessionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }
    
    const data = validation.data;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Demande de raccordement électrique',
            description: `Référence: ${data.reference}`,
          },
          unit_amount: Math.round(data.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer_email: data.customerEmail,
      metadata: {
        reference: data.reference,
        customerName: data.customerName,
        source: 'external_api',
      },
    });
    
    console.log(`[EXTERNAL API] Payment session created: ${session.id} for ${data.reference}`);
    
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        reference: data.reference,
      },
    });
    
  } catch (error) {
    console.error('[EXTERNAL API] Error creating payment session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment session',
    });
  }
});

router.post('/payment-intent', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment service unavailable',
      });
    }
    
    const { reference, amount = 129.80, customerEmail, customerName } = req.body;
    
    if (!reference || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Reference and customerEmail required',
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      receipt_email: customerEmail,
      metadata: {
        reference,
        customerName: customerName || '',
        source: 'external_api',
      },
    });
    
    console.log(`[EXTERNAL API] Payment intent created: ${paymentIntent.id} for ${reference}`);
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        reference,
      },
    });
    
  } catch (error) {
    console.error('[EXTERNAL API] Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
    });
  }
});

router.get('/payment-status/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Reference required',
      });
    }
    
    const [request] = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.referenceNumber, reference))
      .limit(1);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        referenceNumber: request.referenceNumber,
        status: request.status,
        paymentStatus: request.paymentStatus,
        paymentAmount: request.paymentAmount,
        customerEmail: request.email,
      },
    });
    
  } catch (error) {
    console.error('[EXTERNAL API] Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stripe: !!stripe,
  });
});

export const getApiKey = () => API_KEY;

export default router;
