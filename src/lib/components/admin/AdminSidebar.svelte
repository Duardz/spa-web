<script lang="ts">
  import { user } from '$lib/stores/auth';
  
  interface Props {
    currentPath: string;
    onNavigate?: () => void;
  }
  
  let { currentPath, onNavigate }: Props = $props();
  
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

<aside class="h-full bg-green-800 text-white overflow-y-auto">
  <!-- Logo Section -->
  <div class="p-6 border-b border-green-700">
    <a href="/" class="flex items-center space-x-3">
      <img src="/logo.png" alt="Logo" class="h-10 w-10" />
      <div>
        <h2 class="text-lg font-bold">SPA Admin</h2>
        <p class="text-xs text-green-200">Management System</p>
      </div>
    </a>
  </div>
  
  <!-- Navigation -->
  <nav class="mt-6">
    <div class="px-3">
      <h3 class="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3">
        Main Navigation
      </h3>
      <ul class="space-y-1">
        {#each menuItems as item}
          <li>
            <a
              href={item.href}
              onclick={handleClick}
              class={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive(item.href)
                  ? 'bg-green-900 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
                }
              `}
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
              </svg>
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
  
  <!-- User Section -->
  <div class="absolute bottom-0 w-full p-4 border-t border-green-700">
    <div class="flex items-center space-x-3">
      {#if $user?.photoURL}
        <img 
          src={$user.photoURL} 
          alt="Profile" 
          class="h-10 w-10 rounded-full"
        />
      {:else}
        <div class="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
          <span class="text-white font-medium">
            {$user?.displayName?.charAt(0) || 'A'}
          </span>
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
    
    <div class="mt-3 flex space-x-2">
      <a
        href="/"
        class="flex-1 text-center px-3 py-1 text-xs bg-green-700 hover:bg-green-600 rounded transition-colors"
      >
        View Site
      </a>
      <button
        onclick={() => user.signOut()}
        class="flex-1 text-center px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
      >
        Sign Out
      </button>
    </div>
  </div>
</aside>