<script lang="ts">
  import Navigation from './Navigation.svelte';
  import Button from '../ui/Button.svelte';
  import { user, isAuthenticated, isAdmin } from '$lib/stores/auth';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  
  let mobileMenuOpen = $state(false);
</script>

<header class="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <!-- Logo and School Name -->
      <div class="flex items-center">
        <img 
          src="/logo.png" 
          alt="Saint Patrick's Academy Logo" 
          class="h-12 w-12 mr-3"
        />
        <div>
          <h1 class="text-lg font-bold text-green-700">Saint Patrick's Academy</h1>
          <p class="text-xs text-gray-500">Paltic, Dingalan, Aurora</p>
        </div>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-6">
        <Navigation />
        
        {#if $enrollmentSettings.isOpen}
          <a href="/enroll" class="inline-block">
            <Button 
              variant="primary" 
              size="sm"
              class="bg-green-600 hover:bg-green-700 text-white"
              rounded="full"
            >
              Enroll Now
            </Button>
          </a>
        {/if}
        
        {#if $isAuthenticated}
          <div class="flex items-center space-x-3">
            <img 
              src={$user?.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              class="h-8 w-8 rounded-full border border-gray-200"
            />
            <span class="text-sm text-gray-700">{$user?.displayName}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onclick={() => user.signOut()}
              class="text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </Button>
          </div>
        {:else}
          <a href="/signin">
            <Button 
              variant="outline" 
              size="sm"
              class="border-green-600 text-green-700 hover:bg-green-50"
              rounded="full"
            >
              Sign In
            </Button>
          </a>
        {/if}
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
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
  </div>
  
  <!-- Mobile Navigation -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-gray-100 bg-white">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <Navigation mobile onNavigate={() => mobileMenuOpen = false} />
        
        <div class="pt-4 pb-3 border-t border-gray-200">
          {#if $isAuthenticated}
            <div class="flex items-center px-4 mb-3">
              <img 
                src={$user?.photoURL || '/default-avatar.png'} 
                alt="Profile" 
                class="h-10 w-10 rounded-full border border-gray-200"
              />
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">{$user?.displayName}</div>
                <div class="text-sm font-medium text-gray-500">{$user?.email}</div>
              </div>
            </div>
            <div class="px-4">
              <Button 
                variant="ghost" 
                fullWidth={true} 
                onclick={() => user.signOut()}
                class="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </Button>
            </div>
          {:else}
            <div class="space-y-2 px-4">
              {#if $enrollmentSettings.isOpen}
                <a href="/enroll" class="block">
                  <Button 
                    variant="primary" 
                    fullWidth={true}
                    class="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Enroll Now
                  </Button>
                </a>
              {/if}
              <a href="/signin" class="block">
                <Button 
                  variant="outline" 
                  fullWidth={true}
                  class="border-green-600 text-green-700 hover:bg-green-50"
                >
                  Sign In
                </Button>
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</header>