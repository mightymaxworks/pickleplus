/**
 * PKL-278651-BOUNCE-0005-AUTO-ROUTES - Bounce Automation API Routes
 * 
 * API routes for managing automated Bounce test schedules, templates,
 * and executions.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express, { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { isAdmin, isAuthenticated } from '../auth';
import { getEventBus } from '../core/events/server-event-bus';

const router = express.Router();

// Require authentication and admin for all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Get database status and schema
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Check if required tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'bounce_%'
      ORDER BY table_name;
    `);
    
    // Get column info for bounce_achievements
    const achievementsColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'bounce_achievements'
      ORDER BY ordinal_position;
    `);
    
    // Get count of templates
    const templateCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM bounce_test_templates;
    `);
    
    // Get count of schedules
    const scheduleCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM bounce_schedules;
    `);
    
    // Get count of test runs
    const runCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM bounce_test_runs;
    `);
    
    // Get count of findings
    const findingCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM bounce_findings;
    `);
    
    // Get count of achievements
    const achievementCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM bounce_achievements;
    `);
    
    return res.status(200).json({
      status: 'success',
      tables: tables.rows,
      achievementsColumns: achievementsColumns.rows,
      stats: {
        templates: parseInt(templateCount.rows[0].count, 10),
        schedules: parseInt(scheduleCount.rows[0].count, 10),
        runs: parseInt(runCount.rows[0].count, 10),
        findings: parseInt(findingCount.rows[0].count, 10),
        achievements: parseInt(achievementCount.rows[0].count, 10)
      }
    });
  } catch (error) {
    console.error('Error getting Bounce system status:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to get system status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Templates API ===

// Get all templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await db.execute(sql`
      SELECT * FROM bounce_test_templates 
      WHERE is_deleted = false
      ORDER BY created_at DESC;
    `);
    
    return res.status(200).json(templates.rows);
  } catch (error) {
    console.error('Error fetching bounce templates:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch templates',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a template
router.post('/templates', async (req: Request, res: Response) => {
  try {
    const { name, description, configuration } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const result = await db.execute(sql`
      INSERT INTO bounce_test_templates (
        name, 
        description, 
        configuration, 
        created_by, 
        created_at
      ) 
      VALUES (
        ${name}, 
        ${description || null}, 
        ${JSON.stringify(configuration || {})}, 
        ${req.user?.id || null},
        NOW()
      )
      RETURNING *;
    `);
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bounce template:', error);
    return res.status(500).json({ 
      message: 'Failed to create template',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get template by ID
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await db.execute(sql`
      SELECT * FROM bounce_test_templates 
      WHERE id = ${parseInt(id, 10)} AND is_deleted = false;
    `);
    
    if (template.rows.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    return res.status(200).json(template.rows[0]);
  } catch (error) {
    console.error('Error fetching bounce template:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch template',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update template
router.put('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, configuration } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const result = await db.execute(sql`
      UPDATE bounce_test_templates
      SET 
        name = ${name},
        description = ${description || null},
        configuration = ${JSON.stringify(configuration || {})},
        updated_at = NOW()
      WHERE id = ${parseInt(id, 10)} AND is_deleted = false
      RETURNING *;
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bounce template:', error);
    return res.status(500).json({ 
      message: 'Failed to update template',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete template (soft delete)
router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      UPDATE bounce_test_templates
      SET is_deleted = true, updated_at = NOW()
      WHERE id = ${parseInt(id, 10)} AND is_deleted = false
      RETURNING id;
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    return res.status(200).json({ 
      message: 'Template deleted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error deleting bounce template:', error);
    return res.status(500).json({ 
      message: 'Failed to delete template',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Schedules API ===

// Get all schedules
router.get('/schedules', async (req: Request, res: Response) => {
  try {
    const schedules = await db.execute(sql`
      SELECT s.*, t.name as template_name
      FROM bounce_schedules s
      LEFT JOIN bounce_test_templates t ON s.template_id = t.id
      ORDER BY s.next_run_time ASC;
    `);
    
    return res.status(200).json(schedules.rows);
  } catch (error) {
    console.error('Error fetching bounce schedules:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch schedules',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a schedule
router.post('/schedules', async (req: Request, res: Response) => {
  try {
    const { name, description, frequency, customCronExpression, templateId, configuration, isActive } = req.body;
    
    // Validate required fields
    if (!name || !frequency) {
      return res.status(400).json({ message: 'Name and frequency are required' });
    }
    
    // Calculate next run time based on frequency
    // This is a simplified version - in a real implementation this would be more sophisticated
    let nextRunTime = new Date();
    switch (frequency) {
      case 'HOURLY':
        nextRunTime.setHours(nextRunTime.getHours() + 1);
        break;
      case 'DAILY':
        nextRunTime.setDate(nextRunTime.getDate() + 1);
        break;
      case 'WEEKLY':
        nextRunTime.setDate(nextRunTime.getDate() + 7);
        break;
      case 'MONTHLY':
        nextRunTime.setMonth(nextRunTime.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextRunTime.setMonth(nextRunTime.getMonth() + 3);
        break;
      default:
        // For custom, just set to 1 day from now as placeholder
        nextRunTime.setDate(nextRunTime.getDate() + 1);
    }
    
    const result = await db.execute(sql`
      INSERT INTO bounce_schedules (
        name, 
        description, 
        frequency, 
        custom_cron_expression,
        template_id,
        configuration, 
        is_active,
        created_by, 
        next_run_time,
        created_at
      ) 
      VALUES (
        ${name}, 
        ${description || null}, 
        ${frequency}, 
        ${customCronExpression || null},
        ${templateId || null},
        ${JSON.stringify(configuration || {})}, 
        ${isActive === false ? false : true},
        ${req.user?.id || null},
        ${nextRunTime},
        NOW()
      )
      RETURNING *;
    `);
    
    // Notify event bus of new schedule
    const eventBus = getEventBus();
    eventBus.emit('bounce:schedule:created', result.rows[0]);
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to create schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get schedule by ID
router.get('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const schedule = await db.execute(sql`
      SELECT s.*, t.name as template_name
      FROM bounce_schedules s
      LEFT JOIN bounce_test_templates t ON s.template_id = t.id
      WHERE s.id = ${parseInt(id, 10)};
    `);
    
    if (schedule.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    return res.status(200).json(schedule.rows[0]);
  } catch (error) {
    console.error('Error fetching bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update schedule
router.put('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, frequency, customCronExpression, templateId, configuration, isActive } = req.body;
    
    // Validate required fields
    if (!name || !frequency) {
      return res.status(400).json({ message: 'Name and frequency are required' });
    }
    
    const result = await db.execute(sql`
      UPDATE bounce_schedules
      SET 
        name = ${name},
        description = ${description || null},
        frequency = ${frequency},
        custom_cron_expression = ${customCronExpression || null},
        template_id = ${templateId || null},
        configuration = ${JSON.stringify(configuration || {})},
        is_active = ${isActive === false ? false : true},
        updated_at = NOW()
      WHERE id = ${parseInt(id, 10)}
      RETURNING *;
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    // Notify event bus of updated schedule
    const eventBus = getEventBus();
    eventBus.emit('bounce:schedule:updated', result.rows[0]);
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to update schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete schedule
router.delete('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      DELETE FROM bounce_schedules
      WHERE id = ${parseInt(id, 10)}
      RETURNING id;
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    // Notify event bus of deleted schedule
    const eventBus = getEventBus();
    eventBus.emit('bounce:schedule:deleted', { id: parseInt(id, 10) });
    
    return res.status(200).json({ 
      message: 'Schedule deleted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error deleting bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to delete schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Trigger a schedule manually
router.post('/schedules/:id/trigger', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First, check if the schedule exists
    const scheduleResult = await db.execute(sql`
      SELECT s.*, t.name as template_name, t.configuration as template_configuration
      FROM bounce_schedules s
      LEFT JOIN bounce_test_templates t ON s.template_id = t.id
      WHERE s.id = ${parseInt(id, 10)};
    `);
    
    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const schedule = scheduleResult.rows[0];
    
    // Create a test run based on this schedule
    const testRunResult = await db.execute(sql`
      INSERT INTO bounce_test_runs (
        name,
        schedule_id,
        template_id,
        configuration,
        status,
        start_time
      )
      VALUES (
        ${`Manual run of ${schedule.name}`},
        ${schedule.id},
        ${schedule.template_id},
        ${JSON.stringify({
          ...schedule.template_configuration,
          ...schedule.configuration,
          triggered_by: req.user?.id,
          manual_trigger: true
        })},
        'PENDING',
        NOW()
      )
      RETURNING *;
    `);
    
    const testRun = testRunResult.rows[0];
    
    // Update schedule last_run_time
    await db.execute(sql`
      UPDATE bounce_schedules
      SET last_run_time = NOW()
      WHERE id = ${parseInt(id, 10)};
    `);
    
    // Trigger the run via the event bus
    const eventBus = getEventBus();
    eventBus.emit('bounce:testrun:triggered', testRun);
    
    return res.status(200).json({ 
      message: 'Test run triggered successfully',
      testRun
    });
  } catch (error) {
    console.error('Error triggering bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to trigger schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Pause a schedule
router.post('/schedules/:id/pause', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(sql`
      UPDATE bounce_schedules
      SET 
        is_active = false,
        updated_at = NOW()
      WHERE id = ${parseInt(id, 10)}
      RETURNING *;
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    // Notify event bus
    const eventBus = getEventBus();
    eventBus.emit('bounce:schedule:paused', result.rows[0]);
    
    return res.status(200).json({ 
      message: 'Schedule paused successfully',
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Error pausing bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to pause schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Resume a schedule
router.post('/schedules/:id/resume', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Calculate next run time based on frequency
    const scheduleResult = await db.execute(sql`
      SELECT * FROM bounce_schedules WHERE id = ${parseInt(id, 10)};
    `);
    
    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const schedule = scheduleResult.rows[0];
    let nextRunTime = new Date();
    
    switch (schedule.frequency) {
      case 'HOURLY':
        nextRunTime.setHours(nextRunTime.getHours() + 1);
        break;
      case 'DAILY':
        nextRunTime.setDate(nextRunTime.getDate() + 1);
        break;
      case 'WEEKLY':
        nextRunTime.setDate(nextRunTime.getDate() + 7);
        break;
      case 'MONTHLY':
        nextRunTime.setMonth(nextRunTime.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextRunTime.setMonth(nextRunTime.getMonth() + 3);
        break;
      default:
        // For custom, just set to 1 day from now as placeholder
        nextRunTime.setDate(nextRunTime.getDate() + 1);
    }
    
    const result = await db.execute(sql`
      UPDATE bounce_schedules
      SET 
        is_active = true,
        next_run_time = ${nextRunTime},
        updated_at = NOW()
      WHERE id = ${parseInt(id, 10)}
      RETURNING *;
    `);
    
    // Notify event bus
    const eventBus = getEventBus();
    eventBus.emit('bounce:schedule:resumed', result.rows[0]);
    
    return res.status(200).json({ 
      message: 'Schedule resumed successfully',
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Error resuming bounce schedule:', error);
    return res.status(500).json({ 
      message: 'Failed to resume schedule',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Test Runs API ===

// Get all test runs
router.get('/runs', async (req: Request, res: Response) => {
  try {
    const runs = await db.execute(sql`
      SELECT r.*, 
             s.name as schedule_name, 
             t.name as template_name
      FROM bounce_test_runs r
      LEFT JOIN bounce_schedules s ON r.schedule_id = s.id
      LEFT JOIN bounce_test_templates t ON r.template_id = t.id
      ORDER BY r.start_time DESC
      LIMIT 50;
    `);
    
    return res.status(200).json(runs.rows);
  } catch (error) {
    console.error('Error fetching bounce test runs:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch test runs',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get test run by ID
router.get('/runs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const runResult = await db.execute(sql`
      SELECT r.*, 
             s.name as schedule_name, 
             t.name as template_name
      FROM bounce_test_runs r
      LEFT JOIN bounce_schedules s ON r.schedule_id = s.id
      LEFT JOIN bounce_test_templates t ON r.template_id = t.id
      WHERE r.id = ${parseInt(id, 10)};
    `);
    
    if (runResult.rows.length === 0) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    const run = runResult.rows[0];
    
    // Also fetch findings for this test run
    const findingsResult = await db.execute(sql`
      SELECT * FROM bounce_findings
      WHERE test_run_id = ${parseInt(id, 10)}
      ORDER BY created_at DESC;
    `);
    
    return res.status(200).json({
      ...run,
      findings: findingsResult.rows
    });
  } catch (error) {
    console.error('Error fetching bounce test run:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch test run',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Register Bounce automation-related routes with the Express app
 * @param app Express application
 */
export function registerBounceAutomationRoutes(app: express.Express): void {
  console.log('[API] Registering Bounce Automation API routes');
  app.use('/api/admin/bounce', router);
  console.log('[API] Bounce Automation API routes registered successfully');
}

export default router;