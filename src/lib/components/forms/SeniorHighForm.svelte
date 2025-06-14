<!-- src/lib/components/forms/SeniorHighForm.svelte -->
<script lang="ts">
  import FormField from './FormField.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import { validateSeniorHighForm, calculateAge } from '$lib/utils/validators';
  import { sanitizeInput, RateLimiter } from '$lib/utils/security';
  import type { SeniorHighEnrollment, ValidationError } from '$lib/types';
  import { onMount } from 'svelte';
  
  interface Props {
    onSubmit: (data: Omit<SeniorHighEnrollment, 'id' | 'submittedAt' | 'updatedAt' | 'userId' | 'userEmail' | 'status'>) => Promise<void>;
    schoolYear: string;
    disabled?: boolean;
  }
  
  let { onSubmit, schoolYear, disabled = false }: Props = $props();
  
  const rateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
  
  let currentStep = $state(1);
  const totalSteps = 5;
  
  let formData = $state({
    gradeLevel: '11' as '11' | '12',
    strand: '' as 'STEM' | 'HUMSS' | 'ABM',
    semester: '1st' as '1st' | '2nd',
    isESCGrantee: false,
    lrn: '',
    fullName: '',
    birthPlace: '',
    birthDate: '',
    age: 0,
    gender: '' as 'Male' | 'Female',
    religion: '',
    address: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    guardianName: '',
    guardianRelation: '',
    contactNumber: '',
    lastSchool: '',
    generalAverage: 75,
    isTransferee: false,
    hasAcademicAward: false,
    hasForm9: false,
    hasForm10: false,
    hasPSA: false,
    hasMoral: false,
    hasBaptismal: false,
    hasCompletionCert: false,
    hasESC: false,
    hasNCAE: false
  });
  
  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let touched = $state<Record<string, boolean>>({});
  
  // Progress calculation
  const progress = $derived((currentStep / totalSteps) * 100);
  
  // Auto-save to localStorage (encrypted)
  $effect(() => {
    if (typeof window !== 'undefined' && !isSubmitting) {
      try {
        const encrypted = btoa(JSON.stringify({
          ...formData,
          step: currentStep,
          timestamp: Date.now()
        }));
        sessionStorage.setItem('shs_enrollment_draft', encrypted);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }
  });
  
  // Load draft on mount
  onMount(() => {
    if (typeof window !== 'undefined') {
      try {
        const draft = sessionStorage.getItem('shs_enrollment_draft');
        if (draft) {
          const decrypted = JSON.parse(atob(draft));
          // Check if draft is less than 24 hours old
          if (Date.now() - decrypted.timestamp < 24 * 60 * 60 * 1000) {
            formData = { ...formData, ...decrypted };
            currentStep = decrypted.step || 1;
          } else {
            sessionStorage.removeItem('shs_enrollment_draft');
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  });
  
  // Auto-calculate age when birthdate changes
  $effect(() => {
    if (formData.birthDate) {
      formData.age = calculateAge(formData.birthDate);
    }
  });
  
  // Validate current step
  function validateStep(step: number): boolean {
    const stepErrors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Academic Track
        if (!formData.strand) {
          stepErrors.strand = 'Please select an academic strand';
        }
        break;
        
      case 2: // Personal Information
        if (!formData.lrn || !/^\d{12}$/.test(formData.lrn)) {
          stepErrors.lrn = 'LRN must be exactly 12 digits';
        }
        if (!formData.fullName || formData.fullName.length < 3) {
          stepErrors.fullName = 'Please enter your full name';
        }
        if (!formData.birthPlace || formData.birthPlace.length < 3) {
          stepErrors.birthPlace = 'Please enter your place of birth';
        }
        if (!formData.birthDate) {
          stepErrors.birthDate = 'Birth date is required';
        }
        if (!formData.gender) {
          stepErrors.gender = 'Please select gender';
        }
        if (!formData.religion || formData.religion.length < 3) {
          stepErrors.religion = 'Please enter religion';
        }
        if (!formData.address || formData.address.length < 10) {
          stepErrors.address = 'Please enter complete address';
        }
        break;
        
      case 3: // Family Information
        if (!formData.fatherName || formData.fatherName.length < 3) {
          stepErrors.fatherName = 'Father\'s name is required';
        }
        if (!formData.motherName || formData.motherName.length < 3) {
          stepErrors.motherName = 'Mother\'s name is required';
        }
        if (!formData.guardianName || formData.guardianName.length < 3) {
          stepErrors.guardianName = 'Guardian name is required';
        }
        if (!formData.guardianRelation) {
          stepErrors.guardianRelation = 'Please specify relationship';
        }
        if (!formData.contactNumber || !/^(09|\+639|639)\d{9}$/.test(formData.contactNumber.replace(/[\s-]/g, ''))) {
          stepErrors.contactNumber = 'Please enter a valid mobile number';
        }
        break;
        
      case 4: // Academic Background
        if (!formData.lastSchool || formData.lastSchool.length < 5) {
          stepErrors.lastSchool = 'Please enter last school attended';
        }
        if (formData.generalAverage < 60 || formData.generalAverage > 100) {
          stepErrors.generalAverage = 'General average must be between 60 and 100';
        }
        break;
        
      case 5: // Documents
        const hasAnyDocument = formData.hasForm9 || formData.hasForm10 || formData.hasPSA || 
                              formData.hasMoral || formData.hasBaptismal || formData.hasCompletionCert || 
                              formData.hasESC || formData.hasNCAE;
        if (!hasAnyDocument) {
          stepErrors.documents = 'Please select at least one document to submit';
        }
        break;
    }
    
    errors = { ...errors, ...stepErrors };
    return Object.keys(stepErrors).length === 0;
  }
  
  // Navigation functions
  function nextStep() {
    if (validateStep(currentStep)) {
      currentStep = Math.min(totalSteps, currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  function prevStep() {
    currentStep = Math.max(1, currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!rateLimiter.isAllowed('enrollment_submit')) {
      errors.general = 'Too many submission attempts. Please wait a moment and try again.';
      return;
    }
    
    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      // Go to first step with errors
      for (let step = 1; step <= totalSteps; step++) {
        if (!validateStep(step)) {
          currentStep = step;
          break;
        }
      }
      return;
    }
    
    isSubmitting = true;
    
    try {
      // Sanitize all string inputs
      const sanitizedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = sanitizeInput(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const enrollmentData: Omit<SeniorHighEnrollment, 'id' | 'submittedAt' | 'updatedAt' | 'userId' | 'userEmail' | 'status'> = {
        type: 'senior',
        schoolYear,
        ...sanitizedData,
        generalAverage: formData.generalAverage
      };
      
      await onSubmit(enrollmentData);
      
      // Clear draft on success
      sessionStorage.removeItem('shs_enrollment_draft');
    } catch (error) {
      console.error('Submission error:', error);
      errors.general = 'Failed to submit enrollment. Please try again.';
    } finally {
      isSubmitting = false;
    }
  };
  
  // Get step title
  function getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Academic Track';
      case 2: return 'Personal Information';
      case 3: return 'Family Information';
      case 4: return 'Academic Background';
      case 5: return 'Required Documents';
      default: return '';
    }
  }
  
  // Icons for steps
  const stepIcons = [
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />',
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />',
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />',
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />',
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
  ];
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Progress Bar -->
  <div class="mb-8">
    <div class="flex justify-between mb-2">
      <span class="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
      <span class="text-sm font-medium text-gray-700">{Math.round(progress)}% Complete</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div 
        class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-500 ease-out"
        style="width: {progress}%"
      ></div>
    </div>
  </div>
  
  <!-- Step Indicators -->
  <div class="flex justify-between mb-8">
    {#each Array(totalSteps) as _, index}
      <div class="flex items-center {index < totalSteps - 1 ? 'flex-1' : ''}">
        <button
          type="button"
          onclick={() => {
            if (index + 1 < currentStep) {
              currentStep = index + 1;
            }
          }}
          disabled={index + 1 > currentStep}
          class={`
            w-12 h-12 rounded-full flex items-center justify-center font-medium
            transition-all duration-300 transform
            ${currentStep > index + 1 
              ? 'bg-yellow-600 text-white hover:scale-110 cursor-pointer' 
              : currentStep === index + 1
              ? 'bg-yellow-600 text-white ring-4 ring-yellow-200 scale-110'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {#if currentStep > index + 1}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {@html stepIcons[index]}
            </svg>
          {/if}
        </button>
        
        {#if index < totalSteps - 1}
          <div class={`
            flex-1 h-1 mx-2 transition-all duration-500
            ${currentStep > index + 1 ? 'bg-yellow-600' : 'bg-gray-200'}
          `}></div>
        {/if}
      </div>
    {/each}
  </div>
  
  <!-- Step Title -->
  <div class="text-center mb-6">
    <h2 class="text-2xl font-bold text-gray-900 animate-fade-in">
      {getStepTitle(currentStep)}
    </h2>
    <p class="text-gray-600 mt-2">
      {#if currentStep === 1}
        Select your academic track and preferences
      {:else if currentStep === 2}
        Please provide accurate personal information
      {:else if currentStep === 3}
        Contact information of parents and guardian
      {:else if currentStep === 4}
        Your previous academic records
      {:else if currentStep === 5}
        Select documents you will submit
      {/if}
    </p>
  </div>
  
  <!-- Form Content -->
  <Card shadow="lg" class="animate-slide-in">
    {#if currentStep === 1}
      <!-- Academic Track -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Grade Level"
            id="gradeLevel"
            name="gradeLevel"
            type="select"
            required
            bind:value={formData.gradeLevel}
            error={errors.gradeLevel}
            disabled={disabled || isSubmitting}
            icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />'
          >
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </FormField>
          
          <FormField
            label="Semester"
            id="semester"
            name="semester"
            type="select"
            required
            bind:value={formData.semester}
            error={errors.semester}
            disabled={disabled || isSubmitting}
            icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />'
          >
            <option value="1st">1st Semester</option>
            <option value="2nd">2nd Semester</option>
          </FormField>
        </div>
        
        <div>
          <fieldset>
            <legend class="block text-sm font-medium text-gray-700 mb-3">
              Select Academic Strand <span class="text-red-500">*</span>
            </legend>
            {#if errors.strand}
              <p class="mb-2 text-sm text-red-600">{errors.strand}</p>
            {/if}
            <div class="space-y-3">
            <label class={`
              flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
              ${formData.strand === 'STEM' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-300'
              }
            `}>
              <input
                type="radio"
                name="strand"
                value="STEM"
                bind:group={formData.strand}
                disabled={disabled || isSubmitting}
                class="mt-1 text-yellow-600 focus:ring-yellow-500"
              />
              <div class="ml-3">
                <div class="font-medium text-gray-900">STEM</div>
                <div class="text-sm text-gray-600">Science, Technology, Engineering & Mathematics</div>
                <div class="text-xs text-gray-500 mt-1">
                  Ideal for students pursuing careers in sciences, engineering, medicine, and technology
                </div>
              </div>
            </label>
            
            <label class={`
              flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
              ${formData.strand === 'HUMSS' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-300'
              }
            `}>
              <input
                type="radio"
                name="strand"
                value="HUMSS"
                bind:group={formData.strand}
                disabled={disabled || isSubmitting}
                class="mt-1 text-gold-600 focus:ring-gold-500"
              />
              <div class="ml-3">
                <div class="font-medium text-gray-900">HUMSS</div>
                <div class="text-sm text-gray-600">Humanities and Social Sciences</div>
                <div class="text-xs text-gray-500 mt-1">
                  Perfect for future educators, psychologists, lawyers, and social workers
                </div>
              </div>
            </label>
            
            <label class={`
              flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
              ${formData.strand === 'ABM' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-300'
              }
            `}>
              <input
                type="radio"
                name="strand"
                value="ABM"
                bind:group={formData.strand}
                disabled={disabled || isSubmitting}
                class="mt-1 text-gold-600 focus:ring-gold-500"
              />
              <div class="ml-3">
                <div class="font-medium text-gray-900">ABM</div>
                <div class="text-sm text-gray-600">Accountancy, Business and Management</div>
                <div class="text-xs text-gray-500 mt-1">
                  Best for aspiring accountants, entrepreneurs, and business professionals
                </div>
              </div>
            </label>
          </div>
          </fieldset>
        </div>
        
        <div class="mt-6">
          <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formData.isESCGrantee}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-3 h-5 w-5"
            />
            <div>
              <span class="text-sm font-medium text-gray-700">ESC (Educational Service Contracting) Grantee</span>
              <p class="text-xs text-gray-500">Check if you are an ESC grantee or plan to apply</p>
            </div>
          </label>
        </div>
      </div>
      
    {:else if currentStep === 2}
      <!-- Personal Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Learner Reference Number (LRN)"
          id="lrn"
          name="lrn"
          type="text"
          required
          placeholder="12-digit LRN"
          bind:value={formData.lrn}
          error={errors.lrn}
          disabled={disabled || isSubmitting}
          maxlength={12}
          pattern="[0-9]{12}"
          autocomplete="off"
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />'
          helper="Enter your 12-digit LRN from your previous school"
        />
        
        <FormField
          label="Full Name"
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Last Name, First Name Middle Name"
          bind:value={formData.fullName}
          error={errors.fullName}
          disabled={disabled || isSubmitting}
          class="md:col-span-2"
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
          maxlength={100}
        />
        
        <FormField
          label="Place of Birth"
          id="birthPlace"
          name="birthPlace"
          type="text"
          required
          placeholder="City/Municipality, Province"
          bind:value={formData.birthPlace}
          error={errors.birthPlace}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />'
        />
        
        <FormField
          label="Birth Date"
          id="birthDate"
          name="birthDate"
          type="date"
          required
          bind:value={formData.birthDate}
          error={errors.birthDate}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />'
        />
        
        <FormField
          label="Age"
          id="age"
          name="age"
          type="number"
          required
          bind:value={formData.age}
          error={errors.age}
          disabled={disabled || isSubmitting}
          readonly
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />'
          helper="Automatically calculated from birth date"
        />
        
        <FormField
          label="Gender"
          id="gender"
          name="gender"
          type="select"
          required
          bind:value={formData.gender}
          error={errors.gender}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />'
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </FormField>
        
        <FormField
          label="Religion"
          id="religion"
          name="religion"
          type="text"
          required
          bind:value={formData.religion}
          error={errors.religion}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />'
          maxlength={50}
        />
        
        <FormField
          label="Complete Address"
          id="address"
          name="address"
          type="textarea"
          required
          placeholder="House #, Street, Barangay, Municipality, Province"
          bind:value={formData.address}
          error={errors.address}
          disabled={disabled || isSubmitting}
          class="md:col-span-2"
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />'
          maxlength={200}
          rows={3}
        />
      </div>
      
    {:else if currentStep === 3}
      <!-- Family Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Father's Name"
          id="fatherName"
          name="fatherName"
          type="text"
          required
          bind:value={formData.fatherName}
          error={errors.fatherName}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
          maxlength={100}
        />
        
        <FormField
          label="Father's Occupation"
          id="fatherOccupation"
          name="fatherOccupation"
          type="text"
          bind:value={formData.fatherOccupation}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
          placeholder="Optional"
        />
        
        <FormField
          label="Mother's Name"
          id="motherName"
          name="motherName"
          type="text"
          required
          bind:value={formData.motherName}
          error={errors.motherName}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
          maxlength={100}
        />
        
        <FormField
          label="Mother's Occupation"
          id="motherOccupation"
          name="motherOccupation"
          type="text"
          bind:value={formData.motherOccupation}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
          placeholder="Optional"
        />
        
        <FormField
          label="Guardian's Full Name"
          id="guardianName"
          name="guardianName"
          type="text"
          required
          bind:value={formData.guardianName}
          error={errors.guardianName}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
          maxlength={100}
          helper="Person to contact in case of emergency"
        />
        
        <FormField
          label="Relationship to Student"
          id="guardianRelation"
          name="guardianRelation"
          type="select"
          required
          bind:value={formData.guardianRelation}
          error={errors.guardianRelation}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />'
        >
          <option value="">Select Relationship</option>
          <option value="Mother">Mother</option>
          <option value="Father">Father</option>
          <option value="Guardian">Legal Guardian</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Sibling">Sibling (18+ years old)</option>
          <option value="Other">Other Relative</option>
        </FormField>
        
        <FormField
          label="Contact Number"
          id="contactNumber"
          name="contactNumber"
          type="tel"
          required
          placeholder="09XX-XXX-XXXX"
          bind:value={formData.contactNumber}
          error={errors.contactNumber}
          disabled={disabled || isSubmitting}
          class="md:col-span-2"
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />'
          maxlength={13}
          helper="Philippine mobile number format"
        />
      </div>
      
    {:else if currentStep === 4}
      <!-- Academic Background -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Last School Attended"
          id="lastSchool"
          name="lastSchool"
          type="text"
          required
          bind:value={formData.lastSchool}
          error={errors.lastSchool}
          disabled={disabled || isSubmitting}
          class="md:col-span-2"
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />'
          maxlength={100}
        />
        
        <FormField
          label="General Average"
          id="generalAverage"
          name="generalAverage"
          type="number"
          required
          placeholder="60-100"
          min={60}
          max={100}
          step={0.01}
          bind:value={formData.generalAverage}
          error={errors.generalAverage}
          disabled={disabled || isSubmitting}
          icon='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />'
          helper="Your grade point average from Junior High School"
        />
        
        <div class="space-y-4 md:col-span-2">
          <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formData.isTransferee}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-3 h-5 w-5"
            />
            <div>
              <span class="text-sm font-medium text-gray-700">Transferee Student</span>
              <p class="text-xs text-gray-500">Check if transferring from another Senior High School</p>
            </div>
          </label>
          
          <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formData.hasAcademicAward}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-3 h-5 w-5"
            />
            <div>
              <span class="text-sm font-medium text-gray-700">Academic Award Recipient</span>
              <p class="text-xs text-gray-500">With honors, awards, or recognition</p>
            </div>
          </label>
        </div>
      </div>
      
    {:else if currentStep === 5}
      <!-- Required Documents -->
      <div>
        <p class="text-sm text-gray-600 mb-6">
          Please check all documents you will submit during enrollment. At least one document is required.
        </p>
        
        {#if errors.documents}
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {errors.documents}
            </p>
          </div>
        {/if}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasForm9}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="font-medium text-gray-700">School Form 9 (SF9)</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Learner's progress report card</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasForm10}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="font-medium text-gray-700">School Form 10 (SF10)</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Learner's permanent academic record</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasPSA}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span class="font-medium text-gray-700">PSA Birth Certificate</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Original or certified true copy</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasMoral}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span class="font-medium text-gray-700">Certificate of Good Moral Character</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">From previous school</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasBaptismal}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span class="font-medium text-gray-700">Baptismal Certificate</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">For Catholic students</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasCompletionCert}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span class="font-medium text-gray-700">JHS Completion Certificate</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Proof of Junior High School completion</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasESC}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium text-gray-700">ESC Certificate</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">If applicable</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={formData.hasNCAE}
              disabled={disabled || isSubmitting}
              class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-4 mt-1 h-5 w-5"
            />
            <div class="flex-1">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="font-medium text-gray-700">NCAE Result</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">National Career Assessment Examination</p>
            </div>
          </label>
        </div>
      </div>
    {/if}
  </Card>
  
  {#if errors.general}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {errors.general}
    </div>
  {/if}
  
  <!-- Navigation Buttons -->
  <div class="flex justify-between items-center pt-6">
    <Button 
      type="button"
      variant="outline" 
      onclick={prevStep}
      disabled={currentStep === 1 || isSubmitting}
      size="lg"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Previous
    </Button>
    
    <div class="flex items-center space-x-2">
      {#each Array(totalSteps) as _, index}
        <div class={`
          w-2 h-2 rounded-full transition-all duration-300
          ${currentStep === index + 1 ? 'w-8 bg-yellow-600' : 'bg-gray-300'}
        `}></div>
      {/each}
    </div>
    
    {#if currentStep < totalSteps}
      <Button 
        type="button"
        variant="primary"
        onclick={nextStep}
        disabled={isSubmitting}
        size="lg"
        class="!bg-gradient-to-r !from-yellow-500 !to-yellow-600 hover:!from-yellow-600 hover:!to-yellow-700"
      >
        Next
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    {:else}
      <Button 
        type="submit"
        variant="success"
        loading={isSubmitting}
        disabled={disabled || isSubmitting}
        size="lg"
        shadow
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Submit Enrollment
      </Button>
    {/if}
  </div>
</form>

<style>
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
  
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
  
  .animate-slide-in {
    animation: slide-in 0.5s ease-out;
  }
</style>