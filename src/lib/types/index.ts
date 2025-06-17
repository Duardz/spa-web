// src/lib/types/index.ts

// Base enrollment interface with common fields
export interface BaseEnrollment {
  id?: string;
  type: 'junior' | 'senior';
  schoolYear: string;
  status: EnrollmentStatus;
  submittedAt: Date;
  updatedAt: Date;
  userId: string;
  userEmail: string;
  
  // Personal Information
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  religion: string;
  address: string;
  
  // Academic Information
  gradeLevel: string;
  lastSchool: string;
  generalAverage: number;
  isTransferee: boolean;
  lrn: string;
  
  // Contact Information
  contactNumber: string;
  
  // Guardian Information
  guardianName: string;
  guardianRelation: string;
  
  // ESC Grant
  isESCGrantee: boolean;
  
  // Rejection reason (if rejected)
  rejectionReason?: string;
  
  // Encryption fields
  _encrypted?: boolean;
  _iv?: string;
  _encryptedAt?: string;
  _searchHash?: string;
}

// Junior High specific fields
export interface JuniorHighEnrollment extends BaseEnrollment {
  type: 'junior';
  
  // Document Requirements
  hasForm9: boolean;
  hasForm10: boolean;
  hasPSA: boolean;
  hasGoodMoral: boolean;
  hasBaptismal: boolean;
  
  // Achievement fields
  hasAcademicExcellence?: boolean;
  hasAcademicAward?: boolean;
}

// Senior High specific fields
export interface SeniorHighEnrollment extends BaseEnrollment {
  type: 'senior';
  
  // Additional Personal Information
  birthPlace: string;
  
  // Academic Information
  strand: string;
  semester: string;
  
  // Parent Information
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  
  // Document Requirements
  hasForm9: boolean;
  hasForm10: boolean;
  hasPSA: boolean;
  hasGoodMoral: boolean;
  hasCompletionCert: boolean;
  hasESC: boolean;
  hasNCAE: boolean;
  
  // Achievement fields
  hasAcademicExcellence?: boolean;
  hasAcademicAward?: boolean;
}

// Union type for all enrollments
export type Enrollment = JuniorHighEnrollment | SeniorHighEnrollment;

// Status types
export type EnrollmentStatus = 'submitted' | 'verified' | 'printed' | 'rejected' | 'archived';

// Dashboard Stats
export interface DashboardStats {
  totalEnrollments: number;
  pendingVerification: number;
  verifiedToday: number;
  rejectedCount: number;
  juniorHighCount: number;
  seniorHighCount: number;
  todayApplications: number;
  weekApplications: number;
}

// Teacher type
export interface Teacher {
  id?: string;
  name: string;
  position: string;
  department: string;
  imageUrl?: string;
  email?: string;
  order: number;
}

// News Post type
export interface NewsPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl?: string;
  isPublished: boolean;
  publishedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// User type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'student' | 'admin';
}

// Settings type
export interface EnrollmentSettings {
  isOpen: boolean;
  schoolYear: string;
  juniorHighOpen?: boolean;
  seniorHighOpen?: boolean;
  message?: string;
}