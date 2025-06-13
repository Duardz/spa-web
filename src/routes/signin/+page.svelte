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

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <Card class="max-w-md w-full">
    <div class="text-center">
      <!-- Logo -->
      <img 
        src="/logo.png" 
        alt="Saint Patrick's Academy" 
        class="h-20 w-20 mx-auto mb-4"
      />
      
      <h2 class="text-3xl font-bold text-gray-900 mb-2">
        Welcome Back
      </h2>
      <p class="text-gray-600 mb-8">
        Sign in to access your account
      </p>
    </div>
    
    <div class="space-y-4">
      <!-- Google Sign In Button -->
      <button
        onclick={handleSignIn}
        disabled={isSigningIn}
        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {#if isSigningIn}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        {:else}
          <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        {/if}
      </button>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      {/if}
      
      <!-- Info boxes -->
      <div class="mt-6 space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-1">For Students</h3>
          <p class="text-sm text-blue-700">
            Sign in to submit enrollment applications and check your application status.
          </p>
        </div>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 class="font-semibold text-green-900 mb-1">For Administrators</h3>
          <p class="text-sm text-green-700">
            Admin users can access the dashboard after signing in. Contact IT if you need admin access.
          </p>
        </div>
      </div>
      
      <!-- Help text -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </Card>
  
  <!-- Back to home link -->
  <div class="mt-4 text-center">
    <a href="/" class="text-sm text-green-600 hover:text-green-700">
      ← Back to homepage
    </a>
  </div>
</div>