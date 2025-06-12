<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { user, isAdmin } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  
  let { children } = $props();
  
  let checkingAuth = $state(true);
  let mobileMenuOpen = $state(false);
  
  // Subscribe to auth loading state
  $effect(() => {
    const unsubscribe = user.loading.subscribe((loading: boolean) => {
      checkingAuth = loading;
    });
    return unsubscribe;
  });
  
  // Redirect if not admin
  $effect(() => {
    if (!checkingAuth && !$isAdmin) {
      goto('/');
    }
  });
</script>

{#if checkingAuth}
  <LoadingSpinner fullScreen />
{:else if !$isAdmin}
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <Card class="max-w-md">
      <div class="text-center py-8">
        <svg class="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p class="text-gray-600 mb-6">
          You don't have permission to access this area.
        </p>
        <Button variant="primary" onclick={() => goto('/')}>
          Return to Home
        </Button>
      </div>
    </Card>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
        class="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>
    </div>
    
    <!-- Sidebar -->
    <div class={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <AdminSidebar currentPath={$page.url.pathname} onNavigate={() => mobileMenuOpen = false} />
    </div>
    
    <!-- Overlay for mobile -->
    {#if mobileMenuOpen}
      <button
        type="button"
        class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
        onclick={() => mobileMenuOpen = false}
        aria-label="Close mobile menu"
      ></button>
    {/if}
    
    <!-- Main content -->
    <div class="lg:pl-64">
      <main class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {@render children()}
        </div>
      </main>
    </div>
  </div>
{/if}