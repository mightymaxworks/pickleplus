/**
 * PKL-278651-BOUNCE-0005-AUTO - Admin Middleware
 * 
 * This middleware handles authentication and authorization for admin routes.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to check if the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Middleware to check if the user is an administrator
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const userId = req.session.userId;
  
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}