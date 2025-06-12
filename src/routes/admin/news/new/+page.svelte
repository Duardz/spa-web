<script lang="ts">
  import { goto } from '$app/navigation';
  import NewsForm from '$lib/components/admin/NewsForm.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  
  async function handleSubmit(data: Omit<NewsPost, 'id'>) {
    try {
      await newsOps.create(data);
      goto('/admin/news');
    } catch (error) {
      console.error('Error creating news post:', error);
      throw error;
    }
  }
  
  function handleCancel() {
    goto('/admin/news');
  }
</script>

<svelte:head>
  <title>Create News Post - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="max-w-4xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Create News Post</h1>
    <p class="text-gray-600">Write a new article or announcement</p>
  </div>
  
  <NewsForm 
    onSubmit={handleSubmit}
    onCancel={handleCancel}
  />
</div>