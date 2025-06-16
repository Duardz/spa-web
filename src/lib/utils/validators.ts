// src/lib/utils/validators.ts
import type { ValidationError, JuniorHighEnrollment, SeniorHighEnrollment } from '$lib/types';
import { sanitizeInput } from './security';

// LRN validation (12 digits)
export function validateLRN(lrn: string): { isValid: boolean; error?: string } {
  if (!lrn || lrn.trim().length === 0) {
    return { isValid: false, error: 'LRN is required' };
  }
  
  // Remove any spaces or dashes
  const cleaned = lrn.replace(/[\s-]/g, '');
  
  if (!/^\d{12}$/.test(cleaned)) {
    return { isValid: false, error: 'LRN must be exactly 12 digits (numbers only, no spaces or dashes)' };
  }
  
  // Check for suspicious patterns (all same digit, sequential)
  if (/^(\d)\1{11}$/.test(cleaned)) {
    return { isValid: false, error: 'LRN appears to be invalid (repeated digits)' };
  }
  
  return { isValid: true };
}

// Phone number validation (Philippine format)
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Contact number is required' };
  }
  
  // Accept formats: 09XX-XXX-XXXX, +639XX-XXX-XXXX, 09XXXXXXXXX
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!/^(09\d{9}|639\d{9}|\+639\d{9})$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid Philippine mobile number (e.g., 09123456789, +639123456789)' };
  }
  
  if (cleaned.length < 11 || cleaned.length > 13) {
    return { isValid: false, error: 'Mobile number must be 11 digits (local) or 13 digits (with country code)' };
  }
  
  return { isValid: true };
}

// Email validation
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Check for common typos
  const domain = email.split('@')[1];
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const suspiciousDomains = ['gmial.com', 'gmai.com', 'yahooo.com', 'outloook.com'];
  
  if (suspiciousDomains.includes(domain)) {
    return { isValid: false, error: `Did you mean ${domain.replace(/gmial|gmai/, 'gmail').replace(/yahooo/, 'yahoo').replace(/outloook/, 'outlook')}?` };
  }
  
  return { isValid: true };
}

// Age validation (5-25 years old for students)
export function validateAge(age: number, level: 'junior' | 'senior' = 'junior'): { isValid: boolean; error?: string } {
  if (isNaN(age)) {
    return { isValid: false, error: 'Age must be a number' };
  }
  
  const minAge = level === 'junior' ? 10 : 14;
  const maxAge = 25;
  
  if (age < minAge) {
    return { isValid: false, error: `Student must be at least ${minAge} years old for ${level === 'junior' ? 'Junior' : 'Senior'} High` };
  }
  
  if (age > maxAge) {
    return { isValid: false, error: `Student age seems incorrect (over ${maxAge} years)` };
  }
  
  return { isValid: true };
}

// General average validation (60-100)
export function validateGeneralAverage(average: number): { isValid: boolean; error?: string } {
  if (average === undefined || average === null || isNaN(average)) {
    return { isValid: false, error: 'General average is required and must be a number' };
  }
  
  if (average < 60) {
    return { isValid: false, error: 'General average must be at least 60' };
  }
  
  if (average > 100) {
    return { isValid: false, error: 'General average cannot exceed 100' };
  }
  
  // Check decimal places
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(average.toString())) {
    return { isValid: false, error: 'General average must be a valid number with up to 2 decimal places' };
  }
  
  return { isValid: true };
}

// Name validation (letters, spaces, hyphens, apostrophes)
export function validateName(name: string, fieldName: string = 'Name'): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} must not exceed 100 characters` };
  }
  
  // Allow letters, spaces, hyphens, apostrophes, commas, periods, and common name characters
  if (!/^[a-zA-Z\s\-'ñÑ,.]+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and commas` };
  }
  
  // Check for XSS attempts
  if (/<[^>]*>/.test(name) || /[<>'"]/g.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  // Check for excessive spaces
  if (/\s{3,}/.test(name)) {
    return { isValid: false, error: `${fieldName} contains too many consecutive spaces` };
  }
  
  return { isValid: true };
}

// Date validation
export function validateDate(date: string, fieldName: string = 'Date'): { isValid: boolean; error?: string } {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const parsed = new Date(date);
  
  if (isNaN(parsed.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
  }
  
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (parsed > today) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  
  // Check if date is too far in the past (100 years)
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  
  if (parsed < hundredYearsAgo) {
    return { isValid: false, error: `${fieldName} seems incorrect (too far in the past)` };
  }
  
  return { isValid: true };
}

// Address validation
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Complete address is required' };
  }
  
  const trimmed = address.trim();
  
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Address must be at least 10 characters (include street, barangay, city/municipality)' };
  }
  
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Address must not exceed 200 characters' };
  }
  
  // Check for XSS attempts
  if (/<[^>]*>/.test(address) || /javascript:/i.test(address)) {
    return { isValid: false, error: 'Address contains invalid characters or scripts' };
  }
  
  return { isValid: true };
}

