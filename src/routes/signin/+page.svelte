<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  
  let isSigningIn = $state(false);
  let error = $state('');
  let redirectTo = $state('/');
  
  // Get redirect URL from query params
  onMount(() => {
    const redirect = $page.url.searchParams.get('redirect');
    if (redirect) {
      redirectTo = redirect;
    }
    
    // If already signed in, redirect
    if ($isAuthenticated) {
      goto(redirectTo);
    }
  });
  
  // Watch for authentication changes
  $effect(() => {
    if ($isAuthenticated && !isSigningIn) {
      goto(redirectTo);
    }
  });
  
  async function handleSignIn() {
    isSigningIn = true;
    error = '';
    
    try {
      const result = await user.signIn();
      if (result) {
        // Successful sign in - the effect will handle redirect
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      error = err.message || 'Failed to sign in. Please try again.';
    } finally {
      isSigningIn = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - Saint Patrick's Academy</title>
  <meta name="description" content="Sign in to access the Saint Patrick's Academy enrollment system and student portal.">
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
  <!-- Decorative background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
  </div>
  
  <!-- Main content -->
  <div class="relative z-10 w-full max-w-md">
    <!-- Logo and header -->
    <div class="text-center mb-8">
      <div class="relative inline-block">
        <div class="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <img 
          src="/logo.png" 
          alt="Saint Patrick's Academy" 
          class="relative h-24 w-24 mx-auto mb-6 rounded-full shadow-lg ring-4 ring-white"
        />
      </div>
      
      <h1 class="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
        Welcome Back
      </h1>
      <p class="text-lg text-gray-600">
        Sign in to continue to your account
      </p>
    </div>
    
    <!-- Sign in card -->
    <Card class="w-full backdrop-blur-sm bg-white/95 shadow-xl border-0 p-8">
      <div class="space-y-6">
        <!-- Google Sign In Button -->
        <button
          onclick={handleSignIn}
          disabled={isSigningIn}
          class="relative w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          {#if isSigningIn}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-600">Signing in...</span>
          {:else}
            <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          {/if}
        </button>
        
        {#if error}
          <div class="animate-shake bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{error}</span>
          </div>
        {/if}
        
        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white text-gray-500">Account Access</span>
          </div>
        </div>
        
        <!-- Info boxes -->
        <div class="space-y-3">
          <div class="group bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9v7a2 2 0 002 2h14a2 2 0 002-2V9"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="font-semibold text-blue-900 text-sm">For Students</h3>
                <p class="text-xs text-blue-700 mt-1">
                  Submit enrollment applications and track your admission status
                </p>
              </div>
            </div>
          </div>
          
          <div class="group bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="font-semibold text-green-900 text-sm">For Administrators</h3>
                <p class="text-xs text-green-700 mt-1">
                  Access the admin dashboard and manage enrollments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
    
    <!-- Footer links -->
    <div class="mt-6 text-center space-y-3">
      <p class="text-xs text-gray-500">
        By signing in, you agree to our 
        <a href="/terms" class="text-green-600 hover:text-green-700 underline">Terms of Service</a> 
        and 
        <a href="/privacy" class="text-green-600 hover:text-green-700 underline">Privacy Policy</a>
      </p>
      
      <a href="/" class="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium group">
        <svg class="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to homepage
      </a>
    </div>
  </div>
</div>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
</style>