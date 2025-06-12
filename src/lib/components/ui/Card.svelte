<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  
  interface Props extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
  }
  
  let {
    padding = 'md',
    hover = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const classes = $derived(`
    bg-white rounded-lg shadow-md
    ${paddingClasses[padding]}
    ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
    ${className}
  `.trim());
</script>

<div class={classes} {...rest}>
  {#if children}
    {@render children()}
  {/if}
</div>