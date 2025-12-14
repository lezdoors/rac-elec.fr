import { Request, Response, NextFunction } from 'express';

/**
 * Security middleware for production-ready security headers
 * Safe implementation that won't break existing functionality
 */

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy - Carefully crafted to not break existing functionality
  // Updated December 2025: Added full GTM/GA/Google Ads/Microsoft endpoints
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://js.stripe.com https://*.stripe.com https://www.google.com https://bat.bing.com https://www.clarity.ms https://*.clarity.ms",
    "style-src 'self' 'unsafe-inline' https://*.googleapis.com https://fonts.googleapis.com https://www.googletagmanager.com",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net https://api.stripe.com https://*.stripe.com https://bat.bing.com https://www.clarity.ms https://*.clarity.ms wss:",
    "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://js.stripe.com https://*.stripe.com https://td.doubleclick.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent referrer leakage to external sites
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent clients from sniffing the MIME type
  res.setHeader('X-Download-Options', 'noopen');

  next();
};

/**
 * Enhanced rate limiting for critical business endpoints
 */
export const createBusinessRateLimit = (maxRequests: number, windowMs: number, skipSuccessfulRequests = false, options?: { excludeMethods?: string[] }) => {
  const rateLimitMap = new Map();
  const excludeMethods = options?.excludeMethods || [];
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for excluded methods (like DELETE for admin operations)
    if (excludeMethods.includes(req.method)) {
      return next();
    }
    
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, []);
    }
    
    const requests = rateLimitMap.get(key);
    const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      // Log suspicious activity for business monitoring
      console.warn(`Rate limit exceeded for IP: ${key}, endpoint: ${req.path}, requests: ${recentRequests.length}`);
      
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000).toString());
      
      return res.status(429).json({
        error: 'Trop de tentatives. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    recentRequests.push(now);
    rateLimitMap.set(key, recentRequests);
    
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - recentRequests.length).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000).toString());
    
    next();
  };
};

/**
 * Input sanitization middleware for form submissions
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    // Recursive function to clean all string inputs
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        // Basic XSS protection - remove script tags and javascript: protocols
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

/**
 * Business-critical endpoint protection
 */
export const paymentEndpointSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Only log actual payment/API endpoints, not static assets
  const isPaymentEndpoint = req.path.includes('/payment') || req.path.includes('/stripe') || req.path.startsWith('/api/');
  const isStaticAsset = req.path.includes('/assets/') || req.path.includes('.css') || req.path.includes('.js') || req.path.includes('.svg') || req.path.includes('.ico');
  
  if (isPaymentEndpoint && !isStaticAsset) {
    console.log(`🔒 Security-sensitive endpoint: ${req.method} ${req.path} from IP: ${req.ip}`);
  }
  
  // Additional validation for payment endpoints
  if (req.path.includes('/payment') || req.path.includes('/stripe')) {
    // Ensure HTTPS in production - check both req.secure and X-Forwarded-Proto header for proxy compatibility
    const isHttps = req.secure || req.get('X-Forwarded-Proto') === 'https';
    if (process.env.NODE_ENV === 'production' && !isHttps) {
      return res.status(403).json({
        error: 'HTTPS requis pour les paiements sécurisés'
      });
    }
    
    // Check for suspicious patterns
    const suspicious = [
      'union select',
      'drop table',
      '<script',
      'javascript:',
      'eval(',
      'onclick='
    ];
    
    const bodyStr = JSON.stringify(req.body || {}).toLowerCase();
    const queryStr = JSON.stringify(req.query || {}).toLowerCase();
    
    for (const pattern of suspicious) {
      if (bodyStr.includes(pattern) || queryStr.includes(pattern)) {
        console.error(`Suspicious payment request blocked: ${pattern} found in request from IP: ${req.ip}`);
        return res.status(400).json({
          error: 'Requête invalide détectée'
        });
      }
    }
  }
  
  next();
};