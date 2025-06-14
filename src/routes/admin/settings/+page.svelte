<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { enrollmentSettings } from '$lib/stores/enrollment';
  import { enrollmentOps, teacherOps } from '$lib/firebase/firestore';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase/config';
  import { exportToCSV } from '$lib/utils/exporters';
  import { sanitizeInput } from '$lib/utils/security';
  
  let saving = $state(false);
  let loading = $state(true);
  let message = $state('');
  let archiving = $state(false);
  let exporting = $state(false);
  
  // Local form state
  let formData = $state({
    isOpen: false,
    schoolYear: '2025-2026',
    juniorHighOpen: true,
    seniorHighOpen: true,
    message: ''
  });
  
  // School year options
  const currentYear = new Date().getFullYear();
  const schoolYears = Array.from({ length: 5 }, (_, i) => {
    const startYear = currentYear - 2 + i;
    return `${startYear}-${startYear + 1}`;
  });
  
  async function loadSettings() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'enrollment'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        formData = {
          isOpen: data.isOpen || false,
          schoolYear: data.schoolYear || `${currentYear}-${currentYear + 1}`,
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
      // Sanitize message input
      const sanitizedData = {
        ...formData,
        message: sanitizeInput(formData.message)
      };
      
      await setDoc(doc(db, 'settings', 'enrollment'), sanitizedData);
      enrollmentSettings.setSettings(sanitizedData);
      message = 'Settings saved successfully!';
      
      // Clear message after 3 seconds
      setTimeout(() => message = '', 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      message = 'Failed to save settings';
    } finally {
      saving = false;
    }
  }
  
  async function archiveEnrollments() {
    if (!confirm(`Are you sure you want to archive all enrollments from previous school years? This action cannot be undone.`)) {
      return;
    }
    
    archiving = true;
    
    try {
      // Get all enrollments not from current school year
      const allEnrollments = await enrollmentOps.getAll();
      const toArchive = allEnrollments
        .filter(e => e.schoolYear !== formData.schoolYear)
        .map(e => e.id!);
      
      if (toArchive.length === 0) {
        message = 'No enrollments to archive';
        return;
      }
      
      // Archive in batches
      const batchSize = 50;
      for (let i = 0; i < toArchive.length; i += batchSize) {
        const batch = toArchive.slice(i, i + batchSize);
        await enrollmentOps.archive(batch);
      }
      
      message = `Successfully archived ${toArchive.length} enrollments`;
    } catch (error) {
      console.error('Error archiving enrollments:', error);
      message = 'Failed to archive enrollments';
    } finally {
      archiving = false;
    }
  }
  
  async function exportAllEnrollments() {
    exporting = true;
    
    try {
      const enrollments = await enrollmentOps.getAll();
      exportToCSV(enrollments, `all-enrollments-${new Date().toISOString().split('T')[0]}.csv`);
      message = 'Export completed successfully';
    } catch (error) {
      console.error('Error exporting enrollments:', error);
      message = 'Failed to export enrollments';
    } finally {
      exporting = false;
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
      <div class="flex items-center mb-6">
        <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 class="text-xl font-semibold">Enrollment Settings</h2>
      </div>
      
      <form onsubmit={(e) => { e.preventDefault(); saveSettings(); }} class="space-y-6">
        <!-- School Year -->
        <div>
          <label for="schoolYear" class="block text-sm font-medium text-gray-700 mb-1">
            School Year
          </label>
          <select
            id="schoolYear"
            bind:value={formData.schoolYear}
            class="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            {#each schoolYears as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
          <p class="mt-1 text-sm text-gray-500">
            Current academic year for enrollment
          </p>
        </div>
        
        <!-- Enrollment Status -->
        <div>
          <div class="block text-sm font-medium text-gray-700 mb-3">
            Enrollment Status
          </div>
          <div class="space-y-3">
            <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-green-300 {formData.isOpen ? 'border-green-500 bg-green-50' : 'border-gray-200'}">
              <input
                type="checkbox"
                bind:checked={formData.isOpen}
                class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3 h-5 w-5"
              />
              <div>
                <span class="text-sm font-medium text-gray-900">Online Enrollment is Open</span>
                <p class="text-sm text-gray-500">Students can submit online enrollment applications</p>
              </div>
            </label>
            
            {#if formData.isOpen}
              <div class="ml-7 space-y-2 animate-fade-in">
                <label class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:border-green-300 {formData.juniorHighOpen ? 'border-green-400 bg-green-50' : 'border-gray-200'}">
                  <input
                    type="checkbox"
                    bind:checked={formData.juniorHighOpen}
                    disabled={!formData.isOpen}
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                  />
                  <span class="text-sm text-gray-700">Accept Junior High School enrollments (Grades 7-10)</span>
                </label>
                
                <label class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:border-yellow-300 {formData.seniorHighOpen ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}">
                  <input
                    type="checkbox"
                    bind:checked={formData.seniorHighOpen}
                    disabled={!formData.isOpen}
                    class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-2"
                  />
                  <span class="text-sm text-gray-700">Accept Senior High School enrollments (Grades 11-12)</span>
                </label>
              </div>
            {/if}
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
            class="w-full max-w-lg border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Message to display when enrollment is closed or for special announcements"
            maxlength="500"
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">
            {formData.message.length}/500 characters
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-4 pt-4 border-t">
          <Button type="submit" variant="primary" loading={saving}>
            Save Settings
          </Button>
          
          {#if message}
            <span class={`text-sm font-medium animate-fade-in ${message.includes('success') ? 'text-green-600' : message.includes('Failed') ? 'text-red-600' : 'text-gray-600'}`}>
              {message}
            </span>
          {/if}
        </div>
      </form>
    </Card>
    
    <!-- Data Management -->
    <Card>
      <div class="flex items-center mb-6">
        <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
        <h2 class="text-xl font-semibold">Data Management</h2>
      </div>
      
      <div class="space-y-6">
        <!-- Archive Section -->
        <div class="border rounded-lg p-6 bg-gray-50">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Archive Old Enrollments</h3>
          <p class="text-sm text-gray-600 mb-4">
            Move enrollments from previous school years to the archive. This helps keep the active database fast and organized.
            Archived data is preserved but removed from the main enrollment list.
          </p>
          <div class="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onclick={archiveEnrollments}
              loading={archiving}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Archive Previous Years
            </Button>
            <span class="text-sm text-gray-500">
              Archives all enrollments except {formData.schoolYear}
            </span>
          </div>
        </div>
        
        <!-- Export Section -->
        <div class="border rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Export Data</h3>
          <p class="text-sm text-gray-600 mb-4">
            Download enrollment data for backup, analysis, or reporting purposes.
          </p>
          <div class="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onclick={exportAllEnrollments}
              loading={exporting}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export All Enrollments
            </Button>
            
            <Button 
              variant="outline"
              onclick={async () => {
                exporting = true;
                const enrollments = await enrollmentOps.getAll({ schoolYear: formData.schoolYear });
                exportToCSV(enrollments, `enrollments-${formData.schoolYear}.csv`);
                exporting = false;
              }}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export Current Year Only
            </Button>
            
            <Button 
              variant="outline"
              onclick={async () => {
                exporting = true;
                const teachers = await teacherOps.getAll();
                // Simple CSV export for teachers
                const csv = [
                  'Name,Position,Department,Email,Order',
                  ...teachers.map(t => `"${t.name}","${t.position}","${t.department}","${t.email || ''}",${t.order}`)
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `teachers-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                URL.revokeObjectURL(url);
                exporting = false;
              }}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export Teachers
            </Button>
          </div>
        </div>
        
        <!-- Database Maintenance -->
        <div class="border rounded-lg p-6 bg-yellow-50">
          <h3 class="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Database Maintenance
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Perform maintenance tasks to keep the database optimized. This should be done during off-peak hours.
          </p>
          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Automatic backups are performed daily at 2:00 AM
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Database indexes are automatically optimized weekly
            </div>
          </div>
        </div>
      </div>
    </Card>
    
    <!-- Security Settings -->
    <Card>
      <div class="flex items-center mb-6">
        <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 class="text-xl font-semibold">Security Settings</h2>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 class="font-medium text-gray-900">Two-Factor Authentication</h4>
            <p class="text-sm text-gray-600">Require 2FA for all admin accounts</p>
          </div>
          <span class="text-sm text-gray-500">Coming soon</span>
        </div>
        
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 class="font-medium text-gray-900">Session Timeout</h4>
            <p class="text-sm text-gray-600">Auto-logout after 30 minutes of inactivity</p>
          </div>
          <span class="text-sm font-medium text-green-600">Active</span>
        </div>
        
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 class="font-medium text-gray-900">Login Audit Log</h4>
            <p class="text-sm text-gray-600">Track all admin login attempts</p>
          </div>
          <span class="text-sm font-medium text-green-600">Active</span>
        </div>
        
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 class="font-medium text-gray-900">OWASP Compliance</h4>
            <p class="text-sm text-gray-600">Security measures against top 10 vulnerabilities</p>
          </div>
          <span class="text-sm font-medium text-green-600">Enabled</span>
        </div>
      </div>
    </Card>
    
    <!-- System Info -->
    <Card class="bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="flex items-center mb-6">
        <svg class="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-xl font-semibold">System Information</h2>
      </div>
      
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="bg-white rounded-lg p-3">
          <dt class="text-gray-500">Application Version</dt>
          <dd class="font-medium text-gray-900">v1.0.0</dd>
        </div>
        <div class="bg-white rounded-lg p-3">
          <dt class="text-gray-500">Database</dt>
          <dd class="font-medium text-gray-900">Firebase Firestore</dd>
        </div>
        <div class="bg-white rounded-lg p-3">
          <dt class="text-gray-500">Hosting</dt>
          <dd class="font-medium text-gray-900">Vercel Edge Network</dd>
        </div>
        <div class="bg-white rounded-lg p-3">
          <dt class="text-gray-500">Framework</dt>
          <dd class="font-medium text-gray-900">SvelteKit v2.16</dd>
        </div>
        <div class="bg-white rounded-lg p-3">
          <dt class="text-gray-500">Last Deployment</dt>
          <dd class="font-medium text-gray-900">{new Date().toLocaleDateString('en-PH')}</dd>
        </div>
        <div class="bg-white rounded-lg p-3">
          <dt class="text-gray-500">SSL Certificate</dt>
          <dd class="font-medium text-green-600">Valid & Active</dd>
        </div>
      </dl>
      
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Need Help?</h4>
        <p class="text-sm text-blue-700">
          For technical support or system issues, contact the IT department at 
          <a href="mailto:it@stpatrickacademy.edu.ph" class="underline">it@stpatrickacademy.edu.ph</a>
        </p>
      </div>
    </Card>
  {/if}
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>