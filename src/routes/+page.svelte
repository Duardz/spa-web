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
  <title>Saint Patrick's Academy - Quality Catholic Education in Agusan del Sur</title>
  <meta name="description" content="Saint Patrick's Academy provides quality Catholic education for Junior and Senior High School students in San Francisco, Agusan del Sur.">
</svelte:head>

<!-- Hero Section with Parallax -->
<section class="relative min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
  <!-- Animated Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0 bg-[url('/shamrock-pattern.svg')] bg-repeat animate-float-slow"></div>
  </div>
  
  <!-- Gradient Overlay -->
  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/50 to-green-900"></div>
  
  <!-- Floating Particles -->
  <div class="absolute inset-0">
    {#each Array(20) as _, i}
      <div 
        class="absolute w-2 h-2 bg-green-400/20 rounded-full animate-float"
        style="
          left: {Math.random() * 100}%;
          top: {Math.random() * 100}%;
          animation-delay: {Math.random() * 5}s;
          animation-duration: {15 + Math.random() * 10}s;
        "
      ></div>
    {/each}
  </div>
  
  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
    <div class="text-center w-full">
      <!-- School Crest with Glow Effect -->
      <div class="mb-8 relative inline-block">
        <div class="absolute inset-0 bg-gold-400/30 blur-3xl"></div>
        <img 
          src="/logo.png" 
          alt="Saint Patrick's Academy Crest" 
          class="h-32 w-32 md:h-40 md:w-40 relative animate-float filter drop-shadow-2xl"
        />
      </div>
      
      <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up font-serif">
        Saint Patrick's Academy
      </h1>
      
      <div class="flex items-center justify-center space-x-4 mb-6 animate-fade-in-up animation-delay-200">
        <div class="h-px bg-gold-400 w-16 md:w-24"></div>
        <svg class="w-8 h-8 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <div class="h-px bg-gold-400 w-16 md:w-24"></div>
      </div>
      
      <p class="text-xl md:text-2xl text-green-100 mb-4 animate-fade-in-up animation-delay-200">
        Excellence in Catholic Education Since 1970
      </p>
      
      <p class="text-lg md:text-xl text-green-200 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
        Nurturing Minds • Building Character • Inspiring Excellence
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
        {#if $enrollmentSettings.isOpen}
          <Button size="xl" variant="secondary" shadow rounded="full" pulse>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Enroll Now for SY {$enrollmentSettings.schoolYear}
          </Button>
        {/if}
        
        <Button 
          size="xl" 
          variant="outline" 
          class="!text-white !border-white hover:!bg-white/10 backdrop-blur-sm" 
          rounded="full"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Watch Video Tour
        </Button>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </div>
</section>

<!-- Stats Counter Section -->
<section class="py-16 bg-gradient-to-r from-green-700 to-green-800 -mt-px">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      {#each stats as stat, i}
        <div class="text-center animate-fade-in-up" style="animation-delay: {i * 100}ms">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
            <svg class="w-8 h-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
            </svg>
          </div>
          <div class="text-3xl md:text-4xl font-bold text-white mb-2 font-mono">{stat.number}</div>
          <div class="text-green-100 text-sm md:text-base">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Features Section with Icons -->
<section class="py-20 md:py-28 bg-gradient-to-b from-cream to-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
        Why Choose Saint Patrick's Academy?
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        We provide holistic education that develops students academically, spiritually, and morally.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card hover shadow="lg" gradient class="text-center group">
        <div class="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3 font-serif">Academic Excellence</h3>
        <p class="text-gray-600 leading-relaxed">
          Comprehensive curriculum aligned with DepEd standards, preparing students for higher education and future careers.
        </p>
        <div class="mt-6 flex justify-center">
          <a href="/about" class="text-green-600 hover:text-green-700 font-medium inline-flex items-center group-hover:gap-3 gap-2 transition-all">
            Learn More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </Card>
      
      <Card hover shadow="lg" gradient class="text-center group">
        <div class="w-20 h-20 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3 font-serif">Values Formation</h3>
        <p class="text-gray-600 leading-relaxed">
          Strong Catholic foundation that nurtures faith, character, and moral values in our students.
        </p>
        <div class="mt-6 flex justify-center">
          <a href="/about" class="text-green-600 hover:text-green-700 font-medium inline-flex items-center group-hover:gap-3 gap-2 transition-all">
            Learn More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </Card>
      
      <Card hover shadow="lg" gradient class="text-center group">
        <div class="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3 font-serif">Community Spirit</h3>
        <p class="text-gray-600 leading-relaxed">
          A supportive environment where students, teachers, and parents work together for success.
        </p>
        <div class="mt-6 flex justify-center">
          <a href="/about" class="text-green-600 hover:text-green-700 font-medium inline-flex items-center group-hover:gap-3 gap-2 transition-all">
            Learn More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </Card>
    </div>
  </div>
</section>

<!-- Academic Programs Section -->
<section class="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
        Our Academic Programs
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Comprehensive education pathways designed to prepare students for success
      </p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card shadow="xl" class="overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
              JHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-3 font-serif text-gray-900">Junior High School</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Grades 7 to 10 following the K-12 curriculum with emphasis on core subjects and values education.
            </p>
            <ul class="space-y-3 text-gray-600">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Strong foundation in Mathematics, Science, English, and Filipino
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Values Education and Christian Living
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Co-curricular activities and student organizations
              </li>
            </ul>
            <div class="mt-6">
              <a href="/enroll" class="inline-flex items-center text-green-600 hover:text-green-700 font-medium group-hover:gap-3 gap-2 transition-all">
                Apply Now
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Card>
      
      <Card shadow="xl" class="overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
              SHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-3 font-serif text-gray-900">Senior High School</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Grades 11 and 12 with specialized academic tracks preparing students for college and careers.
            </p>
            <div class="space-y-3">
              <h4 class="font-semibold text-gray-800">Available Strands:</h4>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                  <span class="font-medium">STEM</span> - Science, Technology, Engineering & Mathematics
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                  <span class="font-medium">HUMSS</span> - Humanities and Social Sciences
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                  <span class="font-medium">ABM</span> - Accountancy, Business and Management
                </li>
              </ul>
            </div>
            <div class="mt-6">
              <a href="/enroll" class="inline-flex items-center text-green-600 hover:text-green-700 font-medium group-hover:gap-3 gap-2 transition-all">
                Apply Now
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section class="py-20 md:py-28 bg-gradient-to-br from-green-50 to-green-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
        What Our Community Says
      </h2>
      <p class="text-lg text-gray-600">
        Hear from our students, parents, and alumni
      </p>
    </div>
    
    <div class="relative">
      <Card shadow="xl" padding="xl" class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Quote Icon -->
          <svg class="absolute -top-4 -left-4 w-16 h-16 text-green-200 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          
          <!-- Testimonial Content -->
          <div class="text-center">
            <p class="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-8">
              "{testimonials[currentTestimonial].content}"
            </p>
            
            <div class="flex items-center justify-center">
              <div class="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
              <div class="text-left">
                <h4 class="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                <p class="text-gray-600">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
          
          <!-- Dots Indicator -->
          <div class="flex justify-center mt-8 space-x-2">
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
<section class="py-20 md:py-28 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
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
          <div class="animate-fade-in-up" style="animation-delay: {i * 100}ms">
            <Card hover shadow="lg" class="h-full flex flex-col group">
              {#if post.imageUrl}
                <div class="relative h-48 -mt-6 -mx-6 mb-6 overflow-hidden rounded-t-lg">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              {:else}
                <div class="relative h-48 -mt-6 -mx-6 mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-t-lg flex items-center justify-center">
                  <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              {/if}
              
              <div class="flex-grow flex flex-col">
                <h3 class="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                  <a href="/news/{post.id}" class="hover:text-green-700">
                    {post.title}
                  </a>
                </h3>
                <p class="text-gray-600 mb-4 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div class="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-PH')}</span>
                  <a href="/news/{post.id}" class="text-green-700 hover:text-green-800 font-medium inline-flex items-center group-hover:gap-3 gap-2 transition-all">
                    Read more
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        {/each}
      </div>
      
      <div class="text-center mt-12">
        <a href="/news">
          <Button variant="outline" size="lg">
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
  <section class="py-20 bg-gradient-to-r from-green-700 to-green-800 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-[url('/shamrock-pattern.svg')] bg-repeat"></div>
    </div>
    
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
        Begin Your Journey With Us
      </h2>
      <p class="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
        Join our community of learners for School Year {$enrollmentSettings.schoolYear}
      </p>
      
      <div class="inline-flex flex-col sm:flex-row gap-4">
        <a href="/enroll">
          <Button variant="secondary" size="xl" shadow rounded="full">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isAuthenticated ? 'Start Your Application' : 'View Enrollment Details'}
          </Button>
        </a>
        
        <a href="/about">
          <Button variant="outline" size="xl" class="!text-white !border-white hover:!bg-white/20" rounded="full">
            Learn More About SPA
          </Button>
        </a>
      </div>
      
      {#if !isAuthenticated}
        <p class="text-sm text-green-200 mt-6">
          Sign in required to submit application
        </p>
      {/if}
    </div>
  </section>
{/if}

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }
  
  @keyframes float-slow {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(30px, -30px); }
    66% { transform: translate(-20px, 20px); }
  }
  
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-slow {
    animation: float-slow 20s ease-in-out infinite;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  
  .animation-delay-400 {
    animation-delay: 400ms;
  }
  
  .animation-delay-600 {
    animation-delay: 600ms;
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