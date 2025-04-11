/**
 * PKL-278651-ADMIN-0013-SEC
 * Server Security Module
 * 
 * This module provides security enhancements for the Pickle+ application
 * including audit logging, rate limiting, CSRF protection, and security headers.
 */

import { Request, Response, NextFunction, Express } from 'express';
import { storage } from '../storage';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { AuditAction, AuditResource } from '../../shared/schema/audit';

// Type definitions
export interface AuditLogEntry {
  timestamp: Date;
  userId: number;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | null;
  ipAddress: string;
  userAgent?: string | null;
  statusCode?: number | null;
  additionalData?: any;
}

// Rate limit configurations
export const rateLimitConfigs = {
  // Authentication rate limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  
  // Admin endpoints rate limits
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Rate limit exceeded for admin operations.'
    }
  },
  
  // API rate limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Too many requests, please try again later.'
    }
  }
};

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await storage.createAuditLog({
      timestamp: entry.timestamp,
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId || null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent || null,
      statusCode: entry.statusCode || null,
      additionalData: entry.additionalData || null
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Create middleware for rate limiting
 */
export function rateLimiter(options: any) {
  return rateLimit(options);
}

/**
 * Create middleware for audit logging
 */
export function createAuditLogMiddleware(
  action: AuditAction, 
  resource: AuditResource,
  resourceIdFn?: (req: Request) => string | null
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract user ID from authenticated session
    const userId = req.user ? (req.user as any).id : null;
    
    // Get resource ID if function is provided
    const resourceId = resourceIdFn ? resourceIdFn(req) : null;
    
    if (userId) {
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to capture status code before response is sent
      res.send = function(this: Response, body: any): Response {
        // Create audit log
        const entry: AuditLogEntry = {
          timestamp: new Date(),
          userId,
          action,
          resource,
          resourceId,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
          additionalData: {
            method: req.method,
            path: req.path
          }
        };
        
        // Log audit without awaiting to avoid blocking response
        createAuditLog(entry).catch(err => 
          console.error('Failed to create audit log:', err)
        );
        
        // Call original send
        return originalSend.call(this, body);
      };
    }
    
    next();
  };
}

/**
 * Enhanced admin authentication check with recent login verification
 * Requires admin users to have logged in within the past X hours
 */
export function isAdminWithRecentLogin(maxAgeHours: number = 4) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check if user is authenticated and is admin
    if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Check when the user last logged in
    const lastLogin = (req.user as any).lastLoginAt;
    if (!lastLogin) {
      return res.status(403).json({ 
        message: 'Session expired', 
        code: 'RECENT_LOGIN_REQUIRED'
      });
    }
    
    const loginTimestamp = new Date(lastLogin).getTime();
    const now = Date.now();
    const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);
    
    if (hoursSinceLogin > maxAgeHours) {
      return res.status(403).json({ 
        message: 'Your admin session has expired. Please log in again for security reasons.',
        code: 'RECENT_LOGIN_REQUIRED'
      });
    }
    
    next();
  };
}

/**
 * Generate a CSRF token for the current session
 */
export function generateCSRFToken(req: Request): string {
  if (!req.session) {
    throw new Error('Session is not available');
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = token;
  return token;
}

/**
 * Verify CSRF token middleware
 */
export function verifyCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const requestToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!sessionToken || !requestToken || sessionToken !== requestToken) {
    return res.status(403).json({ message: 'CSRF token validation failed' });
  }
  
  next();
}

/**
 * Setup security enhancements for the application
 * @param app Express application
 */
export function setupSecurity(app: Express): void {
  // Set various security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
    );
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Disable MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'same-origin');
    
    next();
  });
  
  // Apply rate limiting to login/admin endpoints
  app.use('/api/auth/login', rateLimiter(rateLimitConfigs.auth));
  app.use('/api/admin/*', rateLimiter(rateLimitConfigs.admin));
  
  // Apply CSRF protection to all routes
  app.use(verifyCSRFToken);
  
  // Add CSRF token endpoint
  app.get('/api/security/csrf-token', (req: Request, res: Response) => {
    const token = generateCSRFToken(req);
    res.json({ csrfToken: token });
  });
  
  console.log('[SECURITY] Enhanced security features initialized');
}