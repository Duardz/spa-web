<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  
  let posts = $state<NewsPost[]>([]);
  let loading = $state(true);
  let deleting = $state<string | null>(null);
  let filter = $state<'all' | 'published' | 'draft'>('all');
  
  const filteredPosts = $derived(() => {
    if (filter === 'all') return posts;
    if (filter === 'published') return posts.filter(p => p.isPublished);
    return posts.filter(p => !p.isPublished);
  });
  
  async function loadPosts() {
    try {
      loading = true;
      posts = await newsOps.getAll();
    } catch (error) {
      console.error('Error loading news posts:', error);
    } finally {
      loading = false;
    }
  }
  
  async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      deleting = id;
      await newsOps.delete(id);
      posts = posts.filter(p => p.id !== id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      deleting = null;
    }
  }
  
  async function togglePublish(post: NewsPost) {
    try {
      await newsOps.update(post.id!, { isPublished: !post.isPublished });
      posts = posts.map(p => 
        p.id === post.id ? { ...p, isPublished: !p.isPublished } : p
      );
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  }
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  onMount(() => {
    loadPosts();
  });
</script>

<svelte:head>
  <title>Manage News - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">News Posts</h1>
      <p class="text-gray-600">Manage news and announcements</p>
    </div>
    <div class="flex space-x-3">
      <Button variant="outline" onclick={loadPosts}>
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </Button>
      <Button variant="primary" onclick={() => goto('/admin/news/new')}>
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Post
      </Button>
    </div>
  </div>
  
  <!-- Filters -->
  <Card>
    <div class="flex items-center space-x-4">
      <label class="text-sm text-gray-700">Filter:</label>
      <select 
        bind:value={filter}
        class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
      >
        <option value="all">All Posts</option>
        <option value="published">Published</option>
        <option value="draft">Drafts</option>
      </select>
      <span class="text-sm text-gray-600">
        Showing {filteredPosts().length} posts
      </span>
    </div>
  </Card>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if posts.length === 0}
    <Card>
      <div class="text-center py-12">
        <svg class="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No News Posts Yet</h3>
        <p class="text-gray-600 mb-4">Create your first news post to get started.</p>
        <Button variant="primary" onclick={() => goto('/admin/news/new')}>
          Create First Post
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Posts Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
              <th class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredPosts() as post}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    {#if post.imageUrl}
                      <img 
                        src={post.imageUrl} 
                        alt=""
                        class="w-10 h-10 rounded object-cover mr-3"
                      />
                    {:else}
                      <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    {/if}
                    <div>
                      <div class="text-sm font-medium text-gray-900 line-clamp-1">
                        {post.title}
                      </div>
                      <div class="text-sm text-gray-500 line-clamp-1">
                        {post.excerpt}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {post.author}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    onclick={() => togglePublish(post)}
                    class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.isPublished 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(post.publishedAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a 
                    href="/news/{post.id}"
                    target="_blank"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </a>
                  <a 
                    href="/admin/news/{post.id}"
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Edit
                  </a>
                  <button
                    onclick={() => deletePost(post.id!)}
                    disabled={deleting === post.id}
                    class="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deleting === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 1;
  }
</style>