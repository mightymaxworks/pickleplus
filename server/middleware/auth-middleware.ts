/**
 * PKL-278651-AUTH-0001-CORE
 * Authentication Middleware
 * 
 * This file contains middleware functions for authentication and authorization.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is authenticated
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
}

/**
 * Middleware to check if a user has the required role
 * @param role The role required to access a resource
 */
export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    
    // Check for admin role (admins can access anything)
    if (req.user.isAdmin) {
      return next();
    }
    
    // If the user has the specified role property set to true
    if (req.user[`is${role.charAt(0).toUpperCase() + role.slice(1)}`] === true) {
      return next();
    }
    
    // For roles stored in a roles array/object
    if (req.user.roles && Array.isArray(req.user.roles)) {
      const hasRequiredRole = req.user.roles.some((userRole: any) => 
        userRole.name === role.toUpperCase()
      );
      
      if (hasRequiredRole) {
        return next();
      }
    }
    
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: `Requires ${role} role`
    });
  };
}

/**
 * Check if the user has admin privileges
 */
export const isAdmin = hasRole('ADMIN');

/**
 * Check if the user has coach privileges
 */
export const isCoach = hasRole('COACH');

/**
 * Check if the user has referee privileges
 */
export const isReferee = hasRole('REFEREE');