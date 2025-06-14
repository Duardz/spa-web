// Admin-specific security utilities
import { RateLimiter, SessionManager, CSRFProtection } from './security';
import type { User } from '$lib/types';

// Admin session configuration
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ADMIN_MAX_LOGIN_ATTEMPTS = 5;
const ADMIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Track failed login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Admin-specific rate limiter
export const adminRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

// Audit log for admin actions
export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: any;
}

const auditLogs: AuditLog[] = [];

export function logAdminAction(
  user: User,
  action: string,
  resource: string,
  success: boolean,
  details?: any
): void {
  const log: AuditLog = {
    userId: user.uid,
    action,
    resource,
    timestamp: new Date(),
    success,
    details: details ? JSON.stringify(details) : undefined
  };
  
  auditLogs.push(log);
  
  // In production, send to logging service
  if (import.meta.env.PROD) {
    // Send to external logging service
    console.log('[AUDIT]', log);
  }
}

// Check if IP is suspicious
export function checkSuspiciousActivity(ipAddress: string): boolean {
  const recentLogs = auditLogs.filter(log => 
    log.ipAddress === ipAddress &&
    log.timestamp > new Date(Date.now() - 60000) // Last minute
  );
  
  // Too many failed actions from same IP
  const failedAttempts = recentLogs.filter(log => !log.success).length;
  return failedAttempts > 10;
}

// Validate admin session
export function validateAdminSession(user: User | null): boolean {
  if (!user || user.role !== 'admin') {
    return false;
  }
  
  // Check session timeout
  const sessionValid = SessionManager.checkSession();
  if (!sessionValid.isActive) {
    return false;
  }
  
  return true;
}

// Admin login attempt tracking
export function trackLoginAttempt(email: string, success: boolean): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  
  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > ADMIN_LOCKOUT_DURATION) {
    attempts.count = 0;
  }
  
  if (!success) {
    attempts.count++;
    attempts.lastAttempt = now;
    loginAttempts.set(email, attempts);
    
    // Check if should lock out
    if (attempts.count >= ADMIN_MAX_LOGIN_ATTEMPTS) {
      return false; // Account locked
    }
  } else {
    // Reset on successful login
    loginAttempts.delete(email);
  }
  
  return true; // Not locked
}

// Content Security Policy for admin pages
export const ADMIN_CSP_HEADERS = {
  ...CSRFProtection,
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.googleapis.com https://*.firebase.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Sanitize admin inputs with stricter rules
export function sanitizeAdminInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove all HTML tags and potential XSS vectors
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[<>'"]/g, '') // Remove special characters
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\\/g, '') // Remove backslashes
    .trim()
    .substring(0, 1000); // Limit length
}

// Validate file uploads for admin
export async function validateAdminUpload(file: File): Promise<{ 
  isValid: boolean; 
  error?: string 
}> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB for admin uploads
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // Additional virus scan would go here in production
  
  return { isValid: true };
}