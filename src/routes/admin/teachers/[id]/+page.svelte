<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import TeacherForm from '$lib/components/admin/TeacherForm.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { teacherOps } from '$lib/firebase/firestore';
  import type { Teacher } from '$lib/types';
  
  let teacher = $state<Teacher | null>(null);
  let loading = $state(true);
  let error = $state('');
  
  async function loadTeacher() {
    const teacherId = $page.params.id;
    
    try {
      const data = await teacherOps.getById(teacherId);
      if (data) {
        teacher = data;
      } else {
        error = 'Teacher not found';
      }
    } catch (err) {
      console.error('Error loading teacher:', err);
      error = 'Failed to load teacher';
    } finally {
      loading = false;
    }
  }
  
  async function handleSubmit(data: Omit<Teacher, 'id'>) {
    if (!teacher?.id) return;
    
    try {
      await teacherOps.update(teacher.id, data);
      goto('/admin/teachers');
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }
  
  function handleCancel() {
    goto('/admin/teachers');
  }
  
  onMount(() => {
    loadTeacher();
  });
</script>

<svelte:head>
  <title>Edit Teacher - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="max-w-4xl">
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error}
    <Card>
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-600 mb-4">{error}</p>
        <Button variant="primary" onclick={() => goto('/admin/teachers')}>
          Back to Teachers
        </Button>
      </div>
    </Card>
  {:else if teacher}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Edit Teacher</h1>
      <p class="text-gray-600">Update teacher information for {teacher.name}</p>
    </div>
    
    <TeacherForm 
      {teacher}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  {/if}
</div>