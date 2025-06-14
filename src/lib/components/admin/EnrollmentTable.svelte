<script lang="ts">
  import Button from '../ui/Button.svelte';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  import { exportToCSV, exportToPDF, batchExportToPDF } from '$lib/utils/exporters';
  import { enrollmentOps } from '$lib/firebase/firestore';
  import { sanitizeInput } from '$lib/utils/security';
  
  interface Props {
    enrollments: Enrollment[];
    onStatusChange: (id: string, status: EnrollmentStatus, reason?: string) => Promise<void>;
    onView: (enrollment: Enrollment) => void;
    onDelete: (id: string) => Promise<void>;
    loading?: boolean;
  }
  
  let { enrollments, onStatusChange, onView, onDelete, loading = false }: Props = $props();
  
  let selectedIds = $state<Set<string>>(new Set());
  let sortBy = $state<'date' | 'name' | 'status'>('date');
  let sortOrder = $state<'asc' | 'desc'>('desc');
  let showBulkActions = $state(false);
  let bulkAction = $state<'export' | 'print' | 'delete' | 'archive' | ''>('');
  let rejectModalOpen = $state(false);
  let rejectingId = $state<string | null>(null);
  let rejectionReason = $state('');
  
  const sortedEnrollments = $derived(() => {
    const sorted = [...enrollments].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.submittedAt).getTime();
          bVal = new Date(b.submittedAt).getTime();
          break;
        case 'name':
          aVal = a.fullName.toLowerCase();
          bVal = b.fullName.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return sorted;
  });
  
  function toggleSort(field: typeof sortBy) {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
  }
  
  function toggleSelect(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    selectedIds = newSet;
  }
  
  function toggleSelectAll() {
    if (selectedIds.size === enrollments.length) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(enrollments.map(e => e.id!));
    }
  }
  
  async function handleBulkAction() {
    const selectedEnrollments = enrollments.filter(e => selectedIds.has(e.id!));
    
    switch (bulkAction) {
      case 'export':
        exportToCSV(selectedEnrollments, `enrollments-${new Date().toISOString().split('T')[0]}.csv`);
        break;
        
      case 'print':
        batchExportToPDF(selectedEnrollments);
        break;
        
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedIds.size} enrollment(s)? This action cannot be undone.`)) {
          try {
            await enrollmentOps.batchDelete(Array.from(selectedIds));
            selectedIds = new Set();
            location.reload(); // Refresh to show changes
          } catch (error) {
            console.error('Error deleting enrollments:', error);
            alert('Failed to delete enrollments');
          }
        }
        break;
        
      case 'archive':
        if (confirm(`Archive ${selectedIds.size} enrollment(s)? They will be moved to the archive.`)) {
          try {
            await enrollmentOps.archive(Array.from(selectedIds));
            selectedIds = new Set();
            location.reload(); // Refresh to show changes
          } catch (error) {
            console.error('Error archiving enrollments:', error);
            alert('Failed to archive enrollments');
          }
        }
        break;
    }
    
    bulkAction = '';
    showBulkActions = false;
  }
  
  function openRejectModal(id: string) {
    rejectingId = id;
    rejectionReason = '';
    rejectModalOpen = true;
  }
  
  async function handleReject() {
    if (!rejectingId || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      await onStatusChange(rejectingId, 'rejected', sanitizeInput(rejectionReason));
      rejectModalOpen = false;
      rejectingId = null;
      rejectionReason = '';
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      alert('Failed to reject enrollment');
    }
  }
  
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="bg-white rounded-lg shadow-lg overflow-hidden">
  <!-- Table Actions -->
  <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-700 font-medium">
          {selectedIds.size} of {enrollments.length} selected
        </span>
        
        {#if selectedIds.size > 0}
          <div class="flex items-center space-x-2">
            <select 
              bind:value={bulkAction}
              class="text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Bulk Actions</option>
              <option value="export">Export CSV</option>
              <option value="print">Print Forms</option>
              <option value="archive">Archive</option>
              <option value="delete">Delete</option>
            </select>
            
            {#if bulkAction}
              <Button 
                variant={bulkAction === 'delete' ? 'danger' : 'primary'} 
                size="sm" 
                onclick={handleBulkAction}
              >
                Apply
              </Button>
            {/if}
          </div>
        {/if}
      </div>
      
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-700 mr-2">Sort by:</span>
        <select 
          bind:value={sortBy}
          aria-label="Sort by"
          class="text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedIds.size === enrollments.length && enrollments.length > 0}
              onchange={toggleSelectAll}
              class="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </th>
          <th 
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
            onclick={() => toggleSort('name')}
          >
            <div class="flex items-center">
              Student
              {#if sortBy === 'name'}
                <svg class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  {#if sortOrder === 'asc'}
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                  {:else}
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  {/if}
                </svg>
              {/if}
            </div>
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type/Level
          </th>
          <th 
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
            onclick={() => toggleSort('status')}
          >
            <div class="flex items-center">
              Status
              {#if sortBy === 'status'}
                <svg class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  {#if sortOrder === 'asc'}
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                  {:else}
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  {/if}
                </svg>
              {/if}
            </div>
          </th>
          <th 
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
            onclick={() => toggleSort('date')}
          >
            <div class="flex items-center">
              Submitted
              {#if sortBy === 'date'}
                <svg class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  {#if sortOrder === 'asc'}
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                  {:else}
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  {/if}
                </svg>
              {/if}
            </div>
          </th>
          <th class="relative px-6 py-3">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each sortedEnrollments() as enrollment}
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedIds.has(enrollment.id!)}
                onchange={() => toggleSelect(enrollment.id!)}
                class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-700 font-semibold">
                    {enrollment.fullName.charAt(0)}
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{enrollment.fullName}</div>
                  <div class="text-sm text-gray-500">{enrollment.userEmail}</div>
                  {#if enrollment.rejectionReason}
                    <div class="text-xs text-red-600 mt-1">
                      Rejected: {enrollment.rejectionReason}
                    </div>
                  {/if}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {enrollment.type === 'junior' ? 'Junior High' : 'Senior High'}
              </div>
              <div class="text-sm text-gray-500">
                Grade {enrollment.gradeLevel}
                {#if enrollment.type === 'senior'}
                  • {enrollment.strand}
                {/if}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(enrollment.status)}`}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(enrollment.submittedAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <button
                  onclick={() => onView(enrollment)}
                  class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="View details"
                  aria-label="View enrollment details"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                {#if enrollment.status === 'submitted'}
                  <button
                    onclick={() => onStatusChange(enrollment.id!, 'verified')}
                    disabled={loading}
                    class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                    title="Verify"
                    aria-label="Verify enrollment"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                {/if}
                
                {#if enrollment.status === 'verified'}
                  <button
                    onclick={() => onStatusChange(enrollment.id!, 'printed')}
                    disabled={loading}
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Mark as printed"
                    aria-label="Mark enrollment as printed"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                {/if}
                
                <button
                  onclick={() => {
                    if (confirm('Are you sure you want to delete this enrollment?')) {
                      onDelete(enrollment.id!);
                    }
                  }}
                  disabled={loading}
                  class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete"
                  aria-label="Delete enrollment"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-lg font-medium">No enrollments found</p>
              <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or wait for new applications</p>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- Rejection Modal -->
{#if rejectModalOpen}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div 
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        onclick={() => rejectModalOpen = false}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && (rejectModalOpen = false)}
        aria-label="Close modal"
      ></div>
      
      <div class="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
        <div>
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Reject Application
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Please provide a reason for rejecting this application. This will be recorded and may be communicated to the applicant.
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-5">
          <label for="reason" class="block text-sm font-medium text-gray-700">
            Rejection Reason
          </label>
          <textarea
            id="reason"
            bind:value={rejectionReason}
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="e.g., Incomplete documents, Invalid information, etc."
          ></textarea>
        </div>
        
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <Button
            variant="danger"
            onclick={handleReject}
            disabled={!rejectionReason.trim()}
            class="sm:col-start-2"
          >
            Reject Application
          </Button>
          <Button
            variant="outline"
            onclick={() => rejectModalOpen = false}
            class="mt-3 sm:mt-0 sm:col-start-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}