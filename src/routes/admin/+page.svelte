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
    juniorHighCount: 0,
    seniorHighCount: 0
  });
  let recentEnrollments = $state<Enrollment[]>([]);
  let recentNews = $state<NewsPost[]>([]);
  let teacherCount = $state(0);
  
  onMount(async () => {
    try {
      // Load statistics
      const [enrollmentStats, teachers, news, pendingEnrollments] = await Promise.all([
        enrollmentOps.getStats(),
        teacherOps.getAll(),
        newsOps.getPublished(5),
        enrollmentOps.getByStatus('submitted', 5)
      ]);
      
      stats = {
        totalEnrollments: enrollmentStats.total,
        pendingVerification: enrollmentStats.submitted,
        verifiedToday: enrollmentStats.verified, // This would need date filtering in real app
        juniorHighCount: enrollmentStats.junior,
        seniorHighCount: enrollmentStats.senior
      };
      
      teacherCount = teachers.length;
      recentEnrollments = pendingEnrollments;
      recentNews = news;
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
</script>

<svelte:head>
  <title>Admin Dashboard - Saint Patrick's Academy</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-600">Welcome back! Here's an overview of your school's activity.</p>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else}
    <!-- Enrollment Status Alert -->
    <Card class={$enrollmentSettings.isOpen ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class={`p-3 rounded-full ${$enrollmentSettings.isOpen ? 'bg-green-100' : 'bg-yellow-100'} mr-4`}>
            <svg class={`w-6 h-6 ${$enrollmentSettings.isOpen ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">
              Enrollment Status: {$enrollmentSettings.isOpen ? 'Open' : 'Closed'}
            </h3>
            <p class="text-gray-600">
              School Year {$enrollmentSettings.schoolYear}
            </p>
          </div>
        </div>
        <a href="/admin/settings" class="text-green-600 hover:text-green-700 font-medium">
          Manage Settings →
        </a>
      </div>
    </Card>
    
    <!-- Statistics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Enrollments</p>
            <p class="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Verification</p>
            <p class="text-3xl font-bold text-yellow-600">{stats.pendingVerification}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Teachers</p>
            <p class="text-3xl font-bold text-gray-900">{teacherCount}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active News Posts</p>
            <p class="text-3xl font-bold text-gray-900">{recentNews.length}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Enrollment Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 class="text-lg font-semibold mb-4">Enrollment Distribution</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">Junior High School</span>
              <span class="text-sm font-medium text-gray-700">{stats.juniorHighCount}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full" 
                style="width: {stats.totalEnrollments > 0 ? (stats.juniorHighCount / stats.totalEnrollments * 100) : 0}%"
              ></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">Senior High School</span>
              <span class="text-sm font-medium text-gray-700">{stats.seniorHighCount}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-yellow-500 h-2 rounded-full" 
                style="width: {stats.totalEnrollments > 0 ? (stats.seniorHighCount / stats.totalEnrollments * 100) : 0}%"
              ></div>
            </div>
          </div>
        </div>
      </Card>
      
      <!-- Recent Enrollments -->
      <Card>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Recent Enrollments</h3>
          <a href="/admin/enrollments" class="text-sm text-green-600 hover:text-green-700">
            View all →
          </a>
        </div>
        
        {#if recentEnrollments.length === 0}
          <p class="text-gray-500 text-center py-4">No pending enrollments</p>
        {:else}
          <div class="space-y-3">
            {#each recentEnrollments as enrollment}
              <div class="flex items-center justify-between py-2 border-b last:border-0">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {enrollment.fullName}
                  </p>
                  <p class="text-xs text-gray-500">
                    {enrollment.type === 'junior' ? 'JHS' : 'SHS'} Grade {enrollment.gradeLevel}
                  </p>
                </div>
                <span class="text-xs text-gray-500">
                  {formatDate(enrollment.submittedAt)}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    </div>
    
    <!-- Recent News -->
    <Card>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Recent News Posts</h3>
        <a href="/admin/news" class="text-sm text-green-600 hover:text-green-700">
          View all →
        </a>
      </div>
      
      {#if recentNews.length === 0}
        <p class="text-gray-500 text-center py-4">No news posts published</p>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each recentNews.slice(0, 3) as post}
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-1 line-clamp-1">{post.title}</h4>
              <p class="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-xs text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('en-PH')}
                </span>
                <a 
                  href="/admin/news/{post.id}" 
                  class="text-xs text-green-600 hover:text-green-700"
                >
                  Edit →
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </Card>
    
    <!-- Quick Actions -->
    <Card class="bg-gray-50">
      <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a 
          href="/admin/enrollments?status=submitted" 
          class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <svg class="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">Verify Enrollments</p>
        </a>
        
        <a 
          href="/admin/teachers/new" 
          class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p class="text-sm font-medium">Add Teacher</p>
        </a>
        
        <a 
          href="/admin/news/new" 
          class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <svg class="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p class="text-sm font-medium">Create News Post</p>
        </a>
        
        <a 
          href="/admin/settings" 
          class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <svg class="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <p class="text-sm font-medium">Manage Settings</p>
        </a>
      </div>
    </Card>
  {/if}
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 1;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
</style>