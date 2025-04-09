/**
 * Utility for generating and validating unique passport codes
 * Part of PKL-278651-USER-0004-ID sprint
 */

import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates a random 7-character alphanumeric passport code
 * Format: "91Zh5Y6" - mix of uppercase, lowercase, and numbers
 */
export function generatePassportCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generates a unique passport code that doesn't exist in the database
 * Retries up to maxAttempts times if a collision occurs
 */
export async function generateUniquePassportCode(maxAttempts = 10): Promise<string | null> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const code = generatePassportCode();
    
    // Check if code already exists in database
    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.passportCode, code))
      .limit(1);
    
    if (existingUser.length === 0) {
      return code; // Code is unique
    }
    
    attempts++;
  }
  
  // If we've reached maxAttempts and still haven't found a unique code
  console.error(`Failed to generate unique passport code after ${maxAttempts} attempts`);
  return null;
}

/**
 * Validates a passport code format (7 characters, alphanumeric)
 */
export function isValidPassportCode(code: string): boolean {
  return /^[A-Za-z0-9]{7}$/.test(code);
}