/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Browser Buffer Polyfill and Binary Utilities
 * 
 * This file provides a comprehensive polyfill for Node.js Buffer in browser environments
 * and utilities for binary data manipulation in accordance with Framework 5.0 principles.
 * 
 * Instead of trying to fully emulate Node.js Buffer, we provide a minimal implementation
 * that satisfies our specific needs and a cleaner abstraction for binary operations.
 */

import { BinaryUtils, CommunityBinaryData } from '../utils/binaryUtils';

// Create a minimal Buffer implementation for browser environments
class BufferPolyfill {
  private data: Uint8Array;

  constructor(size?: number) {
    this.data = new Uint8Array(size || 0);
  }

  static isBuffer(obj: any): boolean {
    return obj instanceof BufferPolyfill;
  }

  static from(value: string | ArrayBuffer | ArrayBufferView | Array<number>, encoding?: string): BufferPolyfill {
    const buffer = new BufferPolyfill();
    
    if (typeof value === 'string') {
      const encoder = new TextEncoder();
      buffer.data = encoder.encode(value);
    } else if (value instanceof ArrayBuffer) {
      buffer.data = new Uint8Array(value);
    } else if (ArrayBuffer.isView(value)) {
      buffer.data = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    } else if (Array.isArray(value)) {
      buffer.data = new Uint8Array(value);
    }
    
    return buffer;
  }

  static alloc(size: number, fill?: number): BufferPolyfill {
    const buffer = new BufferPolyfill(size);
    if (fill !== undefined) {
      buffer.data.fill(fill);
    }
    return buffer;
  }

  static allocUnsafe(size: number): BufferPolyfill {
    return new BufferPolyfill(size);
  }

  static allocUnsafeSlow(size: number): BufferPolyfill {
    return new BufferPolyfill(size);
  }

  static byteLength(string: string, encoding?: string): number {
    const encoder = new TextEncoder();
    return encoder.encode(string).length;
  }

  static isEncoding(encoding: string): boolean {
    return ['utf8', 'utf-8', 'hex', 'base64'].includes(encoding.toLowerCase());
  }

  static concat(list: BufferPolyfill[], totalLength?: number): BufferPolyfill {
    let length = 0;
    if (totalLength === undefined) {
      for (const buf of list) {
        length += buf.data.length;
      }
    } else {
      length = totalLength;
    }

    const result = BufferPolyfill.allocUnsafe(length);
    let pos = 0;
    
    for (const buf of list) {
      const bufLength = Math.min(buf.data.length, length - pos);
      for (let i = 0; i < bufLength; i++) {
        result.data[pos + i] = buf.data[i];
      }
      pos += bufLength;
    }
    
    return result;
  }

  // Add method to write unsigned 32-bit Big Endian value
  writeUInt32BE(value: number, offset: number): number {
    this.data[offset] = (value >> 24) & 0xff;
    this.data[offset + 1] = (value >> 16) & 0xff;
    this.data[offset + 2] = (value >> 8) & 0xff;
    this.data[offset + 3] = value & 0xff;
    return offset + 4;
  }

  // Add method to write unsigned 16-bit Big Endian value
  writeUInt16BE(value: number, offset: number): number {
    this.data[offset] = (value >> 8) & 0xff;
    this.data[offset + 1] = value & 0xff;
    return offset + 2;
  }
  
  // Add method to write unsigned 8-bit value
  writeUInt8(value: number, offset: number): number {
    this.data[offset] = value & 0xff;
    return offset + 1;
  }

  // Add slice method
  slice(start: number = 0, end?: number): BufferPolyfill {
    const result = new BufferPolyfill();
    result.data = this.data.slice(start, end);
    return result;
  }

  // Add subarray method
  subarray(start: number = 0, end?: number): BufferPolyfill {
    const result = new BufferPolyfill();
    result.data = this.data.subarray(start, end);
    return result;
  }

  // Add method to read bytes
  readUInt8(offset: number): number {
    return this.data[offset];
  }

  readUInt16BE(offset: number): number {
    return (this.data[offset] << 8) | this.data[offset + 1];
  }

  readUInt32BE(offset: number): number {
    return (this.data[offset] << 24) | 
           (this.data[offset + 1] << 16) | 
           (this.data[offset + 2] << 8) | 
           this.data[offset + 3];
  }

