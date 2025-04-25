/**
 * PKL-278651-SAGE-0009-DRILLS - Validation Middleware
 * 
 * This middleware validates request bodies against zod schemas.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validate request body against a zod schema
 */
export function validateWithSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: result.error.format()
        });
      }
      
      // Update request body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Validation failed' });
    }
  };
}