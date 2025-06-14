<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  
  let newsPosts = $state<NewsPost[]>([]);
  let loading = $state(true);
  let error = $state('');
  let hasMore = $state(true);
  
  const POSTS_PER_PAGE = 9;
  
  async function loadNews(loadMore = false) {
    try {
      if (!loadMore) loading = true;
      
      const posts = await newsOps.getPublished(POSTS_PER_PAGE);
      
      if (loadMore) {
        newsPosts = [...newsPosts, ...posts];
      } else {
        newsPosts = posts;
      }
      
      hasMore = posts.length === POSTS_PER_PAGE;
    } catch (err) {
      console.error('Error loading news:', err);
      error = 'Failed to load news. Please try again later.';
    } finally {
      loading = false;
    }
  }
  
  onMount(() => {
    loadNews();
  });
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>News & Updates - Saint Patrick's Academy</title>
  <meta name="description" content="Stay updated with the latest news, announcements, and events from Saint Patrick's Academy.">
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Page Header -->
  <div class="text-center mb-16 py-8 bg-gradient-to-br from-green-50 to-white rounded-2xl">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-serif">News & Updates</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Stay informed about the latest happenings at Saint Patrick's Academy
    </p>
  </div>
  
  {#if loading && newsPosts.length === 0}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error}
    <Card class="max-w-2xl mx-auto">
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-600">{error}</p>
      </div>
    </Card>
  {:else if newsPosts.length === 0}
    <Card class="max-w-2xl mx-auto">
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p class="text-gray-600">No news posts available at the moment.</p>
      </div>
    </Card>
  {:else}
    <!-- News Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each newsPosts as post}
        <Card hover class="flex flex-col h-full border border-gray-100 hover:border-green-200 transition-all duration-300 overflow-hidden">
          {#if post.imageUrl}
            <div class="h-48 overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          {:else}
            <div class="h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
              <svg class="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          {/if}
          
          <div class="flex flex-col flex-grow p-6">
            <h2 class="text-xl font-semibold mb-2 text-gray-800">
              <a href="/news/{post.id}" class="hover:text-green-600 transition-colors">
                {post.title}
              </a>
            </h2>
            
            <p class="text-gray-600 mb-4 flex-grow line-clamp-3">
              {post.excerpt}
            </p>
            
            <div class="mt-auto">
              <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{formatDate(post.publishedAt)}</span>
                <span>By {post.author}</span>
              </div>
              
              <a 
                href="/news/{post.id}" 
                class="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
              >
                Read more
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </Card>
      {/each}
    </div>
    
    <!-- Load More -->
    {#if hasMore}
      <div class="text-center mt-12">
        <Button 
          variant="outline" 
          onclick={() => loadNews(true)}
          loading={loading}
          class="border-green-600 text-green-700 hover:bg-green-50"
        >
          Load More News
        </Button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
  }
</style>