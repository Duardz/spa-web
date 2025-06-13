<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  
  let redirecting = $state(false);
  
  onMount(() => {
    // Only redirect in production
    if (import.meta.env.PROD) {
      redirecting = true;
      setTimeout(() => {
        window.location.href = 'https://admin.stpatrickacademy.edu.ph';
      }, 1500);
    }
  });
</script>

<svelte:head>
  <title>Admin Portal - Saint Patrick's Academy</title>
  <meta name="robots" content="noindex, nofollow">
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <Card class="max-w-md w-full text-center">
    <div class="mb-6">
      <svg class="w-20 h-20 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Admin Portal
      </h1>
      
      {#if redirecting}
        <div class="space-y-4">
          <LoadingSpinner size="md" />
          <p class="text-gray-600">
            Redirecting to secure admin portal...
          </p>
        </div>
      {:else if import.meta.env.DEV}
        <div class="space-y-4">
          <p class="text-gray-600 mb-4">
            In production, this will redirect to the admin subdomain.
          </p>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h3 class="font-semibold text-yellow-900 mb-2">Development Mode</h3>
            <p class="text-sm text-yellow-800 mb-3">
              Admin subdomain redirection is disabled in development.
            </p>
            <a href="/admin" class="text-yellow-900 underline text-sm">
              → Go to admin panel (dev mode)
            </a>
          </div>
        </div>
      {:else}
        <p class="text-gray-600">
          Click below to access the secure admin portal
        </p>
        <a 
          href="https://admin.stpatrickacademy.edu.ph" 
          class="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Admin Portal
        </a>
      {/if}
    </div>
    
    <div class="mt-8 pt-6 border-t border-gray-200">
      <p class="text-sm text-gray-500">
        For security reasons, the admin panel is hosted on a separate subdomain.
      </p>
    </div>
  </Card>
</div>