/**
 * PKL-278651-COMM-0027-MOD - Community Middleware
 * Implementation timestamp: 2025-04-19 12:45 ET
 * 
 * Middleware functions for community functionality
 * 
 * Framework 5.2 compliant implementation
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { eq, and, or } from 'drizzle-orm';
import { communities, communityMembers, communityRoles, users } from '../../shared/schema';

/**
 * Middleware to check if a user has access to a community
 */
export async function hasCommunityAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const communityId = parseInt(req.params.communityId);
  
  if (isNaN(communityId)) {
    return res.status(400).json({ error: 'Invalid community ID' });
  }

  try {
    // Check if community exists
    const community = await db.query.communities.findFirst({
      where: eq(communities.id, communityId)
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // If community is public, allow access
    if (community.visibility === 'public') {
      return next();
    }

    // Check if user is a member
    const membership = await db.query.communityMembers.findFirst({
      where: and(
        eq(communityMembers.communityId, communityId),
        eq(communityMembers.userId, req.user.id),
        eq(communityMembers.status, 'active')
      )
    });

    if (!membership) {
      return res.status(403).json({ error: 'You do not have access to this community' });
    }

    next();
  } catch (error) {
    console.error('Error checking community access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to check if a user is a community moderator or admin
 */
export async function isCommunityModerator(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const communityId = parseInt(req.params.communityId);
  
  if (isNaN(communityId)) {
    return res.status(400).json({ error: 'Invalid community ID' });
  }
  
  try {
    // If user is a system admin, allow access
    if (req.user.isAdmin) {
      return next();
    }
    
    // Check if community exists
    const community = await db.query.communities.findFirst({
      where: eq(communities.id, communityId)
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is the community owner
    if (community.ownerId === req.user.id) {
      return next();
    }

    // Check if user has a moderator role
    // First get all roles for this community
    const roles = await db.query.communityRoles.findMany({
      where: eq(communityRoles.communityId, communityId)
    });

    // Get moderator and admin role IDs
    const moderatorRoleIds = roles
      .filter(role => ['Administrator', 'Moderator'].includes(role.name) || 
                     role.permissions.includes('manage_content') || 
                     role.permissions.includes('manage_members'))
      .map(role => role.id);

    if (moderatorRoleIds.length === 0) {
      return res.status(403).json({ error: 'You do not have moderator permissions for this community' });
    }

    // Check if user has any of these roles
    const userRole = await db.query.communityMemberRoles.findFirst({
      where: and(
        eq(communityMemberRoles.userId, req.user.id),
        eq(communityMemberRoles.communityId, communityId),
        inArray(communityMemberRoles.roleId, moderatorRoleIds)
      )
    });

    if (!userRole) {
      return res.status(403).json({ error: 'You do not have moderator permissions for this community' });
    }

    next();
  } catch (error) {
    console.error('Error checking moderator status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Helper for the inArray condition
 */
function inArray(column: any, values: any[]) {
  return values.reduce((acc, value) => or(acc, eq(column, value)), eq(column, values[0]));
}