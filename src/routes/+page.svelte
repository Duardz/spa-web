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

<!-- Hero Section with Modern Gradient Design -->
<section class="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
  <!-- Animated Background Shapes -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-amber-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-teal-100/10 to-emerald-100/10 rounded-full blur-3xl"></div>
  </div>
  
  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
    <div class="text-center w-full">
      <!-- School Crest with Glow Effect -->
      <div class="mb-8 relative inline-block">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-300/30 to-teal-300/30 blur-2xl rounded-full animate-pulse"></div>
        <img 
          src="/logo.png" 
          alt="Saint Patrick's Academy Crest" 
          class="h-32 w-32 md:h-40 md:w-40 relative filter drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <h1 class="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
        Saint Patrick's Academy
      </h1>
      
      <div class="flex items-center justify-center space-x-4 mb-6">
        <div class="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent w-24 md:w-32"></div>
        <svg class="w-8 h-8 text-amber-500 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <div class="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent w-24 md:w-32"></div>
      </div>
      
      <p class="text-xl md:text-2xl text-emerald-700 mb-3 font-light">
        Excellence in Catholic Education Since 1970
      </p>
      
      <p class="text-lg md:text-xl text-gray-600 mb-3">
        <span class="inline-flex items-center">
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Paltic, Dingalan, Aurora
        </span>
      </p>
      
      <p class="text-lg md:text-xl text-gray-500 mb-12 max-w-3xl mx-auto italic font-light">
        "Nurturing Minds • Building Character • Inspiring Excellence"
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        {#if $enrollmentSettings.isOpen}
          <a href="/enroll">
            <Button 
              size="lg" 
              class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8"
              rounded="full"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Enroll Now for SY {$enrollmentSettings.schoolYear}
            </Button>
          </a>
        {/if}
        
        <a href="/about">
          <Button 
            size="lg" 
            variant="outline" 
            class="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600 transition-all duration-300 px-8" 
            rounded="full"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Learn More About Us
          </Button>
        </a>
      </div>
      
      <!-- Animated Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div class="animate-bounce">
          <svg class="w-6 h-6 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Stats Counter Section with Glass Effect -->
<section class="py-20 bg-gradient-to-b from-white to-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      {#each stats as stat, i}
        <div class="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
              </svg>
            </div>
            <div class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">{stat.number}</div>
            <div class="text-gray-600 text-sm font-medium">{stat.label}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Features Section with Card Hover Effects -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Why Choose Saint Patrick's Academy?
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        We provide holistic education that develops students academically, spiritually, and morally.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative z-10">
          <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-800">Academic Excellence</h3>
          <p class="text-gray-600 leading-relaxed">
            Comprehensive curriculum aligned with DepEd standards, preparing students for higher education and future careers.
          </p>
        </div>
      </div>
      
      <div class="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative z-10">
          <div class="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-800">Values Formation</h3>
          <p class="text-gray-600 leading-relaxed">
            Strong Catholic foundation that nurtures faith, character, and moral values in our students.
          </p>
        </div>
      </div>
      
      <div class="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative z-10">
          <div class="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-800">Community Spirit</h3>
          <p class="text-gray-600 leading-relaxed">
            A supportive environment where students, teachers, and parents work together for success.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Academic Programs Section with Modern Cards -->
<section class="py-20 bg-gradient-to-b from-gray-50 to-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Our Academic Programs
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Comprehensive education pathways designed to prepare students for success
      </p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-100 hover:border-emerald-300">
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              JHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-3 text-gray-800">Junior High School</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Grades 7 to 10 following the K-12 curriculum with emphasis on core subjects and values education.
            </p>
            <ul class="space-y-3 text-gray-600">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Strong foundation in Mathematics, Science, English, and Filipino
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Values Education and Christian Living
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Co-curricular activities and student organizations
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-100 hover:border-amber-300">
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              SHS
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-semibold mb-3 text-gray-800">Senior High School</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Grades 11 and 12 with specialized academic tracks preparing students for college and careers.
            </p>
            <div class="space-y-3">
              <h4 class="font-semibold text-gray-700">Available Strands:</h4>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-center bg-gray-50 p-2 rounded-lg">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span class="font-medium text-emerald-700">STEM</span>
                  <span class="ml-2 text-sm">- Science, Technology, Engineering & Mathematics</span>
                </li>
                <li class="flex items-center bg-gray-50 p-2 rounded-lg">
                  <span class="w-2 h-2 bg-amber-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span class="font-medium text-amber-700">HUMSS</span>
                  <span class="ml-2 text-sm">- Humanities and Social Sciences</span>
                </li>
                <li class="flex items-center bg-gray-50 p-2 rounded-lg">
                  <span class="w-2 h-2 bg-teal-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span class="font-medium text-teal-700">ABM</span>
                  <span class="ml-2 text-sm">- Accountancy, Business and Management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials Section with Glass Cards -->
<section class="py-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        What Our Community Says
      </h2>
      <p class="text-xl text-gray-600">
        Hear from our students, parents, and alumni
      </p>
    </div>
    
    <div class="relative">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-10 md:p-16 max-w-4xl mx-auto shadow-2xl border border-white/50">
        <div class="relative">
          <!-- Modern Quote Icon -->
          <div class="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>
          
          <!-- Testimonial Content -->
          <div class="text-center">
            <p class="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-8 font-light">
              "{testimonials[currentTestimonial].content}"
            </p>
            
            <div class="flex items-center justify-center">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mr-4"></div>
              <div class="text-left">
                <h4 class="font-semibold text-gray-800 text-lg">{testimonials[currentTestimonial].name}</h4>
                <p class="text-gray-600">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
          
          <!-- Modern Dots Indicator -->
          <div class="flex justify-center mt-8 space-x-3">
            {#each testimonials as _, i}
              <button
                onclick={() => currentTestimonial = i}
                class={`transition-all duration-300 ${
                  currentTestimonial === i 
                    ? 'w-12 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full' 
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full'
                }`}
                aria-label="Go to testimonial {i + 1}"
              ></button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Latest News Section with Modern Cards -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Latest News & Updates
      </h2>
      <p class="text-xl text-gray-600">
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
          <div class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            {#if post.imageUrl}
              <div class="h-48 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            {:else}
              <div class="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <svg class="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            {/if}
            
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2 text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                <a href="/news/{post.id}" class="hover:text-emerald-600 transition-colors">
                  {post.title}
                </a>
              </h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">{new Date(post.publishedAt).toLocaleDateString('en-PH')}</span>
                <a href="/news/{post.id}" class="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center group">
                  Read more 
                  <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <div class="text-center mt-12">
        <a href="/news">
          <Button variant="outline" class="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-8">
            View All News
          </Button>
        </a>
      </div>
    {:else}
      <div class="bg-gray-50 rounded-2xl p-12 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p class="text-gray-600">No news available at the moment.</p>
      </div>
    {/if}
  </div>
</section>

<!-- CTA Section with Modern Gradient -->
{#if $enrollmentSettings.isOpen}
  <section class="py-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 relative overflow-hidden">
    <!-- Animated Background Shapes -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
    </div>
    
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
        Begin Your Journey With Us
      </h2>
      <p class="text-xl md:text-2xl mb-10 text-emerald-50 max-w-2xl mx-auto font-light">
        Join our community of learners for School Year {$enrollmentSettings.schoolYear}
      </p>
      
      <div class="inline-flex flex-col sm:flex-row gap-4">
        <a href="/enroll">
          <Button 
            size="lg" 
            class="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8"
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
            class="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm px-8" 
            rounded="full"
          >
            Learn More About SPA
          </Button>
        </a>
      </div>
      
      {#if !isAuthenticated}
        <p class="text-sm text-emerald-100 mt-8">
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
  
  @keyframes gradient {
    0%, 100% {
      background-size: 200% 200%;
      background-position: left center;
    }
    50% {
      background-size: 200% 200%;
      background-position: right center;
    }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
  
  .animate-spin-slow {
    animation: spin 3s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
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