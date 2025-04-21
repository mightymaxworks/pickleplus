/**
 * PKL-278651-BOUNCE-0005-AUTO - UUID Helpers
 * 
 * This file provides utility functions for generating UUIDs without external dependencies.
 * It implements a basic UUID v4 generator.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import crypto from 'crypto';

/**
 * Generate a UUID v4 (random) string
 * @returns UUID v4 string
 */
export function generateClientUuid(): string {
  // Generate 16 random bytes (128 bits)
  const bytes = crypto.randomBytes(16);
  
  // Set the version (4) and variant (RFC4122) bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122
  
  // Convert to hex string with hyphens at the correct positions
  const hexBytes = bytes.toString('hex');
  return [
    hexBytes.substring(0, 8),
    hexBytes.substring(8, 12),
    hexBytes.substring(12, 16),
    hexBytes.substring(16, 20),
    hexBytes.substring(20, 32)
  ].join('-');
}

/**
 * Validate a UUID string
 * @param uuid UUID string to validate
 * @returns Whether the string is a valid UUID
 */
export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if a UUID is a v4 UUID
 * @param uuid UUID string to check
 * @returns Whether the UUID is a v4 UUID
 */
export function isUuidV4(uuid: string): boolean {
  if (!validateUuid(uuid)) {
    return false;
  }
  
  // The third group should start with "4" for version 4 UUIDs
  const parts = uuid.split('-');
  return parts[2].charAt(0) === '4';
}

/**
 * Generate a short unique ID (not a UUID)
 * This is useful for generating human-readable identifiers.
 * @param length Length of the ID to generate (default: 8)
 * @returns Short unique ID
 */
export function generateShortId(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let id = '';
  
  for (let i = 0; i < length; i++) {
    id += characters.charAt(bytes[i] % characters.length);
  }
  
  return id;
}