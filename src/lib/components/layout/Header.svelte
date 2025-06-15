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
  
  // Truncate long names
  function truncateName(name: string, maxLength: number = 20): string {
    if (!name) return 'User';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  }
  
  // Get first name only for compact display
  function getFirstName(fullName: string): string {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  }
</script>

<header class={`
  fixed top-0 left-0 right-0 z-50 transition-all duration-500
  ${scrolled 
    ? 'bg-white/95 backdrop-blur-xl shadow-lg' 
    : 'bg-white/90 backdrop-blur-md shadow'
  }
`}>
  <!-- Simplified gradient border -->
  <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16 lg:h-20">
      <!-- Logo and School Name - More compact -->
      <div class="flex items-center group flex-shrink-0">
        <a href="/" class="flex items-center">
          <div class="relative">
            <img 
              src="/logo.png" 
              alt="Saint Patrick's Academy Logo" 
              class="h-10 w-10 lg:h-12 lg:w-12 mr-3 rounded-full shadow-md transform group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div class="hidden sm:block">
            <h1 class="text-lg lg:text-xl font-bold text-emerald-700">
              Saint Patrick's Academy
            </h1>
            <p class="text-xs text-gray-500 hidden lg:block">
              Paltic • Dingalan • Aurora
            </p>
          </div>
          <!-- Mobile: Abbreviated name -->
          <div class="sm:hidden">
            <h1 class="text-lg font-bold text-emerald-700">
              SPA
            </h1>
          </div>
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-4 xl:space-x-6">
        <Navigation />
        
        <div class="flex items-center space-x-3 ml-4">
          {#if $isAuthenticated}
            <!-- User dropdown menu -->
            <div class="relative user-menu-container">
              <button
                onclick={() => userMenuOpen = !userMenuOpen}
                class="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200 max-w-[200px]"
              >
                <div class="relative flex-shrink-0">
                  <img 
                    src={$user?.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    class="h-8 w-8 rounded-full ring-2 ring-gray-200"
                  />
                  <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <span class="text-sm font-medium text-gray-700 truncate hidden xl:block">
                  {getFirstName($user?.displayName || '')}
                </span>
                <svg class={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown menu -->
              {#if userMenuOpen}
                <div class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 transform origin-top-right transition-all duration-200 animate-in">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {$user?.displayName || 'User'}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {$user?.email}
                    </p>
                  </div>
                  
                  <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </div>
                  </a>
                  
                  {#if $isAdmin}
                    <a href="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <div class="flex items-center space-x-3">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Admin Dashboard</span>
                      </div>
                    </a>
                  {/if}
                  
                  <div class="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onclick={() => user.signOut()}
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div class="flex items-center space-x-3">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <a href="/signin">
              <Button 
                variant="outline" 
                size="sm"
                class="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                rounded="full"
              >
                Sign In
              </Button>
            </a>
          {/if}
        </div>
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div class="lg:hidden border-t border-gray-100 bg-white">
      <div class="px-4 py-4">
        <Navigation mobile onNavigate={() => mobileMenuOpen = false} />
        
        <div class="mt-4 pt-4 border-t border-gray-100">
          {#if $isAuthenticated}
            <div class="mb-4">
              <div class="flex items-center space-x-3 mb-4">
                <img 
                  src={$user?.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  class="h-10 w-10 rounded-full"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">
                    {$user?.displayName || 'User'}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {$user?.email}
                  </p>
                </div>
              </div>
              
              <div class="space-y-2">
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
                variant="outline" 
                fullWidth={true}
                class="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
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

<!-- Spacer to push content below fixed header -->
<div class="h-16 lg:h-20"></div>

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-in {
    animation: animate-in 0.2s ease-out;
  }
</style>