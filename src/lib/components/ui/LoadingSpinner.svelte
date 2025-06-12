<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'gray';
    fullScreen?: boolean;
  }
  
  let {
    size = 'md',
    color = 'primary',
    fullScreen = false
  }: Props = $props();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const colorClasses = {
    primary: 'text-green-700',
    white: 'text-white',
    gray: 'text-gray-600'
  };
</script>

{#if fullScreen}
  <div class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
    <div class="text-center">
      <svg class="animate-spin {sizeClasses[size]} {colorClasses[color]} mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-4 text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
{:else}
  <svg class="animate-spin {sizeClasses[size]} {colorClasses[color]}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
{/if}