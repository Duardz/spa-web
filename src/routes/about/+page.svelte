<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
</script>

<svelte:head>
  <title>About Us - Saint Patrick's Academy</title>
  <meta name="description" content="Learn about Saint Patrick's Academy's mission, vision, history, and commitment to quality Catholic education in San Francisco, Agusan del Sur.">
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Page Header -->
  <div class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About Saint Patrick's Academy</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      A tradition of excellence in Catholic education since our founding
    </p>
  </div>

  <!-- Mission & Vision -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
    <Card class="bg-green-50 border-green-200">
      <div class="text-center">
        <div class="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-green-800 mb-4">Our Mission</h2>
        <p class="text-gray-700">
          To provide quality Catholic education that develops the whole person - 
          intellectually, spiritually, morally, and socially - preparing students 
          to become responsible citizens and future leaders grounded in Christian values.
        </p>
      </div>
    </Card>

    <Card class="bg-yellow-50 border-yellow-200">
      <div class="text-center">
        <div class="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-yellow-700 mb-4">Our Vision</h2>
        <p class="text-gray-700">
          To be a leading Catholic educational institution in Agusan del Sur, 
          recognized for academic excellence, character formation, and producing 
          graduates who excel in their chosen fields while living out their faith.
        </p>
      </div>
    </Card>
  </div>

  <!-- Core Values -->
  <Card class="mb-12">
    <h2 class="text-3xl font-bold text-center mb-8">Core Values</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="text-center">
        <div class="text-4xl mb-2">✝️</div>
        <h3 class="font-semibold text-lg mb-2">Faith</h3>
        <p class="text-gray-600">Living out Catholic teachings in daily life</p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-2">📚</div>
        <h3 class="font-semibold text-lg mb-2">Excellence</h3>
        <p class="text-gray-600">Pursuing the highest standards in education</p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-2">🤝</div>
        <h3 class="font-semibold text-lg mb-2">Service</h3>
        <p class="text-gray-600">Helping others with compassion and dedication</p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-2">🎯</div>
        <h3 class="font-semibold text-lg mb-2">Integrity</h3>
        <p class="text-gray-600">Acting with honesty and moral uprightness</p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-2">🌟</div>
        <h3 class="font-semibold text-lg mb-2">Respect</h3>
        <p class="text-gray-600">Valuing the dignity of every person</p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-2">💪</div>
        <h3 class="font-semibold text-lg mb-2">Perseverance</h3>
        <p class="text-gray-600">Overcoming challenges with determination</p>
      </div>
    </div>
  </Card>

  <!-- History -->
  <div class="mb-12">
    <h2 class="text-3xl font-bold text-center mb-8">Our History</h2>
    <Card>
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-700 leading-relaxed mb-4">
          Saint Patrick's Academy has been a cornerstone of education in San Francisco, 
          Agusan del Sur for generations. Founded on the principles of Catholic education, 
          our institution has grown from humble beginnings to become one of the most 
          respected schools in the region.
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
          Throughout our history, we have remained committed to our founding mission: 
          providing quality education that nurtures not just the mind, but also the 
          heart and soul of our students. Our graduates have gone on to become leaders 
          in various fields, from education and healthcare to business and public service.
        </p>
        <p class="text-gray-700 leading-relaxed">
          Today, we continue to adapt to the changing needs of education while staying 
          true to our Catholic identity. With modern facilities, dedicated teachers, and 
          a supportive community, Saint Patrick's Academy remains dedicated to forming 
          the next generation of Christian leaders.
        </p>
      </div>
    </Card>
  </div>

  <!-- Leadership -->
  <div class="mb-12">
    <h2 class="text-3xl font-bold text-center mb-8">School Leadership</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <div class="text-center">
          <div class="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">GLORIA C. ABAT</h3>
          <p class="text-gray-600 mb-2">Junior High School Principal</p>
          <p class="text-sm text-gray-500">Leading our Junior High School with dedication and vision</p>
        </div>
      </Card>

      <Card>
        <div class="text-center">
          <div class="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">LEAH MAY B. UNAJAN</h3>
          <p class="text-gray-600 mb-2">Senior High School Principal</p>
          <p class="text-sm text-gray-500">Guiding our Senior High School towards academic excellence</p>
        </div>
      </Card>
    </div>
  </div>

  <!-- Contact Information -->
  <Card class="bg-green-50 border-green-200">
    <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 class="font-semibold text-lg mb-4">Visit Us</h3>
        <address class="not-italic text-gray-700 space-y-2">
          <p class="flex items-start">
            <svg class="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Saint Patrick's Academy<br />
            San Francisco, Agusan del Sur<br />
            Philippines
          </p>
        </address>
      </div>
      
      <div>
        <h3 class="font-semibold text-lg mb-4">Get in Touch</h3>
        <div class="space-y-2 text-gray-700">
          <p class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            (085) XXX-XXXX
          </p>
          <p class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            info@stpatrickacademy.edu.ph
          </p>
          <p class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Monday - Friday: 7:00 AM - 5:00 PM
          </p>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <a href="/enroll">
        <Button variant="primary" size="lg">
          Start Your Journey With Us
        </Button>
      </a>
    </div>
  </Card>
</div>