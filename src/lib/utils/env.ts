import { browser } from '$app/environment';
import { dev } from '$app/environment';

// Check if all required environment variables are set
export function checkEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing: string[] = [];
  
  if (browser) {
    required.forEach(key => {
      if (!import.meta.env[key]) {
        missing.push(key);
      }
    });
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// Get environment info
export function getEnvironment() {
  return {
    isDev: dev,
    isProd: !dev,
    isBrowser: browser,
    isServer: !browser,
    firebase: {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'not-set',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'not-set'
    }
  };
}

// Feature flags based on environment
export const features = {
  enablePWA: !dev,
  enableAnalytics: !dev,
  enableServiceWorker: !dev,
  debugMode: dev,
  showDevTools: dev
};

// API endpoints based on environment
export const endpoints = {
  api: dev ? 'http://localhost:5173' : 'https://stpatrickacademy.edu.ph',
  firebase: {
    auth: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    firestore: `https://firestore.googleapis.com/v1/projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents`,
    storage: `https://storage.googleapis.com/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}`
  }
};