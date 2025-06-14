<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { teacherOps } from '$lib/firebase/firestore';
  import type { Teacher } from '$lib/types';
	import { error } from '@sveltejs/kit';
  
  let teachers = $state<Teacher[]>([]);
  let loading = $state(true);
  let deleting = $state<string | null>(null);
  
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
  
  onMount(async () => {
    try {
      console.log('Fetching teachers...');
      const fetchedTeachers = await teacherOps.getAll();
      console.log('[snapshot] Fetched teachers:', $state.snapshot(fetchedTeachers));
      teachers = fetchedTeachers;
    } catch (err) {
      console.error('Error loading teachers:', err);
      err = 'Failed to load teachers. Please try again later.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Manage Teachers - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Teachers</h1>
      <p class="text-gray-600">Manage faculty and staff members</p>
    </div>
    <div class="flex space-x-3">
      <Button variant="outline" onclick={loadTeachers}>
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </Button>
      <Button variant="primary" onclick={() => goto('/admin/teachers/new')}>
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Teacher
      </Button>
    </div>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if teachers.length === 0}
    <Card>
      <div class="text-center py-12">
        <svg class="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
        <p class="text-gray-600 mb-4">Get started by adding your first teacher.</p>
        <Button variant="primary" onclick={() => goto('/admin/teachers/new')}>
          Add First Teacher
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Teachers by Department -->
    {#each Object.entries(teachersByDepartment()) as [department, deptTeachers]}
      <Card>
        <h2 class="text-xl font-semibold mb-4 text-gray-900">{department} Department</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
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
  {/if}
</div>