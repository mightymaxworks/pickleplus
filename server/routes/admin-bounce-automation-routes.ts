/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Routes
 * 
 * This file contains the API routes for managing Bounce automated test
 * templates, schedules, and status information.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { isAdmin, isAuthenticated } from '../middleware/admin';
import { 
  bounceTestTemplates, 
  bounceSchedules, 
  bounceTestRuns,
  insertBounceTestTemplateSchema,
  insertBounceScheduleSchema,
  insertBounceTestRunSchema,
  TEST_RUN_STATUS
} from '../../shared/schema/bounce-automation';
import { getBounceSchedulerService } from '../services/bounce-scheduler-service';
import { eq, desc, and, asc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Create bounce test template
router.post('/templates', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = insertBounceTestTemplateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid template data', 
        details: validation.error.format() 
      });
    }
    
    const templateData = validation.data;
    
    // Add createdBy from session
    templateData.createdBy = req.session.userId!;
    
    // Insert template
    const [template] = await db.insert(bounceTestTemplates)
      .values(templateData)
      .returning();
    
    return res.status(201).json(template);
  } catch (error) {
    console.error('Error creating bounce test template:', error);
    return res.status(500).json({ error: 'Failed to create template' });
  }
});

// Get all bounce test templates
router.get('/templates', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const templates = await db.select()
      .from(bounceTestTemplates)
      .where(eq(bounceTestTemplates.isDeleted, false))
      .orderBy(desc(bounceTestTemplates.createdAt));
    
    return res.json(templates);
  } catch (error) {
    console.error('Error getting bounce test templates:', error);
    return res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Get a specific bounce test template
router.get('/templates/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    const [template] = await db.select()
      .from(bounceTestTemplates)
      .where(
        and(
          eq(bounceTestTemplates.id, id),
          eq(bounceTestTemplates.isDeleted, false)
        )
      );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    return res.json(template);
  } catch (error) {
    console.error('Error getting bounce test template:', error);
    return res.status(500).json({ error: 'Failed to get template' });
  }
});

