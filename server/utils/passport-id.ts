/**
 * Utility functions for generating and validating Pickle+ Passport IDs
 * Format: PKL-XXXX-YYY where XXXX is a 4-digit number and YYY is a 3-letter code
 */

import { storage } from "../storage";

// Characters allowed in the alpha part of the passport ID (avoiding confusing chars like O/0, I/1, etc)
const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a random passport ID in the format PKL-XXXX-YYY
 * @returns {string} A unique passport ID
 */
export async function generatePassportId(): Promise<string> {
  let isUnique = false;
  let passportId = "";
  
  while (!isUnique) {
    // Generate the numeric part (4 digits)
    const numericPart = String(Math.floor(1000 + Math.random() * 9000));
    
    // Generate the alpha part (3 characters)
    let alphaPart = "";
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * ALLOWED_CHARS.length);
      alphaPart += ALLOWED_CHARS[randomIndex];
    }
    
    // Combine parts to form the passport ID
    passportId = `PKL-${numericPart}-${alphaPart}`;
    
    // Check if this ID already exists in the database
    const existingUser = await storage.getUserByPassportId(passportId);
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return passportId;
}

/**
 * Validates a passport ID format
 * @param {string} passportId - The passport ID to validate
 * @returns {boolean} True if the format is valid
 */
export function validatePassportId(passportId: string): boolean {
  const regex = /^PKL-\d{4}-[A-Z0-9]{3}$/;
  return regex.test(passportId);
}