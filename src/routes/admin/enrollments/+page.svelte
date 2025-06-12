<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import EnrollmentTable from '$lib/components/admin/EnrollmentTable.svelte';
  import { enrollmentOps } from '$lib/firebase/firestore';
  import { exportToPDF } from '$lib/utils/exporters';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  
  let enrollments = $state<Enrollment[]>([]);
  let loading = $state(true);
  let selectedEnrollment = $state<Enrollment | null>(null);
  let statusFilter = $state<EnrollmentStatus | 'all'>('all');
  let typeFilter = $state<'all' | 'junior' | 'senior'>('all');
  
  // Get status from URL params
  $effect(() => {
    const status = $page.url.searchParams.get('status');
    if (status && ['submitted', 'verified', 'printed', 'archived'].includes(status)) {
      statusFilter = status as EnrollmentStatus;
    }
  });
  
  const filteredEnrollments = $derived(() => {
    return enrollments.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      return true;
    });
  });
  
  async function loadEnrollments() {
    try {
      loading = true;
      // In a real app, we'd have better Firestore queries
      const allEnrollments = await enrollmentOps.getByStatus('submitted', 100);
      const verified = await enrollmentOps.getByStatus('verified', 100);
      const printed = await enrollmentOps.getByStatus('printed', 100);
      
      enrollments = [...allEnrollments, ...verified, ...printed];
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      loading = false;
    }
  }
  
  async function updateStatus(id: string, status: EnrollmentStatus) {
    try {
      await enrollmentOps.updateStatus(id, status);
      // Update local state
      enrollments = enrollments.map(e => 
        e.id === id ? { ...e, status } : e
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }
  
  function viewEnrollment(enrollment: Enrollment) {
    selectedEnrollment = enrollment;
  }
  
  onMount(() => {
    loadEnrollments();
  });
</script>

<svelte:head>
  <title>Manage Enrollments - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Enrollments</h1>
      <p class="text-gray-600">Manage student enrollment applications</p>
    </div>
    <Button variant="primary" onclick={loadEnrollments}>
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </Button>
  </div>
  
  <!-- Filters -->
  <Card>
    <div class="flex flex-wrap gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select 
          bind:value={statusFilter}
          class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="printed">Printed</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select 
          bind:value={typeFilter}
          class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Types</option>
          <option value="junior">Junior High</option>
          <option value="senior">Senior High</option>
        </select>
      </div>
      
      <div class="flex items-end">
        <span class="text-sm text-gray-600">
          Showing {filteredEnrollments().length} of {enrollments.length} enrollments
        </span>
      </div>
    </div>
  </Card>
  
  <!-- Enrollments Table -->
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else}
    <EnrollmentTable 
      enrollments={filteredEnrollments()}
      onStatusChange={updateStatus}
      onView={viewEnrollment}
    />
  {/if}
  
  <!-- Enrollment Detail Modal -->
  {#if selectedEnrollment}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onclick={() => selectedEnrollment = null}
        ></div>
        
        <div class="inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Enrollment Details
            </h3>
            <button
              onclick={() => selectedEnrollment = null}
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- Student Info -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Student Information</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt class="text-gray-500">Full Name</dt>
                  <dd class="font-medium">{selectedEnrollment.fullName}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">LRN</dt>
                  <dd class="font-medium">{selectedEnrollment.lrn}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Grade Level</dt>
                  <dd class="font-medium">
                    {selectedEnrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {selectedEnrollment.gradeLevel}
                  </dd>
                </div>
                <div>
                  <dt class="text-gray-500">Birth Date</dt>
                  <dd class="font-medium">{selectedEnrollment.birthDate} (Age: {selectedEnrollment.age})</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Gender</dt>
                  <dd class="font-medium">{selectedEnrollment.gender}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Religion</dt>
                  <dd class="font-medium">{selectedEnrollment.religion}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-gray-500">Address</dt>
                  <dd class="font-medium">{selectedEnrollment.address}</dd>
                </div>
              </dl>
            </div>
            
            <!-- Guardian Info -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Guardian Information</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt class="text-gray-500">Guardian Name</dt>
                  <dd class="font-medium">{selectedEnrollment.guardianName}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Relationship</dt>
                  <dd class="font-medium">{selectedEnrollment.guardianRelation}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Contact Number</dt>
                  <dd class="font-medium">{selectedEnrollment.contactNumber}</dd>
                </div>
              </dl>
            </div>
            
            <!-- Academic Info -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Academic Information</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt class="text-gray-500">Last School</dt>
                  <dd class="font-medium">{selectedEnrollment.lastSchool}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">General Average</dt>
                  <dd class="font-medium">{selectedEnrollment.generalAverage}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Transferee</dt>
                  <dd class="font-medium">{selectedEnrollment.isTransferee ? 'Yes' : 'No'}</dd>
                </div>
                {#if selectedEnrollment.type === 'senior'}
                  <div>
                    <dt class="text-gray-500">Strand</dt>
                    <dd class="font-medium">{selectedEnrollment.strand}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Semester</dt>
                    <dd class="font-medium">{selectedEnrollment.semester}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">ESC Grantee</dt>
                    <dd class="font-medium">{selectedEnrollment.isESCGrantee ? 'Yes' : 'No'}</dd>
                  </div>
                {/if}
              </dl>
            </div>
            
            <!-- Status & Actions -->
            <div class="pt-4 border-t">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm text-gray-500">Current Status:</span>
                  <span class={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedEnrollment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    selectedEnrollment.status === 'verified' ? 'bg-green-100 text-green-800' :
                    selectedEnrollment.status === 'printed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                  </span>
                </div>
                
                <div class="flex space-x-3">
                  {#if selectedEnrollment.status === 'submitted'}
                    <Button 
                      variant="primary" 
                      size="sm"
                      onclick={() => {
                        updateStatus(selectedEnrollment!.id!, 'verified');
                        selectedEnrollment = null;
                      }}
                    >
                      Mark as Verified
                    </Button>
                  {/if}
                  
                  {#if selectedEnrollment.status === 'verified'}
                    <Button 
                      variant="primary" 
                      size="sm"
                      onclick={() => {
                        updateStatus(selectedEnrollment!.id!, 'printed');
                        selectedEnrollment = null;
                      }}
                    >
                      Mark as Printed
                    </Button>
                  {/if}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onclick={() => {
                      exportToPDF(selectedEnrollment!);
                      selectedEnrollment = null;
                    }}
                  >
                    Print Form
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>