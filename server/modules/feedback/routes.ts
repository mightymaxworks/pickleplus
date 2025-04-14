/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * API Routes
 * 
 * This file implements the API routes for the bug reporting system following Framework 5.0 architecture.
 */

import express, { Request, Response } from 'express';
import { feedbackService } from './feedbackService';
import { isAuthenticated } from '../../middleware/auth';
import { isAdmin } from '../../middleware/admin';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { insertBugReportSchema } from '@/shared/bug-report-schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
// Setup file upload configuration for screenshots
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/bug-reports';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bug-report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

/**
 * Register feedback routes with the Express application
 */
export function registerFeedbackRoutes(app: express.Express) {
  console.log('[API][PKL-278651-FEED-0001-BUG] Registering feedback routes...');
  
  // Route for submitting a bug report
  app.post('/api/feedback/bug-report', isAuthenticated, upload.single('screenshot'), async (req: Request, res: Response) => {
    try {
      // Get user ID from authenticated session
      const userId = req.user?.id;
      
      // Extract form data
      const { title, description, severity, currentPage, includeUserInfo } = req.body;
      
      // Store user agent directly
      const browserInfo = req.headers['user-agent'] || 'Unknown';
      
      // Validate the input
      try {
        insertBugReportSchema.parse({
          title,
          description,
          severity,
          currentPage,
          includeUserInfo: includeUserInfo === 'true'
        });
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ error: validationError.message });
        }
        throw error;
      }
      
      // Gather user information if consent was given
      let userInfo = null;
      if (includeUserInfo === 'true' && userId) {
        // Get user info from DB to include with report
        const user = req.user;
        if (user) {
          // Remove sensitive fields
          const { password, ...safeUserData } = user;
          userInfo = JSON.stringify(safeUserData);
        }
      }
      
      // Get screenshot path if uploaded
      const screenshotPath = req.file ? req.file.path : null;
      
      // Get screen size if provided
      const screenSize = req.body.screenSize || null;
      
      // Submit the bug report
      const bugReport = await feedbackService.submitBugReport({
        title,
        description,
        severity: severity as any,
        currentPage,
        userId: userId || null,
        userAgent: req.headers['user-agent'] || null,
        browserInfo,
        screenSize,
        ipAddress: req.ip || null,
        userInfo,
        screenshotPath: screenshotPath || null,
        stepsToReproduce: req.body.stepsToReproduce || null,
        isReproducible: req.body.isReproducible === 'true'
      });
      
      // Return success response
      res.status(201).json({ 
        success: true, 
        message: 'Bug report submitted successfully',
        reportId: bugReport.id
      });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      res.status(500).json({ error: 'Failed to submit bug report' });
    }
  });
  
  // Route for getting a list of bug reports (admin only)
  app.get('/api/admin/bug-reports', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { status, severity, limit, offset } = req.query;
      
      const reports = await feedbackService.listBugReports({
        status: status as any,
        severity: severity as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      
      // Map to response format
      const responseReports = reports.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        severity: report.severity,
        status: report.status,
        currentPage: report.currentPage,
        userId: report.userId,
        screenshotPath: report.screenshotPath,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        resolvedAt: report.resolvedAt,
        assignedTo: report.assignedTo,
        isReproducible: report.isReproducible
      }));
      
      res.status(200).json(responseReports);
    } catch (error) {
      console.error('Error listing bug reports:', error);
      res.status(500).json({ error: 'Failed to list bug reports' });
    }
  });
  
  // Route for getting bug report details (admin only)
  app.get('/api/admin/bug-reports/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.id);
      
      const report = await feedbackService.getBugReportById(reportId);
      
      if (!report) {
        return res.status(404).json({ error: 'Bug report not found' });
      }
      
      res.status(200).json(report);
    } catch (error) {
      console.error(`Error getting bug report ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to get bug report' });
    }
  });
  
  // Route for updating bug report status (admin only)
  app.patch('/api/admin/bug-reports/:id/status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const updatedReport = await feedbackService.updateBugReportStatus(reportId, status, adminNotes);
      
      if (!updatedReport) {
        return res.status(404).json({ error: 'Bug report not found' });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Bug report status updated successfully',
        report: updatedReport
      });
    } catch (error) {
      console.error(`Error updating bug report ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update bug report status' });
    }
  });
  
  // Route for assigning bug report to team member (admin only)
  app.patch('/api/admin/bug-reports/:id/assign', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.id);
      const { assignedTo } = req.body;
      
      const assigneeId = assignedTo ? parseInt(assignedTo) : null;
      
      const updatedReport = await feedbackService.assignBugReport(reportId, assigneeId);
      
      if (!updatedReport) {
        return res.status(404).json({ error: 'Bug report not found' });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Bug report assigned successfully',
        report: updatedReport
      });
    } catch (error) {
      console.error(`Error assigning bug report ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to assign bug report' });
    }
  });
  
  // Route for getting bug report statistics (admin only)
  app.get('/api/admin/bug-reports/stats/severity', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await feedbackService.getReportCountBySeverity();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting bug report statistics:', error);
      res.status(500).json({ error: 'Failed to get bug report statistics' });
    }
  });
  
  // Serve uploaded screenshots (admin only)
  app.get('/api/admin/bug-reports/screenshots/:filename', isAuthenticated, isAdmin, (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join('./uploads/bug-reports', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }
    
    // Serve the file
    res.sendFile(path.resolve(filePath));
  });
  
  console.log('[API][PKL-278651-FEED-0001-BUG] Feedback routes registered successfully');
}