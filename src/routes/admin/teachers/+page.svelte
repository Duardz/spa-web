<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { teacherOps } from '$lib/firebase/firestore';
  import type { Teacher } from '$lib/types';
  
  let teachers = $state<Teacher[]>([]);
  let loading = $state(true);
  let deleting = $state<string | null>(null);
  let expandedDepartment = $state<string | null>(null);
  
  async function loadTeachers() {
    try {
      loading = true;
      const fetchedTeachers = await teacherOps.getAll();
      teachers = fetchedTeachers;
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      loading = false;
    }
  }
  
  async function deleteTeacher(id: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      deleting = id;
      await teacherOps.delete(id);
      teachers = teachers.filter(t => t.id !== id);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher. Please try again.');
    } finally {
      deleting = null;
    }
  }
  
  // Group teachers by department
  const teachersByDepartment = $derived(() => {
    const grouped = teachers.reduce((acc, teacher) => {
      const dept = teacher.department || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(teacher);
      return acc;
    }, {} as Record<string, Teacher[]>);
    
    // Sort teachers within each department
    Object.keys(grouped).forEach(dept => {
      grouped[dept].sort((a, b) => a.order - b.order);
    });
    
    return grouped;
  });
  
  const departmentCounts = $derived(() => {
    const counts: Record<string, number> = {};
    Object.entries(teachersByDepartment()).forEach(([dept, teachers]) => {
      counts[dept] = teachers.length;
    });
    return counts;
  });
  
  function toggleDepartment(dept: string) {
    expandedDepartment = expandedDepartment === dept ? null : dept;
  }
  
  onMount(() => {
    loadTeachers();
  });
</script>

<svelte:head>
  <title>Manage Teachers - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
  <!-- Header - Mobile Optimized -->
  <div class="space-y-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Teachers</h1>
      <p class="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
        Manage faculty and staff members
      </p>
    </div>
    <div class="flex gap-2 justify-end">
      <Button variant="outline" onclick={loadTeachers} size="sm">
        <svg class="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="hidden sm:inline">Refresh</span>
      </Button>
      <Button variant="primary" onclick={() => goto('/admin/teachers/new')} size="sm">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Teacher
      </Button>
    </div>
  </div>
  
  <!-- Summary Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <Card class="text-center p-3 sm:p-4">
      <p class="text-2xl sm:text-3xl font-bold text-gray-900">{teachers.length}</p>
      <p class="text-xs sm:text-sm text-gray-600">Total Teachers</p>
    </Card>
    <Card class="text-center p-3 sm:p-4">
      <p class="text-2xl sm:text-3xl font-bold text-green-600">{Object.keys(teachersByDepartment()).length}</p>
      <p class="text-xs sm:text-sm text-gray-600">Departments</p>
    </Card>
    <Card class="text-center p-3 sm:p-4 col-span-2 sm:col-span-1">
      <p class="text-2xl sm:text-3xl font-bold text-blue-600">
        {Math.round(teachers.length / Object.keys(teachersByDepartment()).length) || 0}
      </p>
      <p class="text-xs sm:text-sm text-gray-600">Avg per Dept</p>
    </Card>
    <Card class="text-center p-3 sm:p-4 col-span-2 sm:col-span-1">
      <p class="text-2xl sm:text-3xl font-bold text-purple-600">
        {teachers.filter(t => t.email).length}
      </p>
      <p class="text-xs sm:text-sm text-gray-600">With Email</p>
    </Card>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if teachers.length === 0}
    <Card>
      <div class="text-center py-8 sm:py-12">
        <svg class="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
        <p class="text-sm text-gray-600 mb-4">Get started by adding your first teacher.</p>
        <Button variant="primary" onclick={() => goto('/admin/teachers/new')} size="sm">
          Add First Teacher
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Mobile View - Accordion Style -->
    <div class="sm:hidden space-y-3">
      {#each Object.entries(teachersByDepartment()) as [department, deptTeachers]}
        <Card class="overflow-hidden">
          <button
            onclick={() => toggleDepartment(department)}
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-medium text-gray-900">{department}</h3>
                <p class="text-xs text-gray-500">{deptTeachers.length} teachers</p>
              </div>
            </div>
            <svg 
              class={`w-5 h-5 text-gray-400 transition-transform ${expandedDepartment === department ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {#if expandedDepartment === department}
            <div class="border-t divide-y">
              {#each deptTeachers as teacher}
                <div class="p-4 bg-gray-50">
                  <div class="flex items-start gap-3 mb-3">
                    {#if teacher.imageUrl}
                      <img 
                        src={teacher.imageUrl} 
                        alt={teacher.name}
                        class="w-12 h-12 rounded-full object-cover"
                      />
                    {:else}
                      <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    {/if}
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{teacher.name}</h4>
                      <p class="text-sm text-gray-600">{teacher.position}</p>
                      {#if teacher.email}
                        <a href="mailto:{teacher.email}" class="text-xs text-green-600 hover:text-green-700">
                          {teacher.email}
                        </a>
                      {/if}
                    </div>
                  </div>
                  
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onclick={() => goto(`/admin/teachers/${teacher.id}`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      onclick={() => deleteTeacher(teacher.id!)}
                      disabled={deleting === teacher.id}
                      fullWidth
                    >
                      {deleting === teacher.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card>
      {/each}
    </div>
    
    <!-- Desktop View - Tables -->
    <div class="hidden sm:block space-y-6">
      {#each Object.entries(teachersByDepartment()) as [department, deptTeachers]}
        <Card>
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">{department} Department</h2>
            <p class="text-sm text-gray-600">{deptTeachers.length} teacher{deptTeachers.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each deptTeachers as teacher}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        {#if teacher.imageUrl}
                          <img 
                            src={teacher.imageUrl} 
                            alt={teacher.name}
                            class="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        {:else}
                          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        {/if}
                        <div class="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.position}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {#if teacher.email}
                        <a href="mailto:{teacher.email}" class="text-green-600 hover:text-green-700">
                          {teacher.email}
                        </a>
                      {:else}
                        <span class="text-gray-400">—</span>
                      {/if}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.order}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href="/admin/teachers/{teacher.id}"
                        class="text-green-600 hover:text-green-900 mr-3"
                      >
                        Edit
                      </a>
                      <button
                        onclick={() => deleteTeacher(teacher.id!)}
                        disabled={deleting === teacher.id}
                        class="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleting === teacher.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>