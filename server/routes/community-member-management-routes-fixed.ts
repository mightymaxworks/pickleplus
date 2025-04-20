/**
 * PKL-278651-COMM-0034-MEMBER
 * Enhanced Member Management Routes
 * 
 * This file defines the API endpoints for enhanced community member management.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { 
  MemberActionType, 
  insertCommunityCustomRoleSchema,
  insertCommunityRolePermissionSchema,
  insertCommunityRoleAssignmentSchema
} from '../../shared/schema';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';
import { checkPermission } from '../middleware/community-permissions';

// Initialize router
const router = express.Router();

/**
 * GET /api/communities/:id/roles
 * Get all roles for a community including permissions
 */
router.get('/:id/roles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get community roles with permissions
    const roles = await storage.getCommunityRolesWithPermissions(communityId);
    
    res.json(roles);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error fetching community roles:', error);
    res.status(500).json({ message: 'Failed to fetch community roles' });
  }
});

/**
 * GET /api/communities/:id/permission-types
 * Get all available permission types with descriptions
 */
router.get('/:id/permission-types', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get permission types grouped by category
    const permissionTypes = await storage.getCommunityPermissionTypes();
    
    res.json(permissionTypes);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error fetching permission types:', error);
    res.status(500).json({ message: 'Failed to fetch permission types' });
  }
});

/**
 * PATCH /api/communities/:id/roles/:role/permissions
 * Update permissions for a specific role
 */
router.patch('/:id/roles/:role/permissions', isAuthenticated, checkPermission('manage_roles'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const role = req.params.role;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    const schema = z.object({
      permissions: z.record(z.string(), z.boolean())
    });
    
    const validatedData = schema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid permissions data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Update permissions
    await storage.updateRolePermissions(communityId, role, validatedData.data.permissions);
    
    // Log this action
    const userId = req.user!.id;
    await storage.logMemberAction({
      communityId,
      actionType: MemberActionType.CHANGE_PRIMARY_ROLE,
      performedByUserId: userId,
      targetUserIds: [],
      actionDetails: {
        role,
        updatedPermissions: validatedData.data.permissions
      }
    });
    
    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error updating permissions:', error);
    res.status(500).json({ message: 'Failed to update permissions' });
  }
});

/**
 * POST /api/communities/:id/custom-roles
 * Create a new custom role
 */
router.post('/:id/custom-roles', isAuthenticated, checkPermission('manage_roles'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Validate request body
    const validatedData = insertCommunityCustomRoleSchema.safeParse({
      ...req.body,
      communityId
    });
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid custom role data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Create custom role
    const customRole = await storage.createCommunityCustomRole(validatedData.data);
    
    res.status(201).json(customRole);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error creating custom role:', error);
    res.status(500).json({ message: 'Failed to create custom role' });
  }
});

/**
 * GET /api/communities/:id/custom-roles
 * Get all custom roles for a community
 */
router.get('/:id/custom-roles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get custom roles
    const customRoles = await storage.getCommunityCustomRoles(communityId);
    
    res.json(customRoles);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error fetching custom roles:', error);
    res.status(500).json({ message: 'Failed to fetch custom roles' });
  }
});

/**
 * PATCH /api/communities/:id/custom-roles/:roleId
 * Update a custom role
 */
router.patch('/:id/custom-roles/:roleId', isAuthenticated, checkPermission('manage_roles'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const roleId = parseInt(req.params.roleId);
    
    if (isNaN(communityId) || isNaN(roleId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }
    
    // Update custom role
    const updatedRole = await storage.updateCommunityCustomRole(roleId, req.body);
    
    res.json(updatedRole);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error updating custom role:', error);
    res.status(500).json({ message: 'Failed to update custom role' });
  }
});

/**
 * DELETE /api/communities/:id/custom-roles/:roleId
 * Delete a custom role
 */
router.delete('/:id/custom-roles/:roleId', isAuthenticated, checkPermission('manage_roles'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const roleId = parseInt(req.params.roleId);
    
    if (isNaN(communityId) || isNaN(roleId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }
    
    // Check if role has assignments
    const hasAssignments = await storage.hasRoleAssignments(roleId);
    
    if (hasAssignments) {
      return res.status(400).json({ 
        message: 'Cannot delete a role that is assigned to members. Remove all assignments first.' 
      });
    }
    
    // Delete custom role
    await storage.deleteCommunityCustomRole(roleId);
    
    res.json({ message: 'Custom role deleted successfully' });
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error deleting custom role:', error);
    res.status(500).json({ message: 'Failed to delete custom role' });
  }
});

/**
 * POST /api/communities/:id/members/:userId/assign-role
 * Assign a custom role to a member
 */
router.post('/:id/members/:userId/assign-role', isAuthenticated, checkPermission('assign_roles'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const currentUserId = req.user!.id;
    
    if (isNaN(communityId) || isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }
    
    const schema = z.object({
      customRoleId: z.number()
    });
    
    const validatedData = schema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid role assignment data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Check if member exists in community
    const membership = await storage.getCommunityMembership(communityId, targetUserId);
    
    if (!membership) {
      return res.status(404).json({ message: 'User is not a member of this community' });
    }
    
    // Check if role exists
    const customRole = await storage.getCommunityCustomRoleById(validatedData.data.customRoleId);
    
    if (!customRole || customRole.communityId !== communityId) {
      return res.status(404).json({ message: 'Custom role not found in this community' });
    }
    
    // Check if assignment already exists
    const existingAssignment = await storage.getRoleAssignment(communityId, targetUserId, validatedData.data.customRoleId);
    
    if (existingAssignment) {
      return res.status(400).json({ message: 'User already has this role' });
    }
    
    // Create role assignment
    const assignment = await storage.createRoleAssignment({
      communityId,
      userId: targetUserId,
      customRoleId: validatedData.data.customRoleId,
      assignedByUserId: currentUserId
    });
    
    // Log this action
    await storage.logMemberAction({
      communityId,
      actionType: MemberActionType.ADD_ROLE,
      performedByUserId: currentUserId,
      targetUserIds: [targetUserId],
      actionDetails: {
        roleId: validatedData.data.customRoleId,
        roleName: customRole.name
      }
    });
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error assigning role:', error);
    res.status(500).json({ message: 'Failed to assign role' });
  }
});

