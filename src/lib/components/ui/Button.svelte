<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    fullWidth?: boolean;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadow?: boolean;
    pulse?: boolean;
  }
  
  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    rounded = 'lg',
    shadow = true,
    pulse = false,
    class: className = '',
    disabled = false,
    children,
    ...rest
  }: Props = $props();
  
  const dispatch = createEventDispatcher();
  
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
    relative overflow-hidden
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-green-600 to-green-700 text-white
      hover:from-green-700 hover:to-green-800
      focus:ring-green-500
      ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
    `,
    secondary: `
      bg-gradient-to-r from-gold-500 to-gold-600 text-white
      hover:from-gold-600 hover:to-gold-700
      focus:ring-gold-400
      ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
    `,
    outline: `
      border-2 border-green-600 text-green-700
      hover:bg-green-50 hover:border-green-700
      focus:ring-green-500
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100
      focus:ring-gray-400
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500
      ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-emerald-700 text-white
      hover:from-emerald-700 hover:to-emerald-800
      focus:ring-emerald-500
      ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
    `
  };
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-5 py-3 text-lg gap-2.5',
    xl: 'px-6 py-3.5 text-xl gap-3'
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  const classes = $derived(`
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${fullWidth ? 'w-full' : ''}
    ${pulse && !disabled ? 'animate-pulse' : ''}
    ${className}
  `.trim());
  
  function handleClick(e: MouseEvent) {
    if (!disabled && !loading) {
      // Ripple effect
      const button = e.currentTarget as HTMLButtonElement;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
      
      dispatch('click', e);
    }
  }
</script>

<button
  class={classes}
  disabled={disabled || loading}
  onclick={handleClick}
  {...rest}
>
  {#if loading}
    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  :global(.ripple) {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
</style>