<!-- components/ui/Card.svelte -->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  
  interface Props extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    border?: boolean;
    gradient?: boolean;
    glass?: boolean;
  }
  
  let {
    padding = 'md',
    hover = false,
    shadow = 'md',
    rounded = 'lg',
    border = false,
    gradient = false,
    glass = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  
  const baseClasses = `
    relative overflow-hidden
    ${glass ? 'backdrop-blur-md bg-white/80' : 'bg-white'}
    ${border ? 'border border-gray-200' : ''}
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
  `;
  
  const hoverClasses = hover ? `
    transition-all duration-300 ease-in-out
    hover:shadow-xl hover:-translate-y-1
    hover:border-green-200
  ` : '';
  
  const classes = $derived(`
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${hoverClasses}
    ${className}
  `.trim());
</script>

<div class={classes} {...rest}>
  {#if gradient}
    <div class="absolute inset-0 bg-gradient-to-br from-green-50/20 to-gold-50/20 pointer-events-none"></div>
  {/if}
  
  {#if children}
    <div class="relative z-10">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  div {
    animation: cardFadeIn 0.4s ease-out;
  }
  
  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>