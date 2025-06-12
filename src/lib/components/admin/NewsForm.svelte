<script lang="ts">
  import FormField from '../forms/FormField.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import { user } from '$lib/stores/auth';
  import type { NewsPost } from '$lib/types';
  
  interface Props {
    post?: NewsPost;
    onSubmit: (data: Omit<NewsPost, 'id'>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
  }
  
  let { post, onSubmit, onCancel, loading = false }: Props = $props();
  
  let formData = $state({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    imageUrl: post?.imageUrl || '',
    isPublished: post?.isPublished ?? true
  });
  
  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let charCount = $derived(() => ({
    title: formData.title.length,
    excerpt: formData.excerpt.length
  }));
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};
    
    // Validate
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 300) {
      errors.excerpt = 'Excerpt must be less than 300 characters';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (Object.keys(errors).length > 0) return;
    
    isSubmitting = true;
    
    try {
      await onSubmit({
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim(),
        author: post?.author || $user?.displayName || 'Admin',
        isPublished: formData.isPublished,
        publishedAt: post?.publishedAt || new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error submitting news:', error);
      errors.general = 'Failed to save news post. Please try again.';
      isSubmitting = false;
    }
  }
  
  // Auto-generate excerpt from content if empty
  function generateExcerpt() {
    if (!formData.content.trim() || formData.excerpt.trim()) return;
    
    const plainText = formData.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    formData.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <Card>
    <h3 class="text-lg font-semibold mb-4">Post Details</h3>
    
    <div class="space-y-4">
      <div>
        <FormField
          label="Title"
          id="title"
          name="title"
          type="text"
          required
          bind:value={formData.title}
          error={errors.title}
          disabled={loading || isSubmitting}
          placeholder="Enter post title"
          maxlength="200"
        />
        <p class="mt-1 text-sm text-gray-500 text-right">
          {charCount().title}/200 characters
        </p>
      </div>
      
      <div>
        <FormField
          label="Excerpt"
          id="excerpt"
          name="excerpt"
          type="textarea"
          required
          bind:value={formData.excerpt}
          error={errors.excerpt}
          disabled={loading || isSubmitting}
          placeholder="Brief summary of the post"
          rows="2"
          maxlength="300"
          onblur={generateExcerpt}
        />
        <p class="mt-1 text-sm text-gray-500 text-right">
          {charCount().excerpt}/300 characters
        </p>
      </div>
      
      <FormField
        label="Featured Image URL"
        id="imageUrl"
        name="imageUrl"
        type="text"
        bind:value={formData.imageUrl}
        error={errors.imageUrl}
        disabled={loading || isSubmitting}
        placeholder="https://example.com/image.jpg"
        helper="Optional - displayed as the post's featured image"
      />
      
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
          Content <span class="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          bind:value={formData.content}
          disabled={loading || isSubmitting}
          rows="15"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-50"
          placeholder="Write your post content here..."
        ></textarea>
        {#if errors.content}
          <p class="mt-1 text-sm text-red-600">{errors.content}</p>
        {/if}
        <p class="mt-1 text-sm text-gray-500">
          You can use basic HTML tags for formatting
        </p>
      </div>
      
      <div>
        <label class="flex items-center">
          <input
            type="checkbox"
            bind:checked={formData.isPublished}
            disabled={loading || isSubmitting}
            class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
          />
          <span class="text-sm text-gray-700">Publish immediately</span>
        </label>
        <p class="mt-1 text-sm text-gray-500 ml-6">
          Unpublished posts are saved as drafts and not visible to the public
        </p>
      </div>
    </div>
  </Card>
  
  {#if formData.imageUrl}
    <Card>
      <h3 class="text-lg font-semibold mb-4">Image Preview</h3>
      <div class="max-w-2xl">
        <img 
          src={formData.imageUrl} 
          alt="Featured preview"
          class="w-full h-64 object-cover rounded-lg"
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
  
  <div class="flex justify-between items-center">
    <div class="text-sm text-gray-500">
      {#if post}
        Last updated: {new Date(post.updatedAt).toLocaleString('en-PH')}
      {:else}
        Author: {$user?.displayName || 'Admin'}
      {/if}
    </div>
    
    <div class="flex space-x-4">
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
        {post ? 'Update' : 'Create'} Post
      </Button>
    </div>
  </div>
</form>