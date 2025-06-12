<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-green-800 text-white mt-auto">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- School Info -->
      <div>
        <div class="flex items-center mb-4">
          <img 
            src="/logo.png" 
            alt="Saint Patrick's Academy Logo" 
            class="h-12 w-12 mr-3"
          />
          <div>
            <h3 class="text-lg font-bold">Saint Patrick's Academy, Inc.</h3>
            <p class="text-sm text-green-200">Excellence in Education</p>
          </div>
        </div>
        <p class="text-sm text-green-100">
          Nurturing minds and building character since our founding, 
          we are committed to providing quality education rooted in 
          Christian values.
        </p>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2">
          <li>
            <a href="/about" class="text-green-200 hover:text-white transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="/teachers" class="text-green-200 hover:text-white transition-colors">
              Our Teachers
            </a>
          </li>
          <li>
            <a href="/news" class="text-green-200 hover:text-white transition-colors">
              News & Updates
            </a>
          </li>
          <li>
            <a href="/enroll" class="text-green-200 hover:text-white transition-colors">
              Enrollment
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Contact Info -->
      <div>
        <h4 class="text-lg font-semibold mb-4">Contact Us</h4>
        <address class="text-sm text-green-100 not-italic space-y-2">
          <p>
            <svg class="inline h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            San Francisco, Agusan del Sur
          </p>
          <p>
            <svg class="inline h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact: (085) XXX-XXXX
          </p>
          <p>
            <svg class="inline h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            info@stpatrickacademy.edu.ph
          </p>
        </address>
        
        <!-- Social Media -->
        <div class="mt-4 flex space-x-4">
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a href="#" class="text-green-200 hover:text-white transition-colors" aria-label="Facebook">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
    
    <!-- Copyright -->
    <div class="mt-8 pt-8 border-t border-green-700 text-center">
      <p class="text-sm text-green-200">
        © {currentYear} Saint Patrick's Academy, Inc. All rights reserved.
      </p>
      <p class="text-xs text-green-300 mt-2">
        Developed with ❤️ for quality education
      </p>
    </div>
  </div>
</footer>