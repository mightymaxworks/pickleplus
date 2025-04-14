/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * API Routes
 * 
 * This file implements the API routes for the bug reporting system following Framework 5.0 architecture.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { isAuthenticated } from '../../auth'; // Correct path to auth middleware
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import multer from 'multer';
import { feedbackService } from './feedbackService';
import { insertBugReportSchema } from '../../../shared/bug-report-schema'; // Correct path to schema

/**
 * Register feedback routes with the Express application
 */
export function registerFeedbackRoutes(app: express.Express) {
  console.log('[API][PKL-278651-FEED-0001-BUG] Registering feedback routes');
  
  // Set up multer for screenshot uploads
  const uploadDir = './uploads/bug-reports';
  if (!fs.existsSync(uploadDir)) {
    // Create directories recursively
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `screenshot-${uniqueSuffix}${ext}`);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });
  
  // Route for submitting a bug report
  app.post('/api/feedback/bug-report', isAuthenticated, upload.single('screenshot'), async (req: Request, res: Response) => {
    try {
      // Get user id from session
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
        includeUserInfo: includeUserInfo === 'true',
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
  
  // Route for getting bug report statistics
  app.get('/api/feedback/bug-reports/stats', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Only count reports from the current user if not admin
      const userId = req.user?.id;
      
      // Check if user is admin
      const isAdmin = req.user?.isAdmin === true;
      
      const stats = isAdmin 
        ? await feedbackService.getReportCountBySeverity() 
        : (userId ? await feedbackService.getReportCountBySeverity(userId) : []);
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting bug report statistics:', error);
      res.status(500).json({ error: 'Failed to get bug report statistics' });
    }
  });
  
  // Route for user to view their own submitted bug reports
  app.get('/api/feedback/my-reports', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const reports = await feedbackService.listBugReports({ userId });
      
      // Map to response format
      const responseReports = reports.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        severity: report.severity,
        status: report.status,
        currentPage: report.currentPage,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        resolvedAt: report.resolvedAt
      }));
      
      res.status(200).json(responseReports);
    } catch (error) {
      console.error('Error listing user bug reports:', error);
      res.status(500).json({ error: 'Failed to list bug reports' });
    }
  });
  
  console.log('[API][PKL-278651-FEED-0001-BUG] Feedback routes registered successfully');
}