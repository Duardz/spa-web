// place files you want to import through the `$lib` alias in this folder.
// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'admin';
}

// Enrollment types - Added 'rejected' status
export type EnrollmentStatus = 'submitted' | 'verified' | 'printed' | 'rejected' | 'archived';
export type GradeLevel = '7' | '8' | '9' | '10' | '11' | '12';
export type Strand = 'STEM' | 'HUMSS' | 'ABM';
export type Semester = '1st' | '2nd';

// Base enrollment interface
interface BaseEnrollment {
  id?: string;
  userId: string;
  userEmail: string;
  status: EnrollmentStatus;
  submittedAt: Date;
  updatedAt: Date;
  schoolYear: string;
  
  // Personal info
  lrn: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: 'Male' | 'Female';
  religion: string;
  address: string;
  
  // Academic info
  lastSchool: string;
  generalAverage: number;
  isTransferee: boolean;
  
  // Contact info
  guardianName: string;
  guardianRelation: string;
  contactNumber: string;
  
  // Admin notes (for rejection reasons, etc.)
  adminNotes?: string;
  rejectionReason?: string;
  
  // Signatures (base64 or URL)
  studentSignature?: string;
  parentSignature?: string;
  teacherSignature?: string;
  principalSignature?: string;
  cashierSignature?: string;
}

// Junior High enrollment
export interface JuniorHighEnrollment extends BaseEnrollment {
  type: 'junior';
  gradeLevel: Extract<GradeLevel, '7' | '8' | '9' | '10'>;
  
  // Documents
  hasForm10: boolean;
  hasPSA: boolean;
  hasBaptismal: boolean;
  hasGoodMoral: boolean;
  
  // Academic
  hasAcademicExcellence: boolean;
}

// Senior High enrollment
export interface SeniorHighEnrollment extends BaseEnrollment {
  type: 'senior';
  gradeLevel: Extract<GradeLevel, '11' | '12'>;
  strand: Strand;
  semester: Semester;
  isESCGrantee: boolean;
  
  // Additional personal info
  birthPlace: string;
  
  // Parents info
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  
  // Documents
  hasForm9: boolean;
  hasForm10: boolean;
  hasPSA: boolean;
  hasMoral: boolean;
  hasBaptismal: boolean;
  hasCompletionCert: boolean;
  hasESC: boolean;
  hasNCAE: boolean;
  
  // Academic
  hasAcademicAward: boolean;
}

export type Enrollment = JuniorHighEnrollment | SeniorHighEnrollment;

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

// News post type
export interface NewsPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

// Admin dashboard stats
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

// Form validation errors
export interface ValidationError {
  field: string;
  message: string;
}