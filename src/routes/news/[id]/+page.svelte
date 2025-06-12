<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  import { onMount } from 'svelte';
  
  let post = $state<NewsPost | null>(null);
  let loading = $state(true);
  let error = $state('');
  
  onMount(async () => {
    const postId = $page.params.id;
    
    try {
      const posts = await newsOps.getPublished(100); // Get more posts to find the one
      const foundPost = posts.find(p => p.id === postId);
      
      if (foundPost) {
        post = foundPost;
      } else {
        error = 'News post not found.';
      }
    } catch (err) {
      console.error('Error loading news post:', err);
      error = 'Failed to load news post. Please try again later.';
    } finally {
      loading = false;
    }
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
  {#if post}
    <title>{post.title} - Saint Patrick's Academy News</title>
    <meta name="description" content={post.excerpt}>
  {:else}
    <title>News - Saint Patrick's Academy</title>
  {/if}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error || !post}
    <Card>
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-600 mb-4">{error || 'News post not found.'}</p>
        <Button variant="primary" onclick={() => goto('/news')}>
          Back to News
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Back Button -->
    <div class="mb-6">
      <a 
        href="/news" 
        class="text-green-700 hover:text-green-800 font-medium inline-flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to News
      </a>
    </div>
    
    <!-- Article -->
    <article>
      {#if post.imageUrl}
        <img 
          src={post.imageUrl} 
          alt={post.title}
          class="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
        />
      {/if}
      
      <header class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        <div class="flex flex-wrap items-center text-sm text-gray-600 gap-4">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(post.publishedAt)}
          </div>
          
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            By {post.author}
          </div>
        </div>
      </header>
      
      <Card>
        <div class="prose prose-lg max-w-none">
          <!-- Lead/Excerpt -->
          {#if post.excerpt}
            <p class="text-xl text-gray-700 font-medium mb-6">
              {post.excerpt}
            </p>
          {/if}
          
          <!-- Content -->
          <div class="whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </Card>
      
      <!-- Share Section -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <h3 class="text-lg font-semibold mb-4">Share this article</h3>
        <div class="flex space-x-4">
          <a 
            href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(window.location.href)}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-700"
            aria-label="Share on Facebook"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  {/if}
</div>

<style>
  .prose {
    color: #374151;
  }
  
  .prose p {
    margin-bottom: 1rem;
    line-height: 1.75;
  }
  
  .prose :global(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .prose :global(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .prose :global(ul),
  .prose :global(ol) {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  .prose :global(li) {
    margin-bottom: 0.5rem;
  }
  
  .prose :global(strong) {
    font-weight: 600;
  }
  
  .prose :global(em) {
    font-style: italic;
  }
</style>