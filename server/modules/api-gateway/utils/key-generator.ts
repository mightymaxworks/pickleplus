/**
 * PKL-278651-API-0001-GATEWAY
 * API Key Generator Utility
 * 
 * Generates secure API keys with consistent format and handles validation.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../../../db';
import { apiKeys } from '../../../../shared/schema/api-gateway';

// Format: pkl_live_XXXXXXXXXXXXXXXXXXXXXXXX (32 chars after prefix)
const API_KEY_PREFIX_LIVE = 'pkl_live_';
// Format: pkl_test_XXXXXXXXXXXXXXXXXXXXXXXX (32 chars after prefix)
const API_KEY_PREFIX_TEST = 'pkl_test_';
// Number of random bytes (will be converted to hex, so final length will be 2x this)
const RANDOM_BYTES = 16;

/**
 * Generate a new API key
 * @param isTest Whether to generate a test key or live key
 * @returns An object containing the full key and the key prefix for storage
 */
export const generateApiKey = (isTest: boolean = false): { 
  fullKey: string; 
  keyPrefix: string; 
} => {
  // Generate random bytes and convert to hex
  const randomPart = crypto.randomBytes(RANDOM_BYTES).toString('hex');
  
  // Create full key with appropriate prefix
  const prefix = isTest ? API_KEY_PREFIX_TEST : API_KEY_PREFIX_LIVE;
  const fullKey = `${prefix}${randomPart}`;
  
  // Extract the first 8 characters of the key (including part of the prefix)
  // This will be stored in plain text for lookup purposes
  const keyPrefix = fullKey.substring(0, 8);
  
  return { fullKey, keyPrefix };
};

/**
 * Hash an API key for secure storage
 * @param key The full API key to hash
 * @returns A bcrypt hash of the key
 */
export const hashApiKey = async (key: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(key, saltRounds);
};

/**
 * Generate a complete API key, hash it, and prepare it for storage
 * @param isTest Whether to generate a test key
 * @returns An object with all key components needed for the database
 */
export const prepareApiKey = async (isTest: boolean = false): Promise<{
  fullKey: string;
  keyPrefix: string;
  keyHash: string;
}> => {
  const { fullKey, keyPrefix } = generateApiKey(isTest);
  const keyHash = await hashApiKey(fullKey);
  
  return {
    fullKey,    // Return to user once only
    keyPrefix,  // Stored in database
    keyHash     // Stored in database
  };
};

/**
 * Verify if an API key is valid
 * @param key The full API key to verify
 * @returns A boolean indicating whether the key is valid
 */
export const isValidKeyFormat = (key: string): boolean => {
  // Check if key has the correct prefix
  const hasValidPrefix = key.startsWith(API_KEY_PREFIX_LIVE) || key.startsWith(API_KEY_PREFIX_TEST);
  
  // Check if key has correct length
  const expectedLengthLive = API_KEY_PREFIX_LIVE.length + (RANDOM_BYTES * 2);
  const expectedLengthTest = API_KEY_PREFIX_TEST.length + (RANDOM_BYTES * 2);
  
  const hasValidLength = key.length === expectedLengthLive || key.length === expectedLengthTest;
  
  // Check if key contains only valid characters (alphanumeric + underscore)
  const hasValidChars = /^[a-zA-Z0-9_]+$/.test(key);
  
  return hasValidPrefix && hasValidLength && hasValidChars;
};

/**
 * Get information about the type of API key
 * @param key The full API key
 * @returns Object with information about the key
 */
export const getKeyInfo = (key: string): { 
  isTest: boolean;
  isValid: boolean;
} => {
  if (!isValidKeyFormat(key)) {
    return { isTest: false, isValid: false };
  }
  
  return {
    isTest: key.startsWith(API_KEY_PREFIX_TEST),
    isValid: true
  };
};