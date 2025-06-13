// lib/utils/env.ts
export function getSecureEnvVar(key: string): string {
  const value = import.meta.env[key];
  
  if (!value && import.meta.env.PROD) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  // Additional validation for Firebase config
  if (key.includes('FIREBASE') && value) {
    // Validate format
    if (key === 'VITE_FIREBASE_API_KEY' && !value.match(/^[A-Za-z0-9_-]{39}$/)) {
      throw new Error('Invalid Firebase API key format');
    }
  }
  
  return value || '';
}