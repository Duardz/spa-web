<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import EnrollmentTable from '$lib/components/admin/EnrollmentTable.svelte';
  import { enrollmentOps } from '$lib/firebase/firestore';
  import { exportToPDF } from '$lib/utils/exporters';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  
  let enrollments = $state<Enrollment[]>([]);
  let loading = $state(true);
  let selectedEnrollment = $state<Enrollment | null>(null);
  let statusFilter = $state<EnrollmentStatus | 'all'>('all');
  let typeFilter = $state<'all' | 'junior' | 'senior'>('all');
  let searchTerm = $state('');
  
  // Get status from URL params
  $effect(() => {
    const status = $page.url.searchParams.get('status');
    if (status && ['submitted', 'verified', 'printed', 'rejected', 'archived'].includes(status)) {
      statusFilter = status as EnrollmentStatus;
    }
  });
  
  const filteredEnrollments = $derived(() => {
    return enrollments.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return e.fullName.toLowerCase().includes(search) ||
               e.lrn.includes(search) ||
               e.userEmail.toLowerCase().includes(search);
      }
      return true;
    });
  });
  
  async function loadEnrollments() {
    try {
      loading = true;
      enrollments = await enrollmentOps.getAll({ 
        schoolYear: $enrollmentSettings.schoolYear 
      });
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      loading = false;
    }
  }
  
  async function updateStatus(id: string, status: EnrollmentStatus, reason?: string) {
    try {
      await enrollmentOps.updateStatus(id, status);
      
      // If rejecting, update with reason
      if (status === 'rejected' && reason) {
        const enrollment = enrollments.find(e => e.id === id);
        if (enrollment) {
          await enrollmentOps.update(id, { rejectionReason: reason });
        }
      }
      
      // Update local state
      enrollments = enrollments.map(e => 
        e.id === id ? { ...e, status, rejectionReason: reason } : e
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }
  
  async function deleteEnrollment(id: string) {
    try {
      await enrollmentOps.delete(id);
      enrollments = enrollments.filter(e => e.id !== id);
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Failed to delete enrollment');
    }
  }
  
  function viewEnrollment(enrollment: Enrollment) {
    selectedEnrollment = enrollment;
  }
  
  // Statistics
  const stats = $derived(() => {
    const total = filteredEnrollments().length;
    const byStatus = filteredEnrollments().reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      submitted: byStatus.submitted || 0,
      verified: byStatus.verified || 0,
      printed: byStatus.printed || 0,
      rejected: byStatus.rejected || 0,
      archived: byStatus.archived || 0
    };
  });
  
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
      <p class="text-gray-600">Manage student enrollment applications for {$enrollmentSettings.schoolYear}</p>
    </div>
    <Button variant="primary" onclick={loadEnrollments}>
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </Button>
  </div>
  
  <!-- Statistics Cards -->
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    <Card class="text-center p-4">
      <p class="text-3xl font-bold text-gray-900">{stats().total}</p>
      <p class="text-sm text-gray-600">Total</p>
    </Card>
    <Card class="text-center p-4 border-l-4 border-yellow-400">
      <p class="text-3xl font-bold text-yellow-600">{stats().submitted}</p>
      <p class="text-sm text-gray-600">Submitted</p>
    </Card>
    <Card class="text-center p-4 border-l-4 border-green-400">
      <p class="text-3xl font-bold text-green-600">{stats().verified}</p>
      <p class="text-sm text-gray-600">Verified</p>
    </Card>
    <Card class="text-center p-4 border-l-4 border-blue-400">
      <p class="text-3xl font-bold text-blue-600">{stats().printed}</p>
      <p class="text-sm text-gray-600">Printed</p>
    </Card>
    <Card class="text-center p-4 border-l-4 border-red-400">
      <p class="text-3xl font-bold text-red-600">{stats().rejected}</p>
      <p class="text-sm text-gray-600">Rejected</p>
    </Card>
    <Card class="text-center p-4 border-l-4 border-gray-400">
      <p class="text-3xl font-bold text-gray-600">{stats().archived}</p>
      <p class="text-sm text-gray-600">Archived</p>
    </Card>
  </div>
  
  <!-- Filters -->
  <Card>
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          bind:value={searchTerm}
          placeholder="Search by name, LRN, or email..."
          class="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>
      
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
          <option value="rejected">Rejected</option>
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
      
      <Button variant="outline" onclick={() => {
        searchTerm = '';
        statusFilter = 'all';
        typeFilter = 'all';
      }}>
        Clear Filters
      </Button>
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
      onDelete={deleteEnrollment}
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
        
        <div class="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                Enrollment Details
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                Application ID: {selectedEnrollment.id}
              </p>
            </div>
            <button
              onclick={() => selectedEnrollment = null}
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Student Info -->
            <div class="space-y-4">
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Student Information
                </h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 text-sm">
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Full Name</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.fullName}</dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">LRN</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.lrn}</dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Grade Level</dt>
                    <dd class="font-medium text-gray-900">
                      {selectedEnrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {selectedEnrollment.gradeLevel}
                      {selectedEnrollment.type === 'senior' && ` - ${selectedEnrollment.strand}`}
                    </dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Birth Date / Age</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.birthDate} ({selectedEnrollment.age} years old)</dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Gender</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.gender}</dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Religion</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.religion}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Address</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.address}</dd>
                  </div>
                </dl>
              </div>
              
              <!-- Guardian Info -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Guardian Information
                </h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 text-sm">
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Guardian Name</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.guardianName}</dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Relationship</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.guardianRelation}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Contact Number</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.contactNumber}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <!-- Academic Info & Status -->
            <div class="space-y-4">
              <!-- Academic Info -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Academic Information
                </h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 text-sm">
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">Last School Attended</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.lastSchool}</dd>
                  </div>
                  <div class="border-b pb-2">
                    <dt class="text-gray-500">General Average</dt>
                    <dd class="font-medium text-gray-900">{selectedEnrollment.generalAverage}%</dd>
                  </div>
                  <div>
                    <dt class="text-gray-500">Student Type</dt>
                    <dd class="font-medium text-gray-900">
                      {selectedEnrollment.isTransferee ? 'Transferee' : 'Regular'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <!-- Application Status -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Application Status
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-500">Current Status:</span>
                    <span class={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedEnrollment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      selectedEnrollment.status === 'verified' ? 'bg-green-100 text-green-800' :
                      selectedEnrollment.status === 'printed' ? 'bg-blue-100 text-blue-800' :
                      selectedEnrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Submitted:</span>
                      <span class="text-gray-900">{new Date(selectedEnrollment.submittedAt).toLocaleString('en-PH')}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Last Updated:</span>
                      <span class="text-gray-900">{new Date(selectedEnrollment.updatedAt).toLocaleString('en-PH')}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Submitted By:</span>
                      <span class="text-gray-900">{selectedEnrollment.userEmail}</span>
                    </div>
                  </div>
                  
                  {#if selectedEnrollment.rejectionReason}
                    <div class="mt-3 p-3 bg-red-50 rounded">
                      <p class="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {selectedEnrollment.rejectionReason}
                      </p>
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- Documents Checklist -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documents to Submit
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  {#if selectedEnrollment.type === 'junior'}
                    <div class="space-y-2">
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasForm10} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasForm10 ? 'text-green-700' : 'text-gray-500'}>
                          School Form 10 (SF10)
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasPSA} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasPSA ? 'text-green-700' : 'text-gray-500'}>
                          PSA Birth Certificate
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasBaptismal} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasBaptismal ? 'text-green-700' : 'text-gray-500'}>
                          Baptismal Certificate
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasGoodMoral} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasGoodMoral ? 'text-green-700' : 'text-gray-500'}>
                          Certificate of Good Moral Character
                        </span>
                      </label>
                    </div>
                  {:else}
                    <div class="space-y-2">
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasForm9} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasForm9 ? 'text-green-700' : 'text-gray-500'}>
                          School Form 9 (SF9)
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasForm10} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasForm10 ? 'text-green-700' : 'text-gray-500'}>
                          School Form 10 (SF10)
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasPSA} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasPSA ? 'text-green-700' : 'text-gray-500'}>
                          PSA Birth Certificate
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasMoral} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasMoral ? 'text-green-700' : 'text-gray-500'}>
                          Certificate of Good Moral Character
                        </span>
                      </label>
                      <label class="flex items-center text-sm">
                        <input type="checkbox" checked={selectedEnrollment.hasCompletionCert} disabled class="mr-2" />
                        <span class={selectedEnrollment.hasCompletionCert ? 'text-green-700' : 'text-gray-500'}>
                          JHS Completion Certificate
                        </span>
                      </label>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mt-6 pt-6 border-t flex justify-between items-center">
            <div class="flex space-x-3">
              {#if selectedEnrollment.status === 'submitted'}
                <Button 
                  variant="success" 
                  onclick={() => {
                    updateStatus(selectedEnrollment!.id!, 'verified');
                    selectedEnrollment = null;
                  }}
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Application
                </Button>
                
                <Button 
                  variant="danger" 
                  onclick={() => {
                    selectedEnrollment = null;
                    // Open reject modal
                  }}
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reject
                </Button>
              {/if}
              
              {#if selectedEnrollment.status === 'verified'}
                <Button 
                  variant="primary" 
                  onclick={() => {
                    updateStatus(selectedEnrollment!.id!, 'printed');
                    selectedEnrollment = null;
                  }}
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Mark as Printed
                </Button>
              {/if}
              
              <Button 
                variant="outline" 
                onclick={() => {
                  exportToPDF(selectedEnrollment!);
                }}
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Form
              </Button>
            </div>
            
            <Button 
              variant="ghost"
              onclick={() => selectedEnrollment = null}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>