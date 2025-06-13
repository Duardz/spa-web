// stores/auth.ts
import { writable, derived, type Readable, type Writable } from 'svelte/store';
import type { User } from '$lib/types';
import { onAuthChange, signInWithGoogle, signOut } from '$lib/firebase/auth';

// User store
interface UserStore extends Readable<User | null> {
  loading: Writable<boolean>;
  signIn: typeof signInWithGoogle;
  signOut: () => Promise<void>;
}

function createUserStore(): UserStore {
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
    loading,
    signIn: async () => {
      try {
        loading.set(true);
        const userData = await signInWithGoogle();
        if (userData) {
          set(userData);
        }
        return userData;
      } catch (error) {
        console.error('Store sign-in error:', error);
        throw error;
      } finally {
        loading.set(false);
      }
    },
    signOut: async () => {
      try {
        loading.set(true);
        await signOut();
        set(null);
      } catch (error) {
        console.error('Store sign-out error:', error);
        throw error;
      } finally {
        loading.set(false);
      }
    }
  };
}

export const user = createUserStore();

// Derived stores
export const isAuthenticated = derived(user, $user => !!$user);
export const isAdmin = derived(user, $user => $user?.role === 'admin');
export const isStudent = derived(user, $user => $user?.role === 'student');