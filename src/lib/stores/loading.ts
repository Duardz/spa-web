// stores/loading.ts
import { writable } from 'svelte/store';

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

function createLoadingStore() {
  const { subscribe, set, update } = writable<LoadingState>({ isLoading: false });
  
  let loadingCount = 0;
  
  return {
    subscribe,
    
    start(message?: string) {
      loadingCount++;
      set({ isLoading: true, message });
    },
    
    stop() {
      loadingCount = Math.max(0, loadingCount - 1);
      if (loadingCount === 0) {
        set({ isLoading: false, message: undefined });
      }
    },
    
    reset() {
      loadingCount = 0;
      set({ isLoading: false, message: undefined });
    }
  };
}

export const globalLoading = createLoadingStore();

// Helper function for async operations with loading state
export async function withLoading<T>(
  promise: Promise<T>,
  message?: string
): Promise<T> {
  globalLoading.start(message);
  try {
    const result = await promise;
    return result;
  } finally {
    globalLoading.stop();
  }
}