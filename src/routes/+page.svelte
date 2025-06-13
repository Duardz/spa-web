<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  import { newsOps } from '$lib/firebase/firestore';
  import { user } from '$lib/stores/auth';
  import type { NewsPost } from '$lib/types';
  import { onMount } from 'svelte';
  
  let latestNews = $state<NewsPost[]>([]);
  let newsLoading = $state(true);
  
  // Derive authentication state from the user store
  const isAuthenticated = $derived($user !== null);
  
  onMount(async () => {
    try {
      console.log('Fetching news posts...');
      latestNews = await newsOps.getPublished(3);
      console.log('Fetched news:', latestNews);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      newsLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Saint Patrick's Academy - Quality Catholic Education in Agusan del Sur</title>
  <meta name="description" content="Saint Patrick's Academy provides quality Catholic education for Junior and Senior High School students in San Francisco, Agusan del Sur.">
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-green-700 to-green-900 text-white">
  <div class="absolute inset-0 bg-black opacity-20"></div>
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
    <div class="text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        Welcome to Saint Patrick's Academy
      </h1>
      <p class="text-xl md:text-2xl mb-8 text-green-100">
        Nurturing Minds, Building Character, Inspiring Excellence
      </p>
      {#if $enrollmentSettings.isOpen}
        <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <a href="/enroll">
            <Button variant="secondary" size="lg">
              Enroll Now for SY {$enrollmentSettings.schoolYear}
            </Button>
          </a>
          <a href="/about">
            <Button variant="outline" size="lg" class="!text-white !border-white hover:!bg-white hover:!text-green-700">
              Learn More About Us
            </Button>
          </a>
        </div>
      {:else}
        <a href="/about">
          <Button variant="secondary" size="lg">
            Learn More About Us
          </Button>
        </a>
      {/if}
    </div>
  </div>
  
  <!-- Decorative wave -->
  <div class="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9F6F0"/>
    </svg>
  </div>
</section>

<!-- Features Section -->
<section class="py-16 md:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Why Choose Saint Patrick's Academy?
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        We provide holistic education that develops students academically, spiritually, and morally.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card hover class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Academic Excellence</h3>
        <p class="text-gray-600">
          Comprehensive curriculum aligned with DepEd standards, preparing students for higher education and future careers.
        </p>
      </Card>
      
      <Card hover class="text-center">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Values Formation</h3>
        <p class="text-gray-600">
          Strong Catholic foundation that nurtures faith, character, and moral values in our students.
        </p>
      </Card>
      
      <Card hover class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">Community Spirit</h3>
        <p class="text-gray-600">
          A supportive environment where students, teachers, and parents work together for success.
        </p>
      </Card>
    </div>
  </div>
</section>

<!-- Academic Programs -->
<section class="py-16 md:py-24 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Our Academic Programs
      </h2>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
              JHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-2">Junior High School</h3>
            <p class="text-gray-600 mb-4">
              Grades 7 to 10 following the K-12 curriculum with emphasis on core subjects and values education.
            </p>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Strong foundation in Mathematics, Science, English, and Filipino
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Values Education and Christian Living
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Co-curricular activities and student organizations
              </li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold">
              SHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-2">Senior High School</h3>
            <p class="text-gray-600 mb-4">
              Grades 11 and 12 with specialized academic tracks preparing students for college and careers.
            </p>
            <div class="space-y-3">
              <div>
                <h4 class="font-semibold text-gray-800">Available Strands:</h4>
                <ul class="mt-2 space-y-1 text-gray-600">
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    STEM - Science, Technology, Engineering & Mathematics
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    HUMSS - Humanities and Social Sciences
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    ABM - Accountancy, Business and Management
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>

<!-- Latest News -->
<section class="py-16 md:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Latest News & Updates
      </h2>
    </div>
    
    {#if newsLoading}
      <div class="flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    {:else if latestNews.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each latestNews as post}
          <Card hover>
            {#if post.imageUrl}
              <img 
                src={post.imageUrl} 
                alt={post.title}
                class="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
              />
            {/if}
            <h3 class="text-xl font-semibold mb-2">
              <a href="/news/{post.id}" class="hover:text-green-700 transition-colors">
                {post.title}
              </a>
            </h3>
            <p class="text-gray-600 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(post.publishedAt).toLocaleDateString('en-PH')}</span>
              <a href="/news/{post.id}" class="text-green-700 hover:text-green-800 font-medium">
                Read more →
              </a>
            </div>
          </Card>
        {/each}
      </div>
      
      <div class="text-center mt-8">
        <a href="/news">
          <Button variant="outline">View All News</Button>
        </a>
      </div>
    {:else}
      <p class="text-center text-gray-600">No news available at the moment.</p>
    {/if}
  </div>
</section>

<!-- CTA Section -->
{#if $enrollmentSettings.isOpen}
  <section class="py-16 bg-green-700 text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        Enrollment is Now Open!
      </h2>
      <p class="text-xl mb-8 text-green-100">
        Join our community for School Year {$enrollmentSettings.schoolYear}
      </p>
      <div class="space-y-4">
        <a href="/enroll">
          <Button variant="secondary" size="lg">
            {isAuthenticated ? 'Start Your Application' : 'View Enrollment Details'}
          </Button>
        </a>
        {#if !isAuthenticated}
          <p class="text-sm text-green-200">
            Sign in required to submit application
          </p>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
  }
</style>