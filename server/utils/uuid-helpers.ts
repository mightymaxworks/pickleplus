/**
 * PKL-278651-BOUNCE-0005-AUTO - UUID Helpers
 * 
 * This file provides utilities for generating UUIDs without external dependencies.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

/**
 * Generate a RFC4122 version 4 UUID
 * This is a dependency-free implementation
 * 
 * @returns A UUID v4 string
 */
export function generateUuidV4(): string {
  // Create array of random bytes
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  
  // Set the version (4) and variant (RFC4122) bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // version 4
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // variant RFC4122
  
  // Convert to hex strings
  const byteToHex: string[] = [];
  for (let i = 0; i < 256; i++) {
    byteToHex[i] = (i + 0x100).toString(16).substring(1);
  }
  
  // Format as UUID string (8-4-4-4-12)
  return (
    byteToHex[randomBytes[0]] +
    byteToHex[randomBytes[1]] +
    byteToHex[randomBytes[2]] +
    byteToHex[randomBytes[3]] +
    '-' +
    byteToHex[randomBytes[4]] +
    byteToHex[randomBytes[5]] +
    '-' +
    byteToHex[randomBytes[6]] +
    byteToHex[randomBytes[7]] +
    '-' +
    byteToHex[randomBytes[8]] +
    byteToHex[randomBytes[9]] +
    '-' +
    byteToHex[randomBytes[10]] +
    byteToHex[randomBytes[11]] +
    byteToHex[randomBytes[12]] +
    byteToHex[randomBytes[13]] +
    byteToHex[randomBytes[14]] +
    byteToHex[randomBytes[15]]
  );
}

/**
 * Validate a UUID v4 string
 * 
 * @param uuid String to validate
 * @returns Whether the string is a valid UUID v4
 */
export function isValidUuidV4(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/**
 * Generate a time-based UUID with nano precision
 * This is useful for sorting UUIDs chronologically
 * 
 * @returns A time-based UUID string
 */
export function generateTimeBasedUuid(): string {
  // Get current time in milliseconds
  const now = new Date().getTime();
  
  // Generate 6 random bytes (48 bits)
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  
  // Convert time to hex (48 bits / 6 bytes)
  const timeHex = ('0000000000000' + now.toString(16)).slice(-12);
  
  // Convert random bytes to hex (48 bits / 6 bytes)
  let randomHex = '';
  for (let i = 0; i < 6; i++) {
    randomHex += ('00' + randomBytes[i].toString(16)).slice(-2);
  }
  
  // Format: first 6 bytes are time-based, last 10 bytes are random
  // Format as: time(6 bytes)-random(4 bytes)-random(6 bytes)
  return (
    timeHex.substring(0, 8) +
    '-' +
    timeHex.substring(8, 12) +
    '-' +
    randomHex.substring(0, 4) +
    '-' +
    randomHex.substring(4, 8) +
    '-' +
    randomHex.substring(8, 12) +
    randomHex.substring(12)
  );
}

export default {
  generateUuidV4,
  isValidUuidV4,
  generateTimeBasedUuid
};