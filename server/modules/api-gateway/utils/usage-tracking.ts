/**
 * PKL-278651-API-0001-GATEWAY
 * API Usage Tracking Utility
 * 
 * Tracks API usage for analytics and billing purposes.
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { apiUsageLogs } from '../../../../shared/schema/api-gateway';

// Interface for response data to track
interface ResponseData {
  statusCode: number;
  responseSize: number;
  processingTime: number;
}

/**
 * Log an API request for usage tracking
 */
export const logApiUsage = async (
  req: Request,
  res: Response,
  keyId: number | undefined
): Promise<void> => {
  // Skip logging for non-API requests or missing key ID
  if (!keyId) {
    return;
  }
  
  try {
    // Capture basic request information
    const endpoint = req.path;
    const method = req.method;
    const requestIp = req.ip;
    const userAgent = req.headers['user-agent'] || '';
    
    // Calculate approximate request size
    const requestSize = calculateRequestSize(req);
    
    // Set up response tracking
    const startTime = Date.now();
    let statusCode = 200;
    let responseSize = 0;
    
    // Track original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;
    
    // Override response methods to capture size
    res.json = function(body) {
      responseSize = JSON.stringify(body).length;
      return originalJson.call(this, body);
    };
    
    res.send = function(body) {
      if (typeof body === 'string') {
        responseSize = body.length;
      } else if (Buffer.isBuffer(body)) {
        responseSize = body.length;
      } else if (typeof body === 'object') {
        responseSize = JSON.stringify(body).length;
      }
      return originalSend.call(this, body);
    };
    
    res.end = function(chunk, encoding) {
      const processingTime = Date.now() - startTime;
      statusCode = res.statusCode;
      
      // Log usage asynchronously
      db.insert(apiUsageLogs)
        .values({
          keyId,
          endpoint,
          method,
          statusCode,
          requestSize,
          responseSize,
          processingTime,
          requestIp,
          userAgent,
          // Add parameters with sensitive data removed
          parameters: sanitizeParameters(req)
        })
        .execute()
        .catch(err => console.error('Failed to log API usage:', err));
      
      return originalEnd.call(this, chunk, encoding);
    };
    
    // Return early to allow middleware to continue
    return Promise.resolve();
  } catch (error) {
    console.error('Error in API usage logging:', error);
    return Promise.resolve(); // Don't block the request flow
  }
};

/**
 * Calculate the approximate size of a request in bytes
 */
const calculateRequestSize = (req: Request): number => {
  let size = 0;
  
  // Headers
  size += JSON.stringify(req.headers).length;
  
  // URL/path
  size += (req.originalUrl || req.url || '').length;
  
  // Method
  size += (req.method || '').length;
  
  // Body
  if (req.body) {
    try {
      size += JSON.stringify(req.body).length;
    } catch (e) {
      // If body can't be stringified, estimate a default size
      size += 100;
    }
  }
  
  // Query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    size += JSON.stringify(req.query).length;
  }
  
  return size;
};

/**
 * Sanitize request parameters to remove sensitive information
 */
const sanitizeParameters = (req: Request): any => {
  // Create sanitized copies of request data
  const sanitizedQuery = { ...req.query };
  const sanitizedBody = req.body ? { ...req.body } : {};
  
  // List of fields to redact
  const sensitiveFields = [
    'password', 'token', 'key', 'secret', 'authorization', 'auth',
    'apiKey', 'api_key', 'accessToken', 'access_token', 'refreshToken', 'refresh_token'
  ];
  
  // Redact sensitive fields from query params
  for (const field of sensitiveFields) {
    if (sanitizedQuery[field]) {
      sanitizedQuery[field] = '[REDACTED]';
    }
  }
  
  // Recursively redact sensitive fields from body
  const redactSensitiveData = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => redactSensitiveData(item));
    }
    
    const result: any = {};
    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        result[key] = redactSensitiveData(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  };
  
  const sanitizedParams = {
    query: sanitizedQuery,
    body: redactSensitiveData(sanitizedBody),
    method: req.method,
    path: req.path
  };
  
  return sanitizedParams;
};