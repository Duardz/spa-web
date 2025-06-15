<script lang="ts">
  import { page } from '$app/stores';
  import { isAdmin } from '$lib/stores/auth';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  
  interface Props {
    mobile?: boolean;
    onNavigate?: () => void;
  }
  
  let { mobile = false, onNavigate }: Props = $props();
  
  const navItems = [
    { href: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/teachers', label: 'Teachers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/news', label: 'News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { href: '/enroll', label: 'Enrollment', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', special: true }
  ];
  
  const isActive = (href: string) => {
    return $page.url.pathname === href || 
           (href !== '/' && $page.url.pathname.startsWith(href));
  };
  
  const handleClick = () => {
    if (onNavigate) onNavigate();
  };
</script>

<nav class={mobile ? 'space-y-2 px-2' : 'flex items-center space-x-1'}>
  {#each navItems as item}
    <a
      href={item.href}
      class={`
        relative group overflow-hidden
        ${mobile 
          ? 'flex items-center space-x-3 px-4 py-3 rounded-2xl' 
          : 'flex items-center space-x-2 px-4 py-2.5 rounded-full'
        }
        ${isActive(item.href)
          ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg shadow-green-500/30'
          : item.special && $enrollmentSettings.isOpen
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-400 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-400/30'
            : 'text-gray-600 hover:text-gray-900'
        }
        transition-all duration-300 transform hover:scale-105
      `}
      onclick={handleClick}
    >
      <!-- Animated background for non-active items -->
      {#if !isActive(item.href)}
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-400/20 to-teal-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      {/if}
      
      <!-- Glow effect for active items -->
      {#if isActive(item.href)}
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
      {/if}
      
      <!-- Icon -->
      <svg 
        class={`
          ${mobile ? 'w-5 h-5' : 'w-4 h-4'} 
          ${isActive(item.href) ? 'animate-pulse' : ''}
          relative z-10 transition-transform duration-300 group-hover:rotate-12
        `} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
      </svg>
      
      <!-- Label -->
      <span class={`
        relative z-10 font-medium
        ${mobile ? 'text-base' : 'text-sm'}
        ${!isActive(item.href) ? 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600' : ''}
      `}>
        {item.label}
        {#if item.special && $enrollmentSettings.isOpen && !isActive(item.href)}
          <span class="ml-1.5 text-xs font-bold text-emerald-600 animate-pulse">(OPEN)</span>
        {/if}
      </span>
      
      <!-- Futuristic indicator for active state -->
      {#if isActive(item.href) && !mobile}
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
      {/if}
    </a>
  {/each}
  
  {#if $isAdmin}
    <div class="relative">
      <!-- Separator with glow effect -->
      {#if !mobile}
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-gradient-to-b from-transparent via-emerald-400 to-transparent"></div>
      {/if}
      
      <a
        href="/admin"
        class={`
          relative group overflow-hidden ml-3
          ${mobile 
            ? 'flex items-center space-x-3 px-4 py-3 rounded-2xl' 
            : 'flex items-center space-x-2 px-4 py-2.5 rounded-full'
          }
          ${isActive('/admin')
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg shadow-purple-500/30'
            : 'text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-purple-400'
          }
          transition-all duration-300 transform hover:scale-105
        `}
        onclick={handleClick}
      >
        <!-- Animated background -->
        {#if !isActive('/admin')}
          <div class="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-400/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        {/if}
        
        <!-- Icon -->
        <svg 
          class={`
            ${mobile ? 'w-5 h-5' : 'w-4 h-4'} 
            relative z-10 transition-transform duration-300 group-hover:rotate-180
          `} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        
        <!-- Label -->
        <span class={`
          relative z-10 font-bold
          ${mobile ? 'text-base' : 'text-sm'}
          ${!isActive('/admin') ? 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-red-600' : ''}
        `}>
          Admin
        </span>
      </a>
    </div>
  {/if}
</nav>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
</style>