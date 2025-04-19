/**
 * PKL-278651-COMM-0022-FEED
 * Authentication Middleware
 * 
 * Middleware for routes that require authentication.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that checks if a user is authenticated
 * If authenticated, the user object is available as req.user
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Authentication required' });
}

/**
 * Middleware that checks if the authenticated user has admin privileges
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  
  return res.status(403).json({ message: 'Admin privileges required' });
}

/**
 * Middleware that adds CSRF protection
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Simple implementation - in production, use a proper CSRF library
  const csrfToken = req.headers['x-csrf-token'];
  const storedToken = req.session?.csrfToken;
  
  if (req.method !== 'GET' && (!csrfToken || csrfToken !== storedToken)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  
  next();
}

/**
 * Middleware that logs authenticated requests
 */
export function logAuthenticatedRequest(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    console.log(`[AUTH] User ${req.user.id} (${req.user.username}) accessed ${req.method} ${req.originalUrl}`);
  }
  
  next();
}