<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { enrollmentOps, teacherOps, newsOps } from '$lib/firebase/firestore';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  import type { DashboardStats, Enrollment, NewsPost } from '$lib/types';
  
  let loading = $state(true);
  let stats = $state<DashboardStats>({
    totalEnrollments: 0,
    pendingVerification: 0,
    verifiedToday: 0,
    rejectedCount: 0,
    juniorHighCount: 0,
    seniorHighCount: 0,
    todayApplications: 0,
    weekApplications: 0
  });
  let recentEnrollments = $state<Enrollment[]>([]);
  let recentNews = $state<NewsPost[]>([]);
  let teacherCount = $state(0);
  let activityData = $state<{ date: string; count: number; verified: number; rejected: number }[]>([]);
  
  onMount(async () => {
    try {
      // Load all data in parallel
      const [enrollmentStats, teachers, news, pendingEnrollments, activity] = await Promise.all([
        enrollmentOps.getStats($enrollmentSettings.schoolYear),
        teacherOps.getAll(),
        newsOps.getPublished(5),
        enrollmentOps.getAll({ status: 'submitted', limitCount: 5 }),
        enrollmentOps.getRecentActivity(7)
      ]);
      
      stats = {
        totalEnrollments: enrollmentStats.total,
        pendingVerification: enrollmentStats.submitted,
        verifiedToday: enrollmentStats.verified,
        rejectedCount: enrollmentStats.rejected,
        juniorHighCount: enrollmentStats.junior,
        seniorHighCount: enrollmentStats.senior,
        todayApplications: enrollmentStats.todayCount,
        weekApplications: enrollmentStats.weekCount
      };
      
      teacherCount = teachers.length;
      recentEnrollments = pendingEnrollments;
      recentNews = news;
      activityData = activity;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      loading = false;
    }
  });
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Calculate percentage changes
  const percentageChange = $derived(() => {
    if (stats.weekApplications > 7) {
      const avgDaily = stats.weekApplications / 7;
      const change = ((stats.todayApplications - avgDaily) / avgDaily) * 100;
      return change;
    }
    return 0;
  });
  
  // Get status badge color
  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'printed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Saint Patrick's Academy</title>
</svelte:head>

