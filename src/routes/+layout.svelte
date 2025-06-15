<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { user } from '$lib/stores/auth';
  import { isFirebaseConfigured } from '$lib/firebase/config';
  import { onMount } from 'svelte';
  
  let { children } = $props();
  
  let mounted = $state(false);
  let authLoading = $state(true);
  let error = $state<string | null>(null);
  let skipLinkTarget = $state<HTMLElement | null>(null);
  
  // Check if we're on an admin route
  const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
  
  // Security: Sanitize route parameters to prevent XSS
  const sanitizedPath = $derived(() => {
    if (browser) {
      const path = $page.url.pathname;
      // Basic path validation - only allow alphanumeric, hyphens, underscores, and slashes
      return /^[a-zA-Z0-9\-_\/]*$/.test(path) ? path : '/';
    }
    return $page.url.pathname;
  });
  
  // Subscribe to auth loading state with error handling
  $effect(() => {
    try {
      const unsubscribe = user.loading.subscribe((loading: boolean) => {
        authLoading = loading;
      });
      return unsubscribe;
    } catch (err) {
      console.error('Auth subscription error:', err);
      error = 'Authentication service unavailable';
      authLoading = false;
    }
  });
  
  // Security: Add CSP meta tag dynamically
  $effect(() => {
    if (browser && !isAdminRoute) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com; frame-src 'self' https://*.firebaseapp.com;";
      document.head.appendChild(meta);
      
      return () => {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      };
    }
  });
  
  onMount(() => {
    mounted = true;
    
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      console.error('Firebase is not configured. Please check your .env file.');
      error = 'Application configuration error. Please contact support.';
    }
    
    // Security: Prevent clickjacking
    if (browser && window.self !== window.top) {
      // If loaded in an iframe, redirect to the main page
      window.top?.location.replace(window.self.location.href);
    }
    
    // Accessibility: Set up skip link target
    const mainContent = document.querySelector('main');
    if (mainContent) {
      skipLinkTarget = mainContent as HTMLElement;
    }
  });
  
  // Enhanced error boundary
  const handleError = (err: Error) => {
    console.error('Layout error:', err);
    error = 'An unexpected error occurred. Please refresh the page.';
  };
  
  // Keyboard navigation enhancement
  const handleSkipLink = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && skipLinkTarget) {
      e.preventDefault();
      skipLinkTarget.focus();
      skipLinkTarget.scrollIntoView({ behavior: 'smooth' });
    }
  };
</script>

{#if isAdminRoute}
  <!-- Admin routes - no header/footer, just render the admin layout -->
  <div class="admin-layout" role="main">
    {@render children()}
  </div>
{:else}
  <!-- Public routes - with header/footer -->
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-cream-50 to-white">
    <!-- Accessibility: Skip to main content link -->
    <a 
      href="#main-content" 
      class="skip-link"
      onkeydown={handleSkipLink}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
    
    <!-- Security: Add nonce for inline scripts if needed -->
    <Header />
    
    <main id="main-content" class="flex-grow" tabindex="-1" role="main">
      {#if error}
        <!-- Enhanced error state -->
        <div class="flex items-center justify-center min-h-[60vh] px-4">
          <div class="text-center max-w-md">
            <div class="mb-4">
              <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p class="text-gray-600 mb-6">{error}</p>
            <button 
              onclick={() => window.location.reload()} 
              class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      {:else if !mounted || authLoading}
        <!-- Enhanced loading state -->
        <div class="loading-container">
          <LoadingSpinner fullScreen />
          <p class="loading-text">Loading Saint Patrick's Academy...</p>
        </div>
      {:else}
        <!-- Smooth fade-in animation for content -->
        <div class="content-wrapper animate-fade-in">
          {@render children()}
        </div>
      {/if}
    </main>
    
    <Footer />
  </div>
{/if}

<!-- Notification area for security alerts (if needed) -->
<div id="security-notifications" class="fixed top-4 right-4 z-50" aria-live="polite" aria-atomic="true"></div>

<style>
  :global(html) {
    scroll-behavior: smooth;
    /* Security: Prevent text selection in sensitive areas */
    -webkit-tap-highlight-color: transparent;
  }
  
  :global(body) {
    /* Prevent rubber band scrolling on iOS */
    overscroll-behavior: none;
  }
  
  :global(.bg-cream-50) {
    background-color: #F9F6F0;
  }
  
  /* Accessibility: Skip link styling */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 0 0 4px 0;
    z-index: 100;
    transition: top 0.3s ease;
  }
  
  .skip-link:focus {
    top: 0;
    outline: 3px solid #FFD700;
    outline-offset: 2px;
  }
  
  /* Enhanced loading state */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
  }
  
  .loading-text {
    color: #059669;
    font-size: 1.125rem;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Smooth content fade-in */
  .content-wrapper {
    opacity: 0;
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  /* Security: Disable user selection for UI elements */
  :global(.no-select) {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Focus visible improvements */
  :global(*:focus-visible) {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
  
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :global(.bg-cream-50) {
      background-color: #FFFFFF;
    }
    
    :global(a) {
      text-decoration: underline;
    }
  }
  
  /* Admin layout specific styles */
  .admin-layout {
    min-height: 100vh;
    background-color: #F3F4F6;
  }
</style>