// Update a bounce test template
router.put('/templates/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    // Validate request body
    const updateSchema = insertBounceTestTemplateSchema.extend({
      id: z.number().optional(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
      isDeleted: z.boolean().optional()
    });
    
    const validation = updateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid template data', 
        details: validation.error.format() 
      });
    }
    
    // Check if template exists
    const [existingTemplate] = await db.select()
      .from(bounceTestTemplates)
      .where(
        and(
          eq(bounceTestTemplates.id, id),
          eq(bounceTestTemplates.isDeleted, false)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Update template
    const updateData = {
      ...validation.data,
      updatedAt: new Date()
    };
    
    // Remove immutable fields
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.isDeleted;
    
    const [updatedTemplate] = await db.update(bounceTestTemplates)
      .set(updateData)
      .where(eq(bounceTestTemplates.id, id))
      .returning();
    
    return res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating bounce test template:', error);
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete a bounce test template (soft delete)
router.delete('/templates/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    // Check if template exists
    const [existingTemplate] = await db.select()
      .from(bounceTestTemplates)
      .where(
        and(
          eq(bounceTestTemplates.id, id),
          eq(bounceTestTemplates.isDeleted, false)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Soft delete template
    await db.update(bounceTestTemplates)
      .set({ 
        isDeleted: true,
        updatedAt: new Date()
      })
      .where(eq(bounceTestTemplates.id, id));
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bounce test template:', error);
    return res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Create bounce schedule
router.post('/schedules', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = insertBounceScheduleSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid schedule data', 
        details: validation.error.format() 
      });
    }
    
    const scheduleData = validation.data;
    
    // Add createdBy from session
    scheduleData.createdBy = req.session.userId!;
    
    // If templateId is provided, check if template exists
    if (scheduleData.templateId) {
      const [template] = await db.select()
        .from(bounceTestTemplates)
        .where(
          and(
            eq(bounceTestTemplates.id, scheduleData.templateId),
            eq(bounceTestTemplates.isDeleted, false)
          )
        );
      
      if (!template) {
        return res.status(400).json({ error: 'Template not found' });
      }
    }
    
    // Insert schedule
    const [schedule] = await db.insert(bounceSchedules)
      .values(scheduleData)
      .returning();
    
    // Schedule the test
    if (schedule.isActive) {
      try {
        const schedulerService = getBounceSchedulerService();
        await schedulerService.scheduleTest(schedule);
      } catch (error) {
        console.error('Error scheduling test:', error);
      }
    }
    
    return res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Get all bounce schedules
router.get('/schedules', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Join with templates to get template name
    const schedules = await db.select({
      ...bounceSchedules,
      templateName: bounceTestTemplates.name
    })
    .from(bounceSchedules)
    .leftJoin(
      bounceTestTemplates,
      eq(bounceSchedules.templateId, bounceTestTemplates.id)
    )
    .orderBy(desc(bounceSchedules.createdAt));
    
    return res.json(schedules);
  } catch (error) {
    console.error('Error getting bounce schedules:', error);
    return res.status(500).json({ error: 'Failed to get schedules' });
  }
});

// Get a specific bounce schedule
router.get('/schedules/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    const [schedule] = await db.select({
      ...bounceSchedules,
      templateName: bounceTestTemplates.name
    })
    .from(bounceSchedules)
    .leftJoin(
      bounceTestTemplates,
      eq(bounceSchedules.templateId, bounceTestTemplates.id)
    )
    .where(eq(bounceSchedules.id, id));
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    return res.json(schedule);
  } catch (error) {
    console.error('Error getting bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Update a bounce schedule
router.put('/schedules/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    // Validate request body
    const updateSchema = insertBounceScheduleSchema.extend({
      id: z.number().optional(),
      lastRunTime: z.date().optional(),
      nextRunTime: z.date().optional(),
      lastError: z.string().optional(),
      lastErrorTime: z.date().optional(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional()
    });
    
    const validation = updateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid schedule data', 
        details: validation.error.format() 
      });
    }
    
    // Check if schedule exists
    const [existingSchedule] = await db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.id, id));
    
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // If templateId is provided, check if template exists
    if (validation.data.templateId) {
      const [template] = await db.select()
        .from(bounceTestTemplates)
        .where(
          and(
            eq(bounceTestTemplates.id, validation.data.templateId),
            eq(bounceTestTemplates.isDeleted, false)
          )
        );
      
      if (!template) {
        return res.status(400).json({ error: 'Template not found' });
      }
    }
    
    // Update schedule
    const updateData = {
      ...validation.data,
      updatedAt: new Date()
    };
    
    // Remove immutable fields
    delete updateData.id;
    delete updateData.lastRunTime;
    delete updateData.nextRunTime;
    delete updateData.lastError;
    delete updateData.lastErrorTime;
    delete updateData.createdAt;
    
    const [updatedSchedule] = await db.update(bounceSchedules)
      .set(updateData)
      .where(eq(bounceSchedules.id, id))
      .returning();
    
    // Update the scheduler if active state or schedule changed
    const activeStateChanged = existingSchedule.isActive !== updatedSchedule.isActive;
    const scheduleChanged = 
      existingSchedule.frequency !== updatedSchedule.frequency ||
      existingSchedule.customCronExpression !== updatedSchedule.customCronExpression;
    
    if (activeStateChanged || scheduleChanged) {
      const schedulerService = getBounceSchedulerService();
      
      if (updatedSchedule.isActive) {
        // Schedule or reschedule the test
        await schedulerService.scheduleTest(updatedSchedule);
      } else {
        // Remove the schedule
        await schedulerService.removeSchedule(updatedSchedule.id);
      }
    }
    
    return res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete a bounce schedule
router.delete('/schedules/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    // Check if schedule exists
    const [existingSchedule] = await db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.id, id));
    
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Remove the schedule from the scheduler
    const schedulerService = getBounceSchedulerService();
    await schedulerService.removeSchedule(id);
    
    // Delete the schedule
    await db.delete(bounceSchedules)
      .where(eq(bounceSchedules.id, id));
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Trigger a bounce schedule to run immediately
router.post('/schedules/:id/trigger', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    // Check if schedule exists
    const [schedule] = await db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.id, id));
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Trigger the schedule
    const schedulerService = getBounceSchedulerService();
    const testRun = await schedulerService.runScheduleNow(schedule);
    
    return res.json(testRun);
  } catch (error) {
    console.error('Error triggering bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to trigger schedule' });
  }
});

