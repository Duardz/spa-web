import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';
import { onAuthChange, signInWithGoogle, signOut } from '$lib/firebase/auth';

// User store
function createUserStore() {
  const { subscribe, set } = writable<User | null>(null);
  
  // Loading state
  const loading = writable(true);
  
  // Initialize auth listener
  if (typeof window !== 'undefined') {
    onAuthChange((user) => {
      set(user);
      loading.set(false);
    });
  }
  
  return {
    subscribe,
    loading: { subscribe: loading.subscribe },
    signIn: signInWithGoogle,
    signOut: async () => {
      await signOut();
      set(null);
    }
  };
}

export const user = createUserStore();

// Derived stores
export const isAuthenticated = derived(user, $user => !!$user);
export const isAdmin = derived(user, $user => $user?.role === 'admin');
export const isStudent = derived(user, $user => $user?.role === 'student');