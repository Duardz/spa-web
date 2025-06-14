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
  let loadingDetails = $state(false);
  let statusFilter = $state<EnrollmentStatus | 'all'>('all');
  let typeFilter = $state<'all' | 'junior' | 'senior'>('all');
  let searchTerm = $state('');
  let showRejectModal = $state(false);
  let rejectionReason = $state('');
  let enrollmentToReject = $state<string | null>(null);
  let isUpdating = $state(false);
  let showFilters = $state(false);
  
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
      const fetchedEnrollments = await enrollmentOps.getAll({ 
        schoolYear: $enrollmentSettings.schoolYear 
      });
      console.log('Loaded enrollments:', fetchedEnrollments);
      enrollments = fetchedEnrollments;
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      loading = false;
    }
  }
  
  async function updateStatus(id: string, status: EnrollmentStatus, reason?: string) {
    try {
      isUpdating = true;
      await enrollmentOps.updateStatus(id, status);
      
      // If rejecting, update with reason
      if (status === 'rejected' && reason) {
        await enrollmentOps.update(id, { rejectionReason: reason });
      }
      
      // Update local state
      enrollments = enrollments.map(e => 
        e.id === id ? { ...e, status, rejectionReason: reason } : e
      );
      
      // If we have a selected enrollment, update it too
      if (selectedEnrollment && selectedEnrollment.id === id) {
        selectedEnrollment = { ...selectedEnrollment, status, rejectionReason: reason };
      }
      
      // Close modals
      showRejectModal = false;
      rejectionReason = '';
      enrollmentToReject = null;
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      isUpdating = false;
    }
  }
  
  async function deleteEnrollment(id: string) {
    try {
      await enrollmentOps.delete(id);
      enrollments = enrollments.filter(e => e.id !== id);
      if (selectedEnrollment?.id === id) {
        selectedEnrollment = null;
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Failed to delete enrollment');
    }
  }
  
  async function viewEnrollmentDetails(enrollmentId: string) {
    try {
      loadingDetails = true;
      console.log('Fetching enrollment details for ID:', enrollmentId);
      
      // First try to get it from the local list
      let enrollment = enrollments.find(e => e.id === enrollmentId);
      
      // If not found or incomplete, fetch from database
      if (!enrollment || !enrollment.fullName) {
        // If you have a getById method, use it. Otherwise use the local data
        // enrollment = await enrollmentOps.getById(enrollmentId);
      }
      
      if (enrollment) {
        console.log('Enrollment details loaded:', enrollment);
        selectedEnrollment = enrollment;
      } else {
        alert('Enrollment not found');
      }
    } catch (error) {
      console.error('Error loading enrollment details:', error);
      alert('Failed to load enrollment details');
    } finally {
      loadingDetails = false;
    }
  }
  
  function openRejectModal(enrollmentId: string) {
    enrollmentToReject = enrollmentId;
    showRejectModal = true;
  }
  
  async function confirmReject() {
    if (!enrollmentToReject || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    await updateStatus(enrollmentToReject, 'rejected', rejectionReason);
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

<div class="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
  <!-- Header - Mobile Optimized -->
  <div class="space-y-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Enrollments</h1>
      <p class="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
        Manage applications for {$enrollmentSettings.schoolYear}
      </p>
    </div>
    <div class="flex justify-end">
      <Button variant="primary" onclick={loadEnrollments} size="sm">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="hidden sm:inline">Refresh</span>
      </Button>
    </div>
  </div>
  
  <!-- Statistics Cards - Mobile Optimized Grid -->
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
    <Card class="text-center p-2 sm:p-3 md:p-4">
      <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{stats().total}</p>
      <p class="text-xs sm:text-sm text-gray-600">Total</p>
    </Card>
    <Card class="text-center p-2 sm:p-3 md:p-4 border-l-2 sm:border-l-4 border-yellow-400">
      <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600">{stats().submitted}</p>
      <p class="text-xs sm:text-sm text-gray-600">Pending</p>
    </Card>
    <Card class="text-center p-2 sm:p-3 md:p-4 border-l-2 sm:border-l-4 border-green-400">
      <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{stats().verified}</p>
      <p class="text-xs sm:text-sm text-gray-600">Verified</p>
    </Card>
    <Card class="text-center p-2 sm:p-3 md:p-4 border-l-2 sm:border-l-4 border-blue-400">
      <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{stats().printed}</p>
      <p class="text-xs sm:text-sm text-gray-600">Printed</p>
    </Card>
    <Card class="text-center p-2 sm:p-3 md:p-4 border-l-2 sm:border-l-4 border-red-400">
      <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-600">{stats().rejected}</p>
      <p class="text-xs sm:text-sm text-gray-600">Rejected</p>
    </Card>
    <Card class="text-center p-2 sm:p-3 md:p-4 border-l-2 sm:border-l-4 border-gray-400">
      <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-600">{stats().archived}</p>
      <p class="text-xs sm:text-sm text-gray-600">Archived</p>
    </Card>
  </div>
  
  <!-- Filters - Mobile Optimized -->
  <Card class="p-3 sm:p-4">
    <button 
      onclick={() => showFilters = !showFilters}
      onkeydown={(e) => e.key === 'Enter' && (showFilters = !showFilters)}
      class="w-full sm:hidden flex items-center justify-between py-1"
      aria-label="Toggle filters"
      aria-expanded={showFilters}
    >
      <span class="text-sm font-medium text-gray-700">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? '(Active)' : ''}
      </span>
      <svg class={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div class={`${showFilters ? 'block mt-3' : 'hidden'} sm:block space-y-3 sm:space-y-0`}>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="sm:col-span-2 lg:col-span-1">
          <label for="searchInput" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            id="searchInput"
            type="text"
            bind:value={searchTerm}
            placeholder="Name, LRN, or email..."
            class="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label for="statusFilter" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            id="statusFilter"
            bind:value={statusFilter}
            class="block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
          <label for="typeFilter" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type</label>
          <select 
            id="typeFilter"
            bind:value={typeFilter}
            class="block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Types</option>
            <option value="junior">Junior High</option>
            <option value="senior">Senior High</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <Button 
            variant="outline" 
            size="sm"
            onclick={() => {
              searchTerm = '';
              statusFilter = 'all';
              typeFilter = 'all';
            }}
            fullWidth
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  </Card>
  
  <!-- Enrollments Table/List -->
  {#if loading}
    <div class="flex justify-center py-8 sm:py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else}
    <!-- Mobile List View -->
    <div class="sm:hidden space-y-3">
      {#each filteredEnrollments() as enrollment}
        <Card class="p-3">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <h3 class="font-medium text-sm text-gray-900 truncate pr-2">
                {enrollment.fullName}
              </h3>
              <p class="text-xs text-gray-500 truncate">{enrollment.userEmail}</p>
            </div>
            <span class={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${
              enrollment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              enrollment.status === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
              enrollment.status === 'printed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              enrollment.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            }`}>
              {enrollment.status}
            </span>
          </div>
          
          <div class="text-xs text-gray-600 space-y-1">
            <p>{enrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {enrollment.gradeLevel}
              {enrollment.type === 'senior' ? ` - ${enrollment.strand}` : ''}
            </p>
            <p>Submitted: {new Date(enrollment.submittedAt).toLocaleDateString('en-PH')}</p>
          </div>
          
          <div class="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="xs"
              onclick={() => viewEnrollmentDetails(enrollment.id!)}
              fullWidth
              aria-label={`View details for ${enrollment.fullName}`}
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </Button>
            
            {#if enrollment.status === 'submitted'}
              <Button
                variant="success"
                size="xs"
                onclick={() => updateStatus(enrollment.id!, 'verified')}
                loading={isUpdating}
                fullWidth
              >
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify
              </Button>
            {/if}
          </div>
        </Card>
      {:else}
        <Card class="p-8 text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm text-gray-600">No enrollments found</p>
        </Card>
      {/each}
    </div>
    
    <!-- Desktop Table View -->
    <div class="hidden sm:block">
      <EnrollmentTable 
        enrollments={filteredEnrollments()}
        onStatusChange={updateStatus}
        onView={(enrollment) => viewEnrollmentDetails(enrollment.id!)}
        onDelete={deleteEnrollment}
      />
    </div>
  {/if}
  
  <!-- Enrollment Detail Modal - Mobile Optimized -->
  {#if selectedEnrollment}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen px-0 sm:px-4">
        <div 
          class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onclick={() => selectedEnrollment = null}
          onkeydown={(e) => e.key === 'Enter' && (selectedEnrollment = null)}
          role="button"
          tabindex="0"
          aria-label="Close modal backdrop"
        ></div>
        
        <div class="relative bg-white w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl sm:mx-auto rounded-t-2xl sm:rounded-lg shadow-xl transform transition-all max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between">
            <div class="flex-1 pr-3">
              <h3 class="text-base sm:text-lg font-medium text-gray-900 truncate">
                Enrollment Details
              </h3>
              <p class="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                ID: {selectedEnrollment.id}
              </p>
            </div>
            <button
              onclick={() => selectedEnrollment = null}
              onkeydown={(e) => e.key === 'Enter' && (selectedEnrollment = null)}
              class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Modal Content -->
          <div class="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {#if loadingDetails}
              <div class="text-center py-8">
                <LoadingSpinner size="md" />
                <p class="text-sm text-gray-600 mt-3">Loading details...</p>
              </div>
            {:else}
              <div class="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <!-- Mobile: Single Column, Desktop: Two Columns -->
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <!-- Student Info -->
                  <div class="space-y-4">
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Student Information
                      </h4>
                      <dl class="space-y-2 text-xs sm:text-sm">
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Full Name</dt>
                          <dd class="font-medium text-gray-900 text-right">{selectedEnrollment.fullName || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">LRN</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.lrn || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Grade Level</dt>
                          <dd class="font-medium text-gray-900">
                            {selectedEnrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {selectedEnrollment.gradeLevel || 'N/A'}
                            {#if selectedEnrollment.type === 'senior' && selectedEnrollment.strand}
                              - {selectedEnrollment.strand}
                            {/if}
                          </dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Birth Date</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.birthDate || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Age</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.age || 'N/A'} years old</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Gender</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.gender || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Religion</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.religion || 'N/A'}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <!-- Guardian Info -->
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Guardian Information
                      </h4>
                      <dl class="space-y-2 text-xs sm:text-sm">
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Name</dt>
                          <dd class="font-medium text-gray-900 text-right">{selectedEnrollment.guardianName || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Relationship</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.guardianRelation || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Contact</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.contactNumber || 'N/A'}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <!-- Address on mobile -->
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4 lg:hidden">
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Address</h4>
                      <p class="text-xs sm:text-sm text-gray-700">{selectedEnrollment.address || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <!-- Academic Info & Status -->
                  <div class="space-y-4">
                    <!-- Academic Info -->
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Academic Information
                      </h4>
                      <dl class="space-y-2 text-xs sm:text-sm">
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Last School</dt>
                          <dd class="font-medium text-gray-900 text-right">{selectedEnrollment.lastSchool || 'N/A'}</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">General Average</dt>
                          <dd class="font-medium text-gray-900">{selectedEnrollment.generalAverage || 'N/A'}%</dd>
                        </div>
                        <div class="flex justify-between py-1">
                          <dt class="text-gray-500">Student Type</dt>
                          <dd class="font-medium text-gray-900">
                            {selectedEnrollment.isTransferee ? 'Transferee' : 'Regular'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <!-- Application Status -->
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Application Status
                      </h4>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <span class="text-xs sm:text-sm text-gray-500">Status:</span>
                          <span class={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            selectedEnrollment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            selectedEnrollment.status === 'verified' ? 'bg-green-100 text-green-800' :
                            selectedEnrollment.status === 'printed' ? 'bg-blue-100 text-blue-800' :
                            selectedEnrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                          </span>
                        </div>
                        
                        <dl class="space-y-1 text-xs">
                          <div class="flex justify-between">
                            <dt class="text-gray-500">Submitted:</dt>
                            <dd class="text-gray-900">{selectedEnrollment.submittedAt ? new Date(selectedEnrollment.submittedAt).toLocaleDateString('en-PH') : 'N/A'}</dd>
                          </div>
                          <div class="flex justify-between">
                            <dt class="text-gray-500">By:</dt>
                            <dd class="text-gray-900 truncate max-w-[150px]">{selectedEnrollment.userEmail || 'N/A'}</dd>
                          </div>
                        </dl>
                        
                        {#if selectedEnrollment.rejectionReason}
                          <div class="mt-2 p-2 bg-red-50 rounded text-xs">
                            <p class="text-red-800">
                              <strong>Rejection Reason:</strong> {selectedEnrollment.rejectionReason}
                            </p>
                          </div>
                        {/if}
                      </div>
                    </div>
                    
                    <!-- Documents Checklist -->
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Documents
                      </h4>
                      <div class="space-y-1.5">
                        {#if selectedEnrollment.type === 'junior'}
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasForm10} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasForm10 ? 'text-green-700' : 'text-gray-500'}>
                              SF10
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasPSA} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasPSA ? 'text-green-700' : 'text-gray-500'}>
                              PSA Birth Certificate
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasBaptismal} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasBaptismal ? 'text-green-700' : 'text-gray-500'}>
                              Baptismal Certificate
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasGoodMoral} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasGoodMoral ? 'text-green-700' : 'text-gray-500'}>
                              Good Moral Certificate
                            </span>
                          </label>
                        {:else}
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasForm9} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasForm9 ? 'text-green-700' : 'text-gray-500'}>
                              SF9
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasForm10} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasForm10 ? 'text-green-700' : 'text-gray-500'}>
                              SF10
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasPSA} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasPSA ? 'text-green-700' : 'text-gray-500'}>
                              PSA Birth Certificate
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasMoral} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasMoral ? 'text-green-700' : 'text-gray-500'}>
                              Good Moral Certificate
                            </span>
                          </label>
                          <label class="flex items-center text-xs sm:text-sm">
                            <input type="checkbox" checked={selectedEnrollment.hasCompletionCert} disabled class="mr-2" />
                            <span class={selectedEnrollment.hasCompletionCert ? 'text-green-700' : 'text-gray-500'}>
                              JHS Completion Certificate
                            </span>
                          </label>
                        {/if}
                      </div>
                    </div>
                    
                    <!-- Address on desktop -->
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4 hidden lg:block">
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Address</h4>
                      <p class="text-xs sm:text-sm text-gray-700">{selectedEnrollment.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Actions - Mobile Optimized -->
          <div class="sticky bottom-0 bg-white border-t px-4 py-3 sm:px-6 sm:py-4">
            <div class="grid grid-cols-2 sm:flex sm:justify-between gap-2 sm:gap-3">
              <div class="col-span-2 sm:col-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
                {#if selectedEnrollment && selectedEnrollment.status === 'submitted'}
                  <Button 
                    variant="success" 
                    onclick={() => updateStatus(selectedEnrollment!.id!, 'verified')}
                    loading={isUpdating}
                    size="sm"
                    fullWidth
                  >
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify
                  </Button>
                  
                  <Button 
                    variant="danger" 
                    onclick={() => openRejectModal(selectedEnrollment!.id!)}
                    size="sm"
                    fullWidth
                  >
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reject
                  </Button>
                {/if}
                
                {#if selectedEnrollment && selectedEnrollment.status === 'verified'}
                  <Button 
                    variant="primary" 
                    onclick={() => updateStatus(selectedEnrollment!.id!, 'printed')}
                    loading={isUpdating}
                    size="sm"
                    fullWidth
                  >
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Mark Printed
                  </Button>
                {/if}
              </div>
              
              <Button 
                variant="outline" 
                onclick={() => selectedEnrollment && exportToPDF(selectedEnrollment)}
                size="sm"
              >
                <svg class="w-3.5 h-3.5 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span class="hidden sm:inline">Print</span>
              </Button>
              
              <Button 
                variant="ghost"
                onclick={() => selectedEnrollment = null}
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Reject Modal - Mobile Optimized -->
  {#if showRejectModal}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen">
        <div 
          class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onclick={() => {
            showRejectModal = false;
            rejectionReason = '';
            enrollmentToReject = null;
          }}
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              showRejectModal = false;
              rejectionReason = '';
              enrollmentToReject = null;
            }
          }}
          role="button"
          tabindex="0"
          aria-label="Close reject modal backdrop"
        ></div>
        
        <div class="relative bg-white w-full sm:max-w-md sm:mx-auto rounded-t-2xl sm:rounded-lg shadow-xl transform transition-all">
          <div class="p-4 sm:p-6">
            <div class="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-3 sm:mb-4">
              <svg class="h-5 w-5 sm:h-6 sm:w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 class="text-base sm:text-lg font-medium text-gray-900 text-center mb-2">
              Reject Application
            </h3>
            <p class="text-xs sm:text-sm text-gray-500 text-center mb-4">
              Please provide a reason for rejection. This will be shared with the applicant.
            </p>
            
            <div>
              <label for="rejection-reason" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                bind:value={rejectionReason}
                rows="3"
                class="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Enter the reason for rejection..."
              ></textarea>
            </div>
            
            <div class="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                onclick={() => {
                  showRejectModal = false;
                  rejectionReason = '';
                  enrollmentToReject = null;
                }}
                size="sm"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onclick={confirmReject}
                disabled={!rejectionReason.trim()}
                loading={isUpdating}
                size="sm"
                fullWidth
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Smooth transitions */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  /* Better touch targets for mobile */
  @media (max-width: 640px) {
    button, input, select, textarea {
      min-height: 44px;
    }
  }
  
  /* Ensure modals slide up on mobile */
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @media (max-width: 640px) {
    .fixed > div:last-child {
      animation: slideUp 0.3s ease-out;
    }
  }
</style>