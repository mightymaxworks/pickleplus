/**
 * PKL-278651-COMM-0035-EVENT
 * Event Templates API Routes
 * 
 * This file defines the API routes for managing event templates.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import express from 'express';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { eventTemplates, insertEventTemplateSchema } from '../../../shared/schema/event-templates';
import { isAuthenticated } from '../../middleware/auth';
import { communities, communityMembers } from '../../../shared/schema/community';

// Define the CommunityMemberRole enum if it's not available from imports
enum CommunityMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

const router = express.Router();

// Helper function to validate if the user has appropriate permissions for the community
const hasTemplateManagementPermission = async (communityId: number, userId: number): Promise<boolean> => {
  try {
    // Query the database to check if the user is an admin or moderator of the community
    const [member] = await db.select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId),
          eq(communityMembers.status, 'active')
        )
      );
    
    if (!member) return false;
    
    // Check if the user has one of the required roles
    return [CommunityMemberRole.ADMIN, CommunityMemberRole.MODERATOR].includes(member.role as CommunityMemberRole);
  } catch (error) {
    console.error('Error checking template management permission:', error);
    return false;
  }
};

/**
 * GET /api/communities/:communityId/event-templates
 * Get all event templates for a community
 */
router.get('/communities/:communityId/event-templates', isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Validate that the user is a member of this community
    const isMember = await hasTemplateManagementPermission(communityId, req.user.id);
    if (!isMember) {
      return res.status(403).json({ 
        message: "You don't have permission to view event templates for this community" 
      });
    }
    
    // Fetch templates for the community
    const templates = await db.select()
      .from(eventTemplates)
      .where(eq(eventTemplates.communityId, communityId));
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching event templates:', error);
    res.status(500).json({ message: 'Failed to fetch event templates' });
  }
});

/**
 * GET /api/communities/:communityId/event-templates/:id
 * Get a specific event template
 */
router.get('/communities/:communityId/event-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const templateId = parseInt(req.params.id);
    
    // Validate that the user is a member of this community
    const isMember = await hasTemplateManagementPermission(communityId, req.user.id);
    if (!isMember) {
      return res.status(403).json({ 
        message: "You don't have permission to view event templates for this community" 
      });
    }
    
    // Fetch the specific template
    const [template] = await db.select()
      .from(eventTemplates)
      .where(
        and(
          eq(eventTemplates.communityId, communityId),
          eq(eventTemplates.id, templateId)
        )
      );
    
    if (!template) {
      return res.status(404).json({ message: 'Event template not found' });
    }
    
    res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching event template:', error);
    res.status(500).json({ message: 'Failed to fetch event template' });
  }
});

/**
 * POST /api/communities/:communityId/event-templates
 * Create a new event template
 */
router.post('/communities/:communityId/event-templates', isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Validate that the user has permissions to create templates
    const isAdmin = await hasTemplateManagementPermission(communityId, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ 
        message: "You don't have permission to create event templates for this community" 
      });
    }
    
    // Validate request body
    const validatedData = insertEventTemplateSchema.parse(req.body);
    
    // If this template is marked as default, unset any existing defaults
    if (validatedData.isDefault) {
      await db.update(eventTemplates)
        .set({ isDefault: false })
        .where(eq(eventTemplates.communityId, communityId));
    }
    
    // Create the template
    const [newTemplate] = await db.insert(eventTemplates)
      .values({
        ...validatedData,
        communityId,
        createdByUserId: req.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();
    
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating event template:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create event template' });
  }
});

/**
 * PUT /api/communities/:communityId/event-templates/:id
 * Update an existing event template
 */
router.put('/communities/:communityId/event-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const templateId = parseInt(req.params.id);
    
    // Validate that the user has permissions to edit templates
    const isAdmin = await hasTemplateManagementPermission(communityId, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ 
        message: "You don't have permission to update event templates for this community" 
      });
    }
    
    // Check if template exists
    const [existingTemplate] = await db.select()
      .from(eventTemplates)
      .where(
        and(
          eq(eventTemplates.communityId, communityId),
          eq(eventTemplates.id, templateId)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Event template not found' });
    }
    
    // Validate request body
    const validatedData = insertEventTemplateSchema.parse(req.body);
    
    // If this template is being set as default, unset any existing defaults
    if (validatedData.isDefault && !existingTemplate.isDefault) {
      await db.update(eventTemplates)
        .set({ isDefault: false })
        .where(eq(eventTemplates.communityId, communityId));
    }
    
    // Update the template
    const [updatedTemplate] = await db.update(eventTemplates)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(eventTemplates.communityId, communityId),
          eq(eventTemplates.id, templateId)
        )
      )
      .returning();
    
    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error('Error updating event template:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update event template' });
  }
});

/**
 * DELETE /api/communities/:communityId/event-templates/:id
 * Delete an event template
 */
router.delete('/communities/:communityId/event-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const templateId = parseInt(req.params.id);
    
    // Validate that the user has permissions to delete templates
    const isAdmin = await hasTemplateManagementPermission(communityId, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ 
        message: "You don't have permission to delete event templates for this community" 
      });
    }
    
    // Delete the template
    const [deletedTemplate] = await db.delete(eventTemplates)
      .where(
        and(
          eq(eventTemplates.communityId, communityId),
          eq(eventTemplates.id, templateId)
        )
      )
      .returning();
    
    if (!deletedTemplate) {
      return res.status(404).json({ message: 'Event template not found' });
    }
    
    res.status(200).json({
      message: 'Event template deleted successfully',
      id: deletedTemplate.id
    });
  } catch (error) {
    console.error('Error deleting event template:', error);
    res.status(500).json({ message: 'Failed to delete event template' });
  }
});

export default router;