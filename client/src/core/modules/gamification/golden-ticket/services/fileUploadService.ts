/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * File Upload Service
 * 
 * This service handles file uploads for the Golden Ticket system,
 * including sponsor logos and promotional images.
 */

// Remove debugApiRequest import as we're using fetch directly

const API_BASE = '/api/golden-ticket';

/**
 * Error type for file uploads
 */
export type FileUploadError = {
  message: string;
  code: string;
};

/**
 * Response from a successful file upload
 */
export type FileUploadResponse = {
  filePath: string;
  url: string;
  fileId?: string;
};

/**
 * Max file size in bytes (2MB)
 */
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Allowed file types for images
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validate a file for upload
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSize Maximum file size in bytes
 * @returns Error or null if valid
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES,
  maxSize: number = MAX_FILE_SIZE
): FileUploadError | null {
  if (!file) {
    return { message: 'No file selected', code: 'NO_FILE' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      code: 'INVALID_TYPE',
    };
  }

  if (file.size > maxSize) {
    return {
      message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      code: 'FILE_TOO_LARGE',
    };
  }

  return null;
}

/**
 * Upload a sponsor logo
 * @param file The logo file to upload
 * @returns Promise with upload response
 */
export async function uploadSponsorLogo(file: File): Promise<FileUploadResponse> {
  const error = validateFile(file);
  if (error) {
    throw error;
  }

  const formData = new FormData();
  formData.append('logo', file);

  // Create a custom wrapper to handle FormData
  const response = await fetch(`${API_BASE}/admin/sponsors/upload-logo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw {
      message: errorData.error || 'Error uploading file',
      code: errorData.code || 'UPLOAD_FAILED',
    };
  }

  return await response.json();
}

/**
 * Upload a promotional image for a golden ticket
 * @param file The image file to upload
 * @returns Promise with upload response
 */
export async function uploadPromotionalImage(file: File): Promise<FileUploadResponse> {
  console.log('Starting promotional image upload for:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`
  });
  
  const error = validateFile(file);
  if (error) {
    console.error('Validation error:', error);
    throw error;
  }

  const formData = new FormData();
  formData.append('image', file);

  console.log('Uploading to:', `${API_BASE}/admin/tickets/upload-image`);
  
  try {
    // Create a custom wrapper to handle FormData
    const response = await fetch(`${API_BASE}/admin/tickets/upload-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse error response:', responseText);
        errorData = { error: 'Unknown error', code: 'PARSE_ERROR' };
      }
      
      console.error('Upload failed with status:', response.status, errorData);
      
      throw {
        message: errorData.error || 'Error uploading file',
        code: errorData.code || 'UPLOAD_FAILED',
      };
    }

    const responseData = await response.json();
    console.log('Upload successful, server response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Exception during upload:', error);
    
    if (error instanceof Error) {
      throw {
        message: error.message || 'Error uploading file',
        code: 'UPLOAD_EXCEPTION',
      };
    }
    
    throw error;
  }
}