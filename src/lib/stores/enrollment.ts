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

function createEnrollmentSettingsStore() {
  const { subscribe, set, update } = writable<EnrollmentSettings>({
    isOpen: false,
    schoolYear: '2025-2026',
    juniorHighOpen: true,
    seniorHighOpen: true
  });
  
  // Fetch settings from Firestore and listen for changes
  if (typeof window !== 'undefined') {
    const settingsRef = doc(db, 'settings', 'enrollment');
    
    // Initial fetch
    getDoc(settingsRef).then(docSnap => {
      if (docSnap.exists()) {
        set(docSnap.data() as EnrollmentSettings);
      }
    }).catch(err => {
      console.error('Error fetching enrollment settings:', err);
    });
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        set(docSnap.data() as EnrollmentSettings);
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
    toggleSeniorHigh: () => update(s => ({ ...s, seniorHighOpen: !s.seniorHighOpen }))
  };
}

// Current user's enrollments
function createUserEnrollmentsStore() {
  const { subscribe, set, update } = writable<Enrollment[]>([]);
  
  return {
    subscribe,
    setEnrollments: (enrollments: Enrollment[]) => set(enrollments),
    addEnrollment: (enrollment: Enrollment) => update(e => [...e, enrollment]),
    clearEnrollments: () => set([])
  };
}

export const enrollmentSettings = createEnrollmentSettingsStore();
export const userEnrollments = createUserEnrollmentsStore();