/**
 * PKL-278651-ADMIN-0013-SEC
 * Admin Security Module
 * 
 * This module provides enhanced security features for the admin interface.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import { Express, Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import { storage } from '../storage';

// Cache for rate limiting and security purposes
const securityCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the window
  message: string; // Error message to return when rate limit is exceeded
}

// Different rate limit configurations based on endpoint sensitivity
const rateLimitConfigs = {
  default: { windowMs: 60 * 1000, maxRequests: 100, message: 'Too many requests, please try again later' },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5, message: 'Too many authentication attempts, please try again later' },
  admin: { windowMs: 60 * 1000, maxRequests: 30, message: 'Rate limit exceeded for admin operations' },
};

/**
 * Simple in-memory rate limiter middleware
 * @param config Rate limit configuration
 */
export function rateLimiter(config: RateLimitConfig = rateLimitConfigs.default) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}:${req.path}`;
    
    // Get current requests for this IP and path
    const current = securityCache.get<{ count: number, resetTime: number }>(key);
    
    if (!current) {
      // First request, initialize counter
      securityCache.set(key, { 
        count: 1, 
        resetTime: Date.now() + config.windowMs 
      }, Math.ceil(config.windowMs / 1000));
      return next();
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return res.status(429).json({ 
        error: config.message,
        retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000)
      });
    }
    
    // Increment the counter
    securityCache.set(key, {
      count: current.count + 1,
      resetTime: current.resetTime
    }, Math.ceil((current.resetTime - Date.now()) / 1000));
    
    next();
  };
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  timestamp: Date;
  userId: number;
  action: string;
  resource: string;
  resourceId?: string | number;
  ipAddress: string;
  userAgent?: string;
  statusCode?: number;
  additionalData?: any;
}

/**
 * Create an audit log entry
 * @param entry Audit log entry data
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Log to console (will be replaced with DB logging)
    console.log('[AUDIT]', JSON.stringify(entry));
    
    // In a real implementation, we would store this in the database
    if (storage.createAuditLog) {
      await storage.createAuditLog(entry);
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

/**
 * Audit logging middleware for admin actions
 * @param action The action being performed
 * @param resource The resource being acted upon
 */
export function auditLog(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Override the end method to capture the status code
    res.end = function(this: Response, ...args: any[]) {
      // Create audit log entry
      const userId = req.user ? (req.user as any).id : null;
      
      if (userId) {
        const entry: AuditLogEntry = {
          timestamp: new Date(),
          userId,
          action,
          resource,
          resourceId: req.params.id || undefined,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
          additionalData: {
            method: req.method,
            path: req.path
          }
        };

        // Don't await to avoid blocking the response
        createAuditLog(entry).catch(err => console.error('Failed to create audit log:', err));
      }
      
      // Call the original end method
      return originalEnd.apply(this, args);
    };
    
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