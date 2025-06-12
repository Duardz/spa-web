<script lang="ts">
  import Button from '../ui/Button.svelte';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  import { exportToCSV, exportToPDF, batchExportToPDF } from '$lib/utils/exporters';
  
  interface Props {
    enrollments: Enrollment[];
    onStatusChange: (id: string, status: EnrollmentStatus) => Promise<void>;
    onView: (enrollment: Enrollment) => void;
    loading?: boolean;
  }
  
  let { enrollments, onStatusChange, onView, loading = false }: Props = $props();
  
  let selectedIds = $state<Set<string>>(new Set());
  let sortBy = $state<'date' | 'name' | 'status'>('date');
  let sortOrder = $state<'asc' | 'desc'>('desc');
  
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
  
  function exportSelected() {
    const selected = enrollments.filter(e => selectedIds.has(e.id!));
    if (selected.length > 0) {
      exportToCSV(selected, `enrollments-${new Date().toISOString().split('T')[0]}.csv`);
    }
  }
  
  function printSelected() {
    const selected = enrollments.filter(e => selectedIds.has(e.id!));
    if (selected.length > 0) {
      batchExportToPDF(selected);
    }
  }
  
  function getStatusColor(status: EnrollmentStatus) {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'printed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
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

<div class="bg-white rounded-lg shadow overflow-hidden">
  <!-- Table Actions -->
  <div class="px-6 py-4 border-b border-gray-200">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-700">
          {selectedIds.size} of {enrollments.length} selected
        </span>
        {#if selectedIds.size > 0}
          <Button variant="outline" size="sm" onclick={exportSelected}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onclick={printSelected}>
            Print Selected
          </Button>
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
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedIds.has(enrollment.id!)}
                onchange={() => toggleSelect(enrollment.id!)}
                class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">{enrollment.fullName}</div>
                <div class="text-sm text-gray-500">{enrollment.userEmail}</div>
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
              <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(enrollment.submittedAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onclick={() => onView(enrollment)}
                class="text-green-600 hover:text-green-900 mr-3"
              >
                View
              </button>
              {#if enrollment.status === 'submitted'}
                <button
                  onclick={() => onStatusChange(enrollment.id!, 'verified')}
                  disabled={loading}
                  class="text-blue-600 hover:text-blue-900"
                >
                  Verify
                </button>
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No enrollments found
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>