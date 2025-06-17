// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { CSP_HEADERS, RateLimiter } from '$lib/utils/security';
import { dev } from '$app/environment';
import crypto from 'crypto';

// Rate limiting stores (in production, use Redis)
const rateLimiters = {
  general: new RateLimiter(100, 15 * 60 * 1000), // 100 requests per 15 min
  auth: new RateLimiter(5, 15 * 60 * 1000), // 5 auth attempts per 15 min
  api: new RateLimiter(50, 60 * 1000) // 50 API calls per minute
};

// Security configuration
const SECURITY_CONFIG = {
  allowedOrigins: [
    'https://stpatrickacademy.edu.ph',
    'https://admin.stpatrickacademy.edu.ph',
    'https://secure.stpatrickacademy.edu.ph',
    'https://spa-web-sigma.vercel.app' // Added Vercel URL
  ],
  allowedRedirects: ['/', '/admin', '/enroll', '/profile', '/dashboard', '/signin']
};

// Helper to get client IP
function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') || // Cloudflare
         'unknown';
}

// Validate redirect URLs to prevent open redirects
function isValidRedirect(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://stpatrickacademy.edu.ph');
    return SECURITY_CONFIG.allowedRedirects.some(allowed => 
      parsed.pathname.startsWith(allowed)
    );
  } catch {
    return false;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now();
  const host = event.request.headers.get('host') || '';
  const isAdminSubdomain = host.startsWith('admin.') || host.startsWith('secure.');
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isAuthRoute = event.url.pathname === '/signin' || event.url.pathname.startsWith('/api/auth');
  const isApiRoute = event.url.pathname.startsWith('/api');
  
  // Check if running on Vercel
  const isVercelDeployment = host.includes('vercel.app');
  
  // Generate request ID for tracing
  const requestId = crypto.randomUUID();
  event.locals.requestId = requestId;
  
  // Get client IP
  const clientIp = getClientIp(event.request);
  
  // Apply rate limiting based on route type
  let rateLimiter = rateLimiters.general;
  if (isAuthRoute) {
    rateLimiter = rateLimiters.auth;
  } else if (isApiRoute) {
    rateLimiter = rateLimiters.api;
  }
  
  if (!dev && !rateLimiter.isAllowed(clientIp)) {
    const status = rateLimiter.getStatus(clientIp);
    console.warn(`[SECURITY] Rate limit exceeded - IP: ${clientIp} - Path: ${event.url.pathname} - ID: ${requestId}`);
    
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((status.reset - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': status.total.toString(),
        'X-RateLimit-Remaining': status.remaining.toString(),
        'X-RateLimit-Reset': new Date(status.reset).toISOString(),
        'X-Request-ID': requestId
      }
    });
  }
  
  // Enhanced security headers
  const securityHeaders: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Download-Options': 'noopen',
    'X-DNS-Prefetch-Control': 'off',
    'X-Request-ID': requestId
  };
  
  // CORS handling for allowed origins
  const origin = event.request.headers.get('origin');
  if (origin && SECURITY_CONFIG.allowedOrigins.includes(origin)) {
    securityHeaders['Access-Control-Allow-Origin'] = origin;
    securityHeaders['Access-Control-Allow-Credentials'] = 'true';
    securityHeaders['Vary'] = 'Origin';
  }
  
  // Handle preflight requests
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        ...securityHeaders,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // Validate redirect parameter to prevent open redirects
  const redirectParam = event.url.searchParams.get('redirect');
  if (redirectParam && !isValidRedirect(redirectParam)) {
    console.warn(`[SECURITY] Invalid redirect attempt - IP: ${clientIp} - Redirect: ${redirectParam} - ID: ${requestId}`);
    event.url.searchParams.delete('redirect');
  }
  
  // Handle subdomain routing - Skip if on Vercel
  if (!dev && !isVercelDeployment) {
    // Force HTTPS
    if (event.url.protocol === 'http:') {
      return new Response(null, {
        status: 301,
        headers: {
          location: `https://${host}${event.url.pathname}${event.url.search}`,
          ...securityHeaders
        }
      });
    }
    
    // Redirect admin routes to admin subdomain
    if (isAdminRoute && !isAdminSubdomain) {
      return new Response(null, {
        status: 301,
        headers: {
          location: `https://admin.stpatrickacademy.edu.ph${event.url.pathname}${event.url.search}`,
          ...securityHeaders
        }
      });
    }
    
    // Redirect non-admin routes from admin subdomain
    if (isAdminSubdomain && !isAdminRoute && event.url.pathname !== '/signin') {
      return new Response(null, {
        status: 301,
        headers: {
          location: `https://stpatrickacademy.edu.ph${event.url.pathname}${event.url.search}`,
          ...securityHeaders
        }
      });
    }
  }
  
  // Log security events
  if (isAuthRoute) {
    console.log(`[AUTH] ${event.request.method} ${event.url.pathname} - IP: ${clientIp} - ID: ${requestId}`);
  }
  
  // Add CSP nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64');
  event.locals.cspNonce = nonce;
  
  // Process request
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Inject CSP nonce into inline scripts/styles if needed
      return html.replace(/%sveltekit.cspnonce%/g, nonce);
    }
  });
  
  // Add all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP headers from security utils
  Object.entries(CSP_HEADERS).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // For CSP, optionally add nonce (though we're using unsafe-inline for now)
      if (key === 'Content-Security-Policy' && false) { // Set to true to use nonces
        value = value
          .replace(/'unsafe-inline'/g, `'nonce-${nonce}'`)
          .replace(/script-src ([^;]+)/, `script-src $1 'nonce-${nonce}'`)
          .replace(/style-src ([^;]+)/, `style-src $1 'nonce-${nonce}'`);
      }
      response.headers.set(key, value);
    }
  });
  
  // Additional admin-specific headers
  if (isAdminRoute || isAdminSubdomain) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // Add timing header for monitoring
  const duration = Date.now() - startTime;
  response.headers.set('X-Response-Time', `${duration}ms`);
  
  // Security report endpoint
  if (!dev) {
    response.headers.set('Report-To', JSON.stringify({
      group: 'csp-endpoint',
      max_age: 86400,
      endpoints: [{ url: 'https://stpatrickacademy.edu.ph/api/security-report' }]
    }));
  }
  
  return response;
};

