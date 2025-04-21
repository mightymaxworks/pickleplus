/**
 * PKL-278651-SEC-0003-CSRF - Security Routes
 * 
 * This file defines security-related routes for the application,
 * including CSRF token generation.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express, { Request, Response } from 'express';
import { generateCsrfToken } from '../middleware/csrf';

// Create a router
const router = express.Router();

/**
 * Get a CSRF token for the current session
 * GET /api/security/csrf-token
 */
router.get('/csrf-token', (req: Request, res: Response) => {
  // Make sure we have a session
  if (!req.session?.id) {
    return res.status(400).json({ error: 'No session found' });
  }
  
  // Generate a CSRF token for this session
  const token = generateCsrfToken(req.session.id);
  
  // Return the token to the client
  res.json({ token });
});

export default router;