/**
 * PKL-278651-API-0001-GATEWAY
 * Webhook Routes
 * 
 * Routes for configuring and managing webhooks.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db';
import { apiDeveloperAccounts, apiApplications, apiWebhooks, apiWebhookDeliveryLogs, insertApiWebhookSchema } from '../../../../shared/schema/api-gateway';
import { isAuthenticated } from '../../../auth';
import { prepareApiKey } from '../utils/key-generator';
import crypto from 'crypto';

const router = Router();

// Schema for creating a new webhook
const createWebhookSchema = insertApiWebhookSchema.extend({
  applicationId: z.number().int().positive(),
  url: z.string().url(),
  events: z.array(z.string()).min(1)
});

/**
 * Get all webhooks for current developer
 * GET /api/developer/webhooks
 */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
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
    const applications = await db.select({ id: apiApplications.id })
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerAccount[0].id));
    
    if (applications.length === 0) {
      return res.json({
        data: []
      });
    }
    
    // Get all webhooks for these applications
    const applicationIds = applications.map(app => app.id);
    const webhooks = await db.select({
      id: apiWebhooks.id,
      applicationId: apiWebhooks.applicationId,
      url: apiWebhooks.url,
      events: apiWebhooks.events,
      isActive: apiWebhooks.isActive,
      failureCount: apiWebhooks.failureCount,
      lastFailure: apiWebhooks.lastFailure,
      lastSuccess: apiWebhooks.lastSuccess,
      createdAt: apiWebhooks.createdAt
    })
    .from(apiWebhooks)
    .where(apiWebhooks.applicationId.in(applicationIds));
    
    res.json({
      data: webhooks.map(webhook => ({
        ...webhook,
        events: webhook.events.split(',')
      }))
    });
  } catch (error) {
    console.error('Error getting webhooks:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve webhooks' 
    });
  }
});

/**
 * Create a new webhook
 * POST /api/developer/webhooks
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Transform the events array to a comma-separated string
    if (req.body.events && Array.isArray(req.body.events)) {
      req.body.events = req.body.events.join(',');
    }
    
    // Validate request body
    const validatedData = createWebhookSchema.parse(req.body);
    
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
          eq(apiApplications.id, validatedData.applicationId),
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
    
    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');
    
    // Create webhook
    const [webhook] = await db.insert(apiWebhooks)
      .values({
        applicationId: validatedData.applicationId,
        url: validatedData.url,
        events: typeof validatedData.events === 'string' 
          ? validatedData.events 
          : validatedData.events.join(','),
        isActive: true,
        secret,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({
        id: apiWebhooks.id,
        url: apiWebhooks.url,
        events: apiWebhooks.events,
        isActive: apiWebhooks.isActive,
        createdAt: apiWebhooks.createdAt
      });
    
    // Return the webhook with the secret (only time it's shown)
    res.status(201).json({
      message: 'Webhook created successfully',
      data: {
        ...webhook,
        events: webhook.events.split(','),
        secret // This is the only time the secret will be available
      },
      important: 'Save this webhook secret securely. This is the only time it will be shown.'
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to create webhook' 
    });
  }
});

/**
 * Update a webhook
 * PATCH /api/developer/webhooks/:id
 */
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const webhookId = parseInt(req.params.id);
    
    if (isNaN(webhookId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid webhook ID'
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
    
    // Get all applications for this developer
    const applications = await db.select({ id: apiApplications.id })
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerAccount[0].id));
    
    const applicationIds = applications.map(app => app.id);
    
    // Get the webhook and verify it belongs to one of developer's applications
    const webhook = await db.select()
      .from(apiWebhooks)
      .innerJoin(
        apiApplications,
        and(
          eq(apiWebhooks.applicationId, apiApplications.id),
          apiApplications.id.in(applicationIds)
        )
      )
      .where(eq(apiWebhooks.id, webhookId))
      .limit(1);
    
    if (webhook.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Webhook not found'
      });
    }
    
    // Transform the events array to a comma-separated string
    if (req.body.events && Array.isArray(req.body.events)) {
      req.body.events = req.body.events.join(',');
    }
    
    // Validate request body (partial)
    const updateSchema = insertApiWebhookSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    // Update webhook
    const [updatedWebhook] = await db.update(apiWebhooks)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(apiWebhooks.id, webhookId))
      .returning({
        id: apiWebhooks.id,
        url: apiWebhooks.url,
        events: apiWebhooks.events,
        isActive: apiWebhooks.isActive,
        updatedAt: apiWebhooks.updatedAt
      });
    
    res.json({
      message: 'Webhook updated successfully',
      data: {
        ...updatedWebhook,
        events: updatedWebhook.events.split(',')
      }
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to update webhook' 
    });
  }
});

/**
 * Delete a webhook
 * DELETE /api/developer/webhooks/:id
 */
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const webhookId = parseInt(req.params.id);
    
    if (isNaN(webhookId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid webhook ID'
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
    
    // Get all applications for this developer
    const applications = await db.select({ id: apiApplications.id })
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerAccount[0].id));
    
    const applicationIds = applications.map(app => app.id);
    
    // Get the webhook and verify it belongs to one of developer's applications
    const webhook = await db.select()
      .from(apiWebhooks)
      .innerJoin(
        apiApplications,
        and(
          eq(apiWebhooks.applicationId, apiApplications.id),
          apiApplications.id.in(applicationIds)
        )
      )
      .where(eq(apiWebhooks.id, webhookId))
      .limit(1);
    
    if (webhook.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Webhook not found'
      });
    }
    
    // Delete webhook
    await db.delete(apiWebhooks)
      .where(eq(apiWebhooks.id, webhookId));
    
    res.json({
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to delete webhook' 
    });
  }
});

/**
 * Get webhook delivery logs
 * GET /api/developer/webhooks/:id/deliveries
 */
router.get('/:id/deliveries', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const webhookId = parseInt(req.params.id);
    
    if (isNaN(webhookId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid webhook ID'
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
    
    // Get all applications for this developer
    const applications = await db.select({ id: apiApplications.id })
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerAccount[0].id));
    
    const applicationIds = applications.map(app => app.id);
    
    // Get the webhook and verify it belongs to one of developer's applications
    const webhook = await db.select()
      .from(apiWebhooks)
      .innerJoin(
        apiApplications,
        and(
          eq(apiWebhooks.applicationId, apiApplications.id),
          apiApplications.id.in(applicationIds)
        )
      )
      .where(eq(apiWebhooks.id, webhookId))
      .limit(1);
    
    if (webhook.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Webhook not found'
      });
    }
    
    // Get delivery logs
    const deliveryLogs = await db.select()
      .from(apiWebhookDeliveryLogs)
      .where(eq(apiWebhookDeliveryLogs.webhookId, webhookId))
      .orderBy(apiWebhookDeliveryLogs.deliveredAt, 'desc')
      .limit(50); // Limit to 50 most recent logs
    
    res.json({
      data: deliveryLogs
    });
  } catch (error) {
    console.error('Error getting webhook deliveries:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve webhook deliveries' 
    });
  }
});

export default router;