/**
 * PKL-278651-COMM-0034-MEMBER
 * Community Permissions Middleware
 * 
 * Middleware for checking if a user has specific permissions in a community.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Permission check middleware that handles both req.user.id and req.session.userId
// depending on authentication method
export interface SessionData {
  userId: number;
}

/**
 * Middleware to check if a user has a specific permission in a community
 * @param permissionType The permission type to check
 */
export function checkPermission(permissionType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user ID from req.user (passport) or req.session (custom auth)
      const userId = req.user?.id || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }
      
      // Get community
      const community = await storage.getCommunityById(communityId);
      
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      // Always allow the creator/owner
      if (community.createdByUserId === userId) {
        return next();
      }
      
      // Check for admin permission
      const isAdmin = await storage.checkCommunityPermission(communityId, userId, 'admin');
      
      if (isAdmin) {
        return next();
      }
      
      // Check for specific permission
      const hasPermission = await storage.checkCommunityPermission(communityId, userId, permissionType);
      
      if (hasPermission) {
        return next();
      }
      
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    } catch (error) {
      console.error('[PKL-278651-COMM-0034-MEMBER] Permission check error:', error);
      return res.status(500).json({ message: 'Error checking permissions' });
    }
  };
}

/**
 * Check if the user is an admin of the community
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  return checkPermission('admin')(req, res, next);
}

/**
 * Check if the user has moderation privileges (admin or moderator) in the community
 */
export function hasModeratorPermissions(req: Request, res: Response, next: NextFunction) {
  return checkPermission('moderate_content')(req, res, next);
}