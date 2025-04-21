/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Routes
 * 
 * This file defines API routes for the Bounce automated testing system
 * including scheduled test management and CI/CD integration.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Router } from 'express';
import { bounceSchedulerService } from '../services/bounce-scheduler-service';
import { db } from '../db';
import { testTemplates, scheduledTests, SCHEDULE_FREQUENCY } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Template validation
const templateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  configuration: z.object({
    features: z.array(z.string()),
    params: z.record(z.any()),
    settings: z.record(z.any())
  })
});

// Schedule validation
const scheduleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  templateId: z.number().int().positive(),
  frequency: z.enum([
    SCHEDULE_FREQUENCY.HOURLY,
    SCHEDULE_FREQUENCY.DAILY,
    SCHEDULE_FREQUENCY.WEEKLY,
    SCHEDULE_FREQUENCY.MONTHLY,
    SCHEDULE_FREQUENCY.CUSTOM
  ]),
  cronExpression: z.string().optional(),
  notifyOnCompletion: z.boolean().optional(),
  notifyOnIssue: z.boolean().optional()
});

// Update schedule validation
const updateScheduleSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional().nullable(),
  templateId: z.number().int().positive().optional(),
  frequency: z.enum([
    SCHEDULE_FREQUENCY.HOURLY,
    SCHEDULE_FREQUENCY.DAILY,
    SCHEDULE_FREQUENCY.WEEKLY,
    SCHEDULE_FREQUENCY.MONTHLY,
    SCHEDULE_FREQUENCY.CUSTOM
  ]).optional(),
  cronExpression: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  notifyOnCompletion: z.boolean().optional(),
  notifyOnIssue: z.boolean().optional()
});

/**
 * Templates API Routes
 */

// Get all test templates
router.get(
  '/templates',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const templates = await db.query.testTemplates.findMany({
        with: {
          creator: {
            columns: {
              id: true,
              username: true,
              displayName: true
            }
          }
        },
        orderBy: (fields, { desc }) => [desc(fields.createdAt)]
      });

      return res.json({ templates });
    } catch (error) {
      console.error('[API] Error getting test templates:', error);
      return res.status(500).json({ message: 'Failed to get test templates' });
    }
  }
);

// Get single test template
router.get(
  '/templates/:id',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const templateId = parseInt(id);

      if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }

      const template = await db.query.testTemplates.findFirst({
        where: eq(testTemplates.id, templateId),
        with: {
          creator: {
            columns: {
              id: true,
              username: true,
              displayName: true
            }
          }
        }
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.json({ template });
    } catch (error) {
      console.error('[API] Error getting test template:', error);
      return res.status(500).json({ message: 'Failed to get test template' });
    }
  }
);

// Create test template
router.post(
  '/templates',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  validateRequest(templateSchema),
  async (req, res) => {
    try {
      const { name, description, configuration } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const [template] = await db.insert(testTemplates)
        .values({
          name,
          description: description || null,
          configuration,
          createdBy: userId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return res.status(201).json({ template });
    } catch (error) {
      console.error('[API] Error creating test template:', error);
      return res.status(500).json({ message: 'Failed to create test template' });
    }
  }
);

// Update test template
router.put(
  '/templates/:id',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  validateRequest(templateSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const templateId = parseInt(id);
      const { name, description, configuration } = req.body;

      if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }

      // Check if template exists
      const existingTemplate = await db.query.testTemplates.findFirst({
        where: eq(testTemplates.id, templateId)
      });

      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Update template
      const [updatedTemplate] = await db.update(testTemplates)
        .set({
          name,
          description: description || null,
          configuration,
          updatedAt: new Date()
        })
        .where(eq(testTemplates.id, templateId))
        .returning();

      return res.json({ template: updatedTemplate });
    } catch (error) {
      console.error('[API] Error updating test template:', error);
      return res.status(500).json({ message: 'Failed to update test template' });
    }
  }
);

// Delete test template
router.delete(
  '/templates/:id',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const templateId = parseInt(id);

      if (isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }

      // Check if template exists
      const existingTemplate = await db.query.testTemplates.findFirst({
        where: eq(testTemplates.id, templateId)
      });

      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Check if template is used in any schedules
      const usedInSchedules = await db.query.scheduledTests.findFirst({
        where: eq(scheduledTests.templateId, templateId)
      });

      if (usedInSchedules) {
        return res.status(400).json({ 
          message: 'Cannot delete template that is used in scheduled tests'
        });
      }

      // Delete template
      await db.delete(testTemplates)
        .where(eq(testTemplates.id, templateId));

      return res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('[API] Error deleting test template:', error);
      return res.status(500).json({ message: 'Failed to delete test template' });
    }
  }
);

/**
 * Scheduled Tests API Routes
 */

