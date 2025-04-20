/**
 * PKL-278651-COMM-0036-MEDIA
 * Community-specific Authentication Middleware
 * 
 * This file provides middleware functions for community-specific authentication:
 * - isCommunityMember: Checks if the user is a member of the specified community
 * - isCommunityAdmin: Checks if the user is an admin of the specified community
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { communities, communityMembers } from '../../shared/schema/community';

/**
 * Middleware to check if a user is a member of the specified community
 */
export const isCommunityMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First ensure the user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;
    
    // Check if community exists
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // If user is an admin, they automatically have access
    if (req.user.isAdmin) {
      return next();
    }
    
    // Check if user is a member of the community
    const [membership] = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      );
    
    if (!membership) {
      return res.status(403).json({ message: 'User is not a member of this community' });
    }
    
    next();
  } catch (error) {
    console.error('Error in isCommunityMember middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if a user is an admin of the specified community
 */
export const isCommunityAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First ensure the user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;
    
    // Check if community exists
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // If user is a site admin, they automatically have access
    if (req.user.isAdmin) {
      return next();
    }
    
    // Check if user is an admin of the community
    const [membership] = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId),
          eq(communityMembers.role, "admin")
        )
      );
    
    if (!membership) {
      return res.status(403).json({ message: 'User is not an admin of this community' });
    }
    
    next();
  } catch (error) {
    console.error('Error in isCommunityAdmin middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Export the basic authentication middleware to ensure it's available
export { isAuthenticated } from '../middleware/auth';