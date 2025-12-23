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
  firstName: z.string().min(1, 'Prénom requis').nullable().optional(),
  lastName: z.string().min(1, 'Nom requis').nullable().optional(),
  serviceType: z.string().optional(),
  clientType: z.string().optional().default('Particulier'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  // Lovable integration fields
  lovable_lead_id: z.string().optional(),
  utm_source: z.string().nullable().optional(),
  utm_medium: z.string().nullable().optional(),
  utm_campaign: z.string().nullable().optional(),
});

// New Lovable nested structure schema
const lovableRequestSchema = z.object({
  // Unified reference from Lovable (REF-XXXXXXXX)
  referenceNumber: z.string().optional(),
  lovable_request_id: z.string().optional(),
  source: z.string().optional(),
  event_type: z.enum(['form_complete', 'payment_success', 'payment_failed']).optional(),
  payment_status: z.string().optional(),
  
  // Payment details (for payment events)
  payment_amount_cents: z.number().optional(),
  payment_currency: z.string().optional(),
  payment_plan: z.number().optional(),
  stripe_payment_intent_id: z.string().optional(),
  payment_timestamp: z.string().optional(),
  failure_reason: z.string().optional(),
  
  // Customer object
  customer: z.object({
    civility: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email(),
    phone: z.string(),
    client_type: z.string().optional(),
    company_name: z.string().nullable().optional(),
    siren: z.string().nullable().optional(),
  }).optional(),
  
  // Project address
  project_address: z.object({
    address: z.string(),
    address2: z.string().nullable().optional(),
    city: z.string(),
    zip_code: z.string(),
  }).optional(),
  
  // Billing address
  billing_address: z.object({
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
  }).nullable().optional(),
  
  // Request details
  request: z.object({
    type_raccordement: z.string().optional(),
    usage: z.string().optional(),
    phase: z.string().optional(),
    power_kva: z.number().or(z.string()).optional(),
    is_viabilise: z.boolean().optional(),
    desired_start_date: z.string().nullable().optional(),
    knows_pdl: z.boolean().optional(),
    pdl: z.string().nullable().optional(),
    puissance_actuelle_kva: z.number().or(z.string()).nullable().optional(),
  }).optional(),
  
  notes: z.string().nullable().optional(),
  rgpd_consent: z.boolean().optional(),
  
  // Tracking
  tracking: z.object({
    utm_source: z.string().nullable().optional(),
    utm_medium: z.string().nullable().optional(),
    utm_campaign: z.string().nullable().optional(),
  }).optional(),
  
  raw_payload: z.any().optional(),
  
  // Legacy flat fields for backward compatibility
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  full_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  zip_code: z.string().optional(),
  serviceType: z.string().optional(),
  type_raccordement: z.string().optional(),
  requestType: z.string().optional(),
  clientType: z.string().optional(),
  client_type: z.string().optional(),
  buildingType: z.string().optional(),
  projectStatus: z.string().optional(),
  powerRequired: z.string().optional(),
  power_kva: z.string().or(z.number()).optional(),
  phase: z.string().optional(),
  usage: z.string().optional(),
  is_viabilise: z.boolean().optional(),
  comments: z.string().optional(),
  company_name: z.string().optional(),
  siren: z.string().optional(),
  status: z.string().optional(),
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
        referenceNumber: referenceNumber,
        prenom: data.firstName || '',
        nom: data.lastName || '',
        email: data.email,
        telephone: data.phone,
        typeRaccordement: data.serviceType || 'Non spécifié',
        source: 'Lovable',
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
    // Log raw payload for debugging
    console.log(`[EXTERNAL API] 📥 Raw payload received:`, JSON.stringify(req.body, null, 2));
    
    const validation = lovableRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      console.error(`[EXTERNAL API] ❌ Validation failed:`, validation.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }
    
    const data = validation.data;
    const eventType = data.event_type || 'form_complete';
    
    // Use Lovable reference or generate one
    const referenceNumber = data.referenceNumber || `DR-${new Date().getFullYear()}-${ulid().substring(0, 8).toUpperCase()}`;
    
    // Extract data from nested structure OR flat fields
    const customer = data.customer;
    const projectAddress = data.project_address;
    const billingAddress = data.billing_address;
    const requestDetails = data.request;
    const tracking = data.tracking;
    
    // Build customer info
    const email = customer?.email || data.email || '';
    const phone = customer?.phone || data.phone || '';
    const firstName = customer?.first_name || data.firstName || '';
    const lastName = customer?.last_name || data.lastName || '';
    const civility = customer?.civility || '';
    const fullName = data.full_name || 
      (civility ? `${civility} ${firstName} ${lastName}`.trim() : `${firstName} ${lastName}`.trim()) || 
      'Non spécifié';
    const clientType = customer?.client_type || data.client_type || data.clientType || 'Particulier';
    const companyName = customer?.company_name || data.company_name;
    const siren = customer?.siren || data.siren;
    
    // Build address info
    const address = projectAddress?.address || data.address || '';
    const addressComplement = projectAddress?.address2 || null;
    const city = projectAddress?.city || data.city || '';
    const postalCode = projectAddress?.zip_code || data.zip_code || data.postalCode || '';
    
    // Billing address
    const billingAddr = billingAddress?.address || null;
    const billingCity = billingAddress?.city || null;
    const billingPostal = billingAddress?.zip_code || null;
    
    // Request details
    const typeRaccordement = requestDetails?.type_raccordement || data.type_raccordement || 'definitif';
    const phase = requestDetails?.phase || data.phase || 'monophase';
    const powerKva = String(requestDetails?.power_kva || data.power_kva || data.powerRequired || '6');
    const usage = requestDetails?.usage || data.usage || 'residential';
    const isViabilise = requestDetails?.is_viabilise ?? data.is_viabilise;
    const desiredDate = requestDetails?.desired_start_date || null;
    const pdl = requestDetails?.pdl || null;
    
    // Build notes with all metadata
    let notes = data.notes || data.comments || '';
    if (data.lovable_request_id) notes += `\n[Lovable ID: ${data.lovable_request_id}]`;
    if (pdl) notes += `\n[PDL: ${pdl}]`;
    if (usage) notes += `\n[Usage: ${usage}]`;
    if (isViabilise !== undefined) notes += `\n[Viabilisé: ${isViabilise ? 'Oui' : 'Non'}]`;
    if (tracking?.utm_source) notes += `\n[UTM: ${tracking.utm_source}/${tracking.utm_medium}/${tracking.utm_campaign}]`;
    if (data.rgpd_consent) notes += `\n[RGPD: Consentement donné]`;
    
    // Handle different event types
    if (eventType === 'form_complete') {
      // Create new request
      const [request] = await db.insert(serviceRequests).values({
        referenceNumber,
        name: fullName,
        email,
        phone,
        clientType,
        company: companyName,
        siret: siren,
        serviceType: typeRaccordement,
        requestType: 'Nouveau raccordement',
        buildingType: 'Maison individuelle',
        projectStatus: 'Projet',
        address,
        addressComplement,
        city,
        postalCode,
        billingAddress: billingAddr,
        billingCity,
        billingPostalCode: billingPostal,
        powerRequired: powerKva,
        phaseType: phase,
        terrainViabilise: isViabilise ? 'Oui' : 'Non',
        desiredCompletionDate: desiredDate,
        comments: notes.trim() || undefined,
        status: 'new',
        paymentStatus: data.payment_status || 'pending',
        paymentAmount: '129.80',
        gclid: tracking?.utm_source === 'google' ? data.lovable_request_id : null,
      }).returning();
      
      console.log(`[EXTERNAL API] ✅ Request created: ${referenceNumber} - ${email} (event: ${eventType})`);
      
      return res.status(201).json({
        success: true,
        data: {
          id: request.id,
          referenceNumber: request.referenceNumber,
          email: request.email,
          paymentAmount: request.paymentAmount,
          lovable_request_id: data.lovable_request_id,
          event_type: eventType,
        },
      });
      
    } else if (eventType === 'payment_success' || eventType === 'payment_failed') {
      // Update existing request with payment info
      const paymentStatus = eventType === 'payment_success' ? 'succeeded' : 'failed';
      const paymentAmount = data.payment_amount_cents ? (data.payment_amount_cents / 100).toFixed(2) : '129.80';
      
      // Find existing request by reference
      const [existingRequest] = await db.select()
        .from(serviceRequests)
        .where(eq(serviceRequests.referenceNumber, referenceNumber))
        .limit(1);
      
      if (existingRequest) {
        // Update existing request
        const [updated] = await db.update(serviceRequests)
          .set({
            paymentStatus,
            paymentAmount,
            stripePaymentIntentId: data.stripe_payment_intent_id,
            paymentDate: data.payment_timestamp ? new Date(data.payment_timestamp) : new Date(),
            paymentError: eventType === 'payment_failed' ? data.failure_reason : null,
            status: eventType === 'payment_success' ? 'validated' : 'new',
            updatedAt: new Date(),
          })
          .where(eq(serviceRequests.referenceNumber, referenceNumber))
          .returning();
        
        console.log(`[EXTERNAL API] ✅ Request updated: ${referenceNumber} - payment ${paymentStatus}`);
        
        return res.json({
          success: true,
          data: {
            id: updated.id,
            referenceNumber: updated.referenceNumber,
            paymentStatus: updated.paymentStatus,
            event_type: eventType,
            updated: true,
          },
        });
      } else {
        // Create new request with payment info (fallback)
        const [request] = await db.insert(serviceRequests).values({
          referenceNumber,
          name: fullName,
          email,
          phone,
          clientType,
          company: companyName,
          siret: siren,
          serviceType: typeRaccordement,
          requestType: 'Nouveau raccordement',
          buildingType: 'Maison individuelle',
          projectStatus: 'Projet',
          address,
          addressComplement,
          city,
          postalCode,
          billingAddress: billingAddr,
          billingCity,
          billingPostalCode: billingPostal,
          powerRequired: powerKva,
          phaseType: phase,
          terrainViabilise: isViabilise ? 'Oui' : 'Non',
          comments: notes.trim() || undefined,
          status: eventType === 'payment_success' ? 'validated' : 'new',
          paymentStatus,
          paymentAmount,
          stripePaymentIntentId: data.stripe_payment_intent_id,
          paymentDate: data.payment_timestamp ? new Date(data.payment_timestamp) : new Date(),
          paymentError: eventType === 'payment_failed' ? data.failure_reason : null,
        }).returning();
        
        console.log(`[EXTERNAL API] ✅ Request created with payment: ${referenceNumber} - ${paymentStatus}`);
        
        return res.status(201).json({
          success: true,
          data: {
            id: request.id,
            referenceNumber: request.referenceNumber,
            paymentStatus: request.paymentStatus,
            event_type: eventType,
            created: true,
          },
        });
      }
    }
    
    res.status(400).json({
      success: false,
      error: 'Unknown event_type',
    });
    
  } catch (error) {
    console.error('[EXTERNAL API] Error processing request:', error);
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