/**
 * DELETE /api/communities/:id/members/:userId/roles/:roleId
 * Remove a custom role from a member
 */
router.delete('/:id/members/:userId/roles/:roleId', isAuthenticated, checkPermission('assign_roles'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const roleId = parseInt(req.params.roleId);
    const currentUserId = req.user!.id;
    
    if (isNaN(communityId) || isNaN(targetUserId) || isNaN(roleId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }
    
    // Check if assignment exists
    const assignment = await storage.getRoleAssignment(communityId, targetUserId, roleId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Role assignment not found' });
    }
    
    // Get role name for action log
    const customRole = await storage.getCommunityCustomRoleById(roleId);
    
    // Remove role assignment
    await storage.removeRoleAssignment(communityId, targetUserId, roleId);
    
    // Log this action
    await storage.logMemberAction({
      communityId,
      actionType: MemberActionType.REMOVE_ROLE,
      performedByUserId: currentUserId,
      targetUserIds: [targetUserId],
      actionDetails: {
        roleId,
        roleName: customRole?.name || 'Unknown Role'
      }
    });
    
    res.json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error removing role:', error);
    res.status(500).json({ message: 'Failed to remove role' });
  }
});

/**
 * POST /api/communities/:id/members/bulk-actions
 * Perform bulk actions on multiple members
 */
router.post('/:id/members/bulk-actions', isAuthenticated, checkPermission('manage_members'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const currentUserId = req.user!.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    const schema = z.object({
      action: z.nativeEnum(MemberActionType),
      userIds: z.array(z.number()),
      details: z.record(z.any()).optional()
    });
    
    const validatedData = schema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid bulk action data', 
        errors: validatedData.error.format() 
      });
    }
    
    const { action, userIds, details } = validatedData.data;
    
    // Prevent actions on community creator/owner
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (userIds.includes(community.createdByUserId) && 
        (action === MemberActionType.REMOVE || action === MemberActionType.DEMOTE || action === MemberActionType.BAN)) {
      return res.status(400).json({ 
        message: 'Cannot perform this action on the community creator' 
      });
    }
    
    // Perform the bulk action
    let result;
    switch (action) {
      case MemberActionType.PROMOTE:
        // Promote members to moderators
        result = await storage.bulkPromoteMembers(communityId, userIds);
        break;
        
      case MemberActionType.DEMOTE:
        // Demote moderators to regular members
        result = await storage.bulkDemoteMembers(communityId, userIds);
        break;
        
      case MemberActionType.REMOVE:
        // Remove members from community
        result = await storage.bulkRemoveMembers(communityId, userIds);
        break;
        
      case MemberActionType.ADD_ROLE:
        if (!details?.roleId) {
          return res.status(400).json({ message: 'Role ID is required for ADD_ROLE action' });
        }
        // Add custom role to members
        result = await storage.bulkAddRoleToMembers(
          communityId, 
          userIds, 
          parseInt(details.roleId), 
          currentUserId
        );
        break;
        
      case MemberActionType.REMOVE_ROLE:
        if (!details?.roleId) {
          return res.status(400).json({ message: 'Role ID is required for REMOVE_ROLE action' });
        }
        // Remove custom role from members
        result = await storage.bulkRemoveRoleFromMembers(
          communityId, 
          userIds, 
          parseInt(details.roleId)
        );
        break;
        
      default:
        return res.status(400).json({ message: 'Unsupported bulk action' });
    }
    
    // Log this action
    await storage.logMemberAction({
      communityId,
      actionType: action,
      performedByUserId: currentUserId,
      targetUserIds: userIds,
      actionDetails: details || {}
    });
    
    res.json({
      message: 'Bulk action completed successfully',
      affected: result?.affected || userIds.length,
      details: result?.details || {}
    });
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error performing bulk action:', error);
    res.status(500).json({ message: 'Failed to perform bulk action' });
  }
});

/**
 * GET /api/communities/:id/members/with-roles
 * Get community members with their roles
 */
router.get('/:id/members/with-roles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Parse query parameters
    const limit = parseInt(req.query.limit as string || '50');
    const offset = parseInt(req.query.offset as string || '0');
    const search = req.query.search as string || '';
    const role = req.query.role as string || null;
    
    // Get members with roles
    const membersWithRoles = await storage.getCommunityMembersWithRoles(
      communityId,
      { limit, offset, search, role }
    );
    
    res.json(membersWithRoles);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error fetching members with roles:', error);
    res.status(500).json({ message: 'Failed to fetch members with roles' });
  }
});

/**
 * GET /api/communities/:id/action-logs
 * Get action logs for a community
 */
router.get('/:id/action-logs', isAuthenticated, checkPermission('manage_members'), async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Parse query parameters
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    
    // Get action logs
    const actionLogs = await storage.getCommunityActionLogs(communityId, limit, offset);
    
    res.json(actionLogs);
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Error fetching action logs:', error);
    res.status(500).json({ message: 'Failed to fetch action logs' });
  }
});

export default router;