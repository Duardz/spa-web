import { writable } from 'svelte/store';
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