// Pause a bounce schedule
router.post('/schedules/:id/pause', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    // Check if schedule exists
    const [schedule] = await db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.id, id));
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Remove the schedule from the scheduler
    const schedulerService = getBounceSchedulerService();
    await schedulerService.removeSchedule(id);
    
    // Update the schedule
    const [updatedSchedule] = await db.update(bounceSchedules)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(bounceSchedules.id, id))
      .returning();
    
    return res.json(updatedSchedule);
  } catch (error) {
    console.error('Error pausing bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to pause schedule' });
  }
});

// Resume a bounce schedule
router.post('/schedules/:id/resume', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    // Check if schedule exists
    const [schedule] = await db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.id, id));
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Update the schedule
    const [updatedSchedule] = await db.update(bounceSchedules)
      .set({
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(bounceSchedules.id, id))
      .returning();
    
    // Schedule the test
    const schedulerService = getBounceSchedulerService();
    await schedulerService.scheduleTest(updatedSchedule);
    
    return res.json(updatedSchedule);
  } catch (error) {
    console.error('Error resuming bounce schedule:', error);
    return res.status(500).json({ error: 'Failed to resume schedule' });
  }
});

// Get test runs for a schedule
router.get('/schedules/:id/runs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid schedule ID' });
    }
    
    // Get test runs for the schedule
    const runs = await db.select()
      .from(bounceTestRuns)
      .where(eq(bounceTestRuns.scheduleId, id))
      .orderBy(desc(bounceTestRuns.startedAt));
    
    return res.json(runs);
  } catch (error) {
    console.error('Error getting test runs for schedule:', error);
    return res.status(500).json({ error: 'Failed to get test runs' });
  }
});

// Get all test runs
router.get('/runs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const runs = await db.select({
      ...bounceTestRuns,
      templateName: bounceTestTemplates.name,
      scheduleName: bounceSchedules.name
    })
    .from(bounceTestRuns)
    .leftJoin(
      bounceTestTemplates,
      eq(bounceTestRuns.templateId, bounceTestTemplates.id)
    )
    .leftJoin(
      bounceSchedules,
      eq(bounceTestRuns.scheduleId, bounceSchedules.id)
    )
    .orderBy(desc(bounceTestRuns.startedAt))
    .limit(limit)
    .offset(offset);
    
    return res.json(runs);
  } catch (error) {
    console.error('Error getting test runs:', error);
    return res.status(500).json({ error: 'Failed to get test runs' });
  }
});

// Get automation status information
router.get('/automation/status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Get the scheduler service
    const schedulerService = getBounceSchedulerService();
    
    // Get active schedules
    const activeSchedules = await db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.isActive, true));
    
    // Get next scheduled runs
    const nextRuns = await db.select({
      ...bounceSchedules,
      templateName: bounceTestTemplates.name
    })
    .from(bounceSchedules)
    .leftJoin(
      bounceTestTemplates,
      eq(bounceSchedules.templateId, bounceTestTemplates.id)
    )
    .where(
      and(
        eq(bounceSchedules.isActive, true),
        bounceSchedules.nextRunTime.isNotNull()
      )
    )
    .orderBy(asc(bounceSchedules.nextRunTime))
    .limit(5);
    
    // Get recent test runs
    const recentRuns = await db.select({
      ...bounceTestRuns,
      templateName: bounceTestTemplates.name,
      scheduleName: bounceSchedules.name
    })
    .from(bounceTestRuns)
    .leftJoin(
      bounceTestTemplates,
      eq(bounceTestRuns.templateId, bounceTestTemplates.id)
    )
    .leftJoin(
      bounceSchedules,
      eq(bounceTestRuns.scheduleId, bounceSchedules.id)
    )
    .orderBy(desc(bounceTestRuns.startedAt))
    .limit(10);
    
    // Compile status information
    const status = {
      activeSchedules: activeSchedules.length,
      scheduledTasks: schedulerService.getScheduleCount(),
      nextRuns,
      recentRuns,
      // Other potentially useful status info
      currentTime: new Date(),
      systemStatus: 'healthy'
    };
    
    return res.json(status);
  } catch (error) {
    console.error('Error getting automation status:', error);
    return res.status(500).json({ error: 'Failed to get automation status' });
  }
});

/**
 * Register all Bounce automation routes with the Express app
 * @param app Express application
 */
export function registerBounceAutomationRoutes(app: express.Express): void {
  app.use('/api/admin/bounce/automation', router);
}

export default router;