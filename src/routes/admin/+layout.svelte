<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { user, isAdmin } from '$lib/stores/auth';
  import { SessionManager } from '$lib/utils/security';
  import { validateAdminSession, logAdminAction } from '$lib/utils/adminSecurity';
  
  let { children } = $props();
  
  let checkingAuth = $state(true);
  let mobileMenuOpen = $state(false);
  let showSessionWarning = $state(false);
  let sessionTimeLeft = $state(0);
  
  let sessionCleanup: (() => void) | null = null;
  let warningTimer: NodeJS.Timeout | null = null;
  
  // Subscribe to auth loading state
  $effect(() => {
    const unsubscribe = user.loading.subscribe((loading: boolean) => {
      checkingAuth = loading;
    });
    return unsubscribe;
  });
  
  // Validate admin access and session
  $effect(() => {
    if (!checkingAuth) {
      if (!validateAdminSession($user)) {
        goto('/');
      }
    }
  });
  
  // Set up session monitoring
  onMount(() => {
    if ($isAdmin) {
      // Log admin access
      logAdminAction($user!, 'ADMIN_ACCESS', 'dashboard', true);
      
      // Start session monitoring
      sessionCleanup = SessionManager.startSessionMonitor(
        () => {
          // Show warning 5 minutes before timeout
          showSessionWarning = true;
          sessionTimeLeft = 5 * 60; // 5 minutes in seconds
          
          // Update countdown
          warningTimer = setInterval(() => {
            sessionTimeLeft--;
            if (sessionTimeLeft <= 0) {
              handleSessionExpire();
            }
          }, 1000);
        },
        handleSessionExpire
      );
      
      // Update activity on user interaction
      const updateActivity = () => SessionManager.updateActivity();
      document.addEventListener('click', updateActivity);
      document.addEventListener('keypress', updateActivity);
      
      return () => {
        document.removeEventListener('click', updateActivity);
        document.removeEventListener('keypress', updateActivity);
      };
    }
  });
  
  onDestroy(() => {
    if (sessionCleanup) sessionCleanup();
    if (warningTimer) clearInterval(warningTimer);
  });
  
  function handleSessionExpire() {
    showSessionWarning = false;
    if (warningTimer) clearInterval(warningTimer);
    user.signOut();
    goto('/signin?session=expired');
  }
  
  function extendSession() {
    SessionManager.updateActivity();
    showSessionWarning = false;
    if (warningTimer) {
      clearInterval(warningTimer);
      warningTimer = null;
    }
  }
  
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
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
  <!-- Session Warning Modal -->
  {#if showSessionWarning}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <svg class="h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Session Expiring Soon</h3>
              <p class="text-sm text-gray-500">
                Your session will expire in {formatTime(sessionTimeLeft)}
              </p>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-6">
            For security reasons, you will be automatically logged out due to inactivity. 
            Click "Continue Session" to remain logged in.
          </p>
          
          <div class="flex space-x-3">
            <Button variant="primary" onclick={extendSession} fullWidth>
              Continue Session
            </Button>
            <Button variant="outline" onclick={() => user.signOut()} fullWidth>
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Admin Layout -->
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div class={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ${
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:relative lg:translate-x-0`}>
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
    <div class="flex-1 flex flex-col">
      <!-- Top bar -->
      <div class="bg-white shadow-sm border-b">
        <div class="flex items-center justify-between px-4 py-3">
          <button
            onclick={() => mobileMenuOpen = !mobileMenuOpen}
            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle mobile menu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {#if mobileMenuOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>
          
          <!-- Breadcrumb -->
          <div class="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
            <a href="/admin" class="hover:text-gray-900">Dashboard</a>
            {#if $page.url.pathname !== '/admin'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-gray-900 font-medium">
                {$page.url.pathname.split('/').pop()?.charAt(0).toUpperCase() ?? ''}
                {$page.url.pathname.split('/').pop()?.slice(1) ?? ''}
              </span>
            {/if}
          </div>
          
          <!-- Security indicator -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center text-sm text-green-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Connection
            </div>
          </div>
        </div>
      </div>
      
      <!-- Page content -->
      <main class="flex-1 py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {@render children()}
        </div>
      </main>
    </div>
  </div>
{/if}