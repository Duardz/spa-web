<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // State for progressive enhancement
  let isVisible = $state(false);
  let activeValue = $state<number | null>(null);
  
  // Security: Sanitize contact information
  const contactInfo = {
    phone: "(042) XXX-XXXX",
    email: "info@stpatrickacademy.edu.ph",
    hours: "Monday - Friday: 7:00 AM - 5:00 PM"
  };
  
  // Core values data with better structure
  const coreValues = [
    { icon: "✝️", title: "Faith", description: "Living out Catholic teachings in daily life", color: "purple" },
    { icon: "📚", title: "Excellence", description: "Pursuing the highest standards in education", color: "blue" },
    { icon: "🤝", title: "Service", description: "Helping others with compassion and dedication", color: "green" },
    { icon: "🎯", title: "Integrity", description: "Acting with honesty and moral uprightness", color: "red" },
    { icon: "🌟", title: "Respect", description: "Valuing the dignity of every person", color: "yellow" },
    { icon: "💪", title: "Perseverance", description: "Overcoming challenges with determination", color: "indigo" }
  ];
  
  // Leadership data
  const leadership = [
    {
      name: "LEAH MAY B. UNAJAN",
      position: "Senior High School Principal", 
      description: "Guiding our School towards academic excellence",
      image: null
    },
    {
      "name": "GLORIA C. ABAT",
      "position": "School Treasurer",
      "description": "Ensuring financial integrity and supporting quality education at Saint Patrick's Academy.",
      "image": null
    }
  ];
  
  onMount(() => {
    // Progressive enhancement animation
    if (browser) {
      isVisible = true;
    }
  });
  
  // Handle keyboard navigation for core values
  function handleValueKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activeValue = activeValue === index ? null : index;
    }
  }
</script>

