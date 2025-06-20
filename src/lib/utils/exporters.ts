import type { Enrollment, JuniorHighEnrollment, SeniorHighEnrollment } from '$lib/types';

// CSV Export
export function exportToCSV(enrollments: Enrollment[], filename: string = 'enrollments.csv'): void {
  const headers = [
    'ID',
    'Type',
    'Status',
    'Submitted Date',
    'School Year',
    'Grade Level',
    'Strand',
    'Semester',
    'LRN',
    'Full Name',
    'Birth Date',
    'Birth Place',
    'Age',
    'Gender',
    'Religion',
    'Address',
    'Last School',
    'General Average',
    'Is Transferee',
    'Guardian Name',
    'Guardian Relation',
    'Contact Number',
    'Father Name',
    'Father Occupation',
    'Mother Name',
    'Mother Occupation',
    'ESC Grantee',
    'Academic Excellence',
    'Academic Award'
  ];

  const rows = enrollments.map(enrollment => {
    const base = [
      enrollment.id || '',
      enrollment.type,
      enrollment.status,
      new Date(enrollment.submittedAt).toLocaleDateString('en-PH'),
      enrollment.schoolYear,
      enrollment.gradeLevel,
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).strand : '',
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).semester : '',
      enrollment.lrn,
      enrollment.fullName,
      enrollment.birthDate,
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).birthPlace : '',
      enrollment.age.toString(),
      enrollment.gender,
      enrollment.religion,
      enrollment.address,
      enrollment.lastSchool,
      enrollment.generalAverage.toString(),
      enrollment.isTransferee ? 'Yes' : 'No',
      enrollment.guardianName,
      enrollment.guardianRelation,
      enrollment.contactNumber,
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).fatherName : '',
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).fatherOccupation : '',
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).motherName : '',
      enrollment.type === 'senior' ? (enrollment as SeniorHighEnrollment).motherOccupation : '',
      enrollment.type === 'senior' ? ((enrollment as SeniorHighEnrollment).isESCGrantee ? 'Yes' : 'No') : '',
      enrollment.type === 'junior' ? ((enrollment as JuniorHighEnrollment).hasAcademicExcellence ? 'Yes' : 'No') : '',
      enrollment.type === 'senior' ? ((enrollment as SeniorHighEnrollment).hasAcademicAward ? 'Yes' : 'No') : ''
    ];
    
    return base.map(cell => `"${cell}"`).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// PDF Export (using browser print)
export function exportToPDF(enrollment: Enrollment): void {
  // Create a new window with the enrollment data formatted for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = generatePrintHTML(enrollment);
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Trigger print after content loads
  printWindow.onload = () => {
    printWindow.print();
  };
}

