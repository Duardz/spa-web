<script lang="ts">
  import FormField from './FormField.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import { validateSeniorHighForm, calculateAge } from '$lib/utils/validators';
  import type { SeniorHighEnrollment, ValidationError } from '$lib/types';
  
  interface Props {
    onSubmit: (data: Omit<SeniorHighEnrollment, 'id'>) => Promise<void>;
    schoolYear: string;
    disabled?: boolean;
  }
  
  let { onSubmit, schoolYear, disabled = false }: Props = $props();
  
  let formData = $state({
    gradeLevel: '11' as '11' | '12',
    strand: '' as 'STEM' | 'HUMSS' | 'ABM',
    semester: '1st' as '1st' | '2nd',
    isESCGrantee: false,
    lrn: '',
    fullName: '',
    birthPlace: '',
    birthDate: '',
    age: 0,
    gender: '' as 'Male' | 'Female',
    religion: '',
    address: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    guardianName: '',
    guardianRelation: '',
    contactNumber: '',
    lastSchool: '',
    generalAverage: 0,
    isTransferee: false,
    hasAcademicAward: false,
    hasForm9: false,
    hasForm10: false,
    hasPSA: false,
    hasMoral: false,
    hasBaptismal: false,
    hasCompletionCert: false,
    hasESC: false,
    hasNCAE: false
  });
  
  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  
  // Auto-calculate age when birthdate changes
  $effect(() => {
    if (formData.birthDate) {
      formData.age = calculateAge(formData.birthDate);
    }
  });
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errors = {};
    
    // Validate form
    const validationErrors = validateSeniorHighForm(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        errors[error.field] = error.message;
      });
      return;
    }
    
    isSubmitting = true;
    
    try {
      const enrollmentData: Omit<SeniorHighEnrollment, 'id'> = {
        type: 'senior',
        status: 'submitted',
        schoolYear,
        userId: '', // Will be set by parent component
        userEmail: '', // Will be set by parent component
        submittedAt: new Date(),
        updatedAt: new Date(),
        ...formData,
        generalAverage: formData.generalAverage
      };
      
      await onSubmit(enrollmentData);
    } catch (error) {
      console.error('Submission error:', error);
      errors.general = 'Failed to submit enrollment. Please try again.';
    } finally {
      isSubmitting = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <Card>
    <h3 class="text-lg font-semibold mb-4">Academic Track</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Grade Level"
        id="gradeLevel"
        name="gradeLevel"
        type="select"
        required
        bind:value={formData.gradeLevel}
        error={errors.gradeLevel}
        disabled={disabled || isSubmitting}
      >
        <option value="11">Grade 11</option>
        <option value="12">Grade 12</option>
      </FormField>
      
      <FormField
        label="Semester"
        id="semester"
        name="semester"
        type="select"
        required
        bind:value={formData.semester}
        error={errors.semester}
        disabled={disabled || isSubmitting}
      >
        <option value="1st">1st Semester</option>
        <option value="2nd">2nd Semester</option>
      </FormField>
      
      <FormField
        label="Academic Strand"
        id="strand"
        name="strand"
        type="select"
        required
        bind:value={formData.strand}
        error={errors.strand}
        disabled={disabled || isSubmitting}
        class="md:col-span-2"
      >
        <option value="">Select Strand</option>
        <option value="STEM">STEM - Science, Technology, Engineering & Mathematics</option>
        <option value="HUMSS">HUMSS - Humanities and Social Sciences</option>
        <option value="ABM">ABM - Accountancy, Business and Management</option>
      </FormField>
      
      <div class="md:col-span-2">
        <label class="flex items-center">
          <input
            type="checkbox"
            bind:checked={formData.isESCGrantee}
            disabled={disabled || isSubmitting}
            class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
          />
          <span class="text-sm text-gray-700">ESC (Educational Service Contracting) Grantee</span>
        </label>
      </div>
    </div>
  </Card>
  
  <Card>
    <h3 class="text-lg font-semibold mb-4">Student Information</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Learner Reference Number (LRN)"
        id="lrn"
        name="lrn"
        type="text"
        required
        placeholder="12 digits"
        bind:value={formData.lrn}
        error={errors.lrn}
        disabled={disabled || isSubmitting}
        maxlength="12"
        pattern="[0-9]{12}"
      />
      
      <FormField
        label="Full Name"
        id="fullName"
        name="fullName"
        type="text"
        required
        placeholder="Last Name, First Name Middle Name"
        bind:value={formData.fullName}
        error={errors.fullName}
        disabled={disabled || isSubmitting}
        class="md:col-span-2"
      />
      
      <FormField
        label="Place of Birth"
        id="birthPlace"
        name="birthPlace"
        type="text"
        required
        bind:value={formData.birthPlace}
        error={errors.birthPlace}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Birth Date"
        id="birthDate"
        name="birthDate"
        type="date"
        required
        bind:value={formData.birthDate}
        error={errors.birthDate}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Age"
        id="age"
        name="age"
        type="number"
        required
        bind:value={formData.age}
        error={errors.age}
        disabled={disabled || isSubmitting}
        readonly
      />
      
      <FormField
        label="Gender"
        id="gender"
        name="gender"
        type="select"
        required
        bind:value={formData.gender}
        error={errors.gender}
        disabled={disabled || isSubmitting}
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </FormField>
      
      <FormField
        label="Religion"
        id="religion"
        name="religion"
        type="text"
        required
        bind:value={formData.religion}
        error={errors.religion}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Complete Address"
        id="address"
        name="address"
        type="textarea"
        required
        placeholder="House #, Street, Barangay, Municipality, Province"
        bind:value={formData.address}
        error={errors.address}
        disabled={disabled || isSubmitting}
        class="md:col-span-2"
      />
    </div>
  </Card>
  
  <Card>
    <h3 class="text-lg font-semibold mb-4">Family Information</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Father's Name"
        id="fatherName"
        name="fatherName"
        type="text"
        required
        bind:value={formData.fatherName}
        error={errors.fatherName}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Father's Occupation"
        id="fatherOccupation"
        name="fatherOccupation"
        type="text"
        bind:value={formData.fatherOccupation}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Mother's Name"
        id="motherName"
        name="motherName"
        type="text"
        required
        bind:value={formData.motherName}
        error={errors.motherName}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Mother's Occupation"
        id="motherOccupation"
        name="motherOccupation"
        type="text"
        bind:value={formData.motherOccupation}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Guardian Name"
        id="guardianName"
        name="guardianName"
        type="text"
        required
        bind:value={formData.guardianName}
        error={errors.guardianName}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Relationship"
        id="guardianRelation"
        name="guardianRelation"
        type="text"
        required
        placeholder="e.g., Mother, Father, Guardian"
        bind:value={formData.guardianRelation}
        error={errors.guardianRelation}
        disabled={disabled || isSubmitting}
      />
      
      <FormField
        label="Contact Number"
        id="contactNumber"
        name="contactNumber"
        type="tel"
        required
        placeholder="09XX-XXX-XXXX"
        bind:value={formData.contactNumber}
        error={errors.contactNumber}
        disabled={disabled || isSubmitting}
      />
    </div>
  </Card>
  
  <Card>
    <h3 class="text-lg font-semibold mb-4">Academic Information</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Last School Attended"
        id="lastSchool"
        name="lastSchool"
        type="text"
        required
        bind:value={formData.lastSchool}
        error={errors.lastSchool}
        disabled={disabled || isSubmitting}
        class="md:col-span-2"
      />
      
      <FormField
        label="General Average"
        id="generalAverage"
        name="generalAverage"
        type="number"
        required
        placeholder="60-100"
        min="60"
        max="100"
        bind:value={formData.generalAverage}
        error={errors.generalAverage}
        disabled={disabled || isSubmitting}
      />
      
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            type="checkbox"
            bind:checked={formData.isTransferee}
            disabled={disabled || isSubmitting}
            class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
          />
          <span class="text-sm text-gray-700">Transferee Student</span>
        </label>
        
        <label class="flex items-center">
          <input
            type="checkbox"
            bind:checked={formData.hasAcademicAward}
            disabled={disabled || isSubmitting}
            class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
          />
          <span class="text-sm text-gray-700">Academic Award Recipient</span>
        </label>
      </div>
    </div>
  </Card>
  
  <Card>
    <h3 class="text-lg font-semibold mb-4">Required Documents</h3>
    <p class="text-sm text-gray-600 mb-4">Please check the documents you will submit:</p>
    
    {#if errors.documents}
      <p class="text-sm text-red-600 mb-2">{errors.documents}</p>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasForm9}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">School Form 9 (SF9)</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasForm10}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">School Form 10 (SF10)</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasPSA}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">PSA Birth Certificate</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasMoral}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">Certificate of Good Moral Character</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasBaptismal}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">Baptismal Certificate</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasCompletionCert}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">JHS Completion Certificate</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasESC}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">ESC Certificate (if applicable)</span>
      </label>
      
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.hasNCAE}
          disabled={disabled || isSubmitting}
          class="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
        />
        <span class="text-sm text-gray-700">NCAE Result</span>
      </label>
    </div>
  </Card>
  
  {#if errors.general}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {errors.general}
    </div>
  {/if}
  
  <div class="flex justify-end space-x-4">
    <Button type="button" variant="outline" disabled={disabled || isSubmitting}>
      Cancel
    </Button>
    <Button type="submit" loading={isSubmitting} disabled={disabled || isSubmitting}>
      Submit Enrollment
    </Button>
  </div>
</form>