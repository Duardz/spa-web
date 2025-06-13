// src/lib/utils/security.ts
import DOMPurify from 'isomorphic-dompurify';

// XSS Prevention - Sanitize all user inputs
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove any HTML tags and dangerous characters
  const cleaned = DOMPurify.sanitize(input.trim(), { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  // Additional sanitization for common XSS vectors
  return cleaned
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Sanitize for Firestore to prevent injection
export function sanitizeForFirestore(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/\$/g, '') // Remove $ to prevent operator injection
    .replace(/\./g, '') // Remove dots to prevent deep path access
    .trim();
}

// CSRF Token Generation and Validation
export class CSRFProtection {
  private static tokens: Map<string, { token: string; expires: number }> = new Map();
  private static readonly TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes

  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + this.TOKEN_LIFETIME;
    
    this.tokens.set(sessionId, { token, expires });
    this.cleanExpiredTokens();
    
    return token;
  }

  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored || stored.expires < Date.now()) {
      return false;
    }
    
    return stored.token === token;
  }

  private static cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [key, value] of this.tokens.entries()) {
      if (value.expires < now) {
        this.tokens.delete(key);
      }
    }
  }
}

// Rate Limiting Implementation
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Clean old attempts
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  getResetTime(identifier: string): number | null {
    const attempts = this.attempts.get(identifier);
    if (!attempts || attempts.length === 0) return null;
    
    const oldestAttempt = Math.min(...attempts);
    return oldestAttempt + this.windowMs;
  }
}

// Content Security Policy Headers
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob: https://*.googleusercontent.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com",
    "frame-src 'self' https://*.google.com https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Secure Password Validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Session Management
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
  private static lastActivity: number = Date.now();
  private static warningShown = false;
  private static timeoutId: NodeJS.Timeout | null = null;

  static updateActivity(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
    this.resetTimer();
  }

  static checkSession(): { isActive: boolean; showWarning: boolean } {
    const now = Date.now();
    const elapsed = now - this.lastActivity;
    
    if (elapsed > this.SESSION_TIMEOUT) {
      return { isActive: false, showWarning: false };
    }
    
    if (elapsed > this.SESSION_TIMEOUT - this.WARNING_TIME && !this.warningShown) {
      this.warningShown = true;
      return { isActive: true, showWarning: true };
    }
    
    return { isActive: true, showWarning: false };
  }

  static startSessionMonitor(
    onWarning: () => void,
    onExpire: () => void
  ): () => void {
    this.resetTimer();
    
    const checkInterval = setInterval(() => {
      const { isActive, showWarning } = this.checkSession();
      
      if (!isActive) {
        onExpire();
        clearInterval(checkInterval);
      } else if (showWarning) {
        onWarning();
      }
    }, 30000); // Check every 30 seconds
    
    // Add activity listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => this.updateActivity();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });
    
    // Return cleanup function
    return () => {
      clearInterval(checkInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    };
  }

  private static resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      // Session will expire
    }, this.SESSION_TIMEOUT);
  }
}

// Encryption utilities for sensitive data
export class Encryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  static async encrypt(data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv
      },
      key,
      encoded
    );
    
    return { encrypted, iv };
  }
  
  static async decrypt(encrypted: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}

// File validation for secure uploads
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateFile(file: File): Promise<FileValidationResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, GIF, and PDF files are allowed'
    };
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
  
  if (!extension || !validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Invalid file extension'
    };
  }
  
  // Verify file content matches MIME type (magic numbers)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      
      // Check magic numbers
      const validHeaders: Record<string, string[]> = {
        '89504e47': ['png'],
        'ffd8ffe0': ['jpg', 'jpeg'],
        'ffd8ffe1': ['jpg', 'jpeg'],
        'ffd8ffe2': ['jpg', 'jpeg'],
        '47494638': ['gif'],
        '25504446': ['pdf']
      };
      
      let isValidHeader = false;
      for (const [magicNumber, extensions] of Object.entries(validHeaders)) {
        if (header.toLowerCase().startsWith(magicNumber) && 
            extension && extensions.includes(extension)) {
          isValidHeader = true;
          break;
        }
      }
      
      resolve({
        isValid: isValidHeader,
        error: isValidHeader ? undefined : 'File content does not match file type'
      });
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

// API Request Security
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
  const csrfToken = sessionStorage.getItem('csrf_token');
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

// Input validation helpers
export const ValidationPatterns = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_PH: /^(09|\+639|639)\d{9}$/,
  LRN: /^\d{12}$/,
  NAME: /^[a-zA-Z\s\-'ñÑ]{2,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Secure local storage with encryption
export class SecureStorage {
  private static key: CryptoKey | null = null;
  
  static async init(): Promise<void> {
    if (!this.key) {
      // In production, derive key from user credentials
      this.key = await Encryption.generateKey();
    }
  }
  
  static async setItem(key: string, value: any): Promise<void> {
    if (!this.key) await this.init();
    
    const data = JSON.stringify(value);
    const { encrypted, iv } = await Encryption.encrypt(data, this.key!);
    
    const stored = {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(key, JSON.stringify(stored));
  }
  
  static async getItem(key: string): Promise<any> {
    if (!this.key) await this.init();
    
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const { data, iv, timestamp } = JSON.parse(stored);
      
      // Check if data is expired (24 hours)
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      const encrypted = new Uint8Array(data).buffer;
      const decrypted = await Encryption.decrypt(
        encrypted, 
        this.key!, 
        new Uint8Array(iv)
      );
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  static clear(): void {
    sessionStorage.clear();
  }
}