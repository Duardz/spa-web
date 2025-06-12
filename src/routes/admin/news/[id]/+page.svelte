<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import NewsForm from '$lib/components/admin/NewsForm.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  
  let post = $state<NewsPost | null>(null);
  let loading = $state(true);
  let error = $state('');
  
  async function loadPost() {
    const postId = $page.params.id;
    
    try {
      const posts = await newsOps.getAll();
      const foundPost = posts.find(p => p.id === postId);
      
      if (foundPost) {
        post = foundPost;
      } else {
        error = 'News post not found';
      }
    } catch (err) {
      console.error('Error loading post:', err);
      error = 'Failed to load news post';
    } finally {
      loading = false;
    }
  }
  
  async function handleSubmit(data: Omit<NewsPost, 'id'>) {
    if (!post?.id) return;
    
    try {
      await newsOps.update(post.id, {
        ...data,
        publishedAt: post.publishedAt // Keep original publish date
      });
      goto('/admin/news');
    } catch (error) {
      console.error('Error updating news post:', error);
      throw error;
    }
  }
  
  function handleCancel() {
    goto('/admin/news');
  }
  
  onMount(() => {
    loadPost();
  });
</script>

<svelte:head>
  <title>Edit News Post - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="max-w-4xl">
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error}
    <Card>
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-600 mb-4">{error}</p>
        <Button variant="primary" onclick={() => goto('/admin/news')}>
          Back to News
        </Button>
      </div>
    </Card>
  {:else if post}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Edit News Post</h1>
      <p class="text-gray-600">Update: {post.title}</p>
    </div>
    
    <NewsForm 
      {post}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  {/if}
</div>