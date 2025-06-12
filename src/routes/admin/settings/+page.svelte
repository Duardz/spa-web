<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase/config';
  
  let saving = $state(false);
  let loading = $state(true);
  let message = $state('');
  
  // Local form state
  let formData = $state({
    isOpen: false,
    schoolYear: '2025-2026',
    juniorHighOpen: true,
    seniorHighOpen: true,
    message: ''
  });
  
  async function loadSettings() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'enrollment'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        formData = {
          isOpen: data.isOpen || false,
          schoolYear: data.schoolYear || '2025-2026',
          juniorHighOpen: data.juniorHighOpen !== false,
          seniorHighOpen: data.seniorHighOpen !== false,
          message: data.message || ''
        };
        enrollmentSettings.setSettings(formData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      message = 'Failed to load settings';
    } finally {
      loading = false;
    }
  }
  
  async function saveSettings() {
    saving = true;
    message = '';
    
    try {
      await setDoc(doc(db, 'settings', 'enrollment'), formData);
      enrollmentSettings.setSettings(formData);
      message = 'Settings saved successfully!';
    } catch (error) {
      console.error('Error saving settings:', error);
      message = 'Failed to save settings';
    } finally {
      saving = false;
    }
  }
  
  onMount(() => {
    loadSettings();
  });
</script>

<svelte:head>
  <title>Settings - Saint Patrick's Academy Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
    <p class="text-gray-600">Manage enrollment and system settings</p>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else}
    <!-- Enrollment Settings -->
    <Card>
      <h2 class="text-xl font-semibold mb-6">Enrollment Settings</h2>
      
      <form onsubmit={(e) => { e.preventDefault(); saveSettings(); }} class="space-y-6">
        <!-- School Year -->
        <div>
          <label for="schoolYear" class="block text-sm font-medium text-gray-700 mb-1">
            School Year
          </label>
          <input
            type="text"
            id="schoolYear"
            bind:value={formData.schoolYear}
            placeholder="e.g., 2025-2026"
            class="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
          <p class="mt-1 text-sm text-gray-500">
            Format: YYYY-YYYY (e.g., 2025-2026)
          </p>
        </div>
        
        <!-- Enrollment Status -->
        <div>
          <div class="block text-sm font-medium text-gray-700 mb-3">
            Enrollment Status
          </div>
          <div class="space-y-3">
            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={formData.isOpen}
                class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
              />
              <div>
                <span class="text-sm font-medium text-gray-900">Enrollment is Open</span>
                <p class="text-sm text-gray-500">Allow students to submit online enrollment forms</p>
              </div>
            </label>
            
            <div class="ml-7 space-y-2">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={formData.juniorHighOpen}
                  disabled={!formData.isOpen}
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                />
                <span class="text-sm text-gray-700">Accept Junior High School enrollments</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={formData.seniorHighOpen}
                  disabled={!formData.isOpen}
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                />
                <span class="text-sm text-gray-700">Accept Senior High School enrollments</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Custom Message -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
            Custom Message (Optional)
          </label>
          <textarea
            id="message"
            bind:value={formData.message}
            rows="3"
            placeholder="Message to display when enrollment is closed"
            class="w-full max-w-lg border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">
            This message will be shown to students when enrollment is closed
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <Button type="submit" variant="primary" loading={saving}>
            Save Settings
          </Button>
          
          {#if message}
            <span class={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </span>
          {/if}
        </div>
      </form>
    </Card>
    
    <!-- Archive Settings -->
    <Card>
      <h2 class="text-xl font-semibold mb-6">Data Management</h2>
      
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Archive Enrollments</h3>
          <p class="text-sm text-gray-600 mb-4">
            Archive old enrollment data to keep the system running efficiently. 
            Archived data will be exported and then removed from the active database.
          </p>
          <Button variant="outline">
            Archive Previous School Year
          </Button>
        </div>
        
        <div class="pt-4 border-t">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Export Data</h3>
          <p class="text-sm text-gray-600 mb-4">
            Export all enrollment data for backup or analysis purposes.
          </p>
          <div class="flex space-x-3">
            <Button variant="outline">Export All Enrollments (CSV)</Button>
            <Button variant="outline">Export Teachers (CSV)</Button>
          </div>
        </div>
      </div>
    </Card>
    
    <!-- System Info -->
    <Card class="bg-gray-50">
      <h2 class="text-xl font-semibold mb-4">System Information</h2>
      
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt class="text-gray-500">Database</dt>
          <dd class="font-medium">Firebase Firestore</dd>
        </div>
        <div>
          <dt class="text-gray-500">Hosting</dt>
          <dd class="font-medium">Vercel</dd>
        </div>
        <div>
          <dt class="text-gray-500">Framework</dt>
          <dd class="font-medium">SvelteKit v2.16</dd>
        </div>
        <div>
          <dt class="text-gray-500">Last Deployment</dt>
          <dd class="font-medium">{new Date().toLocaleDateString('en-PH')}</dd>
        </div>
      </dl>
    </Card>
  {/if}
</div>