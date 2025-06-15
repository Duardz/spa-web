<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { teacherOps } from '$lib/firebase/firestore';
  import type { Teacher } from '$lib/types';
  
  let teachers = $state<Teacher[]>([]);
  let loading = $state(true);
  let error = $state('');
  let isVisible = $state(false);
  let searchQuery = $state('');
  let selectedDepartment = $state<string>('all');
  let viewMode = $state<'grid' | 'list'>('grid');
  let imageLoadErrors = $state(new Set<string>());
  
  // Pagination
  const TEACHERS_PER_PAGE = 12;
  let currentPage = $state(1);
  
  // Cache configuration
  const CACHE_KEY = 'spa_teachers_cache';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  // Get cached data
  function getCachedData(): { data: Teacher[], timestamp: number } | null {
    if (!browser) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        if (now - parsed.timestamp < CACHE_DURATION) {
          return parsed;
        }
        // Clear expired cache
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
    return null;
  }
  
  // Save to cache
  function saveToCache(data: Teacher[]) {
    if (!browser) return;
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Cache write error:', err);
      // Clear cache if storage is full
      localStorage.removeItem(CACHE_KEY);
    }
  }
  
  // Get unique departments
  const departments = $derived(
    ['all', ...new Set(teachers.map(t => t.department || 'General'))].sort((a, b) => a.localeCompare(b))
  );
  
  // Filtered teachers based on search and department
  const filteredTeachers = $derived((() => {
    let filtered = [...teachers]; // Create a copy to avoid mutation
    
    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(t => (t.department || 'General') === selectedDepartment);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.position.toLowerCase().includes(query) ||
        (t.department || '').toLowerCase().includes(query)
      );
    }
    
    // Sort by creating a new sorted array (not mutating)
    return [...filtered].sort((a, b) => {
      if ((a.department || 'General') !== (b.department || 'General')) {
        return (a.department || 'General').localeCompare(b.department || 'General');
      }
      return a.order - b.order;
    });
  })());
  
  // Paginated teachers
  const paginatedTeachers = $derived((() => {
    const start = (currentPage - 1) * TEACHERS_PER_PAGE;
    const end = start + TEACHERS_PER_PAGE;
    return filteredTeachers.slice(start, end);
  })());
  
  // Total pages
  const totalPages = $derived(
    Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE)
  );
  
  // Group paginated teachers by department
  const groupedTeachers = $derived((() => {
    const grouped = paginatedTeachers.reduce((acc: Record<string, Teacher[]>, teacher: Teacher) => {
      const dept = teacher.department || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(teacher);
      return acc;
    }, {} as Record<string, Teacher[]>);
    
    return grouped;
  })());
  
  // Handle search with debouncing
  let searchTimeout: ReturnType<typeof setTimeout>;
  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = value;
      currentPage = 1; // Reset to first page on search
    }, 300);
  }
  
  // Handle department change
  function handleDepartmentChange(dept: string) {
    selectedDepartment = dept;
    currentPage = 1; // Reset to first page
  }
  
  // Handle image load error
  function handleImageError(teacherId: string | undefined) {
    if (teacherId) {
      imageLoadErrors.add(teacherId);
    }
  }
  
  // Load teachers
  async function loadTeachers(useCache = true) {
    try {
      // Check cache first
      if (useCache && browser) {
        const cached = getCachedData();
        if (cached) {
          console.log('Loading from cache:', cached.data.length, 'teachers');
          teachers = cached.data;
          loading = false;
          isVisible = true;
          return;
        }
      }
      
      loading = true;
      error = '';
      
      console.log('Fetching teachers from Firebase...');
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.log('Request timed out after 15 seconds');
          reject(new Error('Request timeout'));
        }, 15000)
      );
      
      const teachersPromise = teacherOps.getAll();
      const result = await Promise.race([teachersPromise, timeoutPromise]) as Teacher[];
      
      console.log('Fetched', result.length, 'teachers from Firebase');
      
      // Sanitize data - ensure all fields exist
      teachers = result.map(teacher => ({
        id: teacher.id || '',
        name: teacher.name || 'Unknown Teacher',
        position: teacher.position || 'Teacher',
        department: teacher.department || 'General',
        email: teacher.email || '',
        order: teacher.order || 999,
        imageUrl: teacher.imageUrl || '' // Make sure imageUrl is always defined
      }));
      
      // Save to cache
      saveToCache(teachers);
      
      if (browser) {
        isVisible = true;
      }
    } catch (err) {
      console.error('Error loading teachers:', err);
      error = 'Unable to load teachers. Please check your connection and try again.';
    } finally {
      loading = false;
      console.log('Loading complete. Teachers:', teachers.length);
    }
  }
  
  onMount(async () => {
    console.log('Teachers page mounted, starting to load teachers...');
    try {
      await loadTeachers();
    } catch (error) {
      console.error('Failed to load teachers on mount:', error);
      loading = false;
    }
  });
  
  // Clear filters
  function clearFilters() {
    searchQuery = '';
    selectedDepartment = 'all';
    currentPage = 1;
  }
  
  // Check if filters are active
  const hasActiveFilters = $derived(
    searchQuery.trim() !== '' || selectedDepartment !== 'all'
  );
