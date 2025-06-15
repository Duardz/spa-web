<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { newsOps } from '$lib/firebase/firestore';
  import type { NewsPost } from '$lib/types';
  import { onMount } from 'svelte';
  
  let post = $state<NewsPost | null>(null);
  let loading = $state(true);
  let error = $state('');
  let isVisible = $state(false);
  let readingProgress = $state(0);
  let shareMenuOpen = $state(false);
  let copySuccess = $state(false);
  
  // Security: Validate and sanitize post ID
  function isValidPostId(id: string): boolean {
    // Assuming Firebase IDs are alphanumeric
    return /^[a-zA-Z0-9_-]+$/.test(id);
  }
  
  // Security: Sanitize content
  function sanitizeContent(content: string): string {
    return content
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers
  }
  
  onMount(async () => {
    const postId = $page.params.id;
    
    // Security: Validate post ID
    if (!isValidPostId(postId)) {
      error = 'Invalid post ID.';
      loading = false;
      return;
    }
    
    try {
      // Add timeout for better UX
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const postsPromise = newsOps.getPublished(100);
      const posts = await Promise.race([postsPromise, timeoutPromise]) as NewsPost[];
      
      const foundPost = posts.find(p => p.id === postId);
      
      if (foundPost) {
        // Security: Sanitize post content
        post = {
          ...foundPost,
          title: foundPost.title.substring(0, 200),
          content: sanitizeContent(foundPost.content),
          excerpt: foundPost.excerpt.substring(0, 300),
          author: foundPost.author.substring(0, 50),
          imageUrl: foundPost.imageUrl && isValidImageUrl(foundPost.imageUrl) ? foundPost.imageUrl : undefined
        };
        
        // Trigger animations
        if (browser) {
          isVisible = true;
          setupReadingProgress();
        }
      } else {
        error = 'News post not found.';
      }
    } catch (err) {
      console.error('Error loading news post:', err);
      error = 'Unable to load this news post. Please try again later.';
    } finally {
      loading = false;
    }
  });
  
  // Security: Validate image URLs
  function isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  
  // Reading progress indicator
  function setupReadingProgress() {
    if (!browser) return;
    
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      readingProgress = Math.min(100, Math.max(0, progress));
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
    
    return () => window.removeEventListener('scroll', updateProgress);
  }
  
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
  
  // Enhanced sharing functionality
  async function sharePost(platform: 'facebook' | 'twitter' | 'copy') {
    if (!browser || !post) return;
    
    const url = window.location.href;
    const title = post.title;
    
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer,width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank',
          'noopener,noreferrer,width=600,height=400'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          copySuccess = true;
          setTimeout(() => copySuccess = false, 2000);
        } catch {
          // Fallback for older browsers
          const input = document.createElement('input');
          input.value = url;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          copySuccess = true;
          setTimeout(() => copySuccess = false, 2000);
        }
        break;
    }
  }
  
  // Keyboard navigation
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && shareMenuOpen) {
      shareMenuOpen = false;
    }
  }
  
  // Global keyboard listener
  $effect(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<svelte:head>
  {#if post}
    <title>{post.title} - Saint Patrick's Academy News</title>
    <meta name="description" content={post.excerpt}>
    <meta property="og:title" content={post.title}>
    <meta property="og:description" content={post.excerpt}>
    <meta property="og:type" content="article">
    {#if post.imageUrl}
      <meta property="og:image" content={post.imageUrl}>
    {/if}
    <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()}>
    <meta property="article:author" content={post.author}>
  {:else}
    <title>News - Saint Patrick's Academy</title>
  {/if}
</svelte:head>

<!-- Reading Progress Bar -->
{#if browser && post}
  <div 
    class="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-200 z-50"
    style="width: {readingProgress}%"
    role="progressbar"
    aria-valuenow={readingProgress}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Reading progress"
  ></div>
{/if}

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {#if loading}
      <div class="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
        <LoadingSpinner size="lg" />
        <p class="text-gray-600 mt-4">Loading article...</p>
      </div>
    {:else if error || !post}
      <Card class="max-w-2xl mx-auto">
        <div class="text-center py-12">
          <svg class="w-20 h-20 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Article Not Found</h2>
          <p class="text-gray-600 mb-6">{error || 'The requested news post could not be found.'}</p>
          <Button 
            variant="primary" 
            onclick={() => goto('/news')}
            class="bg-emerald-600 hover:bg-emerald-700"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </Button>
        </div>
      </Card>
    {:else}
      <!-- Enhanced Back Button -->
      <nav class="mb-8 {isVisible ? 'animate-fade-in' : 'opacity-0'}" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm">
          <li>
            <a href="/" class="text-gray-500 hover:text-emerald-600 transition-colors">Home</a>
          </li>
          <li class="text-gray-400">/</li>
          <li>
            <a href="/news" class="text-gray-500 hover:text-emerald-600 transition-colors">News</a>
          </li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-700 font-medium truncate max-w-[200px]" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>
      
      <!-- Article Content -->
      <article class="{isVisible ? 'animate-slide-up' : 'opacity-0'}">
        {#if post.imageUrl}
          <div class="relative h-64 md:h-96 mb-8 rounded-2xl overflow-hidden group">
            <img 
              src={post.imageUrl} 
              alt=""
              class="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        {/if}
        
        <header class="mb-8">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div class="flex flex-wrap items-center text-sm text-gray-600 gap-4 pb-6 border-b border-gray-200">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time datetime={new Date(post.publishedAt).toISOString()}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
            
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              By <span class="font-medium ml-1">{post.author}</span>
            </div>
            
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
            </div>
          </div>
        </header>
        
        <Card class="relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400"></div>
          <div class="prose prose-lg max-w-none pl-8">
            <!-- Lead/Excerpt -->
            {#if post.excerpt}
              <p class="text-xl text-gray-700 font-medium mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            {/if}
            
            <!-- Main Content -->
            <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>
        </Card>
        
        <!-- Enhanced Share Section -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">Share this article</h3>
            
            <div class="relative">
              <button
                onclick={() => shareMenuOpen = !shareMenuOpen}
                class="flex items-center space-x-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label="Share options"
                aria-expanded={shareMenuOpen}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0a3 3 0 01-2.684 0M6.316 10.658a3 3 0 10-2.684 0" />
                </svg>
                <span>Share</span>
              </button>
              
              {#if shareMenuOpen}
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 animate-fade-in">
                  <button
                    onclick={() => sharePost('facebook')}
                    class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                  >
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  
                  <button
                    onclick={() => sharePost('twitter')}
                    class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                  >
                    <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span>Twitter</span>
                  </button>
                  
                  <button
                    onclick={() => sharePost('copy')}
                    class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                  >
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </article>
    {/if}
  </div>
</div>

<style>
  /* Animations */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.5s ease-out forwards;
  }
  
  /* Enhanced prose styles */
  .prose {
    color: #374151;
    font-size: 1.125rem;
    line-height: 1.75;
  }
  
  .prose p {
    margin-bottom: 1.5rem;
  }
  
  .prose :global(h2) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    color: #1f2937;
  }
  
  .prose :global(h3) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    color: #374151;
  }
  
  .prose :global(ul),
  .prose :global(ol) {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  
  .prose :global(li) {
    margin-bottom: 0.75rem;
    line-height: 1.75;
  }
  
  .prose :global(strong) {
    font-weight: 700;
    color: #1f2937;
  }
  
  .prose :global(em) {
    font-style: italic;
  }
  
  .prose :global(blockquote) {
    margin: 2rem 0;
    padding-left: 1.5rem;
    border-left: 4px solid #10b981;
    font-style: italic;
    color: #4b5563;
  }
  
  .prose :global(a) {
    color: #059669;
    text-decoration: underline;
    transition: color 0.2s;
  }
  
  .prose :global(a:hover) {
    color: #047857;
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
  
  /* Print styles */
  @media print {
    .prose {
      font-size: 12pt;
    }
    
    button,
    nav {
      display: none !important;
    }
  }
</style>