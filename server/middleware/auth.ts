/**
 * PKL-278651-SEC-0005-MIDDLEWARE - Authentication Middleware
 * 
 * This file provides middleware for handling authentication and authorization
 * in the Pickle+ platform.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // PKL-278651-AUTH-0017-DEBUG - Development-only test user bypass
  // Always bypass authentication in development mode for easier testing
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV MODE] Bypassing authentication for ${req.path}`);
    
    // Attach a development test user to the request
    req.user = {
      id: 1,
      username: 'testdev',
      email: 'dev@pickle.plus',
      isAdmin: true,
      passportId: '1000MM7',
      firstName: 'Mighty',
      lastName: 'Max',
      displayName: 'Mighty Max',
      dateOfBirth: null,
      avatarUrl: null,
      avatarInitials: 'MM',
      createdAt: new Date(),
      updatedAt: new Date(),
      verifiedEmail: true,
      xp: 1000,
      level: 10,
      role: 'PLAYER',
      isCoach: true,
      isReferee: true,
      roles: ['ADMIN', 'COACH', 'REFEREE', 'PLAYER']
    } as any;
    
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
}

/**
 * Middleware to check if a user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    // PKL-278651-AUTH-0017-DEBUG - Development-only test user bypass
    // Always bypass authentication in development mode for easier testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] Bypassing admin authentication for ${req.path}`);
      return next();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has admin role
  const user = req.user as any;
  if (user && (user.isAdmin || (user.roles && user.roles.includes('ADMIN')))) {
    return next();
  }
  
  // PKL-278651-AUTH-0017-DEBUG - Development-only admin bypass
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV MODE] Bypassing admin authorization for ${req.path}`);
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
}

/**
 * Middleware to check if a user is a coach
 */
export function isCoach(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has coach role
  const user = req.user as any;
  if (user && (user.isCoach || (user.roles && user.roles.includes('COACH')))) {
    return next();
  }
  
  // Admin can also access coach endpoints
  if (user && (user.isAdmin || (user.roles && user.roles.includes('ADMIN')))) {
    return next();
  }
  
  // In development mode, we might want to bypass authorization
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    console.warn('[AUTH] Bypassing coach check in development mode');
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Coach access required'
  });
}

/**
 * Middleware to check if a user is a referee
 */
export function isReferee(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has referee role
  const user = req.user as any;
  if (user && (user.isReferee || (user.roles && user.roles.includes('REFEREE')))) {
    return next();
  }
  
  // Admin can also access referee endpoints
  if (user && (user.isAdmin || (user.roles && user.roles.includes('ADMIN')))) {
    return next();
  }
  
  // In development mode, we might want to bypass authorization
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    console.warn('[AUTH] Bypassing referee check in development mode');
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Referee access required'
  });
}