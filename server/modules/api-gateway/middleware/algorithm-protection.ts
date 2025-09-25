/**
 * PKL-278651-API-0001-ALGORITHM-PROTECTION
 * Algorithm IP Protection Middleware
 * 
 * Advanced protection mechanisms for ranking algorithm intellectual property.
 */

import { Request, Response, NextFunction } from 'express';
// Suspicious usage pattern detection
const suspiciousPatterns = new Map<string, {
  requestCount: number;
  uniqueEndpoints: Set<string>;
  bulkRequests: number;
  lastActivity: Date;
  flagged: boolean;
}>();

// Simple rate limiting using Map-based tracking
const rateLimitTracking = new Map<string, {
  algorithmRequests: { count: number; resetTime: number };
  bulkRequests: { count: number; resetTime: number };
}>();

function checkRateLimit(keyId: string, type: 'algorithm' | 'bulk', points: number = 1): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const tracking = rateLimitTracking.get(keyId) || {
    algorithmRequests: { count: 0, resetTime: now + 3600000 }, // 1 hour
    bulkRequests: { count: 0, resetTime: now + 86400000 } // 24 hours
  };
  
  const limit = type === 'algorithm' ? 100 : 500;
  const window = type === 'algorithm' ? 3600000 : 86400000;
  const current = tracking[`${type}Requests`];
  
  // Reset if window expired
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + window;
  }
  
  // Check if adding points would exceed limit
  if (current.count + points > limit) {
    return { allowed: false, resetTime: current.resetTime };
  }
  
  // Increment and update
  current.count += points;
  rateLimitTracking.set(keyId, tracking);
  
  return { allowed: true };
}

export interface AlgorithmProtectionOptions {
  enableSuspiciousPatternDetection?: boolean;
  enableDataObfuscation?: boolean;
  enableUsageAuditing?: boolean;
  maxBulkRequestSize?: number;
}

/**
 * Algorithm Protection Middleware Factory
 */
export function algorithmProtection(options: AlgorithmProtectionOptions = {}) {
  const {
    enableSuspiciousPatternDetection = true,
    enableDataObfuscation = true,
    enableUsageAuditing = true,
    maxBulkRequestSize = 50
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = (req as any).apiKey;
      if (!apiKey) {
        return next(); // Skip if no API key (handled by auth middleware)
      }

      const keyId = apiKey.keyPrefix || 'unknown';
      const endpoint = req.path;
      const method = req.method;

      // 1. SUSPICIOUS PATTERN DETECTION
      if (enableSuspiciousPatternDetection) {
        const pattern = suspiciousPatterns.get(keyId) || {
          requestCount: 0,
          uniqueEndpoints: new Set(),
          bulkRequests: 0,
          lastActivity: new Date(),
          flagged: false
        };

        pattern.requestCount++;
        pattern.uniqueEndpoints.add(endpoint);
        pattern.lastActivity = new Date();

        // Flag suspicious behavior
        const isHighVolume = pattern.requestCount > 1000; // Per day
        const isWideScanning = pattern.uniqueEndpoints.size > 20; // Too many different endpoints
        const isBulkExtracting = req.query.limit && parseInt(req.query.limit as string) > maxBulkRequestSize;

        if ((isHighVolume || isWideScanning || isBulkExtracting) && !pattern.flagged) {
          pattern.flagged = true;
          console.log(`[SECURITY] Suspicious API usage detected for key: ${keyId}`, {
            requestCount: pattern.requestCount,
            uniqueEndpoints: pattern.uniqueEndpoints.size,
            currentRequest: `${method} ${endpoint}`
          });
          
          // Alert system administrators (in production, send to monitoring service)
          if (enableUsageAuditing) {
            logSecurityEvent('SUSPICIOUS_USAGE', keyId, {
              pattern,
              request: { method, endpoint, query: req.query }
            });
          }
        }

        suspiciousPatterns.set(keyId, pattern);

        // Block if severely flagged
        if (pattern.flagged && isHighVolume && isWideScanning) {
          return res.status(429).json({
            error: 'rate_limit_exceeded',
            error_description: 'Suspicious usage pattern detected. Contact support if you believe this is an error.',
            retry_after: 3600
          });
        }
      }

      // 2. ALGORITHM ENDPOINT PROTECTION
      const isAlgorithmEndpoint = endpoint.includes('/rankings') || 
                                 endpoint.includes('/courtiq') || 
                                 endpoint.includes('/multi-rankings');

      if (isAlgorithmEndpoint) {
        const rateCheck = checkRateLimit(keyId, 'algorithm');
        if (!rateCheck.allowed) {
          const remainingTime = Math.round((rateCheck.resetTime! - Date.now()) / 1000);
          return res.status(429).json({
            error: 'algorithm_rate_limit',
            error_description: 'Algorithm access rate limit exceeded',
            retry_after: remainingTime,
            limit_info: {
              limit: 100,
              window: '1 hour'
            }
          });
        }
      }

      // 3. BULK EXTRACTION PROTECTION
      const requestLimit = Math.min(
        parseInt(req.query.limit as string) || 10,
        maxBulkRequestSize
      );

      if (requestLimit > 10) {
        const rateCheck = checkRateLimit(keyId, 'bulk', requestLimit);
        if (!rateCheck.allowed) {
          const remainingTime = Math.round((rateCheck.resetTime! - Date.now()) / 1000);
          return res.status(429).json({
            error: 'bulk_extraction_limit',
            error_description: 'Daily bulk data extraction limit exceeded',
            retry_after: remainingTime,
            suggestion: 'Consider upgrading to a higher tier plan for increased limits'
          });
        }
      }

      // 4. DATA OBFUSCATION HEADERS
      if (enableDataObfuscation) {
        // Add headers to make reverse engineering more difficult
        res.setHeader('X-Data-Freshness', Math.floor(Math.random() * 300)); // Random cache hint
        res.setHeader('X-Processing-Node', `node-${Math.floor(Math.random() * 10)}`); // Fake node info
        res.setHeader('X-Algorithm-Version', 'v2.1-stable'); // Version only, no implementation details
      }

      // 5. USAGE AUDITING
      if (enableUsageAuditing) {
        logApiUsage(keyId, {
          method,
          endpoint,
          limit: requestLimit,
          timestamp: new Date(),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
      }

      // Continue to next middleware
      next();

    } catch (error) {
      console.error('[SECURITY] Algorithm protection middleware error:', error);
      next(error);
    }
  };
}

/**
 * Log security events for monitoring
 */
function logSecurityEvent(eventType: string, keyId: string, details: any) {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    api_key_prefix: keyId,
    details,
    severity: 'HIGH'
  };
  
  // In production, send to security monitoring service
  console.log(`[SECURITY EVENT] ${eventType}:`, JSON.stringify(securityEvent, null, 2));
  
  // TODO: Integration with monitoring services like DataDog, New Relic, etc.
}

