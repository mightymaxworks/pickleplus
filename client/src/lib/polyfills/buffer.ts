/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Browser Buffer Polyfill
 * 
 * This file provides a polyfill for Node.js Buffer in browser environments.
 * It's needed because some modules used in the community hub implementation
 * might be using Node.js Buffer API.
 */

// Create a minimal Buffer implementation for browser environments
class BufferPolyfill {
  static isBuffer(obj: any): boolean {
    return obj instanceof BufferPolyfill;
  }

  static from(value: string | ArrayBuffer | ArrayBufferView, encoding?: string): BufferPolyfill {
    return new BufferPolyfill();
  }

  static alloc(size: number): BufferPolyfill {
    return new BufferPolyfill();
  }

  static allocUnsafe(size: number): BufferPolyfill {
    return new BufferPolyfill();
  }

  static allocUnsafeSlow(size: number): BufferPolyfill {
    return new BufferPolyfill();
  }

  static byteLength(string: string, encoding?: string): number {
    return string.length;
  }

  static isEncoding(encoding: string): boolean {
    return true;
  }

  static concat(list: BufferPolyfill[], totalLength?: number): BufferPolyfill {
    return new BufferPolyfill();
  }

  toString(encoding?: string): string {
    return '';
  }

  write(string: string, offset?: number, length?: number, encoding?: string): number {
    return 0;
  }

  toJSON(): { type: string; data: any } {
    return { type: 'Buffer', data: [] };
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).Buffer = BufferPolyfill;
}

export { BufferPolyfill as Buffer };