<div class="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
  <!-- Header with Date - Mobile Optimized -->
  <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
    <div class="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
      <div>
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p class="text-green-100 text-xs sm:text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>
      <div class="text-left sm:text-right">
        <p class="text-xs sm:text-sm text-green-100">Current Date</p>
        <p class="text-sm sm:text-lg md:text-xl font-semibold">{new Date().toLocaleDateString('en-PH', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })}</p>
      </div>
    </div>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else}
    <!-- Enrollment Status Alert - Mobile Optimized -->
    <Card class={`border-2 p-3 sm:p-4 ${$enrollmentSettings.isOpen ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-start sm:items-center gap-3">
          <div class={`p-2 sm:p-3 rounded-full flex-shrink-0 ${$enrollmentSettings.isOpen ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {#if $enrollmentSettings.isOpen}
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {:else}
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            {/if}
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-semibold text-gray-900">
              Enrollment is Currently {$enrollmentSettings.isOpen ? 'Open' : 'Closed'}
            </h3>
            <p class="text-xs sm:text-sm text-gray-600">
              School Year {$enrollmentSettings.schoolYear}
              {#if $enrollmentSettings.isOpen}
                • {$enrollmentSettings.juniorHighOpen && $enrollmentSettings.seniorHighOpen ? 'JHS & SHS' : 
                  $enrollmentSettings.juniorHighOpen ? 'JHS only' : 'SHS only'}
              {/if}
            </p>
          </div>
        </div>
        <a href="/admin/settings" class="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-end sm:justify-start">
          Manage Settings 
          <svg class="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </Card>
    
    <!-- Key Metrics Grid - Mobile Optimized -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Enrollments -->
      <Card class="relative overflow-hidden p-3 sm:p-4">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
          <svg class="w-24 h-24 sm:w-32 sm:h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div class="relative">
          <p class="text-xs sm:text-sm font-medium text-gray-600">Total Enrollments</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.totalEnrollments}</p>
          <div class="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm">
            <span class="text-green-600 font-medium">
              {stats.todayApplications} today
            </span>
            {#if percentageChange() !== 0}
              <span class={`ml-2 flex items-center ${percentageChange() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {#if percentageChange() > 0}
                  <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                {:else}
                  <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                {/if}
                {Math.abs(percentageChange()).toFixed(1)}%
              </span>
            {/if}
          </div>
        </div>
      </Card>
      
      <!-- Pending Verification -->
      <Card class="relative overflow-hidden border-l-4 border-yellow-400 p-3 sm:p-4">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
          <svg class="w-24 h-24 sm:w-32 sm:h-32 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="relative">
          <p class="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 mt-1">{stats.pendingVerification}</p>
          <div class="mt-2 sm:mt-3">
            <a href="/admin/enrollments?status=submitted" class="text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 font-medium">
              Review →
            </a>
          </div>
        </div>
      </Card>
      
      <!-- Verified Today -->
      <Card class="relative overflow-hidden border-l-4 border-green-400 p-3 sm:p-4">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
          <svg class="w-24 h-24 sm:w-32 sm:h-32 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="relative">
          <p class="text-xs sm:text-sm font-medium text-gray-600">Verified Today</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1">{stats.verifiedToday}</p>
          <div class="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
            {stats.weekApplications} this week
          </div>
        </div>
      </Card>
      
      <!-- Rejected Applications -->
      <Card class="relative overflow-hidden border-l-4 border-red-400 p-3 sm:p-4">
        <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
          <svg class="w-24 h-24 sm:w-32 sm:h-32 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="relative">
          <p class="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mt-1">{stats.rejectedCount}</p>
          <div class="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
            {stats.totalEnrollments > 0 ? ((stats.rejectedCount / stats.totalEnrollments) * 100).toFixed(1) : 0}% rate
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Charts Section - Mobile Optimized -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Weekly Activity Chart -->
      <Card class="p-3 sm:p-4">
        <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Weekly Activity</h3>
        <div class="h-64 sm:h-72">
          <!-- Bar chart -->
          <div class="h-48 sm:h-52">
            <div class="flex items-end justify-between h-full space-x-1 sm:space-x-2">
              {#each activityData as day}
                <div class="flex-1 flex flex-col items-center justify-end h-full">
                  <!-- Stacked bar -->
                  <div class="w-full flex flex-col-reverse relative rounded-t" style="height: {day.count > 0 ? (day.count / Math.max(...activityData.map(d => d.count))) * 100 : 0}%">
                    <!-- Total count inside bar -->
                    {#if day.count > 0}
                      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="text-xs sm:text-sm font-bold text-white drop-shadow-lg">
                          {day.count}
                        </span>
                      </div>
                    {/if}
                    
                    <!-- Verified (green) - bottom -->
                    {#if day.verified > 0}
                      <div 
                        class="w-full bg-green-500 first:rounded-b"
                        style="height: {(day.verified / day.count) * 100}%"
                      ></div>
                    {/if}
                    
                    <!-- Pending (yellow) - middle -->
                    {#if (day.count - day.verified - day.rejected) > 0}
                      <div 
                        class="w-full bg-yellow-500"
                        style="height: {((day.count - day.verified - day.rejected) / day.count) * 100}%"
                      ></div>
                    {/if}
                    
                    <!-- Rejected (red) - top -->
                    {#if day.rejected > 0}
                      <div 
                        class="w-full bg-red-500 last:rounded-t"
                        style="height: {(day.rejected / day.count) * 100}%"
                      ></div>
                    {/if}
                  </div>
                  
                  <!-- If no data, show empty indicator -->
                  {#if day.count === 0}
                    <div class="w-full h-1 bg-gray-200 rounded"></div>
                  {/if}
                  
                  <!-- Day label -->
                  <p class="text-xs text-gray-600 mt-2">
                    {new Date(day.date).toLocaleDateString('en-PH', { weekday: 'short' }).slice(0, 3)}
                  </p>
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Legend -->
          <div class="flex items-center justify-center mt-6 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded mr-1.5"></div>
              <span>Verified</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-yellow-500 rounded mr-1.5"></div>
              <span>Pending</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded mr-1.5"></div>
              <span>Rejected</span>
            </div>
          </div>
        </div>
      </Card>
      
      <!-- Enrollment Distribution -->
      <Card class="p-3 sm:p-4">
        <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Enrollment Distribution</h3>
        <div class="space-y-4 sm:space-y-6">
          <!-- JHS vs SHS -->
          <div>
            <div class="flex justify-between mb-1.5 sm:mb-2">
              <span class="text-xs sm:text-sm font-medium text-gray-700">Junior High School</span>
              <span class="text-xs sm:text-sm font-medium text-gray-700">{stats.juniorHighCount} ({stats.totalEnrollments > 0 ? ((stats.juniorHighCount / stats.totalEnrollments) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
              <div 
                class="bg-gradient-to-r from-green-500 to-green-600 h-2.5 sm:h-3 rounded-full transition-all duration-500" 
                style="width: {stats.totalEnrollments > 0 ? (stats.juniorHighCount / stats.totalEnrollments * 100) : 0}%"
              ></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between mb-1.5 sm:mb-2">
              <span class="text-xs sm:text-sm font-medium text-gray-700">Senior High School</span>
              <span class="text-xs sm:text-sm font-medium text-gray-700">{stats.seniorHighCount} ({stats.totalEnrollments > 0 ? ((stats.seniorHighCount / stats.totalEnrollments) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
              <div 
                class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 sm:h-3 rounded-full transition-all duration-500" 
                style="width: {stats.totalEnrollments > 0 ? (stats.seniorHighCount / stats.totalEnrollments * 100) : 0}%"
              ></div>
            </div>
          </div>
          
          <!-- Status breakdown -->
          <div class="pt-3 sm:pt-4 border-t">
            <h4 class="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Status Breakdown</h4>
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <div class="flex items-center justify-between p-1.5 sm:p-2 bg-yellow-50 rounded text-xs sm:text-sm">
                <span class="text-yellow-700">Submitted</span>
                <span class="font-semibold text-yellow-700">{stats.pendingVerification}</span>
              </div>
              <div class="flex items-center justify-between p-1.5 sm:p-2 bg-green-50 rounded text-xs sm:text-sm">
                <span class="text-green-700">Verified</span>
                <span class="font-semibold text-green-700">{stats.verifiedToday}</span>
              </div>
              <div class="flex items-center justify-between p-1.5 sm:p-2 bg-blue-50 rounded text-xs sm:text-sm">
                <span class="text-blue-700">Printed</span>
                <span class="font-semibold text-blue-700">{stats.totalEnrollments - stats.pendingVerification - stats.verifiedToday - stats.rejectedCount}</span>
              </div>
              <div class="flex items-center justify-between p-1.5 sm:p-2 bg-red-50 rounded text-xs sm:text-sm">
                <span class="text-red-700">Rejected</span>
                <span class="font-semibold text-red-700">{stats.rejectedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Recent Activity Section - Mobile Optimized -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Recent Enrollments -->
      <Card class="p-3 sm:p-4">
        <div class="flex justify-between items-center mb-3 sm:mb-4">
          <h3 class="text-sm sm:text-base lg:text-lg font-semibold">Recent Applications</h3>
          <a href="/admin/enrollments" class="text-xs sm:text-sm text-green-600 hover:text-green-700">
            View all →
          </a>
        </div>
        
        {#if recentEnrollments.length === 0}
          <div class="text-center py-6 sm:py-8">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-xs sm:text-sm text-gray-500">No pending applications</p>
          </div>
        {:else}
          <div class="space-y-2 sm:space-y-3">
            {#each recentEnrollments as enrollment}
              <div class="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-green-700 font-semibold text-xs sm:text-sm">
                      {enrollment.fullName.charAt(0)}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 text-xs sm:text-sm truncate">{enrollment.fullName}</p>
                    <p class="text-xs text-gray-600 truncate">
                      {enrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {enrollment.gradeLevel}
                      {enrollment.type === 'senior' ? ` - ${enrollment.strand}` : ''}
                    </p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0 ml-2">
                  <span class={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(enrollment.status)}`}>
                    {enrollment.status}
                  </span>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {formatDate(enrollment.submittedAt)}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
      
      <!-- Quick Stats -->
      <Card class="p-3 sm:p-4">
        <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Additional Metrics</h3>
        <div class="grid grid-cols-2 gap-2 sm:gap-4">
          <div class="bg-purple-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-purple-600">Total Teachers</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700">{teacherCount}</p>
              </div>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <a href="/admin/teachers" class="text-xs text-purple-600 hover:text-purple-700 mt-1 sm:mt-2 inline-block">
              Manage →
            </a>
          </div>
          
          <div class="bg-indigo-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-indigo-600">News Posts</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-700">{recentNews.length}</p>
              </div>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <a href="/admin/news" class="text-xs text-indigo-600 hover:text-indigo-700 mt-1 sm:mt-2 inline-block">
              Manage →
            </a>
          </div>
          
          <div class="bg-pink-50 rounded-lg p-3 sm:p-4 col-span-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-pink-600">Average Processing Time</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-bold text-pink-700">2.5 days</p>
              </div>
              <svg class="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-xs text-pink-600 mt-1 sm:mt-2">From submission to verification</p>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Quick Actions - Mobile Optimized with proper padding -->
    <Card class="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <a 
          href="/admin/enrollments?status=submitted" 
          class="group text-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-200 transition-colors">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-medium text-gray-900">Verify Applications</p>
          {#if stats.pendingVerification > 0}
            <span class="inline-flex items-center justify-center px-2 py-1 mt-2 text-xs font-bold text-yellow-700 bg-yellow-200 rounded-full">
              {stats.pendingVerification}
            </span>
          {/if}
        </a>
        
        <a 
          href="/admin/teachers/new" 
          class="group text-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-medium text-gray-900">Add Teacher</p>
        </a>
        
        <a 
          href="/admin/news/new" 
          class="group text-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-medium text-gray-900">Create News</p>
        </a>
        
        <a 
          href="/admin/settings" 
          class="group text-center p-4 sm:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-medium text-gray-900">Settings</p>
        </a>
      </div>
    </Card>
  {/if}
</div>