/**
 * PKL-278651-API-0001-GATEWAY
 * Webhook Signature Utility
 * 
 * Handles webhook signature generation and verification for secure webhook delivery.
 */

import crypto from 'crypto';

// Constants
const SIGNATURE_HEADER = 'X-Pickle-Signature';
const TIMESTAMP_HEADER = 'X-Pickle-Timestamp';
const SIGNATURE_VERSION = 'v1';
const MAX_TIMESTAMP_DIFF = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate a webhook signature for outgoing webhook payloads
 * 
 * @param payload The webhook payload to sign
 * @param secret The webhook secret
 * @param timestamp Optional timestamp (defaults to current time)
 * @returns An object with signature and timestamp
 */
export const generateWebhookSignature = (
  payload: any,
  secret: string,
  timestamp: number = Date.now()
): { signature: string; timestamp: number } => {
  // Convert payload to string if it's an object
  const stringPayload = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload);
  
  // Create the string to sign: version.timestamp.payload
  const signatureContent = `${SIGNATURE_VERSION}.${timestamp}.${stringPayload}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(signatureContent);
  const signature = hmac.digest('hex');
  
  return {
    signature: `${SIGNATURE_VERSION}=${signature}`,
    timestamp
  };
};

/**
 * Verify a webhook signature from incoming webhook requests
 * 
 * @param payload The raw payload received in the webhook
 * @param signature The signature from the X-Pickle-Signature header
 * @param timestamp The timestamp from the X-Pickle-Timestamp header
 * @param secret The webhook secret used to verify the signature
 * @returns Boolean indicating whether the signature is valid
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  timestamp: number,
  secret: string
): boolean => {
  try {
    // Validate timestamp freshness
    const now = Date.now();
    if (Math.abs(now - timestamp) > MAX_TIMESTAMP_DIFF) {
      console.warn('Webhook timestamp is too old or from the future');
      return false;
    }
    
    // Extract version and signature value
    const [version, signatureValue] = signature.split('=');
    
    // Validate signature version
    if (version !== SIGNATURE_VERSION) {
      console.warn(`Unsupported signature version: ${version}`);
      return false;
    }
    
    // Create the string that was signed
    const signatureContent = `${version}.${timestamp}.${payload}`;
    
    // Compute expected signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signatureContent);
    const expectedSignature = hmac.digest('hex');
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(signatureValue),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Add webhook signature headers to an outgoing request
 * 
 * @param payload The webhook payload
 * @param secret The webhook secret
 * @returns Headers object with signature headers
 */
export const getWebhookSignatureHeaders = (
  payload: any,
  secret: string
): Record<string, string> => {
  const { signature, timestamp } = generateWebhookSignature(payload, secret);
  
  return {
    [SIGNATURE_HEADER]: signature,
    [TIMESTAMP_HEADER]: timestamp.toString()
  };
};

/**
 * Extract and verify webhook signature from incoming request
 * 
 * @param payload The raw request body as string
 * @param headers The request headers
 * @param secret The webhook secret
 * @returns Boolean indicating whether the signature is valid
 */
export const verifyWebhookRequest = (
  payload: string,
  headers: Record<string, string | string[] | undefined>,
  secret: string
): boolean => {
  // Get signature header
  const signatureHeader = headers[SIGNATURE_HEADER.toLowerCase()] || 
                          headers[SIGNATURE_HEADER];
  
  // Get timestamp header
  const timestampHeader = headers[TIMESTAMP_HEADER.toLowerCase()] || 
                          headers[TIMESTAMP_HEADER];
  
  // Validate header presence
  if (!signatureHeader || !timestampHeader) {
    console.warn('Missing signature or timestamp headers');
    return false;
  }
  
  // Extract values
  const signature = Array.isArray(signatureHeader) 
    ? signatureHeader[0] 
    : signatureHeader.toString();
  
  const timestamp = parseInt(
    Array.isArray(timestampHeader) 
      ? timestampHeader[0] 
      : timestampHeader.toString(),
    10
  );
  
  // Verify signature
  return verifyWebhookSignature(payload, signature, timestamp, secret);
};