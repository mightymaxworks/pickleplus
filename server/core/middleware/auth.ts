/**
 * Authentication Middleware
 * 
 * This file provides middleware functions for authentication
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Not authenticated' });
}

/**
 * Middleware to check if user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  
  return res.status(403).json({ message: 'Admin access required' });
}

/**
 * Middleware to check if user is a coach
 */
export function isCoach(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as any).isCoach) {
    return next();
  }
  
  return res.status(403).json({ message: 'Coach access required' });
}