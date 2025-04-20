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

// Type definition for session with userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

/**
 * Middleware to check if a user has a specific permission in a community
 * @param permissionType The permission type to check
 */
export function checkPermission(permissionType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }
      
      // Get the user's membership
      const membership = await storage.getCommunityMembership(communityId, userId);
      
      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this community' });
      }
      
      // Get the community
      const community = await storage.getCommunityById(communityId);
      
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      // If user is the community creator, grant permission
      if (userId === community.createdByUserId) {
        return next();
      }
      
      // Admins always have all permissions
      if (membership.role === 'admin') {
        return next();
      }
      
      // Check if the user's role has the required permission
      const hasPermission = await storage.checkCommunityPermission(
        communityId,
        membership.role,
        permissionType
      );
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `You don't have the required permission: ${permissionType}` 
        });
      }
      
      // User has permission, proceed
      next();
    } catch (error) {
      console.error('[PKL-278651-COMM-0034-MEMBER] Error checking permission:', error);
      res.status(500).json({ message: 'Failed to check permission' });
    }
  };
}

/**
 * Check if the user is an admin of the community
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }
      
      // Get the user's membership
      const membership = await storage.getCommunityMembership(communityId, userId);
      
      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this community' });
      }
      
      // Get the community
      const community = await storage.getCommunityById(communityId);
      
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      // If user is the community creator or has admin role, grant permission
      if (userId === community.createdByUserId || membership.role === 'admin') {
        return next();
      }
      
      res.status(403).json({ message: 'Only community admins can perform this action' });
    } catch (error) {
      console.error('[PKL-278651-COMM-0034-MEMBER] Error checking admin status:', error);
      res.status(500).json({ message: 'Failed to check admin status' });
    }
  })();
}

/**
 * Check if the user has moderation privileges (admin or moderator) in the community
 */
export function hasModeratorPermissions(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }
      
      // Get the user's membership
      const membership = await storage.getCommunityMembership(communityId, userId);
      
      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this community' });
      }
      
      // Get the community
      const community = await storage.getCommunityById(communityId);
      
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      // If user is the community creator, admin or moderator, grant permission
      if (userId === community.createdByUserId || 
          membership.role === 'admin' || 
          membership.role === 'moderator') {
        return next();
      }
      
      res.status(403).json({ 
        message: 'Only community administrators and moderators can perform this action' 
      });
    } catch (error) {
      console.error('[PKL-278651-COMM-0034-MEMBER] Error checking moderator status:', error);
      res.status(500).json({ message: 'Failed to check moderator status' });
    }
  })();
}