// Generate HTML for printing
function generatePrintHTML(enrollment: Enrollment): string {
  const isJunior = enrollment.type === 'junior';
  const principalName = isJunior ? 'GLORIA C. ABAT' : 'LEAH MAY B. UNAJAN';
  const cashierName = 'GLORIA C. ABAT';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Enrollment Form - ${enrollment.fullName}</title>
  <style>
    @page { margin: 0.5in; }
    body { 
      font-family: Arial, sans-serif; 
      font-size: 12pt;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #006400;
      margin: 5px 0;
    }
    .form-section {
      margin: 15px 0;
    }
    .form-row {
      display: flex;
      margin: 5px 0;
    }
    .form-label {
      font-weight: bold;
      min-width: 150px;
    }
    .form-value {
      flex: 1;
      border-bottom: 1px solid #333;
      padding-left: 5px;
    }
    .documents {
      margin: 15px 0;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .signature-box {
      width: 45%;
      text-align: center;
      margin-top: 30px;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      margin-bottom: 5px;
      height: 40px;
    }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SAINT PATRICK'S ACADEMY, INC.</h1>
    <p>San Francisco, Agusan del Sur</p>
    <h2>${isJunior ? 'JUNIOR' : 'SENIOR'} HIGH SCHOOL ENROLLMENT FORM</h2>
    <p>School Year ${enrollment.schoolYear}</p>
  </div>

  <div class="form-section">
    <div class="form-row">
      <span class="form-label">LRN:</span>
      <span class="form-value">${enrollment.lrn}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Full Name:</span>
      <span class="form-value">${enrollment.fullName}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Grade Level:</span>
      <span class="form-value">Grade ${enrollment.gradeLevel}</span>
    </div>
    ${!isJunior ? `
    <div class="form-row">
      <span class="form-label">Strand:</span>
      <span class="form-value">${(enrollment as SeniorHighEnrollment).strand}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Semester:</span>
      <span class="form-value">${(enrollment as SeniorHighEnrollment).semester}</span>
    </div>
    ` : ''}
    <div class="form-row">
      <span class="form-label">Birth Date:</span>
      <span class="form-value">${enrollment.birthDate}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Age:</span>
      <span class="form-value">${enrollment.age}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Gender:</span>
      <span class="form-value">${enrollment.gender}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Religion:</span>
      <span class="form-value">${enrollment.religion}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Address:</span>
      <span class="form-value">${enrollment.address}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Guardian:</span>
      <span class="form-value">${enrollment.guardianName} (${enrollment.guardianRelation})</span>
    </div>
    <div class="form-row">
      <span class="form-label">Contact:</span>
      <span class="form-value">${enrollment.contactNumber}</span>
    </div>
    <div class="form-row">
      <span class="form-label">Last School:</span>
      <span class="form-value">${enrollment.lastSchool}</span>
    </div>
    <div class="form-row">
      <span class="form-label">General Average:</span>
      <span class="form-value">${enrollment.generalAverage}</span>
    </div>
  </div>

  <div class="documents">
    <strong>Phase 2 Requirements - Please bring the following documents to school:</strong>
    <div style="margin-top: 10px; padding: 10px; background-color: #f3f4f6; border-radius: 5px;">
      ${isJunior ? `
        <ul style="list-style-type: disc; margin-left: 20px; line-height: 1.6;">
          <li>School Form 10 (SF10) - Learner's permanent academic record</li>
          <li>PSA Birth Certificate - Original or certified true copy</li>
          <li>Certificate of Good Moral Character - From previous school</li>
          <li>Baptismal Certificate - For Catholic students (optional)</li>
        </ul>
      ` : `
        <ul style="list-style-type: disc; margin-left: 20px; line-height: 1.6;">
          <li>School Form 9 (SF9) - Learner's progress report card</li>
          <li>School Form 10 (SF10) - Learner's permanent academic record</li>
          <li>PSA Birth Certificate - Original or certified true copy</li>
          <li>Certificate of Good Moral Character - From previous school</li>
          <li>JHS Completion Certificate - Proof of Junior High School completion</li>
          <li>Baptismal Certificate - For Catholic students (optional)</li>
          <li>ESC Certificate - If applicable</li>
          <li>NCAE Result - National Career Assessment Examination (if available)</li>
        </ul>
      `}
      <p style="margin-top: 10px; font-style: italic; color: #6b7280;">
        Note: These documents must be submitted during the school visit to complete your enrollment.
      </p>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>Student Signature</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>Parent/Guardian Signature</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>Teacher</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>${principalName}<br>Principal</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>${cashierName}<br>Cashier</div>
    </div>
  </div>

  <div style="margin-top: 30px; text-align: center; color: #666;">
    <small>Date Submitted: ${new Date(enrollment.submittedAt).toLocaleString('en-PH')}</small><br>
    <small>Status: ${enrollment.status.toUpperCase()}</small>
  </div>
</body>
</html>
  `;
}

// Batch export multiple enrollments to PDF
export function batchExportToPDF(enrollments: Enrollment[]): void {
  const htmlPages = enrollments.map(enrollment => generatePrintHTML(enrollment));
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const combinedHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Enrollment Forms - Batch Print</title>
  <style>
    @page { margin: 0.5in; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  ${htmlPages.join('<div class="page-break"></div>')}
</body>
</html>
  `;

  printWindow.document.write(combinedHTML);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}