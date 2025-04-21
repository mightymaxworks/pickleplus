/**
 * PKL-278651-SEC-0004-VAL - Request Validation Middleware
 * 
 * This middleware handles request validation using Zod schemas.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware factory for validating request body against a Zod schema
 * @param schema Zod schema to validate against
 * @returns Express middleware
 */
export function validateRequest(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and transform the request body
      const validated = schema.parse(req.body);
      
      // Replace the request body with the validated result
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Return validation errors in a standardized format
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Handle other errors
      console.error('[Validation] Unexpected error:', error);
      return res.status(500).json({ message: 'Internal server error during validation' });
    }
  };
}