// src/lib/utils/encryption.ts
import CryptoJS from 'crypto-js';

// Environment variable for encryption key - store this securely!
// In production, this should be in your .env file and never committed to git
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-32-character-secret-key-here!';

// Development warning
if (import.meta.env.DEV && ENCRYPTION_KEY === 'your-32-character-secret-key-here!') {
  console.warn('⚠️ Using default encryption key. Please set VITE_ENCRYPTION_KEY in your .env file for security.');
}

// Fields to encrypt (sensitive personal information)
const FIELDS_TO_ENCRYPT = [
  'fullName',
  'birthDate',
  'birthPlace',
  'address',
  'guardianName',
  'guardianRelation',
  'contactNumber',
  'fatherName',
  'motherName',
  'fatherOccupation',
  'motherOccupation',
  'lastSchool',
  'lrn' // LRN is sensitive as it's a unique identifier
];

// Fields that should remain unencrypted for querying/filtering
const UNENCRYPTED_FIELDS = [
  'id',
  'type',
  'status',
  'schoolYear',
  'gradeLevel',
  'strand',
  'semester',
  'userId',
  'userEmail',
  'submittedAt',
  'updatedAt',
  'generalAverage',
  'age',
  'gender',
  'religion',
  'isTransferee',
  'isESCGrantee',
  'hasForm9',
  'hasForm10',
  'hasPSA',
  'hasMoral',
  'hasGoodMoral',
  'hasBaptismal',
  'hasCompletionCert',
  'hasESC',
  'hasNCAE',
  'hasAcademicExcellence',
  'hasAcademicAward'
];

/**
 * Generate a random IV for each encryption
 */
function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Encrypt a single value
 */
function encryptValue(value: string, iv: string): string {
  if (!value) return '';
  
  try {
    const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a single value
 */
function decryptValue(encryptedValue: string, iv: string): string {
  if (!encryptedValue) return '';
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption Failed]';
  }
}

/**
 * Encrypt enrollment data before sending to database
 */
export function encryptEnrollmentData(data: any): any {
  // Generate a unique IV for this enrollment
  const iv = generateIV();
  
  // Create encrypted data object
  const encryptedData: any = {
    ...data,
    _iv: iv, // Store IV with the data for decryption
    _encrypted: true, // Flag to indicate this data is encrypted
    _encryptedAt: new Date().toISOString()
  };
  
  // Encrypt sensitive fields
  FIELDS_TO_ENCRYPT.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const value = String(data[field]);
      if (value) {
        encryptedData[field] = encryptValue(value, iv);
      }
    }
  });
  
  // Create a searchable hash of the full name (for admin searching)
  if (data.fullName) {
    // Create a one-way hash for searching (admin can search by name)
    const nameChars: string[] = Array.from(data.fullName.toLowerCase());
    const nameHash = nameChars
      .reduce((hash: number, char: string) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
      .toString(36);
    encryptedData._searchHash = nameHash;
  }
  
  return encryptedData;
}

/**
 * Decrypt enrollment data (for admin use only)
 */
export function decryptEnrollmentData(encryptedData: any): any {
  // Check if data is encrypted
  if (!encryptedData._encrypted || !encryptedData._iv) {
    console.warn('Data does not appear to be encrypted');
    return encryptedData;
  }
  
  const iv = encryptedData._iv;
  const decryptedData: any = { ...encryptedData };
  
  // Remove encryption metadata
  delete decryptedData._iv;
  delete decryptedData._encrypted;
  delete decryptedData._encryptedAt;
  delete decryptedData._searchHash;
  
  // Decrypt sensitive fields
  FIELDS_TO_ENCRYPT.forEach(field => {
    if (encryptedData[field]) {
      try {
        decryptedData[field] = decryptValue(encryptedData[field], iv);
      } catch (error) {
        console.error(`Failed to decrypt field: ${field}`, error);
        decryptedData[field] = '[Decryption Error]';
      }
    }
  });
  
  return decryptedData;
}

/**
 * Batch decrypt multiple enrollments (for admin dashboard)
 */
export function decryptEnrollmentBatch(enrollments: any[]): any[] {
  return enrollments.map(enrollment => decryptEnrollmentData(enrollment));
}

/**
 * Check if user has permission to decrypt (must be admin)
 */
export function canDecrypt(userRole: string | undefined): boolean {
  return userRole === 'admin';
}

/**
 * Create a secure summary of enrollment for non-admin views
 * Shows only non-sensitive information
 */
export function getEnrollmentSummary(enrollment: any): any {
  const summary: any = {};
  
  // Only include non-sensitive fields
  UNENCRYPTED_FIELDS.forEach(field => {
    if (enrollment[field] !== undefined) {
      summary[field] = enrollment[field];
    }
  });
  
  // Add masked versions of some fields
  if (enrollment.fullName && !enrollment._encrypted) {
    // If not encrypted, mask the name
    const names = enrollment.fullName.split(' ');
    summary.maskedName = names.map((name: string, index: number) => 
      index === 0 ? name : name.charAt(0) + '***'
    ).join(' ');
  } else {
    summary.maskedName = 'Encrypted';
  }
  
  return summary;
}

/**
 * Validate encryption key is properly set
 */
export function isEncryptionConfigured(): boolean {
  // Check if we're using the default key
  const isDefaultKey = ENCRYPTION_KEY === 'your-32-character-secret-key-here!';
  
  // Check if key exists and is long enough
  const hasValidKey = ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 32;
  
  // Return true if we have a valid non-default key
  return hasValidKey && !isDefaultKey;
}