// Enhanced error handling with security considerations
export function handleError({ error, event, status, message }: any) {
  const requestId = event?.locals?.requestId || 'unknown';
  const clientIp = event?.request ? getClientIp(event.request) : 'unknown';
  
  // Log detailed error internally
  console.error(`[ERROR] ${status || 500} - ${event?.url?.pathname || 'unknown'} - IP: ${clientIp} - ID: ${requestId}`, {
    error: dev ? error : undefined,
    stack: dev ? error?.stack : undefined,
    userAgent: event?.request?.headers?.get('user-agent'),
    referer: event?.request?.headers?.get('referer')
  });
  
  // Track specific error types for security monitoring
  if (error?.message) {
    const securityPatterns = [
      { pattern: /CSRF/i, type: 'CSRF_ATTEMPT' },
      { pattern: /token/i, type: 'TOKEN_ERROR' },
      { pattern: /unauthorized/i, type: 'UNAUTHORIZED_ACCESS' },
      { pattern: /injection/i, type: 'INJECTION_ATTEMPT' },
      { pattern: /XSS/i, type: 'XSS_ATTEMPT' }
    ];
    
    for (const { pattern, type } of securityPatterns) {
      if (pattern.test(error.message)) {
        console.warn(`[SECURITY] ${type} - IP: ${clientIp} - ID: ${requestId} - Path: ${event?.url?.pathname}`);
        break;
      }
    }
  }
  
  // Return sanitized error for production
  return {
    message: dev ? (message || error?.message || 'An unexpected error occurred') : 
                   getGenericErrorMessage(status || 500),
    code: error?.code || 'INTERNAL_ERROR',
    requestId // Include for user reference
  };
}

function getGenericErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Authentication Required',
    403: 'Access Denied',
    404: 'Page Not Found',
    429: 'Too Many Requests - Please try again later',
    500: 'An unexpected error occurred',
    503: 'Service Temporarily Unavailable'
  };
  
  return messages[status] || 'An unexpected error occurred';
}

// Type additions for locals
declare global {
  namespace App {
    interface Locals {
      cspNonce: string;
      requestId: string;
    }
  }
}