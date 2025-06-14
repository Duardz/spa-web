<!-- src/routes/+page.svelte -->
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
  let currentTestimonial = $state(0);
  
  // Derive authentication state from the user store
  const isAuthenticated = $derived($user !== null);
  
  // Testimonials data
  const testimonials = [
    {
      name: "Maria Santos",
      role: "Parent",
      content: "Saint Patrick's Academy has been instrumental in shaping my daughter's future. The values-based education and dedicated teachers make all the difference.",
      avatar: "/testimonial-1.jpg"
    },
    {
      name: "John Dela Cruz",
      role: "Alumni, Class of 2020",
      content: "The foundation I received at SPA prepared me well for college. The teachers genuinely care about each student's success.",
      avatar: "/testimonial-2.jpg"
    },
    {
      name: "Ana Reyes",
      role: "Grade 12 Student",
      content: "Being part of the SPA family has been amazing. The school provides so many opportunities for growth, both academically and spiritually.",
      avatar: "/testimonial-3.jpg"
    }
  ];
  
  // Auto-rotate testimonials
  $effect(() => {
    const interval = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }, 5000);
    
    return () => clearInterval(interval);
  });
  
  onMount(async () => {
    try {
      latestNews = await newsOps.getPublished(3);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      newsLoading = false;
    }
  });
  
  // Stats for the counter section
  const stats = [
    { number: "50+", label: "Years of Excellence", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
    { number: "1000+", label: "Graduates", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { number: "95%", label: "College Acceptance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { number: "30+", label: "Dedicated Teachers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }
  ];
</script>

<svelte:head>
  <title>Saint Patrick's Academy - Quality Catholic Education in Paltic, Dingalan, Aurora</title>
  <meta name="description" content="Saint Patrick's Academy provides quality Catholic education for Junior and Senior High School students in Paltic, Dingalan, Aurora.">
</svelte:head>

<!-- Hero Section with Elegant Design -->
<section class="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
  <!-- Subtle Pattern Background -->
  <div class="absolute inset-0 opacity-5">
    <div class="absolute inset-0 bg-[url('/shamrock-pattern.svg')] bg-repeat"></div>
  </div>
  
  <!-- Decorative Elements -->
  <div class="absolute top-0 left-0 w-96 h-96 bg-green-100 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
  <div class="absolute bottom-0 right-0 w-96 h-96 bg-gold-100 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
  
  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
    <div class="text-center w-full">
      <!-- School Crest -->
      <div class="mb-8 relative inline-block">
        <div class="absolute inset-0 bg-green-200/30 blur-2xl rounded-full"></div>
        <img 
          src="/logo.png" 
          alt="Saint Patrick's Academy Crest" 
          class="h-32 w-32 md:h-40 md:w-40 relative filter drop-shadow-lg"
        />
      </div>
      
      <h1 class="text-4xl md:text-6xl font-bold text-green-800 mb-4 font-serif">
        Saint Patrick's Academy
      </h1>
      
      <div class="flex items-center justify-center space-x-4 mb-4">
        <div class="h-px bg-gold-400/50 w-16 md:w-24"></div>
        <svg class="w-6 h-6 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <div class="h-px bg-gold-400/50 w-16 md:w-24"></div>
      </div>
      
      <p class="text-lg md:text-xl text-green-700 mb-2">
        Excellence in Catholic Education Since 1970
      </p>
      
      <p class="text-base md:text-lg text-gray-600 mb-2">
        Paltic, Dingalan, Aurora
      </p>
      
      <p class="text-base md:text-lg text-gray-500 mb-10 max-w-3xl mx-auto italic">
        "Nurturing Minds • Building Character • Inspiring Excellence"
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        {#if $enrollmentSettings.isOpen}
          <Button 
            size="lg" 
            variant="primary" 
            class="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            rounded="full"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Enroll Now for SY {$enrollmentSettings.schoolYear}
          </Button>
        {/if}
        
        <Button 
          size="lg" 
          variant="outline" 
          class="border-green-600 text-green-700 hover:bg-green-50" 
          rounded="full"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Learn More About Us
        </Button>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-green-600/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </div>
</section>

<!-- Stats Counter Section -->
<section class="py-16 bg-white border-y border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      {#each stats as stat, i}
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mb-3">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
            </svg>
          </div>
          <div class="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
          <div class="text-gray-600 text-sm">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-serif">
        Why Choose Saint Patrick's Academy?
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        We provide holistic education that develops students academically, spiritually, and morally.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card class="text-center p-8 hover:shadow-lg transition-shadow duration-300 bg-white">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3 text-gray-800">Academic Excellence</h3>
        <p class="text-gray-600 leading-relaxed">
          Comprehensive curriculum aligned with DepEd standards, preparing students for higher education and future careers.
        </p>
      </Card>
      
      <Card class="text-center p-8 hover:shadow-lg transition-shadow duration-300 bg-white">
        <div class="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3 text-gray-800">Values Formation</h3>
        <p class="text-gray-600 leading-relaxed">
          Strong Catholic foundation that nurtures faith, character, and moral values in our students.
        </p>
      </Card>
      
      <Card class="text-center p-8 hover:shadow-lg transition-shadow duration-300 bg-white">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3 text-gray-800">Community Spirit</h3>
        <p class="text-gray-600 leading-relaxed">
          A supportive environment where students, teachers, and parents work together for success.
        </p>
      </Card>
    </div>
  </div>
</section>

<!-- Academic Programs Section -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-serif">
        Our Academic Programs
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Comprehensive education pathways designed to prepare students for success
      </p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card class="p-8 border-2 border-green-100 hover:border-green-300 transition-colors duration-300">
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <div class="w-14 h-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center font-bold text-lg">
              JHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-3 text-gray-800">Junior High School</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Grades 7 to 10 following the K-12 curriculum with emphasis on core subjects and values education.
            </p>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Strong foundation in Mathematics, Science, English, and Filipino
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Values Education and Christian Living
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Co-curricular activities and student organizations
              </li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card class="p-8 border-2 border-gold-100 hover:border-gold-300 transition-colors duration-300">
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <div class="w-14 h-14 bg-gold-100 text-gold-700 rounded-xl flex items-center justify-center font-bold text-lg">
              SHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-3 text-gray-800">Senior High School</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Grades 11 and 12 with specialized academic tracks preparing students for college and careers.
            </p>
            <div class="space-y-2">
              <h4 class="font-semibold text-gray-700">Available Strands:</h4>
              <ul class="space-y-1 text-gray-600">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span class="font-medium">STEM</span> - Science, Technology, Engineering & Mathematics
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span class="font-medium">HUMSS</span> - Humanities and Social Sciences
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span class="font-medium">ABM</span> - Accountancy, Business and Management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section class="py-20 bg-green-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-serif">
        What Our Community Says
      </h2>
      <p class="text-lg text-gray-600">
        Hear from our students, parents, and alumni
      </p>
    </div>
    
    <div class="relative">
      <Card class="bg-white p-10 max-w-4xl mx-auto shadow-xl">
        <div class="relative">
          <!-- Quote Icon -->
          <svg class="absolute -top-6 -left-6 w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          
          <!-- Testimonial Content -->
          <div class="text-center">
            <p class="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-6">
              "{testimonials[currentTestimonial].content}"
            </p>
            
            <div class="flex items-center justify-center">
              <div class="w-14 h-14 bg-gray-200 rounded-full mr-4"></div>
              <div class="text-left">
                <h4 class="font-semibold text-gray-800">{testimonials[currentTestimonial].name}</h4>
                <p class="text-gray-600 text-sm">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
          
          <!-- Dots Indicator -->
          <div class="flex justify-center mt-6 space-x-2">
            {#each testimonials as _, i}
              <button
                onclick={() => currentTestimonial = i}
                class={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentTestimonial === i 
                    ? 'w-8 bg-green-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label="Go to testimonial {i + 1}"
              ></button>
            {/each}
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>

<!-- Latest News Section -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-serif">
        Latest News & Updates
      </h2>
      <p class="text-lg text-gray-600">
        Stay informed about what's happening at Saint Patrick's Academy
      </p>
    </div>
    
    {#if newsLoading}
      <div class="flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    {:else if latestNews.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each latestNews as post, i}
          <Card class="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
            
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
                <a href="/news/{post.id}" class="hover:text-green-600 transition-colors">
                  {post.title}
                </a>
              </h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">{new Date(post.publishedAt).toLocaleDateString('en-PH')}</span>
                <a href="/news/{post.id}" class="text-green-600 hover:text-green-700 font-medium">
                  Read more →
                </a>
              </div>
            </div>
          </Card>
        {/each}
      </div>
      
      <div class="text-center mt-10">
        <a href="/news">
          <Button variant="outline" class="border-green-600 text-green-700 hover:bg-green-50">
            View All News
          </Button>
        </a>
      </div>
    {:else}
      <Card class="text-center py-12">
        <p class="text-gray-600">No news available at the moment.</p>
      </Card>
    {/if}
  </div>
</section>

<!-- CTA Section -->
{#if $enrollmentSettings.isOpen}
  <section class="py-20 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
    <!-- Subtle Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-[url('/shamrock-pattern.svg')] bg-repeat"></div>
    </div>
    
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
        Begin Your Journey With Us
      </h2>
      <p class="text-xl mb-8 text-green-50 max-w-2xl mx-auto">
        Join our community of learners for School Year {$enrollmentSettings.schoolYear}
      </p>
      
      <div class="inline-flex flex-col sm:flex-row gap-4">
        <a href="/enroll">
          <Button 
            size="lg" 
            class="bg-white text-green-700 hover:bg-green-50 shadow-lg"
            rounded="full"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isAuthenticated ? 'Start Your Application' : 'View Enrollment Details'}
          </Button>
        </a>
        
        <a href="/about">
          <Button 
            size="lg" 
            variant="outline" 
            class="border-white text-white hover:bg-white/10" 
            rounded="full"
          >
            Learn More About SPA
          </Button>
        </a>
      </div>
      
      {#if !isAuthenticated}
        <p class="text-sm text-green-100 mt-6">
          Sign in required to submit application
        </p>
      {/if}
    </div>
  </section>
{/if}

<style>
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  
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
</style>