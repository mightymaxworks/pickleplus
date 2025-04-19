/**
 * PKL-278651-COMM-0029-MOD - Enhanced Community Moderation Routes
 * Implementation timestamp: 2025-04-19 18:15 ET
 * 
 * API routes for community moderation system with enhanced features:
 * - Content filtering
 * - Approval workflows
 * - Enhanced reporting
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
  contentApprovalQueue,
  contentFilterSettings,
  insertContentReportSchema,
  insertModerationActionSchema,
  insertCommunityRoleSchema,
  insertContentApprovalSchema,
  insertContentFilterSettingsSchema
} from '../../shared/schema';
import { isAuthenticated } from '../auth';
import { isCommunityModerator } from '../middleware/community-middleware.js';
import { moderationService } from '../modules/community/moderation-service.js';

const router = express.Router();

export function registerCommunityModerationRoutes(app: express.Express) {
  console.log('[ROUTES] Registering Community Moderation Routes (PKL-278651-COMM-0029-MOD)');
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

/**
 * Get content filter settings for a community
 * GET /api/communities/:communityId/moderation/filter-settings
 */
router.get('/communities/:communityId/moderation/filter-settings',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Use moderation service to get settings
      const settings = await moderationService.getContentFilterSettings(communityId);
      
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching content filter settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Update content filter settings for a community
 * PUT /api/communities/:communityId/moderation/filter-settings
 */
router.put('/communities/:communityId/moderation/filter-settings',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Validate request body
      const updateSchema = z.object({
        enabledFilters: z.any().optional(),
        bannedKeywords: z.string().optional(),
        sensitiveContentTypes: z.string().optional(),
        requireApproval: z.boolean().optional(),
        autoModEnabled: z.boolean().optional()
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Update settings
      const updatedSettings = await moderationService.updateContentFilterSettings(
        communityId,
        validationResult.data
      );
      
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Error updating content filter settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Filter content for a community
 * POST /api/communities/:communityId/moderation/filter-content
 */
router.post('/communities/:communityId/moderation/filter-content',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user?.id;
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      if (!userId) {
        return res.status(401).json({ error: 'User must be authenticated' });
      }
      
      // Validate request body
      const contentSchema = z.object({
        content: z.string().min(1).max(5000),
        contentType: z.enum(['post', 'comment', 'event'])
      });
      
      const validationResult = contentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Filter the content
      const { content, contentType } = validationResult.data;
      const result = await moderationService.filterContent(
        communityId,
        content,
        contentType,
        userId
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error filtering content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get pending approval queue items for a community
 * GET /api/communities/:communityId/moderation/approval-queue
 */
router.get('/communities/:communityId/moderation/approval-queue',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Get pending content items
      const items = await moderationService.getPendingContentItems(communityId);
      
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching approval queue:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Review a queued content item
 * PATCH /api/communities/:communityId/moderation/approval-queue/:itemId
 */
router.patch('/communities/:communityId/moderation/approval-queue/:itemId',
  isAuthenticated,
  isCommunityModerator,
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const itemId = parseInt(req.params.itemId);
      const moderatorId = req.user?.id;
      
      if (isNaN(communityId) || isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid ID parameters' });
      }
      
      if (!moderatorId) {
        return res.status(401).json({ error: 'User must be authenticated' });
      }
      
      // Validate request body
      const reviewSchema = z.object({
        approved: z.boolean(),
        moderationNotes: z.string().max(500).optional()
      });
      
      const validationResult = reviewSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Review the queued content
      const { approved, moderationNotes } = validationResult.data;
      const updatedItem = await moderationService.reviewQueuedContent(
        itemId,
        moderatorId,
        approved,
        moderationNotes
      );
      
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error reviewing queued content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;