  toString(encoding?: string): string {
    if (encoding === 'hex') {
      return Array.from(this.data)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    
    const decoder = new TextDecoder(encoding || 'utf-8');
    return decoder.decode(this.data);
  }

  write(string: string, offset?: number, length?: number, encoding?: string): number {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(string);
    const start = offset || 0;
    const end = length ? Math.min(start + length, this.data.length) : this.data.length;
    const bytesToCopy = Math.min(bytes.length, end - start);
    
    for (let i = 0; i < bytesToCopy; i++) {
      this.data[start + i] = bytes[i];
    }
    
    return bytesToCopy;
  }

  toJSON(): { type: string; data: number[] } {
    return { type: 'Buffer', data: Array.from(this.data) };
  }

  // Add method to get length
  get length(): number {
    return this.data.length;
  }

  // Allow indexing like an array
  [key: number]: number;

  // Add indexOf method
  indexOf(value: number | string | BufferPolyfill, byteOffset?: number): number {
    if (typeof value === 'string') {
      const valueBytes = new TextEncoder().encode(value);
      return this.indexOfBuffer(valueBytes, byteOffset || 0);
    } else if (typeof value === 'number') {
      return this.indexOfByte(value, byteOffset || 0);
    } else if (value instanceof BufferPolyfill) {
      return this.indexOfBuffer(value.data, byteOffset || 0);
    }
    return -1;
  }

  private indexOfByte(byte: number, byteOffset: number): number {
    for (let i = byteOffset; i < this.data.length; i++) {
      if (this.data[i] === byte) {
        return i;
      }
    }
    return -1;
  }

  private indexOfBuffer(buffer: Uint8Array, byteOffset: number): number {
    for (let i = byteOffset; i <= this.data.length - buffer.length; i++) {
      let found = true;
      for (let j = 0; j < buffer.length; j++) {
        if (this.data[i + j] !== buffer[j]) {
          found = false;
          break;
        }
      }
      if (found) {
        return i;
      }
    }
    return -1;
  }
}

// Proxy handler to allow array-like indexing
const bufferProxyHandler = {
  get(target: BufferPolyfill, prop: string | symbol): any {
    // Handle numeric property access
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      const index = Number(prop);
      if (index >= 0 && index < target.length) {
        return target.readUInt8(index);
      }
    }
    return (target as any)[prop];
  },
  
  set(target: BufferPolyfill, prop: string | symbol, value: any): boolean {
    // Handle numeric property access
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      const index = Number(prop);
      if (index >= 0 && index < target.length) {
        target.writeUInt8(value, index);
        return true;
      }
    }
    (target as any)[prop] = value;
    return true;
  }
};

// Factory function to create Buffer instances with array-like behavior
function createBuffer(size?: number): BufferPolyfill {
  const buffer = new BufferPolyfill(size);
  return new Proxy(buffer, bufferProxyHandler);
}

// Create factory methods on the proxy constructor
Object.defineProperties(createBuffer, {
  isBuffer: { value: BufferPolyfill.isBuffer },
  from: { 
    value: (value: string | ArrayBuffer | ArrayBufferView | Array<number>, encoding?: string): BufferPolyfill => {
      const buf = BufferPolyfill.from(value, encoding);
      return new Proxy(buf, bufferProxyHandler);
    }
  },
  alloc: {
    value: (size: number, fill?: number): BufferPolyfill => {
      const buf = BufferPolyfill.alloc(size, fill);
      return new Proxy(buf, bufferProxyHandler);
    }
  },
  allocUnsafe: {
    value: (size: number): BufferPolyfill => {
      const buf = BufferPolyfill.allocUnsafe(size);
      return new Proxy(buf, bufferProxyHandler);
    }
  },
  allocUnsafeSlow: {
    value: (size: number): BufferPolyfill => {
      const buf = BufferPolyfill.allocUnsafeSlow(size);
      return new Proxy(buf, bufferProxyHandler);
    }
  },
  byteLength: { value: BufferPolyfill.byteLength },
  isEncoding: { value: BufferPolyfill.isEncoding },
  concat: {
    value: (list: BufferPolyfill[], totalLength?: number): BufferPolyfill => {
      const buf = BufferPolyfill.concat(list, totalLength);
      return new Proxy(buf, bufferProxyHandler);
    }
  }
});

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).Buffer = createBuffer;
}

export { createBuffer as Buffer, BinaryUtils, CommunityBinaryData };