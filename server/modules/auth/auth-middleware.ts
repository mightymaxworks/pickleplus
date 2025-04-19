/**
 * PKL-278651-XP-0002-UI
 * Authentication Middleware
 * 
 * Middleware for protecting routes that require authentication.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

/**
 * Middleware to check if user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // For now, we're using admin users by ID until role system is implemented
  const adminUserIds = [1]; // Add admin user IDs here
  if (adminUserIds.includes(req.user!.id)) {
    return next();
  }
  
  res.status(403).json({ error: 'Forbidden' });
}