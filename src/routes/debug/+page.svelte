<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase/config';
  import { user, isAuthenticated } from '$lib/stores/auth';
  
  let debugInfo = $state({
    userAuth: false,
    userRole: '',
    newsCount: 0,
    publishedNewsCount: 0,
    teachersCount: 0,
    enrollmentsCount: 0,
    errors: [] as string[]
  });
  
  onMount(async () => {
    // Check auth status
    debugInfo.userAuth = $isAuthenticated;
    debugInfo.userRole = $user?.role || 'none';
    
    // Test news collection
    try {
      const newsSnapshot = await getDocs(collection(db, 'news'));
      debugInfo.newsCount = newsSnapshot.size;
      
      // Don't use compound query until index is created
      // Just count manually for now
      let publishedCount = 0;
      newsSnapshot.forEach(doc => {
        if (doc.data().isPublished === true) {
          publishedCount++;
        }
      });
      debugInfo.publishedNewsCount = publishedCount;
      
      if (newsSnapshot.docs[0]) {
        console.log('Sample news doc:', newsSnapshot.docs[0].data());
      }
    } catch (error) {
      debugInfo.errors.push(`News error: ${error}`);
    }
    
    // Test teachers collection
    try {
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      debugInfo.teachersCount = teachersSnapshot.size;
      console.log('Sample teacher doc:', teachersSnapshot.docs[0]?.data());
    } catch (error) {
      debugInfo.errors.push(`Teachers error: ${error}`);
    }
    
    // Test enrollments (if authenticated)
    if ($isAuthenticated && $user) {
      try {
        const enrollQuery = query(
          collection(db, 'enrollments'),
          where('userId', '==', $user.uid),
          limit(5)
        );
        const enrollSnapshot = await getDocs(enrollQuery);
        debugInfo.enrollmentsCount = enrollSnapshot.size;
      } catch (error) {
        debugInfo.errors.push(`Enrollments error: ${error}`);
      }
    }
  });
</script>

<svelte:head>
  <title>Debug - Firebase Connection</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold mb-8">Firebase Debug Info</h1>
  
  <Card class="mb-6">
    <h2 class="text-xl font-semibold mb-4">Authentication Status</h2>
    <div class="space-y-2 font-mono text-sm">
      <p>Authenticated: <span class={debugInfo.userAuth ? 'text-green-600' : 'text-red-600'}>{debugInfo.userAuth}</span></p>
      <p>User Role: <span class="text-blue-600">{debugInfo.userRole}</span></p>
      {#if $user}
        <p>User Email: <span class="text-gray-600">{$user.email}</span></p>
      {/if}
    </div>
  </Card>
  
  <Card class="mb-6">
    <h2 class="text-xl font-semibold mb-4">Firestore Collections</h2>
    <div class="space-y-2 font-mono text-sm">
      <p>Total News Posts: <span class="text-blue-600">{debugInfo.newsCount}</span></p>
      <p>Published News Posts: <span class="text-green-600">{debugInfo.publishedNewsCount}</span></p>
      <p>Total Teachers: <span class="text-blue-600">{debugInfo.teachersCount}</span></p>
      {#if $isAuthenticated}
        <p>Your Enrollments: <span class="text-blue-600">{debugInfo.enrollmentsCount}</span></p>
      {/if}
    </div>
  </Card>
  
  {#if debugInfo.errors.length > 0}
    <Card class="bg-red-50 border-red-200">
      <h2 class="text-xl font-semibold mb-4 text-red-800">Errors</h2>
      <ul class="space-y-2">
        {#each debugInfo.errors as error}
          <li class="text-sm text-red-700 font-mono">{error}</li>
        {/each}
      </ul>
    </Card>
  {:else}
    <Card class="bg-green-50 border-green-200">
      <p class="text-green-800">✓ All Firebase connections working properly!</p>
    </Card>
  {/if}
  
  <div class="mt-8 text-center">
    <a href="/" class="text-green-600 hover:text-green-700">← Back to Home</a>
  </div>
</div>