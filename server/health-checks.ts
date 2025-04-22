/**
 * PKL-278651-HEALTH-0001-PROD
 * Health Check Endpoints
 * 
 * This module provides health check endpoints for monitoring
 * application health in production.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { Request, Response } from 'express';
import { pool } from './db';
import configService from './config';

/**
 * Basic health check handler that returns application status
 */
export const healthCheck = (req: Request, res: Response) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: configService.getEnvironment(),
    version: '0.9.0', // Current application version
    uptime: process.uptime()
  };
  
  res.status(200).json(status);
};

/**
 * Database connection health check
 */
export const dbStatusCheck = async (req: Request, res: Response) => {
  try {
    // Simple query to check database connectivity
    const result = await pool.query('SELECT NOW() as time');
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      dbTime: result.rows[0].time,
      poolStatus: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Memory usage check
 */
export const memoryCheck = (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    }
  });
};