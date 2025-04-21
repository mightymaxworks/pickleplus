/**
 * PKL-278651-BOUNCE-0005-AUTO - UUID Helpers
 * 
 * This file provides a dependency-free UUID v4, specifically for environments
 * where external libraries are not available or desired.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

/**
 * Generate a random hexadecimal string of the specified length
 * @param length Length of the string to generate
 * @returns Random hexadecimal string
 */
function randomHex(length: number): string {
  let result = '';
  const characters = '0123456789abcdef';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Generate a UUID v4 (random) without dependencies
 * @returns UUID v4 string
 */
export function v4(): string {
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where y is 8, 9, a, or b
  
  const part1 = randomHex(8);
  const part2 = randomHex(4);
  
  // Use '4' for the version
  let part3 = '4' + randomHex(3);
  
  // Use '8', '9', 'a', or 'b' for the variant
  const variantChar = ['8', '9', 'a', 'b'][Math.floor(Math.random() * 4)];
  const part4 = variantChar + randomHex(3);
  
  const part5 = randomHex(12);
  
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

/**
 * Validate a UUID string to ensure it's properly formatted
 * @param uuid String to validate
 * @returns Whether the string is a valid UUID
 */
export function validate(uuid: string): boolean {
  // UUID format: 8-4-4-4-12 hex digits
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Convert a string to a more deterministic UUID-like string
 * Useful for generating IDs based on known strings
 * @param input Input string
 * @returns UUID-like string derived from the input
 */
export function fromString(input: string): string {
  // Simple hash function
  function hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0; // Convert to 32bit integer
    }
    return Math.abs(h);
  }
  
  const hashValue = hash(input);
  const timestamp = new Date().getTime();
  
  // Create parts based on hash and timestamp
  const part1 = (hashValue & 0xFFFFFFFF).toString(16).padStart(8, '0');
  const part2 = ((hashValue >> 16) & 0xFFFF).toString(16).padStart(4, '0');
  
  // UUID v4 format with some deterministic parts
  const part3 = '4' + ((hashValue >> 8) & 0xFFF).toString(16).padStart(3, '0');
  const part4 = '8' + ((hashValue >> 4) & 0xFFF).toString(16).padStart(3, '0');
  
  // Use timestamp for the last part to ensure uniqueness
  const part5 = timestamp.toString(16).padStart(12, '0');
  
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

/**
 * Generate a nil UUID (all zeros)
 * @returns Nil UUID string
 */
export function nil(): string {
  return '00000000-0000-0000-0000-000000000000';
}

// Example usage
// console.log(v4()); // Random UUID v4
// console.log(validate('123e4567-e89b-12d3-a456-426614174000')); // true
// console.log(fromString('example input')); // Deterministic UUID-like string
// console.log(nil()); // 00000000-0000-0000-0000-000000000000