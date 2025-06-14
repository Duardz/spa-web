<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import JuniorHighForm from '$lib/components/forms/JuniorHighForm.svelte';
  import SeniorHighForm from '$lib/components/forms/SeniorHighForm.svelte';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import { enrollmentSettings, userEnrollments } from '$lib/stores/enrollment';
  import { enrollmentOps } from '$lib/firebase/firestore';
  import type { Enrollment, JuniorHighEnrollment, SeniorHighEnrollment } from '$lib/types';
  
  let selectedType = $state<'junior' | 'senior' | null>(null);
  let existingEnrollments = $state<Enrollment[]>([]);
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state('');
  let success = $state(false);
  
  // Sanitize error messages to prevent XSS
  function sanitizeError(message: string): string {
    return message.replace(/[<>]/g, '');
  }
  
  // Load user's existing enrollments
  async function loadEnrollments() {
    if (!$user) return;
    
    try {
      loading = true;
      error = '';
      const enrollments = await enrollmentOps.getByUser($user.uid);
      
      // Fix any enrollments missing the type field
      const fixedEnrollments = enrollments.map((enrollment: any) => {
        if (!enrollment.type && enrollment.gradeLevel) {
          const gradeNum = parseInt(enrollment.gradeLevel);
          const inferredType = gradeNum <= 10 ? 'junior' : 'senior';
          return {
            ...enrollment,
            type: inferredType
          } as Enrollment;
        }
        return enrollment as Enrollment;
      });
      
      existingEnrollments = fixedEnrollments;
      userEnrollments.setEnrollments(fixedEnrollments);
      
      // Debug log
      console.log('Loaded enrollments:', fixedEnrollments);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      error = 'Failed to load your enrollments. Please refresh the page.';
    } finally {
      loading = false;
    }
  }
  
  // Handle form submission with improved validation
  async function handleSubmit(data: Omit<JuniorHighEnrollment, 'id' | 'submittedAt' | 'updatedAt' | 'userId' | 'userEmail' | 'status'> | Omit<SeniorHighEnrollment, 'id' | 'submittedAt' | 'updatedAt' | 'userId' | 'userEmail' | 'status'>) {
    if (!$user) {
      error = 'You must be signed in to submit an enrollment.';
      return;
    }
    
    // Additional client-side validation
    if (!data.type || !['junior', 'senior'].includes(data.type)) {
      error = 'Invalid enrollment type.';
      return;
    }
    
    submitting = true;
    error = '';
    
    try {
      // Create enrollment data without id
      const enrollmentData = {
        ...data,
        userId: $user.uid,
        userEmail: $user.email || '',
        submittedAt: new Date(),
        updatedAt: new Date(),
        status: 'submitted' as const
      };
      
      // Submit to Firestore (will handle date conversion)
      const enrollmentId = await enrollmentOps.create(enrollmentData);
      
      // Create the properly typed enrollment for local state
      const newEnrollment = {
        ...enrollmentData,
        id: enrollmentId
      } as Enrollment;
      
      existingEnrollments = [...existingEnrollments, newEnrollment];
      userEnrollments.addEnrollment(newEnrollment);
      
      // Show success
      success = true;
      selectedType = null;
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Clear success message after 5 seconds
      setTimeout(() => success = false, 5000);
      
    } catch (err: any) {
      console.error('Submission error:', err);
      
      // Provide user-friendly error messages with sanitization
      if (err.code === 'permission-denied') {
        error = 'You do not have permission to submit enrollments. Please contact support.';
      } else if (err.code === 'unavailable') {
        error = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message) {
        error = sanitizeError(err.message);
      } else {
        error = 'Failed to submit enrollment. Please try again or contact support.';
      }
      
      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      submitting = false;
    }
  }
  
  // Cancel form
  function handleCancel() {
    selectedType = null;
    error = '';
  }
  
  // Check if user can enroll for a specific type with detailed logging
  function canEnroll(type: 'junior' | 'senior'): boolean {
    // Debug log
    console.log(`Checking if can enroll for ${type}:`, {
      isOpen: $enrollmentSettings.isOpen,
      typeOpen: type === 'junior' ? $enrollmentSettings.juniorHighOpen : $enrollmentSettings.seniorHighOpen,
      existingEnrollments: existingEnrollments.filter(e => e.type === type),
      schoolYear: $enrollmentSettings.schoolYear,
      allEnrollments: existingEnrollments // Show all enrollments for debugging
    });
    
    // Check if enrollment is open globally
    if (!$enrollmentSettings.isOpen) {
      console.log('Enrollment is not open globally');
      return false;
    }
    
    // Check if enrollment is open for this specific type
    // Note: Default to true if undefined to prevent issues
    const isJuniorOpen = $enrollmentSettings.juniorHighOpen ?? true;
    const isSeniorOpen = $enrollmentSettings.seniorHighOpen ?? true;
    
    if (type === 'junior' && !isJuniorOpen) {
      console.log('Junior High enrollment is not open');
      return false;
    }
    if (type === 'senior' && !isSeniorOpen) {
      console.log('Senior High enrollment is not open');
      return false;
    }
    
    // Check if user already has a submitted enrollment for this school year
    // Handle cases where type might be missing from old enrollments
    const hasExisting = existingEnrollments.some((e: any) => {
      // Check if enrollment has a type field
      if (!e.type) {
        console.warn('Enrollment missing type field:', e);
        // Try to infer type from gradeLevel if possible
        if (e.gradeLevel) {
          const gradeNum = parseInt(e.gradeLevel);
          const inferredType = gradeNum <= 10 ? 'junior' : 'senior';
          return inferredType === type && e.schoolYear === $enrollmentSettings.schoolYear && e.status !== 'archived';
        }
        return false; // Can't determine type, assume it's not blocking
      }
      return e.type === type && 
             e.schoolYear === $enrollmentSettings.schoolYear &&
             e.status !== 'archived';
    });
    
    if (hasExisting) {
      console.log(`User already has ${type} enrollment for ${$enrollmentSettings.schoolYear}`);
    }
    
    return !hasExisting;
  }
  
  onMount(() => {
    if ($isAuthenticated) {
      loadEnrollments();
    } else {
      loading = false;
    }
  });
  
  // Reactive: Reload when user changes
  $effect(() => {
    if ($user) {
      loadEnrollments();
    } else {
      existingEnrollments = [];
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Online Enrollment - Saint Patrick's Academy</title>
  <meta name="description" content="Enroll online for Junior and Senior High School at Saint Patrick's Academy. Quick and easy enrollment process for School Year {$enrollmentSettings.schoolYear}.">
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Online Enrollment</h1>
      <p class="mt-2 text-lg text-gray-600">School Year {$enrollmentSettings.schoolYear}</p>
    </div>
    
    <!-- Error Alert -->
    {#if error}
      <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Success Alert -->
    {#if success}
      <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Enrollment Submitted Successfully!</h3>
            <p class="mt-1 text-sm text-green-700">
              Your enrollment application has been received. We will review it and contact you soon.
            </p>
          </div>
        </div>
      </div>
    {/if}
    
    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    {:else if !$enrollmentSettings.isOpen}
      <!-- Enrollment Closed -->
      <Card class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">Enrollment is Currently Closed</h2>
        <p class="mt-2 text-gray-600 max-w-md mx-auto">
          {$enrollmentSettings.message || 'Online enrollment for School Year ' + $enrollmentSettings.schoolYear + ' is not yet open. Please check back later or contact the school for more information.'}
        </p>
        <div class="mt-6">
          <Button variant="outline" onclick={() => goto('/')}>
            Back to Home
          </Button>
        </div>
      </Card>
    {:else if !$isAuthenticated}
      <!-- Not Signed In -->
      <Card class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">Sign In Required</h2>
        <p class="mt-2 text-gray-600 max-w-md mx-auto">
          You need to sign in with your Google account to submit an enrollment application.
        </p>
        <div class="mt-6 space-y-3">
          <Button variant="primary" onclick={() => goto('/signin?redirect=/enroll')}>
            Sign In to Continue
          </Button>
          <p class="text-sm text-gray-500">
            Don't have an account? Sign in with Google will create one automatically.
          </p>
        </div>
      </Card>
    {:else if selectedType === null}
      <!-- Select Enrollment Type -->
      <div class="space-y-6">
        <!-- Existing Enrollments -->
        {#if existingEnrollments.length > 0}
          <Card>
            <h2 class="text-lg font-semibold mb-4">Your Enrollments</h2>
            <div class="space-y-3">
              {#each existingEnrollments as enrollment}
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900">
                        {enrollment.type === 'junior' ? 'Junior High School' : 'Senior High School'} - Grade {enrollment.gradeLevel}
                      </p>
                      <p class="text-sm text-gray-600">
                        School Year: {enrollment.schoolYear}
                      </p>
                      <p class="text-sm text-gray-500">
                        Submitted: {new Date(enrollment.submittedAt).toLocaleDateString('en-PH')}
                      </p>
                    </div>
                    <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      enrollment.status === 'verified' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'printed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          </Card>
        {/if}
        
        <!-- Enrollment Options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Junior High -->
          <Card hover class="relative">
            <div class="text-center">
              <div class="mb-4">
                <div class="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl font-bold text-green-700">JHS</span>
                </div>
              </div>
              <h3 class="text-xl font-semibold mb-2">Junior High School</h3>
              <p class="text-gray-600 mb-4">Grades 7 to 10</p>
              
              {#if canEnroll('junior')}
                <Button 
                  variant="primary" 
                  fullWidth={true}
                  onclick={() => selectedType = 'junior'}
                >
                  Enroll for Junior High
                </Button>
              {:else if !$enrollmentSettings.juniorHighOpen}
                <p class="text-sm text-gray-500">Junior High enrollment is closed</p>
              {:else}
                <p class="text-sm text-gray-500">You already have an enrollment for this school year</p>
              {/if}
            </div>
          </Card>
          
          <!-- Senior High -->
          <Card hover class="relative">
            <div class="text-center">
              <div class="mb-4">
                <div class="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl font-bold text-yellow-600">SHS</span>
                </div>
              </div>
              <h3 class="text-xl font-semibold mb-2">Senior High School</h3>
              <p class="text-gray-600 mb-4">Grades 11 to 12</p>
              
              {#if canEnroll('senior')}
                <Button 
                  variant="primary"
                  fullWidth={true}
                  onclick={() => selectedType = 'senior'}
                  class="!bg-gradient-to-r !from-yellow-500 !to-yellow-600"
                >
                  Enroll for Senior High
                </Button>
              {:else if !$enrollmentSettings.seniorHighOpen}
                <p class="text-sm text-gray-500">Senior High enrollment is closed</p>
              {:else}
                <p class="text-sm text-gray-500">You already have an enrollment for this school year</p>
              {/if}
            </div>
          </Card>
        </div>
        
        <!-- Information -->
        <Card class="bg-blue-50 border-blue-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-blue-800">Before you begin</h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="list-disc list-inside space-y-1">
                  <li>Make sure you have all required documents ready</li>
                  <li>The form will take approximately 10-15 minutes to complete</li>
                  <li>All fields marked with * are required</li>
                  <li>You can only submit one enrollment per type per school year</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    {:else}
      <!-- Enrollment Form -->
      <div class="mb-6">
        <button
          onclick={handleCancel}
          class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to selection
        </button>
      </div>
      
      {#if selectedType === 'junior'}
        <JuniorHighForm 
          onSubmit={handleSubmit}
          schoolYear={$enrollmentSettings.schoolYear}
          disabled={submitting}
        />
      {:else if selectedType === 'senior'}
        <SeniorHighForm 
          onSubmit={handleSubmit}
          schoolYear={$enrollmentSettings.schoolYear}
          disabled={submitting}
        />
      {/if}
    {/if}
  </div>
</div>