// Religion validation
export function validateReligion(religion: string): { isValid: boolean; error?: string } {
  if (!religion || religion.trim().length === 0) {
    return { isValid: false, error: 'Religion is required' };
  }
  
  const trimmed = religion.trim();
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Religion must be at least 3 characters' };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Religion must not exceed 50 characters' };
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { isValid: false, error: 'Religion can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  if (/<[^>]*>/.test(religion)) {
    return { isValid: false, error: 'Religion contains invalid characters' };
  }
  
  return { isValid: true };
}

// School name validation
export function validateSchoolName(school: string): { isValid: boolean; error?: string } {
  if (!school || school.trim().length === 0) {
    return { isValid: false, error: 'Last school attended is required' };
  }
  
  const trimmed = school.trim();
  
  if (trimmed.length < 5) {
    return { isValid: false, error: 'School name must be at least 5 characters' };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'School name must not exceed 100 characters' };
  }
  
  if (!/^[a-zA-Z0-9\s\-',.()ñÑ]+$/.test(trimmed)) {
    return { isValid: false, error: 'School name contains invalid characters' };
  }
  
  if (/<[^>]*>/.test(school)) {
    return { isValid: false, error: 'School name contains invalid HTML/script tags' };
  }
  
  return { isValid: true };
}

// Occupation validation (optional field)
export function validateOccupation(occupation: string): { isValid: boolean; error?: string } {
  if (!occupation || occupation.trim().length === 0) {
    return { isValid: true }; // Optional field
  }
  
  const trimmed = occupation.trim();
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Occupation must not exceed 50 characters' };
  }
  
  if (!/^[a-zA-Z0-9\s\-',.()]+$/.test(trimmed)) {
    return { isValid: false, error: 'Occupation contains invalid characters' };
  }
  
  if (/<[^>]*>/.test(occupation)) {
    return { isValid: false, error: 'Occupation contains invalid HTML/script tags' };
  }
  
  return { isValid: true };
}

// Calculate age from birthdate
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Validate Junior High Form
export function validateJuniorHighForm(data: Partial<JuniorHighEnrollment>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // XSS Prevention - Sanitize all string inputs first
  Object.keys(data).forEach(key => {
    if (typeof (data as any)[key] === 'string') {
      (data as any)[key] = sanitizeInput((data as any)[key]);
    }
  });
  
  // LRN Validation
  const lrnResult = validateLRN(data.lrn || '');
  if (!lrnResult.isValid) {
    errors.push({ field: 'lrn', message: lrnResult.error! });
  }
  
  // Name Validation
  const nameResult = validateName(data.fullName || '', 'Full name');
  if (!nameResult.isValid) {
    errors.push({ field: 'fullName', message: nameResult.error! });
  }
  
  // Email Validation (if provided)
  if (data.userEmail) {
    const emailResult = validateEmail(data.userEmail);
    if (!emailResult.isValid) {
      errors.push({ field: 'userEmail', message: emailResult.error! });
    }
  }
  
  // Phone Validation
  const phoneResult = validatePhoneNumber(data.contactNumber || '');
  if (!phoneResult.isValid) {
    errors.push({ field: 'contactNumber', message: phoneResult.error! });
  }
  
  // Birth Date Validation
  const birthDateResult = validateDate(data.birthDate || '', 'Birth date');
  if (!birthDateResult.isValid) {
    errors.push({ field: 'birthDate', message: birthDateResult.error! });
  } else {
    // Age Validation based on birth date
    const age = calculateAge(data.birthDate!);
    const ageResult = validateAge(age, 'junior');
    if (!ageResult.isValid) {
      errors.push({ field: 'birthDate', message: ageResult.error! });
    }
  }
  
  // Gender Validation
  if (!data.gender) {
    errors.push({ field: 'gender', message: 'Gender is required' });
  } else if (!['Male', 'Female'].includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Please select a valid gender option' });
  }
  
  // General Average Validation
  if (data.generalAverage !== undefined) {
    const averageResult = validateGeneralAverage(data.generalAverage);
    if (!averageResult.isValid) {
      errors.push({ field: 'generalAverage', message: averageResult.error! });
    }
  }
  
  // Address Validation
  const addressResult = validateAddress(data.address || '');
  if (!addressResult.isValid) {
    errors.push({ field: 'address', message: addressResult.error! });
  }
  
  // Religion Validation
  const religionResult = validateReligion(data.religion || '');
  if (!religionResult.isValid) {
    errors.push({ field: 'religion', message: religionResult.error! });
  }
  
  // Guardian validation
  const guardianNameResult = validateName(data.guardianName || '', 'Guardian name');
  if (!guardianNameResult.isValid) {
    errors.push({ field: 'guardianName', message: guardianNameResult.error! });
  }
  
  if (!data.guardianRelation) {
    errors.push({ field: 'guardianRelation', message: 'Guardian relationship is required' });
  } else if (!['Mother', 'Father', 'Guardian', 'Grandparent', 'Sibling', 'Other'].includes(data.guardianRelation)) {
    errors.push({ field: 'guardianRelation', message: 'Please select a valid relationship option' });
  }
  
  // Last School Validation
  const schoolResult = validateSchoolName(data.lastSchool || '');
  if (!schoolResult.isValid) {
    errors.push({ field: 'lastSchool', message: schoolResult.error! });
  }
  
  // At least one document required
  if (!data.hasForm10 && !data.hasPSA && !data.hasBaptismal && !data.hasGoodMoral) {
    errors.push({ field: 'documents', message: 'You must select at least one document that you will submit. These are required for enrollment.' });
  }
  
  // Validate boolean document fields
  const documentFields = ['hasForm10', 'hasPSA', 'hasBaptismal', 'hasGoodMoral', 'isTransferee', 'hasAcademicExcellence'];
  for (const field of documentFields) {
    if ((data as any)[field] !== undefined && typeof (data as any)[field] !== 'boolean') {
      errors.push({ field: 'documents', message: 'Invalid document selection detected. Please refresh and try again.' });
      break;
    }
  }
  
  return errors;
}

