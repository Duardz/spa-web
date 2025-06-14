// stores/enrollment.ts
import { writable } from 'svelte/store';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '$lib/firebase/config';
import type { Enrollment } from '$lib/types';

// Enrollment settings (controlled by admin)
interface EnrollmentSettings {
  isOpen: boolean;
  schoolYear: string;
  juniorHighOpen: boolean;
  seniorHighOpen: boolean;
  message?: string;
}

// Default settings to ensure all properties are defined
const DEFAULT_SETTINGS: EnrollmentSettings = {
  isOpen: true,
  schoolYear: '2025-2026',
  juniorHighOpen: true,
  seniorHighOpen: true,
  message: ''
};

function createEnrollmentSettingsStore() {
  const { subscribe, set, update } = writable<EnrollmentSettings>(DEFAULT_SETTINGS);
  
  let unsubscribe: (() => void) | null = null;
  
  // Fetch settings from Firestore and listen for changes
  if (typeof window !== 'undefined') {
    const settingsRef = doc(db, 'settings', 'enrollment');
    
    // Initial fetch
    getDoc(settingsRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Merge with defaults to ensure all properties exist
        set({
          ...DEFAULT_SETTINGS,
          ...data,
          // Ensure boolean values are properly set
          isOpen: data.isOpen ?? DEFAULT_SETTINGS.isOpen,
          juniorHighOpen: data.juniorHighOpen ?? DEFAULT_SETTINGS.juniorHighOpen,
          seniorHighOpen: data.seniorHighOpen ?? DEFAULT_SETTINGS.seniorHighOpen
        } as EnrollmentSettings);
      } else {
        console.warn('Enrollment settings document not found, using defaults');
      }
    }).catch(err => {
      console.error('Error fetching enrollment settings:', err);
      // Keep default settings on error
    });
    
    // Listen for real-time updates
    unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          ...DEFAULT_SETTINGS,
          ...data,
          // Ensure boolean values are properly set
          isOpen: data.isOpen ?? DEFAULT_SETTINGS.isOpen,
          juniorHighOpen: data.juniorHighOpen ?? DEFAULT_SETTINGS.juniorHighOpen,
          seniorHighOpen: data.seniorHighOpen ?? DEFAULT_SETTINGS.seniorHighOpen
        } as EnrollmentSettings);
      }
    }, (error) => {
      console.error('Error listening to enrollment settings:', error);
    });
  }
  
  return {
    subscribe,
    setSettings: (settings: EnrollmentSettings) => set(settings),
    toggleEnrollment: () => update(s => ({ ...s, isOpen: !s.isOpen })),
    toggleJuniorHigh: () => update(s => ({ ...s, juniorHighOpen: !s.juniorHighOpen })),
    toggleSeniorHigh: () => update(s => ({ ...s, seniorHighOpen: !s.seniorHighOpen })),
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
      }
    }
  };
}

// Current user's enrollments
function createUserEnrollmentsStore() {
  const { subscribe, set, update } = writable<Enrollment[]>([]);
  
  return {
    subscribe,
    setEnrollments: (enrollments: Enrollment[]) => set(enrollments),
    addEnrollment: (enrollment: Enrollment) => update(e => [...e, enrollment]),
    updateEnrollment: (id: string, updates: Partial<Enrollment>) => 
      update(enrollments => enrollments.map(e => 
        e.id === id ? { ...e, ...updates } as Enrollment : e
      )),
    removeEnrollment: (id: string) => 
      update(enrollments => enrollments.filter(e => e.id !== id)),
    clearEnrollments: () => set([])
  };
}

export const enrollmentSettings = createEnrollmentSettingsStore();
export const userEnrollments = createUserEnrollmentsStore();