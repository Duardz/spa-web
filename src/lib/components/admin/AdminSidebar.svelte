<script lang="ts">
  import { user } from '$lib/stores/auth';
  
  interface Props {
    currentPath: string;
    onNavigate?: () => void;
    mobileMenuOpen?: boolean;
  }
  
  let { currentPath, onNavigate, mobileMenuOpen = false }: Props = $props();
  
  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      href: '/admin/enrollments',
      label: 'Enrollments',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      href: '/admin/teachers',
      label: 'Teachers',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      href: '/admin/news',
      label: 'News Posts',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
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
</script>

<!-- Desktop Sidebar - Always visible on large screens -->
<aside class="hidden lg:fixed lg:top-0 lg:left-0 lg:z-40 lg:w-64 lg:h-screen lg:flex lg:flex-col bg-gradient-to-b from-green-800 to-green-900 text-white">
  <!-- Logo Section -->
  <div class="p-6 border-b border-green-700/50 flex-shrink-0 bg-green-800/50 backdrop-blur-sm">
    <a href="/" class="flex items-center space-x-3 group">
      <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
        <img src="/logo.png" alt="SPA Logo" class="h-8 w-8" />
      </div>
      <div>
        <h2 class="text-lg font-bold">SPA Admin</h2>
        <p class="text-xs text-green-200">Management System</p>
      </div>
    </a>
  </div>
  
  <!-- Navigation - Scrollable if needed -->
  <nav class="flex-1 overflow-y-auto py-4 min-h-0">
    <div class="px-3">
      <h3 class="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3 px-3">
        Main Navigation
      </h3>
      <ul class="space-y-1">
        {#each menuItems as item}
          <li>
            <a
              href={item.href}
              onclick={handleClick}
              class={`
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-green-900/50 text-white shadow-lg transform scale-105'
                  : 'text-green-100 hover:bg-green-700/30 hover:text-white'
                }
              `}
            >
              <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
              </svg>
              <span>{item.label}</span>
              {#if isActive(item.href)}
                <div class="ml-auto w-1 h-6 bg-green-400 rounded-full"></div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
    
    <!-- Quick Stats -->
    <div class="mt-8 px-6">
      <h3 class="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3">
        Quick Stats
      </h3>
      <div class="bg-green-700/30 rounded-lg p-4 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-xs text-green-200">Active Session</span>
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div class="text-xs text-green-200">
          Last login: {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  </nav>
  
  <!-- User Section - Always at bottom -->
  <div class="p-4 border-t border-green-700/50 bg-green-900/50 backdrop-blur-sm flex-shrink-0">
    <div class="flex items-center space-x-3 mb-3">
      {#if $user?.photoURL}
        <img 
          src={$user.photoURL} 
          alt="Profile" 
          class="h-10 w-10 rounded-full ring-2 ring-green-400/30"
        />
      {:else}
        <div class="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center font-bold shadow-lg">
          {$user?.displayName?.charAt(0) || 'A'}
        </div>
      {/if}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">
          {$user?.displayName || 'Admin User'}
        </p>
        <p class="text-xs text-green-300 truncate">
          {$user?.email}
        </p>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-2">
      <a
        href="/"
        class="text-center px-3 py-2 text-xs bg-green-700/50 hover:bg-green-600/50 rounded-lg transition-colors font-medium"
      >
        View Site
      </a>
      <button
        onclick={() => user.signOut()}
        class="text-center px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-lg transition-colors font-medium"
      >
        Sign Out
      </button>
    </div>
  </div>
</aside>

<!-- Mobile Sidebar - Only visible when hamburger menu is open -->
<aside class={`
  lg:hidden fixed top-0 left-0 z-50 w-64 h-screen bg-gradient-to-b from-green-800 to-green-900 text-white 
  transform transition-transform duration-300 ease-in-out flex flex-col
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  <!-- Mobile Header with Close Button -->
  <div class="p-4 border-b border-green-700/50 flex-shrink-0 bg-green-800/80 backdrop-blur-sm">
    <div class="flex items-center justify-between">
      <a href="/" class="flex items-center space-x-3 group" onclick={handleClick}>
        <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <img src="/logo.png" alt="SPA Logo" class="h-6 w-6" />
        </div>
        <div>
          <h2 class="text-base font-bold">SPA Admin</h2>
          <p class="text-xs text-green-200">Management System</p>
        </div>
      </a>
      
      <!-- Close button for mobile -->
      <button
        onclick={handleClick}
        class="p-2 rounded-lg text-green-300 hover:text-white hover:bg-green-700/30 transition-colors"
        aria-label="Close menu"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Mobile Navigation -->
  <nav class="flex-1 overflow-y-auto py-4 min-h-0">
    <div class="px-3">
      <h3 class="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3 px-3">
        Main Navigation
      </h3>
      <ul class="space-y-2">
        {#each menuItems as item}
          <li>
            <a
              href={item.href}
              onclick={handleClick}
              class={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-green-900/60 text-white shadow-lg border-l-4 border-green-400'
                  : 'text-green-100 hover:bg-green-700/40 hover:text-white'
                }
              `}
            >
              <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
              </svg>
              <span class="flex-1">{item.label}</span>
              {#if isActive(item.href)}
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
    
    <!-- Mobile Quick Stats -->
    <div class="mt-6 px-6">
      <div class="bg-green-700/30 rounded-lg p-3 space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs text-green-200">Active Session</span>
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div class="text-xs text-green-200">
          Last login: {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  </nav>
  
  <!-- Mobile User Section -->
  <div class="p-4 border-t border-green-700/50 bg-green-900/60 backdrop-blur-sm flex-shrink-0">
    <div class="flex items-center space-x-3 mb-4">
      {#if $user?.photoURL}
        <img 
          src={$user.photoURL} 
          alt="Profile" 
          class="h-12 w-12 rounded-full ring-2 ring-green-400/40"
        />
      {:else}
        <div class="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center font-bold shadow-lg text-lg">
          {$user?.displayName?.charAt(0) || 'A'}
        </div>
      {/if}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">
          {$user?.displayName || 'Admin User'}
        </p>
        <p class="text-xs text-green-300 truncate">
          {$user?.email}
        </p>
      </div>
    </div>
    
    <div class="space-y-2">
      <a
        href="/"
        onclick={handleClick}
        class="block text-center px-4 py-2.5 text-sm bg-green-700/50 hover:bg-green-600/50 rounded-lg transition-colors font-medium"
      >
        View Site
      </a>
      <button
        onclick={() => { user.signOut(); handleClick(); }}
        class="w-full text-center px-4 py-2.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-lg transition-colors font-medium"
      >
        Sign Out
      </button>
    </div>
  </div>
</aside>

<style>
  /* Custom scrollbar for navigation */
  nav::-webkit-scrollbar {
    width: 6px;
  }
  
  nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  /* Ensure smooth touch scrolling on mobile */
  @media (max-width: 1024px) {
    aside {
      -webkit-overflow-scrolling: touch;
    }
  }
</style>