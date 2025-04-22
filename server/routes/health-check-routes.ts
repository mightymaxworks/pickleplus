/**
 * Simple Health Check Route
 * 
 * @framework Framework5.2
 * @version 1.0.0
 */

import express, { Request, Response } from 'express';

/**
 * Register basic health check route
 * @param app Express application
 */
export function registerHealthCheckRoutes(app: express.Express): void {
  // Basic health check endpoint - quickly verifies the app is responding
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      time: new Date().toISOString()
    });
  });
}