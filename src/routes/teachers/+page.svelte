<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { teacherOps } from '$lib/firebase/firestore';
  import type { Teacher } from '$lib/types';
  
  let teachers = $state<Teacher[]>([]);
  let loading = $state(true);
  let error = $state('');
  
  // Group teachers by department
  let departments = $derived(() => {
    const grouped = teachers.reduce((acc, teacher) => {
      const dept = teacher.department || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(teacher);
      return acc;
    }, {} as Record<string, Teacher[]>);
    
    // Sort teachers within each department by order
    Object.keys(grouped).forEach(dept => {
      grouped[dept].sort((a, b) => a.order - b.order);
    });
    
    return grouped;
  });
  
  onMount(async () => {
    try {
      console.log('Fetching teachers...');
      teachers = await teacherOps.getAll();
      console.log('Fetched teachers:', teachers);
    } catch (err) {
      console.error('Error loading teachers:', err);
      error = 'Failed to load teachers. Please try again later.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Our Teachers - Saint Patrick's Academy</title>
  <meta name="description" content="Meet the dedicated teachers and staff of Saint Patrick's Academy who are committed to providing quality education.">
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Page Header -->
  <div class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Teachers</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Dedicated educators committed to nurturing minds and building character
    </p>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error}
    <Card class="max-w-2xl mx-auto">
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-600">{error}</p>
      </div>
    </Card>
  {:else if teachers.length === 0}
    <Card class="max-w-2xl mx-auto">
      <div class="text-center py-8">
        <p class="text-gray-600">No teachers found.</p>
      </div>
    </Card>
  {:else}
    <!-- Teachers by Department -->
    {#each Object.entries(departments()) as [department, deptTeachers]}
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-green-600">
          {department} Department
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each deptTeachers as teacher}
            <Card hover>
              <div class="text-center">
                {#if teacher.imageUrl}
                  <img 
                    src={teacher.imageUrl} 
                    alt={teacher.name}
                    class="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                {:else}
                  <div class="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                {/if}
                
                <h3 class="text-xl font-semibold text-gray-900 mb-1">
                  {teacher.name}
                </h3>
                
                <p class="text-green-600 font-medium mb-2">
                  {teacher.position}
                </p>
                
                {#if teacher.email}
                  <a 
                    href="mailto:{teacher.email}" 
                    class="text-sm text-gray-500 hover:text-green-600 transition-colors inline-flex items-center"
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
  {/if}
  
  <!-- Call to Action -->
  <Card class="mt-12 bg-green-50 border-green-200">
    <div class="text-center">
      <h3 class="text-2xl font-bold text-green-800 mb-4">
        Join Our Teaching Team
      </h3>
      <p class="text-gray-700 mb-6 max-w-2xl mx-auto">
        We are always looking for passionate educators who share our commitment 
        to Catholic education and student development. If you're interested in 
        joining our team, please get in touch.
      </p>
      <a 
        href="/about#contact" 
        class="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
      >
        Contact Us
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  </Card>
</div>