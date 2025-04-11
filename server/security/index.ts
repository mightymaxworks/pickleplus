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
    
    // Detect if this is a suspicious request - multiple auth failures, unusual patterns
    const isSuspicious = detectSuspiciousActivity(req);
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method to capture status code before response is sent
    res.send = function(this: Response, body: any): Response {
      // Always log security events, even if not authenticated
      if (isSuspicious || 
          action.startsWith('ADMIN_') || 
          action.includes('_LOGIN') || 
          action.includes('_LOGOUT') ||
          res.statusCode === 401 ||
          res.statusCode === 403) {
        
        // Create audit log
        const entry: AuditLogEntry = {
          timestamp: new Date(),
          userId: userId || 0, // Use 0 for anonymous users
          action: isSuspicious ? AuditAction.SECURITY_SUSPICIOUS_ACTIVITY : action,
          resource,
          resourceId,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
          additionalData: {
            method: req.method,
            path: req.path,
            suspicious: isSuspicious,
            headers: {
              referrer: req.headers.referer || req.headers.referrer,
              origin: req.headers.origin
            }
          }
        };
        
        // Log audit without awaiting to avoid blocking response
        createAuditLog(entry).catch(err => 
          console.error('Failed to create audit log:', err)
        );
      } else if (userId) {
        // For regular authenticated requests that aren't security-related
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
      }
      
      // Call original send
      return originalSend.call(this, body);
    };
    
    next();
  };
}

/**
 * Detect suspicious activity in requests
 * This helps identify potential security issues
 */
function detectSuspiciousActivity(req: Request): boolean {
  // Check for unusual user agent
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.toLowerCase().includes('sqlmap') || 
      userAgent.toLowerCase().includes('nikto') ||
      userAgent.toLowerCase().includes('nmap') ||
      userAgent.toLowerCase().includes('scanner')) {
    return true;
  }
  
  // Check for suspicious parameters or paths
  const path = req.path.toLowerCase();
  if (path.includes('admin') && !req.isAuthenticated()) {
    return true;
  }
  
  if (path.includes('wp-') || 
      path.includes('wp-admin') || 
      path.includes('wp-login') ||
      path.includes('.php')) {
    return true;
  }
  
  // Check request body for suspicious SQL patterns
  if (req.body) {
    const bodyStr = JSON.stringify(req.body).toLowerCase();
    if (bodyStr.includes('select ') && 
        (bodyStr.includes('from ') || 
         bodyStr.includes('union ') || 
         bodyStr.includes('insert ') || 
         bodyStr.includes('drop '))) {
      return true;
    }
  }
  
  return false;
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
  
  // Apply rate limiting to auth endpoints
  app.use('/api/auth/login', rateLimiter(rateLimitConfigs.auth));
  app.use('/api/auth/register', rateLimiter(rateLimitConfigs.auth));
  
  // Apply rate limiting to admin endpoints with specialized configs
  app.use('/api/admin/dashboard', rateLimiter({
    ...rateLimitConfigs.admin,
    max: 150 // More generous for dashboard which is frequently accessed
  }));
  
  // Stricter rate limiting for security-sensitive admin endpoints
  app.use('/api/admin/user', rateLimiter({
    ...rateLimitConfigs.admin,
    max: 50,
    message: {
      status: 429,
      message: 'Rate limit exceeded for user management operations.'
    }
  }));
  
  // Even stricter rate limiting for security admin functions
  app.use('/api/admin/security', rateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Only 20 security operations per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Rate limit exceeded for security operations. Please try again later.'
    }
  }));
  
  // Default rate limiting for all other admin routes
  app.use('/api/admin/*', rateLimiter(rateLimitConfigs.admin));
  
  // Apply CSRF protection to all routes
  app.use(verifyCSRFToken);
  
  // Add CSRF token endpoint
  app.get('/api/security/csrf-token', (req: Request, res: Response) => {
    const token = generateCSRFToken(req);
    res.json({ csrfToken: token });
  });
  
  // Apply enhanced admin authentication to sensitive operations
  app.use('/api/admin/user', isAdminWithRecentLogin(2)); // Require login within last 2 hours
  app.use('/api/admin/security', isAdminWithRecentLogin(1)); // Require login within last 1 hour
  app.use('/api/admin/settings', isAdminWithRecentLogin(4)); // Require login within last 4 hours
  
  // Add audit log viewing endpoints for admins
  app.get('/api/admin/security/audit-logs', isAdminWithRecentLogin(1), createAuditLogMiddleware(AuditAction.ADMIN_VIEW_LOGS, AuditResource.AUDIT_LOG), async (req: Request, res: Response) => {
    try {
      // Parse query parameters
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const action = req.query.action as string || undefined;
      const resource = req.query.resource as string || undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const suspicious = req.query.suspicious === 'true';
      
      // Get logs with filtering
      const logs = await storage.getAuditLogs({
        limit,
        offset,
        action,
        resource,
        userId,
        startDate,
        endDate,
        suspicious
      });
      
      // Return logs to client
      res.json({
        logs,
        meta: {
          limit,
          offset,
          filters: {
            action,
            resource,
            userId,
            startDate,
            endDate,
            suspicious
          }
        }
      });
    } catch (error) {
      console.error('Error retrieving audit logs:', error);
      res.status(500).json({ message: 'Failed to retrieve audit logs' });
    }
  });
  
  // Add security summary endpoint for admins
  app.get('/api/admin/security/summary', isAdminWithRecentLogin(1), createAuditLogMiddleware(AuditAction.ADMIN_VIEW_SECURITY, AuditResource.SECURITY), async (req: Request, res: Response) => {
    try {
      // Get last 24 hours suspicious activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const suspiciousLogs = await storage.getAuditLogs({
        startDate: yesterday,
        suspicious: true,
        limit: 1000
      });
      
      // Get recent login attempts
      const loginLogs = await storage.getAuditLogs({
        startDate: yesterday,
        action: AuditAction.USER_LOGIN,
        limit: 1000
      });
      
      // Get admin activity
      const adminLogs = await storage.getAuditLogs({
        startDate: yesterday,
        action: 'ADMIN_',
        limit: 1000
      });
      
      // Count failed vs successful logins
      const failedLogins = loginLogs.filter(log => log.statusCode === 401).length;
      const successfulLogins = loginLogs.filter(log => log.statusCode === 200).length;
      
      // Analyze suspicious IPs
      const suspiciousIps = new Set<string>();
      suspiciousLogs.forEach(log => {
        if (log.ipAddress) {
          suspiciousIps.add(log.ipAddress);
        }
      });
      
      // Return summary information
      res.json({
        summary: {
          suspiciousActivityCount: suspiciousLogs.length,
          uniqueSuspiciousIps: Array.from(suspiciousIps),
          loginAttempts: {
            total: loginLogs.length,
            successful: successfulLogins,
            failed: failedLogins,
            successRate: loginLogs.length > 0 ? (successfulLogins / loginLogs.length) * 100 : 0
          },
          adminActivityCount: adminLogs.length,
          timeframe: {
            start: yesterday.toISOString(),
            end: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error generating security summary:', error);
      res.status(500).json({ message: 'Failed to generate security summary' });
    }
  });
  
  console.log('[SECURITY] Enhanced security features initialized');
}