<script lang="ts">
  const currentYear = new Date().getFullYear();
  
  let hoveredLink = $state<string | null>(null);
</script>

<footer class="relative bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white mt-auto overflow-hidden">
  <!-- Animated background patterns -->
  <div class="absolute inset-0">
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
  </div>
  
  <!-- Grid pattern overlay -->
  <div class="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <!-- School Info with futuristic card -->
      <div class="relative group">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors duration-500">
          <div class="flex items-center mb-6">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-md"></div>
              <img 
                src="/logo.png" 
                alt="Saint Patrick's Academy Logo" 
                class="relative h-14 w-14 mr-4 rounded-full ring-2 ring-white/20"
              />
            </div>
            <div>
              <h3 class="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Saint Patrick's Academy
              </h3>
              <p class="text-sm text-emerald-300/70 font-light tracking-wider">Excellence Redefined</p>
            </div>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed">
            Pioneering the future of education through innovative learning experiences, 
            cutting-edge technology, and timeless Christian values.
          </p>
          
          <!-- Animated decorative line -->
          <div class="mt-6 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        </div>
      </div>
      
      <!-- Quick Links with hover effects -->
      <div class="relative">
        <h4 class="text-xl font-bold mb-8 flex items-center">
          <span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Quick Access</span>
          <div class="ml-3 flex space-x-1">
            <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </h4>
        <ul class="space-y-4">
          {#each [
            { href: '/about', label: 'About Us', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { href: '/teachers', label: 'Our Teachers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { href: '/news', label: 'News & Updates', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
            { href: '/enroll', label: 'Enrollment', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
          ] as item}
            <li>
              <a 
                href={item.href} 
                class="group flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300"
                onmouseenter={() => hoveredLink = item.href}
                onmouseleave={() => hoveredLink = null}
              >
                <div class={`
                  p-2 rounded-lg bg-white/5 border border-emerald-500/20 
                  transition-all duration-300
                  ${hoveredLink === item.href ? 'bg-emerald-500/20 border-emerald-500/50 scale-110' : ''}
                `}>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                  </svg>
                </div>
                <span class="text-sm font-medium">{item.label}</span>
                <svg class={`
                  w-4 h-4 transform transition-transform duration-300
                  ${hoveredLink === item.href ? 'translate-x-2' : ''}
                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Contact Info with futuristic styling -->
      <div>
        <h4 class="text-xl font-bold mb-8">
          <span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Connect With Us</span>
        </h4>
        <div class="space-y-4">
          {#each [
            { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', text: 'Paltic, Dingalan, Aurora' },
            { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', text: '(042) XXX-XXXX' },
            { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', text: 'info@stpatrickacademy.edu.ph' }
          ] as contact}
            <div class="flex items-center space-x-3 text-gray-300 group">
              <div class="p-2 rounded-lg bg-white/5 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-300">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={contact.icon} />
                </svg>
              </div>
              <span class="text-sm">{contact.text}</span>
            </div>
          {/each}
        </div>
        
        <!-- Social Media with futuristic design -->
        <div class="mt-8">
          <p class="text-sm text-gray-400 mb-4">Follow Our Journey</p>
          <div class="flex space-x-3">
            {#each [
              { name: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { name: 'Twitter', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
              { name: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z' }
            ] as social}
              <button 
                type="button"
                onclick={() => window.open(`https://${social.name.toLowerCase()}.com/stpatrickacademy`, '_blank')}
                class="group relative p-3 rounded-xl bg-white/5 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-white/10 transition-colors duration-200"
                aria-label={`Visit our ${social.name} page`}
              >
                <svg class="h-5 w-5 relative z-10 transform group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.path}/>
                </svg>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Copyright section with futuristic divider -->
    <div class="mt-16 relative">
      <!-- Animated divider -->
      <div class="absolute inset-x-0 top-0 h-px overflow-hidden">
        <div class="h-full w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-slide"></div>
      </div>
      
      <div class="pt-8 text-center">
        <p class="text-sm text-gray-400">
          © {currentYear} Saint Patrick's Academy, Inc. All rights reserved.
        </p>
        <p class="text-xs text-emerald-400/60 mt-2 flex items-center justify-center space-x-2">
          <span>Crafted with</span>
          <svg class="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          <span>for the future of education</span>
        </p>
      </div>
    </div>
  </div>
</footer>

<style>
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-slide {
    animation: slide 3s linear infinite;
  }
</style>