// src/lib/utils/validators.ts
import type { ValidationError, JuniorHighEnrollment, SeniorHighEnrollment } from '$lib/types';
import { sanitizeInput } from './security';

// LRN validation (12 digits)
export function validateLRN(lrn: string): boolean {
  return /^\d{12}$/.test(lrn);
}

// Phone number validation (Philippine format)
export function validatePhoneNumber(phone: string): boolean {
  // Accept formats: 09XX-XXX-XXXX, +639XX-XXX-XXXX, 09XXXXXXXXX
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(cleaned);
}

// Email validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Age validation (5-25 years old for students)
export function validateAge(age: number): boolean {
  return age >= 5 && age <= 25;
}

// General average validation (60-100)
export function validateGeneralAverage(average: number): boolean {
  return average >= 60 && average <= 100;
}

// Name validation (letters, spaces, hyphens, apostrophes)
export function validateName(name: string): boolean {
  return /^[a-zA-Z\s\-'ñÑ]+$/.test(name) && name.trim().length >= 2;
}

// Date validation
export function validateDate(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && parsed <= new Date();
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
  
  // XSS Prevention - Sanitize all string inputs
  Object.keys(data).forEach(key => {
    if (typeof (data as any)[key] === 'string') {
      (data as any)[key] = sanitizeInput((data as any)[key]);
    }
  });
  
  // LRN Validation (exactly 12 digits)
  if (!data.lrn || !validateLRN(data.lrn)) {
    errors.push({ field: 'lrn', message: 'LRN must be exactly 12 digits' });
  }
  
  // Name Validation (letters, spaces, hyphens, apostrophes only)
  if (!data.fullName || !validateName(data.fullName)) {
    errors.push({ field: 'fullName', message: 'Please enter a valid name' });
  }
  
  // Email Validation (if provided)
  if (data.userEmail && !validateEmail(data.userEmail)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  // Phone Validation (Philippine format)
  if (!data.contactNumber || !validatePhoneNumber(data.contactNumber)) {
    errors.push({ field: 'contactNumber', message: 'Please enter a valid Philippine mobile number' });
  }
  
  // Age Validation
  if (data.age !== undefined) {
    const age = typeof data.age === 'string' ? parseInt(data.age) : data.age;
    if (isNaN(age) || !validateAge(age)) {
      errors.push({ field: 'age', message: 'Age must be between 5 and 25' });
    }
  }
  
  // Birth Date Validation
  if (!data.birthDate || !validateDate(data.birthDate)) {
    errors.push({ field: 'birthDate', message: 'Please enter a valid birth date' });
  }
  
  // General Average Validation
  if (data.generalAverage !== undefined) {
    const average = typeof data.generalAverage === 'string' ? parseFloat(data.generalAverage) : data.generalAverage;
    if (isNaN(average) || !validateGeneralAverage(average)) {
      errors.push({ field: 'generalAverage', message: 'General average must be between 60 and 100' });
    }
  }
  
  // Address Length Check
  if (!data.address || data.address.length < 10 || data.address.length > 200) {
    errors.push({ field: 'address', message: 'Address must be between 10 and 200 characters' });
  }
  
  // Religion Field
  if (!data.religion || data.religion.length < 3 || data.religion.length > 50) {
    errors.push({ field: 'religion', message: 'Religion must be between 3 and 50 characters' });
  }
  
  // Guardian validation
  if (!data.guardianName || data.guardianName.length < 3) {
    errors.push({ field: 'guardianName', message: 'Guardian name is required' });
  }
  
  if (!data.guardianRelation || data.guardianRelation.length < 2) {
    errors.push({ field: 'guardianRelation', message: 'Guardian relationship is required' });
  }
  
  // At least one document required
  if (!data.hasForm10 && !data.hasPSA && !data.hasBaptismal && !data.hasGoodMoral) {
    errors.push({ field: 'documents', message: 'Please provide at least one document' });
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
    errors.push({ field: 'strand', message: 'Please select academic strand' });
  }
  
  if (!data.semester) {
    errors.push({ field: 'semester', message: 'Please select semester' });
  }
  
  if (!data.birthPlace || data.birthPlace.trim().length < 3) {
    errors.push({ field: 'birthPlace', message: 'Please enter birth place' });
  }
  
  if (!data.fatherName || !validateName(data.fatherName)) {
    errors.push({ field: 'fatherName', message: 'Please enter father\'s name' });
  }
  
  if (!data.motherName || !validateName(data.motherName)) {
    errors.push({ field: 'motherName', message: 'Please enter mother\'s name' });
  }
  
  // At least one document required (senior high specific)
  const hasAnyDocument = data.hasForm9 || data.hasForm10 || data.hasPSA || 
                        data.hasMoral || data.hasBaptismal || data.hasCompletionCert || 
                        data.hasESC || data.hasNCAE;
  
  if (!hasAnyDocument) {
    errors.push({ field: 'documents', message: 'Please provide at least one document' });
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