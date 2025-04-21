/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System API Routes
 * 
 * This file defines the API routes for the Bounce automated testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express, { Request, Response } from 'express';
import { db } from '../../db';
import {
  bounceTestRuns,
  bounceFindings,
  bounceEvidence,
  bounceSchedules,
  bounceInteractions,
  BounceTestRunStatus,
  BounceFindingSeverity,
  BounceFindingStatus,
  BounceInteractionType
} from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../../middleware/auth';

const router = express.Router();

/**
 * GET /api/admin/bounce/test-runs
 * Get all test runs with pagination
 */
router.get('/test-runs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const testRuns = await db.select()
      .from(bounceTestRuns)
      .orderBy(desc(bounceTestRuns.createdAt))
      .limit(limit)
      .offset(offset);
    
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(bounceTestRuns);
    
    const totalCount = countResult[0].count;
    
    res.status(200).json({
      testRuns,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: limit
      }
    });
  } catch (error) {
    console.error('Error getting test runs:', error);
    res.status(500).json({ error: 'Failed to get test runs' });
  }
});

/**
 * GET /api/admin/bounce/test-runs/:id
 * Get a specific test run by ID with its findings
 */
router.get('/test-runs/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const testRunId = parseInt(req.params.id);
    
    const testRun = await db.select()
      .from(bounceTestRuns)
      .where(eq(bounceTestRuns.id, testRunId))
      .limit(1);
    
    if (testRun.length === 0) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    
    const findings = await db.select()
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, testRunId))
      .orderBy(desc(bounceFindings.createdAt));
    
    res.status(200).json({
      testRun: testRun[0],
      findings
    });
  } catch (error) {
    console.error('Error getting test run:', error);
    res.status(500).json({ error: 'Failed to get test run' });
  }
});

/**
 * GET /api/admin/bounce/findings
 * Get all findings with filters and pagination
 */
router.get('/findings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    
    let query = db.select().from(bounceFindings);
    
    // Apply filters
    if (status) {
      query = query.where(eq(bounceFindings.status, status));
    }
    
    if (severity) {
      query = query.where(eq(bounceFindings.severity, severity));
    }
    
    const findings = await query
      .orderBy(desc(bounceFindings.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count with the same filters
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(bounceFindings);
    
    if (status) {
      countQuery = countQuery.where(eq(bounceFindings.status, status));
    }
    
    if (severity) {
      countQuery = countQuery.where(eq(bounceFindings.severity, severity));
    }
    
    const countResult = await countQuery;
    const totalCount = countResult[0].count;
    
    res.status(200).json({
      findings,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: limit
      }
    });
  } catch (error) {
    console.error('Error getting findings:', error);
    res.status(500).json({ error: 'Failed to get findings' });
  }
});

/**
 * GET /api/admin/bounce/findings/:id
 * Get a specific finding by ID with its evidence
 */
router.get('/findings/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const findingId = parseInt(req.params.id);
    
    const finding = await db.select()
      .from(bounceFindings)
      .where(eq(bounceFindings.id, findingId))
      .limit(1);
    
    if (finding.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    const evidence = await db.select()
      .from(bounceEvidence)
      .where(eq(bounceEvidence.findingId, findingId));
    
    res.status(200).json({
      finding: finding[0],
      evidence
    });
  } catch (error) {
    console.error('Error getting finding:', error);
    res.status(500).json({ error: 'Failed to get finding' });
  }
});

/**
 * PATCH /api/admin/bounce/findings/:id
 * Update a finding's status
 */
router.patch('/findings/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const findingId = parseInt(req.params.id);
    const { status, assignedTo } = req.body;
    
    if (!status && !assignedTo) {
      return res.status(400).json({ error: 'No update parameters provided' });
    }
    
    const updateData: any = {};
    
    if (status) {
      // Validate status
      if (!Object.values(BounceFindingStatus).includes(status as BounceFindingStatus)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      updateData.status = status;
      
      // If status is fixed, set fixedAt
      if (status === BounceFindingStatus.FIXED) {
        updateData.fixedAt = new Date();
      }
    }
    
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }
    
    const result = await db.update(bounceFindings)
      .set(updateData)
      .where(eq(bounceFindings.id, findingId))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error updating finding:', error);
    res.status(500).json({ error: 'Failed to update finding' });
  }
});

/**
 * GET /api/admin/bounce/schedules
 * Get all test schedules
 */
router.get('/schedules', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const schedules = await db.select()
      .from(bounceSchedules)
      .orderBy(desc(bounceSchedules.createdAt));
    
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

/**
 * POST /api/admin/bounce/schedules
 * Create a new test schedule
 */
router.post('/schedules', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { name, cronExpression, browsers, testTypes } = req.body;
    
    if (!name || !cronExpression || !browsers || !testTypes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.insert(bounceSchedules)
      .values({
        name,
        cronExpression,
        browsers,
        testTypes,
        isActive: true
      })
      .returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

/**
 * PATCH /api/admin/bounce/schedules/:id
 * Update a test schedule
 */
router.patch('/schedules/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { name, cronExpression, browsers, testTypes, isActive } = req.body;
    
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (cronExpression !== undefined) updateData.cronExpression = cronExpression;
    if (browsers !== undefined) updateData.browsers = browsers;
    if (testTypes !== undefined) updateData.testTypes = testTypes;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update parameters provided' });
    }
    
    const result = await db.update(bounceSchedules)
      .set(updateData)
      .where(eq(bounceSchedules.id, scheduleId))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

/**
 * DELETE /api/admin/bounce/schedules/:id
 * Delete a test schedule
 */
router.delete('/schedules/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const scheduleId = parseInt(req.params.id);
    
    const result = await db.delete(bounceSchedules)
      .where(eq(bounceSchedules.id, scheduleId))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

/**
 * GET /api/admin/bounce/interactions
 * Get gamification interactions with user data
 */
router.get('/interactions', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // This query would typically join with users to get user information
    // Simplified version for demonstration
    const interactions = await db.select()
      .from(bounceInteractions)
      .orderBy(desc(bounceInteractions.createdAt))
      .limit(limit)
      .offset(offset);
    
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(bounceInteractions);
    
    const totalCount = countResult[0].count;
    
    res.status(200).json({
      interactions,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: limit
      }
    });
  } catch (error) {
    console.error('Error getting interactions:', error);
    res.status(500).json({ error: 'Failed to get interactions' });
  }
});

export default router;