<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  const errorMessages: Record<number, { title: string; message: string }> = {
    404: {
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been moved.'
    },
    403: {
      title: 'Access Denied',
      message: 'You do not have permission to access this page.'
    },
    500: {
      title: 'Internal Server Error',
      message: 'Something went wrong on our end. Please try again later.'
    }
  };
  
  $: error = errorMessages[$page.status] || errorMessages[500];
  $: isAdminRoute = $page.url.pathname.startsWith('/admin');
</script>

<svelte:head>
  <title>{error.title} - Saint Patrick's Academy</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <Card class="max-w-md w-full text-center">
    <div class="mb-6">
      <div class="text-6xl font-bold text-green-600 mb-4">
        {$page.status}
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {error.title}
      </h1>
      <p class="text-gray-600">
        {error.message}
      </p>
    </div>
    
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      {#if isAdminRoute}
        <Button variant="outline" onclick={() => window.history.back()}>
          Go Back
        </Button>
        <a href="/admin">
          <Button variant="primary">
            Admin Dashboard
          </Button>
        </a>
      {:else}
        <a href="/">
          <Button variant="primary">
            Back to Home
          </Button>
        </a>
      {/if}
    </div>
    
    {#if $page.status === 404}
      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600 mb-3">Here are some helpful links:</p>
        <div class="flex flex-wrap gap-2 justify-center text-sm">
          <a href="/about" class="text-green-600 hover:text-green-700">About Us</a>
          <span class="text-gray-400">•</span>
          <a href="/enroll" class="text-green-600 hover:text-green-700">Enrollment</a>
          <span class="text-gray-400">•</span>
          <a href="/teachers" class="text-green-600 hover:text-green-700">Teachers</a>
          <span class="text-gray-400">•</span>
          <a href="/news" class="text-green-600 hover:text-green-700">News</a>
        </div>
      </div>
    {/if}
  </Card>
</div>