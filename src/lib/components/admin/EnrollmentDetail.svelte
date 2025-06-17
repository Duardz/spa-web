<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import type { Enrollment, EnrollmentStatus } from '$lib/types';
  
  interface Props {
    enrollment: Enrollment;
    onClose: () => void;
    onStatusChange: (id: string, status: EnrollmentStatus) => void;
    onReject: (id: string) => void;
    isUpdating?: boolean;
  }
  
  let { enrollment, onClose, onStatusChange, onReject, isUpdating = false }: Props = $props();
  
  // Tab state for mobile view
  let activeTab = $state<'personal' | 'academic' | 'documents' | 'system'>('personal');
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatBirthDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function getStatusActions() {
    const actions: Array<{
      label: string;
      status: EnrollmentStatus;
      variant: 'primary' | 'outline' | 'danger';
      icon: string;
    }> = [];
    
    switch (enrollment.status) {
      case 'submitted':
        actions.push({ 
          label: 'Verify', 
          status: 'verified', 
          variant: 'primary',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        });
        actions.push({ 
          label: 'Reject', 
          status: 'rejected', 
          variant: 'danger',
          icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
        });
        break;
      case 'verified':
        actions.push({ 
          label: 'Mark as Printed', 
          status: 'printed', 
          variant: 'primary',
          icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
        });
        actions.push({ 
          label: 'Revert', 
          status: 'submitted', 
          variant: 'outline',
          icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6'
        });
        break;
      case 'printed':
        actions.push({ 
          label: 'Archive', 
          status: 'archived', 
          variant: 'outline',
          icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
        });
        break;
      case 'rejected':
        actions.push({ 
          label: 'Revert to Submitted', 
          status: 'submitted', 
          variant: 'primary',
          icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6'
        });
        break;
    }
    
    return actions;
  }
  
  function getStatusConfig(status: EnrollmentStatus) {
    const configs = {
      submitted: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        label: 'Pending Verification'
      },
      verified: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        label: 'Verified'
      },
      printed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
        label: 'Printed'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        label: 'Rejected'
      },
      archived: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        label: 'Archived'
      }
    };
    return configs[status];
  }
  
  function handlePrint() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow pop-ups for this site to print');
      return;
    }
    
    // Build the HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Enrollment Application - ${enrollment.fullName}</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          
          .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #111827;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 0.5rem 0;
          }
          
          .header p {
            margin: 0;
            color: #4b5563;
          }
          
          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 0.875rem;
            margin: 1rem 0;
            ${enrollment.status === 'submitted' ? 'background: #fef3c7; color: #92400e; border: 1px solid #fcd34d;' : ''}
            ${enrollment.status === 'verified' ? 'background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7;' : ''}
            ${enrollment.status === 'printed' ? 'background: #dbeafe; color: #1e40af; border: 1px solid #60a5fa;' : ''}
            ${enrollment.status === 'rejected' ? 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;' : ''}
            ${enrollment.status === 'archived' ? 'background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db;' : ''}
          }
          
          .section {
            margin-bottom: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            overflow: hidden;
            page-break-inside: avoid;
          }
          
          .section-header {
            background: #f9fafb;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            font-weight: bold;
            font-size: 1.125rem;
          }
          
          .section-content {
            padding: 1rem;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .info-item {
            margin-bottom: 0.75rem;
          }
          
          .info-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 0.875rem;
          }
          
          .info-value {
            color: #111827;
            margin-top: 0.25rem;
          }
          
          .document-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }
          
          .document-item {
            padding: 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .document-item.has {
            background: #f0fdf4;
            border: 1px solid #86efac;
            color: #15803d;
          }
          
          .document-item.missing {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            color: #6b7280;
          }
          
          .check-icon, .x-icon {
            width: 16px;
            height: 16px;
          }
          
          .achievement-badge {
            display: inline-block;
            padding: 0.375rem 0.75rem;
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 9999px;
            color: #92400e;
            font-size: 0.875rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .rejection-box {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 0.375rem;
            padding: 1rem;
            margin: 1rem 0;
            color: #991b1b;
          }
          
          .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.75rem;
            color: #6b7280;
          }
          
          .signature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4rem;
            margin-top: 3rem;
          }
          
          .signature-line {
            border-top: 1px solid #111827;
            padding-top: 0.5rem;
            text-align: center;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>St. Patrick's Academy</h1>
          <p>Enrollment Application Form</p>
          <p>School Year: ${enrollment.schoolYear}</p>
        </div>
        
        <div style="text-align: center;">
          <span class="status-badge">${getStatusConfig(enrollment.status).label}</span>
        </div>
        
        <div class="section">
          <div class="section-header">Personal Information</div>
          <div class="section-content">
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${enrollment.fullName || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">LRN</div>
                  <div class="info-value">${enrollment.lrn || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Birth Date</div>
                  <div class="info-value">${enrollment.birthDate ? formatBirthDate(enrollment.birthDate) : 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Age</div>
                  <div class="info-value">${enrollment.age || 'Not provided'} years old</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Gender</div>
                  <div class="info-value">${enrollment.gender || 'Not provided'}</div>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Religion</div>
                  <div class="info-value">${enrollment.religion || 'Not provided'}</div>
                </div>
                ${enrollment.type === 'senior' ? `
                  <div class="info-item">
                    <div class="info-label">Birth Place</div>
                    <div class="info-value">${enrollment.birthPlace || 'Not provided'}</div>
                  </div>
                ` : ''}
                <div class="info-item">
                  <div class="info-label">Address</div>
                  <div class="info-value">${enrollment.address || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Contact Number</div>
                  <div class="info-value">${enrollment.contactNumber || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${enrollment.userEmail}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-header">Academic Information</div>
          <div class="section-content">
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">Level</div>
                  <div class="info-value">${enrollment.type === 'junior' ? 'Junior High School' : 'Senior High School'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Grade Level</div>
                  <div class="info-value">Grade ${enrollment.gradeLevel}</div>
                </div>
                ${enrollment.type === 'senior' ? `
                  <div class="info-item">
                    <div class="info-label">Strand</div>
                    <div class="info-value">${enrollment.strand || 'Not specified'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Semester</div>
                    <div class="info-value">${enrollment.semester || 'Not specified'}</div>
                  </div>
                ` : ''}
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Previous School</div>
                  <div class="info-value">${enrollment.lastSchool || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">General Average</div>
                  <div class="info-value">${enrollment.generalAverage || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Transferee</div>
                  <div class="info-value">${enrollment.isTransferee ? 'Yes' : 'No'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">ESC Grantee</div>
                  <div class="info-value">${enrollment.isESCGrantee ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-header">Guardian Information</div>
          <div class="section-content">
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">Guardian Name</div>
                  <div class="info-value">${enrollment.guardianName || 'Not provided'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Relationship</div>
                  <div class="info-value">${enrollment.guardianRelation || 'Not provided'}</div>
                </div>
              </div>
              ${enrollment.type === 'senior' ? `
                <div>
                  <div class="info-item">
                    <div class="info-label">Father's Name</div>
                    <div class="info-value">${enrollment.fatherName || 'Not provided'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Father's Occupation</div>
                    <div class="info-value">${enrollment.fatherOccupation || 'Not provided'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Mother's Name</div>
                    <div class="info-value">${enrollment.motherName || 'Not provided'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Mother's Occupation</div>
                    <div class="info-value">${enrollment.motherOccupation || 'Not provided'}</div>
                  </div>
                </div>
              ` : '<div></div>'}
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-header">Document Requirements</div>
          <div class="section-content">
            <div class="document-grid">
              ${enrollment.type === 'junior' ? `
                <div class="document-item ${enrollment.hasForm9 ? 'has' : 'missing'}">
                  ${enrollment.hasForm9 ? '✓' : '✗'} Form 9
                </div>
                <div class="document-item ${enrollment.hasForm10 ? 'has' : 'missing'}">
                  ${enrollment.hasForm10 ? '✓' : '✗'} Form 10
                </div>
                <div class="document-item ${enrollment.hasPSA ? 'has' : 'missing'}">
                  ${enrollment.hasPSA ? '✓' : '✗'} PSA Birth Certificate
                </div>
                <div class="document-item ${enrollment.hasGoodMoral ? 'has' : 'missing'}">
                  ${enrollment.hasGoodMoral ? '✓' : '✗'} Good Moral
                </div>
                <div class="document-item ${enrollment.hasBaptismal ? 'has' : 'missing'}">
                  ${enrollment.hasBaptismal ? '✓' : '✗'} Baptismal Certificate
                </div>
              ` : `
                <div class="document-item ${enrollment.hasForm9 ? 'has' : 'missing'}">
                  ${enrollment.hasForm9 ? '✓' : '✗'} Form 9
                </div>
                <div class="document-item ${enrollment.hasForm10 ? 'has' : 'missing'}">
                  ${enrollment.hasForm10 ? '✓' : '✗'} Form 10
                </div>
                <div class="document-item ${enrollment.hasPSA ? 'has' : 'missing'}">
                  ${enrollment.hasPSA ? '✓' : '✗'} PSA Birth Certificate
                </div>
                <div class="document-item ${enrollment.hasGoodMoral ? 'has' : 'missing'}">
                  ${enrollment.hasGoodMoral ? '✓' : '✗'} Good Moral
                </div>
                <div class="document-item ${enrollment.hasCompletionCert ? 'has' : 'missing'}">
                  ${enrollment.hasCompletionCert ? '✓' : '✗'} JHS Completion
                </div>
                <div class="document-item ${enrollment.hasESC ? 'has' : 'missing'}">
                  ${enrollment.hasESC ? '✓' : '✗'} ESC Certificate
                </div>
                <div class="document-item ${enrollment.hasNCAE ? 'has' : 'missing'}">
                  ${enrollment.hasNCAE ? '✓' : '✗'} NCAE Results
                </div>
              `}
            </div>
          </div>
        </div>
        
        ${enrollment.hasAcademicExcellence || enrollment.hasAcademicAward ? `
          <div class="section">
            <div class="section-header">Academic Achievements</div>
            <div class="section-content">
              ${enrollment.hasAcademicExcellence ? '<span class="achievement-badge">⭐ Academic Excellence</span>' : ''}
              ${enrollment.hasAcademicAward ? '<span class="achievement-badge">⭐ Academic Award</span>' : ''}
            </div>
          </div>
        ` : ''}
        
        ${enrollment.status === 'rejected' && enrollment.rejectionReason ? `
          <div class="rejection-box">
            <strong>Rejection Reason:</strong><br>
            ${enrollment.rejectionReason}
          </div>
        ` : ''}
        
        <div class="footer">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p>Printed on: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Application ID: ${enrollment.id}</p>
            </div>
            <div style="text-align: right;">
              <p>Page 1 of 1</p>
              <p>© ${new Date().getFullYear()} St. Paul's Academy</p>
            </div>
          </div>
          
          <div class="signature-grid">
            <div>
              <div class="signature-line">
                <p style="font-weight: bold; margin: 0;">Registrar's Signature</p>
                <p style="margin: 0.5rem 0 0 0;">Date: _____________________</p>
              </div>
            </div>
            <div>
              <div class="signature-line">
                <p style="font-weight: bold; margin: 0;">Applicant's Signature</p>
                <p style="margin: 0.5rem 0 0 0;">Date: _____________________</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        // Optional: Close the window after printing
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      }, 250);
    };
  }
  
  const statusConfig = $derived(getStatusConfig(enrollment.status));
</script>

<div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <!-- Backdrop with animation -->
  <!-- svelte-ignore a11y_no_redundant_roles -->
  <button
    type="button"
    class="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
    aria-label="Close modal"
    aria-hidden="true"
    tabindex="0"
    role="button"
    onclick={onClose}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClose(); } }}
    style="z-index: -1;"
  ></button>

  <!-- Modal container with better centering -->
  <div class="flex min-h-screen items-center justify-center p-0 sm:p-4">
    <!-- Modal panel with enhanced styling -->
    <div class="relative bg-white w-full max-w-5xl rounded-none sm:rounded-xl shadow-2xl transform transition-all overflow-hidden">
      <!-- Enhanced Header with gradient -->
      <div class="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 px-4 sm:px-6 py-4 sm:py-5">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div class="relative flex items-start justify-between">
          <div class="flex-1">
            <h3 id="modal-title" class="text-xl sm:text-2xl font-bold text-white mb-1">
              Enrollment Application
            </h3>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-green-100 text-sm">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {enrollment.fullName}
              </span>
              <span class="hidden sm:inline">•</span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(enrollment.submittedAt)}
              </span>
            </div>
          </div>
          
          <button
            onclick={onClose}
            class="ml-4 p-2 text-green-200 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Close modal"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full border ${statusConfig.color}`}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={statusConfig.icon} />
              </svg>
              {statusConfig.label}
            </span>
            <span class="text-sm text-gray-600">
              ID: <span class="font-mono font-medium">{enrollment.id?.slice(-8) || 'N/A'}</span>
            </span>
          </div>
          
          <!-- Quick Info -->
          <div class="flex flex-wrap gap-3 text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {enrollment.type === 'junior' ? 'Junior High' : 'Senior High'} - Grade {enrollment.gradeLevel}
            </span>
            {#if enrollment.type === 'senior'}
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {enrollment.strand}
              </span>
            {/if}
          </div>
        </div>
        
        <!-- Print Footer (only visible when printing) -->
        <div class="print-footer">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p>Printed on: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Application ID: {enrollment.id}</p>
            </div>
            <div class="text-right">
              <p>Page 1 of 1</p>
              <p>© {new Date().getFullYear()} St. Paul's Academy</p>
            </div>
          </div>
          <div class="mt-8 grid grid-cols-2 gap-8">
            <div class="text-center">
              <div class="border-t border-gray-400 pt-2 mt-12">
                <p class="font-semibold">Registrar's Signature</p>
                <p class="text-xs">Date: _____________________</p>
              </div>
            </div>
            <div class="text-center">
              <div class="border-t border-gray-400 pt-2 mt-12">
                <p class="font-semibold">Applicant's Signature</p>
                <p class="text-xs">Date: _____________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Tabs -->
      <div class="sm:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div class="flex overflow-x-auto">
          <button
            onclick={() => activeTab = 'personal'}
            class={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'personal' 
                ? 'text-green-600 border-green-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Personal
          </button>
          <button
            onclick={() => activeTab = 'academic'}
            class={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'academic' 
                ? 'text-green-600 border-green-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Academic
          </button>
          <button
            onclick={() => activeTab = 'documents'}
            class={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'documents' 
                ? 'text-green-600 border-green-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Documents
          </button>
          <button
            onclick={() => activeTab = 'system'}
            class={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'system' 
                ? 'text-green-600 border-green-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            System
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="overflow-y-auto max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-20rem)] print-content">
        <!-- Print Header (only visible when printing) -->
        <div class="print-header">
          <h1>St. Paul's Academy</h1>
          <p>Enrollment Application Form</p>
          <p>School Year: {enrollment.schoolYear}</p>
        </div>
        
        <div class="p-4 sm:p-6 space-y-6">
          <!-- Desktop View - All sections visible -->
          <div class="hidden sm:block space-y-6">
            <!-- Personal & Contact Information Section -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h4>
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Full Name:</span>
                    <span class="text-sm text-gray-900 font-medium">{enrollment.fullName || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">LRN:</span>
                    <span class="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">{enrollment.lrn || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Birth Date:</span>
                    <span class="text-sm text-gray-900">{enrollment.birthDate ? formatBirthDate(enrollment.birthDate) : 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Age:</span>
                    <span class="text-sm text-gray-900">{enrollment.age || 'Not provided'} years old</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Gender:</span>
                    <span class="text-sm text-gray-900">{enrollment.gender || 'Not provided'}</span>
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Religion:</span>
                    <span class="text-sm text-gray-900">{enrollment.religion || 'Not provided'}</span>
                  </div>
                  {#if enrollment.type === 'senior'}
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Birth Place:</span>
                      <span class="text-sm text-gray-900">{enrollment.birthPlace || 'Not provided'}</span>
                    </div>
                  {/if}
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Address:</span>
                    <span class="text-sm text-gray-900">{enrollment.address || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Contact:</span>
                    <span class="text-sm text-gray-900">{enrollment.contactNumber || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Email:</span>
                    <span class="text-sm text-gray-900">{enrollment.userEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Academic Information Section -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Academic Information
                </h4>
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">School Year:</span>
                    <span class="text-sm text-gray-900 font-medium">{enrollment.schoolYear}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Level:</span>
                    <span class="text-sm text-gray-900">{enrollment.type === 'junior' ? 'Junior High School' : 'Senior High School'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Grade Level:</span>
                    <span class="text-sm text-gray-900">Grade {enrollment.gradeLevel}</span>
                  </div>
                  {#if enrollment.type === 'senior'}
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Strand:</span>
                      <span class="text-sm text-gray-900 font-medium">{enrollment.strand || 'Not specified'}</span>
                    </div>
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Semester:</span>
                      <span class="text-sm text-gray-900">{enrollment.semester || 'Not specified'}</span>
                    </div>
                  {/if}
                </div>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Previous School:</span>
                    <span class="text-sm text-gray-900">{enrollment.lastSchool || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">General Average:</span>
                    <span class="text-sm text-gray-900 font-medium">{enrollment.generalAverage || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Transferee:</span>
                    <span class="text-sm text-gray-900">
                      {#if enrollment.isTransferee}
                        <span class="inline-flex items-center gap-1 text-green-700">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Yes
                        </span>
                      {:else}
                        <span class="inline-flex items-center gap-1 text-gray-500">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          No
                        </span>
                      {/if}
                    </span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">ESC Grantee:</span>
                    <span class="text-sm text-gray-900">
                      {#if enrollment.isESCGrantee}
                        <span class="inline-flex items-center gap-1 text-green-700">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Yes
                        </span>
                      {:else}
                        <span class="inline-flex items-center gap-1 text-gray-500">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          No
                        </span>
                      {/if}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Guardian Information Section -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Guardian Information
                </h4>
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Guardian Name:</span>
                    <span class="text-sm text-gray-900">{enrollment.guardianName || 'Not provided'}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Relationship:</span>
                    <span class="text-sm text-gray-900">{enrollment.guardianRelation || 'Not provided'}</span>
                  </div>
                </div>
                {#if enrollment.type === 'senior'}
                  <div class="space-y-3">
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Father's Name:</span>
                      <span class="text-sm text-gray-900">{enrollment.fatherName || 'Not provided'}</span>
                    </div>
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Father's Work:</span>
                      <span class="text-sm text-gray-900">{enrollment.fatherOccupation || 'Not provided'}</span>
                    </div>
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Mother's Name:</span>
                      <span class="text-sm text-gray-900">{enrollment.motherName || 'Not provided'}</span>
                    </div>
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Mother's Work:</span>
                      <span class="text-sm text-gray-900">{enrollment.motherOccupation || 'Not provided'}</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Document Requirements Section -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Document Requirements
                </h4>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {#if enrollment.type === 'junior'}
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasForm9 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm9 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasForm9}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasForm9 ? 'text-green-700' : 'text-gray-600'}`}>Form 9</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasForm10 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm10 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasForm10}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasForm10 ? 'text-green-700' : 'text-gray-600'}`}>Form 10</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasPSA ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasPSA ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasPSA}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasPSA ? 'text-green-700' : 'text-gray-600'}`}>PSA Birth Certificate</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasGoodMoral ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasGoodMoral ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasGoodMoral}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasGoodMoral ? 'text-green-700' : 'text-gray-600'}`}>Good Moral</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasBaptismal ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasBaptismal ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasBaptismal}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasBaptismal ? 'text-green-700' : 'text-gray-600'}`}>Baptismal</span>
                    </div>
                  {:else}
                    <!-- Senior High Documents -->
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasForm9 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm9 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasForm9}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasForm9 ? 'text-green-700' : 'text-gray-600'}`}>Form 9</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasForm10 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasForm10 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasForm10}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasForm10 ? 'text-green-700' : 'text-gray-600'}`}>Form 10</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasPSA ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasPSA ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasPSA}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasPSA ? 'text-green-700' : 'text-gray-600'}`}>PSA Birth Certificate</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasGoodMoral ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasGoodMoral ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasGoodMoral}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasGoodMoral ? 'text-green-700' : 'text-gray-600'}`}>Good Moral</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasCompletionCert ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasCompletionCert ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasCompletionCert}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasCompletionCert ? 'text-green-700' : 'text-gray-600'}`}>JHS Completion</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasESC ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasESC ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasESC}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasESC ? 'text-green-700' : 'text-gray-600'}`}>ESC Certificate</span>
                    </div>
                    <div class={`flex items-center p-3 rounded-lg border ${enrollment.hasNCAE ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <svg class={`w-5 h-5 mr-2 ${enrollment.hasNCAE ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {#if enrollment.hasNCAE}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        {:else}
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        {/if}
                      </svg>
                      <span class={`text-sm font-medium ${enrollment.hasNCAE ? 'text-green-700' : 'text-gray-600'}`}>NCAE Results</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Achievements (if any) -->
            {#if enrollment.hasAcademicExcellence || enrollment.hasAcademicAward}
              <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 overflow-hidden">
                <div class="px-4 py-3">
                  <h4 class="text-lg font-semibold text-yellow-900 flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Academic Achievements
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    {#if enrollment.hasAcademicExcellence}
                      <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="text-sm font-medium">Academic Excellence</span>
                      </div>
                    {/if}
                    {#if enrollment.hasAcademicAward}
                      <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="text-sm font-medium">Academic Award</span>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            <!-- Rejection Reason (if rejected) -->
            {#if enrollment.status === 'rejected' && enrollment.rejectionReason}
              <div class="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                <div class="px-4 py-3">
                  <h4 class="text-lg font-semibold text-red-900 flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Rejection Reason
                  </h4>
                  <p class="text-sm text-red-700 bg-red-100 p-3 rounded-md">
                    {enrollment.rejectionReason}
                  </p>
                </div>
              </div>
            {/if}

            <!-- System Information -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  System Information
                </h4>
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Application ID:</span>
                    <span class="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">{enrollment.id}</span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Submitted By:</span>
                    <span class="text-sm text-gray-900">{enrollment.userEmail}</span>
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-500 w-32">Submitted At:</span>
                    <span class="text-sm text-gray-900">{formatDate(enrollment.submittedAt)}</span>
                  </div>
                  {#if enrollment.updatedAt}
                    <div class="flex items-start">
                      <span class="text-sm font-medium text-gray-500 w-32">Last Updated:</span>
                      <span class="text-sm text-gray-900">{formatDate(enrollment.updatedAt)}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile View - Tab-based content -->
          <div class="sm:hidden">
            {#if activeTab === 'personal'}
              <!-- Personal Information Mobile -->
              <div class="space-y-4">
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="text-base font-semibold text-gray-900">Personal Information</h4>
                  </div>
                  <div class="p-4 space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</dt>
                      <dd class="mt-1 text-sm text-gray-900 font-medium">{enrollment.fullName || 'Not provided'}</dd>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">LRN</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">{enrollment.lrn || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Age</dt>
                        <dd class="mt-1 text-sm text-gray-900">{enrollment.age || 'N/A'} years old</dd>
                      </div>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</dt>
                      <dd class="mt-1 text-sm text-gray-900">{enrollment.birthDate ? formatBirthDate(enrollment.birthDate) : 'Not provided'}</dd>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</dt>
                        <dd class="mt-1 text-sm text-gray-900">{enrollment.gender || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Religion</dt>
                        <dd class="mt-1 text-sm text-gray-900">{enrollment.religion || 'Not provided'}</dd>
                      </div>
                    </div>
                    {#if enrollment.type === 'senior'}
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Place</dt>
                        <dd class="mt-1 text-sm text-gray-900">{enrollment.birthPlace || 'Not provided'}</dd>
                      </div>
                    {/if}
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="text-base font-semibold text-gray-900">Contact Information</h4>
                  </div>
                  <div class="p-4 space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</dt>
                      <dd class="mt-1 text-sm text-gray-900">{enrollment.address || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</dt>
                      <dd class="mt-1 text-sm text-gray-900">{enrollment.contactNumber || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</dt>
                      <dd class="mt-1 text-sm text-gray-900 break-all">{enrollment.userEmail}</dd>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="text-base font-semibold text-gray-900">Guardian Information</h4>
                  </div>
                  <div class="p-4 space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Name</dt>
                      <dd class="mt-1 text-sm text-gray-900">{enrollment.guardianName || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</dt>
                      <dd class="mt-1 text-sm text-gray-900">{enrollment.guardianRelation || 'Not provided'}</dd>
                    </div>
                    {#if enrollment.type === 'senior'}
                      <div class="pt-2 space-y-3">
                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</dt>
                          <dd class="mt-1 text-sm text-gray-900">{enrollment.fatherName || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Occupation</dt>
                          <dd class="mt-1 text-sm text-gray-900">{enrollment.fatherOccupation || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Mother's Name</dt>
                          <dd class="mt-1 text-sm text-gray-900">{enrollment.motherName || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Mother's Occupation</dt>
                          <dd class="mt-1 text-sm text-gray-900">{enrollment.motherOccupation || 'Not provided'}</dd>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            {#if activeTab === 'academic'}
              <!-- Academic Information Mobile -->
              <div class="space-y-4">
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="text-base font-semibold text-gray-900">Academic Details</h4>
                  </div>
                  <div class="p-4 space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">School Year</dt>
                      <dd class="mt-1 text-sm text-gray-900 font-medium">{enrollment.schoolYear}</dd>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Level</dt>
                        <dd class="mt-1 text-sm text-gray-900">{enrollment.type === 'junior' ? 'JHS' : 'SHS'}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</dt>
                        <dd class="mt-1 text-sm text-gray-900">Grade {enrollment.gradeLevel}</dd>
                      </div>
                    </div>
                    {#if enrollment.type === 'senior'}
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Strand</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-medium">{enrollment.strand || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</dt>
                        <dd class="mt-1 text-sm text-gray-900">{enrollment.semester || 'Not specified'}</dd>
                      </div>
                    {/if}
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Previous School</dt>
                      <dd class="mt-1 text-sm text-gray-900">{enrollment.lastSchool || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">General Average</dt>
                      <dd class="mt-1 text-sm text-gray-900 font-medium">{enrollment.generalAverage || 'Not provided'}</dd>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Transferee</dt>
                        <dd class="mt-1">
                          {#if enrollment.isTransferee}
                            <span class="inline-flex items-center gap-1 text-green-700 text-sm">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                              Yes
                            </span>
                          {:else}
                            <span class="inline-flex items-center gap-1 text-gray-500 text-sm">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                              </svg>
                              No
                            </span>
                          {/if}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">ESC Grantee</dt>
                        <dd class="mt-1">
                          {#if enrollment.isESCGrantee}
                            <span class="inline-flex items-center gap-1 text-green-700 text-sm">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                              Yes
                            </span>
                          {:else}
                            <span class="inline-flex items-center gap-1 text-gray-500 text-sm">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                              </svg>
                              No
                            </span>
                          {/if}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                {#if enrollment.hasAcademicExcellence || enrollment.hasAcademicAward}
                  <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 overflow-hidden">
                    <div class="px-4 py-3">
                      <h4 class="text-base font-semibold text-yellow-900 flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Achievements
                      </h4>
                      <div class="space-y-2">
                        {#if enrollment.hasAcademicExcellence}
                          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300 text-sm">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span class="font-medium">Academic Excellence</span>
                          </div>
                        {/if}
                        {#if enrollment.hasAcademicAward}
                          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300 text-sm">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span class="font-medium">Academic Award</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            {#if activeTab === 'documents'}
              <!-- Documents Mobile -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 class="text-base font-semibold text-gray-900">Document Checklist</h4>
                </div>
                <div class="p-4">
                  <div class="space-y-2">
                    {#if enrollment.type === 'junior'}
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasForm9 ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasForm9 ? 'text-green-700' : 'text-gray-600'}`}>Form 9</span>
                        <svg class={`w-5 h-5 ${enrollment.hasForm9 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasForm9}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasForm10 ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasForm10 ? 'text-green-700' : 'text-gray-600'}`}>Form 10</span>
                        <svg class={`w-5 h-5 ${enrollment.hasForm10 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasForm10}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasPSA ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasPSA ? 'text-green-700' : 'text-gray-600'}`}>PSA Birth Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasPSA ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasPSA}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasGoodMoral ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasGoodMoral ? 'text-green-700' : 'text-gray-600'}`}>Good Moral Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasGoodMoral ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasGoodMoral}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasBaptismal ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasBaptismal ? 'text-green-700' : 'text-gray-600'}`}>Baptismal Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasBaptismal ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasBaptismal}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                    {:else}
                      <!-- Senior High Documents -->
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasForm9 ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasForm9 ? 'text-green-700' : 'text-gray-600'}`}>Form 9</span>
                        <svg class={`w-5 h-5 ${enrollment.hasForm9 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasForm9}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasForm10 ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasForm10 ? 'text-green-700' : 'text-gray-600'}`}>Form 10</span>
                        <svg class={`w-5 h-5 ${enrollment.hasForm10 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasForm10}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasPSA ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasPSA ? 'text-green-700' : 'text-gray-600'}`}>PSA Birth Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasPSA ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasPSA}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasGoodMoral ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasGoodMoral ? 'text-green-700' : 'text-gray-600'}`}>Good Moral Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasGoodMoral ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasGoodMoral}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasCompletionCert ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasCompletionCert ? 'text-green-700' : 'text-gray-600'}`}>JHS Completion Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasCompletionCert ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasCompletionCert}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasESC ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasESC ? 'text-green-700' : 'text-gray-600'}`}>ESC Certificate</span>
                        <svg class={`w-5 h-5 ${enrollment.hasESC ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasESC}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                      <div class={`flex items-center justify-between p-3 rounded-lg ${enrollment.hasNCAE ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span class={`text-sm font-medium ${enrollment.hasNCAE ? 'text-green-700' : 'text-gray-600'}`}>NCAE Results</span>
                        <svg class={`w-5 h-5 ${enrollment.hasNCAE ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {#if enrollment.hasNCAE}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          {:else}
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          {/if}
                        </svg>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>

              {#if enrollment.status === 'rejected' && enrollment.rejectionReason}
                <div class="bg-red-50 rounded-lg border border-red-200 overflow-hidden mt-4">
                  <div class="px-4 py-3">
                    <h4 class="text-base font-semibold text-red-900 flex items-center gap-2 mb-2">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rejection Reason
                    </h4>
                    <p class="text-sm text-red-700 bg-red-100 p-3 rounded-md">
                      {enrollment.rejectionReason}
                    </p>
                  </div>
                </div>
              {/if}
            {/if}

            {#if activeTab === 'system'}
              <!-- System Information Mobile -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 class="text-base font-semibold text-gray-900">System Information</h4>
                </div>
                <div class="p-4 space-y-3">
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</dt>
                    <dd class="mt-1 text-xs font-mono bg-gray-100 px-2 py-1 rounded break-all">{enrollment.id}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</dt>
                    <dd class="mt-1 text-sm text-gray-900 break-all">{enrollment.userEmail}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</dt>
                    <dd class="mt-1 text-sm text-gray-900">{formatDate(enrollment.submittedAt)}</dd>
                  </div>
                  {#if enrollment.updatedAt}
                    <div>
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</dt>
                      <dd class="mt-1 text-sm text-gray-900">{formatDate(enrollment.updatedAt)}</dd>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 print:hidden">
        <div class="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <Button variant="outline" onclick={onClose} size="md" class="sm:order-1">
            Close
          </Button>
          
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {#each getStatusActions() as action}
              <Button
                variant={action.variant}
                size="md"
                onclick={() => {
                  if (action.status === 'rejected') {
                    onReject(enrollment.id!);
                  } else {
                    onStatusChange(enrollment.id!, action.status);
                  }
                }}
                loading={isUpdating}
                class="flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon} />
                </svg>
                {action.label}
              </Button>
            {/each}
            
            <Button 
              variant="outline" 
              size="md"
              onclick={handlePrint}
              class="flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @media print {
    /* Page setup */
    @page {
      size: A4;
      margin: 20mm;
    }
    
    /* Reset modal positioning for print */
    .fixed {
      position: relative !important;
    }
    
    .print-content {
      max-height: none !important;
      overflow: visible !important;
    }
    
    .print\:hidden {
      display: none !important;
    }
    
    /* Hide modal backdrop and unnecessary elements */
    .backdrop-blur-sm,
    .sticky,
    button,
    .overflow-x-auto,
    .border-b-2 {
      display: none !important;
    }
    
    /* Reset modal styling for print */
    .rounded-none,
    .sm\:rounded-xl {
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    
    /* Ensure all content is visible when printing */
    .hidden {
      display: block !important;
    }
    
    .sm\:hidden {
      display: none !important;
    }
    
    /* Page breaks */
    .bg-white.rounded-lg {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Header styling for print */
    .bg-gradient-to-br {
      background: #f3f4f6 !important;
      color: #111827 !important;
      border-bottom: 2px solid #d1d5db !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    .bg-gradient-to-br * {
      color: #111827 !important;
    }
    
    /* Section headers */
    .bg-gray-50 {
      background: #f9fafb !important;
      border-bottom: 1px solid #e5e7eb !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* Status badges */
    .bg-yellow-100,
    .bg-green-100,
    .bg-blue-100,
    .bg-red-100,
    .bg-gray-100 {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    /* Document checklist items */
    .bg-green-50 {
      background: #f0fdf4 !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    .bg-gray-50:not(.px-4) {
      background: #f9fafb !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* Text colors */
    .text-green-700,
    .text-green-600 {
      color: #15803d !important;
    }
    
    .text-gray-600,
    .text-gray-400 {
      color: #4b5563 !important;
    }
    
    .text-gray-500 {
      color: #6b7280 !important;
    }
    
    .text-gray-900 {
      color: #111827 !important;
    }
    
    /* Borders */
    .border,
    .border-gray-200 {
      border-color: #e5e7eb !important;
    }
    
    /* Achievement section */
    .bg-gradient-to-r.from-yellow-50 {
      background: #fef3c7 !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* Rejection reason section */
    .bg-red-50 {
      background: #fee2e2 !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    .bg-red-100 {
      background: #fecaca !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* Typography adjustments */
    h3, h4 {
      font-weight: 700 !important;
      margin-bottom: 0.5rem !important;
    }
    
    /* Spacing adjustments */
    .p-4 {
      padding: 12px !important;
    }
    
    .space-y-6 > * + * {
      margin-top: 1rem !important;
    }
    
    /* Grid adjustments for print */
    .grid {
      display: grid !important;
    }
    
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    
    .md\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
    
    /* Ensure icons are visible */
    svg {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    /* Add school header for print */
    .print-header {
      display: block !important;
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid #111827;
      padding-bottom: 1rem;
    }
    
    .print-header h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .print-header p {
      font-size: 14px;
      color: #4b5563;
    }
    
    /* Footer for print */
    .print-footer {
      display: block !important;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
  }
  
  /* Hide print-only elements in normal view */
  .print-header,
  .print-footer {
    display: none;
  }
  
  /* Smooth transitions */
  * {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  /* Custom scrollbar for content area */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>