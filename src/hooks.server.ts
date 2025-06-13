import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host') || '';
  const isAdminSubdomain = host.startsWith('admin.') || host.startsWith('secure.');
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  
  // Security headers for all requests
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
  
  // Handle subdomain routing
  if (import.meta.env.PROD) {
    // Redirect admin routes to admin subdomain
    if (isAdminRoute && !isAdminSubdomain) {
      return new Response(null, {
        status: 301,
        headers: {
          location: `https://admin.stpatrickacademy.edu.ph${event.url.pathname}${event.url.search}`
        }
      });
    }
    
    // Redirect non-admin routes from admin subdomain
    if (isAdminSubdomain && !isAdminRoute && event.url.pathname !== '/signin') {
      return new Response(null, {
        status: 301,
        headers: {
          location: `https://stpatrickacademy.edu.ph${event.url.pathname}${event.url.search}`
        }
      });
    }
  }
  
  // Add security headers to response
  const response = await resolve(event);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Additional admin-specific headers
  if (isAdminRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  
  return response;
};

// Optional: Add handle error for better error tracking
export function handleError({ error, event }: any) {
  // Log to your error tracking service
  console.error('Server error:', error);
  
  // Don't expose sensitive error details in production
  const message = import.meta.env.PROD 
    ? 'An unexpected error occurred' 
    : error?.message || 'Unknown error';
    
  return {
    message,
    code: error?.code || 'UNKNOWN'
  };
}