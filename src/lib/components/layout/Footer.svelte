<script lang="ts">
  const currentYear = new Date().getFullYear();
  
  let hoveredLink = $state<string | null>(null);
</script>

<footer class="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-auto overflow-hidden">
  <!-- Subtle pattern overlay -->
  <div class="absolute inset-0 opacity-5">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
  </div>
  
  <!-- Emerald accent -->
  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600"></div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
      <!-- School Info -->
      <div class="md:col-span-2">
        <div class="flex items-center mb-6">
          <img 
            src="/logo.png" 
            alt="Saint Patrick's Academy" 
            class="h-12 w-12 mr-3 rounded-full shadow-md ring-2 ring-white/20"
          />
          <div>
            <h3 class="text-xl font-bold text-white">
              Saint Patrick's Academy
            </h3>
            <p class="text-sm text-emerald-400 font-medium">Excellence in Education</p>
          </div>
        </div>
        <p class="text-gray-300 leading-relaxed max-w-md">
          Nurturing young minds with quality education rooted in Christian values. 
          We are committed to developing future leaders with strong moral foundations 
          and academic excellence.
        </p>
        
        <!-- Social Media -->
        <div class="mt-6 flex space-x-3">
          {#each [
            { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
            { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
            { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 2h11a4.5 4.5 0 014.5 4.5v11a4.5 4.5 0 01-4.5 4.5h-11A4.5 4.5 0 012 17.5v-11A4.5 4.5 0 016.5 2z' }
          ] as social}
            <button 
              type="button"
              onclick={() => window.open(`https://${social.name.toLowerCase()}.com/stpatrickacademy`, '_blank')}
              class="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              aria-label={`Visit our ${social.name} page`}
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d={social.icon} />
              </svg>
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-lg font-semibold mb-4 text-white">Quick Links</h4>
        <ul class="space-y-2.5">
          {#each [
            { href: '/about', label: 'About Us' },
            { href: '/teachers', label: 'Our Teachers' },
            { href: '/news', label: 'News & Updates' },
            { href: '/enroll', label: 'Enrollment' }
          ] as item}
            <li>
              <a 
                href={item.href} 
                class="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                onmouseenter={() => hoveredLink = item.href}
                onmouseleave={() => hoveredLink = null}
              >
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Contact Info -->
      <div>
        <h4 class="text-lg font-semibold mb-4 text-white">Contact Us</h4>
        <div class="space-y-3">
          <div class="flex items-start text-sm text-gray-300">
            <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Paltic, Dingalan,<br/>Aurora, Philippines</span>
          </div>
          
          <div class="flex items-center text-sm text-gray-300">
            <svg class="w-4 h-4 mr-2 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>(042) XXX-XXXX</span>
          </div>
          
          <div class="flex items-center text-sm text-gray-300">
            <svg class="w-4 h-4 mr-2 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>info@stpatrickacademy.edu.ph</span>
          </div>
        </div>
        
        <!-- Enrollment CTA -->
        <div class="mt-6 p-4 bg-emerald-600/20 rounded-lg border border-emerald-600/30">
          <p class="text-sm font-medium text-emerald-400 mb-1">Enrollment Open</p>
          <p class="text-xs text-gray-300">Join our community of excellence</p>
        </div>
      </div>
    </div>
    
    <!-- Bottom section -->
    <div class="mt-12 pt-8 border-t border-gray-700">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div class="text-sm text-gray-400">
          © {currentYear} Saint Patrick's Academy, Inc. All rights reserved.
        </div>
        
        <div class="flex items-center space-x-6 text-sm">
          <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" class="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
      
      <!-- Patron Saint dedication -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500 flex items-center justify-center space-x-2">
          <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>Under the patronage of Saint Patrick</span>
          <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </p>
      </div>
    </div>
  </div>
</footer>