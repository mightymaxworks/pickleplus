/**
 * PKL-278651-HEALTH-0003-REPLIT - Replit Health Check Route
 * 
 * This file provides a simple health check endpoint specifically for Replit's deployment service
 * to verify that the application is running properly.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import express, { Request, Response } from 'express';

/**
 * Register Replit-specific health check routes with the Express application
 * @param app Express application
 */
export function registerReplitHealthRoutes(app: express.Express): void {
  // Dedicated health check endpoint for Replit deployment
  app.get('/api/replit-health', (req: Request, res: Response) => {
    // Simple health check for Replit's deployment monitoring
    res.status(200).json({
      status: 'ok',
      message: 'Pickle+ API is running',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '0.9.0'
    });
  });
}
