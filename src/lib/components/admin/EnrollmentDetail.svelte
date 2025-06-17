<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  
  interface Props {
    enrollment: Enrollment;
    onClose: () => void;
    onStatusChange: (id: string, status: EnrollmentStatus) => void;
    onReject: (id: string) => void;
    isUpdating?: boolean;
  }
  
  let { enrollment, onClose, onStatusChange, onReject, isUpdating = false }: Props = $props();
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatBirthDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function getStatusActions() {
    const actions: Array<{
      label: string;
      status: EnrollmentStatus;
      variant: 'primary' | 'outline' | 'danger';
    }> = [];
    
    switch (enrollment.status) {
      case 'submitted':
        actions.push({ label: 'Verify', status: 'verified', variant: 'primary' });
        actions.push({ label: 'Reject', status: 'rejected', variant: 'danger' });
        break;
      case 'verified':
        actions.push({ label: 'Mark as Printed', status: 'printed', variant: 'primary' });
        actions.push({ label: 'Revert to Submitted', status: 'submitted', variant: 'outline' });
        break;
      case 'printed':
        actions.push({ label: 'Archive', status: 'archived', variant: 'outline' });
        break;
      case 'rejected':
        actions.push({ label: 'Revert to Submitted', status: 'submitted', variant: 'primary' });
        break;
    }
    
    return actions;
  }
  
  function handlePrint() {
    window.print();
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
    <!-- Background overlay -->
    <button
      type="button"
      class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
      onclick={onClose}
      aria-label="Close modal"
    ></button>

    <!-- Modal panel -->
    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-white">
            Enrollment Details
          </h3>
          <button
            onclick={onClose}
            class="text-green-200 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto print-content">
        <!-- Status Badge -->
        <div class="mb-6">
          <span class={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${
            enrollment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            enrollment.status === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
            enrollment.status === 'printed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            enrollment.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
          </span>
          <span class="ml-2 text-sm text-gray-500">
            Submitted on {formatDate(enrollment.submittedAt)}
          </span>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                <dd class="text-sm text-gray-900">{enrollment.fullName || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">LRN</dt>
                <dd class="text-sm text-gray-900 font-mono">{enrollment.lrn || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Birth Date</dt>
                <dd class="text-sm text-gray-900">
                  {enrollment.birthDate ? formatBirthDate(enrollment.birthDate) : 'Not provided'}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Age</dt>
                <dd class="text-sm text-gray-900">{enrollment.age || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Gender</dt>
                <dd class="text-sm text-gray-900">{enrollment.gender || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Religion</dt>
                <dd class="text-sm text-gray-900">{enrollment.religion || 'Not provided'}</dd>
              </div>
              {#if enrollment.type === 'senior'}
                <div>
                  <dt class="text-sm font-medium text-gray-500">Birth Place</dt>
                  <dd class="text-sm text-gray-900">{enrollment.birthPlace || 'Not provided'}</dd>
                </div>
              {/if}
            </dl>
          </div>

          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Academic Information</h4>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">School Year</dt>
                <dd class="text-sm text-gray-900">{enrollment.schoolYear}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Type</dt>
                <dd class="text-sm text-gray-900">
                  {enrollment.type === 'junior' ? 'Junior High School' : 'Senior High School'}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Grade Level</dt>
                <dd class="text-sm text-gray-900">Grade {enrollment.gradeLevel}</dd>
              </div>
              {#if enrollment.type === 'senior'}
                <div>
                  <dt class="text-sm font-medium text-gray-500">Strand</dt>
                  <dd class="text-sm text-gray-900">{enrollment.strand || 'Not specified'}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Semester</dt>
                  <dd class="text-sm text-gray-900">{enrollment.semester || 'Not specified'}</dd>
                </div>
              {/if}
              <div>
                <dt class="text-sm font-medium text-gray-500">Previous School</dt>
                <dd class="text-sm text-gray-900">{enrollment.lastSchool || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">General Average</dt>
                <dd class="text-sm text-gray-900">{enrollment.generalAverage || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Transferee</dt>
                <dd class="text-sm text-gray-900">{enrollment.isTransferee ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="mt-6 pt-6 border-t">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Address</dt>
              <dd class="text-sm text-gray-900">{enrollment.address || 'Not provided'}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Contact Number</dt>
              <dd class="text-sm text-gray-900">{enrollment.contactNumber || 'Not provided'}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="text-sm text-gray-900">{enrollment.userEmail}</dd>
            </div>
          </dl>
        </div>

        <!-- Guardian Information -->
        <div class="mt-6 pt-6 border-t">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h4>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Guardian Name</dt>
              <dd class="text-sm text-gray-900">{enrollment.guardianName || 'Not provided'}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Relationship</dt>
              <dd class="text-sm text-gray-900">{enrollment.guardianRelation || 'Not provided'}</dd>
            </div>
            {#if enrollment.type === 'senior'}
              <div>
                <dt class="text-sm font-medium text-gray-500">Father's Name</dt>
                <dd class="text-sm text-gray-900">{enrollment.fatherName || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Father's Occupation</dt>
                <dd class="text-sm text-gray-900">{enrollment.fatherOccupation || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Mother's Name</dt>
                <dd class="text-sm text-gray-900">{enrollment.motherName || 'Not provided'}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Mother's Occupation</dt>
                <dd class="text-sm text-gray-900">{enrollment.motherOccupation || 'Not provided'}</dd>
              </div>
            {/if}
          </dl>
        </div>

        <!-- Document Requirements -->
        <div class="mt-6 pt-6 border-t">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Document Requirements</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#if enrollment.type === 'junior'}
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm9 ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Form 9</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm10 ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Form 10</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasPSA ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">PSA Birth Certificate</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasGoodMoral ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Good Moral Certificate</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasBaptismal ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Baptismal Certificate</span>
              </div>
            {:else}
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm9 ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Form 9</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm10 ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Form 10</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasPSA ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">PSA Birth Certificate</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasGoodMoral ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">Good Moral Certificate</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasCompletionCert ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">JHS Completion Certificate</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasESC ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">ESC Certificate</span>
              </div>
              <div class="flex items-center">
                <svg class={`w-5 h-5 mr-2 ${enrollment.hasNCAE ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">NCAE Results</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Additional Information -->
        {#if enrollment.hasAcademicExcellence || enrollment.hasAcademicAward}
          <div class="mt-6 pt-6 border-t">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Achievements</h4>
            <div class="space-y-2">
              {#if enrollment.hasAcademicExcellence}
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-sm">Academic Excellence</span>
                </div>
              {/if}
              {#if enrollment.hasAcademicAward}
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-sm">Academic Award</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Rejection Reason (if rejected) -->
        {#if enrollment.status === 'rejected' && enrollment.rejectionReason}
          <div class="mt-6 pt-6 border-t">
            <h4 class="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h4>
            <p class="text-sm text-red-700 bg-red-50 p-3 rounded-md">
              {enrollment.rejectionReason}
            </p>
          </div>
        {/if}

        <!-- System Information -->
        <div class="mt-6 pt-6 border-t">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">System Information</h4>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Application ID</dt>
              <dd class="text-sm text-gray-900 font-mono">{enrollment.id}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Submitted By</dt>
              <dd class="text-sm text-gray-900">{enrollment.userEmail}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Submitted At</dt>
              <dd class="text-sm text-gray-900">{formatDate(enrollment.submittedAt)}</dd>
            </div>
            {#if enrollment.updatedAt}
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="text-sm text-gray-900">{formatDate(enrollment.updatedAt)}</dd>
              </div>
            {/if}
          </dl>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse print:hidden">
        <div class="flex gap-3">
          {#each getStatusActions() as action}
            <Button
              variant={action.variant}
              onclick={() => {
                if (action.status === 'rejected') {
                  onReject(enrollment.id!);
                } else {
                  onStatusChange(enrollment.id!, action.status);
                }
              }}
              loading={isUpdating}
            >
              {action.label}
            </Button>
          {/each}
          <Button variant="outline" onclick={handlePrint}>
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </Button>
        </div>
        <Button variant="outline" onclick={onClose} class="mr-auto">
          Close
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  @media print {
    .print-content {
      max-height: none !important;
      overflow: visible !important;
    }
    
    .print:hidden {
      display: none !important;
    }
  }
</style>