// Get all scheduled tests
router.get(
  '/schedules',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const { active } = req.query;
      const activeOnly = active === 'true';
      
      const schedules = await bounceSchedulerService.getAllScheduledTests(activeOnly);
      return res.json({ schedules });
    } catch (error) {
      console.error('[API] Error getting scheduled tests:', error);
      return res.status(500).json({ message: 'Failed to get scheduled tests' });
    }
  }
);

// Get single scheduled test
router.get(
  '/schedules/:id',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }

      const schedule = await bounceSchedulerService.getScheduledTest(scheduleId);

      if (!schedule) {
        return res.status(404).json({ message: 'Scheduled test not found' });
      }

      return res.json({ schedule });
    } catch (error) {
      console.error('[API] Error getting scheduled test:', error);
      return res.status(500).json({ message: 'Failed to get scheduled test' });
    }
  }
);

// Create scheduled test
router.post(
  '/schedules',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  validateRequest(scheduleSchema),
  async (req, res) => {
    try {
      const {
        name,
        description,
        templateId,
        frequency,
        cronExpression,
        notifyOnCompletion,
        notifyOnIssue
      } = req.body;
      
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Validate custom cron expression if provided
      if (frequency === SCHEDULE_FREQUENCY.CUSTOM && !cronExpression) {
        return res.status(400).json({
          message: 'Cron expression is required for custom frequency'
        });
      }

      const scheduleId = await bounceSchedulerService.createScheduledTest({
        name,
        description,
        templateId,
        frequency,
        cronExpression,
        createdBy: userId,
        notifyOnCompletion,
        notifyOnIssue
      });

      if (!scheduleId) {
        return res.status(500).json({ message: 'Failed to create scheduled test' });
      }

      const schedule = await bounceSchedulerService.getScheduledTest(scheduleId);
      
      return res.status(201).json({ schedule });
    } catch (error) {
      console.error('[API] Error creating scheduled test:', error);
      return res.status(500).json({ message: 'Failed to create scheduled test' });
    }
  }
);

// Update scheduled test
router.put(
  '/schedules/:id',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  validateRequest(updateScheduleSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }

      // Get existing schedule
      const existingSchedule = await bounceSchedulerService.getScheduledTest(scheduleId);

      if (!existingSchedule) {
        return res.status(404).json({ message: 'Scheduled test not found' });
      }

      // Validate custom cron expression if frequency is being changed to custom
      if (
        req.body.frequency === SCHEDULE_FREQUENCY.CUSTOM &&
        req.body.cronExpression === undefined &&
        existingSchedule.frequency !== SCHEDULE_FREQUENCY.CUSTOM
      ) {
        return res.status(400).json({
          message: 'Cron expression is required for custom frequency'
        });
      }

      // Update schedule
      const success = await bounceSchedulerService.updateScheduledTest(scheduleId, req.body);

      if (!success) {
        return res.status(500).json({ message: 'Failed to update scheduled test' });
      }

      const updatedSchedule = await bounceSchedulerService.getScheduledTest(scheduleId);
      
      return res.json({ schedule: updatedSchedule });
    } catch (error) {
      console.error('[API] Error updating scheduled test:', error);
      return res.status(500).json({ message: 'Failed to update scheduled test' });
    }
  }
);

// Delete scheduled test
router.delete(
  '/schedules/:id',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }

      // Check if schedule exists
      const existingSchedule = await bounceSchedulerService.getScheduledTest(scheduleId);

      if (!existingSchedule) {
        return res.status(404).json({ message: 'Scheduled test not found' });
      }

      // Delete schedule
      const success = await bounceSchedulerService.deleteScheduledTest(scheduleId);

      if (!success) {
        return res.status(500).json({ message: 'Failed to delete scheduled test' });
      }

      return res.json({ message: 'Scheduled test deleted successfully' });
    } catch (error) {
      console.error('[API] Error deleting scheduled test:', error);
      return res.status(500).json({ message: 'Failed to delete scheduled test' });
    }
  }
);

// Run scheduled test immediately
router.post(
  '/schedules/:id/run',
  isAuthenticated,
  isAdmin,
  csrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
      }

      // Check if schedule exists
      const existingSchedule = await bounceSchedulerService.getScheduledTest(scheduleId);

      if (!existingSchedule) {
        return res.status(404).json({ message: 'Scheduled test not found' });
      }

      // Run schedule
      const success = await bounceSchedulerService.runScheduledTest(scheduleId);

      if (!success) {
        return res.status(500).json({ message: 'Failed to run scheduled test' });
      }

      return res.json({ message: 'Scheduled test run initiated successfully' });
    } catch (error) {
      console.error('[API] Error running scheduled test:', error);
      return res.status(500).json({ message: 'Failed to run scheduled test' });
    }
  }
);

export default router;