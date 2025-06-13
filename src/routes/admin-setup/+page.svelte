<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import { user, isAuthenticated } from '$lib/stores/auth';
  
  let showUserId = $state(false);
</script>

<svelte:head>
  <title>Admin Setup Guide - Saint Patrick's Academy</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Setup Guide</h1>
  
  <Card class="mb-6">
    <h2 class="text-xl font-semibold mb-4">How to Set Up Admin Access</h2>
    
    <div class="space-y-4">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          <strong>Note:</strong> Only authorized personnel should have admin access. 
          This guide is for IT administrators setting up the system.
        </p>
      </div>
      
      <ol class="space-y-4">
        <li>
          <h3 class="font-semibold">Step 1: Sign in with Google</h3>
          <p class="text-gray-600 mt-1">
            First, sign in using the Google account that should have admin access.
          </p>
          {#if !$isAuthenticated}
            <a href="/signin" class="text-green-600 hover:text-green-700 text-sm">
              → Sign in now
            </a>
          {:else}
            <p class="text-sm text-green-600 mt-1">
              ✓ You are currently signed in as: {$user?.email}
            </p>
          {/if}
        </li>
        
        <li>
          <h3 class="font-semibold">Step 2: Get Your User ID</h3>
          <p class="text-gray-600 mt-1">
            After signing in, you'll need your unique user ID to grant admin access.
          </p>
          {#if $isAuthenticated}
            <button 
              onclick={() => showUserId = !showUserId}
              class="mt-2 text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              {showUserId ? 'Hide' : 'Show'} My User ID
            </button>
            {#if showUserId}
              <div class="mt-2 p-3 bg-gray-50 rounded font-mono text-sm break-all">
                {$user?.uid}
              </div>
            {/if}
          {/if}
        </li>
        
        <li>
          <h3 class="font-semibold">Step 3: Update User Role in Firebase</h3>
          <p class="text-gray-600 mt-1">
            Go to the Firebase Console and update the user's role:
          </p>
          <ol class="mt-2 ml-4 space-y-2 text-sm text-gray-600">
            <li>1. Open Firebase Console → Firestore Database</li>
            <li>2. Navigate to the <code class="bg-gray-100 px-1">users</code> collection</li>
            <li>3. Find the document with the User ID from Step 2</li>
            <li>4. Edit the document and change <code class="bg-gray-100 px-1">role</code> from <code class="bg-gray-100 px-1">"student"</code> to <code class="bg-gray-100 px-1">"admin"</code></li>
            <li>5. Save the changes</li>
          </ol>
        </li>
        
        <li>
          <h3 class="font-semibold">Step 4: Sign Out and Sign In Again</h3>
          <p class="text-gray-600 mt-1">
            After updating the role, sign out and sign back in to refresh your permissions.
          </p>
          {#if $isAuthenticated}
            <button 
              onclick={() => user.signOut()}
              class="mt-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Sign Out
            </button>
          {/if}
        </li>
        
        <li>
          <h3 class="font-semibold">Step 5: Access Admin Dashboard</h3>
          <p class="text-gray-600 mt-1">
            Once you have admin role, you can access the admin dashboard from the header or directly at:
          </p>
          <a href="/admin" class="text-green-600 hover:text-green-700 text-sm">
            → /admin
          </a>
        </li>
      </ol>
    </div>
  </Card>
  
  <Card class="bg-blue-50 border-blue-200">
    <h3 class="font-semibold text-blue-900 mb-2">Security Notes</h3>
    <ul class="space-y-1 text-sm text-blue-800">
      <li>• Only grant admin access to trusted school staff</li>
      <li>• Regularly review and audit admin users</li>
      <li>• Remove admin access when staff members leave</li>
      <li>• Keep this setup guide URL private and secure</li>
    </ul>
  </Card>
  
  <div class="mt-8 text-center">
    <a href="/" class="text-green-600 hover:text-green-700">
      ← Back to Homepage
    </a>
  </div>
</div>