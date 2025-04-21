/**
 * PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System
 * Admin routes for the Bounce testing system
 */
import express, { Request, Response } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import * as bounceApi from '../api/bounce';

/**
 * Register Bounce admin routes with the Express application
 * @param app Express application
 */
export function registerBounceAdminRoutes(app: express.Express): void {
  console.log("[API] Registering Bounce Admin API routes");
  
  // Get test runs
  app.get('/api/admin/bounce/test-runs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const result = await bounceApi.getTestRuns(limit, offset);
    res.status(result.success ? 200 : 500).json(result);
  });

  // Get findings with filtering
  app.get('/api/admin/bounce/findings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // Extract query parameters
    const testRunId = req.query.testRunId ? parseInt(req.query.testRunId as string) : undefined;
    const severity = req.query.severity as any;
    const status = req.query.status as any;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const result = await bounceApi.getFindings({
      testRunId,
      severity,
      status,
      limit,
      offset
    });
    
    res.status(result.success ? 200 : 500).json(result);
  });

  // Get specific finding and its evidence
  app.get('/api/admin/bounce/findings/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // Safely parse the ID and validate it's a valid number
    const idParam = req.params.id;
    const findingId = parseInt(idParam);
    
    // Check if the parsed ID is valid
    if (isNaN(findingId) || findingId <= 0) {
      console.error(`Invalid finding ID requested: ${idParam}`);
      return res.status(400).json({ success: false, error: 'Invalid finding ID' });
    }
    
    // Get the finding details
    const findingResult = await bounceApi.getFindingById(findingId);
    if (!findingResult.success) {
      return res.status(404).json({ success: false, error: 'Finding not found' });
    }
    
    // Get evidence for the finding
    const evidenceResult = await bounceApi.getEvidenceForFinding(findingId);
    
    res.status(200).json({ 
      success: true,
      finding: findingResult.finding,
      evidence: evidenceResult.success ? evidenceResult.evidence : []
    });
  });

  // Update finding status
  app.patch('/api/admin/bounce/findings/:id/status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const findingId = parseInt(idParam);
    
    // Check if the parsed ID is valid
    if (isNaN(findingId) || findingId <= 0) {
      console.error(`Invalid finding ID for status update: ${idParam}`);
      return res.status(400).json({ success: false, error: 'Invalid finding ID' });
    }
    
    const { status, assignedToUserId } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    
    const result = await bounceApi.updateFindingStatus(findingId, status, assignedToUserId);
    res.status(result.success ? 200 : 404).json(result);
  });

  // Create a new test run
  app.post('/api/admin/bounce/test-runs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // Validate required fields
    const { name, targetUrl, testConfig } = req.body;
    
    if (!name || !targetUrl || !testConfig) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, targetUrl, or testConfig' 
      });
    }
    
    // Create the test run
    const result = await bounceApi.createTestRun({
      ...req.body,
      userId: req.user!.id
    });
    
    res.status(result.success ? 201 : 500).json(result);
  });

  // Get statistics
  app.get('/api/admin/bounce/statistics', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const result = await bounceApi.getSystemStatistics();
    res.status(result.success ? 200 : 500).json(result);
  });
  
  // Add evidence to a finding
  app.post('/api/admin/bounce/findings/:id/evidence', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const findingId = parseInt(idParam);
    
    // Check if the parsed ID is valid
    if (isNaN(findingId) || findingId <= 0) {
      console.error(`Invalid finding ID for evidence upload: ${idParam}`);
      return res.status(400).json({ success: false, error: 'Invalid finding ID' });
    }
    
    const { type, content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    const result = await bounceApi.createEvidence({
      findingId,
      type,
      content,
      metadata
    });
    
    res.status(result.success ? 201 : 500).json(result);
  });
  
  // Record a user interaction with a finding
  app.post('/api/admin/bounce/interactions', isAuthenticated, async (req: Request, res: Response) => {
    const { findingId, type, points, metadata } = req.body;
    
    if (!findingId || !type) {
      return res.status(400).json({ success: false, error: 'FindingId and type are required' });
    }
    
    // Check if the findingId is valid
    const findingIdNum = parseInt(findingId);
    if (isNaN(findingIdNum) || findingIdNum <= 0) {
      console.error(`Invalid finding ID for interaction: ${findingId}`);
      return res.status(400).json({ success: false, error: 'Invalid finding ID' });
    }
    
    const result = await bounceApi.recordUserInteraction({
      userId: req.user!.id,
      findingId: findingIdNum,
      type,
      points,
      metadata
    });
    
    res.status(result.success ? 201 : 500).json(result);
  });
  
  // Get test schedules - temporarily just returning an empty array
  app.get('/api/admin/bounce/schedules', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // In the future, we can implement a getSchedules method in the bounceApi
    res.status(200).json({ 
      success: true, 
      schedules: [] 
    });
  });
  
  // Create a test schedule
  app.post('/api/admin/bounce/schedules', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { name, cronExpression, testConfig } = req.body;
    
    if (!name || !testConfig) {
      return res.status(400).json({ success: false, error: 'Name and testConfig are required' });
    }
    
    const result = await bounceApi.createTestSchedule(req.body);
    res.status(result.success ? 201 : 500).json(result);
  });
  
  console.log("[API] Bounce Admin API routes registered successfully");
}