// Validate Senior High Form
export function validateSeniorHighForm(data: Partial<SeniorHighEnrollment>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // All junior high validations apply (except documents)
  const baseErrors = validateJuniorHighForm(data as Partial<JuniorHighEnrollment>);
  errors.push(...baseErrors.filter(e => e.field !== 'documents'));
  
  // Additional senior high fields
  if (!data.strand) {
    errors.push({ field: 'strand', message: 'Academic strand is required' });
  } else if (!['STEM', 'HUMSS', 'ABM'].includes(data.strand)) {
    errors.push({ field: 'strand', message: 'Please select a valid academic strand (STEM, HUMSS, or ABM)' });
  }
  
  if (!data.semester) {
    errors.push({ field: 'semester', message: 'Semester is required' });
  } else if (!['1st', '2nd'].includes(data.semester)) {
    errors.push({ field: 'semester', message: 'Please select a valid semester' });
  }
  
  // Birth Place Validation
  const birthPlaceResult = validateName(data.birthPlace || '', 'Place of birth');
  if (!birthPlaceResult.isValid) {
    errors.push({ field: 'birthPlace', message: birthPlaceResult.error! });
  }
  
  // Parents' Names Validation
  const fatherNameResult = validateName(data.fatherName || '', "Father's name");
  if (!fatherNameResult.isValid) {
    errors.push({ field: 'fatherName', message: fatherNameResult.error! });
  }
  
  const motherNameResult = validateName(data.motherName || '', "Mother's name");
  if (!motherNameResult.isValid) {
    errors.push({ field: 'motherName', message: motherNameResult.error! });
  }
  
  // Parents' Occupations (optional)
  if (data.fatherOccupation) {
    const fatherOccResult = validateOccupation(data.fatherOccupation);
    if (!fatherOccResult.isValid) {
      errors.push({ field: 'fatherOccupation', message: fatherOccResult.error! });
    }
  }
  
  if (data.motherOccupation) {
    const motherOccResult = validateOccupation(data.motherOccupation);
    if (!motherOccResult.isValid) {
      errors.push({ field: 'motherOccupation', message: motherOccResult.error! });
    }
  }
  
  // At least one document required (senior high specific)
  const hasAnyDocument = data.hasForm9 || data.hasForm10 || data.hasPSA || 
                        data.hasMoral || data.hasBaptismal || data.hasCompletionCert || 
                        data.hasESC || data.hasNCAE;
  
  if (!hasAnyDocument) {
    errors.push({ field: 'documents', message: 'You must select at least one document that you will submit. These are required for enrollment.' });
  }
  
  // Validate boolean document fields
  const documentFields = ['hasForm9', 'hasForm10', 'hasPSA', 'hasMoral', 'hasBaptismal', 
                         'hasCompletionCert', 'hasESC', 'hasNCAE', 'isTransferee', 
                         'hasAcademicAward', 'isESCGrantee'];
  for (const field of documentFields) {
    if ((data as any)[field] !== undefined && typeof (data as any)[field] !== 'boolean') {
      errors.push({ field: 'documents', message: 'Invalid document selection detected. Please refresh and try again.' });
      break;
    }
  }
  
  return errors;
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('09')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Validate enrollment form (generic)
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEnrollmentForm(data: any): ValidationResult {
  const errors: Record<string, string> = {};
  let validationErrors: ValidationError[] = [];
  
  // Determine form type and validate accordingly
  if (data.type === 'junior') {
    validationErrors = validateJuniorHighForm(data);
  } else if (data.type === 'senior') {
    validationErrors = validateSeniorHighForm(data);
  } else {
    // For generic validation when type is not set
    validationErrors = validateJuniorHighForm(data);
  }
  
  // Convert array errors to object
  validationErrors.forEach(error => {
    errors[error.field] = error.message;
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}