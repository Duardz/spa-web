<script lang="ts">
  import Navigation from './Navigation.svelte';
  import Button from '../ui/Button.svelte';
  import { user, isAuthenticated, isAdmin } from '$lib/stores/auth';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  
  let mobileMenuOpen = $state(false);
  let scrolled = $state(false);
  let userMenuOpen = $state(false);
  
  // Track scroll for header effects
  $effect(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 10;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  // Close menus when clicking outside
  $effect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        userMenuOpen = false;
      }
    };
    
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
  
  // Get first name only for compact display
  function getFirstName(fullName: string): string {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  }
</script>

<header class={`
  fixed top-0 left-0 right-0 z-50 transition-all duration-300
  ${scrolled 
    ? 'bg-white/98 backdrop-blur-lg shadow-sm border-b border-gray-100' 
    : 'bg-white/95 backdrop-blur-md'
  }
`}>
  <!-- Subtle accent line -->
  <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16 lg:h-18">
      <!-- Logo and School Name -->
      <div class="flex items-center">
        <a href="/" class="flex items-center group">
          <img 
            src="/logo.png" 
            alt="Saint Patrick's Academy" 
            class="h-10 w-10 lg:h-11 lg:w-11 mr-3 rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-emerald-200 transition-all duration-200"
          />
          <div>
            <h1 class="text-lg lg:text-xl font-bold text-gray-900">
              Saint Patrick's Academy
            </h1>
            <p class="text-xs text-gray-500 hidden lg:block font-medium">
              Excellence in Education • Paltic, Dingalan
            </p>
          </div>
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-6">
        <Navigation />
        
        <div class="flex items-center space-x-3 ml-2 pl-6 border-l border-gray-200">
          {#if $isAuthenticated}
            <!-- User menu -->
            <div class="relative user-menu-container">
              <button
                onclick={() => userMenuOpen = !userMenuOpen}
                class="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <img 
                  src={$user?.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  class="h-8 w-8 rounded-full ring-2 ring-gray-100"
                />
                <div class="text-left hidden xl:block">
                  <p class="text-sm font-medium text-gray-900">
                    {getFirstName($user?.displayName || '')}
                  </p>
                  <p class="text-xs text-gray-500">Account</p>
                </div>
                <svg class={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown menu -->
              {#if userMenuOpen}
                <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-in">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900">
                      {$user?.displayName || 'User'}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {$user?.email}
                    </p>
                  </div>
                  
                  <a href="/profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </a>
                  
                  {#if $isAdmin}
                    <a href="/admin" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Admin Dashboard
                    </a>
                  {/if}
                  
                  <div class="border-t border-gray-100 mt-1">
                    <button
                      onclick={() => user.signOut()}
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <a href="/signin">
              <Button 
                variant="primary" 
                size="sm"
                class="bg-emerald-600 hover:bg-emerald-700 text-white"
                rounded="lg"
              >
                Sign In
              </Button>
            </a>
          {/if}
        </div>
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
      >
        <svg class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div class="lg:hidden border-t border-gray-100 bg-white/98 backdrop-blur-sm">
      <div class="px-4 py-4">
        <Navigation mobile onNavigate={() => mobileMenuOpen = false} />
        
        <div class="mt-4 pt-4 border-t border-gray-100">
          {#if $isAuthenticated}
            <div class="mb-3">
              <div class="flex items-center space-x-3 mb-3 px-2">
                <img 
                  src={$user?.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  class="h-10 w-10 rounded-full"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {$user?.displayName || 'User'}
                  </p>
                  <p class="text-xs text-gray-500">
                    {$user?.email}
                  </p>
                </div>
              </div>
              
              <div class="space-y-1">
                <a href="/profile" class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  My Profile
                </a>
                {#if $isAdmin}
                  <a href="/admin" class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    Admin Dashboard
                  </a>
                {/if}
                <button
                  onclick={() => user.signOut()}
                  class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          {:else}
            <a href="/signin" class="block">
              <Button 
                variant="primary" 
                fullWidth={true}
                class="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Sign In
              </Button>
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</header>

<!-- Spacer -->
<div class="h-16 lg:h-18"></div>

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-in {
    animation: animate-in 0.2s ease-out;
  }
</style>