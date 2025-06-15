<script lang="ts">
  import Navigation from './Navigation.svelte';
  import Button from '../ui/Button.svelte';
  import { user, isAuthenticated, isAdmin } from '$lib/stores/auth';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  
  let mobileMenuOpen = $state(false);
  let scrolled = $state(false);
  
  // Track scroll for header effects
  $effect(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 10;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<header class={`
  fixed top-0 left-0 right-0 z-50 transition-all duration-500
  ${scrolled 
    ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10' 
    : 'bg-white/90 backdrop-blur-md shadow-lg'
  }
`}>
  <!-- Animated border gradient -->
  <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
  
  <!-- Decorative elements -->
  <div class="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl"></div>
  <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-400/10 to-transparent rounded-full blur-3xl"></div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <!-- Logo and School Name with futuristic styling -->
      <div class="flex items-center group">
        <div class="relative">
          <!-- Glow effect behind logo -->
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <img 
            src="/logo.png" 
            alt="Saint Patrick's Academy Logo" 
            class="relative h-14 w-14 mr-4 rounded-full ring-2 ring-white shadow-xl transform group-hover:scale-110 transition-transform duration-300"
          />
          <!-- Orbiting dots -->
          <div class="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-orbit"></div>
          <div class="absolute bottom-0 left-0 w-2 h-2 bg-teal-400 rounded-full animate-orbit-reverse"></div>
        </div>
        <div>
          <h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">
            Saint Patrick's Academy
          </h1>
          <p class="text-xs text-gray-500 font-medium tracking-wider uppercase">
            Paltic • Dingalan • Aurora
          </p>
        </div>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-6">
        <Navigation />
        
        <div class="flex items-center space-x-3">
          
          {#if $isAuthenticated}
            <div class="flex items-center space-x-3 px-4 py-2 rounded-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50">
              <div class="relative">
                <img 
                  src={$user?.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  class="h-9 w-9 rounded-full ring-2 ring-emerald-500/30"
                />
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <span class="text-sm font-medium text-gray-700">{$user?.displayName}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onclick={() => user.signOut()}
                class="text-gray-600 hover:text-red-600 transition-colors duration-300"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          {:else}
            <a href="/signin" class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Button 
                variant="outline" 
                size="sm"
                class="relative border-2 border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent hover:border-emerald-500/30 hover:bg-emerald-50/50 backdrop-blur-sm transition-all duration-300"
                rounded="full"
              >
                <span class="font-semibold">Sign In</span>
              </Button>
            </a>
          {/if}
        </div>
      </div>
      
      <!-- Mobile menu button with futuristic design -->
      <button
        class="lg:hidden relative w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
      >
        <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400/0 to-teal-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <svg class="w-6 h-6 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 12h10" />
          {/if}
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Mobile Navigation with slide animation -->
  <div class={`
    lg:hidden fixed inset-x-0 top-20 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out
    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
  `}>
    <div class="border-t border-gray-100">
      <div class="px-4 py-6 space-y-4">
        <Navigation mobile onNavigate={() => mobileMenuOpen = false} />
        
        <div class="pt-4 space-y-3 border-t border-gray-100">
          {#if $isAuthenticated}
            <div class="flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50">
              <img 
                src={$user?.photoURL || '/default-avatar.png'} 
                alt="Profile" 
                class="h-12 w-12 rounded-full ring-2 ring-emerald-500/30"
              />
              <div class="ml-3 flex-1">
                <div class="text-base font-semibold text-gray-800">{$user?.displayName}</div>
                <div class="text-sm text-gray-500">{$user?.email}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              fullWidth={true} 
              onclick={() => user.signOut()}
              class="text-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          {:else}
            <div class="space-y-3">
              <a href="/signin" class="block">
                <Button 
                  variant="outline" 
                  fullWidth={true}
                  class="border-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50"
                >
                  Sign In
                </Button>
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>

<!-- Spacer to push content below fixed header -->
<div class="h-20"></div>

<style>
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
  }
  
  @keyframes orbit-reverse {
    from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
    to { transform: rotate(-360deg) translateX(20px) rotate(360deg); }
  }
  
  .animate-orbit {
    animation: orbit 3s linear infinite;
  }
  
  .animate-orbit-reverse {
    animation: orbit-reverse 3s linear infinite;
  }
</style>