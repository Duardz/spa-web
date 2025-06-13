<script lang="ts">
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import JuniorHighForm from '$lib/components/forms/JuniorHighForm.svelte';
  import SeniorHighForm from '$lib/components/forms/SeniorHighForm.svelte';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import { enrollmentSettings, userEnrollments } from '$lib/stores/enrollment';
  import { enrollmentOps } from '$lib/firebase/firestore';
  import type { Enrollment } from '$lib/types';
  import { onMount } from 'svelte';
  
  let selectedType = $state<'junior' | 'senior' | null>(null);
  let showSuccess = $state(false);
  let loading = $state(true);
  let myEnrollments = $state<Enrollment[]>([]);
  
  onMount(async () => {
    // Check if user is authenticated
    if (!$isAuthenticated) {
      loading = false;
      return;
    }
    
    // Load user's enrollments
    try {
      const enrollments = await enrollmentOps.getByUser($user!.uid);
      myEnrollments = enrollments;
      userEnrollments.setEnrollments(enrollments);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      loading = false;
    }
  });
  
  async function handleSubmit(data: Omit<Enrollment, 'id'>) {
    if (!$user) return;
    
    try {
      // Add user info to enrollment data
      const enrollmentData = {
        ...data,
        userId: $user.uid,
        userEmail: $user.email
      };
      
      const enrollmentId = await enrollmentOps.create(enrollmentData);
      
      // Show success message
      showSuccess = true;
      selectedType = null;
      
      // Reload enrollments
      const enrollments = await enrollmentOps.getByUser($user.uid);
      myEnrollments = enrollments;
      userEnrollments.setEnrollments(enrollments);
      
      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      throw error;
    }
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted': return 'text-yellow-600 bg-yellow-50';
      case 'verified': return 'text-green-600 bg-green-50';
      case 'printed': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
</script>

<svelte:head>
  <title>Enrollment - Saint Patrick's Academy</title>
  <meta name="description" content="Enroll at Saint Patrick's Academy for Junior High School or Senior High School. Start your application online.">
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {#if !$enrollmentSettings.isOpen}
    <!-- Enrollment Closed -->
    <Card class="max-w-2xl mx-auto">
      <div class="text-center py-8">
        <svg class="w-20 h-20 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Enrollment is Currently Closed</h2>
        <p class="text-gray-600 mb-2">
          Online enrollment for School Year {$enrollmentSettings.schoolYear} is not yet open.
        </p>
        {#if $enrollmentSettings.message}
          <p class="text-gray-700 font-medium mt-4">{$enrollmentSettings.message}</p>
        {/if}
      </div>
    </Card>
  {:else if !$isAuthenticated}
    <!-- Not Authenticated but Enrollment is Open -->
    <div class="space-y-8">
      <!-- Enrollment Info -->
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Online Enrollment
        </h1>
        <p class="text-xl text-gray-600">
          School Year {$enrollmentSettings.schoolYear}
        </p>
      </div>
      
      <!-- Available Programs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {#if $enrollmentSettings.juniorHighOpen}
          <Card>
            <div class="text-center py-8">
              <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl font-bold">JHS</span>
              </div>
              <h2 class="text-2xl font-bold mb-2">Junior High School</h2>
              <p class="text-gray-600 mb-4">Grades 7 to 10</p>
              <div class="text-sm text-gray-500">
                ✓ K-12 Curriculum<br>
                ✓ Values Education<br>
                ✓ Co-curricular Activities
              </div>
            </div>
          </Card>
        {/if}
        
        {#if $enrollmentSettings.seniorHighOpen}
          <Card>
            <div class="text-center py-8">
              <div class="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl font-bold">SHS</span>
              </div>
              <h2 class="text-2xl font-bold mb-2">Senior High School</h2>
              <p class="text-gray-600 mb-4">Grades 11 and 12</p>
              <div class="text-sm text-gray-500">
                ✓ STEM, HUMSS, ABM Strands<br>
                ✓ College Preparation<br>
                ✓ Work Immersion
              </div>
            </div>
          </Card>
        {/if}
      </div>
      
      <!-- Sign In Prompt -->
      <Card class="max-w-2xl mx-auto bg-blue-50 border-blue-200">
        <div class="text-center py-8">
          <svg class="w-20 h-20 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Apply?</h2>
          <p class="text-gray-700 mb-6">
            Sign in with your Google account to access the enrollment form and submit your application.
          </p>
          <a href="/signin?redirect=/enroll">
            <Button variant="primary" size="lg">
              Sign In to Start Application
            </Button>
          </a>
        </div>
      </Card>
    </div>
  {:else if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if showSuccess}
    <!-- Success Message -->
    <Card class="max-w-2xl mx-auto bg-green-50 border-green-200">
      <div class="text-center py-8">
        <svg class="w-20 h-20 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-green-800 mb-4">Enrollment Submitted Successfully!</h2>
        <p class="text-gray-700 mb-6">
          Your enrollment application has been submitted. You can view your application status below.
        </p>
        <Button variant="primary" onclick={() => showSuccess = false}>
          View My Applications
        </Button>
      </div>
    </Card>
  {:else if !selectedType}
    <!-- Enrollment Options for Authenticated Users -->
    <div class="text-center mb-8">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Online Enrollment
      </h1>
      <p class="text-xl text-gray-600">
        School Year {$enrollmentSettings.schoolYear}
      </p>
    </div>
    
    {#if myEnrollments.length > 0}
      <!-- Existing Enrollments -->
      <Card class="mb-8">
        <h2 class="text-2xl font-bold mb-4">My Applications</h2>
        <div class="space-y-4">
          {#each myEnrollments as enrollment}
            <div class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-lg">
                    {enrollment.type === 'junior' ? 'Junior' : 'Senior'} High School - Grade {enrollment.gradeLevel}
                  </h3>
                  <p class="text-gray-600">Submitted on {new Date(enrollment.submittedAt).toLocaleDateString('en-PH')}</p>
                </div>
                <span class={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
                  {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                </span>
              </div>
              {#if enrollment.type === 'senior'}
                <p class="text-sm text-gray-600 mt-2">
                  Strand: {enrollment.strand} | Semester: {enrollment.semester}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      </Card>
    {/if}
    
    <!-- Choose Enrollment Type -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {#if $enrollmentSettings.juniorHighOpen}
        <Card hover class="cursor-pointer" onclick={() => selectedType = 'junior'}>
          <div class="text-center py-8">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold">JHS</span>
            </div>
            <h2 class="text-2xl font-bold mb-2">Junior High School</h2>
            <p class="text-gray-600 mb-4">Grades 7 to 10</p>
            <Button variant="primary">Apply Now</Button>
          </div>
        </Card>
      {/if}
      
      {#if $enrollmentSettings.seniorHighOpen}
        <Card hover class="cursor-pointer" onclick={() => selectedType = 'senior'}>
          <div class="text-center py-8">
            <div class="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold">SHS</span>
            </div>
            <h2 class="text-2xl font-bold mb-2">Senior High School</h2>
            <p class="text-gray-600 mb-4">Grades 11 and 12</p>
            <Button variant="secondary">Apply Now</Button>
          </div>
        </Card>
      {/if}
    </div>
  {:else}
    <!-- Enrollment Form -->
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <button 
          onclick={() => selectedType = null}
          class="text-green-700 hover:text-green-800 font-medium inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Options
        </button>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        {selectedType === 'junior' ? 'Junior' : 'Senior'} High School Enrollment Form
      </h1>
      
      {#if selectedType === 'junior'}
        <JuniorHighForm 
          onSubmit={handleSubmit} 
          schoolYear={$enrollmentSettings.schoolYear}
        />
      {:else}
        <SeniorHighForm 
          onSubmit={handleSubmit} 
          schoolYear={$enrollmentSettings.schoolYear}
        />
      {/if}
    </div>
  {/if}
</div>