/**
 * PKL-278651-COMM-0029-MOD - Community Middleware
 * Implementation timestamp: 2025-04-20 22:25 ET
 * 
 * Middleware for community-related authentication and permissions
 * 
 * Framework 5.2 compliant implementation
 */

import { db } from '../db.js';
import { eq, and, or } from 'drizzle-orm';
import { communityMembers } from '../../shared/schema/community.js';

/**
 * Middleware to check if a user is a moderator or admin of a community
 */
export const isCommunityModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = req.user.id;
    const communityId = parseInt(req.params.communityId);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }
    
    // Check if user is a platform admin (shortcut for development)
    if (req.user.isAdmin) {
      return next();
    }
    
    // Check if user is a community admin or moderator
    const memberRole = await db.select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.userId, userId),
        eq(communityMembers.communityId, communityId),
        or(
          eq(communityMembers.role, 'admin'),
          eq(communityMembers.role, 'moderator')
        )
      ))
      .limit(1);
    
    if (memberRole.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'You must be a community moderator or admin to perform this action'
      });
    }
    
    // Add the role to the request for potential use in routes
    req.communityRole = memberRole[0].role;
    
    next();
  } catch (error) {
    console.error('[Middleware] Error in isCommunityModerator:', error);
    res.status(500).json({ error: 'Server error checking community permissions' });
  }
};

/**
 * Middleware to check if a user is a member of a community
 */
export const isCommunityMember = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = req.user.id;
    const communityId = parseInt(req.params.communityId);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }
    
    // Check if user is a community member
    const membership = await db.select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.userId, userId),
        eq(communityMembers.communityId, communityId),
        eq(communityMembers.isActive, true)
      ))
      .limit(1);
    
    if (membership.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'You must be a member of this community to perform this action'
      });
    }
    
    // Add the role to the request for potential use in routes
    req.communityRole = membership[0].role;
    
    next();
  } catch (error) {
    console.error('[Middleware] Error in isCommunityMember:', error);
    res.status(500).json({ error: 'Server error checking community membership' });
  }
};