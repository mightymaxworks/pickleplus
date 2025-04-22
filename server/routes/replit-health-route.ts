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
  // Root health check endpoint for Replit
  app.get('/', (req: Request, res: Response) => {
    // Check if request is from browser (has accept header with text/html)
    const isFromBrowser = req.headers.accept?.includes('text/html');
    
    if (isFromBrowser) {
      // Forward to the SPA
      res.sendStatus(200);
    } else {
      // Simple health check for monitoring services
      res.status(200).json({
        status: 'ok',
        message: 'Pickle+ API is running',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.9.0'
      });
    }
  });
}
