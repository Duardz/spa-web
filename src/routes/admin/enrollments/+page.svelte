<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import EnrollmentTable from '$lib/components/admin/EnrollmentTable.svelte';
  import EnrollmentDetail from '$lib/components/admin/EnrollmentDetail.svelte';
  import { enrollmentOpsEnhanced } from '$lib/firebase/firestore';
  import { exportToPDF } from '$lib/utils/exporters';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  import { CachedStorage } from '$lib/utils/helpers';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  
  // State
  let stats = $state<{
    total: number;
    byStatus: Record<EnrollmentStatus, number>;
    byType: { junior: number; senior: number };
    recent: number;
  }>({
    total: 0,
    byStatus: {
      submitted: 0,
      verified: 0,
      printed: 0,
      rejected: 0,
      archived: 0
    },
    byType: { junior: 0, senior: 0 },
    recent: 0
  });
  
  let loadingStats = $state(true);
  let selectedEnrollment = $state<Enrollment | null>(null);
  let showRejectModal = $state(false);
  let rejectionReason = $state('');
  let enrollmentToReject = $state<string | null>(null);
  let isUpdating = $state(false);
  
  // Filters
  let filters = $state({
    status: 'all' as EnrollmentStatus | 'all',
    type: 'all' as 'all' | 'junior' | 'senior',
    schoolYear: $enrollmentSettings.schoolYear,
    searchTerm: ''
  });
  
  // Cache for stats
  const statsCache = new CachedStorage('enrollment_stats_');
  
  // Track if component is mounted
  let isMounted = false;
  
  // Load stats with caching
  async function loadStats() {
    if (!isMounted) return; // Don't load if not mounted
    
    const cacheKey = `${filters.schoolYear}_stats`;
    const cached = statsCache.get<typeof stats>(cacheKey);
    
    if (cached) {
      stats = cached;
      loadingStats = false;
      
      // Refresh in background
      enrollmentOpsEnhanced.getStats(filters.schoolYear).then((newStats: typeof stats) => {
        if (isMounted) {
          stats = newStats;
          statsCache.set(cacheKey, newStats, 5); // Cache for 5 minutes
        }
      });
    } else {
      try {
        loadingStats = true;
        stats = await enrollmentOpsEnhanced.getStats(filters.schoolYear);
        statsCache.set(cacheKey, stats, 5);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        loadingStats = false;
      }
    }
  }
  
  // Update enrollment status
  async function updateStatus(id: string, status: EnrollmentStatus, reason?: string) {
    try {
      isUpdating = true;
      await enrollmentOpsEnhanced.updateStatus(id, status);
      
      if (status === 'rejected' && reason) {
        await enrollmentOpsEnhanced.batchUpdate([{
          id,
          data: { rejectionReason: reason }
        }]);
      }
      
      // Clear cache and reload stats
      statsCache.clear();
      await loadStats();
      
      // Close modals
      showRejectModal = false;
      rejectionReason = '';
      enrollmentToReject = null;
      
      if (selectedEnrollment?.id === id) {
        selectedEnrollment = null;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      isUpdating = false;
    }
  }
  
  // Delete enrollment
  async function deleteEnrollment(id: string) {
    try {
      await enrollmentOpsEnhanced.delete(id);
      statsCache.clear();
      await loadStats();
      
      if (selectedEnrollment?.id === id) {
        selectedEnrollment = null;
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Failed to delete enrollment');
    }
  }
  
  // View enrollment details
  async function viewEnrollmentDetails(enrollment: Enrollment) {
    selectedEnrollment = enrollment;
  }
  
  // Reject enrollment
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
  
  // Format number
  function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Get percentage
  function getPercentage(value: number, total: number): string {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  }
  
  // Only run once on mount
  onMount(() => {
    isMounted = true;
    
    // Get status from URL params
    const status = $page.url.searchParams.get('status');
    if (status && ['submitted', 'verified', 'printed', 'rejected', 'archived'].includes(status)) {
      filters.status = status as EnrollmentStatus;
    }
    
    // Load initial stats
    loadStats();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  });
</script>

<svelte:head>
  <title>Manage Enrollments - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Enrollments</h1>
      <p class="text-sm sm:text-base text-gray-600 mt-1">
        Manage applications for {$enrollmentSettings.schoolYear}
      </p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" onclick={() => statsCache.clear()}>
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Clear Cache
      </Button>
      <Button variant="primary" onclick={loadStats}>
        <svg class={`w-4 h-4 mr-1.5 ${loadingStats ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Stats
      </Button>
    </div>
  </div>
  
  <!-- Statistics Cards -->
  {#if loadingStats}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {#each Array(6) as _}
        <Card class="p-4 animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
        </Card>
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <button 
        type="button"
        class="text-center p-4 hover:shadow-md transition-shadow cursor-pointer rounded-lg bg-white" 
        onclick={() => filters.status = 'all'}
        onkeydown={(e) => e.key === 'Enter' && (filters.status = 'all')}
      >
        <Card class="h-full">
          <p class="text-3xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
          <p class="text-sm text-gray-600">Total</p>
          <div class="mt-2 flex justify-center gap-1">
            <span class="text-xs text-gray-500">{getPercentage(stats.byType.junior, stats.total)}% JHS</span>
            <span class="text-xs text-gray-400">•</span>
            <span class="text-xs text-gray-500">{getPercentage(stats.byType.senior, stats.total)}% SHS</span>
          </div>
        </Card>
      </button>
      
      <button 
        type="button"
        class="border-l-4 border-yellow-400 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer" 
        onclick={() => filters.status = 'submitted'}
        onkeydown={(e) => e.key === 'Enter' && (filters.status = 'submitted')}
      >
        <Card class="h-full text-center p-4">
          <p class="text-3xl font-bold text-yellow-600">{formatNumber(stats.byStatus.submitted)}</p>
          <p class="text-sm text-gray-600">Pending</p>
          <p class="text-xs text-gray-500 mt-1">{getPercentage(stats.byStatus.submitted, stats.total)}% of total</p>
        </Card>
      </button>
      
      <button 
        type="button"
        class="border-l-4 border-green-400 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer" 
        onclick={() => filters.status = 'verified'}
        onkeydown={(e) => e.key === 'Enter' && (filters.status = 'verified')}
      >
        <Card class="h-full text-center p-4">
          <p class="text-3xl font-bold text-green-600">{formatNumber(stats.byStatus.verified)}</p>
          <p class="text-sm text-gray-600">Verified</p>
          <p class="text-xs text-gray-500 mt-1">{getPercentage(stats.byStatus.verified, stats.total)}% of total</p>
        </Card>
      </button>
      
      <button 
        type="button"
        class="border-l-4 border-blue-400 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer" 
        onclick={() => filters.status = 'printed'}
        onkeydown={(e) => e.key === 'Enter' && (filters.status = 'printed')}
      >
        <Card class="h-full text-center p-4">
          <p class="text-3xl font-bold text-blue-600">{formatNumber(stats.byStatus.printed)}</p>
          <p class="text-sm text-gray-600">Printed</p>
          <p class="text-xs text-gray-500 mt-1">{getPercentage(stats.byStatus.printed, stats.total)}% of total</p>
        </Card>
      </button>
      
      <button 
        type="button"
        class="border-l-4 border-red-400 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer" 
        onclick={() => filters.status = 'rejected'}
        onkeydown={(e) => e.key === 'Enter' && (filters.status = 'rejected')}
      >
        <Card class="h-full text-center p-4">
          <p class="text-3xl font-bold text-red-600">{formatNumber(stats.byStatus.rejected)}</p>
          <p class="text-sm text-gray-600">Rejected</p>
          <p class="text-xs text-gray-500 mt-1">{getPercentage(stats.byStatus.rejected, stats.total)}% of total</p>
        </Card>
      </button>
      
      <div class="border-l-4 border-gray-400 rounded-lg bg-white">
        <Card class="h-full text-center p-4">
          <p class="text-3xl font-bold text-gray-600">{formatNumber(stats.recent)}</p>
          <p class="text-sm text-gray-600">Recent</p>
          <p class="text-xs text-gray-500 mt-1">Last 7 days</p>
        </Card>
      </div>
    </div>
  {/if}
  
  <!-- Filters Card -->
  <Card class="p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
        <select 
          id="statusFilter"
          bind:value={filters.status}
          class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted ({stats.byStatus.submitted})</option>
          <option value="verified">Verified ({stats.byStatus.verified})</option>
          <option value="printed">Printed ({stats.byStatus.printed})</option>
          <option value="rejected">Rejected ({stats.byStatus.rejected})</option>
          <option value="archived">Archived ({stats.byStatus.archived})</option>
        </select>
      </div>
      
      <div>
        <label for="typeFilter" class="block text-sm font-medium text-gray-700 mb-1">Type Filter</label>
        <select 
          id="typeFilter"
          bind:value={filters.type}
          class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Types</option>
          <option value="junior">Junior High ({stats.byType.junior})</option>
          <option value="senior">Senior High ({stats.byType.senior})</option>
        </select>
      </div>
      
      <div>
        <label for="schoolYear" class="block text-sm font-medium text-gray-700 mb-1">School Year</label>
        <input
          id="schoolYear"
          type="text"
          bind:value={filters.schoolYear}
          class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          readonly
        />
      </div>
      
      <div class="flex items-end">
        <Button 
          variant="outline" 
          onclick={() => {
            filters.status = 'all';
            filters.type = 'all';
            filters.searchTerm = '';
          }}
          fullWidth
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </Button>
      </div>
    </div>
  </Card>
  
  <!-- Enrollments Table -->
  <EnrollmentTable
    {filters}
    onStatusChange={updateStatus}
    onView={viewEnrollmentDetails}
    onDelete={deleteEnrollment}
  />
  
  <!-- Enrollment Detail Modal -->
  {#if selectedEnrollment}
    <EnrollmentDetail
      enrollment={selectedEnrollment}
      onClose={() => selectedEnrollment = null}
      onStatusChange={updateStatus}
      onReject={openRejectModal}
      {isUpdating}
    />
  {/if}
  
  <!-- Reject Modal -->
  {#if showRejectModal}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <button
          type="button"
          class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 cursor-default"
          onclick={() => {
            showRejectModal = false;
            rejectionReason = '';
            enrollmentToReject = null;
          }}
          aria-label="Close modal backdrop"
        ></button>
        
        <div class="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-xl">
          <div class="p-6">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
              Reject Application
            </h3>
            <p class="text-sm text-gray-500 text-center mb-4">
              Please provide a reason for rejecting this application. This will be recorded and may be communicated to the applicant.
            </p>
            
            <div>
              <label for="rejection-reason" class="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                bind:value={rejectionReason}
                rows="3"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Enter the reason for rejection..."
              ></textarea>
            </div>
            
            <div class="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onclick={() => {
                  showRejectModal = false;
                  rejectionReason = '';
                  enrollmentToReject = null;
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onclick={confirmReject}
                disabled={!rejectionReason.trim()}
                loading={isUpdating}
                fullWidth
              >
                Reject
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
  :global(.transition-shadow) {
    transition: box-shadow 0.2s ease-in-out;
  }
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    :global(.grid) {
      gap: 0.75rem;
    }
  }
</style>