<!-- src/lib/components/admin/EnrollmentTable.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Button from '../ui/Button.svelte';
  import LoadingSpinner from '../ui/LoadingSpinner.svelte';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  import type { DocumentSnapshot, Unsubscribe } from 'firebase/firestore';
  import { enrollmentOpsEnhanced } from '$lib/firebase/firestore';
  import { exportToCSV, exportToPDF } from '$lib/utils/exporters';
  import { debounce } from '$lib/utils/helpers';
  import { decryptEnrollmentData, canDecrypt } from '$lib/utils/encryption';
  import { user } from '$lib/stores/auth';
  import { fade, slide } from 'svelte/transition';
  
  interface Props {
    filters?: {
      status?: EnrollmentStatus | 'all';
      type?: 'all' | 'junior' | 'senior';
      schoolYear?: string;
      searchTerm?: string;
    };
    onStatusChange?: (id: string, status: EnrollmentStatus, reason?: string) => Promise<void>;
    onView?: (enrollment: Enrollment) => void;
    onDelete?: (id: string) => Promise<void>;
  }
  
  let { 
    filters = {}, 
    onStatusChange,
    onView,
    onDelete
  }: Props = $props();
  
  // State
  let enrollments = $state<Enrollment[]>([]);
  let loading = $state(false);
  let loadingMore = $state(false);
  let hasMore = $state(true);
  let totalCount = $state(0);
  let selectedIds = $state<Set<string>>(new Set());
  let sortBy = $state<'submittedAt' | 'fullName' | 'status'>('submittedAt');
  let sortOrder = $state<'asc' | 'desc'>('desc');
  let currentPage = $state(1);
  let pageSize = $state(20);
  let lastDoc = $state<DocumentSnapshot | null>(null);
  let firstDoc = $state<DocumentSnapshot | null>(null);
  
  // Search state
  let searchInput = $state('');
  let searchResults = $state<Enrollment[]>([]);
  let isSearching = $state(false);
  let searchError = $state('');
  
  // Real-time updates
  let realtimeListener: Unsubscribe | null = null;
  let hasNewEnrollments = $state(false);
  let newEnrollmentCount = $state(0);
  let lastFetchTime = $state(Date.now());
  
  // Check if user can decrypt
  const userCanDecrypt = $derived(() => canDecrypt($user?.role));
  
  // Intersection Observer for infinite scroll
  let observerTarget: HTMLDivElement;
  let observer: IntersectionObserver;
  
  // Computed values
  const displayedData = $derived(searchInput ? searchResults : enrollments);
  const showingCount = $derived(displayedData.length);
  
  // Helper function to display name
  function displayName(enrollment: Enrollment): string {
    if (!enrollment._encrypted || userCanDecrypt()) {
      const data = enrollment._encrypted && userCanDecrypt() ? decryptEnrollmentData(enrollment) : enrollment;
      return data.fullName || 'Unknown';
    }
    return 'Encrypted Data';
  }
  
  // Helper function to display LRN
  function displayLRN(enrollment: Enrollment): string {
    if (!enrollment._encrypted || userCanDecrypt()) {
      const data = enrollment._encrypted && userCanDecrypt() ? decryptEnrollmentData(enrollment) : enrollment;
      return data.lrn || 'N/A';
    }
    return '••••••••••••';
  }
  
  // Enhanced search with better error handling
  const searchEnrollments = debounce(async (term: string) => {
    if (!term || term.length < 2) {
      searchResults = [];
      isSearching = false;
      searchError = '';
      return;
    }
    
    isSearching = true;
    searchError = '';
    
    try {
      const results = await enrollmentOpsEnhanced.search(term, {
        filters: {
          status: filters.status !== 'all' ? filters.status as EnrollmentStatus : undefined,
          type: filters.type !== 'all' ? filters.type as 'junior' | 'senior' : undefined,
          schoolYear: filters.schoolYear
        },
        pageSize: 50 // Increase search results
      });
      
      searchResults = results;
      
      if (results.length === 0) {
        searchError = 'No results found. Try different search terms.';
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults = [];
      searchError = 'Search failed. Please try again.';
    } finally {
      isSearching = false;
    }
  }, 300);
  
  // Load enrollments with pagination
  async function loadEnrollments(reset = false) {
    if (loading || (!hasMore && !reset)) return;
    
    // If searching, don't load paginated results
    if (searchInput.length >= 2) return;
    
    loading = !enrollments.length || reset;
    loadingMore = enrollments.length > 0 && !reset;
    
    try {
      const result = await enrollmentOpsEnhanced.getPaginated({
        pageSize,
        cursor: reset ? null : lastDoc,
        filters: {
          status: filters.status !== 'all' ? filters.status as EnrollmentStatus : undefined,
          type: filters.type !== 'all' ? filters.type as 'junior' | 'senior' : undefined,
          schoolYear: filters.schoolYear
        },
        orderByField: sortBy,
        orderDirection: sortOrder
      });
      
      if (reset) {
        enrollments = result.data;
        currentPage = 1;
        hasNewEnrollments = false;
        newEnrollmentCount = 0;
      } else {
        enrollments = [...enrollments, ...result.data];
      }
      
      hasMore = result.hasMore;
      lastDoc = result.lastDoc;
      firstDoc = result.firstDoc;
      lastFetchTime = Date.now();
      
      // Prefetch next page for smoother experience
      if (hasMore && lastDoc) {
        enrollmentOpsEnhanced.prefetchNext(lastDoc, filters);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      loading = false;
      loadingMore = false;
    }
  }
  
  // Setup real-time listener
  function setupRealtimeListener() {
    // Clean up existing listener
    if (realtimeListener) {
      realtimeListener();
      realtimeListener = null;
    }
    
    const listenFilters = {
      status: filters.status !== 'all' ? filters.status as EnrollmentStatus : undefined,
      type: filters.type !== 'all' ? filters.type as 'junior' | 'senior' : undefined,
      schoolYear: filters.schoolYear
    };
    
    realtimeListener = enrollmentOpsEnhanced.listenToEnrollments(
      listenFilters,
      (realtimeEnrollments) => {
        // Check for new enrollments
        const currentIds = new Set(enrollments.map(e => e.id));
        const newEnrollments = realtimeEnrollments.filter(e => 
          !currentIds.has(e.id) && new Date(e.submittedAt).getTime() > lastFetchTime
        );
        
        if (newEnrollments.length > 0) {
          hasNewEnrollments = true;
          newEnrollmentCount = newEnrollments.length;
        }
        
        // Update existing enrollments if their status changed
        enrollments = enrollments.map(enrollment => {
          const updated = realtimeEnrollments.find(e => e.id === enrollment.id);
          return updated || enrollment;
        });
      }
    );
  }
  
  // Load new enrollments when notification is clicked
  function loadNewEnrollments() {
    loadEnrollments(true);
  }
  
  // Load total count
  async function loadTotalCount() {
    try {
      totalCount = await enrollmentOpsEnhanced.getCount({
        status: filters.status !== 'all' ? filters.status as EnrollmentStatus : undefined,
        type: filters.type !== 'all' ? filters.type as 'junior' | 'senior' : undefined,
        schoolYear: filters.schoolYear
      });
    } catch (error) {
      console.error('Error loading count:', error);
    }
  }
  
  // Handle sorting
  function handleSort(field: typeof sortBy) {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
    loadEnrollments(true);
  }
  
  // Selection handlers
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
    const currentData = searchInput ? searchResults : enrollments;
    if (selectedIds.size === currentData.length && currentData.length > 0) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(currentData.map(e => e.id!));
    }
  }
  
  // Bulk actions
  async function handleBulkExport() {
    const currentData = searchInput ? searchResults : enrollments;
    const selected = currentData.filter(e => selectedIds.has(e.id!));
    
    if (selected.length === 0) return;
    
    // Decrypt data if user has permission before exporting
    const exportData = userCanDecrypt() 
      ? selected.map(e => e._encrypted ? decryptEnrollmentData(e) : e)
      : selected;
    
    exportToCSV(exportData, `enrollments-${new Date().toISOString().split('T')[0]}.csv`);
    selectedIds = new Set();
  }
  
  // Get status badge classes
  function getStatusColor(status: EnrollmentStatus) {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'printed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  // Format date
  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Handle view with decryption
  function handleView(enrollment: Enrollment) {
    if (onView) {
      // Decrypt data before passing to view handler if user has permission
      if (userCanDecrypt() && enrollment._encrypted) {
        const decrypted = decryptEnrollmentData(enrollment);
        onView(decrypted);
      } else {
        onView(enrollment);
      }
    }
  }
  
  // Clear search
  function clearSearch() {
    searchInput = '';
    searchResults = [];
    searchError = '';
    isSearching = false;
  }
  
  // Watch for filter changes
  let previousFilters = JSON.stringify(filters);
  $effect(() => {
    const currentFilters = JSON.stringify(filters);
    if (currentFilters !== previousFilters) {
      previousFilters = currentFilters;
      // Reset and reload when filters change
      enrollments = [];
      lastDoc = null;
      hasMore = true;
      currentPage = 1;
      loadEnrollments(true);
      loadTotalCount();
      setupRealtimeListener();
    }
  });
  
  // Watch for search input
  $effect(() => {
    searchEnrollments(searchInput);
  });
  
  // Setup intersection observer for infinite scroll
  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && !searchInput) {
          loadEnrollments();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget) {
      observer.observe(observerTarget);
    }
    
    // Initial load
    loadEnrollments(true);
    loadTotalCount();
    setupRealtimeListener();
  });
  
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
    if (realtimeListener) {
      realtimeListener();
    }
    // Clean up all listeners
    enrollmentOpsEnhanced.cleanupListeners();
  });
