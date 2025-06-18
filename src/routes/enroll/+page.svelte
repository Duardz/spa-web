<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import JuniorHighForm from '$lib/components/forms/JuniorHighForm.svelte';
  import SeniorHighForm from '$lib/components/forms/SeniorHighForm.svelte';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import { enrollmentSettings, userEnrollments } from '$lib/stores/enrollment';
  import { enrollmentOps } from '$lib/firebase/firestore';
  import type { Enrollment, JuniorHighEnrollment, SeniorHighEnrollment } from '$lib/types';
  import { encryptEnrollmentData } from '$lib/utils/encryption'; // make sure this is imported
  
  let selectedType = $state<'junior' | 'senior' | null>(null);
  let existingEnrollments = $state<Enrollment[]>([]);
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state('');
  let success = $state(false);
  let isVisible = $state(false);
  let formProgress = $state(0);
  
  // Security: Rate limiting for submissions
  let lastSubmitTime = 0;
  const SUBMIT_COOLDOWN = 5000; // 5 seconds
  
  // Security: Sanitize error messages to prevent XSS
  function sanitizeError(message: string): string {
    return message.replace(/[<>]/g, '').substring(0, 200);
  }
  
  // Security: Validate enrollment data
  function validateEnrollmentData(data: any): boolean {
    // Basic validation - the forms should do detailed validation
    if (!data.type || !['junior', 'senior'].includes(data.type)) return false;
    if (!data.fullName || data.fullName.trim().length === 0) return false;
    if (!data.birthDate) return false;
    if (!data.lrn || data.lrn.length !== 12) return false;
    if (!data.gradeLevel) return false;
    if (!data.guardianName) return false;
    if (!data.contactNumber) return false;
    
    // Check for required fields based on type
    if (data.type === 'senior') {
      if (!data.strand) return false;
      if (!data.semester) return false;
      if (!data.birthPlace) return false;
      if (!data.fatherName) return false;
      if (!data.motherName) return false;
    }
    
    return true;
  }
  // Load user's existing enrollments with caching
  async function loadEnrollments() {
    if (!$user) return;
    
    try {
      loading = true;
      error = '';
      
      // Add timeout for better UX
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const enrollmentsPromise = enrollmentOps.getByUser($user.uid);
      const enrollments = await Promise.race([enrollmentsPromise, timeoutPromise]) as any[];
      
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
      
    } catch (err) {
      console.error('Error loading enrollments:', err);
      error = 'Unable to load your enrollments. Please refresh the page.';
    } finally {
      loading = false;
      if (browser) {
        isVisible = true;
      }
    }
  }
  


  async function handleSubmit(data: Omit<JuniorHighEnrollment, 'id' | 'submittedAt' | 'updatedAt' | 'userId' | 'userEmail' | 'status'> | Omit<SeniorHighEnrollment, 'id' | 'submittedAt' | 'updatedAt' | 'userId' | 'userEmail' | 'status'>) {
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      error = 'Please wait a moment before submitting again.';
      return;
    }
    lastSubmitTime = now;

    if (!$user) {
      error = 'You must be signed in to submit an enrollment.';
      return;
    }

    if (!validateEnrollmentData(data)) {
      if (!data.type) {
        error = 'Enrollment type is missing. Please refresh the page and try again.';
      } else if (!data.fullName || data.fullName.trim().length === 0) {
        error = 'Full name is required. Please go back and fill in all required fields.';
      } else if (!data.birthDate) {
        error = 'Birth date is required. Please go back and fill in all required fields.';
      } else if (!data.lrn || data.lrn.length !== 12) {
        error = 'Valid LRN (12 digits) is required. Please go back and check your LRN.';
      } else if (!data.gradeLevel) {
        error = 'Grade level is required. Please go back and select your grade level.';
      } else if (!data.guardianName) {
        error = 'Guardian name is required. Please go back and fill in guardian information.';
      } else if (!data.contactNumber) {
        error = 'Contact number is required. Please go back and fill in contact information.';
      } else if (data.type === 'senior' && !data.strand) {
        error = 'Academic strand is required for Senior High. Please go back and select a strand.';
      } else {
        error = 'Please fill in all required fields correctly. Some information appears to be missing.';
      }
      console.error('Validation failed:', { data, error });
      return;
    }

    submitting = true;
    error = '';
    formProgress = 0;

    try {
      formProgress = 20;

      const enrollmentData = {
        ...data,
        userId: $user.uid,
        userEmail: $user.email || '',
        submittedAt: new Date(),
        updatedAt: new Date(),
        status: 'submitted' as const
      };

      formProgress = 60;

      // 🔐 Encrypt data before submitting
      const encryptedData = encryptEnrollmentData(enrollmentData);

      // 🛡️ Send encrypted data to Firestore
      const enrollmentId = await enrollmentOps.create(encryptedData);

      formProgress = 80;

      // Note: decryptedData is not stored in local state
      const newEnrollment = {
        ...enrollmentData,
        id: enrollmentId
      } as Enrollment;

      existingEnrollments = [...existingEnrollments, newEnrollment];
      userEnrollments.addEnrollment(newEnrollment);

      formProgress = 100;
      success = true;
      selectedType = null;

      if (browser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setTimeout(() => {
        success = false;
        formProgress = 0;
      }, 10000);

    } catch (err: any) {
      console.error('Submission error:', err);

      if (err.code === 'permission-denied') {
        error = 'You do not have permission to submit enrollments.';
      } else if (err.code === 'unavailable') {
        error = 'Unable to connect. Please check your internet connection.';
      } else {
        error = 'Failed to submit enrollment. Please try again.';
      }

      if (browser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } finally {
      submitting = false;
      if (!success) {
        formProgress = 0;
      }
    }
  }

  
  // Cancel form
  function handleCancel() {
    if (submitting) return;
    
    // Confirm if form has data
    if (browser && selectedType) {
      const confirmCancel = confirm('Are you sure you want to cancel? Any unsaved data will be lost.');
      if (!confirmCancel) return;
    }
    
    selectedType = null;
    error = '';
  }
  
  // Check if user can enroll for a specific type
  function canEnroll(type: 'junior' | 'senior'): boolean {
    // Check if enrollment is open globally
    if (!$enrollmentSettings.isOpen) return false;
    
    // Check if enrollment is open for this specific type
    const isJuniorOpen = $enrollmentSettings.juniorHighOpen ?? true;
    const isSeniorOpen = $enrollmentSettings.seniorHighOpen ?? true;
    
    if (type === 'junior' && !isJuniorOpen) return false;
    if (type === 'senior' && !isSeniorOpen) return false;
    
    // Check if user already has an enrollment for this school year
    const hasExisting = existingEnrollments.some((e: any) => {
      if (!e.type && e.gradeLevel) {
        const gradeNum = parseInt(e.gradeLevel);
        const inferredType = gradeNum <= 10 ? 'junior' : 'senior';
        return inferredType === type && e.schoolYear === $enrollmentSettings.schoolYear && e.status !== 'archived';
      }
      return e.type === type && 
             e.schoolYear === $enrollmentSettings.schoolYear &&
             e.status !== 'archived';
    });
    
    return !hasExisting;
  }
  
  // Get status color
  function getStatusColor(status: string): string {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'printed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  onMount(() => {
    if ($isAuthenticated) {
      loadEnrollments();
    } else {
      loading = false;
      if (browser) {
        isVisible = true;
      }
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
  <meta property="og:title" content="Online Enrollment - Saint Patrick's Academy">
  <meta property="og:description" content="Start your journey with us. Enroll now for School Year {$enrollmentSettings.schoolYear}.">
  <meta property="og:type" content="website">
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Progress Bar for Form Submission -->
    {#if formProgress > 0}
      <div class="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style="width: {formProgress}%"
        ></div>
      </div>
    {/if}
    
    <!-- Header -->
    <div class="text-center mb-8 {isVisible ? 'animate-fade-in' : 'opacity-0'}">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Online Enrollment
      </h1>
      <p class="text-xl text-gray-600">School Year {$enrollmentSettings.schoolYear}</p>
    </div>
    
    <!-- Error Alert -->
    {#if error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-shake" role="alert">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Success Alert -->
    {#if success}
      <div class="mb-6 bg-green-50 border border-green-200 rounded-xl p-6 animate-slide-down print-area">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-semibold text-green-800">Enrollment Submitted Successfully!</h3>
            <p class="mt-2 text-sm text-green-700">
              Your enrollment application has been received. We will review it and contact you soon.
            </p>
            <div class="mt-4 flex flex-col sm:flex-row gap-3">
              <Button 
                variant="primary" 
                size="sm"
                onclick={() => goto('/')}
                class="bg-green-600 hover:bg-green-700"
              >
                Go to Homepage
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onclick={() => window.print()}
              >
                Print Confirmation
              </Button>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    {#if loading}
      <div class="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p class="mt-4 text-gray-600">Loading enrollment information...</p>
      </div>
    {:else if !$enrollmentSettings.isOpen}
      <!-- Enrollment Closed -->
      <Card class="text-center py-16 {isVisible ? 'animate-slide-up' : 'opacity-0'}">
        <div class="max-w-md mx-auto">
          <div class="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Enrollment is Currently Closed</h2>
          <p class="text-gray-600 mb-8">
            {$enrollmentSettings.message || `Online enrollment for School Year ${$enrollmentSettings.schoolYear} is not yet open. Please check back later or contact the school for more information.`}
          </p>
          <div class="space-y-3">
            <Button variant="primary" onclick={() => goto('/')}>
              Back to Home
            </Button>
            <p class="text-sm text-gray-500">
              Need help? <a href="/about#contact" class="text-emerald-600 hover:text-emerald-700">Contact us</a>
            </p>
          </div>
        </div>
      </Card>
    {:else if !$isAuthenticated}
      <!-- Not Signed In -->
      <Card class="text-center py-16 {isVisible ? 'animate-slide-up' : 'opacity-0'}">
        <div class="max-w-md mx-auto">
          <div class="mx-auto h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg class="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
          <p class="text-gray-600 mb-8">
            You need to sign in with your Google account to submit an enrollment application.
          </p>
          <div class="space-y-4">
            <Button 
              variant="primary" 
              onclick={() => goto('/signin?redirect=/enroll')}
              class="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Button>
            <p class="text-sm text-gray-500">
              Don't have an account? Sign in with Google will create one automatically.
            </p>
          </div>
        </div>
      </Card>
    {:else if selectedType === null}
      <!-- Select Enrollment Type -->
      <div class="space-y-6 {isVisible ? 'animate-slide-up' : 'opacity-0'}">
        <!-- Existing Enrollments -->
        {#if existingEnrollments.length > 0}
          <Card class="overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 -m-6 mb-4">
              <h2 class="text-lg font-semibold">Your Enrollments</h2>
            </div>
            <div class="space-y-3 mt-6">
              {#each existingEnrollments as enrollment}
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">
                        {enrollment.type === 'junior' ? 'Junior High School' : 'Senior High School'} - Grade {enrollment.gradeLevel}
                      </p>
                      <p class="text-sm text-gray-600 mt-1">
                        School Year: {enrollment.schoolYear}
                      </p>
                      <p class="text-sm text-gray-500">
                        Submitted: {new Date(enrollment.submittedAt).toLocaleDateString('en-PH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      
                      <!-- Show rejection reason if enrollment is rejected -->
                      {#if enrollment.status === 'rejected' && enrollment.rejectionReason}
                        <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div class="flex items-start">
                            <svg class="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p class="text-sm font-medium text-red-800 mb-1">Application Rejected</p>
                              <p class="text-sm text-red-700">{enrollment.rejectionReason}</p>
                              <p class="text-xs text-red-600 mt-2">
                                Please address the issue above and submit a new application.
                              </p>
                            </div>
                          </div>
                        </div>
                      {/if}
                      
                      <!-- Show verified message -->
                      {#if enrollment.status === 'verified'}
                        <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p class="text-sm font-medium text-green-800">Application Verified</p>
                              <p class="text-sm text-green-700">Your enrollment has been verified. Please wait for further instructions.</p>
                            </div>
                          </div>
                        </div>
                      {/if}
                      
                      <!-- Show printed message -->
                      {#if enrollment.status === 'printed'}
                        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div class="flex items-start">
                            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p class="text-sm font-medium text-blue-800">Forms Printed</p>
                              <p class="text-sm text-blue-700">Your enrollment forms have been printed. Please visit the school to complete the process.</p>
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>
                    <span class={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(enrollment.status)}`}>
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
          <Card class="group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div class="text-center p-8">
              <div class="mb-6">
                <div class="mx-auto h-24 w-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <span class="text-3xl font-bold text-emerald-700">JHS</span>
                </div>
              </div>
              <h3 class="text-2xl font-bold mb-2 text-gray-900">Junior High School</h3>
              <p class="text-gray-600 mb-6">Grades 7 to 10</p>
              
              {#if canEnroll('junior')}
                <Button 
                  variant="primary" 
                  fullWidth={true}
                  onclick={() => selectedType = 'junior'}
                  class="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Enroll for Junior High
                </Button>
              {:else if !$enrollmentSettings.juniorHighOpen}
                <div class="bg-gray-100 rounded-lg p-3">
                  <p class="text-sm text-gray-600">Junior High enrollment is closed</p>
                </div>
              {:else}
                <div class="bg-blue-50 rounded-lg p-3">
                  <p class="text-sm text-blue-700">You already have an enrollment for this school year</p>
                </div>
              {/if}
            </div>
          </Card>
          
          <!-- Senior High -->
          <Card class="group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div class="text-center p-8">
              <div class="mb-6">
                <div class="mx-auto h-24 w-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <span class="text-3xl font-bold text-amber-700">SHS</span>
                </div>
              </div>
              <h3 class="text-2xl font-bold mb-2 text-gray-900">Senior High School</h3>
              <p class="text-gray-600 mb-6">Grades 11 to 12</p>
              
              {#if canEnroll('senior')}
                <Button 
                  variant="primary"
                  fullWidth={true}
                  onclick={() => selectedType = 'senior'}
                  class="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Enroll for Senior High
                </Button>
              {:else if !$enrollmentSettings.seniorHighOpen}
                <div class="bg-gray-100 rounded-lg p-3">
                  <p class="text-sm text-gray-600">Senior High enrollment is closed</p>
                </div>
              {:else}
                <div class="bg-blue-50 rounded-lg p-3">
                  <p class="text-sm text-blue-700">You already have an enrollment for this school year</p>
                </div>
              {/if}
            </div>
          </Card>
        </div>
        
        <!-- Information Card -->
        <Card class="bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-base font-semibold text-blue-900">Before you begin</h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="list-disc list-inside space-y-2">
                  <li>Have all required documents ready (PSA Birth Certificate, Report Card, etc.)</li>
                  <li>The form takes approximately 10-15 minutes to complete</li>
                  <li>All fields marked with asterisk (*) are required</li>
                  <li>You can submit one enrollment per type per school year</li>
                  <li>Make sure your information is accurate before submitting</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    {:else}
      <!-- Enrollment Form -->
      <div class="mb-6 {isVisible ? 'animate-fade-in' : 'opacity-0'}">
        <button
          onclick={handleCancel}
          disabled={submitting}
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to selection
        </button>
      </div>
      
      <div class="{isVisible ? 'animate-slide-up animation-delay-200' : 'opacity-0'}">
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
      </div>
    {/if}
  </div>
</div>

<style>
  /* Animations */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-2px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(2px);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.5s ease-out forwards;
  }
  
  .animate-slide-down {
    animation: slide-down 0.5s ease-out forwards;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-out;
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  /* Print styles for confirmation */
  @media print {
    :global(body *) {
      visibility: hidden;
    }
    
    :global(.print-area),
    :global(.print-area *) {
      visibility: visible;
    }
    
    :global(.print-area) {
      position: absolute;
      left: 0;
      top: 0;
    }
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
    .bg-gradient-to-br,
    .bg-gradient-to-b {
      background: transparent !important;
    }
    
    .text-transparent {
      -webkit-text-fill-color: currentColor !important;
      background: transparent !important;
    }
  }
</style>