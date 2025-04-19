/**
 * PKL-278651-COMM-0027-MOD - Community Moderation Routes
 * Implementation timestamp: 2025-04-19 12:35 ET
 * 
 * API routes for community moderation system
 * 
 * Framework 5.2 compliant implementation
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { 
  contentReports, 
  moderationActions, 
  communityRoles,
  insertContentReportSchema,
  insertModerationActionSchema,
  insertCommunityRoleSchema
} from '../../shared/schema';
import { isAuthenticated } from '../auth';
import { isCommunityModerator } from '../middleware/community-middleware.js';

const router = express.Router();

export function registerCommunityModerationRoutes(app: express.Express) {
  console.log('[ROUTES] Registering Community Moderation Routes (PKL-278651-COMM-0027-MOD)');
  app.use('/api', router);
  return router;
}

/**
 * Get all content reports for a community
 * GET /api/communities/:communityId/moderation/reports
 */
router.get('/communities/:communityId/moderation/reports',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      const reports = await db.query.contentReports.findMany({
        where: eq(contentReports.communityId, communityId),
        orderBy: [desc(contentReports.createdAt)],
        with: {
          reporter: true,
          reviewer: true
        }
      });
      
      res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching content reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Create a new content report
 * POST /api/communities/:communityId/moderation/reports
 */
router.post('/communities/:communityId/moderation/reports',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user?.id;
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Validate request body
      const validationResult = insertContentReportSchema.safeParse({
        ...req.body,
        reporterId: userId,
        communityId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Create report
      const [report] = await db.insert(contentReports)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating content report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Review a content report (for moderators/admins)
 * PATCH /api/communities/:communityId/moderation/reports/:reportId
 */
router.patch('/communities/:communityId/moderation/reports/:reportId',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const reportId = parseInt(req.params.reportId);
      const userId = req.user?.id;
      
      if (isNaN(communityId) || isNaN(reportId)) {
        return res.status(400).json({ error: 'Invalid ID parameters' });
      }
      
      // Validate request body
      const updateSchema = z.object({
        status: z.enum(['pending', 'approved', 'rejected']),
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Update report
      const [updatedReport] = await db
        .update(contentReports)
        .set({
          status: validationResult.data.status,
          reviewerId: userId,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(contentReports.id, reportId),
            eq(contentReports.communityId, communityId)
          )
        )
        .returning();
      
      if (!updatedReport) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      res.status(200).json(updatedReport);
    } catch (error) {
      console.error('Error updating content report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get all moderation actions for a community
 * GET /api/communities/:communityId/moderation/actions
 */
router.get('/communities/:communityId/moderation/actions',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      const actions = await db.query.moderationActions.findMany({
        where: eq(moderationActions.communityId, communityId),
        orderBy: [desc(moderationActions.createdAt)],
        with: {
          moderator: true,
          targetUser: true
        }
      });
      
      res.status(200).json(actions);
    } catch (error) {
      console.error('Error fetching moderation actions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Create a new moderation action
 * POST /api/communities/:communityId/moderation/actions
 */
router.post('/communities/:communityId/moderation/actions',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const moderatorId = req.user?.id;
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Validate request body
      const validationResult = insertModerationActionSchema.safeParse({
        ...req.body,
        moderatorId,
        communityId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Create action
      const [action] = await db.insert(moderationActions)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(action);
    } catch (error) {
      console.error('Error creating moderation action:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Update a moderation action
 * PATCH /api/communities/:communityId/moderation/actions/:actionId
 */
router.patch('/communities/:communityId/moderation/actions/:actionId',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const actionId = parseInt(req.params.actionId);
      
      if (isNaN(communityId) || isNaN(actionId)) {
        return res.status(400).json({ error: 'Invalid ID parameters' });
      }
      
      // Validate request body
      const updateSchema = z.object({
        isActive: z.boolean().optional(),
        reason: z.string().min(3).max(500).optional(),
        durationHours: z.number().int().optional()
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Update action
      const [updatedAction] = await db
        .update(moderationActions)
        .set({
          ...validationResult.data,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(moderationActions.id, actionId),
            eq(moderationActions.communityId, communityId)
          )
        )
        .returning();
      
      if (!updatedAction) {
        return res.status(404).json({ error: 'Action not found' });
      }
      
      res.status(200).json(updatedAction);
    } catch (error) {
      console.error('Error updating moderation action:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get all roles for a community
 * GET /api/communities/:communityId/roles
 */
router.get('/communities/:communityId/roles',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      const roles = await db.query.communityRoles.findMany({
        where: eq(communityRoles.communityId, communityId),
      });
      
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error fetching community roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Create a new community role
 * POST /api/communities/:communityId/roles
 */
router.post('/communities/:communityId/roles',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Validate request body
      const validationResult = insertCommunityRoleSchema.safeParse({
        ...req.body,
        communityId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Create role
      const [role] = await db.insert(communityRoles)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(role);
    } catch (error) {
      console.error('Error creating community role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Update a community role
 * PATCH /api/communities/:communityId/roles/:roleId
 */
router.patch('/communities/:communityId/roles/:roleId',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const roleId = parseInt(req.params.roleId);
      
      if (isNaN(communityId) || isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid ID parameters' });
      }
      
      // Validate request body
      const updateSchema = z.object({
        name: z.string().min(2).max(50).optional(),
        permissions: z.string().min(2).optional(),
        color: z.string().max(20).optional()
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Update role
      const [updatedRole] = await db
        .update(communityRoles)
        .set({
          ...validationResult.data,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(communityRoles.id, roleId),
            eq(communityRoles.communityId, communityId)
          )
        )
        .returning();
      
      if (!updatedRole) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.status(200).json(updatedRole);
    } catch (error) {
      console.error('Error updating community role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Delete a community role
 * DELETE /api/communities/:communityId/roles/:roleId
 */
router.delete('/communities/:communityId/roles/:roleId',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const roleId = parseInt(req.params.roleId);
      
      if (isNaN(communityId) || isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid ID parameters' });
      }
      
      // Check if it's a default role
      const role = await db.query.communityRoles.findFirst({
        where: and(
          eq(communityRoles.id, roleId),
          eq(communityRoles.communityId, communityId)
        )
      });
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      // Don't allow deletion of default roles
      if (['Administrator', 'Moderator', 'Member'].includes(role.name)) {
        return res.status(400).json({ error: 'Cannot delete default roles' });
      }
      
      // Delete role
      await db
        .delete(communityRoles)
        .where(
          and(
            eq(communityRoles.id, roleId),
            eq(communityRoles.communityId, communityId)
          )
        );
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting community role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;