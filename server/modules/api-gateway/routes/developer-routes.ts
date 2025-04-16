/**
 * PKL-278651-API-0001-GATEWAY
 * Developer Portal Routes
 * 
 * Routes for developer registration and application management.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db';
import { apiDeveloperAccounts, apiApplications, insertApiDeveloperAccountSchema, insertApiApplicationSchema } from '../../../../shared/schema/api-gateway';
import { users } from '../../../../shared/schema';
import { isAuthenticated } from '../../../auth';

const router = Router();

// Extend the developer account schema for validation
const createDeveloperAccountSchema = insertApiDeveloperAccountSchema.extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions.'
  })
});

// Extend the application schema for validation
const createApplicationSchema = insertApiApplicationSchema.extend({
  name: z.string().min(3, 'Application name must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a more detailed description')
});

/**
 * Register as a developer
 * POST /api/developer/register
 */
router.post('/register', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createDeveloperAccountSchema.parse(req.body);
    
    // Check if user already has a developer account
    const existingAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (existingAccount.length > 0) {
      return res.status(409).json({
        error: 'developer_exists',
        message: 'You already have a developer account'
      });
    }
    
    // Create developer account
    const [developerAccount] = await db.insert(apiDeveloperAccounts)
      .values({
        userId: req.user!.id,
        companyName: validatedData.companyName,
        website: validatedData.website,
        developerBio: validatedData.developerBio,
        termsAccepted: validatedData.termsAccepted,
        termsAcceptedDate: validatedData.termsAccepted ? new Date() : undefined,
        developerTier: 'free', // Default tier
        isTestAccount: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Create an initial application
    await db.insert(apiApplications)
      .values({
        developerId: developerAccount.id,
        name: 'Default Application',
        description: 'Default application created automatically',
        status: 'approved', // Auto-approve first application
        appType: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    
    // Log the developer registration
    console.log(`User ${req.user!.id} registered as a developer`);
    
    res.status(201).json({
      message: 'Developer account created successfully',
      data: {
        id: developerAccount.id,
        tier: developerAccount.developerTier,
        isApproved: developerAccount.isApproved
      }
    });
  } catch (error) {
    console.error('Error registering developer:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to register developer account' 
    });
  }
});

/**
 * Get current developer profile
 * GET /api/developer/profile
 */
router.get('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get developer account for current user
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    res.json({
      data: developerAccount[0]
    });
  } catch (error) {
    console.error('Error getting developer profile:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve developer profile' 
    });
  }
});

/**
 * Update developer profile
 * PATCH /api/developer/profile
 */
router.patch('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get developer account for current user
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Validate request body (partial)
    const updateSchema = insertApiDeveloperAccountSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    // Update developer account
    const [updatedAccount] = await db.update(apiDeveloperAccounts)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(apiDeveloperAccounts.id, developerAccount[0].id))
      .returning();
    
    res.json({
      message: 'Developer profile updated successfully',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error updating developer profile:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to update developer profile' 
    });
  }
});

/**
 * Create a new application
 * POST /api/developer/applications
 */
router.post('/applications', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get developer account for current user
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Validate request body
    const validatedData = createApplicationSchema.parse(req.body);
    
    // Create application
    const [application] = await db.insert(apiApplications)
      .values({
        developerId: developerAccount[0].id,
        name: validatedData.name,
        description: validatedData.description,
        applicationUrl: validatedData.applicationUrl,
        callbackUrl: validatedData.callbackUrl,
        status: 'pending', // New applications require approval
        appType: validatedData.appType || 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json({
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to create application' 
    });
  }
});

/**
 * Get all applications for current developer
 * GET /api/developer/applications
 */
router.get('/applications', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get developer account for current user
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Get all applications for this developer
    const applications = await db.select()
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerAccount[0].id));
    
    res.json({
      data: applications
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve applications' 
    });
  }
});

/**
 * Get specific application
 * GET /api/developer/applications/:id
 */
router.get('/applications/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid application ID'
      });
    }
    
    // Get developer account for current user
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Get application
    const application = await db.select()
      .from(apiApplications)
      .where(
        and(
          eq(apiApplications.id, applicationId),
          eq(apiApplications.developerId, developerAccount[0].id)
        )
      )
      .limit(1);
    
    if (application.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Application not found'
      });
    }
    
    res.json({
      data: application[0]
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve application' 
    });
  }
});

/**
 * Update application
 * PATCH /api/developer/applications/:id
 */
router.patch('/applications/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid application ID'
      });
    }
    
    // Get developer account for current user
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.userId, req.user!.id))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Verify application belongs to developer
    const application = await db.select()
      .from(apiApplications)
      .where(
        and(
          eq(apiApplications.id, applicationId),
          eq(apiApplications.developerId, developerAccount[0].id)
        )
      )
      .limit(1);
    
    if (application.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Application not found'
      });
    }
    
    // Validate request body (partial)
    const updateSchema = createApplicationSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    // Update application
    const [updatedApplication] = await db.update(apiApplications)
      .set({
        ...validatedData,
        // Updating name or description requires re-approval
        status: (validatedData.name || validatedData.description) ? 'pending' : application[0].status,
        updatedAt: new Date()
      })
      .where(eq(apiApplications.id, applicationId))
      .returning();
    
    res.json({
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to update application' 
    });
  }
});

export default router;