<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  
  let newsPosts = $state<NewsPost[]>([]);
  let loading = $state(true);
  let loadingMore = $state(false);
  let error = $state('');
  let hasMore = $state(true);
  let isVisible = $state(false);
  let currentFilter = $state<'all' | 'recent'>('all');
  let searchQuery = $state('');
  
  const POSTS_PER_PAGE = 9;
  const MAX_TITLE_LENGTH = 100;
  const MAX_EXCERPT_LENGTH = 200;
  
  // Security: Rate limiting
  let lastLoadTime = 0;
  const LOAD_COOLDOWN = 1000; // 1 second
  
  // Filtered posts based on search
  const filteredPosts = $derived(
    !searchQuery.trim() 
      ? newsPosts 
      : newsPosts.filter(post => {
          const query = searchQuery.toLowerCase();
          return post.title.toLowerCase().includes(query) ||
                 post.excerpt.toLowerCase().includes(query) ||
                 post.author.toLowerCase().includes(query);
        })
  );
  
  async function loadNews(loadMore = false) {
    // Rate limiting
    const now = Date.now();
    if (now - lastLoadTime < LOAD_COOLDOWN) return;
    lastLoadTime = now;
    
    try {
      if (loadMore) {
        loadingMore = true;
      } else {
        loading = true;
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const postsPromise = newsOps.getPublished(POSTS_PER_PAGE);
      const posts = await Promise.race([postsPromise, timeoutPromise]) as NewsPost[];
      
      // Security: Sanitize posts
      const sanitizedPosts = posts.map(post => ({
        ...post,
        title: sanitizeText(post.title, MAX_TITLE_LENGTH),
        excerpt: sanitizeText(post.excerpt, MAX_EXCERPT_LENGTH),
        author: sanitizeText(post.author, 50),
        imageUrl: post.imageUrl && isValidImageUrl(post.imageUrl) ? post.imageUrl : undefined
      }));
      
      if (loadMore) {
        // Check for duplicates before adding
        const existingIds = new Set(newsPosts.map(p => p.id));
        const newUniquePosts = sanitizedPosts.filter(p => !existingIds.has(p.id));
        newsPosts = [...newsPosts, ...newUniquePosts];
      } else {
        newsPosts = sanitizedPosts;
      }
      
      hasMore = posts.length === POSTS_PER_PAGE;
      error = '';
    } catch (err) {
      console.error('Error loading news:', err);
      error = 'Unable to load news. Please check your connection and try again.';
    } finally {
      loading = false;
      loadingMore = false;
    }
  }
  
  // Security: Text sanitization
  function sanitizeText(text: string, maxLength: number): string {
    return text
      .replace(/[<>]/g, '')
      .substring(0, maxLength)
      .trim();
  }
  
  // Security: Validate image URLs
  function isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  
  onMount(() => {
    if (browser) {
      isVisible = true;
    }
    loadNews();
  });
  
  function formatDate(date: Date): string {
    try {
      return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date unavailable';
    }
  }
  
  // Handle search with debouncing
  let searchTimeout: ReturnType<typeof setTimeout>;
  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = value;
    }, 300);
  }
  
  // Filter by recent posts (last 30 days)
  function filterRecent() {
    if (currentFilter === 'recent') {
      currentFilter = 'all';
    } else {
      currentFilter = 'recent';
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      // This would require filtering in the actual implementation
    }
  }
</script>

<svelte:head>
  <title>News & Updates - Saint Patrick's Academy</title>
  <meta name="description" content="Stay updated with the latest news, announcements, and events from Saint Patrick's Academy in Paltic, Dingalan, Aurora.">
  <meta property="og:title" content="News & Updates - Saint Patrick's Academy">
  <meta property="og:description" content="Latest news, announcements, and events from our school community.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://saintpatricksacademy.edu.ph/news">
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Enhanced Page Header -->
    <div class="text-center mb-12 py-12 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl relative overflow-hidden {isVisible ? 'animate-fade-in' : 'opacity-0'}">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-2xl" aria-hidden="true"></div>
      
      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          News & Updates
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Stay informed about the latest happenings at Saint Patrick's Academy
        </p>
      </div>
    </div>
    
    <!-- Search and Filter Section -->
    <div class="mb-8 {isVisible ? 'animate-slide-up' : 'opacity-0'}">
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <input
            type="search"
            placeholder="Search news..."
            class="w-full px-6 py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            oninput={(e) => handleSearch(e.currentTarget.value)}
            aria-label="Search news posts"
          />
          <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    {#if loading && newsPosts.length === 0}
      <div class="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
        <LoadingSpinner size="lg" />
        <p class="text-gray-600 mt-4">Loading latest news...</p>
      </div>
    {:else if error}
      <Card class="max-w-2xl mx-auto">
        <div class="text-center py-12">
          <svg class="w-20 h-20 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Unable to Load News</h2>
          <p class="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onclick={() => loadNews()}
            class="bg-emerald-600 hover:bg-emerald-700"
          >
            Try Again
          </Button>
        </div>
      </Card>
    {:else if filteredPosts.length === 0}
      <Card class="max-w-2xl mx-auto">
        <div class="text-center py-12">
          <svg class="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p class="text-gray-600">
            {searchQuery ? 'No news posts match your search.' : 'No news posts available at the moment.'}
          </p>
        </div>
      </Card>
    {:else}
      <!-- News Grid with Enhanced Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 {isVisible ? 'animate-slide-up animation-delay-200' : 'opacity-0'}" role="list">
        {#each filteredPosts as post, index (post.id)}
          <article 
            class="group relative flex flex-col h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            style="animation-delay: {index * 50}ms"
            role="listitem"
          >
            {#if post.imageUrl}
              <div class="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={post.imageUrl} 
                  alt=""
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  onerror={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center"><svg class="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                    }
                  }}
                />
              </div>
            {:else}
              <div class="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <svg class="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            {/if}
            
            <div class="flex flex-col flex-grow p-6">
              <h2 class="text-xl font-bold mb-3 text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                <a 
                  href="/news/{post.id}" 
                  class="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
                  aria-label="Read more about {post.title}"
                >
                  {post.title}
                </a>
              </h2>
              
              <p class="text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div class="mt-auto">
                <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <time datetime={new Date(post.publishedAt).toISOString()} class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(post.publishedAt)}
                  </time>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {post.author}
                  </span>
                </div>
                
                <a 
                  href="/news/{post.id}" 
                  class="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center group/link transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Read more
                  <svg class="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
            
            <!-- Hover gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </article>
        {/each}
      </div>
      
      <!-- Load More with Loading State -->
      {#if hasMore && !searchQuery}
        <div class="text-center mt-12">
          <Button 
            variant="outline" 
            onclick={() => loadNews(true)}
            disabled={loadingMore}
            class="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {#if loadingMore}
              <span class="inline-flex items-center">
                <LoadingSpinner size="sm" />
                <span class="ml-2">Loading...</span>
              </span>
            {:else}
              Load More News
            {/if}
          </Button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  /* Animations */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  /* Line clamping */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
  }
  
  /* Loading spinner in button */
  :global(.min-w-\[200px\]) {
    min-width: 200px;
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .bg-gradient-to-r,
    .bg-gradient-to-br {
      background: transparent !important;
    }
    
    .text-transparent {
      -webkit-text-fill-color: currentColor !important;
      background: transparent !important;
    }
  }
</style>