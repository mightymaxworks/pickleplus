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

import express, { Request, Response } from 'express';
import { isAdmin } from '../middleware/auth';
import { BounceSchedulerService } from '../services/bounce-scheduler-service';
import { z } from 'zod';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { bounceTestTemplates, type InsertBounceTestTemplate } from '@shared/schema';
import { csrfProtection } from '../middleware/csrf';

// Create scheduler service instance
const schedulerService = BounceSchedulerService.getInstance();

// Initialize the scheduler service when the routes are registered
// This will load and schedule all active schedules
schedulerService.initialize().catch(error => {
  console.error('[AdminBounceAutomationRoutes] Error initializing scheduler service:', error);
});

// Schema for creating a schedule
const createScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']),
  customCronExpression: z.string().optional(),
  isActive: z.boolean().default(true),
  templateId: z.number().optional(),
  configuration: z.record(z.any()).optional(),
  createdBy: z.number()
});

// Schema for updating a schedule
const updateScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']).optional(),
  customCronExpression: z.string().optional(),
  isActive: z.boolean().optional(),
  templateId: z.number().optional(),
  configuration: z.record(z.any()).optional()
});

// Schema for creating a test template
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  configuration: z.record(z.any()),
  createdBy: z.number()
});

// Schema for updating a test template
const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  configuration: z.record(z.any()).optional()
});

/**
 * Register Bounce automation routes with the Express app
 * @param app Express application
 */
export function registerBounceAutomationRoutes(app: express.Express): void {
  const router = express.Router();
  
  // Add middleware
  router.use(isAdmin);
  router.use(csrfProtection);
  
  // Get all schedules
  router.get('/schedules', async (req: Request, res: Response) => {
    try {
      const schedules = await schedulerService.getAllSchedules();
      res.json(schedules);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error getting schedules:', error);
      res.status(500).json({ error: 'Failed to get schedules' });
    }
  });
  
  // Get a schedule by ID
  router.get('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Invalid schedule ID' });
      }
      
      const schedule = await schedulerService.getScheduleById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error getting schedule:', error);
      res.status(500).json({ error: 'Failed to get schedule' });
    }
  });
  
  // Create a new schedule
  router.post('/schedules', async (req: Request, res: Response) => {
    try {
      const scheduleData = createScheduleSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const schedule = await schedulerService.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error creating schedule:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  });
  
  // Update a schedule
  router.put('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Invalid schedule ID' });
      }
      
      const scheduleData = updateScheduleSchema.parse(req.body);
      
      const schedule = await schedulerService.updateSchedule(scheduleId, scheduleData);
      res.json(schedule);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error updating schedule:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  });
  
  // Delete a schedule
  router.delete('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Invalid schedule ID' });
      }
      
      const schedule = await schedulerService.deleteSchedule(scheduleId);
      res.json(schedule);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error deleting schedule:', error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  });
  
  // Manually trigger a schedule
  router.post('/schedules/:id/trigger', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Invalid schedule ID' });
      }
      
      const testRun = await schedulerService.triggerSchedule(scheduleId);
      if (!testRun) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      res.json({ message: 'Schedule triggered successfully', testRun });
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error triggering schedule:', error);
      res.status(500).json({ error: 'Failed to trigger schedule' });
    }
  });
  
  // Pause a schedule
  router.post('/schedules/:id/pause', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Invalid schedule ID' });
      }
      
      const schedule = await schedulerService.pauseSchedule(scheduleId);
      res.json(schedule);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error pausing schedule:', error);
      res.status(500).json({ error: 'Failed to pause schedule' });
    }
  });
  
  // Resume a schedule
  router.post('/schedules/:id/resume', async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Invalid schedule ID' });
      }
      
      const schedule = await schedulerService.resumeSchedule(scheduleId);
      res.json(schedule);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error resuming schedule:', error);
      res.status(500).json({ error: 'Failed to resume schedule' });
    }
  });
  
  // Test template routes
  
  // Get all templates
  router.get('/templates', async (req: Request, res: Response) => {
    try {
      const templates = await db.select()
        .from(bounceTestTemplates)
        .where(eq(bounceTestTemplates.isDeleted, false))
        .orderBy(desc(bounceTestTemplates.createdAt));
      
      res.json(templates);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error getting templates:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  });
  
  // Get a template by ID
  router.get('/templates/:id', async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      const [template] = await db.select()
        .from(bounceTestTemplates)
        .where(eq(bounceTestTemplates.id, templateId));
      
      if (!template || template.isDeleted) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error getting template:', error);
      res.status(500).json({ error: 'Failed to get template' });
    }
  });
  
  // Create a new template
  router.post('/templates', async (req: Request, res: Response) => {
    try {
      const templateData = createTemplateSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const [template] = await db.insert(bounceTestTemplates)
        .values(templateData as InsertBounceTestTemplate)
        .returning();
      
      res.status(201).json(template);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error creating template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create template' });
    }
  });
  
  // Update a template
  router.put('/templates/:id', async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      const templateData = updateTemplateSchema.parse(req.body);
      
      const [template] = await db.update(bounceTestTemplates)
        .set(templateData)
        .where(eq(bounceTestTemplates.id, templateId))
        .returning();
      
      res.json(template);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error updating template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update template' });
    }
  });
  
  // Delete a template
  router.delete('/templates/:id', async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      // Soft delete the template
      const [template] = await db.update(bounceTestTemplates)
        .set({ isDeleted: true })
        .where(eq(bounceTestTemplates.id, templateId))
        .returning();
      
      res.json(template);
    } catch (error) {
      console.error('[AdminBounceAutomationRoutes] Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });
  
  // Mount the router
  app.use('/api/admin/bounce', router);
}