</script>

<div class="bg-white rounded-lg shadow-lg overflow-hidden">
  <!-- New enrollments notification -->
  {#if hasNewEnrollments}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="bg-blue-50 border-b border-blue-200 px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors"
      onclick={loadNewEnrollments}
      transition:slide
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="text-sm font-medium text-blue-800">
            {newEnrollmentCount} new enrollment{newEnrollmentCount > 1 ? 's' : ''} available
          </span>
        </div>
        <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Click to refresh
        </button>
      </div>
    </div>
  {/if}

  <!-- Header with stats - Mobile responsive -->
  <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="text-sm text-gray-700">
        <span class="font-medium">{showingCount}</span> of 
        <span class="font-medium">{totalCount}</span> enrollments
        {#if selectedIds.size > 0}
          • <span class="font-medium text-blue-600">{selectedIds.size} selected</span>
        {/if}
      </div>
      
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <!-- Enhanced Search -->
        <div class="relative">
          <input
            type="text"
            bind:value={searchInput}
            placeholder="Search by name..."
            class="w-full sm:w-80 pl-9 pr-10 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            aria-label="Search enrollments"
          />
          <svg class="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {#if isSearching}
            <div class="absolute right-2 top-2">
              <LoadingSpinner size="sm" />
            </div>
          {:else if searchInput}
            <button
              onclick={clearSearch}
              class="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
        
        <div class="flex gap-2">
          <!-- Page size selector -->
          <select 
            bind:value={pageSize}
            onchange={() => loadEnrollments(true)}
            class="flex-1 sm:flex-none text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
          
          <!-- Bulk actions - Show only when items selected -->
          {#if selectedIds.size > 0}
            <Button 
              variant="outline" 
              size="sm" 
              onclick={handleBulkExport}
              class="whitespace-nowrap"
            >
              <svg class="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden sm:inline">Export</span>
            </Button>
          {/if}
          
          <!-- Refresh -->
          <Button 
            variant="ghost" 
            size="sm" 
            onclick={() => {
              loadEnrollments(true);
              loadTotalCount();
            }}
            disabled={loading}
            class="!p-2"
          >
            <svg class={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
    
    {#if searchError}
      <div class="mt-2 text-sm text-red-600" transition:fade>
        {searchError}
      </div>
    {/if}
  </div>
  
  <!-- Table - Desktop -->
  <div class="hidden sm:block overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedIds.size === displayedData.length && displayedData.length > 0}
              onchange={toggleSelectAll}
              class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              aria-label="Select all"
            />
          </th>
          <th 
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
            onclick={() => handleSort('fullName')}
          >
            <div class="flex items-center">
              Student
              {#if sortBy === 'fullName'}
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
            onclick={() => handleSort('status')}
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
            onclick={() => handleSort('submittedAt')}
          >
            <div class="flex items-center">
              Submitted
              {#if sortBy === 'submittedAt'}
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
        {#if loading && enrollments.length === 0}
          <tr>
            <td colspan="6" class="px-6 py-12 text-center">
              <LoadingSpinner size="lg" />
              <p class="mt-2 text-sm text-gray-500">Loading enrollments...</p>
            </td>
          </tr>
        {:else if displayedData.length === 0}
          <tr>
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              {#if searchInput}
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p class="text-lg font-medium">No results found</p>
                <p class="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
              {:else}
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-lg font-medium">No enrollments found</p>
                <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or wait for new applications</p>
              {/if}
            </td>
          </tr>
        {:else}
          {#each displayedData as enrollment}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.has(enrollment.id!)}
                  onchange={() => toggleSelect(enrollment.id!)}
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  aria-label={`Select ${displayName(enrollment)}`}
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span class="text-green-700 font-semibold">
                      {displayName(enrollment).charAt(0)}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 flex items-center">
                      {displayName(enrollment)}
                      {#if enrollment._encrypted && !userCanDecrypt()}
                        <svg class="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      {/if}
                    </div>
                    <div class="text-sm text-gray-500">{displayLRN(enrollment)}</div>
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
                  {#if onView}
                    <button
                      onclick={() => handleView(enrollment)}
                      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="View details"
                      aria-label="View enrollment details"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  {/if}
                  
                  {#if onStatusChange && enrollment.status === 'submitted'}
                    <button
                      onclick={() => onStatusChange(enrollment.id!, 'verified')}
                      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      title="Verify"
                      aria-label="Verify enrollment"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  {/if}
                  
                  {#if onDelete}
                    <button
                      onclick={() => {
                        if (confirm('Are you sure you want to delete this enrollment?')) {
                          onDelete(enrollment.id!);
                        }
                      }}
                      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete"
                      aria-label="Delete enrollment"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  <!-- Mobile Card View -->
  <div class="sm:hidden">
    {#if loading && enrollments.length === 0}
      <div class="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p class="mt-2 text-sm text-gray-500">Loading enrollments...</p>
      </div>
    {:else if displayedData.length === 0}
      <div class="p-8 text-center">
        {#if searchInput}
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-lg font-medium">No results found</p>
          <p class="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
        {:else}
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium">No enrollments found</p>
          <p class="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        {/if}
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each displayedData as enrollment}
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.has(enrollment.id!)}
                  onchange={() => toggleSelect(enrollment.id!)}
                  class="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <h3 class="text-sm font-medium text-gray-900 flex items-center">
                    {displayName(enrollment)}
                    {#if enrollment._encrypted && !userCanDecrypt()}
                      <svg class="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    {/if}
                  </h3>
                  <p class="text-xs text-gray-500">{displayLRN(enrollment)}</p>
                </div>
              </div>
              <span class={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(enrollment.status)}`}>
                {enrollment.status}
              </span>
            </div>
            
            <div class="text-xs text-gray-600 space-y-1 ml-7">
              <p>{enrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {enrollment.gradeLevel}
                {#if enrollment.type === 'senior'} • {enrollment.strand}{/if}
              </p>
              <p>Submitted: {formatDate(enrollment.submittedAt)}</p>
            </div>
            
            <div class="flex items-center gap-2 mt-3 ml-7">
              {#if onView}
                <button
                  onclick={() => handleView(enrollment)}
                  class="text-xs text-blue-600 hover:text-blue-900"
                >
                  View
                </button>
              {/if}
              {#if onStatusChange && enrollment.status === 'submitted'}
                <span class="text-gray-300">|</span>
                <button
                  onclick={() => onStatusChange(enrollment.id!, 'verified')}
                  class="text-xs text-green-600 hover:text-green-900"
                >
                  Verify
                </button>
              {/if}
              {#if onDelete}
                <span class="text-gray-300">|</span>
                <button
                  onclick={() => {
                    if (confirm('Delete this enrollment?')) {
                      onDelete(enrollment.id!);
                    }
                  }}
                  class="text-xs text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- Loading more indicator -->
  {#if loadingMore}
    <div class="px-6 py-4 text-center border-t">
      <LoadingSpinner size="sm" />
      <span class="ml-2 text-sm text-gray-500">Loading more...</span>
    </div>
  {/if}
  
  <!-- Infinite scroll trigger -->
  <div bind:this={observerTarget} class="h-4"></div>
  
  <!-- No more results -->
  {#if !hasMore && enrollments.length > 0 && !searchInput}
    <div class="px-6 py-4 text-center text-sm text-gray-500 border-t">
      No more enrollments to load
    </div>
  {/if}
</div>