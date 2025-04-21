/**
 * Authentication middleware
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For simple implementation, assume user is authenticated with ID 1
  // This should be replaced with proper session-based authentication
  req.user = { id: 1 };
  next();
}

/**
 * Middleware to check if the user has admin privileges
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // For simple implementation, assume user has admin privileges
  // This should be replaced with proper role-based authorization
  req.isAdmin = true;
  next();
}

// Add type definitions to express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
      isAdmin?: boolean;
    }
  }
}