/**
 * PKL-278651-API-0001-GATEWAY
 * API Key Management Routes
 * 
 * Routes for API key generation, listing, and revocation.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db';
import { apiDeveloperAccounts, apiApplications, apiKeys } from '../../../../shared/schema/api-gateway';
import { isAuthenticated } from '../../../middleware/auth';
import { prepareApiKey, isValidKeyFormat } from '../utils/key-generator';

const router = Router();

// Schema for creating a new API key
const createApiKeySchema = z.object({
  applicationId: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(z.string()).min(1),
  expiresAt: z.string().datetime().optional(),
  isTest: z.boolean().optional().default(false)
});

// Schema for revoking an API key
const revokeApiKeySchema = z.object({
  keyId: z.number().int().positive()
});

/**
 * Get all API keys for current developer
 * GET /api/developer/keys
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
    
    // Get all keys for these applications
    const applicationIds = applications.map(app => app.id);
    const keys = await db.select({
      id: apiKeys.id,
      applicationId: apiKeys.applicationId,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      isActive: apiKeys.isActive,
      expiresAt: apiKeys.expiresAt,
      lastUsed: apiKeys.lastUsed,
      scopes: apiKeys.scopes,
      createdAt: apiKeys.createdAt
    })
    .from(apiKeys)
    .where(apiKeys.applicationId.in(applicationIds));
    
    res.json({
      data: keys.map(key => ({
        ...key,
        scopes: key.scopes.split(',')
      }))
    });
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve API keys' 
    });
  }
});

/**
 * Create a new API key
 * POST /api/developer/keys
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createApiKeySchema.parse(req.body);
    
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
    
    // Check if application is approved
    if (application[0].status !== 'approved') {
      return res.status(403).json({
        error: 'application_not_approved',
        message: 'API keys can only be created for approved applications'
      });
    }
    
    // Generate API key
    const { fullKey, keyPrefix, keyHash } = await prepareApiKey(validatedData.isTest);
    
    // Store API key
    const [apiKey] = await db.insert(apiKeys)
      .values({
        applicationId: validatedData.applicationId,
        keyPrefix,
        keyHash,
        name: validatedData.name || 'API Key',
        isActive: true,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
        scopes: validatedData.scopes.join(','),
        createdAt: new Date(),
        createdByIp: req.ip
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        createdAt: apiKeys.createdAt
      });
    
    // Return the full key only once
    res.status(201).json({
      message: 'API key created successfully',
      data: {
        ...apiKey,
        key: fullKey, // This is the only time the full key will be available
        scopes: apiKey.scopes.split(',')
      },
      important: 'Save this API key securely. This is the only time the full key will be shown.'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to create API key' 
    });
  }
});

/**
 * Revoke an API key
 * DELETE /api/developer/keys/:id
 */
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid API key ID'
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
    
    // Get the key and verify it belongs to one of developer's applications
    const key = await db.select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, keyId),
          apiKeys.applicationId.in(applicationIds)
        )
      )
      .limit(1);
    
    if (key.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'API key not found'
      });
    }
    
    // Revoke the key (don't delete, just deactivate)
    await db.update(apiKeys)
      .set({ 
        isActive: false,
      })
      .where(eq(apiKeys.id, keyId));
    
    res.json({
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to revoke API key' 
    });
  }
});

/**
 * Get API key usage statistics
 * GET /api/developer/keys/:id/usage
 */
router.get('/:id/usage', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid API key ID'
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
    
    // Get the key and verify it belongs to one of developer's applications
    const key = await db.select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, keyId),
          apiKeys.applicationId.in(applicationIds)
        )
      )
      .limit(1);
    
    if (key.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'API key not found'
      });
    }
    
    // Get usage statistics from log table
    // This is simplified - in a real implementation you would include time-based filters
    // and calculate more comprehensive statistics
    const usageStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_requests,
        AVG(processing_time) as avg_processing_time,
        MAX(timestamp) as last_used,
        COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests
      FROM api_usage_logs
      WHERE key_id = ${keyId}
    `);
    
    // Get most frequently used endpoints
    const topEndpoints = await db.execute(sql`
      SELECT 
        endpoint, 
        method,
        COUNT(*) as request_count
      FROM api_usage_logs
      WHERE key_id = ${keyId}
      GROUP BY endpoint, method
      ORDER BY request_count DESC
      LIMIT 5
    `);
    
    res.json({
      data: {
        keyInfo: {
          id: key[0].id,
          name: key[0].name,
          prefix: key[0].keyPrefix,
          isActive: key[0].isActive,
          createdAt: key[0].createdAt,
        },
        stats: usageStats[0] || {
          total_requests: 0,
          avg_processing_time: 0,
          last_used: null,
          successful_requests: 0,
          failed_requests: 0
        },
        topEndpoints: topEndpoints || []
      }
    });
  } catch (error) {
    console.error('Error getting API key usage:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve API key usage statistics' 
    });
  }
});

export default router;