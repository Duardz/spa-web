import type { ValidationError, JuniorHighEnrollment, SeniorHighEnrollment } from '$lib/types';

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
  return /^[a-zA-Z\s'-]+$/.test(name) && name.trim().length >= 2;
}

// Date validation
export function validateDate(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && parsed <= new Date();
}

// Validate Junior High Form
export function validateJuniorHighForm(data: Partial<JuniorHighEnrollment>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.lrn || !validateLRN(data.lrn)) {
    errors.push({ field: 'lrn', message: 'LRN must be 12 digits' });
  }
  
  if (!data.fullName || !validateName(data.fullName)) {
    errors.push({ field: 'fullName', message: 'Please enter a valid name' });
  }
  
  if (!data.birthDate || !validateDate(data.birthDate)) {
    errors.push({ field: 'birthDate', message: 'Please enter a valid birth date' });
  }
  
  if (!data.age || !validateAge(data.age)) {
    errors.push({ field: 'age', message: 'Age must be between 5 and 25' });
  }
  
  if (!data.gender) {
    errors.push({ field: 'gender', message: 'Please select gender' });
  }
  
  if (!data.religion || data.religion.trim().length < 2) {
    errors.push({ field: 'religion', message: 'Please enter religion' });
  }
  
  if (!data.address || data.address.trim().length < 10) {
    errors.push({ field: 'address', message: 'Please enter complete address' });
  }
  
  if (!data.guardianName || !validateName(data.guardianName)) {
    errors.push({ field: 'guardianName', message: 'Please enter guardian name' });
  }
  
  if (!data.contactNumber || !validatePhoneNumber(data.contactNumber)) {
    errors.push({ field: 'contactNumber', message: 'Please enter valid contact number' });
  }
  
  if (!data.lastSchool || data.lastSchool.trim().length < 5) {
    errors.push({ field: 'lastSchool', message: 'Please enter last school attended' });
  }
  
  if (!data.generalAverage || !validateGeneralAverage(data.generalAverage)) {
    errors.push({ field: 'generalAverage', message: 'General average must be between 60 and 100' });
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
  
  // All junior high validations apply
  const baseErrors = validateJuniorHighForm(data as Partial<JuniorHighEnrollment>);
  errors.push(...baseErrors.filter(e => e.field !== 'documents')); // Remove document check
  
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