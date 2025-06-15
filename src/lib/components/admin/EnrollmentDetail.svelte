<script lang="ts">
  import Button from '../ui/Button.svelte';
  import LoadingSpinner from '../ui/LoadingSpinner.svelte';
  import type { Enrollment, EnrollmentStatus, SeniorHighEnrollment, JuniorHighEnrollment } from '$lib/types';
  import { exportToPDF } from '$lib/utils/exporters';
  
  interface Props {
    enrollment: Enrollment;
    onClose: () => void;
    onStatusChange: (id: string, status: EnrollmentStatus, reason?: string) => Promise<void>;
    onReject: (id: string) => void;
    isUpdating?: boolean;
  }
  
  let { enrollment, onClose, onStatusChange, onReject, isUpdating = false }: Props = $props();
  
  // Helpers
  function getStatusColor(status: EnrollmentStatus) {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'printed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen px-4 sm:px-0">
    <button
      type="button"
      class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 cursor-default"
      onclick={onClose}
      onkeydown={(e) => e.key === 'Enter' && onClose()}
      aria-label="Close modal backdrop"
    ></button>
    
    <div class="relative bg-white w-full max-w-6xl mx-auto rounded-lg shadow-xl transform transition-all max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
        <div class="flex-1 pr-3">
          <h3 class="text-lg font-medium text-gray-900">
            Enrollment Details
          </h3>
          <p class="text-sm text-gray-500 mt-0.5">
            ID: {enrollment.id} • Submitted: {formatDate(enrollment.submittedAt)}
          </p>
        </div>
        <button
          onclick={onClose}
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Column 1: Personal & Guardian Info -->
          <div class="space-y-6">
            <!-- Status Badge -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Status:</span>
              <span class={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(enrollment.status)}`}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </span>
            </div>
            
            <!-- Personal Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h4>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-gray-500">Full Name</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.fullName}</dd>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-gray-500">LRN</dt>
                    <dd class="font-medium text-gray-900 mt-1">{enrollment.lrn}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Type</dt>
                    <dd class="font-medium text-gray-900 mt-1">
                      {enrollment.type === 'junior' ? 'Junior High' : 'Senior High'}
                    </dd>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-gray-500">Grade Level</dt>
                    <dd class="font-medium text-gray-900 mt-1">Grade {enrollment.gradeLevel}</dd>
                  </div>
                  {#if enrollment.type === 'senior'}
                    <div>
                      <dt class="text-gray-500">Strand</dt>
                      <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).strand}</dd>
                    </div>
                  {/if}
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-gray-500">Birth Date</dt>
                    <dd class="font-medium text-gray-900 mt-1">{enrollment.birthDate}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Age</dt>
                    <dd class="font-medium text-gray-900 mt-1">{enrollment.age} years</dd>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-gray-500">Gender</dt>
                    <dd class="font-medium text-gray-900 mt-1">{enrollment.gender}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Religion</dt>
                    <dd class="font-medium text-gray-900 mt-1">{enrollment.religion}</dd>
                  </div>
                </div>
                {#if enrollment.type === 'senior'}
                  <div>
                    <dt class="text-gray-500">Birth Place</dt>
                    <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).birthPlace}</dd>
                  </div>
                {/if}
                <div>
                  <dt class="text-gray-500">Address</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.address}</dd>
                </div>
              </dl>
            </div>
            
            <!-- Guardian Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Guardian Information
              </h4>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-gray-500">Guardian Name</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.guardianName}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Relationship</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.guardianRelation}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Contact Number</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.contactNumber}</dd>
                </div>
              </dl>
            </div>
            
            {#if enrollment.type === 'senior'}
              <!-- Parents Information -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-900 mb-4">Parents Information</h4>
                <dl class="space-y-3 text-sm">
                  <div>
                    <dt class="text-gray-500">Father's Name</dt>
                    <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).fatherName}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Father's Occupation</dt>
                    <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).fatherOccupation}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Mother's Name</dt>
                    <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).motherName}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Mother's Occupation</dt>
                    <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).motherOccupation}</dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>
          
          <!-- Column 2: Academic & Documents -->
          <div class="space-y-6">
            <!-- Academic Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Academic Information
              </h4>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-gray-500">School Year</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.schoolYear}</dd>
                </div>
                {#if enrollment.type === 'senior'}
                  <div>
                    <dt class="text-gray-500">Semester</dt>
                    <dd class="font-medium text-gray-900 mt-1">{(enrollment as SeniorHighEnrollment).semester} Semester</dd>
                  </div>
                {/if}
                <div>
                  <dt class="text-gray-500">Last School Attended</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.lastSchool}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">General Average</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.generalAverage}%</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Student Type</dt>
                  <dd class="font-medium text-gray-900 mt-1">
                    {enrollment.isTransferee ? 'Transferee' : 'Regular Student'}
                  </dd>
                </div>
                {#if enrollment.type === 'junior'}
                  <div>
                    <dt class="text-gray-500">Academic Excellence</dt>
                    <dd class="font-medium text-gray-900 mt-1">
                      {(enrollment as JuniorHighEnrollment).hasAcademicExcellence ? 'Yes' : 'No'}
                    </dd>
                  </div>
                {:else}
                  <div>
                    <dt class="text-gray-500">ESC Grantee</dt>
                    <dd class="font-medium text-gray-900 mt-1">
                      {(enrollment as SeniorHighEnrollment).isESCGrantee ? 'Yes' : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Academic Award</dt>
                    <dd class="font-medium text-gray-900 mt-1">
                      {(enrollment as SeniorHighEnrollment).hasAcademicAward ? 'Yes' : 'No'}
                    </dd>
                  </div>
                {/if}
              </dl>
            </div>
            
            <!-- Documents Checklist -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents Submitted
              </h4>
              <div class="space-y-2">
                {#if enrollment.type === 'junior'}
                  {@const junior = enrollment as JuniorHighEnrollment}
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={junior.hasForm10} disabled class="mr-2 text-green-600" />
                    <span class={junior.hasForm10 ? 'text-green-700' : 'text-gray-500'}>
                      SF10 (Form 137)
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={junior.hasPSA} disabled class="mr-2 text-green-600" />
                    <span class={junior.hasPSA ? 'text-green-700' : 'text-gray-500'}>
                      PSA Birth Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={junior.hasBaptismal} disabled class="mr-2 text-green-600" />
                    <span class={junior.hasBaptismal ? 'text-green-700' : 'text-gray-500'}>
                      Baptismal Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={junior.hasGoodMoral} disabled class="mr-2 text-green-600" />
                    <span class={junior.hasGoodMoral ? 'text-green-700' : 'text-gray-500'}>
                      Good Moral Certificate
                    </span>
                  </label>
                {:else}
                  {@const senior = enrollment as SeniorHighEnrollment}
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasForm9} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasForm9 ? 'text-green-700' : 'text-gray-500'}>
                      SF9 (Report Card)
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasForm10} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasForm10 ? 'text-green-700' : 'text-gray-500'}>
                      SF10 (Form 137)
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasPSA} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasPSA ? 'text-green-700' : 'text-gray-500'}>
                      PSA Birth Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasMoral} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasMoral ? 'text-green-700' : 'text-gray-500'}>
                      Good Moral Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasBaptismal} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasBaptismal ? 'text-green-700' : 'text-gray-500'}>
                      Baptismal Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasCompletionCert} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasCompletionCert ? 'text-green-700' : 'text-gray-500'}>
                      JHS Completion Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasESC} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasESC ? 'text-green-700' : 'text-gray-500'}>
                      ESC Certificate
                    </span>
                  </label>
                  <label class="flex items-center text-sm">
                    <input type="checkbox" checked={senior.hasNCAE} disabled class="mr-2 text-green-600" />
                    <span class={senior.hasNCAE ? 'text-green-700' : 'text-gray-500'}>
                      NCAE Result
                    </span>
                  </label>
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Column 3: Application Info & Actions -->
          <div class="space-y-6">
            <!-- Application Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Application Information
              </h4>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-gray-500">Application ID</dt>
                  <dd class="font-medium text-gray-900 mt-1 font-mono text-xs">{enrollment.id}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Submitted By</dt>
                  <dd class="font-medium text-gray-900 mt-1">{enrollment.userEmail}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Submitted On</dt>
                  <dd class="font-medium text-gray-900 mt-1">{formatDate(enrollment.submittedAt)}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Last Updated</dt>
                  <dd class="font-medium text-gray-900 mt-1">{formatDate(enrollment.updatedAt)}</dd>
                </div>
              </dl>
            </div>
            
            {#if enrollment.rejectionReason}
              <!-- Rejection Reason -->
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-red-900 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rejection Reason
                </h4>
                <p class="text-sm text-red-700">{enrollment.rejectionReason}</p>
              </div>
            {/if}
            
            <!-- Quick Actions -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
              <div class="space-y-2">
                {#if enrollment.status === 'submitted'}
                  <Button 
                    variant="success" 
                    onclick={() => onStatusChange(enrollment.id!, 'verified')}
                    loading={isUpdating}
                    fullWidth
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify Application
                  </Button>
                  
                  <Button 
                    variant="danger" 
                    onclick={() => onReject(enrollment.id!)}
                    fullWidth
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reject Application
                  </Button>
                {/if}
                
                {#if enrollment.status === 'verified'}
                  <Button 
                    variant="primary" 
                    onclick={() => onStatusChange(enrollment.id!, 'printed')}
                    loading={isUpdating}
                    fullWidth
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Mark as Printed
                  </Button>
                {/if}
                
                {#if enrollment.status === 'printed'}
                  <Button 
                    variant="outline" 
                    onclick={() => onStatusChange(enrollment.id!, 'archived')}
                    loading={isUpdating}
                    fullWidth
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archive
                  </Button>
                {/if}
                
                <Button 
                  variant="outline" 
                  onclick={() => exportToPDF(enrollment)}
                  fullWidth
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer Actions -->
      <div class="sticky bottom-0 bg-white border-t px-6 py-4">
        <div class="flex justify-end">
          <Button variant="ghost" onclick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>