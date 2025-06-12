<script lang="ts">
  import { page } from '$app/stores';
  import { isAdmin } from '$lib/stores/auth';
  
  interface Props {
    mobile?: boolean;
    onNavigate?: () => void;
  }
  
  let { mobile = false, onNavigate }: Props = $props();
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/teachers', label: 'Teachers' },
    { href: '/news', label: 'News' },
    { href: '/enroll', label: 'Enrollment' }
  ];
  
  const isActive = (href: string) => {
    return $page.url.pathname === href || 
           (href !== '/' && $page.url.pathname.startsWith(href));
  };
  
  const handleClick = () => {
    if (onNavigate) onNavigate();
  };
</script>

<nav class={mobile ? 'space-y-1' : 'flex space-x-4'}>
  {#each navItems as item}
    <a
      href={item.href}
      class={`
        ${mobile ? 'block px-3 py-2 rounded-md text-base font-medium' : 'px-3 py-2 rounded-md text-sm font-medium'}
        ${isActive(item.href) 
          ? 'text-green-700 bg-green-50' 
          : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
        }
        transition-colors duration-200
      `}
      onclick={handleClick}
    >
      {item.label}
    </a>
  {/each}
  
  {#if $isAdmin}
    <a
      href="/admin"
      class={`
        ${mobile ? 'block px-3 py-2 rounded-md text-base font-medium' : 'px-3 py-2 rounded-md text-sm font-medium'}
        ${isActive('/admin') 
          ? 'text-green-700 bg-green-50' 
          : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
        }
        transition-colors duration-200
      `}
      onclick={handleClick}
    >
      Admin
    </a>
  {/if}
</nav>