/**
 * Log API usage for analytics and monitoring
 */
function logApiUsage(keyId: string, details: any) {
  const usageEvent = {
    timestamp: new Date().toISOString(),
    api_key_prefix: keyId,
    details
  };
  
  // In production, send to analytics service
  console.log(`[API USAGE]`, JSON.stringify(usageEvent, null, 2));
  
  // TODO: Integration with analytics services
}

/**
 * Data sanitization for external consumption
 */
export function sanitizeAlgorithmData(data: any, accessLevel: 'basic' | 'advanced' | 'algorithm'): any {
  const sanitized = { ...data };
  
  // Remove internal calculation details
  delete sanitized.calculation_details;
  delete sanitized.internal_factors;
  delete sanitized.decay_coefficients;
  delete sanitized.skill_multipliers;
  delete sanitized.raw_scores;
  
  // Basic level: Only final results
  if (accessLevel === 'basic') {
    delete sanitized.algorithm_metadata;
    delete sanitized.confidence_scores;
    delete sanitized.prediction_models;
  }
  
  // Advanced level: Some metadata but no algorithm details
  if (accessLevel === 'advanced') {
    delete sanitized.prediction_models;
    if (sanitized.algorithm_metadata) {
      delete sanitized.algorithm_metadata.implementation_details;
      delete sanitized.algorithm_metadata.parameter_weights;
    }
  }
  
  // Algorithm level: Most metadata but still protect core IP
  if (accessLevel === 'algorithm') {
    if (sanitized.algorithm_metadata) {
      delete sanitized.algorithm_metadata.source_code_references;
      delete sanitized.algorithm_metadata.proprietary_formulas;
    }
  }
  
  return sanitized;
}

/**
 * Generate obfuscated timestamps to prevent pattern analysis
 */
export function obfuscateTimestamp(): string {
  const now = new Date();
  const randomOffset = Math.floor(Math.random() * 60000); // Random offset up to 1 minute
  const obfuscated = new Date(now.getTime() - randomOffset);
  return obfuscated.toISOString();
}