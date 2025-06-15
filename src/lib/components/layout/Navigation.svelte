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

<nav class={mobile ? 'space-y-1.5 px-2' : 'flex items-center space-x-1'}>
  {#each navItems as item}
    <a
      href={item.href}
      class={`
        relative group
        ${mobile 
          ? 'flex items-center space-x-3 px-4 py-2.5 rounded-xl' 
          : 'flex items-center space-x-2 px-3.5 py-2 rounded-lg'
        }
        ${isActive(item.href)
          ? 'bg-emerald-600 text-white shadow-sm'
          : item.special && $enrollmentSettings.isOpen
            ? 'bg-emerald-50 text-emerald-700 font-medium'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
        transition-all duration-200
      `}
      onclick={handleClick}
    >
      <!-- Clean hover effect -->
      {#if !isActive(item.href)}
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
      {/if}
      
      <!-- Icon -->
      <svg 
        class={`
          ${mobile ? 'w-5 h-5' : 'w-4 h-4'} 
          flex-shrink-0
          ${isActive(item.href) ? 'text-white' : ''}
        `} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
      </svg>
      
      <!-- Label -->
      <span class={`
        relative font-medium
        ${mobile ? 'text-sm' : 'text-sm'}
      `}>
        {item.label}
        {#if item.special && $enrollmentSettings.isOpen && !isActive(item.href)}
          <span class="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            OPEN
          </span>
        {/if}
      </span>
    </a>
  {/each}
  
  {#if $isAdmin}
    <div class="relative">
      <!-- Clean separator -->
      {#if !mobile}
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-gray-300"></div>
      {/if}
      
      <a
        href="/admin"
        class={`
          relative group ml-3
          ${mobile 
            ? 'flex items-center space-x-3 px-4 py-2.5 rounded-xl' 
            : 'flex items-center space-x-2 px-3.5 py-2 rounded-lg'
          }
          ${isActive('/admin')
            ? 'bg-gray-800 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          transition-all duration-200
        `}
        onclick={handleClick}
      >
        <!-- Icon -->
        <svg 
          class={`
            ${mobile ? 'w-5 h-5' : 'w-4 h-4'} 
            flex-shrink-0
          `} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        
        <!-- Label -->
        <span class="font-medium text-sm">
          Admin
        </span>
        
        <!-- Pro badge -->
        <svg class="w-3.5 h-3.5 ml-1 opacity-60" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
  {/if}
</nav>