</script>

<svelte:head>
  <title>Our Teachers - Saint Patrick's Academy</title>
  <meta name="description" content="Meet the dedicated teachers and staff of Saint Patrick's Academy who are committed to providing quality education in Paltic, Dingalan, Aurora.">
  <meta property="og:title" content="Our Teachers - Saint Patrick's Academy">
  <meta property="og:description" content="Dedicated educators committed to nurturing minds and building character.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://saintpatricksacademy.edu.ph/teachers">
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Enhanced Page Header -->
    <div class="text-center mb-12 py-12 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl relative overflow-hidden {isVisible ? 'animate-fade-in' : 'opacity-0'}">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-2xl" aria-hidden="true"></div>
      
      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Our Teachers
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Dedicated educators committed to nurturing minds and building character
        </p>
        {#if !loading && teachers.length > 0}
          <p class="text-sm text-gray-500 mt-2">
            {teachers.length} talented educators across {departments.length - 1} departments
          </p>
        {/if}
      </div>
    </div>
    
    {#if loading}
      <div class="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
        <LoadingSpinner size="lg" />
        <p class="text-gray-600 mt-4">Loading our talented educators...</p>
      </div>
    {:else if error}
      <Card class="max-w-2xl mx-auto">
        <div class="text-center py-12">
          <svg class="w-20 h-20 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Unable to Load Teachers</h2>
          <p class="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onclick={() => loadTeachers(false)}
            class="bg-emerald-600 hover:bg-emerald-700"
          >
            Try Again
          </Button>
        </div>
      </Card>
    {:else if teachers.length === 0}
      <Card class="max-w-2xl mx-auto">
        <div class="text-center py-12">
          <svg class="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="text-gray-600">No teachers found.</p>
        </div>
      </Card>
    {:else}
      <!-- Filters and Search Section -->
      <div class="mb-8 bg-white rounded-2xl shadow-sm p-6 {isVisible ? 'animate-slide-up' : 'opacity-0'}">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="relative">
            <input
              type="search"
              placeholder="Search teachers..."
              class="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              oninput={(e) => handleSearch(e.currentTarget.value)}
              value={searchQuery}
              aria-label="Search teachers"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <!-- Department Filter -->
          <select
            class="px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={selectedDepartment}
            onchange={(e) => handleDepartmentChange(e.currentTarget.value)}
            aria-label="Filter by department"
          >
            {#each departments as dept}
              <option value={dept}>
                {dept === 'all' ? 'All Departments' : dept + ' Department'}
              </option>
            {/each}
          </select>
          
          <!-- View Mode Toggle -->
          <div class="flex items-center justify-end space-x-2">
            <span class="text-sm text-gray-600">View:</span>
            <button
              onclick={() => viewMode = 'grid'}
              class={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onclick={() => viewMode = 'list'}
              class={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {#if hasActiveFilters}
          <div class="mt-4 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </p>
            <button
              onclick={clearFilters}
              class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        {/if}
      </div>
      
      {#if filteredTeachers.length === 0}
        <Card class="max-w-2xl mx-auto">
          <div class="text-center py-12">
            <svg class="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-gray-600 mb-4">No teachers match your search criteria.</p>
            <Button 
              variant="outline" 
              onclick={clearFilters}
              class="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      {:else if viewMode === 'grid'}
        <!-- Grid View by Department -->
        {#each Object.entries(groupedTeachers) as [department, deptTeachers], index}
          <div class="mb-12 {isVisible ? 'animate-slide-up' : 'opacity-0'}" style="animation-delay: {index * 100}ms">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-emerald-600 flex items-center justify-between">
              <span>{department} Department</span>
              <span class="text-sm font-normal text-gray-500">{deptTeachers.length} teacher{deptTeachers.length !== 1 ? 's' : ''}</span>
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {#each deptTeachers as teacher (teacher.id)}
                <Card class="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div class="text-center p-6">
                    {#if teacher.imageUrl && !imageLoadErrors.has(teacher.id || '')}
                      <img 
                        src={teacher.imageUrl} 
                        alt=""
                        class="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300"
                        loading="lazy"
                        onerror={() => handleImageError(teacher.id)}
                      />
                    {:else}
                      <div class="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300">
                        <svg class="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    {/if}
                    
                    <h3 class="text-xl font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                      {teacher.name}
                    </h3>
                    
                    <p class="text-emerald-600 font-medium mb-3">
                      {teacher.position}
                    </p>
                    
                    {#if teacher.email}
                      <a 
                        href="mailto:{teacher.email}" 
                        class="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                        aria-label="Email {teacher.name}"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact
                      </a>
                    {/if}
                  </div>
                </Card>
              {/each}
            </div>
          </div>
        {/each}
      {:else}
        <!-- List View -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden {isVisible ? 'animate-slide-up' : 'opacity-0'}">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each paginatedTeachers as teacher (teacher.id)}
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        {#if teacher.imageUrl && !imageLoadErrors.has(teacher.id || '')}
                          <img 
                            src={teacher.imageUrl} 
                            alt=""
                            class="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                            onerror={() => handleImageError(teacher.id)}
                          />
                        {:else}
                          <div class="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        {/if}
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{teacher.name}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.position}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.department || 'General'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      {#if teacher.email}
                        <a 
                          href="mailto:{teacher.email}" 
                          class="text-emerald-600 hover:text-emerald-700"
                          aria-label="Email {teacher.name}"
                        >
                          Email
                        </a>
                      {:else}
                        <span class="text-gray-400">-</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
      
      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="mt-8 flex items-center justify-center space-x-2">
          <button
            onclick={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            Previous
          </button>
          
          <div class="flex space-x-1">
            {#each Array(totalPages) as _, i}
              {#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
                <button
                  onclick={() => currentPage = i + 1}
                  class={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label="Page {i + 1}"
                  aria-current={currentPage === i + 1 ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
                <span class="px-3 py-2 text-gray-500">...</span>
              {/if}
            {/each}
          </div>
          
          <button
            onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
            disabled={currentPage === totalPages}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      {/if}
    {/if}
    
    <!-- Call to Action -->
    <Card class="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 overflow-hidden relative {isVisible ? 'animate-slide-up animation-delay-400' : 'opacity-0'}">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div class="relative z-10 text-center p-8">
        <h3 class="text-2xl font-bold text-emerald-800 mb-4">
          Join Our Teaching Team
        </h3>
        <p class="text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
          We are always looking for passionate educators who share our commitment 
          to Catholic education and student development. If you're interested in 
          joining our team, please get in touch.
        </p>
        <a 
          href="/about#contact" 
          class="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Contact Us
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </Card>
  </div>
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
  
  .animation-delay-400 {
    animation-delay: 0.4s;
  }
  
  /* Custom scrollbar for table */
  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
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