/**
 * PKL-278651-HEALTH-0002-PROD - Health Check Routes
 * 
 * Routes for monitoring application health in production environments.
 * Part of Framework 5.3 enhancements for production deployment.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import express, { Request, Response } from 'express';
import { pool } from '../db';
import os from 'os';

/**
 * Register health check routes with the Express application
 * @param app Express application
 */
export function registerHealthCheckRoutes(app: express.Express): void {
  // Basic health check endpoint - quickly verifies the app is responding
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '0.9.0',
      uptime: process.uptime()
    });
  });

  // Database connection health check
  app.get('/api/health/db', async (req: Request, res: Response) => {
    try {
      // Test database connection with a simple query
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT NOW() as time');
        
        // Get pool stats
        const poolStatus = {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount
        };
        
        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          pool: poolStatus,
          query_time: result.rows[0].time
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'production' ? undefined : error
      });
    }
  });

  // Memory usage health check
  app.get('/api/health/memory', (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      process: {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external),
        arrayBuffers: formatBytes(memoryUsage.arrayBuffers || 0)
      },
      system: {
        total: formatBytes(systemMemory.total),
        free: formatBytes(systemMemory.free),
        used: formatBytes(systemMemory.used),
        percentUsed: Math.round((systemMemory.used / systemMemory.total) * 100)
      }
    });
  });

  // Combined detailed health check for monitoring systems
  app.get('/api/health/detailed', async (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        percentUsed: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
      },
      cpus: os.cpus().length
    };

    let dbStatus = {
      status: 'unknown'
    };

    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT NOW() as time');
        dbStatus = {
          status: 'ok',
          pool: {
            total: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount
          },
          query_time: result.rows[0].time
        };
      } finally {
        client.release();
      }
    } catch (error) {
      dbStatus = {
        status: 'error',
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'production' ? undefined : error
      };
    }

    res.status(dbStatus.status === 'error' ? 500 : 200).json({
      application: {
        status: dbStatus.status === 'error' ? 'degraded' : 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '0.9.0',
        nodeVersion: process.version,
        uptime: process.uptime()
      },
      system: systemInfo,
      memory: {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external)
      },
      database: dbStatus
    });
  });
}

/**
 * Format bytes to a human-readable string
 * @param bytes Number of bytes
 * @returns Formatted string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}