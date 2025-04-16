/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Binary Utilities for Community Module
 * 
 * This file provides utilities for binary data manipulation specifically for the 
 * Community Hub module, following Framework 5.0 principles of targeted abstractions
 * instead of general-purpose polyfills.
 */

/**
 * A lightweight utility class for handling binary data operations required by the Community Hub
 */
export class BinaryUtils {
  /**
   * Generate a hexadecimal hash for a string - for client-side use only
   * This is primarily used for consistent rendering of community identifiers
   */
  static generateSimpleHash(input: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      h1 = Math.imul(h1 ^ byte, 2654435761);
      h2 = Math.imul(h2 ^ byte, 1597334677);
    }
    
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    
    // Convert to 8-digit hex
    return (h2 >>> 0).toString(16).padStart(8, '0');
  }
  
  /**
   * Generate a consistent color code from a string - useful for community avatars and visuals
   */
  static generateConsistentColor(input: string): string {
    const hash = this.generateSimpleHash(input);
    // Using parts of the hash for RGB components
    const r = parseInt(hash.substring(0, 2), 16);
    const g = parseInt(hash.substring(2, 4), 16);
    const b = parseInt(hash.substring(4, 6), 16);
    
    // Return a valid CSS RGB color string
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Utility for safely using binary data in the browser
 * This provides a targeted solution for community-specific binary needs
 */
export class CommunityBinaryData {
  // Use standard browser APIs for binary operations
  private data: Uint8Array;
  
  constructor(size: number) {
    this.data = new Uint8Array(size);
  }
  
  /**
   * Create a binary data object from a community name
   */
  static fromCommunityName(name: string): CommunityBinaryData {
    const encoder = new TextEncoder();
    const data = encoder.encode(name);
    const result = new CommunityBinaryData(data.length);
    result.data = data;
    return result;
  }
  
  /**
   * Convert to string representation
   */
  toString(): string {
    const decoder = new TextDecoder();
    return decoder.decode(this.data);
  }
  
  /**
   * Get a binary identifier for a community
   */
  toIdentifier(): string {
    return BinaryUtils.generateSimpleHash(this.toString());
  }
}