<script lang="ts">
  import { goto } from '$app/navigation';
  import TeacherForm from '$lib/components/admin/TeacherForm.svelte';
  import { teacherOps } from '$lib/firebase/firestore';
  import type { Teacher } from '$lib/types';
  
  async function handleSubmit(data: Omit<Teacher, 'id'>) {
    try {
      await teacherOps.create(data);
      goto('/admin/teachers');
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  }
  
  function handleCancel() {
    goto('/admin/teachers');
  }
</script>

<svelte:head>
  <title>Add New Teacher - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="max-w-4xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Add New Teacher</h1>
    <p class="text-gray-600">Create a new faculty or staff member profile</p>
  </div>
  
  <TeacherForm 
    onSubmit={handleSubmit}
    onCancel={handleCancel}
  />
</div>