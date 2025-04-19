/**
 * PKL-278651-SEC-0001-AUTH
 * Authentication Middleware
 * 
 * This file contains middleware functions for authentication and authorization.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if a user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: "Not authenticated" });
}

/**
 * Middleware to check if a user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // Check if the user has admin role
  db.select()
    .from(users)
    .where(eq(users.id, req.user.id))
    .then(userResult => {
      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const user = userResult[0];
      if (user.role === 'admin') {
        return next();
      }
      
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    })
    .catch(error => {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ message: "Internal server error" });
    });
}