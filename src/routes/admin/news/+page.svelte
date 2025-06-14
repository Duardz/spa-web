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
  let viewMode = $state<'grid' | 'list'>('grid');
  
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
      day: 'numeric'
    });
  }
  
  function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-PH', {
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

<div class="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
  <!-- Header - Mobile Optimized -->
  <div class="space-y-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">News Posts</h1>
      <p class="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
        Manage news and announcements
      </p>
    </div>
    <div class="flex gap-2 justify-end">
      <Button variant="outline" onclick={loadPosts} size="sm">
        <svg class="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="hidden sm:inline">Refresh</span>
      </Button>
      <Button variant="primary" onclick={() => goto('/admin/news/new')} size="sm">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Post
      </Button>
    </div>
  </div>
  
  <!-- Filters and View Toggle -->
  <Card class="p-3 sm:p-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-3">
        <label for="filterSelect" class="text-xs sm:text-sm text-gray-700">Filter:</label>
        <select 
          id="filterSelect"
          bind:value={filter}
          class="text-xs sm:text-sm px-2.5 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Posts ({posts.length})</option>
          <option value="published">Published ({posts.filter(p => p.isPublished).length})</option>
          <option value="draft">Drafts ({posts.filter(p => !p.isPublished).length})</option>
        </select>
      </div>
      
      <!-- View Mode Toggle - Desktop Only -->
      <div class="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onclick={() => viewMode = 'grid'}
          class={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            viewMode === 'grid' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Grid view"
          aria-pressed={viewMode === 'grid'}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onclick={() => viewMode = 'list'}
          class={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            viewMode === 'list' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-label="List view"
          aria-pressed={viewMode === 'list'}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </Card>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if posts.length === 0}
    <Card>
      <div class="text-center py-8 sm:py-12">
        <svg class="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No News Posts Yet</h3>
        <p class="text-sm text-gray-600 mb-4">Create your first news post to get started.</p>
        <Button variant="primary" onclick={() => goto('/admin/news/new')} size="sm">
          Create First Post
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Mobile View - Always Cards -->
    <div class="sm:hidden space-y-3">
      {#each filteredPosts() as post}
        <Card class="overflow-hidden">
          <div class="flex gap-3 p-4">
            {#if post.imageUrl}
              <img 
                src={post.imageUrl} 
                alt=""
                class="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            {:else}
              <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            {/if}
            
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 text-sm line-clamp-1">{post.title}</h3>
              <p class="text-xs text-gray-600 line-clamp-2 mt-1">{post.excerpt}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{post.author}</span>
                <span>•</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </div>
          
          <div class="border-t px-4 py-2 bg-gray-50 flex items-center justify-between">
            <button
              onclick={() => togglePublish(post)}
              class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                post.isPublished 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              aria-label={`Toggle publish status for ${post.title}`}
            >
              {post.isPublished ? 'Published' : 'Draft'}
            </button>
            
            <div class="flex items-center gap-2">
              <a 
                href="/news/{post.id}"
                target="_blank"
                class="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                aria-label={`View ${post.title}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </a>
              <a 
                href="/admin/news/{post.id}"
                class="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                aria-label={`Edit ${post.title}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </a>
              <button
                onclick={() => deletePost(post.id!)}
                disabled={deleting === post.id}
                class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded disabled:opacity-50"
                aria-label={`Delete ${post.title}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
    
    <!-- Desktop View - Grid or List -->
    <div class="hidden sm:block">
      {#if viewMode === 'grid'}
        <!-- Grid View -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredPosts() as post}
            <Card class="overflow-hidden hover:shadow-lg transition-shadow">
              {#if post.imageUrl}
                <img 
                  src={post.imageUrl} 
                  alt=""
                  class="w-full h-48 object-cover"
                />
              {:else}
                <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              {/if}
              
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-medium text-gray-900 line-clamp-2 flex-1">{post.title}</h3>
                  <button
                    onclick={() => togglePublish(post)}
                    class={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.isPublished 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    aria-label={`Toggle publish status for ${post.title}`}
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </button>
                </div>
                
                <p class="text-sm text-gray-600 line-clamp-3 mb-3">{post.excerpt}</p>
                
                <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{post.author}</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                
                <div class="flex items-center justify-between pt-3 border-t">
                  <div class="flex items-center gap-2">
                    <a 
                      href="/news/{post.id}"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </a>
                    <span class="text-gray-300">•</span>
                    <a 
                      href="/admin/news/{post.id}"
                      class="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </a>
                  </div>
                  <button
                    onclick={() => deletePost(post.id!)}
                    disabled={deleting === post.id}
                    class="text-red-600 hover:text-red-900 disabled:opacity-50 text-sm"
                  >
                    {deleting === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {:else}
        <!-- List View - Table -->
        <Card>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
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
                        aria-label={`Toggle publish status for ${post.title}`}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(post.publishedAt)}
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
  {/if}
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>