<svelte:head>
  <title>About Us - Saint Patrick's Academy</title>
  <meta name="description" content="Learn about Saint Patrick's Academy's mission, vision, history, and commitment to quality Catholic education in Paltic, Dingalan, Aurora.">
  <meta property="og:title" content="About Saint Patrick's Academy">
  <meta property="og:description" content="Discover our mission, vision, and 50+ years of excellence in Catholic education.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://saintpatricksacademy.edu.ph/about">
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Enhanced Page Header with Animation -->
  <div class="text-center mb-16 py-12 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl relative overflow-hidden {isVisible ? 'animate-fade-in' : 'opacity-0'}">
    <!-- Decorative Elements -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-2xl" aria-hidden="true"></div>
    
    <h1 class="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
      About Saint Patrick's Academy
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
      A tradition of excellence in Catholic education serving the community of Paltic, Dingalan, Aurora since 1970
    </p>
  </div>

  <!-- Mission & Vision with Enhanced Cards -->
  <section aria-labelledby="mission-vision-heading" class="mb-16">
    <h2 id="mission-vision-heading" class="sr-only">Mission and Vision</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 {isVisible ? 'animate-slide-up' : 'opacity-0'}">
      <!-- Mission Card -->
      <Card class="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:shadow-2xl transition-all duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
        <div class="relative z-10 text-center p-8">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-emerald-800 mb-4">Our Mission</h3>
          <p class="text-gray-700 leading-relaxed">
            To provide quality Catholic education that develops the whole person - 
            intellectually, spiritually, morally, and socially - preparing students 
            to become responsible citizens and future leaders grounded in Christian values.
          </p>
        </div>
      </Card>

      <!-- Vision Card -->
      <Card class="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:shadow-2xl transition-all duration-300">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
        <div class="relative z-10 text-center p-8">
          <div class="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-amber-800 mb-4">Our Vision</h3>
          <p class="text-gray-700 leading-relaxed">
            To be a leading Catholic educational institution in Aurora, 
            recognized for academic excellence, character formation, and producing 
            graduates who excel in their chosen fields while living out their faith.
          </p>
        </div>
      </Card>
    </div>
  </section>

  <!-- Enhanced Core Values Section -->
  <section aria-labelledby="values-heading" class="mb-16 {isVisible ? 'animate-slide-up animation-delay-200' : 'opacity-0'}">
    <Card class="overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 -mx-6 -mt-6 mb-8">
        <h2 id="values-heading" class="text-3xl font-bold text-center">Our Core Values</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {#each coreValues as value, index}
          <div 
            class="group relative bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200 cursor-pointer transform hover:-translate-y-1"
            role="button"
            tabindex="0"
            onclick={() => activeValue = activeValue === index ? null : index}
            onkeydown={(e) => handleValueKeydown(e, index)}
            aria-expanded={activeValue === index}
            aria-label="{value.title}: {value.description}"
          >
            <div class="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
              {value.icon}
            </div>
            <h3 class="font-bold text-xl mb-2 text-gray-800">{value.title}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              {value.description}
            </p>
            {#if activeValue === index}
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl pointer-events-none"></div>
            {/if}
          </div>
        {/each}
      </div>
    </Card>
  </section>

  <!-- Enhanced History Section -->
  <section aria-labelledby="history-heading" class="mb-16 {isVisible ? 'animate-slide-up animation-delay-400' : 'opacity-0'}">
    <h2 id="history-heading" class="text-3xl font-bold text-center mb-8 text-gray-800">Our Rich History</h2>
    <Card class="overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div class="relative">
        <!-- Timeline decoration -->
        <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-200" aria-hidden="true"></div>
        
        <div class="prose prose-lg max-w-none pl-16 pr-8 py-8">
          <div class="relative mb-8">
            <div class="absolute -left-12 top-2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow" aria-hidden="true"></div>
            <p class="text-gray-700 leading-relaxed">
              <strong class="text-emerald-700">Founded in 1970</strong>, Saint Patrick's Academy has been a cornerstone of education in Paltic, 
              Dingalan, Aurora for over five decades. Built on the principles of Catholic education, 
              our institution has grown from humble beginnings to become one of the most 
              respected schools in the region.
            </p>
          </div>
          
          <div class="relative mb-8">
            <div class="absolute -left-12 top-2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow" aria-hidden="true"></div>
            <p class="text-gray-700 leading-relaxed">
              Throughout our history, we have remained committed to our founding mission: 
              providing quality education that nurtures not just the mind, but also the 
              heart and soul of our students. Our graduates have gone on to become leaders 
              in various fields, from education and healthcare to business and public service.
            </p>
          </div>
          
          <div class="relative">
            <div class="absolute -left-12 top-2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow" aria-hidden="true"></div>
            <p class="text-gray-700 leading-relaxed">
              <strong class="text-emerald-700">Today</strong>, we continue to adapt to the changing needs of education while staying 
              true to our Catholic identity. With modern facilities, dedicated teachers, and 
              a supportive community, Saint Patrick's Academy remains dedicated to forming 
              the next generation of Christian leaders.
            </p>
          </div>
        </div>
      </div>
    </Card>
  </section>

  <!-- Enhanced Leadership Section -->
  <section aria-labelledby="leadership-heading" class="mb-16 {isVisible ? 'animate-slide-up animation-delay-600' : 'opacity-0'}">
    <h2 id="leadership-heading" class="text-3xl font-bold text-center mb-8 text-gray-800">School Leadership</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each leadership as leader}
        <Card class="group hover:shadow-xl transition-all duration-300">
          <div class="text-center p-8">
            <div class="relative inline-block mb-6">
              <div class="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300">
                <svg class="w-16 h-16 text-gray-500 group-hover:text-emerald-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-2 text-gray-800">{leader.name}</h3>
            <p class="text-emerald-600 font-semibold mb-3">{leader.position}</p>
            <p class="text-sm text-gray-600 italic">{leader.description}</p>
          </div>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Enhanced Contact Section -->
  <section aria-labelledby="contact-heading" class="relative {isVisible ? 'animate-slide-up animation-delay-800' : 'opacity-0'}">
    <Card class="overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200" id="contact">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      
      <div class="relative z-10">
        <h2 id="contact-heading" class="text-3xl font-bold text-center mb-8 text-gray-800">Get in Touch</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="bg-white/50 backdrop-blur rounded-2xl p-6">
            <h3 class="font-bold text-xl mb-4 text-emerald-700 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Visit Us
            </h3>
            <address class="not-italic text-gray-700 space-y-2">
              <p class="leading-relaxed">
                Saint Patrick's Academy<br />
                Paltic, Dingalan, Aurora<br />
                Philippines
              </p>
            </address>
          </div>
          
          <div class="bg-white/50 backdrop-blur rounded-2xl p-6">
            <h3 class="font-bold text-xl mb-4 text-emerald-700 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div class="space-y-3 text-gray-700">
              <p class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contactInfo.phone}</span>
              </p>
              <p class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:{contactInfo.email}" class="hover:text-emerald-600 transition-colors">
                  {contactInfo.email}
                </a>
              </p>
              <p class="flex items-center">
                <svg class="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{contactInfo.hours}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <a href="/enroll" class="inline-block">
            <Button 
              variant="primary" 
              size="lg" 
              class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Start Your Journey With Us
            </Button>
          </a>
        </div>
      </div>
    </Card>
  </section>
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
  
  .animation-delay-400 {
    animation-delay: 0.4s;
  }
  
  .animation-delay-600 {
    animation-delay: 0.6s;
  }
  
  .animation-delay-800 {
    animation-delay: 0.8s;
  }
  
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Print styles */
  @media print {
    .animate-fade-in,
    .animate-slide-up {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    
    section {
      page-break-inside: avoid;
    }
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