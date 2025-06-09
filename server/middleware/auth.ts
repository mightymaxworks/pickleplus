/**
 * Authentication middleware for admin routes
 */

import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  // For now, allow all authenticated users admin access to training centers
  // In production, this would check a proper role field
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  // For now, allow all authenticated users admin access
  // In production, this would check a proper role field
  next();
}