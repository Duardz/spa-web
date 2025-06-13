<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { user } from '$lib/stores/auth';
  import { isFirebaseConfigured } from '$lib/firebase/config';
  import { onMount } from 'svelte';
  
  let { children } = $props();
  
  let mounted = $state(false);
  let authLoading = $state(true);
  
  // Check if we're on an admin route
  const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
  
  // Subscribe to auth loading state
  $effect(() => {
    const unsubscribe = user.loading.subscribe((loading: boolean) => {
      authLoading = loading;
    });
    return unsubscribe;
  });
  
  onMount(() => {
    mounted = true;
    
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      console.error('Firebase is not configured. Please check your .env file.');
    }
  });
</script>

{#if isAdminRoute}
  <!-- Admin routes - no header/footer, just render the admin layout -->
  {@render children()}
{:else}
  <!-- Public routes - with header/footer -->
  <div class="min-h-screen flex flex-col bg-cream-50">
    <Header />
    
    <main class="flex-grow">
      {#if !mounted || authLoading}
        <LoadingSpinner fullScreen />
      {:else}
        {@render children()}
      {/if}
    </main>
    
    <Footer />
  </div>
{/if}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  
  :global(.bg-cream-50) {
    background-color: #F9F6F0;
  }
</style>