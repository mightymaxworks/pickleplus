/**
 * PKL-278651-COMM-0019-VISUALS
 * Community Visual Enhancements - File Upload Handler
 * 
 * This file provides multer configuration for community avatar and banner uploads.
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { Request } from 'express';

// Configure multer storage for community visual uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    // Determine which type of upload (avatar or banner)
    let uploadPath = 'uploads/communities';
    
    if (req.path.includes('/avatar')) {
      uploadPath = 'uploads/communities/avatars';
    } else if (req.path.includes('/banner')) {
      uploadPath = 'uploads/communities/banners';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    // Extract community ID from request params
    const communityId = req.params.id;
    
    // Generate a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `community_${communityId}_${nanoid(8)}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to validate uploaded files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit for images
  }
});

// Constants for file validation
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validate a file for upload
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSize Maximum file size in bytes
 * @returns Error message or null if valid
 */
export function validateFile(
  file: Express.Multer.File,
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES,
  maxSize: number = MAX_FILE_SIZE
): string | null {
  if (!file) {
    return 'No file provided';
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  if (file.size > maxSize) {
    return `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`;
  }

  return null;
}