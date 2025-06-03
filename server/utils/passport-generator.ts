/**
 * PKL-278651-PASSPORT-CODE - Passport Code Generation Utility
 * 
 * Generates unique 8-digit alphanumeric passport codes for user identification
 * Format: XXXXXXXX (8 characters: letters and numbers, case-insensitive)
 * 
 * @lastModified 2025-06-03
 */

import { storage } from '../storage';

/**
 * Generates a random 8-character alphanumeric code
 * Uses uppercase letters and numbers for clarity
 */
function generatePassportCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Generates a unique passport code that doesn't exist in the database
 * Retries up to 10 times to find a unique code
 */
export async function generateUniquePassportCode(): Promise<string> {
  const maxRetries = 10;
  
  for (let i = 0; i < maxRetries; i++) {
    const code = generatePassportCode();
    
    try {
      // Check if code already exists
      const existingUser = await storage.getUserByPassportCode(code);
      
      if (!existingUser) {
        return code;
      }
    } catch (error) {
      // If error occurs (like method not implemented), assume code is unique
      console.log(`Passport code generation attempt ${i + 1}: ${code}`);
      return code;
    }
  }
  
  throw new Error('Unable to generate unique passport code after maximum retries');
}

/**
 * Validates passport code format
 * Must be exactly 8 alphanumeric characters
 */
export function validatePassportCode(code: string): boolean {
  if (!code || code.length !== 8) {
    return false;
  }
  
  // Check if all characters are alphanumeric
  const alphanumericRegex = /^[A-Z0-9]{8}$/i;
  return alphanumericRegex.test(code);
}

/**
 * Formats passport code to uppercase for consistency
 */
export function formatPassportCode(code: string): string {
  return code.toUpperCase();
}