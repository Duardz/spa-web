// src/lib/utils/api.ts
import { CSRFProtection } from './security';

export async function secureRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID();
  
  // Add security headers
  const headers = new Headers(options.headers);
  headers.set('X-Request-ID', requestId);
  headers.set('X-Timestamp', Date.now().toString());
  
  // Add CSRF token if available
  const csrfToken = CSRFProtection.generateToken('session-' + Date.now());
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  
  // Log request for audit trail (in production, send to logging service)
  if (import.meta.env.DEV) {
    console.log(`[Security] API Request: ${requestId} - ${url}`);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin', // Prevent CSRF
      mode: 'cors',
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
    
    // Check for security headers in response
    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Strict-Transport-Security'
    ];
    
    securityHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        console.warn(`[Security] Missing security header: ${header}`);
      }
    });
    
    return response;
  } catch (error) {
    console.error(`[Security] Request failed: ${requestId}`, error);
    throw error;
  }
}