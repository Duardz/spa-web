<script lang="ts">
  import FormField from '../forms/FormField.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import type { Teacher } from '$lib/types';
  
  interface Props {
    teacher?: Teacher;
    onSubmit: (data: Omit<Teacher, 'id'>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
  }
  
  let { teacher, onSubmit, onCancel, loading = false }: Props = $props();
  
  let formData = $state({
    name: teacher?.name || '',
    position: teacher?.position || '',
    department: teacher?.department || 'General',
    email: teacher?.email || '',
    imageUrl: teacher?.imageUrl || '',
    order: teacher?.order || 0
  });
  
  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};
    
    // Validate
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    if (Object.keys(errors).length > 0) return;
    
    isSubmitting = true;
    
    try {
      await onSubmit({
        name: formData.name.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        email: formData.email.trim(),
        imageUrl: formData.imageUrl.trim(),
        order: formData.order
      });
    } catch (error) {
      console.error('Error submitting teacher:', error);
      errors.general = 'Failed to save teacher. Please try again.';
      isSubmitting = false;
    }
  }
  
  const departments = [
    'General',
    'Junior High School',
    'Senior High School',
    'Mathematics',
    'Science',
    'English',
    'Filipino',
    'Social Studies',
    'Values Education',
    'MAPEH',
    'TLE',
    'Computer',
    'Administration'
  ];
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <Card>
    <h3 class="text-lg font-semibold mb-4">Teacher Information</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Full Name"
        id="name"
        name="name"
        type="text"
        required
        bind:value={formData.name}
        error={errors.name}
        disabled={loading || isSubmitting}
        placeholder="e.g., Juan Dela Cruz"
      />
      
      <FormField
        label="Position/Title"
        id="position"
        name="position"
        type="text"
        required
        bind:value={formData.position}
        error={errors.position}
        disabled={loading || isSubmitting}
        placeholder="e.g., Math Teacher, Principal"
      />
      
      <FormField
        label="Department"
        id="department"
        name="department"
        type="select"
        required
        bind:value={formData.department}
        error={errors.department}
        disabled={loading || isSubmitting}
      >
        {#each departments as dept}
          <option value={dept}>{dept}</option>
        {/each}
      </FormField>
      
      <FormField
        label="Email Address"
        id="email"
        name="email"
        type="email"
        bind:value={formData.email}
        error={errors.email}
        disabled={loading || isSubmitting}
        placeholder="teacher@stpatrickacademy.edu.ph"
        helper="Optional - for contact display"
      />
      
      <FormField
        label="Photo URL"
        id="imageUrl"
        name="imageUrl"
        type="text"
        bind:value={formData.imageUrl}
        error={errors.imageUrl}
        disabled={loading || isSubmitting}
        placeholder="https://example.com/photo.jpg"
        helper="Optional - link to teacher's photo"
        class="md:col-span-2"
      />
      
      <FormField
        label="Display Order"
        id="order"
        name="order"
        type="number"
        bind:value={formData.order}
        error={errors.order}
        disabled={loading || isSubmitting}
        min="0"
        helper="Lower numbers appear first"
      />
    </div>
  </Card>
  
  {#if formData.imageUrl}
    <Card>
      <h3 class="text-lg font-semibold mb-4">Photo Preview</h3>
      <div class="flex justify-center">
        <img 
          src={formData.imageUrl} 
          alt="Teacher preview"
          class="w-32 h-32 rounded-full object-cover"
          onerror={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = 'none';
            errors.imageUrl = 'Invalid image URL';
          }}
        />
      </div>
    </Card>
  {/if}
  
  {#if errors.general}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {errors.general}
    </div>
  {/if}
  
  <div class="flex justify-end space-x-4">
    <Button 
      type="button" 
      variant="outline" 
      onclick={onCancel}
      disabled={loading || isSubmitting}
    >
      Cancel
    </Button>
    <Button 
      type="submit" 
      variant="primary"
      loading={isSubmitting}
      disabled={loading || isSubmitting}
    >
      {teacher ? 'Update' : 'Create'} Teacher
    </Button>
  </div>
</form>