// src/lib/utils/fileValidation.ts
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateFile(file: File): Promise<FileValidationResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, GIF, and PDF files are allowed'
    };
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
  
  if (!extension || !validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Invalid file extension'
    };
  }
  
  // Verify file content matches MIME type (magic numbers)
  return new Promise<FileValidationResult>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      
      // Check magic numbers
      const validHeaders: Record<string, string[]> = {
        '89504e47': ['png'],
        'ffd8ffe0': ['jpg', 'jpeg'],
        'ffd8ffe1': ['jpg', 'jpeg'],
        'ffd8ffe2': ['jpg', 'jpeg'],
        '47494638': ['gif'],
        '25504446': ['pdf']
      };
      
      let isValidHeader = false;
      for (const [magicNumber, extensions] of Object.entries(validHeaders)) {
        if (header.toLowerCase().startsWith(magicNumber) && 
            extension && extensions.includes(extension)) {
          isValidHeader = true;
          break;
        }
      }
      
      resolve({
        isValid: isValidHeader,
        error: isValidHeader ? undefined : 'File content does not match file type'
      });
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}