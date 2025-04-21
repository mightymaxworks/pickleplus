/**
 * PKL-278651-BOUNCE-0005-AUTO - Admin Bounce Automation Routes
 * 
 * This file defines the routes for managing Bounce automated testing schedules
 * and templates from the admin interface.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import * as express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  bounceTestTemplates,
  bounceSchedules,
  bounceTestRuns,
  insertBounceTestTemplateSchema,
  SCHEDULE_FREQUENCY,
  type BounceTestTemplate
} from '@shared/schema';
import { eq, and, desc, asc, or } from 'drizzle-orm';
import { bounceSchedulerService } from '../services/bounce-scheduler-service';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { ServerEventBus } from '../core/events/server-event-bus';

// Define validation schemas
const templateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  configuration: z.record(z.any()).default({})
});

const scheduleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  frequency: z.nativeEnum(SCHEDULE_FREQUENCY),
  customCronExpression: z.string().optional(),
  templateId: z.number().optional(),
  isActive: z.boolean().default(true),
  configuration: z.record(z.any()).optional().default({})
});

/**
 * Register Bounce automation routes with the Express app
 * @param app Express application
 */
export function registerBounceAutomationRoutes(app: express.Express): void {
  const router = express.Router();
  
  // Apply security middleware
  router.use(isAuthenticated);
  router.use(isAdmin);
  router.use(csrfProtection);
  
  // Template routes
  router.get('/templates', async (req: Request, res: Response) => {
    try {
      const templates = await db.select()
        .from(bounceTestTemplates)
        .where(eq(bounceTestTemplates.isDeleted, false))
        .orderBy(asc(bounceTestTemplates.name));
      
      res.json(templates);
    } catch (error) {
      console.error('[API] Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });
  
  router.get('/templates/:id', async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }
      
      const template = await db.select()
        .from(bounceTestTemplates)
        .where(
          and(
            eq(bounceTestTemplates.id, templateId),
            eq(bounceTestTemplates.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error(`[API] Error fetching template ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  });
  
  router.post('/templates', async (req: Request, res: Response) => {
    try {
      const validatedData = templateSchema.parse(req.body);
      
      const newTemplate = await db.insert(bounceTestTemplates)
        .values({
          name: validatedData.name,
          description: validatedData.description,
          configuration: validatedData.configuration,
          createdBy: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false
        })
        .returning();
      
      if (!newTemplate.length) {
        return res.status(500).json({ message: 'Failed to create template' });
      }
      
      // Publish event for template created
      await ServerEventBus.publish('bounce:template:created', { template: newTemplate[0] });
      
      res.status(201).json(newTemplate[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid template data', 
          errors: error.errors 
        });
      }
      
      console.error('[API] Error creating template:', error);
      res.status(500).json({ message: 'Failed to create template' });
    }
  });
  
  router.put('/templates/:id', async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }
      
      const validatedData = templateSchema.parse(req.body);
      
      // Check if the template exists
      const existingTemplate = await db.select()
        .from(bounceTestTemplates)
        .where(
          and(
            eq(bounceTestTemplates.id, templateId),
            eq(bounceTestTemplates.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      // Update the template
      const updatedTemplate = await db.update(bounceTestTemplates)
        .set({
          name: validatedData.name,
          description: validatedData.description,
          configuration: validatedData.configuration,
          updatedAt: new Date()
        })
        .where(eq(bounceTestTemplates.id, templateId))
        .returning();
      
      if (!updatedTemplate.length) {
        return res.status(500).json({ message: 'Failed to update template' });
      }
      
      // Publish event for template updated
      await ServerEventBus.publish('bounce:template:updated', { template: updatedTemplate[0] });
      
      res.json(updatedTemplate[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid template data', 
          errors: error.errors 
        });
      }
      
      console.error(`[API] Error updating template ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update template' });
    }
  });
  
  router.delete('/templates/:id', async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }
      
      // Check if the template exists
      const existingTemplate = await db.select()
        .from(bounceTestTemplates)
        .where(
          and(
            eq(bounceTestTemplates.id, templateId),
            eq(bounceTestTemplates.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      // Check if there are any active schedules using this template
      const activeSchedules = await db.select({ count: bounceSchedules.id })
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.templateId, templateId),
            eq(bounceSchedules.isActive, true),
            eq(bounceSchedules.isDeleted, false)
          )
        );
      
      if (activeSchedules.length > 0 && activeSchedules[0].count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete a template that is being used by active schedules',
          activeSchedules: activeSchedules[0].count
        });
      }
      
      // Soft delete the template
      const deletedTemplate = await db.update(bounceTestTemplates)
        .set({
          isDeleted: true,
          updatedAt: new Date()
        })
        .where(eq(bounceTestTemplates.id, templateId))
        .returning();
      
      if (!deletedTemplate.length) {
        return res.status(500).json({ message: 'Failed to delete template' });
      }
      
      // Publish event for template deleted
      await ServerEventBus.publish('bounce:template:deleted', { templateId });
      
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error(`[API] Error deleting template ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete template' });
    }
  });
  
  // Schedule routes
  router.get('/schedules', async (req: Request, res: Response) => {
    try {
      const schedules = await db.select({
        id: bounceSchedules.id,
        name: bounceSchedules.name,
        description: bounceSchedules.description,
        frequency: bounceSchedules.frequency,
        customCronExpression: bounceSchedules.customCronExpression,
        isActive: bounceSchedules.isActive,
        lastRunTime: bounceSchedules.lastRunTime,
        nextRunTime: bounceSchedules.nextRunTime,
        lastError: bounceSchedules.lastError,
        lastErrorTime: bounceSchedules.lastErrorTime,
        templateId: bounceSchedules.templateId,
        configuration: bounceSchedules.configuration,
        createdBy: bounceSchedules.createdBy,
        createdAt: bounceSchedules.createdAt,
        updatedAt: bounceSchedules.updatedAt,
        templateName: bounceTestTemplates.name
      })
        .from(bounceSchedules)
        .leftJoin(
          bounceTestTemplates,
          eq(bounceSchedules.templateId, bounceTestTemplates.id)
        )
        .where(eq(bounceSchedules.isDeleted, false))
        .orderBy(asc(bounceSchedules.name));
      
      res.json(schedules);
    } catch (error) {
      console.error('[API] Error fetching schedules:', error);
      res.status(500).json({ message: 'Failed to fetch schedules' });
    }
  });
  
  router.get('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }
      
      const schedule = await db.select({
        id: bounceSchedules.id,
        name: bounceSchedules.name,
        description: bounceSchedules.description,
        frequency: bounceSchedules.frequency,
        customCronExpression: bounceSchedules.customCronExpression,
        isActive: bounceSchedules.isActive,
        lastRunTime: bounceSchedules.lastRunTime,
        nextRunTime: bounceSchedules.nextRunTime,
        lastError: bounceSchedules.lastError,
        lastErrorTime: bounceSchedules.lastErrorTime,
        templateId: bounceSchedules.templateId,
        configuration: bounceSchedules.configuration,
        createdBy: bounceSchedules.createdBy,
        createdAt: bounceSchedules.createdAt,
        updatedAt: bounceSchedules.updatedAt,
        templateName: bounceTestTemplates.name
      })
        .from(bounceSchedules)
        .leftJoin(
          bounceTestTemplates,
          eq(bounceSchedules.templateId, bounceTestTemplates.id)
        )
        .where(
          and(
            eq(bounceSchedules.id, scheduleId),
            eq(bounceSchedules.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      // Get recent runs for this schedule
      const recentRuns = await db.select()
        .from(bounceTestRuns)
        .where(eq(bounceTestRuns.scheduleId, scheduleId))
        .orderBy(desc(bounceTestRuns.startedAt))
        .limit(5);
      
      res.json({
        ...schedule,
        recentRuns
      });
    } catch (error) {
      console.error(`[API] Error fetching schedule ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch schedule' });
    }
  });
  
  router.post('/schedules', async (req: Request, res: Response) => {
    try {
      const validatedData = scheduleSchema.parse(req.body);
      
      const newSchedule = await db.insert(bounceSchedules)
        .values({
          name: validatedData.name,
          description: validatedData.description,
          frequency: validatedData.frequency,
          customCronExpression: validatedData.customCronExpression,
          isActive: validatedData.isActive,
          templateId: validatedData.templateId,
          configuration: validatedData.configuration,
          createdBy: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false
        })
        .returning();
      
      if (!newSchedule.length) {
        return res.status(500).json({ message: 'Failed to create schedule' });
      }
      
      // Publish event for schedule created
      await ServerEventBus.publish('bounce:schedule:created', { schedule: newSchedule[0] });
      
      res.status(201).json(newSchedule[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid schedule data', 
          errors: error.errors 
        });
      }
      
      console.error('[API] Error creating schedule:', error);
      res.status(500).json({ message: 'Failed to create schedule' });
    }
  });
  
  router.put('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }
      
      const validatedData = scheduleSchema.parse(req.body);
      
      // Check if the schedule exists
      const existingSchedule = await db.select()
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.id, scheduleId),
            eq(bounceSchedules.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      // Update the schedule
      const updatedSchedule = await db.update(bounceSchedules)
        .set({
          name: validatedData.name,
          description: validatedData.description,
          frequency: validatedData.frequency,
          customCronExpression: validatedData.customCronExpression,
          isActive: validatedData.isActive,
          templateId: validatedData.templateId,
          configuration: validatedData.configuration,
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, scheduleId))
        .returning();
      
      if (!updatedSchedule.length) {
        return res.status(500).json({ message: 'Failed to update schedule' });
      }
      
      // Publish event for schedule updated
      await ServerEventBus.publish('bounce:schedule:updated', { schedule: updatedSchedule[0] });
      
      res.json(updatedSchedule[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid schedule data', 
          errors: error.errors 
        });
      }
      
      console.error(`[API] Error updating schedule ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update schedule' });
    }
  });
  
  router.delete('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }
      
      // Check if the schedule exists
      const existingSchedule = await db.select()
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.id, scheduleId),
            eq(bounceSchedules.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      // Soft delete the schedule
      const deletedSchedule = await db.update(bounceSchedules)
        .set({
          isDeleted: true,
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, scheduleId))
        .returning();
      
      if (!deletedSchedule.length) {
        return res.status(500).json({ message: 'Failed to delete schedule' });
      }
      
      // Publish event for schedule deleted
      await ServerEventBus.publish('bounce:schedule:deleted', { scheduleId });
      
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error(`[API] Error deleting schedule ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete schedule' });
    }
  });
  
  router.post('/schedules/:id/trigger', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }
      
      // Check if the schedule exists and is active
      const existingSchedule = await db.select()
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.id, scheduleId),
            eq(bounceSchedules.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      if (!existingSchedule.isActive) {
        return res.status(400).json({ message: 'Cannot trigger an inactive schedule' });
      }
      
      // Trigger the schedule
      await bounceSchedulerService.triggerScheduleNow(scheduleId);
      
      res.json({ message: 'Schedule triggered successfully' });
    } catch (error) {
      console.error(`[API] Error triggering schedule ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to trigger schedule' });
    }
  });
  
  router.post('/schedules/:id/pause', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }
      
      // Check if the schedule exists
      const existingSchedule = await db.select()
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.id, scheduleId),
            eq(bounceSchedules.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      if (!existingSchedule.isActive) {
        return res.status(400).json({ message: 'Schedule is already paused' });
      }
      
      // Pause the schedule
      const pausedSchedule = await db.update(bounceSchedules)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, scheduleId))
        .returning();
      
      if (!pausedSchedule.length) {
        return res.status(500).json({ message: 'Failed to pause schedule' });
      }
      
      // Publish event for schedule updated
      await ServerEventBus.publish('bounce:schedule:updated', { schedule: pausedSchedule[0] });
      
      res.json({ message: 'Schedule paused successfully' });
    } catch (error) {
      console.error(`[API] Error pausing schedule ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to pause schedule' });
    }
  });
  
  router.post('/schedules/:id/resume', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }
      
      // Check if the schedule exists
      const existingSchedule = await db.select()
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.id, scheduleId),
            eq(bounceSchedules.isDeleted, false)
          )
        )
        .then(rows => rows[0]);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      if (existingSchedule.isActive) {
        return res.status(400).json({ message: 'Schedule is already active' });
      }
      
      // Resume the schedule
      const resumedSchedule = await db.update(bounceSchedules)
        .set({
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, scheduleId))
        .returning();
      
      if (!resumedSchedule.length) {
        return res.status(500).json({ message: 'Failed to resume schedule' });
      }
      
      // Publish event for schedule updated
      await ServerEventBus.publish('bounce:schedule:updated', { schedule: resumedSchedule[0] });
      
      res.json({ message: 'Schedule resumed successfully' });
    } catch (error) {
      console.error(`[API] Error resuming schedule ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to resume schedule' });
    }
  });
  
  // Status endpoint
  router.get('/automation/status', async (req: Request, res: Response) => {
    try {
      const status = await bounceSchedulerService.getScheduleStatus();
      res.json(status);
    } catch (error) {
      console.error('[API] Error fetching automation status:', error);
      res.status(500).json({ message: 'Failed to fetch automation status' });
    }
  });
  
  // Register all routes with /api/admin prefix
  app.use('/api/admin/bounce', router);
  
  // Make sure the scheduler service is initialized
  bounceSchedulerService.initialize().catch(error => {
    console.error('[API] Error initializing bounce scheduler service:', error);
  });
};