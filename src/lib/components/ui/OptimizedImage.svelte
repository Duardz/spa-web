<!-- src/lib/components/ui/OptimizedImage.svelte -->
<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    class?: string;
  }
  
  let { src, alt, width, height, loading = 'lazy', class: className = '' }: Props = $props();
  
  let isLoaded = $state(false);
  let hasError = $state(false);
  
  // Generate srcset for responsive images
  function generateSrcset(): string {
    if (!src) return '';
    
    const widths = [320, 640, 768, 1024, 1280];
    return widths
      .map(w => `${src}?w=${w} ${w}w`)
      .join(', ');
  }
  
  const srcset = generateSrcset();
</script>

<div class={`relative ${className}`}>
  {#if !isLoaded && !hasError}
    <div class="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
  {/if}
  
  {#if hasError}
    <div class="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  {:else}
    <img
      {src}
      {srcset}
      {alt}
      {width}
      {height}
      {loading}
      onload={() => isLoaded = true}
      onerror={() => hasError = true}
      class={`${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
    />
  {/if}
</div>