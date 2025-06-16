<script lang="ts">
  import { user } from '$lib/stores/auth';
  
  interface Props {
    currentPath: string;
    onNavigate?: () => void;
    mobileMenuOpen?: boolean;
    pendingEnrollments?: number;
  }
  
  let { currentPath, onNavigate, mobileMenuOpen = false, pendingEnrollments = 0 }: Props = $props();
  
  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      badge: null
    },
    {
      href: '/admin/enrollments',
      label: 'Enrollments',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      badge: pendingEnrollments > 0 ? pendingEnrollments.toString() : null
    },
    {
      href: '/admin/teachers',
      label: 'Teachers',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      badge: null
    },
    {
      href: '/admin/news',
      label: 'News Posts',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      badge: null
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      badge: null
    }
  ];
  
  function isActive(href: string): boolean {
    if (href === '/admin') {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  }
  
  function handleClick() {
    if (onNavigate) onNavigate();
  }
  
  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
</script>

<!-- Desktop Sidebar -->
<aside class="hidden lg:fixed lg:top-0 lg:left-0 lg:z-40 lg:w-64 lg:h-screen lg:flex lg:flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
  <!-- Logo Section -->
  <div class="p-6 flex-shrink-0">
    <a href="/" class="flex items-center space-x-3 group">
      <div class="relative">
        <div class="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <div class="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <img src="/logo.png" alt="SPA Logo" class="h-7 w-7 filter brightness-0 invert" />
        </div>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-white">SPA Admin</h2>
        <p class="text-xs text-slate-400">Control Center</p>
      </div>
    </a>
  </div>
  
  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto px-4 pb-4">
    <div class="space-y-1">
      {#each menuItems as item}
        <a
          href={item.href}
          onclick={handleClick}
          class={`
            relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
            ${isActive(item.href)
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }
          `}
        >
          {#if isActive(item.href)}
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-sm"></div>
          {/if}
          
          <div class="relative flex items-center w-full">
            <svg class={`w-5 h-5 mr-3 flex-shrink-0 ${isActive(item.href) ? 'text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            <span class="flex-1">{item.label}</span>
            
            {#if item.badge}
              <span class={`
                px-2 py-0.5 text-xs font-semibold rounded-full
                ${item.badge === 'New' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-700 text-slate-300'
                }
              `}>
                {item.badge}
              </span>
            {/if}
            
            {#if isActive(item.href)}
              <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full -ml-4"></div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
    

  </nav>
  
  <!-- User Section -->
  <div class="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
    <div class="mb-4 p-3 bg-slate-800/50 rounded-lg">
      <p class="text-xs text-slate-500 mb-1">{greeting},</p>
      <p class="text-sm font-medium text-slate-200">
        {$user?.displayName?.split(' ')[0] || 'Admin'}
      </p>
    </div>
    
    <div class="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
      {#if $user?.photoURL}
        <img 
          src={$user.photoURL} 
          alt="Profile" 
          class="h-10 w-10 rounded-full ring-2 ring-slate-700"
        />
      {:else}
        <div class="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-semibold text-white shadow-lg">
          {$user?.displayName?.charAt(0) || 'A'}
        </div>
      {/if}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-200 truncate">
          {$user?.displayName || 'Admin User'}
        </p>
        <p class="text-xs text-slate-500 truncate">
          {$user?.email}
        </p>
      </div>
      
      <div class="flex items-center space-x-1">
        <button
          onclick={() => window.location.href = '/'}
          class="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          title="View Site"
          aria-label="View Site"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <button
          onclick={() => user.signOut()}
          class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</aside>

<!-- Mobile Sidebar -->
<aside class={`
  lg:hidden fixed inset-0 z-50 flex
  ${mobileMenuOpen ? '' : 'pointer-events-none'}
`}>
  <!-- Backdrop -->
  <button 
    class={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
    onclick={handleClick}
    aria-label="Close menu"
    type="button"
  ></button>
  
  <!-- Sidebar Panel -->
  <div class={`
    relative w-80 max-w-[85vw] h-full bg-slate-900 text-slate-100 
    transform transition-transform duration-300 ease-out flex flex-col
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
  `}>
    <!-- Mobile Header -->
    <div class="p-4 flex items-center justify-between border-b border-slate-800">
      <a href="/" class="flex items-center space-x-3" onclick={handleClick}>
        <div class="relative">
          <div class="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-30"></div>
          <div class="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="SPA Logo" class="h-6 w-6 filter brightness-0 invert" />
          </div>
        </div>
        <div>
          <h2 class="text-base font-semibold text-white">SPA Admin</h2>
          <p class="text-xs text-slate-400">Control Center</p>
        </div>
      </a>
      
      <button
        onclick={handleClick}
        class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        aria-label="Close menu"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile Navigation -->
    <nav class="flex-1 overflow-y-auto px-4 py-6">
      <div class="space-y-1">
        {#each menuItems as item}
          <a
            href={item.href}
            onclick={handleClick}
            class={`
              relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200
              ${isActive(item.href)
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400'
                : 'text-slate-400 active:bg-slate-800 active:text-slate-200'
              }
            `}
          >
            <svg class={`w-5 h-5 mr-3 flex-shrink-0 ${isActive(item.href) ? 'text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            <span class="flex-1">{item.label}</span>
            
            {#if item.badge}
              <span class={`
                px-2 py-0.5 text-xs font-semibold rounded-full
                ${item.badge === 'New' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-700 text-slate-300'
                }
              `}>
                {item.badge}
              </span>
            {/if}
          </a>
        {/each}
      </div>
      

    </nav>
    
    <!-- Mobile User Section -->
    <div class="p-4 border-t border-slate-800 bg-slate-900/50">
      <div class="flex items-center space-x-3 mb-4">
        {#if $user?.photoURL}
          <img 
            src={$user.photoURL} 
            alt="Profile" 
            class="h-12 w-12 rounded-full ring-2 ring-slate-700"
          />
        {:else}
          <div class="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-semibold text-white text-lg shadow-lg">
            {$user?.displayName?.charAt(0) || 'A'}
          </div>
        {/if}
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-200 truncate">
            {$user?.displayName || 'Admin User'}
          </p>
          <p class="text-xs text-slate-500 truncate">
            {$user?.email}
          </p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <a
          href="/"
          onclick={handleClick}
          class="flex items-center justify-center px-4 py-2.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-medium"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </a>
        <button
          onclick={() => { user.signOut(); handleClick(); }}
          class="flex items-center justify-center px-4 py-2.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors font-medium"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  </div>
</aside>

<style>
  /* Custom scrollbar */
  nav::-webkit-scrollbar {
    width: 6px;
  }
  
  nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  
  nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  /* Smooth transitions */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Mobile optimizations */
  @media (max-width: 1024px) {
    aside {
      -webkit-overflow-scrolling: touch;
    }
  }
</style>